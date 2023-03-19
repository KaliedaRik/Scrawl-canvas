// # Cell key functions mixin
// This mixin defines shared functions for the Cell wrapper and CellFragment object


// #### Imports
import { mergeOver, mergeDiscard, xt, Ωempty, λthis, λnull, radian } from '../core/utilities.js';
import { styles, stylesnames, cell, cellnames } from '../core/library.js';
import { getPixelRatio, getIgnorePixelRatio } from "../core/events.js";
// import { makeState } from './state.js';


// #### Export function
export default function (P = Ωempty) {

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

        const items = this.state.defs,
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

            const changes = entityState.getChanges(entity, state),
                action = this.setEngineActions,
                stylesArray = this.stylesArray;

            if (Object.keys(changes).length) {

                const engine = this.engine;

                for (const item in changes) {

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

        const host = this.getHost();

        if (host && host.domElement) {

            const em = window.getComputedStyle(host.domElement),
                rem = window.getComputedStyle(document.documentElement);

            return [parseFloat(em.fontSize), parseFloat(rem.fontSize), window.innerWidth, window.innerHeight];
        }
        return false;
    }


    // `getEntityHits` - Returns an array of entity Objects responding 'true' to a checkHit call on them, for the Cell's current `.here` attribute coordinates. Used in particular with `Canvas.cascadeEventAction()` function
    P.getEntityHits = function () {

        const response = [],
            resultNames = [];

        let results = [];

        if (this.groupBuckets) {

            this.groupBuckets.forEach(grp => {
                if (grp.visibility) results.push(grp.getAllArtefactsAt(this.here));
            }, this);
        }

        if (results.length) {

            results = results.reduce((a, v) => a.concat(v), []);

            results.forEach(item => {

                const art = item.artefact;

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

        const self = (entity) ? entity : this,
            mimic = self.mimic,
            pivot = self.pivot;

        let reverse, upend,
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

            const cos = Math.cos(rotation),
                sin = Math.sin(rotation);

            engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), x, y);
        }
        else engine.setTransform(reverse, 0, 0, upend, x, y);

        return this;
    };



// Return the prototype
    return P;
};
