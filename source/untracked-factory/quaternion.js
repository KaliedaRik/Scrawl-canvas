// # Quaternion factory
// Scrawl-canvas uses quaternion objects for some of its calculations - in particular for calculating DOM element 3D rotation values. These objects are not stored in the library; rather, they are kept in a __quaternion pool__ and pulled from it when required.
//
// TODO: there's errors in the math here! See in particular Demo [Snippets-003](../../demo/snippets-003.html) to experiment:
// + Pitch always appears to rotate with reference to the element. Yaw and roll, however, seem to rotate with reference to the stack frame, or the element - or possibly a combination of both - dependant on the values of the other euler attributes.
// + `quaternionMultiply` is almost certainly wrong - caused by trying to convert code meant for a y-axis-upwards frame to code that works in a y-axis-downwards frame
// + The `setFromEuler` function is also (probably) wrong
// + I hate quaternions!


// #### Imports
import { constructors } from '../core/library.js';

import { correctForZero, doCreate, isa_number, isa_quaternion, xt, xto, Ωempty } from '../helper/utilities.js';

import { makeVector } from './vector.js';

import { _acos, _cos, _radian, _seal, _sin, _sqrt, T_QUATERNION } from '../helper/shared-vars.js';


// #### Quaternion constructor
const Quaternion = function (items = Ωempty) {

    this.n = items.n || 1;
    this.v = makeVector();

    _seal(this);

    this.set(items);

    return this;
};


// #### Quaternion prototype
const P = Quaternion.prototype = doCreate();
P.type = T_QUATERNION;


// #### Mixins
// Quaternion objects do not use mixins - they are regular Javascript objects. As such, they do not possess packet, clone or kill functionality.


// #### Quaternion attributes
// The __name__, __n__ and __v__ (Vector object) attributes are set in the Quaternion constructor - the Quaternion object does not have a `defs` object. The Vector attributes __v.x__, __v.y__, __v.z__ can also be set directly.
//
// __We strongly advise against setting Quaternion object attributes directly!__ Quaternions are complex beasts and their `n` and `v` attributes are linked in mysterious (and possibly debauched) ways. Set and manipulate your Quaternion object's attributes using the functions below.


// #### Get, Set, deltaSet

// Quaternion attributes can be retrieved directly - `myquaternion.n`, `myquaternion.v`. The __v__ attribute is a Vector object, thus its attributes can be retrieved using that object's convenience functions `myquaternion.v.getXYCoordinate` and `myquaternion.v.getXYZCoordinate` - these functions will return Arrays.

// The Quaternion `set` function is overloaded. It can accept the following arguments:
// + `set(Quaternion)` - a Quaternion object
// + `set(Vector)` - a Vector object
// + `set({x:Number, y:Number, z:Number})` - a Javascript object containing one or more attributes from: x, y, z - with values in degrees (not radians)
// + `set({pitch:Number, yaw:Number, roll:Number})` - a Javascript object containing one or more attributes: __pitch__ (for x-axis rotations); __yaw__ (for y-axis rotations); __roll__ (for z-axis rotations) - with values in degrees (not radians)
P.set = function (obj = Ωempty) {

    if (isa_quaternion(obj)) return this.setFromQuaternion(obj);

    if (xto(obj.pitch, obj.yaw, obj.roll)) return this.setFromEuler(obj);

    const tv = this.v,
        v = (xt(obj.vector) || xt(obj.v)) ? (obj.vector || obj.v) : false,
        n = (xt(obj.scalar) || xt(obj.n)) ? (obj.scalar || obj.n || 0) : false;

    const x = (v) ? (v.x || 0) : obj.x || false,
        y = (v) ? (v.y || 0) : obj.y || false,
        z = (v) ? (v.z || 0) : obj.z || false;

    this.n = (isa_number(n)) ? n : this.n;

    tv.x = (isa_number(x)) ? x : tv.x;
    tv.y = (isa_number(y)) ? y : tv.y;
    tv.z = (isa_number(z)) ? z : tv.z;

    return this;
};

P.setFromQuaternion = function (item) {

    if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - setFromQuaternion() bad argument: ${item}`);

    const tv = this.v,
        iv = item.v;

    this.n = item.n;
    tv.x = iv.x;
    tv.y = iv.y;
    tv.z = iv.z;

    return this;
};

P.setFromEuler = function (items = Ωempty) {

    const tv = this.v;

    const pitch = (items.pitch || items.x || 0) * _radian,
        yaw = (items.yaw || items.y || 0) * _radian,
        roll = (items.roll || items.z || 0) * _radian;

    const c1 = _cos( pitch / 2 ),
        c2 = _cos( yaw / 2 ),
        c3 = _cos( roll / 2 );

    const s1 = _sin( pitch / 2 ),
        s2 = _sin( yaw / 2 ),
        s3 = _sin( roll / 2 );

    tv.x = s1 * c2 * c3 + c1 * s2 * s3;
    tv.y = c1 * s2 * c3 + s1 * c2 * s3;
    tv.z = c1 * c2 * s3 - s1 * s2 * c3;

    this.n = c1 * c2 * c3 - s1 * s2 * s3;

    return this;
};


// #### Prototype functions

// Set the Quaternion attributes to their default values
P.zero = function () {

    const v = this.v;

    this.n = 1;
    v.x = 0;
    v.y = 0;
    v.z = 0;

    return this;
};

// Get the Quaternion's __magnitude__ value
P.getMagnitude = function () {

    const v = this.v;

    return _sqrt((this.n * this.n) + (v.x * v.x) + (v.y * v.y) + (v.z * v.z));
};

// Normalize the Quaternion
P.normalize = function () {

    const mag = this.getMagnitude(),
        v = this.v;

    if (!mag) throw new Error(`${this.name} Quaternion error - normalize() division by zero: ${mag}`);

    this.n = correctForZero(this.n / mag);
    v.x = correctForZero(v.x / mag);
    v.y = correctForZero(v.y / mag);
    v.z = correctForZero(v.z / mag);

    return this;
};

// Multiply the Quaternion by another Quaternion
P.quaternionMultiply = function (item) {

    if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - quaternionMultiply() bad argument: ${item}`);

    const tv = this.v,
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

// Retrieve the Quaternion's current angle (returns a Number representing degrees, not radians)
P.getAngle = function (degree) {

    let result;

    degree = (xt(degree)) ? degree : false;

    result = 2 * _acos(this.n);

    if(degree){

        result *= (1 / _radian);
    }

    return correctForZero(result);
};

// Rotate the Quaternion using another Quaternion's values
P.quaternionRotate = function (item) {

    if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - quaternionRotate() bad argument: ${item}`);

    const q4 = requestQuaternion(item),
        q5 = requestQuaternion(this);

    this.setFromQuaternion(q4.quaternionMultiply(q5));

    releaseQuaternion(q4);
    releaseQuaternion(q5);

    return this
};


// #### Quaternion pool
// An attempt to reuse quaternions rather than constantly creating and deleting them
const quaternionPool = [];

// `exported function` - retrieve a Quaternion from the quaternion pool
export const requestQuaternion = function (items) {

    if (!quaternionPool.length) quaternionPool.push(makeQuaternion());

    const q = quaternionPool.shift();

    q.set(items);

    return q
};

// `exported function` - return a Quaternion to the quaternion pool. Failing to return Quaternion to the pool may lead to more inefficient code and possible memory leaks.
export const releaseQuaternion = function (...args) {

    args.forEach(q => {

        if (q && q.type === T_QUATERNION) {

            quaternionPool.push(q.zero());
        }
    });
};


// #### Factory
export const makeQuaternion = function (items) {

    return new Quaternion(items);
};

constructors.Quaternion = Quaternion;
