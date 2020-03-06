/*
# Quaternion factory

TODO - documentation
*/
import { radian, constructors } from '../core/library.js';
import { isa_quaternion, isa_vector, isa_number, xt, xto } from '../core/utilities.js';

import { requestVector, releaseVector, makeVector } from './vector.js';

/*
## Quaternion constructor
*/
const Quaternion = function (items = {}) {

	let vec = items.v || {};

	this.name = items.name || 'generic';
	this.n = items.n || 1;
	
	this.v = makeVector({
		x: vec.x || items.x || 0,
		y: vec.y || items.y || 0,
		z: vec.z || items.z || 0,
	});

	return this;
};

/*
## Quaternion object prototype setup
*/
let P = Quaternion.prototype = Object.create(Object.prototype);

P.type = 'Quaternion';

/*
## Define default attributes
*/
P.defs = {

/*
TODO - documentation
*/
	name: 'generic',

/*
TODO - documentation
*/
	n: 1,

/*
TODO - documentation

Not happy with this! Prefer it to be set to null in the defs, and instantiated in the constructor
*/
	v: {
		x: 0,
		y: 0,
		z: 0
	},
};

/*
## Define prototype functions
*/


/*
TODO - documentation
*/
P.zero = function () {

	let v = this.v;

	this.n = 1;
	v.x = 0;
	v.y = 0;
	v.z = 0;

	return this;
};

/*
TODO - documentation
*/
P.getMagnitude = function () {

	let v = this.v;

	return Math.sqrt((this.n * this.n) + (v.x * v.x) + (v.y * v.y) + (v.z * v.z));
};

/*
TODO - documentation
*/
P.normalize = function () {

	let mag = this.getMagnitude(),
		v = this.v;

	if (!mag) throw new Error(`${this.name} Quaternion error - normalize() division by zero: ${mag}`);

	this.n /= mag;
	this.n = (this.n > -0.000001 && this.n < 0.000001) ? 0 : this.n;

	v.x /= mag;
	v.x = (v.x > -0.000001 && v.x < 0.000001) ? 0 : v.x;

	v.y /= mag;
	v.y = (v.y > -0.000001 && v.y < 0.000001) ? 0 : v.y;

	v.z /= mag;
	v.z = (v.z > -0.000001 && v.z < 0.000001) ? 0 : v.z;

	return this;
};

/*
TODO - documentation
*/
P.set = function (items = {}) {

	if (isa_quaternion(items)) return this.setFromQuaternion(items);

	if (isa_vector(items)) return this.setFromVector(items);

	if (xto(items.pitch, items.yaw, items.roll)) return this.setFromEuler(items);

	let x, y, z, n, v,
		tv = this.v;

	v = (xt(items.vector) || xt(items.v)) ? (items.vector || items.v) : false;
	n = (xt(items.scalar) || xt(items.n)) ? (items.scalar || items.n || 0) : false;

	x = (v) ? (v.x || 0) : items.x || false;
	y = (v) ? (v.y || 0) : items.y || false;
	z = (v) ? (v.z || 0) : items.z || false;

	this.n = (isa_number(n)) ? n : this.n;

	tv.x = (isa_number(x)) ? x : tv.x;
	tv.y = (isa_number(y)) ? y : tv.y;
	tv.z = (isa_number(z)) ? z : tv.z;
	
	return this;
};

/*
TODO - documentation
*/
P.setFromQuaternion = function (item) {

	if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - setFromQuaternion() bad argument: ${item}`);

	let tv = this.v,
		iv = item.v;

	this.n = item.n;
	tv.x = iv.x;
	tv.y = iv.y;
	tv.z = iv.z;
	
	return this;
};

/*
TODO - documentation
*/
P.quaternionMultiply = function (item) {

	if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - quaternionMultiply() bad argument: ${item}`);

	let tv = this.v,
		iv = item.v,

		n1 = this.n,
		x1 = tv.x,
		y1 = tv.y,
		z1 = tv.z,

		n2 = item.n,
		x2 = iv.x,
		y2 = iv.y,
		z2 = iv.z;

	this.n = (n1 * n2) - (x1 * x2) - (y1 * y2) - (z1 * z2);

	tv.x = (n1 * x2) + (x1 * n2) + (y1 * z2) - (z1 * y2);
	tv.y = (n1 * y2) + (y1 * n2) + (z1 * x2) - (x1 * z2);
	tv.z = (n1 * z2) + (z1 * n2) + (x1 * y2) - (y1 * x2);

	return this;
};

/*
TODO - documentation
*/
P.getAngle = function (degree) {

	let result;

	degree = (xt(degree)) ? degree : false;

	result = 2 * Math.acos(this.n);

	if(degree){

		result *= (1 / radian);
	}

	return (result > -0.000001 && result < 0.000001) ? 0 : result;
};

/*
TODO - documentation
*/
P.quaternionRotate = function (item) {

	if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - quaternionRotate() bad argument: ${item}`);

	let q4 = requestQuaternion(item),
		q5 = requestQuaternion(this);

	this.setFromQuaternion(q4.quaternionMultiply(q5));

	releaseQuaternion(q4);
	releaseQuaternion(q5);
	
	return this
};

/*
TODO - documentation
*/
P.setFromEuler = function (items = {}) {

	let pitch, yaw, roll, c1, c2, c3, s1, s2, s3,
		cos = Math.cos,
		sin = Math.sin,
		tv = this.v;

	pitch = (items.pitch || items.x || 0) * radian;
	yaw = (items.yaw || items.y || 0) * radian;
	roll = (items.roll || items.z || 0) * radian;

    c1 = cos( pitch / 2 );
    c2 = cos( yaw / 2 );
    c3 = cos( roll / 2 );

    s1 = sin( pitch / 2 );
    s2 = sin( yaw / 2 );
    s3 = sin( roll / 2 );

    tv.x = s1 * c2 * c3 + c1 * s2 * s3;
    tv.y = c1 * s2 * c3 + s1 * c2 * s3;
    tv.z = c1 * c2 * s3 - s1 * s2 * c3;

    this.n = c1 * c2 * c3 - s1 * s2 * s3;

	return this;
};

/*
TODO - need to make a decision - are we going to keep the following functions, or ditch them?
*/

/*
P.checkNormal = function (tolerance) {

	let check;

	tolerance = (xt(tolerance)) ? tolerance : 0;

	check = this.getMagnitude();

	if (check >= 1 - tolerance && check <= 1 + tolerance) {
		return true;
	}
	return false;
};

P.getVector = function () {
	return this.v;
};

P.getScalar = function () {
	return this.n;
};

P.quaternionAdd = function (item) {

	let tv, iv;

	if (isa_quaternion(item)) {

		tv = this.v;
		iv = item.v;
		this.n += item.n || 0;
		tv.x += iv.x || 0;
		tv.y += iv.y || 0;
		tv.z += iv.z || 0;

		return this;
	}
	return this;
};

P.quaternionSubtract = function (item) {

	let tv, iv;

	if (isa_quaternion(item)) {

		tv = this.v;
		iv = item.v;
		this.n -= item.n || 0;
		tv.x -= iv.x || 0;
		tv.y -= iv.y || 0;
		tv.z -= iv.z || 0;

		return this;
	}
	return this;
};

P.scalarMultiply = function (item) {

	let tv;

	if (item.toFixed) {

		tv = this.v;
		this.n *= item;
		tv.x *= item;
		tv.y *= item;
		tv.z *= item;

		return this;
	}
	return this;
};

P.scalarDivide = function (item) {

	let tv;

	if (item.toFixed && item !== 0) {

		tv = this.v;
		this.n /= item;
		tv.x /= item;
		tv.y /= item;
		tv.z /= item;

		return this;
	}
	return this;
};

P.conjugate = function () {

	let tv = this.v;

	tv.x = -tv.x;
	tv.y = -tv.y;
	tv.z = -tv.z;

	return this;
};

P.setFromVector = function (item) {

	let tv;

	if (isa_vector(item)) {

		tv = this.v;
		this.n = 0;
		tv.x = item.x;
		tv.y = item.y;
		tv.z = item.z;
		
		return this;
	}
	return this;
};

P.vectorMultiply = function (item) {

	let x1, y1, z1, n1, x2, y2, z2, tv;

	if (isa_vector(item)) {

		tv = this.v;

		n1 = this.n;
		x1 = tv.x;
		y1 = tv.y;
		z1 = tv.z;

		x2 = item.x;
		y2 = item.y;
		z2 = item.z;

		this.n = -((x1 * x2) + (y1 * y2) + (z1 * z2));

		tv.x = (n1 * x2) + (y1 * z2) - (z1 * y2);
		tv.y = (n1 * y2) + (z1 * x2) - (x1 * z2);
		tv.z = (n1 * z2) + (x1 * y2) - (y1 * x2);

		return this;
	}
	return this;
};

P.getAxis = function () {

	let magnitude, result,
		v = requestVector();

	v.set(this.v);

	magnitude = this.getMagnitude();

	result = (magnitude !== 0) ? v.scalarDivide(magnitude) : v;
	
	releaseVector(v);
	return result;
};

P.vectorRotate = function (item) {

	if (isa_vector(item)) {
		return item.rotate3d(this);
	}
	return false;
};

P.getEulerAngles = function () {
	let sqw, sqx, sqy, sqz, unit, test,
		result = {
			pitch: 0,
			yaw: 0,
			roll: 0
		},
		t0, t1, 
		tv = this.v,
		tan = Math.atan2,
		pi = Math.PI;

	sqw = this.n * this.n;
	sqx = tv.x * tv.x;
	sqy = tv.y * tv.y;
	sqz = tv.z * tv.z;

	unit = sqw + sqx + sqy + sqz;

	test = (tv.x * tv.y) + (tv.z * this.n);

	if (test > 0.499999 * unit) {

		result.yaw = (2 * tan(tv.x, this.n)) / radian;
		result.roll = (pi / 2) / radian;
		result.pitch = 0;
		return result;
	}
	if (test < -0.499999 * unit) {

		result.yaw = (-2 * tan(tv.x, this.n)) / radian;
		result.roll = (-pi / 2) / radian;
		result.pitch = 0;
		return result;
	}

	t0 = (2 * tv.y * this.n) - (2 * tv.x * tv.z);
	t1 = sqx - sqy - sqz + sqw;
	result.yaw = (tan(t0, t1)) / radian;

	result.roll = (Math.asin((2 * test) / unit)) / radian;

	t0 = (2 * tv.x * this.n) - (2 * tv.y * tv.z);
	t1 = sqy - sqx - sqz + sqw;
	result.pitch = (tan(t0, t1)) / radian;
	
	if (result.yaw >= -0.00001 && result.yaw <= 0.00001) {
		result.yaw = 0;
	}

	if (result.roll >= -0.00001 && result.roll <= 0.00001) {
		result.roll = 0;
	}

	if (result.pitch >= -0.00001 && result.pitch <= 0.00001) {
		result.pitch = 0;
	}
	
	return result;
};

P.getEulerRoll = function () {

	let unit, test,
		tv = this.v,
		tn = this.n,
		pi = Math.PI,
		pow = Math.pow,
		result;

	unit = pow(this.n, 2) + pow(tv.x, 2) + pow(tv.y, 2) + pow(tv.z, 2);
	test = (tv.x * tv.y) + (tv.z * this.n);

	if (test > 0.499999 * unit) {
		result = (pi / 2) / radian;
	}
	else if (test < -0.499999 * unit) {
		result = (-pi / 2) / radian;
	}
	else {
		result = (Math.asin((2 * test) / unit)) / radian;
		if (this.name === 'Element.button2.rotation') {
			console.log(result);
		}
	}

	if (result >= -0.00001 && result <= 0.00001) {
		return 0;
	}
	else {
		return parseFloat(result.toFixed(4));
	}
};
*/

/*
## Quaternion pool - an attempt to reuse quaternions rather than constantly creating and deleting them

TODO - check to see if we're actually using the pool in any of the code (including demos)?
*/
const quaternionPool = [];
let quaternionPoolCount = 0;

const quaternionPoolLength = function () {

	return `${quaternionPool.length} (from ${quaternionPoolCount} generated)`;
};

const requestQuaternion = function (items) {

	if (!quaternionPool.length) {
		quaternionPool.push(makeQuaternion({
			name: 'pool'
		}));

		quaternionPoolCount++;
	}

	let q = quaternionPool.shift();

	q.set(items);
	return q
};

const releaseQuaternion = function (q) {

	if (q && q.type === 'Quaternion') {

		quaternionPool.push(q.zero());
	}
};

const checkQuaternion = function (item) {

	if (item && item.type === 'Quaternion') return item;
	else return new Quaternion(item);
};

/*
## Exported factory function
*/
const makeQuaternion = function (items = {}) {

	let q = new Quaternion(items);

	if (xto(items.pitch, items.yaw, items.roll)) {
		return q.setFromEuler(items);
	}

	return q;
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Quaternion = Quaternion;


/*
TODO - documentation
*/
export {
	makeQuaternion,
	requestQuaternion,
	releaseQuaternion,
	checkQuaternion,
	quaternionPoolLength,
};
