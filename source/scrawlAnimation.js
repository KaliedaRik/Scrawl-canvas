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
if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'animation')) {
	var scrawl = (function(my, S) {
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
Position constructor hook function

Adds a __delta__ (deltaX, deltaY) Vector to the object, used to give an object a 'velocity'

@method animationPositionInit
@private
**/
		S.Position_animationPositionInit_temp = null; //raw object
		my.Position.prototype.animationPositionInit = function(items) {
			S.Position_animationPositionInit_temp = my.safeObject(items.delta);
			this.delta = my.newVector({
				x: my.xtGet(items.deltaX, S.Position_animationPositionInit_temp.x, 0),
				y: my.xtGet(items.deltaY, S.Position_animationPositionInit_temp.y, 0),
			});
			this.work.delta = my.newVector({
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
		S.stat_positionAnimationPositionGet = ['deltaX', 'deltaY'];
		my.Position.prototype.animationPositionGet = function(item) {
			if (my.contains(S.stat_positionAnimationPositionGet, item)) {
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
		S.Position_setDeltaAttribute_temp = null; //raw object
		my.Position.prototype.setDeltaAttribute = function(items) {
			items = my.safeObject(items);
			if (!my.isa(this.delta, 'vector')) {
				this.delta = my.newVector(items.delta || this.delta);
			}
			S.Position_setDeltaAttribute_temp = my.safeObject(items.delta);
			this.delta.x = my.xtGet(items.deltaX, S.Position_setDeltaAttribute_temp.x, this.delta.x);
			this.delta.y = my.xtGet(items.deltaY, S.Position_setDeltaAttribute_temp.y, this.delta.y);
			return this;
		};
		/**
Position.clone hook function - modified by animation module
@method animationPositionClone
@private
**/
		S.Position_animationPositionClone_temp = null; //raw object
		my.Position.prototype.animationPositionClone = function(a, items) {
			S.Position_animationPositionClone_temp = my.safeObject(items.delta);
			a.delta = my.newVector({
				x: my.xtGet(items.deltaX, S.Position_animationPositionClone_temp.x, a.delta.x),
				y: my.xtGet(items.deltaY, S.Position_animationPositionClone_temp.y, a.delta.y),
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
		S.Position_exchange_temp = '';
		my.Position.prototype.exchange = function(obj, item) {
			if (my.isa(obj, 'obj')) {
				S.Position_exchange_temp = this[item] || this.get(item);
				this[item] = obj[item] || obj.get(item);
				obj[item] = S.Position_exchange_temp;
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
			z: 0
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
		S.Cell_animationCellInit_temp = null; //raw object
		my.Cell.prototype.animationCellInit = function(items) {
			S.Cell_animationCellInit_temp = my.safeObject(items.copyDelta);
			this.copyDelta = my.newVector({
				x: my.xtGet(items.copyDeltaX, S.Cell_animationCellInit_temp.x, 0),
				y: my.xtGet(items.copyDeltaY, S.Cell_animationCellInit_temp.y, 0),
			});
			this.work.copyDelta = my.newVector();
		};
		/**
Cell.get hook function - modified by animation module
@method animationCellGet
@private
**/
		S.stat_cellAnimationCellGet = ['copyDeltaX', 'copyDeltaY'];
		my.Cell.prototype.animationCellGet = function(item) {
			if (my.contains(S.stat_cellAnimationCellGet, item)) {
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
		S.Cell_animationCellSet_temp = null; //raw object
		my.Cell.prototype.animationCellSet = function(items) {
			if (my.xto(items.copyDelta, items.copyDeltaX, items.copyDeltaY)) {
				S.Cell_animationCellSet_temp = my.safeObject(items.copyDelta);
				this.copyDelta.x = my.xtGet(items.copyDeltaX, S.Cell_animationCellSet_temp.x, this.copyDelta.x);
				this.copyDelta.y = my.xtGet(items.copyDeltaY, S.Cell_animationCellSet_temp.y, this.copyDelta.y);
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
		S.Cell_zoom_sWidth = 0;
		S.Cell_zoom_sHeight = 0;
		S.Cell_zoom_aWidth = 0;
		S.Cell_zoom_aHeight = 0;
		S.Cell_zoom_minWidth = 0;
		S.Cell_zoom_minHeight = 0;
		S.Cell_zoom_maxWidth = 0;
		S.Cell_zoom_maxHeight = 0;
		S.Cell_zoom_sx = 0;
		S.Cell_zoom_sy = 0;
		S.Cell_zoom_myW = 0;
		S.Cell_zoom_myH = 0;
		S.Cell_zoom_myX = 0;
		S.Cell_zoom_myY = 0;
		my.Cell.prototype.zoom = function(item) {
			if (my.isa(item, 'num')) {
				S.Cell_zoom_sWidth = this.copyWidth;
				S.Cell_zoom_sHeight = this.copyHeight;
				S.Cell_zoom_aWidth = this.actualWidth;
				S.Cell_zoom_aHeight = this.actualHeight;
				S.Cell_zoom_minWidth = my.xtGet(this.copyMinWidth, this.copyWidth);
				S.Cell_zoom_minHeight = my.xtGet(this.copyMinHeight, this.copyHeight);
				S.Cell_zoom_maxWidth = my.xtGet(this.copyMaxWidth, this.copyWidth);
				S.Cell_zoom_maxHeight = my.xtGet(this.copyMaxHeight, this.copyHeight);
				S.Cell_zoom_sx = this.copy.x;
				S.Cell_zoom_sy = this.copy.y;
				S.Cell_zoom_myW = sWidth + item;
				S.Cell_zoom_myH = sHeight + item;
				if (my.isBetween(S.Cell_zoom_myW, S.Cell_zoom_minWidth, S.Cell_zoom_maxWidth, true) && my.isBetween(S.Cell_zoom_myH, S.Cell_zoom_minHeight, S.Cell_zoom_maxHeight, true)) {
					S.Cell_zoom_sWidth = S.Cell_zoom_myW;
					S.Cell_zoom_myX = S.Cell_zoom_sx - (item / 2);
					if (S.Cell_zoom_myX < 0) {
						S.Cell_zoom_sx = 0;
					}
					else if (S.Cell_zoom_myX > (S.Cell_zoom_aWidth - S.Cell_zoom_sWidth)) {
						sx = S.Cell_zoom_aWidth - S.Cell_zoom_sWidth;
					}
					else {
						S.Cell_zoom_sx = S.Cell_zoom_myX;
					}
					S.Cell_zoom_sHeight = S.Cell_zoom_myH;
					S.Cell_zoom_myY = S.Cell_zoom_sy - (item / 2);
					if (S.Cell_zoom_myY < 0) {
						S.Cell_zoom_sy = 0;
					}
					else if (S.Cell_zoom_myY > (S.Cell_zoom_aHeight - S.Cell_zoom_sHeight)) {
						S.Cell_zoom_sy = S.Cell_zoom_aHeight - S.Cell_zoom_sHeight;
					}
					else {
						S.Cell_zoom_sy = S.Cell_zoom_myY;
					}
					this.copy.x = S.Cell_zoom_sx;
					this.copy.y = S.Cell_zoom_sy;
					this.copyWidth = S.Cell_zoom_sWidth;
					this.copyHeight = S.Cell_zoom_sHeight;
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
		S.stat_cellSpliceCell = ['horizontal', 'vertical', 'top', 'bottom', 'left', 'right'];
		S.Cell_spliceCell_myStrip = 0;
		S.Cell_spliceCell_myRemains = 0;
		S.Cell_spliceCell_myEdge = '';
		S.Cell_spliceCell_myShift = false;
		S.Cell_spliceCell_height = 0;
		S.Cell_spliceCell_width = 0;
		S.Cell_spliceCell_ctx = null; //DOM canvas cojntext object
		S.Cell_spliceCell_c = null; //DOM canvas object
		my.Cell.prototype.spliceCell = function(items) {
			items = my.safeObject(items);
			if (my.contains(S.stat_cellSpliceCell, items.edge)) {
				S.Cell_spliceCell_myShift = my.xtGet(items.shiftCopy, false);
				S.Cell_spliceCell_height = this.actualHeight;
				S.Cell_spliceCell_width = this.actualWidth;
				S.Cell_spliceCell_ctx = my.context[this.name];
				S.Cell_spliceCell_c = my.canvas[this.name];
				my.cv.width = S.Cell_spliceCell_width;
				my.cv.height = S.Cell_spliceCell_height;
				S.Cell_spliceCell_ctx.setTransform(1, 0, 0, 1, 0, 0);
				switch (items.edge) {
					case 'horizontal':
						S.Cell_spliceCell_myRemains = S.Cell_spliceCell_width / 2;
						S.Cell_spliceCell_myStrip = S.Cell_spliceCell_myRemains;
						S.Cell_spliceCell_myEdge = 'left';
						break;
					case 'vertical':
						S.Cell_spliceCell_myRemains = S.Cell_spliceCell_height / 2;
						S.Cell_spliceCell_myStrip = S.Cell_spliceCell_myRemains;
						S.Cell_spliceCell_myEdge = 'top';
						break;
					case 'top':
					case 'bottom':
						S.Cell_spliceCell_myStrip = my.xtGet(items.strip, 20);
						S.Cell_spliceCell_myRemains = S.Cell_spliceCell_height - S.Cell_spliceCell_myStrip;
						S.Cell_spliceCell_myEdge = items.edge;
						break;
					case 'left':
					case 'right':
						S.Cell_spliceCell_myStrip = my.xtGet(items.strip, 20);
						S.Cell_spliceCell_myRemains = S.Cell_spliceCell_width - S.Cell_spliceCell_myStrip;
						S.Cell_spliceCell_myEdge = items.edge;
						break;
				}
				switch (S.Cell_spliceCell_myEdge) {
					case 'top':
						my.cvx.drawImage(S.Cell_spliceCell_c, 0, 0, S.Cell_spliceCell_width, S.Cell_spliceCell_myStrip, 0, S.Cell_spliceCell_myRemains, S.Cell_spliceCell_width, S.Cell_spliceCell_myStrip);
						my.cvx.drawImage(S.Cell_spliceCell_c, 0, S.Cell_spliceCell_myStrip, S.Cell_spliceCell_width, S.Cell_spliceCell_myRemains, 0, 0, S.Cell_spliceCell_width, S.Cell_spliceCell_myRemains);
						this.copy.y -= (S.Cell_spliceCell_myShift) ? S.Cell_spliceCell_myStrip : 0;
						break;
					case 'bottom':
						my.cvx.drawImage(S.Cell_spliceCell_c, 0, 0, S.Cell_spliceCell_width, S.Cell_spliceCell_myRemains, 0, S.Cell_spliceCell_myStrip, S.Cell_spliceCell_width, S.Cell_spliceCell_myRemains);
						my.cvx.drawImage(S.Cell_spliceCell_c, 0, S.Cell_spliceCell_myRemains, S.Cell_spliceCell_width, S.Cell_spliceCell_myStrip, 0, 0, S.Cell_spliceCell_width, S.Cell_spliceCell_myStrip);
						this.copy.y += (S.Cell_spliceCell_myShift) ? S.Cell_spliceCell_myStrip : 0;
						break;
					case 'left':
						my.cvx.drawImage(S.Cell_spliceCell_c, 0, 0, S.Cell_spliceCell_myStrip, S.Cell_spliceCell_height, S.Cell_spliceCell_myRemains, 0, S.Cell_spliceCell_myStrip, S.Cell_spliceCell_height);
						my.cvx.drawImage(S.Cell_spliceCell_c, S.Cell_spliceCell_myStrip, 0, S.Cell_spliceCell_myRemains, S.Cell_spliceCell_height, 0, 0, S.Cell_spliceCell_myRemains, S.Cell_spliceCell_height);
						this.copy.x -= (S.Cell_spliceCell_myShift) ? S.Cell_spliceCell_myStrip : 0;
						break;
					case 'right':
						my.cvx.drawImage(S.Cell_spliceCell_c, 0, 0, S.Cell_spliceCell_myRemains, S.Cell_spliceCell_height, S.Cell_spliceCell_myStrip, 0, S.Cell_spliceCell_myRemains, S.Cell_spliceCell_height);
						my.cvx.drawImage(S.Cell_spliceCell_c, S.Cell_spliceCell_myRemains, 0, S.Cell_spliceCell_myStrip, S.Cell_spliceCell_height, 0, 0, S.Cell_spliceCell_myStrip, S.Cell_spliceCell_height);
						this.copy.x += (S.Cell_spliceCell_myShift) ? S.Cell_spliceCell_myStrip : 0;
						break;
				}
				S.Cell_spliceCell_ctx.clearRect(0, 0, S.Cell_spliceCell_width, S.Cell_spliceCell_height);
				S.Cell_spliceCell_ctx.drawImage(my.cv, 0, 0, S.Cell_spliceCell_width, S.Cell_spliceCell_height);
				if (S.Cell_spliceCell_myShift) {
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
		S.Group_updateStart_i = 0;
		S.Group_updateStart_iz = 0;
		my.Group.prototype.updateStart = function(item) {
			for (S.Group_updateStart_i = 0, S.Group_updateStart_iz = this.entitys.length; S.Group_updateStart_i < S.Group_updateStart_iz; S.Group_updateStart_i++) {
				my.entity[this.entitys[S.Group_updateStart_i]].updateStart(item);
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
		S.Group_revertStart_i = 0;
		S.Group_revertStart_iz = 0;
		my.Group.prototype.revertStart = function(item) {
			for (S.Group_revertStart_i = 0, S.Group_revertStart_iz = this.entitys.length; S.Group_revertStart_i < S.Group_revertStart_iz; S.Group_revertStart_i++) {
				my.entity[this.entitys[S.Group_revertStart_i]].revertStart(item);
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
		S.Group_reverse_i = 0;
		S.Group_reverse_iz = 0;
		my.Group.prototype.reverse = function(item) {
			for (S.Group_reverse_i = 0, S.Group_reverse_iz = this.entitys.length; S.Group_reverse_i < S.Group_reverse_iz; S.Group_reverse_i++) {
				my.entity[this.entitys[S.Group_reverse_i]].reverse(item);
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
		S.Design_sortStops_color = null; //raw object
		S.Design_sortStops_shift = 0;
		S.Design_sortStops_i = 0;
		S.Design_sortStops_iz = 0;
		my.Design.prototype.sortStops = function() {
			S.Design_sortStops_color = this.get('color');
			S.Design_sortStops_shift = this.get('shift');
			for (S.Design_sortStops_i = 0, S.Design_sortStops_iz = S.Design_sortStops_color.length; S.Design_sortStops_i < S.Design_sortStops_iz; S.Design_sortStops_i++) {
				S.Design_sortStops_color[S.Design_sortStops_i].stop += S.Design_sortStops_shift;
				if (!my.isBetween(S.Design_sortStops_color[S.Design_sortStops_i].stop, 0, 1, true)) {
					S.Design_sortStops_color[S.Design_sortStops_i].stop = (S.Design_sortStops_color[S.Design_sortStops_i].stop > 0.5) ? S.Design_sortStops_color[S.Design_sortStops_i].stop - 1 : S.Design_sortStops_color[S.Design_sortStops_i].stop + 1;
				}
				if (S.Design_sortStops_color[S.Design_sortStops_i].stop <= 0) {
					S.Design_sortStops_color[S.Design_sortStops_i].stop = 0.000001;
				}
				else if (S.Design_sortStops_color[S.Design_sortStops_i].stop >= 1) {
					color[S.Design_sortStops_i].stop = 0.999999;
				}
			}
			S.Design_sortStops_color.sort(function(a, b) {
				return a.stop - b.stop;
			});
			this.color = S.Design_sortStops_color;
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
		S.animationLoop_i = 0;
		S.animationLoop_iz = 0;
		my.animationLoop = function() {
			if (my.orderAnimations) {
				my.sortAnimations();
			}
			for (S.animationLoop_i = 0, S.animationLoop_iz = my.animate.length; S.animationLoop_i < S.animationLoop_iz; S.animationLoop_i++) {
				if (my.animate[S.animationLoop_i]) {
					my.animation[my.animate[S.animationLoop_i]].fn();
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
		S.Animation_constructor_delay = false;
		my.Animation = function(items) {
			my.Base.call(this, items);
			items = my.safeObject(items);
			S.Animation_constructor_delay = (my.isa(items.delay, 'bool')) ? items.delay : false;
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
			if (!S.Animation_constructor_delay) {
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
		S.Tween_fn_currentTime = 0;
		S.Tween_fn_progress = 0;
		S.Tween_fn_entity = null; //scrawl Entity object
		S.Tween_fn_argSet = null; //raw object
		S.Tween_fn_keys = [];
		S.Tween_fn_temp = 0;
		S.Tween_fn_percent = 0;
		S.Tween_fn_t = 0;
		S.Tween_fn_tz = 0;
		S.Tween_fn_k = 0;
		S.Tween_fn_kz = 0;
		my.Tween.prototype.fn = function() {
			S.Tween_fn_currentTime = Date.now();
			S.Tween_fn_progress = (S.Tween_fn_currentTime - this.startTime) / this.duration;
			S.Tween_fn_keys = Object.keys(this.end);
			if (this.active) {
				if (S.Tween_fn_progress < 1) {
					for (S.Tween_fn_t = 0, S.Tween_fn_tz = this.currentTargets.length; S.Tween_fn_t < S.Tween_fn_tz; S.Tween_fn_t++) {
						S.Tween_fn_entity = this.currentTargets[S.Tween_fn_t];
						if (my.xt(S.Tween_fn_entity)) {
							S.Tween_fn_argSet = {};
							for (S.Tween_fn_k = 0, S.Tween_fn_kz = S.Tween_fn_keys.length; S.Tween_fn_k < S.Tween_fn_kz; S.Tween_fn_k++) {
								S.Tween_fn_temp = this.initVals[S.Tween_fn_t][S.Tween_fn_keys[S.Tween_fn_k]];
								S.Tween_fn_percent = (my.isa(S.Tween_fn_temp.start, 'str') || my.isa(S.Tween_fn_temp.change, 'str')) ? true : false;
								S.Tween_fn_argSet[S.Tween_fn_keys[S.Tween_fn_k]] = this.engine(
									parseFloat(S.Tween_fn_temp.start),
									parseFloat(S.Tween_fn_temp.change),
									S.Tween_fn_progress,
									this.engines[S.Tween_fn_keys[S.Tween_fn_k]],
									this.reverse);
								S.Tween_fn_argSet[S.Tween_fn_keys[S.Tween_fn_k]] = (S.Tween_fn_percent) ? S.Tween_fn_argSet[S.Tween_fn_keys[S.Tween_fn_k]] + '%' : S.Tween_fn_argSet[S.Tween_fn_keys[S.Tween_fn_k]];
							}
							S.Tween_fn_entity.set(S.Tween_fn_argSet);
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
		S.Tween_engine_temp = 0;
		my.Tween.prototype.engine = function(start, change, position, engine, reverse) {
			engine = my.xtGet(engine, 'x');
			if (engine.length < 4) {
				switch (engine) {
					case 'out':
						S.Tween_engine_temp = 1 - position;
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
						S.Tween_engine_temp = 1 - position;
						return (start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp) * -change);
					case 'easeIn3':
						S.Tween_engine_temp = 1 - position;
						return (start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp) * -change);
					case 'easeIn4':
						S.Tween_engine_temp = 1 - position;
						return (start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp) * -change);
					case 'easeIn5':
						S.Tween_engine_temp = 1 - position;
						return (start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp) * -change);
					default:
						return start + (position * change);
				}
			}
			if (engine.length > 8) {
				switch (engine) {
					case 'easeOutIn':
						S.Tween_engine_temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position) * change * 2) :
							(start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp) * -change * 2);
					case 'easeOutIn3':
						S.Tween_engine_temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position * position) * change * 4) :
							(start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp) * -change * 4);
					case 'easeOutIn4':
						S.Tween_engine_temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position * position * position) * change * 8) :
							(start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp) * -change * 8);
					case 'easeOutIn5':
						S.Tween_engine_temp = 1 - position;
						return (position < 0.5) ?
							start + ((position * position * position * position * position) * change * 16) :
							(start + change) + ((S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp * S.Tween_engine_temp) * -change * 16);
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
		S.Tween_run_test = 0;
		S.Tween_run_activeTweens = [];
		S.Tween_run_tw = null; //scrawl Tween object
		S.Tween_run_keys = [];
		S.Tween_run_start = 0;
		S.Tween_run_end = 0;
		S.Tween_run_percent = false;
		S.Tween_run_temp = 0;
		S.Tween_run_func = null; //function
		S.Tween_run_i = 0;
		S.Tween_run_iz = 0;
		S.Tween_run_j = 0;
		S.Tween_run_jz = 0;
		S.Tween_run_k = 0;
		S.Tween_run_kz = 0;
		S.Tween_run_t = 0;
		S.Tween_run_tz = 0;
		S.Tween_run_m = 0;
		S.Tween_run_mz = 0;
		S.Tween_run_l = 0;
		S.Tween_run_lz = 0;
		my.Tween.prototype.run = function() {
			S.Tween_run_func = my.subtractPercentages;
			if (!this.active) {
				S.Tween_run_activeTweens = [];
				S.Tween_run_keys = Object.keys(this.end);
				this.currentCount = this.currentCount || this.count;
				this.currentTargets = [];
				this.initVals = [];
				for (S.Tween_run_l = 0, S.Tween_run_lz = my.animationnames.length; S.Tween_run_l < S.Tween_run_lz; S.Tween_run_l++) {
					S.Tween_run_tw = my.animation[my.animationnames[S.Tween_run_l]];
					if (S.Tween_run_tw.type === 'Tween' && S.Tween_run_tw.active && S.Tween_run_tw.name !== this.name) {
						S.Tween_run_activeTweens.push(S.Tween_run_tw);
					}
				}
				for (S.Tween_run_i = 0, S.Tween_run_iz = this.targets.length; S.Tween_run_i < S.Tween_run_iz; S.Tween_run_i++) {
					S.Tween_run_test = true;
					for (S.Tween_run_j = 0, S.Tween_run_jz = S.Tween_run_activeTweens.length; S.Tween_run_j < S.Tween_run_jz; S.Tween_run_j++) {
						for (S.Tween_run_k = 0, S.Tween_run_kz = S.Tween_run_activeTweens[S.Tween_run_j].currentTargets.length; S.Tween_run_k < S.Tween_run_kz; S.Tween_run_k++) {
							if (this.targets[S.Tween_run_i].name === S.Tween_run_activeTweens[S.Tween_run_j].currentTargets[S.Tween_run_k].name) {
								S.Tween_run_test = false;
								break;
							}
						}
						if (!S.Tween_run_test) {
							break;
						}
					}
					if (S.Tween_run_test) {
						this.currentTargets.push(this.targets[S.Tween_run_i]);
					}
				}
				if (this.currentTargets.length > 0) {
					for (S.Tween_run_t = 0, S.Tween_run_tz = this.currentTargets.length; S.Tween_run_t < S.Tween_run_tz; S.Tween_run_t++) {
						if (my.xt(this.currentTargets[S.Tween_run_t])) {
							this.currentTargets[S.Tween_run_t].set(this.onCommence);
							this.initVals.push({});
							for (S.Tween_run_m = 0, S.Tween_run_mz = S.Tween_run_keys.length; S.Tween_run_m < S.Tween_run_mz; S.Tween_run_m++) {
								S.Tween_run_start = (my.xt(this.start[S.Tween_run_keys[S.Tween_run_m]])) ? this.start[S.Tween_run_keys[S.Tween_run_m]] : this.currentTargets[S.Tween_run_t].get([S.Tween_run_keys[S.Tween_run_m]]);
								S.Tween_run_end = this.end[S.Tween_run_keys[S.Tween_run_m]];
								S.Tween_run_percent = (my.isa(S.Tween_run_start, 'str') || my.isa(S.Tween_run_end, 'str')) ? true : false;
								S.Tween_run_temp = (S.Tween_run_percent) ? S.Tween_run_func(S.Tween_run_end, S.Tween_run_start) : S.Tween_run_end - S.Tween_run_start;
								if (this.reverse) {
									S.Tween_run_temp = (S.Tween_run_percent) ? -parseFloat(S.Tween_run_temp) + '%' : -S.Tween_run_temp;
								}
								this.initVals[S.Tween_run_t][S.Tween_run_keys[S.Tween_run_m]] = {
									start: (this.reverse) ? S.Tween_run_end : S.Tween_run_start,
									change: S.Tween_run_temp,
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
		S.Tween_runComplete_t = 0;
		S.Tween_runComplete_tz = 0;
		my.Tween.prototype.runComplete = function() {
			for (S.Tween_runComplete_t = 0, S.Tween_runComplete_tz = this.currentTargets.length; S.Tween_runComplete_t < S.Tween_runComplete_tz; S.Tween_runComplete_t++) {
				if (my.xt(this.currentTargets[S.Tween_runComplete_t])) {
					this.currentTargets[S.Tween_runComplete_t].set(this.onComplete);
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
		S.Tween_kill_t = 0;
		S.Tween_kill_tz = 0;
		my.Tween.prototype.kill = function() {
			if (this.active) {
				for (S.Tween_kill_t = 0, S.Tween_kill_tz = this.currentTargets.length; S.Tween_kill_t < S.Tween_kill_tz; S.Tween_kill_t++) {
					if (my.xt(this.currentTargets[S.Tween_kill_t])) {
						this.currentTargets[S.Tween_kill_t].set(this.onComplete);
					}
				}
			}
			my.removeItem(my.animate, this.name);
			my.removeItem(my.animationnames, this.name);
			delete my.animation[this.name];
			return true;
		};

		return my;
	}(scrawl, scrawlVars));
}
