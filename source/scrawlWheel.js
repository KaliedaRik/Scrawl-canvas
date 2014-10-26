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
/**
# scrawlWheel

## Purpose and features

The Wheel module adds Wheel sprites - circles, segments and filled arcs - to the core module

* Defines 'arc' objects for displaying on a Cell's canvas
* Performs 'arc' based drawing operations on canvases

@module scrawlWheel
**/
var scrawl = (function(my) {
	'use strict';

	/**
# window.scrawl

scrawlWheel module adaptions to the Scrawl library object

@class window.scrawl_Wheel
**/

	/**
A __factory__ function to generate new Wheel sprites
@method newWheel
@param {Object} items Key:value Object argument for setting attributes
@return Wheel object
@example
	scrawl.newWheel({
		radius: 50,
		startX: 150,
		startY: 60,
		fillStyle: 'blue',
		strokeStyle: 'red',
		method: 'drawFill',
		});
**/
	my.newWheel = function(items) {
		return new my.Wheel(items);
	};

	my.workwheel = {
		v1: my.newVector(),
	};
	/**
# Wheel

## Instantiation

* scrawl.newWheel()

## Purpose

* Defines 'arc' objects for displaying on a Cell's canvas
* Performs 'arc' based drawing operations on canvases

## Access

* scrawl.sprite.WHEELNAME - for the Wheel sprite object

@class Wheel
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Wheel = function Wheel(items) {
		items = my.safeObject(items);
		my.Sprite.call(this, items);
		my.Position.prototype.set.call(this, items);
		this.radius = my.xtGet([items.radius, my.d.Wheel.radius]);
		this.width = this.radius * 2;
		this.height = this.width;
		this.checkHitUsingRadius = my.xtGet([items.checkHitUsingRadius, my.d.Wheel.checkHitUsingRadius]);
		this.closed = my.xtGet([items.closed, my.d.Wheel.closed]);
		this.includeCenter = my.xtGet([items.includeCenter, my.d.Wheel.includeCenter]);
		this.clockwise = my.xtGet([items.clockwise, my.d.Wheel.clockwise]);
		this.registerInLibrary();
		my.pushUnique(my.group[this.group].sprites, this.name);
		return this;
	};
	my.Wheel.prototype = Object.create(my.Sprite.prototype);
	/**
@property type
@type String
@default 'Wheel'
@final
**/
	my.Wheel.prototype.type = 'Wheel';
	my.Wheel.prototype.classname = 'spritenames';
	my.d.Wheel = {
		/**
Angle of the path's start point, from due east, in degrees
@property startAngle
@type Number
@default 0
**/
		startAngle: 0,
		/**
Angle of the path's end point, from due east, in degrees
@property endAngle
@type Number
@default 360
**/
		endAngle: 360,
		/**
Drawing flag - true to draw the arc in a clockwise direction; false for anti-clockwise
@property clockwise
@type Boolean
@default false
**/
		clockwise: false,
		/**
Drawing flag - true to close the path; false to keep the path open
@property closed
@type Boolean
@default true
**/
		closed: true,
		/**
Drawing flag - true to include the center in the path (for wedge shapes); false for circles
@property includeCenter
@type Boolean
@default false
**/
		includeCenter: false,
		/**
Collision calculation flag - true to use a simple radius check; false to use the JavaScript isPointInPath() function
@property checkHitUsingRadius
@type Boolean
@default true
**/
		checkHitUsingRadius: true,
		/**
Collision calculation value - collision radius, from start vector
@property checkHitRadius
@type Number
@default 0
**/
		checkHitRadius: 0,
	};
	my.mergeInto(my.d.Wheel, my.d.Sprite);
	/**
Augments Sprite.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Wheel.prototype.set = function(items) {
		my.Sprite.prototype.set.call(this, items);
		this.radius = my.xtGet([items.radius, this.radius]);
		this.width = this.radius * 2;
		this.height = this.width;
		return this;
	};
	/**
Augments Sprite.setDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Wheel.prototype.setDelta = function(items) {
		my.Sprite.prototype.setDelta.call(this, items);
		items = (my.isa(items, 'obj')) ? items : {};
		var f = {};
		if (my.xt(items.radius)) {
			this.radius += items.radius;
			this.width = this.radius * 2;
			this.height = this.width;
		}
		if (my.xt(items.startAngle)) {
			f.startAngle = this.get('startAngle') + items.startAngle;
		}
		if (my.xt(items.endAngle)) {
			f.endAngle = this.get('endAngle') + items.endAngle;
		}
		this.set(f);
		return this;
	};
	/**
Check a set of coordinates to see if any of them fall within this sprite's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate
* __pad__ - PADNAME String

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values

If the __checkHitUsingRadius__ attribute is true, collisions will be detected using a simple distance comparison; otherwise the JavaScript isPointInPath() function will be invoked
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the sprite's path; false if none fall within the path
**/
	my.Wheel.prototype.checkHit = function(items) {
		items = my.safeObject(items);
		var tests = (my.xt(items.tests)) ? items.tests : [(items.x || false), (items.y || false)],
			result = false,
			coords,
			testRadius,
			ctx,
			i, iz;
		if (this.checkHitUsingRadius) {
			testRadius = (this.checkHitRadius) ? this.checkHitRadius : this.radius * this.scale;
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				this.resetWork();
				coords = my.workwheel.v1.set({
					x: tests[i],
					y: tests[i + 1]
				});
				coords.vectorSubtract(this.work.start).scalarDivide(this.scale).rotate(-this.roll);
				coords.x = (this.flipReverse) ? -coords.x : coords.x;
				coords.y = (this.flipUpend) ? -coords.y : coords.y;
				coords.vectorAdd(this.getPivotOffsetVector(this.handle));
				result = (coords.getMagnitude() <= testRadius) ? true : false;
				if (result) {
					break;
				}
			}
		}
		else {
			ctx = my.cvx;
			this.buildPath(ctx);
			for (i = 0, iz = tests.length; i < iz; i += 2) {
				result = ctx.isPointInPath(tests[i], tests[i + 1]);
				if (result) {
					break;
				}
			}
		}
		return (result) ? {
			x: tests[i],
			y: tests[i + 1]
		} : false;
	};
	/**
Position.getOffsetStartVector() helper function
@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	my.Wheel.prototype.getPivotOffsetVector = function() {
		return this.getCenteredPivotOffsetVector();
	};
	/**
Stamp helper function - define the sprite's path on the &lt;canvas&gt; element's context engine
@method buildPath
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.buildPath = function(ctx, cell) {
		var here = this.prepareStamp(),
			startAngle = this.get('startAngle'),
			endAngle = this.get('endAngle');
		this.rotateCell(ctx, cell);
		ctx.beginPath();
		ctx.arc(here.x, here.y, (this.radius * this.scale), (startAngle * my.radian), (endAngle * my.radian), this.clockwise);
		if (this.includeCenter) {
			ctx.lineTo(here.x, here.y);
		}
		if (this.closed) {
			ctx.closePath();
		}
		return this;
	};
	/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.clip = function(ctx, cell) {
		this.buildPath(ctx, cell);
		ctx.clip();
		return this;
	};
	/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.clear = function(ctx, cell) {
		ctx.globalCompositeOperation = 'destination-out';
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		ctx.globalCompositeOperation = my.ctx[cell].get('globalCompositeOperation');
		return this;
	};
	/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.clearWithBackground = function(ctx, cell) {
		var myCell = my.cell[cell],
			bc = myCell.get('backgroundColor'),
			myCellCtx = my.ctx[cell],
			fillStyle = myCellCtx.get('fillStyle'),
			strokeStyle = myCellCtx.get('strokeStyle'),
			globalAlpha = myCellCtx.get('globalAlpha');
		ctx.fillStyle = bc;
		ctx.strokeStyle = bc;
		ctx.globalAlpha = 1;
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		ctx.globalAlpha = globalAlpha;
		return this;
	};
	/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.draw = function(ctx, cell) {
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		return this;
	};
	/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.fill = function(ctx, cell) {
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		return this;
	};
	/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.drawFill = function(ctx, cell) {
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		this.clearShadow(ctx, cell);
		ctx.fill();
		return this;
	};
	/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.fillDraw = function(ctx, cell) {
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		this.clearShadow(ctx, cell);
		ctx.stroke();
		return this;
	};
	/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.sinkInto = function(ctx, cell) {
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		ctx.stroke();
		return this;
	};
	/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Wheel.prototype.floatOver = function(ctx, cell) {
		my.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		return this;
	};
	/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the sprite's collision points
@method buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	my.Wheel.prototype.buildCollisionVectors = function(items) {
		var p, c = [],
			v, w, r,
			res;
		if (my.xt(my.workcols)) {
			v = my.workcols.v1.set({
				x: this.radius,
				y: 0
			});
			p = (my.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints;
			for (var i = 0, iz = p.length; i < iz; i++) {
				if (my.isa(p[i], 'num') && p[i] > 1) {
					w = my.workcols.v2.set(v);
					r = 360 / Math.floor(p[i]);
					for (var j = 0; j < p[i]; j++) {
						w.rotate(r);
						c.push(w.x);
						c.push(w.y);
					}
				}
				else if (my.isa(p[i], 'str')) {
					w = my.workcols.v2.set(v);
					switch (p[i]) {
						case 'start':
							c.push(0);
							c.push(0);
							break;
						case 'N':
							w.rotate(-90);
							c.push(w.x);
							c.push(w.y);
							break;
						case 'NE':
							w.rotate(-45);
							c.push(w.x);
							c.push(w.y);
							break;
						case 'E':
							c.push(w.x);
							c.push(w.y);
							break;
						case 'SE':
							w.rotate(45);
							c.push(w.x);
							c.push(w.y);
							break;
						case 'S':
							w.rotate(90);
							c.push(w.x);
							c.push(w.y);
							break;
						case 'SW':
							w.rotate(135);
							c.push(w.x);
							c.push(w.y);
							break;
						case 'W':
							w.rotate(180);
							c.push(w.x);
							c.push(w.y);
							break;
						case 'NW':
							w.rotate(-135);
							c.push(w.x);
							c.push(w.y);
							break;
						case 'center':
							c.push(0);
							c.push(0);
							break;
					}
				}
				else if (my.isa(p[i], 'vector')) {
					c.push(p[i].x);
					c.push(p[i].y);
				}
			}
		}
		this.collisionVectors = c;
		return this;
	};

	return my;
}(scrawl));
