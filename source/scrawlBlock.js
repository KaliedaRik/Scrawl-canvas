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
# scrawlBlock

## Purpose and features

The Block module adds Block entitys - squares and rectangles - to the core module

* Defines 'rect' objects for displaying on a Cell's canvas
* Performs 'rect' based drawing operations on canvases

@module scrawlBlock
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'block')) {
	var scrawl = (function(my, S) {
		'use strict';
		/**
	# window.scrawl

	scrawlBlock module adaptions to the Scrawl library object

	@class window.scrawl_Block
	**/

		/**
	A __factory__ function to generate new Block entitys
	@method newBlock
	@param {Object} items Key:value Object argument for setting attributes
	@return Block object
	@example
		scrawl.newBlock({
			width: 100,
			height: 50,
			startX: 150,
			startY: 60,
			fillStyle: 'blue',
			strokeStyle: 'red',
			roll: 30,
			method: 'sinkInto',
			});
	**/
		my.newBlock = function(items) {
			return new my.Block(items);
		};

		/**
	# Block

	## Instantiation

	* scrawl.newBlock()

	## Purpose

	* Defines 'rect' objects for displaying on a Cell's canvas
	* Performs 'rect' based drawing operations on canvases

	## Access

	* scrawl.entity.BLOCKNAME - for the Block entity object

	@class Block
	@constructor
	@extends Entity
	@param {Object} [items] Key:value Object argument for setting attributes
	**/
		my.Block = function Block(items) {
			items = my.safeObject(items);
			my.Entity.call(this, items);
			my.Position.prototype.set.call(this, items);
			this.width = my.xtGet(items.width, my.d.Block.width);
			this.height = my.xtGet(items.height, my.d.Block.height);
			this.setLocalDimensions();
			this.registerInLibrary();
			my.pushUnique(my.group[this.group].entitys, this.name);
			return this;
		};
		my.Block.prototype = Object.create(my.Entity.prototype);
		/**
	@property type
	@type String
	@default 'Block'
	@final
	**/
		my.Block.prototype.type = 'Block';
		my.Block.prototype.classname = 'entitynames';
		my.d.Block = {
			/**
	Block display - width, in pixels
	@property localWidth
	@type Number
	@default 0
	**/
			localWidth: 0,
			/**
	Block display - height, in pixels
	@property localHeight
	@type Number
	@default 0
	**/
			localHeight: 0,
		};
		my.mergeInto(my.d.Block, my.d.Entity);
		/**
	Augments Entity.set()
	@method set
	@param {Object} items Object consisting of key:value attributes
	@return This
	@chainable
	**/
		my.Block.prototype.set = function(items) {
			my.Entity.prototype.set.call(this, items);
			if (my.xto(items.width, items.height, items.scale)) {
				this.setLocalDimensions();
			}
			return this;
		};
		/**
	Augments Entity.set()
	@method setDelta
	@param {Object} items Object consisting of key:value attributes
	@return This
	@chainable
	**/
		my.Block.prototype.setDelta = function(items) {
			my.Entity.prototype.setDelta.call(this, items);
			if (my.xto(items.width, items.height, items.scale)) {
				this.setLocalDimensions();
			}
			return this;
		};
		/**
	Augments Entity.set() - sets the local dimensions
	@method setLocalDimensions
	@return This
	@chainable
	**/
		S.Block_setLocalDimensions_cell = null; //scrawl Cell object
		my.Block.prototype.setLocalDimensions = function() {
			S.Block_setLocalDimensions_cell = my.cell[my.group[this.group].cell];
			if (my.isa(this.width, 'str')) {
				this.localWidth = (parseFloat(this.width) / 100) * S.Block_setLocalDimensions_cell.actualWidth * this.scale;
			}
			else {
				this.localWidth = this.width * this.scale || 0;
			}
			if (my.isa(this.height, 'str')) {
				this.localHeight = (parseFloat(this.height) / 100) * S.Block_setLocalDimensions_cell.actualHeight * this.scale;
			}
			else {
				this.localHeight = this.height * this.scale || 0;
			}
			return this;
		};
		/**
	Stamp helper function - perform a 'clip' method draw
	@method clip
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@return This
	@chainable
	@private
	**/
		S.Block_stamp_here = null; //scrawl Vector object
		my.Block.prototype.clip = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.beginPath();
			ctx.rect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			ctx.clip();
			return this;
		};
		/**
	Stamp helper function - perform a 'clear' method draw
	@method clear
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.clear = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			my.cell[cell].setToClearShape();
			this.rotateCell(ctx, cell);
			ctx.clearRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
	Stamp helper function - perform a 'clearWithBackground' method draw
	@method clearWithBackground
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		S.Block_clearWithBackground_myCell = null; //scrawl Cell object
		S.Block_clearWithBackground_bg = '';
		S.Block_clearWithBackground_myCellCtx = null; //scrawl Context object
		S.Block_clearWithBackground_fillStyle = '';
		S.Block_clearWithBackground_strokeStyle = '';
		S.Block_clearWithBackground_globalAlpha = '';
		my.Block.prototype.clearWithBackground = function(ctx, cell) {
			S.Block_clearWithBackground_myCell = my.cell[cell];
			S.Block_clearWithBackground_bg = S.Block_clearWithBackground_myCell.get('backgroundColor');
			S.Block_clearWithBackground_myCellCtx = my.ctx[cell];
			S.Block_clearWithBackground_fillStyle = S.Block_clearWithBackground_myCellCtx.get('fillStyle');
			S.Block_clearWithBackground_strokeStyle = S.Block_clearWithBackground_myCellCtx.get('strokeStyle');
			S.Block_clearWithBackground_globalAlpha = S.Block_clearWithBackground_myCellCtx.get('globalAlpha');
			S.Block_stamp_here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.fillStyle = S.Block_clearWithBackground_bg;
			ctx.strokeStyle = S.Block_clearWithBackground_bg;
			ctx.globalAlpha = 1;
			ctx.strokeRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			ctx.fillRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			ctx.fillStyle = S.Block_clearWithBackground_fillStyle;
			ctx.strokeStyle = S.Block_clearWithBackground_strokeStyle;
			ctx.globalAlpha = S.Block_clearWithBackground_globalAlpha;
			return this;
		};
		/**
	Stamp helper function - perform a 'draw' method draw
	@method draw
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.draw = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.strokeRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
	Stamp helper function - perform a 'fill' method draw
	@method fill
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.fill = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.fillRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
	Stamp helper function - perform a 'drawFill' method draw
	@method drawFill
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.drawFill = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.strokeRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			this.clearShadow(ctx, cell);
			ctx.fillRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
	Stamp helper function - perform a 'fillDraw' method draw
	@method fillDraw
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.fillDraw = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.fillRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			this.clearShadow(ctx, cell);
			ctx.strokeRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
	Stamp helper function - perform a 'sinkInto' method draw
	@method sinkInto
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.sinkInto = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.fillRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			ctx.strokeRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
	Stamp helper function - perform a 'floatOver' method draw
	@method floatOver
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.floatOver = function(ctx, cell) {
			S.Block_stamp_here = this.prepareStamp();
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			ctx.strokeRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			ctx.fillRect(S.Block_stamp_here.x, S.Block_stamp_here.y, this.localWidth, this.localHeight);
			return this;
		};
		/**
	Stamp helper function - perform a 'none' method draw
	@method floatOver
	@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
	@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
	@return This
	@chainable
	@private
	**/
		my.Block.prototype.none = function(ctx, cell) {
			this.prepareStamp();
			return this;
		};

		return my;
	}(scrawl, scrawlVars));
}
