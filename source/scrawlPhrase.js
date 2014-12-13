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
# scrawlPhrase

## Purpose and features

The Phrase module adds Phrase entitys - single and multi-line text objects - to the core module

* Defines text objects for displaying on a Cell's canvas
* Handles all related font functionality
* Performs text drawing operations on canvases

@module scrawlPhrase
**/

if (window.scrawl && !window.scrawl.newPhrase) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlPhrase module adaptions to the Scrawl library object

## New library sections

* scrawl.text 

@class window.scrawl_Phrase
**/

		/**
A __factory__ function to generate new Phrase entitys
@method newPhrase
@param {Object} items Key:value Object argument for setting attributes
@return Phrase object
@example
	scrawl.newPhrase({
		startX: 50,
		startY: 20,
		fillStyle: 'red',
		font: '20pt Arial, sans-serif',
		textAlign: 'center',
		text: 'Hello, world!\nHow are you today?',
		});
**/
		my.newPhrase = function(items) {
			return new my.Phrase(items);
		};
		my.pushUnique(my.sectionlist, 'text');
		my.pushUnique(my.nameslist, 'textnames');

		/**
# Phrase

## Instantiation

* scrawl.newPhrase()

## Purpose

* Defines text objects for displaying on a Cell's canvas
* Handles all related font functionality
* Performs text drawing operations on canvases

## Access

* scrawl.entity.PHRASENAME - for the Phrase entity object

@class Phrase
@constructor
@extends Entity
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Phrase = function Phrase(items) {
			items = my.safeObject(items);
			my.Entity.call(this, items);
			my.Position.prototype.set.call(this, items);
			this.registerInLibrary();
			this.lineHeight = my.xtGet(items.lineHeight, my.d.Phrase.lineHeight);
			if (items.font) {
				this.checkFont(items.font);
			}
			this.constructFont();
			this.size = this.get('size');
			this.multiline(items);
			this.getMetrics();
			return this;
		};
		my.Phrase.prototype = Object.create(my.Entity.prototype);
		/**
@property type
@type String
@default 'Phrase'
@final
**/
		my.Phrase.prototype.type = 'Phrase';
		my.Phrase.prototype.classname = 'entitynames';
		my.d.Phrase = {
			/**
Text string to be displayed - for multiline text, insert __\n__ where the text line breaks
@property text
@type String
@default ''
**/
			text: '',
			/**
Font style property - any permitted CSS style String (eg 'italic')
@property style
@type String
@default 'normal'
**/
			style: 'normal',
			/**
Font variant property - any permitted CSS variant String (eg 'small-caps')
@property variant
@type String
@default 'normal'
**/
			variant: 'normal',
			/**
Font weight property - any permitted CSS weight String or number (eg 'bold', 700)
@property weight
@type String
@default 'normal'
**/
			weight: 'normal',
			/**
Font size
@property size
@type Number
@default 12
**/
			size: 12,
			/**
Font metrics property - any permitted CSS metrics String (eg 'pt', 'px')
@property metrics
@type String
@default 'pt'
**/
			metrics: 'pt',
			/**
Font family property - any permitted CSS font family String

_Note: a font needs to be pre-loaded by the web page before the &lt;canvas&gt; element can successfully use it_
@property family
@type String
@default 'sans-serif'
**/
			family: 'sans-serif',
			/**
Multiline text - line height
@property lineHeight
@type Number
@default 1.5
**/
			lineHeight: 1.5,
			/**
Background color - any permitted CSS Color string
@property backgroundColor
@type String
@default ''
**/
			backgroundColor: '',
			/**
Background margin - additional padding around the text (in pixels), colored in by the background color
@property backgroundMargin
@type Number
@default 0
**/
			backgroundMargin: 0,
			/**
Text along path parameter - when placing text along a path, the text can be positioned in phrase blocks, word blocks or by individual letters. Permitted values: 'phrase', 'word', 'glyph' (for individual letters)

_Note: the __path__ module needs to be added to the core to use this functionality_
@property textAlongPath
@type String
@default 'phrase'
**/
			textAlongPath: 'phrase',
			/**
Fixed width attribute for text along path. When using fixed width (monospace) fonts, set this flag to true for faster rendering

_Note: the __path__ module needs to be added to the core to use this functionality_
@property fixedWidth
@type Boolean
@default false
**/
			fixedWidth: false,
			/**
Array of TEXTNANE strings

Users should never interfere with Text objects, as they are destroyed and recreated after every Phrase.set() and Phrase.setDelta() function call
@property texts
@type Array
@default []
@private
**/
			texts: [],
		};
		my.mergeInto(my.d.Phrase, my.d.Entity);
		/**
Augments Entity.set()

Allows users to:
* alter the font either by the font attribute, or by individual font content attributes
* update the text
* change other Entity and Phrase object attributes
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Phrase.prototype.set = function(items) {
			my.Entity.prototype.set.call(this, items);
			items = my.safeObject(items);
			this.lineHeight = my.xtGet(items.lineHeight, this.lineHeight);
			if (items.font) {
				this.checkFont(items.font);
				this.offset.flag = false;
			}
			if (items.text || items.size || items.scale) {
				this.offset.flag = false;
			}
			this.constructFont();
			this.size = this.get('size');
			this.multiline(items);
			this.getMetrics();
			return this;
		};
		/**
Augments Entity.detDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Phrase.prototype.setDelta = function(items) {
			my.Entity.prototype.setDelta.call(this, items);
			if (items.text) {
				this.offset.flag = false;
			}
			if (items.size || items.scale) {
				this.constructFont();
				this.offset.flag = false;
			}
			this.getMetrics();
			return this;
		};
		/**
Augments Entity.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
		my.Phrase.prototype.clone = function(items) {
			items.texts = [];
			return my.Entity.prototype.clone.call(this, items);
		};
		/**
Helper function - creates Text objects for each line of text in a multiline Phrase
@method multiline
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.multiline = function(items) {
			items = JSON.parse(JSON.stringify(items));
			var text = '' + (items.text || this.get('text')),
				textArray = text.split('\n');
			if (my.xt(this.texts)) {
				for (var i = 0, iz = this.texts.length; i < iz; i++) {
					delete my.text[this.texts[i]];
					my.removeItem(my.textnames, this.texts[i]);
				}
			}
			this.texts = [];
			items.phrase = this.name;
			for (var j = 0, jz = textArray.length; j < jz; j++) {
				items.text = textArray[j];
				if (items.text.length > 0) {
					new my.Text(items);
				}
			}
			this.text = text;
			return this;
		};
		/**
Helper function - checks to see if font needs to be (re)constructed from its parts
@method checkFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.checkFont = function(item) {
			if (my.xt(item)) {
				this.deconstructFont();
			}
			this.constructFont();
			return this;
		};
		/**
Helper function - creates font-related attributes from entity's Context object's font attribute
@method deconstructFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.deconstructFont = function() {
			var myFont = my.ctx[this.context].font,
				res,
				exclude = [100, 200, 300, 400, 500, 600, 700, 800, 900, 'italic', 'oblique', 'small-caps', 'bold', 'bolder', 'lighter', 'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
				myFamily,
				myFontArray,
				style = this.get('style'),
				variant = this.get('variant'),
				weight = this.get('weight'),
				size = this.get('size'),
				metrics = this.get('metrics'),
				family = this.get('family');
			if (/italic/i.test(myFont)) {
				style = 'italic';
			}
			else if (/oblique/i.test(myFont)) {
				style = 'oblique';
			}
			else {
				this.style = 'normal';
			}
			if (/small-caps/i.test(myFont)) {
				variant = 'small-caps';
			}
			else {
				variant = 'normal';
			}
			if (/bold/i.test(myFont)) {
				weight = 'bold';
			}
			else if (/bolder/i.test(myFont)) {
				weight = 'bolder';
			}
			else if (/lighter/i.test(myFont)) {
				weight = 'lighter';
			}
			else if (/([1-9]00)/i.test(myFont)) {
				res = myFont.match(/([1-9]00)/i);
				weight = res[1];
			}
			else {
				weight = 'normal';
			}
			res = false;
			if (/(\d+)(%|in|cm|mm|em|ex|pt|pc|ex)?/i.test(myFont)) {
				res = myFont.match(/(\d+)(%|in|cm|mm|em|ex|pt|pc|ex|px)/i);
				size = parseFloat(res[1]);
				metrics = res[2];
			}
			else if (/xx-small/i.test(myFont)) {
				size = 3;
				metrics = 'pt';
			}
			else if (/x-small/i.test(myFont)) {
				size = 6;
				metrics = 'pt';
			}
			else if (/small/i.test(myFont)) {
				size = 9;
				metrics = 'pt';
			}
			else if (/medium/i.test(myFont)) {
				size = 12;
				metrics = 'pt';
			}
			else if (/large/i.test(myFont)) {
				size = 15;
				metrics = 'pt';
			}
			else if (/x-large/i.test(myFont)) {
				size = 18;
				metrics = 'pt';
			}
			else if (/xx-large/i.test(myFont)) {
				size = 21;
				metrics = 'pt';
			}
			else {
				size = 12;
				metrics = 'pt';
			}
			myFamily = '';
			myFontArray = myFont.split(' ');
			for (var i = 0, z = myFontArray.length; i < z; i++) {
				if (!my.contains(exclude, myFontArray[i])) {
					if (!myFontArray[i].match(/[^\/](\d)+(%|in|cm|mm|em|ex|pt|pc|ex)?/i)) {
						myFamily += myFontArray[i] + ' ';
					}
				}
			}
			if (!myFamily) {
				myFamily = 'Verdana, Geneva, sans-serif';
			}
			family = myFamily;
			my.Base.prototype.set.call(this, {
				style: style,
				variant: variant,
				weight: weight,
				size: size,
				metrics: metrics,
				family: family,
			});
			return this;
		};
		/**
Helper function - creates entity's Context object's phrase attribute from other font-related attributes
@method constructFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
		my.Phrase.prototype.constructFont = function() {
			var myFont = '',
				style = this.get('style'),
				variant = this.get('variant'),
				weight = this.get('weight'),
				size = this.get('size'),
				metrics = this.get('metrics'),
				family = this.get('family');
			if (style !== 'normal') {
				myFont += style + ' ';
			}
			if (variant !== 'normal') {
				myFont += variant + ' ';
			}
			if (weight !== 'normal') {
				myFont += weight + ' ';
			}
			myFont += (size * this.scale) + metrics + ' ';
			myFont += family;
			my.ctx[this.context].font = myFont;
			return this;
		};
		/**
Augments Entity.stamp()
@method stamp
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
**/
		my.Phrase.prototype.stamp = function(method, cell) {
			var test;
			if (this.visibility) {
				test = (my.contains(my.entitynames, this.path) && my.entity[this.path].type === 'Path');
				if (this.pivot || !test || this.get('textAlongPath') === 'phrase') {
					my.Entity.prototype.stamp.call(this, method, cell);
				}
				else {
					my.text[this.texts[0]].stampAlongPath(method, cell);
					this.stampFilter(my.context[cell], cell);
				}
			}
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
		my.Phrase.prototype.clear = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			ctx.globalCompositeOperation = 'destination-out';
			this.rotateCell(ctx, cell);
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].clear(ctx, cell, tX, tY);
			}
			ctx.globalCompositeOperation = my.ctx[cell].get('globalCompositeOperation');
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
		my.Phrase.prototype.clearWithBackground = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].clearWithBackground(ctx, cell, tX, tY);
			}
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
		my.Phrase.prototype.draw = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].draw(ctx, cell, tX, tY);
			}
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
		my.Phrase.prototype.fill = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].fill(ctx, cell, tX, tY);
			}
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
		my.Phrase.prototype.drawFill = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].drawFill(ctx, cell, tX, tY, this);
			}
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
		my.Phrase.prototype.fillDraw = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].fillDraw(ctx, cell, here.x + o.x, tY, this);
			}
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
		my.Phrase.prototype.sinkInto = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				this.addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].sinkInto(ctx, cell, here.x + o.x, tY);
			}
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
		my.Phrase.prototype.floatOver = function(ctx, cell) {
			var tX,
				tY,
				o = this.getOffset(),
				here = this.prepareStamp(),
				textY = this.size * this.lineHeight * this.scale;
			my.cell[cell].setEngine(this);
			this.rotateCell(ctx, cell);
			if (my.xt(this.backgroundColor)) {
				addBackgroundColor(ctx, here);
			}
			tX = here.x + o.x;
			for (var i = 0, z = this.texts.length; i < z; i++) {
				tY = here.y + (textY * i) + o.y;
				my.text[this.texts[i]].floatOver(ctx, cell, here.x + o.x, tY);
			}
			return this;
		};
		/**
Stamp helper function - perform a 'none' method draw
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Phrase.prototype.none = function(ctx, cell) {
			this.prepareStamp();
			return this;
		};
		/**
Helper function - calculate entity's width and height attributes, taking into account font size, scaling, etc
@method getMetrics
@param {String} cellname CELLNAME String (any &lt;canvas&gt; will do for this function)
@return This
@chainable
@private
**/
		my.Phrase.prototype.getMetrics = function(cellname) {
			var h = 0,
				w = 0,
				texts = this.texts;
			for (var i = 0, z = texts.length; i < z; i++) {
				w = (my.text[texts[i]].get('width') > w) ? my.text[texts[i]].width : w;
				h += my.text[texts[i]].get('height');
			}
			this.width = w;
			this.height = h;
			return this;
		};
		/**
Drawing function - stamps a background block onto the &lt;canvas&gt; element
@method addBackgroundColor
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {Vector} here Start coordinates for rectangle
@return This
@chainable
@private
**/
		my.Phrase.prototype.addBackgroundColor = function(ctx, here) {
			var margin = this.get('backgroundMargin'),
				topX = here.x - margin,
				topY = here.y - margin,
				w = (this.width * this.scale) + (margin * 2),
				h = (this.height * this.scale) + (margin * 2);
			ctx.fillStyle = this.backgroundColor;
			ctx.fillRect(topX, topY, w, h);
			ctx.fillStyle = my.ctx[this.context].get('fillStyle');
			return this;
		};
		/**
Drawing function - get entity offset values

Returns an object with coordinates __x__ and __y__
@method getOffset
@return JavaScript object
@private
**/
		my.Phrase.prototype.getOffset = function() {
			var myContext = my.ctx[this.context],
				oX = 0,
				oY = 0;
			switch (myContext.get('textAlign')) {
				case 'start':
				case 'left':
					oX = 0;
					break;
				case 'center':
					oX = (this.width / 2) * this.scale;
					break;
				case 'right':
				case 'end':
					oX = this.width * this.scale;
					break;
			}
			switch (myContext.get('textBaseline')) {
				case 'top':
					oY = 0;
					break;
				case 'hanging':
					oY = this.size * this.lineHeight * this.scale * 0.1;
					break;
				case 'middle':
					oY = this.size * this.lineHeight * this.scale * 0.5;
					break;
				case 'bottom':
					oY = this.size * this.lineHeight * this.scale;
					break;
				default:
					oY = this.size * this.lineHeight * this.scale * 0.85;
			}
			return {
				x: oX,
				y: oY
			};
		};

		/**
# Text

## Instantiation

* This object should never be instantiated by users
* Objects created via Phrase object

## Purpose

* Display single lines of text within a Phrase, or along a Shape path
* Each time the Phrase object text changes, the associated Text objects are destroyed and regenerated from scratch

@class Text
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
@private
**/
		my.Text = function Text(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.text = my.xtGet(items.text, my.d.Text.text);
			this.phrase = my.xtGet(items.phrase, my.d.Text.phrase);
			this.context = my.entity[this.phrase].context;
			this.fixedWidth = my.xtGet(items.fixedWidth, my.d.Text.fixedWidth);
			this.textAlongPath = my.xtGet(items.textAlongPath, my.d.Text.textAlongPath);
			my.text[this.name] = this;
			my.pushUnique(my.textnames, this.name);
			my.pushUnique(my.entity[this.phrase].texts, this.name);
			this.getMetrics();
			return this;
		};
		my.Text.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'Text'
@final
**/
		my.Text.prototype.type = 'Text';
		my.Text.prototype.classname = 'textnames';
		my.d.Text = {
			/**
Text to be displayed
@property text
@type String
@default ''
@private
**/
			text: '',
			/**
PHRASENAME String of parent Phrase object
@property phrase
@type String
@default ''
@private
**/
			phrase: '',
			/**
CTXNAME String of parent Phrase object's Context object
@property context
@type String
@default ''
@private
**/
			context: '',
			/**
fixedWidth value of parent Phrase object
@property fixedWidth
@type Boolean
@default false
@private
**/
			fixedWidth: false,
			/**
Text along path value of parent Phrase object
@property textAlongPath
@type String
@default 'phrase'
@private
**/
			textAlongPath: 'phrase',
			/**
Text line width, accounting for font, scale, etc
@property width
@type Number
@default 0
@private
**/
			width: 0,
			/**
Text line height, accounting for font, scale, lineHeight, etc
@property height
@type Number
@default 0
@private
**/
			height: 0,
			/**
Glyphs array
@property glyphs
@type Array
@default []
@private
**/
			glyphs: [],
			/**
Glyph widths array
@property glyphWidths
@type Array
@default []
@private
**/
			glyphWidths: [],
		};
		my.mergeInto(my.d.Text, my.d.Base);
		/**
Stamp function - stamp phrases, words or individual glyphs (letters and spaces) along a Shape entity path

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
@method stampAlongPath
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
		my.Text.prototype.stampAlongPath = function(method, cell) {
			var p = my.entity[this.phrase];
			method = (my.isa(method, 'str')) ? method : p.method;
			cell = (my.isa(cell, 'str') && my.contains(my.cellnames, cell)) ? cell : my.cell[my.group[p.group].cell];
			var engine = my.context[cell],
				myCell = my.cell[cell],
				here,
				pathLength = my.entity[p.path].getPerimeterLength(),
				width = this.width * p.scale,
				ratio = width / pathLength,
				pos = p.pathPlace,
				nowPos,
				oldText = this.text,
				x,
				y,
				r;
			if (!my.xt(this.glyphs)) {
				this.getMetrics();
			}
			myCell.setEngine(p);
			for (var j = 0, w = this.glyphs.length; j < w; j++) {
				if (my.xt(this.glyphs[j])) {
					this.text = this.glyphs[j];
					nowPos = pos + (((this.glyphWidths[j] / 2) / width) * ratio);
					if (!my.isBetween(nowPos, 0, 1, true)) {
						nowPos += (nowPos > 0.5) ? -1 : 1;
					}
					here = my.entity[p.path].getPerimeterPosition(nowPos, p.pathSpeedConstant, true);
					x = here.x;
					y = here.y;
					r = here.r * my.radian;
					engine.setTransform(1, 0, 0, 1, 0, 0);
					engine.translate(x, y);
					engine.rotate(r);
					engine.translate(-x, -y);
					switch (method) {
						case 'draw':
							this.draw(engine, cell, x, y);
							break;
						case 'fill':
							this.fill(engine, cell, x, y);
							break;
						case 'drawFill':
							this.drawFill(engine, cell, x, y, p);
							break;
						case 'fillDraw':
							this.fillDraw(engine, cell, x, y, p);
							break;
						case 'sinkInto':
							this.sinkInto(engine, cell, x, y);
							break;
						case 'floatOver':
							this.floatOver(engine, cell, x, y);
							break;
						default:
							//do nothing
					}
					pos += (this.glyphWidths[j] / width) * ratio;
					if (!my.isBetween(pos, 0, 1, true)) {
						pos += (pos > 0.5) ? -1 : 1;
					}
				}
			}
			this.text = oldText;
			return this;
		};
		/**
Filter function - prepare the clip for the filter
@method clipAlongPath
@return This
@chainable
@private
**/
		my.Text.prototype.clipAlongPath = function() {
			var p = my.entity[this.phrase],
				engine = my.cvx,
				here,
				pathLength = my.entity[p.path].getPerimeterLength(),
				width = this.width * p.scale,
				ratio = width / pathLength,
				pos = p.pathPlace,
				nowPos,
				oldText = this.text,
				x, y, r, i, iz;
			if (!my.xt(this.glyphs)) {
				this.getMetrics();
			}
			for (i = 0, iz = this.glyphs.length; i < iz; i++) {
				if (my.xt(this.glyphs[i])) {
					this.text = this.glyphs[i];
					nowPos = pos + (((this.glyphWidths[i] / 2) / width) * ratio);
					if (!my.isBetween(nowPos, 0, 1, true)) {
						nowPos += (nowPos > 0.5) ? -1 : 1;
					}
					here = my.entity[p.path].getPerimeterPosition(nowPos, p.pathSpeedConstant, true);
					x = here.x;
					y = here.y;
					r = here.r * my.radian;
					engine.setTransform(1, 0, 0, 1, 0, 0);
					engine.translate(x, y);
					engine.rotate(r);
					engine.translate(-x, -y);
					engine.fillText(this.text, x, y);
					pos += (this.glyphWidths[i] / width) * ratio;
					if (!my.isBetween(pos, 0, 1, true)) {
						pos += (pos > 0.5) ? -1 : 1;
					}
				}
			}
			this.text = oldText;
			return this;
		};
		/**
Stamp helper function - perform a 'clear' method draw
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.clear = function(ctx, cell, x, y) {
			ctx.fillText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.clearWithBackground = function(ctx, cell, x, y) {
			ctx.fillStyle = my.cell[cell].backgroundColor;
			ctx.globalAlpha = 1;
			ctx.fillText(this.text, x, y);
			ctx.fillStyle = my.ctx[cell].fillStyle;
			ctx.globalAlpha = my.ctx[cell].globalAlpha;
			return this;
		};
		/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.draw = function(ctx, cell, x, y) {
			ctx.strokeText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.fill = function(ctx, cell, x, y) {
			ctx.fillText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@param {Phrase} p Parent Phrase entity object
@return This
@chainable
@private
**/
		my.Text.prototype.drawFill = function(ctx, cell, x, y, p) {
			ctx.strokeText(this.text, x, y);
			p.clearShadow(ctx, cell);
			ctx.fillText(this.text, x, y);
			p.restoreShadow(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'fillDraw' method draw
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@param {Phrase} p Parent Phrase entity object
@return This
@chainable
@private
**/
		my.Text.prototype.fillDraw = function(ctx, cell, x, y, p) {
			ctx.fillText(this.text, x, y);
			p.clearShadow(ctx, cell);
			ctx.strokeText(this.text, x, y);
			p.restoreShadow(ctx, cell);
			return this;
		};
		/**
Stamp helper function - perform a 'sinkInto' method draw
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.sinkInto = function(ctx, cell, x, y) {
			ctx.fillText(this.text, x, y);
			ctx.strokeText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.floatOver = function(ctx, cell, x, y) {
			ctx.strokeText(this.text, x, y);
			ctx.fillText(this.text, x, y);
			return this;
		};
		/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
		my.Text.prototype.clip = function(ctx, cell, x, y) {
			return this;
		};
		/**
Calculate metrics for each phrase, word or glyph in the glyphs array
@method getMetrics
@return This
@chainable
@private
**/
		my.Text.prototype.getMetrics = function() {
			var p = my.entity[this.phrase],
				myContext = my.context[my.pad[my.currentPad].current],
				myEngine = my.ctx[this.context],
				tempFont = myContext.font,
				tempBaseline = myContext.textBaseline,
				tempAlign = myContext.textAlign,
				myText,
				myTextWidth,
				tempText;
			myContext.font = myEngine.get('font');
			myContext.textBaseline = myEngine.get('textBaseline');
			myContext.textAlign = myEngine.get('textAlign');
			this.width = myContext.measureText(this.text).width / p.scale;
			this.height = p.size * p.lineHeight;
			if (p.path) {
				this.glyphs = [];
				this.glyphWidths = [];
				myText = this.text;
				if (this.textAlongPath === 'word') {
					tempText = this.text.split(' ');
					for (var i = 0, iz = tempText.length; i < iz; i++) {
						this.glyphs.push(tempText[i]);
						this.glyphWidths.push(myContext.measureText(tempText[i]).width);
						if (my.xt(tempText[i + 1])) {
							this.glyphs.push(' ');
							this.glyphWidths.push(myContext.measureText(' ').width);
						}
					}
				}
				else {
					myTextWidth = myContext.measureText(myText).width;
					if (this.fixedWidth) {
						for (var j = 0, jz = myText.length; j < jz; j++) {
							this.glyphs.push(myText[j]);
							this.glyphWidths.push(myTextWidth / jz);
						}
					}
					else {
						for (var k = 1, kz = myText.length; k <= kz; k++) {
							this.glyphs.push(myText[k - 1]);
							tempText = myText.substr(0, k - 1) + myText.substr(k);
							this.glyphWidths.push((myTextWidth - myContext.measureText(tempText).width));
						}
					}
				}
			}
			myContext.font = tempFont;
			myContext.textBaseline = tempBaseline;
			myContext.textAlign = tempAlign;
			return this;
		};

		return my;
	}(scrawl));
}
