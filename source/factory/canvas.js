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
// + All canvas and component demos, and a few of the stack demos, include Canvas wrapper functionality - most of which happens behind the scenes and does not need to be directly coded. 
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility
// + [DOM-011](../../demo/dom-011.html) - Canvas controller `fit` attribute; Cell positioning (mouse)
// + [DOM-012](../../demo/dom-012.html) - Add and remove (kill) Scrawl-canvas canvas elements programmatically
// + [Component-001](../../demo/component-001.html) - Scrawl-canvas DOM element components


// #### Imports
import { cell, constructors, artefact, group } from '../core/library.js';
import { rootElements, setRootElementsSort, setCurrentCanvas, domShow, scrawlCanvasHold } from '../core/document.js';
import { generateUuid, mergeOver, pushUnique, removeItem, xt, 
    defaultThisReturnFunction, defaultNonReturnFunction } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeState } from './state.js';
import { makeCell } from './cell.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import domMix from '../mixin/dom.js';


// #### Canvas constructor
const Canvas = function (items = {}) {

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

    this.set(items);

    this.cleanDimensions();

    el = this.domElement;

    if (el) {

        if (this.trackHere) pushUnique(uiSubscribedElements, this.name);

        this.engine = this.domElement.getContext('2d');

        this.state = makeState({
            engine: this.engine
        });

        // set up additional cells array
        this.cells = [];
        this.cellBatchesClear = [];
        this.cellBatchesCompile = [];
        this.cellBatchesShow = [];

        // setup base cell
        let cellArgs = {
            name: `${this.name}_base`,
            element: false,
            width: this.currentDimensions[0],
            height: this.currentDimensions[1],
            cleared: true,
            compiled: true,
            shown: false,
            isBase: true,
            localizeHere: true,
            host: this.name,
            controller: this,
            order: 10,
        };
        this.base = this.buildCell(cellArgs);

        // even if it is a child of a stack element, it needs to be recorded as a 'rootElement'
        pushUnique(rootElements, this.name);
        setRootElementsSort();

        // ##### Accessibility
        if (!el.getAttribute('role')) el.setAttribute('role', 'img');

        let navigation = document.createElement('nav');
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
        el.parentNode.insertBefore(navigation, el.nextSibling);

        let textHold = document.createElement('div');
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
        el.parentNode.insertBefore(textHold, el.nextSibling);

        let ariaLabel = document.createElement('div');
        ariaLabel.id = `${this.name}-ARIA-label`;
        ariaLabel.textContent = this.label;
        this.ariaLabelElement = ariaLabel;
        scrawlCanvasHold.appendChild(ariaLabel);
        el.setAttribute('aria-labelledby', ariaLabel.id);

        let ariaDescription = document.createElement('div');
        ariaDescription.id = `${this.name}-ARIA-description`;
        ariaDescription.textContent = this.description;
        this.ariaDescriptionElement = ariaDescription;
        scrawlCanvasHold.appendChild(ariaDescription);
        el.setAttribute('aria-describedby', ariaDescription.id);

        this.cleanAria();
    }

    this.dirtyCells = true;
    this.apply();

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
// + [position](../mixin/position.html)
// + [anchor](../mixin/anchor.html)
// + [dom](../mixin/dom.html)
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = domMix(P);


// #### Canvas attributes
let defaultAttributes = {

// __position__ - the CSS position value for the &lt;canvas> element. This value will be set to `absolute` when the element is an artefact associated with a Stack; `relative` in other cases.
    position: 'relative',


// __trackHere__ - Boolean flag to indicate whether the Canvas object should participate in the Scrawl-canvas mouse/touch tracking functionality; the functionality can be switched off by setting the flag to false (via `set`).
    trackHere: true,

// __fit__ - String indicating how the base Cell should copy its contents over to the &lt;canvas> element as the final step in the Display cycle. Accepted values are: `fill`, `contain`, `cover`, `none` (but not `scale-down`).
// 
// The aim of this functionality is to replicate the CSS `object-fit` property - [detailed here](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) - for &lt;canvas> elements. Unlike the CSS property, we apply the fit attribute to the Canvas wrapper, not the element itself or its parent element.
    fit: 'none',

// __isComponent__ - set to true if canvas is being used as part of a Scrawl-canvas component.
    isComponent: false,

// ##### Accessibility attributes
// &lt;canvas> elements are __raster images__ - they contain no information within their content (beyond pixel data) which can be analyzed or passed on to the browser or other device. The element _can_ include `title` and various `item` attributes (alongside custom `data-` attributes) but inclusion of these depends entirely on the developer remembering to include them when coding up a web page.
// 
// Scrawl-canvas attempts to automate _some_ (but not _all_) accessibility work through inclusion of the following Canvas attributes (specifically, Scrawl-canvas implements [ARIA attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)):
// + __title__ - this attribute is applied to the &lt;canvas> element's 'title' attribute, and will appear as a tooltip when the user hovers over the canvas
// + __label__ and __description__ - these attributes are applied to (offscreen) div elements which are referenced by the &lt;canvas> element using `aria-labelledby` and `aria-describedby` attributes
//
// If no label value is supplied to the Canvas factory (as part of the function's argument object), then Scrawl-canvas will auto-generate a label based on the canvas's name. All three attributes can be updated dynamically using the usual `set()` functionality.
//
// Beyond the Canvas object, Scrawl-canvas also encourages Phrase entitys (which handle graphical text in the canvas display) to expose their content to the DOM, to make it accessible. Also, any artefact given an Anchor link will expose the Anchor's &lt;a> element in the DOM, which allows the canvas display to become part of the document's navigation (for example, by keyboard tabbing).
    title: '',
    label: '',
    description: '',

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet/Clone management
// This functionality is disabled for Canvas objects
P.stringifyFunction = defaultNonReturnFunction;
P.processPacketOut = defaultNonReturnFunction;
P.finalizePacketOut = defaultNonReturnFunction;
P.saveAsPacket = () => `[${this.name}, ${this.type}, ${this.lib}, {}]`;
P.clone = defaultThisReturnFunction;


// #### Kill functionality
P.kill = function () {

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

    // Scrawl-canvas library
    return this.deregister();
}


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

// `trackHere` - Boolean
S.trackHere = function(bool) {

    if (xt(bool)) {

        if (bool) pushUnique(uiSubscribedElements, this.name);
        else removeItem(uiSubscribedElements, this.name);

        this.trackHere = bool;
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
P.updateCells = function (items = {}) {

    this.cells.forEach(name => {

        let mycell = cell[name];

        if (mycell) {

            if (items.dirtyScale) mycell.dirtyScale = true;
            if (items.dirtyDimensions) mycell.dirtyDimensions = true;
            if (items.dirtyLock) mycell.dirtyLock = true;
            if (items.dirtyStart) mycell.dirtyStart = true;
            if (items.dirtyOffset) mycell.dirtyOffset = true;
            if (items.dirtyHandle) mycell.dirtyHandle = true;
            if (items.dirtyRotation) mycell.dirtyRotation = true;
        }
    });
};

// `buildCell` - internal helper function, called by the Canvas constructor
P.buildCell = function (items = {}) {

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
};

// `addCell` - add a Cell object to the wrapper's cells Array; argument can be the Cell's name-String, or the Cell object itself
P.addCell = function (item) {

    item = (item.substring) ? item : item.name || false;

    if (item) {

        pushUnique(this.cells, item);
        cell[item].prepareStamp();
        this.dirtyCells = true;
    }
    return item;
};

// `removeCell` - remove a Cell object from the wrapper's cells Array; argument can be the Cell's name-String, or the Cell object itself
P.removeCell = function (item) {

    item = (item.substring) ? item : item.name || false;

    if (item) {

        removeItem(this.cells, item);
        this.dirtyCells = true;
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

// `clear` - For Cell objects in the wrapper's __cells__ (and associated) Arrays (returns a Promise):
// + if the Cell object's `cleared` flag is true, invoke the Cell's `clear` function 
P.clear = function () {

    let self = this;

    return new Promise((resolve) => {

        let promises = [];

        if (self.dirtyCells) self.cleanCells();

        self.cellBatchesClear.forEach(mycell => promises.push(mycell.clear()));

        Promise.all(promises)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
};

// `compile` - For Cell objects in the wrapper's __cells__ (and associated) Arrays (returns a Promise):
// + sort Cell objects depending on their `compileOrder` attribute - Cells with lower order values will be processed first
// + if the Cell object's `compiled` flag is true, invoke the Cell's `compile` function 
P.compile = function () {

    let self = this;

    return new Promise((resolve) => {

        let promises = [];

        if (self.dirtyCells) self.cleanCells();

        self.cellBatchesCompile.forEach(mycell => promises.push(mycell.compile()));

        Promise.all(promises)
        .then(() => self.prepareStamp())
        .then(() => self.stamp())
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
};

// `show` - For Cell objects in the wrapper's __cells__ (and associated) Arrays (returns a Promise):
// + sort Cell objects depending on their `showOrder` attribute - Cells with lower order values will be processed first
// + if the Cell object's `shown` flag is true, invoke the Cell's `show` function 
//
// And then:
// + copy the base Cells display over to the Canvas wrapper's &lt;canvas> element
// + update ARIA and other associated metadata
P.show = function(){

    let self = this;

    return new Promise((resolve) => {

        let promises = [];

        if (self.dirtyCells) self.cleanCells();

        self.cellBatchesShow.forEach(mycell => promises.push(mycell.show()));

        Promise.all(promises)
        .then((res) => {

            self.engine.clearRect(0, 0, self.localWidth, self.localHeight);
            return self.base.show();
        })
        .then(() => {

            domShow();

            if (this.dirtyAria) this.cleanAria();

            resolve(true);
        })
        .catch(() => resolve(false));
    });
};

// `render` - orchestrate a single Display cycle - clear, then compile, then show (returns a Promise).
P.render = function () {

    let self = this;

    return new Promise((resolve) => {

        self.clear()
        .then(() => self.compile())
        .then(() => self.show())
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
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

    cells.forEach(item => {

        let mycell = cell[item];

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
    });

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
P.cascadeEventAction = function (action) {

    if (!this.currentActiveEntityNames) this.currentActiveEntityNames = [];

    let currentActiveEntityNames = this.currentActiveEntityNames,
        testActiveEntityObjects = [],
        testActiveEntityNames = [],
        newActiveEntityObjects = [],
        newActiveEntityNames = [],
        knownActiveEntityObjects = [],
        knownActiveEntityNames = [];

    // 1. Find all entitys currently colliding with the mouse/touch coordinate over the canvas
    this.cells.forEach(name => {

        let myCell = cell[name];

        if (myCell && (myCell.shown || myCell.isBase)) testActiveEntityObjects.push(myCell.getEntityHits());
    });

    testActiveEntityObjects = testActiveEntityObjects.reduce((a, v) => a.concat(v), []);

    // 2. Process the returned test results
    testActiveEntityObjects.forEach(item => {

        let name = item.name;

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
    });

    let currentActiveEntityObjects = newActiveEntityObjects.concat(knownActiveEntityObjects);

    // 3. Trigger the required action on each affected entity
    let doLeave = function () {

        if (currentActiveEntityNames.length) {

            newActiveEntityNames.forEach(name => removeItem(currentActiveEntityNames, name));
            knownActiveEntityNames.forEach(name => removeItem(currentActiveEntityNames, name));

            currentActiveEntityNames.forEach(name => {

                let myArt = artefact[name];

                if (myArt) myArt.onLeave();
            });
        }
    };

    switch (action) {

        case 'down' :
            currentActiveEntityObjects.forEach(art => art.onDown());
            break;

        case 'up' :
            currentActiveEntityObjects.forEach(art => art.onUp());
            break;

        case 'enter' :
            newActiveEntityObjects.forEach(art => art.onEnter());
            break;

        case 'leave' :
            doLeave();
            break;

        case 'move' :
            doLeave();
            newActiveEntityObjects.forEach(art => art.onEnter());
            break;
    }

    // 4. Cleanup and return
    this.currentActiveEntityNames = newActiveEntityNames.concat(knownActiveEntityNames);

    return this.currentActiveEntityNames;
};

// `cleanAria` - internal function; transfers updated __title__, __label__ and __description__ attribute values into the relevant DOM elements
P.cleanAria = function () {

    this.dirtyAria = false;
    this.domElement.setAttribute('title', this.title);
    this.ariaLabelElement.textContent = this.label;
    this.ariaDescriptionElement.textContent = this.description;
}


// #### Factory
const makeCanvas = function (items) {
    return new Canvas(items);
};

constructors.Canvas = Canvas;


// #### Exports
export {
    makeCanvas,
};
