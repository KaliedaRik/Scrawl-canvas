/*
# Point factory
*/
import { constructors, group, artefact } from '../core/library.js';
import { defaultNonReturnFunction, mergeOver } from '../core/utilities.js';
import { currentGroup } from '../core/DOM.js';

import { requestVector, releaseVector } from '../factory/vector.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';

/*
## Point constructor
*/
const Point = function (items = {}) {

	this.makeName(items.name);
	this.register();
	this.set(this.defs);

	if (!items.group) items.group = currentGroup;

	this.set(items);

	this.localWidth = this.width = 1;
	this.localHeight = this.height = 1;

	this.currentHandle = this.handle = {x: 0, y: 0};
	this.currentOffset = this.offset = {x: 0, y: 0};

	this.dirtyStart = true;

	this.dirtyRotation = null;
	this.dirtyScale = null;

	return this;
};

/*
## Point object prototype setup
*/
let P = Point.prototype = Object.create(Object.prototype);
P.type = 'Point';
P.lib = 'point';
P.isArtefact = true;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	hitRadius: 20,

/*

*/
	species: '',
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/
G.width = () => 1;
G.height = () => 1;
G.scale = () => 1;
G.roll = () => 0;

/*

*/
S.width = defaultNonReturnFunction;
S.height = defaultNonReturnFunction;
S.handleX = defaultNonReturnFunction;
S.handleY = defaultNonReturnFunction;
S.handle = defaultNonReturnFunction;
S.scale = defaultNonReturnFunction;
S.roll = defaultNonReturnFunction;

/*

*/
G.group = function () {
	return (this.group) ? this.group.name : '';
};

/*
ISSUE - stack elements get given a group String for this attribute; here we're just assigning the entire group object
- they need to be brought more into alignment!
*/
S.group = function (item) {

	let g;

	if (this.group) this.group.removeArtefacts(this.name);

	if (item) {

		if (item.substring) {

			g = group[item];
			if (g) this.group = g;
		}
		else if (item.type === 'Group') this.group = item;
		else this.group = null;
	}

	if(this.group) this.group.addArtefacts(this.name);
};

/*

*/
D.width = defaultNonReturnFunction;
D.height = defaultNonReturnFunction;
D.handleX = defaultNonReturnFunction;
D.handleY = defaultNonReturnFunction;
D.handle = defaultNonReturnFunction;
D.scale = defaultNonReturnFunction;
D.roll = defaultNonReturnFunction;


/*
## Define prototype functions
*/

/*

*/
P.prepareStamp = function () {

	if (this.dirtyStart) this.cleanStart();
	if (this.dirtyOffset) this.cleanOffset();
};

P.cleanStart = function () {

	let host = this.currentHost;

	if (host) {

		this.cleanVectorParameter('currentStart', this.start, host.localWidth, host.localHeight);
		this.dirtyStart = false;
	}
};

P.cleanOffset = function () {

	let dims = this.cleanOffsetHelper();

	this.cleanVectorParameter('currentOffset', this.offset, dims[0], dims[1]);
	this.dirtyOffset = false;
};

P.stamp = function () {

	let pivot, handle, tOffset, pOffset, scale, v, x, y;

	if (this.pivot) pivot = artefact[this.pivot];

	if (pivot) {

		handle = pivot.currentHandle;
		scale = pivot.scale;
		pOffset = pivot.currentOffset;
		tOffset = this.currentOffset;

		x = (pivot.flipReverse) ?
			(handle.x * scale) - tOffset.x :
			(-handle.x * scale) + tOffset.x;

		y = (pivot.flipUpend) ?
			(handle.y * scale) - tOffset.y :
			(-handle.y * scale) + tOffset.y;

		if (pivot.roll) {

			v = requestVector().setXY(x, y).rotate(pivot.roll);
			this.stampX = pivot.stampX + pOffset.x + v.x;
			this.stampY = pivot.stampY + pOffset.y + v.y;
			releaseVector(v);
		}
		else {

			this.stampX = pivot.stampX + pOffset.x + x;
			this.stampY = pivot.stampY + pOffset.y + y;
		}
	}
	else {

		this.updateStampX();
		this.updateStampY();
	}
	return Promise.resolve(true);
};


/*
## Exported factory function
*/
const makePoint = function (items) {
	return new Point(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Point = Point;

export {
	makePoint,
};
