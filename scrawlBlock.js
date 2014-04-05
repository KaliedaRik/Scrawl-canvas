'use strict';
/**
# scrawlBlock

## Purpose and features

The Block module adds Block sprites - squares and rectangles - to the core module

* Defines 'rect' objects for displaying on a Cell's canvas
* Performs 'rect' based drawing operations on canvases

@module scrawlBlock
**/

var scrawl = (function(my){
/**
# window.scrawl

scrawlBlock module adaptions to the Scrawl library object

@class window.scrawl_Block
**/

/**
A __factory__ function to generate new Block sprites
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
	my.newBlock = function(items){
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

* scrawl.sprite.BLOCKNAME - for the Block sprite object

@class Block
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Block = function Block(items){
		items = my.safeObject(items);
		my.Sprite.call(this, items);
		my.Position.prototype.set.call(this, items);
		this.width = items.width || my.d.Block.width;
		this.height = items.height || my.d.Block.height;
		this.registerInLibrary();
		my.pushUnique(my.group[this.group].sprites, this.name);
		return this;
		};
	my.Block.prototype = Object.create(my.Sprite.prototype);
/**
@property type
@type String
@default 'Block'
@final
**/		
	my.Block.prototype.type = 'Block';
	my.Block.prototype.classname = 'spritenames';
	my.d.Block = {};
	my.mergeInto(my.d.Block, my.d.Sprite);
/*	my.Block.prototype.set = function(items){
		my.Sprite.prototype.set.call(this, items);
		this.width = items.width || this.width;
		this.height = items.height || this.height;
		return this;
		};
	my.Block.prototype.setDelta = function(items){
		my.Sprite.prototype.setDelta.call(this, items);
		if(my.xt(items.width)){this.width += items.width;}
		if(my.xt(items.height)){this.height += items.height;}
		return this;
		};
*/
/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@return This
@chainable
@private
**/
	my.Block.prototype.clip = function(ctx, cell){
		var here = this.prepareStamp();
		ctx.save();
		this.rotateCell(ctx);
		ctx.beginPath();
		ctx.rect(here.x, here.y, (this.width * this.scale), (this.height * this.scale));
		ctx.clip();
		return this;
		};
/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.clear = function(ctx, cell){
		var here = this.prepareStamp();
		my.cell[cell].setToClearShape();
		this.rotateCell(ctx);
		ctx.clearRect(here.x, here.y, (this.width * this.scale), (this.height * this.scale));
		return this;
		};
/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.clearWithBackground = function(ctx, cell){
		var myCell = my.cell[cell],
			bg = myCell.get('backgroundColor'),
			myCellCtx = my.ctx[cell],
			fillStyle = myCellCtx.get('fillStyle'),
			strokeStyle = myCellCtx.get('strokeStyle'),
			globalAlpha = myCellCtx.get('globalAlpha'),
			here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		this.rotateCell(ctx);
		ctx.fillStyle = bg;
		ctx.strokeStyle = bg;
		ctx.globalAlpha = 1;
		ctx.strokeRect(here.x, here.y, width, height);
		ctx.fillRect(here.x, here.y, width, height);
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		ctx.globalAlpha = globalAlpha;
		return this;
		};
/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.draw = function(ctx, cell){
		var here = this.prepareStamp();
		my.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		ctx.strokeRect(here.x, here.y, (this.width * this.scale), (this.height * this.scale));
		return this;
		};
/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.fill = function(ctx, cell){
		var here = this.prepareStamp();
		my.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		ctx.fillRect(here.x, here.y, (this.width * this.scale), (this.height * this.scale));
		return this;
		};
/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.drawFill = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		my.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		ctx.strokeRect(here.x, here.y, width, height);
		this.clearShadow(ctx, cell);
		ctx.fillRect(here.x, here.y, width, height);
		return this;
		};
/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.fillDraw = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		my.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		ctx.fillRect(here.x, here.y, width, height);
		this.clearShadow(ctx, cell);
		ctx.strokeRect(here.x, here.y, width, height);
		return this;
		};
/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.sinkInto = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		my.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		ctx.fillRect(here.x, here.y, width, height);
		ctx.strokeRect(here.x, here.y, (this.width * this.scale), (this.height * this.scale));
		return this;
		};
/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Block.prototype.floatOver = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		my.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		ctx.strokeRect(here.x, here.y, width, height);
		ctx.fillRect(here.x, here.y, width, height);
		return this;
		};

	return my;
	}(scrawl));
