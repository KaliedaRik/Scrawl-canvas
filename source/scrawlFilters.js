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
		/**
Utility canvases - never displayed
@property filterCanvas
@type {CasnvasObject}
@private
**/
		my.filterCanvas = document.createElement('canvas');
		my.filterCanvas.id = 'filterHiddenCanvasElement';
		my.f.appendChild(my.filterCanvas);
		my.perspectiveOriginCanvas = document.createElement('canvas');
		my.perspectiveOriginCanvas.id = 'perspectiveOriginHiddenCanvasElement';
		my.f.appendChild(my.perspectiveOriginCanvas);
		my.perspectiveSourceCanvas = document.createElement('canvas');
		my.perspectiveSourceCanvas.id = 'perspectiveSourceHiddenCanvasElement';
		my.f.appendChild(my.perspectiveSourceCanvas);
		my.perspectiveEaselCanvas = document.createElement('canvas');
		my.perspectiveEaselCanvas.id = 'perspectiveEaselHiddenCanvasElement';
		my.f.appendChild(my.perspectiveEaselCanvas);
		/**
Utility canvas 2d context engine
@property filterCvx
@type {CasnvasContextObject}
@private
**/
		my.filterCvx = my.filterCanvas.getContext('2d');
		my.perspectiveOriginCvx = my.perspectiveOriginCanvas.getContext('2d');
		my.perspectiveSourceCvx = my.perspectiveSourceCanvas.getContext('2d');
		my.perspectiveEaselCvx = my.perspectiveEaselCanvas.getContext('2d');
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
			var get = my.xtGet;
			items = my.safeObject(items);
			this.filters = (my.xt(items.filters)) ? items.filters : [];
			this.filterOnStroke = get(items.filterOnStroke, false);
			this.filterLevel = get(items.filterLevel, 'entity');
		};
		/**
Entity constructor hook function - modified by filters module
@method filtersEntityInit
@private
**/
		my.Entity.prototype.filtersEntityInit = function(items) {
			var get = my.xtGet;
			items = my.safeObject(items);
			this.filters = (my.xt(items.filters)) ? items.filters : [];
			this.filterOnStroke = get(items.filterOnStroke, false);
			this.filterLevel = get(items.filterLevel, 'entity');
		};

		/**
Alias for makeGreyscaleFilter()
@method newGreyscaleFilter
@deprecated
**/
		my.newGreyscaleFilter = function(items) {
			return my.makeGreyscaleFilter(items);
		};
		/**
Alias for makeInvertFilter()
@method newInvertFilter
@deprecated
**/
		my.newInvertFilter = function(items) {
			return my.makeInvertFilter(items);
		};
		/**
Alias for makeBrightnessFilter()
@method newBrightnessFilter
@deprecated
**/
		my.newBrightnessFilter = function(items) {
			return my.makeBrightnessFilter(items);
		};
		/**
Alias for makeSaturationFilter()
@method newSaturationFilter
@deprecated
**/
		my.newSaturationFilter = function(items) {
			return my.makeSaturationFilter(items);
		};
		/**
Alias for makeThresholdFilter()
@method newThresholdFilter
@deprecated
**/
		my.newThresholdFilter = function(items) {
			return my.makeThresholdFilter(items);
		};
		/**
Alias for makeChannelsFilter()
@method newChannelsFilter
@deprecated
**/
		my.newChannelsFilter = function(items) {
			return my.makeChannelsFilter(items);
		};
		/**
Alias for makeChannelStepFilter()
@method newChannelStepFilter
@deprecated
**/
		my.newChannelStepFilter = function(items) {
			return my.makeChannelStepFilter(items);
		};
		/**
Alias for makeTintFilter()
@method newTintFilter
@deprecated
**/
		my.newTintFilter = function(items) {
			return my.makeTintFilter(items);
		};
		/**
Alias for makeSepiaFilter()
@method newSepiaFilter
@deprecated
**/
		my.newSepiaFilter = function(items) {
			return my.makeSepiaFilter(items);
		};
		/**
Alias for makeMatrixFilter()
@method newMatrixFilter
@deprecated
**/
		my.newMatrixFilter = function(items) {
			return my.makeMatrixFilter(items);
		};
		/**
Alias for makeSharpenFilter()
@method newSharpenFilter
@deprecated
**/
		my.newSharpenFilter = function(items) {
			return my.makeSharpenFilter(items);
		};
		/**
Alias for makePixelateFilter()
@method newPixelateFilter
@deprecated
**/
		my.newPixelateFilter = function(items) {
			return my.makePixelateFilter(items);
		};
		/**
Alias for makeBlurFilter()
@method newBlurFilter
@deprecated
**/
		my.newBlurFilter = function(items) {
			return my.makeBlurFilter(items);
		};
		/**
Alias for makeLeachFilter()
@method newLeachFilter
@deprecated
**/
		my.newLeachFilter = function(items) {
			return my.makeLeachFilter(items);
		};
		/**
Alias for makeSeparateFilter()
@method newSeparateFilter
@deprecated
**/
		my.newSeparateFilter = function(items) {
			return my.makeSeparateFilter(items);
		};
		/**
Alias for makeNoiseFilter()
@method newNoiseFilter
@deprecated
**/
		my.newNoiseFilter = function(items) {
			return my.makeNoiseFilter(items);
		};
		/**
A __factory__ function to generate new Greyscale filter objects
@method makeGreyscaleFilter
@param {Object} items Key:value Object argument for setting attributes
@return GreyscaleFilter object
**/
		my.makeGreyscaleFilter = function(items) {
			return new my.GreyscaleFilter(items);
		};
		/**
A __factory__ function to generate new Invert filter objects
@method makeInvertFilter
@param {Object} items Key:value Object argument for setting attributes
@return InvertFilter object
**/
		my.makeInvertFilter = function(items) {
			return new my.InvertFilter(items);
		};
		/**
A __factory__ function to generate new Brightness filter objects
@method makeBrightnessFilter
@param {Object} items Key:value Object argument for setting attributes
@return BrightnessFilter object
**/
		my.makeBrightnessFilter = function(items) {
			return new my.BrightnessFilter(items);
		};
		/**
A __factory__ function to generate new Saturation filter objects
@method makeSaturationFilter
@param {Object} items Key:value Object argument for setting attributes
@return SaturationFilter object
**/
		my.makeSaturationFilter = function(items) {
			return new my.SaturationFilter(items);
		};
		/**
A __factory__ function to generate new Threshold filter objects
@method makeThresholdFilter
@param {Object} items Key:value Object argument for setting attributes
@return ThresholdFilter object
**/
		my.makeThresholdFilter = function(items) {
			return new my.ThresholdFilter(items);
		};
		/**
A __factory__ function to generate new Channels filter objects
@method makeChannelsFilter
@param {Object} items Key:value Object argument for setting attributes
@return ChannelsFilter object
**/
		my.makeChannelsFilter = function(items) {
			return new my.ChannelsFilter(items);
		};
		/**
A __factory__ function to generate new ChannelStep filter objects
@method makeChannelStepFilter
@param {Object} items Key:value Object argument for setting attributes
@return ChannelStepFilter object
**/
		my.makeChannelStepFilter = function(items) {
			return new my.ChannelStepFilter(items);
		};
		/**
A __factory__ function to generate new Tint filter objects
@method makeTintFilter
@param {Object} items Key:value Object argument for setting attributes
@return TintFilter object
**/
		my.makeTintFilter = function(items) {
			return new my.TintFilter(items);
		};
		/**
A __factory__ function to generate new Sepia filter objects preset with values for creating a sepia tint
@method newSepiaFilter
@param {Object} items Key:value Object argument for setting attributes
@return TintFilter object
**/
		my.makeSepiaFilter = function(items) {
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
@method makeMatrixFilter
@param {Object} items Key:value Object argument for setting attributes
@return MatrixFilter object
**/
		my.makeMatrixFilter = function(items) {
			return new my.MatrixFilter(items);
		};
		/**
A __factory__ function to generate new Sharpen filter objects
@method makeSharpenFilter
@param {Object} items Key:value Object argument for setting attributes
@return SharpenFilter object
**/
		my.makeSharpenFilter = function(items) {
			items.data = [0, -1, 0, -1, 5, -1, 0, -1, 0];
			return new my.MatrixFilter(items);
		};
		/**
A __factory__ function to generate new Pixelate filter objects
@method makePixelateFilter
@param {Object} items Key:value Object argument for setting attributes
@return PixelateFilter object
**/
		my.makePixelateFilter = function(items) {
			return new my.PixelateFilter(items);
		};
		/**
A __factory__ function to generate new Blur filter objects
@method makeBlurFilter
@param {Object} items Key:value Object argument for setting attributes
@return BlurFilter object
**/
		my.makeBlurFilter = function(items) {
			return new my.BlurFilter(items);
		};
		/**
A __factory__ function to generate new Leach filter objects
@method makeLeachFilter
@param {Object} items Key:value Object argument for setting attributes
@return LeachFilter object
**/
		my.makeLeachFilter = function(items) {
			return new my.LeachFilter(items);
		};
		/**
A __factory__ function to generate new Separate filter objects
@method makeSeparateFilter
@param {Object} items Key:value Object argument for setting attributes
@return SeparateFilter object
**/
		my.makeSeparateFilter = function(items) {
			return new my.SeparateFilter(items);
		};
		/**
A __factory__ function to generate new Noise filter objects
@method makeNoiseFilter
@param {Object} items Key:value Object argument for setting attributes
@return NoiseFilter object
**/
		my.makeNoiseFilter = function(items) {
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
		my.Pad.prototype.compile = function() {
			var c,
				i,
				iz,
				cell = my.cell,
				cells = this.cells;
			this.filters.length = 0;
			this.sortCellsCompile();
			for (i = 0, iz = cells.length; i < iz; i++) {
				c = cell[cells[i]];
				if (c.rendered && c.compiled) {
					c.compile();
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
		my.Pad.prototype.show = function(command) {
			var d,
				b,
				c,
				i,
				iz,
				cell = my.cell,
				cells = this.cells,
				context = my.context,
				xt = my.xt,
				g = my.group,
				e = my.entity,
				filters = this.filters,
				temp;
			d = cell[this.display];
			b = cell[this.base];
			this.sortCellsShow();
			for (i = 0, iz = cells.length; i < iz; i++) {
				c = cell[cells[i]];
				if (c.rendered && c.shown) {
					b.copyCellToSelf(c);
				}
			}
			for (i = 0, iz = filters.length; i < iz; i++) {
				temp = e[filters[i]];
				if (xt(temp)) {
					temp.stampFilter(context[b.name], b.name, true);
				}
				temp = g[filters[i]];
				if (xt(temp)) {
					temp.stampFilter(context[b.name], b.name, true);
				}
			}
			d.copyCellToSelf(b, true);
			return this;
		};
		/**
Prepare to draw entitys onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array 

(As amended by Filters module)
@method compileFilters
@return always true
@chainable
**/
		my.Cell.prototype.compile = function() {
			var g,
				i,
				iz,
				group = my.group,
				groups = this.groups,
				filters = this.filters,
				xt = my.xt,
				ctx = my.context[this.name],
				e = my.entity,
				temp1, temp2;
			filters.length = 0;
			this.groupSort();
			for (i = 0, iz = groups.length; i < iz; i++) {
				g = group[groups[i]];
				if (g.visibility) {
					g.stamp(false, this.name);
				}
			}
			for (i = 0, iz = filters.length; i < iz; i++) {
				temp1 = e[filters[i]];
				temp2 = group[filters[i]];
				if (xt(temp1)) {
					temp1.stampFilter(ctx, this.name, true);
				}
				else if (xt(temp2)) {
					temp2.stampFilter(ctx, this.name, true);
				}
			}
			return true;
		};
		/**
Group.stamp hook function - add a filter to a group of Entitys, and any background detail enclosed by them
@method stampFilter
@private
**/
		my.Group.prototype.stampFilter = function(engine, cellname, cell) {
			var imageData,
				canvas,
				composite,
				localComposite = 'source-over',
				e,
				eStroke,
				i,
				iz,
				cv = my.cv,
				cvx = my.cvx,
				fc = my.filterCanvas,
				fcx = my.filterCvx,
				entity = my.entity,
				entitys = this.entitys,
				p = my.pad,
				c = my.cell,
				tc = this.cell,
				f = my.filter,
				filters = this.filters,
				xt = my.xt,
				filterLevel = this.filterLevel,
				temp,
				action = this.stampFilterActions;
			if (filters.length > 0) {
				canvas = my.canvas[cell];
				cv.width = canvas.width;
				cv.height = canvas.height;
				fc.width = canvas.width;
				fc.height = canvas.height;
				fcx.clearRect(0, 0, canvas.width, canvas.height);
				for (i = 0, iz = entitys.length; i < iz; i++) {
					e = entity[entitys[i]];
					eStroke = e.filterOnStroke;
					e.filterOnStroke = this.filterOnStroke;
					cvx.save();
					imageData = action[e.type](e, engine, cellname, cell);
					e.filterOnStroke = eStroke;
					fcx.putImageData(imageData, 0, 0);
					cvx.restore();
				}
				imageData = fcx.getImageData(0, 0, canvas.width, canvas.height);
				if (imageData) {
					for (i = 0, iz = filters.length; i < iz; i++) {
						temp = f[filters[i]];
						if (filterLevel === 'pad' && !force) {
							p[c[tc].pad].filters.push(this.name);
						}
						else if (filterLevel === 'cell' && !force) {
							c[tc].filters.push(this.name);
						}
						else if (temp) {
							imageData = temp.add(imageData);
							localComposite = (xt(temp.operation)) ? temp.operation : localComposite;
						}
					}
				}
				cvx.putImageData(imageData, 0, 0);
				if (engine.globalCompositeOperation !== localComposite) {
					composite = engine.globalCompositeOperation;
					engine.globalCompositeOperation = localComposite;
					engine.setTransform(1, 0, 0, 1, 0, 0);
					engine.drawImage(cv, 0, 0, canvas.width, canvas.height);
					engine.globalCompositeOperation = composite;
				}
				else {
					engine.setTransform(1, 0, 0, 1, 0, 0);
					engine.drawImage(cv, 0, 0, canvas.width, canvas.height);
				}
			}
		};
		/**
Entity.stampFilter helper object
@method stampFilterActions
@private
**/
		my.Entity.prototype.stampFilterActions = {
			Phrase: function(entity, engine, cellname, cell) {
				return entity.stampFilterPhrase(entity, engine, cellname, cell);
			},
			Picture: function(entity, engine, cellname, cell) {
				return entity.stampFilterPicture(entity, engine, cellname, cell);
			},
			Wheel: function(entity, engine, cellname, cell) {
				return entity.stampFilterWheel(entity, engine, cellname, cell);
			},
			Block: function(entity, engine, cellname, cell) {
				return entity.stampFilterDefault(entity, engine, cellname, cell);
			},
			Shape: function(entity, engine, cellname, cell) {
				return entity.stampFilterDefault(entity, engine, cellname, cell);
			},
			Path: function(entity, engine, cellname, cell) {
				return entity.stampFilterDefault(entity, engine, cellname, cell);
			},
			Frame: function(entity, engine, cellname, cell) {
				return entity.stampFilterDefault(entity, engine, cellname, cell);
			}
		};
		/**
Group.stampFilter helper object
@method stampFilterActions
@private
**/
		my.Group.prototype.stampFilterActions = my.Entity.prototype.stampFilterActions;
		/**
reciprocal assignment - also occurs in scrawlFrame as there's no way to tell which file (scrawlFrame, scrawlFilters) will be loaded first
@method stampFilterActions
@private
**/
		if (my.Frame) {
			my.Frame.prototype.stampFilterActions = my.Entity.prototype.stampFilterActions;
		}
		/**
Entity.stamp hook function - add a filter to an Entity, and any background detail enclosed by the Entity
@method stampFilter
@private
**/
		my.Entity.prototype.stampFilter = function(engine, cellname, cell) {
			var imageData,
				canvas,
				composite,
				localComposite = 'source-over',
				i,
				iz,
				cv = my.cv,
				cvx = my.cvx,
				f,
				filter = my.filter,
				filters = this.filters,
				c,
				p,
				xt = my.xt,
				filterLevel = this.filterLevel,
				action = this.stampFilterActions;
			if (filters.length > 0) {
				canvas = my.canvas[cellname];
				cv.width = canvas.width;
				cv.height = canvas.height;
				cvx.save();
				imageData = action[this.type](this, engine, cellname, cell);
				if (imageData) {
					c = my.cell[my.group[this.group].cell];
					p = my.pad[c.pad];
					for (i = 0, iz = filters.length; i < iz; i++) {
						f = filter[filters[i]];
						if (filterLevel === 'pad') {
							p.filters.push(this.name);
						}
						else if (filterLevel === 'cell') {
							c.filters.push(this.name);
						}
						else if (f) {
							imageData = f.add(imageData);
							localComposite = (xt(f.operation)) ? filter[filters[i]].operation : localComposite;
						}
					}
					cvx.putImageData(imageData, 0, 0);
					if (engine.globalCompositeOperation !== localComposite) {
						composite = engine.globalCompositeOperation;
						engine.globalCompositeOperation = localComposite;
						engine.setTransform(1, 0, 0, 1, 0, 0);
						engine.drawImage(cv, 0, 0, canvas.width, canvas.height);
						engine.globalCompositeOperation = composite;
					}
					else {
						engine.setTransform(1, 0, 0, 1, 0, 0);
						engine.drawImage(cv, 0, 0, canvas.width, canvas.height);
					}
				}
				cvx.restore();
			}
		};
		/**
Entity.stamp hook helper function
@method stampFilterPhrase
@private
**/
		my.Entity.prototype.stampFilterPhrase = function(entity, engine, cellname, cell) {
			var context,
				canvas,
				test,
				i,
				iz,
				o,
				here,
				textY,
				tX,
				tY,
				cvx = my.cvx,
				cv = my.cv,
				e = my.entity,
				text = my.text,
				texts = entity.texts;
			canvas = my.canvas[cellname];
			context = my.ctx[entity.context];
			cvx.font = context.font;
			cvx.fillStyle = 'rgb(0, 0, 0)';
			cvx.strokeStyle = 'rgb(0, 0, 0)';
			cvx.textAlign = context.textAlign;
			cvx.textBaseline = context.textBaseline;
			test = (e[entity.path] && e[entity.path].type === 'Path');
			if (entity.pivot || !test || entity.get('textAlongPath') === 'phrase') {
				o = entity.getOffset();
				here = entity.prepareStamp();
				textY = entity.size * entity.lineHeight * entity.scale;
				entity.rotateCell(cvx, cv);
				tX = here.x + o.x;
				for (i = 0, iz = texts.length; i < iz; i++) {
					tY = here.y + (textY * i) + o.y;
					text[texts[i]].fill(cvx, cell, tX, tY);
				}
			}
			else {
				text[texts[0]].clipAlongPath(entity);
			}
			cvx.setTransform(1, 0, 0, 1, 0, 0);
			cvx.globalCompositeOperation = 'source-in';
			cvx.drawImage(canvas, 0, 0);
			cvx.globalCompositeOperation = 'source-over';
			return cvx.getImageData(0, 0, canvas.width, canvas.height);
		};
		/**
Entity.stamp hook helper function
@method stampFilterWheel
@private
**/
		my.Entity.prototype.stampFilterWheel = function(entity, engine, cellname, cell) {
			var canvas = my.canvas[cellname],
				context = my.ctx[entity.context],
				cvx = my.cvx,
				cv = my.cv;
			if (entity.filterOnStroke) {
				cvx.lineWidth = context.lineWidth;
				cvx.shadowOffsetX = context.shadowOffsetX;
				cvx.shadowOffsetY = context.shadowOffsetY;
				cvx.shadowBlur = context.shadowBlur;
				cvx.lineJoin = context.lineJoin;
				cvx.lineCap = context.lineCap;
				cvx.miterLimit = context.miterLimit;
				cvx.lineDash = context.lineDash;
				cvx.lineDashOffset = context.lineDashOffset;
				cvx.globalAlpha = context.globalAlpha;
				entity.buildPath(cvx, cv);
				cvx.stroke();
				cvx.setTransform(1, 0, 0, 1, 0, 0);
				cvx.globalCompositeOperation = 'source-in';
				cvx.drawImage(canvas, 0, 0);
				cvx.globalCompositeOperation = 'source-over';
			}
			else {
				entity.clip(cvx, cell);
				cvx.setTransform(1, 0, 0, 1, 0, 0);
				cvx.drawImage(canvas, 0, 0);
			}
			return cvx.getImageData(0, 0, canvas.width, canvas.height);
		};
		/**
Entity.stamp hook helper function
@method stampFilterPicture
@private
**/
		my.Entity.prototype.stampFilterPicture = function(entity, engine, cellname, cell) {
			var canvas,
				data,
				here,
				cvx = my.cvx,
				cv = my.cv,
				copy = entity.copyData,
				paste = entity.pasteData;
			canvas = my.canvas[cellname];
			data = entity.getImage();
			if (data) {
				here = entity.prepareStamp();
				entity.rotateCell(cvx, cv);
				cvx.drawImage(data, copy.x, copy.y, copy.w, copy.h, here.x, here.y, paste.w, paste.h);
				cvx.setTransform(1, 0, 0, 1, 0, 0);
				cvx.globalCompositeOperation = 'source-in';
				cvx.drawImage(canvas, 0, 0);
				cvx.globalCompositeOperation = 'source-over';
				return cvx.getImageData(0, 0, canvas.width, canvas.height);
			}
			return false;
		};
		/**
Entity.stamp hook helper function
@method stampFilterDefault
@private
**/
		my.Entity.prototype.stampFilterDefault = function(entity, engine, cellname, cell) {
			var canvas = my.canvas[cellname],
				cvx = my.cvx;
			entity.clip(cvx, cellname, cell);
			cvx.setTransform(1, 0, 0, 1, 0, 0);
			cvx.drawImage(canvas, 0, 0);
			return cvx.getImageData(0, 0, canvas.width, canvas.height);
		};

		/**
# Filter

## Instantiation

* This object should never be instantiated by users

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
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.alpha = get(items.alpha, 1);
			this.composite = get(items.composite, 'source-over');
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
			composite: 'source-over'
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
		my.Filter.prototype.cloneImageData = function(original) {
			var w,
				h,
				canvas = my.filterCanvas,
				cvx = my.filterCvx;
			if (my.xt(original)) {
				if (my.xta(original.width, original.height)) {
					w = original.width;
					h = original.height;
					canvas.width = w;
					canvas.height = h;
					cvx.putImageData(original, 0, 0);
					return cvx.getImageData(0, 0, w, h);
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
		my.Filter.prototype.getAlpha = function() {
			var a = (this.alpha.substring) ? parseFloat(this.alpha) / 100 : this.alpha;
			if (a >= 0 && a <= 1) {
				return a;
			}
			else {
				return (a > 0.5) ? 1 : 0;
			}
		};
		/**
# GreyscaleFilter

## Instantiation

* scrawl.makeGreyscaleFilter()

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
		my.GreyscaleFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				grey,
				i,
				iz;
			alpha = this.getAlpha();
			d = data.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					grey = Math.floor((0.2126 * d[here]) + (0.7152 * d[++here]) + (0.0722 * d[++here]));
					here = i;
					d[here] = grey;
					d[++here] = grey;
					d[++here] = grey;
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# InvertFilter

## Instantiation

* scrawl.makeInvertFilter()

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
		my.InvertFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				i,
				iz;
			alpha = this.getAlpha();
			d = data.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					d[here] = 255 - d[here];
					d[++here] = 255 - d[here];
					d[++here] = 255 - d[here];
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# BrightnessFilter

## Instantiation

* scrawl.makeBrightnessFilter()

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
		my.BrightnessFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				brightness,
				i,
				iz;
			alpha = this.getAlpha();
			brightness = (this.brightness.substring) ? parseFloat(this.brightness) / 100 : this.brightness;
			d = data.data;
			brightness = (brightness < 0) ? 0 : brightness;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					d[here] *= brightness;
					d[++here] *= brightness;
					d[++here] *= brightness;
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# SaturationFilter

## Instantiation

* scrawl.makeSaturationFilter()

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
		my.SaturationFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				saturation,
				i,
				iz;
			alpha = this.getAlpha();
			saturation = (this.saturation.substring) ? parseFloat(this.saturation) / 100 : this.saturation;
			saturation = (saturation < 0) ? 0 : saturation;
			d = data.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					d[here] = 127 + ((d[here] - 127) * saturation);
					d[++here] = 127 + ((d[here] - 127) * saturation);
					d[++here] = 127 + ((d[here] - 127) * saturation);
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# ThresholdFilter

## Instantiation

* scrawl.makeThresholdFilter()

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
		my.ThresholdFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				threshold,
				t,
				i,
				iz;
			alpha = this.getAlpha();
			threshold = (this.threshold.substring) ? parseFloat(this.threshold) / 100 : this.threshold;
			threshold = (my.isBetween(threshold, 0, 1, true)) ? threshold : ((threshold > 0.5) ? 1 : 0);
			threshold *= 255;
			data = my.GreyscaleFilter.prototype.add.call(this, data);
			d = data.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					t = (d[here] > threshold) ? 255 : 0;
					d[here] = t;
					d[++here] = t;
					d[++here] = t;
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# ChannelsFilter

## Instantiation

* scrawl.makeChannelsFilter()

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
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.red = get(items.red, 1);
			this.green = get(items.green, 1);
			this.blue = get(items.blue, 1);
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
		my.ChannelsFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				red,
				green,
				blue,
				i,
				iz;
			alpha = this.getAlpha();
			red = (this.red.substring) ? parseFloat(this.red) / 100 : this.red;
			green = (this.green.substring) ? parseFloat(this.green) / 100 : this.green;
			blue = (this.blue.substring) ? parseFloat(this.blue) / 100 : this.blue;
			d = data.data;
			red = (red < 0) ? 0 : red;
			green = (green < 0) ? 0 : green;
			blue = (blue < 0) ? 0 : blue;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					d[here] *= red;
					d[++here] *= green;
					d[++here] *= blue;
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# ChannelStepFilter

## Instantiation

* scrawl.makeChannelStepFilter()

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
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.red = get(items.red, 1);
			this.green = get(items.green, 1);
			this.blue = get(items.blue, 1);
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
		my.ChannelStepFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				red,
				green,
				blue,
				r,
				g,
				b,
				i,
				iz,
				floor = Math.floor;
			alpha = this.getAlpha();
			red = this.red;
			green = this.green;
			blue = this.blue;
			d = data.data;
			red = (red < 1) ? 1 : red;
			green = (green < 1) ? 1 : green;
			blue = (blue < 1) ? 1 : blue;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					r = d[here];
					g = d[++here];
					b = d[++here];
					here = i;
					d[here] = floor(r / red) * red;
					d[++here] = floor(g / green) * green;
					d[++here] = floor(b / blue) * blue;
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# TintFilter

## Instantiation

* scrawl.makeTintFilter()

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
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.redInRed = get(items.redInRed, 1);
			this.redInGreen = get(items.redInGreen, 0);
			this.redInBlue = get(items.redInBlue, 0);
			this.greenInRed = get(items.greenInRed, 0);
			this.greenInGreen = get(items.greenInGreen, 1);
			this.greenInBlue = get(items.greenInBlue, 0);
			this.blueInRed = get(items.blueInRed, 0);
			this.blueInGreen = get(items.blueInGreen, 0);
			this.blueInBlue = get(items.blueInBlue, 1);
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
		my.TintFilter.prototype.add = function(data) {
			var alpha,
				d,
				here,
				r,
				g,
				b,
				rr,
				rg,
				rb,
				gr,
				gg,
				gb,
				br,
				bg,
				bb,
				i,
				iz;
			alpha = this.getAlpha();
			rr = (this.redInRed.substring) ? parseFloat(this.redInRed) / 100 : this.redInRed;
			rg = (this.redInGreen.substring) ? parseFloat(this.redInGreen) / 100 : this.redInGreen;
			rb = (this.redInBlue.substring) ? parseFloat(this.redInBlue) / 100 : this.redInBlue;
			gr = (this.greenInRed.substring) ? parseFloat(this.greenInRed) / 100 : this.greenInRed;
			gg = (this.greenInGreen.substring) ? parseFloat(this.greenInGreen) / 100 : this.greenInGreen;
			gb = (this.greenInBlue.substring) ? parseFloat(this.greenInBlue) / 100 : this.greenInBlue;
			br = (this.blueInRed.substring) ? parseFloat(this.blueInRed) / 100 : this.blueInRed;
			bg = (this.blueInGreen.substring) ? parseFloat(this.blueInGreen) / 100 : this.blueInGreen;
			bb = (this.blueInBlue.substring) ? parseFloat(this.blueInBlue) / 100 : this.blueInBlue;
			d = data.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					here = i;
					r = d[here];
					g = d[++here];
					b = d[++here];
					here = i;
					d[here] = (r * rr) + (g * gr) + (b * br);
					d[++here] = (r * rg) + (g * gg) + (b * bg);
					d[++here] = (r * rb) + (g * gb) + (b * bb);
					d[++here] *= alpha;
				}
			}
			return data;
		};
		/**
# MatrixFilter

## Instantiation

* scrawl.makeMatrixFilter()

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
			var get = my.xtGet,
			floor = Math.floor;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.width = get(items.width, false);
			this.height = get(items.height, false);
			this.data = (my.xt(items.data)) ? items.data : [1];
			this.x = get(items.x, floor(this.width / 2));
			this.y = get(items.y, floor(this.height / 2));
			this.includeInvisiblePoints = get(items.includeInvisiblePoints, false);
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
Matrix maximum width

@property width
@type Number
@default 1
**/
			width: 1,
			/**
Matrix maximum height

@property height
@type Number
@default 1
**/
			height: 1,
			/**
Home cell along the horizontal

@property x
@type Number
@default 0
**/
			x: 0,
			/**
Home cell along the vertical

@property y
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

@property data
@type Array
@default false
**/
			data: false
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
			var get = my.xtGet;
			my.Base.prototype.set.call(this, items);
			this.width = get(items.width, false);
			this.height = get(items.height, false);
			this.setFilter();
		};
		/**
SetFilter builds the matrix from width, height and data attributes already supplied to the filter via the constructor or MatrixFilter.set()

@method setFilter
@return This
@chainable
@private
**/
		my.MatrixFilter.prototype.setFilter = function() {
			var i,
				j,
				k,
				reqLen,
				counter = 0,
				floor = Math.floor,
				ceil = Math.ceil,
				round = Math.round,
				pow = Math.pow,
				sqrt = Math.sqrt,
				data = this.data,
				cells;
			if (!this.height && this.width && this.width.toFixed && this.width >= 1) {
				this.width = floor(this.width);
				reqLen = ceil(data.length / this.width);
				this.height = reqLen;
				reqLen = this.width * this.height;
			}
			else if (!this.width && this.height && this.height.toFixed && this.height >= 1) {
				this.height = floor(this.height);
				reqLen = ceil(data.length / this.height);
				this.width = reqLen;
				reqLen = this.width * this.height;
			}
			else if (this.width && this.width.toFixed && this.width >= 1 && this.height && this.height.toFixed && this.height >= 1) {
				this.width = round(this.width);
				this.height = round(this.height);
				reqLen = this.width * this.height;
			}
			else {
				reqLen = ceil(sqrt(data.length));
				reqLen = (reqLen % 2 === 1) ? pow(reqLen, 2) : pow(reqLen + 1, 2);
				this.width = round(sqrt(reqLen));
				this.height = this.width;
			}
			for (k = 0; k < reqLen; k++) {
				data[k] = (my.xt(data[k])) ? parseFloat(data[k]) : 0;
				data[k] = (isNaN(data[k])) ? 0 : data[k];
			}
			this.cells = [];
			cells = this.cells;
			for (i = 0; i < this.height; i++) { //col (y)
				for (j = 0; j < this.width; j++) { //row (x)
					if (data[counter] !== 0) {
						cells.push([j - this.x, i - this.y, data[counter]]);
					}
					counter++;
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
		my.MatrixFilter.prototype.add = function(data) {
			var alpha,
				d0,
				dR,
				result,
				r,
				g,
				b,
				i,
				iz,
				j,
				jz,
				k,
				kz,
				w,
				c,
				e,
				e0,
				x,
				y,
				cells = this.cells;
			alpha = this.getAlpha();
			d0 = data.data;
			result = my.cvx.createImageData(data.width, data.height);
			dR = result.data;
			if (this.includeInvisiblePoints) {
				for (i = 0, iz = data.height; i < iz; i++) {
					for (j = 0, jz = data.width; j < jz; j++) {
						e0 = ((i * jz) + j) * 4;
						if (d0[e0 + 3] > 0) {
							r = 0;
							g = 0;
							b = 0;
							c = 0;
							for (k = 0, kz = cells.length; k < kz; k++) {
								x = j + cells[k][0];
								y = i + cells[k][1];
								if (x >= 0 && x < jz && y >= 0 && y < iz) {
									w = cells[k][2];
									e = ((y * jz) + x) * 4;
									c += w;
									r += (d0[e] * w);
									e++;
									g += (d0[e] * w);
									e++;
									b += (d0[e] * w);
								}
							}
							if (c !== 0) {
								r /= c;
								g /= c;
								b /= c;
							}
							dR[e0] = r;
							e0++;
							dR[e0] = g;
							e0++;
							dR[e0] = b;
							e0++;
							dR[e0] = d0[e0] * alpha;
						}
					}
				}
			}
			else {
				for (i = 0, iz = data.height; i < iz; i++) {
					for (j = 0, jz = data.width; j < jz; j++) {
						e0 = ((i * jz) + j) * 4;
						if (d0[e0 + 3]) {
							r = 0;
							g = 0;
							b = 0;
							c = 0;
							for (k = 0, kz = cells.length; k < kz; k++) {
								x = j + cells[k][0];
								y = i + cells[k][1];
								if (x >= 0 && x < jz && y >= 0 && y < iz) {
									w = cells[k][2];
									e = ((y * jz) + x) * 4;
									if (d0[e + 3] > 0) {
										c += w;
										r += (d0[e] * w);
										e++;
										g += (d0[e] * w);
										e++;
										b += (d0[e] * w);
									}
								}
							}
							if (c !== 0) {
								r /= c;
								g /= c;
								b /= c;
							}
							dR[e0] = r;
							e0++;
							dR[e0] = g;
							e0++;
							dR[e0] = b;
							e0++;
							dR[e0] = d0[e0] * alpha;
						}
					}
				}
			}
			return result;
		};
		/**
# PixelateFilter

## Instantiation

* scrawl.makePixelateFilter()

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
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.width = get(items.width, 5);
			this.height = get(items.height, 5);
			this.offsetX = get(items.offsetX, 0);
			this.offsetY = get(items.offsetY, 0);
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
Pixelization width

@property width
@type Number
@default 5
**/
			width: 5,
			/**
Pixelization height

@property height
@type Number
@default 5
**/
			height: 5,
			/**
Horizontal coordinate from which to begin pexelization

@property offsetX
@type Number
@default 0
**/
			offsetX: 0,
			/**
Vertical coordinate from which to begin pexelization

@property offsetY
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
		my.PixelateFilter.prototype.add = function(data) {
			var alpha,
				d0,
				dR,
				result,
				r,
				g,
				b,
				a,
				i,
				iz,
				j,
				jz,
				x,
				y,
				w,
				h,
				xj,
				yi,
				dW,
				dH,
				tW,
				tH,
				count,
				pos,
				test,
				round = Math.round;
			alpha = this.getAlpha();
			d0 = data.data;
			result = my.cvx.createImageData(data.width, data.height);
			dR = result.data;
			dW = data.width;
			dH = data.height;
			tW = dW - 1;
			tH = dH - 1;
			w = this.width;
			h = this.height;
			for (x = this.offsetX - w; x < dW; x += w) {
				for (y = this.offsetY - h; y < dH; y += h) {
					r = 0;
					g = 0;
					b = 0;
					a = 0;
					count = 0;
					for (i = y, iz = y + h; i < iz; i++) {
						for (j = x, jz = x + w; j < jz; j++) {
							test = (j < 0 || j > tW || i < 0 || i > tH) ? true : false;
							if (!test) {
								pos = ((i * dW) + j) * 4;
								if (d0[pos + 3]) {
									r += d0[pos];
									g += d0[++pos];
									b += d0[++pos];
									a += d0[++pos];
									count++;
								}
							}
						}
					}
					if (count && a) {
						r = round(r / count);
						g = round(g / count);
						b = round(b / count);
						pos = ((y * dW) + x) * 4;
						for (i = y, iz = y + h; i < iz; i++) {
							for (j = x, jz = x + w; j < jz; j++) {
								pos = ((i * dW) + j) * 4;
								dR[pos] = r;
								dR[++pos] = g;
								dR[++pos] = b;
								dR[++pos] = d0[pos] * alpha;
							}
						}
					}
				}
			}
			return result;
		};
		/**
# BlurFilter

## Instantiation

* scrawl.makeBlurFilter()

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
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.radiusX = get(items.radiusX, 2);
			this.radiusY = get(items.radiusY, 2);
			this.roll = get(items.roll, 2);
			this.skip = get(items.skip, 1);
			this.cells = (my.xt(items.cells)) ? items.cells : false;
			this.includeInvisiblePoints = get(items.includeInvisiblePoints, false);
			if (!Array.isArray(this.cells)) {
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
			includeInvisiblePoints: false
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
			if (!Array.isArray(items.cells)) {
				this.cells = this.getBrush();
			}
		};
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.BlurFilter.prototype.add = function(data) {
			var alpha,
				d0,
				result,
				dR,
				c,
				s,
				count,
				i,
				iz,
				j,
				jz,
				k,
				kz,
				r,
				g,
				b,
				e,
				e0,
				x,
				y,
				cells = this.cells;
			alpha = this.getAlpha();
			d0 = data.data;
			result = my.cvx.createImageData(data.width, data.height);
			dR = result.data;
			c = cells.length;
			s = Math.floor(c / this.skip);
			if (this.includeInvisiblePoints) {
				for (i = 0, iz = data.height; i < iz; i++) {
					for (j = 0, jz = data.width; j < jz; j++) {
						e0 = ((i * jz) + j) * 4;
						if (d0[e0 + 3] > 0) {
							r = 0;
							g = 0;
							b = 0;
							for (k = 0, kz = c; k < kz; k += this.skip) {
								x = j + cells[k][0];
								y = i + cells[k][1];
								if (x >= 0 && x < jz && y >= 0 && y < iz) {
									e = ((y * jz) + x) * 4;
									r += d0[e];
									e++;
									g += d0[e];
									e++;
									b += d0[e];
								}
							}
							if (s !== 0) {
								r /= s;
								g /= s;
								b /= s;
							}
							dR[e0] = r;
							e0++;
							dR[e0] = g;
							e0++;
							dR[e0] = b;
							e0++;
							dR[e0] = d0[e0] * alpha;
						}
					}
				}
			}
			else {
				for (i = 0, iz = data.height; i < iz; i++) {
					for (j = 0, jz = data.width; j < jz; j++) {
						e0 = ((i * jz) + j) * 4;
						if (d0[e0 + 3]) {
							r = 0;
							g = 0;
							b = 0;
							count = 0;
							for (k = 0, kz = c; k < kz; k += this.skip) {
								x = j + cells[k][0];
								y = i + cells[k][1];
								if (x >= 0 && x < jz && y >= 0 && y < iz) {
									e = ((y * jz) + x) * 4;
									if (d0[e + 3] > 0) {
										count++;
										r += d0[e];
										e++;
										g += d0[e];
										e++;
										b += d0[e];
									}
								}
							}
							if (count !== 0) {
								r /= count;
								g /= count;
								b /= count;
							}
							dR[e0] = r;
							e0++;
							dR[e0] = g;
							e0++;
							dR[e0] = b;
							e0++;
							dR[e0] = d0[e0] * alpha;
						}
					}
				}
			}
			return result;
		};
		/**
Blur helper function

@method getBrush
@param x {Number} brush x radius
@param y {Number} brush y radius
@param r {Number} brush roll (in degrees)
@return Array of objects used for the blur brush
**/
		my.BlurFilter.prototype.getBrush = function() {
			var x,
				y,
				r,
				dim,
				hDim,
				cos,
				sin,
				brush,
				cv,
				cvx,
				i,
				j;
			x = this.radiusX;
			y = this.radiusY;
			r = this.roll;
			dim = (x > y) ? x + 2 : y + 2;
			hDim = Math.floor(dim / 2);
			cos = Math.cos(r * my.radian);
			sin = Math.sin(r * my.radian);
			brush = [];
			cv = my.filterCanvas;
			cvx = my.filterCvx;
			cv.width = dim;
			cv.height = dim;
			cvx.setTransform(cos, sin, -sin, cos, hDim, hDim);
			cvx.beginPath();
			cvx.moveTo(-x, 0);
			cvx.lineTo(-1, -1);
			cvx.lineTo(0, -y);
			cvx.lineTo(1, -1);
			cvx.lineTo(x, 0);
			cvx.lineTo(1, 1);
			cvx.lineTo(0, y);
			cvx.lineTo(-1, 1);
			cvx.lineTo(-x, 0);
			cvx.closePath();
			for (i = 0; i < dim; i++) { //rows (y)
				for (j = 0; j < dim; j++) { //cols (x)
					if (cvx.isPointInPath(j, i)) {
						brush.push([j - hDim, i - hDim, 1]);
					}
				}
			}
			cvx.setTransform(1, 0, 0, 1, 0, 0);
			return brush;
		};
		/**
# LeachFilter

## Instantiation

* scrawl.makeLeachFilter()

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
			this.exclude = items.exclude || [];
			this.operation = 'xor';
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
Unlike other filters, the leach filter uses an 'xor' GCO to stamp itself onto the canvas - this is changeable, if necessary

@property operation
@type String
@default 'xor'
**/
			operation: 'xor',
			/**
The exclude array should contain a set of arrays defining the color ranges to be leached (have their alpha values set to 0) from the image. Each array within the exclude array must include the following six numbers in exactly this order: 

[minRed, minGreen, minBlue, maxRed, maxGreen, maxBlue]

... where the numbers are integers between 0 and 255

@property exclude
@type Array
@default []
**/
			exclude: []
		};
		my.mergeInto(my.d.LeachFilter, my.d.Filter);
		/**
Add function - takes data, calculates its channels and combines it with data

@method add
@param {Object} data - canvas getImageData object
@return amended image data object
**/
		my.LeachFilter.prototype.add = function(data) {
			var r,
				g,
				b,
				rMax,
				gMax,
				bMax,
				rMin,
				gMin,
				bMin,
				d,
				i,
				iz,
				j,
				jz,
				flag,
				exclude = this.exclude;
			d = data.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					flag = false;
					r = d[i];
					g = d[i + 1];
					b = d[i + 2];
					for (j = 0, jz = exclude.length; j < jz; j++) {
						rMin = exclude[j][0];
						gMin = exclude[j][1];
						bMin = exclude[j][2];
						rMax = exclude[j][3];
						gMax = exclude[j][4];
						bMax = exclude[j][5];
						if (r >= rMin && r <= rMax && g >= gMin && g <= gMax && b >= bMin && b <= bMax) {
							flag = true;
							break;
						}
					}
					d[i + 3] = (flag) ? 255 : 0;
				}
			}
			return data;
		};
		/**
# SeparateFilter

## Instantiation

* scrawl.makeSeparateFilter()

## Purpose

* Separate colours to show primary or secondary colour channels only

## Access

* scrawl.filter.FILTERNAME - for the SeparateFilter object

@class SeparateFilter
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
Can be one of: 'red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'all'

@property channel
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
		my.SeparateFilter.prototype.add = function(data) {
			var alpha,
				channel,
				d,
				i,
				iz,
				col;
			alpha = this.getAlpha();
			channel = this.channel;
			d = data.data;
			for (i = 0, iz = d.length; i < iz; i += 4) {
				if (d[i + 3]) {
					switch (channel) {
						case 'red':
							d[i + 1] = 0;
							d[i + 2] = 0;
							break;
						case 'green':
							d[i] = 0;
							d[i + 2] = 0;
							break;
						case 'blue':
							d[i] = 0;
							d[i + 1] = 0;
							break;
						case 'cyan':
							col = (d[i + 1] + d[i + 2]) / 2;
							d[i] = 0;
							d[i + 1] = col;
							d[i + 2] = col;
							break;
						case 'magenta':
							col = (d[i] + d[i + 2]) / 2;
							d[i + 1] = 0;
							d[i] = col;
							d[i + 2] = col;
							break;
						case 'yellow':
							col = (d[i] + d[i + 1]) / 2;
							d[i + 2] = 0;
							d[i + 1] = col;
							d[i] = col;
							break;
					}
					d[i + 3] *= alpha;
				}
			}
			return data;
		};
		/**
# NoiseFilter

## Instantiation

* scrawl.makeNoiseFilter()

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
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Filter.call(this, items);
			this.radiusX = get(items.radiusX, 2);
			this.radiusY = get(items.radiusY, 2);
			this.roll = get(items.roll, 2);
			this.cells = (my.xt(items.cells)) ? items.cells : false;
			this.strength = get(items.strength, 0.3);
			if (!Array.isArray(this.cells)) {
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
		my.NoiseFilter.prototype.add = function(data) {
			var alpha,
				d0,
				dR,
				result,
				strength,
				i,
				iz,
				j,
				jz,
				k,
				kz,
				e,
				e0,
				x,
				y,
				cell,
				cellLen,
				rnd = Math.random,
				floor = Math.floor;
			alpha = this.getAlpha();
			d0 = data.data;
			result = my.cvx.createImageData(data.width, data.height);
			dR = result.data;
			strength = this.strength;
			cellLen = this.cells.length;
			for (i = 0, iz = data.height; i < iz; i++) {
				for (j = 0, jz = data.width; j < jz; j++) {
					e0 = ((i * jz) + j) * 4;
					if (d0[e0 + 3]) {
						if (rnd() < strength) {
							cell = this.cells[floor(rnd() * cellLen)];
							x = j + cell[0];
							y = i + cell[1];
							if (x >= 0 && x < jz && y >= 0 && y < iz) {
								e = ((y * jz) + x) * 4;
								dR[e0] = d0[e];
								dR[e0 + 1] = d0[e + 1];
								dR[e0 + 2] = d0[e + 2];
								dR[e0 + 3] = d0[e0 + 3] * alpha;
							}
						}
						else {
							dR[e0] = d0[e0];
							dR[e0 + 1] = d0[e0 + 1];
							dR[e0 + 2] = d0[e0 + 2];
							dR[e0 + 3] = d0[e0 + 3] * alpha;
						}
					}
				}
			}
			return result;
		};

		return my;
	}(scrawl));
}
