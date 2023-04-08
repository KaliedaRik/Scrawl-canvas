// # RadialGradient factory
// Scrawl-canvas RadialGradient objects implement the Canvas API's [createRadialGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient) method. The resulting [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.
// + Most gradient-related functionality has been coded up in the [styles mixin](../mixin/styles.html), and is documented there.
// + RadialGradients fully participate in the Scrawl-canvas packet system, thus can be saved, restored, cloned, killed, etc.
// + RadialGradients can be animated in a variety of ways; the can act as target objects for Scrawl-canvas Tweens.
//
// RadialGradients can be applied to an entity in two different ways, depending on the entity's `lockFillStyleToEntity` and `lockStrokeStyleToEntity` attribute flags:
// + __Cell-locked__ RadialGradients will cover the entire Cell; an entity moved from one part of the display to another will show different parts of the gradient
// + __Entity-locked__ RadialGradients display their entire color range on the entity, move with the entity and even rotate with the entity.


// #### Demos:
// + [Canvas-004](../../demo/canvas-004.html) - Radial gradients
// + [Canvas-005](../../demo/canvas-005.html) - Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween


// #### Imports
import { constructors } from '../core/library.js';

import { 
    addStrings, 
    doCreate,
    isa_number, 
    mergeOver, 
    pushUnique, 
    Ωempty, 
} from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';


// Local constants
const BLANK = 'rgb(0 0 0 / 0)',
    BOTTOM = 'bottom',
    CENTER = 'center',
    LEFT = 'left',
    RIGHT = 'right',
    STYLES = 'styles',
    T_RADIAL_GRADIENT = 'RadialGradient',
    TOP = 'top';


// #### RadialGradient constructor
const RadialGradient = function (items = Ωempty) {

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
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [styles mixin](../mixin/styles.html): __start, end, palette, paletteStart, paletteEnd, cyclePalette__.
// + Attributes defined in the [Palette factory](./palette.html): __colors, cyclic__.
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
P.packetObjects = pushUnique(P.packetObjects, ['palette']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// The getter functions `myradialgradient.get('startRadius')` and `myradialgradient.get('endRadius')` return the current radius values as Numbers, measuring pixels
G.startRadius = function (item) {

    return this.currentStartRadius;
};
G.endRadius = function (item) {

    return this.currentEndRadius;
};

// Both `startRadius` and `endRadius` attributes can be set and deltaSet
S.startRadius = function (item) {

    this.startRadius = item;
    this.dirtyStyle = true;
};
S.endRadius = function (item) {

    this.endRadius = item;
    this.dirtyStyle = true;
};
D.startRadius = function (item) {

    this.startRadius = addStrings(this.startRadius, item);
    this.dirtyStyle = true;
};
D.endRadius = function (item) {

    this.endRadius = addStrings(this.endRadius, item);
    this.dirtyStyle = true;
};


// #### Prototype functions

// `cleanRadius` - internal function to calculate the current radius values (in px) of the start and end radii
P.cleanRadius = function (width) {

    const convertLength = (val, len) => {

        if (isa_number(val)) return val;

        else {

            switch(val){

                case TOP :
                case LEFT :
                    return 0;

                case BOTTOM :
                case RIGHT :
                    return len;

                case CENTER :
                    return len / 2;

                default :
                    val = parseFloat(val);

                    if (!isa_number(val)) return 0;

                    return ( val / 100) * len;
            }
        }
    };

    this.currentStartRadius = (width) ? convertLength(this.startRadius, width) : this.defs.startRadius;
    this.currentEndRadius = (width) ? convertLength(this.endRadius, width) : this.defs.endRadius;
};

// `buildStyle` - internal function: creates the radial gradient on the Cell's CanvasRenderingContext2D engine, and then adds the color stops to it.
P.buildStyle = function (cell) {
    
    if (cell) {

        let engine = cell.engine;

        if (engine) {

            let gradient = engine.createRadialGradient(...this.gradientArgs);
            
            return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
        }
    }
    return BLANK;
};

// `updateGradientArgs` - internal function
P.updateGradientArgs = function (x, y) {

    const gradientArgs = this.gradientArgs,
        currentStart = this.currentStart,
        currentEnd = this.currentEnd,
        sr = this.currentStartRadius;
    
    let er = this.currentEndRadius;

    const sx = currentStart[0] + x,
        sy = currentStart[1] + y,
        ex = currentEnd[0] + x,
        ey = currentEnd[1] + y;

    // check to correct situation where coordinates represent a '0 x 0' box - which will cause errors in some browsers
    if (sx == ex && sy == ey && sr == er) er++;

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
