//---------------------------------------------------------------------------------
// The MIT License (MIT)
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

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

/**
# scrawlAnimation

## Purpose and features

The Animation module adds support for animation and tweening to the core

* Adds and starts an animation loop to the core
* Defines the Animation object, used to program animation sequences
* Defines the Tween object - a specialized form of animation which has pre-determined start and end points, durations and easing options
* Adds functionality to various core objects and functions so they can take advantage of the animation object

@module scrawlAnimation
**/
if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'animation')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlAnimation module adaptions to the Scrawl library object

## New library sections

* scrawl.animation - for Animation and Tween objects

* scrawl.doAnimation - a boolean switch to start/stop the animation loop
* scrawl.animate - the animation loop function

## New default attributes

* Position.delta - default: {x:0,y:0,z:0};
* Position.deltaPathPlace - default: 0;
* Position.pathSpeedConstant - default: true;
* Position.path - default: '';

* Cell.sourceDelta - default: {x:0, y:0, z:0};
* Cell.sourceMinWidth - default: 0;
* Cell.sourceMaxWidth - default: 0;
* Cell.sourceMinHeight - default: 0;
* Cell.sourceMaxHeight - default: 0;

* Design.roll - default: 0;
* Design.autoUpdate - default: false;

@class window.scrawl_Animation
**/

		/**
Starts the animation loop
@method animationInit
@private
**/
		my.animationInit = function() {
			my.doAnimation = true;
			my.animationLoop();
		};
		my.d.Position.delta = {
			x: 0,
			y: 0,
			z: 0
		};
		my.d.Position.deltaPathPlace = 0;
		my.d.Position.pathSpeedConstant = true;
		my.mergeInto(my.d.Cell, my.d.Position);
		my.mergeInto(my.d.Entity, my.d.Position);
		if (my.xt(my.d.Block)) {
			my.mergeInto(my.d.Block, my.d.Entity);
		}
		if (my.xt(my.d.Shape)) {
			my.mergeInto(my.d.Shape, my.d.Entity);
		}
		if (my.xt(my.d.Wheel)) {
			my.mergeInto(my.d.Wheel, my.d.Entity);
		}
		if (my.xt(my.d.Picture)) {
			my.mergeInto(my.d.Picture, my.d.Entity);
		}
		if (my.xt(my.d.Phrase)) {
			my.mergeInto(my.d.Phrase, my.d.Entity);
		}
		if (my.xt(my.d.Path)) {
			my.mergeInto(my.d.Path, my.d.Entity);
		}
		/**
Convert a time into its component properties

Expected values:
* Number - time value in milliseconds
* String number+% - will always return a Number time value of 0
* String number+ms - returns a Number time value in milliseconds
* String number+s - converts and returns a Number time value in milliseconds

@method convertTime
@return [String timeUnit, Number timeValue]
@private
**/
		my.convertTime = function(item) {
			var a, timeUnit, timeValue;
			if (item && (item.substring || item.toFixed)) {
				if (item.toFixed) {
					return ['ms', item];
				}
				a = item.match(/^\d+\.?\d*(\D*)/);
				if (a[1].toLowerCase)
					timeUnit = (a[1].toLowerCase) ? a[1].toLowerCase() : 'ms';
				switch (timeUnit) {
					case 's':
						timeValue = parseFloat(item) * 1000;
						break;
					case '%':
						timeValue = 0;
						break;
					default:
						timeValue = parseFloat(item);
				}
				return [timeUnit, timeValue];
			}
			return false;
		};
		/**
Position constructor hook function

Adds a __delta__ (deltaX, deltaY) Vector to the object, used to give an object a 'velocity'

@method animationPositionInit
@private
**/
		my.Position.prototype.animationPositionInit = function(items) {
			var temp = my.safeObject(items.delta);
			this.delta = my.makeVector({
				x: my.xtGet(items.deltaX, temp.x, 0),
				y: my.xtGet(items.deltaY, temp.y, 0),
			});
			this.work.delta = my.makeVector({
				name: this.type + '.' + this.name + '.work.delta'
			});
			this.pathSpeedConstant = my.xtGet(items.pathSpeedConstant, my.d[this.type].pathSpeedConstant);
			this.deltaPathPlace = my.xtGet(items.deltaPathPlace, my.d[this.type].deltaPathPlace);
		};
		/**
Position.get hook function - modified by animation module
@method animationPositionGet
@private
**/
		my.Position.prototype.animationPositionGet = function(item) {
			var stat = ['deltaX', 'deltaY'];
			if (my.contains(stat, item)) {
				switch (item) {
					case 'deltaX':
						return this.delta.x;
					case 'deltaY':
						return this.delta.y;
				}
			}
			if ('delta' === item) {
				return this.delta.getVector();
			}
			return false;
		};
		/**
Position.set hook function - modified by animation module
@method animationPositionSet
@private
**/
		my.Position.prototype.animationPositionSet = function(items) {
			if (my.xto(items.delta, items.deltaX, items.deltaY)) {
				this.setDeltaAttribute(items);
			}
		};
		/**
Augments Position.set(), to allow users to set the delta attributes using delta, deltaX, deltaY

The scrawlAnimation module adds a __delta__ attribute to Cells and Entitys - this is an inbuilt delta vector which can be used to automatically animate the start vector of these objects - via the updateStart, revertStart and reverse functions - as part of the animation cycle.

Be aware that this is different to the Position.setDelta() function inherited by Cells and Entitys. setDelta is used to add a supplied argument value to the existing values of any numerical attribute of a Cell or Entity object, and is thus not limited to the animation cycle.

@method setDeltaAttribute
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Position.prototype.setDeltaAttribute = function(items) {
			var temp;
			items = my.safeObject(items);
			if (!my.isa(this.delta, 'vector')) {
				this.delta = my.makeVector(items.delta || this.delta);
			}
			temp = my.safeObject(items.delta);
			this.delta.x = my.xtGet(items.deltaX, temp.x, this.delta.x);
			this.delta.y = my.xtGet(items.deltaY, temp.y, this.delta.y);
			return this;
		};
		/**
Position.clone hook function - modified by animation module
@method animationPositionClone
@private
**/
		my.Position.prototype.animationPositionClone = function(a, items) {
			var temp = my.safeObject(items.delta);
			a.delta = my.makeVector({
				x: my.xtGet(items.deltaX, temp.x, a.delta.x),
				y: my.xtGet(items.deltaY, temp.y, a.delta.y),
			});
			return a;
		};
		/**
Adds delta values to the start vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x
* 'y' - delta.y added to start.y
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method Position.updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Position.prototype.updateStart = function(item) {
			switch (item) {
				case 'x':
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + this.delta.x : my.addPercentages(this.start.x, this.delta.x || 0);
					break;
				case 'y':
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + this.delta.y : my.addPercentages(this.start.y, this.delta.y || 0);
					break;
				case 'path':
					this.pathPlace = my.addWithinBounds(this.pathPlace, this.deltaPathPlace, {
						action: 'loop'
					});
					break;
				default:
					this.pathPlace = my.addWithinBounds(this.pathPlace, (this.deltaPathPlace || 0), {
						action: 'loop'
					});
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + this.delta.x : my.addPercentages(this.start.x, this.delta.x || 0);
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + this.delta.y : my.addPercentages(this.start.y, this.delta.y || 0);
			}
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			return this;
		};
		/**
Subtracts delta values from the start vector; subtracts deltaPathPlace from pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x
* 'y' - delta.y subtracted from start.y
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method Position.revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Position.prototype.revertStart = function(item) {
			switch (item) {
				case 'x':
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x - this.delta.x : my.subtractPercentages(this.start.x, this.delta.x || 0);
					break;
				case 'y':
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y - this.delta.y : my.subtractPercentages(this.start.y, this.delta.y || 0);
					break;
				case 'path':
					this.pathPlace = my.addWithinBounds(this.pathPlace, this.deltaPathPlace, {
						action: 'loop',
						operation: '-'
					});
					break;
				default:
					this.pathPlace = my.addWithinBounds(this.pathPlace, (this.deltaPathPlace || 0), {
						action: 'loop',
						operation: '-'
					});
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x - this.delta.x : my.subtractPercentages(this.start.x, this.delta.x || 0);
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y - this.delta.y : my.subtractPercentages(this.start.y, this.delta.y || 0);
			}
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			return this;
		};
		/**
Swaps the values of an attribute between two objects
@method Position.exchange
@param {Object} obj Object with which this object will swap attribute values
@param {String} item Attribute to be swapped
@return This
@chainable
**/
		my.Position.prototype.exchange = function(obj, item) {
			var temp;
			if (my.isa(obj, 'obj')) {
				temp = this[item] || this.get(item);
				this[item] = obj[item] || obj.get(item);
				obj[item] = temp;
			}
			return this;
		};
		/**
Changes the sign (+/-) of specified attribute values
@method Position.reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
		my.Position.prototype.reverse = function(item) {
			switch (item) {
				case 'deltaX':
					this.delta.x = (my.isa(this.delta.x, 'num')) ? -this.delta.x : my.reversePercentage(this.delta.x);
					break;
				case 'deltaY':
					this.delta.y = (my.isa(this.delta.y, 'num')) ? -this.delta.y : my.reversePercentage(this.delta.y);
					break;
				case 'delta':
					this.delta.x = (my.isa(this.delta.x, 'num')) ? -this.delta.x : my.reversePercentage(this.delta.x);
					this.delta.y = (my.isa(this.delta.y, 'num')) ? -this.delta.y : my.reversePercentage(this.delta.y);
					break;
				case 'deltaPathPlace':
					this.deltaPathPlace = -this.deltaPathPlace;
					break;
				default:
					this.deltaPathPlace = -this.deltaPathPlace;
					this.delta.x = (my.isa(this.delta.x, 'num')) ? -this.delta.x : my.reversePercentage(this.delta.x);
					this.delta.y = (my.isa(this.delta.y, 'num')) ? -this.delta.y : my.reversePercentage(this.delta.y);
			}
			return this;
		};
		my.d.Cell.copyDelta = {
			x: 0,
			y: 0,
		};
		my.d.Cell.copyMinWidth = 0;
		my.d.Cell.copyMaxWidth = 0;
		my.d.Cell.copyMinHeight = 0;
		my.d.Cell.copyMaxHeight = 0;
		/**
Cell constructor hook function

Adds a __sourceDelta__ (sourceDeltaX, sourceDeltaY) Vector to the cell, used to give it a 'velocity'

@method animationCellInit
@private
**/
		my.Cell.prototype.animationCellInit = function(items) {
			var temp = my.safeObject(items.copyDelta);
			this.copyDelta = my.makeVector({
				x: my.xtGet(items.copyDeltaX, temp.x, 0),
				y: my.xtGet(items.copyDeltaY, temp.y, 0),
			});
			this.work.copyDelta = my.makeVector();
		};
		/**
Cell.get hook function - modified by animation module
@method animationCellGet
@private
**/
		my.Cell.prototype.animationCellGet = function(item) {
			var stat = ['copyDeltaX', 'copyDeltaY'];
			if (my.contains(stat, item)) {
				switch (item) {
					case 'copyDeltaX':
						return this.copyDelta.x;
					case 'copyDeltaY':
						return this.copyDelta.y;
				}
			}
			return my.Base.prototype.get.call(this, item);
		};
		/**
Cell.set hook function - modified by animation module
@method animationCellSet
@private
**/
		my.Cell.prototype.animationCellSet = function(items) {
			var temp;
			if (my.xto(items.copyDelta, items.copyDeltaX, items.copyDeltaY)) {
				temp = my.safeObject(items.copyDelta);
				this.copyDelta.x = my.xtGet(items.copyDeltaX, temp.x, this.copyDelta.x);
				this.copyDelta.y = my.xtGet(items.copyDeltaY, temp.y, this.copyDelta.y);
			}
		};
		/**
Adds delta values to the start vector; adds sourceDelta values to the source vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x; deltaSource.x added to source.x
* 'y' - delta.y added to start.y; deltaSource.y added to source.y
* 'start', 'target' - delta added to start
* 'source' - deltaSource added to source
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method Cell.updateStart
@param {String} [item] String used to limit this function's actions
@return This
@chainable
**/
		my.Cell.prototype.updateStart = function(item) {
			switch (item) {
				case 'x':
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + this.delta.x : my.addPercentages(this.start.x, this.delta.x || 0);
					this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x + this.copyDelta.x : my.addPercentages(this.copy.x, this.copyDelta.x || 0);
					break;
				case 'y':
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + this.delta.y : my.addPercentages(this.start.y, this.delta.y || 0);
					this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y + this.copyDelta.y : my.addPercentages(this.copy.y, this.copyDelta.y || 0);
					break;
				case 'start':
				case 'paste':
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + this.delta.x : my.addPercentages(this.start.x, this.delta.x || 0);
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + this.delta.y : my.addPercentages(this.start.y, this.delta.y || 0);
					break;
				case 'copy':
					this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x + this.copyDelta.x : my.addPercentages(this.copy.x, this.copyDelta.x || 0);
					this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y + this.copyDelta.y : my.addPercentages(this.copy.y, this.copyDelta.y || 0);
					break;
				case 'path':
					this.pathPlace = my.addWithinBounds(this.pathPlace, this.deltaPathPlace, {
						action: 'loop'
					});
					break;
				default:
					if (my.xt(this.pathPlace)) {
						this.pathPlace = my.addWithinBounds(this.pathPlace, (this.deltaPathPlace || 0), {
							action: 'loop'
						});
					}
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + this.delta.x : my.addPercentages(this.start.x, this.delta.x || 0);
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + this.delta.y : my.addPercentages(this.start.y, this.delta.y || 0);
					this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x + this.copyDelta.x : my.addPercentages(this.copy.x, this.copyDelta.x || 0);
					this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y + this.copyDelta.y : my.addPercentages(this.copy.y, this.copyDelta.y || 0);
			}
			this.setCopy();
			this.setPaste();
			return this;
		};
		/**
Subtracts delta values from the start vector; subtracts sourceDelta values from the source vector; subtracts deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x; deltaSource.x subtracted from source.x
* 'y' - delta.y subtracted from start.y; deltaSource.y subtracted from source.y
* 'start', 'target' - delta subtracted from start
* 'source' - deltaSource subtracted from source
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method Cell.revertStart
@param {String} [item] String used to limit this function's actions
@return This
@chainable
**/
		my.Cell.prototype.revertStart = function(item) {
			switch (item) {
				case 'x':
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x - this.delta.x : this.subtractPercentages(this.start.x, this.delta.x || 0);
					this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x - this.copyDelta.x : this.subtractPercentages(this.copy.x, this.copyDelta.x || 0);
					break;
				case 'y':
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y - this.delta.y : this.subtractPercentages(this.start.y, this.delta.y || 0);
					this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y - this.copyDelta.y : this.subtractPercentages(this.copy.y, this.copyDelta.y || 0);
					break;
				case 'start':
				case 'paste':
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x - this.delta.x : this.subtractPercentages(this.start.x, this.delta.x || 0);
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y - this.delta.y : this.subtractPercentages(this.start.y, this.delta.y || 0);
					break;
				case 'copy':
					this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x - this.copyDelta.x : this.subtractPercentages(this.copy.x, this.copyDelta.x || 0);
					this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y - this.copyDelta.y : this.subtractPercentages(this.copy.y, this.copyDelta.y || 0);
					break;
				case 'path':
					this.pathPlace = my.addWithinBounds(this.pathPlace, this.deltaPathPlace, {
						action: 'loop',
						operation: '-'
					});
					break;
				default:
					if (my.xt(this.pathPlace)) {
						this.pathPlace = my.addWithinBounds(this.pathPlace, (this.deltaPathPlace || 0), {
							action: 'loop',
							operation: '-'
						});
					}
					this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x - this.delta.x : this.subtractPercentages(this.start.x, this.delta.x || 0);
					this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y - this.delta.y : this.subtractPercentages(this.start.y, this.delta.y || 0);
					this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x - this.copyDelta.x : this.subtractPercentages(this.copy.x, this.copyDelta.x || 0);
					this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y - this.copyDelta.y : this.subtractPercentages(this.copy.y, this.copyDelta.y || 0);
			}
			this.setCopy();
			this.setPaste();
			return this;
		};
		/**
Zooms one cell in relation to another cell
@method Cell.zoom
@param {Number} item Number of pixels to amend the zoomed cell's start and dimensions by
@return This
@chainable
**/
		my.Cell.prototype.zoom = function(item) {
			var sWidth,
				sHeight,
				aWidth,
				aHeight,
				minWidth,
				minHeight,
				maxWidth,
				maxHeight,
				sx,
				sy,
				myW,
				myH,
				myX,
				myY;
			if (my.isa(item, 'num')) {
				sWidth = this.copyWidth;
				sHeight = this.copyHeight;
				aWidth = this.actualWidth;
				aHeight = this.actualHeight;
				minWidth = my.xtGet(this.copyMinWidth, this.copyWidth);
				minHeight = my.xtGet(this.copyMinHeight, this.copyHeight);
				maxWidth = my.xtGet(this.copyMaxWidth, this.copyWidth);
				maxHeight = my.xtGet(this.copyMaxHeight, this.copyHeight);
				sx = this.copy.x;
				sy = this.copy.y;
				myW = sWidth + item;
				myH = sHeight + item;
				if (my.isBetween(myW, minWidth, maxWidth, true) && my.isBetween(myH, minHeight, maxHeight, true)) {
					sWidth = myW;
					myX = sx - (item / 2);
					if (myX < 0) {
						sx = 0;
					}
					else if (myX > (aWidth - sWidth)) {
						sx = aWidth - sWidth;
					}
					else {
						sx = myX;
					}
					sHeight = myH;
					myY = sy - (item / 2);
					if (myY < 0) {
						sy = 0;
					}
					else if (myY > (aHeight - sHeight)) {
						sy = aHeight - sHeight;
					}
					else {
						sy = myY;
					}
					this.copy.x = sx;
					this.copy.y = sy;
					this.copyWidth = sWidth;
					this.copyHeight = sHeight;
				}
			}
			return this;
		};
		/**
Perform a splice-shift-join operation on the &lt;canvas&gt; element's current scene

Argument is an Object in the form:

* {edge:String, strip:Number}

Permitted values for the argument Object's attributes are:

* __edge__ - one from 'horizontal', 'vertical', 'top', 'bottom', 'left', 'right'
* __strip__ - a width/height Number (in pixels) of the strip that is to be moved from the named edge of the &lt;canvas&gt; to the opposite edge
* __shiftSource__ - boolean - when true, will automatically shift the sourceX and sourceY coordinates; default: false

_Note that this function is only effective in achieving a parallax effect if the user never clears or updates the cell's &lt;canvas&gt; element, and takes steps to shift the cell's source vector appropriately each time the splice operation is performed_

@method Cell.spliceCell
@param {Object} items Object containing data for the splice operation
@return This
@chainable
**/
		my.Cell.prototype.spliceCell = function(items) {
			var stat = ['horizontal', 'vertical', 'top', 'bottom', 'left', 'right'],
				myStrip,
				myRemains,
				myEdge,
				myShift,
				height,
				width,
				ctx,
				c;
			items = my.safeObject(items);
			if (my.contains(stat, items.edge)) {
				myShift = my.xtGet(items.shiftCopy, false);
				height = this.actualHeight;
				width = this.actualWidth;
				ctx = my.context[this.name];
				c = my.canvas[this.name];
				my.cv.width = width;
				my.cv.height = height;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				switch (items.edge) {
					case 'horizontal':
						myRemains = width / 2;
						myStrip = myRemains;
						myEdge = 'left';
						break;
					case 'vertical':
						myRemains = height / 2;
						myStrip = myRemains;
						myEdge = 'top';
						break;
					case 'top':
					case 'bottom':
						myStrip = my.xtGet(items.strip, 20);
						myRemains = height - myStrip;
						myEdge = items.edge;
						break;
					case 'left':
					case 'right':
						myStrip = my.xtGet(items.strip, 20);
						myRemains = width - myStrip;
						myEdge = items.edge;
						break;
				}
				switch (myEdge) {
					case 'top':
						my.cvx.drawImage(c, 0, 0, width, myStrip, 0, myRemains, width, myStrip);
						my.cvx.drawImage(c, 0, myStrip, width, myRemains, 0, 0, width, myRemains);
						this.copy.y -= (myShift) ? myStrip : 0;
						break;
					case 'bottom':
						my.cvx.drawImage(c, 0, 0, width, myRemains, 0, myStrip, width, myRemains);
						my.cvx.drawImage(c, 0, myRemains, width, myStrip, 0, 0, width, myStrip);
						this.copy.y += (myShift) ? myStrip : 0;
						break;
					case 'left':
						my.cvx.drawImage(c, 0, 0, myStrip, height, myRemains, 0, myStrip, height);
						my.cvx.drawImage(c, myStrip, 0, myRemains, height, 0, 0, myRemains, height);
						this.copy.x -= (myShift) ? myStrip : 0;
						break;
					case 'right':
						my.cvx.drawImage(c, 0, 0, myRemains, height, myStrip, 0, myRemains, height);
						my.cvx.drawImage(c, myRemains, 0, myStrip, height, 0, 0, myStrip, height);
						this.copy.x += (myShift) ? myStrip : 0;
						break;
				}
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(my.cv, 0, 0, width, height);
				if (myShift) {
					this.setCopy();
				}
			}
			return this;
		};
		/**
Ask all entitys in the Group to perform an updateStart() operation

Each entity will add their delta values to their start Vector, and/or add deltaPathPlace from pathPlace
@method Group.updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Group.prototype.updateStart = function(item) {
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				my.entity[this.entitys[i]].updateStart(item);
			}
			return this;
		};
		/**
Ask all entitys in the Group to perform a revertStart() operation

Each entity will subtract their delta values to their start Vector, and/or subtract deltaPathPlace from pathPlace
@method Group.revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.Group.prototype.revertStart = function(item) {
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				my.entity[this.entitys[i]].revertStart(item);
			}
			return this;
		};
		/**
Ask all entitys in the group to perform a reverse() operation

Each entity will change the sign (+/-) of specified attribute values
@method Group.reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
		my.Group.prototype.reverse = function(item) {
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				my.entity[this.entitys[i]].reverse(item);
			}
			return this;
		};
		/**
A value for shifting the color stops (was __roll__ in versions prior to v4.0)
@property shift
@type Number
@default 0
**/
		my.d.Design.shift = 0;
		/**
A flag to indicate that stop color shifts should be automatically applied
@property autoUpdate
@type Boolean
@default false
**/
		my.d.Design.autoUpdate = false;
		my.mergeInto(my.d.Gradient, my.d.Design);
		my.mergeInto(my.d.RadialGradient, my.d.Design);
		if (my.xt(my.d.Pattern)) {
			my.mergeInto(my.d.Pattern, my.d.Design);
		}
		/**
Creates the gradient

_This function replaces the one in the core module_
@method Design.update
@param {String} [entity] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
**/
		my.Design.prototype.update = function(entity, cell) {
			this.makeGradient(entity, cell);
			this.sortStops();
			this.applyStops();
			return this;
		};
		/**
Gradient builder helper function - sorts color attribute Objects by their stop attribute values, after adding the roll value to them
@method Design.sortStops
@return Nothing
@private
**/
		my.Design.prototype.sortStops = function() {
			var color,
				shift,
				i,
				iz;
			color = this.get('color');
			shift = this.get('shift');
			for (i = 0, iz = color.length; i < iz; i++) {
				color[i].stop += shift;
				if (!my.isBetween(color[i].stop, 0, 1, true)) {
					color[i].stop = (color[i].stop > 0.5) ? color[i].stop - 1 : color[i].stop + 1;
				}
				if (color[i].stop <= 0) {
					color[i].stop = 0.000001;
				}
				else if (color[i].stop >= 1) {
					color[i].stop = 0.999999;
				}
			}
			color.sort(function(a, b) {
				return a.stop - b.stop;
			});
			this.color = color;
		};
		/**
Alias for makeAnimation()
@method newAnimation
@deprecated
**/
		my.newAnimation = function(items) {
			return my.makeAnimation(items);
		};
		/**
Alias for makeTween()
@method newTween
@deprecated
**/
		my.newTween = function(items) {
			return my.makeTween(items);
		};
		/**
Alias for makeTimeline()
@method newTimeline
@deprecated
**/
		my.newTimeline = function(items) {
			return my.makeTimeline(items);
		};
		/**
Alias for makeAction()
@method newAction
@deprecated
**/
		my.newAction = function(items) {
			return my.makeAction(items);
		};
		/**
A __factory__ function to generate new Animation objects
@method makeAnimation
@param {Object} items Key:value Object argument for setting attributes
@return Animation object
**/
		my.makeAnimation = function(items) {
			return new my.Animation(items);
		};
		/**
A __factory__ function to generate new Tween objects
@method makeTween
@param {Object} items Key:value Object argument for setting attributes
@return Tween object
**/
		my.makeTween = function(items) {
			return new my.Tween(items);
		};
		/**
A __factory__ function to generate new Timeline objects
@method makeTimeline
@param {Object} items Key:value Object argument for setting attributes
@return Timeline object
**/
		my.makeTimeline = function(items) {
			return new my.Timeline(items);
		};
		/**
A __factory__ function to generate new Action objects
@methodmakewAction
@param {Object} items Key:value Object argument for setting attributes
@return Action object
**/
		my.makeAction = function(items) {
			return new my.Action(items);
		};
		my.pushUnique(my.sectionlist, 'animation');
		my.pushUnique(my.nameslist, 'animate');
		my.pushUnique(my.nameslist, 'animationnames');
		/**
Animation flag: set to false to stop animation loop
@property doAnimation
@type {Boolean}
**/
		my.doAnimation = false;
		/**
Animation ordering flag - when set to false, the ordering of animations is skipped; default: true
@property orderAnimations
@type {Boolean}
@default true
**/
		my.orderAnimations = true;
		/**
The Scrawl animation loop

Animation loop is invoked automatically as part of the initialization process

Scrawl will run all Animation objects whose ANIMATIONNAME Strings are included in the __scrawl.animate__ Array

All animation can be halted by setting the __scrawl.doAnimation__ flag to false

To restart animation, either call __scrawl.initialize()__, or set _scrawl.doAnimation_ to true and call __scrawl.animationLoop()

@method animationLoop
@return Recursively calls itself - never returns
**/
		my.animationLoop = function() {
			var i,
				iz;
			if (my.orderAnimations) {
				my.sortAnimations();
			}
			for (i = 0, iz = my.animate.length; i < iz; i++) {
				if (my.animate[i]) {
					my.animation[my.animate[i]].fn();
				}
			}
			if (my.doAnimation) {
				window.requestAnimFrame(function() {
					my.animationLoop();
				});
			}
		};
		/**
Animation sorting routine - animation objects are sorted according to their animation.order attribute value, in ascending order
@method sortAnimations
@return Nothing
@private
**/
		my.sortAnimations = function() {
			my.animate.sort(function(a, b) {
				return my.animation[a].order - my.animation[b].order;
			});
		};

		/**
# Animation

## Instantiation

* scrawl.makeAnimation()

## Purpose

* Defines an animation function to be run by the scrawl.animationLoop() function

## Access

* scrawl.animation.ANIMATIONNAME - for the Animation object

@class Animation
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Animation = function(items) {
			var delay;
			my.Base.call(this, items);
			items = my.safeObject(items);
			delay = (my.isa(items.delay, 'bool')) ? items.delay : false;
			this.fn = items.fn || function() {};
			this.order = items.order || 0;
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			/**
Pseudo-attribute used to prevent immediate running of animation when first created

_This attribute is not retained by the Animation object_
@property delay
@type Boolean
@default false
**/
			if (!delay) {
				this.run();
			}
			return this;
		};
		my.Animation.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Animation'
@final
**/
		my.Animation.prototype.type = 'Animation';
		my.Animation.prototype.classname = 'animationnames';
		my.d.Animation = {
			/**
Anonymous function for an animation routine
@property fn
@type Function
@default function(){}
**/
			fn: function() {},
			/**
Lower order animations are run during each frame before higher order ones
@property order
@type Number
@default 0
**/
			order: 0,
		};
		my.mergeInto(my.d.Animation, my.d.Base);
		/**
Run an animation
@method run
@return Always true
**/
		my.Animation.prototype.run = function() {
			my.pushUnique(my.animate, this.name);
			return true;
		};
		/**
Stop an animation
@method halt
@return Always true
**/
		my.Animation.prototype.halt = function() {
			my.removeItem(my.animate, this.name);
			return true;
		};
		/**
Remove this Animation from the scrawl library
@method kill
@return Always true
**/
		my.Animation.prototype.kill = function() {
			delete my.animation[this.name];
			my.removeItem(my.animationnames, this.name);
			my.removeItem(my.animate, this.name);
			return true;
		};

		/**
# Tween

## Instantiation

* scrawl.makeTween()

## Purpose

* Defines an animation to be applied to a Scrawl object

Tweens are animations defined by duration (how long they should run for) and distance (how much an attribute needs to change over the course of the tween).

* One tween can change several attributes of an object, and can apply these changes to one or more objects as the tween runs its course.
* Any attribute that holds a Number, or a percentage String (5%), value can be tweened
* The starting point for each attribute tween is set in the __start__ attribute object
* The ending point for each attribute tween is set in the __end__ attribute object
* If an ending point is defined for an attribute, but no starting point, then the tween will use the object's attribute's current value for the starting point.
* Individual _easing engines_ can be defined for each attribute in the __engines__ attribute object.

The objects on which the tween will operate are passed to the tween as an array of objects, in the __targets__ attribute. Strings can also be supplied - the tween factory will search the library for the object; the search is conducted in the following order: entity, spriteanimation, video, cell, element, pad, stack, point, design, force, spring, physics.

* A tween will only run on an object that is not currently being animated by another tween
* A tween cannot be run if it is already running.

The duration of the tween is set in the __duration__ attribute, in milliseconds.

Tweens can hold data for attribute changes to be applied to their object(s) before the tween starts(__onCommence__) and after the tween ends (__onComplete__).

Tweens can be chained by setting the __nextTween__ attribute to the String _name_ attribute of the next tween to be run.

Tweens come with a number of flags and attributes to indicate how many times they should be run before completing:

* Set the __count__ attribute to a positive integer to run the tween that many times. Setting the attribute to _true_ will run the tween forever
* Tween direction can be reversed by setting the __reverse__ flag to _true_
* Setting the __autoReverse__ flag to true will automatically reverse the tween's direction at the end of each run
* Setting __autoReverseAndRun__ reverses the tween's direction and immediately running it again.
* Setting __killOnComplete__ will delete the tween once it has completed.

Tweens can run a callback function on completion by setting the __callback__ attribute to an appropriate (anonymous) function

## Access

* scrawl.animation.TWEENNAME - for the Tween object

## Tween functions

* Start a tween by calling the __run()__ function on it.
* Tween animation can be stopped by calling the __halt()__ function on it.
* A Tween can be deleted by calling the __kill()__ function on it.
* Tweens can be cloned like many other Scrawl objects, using the __clone()__ function

@class Tween
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Tween = function(items) {
			var i, iz, temp;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.targets = (my.isa(items.targets, 'arr')) ? items.targets : ((my.xt(items.targets)) ? [items.targets] : []);
			this.currentTargets = [];
			this.initVals = [];
			this.start = (my.isa(items.start, 'obj')) ? items.start : {};
			this.engines = (my.isa(items.engines, 'obj')) ? items.engines : {};
			this.end = (my.isa(items.end, 'obj')) ? items.end : {};
			this.startTime = Date.now();
			this.currentTime = Date.now();
			this.duration = items.duration || 0;
			this.active = false;
			this.reverse = items.reverse || false;
			this.autoReverse = items.autoReverse || false;
			this.autoReverseAndRun = items.autoReverseAndRun || false;
			this.count = items.count || 0;
			this.currentCount = 0;
			this.onCommence = items.onCommence || {};
			this.onComplete = items.onComplete || {};
			this.nextTween = items.nextTween || '';
			this.killOnComplete = items.killOnComplete || false;
			this.callback = (my.isa(items.callback, 'fn')) ? items.callback : false;
			this.order = items.order || 0;
			for (i = 0, iz = this.targets.length; i < iz; i++) {
				if (my.isa(this.targets[i], 'str')) {
					temp = false;
					if (my.entity[this.targets[i]]) {
						temp = my.entity[this.targets[i]];
					}
					else if (my.spriteanimation && my.spriteanimation[this.targets[i]]) {
						temp = my.spriteanimation[this.targets[i]];
					}
					else if (my.video && my.video[this.targets[i]]) {
						temp = my.video[this.targets[i]];
					}
					else if (my.cell[this.targets[i]]) {
						temp = my.cell[this.targets[i]];
					}
					else if (my.element && my.element[this.targets[i]]) {
						temp = my.element[this.targets[i]];
					}
					else if (my.pad[this.targets[i]]) {
						temp = my.pad[this.targets[i]];
					}
					else if (my.stack && my.stack[this.targets[i]]) {
						temp = my.stack[this.targets[i]];
					}
					else if (my.point && my.point[this.targets[i]]) {
						temp = my.point[this.targets[i]];
					}
					else if (my.design && my.design[this.targets[i]]) {
						temp = my.design[this.targets[i]];
					}
					else if (my.force && my.force[this.targets[i]]) {
						temp = my.force[this.targets[i]];
					}
					else if (my.spring && my.spring[this.targets[i]]) {
						temp = my.spring[this.targets[i]];
					}
					else if (my.physics && my.physics[this.targets[i]]) {
						temp = my.physics[this.targets[i]];
					}
					if (temp) {
						this.targets[i] = temp;
					}
				}
			}
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			return this;
		};
		my.Tween.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Tween'
@final
**/
		my.Tween.prototype.type = 'Tween';
		my.Tween.prototype.classname = 'animationnames';
		my.d.Tween = {
			/**
Array of entitys, cells, etc to be animated using this tween; expects to be passed handles to the entity objects, not SPRITENAME strings
@property targets
@type Array
@default []
**/
			targets: [],
			/**
Array of entitys, cells, etc currently being animated using this tween
@property currentTargets
@type Array
@default []
@private
**/
			currentTargets: [],
			/**
Object containing the start positions (for absolute transitions) or delta values (for relative transitions) for given settable (ie: Number) attributes
@property start
@type Object
@default {}
**/
			start: {},
			/**
Object containing attribute: value pairs determining which easing engine will be applied to each tweened attribute

Currently, Scrawl offers the following easing engines. _Out_ signifies that the end of the tween is faster than the start; _In_ signifies the the end of the tween is slower. (This is the opposite of 'Flash' usage, but in line with wider programming conventions):

* __in__, __easeIn__, __easeIn3__, __easeIn4__, __easeIn5__
* __out__, __easeOut__, __easeOut3__, __easeOut4__, __easeOut5__
* __easeOutIn__, __easeOutIn3__, __easeOutIn4__, __easeOutIn5__
* __linear__ (default) - an even speed throughout the duration of the tween
@property engines
@type Object
@default {}
**/
			engines: {},
			/**
Object containing the end positions for given settable (ie: Number) attributes
@property end
@type Object
@default {}
**/
			end: {},
			/**
Object containing set instructions to be performed at the end of the tween
@property onComplete
@type Object
@default {}
**/
			onComplete: {},
			/**
Object containing runtime initial values for each object being tweened
@property initVals
@type Object
@default {}
@private
**/
			initVals: [],
			/**
Object containing set instructions to be performed at the start of the tween
@property onCommence
@type Object
@default {}
**/
			onCommence: {},
			/**
Datetime when the tween starts running
@property startTime
@type Number - Date.now()
@default 0
@private
**/
			startTime: 0,
			/**
Datetime for the current time
@property currentTime
@type Number - Date.now()
@default 0
@private
**/
			currentTime: 0,
			/**
Duration of the tween, measured in milliseconds
@property duration
@type Number
@default 0
**/
			duration: 0,
			/**
Flag - when true, tween is running
@property active
@type Boolean
@default false
@private
**/
			active: false,
			/**
Flag - when true, tween has been paused (halted)
@property paused
@type Boolean
@default false
@private
**/
			paused: false,
			/**
Flag - when true, tween runs in reverse, from end values to start values (for absolute transitions) or applying negative start values (for relative transitions)
@property reverse
@type Boolean
@default false
**/
			reverse: false,
			/**
Flag - when true, tween will automatically reverse its direction when it completes
@property autoReverse
@type Boolean
@default false
**/
			autoReverse: false,
			/**
Callback function to run when tween completes - will not run if nextTween is set
@property callback
@type Function
@default false
**/
			callback: false,
			/**
Flag - when true, tween will automatically reverse its direction when it completes, and immediately run again
@property autoReverseAndRun
@type Boolean
@default false
**/
			autoReverseAndRun: false,
			/**
Counter for the number of cycles the tween will run; set to true for countinuous repetition
@property count
@type Mixed - Number or Boolean
@default 0
**/
			count: 0,
			/**
Internal attribute
@property currentCount
@type Mixed - Number or Boolean
@default 0
@private
**/
			currentCount: 0,
			/**
Flag - when true, tween will automatically delete itself when it completes
@property killOnComplete
@type Boolean
@default false
**/
			killOnComplete: false,
			/**
TWEENNAME Sring of the tween to be run when this tween completes
@property nextTween
@type String
@default ''
**/
			nextTween: '',
			/**
Lower order animations are run during each frame before higher order ones
@property order
@type Number
@default 0
**/
			order: 0,
		};
		my.mergeInto(my.d.Tween, my.d.Base);
		/**
Set tween values
@method set
@return this
@chainable
**/
		my.Tween.prototype.set = function(items) {
			var i, iz, a;
			my.Base.prototype.set.call(this, items);
			for (i = 0, iz = my.animationnames.length; i < iz; i++) {
				a = my.animation[my.animationnames[i]];
				if (a.type === 'Timeline') {
					if (my.contains(a.actionsList, this.name)) {
						a.resolve();
					}
				}
			}
			return this;
		};
		/**
Tween animation function
@method fn
@return Always true
@private
**/
		my.Tween.prototype.fn = function() {
			var progress,
				entity,
				argSet,
				keys,
				temp,
				measure,
				unit,
				t,
				tz,
				k,
				kz;
			this.currentTime = Date.now();
			progress = (this.currentTime - this.startTime) / this.duration;
			keys = Object.keys(this.end);
			if (this.active) {
				if (progress < 1) {
					for (t = 0, tz = this.currentTargets.length; t < tz; t++) {
						entity = this.currentTargets[t];
						if (my.xt(entity)) {
							argSet = {};
							for (k = 0, kz = keys.length; k < kz; k++) {
								temp = this.initVals[t][keys[k]];
								unit = 0;
								if (my.isa(temp.change, 'str')) {
									measure = temp.change.match(/^-?\d+\.?\d*(\D*)/);
									unit = measure[1];
									if (!my.xt(unit)) {
										unit = '%';
									}
								}
								argSet[keys[k]] = this.engine(
									parseFloat(temp.start),
									parseFloat(temp.change),
									progress,
									this.engines[keys[k]],
									this.reverse);
								argSet[keys[k]] = argSet[keys[k]] + unit;
							}
							entity.set(argSet);
						}
					}
				}
				else {
					//this.halt();
					this.active = false;
					my.removeItem(my.animate, this.name);
					if (this.autoReverse || this.autoReverseAndRun) {
						this.reverse = (this.reverse) ? false : true;
					}
					if (this.autoReverseAndRun) {
						if (my.isa(this.currentCount, 'num')) {
							this.currentCount--;
							if (this.currentCount > 0) {
								this.run();
							}
							else {
								this.runComplete();
							}
						}
						else {
							this.run();
						}
					}
					else if (my.isa(this.count, 'bool') && this.count) {
						this.run();
					}
					else {
						this.runComplete();
					}
				}
			}
			return true;
		};
		/**
Tween engines
@method engine
@return calculated current value for an attribute, which will vary depending on which engine has been selected 
@param {Number} start Start point for tween action
@param {Number} change Total change required for tween action
@param {Number} position Normalized time (time elapsed/duration)
@param {String} engine Calculation engine to be used
@param {Boolean} reverse Reverse flag - true if tween is reversed
@private
**/
		my.Tween.prototype.engine = function(start, change, position, engine, reverse) {
			var temp;
			engine = my.xtGet(engine, 'x');
			if (engine.length < 4) {
				switch (engine) {
					case 'out':
						temp = 1 - position;
						return (start + change) + (Math.cos((position * 90) * my.radian) * -change);
					case 'in':
						return start + (Math.sin((position * 90) * my.radian) * change);
					default:
						return start + (position * change);
				}
			}
			if (engine[4] == 'I') {
				switch (engine) {
					case 'easeIn': //OPPOSITE of Flash easeIn - slow at end, not start
						temp = 1 - position;
						return (start + change) + ((temp * temp) * -change);
					case 'easeIn3':
						temp = 1 - position;
						return (start + change) + ((temp * temp * temp) * -change);
					case 'easeIn4':
						temp = 1 - position;
						return (start + change) + ((temp * temp * temp * temp) * -change);
					case 'easeIn5':
						temp = 1 - position;
						return (start + change) + ((temp * temp * temp * temp * temp) * -change);
					default:
						return start + (position * change);
				}
			}
			if (engine.length > 8) {
				switch (engine) {
					case 'easeOutIn':
						temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position) * change * 2) :
							(start + change) + ((temp * temp) * -change * 2);
					case 'easeOutIn3':
						temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position * position) * change * 4) :
							(start + change) + ((temp * temp * temp) * -change * 4);
					case 'easeOutIn4':
						temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position * position * position) * change * 8) :
							(start + change) + ((temp * temp * temp * temp) * -change * 8);
					case 'easeOutIn5':
						temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position * position * position * position) * change * 16) :
							(start + change) + ((temp * temp * temp * temp * temp) * -change * 16);
					default:
						return start + (position * change);
				}
			}
			switch (engine) {
				case 'easeOut': //OPPOSITE of Flash easeOut - slow at start, not end
					return start + ((position * position) * change);
				case 'easeOut3':
					return start + ((position * position * position) * change);
				case 'easeOut4':
					return start + ((position * position * position * position) * change);
				case 'easeOut5':
					return start + ((position * position * position * position * position) * change);
				default:
					return start + (position * change);
			}
		};
		/**
Run a tween animation
@method run
@return Always true
**/
		my.Tween.prototype.run = function() {
			var test,
				activeTweens,
				tw,
				keys,
				start,
				end,
				percent,
				measure,
				unit,
				temp,
				i,
				iz,
				j,
				jz,
				k,
				kz,
				t,
				tz,
				m,
				mz,
				l,
				lz;
			if (!this.active) {
				activeTweens = [];
				keys = Object.keys(this.end);
				this.currentCount = this.currentCount || this.count;
				this.currentTargets = [];
				this.initVals = [];
				for (l = 0, lz = my.animationnames.length; l < lz; l++) {
					tw = my.animation[my.animationnames[l]];
					if (tw.type === 'Tween' && tw.active && tw.name !== this.name) {
						activeTweens.push(tw);
					}
				}
				for (i = 0, iz = this.targets.length; i < iz; i++) {
					this.currentTargets.push(this.targets[i]);
				}
				if (this.currentTargets.length > 0) {
					for (t = 0, tz = this.currentTargets.length; t < tz; t++) {
						if (my.xt(this.currentTargets[t])) {
							if (this.reverse) {
								this.currentTargets[t].set(this.onComplete);
								this.currentTargets[t].set(this.end);
							}
							else {
								this.currentTargets[t].set(this.onCommence);
								this.currentTargets[t].set(this.start);
							}
							this.initVals.push({});
							for (m = 0, mz = keys.length; m < mz; m++) {
								start = (my.xt(this.start[keys[m]])) ? this.start[keys[m]] : this.currentTargets[t].get([keys[m]]);
								end = this.end[keys[m]];
								temp = parseFloat(end) - parseFloat(start);
								unit = 0;
								if (my.isa(end, 'str')) {
									measure = end.match(/^-?\d+\.?\d*(\D*)/);
									unit = measure[1];
									if (!my.xt(unit)) {
										unit = '%';
									}
								}
								if (this.reverse) {
									temp = -temp;
								}
								this.initVals[t][keys[m]] = {
									start: (this.reverse) ? end : start,
									change: temp + unit,
								};
							}
						}
					}
					this.startTime = Date.now();
					my.pushUnique(my.animate, this.name);
					this.active = true;
					return true;
				}
			}
			return false;
		};
		/**
Finish running a tween
@method runComplete
@return Always true
@private
**/
		my.Tween.prototype.runComplete = function() {
			var t,
				tz;
			for (t = 0, tz = this.currentTargets.length; t < tz; t++) {
				if (my.xt(this.currentTargets[t])) {
					//this.reverse will already have changed state if either of these two are set
					if (this.autoReverse || this.autoReverseAndRun) {
						if (this.reverse) {
							this.currentTargets[t].set(this.end);
							this.currentTargets[t].set(this.onComplete);
						}
						else {
							this.currentTargets[t].set(this.start);
							this.currentTargets[t].set(this.onCommence);
						}
					}
					else {
						if (this.reverse) {
							this.currentTargets[t].set(this.start);
							this.currentTargets[t].set(this.onCommence);
						}
						else {
							this.currentTargets[t].set(this.end);
							this.currentTargets[t].set(this.onComplete);
						}
					}
				}
			}
			if (this.nextTween) {
				if (my.xt(my.animation[this.nextTween])) {
					my.animation[this.nextTween].run();
				}
			}
			else if (this.callback) {
				this.callback();
			}
			if (this.killOnComplete) {
				this.kill();
			}
			return true;
		};
		/**
Stop a tween animation
@method halt
@return this
@chainable
**/
		my.Tween.prototype.halt = function() {
			this.active = false;
			this.paused = true;
			my.removeItem(my.animate, this.name);
			return this;
		};
		/**
Reset a tween animation to its initial conditions
@method reset
@return this
@chainable
**/
		my.Tween.prototype.reset = function() {
			this.active = true;
			this.paused = false;
			this.startTime = Date.now();
			this.currentTime = Date.now();
			this.fn();
			this.active = false;
			return this;
		};
		/**
Complete a tween animation to its final conditions
@method complete
@return this
@chainable
**/
		my.Tween.prototype.complete = function() {
			this.active = true;
			this.paused = false;
			this.startTime = Date.now() - this.duration;
			this.currentTime = Date.now();
			this.fn();
			this.active = false;
			return this;
		};
		/**
Seek to a different time in the Tween

@method seekTo
@param {Number} item - time in ms to move forward or back; negative values move backwards
@return this
@chainable
@private
**/
		my.Tween.prototype.seekTo = function(item) {
			var myActive = this.active,
				myPaused = this.paused;
			if (item && item.toFixed) {
				this.active = true;
				this.paused = false;
				this.startTime = Date.now();
				this.currentTime = Date.now();
				this.startTime -= item;
				this.fn();
				this.paused = myPaused;
				this.active = myActive;
			}
			return this;
		};
		/**
Start the tween running from the point at which it was halted
@method resume
@return this
@chainable
**/
		my.Tween.prototype.resume = function() {
			var t0 = this.currentTime - this.startTime;
			if (this.paused) {
				this.currentTime = Date.now();
				this.startTime = this.currentTime - t0;
				my.pushUnique(my.animate, this.name);
				this.active = true;
				this.paused = false;
			}
			return this;
		};
		/**
Remove this tween from the scrawl library
@method kill
@return Always true
**/
		my.Tween.prototype.kill = function() {
			var t,
				tz;
			if (this.active) {
				for (t = 0, tz = this.currentTargets.length; t < tz; t++) {
					if (my.xt(this.currentTargets[t])) {
						this.currentTargets[t].set(this.onComplete);
					}
				}
			}
			my.removeItem(my.animate, this.name);
			my.removeItem(my.animationnames, this.name);
			delete my.animation[this.name];
			return true;
		};

		/**
# Timeline

## Instantiation

* scrawl.makeTimeline()

## Purpose

* Defines a sequence of functions or tweens to be performed at given moments along a timeline

Note: Timelines need to be defined before Actions can be added to them. Because Timelines, Tweens, Actions and other animations all share the same space in the Scrawl library, they must all be given unique names

## Access

* scrawl.animation.TIMELINENAME - for the Timeline object

## Timeline functions

* Start a Timeline from the beginning by calling the __run()__ function on it.
* Timelines can be stopped by calling the __halt()__ function on it.
* Start a Timeline from the poinht at which it was previously halted by calling the __resume()__ function on it.
* A Timeline can be deleted by calling the __kill()__ function on it.
* Add Actions to the Timeline using the __add()__ function.
* Remove Actions from the Timeline using the __remove()__ function.

@class Timeline
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Timeline = function(items) {
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.duration = my.xtGet(items.duration, 1000);
			this.effectiveDuration = 0;
			this.counter = 0;
			this.startTime = 0;
			this.currentTime = 0;
			this.active = false;
			this.paused = false;
			this.event = my.xtGet(items.event, 100);
			this.lastEvent = 0;
			this.seeking = false;
			this.actionsList = [];
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			return this;
		};
		my.Timeline.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Tween'
@final
**/
		my.Timeline.prototype.type = 'Timeline';
		my.Timeline.prototype.classname = 'animationnames';
		my.d.Timeline = {
			/**
Timeline length, in milliseconds

If no duration is set, Timeline will set the last Action's time as its duration, or alternatively default to 1000 (1 second)
@property duration
@type Number
@default 1000
**/
			duration: 1000,
			/**
Event choke value

A timeline will trigger a __timeupdate__ event on the document object as it runs, with details of the timeline's current state including:

* __name__
* __currentTime__ (milliseconds)

If the event attribute is set to 0, no timeupdate events are fired as the timeline runs. Otherwise, this value represents the frequency at which the event is fired, with a default value of 100 (milliseconds)

Be aware that the timeline may finish before tweens near the end of the timeline complete their action.

@property event
@type Number
@default 1000
**/
			event: 100
		};
		/**
Sort the actions based on their timeValue values
@method sortActions
@return nothing
**/
		my.Timeline.prototype.sortActions = function() {
			this.actionsList.sort(function(a, b) {
				return my.animation[a].timeValue - my.animation[b].timeValue;
			});
		};
		/**
Make a new timeupdate customEvent object
@method makeTimeupdateEvent
@return customEvent object, or null if browser does not support custom events
**/
		my.Timeline.prototype.makeTimeupdateEvent = function() {
			var e = null;
			if (window.CustomEvent) {
				e = new CustomEvent('timeline-updated', {
					detail: {
						name: this.name,
						type: 'Timeline',
						currentTime: this.currentTime - this.startTime
					},
					bubbles: true,
					cancelable: true
				});
			}
			return e;
		};
		/**
Set the timeline duration (for actions with % time strings) or event choke value;
@method set
@param {Object} [items] Key:value Object argument for setting attributes
@return this
**/
		my.Timeline.prototype.set = function(items) {
			var i, iz, a;
			items = my.safeObject(items);
			if (my.isa(items.duration, 'num')) {
				this.duration = items.duration;
				// for (i = 0, iz = this.actionsList.length; i < iz; i++) {
				// 	a = my.animation[this.actionsList[i]];
				// 	if (a.timeUnit === '%') {
				// 		a.timeValue = (parseFloat(a.time) / 100) * this.duration;
				// 	}
				// }
				// this.sortActions();
				// this.effectiveDuration = this.getTimelineDuration();
			}
			if (my.isa(items.event, 'num')) {
				this.event = items.event;
			}
			this.resolve();
			return this;
		};
		/**
add() and remove() helper function
@method resolve
@return always true
@private
**/
		my.Timeline.prototype.resolve = function() {
			var i, iz, a;
			// var i, iz, temp, a;
			// this.sortActions();
			// temp = this.duration;
			// for (i = this.actionsList.length - 1; i >= 0; i--) {
			// 	a = my.animation[this.actionsList[i]];
			// 	if (my.contains(['s', 'ms'], a.timeUnit)) {
			// 		this.duration = a.timeValue;
			// 		break;
			// 	}
			// }
			// this.duration = (temp > this.duration) ? temp : this.duration;
			for (i = 0, iz = this.actionsList.length; i < iz; i++) {
				a = my.animation[this.actionsList[i]];
				if (a.timeUnit === '%') {
					a.timeValue = (parseFloat(a.time) / 100) * this.duration;
				}
			}
			this.sortActions();
			this.effectiveDuration = this.getTimelineDuration();
			return true;
		};
		/**
Add Actions to the timeline - list Actions as one or more arguments to this function; the first argument may be a string, or an array of strings
@method add
@param {String} One or more string arguments
@return this
@chainable
**/
		my.Timeline.prototype.add = function() {
			var i, iz,
				slice = Array.prototype.slice.call(arguments);
			if (my.isa(slice[0], 'arr')) {
				slice = slice[0];
			}
			for (i = 0, iz = slice.length; i < iz; i++) {
				my.pushUnique(this.actionsList, slice[i]);
			}
			this.resolve();
			return this;
		};
		/**
Remove Actions from the timeline - list Actions as one or more arguments to this function; the first argument may be a string, or an array of strings
@method remove
@param {String} One or more string arguments
@return this
@chainable
**/
		my.Timeline.prototype.remove = function() {
			var i, iz,
				slice = Array.prototype.slice.call(arguments);
			if (my.isa(slice[0], 'arr')) {
				slice = slice[0];
			}
			for (i = 0, iz = slice.length; i < iz; i++) {
				my.removeItem(this.actionsList, slice[i]);
			}
			this.resolve();
			return this;
		};
		/**
Start the timeline running from the beginning
@method run
@return this
@chainable
**/
		my.Timeline.prototype.run = function() {
			var i, iz, a, e;
			if (!this.active) {
				this.reset();
				my.pushUnique(my.animate, this.name);
				this.active = true;
				if (this.event) {
					e = this.makeTimeupdateEvent();
					document.dispatchEvent(e);
				}
			}
			return this;
		};
		/**
Start the timeline running from the point at which it was halted
@method resume
@return this
@chainable
**/
		my.Timeline.prototype.resume = function() {
			var t0 = this.currentTime - this.startTime,
				i, iz, a;
			if (this.paused) {
				for (i = 0, iz = this.actionsList.length; i < iz; i++) {
					a = my.animation[this.actionsList[i]];
					if (a.action && a.action.paused) {
						a.action.resume();
					}
				}
				this.currentTime = Date.now();
				this.startTime = this.currentTime - t0;
				my.pushUnique(my.animate, this.name);
				this.paused = false;
				this.active = true;
			}
			return this;
		};
		/**
Function triggered by the animation loop
@method fn
@return nothing
@private
**/
		my.Timeline.prototype.fn = function() {
			var i, iz, a, e;
			this.currentTime = Date.now();
			if (this.counter < this.actionsList.length) {
				for (i = this.counter, iz = this.actionsList.length; i < iz; i++) {
					a = my.animation[this.actionsList[i]];
					if (a.timeValue + this.startTime <= this.currentTime) {
						a.run();
						this.counter++;
						if (this.counter + 1 === this.actionsList.length) {
							this.counter++;
						}
					}
					else {
						this.counter = i;
						break;
					}
				}
			}
			if (this.event && this.currentTime >= this.lastEvent + this.event) {
				e = this.makeTimeupdateEvent();
				document.dispatchEvent(e);
				this.lastEvent = this.currentTime;
			}
			if (this.counter >= this.actionsList.length) {
				this.active = false;
				my.removeItem(my.animate, this.name);
			}
		};
		/**
Stop a Timeline; can be resumed using resume() or started again from the beginning using run()
@method halt
@return this
@chainable
**/
		my.Timeline.prototype.halt = function() {
			var i, iz, a;
			this.active = false;
			this.paused = true;
			for (i = 0, iz = this.actionsList.length; i < iz; i++) {
				a = my.animation[this.actionsList[i]];
				if (a.action && a.action.halt && a.action.active) {
					a.action.halt();
				}
			}
			my.removeItem(my.animate, this.name);
			return this;
		};
		/**
Reset a Timeline animation to its initial conditions
@method reset
@return this
@chainable
**/
		my.Timeline.prototype.reset = function() {
			var i, iz, a;
			this.active = false;
			this.paused = false;
			this.startTime = Date.now();
			this.currentTime = Date.now();
			this.lastEvent = Date.now();
			this.counter = 0;
			for (i = this.actionsList.length - 1, iz = 0; i >= iz; i--) {
				a = my.animation[this.actionsList[i]];
				if (a.action && a.action.reset) {
					a.action.reset();
				}
				if (a.reset) {
					a.reset();
				}
			}
			my.removeItem(my.animate, this.name);
			return this;
		};
		/**
Set the timeline ticker to a new value, and move tweens and action functions to that new time
@method seekTo
@param {Number} [item] time in milliseconds; can aslo accept strings eg '500ms', '1.23s'
@return this
@chainable
**/
		my.Timeline.prototype.seekTo = function(item) {
			var time, msTime, curTime, deltaTime;
			if (!this.seeking) {
				if (item && (item.substring || item.toFixed)) {
					if (this.active) {
						my.removeItem(my.animate, this.name);
					}
					if (!this.startTime) {
						this.startTime = this.currentTime = Date.now();
					}
					time = my.convertTime(item);
					if (time) {
						msTime = time[1];
						curTime = this.currentTime - this.startTime;
						deltaTime = msTime - curTime;
						if (deltaTime) { //no point doing anything if no change is required
							if (deltaTime < 0) {
								this.seekBack(deltaTime);
							}
							else {
								this.seekForward(deltaTime);
							}
						}
					}
					if (this.active) {
						my.pushUnique(my.animate, this.name);
					}
				}
			}
			return this;
		};
		/**
@method seekForward
@param {Number} [item] relative time to move forward, in milliseconds. Must be a positive value!
@return this
@chainable
**/
		my.Timeline.prototype.seekForward = function(item) {
			console.log('seekForward', this.name, item);
			var i, iz, a,
				oldCurrent, newCurrent, actionTimes, actionStart, actionEnd;
			//lock action
			this.seeking = true;
			if (!this.active) {
				this.paused = true;
			}
			if (item.toFixed && item) {
				if (item) {
					oldCurrent = this.currentTime;
					newCurrent = oldCurrent + item;
					for (i = 0, iz = this.actionsList.length; i < iz; i++) {
						a = my.animation[this.actionsList[i]];
						actionTimes = this.getActionTimes(a);
						actionStart = actionTimes[0] + this.startTime;
						actionEnd = actionTimes[1] + this.startTime;
						if (actionStart && actionEnd) {
							if (my.isa(a.action, 'fn')) {
								//raw function action wrapper
								if (my.isBetween(actionStart, oldCurrent, newCurrent, true)) {
									a.action();
								}
							}
							else {
								//tween action wrapper
								if (a.action.type === 'Tween') {
									if (!(actionEnd < oldCurrent || actionStart > newCurrent)) {
										if (!a.action.active) {
											a.action.run();
											a.action.halt();
										}
										a.action.seekTo(item - (actionStart - oldCurrent));
										a.action.fn();
									}
								}
								//timeline action wrapper
								else {
									if (a.skipSeek) {
										if (a.complete) {
											a.complete();
										}
									}
									else {
										if (!(actionEnd < oldCurrent || actionStart > newCurrent)) {
											if (!a.action.active) {
												a.action.run();
												a.action.halt();
											}
											a.action.seekForward(item - (actionStart - oldCurrent));
										}
									}
								}
							}
						}
					}
					this.startTime -= item;
				}
			}
			//unlock action
			this.seeking = false;
			return this;
		};
		/**
@method getActionTimes
@param {Object} [item] - Action object
@return [Number startTime, Number endTime]
@private
**/
		my.Timeline.prototype.getActionTimes = function(item) {
			var result = [null, null],
				actionStart, actionEnd;
			if (item.action) {
				actionStart = item.timeValue;
				if (item.action) {
					if (item.action.type === 'Tween') {
						result = [actionStart, actionStart + item.action.duration];
					}
					else if (item.action.type === 'Timeline') {
						result = [actionStart, this.getTimelineDuration()];
					}
					else {
						result = [actionStart, actionStart];
					}
				}
				else {
					result = [actionStart, actionStart];
				}
			}
			return result;
		};
		/**
@method getTimelineDuration
@return Number
@private
**/
		my.Timeline.prototype.getTimelineDuration = function() {
			var i, iz, a, t,
				d = 0;
			for (i = 0, iz = iz = this.actionsList.length; i < iz; i++) {
				a = my.animation[this.actionsList[i]];
				if (a.action.type === 'Tween') {
					t = a.timeValue + a.action.duration;
					d = (t > d) ? t : d;
				}
				else if (a.action.type === 'Timeline') {
					t = a.timeValue + a.action.getTimelineDuration();
					d = (t > d) ? t : d;
				}
			}
			d = (this.duration > d) ? this.duration : d;
			console.log('getTimelineDuration', this.name, d);
			return d;
		};
		/**
@method seekBack
@param {Number} [item] relative time to move back, in milliseconds. Must be a negative value!
@return this
@chainable
**/
		my.Timeline.prototype.seekBack = function(item) {
			console.log('seekBack', this.name, item);
			var i, iz, a,
				oldCurrent, newCurrent, actionTimes, actionStart, actionEnd;
			//lock action
			this.seeking = true;
			if (!this.active) {
				this.paused = true;
			}
			if (item.toFixed && item) {
				if (item) {
					oldCurrent = this.currentTime;
					newCurrent = oldCurrent + item;
					// for (i = 0, iz = this.actionsList.length; i < iz; i++) {
					for (i = this.actionsList.length - 1; i >= 0; i--) {
						a = my.animation[this.actionsList[i]];
						actionTimes = this.getActionTimes(a);
						actionStart = actionTimes[0] + this.startTime;
						actionEnd = actionTimes[1] + this.startTime;
						if (actionStart && actionEnd) {
							if (my.isa(a.action, 'fn')) {
								//raw function action wrapper
								if (my.isBetween(actionStart, oldCurrent, newCurrent, true)) {
									if (a.rollback) {
										a.rollback();
									}
								}
							}
							else {
								//tween action wrapper
								if (a.action.type === 'Tween') {
									if (!(actionEnd < oldCurrent || actionStart > newCurrent)) {
										if (!a.action.active) {
											a.action.run();
											a.action.halt();
										}
										a.action.seekTo(item - (actionStart - oldCurrent));
										a.action.fn();
									}
								}
								//timeline action wrapper
								else {
									if (a.skipSeek) {
										if (a.rollback) {
											a.rollback();
										}
									}
									else {
										if (!(actionEnd < oldCurrent || actionStart > newCurrent)) {
											if (!a.action.active) {
												a.action.run();
												a.action.halt();
											}
											a.action.seekBack(item - (actionStart - oldCurrent));
										}
									}
								}
							}
						}
					}
					this.startTime -= item;
				}
			}
			//unlock action
			this.seeking = false;
			return this;
		};
		/**
Remove this Timeline from the scrawl library
@method kill
@return Always true
**/
		my.Timeline.prototype.kill = function() {
			my.removeItem(my.animate, this.name);
			my.removeItem(my.animationnames, this.name);
			delete my.animation[this.name];
			return true;
		};

		/**
# Action

## Instantiation

* scrawl.makeAction()

## Purpose

* Defines an action to be performed along a timeline

## Access

* scrawl.animation.ACTIONNAME - for the Action object

## Action functions

* __run()__ - run associated function
* __kill()__ - delete Action

@class Action
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Action = function(items) {
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.time = items.time || 0;
			this.convertTime();
			this.action = my.xtGet(items.action, false);
			this.reset = my.xtGet(items.reset, false);
			this.rollback = my.xtGet(items.rollback, false);
			this.complete = my.xtGet(items.complete, false);
			this.skipSeek = my.xtGet(items.skipSeek, false);
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			return this;
		};
		my.Action.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Action'
@final
**/
		my.Action.prototype.type = 'Action';
		my.Action.prototype.classname = 'animationnames';
		my.d.Action = {
			/**
Keyframe time - may be expressed as a Number (in milliseconds), or as a string:
* '10ms' - ten milliseconds
* '10s' - ten seconds
* '10%' - ten percent along a timeline (relative value)
@property time
@type String (or number)
@default '0ms'
**/
			time: '0ms',
			/**
Keyframe time value, in milliseconds (calculated)
@property timeValue
@type Number
@default 0
**/
			timeValue: 0,
			/**
Keyframe time unit value (calculated)
@property timeUnit
@type String
@default 'ms'
**/
			timeUnit: 'ms',
			/**
Keyframe function to be called
@property action
@type Function
@default false
**/
			action: false,
			/**
Keyframe function to be called - can be used to set initial conditions for objects in the timeline

Only one action object in a timeline should include a reset function

@property reset
@type Function
@default false
**/
			reset: false,
			/**
Keyframe function to be called - can be used to set final conditions for objects in the timeline

Only one action object in a timeline should include a complete function

@property complete
@type Function
@default false
**/
			complete: false,
			/**
Keyframe function to be called - can be used to reverse the action function
@property rollback
@type Function
@default false
**/
			rollback: false,
			/**
Seek functionality flag

In normal mode - false, default - a seek action will cascade through nested timelines. To prevent this, set the attribute to true; any action reset (seekBack) and complete (seekForward) functions will still be triggered

@property skipSeek
@type Boolean
@default false
**/
			skipSeek: false
		};
		/**
Convert a time into its component properties
@method convertTime
@return always true
@private
**/
		my.Action.prototype.convertTime = function() {
			var res = my.convertTime(this.time);
			if (res) {
				this.timeUnit = res[0] || 'ms';
				this.timeValue = res[1] || 0;
			}
			else {
				this.timeUnit = 'ms';
				this.timeValue = 0;
			}
			return true;
		};
		/**
Invoke the associated function
@method run
@return always true
**/
		my.Action.prototype.run = function() {
			var a = ['Tween', 'Timeline', 'Animation'];
			if (my.xt(this.action)) {
				if (my.contains(a, this.action.type)) {
					this.action.run();
				}
				else {
					this.action();
				}
				return true;
			}
			return false;
		};
		/**
Remove this Action from the scrawl library
@method kill
@return Always true
**/
		my.Action.prototype.kill = function() {
			my.removeItem(my.animationnames, this.name);
			delete my.animation[this.name];
			return true;
		};

		return my;
	}(scrawl));
}
