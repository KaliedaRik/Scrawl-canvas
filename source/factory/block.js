// # Block factory
// Block entitys are rectangles rendered onto a DOM &lt;canvas> element using the Canvas API's [Path2D interface](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) - specifically the `rect` method.
// + Positioning and dimensions functionality for the Block is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin. 
// + Blocks can use CSS color Strings for their fillStyle and strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects. 
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation. 
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__. 
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Blocks can be cloned, and killed.


// #### Demos:
// + [Canvas-001](../../demo/canvas-001.html) - Block and Wheel entitys (make, clone, method); drag and drop block and wheel entitys
// + [Canvas-005](../../demo/canvas-005.html) - Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween
// + [Canvas-007](../../demo/canvas-007.html) - Apply filters at the entity, group and cell level
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility
// + [Component-003](../../demo/component-003.html) - Save and load Scrawl-canvas entity using text packets


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';


// #### Block constructor
const Block = function (items = {}) {

    this.entityInit(items);

    if (!items.dimensions) {

        if (!items.width) this.currentDimensions[0] = this.dimensions[0] = 10;
        if (!items.height) this.currentDimensions[1] = this.dimensions[1] = 10;
    }

    return this;
};


// #### Block prototype
let P = Block.prototype = Object.create(Object.prototype);
P.type = 'Block';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [position](../mixin/position.html)
// + [anchor](../mixin/anchor.html)
// + [entity](../mixin/entity.html)
// + [filter](../mixin/filter.html)
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);


// #### Block attributes
// No additional attributes required beyond those supplied by the mixins


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
// No additional functionality required


// #### Prototype functions

// `cleanPathObject` - Calculate the Block entity's __Path2D object__
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        let p = this.pathObject = new Path2D();
        
        let handle = this.currentStampHandlePosition,
            scale = this.currentScale,
            dims = this.currentDimensions;

        let x = -handle[0] * scale,
            y = -handle[1] * scale,
            w = dims[0] * scale,
            h = dims[1] * scale;

        p.rect(x, y, w, h);
    }
};


// #### Factory
// ```
// scrawl.makeBlock({
//
//     name: 'myblock-fill',
//     width: 100,
//     height: 100,
//     startX: 25,
//     startY: 25,
//
//     fillStyle: 'green',
//     strokeStyle: 'gold',
//
//     lineWidth: 6,
//     lineJoin: 'round',
//     shadowOffsetX: 4,
//     shadowOffsetY: 4,
//     shadowBlur: 2,
//     shadowColor: 'black',
//
// }).clone({
//
//     name: 'myblock-draw',
//     startX: 175,
//
//     method: 'draw',
//     sharedState: true,
// });
// ```
const makeBlock = function (items) {
    return new Block(items);
};

constructors.Block = Block;


// #### Exports
export {
    makeBlock,
};
