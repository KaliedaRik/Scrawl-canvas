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

## Version 4.0.0 - 31 December 2014

Developed by Rik Roots - <rik.roots@gmail.com>, <rik@rikweb.org.uk>

Scrawl demo website: <http://scrawl.rikweb.org.uk>

### Be aware that the current develop branch includes changes beyond v4.0.0 that break that version

The next version, being coded up on the develop branch, will be v4.0.1, for bugfixes only

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

var scrawlVars = window.scrawlVars || {};

var scrawl = window.scrawl || (function(S) {
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
	my.version = '4.0.0';
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
Default empty object - passed to various functions, to prevent them generating superfluous objects
@property o
@type {Object}
@private
**/
	my.o = {};
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
		imageload: 'scrawlImageLoad'
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
		quaternion: []
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
			mini = my.xtGet(items.minified, true),
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
			pet: 'cat'
			};
	scrawl.mergeInto(old, new);
	//result is {
	//	name: 'Peter',
	//	age: 42,
	//	job: 'lawyer'
	//	pet: 'cat'
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
			pet: 'cat'
			};
	scrawl.mergeOver(old, new);
	//result is {
	//	name: 'Peter',
	//	age: 32,
	//	job: 'coder'
	//	pet: 'cat'
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
		return (item.indexOf(k) >= 0) ? true : false;
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
		if (item.indexOf(o) < 0) {
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
	S.removeItem_index = 0;
	my.removeItem = function(item, o) {
		S.removeItem_index = item.indexOf(o);
		if (S.removeItem_index >= 0) {
			item.splice(S.removeItem_index, 1);
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
	S.isBetween_value = 0;
	my.isBetween = function(no, a, b, e) {
		if (a > b) {
			S.isBetween_value = a;
			a = b;
			b = S.isBetween_value;
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
	S.addWithinBounds_min = 0;
	S.addWithinBounds_max = 0;
	S.addWithinBounds_count = 0;
	S.addWithinBounds_action = '';
	S.addWithinBounds_operation = '';
	S.addWithinBounds_result = 0;
	S.addWithinBounds_check = false;
	my.addWithinBounds = function(a, b, items) {
		items = my.safeObject(items);
		a = my.xtGet(a, 0);
		b = my.xtGet(b, 0);
		S.addWithinBounds_min = my.xtGet(items.min, 0);
		S.addWithinBounds_max = my.xtGet(items.max, 1);
		S.addWithinBounds_action = my.xtGet(items.action, 'stick');
		S.addWithinBounds_operation = my.xtGet(items.operation, 'add');
		S.addWithinBounds_count = 20;
		S.addWithinBounds_result = 0;
		S.addWithinBounds_check = false;

		if (b === 0 && (S.addWithinBounds_operation === 'divide' || S.addWithinBounds_operation === '/')) {
			return false;
		}

		switch (S.addWithinBounds_operation) {
			case 'subtract':
			case '-':
				S.addWithinBounds_result = a - b;
				break;
			case 'multiply':
			case '*':
				S.addWithinBounds_result = a * b;
				break;
			case 'divide':
			case '/':
				S.addWithinBounds_result = a / b;
				break;
			default:
				S.addWithinBounds_result = a + b;
		}

		while (!my.isBetween(S.addWithinBounds_result, S.addWithinBounds_min, S.addWithinBounds_max, true) && S.addWithinBounds_count > 0) {
			S.addWithinBounds_check = (S.addWithinBounds_result < (S.addWithinBounds_min + S.addWithinBounds_max) / 2) ? true : false;
			switch (S.addWithinBounds_action) {
				case 'bounce':
					S.addWithinBounds_result = (S.addWithinBounds_check) ? S.addWithinBounds_min + (-S.addWithinBounds_result + S.addWithinBounds_min) : S.addWithinBounds_max + (-S.addWithinBounds_result + S.addWithinBounds_max);
					break;
				case 'loop':
					S.addWithinBounds_result = (S.addWithinBounds_check) ? (S.addWithinBounds_max - S.addWithinBounds_min) + S.addWithinBounds_result : (S.addWithinBounds_min - S.addWithinBounds_max) + S.addWithinBounds_result;
					break;
				default:
					S.addWithinBounds_result = (S.addWithinBounds_check) ? S.addWithinBounds_min : S.addWithinBounds_max;
			}
			S.addWithinBounds_count--;
		}

		return (S.addWithinBounds_count > 0) ? S.addWithinBounds_result : false;
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
	S.isa_slice = [];
	my.isa = function() {
		// var args = Array.prototype.slice.call(arguments);
		S.isa_slice = Array.prototype.slice.call(arguments);
		if (S.isa_slice.length == 2 && my.xt(S.isa_slice[0])) {
			//because we mostly test for str or fn
			if (S.isa_slice[1] == 'str') {
				return (S.isa_slice[0].substring) ? true : false;
			}
			if (S.isa_slice[1] == 'fn') {
				return (typeof S.isa_slice[0] === 'function') ? true : false;
			}
			//divide and conquer the rest
			S.isa_slice.push(S.isa_slice[1][0]);
			if (S.isa_slice[2] < 'm') {
				if (S.isa_slice[2] < 'd') {
					switch (S.isa_slice[1]) {
						case 'arr':
							return (Array.isArray(S.isa_slice[0])) ? true : false;
						case 'bool':
							return (typeof S.isa_slice[0] === 'boolean') ? true : false;
						case 'canvas':
							return (Object.prototype.toString.call(S.isa_slice[0]) === '[object HTMLCanvasElement]') ? true : false;
						default:
							return false;
					}
				}
				else {
					switch (S.isa_slice[1]) {
						case 'date':
							return (Object.prototype.toString.call(S.isa_slice[0]) === '[object Date]') ? true : false;
						case 'img':
							return (Object.prototype.toString.call(S.isa_slice[0]) === '[object HTMLImageElement]') ? true : false;
						default:
							return false;
					}
				}
			}
			else {
				if (S.isa_slice[2] < 's') {
					switch (S.isa_slice[1]) {
						case 'num':
							return (S.isa_slice[0].toFixed) ? true : false;
						case 'obj':
							return (Object.prototype.toString.call(S.isa_slice[0]) === '[object Object]') ? true : false;
						case 'quaternion':
							return (S.isa_slice[0].type && S.isa_slice[0].type === 'Quaternion') ? true : false;
						default:
							return false;
					}
				}
				else {
					switch (S.isa_slice[1]) {
						case 'vector':
							return (S.isa_slice[0].type && S.isa_slice[0].type === 'Vector') ? true : false;
						case 'video':
							return (Object.prototype.toString.call(S.isa_slice[0]) === '[object HTMLVideoElement]') ? true : false;
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
		return (Object.prototype.toString.call(items) === '[object Object]') ? items : my.o;
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
		return (typeof item == 'undefined') ? false : true;
	};
	/**
A __utility__ function that checks an argument list of values and returns the first value that exists
@method xtGet
@return first defined variable; null if all values are undefined
**/
	S.xtGet_slice = [];
	S.xtGet_i = 0;
	S.xtGet_iz = 0;
	my.xtGet = function() {
		S.xtGet_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.xtGet_slice[0])) {
			console.log('xtGet - needs updating: ', S.xtGet_slice);
			S.xtGet_slice = S.xtGet_slice[0];
		}
		if (S.xtGet_slice.length > 0) {
			for (S.xtGet_i = 0, S.xtGet_iz = S.xtGet_slice.length; S.xtGet_i < S.xtGet_iz; S.xtGet_i++) {
				if (typeof S.xtGet_slice[S.xtGet_i] !== 'undefined') {
					return S.xtGet_slice[S.xtGet_i];
				}
			}
		}
		return null;
	};
	/**
A __utility__ function that checks an argument list values and returns the first value that evaluates to true

False: 0, -0, '', undefined, null, false, NaN

@method xtGetTrue
@return first true variable; null if all values are false
**/
	S.xtGetTrue_slice = [];
	S.xtGetTrue_i = 0;
	S.xtGetTrue_iz = 0;
	my.xtGetTrue = function() {
		S.xtGetTrue_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.xtGetTrue_slice[0])) {
			console.log('xtGetTrue - needs updating: ', S.xtGetTrue_slice);
			S.xtGetTrue_slice = S.xtGetTrue_slice[0];
		}
		if (S.xtGetTrue_slice.length > 0) {
			for (S.xtGetTrue_i = 0, S.xtGetTrue_iz = S.xtGetTrue_slice.length; S.xtGetTrue_i < S.xtGetTrue_iz; S.xtGetTrue_i++) {
				if (S.xtGetTrue_slice[S.xtGetTrue_i]) {
					return S.xtGetTrue_slice[S.xtGetTrue_i];
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
	S.xta_slice = [];
	S.xta_i = 0;
	S.xta_iz = 0;
	my.xta = function() {
		S.xta_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.xta_slice[0])) {
			console.log('xta - needs updating: ', S.xta_slice);
			S.xta_slice = S.xta_slice[0];
		}
		if (S.xta_slice.length > 0) {
			for (S.xta_i = 0, S.xta_iz = S.xta_slice.length; S.xta_i < S.xta_iz; S.xta_i++) {
				if (typeof S.xta_slice[S.xta_i] === 'undefined') {
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
@return True if any item is not 'undefined'
@example
	var mystring = 'string',
		mynumber = 0,
		myboolean;
	scrawl.xto(mystring, mynumber);	//returns true
	scrawl.xto(mystring, myboolean);	//returns true
**/
	S.xto_slice = [];
	S.xto_i = 0;
	S.xto_iz = 0;
	my.xto = function() {
		S.xto_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.xto_slice[0])) {
			console.log('xto - needs updating: ', S.xto_slice);
			S.xto_slice = S.xto_slice[0];
		}
		if (S.xto_slice.length > 0) {
			for (S.xto_i = 0, S.xto_iz = S.xto_slice.length; S.xto_i < S.xto_iz; S.xto_i++) {
				if (typeof S.xto_slice[S.xto_i] !== 'undefined') {
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
	S.makeName_name = '';
	S.makeName_nameArray = [];
	my.makeName = function(item) {
		item = my.safeObject(item);
		if (my.contains(my.nameslist, item.target)) {
			S.makeName_name = my.xtGetTrue(item.name, item.type, 'default');
			S.makeName_nameArray = S.makeName_name.split('~~~');
			return (my.contains(my[item.target], S.makeName_nameArray[0])) ? S.makeName_nameArray[0] + '~~~' + Math.floor(Math.random() * 100000000) : S.makeName_nameArray[0];
		}
		console.log('scrawl.makeName() error: insufficient or incorrect argument attributes', item);
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
	S.setDisplayOffsets_i = 0;
	S.setDisplayOffsets_iz = 0;
	my.setDisplayOffsets = function() {
		for (S.setDisplayOffsets_i = 0, S.setDisplayOffsets_iz = my.padnames.length; S.setDisplayOffsets_i < S.setDisplayOffsets_iz; S.setDisplayOffsets_i++) {
			my.pad[my.padnames[S.setDisplayOffsets_i]].setDisplayOffsets();
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
	S.getCanvases_elements = null; //list of DOM elements
	S.getCanvases_pad = null; //scrawl Pad object
	S.getCanvases_i = 0;
	S.getCanvases_iz = 0;
	my.getCanvases = function() {
		S.getCanvases_elements = document.getElementsByTagName("canvas");
		if (S.getCanvases_elements.length > 0) {
			for (S.getCanvases_i = 0, S.getCanvases_iz = S.getCanvases_elements.length; S.getCanvases_i < S.getCanvases_iz; S.getCanvases_i++) {
				S.getCanvases_pad = my.newPad({
					canvasElement: S.getCanvases_elements[S.getCanvases_i]
				});
				if (S.getCanvases_i === 0) {
					my.currentPad = S.getCanvases_pad.name;
				}
			}
			return true;
		}
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
				name:	'mycanvas',
				parentElement: 'canvasholder',
				width: 400,
				height: 200,
				}).makeCurrent();
		</script>
    </body>
**/
	S.addCanvasToPage_parent = null; //DOM elements
	S.addCanvasToPage_canvas = null; //DOM canvas element
	S.addCanvasToPage_pad = null; //scrawl Pad object
	my.addCanvasToPage = function(items) {
		items = my.safeObject(items);
		S.addCanvasToPage_parent = document.getElementById(items.parentElement) || document.body;
		S.addCanvasToPage_canvas = document.createElement('canvas');
		S.addCanvasToPage_parent.appendChild(S.addCanvasToPage_canvas);
		items.width = my.xtGet(items.width, 300);
		items.height = my.xtGet(items.height, 150);
		items.canvasElement = S.addCanvasToPage_canvas;
		S.addCanvasToPage_pad = new my.Pad(items);
		my.setDisplayOffsets();
		return S.addCanvasToPage_pad;
	};
	/**
A __display__ function to ask Pads to get their Cells to clear their &lt;canvas&gt; elements
@method clear
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	S.clear_padnames = [];
	S.clear_i = 0;
	S.clear_iz = 0;
	my.clear = function(pads) {
		S.clear_padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (S.clear_i = 0, S.clear_iz = S.clear_padnames.length; S.clear_i < S.clear_iz; S.clear_i++) {
			my.pad[S.clear_padnames[S.clear_i]].clear();
		}
		return my;
	};
	/**
A __display__ function to ask Pads to get their Cells to compile their scenes
@method compile
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	S.compile_padnames = [];
	S.compile_i = 0;
	S.compile_iz = 0;
	my.compile = function(pads) {
		S.compile_padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (S.compile_i = 0, S.compile_iz = S.compile_padnames.length; S.compile_i < S.compile_iz; S.compile_i++) {
			my.pad[S.compile_padnames[S.compile_i]].compile();
		}
		return my;
	};
	/**
A __display__ function to ask Pads to show the results of their latest display cycle
@method show
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	S.show_padnames = [];
	S.show_i = 0;
	S.show_iz = 0;
	my.show = function(pads) {
		S.show_padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (S.show_i = 0, S.show_iz = S.show_padnames.length; S.show_i < S.show_iz; S.show_i++) {
			my.pad[S.show_padnames[S.show_i]].show();
		}
		return my;
	};
	/**
A __display__ function to ask Pads to undertake a complete clear-compile-show display cycle
@method render
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	S.render_padnames = [];
	S.render_i = 0;
	S.render_iz = 0;
	my.render = function(pads) {
		S.render_padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (S.render_i = 0, S.render_iz = S.render_padnames.length; S.render_i < S.render_iz; S.render_i++) {
			my.pad[S.render_padnames[S.render_i]].render();
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
	S.addPercentages_a = 0;
	S.addPercentages_b = 0;
	my.addPercentages = function(a, b) {
		S.addPercentages_a = parseFloat(a);
		S.addPercentages_b = parseFloat(b);
		return (S.addPercentages_a + S.addPercentages_b) + '%';
	};
	/**
A __utility__ function to reverse the value of a percentage string
@method reversePercentage
@param {String} a - value
@return String result
**/
	S.reversePercentage_a = 0;
	my.reversePercentage = function(a) {
		S.reversePercentage_a = parseFloat(a);
		S.reversePercentage_a = -S.reversePercentage_a;
		return S.reversePercentage_a + '%';
	};
	/**
A __utility__ function to subtract a percent string from another
@method subtractPercentages
@param {String} a - initial value
@param {String} b - value to be subtracted from initial value
@return String result
**/
	S.subtractPercentages_a = 0;
	S.subtractPercentages_b = 0;
	my.subtractPercentages = function(a, b) {
		S.subtractPercentages_a = parseFloat(a);
		S.subtractPercentages_b = parseFloat(b);
		return (S.subtractPercentages_a - S.subtractPercentages_b) + '%';
	};
	/**
A __general__ function which passes on requests to Pads to generate new &lt;canvas&gt; elements and associated objects - see Pad.addNewCell() for more details
@method addNewCell
@param {Object} data Initial attribute values for new object
@param {String} pad PADNAME
@return New Cell object
**/
	S.addNewCell_pad = '';
	my.addNewCell = function(data, pad) {
		S.addNewCell_pad = (my.isa(pad, 'str')) ? pad : my.currentPad;
		return my.pad[S.addNewCell_pad].addNewCell(data);
	};
	/**
A __general__ function which deletes Cell objects and their associated paraphinalia - see Pad.deleteCells() for more details
@method deleteCells
@param {Array} cells Array of CELLNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	S.deleteCells_slice = [];
	S.deleteCells_i = 0;
	S.deleteCells_iz = 0;
	S.deleteCells_j = 0;
	S.deleteCells_jz = 0;
	my.deleteCells = function() {
		S.deleteCells_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.deleteCells_slice[0])) {
			console.log('deleteCells - needs updating: ', S.deleteCells_slice);
			S.deleteCells_slice = S.deleteCells_slice[0];
		}
		for (S.deleteCells_i = 0, S.deleteCells_iz = S.deleteCells_slice.length; S.deleteCells_i < S.deleteCells_iz; S.deleteCells_i++) {
			for (S.deleteCells_j = 0, S.deleteCells_jz = my.padnames.length; S.deleteCells_j < S.deleteCells_jz; S.deleteCells_j++) {
				my.pad[my.padnames[S.deleteCells_j]].deleteCell(c[S.deleteCells_i]);
			}
			delete my.group[S.deleteCells_slice[S.deleteCells_i]];
			delete my.group[S.deleteCells_slice[S.deleteCells_i] + '_field'];
			delete my.group[S.deleteCells_slice[S.deleteCells_i] + '_fence'];
			my.removeItem(my.groupnames, S.deleteCells_slice[S.deleteCells_i]);
			my.removeItem(my.groupnames, S.deleteCells_slice[S.deleteCells_i] + '_field');
			my.removeItem(my.groupnames, S.deleteCells_slice[S.deleteCells_i] + '_fence');
			delete my.context[S.deleteCells_slice[S.deleteCells_i]];
			delete my.canvas[S.deleteCells_slice[S.deleteCells_i]];
			delete my.ctx[my.cell[S.deleteCells_slice[S.deleteCells_i]].context];
			my.removeItem(my.ctxnames, my.cell[S.deleteCells_slice[S.deleteCells_i]].context);
			delete my.cell[S.deleteCells_slice[S.deleteCells_i]];
			my.removeItem(my.cellnames, S.deleteCells_slice[S.deleteCells_i]);
		}
		return my;
	};
	/**
A __general__ function which adds supplied entitynames to Group.entitys attribute
@method addEntitysToGroups
@param {Array} groups Array of GROUPNAME Strings - can also be a String
@param {Array} entitys Array of SPRITENAME Strings - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	S.addEntitysToGroups_groupArray = [];
	S.addEntitysToGroups_entityArray = [];
	S.addEntitysToGroups_group = null; //scrawl Group object
	S.addEntitysToGroups_i = 0;
	S.addEntitysToGroups_iz = 0;
	my.addEntitysToGroups = function(groups, entitys) {
		if (my.xta(groups, entitys)) {
			S.addEntitysToGroups_groupArray = [].concat(groups);
			S.addEntitysToGroups_entityArray = [].concat(entitys);
			for (S.addEntitysToGroups_i = 0, S.addEntitysToGroups_iz = S.addEntitysToGroups_groupArray.length; S.addEntitysToGroups_i < S.addEntitysToGroups_iz; S.addEntitysToGroups_i++) {
				S.addEntitysToGroups_group = my.group[S.addEntitysToGroups_groupArray[S.addEntitysToGroups_i]];
				if (S.addEntitysToGroups_group) {
					S.addEntitysToGroups_group.addEntitysToGroup(S.addEntitysToGroups_entityArray);
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
	S.removeEntitysFromGroups_groupArray = [];
	S.removeEntitysFromGroups_entityArray = [];
	S.removeEntitysFromGroups_group = null; //scrawl Group object
	S.removeEntitysFromGroups_i = 0;
	S.removeEntitysFromGroups_iz = 0;
	my.removeEntitysFromGroups = function(groups, entitys) {
		if (my.xta(groups, entitys)) {
			S.removeEntitysFromGroups_groupArray = [].concat(groups);
			S.removeEntitysFromGroups_entityArray = [].concat(entitys);
			for (S.removeEntitysFromGroups_i = 0, S.removeEntitysFromGroups_iz = S.removeEntitysFromGroups_groupArray.length; S.removeEntitysFromGroups_i < S.removeEntitysFromGroups_iz; S.removeEntitysFromGroups_i++) {
				S.removeEntitysFromGroups_group = my.group[S.removeEntitysFromGroups_groupArray[S.removeEntitysFromGroups_i]];
				if (S.removeEntitysFromGroups_group) {
					S.removeEntitysFromGroups_group.removeEntitysFromGroup(S.removeEntitysFromGroups_entityArray);
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
	S.deleteEntity_slice = [];
	S.deleteEntity_i = 0;
	S.deleteEntity_iz = 0;
	S.deleteEntity_j = 0;
	S.deleteEntity_jz = 0;
	S.deleteEntity_entityName = '';
	S.deleteEntity_contextName = '';
	my.deleteEntity = function() {
		S.deleteEntity_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.deleteEntity_slice[0])) {
			console.log('deleteEntity - needs updating: ', S.deleteEntity_slice);
			S.deleteEntity_slice = S.deleteEntity_slice[0];
		}
		for (S.deleteEntity_i = 0, S.deleteEntity_iz = S.deleteEntity_slice.length; S.deleteEntity_i < S.deleteEntity_iz; S.deleteEntity_i++) {
			S.deleteEntity_entityName = my.entity[S.deleteEntity_slice[S.deleteEntity_i]];
			if (S.deleteEntity_entityName) {
				my.pathDeleteEntity(S.deleteEntity_entityName);
				S.deleteEntity_contextName = S.deleteEntity_entityName.context;
				my.removeItem(my.ctxnames, S.deleteEntity_contextName);
				delete my.ctx[S.deleteEntity_contextName];
				my.removeItem(my.entitynames, S.deleteEntity_slice[S.deleteEntity_i]);
				delete my.entity[S.deleteEntity_slice[S.deleteEntity_i]];
				for (S.deleteEntity_j = 0, S.deleteEntity_jz = my.groupnames.length; S.deleteEntity_j < S.deleteEntity_jz; S.deleteEntity_j++) {
					my.removeItem(my.group[my.groupnames[S.deleteEntity_j]].entitys, S.deleteEntity_slice[S.deleteEntity_i]);
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
		name: 'generic'
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
	S.Vector_normalize_val = 0;
	my.Vector.prototype.normalize = function() {
		S.Vector_normalize_val = this.getMagnitude();
		if (S.Vector_normalize_val > 0) {
			this.x /= S.Vector_normalize_val;
			this.y /= S.Vector_normalize_val;
			this.z /= S.Vector_normalize_val;
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
		this.x = (my.xtGet(items.x, this.x));
		this.y = (my.xtGet(items.y, this.y));
		this.z = (my.xtGet(items.z, this.z));
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
Check if x and y attributes are set
@method hasCoordinates
@param {Mixed} item Object to be tested
@return True if argument possesses x and y attributes
**/
	my.Vector.prototype.hasCoordinates = function(item) {
		return (my.xta(item, item.x, item.y)) ? true : false;
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
	S.Vector_getCrossProduct_v1x = 0;
	S.Vector_getCrossProduct_v1y = 0;
	S.Vector_getCrossProduct_v1z = 0;
	S.Vector_getCrossProduct_v2x = 0;
	S.Vector_getCrossProduct_v2y = 0;
	S.Vector_getCrossProduct_v2z = 0;
	my.Vector.prototype.getCrossProduct = function(u, v) {
		console.log('Vector.getCrossProduct');
		if (my.isa(u, 'vector')) {
			v = (my.isa(v, 'vector')) ? v : this;
			S.Vector_getCrossProduct_v1x = v.x || 0;
			S.Vector_getCrossProduct_v1y = v.y || 0;
			S.Vector_getCrossProduct_v1z = v.z || 0;
			S.Vector_getCrossProduct_v2x = u.x || 0;
			S.Vector_getCrossProduct_v2y = u.y || 0;
			S.Vector_getCrossProduct_v2z = u.z || 0;
			return my.newVector({
				x: (S.Vector_getCrossProduct_v1y * S.Vector_getCrossProduct_v2z) - (S.Vector_getCrossProduct_v1z * S.Vector_getCrossProduct_v2y),
				y: -(S.Vector_getCrossProduct_v1x * S.Vector_getCrossProduct_v2z) + (S.Vector_getCrossProduct_v1z * S.Vector_getCrossProduct_v2x),
				z: (S.Vector_getCrossProduct_v1x * S.Vector_getCrossProduct_v2y) + (S.Vector_getCrossProduct_v1y * S.Vector_getCrossProduct_v2x)
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
	S.Vector_getTripleScalarProduct_ux = 0;
	S.Vector_getTripleScalarProduct_uy = 0;
	S.Vector_getTripleScalarProduct_uz = 0;
	S.Vector_getTripleScalarProduct_vx = 0;
	S.Vector_getTripleScalarProduct_vy = 0;
	S.Vector_getTripleScalarProduct_vz = 0;
	S.Vector_getTripleScalarProduct_wx = 0;
	S.Vector_getTripleScalarProduct_wy = 0;
	S.Vector_getTripleScalarProduct_wz = 0;
	my.Vector.prototype.getTripleScalarProduct = function(u, v, w) {
		if (my.isa(u, 'vector') && my.isa(v, 'vector')) {
			w = (my.safeObject(w)) ? w : this;
			S.Vector_getTripleScalarProduct_ux = u.x || 0;
			S.Vector_getTripleScalarProduct_uy = u.y || 0;
			S.Vector_getTripleScalarProduct_uz = u.z || 0;
			S.Vector_getTripleScalarProduct_vx = v.x || 0;
			S.Vector_getTripleScalarProduct_vy = v.y || 0;
			S.Vector_getTripleScalarProduct_vz = v.z || 0;
			S.Vector_getTripleScalarProduct_wx = w.x || 0;
			S.Vector_getTripleScalarProduct_wy = w.y || 0;
			S.Vector_getTripleScalarProduct_wz = w.z || 0;
			return (S.Vector_getTripleScalarProduct_ux * ((S.Vector_getTripleScalarProduct_vy * S.Vector_getTripleScalarProduct_wz) - (S.Vector_getTripleScalarProduct_vz * S.Vector_getTripleScalarProduct_wy))) + (S.Vector_getTripleScalarProduct_uy * (-(S.Vector_getTripleScalarProduct_vx * S.Vector_getTripleScalarProduct_wz) + (S.Vector_getTripleScalarProduct_vz * S.Vector_getTripleScalarProduct_wx))) + (S.Vector_getTripleScalarProduct_uz * ((S.Vector_getTripleScalarProduct_vx * S.Vector_getTripleScalarProduct_wy) - (S.Vector_getTripleScalarProduct_vy * S.Vector_getTripleScalarProduct_wx)));
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
	S.stat_vr = [0, 0];
	my.Vector.prototype.rotate = function(angle) {
		if (my.isa(angle, 'num')) {
			S.stat_vr[0] = Math.atan2(this.y, this.x);
			S.stat_vr[0] += (angle * my.radian);
			S.stat_vr[1] = this.getMagnitude();
			this.x = S.stat_vr[1] * Math.cos(S.stat_vr[0]);
			this.y = S.stat_vr[1] * Math.sin(S.stat_vr[0]);
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
	S.Vector_rotate3d_q1 = null; //scrawl Quaternion object
	S.Vector_rotate3d_q2 = null; //scrawl Quaternion object
	S.Vector_rotate3d_q3 = null; //scrawl Quaternion object
	my.Vector.prototype.rotate3d = function(item, mag) {
		if (my.isa(item, 'quaternion')) {
			mag = (scrawl.isa(mag, 'num')) ? mag : this.getMagnitude();
			S.Vector_rotate3d_q1 = my.workquat.q1.set(item);
			S.Vector_rotate3d_q2 = my.workquat.q2.set(this);
			S.Vector_rotate3d_q3 = my.workquat.q3.set(item).conjugate();
			S.Vector_rotate3d_q1.quaternionMultiply(S.Vector_rotate3d_q2);
			S.Vector_rotate3d_q1.quaternionMultiply(S.Vector_rotate3d_q3);
			this.set(S.Vector_rotate3d_q1.v).setMagnitudeTo(mag);
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
		timestamp: ''
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
		height: 50
		});
	box.set({
		height: 100,
		favouriteAnimal: 'cat'
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

Note that any callback or fn attribute functions will be referenced by the clone, not copied to the clone; these can be overwritten with new anonymous functions by including them in the items argument object

(This function is replaced by the path module)

@method clone
@param {Object} items Object containing attribute key:value pairs; will overwrite existing values in the cloned, but not the source, Object
@return Cloned object
@chainable
@example
	var box = scrawl.newBlock({
		width: 50,
		height: 50
		});
	var newBox = box.clone({
		height: 100
		});
	newBox.get('width');		//returns 50
	newBox.get('height');		//returns 100
**/
	S.Base_clone_merged = null; //raw object
	S.Base_clone_keys = [];
	S.Base_clone_that = null; //scrawl object
	S.Base_clone_i = 0;
	S.Base_clone_iz = 0;
	my.Base.prototype.clone = function(items) {
		S.Base_clone_merged = my.mergeOver(this.parse(), my.safeObject(items));
		delete S.Base_clone_merged.context; //required for successful cloning of entitys
		S.Base_clone_keys = Object.keys(this);
		S.Base_clone_that = this;
		for (S.Base_clone_i = 0, S.Base_clone_iz = S.Base_clone_keys.length; S.Base_clone_i < S.Base_clone_iz; S.Base_clone_i++) {
			if (my.isa(this[S.Base_clone_keys[S.Base_clone_i]], 'fn')) {
				S.Base_clone_merged[S.Base_clone_keys[S.Base_clone_i]] = S.Base_clone_that[S.Base_clone_keys[S.Base_clone_i]];
			}
		}
		return new my[this.type](S.Base_clone_merged);
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
	S.Base_resetWork_keys = [];
	S.Base_resetWork_i = 0;
	S.Base_resetWork_iz = 0;
	my.Base.prototype.resetWork = function() {
		S.Base_resetWork_keys = Object.keys(this.work);
		for (S.Base_resetWork_i = 0, S.Base_resetWork_iz = S.Base_resetWork_keys.length; S.Base_resetWork_i < S.Base_resetWork_iz; S.Base_resetWork_i++) {
			this.work[S.Base_resetWork_keys[S.Base_resetWork_i]].set(this[S.Base_resetWork_keys[S.Base_resetWork_i]]);
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
@property height
@type Number
@default 0
**/
		height: 0
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
	S.Position_corePositionInit_temp = null; //raw object
	my.Position.prototype.corePositionInit = function(items) {
		S.Position_corePositionInit_temp = my.safeObject(items.start);
		this.start = my.newVector({
			x: my.xtGet(items.startX, S.Position_corePositionInit_temp.x, 0),
			y: my.xtGet(items.startY, S.Position_corePositionInit_temp.y, 0),
			name: this.type + '.' + this.name + '.start'
		});
		this.work.start = my.newVector({
			name: this.type + '.' + this.name + '.work.start'
		});
		S.Position_corePositionInit_temp = my.safeObject(items.handle);
		this.handle = my.newVector({
			x: my.xtGet(items.handleX, S.Position_corePositionInit_temp.x, 0),
			y: my.xtGet(items.handleY, S.Position_corePositionInit_temp.y, 0),
			name: this.type + '.' + this.name + '.handle'
		});
		this.work.handle = my.newVector({
			name: this.type + '.' + this.name + '.work.handle'
		});
		this.pivot = my.xtGet(items.pivot, my.d[this.type].pivot);
		this.scale = my.xtGet(items.scale, my.d[this.type].scale);
		this.roll = my.xtGet(items.roll, my.d[this.type].roll);
		this.flipReverse = my.xtGet(items.flipReverse, my.d[this.type].flipReverse);
		this.flipUpend = my.xtGet(items.flipUpend, my.d[this.type].flipUpend);
		this.lockX = my.xtGet(items.lockX, my.d[this.type].lockX);
		this.lockY = my.xtGet(items.lockY, my.d[this.type].lockY);
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
	my.Position.prototype.pathPositionInit = function(items) {
		console.log('core', items);
	};
	/**
Augments Base.get(), to allow users to get values for start, startX, startY, handle, handleX, handleY

For 'start' and 'handle', returns a copy of the Vector
@method get
@param {String} get Attribute key
@return Attribute value
**/
	S.stat_positionGet = ['startX', 'startY', 'handleX', 'handleY'];
	my.Position.prototype.get = function(item) {
		if (my.contains(S.stat_positionGet, item)) {
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
		if (my.xto(items.start, items.startX, items.startY)) {
			this.setStart(items);
		}
		if (my.xto(items.handle, items.handleX, items.handleY)) {
			this.setHandle(items);
		}
		this.animationPositionSet(items);
		return this;
	};
	/**
Augments Base.setStart(), to allow users to set the start attributes using start, startX, startY
@method setStart
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	S.Position_setStart_temp = null; //raw object
	my.Position.prototype.setStart = function(items) {
		items = my.safeObject(items);
		if (!my.isa(this.start, 'vector')) {
			this.start = my.newVector(items.start || this.start);
		}
		S.Position_setStart_temp = my.safeObject(items.start);
		this.start.x = my.xtGet(items.startX, S.Position_setStart_temp.x, this.start.x);
		this.start.y = my.xtGet(items.startY, S.Position_setStart_temp.y, this.start.y);
		return this;
	};
	/**
Augments Base.setHandle(), to allow users to set the handle attributes using handle, handleX, handleY
@method setHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	S.Position_setHandle_temp = null; //raw object
	my.Position.prototype.setHandle = function(items) {
		items = my.safeObject(items);
		if (!my.isa(this.handle, 'vector')) {
			this.handle = my.newVector(items.handle || this.handle);
		}
		S.Position_setHandle_temp = my.safeObject(items.handle);
		this.handle.x = my.xtGet(items.handleX, S.Position_setHandle_temp.x, this.handle.x);
		this.handle.y = my.xtGet(items.handleY, S.Position_setHandle_temp.y, this.handle.y);
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
	my.Position.prototype.setDeltaAttribute = function(items) {};

	/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function. This function also accepts startX, startY, handleX, handleY
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDelta = function(items) {
		items = my.safeObject(items);
		if (my.xto(items.start, items.startX, items.startY)) {
			this.setDeltaStart(items);
		}
		my.Position.prototype.pathPositionSetDelta.call(this, items);
		if (my.xto(items.handle, items.handleX, items.handleY)) {
			this.setDeltaHandle(items);
		}
		if (items.scale) {
			this.setDeltaScale(items);
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values; This function accepts start, startX, startY
@method setDeltaStart
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	S.Position_setDeltaStart_temp = null; //raw object
	S.Position_setDeltaStart_x = 0;
	S.Position_setDeltaStart_y = 0;
	my.Position.prototype.setDeltaStart = function(items) {
		items = my.safeObject(items);
		S.Position_setDeltaStart_temp = my.safeObject(items.start);
		S.Position_setDeltaStart_x = my.xtGet(items.startX, S.Position_setDeltaStart_temp.x, 0);
		S.Position_setDeltaStart_y = my.xtGet(items.startY, S.Position_setDeltaStart_temp.y, 0);
		this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + S.Position_setDeltaStart_x : my.addPercentages(this.start.x, S.Position_setDeltaStart_x);
		this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + S.Position_setDeltaStart_y : my.addPercentages(this.start.y, S.Position_setDeltaStart_y);
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts handle, handleX, handleY
@method setDeltaHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	S.Position_setDeltaHandle_temp = null; //raw object
	S.Position_setDeltaHandle_x = 0;
	S.Position_setDeltaHandle_y = 0;
	my.Position.prototype.setDeltaHandle = function(items) {
		items = my.safeObject(items);
		S.Position_setDeltaHandle_temp = my.safeObject(items.handle);
		S.Position_setDeltaHandle_x = my.xtGet(items.handleX, S.Position_setDeltaHandle_temp.x, 0);
		S.Position_setDeltaHandle_y = my.xtGet(items.handleY, S.Position_setDeltaHandle_temp.y, 0);
		this.handle.x = (my.isa(this.handle.x, 'num')) ? this.handle.x + S.Position_setDeltaHandle_x : my.addPercentages(this.handle.x, S.Position_setDeltaHandle_x);
		this.handle.y = (my.isa(this.handle.y, 'num')) ? this.handle.y + S.Position_setDeltaHandle_y : my.addPercentages(this.handle.y, S.Position_setDeltaHandle_y);
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts scale
@method setDeltaScale
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaScale = function(items) {
		items = my.safeObject(items);
		this.scale += items.scale || 0;
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
	S.Position_clone_temp = null; //raw object
	S.Position_clone_clone = null; //scrawl object
	my.Position.prototype.clone = function(items) {
		items = my.safeObject(items);
		S.Position_clone_clone = my.Base.prototype.clone.call(this, items);
		S.Position_clone_temp = my.safeObject(items.start);
		S.Position_clone_clone.start = my.newVector({
			x: my.xtGet(items.startX, S.Position_clone_temp.x, S.Position_clone_clone.start.x),
			y: my.xtGet(items.startY, S.Position_clone_temp.y, S.Position_clone_clone.start.y),
			name: S.Position_clone_clone.type + '.' + S.Position_clone_clone.name + '.start'
		});
		S.Position_clone_temp = my.safeObject(items.handle);
		S.Position_clone_clone.handle = my.newVector({
			x: my.xtGet(items.handleX, S.Position_clone_temp.x, S.Position_clone_clone.handle.x),
			y: my.xtGet(items.handleY, S.Position_clone_temp.y, S.Position_clone_clone.handle.y),
			name: S.Position_clone_clone.type + '.' + S.Position_clone_clone.name + '.handle'
		});
		S.Position_clone_clone = this.animationPositionClone(S.Position_clone_clone, items);
		return S.Position_clone_clone;
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
	S.Position_getPivotOffsetVector_height = 0;
	S.Position_getPivotOffsetVector_width = 0;
	my.Position.prototype.getPivotOffsetVector = function() {
		switch (this.type) {
			case 'Block':
				S.Position_getPivotOffsetVector_height = (this.localHeight / this.scale) || this.get('height');
				S.Position_getPivotOffsetVector_width = (this.localWidth / this.scale) || this.get('width');
				break;
			case 'Picture':
			case 'Cell':
				S.Position_getPivotOffsetVector_height = (this.pasteData.h / this.scale) || this.get('height');
				S.Position_getPivotOffsetVector_width = (this.pasteData.w / this.scale) || this.get('width');
				break;
			default:
				S.Position_getPivotOffsetVector_height = this.height || this.get('height');
				S.Position_getPivotOffsetVector_width = this.width || this.get('width');
		}
		return my.Position.prototype.calculatePOV.call(this, this.work.handle, S.Position_getPivotOffsetVector_width, S.Position_getPivotOffsetVector_height, false);
	};
	/**
Position.getOffsetStartVector() helper function. Supervises the calculation of the pixel values for the object's handle attribute, where the object's frame of reference is its center

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method getCenteredPivotOffsetVector
@return A Vector of calculated offset values to help determine where entity/cell/element drawing should start
@private
**/
	S.Position_getCenteredPivotOffsetVector_height = 0;
	S.Position_getCenteredPivotOffsetVector_width = 0;
	my.Position.prototype.getCenteredPivotOffsetVector = function() {
		S.Position_getCenteredPivotOffsetVector_height = this.localHeight / this.scale || this.height || this.get('height');
		S.Position_getCenteredPivotOffsetVector_width = this.localWidth / this.scale || this.width || this.get('width');
		return my.Position.prototype.calculatePOV.call(this, this.work.handle, S.Position_getCenteredPivotOffsetVector_width, S.Position_getCenteredPivotOffsetVector_height, true);
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
	S.stat_horizontal = ['left', 'center', 'right'];
	S.stat_vertical = ['top', 'center', 'bottom'];
	my.Position.prototype.calculatePOV = function(result, width, height, centered) {
		if ((my.isa(result.x, 'str')) && !my.contains(S.stat_horizontal, result.x)) {
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
		if ((my.isa(result.y, 'str')) && !my.contains(S.stat_vertical, result.y)) {
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
	S.Position_getOffsetStartVector_scaleX = 0;
	S.Position_getOffsetStartVector_scaleY = 0;
	S.Position_getOffsetStartVector_handle = null; //scrawl Vector object
	my.Position.prototype.getOffsetStartVector = function() {
		this.resetWork();
		S.Position_getOffsetStartVector_scaleX = (my.isa(this.handle.x, 'str')) ? this.scale : 1;
		S.Position_getOffsetStartVector_scaleY = (my.isa(this.handle.y, 'str')) ? this.scale : 1;
		S.Position_getOffsetStartVector_handle = this.getPivotOffsetVector();
		S.Position_getOffsetStartVector_handle.x *= S.Position_getOffsetStartVector_scaleX;
		S.Position_getOffsetStartVector_handle.y *= S.Position_getOffsetStartVector_scaleY;
		return S.Position_getOffsetStartVector_handle.reverse();
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
	S.Position_setStampUsingPivot_pivot = null; //scrawl object
	S.Position_setStampUsingPivot_vector = null; //scrawl Vector object
	S.Position_setStampUsingPivot_entity = null; //scrawl Entity object
	S.Position_setStampUsingPivot_cell = null; //scrawl Cell object
	S.Position_setStampUsingPivot_mouse = null; //scrawl Vector object
	S.Position_setStampUsingPivot_pad = null; //scrawl Pad object
	my.Position.prototype.setStampUsingPivot = function(cell) {
		if (my.xt(my.pointnames)) {
			S.Position_setStampUsingPivot_pivot = my.point[this.pivot];
			if (S.Position_setStampUsingPivot_pivot) {
				S.Position_setStampUsingPivot_entity = my.entity[S.Position_setStampUsingPivot_pivot.entity];
				S.Position_setStampUsingPivot_vector = S.Position_setStampUsingPivot_pivot.getCurrentCoordinates().rotate(S.Position_setStampUsingPivot_entity.roll).vectorAdd(S.Position_setStampUsingPivot_entity.start);
				this.start.x = (!this.lockX) ? S.Position_setStampUsingPivot_vector.x : this.start.x;
				this.start.y = (!this.lockY) ? S.Position_setStampUsingPivot_vector.y : this.start.y;
				return this;
			}
		}
		S.Position_setStampUsingPivot_pivot = my.entity[this.pivot];
		if (S.Position_setStampUsingPivot_pivot) {
			S.Position_setStampUsingPivot_vector = (S.Position_setStampUsingPivot_pivot.type === 'Particle') ? S.Position_setStampUsingPivot_pivot.get('place') : S.Position_setStampUsingPivot_pivot.start;
			this.start.x = (!this.lockX) ? S.Position_setStampUsingPivot_vector.x : this.start.x;
			this.start.y = (!this.lockY) ? S.Position_setStampUsingPivot_vector.y : this.start.y;
			return this;
		}
		if (this.pivot === 'mouse') {
			S.Position_setStampUsingPivot_cell = my.cell[cell];
			S.Position_setStampUsingPivot_pad = my.pad[S.Position_setStampUsingPivot_cell.pad];
			S.Position_setStampUsingPivot_mouse = this.correctCoordinates(S.Position_setStampUsingPivot_pad.mouse, cell);
			if (!my.xta(this.oldX, this.oldY)) {
				this.oldX = this.start.x;
				this.oldY = this.start.y;
			}
			this.start.x = (!this.lockX) ? this.start.x + S.Position_setStampUsingPivot_mouse.x - this.oldX : this.start.x;
			this.start.y = (!this.lockY) ? this.start.y + S.Position_setStampUsingPivot_mouse.y - this.oldY : this.start.y;
			this.oldX = S.Position_setStampUsingPivot_mouse.x;
			this.oldY = S.Position_setStampUsingPivot_mouse.y;
			return this;
		}
		return this.setStampUsingStacksPivot();
	};
	/**
Stamp helper function - correct mouse coordinates if pad dimensions not equal to base cell dimensions

@method correctCoordinates
@param {Object} coords An object containing x and y attributes
@param {String} [cell] CELLNAME String
@return Amended coordinate object
**/
	S.Position_correctCoordinates_vector = null; //scrawl Vector object
	S.Position_correctCoordinates_cell = null; //scrawl Cell object
	S.Position_correctCoordinates_pad = null; //scrawl Pad object
	my.Position.prototype.correctCoordinates = function(coords, cell) {
		coords = my.safeObject(coords);
		S.Position_correctCoordinates_vector = my.v.set(coords);
		if (scrawl.xta(coords.x, coords.y)) {
			S.Position_correctCoordinates_cell = (my.cell[cell]) ? my.cell[cell] : my.cell[my.pad[my.currentPad].base];
			S.Position_correctCoordinates_pad = my.pad[S.Position_correctCoordinates_cell.pad];
			if (S.Position_correctCoordinates_pad.width !== S.Position_correctCoordinates_cell.actualWidth) {
				S.Position_correctCoordinates_vector.x /= (S.Position_correctCoordinates_pad.width / S.Position_correctCoordinates_cell.actualWidth);
			}
			if (S.Position_correctCoordinates_pad.height !== S.Position_correctCoordinates_cell.actualHeight) {
				S.Position_correctCoordinates_vector.y /= (S.Position_correctCoordinates_pad.height / S.Position_correctCoordinates_cell.actualHeight);
			}
			return S.Position_correctCoordinates_vector;
		}
		return false;
	};
	/**
Stamp helper hook function - amended by stacks module

@method setStampUsingStacksPivot
@return this
**/
	my.Position.prototype.setStampUsingStacksPivot = function() {
		return this;
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
		this.width = my.xtGet(items.width, my.d[this.type].width);
		this.height = my.xtGet(items.height, my.d[this.type].height);
		this.scale = my.xtGet(items.scale, my.d[this.type].scale);
		this.setLocalDimensions();
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
DOM element localWidth
@property localWidth
@type Number
@default 300
**/
		localWidth: 300,
		/**
DOM element localHeight
@property localHeight
@type Number
@default 150
**/
		localHeight: 150,
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
		position: 'static'
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
	S.PageElement_get_element = null; //DOM object
	S.stat_pageElementGet = ['width', 'height', 'position'];
	my.PageElement.prototype.get = function(item) {
		S.PageElement_get_element = this.getElement();
		if (my.contains(S.stat_pageElementGet, item)) {
			switch (item) {
				case 'width':
					return my.xtGet(this.localWidth, parseFloat(S.PageElement_get_element.width), my.d[this.type].width);
				case 'height':
					return my.xtGet(this.localHeight, parseFloat(S.PageElement_get_element.height), my.d[this.type].height);
				case 'position':
					return my.xtGet(this.position, S.PageElement_get_element.style.position);
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
		if (my.xto(items.width, items.height, items.scale)) {
			this.setLocalDimensions();
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
		if (my.xto(items.title, items.comment)) {
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
	S.PageElement_setAccessibility_element = null; //DOM object
	my.PageElement.prototype.setAccessibility = function(items) {
		items = my.safeObject(items);
		S.PageElement_setAccessibility_element = this.getElement();
		if (my.xt(items.title)) {
			this.title = items.title;
			S.PageElement_setAccessibility_element.title = this.title;
		}
		if (my.xt(items.comment)) {
			this.comment = items.comment;
			S.PageElement_setAccessibility_element.setAttribute('data-comment', this.comment);
		}
		return this;
	};
	/**
Calculate the DOM element's current display offset values
@method setDisplayOffsets
@return This
@chainable
**/
	S.PageElement_setDisplayOffsets_element = null; //DOM object
	S.PageElement_setDisplayOffsets_offsetX = 0;
	S.PageElement_setDisplayOffsets_offsetY = 0;
	my.PageElement.prototype.setDisplayOffsets = function() {
		S.PageElement_setDisplayOffsets_offsetX = 0;
		S.PageElement_setDisplayOffsets_offsetY = 0;
		S.PageElement_setDisplayOffsets_element = this.getElement();
		if (S.PageElement_setDisplayOffsets_element.offsetParent) {
			do {
				S.PageElement_setDisplayOffsets_offsetX += S.PageElement_setDisplayOffsets_element.offsetLeft;
				S.PageElement_setDisplayOffsets_offsetY += S.PageElement_setDisplayOffsets_element.offsetTop;
				S.PageElement_setDisplayOffsets_element = S.PageElement_setDisplayOffsets_element.offsetParent;
			} while (S.PageElement_setDisplayOffsets_element.offsetParent);
		}
		this.displayOffsetX = S.PageElement_setDisplayOffsets_offsetX;
		this.displayOffsetY = S.PageElement_setDisplayOffsets_offsetY;
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
Helper function - set local dimensions (width, height)
@method setLocalDimensions
@return This
@chainable
@private
**/
	my.PageElement.prototype.setLocalDimensions = function() {
		this.localWidth = this.width * this.scale;
		this.localHeight = this.height * this.scale;
		return this;
	};
	/**
Helper function - set DOM element dimensions (width, height)
@method setDimensions
@return This
@chainable
@private
**/
	S.PageElement_setDimensions_element = null; //DOM object
	my.PageElement.prototype.setDimensions = function() {
		S.PageElement_setDimensions_element = this.getElement();
		S.PageElement_setDimensions_element.style.width = this.localWidth + 'px';
		S.PageElement_setDimensions_element.style.height = this.localHeight + 'px';
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
	S.PageElement_handleMouseMove_wrapper = null; //scrawl object
	S.PageElement_handleMouseMove_mouseX = 0;
	S.PageElement_handleMouseMove_mouseY = 0;
	S.PageElement_handleMouseMove_maxX = 0;
	S.PageElement_handleMouseMove_maxY = 0;
	S.stat_pageElementHandleMouseMove = ['relative', 'absolute', 'fixed', 'sticky'];
	my.PageElement.prototype.handleMouseMove = function(e) {
		e = (my.xt(e)) ? e : window.event;
		S.PageElement_handleMouseMove_mouseX = 0;
		S.PageElement_handleMouseMove_mouseY = 0;
		S.PageElement_handleMouseMove_wrapper = scrawl.pad[e.target.id] || scrawl.stack[e.target.id] || scrawl.element[e.target.id] || false;
		if (S.PageElement_handleMouseMove_wrapper) {
			S.PageElement_handleMouseMove_wrapper.mouse.active = false;
			S.PageElement_handleMouseMove_wrapper.mouse.element = S.PageElement_handleMouseMove_wrapper.name;
			S.PageElement_handleMouseMove_wrapper.mouse.type = S.PageElement_handleMouseMove_wrapper.type;
			if (S.PageElement_handleMouseMove_wrapper.mouse.layer || my.xta(e, e.layerX) && my.contains(S.stat_pageElementHandleMouseMove, S.PageElement_handleMouseMove_wrapper.position)) {
				S.PageElement_handleMouseMove_mouseX = e.layerX;
				S.PageElement_handleMouseMove_mouseY = e.layerY;
				if (S.PageElement_handleMouseMove_mouseX >= 0 && S.PageElement_handleMouseMove_mouseX <= (S.PageElement_handleMouseMove_wrapper.width * S.PageElement_handleMouseMove_wrapper.scale) && S.PageElement_handleMouseMove_mouseY >= 0 && S.PageElement_handleMouseMove_mouseY <= (S.PageElement_handleMouseMove_wrapper.height * S.PageElement_handleMouseMove_wrapper.scale)) {
					S.PageElement_handleMouseMove_wrapper.mouse.active = true;
				}
				S.PageElement_handleMouseMove_wrapper.mouse.x = e.layerX * (1 / S.PageElement_handleMouseMove_wrapper.scale);
				S.PageElement_handleMouseMove_wrapper.mouse.y = e.layerY * (1 / S.PageElement_handleMouseMove_wrapper.scale);
				S.PageElement_handleMouseMove_wrapper.mouse.layer = true;
			}
			else {
				if (e.pageX || e.pageY) {
					S.PageElement_handleMouseMove_mouseX = e.pageX;
					S.PageElement_handleMouseMove_mouseY = e.pageY;
				}
				else if (e.clientX || e.clientY) {
					S.PageElement_handleMouseMove_mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					S.PageElement_handleMouseMove_mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
				S.PageElement_handleMouseMove_maxX = S.PageElement_handleMouseMove_wrapper.displayOffsetX + (S.PageElement_handleMouseMove_wrapper.width * S.PageElement_handleMouseMove_wrapper.scale);
				S.PageElement_handleMouseMove_maxY = S.PageElement_handleMouseMove_wrapper.displayOffsetY + (S.PageElement_handleMouseMove_wrapper.height * S.PageElement_handleMouseMove_wrapper.scale);
				if (S.PageElement_handleMouseMove_mouseX >= S.PageElement_handleMouseMove_wrapper.displayOffsetX && S.PageElement_handleMouseMove_mouseX <= S.PageElement_handleMouseMove_maxX && S.PageElement_handleMouseMove_mouseY >= S.PageElement_handleMouseMove_wrapper.displayOffsetY && S.PageElement_handleMouseMove_mouseY <= S.PageElement_handleMouseMove_maxY) {
					S.PageElement_handleMouseMove_wrapper.mouse.active = true;
				}
				S.PageElement_handleMouseMove_wrapper.mouse.x = (S.PageElement_handleMouseMove_mouseX - S.PageElement_handleMouseMove_wrapper.displayOffsetX) * (1 / S.PageElement_handleMouseMove_wrapper.scale);
				S.PageElement_handleMouseMove_wrapper.mouse.y = (S.PageElement_handleMouseMove_mouseY - S.PageElement_handleMouseMove_wrapper.displayOffsetY) * (1 / S.PageElement_handleMouseMove_wrapper.scale);
				S.PageElement_handleMouseMove_wrapper.mouse.layer = false;
			}
		}
		return S.PageElement_handleMouseMove_wrapper;
	};
	/**
mouseout event listener function
@method handleMouseOut
@param {Object} e window.event
@return This
@private
**/
	S.PageElement_handleMouseOut_wrapper = null; //scrawl object
	my.PageElement.prototype.handleMouseOut = function(e) {
		e = (my.xt(e)) ? e : window.event;
		S.PageElement_handleMouseOut_wrapper = scrawl.pad[e.target.id] || scrawl.stack[e.target.id] || scrawl.element[e.target.id] || false;
		if (S.PageElement_handleMouseOut_wrapper) {
			S.PageElement_handleMouseOut_wrapper.mouse.active = false;
		}
		return S.PageElement_handleMouseOut_wrapper;
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
	S.PageElement_addMouseMove_element = null; //DOM object
	S.PageElement_addMouseMove_test = false;
	my.PageElement.prototype.addMouseMove = function() {
		S.PageElement_addMouseMove_element = this.getElement();
		S.PageElement_addMouseMove_element.removeEventListener('mousemove', this.handleMouseMove, false);
		S.PageElement_addMouseMove_element.addEventListener('mousemove', this.handleMouseMove, false);
		S.PageElement_addMouseMove_element.removeEventListener('mouseout', this.handleMouseOut, false);
		S.PageElement_addMouseMove_element.removeEventListener('mouseleave', this.handleMouseOut, false);
		S.PageElement_addMouseMove_element.setAttribute('onmouseout', 'return;');
		S.PageElement_addMouseMove_test = typeof S.PageElement_addMouseMove_element.onmouseout == 'function';
		S.PageElement_addMouseMove_element.setAttribute('onmouseout', null);
		if (S.PageElement_addMouseMove_test) {
			S.PageElement_addMouseMove_element.addEventListener('mouseout', this.handleMouseOut, false);
		}
		else {
			S.PageElement_addMouseMove_element.addEventListener('mouseleave', this.handleMouseOut, false);
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
	S.PageElement_removeMouseMove_element = null; //DOM object
	my.PageElement.prototype.removeMouseMove = function() {
		S.PageElement_removeMouseMove_element = this.getElement();
		S.PageElement_removeMouseMove_element.removeEventListener('mousemove', this.handleMouseMove, false);
		S.PageElement_removeMouseMove_element.removeEventListener('mouseout', this.handleMouseOut, false);
		S.PageElement_removeMouseMove_element.removeEventListener('mouseleave', this.handleMouseOut, false);
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
* scrawl.canvas.PADNAME - for the Pad object's visible (display) &lt;canvas&gt; element
* scrawl.context.PADNAME - for the visible (display) &ltcanvas&gt; element's 2d context engine
* scrawl.cell[scrawl.pad.PADNAME.display] - for the Pad object's display cell
* scrawl.cell[scrawl.pad.PADNAME.base] - for the Pad object's base cell

@class Pad
@constructor
@extends PageElement
@param {Object} [items] Key:value Object argument for setting attributes
**/
	S.Pad_init_display = null; //scrawl Cell object
	S.Pad_init_base = null; //scrawl Cell object
	S.Pad_init_canvas = null; //DOM object
	my.Pad = function(items) {
		items = my.safeObject(items);

		// only proceed if a canvas element has been supplied as the value of items.canvasElement 
		if (my.isa(items.canvasElement, 'canvas')) {

			// enhance/amend the items object with essdential data - name, width, height
			items.width = my.xtGet(items.width, items.canvasElement.width, my.d.Pad.width);
			items.height = my.xtGet(items.height, items.canvasElement.height, my.d.Pad.height);
			items.name = my.xtGet(items.name, items.canvasElement.id, items.canvasElement.name, 'Pad');

			// go up the line to populate this Pad with data
			my.PageElement.call(this, items);

			//amend name if necessary, and set canvas element id
			if (this.name.match(/~~~/)) {
				this.name = this.name.replace(/~~~/g, '_');
			}
			items.canvasElement.id = this.name;

			// register this Pad in library
			my.pad[this.name] = this;
			my.pushUnique(my.padnames, this.name);

			// prepare for cell creation
			this.cells = [];

			// create a wrapper for the display canvas element
			S.Pad_init_display = my.newCell({
				name: this.name,
				pad: this.name,
				canvas: items.canvasElement,
				compiled: false,
				shown: false,
				width: this.localWidth,
				height: this.localHeight
			});
			my.pushUnique(this.cells, S.Pad_init_display.name);
			this.display = S.Pad_init_display.name;

			// create a new canvas element to act as the base
			S.Pad_init_canvas = items.canvasElement.cloneNode(true);
			S.Pad_init_canvas.setAttribute('id', this.name + '_base');

			// create a wrapper for the base canvas element
			S.Pad_init_base = my.newCell({
				name: this.name + '_base',
				pad: this.name,
				canvas: S.Pad_init_canvas,
				compileOrder: 9999,
				shown: false,
				width: this.localWidth / this.scale,
				height: this.localHeight / this.scale
			});
			my.pushUnique(this.cells, S.Pad_init_base.name);
			this.base = S.Pad_init_base.name;
			this.current = S.Pad_init_base.name;

			// finalise stuff for this Pad
			this.setDisplayOffsets();
			this.setAccessibility(items);
			//items.mouse = (my.isa(items.mouse, 'bool') || my.isa(items.mouse, 'vector')) ? items.mouse : true;
			this.initMouse({
				mouse: (my.isa(items.mouse, 'bool') || my.isa(items.mouse, 'vector')) ? items.mouse : true
			});
			this.filtersPadInit();
			this.padStacksConstructor(items);

			// return this
			return this;
		}

		// on failure, return false
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

//not convinced there's any point in keeping this attribute anymore - take it out?

@property current
@type String
@default ''
@deprecated
**/
		current: ''
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
Pad constructor hook function - modified by filters module
@method filtersPadInit
@private
**/
	my.Pad.prototype.filtersPadInit = function(items) {};
	/**
Pad constructor hook function - modified by stacks module
@method stacksPadInit
@private
**/
	my.Pad.prototype.stacksPadInit = function(items) {};
	/**
Augments PageElement.set(), to cascade scale, backgroundColor, globalAlpha and globalCompositeOperation changes to associated Cell objects
				
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	S.Pad_set_base = null; //scrawl Cell object
	S.Pad_set_display = null; //scrawl Cell object
	my.Pad.prototype.set = function(items) {
		my.PageElement.prototype.set.call(this, items);
		items = my.safeObject(items);
		S.Pad_set_display = my.cell[this.display];
		S.Pad_set_base = my.cell[this.base];
		if (my.xto(items.scale, items.width, items.height)) {
			S.Pad_set_display.set({
				pasteWidth: (items.width) ? this.localWidth : S.Pad_set_display.pasteWidth,
				pasteHeight: (items.height) ? this.localHeight : S.Pad_set_display.pasteHeight,
				scale: items.scale || S.Pad_set_display.scale
			});
		}
		this.padStacksSet(items);
		if (my.xto(items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.width, items.height)) {
			this.setDisplayOffsets();
		}
		if (my.xto(items.backgroundColor, items.globalAlpha, items.globalCompositeOperation)) {
			S.Pad_set_base.set({
				backgroundColor: items.backgroundColor || S.Pad_set_base.backgroundColor,
				globalAlpha: items.globalAlpha || S.Pad_set_base.globalAlpha,
				globalCompositeOperation: items.globalCompositeOperation || S.Pad_set_base.globalCompositeOperation
			});
		}
		return this;
	};
	/**
Pad constructor hook function - amended by Stacks module
@method padStacksConstructor
@return Nothing
@private
**/
	my.Pad.prototype.padStacksConstructor = function() {};
	/**
Pad set hook function - amended by Stacks module
@method padStacksSet
@return Nothing
@private
**/
	my.Pad.prototype.padStacksSet = function() {};
	/**
Display function sorting routine - cells are sorted according to their compileOrder attribute value, in ascending order
@method sortCellsCompile
@return Nothing
@private
**/
	my.Pad.prototype.sortCellsCompile = function() {
		this.cells.sort(function(a, b) {
			return my.cell[a].compileOrder - my.cell[b].compileOrder;
		});
	};
	/**
Display function sorting routine - cells are sorted according to their showOrder attribute value, in ascending order
@method sortCellsShow
@return Nothing
@private
**/
	my.Pad.prototype.sortCellsShow = function() {
		this.cells.sort(function(a, b) {
			return my.cell[a].showOrder - my.cell[b].showOrder;
		});
	};
	/**
Display function - requests Cells to clear their &lt;canvas&gt; element

Cells with cleared = true will clear theid displays in preparation for compile/stamp operations

@method clear
@return This
@chainable
**/
	S.Pad_clear_cell = null; //scrawl Cell object
	S.Pad_clear_i = 0;
	S.Pad_clear_iz = 0;
	my.Pad.prototype.clear = function() {
		for (S.Pad_clear_i = 0, S.Pad_clear_iz = this.cells.length; S.Pad_clear_i < S.Pad_clear_iz; S.Pad_clear_i++) {
			S.Pad_clear_cell = my.cell[this.cells[S.Pad_clear_i]];
			if (S.Pad_clear_cell.rendered && S.Pad_clear_cell.cleared) {
				S.Pad_clear_cell.clear();
			}
		}
		return this;
	};
	/**
Display function - requests Cells to compile their &lt;canvas&gt; element

Cells will compile in ascending order of their compileOrder attributes, if their compiled attribute = true

By default:
* the initial base canvas has a compileOrder of 9999 and compiles last
* the initial display canvas has compiled = false and will not compile

(This function is replaced by the Filters module)

@method compile
@return This
@chainable
**/
	S.Pad_compile_cell = null; //scrawl Cell object
	S.Pad_compile_i = 0;
	S.Pad_compile_iz = 0;
	my.Pad.prototype.compile = function() {
		this.sortCellsCompile();
		for (S.Pad_compile_i = 0, S.Pad_compile_iz = this.cells.length; S.Pad_compile_i < S.Pad_compile_iz; S.Pad_compile_i++) {
			S.Pad_compile_cell = my.cell[this.cells[S.Pad_compile_i]];
			if (S.Pad_compile_cell.rendered && S.Pad_compile_cell.compiled) {
				S.Pad_compile_cell.compile();
			}
		}
		return this;
	};
	/**
Display function - requests Cells to show their &lt;canvas&gt; element 

Cells will show in ascending order of their showOrder attributes, if their show attribute = true

By default, the initial base and display canvases have shown = false:
* 'show' involves a cell copying itself onto the base cell; it makes no sense for the base cell to copy onto itself
* the last action is to copy the base cell onto the display cell

(This function is replaced by the Filters module)

@method show
@return This
@chainable
**/
	S.Pad_show_display = null; //scrawl Cell object
	S.Pad_show_base = null; //scrawl Cell object
	S.Pad_show_cell = null; //scrawl Cell object
	S.Pad_show_i = 0;
	S.Pad_show_iz = 0;
	my.Pad.prototype.show = function() {
		S.Pad_show_display = my.cell[this.display];
		S.Pad_show_base = my.cell[this.base];
		this.sortCellsShow();
		for (S.Pad_show_i = 0, S.Pad_show_iz = this.cells.length; S.Pad_show_i < S.Pad_show_iz; S.Pad_show_i++) {
			S.Pad_show_cell = my.cell[this.cells[S.Pad_show_i]];
			if (S.Pad_show_cell.rendered && S.Pad_show_cell.shown) {
				S.Pad_show_base.copyCellToSelf(S.Pad_show_cell);
			}
		}
		S.Pad_show_display.copyCellToSelf(S.Pad_show_base, true);
		return this;
	};
	/**
Display function - Pad tells its associated Cell objects to undertake a complete clear-compile-show display cycle

@method render
@return This
@chainable
**/
	my.Pad.prototype.render = function() {
		this.clear();
		this.compile();
		this.show();
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
	S.Pad_addNewCell_canvas = null; //DOM Canvas object
	S.Pad_addNewCell_cell = null; //scrawl Cell object
	my.Pad.prototype.addNewCell = function(data) {
		data = my.safeObject(data);
		if (my.isa(data.name, 'str')) {
			data.width = Math.round(data.width) || this.width;
			data.height = Math.round(data.height) || this.height;
			S.Pad_addNewCell_canvas = document.createElement('canvas');
			S.Pad_addNewCell_canvas.setAttribute('id', data.name);
			S.Pad_addNewCell_canvas.setAttribute('height', data.height);
			S.Pad_addNewCell_canvas.setAttribute('width', data.width);
			data.pad = this.name;
			data.canvas = S.Pad_addNewCell_canvas;
			S.Pad_addNewCell_cell = my.newCell(data);
			my.pushUnique(this.cells, S.Pad_addNewCell_cell.name);
			return S.Pad_addNewCell_cell;
		}
		return false;
	};
	/**
Associate existing &lt;canvas&gt; elements, and their Cell wrappers, with this Pad
@method addCells
@param {String} items One or more CELLNAME Strings
@return This
@chainable
**/
	S.Pad_addCells_slice = [];
	S.Pad_addCells_i = 0;
	S.Pad_addCells_iz = 0;
	my.Pad.prototype.addCells = function() {
		S.Pad_addCells_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.Pad_addCells_slice[0])) {
			console.log('addCells - needs updating: ', S.Pad_addCells_slice);
			S.Pad_addCells_slice = S.Pad_addCells_slice[0];
		}
		for (S.Pad_addCells_i = 0, S.Pad_addCells_iz = S.Pad_addCells_slice.length; S.Pad_addCells_i < S.Pad_addCells_iz; S.Pad_addCells_i++) {
			if (my.cell[S.Pad_addCells_slice[S.Pad_addCells_i]]) {
				this.cells.push(S.Pad_addCells_slice[S.Pad_addCells_i]);
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
		height: 200
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
	S.Pad_setAccessibility_element = null; //DOM object
	my.Pad.prototype.setAccessibility = function(items) {
		items = my.safeObject(items);
		S.Pad_setAccessibility_element = this.getElement();
		if (my.xt(items.title)) {
			this.title = items.title;
			S.Pad_setAccessibility_element.title = this.title;
		}
		if (my.xt(items.comment)) {
			this.comment = items.comment;
			S.Pad_setAccessibility_element.setAttribute('data-comment', this.comment);
			S.Pad_setAccessibility_element.innerHTML = '<p>' + this.comment + '</p>';
		}
		return this;
	};
	/**
Overrides PageElement.setDimensions(); &lt;canvas&gt; elements do not use styling to set their drawing region dimensions

@method setDimensions
@return This
@chainable
**/
	S.Pad_setDimensions_element = null; //DOM object
	my.Pad.prototype.setDimensions = function() {
		S.Pad_setDimensions_element = this.getElement();
		S.Pad_setDimensions_element.width = this.localWidth;
		S.Pad_setDimensions_element.height = this.localHeight;
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
		if (my.xta(items, items.canvas)) { //flag used by Pad constructor when calling Cell constructor
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
			this.filtersCellInit(items);
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
Display cycle flag - on true (default), the cell will take part in the display cycle
@property rendered
@type Boolean
@default true
**/
		rendered: true,
		/**
Display cycle flag - on true (default), the cell will clear itself as part of the display cycle
@property cleared
@type Boolean
@default true
**/
		cleared: true,
		/**
Display cycle flag - on true (default), the cell will compile itself as part of the display cycle
@property compiled
@type Boolean
@default true
**/
		compiled: true,
		/**
Display cycle flag - on true (default), the cell will show itself as part of the display cycle
@property shown
@type Boolean
@default true
**/
		shown: true,
		/**
Display cycle attribute - order in which the cell will compile itself (if compile attribute = true)
@property compileOrder
@type Number
@default 0
**/
		compileOrder: 0,
		/**
Display cycle attribute - order in which the cell will show itself (if show attribute = true)
@property showOrder
@type Number
@default 0
**/
		showOrder: 0
	};
	my.mergeInto(my.d.Cell, my.d.Position);
	/**
Cell constructor hook function - core module
@method coreCellInit
@private
**/
	S.Cell_coreCellInit_temp = null; //raw object
	S.Cell_coreCellInit_context = null; //scrawl Context object
	my.Cell.prototype.coreCellInit = function(items) {
		my.Position.call(this, items); //handles items.start, items.startX, items.startY
		my.Base.prototype.set.call(this, items);
		my.canvas[this.name] = items.canvas;
		my.context[this.name] = items.canvas.getContext('2d');
		my.cell[this.name] = this;
		my.pushUnique(my.cellnames, this.name);
		this.pad = my.xtGet(items.pad, false);
		S.Cell_coreCellInit_temp = my.safeObject(items.copy);
		this.copy = my.newVector({
			x: my.xtGet(items.copyX, S.Cell_coreCellInit_temp.x, 0),
			y: my.xtGet(items.copyY, S.Cell_coreCellInit_temp.y, 0),
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
		if (my.xto(items.pasteX, items.pasteY)) {
			this.start.x = my.xtGet(items.pasteX, this.start.x);
			this.start.y = my.xtGet(items.pasteY, this.start.y);
		}
		if (my.xto(items.copyWidth, items.copyHeight, items.pasteWidth, items.pasteHeight, items.width, items.height)) {
			this.copyWidth = my.xtGet(items.copyWidth, items.width, this.copyWidth);
			this.copyHeight = my.xtGet(items.copyHeight, items.height, this.copyHeight);
			this.pasteWidth = my.xtGet(items.pasteWidth, items.width, this.pasteWidth);
			this.pasteHeight = my.xtGet(items.pasteHeight, items.height, this.pasteHeight);
		}
		this.setCopy();
		this.setPaste();
		S.Cell_coreCellInit_context = my.newContext({
			name: this.name,
			cell: my.context[this.name]
		});
		this.context = S.Cell_coreCellInit_context.name;
		this.flipUpend = my.xtGet(items.flipUpend, my.d.Cell.flipUpend);
		this.flipReverse = my.xtGet(items.flipReverse, my.d.Cell.flipReverse);
		this.lockX = my.xtGet(items.lockX, my.d.Cell.lockX);
		this.lockY = my.xtGet(items.lockY, my.d.Cell.lockY);
		this.roll = my.xtGet(items.roll, my.d.Cell.roll);
		this.rendered = my.xtGet(items.rendered, true);
		this.cleared = my.xtGet(items.cleared, true);
		this.compiled = my.xtGet(items.compiled, true);
		this.shown = my.xtGet(items.shown, true);
		this.compileOrder = my.xtGet(items.compileOrder, 0);
		this.showOrder = my.xtGet(items.showOrder, 0);
		this.backgroundColor = my.xtGet(items.backgroundColor, 'rgba(0,0,0,0)');
		this.groups = (my.xt(items.groups)) ? [].concat(items.groups) : []; //must be set
		my.newGroup({
			name: this.name,
			cell: this.name
		});
	};
	/**
Cell constructor hook function - modified by collisions module
@method collisionsCellInit
@private
**/
	my.Cell.prototype.collisionsCellInit = function(items) {};
	/**
Cell constructor hook function - modified by filters module
@method filtersCellInit
@private
**/
	my.Cell.prototype.filtersCellInit = function(items) {};
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
	S.stat_cellGet1 = ['pasteX', 'pasteY', 'copyX', 'copyY'];
	S.stat_cellGet2 = ['paste', 'copy'];
	S.stat_cellGet3 = ['width', 'height'];
	my.Cell.prototype.get = function(item) {
		if (my.contains(S.stat_cellGet1, item)) {
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
		if (my.contains(S.stat_cellGet2, item)) {
			switch (item) {
				case 'paste':
					return this.start.getVector();
				case 'copy':
					return this.copy.getVector();
			}
		}
		if (my.contains(S.stat_cellGet3, item)) {
			switch (item) {
				case 'width':
					return this.actualWidth;
				case 'height':
					return this.actualHeight;
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
		my.Position.prototype.set.call(this, items);
		items = my.safeObject(items);
		if (my.xto(items.paste, items.pasteX, items.pasteY)) {
			this.setPasteVector(items, false);
		}
		if (my.xto(items.copy, items.copyX, items.copyY)) {
			this.setCopyVector(items, false);
		}
		if (my.xto(items.copyWidth, items.width)) {
			this.setCopyWidth(items, false);
		}
		if (my.xto(items.copyHeight, items.height)) {
			this.setCopyHeight(items, false);
		}
		if (my.xto(items.pasteWidth, items.width)) {
			this.setPasteWidth(items, false);
		}
		if (my.xto(items.pasteHeight, items.height)) {
			this.setPasteHeight(items, false);
		}
		if (my.xto(items.actualWidth, items.width)) {
			this.setActualWidth(items, false);
		}
		if (my.xto(items.actualHeight, items.height)) {
			this.setActualHeight(items, false);
		}
		if (my.xto(items.actualWidth, items.actualHeight, items.width, items.height)) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
		}
		this.animationCellSet(items);
		if (my.xto(items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height, items.scale)) {
			this.setCopy();
		}
		if (my.xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale)) {
			this.setPaste();
		}
		if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.actualWidth, items.actualHeight, items.scale)) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Augments Cell.set()
@method setActualHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setActualHeight = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.actualHeight = my.xtGet(items.actualHeight, items.height, this.actualHeight);
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
			this.offset.flag = false;
		}
		return this;
	};
	/**
Augments Cell.set()
@method setActualWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setActualWidth = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.actualWidth = my.xtGet(items.actualWidth, items.width, this.actualWidth);
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
			this.offset.flag = false;
		}
		return this;
	};
	/**
Augments Cell.set()
@method setPasteHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setPasteHeight = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.pasteHeight = my.xtGet(items.pasteHeight, items.height, this.pasteHeight);
		if (recalc) {
			this.setPaste();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setPasteWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setPasteWidth = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.pasteWidth = my.xtGet(items.pasteWidth, items.width, this.pasteWidth);
		if (recalc) {
			this.setPaste();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setCopyHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setCopyHeight = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.copyHeight = my.xtGet(items.copyHeight, items.height, this.copyHeight);
		if (recalc) {
			this.setCopy();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setCopyWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setCopyWidth = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.copyWidth = my.xtGet(items.copyWidth, items.width, this.copyWidth);
		if (recalc) {
			this.setCopy();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setPasteVector
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setPasteVector_temp = null; //raw object
	my.Cell.prototype.setPasteVector = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		S.Cell_setPasteVector_temp = my.safeObject(items.paste);
		this.start.x = my.xtGet(items.pasteX, S.Cell_setPasteVector_temp.x, this.start.x);
		this.start.y = my.xtGet(items.pasteY, S.Cell_setPasteVector_temp.y, this.start.y);
		if (recalc) {
			this.setPaste();
		}
		return this;
	};
	/**
Augments Cell.set()
@method setCopyVector
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setCopyVector_temp = null; //raw object
	my.Cell.prototype.setCopyVector = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		S.Cell_setCopyVector_temp = my.safeObject(items.copy);
		this.copy.x = my.xtGet(items.copyX, S.Cell_setCopyVector_temp.x, this.copy.x);
		this.copy.y = my.xtGet(items.copyY, S.Cell_setCopyVector_temp.y, this.copy.y);
		if (recalc) {
			this.setCopy();
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
Adds the value of each attribute supplied in the argument to existing values

Augments Position.setDelta to allow changes to be made using attributes: source, sourceX, sourceY, sourceWidth, sourceHeight, start, startX, startY, target, targetX, targetY, targetWidth, targetHeight, globalAlpha
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.setDelta = function(items) {
		my.Position.prototype.setDelta.call(this, items);
		items = my.safeObject(items);
		if (my.xto(items.copy, items.copyX, items.copyY)) {
			this.setDeltaCopy(items, false);
		}
		if (my.xto(items.paste, items.pasteX, items.pasteY)) {
			this.setDeltaPaste(items, false);
		}
		if (my.xt(items.copyWidth)) {
			this.setDeltaCopyWidth(items, false);
		}
		if (my.xt(items.copyHeight)) {
			this.setDeltaCopyHeight(items, false);
		}
		if (my.xto(items.pasteWidth, items.width)) {
			this.setDeltaPasteWidth(items, false);
		}
		if (my.xto(items.pasteHeight, items.height)) {
			this.setDeltaPasteHeight(items, false);
		}
		if (my.xto(items.actualWidth, items.width)) {
			this.setDeltaActualWidth(items, false);
		}
		if (my.xto(items.actualHeight, items.height)) {
			this.setDeltaActualHeight(items, false);
		}
		if (my.xt(items.roll)) {
			this.setDeltaRoll(items);
		}
		if (my.xt(items.globalAlpha)) {
			this.setDeltaGlobalAlpha(items);
		}
		if (my.xto(items.actualWidth, items.width, items.actualHeight, items.height)) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
		}
		if (my.xto(items.copy, items.copyX, items.copyY, items.copyWidth, items.copyHeight, items.width, items.height, items.scale)) {
			this.setCopy();
		}
		if (my.xto(items.start, items.startX, items.startY, items.paste, items.pasteX, items.pasteY, items.pasteWidth, items.pasteHeight, items.width, items.height, items.scale)) {
			this.setPaste();
		}
		if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.actualWidth, items.actualHeight, items.scale)) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaGlobalAlpha
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.setDeltaGlobalAlpha = function(items) {
		items = my.safeObject(items);
		this.globalAlpha += items.globalAlpha || 0;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaRoll
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Cell.prototype.setDeltaRoll = function(items) {
		items = my.safeObject(items);
		this.roll += items.roll || 0;
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaActualHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setDeltaActualHeight_height = 0;
	my.Cell.prototype.setDeltaActualHeight = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		S.Cell_setDeltaActualHeight_height = my.xtGet(items.actualHeight, items.height);
		this.actualHeight = (my.isa(S.Cell_setDeltaActualHeight_height, 'num')) ? this.actualHeight + S.Cell_setDeltaActualHeight_height : this.actualHeight;
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaActualWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setDeltaActualWidth_width = 0;
	my.Cell.prototype.setDeltaActualWidth = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		S.Cell_setDeltaActualWidth_width = my.xtGet(items.actualWidth, items.width);
		this.actualWidth = (my.isa(S.Cell_setDeltaActualWidth_width, 'num')) ? this.actualWidth + S.Cell_setDeltaActualWidth_width : this.actualWidth;
		if (recalc) {
			this.setDimensions(items);
			my.ctx[this.context].getContextFromEngine(my.context[this.name]);
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaPasteHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setDeltaPasteHeight_height = 0;
	my.Cell.prototype.setDeltaPasteHeight = function(items, recalc) {
		var h;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		S.Cell_setDeltaPasteHeight_height = my.xtGet(items.pasteHeight, items.height);
		this.pasteHeight = (my.isa(this.pasteHeight, 'num')) ? this.pasteHeight + S.Cell_setDeltaPasteHeight_height : my.addPercentages(this.pasteHeight, S.Cell_setDeltaPasteHeight_height);
		if (recalc) {
			this.setPaste();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaCopyHeight
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaCopyHeight = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.copyHeight = (my.isa(this.copyHeight, 'num')) ? this.copyHeight + items.copyHeight : my.addPercentages(this.copyHeight, items.copyHeight);
		if (recalc) {
			this.setCopy();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaPasteWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setDeltaPasteWidth_width = 0;
	my.Cell.prototype.setDeltaPasteWidth = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		S.Cell_setDeltaPasteWidth_width = my.xtGet(items.pasteWidth, items.width);
		this.pasteWidth = (my.isa(this.pasteWidth, 'num')) ? this.pasteWidth + S.Cell_setDeltaPasteWidth_width : my.addPercentages(this.pasteWidth, S.Cell_setDeltaPasteWidth_width);
		if (recalc) {
			this.setPaste();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaCopyWidth
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	my.Cell.prototype.setDeltaCopyWidth = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		this.copyWidth = (my.isa(this.copyWidth, 'num')) ? this.copyWidth + items.copyWidth : my.addPercentages(this.copyWidth, items.copyWidth);
		if (recalc) {
			this.setCopy();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaPaste
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setDeltaPaste_temp = null; //raw object
	S.Cell_setDeltaPaste_x = 0;
	S.Cell_setDeltaPaste_y = 0;
	my.Cell.prototype.setDeltaPaste = function(items, recalc) {
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		S.Cell_setDeltaPaste_temp = my.safeObject(items.paste);
		S.Cell_setDeltaPaste_x = my.xtGet(items.pasteX, S.Cell_setDeltaPaste_temp.x, 0);
		S.Cell_setDeltaPaste_y = my.xtGet(items.pasteY, S.Cell_setDeltaPaste_temp.y, 0);
		this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + S.Cell_setDeltaPaste_x : my.addPercentages(this.start.x, S.Cell_setDeltaPaste_x);
		this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + S.Cell_setDeltaPaste_y : my.addPercentages(this.start.y, S.Cell_setDeltaPaste_y);
		if (recalc) {
			this.setPaste();
		}
		return this;
	};
	/**
Adds the value of each attribute supplied in the argument to existing values

Augments Cell.setDelta
@method setDeltaCopy
@param {Object} items Object consisting of key:value attributes
@param {Boolean} recalc When true (default), triggers variable recalculation
@return This
@chainable
**/
	S.Cell_setDeltaCopy_temp = null; //raw object
	S.Cell_setDeltaCopy_x = 0;
	S.Cell_setDeltaCopy_y = 0;
	my.Cell.prototype.setDeltaCopy = function(items, recalc) {
		items = my.safeObject(items);
		S.Cell_setDeltaCopy_temp = my.safeObject(items.copy);
		recalc = my.xtGet(recalc, true);
		S.Cell_setDeltaCopy_x = my.xtGet(items.copyX, S.Cell_setDeltaCopy_temp.x, 0);
		S.Cell_setDeltaCopy_y = my.xtGet(items.copyY, S.Cell_setDeltaCopy_temp.y, 0);
		this.copy.x = (my.isa(S.Cell_setDeltaCopy_x, 'num')) ? this.copy.x + S.Cell_setDeltaCopy_x : my.addPercentages(this.copy.x, S.Cell_setDeltaCopy_x);
		this.copy.y = (my.isa(S.Cell_setDeltaCopy_y, 'num')) ? this.copy.y + S.Cell_setDeltaCopy_y : my.addPercentages(this.copy.y, S.Cell_setDeltaCopy_y);
		if (recalc) {
			this.setCopy();
		}
		return this;
	};
	/**
Set the Cell's &lt;canvas&gt; element's context engine to the specification supplied by the entity about to be drawn on the canvas
@method setEngine
@param {Entity} entity Entity object
@return Entity object
@private
**/
	S.Cell_setEngine_cellContext = null; //scrawl Context object
	S.Cell_setEngine_entityContext = null; //scrawl Context object
	S.Cell_setEngine_cellEngine = null; //DOM canvas context object
	S.Cell_setEngine_fillStyle = '';
	S.Cell_setEngine_strokeStyle = '';
	S.Cell_setEngine_design = null; //scrawl Design object
	S.Cell_setEngine_changes = null; //raw object
	S.stat_designTypes = ['Gradient', 'RadialGradient', 'Pattern'];
	my.Cell.prototype.setEngine = function(entity) {

		if (!entity.fastStamp) {
			S.Cell_setEngine_cellContext = my.ctx[this.context];
			S.Cell_setEngine_entityContext = my.ctx[entity.context];
			S.Cell_setEngine_changes = S.Cell_setEngine_entityContext.getChanges(S.Cell_setEngine_cellContext, entity.scale, entity.scaleOutline);
			if (S.Cell_setEngine_changes) {
				delete S.Cell_setEngine_changes.count;
				S.Cell_setEngine_cellEngine = my.context[this.name];
				for (var item in S.Cell_setEngine_changes) {
					S.Cell_setEngine_design = false;
					if (item[0] < 'm') {
						if (item[0] < 'l') {
							switch (item) {
								case 'fillStyle':
									if (my.xt(my.design[S.Cell_setEngine_changes[item]])) {
										S.Cell_setEngine_design = my.design[S.Cell_setEngine_changes[item]];
										if (my.contains(S.stat_designTypes, S.Cell_setEngine_design.type)) {
											S.Cell_setEngine_design.update(entity.name, this.name);
										}
										S.Cell_setEngine_fillStyle = S.Cell_setEngine_design.getData();
									}
									else {
										S.Cell_setEngine_fillStyle = S.Cell_setEngine_changes[item];
									}
									S.Cell_setEngine_cellEngine.fillStyle = S.Cell_setEngine_fillStyle;
									break;
								case 'font':
									S.Cell_setEngine_cellEngine.font = S.Cell_setEngine_changes[item];
									break;
								case 'globalAlpha':
									S.Cell_setEngine_cellEngine.globalAlpha = S.Cell_setEngine_changes[item];
									break;
								case 'globalCompositeOperation':
									S.Cell_setEngine_cellEngine.globalCompositeOperation = S.Cell_setEngine_changes[item];
									break;
							}
						}
						else {
							switch (item) {
								case 'lineCap':
									S.Cell_setEngine_cellEngine.lineCap = S.Cell_setEngine_changes[item];
									break;
								case 'lineDash':
									S.Cell_setEngine_cellEngine.mozDash = S.Cell_setEngine_changes[item];
									S.Cell_setEngine_cellEngine.lineDash = S.Cell_setEngine_changes[item];
									try {
										S.Cell_setEngine_cellEngine.setLineDash(S.Cell_setEngine_changes[item]);
									}
									catch (e) {}
									break;
								case 'lineDashOffset':
									S.Cell_setEngine_cellEngine.mozDashOffset = S.Cell_setEngine_changes[item];
									S.Cell_setEngine_cellEngine.lineDashOffset = S.Cell_setEngine_changes[item];
									break;
								case 'lineJoin':
									S.Cell_setEngine_cellEngine.lineJoin = S.Cell_setEngine_changes[item];
									break;
								case 'lineWidth':
									S.Cell_setEngine_cellEngine.lineWidth = S.Cell_setEngine_changes[item];
									break;
							}
						}
					}
					else {
						if (item[0] == 's') {
							switch (item) {
								case 'shadowBlur':
									S.Cell_setEngine_cellEngine.shadowBlur = S.Cell_setEngine_changes[item];
									break;
								case 'shadowColor':
									S.Cell_setEngine_cellEngine.shadowColor = S.Cell_setEngine_changes[item];
									break;
								case 'shadowOffsetX':
									S.Cell_setEngine_cellEngine.shadowOffsetX = S.Cell_setEngine_changes[item];
									break;
								case 'shadowOffsetY':
									S.Cell_setEngine_cellEngine.shadowOffsetY = S.Cell_setEngine_changes[item];
									break;
								case 'strokeStyle':
									if (my.xt(my.design[S.Cell_setEngine_changes[item]])) {
										S.Cell_setEngine_design = my.design[S.Cell_setEngine_changes[item]];
										if (my.contains(S.stat_designTypes, S.Cell_setEngine_design.type)) {
											S.Cell_setEngine_design.update(entity.name, this.name);
										}
										S.Cell_setEngine_strokeStyle = S.Cell_setEngine_design.getData();
									}
									else {
										S.Cell_setEngine_strokeStyle = S.Cell_setEngine_changes[item];
									}
									S.Cell_setEngine_cellEngine.strokeStyle = S.Cell_setEngine_strokeStyle;
									break;
							}
						}
						else {
							switch (item) {
								case 'miterLimit':
									S.Cell_setEngine_cellEngine.miterLimit = S.Cell_setEngine_changes[item];
									break;
								case 'textAlign':
									S.Cell_setEngine_cellEngine.textAlign = S.Cell_setEngine_changes[item];
									break;
								case 'textBaseline':
									S.Cell_setEngine_cellEngine.textBaseline = S.Cell_setEngine_changes[item];
									break;
								case 'winding':
									S.Cell_setEngine_cellEngine.mozFillRule = S.Cell_setEngine_changes[item];
									S.Cell_setEngine_cellEngine.msFillRule = S.Cell_setEngine_changes[item];
									break;
							}
						}
					}
					S.Cell_setEngine_cellContext[item] = S.Cell_setEngine_changes[item];
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
	S.Cell_clear_cellContext = null; //scrawl Context object
	S.Cell_clear_cellEngine = null; //DOM canvas context object
	my.Cell.prototype.clear = function() {
		S.Cell_clear_cellEngine = my.context[this.name];
		S.Cell_clear_cellContext = my.ctx[this.context];
		S.Cell_clear_cellEngine.setTransform(1, 0, 0, 1, 0, 0);
		S.Cell_clear_cellEngine.clearRect(0, 0, this.actualWidth, this.actualHeight);
		if (this.backgroundColor !== 'rgba(0,0,0,0)') {
			S.Cell_clear_cellEngine.fillStyle = this.backgroundColor;
			S.Cell_clear_cellEngine.fillRect(0, 0, this.actualWidth, this.actualHeight);
			S.Cell_clear_cellContext.fillStyle = this.backgroundColor;
		}
		return this;
	};
	/**
Prepare to draw entitys onto the Cell's &lt;canvas&gt; element, in line with the Cell's group Array

(This function is replaced by the Filters module)
@method compile
@return This
@chainable
**/
	S.Cell_compile_group = null; //scrawl Group object
	S.Cell_compile_i = 0;
	S.Cell_compile_iz = 0;
	my.Cell.prototype.compile = function() {
		this.groups.sort(function(a, b) {
			return my.group[a].order - my.group[b].order;
		});
		for (S.Cell_compile_i = 0, S.Cell_compile_iz = this.groups.length; S.Cell_compile_i < S.Cell_compile_iz; S.Cell_compile_i++) {
			S.Cell_compile_group = my.group[this.groups[S.Cell_compile_i]];
			if (S.Cell_compile_group.get('visibility')) {
				S.Cell_compile_group.stamp(false, this.name);
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
	S.Cell_rotateDestination_reverse = 0;
	S.Cell_rotateDestination_upend = 0;
	S.Cell_rotateDestination_rotation = 0;
	S.Cell_rotateDestination_cos = 0;
	S.Cell_rotateDestination_sin = 0;
	my.Cell.prototype.rotateDestination = function(engine) {
		S.Cell_rotateDestination_reverse = (this.flipReverse) ? -1 : 1;
		S.Cell_rotateDestination_upend = (this.flipUpend) ? -1 : 1;
		S.Cell_rotateDestination_rotation = (this.addPathRoll) ? (this.roll + this.pathRoll) * my.radian : this.roll * my.radian;
		S.Cell_rotateDestination_cos = Math.cos(S.Cell_rotateDestination_rotation);
		S.Cell_rotateDestination_sin = Math.sin(S.Cell_rotateDestination_rotation);
		engine.setTransform((S.Cell_rotateDestination_cos * S.Cell_rotateDestination_reverse), (S.Cell_rotateDestination_sin * S.Cell_rotateDestination_reverse), (-S.Cell_rotateDestination_sin * S.Cell_rotateDestination_upend), (S.Cell_rotateDestination_cos * S.Cell_rotateDestination_upend), this.pasteData.x, this.pasteData.y);
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
			this.offset.x = Math.floor(this.offset.x);
			this.offset.y = Math.floor(this.offset.y);
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
		this.copyData.x = Math.floor(this.copyData.x);
		this.copyData.y = Math.floor(this.copyData.y);
		this.copyData.w = Math.floor(this.copyData.w);
		this.copyData.h = Math.floor(this.copyData.h);
		return this;
	};
	/**
Cell.setPaste update pasteData object values
@method setPaste
@chainable
@private
**/
	S.Cell_setPaste_pad = null; //scrawl Pad object
	S.Cell_setPaste_width = 0;
	S.Cell_setPaste_height = 0;
	my.Cell.prototype.setPaste = function() {
		S.Cell_setPaste_pad = my.pad[this.pad];
		S.Cell_setPaste_width = S.Cell_setPaste_pad.localWidth;
		S.Cell_setPaste_height = S.Cell_setPaste_pad.localHeight;
		this.pasteData.x = this.start.x;
		if (my.isa(this.pasteData.x, 'str')) {
			this.pasteData.x = this.convertX(this.pasteData.x, S.Cell_setPaste_width);
		}
		this.pasteData.y = this.start.y;
		if (my.isa(this.pasteData.y, 'str')) {
			this.pasteData.y = this.convertY(this.pasteData.y, S.Cell_setPaste_height);
		}
		this.pasteData.w = this.pasteWidth;
		if (my.isa(this.pasteData.w, 'str')) {
			this.pasteData.w = this.convertX(this.pasteData.w, S.Cell_setPaste_width);
		}
		this.pasteData.w *= this.scale;
		this.pasteData.h = this.pasteHeight;
		if (my.isa(this.pasteData.h, 'str')) {
			this.pasteData.h = this.convertY(this.pasteData.h, S.Cell_setPaste_height);
		}
		this.pasteData.h *= this.scale;
		if (this.pasteData.w < 1) {
			this.pasteData.w = 1;
		}
		if (this.pasteData.h < 1) {
			this.pasteData.h = 1;
		}
		this.pasteData.x = Math.floor(this.pasteData.x);
		this.pasteData.y = Math.floor(this.pasteData.y);
		this.pasteData.w = Math.floor(this.pasteData.w);
		this.pasteData.h = Math.floor(this.pasteData.h);
		return this;
	};
	/**
Cell copy helper function
@method copyCellToSelf
@param {String} cell CELLNAME of cell to be copied onto this cell's &lt;canvas&gt; element
@return This
@chainable
@private
**/
	S.Cell_copyCellToSelf_destinationContext = null; //scrawl Context object
	S.Cell_copyCellToSelf_destinationEngine = null; //DOM canvas context object
	S.Cell_copyCellToSelf_sourceContext = null; //scrawl Context object
	S.Cell_copyCellToSelf_sourceEngine = null; //DOM canvas context object
	S.Cell_copyCellToSelf_sourceCanvas = null; //DOM canvas object
	my.Cell.prototype.copyCellToSelf = function(cell) {
		cell = (my.isa(cell, 'str')) ? my.cell[cell] : cell;
		if (my.xt(cell)) {
			S.Cell_copyCellToSelf_destinationEngine = my.context[this.name];
			S.Cell_copyCellToSelf_destinationContext = my.ctx[this.name];
			S.Cell_copyCellToSelf_sourceEngine = my.context[cell.name];
			S.Cell_copyCellToSelf_sourceContext = my.ctx[cell.name];
			S.Cell_copyCellToSelf_sourceCanvas = my.canvas[cell.name];
			if (S.Cell_copyCellToSelf_sourceContext.globalAlpha !== S.Cell_copyCellToSelf_destinationContext.globalAlpha) {
				S.Cell_copyCellToSelf_destinationEngine.globalAlpha = S.Cell_copyCellToSelf_sourceContext.globalAlpha;
				S.Cell_copyCellToSelf_destinationContext.globalAlpha = S.Cell_copyCellToSelf_sourceContext.globalAlpha;
			}
			if (S.Cell_copyCellToSelf_sourceContext.globalCompositeOperation !== S.Cell_copyCellToSelf_destinationContext.globalCompositeOperation) {
				S.Cell_copyCellToSelf_destinationEngine.globalCompositeOperation = S.Cell_copyCellToSelf_sourceContext.globalCompositeOperation;
				S.Cell_copyCellToSelf_destinationContext.globalCompositeOperation = S.Cell_copyCellToSelf_sourceContext.globalCompositeOperation;
			}
			S.Cell_copyCellToSelf_sourceEngine.setTransform(1, 0, 0, 1, 0, 0);
			cell.prepareToCopyCell(S.Cell_copyCellToSelf_destinationEngine);
			S.Cell_copyCellToSelf_destinationEngine.drawImage(S.Cell_copyCellToSelf_sourceCanvas, cell.copyData.x, cell.copyData.y, cell.copyData.w, cell.copyData.h, cell.offset.x, cell.offset.y, cell.pasteData.w, cell.pasteData.h);
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
	S.Cell_clearShadow_context = null; //scrawl Context object
	S.Cell_clearShadow_engine = null; //DOM canvas context object
	my.Cell.prototype.clearShadow = function() {
		S.Cell_clearShadow_engine = my.context[this.name];
		S.Cell_clearShadow_context = my.ctx[this.context];
		S.Cell_clearShadow_engine.shadowOffsetX = 0.0;
		S.Cell_clearShadow_engine.shadowOffsetY = 0.0;
		S.Cell_clearShadow_engine.shadowBlur = 0.0;
		S.Cell_clearShadow_context.shadowOffsetX = 0.0;
		S.Cell_clearShadow_context.shadowOffsetY = 0.0;
		S.Cell_clearShadow_context.shadowBlur = 0.0;
		return this;
	};
	/**
Entity stamp helper function
@method restoreShadow
@return This
@chainable
@private
**/
	S.Cell_restoreShadow_cellContext = null; //scrawl Context object
	S.Cell_restoreShadow_entityContext = null; //scrawl Context object
	S.Cell_restoreShadow_engine = null; //DOM canvas context object
	my.Cell.prototype.restoreShadow = function(entitycontext) {
		S.Cell_restoreShadow_engine = my.context[this.name];
		S.Cell_restoreShadow_cellContext = my.ctx[this.context];
		S.Cell_restoreShadow_entityContext = my.ctx[entitycontext];
		S.Cell_restoreShadow_engine.shadowOffsetX = S.Cell_restoreShadow_entityContext.shadowOffsetX;
		S.Cell_restoreShadow_engine.shadowOffsetY = S.Cell_restoreShadow_entityContext.shadowOffsetY;
		S.Cell_restoreShadow_engine.shadowBlur = S.Cell_restoreShadow_entityContext.shadowBlur;
		S.Cell_restoreShadow_cellContext.shadowOffsetX = S.Cell_restoreShadow_entityContext.shadowOffsetX;
		S.Cell_restoreShadow_cellContext.shadowOffsetY = S.Cell_restoreShadow_entityContext.shadowOffsetY;
		S.Cell_restoreShadow_cellContext.shadowBlur = S.Cell_restoreShadow_entityContext.shadowBlur;
		return this;
	};
	/**
Entity stamp helper function
@method setToClearShape
@return This
@chainable
@private
**/
	S.Cell_setToClearShape_context = null; //scrawl Context object
	S.Cell_setToClearShape_engine = null; //DOM canvas context object
	my.Cell.prototype.setToClearShape = function() {
		S.Cell_setToClearShape_engine = my.context[this.name];
		S.Cell_setToClearShape_context = my.ctx[this.context];
		S.Cell_setToClearShape_engine.fillStyle = 'rgba(0, 0, 0, 0)';
		S.Cell_setToClearShape_engine.strokeStyle = 'rgba(0, 0, 0, 0)';
		S.Cell_setToClearShape_engine.shadowColor = 'rgba(0, 0, 0, 0)';
		S.Cell_setToClearShape_context.fillStyle = 'rgba(0, 0, 0, 0)';
		S.Cell_setToClearShape_context.strokeStyle = 'rgba(0, 0, 0, 0)';
		S.Cell_setToClearShape_context.shadowColor = 'rgba(0, 0, 0, 0)';
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
	S.Cell_setDimensions_pad = null; //scrawl Pad object
	S.Cell_setDimensions_canvas = null; //DOM canvas object
	S.Cell_setDimensions_width = 0;
	S.Cell_setDimensions_height = 0;
	my.Cell.prototype.setDimensions = function(items) {
		S.Cell_setDimensions_pad = my.pad[this.pad];
		S.Cell_setDimensions_canvas = my.canvas[this.name];
		S.Cell_setDimensions_width = my.xtGet(items.width, items.actualWidth, this.actualWidth);
		S.Cell_setDimensions_height = my.xtGet(items.height, items.actualHeight, this.actualHeight);
		if (S.Cell_setDimensions_pad) {
			if (my.isa(S.Cell_setDimensions_width, 'str')) {
				S.Cell_setDimensions_width = (parseFloat(S.Cell_setDimensions_width) / 100) * (S.Cell_setDimensions_pad.localWidth / S.Cell_setDimensions_pad.scale);
			}
			if (my.isa(S.Cell_setDimensions_height, 'str')) {
				S.Cell_setDimensions_height = (parseFloat(S.Cell_setDimensions_height) / 100) * (S.Cell_setDimensions_pad.localHeight / S.Cell_setDimensions_pad.scale);
			}
		}
		S.Cell_setDimensions_canvas.width = S.Cell_setDimensions_width;
		S.Cell_setDimensions_canvas.height = S.Cell_setDimensions_height;
		this.actualWidth = S.Cell_setDimensions_width;
		this.actualHeight = S.Cell_setDimensions_height;
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
	S.Cell_getImageData_x = 0;
	S.Cell_getImageData_y = 0;
	S.Cell_getImageData_width = 0;
	S.Cell_getImageData_height = 0;
	S.Cell_getImageData_label = '';
	my.Cell.prototype.getImageData = function(dimensions) {
		dimensions = my.safeObject(dimensions);
		S.Cell_getImageData_label = (my.isa(dimensions.name, 'str')) ? this.name + '_' + dimensions.name : this.name + '_imageData';
		S.Cell_getImageData_x = my.xtGet(dimensions.x, 0);
		S.Cell_getImageData_y = my.xtGet(dimensions.y, 0);
		S.Cell_getImageData_width = my.xtGet(dimensions.width, this.actualWidth);
		S.Cell_getImageData_height = my.xtGet(dimensions.height, this.actualHeight);
		my.imageData[S.Cell_getImageData_label] = my.context[this.name].getImageData(S.Cell_getImageData_x, S.Cell_getImageData_y, S.Cell_getImageData_width, S.Cell_getImageData_height);
		return S.Cell_getImageData_label;
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
		textBaseline: 'alphabetic'
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
	S.Context_getContextFromEngine_i = 0;
	S.Context_getContextFromEngine_iz = 0;
	my.Context.prototype.getContextFromEngine = function(ctx) {
		for (S.Context_getContextFromEngine_i = 0, S.Context_getContextFromEngine_iz = my.contextKeys.length; S.Context_getContextFromEngine_i < S.Context_getContextFromEngine_iz; S.Context_getContextFromEngine_i++) {
			this[my.contextKeys[S.Context_getContextFromEngine_i]] = ctx[my.contextKeys[S.Context_getContextFromEngine_i]];
		}
		this.winding = my.xtGet(ctx.mozFillRule, ctx.msFillRule, 'nonzero');
		this.lineDash = (my.xt(ctx.lineDash)) ? ctx.lineDash : [];
		this.lineDashOffset = my.xtGet(ctx.mozDashOffset, ctx.lineDashOffset, 0);
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
	S.stat_contextGetChanges1 = ['lineWidth', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'];
	S.stat_contextGetChanges2 = ['fillStyle', 'strokeStyle', 'shadowColor'];
	S.stat_contextGetChanges3 = ['fillStyle', 'strokeStyle'];
	S.stat_contextGetChanges4 = ['lineDash'];
	S.stat_contextGetChanges5 = ['name', 'timestamp'];
	S.Context_getChanges_i = 0;
	S.Context_getChanges_iz = 0;
	S.Context_getChanges_j = 0;
	S.Context_getChanges_jz = 0;
	S.Context_getChanges_count = 0;
	S.Context_getChanges_temp = '';
	S.Context_getChanges_tempColor = '';
	S.Context_getChanges_return = null; //raw object
	my.Context.prototype.getChanges = function(ctx, scale, doscale) {
		S.Context_getChanges_return = {};
		S.Context_getChanges_count = 0;
		for (S.Context_getChanges_i = 0, S.Context_getChanges_iz = my.contextKeys.length; S.Context_getChanges_i < S.Context_getChanges_iz; S.Context_getChanges_i++) {
			S.Context_getChanges_temp = this.get(my.contextKeys[S.Context_getChanges_i]);
			//handle scalable items
			if (my.contains(S.stat_contextGetChanges1, my.contextKeys[S.Context_getChanges_i])) {
				if (doscale) {
					if (S.Context_getChanges_temp * scale !== ctx[my.contextKeys[S.Context_getChanges_i]]) {
						S.Context_getChanges_return[my.contextKeys[S.Context_getChanges_i]] = S.Context_getChanges_temp * scale;
						S.Context_getChanges_count++;
					}
				}
				else {
					if (S.Context_getChanges_temp !== ctx[my.contextKeys[S.Context_getChanges_i]]) {
						S.Context_getChanges_return[my.contextKeys[S.Context_getChanges_i]] = S.Context_getChanges_temp;
						S.Context_getChanges_count++;
					}
				}
			}
			//handle fillStyle, strokeStyle, shadowColor that use Color design objects
			else if (my.contains(S.stat_contextGetChanges2, my.contextKeys[S.Context_getChanges_i]) && my.design[S.Context_getChanges_temp] && my.design[S.Context_getChanges_temp].type === 'Color') {
				S.Context_getChanges_tempColor = my.design[S.Context_getChanges_temp].getData();
				if (S.Context_getChanges_tempColor !== ctx[my.contextKeys[S.Context_getChanges_i]]) {
					S.Context_getChanges_return[my.contextKeys[S.Context_getChanges_i]] = S.Context_getChanges_tempColor;
					S.Context_getChanges_count++;
				}
			}
			//handle fillStyle, strokeStyle that use RadialGradient, Gradient design objects
			else if (my.contains(S.stat_contextGetChanges3, my.contextKeys[S.Context_getChanges_i]) && my.design[S.Context_getChanges_temp] && my.contains(S.stat_designTypes, my.design[S.Context_getChanges_temp].type) && my.design[S.Context_getChanges_temp].autoUpdate) {
				S.Context_getChanges_return[my.contextKeys[S.Context_getChanges_i]] = S.Context_getChanges_temp;
				S.Context_getChanges_count++;
			}
			//handle linedash - an array that needs deep inspection to check for difference
			else if (my.contains(S.stat_contextGetChanges4, my.contextKeys[S.Context_getChanges_i]) && my.xt(ctx.lineDash)) {
				if (S.Context_getChanges_temp.length !== ctx.lineDash.length) {
					S.Context_getChanges_return.lineDash = S.Context_getChanges_temp;
					S.Context_getChanges_count++;
				}
				else {
					for (S.Context_getChanges_j = 0, S.Context_getChanges_jz = S.Context_getChanges_temp.length; S.Context_getChanges_j < S.Context_getChanges_jz; S.Context_getChanges_j++) {
						if (S.Context_getChanges_temp[S.Context_getChanges_j] !== ctx.lineDash[S.Context_getChanges_j]) {
							S.Context_getChanges_return.lineDash = S.Context_getChanges_temp;
							S.Context_getChanges_count++;
							break;
						}
					}
				}
			}
			//exclude items that have no equivalent in the context engine
			else if (my.contains(S.stat_contextGetChanges5, my.contextKeys[S.Context_getChanges_i])) {}
			//capture all other changes
			else {
				if (S.Context_getChanges_temp !== ctx[my.contextKeys[S.Context_getChanges_i]]) {
					S.Context_getChanges_return[my.contextKeys[S.Context_getChanges_i]] = S.Context_getChanges_temp;
					S.Context_getChanges_count++;
				}
			}
		}
		return (S.Context_getChanges_count > 0) ? S.Context_getChanges_return : false;
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
		this.order = my.xtGet(items.order, 0);
		this.visibility = my.xtGet(items.visibility, true);
		this.entitySort = my.xtGet(items.entitySort, true);
		this.regionRadius = my.xtGet(items.regionRadius, 0);
		my.group[this.name] = this;
		this.filtersGroupInit(items);
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
		regionRadius: 0
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
	S.Group_forceStamp_visibility = false;
	my.Group.prototype.forceStamp = function(method, cell) {
		S.Group_forceStamp_visibility = this.visibility;
		if (!S.Group_forceStamp_visibility) {
			this.set({
				visibility: true
			});
		}
		this.stamp(method, cell);
		this.set({
			visibility: S.Group_forceStamp_visibility
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
	S.Group_stamp_entity = null; //scrawl Entity object
	S.Group_stamp_i = 0;
	S.Group_stamp_iz = 0;
	my.Group.prototype.stamp = function(method, cell) {
		if (this.visibility) {
			this.sortEntitys();
			for (S.Group_stamp_i = 0, S.Group_stamp_iz = this.entitys.length; S.Group_stamp_i < S.Group_stamp_iz; S.Group_stamp_i++) {
				S.Group_stamp_entity = my.entity[this.entitys[S.Group_stamp_i]];
				S.Group_stamp_entity.group = this.name;
				S.Group_stamp_entity.stamp(method, cell);
			}
			this.stampFilter(my.context[this.cell], this.cell);
		}
		return this;
	};
	/**
Group constructor hook helper function

(Replaced by Filters module)
@method filtersGroupInit
@private
**/
	my.Group.prototype.filtersGroupInit = function() {};
	/**
Group stamp helper function

(Replaced by Filters module)
@method stampFilter
@private
**/
	my.Group.prototype.stampFilter = function() {};
	/**
Add entitys to the Group
@method addEntitysToGroup
@param {Array} item Array of SPRITENAME Strings; alternatively, a single SPRITENAME String can be supplied as the argument
@return This
@chainable
**/
	S.Group_addEntitysToGroup_slice = [];
	S.Group_addEntitysToGroup_i = 0;
	S.Group_addEntitysToGroup_iz = 0;
	S.Group_addEntitysToGroup_e = null; //mixed
	my.Group.prototype.addEntitysToGroup = function() {
		S.Group_addEntitysToGroup_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.Group_addEntitysToGroup_slice[0])) {
			S.Group_addEntitysToGroup_slice = S.Group_addEntitysToGroup_slice[0];
		}
		for (S.Group_addEntitysToGroup_i = 0, S.Group_addEntitysToGroup_iz = S.Group_addEntitysToGroup_slice.length; S.Group_addEntitysToGroup_i < S.Group_addEntitysToGroup_iz; S.Group_addEntitysToGroup_i++) {
			S.Group_addEntitysToGroup_e = S.Group_addEntitysToGroup_slice[S.Group_addEntitysToGroup_i];
			if (my.xt(S.Group_addEntitysToGroup_e)) {
				if (my.isa(S.Group_addEntitysToGroup_e, 'str')) {
					my.pushUnique(this.entitys, S.Group_addEntitysToGroup_e);
				}
				else {
					if (my.xt(S.Group_addEntitysToGroup_e.name)) {
						my.pushUnique(this.entitys, S.Group_addEntitysToGroup_e.name);
					}
				}
			}
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
	S.Group_removeEntitysFromGroup_slice = [];
	S.Group_removeEntitysFromGroup_i = 0;
	S.Group_removeEntitysFromGroup_iz = 0;
	S.Group_removeEntitysFromGroup_e = null; //mixed
	my.Group.prototype.removeEntitysFromGroup = function() {
		S.Group_removeEntitysFromGroup_slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(S.Group_removeEntitysFromGroup_slice[0])) {
			S.Group_removeEntitysFromGroup_slice = S.Group_removeEntitysFromGroup_slice[0];
		}
		for (S.Group_removeEntitysFromGroup_i = 0, S.Group_removeEntitysFromGroup_iz = S.Group_addEntitysToGroup_slice.length; S.Group_removeEntitysFromGroup_i < S.Group_removeEntitysFromGroup_iz; S.Group_removeEntitysFromGroup_i++) {
			S.Group_removeEntitysFromGroup_e = S.Group_addEntitysToGroup_slice[S.Group_removeEntitysFromGroup_i];
			if (my.xt(S.Group_removeEntitysFromGroup_e)) {
				if (my.isa(S.Group_removeEntitysFromGroup_e, 'str')) {
					my.removeItem(this.entitys, S.Group_removeEntitysFromGroup_e);
				}
				else {
					if (my.xt(S.Group_removeEntitysFromGroup_e.name)) {
						my.removeItem(this.entitys, S.Group_removeEntitysFromGroup_e.name);
					}
				}
			}
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
	S.Group_updateEntitysBy_i = 0;
	S.Group_updateEntitysBy_iz = 0;
	my.Group.prototype.updateEntitysBy = function(items) {
		items = my.safeObject(items);
		for (S.Group_updateEntitysBy_i = 0, S.Group_updateEntitysBy_iz = this.entitys.length; S.Group_updateEntitysBy_i < S.Group_updateEntitysBy_iz; S.Group_updateEntitysBy_i++) {
			my.entity[this.entitys[S.Group_updateEntitysBy_i]].setDelta({
				startX: my.xtGet(items.x, items.startX, 0),
				startY: my.xtGet(items.y, items.startY, 0),
				scale: my.xtGet(items.scale, 0),
				roll: my.xtGet(items.roll, 0)
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
	S.Group_setEntitysTo_i = 0;
	S.Group_setEntitysTo_iz = 0;
	my.Group.prototype.setEntitysTo = function(items) {
		for (S.Group_setEntitysTo_i = 0, S.Group_setEntitysTo_iz = this.entitys.length; S.Group_setEntitysTo_i < S.Group_setEntitysTo_iz; S.Group_setEntitysTo_i++) {
			my.entity[this.entitys[S.Group_setEntitysTo_i]].set(items);
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
	S.Group_pivotEntitysTo_pivot = null; //scrawl object
	S.Group_pivotEntitysTo_pivotVector = null; //scrawl Vector object
	S.Group_pivotEntitysTo_entity = null; //scrawl Entity object
	S.Group_pivotEntitysTo_entityVector = null; //scrawl Vector object
	S.Group_pivotEntitysTo_i = 0;
	S.Group_pivotEntitysTo_iz = 0;
	my.Group.prototype.pivotEntitysTo = function(item) {
		item = (my.isa(item, 'str')) ? item : false;
		if (item) {
			S.Group_pivotEntitysTo_pivot = my.entity[item] || my.point[item] || false;
			if (S.Group_pivotEntitysTo_pivot) {
				S.Group_pivotEntitysTo_pivotVector = (S.Group_pivotEntitysTo_pivot.type === 'Point') ? S.Group_pivotEntitysTo_pivot.local : S.Group_pivotEntitysTo_pivot.start;
				for (S.Group_pivotEntitysTo_i = 0, S.Group_pivotEntitysTo_iz = this.entitys.length; S.Group_pivotEntitysTo_i < S.Group_pivotEntitysTo_iz; S.Group_pivotEntitysTo_i++) {
					S.Group_pivotEntitysTo_entity = my.entity[this.entitys[S.Group_pivotEntitysTo_i]];
					S.Group_pivotEntitysTo_entityVector = my.v.set(entity.start);
					S.Group_pivotEntitysTo_entityVector.vectorSubtract(S.Group_pivotEntitysTo_pivotVector);
					S.Group_pivotEntitysTo_entity.set({
						pivot: item,
						handleX: -S.Group_pivotEntitysTo_entityVector.x,
						handleY: -S.Group_pivotEntitysTo_entityVector.y
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
	S.Group_getEntityAt_entity = null; //scrawl Entity object
	S.Group_getEntityAt_vector = null; //scrawl Vector object
	S.Group_getEntityAt_coordinate = null; //scrawl Vector object
	S.Group_getEntityAt_i = 0;
	my.Group.prototype.getEntityAt = function(items) {
		items = my.safeObject(items);
		S.Group_getEntityAt_coordinate = my.v.set(items);
		S.Group_getEntityAt_coordinate = my.Position.prototype.correctCoordinates(S.Group_getEntityAt_coordinate, this.cell);
		this.sortEntitys();
		for (S.Group_getEntityAt_i = this.entitys.length - 1; S.Group_getEntityAt_i >= 0; S.Group_getEntityAt_i--) {
			S.Group_getEntityAt_entity = my.entity[this.entitys[S.Group_getEntityAt_i]];
			if (this.regionRadius) {
				S.Group_getEntityAt_entity.resetWork();
				S.Group_getEntityAt_vector = S.Group_getEntityAt_entity.work.start.vectorSubtract(S.Group_getEntityAt_coordinate);
				if (S.Group_getEntityAt_vector.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (S.Group_getEntityAt_entity.checkHit(S.Group_getEntityAt_coordinate)) {
				return S.Group_getEntityAt_entity;
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
	S.Group_getAllEntitysAt_entity = null; //scrawl Entity object
	S.Group_getAllEntitysAt_vector = null; //scrawl Vector object
	S.Group_getAllEntitysAt_coordinate = null; //scrawl Vector object
	S.Group_getAllEntitysAt_results = [];
	S.Group_getAllEntitysAt_i = 0;
	my.Group.prototype.getAllEntitysAt = function(items) {
		items = my.safeObject(items);
		S.Group_getAllEntitysAt_coordinate = my.v.set(items);
		S.Group_getAllEntitysAt_results = [];
		S.Group_getAllEntitysAt_coordinate = my.Position.prototype.correctCoordinates(S.Group_getAllEntitysAt_coordinate, this.cell);
		this.sortEntitys();
		for (S.Group_getAllEntitysAt_i = this.entitys.length - 1; S.Group_getAllEntitysAt_i >= 0; S.Group_getAllEntitysAt_i--) {
			S.Group_getAllEntitysAt_entity = my.entity[this.entitys[S.Group_getAllEntitysAt_i]];
			if (this.regionRadius) {
				S.Group_getAllEntitysAt_entity.resetWork();
				S.Group_getAllEntitysAt_vector = S.Group_getAllEntitysAt_entity.work.start.vectorSubtract(S.Group_getAllEntitysAt_coordinate);
				if (S.Group_getAllEntitysAt_vector.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (S.Group_getAllEntitysAt_entity.checkHit(S.Group_getAllEntitysAt_coordinate)) {
				S.Group_getAllEntitysAt_results.push(S.Group_getAllEntitysAt_entity);
			}
		}
		return (S.Group_getAllEntitysAt_results.length > 0) ? S.Group_getAllEntitysAt_results : false;
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
		this.fastStamp = my.xtGet(items.fastStamp, false);
		this.scaleOutline = my.xtGet(items.scaleOutline, true);
		this.order = my.xtGet(items.order, 0);
		this.visibility = my.xtGet(items.visibility, true);
		this.method = my.xtGet(items.method, my.d[this.type].method);
		this.collisionsEntityConstructor(items);
		this.filtersEntityInit(items);
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
		group: ''
	};
	my.mergeInto(my.d.Entity, my.d.Position);
	/**
Entity constructor hook function - modified by filters module
@method filtersEntityInit
@private
**/
	my.Entity.prototype.filtersEntityInit = function(items) {};
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
	my.Entity.prototype.registerInLibrary = function(items) {
		my.entity[this.name] = this;
		my.pushUnique(my.entitynames, this.name);
		my.group[this.group].addEntitysToGroup(this.name);
		this.collisionsEntityRegisterInLibrary(items);
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
		if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.radius, items.scale)) {
			this.offset.flag = false;
		}
		return this;
	};
	/**
Entity.set hook function - modified by collisions module
@method collisionsEntitySet
@private
**/
	my.Entity.prototype.collisionsEntitySet = function() {};
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
		if (my.xto(items.lineDashOffset, items.lineWidth, items.globalAlpha)) {
			my.ctx[this.context].setDelta(items);
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
		if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.pasteWidth, items.pasteHeight, items.radius, items.scale)) {
			this.offset.flag = false;
		}
		this.collisionsEntitySetDelta(items);
		return this;
	};
	/**
Entity.setDelta hook function - modified by collisions module
@method collisionsEntitySetDelta
@private
**/
	my.Entity.prototype.collisionsEntitySetDelta = function() {};
	/**
Augments Position.clone()
@method clone
@param {Object} items Object consisting of key:value attributes, used to update the clone's attributes with new values
@return Cloned object
@chainable
**/
	S.Entity_clone_context = null; //raw object
	S.Entity_clone_enhancedItems = null; //raw object
	S.Entity_clone_clone = null; //scrawl Entity object
	my.Entity.prototype.clone = function(items) {
		items = my.safeObject(items);
		S.Entity_clone_context = JSON.parse(JSON.stringify(my.ctx[this.context]));
		delete S.Entity_clone_context.name;
		S.Entity_clone_enhancedItems = my.mergeInto(items, S.Entity_clone_context);
		delete S.Entity_clone_enhancedItems.context;
		S.Entity_clone_clone = my.Position.prototype.clone.call(this, S.Entity_clone_enhancedItems);
		if (my.xt(items.createNewContext) && !items.createNewContext) {
			delete my.ctx[S.Entity_clone_clone.context];
			my.removeItem(my.ctxnames, S.Entity_clone_clone.context);
			S.Entity_clone_clone.context = this.context;
		}
		return S.Entity_clone_clone;
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
		if (my.xt(items.group) && my.group[items.group]) {
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
		return my.cell[this.getGroup(items)];
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
	S.Entity_forceStamp_visibility = false;
	my.Entity.prototype.forceStamp = function(method, cell) {
		S.Entity_forceStamp_visibility = this.visibility;
		this.visibility = true;
		this.stamp(method, cell);
		this.visibility = S.Entity_forceStamp_visibility;
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
	S.Entity_stamp_cell = null; //scrawl Cell object
	S.Entity_stamp_engine = null; //DOM canvas context object
	S.Entity_stamp_method = '';
	my.Entity.prototype.stamp = function(method, cell) {
		if (this.visibility) {
			S.Entity_stamp_cell = my.cell[cell] || my.cell[my.group[this.group].cell];
			S.Entity_stamp_cell = S.Entity_stamp_cell.name;
			S.Entity_stamp_engine = my.context[S.Entity_stamp_cell];
			S.Entity_stamp_method = method || this.method;
			if (this.pivot) {
				this.setStampUsingPivot(S.Entity_stamp_cell);
			}
			else {
				this.pathStamp();
			}
			this.callMethod(S.Entity_stamp_engine, S.Entity_stamp_cell, S.Entity_stamp_method);
			this.stampFilter(S.Entity_stamp_engine, S.Entity_stamp_cell);
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
	S.Entity_callMethod_test = '';
	my.Entity.prototype.callMethod = function(engine, cell, method) {
		S.Entity_callMethod_test = method[0];
		if (S.Entity_callMethod_test < 'f') {
			if (S.Entity_callMethod_test === 'c') {
				switch (method) {
					case 'clear':
						this.clear(engine, cell);
						break;
					case 'clearWithBackground':
						this.clearWithBackground(engine, cell);
						break;
					case 'clip':
						this.clip(engine, cell);
						break;
				}
			}
			else {
				switch (method) {
					case 'draw':
						this.draw(engine, cell);
						break;
					case 'drawFill':
						this.drawFill(engine, cell);
						break;
				}
			}
		}
		else {
			if (S.Entity_callMethod_test === 'f') {
				switch (method) {
					case 'fill':
						this.fill(engine, cell);
						break;
					case 'fillDraw':
						this.fillDraw(engine, cell);
						break;
					case 'floatOver':
						this.floatOver(engine, cell);
						break;
				}
			}
			else {
				switch (method) {
					case 'none':
						this.none(engine, cell);
						break;
					case 'sinkInto':
						this.sinkInto(engine, cell);
						break;
				}
			}
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
	S.Entity_rotateCell_reverse = 0;
	S.Entity_rotateCell_upend = 0;
	S.Entity_rotateCell_rotation = 0;
	S.Entity_rotateCell_cos = 0;
	S.Entity_rotateCell_sin = 0;
	S.Entity_rotateCell_x = 0;
	S.Entity_rotateCell_y = 0;
	my.Entity.prototype.rotateCell = function(ctx, cell) {
		S.Entity_rotateCell_reverse = (this.flipReverse) ? -1 : 1;
		S.Entity_rotateCell_upend = (this.flipUpend) ? -1 : 1;
		S.Entity_rotateCell_rotation = (this.addPathRoll) ? (this.roll + this.pathRoll) * my.radian : this.roll * my.radian;
		S.Entity_rotateCell_cos = Math.cos(S.Entity_rotateCell_rotation);
		S.Entity_rotateCell_sin = Math.sin(S.Entity_rotateCell_rotation);
		S.Entity_rotateCell_x = this.start.x;
		S.Entity_rotateCell_y = this.start.y;
		if (typeof S.Entity_rotateCell_x === 'string') {
			S.Entity_rotateCell_x = this.convertX(S.Entity_rotateCell_x, cell);
		}
		if (typeof S.Entity_rotateCell_y === 'string') {
			S.Entity_rotateCell_y = this.convertY(S.Entity_rotateCell_y, cell);
		}
		ctx.setTransform((S.Entity_rotateCell_cos * S.Entity_rotateCell_reverse), (S.Entity_rotateCell_sin * S.Entity_rotateCell_reverse), (-S.Entity_rotateCell_sin * S.Entity_rotateCell_upend), (S.Entity_rotateCell_cos * S.Entity_rotateCell_upend), S.Entity_rotateCell_x, S.Entity_rotateCell_y);
		return this;
	};
	/**
Stamp helper function - convert string start.x values to numerical values
@method convertX
@param {String} x coordinate String
@param {String} cell reference cell name String; or alternatively DOM canvas object
@return Number - x value
@private
**/
	S.Entity_convertX_width = 0;
	my.Entity.prototype.convertX = function(x, cell) {
		switch (typeof cell) {
			case 'string':
				S.Entity_convertX_width = scrawl.cell[cell].actualWidth;
				break;
			case 'number':
				S.Entity_convertX_width = cell;
				break;
			default:
				S.Entity_convertX_width = cell.width;
		}
		switch (x) {
			case 'left':
				return 0;
			case 'right':
				return S.Entity_convertX_width;
			case 'center':
				return S.Entity_convertX_width / 2;
			default:
				x = parseFloat(x) / 100;
				return (isNaN(x)) ? 0 : x * S.Entity_convertX_width;
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
	S.Entity_convertY_height = 0;
	my.Entity.prototype.convertY = function(y, cell) {
		switch (typeof cell) {
			case 'string':
				S.Entity_convertY_height = scrawl.cell[cell].actualHeight;
				break;
			case 'number':
				S.Entity_convertY_height = cell;
				break;
			default:
				S.Entity_convertY_height = cell.height;
		}
		switch (y) {
			case 'top':
				return 0;
			case 'bottom':
				return S.Entity_convertY_height;
			case 'center':
				return S.Entity_convertY_height / 2;
			default:
				y = parseFloat(y) / 100;
				return (isNaN(y)) ? 0 : y * S.Entity_convertY_height;
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
	S.Entity_clearShadow_context = null; //scrawl Context object
	my.Entity.prototype.clearShadow = function(ctx, cell) {
		S.Entity_clearShadow_context = my.ctx[this.context];
		if (S.Entity_clearShadow_context.shadowOffsetX || S.Entity_clearShadow_context.shadowOffsetY || S.Entity_clearShadow_context.shadowBlur) {
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
	S.Entity_restoreShadow_context = null; //scrawl Context object
	my.Entity.prototype.restoreShadow = function(ctx, cell) {
		S.Entity_restoreShadow_context = my.ctx[this.context];
		if (S.Entity_restoreShadow_context.shadowOffsetX || S.Entity_restoreShadow_context.shadowOffsetY || S.Entity_restoreShadow_context.shadowBlur) {
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
	S.Entity_pickupEntity_cell = null; //scrawl Cell object
	S.Entity_pickupEntity_coordinate = null; //scrawl Vector object
	my.Entity.prototype.pickupEntity = function(items) {
		items = my.safeObject(items);
		S.Entity_pickupEntity_coordinate = my.v.set(items);
		S.Entity_pickupEntity_cell = my.cell[my.group[this.group].cell];
		S.Entity_pickupEntity_coordinate = this.correctCoordinates(S.Entity_pickupEntity_coordinate, S.Entity_pickupEntity_cell);
		this.oldX = S.Entity_pickupEntity_coordinate.x || 0;
		this.oldY = S.Entity_pickupEntity_coordinate.y || 0;
		this.realPivot = this.pivot;
		this.pivot = 'mouse';
		this.order += this.order + 9999;
		return this;
	};
	/**
Revert pickupEntity() actions, ensuring entity is left where the user drops it
@method dropEntity
@param {String} [items] Alternative pivot String
@return This
@chainable
**/
	S.Entity_dropEntity_order = 0;
	my.Entity.prototype.dropEntity = function(item) {
		S.Entity_dropEntity_order = this.order;
		this.set({
			pivot: my.xtGet(item, this.realPivot, false),
			order: (S.Entity_dropEntity_order >= 9999) ? S.Entity_dropEntity_order - 9999 : 0
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
	S.Entity_checkHit_tests = [];
	S.Entity_checkHit_here = null; //scrawl Vector object
	S.Entity_checkHit_result = false;
	S.Entity_checkHit_i = 0;
	S.Entity_checkHit_iz = 0;
	S.Entity_checkHit_width = 0;
	S.Entity_checkHit_height = 0;
	my.Entity.prototype.checkHit = function(items) {
		items = my.safeObject(items);
		if (my.xt(items.tests)) {
			S.Entity_checkHit_tests = items.tests;
		}
		else {
			S.Entity_checkHit_tests.length = 0;
			S.Entity_checkHit_tests.push(items.x || 0);
			S.Entity_checkHit_tests.push(items.y || 0);
		}
		this.rotateCell(my.cvx, this.getEntityCell().name);
		S.Entity_checkHit_here = this.prepareStamp();
		S.Entity_checkHit_width = (this.localWidth) ? this.localWidth : this.width * this.scale;
		S.Entity_checkHit_height = (this.localHeight) ? this.localHeight : this.height * this.scale;
		my.cvx.beginPath();
		my.cvx.rect(S.Entity_checkHit_here.x, S.Entity_checkHit_here.y, S.Entity_checkHit_width, S.Entity_checkHit_height);
		for (S.Entity_checkHit_i = 0, S.Entity_checkHit_iz = S.Entity_checkHit_tests.length; S.Entity_checkHit_i < S.Entity_checkHit_iz; S.Entity_checkHit_i += 2) {
			S.Entity_checkHit_result = my.cvx.isPointInPath(S.Entity_checkHit_tests[S.Entity_checkHit_i], S.Entity_checkHit_tests[S.Entity_checkHit_i + 1]);
			if (S.Entity_checkHit_result) {
				break;
			}
		}
		if (S.Entity_checkHit_result) {
			items.x = S.Entity_checkHit_tests[S.Entity_checkHit_i];
			items.y = S.Entity_checkHit_tests[S.Entity_checkHit_i + 1];
			return items;
		}
		return false;
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
		this.lockTo = my.xtGet(items.lockTo, my.d[this.type].lockTo);
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
Drawing flag - when set to 'entity' (or true), will use entity-based coordinates to calculate the start and end points of the gradient; when set to 'cell' (or false - default), will use Cell-based coordinates
@property lockTo
@type String - or alternatively Boolean
@default 'cell'
**/
		lockTo: 'cell',
		/**
Drawing flag - when set to true, force the gradient to update each drawing cycle - only required in the simplest scenes where fillStyle and strokeStyle do not change between entities
@property autoUpdate
@type Boolean
@default false
**/
		autoUpdate: false,
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
		endY: 0
	};
	my.mergeInto(my.d.Design, my.d.Base);
	/**
Add values to Number attributes
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	S.Design_setDelta_temp = 0;
	my.Design.prototype.setDelta = function(items) {
		items = my.safeObject(items);
		if (items.startX) {
			S.Design_setDelta_temp = this.get('startX');
			this.startX = (my.isa(items.startX, 'str')) ? my.addPercentages(S.Design_setDelta_temp, items.startX) : S.Design_setDelta_temp + items.startX;
		}
		if (items.startY) {
			S.Design_setDelta_temp = this.get('startY');
			this.startY = (my.isa(items.startY, 'str')) ? my.addPercentages(S.Design_setDelta_temp, items.startY) : S.Design_setDelta_temp + items.startY;
		}
		if (items.startRadius) {
			S.Design_setDelta_temp = this.get('startRadius');
			this.startRadius = S.Design_setDelta_temp + items.startRadius;
		}
		if (items.endX) {
			S.Design_setDelta_temp = this.get('endX');
			this.endX = (my.isa(items.endX, 'str')) ? my.addPercentages(S.Design_setDelta_temp, items.endX) : S.Design_setDelta_temp + items.endX;
		}
		if (items.endY) {
			S.Design_setDelta_temp = this.get('endY');
			this.endY = (my.isa(items.endY, 'str')) ? my.addPercentages(S.Design_setDelta_temp, items.endY) : S.Design_setDelta_temp + items.endY;
		}
		if (items.endRadius) {
			S.Design_setDelta_temp = this.get('endRadius');
			this.endRadius = S.Design_setDelta_temp + items.endRadius;
		}
		if (items.shift && my.xt(my.d.Design.shift)) {
			S.Design_setDelta_temp = this.get('shift');
			this.shift = S.Design_setDelta_temp + items.shift;
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
	S.Design_makeGradient_ctx = null; //DOM canvas context object
	S.Design_makeGradient_g = 0;
	S.Design_makeGradient_x = 0;
	S.Design_makeGradient_y = 0;
	S.Design_makeGradient_sx = 0;
	S.Design_makeGradient_sy = 0;
	S.Design_makeGradient_sr = 0;
	S.Design_makeGradient_ex = 0;
	S.Design_makeGradient_ey = 0;
	S.Design_makeGradient_er = 0;
	S.Design_makeGradient_fsx = 0;
	S.Design_makeGradient_fsy = 0;
	S.Design_makeGradient_fex = 0;
	S.Design_makeGradient_fey = 0;
	S.Design_makeGradient_temp = 0;
	S.Design_makeGradient_w = 0;
	S.Design_makeGradient_h = 0;
	S.Design_makeGradient_r = 0;
	my.Design.prototype.makeGradient = function(entity, cell) {
		entity = my.entity[entity] || false;
		if (my.xt(cell)) {
			cell = (my.cell[cell]) ? my.cell[cell] : my.cell[this.get('cell')];
		}
		else if (entity) {
			cell = my.cell[entity.group];
		}
		else {
			cell = my.cell[this.get('cell')];
		}
		S.Design_makeGradient_ctx = my.context[cell.name];
		//in all cases, the canvas origin will have been translated to the current entity's start
		if (this.lockTo && this.lockTo !== 'cell') {
			S.Design_makeGradient_temp = entity.getOffsetStartVector();
			switch (entity.type) {
				case 'Wheel':
					S.Design_makeGradient_x = -S.Design_makeGradient_temp.x + (entity.radius * entity.scale);
					S.Design_makeGradient_y = -S.Design_makeGradient_temp.y + (entity.radius * entity.scale);
					break;
				case 'Shape':
				case 'Path':
					if (entity.isLine) {
						S.Design_makeGradient_x = -S.Design_makeGradient_temp.x;
						S.Design_makeGradient_y = -S.Design_makeGradient_temp.y;
					}
					else {
						S.Design_makeGradient_x = -S.Design_makeGradient_temp.x + ((entity.width / 2) * entity.scale);
						S.Design_makeGradient_y = -S.Design_makeGradient_temp.y + ((entity.height / 2) * entity.scale);
					}
					break;
				default:
					S.Design_makeGradient_x = -S.Design_makeGradient_temp.x;
					S.Design_makeGradient_y = -S.Design_makeGradient_temp.y;
			}
			S.Design_makeGradient_w = (my.xt(entity.localWidth)) ? entity.localWidth : entity.width * entity.scale;
			S.Design_makeGradient_h = (my.xt(entity.localHeight)) ? entity.localHeight : entity.height * entity.scale;
			S.Design_makeGradient_sx = (my.xt(this.startX)) ? this.startX : 0;
			if (typeof S.Design_makeGradient_sx === 'string') {
				S.Design_makeGradient_sx = (parseFloat(S.Design_makeGradient_sx) / 100) * S.Design_makeGradient_w;
			}
			S.Design_makeGradient_sy = (my.xt(this.startY)) ? this.startY : 0;
			if (typeof S.Design_makeGradient_sy === 'string') {
				S.Design_makeGradient_sy = (parseFloat(S.Design_makeGradient_sy) / 100) * S.Design_makeGradient_h;
			}
			S.Design_makeGradient_ex = (my.xt(this.endX)) ? this.endX : S.Design_makeGradient_w;
			if (typeof S.Design_makeGradient_ex === 'string') {
				S.Design_makeGradient_ex = (parseFloat(S.Design_makeGradient_ex) / 100) * S.Design_makeGradient_w;
			}
			S.Design_makeGradient_ey = (my.xt(this.endY)) ? this.endY : S.Design_makeGradient_h;
			if (typeof S.Design_makeGradient_ey === 'string') {
				S.Design_makeGradient_ey = (parseFloat(S.Design_makeGradient_ey) / 100) * S.Design_makeGradient_h;
			}
			if (this.type === 'Gradient') {
				S.Design_makeGradient_g = S.Design_makeGradient_ctx.createLinearGradient(S.Design_makeGradient_sx - S.Design_makeGradient_x, S.Design_makeGradient_sy - S.Design_makeGradient_y, S.Design_makeGradient_ex - S.Design_makeGradient_x, S.Design_makeGradient_ey - S.Design_makeGradient_y);
			}
			else {
				S.Design_makeGradient_sr = (my.xt(this.startRadius)) ? this.startRadius : 0;
				if (typeof S.Design_makeGradient_sr === 'string') {
					S.Design_makeGradient_sr = (parseFloat(S.Design_makeGradient_sr) / 100) * S.Design_makeGradient_w;
				}
				S.Design_makeGradient_er = (my.xt(this.endRadius)) ? this.endRadius : S.Design_makeGradient_w;
				if (typeof S.Design_makeGradient_er === 'string') {
					S.Design_makeGradient_er = (parseFloat(S.Design_makeGradient_er) / 100) * S.Design_makeGradient_w;
				}
				S.Design_makeGradient_g = S.Design_makeGradient_ctx.createRadialGradient(S.Design_makeGradient_sx - S.Design_makeGradient_x, S.Design_makeGradient_sy - S.Design_makeGradient_y, S.Design_makeGradient_sr, S.Design_makeGradient_ex - S.Design_makeGradient_x, S.Design_makeGradient_ey - S.Design_makeGradient_y, S.Design_makeGradient_er);
			}
		}
		else {
			S.Design_makeGradient_x = entity.start.x;
			if (typeof S.Design_makeGradient_x === 'string') {
				S.Design_makeGradient_x = entity.convertX(S.Design_makeGradient_x, cell.name);
			}
			S.Design_makeGradient_y = entity.start.y;
			if (typeof S.Design_makeGradient_y === 'string') {
				S.Design_makeGradient_y = entity.convertY(S.Design_makeGradient_y, cell.name);
			}
			S.Design_makeGradient_sx = (my.xt(this.startX)) ? this.startX : 0;
			if (typeof S.Design_makeGradient_sx === 'string') {
				S.Design_makeGradient_sx = entity.convertX(S.Design_makeGradient_sx, cell.name);
			}
			S.Design_makeGradient_sy = (my.xt(this.startY)) ? this.startY : 0;
			if (typeof S.Design_makeGradient_sy === 'string') {
				S.Design_makeGradient_sy = entity.convertY(S.Design_makeGradient_sy, cell.name);
			}
			S.Design_makeGradient_ex = (my.xt(this.endX)) ? this.endX : cell.actualWidth;
			if (typeof S.Design_makeGradient_ex === 'string') {
				S.Design_makeGradient_ex = entity.convertX(S.Design_makeGradient_ex, cell.name);
			}
			S.Design_makeGradient_ey = (my.xt(this.endY)) ? this.endY : cell.actualWidth;
			if (typeof S.Design_makeGradient_ey === 'string') {
				S.Design_makeGradient_ey = entity.convertY(S.Design_makeGradient_ey, cell.name);
			}
			S.Design_makeGradient_x = (entity.flipReverse) ? cell.actualWidth - S.Design_makeGradient_x : S.Design_makeGradient_x;
			S.Design_makeGradient_y = (entity.flipUpend) ? cell.actualHeight - S.Design_makeGradient_y : S.Design_makeGradient_y;
			S.Design_makeGradient_sx = (entity.flipReverse) ? cell.actualWidth - S.Design_makeGradient_sx : S.Design_makeGradient_sx;
			S.Design_makeGradient_sy = (entity.flipUpend) ? cell.actualHeight - S.Design_makeGradient_sy : S.Design_makeGradient_sy;
			S.Design_makeGradient_ex = (entity.flipReverse) ? cell.actualWidth - S.Design_makeGradient_ex : S.Design_makeGradient_ex;
			S.Design_makeGradient_ey = (entity.flipUpend) ? cell.actualHeight - S.Design_makeGradient_ey : S.Design_makeGradient_ey;
			S.Design_makeGradient_fsx = S.Design_makeGradient_sx - S.Design_makeGradient_x;
			S.Design_makeGradient_fsy = S.Design_makeGradient_sy - S.Design_makeGradient_y;
			S.Design_makeGradient_fex = S.Design_makeGradient_ex - S.Design_makeGradient_x;
			S.Design_makeGradient_fey = S.Design_makeGradient_ey - S.Design_makeGradient_y;
			S.Design_makeGradient_r = entity.roll;
			if ((entity.flipReverse && entity.flipUpend) || (!entity.flipReverse && !entity.flipUpend)) {
				S.Design_makeGradient_r = -entity.roll;
			}
			if (entity.roll) {
				my.v.set({
					x: S.Design_makeGradient_fsx,
					y: S.Design_makeGradient_fsy,
					z: 0
				}).rotate(S.Design_makeGradient_r);
				S.Design_makeGradient_fsx = my.v.x;
				S.Design_makeGradient_fsy = my.v.y;
				my.v.set({
					x: S.Design_makeGradient_fex,
					y: S.Design_makeGradient_fey,
					z: 0
				}).rotate(S.Design_makeGradient_r);
				S.Design_makeGradient_fex = my.v.x;
				S.Design_makeGradient_fey = my.v.y;
			}
			if (this.type === 'Gradient') {
				S.Design_makeGradient_g = S.Design_makeGradient_ctx.createLinearGradient(S.Design_makeGradient_fsx, S.Design_makeGradient_fsy, S.Design_makeGradient_fex, S.Design_makeGradient_fey);
			}
			else {
				S.Design_makeGradient_sr = (my.xt(this.startRadius)) ? this.startRadius : 0;
				if (typeof S.Design_makeGradient_sr === 'string') {
					S.Design_makeGradient_sr = (parseFloat(S.Design_makeGradient_sr) / 100) * cell.actualWidth;
				}
				S.Design_makeGradient_er = (my.xt(this.endRadius)) ? this.endRadius : cell.actualWidth;
				if (typeof S.Design_makeGradient_er === 'string') {
					S.Design_makeGradient_er = (parseFloat(S.Design_makeGradient_er) / 100) * cell.actualWidth;
				}
				S.Design_makeGradient_g = S.Design_makeGradient_ctx.createRadialGradient(S.Design_makeGradient_fsx, S.Design_makeGradient_fsy, S.Design_makeGradient_sr, S.Design_makeGradient_fex, S.Design_makeGradient_fey, S.Design_makeGradient_er);
			}
		}
		my.dsn[this.name] = S.Design_makeGradient_g;
		return this;
	};
	/**
Design.update() helper function - applies color attribute objects to the gradient
@method applyStops
@return This
@private
@chainable
**/
	S.Design_applyStops_color = null; //raw object
	S.Design_applyStops_i = 0;
	S.Design_applyStops_iz = 0;
	my.Design.prototype.applyStops = function() {
		S.Design_applyStops_color = this.get('color');
		if (my.dsn[this.name]) {
			for (S.Design_applyStops_i = 0, S.Design_applyStops_iz = S.Design_applyStops_color.length; S.Design_applyStops_i < S.Design_applyStops_iz; S.Design_applyStops_i++) {
				my.dsn[this.name].addColorStop(S.Design_applyStops_color[S.Design_applyStops_i].stop, S.Design_applyStops_color[S.Design_applyStops_i].color);
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
		endRadius: 0
	};
	my.mergeInto(my.d.RadialGradient, my.d.Design);

	my.v = my.newVector({
		name: 'scrawl.v'
	});

	return my;
}(scrawlVars));
