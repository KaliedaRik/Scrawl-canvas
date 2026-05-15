// # ConicGradient factory
// Scrawl-canvas ConicGradient objects implement and extend the Canvas API's [createConicGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createConicGradient) method. The resulting [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, generateUniqueString, mergeOver, pushUnique, Ωempty } from '../helper/utilities.js';

import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';

// Shared constants
import { _radian, BLANK, PAD, STYLES, T_CONIC_GRADIENT, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
// + None defined


// #### ConicGradient constructor
const ConicGradient = function (items = Ωempty) {

    this.stylesInit(items);
    return this;
};


// #### ConicGradient prototype
const P = ConicGradient.prototype = doCreate();
P.type = T_CONIC_GRADIENT;
P.lib = STYLES;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);
stylesMix(P);


// #### ConicGradient attributes
const defaultAttributes = {

// ConicGradients calculate their gradients as a sweep of color around the `start` (`startX` and `startY`) coordinate. The __startAngle__ attribute - measured in degrees, not radians - represents the angle at which the color stop 0 occurs.
// + The sweep of colors is, by default, clockwise around the start coordinate; to reverse this, swap the gradient's `paletteStart` and `paletteEnd` attributes.
    angle: 0,

// The following attributes may trigger a software rendering of the ConicGradient
// 
// `spread` - value from 'pad' (default), 'repeat', 'reflect', 'transparent'
//
// `angleRange` - by default the Conic gradient will sweep a complete turn around the start point. We can limit it to just a part of the circle by setting this attribute to a value greater than 0 and less than 360 (degrees). The spread attribute then determines how the gradient should complete the circle:
// + 'pad', 'reflect', 'repeat', 'transparent'
//
// `angleRange` - number between 1 and 360 (default) - the distance around the origin which the gratient will wrap
// + For `pad` spread, the remainder of the distance will be filled equally by the gradient's first and last color points 
// + For other spreads, the remaining space will be filled with repeats/reflections of the gradient, or will be transparent
    angleRange: 360,

// `swirlDistance` - if set above 0, represents the distance from the origin for a complete turn of the gradient to take place; smaller distances give tighter swirls
    swirlDistance: 0,

// `swirlClockwise` - boolean. Determines the direction of the swirl - clockwise by default
    swirlClockwise: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['palette']);

// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const S = P.setters,
    D = P.deltaSetters;

S.angle = function (item) {

    this.angle = item;
    this.updateSubscribers();
};
D.angle = function (item) {

    this.angle = addStrings(this.angle, item);
    this.updateSubscribers();
};

S.angleRange = function (item) {

    this.angleRange = item;
    this.updateSubscribers();
};
D.angleRange = function (item) {

    this.angleRange = addStrings(this.angleRange, item);
    this.updateSubscribers();
};

S.swirlDistance = function (item) {

    this.swirlDistance = item;
    this.updateSubscribers();
};
D.swirlDistance = function (item) {

    this.swirlDistance = addStrings(this.swirlDistance, item);
    this.updateSubscribers();
};

S.swirlClockwise = function (item) {

    this.swirlClockwise = !!item;
    this.updateSubscribers();
};

// #### Prototype functions

// `buildStyle` - internal function: creates the radial gradient on the Cell's CanvasRenderingContext2D engine, and then adds the color stops to it.
P.buildStyle = function (cell) {

    if (cell) {

        const engine = cell.engine;

        if (engine) {

            if (!engine.createConicGradient) return BLANK;

            const gradient = engine.createConicGradient(...this.gradientArgs);

            return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
        }
    }
    return BLANK;
};

// `updateGradientArgs` - internal function
P.updateGradientArgs = function (x, y, roll) {

    const gradientArgs = this.gradientArgs,
        currentStart = this.currentStart;

    let sx = currentStart[0] + x,
        sy = currentStart[1] + y,
        angle = this.angle * _radian;

    if (roll) {

        const coord = requestCoordinate();

        [sx, sy] = coord.setFromArray([sx, sy]).rotate(roll);

        releaseCoordinate(coord);

        angle += (roll * _radian);
    }

    gradientArgs.length = 0;
    gradientArgs.push(angle, sx, sy);
};


// Overwrite styles.updateIdentifier function
P.updateIdentifier = function () {

    if (this.spread !== PAD || this.swirlDistance || this.angleRange !== 360 || this.operations.length) this.identifier = `${this.type}_${this.name}_${generateUniqueString()}`;
    else this.identifier = ZERO_STR;
};

// #### Factory
// ```
// const graddy = scrawl.makeConicGradient({
//     name: 'my-gradient',
//     startX: '50%',
//     startY: '50%',
//     angle: 90,
// });
//
// scrawl.makeBlock({
//     name: 'my-block',
//     width: '90%',
//     height: '90%',
//     startX: '5%',
//     startY: '5%',
//     fillStyle: graddy,
//     strokeStyle: 'coral',
//     lineWidth: 2,
//     method: 'fillAndDraw',
// });
// ```
export const makeConicGradient = function (items) {

    if (!items) return false;
    return new ConicGradient(items);
};

constructors.ConicGradient = ConicGradient;
