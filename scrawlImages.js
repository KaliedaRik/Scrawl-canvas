'use strict';
/**
# scrawlImages

## Purpose and features

The Images module adds support for displaying images on canvas elements

* Defines the SpriteImage object, which wraps &lt;img&gt; and &lt;svg&gt; elements
* Adds functionality to load images into the Scrawl library dynamically (after the web page hads loaded)
* Defines the Picture sprite, which can be used to display file images (including animated sprite sheets), other &lt;canvas&gt; elements, and &lt;video&gt; elements (experimental)
* Defines the AnimSheet object, which in turn define and control action sequences from sprite sheet images
* Defines the Pattern design, which uses images for sprite fillStyle and strokeStyle attributes

@module scrawlImages
**/

var scrawl = (function(my){

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
A __general__ function to generate ScrawlImage wrapper objects for &lt;img&gt;, &lt;video&gt; or &lt;svg&gt; elements identified by class string
@method getImagesByClass
@param {String} classtag Class string value of DOM objects to be imported into the scrawl library
@return Array of String names; false on failure
**/
	my.getImagesByClass = function(classtag){
		if(classtag){
			var names = [],
				s = document.getElementsByClassName(classtag);
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					var myImg = my.newImage({
						element: s[i],							//unrecorded flag for triggering Image stuff
						});
					names.push(myImg.name);
					}
				return names;
				}
			}
		console.log('my.getImagesByClass() failed to find any <img> elements of class="'+classtag+'" on the page');
		return false;
		};
/**
A __factory__ function to generate new Pattern objects
@method newPattern
@param {Object} items Key:value Object argument for setting attributes
@return Pattern object
**/
	my.newPattern = function(items){
		return new my.Pattern(items);
		};
/**
A __factory__ function to generate new Picture sprites
@method newPicture
@param {Object} items Key:value Object argument for setting attributes
@return Picture sprite object
**/
	my.newPicture = function(items){
		return new my.Picture(items);
		};
/**
A __factory__ function to generate new ScrawlImage objects
@method newImage
@param {Object} items Key:value Object argument for setting attributes
@return ScrawlImage object
@private
**/
	my.newImage = function(items){
		return new my.ScrawlImage(items);
		};
/**
A __factory__ function to generate new AnimSheet objects
@method newAnimSheet
@param {Object} items Key:value Object argument for setting attributes
@return AnimSheet object
**/
	my.newAnimSheet = function(items){
		return new my.AnimSheet(items);
		};
	my.pushUnique(my.sectionlist, 'image');
	my.pushUnique(my.sectionlist, 'img');
	my.pushUnique(my.nameslist, 'imagenames');
	my.pushUnique(my.nameslist, 'animnames');
	my.pushUnique(my.sectionlist, 'anim');

/**
# Pattern
	
## Instantiation

* scrawl.newPattern()

## Purpose

* Defines a pattern
* Used with sprite.strokeStyle and sprite.fillStyle attributes

## Access

* scrawl.design.PATTERNNAME - for the Pattern design object

@class Pattern
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Pattern = function(items){
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
	my.Pattern.prototype.set = function(items){
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
	my.Pattern.prototype.setImage = function(source, callback){
		if(my.isa(source, 'str')){
			var myImage = new Image();
			var that = this;
			myImage.id = this.name;
			myImage.onload = function(callback){
				try{
					var iObj = my.newImage({
						name: that.name,
						element: myImage,
						});
					my.design[that.name] = that;
					my.design[that.name].image = iObj.name;
					my.design[that.name].source = myImage.src;
					my.pushUnique(my.designnames, that.name);
					my.design[that.name].makeDesign();
					if(my.isa(callback, 'fn')){
						callback();
						}
					}
				catch(e){
					console.log('Pattern '+[that.name]+' - setImage() #1 failed - '+e.name+' error: '+e.message);
					return that;
					}
				};
			myImage.src = source;
			}
		else if(my.isa(source, 'obj')){
			if(source.type === 'ScrawlImage'){
				try{
					this.image = source.name;
					my.design[this.name] = this;
					my.pushUnique(my.designnames, this.name);
					this.makeDesign();
					if(my.isa(callback, 'fn')){
						callback();
						}
					}
				catch(e){
					console.log('Pattern '+[this.name]+' - setImage() #2 failed - '+e.name+' error: '+e.message);
					return that;
					}
				}
			else if(source.type === 'Cell'){
				try{
					this.canvas = source.name;
					my.design[this.name] = this;
					my.pushUnique(my.designnames, this.name);
					this.makeDesign();
					if(my.isa(callback, 'fn')){
						callback();
						}
					}
				catch(e){
					console.log('Pattern '+[this.name]+' - setImage() #3 failed - '+e.name+' error: '+e.message);
					return that;
					}
				}
			}
		else{
			console.log('Pattern '+[this.name]+' - setImage() #4 failed - source not a string or an object', source);
			}
		return this;
		};
/**
Returns &lt;canvas&gt; element's contenxt engine's pattern object, or 'rgba(0,0,0,0)' on failure
@method getData
@return JavaScript pattern object, or String
@private
**/
	my.Pattern.prototype.getData = function(){
		return (my.xt(my.dsn[this.name])) ? my.dsn[this.name] : 'rgba(0,0,0,0)';
		};
/**
Builds &lt;canvas&gt; element's contenxt engine's pattern object
@method makeDesign
@return This
@chainable
@private
**/
	my.Pattern.prototype.makeDesign = function(){
		var ctx = my.context[this.cell],
			img = (my.xt(my.img[this.image])) ? my.img[this.image] : my.object[this.image];
		if(this.image){
			if(img){
				my.dsn[this.name] = ctx.createPattern(img, this.repeat);
				}
			}
		else if(this.canvas){
			my.dsn[this.name] = ctx.createPattern(my.canvas[this.canvas], this.repeat);
			}
		return this;
		};
/**
Remove this pattern from the scrawl library
@method remove
@return Always true
**/
	my.Pattern.prototype.remove = function(){
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
	my.Pattern.prototype.update = function(){
		this.makeDesign();
		return this;
		};

/**
# Picture
	
## Instantiation

* scrawl.newPicture()

## Purpose

* Defines rectangular image-based objects for displaying on a Cell's canvas
* Used to display both static and sprite sheet image animations
* Links to details of an image's data; can use image data (rgba data) during collision detection
* Can handle video input (experimental)
* Performs 'rect' and 'drawImage' drawing operations on canvases

## Access

* scrawl.sprite.PICTURENAME - for the Picture sprite object

@class Picture
@constructor
@extends Sprite
@uses AnimSheet
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Picture = function(items){
		if(my.isa(items, 'obj') && my.xt(items.url)){
			return this.importImage(items);
			}
		else{
			items = my.safeObject(items);
			my.Sprite.call(this, items);
			my.Position.prototype.set.call(this, items);
			var s,
				w,
				h,
				x,
				y;
			this.source = items.source || false;
			this.imageType = this.sourceImage(items.source) || false;
			if(this.source){
				if(this.imageType === 'img'){
					s = my.image[this.source];
					w = s.get('width');
					h = s.get('height');
					x = 0;
					y = 0;
					}
				else if(this.imageType === 'canvas'){
					s = my.cell[this.source];
					w = s.sourceWidth;
					h = s.sourceHeight;
					x = s.source.x;
					y = s.source.y;
					}
				else if(this.imageType === 'animation'){
					s = my.anim[this.get('animSheet')].getData();
					w = s.copyWidth;
					h = s.copyHeight;
					x = s.copyX;
					y = s.copyY;
					}
				this.width = items.width || w;
				this.height = items.height || h;
				this.copyX = items.copyX || x;
				this.copyY = items.copyY || y;
				this.copyWidth = items.copyWidth || w;
				this.copyHeight = items.copyHeight || h;
				}
			this.registerInLibrary();
			my.pushUnique(my.group[this.group].sprites, this.name);
			return this;
			}
		};
	my.Picture.prototype = Object.create(my.Sprite.prototype);
/**
@property type
@type String
@default 'Picture'
@final
**/		
	my.Picture.prototype.type = 'Picture';
	my.Picture.prototype.classname = 'spritenames';
	my.d.Picture = {
/**
SCRAWLIMAGE String - source image for this sprite
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
ANIMSHEET String - Sprite sheet image linked to this sprite
@property animSheet
@type String
@default ;;
**/
		animSheet: '',
/**
Identifier String - permitted values include: 'animation', 'canvas', 'img'

Detected automatically by scrawl during sprite construction
@property imageType
@type String
@default ''
@private
**/
		imageType: '',
/**
Collision flag - when true, Picture sprite will use imageData to determine whether a collision has occured; when false, a simpler box collision system is used
@property checkHitUsingImageData
@type Boolean
@default false
**/
		checkHitUsingImageData: false,
/**
Image display - horizontal offset, in pixels, from the image's top left corner
@property copyX
@type Number
@default 0
**/
		copyX: 0,
/**
Image display - vertical offset, in pixels, from the image's top left corner
@property copyY
@type Number
@default 0
**/
		copyY: 0,
/**
Image display - width, in pixels, from copy start point
@property copyWidth
@type Number
@default 0
**/
		copyWidth: 0,
/**
Image display - height, in pixels, from copy start point
@property copyHeight
@type Number
@default 0
**/
		copyHeight: 0,
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
	my.mergeInto(my.d.Picture, my.d.Sprite);
/**
Augments Sprite.get()
@method get
@param {String} item Attribute to be retrieved
@return Attribute value
**/
	my.Picture.prototype.get = function(item){
		if(my.contains(my.animKeys, item)){
			return my.anim[this.animSheet].get(item);
			}
		else{
			return my.Sprite.prototype.get.call(this, item);
			}
		};
/**
Augments Sprite.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Picture.prototype.set = function(items){
		my.Sprite.prototype.set.call(this, items);
		if(my.xt(this.animSheet)){
			my.anim[this.animSheet].set(items);
			}
		items = my.safeObject(items);
		this.width = items.width || this.width;
		this.height = items.height || this.height;
		this.copyX = items.copyX || this.copyX;
		this.copyY = items.copyY || this.copyY;
		this.copyWidth = items.copyWidth || this.copyWidth;
		this.copyHeight = items.copyHeight || this.copyHeight;
		return this;
		};
/**
Augments Sprite.setDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Picture.prototype.setDelta = function(items){
		my.Sprite.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		if(my.xt(items.width)){this.width += items.width;}
		if(my.xt(items.height)){this.height += items.height;}
		if(my.xt(items.copyX)){this.copyX += items.copyX;}
		if(my.xt(items.copyY)){this.copyY += items.copyY;}
		if(my.xt(items.copyWidth)){this.copyWidth += items.copyWidth;}
		if(my.xt(items.copyHeight)){this.copyHeight += items.copyHeight;}
		return this;
		};
/**
Constructor helper function

Loads an image from an URL path, creates a ScrawlImage wrapper for it and then creates the Picture sprite

_Note: this function is asynchronous_
@method importImage
@param {Object} items Object consisting of key:value attributes
@return New Picture object; false on failure
@chainable
@private
**/
	my.Picture.prototype.importImage = function(items){
		if(my.isa(items, 'obj') && my.xt(items.url)){
			var myImage = new Image();
			myImage.id = items.name || 'image'+Math.floor(Math.random()*100000000);
			myImage.crossOrigin = 'anonymous';
			myImage.onload = function(){
				var iObj = my.newImage({
					name: myImage.id,
					element: myImage,
					});
				delete items.url;
				items.source = myImage.id;
				var s = my.newPicture(items);
				if(my.isa(items.callback,'fn')){
					items.callback.call(s);
					}
				return s;
				};
			myImage.onerror = function(){
				console.log('Picture.importImage() failed - <'+myImage.id+'> failed to load');
				return false;
				}
			myImage.src = items.url;
			}
		else{
			console.log('Picture.importImage() failed - no url supplied');
			return false;
			}
		};
/**
Augments Sprite.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	my.Picture.prototype.clone = function(items){
		var a = my.Sprite.prototype.clone.call(this, items);
		items = my.safeObject(items);
		if(!items.keepCopyDimensions){
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
	my.Picture.prototype.fitToImageSize = function(){
		if(this.imageType === 'img'){
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
@return Correct imageType attribute value for this sprite
@private
**/
	my.Picture.prototype.sourceImage = function(){
		if(this.get('animSheet') && my.contains(my.imagenames, this.source)){return 'animation';}
		if(my.contains(my.imagenames, this.source)){return 'img';}
		if(my.contains(my.cellnames, this.source)){return 'canvas';}
		return false;
		};
/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Picture.prototype.clip = function(ctx, cell){
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
	my.Picture.prototype.clear = function(ctx, cell){
		var here = this.prepareStamp();
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
	my.Picture.prototype.clearWithBackground = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		this.rotateCell(ctx);
		ctx.fillStyle = my.cell[cell].backgroundColor;
		ctx.strokeStyle = my.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		ctx.strokeRect(here.x, here.y, width, height);
		ctx.fillRect(here.x, here.y, width, height);
		ctx.fillStyle = my.ctx[cell].fillStyle;
		ctx.strokeStyle = my.ctx[cell].strokeStyle;
		ctx.globalAlpha = my.ctx[cell].globalAlpha;
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
	my.Picture.prototype.draw = function(ctx, cell){
		var here = this.prepareStamp();
		this.rotateCell(ctx);
		my.cell[cell].setEngine(this);
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
	my.Picture.prototype.fill = function(ctx, cell){
		var here;
		if(this.imageType){
			here = this.prepareStamp();
			this.rotateCell(ctx);
			my.cell[cell].setEngine(this);
			try{
				ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, (this.width * this.scale), (this.height * this.scale));
				}catch(e){console.log('Picture '+this.name+' experienced a "fill" drawImage glitch');}
			}
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
	my.Picture.prototype.drawFill = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			my.cell[cell].setEngine(this);
			ctx.strokeRect(here.x, here.y, width, height);
			this.clearShadow(ctx, cell);
			try{
				ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
				}catch(e){console.log('Picture '+this.name+' experienced a "drawFill" drawImage glitch');}
			}
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
	my.Picture.prototype.fillDraw = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			my.cell[cell].setEngine(this);
			try{
				ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
				}catch(e){console.log('Picture '+this.name+' experienced a "fillDraw" drawImage glitch');}
			this.clearShadow(ctx, cell);
			ctx.strokeRect(here.x, here.y, width, height);
			}
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
	my.Picture.prototype.sinkInto = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			my.cell[cell].setEngine(this);
			try{
				ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
				}catch(e){console.log('Picture '+this.name+' experienced a "sinkInto" drawImage glitch');}
			ctx.strokeRect(here.x, here.y, width, height);
			}
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
	my.Picture.prototype.floatOver = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			my.cell[cell].setEngine(this);
			ctx.strokeRect(here.x, here.y, width, height);
			try{
				ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
				}catch(e){console.log('Picture '+this.name+' experienced a "floatOver" drawImage glitch');}
			}
		return this;
		};
/**
Load the Picture sprite's image data (via JavaScript getImageData() function) into the scrawl library
@method getImageData
@param {String} [label] IMAGEDATANAME - default: PICTURENAME_data
@return This
@chainable
**/
	my.Picture.prototype.getImageData = function(label){
		label = (my.xt(label)) ? label : 'data';
		var	img = this.getImage(),
			myImage;
		if(this.imageType === 'animation'){
			myImage = my.image[this.source];
			my.cv.width = myImage.get('width');
			my.cv.height = myImage.get('height');
			my.cvx.drawImage(img, 0, 0);
			}
		else{
			my.cv.width = this.copyWidth;
			my.cv.height = this.copyHeight;
			try{
				my.cvx.drawImage(img, this.copyX, this.copyY, this.copyWidth, this.copyHeight, 0, 0, this.copyWidth, this.copyHeight);
				}catch(e){console.log('Picture '+this.name+' experienced a "getImageData" drawImage glitch');}
			}
		this.imageData = this.name+'_'+label;
		my.imageData[this.imageData] = my.cvx.getImageData(0, 0, my.cv.width, my.cv.height);
		return this;
		};
/**
Get the pixel color or channel data from Picture object's image at given coordinate

Argument needs to have __x__ and __y__ data (pixel coordinates) and, optionally, a __channel__ string - 'red', 'blue', 'green', 'alpha', 'color' (default)
@method getImageDataValue
@param {Object} items Coordinate Vector or Object
@return Color value at coordinate; false if no color found
**/
	my.Picture.prototype.getImageDataValue = function(items){
		var	coords = this.getLocalCoordinate(items),
			d = my.imageData[this.get('imageData')],
			myX,
			myY,
			myData,
			copyScaleX,
			copyScaleY,
			result,
			myEl,
			imageDataChannel = this.get('imageDataChannel');
		if(this.imageType === 'animation' && my.image[this.source]){
			myData = my.anim[this.get('animSheet')].getData();
			copyScaleX = this.width/myData.copyWidth;
			copyScaleY = this.height/myData.copyHeight;
			myX = Math.round((coords.x/copyScaleX) + myData.copyX);
			myY = Math.round((coords.y/copyScaleY) + myData.copyY);
			}
		else{
			copyScaleX = this.width/this.copyWidth;
			copyScaleY = this.height/this.copyHeight;
			myX = Math.round(coords.x/copyScaleX);
			myY = Math.round(coords.y/copyScaleY);
			}
		result = false;
		myEl = ((myY * d.width) + myX) * 4;
		if(my.isBetween(myX, 0, d.width-1, true) && my.isBetween(myY, 0, d.height-1, true)){
			switch(items.channel || imageDataChannel){
				case 'red' : result = (my.xt(d.data[myEl])) ? d.data[myEl] : false; break;
				case 'blue' : result = (my.xt(d.data[myEl+1])) ? d.data[myEl+1] : false; break;
				case 'green' : result = (my.xt(d.data[myEl+2])) ? d.data[myEl+2] : false; break;
				case 'alpha' : result = (my.xt(d.data[myEl+3])) ? d.data[myEl+3] : false; break;
				case 'color' : result = (my.xta([d.data[myEl],d.data[myEl+1],d.data[myEl+2],d.data[myEl+3]])) ? 'rgba('+d.data[myEl]+','+d.data[myEl+1]+','+d.data[myEl+2]+','+d.data[myEl+3]+')' : false; break;
				default : result = false;
				}
			}
		return result;
		};
/**
Display helper function - retrieve copy attributes for ScrawlImage, taking into account the current frame for sprite sheet images
@method getImage
@return Image Object
@private
**/
	my.Picture.prototype.getImage = function(){
		var myData,
			myReturn;
		switch(this.imageType){
			case 'canvas' :
				myReturn = my.canvas[this.source];
				break;
			case 'animation' :
				myData = my.anim[this.animSheet].getData();
				this.set({
					copyX: myData.copyX,
					copyY: myData.copyY,
					copyWidth: myData.copyWidth,
					copyHeight: myData.copyHeight,
					});
				myReturn = (my.xt(my.img[this.source])) ? my.img[this.source] : my.object[this.source];
				break;
			default :
				myReturn = (my.xt(my.img[this.source])) ? my.img[this.source] : my.object[this.source];
			}
		return myReturn;
		};
/**
Check Cell coordinates to see if any of them fall within this sprite's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the sprite's path; false if none fall within the path
**/
	my.Picture.prototype.checkHit = function(items){
		items = my.safeObject(items);
		var	hit = my.Sprite.prototype.checkHit.call(this, items),
			c,
			test;
		if(this.checkHitUsingImageData){
			if(hit){
				hit.x = parseInt(hit.x);
				hit.y = parseInt(hit.y);
				c = this.getImageDataValue(hit);
				if(this.get('imageDataChannel') === 'color'){
					return (c === 'rgba(0,0,0,0)') ? false : hit;
					}
				else{
					test = (my.isa(items.test,'num')) ? items.test : 0;
					return (c > test) ? hit : false;
					}
				}
			}
		return hit;
		};

/**
# ScrawlImage
	
## Instantiation

* scrawl.getImagesByClass()

## Purpose

* Wraps DOM image elements imported into the scrawl library - &lt;img&gt;, &lt;video&gt;, &lt;svg&gt;
* Used by __Picture__ sprites and __Pattern__ designs
* Users should not interact directly with this object

## Access

* scrawl.image.SCRAWLIMAGENAME - for the ScrawlImage object
* scrawl.img.SCRAWLIMAGENAME - for a link to a copy of the original &lt;img&gt; element
* scrawl.object.SCRAWLIMAGENAME - for a link to the original &lt;img&gt;, &lt;svg&gt; or &lt;video&gt; element

@class ScrawlImage
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.ScrawlImage = function(items){
		items = my.safeObject(items);
		var iData = (my.xt(items.imageData)) ? items.imageData : {},
			eData = (my.xt(items.element)) ? items.element : {},
			data,
			makeCopy = (my.xt(items.makeCopy)) ? items.makeCopy : false;
		if(my.xto([items.element, items.imageData])){
			items.name = items.name || eData.getAttribute('id') || eData.getAttribute('name') || eData.getAttribute('src');
			my.Base.call(this, items);
			this.width = items.width || iData.width || parseFloat(eData.offsetWidth) || eData.width || eData.style.width || 0;
			this.height = items.height || iData.height || parseFloat(eData.offsetHeight) || eData.height || eData.style.height || 0;
			if(my.xt(items.element) && makeCopy){
				data = (my.xt(items.element)) ? this.getImageDataUrl(eData) : iData;
				my.img[this.name] = this.makeImage(data);
				}
			else{
				my.object[this.name] = eData;
				my.pushUnique(my.objectnames, this.name);
				}
			my.image[this.name] = this;
			my.pushUnique(my.imagenames, this.name);
			this.source = items.source || this.name || '';
/**
ScrawlImage constructor and clone() function callback - an anonymous function that runs at the end of image construction

_Not retained_
@property callback
@type Function
@default undefined
**/
			if(my.isa(items.fn, 'fn')){
				items.fn.call(this);
				}
			return this;
			}
		return false;
		}
	my.ScrawlImage.prototype = Object.create(my.Base.prototype);
/**
@property type
@type String
@default 'ScrawlImage'
@final
**/
	my.ScrawlImage.prototype.type = 'ScrawlImage';
	my.ScrawlImage.prototype.classname = 'imagenames';
	my.d.ScrawlImage = {
/**
DOM image actual width, in pixels
@property width
@type Number
@default 0
**/
		width: 0,
/**
DOM image actual height, in pixels
@property height
@type Number
@default 0
**/
		height: 0,
/**
Handle to the DOM &lt;img&gt; element from which this object derives its image data
@property source 
@type String
@default ''
@private
**/
		source: '',
		};
	my.mergeInto(my.d.ScrawlImage, my.d.Base);
/**
Makes a virtual image from an imageDataUrl

@method makeImage
@param {Object} data The imageDataUrl data
@return new DOM &lt;img&gt; object
@private
**/
	my.ScrawlImage.prototype.makeImage = function(data){
		var image = document.createElement('img');
		image.width = this.width;
		image.height = this.height;
		image.crossorigin = 'anonymous';
		image.src = data;
		return image;
		};
/**
Get image data URL - uses JavScript canvas API function ctx.toDataURL()

_Note: does not save the data in the scrawl library_
@method getImageDataUrl
@param {Object} image DOM &lt;img&gt; element
@return data.URL data
@private
**/
	my.ScrawlImage.prototype.getImageDataUrl = function(image, putdata){
		putdata = (my.xt(putdata)) ? putdata : false;
		my.cv.width = this.width;
		my.cv.height = this.height;
		(putdata) ? my.cvx.putImageData(image, 0, 0) : my.cvx.drawImage(image, 0, 0);
		return my.cv.toDataURL();
		};
/**
Get image data - uses JavScript canvas API function ctx.getImageData()

_Note: does not save the data in the scrawl library_
@method getImageData
@param {Boolean} [source] When true, retrieves image data from the source image; default is false
@return getImageData data object
@private
**/
	my.ScrawlImage.prototype.getImageData = function(source){
		source = (my.xt(source)) ? source : false;
		var image;
		if(my.isa(source,'bool')){
			image = (source) ? my.object[this.source] : my.img[this.name];
			my.cv.width = this.width;
			my.cv.height = this.height;
			my.cvx.drawImage(image, 0, 0);
			return my.cvx.getImageData(0, 0, this.width, this.height);
			}
		return source;
		};
/**
Clone a SpriteImage object

Also clones the virtual &lt;img&gt; element associated with the SpriteImage
@method clone
@param {Object} [items] Key:value Object argument for setting attributes
@return new ScrawlImage object on success; false otherwise
**/
	my.ScrawlImage.prototype.clone = function(items){
		items = my.safeObject(items);
		items.element = (my.xt(my.img[this.name])) ? my.img[this.name] : my.object[this.source];
		items.makeCopy = true;
		return my.Base.prototype.clone.call(this, items);
		};
/**
Grayscale filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of grayscaling effect: as a Number, between 0 (no effect) and 1 (full grayscale effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method grayscale
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.grayscale = function(items){
		return (my.xt(my.filter)) ? my.filter.grayscale(items, this) : false;
		};
/**
Sharpen filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of sharpen effect: as a Number, between 0 (no effect) and 1 (full sharpen effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method sharpen
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.sharpen = function(items){
		return (my.xt(my.filter)) ? my.filter.sharpen(items, this) : false;
		};
/**
Invert filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of invert effect: as a Number, between 0 (no effect) and 1 (full invert effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method invert
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.invert = function(items){
		return (my.xt(my.filter)) ? my.filter.invert(items, this) : false;
		};
/**
Brightness filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of brightness effect: as a Number, between 0 (black) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method brightness
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.brightness = function(items){
		return (my.xt(my.filter)) ? my.filter.brightness(items, this) : false;
		};
/**
Saturation filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of saturation effect: as a Number, between 0 (gray) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method saturation
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.saturation = function(items){
		return (my.xt(my.filter)) ? my.filter.saturation(items, this) : false;
		};
/**
Threshold filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of threshold border: as a Number, between 0 (black) and 1 (white); as a String, between '0%' and '100%' (default: 0.5)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method threshold
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.threshold = function(items){
		return (my.xt(my.filter)) ? my.filter.threshold(items, this) : false;
		};
/**
Channels filter (added to the core by the scrawlFilters module)

Alter the relative channel levels for an image

Attributes in the argument object:

* __red__ - Number or String. Percentage value of red channel effect on the pixel: as a Number, between 0 (set red channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __green__ - Number or String. Percentage value of green channel effect on the pixel: as a Number, between 0 (set green channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __blue__ - Number or String. Percentage value of blue channel effect on the pixel: as a Number, between 0 (set blue channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __alpha__ - Number or String. Percentage value of alpha channel effect on the pixel: as a Number, between 0 (set alpha channel to zero) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method channels
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.channels = function(items){
		return (my.xt(my.filter)) ? my.filter.channels(items, this) : false;
		};
/**
ChannelStep filter (added to the core by the scrawlFilters module)

Limit the number of values used in each channel

Attributes in the argument object:

* __red__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __green__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __blue__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __alpha__ - Number. Channel step size, between 1 (256 steps) and 128 (2 steps) - default: 1
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method channelStep
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.channelStep = function(items){
		return (my.xt(my.filter)) ? my.filter.channelStep(items, this) : false;
		};
/**
Sepia filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of sepia effect: as a Number, between 0 (no effect) and 1 (full sepia tint); as a String, between '0%' and '100%' (default: 1).
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method sepia
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.sepia = function(items){
		return (my.xt(my.filter)) ? my.filter.sepia(items, this) : false;
		};
/**
Tint filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __value__ - Number or String. Percentage value of tint effect: as a Number, between 0 (no effect) and 1 (full tint); as a String, between '0%' and '100%' (default: 1).
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 

The argument object can take up to nine additional attributes, used to set the tinting effect. Default values for these attributes will generate a sepia tint. All values are Numbers between 0 and 1:

* __redInRed__ or __rr__ - default 0.393
* __redInGreen__ or __rg__ - default 0.349
* __redInBlue__ or __rb__ - default 0.272
* __greenInRed__ or __gr__ - default 0.769
* __greenInGreen__ or __gg__ - default 0.686
* __greenInBlue__ or __gb__ - default 0.534
* __blueInRed__ or __br__ - default 0.189
* __blueInGreen__ or __bg__ - default 0.168
* __blueInBlue__ or __bb__ - default 0.131
@method tint
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.tint = function(items){
		return (my.xt(my.filter)) ? my.filter.tint(items, this) : false;
		};
/**
Blur filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __radius__ - Number. Blur brush x and y radius (default: 0)
* __radiusX__ - Number. Blur brush x radius (default: 2)
* __radiusY__ - Number. Blur brush y radius (default: 2)
* __roll__ - Number. Blur brush roll value (default: 0)
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method blur
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.blur = function(items){
		return (my.xt(my.filter)) ? my.filter.blur(items, this) : false;
		};
/**
Pixelate filter (added to the core by the scrawlFilters module)

Attributes in the argument object:

* __width__ - Number. Block width (default: 5)
* __height__ - Number. Block height (default: 5)
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method pixelate
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	my.ScrawlImage.prototype.pixelate = function(items){
		return (my.xt(my.filter)) ? my.filter.pixelate(items, this) : false;
		};
/**
Matrix filter (added to the core by the scrawlFilters module)

Transforms an image using a weighted matrix

Matrix is composed of an array of weightings to be applied to the colors of surrounding pixels. The function expects the weightings data to equate to a square matrix with an odd number of colums/rows - thusthe data array should consist of 9, 25, 49, etc elements. if the data array is missing the requisite number of elements, the function will add zeros to it to pad it out.

Attributes in the argument object:

* __data__ - Array of Numbers. (default: [1])
* __includeAlpha__ - Boolean. When true, alpha values are included in the calculation (default: false)
* __wrap__ - Boolean. When true, offset pixels that fall outside the boundaries of the image will be wrapped to the opposite end of the image row or column; when false, the offset pixels are ignored and their weightings excluded from the calculation (default: false)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method matrix
@param {Object} [items] Key:value Object argument for setting attributes
@return amended data image object
**/
	my.ScrawlImage.prototype.matrix = function(items){
		return (my.xt(my.filter)) ? my.filter.matrix(items, this) : false;
		};

/**
# AnimSheet
	
## Instantiation

* scrawl.newAnimSheet()

## Purpose

* wraps a sprite sheet image
* acts as the link between a Picture object and the sprite images on the sprite sheet
* holds data about cells in the spritesheet animation
* controls the animation playback

## Access

* scrawl.anim.ANIMSHEETNAME
* scrawl.anim.[scrawl.sprite.PICTURENAME.animsheet]

AnimSheet attributes can also be set and retrieved directly using Picture.get() and Picture.set() functions, where a Picture sprite is associated with the AnimSheet object via its .animSheet attribute

@class AnimSheet
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.AnimSheet = function(items){
		items = my.safeObject(items);
		my.Base.call(this, items);
		this.frames = (my.xt(items.frames)) ? [].concat(items.frames) : [];
		this.currentFrame = items.currentFrame || 0;
		this.speed = (my.isa(items.speed,'num')) ? items.speed : 1;
		this.loop = (my.isa(items.loop,'str')) ? items.loop : 'end';
		this.running = (my.isa(items.running,'str')) ? items.running : 'complete';
		this.lastCalled = (my.xt(items.lastCalled)) ? items.lastCalled : Date.now();
		my.anim[this.name] = this;
		my.pushUnique(my.animnames, this.name);
		return this;
		}
	my.AnimSheet.prototype = Object.create(my.Base.prototype);
/**
@property type
@type String
@default 'AnimSheet'
@final
**/		
	my.AnimSheet.prototype.type = 'AnimSheet';
	my.AnimSheet.prototype.classname = 'animnames';
	my.d.AnimSheet = {
/**
An Array of animation frame data Objects, to be used for producing an animation sequence. Each Object in the Array has the following form:

* {x:Number, y:Number, w:Number, h:Number, d:Number}

... where:

* __x__ and __y__ represent the starting coordinates for the animation frame, in pixels, from the top left corner of the image
* __w__ and __h__ represent the dimensions of the animation frame, in pixels
* __d__ is the duration for each frame, in milliseconds

Animation frames are played in the order they are presented in this Array
@property frames
@type Array
@default []
**/
		frames: [],
/**
The current frame of the animation, from frame 0
@property currentFrame
@type Number
@default 0
**/
		currentFrame: 0,
/**
The speed at which the animation is to play. Values less than 1 will slow the animation, while values greater than one will speed it up. Setting the speed to 0 will pause the animation
@property speed
@type Number
@default 1
**/
		speed: 1,
/**
Playback String; permitted values include:

* 'pause' - pause the animation on the current frame
* 'end' - play the animation once (default)
* 'loop' - play the animation continuously 
* 'reverse' - reverse the direction in which the animation runs
@property loop
@type String
@default 'end'
**/
		loop: 'end',
/**
Animation running String: permitted values include:

* 'forward' - play the animation from the first frame towards the last frame
* 'backward' - play the animation from the last frame towards the first frame
* 'complete' - animation has reached the last (or first) frame and has completed
@property running
@type String
@default 'complete'
**/
		running: 'complete',
/**
Datestamp when AnimSheet.getData() function was last called
@property lastCalled
@type Date
@default 0
@private
**/
		lastCalled: 0,
		};
	my.animKeys = Object.keys(my.d.AnimSheet);
	my.mergeInto(my.d.AnimSheet, my.d.Scrawl);
/**
Set attribute values - will also set the __currentFrame__ attribute to the appropriate value when the running __attribute__ is changed

(Only used by AnimSheet objects)
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
@private
**/
	my.AnimSheet.prototype.set = function(items){
		items = my.safeObject(items);
		var paused = (this.loop === 'pause') ? true : false;
		my.Base.prototype.set.call(this, items);
		if(my.xt(items.running)){
			switch(items.running){
				case 'forward' :
					this.running = 'forward';
					if(!paused){
						this.currentFrame = 0;
						}
					break;
				case 'backward' :
					this.running = 'backward';
					if(!paused){
						this.currentFrame = this.frames.length - 1;
						}
					break;
				default :
					this.running = 'complete';
					this.currentFrame = 0;
					break;
				}
			}
		return this;
		};
/**
Returns an Object in the form {copyX:Number, copyY:Number, copyWidth:Number, copyHeight:Number}, representing the coordinates and dimensions of the current frame to be displayed by a Picture sprite

(Only used by AnimSheet objects)
@method getData
@return Data object
@private
**/
	my.AnimSheet.prototype.getData = function(){
		if(this.speed > 0){
			var interval = this.frames[this.currentFrame].d/this.speed;
			var changeFrame = (this.lastCalled + interval < Date.now()) ? true : false;
			switch(this.running){
				case 'complete' :
					this.lastCalled = Date.now();
					break;
				case 'forward' :
					if(changeFrame){
						switch(this.loop){
							case 'pause' :
								break;
							case 'end' :
								this.running = (this.currentFrame + 1 >= this.frames.length) ? 'complete' : this.running;
								this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? this.currentFrame : this.currentFrame + 1;
								break;
							case 'loop' :
								this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? 0 : this.currentFrame + 1;
								break;
							case 'reverse' :
								this.running = (this.currentFrame + 1 >= this.frames.length) ? 'backward' : 'forward';
								this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? this.currentFrame : this.currentFrame + 1;
								break;
							}
						this.lastCalled = Date.now();
						}
					break;
				case 'backward' :
					if(changeFrame){
						switch(this.loop){
							case 'pause' :
								break;
							case 'end' :
								this.running = (this.currentFrame - 1 <= 0) ? 'complete' : this.running;
								this.currentFrame = (this.currentFrame - 1 <= 0) ? this.currentFrame : this.currentFrame - 1;
								break;
							case 'loop' :
								this.currentFrame = (this.currentFrame - 1 <= 0) ? this.frames.length - 1 : this.currentFrame - 1;
								break;
							case 'reverse' :
								this.running = (this.currentFrame - 1 <= 0) ? 'forward' : 'backward';
								this.currentFrame = (this.currentFrame - 1 <= 0) ? this.currentFrame : this.currentFrame - 1;
								break;
							}
						this.lastCalled = Date.now();
						}
					break;
				}
			}
		return {
			copyX: this.frames[this.currentFrame].x,
			copyY: this.frames[this.currentFrame].y,
			copyWidth: this.frames[this.currentFrame].w,
			copyHeight: this.frames[this.currentFrame].h,
			};
		};

	return my;
	}(scrawl));
