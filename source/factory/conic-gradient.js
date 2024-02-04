// # ConicGradient factory
// Scrawl-canvas ConicGradient objects implement the Canvas API's [createConicGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createConicGradient) method. The resulting [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.
// + Most gradient-related functionality has been coded up in the [styles mixin](../mixin/styles.html), and is documented there.
// + ConicGradients fully participate in the Scrawl-canvas packet system, thus can be saved, restored, cloned, killed, etc.
// + ConicGradients can be animated in a variety of ways; the can act as target objects for Scrawl-canvas Tweens.
//
// ConicGradients can be applied to an entity in two different ways, depending on the entity's `lockFillStyleToEntity` and `lockStrokeStyleToEntity` attribute flags:
// + __Cell-locked__ ConicGradients will cover the entire Cell; an entity moved from one part of the display to another will show different parts of the gradient
// + __Entity-locked__ ConicGradients display their entire color range on the entity, move with the entity and even rotate with the entity.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, mergeOver, pushUnique, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';

import { _radian, BLANK, STYLES, T_CONIC_GRADIENT } from '../helper/shared-vars.js';


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
P.packetObjects = pushUnique(P.packetObjects, ['palette']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
// No additional getter/setter functionality required


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
P.updateGradientArgs = function (x, y) {

    const gradientArgs = this.gradientArgs,
        currentStart = this.currentStart,
        angle = this.angle * _radian;

    const sx = currentStart[0] + x,
        sy = currentStart[1] + y;

    gradientArgs.length = 0;
    gradientArgs.push(angle, sx, sy);
};


// #### Factory
// ```
// let graddy = scrawl.makeConicGradient({
//
//     name: 'mygradient',
//
//     startX: '50%',
//     startY: '50%',
//     angle: 90,
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
export const makeConicGradient = function (items) {

    if (!items) return false;
    return new ConicGradient(items);
};

constructors.ConicGradient = ConicGradient;
