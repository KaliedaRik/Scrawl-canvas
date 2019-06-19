/*
# Wheel factory
*/
import { constructors, radian } from '../core/library.js';
import { mergeOver, xt, xto, ensureFloat } from '../core/utilities.js';

// import { makePoint } from './point.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';

/*
## Wheel constructor
*/
const Wheel = function (items = {}) {

	if (!xto(items.dimensions, items.width, items.height,items.radius)) items.radius = 5;

	this.entityInit(items);

	return this;
};

/*
## Wheel object prototype setup
*/
let P = Wheel.prototype = Object.create(Object.prototype);
P.type = 'Wheel';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = entityMix(P);
P = filterMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	startAngle: 0,
	endAngle: 360,

/*

*/
	includeCenter: false,
	clockwise: true,

/*

*/
	closed: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/
S.width = function (val) {

	if (val != null) {

		let dims = this.dimensions;

		dims[0] = dims[1] = val;
		this.dimensionsHelper();
	}
};

S.height = function (val) {

	if (val != null) {

		let dims = this.dimensions;

		dims[0] = dims[1] = val;
		this.dimensionsHelper();
	}
};

S.dimensions = function (w, h) {

	this.setCoordinateHelper('dimensions', w, h);
	this.dimensionsHelper();
};

D.width = function (val) {

	let dims = this.dimensions;

	dims[0] = dims[1] = addStrings(dims[0], val);
	this.dimensionsHelper();
};

D.height = function (val) {

	let dims = this.dimensions;

	dims[0] = dims[1] = addStrings(dims[0], val);
	this.dimensionsHelper();
};

D.dimensions = function (w, h) {

	this.setDeltaCoordinateHelper('dimensions', w, h);
	this.dimensionsHelper();
}

/*

*/
S.radius = function (val) {

	this.radius = val;
	this.radiusHelper();
};

D.radius = function (val) {

	this.radius = addStrings(this.radius, val);
	this.radiusHelper();
};

/*

*/
S.startAngle = function (val) {

	this.startAngle = ensureFloat(val, 4);
	this.dirtyPathObject = true;
};

S.endAngle = function (val) {

	this.endAngle = ensureFloat(val, 4);
	this.dirtyPathObject = true;
};

D.startAngle = function (val) {

	this.startAngle += ensureFloat(val, 4);
	this.dirtyPathObject = true;
};

D.endAngle = function (val) {

	this.endAngle += ensureFloat(val, 4);
	this.dirtyPathObject = true;
};
/*

*/
S.closed = function (bool) {

	if(xt(bool)) {

		this.closed = !!bool;
		this.dirtyPathObject = true;
	}
};

S.includeCenter = function (bool) {

	if(xt(bool)) {

		this.includeCenter = !!bool;
		this.dirtyPathObject = true;
	}
};

S.clockwise = function (bool) {

	if(xt(bool)) {

		this.clockwise = !!bool;
		this.dirtyPathObject = true;
	}
};


/*
## Define prototype functions
*/

P.dimensionsHelper = function () {

	let width = this.dimensions[0];

	if (width.substring) this.radius = `${(parseFloat(width) / 2)}%`;
	else this.radius = (width / 2);

	this.dirtyDimensions = true;
};

P.radiusHelper = function () {

	let radius = this.radius,
		dims = this.dimensions;

	if (radius.substring) dims[0] = dims[1] = (parseFloat(radius) * 2) + '%';
	else dims[0] = dims[1] = (radius * 2);

	this.dirtyDimensions = true;
};

P.cleanDimensionsAdditionalActions = function () {

	let radius = this.radius,
		dims = this.currentDimensions,
		calculatedRadius = (radius.substring) ? (parseFloat(radius) / 100) * dims[0] : radius;

	if (dims[0] !== calculatedRadius * 2) {

		dims[1] = dims[0];
		this.currentRadius = dims[0] / 2;
	}
	else this.currentRadius = calculatedRadius;
};

P.cleanPathObject = function () {

	this.dirtyPathObject = false;

	let p = this.pathObject = new Path2D();

	let handle = this.currentStampHandlePosition,
		scale = this.currentScale,
		radius = this.currentRadius * scale,
		x = radius - (handle[0] * scale),
		y = radius - (handle[1] * scale),
		starts = this.startAngle * radian,
		ends = this.endAngle * radian;

	p.arc(x, y, radius, starts, ends, !this.clockwise);

	if (this.includeCenter) {

		p.lineTo(x, y);
		p.closePath();
	}
	else if (this.closed) p.closePath();
};

// P.finalizeCollisionPoints = function (pointsArray) {

// 	let cp = this.collisionPoints,
// 		i, iz, item, pt;

// 	for (i = 0, iz = pointsArray.length; i < iz; i++) {

// 		item = pointsArray[i];
		
// 		pt = makePoint({
// 			name: `${this.name}_cp_${item}`,
// 			pivot: this.name,
// 			group: this.group
// 		});

// 		switch (item) {

// 			case 'ne' :
// 				cp.push(pt.set({offsetX: '85%', offsetY: '15%'}));
// 				break;

// 			case 'n' :
// 				cp.push(pt.set({offsetX: '50%', offsetY: '0%'}));
// 				break;

// 			case 'nw' :
// 				cp.push(pt.set({offsetX: '15%', offsetY: '15%'}));
// 				break;

// 			case 'w' :
// 				cp.push(pt.set({offsetX: '0%', offsetY: '50%'}));
// 				break;

// 			case 'sw' :
// 				cp.push(pt.set({offsetX: '15%', offsetY: '85%'}));
// 				break;

// 			case 's' :
// 				cp.push(pt.set({offsetX: '50%', offsetY: '100%'}));
// 				break;

// 			case 'se' :
// 				cp.push(pt.set({offsetX: '85%', offsetY: '85%'}));
// 				break;

// 			case 'e' :
// 				cp.push(pt.set({offsetX: '100%', offsetY: '50%'}));
// 				break;

// 			case 'c' :
// 				cp.push(pt.set({offsetX: '50%', offsetY: '50%'}));
// 				break;
// 		}
// 	}
// };


/*
## Exported factory function
*/
const makeWheel = function (items) {
	return new Wheel(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Wheel = Wheel;

export {
	makeWheel,
};
