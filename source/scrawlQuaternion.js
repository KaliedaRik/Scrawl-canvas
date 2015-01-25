//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Copyright (c) 2014 Richard James Roots
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'quaternion')) {
	var scrawl = (function(my) {
		'use strict';

		/**
A __factory__ function to generate new Quaternion objects - see also scrawl.makeQuaternion()
@method newQuaternion
@param {Object} items Key:value Object argument for setting attributes
@return Quaternion object
**/
		my.newQuaternion = function(items) {
			return new my.Quaternion(items);
		};
		/**
A __factory__ function to build a Quaternion object from Euler angle values

Argument object can be in the following form, where all values (which default to 0) are in degrees:
* {pitch:Number, yaw:Number, roll:Number}
* {x:Number, y:Number, z:Number}
* or a mixture of the two
@method makeQuaternion
@param {Object} [items] Key:value Object argument for setting attributes
@return New quaternion
@example
	var myQuart = scrawl.makeQuaternion({
		pitch: 90,
		yaw: 10,
		});
**/
		my.makeQuaternion = function(items) {
			return my.Quaternion.prototype.makeFromEuler(items);
		};
		/**
# Quaternion

## Instantiation

* scrawl.newQuaternion()

## Purpose

* To hold quaternion (3d rotation) data
@class Quaternion
@constructor
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Quaternion = function(items) {
			var vector;
			items = my.safeObject(items);
			vector = my.safeObject(items.v);
			this.name = items.name || 'generic';
			this.n = items.n || 1;
			this.v = my.newVector({
				x: vector.x || items.x || 0,
				y: vector.y || items.y || 0,
				z: vector.z || items.z || 0,
			});
			return this;
		};
		my.Quaternion.prototype = Object.create(Object.prototype);
		/**
@property type
@type String
@default 'Quaternion'
@final
**/
		my.Quaternion.prototype.type = 'Quaternion';
		my.d.Quaternion = {
			/**
Quaternion name
@property name
@type String
@default 'generic'
**/
			name: 'generic',
			/**
3d rotation value
@property n
@type Number
@default 1
**/
			n: 1,
			/**
3d rotation axis
@property v
@type Vector
@default {x:0, y:0, z:0}
**/
			v: {
				x: 0,
				y: 0,
				z: 0
			},
		};
		/**
set to zero quaternion (n = 1)
@method zero
@return This
@chainable
**/
		my.Quaternion.prototype.zero = function() {
			this.n = 1;
			this.v.x = 0;
			this.v.y = 0;
			this.v.z = 0;
			return this;
		};
		/**
Calculate magnitude of a quaternion
@method getMagnitude
@return Magnitude value
**/
		my.Quaternion.prototype.getMagnitude = function() {
			return Math.sqrt((this.n * this.n) + (this.v.x * this.v.x) + (this.v.y * this.v.y) + (this.v.z * this.v.z));
		};
		/**
Normalize the quaternion
@method normalize
@return This
@chainable
**/
		my.Quaternion.prototype.normalize = function() {
			var mag = this.getMagnitude();
			if (mag !== 0) {
				this.n /= mag;
				this.v.x /= mag;
				this.v.y /= mag;
				this.v.z /= mag;
			}
			return this;
		};
		/**
Check to see if quaternion is a unit quaternion, within permitted tolerance
@method checkNormal
@param {Number} [tolerance] Tolerance value; default: 0
@return True if quaternion is a normalized quaternion; false otherwise
**/
		my.Quaternion.prototype.checkNormal = function(tolerance) {
			var check;
			tolerance = (my.xt(tolerance)) ? tolerance : 0;
			check = this.getMagnitude();
			if (check >= 1 - tolerance && check <= 1 + tolerance) {
				return true;
			}
			return false;
		};
		/**
Retrieve quaternion's vector (rotation axis) component
@method getVector
@return Vector component
**/
		my.Quaternion.prototype.getVector = function() {
			return this.v;
		};
		/**
Retrieve quaternion's scalar (rotation around axis) component
@method getScalar
@return Number - scalar component of this quaternion
**/
		my.Quaternion.prototype.getScalar = function() {
			return this.n;
		};
		/**
Add a quaternion to this quaternion
@method quaternionAdd
@param {Quaternion} item Quaternion to be added to this quaternion
@return This
@chainable
**/
		my.Quaternion.prototype.quaternionAdd = function(item) {
			if (my.isa(item, 'quaternion')) {
				this.n += item.n || 0;
				this.v.x += item.v.x || 0;
				this.v.y += item.v.y || 0;
				this.v.z += item.v.z || 0;
				return this;
			}
			return this;
		};
		/**
Subtract a quaternion from this quaternion
@method quaternionSubtract
@param {Quaternion} item Quaternion to be subtracted from this quaternion
@return This
@chainable
**/
		my.Quaternion.prototype.quaternionSubtract = function(item) {
			if (my.isa(item, 'quaternion')) {
				this.n -= item.n || 0;
				this.v.x -= item.v.x || 0;
				this.v.y -= item.v.y || 0;
				this.v.z -= item.v.z || 0;
				return this;
			}
			return this;
		};
		/**
Multiply quaternion by a scalar value
@method scalarMultiply
@param {Number} item Value to multiply quaternion by
@return This
**/
		my.Quaternion.prototype.scalarMultiply = function(item) {
			if (my.isa(item, 'num')) {
				this.n *= item;
				this.v.x *= item;
				this.v.y *= item;
				this.v.z *= item;
				return this;
			}
			return this;
		};
		/**
Divide quaternion by a scalar value
@method scalarDivide
@param {Number} item Value to divide quaternion by
@return This
@chainable
**/
		my.Quaternion.prototype.scalarDivide = function(item) {
			if (my.isa(item, 'num') && item !== 0) {
				this.n /= item;
				this.v.x /= item;
				this.v.y /= item;
				this.v.z /= item;
				return this;
			}
			return this;
		};
		/**
Conjugate (reverse) value for this quaternion
@method conjugate
@return Conjugated quaternion
**/
		my.Quaternion.prototype.conjugate = function() {
			this.v.x = -this.v.x;
			this.v.y = -this.v.y;
			this.v.z = -this.v.z;
			return this;
		};
		/**
Set the values for this quaternion

Argument object can contain the following attributes:

* for the scalar (n) value, __scalar__ or __n__ (Number)
* for the vector (v) value, __vector__ or __v__ (Vector object, or object containing xyz attribnutes)
* for the x value (v.x), __x__ (Number)
* for the y value (v.y), __y__ (Number)
* for the z value (v.z), __z__ (Number)

If the argument object includes values for __pitch__, __yaw__ or __roll__, the set will be performed via the setFromEuler() function

Argument can also be either an existing Quaternion object, or an existing Vector object - for vectors, the scalar value will be set to 0
@method set
@param items Object containing key:value attributes
@return Amended quaternion
**/
		my.Quaternion.prototype.set = function(items) {
			var x,
				y,
				z,
				n,
				v;
			items = my.safeObject(items);
			//var x, y, z, n, v;
			if (my.isa(items, 'quaternion')) {
				return this.setFromQuaternion(items);
			}
			if (my.isa(items, 'vector')) {
				return this.setFromVector(items);
			}
			if (my.xto(items.pitch, items.yaw, items.roll)) {
				return this.setFromEuler(items);
			}
			v = (my.xt(items.vector) || my.xt(items.v)) ? (items.vector || items.v) : false;
			n = (my.xt(items.scalar) || my.xt(items.n)) ? (items.scalar || items.n || 0) : false;
			x = (v) ? (v.x || 0) : items.x;
			y = (v) ? (v.y || 0) : items.y;
			z = (v) ? (v.z || 0) : items.z;
			this.n = (my.isa(n, 'num')) ? n : this.n;
			this.v.x = (my.isa(x, 'num')) ? x : this.v.x;
			this.v.y = (my.isa(y, 'num')) ? y : this.v.y;
			this.v.z = (my.isa(z, 'num')) ? z : this.v.z;
			return this;
		};
		/**
Set the values for this quaternion based on the values of the argument quaternion
@method setFromQuaternion
@param {Quaternion} item Reference quaternion
@return This
@chainable
**/
		my.Quaternion.prototype.setFromQuaternion = function(item) {
			if (my.isa(item, 'quaternion')) {
				this.n = item.n;
				this.v.x = item.v.x;
				this.v.y = item.v.y;
				this.v.z = item.v.z;
				return this;
			}
			return this;
		};
		/**
Set the values for this quaternion based on the values of the reference vector
@method setFromVector
@param {Vector} item Reference vector
@return This
@chainable
**/
		my.Quaternion.prototype.setFromVector = function(item) {
			if (my.isa(item, 'vector')) {
				this.n = 0;
				this.v.x = item.x;
				this.v.y = item.y;
				this.v.z = item.z;
				return this;
			}
			return this;
		};
		/**
Multiply this quaternion by a second quaternion

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method quaternionMultiply
@param {Quaternion} item Quaternion to multiply this quaternion by
@return This
@chainable
**/
		my.Quaternion.prototype.quaternionMultiply = function(item) {
			var x1,
				y1,
				z1,
				n1,
				x2,
				y2,
				z2,
				n2;
			if (my.isa(item, 'quaternion')) {
				n1 = this.n;
				x1 = this.v.x;
				y1 = this.v.y;
				z1 = this.v.z;
				n2 = item.n;
				x2 = item.v.x;
				y2 = item.v.y;
				z2 = item.v.z;
				this.n = (n1 * n2) - (x1 * x2) - (y1 * y2) - (z1 * z2);
				this.v.x = (n1 * x2) + (x1 * n2) + (y1 * z2) - (z1 * y2);
				this.v.y = (n1 * y2) + (y1 * n2) + (z1 * x2) - (x1 * z2);
				this.v.z = (n1 * z2) + (z1 * n2) + (x1 * y2) - (y1 * x2);
				return this;
			}
			return this;
		};
		/**
Multiply this quaternion by a Vector

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method getVectorMultiply
@param {Vector} item Vector to multiply this quaternion by
@return This
@chainable
**/
		my.Quaternion.prototype.vectorMultiply = function(item) {
			var x1,
				y1,
				z1,
				n1,
				x2,
				y2,
				z2;
			if (my.isa(item, 'vector')) {
				n1 = this.n;
				x1 = this.v.x;
				y1 = this.v.y;
				z1 = this.v.z;
				x2 = item.x;
				y2 = item.y;
				z2 = item.z;
				this.n = -((x1 * x2) + (y1 * y2) + (z1 * z2));
				this.v.x = (n1 * x2) + (y1 * z2) - (z1 * y2);
				this.v.y = (n1 * y2) + (z1 * x2) - (x1 * z2);
				this.v.z = (n1 * z2) + (x1 * y2) - (y1 * x2);
				return this;
			}
			return this;
		};
		/**
Retrieve rotational component of this quaternion
@method getAngle
@param {Boolean} [degree] Returns rotation in degrees if true; false (radians) by default
@return Rotation angle
**/
		my.Quaternion.prototype.getAngle = function(degree) {
			var result;
			degree = (my.xt(degree)) ? degree : false;
			result = 2 * Math.acos(this.n);
			return (degree) ? result * (1 / my.radian) : result;
		};
		/**
Retrieve axis component of this quaternion
@method getAxis
@return Normalized Vector (scrawl.v Vector)
**/
		my.Quaternion.prototype.getAxis = function() {
			var magnitude;
			my.v.set(this.v);
			magnitude = this.getMagnitude();
			return (magnitude !== 0) ? my.v.scalarDivide(magnitude) : my.v;
		};
		/**
Rotate this quaternion by another quaternion

_Quaternion multiplication is not comutative - arithmetic is item (representing the local rotation to be applied) * this, not this * item (for which, use quaternionMultiply)_
@method quaternionRotate
@param {Quaternion} item Quaternion to rotate this quaternion by
@return This
@chainable
**/
		my.Quaternion.prototype.quaternionRotate = function(item) {
			if (my.isa(item, 'quaternion')) {
				my.workquat.q4.set(item);
				my.workquat.q5.set(this);
				return this.set(my.workquat.q4.quaternionMultiply(my.workquat.q5));
			}
			return this;
		};
		/**
Rotate a Vector by this quaternion
@method vectorRotate
@param {Vector} item Vector to be rotated by this quaternion
@return Vector (amended argument); false on failure
**/
		my.Quaternion.prototype.vectorRotate = function(item) {
			if (my.isa(item, 'vector')) {
				return item.rotate3d(this);
			}
			return false;
		};
		/**
Build a quaternion from Euler angle values

Argument object can be in the form, where all values (which default to 0) are in degrees:
* {pitch:Number, yaw:Number, roll:Number}
* {x:Number, y:Number, z:Number}
* or a mixture of the two
@method makeFromEuler
@param {Object} [items] Key:value Object argument for setting attributes
@return New quaternion
@example
	var myQuart = scrawl.quaternion.makeFromEuler({
		roll: 30,
		pitch: 90,
		yaw: 125,
		});
**/
		my.Quaternion.prototype.makeFromEuler = function(items) {
			var pitch,
				yaw,
				roll,
				c1,
				c2,
				c3,
				s1,
				s2,
				s3,
				w,
				x,
				y,
				z;
			items = my.safeObject(items);
			pitch = (items.pitch || items.x || 0) * my.radian;
			yaw = (items.yaw || items.y || 0) * my.radian;
			roll = (items.roll || items.z || 0) * my.radian;
			c1 = Math.cos(yaw / 2);
			c2 = Math.cos(roll / 2);
			c3 = Math.cos(pitch / 2);
			s1 = Math.sin(yaw / 2);
			s2 = Math.sin(roll / 2);
			s3 = Math.sin(pitch / 2);
			w = (c1 * c2 * c3) - (s1 * s2 * s3);
			x = (s1 * s2 * c3) + (c1 * c2 * s3);
			y = (s1 * c2 * c3) + (c1 * s2 * s3);
			z = (c1 * s2 * c3) - (s1 * c2 * s3);
			return my.newQuaternion({
				n: w,
				x: x,
				y: y,
				z: z
			});
		};
		/**
Update quaternion with Euler angle values

Argument object can be in the form, where all values (which default to 0) are in degrees:
* {pitch:Number, yaw:Number, roll:Number}
* {x:Number, y:Number, z:Number}
* or a mixture of the two
@method setFromEuler
@param {Object} [items] Key:value Object argument for setting attributes
@return New quaternion
@example
	var myQuart = scrawl.quaternion.setFromEuler({
		roll: 30,
		pitch: 90,
		yaw: 125,
		});
**/
		my.Quaternion.prototype.setFromEuler = function(items) {
			var pitch,
				yaw,
				roll,
				c1,
				c2,
				c3,
				s1,
				s2,
				s3;
			items = my.safeObject(items);
			pitch = (items.pitch || items.x || 0) * my.radian;
			yaw = (items.yaw || items.y || 0) * my.radian;
			roll = (items.roll || items.z || 0) * my.radian;
			c1 = Math.cos(yaw / 2);
			c2 = Math.cos(roll / 2);
			c3 = Math.cos(pitch / 2);
			s1 = Math.sin(yaw / 2);
			s2 = Math.sin(roll / 2);
			s3 = Math.sin(pitch / 2);
			this.n = (c1 * c2 * c3) - (s1 * s2 * s3);
			this.v.x = (s1 * s2 * c3) + (c1 * c2 * s3);
			this.v.y = (s1 * c2 * c3) + (c1 * s2 * s3);
			this.v.z = (c1 * s2 * c3) - (s1 * c2 * s3);
			return this;
		};
		/**
Retrieve rotations (Euler angles) from a quaternion
@method getEulerAngles
@return Object in the form {pitch:Number, yaw:Number, roll:Number}
**/
		my.Quaternion.prototype.getEulerAngles = function() {
			var sqw,
				sqx,
				sqy,
				sqz,
				unit,
				test,
				result = {
					pitch: 0,
					yaw: 0,
					roll: 0
				},
				t0,
				t1;
			sqw = this.n * this.n;
			sqx = this.v.x * this.v.x;
			sqy = this.v.y * this.v.y;
			sqz = this.v.z * this.v.z;
			unit = sqw + sqx + sqy + sqz;
			test = (this.v.x * this.v.y) + (this.v.z * this.n);
			if (test > 0.499999 * unit) {
				result.yaw = (2 * Math.atan2(this.v.x, this.n)) / my.radian;
				result.roll = (Math.PI / 2) / my.radian;
				result.pitch = 0;
				return result;
			}
			if (test < -0.499999 * unit) {
				result.yaw = (-2 * Math.atan2(this.v.x, this.n)) / my.radian;
				result.roll = (-Math.PI / 2) / my.radian;
				result.pitch = 0;
				return result;
			}
			t0 = (2 * this.v.y * this.n) - (2 * this.v.x * this.v.z);
			t1 = sqx - sqy - sqz + sqw;
			result.yaw = (Math.atan2(t0, t1)) / my.radian;
			result.roll = (Math.asin((2 * test) / unit)) / my.radian;
			t0 = (2 * this.v.x * this.n) - (2 * this.v.y * this.v.z);
			t1 = sqy - sqx - sqz + sqw;
			result.pitch = (Math.atan2(t0, t1)) / my.radian;
			return result;
		};
		my.workquat = {
			q1: my.newQuaternion({
				name: 'scrawl.workquat.q1'
			}),
			q2: my.newQuaternion({
				name: 'scrawl.workquat.q2'
			}),
			q3: my.newQuaternion({
				name: 'scrawl.workquat.q3'
			}),
			q4: my.newQuaternion({
				name: 'scrawl.workquat.q4'
			}),
			q5: my.newQuaternion({
				name: 'scrawl.workquat.q5'
			}),
		};

		return my;
	}(scrawl));
}
