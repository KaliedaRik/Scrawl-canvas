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

@class window.scrawl_Multifilters
**/
		my.pushUnique(my.work.sectionlist, 'multifilter');
		my.pushUnique(my.work.nameslist, 'multifilternames');

		/**
A __factory__ function to generate new Multifilter objects
@method makeMultifilter
@param {Object} items Key:value Object argument for setting attributes
@return Multifilter object
**/
		my.makeMultifilter = function(items) {
			return new my.Multifilter(items);
		};
		// THIS IS TEMPORARY! NO SUCH FACTORY IN MULTIFILTERS!!
		my.makeGreyscaleFilter = function(items) {return false;};



// THESE HOOK FUNCTIONS NEED TO BE CODED UP!
// =========================================



	/**
scrawl.init hook function - modified by multifilters extension
@method multifiltersInit
@private
**/
	my.multifiltersInit = function() {};



	/**
Pad constructor hook function - modified by multifilters extension
@method multifiltersPadInit
@private
**/
	my.Pad.prototype.multifiltersPadInit = function(items) {};



	/**
Display function - requests Cells to compile their &lt;canvas&gt; element

Cells will compile in ascending order of their compileOrder attributes, if their compiled attribute = true

By default:
* the initial base canvas has a compileOrder of 9999 and compiles last
* the initial display canvas has compiled = false and will not compile

(This function is replaced by the Filters or multifilters extension)

@method compile
@return This
@chainable
**/
	my.Pad.prototype.compile = function(mouse) {
		var cell = my.cell,
			cells = this.cellsCompileOrder,
			current,
			i,
			iz;
		this.sortCellsCompile();
		for (i = 0, iz = cells.length; i < iz; i++) {
			current = cell[cells[i]];
			if (current.rendered && current.compiled) {
				current.compile(mouse);
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

(This function is replaced by the Filters or multifilters extension)

@method show
@return This
@chainable
**/
	my.Pad.prototype.show = function() {
		var display,
			base,
			cell,
			cells = my.cell,
			order = this.cellsShowOrder,
			i,
			iz;
		display = cells[this.display];
		base = cells[this.base];
		this.sortCellsShow();
		for (i = 0, iz = order.length; i < iz; i++) {
			cell = cells[order[i]];
			if (cell.rendered && cell.shown) {
				base.copyCellToSelf(cell);
			}
		}
		display.copyCellToSelf(base, true);
		return this;
	};



	/**
Cell constructor hook function - modified by multifilters extension
@method multifiltersCellInit
@private
**/
	my.Cell.prototype.multifiltersCellInit = function(items) {};



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
Entity constructor hook function - modified by multifilters extension
@method multifiltersEntityInit
@private
**/
	my.Entity.prototype.multifiltersEntityInit = function(items) {};




	/**
Stamp function - instruct entity to draw itself on a Cell's &lt;canvas&gt; element, if its visibility attribute is true

Permitted methods include:

* 'draw' - stroke the entity's path with the entity's strokeStyle color, pattern or gradient
* 'fill' - fill the entity's path with the entity's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the entity's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the entity's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the entity's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the entity's path; shadow offset is added to both actions
* 'clear' - fill the entity's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the entity's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the entity's path (not tested)
* 'none' - perform all necessary updates, but do not draw the entity onto the canvas
@method stamp
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cellname] CELLNAME of cell on which entitys are to draw themselves
@param {Object} [cell] cell wrapper object
@param {Vector} [mouse] coordinates to be used for any entity currently pivoted to a mouse/touch event
@return This
@chainable

// I THINK THIS NEEDS TO BE OVERWRITTEN IN ITS ENTIRETY BY MULTIFILTERS? THOUGH THAT LEADS TO PROBLEMS FOR ENTITYS THAT OVERWRITE THIS FUNCTION?
// HOWEVER, FOR NOW WE CAN TRY TO REDIRECT THE STAMPING ONTO THE MULTIFILTER HIDDEN CELL ...?
**/
	// my.Entity.prototype.stamp = function(method, cellname, cell, mouse) {
	// 	var engine,
	// 		cellCtx,
	// 		eCtx,
	// 		here,
	// 		sCanvas,
	// 		sEngine,
	// 		sFlag = !this.currentStart.flag,
	// 		hFlag = !this.currentHandle.flag,
	// 		data;
	// 	if (this.visibility) {
	// 		if (!cell) {
	// 			cell = my.cell[cellname] || my.cell[my.group[this.group].cell];
	// 			cellname = cell.name;
	// 		}
	// 		engine = my.context[cellname];
	// 		method = method || this.method;
	// 		if (sFlag || hFlag) {
	// 			if (sFlag) {
	// 				this.updateCurrentStart(cell);
	// 			}
	// 			if (hFlag) {
	// 				this.updateCurrentHandle();
	// 			}
	// 			this.resetCollisionPoints();
	// 		}
	// 		if (this.pivot) {
	// 			this.setStampUsingPivot(cellname, mouse);
	// 			this.maxDimensions.flag = true;
	// 		}
	// 		else {
	// 			this.pathStamp();
	// 		}
	// 		this[method](engine, cellname, cell);
	// 		this.stampFilter(engine, cellname, cell);
	// 		this.stampMultifilter(engine, cellname, cell);
	// 	}
	// 	return this;
	// };

	/**
Entity.stamp hook function - modified by multifilters extension
@method stampMultifilter
@private
**/
	my.Entity.prototype.stampMultifilter = function() {};


















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
		my.Multifilter = function Multifilter(items) {
			var get = my.xtGet;
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.stencil = get(items.stencil, false);
			this.definitions = get(items.definitions, false);
			return this;
		};
		my.Multifilter.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Multifilter'
@final
**/
		my.Multifilter.prototype.type = 'Multifilter';
		my.Multifilter.prototype.classname = 'multifilternames';
		my.work.d.Multifilter = {
			/**
Whether to treat the entity or cell being filtered as a stencil (true) in which case the background behind the stencil is filtered, or just filter the entity itself (the default setting)
@property stencil
@type Boolean
@default false
**/
			stencil: false,
			/**
An Array of filter definition Objects - each type of filter definition object must include a __type__ attribute, and an optional __order__ attribute, alongside any specific attributes required by that particular filter
@property definitions
@type Array
@default []
**/
			definitions: []
		};
		my.mergeInto(my.work.d.Multifilter, my.work.d.Base);
		/**
Checks every fourth item in the array to see if it is > 0; when this occurs, something in that row is going to appear, thus the row needs to be actioned. Performs the check both left-to-right and right-to-left so we can restrict the area of work to be performed 

@method checkRowForWork
@param {Array} data - An array representing a row from a canvas
@private
@return a 2-item array of Numbers: [leftValue, rightValue] - if no work is required on the row then the return is [-1, -1]
**/
		my.Multifilter.prototype.checkRowForWork = function(data) {
			var len = data.length,
				left = -1,
				right = -1,
				i, j;
			for(i = 3; i < len; i += 4){
				if(data[i]){
					left = i - 3;
					break;
				}
			}
			if(left >= 0){
				for(j = len - 1; j > 0; j -= 4){
					if(j < left){
						break;
					}
					if(data[j]){
						right = j - 3;
						break;
					}
				}
			}
			return [left, right];
		};






		// REMEMBER - CODE BELOW HERE REQUIRED TO COMPLETE THE EXTENSION
		// =============================================================

		return my;
	}(scrawl));
}
