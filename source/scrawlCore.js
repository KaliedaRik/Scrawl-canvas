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
# scrawlCore

## Version 3.1.7 - 4 August 2014

Developed by Rik Roots - <rik.roots@gmail.com>, <rik@rikweb.org.uk>

Scrawl demo website: <http://scrawl.rikweb.org.uk>

## Purpose and features

The core module is the only essential module in Scrawl. It must always be directly, and completely, loaded into the web page before any additional Scrawl modules are added to it. 

* Defines the Scrawl scope - __window.scrawl__

* Defines a number of utility methods used throughout Scrawl.js

* Defines the Scrawl library - all significant objects created by Scrawl can be found here

* Searches the DOM for &lt;canvas&gt; elements, and imports them into the Scrawl library

* Instantiates controllers (Pad objects) and wrappers (Cell objects) for each &lt;canvas&gt; element

* Instantiates Context engine objects for each Cell object

* Defines mouse functionality in relation to &lt;canvas&gt; elements

* Defines the core functionality for Sprite objects to be displayed on &lt;canvas&gt; elements; the different types of Sprites are defined in separate modules which need to be loaded into the core

* Defines Group objects, used to group sprites together for display and interaction purposes

* Defines Design objects - Gradient and RadialGradient - which can be used by Sprite objects for their _fill_ and _stroke_ styles; additional Design objects (Pattern, Color) are defined in separate modules

## Loading the module


@example
	<script src="path/to/scrawlCore-min.js"></script>

@module scrawlCore
**/

var scrawl = (function() {
	'use strict';
	var my = {};

	/**
# window.scrawl

The Scrawl library object. All objects, attributes and functions contained in the library can be accessed by any other JavaScript code running on the web page.

The library will expand and change as additional Scrawl modules load.

## Purpose:

* Holds links to every substantive object created by Scrawl.js and user code
* Also holds links to key DOM objects
* Functions for loading canvas elements on initialization, and for dynamically creating canvases on the web page
* Shorthand functions for rendering canvases
* Some general helper functions for testing variables that can be used by coders 

Core creates the following sections in the library:

* scrawl.__object__ - Contains key:value pairs for storing miscellaneous objects, for instance handles to DOM image elements imported into scrawl via scrawl.getImagesByClass()
* scrawl.__pad__ - Contains PADNAME:Object pairs for each instantiated Pad canvas controller object
* scrawl.__cell__ - Contains CELLNAME:Object pairs for each instantiated Cell canvas wrapper object
* scrawl.__canvas__ - Contains CELLNAME:object pairs linking to each Cell object's DOM &lt;canvas&gt; element
* scrawl.__context__ - Contains CELLNAME:Object pairs linking to each &lt;canvas&gt; element's context engine
* scrawl.__ctx__ - Contains CONTEXTNAME:Object pairs linking to each instantiated Scrawl Context object (used by Cell and Sprite objects)
* scrawl.__imageData__ - Contains key:value pairs linking to JavaScript image data objects
* scrawl.__group__ - Contains GROUPNAME:Object pairs linking to each instantiated Group object
* scrawl.__design__ - Contains DESIGNNAME:Object pairs for each instantiated design object (Gradient, RadialGradient, Pattern, Color)
* scrawl.__dsn__ - Contains DESIGNNAME:precompiled gradient/pattern context object pairs (Gradient, RadialGradient, Pattern)
* scrawl.__sprite__ - Contains SPRITENAME:Object pairs for each instantiated sprite object (Block, Phrase, Picture, Wheel, Path, Shape, Particle)

@class window.scrawl
**/

	/**
Scrawl.js version number
@property version
@type {String}
@default 3.1.4
@final
**/
	my.version = '3.1.7';
	/**
Array of array object keys used to define the sections of the Scrawl library
@property nameslist
@type {Array}
@private
**/
	my.nameslist = ['objectnames', 'padnames', 'cellnames', 'ctxnames', 'groupnames', 'designnames', 'spritenames'];
	/**
Array of objects which define the sections of the Scrawl library
@property sectionlist
@type {Array}
@private
**/
	my.sectionlist = ['object', 'pad', 'cell', 'canvas', 'context', 'ctx', 'imageData', 'group', 'design', 'dsn', 'sprite'];
	/**
For converting between degrees and radians
@property radian
@type {Number}
@default Math.PI/180
@final
**/
	my.radian = Math.PI / 180;
	/**
An Object containing OBJECTTYPE:Object pairs which in turn contain default attribute values for each Scrawl object constructor
@property d
@type {Object}
@private
**/
	my.d = {};
	/**
Work vector, for calculations
@property v
@type {Vector}
@private
**/
	my.v = null;
	/**
Work quaternions, for calculations
@property workquat
@type {Object}
@private
**/
	my.workquat = null;
	/**
DOM document fragment
@property f
@type {Object}
@private
**/
	my.f = document.createDocumentFragment();
	/**
Utility canvas - never displayed
@property cv
@type {CasnvasObject}
@private
**/
	my.cv = document.createElement('canvas');
	my.cv.id = 'defaultHiddenCanvasElement';
	my.f.appendChild(my.cv);
	/**
Utility canvas 2d context engine
@property cvx
@type {CasnvasContextObject}
@private
**/
	my.cvx = my.cv.getContext('2d');
	/**
Key:value pairs of module alias:filename Strings, used by scrawl.loadModules()
@property loadAlias
@type {Object}
@private
**/
	my.loadAlias = {
		block: 'scrawlBlock',
		wheel: 'scrawlWheel',
		phrase: 'scrawlPhrase',
		path: 'scrawlPath',
		shape: 'scrawlShape',
		images: 'scrawlImages',
		animation: 'scrawlAnimation',
		collisions: 'scrawlCollisions',
		factories: 'scrawlPathFactories',
		color: 'scrawlColor',
		filters: 'scrawlFilters',
		physics: 'scrawlPhysics',
		saveload: 'scrawlSaveLoad',
		stacks: 'scrawlStacks',
	};
	/**
A __general__ function that initializes (or resets) the Scrawl library and populates it with data, including existing &lt;canvas&gt; element data in the web page
@method init
@return The Scrawl library object (scrawl)
@chainable
@example
	scrawl.init();
**/
	my.init = function() {
		my.reset();
		my.pageInit();
		my.setDisplayOffsets('all');
		my.animationInit();
		my.physicsInit();
		return my;
	};
	/**
scrawl.init hook function - modified by stacks module
@method pageInit
@private
**/
	my.pageInit = function() {
		my.getCanvases();
	};
	/**
scrawl.init hook function - modified by animation module
@method animationInit
@private
**/
	my.animationInit = function() {};
	/**
scrawl.init hook function - modified by physics module
@method physicsInit
@private
**/
	my.physicsInit = function() {};
	/**
A __general__ function that resets the Scrawl library to empty arrays and objects
@method reset
@return The Scrawl library object (scrawl)
@chainable
@example
	scrawl.reset();
**/
	my.reset = function() {
		for (var i = 0, iz = my.nameslist.length; i < iz; i++) {
			my[my.nameslist[i]] = [];
		}
		for (var j = 0, jz = my.sectionlist.length; j < jz; j++) {
			my[my.sectionlist[j]] = {};
		}
		return my;
	};
	/**
A __general__ function that loads supporting modules and integrates them into the core

Module names are supplied as an array of Strings and can be either the module filename (with or without the '.js' suffix), or an alias string.

Scrawl currently supports the following modules:
* __scrawlAnimation.js__ - alias __animation__ - adds animation and tween functionality to the core
* __scrawlBlock.js__ - alias __block__ - adds _Block_ (square and rectangle) sprites to the core
* __scrawlCollisions.js__ - alias __collisions__ - adds sprite collision detection functionality to the core
* __scrawlColor.js__ - alias __color__ - adds the _Color_ Design object to the core
* __scrawlFilters.js__ - alias __filters__ - adds image filter functionality to the core
* __scrawlImages.js__ - alias __images__ - adds all image functionality, including static and animated _Picture_ sprites and the _Pattern_ Design object, to the core
* __scrawlPath.js__ - alias __path__ - adds _Path_ (SVGTiny path data) sprites to the core
* __scrawlPathFactories.js__ - alias __factories__ - adds user-friendly Path and Shape factory functions (for lines, quadratic and bezier curves, ellipses, round-corner rectangles, regular shapes such as stars, triangles, etc) to the core
* __scrawlPhrase.js__ - alias __phrase__ - adds _Phrase_ (single and multiline text) sprites to the core
* __scrawlPhysics.js__ - alias __physics__ - adds a physics engine to the core (experimental)
* __scrawlSaveLoad.js__ - alias __saveload__ - adds JSON object save and load functionality to the core (experimental)
* __scrawlShape.js__ - alias __shape__ - adds _Shape_ (path-like shapes) sprites to the core
* __scrawlStacks.js__ - alias __stacks__ - adds the ability to position, manipulate and animate &lt;canvas&gt; and other DOM elements in a 3d space on the web page
* __scrawlWheel.js__ - alias __wheel__ - adds _Wheel_ (circle and segment) sprites to the core

Where permitted, Scrawl will load modules asynchronously. Modules have no dependencies beyond their need for the core module, and can be loaded in any order.

Any supplied callback function will only be run once all modules have been loaded.
@example
	<!DOCTYPE html>
	<html>
		<head></head>
		<body>
			<canvas></canvas>
			<script src="js/scrawlCore-min.js"></script>
			<script>
				var mycode = function(){
					scrawl.newWheel({
						startX: 50,
						startY: 50,
						radius: 40,
						});
					scrawl.render();
					};
				scrawl.loadModules({
					path: 'js/',
					modules: ['wheel'],			
					callback: function(){
						window.addEventListener('load', function(){
							scrawl.init();
							mycode();
							}, false);
						},
					});
			</script>
		</body>
	</html>

@method loadModules
@param {String} [path] File path String to the directory where the Scrawl module scripts have been stored, relative to the web page's main file; default ('') will assume modules are in the same directory as the web page file
@param {Array} modules Array of module Strings (either filenames or module aliases), representing Scrawl modules to be loaded into the core
@param {Boolean} [mini] When set to true (the default), will load minified versions of the modules; false will load source versions
@param {Function} [callback] An anonymous function to be run once module loading completes
@return The Scrawl library object (scrawl)
@chainable
**/
	my.loadModules = function(items) {
		items = my.safeObject(items);
		var path = items.path || '',
			modules = (my.isa(items.modules, 'arr')) ? items.modules : [items.modules],
			callback = (my.isa(items.callback, 'fn')) ? items.callback : function() {},
			mini = (my.xt(items.minified)) ? items.minified : true,
			tail = (mini) ? '-min.js' : '.js',
			loaded = [].concat(modules),
			getModule = function(module) {
				var mod = document.createElement('script'),
					myMod = my.loadAlias[module] || module;
				mod.type = 'text/javascript';
				mod.async = 'true';
				mod.onload = function(e) {
					console.log('... ' + module + ' loaded');
					done(module);
				};
				mod.src = (/\.js$/.test(myMod)) ? path + myMod : path + myMod + tail;
				document.body.appendChild(mod);
			},
			done = function(m) {
				my.removeItem(loaded, m);
				if (loaded.length === 0) {
					console.log('All modules loaded');
					callback();
				}
			};
		console.log('Modules to be loaded: ', modules);
		for (var i = 0, iz = modules.length; i < iz; i++) {
			getModule(modules[i]);
		}
		return my;
	};
	/**
A __utility__ function that adds the attributes of the additive object to those of the reference object, where those attributes don't already exist in the reference object
@method mergeInto
@param {Object} o1 reference object
@param {Object} o2 additive object
@return Merged object
@example
	var old = {
			name: 'Peter',
			age: 42,
			job: 'lawyer'
			},
		new = {
			age: 32,
			job: 'coder',
			pet: 'cat',
			};
	scrawl.mergeInto(old, new);
	//result is {
	//	name: 'Peter',
	//	age: 42,
	//	job: 'lawyer'
	//	pet: 'cat',
	//	}
**/
	my.mergeInto = function(o1, o2) {
		for (var key in o2) {
			if (o2.hasOwnProperty(key) && !my.xt(o1[key])) {
				o1[key] = o2[key];
			}
		}
		return o1;
	};
	/**
A __utility__ function that adds the attributes of the additive object to those of the reference object, overwriting attributes where necessary
@method mergeOver
@param {Object} o1 reference object
@param {Object} o2 additive object
@return Merged object
@example
	var old = {
			name: 'Peter',
			age: 42,
			job: 'lawyer'
			},
		new = {
			age: 32,
			job: 'coder',
			pet: 'cat',
			};
	scrawl.mergeOver(old, new);
	//result is {
	//	name: 'Peter',
	//	age: 32,
	//	job: 'coder'
	//	pet: 'cat',
	//	}
**/
	my.mergeOver = function(o1, o2) {
		for (var key in o2) {
			if (o2.hasOwnProperty(key)) {
				o1[key] = o2[key];
			}
		}
		return o1;
	};
	/**
A __utility__ function that checks an array to see if it contains a given value
@method contains
@param {Array} item Reference array
@param {Mixed} k value to be checked
@return True if value is in array; false otherwise
@example
	var myarray = ['apple', 'orange'];
	scrawl.contains(myarray, 'apple');	//true
	scrawl.contains(myarray, 'banana');	//false
**/
	my.contains = function(item, k) {
		for (var p in item) {
			if (item[p] === k) return true;
		}
		return false;
	};
	/**
A __utility__ function that adds a value to an array if the array doesn't already contain an element with that value
@method pushUnique
@param {Array} item Reference array
@param {Mixed} o value to be added to array
@return Amended array
@example
	var myarray = ['apple', 'orange'];
	scrawl.pushUnique(myarray, 'apple');	//returns ['apple', 'orange']
	scrawl.pushUnique(myarray, 'banana');	//returns ['apple', 'orange', 'banana']
**/
	my.pushUnique = function(item, o) {
		if (!my.contains(item, o)) {
			item.push(o);
		}
		return item;
	};
	/**
A __utility__ function that removes a value from an array
@method removeItem
@param {Array} item Reference array
@param {Mixed} o value to be removed from array
@return Amended array
@example
	var myarray = ['apple', 'orange'];
	scrawl.removeItem(myarray, 'banana');	//returns ['apple', 'orange']
	scrawl.removeItem(myarray, 'apple');	//returns ['orange']
**/
	my.removeItem = function(item, o) {
		if (my.contains(item, o)) {
			var i = item.indexOf(o);
			item.splice(i, 1);
		}
		return item;
	};
	/**
A __utility__ function that checks to see if a number is between two other numbers
@method isBetween
@param {Number} no Reference number
@param {Number} a Minimum or maximum number
@param {Number} b Maximum or minimum number
@param {Boolean} [e] If true, reference number can equal maximum/minimum number; on false, number must lie between the maximum and minimum (default: false)
@return True if value is between maximum and minimum; false otherwise
@example
	scrawl.isBetween(3, 1, 5);			//returns true
	scrawl.isBetween(3, 3, 5);			//returns false
	scrawl.isBetween(3, 3, 5, true);	//returns true
**/
	my.isBetween = function(no, a, b, e) {
		if (a > b) {
			var t = a;
			a = b;
			b = t;
		}
		if (e) {
			if (no >= a && no <= b) {
				return true;
			}
			return false;
		}
		else {
			if ((no > a && no < b) || (no === a && no === b)) {
				return true;
			}
			return false;
		}
	};
	/**
A __utility__ function for variable type checking

Valid identifier Strings include:

* __num__ for numbers
* __str__ for strings
* __bool__ for booleans
* __fn__ for Function objects
* __arr__ for Array objects
* __obj__ for Object objects (excluding DOM objects)
* __date__ for Date objects
* __vector__ for Scrawl Vector objects
* __quaternion__ for Scrawl Quaternion objects
@method isa
@param {Mixed} item Primative or object for identification
@param {String} identifier Identifier String
@return True if item type matches the identifier
@example
	var mystring = 'string',
		myboolean = false;
	scrawl.isa(mystring, 'bool');	//returns false
	scrawl.isa(mystring, 'str');	//returns true
	scrawl.isa(myboolean, 'bool');	//returns true
	scrawl.isa(myboolean, 'str');	//returns false
**/
	my.isa = function(item, identifier) {
		if (my.xta([item, identifier])) {
			var myId = identifier.toLowerCase();
			switch (myId) {
				case 'num':
					return (typeof item === 'number') ? true : false;
				case 'str':
					return (typeof item === 'string') ? true : false;
				case 'bool':
					return (typeof item === 'boolean') ? true : false;
				case 'fn':
					return (typeof item === 'function') ? true : false;
				case 'vector':
					return (my.isa(item, 'obj') && my.xt(item.type) && item.type === 'Vector') ? true : false;
				case 'quaternion':
					return (my.isa(item, 'obj') && my.xt(item.type) && item.type === 'Quaternion') ? true : false;
				case 'arr':
					return (Object.prototype.toString.call(item) === '[object Array]') ? true : false;
				case 'obj':
					return (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
				case 'canvas':
					return (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;
				case 'img':
					return (Object.prototype.toString.call(item) === '[object HTMLImageElement]') ? true : false;
				case 'video':
					return (Object.prototype.toString.call(item) === '[object HTMLVideoElement]') ? true : false;
				case 'date':
					return (Object.prototype.toString.call(item) === '[object Date]') ? true : false;
				default:
					return false;
			}
		}
		return false;
	};
	/**
Check to see if variable is an Object 
@method safeObject
@param {Mixed} items Variable for checking
@return Parameter being checked, if it is an object; returns an empty object on failure
@private
**/
	my.safeObject = function(items) {
		return (my.isa(items, 'obj')) ? items : {};
	};
	/**
A __utility__ function for variable type checking
@method xt
@param {Mixed} item Primative or object for identification
@return False if item is 'undefined'
@example
	var mystring = 'string',
		myboolean;
	scrawl.xt(mystring);	//returns true
	scrawl.xt(myboolean);	//returns false
**/
	my.xt = function(item) {
		return (typeof item !== 'undefined') ? true : false;
	};
	/**
A __utility__ function for variable type checking
@method xta
@param {Array} item Array of primatives or objects for identification
@return False if any item is 'undefined'
@example
	var mystring = 'string',
		mynumber = 0,
		myboolean;
	scrawl.xta([mystring, mynumber]);	//returns true
	scrawl.xta([mystring, myboolean]);	//returns false
**/
	my.xta = function(item) {
		var a = [].concat(item);
		if (a.length > 0) {
			for (var i = 0, iz = a.length; i < iz; i++) {
				if (typeof a[i] === 'undefined') {
					return false;
				}
			}
			return true;
		}
		return false;
	};
	/**
A __utility__ function for variable type checking
@method xto
@param {Array} item Array of primatives or objects for identification
@return True if any item is not 'undefined'
@example
	var mystring = 'string',
		mynumber = 0,
		myboolean;
	scrawl.xto([mystring, mynumber]);	//returns true
	scrawl.xto([mystring, myboolean]);	//returns true
**/
	my.xto = function(item) {
		var a = [].concat(item);
		if (a.length > 0) {
			for (var i = 0, iz = a.length; i < iz; i++) {
				if (typeof a[i] !== 'undefined') {
					return true;
				}
			}
		}
		return false;
	};
	/**
Generate unique names for new Scrawl objects
@method makeName
@param {Object} [item] Object with attributes: name, type, target
@return Unique generated name
@private
**/
	my.makeName = function(item) {
		item = my.safeObject(item);
		var name,
			nameArray,
			o = {
				name: (my.isa(item.name, 'str')) ? item.name : null,
				type: (my.isa(item.type, 'str')) ? item.type : null,
				target: (my.isa(item.target, 'str')) ? item.target : null,
			};
		if (my.contains(my.nameslist, o.target)) {
			name = o.name || o.type || 'default';
			nameArray = name.split('~~~');
			return (my.contains(my[o.target], nameArray[0])) ? nameArray[0] + '~~~' + Math.floor(Math.random() * 100000000) : nameArray[0];
		}
		console.log('scrawl.makeName() error: insufficient or incorrect argument attributes');
		return false;
	};
	/**
A __general__ function to reset display offsets for all pads, stacks and elements

The argument is an optional String - permitted values include 'stack', 'pad', 'element'; default: 'all'

(This function is replaced by the scrawlStacks module)
@method setDisplayOffsets
@param {String} [item] Command string detailing which element types are to be set
@return The Scrawl library object (scrawl)
@chainable
@example
	scrawl.setDisplayOffsets();
**/
	my.setDisplayOffsets = function(item) {
		item = (my.xt(item)) ? item : 'all';
		for (var i = 0, iz = my.padnames.length; i < iz; i++) {
			my.pad[my.padnames[i]].setDisplayOffsets();
		}
		return my;
	};
	/**
A __private__ function that searches the DOM for canvas elements and generates Pad/Cell/Context objects for each of them

(This function is replaced by the scrawlStacks module)
@method getCanvases
@return True on success; false otherwise
@private
**/
	my.getCanvases = function() {
		var s = document.getElementsByTagName("canvas"),
			myPad,
			canvases = [];
		if (s.length > 0) {
			for (var i = 0, iz = s.length; i < iz; i++) {
				canvases.push(s[i]);
			}
			for (var j = 0, jz = s.length; j < jz; j++) {
				myPad = my.newPad({
					canvasElement: canvases[j],
				});
				if (j === 0) {
					my.currentPad = myPad.name;
				}
			}
			return true;
		}
		console.log('scrawl.getCanvases() failed to find any <canvas> elements on the page');
		return false;
	};
	/**
A __general__ function to add a visible &lt;canvas&gt; element to the web page, and create a Pad controller and Cell wrappers for it

The argument object should include the following attributes:

* __stackName__ (String) - STACKNAME of existing or new stack (optional)
* __parentElement__ - (String) CSS #id of parent element, or the DOM element itself; default: document.body
* any other legitimate Pad and/or Cell object attribute

(This function is replaced by the scrawlStacks module)
@method addCanvasToPage
@param {Object} items Object containing new Cell's parameters
@return The new Pad object
@example
    <body>
		<div id="canvasholder"></div>
		<script src="js/scrawlCore-min.js"></script>
		<script>
			scrawl.addCanvasToPage({
				canvasName:	'mycanvas',
				parentElement: 'canvasholder',
				width: 400,
				height: 200,
				}).makeCurrent();
		</script>
    </body>
**/
	my.addCanvasToPage = function(items) {
		items = my.safeObject(items);
		var myParent,
			myName,
			myCanvas,
			DOMCanvas,
			myPad;
		myParent = document.getElementById(items.parentElement) || document.body;
		myName = my.makeName({
			name: items.canvasName || items.name || false,
			type: 'Pad',
			target: 'padnames',
		});
		myCanvas = document.createElement('canvas');
		myCanvas.id = myName;
		myParent.appendChild(myCanvas);
		DOMCanvas = document.getElementById(myName);
		DOMCanvas.width = items.width;
		DOMCanvas.height = items.height;
		myPad = my.newPad({
			canvasElement: DOMCanvas,
		});
		myPad.set(items);
		my.setDisplayOffsets();
		return myPad;
	};
	/**
A __private__ function - def9ines the filter sections in the library
@method prepareFilterSection
@return The Scrawl library object (scrawl)
@chainable
@private
**/
	my.prepareFilterSection = function() {
		if (!my.xt(my.filter)) {
			my.filter = {};
			my.filternames = [];
		}
		return my;
	};
	/**
A __general__ function which passes on requests to pads to update their drawOrder property - see Pad.setDrawOrder() for more details
@method setDrawOrder
@param {Array} order Array of CELLNAMEs - Cells listed first will be drawn first (beneath other cells/layers)
@param {Array} pads Array of PADNAMESs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.setDrawOrder = function(order, pads) {
		var p = (my.xt(pads)) ? [].concat(pads) : [my.currentPad];
		for (var i = 0, iz = p.length; i < iz; i++) {
			my.pad[p[i]].setDrawOrder(order);
		}
		return my;
	};
	/**
A __display__ function to ask Pads to get their Cells to clear their &lt;canvas&gt; elements - see Pad.clear() for more details
@method clear
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.clear = function(command, pads) {
		var p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		if (p.length > 0) {
			for (var i = 0, iz = p.length; i < iz; i++) {
				my.pad[p[i]].clear(command);
			}
		}
		return my;
	};
	/**
A __display__ function to ask Pads to get their Cells to clear their &lt;canvas&gt; elements using their background color - see Pad.stampBackground() for more details
@method stampBackground
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.stampBackground = function(command, pads) {
		var p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		if (p.length > 0) {
			for (var i = 0, iz = p.length; i < iz; i++) {
				my.pad[p[i]].stampBackground(command);
			}
		}
		return my;
	};
	/**
A __display__ function to ask Pads to get their Cells to compile their scenes - see Pad.compile() for more details
@method compile
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.compile = function(command, pads) {
		var p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		if (p.length > 0) {
			for (var i = 0, iz = p.length; i < iz; i++) {
				my.pad[p[i]].compile(command);
			}
		}
		return my;
	};
	/**
A __display__ function to ask Pads to show the results of their latest display cycle - see Pad.show() for more details
@method show
@param {String} [command] Command String
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.show = function(command, pads) {
		var p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		if (p.length > 0) {
			for (var i = 0, iz = p.length; i < iz; i++) {
				my.pad[p[i]].show(command);
			}
		}
		return my;
	};
	/**
A __display__ function to ask Pads to undertake a complete clear-compile-show display cycle
@method render
@param {Object} [command] Object with attributes: clear:COMMAND, compile:COMMAND, show:COMMAND - all are optional
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.render = function(command, pads) {
		var p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		if (p.length > 0) {
			for (var i = 0, iz = p.length; i < iz; i++) {
				my.pad[p[i]].render(command);
			}
		}
		return my;
	};
	/**
A __general__ function which passes on requests to Pads to generate new &lt;canvas&gt; elements and associated objects - see Pad.addNewCell() for more details
@method addNewCell
@param {Object} data Initial attribute values for new object
@param {String} pad PADNAME
@return New Cell object
**/
	my.addNewCell = function(data, pad) {
		var p = (my.isa(pad, 'str')) ? pad : my.currentPad;
		return my.pad[p].addNewCell(data);
	};
	/**
A __general__ function which deletes Cell objects and their associated paraphinalia - see Pad.deleteCells() for more details
@method deleteCells
@param {Array} cells Array of CELLNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.deleteCells = function(cells) {
		if (my.xt(cells)) {
			var c = [].concat(cells);
			for (var i = 0, iz = c.length; i < iz; i++) {
				for (var j = 0, jz = my.padnames.length; j < jz; j++) {
					my.pad[my.padnames[j]].deleteCell(c[i]);
				}
				delete my.group[c[i]];
				delete my.group[c[i] + '_field'];
				delete my.group[c[i] + '_fence'];
				my.removeItem(my.groupnames, c[i]);
				my.removeItem(my.groupnames, c[i] + '_field');
				my.removeItem(my.groupnames, c[i] + '_fence');
				delete my.context[c[i]];
				delete my.canvas[c[i]];
				delete my.ctx[my.cell[c[i]].context];
				my.removeItem(my.ctxnames, my.cell[c[i]].context);
				delete my.cell[c[i]];
				my.removeItem(my.cellnames, c[i]);
			}
		}
		return my;
	};
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
	my.getImageDataValue = function(items) {
		items = my.safeObject(items);
		if (my.xta([items.table, items.channel]) && my.isa(items.x, 'num') && my.isa(items.y, 'num')) {
			var myTable,
				myEl,
				result,
				myChannel;
			myTable = my.imageData[items.table];
			if (myTable) {
				if (my.isBetween(items.y, -1, myTable.height)) {
					if (my.isBetween(items.x, -1, myTable.width)) {
						myEl = ((items.y * myTable.width) + items.x) * 4;
						if (items.channel === 'color') {
							result = 'rgba(' + myTable.data[myEl] + ',' + myTable.data[myEl + 1] + ',' + myTable.data[myEl + 2] + ',' + myTable.data[myEl + 3] + ')';
						}
						else {
							switch (items.channel) {
								case 'red':
									myChannel = 0;
									break;
								case 'blue':
									myChannel = 1;
									break;
								case 'green':
									myChannel = 2;
									break;
								case 'alpha':
									myChannel = 3;
									break;
							}
							result = myTable.data[myEl + myChannel];
						}
						return result;
					}
				}
			}
		}
		console.log('scrawl.getImageDataValue() error: insufficient or incorrect arguments; or imageData does not exist; or coordinates are out of bounds');
		return false;
	};
	/**
A __general__ function which adds supplied spritenames to Group.sprites attribute
@method addSpritesToGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} sprites Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.addSpritesToGroups = function(groups, sprites) {
		if (my.xta([groups, sprites])) {
			var myGroups = [].concat(groups),
				mySprites = [].concat(sprites);
			for (var i = 0, iz = myGroups.length; i < iz; i++) {
				if (my.contains(my.groupnames, myGroups[i])) {
					my.group[myGroups[i]].addSpritesToGroup(mySprites);
				}
			}
		}
		return my;
	};
	/**
A __general__ function which removes supplied spritenames from Group.sprites attribute
@method removeSpritesFromGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} sprites Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.removeSpritesFromGroups = function(groups, sprites) {
		if (my.xta([groups, sprites])) {
			var myGroups = [].concat(groups),
				mySprites = [].concat(sprites);
			for (var i = 0, iz = myGroups.length; i < iz; i++) {
				if (my.contains(my.groupnames, myGroups[i])) {
					my.group[myGroups[i]].removeSpritesFromGroup(mySprites);
				}
			}
		}
		return my;
	};
	/**
A __general__ function to delete sprite objects
@method deleteSprite
@param {Array} items Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
@example
	scrawl.newBlock({
		name: 'myblock',
		});
	scrawl.deleteSprite(['myblock']);
**/
	my.deleteSprite = function(items) {
		var myItems = (my.isa(items, 'str')) ? [items] : [].concat(items),
			myPointList,
			myLinkList,
			myCtx,
			search,
			mySprite;
		for (var i = 0, iz = myItems.length; i < iz; i++) {
			if (my.contains(my.spritenames, myItems[i])) {
				mySprite = my.sprite[myItems[i]];
				my.pathDeleteSprite(mySprite);
				myCtx = mySprite.context;
				my.removeItem(my.ctxnames, myCtx);
				delete my.ctx[myCtx];
				my.removeItem(my.spritenames, myItems[i]);
				delete my.sprite[myItems[i]];
				for (var j = 0, jz = my.groupnames.length; j < jz; j++) {
					my.removeItem(my.group[my.groupnames[j]].sprites, myItems[i]);
				}
			}
		}
		return my;
	};
	/**
scrawl.deleteSprite hook function - modified by path module
@method pathDeleteSprite
@private
**/
	my.pathDeleteSprite = function(items) {};
	/**
A __factory__ function to generate new Vector objects
@method newVector
@param {Object} items Key:value Object argument for setting attributes
@return Vector object
@example
	var myVector = scrawl.newVector({
		x: 100,
		y: 200,
		});
**/
	my.newVector = function(items) {
		return new my.Vector(items);
	};
	/**
A __factory__ function to generate new Quaternion objects - see also scrawl.makeQuaternion()
@method newQuaternion
@param {Object} items Key:value Object argument for setting attributes
@return Quaternion object
**/
	my.newQuaternion = function(items) {
		return new my.Quaternion(items);
	};
	/**
A __factory__ function to build a Quaternion object from Euler angle values

Argument object can be in the following form, where all values (which default to 0) are in degrees:
* {pitch:Number, yaw:Number, roll:Number}
* {x:Number, y:Number, z:Number}
* or a mixture of the two
@method makeQuaternion
@param {Object} [items] Key:value Object argument for setting attributes
@return New quaternion
@example
	var myQuart = scrawl.makeQuaternion({
		pitch: 90,
		yaw: 10,
		});
**/
	my.makeQuaternion = function(items) {
		return my.Quaternion.prototype.makeFromEuler(items);
	};
	/**
A __factory__ function to generate new Pad objects
@method newPad
@param {Object} items Key:value Object argument for setting attributes
@return Pad object
@private
**/
	my.newPad = function(items) {
		return new my.Pad(items);
	};
	/**
A __factory__ function to generate new Cell objects
@method newCell
@param {Object} items Key:value Object argument for setting attributes
@return Cell object
@private
**/
	my.newCell = function(items) {
		return new my.Cell(items);
	};
	/**
A __factory__ function to generate new Context objects
@method newContext
@param {Object} items Key:value Object argument for setting attributes
@return Context object
@private
**/
	my.newContext = function(items) {
		return new my.Context(items);
	};
	/**
A __factory__ function to generate new Group objects
@method newGroup
@param {Object} items Key:value Object argument for setting attributes
@return Group object
**/
	my.newGroup = function(items) {
		return new my.Group(items);
	};
	/**
A __factory__ function to generate new Gradient objects
@method newGradient
@param {Object} items Key:value Object argument for setting attributes
@return Gradient object
**/
	my.newGradient = function(items) {
		return new my.Gradient(items);
	};
	/**
A __factory__ function to generate new RadialGradient objects
@method newRadialGradient
@param {Object} items Key:value Object argument for setting attributes
@return RadialGradient object
**/
	my.newRadialGradient = function(items) {
		return new my.RadialGradient(items);
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
**/
	my.Vector = function(items) {
		items = my.safeObject(items);
		this.x = items.x || 0;
		this.y = items.y || 0;
		this.z = items.z || 0;
		this.name = items.name || 'generic';
		return this;
	};
	my.Vector.prototype = Object.create(Object.prototype);
	/**
@property type
@type String
@default 'Vector'
@final
**/
	my.Vector.prototype.type = 'Vector';
	my.d.Vector = {
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
		/**
Vector name - not guaranteed to be unique
@property name
@type String
@default 'generic'
**/
		name: 'generic',
	};
	/**
Set the Vector's coordinates to values that will result in the given magnitude
@method setMagnitudeTo
@param {Number} item New magnitude
@return This
@chainable
**/
	my.Vector.prototype.setMagnitudeTo = function(item) {
		this.normalize();
		this.scalarMultiply(item);
		if (this.getMagnitude() !== item) {
			this.normalize();
			this.scalarMultiply(item);
			if (this.getMagnitude() !== item) {
				this.normalize();
				this.scalarMultiply(item);
			}
		}
		return this;
	};
	/**
Normalize the Vector to a unit vector
@method normalize
@return This
@chainable
**/
	my.Vector.prototype.normalize = function() {
		var m = this.getMagnitude();
		if (m > 0) {
			this.x /= m;
			this.y /= m;
			this.z /= m;
		}
		return this;
	};
	/**
Set all attributes to zero
@method zero
@return This
@chainable
**/
	my.Vector.prototype.zero = function() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		return this;
	};
	/**
Set attributes to new values
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	my.Vector.prototype.set = function(items) {
		items = my.safeObject(items);
		this.x = (my.xt(items.x)) ? items.x : this.x;
		this.y = (my.xt(items.y)) ? items.y : this.y;
		this.z = (my.xt(items.z)) ? items.z : this.z;
		return this;
	};
	/**
Compare two Vector objects for equality
@method isEqual
@param {Mixed} item Object to be tested against this
@return True if argument object is a Vector, and all attributes match; false otherwise
**/
	my.Vector.prototype.isEqual = function(item) {
		if (my.isa(item, 'vector')) {
			if (this.x === item.x && this.y === item.y && this.z === item.z) {
				return true;
			}
		}
		return false;
	};
	/**
Comparea vector-like object to this one for equality
@method isLike
@param {Mixed} item Object to be tested against this
@return True if all attributes match; false otherwise
**/
	my.Vector.prototype.isLike = function(item) {
		if (my.isa(item, 'obj')) {
			if (this.x === item.x && this.y === item.y && this.z === item.z) {
				return true;
			}
		}
		return false;
	};
	/**
extracts x and y data
@method getData
@return Object (not vector) with x and y attributes
**/
	my.Vector.prototype.getData = function() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		};
	};
	/**
Comparea vector-like object to this one for equality
@method hasCoordinates
@param {Mixed} item Object to be tested against this
@return True if argument possesses x and y attributes
**/
	my.Vector.prototype.hasCoordinates = function(item) {
		return (my.xta([item, item.x, item.y])) ? true : false;
	};
	/**
Add a Vector to this Vector

@method vectorAdd
@param {Object} item Vector to be added to this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorAdd = function(item) {
		item = my.safeObject(item);
		this.x += item.x || 0;
		this.y += item.y || 0;
		this.z += item.z || 0;
		return this;
	};
	/**
Subtract a Vector from this Vector
@method vectorSubtract
@param {Object} item Vector to be subtracted from this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorSubtract = function(item) {
		item = my.safeObject(item);
		this.x -= item.x || 0;
		this.y -= item.y || 0;
		this.z -= item.z || 0;
		return this;
	};
	/**
Multiply a Vector with this Vector
@method vectorMultiply
@param {Object} item Vector to be multiplied with this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorMultiply = function(item) {
		item = my.safeObject(item);
		this.x *= item.x || 1;
		this.y *= item.y || 1;
		this.z *= item.z || 1;
		return this;
	};
	/**
Divide a Vector into this Vector
@method vectorDivide
@param {Object} item Vector to be divided into this; can also be an Object with x, y and z attributes (all optional)
@return This
@chainable
**/
	my.Vector.prototype.vectorDivide = function(item) {
		item = my.safeObject(item);
		this.x /= ((item.x || 0) !== 0) ? item.x : 1;
		this.y /= ((item.y || 0) !== 0) ? item.y : 1;
		this.z /= ((item.z || 0) !== 0) ? item.z : 1;
		return this;
	};
	/**
Multiply this Vector by a scalar value
@method scalarMultiply
@param {Number} item Multiplier scalar
@return This
@chainable
**/
	my.Vector.prototype.scalarMultiply = function(item) {
		if (my.isa(item, 'num')) {
			this.x *= item;
			this.y *= item;
			this.z *= item;
			return this;
		}
		console.log('Vector.scalarMultiply() error: argument is not a number');
		return this;
	};
	/**
Divide this Vector by a scalar value
@method scalarDivide
@param {Number} item Division scalar
@return This
@chainable
**/
	my.Vector.prototype.scalarDivide = function(item) {
		if (my.isa(item, 'num') && item !== 0) {
			this.x /= item;
			this.y /= item;
			this.z /= item;
			return this;
		}
		console.log('Vector.scalarDivide() error: argument is not a number, or is zero');
		return this;
	};
	/**
Retrieve Vector's magnitude value
@method getMagnitude
@return Magnitude value
**/
	my.Vector.prototype.getMagnitude = function() {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	};
	/**
Check to see if Vector is a zero vector
@method checkNotZero 
@return True if Vector is non-zero; false otherwise
**/
	my.Vector.prototype.checkNotZero = function() {
		return (this.x || this.y || this.z) ? true : false;
	};
	/**
Return a clone of this Vector
@method getVector
@return Clone of this Vector
**/
	my.Vector.prototype.getVector = function() {
		console.log('Vector.getVector');
		return my.newVector({
			x: this.x,
			y: this.y,
			z: this.z
		});
	};
	/**
Obtain the cross product of one Vector and a copy of this, or another, Vector

Arithmetic is v(crossProduct)u, not u(crossProduct)v

@method getCrossProduct
@param {Object} u Vector to be used to calculate cross product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source vector (by default: this)
@return New cross product Vector; this on failure
@chainable
**/
	my.Vector.prototype.getCrossProduct = function(u, v) {
		console.log('Vector.getCrossProduct');
		if (my.isa(u, 'vector')) {
			v = (my.isa(v, 'vector')) ? v : this;
			var v1x = v.x || 0;
			var v1y = v.y || 0;
			var v1z = v.z || 0;
			var v2x = u.x || 0;
			var v2y = u.y || 0;
			var v2z = u.z || 0;
			return my.newVector({
				x: (v1y * v2z) - (v1z * v2y),
				y: -(v1x * v2z) + (v1z * v2x),
				z: (v1x * v2y) + (v1y * v2x),
			});
		}
		console.log('Vector.getCrossProduct() error: argument is not a Vector');
		return this;
	};
	/**
Obtain the dot product of one Vector and this, or another, Vector

Arithmetic is v(dotProduct)u, not u(dotProduct)v

@method getDotProduct
@param {Object} u Vector to be used to calculate dot product; can also be an Object with x, y and z attributes (all optional)
@param {Vector} [v] Source vector (by default: this)
@return Dot product result; false on failure
**/
	my.Vector.prototype.getDotProduct = function(u, v) {
		if (my.isa(u, 'vector')) {
			v = (my.isa(v, 'vector')) ? v : this;
			return ((u.x || 0) * (v.x || 0)) + ((u.y || 0) * (v.y || 0)) + ((u.z || 0) * (v.z || 0));
		}
		console.log('Vector.getDotProduct() error: argument is not a Vector');
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
	my.Vector.prototype.getTripleScalarProduct = function(u, v, w) {
		if (my.isa(u, 'vector') && my.isa(v, 'vector')) {
			w = (my.safeObject(w)) ? w : this;
			var ux = u.x || 0;
			var uy = u.y || 0;
			var uz = u.z || 0;
			var vx = v.x || 0;
			var vy = v.y || 0;
			var vz = v.z || 0;
			var wx = w.x || 0;
			var wy = w.y || 0;
			var wz = w.z || 0;
			return (ux * ((vy * wz) - (vz * wy))) + (uy * (-(vx * wz) + (vz * wx))) + (uz * ((vx * wy) - (vy * wx)));
		}
		console.log('Vector.getTripleScalarProduct() error: argument is not a Vector');
		return false;
	};
	/**
Rotate the Vector by a given angle
@method rotate
@param {Number} angle Rotation angle (in degrees)
@return This
@chainable
**/
	my.Vector.prototype.rotate = function(angle) {
		if (my.isa(angle, 'num')) {
			var a = Math.atan2(this.y, this.x);
			a += (angle * my.radian);
			var m = this.getMagnitude();
			this.x = m * Math.cos(a);
			this.y = m * Math.sin(a);
			return this;
		}
		console.log('Vector.rotate() error: argument is not a Number');
		return this;
	};
	/**
Rotate the Vector by 180 degrees
@method reverse
@return This
@chainable
**/
	my.Vector.prototype.reverse = function() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	};
	/**
Rotate a Vector object by a Quaternion rotation
@method quaternionMultiply
@param {Quaternion} item Quaternion object
@param {Number} [mag] Magnitude value to which Vector needs to be set after rotation
@return Amended version of Vector; this on failure
@chainable
**/
	my.Vector.prototype.rotate3d = function(item, mag) {
		if (my.isa(item, 'quaternion')) {
			mag = (scrawl.isa(mag, 'num')) ? mag : this.getMagnitude();
			var q1 = my.workquat.q1.set(item),
				q2 = my.workquat.q2.set(this),
				q3 = my.workquat.q3.set(item).conjugate();
			q1.quaternionMultiply(q2);
			q1.quaternionMultiply(q3);
			this.set(q1.v).setMagnitudeTo(mag);
			return this;
		}
		console.log('Vector.rotate3d() error: argument is not a Quaternion');
		return this;
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
**/
	my.Quaternion = function(items) {
		items = my.safeObject(items);
		var vector = my.safeObject(items.v);
		this.name = items.name || 'generic';
		this.n = items.n || 1;
		this.v = my.newVector({
			x: vector.x || items.x || 0,
			y: vector.y || items.y || 0,
			z: vector.z || items.z || 0,
		});
		return this;
	};
	my.Quaternion.prototype = Object.create(Object.prototype);
	/**
@property type
@type String
@default 'Quaternion'
@final
**/
	my.Quaternion.prototype.type = 'Quaternion';
	my.d.Quaternion = {
		/**
Quaternion name
@property name
@type String
@default 'generic'
**/
		name: 'generic',
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
		v: {
			x: 0,
			y: 0,
			z: 0
		},
	};
	/**
set to zero quaternion (n = 1)
@method zero
@return This
@chainable
**/
	my.Quaternion.prototype.zero = function() {
		this.n = 1;
		this.v.x = 0;
		this.v.y = 0;
		this.v.z = 0;
		return this;
	};
	/**
Calculate magnitude of a quaternion
@method getMagnitude
@return Magnitude value
**/
	my.Quaternion.prototype.getMagnitude = function() {
		return Math.sqrt((this.n * this.n) + (this.v.x * this.v.x) + (this.v.y * this.v.y) + (this.v.z * this.v.z));
	};
	/**
Normalize the quaternion
@method normalize
@return This
@chainable
**/
	my.Quaternion.prototype.normalize = function() {
		var mag = this.getMagnitude();
		if (mag !== 0) {
			this.n /= mag;
			this.v.x /= mag;
			this.v.y /= mag;
			this.v.z /= mag;
		}
		return this;
	};
	/**
Check to see if quaternion is a unit quaternion, within permitted tolerance
@method checkNormal
@param {Number} [tolerance] Tolerance value; default: 0
@return True if quaternion is a normalized quaternion; false otherwise
**/
	my.Quaternion.prototype.checkNormal = function(tolerance) {
		tolerance = (my.xt(tolerance)) ? tolerance : 0;
		var check = this.getMagnitude();
		if (check >= 1 - tolerance && check <= 1 + tolerance) {
			return true;
		}
		return false;
	};
	/**
Retrieve quaternion's vector (rotation axis) component
@method getVector
@return Vector component
**/
	my.Quaternion.prototype.getVector = function() {
		return this.v;
	};
	/**
Retrieve quaternion's scalar (rotation around axis) component
@method getScalar
@return Number - scalar component of this quaternion
**/
	my.Quaternion.prototype.getScalar = function() {
		return this.n;
	};
	/**
Add a quaternion to this quaternion
@method quaternionAdd
@param {Quaternion} item Quaternion to be added to this quaternion
@return This
@chainable
**/
	my.Quaternion.prototype.quaternionAdd = function(item) {
		if (my.isa(item, 'quaternion')) {
			this.n += item.n || 0;
			this.v.x += item.v.x || 0;
			this.v.y += item.v.y || 0;
			this.v.z += item.v.z || 0;
			return this;
		}
		console.log('Quaternion.quaternionAdd() error: argument is not a Quaternion object');
		return this;
	};
	/**
Subtract a quaternion from this quaternion
@method quaternionSubtract
@param {Quaternion} item Quaternion to be subtracted from this quaternion
@return This
@chainable
**/
	my.Quaternion.prototype.quaternionSubtract = function(item) {
		if (my.isa(item, 'quaternion')) {
			this.n -= item.n || 0;
			this.v.x -= item.v.x || 0;
			this.v.y -= item.v.y || 0;
			this.v.z -= item.v.z || 0;
			return this;
		}
		console.log('Quaternion.quaternionSubtract() error: argument is not a Quaternion object');
		return this;
	};
	/**
Multiply quaternion by a scalar value
@method scalarMultiply
@param {Number} item Value to multiply quaternion by
@return This
**/
	my.Quaternion.prototype.scalarMultiply = function(item) {
		if (my.isa(item, 'num')) {
			this.n *= item;
			this.v.x *= item;
			this.v.y *= item;
			this.v.z *= item;
			return this;
		}
		console.log('Quaternion.scalarMultiply() error: argument is not a number');
		return this;
	};
	/**
Divide quaternion by a scalar value
@method scalarDivide
@param {Number} item Value to divide quaternion by
@return This
@chainable
**/
	my.Quaternion.prototype.scalarDivide = function(item) {
		if (my.isa(item, 'num') && item !== 0) {
			this.n /= item;
			this.v.x /= item;
			this.v.y /= item;
			this.v.z /= item;
			return this;
		}
		console.log('Quaternion.scalarMultiply() error: argument is not a number, or is zero');
		return this;
	};
	/**
Conjugate (reverse) value for this quaternion
@method conjugate
@return Conjugated quaternion
**/
	my.Quaternion.prototype.conjugate = function() {
		this.v.x = -this.v.x;
		this.v.y = -this.v.y;
		this.v.z = -this.v.z;
		return this;
	};
	/**
Set the values for this quaternion

Argument object can contain the following attributes:

* for the scalar (n) value, __scalar__ or __n__ (Number)
* for the vector (v) value, __vector__ or __v__ (Vector object, or object containing xyz attribnutes)
* for the x value (v.x), __x__ (Number)
* for the y value (v.y), __y__ (Number)
* for the z value (v.z), __z__ (Number)

If the argument object includes values for __pitch__, __yaw__ or __roll__, the set will be performed via the setFromEuler() function

Argument can also be either an existing Quaternion object, or an existing Vector object - for vectors, the scalar value will be set to 0
@method set
@param items Object containing key:value attributes
@return Amended quaternion
**/
	my.Quaternion.prototype.set = function(items) {
		items = my.safeObject(items);
		var x, y, z, n, v;
		if (my.isa(items, 'quaternion')) {
			return this.setFromQuaternion(items);
		}
		if (my.isa(items, 'vector')) {
			return this.setFromVector(items);
		}
		if (my.xto([items.pitch, items.yaw, items.roll])) {
			return this.setFromEuler(items);
		}
		v = (my.xt(items.vector) || my.xt(items.v)) ? (items.vector || items.v) : false;
		n = (my.xt(items.scalar) || my.xt(items.n)) ? (items.scalar || items.n || 0) : false;
		x = (v) ? (v.x || 0) : items.x;
		y = (v) ? (v.y || 0) : items.y;
		z = (v) ? (v.z || 0) : items.z;
		this.n = (my.isa(n, 'num')) ? n : this.n;
		this.v.x = (my.isa(x, 'num')) ? x : this.v.x;
		this.v.y = (my.isa(y, 'num')) ? y : this.v.y;
		this.v.z = (my.isa(z, 'num')) ? z : this.v.z;
		return this;
	};
	/**
Set the values for this quaternion based on the values of the argument quaternion
@method setFromQuaternion
@param {Quaternion} item Reference quaternion
@return This
@chainable
**/
	my.Quaternion.prototype.setFromQuaternion = function(item) {
		if (my.isa(item, 'quaternion')) {
			this.n = item.n;
			this.v.x = item.v.x;
			this.v.y = item.v.y;
			this.v.z = item.v.z;
			return this;
		}
		console.log('Quaternion.setFromQuaternion() error: argument is not a Quaternion object');
		return this;
	};
	/**
Set the values for this quaternion based on the values of the reference vector
@method setFromVector
@param {Vector} item Reference vector
@return This
@chainable
**/
	my.Quaternion.prototype.setFromVector = function(item) {
		if (my.isa(item, 'vector')) {
			this.n = 0;
			this.v.x = item.x;
			this.v.y = item.y;
			this.v.z = item.z;
			return this;
		}
		console.log('Quaternion.setFromVector() error: argument is not a Vector object');
		return this;
	};
	/**
Multiply this quaternion by a second quaternion

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method quaternionMultiply
@param {Quaternion} item Quaternion to multiply this quaternion by
@return This
@chainable
**/
	my.Quaternion.prototype.quaternionMultiply = function(item) {
		if (my.isa(item, 'quaternion')) {
			var n1 = this.n,
				x1 = this.v.x,
				y1 = this.v.y,
				z1 = this.v.z,
				n2 = item.n,
				x2 = item.v.x,
				y2 = item.v.y,
				z2 = item.v.z;
			this.n = (n1 * n2) - (x1 * x2) - (y1 * y2) - (z1 * z2);
			this.v.x = (n1 * x2) + (x1 * n2) + (y1 * z2) - (z1 * y2);
			this.v.y = (n1 * y2) + (y1 * n2) + (z1 * x2) - (x1 * z2);
			this.v.z = (n1 * z2) + (z1 * n2) + (x1 * y2) - (y1 * x2);
			return this;
		}
		console.log('Quaternion.quaternionMultiply() error: argument is not a Quaternion object');
		return this;
	};
	/**
Multiply this quaternion by a Vector

_Quaternion multiplication is not comutative - arithmetic is this*item, not item*this_
@method getVectorMultiply
@param {Vector} item Vector to multiply this quaternion by
@return This
@chainable
**/
	my.Quaternion.prototype.vectorMultiply = function(item) {
		if (my.isa(item, 'vector')) {
			var n1 = this.n,
				x1 = this.v.x,
				y1 = this.v.y,
				z1 = this.v.z,
				x2 = item.x,
				y2 = item.y,
				z2 = item.z;
			this.n = -((x1 * x2) + (y1 * y2) + (z1 * z2));
			this.v.x = (n1 * x2) + (y1 * z2) - (z1 * y2);
			this.v.y = (n1 * y2) + (z1 * x2) - (x1 * z2);
			this.v.z = (n1 * z2) + (x1 * y2) - (y1 * x2);
			return this;
		}
		console.log('Quaternion.vectorMultiply() error: argument is not a Vector object');
		return this;
	};
	/**
Retrieve rotational component of this quaternion
@method getAngle
@param {Boolean} [degree] Returns rotation in degrees if true; false (radians) by default
@return Rotation angle
**/
	my.Quaternion.prototype.getAngle = function(degree) {
		degree = (my.xt(degree)) ? degree : false;
		var result = 2 * Math.acos(this.n);
		return (degree) ? result * (1 / my.radian) : result;
	};
	/**
Retrieve axis component of this quaternion
@method getAxis
@return Normalized Vector (scrawl.v Vector)
**/
	my.Quaternion.prototype.getAxis = function() {
		var vector = my.v.set(this.v),
			magnitude = this.getMagnitude();
		return (magnitude !== 0) ? vector.scalarDivide(magnitude) : vector;
	};
	/**
Rotate this quaternion by another quaternion

_Quaternion multiplication is not comutative - arithmetic is item (representing the local rotation to be applied) * this, not this * item (for which, use quaternionMultiply)_
@method quaternionRotate
@param {Quaternion} item Quaternion to rotate this quaternion by
@return This
@chainable
**/
	my.Quaternion.prototype.quaternionRotate = function(item) {
		if (my.isa(item, 'quaternion')) {
			var q4 = my.workquat.q4.set(item),
				q5 = my.workquat.q5.set(this);
			return this.set(q4.quaternionMultiply(q5));
		}
		console.log('Quaternion.quaternionRotate() error: argument is not a Quaternion object');
		return this;
	};
	/**
Rotate a Vector by this quaternion
@method vectorRotate
@param {Vector} item Vector to be rotated by this quaternion
@return Vector (amended argument); false on failure
**/
	my.Quaternion.prototype.vectorRotate = function(item) {
		if (my.isa(item, 'vector')) {
			return item.rotate3d(this);
		}
		console.log('Quaternion.vectorRotate() error: argument is not a Vector object');
		return false;
	};
	/**
Build a quaternion from Euler angle values

Argument object can be in the form, where all values (which default to 0) are in degrees:
* {pitch:Number, yaw:Number, roll:Number}
* {x:Number, y:Number, z:Number}
* or a mixture of the two
@method makeFromEuler
@param {Object} [items] Key:value Object argument for setting attributes
@return New quaternion
@example
	var myQuart = scrawl.quaternion.makeFromEuler({
		roll: 30,
		pitch: 90,
		yaw: 125,
		});
**/
	my.Quaternion.prototype.makeFromEuler = function(items) {
		console.log('makeFromEuler');
		items = my.safeObject(items);
		var pitch = (items.pitch || items.x || 0) * my.radian,
			yaw = (items.yaw || items.y || 0) * my.radian,
			roll = (items.roll || items.z || 0) * my.radian,
			c1 = Math.cos(yaw / 2),
			c2 = Math.cos(roll / 2),
			c3 = Math.cos(pitch / 2),
			s1 = Math.sin(yaw / 2),
			s2 = Math.sin(roll / 2),
			s3 = Math.sin(pitch / 2),
			w = (c1 * c2 * c3) - (s1 * s2 * s3),
			x = (s1 * s2 * c3) + (c1 * c2 * s3),
			y = (s1 * c2 * c3) + (c1 * s2 * s3),
			z = (c1 * s2 * c3) - (s1 * c2 * s3);
		return my.newQuaternion({
			n: w,
			x: x,
			y: y,
			z: z
		});
	};
	/**
Update quaternion with Euler angle values

Argument object can be in the form, where all values (which default to 0) are in degrees:
* {pitch:Number, yaw:Number, roll:Number}
* {x:Number, y:Number, z:Number}
* or a mixture of the two
@method setFromEuler
@param {Object} [items] Key:value Object argument for setting attributes
@return New quaternion
@example
	var myQuart = scrawl.quaternion.setFromEuler({
		roll: 30,
		pitch: 90,
		yaw: 125,
		});
**/
	my.Quaternion.prototype.setFromEuler = function(items) {
		items = my.safeObject(items);
		var pitch = (items.pitch || items.x || 0) * my.radian,
			yaw = (items.yaw || items.y || 0) * my.radian,
			roll = (items.roll || items.z || 0) * my.radian,
			c1 = Math.cos(yaw / 2),
			c2 = Math.cos(roll / 2),
			c3 = Math.cos(pitch / 2),
			s1 = Math.sin(yaw / 2),
			s2 = Math.sin(roll / 2),
			s3 = Math.sin(pitch / 2),
			w = (c1 * c2 * c3) - (s1 * s2 * s3),
			x = (s1 * s2 * c3) + (c1 * c2 * s3),
			y = (s1 * c2 * c3) + (c1 * s2 * s3),
			z = (c1 * s2 * c3) - (s1 * c2 * s3);
		return this.set({
			n: w,
			x: x,
			y: y,
			z: z
		});
	};
	/**
Retrieve rotations (Euler angles) from a quaternion
@method getEulerAngles
@return Object in the form {pitch:Number, yaw:Number, roll:Number}
**/
	my.Quaternion.prototype.getEulerAngles = function() {
		var sqw = this.n * this.n,
			sqx = this.v.x * this.v.x,
			sqy = this.v.y * this.v.y,
			sqz = this.v.z * this.v.z,
			unit = sqw + sqx + sqy + sqz,
			test = (this.v.x * this.v.y) + (this.v.z * this.n),
			result = {
				pitch: 0,
				yaw: 0,
				roll: 0
			},
			t0, t1;
		if (test > 0.499999 * unit) {
			result.yaw = (2 * Math.atan2(this.v.x, this.n)) / my.radian;
			result.roll = (Math.PI / 2) / my.radian;
			result.pitch = 0;
			return result;
		}
		if (test < -0.499999 * unit) {
			result.yaw = (-2 * Math.atan2(this.v.x, this.n)) / my.radian;
			result.roll = (-Math.PI / 2) / my.radian;
			result.pitch = 0;
			return result;
		}
		t0 = (2 * this.v.y * this.n) - (2 * this.v.x * this.v.z);
		t1 = sqx - sqy - sqz + sqw;
		result.yaw = (Math.atan2(t0, t1)) / my.radian;
		result.roll = (Math.asin((2 * test) / unit)) / my.radian;
		t0 = (2 * this.v.x * this.n) - (2 * this.v.y * this.v.z);
		t1 = sqy - sqx - sqz + sqw;
		result.pitch = (Math.atan2(t0, t1)) / my.radian;
		return result;
	};

	/**
# Base 

## Instantiation

* This object should never be instantiated by users

## Purpose

* the root object for all other Scrawl objects (except Vectors, Quaternions)
* gives every object its (unique) name attribute
* also supplies title and comment attributes (very basic assistive technology)
* provides basic getter and setter functions, and a JSON-based toString function
* sets out the cloning strategy for other objects, and restricts which object types can be cloned
@class Base
@constructor
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Base = function(items) {
		items = my.safeObject(items);
		/**
Unique identifier for each object; default: computer-generated String based on Object's type
@property name
@type String
**/
		this.name = my.makeName({
			name: items.name || '',
			type: this.type,
			target: this.classname
		});
		/**
Vector work space - not included in defaults
@property work
@type Object
@private
**/
		this.work = {};
		return this;
	};
	my.Base.prototype = Object.create(Object.prototype);
	/**
@property type
@type String
@default 'Base'
@final
**/
	my.Base.prototype.type = 'Base';
	my.Base.prototype.classname = 'objectnames';
	my.d.Base = {
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
Retrieve an attribute value. If the attribute value has not been set, then the default value for that attribute will be returned.
@method get
@param {String} item Attribute key
@return Attribute value
@example
	var box = scrawl.newBlock({
		width: 50,
		});
	box.get('width');				//returns 50
	box.get('height');				//returns 0
	box.get('favouriteAnimal');		//returns undefined
**/
	my.Base.prototype.get = function(item) {
		return (my.xt(this[item])) ? this[item] : my.d[this.type][item];
	};
	/**
Set attribute values. Multiple attributes can be set in the one call by including the attribute key:value pair in the argument object.

An attribute value will only be set if the object already has a default value for that attribute. This restricts the ability of coders to add attributes to Scrawl objects.
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
@example
	var box = scrawl.newBlock({
		width: 50,
		height: 50,
		});
	box.set({
		height: 100,
		favouriteAnimal: 'cat',
		});
	box.get('width');				//returns 50
	box.get('height');				//returns 100
	box.get('favouriteAnimal');		//returns undefined
**/
	my.Base.prototype.set = function(items) {
		for (var i in items) {
			if (my.xt(my.d[this.type][i])) {
				this[i] = items[i];
			}
		}
		return this;
	};
	/**
Clone a Scrawl.js object, optionally altering attribute values in the cloned object

(This function is replaced by the path module)

@method clone
@param {Object} items Object containing attribute key:value pairs; will overwrite existing values in the cloned, but not the source, Object
@return Cloned object
@chainable
@example
	var box = scrawl.newBlock({
		width: 50,
		height: 50,
		});
	var newBox = box.clone({
		height: 100,
		});
	newBox.get('width');		//returns 50
	newBox.get('height');		//returns 100
**/
	my.Base.prototype.clone = function(items) {
		var b = my.mergeOver(this.parse(), my.safeObject(items));
		delete b.context; //required for successful cloning of sprites
		return new my[this.type](b);
	};
	/**
Turn the object into a JSON String
@method toString
@return JSON string of non-default value attributes
**/
	my.Base.prototype.parse = function() {
		return JSON.parse(JSON.stringify(this));
	};
	/**
Restore workspece vector values to their current specified values
@method resetWork
@return always true
@private
**/
	my.Base.prototype.resetWork = function() {
		var keys = Object.keys(this.work);
		for (var i = 0, iz = keys.length; i < iz; i++) {
			this.work[keys[i]].set(this[keys[i]]);
		}
		return true;
	};

	/**
# Position

## Instantiation

* This object should never be instantiated by users

## Purpose

* supplies objects with basic positional and scaling attributes, and methods for manipulating them
* start coordinates are relative to the top left corner of the object's Cell
* handle coordinates are relative to the object's start coordinate

Certain Scrawl modules will add functionality to this object, for instance scrawlAnimation adds delta attributes which can be used to automatically update the position of a Scrawl sprite.
@class Position
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Position = function(items) {
		my.Base.call(this, items);
		items = my.safeObject(items);
		this.corePositionInit(items);
		this.animationPositionInit(items);
		this.pathPositionInit(items);
		return this;
	};
	my.Position.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Position'
@final
**/
	my.Position.prototype.type = 'Position';
	my.Position.prototype.classname = 'objectnames';
	my.d.Position = {
		/**
The coordinate Vector representing the object's rotation/flip point

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __startX__ - (Number) the x coordinate of the object's rotation/flip point, in pixels, from the left side of the object's cell
* __startY__ - (Number) the y coordinate of the object's rotation/flip point, in pixels, from the top side of the object's cell

@property start
@type Vector
**/
		start: {
			x: 0,
			y: 0,
			z: 0
		},
		/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property handle
@type Object
**/
		handle: {
			x: 0,
			y: 0,
			z: 0
		},
		/**
The SPRITENAME or POINTNAME of a sprite or Point object to be used for setting this object's start point
@property pivot
@type String
@default ''
**/
		pivot: '',
		/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		scale: 1,
		/**
Reflection flag; set to true to flip sprite, cell or element along the Y axis
@property flipReverse
@type Boolean
@default false
**/
		flipReverse: false,
		/**
Reflection flag; set to true to flip sprite, cell or element along the X axis
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
Current rotation of the sprite, cell or element (in degrees)
@property roll
@type Number
@default 0
**/
		roll: 0,
		/**
Sprite, cell or element width (in pixels)
@property width
@type Number
@default 0
**/
		width: 0,
		/**
Sprite, cell or element height (in pixels)
@property width
@type Number
@default 0
**/
		height: 0,
		/**
(Added by the path module)
The SPRITENAME of a Shape sprite whose path is used to calculate this object's start point
@property path
@type String
@default ''
**/
		/**
(Added by the path module)
A value between 0 and 1 to represent the distance along a Shape object's path, where 0 is the path start and 1 is the path end
@property pathPlace
@type Number
@default 0
**/
		/**
(Added by the path module)
A change value which can be applied to the object's pathPlace attribute
@property deltaPathPlace
@type Number
@default 0
**/
		/**
(Added by the path module)
A flag to determine whether the object will calculate its position along a Shape path in a regular (true), or simple (false), manner
@property pathSpeedConstant
@type Boolean
@default true
**/
	};
	my.mergeInto(my.d.Position, my.d.Base);
	/**
Position constructor hook function - core functionality
@method corePositionInit
@private
**/
	my.Position.prototype.corePositionInit = function(items) {
		var temp = my.safeObject(items.start);
		this.start = my.newVector({
			x: (my.xt(items.startX)) ? items.startX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.startY)) ? items.startY : ((my.xt(temp.y)) ? temp.y : 0),
			name: this.type + '.' + this.name + '.start',
		});
		this.work.start = my.newVector({
			name: this.type + '.' + this.name + '.work.start'
		});
		temp = my.safeObject(items.handle);
		this.handle = my.newVector({
			x: (my.xt(items.handleX)) ? items.handleX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.handleY)) ? items.handleY : ((my.xt(temp.y)) ? temp.y : 0),
			name: this.type + '.' + this.name + '.handle',
		});
		this.work.handle = my.newVector({
			name: this.type + '.' + this.name + '.work.handle'
		});
		this.pivot = items.pivot || my.d[this.type].pivot;
		this.scale = (my.isa(items.scale, 'num')) ? items.scale : my.d[this.type].scale;
		this.roll = (my.isa(items.roll, 'num')) ? items.roll : my.d[this.type].roll;
		this.flipReverse = (my.isa(items.flipReverse, 'bool')) ? items.flipReverse : my.d[this.type].flipReverse;
		this.flipUpend = (my.isa(items.flipUpend, 'bool')) ? items.flipUpend : my.d[this.type].flipUpend;
		this.lockX = (my.isa(items.lockX, 'bool')) ? items.lockX : my.d[this.type].lockX;
		this.lockY = (my.isa(items.lockY, 'bool')) ? items.lockY : my.d[this.type].lockY;
		this.offset = my.newVector({
			name: this.type + '.' + this.name + '.offset'
		});
		this.offset.flag = false;
	};
	/**
Position constructor hook function - modified by animation module
@method animationPositionInit
@private
**/
	my.Position.prototype.animationPositionInit = function(items) {};
	/**
Position constructor hook function - modified by path module
@method pathPositionInit
@private
**/
	my.Position.prototype.pathPositionInit = function(items) {};
	/**
Augments Base.get(), to allow users to get values for start, startX, startY, handle, handleX, handleY

For 'start' and 'handle', returns a copy of the Vector
@method get
@param {String} get Attribute key
@return Attribute value
**/
	my.Position.prototype.get = function(item) {
		var u;
		if (my.contains(['startX', 'startY', 'handleX', 'handleY'], item)) {
			switch (item) {
				case 'startX':
					return this.start.x;
				case 'startY':
					return this.start.y;
				case 'handleX':
					return this.handle.x;
				case 'handleY':
					return this.handle.y;
			}
		}
		return (this.animationPositionGet(item) || my.Base.prototype.get.call(this, item));
	};
	/**
Position.get hook function - modified by animation module
@method animationPositionGet
@private
**/
	my.Position.prototype.animationPositionGet = function(item) {
		return false;
	};
	/**
Augments Base.set(), to allow users to set the start and handle attributes using startX, startY, handleX, handleY
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.set = function(items) {
		items = my.safeObject(items);
		my.Base.prototype.set.call(this, items);
		if (!my.isa(this.start, 'vector')) {
			this.start = my.newVector(items.start || this.start);
		}
		if (my.xto([items.startX, items.startY])) {
			this.start.x = (my.xt(items.startX)) ? items.startX : this.start.x;
			this.start.y = (my.xt(items.startY)) ? items.startY : this.start.y;
		}
		if (!my.isa(this.handle, 'vector')) {
			this.handle = my.newVector(items.handle || this.handle);
		}
		if (my.xto([items.handleX, items.handleY])) {
			this.handle.x = (my.xt(items.handleX)) ? items.handleX : this.handle.x;
			this.handle.y = (my.xt(items.handleY)) ? items.handleY : this.handle.y;
		}
		this.animationPositionSet(items);
		return this;
	};
	/**
Position.set hook function - modified by animation module
@method animationPositionSet
@private
**/
	my.Position.prototype.animationPositionSet = function(items) {};
	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function. This function also accepts startX, startY, handleX, handleY
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDelta = function(items) {
		items = my.safeObject(items);
		var temp;
		if (my.xto([items.start, items.startX, items.startY])) {
			temp = my.safeObject(items.start);
			this.start.x += (my.xt(items.startX)) ? items.startX : ((my.xt(temp.x)) ? temp.x : 0);
			this.start.y += (my.xt(items.startY)) ? items.startY : ((my.xt(temp.y)) ? temp.y : 0);
		}
		my.Position.prototype.pathPositionSetDelta.call(this, items);
		if (my.xto([items.handle, items.handleX, items.handleY]) && my.isa(this.handle.x, 'num') && my.isa(this.handle.y, 'num')) {
			temp = my.safeObject(items.handle);
			this.handle.x += (my.xt(items.handleX)) ? items.handleX : ((my.xt(temp.x)) ? temp.x : 0);
			this.handle.y += (my.xt(items.handleY)) ? items.handleY : ((my.xt(temp.y)) ? temp.y : 0);
		}
		if (items.scale) {
			this.scale += items.scale;
		}
		return this;
	};
	/**
Position.setDelta hook function - modified by path module
@method pathPositionSetDelta
@private
**/
	my.Position.prototype.pathPositionSetDelta = function(items) {};
	/**
Augments Base.clone(), to allow users to set the start and handle attributes using startX, startY, handleX, handleY

@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	my.Position.prototype.clone = function(items) {
		items = my.safeObject(items);
		var a = my.Base.prototype.clone.call(this, items),
			temp;
		temp = my.safeObject(items.start);
		a.start = my.newVector({
			x: (my.xt(items.startX)) ? items.startX : ((my.xt(temp.x)) ? temp.x : a.start.x),
			y: (my.xt(items.startY)) ? items.startY : ((my.xt(temp.y)) ? temp.y : a.start.y),
			name: a.type + '.' + a.name + '.start',
		});
		temp = my.safeObject(items.handle);
		a.handle = my.newVector({
			x: (my.xt(items.handleX)) ? items.handleX : ((my.xt(temp.x)) ? temp.x : a.handle.x),
			y: (my.xt(items.handleY)) ? items.handleY : ((my.xt(temp.y)) ? temp.y : a.handle.y),
			name: a.type + '.' + a.name + '.handle',
		});
		a = this.animationPositionClone(a, items);
		return a;
	};
	/**
Position.setDelta hook function - modified by animation module
@method animationPositionClone
@private
**/
	my.Position.prototype.animationPositionClone = function(a, items) {
		return a;
	};
	/**
Position.getOffsetStartVector() helper function. Supervises the calculation of the pixel values for the object's handle attribute, where the object's frame of reference is its top-left corner

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite/cell/element drawing should start
@private
**/
	my.Position.prototype.getPivotOffsetVector = function() {
		var result = this.work.handle,
			height = this.targetHeight || this.height || this.get('height'),
			width = this.targetWidth || this.width || this.get('width');
		return my.Position.prototype.calculatePOV.call(this, result, width, height, false);
	};
	/**
Position.getOffsetStartVector() helper function. Supervises the calculation of the pixel values for the object's handle attribute, where the object's frame of reference is its center

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getCenteredPivotOffsetVector
@return A Vector of calculated offset values to help determine where sprite/cell/element drawing should start
@private
**/
	my.Position.prototype.getCenteredPivotOffsetVector = function() {
		var result = this.work.handle,
			height = this.targetHeight || this.height || this.get('height'),
			width = this.targetWidth || this.width || this.get('width');
		return my.Position.prototype.calculatePOV.call(this, result, width, height, true);
	};
	/**
Position.getOffsetStartVector() helper function. Calculates the pixel values for the object's handle attribute

@method calculatePOV
@param {Vector} result - object's handle vector
@param {Number} width - object's width (pixels)
@param {Number} height - object's height (pixels)
@param {Boolean} centered - true if object's frame of reference is its center point; false otherwise
@return A Vector of calculated offset values
@private
**/
	my.Position.prototype.calculatePOV = function(result, width, height, centered) {
		width = (my.isa(width, 'num')) ? width : 0;
		height = (my.isa(height, 'num')) ? height : 0;
		centered = (my.isa(centered, 'bool')) ? centered : false;
		if ((my.isa(result.x, 'str')) && !my.contains(['left', 'center', 'right'], result.x)) {
			result.x = (centered) ? ((parseFloat(result.x) / 100) * width) - (width / 2) : (parseFloat(result.x) / 100) * width;
		}
		else {
			switch (result.x) {
				case 'left':
					result.x = (centered) ? -(width / 2) : 0;
					break;
				case 'center':
					result.x = (centered) ? 0 : width / 2;
					break;
				case 'right':
					result.x = (centered) ? width / 2 : width;
					break;
			}
		}
		if ((my.isa(result.y, 'str')) && !my.contains(['top', 'center', 'bottom'], result.y)) {
			result.y = (centered) ? ((parseFloat(result.y) / 100) * height) - (height / 2) : (parseFloat(result.y) / 100) * height;
		}
		else {
			switch (result.y) {
				case 'top':
					result.y = (centered) ? -(height / 2) : 0;
					break;
				case 'center':
					result.y = (centered) ? 0 : height / 2;
					break;
				case 'bottom':
					result.y = (centered) ? height / 2 : height;
					break;
			}
		}
		return result;
	};
	/**
Calculates the pixel values of the object's handle attribute
@method getOffsetStartVector
@return Final offset values (as a Vector) to determine where sprite, cell or element drawing should start
**/
	my.Position.prototype.getOffsetStartVector = function() {
		this.resetWork();
		var sx = (my.isa(this.handle.x, 'str')) ? this.scale : 1,
			sy = (my.isa(this.handle.y, 'str')) ? this.scale : 1,
			myH = this.getPivotOffsetVector();
		myH.x *= sx;
		myH.y *= sy;
		return myH.reverse();
	};
	/**
Stamp helper function - set this sprite, cell or element start values to its pivot sprite/point start value, or to the current mouse coordinates

Takes into account lock flag settings
@method setStampUsingPivot
@param {String} [cell] CELLNAME String
@return This
@chainable
@private
**/
	my.Position.prototype.setStampUsingPivot = function(cell) {
		var myP,
			myPVector,
			pSprite;
		if (my.xt(my.pointnames) && my.contains(my.pointnames, this.pivot)) {
			myP = my.point[this.pivot];
			pSprite = my.sprite[myP.sprite];
			myPVector = myP.getCurrentCoordinates().rotate(pSprite.roll).vectorAdd(pSprite.start);
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			return this;
		}
		if (my.contains(my.spritenames, this.pivot)) {
			myP = my.sprite[this.pivot];
			myPVector = (myP.type === 'Particle') ? myP.get('place') : myP.start;
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			return this;
		}
		if (this.pivot === 'mouse') {
			var myCell = my.cell[cell],
				myPad = my.pad[myCell.pad],
				here = this.correctCoordinates(myPad.mouse, cell);
			if (!my.xta([this.oldX, this.oldY])) {
				this.oldX = this.start.x;
				this.oldY = this.start.y;
			}
			this.start.x = (!this.lockX) ? this.start.x + here.x - this.oldX : this.start.x;
			this.start.y = (!this.lockY) ? this.start.y + here.y - this.oldY : this.start.y;
			this.oldX = here.x;
			this.oldY = here.y;
		}
		return this;
	};
	/**
Stamp helper function - correct mouse coordinates if pad dimensions not equal to base cell dimensions

Takes into account lock flag settings
@method correctCoordinates
@param {Object} coords An object containing x and y attributes
@param {String} [cell] CELLNAME String
@return Amended coordinate object
**/
	my.Position.prototype.correctCoordinates = function(coords, cell) {
		coords = my.safeObject(coords);
		var v = my.v.set(coords);
		if (scrawl.xta([coords.x, coords.y])) {
			cell = (my.contains(my.cellnames, cell)) ? my.cell[cell] : my.cell[my.pad[my.currentPad].base];
			var pad = my.pad[cell.pad];
			if (pad.width !== cell.actualWidth) {
				v.x /= (pad.width / cell.actualWidth);
			}
			if (pad.height !== cell.actualHeight) {
				v.y /= (pad.height / cell.actualHeight);
			}
			return v;
		}
		return false;
	};

	/**
# PageElement

## Instantiation

* This object should never be instantiated by users

## Purpose

* supplies DOM elements with basic dimensional, positional and scaling attributes, and methods for manipulating them

The core implementation of this object is a stub that supplies Pad objects with basic mouse position support. The stacks module will substantially modify it to provide CSS3 3d positioning and animation functionality for Stack, Element and Pad objects. 

@class PageElement
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.PageElement = function(items) {
		items = my.safeObject(items);
		my.Base.call(this, items);
		this.scale = (my.isa(items.scale, 'num')) ? items.scale : my.d[this.type].scale;
		this.stacksPageElementConstructor(items);
		return this;
	};
	my.PageElement.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'PageElement'
@final
**/
	my.PageElement.prototype.type = 'PageElement';
	my.PageElement.prototype.classname = 'objectnames';
	my.d.PageElement = {
		/**
DOM element width
@property width
@type Number
@default 300
**/
		width: 300,
		/**
DOM element height
@property height
@type Number
@default 150
**/
		height: 150,
		/**
DOM element's current horizontal offset from the top of the web page
@property displayOffsetX
@type Number
@default 0
**/
		displayOffsetX: 0,
		/**
DOM element's current vertical offset from the left side of the web page
@property displayOffsetY
@type Number
@default 0
**/
		displayOffsetY: 0,
		/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		scale: 1,
		/**
Mouse vector - holds the mouse pointer coordinates relative to the top left corner of the element

When instantiating DOM element wrappers (Pad, Stack, Element), setting this attribute to true will make Scrawl add a mousemove event listener to the element. By default, Pads and Stacks will add the event listener to the &lt;canvas&gt; or &lt;div&gt; element (mouse == true); Elements will not (mouse == false).

The event listener can be added to, or removed from, an element at any time using the set() function with an argument attribute of _mouse: true_ or _mouse: false_.

The functions _addMouseMove()_ and _removeMouseMove()_ can also be called directly.

@property mouse
@type Vector
@default false
**/
		mouse: false,
		/**
Element CSS position styling attribute
@property position
@type String
@default 'static'
**/
		position: 'static',
	};
	my.mergeInto(my.d.PageElement, my.d.Base);
	/**
PageElement constructor hook function - modified by stacks module
@method stacksPageElementConstructor
@private
**/
	my.PageElement.prototype.stacksPageElementConstructor = function(items) {};
	/**
Augments Base.get() to retrieve DOM element width and height values

(The stack module replaces this core function rather than augmenting it via a hook function)

@method get
@param {String} get Attribute key
@return Attribute value
**/
	my.PageElement.prototype.get = function(item) {
		var el = this.getElement();
		if (my.contains(['width', 'height'], item)) {
			switch (item) {
				case 'width':
					return this.width || parseFloat(el.width) || my.d[this.type].width;
				case 'height':
					return this.height || parseFloat(el.height) || my.d[this.type].height;
				case 'position':
					return this.position || el.style.position;
			}
		}
		return my.Base.prototype.get.call(this, item);
	};
	/**
Augments Base.set() to allow the setting of DOM element dimension values

(The stack module replaces this core function rather than augmenting it via a hook function)

@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.PageElement.prototype.set = function(items) {
		items = my.safeObject(items);
		my.Base.prototype.set.call(this, items);
		var el = this.getElement();
		if (my.xto([items.width, items.height, items.scale])) {
			this.setDimensions();
			this.setDisplayOffsets();
		}
		if (my.xt(items.position)) {
			this.position = items.position;
		}
		if (my.xt(items.mouse)) {
			this.initMouse({
				mouse: items.mouse
			});
		}
		if (my.xt(items.pivot)) {
			this.pivot = items.pivot;
			if (!this.pivot) {
				delete this.oldX;
				delete this.oldY;
			}
		}
		if (my.xto([items.title, items.comment])) {
			this.setAccessibility(items);
		}
		return this;
	};
	/**
Handles the setting of DOM element title and data-comment attributes
@method setAccessibility
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.PageElement.prototype.setAccessibility = function(items) {
		items = my.safeObject(items);
		var el = this.getElement();
		if (my.xt(items.title)) {
			this.title = items.title;
			el.title = this.title;
		}
		if (my.xt(items.comment)) {
			this.comment = items.comment;
			el.setAttribute('data-comment', this.comment);
		}
		return this;
	};
	/**
Calculate the DOM element's current display offset values
@method setDisplayOffsets
@return This
@chainable
**/
	my.PageElement.prototype.setDisplayOffsets = function() {
		var dox = 0,
			doy = 0,
			myDisplay = this.getElement();
		if (myDisplay.offsetParent) {
			do {
				dox += myDisplay.offsetLeft;
				doy += myDisplay.offsetTop;
				myDisplay = myDisplay.offsetParent;
			} while (myDisplay.offsetParent);
		}
		this.displayOffsetX = dox;
		this.displayOffsetY = doy;
		return this;
	};
	/**
Scale DOM element dimensions (width, height)
@method scaleDimensions
@param {Number} item Scale value
@return This
@chainable
**/
	my.PageElement.prototype.scaleDimensions = function(item) {
		if (my.isa(item, 'num')) {
			this.scale = item;
			this.setDimensions();
		}
		return this;
	};
	/**
Helper function - set DOM element dimensions (width, height)
@method setDimensions
@return This
@chainable
@private
**/
	my.PageElement.prototype.setDimensions = function() {
		var el = this.getElement();
		el.style.width = (this.width * this.scale) + 'px';
		el.style.height = (this.height * this.scale) + 'px';
		return this;
	};
	/**
Retrieve details of the Mouse cursor position in relation to the DOM element's top left hand corner. Most useful for determining mouse cursor position over Stack and Pad (visible &lt;canvas&gt;) elements.

_Note: if changes are made elsewhere to the web page (DOM) after the page loads, the function .getDisplayOffsets() will need to be called to recalculate the element's position within the page - failure to do so will lead to this function returning incorrect data. getDisplayOffsets() does not need to be called during/after page scrolling._

The returned object is a Vector containing the mouse cursor's current x and y coordinates in relation to the DOM element's top left corner, together with the following additional attributes:

* __active__ - set to true if mouse is hovering over the element; false otherwise
* __type__ - element's type ('stack', 'element', 'pad')
* __element__ - Scrawl wrapper object's name attribute
* __type__ - Scrawl wrapper object's type ('Pad', 'Stack', 'Element')
* __layer__ - true if coordinates have been calculated using e.layerX, e.layerY; false otherwise
@method getMouse
@return Vector containing localized mouse coordinates, with additional attributes
**/
	my.PageElement.prototype.getMouse = function() {
		return this.mouse;
	};
	/**
mousemove event listener function
@method handleMouseMove
@param {Object} e window.event
@return This
@private
**/
	my.PageElement.prototype.handleMouseMove = function(e) {
		e = (my.xt(e)) ? e : window.event;
		var wrap = scrawl.pad[e.target.id] || scrawl.stack[e.target.id] || scrawl.element[e.target.id] || false,
			mouseX = 0,
			mouseY = 0,
			maxX,
			maxY;
		if (wrap) {
			wrap.mouse.active = false;
			wrap.mouse.element = wrap.name;
			wrap.mouse.type = wrap.type;
			if (wrap.mouse.layer || my.xta([e, e.layerX]) && my.contains(['relative', 'absolute', 'fixed', 'sticky'], wrap.position)) {
				mouseX = e.layerX;
				mouseY = e.layerY;
				if (mouseX >= 0 && mouseX <= (wrap.width * wrap.scale) && mouseY >= 0 && mouseY <= (wrap.height * wrap.scale)) {
					wrap.mouse.active = true;
				}
				wrap.mouse.x = e.layerX * (1 / wrap.scale);
				wrap.mouse.y = e.layerY * (1 / wrap.scale);
				wrap.mouse.layer = true;
			}
			else {
				if (e.pageX || e.pageY) {
					mouseX = e.pageX;
					mouseY = e.pageY;
				}
				else if (e.clientX || e.clientY) {
					mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
				maxX = wrap.displayOffsetX + (wrap.width * wrap.scale);
				maxY = wrap.displayOffsetY + (wrap.height * wrap.scale);
				if (mouseX >= wrap.displayOffsetX && mouseX <= maxX && mouseY >= wrap.displayOffsetY && mouseY <= maxY) {
					wrap.mouse.active = true;
				}
				wrap.mouse.x = (mouseX - wrap.displayOffsetX) * (1 / wrap.scale);
				wrap.mouse.y = (mouseY - wrap.displayOffsetY) * (1 / wrap.scale);
				wrap.mouse.layer = false;
			}
		}
		return wrap;
	};
	/**
mouseout event listener function
@method handleMouseOut
@param {Object} e window.event
@return This
@private
**/
	my.PageElement.prototype.handleMouseOut = function(e) {
		e = (my.xt(e)) ? e : window.event;
		var wrap = scrawl.pad[e.target.id] || scrawl.stack[e.target.id] || scrawl.element[e.target.id] || false;
		if (wrap) {
			wrap.mouse.active = false;
		}
		return wrap;
	};

	/**
Constructor helper function
@method initMouse
@param constructor argument object
@return This
@chainable
@private
**/
	my.PageElement.prototype.initMouse = function(items) {
		this.mouse = my.newVector({
			name: this.type + '.' + this.name + '.mouse'
		});
		if (!this.position) {
			this.position = this.get('position');
		}
		if (items.mouse) {
			this.mouse.set(items.mouse);
			this.addMouseMove();
		}
		else {
			this.removeMouseMove();
		}
		return this;
	};
	/**
Adds a mousemove event listener to the element
@method addMouseMove
@return This
@chainable
@private
**/
	my.PageElement.prototype.addMouseMove = function() {
		var el = this.getElement(),
			test;
		//			test,
		//			nowt;
		el.removeEventListener('mousemove', this.handleMouseMove, false);
		el.addEventListener('mousemove', this.handleMouseMove, false);
		el.removeEventListener('mouseout', this.handleMouseOut, false);
		el.removeEventListener('mouseleave', this.handleMouseOut, false);
		el.setAttribute('onmouseout', 'return;');
		test = typeof el.onmouseout == 'function';
		//		el.setAttribute('onmouseout', nowt);
		el.setAttribute('onmouseout', null);
		if (test) {
			el.addEventListener('mouseout', this.handleMouseOut, false);
		}
		else {
			el.addEventListener('mouseleave', this.handleMouseOut, false);
		}
		return this;
	};
	/**
Remove the mousemove event listener from the element
@method removeMouseMove
@return This
@chainable
@private
**/
	my.PageElement.prototype.removeMouseMove = function() {
		var el = this.getElement();
		el.removeEventListener('mousemove', this.handleMouseMove, false);
		el.removeEventListener('mouseout', this.handleMouseOut, false);
		el.removeEventListener('mouseleave', this.handleMouseOut, false);
		return this;
	};

	/**
# Pad

## Instantiation

* created automatically for any &lt;canvas&gt; element found on the web page when it loads
* also, scrawl.addCanvasToPage()
* should not be instantiated directly by users

## Purpose

* controller (not wrapper) object for canvas elements included in the DOM
* coordinates activity between visible canvas element and other (non-DOM) canvas elements that contribute to it

Because the Pad constructor calls the Cell constructor as part of the construction process (Cell objects __wrap__ &lt;canvas&gt; elements; Pad objects __control__ &lt;canvas&gt; elements), Cell attributes can be included in the Pad constructor object and picked up by the resultant Cell objects.

## Access

* scrawl.pad.PADNAME - for the Pad object
* scrawl.canvas.PADNAME - for the Pad object's visible &lt;canvas&gt; element
* scrawl.context.PADNAME - for the &ltcanvas&gt; element's 2d context engine
* scrawl.cell[scrawl.pad.PADNAME.display] - for the Pad object's display cell
* scrawl.cell[scrawl.pad.PADNAME.base] - for the Pad object's base cell

@class Pad
@constructor
@extends PageElement
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Pad = function(items) {
		items = my.safeObject(items);
		my.PageElement.call(this, items);
		var tempname = 'Pad',
			myCell,
			baseCanvas,
			myCellBase;
		if (my.xt(items.canvasElement)) {
			my.canvas.PadConstructorTemporaryCanvas = items.canvasElement;
			this.display = 'PadConstructorTemporaryCanvas';
			if (my.xto([items.canvasElement.id, items.canvasElement.name])) {
				tempname = items.canvasElement.id || items.canvasElement.name || tempname;
			}
			my.PageElement.call(this, {
				name: tempname,
			});
			if (this.name.match(/~~~/)) {
				this.name = this.name.replace(/~~~/g, '_');
			}
			if (!items.canvasElement.id) {
				items.canvasElement.id = this.name;
			}
			if (!my.contains(my.cellnames, this.name)) {
				this.cells = [];
				this.drawOrder = [];
				this.width = items.width || this.get('width');
				this.height = items.height || this.get('height');
				this.setDimensions();
				my.pad[this.name] = this;
				my.pushUnique(my.padnames, this.name);
				if (items.length > 1) {
					this.set(items);
				}
				myCell = my.newCell({
					name: this.name,
					pad: this.name,
					canvas: items.canvasElement,
				});
				my.pushUnique(this.cells, myCell.name);
				this.display = myCell.name;
				delete my.canvas.PadConstructorTemporaryCanvas;
				baseCanvas = items.canvasElement.cloneNode(true);
				baseCanvas.setAttribute('id', this.name + '_base');
				myCellBase = my.newCell({
					name: this.name + '_base',
					pad: this.name,
					canvas: baseCanvas,
					backgroundColor: items.backgroundColor,
				});
				my.pushUnique(this.cells, myCellBase.name);
				this.base = myCellBase.name;
				this.current = myCellBase.name;
				this.setDisplayOffsets();
				if (my.xto([items.title, items.comment])) {
					this.setAccessibility(items);
				}
				items.mouse = (my.isa(items.mouse, 'bool') || my.isa(items.mouse, 'vector')) ? items.mouse : true;
				this.initMouse(items);
				return this;
			}
		}
		console.log('Failed to generate a Pad controller - no canvas element supplied');
		return false;
	};
	my.Pad.prototype = Object.create(my.PageElement.prototype);
	/**
@property type
@type String
@default 'Pad'
@final
**/
	my.Pad.prototype.type = 'Pad';
	my.Pad.prototype.classname = 'padnames';
	my.d.Pad = {
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
	};
	my.mergeInto(my.d.Pad, my.d.PageElement);
	/**
Retrieve Pad's visible &lt;canvas&gt; element object
@method getElement
@return DOM element object
@private
**/
	my.Pad.prototype.getElement = function() {
		return my.canvas[this.display];
	};
	/**
Augments PageElement.set(), to allow users to set Pad.drawOrder correctly, and also cascade scale, backgroundColor, globalAlpha and globalCompositeOperation changes to associated Cell objects
				
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Pad.prototype.set = function(items) {
		my.PageElement.prototype.set.call(this, items);
		items = my.safeObject(items);
		this.setDrawOrder(items.drawOrder || this.get('drawOrder'));
		if (my.isa(items.scale, 'num')) {
			my.cell[this.display].scale = items.scale;
			this.scale = items.scale;
		}
		if (my.xt(items.width)) {
			my.cell[this.display].set({
				width: items.width,
			});
			this.width = items.width;
		}
		if (my.xt(items.height)) {
			my.cell[this.display].set({
				height: items.height,
			});
			this.height = items.height;
		}
		if (my.xto([items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.width, items.height])) {
			this.setDisplayOffsets();
		}
		if (my.xto([items.backgroundColor, items.globalAlpha, items.globalCompositeOperation])) {
			var cell = my.cell[this.base];
			my.cell[this.base].set({
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
@example
	scrawl.addCanvasToPage({
		name: 'mycanvas',
		});
	scrawl.pad.mycanvas.addNewCell({
		name: 'action',
		});
	scrawl.pad.mycanvas.addNewCell({
		name: 'background',
		});
	scrawl.pad.mycanvas.setDrawOrder(['background', 'action']);
**/
	my.Pad.prototype.setDrawOrder = function(order) {
		this.drawOrder = (my.xt(order)) ? [].concat(order) : [];
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
	my.Pad.prototype.getCellsForDisplayAction = function(command) {
		var temp = [];
		if (my.isa(command, 'arr')) {
			temp = command;
		}
		else {
			for (var i = 0, iz = this.cells.length; i < iz; i++) {
				temp.push(this.cells[i]);
			}
			switch (command) {
				case 'all':
					break;
				case 'display':
					temp = [this.display];
					break;
				case 'base':
					temp = [this.base];
					break;
				case 'non-base':
					my.removeItem(temp, this.base);
					break;
				case 'current':
					temp = [this.current];
					break;
				case 'non-current':
					my.removeItem(temp, this.current);
					break;
				case 'additionals':
					my.removeItem(temp, this.display);
					my.removeItem(temp, this.base);
					break;
				case 'non-additionals':
					temp = [this.display, this.base];
					break;
				case 'none':
					temp = [];
					break;
				default:
					my.removeItem(temp, this.display);
					break;
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
	my.Pad.prototype.clear = function(command) {
		var temp = this.getCellsForDisplayAction(command);
		for (var i = 0, iz = temp.length; i < iz; i++) {
			my.cell[temp[i]].clear();
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
	my.Pad.prototype.compile = function(command) {
		var temp = this.getCellsForDisplayAction(command);
		for (var i = 0, iz = temp.length; i < iz; i++) {
			my.cell[temp[i]].compile();
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
	my.Pad.prototype.stampBackground = function(command) {
		var temp = this.getCellsForDisplayAction(command);
		for (var i = 0, iz = temp.length; i < iz; i++) {
			my.cell[temp[i]].stampBackground();
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
	my.Pad.prototype.show = function(command) {
		switch (command) {
			case 'wipe-base':
				my.cell[this.base].clear();
				break;
			case 'wipe-both':
				my.cell[this.base].clear();
				my.cell[this.display].clear();
				break;
			default:
				my.cell[this.display].clear();
				break;
		}
		if (this.drawOrder.length > 0) {
			for (var i = 0, iz = this.drawOrder.length; i < iz; i++) {
				my.cell[this.base].copyCellToSelf(my.cell[this.drawOrder[i]]);
			}
		}
		my.cell[this.display].copyCellToSelf(my.cell[this.base], true);
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
	my.Pad.prototype.render = function(command) {
		command = my.safeObject(command);
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
@example
	scrawl.addCanvasToPage({
		name: 'mycanvas',
		width: 200,
		height: 200,
		});
	scrawl.pad.mycanvas.addNewCell({
		name: 'background',
		width: 400,
		});
**/
	my.Pad.prototype.addNewCell = function(data) {
		var myCanvas,
			myCell;
		data = my.safeObject(data);
		if (my.isa(data.name, 'str')) {
			data.width = Math.round(data.width) || this.width;
			data.height = Math.round(data.height) || this.height;
			myCanvas = document.createElement('canvas');
			myCanvas.setAttribute('id', data.name);
			myCanvas.setAttribute('height', data.height);
			myCanvas.setAttribute('width', data.width);
			data.pad = this.name;
			data.canvas = myCanvas;
			myCell = my.newCell(data);
			my.pushUnique(this.cells, myCell.name);
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
	my.Pad.prototype.addCells = function(items) {
		items = [].concat(items);
		for (var i = 0, iz = items.length; i < iz; i++) {
			if (my.contains(my.cellnames, items[i])) {
				this.cells.push(items[i]);
				this.drawOrder.push(items[i]);
			}
		}
		return this;
	};
	/**
Remove a Cell wrapper object from this Pad

_Note: does not delete the canvas, or the Cell object, from the scrawl library_
@method deleteCell
@param {String} cell CELLNAME String
@return This
@chainable
**/
	my.Pad.prototype.deleteCell = function(cell) {
		if (my.isa(cell, 'str')) {
			my.removeItem(this.cells, cell);
			if (this.display === cell) {
				this.display = this.current;
			}
			if (this.base === cell) {
				this.base = this.current;
			}
			if (this.current === cell) {
				this.current = this.base;
			}
			return this;
		}
		console.log('Pad.deleteCell error: argument is not a String');
		return this;
	};
	/**
Set scrawl.currentPad attribute to this Pad's PADNAME String
@method makeCurrent
@return This
@chainable
@example
	scrawl.addCanvasToPage({
		name: 'mycanvas',
		width: 200,
		height: 200,
		}).makeCurrent();
**/
	my.Pad.prototype.makeCurrent = function() {
		my.currentPad = this.name;
		return this;
	};
	/**
Augments PageElement.setAccessibility(); handles the setting of &lt;canvas&gt; element title and data-comment attributes

* Title text is assigned to the display canvas's title attribute
* Comments are placed between the display canvas element's tags, within &lt;p&gt; tags - this will remove any existing content between the canvas tags

@method setAccessibility
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Pad.prototype.setAccessibility = function(items) {
		items = (my.xt(items)) ? items : {};
		var el = this.getElement();
		if (my.xt(items.title)) {
			this.title = items.title;
			el.title = this.title;
		}
		if (my.xt(items.comment)) {
			this.comment = items.comment;
			el.setAttribute('data-comment', this.comment);
			el.innerHTML = '<p>' + this.comment + '</p>';
		}
		return this;
	};
	/**
Overrides PageElement.setDimensions(); &lt;canvas&gt; elements do not use styling to set their drawing region dimensions

@method setDimensions
@return This
@chainable
**/
	my.Pad.prototype.setDimensions = function() {
		var el = this.getElement();
		el.width = this.width * this.scale;
		el.height = this.height * this.scale;
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

## Access

* scrawl.cell.CELLNAME - for the Cell object
* scrawl.pad[scrawl.cell.CELLNAME.pad] - for the Cell object's Pad object

@class Cell
@constructor
@extends Position
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Cell = function(items) {
		items = my.safeObject(items);
		if (my.xta([items, items.canvas])) { //flag used by Pad constructor when calling Cell constructor
			/**
The coordinate Vector representing the Cell's target position on the &lt;canvas&gt; to which it is to be copied

Cell supports the following 'virtual' attributes for this attribute:

* __startX__ or __targetX__ - (Number) the x coordinate on the destination &lt;canvas&gt;
* __startY__ or __targetY__ - (Number) the y coordinate on the destination &lt;canvas&gt;

@property start
@type Vector
**/
			this.coreCellInit(items);
			this.animationCellInit(items);
			this.collisionsCellInit(items);
			return this;
		}
		console.log('Cell constructor encountered an error: no canvas element supplied to it');
		return false;
	};
	my.Cell.prototype = Object.create(my.Position.prototype);
	/**
@property type
@type String
@default 'Cell'
@final
**/
	my.Cell.prototype.type = 'Cell';
	my.Cell.prototype.classname = 'cellnames';
	my.d.Cell = {
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
		source: {
			x: 0,
			y: 0,
			z: 0
		},
		/**
Copy width, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
@property sourceWidth
@type Number
@default 300
**/
		sourceWidth: 300,
		/**
Copy height, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
@property sourceHeight
@type Number
@default 150
**/
		sourceHeight: 150,
		/**
Paste width, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property targetWidth
@type Number
@default 300
**/
		targetWidth: 300,
		/**
Paste height, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property targetHeight
@type Number
@default 150
**/
		targetHeight: 150,
		/**
DOM &lt;canvas&gt; element's width (not CSS width)

_Never change this attribute directly_
@property actualWidth
@type Number
@default 300
**/
		actualWidth: 300,
		/**
DOM &lt;canvas&gt; element's height (not CSS height)

_Never change this attribute directly_
@property actualHeight
@type Number
@default 150
**/
		actualHeight: 150,
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
	};
	my.mergeInto(my.d.Cell, my.d.Position);
	/**
Cell constructor hook function - core module
@method coreCellInit
@private
**/
	my.Cell.prototype.coreCellInit = function(items) {
		var temp,
			myContext;
		my.Position.call(this, items); //handles items.start, items.startX, items.startY
		my.Base.prototype.set.call(this, items);
		my.canvas[this.name] = items.canvas;
		my.context[this.name] = items.canvas.getContext('2d');
		my.cell[this.name] = this;
		my.pushUnique(my.cellnames, this.name);
		this.pad = items.pad || false;
		temp = my.safeObject(items.source);
		this.source = my.newVector({
			x: (my.xt(items.sourceX)) ? items.sourceX : ((my.xt(temp.x)) ? temp.x : 0),
			y: (my.xt(items.sourceY)) ? items.sourceY : ((my.xt(temp.y)) ? temp.y : 0),
			name: this.type + '.' + this.name + '.source'
		});
		this.work.source = my.newVector({
			name: this.type + '.' + this.name + '.work.source'
		});
		this.actualWidth = items.actualWidth || items.width || my.canvas[this.name].width;
		this.actualHeight = items.actualHeight || items.height || my.canvas[this.name].height;
		this.sourceWidth = this.actualWidth;
		this.sourceHeight = this.actualHeight;
		this.targetWidth = this.actualWidth;
		this.targetHeight = this.actualHeight;
		this.setDimensions(items);
		if (my.xto([items.targetX, items.targetY])) {
			this.start.x = (my.xt(items.targetX)) ? items.targetX : this.start.x;
			this.start.y = (my.xt(items.targetY)) ? items.targetY : this.start.y;
		}
		if (my.xto([items.sourceWidth, items.sourceHeight, items.targetWidth, items.targetHeight, items.width, items.height])) {
			this.sourceWidth = items.sourceWidth || items.width || this.sourceWidth;
			this.sourceHeight = items.sourceHeight || items.height || this.sourceHeight;
			this.targetWidth = items.targetWidth || items.width || this.targetWidth;
			this.targetHeight = items.targetHeight || items.height || this.targetHeight;
		}
		this.usePadDimensions = (my.isa(items.usePadDimensions, 'bool')) ? items.usePadDimensions : ((my.xto([items.sourceWidth, items.sourceHeight, items.targetWidth, items.targetHeight, items.width, items.height])) ? false : true);
		myContext = my.newContext({
			name: this.name,
			cell: my.context[this.name]
		});
		this.context = myContext.name;
		this.flipUpend = my.xt(items.flipUpend) ? items.flipUpend : my.d.Cell.flipUpend;
		this.flipReverse = my.xt(items.flipReverse) ? items.flipReverse : my.d.Cell.flipReverse;
		this.lockX = my.xt(items.lockX) ? items.lockX : my.d.Cell.lockX;
		this.lockY = my.xt(items.lockY) ? items.lockY : my.d.Cell.lockY;
		this.roll = items.roll || my.d.Cell.roll;
		this.groups = (my.xt(items.groups)) ? [].concat(items.groups) : []; //must be set
		my.newGroup({
			name: this.name,
			cell: this.name,
		});
	};
	/**
Cell constructor hook function - modified by collisions module
@method collisionsCellInit
@private
**/
	my.Cell.prototype.collisionsCellInit = function(items) {};
	/**
Cell constructor hook function - modified by animation module
@method animationCellInit
@private
**/
	my.Cell.prototype.animationCellInit = function(items) {};
	/**
Augments Position.get(), to allow users to get values for sourceX, sourceY, startX, startY, targetX, targetY, handleX, handleY, width, height
@method get
@param {String} item Attribute key
@return Attribute value
**/
	my.Cell.prototype.get = function(item) {
		if (my.contains(['targetX', 'targetY', 'sourceX', 'sourceY'], item)) {
			switch (item) {
				case 'targetX':
					return this.start.x;
				case 'targetY':
					return this.start.y;
				case 'sourceX':
					return this.source.x;
				case 'sourceY':
					return this.source.y;
			}
		}
		if (my.contains(['target', 'source'], item)) {
			switch (item) {
				case 'target':
					return this.start.getVector();
				case 'source':
					return this.source.getVector();
			}
		}
		if (my.contains(['width', 'height'], item)) {
			switch (item) {
				case 'width':
					return (this.usePadDimensions) ? this.getPadWidth() : this.actualWidth;
				case 'height':
					return (this.usePadDimensions) ? this.getPadHeight() : this.actualHeight;
			}
		}
		return (this.animationCellGet(item) || my.Position.prototype.get.call(this, item));
	};
	/**
Cell.get hook function - modified by animation module
@method animationCellGet
@private
**/
	my.Cell.prototype.animationCellGet = function(item) {
		return false;
	};
	/**
Augments Position.set(), to allow users to set the start, handle, and source attributes using startX, startY, targetX, targetY, handleX, handleY, sourceX, sourceY.
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.set = function(items) {
		var temp;
		my.Position.prototype.set.call(this, items);
		items = my.safeObject(items);
		if (my.xto([items.target, items.targetX, items.targetY])) {
			temp = my.safeObject(items.target);
			this.start.x = items.targetX || temp.x || this.start.x;
			this.start.y = items.targetY || temp.y || this.start.y;
		}
		if (my.xto([items.source, items.sourceX, items.sourceY])) {
			temp = my.safeObject(items.source);
			this.source.x = items.sourceX || temp.x || this.source.x;
			this.source.y = items.sourceY || temp.y || this.source.y;
		}
		if (my.xto([items.sourceWidth, items.sourceHeight, items.targetWidth, items.targetHeight, items.width, items.height])) {
			this.sourceWidth = items.sourceWidth || items.width || this.sourceWidth;
			this.sourceHeight = items.sourceHeight || items.height || this.sourceHeight;
			this.targetWidth = items.targetWidth || items.width || this.targetWidth;
			this.targetHeight = items.targetHeight || items.height || this.targetHeight;
		}
		if (my.xto([items.width, items.height, items.actualWidth, items.actualHeight])) {
			this.actualWidth = items.actualWidth || items.width || this.actualWidth;
			this.actualHeight = items.actualHeight || items.height || this.actualHeight;
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
		}
		this.animationCellSet(items);
		if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.actualWidth, items.actualHeight, items.scale])) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Cell.set hook function - modified by animation module
@method animationCellSet
@private
**/
	my.Cell.prototype.animationCellSet = function(items) {};
	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Augments Position.setDelta to allow changes to be made using attributes: source, sourceX, sourceY, sourceWidth, sourceHeight, start, startX, startY, target, targetX, targetY, targetWidth, targetHeight, globalAlpha
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.setDelta = function(items) {
		var temp;
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		if (my.xto([items.source, items.sourceX, items.sourceY])) {
			temp = my.safeObject(items.source);
			this.source.x += items.sourceX || temp.x || 0;
			this.source.y += items.sourceY || temp.y || 0;
		}
		if (my.xto([items.sourceWidth, items.sourceHeight])) {
			this.sourceWidth += items.sourceWidth || 0;
			this.sourceHeight += items.sourceHeight || 0;
		}
		if (my.xto([items.target, items.targetX, items.targetY])) {
			temp = my.safeObject(items.target);
			this.start.x += items.targetX || temp.x || 0;
			this.start.y += items.targetY || temp.y || 0;
		}
		if (my.xto([items.targetWidth, items.targetHeight])) {
			this.targetWidth += items.targetWidth || 0;
			this.targetHeight += items.targetHeight || 0;
		}
		if (my.xt(items.globalAlpha)) {
			this.globalAlpha += items.globalAlpha;
		}
		if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.actualWidth, items.actualHeight, items.scale])) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Return the Cell object's default Pad (&lt;canvas&gt; element) width

@method getPadWidth
@return Pad width
**/
	my.Cell.prototype.getPadWidth = function() {
		return my.pad[this.pad].get('width');
	};
	/**
Return the Cell object's default Pad (&lt;canvas&gt; element) height

@method getPadHeight
@return Pad height
**/
	my.Cell.prototype.getPadHeight = function() {
		return my.pad[this.pad].get('height');
	};
	/**
Set the Cell's &lt;canvas&gt; element's context engine to the specification supplied by the sprite about to be drawn on the canvas
@method setEngine
@param {Sprite} sprite Sprite object
@return Sprite object
@private
**/
	my.Cell.prototype.setEngine = function(sprite) {
		if (!sprite.fastStamp) {
			var myContext = my.ctx[this.context],
				spriteContext = my.ctx[sprite.context],
				engine,
				tempFillStyle,
				tempStrokeStyle,
				des,
				changes = spriteContext.getChanges(myContext, sprite.scale, sprite.scaleOutline);
			if (changes) {
				delete changes.count;
				engine = my.context[this.name];
				for (var item in changes) {
					des = false;
					if (item[0] < 'm') {
						if (item[0] < 'l') {
							switch (item) {
								case 'fillStyle':
									if (my.xt(my.design[changes[item]])) {
										des = my.design[changes[item]];
										if (my.contains(['Gradient', 'RadialGradient'], des.type)) {
											des.update(sprite.name, this.name);
										}
										tempFillStyle = des.getData();
									}
									else {
										tempFillStyle = changes[item];
									}
									engine.fillStyle = tempFillStyle;
									break;
								case 'font':
									engine.font = changes[item];
									break;
								case 'globalAlpha':
									engine.globalAlpha = changes[item];
									break;
								case 'globalCompositeOperation':
									engine.globalCompositeOperation = changes[item];
									break;
							}
						}
						else {
							switch (item) {
								case 'lineCap':
									engine.lineCap = changes[item];
									break;
								case 'lineDash':
									engine.mozDash = changes[item];
									engine.lineDash = changes[item];
									try {
										engine.setLineDash(changes[item]);
									}
									catch (e) {}
									break;
								case 'lineDashOffset':
									engine.mozDashOffset = changes[item];
									engine.lineDashOffset = changes[item];
									break;
								case 'lineJoin':
									engine.lineJoin = changes[item];
									break;
								case 'lineWidth':
									engine.lineWidth = changes[item];
									break;
							}
						}
					}
					else {
						if (item[0] == 's') {
							switch (item) {
								case 'shadowBlur':
									engine.shadowBlur = changes[item];
									break;
								case 'shadowColor':
									engine.shadowColor = changes[item];
									break;
								case 'shadowOffsetX':
									engine.shadowOffsetX = changes[item];
									break;
								case 'shadowOffsetY':
									engine.shadowOffsetY = changes[item];
									break;
								case 'strokeStyle':
									if (my.xt(my.design[changes[item]])) {
										des = my.design[changes[item]];
										if (my.contains(['Gradient', 'RadialGradient'], des.type)) {
											des.update(sprite.name, this.name);
										}
										tempStrokeStyle = des.getData();
									}
									else {
										tempStrokeStyle = changes[item];
									}
									engine.strokeStyle = tempStrokeStyle;
									break;
							}
						}
						else {
							switch (item) {
								case 'miterLimit':
									engine.miterLimit = changes[item];
									break;
								case 'textAlign':
									engine.textAlign = changes[item];
									break;
								case 'textBaseline':
									engine.textBaseline = changes[item];
									break;
								case 'winding':
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
	my.Cell.prototype.clear = function() {
		var ctx = my.context[this.name];
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.actualWidth, this.actualHeight);
		return this;
	};
	/**
Prepare to draw sprites onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array
@method compile
@return This
@chainable
**/
	my.Cell.prototype.compile = function() {
		if (this.get('backgroundColor') !== 'rgba(0,0,0,0)') {
			this.stampBackground();
		}
		this.groups.sort(function(a, b) {
			return my.group[a].order - my.group[b].order;
		});
		for (var i = 0, iz = this.groups.length; i < iz; i++) {
			if (my.group[this.groups[i]].get('visibility')) {
				my.group[this.groups[i]].stamp(false, this.name);
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
	my.Cell.prototype.stampBackground = function() {
		var ctx = my.context[this.name],
			fill = this.get('backgroundColor'),
			w = this.actualWidth,
			h = this.actualHeight,
			tempFillStyle = ctx.fillStyle;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = fill;
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = tempFillStyle;
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
	my.Cell.prototype.rotateDestination = function(engine) {
		var myA = (this.flipReverse) ? -1 : 1,
			myD = (this.flipUpend) ? -1 : 1,
			deltaRotation = (this.addPathRoll) ? (this.roll + this.pathRoll) * my.radian : this.roll * my.radian,
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
	my.Cell.prototype.prepareToCopyCell = function(engine) {
		this.resetWork();
		if (!this.offset.flag) {
			this.offset.set(this.getOffsetStartVector());
			this.offset.flag = true;
		}
		if (this.pivot) {
			this.setStampUsingPivot(my.pad[this.pad].base);
		}
		else {
			this.pathPrepareToCopyCell();
		}
		this.rotateDestination(engine);
		return this;
	};
	/**
Cell.prepareToCopyCell hook function - modified by path module
@method pathPrepareToCopyCell
@private
**/
	my.Cell.prototype.pathPrepareToCopyCell = function() {};
	/**
Cell copy helper function
@method copyCellToSelf
@param {String} cell CELLNAME of cell to be copied onto this cell's &lt;canvas&gt; element
@param {Boolean} [usePadScale] Set to true when copying cells onto the display canvas; false otherwise
@return This
@chainable
@private
**/
	my.Cell.prototype.copyCellToSelf = function(cell, usePadScale) {
		cell = (my.isa(cell, 'str')) ? my.cell[cell] : cell;
		usePadScale = (my.xt(usePadScale)) ? usePadScale : false;
		var lockTo = cell.get('lockTo'),
			myCell = (lockTo) ? my.cell[lockTo] : cell;
		if (my.xt(myCell)) {
			var usePadDimensions = myCell.usePadDimensions,
				pad = my.pad[myCell.pad],
				padWidth = pad.width,
				padHeight = pad.height,
				scale = (usePadScale) ? pad.scale : this.scale,
				sourceX = myCell.source.x || this.source.x,
				sourceY = myCell.source.y || this.source.y,
				sourceWidth = myCell.sourceWidth || this.sourceWidth,
				sourceHeight = myCell.sourceHeight || this.sourceHeight,
				targetWidth = (usePadDimensions) ? padWidth * scale : myCell.targetWidth * scale,
				targetHeight = (usePadDimensions) ? padHeight * scale : myCell.targetHeight * scale,
				context = my.context[this.name],
				ctx = my.ctx[this.name],
				cga = myCell.get('globalAlpha'),
				xga = ctx.get('globalAlpha'),
				cgco = myCell.get('globalCompositeOperation'),
				xgco = ctx.get('globalCompositeOperation');
			if (cga !== xga) {
				context.globalAlpha = cga;
				ctx.set({
					globalAlpha: cga
				});
			}
			if (cgco !== xgco) {
				context.globalCompositeOperation = cgco;
				ctx.set({
					globalCompositeOperation: cgco
				});
			}
			my.context[myCell.name].setTransform(1, 0, 0, 1, 0, 0);
			myCell.prepareToCopyCell(context);
			context.drawImage(my.canvas[myCell.name], sourceX, sourceY, sourceWidth, sourceHeight, myCell.offset.x, myCell.offset.y, targetWidth, targetHeight);
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
	my.Cell.prototype.clearShadow = function() {
		var engine = my.context[this.name],
			context = my.ctx[this.context];
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
	my.Cell.prototype.restoreShadow = function(spritecontext) {
		var engine = my.context[this.name],
			context = my.ctx[this.context],
			s = my.ctx[spritecontext],
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
	my.Cell.prototype.setToClearShape = function() {
		var engine = my.context[this.name],
			context = my.ctx[this.context];
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
	my.Cell.prototype.setDimensions = function(items) {
		var myWidth,
			myHeight;
		if (my.xt(items) && !this.usePadDimensions) {
			myWidth = items.width || items.actualWidth || this.actualWidth;
			myHeight = items.height || items.actualHeight || this.actualHeight;
		}
		else {
			myWidth = this.getPadWidth();
			myHeight = this.getPadHeight();
		}
		my.canvas[this.name].width = myWidth;
		my.canvas[this.name].height = myHeight;
		my.Base.prototype.set.call(this, {
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
	my.Cell.prototype.saveContext = function() {
		my.context[this.name].save();
		return this;
	};
	/**
Perform a JavaScript ctx.restore() operation
@method restoreContext
@return This
@chainable
**/
	my.Cell.prototype.restoreContext = function() {
		my.context[this.name].restore();
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
	my.Cell.prototype.getImageData = function(dimensions) {
		dimensions = my.safeObject(dimensions);
		var myLabel = (my.isa(dimensions.name, 'str')) ? this.name + '_' + dimensions.name : this.name + '_imageData',
			myX = (my.isa(dimensions.x, 'num')) ? dimensions.x : 0,
			myY = (my.isa(dimensions.y, 'num')) ? dimensions.y : 0,
			myW = (my.isa(dimensions.width, 'num')) ? dimensions.width : this.actualWidth,
			myH = (my.isa(dimensions.height, 'num')) ? dimensions.height : this.actualHeight;
		my.imageData[myLabel] = my.context[this.name].getImageData(myX, myY, myW, myH);
		return myLabel;
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
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Context = function(items) {
		items = my.safeObject(items);
		my.Base.call(this, items);
		if (items.cell) {
			this.getContextFromEngine(items.cell);
		}
		else {
			this.set(items);
		}
		my.ctx[this.name] = this;
		my.pushUnique(my.ctxnames, this.name);
		return this;
	};
	my.Context.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Context'
@final
**/
	my.Context.prototype.type = 'Context';
	my.Context.prototype.classname = 'ctxnames';
	my.d.Context = {
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
Shape and Path sprite fill method. Can be:

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
Text baseline value for single-line Phrase sprites set to follow a Path sprite path. Permitted values include:

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
	my.contextKeys = Object.keys(my.d.Context);
	my.mergeInto(my.d.Context, my.d.Base);
	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function - lineDashOffset, lineWidth, globalAlpha

(Only for use by Context objects)
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
@private
**/
	my.Context.prototype.setDelta = function(items) {
		items = my.safeObject(items);
		if (my.xt(items.lineDashOffset)) {
			if (!my.xt(this.lineDashOffset)) {
				this.lineDashOffset = my.d.Context.lineDashOffset;
			}
			this.lineDashOffset += items.lineDashOffset;
		}
		if (my.xt(items.lineWidth)) {
			if (!my.xt(this.lineWidth)) {
				this.lineWidth = my.d.Context.lineWidth;
			}
			this.lineWidth += items.lineWidth;
			if (this.lineWidth < 0) {
				this.lineWidth = 0;
			}
		}
		if (my.xt(items.globalAlpha)) {
			if (!my.xt(this.globalAlpha)) {
				this.globalAlpha = my.d.Context.globalAlpha;
			}
			this.globalAlpha += items.globalAlpha;
			if (!my.isBetween(this.globalAlpha, 0, 1, true)) {
				this.globalAlpha = (this.globalAlpha > 0.5) ? 1 : 0;
			}
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
	my.Context.prototype.getContextFromEngine = function(ctx) {
		for (var i = 0, iz = my.contextKeys.length; i < iz; i++) {
			this[my.contextKeys[i]] = ctx[my.contextKeys[i]];
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
	my.Context.prototype.getChanges = function(ctx, scale, doscale) {
		var r = {},
			count = 0,
			temp,
			tempCol;
		for (var i = 0, iz = my.contextKeys.length; i < iz; i++) {
			temp = this.get(my.contextKeys[i]);
			//handle scalable items
			if (my.contains(['lineWidth', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'], my.contextKeys[i])) {
				if (doscale) {
					if (temp * scale !== ctx[my.contextKeys[i]]) {
						r[my.contextKeys[i]] = temp * scale;
						count++;
					}
				}
				else {
					if (temp !== ctx[my.contextKeys[i]]) {
						r[my.contextKeys[i]] = temp;
						count++;
					}
				}
			}
			//handle fillStyle, strokeStyle, shadowColor that use Color design objects
			else if (my.contains(['fillStyle', 'strokeStyle', 'shadowColor'], my.contextKeys[i]) && my.contains(my.designnames, temp) && my.design[temp].type === 'Color') {
				tempCol = my.design[temp].getData();
				if (tempCol !== ctx[my.contextKeys[i]]) {
					r[my.contextKeys[i]] = tempCol;
					count++;
				}
			}
			//handle fillStyle, strokeStyle that use RadialGradient, Gradient design objects
			else if (my.contains(['fillStyle', 'strokeStyle'], my.contextKeys[i]) && my.contains(my.designnames, temp) && my.contains(['Gradient', 'RadialGradient'], my.design[temp].type) && my.design[temp].autoUpdate) {
				r[my.contextKeys[i]] = temp;
				count++;
			}
			//handle linedash - an array that needs deep inspection to check for difference
			else if (my.contains(['lineDash'], my.contextKeys[i]) && my.xt(ctx.lineDash)) {
				if (temp.length !== ctx.lineDash.length) {
					r.lineDash = temp;
					count++;
				}
				else {
					for (var j = 0, jz = temp.length; j < jz; j++) {
						if (temp[j] !== ctx.lineDash[j]) {
							r.lineDash = temp;
							count++;
							break;
						}
					}
				}
			}
			//exclude items that have no equivalent in the context engine
			else if (my.contains(['name', 'timestamp'], my.contextKeys[i])) {}
			//capture all other changes
			else {
				if (temp !== ctx[my.contextKeys[i]]) {
					r[my.contextKeys[i]] = temp;
					count++;
				}
			}
		}
		return (count > 0) ? r : false;
	};

	/**
# Group

## Instantiation

* scrawl.newGroup()

## Purpose

* associates sprite objects with a cell object, for stamping/compiling the &lt;canvas&gt; scene
* groups Sprite objects for specific purposes
* (with collisions module) plays a key role in collision detection between Sprites

## Access

* scrawl.group.GROUPNAME - for the Group object
* scrawl.cell[scrawl.group.GROUPNAME.cell] - for the Group object's default Cell object

@class Group
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Group = function(items) {
		items = my.safeObject(items);
		my.Base.call(this, items);
		this.sprites = (my.xt(items.sprites)) ? [].concat(items.sprites) : [];
		this.cell = items.cell || my.pad[my.currentPad].current;
		this.order = items.order || 0;
		this.visibility = (my.isa(items.visibility, 'bool')) ? items.visibility : true;
		this.spriteSort = (my.isa(items.spriteSort, 'bool')) ? items.spriteSort : true;
		this.regionRadius = items.regionRadius || 0;
		my.group[this.name] = this;
		my.pushUnique(my.groupnames, this.name);
		my.pushUnique(my.cell[this.cell].groups, this.name);
		return this;
	};
	my.Group.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Group'
@final
**/
	my.Group.prototype.type = 'Group';
	my.Group.prototype.classname = 'groupnames';
	my.d.Group = {
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
Collision checking radius, in pixels - as a first step in a collision check, the Group will winnow potential collisions according to how close the checked sprite is to the current reference sprite or mouse coordinate; when set to 0, this collision check step is skipped and all sprites move on to the next step
@property regionRadius
@type Number
@default 0
**/
		regionRadius: 0,
	};
	my.mergeInto(my.d.Group, my.d.Base);
	/**
Sprite sorting routine - sprites are sorted according to their sprite.order attribute value, in ascending order
@method sortSprites
@return Nothing
@private
**/
	my.Group.prototype.sortSprites = function() {
		if (this.spriteSort) {
			this.sprites.sort(function(a, b) {
				return my.sprite[a].order - my.sprite[b].order;
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
	my.Group.prototype.forceStamp = function(method, cell) {
		var temp = this.visibility;
		if (!temp) {
			this.set({
				visibility: true
			});
		}
		this.stamp(method, cell);
		this.set({
			visibility: temp
		});
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
	my.Group.prototype.stamp = function(method, cell) {
		if (this.visibility) {
			this.sortSprites();
			for (var i = 0, iz = this.sprites.length; i < iz; i++) {
				my.sprite[this.sprites[i]].stamp(method, cell);
			}
		}
		return this;
	};
	/**
Add sprites to the Group
@method addSpritesToGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	my.Group.prototype.addSpritesToGroup = function(item) {
		item = (my.xt(item)) ? [].concat(item) : [];
		for (var i = 0, iz = item.length; i < iz; i++) {
			my.pushUnique(this.sprites, item[i]);
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
	my.Group.prototype.removeSpritesFromGroup = function(item) {
		item = (my.xt(item)) ? [].concat(item) : [];
		for (var i = 0, iz = item.length; i < iz; i++) {
			my.removeItem(this.sprites, item[i]);
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
	my.Group.prototype.updateSpritesBy = function(items) {
		items = my.safeObject(items);
		for (var i = 0, iz = this.sprites.length; i < iz; i++) {
			my.sprite[this.sprites[i]].setDelta({
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
	my.Group.prototype.setSpritesTo = function(items) {
		for (var i = 0, iz = this.sprites.length; i < iz; i++) {
			my.sprite[this.sprites[i]].set(items);
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
	my.Group.prototype.pivotSpritesTo = function(item) {
		item = (my.isa(item, 'str')) ? item : false;
		var p,
			pStart,
			sprite,
			sv;
		if (item) {
			p = my.sprite[item] || (my.xt(my.point) ? my.point[item] : false);
			if (p) {
				pStart = (p.type === 'Point') ? p.get('current') : p.start;
				for (var i = 0, iz = this.sprites.length; i < iz; i++) {
					sprite = my.sprite[this.sprites[i]];
					sv = my.v.set(sprite.start);
					sv.vectorSubtract(pStart);
					sprite.set({
						pivot: item,
						handleX: -sv.x,
						handleY: -sv.y,
					});
				}
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
	my.Group.prototype.getSpriteAt = function(items) {
		items = my.safeObject(items);
		var coordinate = my.v.set({
				x: (items.x || 0),
				y: (items.y || 0)
			}),
			sprite,
			cell,
			result;
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell);
		this.sortSprites();
		for (var i = this.sprites.length - 1; i >= 0; i--) {
			sprite = my.sprite[this.sprites[i]];
			if (this.regionRadius) {
				sprite.resetWork();
				result = sprite.work.start.vectorSubtract(coordinate);
				if (result.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (sprite.checkHit({
				x: coordinate.x,
				y: coordinate.y
			})) {
				return sprite;
			}
		}
		return false;
	};
	/**
Check all sprites in the Group to see if they are colliding with the supplied coordinate. The check is done in reverse order after the sprites have been sorted; all sprites (in the group) colliding with the coordinate are returned as an array of sprite objects
@method getSpriteAt
@param {Vector} items Coordinate vector; alternatively an Object with x and y attributes can be used
@return Sprite object, or false if no sprites are colliding with the coordinate
**/
	my.Group.prototype.getAllSpritesAt = function(items) {
		items = my.safeObject(items);
		var coordinate = my.v.set({
				x: (items.x || 0),
				y: (items.y || 0)
			}),
			sprite,
			cell,
			result,
			resArray = [];
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell);
		this.sortSprites();
		for (var i = this.sprites.length - 1; i >= 0; i--) {
			sprite = my.sprite[this.sprites[i]];
			if (this.regionRadius) {
				sprite.resetWork();
				result = sprite.work.start.vectorSubtract(coordinate);
				if (result.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (sprite.checkHit(coordinate)) {
				resArray.push(sprite);
			}
		}
		return (resArray.length > 0) ? resArray : false;
	};

	/**
# Sprite

## Instantiation

* This object should never be instantiated by users

## Purpose

* Supplies the common methodology for all Scrawl sprites: Phrase, Block, Wheel, Picture, Path, Shape
* Sets up the attributes for holding a sprite's current state: position, visibility, rotation, drawing order, context
* Describes how sprites should be stamped onto a Cell's canvas
* Provides drag-and-drop functionality

__Scrawl core does not include any sprite type constructors.__ Each sprite type used on a web page canvas needs to be added to the core by loading its associated module:

* __Block__ sprites are defined in the _scrawlBlock_ module (alias: block)
* __Wheel__ sprites are defined in the _scrawlWheel_ module (alias: wheel)
* __Phrase__ sprites are defined in the _scrawlPhrase_ module (alias: phrase)
* __Picture__ sprites are defined as part of the _scrawlImages_ module (alias: images)
* __Path__ sprites are defined in the _scrawlPath_ module (alias: path)
* __Shape__ sprites are defined in the _scrawlShape_ module (alias: shape)
* additional factory functions for defining common Path and Shape objects (lines, curves, ovals, triangles, stars, etc) are supplied by the _scrawlPathFactories_ module (alias: factories)

@class Sprite
@constructor
@extends Position
@uses Context
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Sprite = function(items) {
		items = my.safeObject(items);
		my.Position.call(this, items);
		items.name = this.name;
		var myContext = my.newContext(items);
		this.context = myContext.name;
		this.group = this.getGroup(items);
		this.fastStamp = items.fastStamp || false;
		this.scaleOutline = (my.isa(items.scaleOutline, 'bool')) ? items.scaleOutline : true;
		this.order = items.order || 0;
		this.visibility = (my.isa(items.visibility, 'bool')) ? items.visibility : true;
		this.method = items.method || my.d[this.type].method;
		this.collisionsSpriteConstructor(items);
		return this;
	};
	my.Sprite.prototype = Object.create(my.Position.prototype);
	/**
@property type
@type String
@default 'Sprite'
@final
**/
	my.Sprite.prototype.type = 'Sprite';
	my.Sprite.prototype.classname = 'spritenames';
	my.d.Sprite = {
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
Current SVGTiny data string for the sprite (only supported by Path and Shape sprites)
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
Scaling flag; set to true to ensure lineWidth scales in line with the scale attribute value
@property scaleOutline
@type Boolean
@default true
**/
		scaleOutline: true,
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
	};
	my.mergeInto(my.d.Sprite, my.d.Position);
	/**
Sprite constructor hook function - modified by collisions module
@method collisionsSpriteConstructor
@private
**/
	my.Sprite.prototype.collisionsSpriteConstructor = function(items) {};
	/**
Constructor helper function - register sprite object in the scrawl library
@method registerInLibrary
@return This
@chainable
@private
**/
	my.Sprite.prototype.registerInLibrary = function() {
		my.sprite[this.name] = this;
		my.pushUnique(my.spritenames, this.name);
		my.group[this.group].addSpritesToGroup(this.name);
		this.collisionsSpriteRegisterInLibrary();
		return this;
	};
	/**
Sprite.registerInLibrary hook function - modified by collisions module
@method collisionsSpriteRegisterInLibrary
@private
**/
	my.Sprite.prototype.collisionsSpriteRegisterInLibrary = function() {};
	/**
Augments Position.get()

Allows users to retrieve a sprite's Context object's values via the sprite
@method get
@param {String} item attribute key string
@return Attribute value
**/
	my.Sprite.prototype.get = function(item) {
		//retrieve title, comment, timestamp - which might otherwise be returned with the context object's values
		if (my.xt(my.d.Base[item])) {
			return my.Base.prototype.get.call(this, item);
		}
		//context attributes
		if (my.xt(my.d.Context[item])) {
			return my.ctx[this.context].get(item);
		}
		//sprite attributes
		return my.Position.prototype.get.call(this, item);
	};
	/**
Augments Position.set()

Allows users to:
* set a sprite's Context object's values via the sprite
* shift a sprite between groups
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Sprite.prototype.set = function(items) {
		my.Position.prototype.set.call(this, items);
		my.ctx[this.context].set(items);
		items = my.safeObject(items);
		if (my.xt(items.group)) {
			my.group[this.group].removeSpritesFromGroup(this.name);
			this.group = this.getGroup(items.group);
			my.group[this.group].addSpritesToGroup(this.name);
		}
		this.collisionsSpriteSet(items);
		if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.radius, items.scale])) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Sprite.set hook function - modified by collisions module
@method collisionsSpriteSet
@private
**/
	my.Sprite.prototype.collisionsSpriteSet = function(items) {};
	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a sprite's Context object's values via the sprite, in addition to its own attribute values
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Sprite.prototype.setDelta = function(items) {
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		var ctx = my.ctx[this.context];
		if (my.xto([items.lineDashOffset, items.lineWidth, items.globalAlpha])) {
			ctx.setDelta(items);
		}
		this.roll += items.roll || 0;
		this.width += items.width || 0;
		this.height += items.height || 0;
		if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.radius, items.scale])) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Augments Position.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	my.Sprite.prototype.clone = function(items) {
		items = my.safeObject(items);
		var a,
			b,
			c = JSON.parse(JSON.stringify(my.ctx[this.context]));
		delete c.name;
		b = my.mergeInto(items, c);
		delete b.context;
		a = my.Position.prototype.clone.call(this, b);
		if (my.xt(items.createNewContext) && !items.createNewContext) {
			delete my.ctx[a.context];
			my.removeItem(my.ctxnames, a.context);
			a.context = this.context;
		}
		return a;
	};
	/**
Constructor helper function - discover this sprite's default group affiliation
@method getGroup
@param {Object} [items] Constructor argument
@return GROUPNAME String
@private
**/
	my.Sprite.prototype.getGroup = function(items) {
		items = my.safeObject(items);
		if (my.xt(items.group) && my.contains(my.groupnames, items.group)) {
			return items.group;
		}
		else {
			return my.pad[my.currentPad].current;
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
	my.Sprite.prototype.forceStamp = function(method, cell) {
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
	my.Sprite.prototype.prepareStamp = function() {
		if (!this.offset.flag) {
			this.offset.set(this.getOffsetStartVector());
			this.offset.flag = true;
		}
		return this.offset;
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
	my.Sprite.prototype.stamp = function(method, cell) {
		if (this.visibility) {
			var myCell = (my.isa(cell, 'str') && my.contains(my.cellnames, cell)) ? my.cell[cell] : my.cell[my.group[this.group].cell],
				engine = my.context[myCell.name],
				myMethod = (my.isa(method, 'str')) ? method : this.method;
			if (this.pivot) {
				this.setStampUsingPivot(myCell.name);
			}
			else {
				this.pathStamp();
			}
			this.callMethod(engine, myCell.name, myMethod);
		}
		return this;
	};
	/**
Sprite.stamp hook function - modified by path module
@method pathStamp
@private
**/
	my.Sprite.prototype.pathStamp = function() {};
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
	my.Sprite.prototype.callMethod = function(engine, cell, method) {
		switch (method) {
			case 'clear':
				this.clear(engine, cell);
				break;
			case 'clearWithBackground':
				this.clearWithBackground(engine, cell);
				break;
			case 'draw':
				this.draw(engine, cell);
				break;
			case 'fill':
				this.fill(engine, cell);
				break;
			case 'drawFill':
				this.drawFill(engine, cell);
				break;
			case 'fillDraw':
				this.fillDraw(engine, cell);
				break;
			case 'sinkInto':
				this.sinkInto(engine, cell);
				break;
			case 'floatOver':
				this.floatOver(engine, cell);
				break;
			case 'clip':
				this.clip(engine, cell);
				break;
			case 'none':
				this.none(engine, cell);
				break;
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
	my.Sprite.prototype.rotateCell = function(ctx) {
		var myA = (this.flipReverse) ? -1 : 1,
			myD = (this.flipUpend) ? -1 : 1,
			deltaRotation = (this.addPathRoll) ? (this.roll + this.pathRoll) * my.radian : this.roll * my.radian,
			cos = Math.cos(deltaRotation),
			sin = Math.sin(deltaRotation);
		ctx.setTransform((cos * myA), (sin * myA), (-sin * myD), (cos * myD), this.start.x, this.start.y);
		return this;
	};
	/**
Stamp helper function - perform a 'clear' method draw

_Note: not supported by this sprite_
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.clear = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'clearWithBackground' method draw

_Note: not supported by this sprite_
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.clearWithBackground = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'draw' method draw

_Note: not supported by this sprite_
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.draw = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'fill' method draw

_Note: not supported by this sprite_
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.fill = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'drawFill' method draw

_Note: not supported by this sprite_
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.drawFill = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'fillDraw' method draw

_Note: not supported by this sprite_
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.fillDraw = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'sinkInto' method draw

_Note: not supported by this sprite_
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.sinkInto = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'floatOver' method draw

_Note: not supported by this sprite_
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.floatOver = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'clip' method draw

_Note: not supported by this sprite_
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.clip = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'none' method draw. This involves setting the &lt;canvas&gt; element's context engine's values with this sprite's context values, but not defining or drawing the sprite on the canvas.
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this sprite's Group object
@return This
@chainable
@private
**/
	my.Sprite.prototype.none = function(ctx, cell) {
		my.cell[cell].setEngine(this);
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
	my.Sprite.prototype.clearShadow = function(ctx, cell) {
		var c = my.ctx[this.context];
		if (c.shadowOffsetX || c.shadowOffsetY || c.shadowBlur) {
			my.cell[cell].clearShadow();
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
	my.Sprite.prototype.restoreShadow = function(ctx, cell) {
		var c = my.ctx[this.context];
		if (c.shadowOffsetX || c.shadowOffsetY || c.shadowBlur) {
			my.cell[cell].restoreShadow(this.context);
		}
		return this;
	};
	/**
Set sprite's pivot to 'mouse'; set handles to supplied Vector value; set order to +9999
@method pickupSprite
@param {Vector} items Coordinate vector; alternatively an object with {x, y} attributes can be used
@return This
@chainable
**/
	my.Sprite.prototype.pickupSprite = function(items) {
		items = my.safeObject(items);
		var coordinate = my.v.set({
				x: (items.x || 0),
				y: (items.y || 0)
			}),
			cell = my.cell[my.group[this.group].cell];
		coordinate = this.correctCoordinates(coordinate, cell);
		this.oldX = coordinate.x || 0;
		this.oldY = coordinate.y || 0;
		this.realPivot = this.pivot;
		this.set({
			pivot: 'mouse',
			order: this.order + 9999,
		});
		return this;
	};
	/**
Revert pickupSprite() actions, ensuring sprite is left where the user drops it
@method dropSprite
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
	my.Sprite.prototype.dropSprite = function(item) {
		var order = this.order;
		this.set({
			pivot: item || this.realPivot || false,
			order: (order >= 9999) ? order - 9999 : 0,
		});
		delete this.realPivot;
		delete this.oldX;
		delete this.oldY;
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
	my.Sprite.prototype.checkHit = function(items) {
		items = my.safeObject(items);
		var ctx = my.cvx,
			tests = (my.xt(items.tests)) ? [].concat(items.tests) : [(items.x || false), (items.y || false)],
			here,
			result;
		this.rotateCell(ctx);
		here = this.prepareStamp();
		ctx.beginPath();
		ctx.rect(here.x, here.y, (this.width * this.scale), (this.height * this.scale));
		for (var i = 0, iz = tests.length; i < iz; i += 2) {
			result = ctx.isPointInPath(tests[i], tests[i + 1]);
			if (result) {
				break;
			}
		}
		return (result) ? {
			x: tests[i],
			y: tests[i + 1]
		} : false;
	};

	/**
# Design

## Instantiation

* This object should never be instantiated by users

## Purpose

* Defines gradients and radial gradients used with sprite objects' strokeStyle and fillStyle attributes

@class Design
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Design = function(items) {
		my.Base.call(this, items);
		return this;
	};
	my.Design.prototype = Object.create(my.Base.prototype);
	/**
@property type
@type String
@default 'Design'
@final
**/
	my.Design.prototype.type = 'Design';
	my.Design.prototype.classname = 'designnames';
	my.d.Design = {
		/**
Array of JavaScript Objects representing color stop data

Objects take the form {color:String, stop:Number} where:

* __color__ attribute can be any legitimate CSS color string
* __stop can be any number between O and 0.999999 (not 1)
@property color
@type Array of JavaScript objects
@default [{color: 'black', stop: 0},{color: 'white', stop: 0.999999}]
**/
		color: [{
			color: 'black',
			stop: 0
		}, {
			color: 'white',
			stop: 0.999999
		}],
		/**
Drawing flag - when set to true, will use sprite-based 'range' coordinates to calculate the start and end points of the gradient; when false, will use Cell-based coordinates
@property setToSprite
@type Boolean
@default false
**/
		setToSprite: false,
		/**
CELLNAME String of &lt;canvas&gt; element context engine on which the gradient has been set
@property cell
@type String
@default ''
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
	};
	my.mergeInto(my.d.Design, my.d.Base);
	/**
Add values to Number attributes
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Design.prototype.setDelta = function(items) {
		items = my.safeObject(items);
		var f = {};
		if (items.startX) {
			f.startX = this.get('startX') + items.startX;
		}
		if (items.startY) {
			f.startY = this.get('startY') + items.startY;
		}
		if (items.startRadius) {
			f.startRadius = this.get('startRadius') + items.startRadius;
		}
		if (items.endX) {
			f.endX = this.get('endX') + items.endX;
		}
		if (items.endY) {
			f.endY = this.get('endY') + items.endY;
		}
		if (items.endRadius) {
			f.endRadius = this.get('endRadius') + items.endRadius;
		}
		if (items.startRangeRadius) {
			f.startRangeRadius = this.get('startRangeRadius') + items.startRangeRadius;
		}
		if (items.endRangeRadius) {
			f.endRangeRadius = this.get('endRangeRadius') + items.endRangeRadius;
		}
		if (items.startRangeX) {
			f.startRangeX = this.get('startRangeX') + items.startRangeX;
		}
		if (items.startRangeY) {
			f.startRangeY = this.get('startRangeY') + items.startRangeY;
		}
		if (items.endRangeX) {
			f.endRangeX = this.get('endRangeX') + items.endRangeX;
		}
		if (items.endRangeY) {
			f.endRangeY = this.get('endRangeY') + items.endRangeY;
		}
		if (items.roll && my.xt(my.d.Design.roll)) {
			f.roll = this.get('roll') + items.roll;
		}
		this.set(f);
		return this;
	};
	/**
Creates the gradient

_This function is replaced by the animation module_
@method update
@param {String} [sprite] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
**/
	my.Design.prototype.update = function(sprite, cell) {
		this.makeGradient(sprite, cell);
		this.applyStops();
		return this;
	};
	/**
Returns &lt;canvas&gt; element's contenxt engine's gradient object, or 'rgba(0,0,0,0)' on failure
@method getData
@return JavaScript Gradient object, or String
@private
**/
	my.Design.prototype.getData = function() {
		return (my.xt(my.dsn[this.name])) ? my.dsn[this.name] : 'rgba(0,0,0,0)';
	};
	/**
Design.update() helper function - builds &lt;canvas&gt; element's contenxt engine's gradient object
@method makeGradient
@param {String} [sprite] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
@private
**/
	my.Design.prototype.makeGradient = function(sprite, cell) {
		cell = (my.xt(cell)) ? my.cell[cell] : my.cell[this.get('cell')];
		sprite = my.sprite[sprite];
		var ctx = my.context[cell.name],
			g,
			north,
			south,
			east,
			west,
			temp = sprite.getOffsetStartVector();
		switch (this.type) {
			case 'Gradient':
				if (this.get('setToSprite')) {
					switch (sprite.type) {
						case 'Wheel':
							west = temp.x - (sprite.radius * sprite.scale);
							north = temp.y - (sprite.radius * sprite.scale);
							east = west + (sprite.radius * 2 * sprite.scale);
							south = north + (sprite.radius * 2 * sprite.scale);
							break;
						case 'Shape':
							west = temp.x - ((sprite.width / 2) * sprite.scale);
							north = temp.y - ((sprite.height / 2) * sprite.scale);
							east = west + (sprite.width * sprite.scale);
							south = north + (sprite.height * sprite.scale);
							break;
						default:
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
				else {
					west = -sprite.start.x + this.get('startX');
					north = -sprite.start.y + this.get('startY');
					east = -sprite.start.x + (this.get('endX') || cell.actualWidth);
					south = -sprite.start.y + (this.get('endY') || cell.actualHeight);
				}
				g = ctx.createLinearGradient(west, north, east, south);
				break;
			case 'RadialGradient':
				if (this.setToSprite) {
					g = ctx.createRadialGradient(this.get('startX'), this.get('startY'), (this.get('startRadius') * this.get('startRangeRadius')), this.get('endX'), this.get('endY'), (this.get('endRadius') * this.get('endRangeRadius')));
				}
				else {
					west = this.get('startX') - sprite.start.x;
					east = this.get('startY') - sprite.start.y;
					north = this.get('endX') - sprite.start.x;
					south = this.get('endY') - sprite.start.y;
					g = ctx.createRadialGradient(west, east, this.get('startRadius'), north, south, this.get('endRadius'));
				}
				break;
			default:
				g = false;
		}
		my.dsn[this.name] = g;
		return this;
	};
	/**
Design.update() helper function - applies color attribute objects to the gradient
@method applyStops
@return This
@private
@chainable
**/
	my.Design.prototype.applyStops = function() {
		var color = this.get('color');
		if (my.dsn[this.name]) {
			for (var i = 0, iz = color.length; i < iz; i++) {
				my.dsn[this.name].addColorStop(color[i].stop, color[i].color);
			}
		}
		return this;
	};
	/**
Remove this gradient from the scrawl library
@method remove
@return Always true
**/
	my.Design.prototype.remove = function() {
		delete my.dsn[this.name];
		delete my.design[this.name];
		my.removeItem(my.designnames, this.name);
		return true;
	};

	/**
# Gradient

## Instantiation

* scrawl.newGradient()

## Purpose

* Defines a linear gradient
* Used with sprite.strokeStyle and sprite.fillStyle attributes

## Access

* scrawl.design.GRADIENTNAME - for the Gradient object

@class Gradient
@constructor
@extends Design
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Gradient = function(items) {
		items = my.safeObject(items);
		my.Design.call(this, items);
		my.Base.prototype.set.call(this, items);
		my.design[this.name] = this;
		my.pushUnique(my.designnames, this.name);
		return this;
	};
	my.Gradient.prototype = Object.create(my.Design.prototype);
	/**
@property type
@type String
@default 'Gradient'
@final
**/
	my.Gradient.prototype.type = 'Gradient';
	my.Gradient.prototype.classname = 'designnames';
	my.d.Gradient = {};
	my.mergeInto(my.d.Gradient, my.d.Design);
	/**
Swap start and end attributes
@method swap
@return This
@chainable
**/
	my.Gradient.prototype.swap = function() {
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

## Access

* scrawl.design.RADIALGRADIENTNAME - for the RadialGradient object

@class RadialGradient
@constructor
@extends Design
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.RadialGradient = function(items) {
		items = my.safeObject(items);
		my.Design.call(this, items);
		my.Base.prototype.set.call(this, items);
		my.design[this.name] = this;
		my.pushUnique(my.designnames, this.name);
		return this;
	};
	my.RadialGradient.prototype = Object.create(my.Design.prototype);
	/**
@property type
@type String
@default 'RadialGradient'
@final
**/
	my.RadialGradient.prototype.type = 'RadialGradient';
	my.RadialGradient.prototype.classname = 'designnames';
	my.d.RadialGradient = {
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
	my.mergeInto(my.d.RadialGradient, my.d.Design);
	/**
Swap start and end attributes
@method swap
@return This
@chainable
**/
	my.RadialGradient.prototype.swap = function() {
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

	my.v = my.newVector({
		name: 'scrawl.v'
	});
	my.workquat = {
		q1: my.newQuaternion({
			name: 'scrawl.workquat.q1'
		}),
		q2: my.newQuaternion({
			name: 'scrawl.workquat.q2'
		}),
		q3: my.newQuaternion({
			name: 'scrawl.workquat.q3'
		}),
		q4: my.newQuaternion({
			name: 'scrawl.workquat.q4'
		}),
		q5: my.newQuaternion({
			name: 'scrawl.workquat.q5'
		}),
	};

	return my;
}());
