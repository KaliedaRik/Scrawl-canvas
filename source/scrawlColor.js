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
# scrawlColor

## Purpose and features

The Color module adds a controllable color object that can be used with entity fillStyle and strokeStyle attributes

@module scrawlColor
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'color')) {
	var scrawl = (function(my, S) {
		'use strict';

		/**
	# window.scrawl

	scrawlColor module adaptions to the Scrawl library object

	@class window.scrawl_Color
	**/

		/**
	A __factory__ function to generate new Color objects
	@method newColor
	@param {Object} items Key:value Object argument for setting attributes
	@return Color object
	**/
		my.newColor = function(items) {
			return new my.Color(items);
		};

		/**
	# Color

	## Instantiation

	* scrawl.newColor()

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

	This attribute is not retained by the color object, and can only be used in the __scrawl.newColor()__ and __Color.set()__ functions
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
		S.Color_clone_a = null; //raw object
		S.Color_clone_b = null; //raw object
		S.Color_clone_c = null; //scrawl Color object
		my.Color.prototype.clone = function(items) {
			S.Color_clone_a = this.parse();
			S.Color_clone_b = my.mergeOver(S.Color_clone_a, ((my.isa(items, 'obj')) ? items : {}));
			S.Color_clone_c = my.newColor(S.Color_clone_b);
			items = my.safeObject(items);
			if (my.xt(items.random) && items.random) {
				delete S.Color_clone_c.r;
				delete S.Color_clone_c.g;
				delete S.Color_clone_c.b;
				delete S.Color_clone_c.a;
				S.Color_clone_c.generateRandomColor(items);
			}
			return S.Color_clone_c;
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
		S.Color_generateRandomColor_rMax = 0;
		S.Color_generateRandomColor_gMax = 0;
		S.Color_generateRandomColor_bMax = 0;
		S.Color_generateRandomColor_aMax = 0;
		S.Color_generateRandomColor_rMin = 0;
		S.Color_generateRandomColor_gMin = 0;
		S.Color_generateRandomColor_bMin = 0;
		S.Color_generateRandomColor_aMin = 0;
		my.Color.prototype.generateRandomColor = function(items) {
			S.Color_generateRandomColor_rMax = this.get('rMax');
			S.Color_generateRandomColor_gMax = this.get('gMax');
			S.Color_generateRandomColor_bMax = this.get('bMax');
			S.Color_generateRandomColor_aMax = this.get('aMax');
			S.Color_generateRandomColor_rMin = this.get('rMin');
			S.Color_generateRandomColor_gMin = this.get('gMin');
			S.Color_generateRandomColor_bMin = this.get('bMin');
			S.Color_generateRandomColor_aMin = this.get('aMin');
			items = my.safeObject(items);
			this.r = items.r || Math.round((Math.random() * (S.Color_generateRandomColor_rMax - S.Color_generateRandomColor_rMin)) + S.Color_generateRandomColor_rMin);
			this.g = items.g || Math.round((Math.random() * (S.Color_generateRandomColor_gMax - S.Color_generateRandomColor_gMin)) + S.Color_generateRandomColor_gMin);
			this.b = items.b || Math.round((Math.random() * (S.Color_generateRandomColor_bMax - S.Color_generateRandomColor_bMin)) + S.Color_generateRandomColor_bMin);
			this.a = items.a || (Math.random() * (S.Color_generateRandomColor_aMax - S.Color_generateRandomColor_aMin)) + S.Color_generateRandomColor_aMin;
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
		S.Color_checkValues_r = 0;
		S.Color_checkValues_g = 0;
		S.Color_checkValues_b = 0;
		S.Color_checkValues_a = 0;
		my.Color.prototype.checkValues = function() {
			S.Color_checkValues_r = Math.floor(this.r) || 0;
			S.Color_checkValues_g = Math.floor(this.g) || 0;
			S.Color_checkValues_b = Math.floor(this.b) || 0;
			S.Color_checkValues_a = this.a || 1;
			S.Color_checkValues_r = (S.Color_checkValues_r > 255) ? 255 : ((S.Color_checkValues_r < 0) ? 0 : S.Color_checkValues_r);
			S.Color_checkValues_g = (S.Color_checkValues_g > 255) ? 255 : ((S.Color_checkValues_g < 0) ? 0 : S.Color_checkValues_g);
			S.Color_checkValues_b = (S.Color_checkValues_b > 255) ? 255 : ((S.Color_checkValues_b < 0) ? 0 : S.Color_checkValues_b);
			S.Color_checkValues_a = (S.Color_checkValues_a > 1) ? 1 : ((S.Color_checkValues_a < 0) ? 0 : S.Color_checkValues_a);
			this.r = S.Color_checkValues_r;
			this.g = S.Color_checkValues_g;
			this.b = S.Color_checkValues_b;
			this.a = S.Color_checkValues_a;
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
		S.Color_update_i = 0;
		S.Color_update_iz = 0;
		S.Color_update_list = ['r', 'g', 'b', 'a'];
		S.Color_update_col = '';
		S.Color_update_res = [];
		S.Color_update_sft = [];
		S.Color_update_shift = '';
		S.Color_update_min = 0;
		S.Color_update_max = 0;
		S.Color_update_bounce = false;
		my.Color.prototype.update = function() {
			S.Color_update_res = [];
			S.Color_update_sft = [];
			for (S.Color_update_i = 0, S.Color_update_iz = S.Color_update_list.length; S.Color_update_i < S.Color_update_iz; S.Color_update_i++) {
				S.Color_update_col = this.get(S.Color_update_list[S.Color_update_i]);
				S.Color_update_shift = this.get(S.Color_update_list[S.Color_update_i] + 'Shift');
				S.Color_update_min = this.get(S.Color_update_list[S.Color_update_i] + 'Min');
				S.Color_update_max = this.get(S.Color_update_list[S.Color_update_i] + 'Max');
				S.Color_update_bounce = this.get(S.Color_update_list[S.Color_update_i] + 'Bounce');
				if (!my.isBetween((S.Color_update_col + S.Color_update_shift), S.Color_update_max, S.Color_update_min, true)) {
					if (S.Color_update_bounce) {
						S.Color_update_shift = -S.Color_update_shift;
					}
					else {
						S.Color_update_col = (S.Color_update_col > (S.Color_update_max + S.Color_update_min) / 2) ? S.Color_update_max : S.Color_update_min;
						S.Color_update_shift = 0;
					}
				}
				S.Color_update_res[S.Color_update_i] = S.Color_update_col + S.Color_update_shift;
				S.Color_update_sft[S.Color_update_i] = S.Color_update_shift;
			}
			this.r = S.Color_update_res[0];
			this.g = S.Color_update_res[1];
			this.b = S.Color_update_res[2];
			this.a = S.Color_update_res[3];
			this.rShift = S.Color_update_sft[0];
			this.gShift = S.Color_update_sft[1];
			this.bShift = S.Color_update_sft[2];
			this.aShift = S.Color_update_sft[3];
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
		S.Color_convert_r = 0;
		S.Color_convert_g = 0;
		S.Color_convert_b = 0;
		S.Color_convert_a = 0;
		S.Color_convert_temp = [];
		my.Color.prototype.convert = function(items) {
			items = (my.isa(items, 'str')) ? items : '';
			if (items.length > 0) {
				items.toLowerCase();
				S.Color_convert_r = 0;
				S.Color_convert_g = 0;
				S.Color_convert_b = 0;
				S.Color_convert_a = 1;
				if (items[0] === '#') {
					if (items.length < 5) {
						S.Color_convert_r = this.toDecimal(items[1] + items[1]);
						S.Color_convert_g = this.toDecimal(items[2] + items[2]);
						S.Color_convert_b = this.toDecimal(items[3] + items[3]);
					}
					else if (items.length < 8) {
						S.Color_convert_r = this.toDecimal(items[1] + items[2]);
						S.Color_convert_g = this.toDecimal(items[3] + items[4]);
						S.Color_convert_b = this.toDecimal(items[5] + items[6]);
					}
				}
				else if (/rgb\(/.test(items)) {
					S.Color_convert_temp = items.match(/([0-9.]+\b)/g);
					if (/%/.test(items)) {
						S.Color_convert_r = Math.round((S.Color_convert_temp[0] / 100) * 255);
						S.Color_convert_g = Math.round((S.Color_convert_temp[1] / 100) * 255);
						S.Color_convert_b = Math.round((S.Color_convert_temp[2] / 100) * 255);
					}
					else {
						S.Color_convert_r = Math.round(S.Color_convert_temp[0]);
						S.Color_convert_g = Math.round(S.Color_convert_temp[1]);
						S.Color_convert_b = Math.round(S.Color_convert_temp[2]);
					}
				}
				else if (/rgba\(/.test(items)) {
					S.Color_convert_temp = items.match(/([0-9.]+\b)/g);
					S.Color_convert_r = S.Color_convert_temp[0];
					S.Color_convert_g = S.Color_convert_temp[1];
					S.Color_convert_b = S.Color_convert_temp[2];
					S.Color_convert_a = S.Color_convert_temp[3];
				}
				else {
					switch (items) {
						case 'green':
							S.Color_convert_r = 0;
							S.Color_convert_g = 128;
							S.Color_convert_b = 0;
							break;
						case 'silver':
							S.Color_convert_r = 192;
							S.Color_convert_g = 192;
							S.Color_convert_b = 192;
							break;
						case 'lime':
							S.Color_convert_r = 0;
							S.Color_convert_g = 255;
							S.Color_convert_b = 0;
							break;
						case 'gray':
							S.Color_convert_r = 128;
							S.Color_convert_g = 128;
							S.Color_convert_b = 128;
							break;
						case 'grey':
							S.Color_convert_r = 128;
							S.Color_convert_g = 128;
							S.Color_convert_b = 128;
							break;
						case 'olive':
							S.Color_convert_r = 128;
							S.Color_convert_g = 128;
							S.Color_convert_b = 0;
							break;
						case 'white':
							S.Color_convert_r = 255;
							S.Color_convert_g = 255;
							S.Color_convert_b = 255;
							break;
						case 'yellow':
							S.Color_convert_r = 255;
							S.Color_convert_g = 255;
							S.Color_convert_b = 0;
							break;
						case 'maroon':
							S.Color_convert_r = 128;
							S.Color_convert_g = 0;
							S.Color_convert_b = 0;
							break;
						case 'navy':
							S.Color_convert_r = 0;
							S.Color_convert_g = 0;
							S.Color_convert_b = 128;
							break;
						case 'red':
							S.Color_convert_r = 255;
							S.Color_convert_g = 0;
							S.Color_convert_b = 0;
							break;
						case 'blue':
							S.Color_convert_r = 0;
							S.Color_convert_g = 0;
							S.Color_convert_b = 255;
							break;
						case 'purple':
							S.Color_convert_r = 128;
							S.Color_convert_g = 0;
							S.Color_convert_b = 128;
							break;
						case 'teal':
							S.Color_convert_r = 0;
							S.Color_convert_g = 128;
							S.Color_convert_b = 128;
							break;
						case 'fuchsia':
							S.Color_convert_r = 255;
							S.Color_convert_g = 0;
							S.Color_convert_b = 255;
							break;
						case 'aqua':
							S.Color_convert_r = 0;
							S.Color_convert_g = 255;
							S.Color_convert_b = 255;
							break;
						default:
							S.Color_convert_r = 0;
							S.Color_convert_g = 0;
							S.Color_convert_b = 0;
					}
				}
				this.r = S.Color_convert_r;
				this.g = S.Color_convert_g;
				this.b = S.Color_convert_b;
				this.a = S.Color_convert_a;
				this.checkValues();
			}
			return this;
		};
		/**
	Convert a decimal Number to its hexidecimal String value
	@method toDecimal
	@param {Number} items decimal value
	@return Hexidecimal String
	**/
		my.Color.prototype.toDecimal = function(item) {
			return parseInt(item, 16);
		};
		/**
	Convert a hexidecimal String to its decimal Number value
	@method toHex
	@param {String} Hexidecimal String value
	@return Decimal Number
	**/
		my.Color.prototype.toHex = function(item) {
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
	}(scrawl, scrawlVars));
}
