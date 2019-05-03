/*
# Vector factory
*/
import { constructors } from '../core/library.js';
import { isa_obj, isa_quaternion, isa_vector, xtGet, xta } from '../core/utilities.js';

import { requestQuaternion, releaseQuaternion } from './quaternion.js';

/*
## Vector constructor
*/
const Vector = function (items = {}) {

	this.x = items.x || 0;
	this.y = items.y || 0;
	this.z = items.z || 0;

	this.name = items.name || 'generic';

	return this;
};

/*
## Quaternion object prototype setup
*/
let P = Vector.prototype = Object.create(Object.prototype);

P.type = 'Vector';

/*
## Define default attributes
*/
P.defs = {

/*

*/
	x: 0,

/*

*/
	y: 0,

/*

*/
	z: 0,

/*

*/
	name: 'generic'
};

/*
## Define prototype functions
*/


/*

*/
P.zero = function () {

	this.x = 0;
	this.y = 0;
	this.z = 0;
	return this;
};

/*

*/
P.set = function (items = {}) {

	this.x = (xtGet(items.x, this.x));
	this.y = (xtGet(items.y, this.y));
	this.z = (xtGet(items.z, this.z));
	return this;
};

/*

*/
P.setXY = function (x, y) {

	this.x = (xtGet(x, this.x));
	this.y = (xtGet(y, this.y));
	return this;
};

/*

*/
P.vectorAdd = function (item = {}) {

	this.x += item.x || 0;
	this.y += item.y || 0;
	this.z += item.z || 0;
	return this;
};

/*

*/
P.vectorSubtract = function (item = {}) {

	this.x -= item.x || 0;
	this.y -= item.y || 0;
	this.z -= item.z || 0;
	return this;
};

/*

*/
P.scalarMultiply = function (item) {

	if (item.toFixed) {
		this.x *= item;
		this.y *= item;
		this.z *= item;
		return this;
	}
	return this;
};

/*

*/
P.getMagnitude = function () {
	return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
};

/*

*/
P.rotate = function (angle) {

	let stat_vr = [0, 0];

	if (angle.toFixed) {
		stat_vr[0] = Math.atan2(this.y, this.x);
		stat_vr[0] += (angle * 0.01745329251);
		stat_vr[1] = this.getMagnitude();
		this.x = stat_vr[1] * Math.cos(stat_vr[0]);
		this.y = stat_vr[1] * Math.sin(stat_vr[0]);
	}
	return this;
};

/*

*/
P.reverse = function () {

	this.x = -this.x;
	this.y = -this.y;
	this.z = -this.z;
	return this;
};


/*
P.setMagnitudeTo = function (item) {

	this.normalize();
	this.scalarMultiply(item);

	if (this.getMagnitude() !== item) {

		this.normalize();
		this.scalarMultiply(item);

		if (this.getMagnitude() !== item) {

			this.normalize();
			this.scalarMultiply(item);
		}
	}
	return this;
};

P.normalize = function () {

	let val = this.getMagnitude();

	if (val > 0) {

		this.x /= val;
		this.y /= val;
		this.z /= val;
	}
	return this;
};

P.isEqual = function (item) {

	if (isa_vector(item)) {

		if (this.x === item.x && this.y === item.y && this.z === item.z) return true;
	}
	return false;
};

P.isLike = function (item) {

	if (isa_obj(item)) {
		if (this.x === item.x && this.y === item.y && this.z === item.z) return true;
	}
	return false;
};

P.getData = function () {

	return {
		x: this.x,
		y: this.y,
		z: this.z
	};
};

P.hasCoordinates = function (item) {
	return (xta(item, item.x, item.y)) ? true : false;
};

P.vectorMultiply = (item = {}) => {

	this.x *= item.x || 1;
	this.y *= item.y || 1;
	this.z *= item.z || 1;
	return this;
};

P.vectorDivide = function (item = {}) {

	this.x /= ((item.x || 0) !== 0) ? item.x : 1;
	this.y /= ((item.y || 0) !== 0) ? item.y : 1;
	this.z /= ((item.z || 0) !== 0) ? item.z : 1;
	return this;
};

P.scalarDivide = function (item) {

	if ((item.toFixed) && item !== 0) {

		this.x /= item;
		this.y /= item;
		this.z /= item;
		return this;
	}
	return this;
};

P.checkNotZero = function () {
	return (this.x || this.y || this.z) ? true : false;
};

P.getVector = function () {

	return new Vector({
		x: this.x,
		y: this.y,
		z: this.z
	});
};

P.getCrossProduct = function (u, v) {

	let v1x,
		v1y,
		v1z,
		v2x,
		v2y,
		v2z;

	if (isa_obj(u)) {

		v = (isa_obj(v)) ? v : this;
		v1x = v.x || 0;
		v1y = v.y || 0;
		v1z = v.z || 0;
		v2x = u.x || 0;
		v2y = u.y || 0;
		v2z = u.z || 0;

		return new Vector({
			x: (v1y * v2z) - (v1z * v2y),
			y: -(v1x * v2z) + (v1z * v2x),
			z: (v1x * v2y) + (v1y * v2x)
		});
	}
	return this;
};

P.getDotProduct = function (u, v) {

	if (isa_obj(u)) {

		v = (isa_obj(v)) ? v : this;
		return ((u.x || 0) * (v.x || 0)) + ((u.y || 0) * (v.y || 0)) + ((u.z || 0) * (v.z || 0));
	}
	return false;
};

P.getTripleScalarProduct = function (u, v, w) {

	let ux,
		uy,
		uz,
		vx,
		vy,
		vz,
		wx,
		wy,
		wz;

	if (isa_obj(u) && isa_obj(v)) {

		w = (isa_obj(w)) ? w : this;
		ux = u.x || 0;
		uy = u.y || 0;
		uz = u.z || 0;
		vx = v.x || 0;
		vy = v.y || 0;
		vz = v.z || 0;
		wx = w.x || 0;
		wy = w.y || 0;
		wz = w.z || 0;
		return (ux * ((vy * wz) - (vz * wy))) + (uy * (-(vx * wz) + (vz * wx))) + (uz * ((vx * wy) - (vy * wx)));
	}
	return false;
};

P.reverse = function () {

	this.x = -this.x;
	this.y = -this.y;
	this.z = -this.z;
	return this;
};

P.rotate3d = function (item, mag) {

	let q1 = requestQuaternion(),
		q2 = requestQuaternion(),
		q3 = requestQuaternion();

	if (isa_quaternion(item)) {

		mag = (mag && mag.toFixed) ? mag : this.getMagnitude();
		q1.set(item);
		q2.set(this);
		q3.set(item).conjugate();
		q1.quaternionMultiply(q2);
		q1.quaternionMultiply(q3);
		this.set(q1.v).setMagnitudeTo(mag);
		releaseQuaternion(q1);
		releaseQuaternion(q2);
		releaseQuaternion(q3);
		return this;
	}
	return this;
};
*/

/*
## Vector pool - an attempt to reuse quaternions rather than constantly creating and deleting them
*/
const vectorPool = [];

const requestVector = function (items) {

	if (!vectorPool.length) {
		vectorPool.push(new Vector({
			name: 'pool'
		}));
	}

	let v = vectorPool.shift();
	v.set(items);
	return v
};

const releaseVector = function (v) {

	if (v && v.type === 'Vector') vectorPool.push(v.zero());
};

/*
## Exported factory function
*/
const makeVector = function (items) {
	return new Vector(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Vector = Vector;

export {
	makeVector,
	requestVector,
	releaseVector,
};
