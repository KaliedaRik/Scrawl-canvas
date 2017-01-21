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

		// polyfill
		if (!Uint8ClampedArray.prototype.slice) {
			Object.defineProperty(Uint8ClampedArray.prototype, 'slice', {
				value: Array.prototype.slice
			});
		}

		// detect and establish (if possible) filter web workers
		my.work.worker = !!window.Worker;
		if(my.work.worker && my.work.promise){
			my.FilterWorkPool = function FilterWorkPool(){
				this.file = my.work.currentPath + 'scrawlMultiFiltersWorkers' + ((my.work.currentPathMinified) ? '-min' : '') + '.js';
				this.workers = {};
				this.availableWorkers = [];
			};
			my.FilterWorkPool.prototype = Object.create(Object.prototype);
			my.FilterWorkPool.prototype.setMaxWorkers = function(item){
				if(item && item.toFixed){
					my.work.filterWorkPoolMax = item;
				}
				return this;
			};
			my.FilterWorkPool.prototype.currentWorkers = function(){
				return Object.keys(this.workers).length;
			};
			my.FilterWorkPool.prototype.hasAvailableWorker = function(){
				return (this.availableWorkers.length) ? true : false;
			};
			my.FilterWorkPool.prototype.create = function(items){
				var that = this;
				return new Promise(function(resolve, reject){
					var uuid;
					if(Object.keys(that.workers).length < my.work.filterWorkPoolMax){
						uuid = my.generateUuid();
					}
					reject(new Error('worker create - uuid would have been: ' + uuid));
				});
			};
			my.FilterWorkPool.prototype.acquire = function(items){
				var that = this;
				return new Promise(function(resolve, reject){
					reject(new Error('worker acquire - not yet coded up'));
				});
			};
			my.FilterWorkPool.prototype.release = function(items){
				var that = this;
				return new Promise(function(resolve, reject){
					reject(new Error('worker release - not yet coded up'));
				});
			};
			my.FilterWorkPool.prototype.kill = function(items){
				var that = this;
				return new Promise(function(resolve, reject){
					reject(new Error('worker kill - not yet coded up'));
				});
			};

			my.work.filterWorkPool = new my.FilterWorkPool();
			my.work.filterWorkPoolMax = 8;
		}
		else{
			my.work.filterWorkPool = false;
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
			this.wrap = get(items.wrap, false);
			this.useWorker = false;
			if(items.useWorker){
				this.addWorker();
			}
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
			radius: 0,
		};
		my.Filter.prototype.set = function(items) {
			var d = my.work.d.Filter,
				xt = my.xt;
			for (var i in items) {
				if (xt(d[i])) {
					this[i] = items[i];
				}
			}
			return this;
		};
		my.Filter.prototype.addWorker = function() {
			var pool, data, m,
				that = this;
			if(my.work.promise){
				if(my.work.worker && my.work.filterWorkPool){
					pool = my.work.filterWorkPool;
					data = JSON.parse(JSON.stringify(that));
					m = my.multifilter[that.multiFilter];that
					if(m){
						data.currentWidth = m.currentWidth;
						data.currentHeight = m.currentHeight;
						data.currentGrid = m.currentGrid;
					}
					if(pool.hasAvailableWorker()){
						// use an available worker
						pool.acquire(data)
						.then(function(res){
							console.log(that.species + ':' + that.name + ' - scrawl.Filter.addWorker - using ' + res.id + ' via acquire');
							that.useWorker = res;
							return that;
						})
						.catch(function(err){
							console.log(that.species + ':' + that.name + ' - scrawl.Filter.addWorker error 1 - failed to acquire a web worker - ' + err.message);
							that.useWorker = false;
							return that;
						});
					}
					else if(pool.currentWorkers() <= my.work.filterWorkPoolMax){
						// create a new Worker
						pool.create()
						.then(function(res){
							console.log(that.species + ':' + that.name + ' - ' + res);
							return pool.acquire(data);
						})
						.then(function(res){
							console.log(that.species + ':' + that.name + ' - scrawl.Filter.addWorker - using ' + res.id + ' via create/acquire');
							that.useWorker = res;
							return that;
						})
						.catch(function(err){
							console.log(that.species + ':' + that.name + ' - scrawl.Filter.addWorker error 2 - failed to create a web worker - ' + err.message);
							that.useWorker = false;
							return that;
						});
					}
					else{
						// no worker available
						console.log(that.species + ':' + that.name + ' - scrawl.Filter.addWorker error 3 - no available workers, pool at max');
						that.useWorker = false;
						return that;
					}
				}
			}
			else{
				return that;
			}
		};
		my.Filter.prototype.clone = function(items) {
			var merged = my.mergeOver(JSON.parse(JSON.stringify(this)), my.safeObject(items));
			return new my.Filter(merged);
		};
		my.Filter.prototype.update = function() {
			var m = my.multifilter[this.multiFilter];
			if(m){
				if(this.useWorker){
					this.updateWorker(m);
				}
				else{
					this.width = m.currentWidth;
					this.height = m.currentHeight;
					this.area = m.currentArea;
					this.cache = false;
				}
			}
			if(m){
			}
		};
		my.Filter.prototype.prepare = function() {
			if(this.useWorker){
				this.prepareWorker()
			}
			else{
				if(this.checkCache[this.species]){
					this.checkCache[this.species].call(this);
				}
				if(this.cacheAction){
					this.cacheAction();
				}
			}
		};
		my.Filter.prototype.do = function(data) {
			if(this.useWorker){
				this.doWorker();
			}
			else{
				if(this.defs[this.species]){
					this.defs[this.species].call(this, data);
				}
				if(this.action){
					this.action(data);
				}
			}
		};
		my.Filter.prototype.updateWorker = function(m) {
			// stuff here
			console.log(this.species + ':' + this.name + ' - updateWorker');
		};
		my.Filter.prototype.prepareWorker = function() {
			// stuff here
			console.log(this.species + ':' + this.name + ' - prepareWorker');
		};
		my.Filter.prototype.doWorker = function(data) {
			// stuff here
			console.log(this.species + ':' + this.name + ' - doWorker');
		};
		my.Filter.prototype.doLine = function(data) {
			// stuff here
			console.log(this.species + ':' + this.name + ' - doLine');
		};
		/**
An object containing pre-defined filter functionality.
**/
		my.Filter.prototype.checkCache = {
			pixelate: function(){
				var cache = this.cache,
					rows, h, cols, w, ceil,
					x, y,
					multi, get, c,
					i, j, x1, x2, y1, y2;

				if(!cache){
					multi = my.multifilter[this.multiFilter];
					if(multi){
						w = this.blockWidth || 1;
						h = this.blockHeight || 1;
						ceil = Math.ceil;
						cols = ceil(multi.currentWidth / w);
						rows = ceil(multi.currentHeight / h);

						x = this.offsetX || 0;
						x = (x > w) ? 0 : x;
						y = this.offsetY || 0;
						y = (y > h) ? 0 : y;

						cache = [];
						c = 0;
						get = multi.getIndexes;

						for(i = -1; i < rows; i++){
							for(j = -1; j < cols; j++){
								y1 = (i * h) + y;
								x1 = (j * w) + x;
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
			matrix: function(){
				var cache = this.cache,
					multi, get, c, wrap,
					w, cw, h, ch, x, y,
					i, j, x1, x2, y1, y2;

				if(!cache){
					multi = my.multifilter[this.multiFilter];
					if(multi){
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

						for(i = 0; i < ch; i++){
							for(j = 0; j < cw; j++){
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
			blur: function(){
				var cache = this.cache,
					multi, get, c, wrap,
					w, cw, h, ch, x, y, r,
					i, j, x1, x2, y1, y2, 
					wt, weights;

				if(!cache){
					multi = my.multifilter[this.multiFilter];
					if(multi){
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
						for(i = 0; i < ch; i++){
							for(j = 0; j < cw; j++){
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
						for(i = 0; i < ch; i++){
							for(j = 0; j < cw; j++){
								y1 = i + y;
								x1 = j + x;
								y2 = y1 + h;
								x2 = x1 + w;
								cache[1][c] = get.call(multi, x1, y1, x2, y2);
								c++;
							}
						}
						this.cache = cache;

						wt = 1 / h;
						weights = [];
						for(i = 0; i < h; i++){
							weights.push(wt);
						}
						this.weights = weights;
					}
				}
			},
		};
		my.Filter.prototype.defs = {
			default: function(data){},
			grayscale: function(data){
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
			sepia: function(data){
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
			invert: function(data){
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
			red: function(data){
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
			green: function(data){
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
			blue: function(data){
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
			notred: function(data){
				var len, posR;

				for(posR = 0, len = data.length; posR < len; posR +=4){
					data[posR] = 0;
				}
			},
			notgreen: function(data){
				var len, posG;

				for(posG = 1, len = data.length; posG < len; posG +=4){
					data[posG] = 0;
				}
			},
			notblue: function(data){
				var len, posB;

				for(posB = 2, len = data.length; posB < len; posB +=4){
					data[posB] = 0;
				}
			},
			cyan: function(data){
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
			magenta: function(data){
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
			yellow: function(data){
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
			brightness: function(data){
				var len, posR, posG, posB, posA,
					level = this.level || 0;

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
			saturation: function(data){
				var len, posR, posG, posB, posA,
					level = this.level || 0;

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
			threshold: function(data){
				var len, posR, posG, posB, posA, gray,
					level = this.level || 0;

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
			channels: function(data){
				var len, posR, posG, posB, posA,
					red = this.red || 0,
					green = this.green || 0,
					blue = this.blue || 0;

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
			channelstep: function(data){
				var len, posR, posG, posB, posA,
					red = this.red || 1,
					green = this.green || 1,
					blue = this.blue || 1,
					floor = Math.floor;

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
			tint: function(data){
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

				for(posA = 3, len = data.length; posA < len; posA += 4){
					if(data[posA]){
						posR = posA - 3;
						posG = posA - 2;
						posB = posA - 1;
						r = data[posR];
						g = data[posG];
						b = data[posB];
						data[posR] = (r * redInRed) + (g * greenInRed) + (b * blueInRed);
						data[posG] = (r *redInGreen) + (g * greenInGreen) + (b * blueInGreen);
						data[posB] = (r * redInBlue) + (g * greenInBlue) + (b * blueInBlue);
					}
				}
			},
			pixelate: function(data){
				var cache = this.cache,
					cachelen = cache.length,
					red, green, blue, 
					posR, posG, posB, posA,
					alphas, counter, len,
					k, c;

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
			matrix: function(data){
				var cache = this.cache,
					datalen = data.length,
					red, green, blue, 
					posR, posG, posB, posA, localA,
					alphas, len,
					weights = this.weights,
					norm = this.normalize || false,
					wt, k, c, total, temp;

				if(weights.length){
					temp = data.slice();
					for(posA = 3, c = 0; posA < datalen; posA +=4, c++){
						if(data[posA]){
							alphas = cache[c];
							len = alphas.length;
							red = green = blue = total = 0;

							for(k = 0; k < len; k++){
								localA = alphas[k];
								if(weights[k] && temp[localA]){
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
							if(norm && total){
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
			blur: function(data){
				var cache,
					datalen = data.length,
					red, green, blue, 
					posR, posG, posB, posA, localA,
					alphas, len,
					weights = this.weights,
					norm = this.normalize || false,
					wt, k, c, total, temp;

				if(weights.length){
					cache = this.cache[0],
					temp = data.slice();
					for(posA = 3, c = 0; posA < datalen; posA +=4, c++){
						if(data[posA]){
							alphas = cache[c];
							len = alphas.length;
							red = green = blue = total = 0;

							for(k = 0; k < len; k++){
								localA = alphas[k];
								if(weights[k] && temp[localA]){
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
							if(norm && total){
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

					cache = this.cache[1],
					temp = data.slice();
					for(posA = 3, c = 0; posA < datalen; posA +=4, c++){
						if(data[posA]){
							alphas = cache[c];
							len = alphas.length;
							red = green = blue = total = 0;

							for(k = 0; k < len; k++){
								localA = alphas[k];
								if(weights[k] && temp[localA]){
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
							if(norm && total){
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
		my.MultiFilter.prototype.apply = function() {
			var canvas, cvx, img, def, filter, buff, data, width, height, j, jz;

			// if(this.definitions.length){
			if(this.filters.length){
				canvas = my.work.cv2;
				cvx = my.work.cvx2;
				img = cvx.getImageData(0, 0, canvas.width, canvas.height);
				width = img.width;
				height = img.height;
				buff = img.data.buffer;
				data = new Uint8ClampedArray(buff);

				if(width !== this.currentWidth || height !== this.currentHeight){
					this.currentWidth = width;
					this.currentHeight = height;
					this.currentArea = width * height;
					this.prepareGrid();
					this.updateFilters();
				}

				for(j = 0, jz = this.filters.length; j < jz; j++){
					this.filters[j].prepare();
				}
				for(j = 0, jz = this.filters.length; j < jz; j++){
					this.filters[j].do(data);
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
			for(var i = 0, iz = this.filters.length; i < iz; i++){
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
				return [];
			}

			lw = col2 - col1;
			lh = row2 - row1;
			result = [];

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

			if(row2 < 0 || col2 < 0 || row1 >= h || col1 >= w){
				return [];
			}

			lw = col2 - col1;
			lh = row2 - row1;
			result = [];

			for(i = 0; i < lh; i++){
				for(j = 0; j < lw; j++){
					r = row1 + i;
					c = col1 + j;
					if(r < 0 || r >= h){
						r = (r < 0) ? r + h : r - h;
					}
					if(c < 0 || c >= w){
						c = (c < 0) ? c + w : c - w;
					}
					temp = (i * lw) + j;
					result[temp] = grid[r][c];
				}
			}

			return result;
		};






		// REMEMBER - CODE BELOW HERE REQUIRED TO COMPLETE THE EXTENSION
		// =============================================================

		return my;
	}(scrawl));
}
