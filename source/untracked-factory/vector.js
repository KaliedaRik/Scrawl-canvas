// # Vector factory
// Scrawl-canvas uses vector objects for some of its calculations - in particular for calculating rotations. These objects are not stored in the library; rather, they are kept in a __vector pool__ and pulled from it when required.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_number, isa_obj, xt, xta, Ωempty } from '../helper/utilities.js';

// Shared constants
import { _atan2, _cos, _isArray, _sin, _sqrt, T_VECTOR } from '../helper/shared-vars.js';

// Local constants (none defined)


// #### Vector constructor
const Vector = function (x, y, z) {

    this.x = 0;
    this.y = 0;
    this.z = 0;

    if (xt(x)) this.set(x, y, z);

    return this;
};


// #### Vector prototype
const P = Vector.prototype = doCreate();
P.type = T_VECTOR;


// #### Mixins
// Vector objects do not use mixins - they are regular Javascript objects. As such, they do not possess packet, clone or kill functionality.


// #### Vector attributes
// The __x__, __y__ and __z__ attributes are set in the Vector constructor - the Vector object does not have a `defs` object.


// #### Get, Set, deltaSet

// Vector attributes can be retrieved directly - `myvector.x`, etc. The following convenience getters are defined on the Vector prototype, and return an Array
P.getXYCoordinate = function () {

    return [this.x, this.y];
};

P.getXYZCoordinate = function () {

    return [this.x, this.y, this.z];
};

// Vector attributes can be set directly - `myvector.x = 0`, etc. The following convenience setters are defined on the Vector prototype
P.setX = function (x) {

    if (xt(x) && isa_number(x)) this.x = x;

    return this;
};

P.setY = function (y) {

    if (xt(y) && isa_number(y)) this.y = y;

    return this;
};

P.setZ = function (z) {

    if (xt(z) && isa_number(z)) this.z = z;

    return this;
};

P.setXY = function (x, y) {

    if (xta(x, y) && isa_number(x) && isa_number(y)) {

        this.x = x;
        this.y = y;
    }

    return this;
};

// The Vector `set` function is overloaded. It can accept the following arguments:
// + `set(x-Number, y-Number [, z-Number])` - Number arguments
// + `set([x-Number, y-Number [, z-Number]])` - an Array of Numbers
// + `set({x:Number, y:Number, z:Number})` - a Javascript object containing x, y (and z) attributes
// + `set(Vector)` - a Vector object
P.set = function (x, y, z) {

    if (isa_obj(x)) return this.setFromVector(x);

    if (_isArray(x)) return this.setFromArray(x);

    if (xta(x, y)) return this.setFromArray([x, y, z]);

    return this;
};

P.setFromArray = function (args) {

    if (_isArray(args)) {

        const [x, y, z] = args;

        if (isa_number(x)) this.x = x;
        if (isa_number(y)) this.y = y;
        if (isa_number(z)) this.z = z;
    }

    return this;
};

P.setFromVector = function (item) {

    if (isa_obj(item)) {

        const {x, y, z} = item;

        if (isa_number(x)) this.x = x;
        if (isa_number(y)) this.y = y;
        if (isa_number(z)) this.z = z;
    }

    return this;
};

// #### Prototype functions

// Set the Vector attributes to their default values
P.zero = function () {

    this.x = 0;
    this.y = 0;
    this.z = 0;

    return this;
};

// Add a Vector, or an Array of Number values, to this Vector
P.vectorAdd = function (item = Ωempty) {

    if (_isArray(item)) return this.vectorAddArray(item);

    const {x, y, z} = item;

    if (isa_number(x)) this.x += x;
    if (isa_number(y)) this.y += y;
    if (isa_number(z)) this.z += z;

    return this;
};

P.vectorAddArray = function (item = []) {

    const [x, y, z] = item;

    if (isa_number(x)) this.x += x;
    if (isa_number(y)) this.y += y;
    if (isa_number(z)) this.z += z;

    return this;
};

// Subtract a Vector, or an Array of Number values, from this Vector
P.vectorSubtract = function (item = Ωempty) {

    if (_isArray(item)) return this.vectorSubtractArray(item);

    const {x, y, z} = item;

    if (isa_number(x)) this.x -= x;
    if (isa_number(y)) this.y -= y;
    if (isa_number(z)) this.z -= z;

    return this;
};

P.vectorSubtractArray = function (item) {

    const [x, y, z] = item;

    if (isa_number(x)) this.x -= x;
    if (isa_number(y)) this.y -= y;
    if (isa_number(z)) this.z -= z;

    return this;
};

// Multiply all Vector attributes by the argument Number
P.scalarMultiply = function (item) {

    if (!isa_number(item)) item = 1;

    this.x *= item;
    this.y *= item;
    this.z *= item;

    return this;
};

P.vectorMultiply = function (item = Ωempty) {

    if (_isArray(item)) return this.vectorMultiplyArray(item);

    const {x, y, z} = item;

    if (isa_number(x)) this.x *= x;
    if (isa_number(y)) this.y *= y;
    if (isa_number(z)) this.z *= z;

    return this;
};

P.vectorMultiplyArray = function (item) {

    const [x, y, z] = item;

    if (isa_number(x)) this.x *= x;
    if (isa_number(y)) this.y *= y;
    if (isa_number(z)) this.z *= z;

    return this;
};


// Divide all Vector attributes by the argument Number
P.scalarDivide = function (item) {

    if (isa_number(item) && item) {

        this.x /= item;
        this.y /= item;
        this.z /= item;
    }

    return this;
};

// Get the Vector's __magnitude__ value
P.getMagnitude = function () {

    return _sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
};

// Rotate a Vector by a given angle. Argument is a Number representing degrees, not radians.
P.rotate = function (angle) {

    if (!isa_number(angle)) angle = 0;

    let arg = _atan2(this.y, this.x);
    arg += (angle * 0.01745329251);

    const mag = this.getMagnitude();

    this.x = mag * _cos(arg);
    this.y = mag * _sin(arg);

    return this;
};

// Change the numerical sign of all Vector attributes
P.reverse = function () {

    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
};

// Normalize the Vector
P.normalize = function() {

    const val = this.getMagnitude();

    if (val > 0) {
        this.x /= val;
        this.y /= val;
        this.z /= val;
    }
    return this;
};

// Dot product with Vector or [x,y,z]
P.getDot = function (item = Ωempty) {

    if (_isArray(item)) {

        const [x, y, z] = item;

        return (isa_number(x) ? x : 0) * this.x
            + (isa_number(y) ? y : 0) * this.y
            + (isa_number(z) ? z : 0) * this.z;
    }

    const { x, y, z } = item;

    return (isa_number(x) ? x : 0) * this.x
        + (isa_number(y) ? y : 0) * this.y
        + (isa_number(z) ? z : 0) * this.z;
};

// (Optional alias)
P.dot = P.getDot;

// this += scalar * other
P.vectorAddScaled = function (other = Ωempty, scalar = 1) {

    if (_isArray(other)) {

        const [x, y, z] = other;

        if (isa_number(x)) this.x += scalar * x;
        if (isa_number(y)) this.y += scalar * y;
        if (isa_number(z)) this.z += scalar * z;

        return this;
    }

    const { x, y, z } = other;

    if (isa_number(x)) this.x += scalar * x;
    if (isa_number(y)) this.y += scalar * y;
    if (isa_number(z)) this.z += scalar * z;

    return this;
};


// #### Vector pool
// An attempt to reuse vectors rather than constantly creating and deleting them
const vectorPool = [];

// `exported function` - retrieve a Vector from the vector pool
export const requestVector = function (x, y, z) {

    if (!vectorPool.length) vectorPool.push(new Vector());

    const v = vectorPool.pop();

    v.set(x, y, z);

    return v
};

// `exported function` - return a Vector to the vector pool. Failing to return Vectors to the pool may lead to more inefficient code and possible memory leaks.
export const releaseVector = function (...args) {

    args.forEach(v => {

        if (v && v.type === T_VECTOR) vectorPool.push(v.zero());
    });
};


// #### Factory
export const makeVector = function (x, y, z) {

    return new Vector(x, y, z);
};

constructors.Vector = Vector;
