// # Block factory
// Block entitys are rectangles rendered onto a DOM &lt;canvas> element using the Canvas API's [Path2D interface](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) - specifically the `rect` method.


// #### Imports
import { constructors } from '../core/library.js';
import { doCreate, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

// Shared constants
import { ENTITY } from '../helper/shared-vars.js';

// Local constants
const T_BLOCK = 'Block';


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
const P = Block.prototype = doCreate();
P.type = T_BLOCK;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);


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

        const p = this.pathObject = new Path2D();

        const handle = this.currentStampHandlePosition,
            scale = this.currentScale,
            dims = this.currentDimensions;

        const x = -handle[0] * scale,
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
export const makeBlock = function (items) {

    if (!items) return false;
    return new Block(items);
};

constructors.Block = Block;
