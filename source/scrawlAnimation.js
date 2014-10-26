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
	my.mergeInto(my.d.Sprite, my.d.Position);
	if (my.xt(my.d.Block)) {
		my.mergeInto(my.d.Block, my.d.Sprite);
	}
	if (my.xt(my.d.Shape)) {
		my.mergeInto(my.d.Shape, my.d.Sprite);
	}
	if (my.xt(my.d.Wheel)) {
		my.mergeInto(my.d.Wheel, my.d.Sprite);
	}
	if (my.xt(my.d.Picture)) {
		my.mergeInto(my.d.Picture, my.d.Sprite);
	}
	if (my.xt(my.d.Phrase)) {
		my.mergeInto(my.d.Phrase, my.d.Sprite);
	}
	if (my.xt(my.d.Path)) {
		my.mergeInto(my.d.Path, my.d.Sprite);
	}
	/**
Position constructor hook function

Adds a __delta__ (deltaX, deltaY) Vector to the object, used to give an object a 'velocity'

@method animationPositionInit
@private
**/
	my.Position.prototype.animationPositionInit = function(items) {
		var temp = my.safeObject(items.delta);
		this.delta = my.newVector({
			x: my.xtGet([items.deltaX, temp.x, 0]),
			y: my.xtGet([items.deltaY, temp.y, 0]),
		});
		this.work.delta = my.newVector({
			name: this.type + '.' + this.name + '.work.delta'
		});
		this.pathSpeedConstant = my.xtGet([items.pathSpeedConstant, my.d[this.type].pathSpeedConstant]);
		this.deltaPathPlace = my.xtGet([items.deltaPathPlace, my.d[this.type].deltaPathPlace]);
	};
	/**
Position.get hook function - modified by animation module
@method animationPositionGet
@private
**/
	my.Position.prototype.animationPositionGet = function(item) {
		if (my.contains(['deltaX', 'deltaY'], item)) {
			switch (item) {
				case 'deltaX':
					return this.delta.x;
				case 'deltaY':
					return this.delta.y;
			}
		}
		if ('delta' === item) {
			console.log(this.name, 'get delta vector');
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
		if (!my.isa(this.delta, 'vector')) {
			this.delta = my.newVector(items.delta || this.delta);
		}
		if (my.xto([items.deltaX, items.deltaY])) {
			this.delta.x = my.xtGet([items.deltaX, this.delta.x]);
			this.delta.y = my.xtGet([items.deltaY, this.delta.y]);
		}
	};
	/**
Position.setDelta hook function - modified by animation module
@method animationPositionClone
@private
**/
	my.Position.prototype.animationPositionClone = function(a, items) {
		var temp = my.safeObject(items.delta);
		a.delta = my.newVector({
			x: my.xtGet([items.deltaX, temp.x, a.delta.x]),
			y: my.xtGet([items.deltaY, temp.y, a.delta.y]),
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
		if (my.isa(obj, 'obj')) {
			var temp = this[item] || this.get(item);
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
		var temp;
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
	my.d.Cell.sourceDelta = {
		x: 0,
		y: 0,
		z: 0
	};
	my.d.Cell.sourceMinWidth = 0;
	my.d.Cell.sourceMaxWidth = 0;
	my.d.Cell.sourceMinHeight = 0;
	my.d.Cell.sourceMaxHeight = 0;
	/**
Cell constructor hook function

Adds a __sourceDelta__ (sourceDeltaX, sourceDeltaY) Vector to the cell, used to give it a 'velocity'

@method animationCellInit
@private
**/
	my.Cell.prototype.animationCellInit = function(items) {
		var temp = my.safeObject(items.sourceDelta);
		this.sourceDelta = my.newVector({
			x: my.xtGet([items.sourceDeltaX, temp.x, 0]),
			y: my.xtGet([items.sourceDeltaY, temp.y, 0]),
		});
		this.work.sourceDelta = my.newVector();
	};
	/**
Cell.get hook function - modified by animation module
@method animationCellGet
@private
**/
	my.Cell.prototype.animationCellGet = function(item) {
		if (my.contains(['sourceDeltaX', 'sourceDeltaY'], item)) {
			switch (item) {
				case 'sourceDeltaX':
					return this.sourceDelta.x;
				case 'sourceDeltaY':
					return this.sourceDelta.y;
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
		if (my.xto([items.sourceDelta, items.sourceDeltaX, items.sourceDeltaY])) {
			temp = my.safeObject(items.sourceDelta);
			this.sourceDelta.x = my.xtGet([items.sourceDeltaX, temp.x, this.sourceDelta.x]);
			this.sourceDelta.y = my.xtGet([items.sourceDeltaY, temp.y, this.sourceDelta.y]);
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
				this.source.x = (my.isa(this.source.x, 'num')) ? this.source.x + this.sourceDelta.x : my.addPercentages(this.source.x, this.sourceDelta.x || 0);
				break;
			case 'y':
				this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + this.delta.y : my.addPercentages(this.start.y, this.delta.y || 0);
				this.source.y = (my.isa(this.source.y, 'num')) ? this.source.y + this.sourceDelta.y : my.addPercentages(this.source.y, this.sourceDelta.y || 0);
				break;
			case 'start':
			case 'target':
				this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + this.delta.x : my.addPercentages(this.start.x, this.delta.x || 0);
				this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + this.delta.y : my.addPercentages(this.start.y, this.delta.y || 0);
				break;
			case 'source':
				this.source.x = (my.isa(this.source.x, 'num')) ? this.source.x + this.sourceDelta.x : my.addPercentages(this.source.x, this.sourceDelta.x || 0);
				this.source.y = (my.isa(this.source.y, 'num')) ? this.source.y + this.sourceDelta.y : my.addPercentages(this.source.y, this.sourceDelta.y || 0);
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
				this.source.x = (my.isa(this.source.x, 'num')) ? this.source.x + this.sourceDelta.x : my.addPercentages(this.source.x, this.sourceDelta.x || 0);
				this.source.y = (my.isa(this.source.y, 'num')) ? this.source.y + this.sourceDelta.y : my.addPercentages(this.source.y, this.sourceDelta.y || 0);
		}
		this.setSource();
		this.setTarget();
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
				this.source.x = (my.isa(this.source.x, 'num')) ? this.source.x - this.sourceDelta.x : this.subtractPercentages(this.source.x, this.sourceDelta.x || 0);
				break;
			case 'y':
				this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y - this.delta.y : this.subtractPercentages(this.start.y, this.delta.y || 0);
				this.source.y = (my.isa(this.source.y, 'num')) ? this.source.y - this.sourceDelta.y : this.subtractPercentages(this.source.y, this.sourceDelta.y || 0);
				break;
			case 'start':
			case 'target':
				this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x - this.delta.x : this.subtractPercentages(this.start.x, this.delta.x || 0);
				this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y - this.delta.y : this.subtractPercentages(this.start.y, this.delta.y || 0);
				break;
			case 'source':
				this.source.x = (my.isa(this.source.x, 'num')) ? this.source.x - this.sourceDelta.x : this.subtractPercentages(this.source.x, this.sourceDelta.x || 0);
				this.source.y = (my.isa(this.source.y, 'num')) ? this.source.y - this.sourceDelta.y : this.subtractPercentages(this.source.y, this.sourceDelta.y || 0);
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
				this.source.x = (my.isa(this.source.x, 'num')) ? this.source.x - this.sourceDelta.x : this.subtractPercentages(this.source.x, this.sourceDelta.x || 0);
				this.source.y = (my.isa(this.source.y, 'num')) ? this.source.y - this.sourceDelta.y : this.subtractPercentages(this.source.y, this.sourceDelta.y || 0);
		}
		this.setSource();
		this.setTarget();
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
		if (my.isa(item, 'num')) {
			var sWidth = this.sourceWidth,
				sHeight = this.sourceHeight,
				aWidth = this.actualWidth,
				aHeight = this.actualHeight,
				minWidth = my.xtGet([this.sourceMinWidth, this.sourceWidth]),
				minHeight = my.xtGet([this.sourceMinHeight, this.sourceHeight]),
				maxWidth = my.xtGet([this.sourceMaxWidth, this.sourceWidth]),
				maxHeight = my.xtGet([this.sourceMaxHeight, this.sourceHeight]),
				sx = this.source.x,
				sy = this.source.y,
				myW = sWidth + item,
				myH = sHeight + item,
				myX,
				myY;
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
				this.source.x = sx;
				this.source.y = sy;
				this.sourceWidth = sWidth;
				this.sourceHeight = sHeight;
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
		items = my.safeObject(items);
		if (my.contains(['horizontal', 'vertical', 'top', 'bottom', 'left', 'right'], items.edge)) {
			var myStrip,
				myRemains,
				myEdge,
				myShift = my.xtGet([items.shiftSource, false]),
				height = this.actualHeight,
				width = this.actualWidth,
				ctx = my.context[this.name],
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
					myStrip = my.xtGet([items.strip, 20]);
					myRemains = height - myStrip;
					myEdge = items.edge;
					break;
				case 'left':
				case 'right':
					myStrip = my.xtGet([items.strip, 20]);
					myRemains = width - myStrip;
					myEdge = items.edge;
					break;
			}
			switch (myEdge) {
				case 'top':
					my.cvx.drawImage(c, 0, 0, width, myStrip, 0, myRemains, width, myStrip);
					my.cvx.drawImage(c, 0, myStrip, width, myRemains, 0, 0, width, myRemains);
					this.source.y -= (myShift) ? myStrip : 0;
					break;
				case 'bottom':
					my.cvx.drawImage(c, 0, 0, width, myRemains, 0, myStrip, width, myRemains);
					my.cvx.drawImage(c, 0, myRemains, width, myStrip, 0, 0, width, myStrip);
					this.source.y += (myShift) ? myStrip : 0;
					break;
				case 'left':
					my.cvx.drawImage(c, 0, 0, myStrip, height, myRemains, 0, myStrip, height);
					my.cvx.drawImage(c, myStrip, 0, myRemains, height, 0, 0, myRemains, height);
					this.source.x -= (myShift) ? myStrip : 0;
					break;
				case 'right':
					my.cvx.drawImage(c, 0, 0, myRemains, height, myStrip, 0, myRemains, height);
					my.cvx.drawImage(c, myRemains, 0, myStrip, height, 0, 0, myStrip, height);
					this.source.x += (myShift) ? myStrip : 0;
					break;
			}
			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(my.cv, 0, 0, width, height);
			if (myShift) {
				this.setSource();
			}
		}
		return this;
	};
	/**
Ask all sprites in the Group to perform an updateStart() operation

Each sprite will add their delta values to their start Vector, and/or add deltaPathPlace from pathPlace
@method Group.updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	my.Group.prototype.updateStart = function(item) {
		for (var i = 0, z = this.sprites.length; i < z; i++) {
			my.sprite[this.sprites[i]].updateStart(item);
		}
		return this;
	};
	/**
Ask all sprites in the Group to perform a revertStart() operation

Each sprite will subtract their delta values to their start Vector, and/or subtract deltaPathPlace from pathPlace
@method Group.revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	my.Group.prototype.revertStart = function(item) {
		for (var i = 0, z = this.sprites.length; i < z; i++) {
			my.sprite[this.sprites[i]].revertStart(item);
		}
		return this;
	};
	/**
Ask all sprites in the group to perform a reverse() operation

Each sprite will change the sign (+/-) of specified attribute values
@method Group.reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
	my.Group.prototype.reverse = function(item) {
		for (var i = 0, z = this.sprites.length; i < z; i++) {
			my.sprite[this.sprites[i]].reverse(item);
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
@param {String} [sprite] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
**/
	my.Design.prototype.update = function(sprite, cell) {
		this.makeGradient(sprite, cell);
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
		var color = this.get('color'),
			shift = this.get('shift');
		for (var i = 0, z = color.length; i < z; i++) {
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
		this.set({
			color: color,
		});
	};
	/**
A __factory__ function to generate new Animation objects
@method newAnimation
@param {Object} items Key:value Object argument for setting attributes
@return Animation object
**/
	my.newAnimation = function(items) {
		return new my.Animation(items);
	};
	/**
A __factory__ function to generate new Tween objects
@method newTween
@param {Object} items Key:value Object argument for setting attributes
@return Tween object
**/
	my.newTween = function(items) {
		return new my.Tween(items);
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
		if (my.orderAnimations) {
			my.sortAnimations();
		}
		for (var i = 0, iz = my.animate.length; i < iz; i++) {
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

* scrawl.newAnimation()

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
		my.Base.call(this, items);
		items = my.safeObject(items);
		var delay = (my.isa(items.delay, 'bool')) ? items.delay : false;
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

* scrawl.newTween()

## Purpose

* Defines an animation to be applied to a Scrawl object

Tweens are animations defined by duration (how long they should run for) and distance (how much an attribute needs to change over the course of the tween).

* One tween can change several attributes of an object, and can apply these changes to one or more objects as the tween runs its course.
* Any attribute that holds a Number, or a percentage String (5%), value can be tweened
* The starting point for each attribute tween is set in the __start__ attribute object
* The ending point for each attribute tween is set in the __end__ attribute object
* If an ending point is defined for an attribute, but no starting point, then the tween will use the object's attribute's current value for the starting point.
* Individual _easing engines_ can be defined for each attribute in the __engines__ attribute object.

The objects on which the tween will operate are passed to the tween as an array of objects, in the __targets__ attribute

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
		my.Base.call(this, items);
		items = my.safeObject(items);
		this.targets = (my.isa(items.targets, 'arr')) ? items.targets : ((my.xt(items.targets)) ? [items.targets] : []);
		this.currentTargets = [];
		this.initVals = [];
		this.start = (my.isa(items.start, 'obj')) ? items.start : {};
		this.engines = (my.isa(items.engines, 'obj')) ? items.engines : {};
		this.end = (my.isa(items.end, 'obj')) ? items.end : {};
		this.startTime = Date.now();
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
Array of sprites, cells, etc to be animated using this tween; expects to be passed handles to the sprite objects, not SPRITENAME strings
@property targets
@type Array
@default []
**/
		targets: [],
		/**
Array of sprites, cells, etc currently being animated using this tween
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
Tween animation function
@method fn
@return Always true
@private
**/
	my.Tween.prototype.fn = function() {
		var currentTime = Date.now(),
			progress = (currentTime - this.startTime) / this.duration,
			sprite,
			argSet,
			keys = Object.keys(this.end),
			temp,
			percent;
		if (this.active) {
			if (progress < 1) {
				for (var t = 0, tz = this.currentTargets.length; t < tz; t++) {
					sprite = this.currentTargets[t];
					if (my.xt(sprite)) {
						argSet = {};
						for (var k = 0, kz = keys.length; k < kz; k++) {
							temp = this.initVals[t][keys[k]];
							percent = (my.isa(temp.start, 'str') || my.isa(temp.change, 'str')) ? true : false;
							argSet[keys[k]] = this.engine(
								parseFloat(temp.start),
								parseFloat(temp.change),
								progress,
								this.engines[keys[k]],
								this.reverse);
							argSet[keys[k]] = (percent) ? argSet[keys[k]] + '%' : argSet[keys[k]];
						}
						sprite.set(argSet);
					}
				}
			}
			else {
				this.halt();
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
		switch (engine) {
			case 'easeOut': //OPPOSITE of Flash easeOut - slow at start, not end
				return start + ((position * position) * change);
			case 'easeIn': //OPPOSITE of Flash easeIn - slow at end, not start
				temp = 1 - position;
				return (start + change) + ((temp * temp) * -change);
			case 'easeOut3':
				return start + ((position * position * position) * change);
			case 'easeIn3':
				temp = 1 - position;
				return (start + change) + ((temp * temp * temp) * -change);
			case 'easeOut4':
				return start + ((position * position * position * position) * change);
			case 'easeIn4':
				temp = 1 - position;
				return (start + change) + ((temp * temp * temp * temp) * -change);
			case 'easeOut5':
				return start + ((position * position * position * position * position) * change);
			case 'easeIn5':
				temp = 1 - position;
				return (start + change) + ((temp * temp * temp * temp * temp) * -change);
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
			case 'out':
				temp = 1 - position;
				return (start + change) + (Math.cos((position * 90) * my.radian) * -change);
			case 'in':
				return start + (Math.sin((position * 90) * my.radian) * change);
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
			temp,
			func = my.subtractPercentages;
		if (!this.active) {
			activeTweens = [];
			keys = Object.keys(this.end);
			this.currentCount = this.currentCount || this.count;
			this.currentTargets = [];
			this.initVals = [];
			for (var l = 0, lz = my.animationnames.length; l < lz; l++) {
				tw = my.animation[my.animationnames[l]];
				if (tw.type === 'Tween' && tw.active && tw.name !== this.name) {
					activeTweens.push(tw);
				}
			}
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				test = true;
				for (var j = 0, jz = activeTweens.length; j < jz; j++) {
					for (var k = 0, kz = activeTweens[j].currentTargets.length; k < kz; k++) {
						if (this.targets[i].name === activeTweens[j].currentTargets[k].name) {
							test = false;
							break;
						}
					}
					if (!test) {
						break;
					}
				}
				if (test) {
					this.currentTargets.push(this.targets[i]);
				}
			}
			if (this.currentTargets.length > 0) {
				for (var t = 0, tz = this.currentTargets.length; t < tz; t++) {
					if (my.xt(this.currentTargets[t])) {
						this.currentTargets[t].set(this.onCommence);
						this.initVals.push({});
						for (var m = 0, mz = keys.length; m < mz; m++) {
							start = (my.xt(this.start[keys[m]])) ? this.start[keys[m]] : this.currentTargets[t].get([keys[m]]);
							end = this.end[keys[m]];
							percent = (my.isa(start, 'str') || my.isa(end, 'str')) ? true : false;
							temp = (percent) ? func(end, start) : end - start;
							if (this.reverse) {
								temp = (percent) ? -parseFloat(temp) + '%' : -temp;
							}
							this.initVals[t][keys[m]] = {
								start: (this.reverse) ? end : start,
								change: temp,
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
		for (var t = 0, tz = this.currentTargets.length; t < tz; t++) {
			if (my.xt(this.currentTargets[t])) {
				this.currentTargets[t].set(this.onComplete);
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
@return Always true
**/
	my.Tween.prototype.halt = function() {
		this.active = false;
		my.removeItem(my.animate, this.name);
		return true;
	};
	/**
Remove this tween from the scrawl library
@method kill
@return Always true
**/
	my.Tween.prototype.kill = function() {
		if (this.active) {
			for (var t = 0, tz = this.currentTargets.length; t < tz; t++) {
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

	return my;
}(scrawl));
