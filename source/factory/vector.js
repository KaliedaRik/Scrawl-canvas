/*
# Vector factory

TODO - documentation

#### To instantiate objects from the factory

#### Library storage

#### Clone functionality

#### Kill functionality
*/
import { constructors } from '../core/library.js';
import { xt, xta, isa_obj, isa_number } from '../core/utilities.js';

/*
## Vector constructor
*/
const Vector = function (x, y) {

	this.x = 0;
	this.y = 0;
	this.z = 0;

	if (xt(x)) this.set(x, y);

	return this;
};

/*
## Vector object prototype setup
*/
let P = Vector.prototype = Object.create(Object.prototype);

P.type = 'Vector';

/*
## Define prototype functions
*/


/*
TODO - documentation
*/
P.getXYCoordinate = function () {

	return [this.x, this.y];
};

P.getXYZCoordinate = function () {

	return [this.x, this.y, this.z];
};

/*
TODO - documentation
*/
P.zero = function () {

	this.x = 0;
	this.y = 0;
	this.z = 0;

	return this;
};

/*
TODO - documentation
*/
P.setX = function (x) {

	if (!xt(x)) throw new Error(`${this.name} Vector error - setX() arguments error: ${x}`);

	this.x = x;

	return this;
};

P.setY = function (y) {

	if (!xt(y)) throw new Error(`${this.name} Vector error - setY() arguments error: ${y}`);

	this.y = y;

	return this;
};

P.setZ = function (z) {

	if (!xt(z)) throw new Error(`${this.name} Vector error - setZ() arguments error: ${z}`);
	
	this.z = z;

	return this;
};

P.setXY = function (x, y) {

	if (!xta(x, y)) throw new Error(`${this.name} Vector error - setXY() arguments error: ${x}, ${y}`);
	
	this.x = x;
	this.y = y;

	return this;
};

P.set = function (x, y, z) {

	if (isa_obj(x)) return this.setFromVector(x);

	if (Array.isArray(x)) return this.setFromArray(x);

	if (xta(x, y)) return this.setFromArray([x, y, z]);

	return this;
};

P.setFromArray = function (args) {

	if (!Array.isArray(args)) throw new Error(`${this.name} Vector error - setFromArray() arguments error: ${args}`);

	let [x, y, z] = args;
	
	if (isa_number(x)) this.x = x;
	if (isa_number(y)) this.y = y;
	if (isa_number(z)) this.z = z;

	return this;
};

P.setFromVector = function (item) {

	// if (Array.isArray(item)) item = item[0];
	
	if (!isa_obj(item)) throw new Error(`${this.name} Vector error - setFromVector() arguments error: ${JSON.stringify(item)}`);
	
	let {x, y, z} = item;

	if (isa_number(x)) this.x = x;
	if (isa_number(y)) this.y = y;
	if (isa_number(z)) this.z = z;

	return this;
};

/*
TODO - documentation
*/
P.vectorAdd = function (item = {}) {

	if (Array.isArray(item)) return this.vectorAddArray(item);

	let {x, y, z} = item;

	if (isa_number(x)) this.x += x;
	if (isa_number(y)) this.y += y;
	if (isa_number(z)) this.z += z;

	return this;
};

P.vectorAddArray = function (item = []) {

	let [x, y, z] = item;

	if (isa_number(x)) this.x += x;
	if (isa_number(y)) this.y += y;
	if (isa_number(z)) this.z += z;

	return this;
};

P.vectorSubtract = function (item = {}) {

	if (Array.isArray(item)) return this.vectorSubtractArray(item);

	let {x, y, z} = item;

	if (isa_number(x)) this.x -= x;
	if (isa_number(y)) this.y -= y;
	if (isa_number(z)) this.z -= z;

	return this;
};

P.vectorSubtractArray = function (item) {

	let [x, y, z] = item;

	if (isa_number(x)) this.x -= x;
	if (isa_number(y)) this.y -= y;
	if (isa_number(z)) this.z -= z;

	return this;
};

/*
TODO - documentation
*/
P.scalarMultiply = function (item) {

	if (!isa_number(item)) throw new Error(`${this.name} Vector error - scalarMultiply() argument not a number: ${item}`);

	this.x *= item;
	this.y *= item;
	this.z *= item;

	return this;
};

P.scalarDivide = function (item) {

	if (!isa_number(item)) throw new Error(`${this.name} Vector error - scalarDivide() argument not a number: ${item}`);
	if (!item) throw new Error(`${this.name} Vector error - scalarDivide() division by zero: ${item}`);

	this.x /= item;
	this.y /= item;
	this.z /= item;

	return this;
};

/*
TODO - documentation
*/
P.getMagnitude = function () {

	return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
};

/*
TODO - documentation
*/
P.rotate = function (angle) {

	if (!isa_number(angle)) throw new Error(`${this.name} Vector error - rotate() argument not a number: ${angle}`);

	let arg = Math.atan2(this.y, this.x);
	arg += (angle * 0.01745329251);
	
	let mag = this.getMagnitude();

	this.x = mag * Math.cos(arg);
	this.y = mag * Math.sin(arg);

	return this;
};

/*
TODO - documentation
*/
P.reverse = function () {

	this.x = -this.x;
	this.y = -this.y;
	this.z = -this.z;

	return this;
};

/*
TODO - documentation
*/
P.normalize = function() {
	
	let val = this.getMagnitude();
	
	if (val > 0) {
		this.x /= val;
		this.y /= val;
		this.z /= val;
	}
	return this;
};


/*
## Vector pool - an attempt to reuse quaternions rather than constantly creating and deleting them
*/
const vectorPool = [];

let vectorPoolCount = 0;

const vectorPoolLength = function () {

	return `${vectorPool.length} (from ${vectorPoolCount} generated)`;
}

const requestVector = function (x, y, z) {

	if (!vectorPool.length) {
		vectorPool.push(new Vector());

		vectorPoolCount++;
	}

	let v = vectorPool.shift();

	v.set(x, y, z);

	return v
};

const releaseVector = function (item) {

	if (item && item.type === 'Vector') vectorPool.push(item.zero());
};

const checkVector = function (item) {

	if (v && v.type === 'Vector') return item;
	else return new Vector(item);
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


/*
TODO - documentation
*/
export {
	makeVector,
	requestVector,
	releaseVector,
	checkVector,
	vectorPoolLength,
};
