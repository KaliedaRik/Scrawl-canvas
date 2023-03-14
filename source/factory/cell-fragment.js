// # Cell-fragment factory
// Create a highly reduced CellFragment which supplies the cell pool


// #### Imports
import { styles, stylesnames, cell, cellnames } from '../core/library.js';

import { generateUniqueString, mergeOver, λthis, λnull, Ωempty, radian } from '../core/utilities.js';

import { getPixelRatio, getIgnorePixelRatio } from "../core/events.js";

import { makeState } from './state.js';

import baseMix from '../mixin/base.js';


const poolDefs = {
    element: null,
    engine: null,
    state: null,
    width: 300,
    height: 100,
    alpha: 1,
    composite: 'source-over',
}

// #### CellFragment constructor
const CellFragment = function (name) {

    this.name = name;

    const element = this.element = document.createElement('canvas');
    const engine = this.engine = element.getContext('2d', {
        willReadFrequently: true,
    });

    element.width = 1;
    element.height = 1;

    const state = this.state = makeState({ engine });

    this.set(poolDefs);

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
// None required

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


// #### Prototype functions
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

let count = 0;

// `Exported function` - __requestCell__
export const requestCell = function () {

    if (!cellPool.length) cellPool.push(new CellFragment(`pool_${count++}`));

    let c = cellPool.shift();
    c.engine.save();

    // console.log(c.name, c.element.width, c.element.height);
    return c;
};

// `Exported function` - __releaseCell__
export const releaseCell = function (c) {

    if (c && c.type === 'CellFragment') {

        c.engine.restore();
        cellPool.push(c);
    }
};
