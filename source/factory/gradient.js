// # Gradient factory
// Scrawl-canvas Gradient objects implement the Canvas API's [createLinearGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient) method. The resulting [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.
// + Most gradient-related functionality has been coded up in the [styles mixin](../mixin/styles.html), and is documented there.
// + Gradients fully participate in the Scrawl-canvas packet system, thus can be saved, restored, cloned, killed, etc.
// + Gradients can be animated in a variety of ways; the can act as target objects for Scrawl-canvas Tweens.
//
// Gradients can be applied to an entity in two different ways, depending on the entity's `lockFillStyleToEntity` and `lockStrokeStyleToEntity` attribute flags:
// + __Cell-locked__ Gradients will cover the entire Cell; an entity moved from one part of the display to another will show different parts of the gradient
// + __Entity-locked__ Gradients display their entire color range on the entity, move with the entity and even rotate with the entity.


// #### Demos:
// + [Canvas-003](../../demo/canvas-003.html) - Linear gradients
// + [Canvas-005](../../demo/canvas-005.html) - Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween
// + [Canvas-022](../../demo/canvas-022.html) - Grid entity - basic functionality (color, gradients)


// #### Imports
import { constructors } from '../core/library.js';
import { pushUnique, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';


// #### Gradient constructor
const Gradient = function (items = Ωempty) {

    this.stylesInit(items);
    return this;
};


// #### Gradient prototype
let P = Gradient.prototype = Object.create(Object.prototype);

P.type = 'Gradient';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = stylesMix(P);


// #### Gradient attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [styles mixin](../mixin/styles.html): __start, end, palette, paletteStart, paletteEnd, cyclePalette__.
// + Attributes defined in the [Palette factory](./palette.html): __colors, cyclic__.
//
// No additional attributes are defined in this file.

// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['palette']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
// No additional functionality required


// #### Prototype functions

// `buildStyle` - internal function: creates the linear gradient on the Cell's CanvasRenderingContext2D engine, and then adds the color stops to it.
P.buildStyle = function (cell) {
    
    if (cell) {

        let engine = cell.engine;

        if (engine) {

            let gradient = engine.createLinearGradient(...this.gradientArgs);
            
            return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
        }
    }
    return 'rgba(0,0,0,0)';
};

// `updateGradientArgs` - internal function
P.updateGradientArgs = function (x, y) {

    let gradientArgs = this.gradientArgs,
        currentStart = this.currentStart,
        currentEnd = this.currentEnd;

    let sx = currentStart[0] + x,
        sy = currentStart[1] + y,
        ex = currentEnd[0] + x,
        ey = currentEnd[1] + y;

    // check to correct situation where coordinates represent a '0 x 0' box - which will cause errors in some browsers
    if (sx === ex && sy === ey) ex++;

    gradientArgs.length = 0;
    gradientArgs.push(sx, sy, ex, ey);
};



// #### Factory
// ```
// scrawl.makeGradient({
//     name: 'colored-pipes',
//     endX: '100%',
//     cyclePalette: true,
//     colors: [
//         [0, 'black'],
//         [99, 'red'],
//         [199, 'black'],
//         [299, 'blue'],
//         [399, 'black'],
//         [499, 'gold'],
//         [599, 'black'],
//         [699, 'green'],
//         [799, 'black'],
//         [899, 'lavender'],
//         [999, 'black']
//     ],
// })
//
// scrawl.makeBlock({
//
//     name: 'animated-block',
//
//     width: 150,
//     height: 150,
//
//     startX: 180,
//     startY: 120,
//
//     handleX: 'center',
//     handleY: 'center',
//
//     strokeStyle: 'coral',
//     fillStyle: 'colored-pipes',
//     lineWidth: 2,
//
//     method: 'fillAndDraw',
// });
// ```
const makeGradient = function (items) {

    if (!items) return false;
    return new Gradient(items);
};

constructors.Gradient = Gradient;


// #### Exports
export {
    makeGradient,
};
