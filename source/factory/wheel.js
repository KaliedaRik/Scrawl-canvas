/*
# Wheel factory
*/
import { constructors, radian } from '../core/library.js';
import { mergeOver, pushUnique, xt, xto } from '../core/utilities.js';

import { makePoint } from './point.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';

/*
## Wheel constructor
*/
const Wheel = function (items = {}) {

	this.entityInit(items);
	this.defaultHandles(items);

	return this;
};

/*
## Wheel object prototype setup
*/
let Ep = Wheel.prototype = Object.create(Object.prototype);
Ep.type = 'Wheel';
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
	width: 20,

/*

*/
	height: 20,

/*

*/
	radius: 10,

/*

*/
	startAngle: 0,

/*

*/
	endAngle: 360,

/*

*/
	closed: true,

/*

*/
	includeCenter: false,

/*

*/
	clockwise: true,
};
Ep.defs = mergeOver(Ep.defs, defaultAttributes);

let G = Ep.getters,
	S = Ep.setters,
	D = Ep.deltaSetters;

/*

*/
S.width = function (item) {

	this.width = this.height = (xt(item)) ? item : this.defs.width;
	this.dimensionsHelper();
};

/*

*/
S.height = function (item) {

	this.width = this.height = (xt(item)) ? item : this.defs.height;
	this.dimensionsHelper();
};

/*

*/
S.scale = function (item) {

	this.scale = (xt(item)) ? item : this.defs.scale;
	this.dirtyScale = true;
	this.dirtyPivoted = true;
	this.dirtyPathObject = true;
};

/*

*/
S.radius = function (item) {

	this.radius = (xt(item)) ? item : this.defs.radius;
	this.radiusHelper();
};

/*

*/
S.startAngle = function (item) {

	this.startAngle = (xt(item)) ? item : this.defs.startAngle;
	this.dirtyPathObject = true;
};

/*

*/
S.endAngle = function (item) {

	this.endAngle = (xt(item)) ? item : this.defs.endAngle;
	this.dirtyPathObject = true;
};

/*

*/
S.closed = function (item) {

	this.closed = (xt(item)) ? item : this.defs.closed;
	this.dirtyPathObject = true;
};

/*

*/
S.includeCenter = function (item) {

	this.includeCenter = (xt(item)) ? item : this.defs.includeCenter;
	this.dirtyPathObject = true;
};

/*

*/
S.clockwise = function (item) {

	this.clockwise = (xt(item)) ? item : this.defs.clockwise;
	this.dirtyPathObject = true;
};

/*

*/
D.width = function (item) {

	this.width = this.height = addStrings(this.width, item);
	this.dimensionsHelper();
};

/*

*/
D.height = function (item) {

	this.width = this.height = addStrings(this.height, item);
	this.dimensionsHelper();
};

/*

*/
D.scale = function (item) {

	this.scale += item;
	this.dirtyScale = true;
	this.dirtyPivoted = true;
	this.dirtyPathObject = true;
};

/*

*/
D.radius = function (item) {

	this.radius += item;
	this.radiusHelper();
};

/*

*/
D.startAngle = function (item) {

	this.startAngle += item;
	this.dirtyPathObject = true;
};

/*

*/
D.endAngle = function (item) {

	this.endAngle += item;
	this.dirtyPathObject = true;
};


/*
## Define prototype functions
*/

/*

*/
Ep.defaultHandles = function (items) {

	let iHandle = items.handle || {};

	if (!xto(iHandle.x, items.handleX)) {

		this.set({
			handleX: 'center',
		});
	}
	if (!xto(iHandle.y, items.handleY)) {

		this.set({
			handleY: 'center',
		});
	}
};

Ep.dimensionsHelper = function () {

	if (this.width.substring) this.radius = `${(parseFloat(this.width) / 2)}%`;
	else this.radius = (this.width / 2);

	this.dirtyDimensions = true;
	this.dirtyHandle = true;
	this.dirtyPathObject = true;
	this.dirtyPivoted = true;
};

Ep.radiusHelper = function () {

	if (this.radius.substring) this.width = this.height = (parseFloat(this.radius) * 2) + '%';
	else this.width = this.height = (this.radius * 2);

	this.dirtyDimensions = true;
	this.dirtyHandle = true;
	this.dirtyPathObject = true;
	this.dirtyPivoted = true;
};

Ep.cleanDimensions = function () {

	// the radius only references the width of the canvas, never the height;
	let host = this.currentHost,
		w, r;

	if (host) {

		w = this.width;

		if (w.substring) this.localWidth = this.localHeight = (parseFloat(w) / 100) * host.localWidth;
		else this.localWidth = this.localHeight = w;
	
		r = this.radius;

		if (r.substring) this.localRadius = (parseFloat(r) / 100) * host.localWidth;
		else this.localRadius = r;

		this.dirtyDimensions = false;
	}
};

Ep.cleanPathObject = function () {

	let p, handle, trans, scale, x, y, radius, starts, ends;

	this.dirtyPathObject = false;

	p = this.pathObject = new Path2D();
	handle = this.currentHandle;
	scale = this.scale;
	radius = this.localRadius * scale;
	x = radius - (handle.x * scale);
	y = radius - (handle.y * scale);
	starts = this.startAngle * radian;
	ends = this.endAngle * radian;

	p.arc(x, y, radius, starts, ends, !this.clockwise);

	if (this.includeCenter) {

		p.lineTo(x, y);
		p.closePath();
	}
	else if (this.closed) p.closePath();
};

Ep.finalizeCollisionPoints = function (pointsArray) {

	let cp = this.collisionPoints,
		i, iz, item, pt;

	for (i = 0, iz = pointsArray.length; i < iz; i++) {

		item = pointsArray[i];
		
		pt = makePoint({
			name: `${this.name}_cp_${item}`,
			pivot: this.name,
			group: this.group
		});

		switch (item) {

			case 'ne' :
				cp.push(pt.set({offsetX: '85%', offsetY: '15%'}));
				break;

			case 'n' :
				cp.push(pt.set({offsetX: '50%', offsetY: '0%'}));
				break;

			case 'nw' :
				cp.push(pt.set({offsetX: '15%', offsetY: '15%'}));
				break;

			case 'w' :
				cp.push(pt.set({offsetX: '0%', offsetY: '50%'}));
				break;

			case 'sw' :
				cp.push(pt.set({offsetX: '15%', offsetY: '85%'}));
				break;

			case 's' :
				cp.push(pt.set({offsetX: '50%', offsetY: '100%'}));
				break;

			case 'se' :
				cp.push(pt.set({offsetX: '85%', offsetY: '85%'}));
				break;

			case 'e' :
				cp.push(pt.set({offsetX: '100%', offsetY: '50%'}));
				break;

			case 'c' :
				cp.push(pt.set({offsetX: '50%', offsetY: '50%'}));
				break;
		}
	}
};


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
