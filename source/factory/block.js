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
// + [Packets-001](../../demo/packets-001.html) - Save and load Scrawl-canvas entity using text packets


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, xt, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Block constructor
const Block = function (items = Ωempty) {

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
// + [entity](../mixin/entity.html)
P = baseMix(P);
P = entityMix(P);


// #### Block attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, calculateOrder, stampOrder, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, filter___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
//
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

    if (!items) return false;
    return new Block(items);
};

constructors.Block = Block;


// #### Exports
export {
    makeBlock,
};
