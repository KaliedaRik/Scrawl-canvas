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
# scrawlImages

## Purpose and features

The Images module adds support for displaying images on canvas elements

* Defines the EntityImage object, which wraps &lt;img&gt; and &lt;svg&gt; elements
* Adds functionality to load images into the Scrawl library dynamically (after the web page hads loaded)
* Defines the Picture entity, which can be used to display file images (including animated entity sheets), other &lt;canvas&gt; elements, and &lt;video&gt; elements (experimental)
* Defines the AnimSheet object, which in turn define and control action sequences from entity sheet images
* Defines the Pattern design, which uses images for entity fillStyle and strokeStyle attributes

@module scrawlImages
**/

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'images')) {
	var scrawl = (function(my, S) {
		'use strict';

		/**
    # window.scrawl

    scrawlImages module adaptions to the Scrawl library object

    ## New library sections

    * scrawl.image - for ScrawlImage objects
    * scrawl.img - linking to copies of DOM &lt;img&gt; elements - links to the original elements are stored in scrawl.object
    * scrawl.anim - for AnimSheet objects

    @class window.scrawl_Images
    **/

		/**
    A __factory__ function to generate new Pattern objects
    @method newPattern
    @param {Object} items Key:value Object argument for setting attributes
    @return Pattern object
    **/
		my.newPattern = function(items) {
			return new my.Pattern(items);
		};
		/**
    A __factory__ function to generate new Picture entitys
    @method newPicture
    @param {Object} items Key:value Object argument for setting attributes
    @return Picture entity object
    **/
		my.newPicture = function(items) {
			return new my.Picture(items);
		};

		/**
    A __factory__ function to convert a entity into a Picture entity

    Argument attributes can include any entity positioning and styling values, alongside the following flag:

    * __convert__ - when set to true, existing entity will be deleted; default: false

    If no name attribute is supplied in the argument object, the new Picture entity will be given the name: SPRITENAME+'_picture'
    @method Entity.convertToPicture
    @param {Object} items Key:value Object argument for setting attributes
    @return Picture entity object
    **/
		S.Entity_convertToPicture_image = null; //ImageData object
		S.Entity_convertToPicture_cell = null; //scrawl Cell object
		S.Entity_convertToPicture_engine = null; //DOM Canvas context object
		my.Entity.prototype.convertToPicture = function(items) {
			items = my.safeObject(items);
			S.Entity_convertToPicture_cell = my.cell[my.group[this.group].cell];
			S.Entity_convertToPicture_engine = my.context[my.group[this.group].cell];
			S.Entity_convertToPicture_image = my.prepareConvert(S.Entity_convertToPicture_cell, S.Entity_convertToPicture_engine, this);
			items.name = items.name || this.name + '_picture';
			items.group = items.group || this.group;
			if (items.convert) {
				my.deleteEntity([this.name]);
			}
			return my.doConvert(S.Entity_convertToPicture_image, items);
		};
		/**
    A __factory__ function to convert a group of entitys into a single Picture entity

    Argument attributes can include any entity positioning and styling values, alongside the following flag:

    * __convert__ - when set to true, existing entitys in the group will be deleted; default: false

    If no name attribute is supplied in the argument object, the new Picture entity will be given the name: GROUPNAME+'_entity'
    @method Group.convertGroupToPicture
    @param {Object} items Key:value Object argument for setting attributes
    @return Picture entity object; false if no entitys contained in group
    **/
		S.Group_convertGroupToPicture_image = null; //ImageData object
		S.Group_convertGroupToPicture_cell = null; //scrawl Cell object
		S.Group_convertGroupToPicture_engine = null; //DOM Canvas context object
		my.Group.prototype.convertGroupToPicture = function(items) {
			items = my.safeObject(items);
			if (this.entitys.length > 0) {
				S.Group_convertGroupToPicture_cell = my.cell[this.cell];
				S.Group_convertGroupToPicture_engine = my.context[this.cell];
				S.Group_convertGroupToPicture_image = my.prepareConvert(S.Group_convertGroupToPicture_cell, S.Group_convertGroupToPicture_engine, this);
				items.name = items.name || this.name + '_entity';
				items.group = items.group || this.name;
				if (items.convert) {
					my.deleteEntity(this.entitys);
				}
				return my.doConvert(S.Group_convertGroupToPicture_image, items);
			}
			return false;
		};
		/**
    Helper function for convert functions
    @method prepareConvert
    @return ImageData object
    @private
    **/
		S.prepareConvert_image = null; //ImageData object
		S.prepareConvert_data = null; //ImageData data array
		S.prepareConvert_left = 0;
		S.prepareConvert_right = 0;
		S.prepareConvert_top = 0;
		S.prepareConvert_bottom = 0;
		S.prepareConvert_pos = 0;
		S.prepareConvert_i = 0;
		S.prepareConvert_iz = 0;
		S.prepareConvert_j = 0;
		S.prepareConvert_jz = 0;
		my.prepareConvert = function(cell, ctx, obj) {
			S.prepareConvert_left = cell.actualWidth;
			S.prepareConvert_right = 0;
			S.prepareConvert_top = cell.actualHeight;
			S.prepareConvert_bottom = 0;
			cell.clear();
			obj.stamp(null, cell.name);
			S.prepareConvert_image = ctx.getImageData(0, 0, cell.actualWidth, cell.actualHeight);
			S.prepareConvert_data = S.prepareConvert_image.data;
			for (S.prepareConvert_i = 0, S.prepareConvert_iz = cell.actualHeight; S.prepareConvert_i < S.prepareConvert_iz; S.prepareConvert_i++) {
				for (S.prepareConvert_j = 0, S.prepareConvert_jz = cell.actualWidth; S.prepareConvert_j < S.prepareConvert_jz; S.prepareConvert_j++) {
					S.prepareConvert_pos = (((S.prepareConvert_i * cell.actualWidth) + S.prepareConvert_j) * 4) + 3;
					if (S.prepareConvert_data[S.prepareConvert_pos] > 0) {
						S.prepareConvert_top = (S.prepareConvert_top > S.prepareConvert_i) ? S.prepareConvert_i : S.prepareConvert_top;
						S.prepareConvert_bottom = (S.prepareConvert_bottom < S.prepareConvert_i) ? S.prepareConvert_i : S.prepareConvert_bottom;
						S.prepareConvert_left = (S.prepareConvert_left > S.prepareConvert_j) ? S.prepareConvert_j : S.prepareConvert_left;
						S.prepareConvert_right = (S.prepareConvert_right < S.prepareConvert_j) ? S.prepareConvert_j : S.prepareConvert_right;
					}
				}
			}
			S.prepareConvert_image = ctx.getImageData(S.prepareConvert_left, S.prepareConvert_top, (S.prepareConvert_right - S.prepareConvert_left + 1), (S.prepareConvert_bottom - S.prepareConvert_top + 1));
			cell.clear();
			return S.prepareConvert_image;
		};
		/**
    Helper function for convert functions
    @method doConvert
    @return Picture entity object
    @private
    **/
		my.doConvert = function(image, items) {
			my.imageCanvas.width = image.width;
			my.imageCanvas.height = image.height;
			my.imageCvx.putImageData(image, 0, 0);
			items.url = my.imageCanvas.toDataURL();
			items.width = image.width;
			items.height = image.height;
			image = new my.Image(items);
			return my.newPicture(items);
		};
		/**
    # Pattern

    ## Instantiation

    * scrawl.newPattern()

    ## Purpose

    * Defines a pattern
    * Used with entity.strokeStyle and entity.fillStyle attributes

    Note that a pattern image will always start at the entity's rotation/reflection (start vector) position, extending in all directions. To move a entity over a 'static' (cell-bound) pattern, more inventive solutions need to be found - for instance a combination of Picture entitys, dedicated cells and the 'source-in' globalCompositeOperation attribute.

    Patterns are not restricted to images. A pattern can also be sourced from another cell (canvas element) or even a video element.

    ## Access

    * scrawl.design.PATTERNNAME - for the Pattern design object

    @class Pattern
    @constructor
    @extends Base
    @param {Object} [items] Key:value Object argument for setting attributes
    **/
		S.Pattern_constructor_temp = '';
		my.Pattern = function(items) {
			if (my.isa(items, 'obj') && my.xt(items.url) && !my.xt(items.dynamic)) {
				items.dynamic = true;
				S.Pattern_constructor_temp = my.newImage(items);
				items.source = S.Pattern_constructor_temp.name;
				return my.newPattern(items);
			}
			else {
				items = my.safeObject(items);
				my.Base.call(this, items);
				my.Base.prototype.set.call(this, items);
				this.repeat = items.repeat || 'repeat';
				this.sourceType = this.getSourceType();
				my.design[this.name] = this;
				my.pushUnique(my.designnames, this.name);
				this.makeDesign();
			}
			return this;
		};
		my.Pattern.prototype = Object.create(my.Base.prototype);
		/**
    @property type
    @type String
    @default 'Pattern'
    @final
    **/
		my.Pattern.prototype.type = 'Pattern';
		my.Pattern.prototype.classname = 'designnames';
		my.d.Pattern = {
			/**
    Drawing parameter
    @property repeat
    @type String
    @default 'repeat'
    **/
			repeat: 'repeat',
			/**
    CELLNAME, VIDEONAME or IMAGENAME of Pattern source data
    @property source
    @type String
    @default ''
    **/
			source: '',
			/**
    Drawing flag - when set to true, force the pattern to update each drawing cycle - only required in the simplest scenes where fillStyle and strokeStyle do not change between entities
    @property autoUpdate
    @type Boolean
    @default false
    **/
			autoUpdate: false,
			/**
    Asynchronous loading of image file from the server - path/to/image file

    Used only with __scrawl.newPattern()__ and __Pattern.clone()__ operations. This attribute is not retained
    @property url
    @type String
    @default ''
    **/
			/**
    Asynchronous loading of image file from the server - function to run once image has successfully loaded

    Used only with __scrawl.newPattern()__ and __Pattern.clone()__ operations. This attribute is not retained
    @property callback
    @type Function
    @default undefined
    **/
			callback: false,
		};
		my.mergeInto(my.d.Pattern, my.d.Base);
		/**
    Constructor/set helper
    @method getSourceType
    @return String - one from: 'image', 'cell', 'video'; false on failure to identify source type
    **/
		my.Pattern.prototype.getSourceType = function() {
			if (my.contains(my.imagenames, this.source)) {
				return 'image';
			}
			if (my.contains(my.cellnames, this.source)) {
				return 'cell';
			}
			if (my.contains(my.videonames, this.source)) {
				return 'video';
			}
			return false;
		};
		/**
    Augments Base.set()
    @method set
    @param {Object} items Object consisting of key:value attributes
    @return This
    @chainable
    **/
		my.Pattern.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			this.sourceType = this.getSourceType();
			this.makeDesign();
			return this;
		};
		/**
    Returns &lt;canvas&gt; element's contenxt engine's pattern object, or 'rgba(0,0,0,0)' on failure
    @method getData
    @return JavaScript pattern object, or String
    @private
    **/
		my.Pattern.prototype.getData = function(entity, cell) {
			if (!this.sourceType) {
				this.sourceType = this.getSourceType();
				this.makeDesign(entity, cell);
			}
			return (my.xt(my.dsn[this.name])) ? my.dsn[this.name] : 'rgba(0,0,0,0)';
		};
		/**
    Builds &lt;canvas&gt; element's contenxt engine's pattern object
    @method makeDesign
    @return This
    @chainable
    @private
    **/
		S.Pattern_makeDesign_temp = null; //scrawl Video object
		S.Pattern_makeDesign_engine = null; //DOM Canvas context object
		my.Pattern.prototype.makeDesign = function(entity, cell) {
			cell = my.xtGet(cell, this.cell);
			S.Pattern_makeDesign_engine = my.context[cell];
			if (my.xt(S.Pattern_makeDesign_engine)) {
				switch (this.sourceType) {
					case 'video':
						if (scrawl.xt(my.asset[this.source])) {
							S.Pattern_makeDesign_temp = my.video[this.source].api;
							if (S.Pattern_makeDesign_temp.readyState > 1) {
								my.dsn[this.name] = S.Pattern_makeDesign_engine.createPattern(my.asset[this.source], this.repeat);
							}
							else {
								my.dsn[this.name] = undefined;
							}
						}
						break;
					case 'cell':
						if (scrawl.xt(my.canvas[this.source])) {
							my.dsn[this.name] = S.Pattern_makeDesign_engine.createPattern(my.canvas[this.source], this.repeat);
						}
						break;
					case 'image':
						if (scrawl.xt(my.asset[this.source])) {
							my.dsn[this.name] = S.Pattern_makeDesign_engine.createPattern(my.asset[this.source], this.repeat);
						}
						break;
				}
			}
			return this;
		};
		/**
    Remove this pattern from the scrawl library
    @method remove
    @return Always true
    **/
		my.Pattern.prototype.remove = function() {
			delete my.dsn[this.name];
			delete my.design[this.name];
			my.removeItem(my.designnames, this.name);
			return true;
		};
		/**
    Alias for Pattern.makeDesign()
    @method update
    @return This
    @chainable
    **/
		my.Pattern.prototype.update = function(entity, cell) {
			return this.makeDesign(entity, cell);
		};

		/**
    # Picture

    ## Instantiation

    * scrawl.newPicture()

    ## Purpose

    * Defines rectangular image-based objects for displaying on a Cell's canvas
    * Used to display both static and entity sheet image animations
    * Links to details of an image's data; can use image data (rgba data) during collision detection
    * Can handle video input (experimental)
    * Performs 'rect' and 'drawImage' drawing operations on canvases

    ## Access

    * scrawl.entity.PICTURENAME - for the Picture entity object

    @class Picture
    @constructor
    @extends Entity
    @uses AnimSheet
    @param {Object} [items] Key:value Object argument for setting attributes
    **/
		S.Picture_constructor_temp = null; //scrawl Image object
		S.Picture_constructor_tempV = null; //scrawl Vector object
		S.Picture_constructor_src = null; //DOM element object
		my.Picture = function(items) {
			//var temp, src;
			if (my.isa(items, 'obj') && my.xt(items.url) && !my.xt(items.dynamic)) {
				items.dynamic = true;
				S.Picture_constructor_temp = my.newImage(items);
				items.source = S.Picture_constructor_temp.name;
				return my.newPicture(items);
			}
			else {
				items = my.safeObject(items);
				if (my.xt(items.source)) {
					S.Picture_constructor_src = my.xtGet(my.image[items.source], my.video[items.source], my.cell[items.source], false);
					if (S.Picture_constructor_src) {
						my.Entity.call(this, items);
						S.Picture_constructor_tempV = my.safeObject(items.paste);
						this.start.x = my.xtGet(items.pasteX, S.Picture_constructor_tempV.x, this.start.x);
						this.start.y = my.xtGet(items.pasteY, S.Picture_constructor_tempV.y, this.start.y);
						this.copyWidth = my.xtGetTrue(items.copyWidth, S.Picture_constructor_src.actualWidth, S.Picture_constructor_src.width, '100%');
						this.copyHeight = my.xtGetTrue(items.copyHeight, S.Picture_constructor_src.actualHeight, S.Picture_constructor_src.height, '100%');
						this.width = my.xtGet(items.pasteWidth, items.width, this.copyWidth);
						this.height = my.xtGet(items.pasteHeight, items.height, this.copyHeight);
						my.Position.prototype.set.call(this, items);
						this.source = items.source;
						this.imageType = this.sourceImage();
						S.Picture_constructor_tempV = my.safeObject(items.copy);
						this.copy = my.newVector({
							x: my.xtGet(items.copyX, S.Picture_constructor_tempV.x, 0),
							y: my.xtGet(items.copyY, S.Picture_constructor_tempV.y, 0),
							name: this.type + '.' + this.name + '.copy'
						});
						this.work.copy = my.newVector({
							name: this.type + '.' + this.name + '.work.copy'
						});
						this.registerInLibrary();
						this.copyData = {};
						this.pasteData = {};
						this.setCopy();
						this.setPaste();
						return this;
					}
				}
			}
			return false;
		};
		my.Picture.prototype = Object.create(my.Entity.prototype);
		/**
@property type
@type String
@default 'Picture'
@final
**/
		my.Picture.prototype.type = 'Picture';
		my.Picture.prototype.classname = 'entitynames';
		my.d.Picture = {
			/**
SCRAWLIMAGE String - source image for this entity
@property source
@type String
@default ''
**/
			source: '',
			/**
IMAGEDATANAME String - name of the Image Data object

Calculated automatically by Scrawl following a .getImageData() call
@property imageData
@type String
@default ''
**/
			imageData: '',
			/**
Collision attribute - name of channel to be checked against during collision detection

Permitted values: 'red', 'blue', 'green', 'alpha'
@property imageDataChannel
@type String
@default 'alpha'
**/
			imageDataChannel: 'alpha',
			/**
SPRITEANIMATIONNAME String - Entity sheet image linked to this entity
@property animSheet
@type String
@default ;;
**/
			animation: '',
			/**
Identifier String - permitted values include: 'animation', 'canvas', 'img'

Detected automatically by scrawl during entity construction
@property imageType
@type String
@default ''
@private
**/
			imageType: '',
			/**
Collision flag - when true, Picture entity will use imageData to determine whether a collision has occured; when false, a simpler box collision system is used
@property checkHitUsingImageData
@type Boolean
@default false
**/
			checkHitUsingImageData: false,
			/**
The coordinate Vector representing the Picture's copy source position on its source;

Picture supports the following 'virtual' attributes for this attribute:

* __copyX__ - (Number) the x coordinate on the source
* __copyY__ - (Number) the y coordinate on the sourcecopy

@property copy
@type Vector
**/
			copy: false,
			/**
Copy width, in pixels. Determines which portion of this Picture's source will be copied
@property copyWidth
@type Number
@default 300
**/
			copyWidth: 300,
			/**
Copy height, in pixels. Determines which portion of this Picture's source will be copied
@property copyHeight
@type Number
@default 150
**/
			copyHeight: 150,
			/**
Local source data
@property copyData
@type Object
@default false
@private
**/
			copyData: false,
			/**
Local target data
@property pasteData
@type Object
@default false
@private
**/
			pasteData: false,
			/**
Asynchronous loading of image file from the server - path/to/image file

Used only with __scrawl.newPicture()__ and __Picture.clone()__ operations. This attribute is not retained
@property url
@type String
@default ''
**/
			/**
Asynchronous loading of image file from the server - function to run once image has successfully loaded

Used only with __scrawl.newPicture()__ and __Picture.clone()__ operations. This attribute is not retained
@property callback
@type Function
@default undefined
**/
			callback: false,
		};
		my.mergeInto(my.d.Picture, my.d.Entity);
		/**
Augments Entity.get()
@method get
@param {String} item Attribute to be retrieved
@return Attribute value
**/
		my.Picture.prototype.get = function(item) {
			if (my.contains(my.animKeys, item)) {
				return my.spriteanimation[this.animation].get(item);
			}
			else {
				return my.Entity.prototype.get.call(this, item);
			}
		};
		/**
Augments Entity.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		S.Picture_set_temp = null; //scrawl Vector object
		my.Picture.prototype.set = function(items) {
			my.Entity.prototype.set.call(this, items);
			if (my.xto(items.paste, items.pasteX, items.pasteY)) {
				S.Picture_set_temp = my.safeObject(items.paste);
				this.start.x = my.xtGet(items.pasteX, S.Picture_set_temp.x, this.start.x);
				this.start.y = my.xtGet(items.pasteY, S.Picture_set_temp.y, this.start.y);
			}
			if (my.xt(items.pasteWidth)) {
				this.width = my.xtGet(items.pasteWidth, this.width);
			}
			if (my.xt(items.pasteHeight)) {
				this.height = my.xtGet(items.pasteHeight, this.height);
			}
			if (my.xto(items.copy, items.copyX, items.copyY)) {
				S.Picture_set_temp = my.safeObject(items.copy);
				this.copy.x = my.xtGet(items.copyX, S.Picture_set_temp.x, this.copy.x);
				this.copy.y = my.xtGet(items.copyY, S.Picture_set_temp.y, this.copy.y);
			}
			if (my.xt(items.copyWidth)) {
				this.copyWidth = my.xtGet(items.copyWidth, this.copyWidth);
			}
			if (my.xt(items.copyHeight)) {
				this.copyHeight = my.xtGet(items.copyHeight, this.copyHeight);
			}
			if (my.xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale)) {
				this.setPaste();
			}
			if (my.xto(items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height)) {
				this.setCopy();
			}
			if (my.xt(this.animation)) {
				my.spriteanimation[this.animation].set(items);
			}
			return this;
		};
		/**
Augments Entity.setDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		S.Picture_setDelta_temp = null; //scrawl Vector object
		S.Picture_setDelta_x = 0;
		S.Picture_setDelta_y = 0;
		S.Picture_setDelta_w = 0;
		S.Picture_setDelta_h = 0;
		my.Picture.prototype.setDelta = function(items) {
			my.Entity.prototype.setDelta.call(this, items);
			items = my.safeObject(items);
			if (my.xto(items.paste, items.pasteX, items.pasteY)) {
				S.Picture_setDelta_temp = my.safeObject(items.paste);
				S.Picture_setDelta_x = my.xtGet(items.pasteX, S.Picture_setDelta_temp.x, 0);
				S.Picture_setDelta_y = my.xtGet(items.pasteY, S.Picture_setDelta_temp.y, 0);
				this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + S.Picture_setDelta_x : my.addPercentages(this.start.x, S.Picture_setDelta_x);
				this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + S.Picture_setDelta_y : my.addPercentages(this.start.y, S.Picture_setDelta_y);
			}
			if (my.xto(items.pasteWidth, items.width)) {
				S.Picture_setDelta_w = my.xtGet(items.pasteWidth, items.width);
				this.width = (my.isa(this.width, 'num')) ? this.width + S.Picture_setDelta_w : my.addPercentages(this.width, S.Picture_setDelta_w);
			}
			if (my.xto(items.pasteHeight, items.height)) {
				S.Picture_setDelta_h = my.xtGet(items.pasteHeight, items.height);
				this.height = (my.isa(this.height, 'num')) ? this.height + S.Picture_setDelta_h : my.addPercentages(this.height, S.Picture_setDelta_h);
			}
			if (my.xto(items.copy, items.copyX, items.copyY)) {
				S.Picture_setDelta_temp = my.safeObject(items.copy);
				S.Picture_setDelta_x = my.xtGet(items.copyX, S.Picture_setDelta_temp.x, 0);
				S.Picture_setDelta_y = my.xtGet(items.copyY, S.Picture_setDelta_temp.y, 0);
				this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x + S.Picture_setDelta_x : my.addPercentages(this.copy.x, S.Picture_setDelta_x);
				this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y + S.Picture_setDelta_y : my.addPercentages(this.copy.y, S.Picture_setDelta_y);
			}
			if (my.xto(items.copyWidth, items.width)) {
				S.Picture_setDelta_w = my.xtGet(items.copyWidth, items.width);
				this.copyWidth = (my.isa(this.copyWidth, 'num')) ? this.copyWidth + S.Picture_setDelta_w : my.addPercentages(this.copyWidth, S.Picture_setDelta_w);
			}
			if (my.xto(items.copyHeight, items.height)) {
				S.Picture_setDelta_h = my.xtGet(items.copyHeight, items.height);
				this.copyHeight = (my.isa(this.copyHeight, 'num')) ? this.copyHeight + S.Picture_setDelta_h : my.addPercentages(this.copyHeight, S.Picture_setDelta_h);
			}
			if (my.xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale)) {
				this.setPaste();
			}
			if (my.xto(items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height)) {
				this.setCopy();
			}
			return this;
		};
		/**
Picture.setCopy update copyData object values
@method setSource
@chainable
@private
**/
		S.Picture_setCopy_w = 0;
		S.Picture_setCopy_h = 0;
		my.Picture.prototype.setCopy = function() {
			switch (this.imageType) {
				case 'canvas':
					S.Picture_setCopy_w = my.cell[this.source].actualWidth;
					S.Picture_setCopy_h = my.cell[this.source].actualHeight;
					break;
				case 'video':
					S.Picture_setCopy_w = my.video[this.source].width;
					S.Picture_setCopy_h = my.video[this.source].height;
					break;
				case 'img':
					S.Picture_setCopy_w = my.image[this.source].width;
					S.Picture_setCopy_h = my.image[this.source].height;
					break;
				default:
					//do nothing for animations
			}
			if (this.imageType !== 'animation') {
				this.copyData.x = (my.isa(this.copy.x, 'str')) ? this.convertX(this.copy.x, S.Picture_setCopy_w) : this.copy.x;
				this.copyData.y = (my.isa(this.copy.y, 'str')) ? this.convertY(this.copy.y, S.Picture_setCopy_h) : this.copy.y;
				if (!my.isBetween(this.copyData.x, 0, S.Picture_setCopy_w - 1, true)) {
					this.copyData.x = (this.copyData.x < 0) ? 0 : S.Picture_setCopy_w - 1;
				}
				if (!my.isBetween(this.copyData.y, 0, S.Picture_setCopy_h - 1, true)) {
					this.copyData.y = (this.copyData.y < 0) ? 0 : S.Picture_setCopy_h - 1;
				}
				this.copyData.w = (my.isa(this.copyWidth, 'str')) ? this.convertX(this.copyWidth, S.Picture_setCopy_w) : this.copyWidth;
				this.copyData.h = (my.isa(this.copyHeight, 'str')) ? this.convertY(this.copyHeight, S.Picture_setCopy_h) : this.copyHeight;
				if (!my.isBetween(this.copyData.w, 1, S.Picture_setCopy_w, true)) {
					this.copyData.w = (this.copyData.w < 1) ? 1 : S.Picture_setCopy_w;
				}
				if (!my.isBetween(this.copyData.h, 1, S.Picture_setCopy_h, true)) {
					this.copyData.h = (this.copyData.h < 1) ? 1 : S.Picture_setCopy_h;
				}
				if (this.copyData.x + this.copyData.w > S.Picture_setCopy_w) {
					this.copyData.x = S.Picture_setCopy_w - this.copyData.w;
				}
				if (this.copyData.y + this.copyData.h > S.Picture_setCopy_h) {
					this.copyData.y = S.Picture_setCopy_h - this.copyData.h;
				}
			}
			this.imageData = false;
			return this;
		};
		/**
Picture.setPaste update pasteData object values
@method setPaste
@chainable
@private
**/
		S.Picture_setPaste_cell = null; //scrawl Cell object
		my.Picture.prototype.setPaste = function() {
			S.Picture_setPaste_cell = my.cell[my.group[this.group].cell];
			this.pasteData.x = (my.isa(this.start.x, 'str')) ? this.convertX(this.start.x, S.Picture_setPaste_cell.actualWidth) : this.start.x;
			this.pasteData.y = (my.isa(this.start.y, 'str')) ? this.convertY(this.start.y, S.Picture_setPaste_cell.actualHeight) : this.start.y;
			this.pasteData.w = (my.isa(this.width, 'str')) ? this.convertX(this.width, S.Picture_setPaste_cell.actualWidth) : this.width;
			this.pasteData.h = (my.isa(this.height, 'str')) ? this.convertY(this.height, S.Picture_setPaste_cell.actualHeight) : this.height;
			this.pasteData.w *= this.scale;
			this.pasteData.h *= this.scale;
			if (this.pasteData.w < 1) {
				this.pasteData.w = 1;
			}
			if (this.pasteData.h < 1) {
				this.pasteData.h = 1;
			}
			return this;
		};
		/**
    Augments Entity.clone()
    @method clone
    @param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
    @return Cloned object
    @chainable
    **/
		S.Picture_clone_a = null; //raw object
		my.Picture.prototype.clone = function(items) {
			S.Picture_clone_a = my.Entity.prototype.clone.call(this, items);
			items = my.safeObject(items);
			if (!items.keepCopyDimensions) {
				S.Picture_clone_a.fitToImageSize();
			}
			return S.Picture_clone_a;
		};
		/**
    Clone helper function
    @method fitToImageSize
    @return This
    @chainable
    @private
    **/
		S.Picture_fitToImageSize_img = null; //scrawl Image object
		my.Picture.prototype.fitToImageSize = function() {
			if (this.imageType === 'img') {
				S.Picture_fitToImageSize_img = my.image[this.source];
				this.set({
					copyWidth: S.Picture_fitToImageSize_img.get('width'),
					copyHeight: S.Picture_fitToImageSize_img.get('height'),
					copyX: 0,
					copyY: 0,
				});
			}
			return this;
		};
		/**
    Constructor and clone helper function
    @method sourceImage
    @return Correct imageType attribute value for this entity
    @private
    **/
		my.Picture.prototype.sourceImage = function() {
			if (my.contains(my.videonames, this.source)) {
				return 'video';
			}
			if (my.contains(my.imagenames, this.source)) {
				if (my.contains(my.spriteanimationnames, this.animation)) {
					return 'animation';
				}
				return 'img';
			}
			if (my.contains(my.cellnames, this.source)) {
				return 'canvas';
			}

			return false;
		};
		/**
    Stamp helper function - perform a 'clip' method draw
    @method clip
    @param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
    @param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
    @return This
    @chainable
    @private
    **/
		S.Picture_stamp_here = null; //scrawl Vector object
		S.Picture_stamp_data = null; //ImageData object
		my.Picture.prototype.clip = function(ctx, cell) {
			S.Picture_stamp_here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.beginPath();
			ctx.rect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
			ctx.clip();
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
		my.Picture.prototype.none = function(ctx, cell) {
			this.prepareStamp();
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
		my.Picture.prototype.clear = function(ctx, cell) {
			S.Picture_stamp_here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.clearRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
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
		my.Picture.prototype.clearWithBackground = function(ctx, cell) {
			S.Picture_stamp_here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.fillStyle = my.cell[cell].backgroundColor;
			ctx.strokeStyle = my.cell[cell].backgroundColor;
			ctx.globalAlpha = 1;
			ctx.strokeRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
			ctx.fillRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
			ctx.fillStyle = my.ctx[cell].fillStyle;
			ctx.strokeStyle = my.ctx[cell].strokeStyle;
			ctx.globalAlpha = my.ctx[cell].globalAlpha;
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
		my.Picture.prototype.draw = function(ctx, cell) {
			S.Picture_stamp_here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			my.cell[cell].setEngine(this);
			ctx.strokeRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
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
		my.Picture.prototype.fill = function(ctx, cell) {
			S.Picture_stamp_data = this.getImage();
			if (S.Picture_stamp_data) {
				S.Picture_stamp_here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				if (this.copyData.w > 0 && this.copyData.h > 0) {
					ctx.drawImage(S.Picture_stamp_data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
				}
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
		my.Picture.prototype.drawFill = function(ctx, cell) {
			S.Picture_stamp_data = this.getImage();
			if (S.Picture_stamp_data) {
				S.Picture_stamp_here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.strokeRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
				this.clearShadow(ctx, cell);
				if (this.copyData.w > 0 && this.copyData.h > 0) {
					ctx.drawImage(S.Picture_stamp_data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
				}
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
		my.Picture.prototype.fillDraw = function(ctx, cell) {
			S.Picture_stamp_data = this.getImage();
			if (S.Picture_stamp_data) {
				S.Picture_stamp_here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				if (this.copyData.w > 0 && this.copyData.h > 0) {
					ctx.drawImage(S.Picture_stamp_data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
				}
				this.clearShadow(ctx, cell);
				ctx.strokeRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
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
		my.Picture.prototype.sinkInto = function(ctx, cell) {
			S.Picture_stamp_data = this.getImage();
			if (S.Picture_stamp_data) {
				S.Picture_stamp_here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				if (this.copyData.w > 0 && this.copyData.h > 0) {
					ctx.drawImage(S.Picture_stamp_data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
				}
				ctx.strokeRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
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
		my.Picture.prototype.floatOver = function(ctx, cell) {
			S.Picture_stamp_data = this.getImage();
			if (S.Picture_stamp_data) {
				S.Picture_stamp_here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.strokeRect(S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
				if (this.copyData.w > 0 && this.copyData.h > 0) {
					ctx.drawImage(S.Picture_stamp_data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, S.Picture_stamp_here.x, S.Picture_stamp_here.y, this.pasteData.w, this.pasteData.h);
				}
			}
			return this;
		};

		/**
    Display helper function - retrieve copy attributes for ScrawlImage, taking into account the current frame for entity sheet images

    Also generates new filtered images, when necessary
    @method getImage
    @return Image Object
    @private
    **/
		S.Picture_getImage_anim = null; //raw object
		S.Picture_getImage_result = null; //DOM element object
		my.Picture.prototype.getImage = function() {
			switch (this.imageType) {
				case 'animation':
					S.Picture_getImage_anim = my.spriteanimation[this.animation].getData();
					this.copyData.x = S.Picture_getImage_anim.x;
					this.copyData.y = S.Picture_getImage_anim.y;
					this.copyData.w = S.Picture_getImage_anim.w;
					this.copyData.h = S.Picture_getImage_anim.h;
					S.Picture_getImage_result = my.asset[this.source];
					break;
				case 'canvas':
					S.Picture_getImage_result = my.canvas[this.source];
					break;
				case 'video':
					S.Picture_getImage_result = my.asset[this.source];
					break;
				case 'img':
					S.Picture_getImage_result = my.asset[this.source];
					break;
				default:
					S.Picture_getImage_result = false;
			}
			return S.Picture_getImage_result;
		};
		/**
    Load the Picture entity's image data (via JavaScript getImageData() function) into the scrawl library
    @method getImageData
    @param {String} [label] IMAGEDATANAME - default: PICTURENAME_data
    @return This
    @chainable
    **/
		S.Picture_getImageData_data = null; //DOM element object
		my.Picture.prototype.getImageData = function(label) {
			label = (my.xt(label)) ? label : 'data';
			S.Picture_getImageData_data = this.getImage();
			if (S.Picture_getImageData_data) {
				my.imageCanvas.width = this.copyData.w;
				my.imageCanvas.height = this.copyData.h;
				my.imageCvx.drawImage(S.Picture_getImageData_data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, 0, 0, this.copyData.w, this.copyData.h);
				this.imageData = this.name + '_' + label;
				my.imageData[this.imageData] = my.imageCvx.getImageData(0, 0, this.copyData.w, this.copyData.h);
			}
			return this;
		};
		/**
    Get the pixel color or channel data from Picture object's image at given coordinate

    Argument needs to have __x__ and __y__ data (pixel coordinates) and, optionally, a __channel__ string - 'red', 'blue', 'green', 'alpha' (default), 'color'
    @method getImageDataValue
    @param {Object} items Coordinate Vector or Object
    @return Color value at coordinate; false if no color found
    **/
		S.Picture_getImageDataValue_data = null; //ImageData object
		S.Picture_getImageDataValue_array = null; //ImageData data array
		S.Picture_getImageDataValue_index = 0;
		my.Picture.prototype.getImageDataValue = function(items) {
			items = my.safeObject(items);
			my.workimg.v1.x = items.x || 0;
			my.workimg.v1.y = items.y || 0;
			my.workimg.v1.vectorSubtract(this.pasteData).rotate(-this.roll);
			my.workimg.v1.x = (this.flipReverse) ? -my.workimg.v1.x : my.workimg.v1.x;
			my.workimg.v1.y = (this.flipUpend) ? -my.workimg.v1.y : my.workimg.v1.y;
			my.workimg.v1.vectorSubtract(this.getPivotOffsetVector(this.handle));
			my.workimg.v1.x = Math.round(my.workimg.v1.x * (this.copyData.w / this.pasteData.w));
			my.workimg.v1.y = Math.round(my.workimg.v1.y * (this.copyData.h / this.pasteData.h));
			if (!this.imageData) {
				this.getImageData();
			}
			S.Picture_getImageDataValue_data = my.imageData[this.imageData];
			S.Picture_getImageDataValue_index = ((my.workimg.v1.y * S.Picture_getImageDataValue_data.width) + my.workimg.v1.x) * 4;
			if (my.isBetween(my.workimg.v1.x, 0, S.Picture_getImageDataValue_data.width - 1, true) && my.isBetween(my.workimg.v1.y, 0, S.Picture_getImageDataValue_data.height - 1, true)) {
				S.Picture_getImageDataValue_array = S.Picture_getImageDataValue_data.data;
				switch (items.channel || this.get('imageDataChannel')) {
					case 'red':
						return (my.xt(S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index])) ? S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index] : false;
					case 'green':
						return (my.xt(S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 1])) ? S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 1] : false;
					case 'blue':
						return (my.xt(S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 2])) ? S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 2] : false;
					case 'color':
						return (my.xta([S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index], S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 1], S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 2], S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 3]])) ? 'rgba(' + S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index] + ',' + S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 1] + ',' + S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 2] + ',' + S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 3] + ')' : false;
					default: // alpha
						return (my.xt(S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 3])) ? S.Picture_getImageDataValue_array[S.Picture_getImageDataValue_index + 3] : false;
				}
			}
			return false;
		};
		/**
    Check Cell coordinates to see if any of them fall within this entity's path - uses JavaScript's _isPointInPath_ function

    Argument object contains the following attributes:

    * __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
    * __x__ - X coordinate
    * __y__ - Y coordinate

    Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values
    @method checkHit
    @param {Object} items Argument object
    @return The first coordinate to fall within the entity's path; false if none fall within the path
    **/
		S.Picture_checkHit_tests = [];
		S.Picture_checkHit_hit = [];
		S.Picture_checkHit_testBar = 0;
		S.Picture_checkHit_colorResult = '';
		S.Picture_checkHit_result = null; //mixed
		S.Picture_checkHit_i = 0;
		S.Picture_checkHit_iz = 0;
		S.Picture_checkHit_arg = {
			tests: []
		};
		my.Picture.prototype.checkHit = function(items) {
			items = my.safeObject(items);
			if (my.xt(items.tests)) {
				S.Picture_checkHit_tests = items.tests;
			}
			else {
				S.Picture_checkHit_tests.length = 0;
				S.Picture_checkHit_tests.push(items.x || 0);
				S.Picture_checkHit_tests.push(items.y || 0);
			}
			S.Picture_checkHit_testBar = (my.isa(items.test, 'num')) ? items.test : 0;
			for (S.Picture_checkHit_i = 0, S.Picture_checkHit_iz = S.Picture_checkHit_tests.length; S.Picture_checkHit_i < S.Picture_checkHit_iz; S.Picture_checkHit_i += 2) {
				S.Picture_checkHit_result = null;
				S.Picture_checkHit_arg.tests.length = 0;
				S.Picture_checkHit_arg.tests.push(S.Picture_checkHit_tests[S.Picture_checkHit_i]);
				S.Picture_checkHit_arg.tests.push(S.Picture_checkHit_tests[S.Picture_checkHit_i + 1]);
				S.Picture_checkHit_hit = my.Entity.prototype.checkHit.call(this, S.Picture_checkHit_arg);
				if (this.checkHitUsingImageData) {
					if (S.Picture_checkHit_hit) {
						S.Picture_checkHit_hit.x = Math.floor(S.Picture_checkHit_hit.x);
						S.Picture_checkHit_hit.y = Math.floor(S.Picture_checkHit_hit.y);
						if (this.animation) {
							this.imageData = false;
						}
						S.Picture_checkHit_colorResult = this.getImageDataValue(S.Picture_checkHit_hit);
						if (this.get('imageDataChannel') === 'color') {
							S.Picture_checkHit_result = (S.Picture_checkHit_colorResult === 'rgba(0,0,0,0)') ? false : S.Picture_checkHit_hit;
						}
						else {
							S.Picture_checkHit_result = (S.Picture_checkHit_colorResult > S.Picture_checkHit_testBar) ? S.Picture_checkHit_hit : false;
						}
					}
				}
				else {
					S.Picture_checkHit_result = S.Picture_checkHit_hit;
				}
				if (S.Picture_checkHit_result) {
					break;
				}
			}
			return (S.Picture_checkHit_result) ? S.Picture_checkHit_result : false;
		};
		/**
Revert pickupEntity() actions, ensuring entity is left where the user drops it
@method dropEntity
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
		my.Picture.prototype.dropEntity = function(item) {
			my.Entity.prototype.dropEntity.call(this, item);
			this.setPaste();
			return this;
		};


		return my;
	}(scrawl, scrawlVars));
}
