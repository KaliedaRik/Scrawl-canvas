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
if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'animation')) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlAnimation extension adaptions to the Scrawl library object

## New library sections

* scrawl.tween - for Tween and Action objects

## New default attributes

* Position.delta - default: {x:0,y:0,z:0};
* Position.deltaPathPlace - default: 0;
* Position.pathSpeedConstant - default: true;
* Position.tweenLock - default: false;

* Cell.sourceDelta - default: {x:0, y:0, z:0};
* Cell.sourceMinWidth - default: 0;
* Cell.sourceMaxWidth - default: 0;
* Cell.sourceMinHeight - default: 0;
* Cell.sourceMaxHeight - default: 0;

* PageElement.tweenLock - default: false;

* Design.roll - default: 0;
* Design.autoUpdate - default: false;

@class window.scrawl_Animation
**/

		my.work.d.Position.delta = {
			x: 0,
			y: 0,
			z: 0
		};
		my.work.d.Position.deltaPathPlace = 0;
		my.work.d.Position.pathSpeedConstant = true;
		my.work.d.Position.tweenLock = false;
		my.mergeInto(my.work.d.Cell, my.work.d.Position);
		my.mergeInto(my.work.d.Entity, my.work.d.Position);
		if (my.xt(my.work.d.Block)) {
			my.mergeInto(my.work.d.Block, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Shape)) {
			my.mergeInto(my.work.d.Shape, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Wheel)) {
			my.mergeInto(my.work.d.Wheel, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Picture)) {
			my.mergeInto(my.work.d.Picture, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Phrase)) {
			my.mergeInto(my.work.d.Phrase, my.work.d.Entity);
		}
		if (my.xt(my.work.d.Path)) {
			my.mergeInto(my.work.d.Path, my.work.d.Entity);
		}

		my.work.d.PageElement.tweenLock = false;
		my.mergeInto(my.work.d.Pad, my.work.d.PageElement);
		if (my.xt(my.work.d.Stack)) {
			my.mergeInto(my.work.d.Stack, my.work.d.PageElement);
		}
		if (my.xt(my.work.d.Element)) {
			my.mergeInto(my.work.d.Element, my.work.d.PageElement);
		}

		my.pushUnique(my.work.sectionlist, 'tween');
		my.pushUnique(my.work.nameslist, 'tweennames');

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
			if (my.xt(item)) {
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
						timeUnit = 'ms';
						timeValue = parseFloat(item);
				}
				return [timeUnit, timeValue];
			}
			return false;
		};
		/**
A __utility__ function that adds two numbers between 0 and 1, keeping them within bounds

@method addWithinBounds
@param {Number} a first number
@param {Number} b second number
@return result of calculation
**/
		my.addWithinBounds = function(a, b) {
			var result = a + b;
			if (result > 1) {
				return result - 1;
			}
			if (result < 0) {
				return result + 1;
			}
			return result;
		};
		/**
Position constructor hook function

Adds a __delta__ (deltaX, deltaY) Vector to the object, used to give an object a 'velocity'

@method animationPositionInit
@private
**/
		my.Position.prototype.animationPositionInit = function(items) {
			var temp = my.safeObject(items.delta),
				vec = my.makeVector,
				get = my.xtGet,
				d = my.work.d[this.type];
			this.delta = vec({
				name: this.type + '.' + this.name + '.delta',
				x: get(items.deltaX, temp.x, 0),
				y: get(items.deltaY, temp.y, 0)
			});
			this.pathSpeedConstant = get(items.pathSpeedConstant, d.pathSpeedConstant);
			this.deltaPathPlace = get(items.deltaPathPlace, d.deltaPathPlace);
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
			var temp,
				so = my.safeObject,
				get = my.xtGet;
			items = so(items);
			if (!my.isa_vector(this.delta)) {
				this.delta = my.makeVector(items.delta || this.delta);
			}
			temp = so(items.delta);
			this.delta.x = get(items.deltaX, temp.x, this.delta.x);
			this.delta.y = get(items.deltaY, temp.y, this.delta.y);
			return this;
		};
		/**
Position.clone hook function - modified by animation module
@method animationPositionClone
@private
**/
		my.Position.prototype.animationPositionClone = function(a, items) {
			var temp = my.safeObject(items.delta),
				get = my.xtGet;
			a.delta = my.makeVector({
				x: get(items.deltaX, temp.x, a.delta.x),
				y: get(items.deltaY, temp.y, a.delta.y),
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
			item = my.xtGet(item, 'all');
			this.updateStartActions[item](my.addPercentages, this.start, this.delta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			return this;
		};
		/**
updateStart helper object

@method Position.updateStartActions
@private
**/
		my.Position.prototype.updateStartActions = {
			x: function(perc, start, delta, add) {
				start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
			},
			y: function(perc, start, delta, add) {
				start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
			},
			path: function(perc, start, delta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
			},
			all: function(perc, start, delta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
			}
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
			item = my.xtGet(item, 'all');
			this.revertStartActions[item](my.subtractPercentages, this.start, this.delta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			return this;
		};
		/**
revertStart helper object

@method Position.revertStartActions
@private
**/
		my.Position.prototype.revertStartActions = {
			x: function(perc, start, delta, add) {
				start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
			},
			y: function(perc, start, delta, add) {
				start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
			},
			path: function(perc, start, delta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
			},
			all: function(perc, start, delta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
			}
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
			if (my.isa_obj(obj)) {
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
			item = my.xtGet(item, 'all');
			this.reverseActions[item](this.delta, my.reversePercentage, this);
			return this;
		};
		/**
reverse helper object
@method Position.reverseActions
@private
**/
		my.Position.prototype.reverseActions = {
			deltaX: function(delta, perc) {
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
			},
			deltaY: function(delta, perc) {
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			},
			delta: function(delta, perc) {
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			},
			deltaPathPlace: function(delta, perc, obj) {
				obj.deltaPathPlace = -obj.deltaPathPlace;
			},
			all: function(delta, perc, obj) {
				obj.deltaPathPlace = -obj.deltaPathPlace;
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			}
		};
		my.work.d.Cell.copyDelta = {
			x: 0,
			y: 0,
		};
		my.work.d.Cell.copyMinWidth = 0;
		my.work.d.Cell.copyMaxWidth = 0;
		my.work.d.Cell.copyMinHeight = 0;
		my.work.d.Cell.copyMaxHeight = 0;
		/**
Cell constructor hook function

Adds a __sourceDelta__ (sourceDeltaX, sourceDeltaY) Vector to the cell, used to give it a 'velocity'

@method animationCellInit
@private
**/
		my.Cell.prototype.animationCellInit = function(items) {
			var temp = my.safeObject(items.copyDelta),
				get = my.xtGet;
			this.copyDelta = my.makeVector({
				x: get(items.copyDeltaX, temp.x, 0),
				y: get(items.copyDeltaY, temp.y, 0),
			});
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
			var temp,
				get = my.xtGet;
			if (my.xto(items.copyDelta, items.copyDeltaX, items.copyDeltaY)) {
				temp = my.safeObject(items.copyDelta);
				this.copyDelta.x = get(items.copyDeltaX, temp.x, this.copyDelta.x);
				this.copyDelta.y = get(items.copyDeltaY, temp.y, this.copyDelta.y);
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
			item = my.xtGet(item, 'all');
			this.updateStartActions[item](my.addPercentages, this.start, this.delta, this.copy, this.copyDelta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			return this;
		};
		/**
updateStart helper object

@method Cell.updateStartActions
@private
**/
		my.Cell.prototype.updateStartActions = {
			x: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x + copyDelta.x : perc(copy.x, copyDelta.x);
				}
			},
			y: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y + copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			start: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
			},
			paste: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
			},
			copy: function(perc, start, delta, copy, copyDelta, add) {
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x + copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y + copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			path: function(perc, start, delta, copy, copyDelta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
			},
			all: function(perc, start, delta, copy, copyDelta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x + copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y + copyDelta.y : perc(copy.y, copyDelta.y);
				}
			}
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
			item = my.xtGet(item, 'all');
			this.revertStartActions[item](my.subtractPercentages, this.start, this.delta, this.copy, this.copyDelta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			return this;
		};
		/**
revertStart helper object
@method Cell.revertStartActions
@private
**/
		my.Cell.prototype.revertStartActions = {
			x: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x - copyDelta.x : perc(copy.x, copyDelta.x);
				}
			},
			y: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y - copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			start: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
			},
			paste: function(perc, start, delta, copy, copyDelta, add) {
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
			},
			copy: function(perc, start, delta, copy, copyDelta, add) {
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x - copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y - copyDelta.y : perc(copy.y, copyDelta.y);
				}
			},
			path: function(perc, start, delta, copy, copyDelta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
			},
			all: function(perc, start, delta, copy, copyDelta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
				if (copyDelta.x) {
					copy.x = (copy.x.toFixed) ? copy.x - copyDelta.x : perc(copy.x, copyDelta.x);
				}
				if (copyDelta.y) {
					copy.y = (copy.y.toFixed) ? copy.y - copyDelta.y : perc(copy.y, copyDelta.y);
				}
			}
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
			if (item.toFixed) {
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
				c,
				cv = my.work.cv,
				cvx = my.work.cvx;
			items = my.safeObject(items);
			if (my.contains(stat, items.edge)) {
				myShift = my.xtGet(items.shiftCopy, false);
				height = this.actualHeight;
				width = this.actualWidth;
				ctx = my.context[this.name];
				c = my.canvas[this.name];
				cv.width = width;
				cv.height = height;
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
						cvx.drawImage(c, 0, 0, width, myStrip, 0, myRemains, width, myStrip);
						cvx.drawImage(c, 0, myStrip, width, myRemains, 0, 0, width, myRemains);
						this.copy.y -= (myShift) ? myStrip : 0;
						break;
					case 'bottom':
						cvx.drawImage(c, 0, 0, width, myRemains, 0, myStrip, width, myRemains);
						cvx.drawImage(c, 0, myRemains, width, myStrip, 0, 0, width, myStrip);
						this.copy.y += (myShift) ? myStrip : 0;
						break;
					case 'left':
						cvx.drawImage(c, 0, 0, myStrip, height, myRemains, 0, myStrip, height);
						cvx.drawImage(c, myStrip, 0, myRemains, height, 0, 0, myRemains, height);
						this.copy.x -= (myShift) ? myStrip : 0;
						break;
					case 'right':
						cvx.drawImage(c, 0, 0, myRemains, height, myStrip, 0, myRemains, height);
						cvx.drawImage(c, myRemains, 0, myStrip, height, 0, 0, myStrip, height);
						this.copy.x += (myShift) ? myStrip : 0;
						break;
				}
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(cv, 0, 0, width, height);
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
			var entitys = this.entitys,
				e = my.entity;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				e[entitys[i]].updateStart(item);
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
			var entitys = this.entitys,
				e = my.entity;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				e[entitys[i]].revertStart(item);
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
			var entitys = this.entitys,
				e = my.entity;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				e[entitys[i]].reverse(item);
			}
			return this;
		};
		/**
A value for shifting the color stops (was __roll__ in versions prior to v4.0)
@property shift
@type Number
@default 0
**/
		my.work.d.Design.shift = 0;
		/**
A flag to indicate that stop color shifts should be automatically applied
@property autoUpdate
@type Boolean
@default false
**/
		my.work.d.Design.autoUpdate = false;
		my.mergeInto(my.work.d.Gradient, my.work.d.Design);
		my.mergeInto(my.work.d.RadialGradient, my.work.d.Design);
		if (my.xt(my.work.d.Pattern)) {
			my.mergeInto(my.work.d.Pattern, my.work.d.Design);
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
Alias for makeTicker()
@method newTicker
@deprecated
**/
		my.newTicker = function(items) {
			return my.makeTicker(items);
		};
		/**
A __factory__ function to generate new Ticker objects
@method makeTicker
@param {Object} items Key:value Object argument for setting attributes
@return Ticker object
**/
		my.makeTicker = function(items) {
			return new my.Ticker(items);
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
A __factory__ function to generate new Tween objects
@method makeTween
@param {Object} items Key:value Object argument for setting attributes
@return Tween object
**/
		my.makeTween = function(items) {
			return new my.Tween(items);
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
A __factory__ function to generate new Action objects
@method makeAction
@param {Object} items Key:value Object argument for setting attributes
@return Action object
**/
		my.makeAction = function(items) {
			return new my.Action(items);
		};



		/**
# Ticker

## Instantiation

* scrawl.makeTicker()

## Purpose

* Defines a linear time sequence to which tweens and other actions can subscribe

## Access

* scrawl.animation.TICKERNAME - for the Ticker object

## Ticker functions

* Start a Ticker from 0 by calling the __run()__ function on it.
* Tickers can be stopped by calling the __halt()__ function on it.
* Start a Ticker from the point at which it was previously halted by calling the __resume()__ function on it.
* A Ticker can have its current tick amended by calling the __seekTo()__ function on it.
* A Ticker can be deleted by calling the __kill()__ function on it.

@class Ticker
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Ticker = function(items) {
			var xtGet = my.xtGet;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.order = xtGet(items.order, 0);
			this.subscribers = (my.xt(items.subscribers)) ? [].concat(items.subscribers) : [];
			this.duration = xtGet(items.duration, 0);
			this.eventChoke = xtGet(items.eventChoke, 0);
			this.loop = xtGet(items.loop, false);
			this.active = false;
			this.effectiveDuration = 0;
			this.startTime = 0;
			this.currentTime = 0;
			this.tick = 0;
			this.lastEvent = 0;
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			return this;
		};
		my.Ticker.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Ticker'
@final
**/
		my.Ticker.prototype.type = 'Ticker';
		my.Ticker.prototype.classname = 'animationnames';
		my.work.d.Ticker = {
			/**
Animation order

Objects in the animation loop are sorted by their order values, and run as part of the animation loop from lowest to highest order value. There is no guarantee in which order objects with the same order value will run during each animation loop
@property order
@type Number
@default 0
**/
			order: 0,
			/**
Ticker length, in milliseconds

If no duration is set, Ticker will set the last subscribed object's end time as its effective duration
@property duration
@type Number
@default 0
**/
			duration: 0,
			/**
Loop flag

When set to true, ticker will loop back to its beginning when it reaches the end of its (effective) duration; otherwise it will halt (default)
@property loop
@type Boolean
@default false
**/
			loop: false,
			/**
Event choke value

A ticker will trigger a __timeupdate__ event on the document object as it runs, with details of the ticker's current state including:

* __name__
* __tick__ (milliseconds)

If the eventChoke attribute is set to 0 (default), no timeupdate events are fired as the ticker runs - thus this value needs to be set explicitly to make the Ticker emit events. Otherwise, this value represents the time between each event emission

@property eventChoke
@type Number
@default 0
**/
			eventChoke: 0
		};
		/**
Make a new timeupdate customEvent object
@method makeTimeupdateEvent
@return customEvent object, or null if browser does not support custom events
**/
		my.Ticker.prototype.makeTimeupdateEvent = function() {
			var e = null;
			if (window.MSInputMethodContext) {
				//do IE9-11 stuff
				e = document.createEvent('CustomEvent');
				e.initCustomEvent("timeupdate", true, true, {
					name: this.name,
					type: 'Ticker',
					tick: this.tick
				});
			}
			else {
				if (window.CustomEvent) {
					e = new CustomEvent('timeupdate', {
						detail: {
							name: this.name,
							type: 'Ticker',
							tick: this.tick,
							reverseTick: this.effectiveDuration - this.tick
						},
						bubbles: true,
						cancelable: true
					});
				}
			}
			return e;
		};

// Not going to do explicit .set() or .clone() functions - let the Base functions do that work

		/**
Add a Tween or Action's name to the Ticker's .subscribers array

@method subscribe
@param {Array} [items] Array containing String name values, or Objects with a .name attribute; alternatively can be a single String or Object
@return this
**/
		my.Ticker.prototype.subscribe = function(items) {
			var myItems = [].concat(items),
				i, iz,
				item, safeItem, name,
				pu = my.pushUnique,
				so = my.safeObject;
			for(i = 0, iz = myItems.length; i < iz; i++){
				item = items[i];
				if(item.substring){
					name = item;
				}
				else{
					safeItem = so(item);
					name = safeItem.name || false;
				}
				if(name){
					pu(this.subscribers, name);
				}
			}
			if(myItems.length){
				this.recalculateEffectiveDuration();
			}
			return this;
		};
		/**
Remove a Tween or Action's name from the Ticker's .subscribers array

@method unsubscribe
@param {Array} [items] Array containing String name values, or Tween/Action Objects with a .name attribute; alternatively can be a single String or Object
@return this
**/
		my.Ticker.prototype.unsubscribe = function(items) {
			var myItems = [].concat(items),
				i, iz,
				item, safeItem, name,
				ri = my.removeItem,
				so = my.safeObject;
			for(i = 0, iz = myItems.length; i < iz; i++){
				item = items[i];
				if(item.substring){
					name = item;
				}
				else{
					safeItem = so(item);
					name = safeItem.name || false;
				}
				if(name){
					ri(this.subscribers, name);
				}
			}
			if(myItems.length){
				this.recalculateEffectiveDuration();
			}
			return this;
		};
		/**
Recalculate the ticker's effective duration

@method recalculateEffectiveDuration
@return this
**/
		my.Ticker.prototype.recalculateEffectiveDuration = function() {
			var i, iz, obj, durationValue, duration = 0,
				t = my.tween;
			if(!this.duration){
				for(i = 0, iz = this.subscribers.length; i < iz; i++){
					obj = t[this.subscribers[i]];
					durationValue = obj.getEndTime();
					if(durationValue > duration){
						duration = durationValue;
					}
				}
				this.effectiveDuration = duration;
			}
			else{
				this.effectiveDuration = this.duration;
			}
			return this;
		};
		/**
Animation function

@method fn
@return this
**/
		my.Ticker.prototype.fn = function() {
			var i, iz, sub,
				t = my.tween,
				result = {
					tick: 0,
					reverseTick: 0,
					willLoop: false,
					next: false
				};
			if(this.active && this.startTime){
				this.currentTime = Date.now();
				this.tick = this.currentTime - this.startTime;
				if(this.loop){
					if(this.tick >= this.effectiveDuration){
						this.tick = 0;
						this.startTime = this.currentTime;
						result.tick = this.effectiveDuration;
						result.reverseTick = 0;
						result.willLoop = true;
					}
					else{
						result.tick = this.tick;
						result.reverseTick = this.effectiveDuration - this.tick;
					}
					result.next = true;
				}
				else{
					if(this.tick >= this.effectiveDuration){
						result.tick = this.effectiveDuration;
						result.reverseTick = 0;
						this.active = false;
					}
					else{
						result.tick = this.tick;
						result.reverseTick = this.effectiveDuration - this.tick;
						result.next = true;
					}
				}
				for(i = 0, iz = this.subscribers.length; i < iz; i++){
					sub = t[this.subscribers[i]];
					sub.update(result);
				}
				if(!this.active){
					this.halt();
				}
			}
			return this;
		};

		/**
Start ticker from 0

@method run
@return this
**/
		my.Ticker.prototype.run = function() {
			this.startTime = this.currentTime = Date.now();
			this.active = true;
			my.pushUnique(my.work.animate, this.name);
			my.work.resortAnimations = true;
			return this;
		};
		/**
Halt ticker

@method halt
@return this
**/
		my.Ticker.prototype.halt = function() {
			this.active = false;
			my.removeItem(my.work.animate, this.name);
			my.work.resortAnimations = true;
			return this;
		};
		/**
Resume ticker

@method resume
@return this
**/
		my.Ticker.prototype.resume = function() {
			var now = Date.now(),
				current = this.currentTime,
				start = this.startTime;
			this.startTime = now - (current - start);
			this.currentTime = now;
			this.active = true;
			my.pushUnique(my.work.animate, this.name);
			my.work.resortAnimations = true;
			return this;
		};
		/**
seekTo a different specific point on the ticker

@method seekTo
@return this
**/
		my.Ticker.prototype.seekTo = function(milliseconds) {
			this.currentTime =  Date.now();
			this.startTime = this.currentTime - milliseconds;
			return this;
		};
		/**
seekFor a different relative point on the ticker

@method seekFor
@return this
**/
		my.Ticker.prototype.seekFor = function(milliseconds) {
			this.startTime -= milliseconds;
			return this;
		};
	/**
Remove this Ticker from the scrawl library
@method kill
@return Always true
**/
		my.Ticker.prototype.kill = function() {
			delete my.animation[this.name];
			my.removeItem(my.animationnames, this.name);
			my.removeItem(my.work.animate, this.name);
			my.work.resortAnimations = true;
			return true;
		};
	/**
Remove this Ticker from the scrawl library (if argument is true), alongside any tweens associated with it
@method killTweens
@return true if argument is true; this otherwise (default)
**/
		my.Ticker.prototype.killTweens = function(autokill) {
			var i, iz, sub,
				t = my.tween,
			autokill = (my.xt(autokill)) ? autokill : false;
			for(i = 0, iz = this.subscribers.length; i < iz; i++){
				sub = t[this.subscribers[i]];
				sub.kill();
			}
			if(autokill){
				this.kill();
				return true;
			}
			return this;
		};

		/**
# Action

## Instantiation

* scrawl.actionTicker()

## Purpose

* Defines a reversible function which can subscribe to a ticker so that it gets invoked at a particular moment after the ticker starts to run

Actions only really make sense when they are associated with a Ticker object. They have no duration as such (unless their action/revert functions include asynchronous activities, in which case - you're on your own!). The action() function should define a set of near-instant actions; the revert() function should mirror the action, to allow the Action object to be reversible.

Action and revert functions are not expected to take any arguments - they are expected to act on the objects assigned to their __targets__ Array

To access the Action functions directly, assign it to a variable, or call it from the library: 

* scrawl.tween[ACTIONNAME].action()
* scrawl.tween[ACTIONNAME].revert()

## Access

* scrawl.tween.ACTIONNAME - for the Action object

## Action functions

* An Action can be invoked by calling its __action()__ function.
* An Action can be reversed by calling its __revert()__ function.
* An Action can be deleted by calling the __kill()__ function on it.

@class Action
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Action = function(items) {
			var xtGet = my.xtGet;
			my.Base.call(this, items);
			items = my.safeObject(items);
			this.ticker = xtGet(items.ticker, '');
			this.targets = my.xt(items.targets) ? [].concat(items.targets) : [];
			this.action = (typeof items.action === 'function') ? items.action : function(){};
			this.revert = (typeof items.revert === 'function') ? items.revert : function(){};
			this.time = xtGet(items.time, 0);
			this.triggered = false;
			my.tween[this.name] = this;
			my.pushUnique(my.tweennames, this.name);
			return this;
		};
		my.Ticker.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Ticker'
@final
**/
		my.Ticker.prototype.type = 'Ticker';
		my.Ticker.prototype.classname = 'animationnames';
		my.work.d.Ticker = {
			/**
Ticker name
If an Action object is associated with a ticker, it will fire (or revert) at the appropriate point in the course of the ticker's run.
@property ticker
@type Number
@default 0
**/
			ticker: 0,
			/**
Ticker length, in milliseconds

If no duration is set, Ticker will set the last subscribed object's end time as its effective duration
@property duration
@type Number
@default 0
**/
			duration: 0,
			/**
Loop flag

When set to true, ticker will loop back to its beginning when it reaches the end of its (effective) duration; otherwise it will halt (default)
@property loop
@type Boolean
@default false
**/
			loop: false,
			/**
Event choke value

A ticker will trigger a __timeupdate__ event on the document object as it runs, with details of the ticker's current state including:

* __name__
* __tick__ (milliseconds)

If the eventChoke attribute is set to 0 (default), no timeupdate events are fired as the ticker runs - thus this value needs to be set explicitly to make the Ticker emit events. Otherwise, this value represents the time between each event emission

@property eventChoke
@type Number
@default 0
**/
			eventChoke: 0
		};







































		return my;
	}(scrawl));
}
