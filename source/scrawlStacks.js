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
# scrawlStacks

## Purpose and features

The Stacks module adds support for CSS3 3d transformations to visible &lt;canvas&gt;, and other, elements

* Significantly amends the PageElement object and functions
* Adds core functions for detecting and including Scrawl stacks and associated elements in the library
* Defines the Stack object, which contains all DOM elements to be manipulated by this stack
* Defines the Element object, which wrap DOM elements (excluding &lt;canvas&gt; elements) included in a stack

@module scrawlStacks
**/

if (window.scrawl && !window.scrawl.newStack) {
	var scrawl = (function(my) {
		'use strict';

		/**
# window.scrawl

scrawlStacks module adaptions to the Scrawl library object

## New library sections

* scrawl.stack - for Stack objects
* scrawl.stk - for handles to DOM stack containers
* scrawl.element - for Element objects
* scrawl.elm - for handles to DOM elements within a stack

## New default attributes

* PageElement.start - default: {x:0,y:0,z:0};
* PageElement.delta - default: {x:0,y:0,z:0};
* PageElement.translate - default: {x:0,y:0,z:0};
* PageElement.handle - default: {x:'center',y:'center',z:0};
* PageElement.pivot - default: '';
* PageElement.stack - default: '';
* PageElement.path - default: '';
* PageElement.pathPlace - default: 0;
* PageElement.deltaPathPlace - default: 0;
* PageElement.pathSpeedConstant - default: true;
* PageElement.pathRoll - default: 0;
* PageElement.addPathRoll - default: false;
* PageElement.lockX - default: false;
* PageElement.lockY - default: false;
* PageElement.rotation - default: {n:1,v:{x:0,y:0,z:0}};
* PageElement.deltaRotation - default: {n:1,v:{x:0,y:0,z:0}};
* PageElement.rotationTolerance - default: 0.001;
* PageElement.visibility - default: true;

@class window.scrawl_Stacks
**/

		/**
scrawl.init hook function - modified by stacks module
@method pageInit
@private
**/
		my.pageInit = function() {
			my.getStacks();
			my.getCanvases();
			my.getElements();
		};
		/**
A __private__ function that searches the DOM for elements with class="scrawlstack"; generates Stack objects
@method getStacks
@return True on success; false otherwise
@private
**/
		my.getStacks = function() {
			var s = document.getElementsByClassName("scrawlstack"),
				stacks = [],
				myStack,
				i, iz, j, jz;
			if (s.length > 0) {
				for (i = 0, iz = s.length; i < iz; i++) {
					stacks.push(s[i]);
				}
				for (i = 0, iz = s.length; i < iz; i++) {
					myStack = my.newStack({
						stackElement: stacks[i]
					});
					for (j = 0, jz = my.stk[myStack.name].children.length; j < jz; j++) {
						my.stk[myStack.name].children[j].style.position = 'absolute';
						if (my.stk[myStack.name].children[j].tagName !== 'CANVAS') {
							my.newElement({
								domElement: my.stk[myStack.name].children[j],
								// stack: myStack.name
								group: myStack.name
							});
						}
					}
					if (my.contains(my.elementnames, myStack.name)) {
						// myStack.stack = my.element[myStack.name].stack;
						myStack.group = my.element[myStack.name].stack;
						delete my.element[myStack.name];
						delete my.elm[myStack.name];
						my.removeItem(my.elementnames, myStack.name);
					}
				}
				return true;
			}
			return false;
		};
		/**
A __private__ function that searches the DOM for canvas elements and generates Pad/Cell/Context objects for each of them

(This function replaces the one defined in the core module)
@method getCanvases
@return True on success; false otherwise
@private
**/
		my.getCanvases = function() {
			var s = document.getElementsByTagName("canvas"),
				myPad,
				myStack,
				myElement,
				el = [],
				i, iz;
			if (s.length > 0) {
				for (i = 0, iz = s.length; i < iz; i++) {
					el.push(s[i]);
				}
				for (i = 0, iz = s.length; i < iz; i++) {
					if (s[i].className.indexOf('stack:') !== -1) {
						myStack = el[i].className.match(/stack:(\w+)/);
						myStack = myStack[1];
						if (my.contains(my.stacknames, myStack)) {
							my.stk[myStack].appendChild(el[i]);
						}
						else {
							myElement = document.createElement('div');
							myElement.id = myStack;
							el[i].parentElement.appendChild(myElement);
							myElement.appendChild(el[i]);
							my.newStack({
								stackElement: myElement,
							});
						}
					}
					myPad = my.newPad({
						canvasElement: el[i],
					});
					if (my.contains(my.stacknames, el[i].parentElement.id)) {
						myPad.set({
							// stack: el[i].parentElement.id
							group: el[i].parentElement.id
						});
						el[i].style.position = 'absolute';
					}
					if (i === 0) {
						my.currentPad = myPad.name;
					}
				}
				return true;
			}
			return false;
		};
		/**
A __private__ function that searches the DOM for elements with class="scrawl stack:STACKNAME"; generates Element objects
@method getElements
@return True on success; false otherwise
@private
**/
		my.getElements = function() {
			var s = document.getElementsByClassName("scrawl"),
				el = [],
				myName,
				myStack,
				i, iz;
			if (s.length > 0) {
				for (i = 0, iz = s.length; i < iz; i++) {
					el.push(s[i]);
				}
				for (i = 0, iz = s.length; i < iz; i++) {
					myName = my.xtGet([el.id, el.name, false]);
					if (!my.contains(my.elementnames, myName)) {
						if (el[i].className.indexOf('stack:') !== -1) {
							myStack = el[i].className.match(/stack:(\w+)/);
							if (my.contains(my.stacknames, myStack[1])) {
								my.stk[myStack[1]].appendChild(el[i]);
								my.newElement({
									domElement: el[i],
									// stack: myStack[1],
									group: myStack[1],
								});
							}
						}
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

(This function replaces the one defined in the core module)
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
				stackName: 'mystack',
				width: 400,
				height: 200,
				}).makeCurrent();
		</script>
    </body>

<a href="../../demo002.html">Live demo</a>
**/
		my.addCanvasToPage = function(items) {
			items = my.safeObject(items);
			var myParent,
				myCanvas,
				myPad,
				myStk,
				stackParent;
			items.width = my.xtGet([items.width, 300]);
			items.height = my.xtGet([items.height, 150]);
			if (my.xt(items.stackName)) {
				myStk = my.stack[items.stackName];
				if (!myStk) {
					if (!my.xt(items.parentElement)) {
						stackParent = document.body;
					}
					else {
						stackParent = (my.isa(items.parentElement, 'str')) ? document.getElementById(items.parentElement) : items.parentElement;
					}
					myStk = my.addStackToPage({
						stackName: items.stackName,
						width: items.width,
						height: items.height,
						parentElement: stackParent
					});
				}
				//items.stack = myStk.name;
				items.group = myStk.name;
				items.parentElement = myStk.name;
			}
			myParent = document.getElementById(items.parentElement) || document.body;
			if (my.isa(items.width, 'str')) {
				items.width = Math.round((parseFloat(items.width) / 100) * parseFloat(myParent.style.width));
			}
			if (my.isa(items.height, 'str')) {
				items.height = Math.round((parseFloat(items.height) / 100) * parseFloat(myParent.style.height));
			}
			myCanvas = document.createElement('canvas');
			myCanvas.style.position = my.xtGet([items.position, 'absolute']);
			myParent.appendChild(myCanvas);
			items.canvasElement = myCanvas;
			myPad = new my.Pad(items);
			my.setDisplayOffsets();
			return myPad;
		};
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
		my.addStackToPage = function(items) {
			if (my.isa(items.stackName, 'str') && my.xt(items.parentElement)) {
				var myElement,
					myStack;
				items.parentElement = (my.isa(items.parentElement, 'str')) ? document.getElementById(items.parentElement) : items.parentElement;
				myElement = document.createElement('div');
				myElement.id = items.stackName;
				myElement.style.width = my.xtGet([items.width, 300]) + 'px';
				myElement.style.height = my.xtGet([items.height, 150]) + 'px';
				items.parentElement.appendChild(myElement);
				items.stackElement = myElement;
				myStack = my.newStack(items);
				// myStack.stack = (my.contains(my.stacknames, items.parentElement.id)) ? items.parentElement.id : '';
				myStack.group = (my.contains(my.stacknames, items.parentElement.id)) ? items.parentElement.id : '';
				return myStack;
			}
			return false;
		};
		/**
A __general__ function to reset display offsets for all pads, stacks and elements

The argument is an optional String - permitted values include 'stack', 'pad', 'element'; default: 'all'

(This function replaces the one defined in the core module)
@method setDisplayOffsets
@param {String} [item] Command string detailing which element types are to be set
@return The Scrawl library object (scrawl)
@chainable
@example
	scrawl.setDisplayOffsets();
**/
		my.setDisplayOffsets = function(item) {
			var i, iz;
			item = (my.xt(item)) ? item : 'all';
			if (item === 'stack' || item === 'all') {
				for (i = 0, iz = my.stacknames.length; i < iz; i++) {
					my.stack[my.stacknames[i]].setDisplayOffsets();
				}
			}
			if (item === 'pad' || item === 'all') {
				for (i = 0, iz = my.padnames.length; i < iz; i++) {
					my.pad[my.padnames[i]].setDisplayOffsets();
				}
			}
			if (item === 'element' || item === 'all') {
				for (i = 0, iz = my.elementnames.length; i < iz; i++) {
					my.element[my.elementnames[i]].setDisplayOffsets();
				}
			}
			return true;
		};
		/**
A __display__ function to ask Pads to undertake a complete clear-compile-show display cycle, and stacks to undertake a render cycle

(Replaces Core.render)

@method render
@param {Array} [pads] Array of PADNAMEs - can also be a String
@return The Scrawl library object (scrawl)
@chainable
**/
		my.render = function(pads) {
			my.renderElements();
			var p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
			for (var i = 0, iz = p.length; i < iz; i++) {
				my.pad[p[i]].render();
			}
			return my;
		};
		/**
A __display__ function to move DOM elements within a Stack
@method renderElements
@return Always true
**/
		my.renderElements = function() {
			var i, iz, s;
			for (i = 0, iz = my.stacknames.length; i < iz; i++) {
				s = my.stack[my.stacknames[i]];
				// if (!s.stack) {
				if (!s.group) {
					s.render();
				}
			}
			return true;
		};

		/**
A __display__ function to update DOM elements' 3d position/rotation

Argument can contain the following (optional) attributes:

* __quaternion__ - quaternion representing the rotation to be applied to the element
* __distance__ - distance of element from the rotation origin
* __group__ - optional String name of ElementGroup on which to commence the operation; the operation will also be performed on the groups of any Stack elements cotained within this group. If this argument is not included in the argument object then all Pads, Stacks and Elements will be updated.

@method update
@param {Object} [items] Argument object containing key:value pairs
@return Always true
**/
		my.update = function(items) {
			items = my.safeObject(items);
			var i, iz, s;
			if (my.isa(items.group, 'str') && my.contains(my.groupnames, items.group) && my.group[items.group].type === 'ElementGroup') {
				my.group[items.group].update(items);
			}
			else {
				for (i = 0, iz = my.stacknames.length; i < iz; i++) {
					s = my.stack[my.stacknames[i]];
					// if (!s.stack) {
					if (!s.group) {
						s.update(items);
					}
				}
			}
			return true;
		};

		/**
The coordinate Vector representing the object's rotation/flip point

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __startX__ - (Mixed) the x coordinate of the object's rotation/flip point, in pixels, from the left side of the object's stack
* __startY__ - (Mixed) the y coordinate of the object's rotation/flip point, in pixels, from the top side of the object's stack

This attribute's attributes accepts absolute number values (in pixels), or string percentages where the percentage is relative to the container stack's width or height, or string literals which again refer to the containing stack's dimensions:

* _startX_ - 'left', 'right' or 'center'
* _startY_ - 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector
@property PageElement.start
@type Vector
**/
		my.d.PageElement.start = {
			x: 0,
			y: 0,
			z: 0
		};
		/**
A change Vector which can be applied to the object's rotation/flip point

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __deltaX__ - (Number) a horizontal change value, in pixels
* __deltaY__ - (Number) a vertical change value, in pixels

@property PageElement.delta
@type Vector
**/
		my.d.PageElement.delta = {
			x: 0,
			y: 0,
			z: 0
		};
		/**
A change Vector for translating elements away from their start coordinate

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __translateX__ - (Number) movement along the x axis, in pixels
* __translateY__ - (Number) movement along the y axis, in pixels
* __translateZ__ - (Number) movement along the z axis, in pixels

@property PageElement.translate
@type Vector
**/
		my.d.PageElement.translate = {
			x: 0,
			y: 0,
			z: 0
		};
		/**
@property PageElement.deltaTranslate
@type Vector
**/
		my.d.PageElement.deltaTranslate = {
			x: 0,
			y: 0,
			z: 0
		};
		/**
An Object (in fact, a Vector) containing offset instructions from the object's rotation/flip point, where drawing commences. 

PageElement, and all Objects that prototype chain to PageElement, supports the following 'virtual' attributes for this attribute:

* __handleX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __handleY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'

Where values are Numbers, handle can be treated like any other Vector

@property PageElement.handle
@type Object
**/
		my.d.PageElement.handle = {
			x: 'center',
			y: 'center',
			z: 0
		};
		/**
The SPRITENAME or POINTNAME of a entity or Point object to be used for setting this object's start point
@property PageElement.pivot
@type String
@default ''
**/
		my.d.PageElement.pivot = '';
		/**
The element's current ELEMENTGROUPNAME
@property PageElement.group
@type String
@default ''
**/
		my.d.PageElement.group = '';
		/**
The SPRITENAME of a Shape entity whose path is used to calculate this object's start point
@property PageElement.path
@type String
@default ''
**/
		my.d.PageElement.path = '';
		/**
A value between 0 and 1 to represent the distance along a Shape object's path, where 0 is the path start and 1 is the path end
@property PageElement.pathPlace
@type Number
@default 0
**/
		my.d.PageElement.pathPlace = 0;
		/**
A change value which can be applied to the object's pathPlace attribute
@property PageElement.deltaPathPlace
@type Number
@default 0
**/
		my.d.PageElement.deltaPathPlace = 0;
		/**
A flag to determine whether the object will calculate its position along a Shape path in a regular (true), or simple (false), manner
@property PageElement.pathSpeedConstant
@type Boolean
@default true
**/
		my.d.PageElement.pathSpeedConstant = true;
		/**
The rotation value (in degrees) of an object's current position along a Shape path
@property PageElement.pathRoll
@type Number
@default 0
**/
		my.d.PageElement.pathRoll = 0;
		/**
A flag to determine whether the object will calculate the rotation value of its current position along a Shape path
@property PageElement.addPathRoll
@type Boolean
@default false
**/
		my.d.PageElement.addPathRoll = false;
		/**
When true, element ignores horizontal placement data via pivot and path attributes
@property PageElement.lockX
@type Boolean
@default false
**/
		my.d.PageElement.lockX = false;
		/**
When true, element ignores vertical placement data via pivot and path attributes
@property PageElement.lockY
@type Boolean
@default false
**/
		my.d.PageElement.lockY = false;
		/**
Element rotation around its transform (start) coordinate
@property PageElement.rotation
@type Quaternion
@default Unit quaternion with no rotation
**/
		my.d.PageElement.rotation = {
			n: 1,
			v: {
				x: 0,
				y: 0,
				z: 0
			}
		};
		/**
Element's delta (change in) rotation around its transform (start) coordinate
@property PageElement.deltaRotation
@type Quaternion
@default Unit quaternion with no rotation
**/
		my.d.PageElement.deltaRotation = {
			n: 1,
			v: {
				x: 0,
				y: 0,
				z: 0
			}
		};
		/**
Element's rotation tolerance - all Quaternions need to be unit quaternions; this value represents the acceptable tolerance away from the norm
@property PageElement.rotationTolerance
@type Number
@default 0.001
**/
		my.d.PageElement.rotationTolerance = 0.001;
		/**
A flag to determine whether an element displays itself
@property PageElement.visibility
@type Boolean
@default true
**/
		my.d.PageElement.visibility = true;
		my.mergeInto(my.d.Pad, my.d.PageElement);
		/**
PageElement constructor hook function - modified by stacks module
@method stacksPageElementConstructor
@private
**/
		my.PageElement.prototype.stacksPageElementConstructor = function(items) {
			var temp = my.safeObject(items.start);
			this.start = my.newVector({
				name: this.type + '.' + this.name + '.start',
				x: my.xtGet([items.startX, temp.x, 0]),
				y: my.xtGet([items.startY, temp.y, 0])
			});
			this.correctStart();
			this.work.start = my.newVector({
				name: this.type + '.' + this.name + '.work.start'
			});
			temp = my.safeObject(items.delta);
			this.delta = my.newVector({
				name: this.type + '.' + this.name + '.delta',
				x: my.xtGet([items.deltaX, temp.x, 0]),
				y: my.xtGet([items.deltaY, temp.y, 0])
			});
			this.work.delta = my.newVector({
				name: this.type + '.' + this.name + '.work.delta'
			});
			temp = my.safeObject(items.handle);
			this.handle = my.newVector({
				name: this.type + '.' + this.name + '.handle',
				x: my.xtGet([items.handleX, temp.x, 0]),
				y: my.xtGet([items.handleY, temp.y, 0])
			});
			this.work.handle = my.newVector({
				name: this.type + '.' + this.name + '.work.handle'
			});
			if (my.xto([items.handleX, items.handleY, items.handle])) {
				this.setTransformOrigin();
			}
			temp = my.safeObject(items.translate);
			this.translate = my.newVector({
				name: this.type + '.' + this.name + '.translate',
				x: my.xtGet([items.translateX, temp.x, 0]),
				y: my.xtGet([items.translateY, temp.y, 0]),
				z: my.xtGet([items.translateZ, temp.z, 0])
			});
			this.work.translate = my.newVector({
				name: this.type + '.' + this.name + '.work.translate'
			});
			temp = my.safeObject(items.deltaTranslate);
			this.deltaTranslate = my.newVector({
				name: this.type + '.' + this.name + '.deltaTranslate',
				x: my.xtGet([items.deltaTranslateX, temp.x, 0]),
				y: my.xtGet([items.deltaTranslateY, temp.y, 0]),
				z: my.xtGet([items.deltaTranslateZ, temp.z, 0])
			});
			this.work.deltaTranslate = my.newVector({
				name: this.type + '.' + this.name + '.work.deltaTranslate'
			});
			this.pivot = my.xtGet([items.pivot, my.d[this.type].pivot]);
			this.path = my.xtGet([items.path, my.d[this.type].path]);
			this.pathRoll = my.xtGet([items.pathRoll, my.d[this.type].pathRoll]);
			this.addPathRoll = my.xtGet([items.addPathRoll, my.d[this.type].addPathRoll]);
			this.pathSpeedConstant = my.xtGet([items.pathSpeedConstant, my.d[this.type].pathSpeedConstant]);
			this.pathPlace = my.xtGet([items.pathPlace, my.d[this.type].pathPlace]);
			this.deltaPathPlace = my.xtGet([items.deltaPathPlace, my.d[this.type].deltaPathPlace]);
			this.lockX = my.xtGet([items.lockX, my.d[this.type].lockX]);
			this.lockY = my.xtGet([items.lockY, my.d[this.type].lockY]);
			this.visibility = my.xtGet([items.visibility, my.d[this.type].visibility]);
			this.rotation = my.newQuaternion({
				name: this.type + '.' + this.name + '.rotation'
			}).setFromEuler({
				pitch: items.pitch || 0,
				yaw: items.yaw || 0,
				roll: items.roll || 0,
			});
			this.work.rotation = my.newQuaternion({
				name: this.type + '.' + this.name + '.work.rotation'
			});
			this.deltaRotation = my.newQuaternion({
				name: this.type + '.' + this.name + '.deltaRotation'
			}).setFromEuler({
				pitch: items.deltaPitch || 0,
				yaw: items.deltaYaw || 0,
				roll: items.deltaRoll || 0,
			});
			this.work.deltaRotation = my.newQuaternion({
				name: this.type + '.' + this.name + '.work.deltaRotation'
			});
			this.rotationTolerance = my.xtGet([items.rotationTolerance, my.d[this.type].rotationTolerance]);
			this.group = my.xtGet([items.group, false]);
			if (this.group) {
				my.group[this.group].addElementsToGroup(this.name);
			}
		};
		/**
Augments Base.get() to retrieve DOM element width and height values, and stack-related attributes

(The stack module replaces the core function rather than augmenting it via a hook function)

@method PageElement.get
@param {String} get Attribute key
@return Attribute value
**/
		my.PageElement.prototype.get = function(item) {
			var el = this.getElement();
			if (my.contains(['width', 'height'], item)) {
				switch (this.type) {
					case 'Pad':
						if ('width' === item) {
							return this.width || parseFloat(el.width) || my.d[this.type].width;
						}
						if ('height' === item) {
							return this.height || parseFloat(el.height) || my.d[this.type].height;
						}
						break;
					default:
						if ('width' === item) {
							return this.width || parseFloat(el.style.width) || parseFloat(el.clientWidth) || my.d[this.type].width;
						}
						if ('height' === item) {
							return this.height || parseFloat(el.style.height) || parseFloat(el.clientHeight) || my.d[this.type].height;
						}
				}
			}
			if (my.contains(['startX', 'startY', 'handleX', 'handleY', 'deltaX', 'deltaY', 'translateX', 'translateY', 'translateZ'], item)) {
				switch (item) {
					case 'startX':
						return this.start.x;
					case 'startY':
						return this.start.y;
					case 'handleX':
						return this.handle.x;
					case 'handleY':
						return this.handle.y;
					case 'deltaX':
						return this.delta.x;
					case 'deltaY':
						return this.delta.y;
					case 'translateX':
						return this.translate.x;
					case 'translateY':
						return this.translate.y;
					case 'translateZ':
						return this.translate.z;
				}
			}

			if (my.xt(el.style[item])) {
				return el.style[item];
			}
			if (item === 'position') {
				return el.style.position;
			}
			if (item === 'overflow') {
				return el.style.overflow;
			}
			if (item === 'backfaceVisibility') {
				return el.style.backfaceVisibility;
			}
			return my.Base.prototype.get.call(this, item);
		};
		/**
Augments Base.set() to allow the setting of DOM element dimension values, and stack-related attributes

(The stack module replaces the core function rather than augmenting it via a hook function)

@method PageElement.set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.set = function(items) {
			var el = this.getElement(),
				temp, i, iz;
			items = my.safeObject(items);
			my.Base.prototype.set.call(this, items);
			if (!this.start.type || this.start.type !== 'Vector') {
				this.start = my.newVector(items.start || this.start);
			}
			if (my.xto([items.start, items.startX, items.startY])) {
				temp = my.safeObject(items.start);
				this.start.x = my.xtGet([items.startX, temp.x, this.start.x]);
				this.start.y = my.xtGet([items.startY, temp.y, this.start.y]);
			}
			this.correctStart();
			if (!this.delta.type || this.delta.type !== 'Vector') {
				this.delta = my.newVector(items.delta || this.delta);
			}
			if (my.xto([items.delta, items.deltaX, items.deltaY])) {
				temp = my.safeObject(items.delta);
				this.delta.x = my.xtGet([items.deltaX, temp.x, this.delta.x]);
				this.delta.y = my.xtGet([items.deltaY, temp.y, this.delta.y]);
			}
			if (!this.translate.type || this.translate.type !== 'Vector') {
				this.translate = my.newVector(items.translate || this.translate);
			}
			if (my.xto([items.translate, items.translateX, items.translateY, items.translateZ])) {
				temp = my.safeObject(items.translate);
				this.translate.x = my.xtGet([items.translateX, temp.x, this.translate.x]);
				this.translate.y = my.xtGet([items.translateY, temp.y, this.translate.y]);
				this.translate.z = my.xtGet([items.translateZ, temp.z, this.translate.z]);
			}
			if (!this.deltaTranslate.type || this.deltaTranslate.type !== 'Vector') {
				this.deltaTranslate = my.newVector(items.deltaTranslate || this.deltaTranslate);
			}
			if (my.xto([items.deltaTranslate, items.deltaTranslateX, items.deltaTranslateY, items.deltaTranslateZ])) {
				temp = my.safeObject(items.deltaTranslate);
				this.deltaTranslate.x = my.xtGet([items.deltaTranslateX, temp.x, this.deltaTranslate.x]);
				this.deltaTranslate.y = my.xtGet([items.deltaTranslateY, temp.y, this.deltaTranslate.y]);
				this.deltaTranslate.z = my.xtGet([items.deltaTranslateZ, temp.z, this.deltaTranslate.z]);
			}
			if (!this.handle.type || this.handle.type !== 'Vector') {
				this.handle = my.newVector(items.handle || this.handle);
			}
			if (my.xto([items.handle, items.handleX, items.handleY])) {
				temp = my.safeObject(items.handle);
				this.handle.x = my.xtGet([items.handleX, temp.x, this.handle.x]);
				this.handle.y = my.xtGet([items.handleY, temp.y, this.handle.y]);
			}
			if (my.xto([items.pitch, items.yaw, items.roll])) {
				this.rotation.setFromEuler({
					pitch: items.pitch || 0,
					yaw: items.yaw || 0,
					roll: items.roll || 0,
				});
			}
			if (my.xto([items.deltaPitch, items.deltaYaw, items.deltaRoll])) {
				this.deltaRotation.setFromEuler({
					pitch: items.deltaPitch || 0,
					yaw: items.deltaYaw || 0,
					roll: items.deltaRoll || 0,
				});
			}
			if (my.xto([items.width, items.height, items.scale])) {
				this.setLocalDimensions();
				this.setDimensions();
			}
			if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale])) {
				delete this.offset;
			}
			if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start])) {
				this.setDisplayOffsets();
			}
			if (my.xto([items.handleX, items.handleY, items.handle])) {
				this.setTransformOrigin();
			}
			if (my.xt(items.position)) {
				this.position = items.position;
			}
			if (my.xt(items.mouse)) {
				this.initMouse({
					mouse: items.mouse
				});
			}
			if (my.xt(items.group)) {
				for (i = 0, iz = my.groupnames.length; i < iz; i++) {
					temp = my.group[my.groupnames[i]];
					if (temp.type === 'ElementGroup') {
						if (my.groupnames[i] === items.group) {
							temp.addElementsToGroup(this.name);
						}
						else {
							if (my.contains(temp.elements, this.name)) {
								temp.removeElementsFromGroup(this.name);
							}
						}
					}
				}
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
			this.setStyles(items);
			return this;
		};
		/**
Constructor / set helper function
@method PageElement.correctStart
@return This
@chainable
@private
**/
		my.PageElement.prototype.correctStart = function() {
			if (my.contains(['left', 'center', 'right'], this.start.x)) {
				switch (this.start.x) {
					case 'left':
						this.start.x = '0%';
						break;
					case 'center':
						this.start.x = '50%';
						break;
					case 'right':
						this.start.x = '100%';
						break;
				}
			}
			if (my.contains(['top', 'center', 'bottom'], this.start.y)) {
				switch (this.start.y) {
					case 'top':
						this.start.y = '0%';
						break;
					case 'center':
						this.start.y = '50%';
						break;
					case 'bottom':
						this.start.y = '100%';
						break;
				}
			}
			return this;
		};
		/**
Handles the setting of position, transformOrigin, backfaceVisibility, margin, border, padding
@method PageElement.setStyles
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setStyles = function(items) {
			items = (my.xt(items)) ? items : {};
			var el = this.getElement(),
				k = Object.keys(items);
			for (var i = 0, iz = k.length; i < iz; i++) {
				if (my.contains(['width', 'height', 'translate', 'translateX', 'translateY', 'translateZ'], k[i])) {}
				else if (k[i] === 'backfaceVisibility') {
					el.style.webkitBackfaceVisibility = items.backfaceVisibility;
					el.style.mozBackfaceVisibility = items.backfaceVisibility;
					el.style.backfaceVisibility = items.backfaceVisibility;
				}
				else if (k[i] === 'visibility') {
					if (my.isa(items.visibility, 'str')) {
						this.visibility = (!my.contains(['hidden', 'none'], items.visibility)) ? true : false;
					}
					else {
						this.visibility = (items.visibility) ? true : false;
					}
					if (this.group) {
						el.style.opacity = (this.visibility) ? 1 : 0;
					}
					else {
						el.style.display = (this.visibility) ? 'block' : 'none';
					}
				}
				else {
					if (my.xt(el.style[k[i]])) {
						el.style[k[i]] = items[k[i]];
					}
				}
			}
			return this;
		};
		/**
Adds the value of each attribute supplied in the argument to existing values; only Number attributes can be amended using this function
@method PageElement.setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setDelta = function(items) {
			var temp;
			my.Position.prototype.setDelta.call(this, items);
			items = my.safeObject(items);
			if (my.xto([items.translate, items.translateX, items.translateY])) {
				temp = (my.isa(items.translate, 'obj')) ? items.translate : {};
				this.translate.x += my.xtGet([items.translateX, temp.x, 0]);
				this.translate.y += my.xtGet([items.translateY, temp.y, 0]);
				this.translate.z += my.xtGet([items.translateZ, temp.z, 0]);
			}
			if (my.xto([items.deltaTranslate, items.deltaTranslateX, items.deltaTranslateY])) {
				temp = (my.isa(items.deltaTranslate, 'obj')) ? items.deltaTranslate : {};
				this.deltaTranslate.x += my.xtGet([items.deltaTranslateX, temp.x, 0]);
				this.deltaTranslate.y += my.xtGet([items.deltaTranslateY, temp.y, 0]);
				this.deltaTranslate.z += my.xtGet([items.deltaTranslateZ, temp.z, 0]);
			}
			if (my.xto([items.pitch, items.yaw, items.roll])) {
				temp = my.workquat.q1.setFromEuler({
					pitch: items.pitch || 0,
					yaw: items.yaw || 0,
					roll: items.roll || 0,
				});
				this.rotation.quaternionMultiply(temp);
			}
			if (my.xto([items.deltaPitch, items.deltaYaw, items.deltaRoll])) {
				temp = my.workquat.q1.setFromEuler({
					pitch: items.deltaPitch || 0,
					yaw: items.deltaYaw || 0,
					roll: items.deltaRoll || 0,
				});
				this.deltaRotation.quaternionMultiply(temp);
			}
			if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale])) {
				delete this.offset;
			}
			if (my.xto([items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start])) {
				this.setDisplayOffsets();
			}
			if (my.xto([items.handleX, items.handleY, items.handle])) {
				this.setTransformOrigin();
			}
			if (my.xto([items.width, items.height, items.scale])) {
				this.setLocalDimensions();
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
@method PageElement.updateStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.PageElement.prototype.updateStart = function(item) {
			my.Position.prototype.updateStart.call(this, item);
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
@method PageElement.revertStart
@param {String} [item] String used to limit this function's actions - permitted values include 'x', 'y', 'path'; default action: all values are amended
@return This
@chainable
**/
		my.PageElement.prototype.revertStart = function(item) {
			my.Position.prototype.revertStart.call(this, item);
			this.setDisplayOffsets();
			return this;
		};
		/**
Rotate and translate a DOM element around a quaternion rotation

* Element's initial rotation values should be stored in the deltaRotation attribute quaternion
* Element's initial translation values should be stored in the deltaTranslate attribute vector

Argument can contain the following (optional) attributes:

* __quaternion__ - quaternion representing the rotation to be applied to the element
* __distance__ - distance of element from the rotation origin

@method PageElement.update3d
@param {Object} [items] - Distance between the effective rotation point and the DOM element's start attribute - default: deltaTranslate vector's magnitude
@return This
@chainable
**/
		my.PageElement.prototype.update3d = function(items) {
			items = my.safeObject(items);
			if (my.isa(items.quaternion, 'quaternion')) {
				this.rotation.set(this.deltaRotation); //deltaRotation represents the initial, world rotation of the element
				this.rotation.quaternionRotate(items.quaternion); //quaternion is the local amount we want to rotate the element by
				this.translate.zero();
				this.translate.vectorAdd(this.deltaTranslate);
				this.translate.rotate3d(items.quaternion, items.distance);
			}
			else {
				//opposite to above; rotation is the world rotation, deltaRotation the local rotation to be applied
				this.rotation.quaternionRotate(this.deltaRotation);
				this.translate.vectorAdd(this.deltaTranslate);
			}
			return this;
		};
		/**
Changes the sign (+/-) of specified attribute values
@method PageElement.reverse
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return This
@chainable
**/
		my.PageElement.prototype.reverse = function(item) {
			my.Position.prototype.reverse.call(this, item);
			return this;
		};
		/**
Calculates the pixels value of the object's handle attribute

* doesn't take into account the object's scaling or orientation
* (badly named function - getPivotOffsetVector has nothing to do with pivots)

@method PageElement.getPivotOffsetVector
@return A Vector of calculated offset values to help determine where entity drawing should start
@private
**/
		my.PageElement.prototype.getPivotOffsetVector = function() {
			return my.Position.prototype.getPivotOffsetVector.call(this);
		};
		/**
Calculates the pixels value of the object's start attribute

* doesn't take into account the object's scaling or orientation

@method PageElement.getStartValues
@param {String} [item] String used to limit this function's actions - permitted values include 'deltaX', 'deltaY', 'delta', 'deltaPathPlace'; default action: all values are amended
@return A Vector of calculated values to help determine where entity drawing should start
@private
**/
		my.PageElement.prototype.getStartValues = function(hasElementPivot) {
			hasElementPivot = (my.xt(hasElementPivot)) ? hasElementPivot : false;
			var result,
				height,
				width,
				stack = my.group[this.group].stack;
			if (hasElementPivot) {
				result = my.v.set(my.element[this.pivot].start);
				height = my.element[this.pivot].get(height);
				width = my.element[this.pivot].get(width);
			}
			else {
				result = my.v.set(this.start);
				height = (stack) ? my.stack[stack].get('height') : this.localHeight / this.scale || this.get('height');
				width = (stack) ? my.stack[stack].get('width') : this.localWidth / this.scale || this.get('width');
			}
			return my.Position.prototype.calculatePOV.call(this, result, width, height, false);
		};
		/**
Calculates the pixels value of the object's handle attribute
@method PageElement.getOffsetStartVector
@return Final offset values (as a Vector) to determine where entity drawing should start
**/
		my.PageElement.prototype.getOffsetStartVector = function() {
			return my.Position.prototype.getOffsetStartVector.call(this);
		};
		/**
Reposition an element within its stack by changing 'left' and 'top' style attributes; rotate it using matrix3d transform
@method PageElement.renderElement
@return This left
@chainable
**/
		my.PageElement.prototype.renderElement = function() {
			var el = this.getElement(),
				trans = '',
				pos,
				m = [];
			if (!my.xt(this.offset)) {
				this.offset = this.getOffsetStartVector();
			}
			if (this.path) {
				this.setStampUsingPath();
				pos = this.start;
			}
			else if (this.pivot) {
				this.setStampUsingPivot();
				pos = this.start;
			}
			else {
				pos = this.getStartValues();
			}
			this.updateStart();

			if (this.rotation.getMagnitude() !== 1) {
				this.rotation.normalize();
			}

			m.push(Math.round(this.translate.x * this.scale));
			m.push(Math.round(this.translate.y * this.scale));
			m.push(Math.round(this.translate.z * this.scale));
			m.push(this.rotation.v.x);
			m.push(this.rotation.v.y);
			m.push(this.rotation.v.z);
			m.push(this.rotation.getAngle(false));

			for (var i = 0, z = m.length; i < z; i++) {
				if (my.isBetween(m[i], 0.000001, -0.000001)) {
					m[i] = 0;
				}
			}
			trans += 'translate3d(' + m[0] + 'px,' + m[1] + 'px,' + m[2] + 'px) rotate3d(' + m[3] + ',' + m[4] + ',' + m[5] + ',' + m[6] + 'rad)';
			el.style.webkitTransform = trans;
			el.style.transform = trans;

			el.style.zIndex = m[2];

			el.style.left = ((pos.x * this.scale) + this.offset.x) + 'px';
			el.style.top = ((pos.y * this.scale) + this.offset.y) + 'px';
			return this;
		};
		/**
Calculate start Vector in reference to a Shape entity object's path
@method PageElement.setStampUsingPath
@return This
@chainable
@private
**/
		my.PageElement.prototype.setStampUsingPath = function() {
			var here,
				angles;
			if (my.contains(my.entitynames, this.path) && my.entity[this.path].type === 'Path') {
				here = my.entity[this.path].getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
				this.start.x = (!this.lockX) ? here.x : this.start.x;
				this.start.y = (!this.lockY) ? here.y : this.start.y;
				this.pathRoll = here.r || 0;
				if (this.addPathRoll && this.pathRoll) {
					angles = this.rotation.getEulerAngles();
					this.setDelta({
						roll: this.pathRoll - angles.roll,
					});
				}
			}
			return this;
		};
		/**
Calculate start Vector in reference to a entity or Point object's position
@method PageElement.setStampUsingPivot
@return This
@chainable
@private
**/
		my.PageElement.prototype.setStampUsingPivot = function() {
			var here,
				myCell,
				myP,
				myPVector,
				pEntity,
				temp;
			if (my.contains(my.pointnames, this.pivot)) {
				myP = my.point[this.pivot];
				pEntity = my.entity[myP.entity];
				myPVector = myP.getCurrentCoordinates().rotate(pEntity.roll).vectorAdd(pEntity.getStartValues());
				this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
				this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
			else if (my.contains(my.entitynames, this.pivot)) {
				myP = my.entity[this.pivot];
				myPVector = (myP.type === 'Particle') ? myP.get('place') : myP.get('start');
				this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
				this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
			else if (my.contains(my.padnames, this.pivot)) {
				myP = my.pad[this.pivot];
				myPVector = myP.getStartValues();
				this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
				this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
			else if (my.contains(my.elementnames, this.pivot)) {
				myP = my.element[this.pivot];
				myPVector = myP.getStartValues();
				this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
				this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
			}
			else if (this.pivot === 'mouse') {
				// if (this.stack) {
				if (this.group) {
					//here = my.stack[this.stack].getMouse();
					here = my.stack[my.group[this.group].stack].getMouse();
					temp = this.getStartValues();
					if (!my.xta([this.mouseX, this.mouseY])) {
						this.oldX = temp.x;
						this.oldY = temp.y;
					}
					if (here.active) {
						this.start.x = (!this.lockX) ? temp.x + here.x - this.oldX : this.start.x;
						this.start.y = (!this.lockY) ? temp.y + here.y - this.oldY : this.start.y;
						this.oldX = here.x;
						this.oldY = here.y;
					}
				}
			}
			return this;
		};
		/**
Set the transform origin style attribute
@method PageElement.setTransformOrigin
@return This
@chainable
**/
		my.PageElement.prototype.setTransformOrigin = function() {
			var el = this.getElement(),
				x, y, t;
			if (el) {
				x = (my.isa(this.handle.x, 'str')) ? this.handle.x : (this.handle.x * this.scale) + 'px';
				y = (my.isa(this.handle.y, 'str')) ? this.handle.y : (this.handle.y * this.scale) + 'px';
				t = x + ' ' + y;
				el.style.mozTransformOrigin = t;
				el.style.webkitTransformOrigin = t;
				el.style.msTransformOrigin = t;
				el.style.oTransformOrigin = t;
				el.style.transformOrigin = t;
			}
			return this;
		};
		/**
Calculate the element's display offset values
@method PageElement.setDisplayOffsets
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
			this.offset = this.getOffsetStartVector();
			this.displayOffsetX = dox;
			this.displayOffsetY = doy;
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
			var parent = (my.xt(my.group[this.group])) ? my.stack[my.group[this.group].stack] : false,
				w, h;
			if (parent) {
				w = parent.localWidth / parent.scale;
				h = parent.localHeight / parent.scale;
			}
			if (parent && my.isa(this.width, 'str')) {
				this.localWidth = ((parseFloat(this.width) / 100) * w) * this.scale;
			}
			else {
				this.localWidth = this.width * this.scale;
			}
			if (parent && my.isa(this.height, 'str')) {
				this.localHeight = ((parseFloat(this.height) / 100) * h) * this.scale;
			}
			else {
				this.localHeight = this.height * this.scale;
			}
			return this;
		};
		/**
A __factory__ function to generate new Stack objects
@method newStack
@param {Object} items Key:value Object argument for setting attributes
@return Stack object
@private
**/
		my.newStack = function(items) {
			return new my.Stack(items);
		};
		/**
A __factory__ function to generate new Element objects
@method newElement
@param {Object} items Key:value Object argument for setting attributes
@return Element object
@private
**/
		my.newElement = function(items) {
			return new my.Element(items);
		};
		/**
A __factory__ function to generate new ElementGroup objects
@method newElementGroup
@param {Object} items Key:value Object argument for setting attributes
@return ElementGroup object
@private
**/
		my.newElementGroup = function(items) {
			return new my.ElementGroup(items);
		};

		my.pushUnique(my.sectionlist, 'stack');
		my.pushUnique(my.sectionlist, 'stk');
		my.pushUnique(my.nameslist, 'stacknames');
		/**
# Stack

## Instantiation

* scrawl.addStackToPage()

## Purpose

* add/manipulate perspective data to a DOM element

## Access

* scrawl.stack.STACKNAME - for the Stack object
* scrawl.stk.STACKNAME - for a handle to the DOM stack element

@class Stack
@constructor
@extends PageElement
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Stack = function(items) {
			items = my.safeObject(items);
			var temp;
			if (my.xt(items.stackElement)) {
				items.width = my.xtGet([items.width, items.stackElement.style.width, my.d.Stack.width]);
				items.height = my.xtGet([items.height, items.stackElement.style.height, my.d.Stack.height]);
				items.name = my.xtGet([items.stackName, items.name, items.stackElement.id, items.stackElement.name, 'Stack']);
				my.PageElement.call(this, items);
				if (this.name.match(/~~~/)) {
					this.name = this.name.replace(/~~~/g, '_');
				}
				items.stackElement.id = this.name;
				items.stackElement.style.position = 'relative';
				my.stack[this.name] = this;
				my.stk[this.name] = items.stackElement;
				my.pushUnique(my.stacknames, this.name);
				this.setDisplayOffsets();
				this.setAccessibility(items);
				temp = my.safeObject(items.perspective);
				this.perspective = my.newVector({
					name: this.type + '.' + this.name + '.perspective',
					x: my.xtGet([items.perspectiveX, temp.x, 'center']),
					y: my.xtGet([items.perspectiveY, temp.y, 'center']),
					z: my.xtGet([items.perspectiveZ, temp.z, 0])
				});
				this.work.perspective = my.newVector({
					name: this.type + '.' + this.name + '.work.perspective'
				});
				this.initMouse({
					mouse: (my.isa(items.mouse, 'bool') || my.isa(items.mouse, 'vector')) ? items.mouse : true
				});
				this.groups = [this.name];
				my.newElementGroup({
					name: this.name,
					stack: this.name
				});
				this.group = my.xtGet([items.group, false]);
				if (this.group) {
					my.group[this.group].addElementsToGroup(this.name);
				}
				return this;
			}
			console.log('Failed to generate a Stack wrapper - no DOM element supplied');
			return false;
		};
		my.Stack.prototype = Object.create(my.PageElement.prototype);
		/**
@property type
@type String
@default 'Stack'
@final
**/
		my.Stack.prototype.type = 'Stack';
		my.Stack.prototype.classname = 'stacknames';
		my.d.Stack = {
			/**
An Object (in fact, a Vector) containing perspective details for the stack element. 

the Stack constructor, and set() function, supports the following 'virtual' attributes for this attribute:

* __perspectiveX__ - (Mixed) the horizontal offset, either as a Number (in pixels), or a percentage String of the object's width, or the String literal 'left', 'right' or 'center'
* __perspectiveY__ - (Mixed) the vertical offset, either as a Number (in pixels), or a percentage String of the object's height, or the String literal 'top', 'bottom' or 'center'
* __perspectiveZ__ - (Number) perspective depth, in pixels
@property perspective
@type Object
**/
			perspective: {
				x: 'center',
				y: 'center',
				z: 0
			},
			/**
A flag to indicate whether element text should be scaled at the same time as the stack. Default; false (do not scale text)

@property scaleText
@type Boolean
@default false
**/
			scaleText: false,
			/**
Groups array

@property groups
@type Array
@default []
**/
			groups: []
		};
		my.mergeInto(my.d.Stack, my.d.PageElement);
		/**
Return the DOM element wrapped by this object
@method getElement
@return Element
**/
		my.Stack.prototype.getElement = function() {
			return my.stk[this.name];
		};
		/**
Augments PageElement.set(), to allow users to set the stack perspective using perspectiveX, perspectiveY, perspectiveZ
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Stack.prototype.set = function(items) {
			items = my.safeObject(items);
			var temp;
			my.PageElement.prototype.set.call(this, items);
			if (my.xto([items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ])) {
				if (!this.perspective.type || this.perspective.type !== 'Vector') {
					this.perspective = my.newVector(items.perspective || this.perspective);
				}
				if (my.xto([items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ])) {
					temp = my.safeObject(items.perspective);
					this.perspective.x = my.xtGet([items.perspectiveX, temp.x, this.perspective.x]);
					this.perspective.y = my.xtGet([items.perspectiveY, temp.y, this.perspective.y]);
					this.perspective.z = my.xtGet([items.perspectiveZ, temp.z, this.perspective.z]);
				}
				this.setPerspective();
			}
			if (my.xt(items.scale)) {
				this.scaleStack(items.scale);
			}
			return this;
		};
		/**
Import elements into the stack DOM object, and create element object wrappers for them
@method addElementById
@param {String} DOM element id String
@return Element wrapper object on success; false otherwise
**/
		my.Stack.prototype.addElementById = function(item) {
			if (my.isa(item, 'str')) {
				var myElement = my.newElement({
					domElement: document.getElementById(item),
					group: this.name,
				});
				my.stk[this.name].appendChild(my.elm[myElement.name]);
				my.elm[myElement.name] = document.getElementById(myElement.name);
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
		my.Stack.prototype.addElementsByClassName = function(item) {
			var myElements = [],
				myArray,
				myElement,
				myElm,
				thisElement,
				i, iz;
			if (my.isa(item, 'str')) {
				myArray = document.getElementsByClassName(item);
				for (i = 0, iz = myArray.length; i < iz; i++) {
					thisElement = myArray[i];
					if (thisElement.nodeName !== 'CANVAS') {
						myElement = my.newElement({
							domElement: thisElement,
							group: this.name,
						});
						myElements.push(myElement);
					}
				}
				for (i = 0, iz = myElements.length; i < iz; i++) {
					my.stk[this.name].appendChild(my.elm[myElements[i].name]);
					my.elm[myElements[i].name] = document.getElementById(myElements[i].name);
				}
				return myElements;
			}
			return false;
		};
		/**
Move DOM elements within a Stack, via the Stack's groups
@method render
@return Always true
**/
		my.Stack.prototype.render = function() {
			for (var i = 0, iz = this.groups.length; i < iz; i++) {
				my.group[this.groups[i]].render();
			}
			return true;
		};
		/**
Update element 3d transitions, via the Stack's groups
@method update
@return Always true
**/
		my.Stack.prototype.update = function() {
			for (var i = 0, iz = this.groups.length; i < iz; i++) {
				my.group[this.groups[i]].update();
			}

			return true;
		};
		/**
Parse the perspective Vector attribute
@method parsePerspective
@return Object containing offset values (in pixels)
@private
**/
		my.Stack.prototype.parsePerspective = function() {
			var result = this.work.perspective,
				height = this.height || this.get('height'),
				width = this.width || this.get('width');
			return my.Position.prototype.calculatePOV.call(this, result, width, height, false);
		};
		/**
Calculates the pixels value of the object's perspective attribute
@method setPerspective
@return Set the Stack element's perspective point
**/
		my.Stack.prototype.setPerspective = function() {
			this.resetWork();
			var sx = (my.isa(this.perspective.x, 'str')) ? this.scale : 1,
				sy = (my.isa(this.perspective.y, 'str')) ? this.scale : 1,
				myH = this.parsePerspective(),
				el = this.getElement();
			myH.x *= sx;
			myH.y *= sy;
			myH.z *= sx;
			el.style.mozPerspectiveOrigin = myH.x + 'px ' + myH.y + 'px';
			el.style.webkitPerspectiveOrigin = myH.x + 'px ' + myH.y + 'px';
			el.style.perspectiveOrigin = myH.x + 'px ' + myH.y + 'px';
			el.style.mozPerspective = myH.z + 'px';
			el.style.webkitPerspective = myH.z + 'px';
			el.style.perspective = myH.z + 'px';
		};
		/**
Scale the stack, and all objects contained in stack

An item value of 1 will scale the stack to its preset size. Values less than 1 will shrink the stack; values greater than 1 will enlarge it.

By default, this function does not scale text contained in any stack element. If the scaleFont boolean is is passed as true, then the function will set the stack's font-size style attribute to (item * 100)%. Element font sizes will not scale unless they have been initially set to relative unit values.

@method scaleStack
@param {Number} item - Scale value
@param {Boolean} scaleFont - if set to true, will also scale element font sizes; default: false
@return This
@chainable
**/
		//PROBABLY NEEDS CHANGING
		my.Stack.prototype.scaleStack = function(item, scaleFont) {
			var i, iz;
			scaleFont = (my.xt(scaleFont)) ? scaleFont : this.scaleText;
			if (my.isa(item, 'num') && this.type === 'Stack') {
				for (i = 0, iz = my.stacknames.length; i < iz; i++) {
					if (my.stack[my.stacknames[i]].stack === this.name) {
						my.stack[my.stacknames[i]].scaleStack(item);
					}
				}
				for (i = 0, iz = my.elementnames.length; i < iz; i++) {
					if (my.element[my.elementnames[i]].stack === this.name) {
						my.element[my.elementnames[i]].scaleDimensions(item);
					}
				}
				for (i = 0, iz = my.padnames.length; i < iz; i++) {
					if (my.pad[my.padnames[i]].stack === this.name) {
						my.pad[my.padnames[i]].scaleDimensions(item);
					}
				}
				this.scaleDimensions(item);
				if (this.type === 'Stack') {
					this.setPerspective();
					if (scaleFont) {
						my.stk[this.name].style.fontSize = (item * 100) + '%';
					}
				}
			}
			return this;
		};

		my.pushUnique(my.sectionlist, 'element');
		my.pushUnique(my.sectionlist, 'elm');
		my.pushUnique(my.nameslist, 'elementnames');
		/**
# Element

## Instantiation

* Stack.addElementById()
* Stack.addElementsByClassNames()

## Purpose

* provide a wrapper object for a DOM element

## Access

* scrawl.element.ELEMENTNAME - for the Element object
* scrawl.elm.ELEMENTNAME - for a handle to the DOM element

@class Element
@constructor
@extends PageElement
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.Element = function(items) {
			items = my.safeObject(items);
			if (my.xt(items.domElement)) {
				items.width = my.xtGet([items.width, items.domElement.style.width, my.d.Stack.width]);
				items.height = my.xtGet([items.height, items.domElement.style.height, my.d.Stack.height]);
				items.name = my.xtGet([items.elementName, items.name, items.domElement.id, items.domElement.name, 'Element']);
				my.PageElement.call(this, items);
				if (this.name.match(/~~~/)) {
					this.name = this.name.replace(/~~~/g, '_');
				}
				items.domElement.id = this.name;
				items.domElement.style.position = 'absolute';
				my.element[this.name] = this;
				my.elm[this.name] = items.domElement;
				my.pushUnique(my.elementnames, this.name);
				this.setDisplayOffsets();
				this.initMouse({
					mouse: (my.isa(items.mouse, 'bool') || my.isa(items.mouse, 'vector')) ? items.mouse : true
				});
				return this;
			}
			console.log('Failed to generate an Element wrapper - no DOM element supplied');
			return false;
		};
		my.Element.prototype = Object.create(my.PageElement.prototype);
		/**
@property type
@type String
@default 'Element'
@final
**/
		my.Element.prototype.type = 'Element';
		my.Element.prototype.classname = 'elementnames';
		my.d.Element = {
			/**
Element's default height
@property height
@type String
@default 'auto'
**/
			height: 'auto'
		};
		my.mergeInto(my.d.Element, my.d.PageElement);
		/**
Return the DOM element wrapped by this object
@method getElement
@return Element
**/
		my.Element.prototype.getElement = function() {
			return my.elm[this.name];
		};


		/**
# ElementGroup

## Instantiation

* scrawl.newElementGroup()

## Purpose

* associates DOM elements with a Stack object, for rendering the stack scene
* groups DOM elements for specific purposes

## Access

* scrawl.group.GROUPNAME - for the ElementGroup object
* scrawl.stack[scrawl.group.ELEMENTGROUPNAME.stack] - for the ElementGroup object's default Stack object

@class ElementGroup
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/
		my.ElementGroup = function(items) {
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.entitys = (my.xt(items.entitys)) ? [].concat(items.entitys) : [];
			this.elements = (my.xt(items.elements)) ? [].concat(items.elements) : [];
			this.stack = items.stack || false;
			if (this.stack) {
				my.pushUnique(my.stack[this.stack].groups, this.name);
			}
			my.group[this.name] = this;
			my.pushUnique(my.groupnames, this.name);
			return this;
		};
		my.ElementGroup.prototype = Object.create(my.Base.prototype);
		/**
@property type
@type String
@default 'ElementGroup'
@final
**/
		my.ElementGroup.prototype.type = 'ElementGroup';
		my.ElementGroup.prototype.classname = 'groupnames';
		my.d.ElementGroup = {
			/**
Array of SPRITENAME Strings of entitys that complement this ElementGroup
@property entitys
@type Array
@default []
**/
			entitys: [],
			/**
Array of ELEMENTNAME Strings of elements that complement this ElementGroup
@property elements
@type Array
@default []
**/
			elements: [],
			/**
STACKNAME of the default Stack object to which this group is associated
@property stack
@type String
@default ''
**/
			stack: ''
		};
		my.mergeInto(my.d.ElementGroup, my.d.Base);
		/**
Tell the Group to ask its constituent entitys to draw themselves on a &lt;canvas&gt; element; only entitys whose visibility attribute is set to true will comply
@method stamp
@param {String} [method] Drawing method String
@param {String} [cell] CELLNAME of cell on which entitys are to draw themselves
@return This
@chainable
**/
		my.ElementGroup.prototype.stamp = function() {
			var i, iz,
				stack = my.stack[this.stack];
			for (i = 0, iz = this.entitys.length; i < iz; i++) {
				//PROBABLY NEED TO amend the varous stampijng routines to accommodate using a Stack's data instead of Cell data
				my.entity[this.entitys[i]].stamp('none', stack);
			}
			return this;
		};
		/**
Tell the Group to ask its constituent elements to render
@method render
@return This
@chainable
**/
		my.ElementGroup.prototype.render = function() {
			var temp, i, iz;
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				temp = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				temp.renderElement();
				if (temp.type === 'Stack') {
					my.group[temp.name].render();
				}
			}
			return this;
		};
		/**
A __display__ function to update DOM elements' 3d position/rotation

Argument can contain the following (optional) attributes:

* __quaternion__ - quaternion representing the rotation to be applied to the element
* __distance__ - distance of element from the rotation origin

@method update
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.ElementGroup.prototype.update = function(items) {
			var temp, i, iz;
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				temp = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				temp.update3d(items);
				if (temp.type === 'Stack') {
					my.group[temp.name].update(items);
				}
			}
			return this;
		};
		/**
Add elements to the Group
@method addElementsToGroup
@param {Array} item Array of ELEMENTNAME Strings; alternatively, a single ELEMENTNAME String can be supplied as the argument
@return This
@chainable
**/
		my.ElementGroup.prototype.addElementsToGroup = function(item) {
			item = (my.xt(item)) ? [].concat(item) : [];
			for (var i = 0, iz = item.length; i < iz; i++) {
				my.pushUnique(this.elements, item[i]);
			}
			return this;
		};
		/**
Remove elements from the Group
@method removeElementsFromGroup
@param {Array} item Array of ELEMENTNAME Strings; alternatively, a single ELEMENTNAME String can be supplied as the argument
@return This
@chainable
**/
		my.ElementGroup.prototype.removeElementsFromGroup = function(item) {
			item = (my.xt(item)) ? [].concat(item) : [];
			for (var i = 0, iz = item.length; i < iz; i++) {
				my.removeItem(this.elements, item[i]);
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
		my.ElementGroup.prototype.addEntitysToGroup = function(item) {
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
		my.ElementGroup.prototype.removeEntitysFromGroup = function(item) {
			item = (my.xt(item)) ? [].concat(item) : [];
			for (var i = 0, iz = item.length; i < iz; i++) {
				my.removeItem(this.entitys, item[i]);
			}
			return this;
		};
		/**
Ask all elements in the Group to perform a setDelta() operation

@method updateElementsBy
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.ElementGroup.prototype.updateElementsBy = function(items) {
			var temp, i, iz;
			items = my.safeObject(items);
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				temp = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				temp.setDelta(items);
			}
			return this;
		};
		/**
Ask all entitys in the Group to perform a setDelta() operation

@method updateEntitysBy
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.ElementGroup.prototype.updateEntitysBy = function(items) {
			items = my.safeObject(items);
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				my.entity[this.entitys[i]].setDelta(items);
			}
			return this;
		};
		/**
Ask all elements and entitys in the Group to perform a setDelta() operation

@method updateBy
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.ElementGroup.prototype.updateBy = function(items) {
			this.updateElementsBy(items);
			this.updateEntitysBy(items);
			return this;
		};
		/**
Ask all elements in the Group to perform a set() operation
@method setElementsTo
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.ElementGroup.prototype.setElementsTo = function(items) {
			var temp, i, iz;
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				temp = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				temp.set(items);
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
		my.ElementGroup.prototype.setEntitysTo = function(items) {
			for (var i = 0, iz = this.entitys.length; i < iz; i++) {
				my.entity[this.entitys[i]].set(items);
			}
			return this;
		};
		/**
Ask all elements and entitys in the Group to perform a set() operation
@method setEntitysTo
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.ElementGroup.prototype.setTo = function(items) {
			this.setElementsTo(items);
			this.setEntitysTo(items);
			return this;
		};
		/**
Require all elements in the Group to set their pivot attribute to the supplied STACKNAME, PADNAME, ELEMENTNAME, POINTNAME or SPRITENAME string, and set their handle Vector to reflect the current vector between that object's start Vector and their own Vector

This has the effect of turning a set of disparate eelements into a single, coordinated group.
@method pivotElementsTo
@param {String} item STACKNAME, PADNAME, ELEMENTNAME, POINTNAME or SPRITENAME String
@return This
@chainable
**/
		my.ElementGroup.prototype.pivotElementsTo = function(item) {
			item = (my.isa(item, 'str')) ? item : false;
			var p,
				pStart,
				element,
				sv;
			if (item) {
				p = my.stack[item] || my.pad[item] || my.element[item] || my.entity[item] || my.point[item] || false;
				if (p) {
					pStart = (p.type === 'Point') ? p.local : p.start;
					for (var i = 0, iz = this.elements.length; i < iz; i++) {
						element = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
						if (element) {
							sv = my.v.set(element.start);
							sv.vectorSubtract(pStart);
							element.set({
								pivot: item,
								handleX: -sv.x,
								handleY: -sv.y
							});
						}
					}
				}
			}
			return this;
		};

		return my;
	}(scrawl));
}
