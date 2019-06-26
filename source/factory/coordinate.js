/*
# Coordinate factory
*/
import { constructors } from '../core/library.js';
import { xt, isa_obj, isa_number } from '../core/utilities.js';

/*
## Coordinate constructor
*/
const Coordinate = function (items) {

	let coords = [0, 0];

	Object.setPrototypeOf(coords, Coordinate.prototype);

	if (items) coords.set(items);

	return coords;
};

/*
## Coordinate object prototype setup
*/
let P = Coordinate.prototype = Object.create(Array.prototype);

P.constructor = Coordinate;
P.type = 'Coordinate';

/*
## Define prototype functions
*/


/*

*/
P.zero = function () {

	this[0] = 0;
	this[1] = 0;

	return this;
};

/*

*/
P.setX = function (x) {

	if (!xt(x)) throw new Error(`Coordinate error - setX() arguments error: ${x}`);
	
	this[0] = x;

	return this;
};

/*

*/
P.setY = function (y) {

	if (!xt(y)) throw new Error(`Coordinate error - setY() arguments error: ${y}`);

	this[1] = y;

	return this;
};

/*

*/
P.setXY = function (x, y) {

	if (!xt(x) || !xt(y)) throw new Error(`Coordinate error - setXY() arguments error: ${x}, ${y}`);
	
	this[0] = x;
	this[1] = y;

	return this;
};

/*

*/
P.set = function (items, y) {

	if (items.type === 'Coordinate') this.setFromArray(items);
	else if (items.type === 'Vector') this.setFromVector(items);
	else if (items.type === 'Quaternion') this.setFromVector(items.v);
	else if (Array.isArray(items)) this.setFromArray(items);
	else if (xt(y)) this.setFromArray([items, y]);

	return this;
};

/*

*/
P.setFromArray = function (item) {

	if (!Array.isArray(item)) throw new Error(`Coordinate error - setFromArray() argument is not an array: ${item}`);

	this[0] = item[0];
	this[1] = item[1];

	return this;
};

/*

*/
P.setFromVector = function (item) {

	if (!isa_obj(item)) throw new Error(`Coordinate error - setFromVector() argument is not an object: ${item}`);

	let {x, y} = item;

	if (!xt(x) || !xt(y)) throw new Error(`Coordinate error - setFromVector() arguments error: ${x}, ${y}`);

	this[0] = x;
	this[1] = y;

	return this;
};

/*

*/
P.vectorAdd = function (item) {

	if (!isa_obj(item)) throw new Error(`Coordinate error - vectorAdd() argument is not an object: ${item}`);

	let {x, y} = item;

	if (!xt(x) || !xt(y)) throw new Error(`Coordinate error - vectorAdd() arguments error: ${x}, ${y}`);
	if (!isa_number(x) || !isa_number(y)) throw new Error(`Coordinate error - vectorAdd() arguments not numbers: ${x}, ${y}`);

	this[0] += x;
	this[1] += y;

	return this;
};

/*

*/
P.vectorSubtract = function (item) {

	if (!isa_obj(item)) throw new Error(`Coordinate error - vectorSubtract() argument is not an object: ${item}`);

	let {x, y} = item;

	if (!xt(x) || !xt(y)) throw new Error(`Coordinate error - vectorSubtract() arguments error: ${x}, ${y}`);
	if (!isa_number(x) || !isa_number(y)) throw new Error(`Coordinate error - vectorSubtract() arguments not numbers: ${x}, ${y}`);

	this[0] -= x;
	this[1] -= y;

	return this;
};

/*

*/
P.add = function (item) {

	if (!Array.isArray(item)) throw new Error(`Coordinate error - add() argument is not an array: ${item}`);

	let [x, y] = item;

	if (!xt(x) || !xt(y)) throw new Error(`Coordinate error - add() arguments error: ${x}, ${y}`);
	if (!isa_number(x) || !isa_number(y)) throw new Error(`Coordinate error - add() arguments not numbers: ${x}, ${y}`);

	this[0] += x;
	this[1] += y;

	return this;
};

/*

*/
P.subtract = function (item) {

	if (!Array.isArray(item)) throw new Error(`Coordinate error - subtract() argument is not an array: ${item}`);

	let [x, y] = item;

	if (!xt(x) || !xt(y)) throw new Error(`Coordinate error - subtract() arguments error: ${x}, ${y}`);
	if (!isa_number(x) || !isa_number(y)) throw new Error(`Coordinate error - subtract() arguments not numbers: ${x}, ${y}`);

	this[0] -= x;
	this[1] -= y;

	return this;
};

/*

*/
P.scalarMultiply = function (item) {

	if (!isa_number(item)) throw new Error(`Coordinate error - scalarMultiply() argument not a number: ${item}`);

	this[0] *= item;
	this[1] *= item;

	return this;
};

/*

*/
P.scalarDivide = function (item) {

	if (!isa_number(item)) throw new Error(`Coordinate error - scalarDivide() argument not a number: ${item}`);
	if (!item) throw new Error(`Coordinate error - scalarDivide() divide by zero`);

	this[0] /= item;
	this[1] /= item;

	return this;
};

/*

*/
P.getMagnitude = function () {

	let x = this[0],
		y = this[1];

	return Math.sqrt((x * x) + (y * y));
};

/*

*/
P.rotate = function (angle) {

	if (!isa_number(item)) throw new Error(`Coordinate error - rotate() argument not a number: ${angle}`);

	let stat_vr = [0, 0];

	let x = this[0],
		y = this[1];

	stat_vr[0] = Math.atan2(y, x);
	stat_vr[0] += (angle * 0.01745329251);
	stat_vr[1] = Math.sqrt((x * x) + (y * y));

	this[0] = stat_vr[1] * Math.cos(stat_vr[0]);
	this[1] = stat_vr[1] * Math.sin(stat_vr[0]);

	return this;
};

/*

*/
P.reverse = function () {

	this[0] = -this[0];
	this[1] = -this[1];

	return this;
};

/*
## Coordinate pool - an attempt to reuse quaternions rather than constantly creating and deleting them
*/
const coordinatePool = [];
let coordinatePoolCount = 0;

const coordinatePoolLength = function () {

	return `${coordinatePool.length} (from ${coordinatePoolCount} generated)`;
}

const requestCoordinate = function (items, y) {

	if (!coordinatePool.length) {
		coordinatePool.push(new Coordinate());
		coordinatePoolCount++;
	}

	let coordinate = coordinatePool.shift();

	coordinate.set(items, y);

	return coordinate
};

const releaseCoordinate = function (coordinate) {

	if (coordinate && coordinate.type === 'Coordinate') coordinatePool.push(coordinate.zero());
};

const checkCoordinate = function (item) {

	if (item && item.type === 'Coordinate') return item;
	else return new Coordinate(item);
};

/*
## Exported factory function
*/
const makeCoordinate = function (items) {

	return new Coordinate(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Coordinate = Coordinate;

export {
	makeCoordinate,
	requestCoordinate,
	releaseCoordinate,
	checkCoordinate,
	coordinatePoolLength,
};
