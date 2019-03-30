/*
# Block factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';

/*
## Block constructor
*/
const Block = function (items = {}) {

	this.entityInit(items);
	return this;
};

/*
## Block object prototype setup
*/
let Ep = Block.prototype = Object.create(Object.prototype);
Ep.type = 'Block';
Ep.lib = 'entity';
Ep.artefact = true;

/*
Apply mixins to prototype object
*/
Ep = baseMix(Ep);
Ep = positionMix(Ep);
Ep = entityMix(Ep);
Ep = filterMix(Ep);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	width: 10,

/*

*/
	height: 10,

/*

*/
	method: 'fill',
};
Ep.defs = mergeOver(Ep.defs, defaultAttributes);

/*
## Define prototype functions
*/

/*

*/
Ep.cleanPathObject = function () {

	let p, handle, trans, scale, x, y, w, h;

	this.dirtyPathObject = false;

	p = this.pathObject = new Path2D();
	
	handle = this.currentHandle;
	scale = this.scale;
	x = -handle.x * scale;
	y = -handle.y * scale;
	w = this.localWidth * scale;
	h = this.localHeight * scale;

	p.rect(x, y, w, h);
};


/*
## Exported factory function
*/
const makeBlock = function (items) {
	return new Block(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Block = Block;

export {
	makeBlock,
};
