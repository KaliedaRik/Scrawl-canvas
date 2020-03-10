
// # Block factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';



// ## Block constructor
const Block = function (items = {}) {

    this.entityInit(items);

    if (!items.dimensions) {

        if (!items.width) this.currentDimensions[0] = this.dimensions[0] = 10;
        if (!items.height) this.currentDimensions[1] = this.dimensions[1] = 10;
    }

    return this;
};



// ## Block object prototype setup
let P = Block.prototype = Object.create(Object.prototype);
P.type = 'Block';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;



// Apply mixins to prototype object
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);



// ## Packet management

// The Block entity does not require processing beyond that supplied by the entity mixin



// ## Define prototype functions

// Internal - used for entity stamping (Display cycle), and collision detection (eg: drag-and-drop)
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



// TODO - documentation
const makeBlock = function (items) {
    return new Block(items);
};

constructors.Block = Block;

export {
    makeBlock,
};
