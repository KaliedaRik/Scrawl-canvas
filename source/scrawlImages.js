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
	var scrawl = (function(my) {
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
		my.Entity.prototype.convertToPicture = function(items) {
			items = my.safeObject(items);
			var image,
				cell,
				ctx;
			cell = my.cell[my.group[this.group].cell];
			ctx = my.context[my.group[this.group].cell];
			image = my.prepareConvert(cell, ctx, this);
			items.name = items.name || this.name + '_picture';
			items.group = items.group || this.group;
			if (items.convert) {
				my.deleteEntity([this.name]);
			}
			return my.doConvert(image, items);
		};
		/**
    A __factory__ function to convert a group of entitys into a single Picture entity

    Argument attributes can include any entity positioning and styling values, alongside the following flag:

    * __convert__ - when set to true, existing entitys in the group will be deleted; default: false

    If no name attribute is supplied in the argument object, the new Picture entity will be given the name: GROUPNAME+'_entity'
    @method Group.convertToEntity
    @param {Object} items Key:value Object argument for setting attributes
    @return Picture entity object; false if no entitys contained in group
    **/
		my.Group.prototype.convertToEntity = function(items) {
			items = my.safeObject(items);
			var image,
				cell,
				ctx;
			if (this.entitys.length > 0) {
				cell = my.cell[this.cell];
				ctx = my.context[this.cell];
				image = my.prepareConvert(cell, ctx, this);
				items.name = items.name || this.name + '_entity';
				items.group = items.group || this.name;
				if (items.convert) {
					my.deleteEntity(this.entitys);
				}
				return my.doConvert(image, items);
			}
			return false;
		};
		/**
    Helper function for convert functions
    @method prepareConvert
    @return ImageData object
    @private
    **/
		my.prepareConvert = function(cell, ctx, obj) {
			var left = cell.actualWidth,
				right = 0,
				top = cell.actualHeight,
				bottom = 0,
				image,
				data,
				pos;
			cell.clear();
			obj.stamp();
			image = ctx.getImageData(0, 0, cell.actualWidth, cell.actualHeight);
			data = image.data;
			for (var i = 0, iz = cell.actualHeight; i < iz; i++) {
				for (var j = 0, jz = cell.actualWidth; j < jz; j++) {
					pos = (((i * cell.actualWidth) + j) * 4) + 3;
					if (data[pos] > 0) {
						top = (top > i) ? i : top;
						bottom = (bottom < i) ? i : bottom;
						left = (left > j) ? j : left;
						right = (right < j) ? j : right;
					}
				}
			}
			image = ctx.getImageData(left, top, (right - left + 1), (bottom - top + 1));
			cell.clear();
			return image;
		};
		/**
    Helper function for convert functions
    @method doConvert
    @return Picture entity object
    @private
    **/
		my.doConvert = function(image, items) {
			my.cv.width = image.width;
			my.cv.height = image.height;
			my.cvx.putImageData(image, 0, 0);
			items.element = my.cv.toDataURL();
			items.width = image.width;
			items.height = image.height;
			image = new my.ScrawlImage(items);
			items.source = image.name;
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
		my.Pattern = function(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			my.Base.prototype.set.call(this, items);
			this.repeat = items.repeat || 'repeat';
			this.cell = items.cell || my.pad[my.currentPad].current;
			this.setImage((items.source || items.imageData || my.image[items.image] || my.cell[items.canvas] || false), items.callback);
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
    CELLNAME String of &lt;canvas&gt; element context engine on which the gradient has been set
    @property cell
    @type String
    @default ''
    **/
			cell: '',
			/**
    SCRAWLIMAGENAME String - used when pattern is based on an image already imported into the scrawl library
    @property image
    @type String
    @default ''
    **/
			image: '',
			/**
    Full path to image file on server - used when pattern is based on a dynamically loaded image
    @property source
    @type String
    @default ''
    **/
			source: '',
			/**
    CELLNAME String - used when pattern is based on a &lt;canvas&gt; element's image
    @property canvas
    @type String
    @default ''
    **/
			canvas: '',
		};
		my.mergeInto(my.d.Pattern, my.d.Base);
		/**
    Augments Base.set()
    @method set
    @param {Object} items Object consisting of key:value attributes
    @return This
    @chainable
    **/
		my.Pattern.prototype.set = function(items) {
			my.Base.prototype.set.call(this, items);
			this.setImage();
			return this;
		};
		/**
    Discover this Pattern's image source, loading it if necessary
    @method setImage
    @param {Mixed} source
    @param {Function} [callback] Function to be run once Image is successfully loaded
    @return This
    @chainable
    @private
    **/
		my.Pattern.prototype.setImage = function(source, callback) {
			if (my.isa(source, 'str')) {
				var myImage = new Image();
				var that = this;
				myImage.id = this.name;
				myImage.onload = function(callback) {
					try {
						var iObj = my.newImage({
							name: that.name,
							element: myImage,
						});
						my.design[that.name] = that;
						my.design[that.name].image = iObj.name;
						my.design[that.name].source = myImage.src;
						my.pushUnique(my.designnames, that.name);
						my.design[that.name].makeDesign();
						if (my.isa(callback, 'fn')) {
							callback();
						}
					}
					catch (e) {
						console.log('Pattern ' + [that.name] + ' - setImage() #1 failed - ' + e.name + ' error: ' + e.message);
						return that;
					}
				};
				myImage.src = source;
			}
			else if (my.isa(source, 'obj')) {
				if (source.type === 'ScrawlImage') {
					try {
						this.image = source.name;
						my.design[this.name] = this;
						my.pushUnique(my.designnames, this.name);
						this.makeDesign();
						if (my.isa(callback, 'fn')) {
							callback();
						}
					}
					catch (e) {
						console.log('Pattern ' + [this.name] + ' - setImage() #2 failed - ' + e.name + ' error: ' + e.message);
						return that;
					}
				}
				else if (source.type === 'Cell') {
					try {
						this.canvas = source.name;
						my.design[this.name] = this;
						my.pushUnique(my.designnames, this.name);
						this.makeDesign();
						if (my.isa(callback, 'fn')) {
							callback();
						}
					}
					catch (e) {
						console.log('Pattern ' + [this.name] + ' - setImage() #3 failed - ' + e.name + ' error: ' + e.message);
						return that;
					}
				}
			}
			else {
				console.log('Pattern ' + [this.name] + ' - setImage() #4 failed - source not a string or an object', source);
			}
			return this;
		};
		/**
    Returns &lt;canvas&gt; element's contenxt engine's pattern object, or 'rgba(0,0,0,0)' on failure
    @method getData
    @return JavaScript pattern object, or String
    @private
    **/
		my.Pattern.prototype.getData = function() {
			return (my.xt(my.dsn[this.name])) ? my.dsn[this.name] : 'rgba(0,0,0,0)';
		};
		/**
    Builds &lt;canvas&gt; element's contenxt engine's pattern object
    @method makeDesign
    @return This
    @chainable
    @private
    **/
		my.Pattern.prototype.makeDesign = function() {
			var ctx = my.context[this.cell],
				img = (my.xt(my.img[this.image])) ? my.img[this.image] : my.object[this.image];
			if (this.image) {
				if (img) {
					my.dsn[this.name] = ctx.createPattern(img, this.repeat);
				}
			}
			else if (this.canvas) {
				my.dsn[this.name] = ctx.createPattern(my.canvas[this.canvas], this.repeat);
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
		my.Pattern.prototype.update = function() {
			this.makeDesign();
			return this;
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
		my.Picture = function(items) {
			var temp, src;
			if (my.isa(items, 'obj') && my.xt(items.url)) {
				console.log('picture loading dynamically');
				return this.importImage(items);
			}
			else {
				items = my.safeObject(items);
				if (my.xt(items.source)) {
					src = my.xtGet([my.image[items.source], my.video[items.source], my.cell[items.source], false]);
					if (src) {
						my.Entity.call(this, items);
						temp = my.safeObject(items.paste);
						this.start.x = my.xtGet([items.pasteX, temp.x, this.start.x]);
						this.start.y = my.xtGet([items.pasteY, temp.y, this.start.y]);
						this.copyWidth = my.xtGet([items.copyWidth, items.width, src.actualWidth, src.width, 0]);
						this.copyHeight = my.xtGet([items.copyHeight, items.height, src.actualHeight, src.height, 0]);
						this.width = my.xtGet([items.pasteWidth, items.width, this.copyWidth]);
						this.height = my.xtGet([items.pasteHeight, items.height, this.copyHeight]);
						my.Position.prototype.set.call(this, items);
						this.source = items.source;
						this.imageType = this.sourceImage();
						temp = my.safeObject(items.copy);
						this.copy = my.newVector({
							x: my.xtGet([items.copyX, temp.x, 0]),
							y: my.xtGet([items.copyY, temp.y, 0]),
							name: this.type + '.' + this.name + '.copy'
						});
						this.work.copy = my.newVector({
							name: this.type + '.' + this.name + '.work.copy'
						});
						this.copyData = {};
						this.pasteData = {};
						this.setCopy();
						this.setPaste();
						this.registerInLibrary();
						my.pushUnique(my.group[this.group].entitys, this.name);
						if (my.isa(items.callback, 'fn')) {
							items.callback();
						}
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
    ANIMSHEET String - Entity sheet image linked to this entity
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
				return my.anim[this.animSheet].get(item);
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
		my.Picture.prototype.set = function(items) {
			var temp;
			my.Entity.prototype.set.call(this, items);
			if (my.xto([items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight])) {
				temp = my.safeObject(items.paste);
				this.start.x = my.xtGet([items.pasteX, temp.x, this.start.x]);
				this.start.y = my.xtGet([items.pasteY, temp.y, this.start.y]);
				this.width = my.xtGet([items.pasteWidth, this.width]);
				this.height = my.xtGet([items.pasteHeight, this.height]);
			}
			if (my.xto([items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight])) {
				temp = my.safeObject(items.copy);
				this.copy.x = my.xtGet([items.copyX, temp.x, this.copy.x]);
				this.copy.y = my.xtGet([items.copyY, temp.y, this.copy.y]);
				this.copyWidth = my.xtGet([items.copyWidth, this.copyWidth]);
				this.copyHeight = my.xtGet([items.copyHeight, this.copyHeight]);
			}
			if (my.xto([items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale])) {
				this.setPaste();
			}
			if (my.xto([items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height])) {
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
		my.Picture.prototype.setDelta = function(items) {
			var temp, x, y, w, h;
			my.Entity.prototype.setDelta.call(this, items);
			items = my.safeObject(items);
			if (my.xto([items.paste, items.pasteX, items.pasteY])) {
				temp = my.safeObject(items.paste);
				x = my.xtGet([items.pasteX, temp.x, 0]);
				y = my.xtGet([items.pasteY, temp.y, 0]);
				this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + x : my.addPercentages(this.start.x, x);
				this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + y : my.addPercentages(this.start.y, y);
			}
			if (my.xto([items.pasteWidth, items.width])) {
				w = my.xtGet([items.pasteWidth, items.width]);
				this.width = (my.isa(this.width, 'num')) ? this.width + w : my.addPercentages(this.width, w);
			}
			if (my.xto([items.pasteHeight, items.height])) {
				h = my.xtGet([items.pasteHeight, items.height]);
				this.height = (my.isa(this.height, 'num')) ? this.height + h : my.addPercentages(this.height, h);
			}
			if (my.xto([items.copy, items.copyX, items.copyY])) {
				temp = my.safeObject(items.copy);
				x = my.xtGet([items.copyX, temp.x, 0]);
				y = my.xtGet([items.copyY, temp.y, 0]);
				this.copy.x = (my.isa(this.copy.x, 'num')) ? this.copy.x + x : my.addPercentages(this.copy.x, x);
				this.copy.y = (my.isa(this.copy.y, 'num')) ? this.copy.y + y : my.addPercentages(this.copy.y, y);
			}
			if (my.xto([items.copyWidth, items.width])) {
				w = my.xtGet([items.copyWidth, items.width]);
				this.copyWidth = (my.isa(this.copyWidth, 'num')) ? this.copyWidth + w : my.addPercentages(this.copyWidth, w);
			}
			if (my.xto([items.copyHeight, items.height])) {
				h = my.xtGet([items.copyHeight, items.height]);
				this.copyHeight = (my.isa(this.copyHeight, 'num')) ? this.copyHeight + h : my.addPercentages(this.copyHeight, h);
			}
			if (my.xto([items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale])) {
				this.setPaste();
			}
			if (my.xto([items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height])) {
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
		my.Picture.prototype.setCopy = function() {
			var w, h;
			switch (this.imageType) {
				case 'canvas':
					w = my.cell[this.source].actualWidth;
					h = my.cell[this.source].actualHeight;
					break;
				case 'video':
					w = my.video[this.source].width;
					h = my.video[this.source].height;
					break;
				case 'img':
					w = my.image[this.source].width;
					h = my.image[this.source].height;
					break;
				default:
					//do nothing for animations
			}
			if (this.imageType !== 'animation') {
				this.copyData.x = (my.isa(this.copy.x, 'str')) ? this.convertX(this.copy.x, w) : this.copy.x;
				this.copyData.y = (my.isa(this.copy.y, 'str')) ? this.convertY(this.copy.y, h) : this.copy.y;
				if (!my.isBetween(this.copyData.x, 0, w - 1, true)) {
					this.copyData.x = (this.copyData.x < 0) ? 0 : w - 1;
				}
				if (!my.isBetween(this.copyData.y, 0, h - 1, true)) {
					this.copyData.y = (this.copyData.y < 0) ? 0 : h - 1;
				}
				this.copyData.w = (my.isa(this.copyWidth, 'str')) ? this.convertX(this.copyWidth, w) : this.copyWidth;
				this.copyData.h = (my.isa(this.copyHeight, 'str')) ? this.convertY(this.copyHeight, h) : this.copyHeight;
				if (!my.isBetween(this.copyData.w, 1, w, true)) {
					this.copyData.w = (this.copyData.w < 1) ? 1 : w;
				}
				if (!my.isBetween(this.copyData.h, 1, h, true)) {
					this.copyData.h = (this.copyData.h < 1) ? 1 : h;
				}
				if (this.copyData.x + this.copyData.w > w) {
					this.copyData.x = w - this.copyData.w;
				}
				if (this.copyData.y + this.copyData.h > h) {
					this.copyData.y = h - this.copyData.h;
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
		my.Picture.prototype.setPaste = function() {
			var w,
				h,
				cell = my.cell[my.group[this.group].cell];
			this.pasteData.x = (my.isa(this.start.x, 'str')) ? this.convertX(this.start.x, cell.actualWidth) : this.start.x;
			this.pasteData.y = (my.isa(this.start.y, 'str')) ? this.convertY(this.start.y, cell.actualHeight) : this.start.y;
			this.pasteData.w = (my.isa(this.width, 'str')) ? this.convertX(this.width, cell.actualWidth) : this.width;
			this.pasteData.h = (my.isa(this.height, 'str')) ? this.convertY(this.height, cell.actualHeight) : this.height;
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
    Constructor helper function

    Loads an image from an URL path, creates a ScrawlImage wrapper for it and then creates the Picture entity

    _Note: this function is asynchronous_
    @method importImage
    @param {Object} items Object consisting of key:value attributes
    @return New Picture object; false on failure
    @chainable
    @private
    **/
		my.Picture.prototype.importImage = function(items) {
			items = my.safeObject(items);
			if (my.xt(items.url)) {
				var myImage = new Image();
				myImage.id = items.name || 'image' + Math.floor(Math.random() * 100000000);
				myImage.crossOrigin = 'Anonymous';
				myImage.onload = function() {
					var iObj = my.newImage({
						name: myImage.id,
						element: myImage,
					});
					delete items.url;
					items.source = myImage.id;
					console.log('Picture.importImage() - <' + myImage.id + '> loaded');
					return my.newPicture(items);
				};
				myImage.onerror = function() {
					console.log('Picture.importImage() failed - <' + myImage.id + '> failed to load');
					return false;
				};
				myImage.src = items.url;
			}
			else {
				console.log('Picture.importImage() failed - no url supplied');
				return false;
			}
		};
		/**
    Augments Entity.clone()
    @method clone
    @param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
    @return Cloned object
    @chainable
    **/
		my.Picture.prototype.clone = function(items) {
			var a = my.Entity.prototype.clone.call(this, items);
			items = my.safeObject(items);
			if (!items.keepCopyDimensions) {
				a.fitToImageSize();
			}
			return a;
		};
		/**
    Clone helper function
    @method fitToImageSize
    @return This
    @chainable
    @private
    **/
		my.Picture.prototype.fitToImageSize = function() {
			if (this.imageType === 'img') {
				var img = my.image[this.source];
				this.set({
					copyWidth: img.get('width'),
					copyHeight: img.get('height'),
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
			var home;
			if (my.contains(my.videonames, this.source)) {
				return 'video';
			}
			if (my.contains(my.imagenames, this.source)) {
				if (my.contains(my.spriteanimationnames, this.animation)) {
					return 'animation';
				}
				return 'img';
			}
			if (my.contains(my.canvasnames, this.source)) {
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
		my.Picture.prototype.clip = function(ctx, cell) {
			var here = this.prepareStamp();
			ctx.save();
			this.rotateCell(ctx, cell);
			ctx.beginPath();
			ctx.rect(here.x, here.y, this.pasteData.w, this.pasteData.h);
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
		my.Picture.prototype.clear = function(ctx, cell) {
			var here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.clearRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
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
			var here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			ctx.fillStyle = my.cell[cell].backgroundColor;
			ctx.strokeStyle = my.cell[cell].backgroundColor;
			ctx.globalAlpha = 1;
			ctx.strokeRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
			ctx.fillRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
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
			var here = this.prepareStamp();
			this.rotateCell(ctx, cell);
			my.cell[cell].setEngine(this);
			ctx.strokeRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
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
			var here,
				data = this.getImage();
			if (data) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.drawImage(data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, here.x, here.y, this.pasteData.w, this.pasteData.h);
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
			var here,
				data = this.getImage();
			if (data) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.strokeRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
				this.clearShadow(ctx, cell);
				ctx.drawImage(data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, here.x, here.y, this.pasteData.w, this.pasteData.h);
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
			var here,
				data = this.getImage();
			if (data) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.drawImage(data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, here.x, here.y, this.pasteData.w, this.pasteData.h);
				this.clearShadow(ctx, cell);
				ctx.strokeRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
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
			var here,
				data = this.getImage();
			if (data) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.drawImage(data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, here.x, here.y, this.pasteData.w, this.pasteData.h);
				ctx.strokeRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
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
			var here,
				data = this.getImage();
			if (data) {
				here = this.prepareStamp();
				this.rotateCell(ctx, cell);
				my.cell[cell].setEngine(this);
				ctx.strokeRect(here.x, here.y, this.pasteData.w, this.pasteData.h);
				ctx.drawImage(data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, here.x, here.y, this.pasteData.w, this.pasteData.h);
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
		my.Picture.prototype.getImage = function() {
			var result;
			switch (this.imageType) {
				case 'animation':
					result = my.spriteanimation[this.animation].getData();
					this.copyData.x = result.x;
					this.copyData.y = result.y;
					this.copyData.w = result.w;
					this.copyData.h = result.h;
					result = my.asset[this.source];
					break;
				case 'canvas':
					result = my.canvas[this.source];
					break;
				case 'video':
					result = my.asset[this.source];
					break;
				case 'img':
					result = my.asset[this.source];
					break;
				default:
					result = false;
			}
			return result;
		};
		/**
    Load the Picture entity's image data (via JavaScript getImageData() function) into the scrawl library
    @method getImageData
    @param {String} [label] IMAGEDATANAME - default: PICTURENAME_data
    @return This
    @chainable
    **/
		my.Picture.prototype.getImageData = function(label) {
			label = (my.xt(label)) ? label : 'data';
			var data = this.getImage();
			if (data) {
				my.imageCanvas.width = this.copyData.w;
				my.imageCanvas.height = this.copyData.h;
				my.imageCvx.drawImage(data, this.copyData.x, this.copyData.y, this.copyData.w, this.copyData.h, 0, 0, this.copyData.w, this.copyData.h);
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
		my.Picture.prototype.getImageDataValue = function(items) {
			items = my.safeObject(items);
			var coords = my.workimg.v1.set({
					x: (items.x || 0),
					y: (items.y || 0)
				}),
				myEl,
				d;
			coords.vectorSubtract(this.pasteData).rotate(-this.roll);
			coords.x = (this.flipReverse) ? -coords.x : coords.x;
			coords.y = (this.flipUpend) ? -coords.y : coords.y;
			coords.vectorSubtract(this.getPivotOffsetVector(this.handle));
			coords.x = Math.round(coords.x * (this.copyData.w / this.pasteData.w));
			coords.y = Math.round(coords.y * (this.copyData.h / this.pasteData.h));
			if (!this.imageData) {
				this.getImageData();
			}
			d = my.imageData[this.imageData];
			myEl = ((coords.y * d.width) + coords.x) * 4;
			if (my.isBetween(coords.x, 0, d.width - 1, true) && my.isBetween(coords.y, 0, d.height - 1, true)) {
				switch (items.channel || this.get('imageDataChannel')) {
					case 'red':
						return (my.xt(d.data[myEl])) ? d.data[myEl] : false;
					case 'green':
						return (my.xt(d.data[myEl + 1])) ? d.data[myEl + 1] : false;
					case 'blue':
						return (my.xt(d.data[myEl + 2])) ? d.data[myEl + 2] : false;
					case 'color':
						return (my.xta([d.data[myEl], d.data[myEl + 1], d.data[myEl + 2], d.data[myEl + 3]])) ? 'rgba(' + d.data[myEl] + ',' + d.data[myEl + 1] + ',' + d.data[myEl + 2] + ',' + d.data[myEl + 3] + ')' : false;
					default: // alpha
						return (my.xt(d.data[myEl + 3])) ? d.data[myEl + 3] : false;
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
		my.Picture.prototype.checkHit = function(items) {
			items = my.safeObject(items);
			var mytests = (my.xt(items.tests)) ? [].concat(items.tests) : [(items.x || false), (items.y || false)],
				c,
				hit,
				test = (my.isa(items.test, 'num')) ? items.test : 0;
			for (var i = 0, iz = mytests.length; i < iz; i += 2) {
				hit = my.Entity.prototype.checkHit.call(this, {
					tests: [mytests[i], mytests[i + 1]]
				});
				if (this.checkHitUsingImageData) {
					if (hit) {
						hit.x = Math.floor(hit.x);
						hit.y = Math.floor(hit.y);
						c = this.getImageDataValue(hit);
						if (this.get('imageDataChannel') === 'color') {
							hit = (c === 'rgba(0,0,0,0)') ? false : hit;
						}
						else {
							hit = (c > test) ? hit : false;
						}
					}
				}
				if (hit) {
					break;
				}
			}
			return (hit) ? hit : false;
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
	}(scrawl));
}
