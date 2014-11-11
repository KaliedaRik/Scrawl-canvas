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
# scrawlFilters

## Purpose and features

The Filters module adds a set of filter algorithms to the Scrawl library

@module scrawlFilters
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'filters')) {
	var scrawl = (function(my) {
		'use strict';
		/**
# window.scrawl

scrawlFilters module adaptions to the Scrawl library object

## New library sections

* scrawl.filter - for filter objects
* scrawl.filterFactory - for filter factory objects

@class window.scrawl_Filters
**/
		my.pushUnique(my.sectionlist, 'filter');
		my.pushUnique(my.nameslist, 'filternames');
		//temporary - to go after all filters converted
		my.pushUnique(my.sectionlist, 'filterFactory');
		my.pushUnique(my.nameslist, 'filterFactorynames');
		my.filterFactory = {};
		my.filterFactorynames = [];
		/**
DOM document fragment
@property filterFragment
@type {Object}
@private
**/
		my.filterFragment = document.createDocumentFragment();
		/**
Utility canvases - never displayed
@property filterCanvas1 and filterCanvas2
@type {CasnvasObject}
@private
**/
		my.filterCanvas1 = document.createElement('canvas');
		my.filterCanvas1.id = 'filterHiddenCanvasElement';
		my.filterFragment.appendChild(my.filterCanvas1);
		my.filterCanvas2 = document.createElement('canvas');
		my.filterCanvas2.id = 'filterHiddenCanvasElement';
		my.filterFragment.appendChild(my.filterCanvas2);
		/**
Utility canvas 2d context engine
@property filterCvx
@type {CasnvasContextObject}
@private
**/
		my.filterCvx1 = my.filterCanvas1.getContext('2d');
		my.filterCvx2 = my.filterCanvas2.getContext('2d');
		/**
A __factory__ function to generate new Greyscale filter objects
@method newGreyscaleFilter
@param {Object} items Key:value Object argument for setting attributes
@return GreyscaleFilter object
**/
		my.newGreyscaleFilter = function(items) {
			return new my.GreyscaleFilter(items);
		};
		/**
A __factory__ function to generate new Invert filter objects
@method newInvertFilter
@param {Object} items Key:value Object argument for setting attributes
@return InvertFilter object
**/
		my.newInvertFilter = function(items) {
			return new my.InvertFilter(items);
		};
		/**
A __factory__ function to generate new Brightness filter objects
@method newBrightnessFilter
@param {Object} items Key:value Object argument for setting attributes
@return BrightnessFilter object
**/
		my.newBrightnessFilter = function(items) {
			return new my.BrightnessFilter(items);
		};
		/**
A __factory__ function to generate new Saturation filter objects
@method newSaturationFilter
@param {Object} items Key:value Object argument for setting attributes
@return SaturationFilter object
**/
		my.newSaturationFilter = function(items) {
			return new my.SaturationFilter(items);
		};
		/**
A __factory__ function to generate new Threshold filter objects
@method newThresholdFilter
@param {Object} items Key:value Object argument for setting attributes
@return ThresholdFilter object
**/
		my.newThresholdFilter = function(items) {
			return new my.ThresholdFilter(items);
		};
		/**
A __factory__ function to generate new Channels filter objects
@method newChannelsFilter
@param {Object} items Key:value Object argument for setting attributes
@return ChannelsFilter object
**/
		my.newChannelsFilter = function(items) {
			return new my.ChannelsFilter(items);
		};
		/**
A __factory__ function to generate new ChannelStep filter objects
@method newChannelStepFilter
@param {Object} items Key:value Object argument for setting attributes
@return ChannelStepFilter object
**/
		my.newChannelStepFilter = function(items) {
			return new my.ChannelStepFilter(items);
		};
		/**
A __factory__ function to generate new Tint filter objects
@method newTintFilter
@param {Object} items Key:value Object argument for setting attributes
@return TintFilter object
**/
		my.newTintFilter = function(items) {
			return new my.TintFilter(items);
		};
		/**
A __factory__ function to generate new Tint filter objects preset with values for creating a sepia tint
@method newSepiaFilter
@param {Object} items Key:value Object argument for setting attributes
@return TintFilter object
**/
		my.newSepiaFilter = function(items) {
			items.redInRed = 0.393;
			items.redInGreen = 0.349;
			items.redInBlue = 0.272;
			items.greenInRed = 0.769;
			items.greenInGreen = 0.686;
			items.greenInBlue = 0.534;
			items.blueInRed = 0.189;
			items.blueInGreen = 0.168;
			items.blueInBlue = 0.131;
			return new my.TintFilter(items);
		};
		/**
A __factory__ function to generate new Matrix filter objects
@method newMatrixFilter
@param {Object} items Key:value Object argument for setting attributes
@return MatrixFilter object
**/
		my.newMatrixFilter = function(items) {
			return new my.MatrixFilter(items);
		};
		/**
A __factory__ function to generate new Sharpen filter objects
@method newSharpenFilter
@param {Object} items Key:value Object argument for setting attributes
@return SharpenFilter object
**/
		my.newSharpenFilter = function(items) {
			items.data = [0, -1, 0, -1, 5, -1, 0, -1, 0];
			return new my.MatrixFilter(items);
		};
		/**
A __factory__ function to generate new Pixelate filter objects
@method newPixelateFilter
@param {Object} items Key:value Object argument for setting attributes
@return PixelateFilter object
**/
		my.newPixelateFilter = function(items) {
			return new my.PixelateFilter(items);
		};
		/**
A __factory__ function to generate new Blur filter objects
@method newBlurFilter
@param {Object} items Key:value Object argument for setting attributes
@return BlurFilter object
**/
		my.newBlurFilter = function(items) {
			return new my.BlurFilter(items);
		};
		/**
A __factory__ function to generate new GlassTile filter objects
@method newGlassTileFilter
@param {Object} items Key:value Object argument for setting attributes
@return GlassTileFilter object
**/
		my.newGlassTileFilter = function(items) {
			return new my.GlassTileFilter(items);
		};


		/**
Entity.stamp hook function - add a filter to an Entity, and any background detail enclosed by the Entity
@method stampFilter
@private
**/
		my.Entity.prototype.stampFilter = function(engine, cell) {
			var imageData, i, iz, canvas, ctx;
			if (this.filters.length > 0) {
				canvas = my.canvas[cell];
				my.cv.width = canvas.width;
				my.cv.height = canvas.height;
				this.clip(my.cvx, cell);
				my.cvx.setTransform(1, 0, 0, 1, 0, 0);
				my.cvx.drawImage(canvas, 0, 0);
				imageData = my.cvx.getImageData(0, 0, canvas.width, canvas.height);
				for (i = 0, iz = this.filters.length; i < iz; i++) {
					if (my.contains(my.filternames, this.filters[i])) {
						imageData = my.filter[this.filters[i]].add(imageData);
					}
				}
				my.cvx.putImageData(imageData, 0, 0);
				engine.setTransform(1, 0, 0, 1, 0, 0);
				engine.drawImage(my.cv, 0, 0, canvas.width, canvas.height);
			}
		};
		/**
# Filter

## Instantiation

* scrawl.newFilter()

## Purpose

* Adds a filter effect to an Entity

## Access

* scrawl.filter.FILTERNAME - for the Filter object

@class Filter
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Filter = function Filter(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.filterStrength = my.xtGet([items.filterStrength, 1]);
			this.alpha = my.xtGet([items.alpha, 1]);
			return this;
		};
		my.Filter.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.Filter.prototype.type = 'Filter';
		my.Filter.prototype.classname = 'filternames';
		my.d.Filter = {
			/**
Filter strength - many filters will combine with the underlying image

values between 0 (no effect) and 1 (full effect); or '0%' and '100%'
@property filterStrength
@type Number - or alternatively percentage String
@default 1
**/
			filterStrength: 1,
			/**
Filter alpha

values between 0 (transparent) and 1 (current alpha values); or '0%' and '100%'
@property alpha
@type Number - or alternatively percentage String
@default 1
**/
			alpha: 1,
		};
		my.mergeInto(my.d.Filter, my.d.Base);
		/**
Add function - overwritten by individual filters

@method add
@param {Object} data - canvas getImageData object
@return original image data
**/
		my.Filter.prototype.add = function(data) {
			return data;
		};
		/**
Merge function - take two imageData objects and merge them in line with the filterStrength value

@method merge
@param {Object} original - canvas getImageData object
@param {Object} amended - canvas getImageData object
@param {Number} threshold - amount of amended object to be displayed over original object
@return merged image data; false on error
**/
		my.Filter.prototype.merge = function(original, amended, threshold) {
			var w, h;
			if (my.xta([original, amended, this.filterStrength])) {
				if (my.xta([original.width, original.height])) {
					if (1 === this.filterStrength) {
						return amended;
					}
					else if (0 === this.filterStrength) {
						return original;
					}
					else {
						w = original.width;
						h = original.height;
						my.filterCanvas1.width = w;
						my.filterCanvas1.height = h;
						my.filterCanvas2.width = w;
						my.filterCanvas2.height = h;
						my.filterCvx1.putImageData(original, 0, 0);
						my.filterCvx2.globalAlpha = 1 - threshold;
						my.filterCvx2.drawImage(my.filterCanvas1, 0, 0, w, h);
						my.filterCvx1.clearRect(0, 0, w, h);
						my.filterCvx1.putImageData(amended, 0, 0);
						my.filterCvx2.globalAlpha = threshold;
						my.filterCvx2.drawImage(my.filterCanvas1, 0, 0, w, h);
						my.filterCvx2.globalAlpha = 1;
						return my.filterCvx2.getImageData(0, 0, w, h);
					}
				}
			}
			return false;
		};
		/**
cloneImageData function

@method cloneImageData
@param {Object} original - canvas getImageData object
@return cloned image data object; false on error
**/
		my.Filter.prototype.cloneImageData = function(original) {
			var w, h;
			if (my.xt(original)) {
				if (my.xta([original.width, original.height])) {
					w = original.width;
					h = original.height;
					my.filterCanvas1.width = w;
					my.filterCanvas1.height = h;
					my.filterCvx1.putImageData(original, 0, 0);
					return my.filterCvx1.getImageData(0, 0, w, h);
				}
			}
			return false;
		};
		/**
getFilterStrength function

@method getFilterStrength
@return numerical strength value, between 0 and 1
@private
**/
		my.Filter.prototype.getFilterStrength = function() {
			var s = (my.isa(this.filterStrength, 'str')) ? parseFloat(this.filterStrength) / 100 : this.filterStrength;
			if (my.isBetween(s, 0, 1, true)) {
				return s;
			}
			else {
				return (s > 0.5) ? 1 : 0;
			}
		};
		/**
getAlpha function

@method getAlpha
@return numerical strength value, between 0 and 1
@private
**/
		my.Filter.prototype.getAlpha = function() {
			var a = (my.isa(this.alpha, 'str')) ? parseFloat(this.alpha) / 100 : this.alpha;
			if (my.isBetween(a, 0, 1, true)) {
				return a;
			}
			else {
				return (a > 0.5) ? 1 : 0;
			}
		};
		/**
# GreyscaleFilter

## Instantiation

* scrawl.newGreyscaleFilter()

## Purpose

* Adds a greyscale filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the GreyscaleFilter object

@class GreyscaleFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.GreyscaleFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.GreyscaleFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.GreyscaleFilter.prototype.type = 'GreyscaleFilter';
		my.GreyscaleFilter.prototype.classname = 'filternames';
		my.d.GreyscaleFilter = {};
		my.mergeInto(my.d.GreyscaleFilter, my.d.Filter);
		/**
Add function - takes data, calculates its greyscale and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.GreyscaleFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				d = data.data,
				here, i, iz, j, grey, current;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					here = i;
					grey = Math.floor((0.2126 * d[here]) + (0.7152 * d[++here]) + (0.0722 * d[++here]));
					for (j = 0; j < 3; j++) {
						here = i + j;
						current = d[here];
						if (1 === strength) {
							d[here] = grey;
						}
						else if (0 !== strength) {
							d[here] = (grey * strength) + (current * iStrength);
						}
					}
					if (alpha < 1) {
						d[i + 3] *= alpha;
					}
				}
			}
			return data;
		};
		/**
# InvertFilter

## Instantiation

* scrawl.newInvertFilter()

## Purpose

* Adds an invert filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the InvertFilter object

@class InvertFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.InvertFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.InvertFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.InvertFilter.prototype.type = 'InvertFilter';
		my.InvertFilter.prototype.classname = 'filternames';
		my.d.InvertFilter = {};
		my.mergeInto(my.d.InvertFilter, my.d.Filter);
		/**
Add function - takes data, calculates its invert and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.InvertFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				d = data.data,
				here, i, iz, j, current;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					for (j = 0; j < 3; j++) {
						here = i + j;
						current = d[here];
						if (1 === strength) {
							d[here] = 255 - current;
						}
						else if (0 !== strength) {
							d[here] = (current * iStrength) + ((255 - current) * strength);
						}
					}
					if (alpha < 1) {
						d[i + 3] *= alpha;
					}
				}
			}
			return data;
		};
		/**
# BrightnessFilter

## Instantiation

* scrawl.newBrightnessFilter()

## Purpose

* Adds a brightness filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the BrightnessFilter object

@class BrightnessFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.BrightnessFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.brightness = my.xtGet([items.brightness, 1]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.BrightnessFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.BrightnessFilter.prototype.type = 'BrightnessFilter';
		my.BrightnessFilter.prototype.classname = 'filternames';
		my.d.BrightnessFilter = {
			/**
Percentage value of brightness effect: as a Number, between 0 (black) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1 or 100%

@property brightness
@type Number - or alternatively percentage String
@default 1
**/
			brightness: 1,
		};
		my.mergeInto(my.d.BrightnessFilter, my.d.Filter);
		/**
Add function - takes data, calculates its brightness and replaces the old color data with new

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.BrightnessFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				brightness = (my.isa(this.brightness, 'str')) ? parseFloat(this.brightness) / 100 : this.brightness,
				d = data.data,
				here, i, iz, j, current;
			brightness = (brightness < 0) ? 0 : brightness;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					for (j = 0; j < 3; j++) {
						here = i + j;
						current = d[here];
						if (1 === strength) {
							d[here] = current * brightness;
						}
						else if (0 !== strength) {
							d[here] = ((current * brightness) * strength) + (current * iStrength);
						}
					}
					if (alpha < 1) {
						d[i + 3] *= alpha;
					}
				}
			}
			return data;
		};
		/**
# SaturationFilter

## Instantiation

* scrawl.newSaturationFilter()

## Purpose

* Adds a saturation filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the SaturationFilter object

@class SaturationFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.SaturationFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.saturation = my.xtGet([items.saturation, 1]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.SaturationFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.SaturationFilter.prototype.type = 'SaturationFilter';
		my.SaturationFilter.prototype.classname = 'filternames';
		my.d.SaturationFilter = {
			/**
Percentage value of saturation effect: as a Number, between 0 (uniform grey) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1 or 100%

@property saturation
@type Number - or alternatively percentage String
@default 1
**/
			saturation: 1,
		};
		my.mergeInto(my.d.SaturationFilter, my.d.Filter);
		/**
Add function - takes data, calculates its saturation and replaces the old color data with new

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.SaturationFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				saturation = (my.isa(this.saturation, 'str')) ? parseFloat(this.saturation) / 100 : this.saturation,
				d = data.data,
				here, i, iz, j, current;
			saturation = (saturation < 0) ? 0 : saturation;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					for (j = 0; j < 3; j++) {
						here = i + j;
						current = d[here];
						if (1 === strength) {
							d[here] = 127 + ((current - 127) * saturation);
						}
						else if (0 !== strength) {
							d[here] = (127 + ((current - 127) * saturation) * strength) + (current * iStrength);
						}
					}
					if (alpha < 1) {
						d[i + 3] *= alpha;
					}
				}
			}
			return data;
		};
		/**
# ThresholdFilter

## Instantiation

* scrawl.newThresholdFilter()

## Purpose

* Adds a threshold filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the ThresholdFilter object

@class ThresholdFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.ThresholdFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.threshold = my.xtGet([items.threshold, 0.5]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.ThresholdFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.ThresholdFilter.prototype.type = 'ThresholdFilter';
		my.ThresholdFilter.prototype.classname = 'filternames';
		my.d.ThresholdFilter = {
			/**
Percentage value of threshold effect: as a Number, between 0 (all black) and 1 (all white); as a String, between '0%' and '100%' (default: 0.5).

@property threshold
@type Number - or alternatively percentage String
@default 1
**/
			threshold: 0.5,
		};
		my.mergeInto(my.d.ThresholdFilter, my.d.Filter);
		/**
Add function - takes data, calculates its threshold and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.ThresholdFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				threshold = (my.isa(this.threshold, 'str')) ? parseFloat(this.threshold) / 100 : this.threshold,
				clone = this.cloneImageData(data),
				d = data.data,
				c, here, i, iz, j, t, oCurrent, cCurrent;
			threshold = (my.isBetween(threshold, 0, 1, true)) ? threshold : ((threshold > 0.5) ? 1 : 0);
			threshold *= 255;
			clone = my.GreyscaleFilter.prototype.add.call(this, clone);
			c = clone.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					t = (c[i] > threshold) ? 255 : 0;
					for (j = 0; j < 3; j++) {
						here = i + j;
						oCurrent = d[here];
						cCurrent = c[here];
						if (1 === strength) {
							d[here] = t;
						}
						else if (0 !== strength) {
							d[here] = (t * strength) + (oCurrent * iStrength);
						}
					}
					if (alpha < 1) {
						d[i + 3] *= alpha;
					}
				}
			}
			return data;
		};
		/**
# ChannelsFilter

## Instantiation

* scrawl.newChannelsFilter()

## Purpose

* Adds a channels filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the ChannelsFilter object

@class ChannelsFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.ChannelsFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.red = my.xtGet([items.red, 1]);
			this.green = my.xtGet([items.green, 1]);
			this.blue = my.xtGet([items.blue, 1]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.ChannelsFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.ChannelsFilter.prototype.type = 'ChannelsFilter';
		my.ChannelsFilter.prototype.classname = 'filternames';
		my.d.ChannelsFilter = {
			/**
value of red channel, from 0 or 0% upwards beyond 1 or 100%

@property red
@type Number - or alternatively percentage String
@default 1
**/
			red: 1,
			/**
value of green channel, from 0 or 0% upwards beyond 1 or 100%

@property green
@type Number - or alternatively percentage String
@default 1
**/
			green: 1,
			/**
value of blue channel, from 0 or 0% upwards beyond 1 or 100%

@property blue
@type Number - or alternatively percentage String
@default 1
**/
			blue: 1,
		};
		my.mergeInto(my.d.ChannelsFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.ChannelsFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				red = (my.isa(this.red, 'str')) ? parseFloat(this.red) / 100 : this.red,
				green = (my.isa(this.green, 'str')) ? parseFloat(this.green) / 100 : this.green,
				blue = (my.isa(this.blue, 'str')) ? parseFloat(this.blue) / 100 : this.blue,
				d = data.data,
				here, i, iz, r, g, b, a;
			red = (red < 0) ? 0 : red;
			green = (green < 0) ? 0 : green;
			blue = (blue < 0) ? 0 : blue;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					r = d[i];
					g = d[i + 1];
					b = d[i + 2];
					a = d[i + 3];
					if (1 === strength) {
						d[i] = r * red;
						d[i + 1] = g * green;
						d[i + 2] = b * blue;
						d[i + 3] = a * alpha;
					}
					else if (0 !== strength) {
						d[i] = ((r * red) * strength) + (r * iStrength);
						d[i + 1] = ((g * green) * strength) + (g * iStrength);
						d[i + 2] = ((b * blue) * strength) + (b * iStrength);
						d[i + 3] = ((a * alpha) * strength) + (a * iStrength);
					}
				}
			}
			return data;
		};
		/**
# ChannelStepFilter

## Instantiation

* scrawl.newChannelStepFilter()

## Purpose

* Adds a channel step filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the ChannelStepFilter object

@class ChannelStepFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.ChannelStepFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.red = my.xtGet([items.red, 1]);
			this.green = my.xtGet([items.green, 1]);
			this.blue = my.xtGet([items.blue, 1]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.ChannelStepFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.ChannelStepFilter.prototype.type = 'ChannelStepFilter';
		my.ChannelStepFilter.prototype.classname = 'filternames';
		my.d.ChannelStepFilter = {
			/**
Step value of red channel, between 1 (256 steps, default) and 128 (2 steps)

@property red
@type Number
@default 1
**/
			red: 1,
			/**
Step value of green channel, between 1 (256 steps, default) and 128 (2 steps)

@property green
@type Number
@default 1
**/
			green: 1,
			/**
Step value of blue channel, between 1 (256 steps, default) and 128 (2 steps)

@property blue
@type Number
@default 1
**/
			blue: 1,
		};
		my.mergeInto(my.d.ChannelStepFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.ChannelStepFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				red = this.red,
				green = this.green,
				blue = this.blue,
				d = data.data,
				here, i, iz, r, g, b;
			red = (red < 1) ? 1 : red;
			green = (green < 1) ? 1 : green;
			blue = (blue < 1) ? 1 : blue;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					r = d[i];
					g = d[i + 1];
					b = d[i + 2];
					if (1 === strength) {
						d[i] = Math.floor(r / red) * red;
						d[i + 1] = Math.floor(g / green) * green;
						d[i + 2] = Math.floor(b / blue) * blue;
					}
					else if (0 !== strength) {
						d[i] = ((Math.floor(r / red) * red) * strength) + (r * iStrength);
						d[i + 1] = ((Math.floor(g / green) * green) * strength) + (g * iStrength);
						d[i + 2] = ((Math.floor(b / blue) * blue) * strength) + (b * iStrength);
					}
					if (alpha < 1) {
						d[i + 3] *= alpha;
					}
				}
			}
			return data;
		};
		/**
# TintFilter

## Instantiation

* scrawl.newTintFilter()

## Purpose

* Adds a tint filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the TintFilter object

@class TintFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.TintFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.redInRed = my.xtGet([items.redInRed, 1]);
			this.redInGreen = my.xtGet([items.redInGreen, 0]);
			this.redInBlue = my.xtGet([items.redInBlue, 0]);
			this.greenInRed = my.xtGet([items.greenInRed, 0]);
			this.greenInGreen = my.xtGet([items.greenInGreen, 1]);
			this.greenInBlue = my.xtGet([items.greenInBlue, 0]);
			this.blueInRed = my.xtGet([items.blueInRed, 0]);
			this.blueInGreen = my.xtGet([items.blueInGreen, 0]);
			this.blueInBlue = my.xtGet([items.blueInBlue, 1]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.TintFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.TintFilter.prototype.type = 'TintFilter';
		my.TintFilter.prototype.classname = 'filternames';
		my.d.TintFilter = {
			/**
@property redInRed
@type Number - or alternatively percentage String
@default 1
**/
			redInRed: 1,
			/**
@property greenInRed
@type Number - or alternatively percentage String
@default 0
**/
			greenInRed: 0,
			/**
@property blueInRed
@type Number - or alternatively percentage String
@default 0
**/
			blueInRed: 0,
			/**
@property redInGreen
@type Number - or alternatively percentage String
@default 0
**/
			redInGreen: 0,
			/**
@property greenInGreen
@type Number - or alternatively percentage String
@default 1
**/
			greenInGreen: 1,
			/**
@property blueInGreen
@type Number - or alternatively percentage String
@default 0
**/
			blueInGreen: 0,
			/**
@property redInBlue
@type Number - or alternatively percentage String
@default 0
**/
			redInBlue: 0,
			/**
@property greenInBlue
@type Number - or alternatively percentage String
@default 0
**/
			greenInBlue: 0,
			/**
@property blueInBlue
@type Number - or alternatively percentage String
@default 1
**/
			blueInBlue: 1,
		};
		my.mergeInto(my.d.TintFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.TintFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				rr = (my.isa(this.redInRed, 'str')) ? parseFloat(this.redInRed) / 100 : this.redInRed,
				rg = (my.isa(this.redInGreen, 'str')) ? parseFloat(this.redInGreen) / 100 : this.redInGreen,
				rb = (my.isa(this.redInBlue, 'str')) ? parseFloat(this.redInBlue) / 100 : this.redInBlue,
				gr = (my.isa(this.greenInRed, 'str')) ? parseFloat(this.greenInRed) / 100 : this.greenInRed,
				gg = (my.isa(this.greenInGreen, 'str')) ? parseFloat(this.greenInGreen) / 100 : this.greenInGreen,
				gb = (my.isa(this.greenInBlue, 'str')) ? parseFloat(this.greenInBlue) / 100 : this.greenInBlue,
				br = (my.isa(this.blueInRed, 'str')) ? parseFloat(this.blueInRed) / 100 : this.blueInRed,
				bg = (my.isa(this.blueInGreen, 'str')) ? parseFloat(this.blueInGreen) / 100 : this.blueInGreen,
				bb = (my.isa(this.blueInBlue, 'str')) ? parseFloat(this.blueInBlue) / 100 : this.blueInBlue,
				d = data.data,
				here, i, iz, r, g, b, red, grn, blu;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3] !== 0) {
					if (1 === strength) {
						r = d[i];
						g = d[i + 1];
						b = d[i + 2];
						d[i] = (r * rr) + (g * gr) + (b * br);
						d[i + 1] = (r * rg) + (g * gg) + (b * bg);
						d[i + 2] = (r * rb) + (g * gb) + (b * bb);
					}
					else if (0 !== strength) {
						r = d[i];
						g = d[i + 1];
						b = d[i + 2];
						red = (r * rr) + (g * gr) + (b * br);
						grn = (r * rg) + (g * gg) + (b * bg);
						blu = (r * rb) + (g * gb) + (b * bb);
						d[i] = (r * iStrength) + (red * strength);
						d[i + 1] = (g * iStrength) + (grn * strength);
						d[i + 2] = (b * iStrength) + (blu * strength);
					}
					if (alpha < 1) {
						d[i + 3] *= alpha;
					}
				}
			}
			return data;
		};
		/**
# MatrixFilter

## Instantiation

* scrawl.newMatrixFilter()

## Purpose

* Adds a matrix filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the MatrixFilter object

@class MatrixFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.MatrixFilter = function(items) {
			var reqLen,
				i, j, k,
				counter = 0;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.width = my.xtGet([items.width, false]);
			this.height = my.xtGet([items.height, false]);
			this.rowWrap = my.xtGet([items.rowWrap, false]);
			this.colWrap = my.xtGet([items.colWrap, false]);
			this.data = my.xtGet([items.data, [1]]);
			//at this point we can check whether dimensions and the home coordinates have been supplied and, if not, guess them
			if (!this.height && this.width && my.isa(this.width, 'num') && this.width >= 1) {
				this.width = Math.floor(this.width);
				reqLen = Math.ceil(this.data.length / this.width);
				this.height = reqLen;
				reqLen = this.width * this.height;
			}
			else if (!this.width && this.height && my.isa(this.height, 'num') && this.height >= 1) {
				this.height = Math.floor(this.height);
				reqLen = Math.ceil(this.data.length / this.height);
				this.width = reqLen;
				reqLen = this.width * this.height;
			}
			else if (this.width && my.isa(this.width, 'num') && this.width >= 1 && this.height && my.isa(this.height, 'num') && this.height >= 1) {
				this.width = Math.round(this.width);
				this.height = Math.round(this.height);
				reqLen = this.width * this.height;
			}
			else {
				reqLen = Math.ceil(Math.sqrt(this.data.length));
				reqLen = (reqLen % 2 === 1) ? Math.pow(reqLen, 2) : Math.pow(reqLen + 1, 2);
				this.width = Math.round(Math.sqrt(reqLen));
				this.height = this.width;
			}
			for (k = 0; k < reqLen; k++) {
				this.data[k] = (my.xt(this.data[k])) ? parseFloat(this.data[k]) : 0;
				this.data[k] = (isNaN(this.data[k])) ? 0 : this.data[k];
			}
			this.x = my.xtGet([items.x, Math.floor(this.width / 2)]);
			this.y = my.xtGet([items.y, Math.floor(this.height / 2)]);
			//after which, we can generate the matrix cells
			this.cells = [];
			for (i = 0; i < this.height; i++) { //col (y)
				for (j = 0; j < this.width; j++) { //row (x)
					if (this.data[counter] !== 0) {
						this.cells.push([j - this.x, i - this.y, this.data[counter]]);
					}
					counter++;
				}
			}
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.MatrixFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.MatrixFilter.prototype.type = 'MatrixFilter';
		my.MatrixFilter.prototype.classname = 'filternames';
		my.d.MatrixFilter = {
			/**
@property width - matrix maximum width
@type Number
@default 1
**/
			width: 1,
			/**
@property height - matrix maximum height
@type Number
@default 1
**/
			height: 1,
			/**
@property x - home cell along the horizontal
@type Number
@default 0
**/
			x: 0,
			/**
@property y - home cell along the vertical
@type Number
@default 0
**/
			y: 0,
			/**
Data is made up of an array of weightings - for instance a 3 x 3 matrix will contain 9 Number values; this data then gets converted into Matrix cells

The data array has no meaning without width and height dimensions - if no dimension values are supplied, the constructor will assume a odd-numbered square larger than the square root of the length of the data array (eg 3x3, 5x5), with home coordinates at the center of the square, and pad empty spaces at the end of the array with zero weights (which then get ignored)

@property data - raw data supplied
@type Array
@default false
**/
			data: false,
		};
		my.mergeInto(my.d.MatrixFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.MatrixFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				d0 = data.data,
				result = my.cvx.createImageData(data),
				dR = result.data,
				i, iz, j, jz, k, kz, r, g, b, a, w, c, e, e0, x, y;
			if (strength === 0) {
				return data;
			}
			else {
				for (i = 0, iz = data.height; i < iz; i++) {
					for (j = 0, jz = data.width; j < jz; j++) {
						e0 = ((i * jz) + j) * 4;
						r = 0;
						g = 0;
						b = 0;
						a = 0;
						c = 0;
						for (k = 0, kz = this.cells.length; k < kz; k++) {
							x = j + this.cells[k][0];
							y = i + this.cells[k][1];
							if (x >= 0 && x < jz && y >= 0 && y < iz) {
								e = ((y * jz) + x) * 4;
								w = this.cells[k][2];
								c += w;
								r += (d0[e] * w);
								g += (d0[++e] * w);
								b += (d0[++e] * w);
								a += d0[++e];
							}
						}
						if (a > 0) {
							r = (c !== 0) ? r / c : r;
							g = (c !== 0) ? g / c : g;
							b = (c !== 0) ? b / c : b;
							if (strength === 1) {
								dR[e0] = r;
								e0++;
								dR[e0] = g;
								e0++;
								dR[e0] = b;
								e0++;
								dR[e0] = d0[e0] * alpha;
							}
							else {
								dR[e0] = (r * strength) + (d0[e0] * iStrength);
								e0++;
								dR[e0] = (g * strength) + (d0[e0] * iStrength);
								e0++;
								dR[e0] = (b * strength) + (d0[e0] * iStrength);
								e0++;
								dR[e0] = d0[e0] * alpha;
							}
						}
					}
				}
			}
			return result;
		};
		/**
# PixelateFilter

## Instantiation

* scrawl.newPixelateFilter()

## Purpose

* Adds a pixelate filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the PixelateFilter object

@class PixelateFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.PixelateFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.width = my.xtGet([items.width, 5]);
			this.height = my.xtGet([items.height, 5]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.PixelateFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.PixelateFilter.prototype.type = 'PixelateFilter';
		my.PixelateFilter.prototype.classname = 'filternames';
		my.d.PixelateFilter = {
			/**
@property width - pixelization width
@type Number
@default 5
**/
			width: 5,
			/**
@property height - pixelization height
@type Number
@default 5
**/
			height: 5,
};
		my.mergeInto(my.d.PixelateFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.PixelateFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				d = data.data,
				here, i, iz, r, g, b;
			return data;
		};
		/**
# BlurFilter

## Instantiation

* scrawl.newBlurFilter()

## Purpose

* Adds a blur filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the BlurFilter object

@class BlurFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.BlurFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.width = my.xtGet([items.width, 5]);
			this.height = my.xtGet([items.height, 5]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.BlurFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.BlurFilter.prototype.type = 'BlurFilter';
		my.BlurFilter.prototype.classname = 'filternames';
		my.d.BlurFilter = {
			/**
@property width - pixelization width
@type Number
@default 5
**/
			width: 5,
			/**
@property height - pixelization height
@type Number
@default 5
**/
			height: 5,
};
		my.mergeInto(my.d.BlurFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.BlurFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				d = data.data,
				here, i, iz, r, g, b;
			return data;
		};
		/**
# GlassTileFilter

## Instantiation

* scrawl.newGlassTileFilter()

## Purpose

* Adds a glass tile filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the GlassTileFilter object

@class GlassTileFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.GlassTileFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.width = my.xtGet([items.width, 5]);
			this.height = my.xtGet([items.height, 5]);
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.GlassTileFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.GlassTileFilter.prototype.type = 'GlassTileFilter';
		my.GlassTileFilter.prototype.classname = 'filternames';
		my.d.GlassTileFilter = {
			/**
@property width - pixelization width
@type Number
@default 5
**/
			width: 5,
			/**
@property height - pixelization height
@type Number
@default 5
**/
			height: 5,
};
		my.mergeInto(my.d.GlassTileFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data in line with the filterStrength value

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.GlassTileFilter.prototype.add = function(data) {
			var strength = this.getFilterStrength(),
				iStrength = 1 - strength,
				alpha = this.getAlpha(),
				d = data.data,
				here, i, iz, r, g, b;
			return data;
		};

















		/**
Blur filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __brush__ - Array. A pre-compiled filter.getBrush() array to be used with the blur filter; alternatively, define the brush dynamically using the radius/radiusX/radiusY/roll attributes below
* __radiusX__ - Number. Blur brush x radius (default: 2)
* __radiusY__ - Number. Blur brush y radius (default: 2)
* __roll__ - Number. Blur brush roll value (default: 0)
* __radius__ - Number. Blur brush x and y radius (default: 0)
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture entitys using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method blur
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
		my.filterFactory.blur = function(items, image) {
			var args = my.filterSetup(items, image);
			args.items.includeAlpha = (my.isa(args.items.includeAlpha, 'bool')) ? args.items.includeAlpha : false;
			args.items.wrap = false;
			if (!my.xt(args.items.brush)) {
				var radius = (my.xt(args.items.radius)) ? Math.abs(args.items.radius) : 0,
					radiusX = (my.xt(args.items.radiusX)) ? Math.abs(args.items.radiusX) : 2,
					radiusY = (my.xt(args.items.radiusY)) ? Math.abs(args.items.radiusY) : 2,
					roll = (my.xt(args.items.roll)) ? args.items.roll : 0,
					rx = radiusX || radius,
					ry = radiusY || radius;
				args.items.brush = my.filterFactory.getBrush(rx, ry, roll);
			}
			args.imgData = my.filterFactory.doMatrix(args.items.brush, args);
			my.filterSave(args);
			return args.imgData;
		};
		my.pushUnique(my.filterFactorynames, 'blur');
		/**
Blur helper function

@method getBrush
@param x {Number} brush x radius
@param y {Number} brush y radius
@param r {Number} brush roll (in degrees)
@return Array of objects used for the blur brush
**/
		my.filterFactory.getBrush = function(x, y, r) {
			var dim = (x > y) ? x + 2 : y + 2,
				hDim = Math.floor(dim / 2),
				cos = Math.cos(r * my.radian),
				sin = Math.sin(r * my.radian),
				brush = [];
			my.cv.width = dim;
			my.cv.height = dim;
			my.cvx.setTransform(cos, sin, -sin, cos, hDim, hDim);
			my.cvx.beginPath();
			my.cvx.moveTo(-x, 0);
			my.cvx.lineTo(-1, -1);
			my.cvx.lineTo(0, -y);
			my.cvx.lineTo(1, -1);
			my.cvx.lineTo(x, 0);
			my.cvx.lineTo(1, 1);
			my.cvx.lineTo(0, y);
			my.cvx.lineTo(-1, 1);
			my.cvx.lineTo(-x, 0);
			my.cvx.closePath();
			for (var i = 0; i < dim; i++) { //rows (y)
				for (var j = 0; j < dim; j++) { //cols (x)
					if (my.cvx.isPointInPath(j, i)) {
						brush.push({
							ox: j - hDim,
							oy: i - hDim,
							wt: 1
						});
					}
				}
			}
			my.cvx.setTransform(1, 0, 0, 1, 0, 0);
			return brush;
		};
		my.pushUnique(my.filterFactorynames, 'getBrush');
		/**
Pixelate filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __width__ - Number. Block width (default: 5)
* __height__ - Number. Block height (default: 5)
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture entitys using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method pixelate
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
		my.filterFactory.pixelate = function(items, image) {
			var args = my.filterSetup(items, image),
				width = (my.xt(args.items.width)) ? Math.ceil(args.items.width) : 5,
				height = (my.xt(args.items.height)) ? Math.ceil(args.items.height) : 5,
				addAlpha = (my.xt(args.items.includeAlpha)) ? args.items.includeAlpha : false,
				iWidth = args.imgData.width,
				iHeight = args.imgData.height,
				red,
				grn,
				blu,
				alp,
				block,
				count,
				tW,
				tH,
				vol,
				here;
			my.cv.width = iWidth;
			my.cv.height = iHeight;
			my.cvx.putImageData(args.imgData, 0, 0);
			for (var i = 0; i < iHeight; i += height) { //rows (y)
				for (var j = 0; j < iWidth; j += width) { //cols (x)
					red = grn = blu = alp = count = 0;
					tW = (j + width > iWidth) ? iWidth - j : width;
					tH = (i + height > iHeight) ? iHeight - i : height;
					vol = tW * tH * 4;
					block = my.cvx.getImageData(j, i, tW, tH);
					for (var k = 0; k < vol; k += 4) {
						if (block.data[k + 3] > 0) {
							here = k;
							red += block.data[here];
							grn += block.data[++here];
							blu += block.data[++here];
							alp += block.data[++here];
							count++;
						}
					}
					red = Math.floor(red / count);
					grn = Math.floor(grn / count);
					blu = Math.floor(blu / count);
					alp = Math.floor(alp / count);
					my.cvx.fillStyle = (addAlpha) ? 'rgba(' + red + ',' + grn + ',' + blu + ',' + alp + ')' : 'rgb(' + red + ',' + grn + ',' + blu + ')';
					my.cvx.fillRect(j, i, tW, tH);
				}
			}
			args.imgData = my.cvx.getImageData(0, 0, args.imgData.width, args.imgData.height);
			my.filterSave(args);
			return args.imgData;
		};
		my.pushUnique(my.filterFactorynames, 'pixelate');
		/**
Glass Tile filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __width__ - Number. Block width (default: 5)
* __height__ - Number. Block height (default: 5)
* __outerWidth__ - Number. Block width (default: 8)
* __outerHeight__ - Number. Block height (default: 8)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture entitys using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method glassTile
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
		my.filterFactory.glassTile = function(items, image) {
			var args = my.filterSetup(items, image),
				width = (my.xt(args.items.width)) ? Math.ceil(args.items.width) : 5,
				height = (my.xt(args.items.height)) ? Math.ceil(args.items.height) : 5,
				outerWidth = (my.xt(args.items.outerWidth)) ? Math.ceil(args.items.outerWidth) : 8,
				outerHeight = (my.xt(args.items.outerHeight)) ? Math.ceil(args.items.outerHeight) : 8,
				tW,
				tH,
				block;
			my.cv.width = args.imgData.width;
			my.cv.height = args.imgData.height;
			my.cvx.putImageData(args.imgData, 0, 0);
			for (var i = 0; i < args.imgData.height; i += height) { //rows (y)
				for (var j = 0; j < args.imgData.width; j += width) { //cols (x)
					tW = (j + outerWidth > args.imgData.width) ? args.imgData.width - j : outerWidth;
					tH = (i + outerHeight > args.imgData.height) ? args.imgData.height - i : outerHeight;
					my.cvx.drawImage(my.cv, j, i, tW, tH, j, i, width, height);
				}
			}
			args.imgData = my.cvx.getImageData(0, 0, args.imgData.width, args.imgData.height);
			my.filterSave(args);
			return args.imgData;
		};
		my.pushUnique(my.filterFactorynames, 'glassTile');

		return my;
	}(scrawl));
}
