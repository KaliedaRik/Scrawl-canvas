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


// NOTE - setting up multifilters as an ALTERNATIVE to the filters extension - hence the separate library sections for it.
// Core has already been coded up with the required code to integrate multifilters, and to impose the exclusion policy

/**
# scrawlMultiFilters

## Purpose and features

The MultiFilters extension adds a set of filter algorithms to the scrawl-canvas library. These are separate from legacy filters, which will (eventually) be deprecated

@module scrawlMultiFilters
**/

if (window.scrawl && window.scrawl.work.extensions && !window.scrawl.contains(window.scrawl.work.extensions, 'multifilters')) {
	var scrawl = (function(my) {
		'use strict';
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

		if(filter.stencil){
			hostEngine.globalCompositeOperation = 'source-in';
			hostCell.copyCellToSelf(cell);
			hostEngine.globalCompositeOperation = 'source-over';
		}

		// then do filters stuff here
		filter.apply();

		// it's at this point we need to take into account the entity's own GCO
		gco = engine.globalCompositeOperation;
		engine.globalCompositeOperation = ctx.globalCompositeOperation;
		cell.copyCellToSelf(hostCell);
		engine.globalCompositeOperation = gco;
	};

// THIS IS WHERE THE NEW MULTIFILTER CODE WILL START!
// ==================================================


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
			this.definitions = get(items.definitions, []);
			this.currentWidth = 0;
			this.currentHeight = 0;
			this.currentGrid = [];
			this.cache = {};
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
		my.MultiFilter.prototype.classname = 'multifilternames';
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
An object where a filter can cache anything it likes (best practice: use the filter name as the key to whatever object or array the filter stores in the cache) - if changing a filter's attributes dynamically (which Scrawl doesn't handle) then its cache entry in the multifilter will need to be deleted or set to null so that the filter knows it needs to be recreated.
@property cache
@type Object
@default {}
**/
			cache: {},
			/**
An Array of filter definition Objects - each type of filter definition object must include a __filter__ String attribute (eg: 'grayscale'), alongside any specific attributes required by that particular filter. Filters are processed in array order, first to last.
@property definitions
@type Array
@default []
**/
			definitions: []
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
		my.MultiFilter.prototype.apply = function() {
			var canvas, cvx, img, def, filter, buff, data, width, height, j, jz;

			if(this.definitions.length){
				canvas = my.work.cv2;
				cvx = my.work.cvx2;
				img = cvx.getImageData(0, 0, canvas.width, canvas.height);
				buff = img.data.buffer;
				width = img.width;
				height = img.height;
				data = new Uint8ClampedArray(buff);

				if(width !== this.currentWidth || height !== this.currentHeight){
					this.currentWidth = width;
					this.currentHeight = height;
					this.prepareGrid();
				}

				for(j = 0, jz = this.definitions.length; j < jz; j++){
					def = this.definitions[j];
					if(def.filter){
						filter = this.filters[def.filter];
						if(filter){
							filter(width, height, data, def, this);
						}
					}
				}

				cvx.putImageData(img, 0, 0);
			}
			return true;
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

			for(i = 0; i < height; i++){
				row = [];
				for(j = 0; j < width; j++){
					row[j] = counter;
					counter += 4;
				}
				grid[i] = [].concat(row);
			}

			this.currentGrid = grid;
			return true;
		};
		/**
Extract data from the current grid

@method getIndexes
@private
@return Array of Numbers
**/
		my.MultiFilter.prototype.getIndexes = function(col1, row1, col2, row2) {
			var result = [],
				w = this.currentWidth,
				h = this.currentHeight,
				grid = this.currentGrid,
				i, j, temp, lw, lh, r, c;

			if(row1 > row2){
				temp = row1;
				row1 = row2;
				row2 = temp;
			}
			if(col1 > col2){
				temp = col1;
				col1 = col2;
				col2 = temp;
			}
			row1 = (row1 < 0) ? 0 : row1;
			col1 = (col1 < 0) ? 0 : col1;
			row2 = (row2 >= h) ? h - 1 : row2;
			col2 = (col2 >= w) ? w - 1 : col2;

			if(row2 < 0 || col2 < 0 || row1 >= h || col1 >= w){
				return result;
			}

			lw = col2 - col1;
			lh = row2 - row1;

			for(i = 0; i < lh; i++){
				for(j = 0; j < lw; j++){
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

@method getPlusIndexes
@private
@return Array of Numbers
**/
		my.MultiFilter.prototype.getPlusIndexes = function(row, col, radius) {
			var result = [],
				grid = this.currentGrid,
				i;

			if(grid[row] && grid[row][col]){
				result.push(grid[row][col]);
			}
			for(i = 1; i <= radius; i++){
				if(grid[row - i] && grid[row - i][col]){
					result.push(grid[row - 1][col]);
				}
				if(grid[row] && grid[row][col + i]){
					result.push(grid[row][col + i]);
				}
				if(grid[row + i] && grid[row + i][col]){
					result.push(grid[row + i][col]);
				}
				if(grid[row] && grid[row][col - i]){
					result.push(grid[row][col - i]);
				}
			}
			return result;
		};
		/**
Extract data from the current grid

@method getCrossIndexes
@private
@return Array of Numbers
**/
		my.MultiFilter.prototype.getCrossIndexes = function(row, col, radius) {
			var result = [],
				grid = this.currentGrid,
				i;

			if(grid[row] && grid[row][col]){
				result.push(grid[row][col]);
			}
			for(i = 1; i <= radius; i++){
				if(grid[row - i] && grid[row - i][col - i]){
					result.push(grid[row - i][col - i]);
				}
				if(grid[row + i] && grid[row + i][col - i]){
					result.push(grid[row + i][col - i]);
				}
				if(grid[row + i] && grid[row + i][col + i]){
					result.push(grid[row + i][col + i]);
				}
				if(grid[row - i] &&grid[row - i][col + i]){
					result.push(grid[row - i][col + i]);
				}
			}
			return result;
		};
		/**
Extract data from the current grid

@method getHorizontalIndexes
@private
@return Array of Numbers
**/
		my.MultiFilter.prototype.getHorizontalIndexes = function(row, col, radius) {
			var result = [],
				grid = this.currentGrid,
				i;

			if(grid[row] && grid[row][col]){
				result.push(grid[row][col]);
			}
			for(i = 1; i <= radius; i++){
				if(grid[row] && grid[row][col - i]){
					result.push(grid[row][col - i]);
				}
				if(grid[row] && grid[row][col + i]){
					result.push(grid[row][col + i]);
				}
			}
			return result;
		};
		/**
Extract data from the current grid

@method getVerticalIndexes
@private
@return Array of Numbers
**/
		my.MultiFilter.prototype.getVerticalIndexes = function(row, col, radius) {
			var result = [],
				grid = this.currentGrid,
				i;

			if(grid[row] && grid[row][col]){
				result.push(grid[row][col]);
			}
			for(i = 1; i <= radius; i++){
				if(grid[row - i] && grid[row - i][col]){
					result.push(grid[row - i][col]);
				}
				if(grid[row + i] && grid[row + i][col]){
					result.push(grid[row + i][col]);
				}
			}
			return result;
		};
		/**
Perform matrix operations on the image data

@method matrix
@private
@return always true
**/
		my.MultiFilter.prototype.matrix = function(width, height, data, w, h, offsetX, offsetY, weights, cachename) {
			var posR, posG, posB, posA, localA,
				cache, cachelen, wt,
				len = data.length,
				red, green, blue, 
				alphas, counter, alen,
				x1, x2, y1, y2, i, j, k, c;

			if(!this.cache[cachename]){
				cache = this.cache[cachename] = [];
				counter = 0;
				for(i = 0; i < height; i++){
					for(j = 0; j < width; j++){
						x1 = j + offsetX;
						y1 = i + offsetY;
						x2 = x1 + w;
						y2 = y1 + w;
						cache[counter] = this.getIndexes(x1, y1, x2, y2);
						counter++;
					}
				}
			}
			else{
				cache = this.cache[cachename];
			}
			cachelen = cache.length;

			if(weights.length){
				for(posA = 3, c = 0; posA < len; posA +=4, c++){
					if(data[posA]){
						alphas = cache[c];
						alen = alphas.length;
						red = green = blue = counter = 0;

						for(k = 0; k < alen; k++){
							localA = alphas[k];
							if(weights[k] && data[localA]){
								wt = weights[k]
								posR = localA - 3;
								posG = localA - 2;
								posB = localA - 1;
								red += data[posR] * wt;
								green += data[posG] * wt;
								blue += data[posB] * wt;
							}
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
			return true;
		};
		/**
An object containing pre-defined filter functionality.
**/
		my.MultiFilter.prototype.filters = {
			default: function(width, height, data, def, f){},
			grayscale: function(width, height, data, def, f){
				var len, posR, posG, posB, posA, gray;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
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
			sepia: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					r, g, b, red, green, blue;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
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
			invert: function(width, height, data, def, f){
				var len, posR, posG, posB, posA;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] = 256 - data[posR];
						data[posG] = 256 - data[posG];
						data[posB] = 256 - data[posB];
					}
				}
			},
			red: function(width, height, data, def, f){
				var len, posG, posB, posA;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posG = posA - 2;
						posB = posA - 1;
						data[posG] = 0;
						data[posB] = 0;
					}
				}
			},
			green: function(width, height, data, def, f){
				var len, posR, posB, posA;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posB = posA - 1;
						data[posR] = 0;
						data[posB] = 0;
					}
				}
			},
			blue: function(width, height, data, def, f){
				var len, posR, posG, posA;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						data[posR] = 0;
						data[posG] = 0;
					}
				}
			},
			notred: function(width, height, data, def, f){
				var len, posR;

				for(posR = 0, len = data.length; posR < len; posR +=4){
					data[posR] = 0;
				}
			},
			notgreen: function(width, height, data, def, f){
				var len, posG;

				for(posG = 1, len = data.length; posG < len; posG +=4){
					data[posG] = 0;
				}
			},
			notblue: function(width, height, data, def, f){
				var len, posB;

				for(posB = 2, len = data.length; posB < len; posB +=4){
					data[posB] = 0;
				}
			},
			cyan: function(width, height, data, def, f){
				var len, posR, posG, posB, posA, gray;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
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
			magenta: function(width, height, data, def, f){
				var len, posR, posG, posB, posA, gray;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
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
			yellow: function(width, height, data, def, f){
				var len, posR, posG, posB, posA, gray;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
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
			brightness: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					level = (def.level && def.level.toFixed) ? def.level : 1;

				level = (level < 0) ? 0 : level;
				
				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] *= level;
						data[posG] *= level;
						data[posB] *= level;
					}
				}
			},
			saturation: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					level = (def.level && def.level.toFixed) ? def.level : 1;

				level = (level < 0) ? 0 : level;
				
				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] = 127 + ((data[posR] - 127) * level);
						data[posG] = 127 + ((data[posG] - 127) * level);
						data[posB] = 127 + ((data[posB] - 127) * level);
					}
				}
			},
			threshold: function(width, height, data, def, f){
				var len, posR, posG, posB, posA, gray,
					level = (def.level && def.level.toFixed) ? def.level : 0.5;

				if(level < 0 || level > 1){
					level = (level > 0.5) ? 1 : 0;
				}
				level *= 255;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
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
			channels: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					red = (def.red && def.red.toFixed) ? def.red : 1,
					green = (def.green && def.green.toFixed) ? def.green : 1,
					blue = (def.blue && def.blue.toFixed) ? def.blue : 1;

				red = (red < 0) ? 0 : red;
				green = (green < 0) ? 0 : green;
				blue = (blue < 0) ? 0 : blue;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] *= red;
						data[posG] *= green;
						data[posB] *= blue;
					}
				}
			},
			channelstep: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					red = (def.red && def.red.toFixed) ? def.red : 1,
					green = (def.green && def.green.toFixed) ? def.green : 1,
					blue = (def.blue && def.blue.toFixed) ? def.blue : 1,
					floor = Math.floor;

				red = (red < 1) ? 1 : red;
				green = (green < 1) ? 1 : green;
				blue = (blue < 1) ? 1 : blue;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						data[posR] = floor(data[posR] / red) * red;
						data[posG] = floor(data[posG] / green) * green;
						data[posB] = floor(data[posB] / blue) * blue;
					}
				}
			},
			tint: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					redInRed = (def.redInRed && def.redInRed.toFixed) ? def.redInRed : 1,
					redInGreen = (def.redInGreen && def.redInGreen.toFixed) ? def.redInGreen : 0,
					redInBlue = (def.redInBlue && def.redInBlue.toFixed) ? def.redInBlue : 0,
					greenInRed = (def.greenInRed && def.greenInRed.toFixed) ? def.greenInRed : 0,
					greenInGreen = (def.greenInGreen && def.greenInGreen.toFixed) ? def.greenInGreen : 1,
					greenInBlue = (def.greenInBlue && def.greenInBlue.toFixed) ? def.greenInBlue : 0,
					blueInRed = (def.blueInRed && def.blueInRed.toFixed) ? def.blueInRed : 0,
					blueInGreen = (def.blueInGreen && def.blueInGreen.toFixed) ? def.blueInGreen : 0,
					blueInBlue = (def.blueInBlue && def.blueInBlue.toFixed) ? def.blueInBlue : 1,
					r, g, b, red, green, blue;

				redInRed = (redInRed < 0) ? 0 : redInRed;
				redInGreen = (redInGreen < 0) ? 0 : redInGreen;
				redInBlue = (redInBlue < 0) ? 0 : redInBlue;
				greenInRed = (greenInRed < 0) ? 0 : greenInRed;
				greenInGreen = (greenInGreen < 0) ? 0 : greenInGreen;
				greenInBlue = (greenInBlue < 0) ? 0 : greenInBlue;
				blueInRed = (blueInRed < 0) ? 0 : blueInRed;
				blueInGreen = (blueInGreen < 0) ? 0 : blueInGreen;
				blueInBlue = (blueInBlue < 0) ? 0 : blueInBlue;

				for(posA = 3, len = data.length; posA < len; posA +=4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						r = data[posR];
						g = data[posG];
						b = data[posB];
						red = (r * redInRed) + (g * greenInRed) + (b * blueInRed);
						green = (r *redInGreen) + (g * greenInGreen) + (b * blueInGreen);
						blue = (r * redInBlue) + (g * greenInBlue) + (b * blueInBlue);
						data[posR] = red;
						data[posG] = green;
						data[posB] = blue;
					}
				}
			},
			pixelate: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					offsetX = (def.offsetX && def.offsetX.toFixed) ? def.offsetX : 0,
					offsetY = (def.offsetY && def.offsetY.toFixed) ? def.offsetY : 0,
					blockWidth = (def.width && def.width.toFixed) ? def.width : 10,
					blockHeight = (def.height && def.height.toFixed) ? def.height : 10,
					cache, cachelen,
					ceil = Math.ceil,
					blockRows, blockCols,
					red, green, blue, 
					alphas, counter,
					x1, x2, y1, y2, i, j, k, c;

				blockRows = ceil(height / blockHeight);
				blockCols = ceil(width / blockWidth);

				offsetX = (offsetX > blockWidth) ? 0 : offsetX;
				offsetY = (offsetY > blockHeight) ? 0 : offsetY;

				if(!f.cache.pixelate){
					cache = f.cache.pixelate = [];
					counter = 0;
					for(i = -1; i < blockRows; i++){
						for(j = -1; j < blockCols; j++){
							y1 = (i * blockHeight) + offsetY;
							x1 = (j * blockWidth) + offsetX;
							y2 = y1 + blockHeight;
							x2 = x1 + blockWidth;
							cache[counter] = f.getIndexes(x1, y1, x2, y2);
							counter++;
						}
					}
				}
				else{
					cache = f.cache.pixelate;
				}
				cachelen = cache.length;

				for(c = 0; c < cachelen; c++){
					alphas = cache[c];
					len = alphas.length;
					red = green = blue = counter = 0;

					for(k = 0; k < len; k++){
						posA = alphas[k];
						if(data[posA]){
							counter++;
							posR = posA - 3;
							posG = posA - 2;
							posB = posA - 1;
							red += data[posR];
							green += data[posG];
							blue += data[posB];
						}
					}
					if(counter > 0){
						red /= counter;
						green /= counter;
						blue /= counter;
						for(k = 0; k < len; k++){
							posA = alphas[k];
							if(data[posA]){
								posR = posA - 3;
								posG = posA - 2;
								posB = posA - 1;
								data[posR] = red;
								data[posG] = green;
								data[posB] = blue;
							}
						}
					}
				}
			},
			matrix: function(width, height, data, def, f){
				// var posR, posG, posB, posA, localA,
				var	w = (def.width && def.width.toFixed) ? def.width : 0,
					h = (def.height && def.height.toFixed) ? def.height : 0,
					offsetX = (def.offsetX && def.offsetX.toFixed) ? def.offsetX : 0,
					offsetY = (def.offsetY && def.offsetY.toFixed) ? def.offsetY : 0,
					weights = (def.weights && Array.isArray(def.weights)) ? def.weights : [];

				f.matrix(width, height, data, w, h, offsetX, offsetY, weights, 'matrix');
			},
			gaussian1: function(width, height, data, def, f){
				var w = 3,
					h = 3,
					offsetX = -1,
					offsetY = -1,
					weights = [0.077847, 0.123317, 0.077847, 0.123317, 0.195346, 0.123317, 0.077847, 0.123317, 0.077847];

				f.matrix(width, height, data, w, h, offsetX, offsetY, weights, 'gaussian1');
			},
			gaussian2: function(width, height, data, def, f){
				var w = 5,
					h = 5,
					offsetX = -2,
					offsetY = -2,
					weights = [0.003765, 0.015019, 0.023792, 0.015019, 0.003765, 0.015019, 0.059912, 0.094907, 0.059912, 0.015019, 0.023792, 0.094907, 0.150342, 0.094907, 0.023792, 0.015019, 0.059912, 0.094907, 0.059912, 0.015019, 0.003765, 0.015019, 0.023792, 0.015019, 0.003765];

				f.matrix(width, height, data, w, h, offsetX, offsetY, weights, 'gaussian2');
			},
			gaussian3: function(width, height, data, def, f){
				var w = 7,
					h = 7,
					offsetX = -3,
					offsetY = -3,
					weights = [0.000036, 0.000363, 0.001446, 0.002291, 0.001446, 0.000363, 0.000036, 0.000363, 0.003676, 0.014662, 0.023226, 0.014662, 0.003676, 0.000363, 0.001446, 0.014662, 0.058488, 0.092651, 0.058488, 0.014662, 0.001446, 0.002291, 0.023226, 0.092651, 0.146768, 0.092651, 0.023226, 0.002291, 0.001446, 0.014662, 0.058488, 0.092651, 0.058488, 0.014662, 0.001446, 0.000363, 0.003676, 0.014662, 0.023226, 0.014662, 0.003676, 0.000363, 0.000036, 0.000363, 0.001446, 0.002291, 0.001446, 0.000363, 0.000036];

				f.matrix(width, height, data, w, h, offsetX, offsetY, weights, 'gaussian3');
			},
			gaussian4: function(width, height, data, def, f){
				var w = 9,
					h = 9,
					offsetX = -4,
					offsetY = -4,
					weights = [0, 0.000001, 0.000014, 0.000055, 0.000088, 0.000055, 0.000014, 0.000001, 0, 0.000001, 0.000036, 0.000362, 0.001445, 0.002289, 0.001445, 0.000362, 0.000036, 0.000001, 0.000014, 0.000362, 0.003672, 0.014648, 0.023205, 0.014648, 0.003672, 0.000362, 0.000014, 0.000055, 0.001445, 0.014648, 0.058434, 0.092566, 0.058434, 0.014648, 0.001445, 0.000055, 0.000088, 0.002289, 0.023205, 0.092566, 0.146634, 0.092566, 0.023205, 0.002289, 0.000088, 0.000055, 0.001445, 0.014648, 0.058434, 0.092566, 0.058434, 0.014648, 0.001445, 0.000055, 0.000014, 0.000362, 0.003672, 0.014648, 0.023205, 0.014648, 0.003672, 0.000362, 0.000014, 0.000001, 0.000036, 0.000362, 0.001445, 0.002289, 0.001445, 0.000362, 0.000036, 0.000001, 0, 0.000001, 0.000014, 0.000055, 0.000088, 0.000055, 0.000014, 0.000001, 0];

				f.matrix(width, height, data, w, h, offsetX, offsetY, weights, 'gaussian4');
			},
			gaussian5: function(width, height, data, def, f){
				var w = 11,
					h = 11,
					offsetX = -5,
					offsetY = -5,
					weights = [0, 0, 0, 0, 0.000001, 0.000001, 0.000001, 0, 0, 0, 0, 0, 0, 0.000001, 0.000014, 0.000055, 0.000088, 0.000055, 0.000014, 0.000001, 0, 0, 0, 0.000001, 0.000036, 0.000362, 0.001445, 0.002289, 0.001445, 0.000362, 0.000036, 0.000001, 0, 0, 0.000014, 0.000362, 0.003672, 0.014648, 0.023204, 0.014648, 0.003672, 0.000362, 0.000014, 0, 0.000001, 0.000055, 0.001445, 0.014648, 0.058433, 0.092564, 0.058433, 0.014648, 0.001445, 0.000055, 0.000001, 0.000001, 0.000088, 0.002289, 0.023204, 0.092564, 0.146632, 0.092564, 0.023204, 0.002289, 0.000088, 0.000001, 0.000001, 0.000055, 0.001445, 0.014648, 0.058433, 0.092564, 0.058433, 0.014648, 0.001445, 0.000055, 0.000001, 0, 0.000014, 0.000362, 0.003672, 0.014648, 0.023204, 0.014648, 0.003672, 0.000362, 0.000014, 0, 0, 0.000001, 0.000036, 0.000362, 0.001445, 0.002289, 0.001445, 0.000362, 0.000036, 0.000001, 0, 0, 0, 0.000001, 0.000014, 0.000055, 0.000088, 0.000055, 0.000014, 0.000001, 0, 0, 0, 0, 0, 0, 0.000001, 0.000001, 0.000001, 0, 0, 0, 0];

				f.matrix(width, height, data, w, h, offsetX, offsetY, weights, 'gaussian5');
			},
			simpleBlur: function(width, height, data, def, f){
				var len, posR, posG, posB, posA,
					radius = (def.radius && def.radius.toFixed) ? def.radius : 0,
					blurType = (def.blurType && ['plus', 'cross', 'vertical', 'horizontal'].indexOf(def.blurType) >= 0) ? def.blurType : 'plus',
					cache, cachelen,
					red, green, blue, 
					alphas, counter,
					generator,
					i, j, k, c;

				if(!f.cache.simpleBlur){
					cache = f.cache.simpleBlur = [];

					switch(blurType){
						case 'cross' :
							generator = 'getCrossIndexes';
							break;
						case 'horizontal' :
							generator = 'getHorizontalIndexes';
							break;
						case 'vertical' :
							generator = 'getVerticalIndexes';
							break;
						default :
							generator = 'getPlusIndexes';
					}
					
					counter = 0;
					for(i = 0; i < height; i++){
						for(j = 0; j < width; j++){
							cache[counter] = f[generator](j, i, radius);
							counter++;
						}
					}
				}
				else{
					cache = f.cache.simpleBlur;
				}
				cachelen = cache.length;

				for(c = 0; c < cachelen; c++){
					alphas = cache[c];
					len = alphas.length;
					red = green = blue = counter = 0;

					for(k = 0; k < len; k++){
						posA = alphas[k];
						if(data[posA]){
							counter++;
							posR = posA - 3;
							posG = posA - 2;
							posB = posA - 1;
							red += data[posR];
							green += data[posG];
							blue += data[posB];
						}
					}
					if(counter > 0){
						red /= counter;
						green /= counter;
						blue /= counter;
						for(k = 0; k < len; k++){
							posA = alphas[k];
							if(data[posA]){
								posR = posA - 3;
								posG = posA - 2;
								posB = posA - 1;
								data[posR] = red;
								data[posG] = green;
								data[posB] = blue;
							}
						}
					}
				}
			},
		};






		// REMEMBER - CODE BELOW HERE REQUIRED TO COMPLETE THE EXTENSION
		// =============================================================

		return my;
	}(scrawl));
}
