// # Cell factory
// Scrawl-canvas uses 'hidden' canvases - &lt;canvas> elements that are not part of the DOM - for much of its functionality:
// + When we wrap a DOM-based &lt;canvas> element in a Scrawl-canvas [Canvas](./canvas.html) wrapper, we create a second 'hidden' &lt;canvas> element and assign it as that Canvas wrapper's __base cell__.
// + This Cell is used for building the display during the Display cycle (`clear` and `compile` steps).
// + It gets copied over to the Dom-based &lt;canvas> element at the end of the cycle (the `show` step).
// + When copied over, the base cell will determine how much of its display to copy into the controller Canvas, to meet the needs of that Canvas wrapper's `fit` attribute.
//
// A Scrawl-canvas Canvas wrapper can have more than one Cell wrapper associated with it. These additional Cells can be used as:
// + __layers__ to be applied to the base cell, allowing us to break a canvas display into more manageable portions
// + the source for image-based objects such as __Picture entitys__ and __Pattern styles__.
// + __artefacts__ - a Cell wrapper can act just like any artefact: it can be positioned, dimensioned, scaled and rotated ; it can act as a `pivot` or `mimic` source for other artefacts, or use them for its position and dimensions data. (Be aware, though, that Cell wrappers are NOT stored in the scrawl library's `artefact` section).
//
// Cell wrappers include a number of Boolean flags and other attributes to control how they are stamped onto other Cells.
// + We can set flags to determine whether to include the Cell in each step of the Display cycle (`cleared`, `compiled`, `shown`) - this allows us to set up, for example, 'static' Cells that only need to be compiled once and can then be used as backgrounds for other Cells and entitys to be animated over.
// + We can vary the order in which Cell wrappers get processed during the Display cycle (`compileOrder`, `showOrder`).
// + Each Cell can have its own `backgroundColor`.
// + Each Cell can be made translucent (`alpha`).
// + Each Cell can be stamped onto other Cell canvases using a different composition method (`composite`).
// + Each Cell can be given its own dimensions, different to those of its Canvas wrapper, with updates cascading down to entitys that use the Cell to determine their own (relative) dimensions and start coordinates.
// + We can `scale`, `roll` and `flip` a Cell.
// + We can control which parts of the Cell display will be copied over to its destination (`copy attributes`).
// + We can add one or more `filters` to the Cell's outputted display.
//
// Every Cell wrapper will include a [Group object](./group.html) which shares the same name as the Cell. To include an entity object in a Cell wrapper's canvas display we add it to this group.
// + Additional Group objects can be added to the Cell wrapper as-and-when required.
// + Groups are processed in the order specified in their `order` attributes.
// + Groups whose `visibility` flag is set to false will be skipped during the Display cycle cascade.
//
// Scrawl-canvas uses the `makeCell` factory function internally; it is not exported to the scrawl object. Instead, ___new Cell wrappers can be created from a Canvas wrapper___ using its `addCell` function.
//
// Scrawl-canvas (partially) disables Cell wrapper `packet` functionality. ___Cell wrappers cannot be cloned.___ They can be killed, either using their `kill` function or by invoking their Canvas wrapper controller's `killCell` function.


// #### Imports
import { artefact, asset, canvas, constructors, group } from '../core/library.js';

import { addStrings, doCreate, isa_canvas, mergeOver, λnull, λthis, Ωempty } from '../helper/utilities.js';

import { getIgnorePixelRatio, getPixelRatio } from "../core/user-interaction.js";

import { makeGroup } from './group.js';
import { makeState } from '../untracked-factory/state.js';

import { makeCoordinate, releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import { filterEngine } from '../helper/filter-engine.js';
import { importDomImage } from '../asset-management/image-asset.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import baseMix from '../mixin/base.js';
import cellMix from '../mixin/cell-key-functions.js';
import positionMix from '../mixin/position.js';
import deltaMix from '../mixin/delta.js';
import pivotMix from '../mixin/pivot.js';
import mimicMix from '../mixin/mimic.js';
import pathMix from '../mixin/path.js';
import hiddenElementsMix from '../mixin/hiddenDomElements.js';
import anchorMix from '../mixin/anchor.js';
import buttonMix from '../mixin/button.js';
import cascadeMix from '../mixin/cascade.js';
import assetMix from '../mixin/asset.js';
import patternMix from '../mixin/pattern.js';
import filterMix from '../mixin/filter.js';

import { _isFinite, _floor, _round, _trunc, _values, _2D, AUTO, CANVAS, CELL, CONTAIN, COVER, DIMENSIONS, FILL, GRAYSCALE, HEIGHT, IMG, MOUSE, MOZOSX_FONT_SMOOTHING, NEVER, NONE, SMOOTH_FONT, SOURCE_OVER, SRGB, T_CELL, TRANSPARENT_VALS, WEBKIT_FONT_SMOOTHING, WIDTH, ZERO_STR } from '../helper/shared-vars.js';


// #### Cell constructor
const Cell = function (items = Ωempty) {

    this.makeName(items.name);

    this.register();

    this.initializePositions();
    this.initializeCascade();

    this.modifyConstructorInputForAnchorButton(items);

    let mycanvas = items.element;
    delete items.element;

    if (!isa_canvas(mycanvas)) {

        mycanvas = document.createElement(CANVAS);
        mycanvas.id = this.name;
        mycanvas.width = 300;
        mycanvas.height = 150;
    }

    // The `willReadFrequently` argument attribute is not retained by the cell, but is used during the Cell element's construction. Defaults to `true`
    this.set(this.defs);

    this.set(items);

    this.installElement(mycanvas, items.canvasColorSpace);

    this.state.setStateFromEngine(this.engine);

    makeGroup({
        name: this.name,
        host: this.name
    });

    this.subscribers = [];
    this.sourceNaturalDimensions = makeCoordinate();
    this.dirtyDimensionsOverride = true;

    this.sourceLoaded = true;

    this.here = {};

    return this;
};


// #### Cell prototype
const P = Cell.prototype = doCreate();
P.type = T_CELL;
P.lib = CELL;
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
baseMix(P);
cellMix(P);
assetMix(P);
positionMix(P);
deltaMix(P);
pivotMix(P);
mimicMix(P);
pathMix(P);
hiddenElementsMix(P);
anchorMix(P);
buttonMix(P);
cascadeMix(P);
patternMix(P);
filterMix(P);


// #### Cell attributes
const defaultAttributes = {

// The following booleans determine whether a Cell canvas will, clear, compile and/or show itself as part of the Display cycle.
// + Note that as part of the Display cycle, Scrawl-canvas will complete all tasks of the `clear` part of the process before moving on to the `compile` stage, which again will complete before the `show` stage triggers.

// __cleared__ - Clearing the cell wipes it clean ready for new drawing activity - for cells that contain static imagery (such as a background) that only needs to be drawn once during an animation it makes no sense to construct its display on each iteration of the Display cycle. Can also be set to false if the compile step builds on, rather than replaces, the cell's current imagery.
    cleared: true,

// __compiled__ - Compiling the cell triggers the 'stamp cascade', where (visible) entitys in (visible) groups assigned to the cell are instructed to stamp themselves onto the cell. Again, set this to false if the cell's imagery does not need to be redrawn on each iteration of the Display cycle.
    compiled: true,

// __shown__ - Showing the cell instructs it to stamp itself onto the 'base' cell or, for base cells, to stamp itself onto the display &lt;canvas> element in line with that canvas's wrapper's 'fit' attribute. This can be switched off if the cell is (for instance) being used as an asset source for a Picture entity or Pattern style.
    shown: true,

// Cells will compile and show in the order given (ascending) of their __compileOrder__ and __showOrder__ values. Cells sharing a compileOrder or showOrder value will be compiled and shown determined by the order in which they were declared in the script where they were created.
    compileOrder: 0,
    showOrder: 0,


// By default, cells have a background color of `rgb(0 0 0 / 0)` - transparent black, which gets applied as the end step in the clear part of the display cycle. Setting the __backgroundColor__ attribute ensures the Cell will use that color instead. Any CSS color String is a valid argument (but not gradients or patterns, which get applied at a later stage in the Display cycle).
// + Base cells can have this attribute set via their controller Canvas.
    backgroundColor: ZERO_STR,


// __clearAlpha__ - a Number with a value between 0 and 1. When not zero, the cell will not clear itself; rather it will copy its current contents, clear itself, set its globalAlpha to this value, copy back its contents (now faded) and then restore its globalAlpha value
    clearAlpha: 0,


// Non-base Cells will stamp themselves onto the 'base' Cell as part of the Display cycle's show stage. We can mediate this action by setting the Cell's __alpha__ and __composite__ attributes to valid Rendering2DContext `globalAlpha` and `globalCompositeOperation` values.
    alpha: 1,
    composite: SOURCE_OVER,

// We can also scale the Cell's size in the displayed Canvas by setting the __scale__ attribute to an appropriate value.
    scale: 1,

// __flipReverse__, __flipUpend__ - Boolean flags which determine the orientation of the cell when it stamps itself on the display.
// + a `reversed` cell is effectively flipped 180&deg; around a vertical line passing through that cell's rotation-reflection (start) point - a face looking to the right will now look to the left
// + an `upended` cell is effectively flipped 180&deg; around a horizontal line passing through that cell's rotation-reflection (start) point - a normal face will now appear upside-down
    flipReverse: false,
    flipUpend: false,

// __filter__ - the Canvas 2D engine supports the [filter attribute](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) on an experimental basis, thus it is not guaranteed to work in all browsers and devices. The filter attribute takes a String value (default: 'none') defining one or more filter functions to be applied to the Cell as it is stamped on its host canvas.
// + Be aware that Cells can also take a `filters` Array - this represents an array of Scrawl-canvas filters to be applied to the Cell. The two filter systems are completely separate - combine their effects at your own risk!
    filter: NONE,

// Scrawl-canvas sets the following attributes automatically; do not change their values!

// __isBase__ - Every displayed &lt;canvas> element - wrapped in a Scrawl-canvas Canvas object (factory/canvas.js) - must possess at least one Cell object, known as its 'base' Cell.
    isBase: false,

// __useAsPattern__ - Used to ignore the requirement to resize canvases to take into account device pixel ratios greater than 1
    useAsPattern: false,

// __controller__ - A reference link to the displayed &lt;canvas> element's Scrawl-canvas wrapper (factory/canvas.js) - only 'base' cells require this handle.
    controller: null,

// __includeInCascadeEventActions__ - if a non-base Cell has its `shown` flag set to true, then it is automatically included in CascadeEventActions functionality. In situations where we don't want the Cell to _directly_ appear in the canvas, but do want to include it in CascadeEventActions, then we can set this flag to `true`
    includeInCascadeEventActions: false,

    willReadFrequently: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// Cells don't have a need for these default attributes, which will have been added in by mixin/asset.js
delete P.defs.source;
delete P.defs.sourceLoaded;



// #### Packet/Clone management
// This functionality is disabled for Cell objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;


// #### Kill functionality
P.factoryKill = function () {

    const myname = this.name

    // Remove artefact from all canvases
    _values(canvas).forEach(cvs => {

        if (cvs.cells.includes(myname)) cvs.removeCell(myname);

        if (cvs.base && cvs.base.name === myname) {

            cvs.set({
                visibility: false,
            });
        }
    });

    // Remove from other artefacts
    _values(artefact).forEach(art => {

        if (art.name !== myname) {

            const state = art.state;

            if (state) {

                const fill = state.fillStyle,
                    stroke = state.strokeStyle;

                if (fill.name && fill.name === myname) state.fillStyle = state.defs.fillStyle;
                if (stroke.name && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
            }
        }
    });

    // Kill group
    if (group[myname]) group[myname].kill();
};

// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;


// `get` - overwrites the mixin/position function
P.get = function (item) {

    const getter = this.getters[item];

    if (getter) return getter.call(this);

    else {

        let def = this.defs[item],
            val;

        const state = this.state;

        if (def != null) {

            val = this[item];
            return (val != null) ? val : def;
        }

        def = state.defs[item];

        if (def != null) {

            val = state[item];
            return (val != null) ? val : def;
        }
        return undefined;
    }
};

// `width`
G.width = function () {

    return this.currentDimensions[0] || this.element.getAttribute(WIDTH);
};
S.width = function (val) {

    if (val != null) {

        this.dimensions[0] = val;
        this.dirtyDimensions = true;
        this.dirtyDimensionsOverride = true;
    }
};

// `height`
G.height = function () {

    return this.currentDimensions[1] || this.element.getAttribute(HEIGHT);
};
S.height = function (val) {

    if (val != null) {

        this.dimensions[1] = val;
        this.dirtyDimensions = true;
        this.dirtyDimensionsOverride = true;
    }
};

G.dimensions = function () {

    const w = this.currentDimensions[0] || this.element.getAttribute(WIDTH);
    const h = this.currentDimensions[1] || this.element.getAttribute(HEIGHT);

    return [w, h];
};
S.dimensions = function (w, h) {

    this.setCoordinateHelper(DIMENSIONS, w, h);
    this.dirtyDimensions = true;
    this.dirtyDimensionsOverride = true;
};

// Internal setters
S.source = function () {};
S.engine = function () {};
S.state = function () {};

S.element = function (item) {

    if(isa_canvas(item)) this.installElement(item);
};

// Display cycle Boolean flags `cleared`, `compiled`, `shown`
S.backgroundColor = function (item) {

    // If we try to clear the cell with a transparent color, it will not clear. Setting it to an empty string fixes this issue
    if (TRANSPARENT_VALS.includes(item)) item = ZERO_STR;
    this.backgroundColor = item;
};

S.cleared = function (item) {

    this.cleared = item;
    this.updateControllerCells();
};
S.compiled = function (item) {

    this.compiled = item;
    this.updateControllerCells();
};
S.shown = function (item) {

    this.shown = item;
    this.updateControllerCells();
};

// Display cycle order attributes `compileOrder`, `showOrder` - argument should be a positive integer Number
S.compileOrder = function (item) {

    this.compileOrder = item;
    this.updateControllerCells();
};
S.showOrder = function (item) {

    this.showOrder = item;
    this.updateControllerCells();
};


// __Stash coordinates and dimensions__ - which are stored in Coordinate arrays - allow us to store, and export to an image asset, a portion of the Cell's current display which can then be used (for instance) by Pattern styles.
// + Scrawl-canvas supplies the following _pseudo-attributes_ for dealing with the stash start coordinate (`stashX`, `stashY`) and dimensions (`stashWidth`, `stashHeight`)
// + Each of these values can be either absolute px Numbers, or relative (to the Cell's own dimensions) '%' Strings
S.stashX = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
    this.stashCoordinates[0] = val;
};
S.stashY = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
    this.stashCoordinates[1] = val;
};
S.stashWidth = function (val) {

    if (!this.stashDimensions) {

        const dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }
    this.stashDimensions[0] = val;
};
S.stashHeight = function (val) {

    if (!this.stashDimensions) {

        const dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }
    this.stashDimensions[1] = val;
};
D.stashX = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

    const c = this.stashCoordinates;
    c[0] = addStrings(c[0], val);
};
D.stashY = function (val) {

    if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

    const c = this.stashCoordinates;
    c[1] = addStrings(c[1], val);
};
D.stashWidth = function (val) {

    if (!this.stashDimensions) {

        const dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }

    const c = this.stashDimensions;
    c[0] = addStrings(c[0], val);
};
D.stashHeight = function (val) {

    if (!this.stashDimensions) {

        const dims = this.currentDimensions;
        this.stashDimensions = [dims[0], dims[1]];
    }

    const c = this.stashDimensions;
    c[1] = addStrings(c[1], val);
};

S.clearAlpha = function (val) {

    if (val.toFixed) {

        if (val > 1) val = 1;
        else if (val < 0) val = 0;

        this.clearAlpha = val;
    }
};
D.clearAlpha = function (val) {

    if (val.toFixed) {

        val += this.clearAlpha;

        if (val > 1) val = 1;
        else if (val < 0) val = 0;

        this.clearAlpha = val;
    }
};

// `smoothFont` - handle this directly; don't save the attribute state
S.smoothFont = function (item) {

    const { element } = this;

    if (element) {

        const { style } = element;

        if (style) {

            if (item) {
                style[WEBKIT_FONT_SMOOTHING] = AUTO;
                style[MOZOSX_FONT_SMOOTHING] = AUTO;
                style[SMOOTH_FONT] = AUTO;
            }
            else {
                style[WEBKIT_FONT_SMOOTHING] = NONE;
                style[MOZOSX_FONT_SMOOTHING] = GRAYSCALE;
                style[SMOOTH_FONT] = NEVER;
            }
        }
    }
};

// `checkForEntityHover`, `onEntityHover`, `onEntityNoHover` - these are group-specific attributes which we can set on the Cell's named group via the Cell's wrapper
S.checkForEntityHover = function (item) {

    group[this.name].set({
        checkForEntityHover: item,
    });
};
S.onEntityHover = function (item) {

    group[this.name].set({
        onEntityHover: item,
    });
};
S.onEntityNoHover = function (item) {

    group[this.name].set({
        onEntityNoHover: item,
    });
};

// `group` - get the Cell's namesake group
// + Note that Cell wrappers can action more than one group
G.group = function () {

    return group[this.name];
};


// #### Prototype functions

// `checkSource` - internal function
P.checkSource = function (width, height) {

    if (this.currentDimensions[0] !== width || this.currentDimensions[1] !== height) this.notifySubscribers();
};

// `getData` - internal function, invoked when a Cell wrapper is used as an entity's pattern style
P.getData = function (entity, mycell) {

    this.checkSource(this.sourceNaturalDimensions[0], this.sourceNaturalDimensions[1]);

    return this.buildStyle(mycell);
};

// `updateArtefacts` - passes the __items__ argument object through to each of the Cell's Groups for forwarding to their artefacts' `setDelta` function
P.updateArtefacts = function (items = Ωempty) {

    const gb = this.groupBuckets;

    let art, ab, i, iz, j, jz;

    for (i = 0, iz = gb.length; i < iz; i++) {

        ab = gb[i].artefactCalculateBuckets;

        for (j = 0, jz = ab.length; j < jz; j++) {

            art = ab[j];

            if (items.dirtyScale) art.dirtyScale = true;
            if (items.dirtyDimensions) art.dirtyDimensions = true;
            if (items.dirtyLock) art.dirtyLock = true;
            if (items.dirtyStart) art.dirtyStart = true;
            if (items.dirtyOffset) art.dirtyOffset = true;
            if (items.dirtyHandle) art.dirtyHandle = true;
            if (items.dirtyRotation) art.dirtyRotation = true;
            if (items.dirtyPathObject) art.dirtyPathObject = true;
        }
    }
};

// `cleanDimensionsAdditionalActions` - overwrites mixin/position function:
// + Updates the Cell's &lt;canvas> element's dimensions
// + Restores the render engine's attributes to current cell values (because the resize wipes them to default values)
// + Asks the Canvas controller to trigger an update to the Cell's `here` object
// + Tells all associated artefacts that the Cell's dimensions have changed
P.cleanDimensionsAdditionalActions = function() {

    const element = this.element;

    // Only proceed if the canvas element is in place
    if (element) {

        const {
            cleared,
            dirtyDimensionsOverride,
        } = this;

        const controller = this.getController();

        // Only proceed if we know the Cell has a controller, and its contents don't need to be preserved
        // + If the user sets the cell to `cleared: false`, then later sets the cell's dimensions via `set()`, that's their problem, not ours
        if (controller && (cleared || dirtyDimensionsOverride)) {

            this.dirtyDimensionsOverride = false;

            const {
                currentDimensions,
                dimensions,
                isBase,
            } = this;

            const controlDimensions = controller.currentDimensions;
            const [width, height] = controlDimensions;

            // __isComponent__ is DEPRECATED (because it is a really bad name) and replaced by __baseMatchesCanvasDimensions__
            if (isBase && (controller.baseMatchesCanvasDimensions || controller.isComponent)) {

                dimensions[0] = width;
                dimensions[1] = height;
                currentDimensions[0] = width;
                currentDimensions[1] = height;
            }
            else {

                let item;

                for (let i = 0; i < 2; i++) {

                    item = dimensions[i];

                    if (item.substring) {

                        item = parseFloat(item);

                        if (_isFinite(item) && item >= 1) currentDimensions[i] = _floor(controlDimensions[i] * (item / 100));
                        else currentDimensions[i] = 1;
                    }
                    else if (_isFinite(item) && item >= 1) currentDimensions[i] = _floor(item);
                    else currentDimensions[i] = 1;
                }
            }

            const [w, h] = currentDimensions;

            if (getIgnorePixelRatio()) {

                element.width = w;
                element.height = h;
            }
            else {

                const dpr = getPixelRatio();

                element.width = w * dpr;
                element.height = h * dpr;
            }

            this.setEngineFromState(this.engine);

            if (isBase && controller) controller.updateBaseHere();

            if (this.groupBuckets) {

                this.updateArtefacts({
                    dirtyDimensions: true,
                });
            }
        }
    }
};


// `notifySubscriber` - Overrides mixin/asset.js function
P.notifySubscriber = function (sub) {

    if (!sub.sourceNaturalDimensions) sub.sourceNaturalDimensions = [];

    sub.sourceNaturalWidth = this.currentDimensions[0];
    sub.sourceNaturalHeight = this.currentDimensions[1];

    sub.sourceLoaded = true;
    sub.dirtyImage = true;

    sub.dirtyCopyStart = true;
    sub.dirtyCopyDimensions = true;
};


// `subscribeAction` - Overrides mixin/asset.js function
P.subscribeAction = function (sub = {}) {

    this.subscribers.push(sub);
    sub.asset = this;
    sub.source = this.element;
    this.notifySubscriber(sub)
};

// `installElement` - internal function, used by the constructor
P.installElement = function (element, colorSpace = SRGB) {

    this.element = element;

    this.engine = this.element.getContext(_2D, {
        willReadFrequently: this.willReadFrequently,
        colorSpace,
    });

    this.state = makeState({
        engine: this.engine,
    });

    return this;
};

// `updateControllerCells` - internal function: ask the Cell's Canvas controller to review/update its cells data
P.updateControllerCells = function () {

    const controller = this.getController();
    if (controller) controller.dirtyCells = true;
};

// `getController` - internal function: ask the Cell's Canvas controller to review/update its cells data
P.getController = function () {

    const { controller, currentHost } = this;

    if (controller) return controller;
    if (currentHost) return currentHost.getHost();
    return null;
};

// `getHost` - Internal function - get a reference to the Cell's current host (where it will be stamping itself as part of the Display cycle).
// + Note that Cells can (in theory: not tested yet) belong to more than one Canvas object Group - they can be used in multiple &lt;canvas> elements, thus the need to check which canvas is the current host at this point in the Display cycle.
P.getHost = function () {

    if (this.currentHost) return this.currentHost;
    else if (this.host) {

        const host = asset[this.host] || artefact[this.host];

        if (host) this.currentHost = host;

        return (host) ? this.currentHost : false;
    }
    return false;
};

// `updateBaseHere` - Internal function called by a Canvas wrapper on its base Cell
P.updateBaseHere = function (controllerHere, fit) {

    if (this.isBase) {

        if (!this.here) this.here = {};

        const here = this.here,
            dims = this.currentDimensions;

        let active = controllerHere.active;

        const controllerWidth = (controllerHere.localListener) ? controllerHere.originalWidth : controllerHere.w;
        const controllerHeight = (controllerHere.localListener) ? controllerHere.originalHeight : controllerHere.h;

        if (dims[0] !== controllerWidth || dims[1] !== controllerHeight) {

            if (!this.basePaste) this.basePaste = [];

            const pasteX = this.basePaste[0];

            const localWidth = dims[0],
                localHeight = dims[1],
                remoteWidth = controllerWidth,
                remoteHeight = controllerHeight,
                remoteX = controllerHere.x,
                remoteY = controllerHere.y;

            const relWidth = localWidth / remoteWidth || 1,
                relHeight = localHeight / remoteHeight || 1;

            let offsetX, offsetY;

            here.w = localWidth;
            here.h = localHeight;

            switch (fit) {

                case CONTAIN :
                case COVER :

                    if (pasteX) {

                        offsetX = (remoteWidth - (localWidth / relHeight)) / 2;

                        here.x = _round((remoteX - offsetX) * relHeight);
                        here.y = _round(remoteY * relHeight);
                    }
                    else {

                        offsetY = (remoteHeight - (localHeight / relWidth)) / 2;

                        here.x = _round(remoteX * relWidth);
                        here.y = _round((remoteY - offsetY) * relWidth);
                    }
                    break;

                case FILL :
                    here.x = _round(remoteX * relWidth);
                    here.y = _round(remoteY * relHeight);
                    break;

                case NONE :
                default :
                    offsetX = (remoteWidth - localWidth) / 2;
                    offsetY = (remoteHeight - localHeight) / 2;

                    here.x = _round(remoteX - offsetX);
                    here.y = _round(remoteY - offsetY);
            }

            if (here.x < 0 || here.x > localWidth) active = false;
            if (here.y < 0 || here.y > localHeight) active = false;

            here.active = active;
        }
        else {

            here.x = controllerHere.x;
            here.y = controllerHere.y;
            here.w = controllerWidth;
            here.h = controllerHeight;
            here.active = active;
        }
        controllerHere.baseActive = active;
    }
};

// `clear`
P.clear = function () {

    const {element, engine, backgroundColor, clearAlpha, currentDimensions} = this;
    let [width, height] = currentDimensions;

    width = _trunc(width);
    height = _trunc(height);

    this.prepareStamp();

    const dpr = checkEngineScale(engine);

    const w = _trunc(width * dpr),
        h = _trunc(height * dpr);

    if (this.useAsPattern) {

        element.width = width;
        element.height = height;
    }

    if (backgroundColor) {

        engine.save();
        engine.fillStyle = backgroundColor;
        engine.globalCompositeOperation = SOURCE_OVER;
        engine.globalAlpha = 1;
        engine.fillRect(0, 0, width, height);
        engine.restore();
    }
    else if (clearAlpha) {

        engine.save();
        const tempCell = requestCell();

        const {engine:tempEngine, element:tempEl} = tempCell;

        if (this.useAsPattern) {

            tempEl.width = width;
            tempEl.height = height;

            tempEngine.drawImage(element, 0, 0, width, height, 0, 0, width, height);

            engine.clearRect(0, 0, width, height);
            engine.globalAlpha = clearAlpha;

            engine.drawImage(tempEl, 0, 0, width, height, 0, 0, width, height);
        }
        else {
            tempEl.width = w;
            tempEl.height = h;

            tempEngine.drawImage(element, 0, 0, width, height, 0, 0, width, height);

            engine.clearRect(0, 0, width, height);
            engine.globalAlpha = clearAlpha;

            engine.drawImage(tempEl, 0, 0, w, h, 0, 0, width, height);
        }
        engine.restore();

        releaseCell(tempCell);
    }
    else engine.clearRect(0, 0, width, height);
};

// `compile`
P.compile = function(){

    this.sortGroups();

    if (!this.cleared) this.prepareStamp();

    if(this.dirtyFilters || !this.currentFilters) this.cleanFilters();

    checkEngineScale(this.engine);

    const gb = this.groupBuckets,
        gbLen = gb.length;

    for (let i = 0, grp; i < gbLen; i++) {

        grp = gb[i];
        if (grp && grp.stamp) grp.stamp();
    }

    if (!this.noFilters && this.filters && this.filters.length) this.applyFilters();
    this.stashOutputAction();
};

// `show` - Note that functionality here differs for __base cells__ and other Cell wrappers
P.show = function () {

    // get the destination cell's canvas context
    const host = this.getHost(),
        engine = (host && host.engine) ? host.engine : false;

    if (engine) {

        const hostDimensions = host.currentDimensions,
            destWidth = ~~(hostDimensions[0]),
            destHeight = ~~(hostDimensions[1]);

        // Cannot draw to the destination canvas if either of its dimensions === 0
        if (!destWidth || !destHeight) return false;

        const {
            currentScale:scale,
            currentDimensions,
            composite,
            alpha,
            controller,
            element,
            isBase,
            currentStampHandlePosition:handle,
            currentStampPosition:stamp,
        } = this;

        const curWidth = ~~(currentDimensions[0]),
            curHeight = ~~(currentDimensions[1]);

        let paste;

        engine.save();

        checkEngineScale(engine);

        engine.filter = this.filter;

        if (isBase) {

            if (!this.basePaste) this.basePaste = [];
            paste = this.basePaste;

            // copy the base canvas over to the display canvas. This copy operation ignores any scale, roll or position attributes set on the base cell, instead complying with the controller's fit attribute requirements
            if (!this.cleared && !this.compiled) this.prepareStamp();

            engine.globalCompositeOperation = SOURCE_OVER;
            engine.globalAlpha = 1;
            engine.clearRect(0, 0, destWidth, destHeight);

            engine.globalCompositeOperation = composite;
            engine.globalAlpha = alpha;

            engine.imageSmoothingQuality = 'high';

            const fit = (controller) ? controller.fit : NONE;

            let relWidth, relHeight;

            switch (fit) {

                case CONTAIN :
                    // base must copy into display resized, centered, letterboxing if necessary, maintaining aspect ratio
                    relWidth = destWidth / (curWidth || 1);
                    relHeight = destHeight / (curHeight || 1);

                    if (relWidth > relHeight) {

                        paste[0] = ~~((destWidth - (curWidth * relHeight)) / 2);
                        paste[1] = 0;
                        paste[2] = ~~(curWidth * relHeight);
                        paste[3] = ~~(curHeight * relHeight);
                    }
                    else {

                        paste[0] = 0;
                        paste[1] = ~~((destHeight - (curHeight * relWidth)) / 2);
                        paste[2] = ~~(curWidth * relWidth);
                        paste[3] = ~~(curHeight * relWidth);
                    }
                    break;

                case COVER :
                    // base must copy into display resized, centered, leaving no letterbox area, maintaining aspect ratio
                    relWidth = destWidth / (curWidth || 1);
                    relHeight = destHeight / (curHeight || 1);

                    if (relWidth < relHeight) {

                        paste[0] = ~~((destWidth - (curWidth * relHeight)) / 2);
                        paste[1] = 0;
                        paste[2] = ~~(curWidth * relHeight);
                        paste[3] = ~~(curHeight * relHeight);
                    }
                    else{

                        paste[0] = 0;
                        paste[1] = ~~((destHeight - (curHeight * relWidth)) / 2);
                        paste[2] = ~~(curWidth * relWidth);
                        paste[3] = ~~(curHeight * relWidth);
                    }
                    break;

                case FILL :
                    // base must copy into display resized, distorting the aspect ratio as necessary
                    paste[0] = 0;
                    paste[1] = 0;
                    paste[2] = ~~(destWidth);
                    paste[3] = ~~(destHeight);
                    break;

                case NONE :
                default :
                    // base copies into display as-is, centred, maintaining aspect ratio
                    paste[0] = ~~((destWidth - curWidth) / 2);
                    paste[1] = ~~((destHeight - curHeight) / 2);
                    paste[2] = curWidth;
                    paste[3] = curHeight;
            }
        }
        else if (scale > 0) {

            if (!this.paste) this.paste = [];
            paste = this.paste;

            // Cell canvases are treated like entitys on the base canvas: they can be positioned, scaled and rotated. Positioning will respect lockTo; flipReverse and flipUpend; and can be pivoted to other artefacts, or follow a path entity, etc. If pivoted to the mouse, they will use the base canvas's .here attribute, which takes into account differences between the base and display canvas dimensions.

            if (!this.noDeltaUpdates) this.setDelta(this.delta);

            if (!this.cleared && !this.compiled) this.prepareStamp();

            engine.globalCompositeOperation = composite;
            engine.globalAlpha = alpha;

            engine.imageSmoothingQuality = 'high';

            paste[0] = ~~(-handle[0] * scale);
            paste[1] = ~~(-handle[1] * scale);
            paste[2] = ~~(curWidth * scale);
            paste[3] = ~~(curHeight * scale);

            this.rotateDestination(engine, ...stamp);
        }
        engine.drawImage(element, 0, 0, curWidth, curHeight, ...paste);
        engine.restore();
    }
};

// `applyFilters` - Internal function - add filters to the Cell's current output.
P.applyFilters = function () {

    const engine = this.engine;

    const image = engine.getImageData(0, 0, this.currentDimensions[0], this.currentDimensions[1]);

    this.preprocessFilters(this.currentFilters);

    const img = filterEngine.action({
        identifier: this.filterIdentifier,
        image: image,
        filters: this.currentFilters
    });

    if (img) engine.putImageData(img, 0, 0);
};


// `stashOutputAction` - Internal function - stash the Cell's current output. While this function can be called at any time, the simplest way to invoke it is to set the Cell's __stashOutput__ flag to true, which will then invoke this function at the end of the compile step of the Display cycle (after any filters have been applied to the cell display).
// + The simplest way to set the stashOutput flag is to call `scrawl.createImageFromCell(cellName_or_cellObject, stashOutputAsAsset_flag)` from the user code.
// + We can limit the area of the cell display to be stashed by setting the Cell's __stashX__, __stashY__, __stashWidth__ and __stashHeight__ values appropriately. These can all be either absolute (positive) number values, or %String number values relative to the Cell element's dimensions.
// + We store the generated imageData object into the Cell object's __stashedImageData__ attribute.
// + If we are also stashing an image, an &lt;img> element will be generated and stored in the Cell object's __stashedImage__ attribute. We also generate an imageAsset wrapper for the object that will have the name `cellname+'-image'`, which gets added to the assets section of the Scrawl-canvas library.
P.stashOutputAction = function () {

    if (this.stashOutput) {

        this.stashOutput = false;

        const { currentDimensions, stashCoordinates, stashDimensions, engine } = this;

        const [cellWidth, cellHeight] = currentDimensions;

        let stashX = (stashCoordinates) ? stashCoordinates[0] : 0,
            stashY = (stashCoordinates) ? stashCoordinates[1] : 0,
            stashWidth = (stashDimensions) ? stashDimensions[0] : cellWidth,
            stashHeight = (stashDimensions) ? stashDimensions[1] : cellHeight;

        // Keep the stashed image within bounds of the Cell's dimensions.
        if (stashWidth.substring || stashHeight.substring || stashX.substring || stashY.substring || stashX || stashY || stashWidth !== cellWidth || stashHeight !== cellHeight) {

            if (stashWidth.substring) stashWidth = (parseFloat(stashWidth) / 100) * cellWidth;
            if (!_isFinite(stashWidth) || stashWidth <= 0) stashWidth = 1;
            if (stashWidth > cellWidth) stashWidth = cellWidth;

            if (stashHeight.substring) stashHeight = (parseFloat(stashHeight) / 100) * cellHeight;
            if (!_isFinite(stashHeight) || stashHeight <= 0) stashHeight = 1;
            if (stashHeight > cellHeight) stashHeight = cellHeight;

            if (stashX.substring) stashX = (parseFloat(stashX) / 100) * cellWidth;
            if (!_isFinite(stashX) || stashX < 0) stashX = 0;
            if (stashX + stashWidth > cellWidth) stashX = cellWidth - stashWidth;

            if (stashY.substring) stashY = (parseFloat(stashY) / 100) * cellHeight;
            if (!_isFinite(stashY) || stashY < 0) stashY = 0;
            if (stashY + stashHeight > cellHeight) stashY = cellHeight - stashHeight;
        }

        // Get the imageData object, and stash it
        engine.save();
        engine.setTransform(1, 0, 0, 1, 0, 0);
        this.stashedImageData = engine.getImageData(stashX, stashY, stashWidth, stashHeight);
        engine.restore();

        // Get the dataUrl String, updating the stashed &lt;img> element with it
        if (this.stashOutputAsAsset) {

            const stashId = this.stashOutputAsAsset.substring ? this.stashOutputAsAsset : `${this.name}-image`;

            this.stashOutputAsAsset = false;

            const mycanvas = requestCell(),
                sourcecanvas = mycanvas.element;

            sourcecanvas.width = stashWidth;
            sourcecanvas.height = stashHeight;

            mycanvas.engine.putImageData(this.stashedImageData, 0, 0);

            if (!this.stashedImage) {

                const control = this.getController();

                if (control) {

                    const that = this;

                    const newimg = document.createElement(IMG);
                    newimg.id = stashId;
                    newimg.alt = `A cached image of the ${this.name} Cell`;

                    newimg.onload = function () {

                        control.canvasHold.appendChild(newimg);
                        that.stashedImage = newimg;
                        importDomImage(`#${stashId}`);
                    };

                    newimg.src = sourcecanvas.toDataURL();
                }
            }
            else this.stashedImage.src = sourcecanvas.toDataURL();

            releaseCell(mycanvas);
        }
    }
};


// `prepareStamp` - Internal function - steps to be performed before the Cell stamps its visual contents onto a Canvas object's base cell's canvas. Will be invoked as part of the Display cycle 'show' functionality.
// + Cells can emulate (much of) the functionality of entity artefacts, in that they can be positioned (start, handle, offset), rotated, scaled and flipped when they stamp themselves on the base cell. They can also be positioned using mimic, pivot, path and mouse functionality.
// + Cells cannot be included in Group objects (which only accept artefacts as members); however drag-and-drop functionality can be emulated by creating a Block and pivot/mimic the Cell to that. Similarly, Block substitutes can be used for hover detection, with their hook functions tailored to pass on the required response to the Cell - see Demo [Canvas-036](../../demo/canvas-036.html).
// + Note that Cells acting as a Canvas object's 'base' cell will position themselves on the displayed Canvas in line with their Canvas controller's 'fit' attribute, disregarding any positional information it may have been given.
P.prepareStamp = function () {

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

    if (this.dirtyScale) this.cleanScale();

    if (this.dirtyDimensions) {

        this.cleanDimensions();
        this.dirtyAssetSubscribers = true;
    }

    if (this.dirtyLock) this.cleanLock();
    if (this.dirtyStart) this.cleanStart();
    if (this.dirtyOffset) this.cleanOffset();
    if (this.dirtyHandle) this.cleanHandle();
    if (this.dirtyRotation) this.cleanRotation();

    if (this.isBeingDragged || this.lockTo.includes(MOUSE)) {

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }

    if (this.dirtyStampPositions) this.cleanStampPositions();
    if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

    if (this.dirtyPathObject) this.cleanPathObject();

    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

    if (this.dirtyAssetSubscribers) {

        this.dirtyAssetSubscribers = false;
        this.notifySubscribers();
    }

    // `prepareStampTabsHelper` is defined in the `mixin/hiddenDomElements.js` file - handles updates to anchor and button objects in the DOM
    this.prepareStampTabsHelper();
};

// `cleanPathObject` - Calculate the Cell's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        const p = this.pathObject = new Path2D();

        const handle = this.currentStampHandlePosition,
            scale = this.currentScale,
            dims = this.currentDimensions;

        const x = -handle[0] * scale,
            y = -handle[1] * scale,
            w = dims[0] * scale,
            h = dims[1] * scale;

        p.rect(x, y, w, h);
    }
};

// `updateHere` - Internal function - get the Cell to update its .here information
P.updateHere = function () {

    const host = this.currentHost;

    if (host) {

        if (!this.here) this.here = {};

        const localHere = this.here;

        const [width, height] = this.currentDimensions;

        localHere.w = width;
        localHere.h = height;
        localHere.x = -10000;
        localHere.y = -10000;
        localHere.active = false;

        const hostHere = host.here;

        if (hostHere && hostHere.active) {

            const {x:hostX, y:hostY} = hostHere;

            if (!this.pathObject || this.dirtyPathObject) this.cleanPathObject();

            const tempCell = requestCell();
            const tempEngine = tempCell.engine;

            const [stampX, stampY] = this.currentStampPosition;

            tempCell.rotateDestination(tempEngine, stampX, stampY, this);

            const active = tempEngine.isPointInPath(this.pathObject, hostX, hostY);

            releaseCell(tempCell);

            localHere.active = active;

            if (active) {

                const [stampHandleX, stampHandleY] = this.currentStampHandlePosition;

                const {flipUpend, flipReverse, scale} = this;
                let roll = this.roll;

                if (scale) {

                    let left = ((hostX - stampX) / scale),
                        top = ((hostY - stampY) / scale);

                    if (flipReverse) left = -left;
                    if (flipUpend) top = -top;

                    if (roll) {

                        if ((flipReverse && !flipUpend) || (!flipReverse && flipUpend)) roll = -roll;

                        const coord = requestCoordinate(left, top);
                        coord.rotate(-roll);

                        [left, top] = coord;

                        releaseCoordinate(coord);
                    }

                    left += stampHandleX;
                    top += stampHandleY;

                    localHere.x = left;
                    localHere.y = top;
                }
            }
        }
    }
};

// `checkEngineScale`
// DPR is detected in the `core/events.js` file, but mainly handled here
// + We scale the cell by DPR - this should be the only time we touch native scale functionality!
// + All the other scaling functionality in SC is handled by computiation - applying the scaling factor to dimensions, start, handle, offset etc values which then get saved in the `current` equivalent attributes
// + Called for every clear, compile and show action
const checkEngineScale = function (engine) {

    if (engine) {

        engine.setTransform(1,0,0,1,0,0);

        if (getIgnorePixelRatio()) engine.scale(1, 1);
        else {

            const dpr = getPixelRatio();
            engine.scale(dpr, dpr);
            return dpr;
        }
    }
    return 1;
};


// #### Factory
export const makeCell = function (items) {

    if (!items) return false;
    return new Cell(items);
};

constructors.Cell = Cell;
