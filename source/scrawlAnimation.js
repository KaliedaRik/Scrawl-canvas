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
			this.targets = (my.isa_arr(items.targets)) ? items.targets : ((my.xt(items.targets)) ? [items.targets] : []);
			this.currentTargets = [];
			this.initVals = [];
			this.start = (my.isa_obj(items.start)) ? items.start : {};
			this.engines = (my.isa_obj(items.engines)) ? items.engines : {};
			this.calculations = (my.isa_obj(items.calculations)) ? items.calculations : {};
			this.end = (my.isa_obj(items.end)) ? items.end : {};
			this.time = items.time || 0;
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
			this.lockObjects = items.lockObjects || false;
			this.killOnComplete = items.killOnComplete || false;
			this.callback = (my.isa_fn(items.callback)) ? items.callback : false;
			this.order = items.order || 0;
			for (i = 0, iz = this.targets.length; i < iz; i++) {
				if (this.targets[i].substring) {
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
					else if (my.filter && my.filter[this.targets[i]]) {
						temp = my.filter[this.targets[i]];
					}
					if (temp) {
						this.targets[i] = temp;
					}
				}
			}
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			my.work.resortAnimations = true;
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
		my.work.d.Tween = {
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
* __calc__ to tell the tween to use a function (set in the calculations object) to determine the tween value
@property engines
@type Object
@default {}
**/
			engines: {},
			/**
Object containing attribute: function pairs

The attribute must be the key of the attribute being tweened; the function can be anonymous or named. The function should return a value which the tween engine can then assign to the attribute. 

The function should accept three arguments. The first argument will be an object containing the following attributes:

* __start__ Start point for tween action
* __change__ Total change required for tween action
* __position__ Normalized time (time elapsed/duration)

The second argument will be the tween object itself, while the third will be the Entity (or Cell, etc) being tweened

@property calculations
@type Object
@default {}
**/
			calculations: {},
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
Time value - used only when adding a tween to a timeline using the addTween function
@property time
@type Number - milliseconds; can also accept timestrings (eg % values)? NOT TESTED
@default 0
**/
			time: 0,
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
Flag - when true, tween will automatically lock the objects it is operating on

Locking an object means that other tweens cannot operate on them
@property lockObjects
@type Boolean
@default false
**/
			lockObjects: false,
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
		my.mergeInto(my.work.d.Tween, my.work.d.Base);
		/**
Set tween values
@method set
@return this
@chainable
**/
		my.Tween.prototype.set = function(items) {
			console.log('set', this.name);
			var i, iz, a,
				animationnames = my.animationnames,
				animation = my.animation,
				contains = my.contains;
			my.Base.prototype.set.call(this, items);
			for (i = 0, iz = animationnames.length; i < iz; i++) {
				a = animation[animationnames[i]];
				if (a.type === 'Timeline') {
					if (contains(a.actionsList, this.name)) {
						a.resolve();
					}
				}
			}
			if (my.xt(items.order)) {
				my.work.resortAnimations = true;
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
				kz,
				xt = my.xt,
				currentTargets = this.currentTargets,
				engine = this.engine,
				engines = this.engines;
			this.currentTime = Date.now();
			progress = (this.currentTime - this.startTime) / this.duration;
			keys = Object.keys(this.end);
			if (this.active) {
				// console.log(this.name, 'fn #1: ', progress);
				if (progress < 1) {
					for (t = 0, tz = currentTargets.length; t < tz; t++) {
						entity = currentTargets[t];
						if (xt(entity)) {
							argSet = {};
							for (k = 0, kz = keys.length; k < kz; k++) {
								temp = this.initVals[t][keys[k]];
								unit = 0;
								if (temp.change.substring) {
									measure = temp.change.match(/^-?\d+\.?\d*(\D*)/);
									unit = measure[1];
									if (!xt(unit)) {
										unit = '%';
									}
								}
								argSet[keys[k]] = engine(
									parseFloat(temp.start),
									parseFloat(temp.change),
									progress,
									engines[keys[k]],
									this.reverse,
									keys[k],
									this,
									entity);
								if (argSet[keys[k]].toFixed) {
									argSet[keys[k]] = argSet[keys[k]] + unit;
								}
							}
							entity.set(argSet);
						}
					}
				}
				else {
					for (t = 0, tz = currentTargets.length; t < tz; t++) {
						if (xt(currentTargets[t])) {
							currentTargets[t].tweenLock = false;
						}
					}
					this.active = false;
					my.removeItem(my.work.animate, this.name);
					if (this.autoReverse || this.autoReverseAndRun) {
						this.reverse = (this.reverse) ? false : true;
					}
					if (this.autoReverseAndRun) {
						if (this.currentCount.toFixed) {
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
					else if (my.isa_bool(this.count) && this.count) {
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
@param {String} Attribute key
@param {Tween} Tween object
@param {Object} Entity (or Cell, etc) being tweened
@private
**/
		my.Tween.prototype.engine = function(start, change, position, engine, reverse, key, tween, obj) {
			engine = my.xtGet(engine, 'linear');
			if (engine === 'calc') {
				return tween.calculations[key]({
					start: start,
					change: change,
					position: position
				}, tween, obj);
			}
			return my.Tween.prototype.engineActions[engine](start, change, position, reverse);
		};
		/**
Tween engine helper object
@method engineActions
@private
**/
		my.Tween.prototype.engineActions = {
			out: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (start + change) + (Math.cos((position * 90) * my.work.radian) * -change);
			},
			in : function(start, change, position, reverse) {
				return start + (Math.sin((position * 90) * my.work.radian) * change);
			},
			easeIn: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp) * -change);
			},
			easeIn3: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp * temp) * -change);
			},
			easeIn4: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp * temp * temp) * -change);
			},
			easeIn5: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (start + change) + ((temp * temp * temp * temp * temp) * -change);
			},
			easeOutIn: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position) * change * 2) :
					(start + change) + ((temp * temp) * -change * 2);
			},
			easeOutIn3: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position * position) * change * 4) :
					(start + change) + ((temp * temp * temp) * -change * 4);
			},
			easeOutIn4: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position * position * position) * change * 8) :
					(start + change) + ((temp * temp * temp * temp) * -change * 8);
			},
			easeOutIn5: function(start, change, position, reverse) {
				var temp = 1 - position;
				return (position < 0.5) ?
					start + ((position * position * position * position * position) * change * 16) :
					(start + change) + ((temp * temp * temp * temp * temp) * -change * 16);
			},
			easeOut: function(start, change, position, reverse) {
				return start + ((position * position) * change);
			},
			easeOut3: function(start, change, position, reverse) {
				return start + ((position * position * position) * change);
			},
			easeOut4: function(start, change, position, reverse) {
				return start + ((position * position * position * position) * change);
			},
			easeOut5: function(start, change, position, reverse) {
				return start + ((position * position * position * position * position) * change);
			},
			linear: function(start, change, position, reverse) {
				return start + (position * change);
			}
		};
		/**
Run a tween animation
@method run
@return Always true
**/
		my.Tween.prototype.run = function() {
			console.log('run', this.name);
			var test,
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
				keys = Object.keys(this.end);
				this.currentCount = this.currentCount || this.count;
				this.currentTargets = [];
				this.initVals = [];
				for (i = 0, iz = this.targets.length; i < iz; i++) {
					if (this.lockObjects) {
						if (!this.targets[i].tweenLock) {
							this.targets[i].tweenLock = true;
							this.currentTargets.push(this.targets[i]);
						}
					}
					else {
						this.currentTargets.push(this.targets[i]);
					}
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
								if (end.substring) {
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
					my.pushUnique(my.work.animate, this.name);
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
			console.log('runComplete', this.name);
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
			this.currentTargets = [];
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
			console.log('halt', this.name);
			this.active = false;
			this.paused = true;
			my.removeItem(my.work.animate, this.name);
			return this;
		};
		/**
Reset a tween animation to its initial conditions
@method reset
@return this
@chainable
**/
		my.Tween.prototype.reset = function() {
			console.log('reset', this.name);
			var t, tz;
			this.paused = false;
			this.active = false;
			this.startTime = Date.now();
			this.currentTime = this.startTime;
			for (t = 0, tz = this.currentTargets.length; t < tz; t++) {
				this.currentTargets[t].set(this.start);
				this.currentTargets[t].set(this.onCommence);
			}
			return this;
		};
		/**
Complete a tween animation to its final conditions
@method complete
@return this
@chainable
**/
		my.Tween.prototype.complete = function() {
			console.log('complete', this.name);
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
			console.log('seekTo', this.name);
			var myActive = this.active,
				myPaused = this.paused,
				t, tz;
			if (item.toFixed) {
				if (item > 0) {
					this.currentTime = Date.now();
					this.startTime = this.currentTime;
					this.active = true;
					this.paused = false;
					this.startTime -= item;
					this.fn();
					this.paused = myPaused;
					this.active = myActive;
				}
				else {
					this.reset();
				}
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
			console.log('resume', this.name);
			var t0 = this.currentTime - this.startTime;
			if (this.paused) {
				this.currentTime = Date.now();
				this.startTime = this.currentTime - t0;
				my.pushUnique(my.work.animate, this.name);
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
			console.log('kill', this.name);
			var t,
				tz;
			if (this.active) {
				for (t = 0, tz = this.currentTargets.length; t < tz; t++) {
					if (my.xt(this.currentTargets[t])) {
						this.currentTargets[t].set(this.onComplete);
					}
				}
			}
			my.removeItem(my.work.animate, this.name);
			my.removeItem(my.animationnames, this.name);
			delete my.animation[this.name];
			my.work.resortAnimations = true;
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
			this.order = my.xtGet(items.order, 0);
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
		my.work.d.Timeline = {
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
@default 100
**/
			event: 100
		};
		/**
Sort the actions based on their timeValue values
@method sortActions
@return nothing
**/
		my.Timeline.prototype.sortActions = function() {
			this.actionsList = my.bucketSort('animation', 'timeValue', this.actionsList);
		};
		/**
Make a new timeupdate customEvent object
@method makeTimeupdateEvent
@return customEvent object, or null if browser does not support custom events
**/
		my.Timeline.prototype.makeTimeupdateEvent = function() {
			var e = null;
			if (window.MSInputMethodContext) {
				//do IE9-11 stuff
				e = document.createEvent('CustomEvent');
				e.initCustomEvent("timeline-updated", true, true, {
					name: this.name,
					type: 'Timeline',
					currentTime: this.currentTime - this.startTime
				});
			}
			else {
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
			var i, iz, a,
				xt = my.xt;
			items = my.safeObject(items);
			if (xt(items.duration) && items.duration.toFixed) {
				this.duration = items.duration;
			}
			if (xt(items.event) && items.event.toFixed) {
				this.event = items.event;
			}
			if (xt(items.order)) {
				this.order = items.order;
				my.work.resortAnimations = true;
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
			if (my.isa_arr(slice[0])) {
				slice = slice[0];
			}
			for (i = 0, iz = slice.length; i < iz; i++) {
				my.pushUnique(this.actionsList, slice[i]);
			}
			this.resolve();
			return this;
		};
		/**
Add an Action to the timeline - creates an action and adds it to the timeline
@method addAction
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.addAction = function(items) {
			var a = my.makeAction(items);
			this.add(a.name);
			return this;
		};
		/**
Change the globalCompositionOperation for an entity, group or cell on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __target__ - String name of the entity, group or cell
* __type__ - String - one from 'entity', 'group', 'cell'
* __from__ - String - globalCompositionObject value
* __to__ - String - globalCompositionObject value
* __time__ - time either a String % value, or a number in milliseconds

@method changeComposition
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
@deprecated - will be removed in a future update; use doComposition functions instead
**/
		my.Timeline.prototype.changeComposition = function(items) {
			var act, obj, fAction, fRollback, fReset;
			items = my.safeObject(items);
			if (my.xta(items.target, items.type, items.time, items.name, items.from, items.to)) {
				if (my.contains(my.work.sectionlist, items.type)) {
					obj = my[items.type][items.target];
					if (my.xt(obj)) {
						switch (items.type) {
							case 'entity':
							case 'cell':
								fAction = function() {
									obj.set({
										globalCompositeOperation: items.to
									});
								};
								fRollback = function() {
									obj.set({
										globalCompositeOperation: items.from
									});
								};
								fReset = function() {
									obj.set({
										globalCompositeOperation: items.from
									});
								};
								break;
							case 'group':
								fAction = function() {
									obj.setEntitysTo({
										globalCompositeOperation: items.to
									});
								};
								fRollback = function() {
									obj.setEntitysTo({
										globalCompositeOperation: items.from
									});
								};
								fReset = function() {
									obj.setEntitysTo({
										globalCompositeOperation: items.from
									});
								};
								break;
						}
						if (my.xt(fAction)) {
							act = my.makeAction({
								name: items.name + '_changeCompositeAction',
								time: items.time,
								action: fAction,
								rollback: fRollback,
								reset: fReset
							});
							this.add(act.name);
						}
					}
				}
			}
			return this;
		};
		/**
Change the globalCompositionOperation attribute for an entity at a given point on the timeline

The argument object must include the following attributes, otherwise the action will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedCompositionChangeAction'
* __targets__ - String name of the entity, or the entity object itself; can also be a mixed array of such strings or objects
* __from__ - String - old globalCompositionOrder value
* __to__ - String - new globalCompositionOrder value
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doCompositionEntitys
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doCompositionEntitys = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedCompositionChangeAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (my.xta(items.from, items.to) && targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								globalCompositeOperation: items.to
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								globalCompositeOperation: items.from
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								globalCompositeOperation: items.from
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doCompositionEntitys',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};
		/**
Change the globalCompositionOperation attribute for a cell at a given point on the timeline

The argument object must include the following attributes, otherwise the action will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedCompositionChangeAction'
* __targets__ - String name of the cell, or the cell object itself; can also be a mixed array of such strings or objects
* __from__ - String - old globalCompositionOrder value
* __to__ - String - new globalCompositionOrder value
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doCompositionCells
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doCompositionCells = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedCompositionChangeAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (my.xta(items.from, items.to) && targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								globalCompositeOperation: items.to
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								globalCompositeOperation: items.from
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								globalCompositeOperation: items.from
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doCompositionCells',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};
		/**
Change the globalCompositionOperation attribute for all entitys in a group at a given point on the timeline

The argument object must include the following attributes, otherwise the action will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedCompositionChangeAction'
* __targets__ - String name of the group, or the group object itself; can also be a mixed array of such strings or objects
* __from__ - String - old globalCompositionOrder value
* __to__ - String - new globalCompositionOrder value
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doCompositionGroups
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doCompositionGroups = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedCompositionChangeAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (my.xta(items.from, items.to) && targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.setEntitysTo({
								globalCompositeOperation: items.to
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.setEntitysTo({
								globalCompositeOperation: items.from
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.setEntitysTo({
								globalCompositeOperation: items.from
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doCompositionGroups',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};
		// TODO - add stack-related objects to the mix

		/**
Change the globalCompositionOperation attribute for an entity, cell, or all entitys in a group at a given point on the timeline

The argument object must include the following attributes, otherwise the action will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedCompositionChangeAction'
* __targets__ - String name of the entity, cell or group, or the object itself; can also be a mixed array of such strings or objects
* __from__ - String - old globalCompositionOrder value
* __to__ - String - new globalCompositionOrder value
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doComposition
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doComposition = function(items) {
			// TODO - add stack-related objects to the mix
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedCompositionChangeAction',
				time = items.time || 0,
				entitys = [],
				cells = [],
				groups = [],
				item, obj, i, iz;
			if (my.xta(items.from, items.to) && targets.length) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					item = targets[i];
					if (item.substring) {
						obj = my.entity[item] || my.group[item] || my.cell[item] || false;
					}
					else {
						obj = item;
					}
					if (obj) {
						if (my.contains(my.entitynames, obj.name)) {
							entitys.push(obj);
						}
						else if (my.contains(my.groupnames, obj.name)) {
							groups.push(obj);
						}
						else if (my.contains(my.cellnames, obj.name)) {
							cells.push(obj);
						}
					}
				}
				if (entitys.length > 0) {
					this.doCompositionEntitys({
						targets: entitys,
						name: name,
						from: items.from,
						to: items.to,
						time: time
					});
				}
				if (groups.length > 0) {
					this.doCompositionGroups({
						targets: groups,
						name: name,
						from: items.from,
						to: items.to,
						time: time
					});
				}
				if (cells.length > 0) {
					this.doCompositionCells({
						targets: cells,
						name: name,
						from: items.from,
						to: items.to,
						time: time
					});
				}
			}
			return this;
		};
		/**
Change the stamp/show order command for an entity, group or cell on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __target__ - String name of the entity, group or cell
* __type__ - String - one from 'entity', 'group', 'cell'
* __from__ - Integer - old order/show number
* __to__ - Integer - new order/show number
* __time__ - time either a String % value, or a number in milliseconds

@method changeOrder
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
@deprecated - will be removed in a future update; use doOrder functions instead
**/
		my.Timeline.prototype.changeOrder = function(items) {
			var act, obj, fAction, fRollback, fReset;
			items = my.safeObject(items);
			if (my.xta(items.target, items.type, items.time, items.name, items.from, items.to)) {
				if (my.contains(my.work.sectionlist, items.type)) {
					obj = my[items.type][items.target];
					if (my.xt(obj)) {
						switch (items.type) {
							case 'entity':
							case 'group':
								fAction = function() {
									obj.set({
										order: items.to
									});
								};
								fRollback = function() {
									obj.set({
										order: items.from
									});
								};
								fReset = function() {
									obj.set({
										order: items.from
									});
								};
								break;
							case 'cell':
								fAction = function() {
									obj.set({
										showOrder: items.to
									});
								};
								fRollback = function() {
									obj.set({
										showOrder: items.from
									});
								};
								fReset = function() {
									obj.set({
										showOrder: items.from
									});
								};
								break;
						}
						if (my.xt(fAction)) {
							act = my.makeAction({
								name: items.name + '_changeOrderAction',
								time: items.time,
								action: fAction,
								rollback: fRollback,
								reset: fReset
							});
							this.add(act.name);
						}
					}
				}
			}
			return this;
		};
		/**
Change the stamp/show order attribute for an entity at a given point on the timeline

The argument object must include the following attributes, otherwise the action will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedOrderChangeAction'
* __targets__ - String name of the entity, or the entity object itself; can also be a mixed array of such strings or objects
* __from__ - Integer - old order/show number
* __to__ - Integer - new order/show number
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doOrderEntitys
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doOrderEntitys = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedOrderChangeAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (my.xta(items.from, items.to) && targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								order: items.to
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								order: items.from
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								order: items.from
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doOrderEntitys',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};
		/**
Change the stamp/show order attribute for a group at a given point on the timeline

The argument object must include the following attributes, otherwise the action will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedOrderChangeAction'
* __targets__ - String name of the group, or the group object itself; can also be a mixed array of such strings or objects
* __from__ - Integer - old order/show number
* __to__ - Integer - new order/show number
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doOrderGroups
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doOrderGroups = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedOrderChangeAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (my.xta(items.from, items.to) && targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								order: items.to
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								order: items.from
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								order: items.from
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doOrderGroups',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};
		/**
Change the showOrder attribute for a cell at a given point on the timeline

The argument object must include the following attributes, otherwise the action will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedOrderChangeAction'
* __targets__ - String name of the cell, or the cell object itself; can also be a mixed array of such strings or objects
* __from__ - Integer - old order/show number
* __to__ - Integer - new order/show number
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doOrderCells
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doOrderCells = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedOrderChangeAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (my.xta(items.from, items.to) && targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								showOrder: items.to
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								showOrder: items.from
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								showOrder: items.from
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doOrderCells',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};
		/**
Change the order/showOrder attribute for entitys, groups and cells at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedOrderChangeAction'
* __targets__ - String name of the entity, group or cell, or the object itself; can also be a mixed array of such strings or objects
* __from__ - Integer - old order/show number
* __to__ - Integer - new order/show number
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

Note that if string names are supplied as part of the targets attribute, library sections will be searched for in the order: entity, group, cell, element

@method doOrder
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doOrder = function(items) {
			// TODO - add stack-related objects to the mix
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedOrderChangeAction',
				time = items.time || 0,
				entitys = [],
				cells = [],
				groups = [],
				item, obj, i, iz;
			if (my.xta(items.from, items.to) && targets.length) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					item = targets[i];
					if (item.substring) {
						obj = my.entity[item] || my.group[item] || my.cell[item] || false;
					}
					else {
						obj = item;
					}
					if (obj) {
						if (my.contains(my.entitynames, obj.name)) {
							entitys.push(obj);
						}
						else if (my.contains(my.groupnames, obj.name)) {
							groups.push(obj);
						}
						else if (my.contains(my.cellnames, obj.name)) {
							cells.push(obj);
						}
					}
				}
				if (entitys.length > 0) {
					this.doOrderEntitys({
						targets: entitys,
						name: name,
						from: items.from,
						to: items.to,
						time: time
					});
				}
				if (groups.length > 0) {
					this.doOrderGroups({
						targets: groups,
						name: name,
						from: items.from,
						to: items.to,
						time: time
					});
				}
				if (cells.length > 0) {
					this.doOrderCells({
						targets: cells,
						name: name,
						from: items.from,
						to: items.to,
						time: time
					});
				}
			}
			return this;
		};
		/**
Change the stamp order command for all entitys in a group on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __target__ - String name of the group
* __from__ - Integer - old order number
* __to__ - Integer - new order number
* __time__ - time either a String % value, or a number in milliseconds

@method changeGroupEntitysOrderTo
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
@deprecated - will be removed in a future update; use doOrder functions instead
**/
		my.Timeline.prototype.changeGroupEntitysOrderTo = function(items) {
			var act, obj, fAction, fRollback, fReset;
			items = my.safeObject(items);
			if (my.xta(items.target, items.time, items.name, items.from, items.to)) {
				obj = my.group[items.target];
				if (my.xt(obj)) {
					fAction = function() {
						obj.setEntitysTo({
							order: items.to
						});
					};
					fRollback = function() {
						obj.setEntitysTo({
							order: items.from
						});
					};
					fReset = function() {
						obj.setEntitysTo({
							order: items.from
						});
					};
					act = my.makeAction({
						name: items.name + '_changeGEOrderAction',
						time: items.time,
						action: fAction,
						rollback: fRollback,
						reset: fReset
					});
					this.add(act.name);
				}
			}
			return this;
		};
		/**
Fade in a set of entitys

The argument object must include the following attributes (engine is optional), otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __targets__ - Array of entity String names
* __engine__ - easing engine String (eg 'linear')
* __duration__ - Number length of tween, in milliseconds
* __time__ - time either a String % value, or a number in milliseconds

@method fadeIn
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.fadeIn = function(items) {
			var e;
			items = my.safeObject(items);
			e = items.engine || 'linear';
			if (my.xta(items.targets, items.time, items.duration, items.name)) {
				this.addAction({
					name: items.name,
					time: items.time,
					action: my.makeTween({
						name: items.name + '_fadeInTween',
						targets: items.targets,
						onCommence: {
							globalAlpha: 0
						},
						start: {
							globalAlpha: 0
						},
						end: {
							globalAlpha: 1
						},
						onComplete: {
							globalAlpha: 1
						},
						engines: {
							globalAlpha: e
						},
						duration: items.duration
					})
				});
			}
			return this;
		};
		/**
Fade out a set of entitys

The argument object must include the following attributes (engine is optional), otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __targets__ - Array of entity String names
* __engine__ - easing engine String (eg 'linear')
* __duration__ - Number length of tween, in milliseconds
* __time__ - time either a String % value, or a number in milliseconds

@method fadeOut
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.fadeOut = function(items) {
			var e;
			items = my.safeObject(items);
			e = items.engine || 'linear';
			if (my.xta(items.targets, items.time, items.duration, items.name)) {
				this.addAction({
					name: items.name,
					time: items.time,
					action: my.makeTween({
						name: items.name + '_fadeOutTween',
						targets: items.targets,
						onCommence: {
							globalAlpha: 1
						},
						start: {
							globalAlpha: 1
						},
						end: {
							globalAlpha: 0
						},
						onComplete: {
							globalAlpha: 0
						},
						engines: {
							globalAlpha: e
						},
						duration: items.duration
					})
				});
			}
			return this;
		};
		/**
Tween a set of entity attributes

This function is 'overloaded' inasmuch as it can accept either a raw object which includes the definition required for building a new tween, or it can accept an existing tween object.

Where the argument has a type attribute === 'Tween'

* __time__ - if the tween lacks a time value, then a default value of 0ms is assigned

Where the argument is a raw JavaScript object, it must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __targets__ - Array of entity String names
* __start__ - Object containing attriburte start values
* __end__ - Object containing attribute end values
* __duration__ - Number length of tween, in milliseconds
* __time__ - time either a String % value, or a number in milliseconds

In addition to the above, the following attributes are optional. Any other attributes are ignored:

* __engines__ - Object containing easing engine Strings (eg 'linear') - all engines default to 'linear'
* __calculations__ - Object containing easing engine functions

For the start, end, engines and calculations Objects, the keys should be the attributes being tweened, supplied with appropriate values

@method addTween
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.addTween = function(items) {
			var e, c;
			items = my.safeObject(items);
			e = items.engines || {};
			c = items.calculations || {};
			if (items.type && items.type === 'Tween') {
				this.addAction({
					name: items.name + '_action',
					time: items.time || 0,
					action: my.animation[items.name]
				});
			}
			else {
				if (my.xta(items.targets, items.time, items.duration, items.name, items.start, items.end)) {
					this.addAction({
						name: items.name + '_action',
						time: items.time,
						action: my.makeTween({
							name: items.name,
							targets: items.targets,
							onCommence: items.start,
							start: items.start,
							end: items.end,
							onComplete: items.end,
							engines: e,
							calculations: c,
							duration: items.duration
						})
					});
				}
			}
			return this;
		};
		/**
Add a visibility: true command for an entity, group or cell (rendered: true) to the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __target__ - String name of the entity, group or cell
* __type__ - String - one from 'entity', 'group', 'cell'
* __time__ - time either a String % value, or a number in milliseconds

@method addShow
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
@deprecated - will be removed in a future update; use doShow functions instead
**/
		my.Timeline.prototype.addShow = function(items) {
			var act, obj, fAction, fRollback, fReset;
			items = my.safeObject(items);
			if (my.xta(items.target, items.type, items.time, items.name)) {
				if (my.contains(my.work.sectionlist, items.type)) {
					obj = my[items.type][items.target];
					if (my.xt(obj)) {
						switch (items.type) {
							case 'entity':
								fAction = function() {
									obj.set({
										visibility: true
									});
								};
								fRollback = function() {
									obj.set({
										visibility: false
									});
								};
								fReset = function() {
									obj.set({
										visibility: false
									});
								};
								break;
							case 'group':
								fAction = function() {
									obj.set({
										visibility: true
									});
									obj.setEntitysTo({
										visibility: true
									});
								};
								fRollback = function() {
									obj.set({
										visibility: false
									});
									obj.setEntitysTo({
										visibility: false
									});
								};
								fReset = function() {
									obj.set({
										visibility: false
									});
									obj.setEntitysTo({
										visibility: false
									});
								};
								break;
							case 'cell':
								fAction = function() {
									obj.set({
										rendered: true
									});
								};
								fRollback = function() {
									obj.set({
										rendered: false
									});
								};
								fReset = function() {
									obj.set({
										rendered: false
									});
								};
								break;
						}
						if (my.xt(fAction)) {
							act = my.makeAction({
								name: items.name + '_showAction',
								time: items.time,
								action: fAction,
								rollback: fRollback,
								reset: fReset
							});
							this.add(act.name);
						}
					}
				}
			}
			return this;
		};

		/**
Make entitys visible (visibility: true) at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedShowAction'
* __targets__ - String name of the entity, or the entity object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doShowEntitys
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doShowEntitys = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedShowAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: true
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: false
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: false
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doShowEntitys',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};

		/**
Make entitys invisible (visibility: false) at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedHideAction'
* __targets__ - String name of the entity, or the entity object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doHideEntitys
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doHideEntitys = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedHideAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: false
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: true
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.entity;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: true
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doHideEntitys',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};

		/**
Make groups visible (visibility: true) at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedShowAction'
* __targets__ - String name of the group, or the group object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doShowGroups
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doShowGroups = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedShowAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: true
							});
							obj.setEntitysTo({
								visibility: true
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: false
							});
							obj.setEntitysTo({
								visibility: false
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: false
							});
							obj.setEntitysTo({
								visibility: false
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doShowGroups',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};

		/**
Make groups invisible (visibility: false) at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedShowAction'
* __targets__ - String name of the group, or the group object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doHideGroups
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doHideGroups = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedHideAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: true
							});
							obj.setEntitysTo({
								visibility: true
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: false
							});
							obj.setEntitysTo({
								visibility: false
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.group;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								visibility: false
							});
							obj.setEntitysTo({
								visibility: false
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doHideGroups',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};

		/**
Make cells visible (rendered: true) at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedShowAction'
* __targets__ - String name of the cell, or the cell object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doShowCells
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doShowCells = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedShowAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								rendered: true
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								rendered: false
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								rendered: false
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doShowCells',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};

		/**
Make cells invisible (rendered: false) at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedShowAction'
* __targets__ - String name of the cell, or the cell object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

@method doHideCells
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doHideCells = function(items) {
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedHideAction',
				time = items.time || 0,
				act, fAction, fRollback, fReset;
			if (targets.length) {
				fAction = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								rendered: false
							});
						}
					}
				};
				fRollback = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								rendered: true
							});
						}
					}
				};
				fReset = function() {
					var item, obj, i, iz,
						e = my.cell;
					for (i = 0, iz = targets.length; i < iz; i++) {
						item = targets[i];
						obj = (item.substring) ? e[item] : item;
						if (obj) {
							obj.set({
								rendered: true
							});
						}
					}
				};
				act = my.makeAction({
					name: name + '_doHideCells',
					time: time,
					action: fAction,
					rollback: fRollback,
					reset: fReset
				});
				this.add(act.name);
			}
			return this;
		};

		// TODO: add stack-related objects to the mix

		/**
Make entitys, groups and cells visible at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedShowAction'
* __targets__ - String name of the entity, group or cell, or the object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

Note that if string names are supplied as part of the targets attribute, library sections will be searched for in the order: entity, group, cell, element

@method doShow
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doShow = function(items) {
			// TODO - add stack-related objects to the mix
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedShowAction',
				time = items.time || 0,
				entitys = [],
				cells = [],
				groups = [],
				item, obj, i, iz;
			if (targets.length) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					item = targets[i];
					if (item.substring) {
						obj = my.entity[item] || my.group[item] || my.cell[item] || false;
					}
					else {
						obj = item;
					}
					if (obj) {
						if (my.contains(my.entitynames, obj.name)) {
							entitys.push(obj);
						}
						else if (my.contains(my.groupnames, obj.name)) {
							groups.push(obj);
						}
						else if (my.contains(my.cellnames, obj.name)) {
							cells.push(obj);
						}
					}
				}
				if (entitys.length > 0) {
					this.doShowEntitys({
						targets: entitys,
						name: name,
						time: time
					});
				}
				if (groups.length > 0) {
					this.doShowGroups({
						targets: groups,
						name: name,
						time: time
					});
				}
				if (cells.length > 0) {
					this.doShowCells({
						targets: cells,
						name: name,
						time: time
					});
				}
			}
			return this;
		};

		/**
Make entitys, groups and cells invisible at a given time on the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - (optional) String name of the new action - default 'unnamedShowAction'
* __targets__ - String name of the entity, group or cell, or the object itself; can also be a mixed array of such strings or objects
* __time__ - (optional) time either a String % value, or a number in milliseconds - default 0

Note that if string names are supplied as part of the targets attribute, library sections will be searched for in the order: entity, group, cell, element

@method doHide
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
**/
		my.Timeline.prototype.doHide = function(items) {
			// TODO - add stack-related objects to the mix
			items = my.safeObject(items);
			var targets = [].concat(items.targets),
				name = items.name || 'unnamedHideAction',
				time = items.time || 0,
				entitys = [],
				cells = [],
				groups = [],
				item, obj, i, iz;
			if (targets.length) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					item = targets[i];
					if (item.substring) {
						obj = my.entity[item] || my.group[item] || my.cell[item] || false;
					}
					else {
						obj = item;
					}
					if (obj) {
						if (my.contains(my.entitynames, obj.name)) {
							entitys.push(obj);
						}
						else if (my.contains(my.groupnames, obj.name)) {
							groups.push(obj);
						}
						else if (my.contains(my.cellnames, obj.name)) {
							cells.push(obj);
						}
					}
				}
				if (entitys.length > 0) {
					this.doHideEntitys({
						targets: entitys,
						name: name,
						time: time
					});
				}
				if (groups.length > 0) {
					this.doHideGroups({
						targets: groups,
						name: name,
						time: time
					});
				}
				if (cells.length > 0) {
					this.doHideCells({
						targets: cells,
						name: name,
						time: time
					});
				}
			}
			return this;
		};




		/**
Add a visibility: true command for a set of entitys and/or cells (rendered: true) to the timeline

The argument object must include the following attributes, otherwise the commands will not be added to the timeline:

* __name__ - String name of the new action
* __targets__ - Array of String names of entitys and/or cells
* __time__ - time either a String % value, or a number in milliseconds

@method showMany
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
@deprecated - will be removed in a future update; use doShow functions instead
**/
		my.Timeline.prototype.showMany = function(items) {
			var type, t, target, i, iz, obj,
				entity = my.entity,
				cell = my.cell,
				get = my.xtGet;
			items = my.safeObject(items);
			if (my.xta(items.targets, items.time, items.name)) {
				obj = {
					time: items.time
				};
				for (i = 0, iz = items.targets.length; i < iz; i++) {
					t = items.targets[i];
					target = get(entity[t], cell[t], false);
					if (target) {
						obj.name = items.name + '_' + i;
						obj.target = t;
						obj.type = (target.type === 'Cell') ? 'cell' : 'entity';
						this.addShow(obj);
					}
				}
			}
			return this;
		};
		/**
Add a visibility: false command for an entity, group or cell (rendered: false) to the timeline

The argument object must include the following attributes, otherwise the command will not be added to the timeline:

* __name__ - String name of the new action
* __item__ - String name of the entity, group or cell
* __type__ - String - one from 'entity', 'group', 'cell'
* __time__ - time either a String % value, or a number in milliseconds

@method addHide
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
@deprecated - will be removed in a future update; use doHide functions instead
**/
		my.Timeline.prototype.addHide = function(items) {
			var act, obj, fAction, fRollback, fReset;
			items = my.safeObject(items);
			if (my.xta(items.target, items.type, items.time, items.name)) {
				if (my.contains(my.work.sectionlist, items.type)) {
					obj = my[items.type][items.target];
					if (my.xt(obj)) {
						switch (items.type) {
							case 'entity':
								fAction = function() {
									obj.set({
										visibility: false
									});
								};
								fRollback = function() {
									obj.set({
										visibility: true
									});
								};
								fReset = function() {
									obj.set({
										visibility: true
									});
								};
								break;
							case 'group':
								fAction = function() {
									obj.set({
										visibility: false
									});
									obj.setEntitysTo({
										visibility: false
									});
								};
								fRollback = function() {
									obj.set({
										visibility: true
									});
									obj.setEntitysTo({
										visibility: true
									});
								};
								fReset = function() {
									obj.set({
										visibility: true
									});
									obj.setEntitysTo({
										visibility: true
									});
								};
								break;
							case 'cell':
								fAction = function() {
									obj.set({
										rendered: false
									});
								};
								fRollback = function() {
									obj.set({
										rendered: true
									});
								};
								fReset = function() {
									obj.set({
										rendered: true
									});
								};
								break;
						}
						if (my.xt(fAction)) {
							act = my.makeAction({
								name: items.name + '_hideAction',
								time: items.time,
								action: fAction,
								rollback: fRollback,
								reset: fReset
							});
							this.add(act.name);
						}
					}
				}
			}
			return this;
		};
		/**
Add a visibility: false command for a set of entitys and/or cells (rendered: false) to the timeline

The argument object must include the following attributes, otherwise the commands will not be added to the timeline:

* __name__ - String name of the new action
* __targets__ - Array of String names of entitys and/or cells
* __time__ - time either a String % value, or a number in milliseconds

@method hideMany
@param {Object} [items] Key:value Object argument for setting Action attributes
@return this
@chainable
@deprecated - will be removed in a future update; use doHide functions instead
**/
		my.Timeline.prototype.hideMany = function(items) {
			var type, t, target, i, iz, obj,
				entity = my.entity,
				cell = my.cell,
				get = my.xtGet;
			items = my.safeObject(items);
			if (my.xta(items.targets, items.time, items.name)) {
				obj = {
					time: items.time
				};
				for (i = 0, iz = items.targets.length; i < iz; i++) {
					t = items.targets[i];
					target = get(entity[t], cell[t], false);
					if (target) {
						obj.name = items.name + '_' + i;
						obj.target = t;
						obj.type = (t.type === 'Cell') ? 'cell' : 'entity';
						this.addHide(obj);
					}
				}
			}
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
			if (my.isa_arr(slice[0])) {
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
			console.log('timeline run', this.name);
			var i, iz, a, e;
			if (!this.active) {
				this.reset();
				my.pushUnique(my.work.animate, this.name);
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
			console.log('timeline resume', this.name);
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
				my.pushUnique(my.work.animate, this.name);
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
			if (this.currentTime >= this.startTime + this.effectiveDuration) {
				this.active = false;
				my.removeItem(my.work.animate, this.name);
			}
		};
		/**
Stop a Timeline; can be resumed using resume() or started again from the beginning using run()
@method halt
@return this
@chainable
**/
		my.Timeline.prototype.halt = function() {
			console.log('timeline halt', this.name);
			var i, iz, a;
			this.active = false;
			this.paused = true;
			for (i = 0, iz = this.actionsList.length; i < iz; i++) {
				a = my.animation[this.actionsList[i]];
				if (a.action && a.action.halt && a.action.active) {
					a.action.halt();
				}
			}
			my.removeItem(my.work.animate, this.name);
			return this;
		};
		/**
Reset a Timeline animation to its initial conditions
@method reset
@return this
@chainable
**/
		my.Timeline.prototype.reset = function() {
			console.log('timeline reset', this.name);
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
			my.removeItem(my.work.animate, this.name);
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
			console.log('timeline seekTo', this.name);
			var time, msTime, curTime, deltaTime;
			if (!this.seeking) {
				if (my.xt(item)) {
					if (this.active) {
						my.removeItem(my.work.animate, this.name);
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
						my.pushUnique(my.work.animate, this.name);
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
			console.log('timeline seekForward', this.name);
			var i, iz, a,
				oldCurrent, newCurrent, actionTimes, actionStart, actionEnd;
			//lock action
			this.seeking = true;
			if (!this.active) {
				this.paused = true;
			}
			if (item.toFixed && item) {
				oldCurrent = this.currentTime;
				newCurrent = oldCurrent + item;
				for (i = 0, iz = this.actionsList.length; i < iz; i++) {
					a = my.animation[this.actionsList[i]];
					actionTimes = this.getActionTimes(a);
					actionStart = actionTimes[0] + this.startTime;
					actionEnd = actionTimes[1] + this.startTime;
					if (actionStart && actionEnd) {
						if (my.isa_fn(a.action)) {
							//raw function action wrapper
							if (my.isBetween(actionStart, oldCurrent, newCurrent, true)) {
								a.action();
							}
						}
						else {
							//tween action wrapper
							if (a.action.type === 'Tween') {
								if (!(actionEnd < oldCurrent || actionStart > newCurrent)) {
									if(actionEnd < newCurrent){
										a.action.complete();
									}
									else{
										if (!a.action.active) {
											a.action.run();
											a.action.halt();
										}
										a.action.seekTo(item - (actionStart - oldCurrent));
									}
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
										a.action.seekForward(item);
									}
								}
							}
						}
					}
				}
				this.startTime -= item;
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
				else if (a.type === 'Action') {
					t = a.timeValue;
					d = (t > d) ? t : d;
				}
			}
			d = (this.duration > d) ? this.duration : d;
			return d;
		};
		/**
@method seekBack
@param {Number} [item] relative time to move back, in milliseconds. Must be a negative value!
@return this
@chainable
**/
		my.Timeline.prototype.seekBack = function(item) {
			console.log('timeline seekBack', this.name);
			var i, iz, a,
				oldCurrent, newCurrent, actionTimes, actionStart, actionEnd;
			//lock action
			this.seeking = true;
			if (!this.active) {
				this.paused = true;
			}
			if (item.toFixed && item) {
				oldCurrent = this.currentTime;
				newCurrent = oldCurrent + item;
				for (i = this.actionsList.length - 1; i >= 0; i--) {
					a = my.animation[this.actionsList[i]];
					actionTimes = this.getActionTimes(a);
					actionStart = actionTimes[0] + this.startTime;
					actionEnd = actionTimes[1] + this.startTime;
					if (actionStart && actionEnd) {
						if (my.isa_fn(a.action)) {
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
								if (!(actionEnd < newCurrent || actionStart > oldCurrent)) {
									if (!a.action.active) {
										a.action.run();
										a.action.halt();
									}
									a.action.seekTo(item - (actionStart - oldCurrent));
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
									if (!(actionEnd < newCurrent || actionStart > oldCurrent)) {
										a.action.seekBack(item);
									}
								}
							}
						}
					}
				}
				this.startTime -= item;
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
			console.log('timeline kill', this.name);
			my.removeItem(my.work.animate, this.name);
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
			this.order = my.xtGet(items.order, 0);
			this.convertTime();
			this.action = my.xtGet(items.action, false);
			this.reset = my.xtGet(items.reset, false);
			this.rollback = my.xtGet(items.rollback, false);
			this.complete = my.xtGet(items.complete, false);
			this.skipSeek = my.xtGet(items.skipSeek, false);
			my.animation[this.name] = this;
			my.pushUnique(my.animationnames, this.name);
			my.work.resortAnimations = true;
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
		my.work.d.Action = {
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
			my.work.resortAnimations = true;
			return true;
		};

		return my;
	}(scrawl));
}
