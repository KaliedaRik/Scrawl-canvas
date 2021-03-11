// # Quaternion factory
// Scrawl-canvas uses quaternion objects for some of its calculations - in particular for calculating DOM element 3D rotation values. These objects are not stored in the library; rather, they are kept in a __quaternion pool__ and pulled from it when required.
// 
// TODO: there's errors in the math here! See in particular Demo [Component-002](../../demo/component-002.html) to experiment:
// + Pitch always appears to rotate with reference to the element. Yaw and roll, however, seem to rotate with reference to the stack frame, or the element - or possibly a combination of both - dependant on the values of the other euler attributes.
// + `quaternionMultiply` is almost certainly wrong - caused by trying to convert code meant for a y-axis-upwards frame to code that works in a y-axis-downwards frame
// + The `setFromEuler` function is also (probably) wrong
// + I hate quaternions!


// #### Imports
import { radian, constructors } from '../core/library.js';
import { isa_quaternion, isa_number, xt, xto, Ωempty } from '../core/utilities.js';

import { requestVector, releaseVector, makeVector } from './vector.js';


// #### Quaternion constructor
const Quaternion = function (items = Ωempty) {

    this.name = items.name || 'generic';
    this.n = items.n || 1;
    this.v = makeVector();

    this.set(items);

    return this;
};


// #### Quaternion prototype
let P = Quaternion.prototype = Object.create(Object.prototype);
P.type = 'Quaternion';


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

    if ((obj && obj.type && obj.type === 'Vector')) return this.setFromVector(obj);

    if (xto(obj.pitch, obj.yaw, obj.roll)) return this.setFromEuler(obj);

    let x, y, z, n, v,
        tv = this.v;

    v = (xt(obj.vector) || xt(obj.v)) ? (obj.vector || obj.v) : false;
    n = (xt(obj.scalar) || xt(obj.n)) ? (obj.scalar || obj.n || 0) : false;

    x = (v) ? (v.x || 0) : obj.x || false;
    y = (v) ? (v.y || 0) : obj.y || false;
    z = (v) ? (v.z || 0) : obj.z || false;

    this.n = (isa_number(n)) ? n : this.n;

    tv.x = (isa_number(x)) ? x : tv.x;
    tv.y = (isa_number(y)) ? y : tv.y;
    tv.z = (isa_number(z)) ? z : tv.z;
    
    return this;
};

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

P.setFromEuler = function (items = Ωempty) {

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


// #### Prototype functions

// Set the Quaternion attributes to their default values
P.zero = function () {

    let v = this.v;

    this.n = 1;
    v.x = 0;
    v.y = 0;
    v.z = 0;

    return this;
};

// Get the Quaternion's __magnitude__ value
P.getMagnitude = function () {

    let v = this.v;

    return Math.sqrt((this.n * this.n) + (v.x * v.x) + (v.y * v.y) + (v.z * v.z));
};

// Normalize the Quaternion
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

// Multiply the Quaternion by another Quaternion
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

// Retrieve the Quaternion's current angle (returns a Number representing degrees, not radians)
P.getAngle = function (degree) {

    let result;

    degree = (xt(degree)) ? degree : false;

    result = 2 * Math.acos(this.n);

    if(degree){

        result *= (1 / radian);
    }

    return (result > -0.000001 && result < 0.000001) ? 0 : result;
};

// Rotate the Quaternion using another Quaternion's values
P.quaternionRotate = function (item) {

    if (!isa_quaternion(item)) throw new Error(`${this.name} Quaternion error - quaternionRotate() bad argument: ${item}`);

    let q4 = requestQuaternion(item),
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
const requestQuaternion = function (items) {

    if (!quaternionPool.length) {

        quaternionPool.push(makeQuaternion({
            name: 'pool'
        }));
    }

    let q = quaternionPool.shift();

    q.set(items);
    
    return q
};

// `exported function` - return a Quaternion to the quaternion pool. Failing to return Quaternion to the pool may lead to more inefficient code and possible memory leaks.
const releaseQuaternion = function (q) {

    if (q && q.type === 'Quaternion') {

        quaternionPool.push(q.zero());
    }
};


// #### Factory
const makeQuaternion = function (items) {

    return new Quaternion(items);
};

constructors.Quaternion = Quaternion;


// #### Exports
export {
    makeQuaternion,
    requestQuaternion,
    releaseQuaternion,
};
