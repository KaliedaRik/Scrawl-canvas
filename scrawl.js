/**
# SCRAWL.JS Library

## Version 2.01 - 17 March 2014

Developed by Rik Roots - <rik.roots@gmail.com>, <rik@rikweb.org.uk>

Scrawl demo website: <http://scrawl.rikweb.org.uk>

## Purpose and features

* Scrawl.js is a JavaScript library which adds an API for handling and manipulating HTML5 &lt;canvas&gt; elements in the DOM.

* Uses the '2d' context with each canvas element.

* On starting, Scrawl.js investigates the HTML DOM and automatically creates controller and wrapper objects for each &lt;canvas&gt; element it finds.

* Can also generate visible canvas elements programatically, and add them to the DOM.

* Users create sprite and gradient objects using scrawl factory functions, set their styling and position, and render them onto the canvas element. Creation, positioning and styling can all be handled by a single call to the factory function.

* Sprites include: basic rectangles (Block), advanced rectangles capable of displaying images and sprite animations (Picture), circles (Wheel), single-line text (Phrase), and complex designs composed of lines, arcs and curves (Shape, Outline).

* Factory functions can be used to easily create lines, curves and regular shapes (triangles, stars, etc).

* JPG, PNG and SVG images (and videos - experimental) can be imported and used by Picture sprites.

* Animations can be achieved by manipulating a sprite/gradient's attributes within a user-coded animation loop.

* Scrawl.js supports all canvas 2d matrix transforms (translate, rotate, etc), though moving and rotating sprites is handled directly by the sprite object itself.

* All sprites - and even gradients - can be given drag-and-drop, and attach-to-mouse, functionality.

* Scrawl sprites can be grouped together for easier manipulation.

* Sprites can also be linked together directly (using their pivot attribute) so that positioning/moving one sprite will position/move all other sprites associated with it.

* Full support for collision detection between, and within, sprites gathered into groups. Collision fields can be generated for canvas elements to constrain sprite movements.

* A visible canvas can be linked to additional (non-DOM/invisible) canvases to create complex, multi-layered displays; these additional canvases can also be manipulated for animation purposes.

* Canvas rendering can be simple, or it can be broken down into clear, compile and show operations for more complex compositions.

* Includes functionality to manipulate multiple visible canvas elements in 3 dimensions using CSS 3d transforms - where supported by the browser.

* Other DOM elements - including SVG images - can be included in Scrawl stacks, and manipulated via Scrawl.js functionality. 

* Canvases and elements in a Scrawl.js stack (including other stacks) can be moved and scaled very easily.

* (Does not add canvas functionality to those browsers that do not support the HTML5 &lt;canvas&gt; element. Tested in: IE9-11, and modern versions of 
Firefox, Chrome, Opera, Safari for Windows.)

## Amendments to JavaScript objects

__window.requestAnimFrame__ - automatically set to use the Paul Irish shim
	
__window.onmousemove__ - the first time a program uses the Pad.getMouse() function, Scrawl.js attaches a small mouse tracking function to window.onmousemove
	
__window.scrawl__ - the Scrawl.js library object

@module scrawl
**/

//COMMENT OUT for production
"use strict";

// requestAnimFrame from Paul Irish - http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(callback){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback){window.setTimeout(callback, 1000/60);};
	})();

/**
# window.scrawl

_Note: use lowecase s - 'scrawl' (and no underscore)_

## Purpose:

* Holds links to every substantive object created by Scrawl.js and user code
* Also holds links to key DOM objects
* Includes factory functions for creating Sprites, canvas elements, etc
* Generalist functions for loading canvases, stacks, images etc on startup, as directed by the HTML code
* Shorthand functions for rendering canvases
* Some general helper functions for testing variables that can be used by coders 

@class _scrawl
**/

window.scrawl = (function(){
	var scrawl = {
	
/**
Scrawl object type
@property type
@type {String}
@default Library
@final
**/
		type: 'Library',
		
/**
Scrawl.js version number
@property version
@type {String}
@default 2.00
@final
**/
		version: '2.00',
		
/**
Contains key:value pairs for storing miscellaneous objects, for instance handles to DOM image elements imported into scrawl via scrawl.getImagesByClass()
@property object
@type {Object}
**/
		object: {},
		
/**
Contains scrawl.object key Strings
@property objectnames
@type {Array}
**/
		objectnames: [],
		
/**
Contains PADNAME:Object pairs for each instantiated Pad object
@property pad
@type {Object}
**/
		pad: {},
		
/**
Contains scrawl.pad key Strings
@property padnames
@type {Array}
**/
		padnames: [],
		
/**
The currently active PADNAME
@property currentPad
@type {String}
**/
		currentPad: null,
		
/**
Contains CELLNAME:Object pairs for each instantiated Cell object
@property cell
@type {Object}
**/
		cell: {},
		
/**
Contains CELLNAME:object pairs linking to each Cell object's DOM &lt;canvas&gt; element
@property canvas
@type {Object}
**/
		canvas: {},
		
/**
Contains CELLNAME:Object pairs linking to each &lt;canvas&gt; element's context engine
@property context
@type {Object}
**/
		context: {},
		
/**
Contains scrawl.cell key Strings
@property cellnames
@type {Array}
**/
		cellnames: [],
		
/**
Contains CONTEXTNAME:Object pairs linking to each instantiated Context object
@property ctx
@type {Object}
**/
		ctx: {},
		
/**
Contains scrawl.ctx key Strings
@property ctxnames
@type {Array}
**/
		ctxnames: [],
		
/**
Contains SCRAWLIMAGENAME:Object pairs linking to each instantiated ScrawlImage object
@property image
@type {Object}
**/
		image: {},
		
/**
Contains SCRAWLIMAGENAME:Object pairs linking to JavaScript image data objects
@property imageData
@type {Object}
**/
		imageData: {},
		
/**
Contains SCRAWLIMAGENAME:object pairs linking to each scrawlImageObject's DOM &lt;img&gt;, &lt;svg&gt; or &lt;video&gt; element
@property img
@type {Object}
**/
		img: {},
		
/**
Contains scrawl.image key Strings
@property imagenames
@type {Array}
**/
		imagenames: [],
		
/**
Contains GROUPNAME:Object pairs linking to each instantiated Group object
@property group
@type {Object}
**/
		group: {},
		
/**
Contains scrawl.group key Strings
@property groupnames
@type {Array}
**/
		groupnames: [],
		
/**
Contains DESIGNNAME:Object pairs for each instantiated design object (Gradient, RadialGradient, Pattern, Color)
@property design
@type {Object}
**/
		design: {},
		
/**
Contains DESIGNNAME:precompiled gradient/pattern context object pairs (Gradient, RadialGradient, Pattern)
@property dsn
@type {Object}
**/
		dsn: {},
		
/**
Contains scrawl.design key Strings
@property designnames
@type {Array}
**/
		designnames: [],
		
/**
Contains SPRITENAME:Object pairs for each instantiated sprite object (Block, Phrase, Picture, Wheel, Outline, Shape, Particle)
@property sprite
@type {Object}
**/
		sprite: {},
		
/**
Contains scrawl.sprite key Strings
@property spritenames
@type {Array}
**/
		spritenames: [],
		
/**
Contains POINTNAME:object pairs for each instantiated Point object
@property point
@type {Object}
**/
		point: {},
		
/**
Contains scrawl.point key Strings
@property pointnames
@type {Array}
**/
		pointnames: [],
		
/**
Contains LINKNAME:Object pairs for each instantiated Link object
@property link
@type {Object}
**/
		link: {},
		
/**
Contains scrawl.link key Strings
@property linknames
@type {Array}
**/
		linknames: [],
		
/**
Contains ANIMSHEETNAME:Object pairs for each instantiated AnimSheet object
@property anim
@type {Object}
**/
		anim: {},
		
/**
Contains scrawl.anim key Strings
@property animnames
@type {Array}
**/
		animnames: [],
		
/**
Contains ANIMATIONNAME:Object pairs for each instantiated Animation object
@property animation
@type {Object}
**/
		animation: {},
		
/**
Contains scrawl.animation key Strings
@property animationnames
@type {Array}
**/
		animationnames: [],
		
/**
Contains TEXTNAME:object pairs for each instantiated Text object
@property text
@type {Object}
@private
**/
		text: {},
		
/**
Contains scrawl.text key Strings
@property textnames
@type {Array}
@private
**/
		textnames: [],
		
/**
Contains STACKNAME:object pairs for each instantiated Stack object
@property stack
@type {Object}
**/
		stack: {},
		
/**
Contains STACKNAME:Object pairs linking to each Stack object's DOM &lt;div&gt; element
@property stk
@type {Object}
**/
		stk: {},
		
/**
Contains scrawl.stack key Strings
@property stacknames
@type {Array}
**/
		stacknames: [],
		
/**
Contains ELEMENTNAME:Object pairs for each instantiated Element Object
@property element
@type {Object}
**/
		element: {},
		
/**
Contains ELEMENTNAME:Object pairs linking to each Element object's DOM element
@property elm
@type {Object}
**/
		elm: {},
		
/**
Contains scrawl.element key Strings
@property elementnames
@type {Array}
**/
		elementnames: [],
		
/**
Contains SPRINGNAME:Object pairs for each instantiated Spring object
@property spring
@type {Object}
**/
		spring: {},
		
/**
Contains scrawl.spring key Strings
@property springnames
@type {Array}
**/
		springnames: [],
		
/**
Contains FORCENAME:Object pairs for each instantiated Force object
@property force
@type {Object}
**/
		force: {},
		
/**
Contains scrawl.force key Strings
@property forcenames
@type {Array}
**/
		forcenames: [],
		
/**
Contains scrawl Object key Strings
@property nameslist
@type {Array}
@private
**/
		nameslist: ['objectnames', 'padnames', 'cellnames', 'imagenames', 'groupnames', 'designnames', 'spritenames', 'pointnames', 'linknames', 'ctxnames', 'animnames', 'animationnames', 'textnames', 'stacknames', 'elementnames', 'springnames', 'forcenames'],
		
/**
For converting between degrees and radians
@property radian
@type {Number}
@default Math.PI/180
@final
**/
		radian: Math.PI/180,
		
/**
Holds the current cursor x position on the web page
@property mouseX
@type {Number}
@private
**/
		mouseX: 0,
		
/**
Holds the current cursor y position on the web page
@property mouseY
@type {Number}
@private
**/
		mouseY: 0,
		
/**
Contains attribute key Strings specific to the Context object 
@property contextKeys
@type {Array}
@private
**/
		contextKeys: [],
		
/**
Contains attribute key Strings specific to the AnimSheet object 
@property animKeys
@type {Array}
@private
**/
		animKeys: [],
		
/**
An Object containing OBJECTTYPE:Object pairs which in turn contain default values for each Scrawl object   
@property d
@type {Object}
@private
**/
		d: {},
		
/**
Backoffice canvas element - never displayed
@property cv
@type {DOM Object}
@private
**/
		cv: document.createElement('canvas'),
		
/**
Backoffice canvas element context
@property cvx
@type {2dCanvas object}
@private
**/
		cvx: null,
		
/**
An Object containing parameter:value pairs representing the physical parameters within which a physics model operates
@property physics
@type {Object}
**/
		physics: {
/**
Gravity - positive values are assumed to act downwards from the top of the &lt;canvas&gt; element. Measured in meters per second squared
@property physics.gravity
@type Number
@default 9.8
**/		
			gravity: 9.8,
/**
Air density, measured in kilograms per cubic meter; default is air density at seal level
@property physics.airDensity
@type Number
@default 1.23
**/		
			airDensity: 1.23,
/**
Change in time since last update, measured in seconds
@property physics.deltaTime
@type Number
@default 0
**/		
			deltaTime: 0,
			},
		
/**
A __utility__ function that adds the attributes of the additive object to those of the reference object, where those attributes don't already exist in the reference object
@method mergeInto
@param {Object} o1 reference object
@param {Object} o2 additive object
@return merged object
**/
		mergeInto: function(o1, o2){
			for(var key in o2){
				if(o2.hasOwnProperty(key) && !scrawl.xt(o1[key])){
					o1[key] = o2[key];
					}
				}
			return o1;
			},
			
/**
A __utility__ function that adds the attributes of the additive object to those of the reference object, overwriting attributes where necessary
@method mergeOver
@param {Object} o1 reference object
@param {Object} o2 additive object
@return merged object
**/
		mergeOver: function(o1, o2){
			for(var key in o2){
				if(o2.hasOwnProperty(key)){
					o1[key] = o2[key];
					}
				}
			return o1;
			},
			
/**
A __utility__ function that checks an array to see if it contains a given value
@method contains
@param {Array} item Reference array
@param {Mixed} k value to be checked
@return true if value is in array; false otherwise
**/
		contains: function(item, k){
			for(var p in item){
				if(item[p] === k) return true;
				}
			return false;
			},

/**
A __utility__ function that adds a value to an array if the array doesn't already contain an element with that value
@method pushUnique
@param {Array} item Reference array
@param {Mixed} o value to be added to array
@return true if value is added to the array; false otherwise
**/
		pushUnique: function(item, o){
			if(!this.contains(item, o)){
				item.push(o);
				return true;
				}
			return false;
			},

/**
A __utility__ function that removes a value from an array
@method removeItem
@param {Array} item Reference array
@param {Mixed} o value to be removed from array
@return true if value is removed from the array; false otherwise
**/
		removeItem: function(item, o){
			if(this.contains(item, o)){
				var i = item.indexOf(o);
				item.splice(i, 1);
				return true;
				}
			return false;
			},

/**
A __utility__ function that checks to see if a number is between two other numbers
@method isBetween
@param {Number} no Reference number
@param {Number} a Minimum or maximum number
@param {Number} b Maximum or minimum number
@param {Boolean} [e] If true, reference number can equal maximum/minimum number; on false, number must lie between the maximum and minimum (default: false)
@return true if value is between maximum and minimum; false otherwise
**/
		isBetween: function(no, a, b, e){
			if(a>b){var t=a; a=b; b=t;}
			if(e){
				if(no >= a && no <= b){
					return true;
					}
				return false;
				}
			else{
				if((no > a && no < b) || (no === a && no === b)){
					return true;
					}
				return false;
				}
			},

/**
A __private__ function to generate a controller object for a visible DOM &lt;canvas&gt; element
@method newPad
@param {Object} items Initial attribute values for new object
@return new Pad object
@private
**/
		newPad: function(items){return new Pad(items);},
		
/**
A __private__ function to generate a wrapper object for a DOM &lt;div&gt; stack element
@method newStack
@param {Object} items Initial attribute values for new object
@return new Stack object
@private
**/
		newStack: function(items){return new Stack(items);},
		
/**
A __private__ function to generate a wrapper object for a DOM element within a scrawl stack
@method newElement
@param {Object} items Initial attribute values for new object
@return new Element object
@private
**/
		newElement: function(items){return new Element(items);},
		
/**
A __private__ function to generate a wrapper object for a DOM &lt;canvas&gt; element
@method newCell
@param {Object} items Initial attribute values for new object
@return new Cell object
@private
**/
		newCell: function(items){return new Cell(items);},
		
/**
A __private__ function to generate a wrapper object for a DOM &lt;img&gt;, &lt;video&gt or &lt;svg&gt; element
@method newImage
@param {Object} items Initial attribute values for new object
@return new ScrawlImage object
@private
**/
		newImage: function(items){return new ScrawlImage(items);},
		
/**
A __factory__ function to generate a new Group object
@method newGroup
@param {Object} items Initial attribute values for new object
@return new Group object
**/
		newGroup: function(items){return new Group(items);},
		
/**
A __factory__ function to generate a new Phrase sprite object
@method newPhrase
@param {Object} items Initial attribute values for new object
@return new Phrase object
**/
		newPhrase: function(items){return new Phrase(items);},
		
/**
A __factory__ function to generate a new Block sprite object
@method newBlock
@param {Object} items Initial attribute values for new object
@return new Block object
**/
		newBlock: function(items){return new Block(items);},
		
/**
A __factory__ function to generate a new Wheel sprite object
@method newWheel
@param {Object} items Initial attribute values for new object
@return new Wheel object
**/
		newWheel: function(items){return new Wheel(items);},
		
/**
A __factory__ function to generate a new Picture sprite object
@method newPicture
@param {Object} items Initial attribute values for new object
@return new Picture object
**/
		newPicture: function(items){return new Picture(items);},
		
/**
A __factory__ function to generate a new Outline sprite object
@method newOutline
@param {Object} items Initial attribute values for new object
@return new Outline object
**/
		newOutline: function(items){return new Outline(items);},
		
/**
A __private__ function to generate a new Shape sprite object; useless on its own - a Shape sprite needs Link and Point objects to determine its path
@method newShape
@param {Object} items Initial attribute values for new object
@return new Shape object
@private
**/
		newShape: function(items){return new Shape(items);},
		
/**
A __private__ function to generate a new Point object; useless on its own - Point objects contribute to Shape objects
@method newPoint
@param {Object} items Initial attribute values for new object
@return new Point object
@private
**/
		newPoint: function(items){return new Point(items);},
		
/**
A __private__ function to generate a new Link object; useless on its own - Link objects contribute to Shape objects
@method newLink
@param {Object} items Initial attribute values for new object
@return new Link object
@private
**/
		newLink: function(items){return new Link(items);},
		
/**
A __factory__ function to generate a new AnimSheet object
@method newAnimSheet
@param {Object} items Initial attribute values for new object
@return new AnimSheet object
**/
		newAnimSheet: function(items){return new AnimSheet(items);},
		
/**
A __factory__ function to generate a new Animation object
@method newAnimation
@param {Object} items Initial attribute values for new object
@return new Animation object
**/
		newAnimation: function(items){return new Animation(items);},
		
/**
A __factory__ function to generate a new Gradient design object
@method newGradient
@param {Object} items Initial attribute values for new object
@return new Gradient object
**/
		newGradient: function(items){return new Gradient(items);},
		
/**
A __factory__ function to generate a new RadialGradient design object
@method newRadialGradient
@param {Object} items Initial attribute values for new object
@return new RadialGradient object
**/
		newRadialGradient: function(items){return new RadialGradient(items);},
		
/**
A __factory__ function to generate a new Color design object
@method newColor
@param {Object} items Initial attribute values for new object
@return new Color object
**/
		newColor: function(items){return new Color(items);},
		
/**
A __factory__ function to generate a new Pattern design object
@method newPattern
@param {Object} items Initial attribute values for new object
@return new Pattern object
**/
		newPattern: function(items){return new Pattern(items);},
		
/**
A __factory function__ to generate a new Particle object

@method newParticle
@param {Object} items - initial attribute values for new object
@return new Particle object
**/
		newParticle: function(items){return new Particle(items);},
		
/**
A __factory__ function to generate a new Vector object
@method newVector
@param {Object} items - initial attribute values for new object
@return new Vector object
**/
		newVector: function(items){return new Vector(items);},
		
/**
A __factory__ function to generate a new Quaternion object
@method newQuaternion
@param {Object} items - initial attribute values for new object
@return new Quaternion object
**/
		newQuaternion: function(items){return new Quaternion(items);},
		
/**
A __factory__ function to generate a new Spring object
@method newSpring
@param {Object} items - initial attribute values for new object
@return new Spring object
**/
		newSpring: function(items){return new Spring(items);},
		
/**
A __factory__ function to generate a new Force object
@method newForce
@param {Object} items - initial attribute values for new object
@return new Force object
**/
		newForce: function(items){return new Force(items);},
		
/**
A __utility__ function for variable type checking
@method isa
@param item Primative or object for identification
@param {String} identifier One from: 'bool', 'num', 'str', 'fn', 'arr', 'date', 'obj'
@return True if item type matches the identifier
**/
		isa: function(item, identifier){
			if(this.xta([item, identifier])){
				var myId = identifier.toLowerCase();
				switch(myId){
					case 'num' :
						return (typeof item === 'number') ? true : false;
						break;
					case 'str' :
						return (typeof item === 'string') ? true : false;
						break;
					case 'bool' :
						return (typeof item === 'boolean') ? true : false;
						break;
					case 'fn' :
						return (typeof item === 'function') ? true : false;
						break;
					case 'arr' :
						return (Object.prototype.toString.call(item) === '[object Array]') ? true : false;
						break;
					case 'obj' :
						return (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
						break;
					case 'date' :
						return (Object.prototype.toString.call(item) === '[object Date]') ? true : false;
						break;
					default :
						return false;
					}
				}
			return false;
			},
			
/**
A __utility__ function for variable type checking
@method xt
@param item Primative or object for identification
@return False if item is 'undefined'
**/
		xt: function(item){
			return (typeof item !== 'undefined') ? true : false;
			},
			
/**
A __utility__ function for variable type checking
@method xta
@param {Array} item Array of primatives or objects for identification - argument can also be a String
@return False if any item is 'undefined'
**/
		xta: function(item){
			var a = [].concat(item);
			if(a.length > 0){
				for(var i=0, z=a.length; i<z; i++){
					if(typeof a[i] === 'undefined'){
						return false;
						}
					}
				return true;
				}
			return false;
			},
			
/**
A __utility__ function for variable type checking
@method xto
@param {Array} item Array of primatives or objects for identification - argument can also be a String
@return True if any item is not 'undefined'
**/
		xto: function(item){
			var a = [].concat(item);
			if(a.length > 0){
				for(var i=0, z=a.length; i<z; i++){
					if(typeof a[i] !== 'undefined'){
						return true;
						}
					}
				}
			return false;
			},
			
/**
A __private__ function to generate unique names for new Scrawl objects
@method makeName
@param {Object} [item] Object with attributes: name, type, target
@return Unique generated name
@private
**/
		makeName: function(item){
			item = (this.isa(item,'obj')) ? item : {};
			var o = {
				name: (this.isa(item.name,'str')) ? item.name : null,
				type: (this.isa(item.type,'str')) ? item.type : null,
				target: (this.isa(item.target,'str')) ? item.target : null,
				};
			if(this.contains(this.nameslist, o.target)){
				var name = o.name || o.type || 'default';
				var nameArray = name.split('~£!');
				var newname = (this.contains(this[o.target], nameArray[0])) ? nameArray[0]+'~£!'+Math.floor(Math.random()*100000000) : nameArray[0];
				return newname;
				}
			return false;
			},

/**
A __general__ function to generate ScrawlImage wrapper objects for &lt;img&gt;, &lt;video&gt; or &lt;svg&gt; elements identified by class string
@method getImagesByClass
@param {String} classtag Class string value of DOM objects to be imported into the scrawl library
@return Array of String names; false on failure
**/
		getImagesByClass: function(classtag){
			if(classtag){
				var names = [],
					s = document.getElementsByClassName(classtag);
				if(s.length > 0){
					for(var i=0, z=s.length; i<z; i++){
						var myImg = scrawl.newImage({
							element: s[i],							//unrecorded flag for triggering Image stuff
							});
						names.push(myImg.name);
						}
					return names;
					}
				}
			console.log('scrawl.getImagesByClass() failed to find any <img> elements of class="'+classtag+'" on the page');
			return false;
			},

/**
A __display__ function to ask Pads to get their Cells to clear their &lt;canvas&gt; elements
@method clear
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return True on success; false otherwise
**/
		clear: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].clear(command);
					}
				return true;
				}
			return false;
			},

/**
A __display__ function to ask Pads to get their Cells to clear their &lt;canvas&gt; elements using their background color
@method stampBackground
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return True on success; false otherwise
**/
		stampBackground: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].stampBackground(command);
					}
				return true;
				}
			return false;
			},

/**
A __display__ function to ask Pads to get their Cells to compile their scenes
@method compile
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return True on success; false otherwise
**/
		compile: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].compile(command);
					}
				return true;
				}
			return false;
			},

/**
A __display__ function to ask Pads to show the results of their latest display cycle
@method show
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return True on success; false otherwise
**/
		show: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].show(command);
					}
				return true;
				}
			return false;
			},

/**
A __display__ function to ask Pads to undertake a complete clear-compile-show display cycle
@method render
@param {Object} [command] Object with attributes: clear:COMMAND, compile:COMMAND, show:COMMAND - all are optional
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return True on success; false otherwise
**/
		render: function(command, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : this.padnames;
			if(p.length > 0){
				for(var i=0, z=p.length; i<z; i++){
					scrawl.pad[p[i]].render(command);
					}
				return true;
				}
			return false;
			},

/**
A __general__ function to reset the scrawl library properties to empty values; then call scrawl.initialize()
@method reset
@return Always true
**/
		reset: function(){
			this.doAnimation = false;
			this.objectnames = []; 
			this.stack = {}; this.stk = {}; this.stacknames = [];
			this.element = {}; this.elm = {}; this.elementnames = [];
			this.pad = {}; this.padnames = []; this.currentPad = null;
			this.cell = {}; this.canvas = {}; this.context = {}; this.cellnames = [];
			this.ctx = {}; this.ctxnames = []; this.image = {};
			this.imageData = {}; this.img = {}; this.imagenames = [];
			this.group = {}; this.groupnames = [];
			this.design = {}; this.dsn = {}; this.designnames = [];
			this.sprite = {}; this.spritenames = [];
			this.point = {}; this.pointnames = [];
			this.link = {}; this.linknames = [];
			this.anim = {}; this.animnames = [];
			this.animation = {}; this.animationnames = [];
			this.text = {}; this.textnames = [];
			this.spring = {}; this.springnames = [];
			this.force = {}; this.forcenames = [];
			this.initialize();
			return true;
			},

/**
A __general__ function which passes on requests to Pads to generate new &lt;canvas&gt; elements and associated objects
@method addNewCell
@param {Object} data Initial attribute values for new object
@param {String} pad PADNAME
@return New Cell object
**/
		addNewCell: function(data, pad){
			var p = (this.isa(pad,'str')) ? pad : this.currentPad;
			return scrawl.pad[p].addNewCell(data);
			},

/**
A __general__ function which deletes Cell objects and their associated paraphinalia
@method deleteCells
@param {Array} cells Array of CELLNAMEs - can also be a String
@return True on success; false otherwise
**/
		deleteCells: function(cells){
			if(this.xt(cells)){
				var c = [].concat(cells)
				for(var i=0, z=c.length; i<z; i++){
					for(var j=0, w=this.padnames.length; j<w; j++){
						this.pad[this.padnames[j]].deleteCell(c[i]);
						}
					delete this.group[c[i]];
					delete this.group[c[i]+'_field'];
					delete this.group[c[i]+'_fence'];
					scrawl.removeItem(this.groupnames, c[i]);
					scrawl.removeItem(this.groupnames, c[i]+'_field');
					scrawl.removeItem(this.groupnames, c[i]+'_fence');
					delete this.context[c[i]];
					delete this.canvas[c[i]];
					delete this.ctx[scrawl.cell[c[i]].context];
					scrawl.removeItem(this.ctxnames, scrawl.cell[c[i]].context);
					delete this.cell[c[i]];
					scrawl.removeItem(this.cellnames, c[i]);
					}
				return true;
				}
			return false;
			},

/**
A __general__ function which passes on requests to pads to update their drawOrder property
@method setDrawOrder
@param {Array} order Array of CELLNAMEs - Cells listed first will be drawn first (beneath other cells/layers)
@param {Array} pads Array of PADNAMESs - can also be a String
@return Always true
**/
		setDrawOrder: function(order, pads){
			var p = (this.xt(pads)) ? [].concat(pads) : [this.currentPad];
			for(var i=0, z=p.length; i<z; i++){
				this.pad[p[i]].setDrawOrder(order);
				}
			return true;
			},

/**
A __factory__ function to generate Point objects from a set of cartesian (XY) coordinates

The argument is in the form of:
* __sprite__ SPRITENAME String
* __data__ Array of arrays containing [xCoordinate, yCoordinate] Numbers
* __pointLabel__ String
* __linkLabel__ String (optional)
@method makeCartesianPoints
@param {Object} items Object containing attributes
@return Array of POINTNAME Strings
@deprecated Use other factory functions instead
**/
		makeCartesianPoints: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			if(this.isa(items.pointLabel,'str') && this.isa(items.sprite,'str') && this.isa(items.data,'arr')){
				var v = [], 
					temp,
					vLabel = (this.xt(items.linkLabel)) ? items.linkLabel : items.pointLabel+'_link';
				for(var i=0, z=items.data.length; i<z; i++){
					temp = new Point({
						name: items.pointLabel+i,
						sprite: items.sprite,
						currentX: items.data[i][0] || 0,
						currentY: items.data[i][1] || 0,
						startLink: vLabel+i,
						});
					v.push(temp.name);
					}
				}
			return v;
			},

/**
A __factory__ function to generate Point objects from a set of polar (distance, angle) coordinates

The argument is in the form of:
* __sprite__ SPRITENAME String
* __data__ Array of arrays containing [distance, angle] Numbers
* __pointLabel__ String
* __linkLabel__ String (optional)
@method makePolarPoints
@param {Object} items Object containing attributes
@return Array of POINTNAME Strings
@deprecated Use other factory functions instead
**/
		makePolarPoints: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			if(this.isa(items.pointLabel,'str') && this.isa(items.sprite,'str') && this.isa(items.data,'arr')){
				var	v = [],
					temp,
					vLabel = (this.xt(items.linkLabel)) ? items.linkLabel : items.pointLabel+'_link';
				for(var i=0, z=items.data.length; i<z; i++){
					temp = new Point({
						name: items.pointLabel+i,
						sprite: items.sprite,
						distance: items.data[i][0] || 0,
						angle: items.data[i][1] || 0,
						startLink: vLabel+i,
						});
					v.push(temp.name);
					}
				}
			return v;
			},

/**
A __factory__ function to generate Shape sprite objects

The argument can include:
* __scaleX__ - Number, for stretching the sprite horizontally; default: 1 (not retained)
* __scaleY__ - Number, for stretching the sprite vertically; default: 1 (not retained)
* __data__ - String consisting of _SVGTiny_ path instructions (all commands except 'A' or 'a')
* any other legitimate Sprite, Context or Shape attribute
@method makePath
@param {Object} items Object containing attributes
@return Shape sprite object
**/
		makePath: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			//define local variables - scale
			var minX = 999999, 
				minY = 999999, 
				maxX = -999999, 
				maxY = -999999,
				myShape, 
				sn, 
				tn, 
				lib, 
				sx, 
				sy, 
				set, 
				data, 
				command, 
				temppoint,
				lc = 0, 
				pc = 0, 
				cx = 0, 
				cy = 0;
			//amend argument
			var	myPivot = (this.xt(items.pivot)) ? this.point[myPivot] || this.sprite[myPivot] : false;
			items.start = (scrawl.xt(items.start)) ? items.start : {};
			items.scaleX = items.scaleX || 1; 
			items.scaleY = items.scaleY || 1;
			items.startX = (myPivot) ? ((myPivot.type === 'Point') ? myPivot.local.x : myPivot.start.x) : (items.startX || items.start.x || 0); 
			items.startY = (myPivot) ? ((myPivot.type === 'Point') ? myPivot.local.y : myPivot.start.y) : (items.startY || items.start.y || 0); 
			items.isLine = (scrawl.isa(items.isLine,'bool')) ? items.isLine : true;
			//define local functions
			var checkMinMax = function(cx,cy){
				minX = (minX > cx) ? cx : minX;
				minY = (minY > cy) ? cy : minY;
				maxX = (maxX < cx) ? cx : maxX;
				maxY = (maxY < cy) ? cy : maxY;
				};
			var getPathSetData = function(sim){
				var psd = sim.match(/(-?[0-9.]+\b)/g);
				if(psd){
					for(var j=0, w=psd.length; j<w; j++){
						psd[j] = parseFloat(psd[j]);
						}
					return psd;
					}
				return false;
				};
			var generatePoint = function(_tempname,_pcount,_shapename,_x,_y,_lcount,_sx,_sy){
				new Point({
					name: _tempname+'_p'+_pcount,
					sprite: _shapename,
					currentX: _x*_sx,
					currentY: _y*_sy,
					startLink: _tempname+'_l'+_lcount,
					});
				};
			var generateLink = function(_tempname,_lcount,_shapename,_spec,_act,_spt,_ept,_cp1,_cp2){
				_ept = (scrawl.xt(_ept)) ? _ept : {};
				_cp1 = (scrawl.xt(_cp1)) ? _cp1 : {};
				_cp2 = (scrawl.xt(_cp2)) ? _cp2 : {};
				new Link({
					name: _tempname+'_l'+_lcount,
					sprite: _shapename,
					species: _spec, 
					startPoint: _spt.name,
					endPoint: _ept.name || false,
					controlPoint1: _cp1.name || false,
					controlPoint2: _cp2.name || false,
					precision: items.precision || false,
					action: _act,
					});
				};
			//main code
			if(this.xt(items.data)){
				myShape = this.newShape(items);
				sn = myShape.name;
				tn = sn.replace('~','_','g');
				lib = scrawl.point;
				sx = items.scaleX;
				sy = items.scaleY;
				if(myShape){
					set = items.data.match(/([A-Za-z][0-9. ,\-]*)/g);
					generatePoint(tn, pc, sn, cx, cy, lc, sx, sy); pc++;
					for(var i=0,z=set.length; i<z; i++){
						command = set[i][0];
						data = getPathSetData(set[i]);
						switch(command){
							case 'M' :
								cx = data[0], cy = data[1];
								checkMinMax(cx,cy);
								generatePoint(tn, pc, sn, cx, cy, lc+1, sx, sy); pc++;
								generateLink(tn, lc, sn, false, 'move', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
								for(var k=2,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx = data[k], cy = data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'm' :
								if(i===0){
									cx = data[0], cy = data[1];
									}
								else{
									cx += data[0], cy += data[1];
									}
								checkMinMax(cx,cy);
								generatePoint(tn, pc, sn, cx, cy, lc+1, sx, sy); pc++;
								generateLink(tn, lc, sn, false, 'move', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
								for(var k=2,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx += data[k], cy += data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'Z' :
							case 'z' :
								generatePoint(tn, pc, sn, myShape.start.x, myShape.start.y, lc+1, sx, sy); pc++;
								generateLink(tn, lc, sn, false, 'close', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
								break;
							case 'L' :
								for(var k=0,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx = data[k], cy = data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'l' :
								for(var k=0,v=data.length;k<v;k+=2){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx += data[k], cy += data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 'H' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, data[k], cy, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx = data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'h' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, cx+data[k], cy, lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cx += data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'V' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, cx, data[k], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cy = data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'v' :
								for(var k=0,v=data.length;k<v;k++){
									generatePoint(tn, pc, sn, cx, cy+data[k], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'line', 'add', lib[tn+'_p'+(pc-2)], lib[tn+'_p'+(pc-1)]); lc++;
									cy += data[k];
									checkMinMax(cx,cy);
									}
								break;
							case 'C' :
								for(var k=0,v=data.length;k<v;k+=6){
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+4], data[k+5], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k+4], cy = data[k+5];
									checkMinMax(cx,cy);
									}
								break;
							case 'c' :
								for(var k=0,v=data.length;k<v;k+=6){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, cx+data[k+2], cy+data[k+3], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, cx+data[k+4], cy+data[k+5], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k+4], cy += data[k+5];
									checkMinMax(cx,cy);
									}
								break;
							case 'S' :
								for(var k=0,v=data.length;k<v;k+=4){
									if(i>0 && this.contains(['C','c','S','s'], set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k+2], cy = data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 's' :
								for(var k=0,v=data.length;k<v;k+=4){
									if(i>0 && this.contains(['C','c','S','s'], set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'bezier', 'add', lib[tn+'_p'+(pc-4)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k+2], cy += data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 'Q' :
								for(var k=0,v=data.length;k<v;k+=4){
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, data[k+2], data[k+3], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k+2], cy = data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 'q' :
								for(var k=0,v=data.length;k<v;k+=4){
									generatePoint(tn, pc, sn, cx+data[k], cy+data[k+1], lc+1, sx, sy); pc++;
									generatePoint(tn, pc, sn, cx+data[k+2], cy+data[k+3], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k+2], cy += data[k+3];
									checkMinMax(cx,cy);
									}
								break;
							case 'T' :
								for(var k=0,v=data.length;k<v;k+=2){
									if(i>0 && this.contains(['Q','q','T','t'], set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx = data[k], cy = data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							case 't' :
								for(var k=0,v=data.length;k<v;k+=2){
									if(i>0 && this.contains(['Q','q','T','t'], set[i-1][0])){
										lib[tn+'_p'+(pc-2)].clone({
											name: tn+'_p'+pc,
											currentX: cx+(cx-lib[tn+'_p'+(pc-2)].currentX),
											currentY: cy+(cy-lib[tn+'_p'+(pc-2)].currentY),
											}), pc++;
										}
									else{
										generatePoint(tn, pc, sn, cx, cy, lc+1, sx, sy); pc++;
										}
									generatePoint(tn, pc, sn, data[k], data[k+1], lc+1, sx, sy); pc++;
									generateLink(tn, lc, sn, 'quadratic', 'add', lib[tn+'_p'+(pc-3)], lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc-2)]); lc++;
									cx += data[k], cy += data[k+1];
									checkMinMax(cx,cy);
									}
								break;
							default :
							}
						}
					generateLink(tn, lc, sn, false, 'end', lib[tn+'_p'+(pc-1)], lib[tn+'_p'+(pc)]);
					myShape.set({
						firstPoint: tn + '_p0',
						width: (maxX - minX) * items.scaleX,
						height: (maxY - minY) * items.scaleY,
						});
					myShape.buildPositions();
					return myShape;
					}
				}
			return false;
			},

/**
A __factory__ function to generate elliptical Shape or Outline sprite objects

The argument can include:
* __radiusX__ - Number, horizontal radius of ellipse; default: 0 (not retained)
* __radiusY__ - Number, vertical radius of ellipse; default: 0 (not retained)
* __outline__ - Boolean, true to create Outline; false (default) to create Shape (not retained)
* any other legitimate Sprite, Context or Shape/Outline attribute
@method makeEllipse
@param {Object} items Object containing attributes
@return Shape or Outline sprite object
**/
		makeEllipse: function(items){
			//amend argument
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.radiusX = items.radiusX || 0;
			items.radiusY = items.radiusY || 0;
			items.closed = true;
			//define local variables
			var	myData = 'm',
				cx = items.startX,
				cy = items.startY,
				dx = items.startX,
				dy = items.startY-items.radiusY,
				myShape;
			//function code
			myData += (cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX+(items.radiusX*0.55);
			dy = items.startY-items.radiusY;
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX+items.radiusX;
			dy = items.startY-(items.radiusY*0.55);
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX+items.radiusX;
			dy = items.startY;
			myData += ' '+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX+items.radiusX;
			dy = items.startY+(items.radiusY*0.55);
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX+(items.radiusX*0.55);
			dy = items.startY+items.radiusY;
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX;
			dy = items.startY+items.radiusY;
			myData += ' '+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX-(items.radiusX*0.55);
			dy = items.startY+items.radiusY;
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX-items.radiusX;
			dy = items.startY+(items.radiusY*0.55);
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX-items.radiusX;
			dy = items.startY;
			myData += ' '+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX-items.radiusX;
			dy = items.startY-(items.radiusY*0.55);
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX-(items.radiusX*0.55);
			dy = items.startY-items.radiusY;
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX;
			dy = items.startY-items.radiusY;
			myData += ' '+(cx-dx)+','+(cy-dy);
			myData += 'z';
			items.isLine = false;
			items.data = myData;
			return (items.outline) ? this.newOutline(items) : this.makePath(items);
			},

/**
A __factory__ function to generate rectangular Shape or Outline sprite objects, with optional rounded corners

The argument can include:
* __width__ - Number, default: 0
* __height__ - Number, default: 0
* also, 0, 1 or more of the following __radius__ attributes (all Number, default: radius=0): radiusTopLeftX, radiusTopLeftY, radiusTopRightX, radiusTopRightY, radiusBottomRightX, radiusBottomRightY, radiusBottomLeftX, radiusBottomLeftY, radiusTopLeft, radiusTopRight, radiusBottomRight, radiusBottomLeft, radiusTopX, radiusTopY, radiusBottomX, radiusBottomY, radiusLeftX, radiusLeftY, radiusRightX, radiusRightY, radiusTop, radiusBottom, radiusRight, radiusLeft, radiusX, radiusY, radius (not retained)
* __outline__ - Boolean, true to create Outline; false (default) to create Shape (not retained)
* any other legitimate Sprite, Context or Shape/Outline attribute
@method makeRectangle
@param {Object} items Object containing attributes
@return Shape or Outline sprite object
**/
		makeRectangle: function(items){
			//amend argument
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.width = items.width || 0; 
			items.height = items.height || 0;
			items.radius = items.radius || 0; 
			items.closed = true;
			//define local variables - warning: everything inverts - top->bottom, left->right, etc
			var	_brx = items.radiusTopLeftX || items.radiusTopLeft || items.radiusTopX || items.radiusLeftX || items.radiusTop || items.radiusLeft || items.radiusX || items.radius || 0,
				_bry = items.radiusTopLeftY || items.radiusTopLeft || items.radiusTopY || items.radiusLeftY || items.radiusTop || items.radiusLeft || items.radiusY || items.radius || 0,
				_blx = items.radiusTopRightX || items.radiusTopRight || items.radiusTopX || items.radiusRightX || items.radiusTop || items.radiusRight || items.radiusX || items.radius || 0,
				_bly = items.radiusTopRightY || items.radiusTopRight || items.radiusTopY || items.radiusRightY || items.radiusTop || items.radiusRight || items.radiusY || items.radius || 0,
				_tlx = items.radiusBottomRightX || items.radiusBottomRight || items.radiusBottomX || items.radiusRightX || items.radiusBottom || items.radiusRight || items.radiusX || items.radius || 0,
				_tly = items.radiusBottomRightY || items.radiusBottomRight || items.radiusBottomY || items.radiusRightY || items.radiusBottom || items.radiusRight || items.radiusY || items.radius || 0,
				_trx = items.radiusBottomLeftX || items.radiusBottomLeft || items.radiusBottomX || items.radiusLeftX || items.radiusBottom || items.radiusLeft || items.radiusX || items.radius || 0,
				_try = items.radiusBottomLeftY || items.radiusBottomLeft || items.radiusBottomY || items.radiusLeftY || items.radiusBottom || items.radiusLeft || items.radiusY || items.radius || 0,
				halfWidth = (items.width/2),
				halfHeight = (items.height/2),
				myData = 'm',
				cx = items.startX,
				cy = items.startY,
				dx = items.startX-halfWidth+_tlx,
				dy = items.startY-halfHeight,
				myShape;
			//function code
			myData += (cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX+halfWidth-_trx;
			dy = items.startY-halfHeight;
			myData += 'l'+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX+halfWidth-_trx+(_trx*0.55);
			dy = items.startY-halfHeight;
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX+halfWidth;
			dy = items.startY-halfHeight+_try-(_try*0.55);
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX+halfWidth;
			dy = items.startY-halfHeight+_try;
			myData += ' '+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX+halfWidth;
			dy = items.startY+halfHeight-_bry;
			myData += 'l'+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX+halfWidth;
			dy = items.startY+halfHeight-_bry+(_bry*0.55);
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX+halfWidth-_brx+(_brx*0.55);
			dy = items.startY+halfHeight;
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX+halfWidth-_brx;
			dy = items.startY+halfHeight;
			myData += ' '+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX-halfWidth+_blx;
			dy = items.startY+halfHeight;
			myData += 'l'+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX-halfWidth+_blx-(_blx*0.55);
			dy = items.startY+halfHeight;
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX-halfWidth;
			dy = items.startY+halfHeight-_bly+(_bly*0.55);
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX-halfWidth;
			dy = items.startY+halfHeight-_bly;
			myData += ' '+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX-halfWidth;
			dy = items.startY-halfHeight+_tly;
			myData += 'l'+(cx-dx)+','+(cy-dy);
			cx = dx, cy = dy;
			dx = items.startX-halfWidth;
			dy = items.startY-halfHeight+_tly-(_tly*0.55);
			myData += 'c'+(cx-dx)+','+(cy-dy);
			dx = items.startX-halfWidth+_tlx-(_tlx*0.55);
			dy = items.startY-halfHeight;
			myData += ' '+(cx-dx)+','+(cy-dy);
			dx = items.startX-halfWidth+_tlx;
			dy = items.startY-halfHeight;
			myData += ' '+(cx-dx)+','+(cy-dy);
			myData += 'z';
			items.isLine = false;
			items.data = myData;
			return (items.outline) ? this.newOutline(items) : this.makePath(items);
			},

/**
A __factory__ function to generate bezier curve Shape or Outline sprite objects

The argument can include:
* __startX__ - Number; default: 0
* __startY__ - Number; default: 0
* __startControlX__ - Number; default: 0 (not retained)
* __startControlY__ - Number; default: 0 (not retained)
* __endControlX__ - Number; default: 0 (not retained)
* __endControlY__ - Number; default: 0 (not retained)
* __endX__ - Number; default: 0 (not retained)
* __endY__ - Number; default: 0 (not retained)
* __outline__ - Boolean, true to create Outline; false (default) to create Shape 
* any other legitimate Sprite, Context or Shape/Outline attribute
@method makeBezier
@param {Object} items Object containing attributes
@return Shape or Outline sprite object
**/
		makeBezier: function(items){
			//amend argument
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.startControlX = items.startControlX || 0;
			items.startControlY = items.startControlY || 0;
			items.endControlX = items.endControlX || 0;
			items.endControlY = items.endControlY || 0;
			items.endX = items.endX || 0;
			items.endY = items.endY || 0;
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			//define local variables
			var	myFixed = items.fixed || 'none',
				myShape, 
				data, 
				tempName;
			//function code
			items.fixed = false;
			data = 'm0,0c'+
				(items.startControlX-items.startX)+','+(items.startControlY-items.startY)+' '+
				(items.endControlX-items.startX)+','+(items.endControlY-items.startY)+' '+
				(items.endX-items.startX)+','+(items.endY-items.startY);
			items.data = data;
			items.isLine = true;
			if(items.outline){
				myShape = this.newOutline(items);
				}
			else{
				myShape = this.makePath(items);
				tempName = myShape.name.replace('~','_','g');
				switch(myFixed){
					case 'all' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						this.point[tempName+'_p2'].setToFixed(items.startControlX, items.startControlY);
						this.point[tempName+'_p3'].setToFixed(items.endControlX, items.endControlY);
						this.point[tempName+'_p4'].setToFixed(items.endX, items.endY);
						break;
					case 'both' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						this.point[tempName+'_p4'].setToFixed(items.endX, items.endY);
						break;
					case 'start' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						break;
					case 'startControl' :
						this.point[tempName+'_p2'].setToFixed(items.startControlX, items.startControlY);
						break;
					case 'endControl' :
						this.point[tempName+'_p3'].setToFixed(items.endControlX, items.endControlY);
						break;
					case 'end' :
						this.point[tempName+'_p4'].setToFixed(items.endX, items.endY);
						break;
					}
				}
			return myShape;
			},

/**
A __factory__ function to generate quadratic curve Shape or Outline sprite objects

The argument can include:
* __startX__ - Number; default: 0
* __startY__ - Number; default: 0
* __controlX__ - Number; default: 0 (not retained)
* __controlY__ - Number; default: 0 (not retained)
* __endX__ - Number; default: 0 (not retained)
* __endY__ - Number; default: 0 (not retained)
* __outline__ - Boolean, true to create Outline; false (default) to create Shape 
* any other legitimate Sprite, Context or Shape/Outline attribute
@method makeQuadratic
@param {Object} items Object containing attributes
@return Shape or Outline sprite object
**/
		makeQuadratic: function(items){
			//amend argument
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.controlX = items.controlX || 0;
			items.controlY = items.controlY || 0;
			items.endX = items.endX || 0;
			items.endY = items.endY || 0;
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			//define local variables
			var myFixed = items.fixed || 'none',
				data, 
				myShape, 
				tempName;
			//function code
			data = 	'm0,0q'+
				(items.controlX-items.startX)+','+(items.controlY-items.startY)+' '+
				(items.endX-items.startX)+','+(items.endY-items.startY);
			items.fixed = false;
			items.data = data;
			items.isLine = true;
			if(items.outline){
				myShape = this.newOutline(items);
				}
			else{
				myShape = this.makePath(items);
				tempName = myShape.name.replace('~','_','g');
				switch(myFixed){
					case 'all' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						this.point[tempName+'_p2'].setToFixed(items.controlX, items.controlY);
						this.point[tempName+'_p3'].setToFixed(items.endX, items.endY);
						break;
					case 'both' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						this.point[tempName+'_p3'].setToFixed(items.endX, items.endY);
						break;
					case 'start' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						break;
					case 'control' :
						this.point[tempName+'_p2'].setToFixed(items.controlX, items.controlY);
						break;
					case 'end' :
						this.point[tempName+'_p3'].setToFixed(items.endX, items.endY);
						break;
					}
				}
			return myShape;
			},

/**
A __factory__ function to generate straight line Shape or Outline sprite objects

The argument can include:
* __startX__ - Number; default: 0
* __startY__ - Number; default: 0
* __endX__ - Number; default: 0 (not retained)
* __endY__ - Number; default: 0 (not retained)
* __outline__ - Boolean, true to create Outline; false (default) to create Shape 
* any other legitimate Sprite, Context or Shape/Outline attribute
@method makeLine
@param {Object} items Object containing attributes
@return Shape or Outline sprite object
**/
		makeLine: function(items){
			//amend argument
			items = (this.isa(items,'obj')) ? items : {};
			items.startX = items.startX || 0; 
			items.startY = items.startY || 0;
			items.endX = items.endX || 0;
			items.endY = items.endY || 0;
			items.closed = false;
			items.handleX = items.handleX || 'left';
			items.handleY = items.handleY || 'top';
			//define local variables
			var myFixed = items.fixed || 'none',
				data, 
				myShape, 
				tempName;
			//function code
			data = 	'm0,0 '+(items.endX-items.startX)+','+(items.endY-items.startY);
			items.fixed = false;
			items.data = data;
			items.isLine = true;
			if(items.outline){
				myShape = this.newOutline(items);
				}
			else{
				myShape = this.makePath(items);
				tempName = myShape.name.replace('~','_','g');
				switch(myFixed){
					case 'both' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						this.point[tempName+'_p2'].setToFixed(items.endX, items.endY);
						break;
					case 'start' :
						this.point[tempName+'_p1'].setToFixed(items.startX, items.startY);
						break;
					case 'end' :
						this.point[tempName+'_p2'].setToFixed(items.endX, items.endY);
						break;
					}
				}
			return myShape;
			},

/**
A __factory__ function to generate straight-edged regular shapes such as triangles, stars, hexagons, etc

The argument can include:
* __angle__ - Number; eg an angle of 72 produces a pentagon, while 144 produces a five-pointed star - default: 0
* __sides__ - Number; number of sides to the regular shape - default: 0
* __outline__ - Number; default: 0
* __radius__ - Number; default: 0 (not retained)
* __outline__ - Boolean, true to create Outline; false (default) to create Shape 
* any other legitimate Sprite, Context or Shape/Outline attribute

_(Either the 'angle' attribute or the 'sides' attribute (but not both) must be included in the argument object)_

@method makeRegularShape
@param {Object} items Object containing attributes
@return Shape or Outline sprite object
**/
		makeRegularShape: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			if(this.xto([items.sides, items.angle])){
				//amend argument
				items.startX = items.startX || 0;
				items.startY = items.startY || 0;
				items.radius = items.radius || 20;
				items.closed = true;
				//define local variables - default to square (diamond)
				// - known bug: items.sides has difficulty exiting the loop, hence the count<1000 limit
				var	turn = (scrawl.isa(items.sides,'num') && items.sides > 1) ? 360/items.sides : ((scrawl.isa(items.angle,'num') && items.angle > 0) ? items.angle : 4),
					currentAngle = 0,
					count = 0,
					point = new Vector({x: items.radius}),
					tPoint, 
					oPoint, 
					cPoint, 
					test,
					data = 'm';
				//function code
				cPoint = point.getRotate(currentAngle)
				data += ''+cPoint.x.toFixed(4)+','+cPoint.y.toFixed(4)+' ';
				oPoint = cPoint.getVector();
				do{
					count++;
					currentAngle += turn;
					currentAngle = currentAngle % 360;
					tPoint = point.getRotate(currentAngle);
					cPoint = tPoint.getVectorSubtract(oPoint);
					data += ''+cPoint.x.toFixed(4)+','+cPoint.y.toFixed(4)+' ';
					oPoint = tPoint.getVector();
					test = currentAngle.toFixed(0);
					}while(test !== '0' && count < 1000);
				data += 'z';
				items.data = data;
				items.isLine = false;
				return (scrawl.xt(items.outline) && items.outline) ? this.newOutline(items) : this.makePath(items);
				}
			return false;
			},

/**
A __general__ function to delete sprite objects
@method deleteSprite
@param {Array} items Array of SPRITENAME Strings - can also be a String
@return True on success, false otherwise
**/
		deleteSprite: function(items){
			//define local variables
			var	myItems = (scrawl.isa(items, 'str')) ? [items] : [].concat(items),
				myPointList, 
				myLinkList,
				myCtx,
				search,
				mySprite;
			//function code
			for(var i=0, z=myItems.length; i<z; i++){
				if(this.contains(this.spritenames, myItems[i])){
					mySprite = this.sprite[myItems[i]];
					if(mySprite.type === 'Shape'){
						myPointList = mySprite.getFullPointList();
						myLinkList = mySprite.getFullLinkList();
						for(var j=0, w=myPointList.length; j<w; j++){
							this.removeItem(this.pointnames, myPointList[j]);
							delete this.point[myPointList[j]];
							}
						for(var j=0, w=myLinkList.length; j<w; j++){
							this.removeItem(this.linknames, myLinkList[j]);
							delete this.link[myLinkList[j]];
							}
						}
					myCtx = mySprite.context;
					this.removeItem(this.ctxnames, myCtx);
					delete this.ctx[myCtx];
					this.removeItem(this.spritenames, myItems[i]);
					delete this.sprite[myItems[i]];
					for(var j =0, v=this.groupnames.length; j<v; j++){
						this.removeItem(this.group[this.groupnames[j]].sprites, myItems[i]);
						}
					}
				}
			return true;
			},

/**
A __general__ function which adds supplied spritenames to Group.sprites attribute
@method addSpritesToGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} sprites Array of SPRITENAME Strings - can also be a String
@return True on success, false otherwise
**/
		addSpritesToGroups: function(groups, sprites){
			if(this.xta([groups,sprites])){
				//define local variables
				var	myGroups = [].concat(groups),
					mySprites = [].concat(sprites);
				//function code
				for(var i=0, z=myGroups.length; i<z; i++){
					if(this.contains(this.groupnames, myGroups[i])){
						this.group[myGroups[i]].addSpritesToGroup(mySprites);
						}
					}
				return true;
				}
			return false;
			},

/**
A __general__ function which removes supplied spritenames from Group.sprites attribute
@method removeSpritesFromGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} sprites Array of SPRITENAME Strings - can also be a String
@return True on success, false otherwise
**/
		removeSpritesFromGroups: function(groups, sprites){
			if(this.xta([groups,sprites])){
				//define local variables
				var	myGroups = [].concat(groups),
					mySprites = [].concat(sprites);
				//function code
				for(var i=0, z=myGroups.length; i<z; i++){
					if(this.contains(this.groupnames, myGroups[i])){
						this.group[myGroups[i]].removeSpritesFromGroup(mySprites);
						}
					}
				return true;
				}
			return false;
			},

/**
A __general__ function which asks Cell objects to generate field collision tables
@method buildFields
@param {Array} [items] Array of CELLNAME Strings - can also be a String
@return Always true
**/
		buildFields: function(items){
			var myCells = (this.xt(items)) ? [].concat(items) : [this.pad[this.currentPad].current];
			if(items === 'all'){
				myCells = this.cellnames;
				}
			for(var i=0, z=myCells.length; i<z; i++){
				this.cell[myCells[i]].buildField();
				}
			return true;
			},

/**
A __general__ function to recover canvases, stack elements and other desired elements from the DOM
@method initialize
@return Always true
**/
		initialize: function(){
			this.getStacks();
			this.getCanvases();
			this.getElements();
			this.setDisplayOffsets('all');
			this.doAnimation = true;
			this.animationLoop();
			return true;
			},

/**
A __private__ function that searches the DOM for elements with class="scrawlstack"; generates Stack objects
@method getStacks
@return True on success; false otherwise
@private
**/
		getStacks: function(){
			//define local variables
			var	s = document.getElementsByClassName("scrawlstack"),
				stacks = [],
				myStack;
			//function code
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					stacks.push(s[i]);
					}
				for(var i=0, z=s.length; i<z; i++){
					myStack = scrawl.newStack({
						stackElement: stacks[i],
						});
					for(var j=0, w=scrawl.stk[myStack.name].children.length; j<w; j++){
						scrawl.stk[myStack.name].children[j].style.position = 'absolute';
						if(scrawl.stk[myStack.name].children[j].tagName !== 'CANVAS'){
							scrawl.newElement({
								domElement: scrawl.stk[myStack.name].children[j],
								stack: myStack.name,
								});
							}
						}
					if(this.contains(this.elementnames, myStack.name)){
						myStack.stack = this.element[myStack.name].stack;
						delete this.element[myStack.name];
						delete this.elm[myStack.name];
						this.removeItem(this.elementnames, myStack.name);
						}
					}
				return true;
				}
			console.log('scrawl.getStacks() failed to find any elements with class="scrawlstack" on the page');
			return false;
			},

/**
A __private__ function that searches the DOM for canvas elements and generates Pad/Cell/Context objects for each of them
@method getCanvases
@return True on success; false otherwise
@private
**/
		getCanvases: function(){
			//define local variables
			var	s = document.getElementsByTagName("canvas"),
				myPad, 
				myStack, 
				myElement, 
				myNewStack,
				canvases = [];
			//function code
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					canvases.push(s[i]);
					}
				for(var i=0, z=s.length; i<z; i++){
					if(canvases[i].className.indexOf('stack:') !== -1){
						myStack = canvases[i].className.match(/stack:(\w+)/);
						if(this.contains(this.stacknames, myStack[1])){
							scrawl.stk[myStack[1]].appendChild(canvases[i]);
							}
						else{
							myElement = document.createElement('div');
							myElement.id = myStack[1];
							canvases[i].parentElement.appendChild(myElement);
							myElement.appendChild(canvases[i]);
							myNewStack = scrawl.newStack({
								stackElement: document.getElementById(myStack[1]),
								});
							}
						}
					myPad = scrawl.newPad({
						canvasElement: canvases[i],
						});
					if(this.contains(this.stacknames, canvases[i].parentElement.id)){
						myPad.stack = canvases[i].parentElement.id;
						canvases[i].style.position = 'absolute';
						}
					if(i === 0){
						scrawl.currentPad = myPad.name;
						}
					}
				return true;
				}
			console.log('scrawl.getCanvases() failed to find any <canvas> elements on the page');
			return false;
			},

/**
A __private__ function that searches the DOM for elements with class="scrawl stack:STACKNAME"; generates Element objects
@method getElements
@return True on success; false otherwise
@private
**/
		getElements: function(){
			//define local variables
			var	s = document.getElementsByClassName("scrawl"),
				el = [],
				myName, 
				myStack;
			//function code
			if(s.length > 0){
				for(var i=0, z=s.length; i<z; i++){
					el.push(s[i]);
					}
				for(var i=0, z=s.length; i<z; i++){
					myName = el.id || el.name || false;
					if(!this.contains(this.elementnames, myName)){
						if(el[i].className.indexOf('stack:') !== -1){
							myStack = el[i].className.match(/stack:(\w+)/);
							if(this.contains(this.stacknames, myStack[1])){
								scrawl.stk[myStack[1]].appendChild(el[i]);
								scrawl.newElement({
									domElement: el[i],
									stack: myStack[1],
									});
								}
							}
						}
					}
				return true;
				}
			console.log('scrawl.getElements() failed to find any elements with class="scrawl" on the page');
			return false;
			},

/**
A __general__ function to add a visible &lt;canvas&gt; element to the web page, and create a Pad controller and Cell wrappers for it

The argument object should include the following attributes:

* __stackName__ (String) - STACKNAME of existing or new stack (optional)
* __parentElement__ - (String) CSS #id of parent element, or the DOM element itself; default: document.body
* any other legitimate Pad and/or Cell object attribute
@method addCanvasToPage
@param {Object} items Object containing new Cell's parameters
@return Pad object
**/
		addCanvasToPage: function(items){
			items = (this.isa(items,'obj')) ? items : {};
			//define local variables
			var	myStk = false,
				myParent, 
				myName, 
				myCanvas, 
				DOMCanvas, 
				myPad,
				stackParent;
			//function code
			if(this.xt(items.stackName)){
				myStk = document.getElementById(items.stackName) || false;
				if(!myStk){
					if(!scrawl.xt(items.parentElement)){
						stackParent = document.body;
						}
					else{
						stackParent = (scrawl.isa(items.parentElement,'str')) ? document.getElementById(items.parentElement) : items.parentElement;
						}
					myStk = this.addStackToPage({
						stackName: items.stackName, 
						width: items.width, 
						height: items.height, 
						parentElement: stackParent,
						});
					}
				items.stack = myStk.name;
				}
			myParent = scrawl.stk[(myStk.name || myStk.id)] || document.getElementById(items.parentElement) || document.body;
			myName = scrawl.makeName({
				name: items.canvasName || items.name || false,
				type: 'Pad',
				target: 'padnames',
				});
			myCanvas = document.createElement('canvas');
			myCanvas.id = myName;
			myParent.appendChild(myCanvas);
			DOMCanvas = document.getElementById(myName)
			DOMCanvas.width = items.width;
			DOMCanvas.height = items.height;
			myPad = scrawl.newPad({
				canvasElement: DOMCanvas,
				});
			if(this.xt(items.position) || myStk){
				items.position = items.position || 'absolute';
				}
			items.stack = (items.stackName) ? items.stackName : '';
			myPad.set(items);
			this.setDisplayOffsets();
			return myPad;
			},

/**
A __general__ function to generates a new Stack object, together with a new DOM &lt;div&gt; element to act as the stack

The argument object should include the following attributes:

* __stackName__ (String) - STACKNAME of existing or new stack (optional)
* __parentElement__ - (String) CSS #id of parent element, or the DOM element itself; default: document.body
* any other legitimate Stack object attribute
@method addStackToPage
@param {Object} items Object containing new Stack's parameters
@return New stack object
**/
		addStackToPage: function(items){
			if(this.isa(items.stackName,'str') && this.xt(items.parentElement)){
				//define local variables
				var myElement,
					myStack;
				items.parentElement = (scrawl.isa(items.parentElement,'str')) ? document.getElementById(items.parentElement) : items.parentElement;
				//function code
				myElement = document.createElement('div');
				myElement.id = items.stackName;
				items.parentElement.appendChild(myElement);
				items['stackElement'] = document.getElementById(items.stackName);
				myStack = new Stack(items);
				myStack.stack = (this.contains(this.stacknames, items.parentElement.id)) ? items.parentElement.id : '';
				return myStack;
				}
			return false;
			},

/**
A __general__ function to reset display offsets for all pads, stacks and elements

The argument is an optional String - permitted values include 'stack', 'pad', 'element'; default: 'all'
@method setDisplayOffsets
@param {String} [item] Command string detailing which element types are to be set
@return Always true
**/
		setDisplayOffsets: function(item){
			item = (scrawl.xt(item)) ? item : 'all';
			if(item === 'stack' || item === 'all'){
				for(var i=0, z=scrawl.stacknames.length; i<z; i++){
					scrawl.stack[scrawl.stacknames[i]].setDisplayOffsets();
					}
				}
			if(item === 'pad' || item === 'all'){
				for(var i=0, z=scrawl.padnames.length; i<z; i++){
					scrawl.pad[scrawl.padnames[i]].setDisplayOffsets();
					}
				}
			if(item === 'element' || item === 'all'){
				for(var i=0, z=scrawl.elementnames.length; i<z; i++){
					scrawl.element[scrawl.elementnames[i]].setDisplayOffsets();
					}
				}
			return true;
			},

/**
A __display__ function to move DOM elements within a Stack
@method renderElements
@return Always true
**/
		renderElements: function(){
			for(var i=0, z=scrawl.stacknames.length; i<z; i++){
				scrawl.stack[scrawl.stacknames[i]].renderElement();
				}
			for(var i=0, z=scrawl.padnames.length; i<z; i++){
				scrawl.pad[scrawl.padnames[i]].renderElement();
				}
			for(var i=0, z=scrawl.elementnames.length; i<z; i++){
				scrawl.element[scrawl.elementnames[i]].renderElement();
				}
			return true;
			},

/**
A __private__ function which updates scrawl.mouseX, scrawl.mouseY with current mouse position in the current document
@method handleMouseMove
@param {Object} [e] window.event
@return Always true
@private
**/
		handleMouseMove: function(e){
			if (!e) var e = window.event;
			if (e.pageX || e.pageY){
				scrawl.mouseX = e.pageX;
				scrawl.mouseY = e.pageY;
				}
			else if (e.clientX || e.clientY){
				scrawl.mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				scrawl.mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
			return true;
			},

/**
A __private__ function which retrieves a value from a Cell object's image data table 

Argument takes the form:
* {table:IMAGEDATANAME, channel:String, x:XCOORDINATE, y:YCOORDINATE}
* where channel attribute can be one of 'red', 'blue', 'green', 'alpha', 'color'
@method getImageDataValue
@param {Object} items Object argument
@return Channel value (Number) at coordinates, or pixel color (String) at coordinates; false on failure
@private
**/
		getImageDataValue: function(items){
			if(this.xta([items.table, items.channel]) && this.isa(items.x,'num') && this.isa(items.y,'num')){
				//define local variables
				var	myTable,
					myEl,
					result,
					myChannel;
				//function code
				myTable = scrawl.imageData[items.table];
				if(myTable){
					if(scrawl.isBetween(items.y, -1, myTable.height)){ 
						if(scrawl.isBetween(items.x, -1, myTable.width)){ 
							myEl = ((items.y * myTable.width) + items.x) * 4;
							if(items.channel === 'color'){
								result = 'rgba('+myTable.data[myEl]+','+myTable.data[myEl+1]+','+myTable.data[myEl+2]+','+myTable.data[myEl+3]+')';
								}
							else{
								switch(items.channel){
									case 'red' : myChannel = 0; break;
									case 'blue' : myChannel = 1; break;
									case 'green' : myChannel = 2; break;
									case 'alpha' : myChannel = 3; break;
									}
								result = myTable.data[myEl+myChannel];
								}
							return result;
							}
						}
					}
				}
			return false;
			},

/**
A __general__ function to undertake a round of calculations for Spring objects
@method updateSprings
@param {Array} [items] Array of SPRINGNAMES; defaults to all Spring objects
@return True on success; false otherwise
**/
		updateSprings: function(items){
			if(this.springnames.length > 0){
				//define local variables
				var s = [];
				//function code
				items = (this.isa(items,'arr')) ? items : this.springnames;
				for(var i=0, z=items.length; i<z; i++){
					s.push((this.isa(items[i],'obj')) ? items[i] : ((this.isa(items[i],'str')) ? this.spring[items[i]] : false));
					}
				for(var i=0, z=s.length; i<z; i++){
					if(s[i]){
						s[i].update();
						}
					}
				return true;
				}
			return false;
			},

/**
A __load__ function

Argument should be a JSON String, or an Array of JSON Strings, of objects to be loaded or updated
@method load
@param {Array} item Array of JSON Strings; alternatively, a JSON String
@return Always true
**/
		load: function(item){
			var a,			//object from item
				type,
				b,			//existing object settings
				c,			//defaults
				k;			//a keys
			if(this.isa(item, 'str')){
				item = [item];
				}
			for(var i=0, z=item.length; i<z; i++){
				if(this.isa(item[i],'str')){
					a = JSON.parse(item[i]);
					if(this.xt(a.type)){
						type = a.type.toLowerCase();
						if(this.contains(this[a.classname], a.name)){
							//update
							b = this[type][a.name].parse();
							c = this.d[a.type];
							k = Object.keys(b);
							for(var j=0, w=k.length; j<w; j++){
								if(!this.xt(a[k])){
									a[k] = c[k];
									}
								}
							this[type][a.name].set(a);
							}
						else{
							//create
							switch(type){
								case 'pad' : 
									this.addCanvasToPage(a); 
									this.currentPad = a.name;
									break;
								case 'cell' : 
									if(scrawl.xt(a.pad) && this.contains(this.padnames, a.pad)  && !this.contains(this.pad[a.pad].cells, a.name)){
										this.pad[a.pad].addNewCell(a); 
										}
									break;
								case 'spriteimage' : new SpriteImage(a); break;
								case 'animsheet' : new AnimSheet(a); break;
								case 'group' : new Group(a); break;
								case 'block' : new Block(a); break;
								case 'wheel' : new Wheel(a); break;
								case 'phrase' : new Phrase(a); break;
								case 'picture' : new Picture(a); break;
								case 'outline' : new Outline(a); break;
								case 'shape' : this.makePath(a); break;
								case 'gradient' : new Gradient(a); break;
								case 'radialgradient' : new RadialGradient(a); break;
								case 'pattern' : new Pattern(a); break;
								case 'color' : new Color(a); break;
								case 'particle' : new Particle(a); break;
								case 'spring' : new Spring(a); break;
								}
							}
						}
					}
				}
			return true;
			},

/**
A __save__ function

Argument should be a String literal: 'pads', 'groups', 'sprites', 'designs', 'animsheets'

_Note: this function does not check for duplicate objects_
@method save
@param {string} item A String literal: 'pads', 'cells', 'groups', 'sprites', 'designs', 'animsheets', 'springs'
@return Array of saved data
**/
		save: function(item){
			var results = [];
			switch(item){
				case 'pads' :
					for(var i=0, z=this.padnames.length; i<z; i++){
						results = results.concat(this.pad[this.padnames[i]].toString());
						}
					break;
				case 'cells' :
					for(var i=0, z=this.cellnames.length; i<z; i++){
						results = results.concat(this.cell[this.cellnames[i]].toString());
						}
					break;
				case 'groups' :
					for(var i=0, z=this.groupnames.length; i<z; i++){
						results = results.concat(this.group[this.groupnames[i]].toString());
						}
					break;
				case 'sprites' :
					for(var i=0, z=this.spritenames.length; i<z; i++){
						results = results.concat(this.sprite[this.spritenames[i]].toString());
						}
					break;
				case 'designs' :
					for(var i=0, z=this.designnames.length; i<z; i++){
						results = results.concat(this.design[this.designnames[i]].toString());
						}
					break;
				case 'animsheets' :
					for(var i=0, z=this.animnames.length; i<z; i++){
						results = results.concat(this.anim[this.animnames[i]].toString());
						}
					break;
				case 'springs' :
					for(var i=0, z=this.springnames.length; i<z; i++){
						results = results.concat(this.spring[this.springnames[i]].toString());
						}
					break;
				}
			return results;
			},

/**
A __utility__ function to construct a quaternion from pitch/yaw/roll values

Argument should be an object containing values for pitch, yaw and roll, in degrees

@method makeQuaternion
@param {Object} items Argument object
@return new Quaternion object
**/
		makeQuaternion: function(item){
			return Quaternion.prototype.makeQuaternion(items);
			},

/**
Animation flag: set to false to stop animation loop
@property doAnimation
@type {Boolean}
**/
		doAnimation: false,

/**
Animate array consists of an array of ANIMATIONNAME Strings
@property animate
@type {Array}
**/
		animate: [],

/**
The Scrawl animation loop

Animation loop is invoked automatically as part of the initialization process

Scrawl will run all Animation objects whose ANIMATIONNAME Strings are included in the __scrawl.animate__ Array

All animation can be halted by setting the __scrawl.doAnimation__ flag to false

To restart animation, either call __scrawl.initialize()__, or set _scrawl.doAnimation_ to true and call __scrawl.animationLoop()

@method animationLoop
@return Recursively calls itself - never returns
**/
		animationLoop: function(){
			for(var i=0, z=scrawl.animate.length; i<z; i++){
				if(scrawl.animate[i]){
					scrawl.animation[scrawl.animate[i]].fn();
					}
				}
			if(scrawl.doAnimation){
				window.requestAnimFrame(function(){
					scrawl.animationLoop();
					});
				}
			},

		};		//end of scrawl object
	
/**
# Scrawl 

_Note: capital S_
	
## Instantiation

* This object should never be instantiated by users
	
## Purpose

* the root object for all other scrawl objects (except Vectors)
* gives every object its (unique) name attribute
* also supplies title and comment attributes (very basic assistive technology)
* provides basic getter and setter functions, and a JSON-based toString function
* sets out the cloning strategy for other objects, and restricts which object types can be cloned
@class Scrawl
@constructor
@chainable
@param {Object} [items] Key:value Object argument for setting attributes
@return this
**/		
	function Scrawl(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
/**
Unique identifier for each object; default: computer-generated String based on Object's type
@property name
@type String
**/		
		this.name = scrawl.makeName({name: items.name || '', type: this.type, target: this.classname});
		return this;
		}
/**
@property type
@type String
@default 'Scrawl'
@final
**/		
	Scrawl.prototype.type = 'Scrawl';
	Scrawl.prototype.classname = 'objectnames';
	scrawl.d.Scrawl = {
		//name is deliberately left out of the defaults - can never be a default name
/**
Comment, for accessibility
@property comment
@type String
@default ''
**/		
		comment: '',
/**
Title, for accessibility
@property title
@type String
@default ''
**/		
		title: '',
/**
Creation timestamp
@property timestamp
@type String
@default ''
**/		
		timestamp: '',
		};

/**
Retrieve an attribute value
@method get
@param {String} item Attribute key
@return Attribute value
**/
	Scrawl.prototype.get = function(item){
		return this[item] || scrawl.d[this.type][item];
		};

/**
Set attribute values
@method set
@param {Object} items Object containing attribute key:value pairs
@return this
@chainable
**/
	Scrawl.prototype.set = function(items){
		for(var i in items){
			if(scrawl.xt(scrawl.d[this.type][i])){
				this[i] = items[i];
				}
			}
		return this;
		};

/**
Clone a Scrawl.js object, optionally altering attribute values in the cloned object

The following objects can be cloned: 

* AnimSheet
* Block
* Color
* Context
* Gradient
* Link
* Outline
* Particle
* Pattern
* Picture
* Phrase
* Point
* RadialGradient
* ScrawlImage
* Shape
* Spring
* Vector
* Wheel
@method clone
@param {Object} items Object containing attribute key:value pairs; will overwrite existing values in the cloned, but not the source, Object
@return Cloned object
@chainable
**/
	Scrawl.prototype.clone = function(items){
		var b = scrawl.mergeOver(this.parse(), ((scrawl.isa(items,'obj')) ? items : {}));
		delete b.context;	//required for successful cloning of sprites
		switch(this.type){
			case 'Phrase' : return new Phrase(b); break;
			case 'Block' : return new Block(b); break;
			case 'Wheel' : return new Wheel(b); break;
			case 'Picture' : return new Picture(b); break;
			case 'Outline' : return new Outline(b); break;
			case 'Shape' : return scrawl.makePath(b); break;
			case 'Gradient' : return new Gradient(b); break;
			case 'RadialGradient' : return new RadialGradient(b); break;
			case 'Pattern' : return new Pattern(items); break;
			case 'Color' : return new Color(b); break;
			case 'Point' : return new Point(b); break;
			case 'Link' : return new Link(b); break;
			case 'Context' : return new Context(b); break;
			case 'AnimSheet' : return new AnimSheet(b); break;
			case 'Particle' : return new Particle(b); break;
			case 'Vector' : return new Vector(b); break;
			case 'Spring' : return new Spring(b); break;
			case 'ScrawlImage' : return new ScrawlImage(b); break;
			}
		return false;
		};

/**
Turn the object into a JSON String
@method toString
@return JSON string of non-default value attributes
**/
	Scrawl.prototype.toString = function(){
		var keys = Object.keys(scrawl.d[this.type]),
			result = {};
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		return JSON.stringify(result);
		};

/**
Produces a copy (not clone) of the object
@method parse
@return JSON.parse(JSON.stringify(this))
**/
	Scrawl.prototype.parse = function(){
		return JSON.parse(JSON.stringify(this));
		};

/**
# Vector

## Instantiation

* scrawl.newVector()

## Purpose

* To hold vector (coordinate, movement) data
@class Vector
@constructor
@param {Object} [items] Key:value Object argument for setting attributes
@return this
@chainable
**/		
	function Vector(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.x = items.x || 0;
		this.y = items.y || 0;
		this.z = items.z || 0;
		return this;
		}
	Vector.prototype = Object.create(Object.prototype);
/**
@property type
@type String
@default 'Vector'
@final
**/
	Vector.prototype.type = 'Vector';
	scrawl.d.Vector = {
/**
X coordinate (px)
@property x
@type Number
@default 0
**/		
		x: 0,
/**
Y coodinate (px)
@property y
@type Number
@default 0
**/		
		y: 0,
/**
Z coordinate (px)
@property z
@type Number
@default 0
**/		
		z: 0,
		};

/**
Set the Vector's coordinates to values that will result in the given magnitude
@method setMagnitudeTo
@param {Number} item New magnitude
@return This
@chainable
**/
	Vector.prototype.setMagnitudeTo = function(item){
		this.normalize();
		this.scalarMultiply(item);
		if(this.getMagnitude() !== item){
			this.normalize();
			this.scalarMultiply(item);
			if(this.getMagnitude() !== item){
				this.normalize();
				this.scalarMultiply(item);
				}
			}
		return this;
		};

/**
Normalize the Vector to a unit vector
@method normalize
@return This on success; false if magnitude == 0
@chainable
**/
	Vector.prototype.normalize = function(){
		var m = this.getMagnitude();
		if(m > 0){
			this.x /= m;
			this.y /= m;
			this.z /= m;
			return this;
			}
		return false;
		};

/**
Set attributes to new values
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	Vector.prototype.set = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.x = items.x || 0;
		this.y = items.y || 0;
		this.z = items.z || 0;
		return this;
		};

/**
Return a normalized (unit) copy of the Vector
@method getNormal
@return Amended copy of this; or false if magnitude === 0
@chainable
**/
	Vector.prototype.getNormal = function(){
		var m = this.getMagnitude();
		if(m > 0){
			return new Vector({
				x: this.x/m,
				y: this.y/m,
				z: this.z/m,
				});
			}
		return false;
		};

/**
Rotate the Vector by a given angle
@method rotate
@param {Number} angle Rotation angle (in degrees)
@return This on success; false otherwise
@chainable
**/
	Vector.prototype.rotate = function(angle){
		if(scrawl.xt(angle)){
			var a = Math.atan2(this.y, this.x);
			a += (angle * scrawl.radian);
			var m = this.getMagnitude();
			this.x = m * Math.cos(a);
			this.y = m * Math.sin(a);
			return this;
			}
		return false;
		};

/**
Rotate a copy of the vector by a given angle
@method getRotate
@param {Number} angle Rotation angle (in degrees)
@return Amended copy of this on success; false otherwise
@chainable
**/
	Vector.prototype.getRotate = function(angle){
		if(scrawl.xt(angle)){
			var a = Math.atan2(this.y, this.x);
			a += (angle * scrawl.radian);
			var m = this.getMagnitude();
			return new Vector({
				x: m * Math.cos(a),
				y: m * Math.sin(a),
				});
			}
		return false;
		};

/**
Rotate the Vector by 180 degrees
@method reverse
@return {Object} This on success; false otherwise
@chainable
**/
	Vector.prototype.reverse = function(){
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
		};

/**
Compare two Vector objects for equality
@method isEqual
@return True if all attributes match; false otherwise
**/
	Vector.prototype.isEqual = function(item){
		if(scrawl.isa(item,'obj') && scrawl.xt(item.type) && item.type === 'Vector'){
			if(this.x === item.x && this.y === item.y && this.z === item.z){
				return true;
				}
			}
		return false;
		};

/**
Comparea vector-like object to this one for equality
@method isLike
@return True if all attributes match; false otherwise
**/
	Vector.prototype.isLike = function(item){
		if(scrawl.isa(item,'obj')){
			if(this.x === item.x && this.y === item.y && this.z === item.z){
				return true;
				}
			}
		return false;
		};

/**
Rotate a copy of the Vector by 180 degrees
@method getReverse
@return Amended copy of this on success; false otherwise
@chainable
**/
	Vector.prototype.getReverse = function(){
		return new Vector({
			x: -this.x,
			y: -this.y,
			z: -this.z,
			});
		};

/**
Add a Vector to this Vector
	
@method vectorAdd
@param {Vector} item Vector to be added to this; can also be an Object with x, y and z attributes (all optional)
@return This on success; false otherwise
@chainable
**/
	Vector.prototype.vectorAdd = function(item){
		if(scrawl.isa(item,'obj')){
			this.x += item.x || 0;
			this.y += item.y || 0;
			this.z += item.z || 0;
			return this;
			}
		return false;
		};

/**
Subtract a Vector from this Vector
@method vectorSubtract
@param {Object} item Vector to be subtracted from this; can also be an Object with x, y and z attributes (all optional)
@return This on success; false otherwise
@chainable
**/
	Vector.prototype.vectorSubtract = function(item){
		if(scrawl.isa(item,'obj')){
			this.x -= item.x || 0;
			this.y -= item.y || 0;
			this.z -= item.z || 0;
			return this;
			}
		return false;
		};

/**
Multiply a Vector with this Vector
@method vectorMultiply
@param {Object} item Vector to be multiplied with this; can also be an Object with x, y and z attributes (all optional)
@return This on success; false otherwise
@chainable
**/
	Vector.prototype.vectorMultiply = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Vector'){
			this.x *= item.x || 1;
			this.y *= item.y || 1;
			this.z *= item.z || 1;
			return this;
			}
		return false;
		};

/**
Divide a Vector into this Vector
@method vectorDivide
@param {Object} item Vector to be divided into this; can also be an Object with x, y and z attributes (all optional)
@return This on success; false otherwise
@chainable
**/
	Vector.prototype.vectorDivide = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Vector'){
			this.x /= ((item.x || 0) !== 0) ? item.x : 1;
			this.y /= ((item.y || 0) !== 0) ? item.y : 1;
			this.z /= ((item.z || 0) !== 0) ? item.z : 1;
			return this;
			}
		return false;
		};

/**
Multiply this Vector by a scalar value
@method scalarMultiply
@param {Number} item Multiplier scalar
@return This on success; false otherwise
@chainable
**/
	Vector.prototype.scalarMultiply = function(item){
		if(scrawl.isa(item,'num')){
			this.x *= item;
			this.y *= item;
			this.z *= item;
			return this;
			}
		return false;
		};

/**
Divide this Vector by a scalar value
@method scalarDivide
@param {Number} item Division scalar
@return This on success; false otherwise
@chainable
**/
	Vector.prototype.scalarDivide = function(item){
		if(scrawl.isa(item,'num') && item !== 0){
			this.x /= item;
			this.y /= item;
			this.z /= item;
			return this;
			}
		return false;
		};

/**
Retrieve Vector's magnitude value
@method getMagnitude
@return Magnitude
**/
	Vector.prototype.getMagnitude = function(){
		return Math.sqrt((this.x*this.x) + (this.y*this.y) + (this.z*this.z));
		};

/**
Check to see if Vector is a zero vector
@method checkNotZero 
@return True if vector is non-zero; false otherwise
**/
	Vector.prototype.checkNotZero = function(){
		if(this.x || this.y || this.z){
			return true;
			}
		return false;
		};

/**
Return a clone of this Vector
@method getVector
@return Clone of this Vector
**/
	Vector.prototype.getVector = function(){
		return new Vector({
			x: this.x, 
			y: this.y, 
			z: this.z
			});
		};

/**
Alias of Vector.getReverse()
@method getConjugate
@return Amended copy of this on success; false otherwise
@chainable
@deprecated
**/
	Vector.prototype.getConjugate = function(){
		return this.getReverse();
		};

/**
Add a Vector to a copy of this, or another, vector
@method getVectorAdd
@param {Object} u Vector to be added to source Vector; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source Vector (by default: this)
@return Amended copy of source Vector on success; false otherwise
@chainable
**/
	Vector.prototype.getVectorAdd = function(u, v){
		if(scrawl.isa(u,'obj')){
			v = (scrawl.isa(v,'obj') && v.type === 'Vector') ? v : this;
			return new Vector({
				x: v.x + (u.x || 0),
				y: v.y + (u.y || 0),
				z: v.z + (u.z || 0),
				});
			}
		return false;
		};

/**
Subtract a Vector from a copy of this, or another, Vector
@method getVectorSubtract
@param {Object} u Vector to be subtracted from source Vector; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source Vector (by default: this)
@return Amended copy of source Vector on success; false otherwise
@chainable
**/
	Vector.prototype.getVectorSubtract = function(u, v){
		if(scrawl.isa(u,'obj')){
			v = (scrawl.isa(v,'obj') && v.type === 'Vector') ? v : this;
			return new Vector({
				x: v.x - (u.x || 0),
				y: v.y - (u.y || 0),
				z: v.z - (u.z || 0),
				});
			}
		return false;
		};

/**
Multiply a Vector with a copy of this, or another, Vector
@method getVectorMultiply
@param {Object} u Vector to be multiplied with source Vector; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source Vector (by default: this)
@return Amended copy of source Vector on success; false otherwise
@chainable
**/
	Vector.prototype.getVectorMultiply = function(u, v){
		if(scrawl.isa(u,'obj')){
			v = (scrawl.isa(v,'obj') && v.type === 'Vector') ? v : this;
			return new Vector({
				x: v.x * (u.x || 1),
				y: v.y * (u.y || 1),
				z: v.z * (u.z || 1),
				});
			}
		return false;
		};

/**
Divide a Vector into a copy of this, or another, Vector

Arithmetic is v/u, not u/v

@method getVectorDivide
@param {Object} u Vector to be divided into source Vector; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source vector (by default: this)
@return Amended copy of source Vector on success; false otherwise
@chainable
**/
	Vector.prototype.getVectorDivide = function(u, v){
		if(scrawl.isa(u,'obj')){
			v = (scrawl.isa(v,'obj') && v.type === 'Vector') ? v : this;
			return new Vector({
				x: ((u.x || 0) !== 0) ? v.x / (u.x || 1) : v.x,
				y: ((u.y || 0) !== 0) ? v.y / (u.y || 1) : v.y,
				z: ((u.z || 0) !== 0) ? v.z / (u.z || 1) : v.z,
				});
			}
		return false;
		};

/**
Multiply a copy of this Vector by a scalar value
@method getScalarMultiply
@param {Number} item Scalar value
@return Amended copy of this on success; false otherwise
@chainable
**/
	Vector.prototype.getScalarMultiply = function(item){
		if(scrawl.isa(item,'num')){
			return new Vector({
				x: this.x * item,
				y: this.y * item,
				z: this.z * item,
				});
			}
		return false;
		};

/**
Divide a scalar value into a copy of this Vector
@method getScalarDivide
@param {Number} item Scalar value
@return Amended copy of this on success; false otherwise
@chainable
**/
	Vector.prototype.getScalarDivide = function(item){
		if(scrawl.isa(item,'num')){
			return new Vector({
				x: this.x / item,
				y: this.y / item,
				z: this.z / item,
				});
			}
		return false;
		};

/**
Obtain the cross product of one Vector and a copy of this, or another, Vector

Arithmetic is v(crossProduct)u, not u(crossProduct)v

@method getCrossProduct
@param {Object} u Vector to be used to calculate cross product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source vector (by default: this)
@return New cross product Vector; false on failure
@chainable
**/
	Vector.prototype.getCrossProduct = function(u, v){
		if(scrawl.isa(u,'obj') && u.type === 'Vector'){
			v = (scrawl.isa(v,'obj') && v.type === 'Vector') ? v : this;
			var v1x = v.x || 0;
			var v1y = v.y || 0;
			var v1z = v.z || 0;
			var v2x = u.x || 0;
			var v2y = u.y || 0;
			var v2z = u.z || 0;
			return new Vector({
				x: (v1y*v2z) - (v1z*v2y),
				y: -(v1x*v2z) + (v1z*v2x),
				z: (v1x*v2y) + (v1y*v2x),
				});
			}
		return false;
		};

/**
Obtain the dot product of one Vector and this, or another, Vector

Arithmetic is v(dotProduct)u, not u(dotProduct)v

@method getDotProduct
@param {Object} u Vector to be used to calculate dot product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source vector (by default: this)
@return Dot product result; false on failure
**/
	Vector.prototype.getDotProduct = function(u, v){
		if(scrawl.isa(u,'obj') && u.type === 'Vector'){
			v = (scrawl.isa(v,'obj') && v.type === 'Vector') ? v : this;
			return ((u.x || 0) * (v.x || 0)) + ((u.y || 0) * (v.y || 0)) + ((u.z || 0) * (v.z || 0));
			}
		return false;
		};

/**
Obtain the triple scalar product of two Vectors and this, or a third, Vector
@method getTripleScalarProduct
@param {Object} u First vector to be used to calculate triple scalar product; can also be an Object with x, y and z attributes (all optional)
@param {Object} v Second vector to be used to calculate triple scalar product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [w] Third vector to be used to calculate triple scalar product (by default: this)
@return Triple scalar product result; false on failure
**/
	Vector.prototype.getTripleScalarProduct = function(u, v, w){
		if(scrawl.isa(u,'obj') && u.type === 'Vector' && scrawl.isa(v,'obj') && v.type === 'Vector'){
			w = (scrawl.xt(w)) ? ((scrawl.isa(w,'obj')) ? w : {}) : this;
			var ux = u.x || 0;
			var uy = u.y || 0;
			var uz = u.z || 0;
			var vx = v.x || 0;
			var vy = v.y || 0;
			var vz = v.z || 0;
			var wx = w.x || 0;
			var wy = w.y || 0;
			var wz = w.z || 0;
			return (ux*((vy*wz)-(vz*wy))) + (uy*(-(vx*wz)+(vz*wx))) + (uz*((vx*wy)-(vy*wx)));
			}
		return false;
		};

/**
Rotate a Vector object by a Quaternion rotation
@method quaternionMultiply
@param {Quaternion} item Quaternion object
@param {Number} [mag] Magnitude value to which Vector needs to be set after rotation
@return This
@chainable
**/
	Vector.prototype.quaternionMultiply = function(item, mag){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			mag = (scrawl.xt(mag)) ? mag : this.getMagnitude();
			var conjugate = item.getConjugate();
			var result = item.getVectorMultiply(this);
			result.quaternionMultiply(conjugate);
			this.x = result.v.x;
			this.y = result.v.y;
			this.z = result.v.z;
			this.setMagnitudeTo(mag);
			return this;
			}
		return false;
		};

/**
Rotate a Vector object by a Quaternion rotation
@method quaternionMultiply
@param {Quaternion} item Quaternion object
@param {Number} [mag] Magnitude value to which Vector needs to be set after rotation
@return Rotated Vector object
**/
	Vector.prototype.getQuaternionMultiply = function(item, mag){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			mag = (scrawl.xt(mag)) ? mag : this.getMagnitude();
			var conjugate = item.getConjugate();
			var result = item.getVectorMultiply(this);
			result.quaternionMultiply(conjugate);
			result.v.setMagnitudeTo(mag);
			return result.v;
			}
		return false;
		};

/**
# Quaternion

## Instantiation

* scrawl.newQuaternion()

## Purpose

* To hold quaternion (3d rotation) data
@class Quaternion
@constructor
@param {Object} [items] Key:value Object argument for setting attributes
@return this
@chainable
**/		
	function Quaternion(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var vector = (scrawl.xt(items.v)) ? items.v : {};
		this.n = items.n || 1;
		this.v = new Vector({
			x: vector.x || 0,
			y: vector.y || 0,
			z: vector.z || 0,
			})
		return this;
		}
	Quaternion.prototype = Object.create(Object.prototype);
/**
@property type
@type String
@default 'Quaternion'
@final
**/
	Quaternion.prototype.type = 'Quaternion';
	scrawl.d.Quaternion = {
/**
3d rotation value
@property n
@type Number
@default 1
**/		
		n: 1,
/**
3d rotation axis
@property v
@type Vector
@default {x:0, y:0, z:0}
**/		
		v: {x:0,y:0,z:0},
		};

/**
Calculate magnitude of a quaternion
@method getMagnitude
@return Magnitude value
**/
	Quaternion.prototype.getMagnitude = function(){
		return Math.sqrt((this.n*this.n) + (this.v.x*this.v.x) + (this.v.y*this.v.y) + (this.v.z*this.v.z));
		};

/**
Normalize the quaternion
@method normalize
@return This
@chainable
**/
	Quaternion.prototype.normalize = function(){
		var mag = this.getMagnitude();
		if(mag !== 0){
			this.n /= mag;
			this.v.x /= mag;
			this.v.y /= mag;
			this.v.z /= mag;
			}
		return this;
		};

/**
Normalize the quaternion
@method getNormal
@return Normalized quaternion
**/
	Quaternion.prototype.getNormal = function(){
		var mag = this.getMagnitude();
		if(mag !== 0){
			return new Quaternion({
				n: this.n/mag,
				v: new Vector({
					x: this.v.x/mag,
					y: this.v.y/mag,
					z: this.v.z/mag,
					}),
				});
			}
		return false;
		};

/**
Check to see if quaternion is a unit quaternion, within permitted tolerance
@method checkNormal
@param {Number} [tolerance] Tolerance value; default: 0
@return True if quaternion is a normalized quaternion; false otherwise
**/
	Quaternion.prototype.checkNormal = function(tolerance){
		tolerance = (scrawl.xt(tolerance)) ? tolerance : 0;
		var check = this.n + this.v.x + this.v.y + this.v.z;
		if(check >= 1-tolerance && check <= 1+tolerance){
			return true;
			}
		return false;
		};

/**
Retrieve quaternion's vector (rotation axis) component
@method getVector
@return Vector component
**/
	Quaternion.prototype.getVector = function(){
		return this.v.getVector();
		};

/**
Retrieve quaternion's scalar (rotation around axis) component
@method getScalar
@return Number - scalar component of this quaternion
**/
	Quaternion.prototype.getScalar = function(){
		return this.n;
		};

/**
Add a quaternion to this quaternion
@method quaternionAdd
@param {Quaternion} item Quaternion to be added to this quaternion
@return This on success; false otherwise
@chainable
**/
	Quaternion.prototype.quaternionAdd = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			this.n += item.n || 0;
			this.v.x += item.v.x || 0;
			this.v.y += item.v.y || 0;
			this.v.z += item.v.z || 0;
			return this;
			}
		return false;
		};

/**
Subtract a quaternion from this quaternion
@method quaternionSubtract
@param {Quaternion} item Quaternion to be subtracted from this quaternion
@return This on success; false otherwise
@chainable
**/
	Quaternion.prototype.quaternionSubtract = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			this.n -= item.n || 0;
			this.v.x -= item.v.x || 0;
			this.v.y -= item.v.y || 0;
			this.v.z -= item.v.z || 0;
			return this;
			}
		return false;
		};

/**
Multiply quaternion by a scalar value
@method scalarMultiply
@param {Number} item Value to multiply quaternion by
@return This on success; false otherwise
@chainable
**/
	Quaternion.prototype.scalarMultiply = function(item){
		if(scrawl.isa(item,'num')){
			this.n *= item;
			this.v.x *= item;
			this.v.y *= item;
			this.v.z *= item;
			return this;
			}
		return false;
		};

/**
Divide quaternion by a scalar value
@method scalarDivide
@param {Number} item Value to divide quaternion by
@return This on success; false otherwise
@chainable
**/
	Quaternion.prototype.scalarDivide = function(item){
		if(scrawl.isa(item,'num') && item !== 0){
			this.n /= item;
			this.v.x /= item;
			this.v.y /= item;
			this.v.z /= item;
			return this;
			}
		return false;
		};

/**
Get the conjugate (reversed) value for this quaternion
@method getConjugate
@return Conjugated quaternion
**/
	Quaternion.prototype.getConjugate = function(){
		return new Quaternion({
			n: this.n,
			v: new Vector({
				x: -this.x,
				y: -this.y,
				z: -this.z,
				}),
			});
		};

/**
Add a quaternion to this quaternion
@method getQuaternionAdd
@param {Quaternion} item Quaternion to be added to this quaternion
@return New quaternion on success; false otherwise
**/
	Quaternion.prototype.getQuaternionAdd = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			return new Quaternion({
				n: this.n + item.n,
				v: new Vector({
					x: this.v.x + item.v.x,
					y: this.v.y + item.v.y,
					z: this.v.z + item.v.z,
					}),
				});
			}
		return false;
		};

/**
Subtract a quaternion from this quaternion
@method getQuaternionSubtract
@param {Quaternion} item Quaternion to be subtracted from this quaternion
@return New quaternion on success; false otherwise
**/
	Quaternion.prototype.getQuaternionSubtract = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			return new Quaternion({
				n: this.n - item.n,
				v: new Vector({
					x: this.v.x - item.v.x,
					y: this.v.y - item.v.y,
					z: this.v.z - item.v.z,
					}),
				});
			}
		return false;
		};

/**
Multiply quaternion by a scalar value
@method getScalarMultiply
@param {Number} item Value to multiply quaternion by
@return New quaternion on success; false otherwise
**/
	Quaternion.prototype.getScalarMultiply = function(item){
		if(scrawl.isa(item,'num')){
			return new Quaternion({
				n: this.n * item,
				v: new Vector({
					x: this.v.x * item,
					y: this.v.y * item,
					z: this.v.z * item,
					}),
				});
			}
		return false;
		};

/**
Divide quaternion by a scalar value
@method getScalarDivide
@param {Number} item Value to divide quaternion by
@return New quaternion on success; false otherwise
**/
	Quaternion.prototype.getScalarDivide = function(item){
		if(scrawl.isa(item,'num') && item !== 0){
			return new Quaternion({
				n: this.n / item,
				v: new Vector({
					x: this.v.x / item,
					y: this.v.y / item,
					z: this.v.z / item,
					}),
				});
			}
		return false;
		};

/**
Multiply this quaternion by a second quaternion

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method quaternionMultiply
@param {Quaternion} item Quaternion to multiply this quaternion by
@return This on success; false otherwise
@chainable
**/
	Quaternion.prototype.quaternionMultiply = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			var n1 = this.n,
				x1 = this.v.x,
				y1 = this.v.y,
				z1 = this.v.z,
				n2 = item.n,
				x2 = item.v.x,
				y2 = item.v.y,
				z2 = item.v.z;
			this.n = (n1*n2) - (x1*x2) - (y1*y2) - (z1*z2);
			this.v.x = (n1*x2) + (x1*n2) + (y1*z2) - (z1*y2);
			this.v.y = (n1*y2) + (y1*n2) + (z1*x2) - (x1*z2);
			this.v.z = (n1*z2) + (z1*n2) + (x1*y2) - (y1*x2);
			return this;
			}
		return false;
		};

/**
Multiply this quaternion by a second quaternion

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method getQuaternionMultiply
@param {Quaternion} item Quaternion to multiply this quaternion by
@return New quaternion on success; false otherwise
@chainable
**/
	Quaternion.prototype.getQuaternionMultiply = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			var n1 = this.n,
				x1 = this.v.x,
				y1 = this.v.y,
				z1 = this.v.z,
				n2 = item.n,
				x2 = item.v.x,
				y2 = item.v.y,
				z2 = item.v.z,
				q = new Quaternion({
					n: (n1*n2) - (x1*x2) - (y1*y2) - (z1*z2),
					v: new Vector({
						x: (n1*x2) + (x1*n2) + (y1*z2) - (z1*y2),
						y: (n1*y2) + (y1*n2) + (z1*x2) - (x1*z2),
						z: (n1*z2) + (z1*n2) + (x1*y2) - (y1*x2),
						}),
					});
			return q;
			}
		return false;
		};

/**
Multiply this quaternion by a Vector

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method getVectorMultiply
@param {Vector} item Vector to multiply this quaternion by
@return New quaternion on success; false otherwise
**/
	Quaternion.prototype.getVectorMultiply = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Vector'){
			var n1 = this.n,
				x1 = this.v.x,
				y1 = this.v.y,
				z1 = this.v.z,
				x2 = item.x,
				y2 = item.y,
				z2 = item.z,
				q = new Quaternion({
					n: -((x1*x2) + (y1*y2) + (z1*z2)),
					v: new Vector({
						x: (n1*x2) + (y1*z2) - (z1*y2),
						y: (n1*y2) + (z1*x2) - (x1*z2),
						z: (n1*z2) + (x1*y2) - (y1*x2),
						}),
					});
			return q;
			}
		return false;
		};

/**
Multiply this quaternion by a Vector

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method getVectorMultiply
@param {Vector} item Vector to multiply this quaternion by
@return This on success; false otherwise
@chainable
**/
	Quaternion.prototype.vectorMultiply = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Vector'){
			var n1 = this.n,
				x1 = this.v.x,
				y1 = this.v.y,
				z1 = this.v.z,
				x2 = item.x,
				y2 = item.y,
				z2 = item.z;
			this.n = -((x1*x2) + (y1*y2) + (z1*z2));
			this.v.x = (n1*x2) + (y1*z2) - (z1*y2);
			this.v.y = (n1*y2) + (z1*x2) - (x1*z2);
			this.v.z = (n1*z2) + (x1*y2) - (y1*x2);
			return this;
			}
		return false;
		};

/**
Retrieve rotational component of this quaternion
@method getAngle
@param {Boolean} [degree] Returns rotation in degrees if true; false (radians) by default
@return Rotation angle
**/
	Quaternion.prototype.getAngle = function(degree){
		degree = (scrawl.xt(degree)) ? degree : false;
		var result = 2 * Math.acos(this.n);
		return (degree) ? result * (1/scrawl.radian) : result;
		};

/**
Retrieve axis component of this quaternion
@method getAxis
@return Normalized Vector
**/
	Quaternion.prototype.getAxis = function(){
		var vector = this.getVector(),
			magnitude = this.getMagnitude();
		return (magnitude !==0) ? vector.scalarDivide(magnitude) : vector;
		};

/**
Rotate this quaternion by another quaternion
@method quaternionRotate
@param {Quaternion} item Quaternion to rotate this quaternion by
@return Rotated quaternion
**/
	Quaternion.prototype.quaternionRotate = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Quaternion'){
			var conjugate = this.getConjugate(),
				result = this.getQuaternionMultiply(item);
			return result.quaternionMultiply(conjugate);
			}
		return false;
		};

/**
Rotate a Vector by this quaternion
@method vectorRotate
@param {Vector} item Vector to be rotated by this quaternion
@return Rotated Vector
**/
	Quaternion.prototype.vectorRotate = function(item){
		if(scrawl.isa(item,'obj') && item.type === 'Vector'){
			var conjugate = this.getConjugate(),
				temp = this.getVectorMultiply(item),
				result = temp.quaternionMultiply(conjugate);
			return result.getVector();
			}
		return false;
		};

/**
Build a quaternion from Euler angle values

Argument object can be in the form, where all values (which default to 0) are in degrees:
* {pitch:Number, yaw:Number, roll:Number}
* {x:Number, y:Number, z:Number}
* or a mixture of the two
@method makeQuaternion
@param {Object} [items] Key:value Object argument for setting attributes
@return New quaternion
**/
	Quaternion.prototype.makeQuaternion = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {}; 
		var pitch = (items.pitch || items.x || 0) * scrawl.radian,
			yaw = (items.yaw || items.y || 0) * scrawl.radian,
			roll = (items.roll || items.z || 0) * scrawl.radian,
			qPitch = new Quaternion({
				n: Math.cos(pitch/2),
				v: new Vector({
					x: Math.sin(pitch/2),
					}),
				}),
			qYaw = new Quaternion({
				n: Math.cos(yaw/2),
				v: new Vector({
					y: Math.sin(yaw/2),
					}),
				}),
			qRoll = new Quaternion({
				n: Math.cos(roll/2),
				v: new Vector({
					z: Math.sin(roll/2),
					}),
				}),
			qResult1 = qYaw.getQuaternionMultiply(qPitch),
			qResult2 = qResult1.getQuaternionMultiply(qRoll);
		qResult2.normalize();
		return qResult2;
		};

/**
Retrieve rotations (Euler angles) from a quaternion
@method getEulerAngles
@return Object in the form {pitch:Number, yaw:Number, roll:Number}
**/
	Quaternion.prototype.getEulerAngles = function(){
		var q00 = this.n * this.n;
		var q11 = this.v.x * this.v.x;
		var q22 = this.v.y * this.v.y;
		var q33 = this.v.z * this.v.z;
		var r11 = q00 + q11 - q22 - q33;
		var r21 = 2 * ((this.v.x * this.v.y) + (this.n * this.v.z));
		var r31 = 2 * ((this.v.x * this.v.z) - (this.n * this.v.y));
		var r32 = 2 * ((this.v.y * this.v.z) + (this.n * this.v.x));
		var r33 = q00 - q11 - q22 + q33;
		var temp = Math.abs(r31);
		var deg = 1/scrawl.radian;
		var result = {};
		if(temp > 0.999999){
			var r12 = 2 * ((this.v.x * this.v.y) - (this.n * this.v.z));
			var r13 = 2 * ((this.v.x * this.v.z) + (this.n * this.v.y));
			result.pitch = 0.0;
			result.yaw = (-(Math.pi/2)*(r31/temp))*deg;
			result.roll = (Math.atan2(-r12,(-r31*r13)))*deg;
			}
		else{
			result.pitch = (Math.atan2(r32, r33))*deg;
			result.yaw = (Math.asin(-r31))*deg;
			result.roll = (Math.atan2(r21, r11))*deg;
			}
		return result;
		};

/**
# SubScrawl
	
## Instantiation

* This object should never be instantiated by users

## Purpose

* supplies objects with basic positional and scaling attributes, and methods for manipulating them
* start coordinates are relative to the top left corner of the object's Cell
* delta and handle coordinates are relative to the object's start coordinate
* pathPlace values are between 0 and 1, representing the distance along a Shape path

@class SubScrawl
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function SubScrawl(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var temp;
		Scrawl.call(this, items);
		temp = (scrawl.isa(items.start,'obj')) ? items.start : {};
		this.start = new Vector({
			x: (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(temp.x)) ? temp.x : 0),
			y: (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(temp.y)) ? temp.y : 0),
			});
		temp = (scrawl.isa(items.delta,'obj')) ? items.delta : {};
		this.delta = new Vector({
			x: (scrawl.xt(items.deltaX)) ? items.deltaX : ((scrawl.xt(temp.x)) ? temp.x : 0),
			y: (scrawl.xt(items.deltaY)) ? items.deltaY : ((scrawl.xt(temp.y)) ? temp.y : 0),
			});
		temp = (scrawl.isa(items.handle,'obj')) ? items.handle : {};
		this.handle = new Vector({
			x: (scrawl.xt(items.handleX)) ? items.handleX : ((scrawl.xt(temp.x)) ? temp.x : 0),
			y: (scrawl.xt(items.handleY)) ? items.handleY : ((scrawl.xt(temp.y)) ? temp.y : 0),
			});
		this.pivot = items.pivot || scrawl.d[this.type].pivot;
		this.path = items.path || scrawl.d[this.type].path;
		this.pathRoll = items.pathRoll || scrawl.d[this.type].pathRoll;
		this.addPathRoll = items.addPathRoll || scrawl.d[this.type].addPathRoll;
		this.pathSpeedConstant = (scrawl.isa(items.pathSpeedConstant,'bool')) ? items.pathSpeedConstant : scrawl.d[this.type].pathSpeedConstant;
		this.pathPlace = items.pathPlace || scrawl.d[this.type].pathPlace;
		this.deltaPathPlace = items.deltaPathPlace || scrawl.d[this.type].deltaPathPlace;
		this.scale = (scrawl.isa(items.scale,'num')) ? items.scale : scrawl.d[this.type].scale;
		return this;
		}
	SubScrawl.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'SubScrawl'
@final
**/
	SubScrawl.prototype.type = 'SubScrawl';
	SubScrawl.prototype.classname = 'objectnames';
	scrawl.d.SubScrawl = {
/**
The coordinate Vector representing the object's rotation/flip point

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __startX__ - (Number) the x coordinate of the object's rotation/flip point, in pixels, from the left side of the object's cell
* __startY__ - (Number) the y coordinate of the object's rotation/flip point, in pixels, from the top side of the object's cell

@property start
@type Vector
**/		
		start: {x:0,y:0,z:0},
/**
A change Vector which can be applied to the object's rotation/flip point

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __deltaX__ - (Number) a horizontal change value, in pixels
* __deltaY__ - (Number) a vertical change value, in pixels

@property delta
@type Vector
**/		
		delta: {x:0,y:0,z:0},
/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property handle
@type Object
**/		
		handle: {x:0,y:0,z:0},
/**
The SPRITENAME or POINTNAME of a sprite or Point object to be used for setting this object's start point
@property pivot
@type String
@default ''
**/		
		pivot: '',
/**
The SPRITENAME of a Shape sprite whose path is used to calculate this object's start point
@property path
@type String
@default ''
**/		
		path: '',
/**
A value between 0 and 1 to represent the distance along a Shape object's path, where 0 is the path start and 1 is the path end
@property pathPlace
@type Number
@default 0
**/
		pathPlace: 0,
/**
A change value which can be applied to the object's pathPlace attribute
@property deltaPathPlace
@type Number
@default 0
**/
		deltaPathPlace: 0,
/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		scale: 1,
/**
A flag to determine whether the object will calculate its position along a Shape path in a regular (true), or simple (false), manner
@property pathSpeedConstant
@type Boolean
@default true
**/		
		pathSpeedConstant: true,
/**
The rotation value (in degrees) of an object's current position along a Shape path
@property pathRoll
@type Number
@default 0
**/		
		pathRoll: 0,
/**
A flag to determine whether the object will calculate the rotation value of its current position along a Shape path
@property addPathRoll
@type Boolean
@default false
**/		
		addPathRoll: false,
		};
	scrawl.mergeInto(scrawl.d.SubScrawl, scrawl.d.Scrawl);

/**
Turn the object into a JSON String
@method toString
@return JSON string of non-default value attributes
**/
	SubScrawl.prototype.toString = function(){
		var keys = Object.keys(scrawl.d[this.type]),
			result = {};
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.contains(['start', 'delta', 'handle'], keys[i])){
				if(!this[keys[i]].isLike(scrawl.d[this.type][keys[i]])){
					result[keys[i]] = this[keys[i]];
					}
				}
			else if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		return JSON.stringify(result);
		};
		
/**
Overrides Scrawl.get(), to allow users to get values for startX, startY, deltaX, deltaY, handleX, handleY
@method get
@param {String} get Attribute key
@return Attribute value
**/
	SubScrawl.prototype.get = function(item){
		var u;
		if(scrawl.contains(['startX','startY','handleX','handleY','deltaX','deltaY'], item)){
			switch(item){
				case 'startX' : return this.start.x; break;
				case 'startY' : return this.start.y; break;
				case 'handleX' : return this.handle.x; break;
				case 'handleY' : return this.handle.y; break;
				case 'deltaX' : return this.delta.x; break;
				case 'deltaY' : return this.delta.y; break;
				}
			}
		else if(scrawl.contains(['start','handle','delta'], item)){
			switch(item){
				case 'start' : return this.start.getVector(); break;
				case 'handle' : return this.handle.getVector(); break;
				case 'delta' : return this.delta.getVector(); break;
				}
			}
		else{
			return Scrawl.prototype.get.call(this, item);
			}
		};

/**
Overrides Scrawl.set(), to allow users to set the start, delta and handle attributes using startX, startY, deltaX, deltaY, handleX, handleY
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	SubScrawl.prototype.set = function(items){
		items = (scrawl.xt(items)) ? items : {};
		Scrawl.prototype.set.call(this, items);
		if(!this.start.type || this.start.type !== 'Vector'){
			this.start = new Vector(items.start || this.start);
			}
		if(scrawl.xto([items.startX, items.startY])){
			this.start.x = (scrawl.xt(items.startX)) ? items.startX : this.start.x;
			this.start.y = (scrawl.xt(items.startY)) ? items.startY : this.start.y;
			}
		if(!this.delta.type || this.delta.type !== 'Vector'){
			this.delta = new Vector(items.delta || this.delta);
			}
		if(scrawl.xto([items.deltaX, items.deltaY])){
			this.delta.x = (scrawl.xt(items.deltaX)) ? items.deltaX : this.delta.x;
			this.delta.y = (scrawl.xt(items.deltaY)) ? items.deltaY : this.delta.y;
			}
		if(!this.handle.type || this.handle.type !== 'Vector'){
			this.handle = new Vector(items.handle || this.handle);
			}
		if(scrawl.xto([items.handleX, items.handleY])){
			this.handle.x = (scrawl.xt(items.handleX)) ? items.handleX : this.handle.x;
			this.handle.y = (scrawl.xt(items.handleY)) ? items.handleY : this.handle.y;
			}
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	SubScrawl.prototype.setDelta = function(items){
		var temp;
		if(scrawl.xto([items.start, items.startX, items.startY])){
			temp = (scrawl.isa(items.start,'obj')) ? items.start : {};
			this.start.x += (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(temp.x)) ? temp.x : this.start.x);
			this.start.y += (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(temp.y)) ? temp.y : this.start.y);
			}
		if(scrawl.xto([items.delta, items.deltaX, items.deltaY])){
			temp = (scrawl.isa(items.delta,'obj')) ? items.delta : {};
			this.delta.x += (scrawl.xt(items.deltaX)) ? items.deltaX : ((scrawl.xt(temp.x)) ? temp.x : this.delta.x);
			this.delta.y += (scrawl.xt(items.deltaY)) ? items.deltaY : ((scrawl.xt(temp.y)) ? temp.y : this.delta.y);
			}
		if(scrawl.xto([items.handle, items.handleX, items.handleY]) && scrawl.isa(this.handle.x,'num') && scrawl.isa(this.handle.y,'num')){
			temp = (scrawl.isa(items.handle,'obj')) ? items.handle : {};
			this.handle.x += (scrawl.xt(items.handleX)) ? items.handleX : ((scrawl.xt(temp.x)) ? temp.x : this.handle.x);
			this.handle.y += (scrawl.xt(items.handleY)) ? items.handleY : ((scrawl.xt(temp.y)) ? temp.y : this.handle.y);
			}
		if(items.pathPlace){
			this.pathPlace += items.pathPlace;
			}
		if(items.deltaPathPlace){
			this.deltaPathPlace += items.deltaPathPlace;
			}
		if(items.scale){
			this.scale += items.scale;
			}
		return this;
		};

/**
Overrides Scrawl.clone()

The following objects can be cloned: 

* Block
* Outline
* Picture
* Phrase
* Shape
* Wheel
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	SubScrawl.prototype.clone = function(items){
		var a = Scrawl.prototype.clone.call(this,items),
			temp;
		temp = (scrawl.isa(items.start,'obj')) ? items.start : {};
		a.start = new Vector({
			x: (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(temp.x)) ? temp.x : a.start.x),
			y: (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(temp.y)) ? temp.y : a.start.y),
			});
		temp = (scrawl.isa(items.delta,'obj')) ? items.delta : {};
		a.delta = new Vector({
			x: (scrawl.xt(items.deltaX)) ? items.deltaX : ((scrawl.xt(temp.x)) ? temp.x : a.delta.x),
			y: (scrawl.xt(items.deltaY)) ? items.deltaY : ((scrawl.xt(temp.y)) ? temp.y : a.delta.y),
			});
		temp = (scrawl.isa(items.handle,'obj')) ? items.handle : {};
		a.handle = new Vector({
			x: (scrawl.xt(items.handleX)) ? items.handleX : ((scrawl.xt(temp.x)) ? temp.x : a.handle.x),
			y: (scrawl.xt(items.handleY)) ? items.handleY : ((scrawl.xt(temp.y)) ? temp.y : a.handle.y),
			});
		return a;
		};

/**
Adds delta values to the start vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x
* 'y' - delta.y added to start.y
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	SubScrawl.prototype.updateStart = function(item){
		switch(item){
			case 'x' :
				this.start.x += this.delta.x || 0;
				break;
			case 'y' :
				this.start.y += this.delta.y || 0;
				break;
			case 'path' :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			default :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				this.start.vectorAdd(this.delta);
			}
		return this;
		};

/**
Subtracts delta values from the start vector; subtracts deltaPathPlace from pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x
* 'y' - delta.y subtracted from start.y
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	SubScrawl.prototype.revertStart = function(item){
		switch(item){
			case 'x' :
				this.start.x -= this.delta.x || 0;
				break;
			case 'y' :
				this.start.y -= this.delta.y || 0;
				break;
			case 'path' :
				this.pathPlace -= this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			default :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				this.start.vectorSubtract(this.delta);
			}
		return this;
		};

/**
Swaps the values of an attribute between two objects
@method exchange
@param {Object} obj Object with which this object will swap attribute values
@param {String} item Attribute to be swapped
@return This
@chainable
**/
	SubScrawl.prototype.exchange = function(obj, item){
		if(scrawl.isa(obj,'obj')){
			var temp = this.get(item); 
			this[item] = obj.get(item); 
			obj[item] = temp;
			}
		return this;
		};

/**
Changes the sign (+/-) of specified attribute values
@method reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
	SubScrawl.prototype.reverse = function(item){
		switch(item){
			case 'deltaX' : 
				this.delta.x = -this.delta.x; break;
			case 'deltaY' : 
				this.delta.y = -this.delta.y; break;
			case 'delta' : 
				this.delta.reverse(); break;
			case 'deltaPathPlace' : 
				this.deltaPathPlace = -this.deltaPathPlace; break;
			default : 
				this.deltaPathPlace = -this.deltaPathPlace;
				this.delta.reverse();
			}
		return this;
		};

/**
Calculates the pixels value of the object's handle attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	SubScrawl.prototype.getPivotOffsetVector = function(){
		//result defaults to numerical offsets
		var result = this.handle.getVector(),
			height = this.height || this.get('height'),
			width = this.width || this.get('width');
		//calculate percentage offsets
		if((scrawl.isa(this.handle.x,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.x)){
			result.x = (parseFloat(this.handle.x)/100) * width;
			}
		else{
			switch (this.handle.x){
				//calculate string offsets
				case 'left' : result.x = 0; break;
				case 'center' : result.x = width/2; break;
				case 'right' : result.x = width; break;
				}
			}
		if((scrawl.isa(this.handle.y,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.y)){
			result.y = (parseFloat(this.handle.y)/100) * height;
			}
		else{
			switch (this.handle.y){
				//calculate string offsets
				case 'top' : result.y = 0; break;
				case 'center' : result.y = height/2; break;
				case 'bottom' : result.y = height; break;
				}
			}
		return result;
		};

/**
Calculates the pixels value of the object's handle attribute
@method getOffsetStartVector
@return Final offset values (as a Vector) to determine where sprite drawing should start
**/
	SubScrawl.prototype.getOffsetStartVector = function(){
		var sx = (scrawl.isa(this.handle.x,'str')) ? this.scale : 1,
			sy = (scrawl.isa(this.handle.y,'str')) ? this.scale : 1,
			myH = this.getPivotOffsetVector();
			myH.x *= sx;
			myH.y *= sy;
		return myH.reverse();
		};

/**
Performs this.start.getVector();
@method getStartVector
@return Copy of this.start
@chainable
@deprecated
**/
	SubScrawl.prototype.getStartVector = function(){console.log(this.name,'.getStartVector() called - should use .start.getVector() instead',this.start);return this.start.getVector();};

/**
Performs this.getPivotOffsetVector();
@method getHandleVector
@return Calculated offset values to help determine where sprite drawing should start
@private
@deprecated
**/
	SubScrawl.prototype.getHandleVector = function(){return this.getPivotOffsetVector();};

/**
Performs this.delta.getVector();
@method getDeltaVector
@return Copy of this.delta
@chainable
@deprecated
**/
	SubScrawl.prototype.getDeltaVector = function(){console.log(this.name,'.getDeltaVector() called - should use .delta.getVector() instead',this.delta);return this.delta.getVector();};

/**
# Scrawl3d
	
## Instantiation

* This object should never be instantiated by users

## Purpose

* supplies DOM elements with basic positional and rotational attributes, and methods for manipulating them

## Positioning 

All DOM elements in a stack can be positioned absolutely, or relatively, positioned; coordinates are measured (in pixels) from the top left corner of the stack element

### Absolute positioning

* object's __start__ Vector coordinate represents an element's rotation/reflection point
* object's __handle__ Vector equates to the element's _transformOrigin_ style
* element's _top_ and _left_ style values are calculated in line with the object's start and handle attribute values

### Relative positioning

* relative positioning is achieved by setting an element's __path__ or _pivot__ attributes to the name of a Scrawl sprite (or Point)
* see Sprite objects page for more details on relative positioning
* elements can also be moved relative to their object's _start_ coordinates via the __translate__ Vector, which equates to the the element's _translate_ style attribute
* the translate Vector can be set via the pseudo-attributes __translateX__, __translateY__ and __translateZ__

### Rotational positioning

Scrawl stacks can be set up to display elements in three dimensions by setting their __perspective__ attribute (a Vector) - see the Stack object for more details

Element rotation data is stored in the __rotation__ attribute; rotational change data is stored in __deltaRotation - both are Quaternion objects. The values in these quaternions can be changed by using the following pseudo-attributes in factory and set functions:

* __pitch__ - rotation around the x axis
* __yaw__ - rotation around the y axis
* __roll__ - rotation around the z axis
* __deltaPitch__ - change in rotation around the x axis
* __deltaYaw__ - change in rotation around the y axis
* __deltaRoll__ - change in rotation around the z axis

@class Scrawl3d
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Scrawl3d(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var temp;
		Scrawl.call(this, items);
		temp = (scrawl.isa(items.start,'obj')) ? items.start : {};
		this.start = new Vector({
			x: (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(temp.x)) ? temp.x : 0),
			y: (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(temp.y)) ? temp.y : 0),
			});
		temp = (scrawl.isa(items.delta,'obj')) ? items.delta : {};
		this.delta = new Vector({
			x: (scrawl.xt(items.deltaX)) ? items.deltaX : ((scrawl.xt(temp.x)) ? temp.x : 0),
			y: (scrawl.xt(items.deltaY)) ? items.deltaY : ((scrawl.xt(temp.y)) ? temp.y : 0),
			});
		temp = (scrawl.isa(items.handle,'obj')) ? items.handle : {};
		this.handle = new Vector({
			x: (scrawl.xt(items.handleX)) ? items.handleX : ((scrawl.xt(temp.x)) ? temp.x : 0),
			y: (scrawl.xt(items.handleY)) ? items.handleY : ((scrawl.xt(temp.y)) ? temp.y : 0),
			});
		if(scrawl.xto([items.handleX, items.handleY, items.handle])){
			this.setTransformOrigin();
			}
		temp = (scrawl.isa(items.translate,'obj')) ? items.translate : {};
		this.translate = new Vector({
			x: (scrawl.xt(items.translateX)) ? items.translateX : ((scrawl.xt(temp.x)) ? temp.x : 0),
			y: (scrawl.xt(items.translateY)) ? items.translateY : ((scrawl.xt(temp.y)) ? temp.y : 0),
			z: (scrawl.xt(items.translateZ)) ? items.translateZ : ((scrawl.xt(temp.y)) ? temp.y : 0),
			});
		this.pivot = items.pivot || scrawl.d[this.type].pivot;
		this.path = items.path || scrawl.d[this.type].path;
		this.pathRoll = items.pathRoll || scrawl.d[this.type].pathRoll;
		this.addPathRoll = items.addPathRoll || scrawl.d[this.type].addPathRoll;
		this.pathSpeedConstant = (scrawl.isa(items.pathSpeedConstant,'bool')) ? items.pathSpeedConstant : scrawl.d[this.type].pathSpeedConstant;
		this.pathPlace = items.pathPlace || scrawl.d[this.type].pathPlace;
		this.deltaPathPlace = items.deltaPathPlace || scrawl.d[this.type].deltaPathPlace;
		this.lockX = items.lockX || scrawl.d[this.type].lockX;
		this.lockY = items.lockY || scrawl.d[this.type].lockY;
		this.scale = (scrawl.isa(items.scale,'num')) ? items.scale : scrawl.d[this.type].scale;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : scrawl.d[this.type].visibility;
		this.rotation = Quaternion.prototype.makeQuaternion({
			pitch: items.pitch || 0,
			yaw: items.yaw || 0,
			roll: items.roll || 0,
			});
		this.deltaRotation = Quaternion.prototype.makeQuaternion({
			pitch: items.deltaPitch || 0,
			yaw: items.deltaYaw || 0,
			roll: items.deltaRoll || 0,
			});
		this.rotationTolerance = items.rotationTolerance || 0.001
		return this;
		}
	Scrawl3d.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'SubScrawl'
@final
**/
	Scrawl3d.prototype.type = 'Scrawl3d';
	Scrawl3d.prototype.classname = 'objectnames';
	scrawl.d.Scrawl3d = {
/**
The coordinate Vector representing the object's rotation/flip point

Scrawl3d, and all Objects that prototype chain to Scrawl3d, supports the following 'virtual' attributes for this attribute:

* __startX__ - (Mixed) the x coordinate of the object's rotation/flip point, in pixels, from the left side of the object's stack
* __startY__ - (Mixed) the y coordinate of the object's rotation/flip point, in pixels, from the top side of the object's stack

This attribute's attributes accepts absolute number values (in pixels), or string percentages where the percentage is relative to the container stack's width or height, or string literals which again refer to the containing stack's dimensions:

* _startX_ - 'left', 'right' or 'center'
* _startY_ - 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector
@property start
@type Vector
**/		
		start: {x:0,y:0,z:0},
/**
A change Vector which can be applied to the object's rotation/flip point

Scrawl3d, and all Objects that prototype chain to Scrawl3d, supports the following 'virtual' attributes for this attribute:

* __deltaX__ - (Number) a horizontal change value, in pixels
* __deltaY__ - (Number) a vertical change value, in pixels

@property delta
@type Vector
**/		
		delta: {x:0,y:0,z:0},
/**
A change Vector for translating elements away from their start coordinate

Scrawl3d, and all Objects that prototype chain to Scrawl3d, supports the following 'virtual' attributes for this attribute:

* __translateX__ - (Number) movement along the x axis, in pixels
* __translateY__ - (Number) movement along the y axis, in pixels
* __translateZ__ - (Number) movement along the z axis, in pixels

@property translate
@type Vector
**/		
		translate: {x:0,y:0,z:0},
/**
Element width
@property width
@type Number
@default 300
**/		
		width: 300,
/**
Element height
@property height
@type Number
@default 150
**/		
		height: 150,
/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

Scrawl3d, and all Objects that prototype chain to Scrawl3d, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property handle
@type Object
**/		
		handle: {x:'center',y:'center',z:0},
/**
The SPRITENAME or POINTNAME of a sprite or Point object to be used for setting this object's start point
@property pivot
@type String
@default ''
**/		
		pivot: '',
/**
The element's parent stack's STACKNAME
@property stack
@type String
@default ''
**/		
		stack: '',
/**
The SPRITENAME of a Shape sprite whose path is used to calculate this object's start point
@property path
@type String
@default ''
**/		
		path: '',
/**
A value between 0 and 1 to represent the distance along a Shape object's path, where 0 is the path start and 1 is the path end
@property pathPlace
@type Number
@default 0
**/
		pathPlace: 0,
/**
A change value which can be applied to the object's pathPlace attribute
@property deltaPathPlace
@type Number
@default 0
**/
		deltaPathPlace: 0,
/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		scale: 1,
/**
A flag to determine whether the object will calculate its position along a Shape path in a regular (true), or simple (false), manner
@property pathSpeedConstant
@type Boolean
@default true
**/		
		pathSpeedConstant: true,
/**
The rotation value (in degrees) of an object's current position along a Shape path
@property pathRoll
@type Number
@default 0
**/		
		pathRoll: 0,
/**
A flag to determine whether the object will calculate the rotation value of its current position along a Shape path
@property addPathRoll
@type Boolean
@default false
**/		
		addPathRoll: false,
/**
When true, element ignores horizontal placement data via pivot and path attributes
@property lockX
@type Boolean
@default false
**/		
		lockX: false,
/**
When true, element ignores vertical placement data via pivot and path attributes
@property lockY
@type Boolean
@default false
**/		
		lockY: false,
/**
Element rotation around its transform (start) coordinate
@property rotation
@type Quaternion
@default Unit quaternion with no rotation
**/		
		rotation: {n:1,v:{x:0,y:0,z:0}},
/**
Element's delta (change in) rotation around its transform (start) coordinate
@property deltaRotation
@type Quaternion
@default Unit quaternion with no rotation
**/		
		deltaRotation: {n:1,v:{x:0,y:0,z:0}},
/**
Element's rotation tolerance - all Quaternions need to be unit quaternions; this value represents the acceptable tolerance away from the norm
@property rotationTolerance
@type Number
@default 0.001
**/		
		rotationTolerance: 0.001,
/**
A flag to determine whether an element displays itself
@property visibility
@type Boolean
@default true
**/		
		visibility: true,
		};
	scrawl.mergeInto(scrawl.d.SubScrawl, scrawl.d.Scrawl);

/**
Turn the object into a JSON String
@method toString
@return JSON string of non-default value attributes
**/
	Scrawl3d.prototype.toString = function(){
		var keys = Object.keys(scrawl.d[this.type]),
			result = {},
			temp;
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.contains(['start', 'delta', 'handle', 'perspective', 'translate'], keys[i])){
				if(!this[keys[i]].isLike(scrawl.d[this.type][keys[i]])){
					result[keys[i]] = this[keys[i]];
					}
				}
			if(keys[i] === 'rotation'){
				temp = this.rotation.getEulerAngles();
				if(temp.pitch !== 0){result.pitch = temp.pitch;}
				if(temp.yaw !== 0){result.yaw = temp.yaw;}
				if(temp.roll !== 0){result.roll = temp.roll;}
				}
			if(keys[i] === 'deltaRotation'){
				temp = this.rotation.getEulerAngles();
				if(temp.pitch !== 0){result.deltaPitch = temp.pitch;}
				if(temp.yaw !== 0){result.deltaYaw = temp.yaw;}
				if(temp.roll !== 0){result.deltaRoll = temp.roll;}
				}
			else if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		return JSON.stringify(result);
		};

/**
Overrides Scrawl.get(), to allow users to get values for startX, startY, deltaX, deltaY, handleX, handleY, translateX, translateY, translateZ
@method get
@param {String} get Attribute key
@return Attribute value
**/
	Scrawl3d.prototype.get = function(item){
		var u, 
			el = this.getElement();
		if(scrawl.contains(['startX','startY','handleX','handleY','deltaX','deltaY','translateX','translateY','translateZ'], item)){
			switch(item){
				case 'startX' : return this.start.x; break;
				case 'startY' : return this.start.y; break;
				case 'handleX' : return this.handle.x; break;
				case 'handleY' : return this.handle.y; break;
				case 'deltaX' : return this.delta.x; break;
				case 'deltaY' : return this.delta.y; break;
				case 'translateX' : return this.translate.x; break;
				case 'translateY' : return this.translate.y; break;
				case 'translateZ' : return this.translate.z; break;
				}
			}
		else if(scrawl.contains(['start','handle','delta','translate'], item)){
			switch(item){
				case 'start' : return this.start.getVector(); break;
				case 'handle' : return this.handle.getVector(); break;
				case 'delta' : return this.delta.getVector(); break;
				case 'translate' : return this.translate.getVector(); break;
				}
			}
		else if(scrawl.contains(['width','height'], item)){
			switch(item){
				case 'width' : 
					if(scrawl.xt(this.width)){
						return this.width;
						}
					else{
						switch(this.type){
							case 'Pad' : 
								return parseFloat(el.width) || scrawl.d[this.type].width; 
								break;
							default: 
								return parseFloat(el.style.width) || parseFloat(el.clientWidth) || scrawl.d[this.type].width; 
							}
						}
					break;
				case 'height' : 
					if(scrawl.xt(this.height)){
						return this.height;
						}
					else{
						switch(this.type){
							case 'Pad' : 
								return parseFloat(el.height) || scrawl.d[this.type].height; 
								break;
							default: 
								return parseFloat(el.style.height) || parseFloat(el.clientHeight) || scrawl.d[this.type].height; 
							}
						}
					break;
				}
			}
		else if(item === 'position'){
			return el.style.position;
			}
		else if(item === 'overflow'){
			return el.style.overflow;
			}
		else if(item === 'backfaceVisibility'){
			return el.style.backfaceVisibility;
			}
		else{
			return Scrawl.prototype.get.call(this, item);
			}
		};

/**
Overrides Scrawl.set(), to allow users to set the start, delta and handle attributes using startX, startY, deltaX, deltaY, handleX, handleY
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Scrawl3d.prototype.set = function(items){
		items = (scrawl.xt(items)) ? items : {};
		var el = this.getElement(),
			temp;
		Scrawl.prototype.set.call(this, items);
		if(!this.start.type || this.start.type !== 'Vector'){
			this.start = new Vector(items.start || this.start);
			}
		if(scrawl.xto([items.startX, items.startY])){
			this.start.x = (scrawl.xt(items.startX)) ? items.startX : this.start.x;
			this.start.y = (scrawl.xt(items.startY)) ? items.startY : this.start.y;
			}
		if(!this.delta.type || this.delta.type !== 'Vector'){
			this.delta = new Vector(items.delta || this.delta);
			}
		if(scrawl.xto([items.deltaX, items.deltaY])){
			this.delta.x = (scrawl.xt(items.deltaX)) ? items.deltaX : this.delta.x;
			this.delta.y = (scrawl.xt(items.deltaY)) ? items.deltaY : this.delta.y;
			}
		if(!this.translate.type || this.translate.type !== 'Vector'){
			this.translate = new Vector(items.translate || this.translate);
			}
		if(scrawl.xto([items.translateX, items.translateY, items.translateZ])){
			this.translate.x = (scrawl.xt(items.translateX)) ? items.translateX : this.translate.x;
			this.translate.y = (scrawl.xt(items.translateY)) ? items.translateY : this.translate.y;
			this.translate.z = (scrawl.xt(items.translateZ)) ? items.translateZ : this.translate.z;
			}
		if(!this.handle.type || this.handle.type !== 'Vector'){
			this.handle = new Vector(items.handle || this.handle);
			}
		if(scrawl.xto([items.handleX, items.handleY])){
			this.handle.x = (scrawl.xt(items.handleX)) ? items.handleX : this.handle.x;
			this.handle.y = (scrawl.xt(items.handleY)) ? items.handleY : this.handle.y;
			}
		if(scrawl.xto([items.pitch, items.yaw, items.roll])){
			this.rotation = Quaternion.prototype.makeQuaternion({
				pitch: items.pitch || 0,
				yaw: items.yaw || 0,
				roll: items.roll || 0,
				});
			}
		if(scrawl.xto([items.deltaPitch, items.deltaYaw, items.deltaRoll])){
			this.deltaRotation = Quaternion.prototype.makeQuaternion({
				pitch: items.deltaPitch || 0,
				yaw: items.deltaYaw || 0,
				roll: items.deltaRoll || 0,
				});
			}
		if(scrawl.xto([items.width, items.height, items.scale])){
			this.setDimensions();
			}
		if(scrawl.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale])){
			delete this.offset;
			}
		if(scrawl.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start])){
			this.setDisplayOffsets();
			}
		if(scrawl.xto([items.handleX, items.handleY, items.handle])){
			this.setTransformOrigin();
			}
		if(scrawl.xto([items.title, items.comment])){
			this.setAccessibility(items);
			}
		this.setStyles(items);
		return this;
		};

/**
Handles the setting of element title and data-comment attributes
@method setAccessibility
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Scrawl3d.prototype.setAccessibility = function(items){
		items = (scrawl.xt(items)) ? items : {};
		var el = this.getElement();
		if(scrawl.xt(items.title)){
			this.title = items.title;
			el.title = this.title;
			}
		if(scrawl.xt(items.comment)){
			this.comment = items.comment;
			el.setAttribute('data-comment', this.comment);
			}
		return this;
		};

/**
Handles the setting of position, transformOrigin, backfaceVisibility, margin, border, padding
@method setStyles
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Scrawl3d.prototype.setStyles = function(items){
		items = (scrawl.xt(items)) ? items : {};
		var el = this.getElement();
		if(scrawl.xt(items.position)){
			el.style.position = items.position;
			}
		if(scrawl.xt(items.overflow)){
			el.style.overflow = items.overflow;
			}
		if(scrawl.xt(items.backfaceVisibility)){
			el.style.WebkitBackfaceVisibility = items.backfaceVisibility;
			el.style.mozBackfaceVisibility = items.backfaceVisibility;
			el.style.backfaceVisibility = items.backfaceVisibility;
			}
		if(scrawl.xt(items.margin)){
			el.style.margin = items.margin;
			}
		if(scrawl.xt(items.border)){
			el.style.border = items.border;
			}
		if(scrawl.xt(items.padding)){
			el.style.padding = items.padding;
			}
		if(scrawl.xt(items.visibility)){
			if(scrawl.isa(items.visibility, 'str')){
				this.visibility = (!scrawl.contains(['hidden', 'none'], items.visibility)) ? true : false;
				}
			else{
				this.visibility = (items.visibility) ? true : false;
				}
			if(this.stack){
				el.style.opacity = (this.visibility) ? 1 : 0;
				}
			else{
				el.style.display = (this.visibility) ? 'block' : 'none';
				}
			}
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Scrawl3d.prototype.setDelta = function(items){
		var temp;
		if(scrawl.xto([items.start, items.startX, items.startY])){
			temp = (scrawl.isa(items.start,'obj')) ? items.start : {};
			this.start.x += (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(temp.x)) ? temp.x : 0);
			this.start.y += (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(temp.y)) ? temp.y : 0);
			}
		if(scrawl.xto([items.delta, items.deltaX, items.deltaY])){
			temp = (scrawl.isa(items.delta,'obj')) ? items.delta : {};
			this.delta.x += (scrawl.xt(items.deltaX)) ? items.deltaX : ((scrawl.xt(temp.x)) ? temp.x : 0);
			this.delta.y += (scrawl.xt(items.deltaY)) ? items.deltaY : ((scrawl.xt(temp.y)) ? temp.y : 0);
			}
		if(scrawl.xto([items.translate, items.translateX, items.translateY])){
			temp = (scrawl.isa(items.translate,'obj')) ? items.translate : {};
			this.translate.x += (scrawl.xt(items.translateX)) ? items.translateX : ((scrawl.xt(temp.x)) ? temp.x : 0);
			this.translate.y += (scrawl.xt(items.translateY)) ? items.translateY : ((scrawl.xt(temp.y)) ? temp.y : 0);
			this.translate.z += (scrawl.xt(items.translateZ)) ? items.translateZ : ((scrawl.xt(temp.z)) ? temp.z : 0);
			}
		if(scrawl.xto([items.handle, items.handleX, items.handleY]) && scrawl.isa(this.handle.x,'num') && scrawl.isa(this.handle.y,'num')){
			temp = (scrawl.isa(items.handle,'obj')) ? items.handle : {};
			this.handle.x += (scrawl.xt(items.handleX)) ? items.handleX : ((scrawl.xt(temp.x)) ? temp.x : 0);
			this.handle.y += (scrawl.xt(items.handleY)) ? items.handleY : ((scrawl.xt(temp.y)) ? temp.y : 0);
			}
		if(items.pathPlace){
			this.pathPlace += items.pathPlace;
			}
		if(items.deltaPathPlace){
			this.deltaPathPlace += items.deltaPathPlace;
			}
		if(items.scale){
			this.scale += items.scale;
			}
		if(scrawl.xto([items.pitch, items.yaw, items.roll])){
			temp = Quaternion.prototype.makeQuaternion({
				pitch: items.pitch || 0,
				yaw: items.yaw || 0,
				roll: items.roll || 0,
				});
			this.rotation.quaternionMultiply(temp);
			}
		if(scrawl.xto([items.deltaPitch, items.deltaYaw, items.deltaRoll])){
			temp = Quaternion.prototype.makeQuaternion({
				pitch: items.deltaPitch || 0,
				yaw: items.deltaYaw || 0,
				roll: items.deltaRoll || 0,
				});
			this.deltaRotation.quaternionMultiply(temp);
			}
		if(scrawl.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale])){
			delete this.offset;
			}
		if(scrawl.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start])){
			this.setDisplayOffsets();
			}
		if(scrawl.xto([items.handleX, items.handleY, items.handle])){
			this.setTransformOrigin();
			}
		if(scrawl.xto([items.width, items.height, items.scale])){
			this.setDimensions();
			}
		return this;
		};

/**
Adds delta values to the start vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x
* 'y' - delta.y added to start.y
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	Scrawl3d.prototype.updateStart = function(item){
		switch(item){
			case 'x' :
				if(scrawl.isa(this.start.x,'num')){this.start.x += this.delta.x || 0};
				break;
			case 'y' :
				if(scrawl.isa(this.start.y,'num')){this.start.y += this.delta.y || 0;}
				break;
			case 'path' :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			case 'rotation' :
				this.rotation = this.deltaRotation.getQuaternionMultiply(this.rotation);
			default :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				this.rotation = this.deltaRotation.getQuaternionMultiply(this.rotation);
				if(scrawl.isa(this.start.x,'num') && scrawl.isa(this.start.y,'num')){this.start.vectorAdd(this.delta);}
			}
		this.setDisplayOffsets();
		return this;
		};

/**
Subtracts delta values from the start vector; subtracts deltaPathPlace from pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x
* 'y' - delta.y subtracted from start.y
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	Scrawl3d.prototype.revertStart = function(item){
		switch(item){
			case 'x' :
				this.start.x -= this.delta.x || 0;
				break;
			case 'y' :
				this.start.y -= this.delta.y || 0;
				break;
			case 'rotation' :
				this.rotation = this.deltaRotation.getConjugate().quaternionMultiply(this.rotation);
			case 'path' :
				this.pathPlace -= this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			default :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				this.rotation = this.deltaRotation.getConjugate().quaternionMultiply(this.rotation);
				this.start.vectorSubtract(this.delta);
			}
		this.setDisplayOffsets();
		return this;
		};

/**
Changes the sign (+/-) of specified attribute values
@method reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
	Scrawl3d.prototype.reverse = function(item){
		switch(item){
			case 'deltaX' : 
				this.delta.x = -this.delta.x; break;
			case 'deltaY' : 
				this.delta.y = -this.delta.y; break;
			case 'delta' : 
				this.delta.reverse(); break;
			case 'deltaPathPlace' : 
				this.deltaPathPlace = -this.deltaPathPlace; break;
			default : 
				this.deltaPathPlace = -this.deltaPathPlace;
				this.delta.reverse();
			}
		return this;
		};

/**
Calculates the pixels value of the object's handle attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	Scrawl3d.prototype.getPivotOffsetVector = function(){
		//result defaults to numerical offsets
		var result = this.handle.getVector(),
			height = this.height || this.get('height'),
			width = this.width || this.get('width');
		//calculate percentage offsets
		if((scrawl.isa(result.x,'str')) && !scrawl.contains(['left','center','right','top','bottom'], result.x)){
			result.x = (parseFloat(result.x)/100) * width;
			}
		else{
			switch (result.x){
				//calculate string offsets
				case 'left' : result.x = 0; break;
				case 'center' : result.x = width/2; break;
				case 'right' : result.x = width; break;
				}
			}
		if((scrawl.isa(result.y,'str')) && !scrawl.contains(['left','center','right','top','bottom'], result.y)){
			result.y = (parseFloat(result.y)/100) * height;
			}
		else{
			switch (result.y){
				//calculate string offsets
				case 'top' : result.y = 0; break;
				case 'center' : result.y = height/2; break;
				case 'bottom' : result.y = height; break;
				}
			}
		return result;
		};

/**
Calculates the pixels value of the object's start attribute

* doesn't take into account the object's scaling or orientation

@method getStartValues
@return A Vector of calculated values to help determine where sprite drawing should start
@private
**/
	Scrawl3d.prototype.getStartValues = function(){
		//result defaults to numerical offsets
		var result = this.start.getVector(),
			height = (this.stack) ? scrawl.stack[this.stack].get('height') : this.height || this.get('height'),
			width = (this.stack) ? scrawl.stack[this.stack].get('width') : this.width || this.get('width');
		//calculate percentage offsets
		if((scrawl.isa(result.x,'str')) && !scrawl.contains(['left','center','right','top','bottom'], result.x)){
			result.x = (parseFloat(result.x)/100) * width;
			}
		else{
			switch (this.start.x){
				//calculate string offsets
				case 'left' : result.x = 0; break;
				case 'center' : result.x = width/2; break;
				case 'right' : result.x = width; break;
				}
			}
		if((scrawl.isa(result.y,'str')) && !scrawl.contains(['left','center','right','top','bottom'], result.y)){
			result.y = (parseFloat(result.y)/100) * height;
			}
		else{
			switch (this.start.y){
				//calculate string offsets
				case 'top' : result.y = 0; break;
				case 'center' : result.y = height/2; break;
				case 'bottom' : result.y = height; break;
				}
			}
		return result;
		};

/**
Calculates the pixels value of the object's handle attribute
@method getOffsetStartVector
@return Final offset values (as a Vector) to determine where sprite drawing should start
**/
	Scrawl3d.prototype.getOffsetStartVector = function(){
		var sx = (scrawl.isa(this.handle.x,'str')) ? this.scale : 1,
			sy = (scrawl.isa(this.handle.y,'str')) ? this.scale : 1,
			myH = this.getPivotOffsetVector();
		myH.x *= sx;
		myH.y *= sy;
		return myH.reverse();
		};

/**
Reposition an element within its stack by changing 'left' and 'top' style attributes; rotate it using matrix3d transform
@method renderElement
@return This left
@chainable
**/
	Scrawl3d.prototype.renderElement = function(){
		var el = this.getElement(),
			temp = '',
			m = [];
		if(!scrawl.xt(this.offset)){
			this.offset = this.getOffsetStartVector();
			}
		if(this.path){
			this.setStampUsingPath();
			}
		else if(this.pivot){
			this.setStampUsingPivot();
			}
		this.updateStart();
		
		if(this.rotation.getMagnitude() !== 1){
			this.rotation.normalize();
			}
		
		m.push(Math.round(this.translate.x * this.scale));
		m.push(Math.round(this.translate.y * this.scale));
		m.push(Math.round(this.translate.z * this.scale));
		m.push(this.rotation.v.x);
		m.push(this.rotation.v.y);
		m.push(this.rotation.v.z);
		m.push(this.rotation.getAngle(false));

		for(var i = 0, z = m.length; i < z; i++){
			if(scrawl.isBetween(m[i], 0.000000001,-0.000000001)){
				m[i] = 0;
				}
			}
		temp += 'translate3d('+m[0]+'px,'+m[1]+'px,'+m[2]+'px) rotate3d('+m[3]+','+m[4]+','+m[5]+','+m[6]+'rad)';
			
		el.style.mozTransform = temp;
		el.style.webkitTransform = temp;
		el.style.msTransform = temp;
		el.style.oTransform = temp;
		el.style.transform = temp;

		temp = this.getStartValues(); 
		
		el.style.left = ((temp.x * this.scale) + this.offset.x)+'px';
		el.style.top = ((temp.y * this.scale) + this.offset.y)+'px';
		return this;
		};

/**
Calculate start Vector in reference to a Shape sprite object's path
@method setStampUsingPath
@return This
@chainable
@private
**/
	Scrawl3d.prototype.setStampUsingPath = function(){
		var here,
			angles;
		if(scrawl.contains(scrawl.spritenames, this.path) && scrawl.sprite[this.path].type === 'Shape'){
			here = scrawl.sprite[this.path].getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
			this.start.x = (!this.lockX) ? here.x : this.start.x;
			this.start.y = (!this.lockY) ? here.y : this.start.y;
			this.pathRoll = here.r || 0;
			if(this.addPathRoll && this.pathRoll){
				angles = this.rotation.getEulerAngles();
				this.setDelta({
					roll: this.pathRoll - angles.roll,
					});
				}
			}
		return this;
		};

/**
Calculate start Vector in reference to a sprite or Point object's position
@method setStampUsingPivot
@return This
@chainable
@private
**/
	Scrawl3d.prototype.setStampUsingPivot = function(){
		var	here,
			myCell,
			myP,
			myPVector,
			pSprite,
			temp;
		if(scrawl.contains(scrawl.pointnames, this.pivot)){
			myP = scrawl.point[this.pivot];
			pSprite = scrawl.sprite[myP.sprite];
			myPVector = myP.getCurrentCoordinates().rotate(pSprite.roll).vectorAdd(pSprite.getStartValues());
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(scrawl.contains(scrawl.spritenames, this.pivot)){
			myP = scrawl.sprite[this.pivot];
			myPVector = (myP.type === 'Particle') ? myP.get('position') : myP.get('start');
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(scrawl.contains(scrawl.padnames, this.pivot)){
			myP = scrawl.pad[this.pivot];
			myPVector = myP.getStartValues();
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(scrawl.contains(scrawl.elementnames, this.pivot)){
			myP = scrawl.element[this.pivot];
			myPVector = myP.getStartValues();
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(this.pivot === 'mouse'){
			if(this.stack){
				here = scrawl.stack[this.stack].getMouse();
				temp = this.getStartValues(); 
				if(!scrawl.xta([this.mouseX,this.mouseY])){
					this.mouseX = temp.x;
					this.mouseY = temp.y;
					}
				if(here.active){
					this.start.x = (!this.lockX) ? temp.x + here.x - this.mouseX : this.start.x;
					this.start.y = (!this.lockY) ? temp.y + here.y - this.mouseY : this.start.y;
					this.mouseX = here.x;
					this.mouseY = here.y;
					}
				}
			}
		return this;
		};

/**
Set the transform origin style attribute
@method setTransformOrigin
@return This
@chainable
**/
	Scrawl3d.prototype.setTransformOrigin = function(){
		var el = this.getElement(),
			x = (scrawl.isa(this.handle.x,'str')) ? this.handle.x : (this.handle.x * this.scale)+'px',
			y = (scrawl.isa(this.handle.y,'str')) ? this.handle.y : (this.handle.y * this.scale)+'px',
			t = x+' '+y;
		el.style.mozTransformOrigin = t;
		el.style.webkitTransformOrigin = t;
		el.style.msTransformOrigin = t;
		el.style.oTransformOrigin = t;
		el.style.transformOrigin = t;
		return this;
		};

/**
Calculate the element's display offset values
@method setDisplayOffsets
@return This
@chainable
**/
	Scrawl3d.prototype.setDisplayOffsets = function(){
		var dox = 0,
			doy = 0,
			myDisplay = this.getElement();
		if(myDisplay.offsetParent){
			do{
				dox += myDisplay.offsetLeft;
				doy += myDisplay.offsetTop;
				} while (myDisplay = myDisplay.offsetParent);
			}
		this.offset = this.getOffsetStartVector();
		this.displayOffsetX = dox;
		this.displayOffsetY = doy;
		return this;
		};

/**
Retrieve details of the Mouse cursor position in relation to the element's top left hand corner. Most useful for determining mouse cursor position over Stack and Pad (visible &lt;canvas&gt;) elements.

_Note: if changes are made elsewhere to the web page (DOM) after the page loads, the function .getDisplayOffsets() will need to be called to recalculate the element's position within the page - failure to do so will lead to this function returning incorrect data. getDisplayOffsets() does not need to be called during/after page scrolling._

The returned object is a Vector containing the mouse cursor's current x and y coordinates in relation to the element's top left corner _if_ the cursor is hovering over the stack, together with the following additional attributes:

* __active__ - set to true if mouse is hovering over the element; false otherwise
* __type__ - element's type ('stack', 'element', 'pad')
* __source__ - element's name attribute
@method getMouse
@return Vector containing localized mouse coordinates and a Boolean 'active' attribute flag 
**/
	Scrawl3d.prototype.getMouse = function(){
		var result = new Vector(),
			maxX,
			maxY,
			mop = false;
		if(!window.onmousemove){
			window.onmousemove = scrawl.handleMouseMove;
			}
		maxX = this.displayOffsetX + (this.width * this.scale);
		maxY = this.displayOffsetY + (this.height * this.scale);
		if(scrawl.mouseX >= this.displayOffsetX && scrawl.mouseX <= maxX && scrawl.mouseY >= this.displayOffsetY && scrawl.mouseY <= maxY){
			mop = true;
			}
		result.x = (mop) ? (scrawl.mouseX - this.displayOffsetX) * (1/this.scale) : 0;
		result.y = (mop) ? (scrawl.mouseY - this.displayOffsetY) * (1/this.scale) : 0;
		result.active = mop;
		result.source = this.name;
		result.type = this.type.toLowerCase();
		return result;
		};

/**
Scale element dimensions (width, height)
@method scaleDimensions
@param {Number} item Scale value
@return This
@chainable
**/
	Scrawl3d.prototype.scaleDimensions = function(item){
		if(scrawl.isa(item,'num')){
			this.scale = item,
			this.setDimensions();
			}
		return this;
		};

/**
Helper function - set element dimensions (width, height)
@method setDimensions
@return This
@chainable
@private
**/
	Scrawl3d.prototype.setDimensions = function(){
		var el = this.getElement();
		switch(this.type){
			case 'Pad' : 
				el.width = this.width * this.scale; 
				el.height = this.height * this.scale; 
				break;
			default: 
				el.style.width = (this.width * this.scale)+'px'; 
				el.style.height = (this.height * this.scale)+'px'; 
			}
		return this;
		};

/**
# Stack
	
## Instantiation

* scrawl.addStackToPage()

## Purpose

* add/manipulate perspective data to a DOM element

@class Stack
@constructor
@extends Scrawl3d
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Stack(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl3d.call(this, items);
		if(scrawl.xt(items.stackElement)){
			var tempname = '',
				temp;
			if(scrawl.xto([items.stackElement.id,items.stackElement.name])){
				tempname = items.stackElement.id || items.stackElement.name;
				}
			Scrawl3d.call(this, {name: tempname,});
			scrawl.stack[this.name] = this;
			scrawl.stk[this.name] = items.stackElement;
			scrawl.pushUnique(scrawl.stacknames, this.name);
			scrawl.stk[this.name].id = this.name;
			scrawl.stk[this.name].style.position = 'relative';
			this.setDisplayOffsets();
			temp = (scrawl.isa(items.perspective,'obj')) ? items.perspective : {};
			this.perspective = new Vector({
				x: (scrawl.xt(items.perspectiveX)) ? items.perspectiveX : ((scrawl.xt(temp.x)) ? temp.x : 'center'),
				y: (scrawl.xt(items.perspectiveY)) ? items.perspectiveY : ((scrawl.xt(temp.y)) ? temp.y : 'center'),
				z: (scrawl.xt(items.perspectiveZ)) ? items.perspectiveZ : ((scrawl.xt(temp.z)) ? temp.z : 0),
				});
			this.width = items.width || this.get('width');
			this.height = items.height || this.get('height');
			this.setDimensions()
			this.setPerspective();
			this.setStyles(items);
			if(scrawl.xto([items.title, items.comment])){
				this.setAccessibility(items);
				}
			return this;
			}
		console.log('Failed to generate a Stack wrapper - no DOM element supplied'); 
		return false;
		}
	Stack.prototype = Object.create(Scrawl3d.prototype);
/**
@property type
@type String
@default 'Stack'
@final
**/
	Stack.prototype.type = 'Stack';
	Stack.prototype.classname = 'stacknames';
	scrawl.d.Stack = {
/**
An Object (in fact, a Vector) containing perspective details for the stack element. 

the Stack constructor, and set() function, supports the following 'virtual' attributes for this attribute:

* __perspectiveX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __perspectiveY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'
* __perspectiveZ__ - (Number) perspective depth, in pixels
@property perspective
@type Object
**/		
		perspective: {x:'center',y:'center',z:0},
		};
	scrawl.mergeInto(scrawl.d.Stack, scrawl.d.Scrawl3d);

/**
Return the DOM element wrapped by this object
@method getElement
@return Element
**/
	Stack.prototype.getElement = function(){
		return scrawl.stk[this.name];
		};

/**
Overrides Scrawl3d.set(), to allow users to set the start, delta and handle attributes using startX, startY, deltaX, deltaY, handleX, handleY
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Stack.prototype.set = function(items){
		items = (scrawl.xt(items)) ? items : {};
		Scrawl3d.prototype.set.call(this, items);
		if(scrawl.xto([items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ])){
			if(!this.perspective.type || this.perspective.type !== 'Vector'){
				this.perspective = new Vector(items.perspective || this.perspective);
				}
			this.perspective.x = (scrawl.xt(items.perspectiveX)) ? items.perspectiveX : this.perspective.x;
			this.perspective.y = (scrawl.xt(items.perspectiveY)) ? items.perspectiveY : this.perspective.y;
			this.perspective.z = (scrawl.xt(items.perspectiveZ)) ? items.perspectiveZ : this.perspective.z;
			this.setPerspective();
			}
		return this;
		};

/**
Import elements into the stack DOM object, and create element object wrappers for them
@method addElementById
@param {String} DOM element id String
@return Element wrapper object on success; false otherwise
**/
	Stack.prototype.addElementById = function(item){
		if(scrawl.isa(item,'str')){
			var myElement = scrawl.newElement({
				domElement: document.getElementById(item),
				stack: this.name,
				});
			scrawl.stk[this.name].appendChild(scrawl.elm[myElement.name]);
			scrawl.elm[myElement.name] = document.getElementById(myElement.name);
			return myElement;
			}
		return false;
		};

/**
Import elements into the stack DOM object, and create element object wrappers for them
@method addElementsByClassName
@param {String} DOM element class String
@return Array of element wrapper objects on success; false otherwise
**/
	Stack.prototype.addElementsByClassName = function(item){
		if(scrawl.isa(item,'str')){
			var myElements = [];
			var myArray = document.getElementsByClassName(item);
			var myElement, myElm, thisElement;
			for(var i=0, z=myArray.length; i<z; i++){
				thisElement = myArray[i]
				if(thisElement.nodeName !== 'CANVAS'){
					myElement = scrawl.newElement({
						domElement: thisElement,
						stack: this.name,
						});
					myElements.push(myElement);
					}
				}
			for(var i=0, z=myElements.length; i<z; i++){
				scrawl.stk[this.name].appendChild(scrawl.elm[myElements[i].name]);
				scrawl.elm[myElements[i].name] = document.getElementById(myElements[i].name);
				}
//			scrawl.setDisplayOffsets('all');
			return myElements;
			}
		return false;
		};

/**
Move DOM elements within a Stack
@method renderElements
@return Always true
**/
	Stack.prototype.renderElements = function(){
		var temp;
		for(var i=0, z=scrawl.stacknames.length; i<z; i++){
			temp = scrawl.stack[scrawl.stacknames[i]];
			if(temp.stack === this.name){
				temp.renderElement();
				}
			}
		for(var i=0, z=scrawl.padnames.length; i<z; i++){
			temp = scrawl.pad[scrawl.padnames[i]];
			if(temp.stack === this.name){
				temp.renderElement();
				}
			}
		for(var i=0, z=scrawl.elementnames.length; i<z; i++){
			temp = scrawl.element[scrawl.elementnames[i]];
			if(temp.stack === this.name){
				temp.renderElement();
				}
			}
		return true;
		};

/**
Parse the perspective Vector attribute
@method parsePerspective
@return Object containing offset values (in pixels)
@private
**/
	Stack.prototype.parsePerspective = function(){
		//result defaults to numerical offsets
		var result = this.perspective.getVector(),
			height = this.height || this.get('height'),
			width = this.width || this.get('width');
		//calculate percentage offsets
		if((scrawl.isa(this.perspective.x,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.perspective.x)){
			result.x = (parseFloat(this.perspective.x)/100) * width;
			}
		else{
			switch (this.perspective.x){
				//calculate string offsets
				case 'left' : result.x = 0; break;
				case 'center' : result.x = width/2; break;
				case 'right' : result.x = width; break;
				}
			}
		if((scrawl.isa(this.perspective.y,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.perspective.y)){
			result.y = (parseFloat(this.perspective.y)/100) * height;
			}
		else{
			switch (this.perspective.y){
				//calculate string offsets
				case 'top' : result.y = 0; break;
				case 'center' : result.y = height/2; break;
				case 'bottom' : result.y = height; break;
				}
			}
		return result;
		};

/**
Calculates the pixels value of the object's perspective attribute
@method setPerspective
@return Set the Stack element's perspective point
**/
	Stack.prototype.setPerspective = function(){
		var sx = (scrawl.isa(this.perspective.x,'str')) ? this.scale : 1,
			sy = (scrawl.isa(this.perspective.y,'str')) ? this.scale : 1,
			myH = this.parsePerspective(),
			el = this.getElement();
		myH.x *= sx;
		myH.y *= sy;
		myH.z *= sx;
		el.style.mozPerspectiveOrigin = myH.x+'px '+myH.y+'px';
		el.style.webkitPerspectiveOrigin = myH.x+'px '+myH.y+'px';
		el.style.perspectiveOrigin = myH.x+'px '+myH.y+'px';
		el.style.mozPerspective = myH.z+'px';
		el.style.webkitPerspective = myH.z+'px';
		el.style.perspective = myH.z+'px';
		};
		
/**
Scale the stack, and all objects contained in stack
@method scaleStack
@param {Number} item Scale value
@return This
@chainable
**/
	Stack.prototype.scaleStack = function(item){
		if(scrawl.isa(item,'num') && this.type === 'Stack'){
			for(var i=0, z=scrawl.stacknames.length; i<z; i++){
				if(scrawl.stack[scrawl.stacknames[i]].stack === this.name){
					scrawl.stack[scrawl.stacknames[i]].scaleStack(item);
					}
				}
			for(var i=0, z=scrawl.elementnames.length; i<z; i++){
				if(scrawl.element[scrawl.elementnames[i]].stack === this.name){
					scrawl.element[scrawl.elementnames[i]].scaleDimensions(item);
					}
				}
			for(var i=0, z=scrawl.padnames.length; i<z; i++){
				if(scrawl.pad[scrawl.padnames[i]].stack === this.name){
					scrawl.pad[scrawl.padnames[i]].scaleDimensions(item);
					}
				}
			this.scaleDimensions(item);
			if(this.type === 'Stack'){
				this.setPerspective();
				}
			}
		return this;
		};

/**
# Element
	
## Instantiation

* Stack.addElementById()
* Stack.addElementsByClassNames()

## Purpose

* provide a wrapper object for a DOM element

@class Element
@constructor
@extends Scrawl3d
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Element(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl3d.call(this, items);
		if(scrawl.xt(items.domElement)){
			var tempname = '';
			if(scrawl.xto([items.domElement.id,items.domElement.name])){
				tempname = items.domElement.id || items.domElement.name;
				}
			Scrawl3d.call(this, {name: tempname,});
			scrawl.element[this.name] = this;
			scrawl.elm[this.name] = items.domElement;
			scrawl.pushUnique(scrawl.elementnames, this.name);
			scrawl.elm[this.name].id = this.name;
			scrawl.elm[this.name].style.position = 'absolute';
			this.stack = items.stack || '';
			this.width = items.width || this.get('width');
			this.height = items.height || this.get('height');
			this.setDimensions()
			this.setDisplayOffsets();
			this.setStyles(items);
			if(scrawl.xto([items.title, items.comment])){
				this.setAccessibility(items);
				}
			return this;
			}
		console.log('Failed to generate an Element wrapper - no DOM element supplied'); 
		return false;
		}
	Element.prototype = Object.create(Scrawl3d.prototype);
/**
@property type
@type String
@default 'Element'
@final
**/
	Element.prototype.type = 'Element';
	Element.prototype.classname = 'elementnames';
	scrawl.d.Element = {
		};
	scrawl.mergeInto(scrawl.d.Element, scrawl.d.Scrawl3d);

/**
Return the DOM element wrapped by this object
@method getElement
@return Element
**/
	Element.prototype.getElement = function(){
		return scrawl.elm[this.name];
		};
		
/**
# Pad
	
## Instantiation

* created automatically for any &lt;canvas&gt; element found on the web page when it loads
* also, scrawl.addCanvasToPage()
* should not be instantiated directly by users

## Purpose

* controller (not wrapper) object for canvas elements included in the DOM
* wraps the canvas element for CSS 3d functionality, if element is part of a Scrawl Stack
* coordinates activity between visible canvas element and other (non-DOM) canvas elements that contribute to it

Because the Pad constructor calls the Cell constructor as part of the construction process (Cell objects __wrap__ &lt;canvas&gt; elements; Pad objects __control__ &lt;canvas&gt; elements), Cell attributes can be included in the Pad constructor object and picked up by the resultant Cell objects.

@class Pad
@constructor
@extends Scrawl3d
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Pad(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl3d.call(this, items);
		var tempname,
			myCell,
			baseCanvas,
			myCellBase;
		if(scrawl.xt(items.canvasElement)){
			scrawl.canvas['PadConstructorTemporaryCanvas'] = items.canvasElement;
			this.display = 'PadConstructorTemporaryCanvas';
			tempname = '';
			if(scrawl.xto([items.canvasElement.id,items.canvasElement.name])){
				tempname = items.canvasElement.id || items.canvasElement.name;
				}
			(tempname.match(/_display$/)) ? Scrawl3d.call(this, {name: tempname.substr(0,tempname.length-8),}) : Scrawl3d.call(this, {name: tempname,});
			if(!items.canvasElement.id){items.canvasElement.id = tempname;}
			if(!scrawl.contains(scrawl.cellnames, this.name)){
				this.cells = [];
				this.drawOrder = [];
				scrawl.pad[this.name] = this;
				scrawl.pushUnique(scrawl.padnames, this.name);
				if(items.length > 1){
					this.set(items);
					}
				myCell = new Cell({
					name: tempname,
					pad: this.name,
					canvas: items.canvasElement,
					});
				scrawl.pushUnique(this.cells, myCell.name);
				this.display = myCell.name;
				delete scrawl.canvas.PadConstructorTemporaryCanvas;
				baseCanvas = items.canvasElement.cloneNode(true);
				baseCanvas.setAttribute('id', this.name+'_base');
				myCellBase = new Cell({
					name: this.name+'_base',
					pad: this.name,
					canvas: baseCanvas,
					backgroundColor: items.backgroundColor,
					});
				scrawl.pushUnique(this.cells, myCellBase.name);
				this.base = myCellBase.name;
				this.current = myCellBase.name;
				this.width = items.width || this.get('width');
				this.height = items.height || this.get('height');
				this.setDimensions()
				this.setDisplayOffsets();
				this.setStyles(items);
				if(scrawl.xto([items.title, items.comment])){
					this.setAccessibility(items);
					}
				return this;
				}
			}
		console.log('Failed to generate a Pad controller - no canvas element supplied'); 
		return false;
		}
	Pad.prototype = Object.create(Scrawl3d.prototype);
/**
@property type
@type String
@default 'Pad'
@final
**/
	Pad.prototype.type = 'Pad';
	Pad.prototype.classname = 'padnames';
	scrawl.d.Pad = {
/**
Array of CELLNAME Strings determining the order in which non-display &lt;canvas&gt; elements are to be copied onto the display &lt;canvas&gt;
@property drawOrder
@type Array
@default []
**/
		drawOrder: [],
/**
Array of CELLNAME Strings associated with this Pad
@property cells
@type Array
@default []
**/
		cells: [],
/**
Pad's display (visible) &lt;canvas&gt; element - CELLNAME
@property display
@type String
@default ''
**/
		display: '',
/**
Pad's base (hidden) &lt;canvas&gt; element - CELLNAME
@property base
@type String
@default ''
**/
		base: '',
/**
Pad's currently active &lt;canvas&gt; element - CELLNAME
@property current
@type String
@default ''
@deprecated
**/
		current: '',
/**
Current horizontal position of the mouse cursor in relation to the Pad's visible &lt;canvas&gt; element's top left corner
@property mouseX
@type Number
@default 0
**/
		mouseX: 0,
/**
Current vertical position of the mouse cursor in relation to the Pad's visible &lt;canvas&gt; element's top left corner
@property mouseY
@type Number
@default 0
**/
		mouseY: 0,
/**
Flag indicating whether the mouse cursor is hovering over the Pad's visible &lt;canvas&gt; element
@property mouseOverPad
@type Boolean
@default false
**/
		mouseOverPad: false,
		};
	scrawl.mergeInto(scrawl.d.Pad, scrawl.d.Scrawl3d);

/**
Turn the object into a JSON String
@method toString
@param {Boolean} [noexternalobjects] True to exclude external objects such as sprites, designs and groups
@return Array of JSON strings of non-default value attributes
**/
	Pad.prototype.toString = function(noexternalobjects){
		var keys = Object.keys(scrawl.d[this.type]),
			result = {},
			resarray = [],
			groups = [],
			sprites = [],
			ctx,
			designs = [];
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		result.parentElement = scrawl.canvas[this.name].parentElement.id;
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.contains(['start', 'delta', 'handle'], keys[i])){
				if(!this[keys[i]].isLike(scrawl.d[this.type][keys[i]])){
					result[keys[i]] = this[keys[i]];
					}
				}
			else if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		delete result.displayOffsetX;
		delete result.displayOffsetY;
		resarray.push(JSON.stringify(result));
		if(!noexternalobjects){
			for(var i=0, z=this.cells.length; i<z; i++){
				for(var j=0, w=scrawl.cell[this.cells[i]].groups.length; j<w; j++){
					scrawl.pushUnique(groups, scrawl.cell[this.cells[i]].groups[j]);
					}
				resarray.push(scrawl.cell[this.cells[i]].toString(true));
				}
			for(var i=0, z=groups.length; i<z; i++){
				for(var j=0, w=scrawl.group[groups[i]].sprites.length; j<w; j++){
					scrawl.pushUnique(sprites, scrawl.group[groups[i]].sprites[j]);
					}
				resarray.push(scrawl.group[groups[i]].toString(true));
				}
			for(var i=0, z=sprites.length; i<z; i++){
				ctx = scrawl.ctx[scrawl.sprite[sprites[i]].context];
				if(scrawl.contains(scrawl.designnames, ctx.fillStyle)){
					scrawl.pushUnique(designs, ctx.fillStyle);
					}
				if(scrawl.contains(scrawl.designnames, ctx.strokeStyle)){
					scrawl.pushUnique(designs, ctx.strokeStyle);
					}
				if(scrawl.contains(scrawl.designnames, ctx.shadowColor)){
					scrawl.pushUnique(designs, ctx.shadowColor);
					}
				}
			for(var i=0, z=designs.length; i<z; i++){
				resarray.push(scrawl.design[designs[i]].toString());
				}
			for(var i=0, z=sprites.length; i<z; i++){
				resarray.push(scrawl.sprite[sprites[i]].toString(true));
				}
			}
		return resarray;
		};
		
/**
Retrieve Pad's visible &lt;canvas&gt; element object
@method getElement
@return DOM element object
@private
**/
	Pad.prototype.getElement = function(){
		return scrawl.canvas[this.display];
		};

/**
Overrides Scrawl3d.set(), to allow users to set Pad.drawOrder correctly, and also cascade Pad.scale changes to associated Cell obhjects
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Pad.prototype.set = function(items){
		Scrawl3d.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.setDrawOrder(items.drawOrder || this.get('drawOrder'));
		if(scrawl.isa(items.scale,'num')){
			scrawl.cell[this.display].scale = items.scale;
			this.scale = items.scale;
			}
		if(scrawl.xt(items.width)){
			scrawl.cell[this.display].set({
				width: items.width,
				});
			this.width = items.width;
			}
		if(scrawl.xt(items.height)){
			scrawl.cell[this.display].set({
				height: items.height,
				});
			this.height = items.height;
			}
		if(scrawl.xto([items.start,items.startX,items.startY,items.handle,items.handleX,items.handleY,items.scale,items.width,items.height])){
			this.setDisplayOffsets();
			}
		if(scrawl.xto([items.backgroundColor, items.globalAlpha, items.globalCompositeOperation])){
			var cell = scrawl.cell[this.base];
			scrawl.cell[this.base].set({
				backgroundColor: (items.backgroundColor) ? items.backgroundColor : cell.backgroundColor,
				globalAlpha: (items.globalAlpha) ? items.globalAlpha : cell.globalAlpha,
				globalCompositeOperation: (items.globalCompositeOperation) ? items.globalCompositeOperation : cell.globalCompositeOperation,
				});
			}
		return this;
		};

/**
Set the drawOrder attribute
@method setDrawOrder
@param {Array} items Array of CELLNAME Strings; alternatively, supply a CELLNAME String argument
@return This
@chainable
**/
	Pad.prototype.setDrawOrder = function(order){
		this.drawOrder = (scrawl.xt(order)) ? [].concat(order) : [];
		return this;
		};

/**
Display helper function - determines which Cell &lt;canvas&gt; elements need to be manipulated in line with the supplied 'command' argument

Argument String can be in the form of:

* 'all' - for all canvases
* 'display' - for the display canvas only
* 'base' - for the base canvas only
* 'non-base' for all canvases except the base canvas
* 'current' - for the current canvas only
* 'non-current' - for all canvases except the current canvas
* 'additionals' - for all canvases except the display and base canvases
* 'non-additionals' - for the display and base canvases only
* 'none' - for no canvases
* the __default__ is to return an Array containing all canvases except the display canvas

The argument can also be an Array of CELLNAME strings 

@method getCellsForDisplayAction
@param {String} [command] Command String; or alternatively an Array of CELLNAME Strings
@return Array of CELLNAME Strings
@private
**/
	Pad.prototype.getCellsForDisplayAction = function(command){
		var	temp = [];
		if(scrawl.isa(command,'arr')){
			temp = command;
			}
		else{
			for(var i=0, z=this.cells.length; i<z; i++){
				temp.push(this.cells[i]);
				}
			switch(command){
				case 'all' : break;
				case 'display' : temp = [this.display]; break;
				case 'base' : temp = [this.base]; break;
				case 'non-base' : scrawl.removeItem(temp, this.base); break;
				case 'current' : temp = [this.current]; break;
				case 'non-current' : scrawl.removeItem(temp, this.current); break;
				case 'additionals' :
					scrawl.removeItem(temp, this.display);
					scrawl.removeItem(temp, this.base);
					break;
				case 'non-additionals' : temp = [this.display, this.base]; break;
				case 'none' : temp = []; break;
				default : scrawl.removeItem(temp, this.display); break;
				}
			}
		return temp;
		};

/**
Display function - requests Cells to clear their &lt;canvas&gt; element

Argument String can be in the form of:

* 'all' - for all canvases
* 'display' - for the display canvas only
* 'base' - for the base canvas only
* 'non-base' for all canvases except the base canvas
* 'current' - for the current canvas only
* 'non-current' - for all canvases except the current canvas
* 'additionals' - for all canvases except the display and base canvases
* 'non-additionals' - for the display and base canvases only
* 'none' - for no canvases
* the __default__ is to return an Array containing all canvases except the display canvas

The argument can also be an Array of CELLNAME strings 

@method clear
@param {String} [command] Command String; or alternatively an Array of CELLNAME Strings
@return This
@chainable
**/
	Pad.prototype.clear = function(command){
		var temp = this.getCellsForDisplayAction(command);
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].clear();
			}
		return this;
		};

/**
Display function - requests Cells to compile their &lt;canvas&gt; element

Argument String can be in the form of:

* 'all' - for all canvases
* 'display' - for the display canvas only
* 'base' - for the base canvas only
* 'non-base' for all canvases except the base canvas
* 'current' - for the current canvas only
* 'non-current' - for all canvases except the current canvas
* 'additionals' - for all canvases except the display and base canvases
* 'non-additionals' - for the display and base canvases only
* 'none' - for no canvases
* the __default__ is to return an Array containing all canvases except the display canvas

The argument can also be an Array of CELLNAME strings 

@method compile
@param {String} [command] Command String; or alternatively an Array of CELLNAME Strings
@return This
@chainable
**/
	Pad.prototype.compile = function(command){
		var temp = this.getCellsForDisplayAction(command);
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].compile();
			}
		return this;
		};

/**
Display function - requests Cells to clear their &lt;canvas&gt; element using their backgroundColor

Argument String can be in the form of:

* 'all' - for all canvases
* 'display' - for the display canvas only
* 'base' - for the base canvas only
* 'non-base' for all canvases except the base canvas
* 'current' - for the current canvas only
* 'non-current' - for all canvases except the current canvas
* 'additionals' - for all canvases except the display and base canvases
* 'non-additionals' - for the display and base canvases only
* 'none' - for no canvases
* the __default__ is to return an Array containing all canvases except the display canvas

The argument can also be an Array of CELLNAME strings 

@method stampBackground
@param {String} [command] Command String; or alternatively an Array of CELLNAME Strings
@return This
@chainable
**/
	Pad.prototype.stampBackground = function(command){
		var temp = this.getCellsForDisplayAction(command);
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.cell[temp[i]].stampBackground();
			}
		return this;
		};

/**
Display function - Pad tells its visible &lt;canvas&gt; element to clear itself and then copy associated canvases onto itself

Argument String can be in the form of:

* 'wipe-base' - base canvas is cleared before copy operation starts
* 'wipe both' - both the base canvas and the display canvas are cleared before the copy operation starts
* the __default__ is to only clear the display canvas before the copy operation starts

Canvases are copied onto the _base_ (not display) canvas in the order supplied by the Pad.drawOrder Array. This means that anything drawn on the base canvas will be at the bottom of the eventual scene.

The base canvas is then copied onto the display canvas, as the last copy operation.
@method show
@param {String} [command] Command String
@return This
@chainable
**/
	Pad.prototype.show = function(command){
		switch(command){
			case 'wipe-base' :
				scrawl.cell[this.base].clear();
				break;
			case 'wipe-both' :
				scrawl.cell[this.base].clear();
				scrawl.cell[this.display].clear();
				break;
			default :
				scrawl.cell[this.display].clear();
				break;
			}
		if(this.drawOrder.length > 0){
			for(var i=0, z=this.drawOrder.length; i<z; i++){
				scrawl.cell[this.base].copyCellToSelf(scrawl.cell[this.drawOrder[i]]);
				}
			}
		scrawl.cell[this.display].copyCellToSelf(scrawl.cell[this.base], true);
		return this;
		};

/**
Display function - Pad tells its associated Cell objects to undertake a complete clear-compile-show display cycle

Argument Object can have the following (optional) attributes:

* clear:COMMAND
* compile:COMMAND
* show:COMMAND
@method render
@param {Object} [command] Command Object
@return This
@chainable
**/
	Pad.prototype.render = function(command){
		command = (scrawl.isa(command,'obj')) ? command : {};
		command.clear = (scrawl.xt(command.clear)) ? command.clear : null;
		command.compile = (scrawl.xt(command.compile)) ? command.compile : null;
		command.show = (scrawl.xt(command.show)) ? command.show : null;
		this.clear(command.clear);
		this.compile(command.compile);
		this.show(command.show);
		return this;
		};

/**
Create a new (hidden) &lt;canvas&gt; element and associated Cell wrapper, and add it to this Pad
@method addNewCell
@param {Object} data Object containing attribute data for the new canvas
@return New Cell object; false on failure
**/
	Pad.prototype.addNewCell = function(data){
		var	myCanvas,
			myCell;
		data = (scrawl.isa(data,'obj')) ? data : {};
		if(scrawl.isa(data.name,'str')){
			data.width = Math.round(data.width) || this.width;
			data.height = Math.round(data.height) || this.height;
			myCanvas = document.createElement('canvas');
			myCanvas.setAttribute('id', data.name);
			myCanvas.setAttribute('height', data.height);
			myCanvas.setAttribute('width', data.width);
			data['pad'] = this.name;
			data['canvas'] = myCanvas;
			myCell = new Cell(data);
			scrawl.pushUnique(this.cells, myCell.name);
			return myCell;
			}
		return false;
		};

/**
Associate existing &lt;canvas&gt; elements, and their Cell wrappers, with this Pad
@method addCells
@param {Array} items An Array of CELLNAME Strings; alternatively the argument can be a single CELLNAME String
@return This
@chainable
**/
	Pad.prototype.addCells = function(items){
		items = [].concat(items);
		for(var i=0, z=items.length; i<z; i++){
			if(scrawl.contains(scrawl.cellnames, items[i])){
				this.cells.push(items[i]);
				this.drawOrder.push(items[i]);
				}
			}
		return this;
		};

/**
Remove a &lt;canvas&gt; element, and its Cell wrapper, from this Pad

_Note: does not delete the canvas, or the Cell object, from the scrawl library_
@method deleteCell
@param {String} cell CELLNAME String
@return This on success; false otherwise
@chainable
**/
	Pad.prototype.deleteCell = function(cell){
		if(scrawl.isa(cell,'str')){
			scrawl.removeItem(this.cells, cell);
			if(this.display === cell){this.display = this.current;}
			if(this.base === cell){this.base = this.current;}
			if(this.current === cell){this.current = this.base;}
			return this;
			}
		return false;
		};

/**
Set scrawl.currentPad attribute to this Pad's PADNAME String
@method makeCurrent
@return This
@chainable
**/
	Pad.prototype.makeCurrent = function(){
		scrawl.currentPad = this.name;
		return this;
		};

/**
Orders all Cell objects associated with this Pad to (re)create their field collision image maps
@method buildFields
@return This
@chainable
**/
	Pad.prototype.buildFields = function(){
		for(var i=0, z=this.cells.length; i<z; i++){
			scrawl.cell[this.cells[i]].buildField();
			}
		return this;
		};

/**
Handles the setting of element title and data-comment attributes

* Title text is assigned to the display canvas's title attribute
* Comments are placed between the display canvas element's tags, within &lt;p&gt; tags - this will remove any existing content between the canvas tags

(Overrides Scrawl3d.setAccessibility)
@method setAccessibility
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Pad.prototype.setAccessibility = function(items){
		items = (scrawl.xt(items)) ? items : {};
		var el = this.getElement();
		if(scrawl.xt(items.title)){
			this.title = items.title;
			el.title = this.title;
			}
		if(scrawl.xt(items.comment)){
			this.comment = items.comment;
			el.setAttribute('data-comment', this.comment);
			el.innerHTML = '<p>'+this.comment+'</p>';
			}
		return this;
		};

/**
# Cell
	
## Instantiation

* created automatically for any &lt;canvas&gt; element found on the web page when it loads
* scrawl.addCanvasToPage()
* scrawl.addNewCell()
* Pad.addNewCell()
* should not be instantiated directly by users

## Purpose

* Acts as a wrapper for each &lt;canvas&gt; element - whether that canvas is part of the DOM or not
* Oversees manipulation of the &lt;canvas&gt; element's context engine
* Responsible clearing &lt;canvas&gt; elements, and for copying one &lt;canvas&gt; to another
* Includes functionality to pivot, path, flip, lock and roll cell positioning in the display scene
* Controls scrolling and zoom effects between &lt;canvas&gt; elements
* Builds &lt;canvas&gt; element collision fields from sprite data
* Undertakes collision detection between sprites and a collision field

_Note: A Cell is entirely responsible for determining what portion of its &lt;canvas&gt; element's content will be copied to another &lt;canvas&gt; and where that copy will appear on the destination &lt;canvas&gt;._
@class Cell
@constructor
@extends SubScrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Cell(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var temp;
		SubScrawl.call(this, items);							//handles items.start, items.startX, items.startY
		Scrawl.prototype.set.call(this, items);
		var myContext;
		if(scrawl.xta([items,items.canvas])){					//flag used by Pad constructor when calling Cell constructor
			scrawl.canvas[this.name] = items.canvas;
			scrawl.context[this.name] = items.canvas.getContext('2d');
			scrawl.cell[this.name] = this;
			scrawl.pushUnique(scrawl.cellnames, this.name);
			this.pad = items.pad || false;
			temp = (scrawl.isa(items.source,'obj')) ? items.source : {};
			this.source = new Vector({
				x: (scrawl.xt(items.sourceX)) ? items.sourceX : ((scrawl.xt(temp.x)) ? temp.x : 0),
				y: (scrawl.xt(items.sourceY)) ? items.sourceY : ((scrawl.xt(temp.y)) ? temp.y : 0),
				});
			temp = (scrawl.isa(items.sourceDelta,'obj')) ? items.sourceDelta : {};
			this.sourceDelta = new Vector({
				x: (scrawl.xt(items.sourceDeltaX)) ? items.sourceDeltaX : ((scrawl.xt(temp.x)) ? temp.x : 0),
				y: (scrawl.xt(items.sourceDeltaY)) ? items.sourceDeltaY : ((scrawl.xt(temp.y)) ? temp.y : 0),
				});
/**
The coordinate Vector representing the Cell's target position on the &lt;canvas&gt; to which it is to be copied

Cell supports the following 'virtual' attributes for this attribute:

* __startX__ or __targetX__ - (Number) the x coordinate on the destination &lt;canvas&gt;
* __startY__ or __targetY__ - (Number) the y coordinate on the destination &lt;canvas&gt;

@property start
@type Vector
**/		
			this.actualWidth = items.actualWidth || items.width || scrawl.canvas[this.name].width;
			this.actualHeight = items.actualHeight || items.height || scrawl.canvas[this.name].height;
			this.sourceWidth = this.actualWidth;
			this.sourceHeight = this.actualHeight;
			this.targetWidth = this.actualWidth;
			this.targetHeight = this.actualHeight;
			this.setDimensions(items);
			if(scrawl.xto([items.targetX, items.targetY])){
				this.start.x = (scrawl.xt(items.targetX)) ? items.targetX : this.start.x;
				this.start.y = (scrawl.xt(items.targetY)) ? items.targetY : this.start.y;
				}
			if(scrawl.xto([items.sourceWidth, items.sourceHeight, items.targetWidth, items.targetHeight, items.width, items.height])){
				this.sourceWidth = items.sourceWidth || items.width || this.sourceWidth;
				this.sourceHeight = items.sourceHeight || items.height || this.sourceHeight;
				this.targetWidth = items.targetWidth || items.width || this.targetWidth;
				this.targetHeight = items.targetHeight || items.height || this.targetHeight;
				}
			this.usePadDimensions = (scrawl.isa(items.usePadDimensions,'bool')) ? items.usePadDimensions : ((scrawl.xto([items.sourceWidth, items.sourceHeight, items.targetWidth, items.targetHeight, items.width, items.height])) ? false : true);
			myContext = new Context({name: this.name, cell: scrawl.context[this.name]});
			this.context = myContext.name;
			this.flipUpend = scrawl.xt(items.flipUpend) ? items.flipUpend : scrawl.d.Cell.flipUpend;
			this.flipReverse = scrawl.xt(items.flipReverse) ? items.flipReverse : scrawl.d.Cell.flipReverse;
			this.lockX = scrawl.xt(items.lockX) ? items.lockX : scrawl.d.Cell.lockX;
			this.lockY = scrawl.xt(items.lockY) ? items.lockY : scrawl.d.Cell.lockY;
			this.roll = items.roll || scrawl.d.Cell.roll;
			this.groups = (scrawl.xt(items.groups)) ? [].concat(items.groups) : []; //must be set
			new Group({
				name: this.name,
				cell: this.name,
				});
			new Group({
				name: this.name+'_field',
				cell: this.name,
				visibility: false,
				});
			if(items.field){
				scrawl.group[this.name+'_field'].sprites = [].concat(items.field);
				}
			new Group({
				name: this.name+'_fence',
				cell: this.name,
				visibility: false,
				});
			if(items.fence){
				scrawl.group[this.name+'_fence'].sprites = [].concat(items.fence);
				}
			return this;
			}
		console.log('Cell constructor encountered an error: no canvas element supplied to it');
		return false;
//updateStart
		}
	Cell.prototype = Object.create(SubScrawl.prototype);

/**
@property type
@type String
@default 'Cell'
@final
**/		
	Cell.prototype.type = 'Cell';
	Cell.prototype.classname = 'cellnames';
	scrawl.d.Cell = {
/**
PADNAME of the Pad object to which this Cell belongs
@property pad
@type String
@default ''
**/
		pad: '',
/**
The coordinate Vector representing the Cell's copy source position on its &lt;canvas&gt;

Cell supports the following 'virtual' attributes for this attribute:

* __sourceX__ - (Number) the x coordinate on the source &lt;canvas&gt;
* __sourceY__ - (Number) the y coordinate on the source &lt;canvas&gt;

@property source
@type Vector
**/		
		source: {x:0,y:0,z:0},
/**
A change Vector which can be applied to the Cell's copy source point

Cell supports the following 'virtual' attributes for this attribute:

* __sourceDeltaX__ - (Number) a horizontal change value, in pixels
* __sourceDeltaY__ - (Number) a vertical change value, in pixels
@property sourceDelta
@type Vector
**/		
		sourceDelta: {x:0,y:0,z:0},
/**
Copy width, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
@property sourceWidth
@type Number
@default 0
**/
		sourceWidth: 0,
/**
Copy height, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
@property sourceHeight
@type Number
@default 0
**/
		sourceHeight: 0,
/**
Maximum permitted source width, in pixels (Cell.zoom)
@property sourceMaxWidth
@type Number
@default 0
**/
		sourceMaxWidth: 0,
/**
Maximum permitted source height, in pixels (Cell.zoom)
@property sourceMaxHeight
@type Number
@default 0
**/
		sourceMaxHeight: 0,
/**
Minimum permitted source width, in pixels (Cell.zoom)
@property sourceMinWidth
@type Number
@default 0
**/
		sourceMinWidth: 0,
/**
Minimum permitted source height, in pixels (Cell.zoom)
@property sourceMinHeight
@type Number
@default 0
**/
		sourceMinHeight: 0,
/**
Paste width, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property targetWidth
@type Number
@default 0
**/
		targetWidth: 0,
/**
Paste height, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property targetHeight
@type Number
@default 0
**/
		targetHeight: 0,
/**
DOM &lt;canvas&gt; element's width (not CSS width)

_Never change this attribute directly_
@property actualWidth
@type Number
@default 0
**/
		actualWidth: 0,
/**
DOM &lt;canvas&gt; element's height (not CSS height)

_Never change this attribute directly_
@property actualHeight
@type Number
@default 0
**/
		actualHeight: 0,
/**
Lock this Cell to another Cell, to allow zooming between them; permitted String: CELLNAME
@property lockTo
@type String
@default ''
**/
		lockTo: '',
/**
@property fieldLabel
@type String
@default ''
**/
		fieldLabel: '',
/**
Transparency level to be used when copying this Cell's &lt;canvas&gt; element to another &lt;canvas&gt;. Permitted values are between 0 (fully transparent) and 1 (fully opaque)
@property globalAlpha
@type Number
@default 1
**/
		globalAlpha: 1,
/**
Composition method to be used when copying this Cell's &lt;canvas&gt; element to another &lt;canvas&gt;. Permitted values include

* 'source-over'
* 'source-atop'
* 'source-in'
* 'source-out'
* 'destination-over'
* 'destination-atop'
* 'destination-in'
* 'destination-out'
* 'lighter'
* 'darker'
* 'copy'
* 'xor'

_Be aware that different browsers render these operations in different ways, and some options are not supported by all browsers_
@property globalCompositeOperation
@type String
@default 'source-over'
**/
		globalCompositeOperation: 'source-over',
/**
DOM &lt;canvas&gt; element's background color; use any permitted CSS color String

_Background colors are achieved via JavaScript canvas API drawing methods. Setting the CSS backgroundColor attribute on a &lt;canvas&gt; element is not recommended_
@property backgroundColor
@type String
@default 'rgba(0,0,0,0)'
**/
		backgroundColor: 'rgba(0,0,0,0)',
/**
CTXNAME of this Cell's Context object

_Cells use a Context object to keep track of the settings supplied to its &lt;canvas&gt; element's 2d context engine_
@property context
@type String
@default ''
@private
**/
		context: '',
/**
Array of GROUPNAMES that contribute to building this Cell's scene
@property groups
@type Array
@default []
**/
		groups: [],
/**
Pad dimension flag: when true, instructs the Cell to use its Pad object's dimensions as its source dimensions (sourceWidth, sourceHeight)
@property usePadDimensions
@type Boolean
@default false
@private
**/
		usePadDimensions: false,
/**
Reflection flag; set to true to flip Cell along the Y axis
@property flipReverse
@type Boolean
@default false
**/
		flipReverse: false,
/**
Reflection flag; set to true to flip Cell along the X axis
@property flipUpend
@type Boolean
@default false
**/
		flipUpend: false,
/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the X axis
@property lockX
@type Boolean
@default false
**/
		lockX: false,
/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the Y axis
@property lockY
@type Boolean
@default false
**/
		lockY: false,
/**
Cell rotation (in degrees)
@property roll
@type Number
@default 0
**/
		roll: 0,
		};
	scrawl.mergeInto(scrawl.d.Cell, scrawl.d.SubScrawl);

/**
Turn the object into a JSON String
@method toString
@param {Boolean} [noexternalobjects] True to exclude external objects such as sprites, designs and groups
@return Array of JSON strings of non-default value attributes
**/
	Cell.prototype.toString = function(noexternalobjects){
		var keys = Object.keys(scrawl.d[this.type]),
			result = {},
			resarray = [],
			sprites = [],
			ctx,
			designs = [];
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.contains(['start', 'delta', 'handle', 'source', 'sourceDelta'], keys[i])){
				if(!this[keys[i]].isLike(scrawl.d[this.type][keys[i]])){
					result[keys[i]] = this[keys[i]];
					}
				}
			else if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		resarray.push(JSON.stringify(result));
		if(!noexternalobjects){
			for(var i=0, z=this.groups.length; i<z; i++){
				for(var j=0, w=scrawl.group[this.groups[i]].sprites.length; j<w; j++){
					scrawl.pushUnique(sprites, scrawl.group[this.groups[i]].sprites[j]);
					}
				resarray.push(scrawl.group[this.groups[i]].toString(true));
				}
			for(var i=0, z=sprites.length; i<z; i++){
				ctx = scrawl.ctx[scrawl.sprite[sprites[i]].context];
				if(scrawl.contains(scrawl.designnames, ctx.fillStyle)){
					scrawl.pushUnique(designs, ctx.fillStyle);
					}
				if(scrawl.contains(scrawl.designnames, ctx.strokeStyle)){
					scrawl.pushUnique(designs, ctx.strokeStyle);
					}
				if(scrawl.contains(scrawl.designnames, ctx.shadowColor)){
					scrawl.pushUnique(designs, ctx.shadowColor);
					}
				}
			for(var i=0, z=designs.length; i<z; i++){
				resarray.push(scrawl.design[designs[i]].toString());
				}
			for(var i=0, z=sprites.length; i<z; i++){
				resarray.push(scrawl.sprite[sprites[i]].toString(true));
				}
			}
		return resarray;
		};
		
/**
Overrides SubScrawl.get(), to allow users to get values for sourceX, sourceY, sourceDeltaX, sourceDeltaY, startX, startY, targetX, targetY, deltaX, deltaY, handleX, handleY
@method get
@param {String} item Attribute key
@return Attribute value
**/
	Cell.prototype.get = function(item){
		if(scrawl.contains(['targetX', 'targetY', 'sourceX', 'sourceY', 'sourceDeltaX', 'sourceDeltaY'], item)){
			switch(item){
				case 'targetX' : return this.start.x; break;
				case 'targetY' : return this.start.y; break;
				case 'sourceX' : return this.source.x; break;
				case 'sourceY' : return this.source.y; break;
				case 'sourceDeltaX' : return this.sourceDelta.x; break;
				case 'sourceDeltaY' : return this.sourceDelta.y; break;
				}
			}
		else if(scrawl.contains(['target', 'source', 'sourceDelta'], item)){
			switch(item){
				case 'target' : return this.start.getVector(); break;
				case 'source' : return this.source.getVector(); break;
				case 'sourceDelta' : return this.sourceDelta.getVector(); break;
				}
			}
		else if(scrawl.contains(['width', 'height'], item)){
			switch(item){
				case 'width' : return (this.usePadDimensions) ? this.getPadWidth() : this.actualWidth; break;
				case 'height' : return (this.usePadDimensions) ? this.getPadHeight() : this.actualHeight; break;
				}
			}
		else{
			return SubScrawl.prototype.get.call(this, item);
			}
		};

/**
Overrides SubScrawl.set(), to allow users to set the start, delta, handle, source and sourceDelta attributes using startX, startY, targetX, targetY, deltaX, deltaY, handleX, handleY, sourceX, sourceY, sourceDeltaX, sourceDeltaY.
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Cell.prototype.set = function(items){
		var temp;
		SubScrawl.prototype.set.call(this, items);				//handles items.start, items.startX, items.startY, items.delta, items.deltaX, items.deltaY
		items = (scrawl.isa(items,'obj')) ? items : {}
		if(scrawl.xto([items.target, items.targetX, items.targetY])){
			temp = (scrawl.xt(items.target)) ? items.target : {};
			this.start.x = items.targetX || temp.x || this.start.x;
			this.start.y = items.targetY || temp.y || this.start.y;
			}
		if(scrawl.xto([items.source, items.sourceX, items.sourceY])){
			temp = (scrawl.xt(items.source)) ? items.source : {};
			this.source.x = items.sourceX || temp.x || this.source.x;
			this.source.y = items.sourceY || temp.y || this.source.y;
			}
		if(scrawl.xto([items.sourceDelta, items.sourceDeltaX, items.sourceDeltaY])){
			temp = (scrawl.xt(items.sourceDelta)) ? items.sourceDelta : {};
			this.sourceDelta.x = items.sourceDeltaX || temp.x || this.sourceDelta.x;
			this.sourceDelta.y = items.sourceDeltaY || temp.y || this.sourceDelta.y;
			}
		if(scrawl.xto([items.sourceWidth, items.sourceHeight, items.targetWidth, items.targetHeight, items.width, items.height])){
			this.sourceWidth = items.sourceWidth || items.width || this.sourceWidth;
			this.sourceHeight = items.sourceHeight || items.height || this.sourceHeight;
			this.targetWidth = items.targetWidth || items.width || this.targetWidth;
			this.targetHeight = items.targetHeight || items.height || this.targetHeight;
			}
		if(scrawl.xto([items.width,items.height,items.actualWidth,items.actualHeight])){
			this.actualWidth = items.actualWidth || items.width || this.actualWidth;
			this.actualHeight = items.actualHeight || items.height || this.actualHeight;
			this.setDimensions(items);
			}
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Overrides SubScrawl.setDelta to allow changes to be made using attributes: source, sourceX, sourceY, sourceDelta, sourceDeltaX, sourceDeltaY, sourceWidth, sourceHeight, start, startX, startY, target, targetX, targetY, delta, deltaX, deltaY, targetWidth, targetHeight, globalAlpha
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Cell.prototype.setDelta = function(items){
		var temp;
		SubScrawl.prototype.setDelta.call(this, items);			//handles items.start, items.startX, items.startY, items.delta, items.deltaX, items.deltaY
		if(scrawl.xto([items.source, items.sourceX, items.sourceY])){
			temp = (scrawl.xt(items.source)) ? items.source : {};
			this.source.x += items.sourceX || temp.x || 0;
			this.source.y += items.sourceY || temp.y || 0;
			}
		if(scrawl.xto([items.sourceDelta, items.sourceDeltaX, items.sourceDeltaY])){
			temp = (scrawl.xt(items.sourceDelta)) ? items.sourceDelta : {};
			this.sourceDelta.x += items.sourceDeltaX || temp.x || 0;
			this.sourceDelta.y += items.sourceDeltaY || temp.y || 0;
			}
		if(scrawl.xto([items.sourceWidth, items.sourceHeight])){
			this.sourceWidth += items.sourceWidth || 0;
			this.sourceHeight += items.sourceHeight || 0;
			}
		if(scrawl.xto([items.target, items.targetX, items.targetY])){
			temp = (scrawl.xt(items.target)) ? items.target : {};
			this.start.x += items.targetX || temp.x || 0;
			this.start.y += items.targetY || temp.y || 0;
			}
		if(scrawl.xto([items.targetWidth, items.targetHeight])){
			this.targetWidth += items.targetWidth || 0;
			this.targetHeight += items.targetHeight || 0;
			}
		if(scrawl.xt(items.globalAlpha)){
			this.globalAlpha += items.globalAlpha;
			}
		return this;
		};
	Cell.prototype.getPadWidth = function(){
		return scrawl.pad[this.pad].get('width');
		};
	Cell.prototype.getPadHeight = function(){
		return scrawl.pad[this.pad].get('height');
		};
		
/**
Adds delta values to the start vector; adds sourceDelta values to the source vector; adds deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x added to start.x; deltaSource.x added to source.x
* 'y' - delta.y added to start.y; deltaSource.y added to source.y
* 'start', 'target' - delta added to start
* 'source' - deltaSource added to source
* 'path' - deltaPathPlace added to pathPlace 
* undefined: all values are amended
@method updateStart
@param {String} [item] String used to limit this function's actions
@return This
@chainable
**/
	Cell.prototype.updateStart = function(item){
		switch(item){
			case 'x' :
				this.start.x += this.delta.x || 0;
				this.source.x += this.deltaSource.x || 0;
				break;
			case 'y' :
				this.start.y += this.delta.y || 0;
				this.source.y += this.deltaSource.y || 0;
				break;
			case 'start' :
			case 'target' :
				this.start.vectorAdd(this.delta);
				break;
			case 'source' :
				this.source.vectorAdd(this.sourceDelta);
				break;
			case 'path' :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			default :
				this.pathPlace += this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				this.start.vectorAdd(this.delta);
				this.source.vectorAdd(this.sourceDelta);
			}
		return this;
		};

/**
Subtracts delta values from the start vector; subtracts sourceDelta values from the source vector; subtracts deltaPathPlace to pathPlace

Permitted argument values include 
* 'x' - delta.x subtracted from start.x; deltaSource.x subtracted from source.x
* 'y' - delta.y subtracted from start.y; deltaSource.y subtracted from source.y
* 'start', 'target' - delta subtracted from start
* 'source' - deltaSource subtracted from source
* 'path' - deltaPathPlace subtracted from pathPlace 
* undefined: all values are amended
@method revertStart
@param {String} [item] String used to limit this function's actions
@return This
@chainable
**/
	Cell.prototype.revertStart = function(item){
		switch(item){
			case 'x' :
				this.start.x -= this.delta.x || 0;
				this.source.x -= this.deltaSource.x || 0;
				break;
			case 'y' :
				this.start.y -= this.delta.y || 0;
				this.source.y -= this.deltaSource.y || 0;
				break;
			case 'start' :
			case 'target' :
				this.start.vectorSubtract(this.delta);
				break;
			case 'source' :
				this.source.vectorSubtract(this.sourceDelta);
				break;
			case 'path' :
				this.pathPlace -= this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				break;
			default :
				this.pathPlace -= this.deltaPathPlace;
				if(this.pathPlace > 1){this.pathPlace -= 1;}
				if(this.pathPlace < 0){this.pathPlace += 1;}
				this.start.vectorSubtract(this.delta);
				this.source.vectorSubtract(this.sourceDelta);
			}
		return this;
		};

/**
Calculates the pixels value of the Cell's target attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	Cell.prototype.getPivotOffsetVector = function(){
		//result defaults to numerical offsets
		var result = this.handle.getVector(),
			height = this.targetHeight || this.get('height'),
			width = this.targetWidth || this.get('width');
		//calculate percentage offsets
		if((scrawl.isa(this.handle.x,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.x)){
			result.x = (parseFloat(this.handle.x)/100) * width;
			}
		else{
			switch (this.handle.x){
				//calculate string offsets
				case 'left' : result.x = 0; break;
				case 'center' : result.x = width/2; break;
				case 'right' : result.x = width; break;
				}
			}
		if((scrawl.isa(this.handle.y,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.y)){
			result.y = (parseFloat(this.handle.y)/100) * height;
			}
		else{
			switch (this.handle.y){
				//calculate string offsets
				case 'top' : result.y = 0; break;
				case 'center' : result.y = height/2; break;
				case 'bottom' : result.y = height; break;
				}
			}
		return result;
		};

/**
Zooms one cell in relation to another cell
@method zoom
@param {Number} item Number of pixels to amend the zoomed cell's start and dimensions by
@return This
@chainable
**/
	Cell.prototype.zoom = function(item){
		if(scrawl.isa(item,'num')){
			var	sWidth = this.sourceWidth,
				sHeight = this.sourceHeight,
				aWidth = this.actualWidth,
				aHeight = this.actualHeight,
				minWidth = this.get('sourceMinWidth') || this.sourceWidth,
				minHeight = this.get('sourceMinHeight') || this.sourceHeight,
				maxWidth = this.get('sourceMaxWidth') || this.sourceWidth,
				maxHeight = this.get('sourceMaxHeight') || this.sourceHeight,
				sx = this.source.x,
				sy = this.source.y,
				myW = sWidth + item,
				myH = sHeight + item,
				myX,
				myY;
			if(scrawl.isBetween(myW, minWidth, maxWidth, true) && scrawl.isBetween(myH, minHeight, maxHeight, true)){
				sWidth = myW;
				myX = sx - (item/2);
				if(myX < 0){
					sx = 0;
					}
				else if(myX > (aWidth - sWidth)){
					sx = aWidth - sWidth;
					}
				else{
					sx = myX;
					}
				sHeight = myH;
				myY = sy - (item/2);
				if(myY < 0){
					sy = 0;
					}
				else if(myY > (aHeight - sHeight)){
					sy = aHeight - sHeight;
					}
				else{
					sy = myY;
					}
				this.source.x = sx;
				this.source.y = sy;
				this.sourceWidth = sWidth;
				this.sourceHeight = sHeight;
				}
			}
		return this;
		};

/**
Builds a collision map image from sprites, for use in sprite field collision detection functions
@method buildField
@return This
@chainable
**/
	Cell.prototype.buildField = function(){
		var	fieldSprites = [],
			fenceSprites = [],
			tempsprite = '',
			tempfill,
			tempstroke,
			buildFieldBlock = new Block({
				width: this.actualWidth,
				height: this.actualHeight,
				group: this.name,
				});
		buildFieldBlock.stamp();
		scrawl.deleteSprite(buildFieldBlock.name);
		fieldSprites = scrawl.group[this.name+'_field'].sprites;
		for(var i=0, z=fieldSprites.length; i<z; i++){
			tempsprite = scrawl.sprite[fieldSprites[i]];
			tempfill = scrawl.ctx[tempsprite.context].fillStyle;
			tempstroke = scrawl.ctx[tempsprite.context].strokeStyle;
			scrawl.ctx[tempsprite.context].fillStyle = 'rgba(255,255,255,1)';
			scrawl.ctx[tempsprite.context].strokeStyle = 'rgba(255,255,255,1)';
			tempsprite.forceStamp('fillDraw',this.name);
			scrawl.ctx[tempsprite.context].fillStyle = tempfill;
			scrawl.ctx[tempsprite.context].strokeStyle = tempstroke;
			}
		fenceSprites = scrawl.group[this.name+'_fence'].sprites;
		for(var i=0, z=fenceSprites.length; i<z; i++){
			tempsprite = scrawl.sprite[fenceSprites[i]];
			tempfill = scrawl.ctx[tempsprite.context].fillStyle;
			tempstroke = scrawl.ctx[tempsprite.context].strokeStyle;
			scrawl.ctx[tempsprite.context].fillStyle = 'rgba(0,0,0,1)';
			scrawl.ctx[tempsprite.context].strokeStyle = 'rgba(0,0,0,1)';
			tempsprite.forceStamp('fillDraw',this.name);
			scrawl.ctx[tempsprite.context].fillStyle = tempfill;
			scrawl.ctx[tempsprite.context].strokeStyle = tempstroke;
			}
		this.set({
			fieldLabel: this.getImageData({
				name: 'field',
				}),
			});
		return this;
		};

/**
Cell field collision detection function

Argument should be in the form of:

* {channel:String, test:Number, coordinates:Array of Vectors, x:Number, y:Number}

Where:

* __channel__ (optional) can be 'red', 'green', 'blue', 'alpha', or 'anycolor' (default)
* __test__ (optional) can be a value between 0 and 254 (default: 0)
* __coordinates__ (optional) is an array of Vector coordinates, in pixels, relative to the Cell's &lt;canvas&gt; element's top left corner
* __x__ (optional) is the horizontal coordinate, in pixels, relative to the Cell's top left corner
* __y__ (optional) is the vertical coordinate, in pixels, relative to the Cell's top left corner

Either include a single coordinate (x, y), or an array of coordinate Vectors

Test will return: 
* false if it encounters a coordinate outside the bou8ds of its image map
* true if all coordinates exceed the test level (thus a sprite testing in the red channel will report true if it is entirely within a red part of the collision map
* the first coordinate that falls below, or equals, the test level
@method checkFieldAt
@param {Object} items Argument containing details of how and where to check the cell's collision map image
@return Vector of first the first coordinates to 'pass' the test
@private
**/
	Cell.prototype.checkFieldAt = function(items){
		items = (scrawl.isa(items,'obj')) ? items : false;
		var	myChannel = items.channel || 'anycolor',
			myTest = items.test || 0,
			x, 
			y, 
			coords = (items.coordinates) ? items.coordinates : [{x: items.x || 0, y: items.y || 0}], 
			pos,
			d,
			fieldLabel = this.get('fieldLabel');
		d = scrawl.imageData[fieldLabel];
		for(var i=0, z=coords.length; i<z; i++){
			x = Math.round(coords[i].x);
			y = Math.round(coords[i].y);
			if(!scrawl.isBetween(x, 0, d.width, true) || !scrawl.isBetween(y, 0, d.height, true)){
				return false;
				break;
				}
			else{
				pos = ((y * d.width) + x) * 4;
				switch(myChannel){
					case 'red' : 
						if(d.data[pos] <= myTest){
							return coords[i];
							}
						break;
					case 'green' : 
						if(d.data[pos+1] <= myTest){
							return coords[i];
							}
						break;
					case 'blue' : 
						if(d.data[pos+2] <= myTest){
							return coords[i];
							}
						break;
					case 'alpha' : 
						if(d.data[pos+3] <= myTest){
							return coords[i];
							}
						break;
					case 'anycolor' :
						if(d.data[pos] <= myTest || d.data[pos+1] <= myTest || d.data[pos+2] <= myTest){
							return coords[i];
							}
						break;
					}
				}
			}
		return true;
		};

/**
Set the Cell's &lt;canvas&gt; element's context engine to the specification supplied by the sprite about to be drawn on the canvas
@method setEngine
@param {Sprite} sprite Sprite object
@return Sprite object
@private
**/
	Cell.prototype.setEngine = function(sprite){
		if(!sprite.fastStamp){
			var myContext = scrawl.ctx[this.context],
				spriteContext = scrawl.ctx[sprite.context],
				engine,
				tempFillStyle, 
				tempStrokeStyle, 
				des,
				changes = spriteContext.getChanges(myContext, sprite.scale, sprite.scaleOutline);
			if(changes){
				delete changes.count;
				engine = scrawl.context[this.name];
				for(var item in changes){
					des = false;
					if(item[0] < 'm'){
						if(item[0] < 'l'){
							switch(item){
								case 'fillStyle' :
									if(scrawl.xt(scrawl.design[changes[item]])){
										des	= scrawl.design[changes[item]];
										if(scrawl.contains(['Gradient','RadialGradient'], des.type)){
											des.update(sprite.name,this.name);
											}
										tempFillStyle = des.getData();
										}
									else{
										tempFillStyle = changes[item];
										}
									engine.fillStyle = tempFillStyle;
									break;
								case 'font' : engine.font = changes[item]; break;
								case 'globalAlpha' : engine.globalAlpha = changes[item]; break;
								case 'globalCompositeOperation' : engine.globalCompositeOperation = changes[item]; break;
								}
							}
						else{
							switch(item){
								case 'lineCap' : engine.lineCap = changes[item]; break;
								case 'lineDash' :
									engine.mozDash = changes[item];
									engine.lineDash = changes[item];
									try{engine.setLineDash(changes[item]);}catch(e){}
									break;
								case 'lineDashOffset' : 
									engine.mozDashOffset = changes[item]; 
									engine.lineDashOffset = changes[item]; 
									break;
								case 'lineJoin' : engine.lineJoin = changes[item]; break;
								case 'lineWidth' : engine.lineWidth = changes[item]; break;
								}
							}
						}
					else{
						if(item[0] == 's'){
							switch(item){
								case 'shadowBlur' : engine.shadowBlur = changes[item]; break;
								case 'shadowColor' : engine.shadowColor = changes[item]; break;
								case 'shadowOffsetX' : engine.shadowOffsetX = changes[item]; break;
								case 'shadowOffsetY' : engine.shadowOffsetY = changes[item]; break;
								case 'strokeStyle' :
									if(scrawl.xt(scrawl.design[changes[item]])){
										des	= scrawl.design[changes[item]];
										if(scrawl.contains(['Gradient','RadialGradient'], des.type)){
											des.update(sprite.name,this.name);
											}
										tempStrokeStyle = des.getData();
										}
									else{
										tempStrokeStyle = changes[item];
										}
									engine.strokeStyle = tempStrokeStyle;
									break;
								}
							}
						else{
							switch(item){
								case 'miterLimit' : engine.miterLimit = changes[item]; break;
								case 'textAlign' : engine.textAlign = changes[item]; break;
								case 'textBaseline' : engine.textBaseline = changes[item]; break;
								case 'winding' :
									engine.mozFillRule = changes[item];
									engine.msFillRule = changes[item];
									break;
								}
							}
						}
					myContext[item] = changes[item];
					}
				}
			}
		return sprite;
		};

/**
Clear the Cell's &lt;canvas&gt; element using JavaScript ctx.clearRect()
@method clear
@return This
@chainable
**/
	Cell.prototype.clear = function(){
		var ctx = scrawl.context[this.name];
		ctx.setTransform(1,0,0,1,0,0);
		ctx.clearRect(0, 0, this.actualWidth, this.actualHeight);
		return this;
		};

/**
Prepare to draw sprites onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array
@method compile
@return This
@chainable
**/
	Cell.prototype.compile = function(){
		if(this.get('backgroundColor') !== 'rgba(0,0,0,0)'){
			this.stampBackground();
			}
		this.groups.sort(function(a,b){
			return scrawl.group[a].order - scrawl.group[b].order;
			});
		for(var i=0, z=this.groups.length; i<z; i++){
			if(scrawl.group[this.groups[i]].get('visibility')){
				scrawl.group[this.groups[i]].stamp(false, this.name);
				}
			}
		return this;
		};

/**
Clear the Cell's &lt;canvas&gt; element using JavaScript ctx.fillRect(), using the cell's .backgroundColor attribute
@method stampBackground
@return This
@chainable
**/
	Cell.prototype.stampBackground = function(){
		var	ctx = scrawl.context[this.name],
			fill = this.get('backgroundColor'),
			w = this.actualWidth,
			h = this.actualHeight,
			tempFillStyle = ctx.fillStyle;
		ctx.setTransform(1,0,0,1,0,0);
		ctx.fillStyle = fill;
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = tempFillStyle;
		return this;
		};

/**
Cell copy helper function
@method setStampUsingPivot
@return This
@chainable
@private
**/
	Cell.prototype.setStampUsingPivot = function(){
		var	here,
			myCell,
			myP,
			myPVector,
			pSprite,
			myPad,
			base;
		if(scrawl.contains(scrawl.pointnames, this.pivot)){
			myP = scrawl.point[this.pivot];
			pSprite = scrawl.sprite[myP.sprite];
			myPVector = myP.getCurrentCoordinates().rotate(pSprite.roll).vectorAdd(pSprite.start);
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(scrawl.contains(scrawl.spritenames, this.pivot)){
			myP = scrawl.sprite[this.pivot];
			myPVector = (myP.type === 'Particle') ? myP.get('position') : myP.start.getVector();
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(this.pivot === 'mouse'){
			myPad = scrawl.pad[this.pad];
			base = scrawl.cell[myPad.base];
			here = myPad.getMouse();
			if(myPad.width !== base.actualWidth){
				here.x /= (myPad.width/base.actualWidth);
				}
			if(myPad.height !== base.actualHeight){
				here.y /= (myPad.height/base.actualHeight);
				}
			if(!scrawl.xta([this.mouseX,this.mouseY])){
				this.mouseX = this.start.x;
				this.mouseY = this.start.y;
				}
			if(here.active){
				this.start.x = (!this.lockX) ? this.start.x + here.x - this.mouseX : this.start.x;
				this.start.y = (!this.lockY) ? this.start.y + here.y - this.mouseY : this.start.y;
				this.mouseX = here.x;
				this.mouseY = here.y;
				}
			}
		return this;
		};

/**
Cell copy helper function
@method rotateDestination
@param {Object} engine Javascript canvas context object
@return This
@chainable
@private
**/
	Cell.prototype.rotateDestination = function(engine){
		var myA = (this.flipReverse) ? -1 : 1,
			myD = (this.flipUpend) ? -1 : 1,
			deltaRotation = (this.addPathRoll) ? (this.roll + this.pathRoll) * scrawl.radian : this.roll * scrawl.radian,
			cos = Math.cos(deltaRotation),
			sin = Math.sin(deltaRotation);
		engine.setTransform((cos * myA), (sin * myA), (-sin * myD), (cos * myD), this.start.x, this.start.y);
		return this;
		};

/**
Cell copy helper function
@method prepareToCopyCell
@param {Object} engine Javascript canvas context object
@return This
@chainable
@private
**/
	Cell.prototype.prepareToCopyCell = function(engine){
		var	here;
		if(!this.offset){
			this.offset = this.getOffsetStartVector();
			}
		if(this.pivot){
			this.setStampUsingPivot();
			}
		else if(scrawl.contains(scrawl.spritenames, this.path) && scrawl.sprite[this.path].type === 'Shape'){
			here = scrawl.sprite[this.path].getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
			this.start.x = (!this.lockX) ? here.x : this.start.x;
			this.start.y = (!this.lockY) ? here.y : this.start.y;
			this.pathRoll = here.r || 0;
			}
		this.rotateDestination(engine);
		return this;
		};

/**
Cell copy helper function
@method copyCellToSelf
@param {String} cell CELLNAME of cell to be copied onto this cell's &lt;canvas&gt; element
@param {Boolean} [usePadScale] Set to true when copying cells onto the display canvas; false otherwise
@return This
@chainable
@private
**/
	Cell.prototype.copyCellToSelf = function(cell, usePadScale){
		cell = (scrawl.isa(cell,'str')) ? scrawl.cell[cell] : cell;
		usePadScale = (scrawl.xt(usePadScale)) ? usePadScale : false;
		var	lockTo = cell.get('lockTo'),
			myCell = (lockTo) ? scrawl.cell[lockTo] : cell;
		if(scrawl.xt(myCell)){
			var	usePadDimensions = myCell.usePadDimensions,
				pad = scrawl.pad[myCell.pad],
				padWidth = pad.width,
				padHeight = pad.height,
				scale = (usePadScale) ? pad.scale : this.scale,
				sourceX = myCell.source.x || this.source.x,
				sourceY = myCell.source.y || this.source.y,
				sourceWidth = myCell.sourceWidth || this.sourceWidth,
				sourceHeight = myCell.sourceHeight || this.sourceHeight,
				targetWidth = (usePadDimensions) ? padWidth * scale : myCell.targetWidth * scale,
				targetHeight = (usePadDimensions) ? padHeight * scale : myCell.targetHeight * scale,
				context = scrawl.context[this.name],
				ctx = scrawl.ctx[this.name],
				cga = myCell.get('globalAlpha'),
				xga = ctx.get('globalAlpha'),
				cgco = myCell.get('globalCompositeOperation'),
				xgco = ctx.get('globalCompositeOperation');
			if(cga !== xga){
				context.globalAlpha = cga;
				ctx.set({globalAlpha: cga});
				}
			if(cgco !== xgco){
				context.globalCompositeOperation = cgco;
				ctx.set({globalCompositeOperation: cgco});
				}
			scrawl.context[myCell.name].setTransform(1,0,0,1,0,0);
			myCell.prepareToCopyCell(context);
			context.drawImage(scrawl.canvas[myCell.name], sourceX, sourceY, sourceWidth, sourceHeight, myCell.offset.x, myCell.offset.y, targetWidth, targetHeight);
			}
		return this;
		};

/**
Sprite stamp helper function
@method clearShadow
@return This
@chainable
@private
**/
	Cell.prototype.clearShadow = function(){
		var	engine = scrawl.context[this.name],
			context = scrawl.ctx[this.context];
		engine.shadowOffsetX = 0.0;
		engine.shadowOffsetY = 0.0;
		engine.shadowBlur = 0.0;
		context.set({
			shadowOffsetX: 0.0,
			shadowOffsetY: 0.0,
			shadowBlur: 0.0,
			});
		return this;
		};

/**
Sprite stamp helper function
@method restoreShadow
@return This
@chainable
@private
**/
	Cell.prototype.restoreShadow = function(spritecontext){
		var	engine = scrawl.context[this.name],
			context = scrawl.ctx[this.context],
			s = scrawl.ctx[spritecontext],
			sx = s.get('shadowOffsetX'),
			sy = s.get('shadowOffsetY'),
			sb = s.get('shadowBlur');
		engine.shadowOffsetX = sx;
		engine.shadowOffsetY = sy;
		engine.shadowBlur = sb;
		context.set({
			shadowOffsetX: sx,
			shadowOffsetY: sy,
			shadowBlur: sb,
			});
		return this;
		};

/**
Sprite stamp helper function
@method setToClearShape
@return This
@chainable
@private
**/
	Cell.prototype.setToClearShape = function(){
		var	engine = scrawl.context[this.name],
			context = scrawl.ctx[this.context];
		engine.fillStyle = 'rgba(0, 0, 0, 0)';
		engine.strokeStyle = 'rgba(0, 0, 0, 0)';
		engine.shadowColor = 'rgba(0, 0, 0, 0)';
		context.set({
			fillStyle: 'rgba(0, 0, 0, 0)',
			strokeStyle: 'rgba(0, 0, 0, 0)',
			shadowColor: 'rgba(0, 0, 0, 0)',
			});
		return this;
		};

/**
Amend the physical dimensions of the Cell's &lt;canvas&gt; element

Omitting the argument will force the &lt;canvas&gt; to set itself to its Pad object's dimensions
@method setDimensions
@param {Object} [items] Argument with __width__ and/or __height__ attributes, in pixels
@return This
@chainable
**/
	Cell.prototype.setDimensions = function(items){
		var	myWidth,
			myHeight;
		if(scrawl.xt(items) && !this.usePadDimensions){
			myWidth = items.width || items.actualWidth || this.actualWidth;
			myHeight = items.height || items.actualHeight || this.actualHeight;
			}
		else{
			myWidth = this.getPadWidth();
			myHeight = this.getPadHeight();
			}
		scrawl.canvas[this.name].width = myWidth;
		scrawl.canvas[this.name].height = myHeight;
		Scrawl.prototype.set.call(this,{
			actualWidth: myWidth,
			actualHeight: myHeight,
			});
		return this;
		};

/**
Perform a JavaScript ctx.save() operation
@method saveContext
@return This
@chainable
**/
	Cell.prototype.saveContext = function(){
		scrawl.context[this.name].save();
		return this;
		};

/**
Perform a JavaScript ctx.restore() operation
@method restoreContext
@return This
@chainable
**/
	Cell.prototype.restoreContext = function(){
		scrawl.context[this.name].restore();
		return this;
		};

/**
Capture an image of the cell's &lt;canvas&gt; element using the JavaScript ctx.getImageData() operation

Argument is an Object in the form:

* {x:Number, y:Number, width:Number, height:Number}

Default values are:

* {0, 0, this.actualWidth, this.actualHeight}

@method getImageData
@param {Object} dimensions Details of the &lt;canvas&gt; area to be saved
@return String label pointing to where the image has been saved in the scrawl library - scrawl.imageData[STRING]
**/
	Cell.prototype.getImageData = function(dimensions){
		dimensions = (scrawl.isa(dimensions,'obj')) ? dimensions : {};
		var	myLabel = (scrawl.isa(dimensions.name,'str')) ? this.name+'_'+dimensions.name : this.name+'_imageData',
			myX = (scrawl.isa(dimensions.x,'num')) ? dimensions.x : 0,
			myY = (scrawl.isa(dimensions.y,'num')) ? dimensions.y : 0,
			myW = (scrawl.isa(dimensions.width,'num')) ? dimensions.width : this.actualWidth,
			myH = (scrawl.isa(dimensions.height,'num')) ? dimensions.height : this.actualHeight;
		scrawl.imageData[myLabel] = scrawl.context[this.name].getImageData(myX, myY, myW, myH);
		return myLabel;
		};

/**
Perform a splice-shift-join operation on the &lt;canvas&gt; element's current scene

Argument is an Object in the form:

* {edge:String, strip:Number}

Permitted values for the argument Object's attributes are:

* __edge__ - one from 'horizontal', 'vertical', 'top', 'bottom', 'left', 'right'
* __strip__ - a width/height Number (in pixels) of the strip that is to be moved from the named edge of the &lt;canvas&gt; to the opposite edge

_Note that this function is only effective in achieving a parallax effect if the user never clears or updates the cell's &lt;canvas&gt; element, and takes steps to shift the cell's source vector appropriately each time the splice operation is performed_

@method spliceCell
@param {Object} items Object containing data for the splice operation
@return This
@chainable
**/
	Cell.prototype.spliceCell = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.contains(['horizontal','vertical','top','bottom','left','right'], items.edge)){
			var	myStrip, 
				myRemains, 
				myEdge, 
				height = this.actualHeight,
				width = this.actualWidth,
				c,
				e,
				canvas = scrawl.canvas[this.name],
				ctx = scrawl.context[this.name];
			c = document.createElement('canvas');
			c.width = width;
			c.height = height;
			e = c.getContext('2d');
			ctx.setTransform(1,0,0,1,0,0);
			switch(items.edge){
				case 'horizontal' :
					myStrip = myRemains = width/2;
					myEdge = 'left';
					break;
				case 'vertical' :
					myStrip = myRemains = height/2;
					myEdge = 'top';
					break;
				case 'top' :
				case 'bottom' :
					myStrip = items.strip || 20;
					myRemains = height - myStrip;
					myEdge = items.edge;
					break;
				case 'left' :
				case 'right' :
					myStrip = items.strip || 20;
					myRemains = width - myStrip;
					myEdge = items.edge;
					break;
				}

			switch(myEdge){
				case 'top' :
					e.drawImage(canvas, 0, 0, width, myStrip, 0, myRemains, width, myStrip);
					e.drawImage(canvas, 0, myStrip, width, myRemains, 0, 0, width, myRemains);
					break;
				case 'bottom' :
					e.drawImage(canvas, 0, 0, width, myRemains, 0, myStrip, width, myRemains);
					e.drawImage(canvas, 0, myRemains, width, myStrip, 0, 0, width, myStrip);
					break;
				case 'left' :
					e.drawImage(canvas, 0, 0, myStrip, height, myRemains, 0, myStrip, height);
					e.drawImage(canvas, myStrip, 0, myRemains, height, 0, 0, myRemains, height);
					break;
				case 'right' :
					e.drawImage(canvas, 0, 0, myRemains, height, myStrip, 0, myRemains, height);
					e.drawImage(canvas, myRemains, 0, myStrip, height, 0, 0, myStrip, height);
					break;
				}
			ctx.clearRect(0, 0, width, height);
			ctx.drawImage(c, 0, 0, width, height);
			}
		return this;
		};
		
/**
# Context
	
## Instantiation

* This object should never be instantiated by users

## Purpose

* wraps a given context for a Cell or Sprite object
* responsible for comparing contexts and listing changes that need to be made for successful Sprite stamping on a canvas
* all updates to a Context object's attributes should be performed via the Sprite object's set() function

@class Context
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Context(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		if(items.cell){
			this.getContextFromEngine(items.cell);
			}
		else{
			this.set(items);
			}
		scrawl.ctx[this.name] = this;
		scrawl.pushUnique(scrawl.ctxnames, this.name);
		return this;
		}
	Context.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Context'
@final
**/		
	Context.prototype.type = 'Context';
	Context.prototype.classname = 'ctxnames';
	scrawl.d.Context = {

/**
Color, gradient or pattern used to fill a sprite. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
* GRADIENTNAME String
* RADIALGRADIENTNAME String
* PATTERNNAME String
@property fillStyle
@type String
@default '#000000'
**/		
		fillStyle: '#000000',

/**
Shape and Outline sprite fill method. Can be:

* 'nonzero' - all areas enclosed by the sprite's path are flooded
* 'evenodd' - only 'odd' areas of the sprite's path are flooded
@property winding
@type String
@default 'nonzero'
**/		
		winding: 'nonzero',

/**
Color, gradient or pattern used to outline a sprite. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
* GRADIENTNAME String
* RADIALGRADIENTNAME String
* PATTERNNAME String
@property strokeStyle
@type String
@default '#000000'
**/		
		strokeStyle: '#000000',

/**
Sprite transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
@property globalAlpha
@type Number
@default 1
**/		
		globalAlpha: 1,

/**
Compositing method for applying the sprite to an existing Cell (&lt;canvas&gt;) display. Permitted values include

* 'source-over'
* 'source-atop'
* 'source-in'
* 'source-out'
* 'destination-over'
* 'destination-atop'
* 'destination-in'
* 'destination-out'
* 'lighter'
* 'darker'
* 'copy'
* 'xor'

_Be aware that different browsers render these operations in different ways, and some options are not supported by all browsers_

@property globalCompositeOperation
@type String
@default 'source-over'
**/		
		globalCompositeOperation: 'source-over',

/**
Line width, in pixels
@property lineWidth
@type Number
@default 1
**/		
		lineWidth: 1,

/**
Line cap styling. Permitted values include:

* 'butt'
* 'round'
* 'square'

@property lineCap
@type String
@default 'butt'
**/		
		lineCap: 'butt',

/**
Line join styling. Permitted values include:

* 'miter'
* 'round'
* 'bevel'

@property lineJoin
@type String
@default 'miter'
**/		
		lineJoin: 'miter',

/**
Line dash format - an array of Numbers representing line and gap values (in pixels), for example [5,2,2,2] for a long-short dash pattern
@property lineDash
@type Array
@default []
**/		
		lineDash: [],

/**
Line dash offset - distance along the sprite's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
@property lineDashOffset
@type Number
@default 0
**/		
		lineDashOffset: 0,

/**
miterLimit - affecting the 'pointiness' of the line join where two lines join at an acute angle
@property miterLimit
@type Number
@default 10
**/		
		miterLimit: 10,

/**
Horizontal offset of a sprite's shadow, in pixels
@property shadowOffsetX
@type Number
@default 0
**/		
		shadowOffsetX: 0,

/**
Vertical offset of a sprite's shadow, in pixels
@property shadowOffsetY
@type Number
@default 0
**/		
		shadowOffsetY: 0,

/**
Blur border for a sprite's shadow, in pixels
@property shadowBlur
@type Number
@default 0
**/		
		shadowBlur: 0,

/**
Color, gradient or pattern used for sprite shadow effect. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
@property shadowColor
@type String
@default 'rgba(0,0,0,0)'
**/		
		shadowColor: 'rgba(0,0,0,0)',

/**
Cascading Style Sheet font String, for Phrase sprites
@property font
@type String
@default '10pt sans-serif'
**/		
		font: '10pt sans-serif',

/**
Text alignment for multi-line Phrase sprites. Permitted values include:

* 'start'
* 'left'
* 'center'
* 'right'
* 'end'

@property textAlign
@type String
@default 'start'
**/		
		textAlign: 'start',

/**
Text baseline value for single-line Phrase sprites set to follow a Shape sprite path. Permitted values include:

* 'alphabetic'
* 'top'
* 'hanging'
* 'middle'
* 'ideographic'
* 'bottom'

@property textBaseline
@type String
@default 'alphabetic'
**/		
		textBaseline: 'alphabetic',
		};
	scrawl.contextKeys = Object.keys(scrawl.d.Context);
	scrawl.mergeInto(scrawl.d.Context, scrawl.d.Scrawl);

/**
Turn the object into a JSON String; doesn't include name and type attributes
@method toString
@return JSON string of non-default value attributes
**/
	Context.prototype.toString = function(){
		var result = {};
		for(var i = 0, z = scrawl.contextKeys.length; i < z; i++){
			if(scrawl.contextKeys[i] === 'lineDash'){
				if(scrawl.xt(this.lineDash) && this.lineDash.length > 0){
					result.lineDash = this.lineDash;
					}
				}
			else if(scrawl.xt(this[scrawl.contextKeys[i]]) && this[scrawl.contextKeys[i]] !== scrawl.d.Context[scrawl.contextKeys[i]]){
				result[scrawl.contextKeys[i]] = this[scrawl.contextKeys[i]];
				}
			}
		return JSON.stringify(result);
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function - lineDashOffset, lineWidth, globalAlpha

(Only for use by Context objects)
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
	Context.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.lineDashOffset)){
			if(!scrawl.xt(this.lineDashOffset)){
				this.lineDashOffset = scrawl.d.Context.lineDashOffset;
				}
			this.lineDashOffset += items.lineDashOffset;
			}
		if(scrawl.xt(items.lineWidth)){
			if(!scrawl.xt(this.lineWidth)){
				this.lineWidth = scrawl.d.Context.lineWidth;
				}
			this.lineWidth += items.lineWidth;
			}
		if(scrawl.xt(items.globalAlpha)){
			if(!scrawl.xt(this.globalAlpha)){
				this.globalAlpha = scrawl.d.Context.globalAlpha;
				}
			this.globalAlpha += items.globalAlpha;
			}
		return this;
		};

/**
Interrogates a &lt;canvas&gt; element's context engine and populates its own attributes with returned values

(Only for use by Context objects)
@method getContextFromEngine
@param {Object} ctx &lt;canvas&gt; element context engine Object
@return This
@chainable
@private
**/
	Context.prototype.getContextFromEngine = function(ctx){
		//only called for cell contexts, which require all attributes to be set
		for(var i=0, z=scrawl.contextKeys.length; i<z; i++){
			this[scrawl.contextKeys[i]] = ctx[scrawl.contextKeys[i]];
			}
		this.winding = ctx.mozFillRule || ctx.msFillRule || 'nonzero';
		this.lineDash = ctx.lineDash || [];
		this.lineDashOffset = ctx.mozDashOffset || ctx.lineDashOffset || 0;
		return this;
		};

/**
Interrogates a &lt;canvas&gt; element's context engine and populates its own attributes with returned values

(Only for use by Context objects)
@method getChanges
@param {Object} ctx &lt;canvas&gt; element context engine Object
@return This
@chainable
@private
**/
	Context.prototype.getChanges = function(ctx, scale, doscale){
		var	r = {},
			count = 0,
			temp,
			tempCol;
		for(var i=0, z=scrawl.contextKeys.length; i<z; i++){
			temp = this.get(scrawl.contextKeys[i]);
			//handle scalable items
			if(scrawl.contains(['lineWidth', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'], scrawl.contextKeys[i])){
				if(doscale){
					if(temp * scale !== ctx[scrawl.contextKeys[i]]){
						r[scrawl.contextKeys[i]] = temp * scale;
						count++;
						}
					}
				else{
					if(temp !== ctx[scrawl.contextKeys[i]]){
						r[scrawl.contextKeys[i]] = temp;
						count++;
						}
					}
				}
			//handle fillStyle, strokeStyle, shadowColor that use Color design objects
			else if(scrawl.contains(['fillStyle', 'strokeStyle', 'shadowColor'], scrawl.contextKeys[i]) && scrawl.contains(scrawl.designnames, temp) && scrawl.design[temp].type === 'Color'){
				tempCol = scrawl.design[temp].getData();
				if(tempCol !== ctx[scrawl.contextKeys[i]]){
					r[scrawl.contextKeys[i]] = tempCol;
					count++;
					}
				}
			//handle fillStyle, strokeStyle that use RadialGradient, Gradient design objects
			else if(scrawl.contains(['fillStyle', 'strokeStyle'], scrawl.contextKeys[i]) && scrawl.contains(scrawl.designnames, temp) && scrawl.contains(['Gradient','RadialGradient'], scrawl.design[temp].type) && scrawl.design[temp].autoUpdate){
				r[scrawl.contextKeys[i]] = temp;
				count++;
				}
			//handle linedash - an array that needs deep inspection to check for difference
			else if(scrawl.contains(['lineDash'], scrawl.contextKeys[i]) && scrawl.xt(ctx.lineDash)){
				if(temp.length !== ctx.lineDash.length){
					r.lineDash = temp;
					count++;
					}
				else{
					for(var j=0, w=temp.length; j<w; j++){
						if(temp[j] !== ctx.lineDash[j]){
							r.lineDash = temp;
							count++;
							break;
							}
						}
					}
				}
			//exclude items that have no equivalent in the context engine
			else if(scrawl.contains(['name', 'timestamp'], scrawl.contextKeys[i])){}
			//capture all other changes
			else{
				if(temp !== ctx[scrawl.contextKeys[i]]){
					r[scrawl.contextKeys[i]] = temp;
					count++;
					}
				}
			}
		return (count > 0) ? r : false;
		};
		
/**
# ScrawlImage
	
## Instantiation

* scrawl.getImagesByClass()

## Purpose

* Wraps DOM image elements imported into the scrawl library - &lt;img&gt;, &lt;video&gt;, &lt;svg&gt;
* Used by __Picture__ sprites and __Pattern__ designs
* Users should not interact directly with this object

@class ScrawlImage
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function ScrawlImage(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var iData = (scrawl.xt(items.imageData)) ? items.imageData : {},
			eData = (scrawl.xt(items.element)) ? items.element : {},
			data,
			makeCopy = (scrawl.xt(items.makeCopy)) ? items.makeCopy : false;
		if(scrawl.xto([items.element, items.imageData])){
			items.name = items.name || eData.getAttribute('id') || eData.getAttribute('name') || eData.getAttribute('src');
			Scrawl.call(this, items);
			this.width = items.width || iData.width || parseFloat(eData.offsetWidth) || eData.width || eData.style.width || 0;
			this.height = items.height || iData.height || parseFloat(eData.offsetHeight) || eData.height || eData.style.height || 0;
			data = (scrawl.xt(items.element)) ? this.getImageDataUrl(eData) : iData;
			if(scrawl.xt(items.element) && makeCopy){
				scrawl.img[this.name] = this.makeImage(data);
				}
			scrawl.image[this.name] = this;
			scrawl.pushUnique(scrawl.imagenames, this.name);
			scrawl.object[this.name] = eData;
			scrawl.pushUnique(scrawl.objectnames, this.name);
			this.source = items.source || this.name || '';
			return this;
			}
		return false;
		}
	ScrawlImage.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'ScrawlImage'
@final
**/
	ScrawlImage.prototype.type = 'ScrawlImage';
	ScrawlImage.prototype.classname = 'imagenames';
	scrawl.d.ScrawlImage = {
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
	scrawl.mergeInto(scrawl.d.ScrawlImage, scrawl.d.Scrawl);

/**
Makes a virtual image from an imageDataUrl

@method makeImage
@param {Object} data The imageDataUrl data
@return new DOM &lt;img&gt; object
@private
**/
	ScrawlImage.prototype.makeImage = function(data){
		var image = document.createElement('img');
		image.width = this.width;
		image.height = this.height;
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
	ScrawlImage.prototype.getImageDataUrl = function(image, putdata){
		putdata = (scrawl.xt(putdata)) ? putdata : false;
		scrawl.cv.width = this.width;
		scrawl.cv.height = this.height;
		(putdata) ? scrawl.cvx.putImageData(image, 0, 0) : scrawl.cvx.drawImage(image, 0, 0);
		return scrawl.cv.toDataURL();
		};

/**
Get image data - uses JavScript canvas API function ctx.getImageData()

_Note: does not save the data in the scrawl library_
@method getImageData
@param {Boolean} [source] When true, retrieves image data from the source image; default is false
@return getImageData data object
@private
**/
	ScrawlImage.prototype.getImageData = function(source){
		source = (scrawl.xt(source)) ? source : false;
		var image;
		if(scrawl.isa(source,'bool')){
			image = (source) ? scrawl.object[this.source] : scrawl.img[this.name];
			scrawl.cv.width = this.width;
			scrawl.cv.height = this.height;
			scrawl.cvx.drawImage(image, 0, 0);
			return scrawl.cvx.getImageData(0, 0, this.width, this.height);
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
	ScrawlImage.prototype.clone = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		items.element = (scrawl.xt(scrawl.img[this.name])) ? scrawl.img[this.name] : scrawl.object[this.source];
		items.makeCopy = true;
		return Scrawl.prototype.clone.call(this, items);
		};

/**
Grayscale filter

Attributes in the argument object:

* __value__ - Number or String. Percentage value of grayscaling effect: as a Number, between 0 (no effect) and 1 (full grayscale effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method grayscale
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	ScrawlImage.prototype.grayscale = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var value = (scrawl.xt(items.value)) ? items.value : 1,
			useSourceData = (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			imgData = items.use || this.getImageData(useSourceData),
			data = imgData.data,
			gray,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		value = (scrawl.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (scrawl.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
		for(var i=0, z=data.length; i<z; i += 4){
			gray = Math.floor((0.2126 * data[i]) + (0.7152 * data[i+1]) + (0.0722 * data[i+2]));
			data[i] = data[i] + ((gray - data[i]) * value);
			data[i+1] = data[i+1] + ((gray - data[i+1]) * value);
			data[i+2] = data[i+2] + ((gray - data[i+2]) * value);
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Sharpen filter

Attributes in the argument object:

* __value__ - Number or String. Percentage value of sharpen effect: as a Number, between 0 (no effect) and 1 (full sharpen effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method sharpen
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	ScrawlImage.prototype.sharpen = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var value = (scrawl.xt(items.value)) ? items.value : 1,
			useSourceData = (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			imgData = items.use || this.getImageData(useSourceData),
			save = (scrawl.xt(items.save)) ? items.save : true,
			mask,
			merge,
			result;
		value = (scrawl.isa(value, 'str')) ? parseFloat(value)/100 : value;
		mask = this.matrix({
			useSourceData: useSourceData,
			data: [0, -1, 0, -1, 5, -1, 0, -1, 0],
			save: false,
			});
		merge = this.mergeImages({
			image1: imgData,
			image2: mask,
			value: value,
			});
		if(save){
			result = this.getImageDataUrl(merge, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return merge;
		};

/**
Filter helper function - merge one image data object into another

Attributes in the argument object:

* __value__ - Number. Percentage value of merge, between 0 (image1 returned) and 1 (image2 returned)
* __image1__ - First image data object - fully displayed when _value_ is 0
* __image2__ - Second image data object - fully displayed when _value_ is 1
@method mergeImages
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
@private
**/
	ScrawlImage.prototype.mergeImages = function(items){
		if(scrawl.isa(items,'obj') && scrawl.xta([items.image1, items.image2, items.value])){
			var img1 = items.image1,
				dat1 = img1.data,
				img2 = items.image2,
				dat2 = img2.data,
				val = items.value;
			if(val === 0){
				return img1;
				}
			else if(val === 1){
				return img2;
				}
			else{
				for(var i=0, z=dat1.length; i<z; i += 4){
					dat1[i] = (dat1[i] * (1 - val)) + ((dat2[i]) * val);
					dat1[i+1] = (dat1[i+1] * (1 - val)) + ((dat2[i+1]) * val);
					dat1[i+2] = (dat1[i+2] * (1 - val)) + ((dat2[i+2]) * val);
					}
				return img1;
				}
			}
		return false;
		};

/**
Invert filter

Attributes in the argument object:

* __value__ - Number or String. Percentage value of invert effect: as a Number, between 0 (no effect) and 1 (full invert effect); as a String, between '0%' and '100%' (default: 1)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method invert
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	ScrawlImage.prototype.invert = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var value = (scrawl.xt(items.value)) ? items.value : 1,
			useSourceData = (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			imgData = items.use || this.getImageData(useSourceData),
			data = imgData.data,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		value = (scrawl.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (scrawl.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
		for(var i=0, z=data.length; i<z; i += 4){
			data[i] = (data[i] * (1 - value)) + ((255 - data[i]) * value);
			data[i+1] = (data[i+1] * (1 - value)) + ((255 - data[i+1]) * value);
			data[i+2] = (data[i+2] * (1 - value)) + ((255 - data[i+2]) * value);
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Brightness filter

Attributes in the argument object:

* __value__ - Number or String. Percentage value of brightness effect: as a Number, between 0 (black) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method brightness
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	ScrawlImage.prototype.brightness = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var value = (scrawl.xt(items.value)) ? items.value : 1,
			useSourceData = items.use || (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			imgData = this.getImageData(useSourceData),
			data = imgData.data,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		value = (scrawl.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (value < 0) ? 0 : value;
		for(var i=0, z=data.length; i<z; i += 4){
			data[i] = data[i] * value;
			data[i+1] = data[i+1] * value;
			data[i+2] = data[i+2] * value;
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Saturation filter

Attributes in the argument object:

* __value__ - Number or String. Percentage value of saturation effect: as a Number, between 0 (gray) and 1 (no effect); as a String, between '0%' and '100%' (default: 1). Values can go above 1.
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method saturation
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	ScrawlImage.prototype.saturation = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var value = (scrawl.xt(items.value)) ? items.value : 1,
			useSourceData = items.use || (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			imgData = this.getImageData(useSourceData),
			data = imgData.data,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		value = (scrawl.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (value < 0) ? 0 : value;
		for(var i=0, z=data.length; i<z; i += 4){
			data[i] = 127 + (data[i] - 127) * value;
			data[i+1] = 127 + (data[i+1] - 127) * value;
			data[i+2] = 127 + (data[i+2] - 127) * value;
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Threshold filter

Attributes in the argument object:

* __value__ - Number or String. Percentage value of threshold border: as a Number, between 0 (black) and 1 (white); as a String, between '0%' and '100%' (default: 0.5)
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method threshold
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	ScrawlImage.prototype.threshold = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var value = (scrawl.xt(items.value)) ? items.value : 0.5,
			imgData,
			data,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		value = (scrawl.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (scrawl.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
		value *= 255;
		result = this.grayscale({
			useSourceData: items.useSourceData,
			use: items.use,
			save: false,
			});
		imgData = this.getImageData(result),
		data = imgData.data;
		for(var i=0, z=data.length; i<z; i += 4){
			data[i] = (data[i] > value) ? 255 : 0;
			data[i+1] = (data[i+1] > value) ? 255 : 0;
			data[i+2] = (data[i+2] > value) ? 255 : 0;
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Channels filter

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
	ScrawlImage.prototype.channels = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var red = (scrawl.xt(items.red)) ? items.red : 1,
			green = (scrawl.xt(items.green)) ? items.green : 1,
			blue = (scrawl.xt(items.blue)) ? items.blue : 1,
			alpha = (scrawl.xt(items.alpha)) ? items.alpha : 1,
			useSourceData = items.use || (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			imgData = this.getImageData(useSourceData),
			data = imgData.data,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		red = (scrawl.isa(red, 'str')) ? parseFloat(red)/100 : red;
		green = (scrawl.isa(green, 'str')) ? parseFloat(green)/100 : green;
		blue = (scrawl.isa(blue, 'str')) ? parseFloat(blue)/100 : blue;
		alpha = (scrawl.isa(alpha, 'str')) ? parseFloat(alpha)/100 : alpha;
		for(var i=0, z=data.length; i<z; i += 4){
			data[i] = data[i] * red;
			data[i+1] = data[i+1] * green;
			data[i+2] = data[i+2] * blue;
			data[i+3] = data[i+3] * alpha;
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
ChannelStep filter

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
	ScrawlImage.prototype.channelStep = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var red = (scrawl.xt(items.red)) ? items.red : 1,
			green = (scrawl.xt(items.green)) ? items.green : 1,
			blue = (scrawl.xt(items.blue)) ? items.blue : 1,
			alpha = (scrawl.xt(items.alpha)) ? items.alpha : 1,
			useSourceData = items.use || (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			imgData = this.getImageData(useSourceData),
			data = imgData.data,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		for(var i=0, z=data.length; i<z; i += 4){
			data[i] = Math.floor(data[i] / red) * red;
			data[i+1] = Math.floor(data[i+1] / green) * green;
			data[i+2] = Math.floor(data[i+2] / blue) * blue;
			data[i+3] = Math.floor(data[i+3] / alpha) * alpha;
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Sepia filter

Attributes in the argument object:

* __value__ - Number or String. Percentage value of sepia effect: as a Number, between 0 (no effect) and 1 (full sepia tint); as a String, between '0%' and '100%' (default: 1).
* __use__ - Object. Image data object on which to apply the filter (default: undefined)
* __save__ - Boolean. When true, will save the resulting image data for display by picture sprites using this image (default: true)
* __useSourceData__ - Boolean. When true, applies filter to data from source image; when false, filters current image (default: false). Has no meaning if an image data object is supplied via the _use_ attribute 
@method sepia
@param {Object} [items] Key:value Object argument for setting attributes
@return amended image data object
**/
	ScrawlImage.prototype.sepia = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		items.rr = 0.393;
		items.rg = 0.349;
		items.rb = 0.272;
		items.gr = 0.769;
		items.gg = 0.686;
		items.gb = 0.534;
		items.br = 0.189;
		items.bg = 0.168;
		items.bb = 0.131;
		return this.tint(items);
		};

/**
Tint filter

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
	ScrawlImage.prototype.tint = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var value = (scrawl.xt(items.value)) ? items.value : 1,
			useSourceData = items.use || (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			rr = items.rr || items.redInRed || 0.393,
			rg = items.rg || items.redInGreen || 0.349,
			rb = items.rb || items.redInBlue || 0.272,
			gr = items.gr || items.greenInRed || 0.769,
			gg = items.gg || items.greenInGreen || 0.686,
			gb = items.gb || items.greenInBlue || 0.534,
			br = items.br || items.blueInRed || 0.189,
			bg = items.bg || items.blueInGreen || 0.168,
			bb = items.bb || items.blueInBlue || 0.131,
			imgData = this.getImageData(useSourceData),
			data = imgData.data,
			red,
			grn,
			blu,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		value = (scrawl.isa(value, 'str')) ? parseFloat(value)/100 : value;
		value = (scrawl.isBetween(value, 0, 1, true)) ? value : ((value > 0.5) ? 1 : 0);
		for(var i=0, z=data.length; i<z; i += 4){
			red = (data[i] * rr) + (data[i+1] * gr) + (data[i+2] * br)
			grn = (data[i] * rg) + (data[i+1] * gg) + (data[i+2] * bg)
			blu = (data[i] * rb) + (data[i+1] * gb) + (data[i+2] * bb)
			data[i] = ((data[i] * (1 - value)) + (red * value));
			data[i+1] = ((data[i+1] * (1 - value)) + (grn * value));
			data[i+2] = ((data[i+2] * (1 - value)) + (blu * value));
			}
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Blur filter

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
	ScrawlImage.prototype.blur = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var radius = (scrawl.xt(items.radius)) ? Math.abs(items.radius) : 0,
			radiusX = (scrawl.xt(items.radiusX)) ? Math.abs(items.radiusX) : 2,
			radiusY = (scrawl.xt(items.radiusY)) ? Math.abs(items.radiusY) : 2,
			roll = (scrawl.xt(items.roll)) ? items.roll : 0,
			rx = radius || radiusX || 2,
			ry = radius || radiusY || 2,
			useSourceData = items.use || (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			addAlpha = (scrawl.xt(items.includeAlpha)) ? items.includeAlpha : false,
			brush = this.getBrush(rx, ry, roll),
			save = (scrawl.xt(items.save)) ? items.save : true,
			imgData = this.doMatrix(brush, useSourceData, addAlpha),
			result;
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Blur helper function

@method getBrush
@param x {Number} brush x radius
@param y {Number} brush y radius
@param r {Number} brush roll (in degrees)
@return Array of objects used for the blur brush
@private
**/
	ScrawlImage.prototype.getBrush = function(x, y, r){
		var dim = (x > y) ? x+2 : y+2,
			hDim = Math.floor(dim/2),
			cos = Math.cos(r * scrawl.radian),
			sin = Math.sin(r * scrawl.radian),
			brush = [];
		scrawl.cv.width = dim;
		scrawl.cv.height = dim;
		scrawl.cvx.setTransform(cos, sin, -sin, cos, hDim, hDim);
		scrawl.cvx.beginPath();
		scrawl.cvx.moveTo(0,-y);
		scrawl.cvx.bezierCurveTo(x*0.55, -y, x, -y*0.55, x, 0);
		scrawl.cvx.bezierCurveTo(x, y*0.55, x*0.55, y, 0, y);
		scrawl.cvx.bezierCurveTo(-x*0.55, y, -x, y*0.55, -x, 0);
		scrawl.cvx.bezierCurveTo(-x, -y*0.55, -x*0.55, -y, 0, -y);
		scrawl.cvx.closePath();
		for(var i=0; i<dim; i++){ //rows (y)
			for(var j=0; j<dim; j++){ //cols (x)
				if(scrawl.cvx.isPointInPath(j, i)){
					brush.push({ox: j - hDim, oy: i - hDim, wt: 1});
					}
				}
			}
		scrawl.cvx.setTransform(1, 0, 0, 1, 0, 0);
		return brush;
		};

/**
Pixelate filter

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
	ScrawlImage.prototype.pixelate = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var width = (scrawl.xt(items.width)) ? Math.ceil(items.width) : 5,
			height = (scrawl.xt(items.height)) ? Math.ceil(items.height) : 5,
			useSourceData = items.use || (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			addAlpha = (scrawl.xt(items.includeAlpha)) ? items.includeAlpha : false,
			imgData = this.getImageData(useSourceData),
			red,
			grn,
			blu,
			alp,
			block,
			count,
			tW,
			tH,
			vol,
			save = (scrawl.xt(items.save)) ? items.save : true,
			result;
		scrawl.cv.width = imgData.width;
		scrawl.cv.height = imgData.height;
		scrawl.cvx.putImageData(imgData, 0, 0);
		for(var i = 0; i < imgData.height; i += height){ //rows (y)
			for(var j = 0; j < imgData.width; j += width){ //cols (x)
				red = grn = blu = alp = count = 0;
				tW = (j + width > imgData.width) ? imgData.width - j : width;
				tH = (i + height > imgData.height) ? imgData.height - i : height;
				vol = tW * tH * 4;
				block = scrawl.cvx.getImageData(j, i, tW, tH);
				for(var k = 0; k < vol; k += 4){
					if(block.data[k+3] > 0){
						red += block.data[k];
						grn += block.data[k+1];
						blu += block.data[k+2];
						alp += block.data[k+3];
						count++;
						}
					}
				red = Math.floor(red/count);
				grn = Math.floor(grn/count);
				blu = Math.floor(blu/count);
				alp = Math.floor(alp/count);
				scrawl.cvx.fillStyle = (addAlpha) ? 'rgba('+red+','+grn+','+blu+','+alp+')' : 'rgb('+red+','+grn+','+blu+')';
				scrawl.cvx.fillRect(j, i, tW, tH);
				}
			}
		block = scrawl.cvx.getImageData(0, 0, imgData.width, imgData.height);
		if(save){
			result = this.getImageDataUrl(block, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return block;
		};

/**
Matrix filter

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
	ScrawlImage.prototype.matrix = function(items){
		items = (scrawl.isa(items, 'obj')) ? items : {};
		var useSourceData = (scrawl.xt(items.useSourceData)) ? items.useSourceData : false,
			addAlpha = (scrawl.xt(items.includeAlpha)) ? items.includeAlpha : false,
			wrap = (scrawl.isa(items.wrap, 'bool')) ? items.wrap : false,
			myArray = (scrawl.isa(items.data,'arr')) ? items.data : [1],
			matrix = [],
			reqLen,
			matrixMid,
			matrixDim,
			matrixCenter,
			counter = 0,
			save = (scrawl.xt(items.save)) ? items.save : true,
			imgData,
			result;
		reqLen = Math.ceil(Math.sqrt(myArray.length));
		reqLen = (reqLen % 2 === 1) ? Math.pow(reqLen, 2) : Math.pow(reqLen + 1, 2);
		for(var i = 0; i < reqLen; i++){
			myArray[i] = (scrawl.xt(myArray[i])) ? parseFloat(myArray[i]) : 0;
			myArray[i] = (isNaN(myArray[i])) ? 0 : myArray[i];
			}
		matrixMid = Math.floor(myArray.length/2);
		matrixDim = Math.sqrt(myArray.length);
		matrixCenter = Math.floor(matrixDim/2);
		for(var i = 0; i < matrixDim; i++){ //col (y)
			for(var j = 0; j < matrixDim; j++){ //row (x)
				if(myArray[counter] !== 0){
					matrix.push({
						ox: j - matrixCenter,
						oy: i - matrixCenter,
						wt: myArray[counter],
						});
					}
				counter++;
				}
			}
		imgData = this.doMatrix(matrix, useSourceData, addAlpha, wrap);
		if(save){
			result = this.getImageDataUrl(imgData, true);
			scrawl.img[this.name] = this.makeImage(result);
			}
		return imgData;
		};

/**
Helper function

The matrix array consists of objects with the following attributes:

* __ox__ horizontal offset from the current pixel
* __oy__ vertical offset from the current pixel
* __wt__ weighting to be used when adding the color values of the offset pixel to the resulting color for current pixel

Function used by matrix() and blur() filter functions

@method doMatrix
@param {Array} matrix Array of matrix objects
@param {Boolean} urlData image URL data
@param {Boolean} addAlpha When true, alpha values are included in the calculation
@param {Boolean} wrap When true, offset pixels that fall outside the boundaries of the image will be wrapped to the opposite end of the image row or column; when false, the offset pixels are ignored and their weightings excluded from the calculation
@return True on success; false otherwise
@private
**/
	ScrawlImage.prototype.doMatrix = function(matrix, urlData, addAlpha, wrap){
		wrap = (scrawl.isa(wrap,'bool')) ? wrap : false;
		var imgData = this.getImageData(urlData),
			data = imgData.data,
			copyData = this.getImageData(urlData),
			copy = copyData.data,
			weight = 0,
			red,
			grn,
			blu,
			alp,
			here,
			there,
			addPix;
		if(matrix.length > 0){
			for(var i = 0; i < imgData.height; i++){ //rows (y)
				for(var j = 0; j < imgData.width; j++){ //cols (x)
					red = blu = grn = alp = weight = 0;
					here = 4 * ((i * imgData.width) + j);
					for(var k = 0, z = matrix.length; k < z; k++){
						addPix = true;
						if(!scrawl.isBetween(j + matrix[k].ox, 0, imgData.width - 1, true) || !scrawl.isBetween(i + matrix[k].oy, 0, imgData.height - 1, true)){
							if(wrap){
								if(!scrawl.isBetween(j + matrix[k].ox, 0, imgData.width - 1, true)){
									matrix[k].ox += (matrix[k].ox > 0) ? -imgData.width : imgData.width;
									}
								if(!scrawl.isBetween(i + matrix[k].oy, 0, imgData.height - 1, true)){
									matrix[k].oy += (matrix[k].oy > 0) ? -imgData.height : imgData.height;
									}
								}
							else{
								addPix = false;
								}
							}
						if(addPix){
							there = here + (4 * ((matrix[k].oy * imgData.width) + matrix[k].ox));
							red += data[there] * matrix[k].wt;
							grn += data[there + 1] * matrix[k].wt;
							blu += data[there + 2] * matrix[k].wt;
							weight += matrix[k].wt;
							if(addAlpha){
								alp += data[there + 3] * matrix[k].wt;
								}
							}
						}
					copy[here] = (weight !== 0) ? red/weight : red;
					copy[here + 1] = (weight !== 0) ? grn/weight : grn;
					copy[here + 2] = (weight !== 0) ? blu/weight : blu;
					if(addAlpha){
						copy[here + 3] = (weight !== 0) ? alp/weight : alp;
						}
					}
				}
			return copyData;
			}
		return false;
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

@class AnimSheet
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function AnimSheet(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		this.sheet = items.sheet || items.source || false;
		this.frames = (scrawl.xt(items.frames)) ? [].concat(items.frames) : [];
		this.currentFrame = items.currentFrame || 0;
		this.speed = (scrawl.isa(items.speed,'num')) ? items.speed : 1;
		this.loop = (scrawl.isa(items.loop,'str')) ? items.loop : 'end';
		this.running = (scrawl.isa(items.running,'str')) ? items.running : 'complete';
		this.lastCalled = (scrawl.xt(items.lastCalled)) ? items.lastCalled : Date.now();
		scrawl.anim[this.name] = this;
		scrawl.pushUnique(scrawl.animnames, this.name);
		return this;
		}
	AnimSheet.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'AnimSheet'
@final
**/		
	AnimSheet.prototype.type = 'AnimSheet';
	AnimSheet.prototype.classname = 'animnames';
	scrawl.d.AnimSheet = {
/**
SCRAWLIMAGENAME String
@property sheet
@type String
@default ''
**/
		sheet: '',
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
	scrawl.animKeys = Object.keys(scrawl.d.AnimSheet);
	scrawl.mergeInto(scrawl.d.AnimSheet, scrawl.d.Scrawl);

/**
Set attribute values - will also set the __currentFrame__ attribute to the appropriate value when the running __attribute__ is changed

(Only used by AnimSheet objects)
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
@private
**/
	AnimSheet.prototype.set = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var paused = (this.loop === 'pause') ? true : false;
		Scrawl.prototype.set.call(this, items);
		if(scrawl.xt(items.running)){
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
	AnimSheet.prototype.getData = function(){
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

/**
# Group
	
## Instantiation

* scrawl.newGroup()

## Purpose

* plays a key role in collision detection between Sprites
* groups Sprite objects for specific purposes

@class Group
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Group(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		this.sprites = (scrawl.xt(items.sprites)) ? [].concat(items.sprites) : [];
		this.cell = items.cell || scrawl.pad[scrawl.currentPad].current;
		this.order = items.order || 0;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : true;
		this.spriteSort = (scrawl.isa(items.spriteSort,'bool')) ? items.spriteSort : true;
		this.regionRadius = items.regionRadius || 0;
		scrawl.group[this.name] = this;
		scrawl.pushUnique(scrawl.groupnames, this.name);
		scrawl.pushUnique(scrawl.cell[this.cell].groups, this.name);
		return this;
		}
	Group.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Group'
@final
**/		
	Group.prototype.type = 'Group';
	Group.prototype.classname = 'groupnames';
	scrawl.d.Group = {
/**
 Array of SPRITENAME Strings of sprites that comprise this Group
@property sprites
@type Array
@default []
**/
		sprites: [],
/**
CELLNAME of the default Cell object to which this group is associated
@property cell
@type String
@default ''
**/
		cell: '',
/**
Group order value - lower order Groups are drawn on &lt;canvas&gt; elements before higher order Groups
@property order
@type Number
@default 0
**/
		order: 0,
/**
Visibility flag - Group sprites will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		visibility: true,
/**
Sorting flag - when set to true, Groups will sort their constituent sprite object according to their sprite.order attribute for each iteration of the display cycle
@property spriteSort
@type Boolean
@default true
**/
		spriteSort: true,
/**
Collision checking radius, in pixels - as a first step in a collision check, the Group will winnow potential collisions according to how close the checked sprite is to the current reference sprite; when set to 0, this collision check step is skipped and all sprites move on to the next step
@property regionRadius
@type Number
@default 0
**/
		regionRadius: 0,
		};
	scrawl.mergeInto(scrawl.d.Group, scrawl.d.Scrawl);

/**
Turn the object into a JSON String

Automatically removes the sprites attribute from the result; when loading, existing sprites need to be re-added to the group
@method toString
@param {Boolean} [nosprites] True to exclude the sprites attribute; false will return an array containing this and each of the sprites in the sprites array
@return Array of JSON strings of non-default value attributes
**/
	Group.prototype.toString = function(nosprites){
		var keys = Object.keys(scrawl.d[this.type]),
			result = {},
			resarray = [],
			ctx,
			designs = [];
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		delete result.sprites;
		resarray.push(JSON.stringify(result));
		if(!nosprites){
			for(var i=0, z=this.sprites.length; i<z; i++){
				ctx = scrawl.ctx[scrawl.sprite[this.sprites[i]].context];
				if(scrawl.contains(scrawl.designnames, ctx.fillStyle)){
					scrawl.pushUnique(designs, ctx.fillStyle);
					}
				if(scrawl.contains(scrawl.designnames, ctx.strokeStyle)){
					scrawl.pushUnique(designs, ctx.strokeStyle);
					}
				if(scrawl.contains(scrawl.designnames, ctx.shadowColor)){
					scrawl.pushUnique(designs, ctx.shadowColor);
					}
				}
			for(var i=0, z=designs.length; i<z; i++){
				resarray.push(scrawl.design[designs[i]].toString());
				}
			for(var i=0, z=this.sprites.length; i<z; i++){
				resarray.push(scrawl.sprite[this.sprites[i]].toString(true));
				}
			}
		return resarray;
		};
		
/**
Turn the object into a JSON String

Retains the sprites attribute Array; does not include any other objects in the return Array
@method save
@return Array of JSON Strings
**/
	Group.prototype.save = function(){
		var keys = Object.keys(scrawl.d[this.type]),
			result = {};
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		return [JSON.stringify(result)];
		};
		
/**
Sprite sorting routine - sprites are sorted according to their sprite.order attribute value, in ascending order
@method sortSprites
@return Nothing
@private
**/
	Group.prototype.sortSprites = function(){
		if(this.spriteSort){
			this.sprites.sort(function(a,b){
				return scrawl.sprite[a].order - scrawl.sprite[b].order;
				});
			}
		};

/**
Tell the Group to ask _all_ of its constituent sprites to draw themselves on a &lt;canvas&gt; element, regardless of their visibility
@method forceStamp
@param {String} [method] Drawing method String
@param {String} [cell] CELLNAME of cell on which sprites are to draw themselves
@return This
@chainable
**/
	Group.prototype.forceStamp = function(method, cell){
		var temp = this.visibility;
		if(!temp){
			this.set({visibility: true});
			}
		this.stamp(method, cell);
		this.set({visibility: temp});
		return this;
		};

/**
Tell the Group to ask its constituent sprites to draw themselves on a &lt;canvas&gt; element; only sprites whose visibility attribute is set to true will comply
@method stamp
@param {String} [method] Drawing method String
@param {String} [cell] CELLNAME of cell on which sprites are to draw themselves
@return This
@chainable
**/
	Group.prototype.stamp = function(method, cell){
		if(this.visibility){
			this.sortSprites();
			for(var i=0, z=this.sprites.length; i<z; i++){
				scrawl.sprite[this.sprites[i]].stamp(method, cell);
				}
			}
		return this;
		};

/**
Check all sprites in the Group to see if they are colliding with the supplied coordinate. The check is done in reverse order after the sprites have been sorted; the sprite Object with the highest order value that is colliding with the coordinate is returned
@method getSpriteAt
@param {Vector} items Coordinate vector; alternatively an Object with x and y attributes can be used
@return Sprite object, or false if no sprites are colliding with the coordinate
**/
	Group.prototype.getSpriteAt = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var coordinate = new Vector(items),
			sprite,
			pad,
			cell,
			result;
		if(scrawl.xta([items.source,items.type])){
			pad = scrawl[items.type][items.source];
			cell = scrawl.cell[this.cell];
			if(pad.width !== cell.actualWidth){
				coordinate.x /= (pad.width/cell.actualWidth);
				}
			if(pad.height !== cell.actualHeight){
				coordinate.y /= (pad.height/cell.actualHeight);
				}
			}
		this.sortSprites();
		for(var i=this.sprites.length-1; i>=0; i--){
			sprite = scrawl.sprite[this.sprites[i]];
			if(this.regionRadius){
				result = sprite.start.getVectorSubtract(coordinate);
				if(result.getMagnitude() > this.regionRadius){
					continue;
					}
				}
			if(sprite.checkHit(coordinate)){
				return sprite;
				}
			}
		return false;
		};

/**
Check all sprites in the Group to see if they are colliding with the supplied sprite object. An Array of all sprite objects colliding with the reference sprite will be returned
@method getSpritesCollidingWith
@param {String} sprite SPRITENAME String of the reference sprite; alternatively the sprite Object itself can be passed as the argument
@return Array of visible sprite Objects currently colliding with the reference sprite
**/
	Group.prototype.getSpritesCollidingWith = function(sprite){
		sprite = (scrawl.isa(sprite, 'str')) ? scrawl.sprite[sprite] : sprite; 
		if(scrawl.contains(scrawl.spritenames, sprite.name)){
			var	hits = [],
				myTests = sprite.getCollisionPoints();
			for(var i=0, z=this.sprites.length; i<z; i++){
				if(scrawl.sprite[this.sprites[i]].name !== sprite.name){
					if(scrawl.sprite[this.sprites[i]].get('visibility')){
						if(scrawl.sprite[this.sprites[i]].checkHit({tests: myTests})){
							hits.push(this.sprites[i]);
							}
						}
					}
				}
			return (hits.length > 0) ? hits : false;
			}
		return false;
		};

/**
Check all sprites in the Group against each other to see if they are in collision
@method getInGroupSpriteHits
@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of sprites currently in collision
**/
	Group.prototype.getInGroupSpriteHits = function(){
		var	hits = [],
			cPoints = {},
			cViz = {},
			temp,
			ts1,
			ts2,
			tresult;
		for(var i=0, z=this.sprites.length; i<z; i++){
			temp = scrawl.sprite[this.sprites[i]];
			cViz[temp.name] = temp.visibility;
			if(cViz[temp.name]){
				cPoints[temp.name] = temp.getCollisionPoints();
				}
			}
		for(var i=0, z=this.sprites.length; i<z; i++){
			if(cViz[this.sprites[i]]){
				ts1 = scrawl.sprite[this.sprites[i]].start;
				for(var j=i+1, w=this.sprites.length; j<w; j++){
					if(cViz[this.sprites[j]]){
						ts2 = scrawl.sprite[this.sprites[j]].start;
						if(this.regionRadius){
							tresult = ts1.getVectorSubtract(ts2).getMagnitude();
							if(tresult > this.regionRadius){
								continue;
								}
							}
						if(scrawl.sprite[this.sprites[j]].checkHit({tests: cPoints[this.sprites[i]]})){
							hits.push([this.sprites[i],this.sprites[j]]);
							continue;
							}
						if(scrawl.sprite[this.sprites[i]].checkHit({tests: cPoints[this.sprites[j]]})){
							hits.push([this.sprites[i],this.sprites[j]]);
							continue;
							}
						}
					}
				}
			}
		return hits;
		};

/**
Check all sprites in this Group against all sprites in the argument Group, to see if they are in collision
@method getBetweenGroupSpriteHits
@param {String} g GROUPNAME of Group to be checked against this group; alternatively, the Group object itself can be supplied as the argument
@return Array of [SPRITENAME, SPRITENAME] Arrays, one for each pair of sprites currently in collision
**/
	Group.prototype.getBetweenGroupSpriteHits = function(g){
		var	hits = [],
			cPoints = {},
			cViz = {},
			temp,
			ts1,
			ts2,
			tresult;
		if(scrawl.xt(g)){
			if(scrawl.isa(g,'str')){
				if(scrawl.contains(scrawl.groupnames, g)){
					g = scrawl.group[g];
					}
				else{
					return false;
					}
				}
			else{
				if(!scrawl.xt(g.type) || g.type !== 'Group'){
					return false;
					}
				}
			for(var i=0, z=this.sprites.length; i<z; i++){
				temp = scrawl.sprite[this.sprites[i]];
				cViz[temp.name] = temp.visibility;
				if(cViz[temp.name]){
					cPoints[temp.name] = temp.getCollisionPoints();
					}
				}
			for(var i=0, z=g.sprites.length; i<z; i++){
				temp = scrawl.sprite[g.sprites[i]];
				cViz[temp.name] = temp.visibility;
				if(cViz[temp.name]){
					cPoints[temp.name] = temp.getCollisionPoints();
					}
				}
			for(var i=0, z=this.sprites.length; i<z; i++){
				if(cViz[this.sprites[i]]){
					ts1 = scrawl.sprite[this.sprites[i]].start;
					for(var j=0, w=g.sprites.length; j<w; j++){
						if(cViz[g.sprites[j]]){
							ts2 = scrawl.sprite[g.sprites[j]].start;
							if(this.regionRadius){
								tresult = ts1.getVectorSubtract(ts2).getMagnitude();
								if(tresult > this.regionRadius){
									continue;
									}
								}
							if(scrawl.sprite[g.sprites[j]].checkHit({tests: cPoints[this.sprites[i]]})){
								hits.push([this.sprites[i],g.sprites[j]]);
								continue;
								}
							if(scrawl.sprite[this.sprites[i]].checkHit({tests: cPoints[g.sprites[j]]})){
								hits.push([this.sprites[i],g.sprites[j]]);
								continue;
								}
							}
						}
					}
				}
			return hits;
			}
		return false;
		};

/**
Check all sprites in this Group against a &lt;canvas&gt; element's collision field image

If no argument is supplied, the Group's default Cell's &lt;canvas&gt; element will be used for the check

An Array of Arrays is returned, with each constituent array consisting of the the SPRITENAME of the sprite that has reported a positive hit, alongside a coordinate Vector of where the collision is occuring
@method getFieldSpriteHits
@param {String} [cell] CELLNAME of Cell whose &lt;canvas&gt; element is to be used for the check
@return Array of [SPRITENAME, Vector] Arrays
**/
	Group.prototype.getFieldSpriteHits = function(cell){
		cell = (scrawl.xt(cell)) ? cell : this.cell;
		var	hits = [],
			result;
		for(var j=0, w=this.sprites.length; j<w; j++){
			result = scrawl.sprite[this.sprites[j]].checkField(cell);
			if(!scrawl.isa(result,'bool')){
				hits.push([this.sprites[j], result]);
				}
			}
		return hits;
		};

/**
Add sprites to the Group
@method addSpritesToGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	Group.prototype.addSpritesToGroup = function(item){
		item = (scrawl.xt(item)) ? [].concat(item) : [];
		for(var i=0, z=item.length; i<z; i++){
			scrawl.pushUnique(this.sprites, item[i]);
			}
		return this;
		};

/**
Remove sprites from the Group
@method removeSpritesFromGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	Group.prototype.removeSpritesFromGroup = function(item){
		item = (scrawl.xt(item)) ? [].concat(item) : [];
		for(var i=0, z=item.length; i<z; i++){
			scrawl.removeItem(this.sprites, item[i]);
			}
		return this;
		};

/**
Ask all sprites in the Group to perform an updateStart() operation

Each sprite will add their delta values to their start Vector, and/or add deltaPathPlace from pathPlace
@method updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	Group.prototype.updateStart = function(item){
		for(var i=0, z=this.sprites.length; i<z; i++){
			scrawl.sprite[this.sprites[i]].updateStart(item);
			}
		return this;
		};

/**
Ask all sprites in the Group to perform a revertStart() operation

Each sprite will subtract their delta values to their start Vector, and/or subtract deltaPathPlace from pathPlace
@method revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
	Group.prototype.revertStart = function(item){
		for(var i=0, z=this.sprites.length; i<z; i++){
			scrawl.sprite[this.sprites[i]].revertStart(item);
			}
		return this;
		};

/**
Ask all sprites in the group to perform a reverse() operation

Each sprite will change the sign (+/-) of specified attribute values
@method reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
	Group.prototype.reverse = function(item){
		for(var i=0, z=this.sprites.length; i<z; i++){
			scrawl.sprite[this.sprites[i]].reverse(item);
			}
		return this;
		};

/**
Ask all sprites in the Group to perform a setDelta() operation

The following sprite attributes can be amended by this function: startX, startY, scale, roll.
@method updateSpritesBy
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	Group.prototype.updateSpritesBy = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		for(var i=0, z=this.sprites.length; i<z; i++){
			scrawl.sprite[this.sprites[i]].setDelta({
				startX: items.x || items.startX || 0,
				startY: items.y || items.startY || 0,
				scale: items.scale || 0,
				roll: items.roll || 0,
				});
			}
		return this;
		};

/**
Ask all sprites in the Group to perform a set() operation
@method setSpritesTo
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	Group.prototype.setSpritesTo = function(items){
		for(var i=0, z=this.sprites.length; i<z; i++){
			scrawl.sprite[this.sprites[i]].set(items);
			}
		return this;
		};

/**
Require all sprites in the Group to set their pivot attribute to the supplied POINTNAME or SPRITENAME string, and set their handle Vector to reflect the current vector between that sprite or Point object's start Vector and their own Vector

This has the effect of turning a set of disparate sprites into a single, coordinated group.
@method pivotSpritesTo
@param {String} item SPRITENAME or POINTNAME String
@return This
@chainable
**/
	Group.prototype.pivotSpritesTo = function(item){
		item = (scrawl.isa(item,'str')) ? item : false;
		var p,
			pStart,
			sprite,
			sv;
		if(item){
			p = scrawl.sprite[item] || scrawl.point[item] || false;
			if(p){
				pStart = (p.type === 'Point') ? p.get('current') : p.start.getVector();
				for(var i=0, z=this.sprites.length; i<z; i++){
					sprite = scrawl.sprite[this.sprites[i]];
					sv = sprite.start.getVector();
					sv.vectorSubtract(pStart);
					sprite.set({
						pivot: item,
						handleX : -sv.x,
						handleY: -sv.y,
						});
					}
				}
			}
		return this;
		};
		
/**
# Sprite
	
## Instantiation

* This object should never be instantiated by users

## Purpose

* Supplies the common methodology for all Scrawl sprites: Phrase, Block, Wheel, Picture, Outline, Shape
* Sets up the attributes for holding a sprite's current state: position, visibility, rotation, drawing order, context, collision points and zones
* Describes how sprites should be stamped onto a Cell's canvas
* Provides drag-and-drop functionality

In addition to the listed attributes, the Sprite constructor (and the clone function) can take the additional attributes, which are not preserved:

* __field__ - the CELLNAME of a Cell object to whose collision field image this sprite will contribute as a 'field', an area where sprites WILL NOT report a collision with the field
* __fence__ - the CELLNAME of a Cell object to whose collision field image this sprite will contribute as a 'fence', an area where sprites WILL report a collision with the field

@class Sprite
@constructor
@extends SubScrawl
@uses Context
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Sprite(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		SubScrawl.call(this, items);
		items.name = this.name;
		var myContext = new Context(items);
		this.context = myContext.name;
		this.group = this.getGroup(items);
		this.flipUpend = items.flipUpend || false;
		this.flipReverse = items.flipReverse || false;
		this.lockX = items.lockX || false;
		this.lockY = items.lockY || false;
		this.fastStamp = items.fastStamp || false;
		this.scaleOutline = (scrawl.isa(items.scaleOutline,'bool')) ? items.scaleOutline : true;
		this.roll = items.roll || 0;
		this.order = items.order || 0;
		this.visibility = (scrawl.isa(items.visibility,'bool')) ? items.visibility : true;
		this.method = items.method || scrawl.d[this.type].method;
		if(scrawl.xt(items.field)){
			this.addSpriteToCellFields();
			}
		if(scrawl.xt(items.fence)){
			this.addSpriteToCellFences();
			}
		return this;
		}
	Sprite.prototype = Object.create(SubScrawl.prototype);
/**
@property type
@type String
@default 'Sprite'
@final
**/		
	Sprite.prototype.type = 'Sprite';
	Sprite.prototype.classname = 'spritenames';
	scrawl.d.Sprite = {
/**
Sprite order value - lower order sprites are drawn on &lt;canvas&gt; elements before higher order sprites
@property order
@type Number
@default 0
**/
		order: 0,
/**
Visibility flag - sprites will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		visibility: true,
/**
Sprite drawing method. A sprite can be drawn onto a &lt;canvas&gt; element in a variety of ways; these methods include:

* 'draw' - stroke the sprite's path with the sprite's strokeStyle color, pattern or gradient
* 'fill' - fill the sprite's path with the sprite's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the sprite's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the sprite's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the sprite's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the sprite's path; shadow offset is added to both actions
* 'clear' - fill the sprite's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the sprite's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the sprite's path (not tested)
* 'none' - perform all necessary updates, but do not draw the sprite onto the canvas

_Note: not all sprites support all of these operations_
@property method
@type String
@default 'fill'
**/
		method: 'fill',
/**
Current rotation of the sprite, in degrees
@property roll
@type Number
@default 0
**/
		roll: 0,
/**
Current SVGTiny data string for the sprite - not supported by all sprite objects
@property data
@type String
@default ''
**/
		data: '',
/**
Sprite radius, in pixels - not supported by all sprite objects
@property radius
@type Number
@default 0
**/
		radius: 0,
/**
Sprite width, in pixels
@property width
@type Number
@default 0
**/
		width: 0,
/**
Sprite height, in pixels
@property height
@type Number
@default 0
**/
		height: 0,
/**
Reflection flag; set to true to flip sprite along the Y axis
@property flipReverse
@type Boolean
@default false
**/
		flipReverse: false,
/**
Reflection flag; set to true to flip sprite along the X axis
@property flipUpend
@type Boolean
@default false
**/
		flipUpend: false,
/**
Scaling flag; set to true to ensure lineWidth scales in line with the scale attribute value
@property scaleOutline
@type Boolean
@default true
**/
		scaleOutline: true,
/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the X axis
@property lockX
@type Boolean
@default false
**/
		lockX: false,
/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the Y axis
@property lockY
@type Boolean
@default false
**/
		lockY: false,
/**
Display cycle flag; if set to true, sprite will not change the &lt;canvas&gt; element's context engine's settings before drawing itself on the cell
@property fastStamp
@type Boolean
@default false
**/
		fastStamp: false,
/**
CTXNAME of this Sprite's Context object
@property context
@type String
@default ''
@private
**/
		context: '',
/**
GROUPNAME String for this sprite's default group

_Note: a sprite can belong to more than one group by being added to other Group objects via the __scrawl.addSpritesToGroups()__ and __Group.addSpriteToGroup()__ functions_
@property group
@type String
@default ''
**/
		group: '',
/**
Channel to be checked during Cell field collision detection. Permitted values include: 'red', 'blue', 'green', 'alpha', 'anycolor'
@property fieldChannel
@type String
@default 'anycolor'
**/
		fieldChannel: 'anycolor',
/**
Test threshhold to be applied during Cell field collision detection. Permitted values can range between 0 and 254
@property fieldTest
@type Number
@default 0
**/
		fieldTest: 0,
/**
Array of collision point vectors for this sprite. These Vectors are generated automatically during sprite construction, or after using the set function.
@property collisionVectors
@type Array
@default []
**/
		collisionVectors: [],
/**
A mixed type Array determining which collision points will be generated for this sprite.

Sprite Objects vary in what values can be included in this array. Permitted values include:

* String literals detailing the position of collision points on the sprite's perimeter (Block, Wheel, Phrase, Picture, Outline) - 'all', 'corners', 'edges', 'perimeter', 'north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
* Integer Number (greater than 1) for the number of collision points to be spaced around the sprite's perimeter/path (Wheel, Shape)
* Float Number (between 0 and 1) tp place a collision point at a particular distance along a sprite's path (Shape)
@property collisionPoints
@type Array
@default []
**/
		collisionPoints: [],
		};
	scrawl.mergeInto(scrawl.d.Sprite, scrawl.d.SubScrawl);

/**
Constructor helper function - register sprite object in the scrawl library
@method registerInLibrary
@return This
@chainable
@private
**/
	Sprite.prototype.registerInLibrary = function(){
		scrawl.sprite[this.name] = this;
		scrawl.pushUnique(scrawl.spritenames, this.name);
		scrawl.group[this.group].addSpritesToGroup(this.name);
		if(scrawl.xt(this.collisionPoints)){
			this.collisionPoints = (scrawl.isa(this.collisionPoints, 'arr')) ? this.collisionPoints : [this.collisionPoints];
			this.collisionPoints = this.parseCollisionPoints(this.collisionPoints);
			}
		return this;
		}

/**
Turn the object into a JSON String
@method toString
@return JSON string of non-default value attributes, including non-default context values
**/
	Sprite.prototype.toString = function(noexternalobjects){
		noexternalobjects = (scrawl.xt(noexternalobjects)) ? noexternalobjects : false;
		var keys = Object.keys(scrawl.d[this.type]),
			result = {},
			ctx = scrawl.ctx[this.context],
			ctxArray,
			designs = [],
			resarray = [];
		result.type = this.type;
		result.classname = this.classname;
		result.name = this.name;
		if(!noexternalobjects){
			if(ctx && ctx.fillStyle && scrawl.contains(scrawl.designnames, ctx.fillStyle)){
				scrawl.pushUnique(designs, ctx.fillStyle);
				}
			if(ctx && ctx.strokeStyle && scrawl.contains(scrawl.designnames, ctx.strokeStyle)){
				scrawl.pushUnique(designs, ctx.strokeStyle);
				}
			if(ctx && ctx.shadowColor && scrawl.contains(scrawl.designnames, ctx.shadowColor)){
				scrawl.pushUnique(designs, ctx.shadowColor);
				}
			for(var i=0, z=designs.length; i<z; i++){
				resarray.push(scrawl.design[designs[i]].toString());
				}
			}
		for(var i = 0, z = keys.length; i < z; i++){
			if(scrawl.contains(['start', 'delta', 'handle'], keys[i])){
				if(!this[keys[i]].isLike(scrawl.d[this.type][keys[i]])){
					result[keys[i]] = this[keys[i]];
					}
				}
			else if(keys[i] === 'context' && scrawl.xt(scrawl.ctx[this.context])){
				ctx = JSON.parse(scrawl.ctx[this.context].toString());
				ctxArray = Object.keys(ctx);
				for(var j = 0, w = ctxArray.length; j < w; j++){
					result[ctxArray[j]] = ctx[ctxArray[j]];
					}
				}
			else if(scrawl.contains(['collisionVectors','dataSet','pointList','firstPoint','linkList','linkDurations','perimeterLength','style','variant','weight','size','metrics','family','texts'], keys[i])){
				//do nothing
				}
			else if(scrawl.xt(this[keys[i]]) && this[keys[i]] !== scrawl.d[this.type][keys[i]]){
				result[keys[i]] = this[keys[i]];
				}
			}
		if(this.type === 'Picture'){
			result.url = scrawl.image[this.source].source;
			}
		resarray.push(JSON.stringify(result).replace('\\n', '\\\\n'));		//replace required for multiline Phrase sprites
		return resarray
		};
		
/**
Overrides SubScrawl.get()

Allows users to retrieve a sprite's Context object's values via the sprite
@method get
@param {String} item attribute key string
@return Attribute value
**/
	Sprite.prototype.get = function(item){
		//retrieve title, comment, timestamp - which might otherwise be returned with the context object's values
		if(scrawl.xt(scrawl.d.Scrawl[item])){
			return Scrawl.prototype.get.call(this, item);
			}
		//context attributes
		else if(scrawl.xt(scrawl.d.Context[item])){
			return scrawl.ctx[this.context].get(item);
			}
		//sprite attributes
		else{
			return SubScrawl.prototype.get.call(this, item);
			}
		};

/**
Overrides SubScrawl.set()

Allows users to:
* set a sprite's Context object's values via the sprite
* shift a sprite between groups
* add a sprite to a Cell object's fence or field group (Cell collision map generation)
* reset and recalculate collision point data
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Sprite.prototype.set = function(items){
		SubScrawl.prototype.set.call(this, items);
		scrawl.ctx[this.context].set(items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xto([items.collisionPoints,items.field,items.fence,items.group])){
			if(scrawl.xt(items.collisionPoints)){
				this.collisionPoints = (scrawl.isa(items.collisionPoints, 'arr')) ? items.collisionPoints : [items.collisionPoints];
				this.collisionPoints = this.parseCollisionPoints(this.collisionPoints);
				delete this.collisionVectors;
				}
			if(scrawl.xt(items.field)){
				this.addSpriteToCellFields();
				}
			if(scrawl.xt(items.fence)){
				this.addSpriteToCellFences();
				}
			if(scrawl.xt(items.group)){
				scrawl.group[this.group].removeSpritesFromGroup(this.name);
				this.group = this.getGroup(items.group);
				scrawl.group[this.group].addSpritesToGroup(this.name);
				}
			}
		if(scrawl.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.radius, items.scale])){
			delete this.offset;
			}
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a sprite's Context object's values via the sprite, in addition to its own attribute values
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Sprite.prototype.setDelta = function(items){
		SubScrawl.prototype.setDelta.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		var ctx = scrawl.ctx[this.context];
		if(scrawl.xto([items.lineDashOffset,items.lineWidth,items.globalAlpha])){
			ctx.setDelta(items);
			}
		this.roll += items.roll || 0;
		if(scrawl.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.radius, items.scale])){
			delete this.offset;
			}
		return this;
		};

/**
Overrides SubScrawl.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	Sprite.prototype.clone = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var a,
			b,
			c = JSON.parse(JSON.stringify(scrawl.ctx[this.context]));
		delete c.name;
		b = scrawl.mergeInto(items, c);
		delete b.context;
		a = SubScrawl.prototype.clone.call(this, b);
		if(scrawl.xt(items.createNewContext) && !items.createNewContext){
			delete scrawl.ctx[a.context];
			scrawl.removeItem(scrawl.ctxnames, a.context);
			a.context = this.context;
			}
		return a;
		};

/**
Set sprite's pivot to 'mouse'; set handles to supplied Vector value; set order to +9999
@method pickupSprite
@param {Vector} items Coordinate vector; alternatively an object with {x, y} attributes can be used
@return This
@chainable
**/
	Sprite.prototype.pickupSprite = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var coordinate = new Vector(items),
			pad,
			cell;
		if(scrawl.xta([items.source,items.type])){
			pad = scrawl[items.type][items.source];
			cell = scrawl.cell[scrawl.group[this.group].cell];
			if(pad.width !== cell.actualWidth){
				coordinate.x /= (pad.width/cell.actualWidth);
				}
			if(pad.height !== cell.actualHeight){
				coordinate.y /= (pad.height/cell.actualHeight);
				}
			}
		if(scrawl.xta([items.x,items.y])){
			this.mouseX = coordinate.x || 0;
			this.mouseY = coordinate.y || 0;
			this.realPivot = this.pivot;
			this.set({
				pivot: 'mouse',
				order: this.order + 9999,
				});
			}
		return this;
		};

/**
Revert pickupSprite() actions, ensuring sprite is left where the user drops it
@method dropSprite
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
	Sprite.prototype.dropSprite = function(item){
		var order = this.order;
		this.set({
			pivot: item || this.realPivot || false,
			order: (order >= 9999) ? order - 9999 : 0,
			});
		delete this.realPivot;
		delete this.mouseX;
		delete this.mouseY;
		return this;
		};

/**
Add this sprite to a (range of) Cell object field groups
@method addSpriteToCellFields
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	Sprite.prototype.addSpriteToCellFields = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.contains(scrawl.cellnames, cells[i])){
				scrawl.group[cells[i]+'_field'].addSpritesToGroup(this.name);
				}
			}
		return this;
		};

/**
Add this sprite to a (range of) Cell object fence groups
@method addSpriteToCellFences
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	Sprite.prototype.addSpriteToCellFences = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.contains(scrawl.cellnames, cells[i])){
				scrawl.group[cells[i]+'_fence'].addSpritesToGroup(this.name);
				}
			}
		return this;
		};

/**
Remove this sprite from a (range of) Cell object field groups
@method removeSpriteFromCellFields
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	Sprite.prototype.removeSpriteFromCellFields = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.contains(scrawl.cellnames, cells[i])){
				scrawl.group[cells[i]+'_field'].removeSpritesFromGroup(this.name);
				}
			}
		return this;
		};

/**
Remove this sprite from a (range of) Cell object fence groups
@method removeSpriteFromCellFences
@param {Array} [items] Array of CELLNAME Strings; alternatively, a single CELLNAME String can be supplied
@return This
@chainable
**/
	Sprite.prototype.removeSpriteFromCellFences = function(cells){
		cells = (scrawl.xt(cells)) ? [].concat(cells) : [this.group];
		for(var i=0, z=cells.length; i<z; i++){
			if(scrawl.contains(scrawl.cellnames, cells[i])){
				scrawl.group[cells[i]+'_fence'].removeSpritesFromGroup(this.name);
				}
			}
		return this;
		};

/**
Constructor helper function - discover this sprite's default group affiliation
@method getGroup
@param {Object} [items] Constructor argument
@return GROUPNAME String
@private
**/
	Sprite.prototype.getGroup = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.group) && scrawl.contains(scrawl.groupnames, items.group)){
			return items.group;
			}
		else{
			return scrawl.pad[scrawl.currentPad].current;
			}
		};

/**
Stamp function - instruct sprite to draw itself on a Cell's &lt;canvas&gt; element, regardless of the setting of its visibility attribute

Permitted methods include:

* 'draw' - stroke the sprite's path with the sprite's strokeStyle color, pattern or gradient
* 'fill' - fill the sprite's path with the sprite's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the sprite's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the sprite's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the sprite's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the sprite's path; shadow offset is added to both actions
* 'clear' - fill the sprite's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the sprite's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the sprite's path (not tested)
* 'none' - perform all necessary updates, but do not draw the sprite onto the canvas
@method forceStamp
@param {String} [method] Permitted method attribute String; by default, will use sprite's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
**/
	Sprite.prototype.forceStamp = function(method, cell){
		var temp = this.visibility;
		this.visibility = true;
		this.stamp(method, cell);
		this.visibility = temp;
		return this;
		};

/**
Stamp helper function - get handle offset values
@method prepareStamp
@return This
@chainable
@private
**/
	Sprite.prototype.prepareStamp = function(){
		if(!this.offset){
			this.offset = this.getOffsetStartVector();
			}
		return this.offset;
		};

/**
Stamp helper function - set this sprite's start values to its pivot sprite/point start value

Takes into account sprite lock flag settings
@method setStampUsingPivot
@param {String} [cell] CELLNAME String
@return This
@chainable
@private
**/
	Sprite.prototype.setStampUsingPivot = function(cell){
		var	here,
			myCell,
			myPad,
			myP,
			myPVector,
			pSprite;
		if(scrawl.contains(scrawl.pointnames, this.pivot)){
			myP = scrawl.point[this.pivot];
			pSprite = scrawl.sprite[myP.sprite];
			myPVector = myP.getCurrentCoordinates().rotate(pSprite.roll).vectorAdd(pSprite.start);
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(scrawl.contains(scrawl.spritenames, this.pivot)){
			myP = scrawl.sprite[this.pivot];
			myPVector = (myP.type === 'Particle') ? myP.get('position') : myP.start.getVector();
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
		else if(this.pivot === 'mouse'){
			myCell = scrawl.cell[cell];
			myPad = scrawl.pad[myCell.pad];
			here = myPad.getMouse();
			if(myPad.width !== myCell.actualWidth){
				here.x /= (myPad.width/myCell.actualWidth);
				}
			if(myPad.height !== myCell.actualHeight){
				here.y /= (myPad.height/myCell.actualHeight);
				}
			if(!scrawl.xta([this.mouseX,this.mouseY])){
				this.mouseX = this.start.x;
				this.mouseY = this.start.y;
				}
			if(here.active){
				this.start.x = (!this.lockX) ? this.start.x + here.x - this.mouseX : this.start.x;
				this.start.y = (!this.lockY) ? this.start.y + here.y - this.mouseY : this.start.y;
				this.mouseX = here.x;
				this.mouseY = here.y;
				}
			}
		return this;
		};

/**
Stamp function - instruct sprite to draw itself on a Cell's &lt;canvas&gt; element, if its visibility attribute is true

Permitted methods include:

* 'draw' - stroke the sprite's path with the sprite's strokeStyle color, pattern or gradient
* 'fill' - fill the sprite's path with the sprite's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the sprite's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the sprite's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the sprite's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the sprite's path; shadow offset is added to both actions
* 'clear' - fill the sprite's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the sprite's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the sprite's path (not tested)
* 'none' - perform all necessary updates, but do not draw the sprite onto the canvas
@method stamp
@param {String} [method] Permitted method attribute String; by default, will use sprite's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
**/
	Sprite.prototype.stamp = function(method, cell){
		if(this.visibility){
			var	myCell = (scrawl.isa(cell,'str') && scrawl.contains(scrawl.cellnames, cell)) ? scrawl.cell[cell] : scrawl.cell[scrawl.group[this.group].cell],
				engine = scrawl.context[myCell.name],
				myMethod = (scrawl.isa(method,'str')) ? method : this.method,
				here;
			if(this.pivot){
				this.setStampUsingPivot(myCell.name);
				}
			else if(scrawl.contains(scrawl.spritenames, this.path) && scrawl.sprite[this.path].type === 'Shape'){
				here = scrawl.sprite[this.path].getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
				this.start.x = (!this.lockX) ? here.x : this.start.x;
				this.start.y = (!this.lockY) ? here.y : this.start.y;
				this.pathRoll = here.r || 0;
				}
			this.callMethod(engine, myCell.name, myMethod);
			}
		return this;
		};

/**
Stamp helper function - direct sprite to the required drawing method function
@method callMethod
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Object} engine JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} [method] Permitted method attribute String; by default, will use sprite's own method setting
@return This
@chainable
@private
**/
	Sprite.prototype.callMethod = function(engine, cell, method){
		switch(method){
			case 'clear' : this.clear(engine, cell); break;
			case 'clearWithBackground' : this.clearWithBackground(engine, cell); break;
			case 'draw' : this.draw(engine, cell); break;
			case 'fill' : this.fill(engine, cell); break;
			case 'drawFill' : this.drawFill(engine, cell); break;
			case 'fillDraw' : this.fillDraw(engine, cell); break;
			case 'sinkInto' : this.sinkInto(engine, cell); break;
			case 'floatOver' : this.floatOver(engine, cell); break;
			case 'clip' : this.clip(engine, cell); break;
			case 'none' : this.none(engine, cell); break;
			}
		return this;
		};

/**
Stamp helper function - rotate and position canvas ready for drawing sprite
@method rotateCell
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@return This
@chainable
@private
**/
	Sprite.prototype.rotateCell = function(ctx){
		var myA = (this.flipReverse) ? -1 : 1,
			myD = (this.flipUpend) ? -1 : 1,
			deltaRotation = (this.addPathRoll) ? (this.roll + this.pathRoll) * scrawl.radian : this.roll * scrawl.radian,
			cos = Math.cos(deltaRotation),
			sin = Math.sin(deltaRotation);
		ctx.setTransform((cos * myA), (sin * myA), (-sin * myD), (cos * myD), this.start.x, this.start.y);
		return this;
		};

/**
Stamp helper function - perform a 'clear' method draw

_Note: not supported by this object_
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.clear = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'clearWithBackground' method draw

_Note: not supported by this object_
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.clearWithBackground = function(ctx, cell){return this;};

/**

_Note: not supported by this object_
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.draw = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'fill' method draw

_Note: not supported by this object_
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.fill = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'drawFill' method draw

_Note: not supported by this object_
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.drawFill = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'fillDraw' method draw

_Note: not supported by this object_
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.fillDraw = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'sinkInto' method draw

_Note: not supported by this object_
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.sinkInto = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'floatOver' method draw

_Note: not supported by this object_
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.floatOver = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'clip' method draw

_Note: not tested - use at own risk!_
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.clip = function(ctx, cell){return this;};

/**
Stamp helper function - perform a 'none' method draw. This involves setting the &lt;canvas&gt; element's context engine's values with this sprite's context values, but not defining or drawing the sprite on the canvas.
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.none = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		return this;
		};

/**
Translate a Cell coordinate into a coordinate centered on this sprite's start coordinate
@method getLocalCoordinate
@param {Vector} items Cell coordinate
@return Localised Vector coordinate
**/
	Sprite.prototype.getLocalCoordinate = function(items){
		//corrects for scaling, rotation and flip; return value in px relative to sprite.start at roll=0, scale=1
		//currently only used by Picture.getImageDataValue() and indirectly by Picture.checkHit()
		items = (scrawl.isa(items,'obj')) ? items : {};
		var original = new Vector({x: items.x || 0, y: items.y || 0}),
			offset = this.getPivotOffsetVector();
		original.vectorSubtract(this.start);
		original.scalarDivide(this.scale);
		original.rotate(-this.roll);
		original.x = (this.flipReverse) ? -original.x : original.x;
		original.y = (this.flipUpend) ? -original.y : original.y;
		original.vectorAdd(offset);
		return original;
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
	Sprite.prototype.checkHit = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var	pad = scrawl.pad[scrawl.currentPad],
			ctx = scrawl.context[pad.current],
			tests = (scrawl.xt(items.tests)) ? [].concat(items.tests) : [{x: (items.x || false), y: (items.y || false)}],
			here,
			result;
		this.rotateCell(ctx);
		here = this.prepareStamp();
		ctx.beginPath();
		ctx.rect(here.x, here.y, (this.width * this.scale), (this.height * this.scale));
		for(var i=0, z=tests.length; i<z; i++){
			result = ctx.isPointInPath(tests[i].x, tests[i].y);
			if(result){
				break;
				}
			}
		return (result) ? tests[i] : false;
		};

/**
Check this sprite's collision Vectors against a Cell object's collision field image to see if any of them are colliding with the Cell's field sprites
@method checkField
@param {String} [cell] CELLNAME String of the Cell to be checked against
@return First Vector coordinate to 'pass' the Cell.checkFieldAt() function's test; true if none pass; false if the test parameters are out of bounds
**/
	Sprite.prototype.checkField = function(cell){
		var	myCell = (cell) ? scrawl.cell[cell] : scrawl.cell[scrawl.group[this.group].cell];
		return myCell.checkFieldAt({
			coordinates: this.getCollisionPoints(),
			test: this.get('fieldTest'),
			channel: this.get('fieldChannel'),
			});
		};

/**
Calculate an appropriate 'bounce' - altering the sprite's delta attribute values - following an adverse sprite.checkField() function result

This method attempts to produce a realistic bounce away from both straight and curved surfaces
@method bounceOnFieldCollision
@param {String} collision Collision point Vector
@param {String} [cell] CELLNAME String of the Cell to be checked against
@return This
@chainable
**/
	Sprite.prototype.bounceOnFieldCollision = function(collision, cell){
		var	myCell = (cell) ? scrawl.cell[cell] : scrawl.cell[scrawl.group[this.group].cell],
			start = this.start.getVector(),
			collisionStartVector = collision.getVectorSubtract(start),//.scalarMultiply(1.1),
			testVector,
			topVector = collisionStartVector.getVector(),
			bottomVector = collisionStartVector.getVector(),
			topFlag = false,
			bottomFlag = false,
			fieldAngle,
			turn,
			directionAngle,
			fieldTest = this.get('fieldTest'),
			fieldChannel = this.get('fieldChannel'),
			counter = 0,
			cfa = function(){
				var r = myCell.checkFieldAt({
					coordinates: [testVector.vectorAdd(start)],
					test: fieldTest,
					channel: fieldChannel,
					});
				return r;
				};
		do{
			testVector = topVector.rotate(-10).getVector();
			topFlag = cfa();
			counter++;
			}while(counter < 36 && topFlag !== true);
		counter = 0;
		do{
			testVector = topVector.rotate(1).getVector();
			topFlag = cfa();
			counter++;
			}while(counter <= 10 && topFlag === true);
		counter = 0;
		do{
			testVector = bottomVector.rotate(10).getVector();
			bottomFlag = cfa();
			counter++;
			}while(counter < 36 && bottomFlag !== true);
		counter = 0;
		do{
			testVector = bottomVector.rotate(-1).getVector();
			bottomFlag = cfa();
			counter++;
			}while(counter <= 10 && bottomFlag === true);
		topVector.vectorAdd(start);
		bottomVector.vectorAdd(start);
		fieldAngle = (Math.atan2((topVector.y - bottomVector.y), (topVector.x - bottomVector.x))/scrawl.radian);
		directionAngle = Math.atan2(this.delta.y,this.delta.x)/scrawl.radian;
		turn = (fieldAngle - directionAngle) * 2;
		this.delta.rotate(turn);
		return this;
		};

/**
Stamp helper function - clear shadow parameters during a multi draw operation (drawFill and fillDraw methods)
@method clearShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.clearShadow = function(ctx, cell){
		var c = scrawl.ctx[this.context];
		if(c.shadowOffsetX || c.shadowOffsetY || c.shadowBlur){
			scrawl.cell[cell].clearShadow();
			}
		return this;
		};

/**
Stamp helper function - clear shadow parameters during a multi draw operation (Phrase text-along-path drawFill and fillDraw methods)
@method restoreShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Sprite.prototype.restoreShadow = function(ctx, cell){
		var c = scrawl.ctx[this.context];
		if(c.shadowOffsetX || c.shadowOffsetY || c.shadowBlur){
			scrawl.cell[cell].restoreShadow(this.context);
			}
		return this;
		};

/**
Calculate the current positions of this sprite's collision Vectors, taking into account the sprite's current position, roll and scale
@method getCollisionPoints
@return Array of coordinate Vectors
**/
	Sprite.prototype.getCollisionPoints = function(){
		var	p = [],
			v,
			c;
		if(!scrawl.xt(this.collisionVectors)){
			if(scrawl.xt(this.collisionPoints)){
				this.buildCollisionVectors();
				}
			}
		c = this.collisionVectors || false;
		if(c){
			for(var i=0, z=c.length; i<z; i++){
				v = c[i].getVector();
				v.x = (this.flipReverse) ? -v.x : v.x;
				v.y = (this.flipUpend) ? -v.y : v.y;
				if(this.roll){
					v.rotate(this.roll);
					}
				if(this.scale !== 1){
					v.scalarMultiply(this.scale);
					}
				v.vectorAdd(this.start);
				p.push(v);
				}
			return p;
			}
		return [];
		};

/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the sprite's collision points
@method buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	Sprite.prototype.buildCollisionVectors = function(items){
		var	p, 
			o = this.getPivotOffsetVector(),
			w = this.width,
			h = this.height;
		if(scrawl.xt(items)){
			p = this.parseCollisionPoints(items);
			}
		else{
			p = this.collisionPoints;
			}
		this.collisionVectors = [];
		for(var i=0, z=p.length; i<z; i++){
			if(scrawl.isa(p[i], 'str')){
				switch(p[i]) {
					case 'start' : 	this.collisionVectors.push(new Vector()); break;
					case 'N' : 		this.collisionVectors.push(new Vector({	x: (w/2)-o.x,	y: -o.y,		})); break;
					case 'NE' : 	this.collisionVectors.push(new Vector({	x: w-o.x,		y: -o.y,		})); break;
					case 'E' : 		this.collisionVectors.push(new Vector({	x: w-o.x,		y: (h/2)-o.y,	})); break;
					case 'SE' : 	this.collisionVectors.push(new Vector({	x: w-o.x,		y: h-o.y,		})); break;
					case 'S' : 		this.collisionVectors.push(new Vector({	x: (w/2)-o.x,	y: h-o.y,		})); break;
					case 'SW' : 	this.collisionVectors.push(new Vector({	x: -o.x,		y: h-o.y,		})); break;
					case 'W' : 		this.collisionVectors.push(new Vector({	x: -o.x,		y: (h/2)-o.y,	})); break;
					case 'NW' : 	this.collisionVectors.push(new Vector({	x: -o.x,		y: -o.y,		})); break;
					case 'center' :	this.collisionVectors.push(new Vector({	x: (w/2)-o.x,	y: (h/2)-o.y,	})); break;
					}
				}
			else if(scrawl.isa(p[i], 'obj') && p[i].type === 'Vector'){
				this.collisionVectors.push(p[i]);
				}
			}
		return this;
		};

/**
Collision detection helper function

Parses user input for the collisionPoint attribute
@method parseCollisionPoints
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	Sprite.prototype.parseCollisionPoints = function(items){
		var myItems = (scrawl.xt(items)) ? [].concat(items) : [],
			p = [];
		for(var i=0, z=myItems.length; i<z; i++){
			if(scrawl.isa(myItems[i], 'str')){
				switch(myItems[i].toLowerCase()) {
					case 'all' :
						scrawl.pushUnique(p, 'N'); scrawl.pushUnique(p, 'NE'); scrawl.pushUnique(p, 'E'); scrawl.pushUnique(p, 'SE'); scrawl.pushUnique(p, 'S');
						scrawl.pushUnique(p, 'SW'); scrawl.pushUnique(p, 'W'); scrawl.pushUnique(p, 'NW'); scrawl.pushUnique(p, 'start'); scrawl.pushUnique(p, 'center');
						break;
					case 'corners' :
						scrawl.pushUnique(p, 'NE'); scrawl.pushUnique(p, 'SE'); scrawl.pushUnique(p, 'SW'); scrawl.pushUnique(p, 'NW');
						break;
					case 'edges' :
						scrawl.pushUnique(p, 'N'); scrawl.pushUnique(p, 'E'); scrawl.pushUnique(p, 'S'); scrawl.pushUnique(p, 'W');
						break;
					case 'perimeter' :
						scrawl.pushUnique(p, 'N'); scrawl.pushUnique(p, 'NE'); scrawl.pushUnique(p, 'E'); scrawl.pushUnique(p, 'SE');
						scrawl.pushUnique(p, 'S'); scrawl.pushUnique(p, 'SW'); scrawl.pushUnique(p, 'W'); scrawl.pushUnique(p, 'NW');
						break;
					case 'north' : 
					case 'n' :
						scrawl.pushUnique(p, 'N'); break;
					case 'northeast' : 
					case 'ne' :
						scrawl.pushUnique(p, 'NE'); break;
					case 'east' : 
					case 'e' :
						scrawl.pushUnique(p, 'E'); break;
					case 'southeast' : 
					case 'se' :
						scrawl.pushUnique(p, 'SE'); break;
					case 'south' : 
					case 's' :
						scrawl.pushUnique(p, 'S'); break;
					case 'southwest' : 
					case 'sw' :
						scrawl.pushUnique(p, 'SW'); break;
					case 'west' : 
					case 'w' :
						scrawl.pushUnique(p, 'W'); break;
					case 'northwest' : 
					case 'nw' :
						scrawl.pushUnique(p, 'NW'); break;
					case 'start' : 
						scrawl.pushUnique(p, 'start'); break;
					case 'center' : 
						scrawl.pushUnique(p, 'center'); break;
					}
				}
			else if(scrawl.isa(myItems[i], 'num')){
				p.push(myItems[i]);
				}
			else if(scrawl.isa(myItems[i], 'obj') && myItems[i].type === 'Vector'){
				p.push(myItems[i]);
				}
			}
		this.collisionPoints = p;
		return p;
		};

/**
# Phrase
	
## Instantiation

* scrawl.newPhrase()

## Purpose

* Defines text objects for displaying on a Cell's canvas
* Handles all related font functionality
* Performs text drawing operations on canvases

@class Phrase
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Phrase(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Sprite.call(this, items);
		SubScrawl.prototype.set.call(this, items);
		this.registerInLibrary();
		this.lineHeight = items.lineHeight || scrawl.d.Phrase.lineHeight;
		if(items.font){
			this.checkFont(items.font);
			}
		this.constructFont();
		this.size = this.get('size');
		this.multiline(items);
		this.getMetrics();
		return this;
		}
	Phrase.prototype = Object.create(Sprite.prototype);
/**
@property type
@type String
@default 'Phrase'
@final
**/		
	Phrase.prototype.type = 'Phrase';
	Phrase.prototype.classname = 'spritenames';
	scrawl.d.Phrase = {
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
@property textAlongPath
@type String
@default 'phrase'
**/
		textAlongPath: 'phrase',
/**
Fixed width attribute for text along path. When using fixed width (monospace) fonts, set this flag to true for faster rendering
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
	scrawl.mergeInto(scrawl.d.Phrase, scrawl.d.Sprite);

/**
Overrides Sprite.set()

Allows users to:
* set a sprite's Context object's values via the sprite
* shift a sprite between groups
* add a sprite to a Cell object's fence or field group (Cell collision map generation)
* reset and recalculate collision point data
* alter the font either by the font attribute, or by individual font content attributes
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Phrase.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.lineHeight = items.lineHeight || this.lineHeight;
		if(items.font){
			this.checkFont(items.font);
			delete this.offset;
			}
		if(items.text || items.size || items.scale){
			delete this.offset;
			}
		this.constructFont();
		this.size = this.get('size');
		this.multiline(items);
		this.getMetrics();
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a sprite's Context object's values via the sprite, in addition to its own attribute values

Overrides Sprite.detDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Phrase.prototype.setDelta = function(items){
		Sprite.prototype.setDelta.call(this, items);
		if(items.text){
			delete this.offset;
			}
		if(items.size || items.scale){
			this.constructFont();
			delete this.offset;
			}
		this.getMetrics();
		return this;
		};

/**
Overrides Sprite.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	Phrase.prototype.clone = function(items){
		items.texts = [];
		return Sprite.prototype.clone.call(this, items);
		};

/**
Helper function - creates Text objects for each line of text in a multiline Phrase
@method multiline
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
	Phrase.prototype.multiline = function(items){
		var	text = ''+(items.text || this.get('text')),
			textArray = text.split('\n');
		if(scrawl.xt(this.texts)){
			for(var i=0,z=this.texts.length; i<z; i++){
				delete scrawl.text[this.texts[i]];
				scrawl.removeItem(scrawl.textnames, this.texts[i]);
				}
			}
		this.texts = [];
		items.phrase = this.name;
		for(var i=0, z=textArray.length; i<z; i++){
			items.text = textArray[i];
			if(items.text.length > 0){
				new Text(items);
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
	Phrase.prototype.checkFont = function(item){
		if(scrawl.xt(item)){
			this.deconstructFont();
			}
		this.constructFont();
		return this;
		};

/**
Helper function - creates font-related attributes from sprite's Context object's font attribute
@method deconstructFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
	Phrase.prototype.deconstructFont = function(){
		var	myFont = scrawl.ctx[this.context].font, 
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
		if(/italic/i.test(myFont)) {style = 'italic';}
		else if(/oblique/i.test(myFont)) {style = 'oblique';}
		else{this.style = 'normal';}
		if(/small-caps/i.test(myFont)) {variant = 'small-caps';}
		else{variant = 'normal';}
		if(/bold/i.test(myFont)) {weight = 'bold';}
		else if(/bolder/i.test(myFont)) {weight = 'bolder';}
		else if(/lighter/i.test(myFont)) {weight = 'lighter';}
		else if(/([1-9]00)/i.test(myFont)) {
			res = myFont.match(/([1-9]00)/i);
			weight = res[1];
			}
		else{weight = 'normal';}
		res = false;
		if(/(\d+)(%|in|cm|mm|em|ex|pt|pc|ex)?/i.test(myFont)) {
			res = myFont.match(/(\d+)(%|in|cm|mm|em|ex|pt|pc|ex|px)/i);
			size = parseFloat(res[1]);
			metrics = res[2];
			}
		else if(/xx-small/i.test(myFont)) {size = 3; metrics = 'pt';}
		else if(/x-small/i.test(myFont)) {size = 6; metrics = 'pt';}
		else if(/small/i.test(myFont)) {size = 9; metrics = 'pt';}
		else if(/medium/i.test(myFont)) {size = 12; metrics = 'pt';}
		else if(/large/i.test(myFont)) {size = 15; metrics = 'pt';}
		else if(/x-large/i.test(myFont)) {size = 18; metrics = 'pt';}
		else if(/xx-large/i.test(myFont)) {size = 21; metrics = 'pt';}
		else{size = 12; metrics = 'pt';}
		myFamily = ''; 
		myFontArray = myFont.split(' ');
		for(var i=0, z=myFontArray.length; i<z; i++){
			if(!scrawl.contains(exclude, myFontArray[i])){
				if(!myFontArray[i].match(/[^\/](\d)+(%|in|cm|mm|em|ex|pt|pc|ex)?/i)){
					myFamily += myFontArray[i]+' ';
					}
				}
			}
		if(!myFamily){myFamily = 'Verdana, Geneva, sans-serif';}
		family = myFamily;
		Scrawl.prototype.set.call(this, {
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
Helper function - creates sprite's Context object's phrase attribute from other font-related attributes
@method constructFont
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
	Phrase.prototype.constructFont = function(){
		var myFont = '',
			style = this.get('style'),
			variant = this.get('variant'),
			weight = this.get('weight'),
			size = this.get('size'),
			metrics = this.get('metrics'),
			family = this.get('family');
		if(style !== 'normal'){myFont += style+' ';}
		if(variant !== 'normal'){myFont += variant+' ';}
		if(weight !== 'normal'){myFont += weight+' ';}
		myFont += (size * this.scale) + metrics + ' ';
		myFont += family;
		scrawl.ctx[this.context].font = myFont;
		return this;
		};

/**
Stamp function - instruct sprite to draw itself on a Cell's &lt;canvas&gt; element, if its visibility attribute is true

Overrides Sprite.stamp(). Permitted methods include:

* 'draw' - stroke the sprite's path with the sprite's strokeStyle color, pattern or gradient
* 'fill' - fill the sprite's path with the sprite's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the sprite's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the sprite's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the sprite's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the sprite's path; shadow offset is added to both actions
* 'clear' - fill the sprite's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the sprite's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the sprite's path (not tested)
* 'none' - perform all necessary updates, but do not draw the sprite onto the canvas
@method stamp
@param {String} [method] Permitted method attribute String; by default, will use sprite's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
**/
	Phrase.prototype.stamp = function(method, cell){
		var test;
		if(this.visibility){
			test = (scrawl.contains(scrawl.spritenames, this.path) && scrawl.sprite[this.path].type === 'Shape');
			if(this.pivot || !test || this.get('textAlongPath') === 'phrase'){
				Sprite.prototype.stamp.call(this, method, cell);
				}
			else{
				scrawl.text[this.texts[0]].stampAlongPath(method, cell);
				}
			}
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
	Phrase.prototype.clear = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		ctx.globalCompositeOperation = 'destination-out';
		this.rotateCell(ctx);
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].clear(ctx, cell, tX, tY);
			}
		ctx.globalCompositeOperation = scrawl.ctx[cell].get('globalCompositeOperation');
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
	Phrase.prototype.clearWithBackground = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].clearWithBackground(ctx, cell, tX, tY);
			}
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
	Phrase.prototype.draw = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		if(scrawl.xt(this.backgroundColor)){
			this.addBackgroundColor(ctx, here);
			}
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].draw(ctx, cell, tX, tY);
			}
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
	Phrase.prototype.fill = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		if(scrawl.xt(this.backgroundColor)){
			this.addBackgroundColor(ctx, here);
			}
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].fill(ctx, cell, tX, tY);
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
	Phrase.prototype.drawFill = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		if(scrawl.xt(this.backgroundColor)){
			this.addBackgroundColor(ctx, here);
			}
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].drawFill(ctx, cell, tX, tY, this);
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
	Phrase.prototype.fillDraw = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		if(scrawl.xt(this.backgroundColor)){
			this.addBackgroundColor(ctx, here);
			}
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].fillDraw(ctx, cell, here.x+o.x, tY, this);
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
	Phrase.prototype.sinkInto = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		if(scrawl.xt(this.backgroundColor)){
			this.addBackgroundColor(ctx, here);
			}
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].sinkInto(ctx, cell, here.x+o.x, tY);
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
	Phrase.prototype.floatOver = function(ctx, cell){
		var	tX, 
			tY,
			o = this.getOffset(),
			here = this.prepareStamp(),
			textY = this.size * this.lineHeight * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		if(scrawl.xt(this.backgroundColor)){
			addBackgroundColor(ctx, here);
			}
		tX = here.x + o.x;
		for(var i=0, z=this.texts.length; i<z; i++){
			tY = here.y + (textY * i) + o.y;
			scrawl.text[this.texts[i]].floatOver(ctx, cell, here.x+o.x, tY);
			}
		return this;
		};

/**
Helper function - calculate sprite's width and height attributes, taking into account font size, scaling, etc
@method getMetrics
@param {String} cellname CELLNAME String (any &lt;canvas&gt; will do for this function)
@return This
@chainable
@private
**/
	Phrase.prototype.getMetrics = function(cellname){
		var	h = 0,
			w = 0,
			texts = this.texts;
		for(var i=0, z=texts.length; i<z; i++){
			w = (scrawl.text[texts[i]].get('width') > w) ? scrawl.text[texts[i]].width : w;
			h += scrawl.text[texts[i]].get('height');
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
	Phrase.prototype.addBackgroundColor = function(ctx, here){
		var margin = this.get('backgroundMargin'),
			topX = here.x - margin,
			topY = here.y - margin,
			w = (this.width * this.scale) + (margin*2),
			h = (this.height * this.scale) + (margin*2);
		ctx.fillStyle = this.backgroundColor;
		ctx.fillRect(topX, topY, w, h);
		ctx.fillStyle = scrawl.ctx[this.context].get('fillStyle');
		return this;
		};

/**
Drawing function - get sprite offset values

Returns an object with coordinates __x__ and __y__
@method getOffset
@return JavaScript object
@private
**/
	Phrase.prototype.getOffset = function(){
		var myContext = scrawl.ctx[this.context],
			oX = 0,
			oY = 0;
		switch(myContext.get('textAlign')){
			case 'start' :
			case 'left' :
				oX = 0;
				break;
			case 'center' :
				oX = (this.width/2) * this.scale;
				break;
			case 'right' :
			case 'end' :
				oX = this.width * this.scale;
				break;
			}
		switch(myContext.get('textBaseline')){
			case 'top' :
				oY = 0;
				break;
			case 'hanging' :
				oY = this.size * this.lineHeight * this.scale * 0.1;
				break;
			case 'middle' :
				oY = this.size * this.lineHeight * this.scale * 0.5;
				break;
			case 'bottom' :
				oY = this.size * this.lineHeight * this.scale;
				break;
			default: 
				oY = this.size * this.lineHeight * this.scale * 0.85;
			}
		return {x: oX, y: oY};
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
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
@private
**/		
	function Text(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		this.text = items.text || scrawl.d.Text.text;
		this.phrase = items.phrase || scrawl.d.Text.phrase;
		this.context = scrawl.sprite[this.phrase].context;
		this.fixedWidth = (scrawl.isa(items.fixedWidth,'bool')) ? items.fixedWidth : scrawl.d.Text.fixedWidth;
		this.textAlongPath = items.textAlongPath || scrawl.d.Text.textAlongPath;
		scrawl.text[this.name] = this;
		scrawl.pushUnique(scrawl.textnames, this.name);
		scrawl.pushUnique(scrawl.sprite[this.phrase].texts, this.name);
		this.getMetrics();
		return this;
		}
	Text.prototype = Object.create(Scrawl.prototype);

/**
@property type
@type String
@default 'Text'
@final
**/		
	Text.prototype.type = 'Text';
	Text.prototype.classname = 'textnames';
	scrawl.d.Text = {
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
CONTEXTNAME String of parent phrase's Context object
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
	scrawl.mergeInto(scrawl.d.Text, scrawl.d.Scrawl);

/**
Stamp function - stamp phrases, words or individual glyphs (letters and spaces) along a Shape sprite path

Permitted methods include:

* 'draw' - stroke the sprite's path with the sprite's strokeStyle color, pattern or gradient
* 'fill' - fill the sprite's path with the sprite's fillStyle color, pattern or gradient
* 'drawFill' - stroke, and then fill, the sprite's path; if a shadow offset is present, the shadow is added only to the stroke action
* 'fillDraw' - fill, and then stroke, the sprite's path; if a shadow offset is present, the shadow is added only to the fill action
* 'floatOver' - stroke, and then fill, the sprite's path; shadow offset is added to both actions
* 'sinkInto' - fill, and then stroke, the sprite's path; shadow offset is added to both actions
* 'clear' - fill the sprite's path with transparent color 'rgba(0, 0, 0, 0)'
* 'clearWithBackground' - fill the sprite's path with the Cell's current backgroundColor
* 'clip' - clip the drawing zone to the sprite's path (not tested)
* 'none' - perform all necessary updates, but do not draw the sprite onto the canvas
@method stampAlongPath
@param {String} [method] Permitted method attribute String; by default, will use sprite's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Text.prototype.stampAlongPath = function(method, cell){
		var	p = scrawl.sprite[this.phrase];
		method = (scrawl.isa(method,'str')) ? method : p.method;
		cell = (scrawl.isa(cell,'str') && scrawl.contains(scrawl.cellnames, cell)) ? cell : scrawl.cell[scrawl.group[p.group].cell];
		var engine = scrawl.context[cell],
			myCell = scrawl.cell[cell],
			here,
			pathLength = scrawl.sprite[p.path].getPerimeterLength(),
			width = this.width * p.scale,
			ratio = width/pathLength,
			pos = p.pathPlace,
			nowPos,
			oldText = this.text,
			x,
			y,
			r;
		if(!scrawl.xt(this.glyphs)){
			this.getMetrics();
			}
		myCell.setEngine(p);
		for(var j=0, w=this.glyphs.length; j<w; j++){
			if(scrawl.xt(this.glyphs[j])){
				this.text = this.glyphs[j];
				nowPos = pos + (((this.glyphWidths[j]/2)/width)*ratio);
				if(!scrawl.isBetween(nowPos, 0, 1, true)){
					nowPos += (nowPos > 0.5) ? -1 : 1;
					}
				here = scrawl.sprite[p.path].getPerimeterPosition(nowPos, p.pathSpeedConstant, true);
				x = here.x;
				y = here.y;
				r = here.r * scrawl.radian;
				engine.setTransform(1,0,0,1,0,0);
				engine.translate(x, y);
				engine.rotate(r);
				engine.translate(-x, -y);
				switch(method){
					case 'draw' : this.draw(engine, cell, x, y); break;
					case 'fill' : this.fill(engine, cell, x, y); break;
					case 'drawFill' : this.drawFill(engine, cell, x, y, p); break;
					case 'fillDraw' : this.fillDraw(engine, cell, x, y, p); break;
					case 'sinkInto' : this.sinkInto(engine, cell, x, y); break;
					case 'floatOver' : this.floatOver(engine, cell, x, y); break;
					case 'clear' : 
					case 'clearWithBackground' : 
					case 'clip' : 
					case 'none' : 
					default :
						//do nothing
					}
				pos += (this.glyphWidths[j]/width)*ratio
				if(!scrawl.isBetween(pos, 0, 1, true)){
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
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
	Text.prototype.clear = function(ctx, cell, x, y){
		ctx.fillText(this.text, x, y);
		return this;
		};

/**
Stamp helper function - perform a 'clearWithBackground' method draw
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
	Text.prototype.clearWithBackground = function(ctx, cell, x, y){
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		ctx.fillText(this.text, x, y);
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
		return this;
		};

/**
Stamp helper function - perform a 'draw' method draw
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
	Text.prototype.draw = function(ctx, cell, x, y){
		ctx.strokeText(this.text, x, y);
		return this;
		};

/**
Stamp helper function - perform a 'fill' method draw
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
	Text.prototype.fill = function(ctx, cell, x, y){
		ctx.fillText(this.text, x, y);
		return this;
		};

/**
Stamp helper function - perform a 'drawFill' method draw
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@param {Phrase} p Parent Phrase sprite object
@return This
@chainable
@private
**/
	Text.prototype.drawFill = function(ctx, cell, x, y, p){
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
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@param {Phrase} p Parent Phrase sprite object
@return This
@chainable
@private
**/
	Text.prototype.fillDraw = function(ctx, cell, x, y, p){
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
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
	Text.prototype.sinkInto = function(ctx, cell, x, y){
		ctx.fillText(this.text, x, y);
		ctx.strokeText(this.text, x, y);
		return this;
		};

/**
Stamp helper function - perform a 'floatOver' method draw
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
	Text.prototype.floatOver = function(ctx, cell, x, y){
		ctx.strokeText(this.text, x, y);
		ctx.fillText(this.text, x, y);
		return this;
		};

/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Number} x Glyph horizontal coordinate
@param {Number} y Glyph vertical coordinate
@return This
@chainable
@private
**/
	Text.prototype.clip = function(ctx, cell, x, y){
		return this;
		};

/**
Calculate metrics for each phrase, word or glyph in the glyphs array
@method getMetrics
@return This
@chainable
@private
**/
	Text.prototype.getMetrics = function(){
		var	p = scrawl.sprite[this.phrase],
			myContext = scrawl.context[scrawl.pad[scrawl.currentPad].current],
			myEngine = scrawl.ctx[this.context],
			tempFont = myContext.font,
			tempBaseline = myContext.textBaseline,
			tempAlign = myContext.textAlign,
			myText,
			myTextWidth,
			tempText;
		myContext.font = myEngine.get('font');
		myContext.textBaseline = myEngine.get('textBaseline');
		myContext.textAlign = myEngine.get('textAlign');
		this.width = myContext.measureText(this.text).width/p.scale;
		this.height = p.size * p.lineHeight;
		if(p.path){
			this.glyphs = [];
			this.glyphWidths = [];
			myText = this.text;
			if(this.textAlongPath === 'word'){
				tempText = this.text.split(' ');
				for(var i=0, z=tempText.length; i<z; i++){
					this.glyphs.push(tempText[i]);
					this.glyphWidths.push(myContext.measureText(tempText[i]).width);
					if(scrawl.xt(tempText[i+1])){
						this.glyphs.push(' ');
						this.glyphWidths.push(myContext.measureText(' ').width);
						}
					}
				}
			else{
				myTextWidth = myContext.measureText(myText).width;
				if(this.fixedWidth){
					for(var i=0, z=myText.length; i<z; i++){
						this.glyphs.push(myText[i]);
						this.glyphWidths.push(myTextWidth/z);
						}
					}
				else{
					for(var i=1, z=myText.length; i<=z; i++){
						this.glyphs.push(myText[i-1]);
						tempText = myText.substr(0, i-1)+myText.substr(i);
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
		
/**
# Block
	
## Instantiation

* scrawl.newBlock()

## Purpose

* Defines 'rect' objects for displaying on a Cell's canvas
* Performs 'rect' based drawing operations on canvases

@class Block
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Block(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Sprite.call(this, items);
		SubScrawl.prototype.set.call(this, items);
		this.width = items.width || scrawl.d.Block.width;
		this.height = items.height || scrawl.d.Block.height;
		this.registerInLibrary();
		scrawl.pushUnique(scrawl.group[this.group].sprites, this.name);
		return this;
		}
	Block.prototype = Object.create(Sprite.prototype);
/**
@property type
@type String
@default 'Block'
@final
**/		
	Block.prototype.type = 'Block';
	Block.prototype.classname = 'spritenames';
	scrawl.d.Block = {
		width: 0,
		height: 0,
		};
	scrawl.mergeInto(scrawl.d.Block, scrawl.d.Sprite);

/**
Overrides Sprite.set()

Allows users to:
* set a sprite's Context object's values via the sprite
* shift a sprite between groups
* add a sprite to a Cell object's fence or field group (Cell collision map generation)
* reset and recalculate collision point data
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Block.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		this.width = items.width || this.width;
		this.height = items.height || this.height;
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a sprite's Context object's values via the sprite, in addition to its own attribute values

Overrides Sprite.detDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Block.prototype.setDelta = function(items){
		Sprite.prototype.setDelta.call(this, items);
		if(scrawl.xt(items.width)){this.width += items.width;}
		if(scrawl.xt(items.height)){this.height += items.height;}
		return this;
		};

/**
Stamp helper function - perform a 'clip' method draw
@method clip
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@return This
@chainable
@private
**/
	Block.prototype.clip = function(ctx, cell){
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
	Block.prototype.clear = function(ctx, cell){
		var here = this.prepareStamp();
		scrawl.cell[cell].setToClearShape();
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
	Block.prototype.clearWithBackground = function(ctx, cell){
		var myCell = scrawl.cell[cell],
			bg = myCell.get('backgroundColor'),
			myCellCtx = scrawl.ctx[cell],
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
	Block.prototype.draw = function(ctx, cell){
		var here = this.prepareStamp();
		scrawl.cell[cell].setEngine(this);
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
	Block.prototype.fill = function(ctx, cell){
		var here = this.prepareStamp();
		scrawl.cell[cell].setEngine(this);
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
	Block.prototype.drawFill = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		scrawl.cell[cell].setEngine(this);
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
	Block.prototype.fillDraw = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		scrawl.cell[cell].setEngine(this);
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
	Block.prototype.sinkInto = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		scrawl.cell[cell].setEngine(this);
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
	Block.prototype.floatOver = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		scrawl.cell[cell].setEngine(this);
		this.rotateCell(ctx);
		ctx.strokeRect(here.x, here.y, width, height);
		ctx.fillRect(here.x, here.y, width, height);
		return this;
		};

/**
# Wheel
	
## Instantiation

* scrawl.newWheel()

## Purpose

* Defines 'arc' objects for displaying on a Cell's canvas
* Performs 'arc' based drawing operations on canvases

@class Wheel
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Wheel(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Sprite.call(this, items);
		SubScrawl.prototype.set.call(this, items);
		this.radius = items.radius || scrawl.d.Wheel.radius;
		this.width = this.radius * 2;
		this.height = this.width;
		this.checkHitUsingRadius = (scrawl.isa(items.checkHitUsingRadius,'bool')) ? items.checkHitUsingRadius : scrawl.d.Wheel.checkHitUsingRadius;
		this.closed = (scrawl.isa(items.closed,'bool')) ? items.closed : scrawl.d.Wheel.closed;
		this.includeCenter = (scrawl.isa(items.includeCenter,'bool')) ? items.includeCenter : scrawl.d.Wheel.includeCenter;
		this.clockwise = (scrawl.isa(items.clockwise,'bool')) ? items.clockwise : scrawl.d.Wheel.clockwise;
		this.registerInLibrary();
		scrawl.pushUnique(scrawl.group[this.group].sprites, this.name);
		return this;
		}
	Wheel.prototype = Object.create(Sprite.prototype);

/**
@property type
@type String
@default 'Wheel'
@final
**/		
	Wheel.prototype.type = 'Wheel';
	Wheel.prototype.classname = 'spritenames';
	scrawl.d.Wheel = {
		radius: 0,
/**
Angle of the path's start point, from due east, in degrees
@property startAngle
@type Number
@default 0
**/
		startAngle: 0,
/**
Angle of the path's end point, from due east, in degrees
@property endAngle
@type Number
@default 360
**/
		endAngle: 360,
/**
Drawing flag - true to draw the arc in a clockwise direction; false for anti-clockwise
@property clockwise
@type Boolean
@default false
**/
		clockwise: false,
/**
Drawing flag - true to close the path; false to keep the path open
@property closed
@type Boolean
@default true
**/
		closed: true,
/**
Drawing flag - true to include the center in the path (for wedge shapes); false for circles
@property includeCenter
@type Boolean
@default false
**/
		includeCenter: false,
/**
Collision calculation flag - true to use a simple radius check; false to use the JavaScript isPointInPath() function
@property checkHitUsingRadius
@type Boolean
@default true
**/
		checkHitUsingRadius: true,
		width: 0,
		height: 0,
		};
	scrawl.mergeInto(scrawl.d.Wheel, scrawl.d.Sprite);

/**
Overrides Sprite.set()

Allows users to:
* set a sprite's Context object's values via the sprite
* shift a sprite between groups
* add a sprite to a Cell object's fence or field group (Cell collision map generation)
* reset and recalculate collision point data
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Wheel.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		this.radius = items.radius || this.radius;
		this.width = this.radius * 2;
		this.height = this.width;
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a sprite's Context object's values via the sprite, in addition to its own attribute values

Overrides Sprite.detDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Wheel.prototype.setDelta = function(items){
		Sprite.prototype.setDelta.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		var f = {};
		if(scrawl.xt(items.radius)){
			this.radius += items.radius;
			this.width = this.radius * 2;
			this.height = this.width;
			}
		if(scrawl.xt(items.startAngle)){f.startAngle = this.get('startAngle') + items.startAngle;}
		if(scrawl.xt(items.endAngle)){f.endAngle = this.get('endAngle') + items.endAngle;}
		this.set(f);
		return this;
		};

/**
Check Cell coordinates to see if any of them fall within this sprite's path - uses JavaScript's _isPointInPath_ function

Argument object contains the following attributes:

* __tests__ - an array of Vector coordinates to be checked; alternatively can be a single Vector
* __x__ - X coordinate
* __y__ - Y coordinate
* __pad__ - PADNAME String

Either the 'tests' attribute should contain a Vector, or an array of vectors, or the x and y attributes should be set to Number values

If the __checkHitUsingRadius__ attribute is true, collisions will be detected using a simple distance comparison; otherwise the JavaScript isPointInPath() function will be invoked
@method checkHit
@param {Object} items Argument object
@return The first coordinate to fall within the sprite's path; false if none fall within the path
**/
	Wheel.prototype.checkHit = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var	tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}],
			result = false,
			myX,
			myY,
			distance,
			test,
			testRadius,
			pad,
			cell,
			ctx;
		if(this.checkHitUsingRadius){
			test = items.test || 0;
			testRadius = (test) ? test : this.radius * this.scale;
			for(var i=0, z=tests.length; i<z; i++){
				myX = tests[i].x - this.start.x;
				myY = tests[i].y - this.start.y;
				distance = Math.sqrt((myX * myX) + (myY * myY));
				result = (distance <= testRadius) ? true : false;
				if(result){break;}
				}
			}
		else{
			pad = scrawl.pad[items.pad] || scrawl.pad[scrawl.currentPad];
			cell = scrawl.cell[pad.current].name;
			ctx = scrawl.context[pad.current];
			this.buildPath(ctx, cell);
			for(var i=0, z=tests.length; i<z; i++){
				result = ctx.isPointInPath(tests[i].x, tests[i].y);
				if(result){break;}
				}
			}
		return (result) ? tests[i] : false;
		};

/**
Calculates the pixels value of the object's handle attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	Wheel.prototype.getPivotOffsetVector = function(){
		var result = this.handle.getVector();
		if((scrawl.isa(this.handle.x,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.x)){
			result.x = ((parseFloat(this.handle.x)/100) * this.width)  - this.radius;
			}
		else{
			switch (this.handle.x){
				case 'left' : result.x = -this.radius; break;
				case 'center' : result.x = 0; break;
				case 'right' : result.x = this.radius; break;
				}
			}
		if((scrawl.isa(this.handle.y,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.y)){
			result.y = ((parseFloat(this.handle.y)/100) * this.height) - this.radius;
			}
		else{
			switch (this.handle.y){
				case 'top' : result.y = -this.radius; break;
				case 'center' : result.y = 0; break;
				case 'bottom' : result.y = this.radius; break;
				}
			}
		return result;
		};

/**
Helper function - define the sprite's path on the &lt;canvas&gt; element's context engine
@method buildPath
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Wheel.prototype.buildPath = function(ctx, cell){
		var here = this.prepareStamp(),
			startAngle = this.get('startAngle'),
			endAngle = this.get('endAngle');
		this.rotateCell(ctx, cell);
		ctx.beginPath();
		ctx.arc(here.x, here.y, (this.radius * this.scale), (startAngle * scrawl.radian), (endAngle * scrawl.radian), this.clockwise);
		if(this.includeCenter){ctx.lineTo(here.x, here.y);}
		if(this.closed){ctx.closePath();}
		return this;
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
	Wheel.prototype.clip = function(ctx, cell){
		this.buildPath(ctx, cell);
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
	Wheel.prototype.clear = function(ctx, cell){
		ctx.globalCompositeOperation = 'destination-out';
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		ctx.globalCompositeOperation = scrawl.ctx[cell].get('globalCompositeOperation');
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
	Wheel.prototype.clearWithBackground = function(ctx, cell){
		var myCell = scrawl.cell[cell],
			bc = myCell.get('backgroundColor'),
			myCellCtx = scrawl.ctx[cell],
			fillStyle = myCellCtx.get('fillStyle'),
			strokeStyle = myCellCtx.get('strokeStyle'),
			globalAlpha = myCellCtx.get('globalAlpha');
		ctx.fillStyle = bc;
		ctx.strokeStyle = bc;
		ctx.globalAlpha = 1;
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
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
	Wheel.prototype.draw = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
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
	Wheel.prototype.fill = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
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
	Wheel.prototype.drawFill = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		this.clearShadow(ctx, cell);
		ctx.fill();
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
	Wheel.prototype.fillDraw = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		this.clearShadow(ctx, cell);
		ctx.stroke();
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
	Wheel.prototype.sinkInto = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.fill();
		ctx.stroke();
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
	Wheel.prototype.floatOver = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		this.buildPath(ctx, cell);
		ctx.stroke();
		ctx.fill();
		return this;
		};

/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the sprite's collision points
@method buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	Wheel.prototype.buildCollisionVectors = function(items){
		var	p,
			v = new Vector({x: this.radius, y: 0}),
			r,
			res;
		if(scrawl.xt(items)){
			p = this.parseCollisionPoints(items);
			}
		else{
			p = this.collisionPoints;
			}
		this.collisionVectors = [];
		for(var i=0, z=p.length; i<z; i++){
			if(scrawl.isa(p[i], 'num') && p[i] > 1){
				r = 360/Math.floor(p[i]);
				for(var j=0; j<p[i]; j++){
					this.collisionVectors.push(v.getVector().rotate(r*j));
					}
				}
			else if(scrawl.isa(p[i], 'str')){
				switch(p[i]) {
					case 'start' : 	res = new Vector(); break;
					case 'N' : 		res = v.getVector().rotate(-90); break;
					case 'NE' : 	res = v.getVector().rotate(-45); break;
					case 'E' : 		res = v.getVector(); break;
					case 'SE' : 	res = v.getVector().rotate(45); break;
					case 'S' : 		res = v.getVector().rotate(90); break;
					case 'SW' : 	res = v.getVector().rotate(135); break;
					case 'W' : 		res = v.getVector().rotate(180); break;
					case 'NW' : 	res = v.getVector().rotate(-135); break;
					case 'center' :	res = new Vector(); break;
					}
				this.collisionVectors.push(res);
				}
			else if(scrawl.isa(p[i], 'obj') && p[i].type === 'Vector'){
				this.collisionVectors.push(p[i]);
				}
			}
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

@class Picture
@constructor
@extends Sprite
@uses AnimSheet
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Picture(items){
		if(scrawl.isa(items, 'obj') && scrawl.xt(items.url)){
			return this.importImage(items);
			}
		else{
			items = (scrawl.isa(items,'obj')) ? items : {};
			Sprite.call(this, items);
			SubScrawl.prototype.set.call(this, items);
			var s,
				w,
				h,
				x,
				y;
			this.source = items.source || false;
			this.imageType = this.sourceImage(items.source) || false;
			if(this.source){
				if(this.imageType === 'img'){
					s = scrawl.image[this.source];
					w = s.get('width');
					h = s.get('height');
					x = 0;
					y = 0;
					}
				else if(this.imageType === 'canvas'){
					s = scrawl.cell[this.source];
					w = s.sourceWidth;
					h = s.sourceHeight;
					x = s.source.x;
					y = s.source.y;
					}
				else if(this.imageType === 'animation'){
					s = scrawl.anim[this.get('animSheet')].getData();
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
			scrawl.pushUnique(scrawl.group[this.group].sprites, this.name);
			return this;
			}
		}
	Picture.prototype = Object.create(Sprite.prototype);

/**
@property type
@type String
@default 'Picture'
@final
**/		
	Picture.prototype.type = 'Picture';
	Picture.prototype.classname = 'spritenames';
	scrawl.d.Picture = {
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
		width: 0,
		height: 0,
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

_Not retained by object_
@property url
@type String
@default ''
**/
/**
Asynchronous loading of image file from the server - function to run once image has successfully loaded

_Not retained by object_
@property callback
@type Function
@default undefined
**/
		};
	scrawl.mergeInto(scrawl.d.Picture, scrawl.d.Sprite);
	Picture.prototype.get = function(item){
		if(scrawl.contains(scrawl.animKeys, item)){
			return scrawl.anim[this.animSheet].get(item);
			}
		else{
			return Sprite.prototype.get.call(this, item);
			}
		};

/**
Overrides Sprite.set()

Allows users to:
* set a sprite's Context object's values via the sprite
* set the sprite's AnimSheet  object's values via the sprite
* shift a sprite between groups
* add a sprite to a Cell object's fence or field group (Cell collision map generation)
* reset and recalculate collision point data
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Picture.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		if(scrawl.xt(this.animSheet)){
			scrawl.anim[this.animSheet].set(items);
			}
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.width = items.width || this.width;
		this.height = items.height || this.height;
		this.copyX = items.copyX || this.copyX;
		this.copyY = items.copyY || this.copyY;
		this.copyWidth = items.copyWidth || this.copyWidth;
		this.copyHeight = items.copyHeight || this.copyHeight;
		return this;
		};

/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a sprite's Context object's values via the sprite, in addition to its own attribute values

Overrides Sprite.detDelta()
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Picture.prototype.setDelta = function(items){
		Sprite.prototype.setDelta.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.width)){this.width += items.width;}
		if(scrawl.xt(items.height)){this.height += items.height;}
		if(scrawl.xt(items.copyX)){this.copyX += items.copyX;}
		if(scrawl.xt(items.copyY)){this.copyY += items.copyY;}
		if(scrawl.xt(items.copyWidth)){this.copyWidth += items.copyWidth;}
		if(scrawl.xt(items.copyHeight)){this.copyHeight += items.copyHeight;}
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
	Picture.prototype.importImage = function(items){
		if(scrawl.isa(items, 'obj') && scrawl.xt(items.url)){
			var myImage = new Image();
			myImage.id = items.name || 'image'+Math.floor(Math.random()*100000000);
			myImage.onload = function(){
				try{
					var iObj = scrawl.newImage({
						name: myImage.id,
						element: myImage,
						}),
						url = items.url;
					delete items.url;
					items.source = myImage.id;
					var s = scrawl.newPicture(items);
					if(scrawl.isa(items.callback,'fn')){
						items.callback.call(s);
						}
					return s;
					}
				catch(e){
					console.log('Image <'+url+'> failed to load - '+e.name+' error: '+e.message);
					return false;
					}
				};
/**
Path to image, for use when dynamically importing images for use by the sprite

Used only with __scrawl.newPicture()__ and __Picture.clone()__ operations. This attribute is not retained
@property url
@type String
@default ''
**/
			myImage.src = items.url;
			}
		else{
			console.log('Picture.importImage() failed - no url supplied');
			return false;
			}
		};

/**
Overrides Sprite.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	Picture.prototype.clone = function(items){
		var a = Sprite.prototype.clone.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
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
	Picture.prototype.fitToImageSize = function(){
		if(this.imageType === 'img'){
			var img = scrawl.image[this.source];
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
	Picture.prototype.sourceImage = function(){
		if(this.get('animSheet') && scrawl.contains(scrawl.imagenames, this.source)){return 'animation';}
		if(scrawl.contains(scrawl.imagenames, this.source)){return 'img';}
		if(scrawl.contains(scrawl.cellnames, this.source)){return 'canvas';}
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
	Picture.prototype.clip = function(ctx, cell){
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
	Picture.prototype.clear = function(ctx, cell){
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
	Picture.prototype.clearWithBackground = function(ctx, cell){
		var here = this.prepareStamp(),
			width = this.width * this.scale,
			height = this.height * this.scale;
		this.rotateCell(ctx);
		ctx.fillStyle = scrawl.cell[cell].backgroundColor;
		ctx.strokeStyle = scrawl.cell[cell].backgroundColor;
		ctx.globalAlpha = 1;
		ctx.strokeRect(here.x, here.y, width, height);
		ctx.fillRect(here.x, here.y, width, height);
		ctx.fillStyle = scrawl.ctx[cell].fillStyle;
		ctx.strokeStyle = scrawl.ctx[cell].strokeStyle;
		ctx.globalAlpha = scrawl.ctx[cell].globalAlpha;
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
	Picture.prototype.draw = function(ctx, cell){
		var here = this.prepareStamp();
		this.rotateCell(ctx);
		scrawl.cell[cell].setEngine(this);
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
	Picture.prototype.fill = function(ctx, cell){
		var here;
		if(this.imageType){
			here = this.prepareStamp();
			this.rotateCell(ctx);
			scrawl.cell[cell].setEngine(this);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, (this.width * this.scale), (this.height * this.scale));
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
	Picture.prototype.drawFill = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			scrawl.cell[cell].setEngine(this);
			ctx.strokeRect(here.x, here.y, width, height);
			this.clearShadow(ctx, cell);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
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
	Picture.prototype.fillDraw = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			scrawl.cell[cell].setEngine(this);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
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
	Picture.prototype.sinkInto = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			scrawl.cell[cell].setEngine(this);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
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
	Picture.prototype.floatOver = function(ctx, cell){
		var here,
			width,
			height;
		if(this.imageType){
			here = this.prepareStamp();
			width = this.width * this.scale;
			height = this.height * this.scale;
			this.rotateCell(ctx);
			scrawl.cell[cell].setEngine(this);
			ctx.strokeRect(here.x, here.y, width, height);
			ctx.drawImage(this.getImage(), this.copyX, this.copyY, this.copyWidth, this.copyHeight, here.x, here.y, width, height);
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
	Picture.prototype.getImageData = function(label){
		label = (scrawl.xt(label)) ? label : 'data';
		var	img = this.getImage(),
			myImage;
		if(this.imageType === 'animation'){
			myImage = scrawl.image[this.source];
			scrawl.cv.width = myImage.get('width');
			scrawl.cv.height = myImage.get('height');
			scrawl.cvx.drawImage(img, 0, 0);
			}
		else{
			scrawl.cv.width = this.copyWidth;
			scrawl.cv.height = this.copyHeight;
			scrawl.cvx.drawImage(img, this.copyX, this.copyY, this.copyWidth, this.copyHeight, 0, 0, this.copyWidth, this.copyHeight);
			}
		this.imageData = this.name+'_'+label;
		scrawl.imageData[this.imageData] = scrawl.cvx.getImageData(0, 0, scrawl.cv.width, scrawl.cv.height);
		return this;
		};

/**
Get the pixel color or channel data from Picture object's image at given coordinate

Argument needs to have __x__ and __y__ data (pixel coordinates) and, optionally, a __channel__ string - 'red', 'blue', 'green', 'alpha', 'color' (default)
@method getImageDataValue
@param {Object} items Coordinate Vector or Object
@return Color value at coordinate; false if no color found
**/
	Picture.prototype.getImageDataValue = function(items){
		var	coords = this.getLocalCoordinate(items),
			d = scrawl.imageData[this.get('imageData')],
			myX,
			myY,
			myData,
			copyScaleX,
			copyScaleY,
			result,
			myEl,
			imageDataChannel = this.get('imageDataChannel');
		if(this.imageType === 'animation' && scrawl.image[this.source]){
			myData = scrawl.anim[this.get('animSheet')].getData();
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
		if(scrawl.isBetween(myX, 0, d.width-1, true) && scrawl.isBetween(myY, 0, d.height-1, true)){
			switch(items.channel || imageDataChannel){
				case 'red' : result = (scrawl.xt(d.data[myEl])) ? d.data[myEl] : false; break;
				case 'blue' : result = (scrawl.xt(d.data[myEl+1])) ? d.data[myEl+1] : false; break;
				case 'green' : result = (scrawl.xt(d.data[myEl+2])) ? d.data[myEl+2] : false; break;
				case 'alpha' : result = (scrawl.xt(d.data[myEl+3])) ? d.data[myEl+3] : false; break;
				case 'color' : result = (scrawl.xta([d.data[myEl],d.data[myEl+1],d.data[myEl+2],d.data[myEl+3]])) ? 'rgba('+d.data[myEl]+','+d.data[myEl+1]+','+d.data[myEl+2]+','+d.data[myEl+3]+')' : false; break;
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
	Picture.prototype.getImage = function(){
		var myData,
			myReturn;
		switch(this.imageType){
			case 'canvas' :
				myReturn = scrawl.canvas[this.source];
				break;
			case 'animation' :
				myData = scrawl.anim[this.animSheet].getData();
				this.set({
					copyX: myData.copyX,
					copyY: myData.copyY,
					copyWidth: myData.copyWidth,
					copyHeight: myData.copyHeight,
					});
				myReturn = (scrawl.xt(scrawl.img[this.source])) ? scrawl.img[this.source] : scrawl.object[this.source];
				break;
			default :
				myReturn = (scrawl.xt(scrawl.img[this.source])) ? scrawl.img[this.source] : scrawl.object[this.source];
			}
		return myReturn;
/*		if(this.imageType === 'animation'){
			//animSheet always set if imageType === 'animation'
			var myData = scrawl.anim[this.animSheet].getData();
			this.set({
				copyX: myData.copyX,
				copyY: myData.copyY,
				copyWidth: myData.copyWidth,
				copyHeight: myData.copyHeight,
				});
			return scrawl.img[this.source];
			}
		else{
			return scrawl[this.imageType][this.source];
			}
*/		};

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
	Picture.prototype.checkHit = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var	hit = Sprite.prototype.checkHit.call(this, items),
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
					test = (scrawl.isa(items.test,'num')) ? items.test : 0;
					return (c > test) ? hit : false;
					}
				}
			}
		return hit;
		};

/**
# Outline
	
## Instantiation

* scrawl.makeLine() - straight lines
* scrawl.makeBezier() - cubic bezier curves
* scrawl.makeEllipse() - ellipses and circles
* scrawl.makeQuadratic() - quadratic bezier curves
* scrawl.makeRectangle() - for rectangles with rounded corners
* scrawl.makeRegularShape() - triangles, pentangles (stars), pentagons, etc
* scrawl.newOutline() - Irregular, path-based shapes

## Purpose

* Defines a sprite composed of lines, quadratic and bezier curves, etc
* See also Shape object, which achieves a similar thing in a different way

@class Outline
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Outline(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Sprite.call(this, items);
		SubScrawl.prototype.set.call(this, items);
		this.isLine = (scrawl.isa(items.isLine,'bool')) ? items.isLine : true;
		this.dataSet = (scrawl.xt(this.data)) ? this.buildDataSet(this.data) : '';
		this.registerInLibrary();
		scrawl.pushUnique(scrawl.group[this.group].sprites, this.name);
		return this;
		}
	Outline.prototype = Object.create(Sprite.prototype);
/**
@property type
@type String
@default 'Outline'
@final
**/		
	Outline.prototype.type = 'Outline';
	Outline.prototype.classname = 'spritenames';
	scrawl.d.Outline = {
/**
Path data string - uses SVGTiny Path.d format
@property data
@type String
@default ''
**/
		data: '',
/**
Interpreted path data - calculated by scrawl from the data attribute
@property dataSet
@type Array
@default false
@private
**/
		dataSet: false,
/**
Drawing flag - when set to true, will treat the first drawing (not positioning) data point as the start point

Generally this is set automatically as part of an outline factory function
@property isLine
@type Boolean
@default true
**/
		isLine: true,
/**
Outline sprite default method attribute is 'draw', not 'fill'
@property method
@type String
@default 'draw'
**/
		method: 'draw',
		};
	scrawl.mergeInto(scrawl.d.Outline, scrawl.d.Sprite);

/**
Overrides Sprite.set()

Allows users to:
* set a sprite's Context object's values via the sprite
* shift a sprite between groups
* add a sprite to a Cell object's fence or field group (Cell collision map generation)
* reset and recalculate collision point data
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Outline.prototype.set = function(items){
		Sprite.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.data)){
			this.dataSet = this.buildDataSet(this.data);
			delete this.offset;
			}
		return this;
		};

/**
Calculates the pixels value of the object's handle attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	Outline.prototype.getPivotOffsetVector = function(){
		return Shape.prototype.getPivotOffsetVector.call(this);
		}

/**
Constructor, clone and set helper function

Create native path data from data attribute String

@method buildDataSet
@param {String} d Path string
@return Native path data
@private
**/
	Outline.prototype.buildDataSet = function(d){
		var	myData = [], 
			command, 
			points, 
			minX = 999999, 
			minY = 999999, 
			maxX = -999999, 
			maxY = -999999, 
			curX = this.start.x, 
			curY = this.start.y,
			set = d.match(/([A-Za-z][0-9. ,\-]*)/g),
			checkMaxMin = function(cx,cy){
				minX = (minX > cx) ? cx : minX;
				minY = (minY > cy) ? cy : minY;
				maxX = (maxX < cx) ? cx : maxX;
				maxY = (maxY < cy) ? cy : maxY;
				};
		for(var i=0,z=set.length; i<z; i++){
			command = set[i][0];
			points = set[i].match(/(-?[0-9.]+\b)/g);
			if(points){
				for(var j=0, w=points.length; j<w; j++){
					points[j] = parseFloat(points[j]);
					}
				switch(command){
					case 'H' :
						for(var j=0, w=points.length; j<w; j++){
							curX = points[j];								checkMaxMin(curX,curY);
							}
						break;
					case 'V' :
						for(var j=0, w=points.length; j<w; j++){
													curY = points[j];		checkMaxMin(curX,curY);
							}
						break;
					case 'M' :
						for(var j=0, w=points.length; j<w; j+=2){
							curX = points[j];		curY = points[j+1];		checkMaxMin(curX,curY);
							}
					case 'L' :
					case 'T' :
						for(var j=0, w=points.length; j<w; j+=2){
							curX = points[j];		curY = points[j+1];		checkMaxMin(curX,curY);
							}
						break;
					case 'Q' :
					case 'S' :
						for(var j=0, w=points.length; j<w; j+=4){
							curX = points[j+2]; 	curY = points[j+3];		checkMaxMin(curX,curY);
							}
						break;
					case 'C' :
						for(var j=0, w=points.length; j<w; j+=6){
							curX = points[j+4];		curY = points[j+5];		checkMaxMin(curX,curY);
							}
						break;
					case 'h' :
						for(var j=0, w=points.length; j<w; j++){
							curX += points[j];								checkMaxMin(curX,curY);
							}
						break;
					case 'v' :
						for(var j=0, w=points.length; j<w; j++){
													curY += points[j];		checkMaxMin(curX,curY);
							}
						break;
					case 'm' :
					case 'l' :
					case 't' :
						for(var j=0, w=points.length; j<w; j+=2){
							curX += points[j];		curY += points[j+1];	checkMaxMin(curX,curY);
							}
						break;
					case 'q' :
					case 's' :
						for(var j=0, w=points.length; j<w; j+=4){
							curX += points[j+2];	curY += points[j+3];	checkMaxMin(curX,curY);
							}
						break;
					case 'c' :
						for(var j=0, w=points.length; j<w; j+=6){
							curX += points[j+4];	curY += points[j+5];	checkMaxMin(curX,curY);
							}
						break;
					}
				}
			myData.push({c: command, p: points});
			}
		for(var i=0, z=myData.length; i<z; i++){
			if(scrawl.contains(['M','L','C','Q','S','T'], myData[i].c)){
				for(var j=0, w=myData[i].p.length; j<w; j+=2){
					myData[i].p[j] -= minX;
					myData[i].p[j+1] -= minY;
					}
				}
			if(myData[i].c === 'H'){
				for(var j=0, w=myData[i].p.length; j<w; j++){
					myData[i].p[j] -= minX;
					}
				}
			if(myData[i].c === 'V'){
				for(var j=0, w=myData[i].p.length; j<w; j++){
					myData[i].p[j] -= minY;
					}
				}
			}
		this.width = maxX - minX;
		this.height = maxY - minY;
		return myData;
		};

/**
Helper function - define the sprite's path on the &lt;canvas&gt; element's context engine
@method doOutline
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Outline.prototype.doOutline = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		if(!this.dataSet && this.data){
			this.buildDataSet(this.data);
			}
		if(this.dataSet){
			var here = this.prepareStamp(),
				currentX = 0,
				currentY = 0,
				reflectX = 0,
				reflectY = 0,
				d, 
				tempX, 
				tempY;
			this.rotateCell(ctx);
			ctx.translate(here.x,here.y);
			ctx.beginPath();
			if(!scrawl.contains(['M'], this.dataSet[0].c)){
				ctx.moveTo(currentX,currentY);
				}
			for(var i=0, z=this.dataSet.length; i<z; i++){
				d = this.dataSet[i];
				switch(d.c){
					case 'M' :
						currentX = d.p[0], currentY = d.p[1];
						reflectX = currentX, reflectY = currentY;
						ctx.moveTo((currentX * this.scale),(currentY * this.scale));
						for(var k=2, v=d.p.length; k<v; k+=2){
							currentX = d.p[k], currentY = d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'm' :
						currentX += d.p[0], currentY += d.p[1];
						reflectX = currentX, reflectY = currentY;
						ctx.moveTo((currentX * this.scale),(currentY * this.scale));
						for(var k=2, v=d.p.length; k<v; k+=2){
							currentX += d.p[k], currentY += d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'Z' :
					case 'z' :
						ctx.closePath();
						break;
					case 'L' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							currentX = d.p[k], currentY = d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'l' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							currentX += d.p[k], currentY += d.p[k+1];
							reflectX = currentX, reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'H' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentX = d.p[k];
							reflectX = currentX;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'h' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentX += d.p[k];
							reflectX = currentX;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'V' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentY = d.p[k];
							reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'v' :
						for(var k=0, v=d.p.length; k<v; k++){
							currentY += d.p[k];
							reflectY = currentY;
							ctx.lineTo((currentX * this.scale),(currentY * this.scale));
							}
						break;
					case 'C' :
						for(var k=0, v=d.p.length; k<v; k+=6){
							ctx.bezierCurveTo((d.p[k] * this.scale),(d.p[k+1] * this.scale),(d.p[k+2] * this.scale),(d.p[k+3] * this.scale),(d.p[k+4] * this.scale),(d.p[k+5] * this.scale));
							reflectX = d.p[k+2], reflectY = d.p[k+3];
							currentX = d.p[k+4], currentY = d.p[k+5];
							}
						break;
					case 'c' :
						for(var k=0, v=d.p.length; k<v; k+=6){
							ctx.bezierCurveTo(((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale),((currentX+d.p[k+2]) * this.scale),((currentY+d.p[k+3]) * this.scale),((currentX+d.p[k+4]) * this.scale),((currentY+d.p[k+5]) * this.scale));
							reflectX = currentX + d.p[k+2];
							reflectY = currentY + d.p[k+3];
							currentX += d.p[k+4], currentY += d.p[k+5];
							}
						break;
					case 'S' :
						for(var k=0, v=d.p.length; k<v; k+=4){
							if(i>0 && scrawl.contains(['C','c','S','s'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.bezierCurveTo((tempX * this.scale),(tempY * this.scale),(d.p[k] * this.scale),(d.p[k+1] * this.scale),(d.p[k+2] * this.scale),(d.p[k+3] * this.scale));
							reflectX = d.p[k], reflectY = d.p[k+1];
							currentX = d.p[k+2], currentY = d.p[k+3];
							}
						break;
					case 's' :
						for(var k=0, v=d.p.length; k<v; k+=4){
							if(i>0 && scrawl.contains(['C','c','S','s'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.bezierCurveTo((tempX * this.scale),(tempY * this.scale),((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale),((currentX+d.p[k+2]) * this.scale),((currentY+d.p[k+3]) * this.scale));
							reflectX = currentX + d.p[k], reflectY = currentY + d.p[k+1];
							currentX += d.p[k+2], currentY += d.p[k+3];
							}
						break;
					case 'Q' :
						for(var k=0,v=d.p.length;k<v;k+=4){
							ctx.quadraticCurveTo((d.p[k] * this.scale),(d.p[k+1] * this.scale),(d.p[k+2] * this.scale),(d.p[k+3] * this.scale));
							reflectX = d.p[k], reflectY = d.p[k+1];
							currentX = d.p[k+2], currentY = d.p[k+3];
							}
						break;
					case 'q' :
						for(var k=0,v=d.p.length;k<v;k+=4){
							ctx.quadraticCurveTo(((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale),((currentX+d.p[k+2]) * this.scale),((currentY+d.p[k+3]) * this.scale));
							reflectX = currentX + d.p[k];
							reflectY = currentY + d.p[k+1];
							currentX += d.p[k+2], currentY += d.p[k+3];
							}
						break;
					case 'T' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							if(i>0 && scrawl.contains(['Q','q','T','t'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.quadraticCurveTo((tempX * this.scale),(tempY * this.scale),(d.p[k] * this.scale),(d.p[k+1] * this.scale));
							reflectX = tempX, reflectY = tempY;
							currentX = d.p[k], currentY = d.p[k+1];
							}
						break;
					case 't' :
						for(var k=0, v=d.p.length; k<v; k+=2){
							if(i>0 && scrawl.contains(['Q','q','T','t'], this.dataSet[i-1].c)){
								tempX = currentX + (currentX - reflectX);
								tempY = currentY + (currentY - reflectY);
								}
							else{tempX = currentX; tempY = currentY;}
							ctx.quadraticCurveTo((tempX * this.scale),(tempY * this.scale),((currentX+d.p[k]) * this.scale),((currentY+d.p[k+1]) * this.scale));
							reflectX = tempX, reflectY = tempY;
							currentX += d.p[k], currentY += d.p[k+1];
							}
						break;
					}
				}
			}
		return this;
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
	Outline.prototype.clip = function(ctx, cell){
		ctx.save();
		this.doOutline(ctx);
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
	Outline.prototype.clear = function(ctx, cell){
		var c = scrawl.cell[cell];
		this.clip(ctx, cell);
		ctx.clearRect(0, 0, c.get('actualWidth'), c.get('.actualHeight'));
		ctx.restore();
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
	Outline.prototype.clearWithBackground = function(ctx, cell){
		var c = scrawl.cell[cell];
		this.clip(ctx, cell);
		ctx.fillStyle = c.backgroundColor;
		ctx.fillRect(0, 0, c.get('actualWidth'), c.get('actualHeight'));
		ctx.fillStyle = scrawl.ctx[cell].get('fillStyle');
		ctx.restore();
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
	Outline.prototype.draw = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.stroke();
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
	Outline.prototype.fill = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.fill(scrawl.ctx[this.context].get('winding'));
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
	Outline.prototype.drawFill = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.stroke();
		this.clearShadow(ctx, cell);
		ctx.fill(scrawl.ctx[this.context].get('winding'));
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
	Outline.prototype.fillDraw = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.fill(scrawl.ctx[this.context].get('winding'));
		this.clearShadow(ctx, cell);
		ctx.stroke();
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
	Outline.prototype.sinkInto = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.fill(scrawl.ctx[this.context].get('winding'));
		ctx.stroke();
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
	Outline.prototype.floatOver = function(ctx, cell){
		this.doOutline(ctx, cell);
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].get('winding'));
		return this;
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
	Outline.prototype.checkHit = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var	pad = scrawl.pad[scrawl.currentPad], 
			cell = scrawl.cell[pad.current].name,
			ctx = scrawl.context[pad.current],
			tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}],
			result = false;
		this.doOutline(ctx, cell);
		for(var i=0, z=tests.length; i<z; i++){
			result = ctx.isPointInPath(tests[i].x, tests[i].y);
			if(result){
				break;
				}
			}
		return (result) ? tests[i] : false;
		};

/**
# Shape
	
## Instantiation

* scrawl.makeLine() - straight lines
* scrawl.makeBezier() - cubic bezier curves
* scrawl.makeEllipse() - ellipses and circles
* scrawl.makeQuadratic() - quadratic bezier curves
* scrawl.makeRectangle() - for rectangles with rounded corners
* scrawl.makeRegularShape() - triangles, pentangles (stars), pentagons, etc
* scrawl.makePath() - Irregular, path-based shapes

## Purpose

* Defines a sprite composed of lines, quadratic and bezier curves, etc
* Makes use of, but doesn't contain, Point and Link objects to define the sprite
* Can be used as a path for placing and animating other sprites
* Point objects can be used as pivots by other sprites

@class Shape
@constructor
@extends Sprite
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Shape(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Sprite.call(this, items);
		SubScrawl.prototype.set.call(this, items);
		this.isLine = (scrawl.isa(items.isLine,'bool')) ? items.isLine : true;
		this.linkList = [];
		this.linkDurations = [];
		this.pointList = [];
		this.registerInLibrary();
		scrawl.pushUnique(scrawl.group[this.group].sprites, this.name);
		return this;
		}
	Shape.prototype = Object.create(Sprite.prototype);
/**
@property type
@type String
@default 'Shape'
@final
**/		
	Shape.prototype.type = 'Shape';
	Shape.prototype.classname = 'spritenames';
	scrawl.d.Shape = {
/**
POINTNAME of the Point object that commences the drawing operation

Set automatically by Shape creation factory functions
@property firstPoint
@type String
@default ''
@private
**/
		firstPoint: '',
/**
Drawing flag - when set to true, will treat the first drawing (not positioning) data point as the start point

Generally this is set automatically as part of an outline factory function
@property isLine
@type Boolean
@default true
**/
		isLine: true,
/**
Drawing flag - when true, path will be closed

_Note: this attribute must be set to true for those drawing methods that use a fill flood as part of their operation
@property closed
@type Boolean
@default true
**/
		closed: true,
		radius: false,
/**
Array of LINKNAME Strings for Link objects associated with this Shape sprite
@property linkList
@type Array
@default []
@private
**/
		linkList: [],
/**
Array of length (Number) values for each Link object associated with this Shape sprite
@property linkDurations
@type Array
@default []
@private
**/
		linkDurations: [],
/**
Array of POINTNAME Strings for Point objects associated with this Shape sprite
@property pointList
@type Array
@default []
@private
**/
		pointList: [],
/**
Path length - calculated automatically by scrawl

_Note: this value will be affected by the value of the precision attribute - hiher precisions lead to more accurate perimeterLength values, particularly along curves_
@property perimeterLength
@type Number
@default 0
**/
		perimeterLength: 0,
/**
Shape marker sprites - SPRITENAME String of sprite used at start of the Shape's path
@property markStart
@type String
@default ''
**/
		markStart: '',
/**
Shape marker sprites - SPRITENAME String of sprite used at the line/curve joints along the Shape's path
@property markMid
@type String
@default ''
**/
		markMid: '',
/**
Shape marker sprites - SPRITENAME String of sprite used at end of the Shape's path
@property markEnd
@type String
@default ''
**/
		markEnd: '',
/**
Shape marker sprites - SPRITENAME String of sprite used as the fallback when markStart, markMid or markEnd attributes are not set
@property mark
@type String
@default ''
**/
		mark: '',
		width: 0,
		height: 0,
/**
Shape sprite default method attribute is 'draw', not 'fill'
@property method
@type String
@default 'draw'
**/
		method: 'draw',
/**
Set the iterations required for calculating path length and positioning data - higher figures (eg 100) ensure sprites will follow the path more accurately
@property precision
@type Number
@default 10
**/
		precision: 10,
		};
	scrawl.mergeInto(scrawl.d.Shape, scrawl.d.Sprite);

/**
Helper function - define the sprite's path on the &lt;canvas&gt; element's context engine
@method prepareShape
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Shape.prototype.prepareShape = function(ctx, cell){
		scrawl.cell[cell].setEngine(this);
		if(this.firstPoint){
			var here = this.prepareStamp();
			this.rotateCell(ctx);
			ctx.translate(here.x,here.y);
			ctx.beginPath();
			scrawl.link[scrawl.point[this.firstPoint].startLink].sketch(ctx);
			}
		return this;
		};

/**
Calculates the pixels value of the object's handle attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite drawing should start
@private
**/
	Shape.prototype.getPivotOffsetVector = function(){
		if(this.isLine){
			return Sprite.prototype.getPivotOffsetVector.call(this);
			}
		else{
			var result = this.handle.getVector();
			if((scrawl.isa(this.handle.x,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.x)){
				result.x = ((parseFloat(this.handle.x)/100) * this.width)  - (this.width/2);
				}
			else{
				switch (this.handle.x){
					case 'left' : result.x = -(this.width/2); break;
					case 'center' : result.x = 0; break;
					case 'right' : result.x = this.width/2; break;
					}
				}
			if((scrawl.isa(this.handle.y,'str')) && !scrawl.contains(['left','center','right','top','bottom'], this.handle.y)){
				result.y = ((parseFloat(this.handle.y)/100) * this.height) - (this.height/2);
				}
			else{
				switch (this.handle.y){
					case 'top' : result.y = -(this.height/2); break;
					case 'center' : result.y = 0; break;
					case 'bottom' : result.y = this.height/2; break;
					}
				}
			return result;
			}
		};

/**
Display helper function

Stamp mark sprites onto Shape path

@method stampMark
@param {Sprite} sprite Sprite object to be stamped
@param {Number} pos Path position (between 0 and 1)
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Shape.prototype.stampMark = function(sprite, pos, ctx, cell){
		var	tPath,
			tPathPosition,
			tGroup,
			tPivot,
			tHandle,
			links,
			link,
			point;
		if(pos === 'mid'){
			links = this.get('linkList');
			tPivot = sprite.pivot;
			tGroup = sprite.group;
			tHandle = sprite.handle;
			for(var i=0, z=links.length; i<z; i++){
				link = scrawl.link[links[i]];
				point = scrawl.point[link.get('endPoint')];
				if(scrawl.xt(point) && scrawl.contains(['move','add'], link.get('action'))){
					sprite.set({
						pivot: point.name,
						group: cell,
						handle: this.handle,
						}).forceStamp();
					}
				}
			sprite.set({
				pivot: tPivot,
				group: tGroup,
				handle: tHandle,
				});
			}
		else{
			tPath = sprite.path;
			tPathPosition = sprite.pathPlace;
			tGroup = sprite.group;
			tHandle = sprite.handle;
			sprite.set({
				path: this.name,
				pathPlace: pos,
				group: cell,
				handle: this.handle,
				}).forceStamp();
			sprite.set({
				path: tPath,
				pathPlace: tPathPosition,
				group: tGroup,
				handle: tHandle,
				});
			}
		return this;
		};

/**
Display helper function

Prepare mark sprites for stamping onto Shape path

@method addMarks
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Shape.prototype.addMarks = function(ctx, cell){
		var mark = this.get('mark'),
			markStart = this.get('markStart'),
			markMid = this.get('markMid'),
			markEnd = this.get('markEnd'),
			myMark = false,
			sprite,
			linkDurations;
		if(mark || markStart || markMid || markEnd){
			this.buildPositions();
			linkDurations = this.get('linkDurations');
			myMark = markStart || mark || false;
			if(myMark && scrawl.contains(scrawl.spritenames, myMark)){
				this.stampMark(scrawl.sprite[myMark], 0, ctx, cell);
				}
			myMark = markMid || mark || false;
			if(myMark && scrawl.contains(scrawl.spritenames, myMark)){
				sprite = scrawl.sprite[myMark];
				for(var j=0, w=linkDurations.length-1; j<w; j++){
					this.stampMark(sprite, linkDurations[j], ctx, cell);
					}
				}
			myMark = markEnd || mark || false;
			if(myMark && scrawl.contains(scrawl.spritenames, myMark)){
				this.stampMark(scrawl.sprite[myMark], 1, ctx, cell);
				}
			}
		return this;
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
	Shape.prototype.clip = function(ctx, cell){
		if(this.closed){
			this.prepareShape(ctx, cell);
			ctx.clip();
			}
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
	Shape.prototype.clear = function(ctx, cell){
		this.prepareShape(ctx, cell);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].get('winding'));
		ctx.globalCompositeOperation = scrawl.ctx[cell].get('globalCompositeOperation');
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
	Shape.prototype.clearWithBackground = function(ctx, cell){
		var c = scrawl.cell[cell],
			bc = c.get('backgroundColor'),
			cx = scrawl.ctx[cell],
			fillStyle = cx.get('fillStyle'),
			strokeStyle = cx.get('strokeStyle'),
			ga = cx.get('globalAlpha');
		this.prepareShape(ctx, cell);
		ctx.fillStyle = bc;
		ctx.strokeStyle = bc;
		ctx.globalAlpha = 1;
		ctx.stroke();
		ctx.fill(scrawl.ctx[this.context].get('winding'));
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		ctx.globalAlpha = globalAlpha;
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
	Shape.prototype.fill = function(ctx, cell){
		if(this.get('closed')){
			this.prepareShape(ctx, cell);
			ctx.fill(scrawl.ctx[this.context].get('winding'));
			this.addMarks(ctx, cell);
			}
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
	Shape.prototype.draw = function(ctx, cell){
		this.prepareShape(ctx, cell);
		ctx.stroke();
		this.addMarks(ctx, cell);
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
	Shape.prototype.drawFill = function(ctx, cell){
		this.prepareShape(ctx, cell);
		ctx.stroke();
		if(this.get('closed')){
			this.clearShadow(ctx, cell);
			ctx.fill(scrawl.ctx[this.context].get('winding'));
			}
		this.addMarks(ctx, cell);
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
	Shape.prototype.fillDraw = function(ctx, cell){
		this.prepareShape(ctx, cell);
		if(this.get('closed')){
			ctx.fill(scrawl.ctx[this.context].get('winding'));
			this.clearShadow(ctx, cell);
			}
		ctx.stroke();
		this.addMarks(ctx, cell);
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
	Shape.prototype.sinkInto = function(ctx, cell){
		this.prepareShape(ctx, cell);
		if(this.get('closed')){
			ctx.fill(scrawl.ctx[this.context].get('winding'));
			}
		ctx.stroke();
		this.addMarks(ctx, cell);
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
	Shape.prototype.floatOver = function(ctx, cell){
		this.prepareShape(ctx, cell);
		ctx.stroke();
		if(this.get('closed')){
			ctx.fill(scrawl.ctx[this.context].get('winding'));
			}
		this.addMarks(ctx, cell);
		return this;
		};

/**
Stamp helper function - perform a 'none' method draw. This involves setting the &lt;canvas&gt; element's context engine's values with this sprite's context values and defining the sprites path, on the canvas, but not drawing (fill stroke) the sprite.
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	Shape.prototype.none = function(ctx, cell){
		this.prepareShape(ctx, cell);
		return this;
		};

/**
@method getFullPointList
@return Array containing POINTNAME Strings of all Point objects associated with this Shape object
**/
	Shape.prototype.getFullPointList = function(){
		var myPointList = [],
			search = new RegExp(this.name + '_.*');
		for(var i=0, z=scrawl.pointnames.length; i<z; i++){
			if(search.test(scrawl.pointnames[i])){
				myPointList.push(scrawl.pointnames[i]);
				}
			}
		return myPointList;
		};

/**
@method getFullLinkList
@return Array containing LINKNAME Strings of all Link objects associated with this Shape object
**/
	Shape.prototype.getFullLinkList = function(){
		var myLinkList = [],
			search = new RegExp(this.name + '_.*');
		for(var i=0, z=scrawl.linknames.length; i<z; i++){
			if(search.test(scrawl.linknames[i])){
				myLinkList.push(scrawl.linknames[i]);
				}
			}
		return myLinkList;
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
	Shape.prototype.checkHit = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var pad = scrawl.pad[items.pad] || scrawl.pad[scrawl.currentPad],
			cell = scrawl.cell[pad.current].name,
			ctx = scrawl.context[pad.current],
			tests = (scrawl.xt(items.tests)) ? items.tests : [{x: (items.x || false), y: (items.y || false)}],
			result = false,
			winding,
			closed = this.get('closed');
		this.prepareShape(ctx, cell);
		for(var i=0, z=tests.length; i<z; i++){
			result = ctx.isPointInPath(tests[i].x, tests[i].y);
			if(result){
				break;
				}
			}
		return (result) ? tests[i] : false;
		};

/**
Collision detection helper function

Parses the collisionPoints array to generate coordinate Vectors representing the sprite's collision points
@method buildCollisionVectors
@param {Array} [items] Array of collision point data
@return This
@chainable
@private
**/
	Shape.prototype.buildCollisionVectors = function(items){
		var	p = (scrawl.xt(items)) ? this.parseCollisionPoints(items) : this.collisionPoints,
			myAdvance,
			point,
			currentPos = 0;
		this.collisionVectors = [];
		for(var i=0, z=p.length; i<z; i++){
			if(scrawl.isa(p[i], 'num') && p[i] >= 0){
				if(p[i] > 1){
					//regular points along the path
					myAdvance = 1/p[i];
					for(var j=0; j<p[i]; j++){
						point = this.getPerimeterPosition(currentPos, true, false, true);
						this.collisionVectors.push(point);
						currentPos += myAdvance;
						}
					}
				else{
					//a point at a specific position on the path
					point = this.getPerimeterPosition(p[i], true, false, true);
					this.collisionVectors.push(point);
					}
				}
			else if(scrawl.isa(p[i], 'str')){
				switch(p[i]) {
					case 'start' : 	this.collisionVectors.push(new Vector()); break;
					}
				}
			else if(scrawl.isa(p[i], 'obj') && p[i].type === 'Vector'){
				this.collisionVectors.push(p[i]);
				}
			}
		return this;
		};

/**
Calculate and return Shape object's path length

Accuracy of returned value depends on the setting of the __precision__ attribute; lower precision is less accurate for curves
@method getPerimeterLength
@param {Boolean} [force] If set to true, forces a complete recalculation
@return Path length, in pixels
**/
	Shape.prototype.getPerimeterLength = function(force){
		if(force || !this.get('perimeterLength') || this.get('linkDurations').length === 0){
			this.buildPositions();
			}
		return this.get('perimeterLength');
		};

/**
Helper function - calculate the positions and lengths of the Shape's constituent Point and Link objects
@method buildPositions
@return This
@chainable
@private
**/
	Shape.prototype.buildPositions = function(){
		var linkList = this.get('linkList'),
			linkDurations = [],
			cumLen = 0, 
			len, 
			myLink,
			tPos;
		for(var i=0, z=linkList.length; i<z; i++){
			scrawl.link[linkList[i]].setPositions();
			}
		for(var i=0, z=linkList.length; i<z; i++){
			myLink = scrawl.link[linkList[i]];
			tPos = myLink.get('positions');
			len = tPos[tPos.length - 1].cumulativeLength;
			cumLen += len;
			linkDurations.push(cumLen);
			}
		for(var i=0, z=linkList.length; i<z; i++){
			linkDurations[i] /= cumLen;
			}
		Scrawl.prototype.set.call(this, {
			perimeterLength: cumLen,
			linkDurations: linkDurations,
			});
		return this;
		};

/**
Calculate coordinates of point at given distance along the Shape sprite's path
@method getPerimeterPosition
@param {Number} [val] Distance along path, between 0 (start) and 1 (end); default: 1
@param {Boolean} [steady] Steady flag - if true, return 'steady calculation' coordinates; otherwise return 'simple calculation' coordinates. Default: true
@param {Boolean} [roll] Roll flag - if true, return tangent angle (degrees) at that point along the path. Default: false
@param {Boolean} [local] Local flag - if true, return coordinate Vector relative to Sprite start parameter; otherwise return Cell coordinate Vector. Default: false
@return Vector coordinates
**/
	Shape.prototype.getPerimeterPosition = function(val, steady, roll, local){
		val = (scrawl.isa(val,'num')) ? val : 1;
		steady = (scrawl.isa(steady,'bool')) ? steady : true;
		roll = (scrawl.isa(roll,'num') && roll) ? true : roll;
		roll = (scrawl.isa(roll,'bool')) ? roll : false;
		local = (scrawl.isa(local,'bool')) ? local : false;
		var	myLink,
			linkVal,
			linkList,
			linkDurations,
			before,
			bVal,
			after,
			aVal,
			here,
			angle;
		this.getPerimeterLength();
		linkList = this.get('linkList')
		linkDurations = this.get('linkDurations');
		for(var i=0, z=linkList.length; i<z; i++){
			myLink = scrawl.link[linkList[i]];
			if(linkDurations[i] >= val){
				if(i === 0){
					linkVal = val/linkDurations[i];
					}
				else{
					linkVal = ((val-linkDurations[i-1])/(linkDurations[i]-linkDurations[i-1]));
					}
				linkVal = (linkVal < 0) ? 0 : ((linkVal > 1) ? 1 : linkVal);
				bVal = (linkVal-0.0000001 < 0) ? 0 : linkVal-0.0000001;
				aVal = (linkVal+0.0000001 > 1) ? 1 : linkVal+0.0000001;
				if(steady){
					if(roll){
						before = (local) ? myLink.getLocalSteadyPositionOnLink(bVal) : myLink.getSteadyPositionOnLink(bVal);
						after = (local) ? myLink.getLocalSteadyPositionOnLink(aVal) : myLink.getSteadyPositionOnLink(aVal);
						here = (local) ? myLink.getLocalSteadyPositionOnLink(linkVal) : myLink.getSteadyPositionOnLink(linkVal);
						angle = Math.atan2(after.y-before.y, after.x-before.x)/scrawl.radian;
						return {x:here.x, y:here.y, r:angle};
						}
					else{
						return (local) ? myLink.getLocalSteadyPositionOnLink(linkVal) : myLink.getSteadyPositionOnLink(linkVal);
						}
					}
				else{
					if(roll){
						before = (local) ? myLink.getLocalPositionOnLink(bVal) : myLink.getPositionOnLink(bVal);
						after = (local) ? myLink.getLocalPositionOnLink(aVal) : myLink.getPositionOnLink(aVal);
						here = (local) ? myLink.getLocalPositionOnLink(linkVal) : myLink.getPositionOnLink(linkVal);
						angle = Math.atan2(after.y-before.y, after.x-before.x)/scrawl.radian;
						return {x:here.x, y:here.y, r:angle};
						}
					else{
						return (local) ? myLink.getLocalPositionOnLink(linkVal) : myLink.getPositionOnLink(linkVal);
						}
					}
				}
			}
		return false;
		};

/**
# Point
	
## Instantiation

* Objects created via Shape factories
* scrawl.makeCartesianPoints() - deprecated
* scrawl.makePolarPoints() - deprecated

## Purpose

* Defines a movable point within a Shape sprite object
* Acts as a coordinate vector for Link drawing

Shape creation factories will all create Point objects automatically as part of the generation process. Point objects will be named regularly, depending on the factory:

* scrawl.makeLine(): SPRITENAME_p1 (start point), SPRITENAME_p2 (end point)
* scrawl.makeQuadratic(): SPRITENAME_p1 (start point), SPRITENAME_p2 (control point), SPRITENAME_p3 (end point)
* scrawl.makeBezier(): SPRITENAME_p1 (start point), SPRITENAME_p2 (first control point), SPRITENAME_p3 (second control point), SPRITENAME_p4 (end point)
* scrawl.makeRegularShape(): each angle point is numbered consecutively, starting at SPRITENAME_p1
* scrawl.makePath(): points are numbered consecutively, beginning from SPRITENAME_p1 at the start of the path; the end point of a line, quadratic curve or bezier curve will also act as the start point for the next line or curve
@class Point
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Point(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		var local = (scrawl.xt(items.local)) ? items.local : {};
		this.sprite = items.sprite || '';
		this.local = items.local || new Vector({
			x: items.startX || items.currentX || local.x || 0,
			y: items.startY || items.currentY || local.y || 0,
			});
		this.startLink = items.startLink || '';
		this.fixed = items.fixed || false;
		if(scrawl.xto([items.angle,items.distance])){
			this.setPolar(items);
			}
		scrawl.point[this.name] = this;
		scrawl.pushUnique(scrawl.pointnames, this.name);
		if(this.sprite && scrawl.sprite[this.sprite].type === 'Shape'){
			scrawl.pushUnique(scrawl.sprite[this.sprite].pointList, this.name);
			}
		return this;
		}
	Point.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Point'
@final
**/		
	Point.prototype.type = 'Point';
	Point.prototype.classname = 'pointnames';
	scrawl.d.Point = {
/**
SPRITENAME String of point object's parent sprite
@property sprite
@type String
@default ''
**/
		sprite: '',
/**
Point's coordinate Vector - generally the Vector marks the Point's position (in pixels) from the Parent sprite's start coordinates, though this can be changed by setting the __fixed__ attribute to true.

The following argument attributes can be used to initialize, set and get this attribute's component values:

* __startX__ or __currentX__ to set the x coordinate value
* __startY__ or __currentY__ to set the y coordinate value
@property local
@type Vector
@default zero value Vector
**/
		local: new Vector(),
/**
LINKNAME of Link object for which this Point acts as the start coordinate; generated automatically by the Shape creation factory functions
@property startLink
@type String
@default ''
@private
**/
		startLink: '',
/**
Fixed attribute is used to fix the Point to a specific Cell coordinate Vector (true), or to a Sprite start Vector (SPRITENAME). Default action is to treat the Point as local to its parent Sprite's start coordinate
@property fixed
@type Boolean
@default false
**/
		fixed: false,
		};
	scrawl.mergeInto(scrawl.d.Point, scrawl.d.Scrawl);

/**
Overrides Scrawl.set(), to allow users to set the local attributes using startX, startY, currentX, currentY, distance, angle
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Point.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		var local = (scrawl.xt(items.local)) ? items.local : {};
		if(scrawl.xto([items.distance, items.angle])){
			this.setPolar(items);
			}
		else if(scrawl.xto([items.startX, items.startY, items.currentX, items.currentY, items.local])){
			this.local.x = (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(items.currentX)) ? items.currentX : ((scrawl.xt(local.x)) ? local.x : this.local.x));
			this.local.y = (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(items.currentY)) ? items.currentY : ((scrawl.xt(local.y)) ? local.y : this.local.y));
			}
		return this;
		};
 
/**
Add values to the local attribute. Permitted attributes of the argument object include:

* __startX__, __currentX__ - added to _local.x
* __startY__, __currentY__ - added to _local.y
* __distance__ - recalculates the _local_ vector to set its values to equal vector's current magnitude + distance (in pixels)
* __angle__ - recalculates the _local_ vector to rotate it by the angle value (in degrees)
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Point.prototype.setDelta = function(items){
		var m,
			d, 
			a,
			local = (scrawl.xt(items.local)) ? items.local : {};
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xto([items.startX,items.startY,items.currentX,items.currentY, items.local])){
			this.local.x += (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(items.currentX)) ? items.currentX : ((scrawl.xt(local.x)) ? local.x : 0));
			this.local.y += (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(items.currentY)) ? items.currentY : ((scrawl.xt(local.y)) ? local.y : 0));
			}
		if(scrawl.xt(items.distance)){
			m = this.local.getMagnitude()
			this.local.scalarMultiply((items.distance + m)/m);
			}
		if(scrawl.xt(items.angle)){
			d = this.local.getMagnitude();
			a = Math.atan2(this.local.y, this.local.x);
			a += (items.angle * scrawl.radian);
			this.local.x = d * Math.cos(a);
			this.local.y = d * Math.sin(a);
			}
		return this;
		};

/**
Sets the local attribute using angle and/or distance parameters:

* __distance__ - calculates the _local_ vector to set its values to equal vector's current magnitude + distance (in pixels)
* __angle__ - calculates the _local_ vector to rotate it by the angle value (in degrees)
@method setPolar
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Point.prototype.setPolar = function(items){
		var m,
			d,
			a;
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xta([items.distance,items.angle])){
			a = items.angle * scrawl.radian;
			this.local.x = items.distance * Math.cos(a);
			this.local.y = items.distance * Math.sin(a);
			}
		else{
			if(scrawl.xt(items.distance)){
				m = this.local.getMagnitude();
				m = (scrawl.xt(m) && m > 0.0000001) ? m : 1;
				this.local.scalarMultiply(items.distance/m);
				}
			if(scrawl.xt(items.angle)){
				d = this.local.getMagnitude();
				a = items.angle * scrawl.radian;
				this.local.x = d * Math.cos(a);
				this.local.y = d * Math.sin(a);
				}
			}
		return this;
		};

/**
Retrieve Point object's coordinates, together with additional data

* Coordinate reference frame determined by the value of Point.local
* Coordinate values determined by setting of Point.fixed, Point.local and the parent Shape object's position and settings

Return object has the following attributes:

* __name__ - Point.name
* __current__ - coordinate Vector
* __startLink__ - Point.startLink

@method getData
@return Result object
@private
**/
	Point.prototype.getData = function(){
		var c,
			s = scrawl.sprite[this.sprite],
			myPivot,
			d,
			fixed = this.fixed,
			scale = s.scale;
		if(scrawl.xt(this.local) && this.local.type === 'Vector'){
			c = this.local.getVector();
			if(scrawl.isa(fixed,'str') && (scrawl.contains(scrawl.spritenames, fixed) || scrawl.contains(scrawl.pointnames, fixed))){
				myPivot = scrawl.sprite[fixed] || scrawl.point[fixed];
				if(myPivot.type === 'Point'){
					c = myPivot.local.getVector().scalarMultiply(scale || 1);
					}
				else{
					c = (myPivot.type === 'Particle') ? myPivot.get('position') : myPivot.start.getVector();
					}
				}
			else if(!fixed){
				c.scalarMultiply(scale || 1);
				}
			else{
				d = (c.getMagnitude() !== 0) ? s.start.getVector() : new Vector();
				c.vectorSubtract(d);
				c.scalarMultiply(scale || 1);
				c.rotate(-s.roll);
				}
			return {
				name: this.name,
				current: c,
				startLink: this.startLink,
				};
			}
		return false;
		};

/**
Retrieve Point object's coordinates

* Coordinate reference frame determined by the value of Point.local
* Coordinate values determined by setting of Point.fixed, Point.local and the parent Shape object's position and settings
@method getCurrentCoordinates
@return Coordinate Vector
**/
	Point.prototype.getCurrentCoordinates = function(){
		return this.getData().current;
		};

/**
Set Point.fixed attribute
@method setToFixed
@param {Mixed} items - either a coordinate Vector; or an Object with x and y attributes; or a Number representing the horizontal coordinate, in pixels, from &lt;canvas&gt; element's left edge; or a pivot SPRITENAME, POINTNAME or PARTICLENAME String
@param {Number} [y] - vertical coordinate, in pixels, from &lt;canvas&gt; element's top edge
@return This
@chainable
**/
	Point.prototype.setToFixed = function(items, y){
		var myX,
			myY;
		if(scrawl.isa(items,'str')){
			this.fixed = items;
			}
		else{
			myX = (scrawl.isa(items,'obj') && scrawl.xt(items.x)) ? items.x : ((scrawl.isa(items,'num')) ? items : 0);
			myY = (scrawl.isa(items,'obj') && scrawl.xt(items.y)) ? items.y : ((scrawl.isa(y,'num')) ? y : 0);
			this.local.set({
				x: myX,
				y: myY,
				});
			this.fixed = true;
			}
		return this;
		};

/**
# Link
	
## Instantiation

* Objects created via Shape factories

## Purpose

* Defines the type of line to be drawn between two Point objects
* Can be of the form (species): line, bezier, quadratic
* Posesses actions: 'add', 'move' (to not draw a line), 'close' (end Point is Shape object's startPoint), 'end' (for non-closed Shape objects)
* Makes use of additional control points to determine curves

@class Link
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
@private
**/		
	function Link(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		Scrawl.prototype.set.call(this, items);
		this.startPoint = items.startPoint || scrawl.d.Link.startPoint;
		this.sprite = (scrawl.xt(scrawl.point[this.startPoint])) ? scrawl.point[this.startPoint].sprite : scrawl.d.Link.sprite;
		this.endPoint = items.endPoint || scrawl.d.Link.endPoint;
		this.species = items.species || scrawl.d.Link.species;
		this.action = items.action || scrawl.d.Link.action;
		scrawl.link[this.name] = this;
		scrawl.pushUnique(scrawl.linknames, this.name);
		this.setPositions();
		if(this.startPoint && this.sprite && this.action === 'add'){
			scrawl.pushUnique(scrawl.sprite[this.sprite].linkList, this.name);
			}
		return this;
		}
	Link.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Link'
@final
**/		
	Link.prototype.type = 'Link';
	Link.prototype.classname = 'linknames';
	scrawl.d.Link = {
/**
Type of link - permitted values include: 'line', 'quadratic', 'bezier'
@property species
@type String
@default ''
**/
		species: '',
/**
POINTNAME of start Point object - used by line, quadratic and bezier links
@property startPoint
@type String
@default ''
**/
		startPoint: '',
/**
SPRITENAME of this Link's parent sprite object
@property sprite
@type String
@default ''
**/
		sprite: '',
/**
POINTNAME of end Point object - used by line, quadratic and bezier links
@property endPoint
@type String
@default ''
**/
		endPoint: '',
/**
POINTNAME of first control Point object - used by quadratic and bezier links
@property controlPoint1
@type String
@default ''
**/
		controlPoint1: '',
/**
POINTNAME of second control Point object - used by bezier links
@property controlPoint2
@type String
@default ''
**/
		controlPoint2: '',
/**
Link object's action - permitted values include: 'add', 'move', 'close', 'end'
@property startLink
@type String
@default 'add'
**/
		action: 'add',
/**
Link length - this value will be affected by the value of the parent Sprite object's __precision__ attribute
@property length
@type Number
@default 0
@private
**/
		length: 0,
/**
Positions Array along the length of the Link's path - these values will be affected by the value of the parent Sprite object's __precision__ attribute
@property positions
@type Array
@default []
@private
**/
		positions: [],
		};
	scrawl.mergeInto(scrawl.d.Link, scrawl.d.Scrawl);

/**
Overrides Scrawl.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Link.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.isa(items.sprite,'str') && items.sprite !== this.sprite && this.sprite){
			scrawl.removeItem(scrawl.sprite[this.sprite].linkList, this.name);
			}
		if(scrawl.isa(items.action,'str') && this.sprite && scrawl.contains(scrawl.spritenames, this.sprite)){
			if(items.action === 'add'){
				scrawl.pushUnique(scrawl.sprite[this.sprite].linkList, this.name);
				}
			else{
				scrawl.removeItem(scrawl.sprite[this.sprite].linkList, this.name);
				}
			}
		return this;
		};

/**
Position calculation helper function
@method pointOnLine
@param {Point} origin Start Point for calculation
@param {Point} destination End Point for calculation
@param {Number} val Distance between start and end points, where 0 = start and 1 = end
@return Coordinate Vector
@private
**/
	Link.prototype.pointOnLine = function(origin, destination, val){
		if(origin && destination && scrawl.isa(val,'num')){
			var a = destination.getVectorSubtract(origin),
				b = a.getScalarMultiply(val),
				c = b.getVectorAdd(origin);
			return c;
			}
		return false;
		};

/**
Position calculation helper function

Result Object contains the following attributes:

* __start__ - Link.start Point object's local Vector
* __end__ - Link.end Point object's local Vector
* __control1__ - Link.controlPoint1 Point object's local Vector
* __control2__ - Link.controlPoint2 Point object's local Vector
@method getPointCoordinates
@return Result Object
@private
**/
	Link.prototype.getPointCoordinates = function(){
		var result = {
			start: (this.startPoint) ? scrawl.point[this.startPoint].getCurrentCoordinates() : new Vector(),
			end: (this.endPoint) ? scrawl.point[this.endPoint].getCurrentCoordinates() : new Vector(),
			};
		if(scrawl.contains(['quadratic', 'bezier'], this.species)){
			result.control1 = (this.controlPoint1) ? scrawl.point[this.controlPoint1].getCurrentCoordinates() : new Vector();
			if(this.species === 'bezier'){
				result.control2 = (this.controlPoint2) ? scrawl.point[this.controlPoint2].getCurrentCoordinates() : new Vector();
				}
			}
		return result;
		};

/**
Position calculation helper function
@method getLocalPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
	Link.prototype.getLocalPositionOnLink = function(val){
		val = (scrawl.isa(val,'num')) ? val : 1;
		var pts = this.getPointCoordinates(),
			mid1,
			mid2, 
			fst1, 
			fst2, 
			fst3, 
			sec1, 
			sec2,
			result;
		switch(this.species){
			case 'line':
				result = this.pointOnLine(pts.start, pts.end, val);
				break;
			case 'quadratic':
				mid1 = this.pointOnLine(pts.start, pts.control1, val);
				mid2 = this.pointOnLine(pts.control1, pts.end, val);
				result = this.pointOnLine(mid1, mid2, val);
				break;
			case 'bezier':
				fst1 = this.pointOnLine(pts.start, pts.control1, val);
				fst2 = this.pointOnLine(pts.control1, pts.control2, val);
				fst3 = this.pointOnLine(pts.control2, pts.end, val);
				sec1 = this.pointOnLine(fst1, fst2, val);
				sec2 = this.pointOnLine(fst2, fst3, val);
				result = this.pointOnLine(sec1, sec2, val);
				break;
			default: 
				result = pts.end || pts.start || new Vector();
			}
		return result;
		};

/**
Position calculation helper function
@method getPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
	Link.prototype.getPositionOnLink = function(val){
		var mySprite = scrawl.sprite[this.sprite],
			scale = mySprite.scale,
			roll = mySprite.roll,
			result;
		if(scrawl.isa(val,'num')){
			result = this.getLocalPositionOnLink(val);
			return result.scalarMultiply(scale).rotate(roll).vectorAdd(mySprite.start);
			}
		return false;
		};

/**
Position calculation helper function
@method getLocalSteadyPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
	Link.prototype.getLocalSteadyPositionOnLink = function(val){
		val = (scrawl.isa(val,'num')) ? val : 1;
		var	s,
			d, 
			dPos,
			precision = scrawl.sprite[this.sprite].get('precision'),
			positions = this.positions,
			length = this.length,
			distance = length * val;
		distance = (distance > positions[precision].cumulativeLength) ? positions[precision].cumulativeLength : ((distance < 0) ? 0 : distance);
		for(var i=1; i<=precision; i++){
			if(distance <= positions[i].cumulativeLength){
				s = positions[i-1].p;
				d = positions[i].p.getVectorSubtract(s);
				dPos = (distance - positions[i-1].cumulativeLength)/positions[i].length;
				return d.scalarMultiply(dPos).vectorAdd(s);
				}
			}
		return false;
		};

/**
Position calculation helper function
@method getSteadyPositionOnLink
@param {Number} [val] - distance along link, where 0 = start and 1 = end
@return coordinate Vector
@private
**/
	Link.prototype.getSteadyPositionOnLink = function(val){
		var mySprite = scrawl.sprite[this.sprite],
			d = this.getLocalSteadyPositionOnLink(val);
			d.scalarMultiply(mySprite.scale).rotate(mySprite.roll).vectorAdd(mySprite.start);
		return d;
		};

/**
Returns length of Link, in pixels
@method getLength
@return Length, in pixels
**/
	Link.prototype.getLength = function(){
		this.setPositions();
		return this.length;
		};

/**
(re)Calculate the Link object's __positions__ array
@method setPositions
@param {Number} [val] - precision level for the calculation. Default: parent Shape object's precision value
@return This
@chainable
**/
	Link.prototype.setPositions = function(val){
		var pts = this.getPointCoordinates(),
			precision = (scrawl.isa(val,'num') && val>0) ? val : (scrawl.sprite[this.sprite].get('precision')),
			step = 1/precision, 
			pos, 
			here, 
			vHere, 
			dist, 
			d,
			cumLen = 0,
			cur = pts.start.getVector(),
			sprite = scrawl.sprite[this.sprite],
			temp = sprite.roll;
		this.positions = [];
		this.positions.push({
			p: cur.getVector(),
			length: 0,
			cumulativeLength: cumLen,
			});
		sprite.set({roll: 0,});
		for(var i=0; i<precision; i++){
			pos = step * (i + 1);
			here = this.getPositionOnLink(pos);
			here.vectorSubtract(sprite.start);
			vHere = here.getVector();
			dist = here.vectorSubtract(cur).getMagnitude();
			cur = vHere;
			cumLen += dist;
			this.positions.push({
				p: cur.getVector(),
				length: dist,
				cumulativeLength: cumLen,
				});
			}
		this.length = this.positions[precision].cumulativeLength;
		sprite.roll = temp;
		return this;
		};

/**
Shape object drawing helper function

_Note: this function is recursive_

@method sketch
@param {Object} ctx Sprite Cell's &lt;canvas&gt; element's context engine Object
@return True (eventually)
@private
**/
	Link.prototype.sketch = function(ctx){
		var myEnd, 
			myCon1, 
			myCon2,
			myResult;
		switch(this.action){
			case 'close' :
				ctx.closePath();
				break;
			case 'move' :
				try{
					myEnd = scrawl.point[this.endPoint].getData();
					ctx.moveTo(
						myEnd.current.x, 
						myEnd.current.y
						);
					}
				catch(e){
					return true;
					}
				break;
			case 'add' :
				try{
					switch(this.species){
						case 'line' :
							myEnd = scrawl.point[this.endPoint].getData();
							ctx.lineTo(
								myEnd.current.x, 
								myEnd.current.y
								);
							break;
						case 'quadratic' :
							myCon1 = scrawl.point[this.get('controlPoint1')].getData();
							myEnd = scrawl.point[this.endPoint].getData();
							ctx.quadraticCurveTo(
								myCon1.current.x, 
								myCon1.current.y,
								myEnd.current.x, 
								myEnd.current.y
								);
							break;
						case 'bezier' :
							myCon1 = scrawl.point[this.get('controlPoint1')].getData();
							myCon2 = scrawl.point[this.get('controlPoint2')].getData();
							myEnd = scrawl.point[this.endPoint].getData();
							ctx.bezierCurveTo(
								myCon1.current.x, 
								myCon1.current.y,
								myCon2.current.x, 
								myCon2.current.y,
								myEnd.current.x, 
								myEnd.current.y
								);
							break;
						default : 
							return true;
						}
					}
				catch(e){
					return true;
					}
				break;
			default :
				return true;
				break;
			}
		try{
			myResult = scrawl.link[scrawl.point[this.endPoint].startLink].sketch(ctx);
			}
		catch(e){
			return true;
			}
		return true;
		};
		
/**
# Design
	
## Instantiation

* This object should never be instantiated by users

## Purpose

* Defines gradients and radial gradients used with sprite objects' strokeStyle and fillStyle attributes

@class Design
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Design(items){
		Scrawl.call(this, items);
		return this;
		}
	Design.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Design'
@final
**/		
	Design.prototype.type = 'Design';
	Design.prototype.classname = 'designnames';
	scrawl.d.Design = {
/**
Array of JavaScript Objects representing color stop data

Objects take the form {color:String, stop:Number} where:

* __color__ attribute can be any legitimate CSS color string
* __stop can be any number between O and 0.999999 (not 1)
@property color
@type Array of JavaScript objects
@default [{color: 'black', stop: 0},{color: 'white', stop: 0.999999}]
**/
		color: [{color: 'black', stop: 0},{color: 'white', stop: 0.999999}],
/**
Drawing flag - when set to true, will use sprite-based 'range' coordinates to calculate the start and end points of the gradient; when false, will use Cell-based coordinates
@property setToSprite
@type Boolean
@default false
**/
		setToSprite: false,
/**
Defines the speed at which the gradient will animate; value should be between 0 and 1
@property roll
@type Number
@default 0
**/
		roll: 0,
/**
CELLNAME String of &lt;canvas&gt; element context engine on which the gradient has been set
@property cell
@type Number
@default 0
**/
		cell: '',
/**
Horizontal start coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property startX
@type Number
@default 0
**/
		startX: 0,
/**
Vertical start coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property startY
@type Number
@default 0
**/
		startY: 0,
/**
Horizontal end coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property endX
@type Number
@default 0
**/
		endX: 0,
/**
Vertical end coordinate, in pixels, from the top-left corner of the gradient's &lt;canvas&gt; element
@property endY
@type Number
@default 0
**/
		endY: 0,
/**
Horizontal start coordinate, measured as a percentage from the center of a sprite, with 0 representing the center and 1 the left edge
@property startRangeX
@type Number
@default 1
**/
		startRangeX: 1,
/**
Vertical start coordinate, measured as a percentage from the center of a sprite, with 0 representing the center and 1 the top edge
@property startRangeY
@type Number
@default 1
**/
		startRangeY: 1,
/**
Horizontal end coordinate, measured as a percentage from the center of a sprite, with 0 representing the center and 1 the right edge
@property endRangeX
@type Number
@default 1
**/
		endRangeX: 1,
/**
Vertical end coordinate, measured as a percentage from the center of a sprite, with 0 representing the center and 1 the bottom edge
@property endRangeY
@type Number
@default 1
**/
		endRangeY: 1,
/**
Drawing flag - when set to true, the gradient will recalculate its color stop values, taking into account the roll attribute's value, and reset itself on the &lt;canvas&gt; element's context engine
@property autoUpdate
@type Boolean
@default false
**/
		autoUpdate: false,
		};
	scrawl.mergeInto(scrawl.d.Design, scrawl.d.Scrawl);
 
/**
Add values to Number attributes
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Design.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var f = {};
		if(items.roll){f.roll = this.get('roll') + items.roll;}
		if(items.startX){f.startX = this.get('startX') + items.startX;}
		if(items.startY){f.startY = this.get('startY') + items.startY;}
		if(items.startRadius){f.startRadius = this.get('startRadius') + items.startRadius;}
		if(items.endX){f.endX = this.get('endX') + items.endX;}
		if(items.endY){f.endY = this.get('endY') + items.endY;}
		if(items.endRadius){f.endRadius = this.get('endRadius') + items.endRadius;}
		if(items.startRangeRadius){f.startRangeRadius = this.get('startRangeRadius') + items.startRangeRadius;}
		if(items.endRangeRadius){f.endRangeRadius = this.get('endRangeRadius') + items.endRangeRadius;}
		if(items.startRangeX){f.startRangeX = this.get('startRangeX') + items.startRangeX;}
		if(items.startRangeY){f.startRangeY = this.get('startRangeY') + items.startRangeY;}
		if(items.endRangeX){f.endRangeX = this.get('endRangeX') + items.endRangeX;}
		if(items.endRangeY){f.endRangeY = this.get('endRangeY') + items.endRangeY;}
		this.set(f);
		return this;
		};
 
/**
Adds roll attribute to each color stop value, sorts the colors into ascending order and recreates the gradient
@method update
@param {String} [sprite] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
**/
	Design.prototype.update = function(sprite, cell){
		this.makeGradient(sprite, cell);
		this.sortStops();
		this.applyStops();
		return this;
		};
 
/**
Returns &lt;canvas&gt; element's contenxt engine's gradient object, or 'rgba(0,0,0,0)' on failure
@method getData
@return JavaScript Gradient object, or String
@private
**/
	Design.prototype.getData = function(){
		return (scrawl.xt(scrawl.dsn[this.name])) ? scrawl.dsn[this.name] : 'rgba(0,0,0,0)';
		};
 
/**
Builds &lt;canvas&gt; element's contenxt engine's gradient object
@method makeGradient
@param {String} [sprite] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
@private
**/
	Design.prototype.makeGradient = function(sprite, cell){
		cell = (scrawl.xt(cell)) ? scrawl.cell[cell] : scrawl.cell[this.get('cell')];
		sprite = scrawl.sprite[sprite];
		var ctx = scrawl.context[cell.name],
			g, 
			north, 
			south, 
			east, 
			west,
			temp = sprite.getOffsetStartVector();
		switch (this.type) {
			case 'Gradient' :
				if(this.get('setToSprite')){
					switch(sprite.type){
						case 'Wheel' :
							west = temp.x - (sprite.radius * sprite.scale);
							north = temp.y - (sprite.radius * sprite.scale);
							east = west + (sprite.radius * 2 * sprite.scale);
							south = north + (sprite.radius * 2 * sprite.scale);
							break;
						case 'Shape' :
							west = temp.x - ((sprite.width/2) * sprite.scale);
							north = temp.y - ((sprite.height/2) * sprite.scale);
							east = west + (sprite.width * sprite.scale);
							south = north + (sprite.height * sprite.scale);
							break;
						default :
							west = temp.x;
							north = temp.y;
							east = west + (sprite.width * sprite.scale);
							south = north + (sprite.height * sprite.scale);
						}
					west *= this.get('startRangeX');
					north *= this.get('startRangeY');
					east *= this.get('endRangeX');
					south *= this.get('endRangeY');
					}
				else{
					west = -sprite.start.x + this.get('startX');
					north = -sprite.start.y + this.get('startY');
					east = -sprite.start.x + (this.get('endX') || cell.actualWidth);
					south = -sprite.start.y + (this.get('endY') || cell.actualHeight);
					}
				g = ctx.createLinearGradient(west, north, east, south);
				break;
			case 'RadialGradient' :
				if(this.setToSprite){
					g = ctx.createRadialGradient(this.get('startX'), this.get('startY'), (this.get('startRadius') * this.get('startRangeRadius')), this.get('endX'), this.get('endY'), (this.get('endRadius') * this.get('endRangeRadius')));
					}
				else{
					west = this.get('startX')-sprite.start.x;
					east = this.get('startY')-sprite.start.y;
					north = this.get('endX')-sprite.start.x;
					south = this.get('endY')-sprite.start.y;
					g = ctx.createRadialGradient(west, east, this.get('startRadius'), north, south, this.get('endRadius'));
					}
				break;
			default :
				g = false;
			}
		scrawl.dsn[this.name] = g;
		return this;
		};
 
/**
Gradient builder helper function - sorts color attribute Objects by their stop attribute values, after adding the roll value to them
@method sortStops
@return Nothing
@private
**/
	Design.prototype.sortStops = function(){
		var color = this.get('color'),
			roll = this.get('roll');
		for(var i=0, z=color.length; i<z; i++){
			color[i].stop += roll;
			if(!scrawl.isBetween(color[i].stop, 0, 1, true)){
				color[i].stop = (color[i].stop > 0.5) ? color[i].stop-1 : color[i].stop+1;
				}
			if(color[i].stop <= 0){color[i].stop = 0.000001;}
			else if(color[i].stop >= 1){color[i].stop = 0.999999;}
			}
		color.sort(function(a,b){
			return a.stop - b.stop;
			});
		this.set({color: color,});
		};
 
/**
Gradient builder helper function - applies color attribute objects to the gradient
@method applyStops
@return This
@private
@chainable
**/
	Design.prototype.applyStops = function(){
		var color = this.get('color');
		if(scrawl.dsn[this.name]){
			for(var i=0, z=color.length; i<z; i++){
				scrawl.dsn[this.name].addColorStop(color[i].stop, color[i].color);
				}
			}
		return this;
		};
 
/**
Remove this gradient from the scrawl library
@method remove
@return Always true
**/
	Design.prototype.remove = function(){
		delete scrawl.dsn[this.name];
		delete scrawl.design[this.name];
		scrawl.removeItem(scrawl.designnames, this.name);
		return true;
		};
		
/**
# Gradient
	
## Instantiation

* scrawl.newGradient()

## Purpose

* Defines a linear gradient
* Used with sprite.strokeStyle and sprite.fillStyle attributes

@class Gradient
@constructor
@extends Design
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Gradient(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Design.call(this, items);
		Scrawl.prototype.set.call(this, items);
		scrawl.design[this.name] = this;
		scrawl.pushUnique(scrawl.designnames, this.name);
		return this;
		}
	Gradient.prototype = Object.create(Design.prototype);
/**
@property type
@type String
@default 'Gradient'
@final
**/		
	Gradient.prototype.type = 'Gradient';
	Gradient.prototype.classname = 'designnames';
	scrawl.d.Gradient = {
		};
	scrawl.mergeInto(scrawl.d.Gradient, scrawl.d.Design);
 
/**
Swap start and end attributes
@method swap
@return This
@chainable
**/
	Gradient.prototype.swap = function(){
		var sx = this.get('startX'),
			sy = this.get('startY'),
			ex = this.get('endX'),
			ey = this.get('endY');
		this.set({
			startX: ex,
			startY: ey,
			endX: sx,
			endY: sy,
			});
		this.update();
		return this;
		};

/**
# RadialGradient
	
## Instantiation

* scrawl.newRadialGradient()

## Purpose

* Defines a radial gradient
* Used with sprite.strokeStyle and sprite.fillStyle attributes

@class RadialGradient
@constructor
@extends Design
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function RadialGradient(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Design.call(this, items);
		Scrawl.prototype.set.call(this, items);
		scrawl.design[this.name] = this;
		scrawl.pushUnique(scrawl.designnames, this.name);
		return this;
		}
	RadialGradient.prototype = Object.create(Design.prototype);
/**
@property type
@type String
@default 'RadialGradient'
@final
**/		
	RadialGradient.prototype.type = 'RadialGradient';
	RadialGradient.prototype.classname = 'designnames';
	scrawl.d.RadialGradient = {
/**
Start circle radius, in pixels
@property startRadius
@type Number
@default 0
**/
		startRadius: 0,
/**
End circle radius, in pixels
@property endRadius
@type Number
@default 0
**/
		endRadius: 0,
/**
Start circle radius, as a percentage of the sprites width where 0 = 0px and 1 = width in pixels
@property startRangeRadius
@type Number
@default 0.5
**/
		startRangeRadius: 0.5,
/**
End circle radius, as a percentage of the sprites width where 0 = 0px and 1 = width in pixels
@property endRangeRadius
@type Number
@default 0
**/
		endRangeRadius: 0,
		};
	scrawl.mergeInto(scrawl.d.RadialGradient, scrawl.d.Design);
 
/**
Swap start and end attributes
@method swap
@return This
@chainable
**/
	RadialGradient.prototype.swap = function(){
		var sx = this.get('startX'),
			sy = this.get('startY'),
			sr = this.get('startRadius'),
			ex = this.get('endY'),
			ey = this.get('endY'),
			er = this.get('endRadius');
		this.set({
			startX: ex,
			startY: ey,
			startRadius: er,
			endX: sx,
			endY: sy,
			endRadius: sr,
			});
		this.update();
		return this;
		};

/**
# Pattern
	
## Instantiation

* scrawl.newPattern()

## Purpose

* Defines a pattern
* Used with sprite.strokeStyle and sprite.fillStyle attributes

@class Pattern
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Pattern(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		Scrawl.prototype.set.call(this, items);
		this.repeat = items.repeat || 'repeat';
		this.cell = items.cell || scrawl.pad[scrawl.currentPad].current;
		this.setImage((items.source || items.imageData || scrawl.image[items.image] || scrawl.cell[items.canvas] || false), items.callback);
		return this;
		}
	Pattern.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Pattern'
@final
**/		
	Pattern.prototype.type = 'Pattern';
	Pattern.prototype.classname = 'designnames';
	scrawl.d.Pattern = {
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
	scrawl.mergeInto(scrawl.d.Pattern, scrawl.d.Scrawl);

/**
Overrides Scrawl.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Pattern.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
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
	Pattern.prototype.setImage = function(source, callback){
		if(scrawl.isa(source, 'str')){
			var myImage = new Image();
			var that = this;
			myImage.id = this.name;
			myImage.onload = function(callback){
				try{
					var iObj = scrawl.newImage({
						name: that.name,
						element: myImage,
						});
					scrawl.design[that.name] = that;
					scrawl.design[that.name].image = iObj.name;
					scrawl.design[that.name].source = myImage.src;
					scrawl.pushUnique(scrawl.designnames, that.name);
					scrawl.design[that.name].makeDesign();
					if(scrawl.isa(callback, 'fn')){
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
		else if(scrawl.isa(source, 'obj')){
			if(source.type === 'ScrawlImage'){
				try{
					this.image = source.name;
					this.source = source.source;
					scrawl.design[this.name] = this;
					scrawl.pushUnique(scrawl.designnames, this.name);
					this.makeDesign();
					if(scrawl.isa(callback, 'fn')){
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
					scrawl.design[this.name] = this;
					scrawl.pushUnique(scrawl.designnames, this.name);
					this.makeDesign();
					if(scrawl.isa(callback, 'fn')){
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
	Pattern.prototype.getData = function(){
		return (scrawl.xt(scrawl.dsn[this.name])) ? scrawl.dsn[this.name] : 'rgba(0,0,0,0)';
		};
 
/**
Builds &lt;canvas&gt; element's contenxt engine's pattern object
@method makeDesign
@return This
@chainable
@private
**/
	Pattern.prototype.makeDesign = function(){
		var ctx = scrawl.context[this.cell],
			img = (scrawl.xt(scrawl.img[this.image])) ? scrawl.img[this.image] : scrawl.object[this.image];
//		try{
			if(this.image){
				if(img){
					scrawl.dsn[this.name] = ctx.createPattern(img, this.repeat);
					}
				}
			else if(this.canvas){
				scrawl.dsn[this.name] = ctx.createPattern(scrawl.canvas[this.canvas], this.repeat);
				}
			return this;
//			}
//		catch(e){
//			return this;
//			}
		};

/**
Remove this pattern from the scrawl library
@method remove
@return Always true
**/
	Pattern.prototype.remove = function(){
		delete scrawl.dsn[this.name];
		delete scrawl.design[this.name];
		scrawl.removeItem(scrawl.designnames, this.name);
		return true;
		};

/**
Alias for Pattern.makeDesign()
@method update
@return This
@chainable
**/
	Pattern.prototype.update = function(){
		this.makeDesign();
		return this;
		};

/**
# Color
	
## Instantiation

* scrawl.newColor()

## Purpose

* Defines a color object
* Used with sprite.strokeStyle, sprite.fillStyle and sprite.shadowColor attributes

@class Color
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Color(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.call(this, items);
		this.set(items);
		if(scrawl.xt(items.color)){
			this.convert(items.color)
			};
		if(items.random){
			this.generateRandomColor(items)
			};
		this.checkValues();
		scrawl.design[this.name] = this;
		scrawl.pushUnique(scrawl.designnames, this.name);
		return this;
		}
	Color.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Color'
@final
**/		
	Color.prototype.type = 'Color';
	Color.prototype.classname = 'designnames';
	scrawl.d.Color = {
/**
Red channel value: 0 - 255
@property r
@type Number
@default 0
**/		
		r: 0,
/**
Green channel value: 0 - 255
@property g
@type Number
@default 0
**/		
		g: 0,
/**
Blue channel value: 0 - 255
@property b
@type Number
@default 0
**/		
		b: 0,
/**
Alpha channel value: 0 - 1
@property a
@type Number
@default 1
**/		
		a: 1,
/**
Red channel delta value
@property rShift
@type Number
@default 0
**/		
		rShift: 0,
/**
Green channel delta value
@property gShift
@type Number
@default 0
**/		
		gShift: 0,
/**
Blue channel delta value
@property bShift
@type Number
@default 0
**/		
		bShift: 0,
/**
Alpha channel delta value
@property aShift
@type Number
@default 0
**/		
		aShift: 0,
/**
Red channel maximum permitted value: 0 - 255
@property rMax
@type Number
@default 255
**/		
		rMax: 255,
/**
Green channel maximum permitted value: 0 - 255
@property gMax
@type Number
@default 255
**/		
		gMax: 255,
/**
Blue channel maximum permitted value: 0 - 255
@property bMax
@type Number
@default 255
**/		
		bMax: 255,
/**
Alpha channel maximum permitted value: 0 - 1
@property aMax
@type Number
@default 1
**/		
		aMax: 1,
/**
Red channel minimum permitted value: 0 - 255
@property rMin
@type Number
@default 0
**/		
		rMin: 0,
/**
Green channel minimum permitted value: 0 - 255
@property gMin
@type Number
@default 0
**/		
		gMin: 0,
/**
Blue channel minimum permitted value: 0 - 255
@property bMin
@type Number
@default 0
**/		
		bMin: 0,
/**
Alpha channel minimum permitted value: 0 - 1
@property aMin
@type Number
@default 0
**/		
		aMin: 0,
/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property rBounce
@type Boolean
@default false
**/		
		rBounce: false,
/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property gBounce
@type Boolean
@default false
**/		
		gBounce: false,
/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property bBounce
@type Boolean
@default false
**/		
		bBounce: false,
/**
Drawing flag - if true, when color updates the delta value will reverse its sign just before the channel's maximum or minimum value is breached
@property aBounce
@type Boolean
@default false
**/		
		aBounce: false,
/**
Requires Color object to recalculate its attribute values before each display cycle commences
@property autoUpdate
@type Boolean
@default false
**/		
		autoUpdate: false,
/**
Generation flag - if true, Color object will set itself to a random color within minimum and maximum attributes

This attribute is not retained by the color object, and can only be used in the __scrawl.newColor()__ and __Color.set()__ functions
@property random
@type Boolean
@default false
**/		
		};
	scrawl.mergeInto(scrawl.d.Color, scrawl.d.Scrawl);
 
/**
Overrides Scrawl.get()

* If called with no argument, will return the current color String
* if called with the String argument 'random', will generate a random color (within permitted limits) and return that
@method get
@param {String} item Attribute key String
@return Attribute value, or CSS color string
**/
	Color.prototype.get = function(item){
		if(!scrawl.xt(item)){
			return 'rgba('+(this.r || 0)+', '+(this.g || 0)+', '+(this.b || 0)+', '+(this.a || 1)+')';
			}
		else if(item === 'random'){
			this.generateRandomColor();
			return this.get();
			}
		else{
			return Scrawl.prototype.get.call(this, item);
			}
		};
 
/**
Overrides Scrawl.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return Cloned Color object
**/
	Color.prototype.clone = function(items){
		var a = this.parse(),
			b,
			c;
		b = scrawl.mergeOver(a, ((scrawl.isa(items,'obj')) ? items : {}));
		c = scrawl.newColor(b);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xt(items.random) && items.random){
			delete c.r;
			delete c.g;
			delete c.b;
			delete c.a;
			c.generateRandomColor(items)
			}
		return c;
		};
 
/**
Returns current color
@method getData
@return CSS color String
@private
**/
	Color.prototype.getData = function(){
		if(this.get('autoUpdate')){
			this.update();
			}
		this.checkValues();
		return this.get();
		};
 
/**
Generates a random color

Argument can include preset color channel values (0-255, 0-1 for alpha): {r:Number, g:Number, b:Number, a:Number}
@method generateRandomColor
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
	Color.prototype.generateRandomColor = function(items){
		var rMax = this.get('rMax'),
			gMax = this.get('gMax'),
			bMax = this.get('bMax'),
			aMax = this.get('aMax'),
			rMin = this.get('rMin'),
			gMin = this.get('gMin'),
			bMin = this.get('bMin'),
			aMin = this.get('aMin');
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.prototype.set.call(this, {
			r: items.r || Math.round((Math.random()*(rMax-rMin))+rMin),
			g: items.g || Math.round((Math.random()*(gMax-gMin))+gMin),
			b: items.b || Math.round((Math.random()*(bMax-bMin))+bMin),
			a: items.a || (Math.random()*(aMax-aMin))+aMin,
			});
		this.checkValues();
		return this;
		};
 
/**
Checks that color channel values are of the permitted form (integer vs float) and within permitted ranges
@method checkValues
@return This
@chainable
@private
**/
	Color.prototype.checkValues = function(){
		var r = this.r || 0,
			g = this.g || 0,
			b = this.b || 0,
			a = this.a || 1;
		r = (r > 255) ? 255 : ((r < 0) ? 0 : r);
		g = (g > 255) ? 255 : ((g < 0) ? 0 : g);
		b = (b > 255) ? 255 : ((b < 0) ? 0 : b);
		a = (a > 1) ? 1 : ((a < 0) ? 0 : a);
		Scrawl.prototype.set.call(this, {
			r: r,
			g: g,
			b: b,
			a: a,
			});
		return this;
		};

/**
Overrides Scrawl.set()
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Color.prototype.set = function(items){
		Scrawl.prototype.set.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(items.random){
			this.generateRandomColor(items);
			}
		this.checkValues();
		return this;
		};

/**
Update the current color, taking into account shift and bounce attribute values
@method update
@return This
@chainable
**/
	Color.prototype.update = function(){
		var l = ['r','g','b','a'],
			col,
			res = [],
			sft = [],
			shift,
			min,
			max,
			bounce,
			r,
			g,
			b,
			a;
		for(var i=0, z=l.length; i<z; i++){
			col = this.get(l[i]);
			shift = this.get(l[i]+'Shift');
			min = this.get(l[i]+'Min');
			max = this.get(l[i]+'Max');
			bounce = this.get(l[i]+'Bounce');
			if(!scrawl.isBetween((col + shift), max, min, true)){
				if(bounce){
					shift = -shift;
					}
				else{
					col = (col > (max + min)/2) ? max : min;
					shift = 0;
					}
				}
			res[i] = col + shift;
			sft[i] = shift;
			}
		Scrawl.prototype.set.call(this, {
			r: res[0],
			g: res[1],
			b: res[2],
			a: res[3],
			rShift: sft[0],
			gShift: sft[1],
			bShift: sft[2],
			aShift: sft[3],
			});
		return this;
		};
 
/**
Add values to Number attributes - limited to altering __r__, __g__, __b__ and __a__ attributes
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Color.prototype.setDelta = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		Scrawl.prototype.set.call(this, {
			r: (this.r || 0) + (items.r || 0),
			g: (this.g || 0) + (items.g || 0),
			b: (this.b || 0) + (items.b || 0),
			a: (this.a || 1) + (items.a || 0),
			});
		this.checkValues();
		return this;
		};

/**
Convert a CSS color string value into native attribute values. 

Converts: '#nnn', '#nnnnnn', 'rgb(n, n, n)', 'rgba(n, n, n, a), color names.

Color names are limited to those supported by SVGTiny: 'green', 'silver', 'lime', 'gray', 'grey', 'olive', 'white', 'yellow', 'maroon', 'navy', 'red', 'blue', 'purple', 'teal', 'fuchsia', 'aqua'. Default: 'black'.
@method convert
@param {String} items CSS color String 
@return This
@chainable
**/
	Color.prototype.convert = function(items){
		items = (scrawl.isa(items,'str')) ? items : '';
		if(items.length > 0){
			items.toLowerCase();
			var temp,
				r = 0,
				g = 0,
				b = 0,
				a = 1;
			if(items[0] === '#'){
				if(items.length < 5){
					r = this.toDecimal(items[1]+items[1]);
					g = this.toDecimal(items[2]+items[2]);
					b = this.toDecimal(items[3]+items[3]);
					}
				else if(items.length < 8){
					r = this.toDecimal(items[1]+items[2]);
					g = this.toDecimal(items[3]+items[4]);
					b = this.toDecimal(items[5]+items[6]);
					}
				}
			else if(/rgb\(/.test(items)){
				temp = items.match(/([0-9.]+\b)/g);
				if(/%/.test(items)){
					r = Math.round((temp[0]/100)*255);
					g = Math.round((temp[1]/100)*255);
					b = Math.round((temp[2]/100)*255);
					}
				else{
					r = Math.round(temp[0]);
					g = Math.round(temp[1]);
					b = Math.round(temp[2]);
					}
				}
			else if(/rgba\(/.test(items)){
				temp = items.match(/([0-9.]+\b)/g);
				r = temp[0];
				g = temp[1];
				b = temp[2];
				a = temp[3];
				}
			else{
				switch(items){
					case 'green' : 		r = 0;		g = 128;	b = 0;		break;
					case 'silver' : 	r = 192;	g = 192;	b = 192;	break;
					case 'lime' : 		r = 0;		g = 255;	b = 0;		break;
					case 'gray' : 		r = 128;	g = 128;	b = 128;	break;
					case 'grey' : 		r = 128;	g = 128;	b = 128;	break;
					case 'olive' : 		r = 128;	g = 128;	b = 0;		break;
					case 'white' : 		r = 255;	g = 255;	b = 255;	break;
					case 'yellow' : 	r = 255;	g = 255;	b = 0;		break;
					case 'maroon' : 	r = 128;	g = 0;		b = 0;		break;
					case 'navy' : 		r = 0;		g = 0;		b = 128;	break;
					case 'red' : 		r = 255;	g = 0;		b = 0;		break;
					case 'blue' : 		r = 0;		g = 0;		b = 255;	break;
					case 'purple' : 	r = 128;	g = 0;		b = 128;	break;
					case 'teal' : 		r = 0;		g = 128;	b = 128;	break;
					case 'fuchsia' : 	r = 255;	g = 0;		b = 255;	break;
					case 'aqua' : 		r = 0;		g = 255;	b = 255;	break;
					default : 			r = 0;		g = 0;		b = 0;		break;
					}
				}
			}
		Scrawl.prototype.set.call(this, {
			r: r,
			g: g,
			b: b,
			a: a,
			});
		this.checkValues();
		return this;
		};

/**
Convert a decimal Number to its hexidecimal String value
@method toDecimal
@param {Number} items decimal value
@return Hexidecimal String
**/
	Color.prototype.toDecimal = function(item){
		return parseInt(item,16);
		};

/**
Convert a hexidecimal String to its decimal Number value
@method toHex
@param {String} Hexidecimal String value
@return Decimal Number
**/
	Color.prototype.toHex = function(item){
		return item.toString(16);
		};

/**
Delete this Color object from the scrawl library
@method remove
@return Always true
**/
	Color.prototype.remove = function(){
		delete scrawl.dsn[this.name];
		delete scrawl.design[this.name];
		scrawl.removeItem(scrawl.designnames, this.name);
		return true;
		};

/**
# Particle
	
## Instantiation

* scrawl.newParticle()

## Purpose

* Defines Particle object, for physics simulations
* Particles are stored in __scrawl.sprite__; they inherit from Scrawl, not Sprite, objects
@class Particle
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Particle(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.position = new Vector();
		this.velocity = new Vector();
		this.set(items);
		this.priorPosition = this.position.getVector();
		this.engine = items.engine || 'euler';
		this.userVar = items.userVar || {};
		this.mobile = (scrawl.isa(items.mobile,'bool')) ? items.mobile : true;
		this.forces = items.forces || [];
		this.springs = items.springs || [];
		this.mass = items.mass || scrawl.d.Particle.mass;
		this.elasticity = items.elasticity || scrawl.d.Particle.elasticity;
		this.radius = items.radius || scrawl.d.Particle.radius;
		if(items.radius || items.area){
			this.area = items.area || 2 * Math.PI * this.get('radius') * this.get('radius') || scrawl.d.Particle.area;
			}
		this.load = new Vector();
		scrawl.sprite[this.name] = this;
		scrawl.pushUnique(scrawl.spritenames, this.name);
		this.group = Sprite.prototype.getGroup.call(this, items);
		scrawl.group[this.group].addSpritesToGroup(this.name);
		return this;
		}
	Particle.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Particle'
@final
**/		
	Particle.prototype.type = 'Particle';
	Particle.prototype.classname = 'spritenames';
/**
All Property have an order attribute of value 0
@property order
@type Number
@default 0
@final
**/		
	Particle.prototype.order = 0;	//included to allow normal sprites to sort themselves properly
	scrawl.d.Particle = {
/**
Current group
@property group
@type String
@default ''
**/		
		group: '',
		order: 0,
/**
Mobility flag; when false, particle is fixed to the Cell at its position attribute coordinate vector
@property mobile
@type Boolean
@default true
**/		
		mobile: true,
/**
Particle mass value, in kilograms
@property mass
@type Number
@default 1
**/		
		mass: 1,
/**
Particle radius, in meters
@property radius
@type Number
@default 0.1
**/		
		radius: 0.1,
/**
Projected surface area - assumed to be of a sphere - in square meters
@property area
@type Number
@default 0.03
**/		
		area: 0.03,
/**
Air drag coefficient - assumed to be operating on a smooth sphere
@property drag
@type Number
@default 0.42
**/		
		drag: 0.42,
/**
Elasticity coefficient, where 0.0 = 100% elastic and 1.0 is 100% inelastic
@property elasticity
@type Number
@default 1
**/		
		elasticity: 1,
/**
Object in which user key:value pairs can be stored - clonable
@property userVar
@type Object
@default {}
**/		
		userVar: {},
/**
Position vector - assume 1 pixel = 1 meter

Vector attributes can be set using the following alias attributes:

* position.x - __startX__ or __start.x__
* position.y - __startY__ or __start.y__
@property position
@type Vector
@default Zero values vector
**/		
		position: {x:0,y:0,z:0},
/**
Velocity vector - assume 1 pixel = 1 meter per second

Vector attributes can be set using the following alias attributes:

* velocity.x - __deltaX__ or __delta.x__
* velocity.y - __deltaY__ or __delta.y__
@property velocity
@type Vector
@default Zero values vector
**/		
		velocity: {x:0,y:0,z:0},
/**
Particle calculator engine - a String value. 

Current engines include: 'rungeKutter' (most accurate), 'improvedEuler', 'euler' (default)
@property engine
@type String
@default 'euler'
**/		
		engine: 'euler',
/**
An Array containing FORCENAME Strings and/or force Functions
@property forces
@type Array
@default []
**/		
		forces: [],
/**
An Array containing SPRINGNAME Strings
@property springs
@type Array
@default []
**/		
		springs: [],
/**
Load Vector - recreated at the start of every calculation cycle iteration
@property load
@type Vector
@default Zero vector
@private
**/		
		load: new Vector(),
		};
	scrawl.mergeInto(scrawl.d.Particle, scrawl.d.Scrawl);

/**
Overrides Scrawl.set()

Allows users to set the Particle's position and velocity attributes using startX, startY, start, deltaX, deltaY, delta values
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	Particle.prototype.set = function(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		var temp;
		Scrawl.prototype.set.call(this, items);
		if(!this.position.type || this.position.type !== 'Vector'){
			this.position = new Vector(items.position || this.position);
			}
		if(scrawl.xto([items.start, items.startX, items.startY])){
			temp = (scrawl.isa(items.start,'obj')) ? items.start : {};
			this.position.x = (scrawl.xt(items.startX)) ? items.startX : ((scrawl.xt(temp.x)) ? temp.x : this.position.x);
			this.position.y = (scrawl.xt(items.startY)) ? items.startY : ((scrawl.xt(temp.y)) ? temp.y : this.position.y);
			}
		if(!this.velocity.type || this.velocity.type !== 'Vector'){
			this.velocity = new Vector(items.velocity || this.velocity);
			}
		if(scrawl.xto([items.delta, items.deltaX, items.deltaY])){
			temp = (scrawl.isa(items.delta,'obj')) ? items.delta : {};
			this.velocity.x = (scrawl.xt(items.deltaX)) ? items.deltaX : ((scrawl.xt(temp.x)) ? temp.x : this.velocity.x);
			this.velocity.y = (scrawl.xt(items.deltaY)) ? items.deltaY : ((scrawl.xt(temp.y)) ? temp.y : this.velocity.y);
			}
		return this;
		};

/**
Overrides Scrawl.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return Cloned Particle object
@chainable
**/
	Particle.prototype.clone = function(items){
		var a = Scrawl.prototype.clone.call(this, items);
		a.position = new Vector(a.position);
		a.velocity = new Vector(a.velocity);
		a.forces = [];
		for(var i=0, z=this.forces.length; i<z; i++){
			a.forces.push(this.forces[i]);
			}
		return a;
		};

/**
Add a force to the forces array
@method addForce
@param {Object} item Anonymous Function, or FORCENAME String
@return This
@chainable
**/
	Particle.prototype.addForce = function(item){
		if(scrawl.xt(item)){
			this.forces.push(item);
			}
		return this;
		};
	Particle.prototype.revert = function(){
		this.position = this.priorPosition.getVector();
		return this;
		};

/**
Undertake a calculation cycle iteration
@method stamp
@return This
@chainable
**/
	Particle.prototype.stamp = function(){
		if(this.mobile){
			this.calculateLoads();
			switch(this.engine){
				case 'improvedEuler' :
					this.updateImprovedEuler();
					break;
				case 'rungeKutter' :
					this.updateRungeKutter();
					break;
				default :
					this.updateEuler();
				}
			}
		return this;
		};

/**
Alias for Particle.stamp()
@method forceStamp
@return This
@chainable
**/
	Particle.prototype.forceStamp = function(){
		return this.stamp();
		};

/**
Alias for Particle.stamp()
@method update
@return This
@chainable
**/
	Particle.prototype.update = function(){
		return this.stamp();
		return this;
		};

/**
Calculate the loads (via forces) acting on the particle for this calculation cycle iteration
@method calculateLoads
@return This
@chainable
@private
**/
	Particle.prototype.calculateLoads = function(){
		this.load = new Vector();
		for(var i=0, z=this.forces.length; i<z; i++){
			if(scrawl.isa(this.forces[i], 'str') && scrawl.contains(scrawl.forcenames, this.forces[i])){
				scrawl.force[this.forces[i]].run(this);
				}
			else{
				this.forces[i](this);
				}
			}
		for(var i=0, z=this.springs.length; i<z; i++){
			if(scrawl.spring[this.springs[i]].start === this.name){
				this.load.vectorAdd(scrawl.spring[this.springs[i]].force);
				}
			else if(scrawl.spring[this.springs[i]].end === this.name){
				this.load.vectorSubtract(scrawl.spring[this.springs[i]].force);
				}
			}
		return this;
		};

/**
Calculation cycle engine
@method updateEuler
@return This
@chainable
@private
**/
	Particle.prototype.updateEuler = function(){
		this.velocity.vectorAdd(this.load.getScalarDivide(this.mass).scalarMultiply(scrawl.physics.deltaTime));
		this.priorPosition = this.position.getVector();
		this.position.vectorAdd(this.velocity.getScalarMultiply(scrawl.physics.deltaTime));
		return this;
		};

/**
Calculation cycle engine
@method updateImprovedEuler
@return This
@chainable
@private
**/
	Particle.prototype.updateImprovedEuler = function(){
		var k1 = this.load.getScalarDivide(this.mass).scalarMultiply(scrawl.physics.deltaTime);
		var k2 = this.load.getVectorAdd(k1).scalarDivide(this.mass).scalarMultiply(scrawl.physics.deltaTime);
		var kSum = k1.getVectorAdd(k2).scalarDivide(2);
		this.velocity.vectorAdd(kSum);
		this.priorPosition = this.position.getVector();
		this.position.vectorAdd(this.velocity.getScalarMultiply(scrawl.physics.deltaTime));
		return this;
		};

/**
Calculation cycle engine
@method updateRungeKutter
@return This
@chainable
@private
**/
	Particle.prototype.updateRungeKutter = function(){
		var k1 = this.load.getScalarDivide(this.mass).scalarMultiply(scrawl.physics.deltaTime).scalarDivide(2);
		var k2 = this.load.getVectorAdd(k1).scalarDivide(this.mass).scalarMultiply(scrawl.physics.deltaTime).scalarDivide(2);
		var k3 = this.load.getVectorAdd(k2).scalarDivide(this.mass).scalarMultiply(scrawl.physics.deltaTime);
		var k4 = this.load.getVectorAdd(k3).scalarDivide(this.mass).scalarMultiply(scrawl.physics.deltaTime);
		k2.scalarMultiply(2);
		k3.scalarMultiply(2);
		var kSum = k1.getVectorAdd(k2).vectorAdd(k3).vectorAdd(k4).scalarDivide(6);
		this.velocity.vectorAdd(kSum);
		this.priorPosition = this.position.getVector();
		this.position.vectorAdd(this.velocity.getScalarMultiply(scrawl.physics.deltaTime));
		return this;
		};

/**
Calculation cycle engine - linear particle collisions
@method linearCollide
@return This
@chainable
@private
**/
	Particle.prototype.linearCollide = function(b){
		var relPosition = this.position.getVectorSubtract(b.position);
		var normal = relPosition.getNormal();
		var relVelocity = this.velocity.getVectorSubtract(b.velocity);
		var impactScalar = relVelocity.getDotProduct(normal);
		impactScalar = -impactScalar * (1 + ((this.elasticity + b.elasticity)/2));
		impactScalar /= ((1/this.mass)+(1/b.mass));
		var impact = normal.getScalarMultiply(impactScalar);
		this.velocity.vectorAdd(impact.scalarDivide(this.mass));
		b.velocity.vectorAdd(impact.scalarDivide(b.mass).reverse());
		return this;
		};

/**
Create a new Spring object and add it to this, and another, Particle objects' springs array

Argument can be either a PARTICLENAME String, or an Object which includes an __end__ attribute set to a PARTICLENAME String
@method addSpring
@param {Object} items Object consisting of key:value attributes; alternatively, use a PARTICLENAME String
@return This
@chainable
**/
	Particle.prototype.addSpring = function(items){
		var mySpring = false, end = false;
		if(scrawl.isa(items,'str') && scrawl.contains(scrawl.spritenames, items)){
			end = items;
			var myItems = {};
			myItems.start = this.name;
			myItems.end = items;
			mySpring = scrawl.newSpring(myItems);
			}
		else{
			items = (scrawl.isa(items,'obj')) ? items : {};
			end = items.end || false;
			if(end && scrawl.contains(scrawl.spritenames, end)){
				items.start = this.name;
				mySpring = scrawl.newSpring(items);
				}
			}
		if(mySpring){
			scrawl.pushUnique(this.springs, mySpring.name);
			scrawl.pushUnique(scrawl.sprite[end].springs, mySpring.name);
			}
		return this;
		};

/**
Delete all springs associated with this Particle
@method removeSprings
@return This
@chainable
**/
	Particle.prototype.removeSprings = function(){
		var temp = [];
		for(var i=0, z=this.springs.length; i<z; i++){
			temp.push(this.springs[i]);
			}
		for(var i=0, z=temp.length; i<z; i++){
			scrawl.spring[temp].kill();
			}
		return this;
		};

/**
Delete a named Spring object from this Particle
@method removeSpringsTo
@return This
@chainable
**/
	Particle.prototype.removeSpringsTo = function(item){
		if(scrawl.xt(item) && scrawl.contains(scrawl.spritenames, item)){
			var temp = [], s;
			for(var i=0, z=this.springs.length; i<z; i++){
				s = scrawl.spring[this.springs[i]];
				if(s.start === this.name || s.end === this.name){
					temp.push(this.springs[i]);
					}
				}
			for(var i=0, z=temp.length; i<z; i++){
				scrawl.spring[temp].kill();
				}
			}
		return this;
		};
	//the following dummy functions allow Particle objects to play nicely as part of a wider sprite Group object
	Particle.prototype.pickupSprite = function(item){return this;};
	Particle.prototype.dropSprite = function(item){return this;};
	Particle.prototype.updateStart = function(){return this;};
		
/**
# Spring
	
## Instantiation

* scrawl.newSpring()
* Particle.addSpring()

## Purpose

* Defines a Spring object connecting two Particle objects
@class Spring
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Spring(items){
		items = (scrawl.isa(items,'obj')) ? items : {};
		if(scrawl.xta([items.start, items.end])){
			var b1 = scrawl.sprite[items.start];
			var b2 = scrawl.sprite[items.end];
			Scrawl.call(this, items);
			this.start = items.start;
			this.end = items.end;
			this.springConstant = items.springConstant || 1000;
			this.damperConstant = items.damperConstant || 100;
			if(scrawl.xt(items.restLength)){
				this.restLength = items.restLength;
				}
			else{
				var r = b2.position.getVector();
				r.vectorSubtract(b1.position);
				this.restLength = r.getMagnitude();
				}
			this.currentLength = items.currentLength || this.restLength;
			this.force = new Vector();
			scrawl.spring[this.name] = this;
			scrawl.pushUnique(scrawl.springnames, this.name);
			return this;
			}
		return false;
		}
	Spring.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Spring'
@final
**/		
	Spring.prototype.type = 'Spring';
	Spring.prototype.classname = 'springnames';
	scrawl.d.Spring = {
/**
First Particle PARTICLENAME
@property start
@type String
@default ''
**/		
		start: '',
/**
Second Particle PARTICLENAME
@property end
@type String
@default ''
**/		
		end: '',
/**
Spring constant
@property springConstant
@type Number
@default 1000
**/		
		springConstant: 1000,
/**
Spring damper constant
@property damperConstant
@type Number
@default 100
**/		
		damperConstant: 100,
/**
Rest length, in pixels, between the Spring object's two Particle objects
@property restLength
@type Number
@default 1
**/		
		restLength: 1,
/**
Current length, in pixels, between the Spring object's two Particle objects

Recalculated as part of each  calculation cycle iteration
@property currentLength
@type Number
@default 1
@private
**/		
		currentLength: 1,
/**
Vector representing the Spring object's current force on its Particles

Recalculated as part of each  calculation cycle iteration
@property force
@type Vector
@default Zero value vector
@private
**/		
		force: {x:0,y:0,z:0},
		};
	scrawl.mergeInto(scrawl.d.Spring, scrawl.d.Scrawl);

/**
Calculate the force exerted by the spring for this calculation cycle iteration
@method update
@return This
@chainable
@private
**/
	Spring.prototype.update = function(){
		var vr = scrawl.sprite[this.end].velocity.getVectorSubtract(scrawl.sprite[this.start].velocity);
		var r = scrawl.sprite[this.end].position.getVectorSubtract(scrawl.sprite[this.start].position);
		var r_norm = r.getNormal();
		this.force = r_norm.getScalarMultiply(this.springConstant * (r.getMagnitude() - this.restLength)).vectorAdd(vr.vectorMultiply(r_norm).scalarMultiply(this.damperConstant).vectorMultiply(r_norm));
		return this;
		};

/**
Remove this Spring from its Particle objects, and from the scrawl library
@method kill
@return Always true
**/
	Spring.prototype.kill = function(){
		scrawl.removeItem(scrawl.sprite[this.start].springs, this.name);
		scrawl.removeItem(scrawl.sprite[this.end].springs, this.name);
		delete scrawl.spring[this.name];
		scrawl.removeItem(scrawl.springnames, this.name);
		return true;
		};

/**
# Force
	
## Instantiation

* scrawl.newForce()

## Purpose

* Defines a Force function that can calculate forces on Particle objects

Two forces are pre-defined by scrawl:

* __scrawl.force.gravity__ - calculates the gravitational force acting on a Particle, as determined by the _scrawl.physics.gravity_ value and the Particle's _mass_
* __scrawl.force.drag__ - calculates the air drag force acting on a Particle, as determined by the scrawl.physics.airDensity value, and the Particle's _area_ and _drag_ attribute values
@class Force
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Force(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		this.fn = items.fn || function(){}; 
		scrawl.force[this.name] = this;
		scrawl.pushUnique(scrawl.forcenames, this.name);
		return this;
		}
	Force.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Force'
@final
**/		
	Force.prototype.type = 'Force';
	Force.prototype.classname = 'forcenames';
	scrawl.d.Force = {
/**
Anonymous function for calculating a force on a Particle

Functions need to be in the form:

	function(ball){
		//get or build a Vector object to hold the result
		var result = scrawl.newVector();

		//calculate the force - Particle attributes are available via the _ball_ argument
		
		//add the force to the Particle's load Vector
		ball.load.vectorAdd(result);
		}

@property fn
@type Function
@default function(){}
**/		
		fn: function(){},
		};
	scrawl.mergeInto(scrawl.d.Force, scrawl.d.Scrawl);

/**
Calculate the force for this calculation cycle iteration
@method run
@return force Vector, as defined in the force function
**/
	Force.prototype.run = function(item){
		return this.fn(item);
		};

/**
Remove this Force from the scrawl library
@method kill
@return Always true
**/
	Force.prototype.kill = function(){
		delete scrawl.force[this.name];
		scrawl.removeItem(scrawl.forcenames, this.name);
		return true;
		};
	
	//add in some forces
	scrawl.newForce({
		name: 'gravity',
		fn: function(ball){
			ball.load.vectorAdd({y: ball.mass * scrawl.physics.gravity});
			},
		});
	scrawl.newForce({
		name: 'drag',
		fn: function(ball){
			var d = ball.velocity.getConjugate();
			d.normalize();
			var s = ball.velocity.getMagnitude();
			var df = 0.5 * scrawl.physics.airDensity * s * s * ball.get('area') * ball.get('drag');
			d.scalarMultiply(df);
			ball.load.vectorAdd(d);
			},
		});
	

/**
# Animation
	
## Instantiation

* scrawl.newAnimation()

## Purpose

* Defines an animation function to be run by the scrawl.animationLoop() function

@class Animation
@constructor
@extends Scrawl
@param {Object} [items] Key:value Object argument for setting attributes
@return This
**/		
	function Animation(items){
		Scrawl.call(this, items);
		items = (scrawl.isa(items,'obj')) ? items : {};
		var delay = (scrawl.isa(items.delay, 'bool')) ? items.delay : false;
		this.fn = items.fn || function(){}; 
		scrawl.animation[this.name] = this;
		scrawl.pushUnique(scrawl.animationnames, this.name);
/**
Pseudo-attribute used to prevent immediate running of animation when first created

_This attribute is not retained by the Animation object_
@property delay
@type Boolean
@default false
**/		
		if(!delay){
			this.run();
			}
		return this;
		}
	Animation.prototype = Object.create(Scrawl.prototype);
/**
@property type
@type String
@default 'Animation'
@final
**/		
	Animation.prototype.type = 'Animation';
	Animation.prototype.classname = 'animationnames';
	scrawl.d.Animation = {
/**
Anonymous function for an animation routine
@property fn
@type Function
@default function(){}
**/		
		fn: function(){},
		};
	scrawl.mergeInto(scrawl.d.Animation, scrawl.d.Scrawl);

/**
Run an animation
@method run
@return Always true
**/
	Animation.prototype.run = function(){
		scrawl.pushUnique(scrawl.animate, this.name);
		return true;
		};

/**
Stop an animation
@method halt
@return Always true
**/
	Animation.prototype.halt = function(){
		scrawl.removeItem(scrawl.animate, this.name);
		return true;
		};
		

/**
Remove this Animation from the scrawl library
@method kill
@return Always true
**/
	Animation.prototype.kill = function(){
		delete scrawl.animation[this.name];
		scrawl.removeItem(scrawl.animationnames, this.name);
		scrawl.removeItem(scrawl.animate, this.name);
		return true;
		};

	//start initialization
	scrawl.initialize();
	scrawl.cvx = scrawl.cv.getContext('2d')
	return scrawl;
	}());
