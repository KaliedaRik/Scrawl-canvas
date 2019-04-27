/*
# Shape factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, xt, addStrings, xtGet } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';

/*
## Shape constructor
*/
const Shape = function (items = {}) {

	this.entityInit(items);

	this.units = [];

	return this;
};

/*
## Shape object prototype setup
*/
let P = Shape.prototype = Object.create(Object.prototype);
P.type = 'Shape';
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
	species: '',

/*

*/
	showBoundingBox: false,

/*

*/
	rectangleWidth: 10,
	rectangleHeight: 10,

/*

*/
	radiusTLX: 0,
	radiusTLY: 0,
	radiusTRX: 0,
	radiusTRY: 0,
	radiusBRX: 0,
	radiusBRY: 0,
	radiusBLX: 0,
	radiusBLY: 0,

/*

*/
	radiusX: 5,
	radiusY: 5,
	intersectX: 0.5,
	intersectY: 0.5,
	offshootA: 0.55,
	offshootB: 0,

/*

*/
	startControl: {},
	endControl: {},
	control: {},
	end: {},
	currentStartControl: {},
	currentEndControl: {},
	currentControl: {},
	currentEnd: {},
};
P.defs = mergeOver(P.defs, defaultAttributes);

P.specialAttributes = [
];

let S = P.setters,
	D = P.deltaSetters;

/*

*/
S.path = function (item) {

	if (item.substring) this.path = item;
	this.dirtyPathObject = true;
};

/*
Overwrite mixin/position.js handle functions - handle recalculations have to wait until after we determine the Shape's dimensions, which happens very late in the display cycle (when the path is recalculated)
*/
S.handleX = function (item) {

	this.checkVector('handle');
	this.handle.x = item;
	this.dirtyPathObject = true;
};

S.handleY = function (item) {

	this.checkVector('handle');
	this.handle.y = item;
	this.dirtyPathObject = true;
};

S.handle = function (item = {}) {

	this.checkVector('handle');
	this.handle.x = (xt(item.x)) ? item.x : this.handle.x;
	this.handle.y = (xt(item.y)) ? item.y : this.handle.y;
	this.dirtyPathObject = true;
};

D.handleX = function (item) {

	this.checkVector('handle');
	this.handle.x = addStrings(this.handle.x, item);
	this.dirtyPathObject = true;
};

D.handleY = function (item) {

	this.checkVector('handle');
	this.handle.y = addStrings(this.handle.y, item);
	this.dirtyPathObject = true;
};

D.handle = function (item = {}) {

	this.checkVector('handle');
	this.handle.x = (xt(item.x)) ? addStrings(this.handle.x, item) : this.handle.x;
	this.handle.y = (xt(item.y)) ? addStrings(this.handle.y, item) : this.handle.y;
	this.dirtyPathObject = true;
};


S.species = function (item) {

	if (xt(item)) {

		if (item) this.dirtyPathObject = true;

		this.species = item;
		this.dirtySpecies = true;
	}
};

S.startControlX = function (item) {

	this.checkVector('startControl');
	this.startControl.x = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyStartControl = true;
};

S.startControlY = function (item) {

	this.checkVector('startControl');
	this.startControl.y = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyStartControl = true;
};

S.startControl = function (item = {}) {

	this.checkVector('startControl');
	this.startControl.x = (xt(item.x)) ? item.x : this.startControl.x;
	this.startControl.y = (xt(item.y)) ? item.y : this.startControl.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyStartControl = true;
};

D.startControlX = function (item) {

	this.checkVector('startControl');
	this.startControl.x = addStrings(this.startControl.x, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyStartControl = true;
};

D.startControlY = function (item) {

	this.checkVector('startControl');
	this.startControl.y = addStrings(this.startControl.y, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyStartControl = true;
};

D.startControl = function (item = {}) {

	this.checkVector('startControl');
	this.startControl.x = (xt(item.x)) ? addStrings(this.startControl.x, item) : this.startControl.x;
	this.startControl.y = (xt(item.y)) ? addStrings(this.startControl.y, item) : this.startControl.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyStartControl = true;
};

S.endControlX = function (item) {

	this.checkVector('endControl');
	this.endControl.x = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEndControl = true;
};

S.endControlY = function (item) {

	this.checkVector('endControl');
	this.endControl.y = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEndControl = true;
};

S.endControl = function (item = {}) {

	this.checkVector('endControl');
	this.endControl.x = (xt(item.x)) ? item.x : this.endControl.x;
	this.endControl.y = (xt(item.y)) ? item.y : this.endControl.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEndControl = true;
};

D.endControlX = function (item) {

	this.checkVector('endControl');
	this.endControl.x = addStrings(this.endControl.x, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEndControl = true;
};

D.endControlY = function (item) {

	this.checkVector('endControl');
	this.endControl.y = addStrings(this.endControl.y, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEndControl = true;
};

D.endControl = function (item = {}) {

	this.checkVector('endControl');
	this.endControl.x = (xt(item.x)) ? addStrings(this.endControl.x, item) : this.endControl.x;
	this.endControl.y = (xt(item.y)) ? addStrings(this.endControl.y, item) : this.endControl.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEndControl = true;
};

S.controlX = function (item) {

	this.checkVector('control');
	this.control.x = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyControl = true;
};

S.controlY = function (item) {

	this.checkVector('control');
	this.control.y = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyControl = true;
};

S.control = function (item = {}) {

	this.checkVector('control');
	this.control.x = (xt(item.x)) ? item.x : this.control.x;
	this.control.y = (xt(item.y)) ? item.y : this.control.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyControl = true;
};

D.controlX = function (item) {

	this.checkVector('control');
	this.control.x = addStrings(this.control.x, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyControl = true;
};

D.controlY = function (item) {

	this.checkVector('control');
	this.control.y = addStrings(this.control.y, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyControl = true;
};

D.control = function (item = {}) {

	this.checkVector('control');
	this.control.x = (xt(item.x)) ? addStrings(this.control.x, item) : this.control.x;
	this.control.y = (xt(item.y)) ? addStrings(this.control.y, item) : this.control.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyControl = true;
};

S.endX = function (item) {

	this.checkVector('end');
	this.end.x = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEnd = true;
};

S.endY = function (item) {

	this.checkVector('end');
	this.end.y = item;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEnd = true;
};

S.end = function (item = {}) {

	this.checkVector('end');
	this.end.x = (xt(item.x)) ? item.x : this.end.x;
	this.end.y = (xt(item.y)) ? item.y : this.end.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEnd = true;
};

D.endX = function (item) {

	this.checkVector('end');
	this.end.x = addStrings(this.end.x, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEnd = true;
};

D.endY = function (item) {

	this.checkVector('end');
	this.end.y = addStrings(this.end.y, item);
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEnd = true;
};

D.end = function (item = {}) {

	this.checkVector('end');
	this.end.x = (xt(item.x)) ? addStrings(this.end.x, item) : this.end.x;
	this.end.y = (xt(item.y)) ? addStrings(this.end.y, item) : this.end.y;
	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	this.dirtyEnd = true;
};

P.setRectHelper = function (item, side) {

	this.dirtySpecies = true;
	this.dirtyPathObject = true;

	if(!item.substring) return item;
	else {

		let dim;

		if (this.species === 'oval') {

			let here = this.getHostDimensions();
			
			dim = here[side] || 100;
		}
		else dim = (side === 'w') ? this.rectangleWidth || 100 : this.rectangleHeight || 100; 

		return (parseFloat(item) / 100) * dim;
	}
};
S.radius = function (item) {

	this.radiusTLX = this.radiusTRX = this.radiusBRX = this.radiusBLX = this.radiusX = this.setRectHelper(item, 'w');
	this.radiusTLY = this.radiusTRY = this.radiusBRY = this.radiusBLY = this.radiusY = this.setRectHelper(item, 'h');
};
S.radiusX = function (item) {

	this.radiusTLX = this.radiusTRX = this.radiusBRX = this.radiusBLX = this.radiusX = this.setRectHelper(item, 'w');
};
S.radiusY = function (item) {

	this.radiusTLY = this.radiusTRY = this.radiusBRY = this.radiusBLY = this.radiusY = this.setRectHelper(item, 'h');
};
S.radiusT = function (item) {

	this.radiusTLX = this.radiusTLY = this.radiusTRX = this.radiusTRY = this.setRectHelper(item, 'w');
};
S.radiusB = function (item) {

	this.radiusBRX = this.radiusBRY = this.radiusBLX = this.radiusBLY = this.setRectHelper(item, 'w');
};
S.radiusL = function (item) {

	this.radiusTLX = this.radiusTLY = this.radiusBLX = this.radiusBLY = this.setRectHelper(item, 'h');
};
S.radiusR = function (item) {

	this.radiusTRX = this.radiusTRY = this.radiusBRX = this.radiusBRY = this.setRectHelper(item, 'h');
};
S.radiusTX = function (item) {

	this.radiusTLX = this.radiusTRX = this.setRectHelper(item, 'w');
};
S.radiusBX = function (item) {

	this.radiusBRX = this.radiusBLX = this.setRectHelper(item, 'w');
};
S.radiusLX = function (item) {

	this.radiusTLX = this.radiusBLX = this.setRectHelper(item, 'w');
};
S.radiusRX = function (item) {

	this.radiusTRX = this.radiusBRX = this.setRectHelper(item, 'w');
};
S.radiusTY = function (item) {

	this.radiusTLY = this.radiusTRY = this.setRectHelper(item, 'h');
};
S.radiusBY = function (item) {

	this.radiusBRY = this.radiusBLY = this.setRectHelper(item, 'h');
};
S.radiusLY = function (item) {

	this.radiusTLY = this.radiusBLY = this.setRectHelper(item, 'h');
};
S.radiusRY = function (item) {

	this.radiusTRY = this.radiusBRY = this.setRectHelper(item, 'h');
};
S.radiusTL = function (item) {

	this.radiusTLX = this.radiusTLY = this.setRectHelper(item, 'w');
};
S.radiusTR = function (item) {

	this.radiusTRX = this.radiusTRY = this.setRectHelper(item, 'w');
};
S.radiusBL = function (item) {

	this.radiusBLX = this.radiusBLY = this.setRectHelper(item, 'w');
};
S.radiusBR = function (item) {

	this.radiusBRX = this.radiusBRY = this.setRectHelper(item, 'w');
};
S.radiusTLX = function (item) {

	this.radiusTLX = this.setRectHelper(item, 'w');
};
S.radiusTLY = function (item) {

	this.radiusTLY = this.setRectHelper(item, 'h');
};
S.radiusTRX = function (item) {

	this.radiusTRX = this.setRectHelper(item, 'w');
};
S.radiusTRY = function (item) {

	this.radiusTRY = this.setRectHelper(item, 'h');
};
S.radiusBRX = function (item) {

	this.radiusBRX = this.setRectHelper(item, 'w');
};
S.radiusBRY = function (item) {

	this.radiusBRY = this.setRectHelper(item, 'h');
};
S.radiusBLX = function (item) {

	this.radiusBLX = this.setRectHelper(item, 'w');
};
S.radiusBLY = function (item) {

	this.radiusBLY = this.setRectHelper(item, 'h');
};

P.deltaRectHelper = function (item, side, corner) {

	this.dirtySpecies = true;
	this.dirtyPathObject = true;
	
	let r = this[corner];

	if(!item.substring) return (r) ? r + item : item;
	else {

		let here = this.getHostDimensions(),
			dim = here[side] || 100,
			val = (parseFloat(item) / 100) * dim;

		return (r) ? r + val : val;
	}
};
D.radius = function (item) {

	this.radiusTLX = this.radiusTRX = this.radiusBRX = this.radiusBLX = this.radiusX = this.deltaRectHelper(item, 'w', 'radiusX')
	this.radiusTLY = this.radiusTRY = this.radiusBRY = this.radiusBLY = this.radiusY = this.deltaRectHelper(item, 'h', 'radiusY');
};
D.radiusX = function (item) {

	this.radiusTLX = this.radiusTRX = this.radiusBRX = this.radiusBLX = this.radiusX = this.deltaRectHelper(item, 'w', 'radiusX');
};
D.radiusY = function (item) {

	this.radiusTLY = this.radiusTRY = this.radiusBRY = this.radiusBLY = this.radiusY = this.deltaRectHelper(item, 'h', 'radiusY');
};
D.radiusT = function (item) {

	this.radiusTLX = this.radiusTLY = this.radiusTRX = this.radiusTRY = this.deltaRectHelper(item, 'w', 'radiusTLX');
};
D.radiusB = function (item) {

	this.radiusBRX = this.radiusBRY = this.radiusBLX = this.radiusBLY = this.deltaRectHelper(item, 'w', 'radiusBRX');
};
D.radiusL = function (item) {

	this.radiusTLX = this.radiusTLY = this.radiusBLX = this.radiusBLY = this.deltaRectHelper(item, 'h', 'radiusTLX');
};
D.radiusR = function (item) {

	this.radiusTRX = this.radiusTRY = this.radiusBRX = this.radiusBRY = this.deltaRectHelper(item, 'h', 'radiusTRX');
};
D.radiusTX = function (item) {

	this.radiusTLX = this.radiusTRX = this.deltaRectHelper(item, 'w', 'radiusTLX');
};
D.radiusBX = function (item) {

	this.radiusBRX = this.radiusBLX = this.deltaRectHelper(item, 'w', 'radiusBRX');
};
D.radiusLX = function (item) {

	this.radiusTLX = this.radiusBLX = this.deltaRectHelper(item, 'w', 'radiusTLX');
};
D.radiusRX = function (item) {

	this.radiusTRX = this.radiusBRX = this.deltaRectHelper(item, 'w', 'radiusTRX');
};
D.radiusTY = function (item) {

	this.radiusTLY = this.radiusTRY = this.deltaRectHelper(item, 'h', 'radiusTLY');
};
D.radiusBY = function (item) {

	this.radiusBRY = this.radiusBLY = this.deltaRectHelper(item, 'h', 'radiusBRY');
};
D.radiusLY = function (item) {

	this.radiusTLY = this.radiusBLY = this.deltaRectHelper(item, 'h', 'radiusTLY');
};
D.radiusRY = function (item) {

	this.radiusTRY = this.radiusBRY = this.deltaRectHelper(item, 'h', 'radiusTRY');
};
D.radiusTL = function (item) {

	this.radiusTLX = this.radiusTLY = this.deltaRectHelper(item, 'w', 'radiusTLX');
};
D.radiusTR = function (item) {

	this.radiusTRX = this.radiusTRY = this.deltaRectHelper(item, 'w', 'radiusTRX');
};
D.radiusBL = function (item) {

	this.radiusBLX = this.radiusBLY = this.deltaRectHelper(item, 'w', 'radiusBLX');
};
D.radiusBR = function (item) {

	this.radiusBRX = this.radiusBRY = this.deltaRectHelper(item, 'w', 'radiusBRX');
};
D.radiusTLX = function (item) {

	this.radiusTLX = this.deltaRectHelper(item, 'w', 'radiusTLX');
};
D.radiusTLY = function (item) {

	this.radiusTLY = this.deltaRectHelper(item, 'h', 'radiusTLY');
};
D.radiusTRX = function (item) {

	this.radiusTRX = this.deltaRectHelper(item, 'w', 'radiusTRX');
};
D.radiusTRY = function (item) {

	this.radiusTRY = this.deltaRectHelper(item, 'h', 'radiusTRY');
};
D.radiusBRX = function (item) {

	this.radiusBRX = this.deltaRectHelper(item, 'w', 'radiusBRX');
};
D.radiusBRY = function (item) {

	this.radiusBRY = this.deltaRectHelper(item, 'h', 'radiusBRY');
};
D.radiusBLX = function (item) {

	this.radiusBLX = this.deltaRectHelper(item, 'w', 'radiusBLX');
};
D.radiusBLY = function (item) {

	this.radiusBLY = this.deltaRectHelper(item, 'h', 'radiusBLY');
};


/*
## Define prototype functions
*/


/*

*/
P.getBezierXY = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

	return {
		x: Math.pow(1-t,3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
		y: Math.pow(1-t,3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
	};
};

/*

*/
P.getQuadraticXY = function (t, sx, sy, cp1x, cp1y, ex, ey) {

	return {
		x: (1-t) * (1-t) * sx + 2 * (1-t) * t * cp1x + t * t * ex,
		y: (1-t) * (1-t) * sy + 2 * (1-t) * t * cp1y + t * t * ey
	};
};

/*

*/
P.getBezierAngle = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

	let dx = Math.pow(1-t, 2) * (cp1x - sx) + 2 * t * (1 - t) * (cp2x - cp1x) + t * t * (ex - cp2x),
		dy = Math.pow(1-t, 2) * (cp1y - sy) + 2 * t * (1 - t) * (cp2y - cp1y) + t * t * (ey - cp2y);

	return -Math.atan2(dx, dy) + 0.5*Math.PI;
};

/*

*/
P.getQuadraticAngle = function (t, sx, sy, cp1x, cp1y, ex, ey) {

	let dx = 2 * (1 - t) * (cp1x - sx) + 2 * t * (ex - cp1x),
		dy = 2 * (1 - t) * (cp1y - sy) + 2 * t * (ey - cp1y);

	return -Math.atan2(dx, dy) + 0.5*Math.PI;
};

/*
Overwrites mixin.entity.js function
*/
P.cleanHandle = function () {

	if (xt(this.localWidth, this.localHeight)) {

		this.dirtyHandle = false;

		this.cleanVectorParameter('currentHandle', this.handle, this.localWidth, this.localHeight);
	}
};

/*

*/
P.cleanPathObject = function () {

	this.dirtyPathObject = false;

	if (this.species && this.dirtySpecies) this.cleanSpecies();

	this.calculateLocalPath(this.path);
	this.cleanHandle();

	let handle = this.currentHandle;

	this.pathObject = new Path2D(`m${-handle.x},${-handle.y}${this.localPath}`);
};

/*

*/
P.cleanSpecies = function () {

	this.dirtySpecies = false;

	let p = 'M0,0',
		here = this.getHostDimensions();

	switch (this.species) {

		case 'line' :
			if (this.dirtyEnd) this.cleanVectorParameter('currentEnd', this.end, here.w, here.h);
			p = this.makeLinearPath();
			break;

		case 'quadratic' :
			if (this.dirtyEnd) this.cleanVectorParameter('currentEnd', this.end, here.w, here.h);
			if (this.dirtyControl) this.cleanVectorParameter('currentControl', this.control, here.w, here.h);
			p = this.makeQuadraticPath();
			break;

		case 'bezier' :
			if (this.dirtyEnd) this.cleanVectorParameter('currentEnd', this.end, here.w, here.h);
			if (this.dirtyStartControl) this.cleanVectorParameter('currentStartControl', this.startControl, here.w, here.h);
			if (this.dirtyEndControl) this.cleanVectorParameter('currentEndControl', this.endControl, here.w, here.h);
			p = this.makeBezierPath();
			break;

		case 'oval' :
			p = this.makeOvalPath();
			break;

		case 'rectangle' :
			p = this.makeRectanglePath();
			break;

	}

	this.dirtyEnd = false;
	this.dirtyStartControl = false;
	this.dirtyEndControl = false;
	this.dirtyControl = false;

	this.path = p;
};

/*
TODO: this functionality is sub-optimal - the dimensions calculated will rarely coincide with the volumen covered by the drawn shape. A better solution is to draw (fill) the Shape on a canvas and check each pixel for opacity (but that probably requires a web worker and until we get support across browsers for offscreen Canvas elements that can be used in web workers we might as well stick with this solution)
*/
P.calculateLocalPath = function (d) {

	let points = [],
		myData = [],
		command = '',
		localPath = '',
		scale = this.scale,
		start = this.currentStart,
		useAsPath = this.useAsPath,
		units = this.units,
		mySet = d.match(/([A-Za-z][0-9. ,\-]*)/g), 
		i, iz, j, jz;

	let curX = 0, 
		curY = 0, 
		oldX = 0, 
		oldY = 0;

	let xPoints = [],
		yPoints = [];

	let buildArrays = (thesePoints) => {

		myData.push({
			c: command.toLowerCase(),
			p: thesePoints || null,
			x: oldX,
			y: oldY,
		});

		xPoints.push(curX);
		yPoints.push(curY);

		oldX = curX;
		oldY = curY;
	};

	// the purpose of this loop is to 
	// 1. convert all point values fromn strings to floats
	// 2. scale every value
	// 3. relativize every value to the last stated cursor position
	for (i = 0, iz = mySet.length; i < iz; i++) {

		command = mySet[i][0];
		points = mySet[i].match(/(-?[0-9.]+\b)/g) || [];

		if (points.length) {

			for (j = 0, jz = points.length; j < jz; j++) {

				points[j] = parseFloat(points[j]);
			}

			if (i === 0) {

				if (command === 'M') {

					oldX = (points[0] * scale) - start.x;
					oldY = (points[1] * scale) - start.y;
					command = 'm';
				}
			} 
			else {
				
				oldX = curX;
				oldY = curY;
			}

			switch (command) {

				case 'H':
					for (j = 0, jz = points.length; j < jz; j++) {

						points[j] = (points[j] * scale) - oldX;
						curX += points[j];
						buildArrays(points.slice(j, j + 1));
					}
					break;

				case 'V':
					for (j = 0, jz = points.length; j < jz; j++) {

						points[j] = (points[j] * scale) - oldY;
						curY += points[j];
						buildArrays(points.slice(j, j + 1));
					}
					break;

				case 'M':
					for (j = 0, jz = points.length; j < jz; j += 2) {

						points[j] = (points[j] * scale) - oldX;
						points[j + 1] = (points[j + 1] * scale) - oldY;
						curX += points[j];
						curY += points[j + 1];
						buildArrays(points.slice(j, j + 2));
					}
					break;

				case 'L':
				case 'T':
					for (j = 0, jz = points.length; j < jz; j += 2) {

						points[j] = (points[j] * scale) - oldX;
						points[j + 1] = (points[j + 1] * scale) - oldY;
						curX += points[j];
						curY += points[j + 1];
						buildArrays(points.slice(j, j + 2));
					}
					break;

				case 'Q':
				case 'S':
					for (j = 0, jz = points.length; j < jz; j += 4) {

						points[j] = (points[j] * scale) - oldX;
						points[j + 1] = (points[j + 1] * scale) - oldY;
						points[j + 2] = (points[j + 2] * scale) - oldX;
						points[j + 3] = (points[j + 3] * scale) - oldY;
						curX += points[j + 2];
						curY += points[j + 3];
						buildArrays(points.slice(j, j + 4));
					}
					break;

				case 'C':
					for (j = 0, jz = points.length; j < jz; j += 6) {

						points[j] = (points[j] * scale) - oldX;
						points[j + 1] = (points[j + 1] * scale) - oldY;
						points[j + 2] = (points[j + 2] * scale) - oldX;
						points[j + 3] = (points[j + 3] * scale) - oldY;
						points[j + 4] = (points[j + 4] * scale) - oldX;
						points[j + 5] = (points[j + 5] * scale) - oldY;
						curX += points[j + 4];
						curY += points[j + 5];
						buildArrays(points.slice(j, j + 6));
					}
					break;

				case 'A':
					for (j = 0, jz = points.length; j < jz; j += 7) {

						points[j + 5] = (points[j + 5] * scale) - oldX;
						points[j + 6] = (points[j + 6] * scale) - oldY;
						curX += points[j + 5];
						curY += points[j + 6];
						buildArrays(points.slice(j, j + 7));
					}
					break;

				case 'h':
					for (j = 0, jz = points.length; j < jz; j++) {

						points[j] *= scale;
						curX += points[j];
						buildArrays(points.slice(j, j + 1));
					}
					break;

				case 'v':
					for (j = 0, jz = points.length; j < jz; j++) {

						points[j] *= scale;
						curY += points[j];
						buildArrays(points.slice(j, j + 1));
					}
					break;

				case 'm':
				case 'l':
				case 't':
					for (j = 0, jz = points.length; j < jz; j += 2) {

						points[j] *= scale;
						points[j + 1] *= scale;
						curX += points[j];
						curY += points[j + 1];
						buildArrays(points.slice(j, j + 2));
					}
					break;

				case 'q':
				case 's':
					for (j = 0, jz = points.length; j < jz; j += 4) {

						points[j] *= scale;
						points[j + 1] *= scale;
						points[j + 2] *= scale;
						points[j + 3] *= scale;
						curX += points[j + 2];
						curY += points[j + 3];
						buildArrays(points.slice(j, j + 4));
					}
					break;

				case 'c':
					for (j = 0, jz = points.length; j < jz; j += 6) {

						points[j] *= scale;
						points[j + 1] *= scale;
						points[j + 2] *= scale;
						points[j + 3] *= scale;
						points[j + 4] *= scale;
						points[j + 5] *= scale;
						curX += points[j + 4];
						curY += points[j + 5];
						buildArrays(points.slice(j, j + 6));
					}
					break;

				case 'a':
					for (j = 0, jz = points.length; j < jz; j += 7) {

						points[j] *= scale;
						points[j + 1] *= scale;
						points[j + 5] *= scale;
						points[j + 6] *= scale;
						curX += points[j + 5];
						curY += points[j + 6];
						buildArrays(points.slice(j, j + 7));
					}
					break;
			}

		}
		else buildArrays();
	}

	// this loop builds the local path string
	for (i = 0, iz = myData.length; i < iz; i++) {

		let curData = myData[i],
			points = curData.p;

		if (points) {

			for (j = 0, jz = points.length; j < jz; j++) {

				points[j] = points[j].toFixed(1);
			}

			localPath += `${curData.c}${curData.p.join()}`;
		}
		else localPath += `${curData.c}`;
	}

	let maxX = Math.max(...xPoints),
		maxY = Math.max(...yPoints),
		minX = Math.min(...xPoints),
		minY = Math.min(...yPoints);

	this.localWidth = parseFloat((maxX - minX).toFixed(1));
	this.localHeight = parseFloat((maxY - minY).toFixed(1));
	this.localBoxStartX = parseFloat(minX.toFixed(1));
	this.localBoxStartY = parseFloat(minY.toFixed(1));
	this.localPath = localPath;
};

/*

*/
P.stamper = {

	draw: function (engine, entity) {

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);

		engine.stroke(entity.pathObject);
	},

	fill: function (engine, entity) {

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);

		engine.fill(entity.pathObject, entity.winding);
	},

	drawFill: function (engine, entity) {

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);

		engine.stroke(entity.pathObject);
		entity.currentHost.clearShadow();
		engine.fill(entity.pathObject, entity.winding);
	},

	fillDraw: function (engine, entity) {

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);

		engine.stroke(entity.pathObject);
		entity.currentHost.clearShadow();
		engine.fill(entity.pathObject, entity.winding);
		engine.stroke(entity.pathObject);
	},

	floatOver: function (engine, entity) {

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);

		engine.stroke(entity.pathObject);
		engine.fill(entity.pathObject, entity.winding);
	},

	sinkInto: function (engine, entity) {

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);

		engine.fill(entity.pathObject, entity.winding);
		engine.stroke(entity.pathObject);
	},

	clear: function (engine, entity) {

		if (entity.showBoundingBox) entity.drawBoundingBox(engine, entity);

		let gco = engine.globalCompositeOperation;

		engine.globalCompositeOperation = 'destination-out';
		engine.fill(entity.pathObject, entity.winding);
		
		engine.globalCompositeOperation = gco;
	},	
};

/*

*/
P.drawBoundingBox = function (engine, entity) {

	let strokeStyle = engine.strokeStyle,
		lineWidth = engine.lineWidth,
		gco = engine.globalCompositeOperation,
		alpha = engine.globalAlpha,
		handle = entity.currentHandle;

	engine.strokeStyle = 'rgb(0,0,0)';
	engine.lineWidth = 1;
	engine.globalCompositeOperation = 'source-over';
	engine.globalAlpha = 0.5;

	engine.strokeRect(entity.localBoxStartX - handle.x, entity.localBoxStartY - handle.y, entity.localWidth, entity.localHeight);

	engine.strokeStyle = strokeStyle;
	engine.lineWidth = lineWidth;
	engine.globalCompositeOperation = gco;
	engine.globalAlpha = alpha;
};

/**

**/
P.makeOvalPath = function () {

	let A = this.offshootA,
		B = this.offshootB;

	let width = this.radiusX * 2,
		height = this.radiusY * 2,
		port = width * this.intersectX,
		starboard = width - port,
		fore = height * this.intersectY,
		aft = height - fore;

	let myData = `m${port},0`;

	myData += `c${starboard * A},${fore * B} ${starboard - (starboard * B)},${fore - (fore * A)}, ${starboard},${fore} `;
	myData += `${-starboard * B},${aft * A} ${-starboard + (starboard * A)},${aft - (aft * B)} ${-starboard},${aft} `;
	myData += `${-port * A},${-aft * B} ${-port + (port * B)},${-aft + (aft * A)} ${-port},${-aft} `;
	myData += `${port * B},${-fore * A} ${port - (port * A)},${-fore + (fore * B)} ${port},${-fore}z`;

	return myData;
};


/**

**/
P.makeRectanglePath = function () {

	let width = this.rectangleWidth,
		height = this.rectangleHeight;

	let A = this.offshootA,
		B = this.offshootB;

	let _tlx = this.radiusTLX,
		_tly = this.radiusTLY,
		_trx = this.radiusTRX,
		_try = this.radiusTRY,
		_brx = this.radiusBRX,
		_bry = this.radiusBRY,
		_blx = this.radiusBLX,
		_bly = this.radiusBLY;

	let myData = `m${_tlx},0`;

	if (width - _tlx - _trx !== 0) myData += `h${width - _tlx - _trx}`;

	if (_trx + _try !== 0) myData += `c${_trx * A},${_try * B} ${_trx - (_trx * B)},${_try - (_try * A)}, ${_trx},${_try}`;
	
	if (height - _try - _bry !== 0) myData += `v${height - _try - _bry}`;
	
	if (_brx + _bry !== 0) myData += `c${-_brx * B},${_bry * A} ${-_brx + (_brx * A)},${_bry - (_bry * B)} ${-_brx},${_bry}`;
	
	if (-width + _blx + _brx !== 0) myData += `h${-width + _blx + _brx}`;
	
	if (_blx + _bly !== 0) myData += `c${-_blx * A},${-_bly * B} ${-_blx + (_blx * B)},${-_bly + (_bly * A)} ${-_blx},${-_bly}`;
	
	if (-height + _tly + _bly !== 0) myData += `v${-height + _tly + _bly}`;
	
	if (_tlx + _tly !== 0) myData += `c${_tlx * B},${-_tly * A} ${_tlx - (_tlx * A)},${-_tly + (_tly * B)} ${_tlx},${-_tly}`;

	myData += 'z';

	return myData;
};

/**

**/
P.makeBezierPath = function () {
	
	let startX = this.currentStart.x,
		startY = this.currentStart.y,
		startControlX = this.currentStartControl.x,
		startControlY = this.currentStartControl.y,
		endControlX = this.currentEndControl.x,
		endControlY = this.currentEndControl.y,
		endX = this.currentEnd.x,
		endY = this.currentEnd.y;

	return `m0,0c${(startControlX - startX)},${(startControlY - startY)} ${(endControlX - startX)},${(endControlY - startY)} ${(endX - startX)},${(endY - startY)}`;
};

/**

**/
P.makeQuadraticPath = function (items = {}) {
	
	let startX = this.currentStart.x,
		startY = this.currentStart.y,
		controlX = this.currentControl.x,
		controlY = this.currentControl.y,
		endX = this.currentEnd.x,
		endY = this.currentEnd.y;

	return `m0,0q${(controlX - startX)},${(controlY - startY)} ${(endX - startX)},${(endY - startY)}`;
};

/**

**/
P.makeLinearPath = function (items = {}) {
	
	let startX = this.currentStart.x,
		startY = this.currentStart.y,
		endX = this.currentEnd.x,
		endY = this.currentEnd.y;

	return `m0,0l${(endX - startX)},${(endY - startY)}`;
};

		/**
A __factory__ function to generate regular entitys such as triangles, stars, hexagons, etc

The argument can include:
* __angle__ - Number; eg an angle of 72 produces a pentagon, while 144 produces a five-pointed star - default: 0
* __sides__ - Number; number of sides to the regular entity - default: 0
* __outline__ - Number; default: 0
* __radius__ - Number; default: 0 (not retained)
* __startControlX__ - Number or % String - x coordinate for control (quadratic) or startControl (bezier) curve; default: 0 (not retained)
* __controlX__ - alias for startControlX; default: 0 (not retained)
* __startControlY__ - Number or % String - y coordinate for control (quadratic) or startControl (bezier) curve; default: 0 (not retained)
* __controlY__ - alias for startControlY; default: 0 (not retained)
* __endControlX__ - Number or % String - x coordinate for endControl (bezier) curve; default: 0 (not retained)
* __endControlY__ - Number or % String - y coordinate for endControl (bezier) curve; default: 0 (not retained)
* __lineType__ - String defining type of line/curve to use for generated entity (not retained)
* __shape__ - Boolean, true to create Shape; false (default) to create Path (not retained)
* any other legitimate Entity, Context or Shape/Path attribute

Entitys can be generated using lines, or quadratic or bezier curves. The species of line to use is defined in the __lineType__ attribute which accepts the following values:
* '__l__' - straight line (default)
* '__q__' - quadratic curve
* '__t__' - reflected quadratic curve
* '__c__' - bezier curve
* '__s__' - reflected bezier curve

_Either the 'angle' attribute or the 'sides' attribute (but not both) must be included in the argument object_

Percentage String values are relative to the entity's cell's dimensions

@method makeRegularShape
@param {Object} items Object containing attributes
@return Shape or Path entity object
**/
// my.makeRegularShape = function(items) {
// 	var stat1 = ['c', 's', 'q', 't', 'l'],
// 		stat2 = ['s', 't'],
// 		stat3 = ['c', 's', 'q', 't'],
// 		stat4 = ['c', 'q'],
// 		cell,
// 		startX, startY, radius,
// 		turn, currentAngle,
// 		count, test,
// 		species,
// 		c1x, c1y, c2x, c2y,
// 		data,
// 		conv = my.Position.prototype.numberConvert,
// 		get = my.xtGet,
// 		cont = my.contains,
// 		wv1, wv2, wc1, wc2,
// 		sides, angle;
// 	items = my.safeObject(items);
// 	cell = my.Entity.prototype.getEntityCell(items);
// 	sides = items.sides;
// 	angle = items.angle;
// 	if (my.xto(sides, angle)) {
// 		items.closed = true;
// 		items.isLine = false;
// 		c1x = get(items.startControlX, items.controlX, 0);
// 		c1y = get(items.startControlY, items.controlY, 0);
// 		c2x = items.endControlX || 0;
// 		c2y = items.endControlY || 0;
// 		c1x = (c1x.substring) ? conv(c1x, cell.actualWidth) : c1x;
// 		c1y = (c1y.substring) ? conv(c1y, cell.actualHeight) : c1y;
// 		c2x = (c2x.substring) ? conv(c2x, cell.actualWidth) : c2x;
// 		c2y = (c2y.substring) ? conv(c2y, cell.actualHeight) : c2y;
// 		species = (cont(stat1, items.lineType)) ? items.lineType : 'l';
// 		radius = items.radius || 20;
// 		// - known bug: items.sides has difficulty exiting the loop, hence the count<1000 limit
// 		turn = (sides && sides.toFixed && sides > 1) ? 360 / sides : ((angle && angle.toFixed && angle > 0) ? angle : 4);
// 		currentAngle = 0;
// 		count = 0;
// 		wv1 = my.requestVector();
// 		wv2 = my.requestVector();
// 		wc1 = my.requestVector();
// 		wc2 = my.requestVector();
// 		wv1.x = wv2.x = radius;
// 		wv1.y = wv2.y = 0;
// 		wc1.x = c1x;
// 		wc1.y = c1y;
// 		wc2.x = c2x;
// 		wc2.y = c2y;
// 		data = 'm' + wv1.x.toFixed(1) + ',' + wv1.y.toFixed(1);
// 		if (cont(stat2, species)) {
// 			data += ('s' === species) ? 'c' : 'q';
// 		}
// 		else {
// 			data += species;
// 		}
// 		do {
// 			count++;
// 			currentAngle += turn;
// 			currentAngle = currentAngle % 360;
// 			test = currentAngle.toFixed(0);
// 			wv1.rotate(turn);
// 			wc1.rotate(turn);
// 			wc2.rotate(turn);
// 			if (cont(stat3, species)) {
// 				if (1 === count && cont(stat2, species)) {
// 					if ('s' === species) {
// 						data += wc1.x.toFixed(1) + ',' + wc1.y.toFixed(1) + ' ' + wc2.x.toFixed(1) + ',' + wc2.y.toFixed(1) + ' ';
// 					}
// 					else {
// 						data += wc1.x.toFixed(1) + ',' + wc1.y.toFixed(1) + ' ';
// 					}
// 				}
// 				else {
// 					if ('s' === species) {
// 						data += wc2.x.toFixed(1) + ',' + wc2.y.toFixed(1) + ' ';
// 					}
// 					else if (cont(stat4, species)) {
// 						data += wc1.x.toFixed(1) + ',' + wc1.y.toFixed(1) + ' ';
// 					}
// 				}
// 			}
// 			if ('c' === species) {
// 				data += wc2.x.toFixed(1) + ',' + wc2.y.toFixed(1) + ' ';
// 			}
// 			data += (wv1.x - wv2.x).toFixed(1) + ',' + (wv1.y - wv2.y).toFixed(1) + ' ';
// 			if (1 === count) {
// 				if (cont(stat2, species)) {
// 					data += ('s' === species) ? 's' : 't';
// 				}
// 			}
// 			wv2.set(wv1);
// 		} while (test !== '0' && count < 1000);
// 		data += 'z';
// 		items.data = data;
// 		my.releaseVector(wv1);
// 		my.releaseVector(wv2);
// 		my.releaseVector(wc1);
// 		my.releaseVector(wc2);
// 		return (items.shape) ? my.makeShape(items) : my.makePath(items);
// 	}
// 	return false;
// };

/*
## Exported factory functions
*/
const makeShape = function (items) {

	return new Shape(items);
};

const makeLine = function (items = {}) {

	items.species = 'line';
	return new Shape(items);
};

const makeQuadratic = function (items = {}) {

	items.species = 'quadratic';
	return new Shape(items);
};

const makeBezier = function (items = {}) {

	items.species = 'bezier';
	return new Shape(items);
};

const makeRectangle = function (items = {}) {

	items.species = 'rectangle';
	return new Shape(items);
};

const makeOval = function (items = {}) {

	items.species = 'oval';
	return new Shape(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Shape = Shape;

export {
	makeShape,

	makeLine,
	makeQuadratic,
	makeBezier,
	makeRectangle,
	makeOval,
};
