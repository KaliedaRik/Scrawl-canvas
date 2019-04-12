/*
# Pattern factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import stylesMix from '../mixin/styles.js';

/*
## Pattern constructor
*/
const Pattern = function (items = {}) {

	this.stylesInit(items);
	return this;
};

/*
## Pattern object prototype setup
*/
let P = Pattern.prototype = Object.create(Object.prototype);

P.type = 'Pattern';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = stylesMix(P);

/*
## Define prototype functions
*/

/*

*/
P.buildStyle = function (cell = {}) {
	
	let gradient, engine,
		sx, sy, ex, ey;

	if (cell) {

		engine = cell.engine;

		if (engine) {

			sx = this.startX || 0;
			sy = this.startY || 0;
			ex = this.endX || 0;
			ey = this.endY || 0;

			gradient = engine.createLinearGradient(sx, sy, ex, ey);
			
			return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
		}
	}
	return 'rgba(0,0,0,0)';
};


// 		/**
// # Pattern

// ## Instantiation

// * scrawl.makePattern()

// ## Purpose

// * Defines a pattern
// * Used with entity.strokeStyle and entity.fillStyle attributes

// Note that a pattern image will always start at the entity's rotation/reflection (start vector) position, extending in all directions. To move a entity over a 'static' (cell-bound) pattern, more inventive solutions need to be found - for instance a combination of Picture entitys, dedicated cells and the 'source-in' globalCompositeOperation attribute.

// Patterns are not restricted to images. A pattern can also be sourced from another cell (canvas element) or even a video element.

// ## Access

// * scrawl.styles.PATTERNNAME - for the Pattern styles object

// @class Pattern
// @constructor
// @extends Base
// @param {Object} [items] Key:value Object argument for setting attributes
// **/
// 		my.Pattern = function(items) {
// 			var temp;
// 			if (my.isa(items, 'obj') && my.xt(items.url) && !my.xt(items.dynamic)) {
// 				items.dynamic = true;
// 				temp = my.makeImage(items);
// 				items.source = temp.name;
// 				return my.makePattern(items);
// 			}
// 			else {
// 				items = my.safeObject(items);
// 				my.Base.call(this, items);
// 				my.Base.prototype.set.call(this, items);
// 				this.repeat = items.repeat || 'repeat';
// 				this.sourceType = this.getSourceType();
// 				my.styles[this.name] = this;
// 				my.pushUnique(my.stylesnames, this.name);
// 				this.makeStyles();
// 			}
// 			return this;
// 		};
// 		my.Pattern.prototype = Object.create(my.Base.prototype);
// 		/**
// @property type
// @type String
// @default 'Pattern'
// @final
// **/
// 		my.Pattern.prototype.type = 'Pattern';
// 		my.Pattern.prototype.lib = 'styles';
// 		my.Pattern.prototype.libName = 'stylesnames';
// 		my.Pattern.prototype.defs = {
// 			/**
// Drawing parameter
// @property repeat
// @type String
// @default 'repeat'
// **/
// 			repeat: 'repeat',
// 			/**
// CELLNAME, VIDEONAME or IMAGENAME of Pattern source data
// @property source
// @type String
// @default ''
// **/
// 			source: '',
// 			/**
// Drawing flag - when set to true, force the pattern to update each drawing cycle - only required in the simplest scenes where fillStyle and strokeStyle do not change between entities
// @property autoUpdate
// @type Boolean
// @default false
// **/
// 			autoUpdate: false,
// 			/**
// Asynchronous loading of image file from the server - path/to/image file

// Used only with __scrawl.makePattern()__ and __Pattern.clone()__ operations. This attribute is not retained
// @property url
// @type String
// @default ''
// **/
// 			/**
// Asynchronous loading of image file from the server - function to run once image has successfully loaded

// Used only with __scrawl.makePattern()__ and __Pattern.clone()__ operations. This attribute is not retained
// @property callback
// @type Function
// @default undefined
// **/
// 			callback: false,
// 		};
// 		my.mergeInto(my.Pattern.prototype.defs, my.Base.prototype.defs);
// 		/**
// Constructor/set helper
// @method getSourceType
// @return String - one from: 'image', 'cell', 'video'; false on failure to identify source type
// **/
// 		my.Pattern.prototype.getSourceType = function() {
// 			var contains = my.contains,
// 				source = this.source;
// 			if (contains(my.imagenames, source)) {
// 				return 'image';
// 			}
// 			if (contains(my.cellnames, source)) {
// 				return 'cell';
// 			}
// 			if (contains(my.videonames, source)) {
// 				return 'video';
// 			}
// 			return false;
// 		};
// 		/**
// Augments Base.set()
// @method set
// @param {Object} items Object consisting of key:value attributes
// @return This
// @chainable
// **/
// 		my.Pattern.prototype.set = function(items) {
// 			my.Base.prototype.set.call(this, items);
// 			this.sourceType = this.getSourceType();
// 			this.makeStyles();
// 			return this;
// 		};
// 		/**
// Returns &lt;canvas&gt; element's contenxt engine's pattern object, or 'rgba(0,0,0,0)' on failure
// @method getData
// @return JavaScript pattern object, or String
// @private
// **/
// 		my.Pattern.prototype.getData = function(entity, cell) {
// 			if (!this.sourceType) {
// 				this.sourceType = this.getSourceType();
// 				this.makeStyles(entity, cell);
// 			}
// 			return (my.xt(my.sty[this.name])) ? my.sty[this.name] : 'rgba(0,0,0,0)';
// 		};
// 		/**
// Builds &lt;canvas&gt; element's contenxt engine's pattern object
// @method makeStyles
// @return This
// @chainable
// @private
// **/
// 		my.Pattern.prototype.makeStyles = function(entity, cell) {
// 			var temp,
// 				engine;
// 			cell = my.xtGet(cell, this.cell);
// 			engine = my.context[cell];
// 			if (my.xt(engine)) {
// 				switch (this.sourceType) {
// 					case 'video':
// 						if (my.xt(my.asset[this.source])) {
// 							temp = my.video[this.source].api;
// 							if (temp.readyState > 1) {
// 								my.sty[this.name] = engine.createPattern(my.asset[this.source], this.repeat);
// 							}
// 							else {
// 								my.sty[this.name] = undefined;
// 							}
// 						}
// 						break;
// 					case 'cell':
// 						if (my.xt(my.canvas[this.source])) {
// 							my.sty[this.name] = engine.createPattern(my.canvas[this.source], this.repeat);
// 						}
// 						break;
// 					case 'image':
// 						if (my.xt(my.asset[this.source])) {
// 							my.sty[this.name] = engine.createPattern(my.asset[this.source], this.repeat);
// 						}
// 						break;
// 				}
// 			}
// 			return this;
// 		};
// 		/**
// Remove this pattern from the scrawl-canvas library
// @method remove
// @return Always true
// **/
// 		my.Pattern.prototype.remove = function() {
// 			delete my.sty[this.name];
// 			delete my.styles[this.name];
// 			my.removeItem(my.stylesnames, this.name);
// 			return true;
// 		};
// 		/**
// Alias for Pattern.makeStyles()
// @method update
// @return This
// @chainable
// **/
// 		my.Pattern.prototype.update = function(entity, cell) {
// 			return this.makeStyles(entity, cell);
// 		};


/*
## Exported factory function
*/
const makePattern = function (items) {
	return new Pattern(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Pattern = Pattern;

export {
	makePattern,
};
