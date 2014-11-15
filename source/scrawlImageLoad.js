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


if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'imageload')) {
	var scrawl = (function(my) {
		'use strict';

		/**
    # window.scrawl

    scrawlImages module adaptions to the Scrawl library object

    ## New library sections

    * scrawl.image - for Image objects
    * scrawl.img - linking to copies of DOM &lt;img&gt; elements - links to the original elements are stored in scrawl.object
    * scrawl.anim - for SpriteAnimation objects

    @class window.scrawl_Images
    **/

		/**
    DOM document fragment
    @property imageFragment
    @type {Object}
    @private
    **/
		my.imageFragment = document.createDocumentFragment();
		/**
    Utility canvas - never displayed
    @property imageCanvas
    @type {CasnvasObject}
    @private
    **/
		my.imageCanvas = document.createElement('canvas');
		my.imageCanvas.id = 'imageHiddenCanvasElement';
		my.imageFragment.appendChild(my.imageCanvas);
		/**
    Utility canvas 2d context engine
    @property imageCvx
    @type {CasnvasContextObject}
    @private
    **/
		my.imageCvx = my.imageCanvas.getContext('2d');
		/**
    A __factory__ function to generate new ScrawlImage objects
    @method newImage
    @param {Object} items Key:value Object argument for setting attributes
    @return ScrawlImage object
    @private
    **/
		my.newImage = function(items) {
			return new my.Image(items);
		};
		/**
    A __factory__ function to generate new SpriteAnimation objects
    @method newSpriteAnimation
    @param {Object} items Key:value Object argument for setting attributes
    @return SpriteAnimation object
    **/
		my.newSpriteAnimation = function(items) {
			return new my.SpriteAnimation(items);
		};
		my.workimg = {
			v1: my.newVector(),
		};
		my.pushUnique(my.sectionlist, 'image');
		my.pushUnique(my.nameslist, 'imagenames');
		my.pushUnique(my.sectionlist, 'video');
		my.pushUnique(my.nameslist, 'videonames');
		my.pushUnique(my.sectionlist, 'spriteanimation');
		my.pushUnique(my.nameslist, 'spriteanimationnames');
		my.pushUnique(my.sectionlist, 'asset');
		my.pushUnique(my.nameslist, 'assetnames');
		/**
    A __general__ function to generate Image wrapper objects for &lt;img&gt;, &lt;video&gt; or &lt;svg&gt; elements identified by class string
    @method getImagesByClass
    @param {String} classtag Class string value of DOM objects to be imported into the scrawl library
    @param {Boolean} [kill] when set to true, the &lt;img&gt; elements will be removed from the DOM when imported into the library
    @return Array of String names; false on failure
    **/
		my.getImagesByClass = function(classtag, kill) {
			if (classtag) {
				var names = [],
					s = document.getElementsByClassName(classtag),
					myImg;
				if (s.length > 0) {
					for (var i = s.length; i > 0; i--) {
						myImg = my.newImage({
							element: s[i - 1],
							removeImageFromDOM: my.xtGet([kill, true]),
						});
						names.push(myImg.name);
					}
					return names;
				}
			}
			console.log('my.getImagesByClass() failed to find any <img> elements of class="' + classtag + '" on the page');
			return false;
		};
		/**
    A __general__ function to generate a Image wrapper object for an &lt;img&gt;, &lt;video&gt; or &lt;svg&gt; element identified by an id string
    @method getImageById
    @param {String} idtag Id string value of DOM object to be imported into the scrawl library
    @param {Boolean} [kill] when set to true, the &lt;img&gt; element will be removed from the DOM when imported into the library
    @return String name; false on failure
    **/
		my.getImageById = function(idtag, kill) {
			if (idtag) {
				var myImg = my.newImage({
					element: document.getElementById(idtag), //unrecorded flag for triggering Image stuff
					removeImageFromDOM: my.xtGet([kill, true]),
				});
				return myImg.name;
			}
			console.log('my.getImagesByClass() failed to find any <img> elements of class="' + classtag + '" on the page');
			return false;
		};

		/**
    # Image

    ## Instantiation

    * scrawl.getImagesByClass()

    ## Purpose

    * Wraps DOM &lt;img&gt; elements imported into the scrawl library
    * Used by __Picture__ entitys and __Pattern__ designs

    ## Access

    * scrawl.image.IMAGENAME - for the Image object
    * scrawl.asset.IMAGENAME - for a link to the original &lt;img&gt; element

    @class Image
    @constructor
    @extends Base
    @param {Object} [items] Key:value Object argument for setting attributes
    **/
		my.Image = function(items) {
			// assume: 
			// - items.element is an <img> element (containing dimensions data either in direct attributes, or in style attributes)
			// - items.data is an imageDataURL object (with width, height, data attributes)
			// - items.url is a string url for dynamically loading an image
			// at least one of .element, .data or .url must be presented in the items object; failure to present any will lead to a false return
			// if more than one is presented, then processing priority is: .element > .data > .url
			// in all cases, the final product will be: 
			// - the <img> element (or a clone of it) attached as a child element to the shadow DOM fragment scrawl.imageFragment
			// - a reference (getElementById) to the <img> element in scrawl.assets[name]
			// - a scrawl.image[name] object that wraps the <img> element
			//   - the image wrapper should contain data about the image's actual width and height

			items = my.safeObject(items);
			var tempname;
			this.width = 0;
			this.height = 0;
			if (my.xto([items.element, items.data, items.url])) {
				if (my.xt(items.element)) {
					items.name = my.xtGet([items.name, items.element.getAttribute('id'), items.element.getAttribute('name'), '']);
				}
				else if (my.xt(items.data)) {
					items.name = my.xtGet([items.name, '']);
				}
				else if (my.xt(items.url)) {
					tempname = items.url.replace('.', '-');
					items.name = my.xtGet([items.name, tempname, '']);
				}
				my.Base.call(this, items);
				my.image[this.name] = this;
				my.pushUnique(my.imagenames, this.name);
				// assume that all work associated with moving/assigning/building the <img> element will be asynchronous
				// - it's up to Pattern and Picture objects to check the Image wrapper width/height data > 0 before attempting to use the image
				if (my.xt(items.element)) {
					this.addImageByElement(items);
				}
				else if (my.xt(items.data)) {
					this.addImageByData(items);
				}
				else if (my.xt(items.url)) {
					this.addImageByUrl(items);
				}
				return this;
			}
			return false;
			// items = my.safeObject(items);
			// var url,
			//     el,
			//     kill = my.xtGet([items.removeImageFromDOM, true]);
			// if (my.xt(items.element)) {
			//     console.log(items.element);
			//     if (my.isa(items.element, 'img')) {
			//         items.name = my.xtGet([items.name, items.element.getAttribute('id'), items.element.getAttribute('name'), '']);
			//         my.Base.call(this, items);
			//         this.width = parseFloat(my.xtGet([items.width, items.element.offsetWidth, items.element.width, items.element.style.width, 0]));
			//         this.height = parseFloat(my.xtGet([items.height, items.element.offsetHeight, items.element.height, items.element.style.height, 0]));
			//         if (kill) {
			//             el = items.element;
			//         }
			//         else {
			//             el = items.element.cloneNode();
			//             items.name = el.id;
			//             my.Base.call(this, items);
			//             el.id = this.name;
			//         }
			//     }
			//     else {
			//         items.name = my.xtGet([items.name, '']);
			//         my.Base.call(this, items);
			//         this.width = parseFloat(my.xtGet([items.width, items.element.width, 0]));
			//         this.height = parseFloat(my.xtGet([items.height, items.element.height, 0]));
			//         url = items.element;
			//         el = this.makeImage(url, this.name, this.width, this.height, items.callback);
			//         items.callback = false;
			//     }
			//     my.imageFragment.appendChild(el);
			//     my.asset[this.name] = el;
			//     my.pushUnique(my.assetnames, this.name);
			//     my.image[this.name] = this;
			//     my.pushUnique(my.imagenames, this.name);
			//     return this;
			// }
			// return false;
		};
		my.Image.prototype = Object.create(my.Base.prototype);
		/**
    @property type
    @type String
    @default 'Image'
    @final
    **/
		my.Image.prototype.type = 'Image';
		my.Image.prototype.classname = 'imagenames';
		my.d.Image = {
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
    Constructor/clone flag - if set to true (default), will remove the &lt;img&gt; element from the web page DOM

    _This attribute is not retained by the object_
    @property removeImageFromDOM 
    @type Boolean
    @default true
    **/
			/**
    Constructor/clone function - some functions can call the Image constructor with a callback function

    _This attribute is not retained by the object_
    @property callback 
    @type function
    @default undefined - callback is always removed once run
    **/
			/**
    Constructor argument attribute - a DOM &lt;img&gt; element

    _This attribute is not retained by the object_
    @property element 
    @type Object
    @default undefined
    **/
			/**
    Constructor argument attribute - a canvas imageData object

    _This attribute is not retained by the object_
    @property data 
    @type Object
    @default undefined
    **/
			/**
    Constructor argument attribute - a String URL for dynamically loading an image

    _This attribute is not retained by the object_
    @property url 
    @type Object
    @default undefined
    **/
		};
		my.mergeInto(my.d.Image, my.d.Base);
		/**
    Adds a DOM &lt;img&gt; element to the library

    * items.element MUST be a reference to the element, and the element MUST be present in the DOM

    @method addImageByElement
    @param {Object} [items] Key:value Object argument for setting attributes
    @return always true
    @private
    **/
		my.Image.prototype.addImageByElement = function(items) {
			var el,
				kill = my.xtGet([items.removeImageFromDOM, true]);
			if (kill) {
				el = items.element;
			}
			else {
				el = items.element.cloneNode();
			}
			el.id = this.name;
			my.imageFragment.appendChild(el);
			my.asset[this.name] = my.imageFragment.getElementById(this.name);
			my.pushUnique(my.assetnames, this.name);
			this.width = parseFloat(my.xtGet([el.offsetWidth, el.width, el.style.width, 0]));
			this.height = parseFloat(my.xtGet([el.offsetHeight, el.height, el.style.height, 0]));
			// callback code here
			return true;
		};
		/**
    Creates a new &lt;img&gt; element from a canvas ImageData object

    @method addImageByData
    @param {Object} [items] Key:value Object argument for setting attributes
    @return always true
    @private
    **/
		my.Image.prototype.addImageByData = function(items) {
			// var image = document.createElement('img'),
			//     old = my.imageFragment.querySelector('#' + id);
			// image.width = width || data.width;
			// image.height = height || data.height;
			// image.id = id;
			// image.onload = function() {
			//     if (old) {
			//         my.imageFragment.removeChild(old);
			//     }
			//     if (my.isa(callback, 'fn')) {
			//         callback();
			//     }
			// };
			// image.src = data;
			// return image;
		};
		/**
    Import an image using the supplied url string

    @method addImageByUrl
    @param {Object} [items] Key:value Object argument for setting attributes
    @return true; false on failure
    @private
    **/
		my.Image.prototype.addImageByUrl = function(items) {
			var el;
			if (my.isa(items.url, 'str')) {
				el = document.createElement('img');
				el.id = this.name;
				el.onload = function() {
					my.imageFragment.appendChild(el);
					my.asset[this.name] = my.imageFragment.getElementById(this.name);
					my.pushUnique(my.assetnames, this.name);
					this.width = parseFloat(my.xtGet([el.offsetWidth, el.width, el.style.width, 0]));
					this.height = parseFloat(my.xtGet([el.offsetHeight, el.height, el.style.height, 0]));
					// callback code here
				};
				el.src = items.url;
				return true;
			}
			return false;
		};

		/**
    Makes a virtual image from an imageDataUrl

    @method makeImage
    @param {Object} data The imageDataUrl data
    @return new DOM &lt;img&gt; object
    @private
    **/
		my.Image.prototype.makeImage = function(data, id, width, height, callback) {
			var image = document.createElement('img'),
				old = my.imageFragment.querySelector('#' + id);
			image.width = width || data.width;
			image.height = height || data.height;
			image.id = id;
			image.onload = function() {
				if (old) {
					my.imageFragment.removeChild(old);
				}
				if (my.isa(callback, 'fn')) {
					callback();
				}
			};
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
		my.Image.prototype.getImageDataUrl = function(image, putdata) {
			var result;
			putdata = (my.xt(putdata)) ? putdata : false;
			my.imageCanvas.width = (putdata) ? image.width : this.width;
			my.imageCanvas.height = (putdata) ? image.height : this.height;
			if (putdata) {
				my.imageCvx.putImageData(image, 0, 0);
			}
			else {
				my.imageCvx.drawImage(image, 0, 0);
			}
			result = my.imageCanvas.toDataURL('image/png');
			return result;
		};
		/**
    Get image data - uses JavScript canvas API function ctx.getImageData()

    _Note: does not save the data in the scrawl library_
    @method getImageData
    @param {Boolean} [source] When true, retrieves image data from the source image; default is false
    @return getImageData data object
    @private
    **/
		my.Image.prototype.getImageData = function() {
			var result;
			my.imageCanvas.width = this.width;
			my.imageCanvas.height = this.height;
			my.imageCvx.drawImage(my.asset[this.name], 0, 0);
			result = my.imageCvx.getImageData(0, 0, this.width, this.height);
			return result;
		};
		/**
    Clone an Image object

    Also clones the virtual &lt;img&gt; element associated with the EntityImage
    @method clone
    @param {Object} [items] Key:value Object argument for setting attributes
    @return new Image object on success; false otherwise
    **/
		my.Image.prototype.clone = function(items) {
			items = my.safeObject(items);
			items.element = my.asset[this.name];
			var result = my.newImage(items);
			return result;
		};

		/**
    # SpriteAnimation

    ## Instantiation

    * scrawl.newSpriteAnimation()

    ## Purpose

    * wraps a entity sheet image
    * acts as the link between a Picture object and the entity images on the entity sheet
    * holds data about cells in the entitysheet animation
    * controls the animation playback

    ## Access

    * scrawl.spriteanimation.SPRITEANIMATIONNAME
    * scrawl.spriteanimation.[scrawl.entity.PICTURENAME.spriteAnimation]

    SpriteAnimation attributes can also be set and retrieved directly using Picture.get() and Picture.set() functions, where a Picture entity is associated with the SpriteAnimation object via its .animSheet attribute

    @class SpriteAnimation
    @constructor
    @extends Base
    @param {Object} [items] Key:value Object argument for setting attributes
    **/
		my.SpriteAnimation = function(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.frames = (my.xt(items.frames)) ? [].concat(items.frames) : [];
			this.currentFrame = items.currentFrame || 0;
			this.speed = (my.isa(items.speed, 'num')) ? items.speed : 1;
			this.loop = (my.isa(items.loop, 'str')) ? items.loop : 'end';
			this.running = (my.isa(items.running, 'str')) ? items.running : 'complete';
			this.lastCalled = (my.xt(items.lastCalled)) ? items.lastCalled : Date.now();
			my.spriteanimation[this.name] = this;
			my.pushUnique(my.spriteanimationnames, this.name);
			return this;
		};
		my.SpriteAnimation.prototype = Object.create(my.Base.prototype);
		/**
    @property type
    @type String
    @default 'SpriteAnimation'
    @final
    **/
		my.SpriteAnimation.prototype.type = 'SpriteAnimation';
		my.SpriteAnimation.prototype.classname = 'spriteanimationnames';
		my.d.SpriteAnimation = {
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
    Datestamp when SpriteAnimation.getData() function was last called
    @property lastCalled
    @type Date
    @default 0
    @private
    **/
			lastCalled: 0,
		};
		my.animKeys = Object.keys(my.d.SpriteAnimation);
		my.mergeInto(my.d.SpriteAnimation, my.d.Scrawl);
		/**
    Set attribute values - will also set the __currentFrame__ attribute to the appropriate value when the running __attribute__ is changed

    (Only used by SpriteAnimation objects)
    @method set
    @param {Object} items Object containing attribute key:value pairs
    @return This
    @chainable
    @private
    **/
		my.SpriteAnimation.prototype.set = function(items) {
			items = my.safeObject(items);
			var paused = (this.loop === 'pause') ? true : false;
			my.Base.prototype.set.call(this, items);
			if (my.xt(items.running)) {
				switch (items.running) {
					case 'forward':
						this.running = 'forward';
						if (!paused) {
							this.currentFrame = 0;
						}
						break;
					case 'backward':
						this.running = 'backward';
						if (!paused) {
							this.currentFrame = this.frames.length - 1;
						}
						break;
					default:
						this.running = 'complete';
						this.currentFrame = 0;
						break;
				}
			}
			return this;
		};
		/**
    Returns an Object in the form {copyX:Number, copyY:Number, copyWidth:Number, copyHeight:Number}, representing the coordinates and dimensions of the current frame to be displayed by a Picture entity

    (Only used by SpriteAnimation objects)
    @method getData
    @return Data object
    @private
    **/
		my.SpriteAnimation.prototype.getData = function() {
			if (this.speed > 0) {
				var interval = this.frames[this.currentFrame].d / this.speed;
				var changeFrame = (this.lastCalled + interval < Date.now()) ? true : false;
				switch (this.running) {
					case 'complete':
						this.lastCalled = Date.now();
						break;
					case 'forward':
						if (changeFrame) {
							switch (this.loop) {
								case 'pause':
									break;
								case 'end':
									this.running = (this.currentFrame + 1 >= this.frames.length) ? 'complete' : this.running;
									this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? this.currentFrame : this.currentFrame + 1;
									break;
								case 'loop':
									this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? 0 : this.currentFrame + 1;
									break;
								case 'reverse':
									this.running = (this.currentFrame + 1 >= this.frames.length) ? 'backward' : 'forward';
									this.currentFrame = (this.currentFrame + 1 >= this.frames.length) ? this.currentFrame : this.currentFrame + 1;
									break;
							}
							this.lastCalled = Date.now();
						}
						break;
					case 'backward':
						if (changeFrame) {
							switch (this.loop) {
								case 'pause':
									break;
								case 'end':
									this.running = (this.currentFrame - 1 <= 0) ? 'complete' : this.running;
									this.currentFrame = (this.currentFrame - 1 <= 0) ? this.currentFrame : this.currentFrame - 1;
									break;
								case 'loop':
									this.currentFrame = (this.currentFrame - 1 <= 0) ? this.frames.length - 1 : this.currentFrame - 1;
									break;
								case 'reverse':
									this.running = (this.currentFrame - 1 <= 0) ? 'forward' : 'backward';
									this.currentFrame = (this.currentFrame - 1 <= 0) ? this.currentFrame : this.currentFrame - 1;
									break;
							}
							this.lastCalled = Date.now();
						}
						break;
				}
			}
			return this.frames[this.currentFrame];
		};

		return my;
	}(scrawl));
}
