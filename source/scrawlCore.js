//---------------------------------------------------------------------------------
// The MIT License (MIT)
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

## Version 4.2.2 - 28 June 2015

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
@default 4.2.1
@final
**/
	my.version = '4.2.2';
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
Array of loaded extensions arrays
@property extensions
@type {Array}
@private
**/
	my.extensions = [];
	/**
Array of loaded extensions arrays (name changed from modules to extensions because Scrawl 'modules' are not modules)
@property modules
@type {Array}
@private
@deprecated
**/
	my.modules = my.extensions;
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
		my.resizePageListener();
		return my;
	};
	/**
event listener for browser resize actions
@method resizePageListener
@private
**/
	my.resizePageListener = function() {
		window.removeEventListener('resize', my.resizePageEvent, false);
		window.addEventListener('resize', my.resizePageEvent, false);
	};
	/**
function for handling browser resize actions
@method resizePageEvent
@private
**/
	my.resizePageEvent = function(e) {
		my.setDisplayOffsets('all');
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
A __general__ function that loads supporting extensions and integrates them into the core

Extension names are supplied as an array of Strings and can be either the extension filename (with or without the '.js' suffix), or an alias string.

Scrawl currently supports the following extensions:
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

Where permitted, Scrawl will load extensions asynchronously. Extensions have no external dependencies beyond their need for the core module, and can be loaded in any order.

Any supplied callback function will only be run once all extensions have been loaded.
@example
    <!DOCTYPE html>
    <html>
        <head></head>
        <body>
            <canvas></canvas>
            <script src="js/scrawlCore-min.js"></script>
            <script>
                var mycode = function(){
                    scrawl.makeWheel({
                        startX: 50,
                        startY: 50,
                        radius: 40,
                        });
                    scrawl.render();
                    };
                scrawl.loadExtensions({
                    path: 'js/',
                    extensions: ['wheel'],         
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

@method loadExtensions
@param {String} [path] File path String to the directory where the Scrawl extension scripts have been stored, relative to the web page's main file; default ('') will assume extensions are in the same directory as the web page file
@param {Array} extensions Array of extension Strings (either filenames or extension aliases), representing Scrawl extensions to be loaded into the core
@param {Boolean} [mini] When set to true (the default), will load minified versions of the extensions; false will load source versions
@param {Function} [callback] An anonymous function to be run once extension loading completes
@return The Scrawl library object (scrawl)
@chainable
**/
	my.loadExtensions = function(items) {
		items = my.safeObject(items);
		var path = items.path || '',
			exts = [],
			callback = (my.isa(items.callback, 'fn')) ? items.callback : function() {},
			error = (my.isa(items.error, 'fn')) ? items.error : function() {},
			mini = my.xtGet(items.minified, true),
			tail = (mini) ? '-min.js' : '.js',
			loaded = [],
			required = [],
			startTime = Date.now(),
			timeout = 30000, // allow a maximum of 30 seconds to get all extensions
			i, iz, j, jz,
			getExtensions = function(ext) {
				var scriptTag,
					myExt = my.loadAlias[ext] || ext;
				if (!my.contains(my.extensions, myExt)) {
					scriptTag = document.createElement('script');
					scriptTag.type = 'text/javascript';
					scriptTag.async = 'true';
					scriptTag.onload = function(e) {
						done(ext);
					};
					scriptTag.onerror = function(e) {
						done(ext, true);
					};
					scriptTag.src = (/\.js$/.test(myExt)) ? path + myExt : path + myExt + tail;
					document.body.appendChild(scriptTag);
				}
			},
			done = function(m, e) {
				my.removeItem(loaded, m);
				if (e || Date.now() > startTime + timeout) {
					error();
				}
				else {
					my.pushUnique(my.extensions, m);
				}
				if (loaded.length === 0) {
					callback();
				}
			};
		if (my.xt(items.extensions)) {
			exts = exts.concat([].concat(items.extensions));
		}
		if (my.xt(items.modules)) {
			exts = exts.concat([].concat(items.modules));
		}
		for (i = 0, iz = exts.length; i < iz; i++) {
			for (j = 0, jz = my.loadDependencies[exts[i]].length; j < jz; j++) {
				my.pushUnique(required, my.loadDependencies[exts[i]][j]);
			}
			my.pushUnique(required, exts[i]);
		}
		loaded = [].concat(required);
		for (i = 0, iz = required.length; i < iz; i++) {
			getExtensions(required[i]);
		}
		return my;
	};
	/**
A __general__ function that loads supporting extensions and integrates them into the core

(function name changed from loadModules to loadExtensions because Scrawl 'modules' are not modules)

@method loadModules
@param {String} [path] File path String to the directory where the Scrawl extension scripts have been stored, relative to the web page's main file; default ('') will assume extensions are in the same directory as the web page file
@param {Array} extensions Array of extension Strings (either filenames or extension aliases), representing Scrawl extensions to be loaded into the core
@param {Boolean} [mini] When set to true (the default), will load minified versions of the extensions; false will load source versions
@param {Function} [callback] An anonymous function to be run once extension loading completes
@return The Scrawl library object (scrawl)
@chainable
@deprecated
**/
	my.loadModules = my.loadExtensions;
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
    //  name: 'Peter',
    //  age: 42,
    //  job: 'lawyer'
    //  pet: 'cat'
    //  }
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
    //  name: 'Peter',
    //  age: 32,
    //  job: 'coder'
    //  pet: 'cat'
    //  }
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
    scrawl.contains(myarray, 'apple');  //true
    scrawl.contains(myarray, 'banana'); //false
**/
	my.contains = function(item, k) {
		return (item.indexOf(k) >= 0) ? true : false;
	};
	/**
A __utility__ function to convert strings (such as percentages) to integer values
@method toInt
@param {String} item
@return Integer number; 0 on error
**/
	my.toInt = function(item) {
		if (item.substring) {
			item = parseFloat(item);
		}
		return (item.toFixed) ? item | 0 : 0;
	};
	/**
A __utility__ function that adds a value to an array if the array doesn't already contain an element with that value
@method pushUnique
@param {Array} item Reference array
@param {Mixed} o value to be added to array
@return Amended array
@example
    var myarray = ['apple', 'orange'];
    scrawl.pushUnique(myarray, 'apple');    //returns ['apple', 'orange']
    scrawl.pushUnique(myarray, 'banana');   //returns ['apple', 'orange', 'banana']
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
    scrawl.removeItem(myarray, 'banana');   //returns ['apple', 'orange']
    scrawl.removeItem(myarray, 'apple');    //returns ['orange']
**/
	my.removeItem = function(item, o) {
		var index;
		index = item.indexOf(o);
		if (index >= 0) {
			item.splice(index, 1);
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
    scrawl.isBetween(3, 1, 5);          //returns true
    scrawl.isBetween(3, 3, 5);          //returns false
    scrawl.isBetween(3, 3, 5, true);    //returns true
**/
	my.isBetween = function(no, a, b, e) {
		var value;
		if (a > b) {
			value = a;
			a = b;
			b = value;
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
		var min,
			max,
			count,
			action,
			operation,
			result,
			check;
		items = my.safeObject(items);
		a = my.xtGet(a, 0);
		b = my.xtGet(b, 0);
		min = my.xtGet(items.min, 0);
		max = my.xtGet(items.max, 1);
		action = my.xtGet(items.action, 'stick');
		operation = my.xtGet(items.operation, 'add');
		count = 20;
		result = 0;
		check = false;

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
			check = (result < (min + max) / 2) ? true : false;
			switch (action) {
				case 'bounce':
					result = (check) ? min + (-result + min) : max + (-result + max);
					break;
				case 'loop':
					result = (check) ? (max - min) + result : (min - max) + result;
					break;
				default:
					result = (check) ? min : max;
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
* __dom__ for DOM objects
* __event__ for DOM event objects
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
    scrawl.isa(mystring, 'bool');   //returns false
    scrawl.isa(mystring, 'str');    //returns true
    scrawl.isa(myboolean, 'bool');  //returns true
    scrawl.isa(myboolean, 'str');   //returns false
**/
	my.isa = function() {
		var slice = Array.prototype.slice.call(arguments);
		if (slice.length == 2 && my.xt(slice[0])) {
			//because we mostly test for str or fn
			if (slice[1] == 'str') {
				return (slice[0].substring) ? true : false;
			}
			if (slice[1] == 'fn') {
				return (typeof slice[0] === 'function') ? true : false;
			}
			//divide and conquer the rest
			slice.push(slice[1][0]);
			if (slice[2] < 'm') {
				if (slice[2] < 'd') {
					switch (slice[1]) {
						case 'arr':
							return (Array.isArray(slice[0])) ? true : false;
						case 'bool':
							return (typeof slice[0] === 'boolean') ? true : false;
						case 'canvas':
							return (Object.prototype.toString.call(slice[0]) === '[object HTMLCanvasElement]') ? true : false;
						default:
							return false;
					}
				}
				else {
					switch (slice[1]) {
						case 'date':
							return (Object.prototype.toString.call(slice[0]) === '[object Date]') ? true : false;
						case 'dom':
							return (slice[0].querySelector && slice[0].dispatchEvent) ? true : false;
						case 'event':
							return (slice[0].preventDefault && slice[0].initEvent) ? true : false;
						case 'img':
							return (Object.prototype.toString.call(slice[0]) === '[object HTMLImageElement]') ? true : false;
						default:
							return false;
					}
				}
			}
			else {
				if (slice[2] < 's') {
					switch (slice[1]) {
						case 'num':
							return (slice[0].toFixed) ? true : false;
						case 'obj':
							return (Object.prototype.toString.call(slice[0]) === '[object Object]') ? true : false;
						case 'quaternion':
							return (slice[0].type && slice[0].type === 'Quaternion') ? true : false;
						default:
							return false;
					}
				}
				else {
					switch (slice[1]) {
						case 'vector':
							return (slice[0].type && slice[0].type === 'Vector') ? true : false;
						case 'video':
							return (Object.prototype.toString.call(slice[0]) === '[object HTMLVideoElement]') ? true : false;
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
    scrawl.xt(mystring);    //returns true
    scrawl.xt(myboolean);   //returns false
**/
	my.xt = function(item) {
		return (typeof item == 'undefined') ? false : true;
	};
	/**
A __utility__ function that checks an argument list of values and returns the first value that exists
@method xtGet
@return first defined variable; null if all values are undefined
**/
	my.xtGet = function() {
		var slice,
			i,
			iz;
		slice = Array.prototype.slice.call(arguments);
		if (slice.length > 0) {
			for (i = 0, iz = slice.length; i < iz; i++) {
				if (typeof slice[i] !== 'undefined') {
					return slice[i];
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
	my.xtGetTrue = function() {
		var slice,
			i,
			iz;
		slice = Array.prototype.slice.call(arguments);
		if (slice.length > 0) {
			for (i = 0, iz = slice.length; i < iz; i++) {
				if (slice[i]) {
					return slice[i];
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
    scrawl.xta([mystring, mynumber]);   //returns true
    scrawl.xta([mystring, myboolean]);  //returns false
**/
	my.xta = function() {
		var slice,
			i,
			iz;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		if (slice.length > 0) {
			for (i = 0, iz = slice.length; i < iz; i++) {
				if (typeof slice[i] === 'undefined') {
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
    scrawl.xto(mystring, mynumber); //returns true
    scrawl.xto(mystring, myboolean);    //returns true
**/
	my.xto = function() {
		var slice,
			i,
			iz;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		if (slice.length > 0) {
			for (i = 0, iz = slice.length; i < iz; i++) {
				if (typeof slice[i] !== 'undefined') {
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
		var name,
			nameArray;
		item = my.safeObject(item);
		if (my.contains(my.nameslist, item.target)) {
			name = my.xtGetTrue(item.name, item.type, 'default');
			name = name.replace(/\./g, '_');
			name = name.replace(/\//g, '_');
			name = name.replace(/ /g, '_');
			name = name.replace(/\+/g, '_');
			name = name.replace(/\*/g, '_');
			name = name.replace(/\[/g, '_');
			name = name.replace(/\{/g, '_');
			name = name.replace(/\(/g, '_');
			name = name.replace(/\)/g, '_');
			name = name.replace(/~/g, '_');
			name = name.replace(/-/g, '_');
			name = name.replace(/#/g, '_');
			name = name.replace(/\\/g, '_');
			name = name.replace(/\^/g, '_');
			name = name.replace(/\$/g, '_');
			name = name.replace(/\|/g, '_');
			name = name.replace(/\?/g, '_');
			nameArray = name.split('___');
			return (my.contains(my[item.target], nameArray[0])) ? nameArray[0] + '___' + Math.floor(Math.random() * 100000000) : nameArray[0];
		}
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
	my.setDisplayOffsets = function() {
		var i,
			iz;
		for (i = 0, iz = my.padnames.length; i < iz; i++) {
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
		var elements,
			pad,
			i,
			iz;
		elements = document.getElementsByTagName("canvas");
		if (elements.length > 0) {
			for (i = 0, iz = elements.length; i < iz; i++) {
				pad = my.makePad({
					canvasElement: elements[i]
				});
				if (i === 0) {
					my.currentPad = pad.name;
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
                name:   'mycanvas',
                parentElement: 'canvasholder',
                width: 400,
                height: 200,
                }).makeCurrent();
        </script>
    </body>
**/
	my.addCanvasToPage = function(items) {
		var parent,
			canvas,
			pad;
		items = my.safeObject(items);
		parent = document.getElementById(items.parentElement) || document.body;
		canvas = document.createElement('canvas');
		parent.appendChild(canvas);
		items.width = my.xtGet(items.width, 300);
		items.height = my.xtGet(items.height, 150);
		items.canvasElement = canvas;
		pad = new my.Pad(items);
		my.setDisplayOffsets();
		return pad;
	};
	/**
A __display__ function to ask Pads to get their Cells to clear their &lt;canvas&gt; elements
@method clear
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.clear = function(pads) {
		var padnames,
			i,
			iz;
		padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			my.pad[padnames[i]].clear();
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
	my.compile = function(pads) {
		var padnames,
			i,
			iz;
		padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			my.pad[padnames[i]].compile();
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
	my.show = function(pads) {
		var padnames,
			i,
			iz;
		padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			my.pad[padnames[i]].show();
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
	my.render = function(pads) {
		var padnames,
			i,
			iz;
		padnames = (my.xt(pads)) ? [].concat(pads) : my.padnames;
		for (i = 0, iz = padnames.length; i < iz; i++) {
			my.pad[padnames[i]].render();
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
		a = parseFloat(a);
		b = parseFloat(b);
		return (a + b) + '%';
	};
	/**
A __utility__ function to reverse the value of a percentage string
@method reversePercentage
@param {String} a - value
@return String result
**/
	my.reversePercentage = function(a) {
		a = parseFloat(a);
		a = -a;
		return a + '%';
	};
	/**
A __utility__ function to subtract a percent string from another
@method subtractPercentages
@param {String} a - initial value
@param {String} b - value to be subtracted from initial value
@return String result
**/
	my.subtractPercentages = function(a, b) {
		a = parseFloat(a);
		b = parseFloat(b);
		return (a - b) + '%';
	};
	/**
A custom __event listener__ helper array
@property activeListeners
@type {Array}
@private
**/
	my.activeListeners = [];
	if (window.CustomEvent) {
		/**
A custom __event listener__ helper array
@property eventAttributes
@type {Array}
@private
**/
		my.eventAttributes = ['altKey', 'bubbles', 'cancelBubble', 'cancelable', 'charCode', 'clipboardData', 'ctrlKey', 'currentTarget', 'defaultPrevented', 'detail', 'eventPhase', 'keyCode', 'layerX', 'layerY', 'metaKey', 'pageX', 'pageY', 'returnValue', 'shiftKey', 'srcElement', 'target', 'timestamp', 'view', 'which'];
		/**
A custom __event listener__ helper array
@property touchEventAttributes
@type {Array}
@private
**/
		my.touchEventAttributes = ['clientX', 'clientY', 'force', 'identifier', 'pageX', 'pageY', 'radiusX', 'radiusY', 'screenX', 'screenY', 'target', 'webkitForce', 'webkitRadiusX', 'webkitRadiusY', 'webkitRotationAngle'];
		/**
A custom __event listener__ function

The touchenter event is deprecated, but necessary for scrawl functionality

@method triggerTouchEnter
@private
**/
		my.triggerTouchEnter = function(e, el) {
			my.updateCustomTouch(e, el, new CustomEvent('touchenter', {
				detail: {},
				type: 'touchenter'
			}));
		};
		/**
A custom __event listener__ function

The touchleave event is deprecated, but necessary for scrawl functionality

@method triggerTouchLeave
@private
**/
		my.triggerTouchLeave = function(e, el) {
			my.updateCustomTouch(e, el, new CustomEvent('touchleave', {
				detail: {},
				type: 'touchenter'
			}));
		};
		/**
A custom __event listener__ function

The touchfollow event is entirely custom, designed to allow elements to subscribe to an event that started in a different element

@method triggerTouchFollow
@private
**/
		my.triggerTouchFollow = function(e, el) {
			my.updateCustomTouch(e, el, new CustomEvent('touchfollow', {
				detail: {},
				type: 'touchfollow'
			}));
		};
		/**
A custom __event listener__ helper function
@method updateCustomTouch
@private
**/
		my.updateCustomTouch = function(data, el, evt) {
			// creates plain objects and arrays, not Touch objects etc. So shoot me!
			var i, iz, j, jz;
			for (i = 0, iz = my.eventAttributes.length; i < iz; i++) {
				if (my.xt(data[my.eventAttributes[i]])) {
					evt[my.eventAttributes[i]] = data[my.eventAttributes[i]];
				}
			}
			evt.changedTouches = [];
			if (my.xt(data.changedTouches)) {
				for (i = 0, iz = data.changedTouches.length; i < iz; i++) {
					evt.changedTouches.push({});
					for (j = 0, jz = my.touchEventAttributes.length; j < jz; j++) {
						if (my.xt(data.changedTouches[i][my.touchEventAttributes[j]])) {
							evt.changedTouches[i][my.touchEventAttributes[j]] = data.changedTouches[i][my.touchEventAttributes[j]];
						}
					}
				}
			}
			if (my.xt(data.path)) {
				evt.path = data.path;
			}
			evt.targetTouches = [];
			if (my.xt(data.targetTouches)) {
				for (i = 0, iz = data.targetTouches.length; i < iz; i++) {
					evt.targetTouches.push({});
					for (j = 0, jz = my.touchEventAttributes.length; j < jz; j++) {
						if (my.xt(data.targetTouches[i][my.touchEventAttributes[j]])) {
							evt.targetTouches[i][my.touchEventAttributes[j]] = data.targetTouches[i][my.touchEventAttributes[j]];
						}
					}
				}
			}
			evt.touches = [];
			if (my.xt(data.touches)) {
				for (i = 0, iz = data.touches.length; i < iz; i++) {
					evt.touches.push({});
					for (j = 0, jz = my.touchEventAttributes.length; j < jz; j++) {
						if (my.xt(data.touches[i][my.touchEventAttributes[j]])) {
							evt.touches[i][my.touchEventAttributes[j]] = data.touches[i][my.touchEventAttributes[j]];
						}
					}
				}
			}
			el.dispatchEvent(evt);
		};
	}
	/**
A utility function for adding JavaScript event listeners to multiple elements
@method addNativeListener
@param {String} evt - or an Array of Strings
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element, or an Array of DOM elements
@return always true
**/
	my.addNativeListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz;
		my.removeNativeListener(evt, fn, targ);
		evt = [].concat(evt);
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}
		if (my.isa(fn, 'fn')) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					targets[i].addEventListener(evt[j], fn, false);
				}
			}
		}
	};
	/**
A utility function for adding JavaScript event listeners to multiple elements
@method addNativeListener
@param {String} evt - or an Array of Strings
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element, or an Array of DOM elements
@return always true
**/
	my.removeNativeListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz;
		evt = [].concat(evt);
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}
		if (my.isa(fn, 'fn')) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					targets[i].removeEventListener(evt[j], fn, false);
				}
			}
		}
	};
	/**
Adds event listeners to the element
@method addListener
@param {String} evt - or an Array of Strings from: 'up', 'down', 'enter', 'leave', 'move'
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element, or an Array of DOM elements
@return always true
**/
	my.addListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz, nav;
		my.removeListener(evt, fn, targ);
		nav = (navigator.pointerEnabled || navigator.msPointerEnabled) ? true : false;
		evt = [].concat(evt);
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}
		if (my.isa(fn, 'fn')) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					if (my.isa(targets[i], 'dom')) {
						switch (evt[j]) {
							case 'leave':
								if (nav) {
									targets[i].addEventListener('pointerleave', fn, false);
								}
								else {
									targets[i].addEventListener('mouseleave', fn, false);
									targets[i].addEventListener('touchleave', fn, false);
								}
								break;
							case 'up':
								if (nav) {
									targets[i].addEventListener('pointerup', fn, false);
								}
								else {
									targets[i].addEventListener('mouseup', fn, false);
									targets[i].addEventListener('touchend', fn, false);
								}
								break;
							case 'enter':
								if (nav) {
									targets[i].addEventListener('pointerenter', fn, false);
								}
								else {
									targets[i].addEventListener('mouseenter', fn, false);
									targets[i].addEventListener('touchenter', fn, false);
								}
								break;
							case 'down':
								if (nav) {
									targets[i].addEventListener('pointerdown', fn, false);
								}
								else {
									targets[i].addEventListener('mousedown', fn, false);
									targets[i].addEventListener('touchstart', fn, false);
								}
								break;
							case 'move':
								if (nav) {
									targets[i].addEventListener('pointermove', fn, false);
								}
								else {
									targets[i].addEventListener('mousemove', fn, false);
									targets[i].addEventListener('touchmove', fn, false);
									targets[i].addEventListener('touchfollow', fn, false);
								}
								break;
						}
					}
				}
			}
		}
		return true;
	};
	/**
Remove event listeners from the element
@method removeListener
@param {String} evt - one from: 'up', 'down', 'enter', 'leave', 'move'
@param {Function} fn - function to be called when event triggers
@param {String} targ - either a querySelectorAll string, or a DOM element
@return true on success; false otherwise
**/
	my.removeListener = function(evt, fn, targ) {
		var targets, i, iz, j, jz, nav;
		evt = [].concat(evt);
		nav = (navigator.pointerEnabled || navigator.msPointerEnabled) ? true : false;
		if (targ.substring) {
			targets = document.body.querySelectorAll(targ);
		}
		else if (Array.isArray(targ)) {
			targets = targ;
		}
		else {
			targets = [targ];
		}

		if (my.isa(fn, 'fn')) {
			for (j = 0, jz = evt.length; j < jz; j++) {
				for (i = 0, iz = targets.length; i < iz; i++) {
					if (my.isa(targets[i], 'dom')) {
						switch (evt[j]) {
							case 'leave':
								if (nav) {
									targets[i].removeEventListener('pointerleave', fn, false);
								}
								else {
									targets[i].removeEventListener('mouseleave', fn, false);
									targets[i].removeEventListener('touchleave', fn, false);
								}
								break;
							case 'up':
								if (nav) {
									targets[i].removeEventListener('pointerup', fn, false);
								}
								else {
									targets[i].removeEventListener('mouseup', fn, false);
									targets[i].removeEventListener('touchend', fn, false);
								}
								break;
							case 'enter':
								if (nav) {
									targets[i].removeEventListener('pointerenter', fn, false);
								}
								else {
									targets[i].removeEventListener('mouseenter', fn, false);
									targets[i].removeEventListener('touchenter', fn, false);
								}
								break;
							case 'down':
								if (nav) {
									targets[i].removeEventListener('pointerdown', fn, false);
								}
								else {
									targets[i].removeEventListener('mousedown', fn, false);
									targets[i].removeEventListener('touchstart', fn, false);
								}
								break;
							case 'move':
								if (nav) {
									targets[i].removeEventListener('pointermove', fn, false);
								}
								else {
									targets[i].removeEventListener('mousemove', fn, false);
									targets[i].removeEventListener('touchmove', fn, false);
									targets[i].removeEventListener('touchfollow', fn, false);
								}
								break;
						}
					}
				}
			}
		}
		return true;
	};
	/**
A __general__ function which passes on requests to Pads to generate new &lt;canvas&gt; elements and associated objects - see Pad.addNewCell() for more details
@method addNewCell
@param {Object} data Initial attribute values for new object
@param {String} pad PADNAME
@return New Cell object
**/
	my.addNewCell = function(data, pad) {
		pad = (my.isa(pad, 'str')) ? pad : my.currentPad;
		return my.pad[pad].addNewCell(data);
	};
	/**
A __general__ function which deletes Cell objects and their associated paraphinalia - see Pad.deleteCells() for more details
@method deleteCells
@param {Array} cells Array of CELLNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
	my.deleteCells = function() {
		var slice,
			i,
			iz,
			j,
			jz;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			for (j = 0, jz = my.padnames.length; j < jz; j++) {
				my.pad[my.padnames[j]].deleteCell(c[i]);
			}
			delete my.group[slice[i]];
			delete my.group[slice[i] + '_field'];
			delete my.group[slice[i] + '_fence'];
			my.removeItem(my.groupnames, slice[i]);
			my.removeItem(my.groupnames, slice[i] + '_field');
			my.removeItem(my.groupnames, slice[i] + '_fence');
			delete my.context[slice[i]];
			delete my.canvas[slice[i]];
			delete my.ctx[my.cell[slice[i]].context];
			my.removeItem(my.ctxnames, my.cell[slice[i]].context);
			delete my.cell[slice[i]];
			my.removeItem(my.cellnames, slice[i]);
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
	my.addEntitysToGroups = function(groups, entitys) {
		var groupArray,
			entityArray,
			group,
			i,
			iz;
		if (my.xta(groups, entitys)) {
			groupArray = [].concat(groups);
			entityArray = [].concat(entitys);
			for (i = 0, iz = groupArray.length; i < iz; i++) {
				group = my.group[groupArray[i]];
				if (group) {
					group.addEntitysToGroup(entityArray);
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
		var groupArray,
			entityArray,
			group,
			i,
			iz;
		if (my.xta(groups, entitys)) {
			groupArray = [].concat(groups);
			entityArray = [].concat(entitys);
			for (i = 0, iz = groupArray.length; i < iz; i++) {
				group = my.group[groupArray[i]];
				if (group) {
					group.removeEntitysFromGroup(entityArray);
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
    scrawl.makeBlock({
        name: 'myblock',
        });
    scrawl.deleteEntity(['myblock']);
**/
	my.deleteEntity = function() {
		var slice,
			i,
			iz,
			j,
			jz,
			entityName,
			contextName;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			entityName = my.entity[slice[i]];
			if (entityName) {
				my.pathDeleteEntity(entityName);
				contextName = entityName.context;
				my.removeItem(my.ctxnames, contextName);
				delete my.ctx[contextName];
				my.removeItem(my.entitynames, slice[i]);
				delete my.entity[slice[i]];
				for (j = 0, jz = my.groupnames.length; j < jz; j++) {
					my.removeItem(my.group[my.groupnames[j]].entitys, slice[i]);
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
Alias for makeVector()
@method newVector
@deprecated
**/
	my.newVector = function(items) {
		return my.makeVector(items);
	};
	/**
Alias for makePad()
@method newPad
@private
@deprecated
**/
	my.newPad = function(items) {
		return my.makePad(items);
	};
	/**
Alias for makeCell()
@method newCell
@private
@deprecated
**/
	my.newCell = function(items) {
		return my.makeCell(items);
	};
	/**
Alias for makeContext()
@method newContext
@private
@deprecated
**/
	my.newContext = function(items) {
		return my.makeContext(items);
	};
	/**
Alias for makeGroup()
@method newGroup
@deprecated
**/
	my.newGroup = function(items) {
		return my.makeGroup(items);
	};
	/**
Alias for makeGradient()
@method newGradient
@deprecated
**/
	my.newGradient = function(items) {
		return my.makeGradient(items);
	};
	/**
Alias for makeRadialGradient()
@method newRadialGradient
@deprecated
**/
	my.newRadialGradient = function(items) {
		return my.makeRadialGradient(items);
	};
	/**
A __factory__ function to generate new Vector objects
@method makeVector
@param {Object} items Key:value Object argument for setting attributes
@return Vector object
@example
    var myVector = scrawl.makeVector({
        x: 100,
        y: 200,
        });
**/
	my.makeVector = function(items) {
		return new my.Vector(items);
	};
	/**
A __factory__ function to generate new Pad objects
@method makePad
@param {Object} items Key:value Object argument for setting attributes
@return Pad object
@private
**/
	my.makePad = function(items) {
		return new my.Pad(items);
	};
	/**
A __factory__ function to generate new Cell objects
@method makeCell
@param {Object} items Key:value Object argument for setting attributes
@return Cell object
@private
**/
	my.makeCell = function(items) {
		return new my.Cell(items);
	};
	/**
A __factory__ function to generate new Context objects
@method makeContext
@param {Object} items Key:value Object argument for setting attributes
@return Context object
@private
**/
	my.makeContext = function(items) {
		return new my.Context(items);
	};
	/**
A __factory__ function to generate new Group objects
@method makeGroup
@param {Object} items Key:value Object argument for setting attributes
@return Group object
**/
	my.makeGroup = function(items) {
		return new my.Group(items);
	};
	/**
A __factory__ function to generate new Gradient objects
@method makeGradient
@param {Object} items Key:value Object argument for setting attributes
@return Gradient object
**/
	my.makeGradient = function(items) {
		return new my.Gradient(items);
	};
	/**
A __factory__ function to generate new RadialGradient objects
@method makeRadialGradient
@param {Object} items Key:value Object argument for setting attributes
@return RadialGradient object
**/
	my.makeRadialGradient = function(items) {
		return new my.RadialGradient(items);
	};

	/**
# Vector

## Instantiation

* scrawl.makeVector()

## Purpose

* To hold vector (coordinate, movement) data
@class Vector
@constructor
@param {Object} [items] Key:value Object argument for setting attributes
**/
	my.Vector = function(items) {
		items = my.safeObject(items);
		/**
X coordinate (px)
@property x
@type Number
@default 0
**/
		this.x = items.x || 0;
		/**
Y coodinate (px)
@property y
@type Number
@default 0
**/
		this.y = items.y || 0;
		/**
Z coordinate (px)
@property z
@type Number
@default 0
**/
		this.z = items.z || 0;
		/**
Vector name - not guaranteed to be unique
@property name
@type String
@default 'generic'
**/
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
		x: 0,
		y: 0,
		z: 0,
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
	my.Vector.prototype.normalize = function() {
		var val = this.getMagnitude();
		if (val > 0) {
			this.x /= val;
			this.y /= val;
			this.z /= val;
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
		return my.makeVector({
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
		var v1x,
			v1y,
			v1z,
			v2x,
			v2y,
			v2z;
		if (my.isa(u, 'vector')) {
			v = (my.isa(v, 'vector')) ? v : this;
			v1x = v.x || 0;
			v1y = v.y || 0;
			v1z = v.z || 0;
			v2x = u.x || 0;
			v2y = u.y || 0;
			v2z = u.z || 0;
			return my.makeVector({
				x: (v1y * v2z) - (v1z * v2y),
				y: -(v1x * v2z) + (v1z * v2x),
				z: (v1x * v2y) + (v1y * v2x)
			});
		}
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
		var ux,
			uy,
			uz,
			vx,
			vy,
			vz,
			wx,
			wy,
			wz;
		if (my.isa(u, 'vector') && my.isa(v, 'vector')) {
			w = (my.safeObject(w)) ? w : this;
			ux = u.x || 0;
			uy = u.y || 0;
			uz = u.z || 0;
			vx = v.x || 0;
			vy = v.y || 0;
			vz = v.z || 0;
			wx = w.x || 0;
			wy = w.y || 0;
			wz = w.z || 0;
			return (ux * ((vy * wz) - (vz * wy))) + (uy * (-(vx * wz) + (vz * wx))) + (uz * ((vx * wy) - (vy * wx)));
		}
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
		var stat_vr = [0, 0];
		if (my.isa(angle, 'num')) {
			stat_vr[0] = Math.atan2(this.y, this.x);
			stat_vr[0] += (angle * 0.01745329251);
			stat_vr[1] = this.getMagnitude();
			this.x = stat_vr[1] * Math.cos(stat_vr[0]);
			this.y = stat_vr[1] * Math.sin(stat_vr[0]);
			return this;
		}
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
		var q1,
			q2,
			q3;
		if (my.isa(item, 'quaternion')) {
			mag = (scrawl.isa(mag, 'num')) ? mag : this.getMagnitude();
			q1 = my.workquat.q1.set(item);
			q2 = my.workquat.q2.set(this);
			q3 = my.workquat.q3.set(item).conjugate();
			q1.quaternionMultiply(q2);
			q1.quaternionMultiply(q3);
			this.set(q1.v).setMagnitudeTo(mag);
			return this;
		}
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
    var box = scrawl.makeBlock({
        width: 50,
        });
    box.get('width');               //returns 50
    box.get('height');              //returns 0
    box.get('favouriteAnimal');     //returns undefined
**/
	my.Base.prototype.get = function(item) {
		return my.xtGet(this[item], my.d[this.type][item]);
	};
	/**
Set attribute values. Multiple attributes can be set in the one call by including the attribute key:value pair in the argument object.

An attribute value will only be set if the object already has a default value for that attribute. This restricts the ability of coders to add attributes to Scrawl objects.
@method set
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
@example
    var box = scrawl.makeBlock({
        width: 50,
        height: 50
        });
    box.set({
        height: 100,
        favouriteAnimal: 'cat'
        });
    box.get('width');               //returns 50
    box.get('height');              //returns 100
    box.get('favouriteAnimal');     //returns undefined
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
    var box = scrawl.makeBlock({
        width: 50,
        height: 50
        });
    var newBox = box.clone({
        height: 100
        });
    newBox.get('width');        //returns 50
    newBox.get('height');       //returns 100
**/
	my.Base.prototype.clone = function(items) {
		var merged,
			keys,
			that,
			i,
			iz;
		merged = my.mergeOver(this.parse(), my.safeObject(items));
		delete merged.context; //required for successful cloning of entitys
		keys = Object.keys(this);
		that = this;
		for (i = 0, iz = keys.length; i < iz; i++) {
			if (my.isa(this[keys[i]], 'fn')) {
				merged[keys[i]] = that[keys[i]];
			}
		}
		return new my[this.type](merged);
	};
	/**
Turn the object into a JSON String
@method parse
@return object of object's currently set attributes
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
		var keys,
			i,
			iz;
		keys = Object.keys(this.work);
		for (i = 0, iz = keys.length; i < iz; i++) {
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
		/**
The coordinate Vector representing the object's rotation/flip point

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __startX__ - (Number) the x coordinate of the object's rotation/flip point, in pixels, from the left side of the object's cell
* __startY__ - (Number) the y coordinate of the object's rotation/flip point, in pixels, from the top side of the object's cell

@property start
@type Vector
**/
		var temp = my.safeObject(items.start);
		this.start = my.makeVector({
			x: my.xtGet(items.startX, temp.x, 0),
			y: my.xtGet(items.startY, temp.y, 0),
			name: this.type + '.' + this.name + '.start'
		});
		this.work.start = my.makeVector({
			name: this.type + '.' + this.name + '.work.start'
		});
		/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

SubScrawl, and all Objects that prototype chain to Subscrawl, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property handle
@type Object
**/
		temp = my.safeObject(items.handle);
		this.handle = my.makeVector({
			x: my.xtGet(items.handleX, temp.x, 0),
			y: my.xtGet(items.handleY, temp.y, 0),
			name: this.type + '.' + this.name + '.handle'
		});
		this.work.handle = my.makeVector({
			name: this.type + '.' + this.name + '.work.handle'
		});
		/**
The ENTITYNAME or POINTNAME of a entity or Point object to be used for setting this object's start point
@property pivot
@type String
@default null
**/
		this.pivot = my.xtGet(items.pivot, my.d[this.type].pivot);
		/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		this.scale = my.xtGet(items.scale, my.d[this.type].scale);
		/**
Current rotation of the entity, cell or element (in degrees)
@property roll
@type Number
@default 0
**/
		this.roll = my.xtGet(items.roll, my.d[this.type].roll);
		/**
Reflection flag; set to true to flip entity, cell or element along the Y axis
@property flipReverse
@type Boolean
@default false
**/
		this.flipReverse = my.xtGet(items.flipReverse, my.d[this.type].flipReverse);
		/**
Reflection flag; set to true to flip entity, cell or element along the X axis
@property flipUpend
@type Boolean
@default false
**/
		this.flipUpend = my.xtGet(items.flipUpend, my.d[this.type].flipUpend);
		/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the X axis
@property lockX
@type Boolean
@default false
**/
		this.lockX = my.xtGet(items.lockX, my.d[this.type].lockX);
		/**
Positioning flag; set to true to ignore path/pivot/mouse changes along the Y axis
@property lockY
@type Boolean
@default false
**/
		this.lockY = my.xtGet(items.lockY, my.d[this.type].lockY);
		/**
Positioning helper vector - includes a flag attribute for dirty checking
@property offset
@type Vector
@default zero vector
@private
**/
		this.offset = my.makeVector({
			name: this.type + '.' + this.name + '.offset'
		});
		this.offset.flag = false;
		/**
Index of mouse vector to use when pivot === 'mouse'

The Pad.mice object can hold details of multiple touch events - when an entity is assigned to a 'mouse', it needs to know which of those mouse trackers to use. Default: mouse (for the mouse cursor vector)
@property mouseIndex
@type String
@default 'mouse'
**/
		this.mouseIndex = my.xtGet(items.mouseIndex, 'mouse');
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
		start: {
			x: 0,
			y: 0
		},
		handle: {
			x: 0,
			y: 0
		},
		pivot: null,
		scale: 1,
		flipReverse: false,
		flipUpend: false,
		lockX: false,
		lockY: false,
		roll: 0,
		mouseIndex: 'mouse',
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
		var stat_positionGet = ['startX', 'startY', 'handleX', 'handleY'];
		if (my.contains(stat_positionGet, item)) {
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
	my.Position.prototype.setStart = function(items) {
		var temp;
		items = my.safeObject(items);
		if (!my.isa(this.start, 'vector')) {
			this.start = my.makeVector(items.start || this.start);
		}
		temp = my.safeObject(items.start);
		this.start.x = my.xtGet(items.startX, temp.x, this.start.x);
		this.start.y = my.xtGet(items.startY, temp.y, this.start.y);
		return this;
	};
	/**
Augments Base.setHandle(), to allow users to set the handle attributes using handle, handleX, handleY
@method setHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setHandle = function(items) {
		var temp;
		items = my.safeObject(items);
		if (!my.isa(this.handle, 'vector')) {
			this.handle = my.makeVector(items.handle || this.handle);
		}
		temp = my.safeObject(items.handle);
		this.handle.x = my.xtGet(items.handleX, temp.x, this.handle.x);
		this.handle.y = my.xtGet(items.handleY, temp.y, this.handle.y);
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
	my.Position.prototype.setDeltaStart = function(items) {
		var temp,
			x,
			y;
		items = my.safeObject(items);
		temp = my.safeObject(items.start);
		x = my.xtGet(items.startX, temp.x, 0);
		y = my.xtGet(items.startY, temp.y, 0);
		this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + x : my.addPercentages(this.start.x, x);
		this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + y : my.addPercentages(this.start.y, y);
	};
	/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts handle, handleX, handleY
@method setDeltaHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Position.prototype.setDeltaHandle = function(items) {
		var temp,
			x,
			y;
		items = my.safeObject(items);
		temp = my.safeObject(items.handle);
		x = my.xtGet(items.handleX, temp.x, 0);
		y = my.xtGet(items.handleY, temp.y, 0);
		this.handle.x = (my.isa(this.handle.x, 'num')) ? this.handle.x + x : my.addPercentages(this.handle.x, x);
		this.handle.y = (my.isa(this.handle.y, 'num')) ? this.handle.y + y : my.addPercentages(this.handle.y, y);
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
	my.Position.prototype.clone = function(items) {
		var temp,
			clone;
		items = my.safeObject(items);
		clone = my.Base.prototype.clone.call(this, items);
		temp = my.safeObject(items.start);
		clone.start = my.makeVector({
			x: my.xtGet(items.startX, temp.x, clone.start.x),
			y: my.xtGet(items.startY, temp.y, clone.start.y),
			name: clone.type + '.' + clone.name + '.start'
		});
		temp = my.safeObject(items.handle);
		clone.handle = my.makeVector({
			x: my.xtGet(items.handleX, temp.x, clone.handle.x),
			y: my.xtGet(items.handleY, temp.y, clone.handle.y),
			name: clone.type + '.' + clone.name + '.handle'
		});
		clone = this.animationPositionClone(clone, items);
		return clone;
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
		var height,
			width;
		switch (this.type) {
			case 'Block':
				height = (this.localHeight / this.scale) || this.get('height');
				width = (this.localWidth / this.scale) || this.get('width');
				break;
			case 'Picture':
			case 'Cell':
				height = (this.pasteData.h / this.scale) || this.get('height');
				width = (this.pasteData.w / this.scale) || this.get('width');
				break;
			default:
				height = this.height || this.get('height');
				width = this.width || this.get('width');
		}
		return my.Position.prototype.calculatePOV.call(this, this.work.handle, width, height, false);
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
		var height,
			width;
		height = this.localHeight / this.scale || this.height || this.get('height');
		width = this.localWidth / this.scale || this.width || this.get('width');
		return my.Position.prototype.calculatePOV.call(this, this.work.handle, width, height, true);
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
		var stat_horizontal = ['left', 'center', 'right'],
			stat_vertical = ['top', 'center', 'bottom'];
		if ((my.isa(result.x, 'str')) && !my.contains(stat_horizontal, result.x)) {
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
		if ((my.isa(result.y, 'str')) && !my.contains(stat_vertical, result.y)) {
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
		var scaleX,
			scaleY,
			handle;
		this.resetWork();
		scaleX = (my.isa(this.handle.x, 'str')) ? this.scale : 1;
		scaleY = (my.isa(this.handle.y, 'str')) ? this.scale : 1;
		handle = this.getPivotOffsetVector();
		handle.x *= scaleX;
		handle.y *= scaleY;
		return handle.reverse();
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
		var pivot,
			vector,
			entity,
			mouse,
			x, y,
			pad;
		if (my.xt(my.pointnames)) {
			pivot = my.point[this.pivot];
			if (pivot) {
				entity = my.entity[pivot.entity];
				vector = pivot.getCurrentCoordinates().rotate(entity.roll).vectorAdd(entity.start);
				this.start.x = (!this.lockX) ? vector.x : this.start.x;
				this.start.y = (!this.lockY) ? vector.y : this.start.y;
				return this;
			}
		}
		pivot = my.entity[this.pivot];
		if (pivot) {
			vector = (pivot.type === 'Particle') ? pivot.get('place') : pivot.start;
			this.start.x = (!this.lockX) ? vector.x : this.start.x;
			this.start.y = (!this.lockY) ? vector.y : this.start.y;
			return this;
		}
		if (this.pivot === 'mouse') {
			cell = my.cell[cell];
			pad = my.pad[cell.pad];
			x = (this.start.x.substring) ? this.convertX(this.start.x, cell) : this.start.x;
			y = (this.start.y.substring) ? this.convertY(this.start.y, cell) : this.start.y;
			x = (isNaN(x)) ? 0 : x;
			y = (isNaN(y)) ? 0 : y;
			mouse = this.correctCoordinates(pad.mice[this.mouseIndex], cell);
			if (this.oldX == null && this.oldY == null) { //jshint ignore:line
				this.oldX = x;
				this.oldY = y;
			}
			this.start.x = (!this.lockX) ? x + mouse.x - this.oldX : x;
			this.start.y = (!this.lockY) ? y + mouse.y - this.oldY : y;
			this.oldX = mouse.x;
			this.oldY = mouse.y;
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
	my.Position.prototype.correctCoordinates = function(coords, cell) {
		var vector,
			pad;
		coords = my.safeObject(coords);
		vector = my.v.set(coords);
		if (scrawl.xta(coords.x, coords.y)) {
			cell = (my.cell[cell]) ? my.cell[cell] : my.cell[my.pad[my.currentPad].base];
			pad = my.pad[cell.pad];
			if (pad.width !== cell.actualWidth) {
				vector.x /= (pad.width / cell.actualWidth);
			}
			if (pad.height !== cell.actualHeight) {
				vector.y /= (pad.height / cell.actualHeight);
			}
			return vector;
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
Stamp helper function - convert string start.x values to numerical values
@method convertX
@param {String} x coordinate String
@param {String} cell reference cell name String; or alternatively DOM canvas object
@return Number - x value
@private
**/
	my.Position.prototype.convertX = function(x, cell) {
		var width,
			result;
		switch (typeof cell) {
			case 'string':
				width = scrawl.cell[cell].actualWidth;
				break;
			case 'number':
				width = cell;
				break;
			default:
				width = cell.actualWidth;
		}

		result = parseFloat(x) / 100;
		if (isNaN(result)) {
			switch (x) {
				case 'right':
					return width;
				case 'center':
					return width / 2;
				default:
					return 0;
			}
		}
		return result * width;
	};
	/**
Stamp helper function - convert string start.y values to numerical values
@method convertY
@param {String} y coordinate String
@param {String} cell reference cell name String
@return Number - y value
@private
**/
	my.Position.prototype.convertY = function(y, cell) {
		var height,
			result;
		switch (typeof cell) {
			case 'string':
				height = scrawl.cell[cell].actualHeight;
				break;
			case 'number':
				height = cell;
				break;
			default:
				height = cell.actualHeight;
		}
		result = parseFloat(y) / 100;
		if (isNaN(result)) {
			switch (y) {
				case 'bottom':
					return height;
				case 'center':
					return height / 2;
				default:
					return 0;
			}
		}
		return result * height;
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
		/**
DOM element width
@property width
@type Number
@default 300
**/
		this.width = my.xtGet(items.width, my.d[this.type].width);
		/**
DOM element height
@property height
@type Number
@default 150
**/
		this.height = my.xtGet(items.height, my.d[this.type].height);
		/**
The object's scale value - larger values increase the object's size
@property scale
@type Number
@default 1
**/
		this.scale = my.xtGet(items.scale, my.d[this.type].scale);
		this.setLocalDimensions();
		this.stacksPageElementConstructor(items);
		/**
The mice attribute is an object containing supplemented vectors which hold real-time information about the current coordinates of the mouse pointer and any other pointer or touch instances occurring over the element

mice.mouse - always refers to the mouse pointer
mice.ui0, mice.ui1 etc - refers to pointer and touch events

@property mice
@type Object
@default {}
**/
		this.mice = {};
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
		width: 300,
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
		scale: 1,
		mice: {},
		/**
Set the interactive attribute to true to track mouse/pointer/touch events on the element. By default Pad and Stack objects set their element's interactivity to true, while Element objects set it to false 
@property interactive
@type Boolean
@default true (false for Element objects)
**/
		interactive: true,
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
	my.PageElement.prototype.get = function(item) {
		var element = this.getElement(),
			stat_pageElementGet = ['width', 'height', 'position'];
		if (my.contains(stat_pageElementGet, item)) {
			switch (item) {
				case 'width':
					return my.xtGet(this.localWidth, parseFloat(element.width), my.d[this.type].width);
				case 'height':
					return my.xtGet(this.localHeight, parseFloat(element.height), my.d[this.type].height);
				case 'position':
					return my.xtGet(this.position, element.style.position);
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
		if (my.xt(items.pivot)) {
			this.pivot = items.pivot;
			if (!this.pivot) {
				delete this.oldX;
				delete this.oldY;
			}
		}
		if (my.xt(items.mouse)) {
			this.initMouse(items.mouse);
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
	my.PageElement.prototype.setAccessibility = function(items) {
		var element;
		items = my.safeObject(items);
		element = this.getElement();
		if (my.xt(items.title)) {
			this.title = items.title;
			element.title = this.title;
		}
		if (my.xt(items.comment)) {
			this.comment = items.comment;
			element.setAttribute('data-comment', this.comment);
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
		var element = this.getElement(),
			offsetX = 0,
			offsetY = 0;
		if (element.offsetParent) {
			do {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			} while (element.offsetParent);
		}
		this.displayOffsetX = offsetX;
		this.displayOffsetY = offsetY;
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
	my.PageElement.prototype.setDimensions = function() {
		var element = this.getElement();
		element.style.width = this.localWidth + 'px';
		element.style.height = this.localHeight + 'px';
		return this;
	};
	/**
Retrieve details of the Mouse cursor position in relation to the DOM element's top left hand corner. Most useful for determining mouse cursor position over Stack and Pad (visible &lt;canvas&gt;) elements.

This function is also used to retrieve details of touch positions.

_Note: if changes are made elsewhere to the web page (DOM) after the page loads, the function .getDisplayOffsets() will need to be called to recalculate the element's position within the page - failure to do so will lead to this function returning incorrect data. getDisplayOffsets() does not need to be called during/after page scrolling._

By default, the function returns a single Vector containing either the first touch position or the current mouse cursor position.

The returned object is a Vector containing the mouse cursor's current x and y coordinates in relation to the DOM element's top left corner, together with the following additional attributes:

* __active__ - set to true if mouse is hovering over the element; false otherwise
* __id__ - event vector id (-1: mouse; 0+ touch or pointer)
* __order__ - event order (0: mouse; 1+ touch or pointer)

If an argument is supplied, then all currently existing mouse/touch vectors are returned as an array, with index 0 representing the mouse pointer, index 1 representing the first touch coordinate and additional indexes representing additional touch coordinates 
@method getMouse
@param {Boolean} item - true to return the array; false (default) to return either first touch or mouse Vector
@return Vector, or an array of Vectors containing localized coordinates, with additional attributes; if mouse/touch has been disabled for the DOM element, returns false
**/
	my.PageElement.prototype.getMouse = function(item) {
		var id, i, iz,
			r = [];
		if (my.xt(item)) {
			//boolean true returns the element's mice object
			if (my.xt(item) && my.isa(item, 'bool') && item) {
				return this.mice;
			}
			//an event object returns an array of relevant vectors
			else if (my.isa(item, 'event')) {
				if (item.changedTouches) {
					for (i = 0, iz = item.changedTouches.length; i < iz; i++) {
						id = 't' + item.changedTouches[i].identifier;
						r.push(this.mice[id]);
					}
					return r;
				}
				else if (item.pointerType) {
					if (item.pointerType !== 'touch') {
						id = item.pointerType;
					}
					else {
						id = 'p' + item.pointerId;
					}
					return [this.mice[id]];
				}
				else {
					return [this.mice.mouse];
				}
			}
			else {
				return false;
			}
		}
		else {
			//item undefined returns a vector, or false
			return my.xtGet(this.mice.t0, this.mice.p1, this.mice.pen, this.mice.mouse, false);
		}
	};
	/**
@method getMouseIdFromEvent
@param {Boolean} item - DOM event object
@return Array - mouse id strings associated with event(s)
**/
	my.PageElement.prototype.getMouseIdFromEvent = function(item) {
		var id, i, iz,
			r = [];
		if (my.isa(item, 'event')) {
			if (item.changedTouches) {
				for (i = 0, iz = item.changedTouches.length; i < iz; i++) {
					id = 't' + item.changedTouches[i].identifier;
					r.push(id);
				}
			}
			else if (item.pointerType) {
				if (item.pointerType !== 'touch') {
					id = item.pointerType;
				}
				else {
					id = 'p' + item.pointerId;
				}
				r.push(id);
			}
			else {
				r.push('mouse');
			}
		}
		return r;
	};
	/**
mousemove event listener function
@method handleMouseMove
@param {Object} e window.event
@param {Boolean} active - set only by handleMouseIn, handleMouseOut
@return This
@private
**/
	my.PageElement.prototype.handleMouseMove = function(e) {
		var mouseX, mouseY, maxX, maxY, wrapper, i, iz, j, jz, el, touches, newActive, id, altEl, altWrapper;

		if (my.xt(this.id)) {
			//invoked directly by DOM listeners
			wrapper = my.pad[this.id] || my.stack[this.id] || my.element[this.id] || false;
			el = this;
		}
		else {
			//invoked via scrawl function
			wrapper = this;
			el = this.getElement();
		}

		//touch event(s)
		if (e.changedTouches) {
			touches = e.changedTouches;

			//process each change in turn
			for (i = 0, iz = touches.length; i < iz; i++) {
				id = 't' + touches[i].identifier;

				//get rid of existing mouse vectors for a start - else things get very messy very quickly
				if (e.type === 'touchstart') {
					for (j = 0, jz = my.activeListeners.length; j < jz; j++) {
						altWrapper = my.pad[my.activeListeners[j]] || my.stack[my.activeListeners[j]] || my.element[my.activeListeners[j]] || false;
						if (altWrapper) {
							delete altWrapper.mice[id];
						}
					}
				}
				//determine if a vector already exists for this touch
				if (!my.xt(wrapper.mice[id])) {
					wrapper.mice[id] = my.makeVector({
						name: wrapper.type + '.' + wrapper.name + '.t.' + id
					});
					wrapper.mice[id].active = null;
					wrapper.mice[id].id = id;
				}

				//coordinates
				if (touches[i].pageX || touches[i].pageY) {
					mouseX = touches[i].pageX;
					mouseY = touches[i].pageY;
				}
				else if (touches[i].clientX || touches[i].clientY) {
					mouseX = touches[i].clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					mouseY = touches[i].clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
				maxX = wrapper.displayOffsetX + wrapper.localWidth;
				maxY = wrapper.displayOffsetY + wrapper.localHeight;

				//touchmove doesn't propogate beyond its triggering element
				if (e.type === 'touchmove') {
					for (j = 0, jz = my.activeListeners.length; j < jz; j++) {
						if (this.name !== my.activeListeners[j]) {
							altEl = my.canvas[my.activeListeners[j]] || my.stk[my.activeListeners[j]] || my.elm[my.activeListeners[j]] || false;
							if (altEl) {
								my.triggerTouchFollow(e, altEl);
							}
						}
					}
				}
				//touchleave and touchenter are deprecated - have to spoof them via custom events
				newActive = (mouseX >= wrapper.displayOffsetX && mouseX <= maxX && mouseY >= wrapper.displayOffsetY && mouseY <= maxY) ? true : false;
				if (wrapper.mice[id].active !== newActive) {
					wrapper.mice[id].active = newActive;
					//only trigger enter/leave if we're currently in the middle of a move event
					if (e.type === 'touchmove' || e.type === 'touchfollow') {
						if (newActive) {
							//touchenter
							my.triggerTouchEnter(e, el);
						}
						else {
							//touchleave
							my.triggerTouchLeave(e, el);
						}
					}
				}

				//finalize coordinates
				wrapper.mice[id].x = (mouseX - wrapper.displayOffsetX);
				wrapper.mice[id].y = (mouseY - wrapper.displayOffsetY);
				if (wrapper.type === 'Pad') {
					wrapper.mice[id].x = Math.round(wrapper.mice[id].x / wrapper.scale || 1);
					wrapper.mice[id].y = Math.round(wrapper.mice[id].y / wrapper.scale || 1);
				}
				if (e.type === 'touchup' || e.type === 'touchleave') {
					wrapper.mice[id].x = null;
					wrapper.mice[id].y = null;
				}
			}
		}
		//pointer event
		else if (e.pointerType) {
			id = (e.pointerType !== 'touch') ? e.pointerType : 'p' + e.pointerId;

			//determine if a vector already exists for this pointer
			if (!my.xt(wrapper.mice[id])) {
				wrapper.mice[id] = my.makeVector({
					name: wrapper.type + '.' + wrapper.name + '.p.' + id
				});
				wrapper.mice[id].active = null;
				wrapper.mice[id].id = id;
			}

			//pointer coordinates
			wrapper.mice[id].active = false;
			if (e.offsetX >= 0 && e.offsetX <= wrapper.localWidth && e.offsetY >= 0 && e.offsetY <= wrapper.localHeight) {
				wrapper.mice[id].active = true;
			}
			wrapper.mice[id].x = Math.round(e.offsetX);
			wrapper.mice[id].y = Math.round(e.offsetY);
			if (wrapper.type === 'Pad') {
				wrapper.mice[id].x = Math.round(wrapper.mice[id].x / (wrapper.scale || 1));
				wrapper.mice[id].y = Math.round(wrapper.mice[id].y / (wrapper.scale || 1));
			}
		}
		//mouse/pen event
		else {
			if (!my.xt(wrapper.mice.mouse)) {
				wrapper.mice.mouse = my.makeVector({
					name: wrapper.type + '.' + wrapper.name + '.ui.mouse'
				});
				wrapper.mice.mouse.active = null;
				wrapper.mice.mouse.id = 'mouse';
			}

			if (e.pageX || e.pageY) {
				mouseX = e.pageX;
				mouseY = e.pageY;
			}
			else if (e.clientX || e.clientY) {
				mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			maxX = wrapper.displayOffsetX + wrapper.localWidth;
			maxY = wrapper.displayOffsetY + wrapper.localHeight;
			wrapper.mice.mouse.active = false;
			if (mouseX >= wrapper.displayOffsetX && mouseX <= maxX && mouseY >= wrapper.displayOffsetY && mouseY <= maxY) {
				wrapper.mice.mouse.active = true;
			}
			wrapper.mice.mouse.x = (mouseX - wrapper.displayOffsetX);
			wrapper.mice.mouse.y = (mouseY - wrapper.displayOffsetY);
			if (wrapper.type === 'Pad') {
				wrapper.mice.mouse.x = Math.round(wrapper.mice.mouse.x / (wrapper.scale || 1));
				wrapper.mice.mouse.y = Math.round(wrapper.mice.mouse.y / (wrapper.scale || 1));
			}
		}
		wrapper.handleMouseTilt(e);
		return wrapper;
	};
	/**
mouseTilt hook function - amended by scrawlStacks module
@method handleMouseTilt
@param {Object} e window.event
@return This
@private
**/
	my.PageElement.prototype.handleMouseTilt = function(e) {};
	/**
Adds event listeners to the element
@method addMouseMove
@return This
@chainable
@private
**/
	my.PageElement.prototype.addMouseMove = function() {
		var el = this.getElement();
		my.addListener(['up', 'down', 'move', 'enter', 'leave'], this.handleMouseMove, el);
		my.pushUnique(my.activeListeners, this.name);
		return this;
	};
	/**
Remove event listeners from the element
@method removeMouseMove
@return This
@chainable
@private
**/
	my.PageElement.prototype.removeMouseMove = function() {
		var el = this.getElement();
		my.removeListener(['up', 'down', 'move', 'enter', 'leave'], this.handleMouseMove, el);
		my.removeItem(my.activeListeners, this.name);
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
	my.Pad = function(items) {
		var display,
			base,
			canvas;
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
			if (this.name.match(/___/)) {
				this.name = this.name.replace(/___/g, '_');
			}
			items.canvasElement.id = this.name;

			// register this Pad in library
			my.pad[this.name] = this;
			my.pushUnique(my.padnames, this.name);

			/**
Array of CELLNAME Strings associated with this Pad
@property cells
@type Array
@default []
**/
			// prepare for cell creation
			this.cells = [];

			// create a wrapper for the display canvas element
			display = my.makeCell({
				name: this.name,
				pad: this.name,
				canvas: items.canvasElement,
				compiled: false,
				shown: false,
				width: this.localWidth,
				height: this.localHeight
			});
			my.pushUnique(this.cells, display.name);
			/**
Pad's display (visible) &lt;canvas&gt; element - CELLNAME
@property display
@type String
@default ''
**/
			this.display = display.name;

			// create a new canvas element to act as the base
			canvas = items.canvasElement.cloneNode(true);
			canvas.setAttribute('id', this.name + '_base');

			// create a wrapper for the base canvas element
			base = my.makeCell({
				name: this.name + '_base',
				pad: this.name,
				canvas: canvas,
				compileOrder: 9999,
				shown: false,
				width: '100%',
				height: '100%'
			});
			my.pushUnique(this.cells, base.name);
			/**
Pad's base (hidden) &lt;canvas&gt; element - CELLNAME
@property base
@type String
@default ''
**/
			this.base = base.name;
			/**
Pad's currently active &lt;canvas&gt; element - CELLNAME

//not convinced there's any point in keeping this attribute anymore - take it out?

@property current
@type String
@default ''
@deprecated
**/
			this.current = base.name;

			// finalise stuff for this Pad
			this.setDisplayOffsets();
			this.setAccessibility(items);
			this.filtersPadInit();
			this.padStacksConstructor(items);
			this.interactive = my.xtGet(items.interactive, true);
			if (this.interactive) {
				this.addMouseMove();
			}

			// return this mouseArray
			return this;
		}

		// on failure, return false
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
		cells: [],
		display: '',
		base: '',
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
	my.Pad.prototype.set = function(items) {
		var base,
			display;
		my.PageElement.prototype.set.call(this, items);
		items = my.safeObject(items);
		display = my.cell[this.display];
		base = my.cell[this.base];
		if (my.xto(items.scale, items.width, items.height)) {
			display.set({
				pasteWidth: (items.width) ? this.localWidth : display.pasteWidth,
				pasteHeight: (items.height) ? this.localHeight : display.pasteHeight,
				scale: items.scale || display.scale
			});
			base.set({
				scale: items.scale || base.scale
			});
		}
		this.padStacksSet(items);
		if (my.xto(items.start, items.startX, items.startY, items.handle, items.handleX, items.handleY, items.scale, items.width, items.height)) {
			this.setDisplayOffsets();
		}
		if (my.xto(items.backgroundColor, items.globalAlpha, items.globalCompositeOperation)) {
			base.set({
				backgroundColor: items.backgroundColor || base.backgroundColor,
				globalAlpha: items.globalAlpha || base.globalAlpha,
				globalCompositeOperation: items.globalCompositeOperation || base.globalCompositeOperation
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
	my.Pad.prototype.clear = function() {
		var cell,
			i,
			iz;
		for (i = 0, iz = this.cells.length; i < iz; i++) {
			cell = my.cell[this.cells[i]];
			if (cell.rendered && cell.cleared) {
				cell.clear();
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
	my.Pad.prototype.compile = function() {
		var cell,
			i,
			iz;
		this.sortCellsCompile();
		for (i = 0, iz = this.cells.length; i < iz; i++) {
			cell = my.cell[this.cells[i]];
			if (cell.rendered && cell.compiled) {
				cell.compile();
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
	my.Pad.prototype.show = function() {
		var display,
			base,
			cell,
			i,
			iz;
		display = my.cell[this.display];
		base = my.cell[this.base];
		this.sortCellsShow();
		for (i = 0, iz = this.cells.length; i < iz; i++) {
			cell = my.cell[this.cells[i]];
			if (cell.rendered && cell.shown) {
				base.copyCellToSelf(cell);
			}
		}
		display.copyCellToSelf(base, true);
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
	my.Pad.prototype.addNewCell = function(data) {
		var canvas,
			cell;
		data = my.safeObject(data);
		if (my.isa(data.name, 'str')) {
			data.width = Math.round(data.width) || this.width;
			data.height = Math.round(data.height) || this.height;
			canvas = document.createElement('canvas');
			canvas.setAttribute('id', data.name);
			canvas.setAttribute('height', data.height);
			canvas.setAttribute('width', data.width);
			data.pad = this.name;
			data.canvas = canvas;
			cell = my.makeCell(data);
			my.pushUnique(this.cells, cell.name);
			return cell;
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
	my.Pad.prototype.addCells = function() {
		var slice,
			i,
			iz;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			if (my.cell[slice[i]]) {
				this.cells.push(slice[i]);
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
	my.Pad.prototype.setAccessibility = function(items) {
		var element;
		items = my.safeObject(items);
		element = this.getElement();
		if (my.xt(items.title)) {
			this.title = items.title;
			element.title = this.title;
		}
		if (my.xt(items.comment)) {
			this.comment = items.comment;
			element.setAttribute('data-comment', this.comment);
			element.innerHTML = '<p>' + this.comment + '</p>';
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
		var element = this.getElement();
		element.width = this.localWidth;
		element.height = this.localHeight;
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
		copy: {
			x: 0,
			Y: 0
		},
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
	my.Cell.prototype.coreCellInit = function(items) {
		var temp,
			context;
		my.Position.call(this, items); //handles items.start, items.startX, items.startY
		my.Base.prototype.set.call(this, items);
		my.canvas[this.name] = items.canvas;
		my.context[this.name] = items.canvas.getContext('2d');
		my.cell[this.name] = this;
		my.pushUnique(my.cellnames, this.name);
		this.pad = my.xtGet(items.pad, false);
		temp = my.safeObject(items.copy);
		this.copy = my.makeVector({
			x: my.xtGet(items.copyX, temp.x, 0),
			y: my.xtGet(items.copyY, temp.y, 0),
			name: this.type + '.' + this.name + '.copy'
		});
		this.work.copy = my.makeVector({
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
		context = my.makeContext({
			name: this.name,
			cell: my.context[this.name]
		});
		this.context = context.name;
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
		this.globalCompositeOperation = my.xtGet(items.globalCompositeOperation, 'source-over');
		this.globalAlpha = my.xtGet(items.globalAlpha, 1);
		this.groups = (my.xt(items.groups)) ? [].concat(items.groups) : []; //must be set
		my.makeGroup({
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
	my.Cell.prototype.get = function(item) {
		var stat1 = ['pasteX', 'pasteY', 'copyX', 'copyY'],
			stat2 = ['paste', 'copy'],
			stat3 = ['width', 'height'];
		if (my.contains(stat1, item)) {
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
		if (my.contains(stat2, item)) {
			switch (item) {
				case 'paste':
					return this.start.getVector();
				case 'copy':
					return this.copy.getVector();
			}
		}
		if (my.contains(stat3, item)) {
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
	my.Cell.prototype.setPasteVector = function(items, recalc) {
		var temp;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		temp = my.safeObject(items.paste);
		this.start.x = my.xtGet(items.pasteX, temp.x, this.start.x);
		this.start.y = my.xtGet(items.pasteY, temp.y, this.start.y);
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
	my.Cell.prototype.setCopyVector = function(items, recalc) {
		var temp;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		temp = my.safeObject(items.copy);
		this.copy.x = my.xtGet(items.copyX, temp.x, this.copy.x);
		this.copy.y = my.xtGet(items.copyY, temp.y, this.copy.y);
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
	my.Cell.prototype.setDeltaActualHeight = function(items, recalc) {
		var height;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		height = my.xtGet(items.actualHeight, items.height);
		this.actualHeight = (my.isa(height, 'num')) ? this.actualHeight + height : this.actualHeight;
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
	my.Cell.prototype.setDeltaActualWidth = function(items, recalc) {
		var width;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		width = my.xtGet(items.actualWidth, items.width);
		this.actualWidth = (my.isa(width, 'num')) ? this.actualWidth + width : this.actualWidth;
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
	my.Cell.prototype.setDeltaPasteHeight = function(items, recalc) {
		var height;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		height = my.xtGet(items.pasteHeight, items.height);
		this.pasteHeight = (my.isa(this.pasteHeight, 'num')) ? this.pasteHeight + height : my.addPercentages(this.pasteHeight, height);
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
	my.Cell.prototype.setDeltaPasteWidth = function(items, recalc) {
		var width;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		width = my.xtGet(items.pasteWidth, items.width);
		this.pasteWidth = (my.isa(this.pasteWidth, 'num')) ? this.pasteWidth + width : my.addPercentages(this.pasteWidth, width);
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
	my.Cell.prototype.setDeltaPaste = function(items, recalc) {
		var temp,
			x,
			y;
		items = my.safeObject(items);
		recalc = my.xtGet(recalc, true);
		temp = my.safeObject(items.paste);
		x = my.xtGet(items.pasteX, temp.x, 0);
		y = my.xtGet(items.pasteY, temp.y, 0);
		this.start.x = (my.isa(this.start.x, 'num')) ? this.start.x + x : my.addPercentages(this.start.x, x);
		this.start.y = (my.isa(this.start.y, 'num')) ? this.start.y + y : my.addPercentages(this.start.y, y);
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
	my.Cell.prototype.setDeltaCopy = function(items, recalc) {
		var temp,
			x,
			y;
		items = my.safeObject(items);
		temp = my.safeObject(items.copy);
		recalc = my.xtGet(recalc, true);
		x = my.xtGet(items.copyX, temp.x, 0);
		y = my.xtGet(items.copyY, temp.y, 0);
		this.copy.x = (my.isa(x, 'num')) ? this.copy.x + x : my.addPercentages(this.copy.x, x);
		this.copy.y = (my.isa(y, 'num')) ? this.copy.y + y : my.addPercentages(this.copy.y, y);
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
	my.Cell.prototype.setEngine = function(entity) {
		var cellContext,
			entityContext,
			cellEngine,
			fillStyle,
			strokeStyle,
			design,
			changes,
			stat1 = ['Gradient', 'RadialGradient', 'Pattern'];
		if (!entity.fastStamp) {
			cellContext = my.ctx[this.context];
			entityContext = my.ctx[entity.context];
			changes = entityContext.getChanges(cellContext, entity.scale, entity.scaleOutline);
			if (changes) {
				cellEngine = my.context[this.name];
				for (var item in changes) {
					design = false;
					if (item[0] < 'm') {
						if (item[0] < 'l') {
							switch (item) {
								case 'fillStyle':
									if (my.xt(my.design[changes[item]])) {
										design = my.design[changes[item]];
										if (my.contains(stat1, design.type)) {
											design.update(entity.name, this.name);
										}
										fillStyle = design.getData();
									}
									else {
										fillStyle = changes[item];
									}
									cellEngine.fillStyle = fillStyle;
									break;
								case 'font':
									cellEngine.font = changes[item];
									break;
								case 'globalAlpha':
									cellEngine.globalAlpha = changes[item];
									break;
								case 'globalCompositeOperation':
									cellEngine.globalCompositeOperation = changes[item];
									break;
							}
						}
						else {
							switch (item) {
								case 'lineCap':
									cellEngine.lineCap = changes[item];
									break;
								case 'lineDash':
									cellEngine.mozDash = changes[item];
									cellEngine.lineDash = changes[item];
									try {
										cellEngine.setLineDash(changes[item]);
									}
									catch (e) {}
									break;
								case 'lineDashOffset':
									cellEngine.mozDashOffset = changes[item];
									cellEngine.lineDashOffset = changes[item];
									break;
								case 'lineJoin':
									cellEngine.lineJoin = changes[item];
									break;
								case 'lineWidth':
									cellEngine.lineWidth = changes[item];
									break;
							}
						}
					}
					else {
						if (item[0] == 's') {
							switch (item) {
								case 'shadowBlur':
									cellEngine.shadowBlur = changes[item];
									break;
								case 'shadowColor':
									cellEngine.shadowColor = changes[item];
									break;
								case 'shadowOffsetX':
									cellEngine.shadowOffsetX = changes[item];
									break;
								case 'shadowOffsetY':
									cellEngine.shadowOffsetY = changes[item];
									break;
								case 'strokeStyle':
									if (my.xt(my.design[changes[item]])) {
										design = my.design[changes[item]];
										if (my.contains(stat1, design.type)) {
											design.update(entity.name, this.name);
										}
										strokeStyle = design.getData();
									}
									else {
										strokeStyle = changes[item];
									}
									cellEngine.strokeStyle = strokeStyle;
									break;
							}
						}
						else {
							switch (item) {
								case 'miterLimit':
									cellEngine.miterLimit = changes[item];
									break;
								case 'textAlign':
									cellEngine.textAlign = changes[item];
									break;
								case 'textBaseline':
									cellEngine.textBaseline = changes[item];
									break;
								case 'winding':
									cellEngine.mozFillRule = changes[item];
									cellEngine.msFillRule = changes[item];
									break;
							}
						}
					}
					cellContext[item] = changes[item];
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
		var cellContext,
			cellEngine;
		cellEngine = my.context[this.name];
		cellContext = my.ctx[this.context];
		cellEngine.setTransform(1, 0, 0, 1, 0, 0);
		cellEngine.clearRect(0, 0, this.actualWidth, this.actualHeight);
		if (this.backgroundColor !== 'rgba(0,0,0,0)') {
			cellEngine.fillStyle = this.backgroundColor;
			cellEngine.fillRect(0, 0, this.actualWidth, this.actualHeight);
			cellContext.fillStyle = this.backgroundColor;
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
	my.Cell.prototype.compile = function() {
		var group,
			i,
			iz;
		this.groups.sort(function(a, b) {
			return my.group[a].order - my.group[b].order;
		});
		for (i = 0, iz = this.groups.length; i < iz; i++) {
			group = my.group[this.groups[i]];
			if (group.get('visibility')) {
				group.stamp(false, this.name);
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
	my.Cell.prototype.rotateDestination = function(engine) {
		var reverse = (this.flipReverse) ? -1 : 1,
			upend = (this.flipUpend) ? -1 : 1,
			rotation = (this.addPathRoll) ? this.roll + this.pathRoll : this.roll,
			cos,
			sin;
		rotation *= 0.01745329251;
		cos = Math.cos(rotation);
		sin = Math.sin(rotation);
		engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), this.pasteData.x, this.pasteData.y);
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
	my.Cell.prototype.setPaste = function() {
		var pad = my.pad[this.pad],
			display = my.cell[pad.display],
			base = my.cell[pad.base],
			stack = (my.xt(pad.group)) ? true : false,
			isBase = (this.name === pad.base) ? true : false,
			width, height;
		if (my.xta(display, base)) {
			width = (this.name === pad.base) ? display.actualWidth : base.actualWidth;
			height = (this.name === pad.base) ? display.actualHeight : base.actualHeight;
			this.pasteData.x = this.start.x;
			if (my.isa(this.pasteData.x, 'str')) {
				this.pasteData.x = this.convertX(this.pasteData.x, width);
			}
			this.pasteData.y = this.start.y;
			if (my.isa(this.pasteData.y, 'str')) {
				this.pasteData.y = this.convertY(this.pasteData.y, height);
			}
			this.pasteData.w = this.pasteWidth;
			if (my.isa(this.pasteData.w, 'str')) {
				this.pasteData.w = this.convertX(this.pasteData.w, width);
			}
			if(!isBase || !stack){
				this.pasteData.w *= this.scale;
			}
			this.pasteData.h = this.pasteHeight;
			if (my.isa(this.pasteData.h, 'str')) {
				this.pasteData.h = this.convertY(this.pasteData.h, height);
			}
			if(!isBase || !stack){
				this.pasteData.h *= this.scale;
			}
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
		}
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
	my.Cell.prototype.copyCellToSelf = function(cell) {
		var destinationContext,
			destinationEngine,
			sourceEngine,
			sourceCanvas;
		cell = (my.isa(cell, 'str')) ? my.cell[cell] : cell;
		if (my.xt(cell)) {
			destinationEngine = my.context[this.name];
			destinationContext = my.ctx[this.name];
			sourceEngine = my.context[cell.name];
			sourceCanvas = my.canvas[cell.name];
			if (cell.globalAlpha !== destinationContext.globalAlpha) {
				destinationEngine.globalAlpha = cell.globalAlpha;
				destinationContext.globalAlpha = cell.globalAlpha;
			}
			if (cell.globalCompositeOperation !== destinationContext.globalCompositeOperation) {
				destinationEngine.globalCompositeOperation = cell.globalCompositeOperation;
				destinationContext.globalCompositeOperation = cell.globalCompositeOperation;
			}
			sourceEngine.setTransform(1, 0, 0, 1, 0, 0);
			cell.prepareToCopyCell(destinationEngine);
			destinationEngine.drawImage(sourceCanvas, cell.copyData.x, cell.copyData.y, cell.copyData.w, cell.copyData.h, cell.offset.x, cell.offset.y, cell.pasteData.w, cell.pasteData.h);
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
		var context,
			engine;
		engine = my.context[this.name];
		context = my.ctx[this.context];
		engine.shadowOffsetX = 0.0;
		engine.shadowOffsetY = 0.0;
		engine.shadowBlur = 0.0;
		context.shadowOffsetX = 0.0;
		context.shadowOffsetY = 0.0;
		context.shadowBlur = 0.0;
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
		var cellContext,
			entityContext,
			engine;
		engine = my.context[this.name];
		cellContext = my.ctx[this.context];
		entityContext = my.ctx[entitycontext];
		engine.shadowOffsetX = entityContext.shadowOffsetX;
		engine.shadowOffsetY = entityContext.shadowOffsetY;
		engine.shadowBlur = entityContext.shadowBlur;
		cellContext.shadowOffsetX = entityContext.shadowOffsetX;
		cellContext.shadowOffsetY = entityContext.shadowOffsetY;
		cellContext.shadowBlur = entityContext.shadowBlur;
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
		var context,
			engine;
		engine = my.context[this.name];
		context = my.ctx[this.context];
		engine.fillStyle = 'rgba(0, 0, 0, 0)';
		engine.strokeStyle = 'rgba(0, 0, 0, 0)';
		engine.shadowColor = 'rgba(0, 0, 0, 0)';
		context.fillStyle = 'rgba(0, 0, 0, 0)';
		context.strokeStyle = 'rgba(0, 0, 0, 0)';
		context.shadowColor = 'rgba(0, 0, 0, 0)';
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
		var pad = my.pad[this.pad],
			canvas = my.canvas[this.name],
			width = my.xtGet(items.width, items.actualWidth, this.actualWidth),
			height = my.xtGet(items.height, items.actualHeight, this.actualHeight);
		if (pad) {
			if (my.isa(width, 'str')) {
				width = (parseFloat(width) / 100) * (pad.localWidth / pad.scale);
			}
			if (my.isa(height, 'str')) {
				height = (parseFloat(height) / 100) * (pad.localHeight / pad.scale);
			}
		}
		canvas.width = width;
		canvas.height = height;
		this.actualWidth = width;
		this.actualHeight = height;
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
		var x,
			y,
			width,
			height,
			label;
		dimensions = my.safeObject(dimensions);
		label = (my.isa(dimensions.name, 'str')) ? this.name + '_' + dimensions.name : this.name + '_imageData';
		x = my.xtGet(dimensions.x, 0);
		y = my.xtGet(dimensions.y, 0);
		width = my.xtGet(dimensions.width, this.actualWidth);
		height = my.xtGet(dimensions.height, this.actualHeight);
		my.imageData[label] = my.context[this.name].getImageData(x, y, width, height);
		return label;
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
	my.Context.prototype.getContextFromEngine = function(ctx) {
		for (var i = 0, iz = my.contextKeys.length; i < iz; i++) {
			this[my.contextKeys[i]] = ctx[my.contextKeys[i]];
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
	my.Context.prototype.getChanges = function(ctx, scale, doscale) {
		var stat1 = ['lineWidth', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'],
			stat2 = ['fillStyle', 'strokeStyle', 'shadowColor'],
			stat3 = ['fillStyle', 'strokeStyle'],
			stat4 = ['lineDash'],
			stat5 = ['name', 'timestamp'],
			stat6 = ['Gradient', 'RadialGradient', 'Pattern'],
			i,
			iz,
			j,
			jz,
			count,
			temp,
			tempColor,
			myReturn = {};
		count = 0;
		for (i = 0, iz = my.contextKeys.length; i < iz; i++) {
			temp = this.get(my.contextKeys[i]);
			//handle scalable items
			if (my.contains(stat1, my.contextKeys[i])) {
				if (doscale) {
					if (temp * scale !== ctx[my.contextKeys[i]]) {
						myReturn[my.contextKeys[i]] = temp * scale;
						count++;
					}
				}
				else {
					if (temp !== ctx[my.contextKeys[i]]) {
						myReturn[my.contextKeys[i]] = temp;
						count++;
					}
				}
			}
			//handle fillStyle, strokeStyle, shadowColor that use Color design objects
			else if (my.contains(stat2, my.contextKeys[i]) && my.design[temp] && my.design[temp].type === 'Color') {
				tempColor = my.design[temp].getData();
				if (tempColor !== ctx[my.contextKeys[i]]) {
					myReturn[my.contextKeys[i]] = tempColor;
					count++;
				}
			}
			//handle fillStyle, strokeStyle that use RadialGradient, Gradient design objects
			else if (my.contains(stat3, my.contextKeys[i]) && my.design[temp] && my.contains(stat6, my.design[temp].type) && my.design[temp].autoUpdate) {
				myReturn[my.contextKeys[i]] = temp;
				count++;
			}
			//handle linedash - an array that needs deep inspection to check for difference
			else if (my.contains(stat4, my.contextKeys[i]) && my.xt(ctx.lineDash)) {
				if (temp.length !== ctx.lineDash.length) {
					myReturn.lineDash = temp;
					count++;
				}
				else {
					for (j = 0, jz = temp.length; j < jz; j++) {
						if (temp[j] !== ctx.lineDash[j]) {
							myReturn.lineDash = temp;
							count++;
							break;
						}
					}
				}
			}
			//exclude items that have no equivalent in the context engine
			else if (my.contains(stat5, my.contextKeys[i])) {}
			//capture all other changes
			else {
				if (temp !== ctx[my.contextKeys[i]]) {
					myReturn[my.contextKeys[i]] = temp;
					count++;
				}
			}
		}
		return (count > 0) ? myReturn : false;
	};

	/**
# Group

## Instantiation

* scrawl.makeGroup()

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
		/**
Array of SPRITENAME Strings of entitys that comprise this Group
@property entitys
@type Array
@default []
**/
		this.entitys = (my.xt(items.entitys)) ? [].concat(items.entitys) : [];
		/**
CELLNAME of the default Cell object to which this group is associated
@property cell
@type String
@default ''
**/
		this.cell = items.cell || my.pad[my.currentPad].current;
		/**
Group order value - lower order Groups are drawn on &lt;canvas&gt; elements before higher order Groups
@property order
@type Number
@default 0
**/
		this.order = my.xtGet(items.order, 0);
		/**
Visibility flag - Group entitys will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		this.visibility = my.xtGet(items.visibility, true);
		/**
Sorting flag - when set to true, Groups will sort their constituent entity object according to their entity.order attribute for each iteration of the display cycle
@property entitySort
@type Boolean
@default true
**/
		this.entitySort = my.xtGet(items.entitySort, true);
		/**
Collision checking radius, in pixels - as a first step in a collision check, the Group will winnow potential collisions according to how close the checked entity is to the current reference entity or mouse coordinate; when set to 0, this collision check step is skipped and all entitys move on to the next step
@property regionRadius
@type Number
@default 0
**/
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
		entitys: [],
		cell: '',
		order: 0,
		visibility: true,
		entitySort: true,
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
	my.Group.prototype.forceStamp = function(method, cell) {
		var visibility = this.visibility;
		this.visibility = true;
		this.stamp(method, cell);
		this.visibility = visibility;
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
		var entity,
			i,
			iz;
		if (this.visibility) {
			this.sortEntitys();
			for (i = 0, iz = this.entitys.length; i < iz; i++) {
				entity = my.entity[this.entitys[i]];
				if (entity) {
					entity.group = this.name;
					entity.stamp(method, cell);
				}
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
	my.Group.prototype.addEntitysToGroup = function() {
		var slice,
			i,
			iz,
			e;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			e = slice[i];
			if (my.xt(e)) {
				if (my.isa(e, 'str')) {
					my.pushUnique(this.entitys, e);
				}
				else {
					if (my.xt(e.name)) {
						my.pushUnique(this.entitys, e.name);
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
	my.Group.prototype.removeEntitysFromGroup = function() {
		var slice,
			i,
			iz,
			e;
		slice = Array.prototype.slice.call(arguments);
		if (Array.isArray(slice[0])) {
			slice = slice[0];
		}
		for (i = 0, iz = slice.length; i < iz; i++) {
			e = slice[i];
			if (my.xt(e)) {
				if (my.isa(e, 'str')) {
					my.removeItem(this.entitys, e);
				}
				else {
					if (my.xt(e.name)) {
						my.removeItem(this.entitys, e.name);
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
	my.Group.prototype.updateEntitysBy = function(items) {
		var i,
			iz;
		items = my.safeObject(items);
		for (i = 0, iz = this.entitys.length; i < iz; i++) {
			my.entity[this.entitys[i]].setDelta({
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
	my.Group.prototype.setEntitysTo = function(items) {
		var i,
			iz;
		for (i = 0, iz = this.entitys.length; i < iz; i++) {
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
		var pivot,
			pivotVector,
			entity,
			entityVector,
			i,
			iz,
			arg = {
				pivot: 0,
				handleX: 0,
				handleY: 0
			};
		item = (my.isa(item, 'str')) ? item : false;
		if (item) {
			pivot = my.entity[item] || my.point[item] || false;
			if (pivot) {
				pivotVector = (pivot.type === 'Point') ? pivot.local : pivot.start;
				for (i = 0, iz = this.entitys.length; i < iz; i++) {
					entity = my.entity[this.entitys[i]];
					entityVector = my.v.set(entity.start);
					entityVector.vectorSubtract(pivotVector);
					arg.pivot = item;
					arg.handleX = -entityVector.x;
					arg.handleY = -entityVector.y;
					entity.set(arg);
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
		var entity,
			vector,
			coordinate,
			i;
		items = my.safeObject(items);
		coordinate = my.v.set(items);
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell);
		this.sortEntitys();
		for (i = this.entitys.length - 1; i >= 0; i--) {
			entity = my.entity[this.entitys[i]];
			if (this.regionRadius) {
				entity.resetWork();
				vector = entity.work.start.vectorSubtract(coordinate);
				if (vector.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (entity.checkHit(coordinate)) {
				return entity;
			}
		}
		return false;
	};
	/**
Check all entitys in the Group to see which one(s) are associated with a particular mouse index
@method getEntitysByMouseIndex
@param {String} item Mouse index string
@return Array of Entity objects
**/
	my.Group.prototype.getEntitysByMouseIndex = function(item) {
		var result = [],
			i, iz,
			entity;
		if (my.isa(item, 'str')) {
			for (i = 0, iz = this.entitys.length; i < iz; i++) {
				entity = my.entity[this.entitys[i]];
				if (entity.mouseIndex === item) {
					result.push(entity);
				}
			}
		}
		return result;
	};
	/**
Check all entitys in the Group to see if they are colliding with the supplied coordinate. The check is done in reverse order after the entitys have been sorted; all entitys (in the group) colliding with the coordinate are returned as an array of entity objects
@method getEntityAt
@param {Vector} items Coordinate vector; alternatively an Object with x and y attributes can be used
@return Entity object, or false if no entitys are colliding with the coordinate
**/
	my.Group.prototype.getAllEntitysAt = function(items) {
		var entity,
			vector,
			coordinate,
			results,
			i;
		items = my.safeObject(items);
		coordinate = my.v.set(items);
		results = [];
		coordinate = my.Position.prototype.correctCoordinates(coordinate, this.cell);
		this.sortEntitys();
		for (i = this.entitys.length - 1; i >= 0; i--) {
			entity = my.entity[this.entitys[i]];
			if (this.regionRadius) {
				entity.resetWork();
				vector = entity.work.start.vectorSubtract(coordinate);
				if (vector.getMagnitude() > this.regionRadius) {
					continue;
				}
			}
			if (entity.checkHit(coordinate)) {
				results.push(entity);
			}
		}
		return (results.length > 0) ? results : false;
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
		var myContext = my.makeContext(items);
		/**
CTXNAME of this Entity's Context object
@property context
@type String
@default ''
@private
**/
		this.context = myContext.name;
		/**
GROUPNAME String for this entity's default group

_Note: a entity can belong to more than one group by being added to other Group objects via the __scrawl.addEntitysToGroups()__ and __Group.addEntityToGroup()__ functions_
@property group
@type String
@default ''
**/
		this.group = this.getGroup(items);
		/**
Display cycle flag; if set to true, entity will not change the &lt;canvas&gt; element's context engine's settings before drawing itself on the cell
@property fastStamp
@type Boolean
@default false
**/
		this.fastStamp = my.xtGet(items.fastStamp, false);
		/**
Scaling flag; set to true to ensure lineWidth scales in line with the scale attribute value
@property scaleOutline
@type Boolean
@default true
**/
		this.scaleOutline = my.xtGet(items.scaleOutline, true);
		/**
Entity order value - lower order entitys are drawn on &lt;canvas&gt; elements before higher order entitys
@property order
@type Number
@default 0
**/
		this.order = my.xtGet(items.order, 0);
		/**
Visibility flag - entitys will (in general) not be drawn on a &lt;canvas&gt; element when this flag is set to false
@property visibility
@type Boolean
@default true
**/
		this.visibility = my.xtGet(items.visibility, true);
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
		order: 0,
		visibility: true,
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
		scaleOutline: true,
		fastStamp: false,
		context: '',
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
		if (my.xt(items.group) && items.group !== this.group) {
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
	my.Entity.prototype.clone = function(items) {
		var context,
			enhancedItems,
			clone,
			i, iz;
		items = my.safeObject(items);

		context = JSON.parse(JSON.stringify(my.ctx[this.context]));
		delete context.name;
		enhancedItems = my.mergeInto(items, context);
		delete enhancedItems.context;
		clone = my.Position.prototype.clone.call(this, enhancedItems);
		if (my.xt(items.createNewContext) && !items.createNewContext) {
			delete my.ctx[clone.context];
			my.removeItem(my.ctxnames, clone.context);
			clone.context = this.context;
		}
		return clone;
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
	my.Entity.prototype.forceStamp = function(method, cell) {
		var visibility = this.visibility;
		this.visibility = true;
		this.stamp(method, cell);
		this.visibility = visibility;
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
		var engine,
			cellname;
		if (this.visibility) {
			cell = my.cell[cell] || my.cell[my.group[this.group].cell];
			cellname = cell.name;
			engine = my.context[cellname];
			method = method || this.method;
			if (this.pivot) {
				this.setStampUsingPivot(cellname);
			}
			else {
				this.pathStamp();
			}
			this.callMethod(engine, cellname, method);
			this.stampFilter(engine, cellname);
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
		var test = method[0];
		if (test < 'f') {
			if (test === 'c') {
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
			if (test === 'f') {
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
	my.Entity.prototype.rotateCell = function(ctx, cell) {
		var reverse = (this.flipReverse) ? -1 : 1,
			upend = (this.flipUpend) ? -1 : 1,
			rotation = (this.addPathRoll) ? this.roll + this.pathRoll : this.roll,
			cos,
			sin,
			x = this.start.x,
			y = this.start.y;
		rotation *= 0.01745329251;
		cos = Math.cos(rotation);
		sin = Math.sin(rotation);
		if (x.substring) {
			x = this.convertX(x, cell);
		}
		if (y.substring) {
			y = this.convertY(y, cell);
		}
		ctx.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), x, y);
		return this;
	};
	/**
Entity.getStartValues
@method getStartValues
@private
**/
	my.Entity.prototype.getStartValues = function() {
		var cell = this.getEntityCell(),
			result = {
				x: 0,
				y: 0
			};
		result.x = (my.isa(this.start.x, 'str')) ? this.convertX(this.start.x, cell) : this.start.x;
		result.y = (my.isa(this.start.y, 'str')) ? this.convertY(this.start.y, cell) : this.start.y;
		return result;
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
		var context = my.ctx[this.context];
		if (context.shadowOffsetX || context.shadowOffsetY || context.shadowBlur) {
			cell = (my.isa(cell, 'str')) ? my.cell[cell] : cell;
			cell.clearShadow();
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
		var context = my.ctx[this.context];
		if (context.shadowOffsetX || context.shadowOffsetY || context.shadowBlur) {
			cell = (my.isa(cell, 'str')) ? my.cell[cell] : cell;
			cell.restoreShadow(this.context);
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
		var cell,
			coordinate;
		items = my.safeObject(items);
		coordinate = my.v.set(items);
		cell = my.cell[my.group[this.group].cell];
		coordinate = this.correctCoordinates(coordinate, cell);
		this.oldX = coordinate.x || 0;
		this.oldY = coordinate.y || 0;
		this.oldPivot = this.pivot;
		this.mouseIndex = my.xtGet(items.id || 'mouse');
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
	my.Entity.prototype.dropEntity = function(item) {
		var order = this.order;
		this.set({
			pivot: my.xtGet(item, this.oldPivot, null),
			order: (order >= 9999) ? order - 9999 : 0
		});
		this.oldPivot = null;
		this.oldX = null;
		this.oldY = null;
		this.mouseIndex = null;
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
		var tests = [],
			here,
			result,
			i,
			iz,
			width,
			height;
		items = my.safeObject(items);
		if (my.xt(items.tests)) {
			tests = items.tests;
		}
		else {
			tests.length = 0;
			tests.push(items.x || 0);
			tests.push(items.y || 0);
		}
		this.rotateCell(my.cvx, this.getEntityCell().name);
		here = this.prepareStamp();
		width = (this.localWidth) ? this.localWidth : this.width * this.scale;
		height = (this.localHeight) ? this.localHeight : this.height * this.scale;
		my.cvx.beginPath();
		my.cvx.rect(here.x, here.y, width, height);
		for (i = 0, iz = tests.length; i < iz; i += 2) {
			result = my.cvx.isPointInPath(tests[i], tests[i + 1]);
			if (result) {
				break;
			}
		}
		if (result) {
			items.x = tests[i];
			items.y = tests[i + 1];
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
		/**
Drawing flag - when set to 'entity' (or true), will use entity-based coordinates to calculate the start and end points of the gradient; when set to 'cell' (or false - default), will use Cell-based coordinates
@property lockTo
@type String - or alternatively Boolean
@default 'cell'
**/
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
	my.Design.prototype.setDelta = function(items) {
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
		var ctx,
			g,
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
		ctx = my.context[cell.name];
		//in all cases, the canvas origin will have been translated to the current entity's start
		if (this.lockTo && this.lockTo !== 'cell') {
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
		var color,
			i,
			iz;
		color = this.get('color');
		if (my.dsn[this.name]) {
			for (i = 0, iz = color.length; i < iz; i++) {
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

* scrawl.makeGradient()

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

* scrawl.makeRadialGradient()

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

	my.v = my.makeVector({
		name: 'scrawl.v'
	});

	return my;
}());
