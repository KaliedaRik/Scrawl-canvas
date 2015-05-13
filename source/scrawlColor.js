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
# scrawlColor

## Purpose and features

The Color module adds a controllable color object that can be used with entity fillStyle and strokeStyle attributes

@module scrawlColor
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'color')) {
	var scrawl = (function(my) {
		'use strict';

		/**
	# window.scrawl

	scrawlColor module adaptions to the Scrawl library object

	@class window.scrawl_Color
	**/

		/**
Alias for makeColor()
@method newColor
@deprecated
**/
		my.newColor = function(items) {
			return my.makeColor(items);
		};
		/**
A __factory__ function to generate new Color objects
@method makeColor
@param {Object} items Key:value Object argument for setting attributes
@return Color object
**/
		my.makeColor = function(items) {
			return new my.Color(items);
		};

		/**
# Color

## Instantiation

* scrawl.makeColor()

## Purpose

* Defines a color object
* Used with entity.strokeStyle and entity.fillStyle attributes

## Access

* scrawl.design.COLORNAME - for the Color design object

@class Color
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Color = function(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.set(items);
			if (my.xt(items.color)) {
				this.convert(items.color);
			}
			if (items.random) {
				this.generateRandomColor(items);
			}
			this.checkValues();
			my.design[this.name] = this;
			my.pushUnique(my.designnames, this.name);
			return this;
		};
		my.Color.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Color'
@final
**/
		my.Color.prototype.type = 'Color';
		my.Color.prototype.classname = 'designnames';
		my.d.Color = {
			/**
Red channel value: 0 - 255
@property r
@type Number
@default 0
**/
			r: 0,
			/**
Green channel value: 0 - 255
@property g
@type Number
@default 0
**/
			g: 0,
			/**
Blue channel value: 0 - 255
@property b
@type Number
@default 0
**/
			b: 0,
			/**
Alpha channel value: 0 - 1
@property a
@type Number
@default 1
**/
			a: 1,
			/**
Red channel delta value
@property rShift
@type Number
@default 0
**/
			rShift: 0,
			/**
Green channel delta value
@property gShift
@type Number
@default 0
**/
			gShift: 0,
			/**
Blue channel delta value
@property bShift
@type Number
@default 0
**/
			bShift: 0,
			/**
Alpha channel delta value
@property aShift
@type Number
@default 0
**/
			aShift: 0,
			/**
Red channel maximum permitted value: 0 - 255
@property rMax
@type Number
@default 255
**/
			rMax: 255,
			/**
Green channel maximum permitted value: 0 - 255
@property gMax
@type Number
@default 255
**/
			gMax: 255,
			/**
Blue channel maximum permitted value: 0 - 255
@property bMax
@type Number
@default 255
**/
			bMax: 255,
			/**
Alpha channel maximum permitted value: 0 - 1
@property aMax
@type Number
@default 1
**/
			aMax: 1,
			/**
Red channel minimum permitted value: 0 - 255
@property rMin
@type Number
@default 0
**/
			rMin: 0,
			/**
Green channel minimum permitted value: 0 - 255
@property gMin
@type Number
@default 0
**/
			gMin: 0,
			/**
Blue channel minimum permitted value: 0 - 255
@property bMin
@type Number
@default 0
**/
			bMin: 0,
			/**
Alpha channel minimum permitted value: 0 - 1
@property aMin
@type Number
@default 0
**/
			aMin: 0,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property rBounce
@type Boolean
@default false
**/
			rBounce: false,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property gBounce
@type Boolean
@default false
**/
			gBounce: false,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property bBounce
@type Boolean
@default false
**/
			bBounce: false,
			/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property aBounce
@type Boolean
@default false
**/
			aBounce: false,
			/**
Requires Color object to recalculate its attribute values before each display cycle commences
@property autoUpdate
@type Boolean
@default false
**/
			autoUpdate: false,
			/**
Generation flag - if true, Color object will set itself to a random color within minimum and maximum attributes

This attribute is not retained by the color object, and can only be used in the __scrawl.makeColor()__ and __Color.set()__ functions
@property random
@type Boolean
@default false
**/
		};
		my.mergeInto(my.d.Color, my.d.Base);
		/**
Augments Base.get()

* If called with no argument, will return the current color String
* if called with the String argument 'random', will generate a random color (within permitted limits) and return that
@method get
@param {String} item Attribute key String
@return Attribute value, or CSS color string
**/
		my.Color.prototype.get = function(item) {
			if (!my.xt(item)) {
				return 'rgba(' + (this.r || 0) + ', ' + (this.g || 0) + ', ' + (this.b || 0) + ', ' + (this.a || 1) + ')';
			}
			else if (item === 'random') {
				this.generateRandomColor();
				return this.get();
			}
			else {
				return my.Base.prototype.get.call(this, item);
			}
		};
		/**
Augments Base.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return Cloned Color object
**/
		my.Color.prototype.clone = function(items) {
			var a = this.parse(),
				b = my.mergeOver(a, ((my.isa(items, 'obj')) ? items : {})),
				c = my.makeColor(b);
			items = my.safeObject(items);
			if (my.xt(items.random) && items.random) {
				delete c.r;
				delete c.g;
				delete c.b;
				delete c.a;
				c.generateRandomColor(items);
			}
			return c;
		};
		/**
Returns current color, or next color value in sequence if .autoUpdate is true
@method getData
@return CSS color String
@private
**/
		my.Color.prototype.getData = function() {
			if (this.get('autoUpdate')) {
				this.update();
			}
			this.checkValues();
			return this.get();
		};
		/**
Generates a random color

Argument can include preset color channel values (0-255, 0-1 for alpha): {r:Number, g:Number, b:Number, a:Number}
@method generateRandomColor
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Color.prototype.generateRandomColor = function(items) {
			var rMax = this.get('rMax'),
				gMax = this.get('gMax'),
				bMax = this.get('bMax'),
				aMax = this.get('aMax'),
				rMin = this.get('rMin'),
				gMin = this.get('gMin'),
				bMin = this.get('bMin'),
				aMin = this.get('aMin');
			items = my.safeObject(items);
			this.r = items.r || Math.round((Math.random() * (rMax - rMin)) + rMin);
			this.g = items.g || Math.round((Math.random() * (gMax - gMin)) + gMin);
			this.b = items.b || Math.round((Math.random() * (bMax - bMin)) + bMin);
			this.a = items.a || (Math.random() * (aMax - aMin)) + aMin;
			this.checkValues();
			return this;
		};
		/**
Checks that color channel values are of the permitted form (integer vs float) and within permitted ranges
@method checkValues
@return This
@chainable
@private
**/
		my.Color.prototype.checkValues = function() {
			var r = Math.floor(this.r) || 0,
				g = Math.floor(this.g) || 0,
				b = Math.floor(this.b) || 0,
				a = this.a || 1;
			r = (r > 255) ? 255 : ((r < 0) ? 0 : r);
			g = (g > 255) ? 255 : ((g < 0) ? 0 : g);
			b = (b > 255) ? 255 : ((b < 0) ? 0 : b);
			a = (a > 1) ? 1 : ((a < 0) ? 0 : a);
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
			return this;
		};
		/**
Augments Base.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Color.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			items = my.safeObject(items);
			if (items.random) {
				this.generateRandomColor(items);
			}
			this.checkValues();
			return this;
		};
		/**
Update the current color, taking into account shift and bounce attribute values
@method update
@return This
@chainable
**/
		my.Color.prototype.update = function() {
			var i,
				iz,
				list = ['r', 'g', 'b', 'a'],
				col,
				res,
				sft,
				shift,
				min,
				max,
				bounce;
			res = [];
			sft = [];
			for (i = 0, iz = list.length; i < iz; i++) {
				col = this.get(list[i]);
				shift = this.get(list[i] + 'Shift');
				min = this.get(list[i] + 'Min');
				max = this.get(list[i] + 'Max');
				bounce = this.get(list[i] + 'Bounce');
				if (!my.isBetween((col + shift), max, min, true)) {
					if (bounce) {
						shift = -shift;
					}
					else {
						col = (col > (max + min) / 2) ? max : min;
						shift = 0;
					}
				}
				res[i] = col + shift;
				sft[i] = shift;
			}
			this.r = res[0];
			this.g = res[1];
			this.b = res[2];
			this.a = res[3];
			this.rShift = sft[0];
			this.gShift = sft[1];
			this.bShift = sft[2];
			this.aShift = sft[3];
			return this;
		};
		/**
Add values to Number attributes - limited to altering __r__, __g__, __b__ and __a__ attributes
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Color.prototype.setDelta = function(items) {
			items = (my.isa(items, 'obj')) ? items : {};
			my.Base.prototype.set.call(this, {
				r: (this.r || 0) + (items.r || 0),
				g: (this.g || 0) + (items.g || 0),
				b: (this.b || 0) + (items.b || 0),
				a: (this.a || 1) + (items.a || 0),
			});
			this.checkValues();
			return this;
		};
		/**
Convert a CSS color string value into native attribute values. 

Converts: '#nnn', '#nnnnnn', 'rgb(n, n, n)', 'rgba(n, n, n, a), color names.

Color names are limited to those supported by SVGTiny: 'green', 'silver', 'lime', 'gray', 'grey', 'olive', 'white', 'yellow', 'maroon', 'navy', 'red', 'blue', 'purple', 'teal', 'fuchsia', 'aqua'. Default: 'black'.
@method convert
@param {String} items CSS color String 
@return This
@chainable
**/
		my.Color.prototype.convert = function(items) {
			var r,
				g,
				b,
				a,
				temp;
			items = (my.isa(items, 'str')) ? items : '';
			if (items.length > 0) {
				items.toLowerCase();
				r = 0;
				g = 0;
				b = 0;
				a = 1;
				if (items[0] === '#') {
					if (items.length < 5) {
						r = this.toDecimal(items[1] + items[1]);
						g = this.toDecimal(items[2] + items[2]);
						b = this.toDecimal(items[3] + items[3]);
					}
					else if (items.length < 8) {
						r = this.toDecimal(items[1] + items[2]);
						g = this.toDecimal(items[3] + items[4]);
						b = this.toDecimal(items[5] + items[6]);
					}
				}
				else if (/rgb\(/.test(items)) {
					temp = items.match(/([0-9.]+\b)/g);
					if (/%/.test(items)) {
						r = Math.round((temp[0] / 100) * 255);
						g = Math.round((temp[1] / 100) * 255);
						b = Math.round((temp[2] / 100) * 255);
					}
					else {
						r = Math.round(temp[0]);
						g = Math.round(temp[1]);
						b = Math.round(temp[2]);
					}
				}
				else if (/rgba\(/.test(items)) {
					temp = items.match(/([0-9.]+\b)/g);
					r = temp[0];
					g = temp[1];
					b = temp[2];
					a = temp[3];
				}
				else {
					switch (items) {
						case 'green':
							r = 0;
							g = 128;
							b = 0;
							break;
						case 'silver':
							r = 192;
							g = 192;
							b = 192;
							break;
						case 'lime':
							r = 0;
							g = 255;
							b = 0;
							break;
						case 'gray':
							r = 128;
							g = 128;
							b = 128;
							break;
						case 'grey':
							r = 128;
							g = 128;
							b = 128;
							break;
						case 'olive':
							r = 128;
							g = 128;
							b = 0;
							break;
						case 'white':
							r = 255;
							g = 255;
							b = 255;
							break;
						case 'yellow':
							r = 255;
							g = 255;
							b = 0;
							break;
						case 'maroon':
							r = 128;
							g = 0;
							b = 0;
							break;
						case 'navy':
							r = 0;
							g = 0;
							b = 128;
							break;
						case 'red':
							r = 255;
							g = 0;
							b = 0;
							break;
						case 'blue':
							r = 0;
							g = 0;
							b = 255;
							break;
						case 'purple':
							r = 128;
							g = 0;
							b = 128;
							break;
						case 'teal':
							r = 0;
							g = 128;
							b = 128;
							break;
						case 'fuchsia':
							r = 255;
							g = 0;
							b = 255;
							break;
						case 'aqua':
							r = 0;
							g = 255;
							b = 255;
							break;
						default:
							r = 0;
							g = 0;
							b = 0;
					}
				}
				this.r = r;
				this.g = g;
				this.b = b;
				this.a = a;
				this.checkValues();
			}
			return this;
		};
		/**
Convert a decimal Number to its hexidecimal String value
@method toHex
@param {Number} items decimal value
@return Hexidecimal String
**/
		my.Color.prototype.toHex = function(item) {
			return parseInt(item, 16);
		};
		/**
Convert a hexidecimal String to its decimal Number value
@method toDecimal
@param {String} Hexidecimal String value
@return Decimal Number
**/
		my.Color.prototype.toDecimal = function(item) {
			return item.toString(16);
		};
		/**
Delete this Color object from the scrawl library
@method remove
@return Always true
**/
		my.Color.prototype.remove = function() {
			delete my.dsn[this.name];
			delete my.design[this.name];
			my.removeItem(my.designnames, this.name);
			return true;
		};

		return my;
	}(scrawl));
}
