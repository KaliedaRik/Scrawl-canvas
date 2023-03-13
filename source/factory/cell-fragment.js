// # Cell-fragment factory
// Create a highly reduced CellFragment which supplies the cell pool


// #### Imports
import { artefact, asset, tween, constructors, styles, stylesnames, cell, cellnames, group, canvas } from '../core/library.js';

import { generateUniqueString, isa_canvas, mergeOver, λthis, λnull, Ωempty, radian } from '../core/utilities.js';

import { scrawlCanvasHold } from '../core/document.js';

import { getPixelRatio, getIgnorePixelRatio } from "../core/events.js";

import { makeState } from './state.js';
import { importDomImage } from './imageAsset.js';

import baseMix from '../mixin/base.js';


// #### CellFragment constructor
const CellFragment = function (items = Ωempty) {

    const element = this.element = document.createElement('canvas');
    const engine = this.engine = element.getContext('2d', {
        willReadFrequently: true,
    });

    element.width = 1;
    element.height = 1;

    const state = this.state = makeState({ engine });

    this.set(this.poolDefs);

    state.setStateFromEngine(this.engine);

    return this;
};


// #### CellFragment prototype
let P = CellFragment.prototype = Object.create(Object.prototype);
P.type = 'CellFragment';


// #### Mixins
P = baseMix(P);


// #### CellFragment attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

// __clearAlpha__ - a Number with a value between 0 and 1. When not zero, the cell will not clear itself; rather it will copy its current contents, clear itself, set its globalAlpha to this value, copy back its contents (now faded) and then restore its globalAlpha value
    clearAlpha: 0,


// Non-base Cells will stamp themselves onto the 'base' Cell as part of the Display cycle's show stage. We can mediate this action by setting the Cell's __alpha__ and __composite__ attributes to valid Rendering2DContext `globalAlpha` and `globalCompositeOperation` values.
    alpha: 1,
    composite: 'source-over',

// We can also scale the Cell's size in the displayed Canvas by setting the __scale__ attribute to an appropriate value.
    scale: 1,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet/Clone management
// This functionality is disabled for CellFragments objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;


// #### Kill functionality
// P.factoryKill = function () {
// };

// #### Get, Set, deltaSet
let G = P.getters, 
    S = P.setters,
    D = P.deltaSetters;


// `get` - overwrites the mixin/position function
P.get = function (item) {

    let getter = this.getters[item];

    if (getter) return getter.call(this);

    else {

        let def = this.defs[item],
            state = this.state,
            val;

        if (def != null) {

            val = this[item];
            return (val != null) ? val : def;
        }

        def = state.defs[item];

        if (def != null) {

            val = state[item];
            return (val != null) ? val : def;
        }
        return undef;
    }
};

// // `width`
// G.width = function () {};
// S.width = function (val) {};

// // `height`
// G.height = function () {};
// S.height = function (val) {};

// G.dimensions = function () {};
// S.dimensions = function (w, h) {};

// // Internal setters
// S.source = function () {};
// S.engine = function (item) {};
// S.state = function (item) {};

// S.element = function (item) {};

// S.backgroundColor = function (item) {};


// // __Stash coordinates and dimensions__ - which are stored in Coordinate arrays - allow us to store, and export to an image asset, a portion of the Cell's current display which can then be used (for instance) by Pattern styles. 
// // + Scrawl-canvas supplies the following _pseudo-attributes_ for dealing with the stash start coordinate (`stashX`, `stashY`) and dimensions (`stashWidth`, `stashHeight`)
// // + Each of these values can be either absolute px Numbers, or relative (to the Cell's own dimensions) '%' Strings
// S.stashX = function (val) {

//     if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
//     this.stashCoordinates[0] = val;
// };
// S.stashY = function (val) {

//     if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
//     this.stashCoordinates[1] = val;
// };
// S.stashWidth = function (val) {

//     if (!this.stashDimensions) {

//         let dims = this.currentDimensions;
//         this.stashDimensions = [dims[0], dims[1]];
//     }
//     this.stashDimensions[0] = val;
// };
// S.stashHeight = function (val) {

//     if (!this.stashDimensions) {

//         let dims = this.currentDimensions;
//         this.stashDimensions = [dims[0], dims[1]];
//     }
//     this.stashDimensions[1] = val;
// };
// D.stashX = function (val) {

//     if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

//     let c = this.stashCoordinates;
//     c[0] = addStrings(c[0], val);
// };
// D.stashY = function (val) {

//     if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

//     let c = this.stashCoordinates;
//     c[1] = addStrings(c[1], val);
// };
// D.stashWidth = function (val) {

//     if (!this.stashDimensions) {

//         let dims = this.currentDimensions;
//         this.stashDimensions = [dims[0], dims[1]];
//     }

//     let c = this.stashDimensions;
//     c[0] = addStrings(c[0], val);
// };
// D.stashHeight = function (val) {

//     if (!this.stashDimensions) {

//         let dims = this.currentDimensions;
//         this.stashDimensions = [dims[0], dims[1]];
//     }

//     let c = this.stashDimensions;
//     c[1] = addStrings(c[1], val);
// };

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


// // `smoothFont` - handle this directly; don't save the attribute state
// S.smoothFont = function (item) {

//     const { element } = this;

//     if (element) {

//         const { style } = element;

//         if (style) {

//             if (item) {
//                 style['webkitFontSmoothing'] = 'auto';
//                 style['mozOsxFontSmoothing'] = 'auto';
//                 style['smoothFont'] = 'auto';
//             }
//             else {
//                 style['webkitFontSmoothing'] = 'none';
//                 style['mozOsxFontSmoothing'] = 'grayscale';
//                 style['smoothFont'] = 'never';
//             }
//         }
//     }
// };


// #### Prototype functions

// // `checkSource` - internal function
// P.checkSource = function (width, height) {};

// // `getData` - internal function, invoked when a Cell wrapper is used as an entity's pattern style
// P.getData = function (entity, cell) {};

// // `updateArtefacts` - passes the __items__ argument object through to each of the Cell's Groups for forwarding to their artefacts' `setDelta` function
// P.updateArtefacts = function (items = Ωempty) {};

// // `cleanDimensionsAdditionalActions` - overwrites mixin/position function:
// // + Updates the Cell's &lt;canvas> element's dimensions
// // + Restores the render engine's attributes to current cell values (because the resize wipes them to default values)
// // + Asks the Canvas controller to trigger an update to the Cell's `here` object
// // + Tells all associated artefacts that the Cell's dimensions have changed
// P.cleanDimensionsAdditionalActions = function() {};


// // `notifySubscriber` - Overrides mixin/asset.js function
// P.notifySubscriber = function (sub) {};


// // `subscribeAction` - Overrides mixin/asset.js function
// P.subscribeAction = function (sub = {}) {};

// // `updateControllerCells` - internal function: ask the Cell's Canvas controller to review/update its cells data
// P.updateControllerCells = function () {};

// The following functions set the Cell wrapper's &lt;canvas> element's CanvasRenderingContext2D engine's attributes to match a given set of values

// `setEngineFromState` - internal function: set engine to match this Cell's State object's attribute values
P.setEngineFromState = function (engine) {

    const state = this.state,
        stateKeys = state.allKeys,
        stateKeysLen = stateKeys.length;

    let i, iz, key, eVal, sVal;

    for (i = 0; i < stateKeysLen; i++) {

        key = stateKeys[i];
        eVal = engine[key];
        sVal = state[key];

        if (key === 'lineDash') {

            engine.lineDash = sVal;
            engine.setLineDash(engine.lineDash);
        }
        else if (eVal !== sVal) engine[key] = sVal;
    }
    if (engine.textAlign !== 'left') engine.textAlign = 'left';
    if (engine.textBaseline !== 'top') engine.textBaseline = 'top';

    return this;
};

// `setToDefaults` - internal function: set engine to match the State Factory's default attribute values
P.setToDefaults = function () {

    let items = this.state.defs,
        state = this.state,
        engine = this.engine,
        isArray = Array.isArray;

    Object.entries(items).forEach(([key, value]) => {

        if (key === 'lineDash') {

            if (!isArray(engine.lineDash)) engine.lineDash = [];
            else engine.lineDash.length = 0;

            if (!isArray(state.lineDash)) state.lineDash = [];
            else state.lineDash.length = 0;
        }
        else {

            engine[key] = value;
            state[key] = value;
        }
    });

    engine.textAlign = state.textAlign = 'left';
    engine.textBaseline = state.textBaseline = 'top';

    return this;
};

// `setEngine` - internal function: set engine to match the entity object's State attribute values
P.stylesArray = ['Gradient', 'RadialGradient', 'Pattern'];
P.setEngine = function (entity) {

    const state = this.state,
        entityState = entity.state;

    if (entityState) {

        let engine, item,
            changes = entityState.getChanges(entity, state),
            action = this.setEngineActions,
            stylesArray = this.stylesArray;

        if (Object.keys(changes).length) {

            engine = this.engine;

            for (item in changes) {

                action[item](changes[item], engine, stylesArray, entity, this);
                state[item] = changes[item];
            }
        }
    }
    return entity;
};

// __setEngineActions__ - an Object containing functions for updating the engine's attributes; used by `setEngine`
P.setEngineActions = {

    fillStyle: function (item, engine, stylesArray, entity, layer) {

        if (item.substring) {

            let brokenStyle = false;

            if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
            else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

            if (brokenStyle) {
                
                entity.state.fillStyle = brokenStyle;
                engine.fillStyle = brokenStyle.getData(entity, layer);
            }
            else engine.fillStyle = item;
        }
        else engine.fillStyle = item.getData(entity, layer);
    },

    filter: function (item, engine) {
        engine.filter = item;
    },

    font: function (item, engine) {
        engine.font = item;
    },

    globalAlpha: function (item, engine) {
        engine.globalAlpha = item;
    },

    globalCompositeOperation: function (item, engine) {
        engine.globalCompositeOperation = item;
    },

    imageSmoothingEnabled: function (item, engine) {
        engine.imageSmoothingEnabled = item;
    },

    imageSmoothingQuality: function (item, engine) {
        engine.imageSmoothingQuality = item;
    },

    lineCap: function (item, engine) {
        engine.lineCap = item;
    },

    lineDash: function (item, engine) {
        engine.lineDash = item;
        if (engine.setLineDash) engine.setLineDash(item);
    },

    lineDashOffset: function (item, engine) {
        engine.lineDashOffset = item;
    },

    lineJoin: function (item, engine) {
        engine.lineJoin = item;
    },

    lineWidth: function (item, engine) {
        engine.lineWidth = item;
    },

    miterLimit: function (item, engine) {
        engine.miterLimit = item;
    },

    shadowBlur: function (item, engine) {
        engine.shadowBlur = item;
    },

    shadowColor: function (item, engine) {
        engine.shadowColor = item;
    },

    shadowOffsetX: function (item, engine) {
        engine.shadowOffsetX = item;
    },

    shadowOffsetY: function (item, engine) {
        engine.shadowOffsetY = item;
    },

    strokeStyle: function (item, engine, stylesArray, entity, layer) {

        if (item.substring) {

            let brokenStyle = false;

            if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
            else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

            if (brokenStyle) {
                
                entity.state.strokeStyle = brokenStyle;
                engine.strokeStyle = brokenStyle.getData(entity, layer);
            }
            else engine.strokeStyle = item;
        }
        else engine.strokeStyle = item.getData(entity, layer);
    },
};

// The following functions are used as part of entity object `stamp` functionality - specifically for those with a __method__ whose appearance is affected by shadows, and for the `clear` method
// + Scrawl-canvas, for the most part, avoids using engine.save() and engine.restore() functionality, instead preferring to keep track of engine state in State objects. 
// + When clearing and restoring shadows - a frequent operation given Scrawl-canvas functionality around stamping methods - both the Cell's state object and the Canvas context engine need to be updated with the necessary data 
// + The same reasoning holds when setting up the context engine to 'clear' an entity from the canvas display instead of stamping it onto the canvas

// `clearShadow`
P.clearShadow = function () {

    this.engine.shadowOffsetX = 0.0;
    this.engine.shadowOffsetY = 0.0;
    this.engine.shadowBlur = 0.0;
    this.state.shadowOffsetX = 0.0;
    this.state.shadowOffsetY = 0.0;
    this.state.shadowBlur = 0.0;

    return this;
};

// `restoreShadow`
P.restoreShadow = function (entity) {

    let state = entity.state;

    this.engine.shadowOffsetX = state.shadowOffsetX;
    this.engine.shadowOffsetY = state.shadowOffsetY;
    this.engine.shadowBlur = state.shadowBlur;
    this.state.shadowOffsetX = state.shadowOffsetX;
    this.state.shadowOffsetY = state.shadowOffsetY;
    this.state.shadowBlur = state.shadowBlur;

    return this;
};

// `setToClearShape`
P.setToClearShape = function () {

    this.engine.fillStyle = 'rgb(0 0 0 / 0)';
    this.engine.strokeStyle = 'rgb(0 0 0 / 0)';
    this.engine.shadowColor = 'rgb(0 0 0 / 0)';
    this.state.fillStyle = 'rgb(0 0 0 / 0)';
    this.state.strokeStyle = 'rgb(0 0 0 / 0)';
    this.state.shadowColor = 'rgb(0 0 0 / 0)';

    return this;
};

// `saveEngine`, `restoreEngine` - save and restore the Cell wrapper's &lt;canvas> element's CanvasRenderingContext2D engine's current state to/from a stack
P.saveEngine = function () {

    this.engine.save();
    return this;
};

P.restoreEngine = function () {

    this.engine.restore();
    return this;
};

// `getComputedFontSizes` - internal function - the Cell wrapper gets passed by Phrase entitys to its fontAttributes object, which then invokes it when calculating font sizes
P.getComputedFontSizes = function () {

    let host = this.getHost();

    if (host && host.domElement) {

        let em = window.getComputedStyle(host.domElement),
            rem = window.getComputedStyle(document.documentElement);

        return [parseFloat(em.fontSize), parseFloat(rem.fontSize), window.innerWidth, window.innerHeight];
    }
    return false;
}


// #### Display cycle functionality
// This functionality is triggered by the Cell's Canvas wrapper controller

// `checkEngineScale`
// DPR is detected in the `core/events.js` file, but mainly handled here
// + We scale the cell by DPR - this should be the only time we touch native scale functionality!
// + All the other scaling functionality in SC is handled by computiation - applying the scaling factor to dimensions, start, handle, offset etc values which then get saved in the `current` equivalent attributes
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

// // `clear`
// P.clear = function () {};

// // `compile`
// P.compile = function(){};

// // `show` - Note that functionality here differs for __base cells__ and other Cell wrappers
// P.show = function () {};


// // `applyFilters` - Internal function - add filters to the Cell's current output.
// P.applyFilters = function () {};


// // `stashOutputAction` - Internal function - stash the Cell's current output. While this function can be called at any time, the simplest way to invoke it is to set the Cell's __stashOutput__ flag to true, which will then invoke this function at the end of the compile step of the Display cycle (after any filters have been applied to the cell display).
// // + The simplest way to set the stashOutput flag is to call `scrawl.createImageFromCell(cellName_or_cellObject, stashOutputAsAsset_flag)` from the user code.
// // + We can limit the area of the cell display to be stashed by setting the Cell's __stashX__, __stashY__, __stashWidth__ and __stashHeight__ values appropriately. These can all be either absolute (positive) number values, or %String number values relative to the Cell element's dimensions.
// // + We store the generated imageData object into the Cell object's __stashedImageData__ attribute.
// // + If we are also stashing an image, an &lt;img> element will be generated and stored in the Cell object's __stashedImage__ attribute. We also generate an imageAsset wrapper for the object that will have the name `cellname+'-image'`, which gets added to the assets section of the Scrawl-canvas library.
// P.stashOutputAction = function () {

//     if (this.stashOutput) {

//         this.stashOutput = false;

//         let { currentDimensions, stashCoordinates, stashDimensions, engine } = this;

//         let [cellWidth, cellHeight] = currentDimensions;

//         let stashX = (stashCoordinates) ? stashCoordinates[0] : 0, 
//             stashY = (stashCoordinates) ? stashCoordinates[1] : 0, 
//             stashWidth = (stashDimensions) ? stashDimensions[0] : cellWidth, 
//             stashHeight = (stashDimensions) ? stashDimensions[1] : cellHeight;

//         // Keep the stashed image within bounds of the Cell's dimensions.
//         if (stashWidth.substring || stashHeight.substring || stashX.substring || stashY.substring || stashX || stashY || stashWidth !== cellWidth || stashHeight !== cellHeight) {

//             if (stashWidth.substring) stashWidth = (parseFloat(stashWidth) / 100) * cellWidth;
//             if (isNaN(stashWidth) || stashWidth <= 0) stashWidth = 1;
//             if (stashWidth > cellWidth) stashWidth = cellWidth;

//             if (stashHeight.substring) stashHeight = (parseFloat(stashHeight) / 100) * cellHeight;
//             if (isNaN(stashHeight) || stashHeight <= 0) stashHeight = 1;
//             if (stashHeight > cellHeight) stashHeight = cellHeight;

//             if (stashX.substring) stashX = (parseFloat(stashX) / 100) * cellWidth;
//             if (isNaN(stashX) || stashX < 0) stashX = 0;
//             if (stashX + stashWidth > cellWidth) stashX = cellWidth - stashWidth;

//             if (stashY.substring) stashY = (parseFloat(stashY) / 100) * cellHeight;
//             if (isNaN(stashY) || stashY < 0) stashY = 0;
//             if (stashY + stashHeight > cellHeight) stashY = cellHeight - stashHeight;
//         }

//         // Get the imageData object, and stash it
//         engine.save();
//         engine.setTransform(1, 0, 0, 1, 0, 0);
//         this.stashedImageData = engine.getImageData(stashX, stashY, stashWidth, stashHeight);
//         engine.restore();

//         // Get the dataUrl String, updating the stashed &lt;img> element with it
//         if (this.stashOutputAsAsset) {

//             const stashId = this.stashOutputAsAsset.substring ? this.stashOutputAsAsset : `${this.name}-image`;

//             this.stashOutputAsAsset = false;

//             let sourcecanvas, mycanvas;
                
//             mycanvas = requestCell();
//             sourcecanvas = mycanvas.element;

//             sourcecanvas.width = stashWidth;
//             sourcecanvas.height = stashHeight;

//             mycanvas.engine.putImageData(this.stashedImageData, 0, 0);

//             if (!this.stashedImage) {

//                 let newimg = this.stashedImage = document.createElement('img');

//                 newimg.id = stashId;

//                 newimg.onload = function () {

//                     scrawlCanvasHold.appendChild(newimg);
//                     importDomImage(`#${stashId}`);
//                 };

//                 newimg.src = sourcecanvas.toDataURL();
//             }
//             else this.stashedImage.src = sourcecanvas.toDataURL();

//             releaseCell(mycanvas);
//         }
//     }
// };


// // `getHost` - Internal function - get a reference to the Cell's current host (where it will be stamping itself as part of the Display cycle).
// // + Note that Cells can (in theory: not tested yet) belong to more than one Canvas object Group - they can be used in multiple &lt;canvas> elements, thus the need to check which canvas is the current host at this point in the Display cycle.
// P.getHost = function () {

//     return false;
// };


// // `updateBaseHere` - Internal function - keeping the Canvas object's 'base' Cell's `.here` attribute up-to-date with accurate mouse/pointer/touch cursor data
// P.updateBaseHere = function (controllerHere, fit) {};


// // `prepareStamp` - Internal function - steps to be performed before the Cell stamps its visual contents onto a Canvas object's base cell's canvas. Will be invoked as part of the Display cycle 'show' functionality.
// // + Cells can emulate (much of) the functionality of entity artefacts, in that they can be positioned (start, handle, offset), rotated, scaled and flipped when they stamp themselves on the base cell. They can also be positioned using mimic, pivot, path and mouse functionality.
// // + Cells cannot be included in Group objects (which only accept artefacts as members); however drag-and-drop functionality can be emulated by creating a Block and pivot/mimic the Cell to that. Similarly, Block substitutes can be used for hover detection, with their hook functions tailored to pass on the required response to the Cell - see Demo [Canvas-036](../../demo/canvas-036.html).
// // + Note that Cells acting as a Canvas object's 'base' cell will position themselves on the displayed Canvas in line with their Canvas controller's 'fit' attribute, disregarding any positional information it may have been given.
// P.prepareStamp = function () {};


// `getEntityHits` - Returns an array of entity Objects responding 'true' to a checkHit call on them, for the Cell's current `.here` attribute coordinates. Used in particular with `Canvas.cascadeEventAction()` function
P.getEntityHits = function () {

    let response = [],
        results = [],
        resultNames = [];

    if (this.groupBuckets) {

        this.groupBuckets.forEach(grp => {
            if (grp.visibility) results.push(grp.getAllArtefactsAt(this.here));
        }, this);
    }

    if (results.length) {

        results = results.reduce((a, v) => a.concat(v), []);

        results.forEach(item => {

            let art = item.artefact;

            if (art.visibility && resultNames.indexOf(art.name) < 0) {

                resultNames.push(art.name);
                response.push(art);
            }
        })
    }
    return response;
};


// `rotateDestination` - internal function, called by entity objects about to stamp themselves onto the Cell.
// + entity stamp functionality works by performing a `setTransform` action on the Cell engine so that engine coordinates [0, 0] equal the entity's `currentStampPosition` coordinates, alongside any directionality (`flipReverse`, `flipUpend`) and rotational (`roll`) changes necessary
// + doing it this way saves a massive amount of calculation that is otherwise required to correctly position the entity in the display
P.rotateDestination = function (engine, x, y, entity) {

    let self = (entity) ? entity : this,
        mimic = self.mimic,
        pivot = self.pivot,
        reverse, upend,
        rotation = self.currentRotation;

    if (mimic && mimic.name && self.useMimicFlip) {

        reverse = (mimic.flipReverse) ? -1 : 1;
        upend = (mimic.flipUpend) ? -1 : 1;
    }
    else {

        reverse = (self.flipReverse) ? -1 : 1;
        upend = (self.flipUpend) ? -1 : 1;
    }

    if (mimic && mimic.name && self.useMimicRotation) {

        rotation = mimic.currentRotation;
    }
    else if (pivot && pivot.name && self.addPivotRotation) {

        rotation = pivot.currentRotation;
    }

    if (rotation) {

        rotation *= radian;

        let cos = Math.cos(rotation),
            sin = Math.sin(rotation);

        engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), x, y);
    }
    else engine.setTransform(reverse, 0, 0, upend, x, y);

    return this;
};


// #### Cell pool
// A number of processes - for instance collision functionality, and applying filters to entitys and groups - require the use of a &lt;canvas> element and its CanvasRenderingContext2D engine. Rather than generate these canvas elements on the fly, we store them in a pool, to help make the code more efficiant.
//
// To use a pool cell, request it using the exposed __requestCell__ function.
//
// IT IS IMPERATIVE that requested cells are released once work with them completes, using the __releaseCell__ function. Failure to do this leads to impaired performance as Javascript creates new canvas elements (often in multiples of 60 per second) which need to be garbage collected by the Javascript engine, thus leading to increasingly shoddy performance the longer the animation runs.
const cellPool = [];

P.poolDefs = {
    element: null,
    engine: null,
    state: null,
    width: 300,
    height: 100,
    alpha: 1,
    composite: 'source-over',
}

// `Exported function` - __requestCell__
export const requestCell = function () {

    if (!cellPool.length) {

        cellPool.push(new CellFragment({
            name: `pool_${generateUniqueString()}`,
            isPool: true
        }));
    }

    let c = cellPool.shift();
    c.engine.save();

    return c;
};

// `Exported function` - __releaseCell__
export const releaseCell = function (c) {

    if (c && c.type === 'CellFragment') {

        c.engine.restore();
        cellPool.push(c);
    }
};
