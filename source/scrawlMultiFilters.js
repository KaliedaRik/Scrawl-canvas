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
# scrawlMultiFilters

## Purpose and features

The MultiFilters extension adds a set of filter algorithms to the scrawl-canvas library.

@module scrawlMultiFilters
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'multifilters')) {
	var scrawl = (function(my) {
		'use strict';

		// polyfill
		if (!Uint8ClampedArray.prototype.slice) {
			Object.defineProperty(Uint8ClampedArray.prototype, 'slice', {
				value: Array.prototype.slice
			});
		}

		/**
# window.scrawl

scrawlMultiFilters extension adaptions to the scrawl-canvas library object

## New library sections

* scrawl.multifilter - for multifilter objects

### Hidden canvas

makes use of the default hidden canvases:
my.work.cv = my.canvas.defaultHiddenCanvasElement_base;
my.work.cvx = my.context.defaultHiddenCanvasElement_base;
my.work.cvmodel = my.ctx.defaultHiddenCanvasElement_base;
my.work.cvwrapper = my.cell.defaultHiddenCanvasElement_base;
my.work.cvcontroller = my.pad.defaultHiddenCanvasElement;
my.work.cv2 = my.canvas.defaultHiddenCanvasElement;
my.work.cvx2 = my.context.defaultHiddenCanvasElement;
my.work.cvmodel2 = my.ctx.defaultHiddenCanvasElement;
my.work.cvwrapper2 = my.cell.defaultHiddenCanvasElement;



@class window.scrawl_MultiFilters
**/
		my.pushUnique(my.work.sectionlist, 'multifilter');
		my.pushUnique(my.work.nameslist, 'multifilternames');
		my.work.multiFilterActiveFlag = false;

		/**
A __factory__ function to generate new Filter objects
@method makeFilter
@param {Object} items Key:value Object argument for setting attributes
@return Multifilter object
**/
		my.makeFilter = function(items) {
			return new my.Filter(items);
		};
		/**
A __factory__ function to generate new Multifilter objects
@method makeMultiFilter
@param {Object} items Key:value Object argument for setting attributes
@return Multifilter object
**/
		my.makeMultiFilter = function(items) {
			return new my.MultiFilter(items);
		};
		/**
MULTIFILTERNAME String, to be applied to this entity
@property Entity.multiFilter
@type String
@default ''
**/
		my.work.d.Entity.multiFilter = '';
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
		/**
Group constructor hook function - modified by multiFilter module

Adds the multiFilter, filterOnStroke and filterLevel attributes to Group objects
@method multifiltersGroupInit
@private
**/
		my.Group.prototype.multifiltersGroupInit = function(items) {
			items = my.safeObject(items);
			this.multiFilter = (my.xt(items.multiFilter)) ? items.multiFilter : '';
		};
		/**
Entity constructor hook function - modified by multiFilter module

Adds the multiFilter, filterOnStroke and filterLevel attributes to Entity objects
@method multifiltersEntityInit
@private
**/
		my.Entity.prototype.multifiltersEntityInit = function(items) {
			items = my.safeObject(items);
			this.multiFilter = (my.xt(items.multiFilter)) ? items.multiFilter : '';
		};
		/**
Group.stamp hook function - modified by multifilters extension
@method stampMultifilter
@private
**/
		my.Group.prototype.stampMultifilter = function(engine, cell) {
			var filter = my.multifilter[this.multiFilter],
				work = my.work,
				hostCanvas = work.cv,
				hostCell = work.cvwrapper,
				hostCtx = my.work.cvmodel,
				hostEngine = my.work.cvx;

			if (filter.stencil) {
				hostEngine.globalCompositeOperation = 'source-in';
				hostCell.copyCellToSelf(cell);
				hostEngine.globalCompositeOperation = 'source-over';
			}

			filter.apply(my.work.cv, my.work.cvx);
			engine.setTransform(1, 0, 0, 1, 0, 0);
			engine.drawImage(hostCanvas, 0, 0);
		};
		/**
Entity.stamp hook function - modified by multifilters extension
@method stampMultifilter
@private
**/
		my.Entity.prototype.stampMultifilter = function(engine, cell) {
			var filter = my.multifilter[this.multiFilter],
				work = my.work,
				hostCanvas = work.cv2,
				hostCell = work.cvwrapper2,
				hostCtx = my.work.cvmodel2,
				hostEngine = my.work.cvx2,
				gco,
				ctx = my.ctx[this.name];

			if (filter.stencil) {
				hostEngine.globalCompositeOperation = 'source-in';
				hostCell.copyCellToSelf(cell);
				hostEngine.globalCompositeOperation = 'source-over';
			}

			filter.apply(my.work.cv2, my.work.cvx2);
			gco = engine.globalCompositeOperation;
			engine.setTransform(1, 0, 0, 1, 0, 0);
			engine.globalCompositeOperation = ctx.globalCompositeOperation;
			engine.drawImage(hostCanvas, 0, 0);
			engine.globalCompositeOperation = gco;
		};

		/**
# Filter

## Instantiation

* scrawl.makeFilter()

## Purpose

* Defines a filter effect, for use in a MultiFilter definitions Array attribute

## Access

* not stored in Scrawl library, accessible via MultiFilter.definitions

@class Filter
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Filter = function Filter(items) {
			var get = my.xtGet;
			items = my.safeObject(items);
			this.name = get(items.name, 'generic');
			this.multiFilter = get(items.multiFilter, '');
			this.species = get(items.species, 'undefined');
			this.level = get(items.level, 0);
			this.red = get(items.red, 0);
			this.green = get(items.green, 0);
			this.blue = get(items.blue, 0);
			this.redInRed = get(items.redInRed, 0);
			this.redInGreen = get(items.redInGreen, 0);
			this.redInBlue = get(items.redInBlue, 0);
			this.greenInRed = get(items.greenInRed, 0);
			this.greenInGreen = get(items.greenInGreen, 0);
			this.greenInBlue = get(items.greenInBlue, 0);
			this.blueInRed = get(items.blueInRed, 0);
			this.blueInGreen = get(items.blueInGreen, 0);
			this.blueInBlue = get(items.blueInBlue, 0);
			this.offsetX = get(items.offsetX, 0);
			this.offsetY = get(items.offsetY, 0);
			this.blockWidth = get(items.blockWidth, 0);
			this.blockHeight = get(items.blockHeight, 0);
			this.weights = get(items.weights, []);
			this.normalize = get(items.normalize, false);
			this.radius = get(items.radius, 0);
			this.step = get(items.step, 1);
			this.wrap = get(items.wrap, false);
			if (items.ranges) {
				this.setRanges(items.ranges);
			}
			this.cacheAction = get(items.cacheAction, false);
			this.action = get(items.action, false);
			return this;
		};
		my.Filter.prototype = Object.create(Object.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.Filter.prototype.type = 'Filter';
		my.work.d.Filter = {
			multiFilter: '',
			species: '',
			level: 0,
			red: 0,
			green: 0,
			blue: 0,
			redInRed: 0,
			redInGreen: 0,
			redInBlue: 0,
			greenInRed: 0,
			greenInGreen: 0,
			greenInBlue: 0,
			blueInRed: 0,
			blueInGreen: 0,
			blueInBlue: 0,
			offsetX: 0,
			offsetY: 0,
			blockWidth: 0,
			blockHeight: 0,
			weights: [],
			normalize: false,
			wrap: false,
			step: 1,
			radius: 0,
			ranges: [],
			action: false,
			cacheAction: false
		};


		my.Filter.prototype.set = function(items) {
			var d = my.work.d.Filter,
				xt = my.xt;
			for (var i in items) {
				if (i === 'ranges') {
					this.setRanges(items[i]);
				}
				else if (xt(d[i])) {
					this[i] = items[i];
				}
			}
			return this;
		};
		my.Filter.prototype.setRanges = function(item) {
			var result = [],
				range, i, iz;
			if (Array.isArray(item)) {
				for (var i = 0, iz = item.length; i < iz; i++) {
					range = item[i];
					if (range.length === 6) {
						result.push(new Uint8ClampedArray(range));
					}
				}
			}
			this.ranges = [];
			if (result.length) {
				this.ranges = result;
			}
			return this;
		};


		my.Filter.prototype.clone = function(items) {
			var merged = my.mergeOver(JSON.parse(JSON.stringify(this)), my.safeObject(items));
			return new my.Filter(merged);
		};


		my.Filter.prototype.update = function() {
			var m = my.multifilter[this.multiFilter];
			if (m) {
				this.width = m.currentWidth;
				this.height = m.currentHeight;
				this.area = m.currentArea;
				this.cache = false;
			}
		};


		my.Filter.prototype.prepare = function() {
			if (this.checkCache[this.species]) {
				this.checkCache[this.species].call(this);
			}
			if (this.cacheAction) {
				this.cacheAction();
			}
		};


		my.Filter.prototype.do = function(data) {
			if (this.f[this.species]) {
				this.f[this.species].call(this, data);
			}
			if (this.action) {
				this.action(data);
			}
		};



		/**
An object containing pre-defined filter functionality.
**/
		my.Filter.prototype.checkCache = {
			pixelate: function() {
				var cache = this.cache,
					rows, h, cols, w, ceil,
					segment,
					x, y,
					multi, get, res, c,
					i, j, x1, x2, y1, y2;

				if (!cache) {
					multi = my.multifilter[this.multiFilter];
					if (multi) {
						w = this.blockWidth || 1;
						h = this.blockHeight || 1;
						ceil = Math.ceil;
						cols = ceil(multi.currentWidth / w);
						rows = ceil(multi.currentHeight / h);

						x = this.offsetX || 0;
						x = (x > w) ? 0 : x;
						y = this.offsetY || 0;
						y = (y > h) ? 0 : y;

						segment = this.segment = w * h;

						cache = new Uint32Array((cols + 1) * (rows + 1) * segment);
						c = 0;
						get = multi.getIndexes;

						for (i = -1; i < rows; i++) {
							for (j = -1; j < cols; j++) {
								y1 = (i * h) + y;
								x1 = (j * w) + x;
								y2 = y1 + h;
								x2 = x1 + w;
								res = get.call(multi, x1, y1, x2, y2);
								cache.set(res, c);
								c += segment;
							}
						}
						this.cache = cache;
					}
				}
			},
			matrix: function() {
				var cache = this.cache,
					multi, get, c, wrap,
					w, cw, h, ch, x, y,
					i, j, x1, x2, y1, y2;

				if (!cache) {
					multi = my.multifilter[this.multiFilter];
					if (multi) {
						w = this.blockWidth || 1;
						h = this.blockHeight || 1;
						x = this.offsetX || 0;
						y = this.offsetY || 0;
						wrap = this.wrap || false;
						cw = multi.currentWidth;
						ch = multi.currentHeight;

						cache = [];
						c = 0;
						get = (wrap) ? multi.getWrappedIndexes : multi.getIndexes;

						for (i = 0; i < ch; i++) {
							for (j = 0; j < cw; j++) {
								y1 = i + y;
								x1 = j + x;
								y2 = y1 + h;
								x2 = x1 + w;
								cache[c] = get.call(multi, x1, y1, x2, y2);
								c++;
							}
						}
						this.cache = cache;
					}
				}
			},
			blur: function() {
				var cache = this.cache,
					multi, get, c, wrap,
					w, cw, h, ch, x, y, r,
					i, j, x1, x2, y1, y2;

				if (!cache) {
					multi = my.multifilter[this.multiFilter];
					if (multi) {
						r = this.radius || 0;
						wrap = this.wrap || false;
						cw = multi.currentWidth;
						ch = multi.currentHeight;

						cache = [];
						cache[0] = [];
						cache[1] = [];
						get = (wrap) ? multi.getWrappedIndexes : multi.getIndexes;

						// horizontal sweep
						c = 0;
						w = (r * 2) + 1;
						h = 1;
						x = -r;
						y = 0;
						for (i = 0; i < ch; i++) {
							for (j = 0; j < cw; j++) {
								y1 = i + y;
								x1 = j + x;
								y2 = y1 + h;
								x2 = x1 + w;
								cache[0][c] = get.call(multi, x1, y1, x2, y2);
								c++;
							}
						}

						// vertical sweep
						c = 0;
						w = 1;
						h = (r * 2) + 1;
						x = 0;
						y = -r;
						for (i = 0; i < ch; i++) {
							for (j = 0; j < cw; j++) {
								y1 = i + y;
								x1 = j + x;
								y2 = y1 + h;
								x2 = x1 + w;
								cache[1][c] = get.call(multi, x1, y1, x2, y2);
								c++;
							}
						}
						this.cache = cache;
					}
				}
			},
		};


		my.Filter.prototype.f = {
			default: function(data) {},
			grayscale: function(data) {
				var len, posR, posG, posB, posA, gray;
				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						gray = (0.2126 * data[posR]) + (0.7152 * data[posG]) + (0.0722 * data[posB]);
						data[posR] = gray;
						data[posG] = gray;
						data[posB] = gray;
					}
				}
			},
			sepia: function(data) {
				var len, posR, posG, posB, posA,
					r, g, b, red, green, blue;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						r = data[posR];
						g = data[posG];
						b = data[posB];
						red = (r * 0.393) + (g * 0.769) + (b * 0.189);
						green = (r * 0.349) + (g * 0.686) + (b * 0.168);
						blue = (r * 0.272) + (g * 0.534) + (b * 0.131);
						data[posR] = red;
						data[posG] = green;
						data[posB] = blue;
					}
				}
			},
			invert: function(data) {
				var len, posR, posG, posB, posA;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] = 256 - data[posR];
						data[posG] = 256 - data[posG];
						data[posB] = 256 - data[posB];
					}
				}
			},
			red: function(data) {
				var len, posG, posB, posA;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posG = posA - 2;
						posB = posA - 1;
						data[posG] = 0;
						data[posB] = 0;
					}
				}
			},
			green: function(data) {
				var len, posR, posB, posA;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posB = posA - 1;
						data[posR] = 0;
						data[posB] = 0;
					}
				}
			},
			blue: function(data) {
				var len, posR, posG, posA;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						data[posR] = 0;
						data[posG] = 0;
					}
				}
			},
			notred: function(data) {
				var len, posR;

				for (posR = 0, len = data.length; posR < len; posR += 4) {
					data[posR] = 0;
				}
			},
			notgreen: function(data) {
				var len, posG;

				for (posG = 1, len = data.length; posG < len; posG += 4) {
					data[posG] = 0;
				}
			},
			notblue: function(data) {
				var len, posB;

				for (posB = 2, len = data.length; posB < len; posB += 4) {
					data[posB] = 0;
				}
			},
			cyan: function(data) {
				var len, posR, posG, posB, posA, gray;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						gray = (data[posG] + data[posB]) / 2;
						data[posR] = 0;
						data[posG] = gray;
						data[posB] = gray;
					}
				}
			},
			magenta: function(data) {
				var len, posR, posG, posB, posA, gray;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						gray = (data[posR] + data[posB]) / 2;
						data[posR] = gray;
						data[posG] = 0;
						data[posB] = gray;
					}
				}
			},
			yellow: function(data) {
				var len, posR, posG, posB, posA, gray;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						gray = (data[posG] + data[posR]) / 2;
						data[posR] = gray;
						data[posG] = gray;
						data[posB] = 0;
					}
				}
			},
			brightness: function(data) {
				var len, posR, posG, posB, posA,
					level = this.level || 0;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] *= level;
						data[posG] *= level;
						data[posB] *= level;
					}
				}
			},
			saturation: function(data) {
				var len, posR, posG, posB, posA,
					level = this.level || 0;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] = 127 + ((data[posR] - 127) * level);
						data[posG] = 127 + ((data[posG] - 127) * level);
						data[posB] = 127 + ((data[posB] - 127) * level);
					}
				}
			},
			threshold: function(data) {
				var len, posR, posG, posB, posA, gray,
					level = this.level || 0;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						gray = (0.2126 * data[posR]) + (0.7152 * data[posG]) + (0.0722 * data[posB]);
						gray = (gray > level) ? 255 : 0;
						data[posR] = gray;
						data[posG] = gray;
						data[posB] = gray;
					}
				}
			},
			channels: function(data) {
				var len, posR, posG, posB, posA,
					red = this.red || 0,
					green = this.green || 0,
					blue = this.blue || 0;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] *= red;
						data[posG] *= green;
						data[posB] *= blue;
					}
				}
			},
			channelstep: function(data) {
				var len, posR, posG, posB, posA,
					red = this.red || 1,
					green = this.green || 1,
					blue = this.blue || 1,
					floor = Math.floor;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] = floor(data[posR] / red) * red;
						data[posG] = floor(data[posG] / green) * green;
						data[posB] = floor(data[posB] / blue) * blue;
					}
				}
			},
			tint: function(data) {
				var len, posR, posG, posB, posA, r, g, b,
					redInRed = this.redInRed || 0,
					redInGreen = this.redInGreen || 0,
					redInBlue = this.redInBlue || 0,
					greenInRed = this.greenInRed || 0,
					greenInGreen = this.greenInGreen || 0,
					greenInBlue = this.greenInBlue || 0,
					blueInRed = this.blueInRed || 0,
					blueInGreen = this.blueInGreen || 0,
					blueInBlue = this.blueInBlue || 0;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						r = data[posR];
						g = data[posG];
						b = data[posB];
						data[posR] = (r * redInRed) + (g * greenInRed) + (b * blueInRed);
						data[posG] = (r * redInGreen) + (g * greenInGreen) + (b * blueInGreen);
						data[posB] = (r * redInBlue) + (g * greenInBlue) + (b * blueInBlue);
					}
				}
			},
			pixelate: function(data) {
				var cache = this.cache,
					segment = this.segment,
					blocks = cache.length / segment,
					red, green, blue,
					pos, alphas, counter, k, c;

				for (c = 0; c < blocks; c++) {
					pos = c * segment;
					alphas = cache.slice(pos, pos + segment);
					red = green = blue = counter = 0;

					for (k = 0; k < segment; k++) {
						pos = alphas[k];
						if (!pos) {
							break;
						}
						if (data[pos]) {
							counter++;
							pos -= 3;
							red += data[pos++];
							green += data[pos++];
							blue += data[pos];
						}
					}
					if (counter > 0) {
						red /= counter;
						green /= counter;
						blue /= counter;
						for (k = 0; k < segment; k++) {
							pos = alphas[k];
							if (!pos) {
								break;
							}
							if (data[pos]) {
								pos -= 3
								data[pos++] = red;
								data[pos++] = green;
								data[pos] = blue;
							}
						}
					}
				}
			},
			matrix: function(data) {
				var cache = this.cache,
					datalen = data.length,
					red, green, blue,
					posR, posG, posB, posA, localA,
					alphas, len,
					weights = this.weights,
					norm = this.normalize || false,
					wt, k, c, total, temp;

				if (weights.length) {
					temp = data.slice();
					for (posA = 3, c = 0; posA < datalen; posA += 4, c++) {
						if (data[posA]) {
							alphas = cache[c];
							len = alphas.length;
							red = green = blue = total = 0;

							for (k = 0; k < len; k++) {
								localA = alphas[k];
								if (weights[k] && temp[localA]) {
									wt = weights[k]
									posR = localA - 3;
									posG = localA - 2;
									posB = localA - 1;
									red += temp[posR] * wt;
									green += temp[posG] * wt;
									blue += temp[posB] * wt;
									total += wt;
								}
							}
							if (norm && total) {
								red /= total;
								green /= total;
								blue /= total;
							}
							posR = posA - 3;
							posG = posA - 2;
							posB = posA - 1;
							data[posR] = red;
							data[posG] = green;
							data[posB] = blue;
						}
					}
				}
			},
			blur: function(data) {
				var cache,
					datalen = data.length,
					red, green, blue,
					posR, posG, posB, posA, localA,
					alphas, len,
					step = this.step || 1,
					k, c, counter, temp;

				cache = this.cache[0],
				temp = data.slice();
				for (posA = 3, c = 0; posA < datalen; posA += 4, c++) {
					if (data[posA]) {
						alphas = cache[c];
						len = alphas.length;
						red = green = blue = counter = 0;

						for (k = 0; k < len; k += step) {
							localA = alphas[k];
							if (temp[localA]) {
								posR = localA - 3;
								posG = localA - 2;
								posB = localA - 1;
								red += temp[posR];
								green += temp[posG];
								blue += temp[posB];
								counter++;
							}
						}
						if (counter) {
							red /= counter;
							green /= counter;
							blue /= counter;
							posR = posA - 3;
							posG = posA - 2;
							posB = posA - 1;
							data[posR] = red;
							data[posG] = green;
							data[posB] = blue;
						}
					}
				}

				cache = this.cache[1],
				temp = data.slice();
				for (posA = 3, c = 0; posA < datalen; posA += 4, c++) {
					if (data[posA]) {
						alphas = cache[c];
						len = alphas.length;
						red = green = blue = counter = 0;

						for (k = 0; k < len; k += step) {
							localA = alphas[k];
							if (temp[localA]) {
								posR = localA - 3;
								posG = localA - 2;
								posB = localA - 1;
								red += temp[posR];
								green += temp[posG];
								blue += temp[posB];
								counter++;
							}
						}
						if (counter) {
							red /= counter;
							green /= counter;
							blue /= counter;
							posR = posA - 3;
							posG = posA - 2;
							posB = posA - 1;
							data[posR] = red;
							data[posG] = green;
							data[posB] = blue;
						}
					}
				}
			},
			chroma: function(data) {
				var pos, posA, len,
					ranges = this.ranges,
					range, min, max, val,
					i, iz, flag;

				for (posA = 3, len = data.length; posA < len; posA += 4) {
					if (data[posA]) {
						flag = false;
						for (i = 0, iz = ranges.length; i < iz; i++) {
							range = ranges[i];
							min = range[2];
							pos = posA - 1;
							val = data[pos];
							if (val >= min) {
								max = range[5];
								if (val <= max) {
									min = range[1];
									pos--;
									val = data[pos];
									if (val >= min) {
										max = range[4];
										if (val <= max) {
											min = range[0];
											pos--;
											val = data[pos];
											if (val >= min) {
												max = range[3];
												if (val <= max) {
													flag = true;
													break;
												}
											}
										}
									}
								}
							}
						}
						if (flag) {
							data[posA] = 0;
						}
					}
				}
			},
		};


		/**
# Multifilter

## Instantiation

* scrawl.makeMultifilter()

## Purpose

* Adds a filter effect to an Entity or cell

## Access

* scrawl.multifilter.MULTIFILTERNAME - for the Multifilter object

@class Multifilter
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.MultiFilter = function MultiFilter(items) {
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.stencil = get(items.stencil, false);
			this.filters = [].concat(get(items.filters, []));
			this.currentWidth = 0;
			this.currentHeight = 0;
			this.currentArea = 0;
			this.currentGrid = [];
			my.multifilter[this.name] = this;
			my.pushUnique(my.multifilternames, this.name);
			return this;
		};
		my.MultiFilter.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'MultiFilter'
@final
**/
		my.MultiFilter.prototype.type = 'MultiFilter';
		my.MultiFilter.prototype.lib = 'multifilter';
		my.MultiFilter.prototype.libName = 'multifilternames';
		my.work.d.MultiFilter = {
			/**
Whether to treat the entity or cell being filtered as a stencil (true) in which case the background behind the stencil is filtered, or just filter the entity itself (the default setting)
@property stencil
@type Boolean
@default false
**/
			stencil: false,
			/**
An array of arrays representing the index values for all alpha channel pixels in the canvas
@property currentGrid
@type Array
@private
@default []
**/
			currentGrid: [],
			/**
Latest canvas width
@property currentWidth
@type Number
@private
@default 0
**/
			currentWidth: 0,
			/**
Latest canvas height
@property currentHeight
@type Number
@private
@default 0
**/
			currentHeight: 0,
			/**
Latest canvas area
@property currentArea
@type Number
@private
@default 0
**/
			currentArea: 0,
			/**
An Array of filter definition Objects - each type of filter definition object must include a __filter__ String attribute (eg: 'grayscale'), alongside any specific attributes required by that particular filter. Filters are processed in array order, first to last.
@property filters
@type Array
@default []
**/
			filters: []
		};
		my.mergeInto(my.work.d.MultiFilter, my.work.d.Base);
		/**
multifilter main function:
- prepare data from my.canvas.defaultHiddenCanvasElement
- sort filters (if required)
- iterate through filters, applying algorithms to data
- recreate filtered data in my.canvas.defaultHiddenCanvasElement

@method apply
@private
@return always true
**/
		my.MultiFilter.prototype.apply = function(canvas, cvx) {
			var img, def, filter, buff, data, width, height, j, jz;

			if (this.filters.length) {
				width = canvas.width;
				height = canvas.height;

				if (width !== this.currentWidth || height !== this.currentHeight) {
					this.currentWidth = width;
					this.currentHeight = height;
					this.currentArea = width * height;
					this.prepareGrid();
					this.updateFilters();
				}

				img = cvx.getImageData(0, 0, canvas.width, canvas.height);
				buff = img.data.buffer;
				data = new Uint8ClampedArray(buff);

				for (j = 0, jz = this.filters.length; j < jz; j++) {
					filter = this.filters[j];
					filter.prepare()
					filter.do(data);
				}
				cvx.putImageData(img, 0, 0);
			}
		};
		/**
Create a reference grid, for use by certain filters:

@method prepareGrid
@private
@return always true
**/
		my.MultiFilter.prototype.prepareGrid = function() {
			var counter = 3,
				height = this.currentHeight,
				width = this.currentWidth,
				grid = [],
				row, i, j;

			for (i = 0; i < height; i++) {
				row = [];
				for (j = 0; j < width; j++) {
					row[j] = counter;
					counter += 4;
				}
				grid[i] = row;
			}

			this.currentGrid = grid;
			return true;
		};
		/**
Augments Base.set

@method set
@return this
**/
		my.MultiFilter.prototype.set = function(items) {
			var xt = my.xt;
			items = my.safeObject(items);
			my.Base.prototype.set.call(this, items);
			if (xt(items.filters)) {
				this.filters = [].concat(items.filters);
				this.updateFilters();
			}
		};
		/**
Force filters to update:

@method updateFilters
@private
@return always true
**/
		my.MultiFilter.prototype.updateFilters = function() {
			for (var i = 0, iz = this.filters.length; i < iz; i++) {
				this.filters[i].update();
			}
			return true;
		};
		/**
Extract data from the current grid

@method getIndexes
@private
@return Array of Numbers
**/
		my.MultiFilter.prototype.getIndexes = function(col1, row1, col2, row2) {
			var result,
				w = this.currentWidth,
				h = this.currentHeight,
				grid = this.currentGrid,
				i, j, temp, lw, lh, r, c;

			if (row1 > row2) {
				temp = row1;
				row1 = row2;
				row2 = temp;
			}
			if (col1 > col2) {
				temp = col1;
				col1 = col2;
				col2 = temp;
			}
			row1 = (row1 < 0) ? 0 : row1;
			col1 = (col1 < 0) ? 0 : col1;
			row2 = (row2 >= h) ? h - 1 : row2;
			col2 = (col2 >= w) ? w - 1 : col2;

			if (row2 < 0 || col2 < 0 || row1 >= h || col1 >= w) {
				return [];
			}

			lw = col2 - col1;
			lh = row2 - row1;
			result = [];

			for (i = 0; i < lh; i++) {
				for (j = 0; j < lw; j++) {
					r = row1 + i;
					c = col1 + j;
					temp = (i * lw) + j;
					result[temp] = grid[r][c];
				}
			}

			return result;
		};
		/**
Extract data from the current grid

@method getWrappedIndexes
@private
@return Array of Numbers
**/
		my.MultiFilter.prototype.getWrappedIndexes = function(col1, row1, col2, row2) {
			var result,
				w = this.currentWidth,
				h = this.currentHeight,
				grid = this.currentGrid,
				i, j, temp, lw, lh, r, c;

			if (row1 > row2) {
				temp = row1;
				row1 = row2;
				row2 = temp;
			}
			if (col1 > col2) {
				temp = col1;
				col1 = col2;
				col2 = temp;
			}

			if (row2 < 0 || col2 < 0 || row1 >= h || col1 >= w) {
				return [];
			}

			lw = col2 - col1;
			lh = row2 - row1;
			result = [];

			for (i = 0; i < lh; i++) {
				for (j = 0; j < lw; j++) {
					r = row1 + i;
					c = col1 + j;
					if (r < 0 || r >= h) {
						r = (r < 0) ? r + h : r - h;
					}
					if (c < 0 || c >= w) {
						c = (c < 0) ? c + w : c - w;
					}
					temp = (i * lw) + j;
					result[temp] = grid[r][c];
				}
			}

			return result;
		};
		
		return my;
	}(scrawl));
}
