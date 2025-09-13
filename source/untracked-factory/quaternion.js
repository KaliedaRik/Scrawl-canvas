// # Quaternion factory
// Scrawl-canvas uses quaternion objects for some of its calculations - in particular for calculating DOM element 3D rotation values. These objects are not stored in the library; rather, they are kept in a __quaternion pool__ and pulled from it when required.


// #### Imports
import { constructors } from '../core/library.js';

import { correctForZero, doCreate, isa_number, isa_quaternion, xt, xto, Ωempty } from '../helper/utilities.js';

import { makeVector } from './vector.js';

// Shared constants
import { _cos, _radian, _sin, _sqrt, T_QUATERNION } from '../helper/shared-vars.js';

// Local constants
const _acos = Math.acos;


// #### Quaternion constructor
const Quaternion = function (items = Ωempty) {

    this.n = isa_number(items.n) ? items.n : 1;
    this.v = makeVector();

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

    if (xto(obj.pitch, obj.yaw, obj.roll) || xto(obj.x, obj.y, obj.z)) return this.setFromEuler(obj);

    const tv = this.v;
    const hasVec = xt(obj.vector) || xt(obj.v);
    const v = hasVec ? (obj.vector || obj.v) : Ωempty;

    // scalar (n)
    if (xto(obj.scalar, obj.n)) {

        const nval = xt(obj.scalar) ? obj.scalar : obj.n;
        if (isa_number(nval)) this.n = nval;
    }

    // vector components (set only if provided; zero is valid)
    if (xto(v.x, obj.x)) {

        const x = hasVec ? v.x : obj.x;
        if (isa_number(x)) tv.x = x;
    }

    if (xto(v.y, obj.y)) {

        const y = hasVec ? v.y : obj.y;
        if (isa_number(y)) tv.y = y;
    }

    if (xto(v.z, obj.z)) {

        const z = hasVec ? v.z : obj.z;
        if (isa_number(z)) tv.z = z;
    }

    return this;
};

P.setFromQuaternion = function (item) {

    if (isa_quaternion(item)) {

        const tv = this.v,
            iv = item.v;

        this.n = item.n;
        tv.x = iv.x;
        tv.y = iv.y;
        tv.z = iv.z;
    }
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

    // Standard intrinsic XYZ (pitch = x, yaw = y, roll = z)
    tv.x =  s1 * c2 * c3 + c1 * s2 * s3;
    tv.y =  c1 * s2 * c3 - s1 * c2 * s3;
    tv.z =  c1 * c2 * s3 + s1 * s2 * c3;

    this.n = c1 * c2 * c3 - s1 * s2 * s3;

    return this.normalize();
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

    if (mag) {

        this.n = correctForZero(this.n / mag);
        v.x = correctForZero(v.x / mag);
        v.y = correctForZero(v.y / mag);
        v.z = correctForZero(v.z / mag);
    }
    return this;
};

// Multiply the Quaternion by another Quaternion
P.quaternionMultiply = function (item) {

    if (isa_quaternion(item)) {

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
    }
    return this;
};

// Retrieve the Quaternion's current angle. Returns radians by default.
// + Pass `true` to get degrees.
P.getAngle = function (degree) {

    // Clamp to handle tiny FP drift; normalize not required but helps.
    const w = Math.min(1, Math.max(-1, this.n));

    let result = 2 * _acos(w);

    const asDegrees = degree === true;

    if (asDegrees) result *= (1 / _radian);

    return correctForZero(result);
};

// Rotate the Quaternion using another Quaternion's values
P.quaternionRotate = function (item) {

    if (isa_quaternion(item)) {

        const q4 = requestQuaternion(item),
            q5 = requestQuaternion(this);

        this.setFromQuaternion(q4.quaternionMultiply(q5));

        releaseQuaternion(q4, q5);

        this.normalize();
    }
    return this
};


// #### Quaternion pool
// An attempt to reuse quaternions rather than constantly creating and deleting them
const quaternionPool = [];

// `exported function` - retrieve a Quaternion from the quaternion pool
export const requestQuaternion = function (items) {

    if (!quaternionPool.length) quaternionPool.push(makeQuaternion());

    const q = quaternionPool.pop();

    q.zero().set(items);

    return q
};

// `exported function` - return a Quaternion to the quaternion pool. Failing to return Quaternion to the pool may lead to more inefficient code and possible memory leaks.
export const releaseQuaternion = function (...args) {

    args.forEach(q => {

        if (q && q.type === T_QUATERNION) quaternionPool.push(q);
    });
};


// #### Factory
export const makeQuaternion = function (items) {

    return new Quaternion(items);
};

constructors.Quaternion = Quaternion;
