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
	var scrawl = (function(my, S) {
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
		/**
Utility canvases - never displayed
@property filterCanvas
@type {CasnvasObject}
@private
**/
		my.filterCanvas = document.createElement('canvas');
		my.filterCanvas.id = 'filterHiddenCanvasElement';
		my.f.appendChild(my.filterCanvas);
		/**
Utility canvas 2d context engine
@property filterCvx
@type {CasnvasContextObject}
@private
**/
		my.filterCvx = my.filterCanvas.getContext('2d');
		/**
Array of FILTERNAME strings, for filters to be applied to the Pad
@property filters
@type Array
@default []
**/
		my.d.Pad.filters = [];
		/**
Array of FILTERNAME strings, for filters to be applied to the Cell
@property filters
@type Array
@default []
**/
		my.d.Cell.filters = [];
		/**
Array of FILTERNAME strings, for filters to be applied to Entitys in this group
@property filters
@type Array
@default []
**/
		my.d.Group.filters = [];
		/**
Filter flag - when true, will draw the entity; on false (default), the clip method is used instead
@property filterOnStroke
@type Boolean
@default false
**/
		my.d.Group.filterOnStroke = false;
		/**
The filterLevel attribute determines at which point in the display cycle the filter will be applied. Permitted values are:

* '__entity__' - filter is applied immediately after the Entity has stamped itself onto a cell
* '__cell__' - filter is applied after all Entites have completed stamping themselves onto the cell
* '__pad__' - filter is applied to the base canvas after all cells have completed copying themselves onto it, and before the base cell copies itself onto the display cell

@property filterLevel
@type String
@default 'entity'
**/
		my.d.Group.filterLevel = 'entity';
		/**
Array of FILTERNAME strings, for filters to be applied to this entity
@property filters
@type Array
@default []
**/
		my.d.Entity.filters = [];
		/**
Filter flag - when true, will draw the entity; on false (default), the clip method is used instead
@property filterOnStroke
@type Boolean
@default false
**/
		my.d.Entity.filterOnStroke = false;
		/**
The filterLevel attribute determines at which point in the display cycle the filter will be applied. Permitted values are:

* '__entity__' - filter is applied immediately after the Entity has stamped itself onto a cell
* '__cell__' - filter is applied after all Entites have completed stamping themselves onto the cell
* '__pad__' - filter is applied to the base canvas after all cells have completed copying themselves onto it, and before the base cell copies itself onto the display cell

@property filterLevel
@type String
@default 'entity'
**/
		my.d.Entity.filterLevel = 'entity';
		if (my.xt(my.d.Block)) {
			my.mergeInto(my.d.Block, my.d.Entity);
		}
		if (my.xt(my.d.Shape)) {
			my.mergeInto(my.d.Shape, my.d.Entity);
		}
		if (my.xt(my.d.Wheel)) {
			my.mergeInto(my.d.Wheel, my.d.Entity);
		}
		if (my.xt(my.d.Picture)) {
			my.mergeInto(my.d.Picture, my.d.Entity);
		}
		if (my.xt(my.d.Phrase)) {
			my.mergeInto(my.d.Phrase, my.d.Entity);
		}
		if (my.xt(my.d.Path)) {
			my.mergeInto(my.d.Path, my.d.Entity);
		}
		/**
Pad constructor hook function - modified by filters module
@method filtersPadInit
@private
**/
		my.Pad.prototype.filtersPadInit = function(items) {
			this.filters = [];
		};
		/**
Cell constructor hook function - modified by filters module
@method filtersCellInit
@private
**/
		my.Cell.prototype.filtersCellInit = function(items) {
			this.filters = [];
		};
		/**
Group constructor hook function - modified by filters module
@method filtersGroupInit
@private
**/
		my.Group.prototype.filtersGroupInit = function(items) {
			items = my.safeObject(items);
			this.filters = (my.xt(items.filters)) ? items.filters : [];
			this.filterOnStroke = my.xtGet(items.filterOnStroke, false);
			this.filterLevel = my.xtGet(items.filterLevel, 'entity');
		};
		/**
Entity constructor hook function - modified by filters module
@method filtersEntityInit
@private
**/
		my.Entity.prototype.filtersEntityInit = function(items) {
			items = my.safeObject(items);
			this.filters = (my.xt(items.filters)) ? items.filters : [];
			this.filterOnStroke = my.xtGet(items.filterOnStroke, false);
			this.filterLevel = my.xtGet(items.filterLevel, 'entity');
		};

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
A __factory__ function to generate new Leach filter objects
@method newLeachFilter
@param {Object} items Key:value Object argument for setting attributes
@return LeachFilter object
**/
		my.newLeachFilter = function(items) {
			return new my.LeachFilter(items);
		};
		/**
A __factory__ function to generate new Separate filter objects
@method newSeparateFilter
@param {Object} items Key:value Object argument for setting attributes
@return newSeparateFilter object
**/
		my.newSeparateFilter = function(items) {
			return new my.SeparateFilter(items);
		};
		/**
A __factory__ function to generate new Noise filter objects
@method newNoiseFilter
@param {Object} items Key:value Object argument for setting attributes
@return NoiseFilter object
**/
		my.newNoiseFilter = function(items) {
			return new my.NoiseFilter(items);
		};

		/**
Display function - requests Cells to compile their &lt;canvas&gt; element

Cells will compile in ascending order of their compileOrder attributes, if their compiled attribute = true

By default:
* the initial base canvas has a compileOrder of 9999 and compiles last
* the initial display canvas has compiled = false and will not compile

(As amended by Filters module)

@method compile
@return This
@chainable
**/
		S.Pad_filtersCompile_c = null; //scrawl Cell object
		S.Pad_filtersCompile_i = 0;
		S.Pad_filtersCompile_iz = 0;
		my.Pad.prototype.compile = function() {
			this.filters.length = 0;
			this.sortCellsCompile();
			for (S.Pad_filtersCompile_i = 0, S.Pad_filtersCompile_iz = this.cells.length; S.Pad_filtersCompile_i < S.Pad_filtersCompile_iz; S.Pad_filtersCompile_i++) {
				S.Pad_filtersCompile_c = my.cell[this.cells[S.Pad_filtersCompile_i]];
				if (S.Pad_filtersCompile_c.rendered && S.Pad_filtersCompile_c.compiled) {
					S.Pad_filtersCompile_c.compile();
				}
			}
			return this;
		};
		/**
Display function - requests Cells to show their &lt;canvas&gt; element 

Cells will show in ascending order of their showOrder attributes, if their show attribute = true

By default, the initial base and display canvases have shown = false:
* 'show' involves a cell copying itself onto the base cell; it makes no sense for the base cell to copy onto itself
* the last action is to copy the base cell onto the display cell

(As amended by Filters module)

@method show
@return This
@chainable
**/
		S.Pad_filtersShow_d = null; //scrawl Cell object
		S.Pad_filtersShow_b = null; //scrawl Cell object
		S.Pad_filtersShow_c = null; //scrawl Cell object
		S.Pad_filtersShow_i = 0;
		S.Pad_filtersShow_iz = 0;
		my.Pad.prototype.show = function(command) {
			S.Pad_filtersShow_d = my.cell[this.display];
			S.Pad_filtersShow_b = my.cell[this.base];
			this.sortCellsShow();
			for (S.Pad_filtersShow_i = 0, S.Pad_filtersShow_iz = this.cells.length; S.Pad_filtersShow_i < S.Pad_filtersShow_iz; S.Pad_filtersShow_i++) {
				S.Pad_filtersShow_c = my.cell[this.cells[S.Pad_filtersShow_i]];
				if (S.Pad_filtersShow_c.rendered && S.Pad_filtersShow_c.shown) {
					S.Pad_filtersShow_b.copyCellToSelf(S.Pad_filtersShow_c);
				}
			}
			for (S.Pad_filtersShow_i = 0, S.Pad_filtersShow_iz = this.filters.length; S.Pad_filtersShow_i < S.Pad_filtersShow_iz; S.Pad_filtersShow_i++) {
				if (my.xt(my.entity[this.filters[S.Pad_filtersShow_i]])) {
					my.entity[this.filters[S.Pad_filtersShow_i]].stampFilter(my.context[S.Pad_filtersShow_b.name], S.Pad_filtersShow_b.name, true);
				}
				if (my.xt(my.group[this.filters[S.Pad_filtersShow_i]])) {
					my.group[this.filters[S.Pad_filtersShow_i]].stampFilter(my.context[S.Pad_filtersShow_b.name], S.Pad_filtersShow_b.name, true);
				}
			}
			S.Pad_filtersShow_d.copyCellToSelf(S.Pad_filtersShow_b, true);
			return this;
		};
		/**
Prepare to draw entitys onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array 

(As amended by Filters module)
@method compileFilters
@return always true
@chainable
**/
		S.Cell_filtersCompile_g = null; //scrawl Group object
		S.Cell_filtersCompile_i = 0;
		S.Cell_filtersCompile_iz = 0;
		my.Cell.prototype.compile = function() {
			this.filters.length = 0;
			this.groups.sort(function(a, b) {
				return my.group[a].order - my.group[b].order;
			});
			for (S.Cell_filtersCompile_i = 0, S.Cell_filtersCompile_iz = this.groups.length; S.Cell_filtersCompile_i < S.Cell_filtersCompile_iz; S.Cell_filtersCompile_i++) {
				S.Cell_filtersCompile_g = my.group[this.groups[S.Cell_filtersCompile_i]];
				if (S.Cell_filtersCompile_g.get('visibility')) {
					S.Cell_filtersCompile_g.stamp(false, this.name);
				}
			}
			for (S.Cell_filtersCompile_i = 0, S.Cell_filtersCompile_iz = this.filters.length; S.Cell_filtersCompile_i < S.Cell_filtersCompile_iz; S.Cell_filtersCompile_i++) {
				if (my.xt(my.entity[this.filters[S.Cell_filtersCompile_i]])) {
					my.entity[this.filters[S.Cell_filtersCompile_i]].stampFilter(my.context[this.name], this.name, true);
				}
				else if (my.xt(my.group[this.filters[S.Cell_filtersCompile_i]])) {
					my.group[this.filters[S.Cell_filtersCompile_i]].stampFilter(my.context[this.name], this.name, true);
				}
			}
			return true;
		};
		/**
Group.stamp hook function - add a filter to a group of Entitys, and any background detail enclosed by them
@method stampFilter
@private
**/
		S.Group_filtersStampFilters_imageData = null; //ImageData array/object
		S.Group_filtersStampFilters_canvas = null; //DOM Canvas object
		S.Group_filtersStampFilters_composite = '';
		S.Group_filtersStampFilters_e = null; //scrawl Entity object
		S.Group_filtersStampFilters_eStroke = false;
		S.Group_filtersStampFilters_i = 0;
		S.Group_filtersStampFilters_iz = 0;
		my.Group.prototype.stampFilter = function(engine, cell, force) {
			force = my.xtGet(force, false);
			if (this.filters.length > 0) {
				S.Group_filtersStampFilters_canvas = my.canvas[cell];
				my.cv.width = S.Group_filtersStampFilters_canvas.width;
				my.cv.height = S.Group_filtersStampFilters_canvas.height;
				my.filterCanvas.width = S.Group_filtersStampFilters_canvas.width;
				my.filterCanvas.height = S.Group_filtersStampFilters_canvas.height;
				my.filterCvx.clearRect(0, 0, S.Group_filtersStampFilters_canvas.width, S.Group_filtersStampFilters_canvas.height);
				for (S.Group_filtersStampFilters_i = 0, S.Group_filtersStampFilters_iz = this.entitys.length; S.Group_filtersStampFilters_i < S.Group_filtersStampFilters_iz; S.Group_filtersStampFilters_i++) {
					S.Group_filtersStampFilters_e = my.entity[this.entitys[S.Group_filtersStampFilters_i]];
					S.Group_filtersStampFilters_eStroke = S.Group_filtersStampFilters_e.filterOnStroke;
					S.Group_filtersStampFilters_e.filterOnStroke = this.filterOnStroke;
					my.cvx.save();
					switch (e.type) {
						case 'Phrase':
							S.Group_filtersStampFilters_imageData = S.Group_filtersStampFilters_e.stampFilterPhrase(engine, cell, force);
							break;
						case 'Picture':
							S.Group_filtersStampFilters_imageData = S.Group_filtersStampFilters_e.stampFilterPicture(engine, cell, force);
							break;
						case 'Wheel':
							S.Group_filtersStampFilters_imageData = S.Group_filtersStampFilters_e.stampFilterWheel(engine, cell, force);
							break;
						default:
							S.Group_filtersStampFilters_imageData = S.Group_filtersStampFilters_e.stampFilterDefault(engine, cell, force);
					}
					e.filterOnStroke = S.Group_filtersStampFilters_eStroke;
					my.filterCvx.putImageData(S.Group_filtersStampFilters_imageData, 0, 0);
					my.cvx.restore();
				}
				S.Group_filtersStampFilters_imageData = my.filterCvx.getImageData(0, 0, S.Group_filtersStampFilters_canvas.width, S.Group_filtersStampFilters_canvas.height);
				if (S.Group_filtersStampFilters_imageData) {
					for (S.Group_filtersStampFilters_i = 0, S.Group_filtersStampFilters_iz = this.filters.length; S.Group_filtersStampFilters_i < S.Group_filtersStampFilters_iz; S.Group_filtersStampFilters_i++) {
						if (this.filterLevel === 'pad' && !force) {
							my.pad[my.cell[this.cell].pad].filters.push(this.name);
						}
						else if (this.filterLevel === 'cell' && !force) {
							my.cell[this.cell].filters.push(this.name);
						}
						else if (my.filter[this.filters[S.Group_filtersStampFilters_i]]) {
							S.Group_filtersStampFilters_imageData = my.filter[this.filters[S.Group_filtersStampFilters_i]].add(S.Group_filtersStampFilters_imageData);
						}
					}
				}
				my.cvx.putImageData(S.Group_filtersStampFilters_imageData, 0, 0);
				S.Group_filtersStampFilters_composite = engine.globalCompositeOperation;
				engine.globalCompositeOperation = my.filter[this.filters[this.filters.length - 1]].composite;
				engine.setTransform(1, 0, 0, 1, 0, 0);
				engine.drawImage(my.cv, 0, 0, S.Group_filtersStampFilters_canvas.width, S.Group_filtersStampFilters_canvas.height);
				engine.globalCompositeOperation = S.Group_filtersStampFilters_composite;
			}
		};
		/**
Entity.stamp hook function - add a filter to an Entity, and any background detail enclosed by the Entity
@method stampFilter
@private
**/
		S.Entity_stampFilter_imageData = null; //ImageData array/object
		S.Entity_stampFilter_canvas = null; //DOM Canvas object
		S.Entity_stampFilter_composite = '';
		S.Entity_stampFilter_i = 0;
		S.Entity_stampFilter_iz = 0;
		my.Entity.prototype.stampFilter = function(engine, cell, force) {
			force = my.xtGet(force, false);
			if (this.filters.length > 0) {
				S.Entity_stampFilter_canvas = my.canvas[cell];
				my.cv.width = S.Entity_stampFilter_canvas.width;
				my.cv.height = S.Entity_stampFilter_canvas.height;
				my.cvx.save();
				switch (this.type) {
					case 'Phrase':
						S.Entity_stampFilter_imageData = this.stampFilterPhrase(engine, cell, force);
						break;
					case 'Picture':
						S.Entity_stampFilter_imageData = this.stampFilterPicture(engine, cell, force);
						break;
					case 'Wheel':
						S.Entity_stampFilter_imageData = this.stampFilterWheel(engine, cell, force);
						break;
					default:
						S.Entity_stampFilter_imageData = this.stampFilterDefault(engine, cell, force);
				}
				if (S.Entity_stampFilter_imageData) {
					for (S.Entity_stampFilter_i = 0, S.Entity_stampFilter_iz = this.filters.length; S.Entity_stampFilter_i < S.Entity_stampFilter_iz; S.Entity_stampFilter_i++) {
						if (this.filterLevel === 'pad' && !force) {
							my.pad[my.cell[my.group[this.group].cell].pad].filters.push(this.name);
						}
						else if (this.filterLevel === 'cell' && !force) {
							my.cell[my.group[this.group].cell].filters.push(this.name);
						}
						else if (my.filter[this.filters[S.Entity_stampFilter_i]]) {
							S.Entity_stampFilter_imageData = my.filter[this.filters[S.Entity_stampFilter_i]].add(S.Entity_stampFilter_imageData);
						}
					}
					my.cvx.putImageData(S.Entity_stampFilter_imageData, 0, 0);
					S.Entity_stampFilter_composite = engine.globalCompositeOperation;
					engine.globalCompositeOperation = my.filter[this.filters[this.filters.length - 1]].composite;
					engine.setTransform(1, 0, 0, 1, 0, 0);
					engine.drawImage(my.cv, 0, 0, S.Entity_stampFilter_canvas.width, S.Entity_stampFilter_canvas.height);
					engine.globalCompositeOperation = S.Entity_stampFilter_composite;
				}
				my.cvx.restore();
			}
		};
		/**
Entity.stamp hook helper function
@method stampFilterPhrase
@private
**/
		S.Entity_stampFilterPhrase_context = null; //DOM Canvas context object
		S.Entity_stampFilterPhrase_canvas = null; //DOM Canvas object
		S.Entity_stampFilterPhrase_test = null; //argument
		S.Entity_stampFilterPhrase_i = 0;
		S.Entity_stampFilterPhrase_iz = 0;
		S.Entity_stampFilterPhrase_o = null; //scrawl Vector object
		S.Entity_stampFilterPhrase_here = null; //scrawl Vector object
		S.Entity_stampFilterPhrase_textY = 0;
		S.Entity_stampFilterPhrase_tX = 0;
		S.Entity_stampFilterPhrase_tY = 0;
		my.Entity.prototype.stampFilterPhrase = function(engine, cell, force) {
			S.Entity_stampFilterPhrase_canvas = my.canvas[cell];
			S.Entity_stampFilterPhrase_context = my.ctx[this.context];
			//test;
			my.cvx.font = S.Entity_stampFilterPhrase_context.font;
			my.cvx.fillStyle = 'rgb(0, 0, 0)';
			my.cvx.textAlign = S.Entity_stampFilterPhrase_context.textAlign;
			my.cvx.textBaseline = S.Entity_stampFilterPhrase_context.textBaseline;
			S.Entity_stampFilterPhrase_test = (my.entity[this.path] && my.entity[this.path].type === 'Path');
			if (this.pivot || !S.Entity_stampFilterPhrase_test || this.get('textAlongPath') === 'phrase') {
				S.Entity_stampFilterPhrase_o = this.getOffset();
				S.Entity_stampFilterPhrase_here = this.prepareStamp();
				S.Entity_stampFilterPhrase_textY = this.size * this.lineHeight * this.scale;
				this.rotateCell(my.cvx, my.cv);
				S.Entity_stampFilterPhrase_tX = S.Entity_stampFilterPhrase_here.x + S.Entity_stampFilterPhrase_o.x;
				for (S.Entity_stampFilterPhrase_i = 0, S.Entity_stampFilterPhrase_iz = this.texts.length; S.Entity_stampFilterPhrase_i < S.Entity_stampFilterPhrase_iz; S.Entity_stampFilterPhrase_i++) {
					S.Entity_stampFilterPhrase_tY = S.Entity_stampFilterPhrase_here.y + (S.Entity_stampFilterPhrase_textY * S.Entity_stampFilterPhrase_i) + S.Entity_stampFilterPhrase_o.y;
					my.text[this.texts[S.Entity_stampFilterPhrase_i]].fill(my.cvx, cell, S.Entity_stampFilterPhrase_tX, S.Entity_stampFilterPhrase_tY);
				}
			}
			else {
				my.text[this.texts[0]].clipAlongPath();
			}
			my.cvx.setTransform(1, 0, 0, 1, 0, 0);
			my.cvx.globalCompositeOperation = 'source-in';
			my.cvx.drawImage(S.Entity_stampFilterPhrase_canvas, 0, 0);
			my.cvx.globalCompositeOperation = 'source-over';
			return my.cvx.getImageData(0, 0, S.Entity_stampFilterPhrase_canvas.width, S.Entity_stampFilterPhrase_canvas.height);
		};
		/**
Entity.stamp hook helper function
@method stampFilterWheel
@private
**/
		S.Entity_stampFilterWheel_context = null; //DOM Canvas context object
		S.Entity_stampFilterWheel_canvas = null; //DOM Canvas object
		my.Entity.prototype.stampFilterWheel = function(engine, cell, force) {
			S.Entity_stampFilterWheel_canvas = my.canvas[cell];
			S.Entity_stampFilterWheel_context = my.ctx[this.context];
			if (this.filterOnStroke) {
				my.cvx.lineWidth = S.Entity_stampFilterWheel_context.lineWidth;
				my.cvx.shadowOffsetX = S.Entity_stampFilterWheel_context.shadowOffsetX;
				my.cvx.shadowOffsetY = S.Entity_stampFilterWheel_context.shadowOffsetY;
				my.cvx.shadowBlur = S.Entity_stampFilterWheel_context.shadowBlur;
				my.cvx.lineJoin = S.Entity_stampFilterWheel_context.lineJoin;
				my.cvx.lineCap = S.Entity_stampFilterWheel_context.lineCap;
				my.cvx.miterLimit = S.Entity_stampFilterWheel_context.miterLimit;
				my.cvx.lineDash = S.Entity_stampFilterWheel_context.lineDash;
				my.cvx.lineDashOffset = S.Entity_stampFilterWheel_context.lineDashOffset;
				my.cvx.globalAlpha = S.Entity_stampFilterWheel_context.globalAlpha;
				this.buildPath(my.cvx, my.cv);
				my.cvx.stroke();
				my.cvx.setTransform(1, 0, 0, 1, 0, 0);
				my.cvx.globalCompositeOperation = 'source-in';
				my.cvx.drawImage(S.Entity_stampFilterWheel_canvas, 0, 0);
				my.cvx.globalCompositeOperation = 'source-over';
			}
			else {
				this.clip(my.cvx, cell);
				my.cvx.setTransform(1, 0, 0, 1, 0, 0);
				my.cvx.drawImage(S.Entity_stampFilterWheel_canvas, 0, 0);
			}
			return my.cvx.getImageData(0, 0, S.Entity_stampFilterWheel_canvas.width, S.Entity_stampFilterWheel_canvas.height);
		};
		/**
Entity.stamp hook helper function
@method stampFilterPicture
@private
**/
		S.Entity_stampFilterPicture_canvas = null; //DOM Canvas object
		S.Entity_stampFilterPicture_data = null; //Image data array/object
		S.Entity_stampFilterPicture_here = null; //scrawl Vector object
		my.Entity.prototype.stampFilterPicture = function(engine, cell, force) {
			S.Entity_stampFilterPicture_canvas = my.canvas[cell];
			S.Entity_stampFilterPicture_data = this.getImage();
			if (S.Entity_stampFilterPicture_data) {
				S.Entity_stampFilterPicture_here = this.prepareStamp();
				this.rotateCell(my.cvx, my.cv);
				my.cvx.drawImage(S.Entity_stampFilterPicture_data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, S.Entity_stampFilterPicture_here.x, S.Entity_stampFilterPicture_here.y, this.pasteData.w, this.pasteData.h);
				my.cvx.setTransform(1, 0, 0, 1, 0, 0);
				my.cvx.globalCompositeOperation = 'source-in';
				my.cvx.drawImage(S.Entity_stampFilterPicture_canvas, 0, 0);
				my.cvx.globalCompositeOperation = 'source-over';
				return my.cvx.getImageData(0, 0, S.Entity_stampFilterPicture_canvas.width, S.Entity_stampFilterPicture_canvas.height);
			}
			return false;
		};
		/**
Entity.stamp hook helper function
@method stampFilterDefault
@private
**/
		S.Entity_stampFilterDefault_canvas = null; //DOM Canvas object
		my.Entity.prototype.stampFilterDefault = function(engine, cell, force) {
			S.Entity_stampFilterDefault_canvas = my.canvas[cell];
			this.clip(my.cvx, cell);
			my.cvx.setTransform(1, 0, 0, 1, 0, 0);
			my.cvx.drawImage(S.Entity_stampFilterDefault_canvas, 0, 0);
			return my.cvx.getImageData(0, 0, S.Entity_stampFilterDefault_canvas.width, S.Entity_stampFilterDefault_canvas.height);
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
			this.alpha = my.xtGet(items.alpha, 1);
			this.composite = my.xtGet(items.composite, 'source-over');
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
Filter alpha

values between 0 (transparent) and 1 (current alpha values); or '0%' and '100%'
@property alpha
@type Number - or alternatively percentage String
@default 1
**/
			alpha: 1,
			/**
Filter composite operation

Only the final filter in an array of filters will determine the composite operation to be used on the cell
@property composite
@type String
@default 'source-over'
**/
			composite: 'source-over',
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
cloneImageData function

@method cloneImageData
@param {Object} original - canvas getImageData object
@return cloned image data object; false on error
**/
		S.Filter_cloneImageData_w = 0;
		S.Filter_cloneImageData_h = 0;
		my.Filter.prototype.cloneImageData = function(original) {
			if (my.xt(original)) {
				if (my.xta(original.width, original.height)) {
					S.Filter_cloneImageData_w = original.width;
					S.Filter_cloneImageData_h = original.height;
					my.filterCanvas.width = S.Filter_cloneImageData_w;
					my.filterCanvas.height = S.Filter_cloneImageData_h;
					my.filterCvx.putImageData(original, 0, 0);
					return my.filterCvx.getImageData(0, 0, S.Filter_cloneImageData_w, S.Filter_cloneImageData_h);
				}
			}
			return false;
		};
		/**
getAlpha function

@method getAlpha
@return numerical strength value, between 0 and 1
@private
**/
		S.Filter_getAlpha_a = 0;
		my.Filter.prototype.getAlpha = function() {
			S.Filter_getAlpha_a = (my.isa(this.alpha, 'str')) ? parseFloat(this.alpha) / 100 : this.alpha;
			if (S.Filter_getAlpha_a >= 0 && S.Filter_getAlpha_a <= 1) {
				return S.Filter_getAlpha_a;
			}
			else {
				return (S.Filter_getAlpha_a > 0.5) ? 1 : 0;
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
Add function - takes data, calculates its greyscale and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.GreyscaleFilter_add_alpha = 0;
		S.GreyscaleFilter_add_d = [];
		S.GreyscaleFilter_add_here = 0;
		S.GreyscaleFilter_add_grey = 0;
		S.GreyscaleFilter_add_i = 0;
		S.GreyscaleFilter_add_iz = 0;
		my.GreyscaleFilter.prototype.add = function(data) {
			S.GreyscaleFilter_add_alpha = this.getAlpha();
			S.GreyscaleFilter_add_d = data.data;
			for (S.GreyscaleFilter_add_i = 0, S.GreyscaleFilter_add_iz = S.GreyscaleFilter_add_d.length; S.GreyscaleFilter_add_i < S.GreyscaleFilter_add_iz; S.GreyscaleFilter_add_i += 4) {
				if (S.GreyscaleFilter_add_d[S.GreyscaleFilter_add_i + 3] !== 0) {
					S.GreyscaleFilter_add_here = S.GreyscaleFilter_add_i;
					S.GreyscaleFilter_add_grey = Math.floor((0.2126 * S.GreyscaleFilter_add_d[S.GreyscaleFilter_add_here]) + (0.7152 * S.GreyscaleFilter_add_d[++S.GreyscaleFilter_add_here]) + (0.0722 * S.GreyscaleFilter_add_d[++S.GreyscaleFilter_add_here]));
					S.GreyscaleFilter_add_here = S.GreyscaleFilter_add_i;
					S.GreyscaleFilter_add_d[S.GreyscaleFilter_add_here] = S.GreyscaleFilter_add_grey;
					S.GreyscaleFilter_add_d[++S.GreyscaleFilter_add_here] = S.GreyscaleFilter_add_grey;
					S.GreyscaleFilter_add_d[++S.GreyscaleFilter_add_here] = S.GreyscaleFilter_add_grey;
					S.GreyscaleFilter_add_d[++S.GreyscaleFilter_add_here] *= S.GreyscaleFilter_add_alpha;
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
Add function - takes data, calculates its invert and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.InvertFilter_add_alpha = 0;
		S.InvertFilter_add_d = [];
		S.InvertFilter_add_here = 0;
		S.InvertFilter_add_i = 0;
		S.InvertFilter_add_iz = 0;
		my.InvertFilter.prototype.add = function(data) {
			S.InvertFilter_add_alpha = this.getAlpha();
			S.InvertFilter_add_d = data.data;
			for (S.InvertFilter_add_i = 0, S.InvertFilter_add_iz = S.InvertFilter_add_d.length; S.InvertFilter_add_i < S.InvertFilter_add_iz; S.InvertFilter_add_i += 4) {
				if (S.InvertFilter_add_d[S.InvertFilter_add_i + 3] !== 0) {
					S.InvertFilter_add_here = S.InvertFilter_add_i;
					S.InvertFilter_add_d[S.InvertFilter_add_here] = 255 - S.InvertFilter_add_d[S.InvertFilter_add_here];
					S.InvertFilter_add_d[++S.InvertFilter_add_here] = 255 - S.InvertFilter_add_d[S.InvertFilter_add_here];
					S.InvertFilter_add_d[++S.InvertFilter_add_here] = 255 - S.InvertFilter_add_d[S.InvertFilter_add_here];
					S.InvertFilter_add_d[++S.InvertFilter_add_here] *= S.InvertFilter_add_alpha;
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
			this.brightness = my.xtGet(items.brightness, 1);
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
		S.BrightnessFilter_add_alpha = 0;
		S.BrightnessFilter_add_d = [];
		S.BrightnessFilter_add_here = 0;
		S.BrightnessFilter_add_brightness = 0;
		S.BrightnessFilter_add_i = 0;
		S.BrightnessFilter_add_iz = 0;
		my.BrightnessFilter.prototype.add = function(data) {
			S.BrightnessFilter_add_alpha = this.getAlpha();
			S.BrightnessFilter_add_brightness = (my.isa(this.brightness, 'str')) ? parseFloat(this.brightness) / 100 : this.brightness;
			S.BrightnessFilter_add_d = data.data;
			S.BrightnessFilter_add_brightness = (S.BrightnessFilter_add_brightness < 0) ? 0 : S.BrightnessFilter_add_brightness;
			for (S.BrightnessFilter_add_i = 0, S.BrightnessFilter_add_iz = S.BrightnessFilter_add_d.length; S.BrightnessFilter_add_i < S.BrightnessFilter_add_iz; S.BrightnessFilter_add_i += 4) {
				if (S.BrightnessFilter_add_d[S.BrightnessFilter_add_i + 3] !== 0) {
					S.BrightnessFilter_add_here = S.BrightnessFilter_add_i;
					S.BrightnessFilter_add_d[S.BrightnessFilter_add_here] *= S.BrightnessFilter_add_brightness;
					S.BrightnessFilter_add_d[++S.BrightnessFilter_add_here] *= S.BrightnessFilter_add_brightness;
					S.BrightnessFilter_add_d[++S.BrightnessFilter_add_here] *= S.BrightnessFilter_add_brightness;
					S.BrightnessFilter_add_d[++S.BrightnessFilter_add_here] *= S.BrightnessFilter_add_alpha;
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
			this.saturation = my.xtGet(items.saturation, 1);
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
		S.SaturationFilter_add_alpha = 0;
		S.SaturationFilter_add_d = [];
		S.SaturationFilter_add_here = 0;
		S.SaturationFilter_add_saturation = 0;
		S.SaturationFilter_add_i = 0;
		S.SaturationFilter_add_iz = 0;
		my.SaturationFilter.prototype.add = function(data) {
			S.SaturationFilter_add_alpha = this.getAlpha();
			S.SaturationFilter_add_saturation = (my.isa(this.saturation, 'str')) ? parseFloat(this.saturation) / 100 : this.saturation;
			S.SaturationFilter_add_d = data.data;
			S.SaturationFilter_add_saturation = (S.SaturationFilter_add_saturation < 0) ? 0 : S.SaturationFilter_add_saturation;
			for (S.SaturationFilter_add_i = 0, S.SaturationFilter_add_iz = S.SaturationFilter_add_d.length; S.SaturationFilter_add_i < S.SaturationFilter_add_iz; S.SaturationFilter_add_i += 4) {
				if (S.SaturationFilter_add_d[S.SaturationFilter_add_i + 3] !== 0) {
					S.SaturationFilter_add_here = S.SaturationFilter_add_i;
					S.SaturationFilter_add_d[S.SaturationFilter_add_here] = 127 + ((S.SaturationFilter_add_d[S.SaturationFilter_add_here] - 127) * S.SaturationFilter_add_saturation);
					S.SaturationFilter_add_d[++S.SaturationFilter_add_here] = 127 + ((S.SaturationFilter_add_d[S.SaturationFilter_add_here] - 127) * S.SaturationFilter_add_saturation);
					S.SaturationFilter_add_d[++S.SaturationFilter_add_here] = 127 + ((S.SaturationFilter_add_d[S.SaturationFilter_add_here] - 127) * S.SaturationFilter_add_saturation);
					S.SaturationFilter_add_d[++S.SaturationFilter_add_here] *= S.SaturationFilter_add_alpha;
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
			this.threshold = my.xtGet(items.threshold, 0.5);
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
Add function - takes data, calculates its threshold and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.ThresholdFilter_add_alpha = 0;
		S.ThresholdFilter_add_d = [];
		S.ThresholdFilter_add_here = 0;
		S.ThresholdFilter_add_threshold = 0;
		S.ThresholdFilter_add_i = 0;
		S.ThresholdFilter_add_iz = 0;
		my.ThresholdFilter.prototype.add = function(data) {
			S.ThresholdFilter_add_alpha = this.getAlpha();
			S.ThresholdFilter_add_threshold = (my.isa(this.threshold, 'str')) ? parseFloat(this.threshold) / 100 : this.threshold;
			S.ThresholdFilter_add_threshold = (my.isBetween(S.ThresholdFilter_add_threshold, 0, 1, true)) ? S.ThresholdFilter_add_threshold : ((S.ThresholdFilter_add_threshold > 0.5) ? 1 : 0);
			S.ThresholdFilter_add_threshold *= 255;
			data = my.GreyscaleFilter.prototype.add.call(this, data);
			S.ThresholdFilter_add_d = data.data;
			for (S.ThresholdFilter_add_i = 0, S.ThresholdFilter_add_iz = S.ThresholdFilter_add_d.length; S.ThresholdFilter_add_i < S.ThresholdFilter_add_iz; S.ThresholdFilter_add_i += 4) {
				if (S.ThresholdFilter_add_d[S.ThresholdFilter_add_i + 3] !== 0) {
					S.ThresholdFilter_add_here = S.ThresholdFilter_add_i;
					S.ThresholdFilter_add_d[S.ThresholdFilter_add_here] = (S.ThresholdFilter_add_d[S.ThresholdFilter_add_here] > S.ThresholdFilter_add_threshold) ? 255 : 0;
					S.ThresholdFilter_add_d[++S.ThresholdFilter_add_here] = (S.ThresholdFilter_add_d[S.ThresholdFilter_add_here] > S.ThresholdFilter_add_threshold) ? 255 : 0;
					S.ThresholdFilter_add_d[++S.ThresholdFilter_add_here] = (S.ThresholdFilter_add_d[S.ThresholdFilter_add_here] > S.ThresholdFilter_add_threshold) ? 255 : 0;
					S.ThresholdFilter_add_d[++S.ThresholdFilter_add_here] *= S.ThresholdFilter_add_alpha;
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
			this.red = my.xtGet(items.red, 1);
			this.green = my.xtGet(items.green, 1);
			this.blue = my.xtGet(items.blue, 1);
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
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.ChannelsFilter_add_alpha = 0;
		S.ChannelsFilter_add_d = [];
		S.ChannelsFilter_add_here = 0;
		S.ChannelsFilter_add_red = 0;
		S.ChannelsFilter_add_green = 0;
		S.ChannelsFilter_add_blue = 0;
		S.ChannelsFilter_add_i = 0;
		S.ChannelsFilter_add_iz = 0;
		my.ChannelsFilter.prototype.add = function(data) {
			S.ChannelsFilter_add_alpha = this.getAlpha();
			S.ChannelsFilter_add_red = (my.isa(this.red, 'str')) ? parseFloat(this.red) / 100 : this.red;
			S.ChannelsFilter_add_green = (my.isa(this.green, 'str')) ? parseFloat(this.green) / 100 : this.green;
			S.ChannelsFilter_add_blue = (my.isa(this.blue, 'str')) ? parseFloat(this.blue) / 100 : this.blue;
			S.ChannelsFilter_add_d = data.data;
			S.ChannelsFilter_add_red = (S.ChannelsFilter_add_red < 0) ? 0 : S.ChannelsFilter_add_red;
			S.ChannelsFilter_add_green = (S.ChannelsFilter_add_green < 0) ? 0 : S.ChannelsFilter_add_green;
			S.ChannelsFilter_add_blue = (S.ChannelsFilter_add_blue < 0) ? 0 : S.ChannelsFilter_add_blue;
			for (S.ChannelsFilter_add_i = 0, S.ChannelsFilter_add_iz = S.ChannelsFilter_add_d.length; S.ChannelsFilter_add_i < S.ChannelsFilter_add_iz; S.ChannelsFilter_add_i += 4) {
				if (S.ChannelsFilter_add_d[S.ChannelsFilter_add_i + 3] !== 0) {
					S.ChannelsFilter_add_here = S.ChannelsFilter_add_i;
					S.ChannelsFilter_add_d[S.ChannelsFilter_add_here] *= S.ChannelsFilter_add_red;
					S.ChannelsFilter_add_d[++S.ChannelsFilter_add_here] *= S.ChannelsFilter_add_green;
					S.ChannelsFilter_add_d[++S.ChannelsFilter_add_here] *= S.ChannelsFilter_add_blue;
					S.ChannelsFilter_add_d[++S.ChannelsFilter_add_here] *= S.ChannelsFilter_add_alpha;
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
			this.red = my.xtGet(items.red, 1);
			this.green = my.xtGet(items.green, 1);
			this.blue = my.xtGet(items.blue, 1);
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
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.ChannelStepFilter_add_alpha = 0;
		S.ChannelStepFilter_add_d = [];
		S.ChannelStepFilter_add_here = 0;
		S.ChannelStepFilter_add_red = 0;
		S.ChannelStepFilter_add_green = 0;
		S.ChannelStepFilter_add_blue = 0;
		S.ChannelStepFilter_add_r = 0;
		S.ChannelStepFilter_add_g = 0;
		S.ChannelStepFilter_add_b = 0;
		S.ChannelStepFilter_add_i = 0;
		S.ChannelStepFilter_add_iz = 0;
		my.ChannelStepFilter.prototype.add = function(data) {
			S.ChannelStepFilter_add_alpha = this.getAlpha();
			S.ChannelStepFilter_add_red = this.red;
			S.ChannelStepFilter_add_green = this.green;
			S.ChannelStepFilter_add_blue = this.blue;
			S.ChannelStepFilter_add_d = data.data;
			S.ChannelStepFilter_add_red = (S.ChannelStepFilter_add_red < 1) ? 1 : S.ChannelStepFilter_add_red;
			S.ChannelStepFilter_add_green = (S.ChannelStepFilter_add_green < 1) ? 1 : S.ChannelStepFilter_add_green;
			S.ChannelStepFilter_add_blue = (S.ChannelStepFilter_add_blue < 1) ? 1 : S.ChannelStepFilter_add_blue;
			for (S.ChannelStepFilter_add_i = 0, S.ChannelStepFilter_add_iz = S.ChannelStepFilter_add_d.length; S.ChannelStepFilter_add_i < S.ChannelStepFilter_add_iz; S.ChannelStepFilter_add_i += 4) {
				if (S.ChannelStepFilter_add_d[S.ChannelStepFilter_add_i + 3] !== 0) {
					S.ChannelStepFilter_add_here = S.ChannelStepFilter_add_i;
					S.ChannelStepFilter_add_r = S.ChannelStepFilter_add_d[S.ChannelStepFilter_add_here];
					S.ChannelStepFilter_add_g = S.ChannelStepFilter_add_d[++S.ChannelStepFilter_add_here];
					S.ChannelStepFilter_add_b = S.ChannelStepFilter_add_d[++S.ChannelStepFilter_add_here];
					S.ChannelStepFilter_add_here = S.ChannelStepFilter_add_i;
					S.ChannelStepFilter_add_d[S.ChannelStepFilter_add_here] = Math.floor(S.ChannelStepFilter_add_r / S.ChannelStepFilter_add_red) * S.ChannelStepFilter_add_red;
					S.ChannelStepFilter_add_d[++S.ChannelStepFilter_add_here] = Math.floor(S.ChannelStepFilter_add_g / S.ChannelStepFilter_add_green) * S.ChannelStepFilter_add_green;
					S.ChannelStepFilter_add_d[++S.ChannelStepFilter_add_here] = Math.floor(S.ChannelStepFilter_add_b / S.ChannelStepFilter_add_blue) * S.ChannelStepFilter_add_blue;
					S.ChannelStepFilter_add_d[++S.ChannelStepFilter_add_here] *= S.ChannelStepFilter_add_alpha;
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
			this.redInRed = my.xtGet(items.redInRed, 1);
			this.redInGreen = my.xtGet(items.redInGreen, 0);
			this.redInBlue = my.xtGet(items.redInBlue, 0);
			this.greenInRed = my.xtGet(items.greenInRed, 0);
			this.greenInGreen = my.xtGet(items.greenInGreen, 1);
			this.greenInBlue = my.xtGet(items.greenInBlue, 0);
			this.blueInRed = my.xtGet(items.blueInRed, 0);
			this.blueInGreen = my.xtGet(items.blueInGreen, 0);
			this.blueInBlue = my.xtGet(items.blueInBlue, 1);
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
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.TintFilter_add_alpha = 0;
		S.TintFilter_add_d = [];
		S.TintFilter_add_here = 0;
		S.TintFilter_add_r = 0;
		S.TintFilter_add_g = 0;
		S.TintFilter_add_b = 0;
		S.TintFilter_add_rr = 0;
		S.TintFilter_add_rg = 0;
		S.TintFilter_add_rb = 0;
		S.TintFilter_add_gr = 0;
		S.TintFilter_add_gg = 0;
		S.TintFilter_add_gb = 0;
		S.TintFilter_add_br = 0;
		S.TintFilter_add_bg = 0;
		S.TintFilter_add_bb = 0;
		S.TintFilter_add_i = 0;
		S.TintFilter_add_iz = 0;
		my.TintFilter.prototype.add = function(data) {
			S.TintFilter_add_alpha = this.getAlpha();
			S.TintFilter_add_rr = (my.isa(this.redInRed, 'str')) ? parseFloat(this.redInRed) / 100 : this.redInRed;
			S.TintFilter_add_rg = (my.isa(this.redInGreen, 'str')) ? parseFloat(this.redInGreen) / 100 : this.redInGreen;
			S.TintFilter_add_rb = (my.isa(this.redInBlue, 'str')) ? parseFloat(this.redInBlue) / 100 : this.redInBlue;
			S.TintFilter_add_gr = (my.isa(this.greenInRed, 'str')) ? parseFloat(this.greenInRed) / 100 : this.greenInRed;
			S.TintFilter_add_gg = (my.isa(this.greenInGreen, 'str')) ? parseFloat(this.greenInGreen) / 100 : this.greenInGreen;
			S.TintFilter_add_gb = (my.isa(this.greenInBlue, 'str')) ? parseFloat(this.greenInBlue) / 100 : this.greenInBlue;
			S.TintFilter_add_br = (my.isa(this.blueInRed, 'str')) ? parseFloat(this.blueInRed) / 100 : this.blueInRed;
			S.TintFilter_add_bg = (my.isa(this.blueInGreen, 'str')) ? parseFloat(this.blueInGreen) / 100 : this.blueInGreen;
			S.TintFilter_add_bb = (my.isa(this.blueInBlue, 'str')) ? parseFloat(this.blueInBlue) / 100 : this.blueInBlue;
			S.TintFilter_add_d = data.data;
			for (S.TintFilter_add_i = 0, S.TintFilter_add_iz = S.TintFilter_add_d.length; S.TintFilter_add_i < S.TintFilter_add_iz; S.TintFilter_add_i += 4) {
				if (S.TintFilter_add_d[S.TintFilter_add_i + 3] !== 0) {
					S.TintFilter_add_here = S.TintFilter_add_i;
					S.TintFilter_add_r = S.TintFilter_add_d[S.TintFilter_add_here];
					S.TintFilter_add_g = S.TintFilter_add_d[++S.TintFilter_add_here];
					S.TintFilter_add_b = S.TintFilter_add_d[++S.TintFilter_add_here];
					S.TintFilter_add_here = S.TintFilter_add_i;
					S.TintFilter_add_d[S.TintFilter_add_here] = (S.TintFilter_add_r * S.TintFilter_add_rr) + (S.TintFilter_add_g * S.TintFilter_add_gr) + (S.TintFilter_add_b * S.TintFilter_add_br);
					S.TintFilter_add_d[++S.TintFilter_add_here] = (S.TintFilter_add_r * S.TintFilter_add_rg) + (S.TintFilter_add_g * S.TintFilter_add_gg) + (S.TintFilter_add_b * S.TintFilter_add_bg);
					S.TintFilter_add_d[++S.TintFilter_add_here] = (S.TintFilter_add_r * S.TintFilter_add_rb) + (S.TintFilter_add_g * S.TintFilter_add_gb) + (S.TintFilter_add_b * S.TintFilter_add_bb);
					S.TintFilter_add_d[++S.TintFilter_add_here] *= S.TintFilter_add_alpha;
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
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.width = my.xtGet(items.width, false);
			this.height = my.xtGet(items.height, false);
			this.data = (my.xt(items.data)) ? items.data : [1];
			this.x = my.xtGet(items.x, Math.floor(this.width / 2));
			this.y = my.xtGet(items.y, Math.floor(this.height / 2));
			this.includeInvisiblePoints = my.xtGet(items.includeInvisiblePoints, false);
			this.setFilter();
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
@property includeInvisiblePoints
@type Number
@default false
**/
			includeInvisiblePoints: false,
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
Set attribute values.

@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.MatrixFilter.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			this.width = my.xtGet(items.width, false);
			this.height = my.xtGet(items.height, false);
			this.setFilter();
		};
		/**
SetFilter builds the matrix from width, height and data attributes already supplied to the filter via the constructor or MatrixFilter.set()

@method setFilter
@return This
@chainable
@private
**/
		S.MatrixFilter_setFilter_i = 0;
		S.MatrixFilter_setFilter_j = 0;
		S.MatrixFilter_setFilter_k = 0;
		S.MatrixFilter_setFilter_reqLen = 0;
		S.MatrixFilter_setFilter_counter = 0;
		my.MatrixFilter.prototype.setFilter = function() {
			//var reqLen,
			//i, j, k,
			S.MatrixFilter_setFilter_counter = 0;
			if (!this.height && this.width && my.isa(this.width, 'num') && this.width >= 1) {
				this.width = Math.floor(this.width);
				S.MatrixFilter_setFilter_reqLen = Math.ceil(this.data.length / this.width);
				this.height = S.MatrixFilter_setFilter_reqLen;
				S.MatrixFilter_setFilter_reqLen = this.width * this.height;
			}
			else if (!this.width && this.height && my.isa(this.height, 'num') && this.height >= 1) {
				this.height = Math.floor(this.height);
				S.MatrixFilter_setFilter_reqLen = Math.ceil(this.data.length / this.height);
				this.width = S.MatrixFilter_setFilter_reqLen;
				S.MatrixFilter_setFilter_reqLen = this.width * this.height;
			}
			else if (this.width && my.isa(this.width, 'num') && this.width >= 1 && this.height && my.isa(this.height, 'num') && this.height >= 1) {
				this.width = Math.round(this.width);
				this.height = Math.round(this.height);
				S.MatrixFilter_setFilter_reqLen = this.width * this.height;
			}
			else {
				S.MatrixFilter_setFilter_reqLen = Math.ceil(Math.sqrt(this.data.length));
				S.MatrixFilter_setFilter_reqLen = (S.MatrixFilter_setFilter_reqLen % 2 === 1) ? Math.pow(S.MatrixFilter_setFilter_reqLen, 2) : Math.pow(S.MatrixFilter_setFilter_reqLen + 1, 2);
				this.width = Math.round(Math.sqrt(S.MatrixFilter_setFilter_reqLen));
				this.height = this.width;
			}
			for (S.MatrixFilter_setFilter_k = 0; S.MatrixFilter_setFilter_k < S.MatrixFilter_setFilter_reqLen; S.MatrixFilter_setFilter_k++) {
				this.data[S.MatrixFilter_setFilter_k] = (my.xt(this.data[S.MatrixFilter_setFilter_k])) ? parseFloat(this.data[S.MatrixFilter_setFilter_k]) : 0;
				this.data[S.MatrixFilter_setFilter_k] = (isNaN(this.data[S.MatrixFilter_setFilter_k])) ? 0 : this.data[S.MatrixFilter_setFilter_k];
			}
			this.cells = [];
			for (S.MatrixFilter_setFilter_i = 0; S.MatrixFilter_setFilter_i < this.height; S.MatrixFilter_setFilter_i++) { //col (y)
				for (S.MatrixFilter_setFilter_j = 0; S.MatrixFilter_setFilter_j < this.width; S.MatrixFilter_setFilter_j++) { //row (x)
					if (this.data[S.MatrixFilter_setFilter_counter] !== 0) {
						this.cells.push([S.MatrixFilter_setFilter_j - this.x, S.MatrixFilter_setFilter_i - this.y, this.data[S.MatrixFilter_setFilter_counter]]);
					}
					S.MatrixFilter_setFilter_counter++;
				}
			}
			return this;
		};
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.MatrixFilter_add_alpha = 0;
		S.MatrixFilter_add_d0 = [];
		S.MatrixFilter_add_dR = [];
		S.MatrixFilter_add_result = null; // ImageData object
		S.MatrixFilter_add_r = 0;
		S.MatrixFilter_add_g = 0;
		S.MatrixFilter_add_b = 0;
		S.MatrixFilter_add_i = 0;
		S.MatrixFilter_add_iz = 0;
		S.MatrixFilter_add_j = 0;
		S.MatrixFilter_add_jz = 0;
		S.MatrixFilter_add_k = 0;
		S.MatrixFilter_add_kz = 0;
		S.MatrixFilter_add_w = 0;
		S.MatrixFilter_add_c = 0;
		S.MatrixFilter_add_e = 0;
		S.MatrixFilter_add_e0 = 0;
		S.MatrixFilter_add_x = 0;
		S.MatrixFilter_add_y = 0;
		my.MatrixFilter.prototype.add = function(data) {
			S.MatrixFilter_add_alpha = this.getAlpha();
			S.MatrixFilter_add_d0 = data.data;
			S.MatrixFilter_add_result = my.cvx.createImageData(data.width, data.height);
			S.MatrixFilter_add_dR = S.MatrixFilter_add_result.data;
			if (this.includeInvisiblePoints) {
				for (S.MatrixFilter_add_i = 0, S.MatrixFilter_add_iz = data.height; S.MatrixFilter_add_i < S.MatrixFilter_add_iz; S.MatrixFilter_add_i++) {
					for (S.MatrixFilter_add_j = 0, S.MatrixFilter_add_jz = data.width; S.MatrixFilter_add_j < S.MatrixFilter_add_jz; S.MatrixFilter_add_j++) {
						S.MatrixFilter_add_e0 = ((S.MatrixFilter_add_i * S.MatrixFilter_add_jz) + S.MatrixFilter_add_j) * 4;
						if (S.MatrixFilter_add_d0[S.MatrixFilter_add_e0 + 3] > 0) {
							S.MatrixFilter_add_r = 0;
							S.MatrixFilter_add_g = 0;
							S.MatrixFilter_add_b = 0;
							S.MatrixFilter_add_c = 0;
							for (S.MatrixFilter_add_k = 0, S.MatrixFilter_add_kz = this.cells.length; S.MatrixFilter_add_k < S.MatrixFilter_add_kz; S.MatrixFilter_add_k++) {
								S.MatrixFilter_add_x = S.MatrixFilter_add_j + this.cells[S.MatrixFilter_add_k][0];
								S.MatrixFilter_add_y = S.MatrixFilter_add_i + this.cells[S.MatrixFilter_add_k][1];
								if (S.MatrixFilter_add_x >= 0 && S.MatrixFilter_add_x < S.MatrixFilter_add_jz && S.MatrixFilter_add_y >= 0 && S.MatrixFilter_add_y < S.MatrixFilter_add_iz) {
									S.MatrixFilter_add_w = this.cells[S.MatrixFilter_add_k][2];
									S.MatrixFilter_add_e = ((S.MatrixFilter_add_y * S.MatrixFilter_add_jz) + S.MatrixFilter_add_x) * 4;
									S.MatrixFilter_add_c += S.MatrixFilter_add_w;
									S.MatrixFilter_add_r += (S.MatrixFilter_add_d0[S.MatrixFilter_add_e] * S.MatrixFilter_add_w);
									S.MatrixFilter_add_e++;
									S.MatrixFilter_add_g += (S.MatrixFilter_add_d0[S.MatrixFilter_add_e] * S.MatrixFilter_add_w);
									S.MatrixFilter_add_e++;
									S.MatrixFilter_add_b += (S.MatrixFilter_add_d0[S.MatrixFilter_add_e] * S.MatrixFilter_add_w);
								}
							}
							if (S.MatrixFilter_add_c !== 0) {
								S.MatrixFilter_add_r /= S.MatrixFilter_add_c;
								S.MatrixFilter_add_g /= S.MatrixFilter_add_c;
								S.MatrixFilter_add_b /= S.MatrixFilter_add_c;
							}
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_r;
							S.MatrixFilter_add_e0++;
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_g;
							S.MatrixFilter_add_e0++;
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_b;
							S.MatrixFilter_add_e0++;
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_d0[S.MatrixFilter_add_e0] * S.MatrixFilter_add_alpha;
						}
					}
				}
			}
			else {
				for (S.MatrixFilter_add_i = 0, S.MatrixFilter_add_iz = data.height; S.MatrixFilter_add_i < S.MatrixFilter_add_iz; S.MatrixFilter_add_i++) {
					for (S.MatrixFilter_add_j = 0, S.MatrixFilter_add_jz = data.width; S.MatrixFilter_add_j < S.MatrixFilter_add_jz; S.MatrixFilter_add_j++) {
						S.MatrixFilter_add_e0 = ((S.MatrixFilter_add_i * S.MatrixFilter_add_jz) + S.MatrixFilter_add_j) * 4;
						if (S.MatrixFilter_add_d0[S.MatrixFilter_add_e0 + 3] > 0) {
							S.MatrixFilter_add_r = 0;
							S.MatrixFilter_add_g = 0;
							S.MatrixFilter_add_b = 0;
							S.MatrixFilter_add_c = 0;
							for (S.MatrixFilter_add_k = 0, S.MatrixFilter_add_kz = this.cells.length; S.MatrixFilter_add_k < S.MatrixFilter_add_kz; S.MatrixFilter_add_k++) {
								S.MatrixFilter_add_x = S.MatrixFilter_add_j + this.cells[S.MatrixFilter_add_k][0];
								S.MatrixFilter_add_y = S.MatrixFilter_add_i + this.cells[S.MatrixFilter_add_k][1];
								if (S.MatrixFilter_add_x >= 0 && S.MatrixFilter_add_x < S.MatrixFilter_add_jz && S.MatrixFilter_add_y >= 0 && S.MatrixFilter_add_y < S.MatrixFilter_add_iz) {
									S.MatrixFilter_add_w = this.cells[S.MatrixFilter_add_k][2];
									S.MatrixFilter_add_e = ((S.MatrixFilter_add_y * S.MatrixFilter_add_jz) + S.MatrixFilter_add_x) * 4;
									if (S.MatrixFilter_add_d0[S.MatrixFilter_add_e + 3] > 0) {
										S.MatrixFilter_add_c += S.MatrixFilter_add_w;
										S.MatrixFilter_add_r += (S.MatrixFilter_add_d0[S.MatrixFilter_add_e] * S.MatrixFilter_add_w);
										S.MatrixFilter_add_e++;
										S.MatrixFilter_add_g += (S.MatrixFilter_add_d0[S.MatrixFilter_add_e] * S.MatrixFilter_add_w);
										S.MatrixFilter_add_e++;
										S.MatrixFilter_add_b += (S.MatrixFilter_add_d0[S.MatrixFilter_add_e] * S.MatrixFilter_add_w);
									}
								}
							}
							if (S.MatrixFilter_add_c !== 0) {
								S.MatrixFilter_add_r /= S.MatrixFilter_add_c;
								S.MatrixFilter_add_g /= S.MatrixFilter_add_c;
								S.MatrixFilter_add_b /= S.MatrixFilter_add_c;
							}
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_r;
							S.MatrixFilter_add_e0++;
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_g;
							S.MatrixFilter_add_e0++;
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_b;
							S.MatrixFilter_add_e0++;
							S.MatrixFilter_add_dR[S.MatrixFilter_add_e0] = S.MatrixFilter_add_d0[S.MatrixFilter_add_e0] * S.MatrixFilter_add_alpha;
						}
					}
				}
			}
			return S.MatrixFilter_add_result;
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
			this.width = my.xtGet(items.width, 5);
			this.height = my.xtGet(items.height, 5);
			this.offsetX = my.xtGet(items.offsetX, 0);
			this.offsetY = my.xtGet(items.offsetY, 0);
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
			/**
@property offsetX - horizontal coordinate from which to begin pexelization
@type Number
@default 0
**/
			offsetX: 0,
			/**
@property offsetY - vertical coordinate from which to begin pexelization
@type Number
@default 0
**/
			offsetY: 0,
		};
		my.mergeInto(my.d.PixelateFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.PixelateFilter_add_alpha = 0;
		S.PixelateFilter_add_d0 = [];
		S.PixelateFilter_add_dR = [];
		S.PixelateFilter_add_result = null; // ImageData object
		S.PixelateFilter_add_r = 0;
		S.PixelateFilter_add_g = 0;
		S.PixelateFilter_add_b = 0;
		S.PixelateFilter_add_a = 0;
		S.PixelateFilter_add_i = 0;
		S.PixelateFilter_add_iz = 0;
		S.PixelateFilter_add_j = 0;
		S.PixelateFilter_add_jz = 0;
		S.PixelateFilter_add_x = 0;
		S.PixelateFilter_add_y = 0;
		S.PixelateFilter_add_w = 0;
		S.PixelateFilter_add_h = 0;
		S.PixelateFilter_add_xj = 0;
		S.PixelateFilter_add_yi = 0;
		S.PixelateFilter_add_dW = 0;
		S.PixelateFilter_add_dH = 0;
		S.PixelateFilter_add_tW = 0;
		S.PixelateFilter_add_tH = 0;
		S.PixelateFilter_add_count = 0;
		S.PixelateFilter_add_pos = 0;
		S.PixelateFilter_add_test = false;
		my.PixelateFilter.prototype.add = function(data) {
			S.PixelateFilter_add_alpha = this.getAlpha();
			S.PixelateFilter_add_d0 = data.data;
			S.PixelateFilter_add_result = my.cvx.createImageData(data.width, data.height);
			S.PixelateFilter_add_dR = S.PixelateFilter_add_result.data;
			S.PixelateFilter_add_dW = data.width;
			S.PixelateFilter_add_dH = data.height;
			S.PixelateFilter_add_tW = S.PixelateFilter_add_dW - 1;
			S.PixelateFilter_add_tH = S.PixelateFilter_add_dH - 1;
			S.PixelateFilter_add_w = this.width;
			S.PixelateFilter_add_h = this.height;
			for (S.PixelateFilter_add_x = this.offsetX - S.PixelateFilter_add_w; S.PixelateFilter_add_x < S.PixelateFilter_add_dW; S.PixelateFilter_add_x += S.PixelateFilter_add_w) {
				for (S.PixelateFilter_add_y = this.offsetY - S.PixelateFilter_add_h; S.PixelateFilter_add_y < S.PixelateFilter_add_dH; S.PixelateFilter_add_y += S.PixelateFilter_add_h) {
					S.PixelateFilter_add_r = 0;
					S.PixelateFilter_add_g = 0;
					S.PixelateFilter_add_b = 0;
					S.PixelateFilter_add_a = 0;
					S.PixelateFilter_add_count = 0;
					for (S.PixelateFilter_add_i = S.PixelateFilter_add_y, S.PixelateFilter_add_iz = S.PixelateFilter_add_y + S.PixelateFilter_add_h; S.PixelateFilter_add_i < S.PixelateFilter_add_iz; S.PixelateFilter_add_i++) {
						for (S.PixelateFilter_add_j = S.PixelateFilter_add_x, S.PixelateFilter_add_jz = S.PixelateFilter_add_x + S.PixelateFilter_add_w; S.PixelateFilter_add_j < S.PixelateFilter_add_jz; S.PixelateFilter_add_j++) {
							S.PixelateFilter_add_test = (S.PixelateFilter_add_j < 0 || S.PixelateFilter_add_j > S.PixelateFilter_add_tW || S.PixelateFilter_add_i < 0 || S.PixelateFilter_add_i > S.PixelateFilter_add_tH) ? true : false;
							if (!S.PixelateFilter_add_test) {
								S.PixelateFilter_add_pos = ((S.PixelateFilter_add_i * S.PixelateFilter_add_dW) + S.PixelateFilter_add_j) * 4;
								if (S.PixelateFilter_add_d0[S.PixelateFilter_add_pos + 3] > 0) {
									S.PixelateFilter_add_r += S.PixelateFilter_add_d0[S.PixelateFilter_add_pos];
									S.PixelateFilter_add_g += S.PixelateFilter_add_d0[++S.PixelateFilter_add_pos];
									S.PixelateFilter_add_b += S.PixelateFilter_add_d0[++S.PixelateFilter_add_pos];
									S.PixelateFilter_add_a += S.PixelateFilter_add_d0[++S.PixelateFilter_add_pos];
									S.PixelateFilter_add_count++;
								}
							}
						}
					}
					if (S.PixelateFilter_add_count > 0 && S.PixelateFilter_add_a > 0) {
						S.PixelateFilter_add_r = Math.round(S.PixelateFilter_add_r / S.PixelateFilter_add_count);
						S.PixelateFilter_add_g = Math.round(S.PixelateFilter_add_g / S.PixelateFilter_add_count);
						S.PixelateFilter_add_b = Math.round(S.PixelateFilter_add_b / S.PixelateFilter_add_count);
						S.PixelateFilter_add_pos = ((S.PixelateFilter_add_y * S.PixelateFilter_add_dW) + S.PixelateFilter_add_x) * 4;
						for (S.PixelateFilter_add_i = S.PixelateFilter_add_y, S.PixelateFilter_add_iz = S.PixelateFilter_add_y + S.PixelateFilter_add_h; S.PixelateFilter_add_i < S.PixelateFilter_add_iz; S.PixelateFilter_add_i++) {
							for (S.PixelateFilter_add_j = S.PixelateFilter_add_x, S.PixelateFilter_add_jz = S.PixelateFilter_add_x + S.PixelateFilter_add_w; S.PixelateFilter_add_j < S.PixelateFilter_add_jz; S.PixelateFilter_add_j++) {
								S.PixelateFilter_add_pos = ((S.PixelateFilter_add_i * S.PixelateFilter_add_dW) + S.PixelateFilter_add_j) * 4;
								S.PixelateFilter_add_dR[S.PixelateFilter_add_pos] = S.PixelateFilter_add_r;
								S.PixelateFilter_add_dR[++S.PixelateFilter_add_pos] = S.PixelateFilter_add_g;
								S.PixelateFilter_add_dR[++S.PixelateFilter_add_pos] = S.PixelateFilter_add_b;
								S.PixelateFilter_add_dR[++S.PixelateFilter_add_pos] = S.PixelateFilter_add_d0[S.PixelateFilter_add_pos] * S.PixelateFilter_add_alpha;
							}
						}
					}
				}
			}
			return S.PixelateFilter_add_result;
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
			this.radiusX = my.xtGet(items.radiusX, 2);
			this.radiusY = my.xtGet(items.radiusY, 2);
			this.roll = my.xtGet(items.roll, 2);
			this.skip = my.xtGet(items.skip, 1);
			this.cells = (my.xt(items.cells)) ? items.cells : false;
			this.includeInvisiblePoints = my.xtGet(items.includeInvisiblePoints, false);
			if (!my.isa(this.cells, 'arr')) {
				this.cells = this.getBrush();
			}
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
@property radiusX
@type Number
@default 2
**/
			radiusX: 2,
			/**
@property radiusY
@type Number
@default 2
**/
			radiusY: 2,
			/**
@property skip
@type Number
@default 1
**/
			skip: 1,
			/**
@property roll
@type Number
@default 0
**/
			roll: 0,
			/**
@property includeInvisiblePoints
@type Number
@default false
**/
			includeInvisiblePoints: false,
		};
		my.mergeInto(my.d.BlurFilter, my.d.Filter);
		/**
Set attribute values.

@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.BlurFilter.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			if (!my.isa(items.cells, 'arr')) {
				this.cells = this.getBrush();
			}
		};
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.BlurFilter_add_alpha = 0;
		S.BlurFilter_add_d0 = [];
		S.BlurFilter_add_result = null; // ImageData object
		S.BlurFilter_add_dR = [];
		S.BlurFilter_add_c = 0;
		S.BlurFilter_add_s = 0;
		S.BlurFilter_add_count = 0;
		S.BlurFilter_add_i = 0;
		S.BlurFilter_add_iz = 0;
		S.BlurFilter_add_j = 0;
		S.BlurFilter_add_jz = 0;
		S.BlurFilter_add_k = 0;
		S.BlurFilter_add_kz = 0;
		S.BlurFilter_add_r = 0;
		S.BlurFilter_add_g = 0;
		S.BlurFilter_add_b = 0;
		S.BlurFilter_add_e = 0;
		S.BlurFilter_add_e0 = 0;
		S.BlurFilter_add_x = 0;
		S.BlurFilter_add_y = 0;
		my.BlurFilter.prototype.add = function(data) {
			S.BlurFilter_add_alpha = this.getAlpha();
			S.BlurFilter_add_d0 = data.data;
			S.BlurFilter_add_result = my.cvx.createImageData(data.width, data.height);
			S.BlurFilter_add_dR = S.BlurFilter_add_result.data;
			S.BlurFilter_add_c = this.cells.length;
			S.BlurFilter_add_s = Math.floor(S.BlurFilter_add_c / this.skip);
			if (this.includeInvisiblePoints) {
				for (S.BlurFilter_add_i = 0, S.BlurFilter_add_iz = data.height; S.BlurFilter_add_i < S.BlurFilter_add_iz; S.BlurFilter_add_i++) {
					for (S.BlurFilter_add_j = 0, S.BlurFilter_add_jz = data.width; S.BlurFilter_add_j < S.BlurFilter_add_jz; S.BlurFilter_add_j++) {
						S.BlurFilter_add_e0 = ((S.BlurFilter_add_i * S.BlurFilter_add_jz) + S.BlurFilter_add_j) * 4;
						if (S.BlurFilter_add_d0[S.BlurFilter_add_e0 + 3] > 0) {
							S.BlurFilter_add_r = 0;
							S.BlurFilter_add_g = 0;
							S.BlurFilter_add_b = 0;
							for (S.BlurFilter_add_k = 0, S.BlurFilter_add_kz = S.BlurFilter_add_c; S.BlurFilter_add_k < S.BlurFilter_add_kz; S.BlurFilter_add_k += this.skip) {
								S.BlurFilter_add_x = S.BlurFilter_add_j + this.cells[S.BlurFilter_add_k][0];
								S.BlurFilter_add_y = S.BlurFilter_add_i + this.cells[S.BlurFilter_add_k][1];
								if (S.BlurFilter_add_x >= 0 && S.BlurFilter_add_x < S.BlurFilter_add_jz && S.BlurFilter_add_y >= 0 && S.BlurFilter_add_y < S.BlurFilter_add_iz) {
									S.BlurFilter_add_e = ((S.BlurFilter_add_y * S.BlurFilter_add_jz) + S.BlurFilter_add_x) * 4;
									S.BlurFilter_add_r += S.BlurFilter_add_d0[S.BlurFilter_add_e];
									S.BlurFilter_add_e++;
									S.BlurFilter_add_g += S.BlurFilter_add_d0[S.BlurFilter_add_e];
									S.BlurFilter_add_e++;
									S.BlurFilter_add_b += S.BlurFilter_add_d0[S.BlurFilter_add_e];
								}
							}
							if (S.BlurFilter_add_s !== 0) {
								S.BlurFilter_add_r /= S.BlurFilter_add_s;
								S.BlurFilter_add_g /= S.BlurFilter_add_s;
								S.BlurFilter_add_b /= S.BlurFilter_add_s;
							}
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_r;
							S.BlurFilter_add_e0++;
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_g;
							S.BlurFilter_add_e0++;
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_b;
							S.BlurFilter_add_e0++;
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_d0[S.BlurFilter_add_e0] * S.BlurFilter_add_alpha;
						}
					}
				}
			}
			else {
				for (S.BlurFilter_add_i = 0, S.BlurFilter_add_iz = data.height; S.BlurFilter_add_i < S.BlurFilter_add_iz; S.BlurFilter_add_i++) {
					for (S.BlurFilter_add_j = 0, S.BlurFilter_add_jz = data.width; S.BlurFilter_add_j < S.BlurFilter_add_jz; S.BlurFilter_add_j++) {
						S.BlurFilter_add_e0 = ((S.BlurFilter_add_i * S.BlurFilter_add_jz) + S.BlurFilter_add_j) * 4;
						if (S.BlurFilter_add_d0[S.BlurFilter_add_e0 + 3] > 0) {
							S.BlurFilter_add_r = 0;
							S.BlurFilter_add_g = 0;
							S.BlurFilter_add_b = 0;
							S.BlurFilter_add_count = 0;
							for (S.BlurFilter_add_k = 0, S.BlurFilter_add_kz = S.BlurFilter_add_c; S.BlurFilter_add_k < S.BlurFilter_add_kz; S.BlurFilter_add_k += this.skip) {
								S.BlurFilter_add_x = S.BlurFilter_add_j + this.cells[S.BlurFilter_add_k][0];
								S.BlurFilter_add_y = S.BlurFilter_add_i + this.cells[S.BlurFilter_add_k][1];
								if (S.BlurFilter_add_x >= 0 && S.BlurFilter_add_x < S.BlurFilter_add_jz && S.BlurFilter_add_y >= 0 && S.BlurFilter_add_y < S.BlurFilter_add_iz) {
									S.BlurFilter_add_e = ((S.BlurFilter_add_y * S.BlurFilter_add_jz) + S.BlurFilter_add_x) * 4;
									if (S.BlurFilter_add_d0[S.BlurFilter_add_e + 3] > 0) {
										S.BlurFilter_add_count++;
										S.BlurFilter_add_r += S.BlurFilter_add_d0[S.BlurFilter_add_e];
										S.BlurFilter_add_e++;
										S.BlurFilter_add_g += S.BlurFilter_add_d0[S.BlurFilter_add_e];
										S.BlurFilter_add_e++;
										S.BlurFilter_add_b += S.BlurFilter_add_d0[S.BlurFilter_add_e];
									}
								}
							}
							if (S.BlurFilter_add_count !== 0) {
								S.BlurFilter_add_r /= S.BlurFilter_add_count;
								S.BlurFilter_add_g /= S.BlurFilter_add_count;
								S.BlurFilter_add_b /= S.BlurFilter_add_count;
							}
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_r;
							S.BlurFilter_add_e0++;
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_g;
							S.BlurFilter_add_e0++;
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_b;
							S.BlurFilter_add_e0++;
							S.BlurFilter_add_dR[S.BlurFilter_add_e0] = S.BlurFilter_add_d0[S.BlurFilter_add_e0] * S.BlurFilter_add_alpha;
						}
					}
				}
			}
			return S.BlurFilter_add_result;
		};
		/**
Blur helper function

@method getBrush
@param x {Number} brush x radius
@param y {Number} brush y radius
@param r {Number} brush roll (in degrees)
@return Array of objects used for the blur brush
**/
		S.BlurFilter_getBrush_x = 0;
		S.BlurFilter_getBrush_y = 0;
		S.BlurFilter_getBrush_r = 0;
		S.BlurFilter_getBrush_dim = 0;
		S.BlurFilter_getBrush_hDim = 0;
		S.BlurFilter_getBrush_cos = 0;
		S.BlurFilter_getBrush_sin = 0;
		S.BlurFilter_getBrush_brush = [];
		S.BlurFilter_getBrush_cv = null; //DOM Canvas object
		S.BlurFilter_getBrush_cvx = null; //DOM Canvas context object
		S.BlurFilter_getBrush_i = 0;
		S.BlurFilter_getBrush_j = 0;
		my.BlurFilter.prototype.getBrush = function() {
			S.BlurFilter_getBrush_x = this.radiusX;
			S.BlurFilter_getBrush_y = this.radiusY;
			S.BlurFilter_getBrush_r = this.roll;
			S.BlurFilter_getBrush_dim = (S.BlurFilter_getBrush_x > S.BlurFilter_getBrush_y) ? S.BlurFilter_getBrush_x + 2 : S.BlurFilter_getBrush_y + 2;
			S.BlurFilter_getBrush_hDim = Math.floor(S.BlurFilter_getBrush_dim / 2);
			S.BlurFilter_getBrush_cos = Math.cos(S.BlurFilter_getBrush_r * my.radian);
			S.BlurFilter_getBrush_sin = Math.sin(S.BlurFilter_getBrush_r * my.radian);
			S.BlurFilter_getBrush_brush = [];
			S.BlurFilter_getBrush_cv = my.filterCanvas;
			S.BlurFilter_getBrush_cvx = my.filterCvx;
			S.BlurFilter_getBrush_cv.width = S.BlurFilter_getBrush_dim;
			S.BlurFilter_getBrush_cv.height = S.BlurFilter_getBrush_dim;
			S.BlurFilter_getBrush_cvx.setTransform(S.BlurFilter_getBrush_cos, S.BlurFilter_getBrush_sin, -S.BlurFilter_getBrush_sin, S.BlurFilter_getBrush_cos, S.BlurFilter_getBrush_hDim, S.BlurFilter_getBrush_hDim);
			S.BlurFilter_getBrush_cvx.beginPath();
			S.BlurFilter_getBrush_cvx.moveTo(-S.BlurFilter_getBrush_x, 0);
			S.BlurFilter_getBrush_cvx.lineTo(-1, -1);
			S.BlurFilter_getBrush_cvx.lineTo(0, -S.BlurFilter_getBrush_y);
			S.BlurFilter_getBrush_cvx.lineTo(1, -1);
			S.BlurFilter_getBrush_cvx.lineTo(S.BlurFilter_getBrush_x, 0);
			S.BlurFilter_getBrush_cvx.lineTo(1, 1);
			S.BlurFilter_getBrush_cvx.lineTo(0, S.BlurFilter_getBrush_y);
			S.BlurFilter_getBrush_cvx.lineTo(-1, 1);
			S.BlurFilter_getBrush_cvx.lineTo(-S.BlurFilter_getBrush_x, 0);
			S.BlurFilter_getBrush_cvx.closePath();
			for (S.BlurFilter_getBrush_i = 0; S.BlurFilter_getBrush_i < S.BlurFilter_getBrush_dim; S.BlurFilter_getBrush_i++) { //rows (y)
				for (S.BlurFilter_getBrush_j = 0; S.BlurFilter_getBrush_j < S.BlurFilter_getBrush_dim; S.BlurFilter_getBrush_j++) { //cols (x)
					if (S.BlurFilter_getBrush_cvx.isPointInPath(S.BlurFilter_getBrush_j, S.BlurFilter_getBrush_i)) {
						S.BlurFilter_getBrush_brush.push([S.BlurFilter_getBrush_j - S.BlurFilter_getBrush_hDim, S.BlurFilter_getBrush_i - S.BlurFilter_getBrush_hDim, 1]);
					}
				}
			}
			S.BlurFilter_getBrush_cvx.setTransform(1, 0, 0, 1, 0, 0);
			return S.BlurFilter_getBrush_brush;
		};
		/**
# LeachFilter

## Instantiation

* scrawl.newLeachFilter()

## Purpose

* Adds a leach filter effect to an Entity or cell. Leaching turns certain color ranges to transparency

## Access

* scrawl.filter.FILTERNAME - for the LeachFilter object

@class LeachFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.LeachFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.minRed = my.xtGet(items.minRed, 0);
			this.minGreen = my.xtGet(items.minGreen, 0);
			this.minBlue = my.xtGet(items.minBlue, 0);
			this.maxRed = my.xtGet(items.maxRed, 255);
			this.maxGreen = my.xtGet(items.maxGreen, 255);
			this.maxBlue = my.xtGet(items.maxBlue, 255);
			this.preserve = my.xtGet(items.preserve, false);
			this.composite = (this.preserve) ? 'destination-in' : 'destination-out';
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.LeachFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.LeachFilter.prototype.type = 'LeachFilter';
		my.LeachFilter.prototype.classname = 'filternames';
		my.d.LeachFilter = {
			/**
@property minRed
@type Number
@default 0
**/
			minRed: 0,
			/**
@property minGreen
@type Number
@default 0
**/
			minGreen: 0,
			/**
@property minBlue
@type Number
@default 0
**/
			minBlue: 0,
			/**
@property maxRed
@type Number
@default 255
**/
			maxRed: 255,
			/**
@property maxGreen
@type Number
@default 255
**/
			maxGreen: 255,
			/**
@property maxBlue
@type Number
@default 255
**/
			maxBlue: 255,
			/**
When the preserve function is set to true, the selected areas are retained; on false they are leached
@property preserve
@type Boolean
@default false
**/
			preserve: false,
		};
		my.mergeInto(my.d.LeachFilter, my.d.Filter);
		/**
Set attribute values.

@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.LeachFilter.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			if (my.xt(items.preserve) && my.isa(items.preserve, 'bool')) {
				this.composite = (items.preserve) ? 'destination-in' : 'destination-out';
			}
		};
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.LeachFilter_add_alpha = 0;
		S.LeachFilter_add_rMax = 0;
		S.LeachFilter_add_gMax = 0;
		S.LeachFilter_add_bMax = 0;
		S.LeachFilter_add_rMin = 0;
		S.LeachFilter_add_gMin = 0;
		S.LeachFilter_add_bMin = 0;
		S.LeachFilter_add_d = [];
		S.LeachFilter_add_i = 0;
		S.LeachFilter_add_iz = 0;
		S.LeachFilter_add_flag = false;
		my.LeachFilter.prototype.add = function(data) {
			S.LeachFilter_add_alpha = Math.floor(this.getAlpha() * 255);
			S.LeachFilter_add_rMax = this.maxRed;
			S.LeachFilter_add_gMax = this.maxGreen;
			S.LeachFilter_add_bMax = this.maxBlue;
			S.LeachFilter_add_rMin = this.minRed;
			S.LeachFilter_add_gMin = this.minGreen;
			S.LeachFilter_add_bMin = this.minBlue;
			S.LeachFilter_add_d = data.data;
			for (S.LeachFilter_add_i = 0, S.LeachFilter_add_iz = S.LeachFilter_add_d.length; S.LeachFilter_add_i < S.LeachFilter_add_iz; S.LeachFilter_add_i += 4) {
				if (S.LeachFilter_add_d[S.LeachFilter_add_i + 3] > 0) {
					S.LeachFilter_add_flag = false;
					if (my.isBetween(S.LeachFilter_add_d[S.LeachFilter_add_i], S.LeachFilter_add_rMin, S.LeachFilter_add_rMax, true)) {
						if (my.isBetween(S.LeachFilter_add_d[S.LeachFilter_add_i + 1], S.LeachFilter_add_gMin, S.LeachFilter_add_gMax, true)) {
							if (my.isBetween(S.LeachFilter_add_d[S.LeachFilter_add_i + 2], S.LeachFilter_add_bMin, S.LeachFilter_add_bMax, true)) {
								S.LeachFilter_add_d[S.LeachFilter_add_i + 3] = S.LeachFilter_add_alpha;
								S.LeachFilter_add_flag = true;
							}
						}
					}
					if (!S.LeachFilter_add_flag) {
						S.LeachFilter_add_d[S.LeachFilter_add_i + 3] = 0;
					}
				}
			}
			return data;
		};
		/**
# SeparateFilter

## Instantiation

* scrawl.newSeparateFilter()

## Purpose

* separate and reposition the color channels

## Access

* scrawl.filter.FILTERNAME - for the StereoFilter object

@class StereoFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.SeparateFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.channel = my.xtGet(items.channel, 'all');
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.SeparateFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.SeparateFilter.prototype.type = 'SeparateFilter';
		my.SeparateFilter.prototype.classname = 'filternames';
		my.d.SeparateFilter = {
			/**
@property channel

Can be one of: 'red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'all'

@type String
@default 'all'
**/
			channel: 'all',
		};
		my.mergeInto(my.d.SeparateFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.SeparateFilter_add_alpha = 0;
		S.SeparateFilter_add_channel = '';
		S.SeparateFilter_add_d = [];
		S.SeparateFilter_add_i = 0;
		S.SeparateFilter_add_iz = 0;
		S.SeparateFilter_add_col = 0;
		my.SeparateFilter.prototype.add = function(data) {
			S.SeparateFilter_add_alpha = this.getAlpha();
			S.SeparateFilter_add_channel = this.channel;
			S.SeparateFilter_add_d = data.data;
			//i, iz, col;
			for (S.SeparateFilter_add_i = 0, S.SeparateFilter_add_iz = S.SeparateFilter_add_d.length; S.SeparateFilter_add_i < S.SeparateFilter_add_iz; S.SeparateFilter_add_i += 4) {
				if (S.SeparateFilter_add_d[S.SeparateFilter_add_i + 3] > 0) {
					switch (S.SeparateFilter_add_channel) {
						case 'red':
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 1] = 0;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 2] = 0;
							break;
						case 'green':
							S.SeparateFilter_add_d[S.SeparateFilter_add_i] = 0;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 2] = 0;
							break;
						case 'blue':
							S.SeparateFilter_add_d[S.SeparateFilter_add_i] = 0;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 1] = 0;
							break;
						case 'cyan':
							S.SeparateFilter_add_col = (S.SeparateFilter_add_d[S.SeparateFilter_add_i + 1] + S.SeparateFilter_add_d[S.SeparateFilter_add_i + 2]) / 2;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i] = 0;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 1] = S.SeparateFilter_add_col;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 2] = S.SeparateFilter_add_col;
							break;
						case 'magenta':
							S.SeparateFilter_add_col = (S.SeparateFilter_add_d[S.SeparateFilter_add_i] + S.SeparateFilter_add_d[S.SeparateFilter_add_i + 2]) / 2;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 1] = 0;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i] = S.SeparateFilter_add_col;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 2] = S.SeparateFilter_add_col;
							break;
						case 'yellow':
							S.SeparateFilter_add_col = (S.SeparateFilter_add_d[S.SeparateFilter_add_i] + S.SeparateFilter_add_d[S.SeparateFilter_add_i + 1]) / 2;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 2] = 0;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i + 1] = S.SeparateFilter_add_col;
							S.SeparateFilter_add_d[S.SeparateFilter_add_i] = S.SeparateFilter_add_col;
							break;
						default:
							// case 'all' - do nothing
					}
					S.SeparateFilter_add_d[S.SeparateFilter_add_i + 3] *= S.SeparateFilter_add_alpha;
				}
			}
			return data;
		};
		/**
# NoiseFilter

## Instantiation

* scrawl.newNoiseFilter()

## Purpose

* Adds a noise filter effect to an Entity or cell

## Access

* scrawl.filter.FILTERNAME - for the NoiseFilter object

@class NoiseFilter
@constructor
@extends Filter
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.NoiseFilter = function(items) {
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.radiusX = my.xtGet(items.radiusX, 2);
			this.radiusY = my.xtGet(items.radiusY, 2);
			this.roll = my.xtGet(items.roll, 2);
			this.cells = (my.xt(items.cells)) ? items.cells : false;
			this.strength = my.xtGet(items.strength, 0.3);
			if (!my.isa(this.cells, 'arr')) {
				this.cells = this.getBrush();
			}
			my.filter[this.name] = this;
			my.pushUnique(my.filternames, this.name);
			return this;
		};
		my.NoiseFilter.prototype = Object.create(my.Filter.prototype);
		/**
@property type
@type String
@default 'Filter'
@final
**/
		my.NoiseFilter.prototype.type = 'NoiseFilter';
		my.NoiseFilter.prototype.classname = 'filternames';
		my.d.NoiseFilter = {
			/**
@property radiusX
@type Number
@default 2
**/
			radiusX: 2,
			/**
@property radiusY
@type Number
@default 2
**/
			radiusY: 2,
			/**
@property roll
@type Number
@default 0
**/
			roll: 0,
			/**
@property strength
@type Number
@default 0.3
**/
			strength: 0.3,
		};
		my.mergeInto(my.d.NoiseFilter, my.d.Filter);
		/**
Set attribute values.

@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.NoiseFilter.prototype.set = function(items) {
			return my.BlurFilter.prototype.set.call(this, items);
		};
		/**
Set attribute values.

@method getBrush
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.NoiseFilter.prototype.getBrush = function() {
			return my.BlurFilter.prototype.getBrush.call(this);
		};
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		S.NoiseFilter_add_alpha = 0;
		S.NoiseFilter_add_d0 = [];
		S.NoiseFilter_add_dR = [];
		S.NoiseFilter_add_result = null; // ImageData object
		S.NoiseFilter_add_strength = 0;
		S.NoiseFilter_add_i = 0;
		S.NoiseFilter_add_iz = 0;
		S.NoiseFilter_add_j = 0;
		S.NoiseFilter_add_jz = 0;
		S.NoiseFilter_add_k = 0;
		S.NoiseFilter_add_kz = 0;
		S.NoiseFilter_add_e = 0;
		S.NoiseFilter_add_e0 = 0;
		S.NoiseFilter_add_x = 0;
		S.NoiseFilter_add_y = 0;
		S.NoiseFilter_add_cell = [];
		S.NoiseFilter_add_cellLen = 0;
		my.NoiseFilter.prototype.add = function(data) {
			S.NoiseFilter_add_alpha = this.getAlpha();
			S.NoiseFilter_add_d0 = data.data;
			S.NoiseFilter_add_result = my.cvx.createImageData(data.width, data.height);
			S.NoiseFilter_add_dR = S.NoiseFilter_add_result.data;
			S.NoiseFilter_add_strength = this.strength;
			//i, iz, j, jz, k, kz, e, e0, x, y, cell,
			S.NoiseFilter_add_cellLen = this.cells.length;
			for (S.NoiseFilter_add_i = 0, S.NoiseFilter_add_iz = data.height; S.NoiseFilter_add_i < S.NoiseFilter_add_iz; S.NoiseFilter_add_i++) {
				for (S.NoiseFilter_add_j = 0, S.NoiseFilter_add_jz = data.width; S.NoiseFilter_add_j < S.NoiseFilter_add_jz; S.NoiseFilter_add_j++) {
					S.NoiseFilter_add_e0 = ((S.NoiseFilter_add_i * S.NoiseFilter_add_jz) + S.NoiseFilter_add_j) * 4;
					if (S.NoiseFilter_add_d0[S.NoiseFilter_add_e0 + 3] > 0) {
						if (Math.random() < S.NoiseFilter_add_strength) {
							S.NoiseFilter_add_cell = this.cells[Math.floor(Math.random() * S.NoiseFilter_add_cellLen)];
							S.NoiseFilter_add_x = S.NoiseFilter_add_j + S.NoiseFilter_add_cell[0];
							S.NoiseFilter_add_y = S.NoiseFilter_add_i + S.NoiseFilter_add_cell[1];
							if (S.NoiseFilter_add_x >= 0 && S.NoiseFilter_add_x < S.NoiseFilter_add_jz && S.NoiseFilter_add_y >= 0 && S.NoiseFilter_add_y < S.NoiseFilter_add_iz) {
								S.NoiseFilter_add_e = ((S.NoiseFilter_add_y * S.NoiseFilter_add_jz) + S.NoiseFilter_add_x) * 4;
								S.NoiseFilter_add_dR[S.NoiseFilter_add_e0] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e];
								S.NoiseFilter_add_dR[S.NoiseFilter_add_e0 + 1] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e + 1];
								S.NoiseFilter_add_dR[S.NoiseFilter_add_e0 + 2] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e + 2];
								S.NoiseFilter_add_dR[S.NoiseFilter_add_e0 + 3] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e0 + 3] * S.NoiseFilter_add_alpha;
							}
						}
						else {
							S.NoiseFilter_add_dR[S.NoiseFilter_add_e0] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e0];
							S.NoiseFilter_add_dR[S.NoiseFilter_add_e0 + 1] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e0 + 1];
							S.NoiseFilter_add_dR[S.NoiseFilter_add_e0 + 2] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e0 + 2];
							S.NoiseFilter_add_dR[S.NoiseFilter_add_e0 + 3] = S.NoiseFilter_add_d0[S.NoiseFilter_add_e0 + 3] * S.NoiseFilter_add_alpha;
						}
					}
				}
			}
			return S.NoiseFilter_add_result;
		};

		return my;
	}(scrawl, scrawlVars));
}
