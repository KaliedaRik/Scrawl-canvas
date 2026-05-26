// # RadialGradient factory
// Scrawl-canvas RadialGradient objects implement the Canvas API's [createRadialGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient) method. The resulting [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.


// #### Imports
import { constructors } from '../core/library.js';

import { addStrings, doCreate, isa_number, mergeOver, pushUnique, Ωempty } from '../helper/utilities.js';

import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';

// Shared constants
import { BLANK, STYLES, T_RADIAL_GRADIENT } from '../helper/shared-vars.js';

// Local constants
// + None defined


// #### RadialGradient constructor
const RadialGradient = function (items = Ωempty) {

    this.currentStartRadius = 0;
    this.currentEndRadius = 0;

    this.stylesInit(items);
    return this;
};


// #### RadialGradient prototype
const P = RadialGradient.prototype = doCreate();
P.type = T_RADIAL_GRADIENT;
P.lib = STYLES;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);
stylesMix(P);


// #### RadialGradient attributes
const defaultAttributes = {

// RadialGradients calculate their gradients spanning between two circles, whose sizes are determined by the `startRadius` and `endRadius` attributes. Values can be:
// + __Absolute__ - Numbers, measured in pixels.
// + __Relative__ - String% - as a percentage of the containing Cell's `width`
    startRadius: 0,
    endRadius: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);

// In addition to the attributes defined in the __base__ and __styles__ mixins, Gradients also pass through Palette attributes to their Palette object.
//
// Attributes from __base__ mixin:
// + `name`
//
// Attributes from __styles__ mixin:
// + `start`
// + `startX`
// + `startY`
// + `end`
// + `endX`
// + `endY`
// + `palette`
// + `paletteStart`
// + `paletteEnd`
// + `cyclePalette`
//
// Attributes from the __palette__ factory:
// + `colors`
// + `cyclic`

// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['palette']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// The getter functions `myradialgradient.get('startRadius')` and `myradialgradient.get('endRadius')` return the current radius values as Numbers, measuring pixels
G.startRadius = function () {

    return this.currentStartRadius;
};
G.endRadius = function () {

    return this.currentEndRadius;
};

// Both `startRadius` and `endRadius` attributes can be set and deltaSet
S.startRadius = function (item) {

    this.startRadius = item;
    this.updateSubscribers();
};
S.endRadius = function (item) {

    this.endRadius = item;
    this.updateSubscribers();
};
D.startRadius = function (item) {

    this.startRadius = addStrings(this.startRadius, item);
    this.updateSubscribers();
};
D.endRadius = function (item) {

    this.endRadius = addStrings(this.endRadius, item);
    this.updateSubscribers();
};


// #### Prototype functions

// `cleanRadius` - internal function to calculate the current radius values (in px) of the start and end radii
P.cleanRadius = function (width) {

    const convertLength = (val, len) => {

        if (isa_number(val)) return val;

        else {

            val = parseFloat(val);

            if (!isa_number(val)) return 0;

            return ( val / 100) * len;
        }
    };

    this.currentStartRadius = (width) ? convertLength(this.startRadius, width) : this.defs.startRadius;
    this.currentEndRadius = (width) ? convertLength(this.endRadius, width) : this.defs.endRadius;
};

// `buildStyle` - internal function: creates the radial gradient on the Cell's CanvasRenderingContext2D engine, and then adds the color stops to it.
P.buildStyle = function (cell, myentity) {

    if (cell) {

        myentity.useGradientCache = false;

        const engine = cell.engine;

        if (engine) {

            const gradient = engine.createRadialGradient(...this.gradientArgs);

            return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
        }
    }
    return BLANK;
};

// `updateGradientArgs` - internal function
P.updateGradientArgs = function (x, y, roll, scale) {

    const gradientArgs = this.gradientArgs,
        currentStart = this.currentStart,
        currentEnd = this.currentEnd;

    let sx = currentStart[0] + x,
        sy = currentStart[1] + y,
        ex = currentEnd[0] + x,
        ey = currentEnd[1] + y,
        sr = this.currentStartRadius,
        er = this.currentEndRadius;

    // check to correct situation where coordinates represent a '0 x 0' box - which will cause errors in some browsers
    if (sx === ex && sy === ey && sr === er) er++;

    if (roll) {

        const coord = requestCoordinate();

        [sx, sy] = coord.setFromArray([sx, sy]).rotate(roll);
        [ex, ey] = coord.setFromArray([ex, ey]).rotate(roll);

        releaseCoordinate(coord);
    }
    if (scale !== 1) {

        sr *= scale;
        er *= scale;
    }

    gradientArgs.length = 0;
    gradientArgs.push(sx, sy, sr, ex, ey, er);
};


// #### Factory
// ```
// let graddy = scrawl.makeRadialGradient({
//
//     name: 'mygradient',
//
//     startX: '50%',
//     startY: '50%',
//     endX: '50%',
//     endY: '50%',
//
//     endRadius: 300,
// });
//
// scrawl.makeBlock({
//
//     name: 'myblock',
//
//     width: '90%',
//     height: '90%',
//     startX: '5%',
//     startY: '5%',
//
//     fillStyle: graddy,
//     strokeStyle: 'coral',
//     lineWidth: 2,
//
//     method: 'fillAndDraw',
// });
// ```
export const makeRadialGradient = function (items) {

    if (!items) return false;
    return new RadialGradient(items);
};

constructors.RadialGradient = RadialGradient;
