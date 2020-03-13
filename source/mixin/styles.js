
// # Styles mixin

// Note: this mixin needs to be applied after the position mixin in order to work properly

// TODO - documentation


// ## Imports
import { addStrings, defaultNonReturnFunction, mergeOver, xt, mergeDiscard } from '../core/utilities.js';

import { makeCoordinate } from '../factory/coordinate.js';
import { makePalette } from '../factory/palette.js';

export default function (P = {}) {


// ## Define attributes

// All factories using the position mixin will add these to their prototype objects
    let defaultAttributes = {


// (Radial)Gradient styles uses the position mixin to supply attributes and functions for handling the gradient's start and end coordinates.
        start: null,
        end: null,


// Every gradient requires a palette of color stop instructions
        palette: null,


// We don't need to use the entire palette when building a context gradient; we can restrict the palette using these start and end attributes
        paletteStart: 0,
        paletteEnd: 999,


// The cyclePalette attribute tells the Palette object how to handle situations where paletteStart > paletteEnd
// + when false, we reverse the color stops
// + when true, we keep the normal order of color stops and pass through the 1/0 border
        cyclePalette: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// ## Define getter, setter and deltaSetter functions
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;

// TODO - documentation
    G.startX = function () {

        return this.currentStart[0];
    };

    G.startY = function () {

        return this.currentStart[1];
    };


    G.endX = function () {

        return this.currentEnd[0];
    };

    G.endY = function () {

        return this.currentEnd[1];
    };


// TODO - documentation
    S.startX = function (coord) {

        if (coord != null) {

            this.start[0] = coord;
            this.dirtyStart = true;
        }
    };

    S.startY = function (coord) {

        if (coord != null) {

            this.start[1] = coord;
            this.dirtyStart = true;
        }
    };

    S.start = function (x, y) {

        this.setCoordinateHelper('start', x, y);
        this.dirtyStart = true;
    };

    D.startX = function (coord) {

        let c = this.start;
        c[0] = addStrings(c[0], coord);
        this.dirtyStart = true;
    };

    D.startY = function (coord) {

        let c = this.start;
        c[1] = addStrings(c[1], coord);
        this.dirtyStart = true;
    };

    D.start = function (x, y) {

        this.setDeltaCoordinateHelper('start', x, y);
        this.dirtyStart = true;
    };

// TODO - documentation
    S.endX = function (coord) {

        if (coord != null) {

            this.end[0] = coord;
            this.dirtyEnd = true;
        }
    };

    S.endY = function (coord) {

        if (coord != null) {

            this.end[1] = coord;
            this.dirtyEnd = true;
        }
    };

    S.end = function (x, y) {

        this.setCoordinateHelper('end', x, y);
        this.dirtyEnd = true;
    };

    D.endX = function (coord) {

        let c = this.end;
        c[0] = addStrings(c[0], coord);
        this.dirtyEnd = true;
    };

    D.endY = function (coord) {

        let c = this.end;
        c[1] = addStrings(c[1], coord);
        this.dirtyEnd = true;
    };

    D.end = function (x, y) {

        this.setDeltaCoordinateHelper('end', x, y);
        this.dirtyEnd = true;
    };

// TODO - documentation
    S.palette = function (item = {}) {

        if(item.type === 'Palette') this.palette = item;
    };

// TODO - documentation
    S.paletteStart = function (item) {

        if (item.toFixed) {

            this.paletteStart = item;
            
            if(item < 0 || item > 999) this.paletteStart = (item > 500) ? 999 : 0;
        }
    };

    S.paletteEnd = function (item) {

        if (item.toFixed) {

            this.paletteEnd = item;
            
            if (item < 0 || item > 999) this.paletteEnd = (item > 500) ? 999 : 0;
        }
    };

    D.paletteStart = function (item) {

        let p;

        if (item.toFixed) {

            p = this.paletteStart + item;

            if (p < 0 || p > 999) {

                if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
                else p = (item > 500) ? 999 : 0;
            }

            this.paletteStart = p;
        }
    };

    D.paletteEnd = function (item) {

        let p;

        if (item.toFixed) {

            p = this.paletteEnd + item;

            if (p < 0 || p > 999) {

                if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
                else p = (item > 500) ? 999 : 0;
            }

            this.paletteEnd = p;
        }
    };

// TODO - documentation
    S.delta = function (items = {}) {

        if (items) this.delta = mergeDiscard(this.delta, items);
    };



// ## Define functions to be added to the factory prototype



// Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.get = function (item) {

        let getter = this.getters[item];

        if (getter) return getter.call(this);
        else {

            let def = this.defs[item],
                palette = this.palette,
                val;

            if (typeof def !== 'undefined') {

                val = this[item];
                return (typeof val !== 'undefined') ? val : def;
            }

            def = palette.defs[item];

            if (typeof def !== 'undefined') {

                val = palette[item];
                return (typeof val !== 'undefined') ? val : def;
            }
            else return undef;
        }
    };


// Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.set = function (items = {}) {

        if (items) {

            let setters = this.setters,
                defs = this.defs,
                palette = this.palette,
                paletteSetters = (palette) ? palette.setters : {},
                paletteDefs = (palette) ? palette.defs : {};

            Object.entries(items).forEach(([key, value]) => {

                if (key && key !== 'name' && value != null) {

                    let predefined = setters[key],
                        paletteFlag = false;

                    if (!predefined) {

                        predefined = paletteSetters[key];
                        paletteFlag = true;
                    }

                    if (predefined) predefined.call(paletteFlag ? this.palette : this, value);
                    else if (typeof defs[key] !== 'undefined') this[key] = value;
                    else if (typeof paletteDefs[key] !== 'undefined') palette[key] = value;
                }
            }, this);
        }
        return this;
    };


// Overwrites function defined in mixin/base.js - takes into account Palette object attributes
    P.setDelta = function (items = {}) {

        if (items) {

            let setters = this.deltaSetters,
                defs = this.defs,
                palette = this.palette,
                paletteSetters = (palette) ? palette.deltaSetters : {},
                paletteDefs = (palette) ? palette.defs : {};

            Object.entries(items).forEach(([key, value]) => {

                if (key && key !== 'name' && value != null) {

                    let predefined = setters[key],
                        paletteFlag = false;

                    if (!predefined) {

                        predefined = paletteSetters[key];
                        paletteFlag = true;
                    }

                    if (predefined) predefined.call(paletteFlag ? this.palette : this, value);
                    else if (typeof defs[key] != 'undefined') this[key] = addStrings(this[key], value);
                    else if (typeof paletteDefs[key] !== 'undefined') palette[key] = addStrings(this[key], value);
                }
            }, this);
        }
        return this;
    };

// TODO - documentation
    P.setCoordinateHelper = function (label, x, y) {

        let c = this[label];

        if (Array.isArray(x)) {

            c[0] = x[0];
            c[1] = x[1];
        }
        else {

            c[0] = x;
            c[1] = y;
        }
    };

    P.setDeltaCoordinateHelper = function (label, x, y) {

        let c = this[label],
            myX = c[0],
            myY = c[1];

        if (Array.isArray(x)) {

            c[0] = addStrings(myX, x[0]);
            c[1] = addStrings(myY, x[1]);
        }
        else {

            c[0] = addStrings(myX, x);
            c[1] = addStrings(myY, y);
        }
    };

// TODO - documentation
    P.updateByDelta = function () {

        this.setDelta(this.delta);

        return this;
    };

// TODO - documentation
    P.stylesInit = function (items = {}) {

        this.makeName(items.name);
        this.register();

        this.gradientArgs = [];

        this.start = makeCoordinate();
        this.end = makeCoordinate();

        this.currentStart = makeCoordinate();
        this.currentEnd = makeCoordinate();

        this.set(this.defs);

        this.palette = makePalette({
            name: `${this.name}_palette`,
        });

        this.delta = {};

        this.set(items);
    };


// This is where we have to calculate all the stuff necessary to get the ctx gradient object attached to the ctx, so we can use it for upcoming fillStyle and strokeStyle settings on the engine. We have to create the ctx gradient and return it. 
    P.getData = function (entity, cell, isFill) {

        // Step 1: see if the palette is dirty, from having colors added/deleted/changed
        if(this.palette && this.palette.dirtyPalette) this.palette.recalculate();

        // Step 2: recalculate current start and end points
        this.cleanStyle(entity, cell, isFill);

        // Step 3: finalize the coordinates to use for creating the gradient in relation to the current entity's position and requirements on the canvas
        this.finalizeCoordinates(entity, isFill);

        // Step 4: create, populate and return gradient/pattern object
        return this.buildStyle(cell);
    };

// TODO - documentation
    P.cleanStyle = function (entity = {}, cell = {}, isFill) {

        let dims, w, h, scale;

        if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {

            dims = entity.currentDimensions;
            scale = entity.currentScale;

            w = dims[0] * scale; 
            h = dims[1] * scale; 
        }
        else {

            dims = cell.currentDimensions;
            w = dims[0]; 
            h = dims[1]; 
        }

        this.cleanPosition(this.currentStart, this.start, [w, h]);
        this.cleanPosition(this.currentEnd, this.end, [w, h]);
        this.cleanRadius(w);
    };

// TODO - documentation
    P.cleanPosition = function (current, source, dimensions) {

        let val, dim;

        for (let i = 0; i < 2; i++) {

            val = source[i];
            dim = dimensions[i];

            if (val.toFixed) current[i] = val;
            else if (val === 'left' || val === 'top') current[i] = 0;
            else if (val === 'right' || val === 'bottom') current[i] = dim;
            else if (val === 'center') current[i] = dim / 2;
            else current[i] = (parseFloat(val) / 100) * dim;
        }
    };

// TODO - documentation
    P.finalizeCoordinates = function (entity = {}, isFill) {

        let currentStart = this.currentStart,
            currentEnd = this.currentEnd,
            entityStampPosition = entity.currentStampPosition,
            entityStampHandlePosition = entity.currentStampHandlePosition,
            entityScale = entity.currentScale,
            correctX, correctY;

        if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {

            correctX = -(entityStampHandlePosition[0] * entityScale) || 0; 
            correctY = -(entityStampHandlePosition[1] * entityScale) || 0; 
        }
        else {

            correctX = -entityStampPosition[0] || 0; 
            correctY = -entityStampPosition[1] || 0; 
        }

        if (entity.flipReverse) correctX = -correctX;
        if (entity.flipUpend) correctY = -correctY;

        this.updateGradientArgs(correctX, correctY);
    };


// Do stuff here for startRadius, endRadius, producing local variants - overwritten in factory-radialgradient.js file
    P.cleanRadius = defaultNonReturnFunction;


// Just in case something went wrong with loading other styles files, which must overwrite this function, we can return transparent color here
    P.buildStyle = function (cell) {

        return 'rgba(0,0,0,0)';
    };

// TODO - documentation
    P.addStopsToGradient = function (gradient, start, stop, cycle) {

        if (this.palette) return this.palette.addStopsToGradient(gradient, start, stop, cycle);

        return gradient;
    };

// TODO - documentation
    P.updateColor = function (index, color) {

        if (this.palette) this.palette.updateColor(index, color);

        return this;
    };

// TODO - documentation
    P.removeColor = function (index) {

        if (this.palette) this.palette.removeColor(index);

        return this;
    };

// Return the prototype
    return P;
};
