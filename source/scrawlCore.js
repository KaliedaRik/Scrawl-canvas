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

### Be aware that the current develop branch includes changes beyond v3.1.7 that break that version

The next version, being coded up on the develop branch, will be v4.0.0

## Purpose and features

The core module is the only essential module in Scrawl. It must always be directly, and completely, loaded into the web page before any additional Scrawl modules are added to it. 

* Defines the Scrawl scope - __window.scrawl__

* Defines a number of utility methods used throughout Scrawl.js

* Defines the Scrawl library - all significant objects created by Scrawl can be found here

* Searches the DOM for &lt;canvas&gt; elements, and imports them into the Scrawl library

* Instantiates controllers (Pad objects) and wrappers (Cell objects) for each &lt;canvas&gt; element

* Instantiates Context engine objects for each Cell object

* Defines mouse functionality in relation to &lt;canvas&gt; elements

* Defines the core functionality for Entity objects to be displayed on &lt;canvas&gt; elements; the different types of Entitys are defined in separate modules which need to be loaded into the core

* Defines Group objects, used to group entitys together for display and interaction purposes

* Defines Design objects - Gradient and RadialGradient - which can be used by Entity objects for their _fill_ and _stroke_ styles; additional Design objects (Pattern, Color) are defined in separate modules

## Loading the module


@example
	<script src="path/to/scrawlCore-min.js"></script>

@module scrawlCore
**/

var scrawl = window.scrawl || (function() {
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
* scrawl.__ctx__ - Contains CONTEXTNAME:Object pairs linking to each instantiated Scrawl Context object (used by Cell and Entity objects)
* scrawl.__imageData__ - Contains key:value pairs linking to JavaScript image data objects
* scrawl.__group__ - Contains GROUPNAME:Object pairs linking to each instantiated Group object
* scrawl.__design__ - Contains DESIGNNAME:Object pairs for each instantiated design object (Gradient, RadialGradient, Pattern, Color)
* scrawl.__dsn__ - Contains DESIGNNAME:precompiled gradient/pattern context object pairs (Gradient, RadialGradient, Pattern)
* scrawl.__entity__ - Contains SPRITENAME:Object pairs for each instantiated entity object (Block, Phrase, Picture, Wheel, Path, Shape, Particle)

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
	my.nameslist = ['objectnames', 'padnames', 'cellnames', 'ctxnames', 'groupnames', 'designnames', 'entitynames'];
	/**
Array of objects which define the sections of the Scrawl library
@property sectionlist
@type {Array}
@private
**/
	my.sectionlist = ['object', 'pad', 'cell', 'canvas', 'context', 'ctx', 'imageData', 'group', 'design', 'dsn', 'entity'];
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
		frame: 'scrawlFrame',
		animation: 'scrawlAnimation',
		collisions: 'scrawlCollisions',
		factories: 'scrawlPathFactories',
		color: 'scrawlColor',
		filters: 'scrawlFilters',
		physics: 'scrawlPhysics',
		saveload: 'scrawlSaveLoad',
		stacks: 'scrawlStacks',
		quaternion: 'scrawlQuaternion',
		imageload: 'scrawlImageLoad',
	};
	/**
Array of loaded module arrays
@property modules
@type {Array}
@private
**/
	my.modules = [];
	/**
Key:value pairs of module alias:Array, used by scrawl.loadModules()
@property loadDependencies
@type {Object}
@private
**/
	my.loadDependencies = {
		block: [],
		wheel: [],
		phrase: [],
		path: [],
		shape: [],
		images: ['imageload'],
		frame: ['imageload'],
		animation: [],
		collisions: [],
		factories: [],
		color: [],
		filters: [],
		physics: ['quaternion'],
		saveload: [],
		stacks: ['quaternion'],
		quaternion: [],
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
		my.filtersInit();
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
scrawl.init hook function - modified by filters module
@method filtersInit
@private
**/
	my.filtersInit = function() {};
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
* __scrawlBlock.js__ - alias __block__ - adds _Block_ (square and rectangle) entitys to the core
* __scrawlCollisions.js__ - alias __collisions__ - adds entity collision detection functionality to the core
* __scrawlColor.js__ - alias __color__ - adds the _Color_ Design object to the core
* __scrawlFilters.js__ - alias __filters__ - adds image filter functionality to the core
* __scrawlFrame.js__ - alias __frame__ - enhanced Picture entity
* __scrawlImages.js__ - alias __images__ - adds all image functionality, including static and animated _Picture_ entitys and the _Pattern_ Design object, to the core
* __scrawlPath.js__ - alias __path__ - adds _Path_ (SVGTiny path data) entitys to the core
* __scrawlPathFactories.js__ - alias __factories__ - adds user-friendly Path and Shape factory functions (for lines, quadratic and bezier curves, ellipses, round-corner rectangles, regular shapes such as stars, triangles, etc) to the core
* __scrawlPhrase.js__ - alias __phrase__ - adds _Phrase_ (single and multiline text) entitys to the core
* __scrawlPhysics.js__ - alias __physics__ - adds a physics engine to the core (experimental)
* __scrawlSaveLoad.js__ - alias __saveload__ - adds JSON object save and load functionality to the core (experimental)
* __scrawlShape.js__ - alias __shape__ - adds _Shape_ (path-like shapes) entitys to the core
* __scrawlStacks.js__ - alias __stacks__ - adds the ability to position, manipulate and animate &lt;canvas&gt; and other DOM elements in a 3d space on the web page
* __scrawlWheel.js__ - alias __wheel__ - adds _Wheel_ (circle and segment) entitys to the core
* __scrawlImageLoad.js__ - alias __imageload__ - adds the ability to load img elements into the library
* __scrawlQuaternion.js__ - alias __quaternion__ - adds quaternion maths functionality to the core

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
			modules = [].concat(items.modules),
			callback = (my.isa(items.callback, 'fn')) ? items.callback : function() {},
			error = (my.isa(items.error, 'fn')) ? items.error : function() {},
			mini = my.xtGet([items.minified, true]),
			tail = (mini) ? '-min.js' : '.js',
			loaded = [],
			required = [],
			startTime = Date.now(),
			timeout = 30000, // allow a maximum of 30 seconds to get all modules
			i, iz, j, jz,
			getModule = function(module) {
				var mod,
					myMod = my.loadAlias[module] || module;
				if (!my.contains(my.modules, myMod)) {
					mod = document.createElement('script');
					mod.type = 'text/javascript';
					mod.async = 'true';
					mod.onload = function(e) {
						console.log('... ' + module + ' loaded');
						done(module);
					};
					mod.onerror = function(e) {
						console.log('... ' + module + ' failed to load');
						done(module, true);
					};
					mod.src = (/\.js$/.test(myMod)) ? path + myMod : path + myMod + tail;
					document.body.appendChild(mod);
				}
			},
			done = function(m, e) {
				my.removeItem(loaded, m);
				if (e || Date.now() > startTime + timeout) {
					console.log('failed to load all modules');
					error();
				}
				else {
					my.pushUnique(my.modules, m);
				}
				if (loaded.length === 0) {
					console.log('All modules loaded', my.modules);
					callback();
				}
			};
		for (i = 0, iz = modules.length; i < iz; i++) {
			for (j = 0, jz = my.loadDependencies[modules[i]].length; j < jz; j++) {
				my.pushUnique(required, my.loadDependencies[modules[i]][j]);
			}
			my.pushUnique(required, modules[i]);
		}
		loaded = [].concat(required);
		console.log('Modules to be loaded: ', required);
		for (i = 0, iz = required.length; i < iz; i++) {
			getModule(required[i]);
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
A __utility__ function that adds two numbers, keeping them within bounds

The argument object can take the following attributes:

* __min__ - Number - minimum bound; default 0
* __max__ - Number - maximum bound; default 1
* __action__ - String - 'bounce', 'loop', 'stick' (default)
* __operation__ - String - 'add' or '+' (default), 'subtract' or '-', 'multiply' or '*', 'divide' or '/'

The action attribute refers to the action taken when the result of the operation falls beyond the set bounds:

* __bounce__ - the value is reversed eg 3 + 4 (max bound: 5) = 3 
* __loop__ - 'clock' calculation eg 3 + 4 (min bound: 0; max bound: 5) = 1 
* __stick__ - maximum or minimum value is applied eg 3 + 4 (max bound: 5) = 5 

@method addWithinBounds
@param {Number} a first number
@param {Number} b second number (order is important for subtraction or division)
@param {Object} object consisting of key:value pairs
@return result of calculation
**/
	my.addWithinBounds = function(a, b, items) {
		items = my.safeObject(items);
		a = my.xtGet([a, 0]);
		b = my.xtGet([b, 0]);
		var min = my.xtGet([items.min, 0]),
			max = my.xtGet([items.max, 1]),
			action = my.xtGet([items.action, 'stick']),
			operation = my.xtGet([items.operation, 'add']),
			result,
			bound,
			count = 20;

		if (b === 0 && (operation === 'divide' || operation === '/')) {
			return false;
		}

		switch (operation) {
			case 'subtract':
			case '-':
				result = a - b;
				break;
			case 'multiply':
			case '*':
				result = a * b;
				break;
			case 'divide':
			case '/':
				result = a / b;
				break;
			default:
				result = a + b;
		}

		while (!my.isBetween(result, min, max, true) && count > 0) {
			bound = (result < (min + max) / 2) ? true : false;
			switch (action) {
				case 'bounce':
					result = (bound) ? min + (-result + min) : max + (-result + max);
					break;
				case 'loop':
					result = (bound) ? (max - min) + result : (min - max) + result;
					break;
				default:
					result = (bound) ? min : max;
			}
			count--;
		}

		return (count > 0) ? result : false;
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
			var myId = identifier.toLowerCase(),
				f = myId[0];
			if (f < 'm') {
				if (f < 'd') {
					switch (myId) {
						case 'arr':
							return (Array.isArray(item)) ? true : false;
						case 'bool':
							return (typeof item === 'boolean') ? true : false;
						case 'canvas':
							return (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;
						default:
							return false;
					}
				}
				else {
					switch (myId) {
						case 'date':
							return (Object.prototype.toString.call(item) === '[object Date]') ? true : false;
						case 'fn':
							return (typeof item === 'function') ? true : false;
						case 'img':
							return (Object.prototype.toString.call(item) === '[object HTMLImageElement]') ? true : false;
						default:
							return false;
					}
				}
			}
			else {
				if (f < 's') {
					switch (myId) {
						case 'num':
							return (item.toFixed) ? true : false;
						case 'obj':
							return (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
						case 'quaternion':
							return (item.type && item.type === 'Quaternion') ? true : false;
						default:
							return false;
					}
				}
				else {
					switch (myId) {
						case 'str':
							return (item.substring) ? true : false;
						case 'vector':
							return (item.type && item.type === 'Vector') ? true : false;
						case 'video':
							return (Object.prototype.toString.call(item) === '[object HTMLVideoElement]') ? true : false;
						default:
							return false;
					}
				}
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
A __utility__ function that checks an array of values and returns the first value that exists
@method xtGet
@param {Array} array of (mixed) values
@return first defined variable; null if all values are undefined
**/
	my.xtGet = function(item) {
		var a = [].concat(item);
		if (a.length > 0) {
			for (var i = 0, iz = a.length; i < iz; i++) {
				if (typeof a[i] !== 'undefined') {
					return a[i];
				}
			}
		}
		return null;
	};
	/**
A __utility__ function that checks an array of values and returns the first value that evaluates to true

False: 0, -0, '', undefined, null, false, NaN

@method xtGetTrue
@param {Array} array of (mixed) values
@return first true variable; null if all values are false
**/
	my.xtGetTrue = function(item) {
		var a = [].concat(item);
		if (a.length > 0) {
			for (var i = 0, iz = a.length; i < iz; i++) {
				if (a[i]) {
					return a[i];
				}
			}
		}
		return null;
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
			u,
			nameArray,
			o = {
				name: (my.isa(item.name, 'str')) ? item.name : u,
				type: (my.isa(item.type, 'str')) ? item.type : u,
				target: (my.isa(item.target, 'str')) ? item.target : u,
			};
		if (my.contains(my.nameslist, o.target)) {
			name = my.xtGetTrue([o.name, o.type, 'default']);
			nameArray = name.split('~~~');
			return (my.contains(my[o.target], nameArray[0])) ? nameArray[0] + '~~~' + Math.floor(Math.random() * 100000000) : nameArray[0];
		}
		console.log('scrawl.makeName() error: insufficient or incorrect argument attributes', item, o);
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
			name: my.xtGet([items.canvasName, items.name, false]),
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
A __utility__ function to add two percent strings together
@method addPercentages
@param {String} a - first value
@param {String} b - second value
@return String result
**/
	my.addPercentages = function(a, b) {
		var tempA, tempB;
		tempA = parseFloat(a);
		tempB = parseFloat(b);
		return (tempA + tempB) + '%';
	};
	/**
A __utility__ function to reverse the value of a percentage string
@method reversePercentage
@param {String} a - value
@return String result
**/
	my.reversePercentage = function(a) {
		var temp = parseFloat(a);
		temp = -temp;
		return temp + '%';
	};
	/**
A __utility__ function to subtract a percent string from another
@method subtractPercentages
@param {String} a - initial value
@param {String} b - value to be subtracted from initial value
@return String result
**/
	my.subtractPercentages = function(a, b) {
		var tempA, tempB;
		tempA = parseFloat(a);
		tempB = parseFloat(b);
		return (tempA - tempB) + '%';
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
A __general__ function which adds supplied entitynames to Group.entitys attribute
@method addEntitysToGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} entitys Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.addEntitysToGroups = function(groups, entitys) {
		if (my.xta([groups, entitys])) {
			var myGroups = [].concat(groups),
				myEntitys = [].concat(entitys);
			for (var i = 0, iz = myGroups.length; i < iz; i++) {
				if (my.contains(my.groupnames, myGroups[i])) {
					my.group[myGroups[i]].addEntitysToGroup(myEntitys);
				}
			}
		}
		return my;
	};
	/**
A __general__ function which removes supplied entitynames from Group.entitys attribute
@method removeEntitysFromGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} entitys Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.removeEntitysFromGroups = function(groups, entitys) {
		if (my.xta([groups, entitys])) {
			var myGroups = [].concat(groups),
				myEntitys = [].concat(entitys);
			for (var i = 0, iz = myGroups.length; i < iz; i++) {
				if (my.contains(my.groupnames, myGroups[i])) {
					my.group[myGroups[i]].removeEntitysFromGroup(myEntitys);
				}
			}
		}
		return my;
	};
	/**
A __general__ function to delete entity objects
@method deleteEntity
@param {Array} items Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
@example
	scrawl.newBlock({
		name: 'myblock',
		});
	scrawl.deleteEntity(['myblock']);
**/
	my.deleteEntity = function(items) {
		var myItems = (my.isa(items, 'str')) ? [items] : [].concat(items),
			myPointList,
			myLinkList,
			myCtx,
			search,
			myEntity;
		for (var i = 0, iz = myItems.length; i < iz; i++) {
			if (my.contains(my.entitynames, myItems[i])) {
				myEntity = my.entity[myItems[i]];
				my.pathDeleteEntity(myEntity);
				myCtx = myEntity.context;
				my.removeItem(my.ctxnames, myCtx);
				delete my.ctx[myCtx];
				my.removeItem(my.entitynames, myItems[i]);
				delete my.entity[myItems[i]];
				for (var j = 0, jz = my.groupnames.length; j < jz; j++) {
					my.removeItem(my.group[my.groupnames[j]].entitys, myItems[i]);
				}
			}
		}
		return my;
	};
	/**
scrawl.deleteEntity hook function - modified by path module
@method pathDeleteEntity
@private
**/
	my.pathDeleteEntity = function(items) {};
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
			name: items.name,
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
		delete b.context; //required for successful cloning of entitys
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

Certain Scrawl modules will add functionality to this object, for instance scrawlAnimation adds delta attributes which can be used to automatically update the position of a Scrawl entity.
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
		start: false,
		/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property handle
@type Object
**/
		handle: false,
		/**
The SPRITENAME or POINTNAME of a entity or Point object to be used for setting this object's start point
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
Reflection flag; set to true to flip entity, cell or element along the Y axis
@property flipReverse
@type Boolean
@default false
**/
		flipReverse: false,
		/**
Reflection flag; set to true to flip entity, cell or element along the X axis
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
Current rotation of the entity, cell or element (in degrees)
@property roll
@type Number
@default 0
**/
		roll: 0,
		/**
Entity, cell or element width (in pixels)
@property width
@type Number
@default 0
**/
		width: 0,
		/**
Entity, cell or element height (in pixels)
@property width
@type Number
@default 0
**/
		height: 0,
		/**
(Added by the path module)
The SPRITENAME of a Shape entity whose path is used to calculate this object's start point
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
			x: my.xtGet([items.startX, temp.x, 0]),
			y: my.xtGet([items.startY, temp.y, 0]),
			name: this.type + '.' + this.name + '.start',
		});
		this.work.start = my.newVector({
			name: this.type + '.' + this.name + '.work.start'
		});
		temp = my.safeObject(items.handle);
		this.handle = my.newVector({
			x: my.xtGet([items.handleX, temp.x, 0]),
			y: my.xtGet([items.handleY, temp.y, 0]),
			name: this.type + '.' + this.name + '.handle',
		});
		this.work.handle = my.newVector({
			name: this.type + '.' + this.name + '.work.handle'
		});
		this.pivot = my.xtGet([items.pivot, my.d[this.type].pivot]);
		this.scale = my.xtGet([items.scale, my.d[this.type].scale]);
		this.roll = my.xtGet([items.roll, my.d[this.type].roll]);
		this.flipReverse = my.xtGet([items.flipReverse, my.d[this.type].flipReverse]);
		this.flipUpend = my.xtGet([items.flipUpend, my.d[this.type].flipUpend]);
		this.lockX = my.xtGet([items.lockX, my.d[this.type].lockX]);
		this.lockY = my.xtGet([items.lockY, my.d[this.type].lockY]);
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
			this.start.x = my.xtGet([items.startX, this.start.x]);
			this.start.y = my.xtGet([items.startY, this.start.y]);
		}
		if (!my.isa(this.handle, 'vector')) {
			this.handle = my.newVector(items.handle || this.handle);
		}
		if (my.xto([items.handleX, items.handleY])) {
			this.handle.x = my.xtGet([items.handleX, this.handle.x]);
			this.handle.y = my.xtGet([items.handleY, this.handle.y]);
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
	my.Position.prototype.updateStart = function(item) {};
	my.Position.prototype.revertStart = function(item) {};
	my.Position.prototype.reverse = function(item) {};

	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function. This function also accepts startX, startY, handleX, handleY
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDelta = function(items) {
		items = my.safeObject(items);
		var temp, x, y;
		if (my.xto([items.start, items.startX, items.startY])) {
			temp = my.safeObject(items.start);
			x = my.xtGet([items.startX, temp.x, 0]);
			y = my.xtGet([items.startY, temp.y, 0]);
			this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + x : my.addPercentages(this.start.x, x);
			this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + y : my.addPercentages(this.start.y, y);
		}
		my.Position.prototype.pathPositionSetDelta.call(this, items);
		if (my.xto([items.handle, items.handleX, items.handleY])) {
			temp = my.safeObject(items.handle);
			x = my.xtGet([items.handleX, temp.x, 0]);
			y = my.xtGet([items.handleY, temp.y, 0]);
			this.handle.x = (my.isa(this.handle.x, 'num')) ? this.handle.x + x : my.addPercentages(this.handle.x, x);
			this.handle.y = (my.isa(this.handle.y, 'num')) ? this.handle.y + y : my.addPercentages(this.handle.y, y);
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
			x: my.xtGet([items.startX, temp.x, a.start.x]),
			y: my.xtGet([items.startY, temp.y, a.start.y]),
			name: a.type + '.' + a.name + '.start',
		});
		temp = my.safeObject(items.handle);
		a.handle = my.newVector({
			x: my.xtGet([items.handleX, temp.x, a.handle.x]),
			y: my.xtGet([items.handleY, temp.y, a.handle.y]),
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
@return A Vector of calculated offset values to help determine where entity/cell/element drawing should start
@private
**/
	my.Position.prototype.getPivotOffsetVector = function() {
		var result = this.work.handle,
			height = this.targetHeight || (this.localHeight / this.scale) || this.height || this.get('height'),
			width = this.targetWidth || (this.localWidth / this.scale) || this.width || this.get('width');
		if (my.isa(height, 'str')) {
			height = this.pasteData.h;
		}
		if (my.isa(width, 'str')) {
			width = this.pasteData.w;
		}
		return my.Position.prototype.calculatePOV.call(this, result, width, height, false);
	};
	/**
Position.getOffsetStartVector() helper function. Supervises the calculation of the pixel values for the object's handle attribute, where the object's frame of reference is its center

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getCenteredPivotOffsetVector
@return A Vector of calculated offset values to help determine where entity/cell/element drawing should start
@private
**/
	my.Position.prototype.getCenteredPivotOffsetVector = function() {
		var result = this.work.handle,
			height = this.localHeight / this.scale || this.height || this.get('height'),
			width = this.localWidth / this.scale || this.width || this.get('width');
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
		result.x = (isNaN(result.x)) ? 0 : result.x;
		result.y = (isNaN(result.y)) ? 0 : result.y;
		return result;
	};
	/**
Calculates the pixel values of the object's handle attribute
@method getOffsetStartVector
@return Final offset values (as a Vector) to determine where entity, cell or element drawing should start
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
Stamp helper function - set this entity, cell or element start values to its pivot entity/point start value, or to the current mouse coordinates

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
			pEntity;
		if (my.xt(my.pointnames) && my.contains(my.pointnames, this.pivot)) {
			myP = my.point[this.pivot];
			pEntity = my.entity[myP.entity];
			myPVector = myP.getCurrentCoordinates().rotate(pEntity.roll).vectorAdd(pEntity.start);
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			return this;
		}
		if (my.contains(my.entitynames, this.pivot)) {
			myP = my.entity[this.pivot];
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
		this.scale = my.xtGet([items.scale, my.d[this.type].scale]);
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
					return my.xtGet([this.width, parseFloat(el.width), my.d[this.type].width]);
				case 'height':
					return my.xtGet([this.height, parseFloat(el.height), my.d[this.type].height]);
				case 'position':
					return my.xtGet([this.position, el.style.position]);
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
				tempname = my.xtGet([items.canvasElement.id, items.canvasElement.name, tempname]);
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
				this.width = my.xtGet([items.width, this.get('width')]);
				this.height = my.xtGet([items.height, this.get('height')]);
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
				backgroundColor: items.backgroundColor || cell.backgroundColor,
				globalAlpha: items.globalAlpha || cell.globalAlpha,
				globalCompositeOperation: items.globalCompositeOperation || cell.globalCompositeOperation,
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
		items = my.safeObject(items);
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
* Builds &lt;canvas&gt; element collision fields from entity data
* Undertakes collision detection between entitys and a collision field

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

* __copyX__ - (Number) the x coordinate on the source &lt;canvas&gt;
* __copyY__ - (Number) the y coordinate on the source &lt;canvas&gt;

@property copy
@type Vector
**/
		copy: false,
		/**
Copy width, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
@property copyWidth
@type Number
@default 300
**/
		copyWidth: 300,
		/**
Copy height, in pixels. Determines which portion of this Cell's &lt;canvas&gt; element will be copied to another &lt;canvas&gt;
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
Paste width, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property pasteWidth
@type Number
@default 300
**/
		pasteWidth: 300,
		/**
Paste height, in pixels. Determines where, and at what scale, the copied portion of this Cell's &lt;canvas&gt; will appear on the target Cell's &lt;canvas&gt;
@property pasteHeight
@type Number
@default 150
**/
		pasteHeight: 150,
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
		this.pad = my.xtGet([items.pad, false]);
		temp = my.safeObject(items.copy);
		this.copy = my.newVector({
			x: my.xtGet([items.copyX, temp.x, 0]),
			y: my.xtGet([items.copyY, temp.y, 0]),
			name: this.type + '.' + this.name + '.copy'
		});
		this.work.copy = my.newVector({
			name: this.type + '.' + this.name + '.work.copy'
		});
		this.actualWidth = my.canvas[this.name].width;
		this.actualHeight = my.canvas[this.name].height;
		this.copyWidth = this.actualWidth;
		this.copyHeight = this.actualHeight;
		this.copyData = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		this.pasteData = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		this.pasteWidth = this.actualWidth;
		this.pasteHeight = this.actualHeight;
		this.setDimensions(items);
		if (my.xto([items.pasteX, items.pasteY])) {
			this.start.x = my.xtGet([items.pasteX, this.start.x]);
			this.start.y = my.xtGet([items.pasteY, this.start.y]);
		}
		if (my.xto([items.copyWidth, items.copyHeight, items.pasteWidth, items.pasteHeight, items.width, items.height])) {
			this.copyWidth = my.xtGet([items.copyWidth, items.width, this.copyWidth]);
			this.copyHeight = my.xtGet([items.copyHeight, items.height, this.copyHeight]);
			this.pasteWidth = my.xtGet([items.pasteWidth, items.width, this.pasteWidth]);
			this.pasteHeight = my.xtGet([items.pasteHeight, items.height, this.pasteHeight]);
		}
		this.usePadDimensions = (my.isa(items.usePadDimensions, 'bool')) ? items.usePadDimensions : ((my.xto([items.copyWidth, items.copyHeight, items.pasteWidth, items.pasteHeight, items.width, items.height])) ? false : true);
		this.setCopy();
		this.setPaste();
		myContext = my.newContext({
			name: this.name,
			cell: my.context[this.name]
		});
		this.context = myContext.name;
		this.flipUpend = my.xtGet([items.flipUpend, my.d.Cell.flipUpend]);
		this.flipReverse = my.xtGet([items.flipReverse, my.d.Cell.flipReverse]);
		this.lockX = my.xtGet([items.lockX, my.d.Cell.lockX]);
		this.lockY = my.xtGet([items.lockY, my.d.Cell.lockY]);
		this.roll = my.xtGet([items.roll, my.d.Cell.roll]);
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
		if (my.contains(['pasteX', 'pasteY', 'copyX', 'copyY'], item)) {
			switch (item) {
				case 'pasteX':
					return this.start.x;
				case 'pasteY':
					return this.start.y;
				case 'copyX':
					return this.copy.x;
				case 'copyY':
					return this.copy.y;
			}
		}
		if (my.contains(['paste', 'copy'], item)) {
			switch (item) {
				case 'paste':
					return this.start.getVector();
				case 'copy':
					return this.copy.getVector();
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
		if (my.xto([items.paste, items.pasteX, items.pasteY])) {
			temp = my.safeObject(items.paste);
			this.start.x = my.xtGet([items.pasteX, temp.x, this.start.x]);
			this.start.y = my.xtGet([items.pasteY, temp.y, this.start.y]);
		}
		if (my.xto([items.copy, items.copyX, items.copyY])) {
			temp = my.safeObject(items.copy);
			this.copy.x = my.xtGet([items.copyX, temp.x, this.copy.x]);
			this.copy.y = my.xtGet([items.copyY, temp.y, this.copy.y]);
		}
		if (my.xto([items.copyWidth, items.copyHeight, items.width, items.height])) {
			this.copyWidth = my.xtGet([items.copyWidth, items.width, this.copyWidth]);
			this.copyHeight = my.xtGet([items.copyHeight, items.height, this.copyHeight]);
		}
		if (my.xto([items.pasteWidth, items.pasteHeight, items.width, items.height])) {
			this.pasteWidth = my.xtGet([items.pasteWidth, items.width, this.pasteWidth]);
			this.pasteHeight = my.xtGet([items.pasteHeight, items.height, this.pasteHeight]);
		}
		if (my.xto([items.actualWidth, items.actualHeight, items.width, items.height])) {
			this.actualWidth = my.xtGet([items.actualWidth, items.width, this.actualWidth]);
			this.actualHeight = my.xtGet([items.actualHeight, items.height, this.actualHeight]);
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
		}
		this.animationCellSet(items);
		if (my.xto([items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height, items.scale])) {
			this.setCopy();
		}
		if (my.xto([items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale])) {
			this.setPaste();
		}
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
		var temp, x, y, w, h;
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		if (my.xto([items.copy, items.copyX, items.copyY])) {
			temp = my.safeObject(items.copy);
			x = my.xtGet([items.copyX, temp.x, 0]);
			y = my.xtGet([items.copyY, temp.y, 0]);
			this.copy.x = (my.isa(x, 'num')) ? this.copy.x + x : my.addPercentages(this.copy.x, x);
			this.copy.y = (my.isa(y, 'num')) ? this.copy.y + y : my.addPercentages(this.copy.y, y);
		}
		if (my.xto([items.paste, items.pasteX, items.pasteY])) {
			temp = my.safeObject(items.paste);
			x = my.xtGet([items.pasteX, temp.x, 0]);
			y = my.xtGet([items.pasteY, temp.y, 0]);
			this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + x : my.addPercentages(this.start.x, x);
			this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + y : my.addPercentages(this.start.y, y);
		}
		if (my.xt([items.copyWidth])) {
			this.copyWidth = (my.isa(this.copyWidth, 'num')) ? this.copyWidth + items.copyWidth : my.addPercentages(this.copyWidth, items.copyWidth);
		}
		if (my.xt([items.copyHeight])) {
			this.copyHeight = (my.isa(this.copyHeight, 'num')) ? this.copyHeight + items.copyHeight : my.addPercentages(this.copyHeight, items.copyHeight);
		}
		if (my.xto([items.pasteWidth, items.width])) {
			w = my.xtGet([items.pasteWidth, items.width]);
			this.pasteWidth = (my.isa(this.pasteWidth, 'num')) ? this.pasteWidth + w : my.addPercentages(this.pasteWidth, w);
		}
		if (my.xto([items.pasteHeight, items.height])) {
			h = my.xtGet([items.pasteHeight, items.height]);
			this.pasteHeight = (my.isa(this.pasteHeight, 'num')) ? this.pasteHeight + h : my.addPercentages(this.pasteHeight, h);
		}
		if (my.xto([items.actualWidth, items.width])) {
			w = my.xtGet([items.actualWidth, items.width]);
			this.actualWidth = (my.isa(w, 'num')) ? this.actualWidth + w : this.actualWidth;
		}
		if (my.xto([items.actualHeight, items.height])) {
			h = my.xtGet([items.actualHeight, items.height]);
			this.actualHeight = (my.isa(h, 'num')) ? this.actualHeight + h : this.actualHeight;
		}
		if (my.xto([items.actualWidth, items.width, items.actualHeight, items.height])) {
			this.setDimensions(items);
		}
		if (my.xt(items.globalAlpha)) {
			this.globalAlpha += items.globalAlpha;
		}
		if (my.xto([items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height, items.scale])) {
			this.setCopy();
		}
		if (my.xto([items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale])) {
			this.setPaste();
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
Set the Cell's &lt;canvas&gt; element's context engine to the specification supplied by the entity about to be drawn on the canvas
@method setEngine
@param {Entity} entity Entity object
@return Entity object
@private
**/
	my.Cell.prototype.setEngine = function(entity) {
		if (!entity.fastStamp) {
			var myContext = my.ctx[this.context],
				entityContext = my.ctx[entity.context],
				engine,
				tempFillStyle,
				tempStrokeStyle,
				des,
				changes = entityContext.getChanges(myContext, entity.scale, entity.scaleOutline);
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
											des.update(entity.name, this.name);
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
											des.update(entity.name, this.name);
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
		return entity;
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
Prepare to draw entitys onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array
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
		engine.setTransform((cos * myA), (sin * myA), (-sin * myD), (cos * myD), this.pasteData.x, this.pasteData.y);
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
			this.offset.set(this.calculatePOV(this.work.handle, this.pasteData.w, this.pasteData.h, false)).reverse();
			this.offset.flag = true;
		}
		if (this.pivot) {
			this.setStampUsingPivot(my.pad[this.pad].base);
		}
		else {
			this.pathPrepareToCopyCell();
		}
		this.setCopy();
		this.setPaste();
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
Cell.setCopy update copyData object values
@method setCopy
@chainable
@private
**/
	my.Cell.prototype.setCopy = function() {
		this.copyData.x = (my.isa(this.copy.x, 'str')) ? this.convertX(this.copy.x, this.actualWidth) : this.copy.x;
		this.copyData.y = (my.isa(this.copy.y, 'str')) ? this.convertY(this.copy.y, this.actualHeight) : this.copy.y;
		if (!my.isBetween(this.copyData.x, 0, this.actualWidth - 1, true)) {
			this.copyData.x = (this.copyData.x < 0) ? 0 : this.actualWidth - 1;
		}
		if (!my.isBetween(this.copyData.y, 0, this.actualHeight - 1, true)) {
			this.copyData.y = (this.copyData.y < 0) ? 0 : this.actualHeight - 1;
		}
		this.copyData.w = (my.isa(this.copyWidth, 'str')) ? this.convertX(this.copyWidth, this.actualWidth) : this.copyWidth;
		this.copyData.h = (my.isa(this.copyHeight, 'str')) ? this.convertY(this.copyHeight, this.actualHeight) : this.copyHeight;
		if (!my.isBetween(this.copyData.w, 1, this.actualWidth, true)) {
			this.copyData.w = (this.copyData.w < 1) ? 1 : this.actualWidth;
		}
		if (!my.isBetween(this.copyData.h, 1, this.actualHeight, true)) {
			this.copyData.h = (this.copyData.h < 1) ? 1 : this.actualHeight;
		}
		if (this.copyData.x + this.copyData.w > this.actualWidth) {
			this.copyData.x = this.actualWidth - this.copyData.w;
		}
		if (this.copyData.y + this.copyData.h > this.actualHeight) {
			this.copyData.y = this.actualHeight - this.copyData.h;
		}
		return this;
	};
	/**
Cell.setPaste update pasteData object values
@method setPaste
@chainable
@private
**/
	my.Cell.prototype.setPaste = function() {
		var usePadDimensions = this.usePadDimensions,
			pad = my.pad[this.pad];

		this.pasteData.x = (usePadDimensions) ? 0 : this.start.x;
		this.pasteData.y = (usePadDimensions) ? 0 : this.start.y;
		this.pasteData.x = (my.isa(this.pasteData.x, 'str')) ? this.convertX(this.pasteData.x, pad.width) : this.pasteData.x;
		this.pasteData.y = (my.isa(this.pasteData.y, 'str')) ? this.convertY(this.pasteData.y, pad.height) : this.pasteData.y;
		this.pasteData.w = (usePadDimensions) ? pad.width : this.pasteWidth;
		this.pasteData.h = (usePadDimensions) ? pad.height : this.pasteHeight;
		this.pasteData.w = (my.isa(this.pasteData.w, 'str')) ? this.convertX(this.pasteData.w, this.actualWidth) : this.pasteData.w;
		this.pasteData.h = (my.isa(this.pasteData.h, 'str')) ? this.convertY(this.pasteData.h, this.actualHeight) : this.pasteData.h;
		this.pasteData.w = (this.pasteData.w * this.scale) * pad.scale;
		this.pasteData.h = (this.pasteData.h * this.scale) * pad.scale;
		if (this.pasteData.w < 1) {
			this.pasteData.w = 1;
		}
		if (this.pasteData.h < 1) {
			this.pasteData.h = 1;
		}
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
	my.Cell.prototype.copyCellToSelf = function(cell, usePadScale) {
		cell = (my.isa(cell, 'str')) ? my.cell[cell] : cell;
		usePadScale = my.xtGet([usePadScale, false]);
		var lockTo = cell.get('lockTo'),
			myCell = (lockTo) ? my.cell[lockTo] : cell;
		if (my.xt(myCell)) {
			var copy = myCell.copyData,
				paste = myCell.pasteData,
				offset = myCell.offset,
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
			context.drawImage(my.canvas[myCell.name], copy.x, copy.y, copy.w, copy.h, offset.x, offset.y, paste.w, paste.h);
		}
		return this;
	};
	/**
Cell stamp helper function - convert string percent values to numerical values
@method convertX
@param {String} x coordinate String
@param {String} w reference width
@return Number - x value
@private
**/
	my.Cell.prototype.convertX = function(x, w) {
		switch (x) {
			case 'left':
				return 0;
			case 'right':
				return w;
			case 'center':
				return w / 2;
			default:
				x = parseFloat(x) / 100;
				return (isNaN(x)) ? 0 : x * w;
		}
	};
	/**
Cell stamp helper function - convert string percent values to numerical values
@method convertY
@param {String} y coordinate String
@param {String} h reference height
@return Number - y value
@private
**/
	my.Cell.prototype.convertY = function(y, h) {
		switch (y) {
			case 'top':
				return 0;
			case 'bottom':
				return h;
			case 'center':
				return h / 2;
			default:
				y = parseFloat(y) / 100;
				return (isNaN(y)) ? 0 : y * h;
		}
	};
	/**
Entity stamp helper function
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
Entity stamp helper function
@method restoreShadow
@return This
@chainable
@private
**/
	my.Cell.prototype.restoreShadow = function(entitycontext) {
		var engine = my.context[this.name],
			context = my.ctx[this.context],
			s = my.ctx[entitycontext],
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
Entity stamp helper function
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
			myWidth = my.xtGet([items.width, items.actualWidth, this.actualWidth]);
			myWidth = (my.isa(myWidth, 'str')) ? (parseFloat(myWidth) / 100) * this.getPadWidth() : myWidth;
			myHeight = my.xtGet([items.height, items.actualHeight, this.actualHeight]);
			myHeight = (my.isa(myHeight, 'str')) ? (parseFloat(myHeight) / 100) * this.getPadHeight() : myHeight;
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
			myX = my.xtGet([dimensions.x, 0]),
			myY = my.xtGet([dimensions.y, 0]),
			myW = my.xtGet([dimensions.width, this.actualWidth]),
			myH = my.xtGet([dimensions.height, this.actualHeight]);
		my.imageData[myLabel] = my.context[this.name].getImageData(myX, myY, myW, myH);
		return myLabel;
	};

	/**
# Context

## Instantiation

* This object should never be instantiated by users

## Purpose

* wraps a given context for a Cell or Entity object
* responsible for comparing contexts and listing changes that need to be made for successful Entity stamping on a canvas
* all updates to a Context object's attributes should be performed via the Entity object's set() function

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
Color, gradient or pattern used to fill a entity. Can be:

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
Shape and Path entity fill method. Can be:

* 'nonzero' - all areas enclosed by the entity's path are flooded
* 'evenodd' - only 'odd' areas of the entity's path are flooded
@property winding
@type String
@default 'nonzero'
**/
		winding: 'nonzero',
		/**
Color, gradient or pattern used to outline a entity. Can be:

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
Entity transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
@property globalAlpha
@type Number
@default 1
**/
		globalAlpha: 1,
		/**
Compositing method for applying the entity to an existing Cell (&lt;canvas&gt;) display. Permitted values include

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
Line dash offset - distance along the entity's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
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
Horizontal offset of a entity's shadow, in pixels
@property shadowOffsetX
@type Number
@default 0
**/
		shadowOffsetX: 0,
		/**
Vertical offset of a entity's shadow, in pixels
@property shadowOffsetY
@type Number
@default 0
**/
		shadowOffsetY: 0,
		/**
Blur border for a entity's shadow, in pixels
@property shadowBlur
@type Number
@default 0
**/
		shadowBlur: 0,
		/**
Color, gradient or pattern used for entity shadow effect. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
@property shadowColor
@type String
@default 'rgba(0,0,0,0)'
**/
		shadowColor: 'rgba(0,0,0,0)',
		/**
Cascading Style Sheet font String, for Phrase entitys
@property font
@type String
@default '10pt sans-serif'
**/
		font: '10pt sans-serif',
		/**
Text alignment for multi-line Phrase entitys. Permitted values include:

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
Text baseline value for single-line Phrase entitys set to follow a Path entity path. Permitted values include:

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
		this.winding = my.xtGet([ctx.mozFillRule, ctx.msFillRule, 'nonzero']);
		this.lineDash = my.xtGet([ctx.lineDash, []]);
		this.lineDashOffset = my.xtGet([ctx.mozDashOffset, ctx.lineDashOffset, 0]);
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

* associates entity objects with a cell object, for stamping/compiling the &lt;canvas&gt; scene
* groups Entity objects for specific purposes
* (with collisions module) plays a key role in collision detection between Entitys

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
		this.entitys = (my.xt(items.entitys)) ? [].concat(items.entitys) : [];
		this.cell = items.cell || my.pad[my.currentPad].current;
		this.order = my.xtGet([items.order, 0]);
		this.visibility = my.xtGet([items.visibility, true]);
		this.entitySort = my.xtGet([items.entitySort, true]);
		this.regionRadius = my.xtGet([items.regionRadius, 0]);
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
 Array of SPRITENAME Strings of entitys that comprise this Group
@property entitys
@type Array
@default []
**/
		entitys: [],
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
Visibility flag - Group entitys will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		visibility: true,
		/**
Sorting flag - when set to true, Groups will sort their constituent entity object according to their entity.order attribute for each iteration of the display cycle
@property entitySort
@type Boolean
@default true
**/
		entitySort: true,
		/**
Collision checking radius, in pixels - as a first step in a collision check, the Group will winnow potential collisions according to how close the checked entity is to the current reference entity or mouse coordinate; when set to 0, this collision check step is skipped and all entitys move on to the next step
@property regionRadius
@type Number
@default 0
**/
		regionRadius: 0,
	};
	my.mergeInto(my.d.Group, my.d.Base);
	/**
Entity sorting routine - entitys are sorted according to their entity.order attribute value, in ascending order
@method sortEntitys
@return Nothing
@private
**/
	my.Group.prototype.sortEntitys = function() {
		if (this.entitySort) {
			this.entitys.sort(function(a, b) {
				return my.entity[a].order - my.entity[b].order;
			});
		}
	};
	/**
Tell the Group to ask _all_ of its constituent entitys to draw themselves on a &lt;canvas&gt; element, regardless of their visibility
@method forceStamp
@param {String} [method] Drawing method String
@param {String} [cell] CELLNAME of cell on which entitys are to draw themselves
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
Tell the Group to ask its constituent entitys to draw themselves on a &lt;canvas&gt; element; only entitys whose visibility attribute is set to true will comply
@method stamp
@param {String} [method] Drawing method String
@param {String} [cell] CELLNAME of cell on which entitys are to draw themselves
@return This
@chainable
**/
	my.Group.prototype.stamp = function(method, cell) {
		if (this.visibility) {
			this.sortEntitys();
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				my.entity[this.entitys[i]].stamp(method, cell);
			}
		}
		return this;
	};
	/**
Add entitys to the Group
@method addEntitysToGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	my.Group.prototype.addEntitysToGroup = function(item) {
		item = (my.xt(item)) ? [].concat(item) : [];
		for (var i = 0, iz = item.length; i < iz; i++) {
			my.pushUnique(this.entitys, item[i]);
		}
		return this;
	};
	/**
Remove entitys from the Group
@method removeEntitysFromGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	my.Group.prototype.removeEntitysFromGroup = function(item) {
		item = (my.xt(item)) ? [].concat(item) : [];
		for (var i = 0, iz = item.length; i < iz; i++) {
			my.removeItem(this.entitys, item[i]);
		}
		return this;
	};
	/**
Ask all entitys in the Group to perform a setDelta() operation

The following entity attributes can be amended by this function: startX, startY, scale, roll.
@method updateEntitysBy
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	my.Group.prototype.updateEntitysBy = function(items) {
		items = my.safeObject(items);
		for (var i = 0, iz = this.entitys.length; i < iz; i++) {
			my.entity[this.entitys[i]].setDelta({
				startX: my.xtGet([items.x, items.startX, 0]),
				startY: my.xtGet([items.y, items.startY, 0]),
				scale: my.xtGet([items.scale, 0]),
				roll: my.xtGet([items.roll, 0]),
			});
		}
		return this;
	};
	/**
Ask all entitys in the Group to perform a set() operation
@method setEntitysTo
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
	my.Group.prototype.setEntitysTo = function(items) {
		for (var i = 0, iz = this.entitys.length; i < iz; i++) {
			my.entity[this.entitys[i]].set(items);
		}
		return this;
	};
	/**
Require all entitys in the Group to set their pivot attribute to the supplied POINTNAME or SPRITENAME string, and set their handle Vector to reflect the current vector between that entity or Point object's start Vector and their own Vector

This has the effect of turning a set of disparate entitys into a single, coordinated group.
@method pivotEntitysTo
@param {String} item SPRITENAME or POINTNAME String
@return This
@chainable
**/
	my.Group.prototype.pivotEntitysTo = function(item) {
		item = (my.isa(item, 'str')) ? item : false;
		var p,
			pStart,
			entity,
			sv;
		if (item) {
			p = my.entity[item] || my.point[item] || false;
			if (p) {
				pStart = (p.type === 'Point') ? p.get('current') : p.start;
				for (var i = 0, iz = this.entitys.length; i < iz; i++) {
					entity = my.entity[this.entitys[i]];
					sv = my.v.set(entity.start);
					sv.vectorSubtract(pStart);
					entity.set({
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
Check all entitys in the Group to see if they are colliding with the supplied coordinate. The check is done in reverse order after the entitys have been sorted; the entity Object with the highest order value that is colliding with the coordinate is returned
@method getEntityAt
@param {Vector} items Coordinate vector; alternatively an Object with x and y attributes can be used
@return Entity object, or false if no entitys are colliding with the coordinate
**/
	my.Group.prototype.getEntityAt = function(items) {
		items = my.safeObject(items);
		var coordinate = my.v.set({
				x: (items.x || 0),
				y: (items.y || 0)
			}),
			entity,
			cell,
			result;
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell);
		this.sortEntitys();
		for (var i = this.entitys.length - 1; i >= 0; i--) {
			entity = my.entity[this.entitys[i]];
			if (this.regionRadius) {
				entity.resetWork();
				result = entity.work.start.vectorSubtract(coordinate);
				if (result.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (entity.checkHit({
				x: coordinate.x,
				y: coordinate.y
			})) {
				return entity;
			}
		}
		return false;
	};
	/**
Check all entitys in the Group to see if they are colliding with the supplied coordinate. The check is done in reverse order after the entitys have been sorted; all entitys (in the group) colliding with the coordinate are returned as an array of entity objects
@method getEntityAt
@param {Vector} items Coordinate vector; alternatively an Object with x and y attributes can be used
@return Entity object, or false if no entitys are colliding with the coordinate
**/
	my.Group.prototype.getAllEntitysAt = function(items) {
		items = my.safeObject(items);
		var coordinate = my.v.set({
				x: (items.x || 0),
				y: (items.y || 0)
			}),
			entity,
			cell,
			result,
			resArray = [];
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell);
		this.sortEntitys();
		for (var i = this.entitys.length - 1; i >= 0; i--) {
			entity = my.entity[this.entitys[i]];
			if (this.regionRadius) {
				entity.resetWork();
				result = entity.work.start.vectorSubtract(coordinate);
				if (result.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (entity.checkHit(coordinate)) {
				resArray.push(entity);
			}
		}
		return (resArray.length > 0) ? resArray : false;
	};

	/**
# Entity

## Instantiation

* This object should never be instantiated by users

## Purpose

* Supplies the common methodology for all Scrawl entitys: Phrase, Block, Wheel, Picture, Path, Shape
* Sets up the attributes for holding a entity's current state: position, visibility, rotation, drawing order, context
* Describes how entitys should be stamped onto a Cell's canvas
* Provides drag-and-drop functionality

__Scrawl core does not include any entity type constructors.__ Each entity type used on a web page canvas needs to be added to the core by loading its associated module:

* __Block__ entitys are defined in the _scrawlBlock_ module (alias: block)
* __Wheel__ entitys are defined in the _scrawlWheel_ module (alias: wheel)
* __Phrase__ entitys are defined in the _scrawlPhrase_ module (alias: phrase)
* __Picture__ entitys are defined as part of the _scrawlImages_ module (alias: images)
* __Path__ entitys are defined in the _scrawlPath_ module (alias: path)
* __Shape__ entitys are defined in the _scrawlShape_ module (alias: shape)
* additional factory functions for defining common Path and Shape objects (lines, curves, ovals, triangles, stars, etc) are supplied by the _scrawlPathFactories_ module (alias: factories)

@class Entity
@constructor
@extends Position
@uses Context
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Entity = function(items) {
		items = my.safeObject(items);
		my.Position.call(this, items);
		items.name = this.name;
		var myContext = my.newContext(items);
		this.context = myContext.name;
		this.group = this.getGroup(items);
		this.fastStamp = my.xtGet([items.fastStamp, false]);
		this.scaleOutline = my.xtGet([items.scaleOutline, true]);
		this.order = my.xtGet([items.order, 0]);
		this.visibility = my.xtGet([items.visibility, true]);
		this.method = my.xtGet([items.method, my.d[this.type].method]);
		this.collisionsEntityConstructor(items);
		return this;
	};
	my.Entity.prototype = Object.create(my.Position.prototype);
	/**
@property type
@type String
@default 'Entity'
@final
**/
	my.Entity.prototype.type = 'Entity';
	my.Entity.prototype.classname = 'entitynames';
	my.d.Entity = {
		/**
Entity order value - lower order entitys are drawn on &lt;canvas&gt; elements before higher order entitys
@property order
@type Number
@default 0
**/
		order: 0,
		/**
Visibility flag - entitys will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		visibility: true,
		/**
Entity drawing method. A entity can be drawn onto a &lt;canvas&gt; element in a variety of ways; these methods include:

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

_Note: not all entitys support all of these operations_
@property method
@type String
@default 'fill'
**/
		method: 'fill',
		/**
Current SVGTiny data string for the entity (only supported by Path and Shape entitys)
@property data
@type String
@default ''
**/
		data: '',
		/**
Entity radius, in pixels - not supported by all entity objects
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
Display cycle flag; if set to true, entity will not change the &lt;canvas&gt; element's context engine's settings before drawing itself on the cell
@property fastStamp
@type Boolean
@default false
**/
		fastStamp: false,
		/**
CTXNAME of this Entity's Context object
@property context
@type String
@default ''
@private
**/
		context: '',
		/**
GROUPNAME String for this entity's default group

_Note: a entity can belong to more than one group by being added to other Group objects via the __scrawl.addEntitysToGroups()__ and __Group.addEntityToGroup()__ functions_
@property group
@type String
@default ''
**/
		group: '',
	};
	my.mergeInto(my.d.Entity, my.d.Position);
	/**
Entity constructor hook function - modified by collisions module
@method collisionsEntityConstructor
@private
**/
	my.Entity.prototype.collisionsEntityConstructor = function(items) {};
	/**
Constructor helper function - register entity object in the scrawl library
@method registerInLibrary
@return This
@chainable
@private
**/
	my.Entity.prototype.registerInLibrary = function() {
		my.entity[this.name] = this;
		my.pushUnique(my.entitynames, this.name);
		my.group[this.group].addEntitysToGroup(this.name);
		this.collisionsEntityRegisterInLibrary();
		return this;
	};
	/**
Entity.registerInLibrary hook function - modified by collisions module
@method collisionsEntityRegisterInLibrary
@private
**/
	my.Entity.prototype.collisionsEntityRegisterInLibrary = function() {};
	/**
Augments Position.get()

Allows users to retrieve a entity's Context object's values via the entity
@method get
@param {String} item attribute key string
@return Attribute value
**/
	my.Entity.prototype.get = function(item) {
		//retrieve title, comment, timestamp - which might otherwise be returned with the context object's values
		if (my.xt(my.d.Base[item])) {
			return my.Base.prototype.get.call(this, item);
		}
		//context attributes
		if (my.xt(my.d.Context[item])) {
			return my.ctx[this.context].get(item);
		}
		//entity attributes
		return my.Position.prototype.get.call(this, item);
	};
	/**
Augments Position.set()

Allows users to:
* set a entity's Context object's values via the entity
* shift a entity between groups
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Entity.prototype.set = function(items) {
		my.Position.prototype.set.call(this, items);
		my.ctx[this.context].set(items);
		items = my.safeObject(items);
		if (my.xt(items.group)) {
			my.group[this.group].removeEntitysFromGroup(this.name);
			this.group = this.getGroup(items.group);
			my.group[this.group].addEntitysToGroup(this.name);
		}
		this.collisionsEntitySet(items);
		if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.radius, items.scale])) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Entity.set hook function - modified by collisions module
@method collisionsEntitySet
@private
**/
	my.Entity.prototype.collisionsEntitySet = function(items) {};
	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function

Allows users to amend a entity's Context object's values via the entity, in addition to its own attribute values
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Entity.prototype.setDelta = function(items) {
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		var ctx = my.ctx[this.context];
		if (my.xto([items.lineDashOffset, items.lineWidth, items.globalAlpha])) {
			ctx.setDelta(items);
		}
		if (my.xt(items.roll)) {
			this.roll += items.roll || 0;
		}
		if (my.xt(items.width)) {
			this.width = (my.isa(this.width, 'num')) ? this.width + items.width : my.addPercentages(this.width, items.width);
		}
		if (my.xt(items.height)) {
			this.height = (my.isa(this.height, 'num')) ? this.height + items.height : my.addPercentages(this.height, items.height);
		}
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
	my.Entity.prototype.clone = function(items) {
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
Constructor helper function - discover this entity's default group affiliation
@method getGroup
@param {Object} [items] Constructor argument
@return GROUPNAME String
@private
**/
	my.Entity.prototype.getGroup = function(items) {
		items = my.safeObject(items);
		if (my.xt(items.group) && my.contains(my.groupnames, items.group)) {
			return items.group;
		}
		else {
			return my.pad[my.currentPad].current;
		}
	};
	/**
Helper function - get a entity's cell onbject
@method getEntityCell
@return Cell object
@private
**/
	my.Entity.prototype.getEntityCell = function(items) {
		var group = this.getGroup(items);
		return my.cell[group];
	};
	/**
Stamp function - instruct entity to draw itself on a Cell's &lt;canvas&gt; element, regardless of the setting of its visibility attribute

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
@method forceStamp
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
**/
	my.Entity.prototype.forceStamp = function(method, cell) {
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
	my.Entity.prototype.prepareStamp = function() {
		if (!this.offset.flag) {
			this.offset.set(this.getOffsetStartVector());
			this.offset.flag = true;
		}
		return this.offset;
	};
	/**
Stamp function - instruct entity to draw itself on a Cell's &lt;canvas&gt; element, if its visibility attribute is true

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
@method stamp
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@param {String} [cell] CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
**/
	my.Entity.prototype.stamp = function(method, cell) {
		if (this.visibility) {
			var myCell = my.cell[cell] || my.cell[my.group[this.group].cell],
				engine = my.context[myCell.name],
				myMethod = method || this.method;
			if (this.pivot) {
				this.setStampUsingPivot(myCell.name);
			}
			else {
				this.pathStamp();
			}
			this.callMethod(engine, myCell.name, myMethod);
			if (this.filter) {
				this.stampFilter(engine, myCell.name);
			}
		}
		return this;
	};
	/**
Entity.stamp hook function - modified by path module
@method pathStamp
@private
**/
	my.Entity.prototype.pathStamp = function() {};
	/**
Entity.stamp hook function - modified by filters module
@method stampFilter
@private
**/
	my.Entity.prototype.stampFilter = function() {};
	/**
Stamp helper function - direct entity to the required drawing method function
@method callMethod
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@param {Object} engine JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} [method] Permitted method attribute String; by default, will use entity's own method setting
@return This
@chainable
@private
**/
	my.Entity.prototype.callMethod = function(engine, cell, method) {
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
Stamp helper function - rotate and position canvas ready for drawing entity
@method rotateCell
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell Cell name
@return This
@chainable
@private
**/
	my.Entity.prototype.rotateCell = function(ctx, cell) {
		var myA = (this.flipReverse) ? -1 : 1,
			myD = (this.flipUpend) ? -1 : 1,
			deltaRotation = (this.addPathRoll) ? (this.roll + this.pathRoll) * my.radian : this.roll * my.radian,
			cos = Math.cos(deltaRotation),
			sin = Math.sin(deltaRotation),
			x = this.start.x,
			y = this.start.y;
		if (typeof x === 'string') {
			x = this.convertX(x, cell);
		}
		if (typeof y === 'string') {
			y = this.convertY(y, cell);
		}
		ctx.setTransform((cos * myA), (sin * myA), (-sin * myD), (cos * myD), x, y);
		return this;
	};
	/**
Stamp helper function - convert string start.x values to numerical values
@method convertX
@param {String} x coordinate String
@param {String} cell reference cell name String
@return Number - x value
@private
**/
	my.Entity.prototype.convertX = function(x, cell) {
		var w = (my.isa(cell, 'str')) ? scrawl.cell[cell].actualWidth : cell;
		switch (x) {
			case 'left':
				return 0;
			case 'right':
				return w;
			case 'center':
				return w / 2;
			default:
				x = parseFloat(x) / 100;
				return (isNaN(x)) ? 0 : x * w;
		}
	};
	/**
Stamp helper function - convert string start.y values to numerical values
@method convertY
@param {String} y coordinate String
@param {String} cell reference cell name String
@return Number - y value
@private
**/
	my.Entity.prototype.convertY = function(y, cell) {
		var h = (my.isa(cell, 'str')) ? scrawl.cell[cell].actualHeight : cell;
		switch (y) {
			case 'top':
				return 0;
			case 'bottom':
				return h;
			case 'center':
				return h / 2;
			default:
				y = parseFloat(y) / 100;
				return (isNaN(y)) ? 0 : y * h;
		}
	};
	/**
Stamp helper function - perform a 'clear' method draw

_Note: not supported by this entity_
@method clear
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.clear = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'clearWithBackground' method draw

_Note: not supported by this entity_
@method clearWithBackground
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.clearWithBackground = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'draw' method draw

_Note: not supported by this entity_
@method draw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.draw = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'fill' method draw

_Note: not supported by this entity_
@method fill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.fill = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'drawFill' method draw

_Note: not supported by this entity_
@method drawFill
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.drawFill = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'fillDraw' method draw

_Note: not supported by this entity_
@method fillDraw
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.fillDraw = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'sinkInto' method draw

_Note: not supported by this entity_
@method sinkInto
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.sinkInto = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'floatOver' method draw

_Note: not supported by this entity_
@method floatOver
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.floatOver = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'clip' method draw

_Note: not supported by this entity_
@method clip
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.clip = function(ctx, cell) {
		return this;
	};
	/**
Stamp helper function - perform a 'none' method draw. This involves setting the &lt;canvas&gt; element's context engine's values with this entity's context values, but not defining or drawing the entity on the canvas.
@method none
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.none = function(ctx, cell) {
		my.cell[cell].setEngine(this);
		return this;
	};
	/**
Stamp helper function - clear shadow parameters during a multi draw operation (drawFill and fillDraw methods)
@method clearShadow
@param {Object} ctx JavaScript context engine for Cell's &lt;canvas&gt; element
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.clearShadow = function(ctx, cell) {
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
@param {String} cell CELLNAME string of Cell to be drawn on; by default, will use the Cell associated with this entity's Group object
@return This
@chainable
@private
**/
	my.Entity.prototype.restoreShadow = function(ctx, cell) {
		var c = my.ctx[this.context];
		if (c.shadowOffsetX || c.shadowOffsetY || c.shadowBlur) {
			my.cell[cell].restoreShadow(this.context);
		}
		return this;
	};
	/**
Set entity's pivot to 'mouse'; set handles to supplied Vector value; set order to +9999
@method pickupEntity
@param {Vector} items Coordinate vector; alternatively an object with {x, y} attributes can be used
@return This
@chainable
**/
	my.Entity.prototype.pickupEntity = function(items) {
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
Revert pickupEntity() actions, ensuring entity is left where the user drops it
@method dropEntity
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
	my.Entity.prototype.dropEntity = function(item) {
		var order = this.order;
		this.set({
			pivot: my.xtGet([item, this.realPivot, false]),
			order: (order >= 9999) ? order - 9999 : 0,
		});
		delete this.realPivot;
		delete this.oldX;
		delete this.oldY;
		return this;
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
	my.Entity.prototype.checkHit = function(items) {
		items = my.safeObject(items);
		var ctx = my.cvx,
			tests = (my.xt(items.tests)) ? [].concat(items.tests) : [(items.x || false), (items.y || false)],
			here,
			result;
		this.rotateCell(ctx, this.getEntityCell().name);
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

* Defines gradients and radial gradients used with entity objects' strokeStyle and fillStyle attributes

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
Drawing flag - when set to true, will use entity-based 'range' coordinates to calculate the start and end points of the gradient; when false, will use Cell-based coordinates
@property setToEntity
@type Boolean
@default false
**/
		setToEntity: false,
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
		//NEEDS TO BE REWRITTEN - to take into account percentage deltas for startXY, endXY
		//also don't like generating an object for setDelta - don't do it elsewhere
		var temp;
		items = my.safeObject(items);
		if (items.startX) {
			temp = this.get('startX');
			this.startX = (my.isa(items.startX, 'str')) ? my.addPercentages(temp, items.startX) : temp + items.startX;
		}
		if (items.startY) {
			temp = this.get('startY');
			this.startY = (my.isa(items.startY, 'str')) ? my.addPercentages(temp, items.startY) : temp + items.startY;
		}
		if (items.startRadius) {
			temp = this.get('startRadius');
			this.startRadius = temp + items.startRadius;
		}
		if (items.endX) {
			temp = this.get('endX');
			this.endX = (my.isa(items.endX, 'str')) ? my.addPercentages(temp, items.endX) : temp + items.endX;
		}
		if (items.endY) {
			temp = this.get('endY');
			this.endY = (my.isa(items.endY, 'str')) ? my.addPercentages(temp, items.endY) : temp + items.endY;
		}
		if (items.endRadius) {
			temp = this.get('endRadius');
			this.endRadius = temp + items.endRadius;
		}
		if (items.shift && my.xt(my.d.Design.shift)) {
			temp = this.get('shift');
			this.shift = temp + items.shift;
		}
		return this;
	};
	/**
Creates the gradient

_This function is replaced by the animation module_
@method update
@param {String} [entity] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
**/
	my.Design.prototype.update = function(entity, cell) {
		this.makeGradient(entity, cell);
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
@param {String} [entity] SPRITENAME String
@param {String} [cell] CELLNAME String
@return This
@chainable
@private
**/
	my.Design.prototype.makeGradient = function(entity, cell) {
		entity = my.entity[entity] || false;
		if (my.xt(cell)) {
			cell = (my.contains(my.cellnames, cell)) ? my.cell[cell] : my.cell[this.get('cell')];
		}
		else if (entity) {
			cell = my.cell[entity.group];
		}
		else {
			cell = my.cell[this.get('cell')];
		}
		var ctx = my.context[cell.name],
			g,
			north,
			south,
			east,
			west,
			x,
			y,
			sx,
			sy,
			sr,
			ex,
			ey,
			er,
			fsx,
			fsy,
			fex,
			fey,
			temp,
			w,
			h,
			r;
		//in all cases, the canvas origin will have been translated to the current entity's start
		if (this.get('setToEntity')) {
			temp = entity.getOffsetStartVector();
			switch (entity.type) {
				case 'Wheel':
					x = -temp.x + (entity.radius * entity.scale);
					y = -temp.y + (entity.radius * entity.scale);
					break;
				case 'Shape':
				case 'Path':
					if (entity.isLine) {
						x = -temp.x;
						y = -temp.y;
					}
					else {
						x = -temp.x + ((entity.width / 2) * entity.scale);
						y = -temp.y + ((entity.height / 2) * entity.scale);
					}
					break;
				default:
					x = -temp.x;
					y = -temp.y;
			}
			w = (my.xt(entity.localWidth)) ? entity.localWidth : entity.width * entity.scale;
			h = (my.xt(entity.localHeight)) ? entity.localHeight : entity.height * entity.scale;
			sx = (my.xt(this.startX)) ? this.startX : 0;
			if (typeof sx === 'string') {
				sx = (parseFloat(sx) / 100) * w;
			}
			sy = (my.xt(this.startY)) ? this.startY : 0;
			if (typeof sy === 'string') {
				sy = (parseFloat(sy) / 100) * h;
			}
			ex = (my.xt(this.endX)) ? this.endX : w;
			if (typeof ex === 'string') {
				ex = (parseFloat(ex) / 100) * w;
			}
			ey = (my.xt(this.endY)) ? this.endY : h;
			if (typeof ey === 'string') {
				ey = (parseFloat(ey) / 100) * h;
			}
			if (this.type === 'Gradient') {
				g = ctx.createLinearGradient(sx - x, sy - y, ex - x, ey - y);
			}
			else {
				sr = (my.xt(this.startRadius)) ? this.startRadius : 0;
				if (typeof sr === 'string') {
					sr = (parseFloat(sr) / 100) * w;
				}
				er = (my.xt(this.endRadius)) ? this.endRadius : w;
				if (typeof er === 'string') {
					er = (parseFloat(er) / 100) * w;
				}
				g = ctx.createRadialGradient(sx - x, sy - y, sr, ex - x, ey - y, er);
			}
		}
		else {
			x = entity.start.x;
			if (typeof x === 'string') {
				x = entity.convertX(x, cell.name);
			}
			y = entity.start.y;
			if (typeof y === 'string') {
				y = entity.convertY(y, cell.name);
			}
			sx = (my.xt(this.startX)) ? this.startX : 0;
			if (typeof sx === 'string') {
				sx = entity.convertX(sx, cell.name);
			}
			sy = (my.xt(this.startY)) ? this.startY : 0;
			if (typeof sy === 'string') {
				sy = entity.convertY(sy, cell.name);
			}
			ex = (my.xt(this.endX)) ? this.endX : cell.actualWidth;
			if (typeof ex === 'string') {
				ex = entity.convertX(ex, cell.name);
			}
			ey = (my.xt(this.endY)) ? this.endY : cell.actualWidth;
			if (typeof ey === 'string') {
				ey = entity.convertY(ey, cell.name);
			}
			x = (entity.flipReverse) ? cell.actualWidth - x : x;
			y = (entity.flipUpend) ? cell.actualHeight - y : y;
			sx = (entity.flipReverse) ? cell.actualWidth - sx : sx;
			sy = (entity.flipUpend) ? cell.actualHeight - sy : sy;
			ex = (entity.flipReverse) ? cell.actualWidth - ex : ex;
			ey = (entity.flipUpend) ? cell.actualHeight - ey : ey;
			fsx = sx - x;
			fsy = sy - y;
			fex = ex - x;
			fey = ey - y;
			r = entity.roll;
			if ((entity.flipReverse && entity.flipUpend) || (!entity.flipReverse && !entity.flipUpend)) {
				r = -entity.roll;
			}
			if (entity.roll) {
				my.v.set({
					x: fsx,
					y: fsy,
					z: 0
				}).rotate(r);
				fsx = my.v.x;
				fsy = my.v.y;
				my.v.set({
					x: fex,
					y: fey,
					z: 0
				}).rotate(r);
				fex = my.v.x;
				fey = my.v.y;
			}
			if (this.type === 'Gradient') {
				g = ctx.createLinearGradient(fsx, fsy, fex, fey);
			}
			else {
				sr = (my.xt(this.startRadius)) ? this.startRadius : 0;
				if (typeof sr === 'string') {
					sr = (parseFloat(sr) / 100) * cell.actualWidth;
				}
				er = (my.xt(this.endRadius)) ? this.endRadius : cell.actualWidth;
				if (typeof er === 'string') {
					er = (parseFloat(er) / 100) * cell.actualWidth;
				}
				g = ctx.createRadialGradient(fsx, fsy, sr, fex, fey, er);
			}
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
* Used with entity.strokeStyle and entity.fillStyle attributes

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
* Used with entity.strokeStyle and entity.fillStyle attributes

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
Start circle radius, in pixels or percentage of entity/cell width
@property startRadius
@type Number (by default), or String percentage value
@default 0
**/
		startRadius: 0,
		/**
End circle radius, in pixels or percentage of entity/cell width
@property endRadius
@type Number (by default), or String percentage value
@default 0 (though in practice, an undefined end radius will default to the entity's width, or the cell's width)
**/
		endRadius: 0,
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

	return my;
}());
