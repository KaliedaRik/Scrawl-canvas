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
MULTIFILTERNAME String, to be applied to the Cell
@property Cell.multiFilter
@type String
@default ''
**/
		my.work.d.Cell.multiFilter = '';
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
Cell constructor hook function - modified by multiFilter module

Adds the multiFilter attribute to Cell objects
@method multifiltersCellInit
@private
**/
		my.Cell.prototype.multifiltersCellInit = function(items) {
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

// THESE OVERWRITTEN FUNCTIONS NEED TO BE CODED UP!
// =========================================

	/**
Prepare to draw entitys onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array

(This function is replaced by the Filters or multifilters extension)
@method compile
@return This
@chainable
**/
	my.Cell.prototype.compile = function(mouse) {
		var group,
			i,
			iz;
		this.groupSort();
		for (i = 0, iz = this.groups.length; i < iz; i++) {
			group = my.group[this.groups[i]];
			if (group.visibility) {
				group.stamp(false, this.name, this, mouse);
			}
		}
		return this;
	};


	/**
Entity.stamp hook function - modified by multifilters extension
@method stampMultifilter
@private
**/
	my.Entity.prototype.stampMultifilter = function(engine, cellname, cell) {
// my.work.cv2 = my.canvas.defaultHiddenCanvasElement;
// my.work.cvx2 = my.context.defaultHiddenCanvasElement;
// my.work.cvmodel2 = my.ctx.defaultHiddenCanvasElement;
// my.work.cvwrapper2 = my.cell.defaultHiddenCanvasElement;
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
		/**
@property rowsData
@type Array
@default []
@private
**/
			this.rowsData = [];
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
// my.work.cv2 = my.canvas.defaultHiddenCanvasElement;
// my.work.cvx2 = my.context.defaultHiddenCanvasElement;
// my.work.cvmodel2 = my.ctx.defaultHiddenCanvasElement;
// my.work.cvwrapper2 = my.cell.defaultHiddenCanvasElement;
			var canvas = my.work.cv2,
				cvx = my.work.cvx2,
				cols = canvas.width,
				rows = canvas.height,
				img = cvx.getImageData(0, 0, cols, rows),
				terminals,
				rowWidth = cols * 4,
				current,
				def, filter,
				i, j, jz;

			terminals = this.checkDataForWork(img);

			for(j = 0, jz = this.definitions.length; j < jz; j++){
				def = this.definitions[j];
				if(def.filter){
					filter = this.filters[def.filter];
					if(filter){
						img = filter(img, terminals, def);
					}
				}
			}

			cvx.putImageData(img, 0, 0);
			return true;
		};
		/**
Determines the positions of relevant (non-zero) alpha data in the image data

@method checkDataForWork
@param {Array} data - An array representing a row from a canvas
@private
@return a one-dimensional array comprising of 2 items of data for each descending row in the image - the first pixel from the left, and from the right, between which there is data for processing
**/
		my.MultiFilter.prototype.checkDataForWork = function(img) {
			var cols = img.width,
				rows = img.height,
				data = img.data,
				i, j, k,
				left, right, posStart, posEnd,
				result = [];

			for(i = 0; i < rows; i++){
				posStart = i * cols * 4;
				posEnd = posStart + (cols * 4);
				left = -1;
				right = -1;
				for(j = posStart + 3; j < posEnd; j += 4){
					if(data[j]){
						left = j - 3;
						break;
					}
				}
				if(left >= 0){
					for(k = posEnd - 1; k > 0; k -= 4){
						if(data[k]){
							right = k - 3;
							break;
						}
					}
				}
				result.push(left);
				result.push(right);
			}
			return result;
		};

		/**
An object containing filter functionality.
**/
		my.MultiFilter.prototype.filters = {
			default: function(img, terms, args){
				return img;
			},
			grayscale: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					gray, r, g, b,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								r = j;
								g = j + 1;
								b = j + 2;
								gray = Math.floor((0.2126 * data[r]) + (0.7152 * data[g]) + (0.0722 * data[b]));
								data[r] = gray;
								data[g] = gray;
								data[b] = gray;
							}
						}
					}
				}
				return img;
			},
			invert: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					r, g, b, val,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								r = j;
								g = j + 1;
								b = j + 2;
								val = data[r]
								data[r] = 255 - val;
								val = data[g]
								data[g] = 255 - val;
								val = data[b]
								data[b] = 255 - val;
							}
						}
					}
				}
				return img;
			},
			red: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								data[j + 1] = 0;
								data[j + 2] = 0;
							}
						}
					}
				}
				return img;
			},
			green: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								data[j] = 0;
								data[j + 2] = 0;
							}
						}
					}
				}
				return img;
			},
			blue: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								data[j] = 0;
								data[j + 1] = 0;
							}
						}
					}
				}
				return img;
			},
			notred: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								data[j] = 0;
							}
						}
					}
				}
				return img;
			},
			notgreen: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								data[j + 1] = 0;
							}
						}
					}
				}
				return img;
			},
			notblue: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								data[j + 2] = 0;
							}
						}
					}
				}
				return img;
			},
			cyan: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					r, g, b, val,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								r = j;
								g = j + 1;
								b = j + 2;
								val = Math.floor((data[g] + data[b]) / 2);
								data[r] = 0;
								data[g] = val;
								data[b] = val;
							}
						}
					}
				}
				return img;
			},
			magenta: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					r, g, b, val,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								r = j;
								g = j + 1;
								b = j + 2;
								val = Math.floor((data[r] + data[b]) / 2);
								data[r] = val;
								data[g] = 0;
								data[b] = val;
							}
						}
					}
				}
				return img;
			},
			yellow: function(img, terms, args){
				var rows = img.height,
					cols = img.width,
					data = img.data,
					i, j, jz,
					r, g, b, val,
					currentTermPos;
				for(i = 0; i < rows; i++){
					currentTermPos = i * 2;
					if(terms[currentTermPos] >= 0){
						for(j = terms[currentTermPos], jz = terms[currentTermPos + 1]; j <= jz; j += 4){
							if(data[j + 3]){
								r = j;
								g = j + 1;
								b = j + 2;
								val = Math.floor((data[r] + data[g]) / 2);
								data[r] = val;
								data[g] = val;
								data[b] = 0;
							}
						}
					}
				}
				return img;
			},
		};






		// REMEMBER - CODE BELOW HERE REQUIRED TO COMPLETE THE EXTENSION
		// =============================================================

		return my;
	}(scrawl));
}
