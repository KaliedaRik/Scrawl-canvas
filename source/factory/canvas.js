// # Canvas factory
// Scrawl-canvas mediates between its system and &lt;canvas> elements in the DOM using Canvas wrapper objects. The wrapper includes a handle to the visible element, but most work is done on a second &lt;canvas> element - the __base Cell__ - which is not part of the DOM, thus excluded from a browser's Document interface (including events).
//
// The Canvas factory is not used directly; the factory is not exported as part of the [scrawl object](../scrawl.html) during Scrawl-canvas initialization. Instead, wrappers can be created for DOM-based &lt;canvas> elements using the following scrawl functions:
// + `scrawl.getCanvas` - locates a &lt;canvas> element in the DOM and creates a wrapper for it.
// + `scrawl.addCanvas` - generates a new &lt;canvas> element, creates a wrapper for it, then adds it to the DOM.
//
// During initialization Scrawl-canvas will search the DOM tree and automatically create Canvas wrappers for all the &lt;canvas> elements it discovers. The first &lt;canvas> element discovered becomes the __current canvas__; all entitys created without a specified `group` attribute will be assigned to that element's wrapper's base Cell's Group object. We can change the current canvas by invoking the `scrawl.setCurrentCanvas` function.
//
// A canvas wrapper can include more than one Cell object. It will always include a base Cell object; additional Cells can be treated as ___cell layers___ and/or normal artefacts contributing to the final display.
//
// During their creation, Canvas wrappers will directly modify the DOM, adding &lt;div> and &lt;nav> elements to it. These new elements are used as _holds_ where the Canvas will store data and text, mainly to expose &lt;a> links and &lt;p> blocks which expose scene details to assistive technologies (accessibility). These additional elements have zero dimensions and should not affect the layout or painting of the rest of the web page.
//
// Canvas wrapper objects use the __base__, __position__, __dom__ and __anchor__ mixins. Thus Canvas wrappers are also __artefact__ objects: if a &lt;canvas> element is a direct child of a Stack wrapper's element then it can be positioned, dimensioned and rotated like any other artefact.
//
// By default, all Canvas wrappers will track mouse/touch movements across their &lt;canvas> elements, supplying this data to constituent Cell objects and artefacts as-and-when-required.
//
// Canvas wrappers are used by Scrawl-canvas to invoke the __Display cycle cascade__. As such, they include `clear`, `compile`, `show` and `render` functions to manage the Display cycle. These functions are asynchronous, returning Promises.
//
// Canvas wrappers are excluded from the Scrawl-canvas packet system; they cannot be saved or cloned. Killing a Canvas wrapper will remove its &lt;canvas> element from the DOM, alongside the additional elements added to the DOM during Canvas creation.


// #### Imports
import {
    canvas as libCanvas,
    cell,
    constructors,
    artefact,
    group,
    purge,
} from '../core/library.js';

import { domShow } from '../core/document.js';

import { rootElementsAdd, rootElementsRemove } from "../helper/document-root-elements.js";

import { doCreate, generateUniqueString, isa_dom, mergeOver, pushUnique, removeItem, xt, λnull, λthis, Ωempty } from '../helper/utilities.js';

import { uiSubscribedElements, currentCorePosition } from '../core/user-interaction.js';

import { makeState } from '../untracked-factory/state.js';
import { makeCell } from './cell.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import domMix from '../mixin/dom.js';
import displayMix from '../mixin/display-shape.js';

import { _2D, _computed, ABSOLUTE, ARIA_BUSY, ARIA_DESCRIBEDBY, ARIA_HIDDEN, ARIA_LABELLEDBY, ARIA_LIVE, ARIA_LIVE_VALUES, AUTO, BORDER_BOX, CANVAS, CANVAS_QUERY, DATA_TAB_ORDER, DATA_SCRAWL_GROUP, DISPLAY_P3, DIV, DOWN, ENTER, FIT_DEFS, IMG, LEAVE, MOVE, NAME, NAV, NONE, PC100, PC50, POLITE, PX0, RELATIVE, ROLE, ROOT, SRGB, SUBSCRIBE, T_CANVAS, T_STACK, TITLE, TRUE, UP, ZERO_STR } from '../helper/shared-vars.js';


// #### Canvas constructor
const Canvas = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.initializePositions();

    this.dimensions[0] = 300;
    this.dimensions[1] = 150;

    this.pathCorners = [];
    this.css = {};
    this.here = {};
    this.perspective = {

        x: PC50,
        y: PC50,
        z: 0
    };
    this.dirtyPerspective = true;

    this.initializeDomLayout(items);

    this.set(this.defs);

    if (!items.label) items.label = `${this.name} canvas element`;

    // Sets up the canvas shape/size action functions
    this.initializeDisplayShapeActions();

    // Sets up the user preferences action functions
    this.initializeAccessibility();

    this.set(items);

    const el = this.domElement;

    if (el) {

        const ds = el.dataset;

        this.useDisplayP3WhereAvailable = ds.canvasColorSpace === DISPLAY_P3 || items.canvasColorSpace === DISPLAY_P3;
        this.canvasColorSpace = getCanvasColorSpace(this.useDisplayP3WhereAvailable);

        this.engine = this.domElement.getContext(_2D, { colorSpace: this.canvasColorSpace });

        this.state = makeState({
            engine: this.engine
        });

        // set up additional cells array
        this.cells = [];
        this.cellBatchesClear = [];
        this.cellBatchesCompile = [];
        this.cellBatchesShow = [];

        let baseWidth = el.width,
            baseHeight = el.height;

        if (ds.isResponsive) {

            el.style.width = PC100;
            el.style.height = PC100;

            let baseMatches = true;

            if (ds.baseWidth && ds.baseHeight) {

                baseMatches = false;
                baseWidth = parseFloat(ds.baseWidth);
                baseHeight = parseFloat(ds.baseHeight);
            }

            this.set({
                checkForResize: true,
                baseMatchesCanvasDimensions: baseMatches,
                ignoreCanvasCssDimensions: true,
                fit: ds.fit || this.fit,
            });
        }

        this.cleanDimensions();

        // setup base cell
        const cellArgs = {
            name: `${this.name}_base`,
            element: false,
            width: baseWidth,
            height: baseHeight,
            cleared: true,
            compiled: true,
            shown: false,
            isBase: true,
            host: this.name,
            controller: this,
            order: 10,
            canvasColorSpace: this.canvasColorSpace,
        };

        if (ds.baseClearAlpha) cellArgs.clearAlpha = parseFloat(ds.baseClearAlpha);
        if (ds.baseBackgroundColor) cellArgs.backgroundColor = ds.baseBackgroundColor;

        this.base = this.buildCell(cellArgs);

        // even if it is a child of a stack element, it needs to be recorded as a 'rootElement'
        rootElementsAdd(this.name);

        // ##### Accessibility
        // The `title`, `role`, `label` and `description` values can be set by passing the kv pairs to the constructor function, or in a subsequent `set()` invocation. However, it's also possible to set these directly on the HTML &lt;canvas> element, as follows:
        // + &lt;canvas title="some title text">
        // + &lt;canvas role="some role value">
        // + &lt;canvas data-label="some label text">
        // + &lt;canvas data-description="some description text">
        if (el.getAttribute('role')) this.role = el.getAttribute('role');
        if (el.getAttribute('title')) this.title = el.getAttribute('title');
        if (ds.label) this.label = ds.label;
        if (ds.description) this.description = ds.description;

        const navigation = document.createElement(NAV);
        navigation.id = `${this.name}-navigation`;
        navigation.setAttribute(ARIA_LIVE, POLITE);
        navigation.setAttribute(ARIA_BUSY, 'false');
        this.navigation = navigation;
        el.appendChild(navigation);

        this.dirtyNavigationTabOrder = true;

        const textHold = document.createElement(DIV);
        textHold.id = `${this.name}-text-hold`;
        textHold.setAttribute(ARIA_LIVE, POLITE);
        textHold.setAttribute(ARIA_BUSY, 'false');
        this.textHold = textHold;
        el.appendChild(textHold);

        this.dirtyTextTabOrder = true;

        const canvasHold = document.createElement('div');
        canvasHold.id = `${this.name}-canvas-hold`;
        canvasHold.style.display = NONE;
        canvasHold.setAttribute(ARIA_HIDDEN, TRUE);
        this.canvasHold = canvasHold;
        el.appendChild(canvasHold);

        const fontHeightCalculator = document.createElement(DIV);
        fontHeightCalculator.id = `${this.name}-fontHeightCalculator`;
        fontHeightCalculator.style.border = PX0;
        fontHeightCalculator.style.padding = PX0;
        fontHeightCalculator.style.margin = PX0;
        fontHeightCalculator.style.height = AUTO;
        fontHeightCalculator.style.lineHeight = 1;
        fontHeightCalculator.style.boxSizing = BORDER_BOX;
        fontHeightCalculator.innerHTML = '|/}ÁÅþ§¶¿∑ƒ⌈⌊qwertyd0123456789QWERTY';
        fontHeightCalculator.setAttribute(ARIA_HIDDEN, TRUE);
        this.fontHeightCalculator = fontHeightCalculator;
        canvasHold.appendChild(fontHeightCalculator);

        const fontSizeCalculator = document.createElement(DIV);
        fontSizeCalculator.id = `${this.name}-fontSizeCalculator`;
        fontSizeCalculator.setAttribute(ARIA_HIDDEN, TRUE);
        this.fontSizeCalculator = fontSizeCalculator;
        this.fontSizeCalculatorValues = _computed(fontSizeCalculator);
        canvasHold.appendChild(fontSizeCalculator);

        const labelStylesCalculator = document.createElement(DIV);
        labelStylesCalculator.id = `${this.name}-styles`;
        labelStylesCalculator.setAttribute(ARIA_HIDDEN, TRUE);
        this.labelStylesCalculator = labelStylesCalculator;
        this.labelStylesCalculatorValues = _computed(labelStylesCalculator);
        canvasHold.appendChild(labelStylesCalculator);

        const ariaLabel = document.createElement(DIV);
        ariaLabel.id = `${this.name}-ARIA-label`;
        ariaLabel.setAttribute(ARIA_LIVE, POLITE);
        this.ariaLabelElement = ariaLabel;
        el.appendChild(ariaLabel);
        el.setAttribute(ARIA_LABELLEDBY, ariaLabel.id);

        const ariaDescription = document.createElement(DIV);
        ariaDescription.id = `${this.name}-ARIA-description`;
        ariaDescription.setAttribute(ARIA_LIVE, POLITE);
        this.ariaDescriptionElement = ariaDescription;
        el.appendChild(ariaDescription);
        el.setAttribute(ARIA_DESCRIBEDBY, ariaDescription.id);

        this.cleanAria();

        this.computedStyles = _computed(el);
    }

    this.dirtyCells = true;
    this.apply();

    this.dirtyDomDimensions = true;
    if (items.setAsCurrentCanvas) this.setAsCurrentCanvas();

    return this;
};


// #### Canvas prototype
const P = Canvas.prototype = doCreate();
P.type = T_CANVAS;
P.lib = CANVAS;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
domMix(P);
displayMix(P);


// #### Canvas attributes
const defaultAttributes = {

// __position__ - the CSS position value for the &lt;canvas> element. This value will be set to `absolute` when the element is an artefact associated with a Stack; `relative` in other cases.
    position: RELATIVE,


// __trackHere__
    trackHere: SUBSCRIBE,

// __fit__ - String indicating how the base Cell should copy its contents over to the &lt;canvas> element as the final step in the Display cycle. Accepted values are: `fill`, `contain`, `cover`, `none` (but not `scale-down`).
//
// The aim of this functionality is to replicate the CSS `object-fit` property - [detailed here](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) - for &lt;canvas> elements. We apply the fit attribute to the Canvas wrapper, not the element itself or its parent element.
    fit: NONE,

// DEPRECATED (because it is a really bad name) __isComponent__ replaced by __baseMatchesCanvasDimensions__ - set to true if, for example, canvas is being used as part of a Scrawl-canvas snippet.
    isComponent: false,
    baseMatchesCanvasDimensions: false,

// __renderOnResize__ - perform an additional render of the scene following a change in the canvas's dimensions
    renderOnResize: true,

// For ___Device Pixel Ratio___, we need to tell the canvas whether it should ignore resetting the canvas dimensions - if, for instance, we set them to '100%' in CSS - and whether we have set the base to static dimensions (via `setBase`)
// + We only need to worry about this after we invoke `scrawl.setIgnorePixelRatio(false)` in the demo code
//
// __ignoreCanvasCssDimensions__ - skip setting the &lt;canvas> element's CSS width and height when dimensions change. When the flag is set to `false` (default), we need to set the CSS values to a valuepx String which will then allow us to set the canvas drawing dimensions to take into account the display's device pixel ratio value. Set the flag to `true` if the canvas has been initialized as responsive by setting its CSS dimensions values to a value% String.
// + Note that Scrawl-canvas ignores any attempt to set CSS dimension (width, height) values in the `css` attribute of the `set({})` function.
    ignoreCanvasCssDimensions: false,

// ##### Accessibility attributes
// &lt;canvas> elements are __raster images__ - they contain no information within their content (beyond pixel data) which can be analyzed or passed on to the browser or other device. The element _can_ include `title` and various `item` attributes (alongside custom `data-` attributes) but inclusion of these depends entirely on the developer remembering to include them when coding up a web page.
//
// Scrawl-canvas attempts to automate _some_ (but not _all_) accessibility work through inclusion of the following Canvas attributes (specifically, Scrawl-canvas implements [ARIA attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)):
// + __title__ - this attribute is applied to the &lt;canvas> element's 'title' attribute, and will appear as a tooltip when the user hovers over the canvas
// + __label__ and __description__ - these attributes are applied to (offscreen) div elements which are referenced by the &lt;canvas> element using `aria-labelledby` and `aria-describedby` attributes
// + __role__ - in most situations the &lt;canvas> element's ARIA role attribute should be left as `img` (the default value). However if the canvas contains a complex interactive GUI - for instance, a spreadsheet - then the role should be updated accordingly, for instance to `application`
//
// If no label value is supplied to the Canvas factory (as part of the function's argument object), then Scrawl-canvas will auto-generate a label based on the canvas's name. All three attributes can be updated dynamically using the usual `set()` functionality.
//
// Beyond the Canvas object, Scrawl-canvas also encourages text-based entitys (Label, EnhancedLabel) to expose their content to the DOM, to make it accessible. Also, any artefact given an Anchor link will expose the Anchor's &lt;a> element in the DOM, which allows the canvas display to become part of the document's navigation (for example, by keyboard tabbing).
    title: ZERO_STR,
    label: ZERO_STR,
    description: ZERO_STR,

    role: IMG,

// __navigationAriaLive__ - the ARIA-live attribute applied to the &lt;nav> element added to the &lt;canvas> element. Accepted string values are: 'off', 'polite' (default), 'assertive'.
    navigationAriaLive: POLITE,

// __textAriaLive__ - the ARIA-live attribute applied to the text hold's &lt;div> element added to the &lt;canvas> element. Accepted string values are: 'off', 'polite' (default), 'assertive'.
    textAriaLive: POLITE,

// #### Canvas Color space
// Canvas elements can now use different color spaces - [see MDN for details](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#colorspace). Permitted values are: `'srgb'`` (default); `'display-p3'`.
    canvasColorSpace: SRGB,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet/Clone management
// This functionality is disabled for Canvas objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;


// #### Kill functionality
P.factoryKill = function () {

    const name = this.name,
        host = this.host;

    // rootElements and uiSubscribedElements arrays
    rootElementsRemove(name);

    removeItem(uiSubscribedElements, name);

    // Host and host Group
    if (host && host !== ROOT) {

        const h = (this.currentHost) ? this.currentHost : artefact[host];

        if (h) {

            h.removeGroups(name);

            const g = group[h.name];
            if (g) g.removeArtefacts(name);
        }
    }

    // Canvas Group
    if (group[name]) group[name].kill();

    // Base Cell
    this.base.kill();

    // DOM removals
    this.domElement.remove();
};


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// `fit`
S.fit = function (item) {

    this.fit = (FIT_DEFS.includes(item)) ? item : NONE;
};

// `title` - String
S.title = function (item) {

    this.title = item;
    this.dirtyAria = true;
};

// `label` - String
S.label = function (item) {

    this.label = item;
    this.dirtyAria = true;
};

// `description` - String
S.description = function (item) {

    this.description = item;
    this.dirtyAria = true;
};

// `role` - String
S.role = function (item) {

    this.role = item;
    this.dirtyAria = true;
};

// `navigationAriaLive` - String
S.navigationAriaLive = function (item) {

    if (item.substring && ARIA_LIVE_VALUES.includes(item)) {

        this.navigationAriaLive = item;
        this.dirtyAria = true;
    }
};

// `textAriaLive` - String
S.textAriaLive = function (item) {

    if (item.substring && ARIA_LIVE_VALUES.includes(item)) {

        this.textAriaLive = item;
        this.dirtyAria = true;
    }
};

// ##### Get and set base cell attributes
// For convenience, Scrawl-canvas allows us to get/set a limited number of base Cell attributes via their Canvas wrapper's `get`, `set` and `deltaSet` functions. We can set and deltaSet other base Cell attributes by invoking the `mycanvas.setBase` and `mycanvas.deltaSetBase` functions.

// `backgroundColor` - String. We can set the base Cell's background color to any CSS color String value
G.backgroundColor = function () {

    return this.base.backgroundColor;
};
S.backgroundColor = function (item) {

    if (this.base) {

        this.base.set({
            backgroundColor: item
        });
    }
};

// `alpha` - float Number between 0.0 and 1.0. When the base Cell stamps itself onto the Canvas wrapper's &lt;canvas> element, it can set the element's engine to a `globalAlpha` value stored in the Cell's alpha attribute.
G.alpha = function () {

    return this.base.alpha;
};
S.alpha = function (item) {

    if (this.base) {

        this.base.set({
            alpha: item
        });
    }
};
D.alpha = function(item) {

    if (this.base) {

        this.base.deltaSet({
            alpha: item
        });
    }
};

// `composite` - String. When the base Cell stamps itself onto the Canvas wrapper's &lt;canvas> element, it can set the element's engine to a `globalCompositeOperation` value stored in the Cell's composite attribute.
G.composite = function () {

    return this.base.composite;
};
S.composite = function (item) {

    if (this.base) {
        this.base.set({
            composite: item
        });
    }
};

// `checkForEntityHover`, `onEntityHover`, `onEntityNoHover` - these are group-specific attributes which we can set on the base Cell's named group via the Canvas wrapper
S.checkForEntityHover = function (item) {

    this.base.set({
        checkForEntityHover: item,
    });
};
S.onEntityHover = function (item) {

    this.base.set({
        onEntityHover: item,
    });
};
S.onEntityNoHover = function (item) {

    this.base.set({
        onEntityNoHover: item,
    });
};

// `baseGroup` - get the Canvas wrapper's base Cell's named group
G.baseGroup = function () {

    return group[this.base.name];
};

// `baseName` - get the Canvas wrapper's base Cell's name
G.baseName = function () {

    return this.base.name;
};


// #### Prototype functions

// `setAsCurrentCanvas` - invoke function (without arguments) to make this Canvas wrapper the __current canvas__ for future entity generation operations. This is additional to the `scrawl.setCurrentCanvas` function.
P.setAsCurrentCanvas = function () {

    if (this.base) setCurrentCanvas(this);
    return this;
};

// `setBase` - pass the argument object through to the base Cell's `set` function.
P.setBase = function (items) {

    if (this.base) {

        this.base.set(items);
        this.setBaseHelper();
    }
    return this;
};

// `deltaSetBase` - pass the argument object through to the base Cell's `deltaSet` function.
P.deltaSetBase = function (items) {

    if (this.base) {

        this.base.deltaSet(items);
        this.setBaseHelper();
    }
    return this;
};

// Internal function - passes the Canvas wrapper's current __here__ object and __fit__ attribute to the base Cell for further processing
P.updateBaseHere = function () {

    if (this.base) this.base.updateBaseHere(this.here, this.fit);
};

// Internal helper function
P.setBaseHelper = function () {

    const items = {};

    const base = this.base;

    if (base.dirtyScale) items.dirtyScale = true;
    if (base.dirtyDimensions) items.dirtyDimensions = true;
    if (base.dirtyLock) items.dirtyLock = true;
    if (base.dirtyStart) items.dirtyStart = true;
    if (base.dirtyOffset) items.dirtyOffset = true;
    if (base.dirtyHandle) items.dirtyHandle = true;
    if (base.dirtyRotation) items.dirtyRotation = true;

    this.cleanCells();
    base.prepareStamp();

    this.updateCells(items);
};

// `updateCells` - internal function. Iterate through all Cells registered in the wrapper's __cells__ Array and set a range of dirty flags on them, for future processing by each Cell.
P.updateCells = function (items = Ωempty) {

    const c = this.cells;
    let mycell;

    for (let i = 0, iz = c.length; i < iz; i++) {

        mycell = cell[c[i]];

        if (mycell) {

            if (items.dirtyScale) mycell.dirtyScale = true;
            if (items.dirtyDimensions) mycell.dirtyDimensions = true;
            if (items.dirtyLock) mycell.dirtyLock = true;
            if (items.dirtyStart) mycell.dirtyStart = true;
            if (items.dirtyOffset) mycell.dirtyOffset = true;
            if (items.dirtyHandle) mycell.dirtyHandle = true;
            if (items.dirtyRotation) mycell.dirtyRotation = true;
        }
    }
};

// `buildCell` - create a Cell wrapper (wrapping a &lt;canvas> element not attached to the DOM) and add it to this Canvas wrapper's complement of Cells
P.buildCell = function (items = Ωempty) {

// console.log(this.name, 'buildCell', items)
    const host = items.host || null;

    if (!host) items.host = this.base.name;

    const mycell = makeCell(items);

    this.addCell(mycell);
    this.cleanCells();
    return mycell;
};

// `cleanDimensionsAdditionalActions` - overwrites mixin/position function. Promulgates canvas dimension changes through to all Cells in the wrapper's cells Array.
P.cleanDimensionsAdditionalActions = function () {

    if (this.cells) {

        this.updateCells({
            dirtyDimensions: true,
        });
    }

    this.dirtyDomDimensions = true;
    this.dirtyDisplayShape = true;
    this.dirtyDisplayArea = true;
};

// `addCell` - add a Cell object to the wrapper's cells Array; argument can be the Cell's name-String, or the Cell object itself
P.addCell = function (item) {

    item = (item.substring) ? item : item.name || null;

    if (item) {

        const c = cell[item];

        if (c) {

            if (this.base) {

                c.host = this.base.name;
                c.currentHost = null;
            }
            c.prepareStamp();

            pushUnique(this.cells, item);
            this.dirtyCells = true;
        }
    }
    return this;
};

// `removeCell` - remove a Cell object from the wrapper's cells Array; argument can be the Cell's name-String, or the Cell object itself
P.removeCell = function (item) {

    item = (item.substring) ? item : item.name || null;

    if (item) {

        removeItem(this.cells, item);
        this.dirtyCells = true;
    }
    return this;
};

// `killCell` - invoke a Cell object's __kill__ function; argument can be the Cell's name-String, or the Cell object itself
P.killCell = function (item) {

    const mycell = (item.substring) ? cell[item] : item;

    if (mycell) mycell.kill();

    this.dirtyCells = true;
    return this;
};


// ##### Display cycle functions

// `clear` - For Cell objects in the wrapper's __cells__ (and associated) Arrays:
// + If the Cell object's `cleared` flag is true, invoke the Cell's `clear` function
// + Note that the Display canvas itself does not clearuntil the show stage, to minimize flickering
P.clear = function () {

    if (this.dirtyCells) this.cleanCells();

    // Handle base dimensions - other cells may use it for their relative dimensions
    if (this.base && this.base.dirtyDimensions) this.base.cleanDimensions();

    const c = this.cellBatchesClear;

    for (let i = 0, iz = c.length; i < iz; i++) {

        c[i].clear();
    }
};

// `compile` - For Cell objects in the wrapper's __cells__ (and associated) Arrays:
// + sort Cell objects depending on their `compileOrder` attribute - Cells with lower order values will be processed first
// + if the Cell object's `compiled` flag is true, invoke the Cell's `compile` function
P.compile = function () {

    // Handle constituent cells
    if (this.dirtyCells) this.cleanCells();

    // Handle base dimensions - other cells may use it for their relative dimensions
    if (this.base && this.base.dirtyDimensions) this.base.cleanDimensions();

    const c = this.cellBatchesCompile;

    for (let i = 0, iz = c.length; i < iz; i++) {

        c[i].compile();
    }

    // Handle display canvas
    this.prepareStamp();
    this.stamp();
};

// `show` - For Cell objects in the wrapper's __cells__ (and associated) Arrays:
// + sort Cell objects depending on their `showOrder` attribute - Cells with lower order values will be processed first
// + if the Cell object's `shown` flag is true, invoke the Cell's `show` function
//
// And then:
// + copy the base Cells display over to the Canvas wrapper's &lt;canvas> element
// + update ARIA and other associated metadata
P.show = function(){

    // Handle constituent cells
    if (this.dirtyCells) this.cleanCells();

    // Handle base dimensions - other cells may use it for their relative dimensions
    if (this.base && this.base.dirtyDimensions) this.base.cleanDimensions();

    const c = this.cellBatchesShow;

    for (let i = 0, iz = c.length; i < iz; i++) {

        c[i].show();
    }

    // Get the base cell to stamp itself onto the display canvas
    this.base.show();

    // Handle DOM-related positioning and display requirements, including ARIA updates
    domShow();
    if (this.dirtyAria) this.cleanAria();

    if (this.dirtyNavigationTabOrder) this.reorderNavElements();
    if (this.dirtyTextTabOrder) this.reorderTextElements();
};

// `reorderNavElements` - Handle Anchor and Button DOM element ordering within the &lt;nav> element
P.reorderNavElements = function () {

    this.dirtyNavigationTabOrder = false;

    const elArray = [],
        navEl = this.navigation;

    navEl.setAttribute(ARIA_BUSY, 'true');

    while (navEl.firstChild) {

        elArray.push(navEl.removeChild(navEl.firstChild));
    }

    elArray.sort((a, b) => {

        const A = parseInt(a.getAttribute(DATA_TAB_ORDER), 10);
        const B = parseInt(b.getAttribute(DATA_TAB_ORDER), 10);

        if (A < B) return -1;
        if (A > B) return 1;
        return 0;
    });

    elArray.forEach(e => navEl.appendChild(e));

    navEl.setAttribute(ARIA_BUSY, 'false');
};

// `reorderTextElements` - handle Label and EnhancedLabel ordering within the textHold's &lt;div> element
P.reorderTextElements = function () {

    this.dirtyTextTabOrder = false;

    const elArray = [],
        divEl = this.textHold;

    divEl.setAttribute(ARIA_BUSY, 'true');

    while (divEl.firstChild) {

        elArray.push(divEl.removeChild(divEl.firstChild));
    }

    elArray.sort((a, b) => {

        const A = parseInt(a.getAttribute(DATA_TAB_ORDER), 10);
        const B = parseInt(b.getAttribute(DATA_TAB_ORDER), 10);

        if (A < B) return -1;
        if (A > B) return 1;
        return 0;
    });

    elArray.forEach(e => divEl.appendChild(e));

    divEl.setAttribute(ARIA_BUSY, 'false');
};

// `render` - orchestrate a single Display cycle - clear, then compile, then show.
P.render = function () {

    this.clear();
    this.compile();
    this.show();
};

// `cleanCells` - internal function triggered each time there is an update to the __cells__ Array attribute, or a constituent Cell sets the Canvas wrapper's `dirtyCell` flag.
// + Cell objects include attribute flags - `cleared`, `compiled`, `shown` - which tell their Canvas wrapper whether they should be included in each part of the Display cycle
// + For the compile and show steps, Cell objects also include attributes - `compileOrder`, `showOrder` - indicating the order in which they should be processed (compared to other Cell objects).
// + The sorting algorithm for all three operations is a bucket sort.
// + The results of these operations are deposited in three internal Arrays which are used as part of the Canvas wrapper's clear/compile/show functionality.
//
// We do things this way because there may be situations where a Cell needs to calculate and compile before another cell, but should be shown (applied to) the base Cell after the other Cells (so it appears on top of them).
P.cleanCells = function () {

    this.dirtyCells = false;

    const tempClear = requestArray(),
        tempCompile = requestArray(),
        tempShow = requestArray();

    const { cells, cellBatchesClear, cellBatchesCompile, cellBatchesShow } = this;

    let mycell, order, arr, i, iz;

    for (i = 0, iz = cells.length; i < iz; i++) {

        mycell = cell[cells[i]];

        if (mycell) {

            if (mycell.cleared) tempClear.push(mycell);

            if (mycell.compiled) {

                order = mycell.compileOrder;

                if (!tempCompile[order]) tempCompile[order] = requestArray();

                tempCompile[order].push(mycell);
            }

            if (mycell.shown) {

                order = mycell.showOrder;

                if (!tempShow[order]) tempShow[order] = requestArray();
                tempShow[order].push(mycell);
            }
        }
    }

    cellBatchesClear.length = 0;
    cellBatchesClear.push(...tempClear);
    releaseArray(tempClear);

    cellBatchesCompile.length = 0;
    for (i = 0, iz = tempCompile.length; i < iz; i++) {

        arr = tempCompile[i];

        if (arr) {

            cellBatchesCompile.push(...arr);
            releaseArray(arr);
        }
    }
    releaseArray(tempCompile);

    cellBatchesShow.length = 0;
    for (i = 0, iz = tempShow.length; i < iz; i++) {

        arr = tempShow[i];

        if (arr) {

            cellBatchesShow.push(...arr);
            releaseArray(arr);
        }
    }
    releaseArray(tempShow);
};


// ##### Handling DOM events
// `cascadeEventAction` - The Canvas wrapper's &lt;canvas> element is part of the DOM, thus it is able to participate in all normal DOM events. We use the cascadeEventAction function to tell the wrapper which of the events it receives should be cascaded down to its constituent Cell objects and, in turn, their Groups' artefacts.
//
// This allows us to 'regionalize' various parts of the &lt;canvas> element so that they respond in a similar way to an HTML __image map__ (defined using &lt;map> and &lt;area> elements)
// + Cascaded events are limited to mouse and touch events, which Scrawl-canvas bundles together into 5 types of event: `down`, `up` (which also captures click events), `enter`, `leave`, `move`.
// + Returns an Array of name Strings for the entitys at the current mouse cursor coordinates; the Array is also accessible from the Canvas wrapper's `currentActiveEntityNames` attribute.
P.cascadeEventAction = function (action, e = {}) {

    if (!this.currentActiveEntityNames) this.currentActiveEntityNames = [];

    const currentActiveEntityNames = this.currentActiveEntityNames,
        currentActiveEntityObjects = requestArray(),
        testActiveEntityObjects = requestArray(),
        testActiveEntityNames = requestArray(),
        newActiveEntityObjects = requestArray(),
        newActiveEntityNames = requestArray(),
        knownActiveEntityObjects = requestArray(),
        knownActiveEntityNames = requestArray();

    let i, iz, myCell, item, name, myArt;

    // 1. Find all entitys currently colliding with the mouse/touch coordinate over the canvas
    const c = this.cells;
    for (i = 0, iz = c.length; i < iz; i++) {

        myCell = cell[c[i]];

        if (myCell && (myCell.shown || myCell.isBase || myCell.includeInCascadeEventActions)) testActiveEntityObjects.push(...myCell.getEntityHits());
    }

    // 2. Process the returned test results
    for (i = 0, iz = testActiveEntityObjects.length; i < iz; i++) {

        item = testActiveEntityObjects[i];
        name = item.name;

        if (!testActiveEntityNames.includes(name)) {

            testActiveEntityNames.push(name);

            if (!currentActiveEntityNames.includes(name)) {

                newActiveEntityObjects.push(item);
                newActiveEntityNames.push(name);
            }
            else {

                knownActiveEntityObjects.push(item);
                knownActiveEntityNames.push(name);
            }
        }
    }

    currentActiveEntityObjects.push(...newActiveEntityObjects, ...knownActiveEntityObjects);

    // 3. Trigger the required action on each affected entity
    const doLeave = function (e) {

        if (currentActiveEntityNames.length) {

            for (i = 0, iz = newActiveEntityNames.length; i < iz; i++) {

                removeItem(currentActiveEntityNames, newActiveEntityNames[i]);
            }
            for (i = 0, iz = knownActiveEntityNames.length; i < iz; i++) {

                removeItem(currentActiveEntityNames, knownActiveEntityNames[i]);
            }
            for (i = 0, iz = currentActiveEntityNames.length, myArt; i < iz; i++) {

                myArt = artefact[currentActiveEntityNames[i]];

                if (myArt) myArt.onLeave(e);
            }
        }
    };

    const currentActiveLen = currentActiveEntityObjects.length,
        newActiveLen = newActiveEntityObjects.length;

    switch (action) {

        case DOWN :
            for (i = 0; i < currentActiveLen; i++) {
                currentActiveEntityObjects[i].onDown(e);
            }
            break;

        case UP :
            for (i = 0; i < currentActiveLen; i++) {
                currentActiveEntityObjects[i].onUp(e);
            }
            break;

        case ENTER :
            for (i = 0; i < newActiveLen; i++) {
                newActiveEntityObjects[i].onEnter(e);
            }
            break;

        case LEAVE :
            doLeave(e);
            break;

        case MOVE :
            doLeave(e);
            for (i = 0; i < newActiveLen; i++) {
                newActiveEntityObjects[i].onEnter(e);
            }
            break;
    }

    // 4. Cleanup and return
    currentActiveEntityNames.length = 0;
    currentActiveEntityNames.push(...newActiveEntityNames, ...knownActiveEntityNames);

    releaseArray(currentActiveEntityObjects);
    releaseArray(testActiveEntityObjects);
    releaseArray(testActiveEntityNames);
    releaseArray(newActiveEntityObjects);
    releaseArray(newActiveEntityNames);
    releaseArray(knownActiveEntityObjects);
    releaseArray(knownActiveEntityNames);

    return [].concat(currentActiveEntityNames);
};

// `getEntityHits`, `checkHover` - returns the names of all entitys associated with this canvas that are currently colliding with the mouse cursor; should also trigger any hover actions active on Group objects associated with the Canvas wrapper
P.getEntityHits = function () {

    return this.cascadeEventAction();
};
P.checkHover = function () {

    this.cascadeEventAction();
};

// `cleanAria` - internal function; transfers updated __title__, __label__, __description__ and __role__ attribute values into the relevant DOM elements
P.cleanAria = function () {

    this.dirtyAria = false;
    this.domElement.setAttribute(TITLE, this.title);
    this.domElement.setAttribute(ROLE, this.role);
    this.ariaLabelElement.textContent = this.label;
    this.ariaDescriptionElement.textContent = this.description;
    this.navigation.setAttribute(ARIA_LIVE, this.navigationAriaLive);
    this.textHold.setAttribute(ARIA_LIVE, this.textAriaLive);
};


// #### Factory
export const makeCanvas = function (items) {

    if (!items) return false;
    return new Canvas(items);
};

constructors.Canvas = Canvas;


// #### Canvas discovery
// `Exported function` (to modules). Parse the DOM, looking for &lt;canvas> elements; then create __Canvas__ artefact and __Cell__ asset wrappers for each canvas found. Canvas elements do not need to be part of a stack and can appear anywhere in the HTML body.
export const getCanvases = function (query = CANVAS_QUERY) {

    let item;

    document.querySelectorAll(query).forEach((el, index) => {

        item = addInitialCanvasElement(el);

        if (!index) setCurrentCanvas(item);
    });
};

// Create a __canvas__ artefact wrapper for a given canvas element.
const addInitialCanvasElement = function (el) {

    let mygroup = el.getAttribute(DATA_SCRAWL_GROUP),
        myname = el.id || el.getAttribute(NAME),
        position = ABSOLUTE;

    if (!mygroup || mygroup === ROOT) {

        el.setAttribute(DATA_SCRAWL_GROUP, ROOT);
        mygroup = ROOT;
        position = el.style.position;
    }

    if (!myname) {

        myname = generateUniqueString();
        el.id = myname;
    }

    return makeCanvas({
        name: myname,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: true,
    });
};

// `Exported function` (to modules and scrawl object). Parse the DOM, looking for a specific &lt;canvas> element id; then create a __Canvas__ artefact and __Cell__ asset wrapper for it.
export const getCanvas = function (search) {

    const el = document.querySelector(`#${search}`);

    const c = libCanvas[search];

    if (c) {

        if (el.dataset.scrawlGroup != null) {

            setCurrentCanvas(c);
            return c;
        }
        else purge(search);
    }

    if (el) {
        const newCanvas = addInitialCanvasElement(el);
        setCurrentCanvas(newCanvas);
        return newCanvas;
    }
    return undefined;
};

// Scrawl-canvas expects one canvas element (if any canvases are present) to act as the 'current' canvas on which other factory functions - such as adding new entitys - can act. The current canvas can be changed at any time using __scrawl.setCurrentCanvas__

// `Exported variables` (to modules).
export let currentGroup = null;

// `Exported function` (to modules and scrawl object).
let currentCanvas = null;
export const setCurrentCanvas = function (item) {

    let changeFlag = false;

    if (item) {

        if (item.substring) {

            const mycanvas = libCanvas[item];

            if (mycanvas) {
                currentCanvas = mycanvas;
                changeFlag = true;
            }
        }
        else if (item.type === T_CANVAS) {

            currentCanvas = item;
            changeFlag = true;
        }
    }

    if (changeFlag && currentCanvas.base) {

        const mygroup = group[currentCanvas.base.name];

        if (mygroup) currentGroup = mygroup;
    }
};

// `Exported function` (to modules and scrawl object). Use __addCanvas__ to add a Scrawl-canvas canvas element to a web page. The items argument should include
// + __host__ - the host element, either as the DOM element itself, or some sort of CSS search string, or a Scrawl-canvas Stack entity. If no host is supplied, Scrawl-canvas will add the new canvas element to the DOM document body; in all cases, the new canvas element is appended at the end of the host element (or DOM document)
// + __name__ - String identifier for the element; will generate a random name for the canvas if no name is supplied.
// + any other regular Scrawl-canvas Canvas artefact attribute
//
// By default, Scrawl-canvas will setup the new Canvas as the 'current canvas', and will add mouse/pointer tracking functionality to it. If no dimensions are supplied then the Canvas will default to 300px wide and 150px high.
export const addCanvas = function (items = Ωempty) {

    const el = document.createElement(CANVAS),
        myname = (items.name) ? items.name : generateUniqueString(),
        width = items.width || 300,
        height = items.height || 150;

    let mygroup = ROOT,
        position = RELATIVE,
        host = items.host,
        temphost;

    if (host.substring) {

        temphost = artefact[host];

        if (!temphost && host) {

            host = document.querySelector(host);

            if (host) mygroup = host.id;
        }
        else host = temphost;
    }

    if (host) {

        if (host.type === T_STACK) {

            mygroup = host.name;
            position = ABSOLUTE;
            host = host.domElement;
        }
        else if (!isa_dom(host)) host = document.body;
    }
    else host = document.body;

    el.id = myname;
    el.setAttribute(DATA_SCRAWL_GROUP, mygroup);
    el.width = width;
    el.height = height;
    el.style.position = position;

    host.appendChild(el);

    const mycanvas = makeCanvas({
        name: myname,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: false,
        setAsCurrentCanvas: (xt(items.setAsCurrentCanvas)) ? items.setAsCurrentCanvas : true,
        trackHere: (xt(items.trackHere)) ? items.trackHere : SUBSCRIBE,
    });

    delete items.group;
    delete items.host;
    delete items.name;
    delete items.element;
    delete items.position;
    delete items.setInitialDimensions;
    delete items.setAsCurrentCanvas;
    delete items.trackHere;

    mycanvas.set(items);

    return mycanvas;
};

// Wide gamut colors helper
const getCanvasColorSpace = (useP3) => {

    const { canvasSupportsP3Color, displaySupportsP3Color } = currentCorePosition;
    if (useP3 && canvasSupportsP3Color && displaySupportsP3Color) return DISPLAY_P3;
    return SRGB;
};
