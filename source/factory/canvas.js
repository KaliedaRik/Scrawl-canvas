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


// #### Demos:
// + All canvas and packets demos, and a few of the stack demos, include Canvas wrapper functionality - most of which happens behind the scenes and does not need to be directly coded. 
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility
// + [DOM-011](../../demo/dom-011.html) - Canvas controller `fit` attribute; Cell positioning (mouse)
// + [DOM-012](../../demo/dom-012.html) - Add and remove (kill) Scrawl-canvas canvas elements programmatically


// #### Imports
import { canvas as libCanvas, cell, constructors, artefact, group, purge } from '../core/library.js';
import { domShow, scrawlCanvasHold } from '../core/document.js';
import { rootElements, setRootElementsSort } from "../core/document-rootElements.js";
import { mergeOver, pushUnique, removeItem, xt, λthis, λnull, Ωempty } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeState } from './state.js';
import { makeCell } from './cell.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import domMix from '../mixin/dom.js';
import displayMix from '../mixin/displayShape.js';


// #### Canvas constructor
const Canvas = function (items = Ωempty) {

    let g, el;

    this.makeName(items.name);
    this.register();
    this.initializePositions();

    this.dimensions[0] = 300;
    this.dimensions[1] = 150;

    this.pathCorners = [];
    this.css = {};
    this.here = {};
    this.perspective = {

        x: '50%',
        y: '50%',
        z: 0
    };
    this.dirtyPerspective = true;

    this.initializeDomLayout(items);

    this.set(this.defs);

    if (!items.label) items.label = `${this.name} canvas element`;

    this.initializeDisplayShapeActions();

    this.initializeAccessibility();

    this.set(items);

    this.cleanDimensions();

    el = this.domElement;

    if (!el) this.cleanDimensions();
    else {

        this.engine = this.domElement.getContext('2d');

        this.state = makeState({
            engine: this.engine
        });

        // set up additional cells array
        this.cells = [];
        this.cellBatchesClear = [];
        this.cellBatchesCompile = [];
        this.cellBatchesShow = [];

        let baseWidth = this.currentDimensions[0],
            baseHeight = this.currentDimensions[1];

        const ds = el.dataset;

        if (ds.isResponsive) {

            el.style.width = '100%';
            el.style.height = '100%';

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

            this.cleanDimensions();
        }

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
        };

        if (ds.baseClearAlpha) cellArgs.clearAlpha = parseFloat(ds.baseClearAlpha);
        if (ds.baseBackgroundColor) cellArgs.backgroundColor = ds.baseBackgroundColor;

        this.base = this.buildCell(cellArgs);

        // even if it is a child of a stack element, it needs to be recorded as a 'rootElement'
        pushUnique(rootElements, this.name);
        setRootElementsSort();

        // ##### Accessibility
        // if (!el.getAttribute('role')) el.setAttribute('role', 'img');

        const navigation = document.createElement('nav');
        navigation.id = `${this.name}-navigation`;
        navigation.style.width = '0px';
        navigation.style.height = '0px';
        navigation.style.maxWidth = '0px';
        navigation.style.maxHeight = '0px';
        navigation.style.border = '0px';
        navigation.style.padding = '0px';
        navigation.style.margin = '0px';
        navigation.style.overflow = 'hidden';
        this.navigation = navigation;
        el.appendChild(navigation);

        const textHold = document.createElement('div');
        textHold.id = `${this.name}-text-hold`;
        textHold.style.width = '0px';
        textHold.style.height = '0px';
        textHold.style.maxWidth = '0px';
        textHold.style.maxHeight = '0px';
        textHold.style.border = '0px';
        textHold.style.padding = '0px';
        textHold.style.margin = '0px';
        textHold.style.overflow = 'hidden';
        this.textHold = textHold;
        el.appendChild(textHold);

        const ariaLabel = document.createElement('div');
        ariaLabel.id = `${this.name}-ARIA-label`;
        ariaLabel.textContent = this.label;
        this.ariaLabelElement = ariaLabel;
        scrawlCanvasHold.appendChild(ariaLabel);
        el.setAttribute('aria-labelledby', ariaLabel.id);
        el.setAttribute('aria-live', 'polite');

        const ariaDescription = document.createElement('div');
        ariaDescription.id = `${this.name}-ARIA-description`;
        ariaDescription.textContent = this.description;
        this.ariaDescriptionElement = ariaDescription;
        scrawlCanvasHold.appendChild(ariaDescription);
        el.setAttribute('aria-describedby', ariaDescription.id);
        el.setAttribute('aria-live', 'polite');

        this.cleanAria();
    }

    this.dirtyCells = true;
    this.apply();

    this.dirtyDomDimensions = true;
    if (items.setAsCurrentCanvas) this.setAsCurrentCanvas();

    return this;
};


// #### Canvas prototype
let P = Canvas.prototype = Object.create(Object.prototype);
P.type = 'Canvas';
P.lib = 'canvas';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [dom](../mixin/dom.html)
// + [display](../mixin/displayShape.html)
P = baseMix(P);
P = domMix(P);
P = displayMix(P);


// #### Canvas attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [dom mixin](../mixin/dom.html): __domElement, pitch, yaw, offsetZ, css, classes, position, actionResize, trackHere, domAttributes__.
// + Attributes defined in the [display mixin](../mixin/displayShape.html): __breakToBanner, breakToLandscape, breakToPortrait, breakToSkyscraper, actionBannerShape, actionLandscapeShape, actionRectangleShape, actionPortraitShape, actionSkyscraperShape__.
let defaultAttributes = {

// __position__ - the CSS position value for the &lt;canvas> element. This value will be set to `absolute` when the element is an artefact associated with a Stack; `relative` in other cases.
    position: 'relative',


// __trackHere__
    trackHere: 'subscribe',

// __fit__ - String indicating how the base Cell should copy its contents over to the &lt;canvas> element as the final step in the Display cycle. Accepted values are: `fill`, `contain`, `cover`, `none` (but not `scale-down`).
// 
// The aim of this functionality is to replicate the CSS `object-fit` property - [detailed here](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) - for &lt;canvas> elements. We apply the fit attribute to the Canvas wrapper, not the element itself or its parent element.
    fit: 'none',

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
// Beyond the Canvas object, Scrawl-canvas also encourages Phrase entitys (which handle graphical text in the canvas display) to expose their content to the DOM, to make it accessible. Also, any artefact given an Anchor link will expose the Anchor's &lt;a> element in the DOM, which allows the canvas display to become part of the document's navigation (for example, by keyboard tabbing).
    title: '',
    label: '',
    description: '',

    role: 'img',
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

    let name = this.name,
        host = this.host,
        h, g;

    // rootElements and uiSubscribedElements arrays
    removeItem(rootElements, name);
    setRootElementsSort();

    removeItem(uiSubscribedElements, name);

    // Host and host Group
    if (host && host !== 'root') {

        h = (this.currentHost) ? this.currentHost : artefact[host];

        if (h) {

            h.removeGroups(name);

            g = group[h.name];
            if (g) g.removeArtefacts(name);
        }
    }

    // Canvas Group
    if (group[name]) group[name].kill();

    // Base Cell
    this.base.kill();

    // DOM removals
    this.navigation.remove();
    this.textHold.remove();
    this.ariaLabelElement.remove();
    this.ariaDescriptionElement.remove();
    this.domElement.remove();
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// `fit`
P.fitDefaults = ['fill', 'contain', 'cover'];
S.fit = function (item) {

    this.fit = (this.fitDefaults.indexOf(item) >= 0) ? item : 'none';
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

    let items = {};

    if (this.base.dirtyScale) items.dirtyScale = true;
    if (this.base.dirtyDimensions) items.dirtyDimensions = true;
    if (this.base.dirtyLock) items.dirtyLock = true;
    if (this.base.dirtyStart) items.dirtyStart = true;
    if (this.base.dirtyOffset) items.dirtyOffset = true;
    if (this.base.dirtyHandle) items.dirtyHandle = true;
    if (this.base.dirtyRotation) items.dirtyRotation = true;

    this.cleanCells();
    this.base.prepareStamp();

    this.updateCells(items);
};

// `updateCells` - internal function. Iterate through all Cells registered in the wrapper's __cells__ Array and set a range of dirty flags on them, for future processing by each Cell.
P.updateCells = function (items = Ωempty) {

    const c = this.cells;
    for (let i = 0, iz = c.length, mycell; i < iz; i++) {

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

    let host = items.host || false;

    if (!host) items.host = this.base.name;

    let mycell = makeCell(items);
    
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

    item = (item.substring) ? item : item.name || false;

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
            // this.domShowRequired = true;
        }
    }
    return this;
};

// `removeCell` - remove a Cell object from the wrapper's cells Array; argument can be the Cell's name-String, or the Cell object itself
P.removeCell = function (item) {

    item = (item.substring) ? item : item.name || false;

    if (item) {

        removeItem(this.cells, item);
        this.dirtyCells = true;
        // this.domShowRequired = true;
    }
    return this;
};


// `killCell` - invoke a Cell object's __kill__ function; argument can be the Cell's name-String, or the Cell object itself
P.killCell = function (item) {

    let mycell = (item.substring) ? cell[item] : item;

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

    let tempClear = [],
        tempCompile = [],
        tempShow = [],
        cells = this.cells,
        order;

    for (let i = 0, iz = cells.length, mycell; i < iz; i++) {

        mycell = cell[cells[i]];

        if (mycell) {

            if (mycell.cleared) tempClear.push(mycell);

            if (mycell.compiled) {

                order = mycell.compileOrder;

                if (!tempCompile[order]) tempCompile[order] = [];

                tempCompile[order].push(mycell);
            }

            if (mycell.shown) {

                order = mycell.showOrder;

                if (!tempShow[order]) tempShow[order] = [];
                tempShow[order].push(mycell);
            }
        }
    };

    this.cellBatchesClear = [].concat(tempClear);
    this.cellBatchesCompile = tempCompile.reduce((a, v) => a.concat(v), []);
    this.cellBatchesShow = tempShow.reduce((a, v) => a.concat(v), []);
};


// ##### Handling DOM events
// `cascadeEventAction` - The Canvas wrapper's &lt;canvas> element is part of the DOM, thus it is able to participate in all normal DOM events. We use the cascadeEventAction function to tell the wrapper which of the events it receives should be cascaded down to its constituent Cell objects and, in turn, their Groups' artefacts. 
//
// This allows us to 'regionalize' various parts of the &lt;canvas> element so that they respond in a similar way to an HTML __image map__ (defined using &lt;map> and &lt;area> elements) 
// + Cascaded events are limited to mouse and touch events, which Scrawl-canvas bundles together into 5 types of event: `down`, `up` (which also captures click events), `enter`, `leave`, `move`.
// + Returns an Array of name Strings for the entitys at the current mouse cursor coordinates; the Array is also accessible from the Canvas wrapper's `currentActiveEntityNames` attribute.
P.cascadeEventAction = function (action, e = {}) {

    if (!this.currentActiveEntityNames) this.currentActiveEntityNames = [];

    let currentActiveEntityNames = this.currentActiveEntityNames,
        testActiveEntityObjects = [],
        testActiveEntityNames = [],
        newActiveEntityObjects = [],
        newActiveEntityNames = [],
        knownActiveEntityObjects = [],
        knownActiveEntityNames = [],
        i, iz, myCell, item, name, myArt;

    // 1. Find all entitys currently colliding with the mouse/touch coordinate over the canvas
    const c = this.cells;
    for (i = 0, iz = c.length; i < iz; i++) {

        myCell = cell[c[i]];

        if (myCell && (myCell.shown || myCell.isBase || myCell.includeInCascadeEventActions)) testActiveEntityObjects.push(myCell.getEntityHits());
    };

    testActiveEntityObjects = testActiveEntityObjects.reduce((a, v) => a.concat(v), []);

    // 2. Process the returned test results
    for (i = 0, iz = testActiveEntityObjects.length; i < iz; i++) {

        item = testActiveEntityObjects[i];
        name = item.name;

        if (testActiveEntityNames.indexOf(name) < 0) {

            testActiveEntityNames.push(name);

            if (currentActiveEntityNames.indexOf(name) < 0) {

                newActiveEntityObjects.push(item);
                newActiveEntityNames.push(name);
            }
            else {

                knownActiveEntityObjects.push(item);
                knownActiveEntityNames.push(name);
            }
        }
    }

    let currentActiveEntityObjects = newActiveEntityObjects.concat(knownActiveEntityObjects);

    // 3. Trigger the required action on each affected entity
    let doLeave = function (e) {

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

        case 'down' :
            for (i = 0; i < currentActiveLen; i++) {
                currentActiveEntityObjects[i].onDown(e);
            }
            break;

        case 'up' :
            for (i = 0; i < currentActiveLen; i++) {
                currentActiveEntityObjects[i].onUp(e);
            }
            break;

        case 'enter' :
            for (i = 0; i < newActiveLen; i++) {
                newActiveEntityObjects[i].onEnter(e);
            }
            break;

        case 'leave' :
            doLeave(e);
            break;

        case 'move' :
            doLeave(e);
            for (i = 0; i < newActiveLen; i++) {
                newActiveEntityObjects[i].onEnter(e);
            }
            break;
    }

    // 4. Cleanup and return
    this.currentActiveEntityNames = newActiveEntityNames.concat(knownActiveEntityNames);

    return this.currentActiveEntityNames;
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
    this.domElement.setAttribute('title', this.title);
    this.domElement.setAttribute('role', this.role);
    this.ariaLabelElement.textContent = this.label;
    this.ariaDescriptionElement.textContent = this.description;
}


// #### Factory
export const makeCanvas = function (items) {

    if (!items) return false;
    return new Canvas(items);
};

constructors.Canvas = Canvas;


// #### Canvas discovery
// `Exported function` (to modules). Parse the DOM, looking for &lt;canvas> elements; then create __Canvas__ artefact and __Cell__ asset wrappers for each canvas found. Canvas elements do not need to be part of a stack and can appear anywhere in the HTML body.
export const getCanvases = function (query = '[data-scrawl-canvas]') {

    let item;

    document.querySelectorAll(query).forEach((el, index) => {

        item = addInitialCanvasElement(el);

        if (!index) setCurrentCanvas(item);
    });
};

// Create a __canvas__ artefact wrapper for a given canvas element.
const addInitialCanvasElement = function (el) {

    let mygroup = el.getAttribute('data-scrawl-group'),
        myname = el.id || el.getAttribute('name'),
        position = 'absolute';

    if (!mygroup) {

        el.setAttribute('data-scrawl-group', 'root');
        mygroup = 'root';
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
        setInitialDimensions: true
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
export let currentCanvas = null;
export let currentGroup = null;

// `Exported function` (to modules and scrawl object). 
export const setCurrentCanvas = function (item) {

    let changeFlag = false;

    if (item) {

        if (item.substring) {

            let mycanvas = libCanvas[item];

            if (mycanvas) {
                currentCanvas = mycanvas;
                changeFlag = true;    
            }
        }
        else if (item.type === 'Canvas') {

            currentCanvas = item;    
            changeFlag = true;    
        } 
    }

    if (changeFlag && currentCanvas.base) {

        let mygroup = group[currentCanvas.base.name];

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

    let el = document.createElement('canvas'),
        myname = (items.name) ? items.name : generateUniqueString(),
        host = items.host,
        mygroup = 'root',
        width = items.width || 300,
        height = items.height || 150,
        position = 'relative';

    if (host.substring) {

        let temphost = artefact[host];

        if (!temphost && host) {

            host = document.querySelector(host);

            if (host) mygroup = host.id;
        }
        else host = temphost;
    }

    if (host) {

        if (host.type === 'Stack') {

            mygroup = host.name;
            position = 'absolute';
            host = host.domElement;
        }
        else if (!isa_dom(host)) host = document.body;
    }
    else host = document.body;

    el.id = myname;
    el.setAttribute('data-scrawl-group', mygroup);
    el.width = width;
    el.height = height;
    el.style.position = position;

    host.appendChild(el);

    let mycanvas = makeCanvas({
        name: myname,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: false,
        setAsCurrentCanvas: (xt(items.setAsCurrentCanvas)) ? items.setAsCurrentCanvas : true,
        trackHere: (xt(items.trackHere)) ? items.trackHere : 'subscribe',
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
