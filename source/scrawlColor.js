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

The Color extension adds a controllable color object that can be used with entity fillStyle and strokeStyle attributes

@module scrawlColor
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'color')) {
	var scrawl = (function(my) {
		'use strict';

		/**
	# window.scrawl

	scrawlColor extension adaptions to the scrawl-canvas library object

	@class window.scrawl_Color
	**/

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
		my.work.d.Color = {
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
		my.mergeInto(my.work.d.Color, my.work.d.Base);
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
				return 'rgba(' + (this.r || 0) + ', ' + (this.g || 0) + ', ' + (this.b || 0) + ', ' + my.xtGet(this.a, 1) + ')';
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
			var a, b, c;
			items = my.safeObject(items);
			a = this.parse();
			b = my.mergeOver(a, items);
			c = my.makeColor(b);
			if (items.random) {
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
			var rMax, gMax, bMax, aMax, rMin, gMin, bMin, aMin,
				get = my.xtGet;
			items = my.safeObject(items);
			this.rMax = get(items.rMax, this.rMax, 255);
			this.gMax = get(items.gMax, this.gMax, 255);
			this.bMax = get(items.bMax, this.bMax, 255);
			this.aMax = get(items.aMax, this.aMax, 1);
			this.rMin = get(items.rMin, this.rMin, 0);
			this.gMin = get(items.gMin, this.gMin, 0);
			this.bMin = get(items.bMin, this.bMin, 0);
			this.aMin = get(items.aMin, this.aMin, 0);
			this.r = items.r || Math.round((Math.random() * (this.rMax - this.rMin)) + this.rMin);
			this.g = items.g || Math.round((Math.random() * (this.gMax - this.gMin)) + this.gMin);
			this.b = items.b || Math.round((Math.random() * (this.bMax - this.bMin)) + this.bMin);
			this.a = items.a || (Math.random() * (this.aMax - this.aMin)) + this.aMin;
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
			this.r = (r > 255) ? 255 : ((r < 0) ? 0 : r);
			this.g = (g > 255) ? 255 : ((g < 0) ? 0 : g);
			this.b = (b > 255) ? 255 : ((b < 0) ? 0 : b);
			this.a = (a > 1) ? 1 : ((a < 0) ? 0 : a);
			return this;
		};
		/**
Augments Base.set()

In addition to setting any native color object attribute, the .set() function also accepts the following keys:

* __random__ (boolean) - when set to true, a random color (within minimum and maximum bounds) will be generated
* __color__ (string) - any legitimate CSS color string (including color names as defined in the SVGTiny standard)

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
			else if (items.color) {
				this.convert(items.color);
			}
			else {
				this.checkValues();
			}
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
				shift,
				min,
				max,
				bounce,
				between = my.isBetween;
			for (i = 0, iz = list.length; i < iz; i++) {
				col = this[list[i]];
				shift = this[list[i] + 'Shift'];
				min = this[list[i] + 'Min'];
				max = this[list[i] + 'Max'];
				bounce = this[list[i] + 'Bounce'];
				if (shift) {
					if (!between((col + shift), max, min, true)) {
						if (bounce) {
							shift = -shift;
						}
						else {
							col = (col > (max + min) / 2) ? max : min;
							shift = 0;
						}
					}
					this[list[i]] = col + shift;
					this[list[i] + 'Shift'] = shift;
				}
			}
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

Converts: '#nnn', '#nnnnnn', 'rgb(n, n, n)', 'rgba(n, n, n, a), color keywords.

Does not convert hsl() or hsla() strings.

Color keywords harvested from https://developer.mozilla.org/en/docs/Web/CSS/color_value (13 Dec 2015).
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
			items = (items.substring) ? items : '';
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
				else if (items === 'transparent') {
					r = g = b = a = 0;
				}
				else {
					temp = this.colorLibrary[items];
					if (temp) {
						r = parseInt(temp[0] + temp[1], 16);
						g = parseInt(temp[2] + temp[3], 16);
						b = parseInt(temp[4] + temp[5], 16);
						a = 1;
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
		my.Color.prototype.colorLibrary = {
			// color keywords harvested from https://developer.mozilla.org/en/docs/Web/CSS/color_value
			aliceblue: 'f0f8ff',
			antiquewhite: 'faebd7',
			aqua: '00ffff',
			aquamarine: '7fffd4',
			azure: 'f0ffff',
			beige: 'f5f5dc',
			bisque: 'ffe4c4',
			black: '000000',
			blanchedalmond: 'ffe4c4',
			blue: '0000ff',
			blueviolet: '8a2be2',
			brown: 'a52a2a',
			burlywood: 'deb887',
			cadetblue: '5f9ea0',
			chartreuse: '7fff00',
			chocolate: 'd2691e',
			coral: 'ff7f50',
			cornflowerblue: '6495ed',
			cornsilk: 'fff8dc',
			crimson: 'dc143c',
			darkblue: '00008b',
			darkcyan: '008b8b',
			darkgoldenrod: 'b8860b',
			darkgray: 'a9a9a9',
			darkgreen: '006400',
			darkgrey: 'a9a9a9',
			darkkhaki: 'bdb76b',
			darkmagenta: '8b008b',
			darkolivegreen: '556b2f',
			darkorange: 'ff8c00',
			darkorchid: '9932cc',
			darkred: '8b0000',
			darksalmon: 'e9967a',
			darkseagreen: '8fbc8f',
			darkslateblue: '483d8b',
			darkslategray: '2f4f4f',
			darkslategrey: '2f4f4f',
			darkturquoise: '00ced1',
			darkviolet: '9400d3',
			deeppink: 'ff1493',
			deepskyblue: '00bfff',
			dimgray: '696969',
			dimgrey: '696969',
			dodgerblue: '1e90ff',
			firebrick: 'b22222',
			floralwhite: 'fffaf0',
			forestgreen: '228b22',
			fuchsia: 'ff00ff',
			gainsboro: 'dcdcdc',
			ghostwhite: 'f8f8ff',
			gold: 'ffd700',
			goldenrod: 'daa520',
			gray: '808080',
			green: '008000',
			greenyellow: 'adff2f',
			grey: '808080',
			honeydew: 'f0fff0',
			hotpink: 'ff69b4',
			indianred: 'cd5c5c',
			indigo: '4b0082',
			ivory: 'fffff0',
			khaki: 'f0e68c',
			lavender: 'e6e6fa',
			lavenderblush: 'fff0f5',
			lawngreen: '7cfc00',
			lemonchiffon: 'fffacd',
			lightblue: 'add8e6',
			lightcoral: 'f08080',
			lightcyan: 'e0ffff',
			lightgoldenrodyellow: 'fafad2',
			lightgray: 'd3d3d3',
			lightgreen: '90ee90',
			lightgrey: 'd3d3d3',
			lightpink: 'ffb6c1',
			lightsalmon: 'ffa07a',
			lightseagreen: '20b2aa',
			lightskyblue: '87cefa',
			lightslategray: '778899',
			lightslategrey: '778899',
			lightsteelblue: 'b0c4de',
			lightyellow: 'ffffe0',
			lime: '00ff00',
			limegreen: '32cd32',
			linen: 'faf0e6',
			maroon: '800000',
			mediumaquamarine: '66cdaa',
			mediumblue: '0000cd',
			mediumorchid: 'ba55d3',
			mediumpurple: '9370db',
			mediumseagreen: '3cb371',
			mediumslateblue: '7b68ee',
			mediumspringgreen: '00fa9a',
			mediumturquoise: '48d1cc',
			mediumvioletred: 'c71585',
			midnightblue: '191970',
			mintcream: 'f5fffa',
			mistyrose: 'ffe4e1',
			moccasin: 'ffe4b5',
			navajowhite: 'ffdead',
			navy: '000080',
			oldlace: 'fdf5e6',
			olive: '808000',
			olivedrab: '6b8e23',
			orange: 'ffa500',
			orangered: 'ff4500',
			orchid: 'da70d6',
			palegoldenrod: 'eee8aa',
			palegreen: '98fb98',
			paleturquoise: 'afeeee',
			palevioletred: 'db7093',
			papayawhip: 'ffefd5',
			peachpuff: 'ffdab9',
			peru: 'cd853f',
			pink: 'ffc0cb',
			plum: 'dda0dd',
			powderblue: 'b0e0e6',
			purple: '800080',
			rebeccapurple: '663399',
			red: 'ff0000',
			rosybrown: 'bc8f8f',
			royalblue: '4169e1',
			saddlebrown: '8b4513',
			salmon: 'fa8072',
			sandybrown: 'f4a460',
			seagreen: '2e8b57',
			seashell: 'fff5ee',
			sienna: 'a0522d',
			silver: 'c0c0c0',
			skyblue: '87ceeb',
			slateblue: '6a5acd',
			slategray: '708090',
			slategrey: '708090',
			snow: 'fffafa',
			springgreen: '00ff7f',
			steelblue: '4682b4',
			tan: 'd2b48c',
			teal: '008080',
			thistle: 'd8bfd8',
			tomato: 'ff6347',
			turquoise: '40e0d0',
			violet: 'ee82ee',
			wheat: 'f5deb3',
			white: 'ffffff',
			whitesmoke: 'f5f5f5',
			yellow: 'ffff00',
			yellowgreen: '9acd32'
		};
		/**
Convert a decimal Number to its hexidecimal String value
@method toHex
@param {Number} items decimal value
@return Hexidecimal String
**/
		my.Color.prototype.toHex = function(item) {
			return item.toString(16);
		};
		/**
Convert a hexidecimal String to its decimal Number value
@method toDecimal
@param {String} Hexidecimal String value
@return Decimal Number
**/
		my.Color.prototype.toDecimal = function(item) {
			return parseInt(item, 16);
		};
		/**
Delete this Color object from the scrawl-canvas library
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
