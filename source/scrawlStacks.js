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

if (window.scrawl && window.scrawl.modules && !window.scrawl.contains(window.scrawl.modules, 'stacks')) {
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
			var i,
				iz,
				j,
				jz,
				s,
				stacks,
				myStack,
				myCanvas;
			s = document.getElementsByClassName("scrawlstack");
			stacks = [];
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
								group: myStack.name
							});
						}
						else {
							my.stk[myStack.name].children[j].className += ' stack:' + myStack.name;
						}
					}
					if (my.element[myStack.name]) {
						myStack.group = my.element[myStack.name].group;
						delete my.element[myStack.name];
						delete my.elm[myStack.name];
						my.removeItem(my.elementnames, myStack.name);
					}
					if (stacks[i].className.match(/withcanvas/)) {
						myCanvas = document.createElement('canvas');
						myCanvas.style.position = 'absolute';
						myCanvas.id = myStack.name + '_canvas';
						myCanvas.className = 'lockTo:' + myStack.name;
						my.stk[myStack.name].appendChild(myCanvas);
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
			var i,
				iz,
				s,
				myPad,
				myStack,
				stack,
				locked,
				myElement,
				el;
			s = document.getElementsByTagName("canvas");
			el = [];
			if (s.length > 0) {
				for (i = 0, iz = s.length; i < iz; i++) {
					el.push(s[i]);
				}
				for (i = 0, iz = s.length; i < iz; i++) {
					myStack = false;
					stack = false;
					locked = false;
					if (el[i].className.indexOf('stack:') !== -1) {
						myStack = el[i].className.match(/stack:(\w+)/);
						myStack = myStack[1];
					}
					else if (el[i].className.indexOf('lockTo:') !== -1) {
						myStack = el[i].className.match(/lockTo:(\w+)/);
						myStack = myStack[1];
						locked = true;
					}
					if (myStack) {
						if (my.stack[myStack]) {
							my.stk[myStack].appendChild(el[i]);
							stack = my.stack[myStack];
						}
						else {
							myElement = document.createElement('div');
							myElement.id = myStack;
							el[i].parentElement.appendChild(myElement);
							myElement.appendChild(el[i]);
							stack = my.newStack({
								stackElement: myElement
							});
						}
					}
					myPad = my.newPad({
						canvasElement: el[i],
					});
					if (stack) {
						myPad.set({
							group: stack.name,
							position: 'absolute'
						});
						if (locked) {
							stack.set({
								canvas: myPad.name
							});
							myPad.set({
								width: '100%',
								height: '100%',
								lockTo: stack.name
							});
						}
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
			var i,
				iz,
				s,
				el,
				myName,
				myStack;
			s = document.getElementsByClassName("scrawl");
			el = [];
			if (s.length > 0) {
				for (i = 0, iz = s.length; i < iz; i++) {
					el.push(s[i]);
				}
				for (i = 0, iz = s.length; i < iz; i++) {
					myName = my.xtGet(el.id, el.name, false);
					if (!my.contains(my.elementnames, myName)) {
						if (el[i].className.indexOf('stack:') !== -1) {
							myStack = el[i].className.match(/stack:(\w+)/);
							if (my.contains(my.stacknames, myStack[1])) {
								my.stk[myStack[1]].appendChild(el[i]);
								my.newElement({
									domElement: el[i],
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
			var myParent,
				myCanvas,
				myStk,
				stackParent;
			items = my.safeObject(items);
			items.width = my.xtGet(items.width, 300);
			items.height = my.xtGet(items.height, 150);
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
			myCanvas.style.position = my.xtGet(items.position, 'absolute');
			myParent.appendChild(myCanvas);
			items.canvasElement = myCanvas;
			var myPad = new my.Pad(items);
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
			var myElement,
				myStack;
			if (my.isa(items.stackName, 'str') && my.xt(items.parentElement)) {
				items.parentElement = (my.isa(items.parentElement, 'str')) ? document.getElementById(items.parentElement) : items.parentElement;
				myElement = document.createElement('div');
				myElement.id = items.stackName;
				myElement.style.width = my.xtGet(items.width, 300) + 'px';
				myElement.style.height = my.xtGet(items.height, 150) + 'px';
				items.parentElement.appendChild(myElement);
				items.stackElement = myElement;
				myStack = my.newStack(items);
				myStack.group = (my.stack[items.parentElement.id]) ? items.parentElement.id : '';
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
			var i,
				iz;
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
			var i,
				iz,
				p;
			my.renderElements();
			p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
			for (i = 0, iz = p.length; i < iz; i++) {
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
			var i,
				iz,
				s;
			for (i = 0, iz = my.stacknames.length; i < iz; i++) {
				s = my.stack[my.stacknames[i]];
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
			var i,
				iz,
				s;
			items = my.safeObject(items);
			if (my.isa(items.group, 'str') && my.group[items.group] && my.group[items.group].type === 'ElementGroup') {
				my.group[items.group].update(items);
			}
			else {
				for (i = 0, iz = my.stacknames.length; i < iz; i++) {
					s = my.stack[my.stacknames[i]];
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
The ENTITYNAME or POINTNAME of a entity or Point object to be used for setting this object's start point
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
When element is pivoted to another element, determines placement in relation to that element

Permitted values: 'top', 'right', 'bottom', 'left', '' (default)
@property PageElement.lockTo
@type String
@default ''
**/
		my.d.PageElement.lockTo = '';
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
				x: my.xtGet(items.startX, temp.x, 0),
				y: my.xtGet(items.startY, temp.y, 0)
			});
			this.correctStart();
			this.work.start = my.newVector({
				name: this.type + '.' + this.name + '.work.start'
			});
			temp = my.safeObject(items.delta);
			this.delta = my.newVector({
				name: this.type + '.' + this.name + '.delta',
				x: my.xtGet(items.deltaX, temp.x, 0),
				y: my.xtGet(items.deltaY, temp.y, 0)
			});
			this.work.delta = my.newVector({
				name: this.type + '.' + this.name + '.work.delta'
			});
			temp = my.safeObject(items.handle);
			this.handle = my.newVector({
				name: this.type + '.' + this.name + '.handle',
				x: my.xtGet(items.handleX, temp.x, 0),
				y: my.xtGet(items.handleY, temp.y, 0)
			});
			this.work.handle = my.newVector({
				name: this.type + '.' + this.name + '.work.handle'
			});
			temp = my.safeObject(items.translate);
			this.translate = my.newVector({
				name: this.type + '.' + this.name + '.translate',
				x: my.xtGet(items.translateX, temp.x, 0),
				y: my.xtGet(items.translateY, temp.y, 0),
				z: my.xtGet(items.translateZ, temp.z, 0)
			});
			this.work.translate = my.newVector({
				name: this.type + '.' + this.name + '.work.translate'
			});
			temp = my.safeObject(items.deltaTranslate);
			this.deltaTranslate = my.newVector({
				name: this.type + '.' + this.name + '.deltaTranslate',
				x: my.xtGet(items.deltaTranslateX, temp.x, 0),
				y: my.xtGet(items.deltaTranslateY, temp.y, 0),
				z: my.xtGet(items.deltaTranslateZ, temp.z, 0)
			});
			this.work.deltaTranslate = my.newVector({
				name: this.type + '.' + this.name + '.work.deltaTranslate'
			});
			this.pivot = my.xtGet(items.pivot, my.d[this.type].pivot);
			this.path = my.xtGet(items.path, my.d[this.type].path);
			this.pathRoll = my.xtGet(items.pathRoll, my.d[this.type].pathRoll);
			this.addPathRoll = my.xtGet(items.addPathRoll, my.d[this.type].addPathRoll);
			this.pathSpeedConstant = my.xtGet(items.pathSpeedConstant, my.d[this.type].pathSpeedConstant);
			this.pathPlace = my.xtGet(items.pathPlace, my.d[this.type].pathPlace);
			this.deltaPathPlace = my.xtGet(items.deltaPathPlace, my.d[this.type].deltaPathPlace);
			this.lockX = my.xtGet(items.lockX, my.d[this.type].lockX);
			this.lockY = my.xtGet(items.lockY, my.d[this.type].lockY);
			this.lockTo = my.xtGet(items.lockTo, my.d[this.type].lockTo);
			this.scale = my.xtGet(items.scale, 1);
			this.visibility = my.xtGet(items.visibility, my.d[this.type].visibility);
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
			this.rotationTolerance = my.xtGet(items.rotationTolerance, my.d[this.type].rotationTolerance);
			this.group = my.xtGet(items.group, false);
			if (this.group) {
				my.group[this.group].addElementsToGroup(this.name);
			}
			this.offset = my.newVector({
				name: this.type + '.' + this.name + '.offset'
			});
			this.offset.flag = false;
		};
		/**
Augments Base.get() to retrieve DOM element width and height values, and stack-related attributes

(The stack module replaces the core function rather than augmenting it via a hook function)

@method PageElement.get
@param {String} get Attribute key
@return Attribute value
**/
		my.PageElement.prototype.get = function(item) {
			var stat1 = ['width', 'height'],
				stat2 = ['startX', 'startY', 'handleX', 'handleY', 'deltaX', 'deltaY', 'translateX', 'translateY', 'translateZ'],
				el;
			el = this.getElement();
			if (my.contains(stat1, item)) {
				switch (this.type) {
					case 'Pad':
						if ('width' === item) {
							return this.localWidth || this.width || parseFloat(el.width) || my.d[this.type].width;
						}
						if ('height' === item) {
							return this.localHeight || this.height || parseFloat(el.height) || my.d[this.type].height;
						}
						break;
					default:
						if ('width' === item) {
							return this.localWidth || this.width || parseFloat(el.style.width) || parseFloat(el.clientWidth) || my.d[this.type].width;
						}
						if ('height' === item) {
							return this.localHeight || this.height || parseFloat(el.style.height) || parseFloat(el.clientHeight) || my.d[this.type].height;
						}
				}
			}
			if (my.contains(stat2, item)) {
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
			items = my.safeObject(items);
			my.Base.prototype.set.call(this, items);
			if (my.xto(items.start, items.startX, items.startY)) {
				my.Position.prototype.setStart.call(this, items);
			}
			this.correctStart();
			if (my.xto(items.handle, items.handleX, items.handleY)) {
				my.Position.prototype.setHandle.call(this, items);
			}
			if (my.xto(items.delta, items.deltaX, items.deltaY)) {
				my.Position.prototype.setDeltaAttribute.call(this, items);
			}
			if (my.xto(items.translate, items.translateX, items.translateY, items.translateZ)) {
				this.setTranslate(items);
			}
			if (my.xto(items.deltaTranslate, items.deltaTranslateX, items.deltaTranslateY, items.deltaTranslateZ)) {
				this.setDeltaTranslate(items);
			}
			if (my.xto(items.pitch, items.yaw, items.roll)) {
				this.setRotation(items);
			}
			if (my.xto(items.deltaPitch, items.deltaYaw, items.deltaRoll)) {
				this.setDeltaRotation(items);
			}
			if (my.xto(items.width, items.height, items.scale, items.border, items.borderLeft, items.borderRight, items.borderTop, items.borderBottom, items.borderWidth, items.borderLeftWidth, items.borderRightWidth, items.borderTopWidth, items.borderBottomWidth, items.padding, items.paddingLeft, items.paddingRight, items.paddingTop, items.paddingBottom, items.boxSizing, items.lockTo)) {
				if (my.group[this.group] && my.group[this.group].checkEqualDimensions()) {
					my.group[this.group].recalculateDimensions = true;
				}
				this.setLocalDimensions();
				this.setDimensions();
			}
			if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.border, items.borderLeft, items.borderRight, items.borderTop, items.borderBottom, items.borderWidth, items.borderLeftWidth, items.borderRightWidth, items.borderTopWidth, items.borderBottomWidth, items.padding, items.paddingLeft, items.paddingRight, items.paddingTop, items.paddingBottom, items.boxSizing, items.lockTo)) {
				this.offset.flag = false;
			}
			if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start, items.border, items.borderLeft, items.borderRight, items.borderTop, items.borderBottom, items.borderWidth, items.borderLeftWidth, items.borderRightWidth, items.borderTopWidth, items.borderBottomWidth, items.padding, items.paddingLeft, items.paddingRight, items.paddingTop, items.paddingBottom, items.boxSizing, items.lockTo)) {
				this.setDisplayOffsets();
			}
			if (my.xto(items.handleX, items.handleY, items.handle)) {
				this.setTransformOrigin();
			}
			if (my.xt(items.group)) {
				this.setGroupAttribute(items);
			}
			if (my.xt(items.pivot)) {
				this.setPivotAttribute(items);
			}
			if (my.xto(items.title, items.comment)) {
				this.setAccessibility(items);
			}
			this.setStyles(items);
			return this;
		};
		/**
Augments PageElement.set()
@method setPivotAttribute
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setPivotAttribute = function(items) {
			this.pivot = items.pivot;
			if (!this.pivot) {
				delete this.oldX;
				delete this.oldY;
			}
			return this;
		};
		/**
Augments PageElement.set()
@method setGroupAttribute
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setGroupAttribute = function(items) {
			var temp,
				i,
				iz;
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
			return this;
		};
		/**
Augments PageElement.set()
@method setRotation
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setRotation = function(items) {
			this.rotation.setFromEuler({
				pitch: items.pitch || 0,
				yaw: items.yaw || 0,
				roll: items.roll || 0,
			});
			return this;
		};
		/**
Augments PageElement.set()
@method setDeltaRotation
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setDeltaRotation = function(items) {
			this.deltaRotation.setFromEuler({
				pitch: items.deltaPitch || 0,
				yaw: items.deltaYaw || 0,
				roll: items.deltaRoll || 0,
			});
			return this;
		};
		/**
Augments PageElement.set()
@method setTranslate
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setTranslate = function(items) {
			var temp;
			items = my.safeObject(items);
			if (!this.translate.type || this.translate.type !== 'Vector') {
				this.translate = my.newVector(items.translate || this.translate);
			}
			temp = my.safeObject(items.translate);
			this.translate.x = my.xtGet(items.translateX, temp.x, this.translate.x);
			this.translate.y = my.xtGet(items.translateY, temp.y, this.translate.y);
			this.translate.z = my.xtGet(items.translateZ, temp.z, this.translate.z);
			return this;
		};
		/**
Add a CSS class to the DOM element
@method addClass
@param {String} item String consisting of one or more classes to be added to the DOM element - a space will be prepended to the start of the string automatically
@return This
@chainable
**/
		my.PageElement.prototype.addClass = function(item) {
			var el;
			if (my.isa(item, 'str')) {
				el = this.getElement();
				if (0 === el.className.length) {
					el.className = item;
				}
				else if (' ' === el.className[el.className.length - 1]) {
					el.className += item;
				}
				else {
					el.className += ' ' + item;
				}
				return this;
			}
		};
		/**
Remove a CSS class from the DOM element
@method removeClass
@param {String} item String consisting of one or more classes to be removed from the DOM element
@return This
@chainable
**/
		my.PageElement.prototype.removeClass = function(item) {
			var el,
				classes,
				eClass,
				search,
				i, iz;
			if (my.isa(item, 'str')) {
				el = this.getElement();
				eClass = el.className;
				classes = item.split();
				for (i = 0, iz = classes.length; i < iz; i++) {
					search = new RegExp(' ?' + classes[i] + ' ?');
					eClass = eClass.replace(search, ' ');
				}
				el.className = eClass;
			}
			return this;
		};
		/**
Augments PageElement.set()
@method setDeltaTranslate
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setDeltaTranslate = function(items) {
			var temp;
			items = my.safeObject(items);
			if (!this.deltaTranslate.type || this.deltaTranslate.type !== 'Vector') {
				this.deltaTranslate = my.newVector(items.deltaTranslate || this.deltaTranslate);
			}
			temp = my.safeObject(items.deltaTranslate);
			this.deltaTranslate.x = my.xtGet(items.deltaTranslateX, temp.x, this.deltaTranslate.x);
			this.deltaTranslate.y = my.xtGet(items.deltaTranslateY, temp.y, this.deltaTranslate.y);
			this.deltaTranslate.z = my.xtGet(items.deltaTranslateZ, temp.z, this.deltaTranslate.z);
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
			var stat1 = ['left', 'center', 'right'],
				stat2 = ['top', 'center', 'bottom'];
			if (my.contains(stat1, this.start.x)) {
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
			if (my.contains(stat2, this.start.y)) {
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
		my.css = ['alignContent', 'alignItems', 'alignSelf', 'all', 'animation', 'animationDelay', 'animationDirection', 'animationDuration', 'animationFillMode', 'animationIterationCount', 'animationName', 'animationPlayState', 'animationTimingFunction', 'background', 'backgroundAttachment', 'backgroundBlendMode', 'backgroundClip', 'backgroundColor', 'backgroundImage', 'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'backgroundSize', 'border', 'borderBottom', 'borderBottomColor', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderBottomStyle', 'borderBottomWidth', 'borderCollapse', 'borderColor', 'borderImage', 'borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth', 'borderLeft', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth', 'borderRadius', 'borderRight', 'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderSpacing', 'borderStyle', 'borderTop', 'borderTopColor', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderTopStyle', 'borderTopWidth', 'borderWidth', 'boxDecorationBreak', 'boxShadow', 'boxSizing', 'breakAfter', 'breakBefore', 'breakInside', 'captionSide', 'clear', 'clip', 'clipPath', 'color', 'columns', 'columnCount', 'columnFill', 'columnGap', 'columnRule', 'columnRuleColor', 'columnRuleStyle', 'columnRuleWidth', 'columnSpan', 'columnWidth', 'content', 'counterIncrement', 'counterReset', 'cursor', 'direction', 'display', 'emptyCells', 'flex', 'flexBasis', 'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap', 'float', 'font', 'fontFamily', 'fontFeatureSettings', 'fontKerning', 'fontLanguageOverride', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontSynthesis', 'fontVariant', 'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition', 'fontWeight', 'grid', 'gridArea', 'gridAutoColumns', 'gridAutoFlow', 'gridAutoPosition', 'gridAutoRows', 'gridColumn', 'gridColumnStart', 'gridColumnEnd', 'gridRow', 'gridRowStart', 'gridRowEnd', 'gridTemplate', 'gridTemplateAreas', 'gridTemplateRows', 'gridTemplateColumns', 'hyphens', 'imageRendering', 'imageResolution', 'imageOrientation', 'imeMode', 'inherit', 'initial', 'isolation', 'justifyContent', 'letterSpacing', 'lineBreak', 'lineHeight', 'listStyle', 'listStyleImage', 'listStylePosition', 'listStyleType', 'margin', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'marks', 'mask', 'maskType', 'mixBlendMode', 'objectFit', 'objectPosition', 'opacity', 'orphans', 'outline', 'outlineColor', 'outlineOffset', 'outlineStyle', 'outlineWidth', 'overflow', 'overflowWrap', 'overflowX', 'overflowY', 'padding', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'pageBreakAfter', 'pageBreakBefore', 'pageBreakInside', 'pointerEvents', 'position', 'quotes', 'resize', 'rubyAlign', 'rubyMerge', 'rubyPosition', 's', 'scrollBehavior', 'shapeImageThreshold', 'shapeMargin', 'shapeOutside', 'tableLayout', 'tabSize', 'textAlign', 'textAlignLast', 'textCombineUpright', 'textDecoration', 'textDecorationColor', 'textDecorationLine', 'textDecorationStyle', 'textIndent', 'textOrientation', 'textOverflow', 'textRendering', 'textShadow', 'textTransform', 'textUnderlinePosition', 'touchAction', 'unicodeBidi', 'unicodeRange', 'unset', 'verticalAlign', 'visibility', 'whiteSpace', 'widows', 'willChange', 'wordBreak', 'wordSpacing', 'wordWrap', 'writingMode'];
		/**
Handles the setting of position, transformOrigin, backfaceVisibility, margin, border, padding
@method PageElement.setStyles
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setStyles = function(items) {
			var stat = ['hidden', 'none'],
				el,
				k,
				i,
				iz;
			items = my.safeObject(items);
			el = this.getElement();
			k = Object.keys(items);
			for (i = 0, iz = k.length; i < iz; i++) {
				if (k[i] === 'backfaceVisibility') {
					el.style.webkitBackfaceVisibility = items.backfaceVisibility;
					el.style.mozBackfaceVisibility = items.backfaceVisibility;
					el.style.backfaceVisibility = items.backfaceVisibility;
				}
				else if (k[i] === 'visibility') {
					if (my.isa(items.visibility, 'str')) {
						this.visibility = (!my.contains(stat, items.visibility)) ? true : false;
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
				else if (my.contains(my.css, k[i])) {
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
			if (my.xto(items.translate, items.translateX, items.translateY)) {
				temp = my.safeObject(items.translate);
				this.translate.x += my.xtGet(items.translateX, temp.x, 0);
				this.translate.y += my.xtGet(items.translateY, temp.y, 0);
				this.translate.z += my.xtGet(items.translateZ, temp.z, 0);
			}
			if (my.xto(items.deltaTranslate, items.deltaTranslateX, items.deltaTranslateY)) {
				temp = (my.isa(items.deltaTranslate, 'obj')) ? items.deltaTranslate : {};
				this.deltaTranslate.x += my.xtGet(items.deltaTranslateX, temp.x, 0);
				this.deltaTranslate.y += my.xtGet(items.deltaTranslateY, temp.y, 0);
				this.deltaTranslate.z += my.xtGet(tems.deltaTranslateZ, temp.z, 0);
			}
			if (my.xto(items.pitch, items.yaw, items.roll)) {
				temp = my.workquat.q1.setFromEuler({
					pitch: items.pitch || 0,
					yaw: items.yaw || 0,
					roll: items.roll || 0,
				});
				this.rotation.quaternionMultiply(temp);
			}
			if (my.xto(items.deltaPitch, items.deltaYaw, items.deltaRoll)) {
				temp = my.workquat.q1.setFromEuler({
					pitch: items.deltaPitch || 0,
					yaw: items.deltaYaw || 0,
					roll: items.deltaRoll || 0,
				});
				this.deltaRotation.quaternionMultiply(temp);
			}
			if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale)) {
				this.offset.flag = false;
			}
			if (my.xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start)) {
				this.setDisplayOffsets();
			}
			if (my.xto(items.handleX, items.handleY, items.handle)) {
				this.setTransformOrigin();
			}
			if (my.xto(items.width, items.height, items.scale)) {
				if (my.group[this.group] && my.group[this.group].checkEqualDimensions()) {
					my.group[this.group].recalculateDimensions = true;
				}
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
@return A Vector of calculated values to help determine where entity drawing should start
@private
**/
		my.PageElement.prototype.getStartValues = function() {
			var result,
				height,
				width,
				stackname,
				stack;
			result = my.v.set(this.start);
			stackname = my.group[this.group].stack;
			if (stackname) {
				stack = my.stack[stackname];
				height = stack.localHeight / this.scale;
				width = stack.localWidth / this.scale;
			}
			else {
				height = this.localHeight / this.scale;
				width = this.localWidth / this.scale;
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
			var pere = [0, 0, 0, 0, 0, 0, 0],
				pere2 = [0, 0, 0, 0, 0],
				g,
				i;
			g = my.group[this.group];
			pere2[0] = this.getElement();
			if (!this.offset.flag) {
				this.offset.set(this.getOffsetStartVector());
				this.offset.flag = true;
			}
			if (this.path) {
				this.setStampUsingPath();
				pere2[1] = this.start;
			}
			else if (this.pivot) {
				this.setStampUsingPivot();
				pere2[1] = this.start;
			}
			else {
				pere2[1] = this.getStartValues();
			}

			if (g && (g.equalWidth || g.equalHeight)) {
				this.setDimensions();
			}
			this.updateStart();
			pere2[2] = (my.isa(this.start.x, 'str')) ? true : false;
			pere2[3] = (my.isa(this.start.y, 'str')) ? true : false;

			if (this.rotation.getMagnitude() !== 1) {
				this.rotation.normalize();
			}

			pere[0] = Math.round(this.translate.x * this.scale);
			pere[1] = Math.round(this.translate.y * this.scale);
			pere[2] = Math.round(this.translate.z * this.scale);
			pere[3] = this.rotation.v.x;
			pere[4] = this.rotation.v.y;
			pere[5] = this.rotation.v.z;
			pere[6] = this.rotation.getAngle(false);

			for (i = 0; i < 7; i++) {
				if (pere[i] < 0.000001 && pere[i] > -0.000001) {
					pere[i] = 0;
				}
			}

			pere2[4] = 'translate3d(' + pere[0] + 'px,' + pere[1] + 'px,' + pere[2] + 'px) rotate3d(' + pere[3] + ',' + pere[4] + ',' + pere[5] + ',' + pere[6] + 'rad)';
			pere2[0].style.webkitTransform = pere2[4];
			pere2[0].style.transform = pere2[4];

			pere2[0].style.zIndex = pere[2];

			pere2[0].style.left = (pere2[2]) ? ((pere2[1].x * this.scale) + this.offset.x) + 'px' : (pere2[1].x + this.offset.x) + 'px';
			pere2[0].style.top = (pere2[3]) ? ((pere2[1].y * this.scale) + this.offset.y) + 'px' : (pere2[1].y + this.offset.y) + 'px';
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
			if (my.entity[this.path] && my.entity[this.path].type === 'Path') {
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
				myP,
				myPVector,
				pEntity,
				temp;
			if (my.point && my.point[this.pivot]) {
				myP = my.point[this.pivot];
				pEntity = my.entity[myP.entity];
				myPVector = myP.getCurrentCoordinates().rotate(pEntity.roll).vectorAdd(pEntity.start);
				this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
				this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
				return this;
			}
			if (my.entity[this.pivot]) {
				myP = my.entity[this.pivot];
				myPVector = (myP.type === 'Particle') ? myP.get('place') : myP.get('start');
				this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
				this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
				return this;
			}
			if (my.pad[this.pivot]) {
				this.setStampUsingDomElement(my.pad[this.pivot]);
				return this;
			}
			if (my.element[this.pivot]) {
				this.setStampUsingDomElement(my.element[this.pivot]);
				return this;
			}
			if (my.stack[this.pivot]) {
				this.setStampUsingDomElement(my.stack[this.pivot]);
				return this;
			}
			if (this.pivot === 'mouse') {
				if (this.group) {
					here = my.stack[my.group[this.group].stack].getMouse();
					temp = this.getStartValues();
					if (!my.xta(this.mouseX, this.mouseY)) {
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
setStampUsingPivot helper function
@method PageElement.setStampUsingDomElement
@return nothing
@private
**/
		my.PageElement.prototype.setStampUsingDomElement = function(e) {
			if (this.lockTo) {
				this.setStampUsingLockTo(e);
			}
			else {
				this.setStampUsingDomElementPivot(e);
			}
		};
		/**
setStampUsingPivot helper function
@method PageElement.setStampUsingDomElementPivot
@return nothing
@private
**/
		my.PageElement.prototype.setStampUsingDomElementPivot = function(e) {
			var myPVector = e.getStartValues();
			this.start.x = (!this.lockX) ? myPVector.x : this.start.x;
			this.start.y = (!this.lockY) ? myPVector.y : this.start.y;
		};
		/**
setStampUsingPivot helper function
@method PageElement.setStampUsingLockTo
@return nothing
@private
**/
		my.PageElement.prototype.setStampUsingLockTo = function(e) {
			var myPVector,
				g,
				x,
				y;
			myPVector = e.getStartValues();
			if (!e.offset.flag) {
				e.offset.set(e.getOffsetStartVector());
				e.offset.flag = true;
			}
			x = myPVector.x + e.offset.x;
			y = myPVector.y + e.offset.y;
			if (this.lockTo) {
				g = my.group[this.group];
				switch (this.lockTo) {
					case 'bottom':
						y += (g.equalHeight) ? g.currentHeight : e.localHeight;
						break;
					case 'right':
						x += (g.equalWidth) ? g.currentWidth : e.localWidth;
						break;
					case 'left':
						x -= (g.equalWidth) ? g.currentWidth : e.localWidth;
						break;
					case 'top':
						y -= (g.equalHeight) ? g.currentHeight : e.localHeight;
						break;
				}
			}
			this.start.x = x;
			this.start.y = y;
		};
		/**
Set the transform origin style attribute
@method PageElement.setTransformOrigin
@return This
@chainable
**/
		my.PageElement.prototype.setTransformOrigin = function() {
			var el,
				t,
				x,
				y;
			el = this.getElement();
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
			var dox,
				doy,
				myDisplay;
			dox = 0;
			doy = 0;
			myDisplay = this.getElement();
			if (myDisplay.offsetParent) {
				do {
					dox += myDisplay.offsetLeft;
					doy += myDisplay.offsetTop;
					myDisplay = myDisplay.offsetParent;
				} while (myDisplay.offsetParent);
			}
			this.offset.set(this.getOffsetStartVector());
			this.offset.flag = true;
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
			var h,
				w,
				hVal,
				wVal,
				parent,
				el,
				measure,
				unit,
				s;
			parent = (my.xt(my.group[this.group])) ? my.stack[my.group[this.group].stack] : false;
			if (parent) {
				w = parent.localWidth;
				h = parent.localHeight;
			}
			el = this.getElement();
			if (el) {
				s = window.getComputedStyle(el, null);
			}
			wVal = parseFloat(this.width);
			if (wVal === 0 || isNaN(wVal)) {
				if (el) {
					el.style.width = 'auto';
					this.localWidth = parseFloat(s.getPropertyValue('width'));
				}
			}
			else if (parent && my.isa(this.width, 'str') && w) {
				measure = this.width.match(/^-?\d+\.?\d*(\D*)/);
				unit = measure[1];
				if (unit === '%') {
					this.localWidth = ((parseFloat(this.width) / 100) * w) * this.scale;
				}
				else {
					this.localWidth = parseFloat(this.width) * this.scale;
				}
			}
			else {
				this.localWidth = parseFloat(this.width) * this.scale;
			}
			hVal = parseFloat(this.height);
			if (hVal === 0 || isNaN(hVal)) {
				if (el) {
					el.style.height = 'auto';
					this.localHeight = parseFloat(s.getPropertyValue('height'));
				}
			}
			else if (parent && my.isa(this.height, 'str') && h) {
				measure = this.height.match(/^-?\d+\.?\d*(\D*)/);
				unit = measure[1];
				if (unit === '%') {
					this.localHeight = ((parseFloat(this.height) / 100) * h) * this.scale;
				}
				else {
					this.localHeight = parseFloat(this.height) * this.scale;
				}
			}
			else {
				this.localHeight = parseFloat(this.height) * this.scale;
			}
			if (this.type === 'Pad') {
				this.setCellLocalDimensions();
			}
			return this;
		};
		/**
Helper function - set DOM element dimensions (width, height)

Overwritesa core setDimensions()
@method setDimensions
@return This
@chainable
@private
**/
		my.PageElement.prototype.setDimensions = function() {
			var h,
				w,
				group,
				el;
			el = this.getElement();
			if (el) {
				group = my.group[this.group];
				w = (group && group.equalWidth) ? group.currentWidth : this.localWidth;
				h = (group && group.equalHeight) ? group.currentHeight : this.localHeight;
				el.style.width = w + 'px';
				el.style.height = h + 'px';
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
			var h,
				w,
				group,
				el;
			el = this.getElement();
			if (el) {
				group = my.group[this.group];
				w = (group && group.equalWidth) ? group.currentWidth : this.localWidth;
				h = (group && group.equalHeight) ? group.currentHeight : this.localHeight;
				el.width = w;
				el.height = h;
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
Pad constructor hook function - amended by Stacks module
@method sortCellsCompile
@return Nothing
@private
**/
		my.Pad.prototype.padStacksConstructor = function(items) {
			this.setStyles(items);
			this.setTransformOrigin();
		};
		/**
Pad set hook function - amended by Stacks module
@method padStacksSet
@return Nothing
@private
**/
		my.Pad.prototype.padStacksSet = function(items) {
			items = my.safeObject(items);
			if (this.lockTo) {
				if (my.xto(items.width, items.height, items.scale)) {
					this.setLocalDimensions();
				}
			}
			if (this.group) {
				my.canvas[this.name].style.margin = '0';
				my.canvas[this.name].style.boxSizing = 'border-box';
			}
		};
		/**
Pad lockTo helper
@method setCellLocalDimensions
@return Nothing
@private
**/
		my.Pad.prototype.setCellLocalDimensions = function() {
			var i,
				iz,
				cell;
			if (my.xt(this.cells)) {
				for (i = 0, iz = this.cells.length; i < iz; i++) {
					cell = my.cell[this.cells[i]];
					if (this.lockTo && cell.name === this.base) {
						cell.set({
							width: this.localWidth,
							height: this.localHeight
						});
					}
					if (cell.name === this.display) {
						cell.set({
							width: this.localWidth,
							height: this.localHeight
						});
					}
				}
			}
		};
		/**
Stamp helper hook function - amended by stacks module

@method setStampUsingStacksPivot
@return always true
**/
		my.Position.prototype.setStampUsingStacksPivot = function() {
			var myP,
				myPVector;
			myP = my.element[this.pivot] || my.stack[this.pivot] || my.pad[this.pivot] || false;
			if (myP) {
				myPVector = myP.getStartValues();
				if (!this.lockX) {
					this.start.x = (my.isa(myP.start.x, 'str')) ? myPVector.x * myP.scale : myPVector.x;
				}
				if (!this.lockY) {
					this.start.y = (my.isa(myP.start.y, 'str')) ? myPVector.y * myP.scale : myPVector.y;
				}
				return this;
			}
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
				case 'Pad':
				case 'Stack':
				case 'Element':
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
			var temp;
			items = my.safeObject(items);
			if (my.xt(items.stackElement)) {
				items.width = my.xtGet(items.width, items.stackElement.style.width, my.d.Stack.width);
				items.height = my.xtGet(items.height, items.stackElement.style.height, my.d.Stack.height);
				items.name = my.xtGet(items.stackName, items.name, items.stackElement.id, items.stackElement.name, 'Stack');
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
					x: my.xtGet(items.perspectiveX, temp.x, 'center'),
					y: my.xtGet(items.perspectiveY, temp.y, 'center'),
					z: my.xtGet(items.perspectiveZ, temp.z, 0)
				});
				this.work.perspective = my.newVector({
					name: this.type + '.' + this.name + '.work.perspective'
				});
				this.initMouse(items.mouse || 1);
				this.groups = [this.name];
				my.newElementGroup({
					name: this.name,
					stack: this.name
				});
				this.group = my.xtGet(items.group, false);
				if (this.group) {
					my.group[this.group].addElementsToGroup(this.name);
				}
				this.setStyles(items);
				this.setPerspective();
				this.setTransformOrigin();
				if (this.group) {
					my.stk[this.name].style.margin = '0';
					my.stk[this.name].style.boxSizing = 'border-box';
					items.stackElement.style.position = 'absolute';
				}
				return this;
			}
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
The PADNAME String of a canvas locked to the stack

@property canvas
@type String
@default ''
**/
			canvas: '',
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
			var temp,
				g,
				i,
				iz;
			items = my.safeObject(items);
			my.PageElement.prototype.set.call(this, items);
			if (my.xto(items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
				if (!this.perspective.type || this.perspective.type !== 'Vector') {
					this.perspective = my.newVector(items.perspective || this.perspective);
				}
				if (my.xto(items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
					temp = my.safeObject(items.perspective);
					this.perspective.x = my.xtGet(items.perspectiveX, temp.x, this.perspective.x);
					this.perspective.y = my.xtGet(items.perspectiveY, temp.y, this.perspective.y);
					this.perspective.z = my.xtGet(items.perspectiveZ, temp.z, this.perspective.z);
				}
				this.setPerspective();
			}
			if (my.xto(items.width, items.height, items.scale)) {
				for (i = 0, iz = my.groupnames.length; i < iz; i++) {
					g = my.group[my.groupnames[i]];
					if (g.type === 'ElementGroup') {
						if (g.stack === this.name) {
							g.updateDimensions();
						}
					}
				}
				this.setPerspective();
			}
			return this;
		};
		/**
Augments PageElement.setDelta(), to allow users to set the stack perspective using perspectiveX, perspectiveY, perspectiveZ
@method setDelta
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.Stack.prototype.setDelta = function(items) {
			var temp,
				g,
				i,
				iz;
			items = my.safeObject(items);
			my.PageElement.prototype.setDelta.call(this, items);
			if (my.xto(items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
				if (!this.perspective.type || this.perspective.type !== 'Vector') {
					this.perspective = my.newVector(items.perspective || this.perspective);
				}
				if (my.xto(items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
					temp = my.safeObject(items.perspective);
					this.perspective.x += my.xtGet(items.perspectiveX, temp.x, 0);
					this.perspective.y += my.xtGet(items.perspectiveY, temp.y, 0);
					this.perspective.z += my.xtGet(items.perspectiveZ, temp.z, 0);
				}
				this.setPerspective();
			}
			for (i = 0, iz = my.groupnames.length; i < iz; i++) {
				g = my.group[my.groupnames[i]];
				if (g.type === 'ElementGroup') {
					if (g.stack === this.name) {
						g.updateDimensions();
					}
				}
			}
			return this;
		};
		/**
Helper function - set local dimensions (width, height)

_Replaces PageElement.setLocalDimensions
@method setLocalDimensions
@return This
@chainable
@private
**/
		my.Stack.prototype.setLocalDimensions = function() {
			var h,
				w,
				hVal,
				wVal,
				parent,
				el,
				elRes,
				g,
				gRes;
			parent = (my.xt(my.group[this.group])) ? my.stack[my.group[this.group].stack] : false;
			if (parent) {
				w = parent.localWidth;
				h = parent.localHeight;
			}
			wVal = parseFloat(this.width);
			hVal = parseFloat(this.height);
			if (wVal === 0 || isNaN(wVal) || hVal === 0 || isNaN(hVal)) {
				g = my.group[this.name];
				if (g) {
					gRes = g.getElementGroupDimensions();
				}
				else {
					el = this.getElement();
					if (el) {
						elRes = window.getComputedStyle(el, null);
					}
				}
			}
			if (wVal === 0 || isNaN(wVal)) {
				if (gRes) {
					this.localWidth = gRes.width;
				}
				else if (elRes) {
					el.style.width = 'auto';
					this.localWidth = parseFloat(elRes.getPropertyValue('width'));
				}
				else {
					this.localWidth = 0;
				}
			}
			else {
				if (parent && my.isa(this.width, 'str') && w) {
					this.localWidth = ((parseFloat(this.width) / 100) * w) * this.scale;
				}
				else {
					this.localWidth = this.width * this.scale;
				}
			}
			if (hVal === 0 || isNaN(hVal)) {
				if (gRes) {
					this.localHeight = gRes.height;
				}
				else if (elRes) {
					el.style.width = 'auto';
					this.localWidth = parseFloat(elRes.getPropertyValue('width'));
				}
				else {
					this.localHeight = 0;
				}
			}
			else {
				if (parent && my.isa(this.height, 'str') && h) {
					this.localHeight = ((parseFloat(this.height) / 100) * h) * this.scale;
				}
				else {
					this.localHeight = this.height * this.scale;
				}
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
				thisElement,
				i,
				iz;
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
			var height,
				width;
			height = this.localHeight || this.height || this.get('height');
			width = this.localWidth || this.width || this.get('width');
			return my.Position.prototype.calculatePOV.call(this, this.work.perspective, width, height, false);
		};
		/**
Calculates the pixels value of the object's perspective attribute
@method setPerspective
@return Set the Stack element's perspective point
**/
		my.Stack.prototype.setPerspective = function() {
			var sx,
				sy,
				myH,
				el;
			this.resetWork();
			sx = (my.isa(this.perspective.x, 'str')) ? this.scale : 1;
			sy = (my.isa(this.perspective.y, 'str')) ? this.scale : 1;
			myH = this.parsePerspective();
			el = this.getElement();
			myH.x *= sx;
			myH.y *= sy;
			//myH.z *= sx;
			el.style.mozPerspectiveOrigin = myH.x + 'px ' + myH.y + 'px';
			el.style.webkitPerspectiveOrigin = myH.x + 'px ' + myH.y + 'px';
			el.style.perspectiveOrigin = myH.x + 'px ' + myH.y + 'px';
			el.style.mozPerspective = myH.z + 'px';
			el.style.webkitPerspective = myH.z + 'px';
			el.style.perspective = myH.z + 'px';
		};

		my.pushUnique(my.sectionlist, 'element');
		my.pushUnique(my.sectionlist, 'elm');
		my.pushUnique(my.nameslist, 'elementnames');
		/**
Get dimensions of Stack
@method getStackDimensions
@return Object with width and height attributes
**/
		my.Stack.prototype.getStackDimensions = function() {
			var g = my.group[this.name];
			return (g) ? g.getElementGroupDimensions() : my.o;
		};
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
				items.width = my.xtGet(items.width, items.domElement.style.width, my.d.Stack.width);
				items.height = my.xtGet(items.height, items.domElement.style.height, my.d.Stack.height);
				items.name = my.xtGet(items.elementName, items.name, items.domElement.id, items.domElement.name, 'Element');
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
				this.initMouse(items.mouse || 0);
				this.setStyles(items);
				this.setTransformOrigin();
				if (this.group) {
					my.elm[this.name].style.margin = '0';
					my.elm[this.name].style.boxSizing = 'border-box';
				}
				return this;
			}
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
			this.equalWidth = my.xtGet(items.equalWidth, false);
			this.equalHeight = my.xtGet(items.equalHeight, false);
			this.currentWidth = 0;
			this.currentHeight = 0;
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
current value of widest element width
@property currentWidth
@type Number
@default 0
**/
			currentWidth: false,
			/**
Current value of takkest element height
@property currentHeight
@type Number
@default 0
**/
			currentHeight: false,
			/**
When true, forces all elements (including stacks, pads) to use the width of the currently widest element; default: false
@property equalWidth
@type Boolean
@default false
**/
			equalWidth: false,
			/**
When true, forces all elements (including stacks, pads) to use the height of the currently tallest element; default: false
@property equalHeight
@type Boolean
@default false
**/
			equalHeight: false,
			/**
STACKNAME of the default Stack object to which this group is associated
@property recalculateDimensions
@type Boolean
@default false
**/
			recalculateDimensions: false,
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
			var i,
				iz,
				stack;
			stack = my.stack[this.stack];
			for (i = 0, iz = this.entitys.length; i < iz; i++) {
				//PROBABLY NEED TO amend the varous stamping routines to accommodate using a Stack's data instead of Cell data
				my.entity[this.entitys[i]].stamp('none', stack);
			}
			return this;
		};
		/**
Get collective dimensions of ElementGroup elements
@method getElementGroupDimensions
@return Object with width and height attributes
**/
		my.ElementGroup.prototype.getElementGroupDimensions = function() {
			var temp,
				el, e,
				result = {
					width: 0,
					height: 0
				},
				i, iz;
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				el = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				if (el.visibility) {
					e = el.getElement();
					switch (el.type) {
						case 'Stack':
							temp = el.getStackDimensions();
							result.width = (temp.width > result.width) ? temp.width : result.width;
							result.height = (temp.height > result.height) ? temp.height : result.height;
							break;
						default:
							temp = parseFloat(e.style.left) + el.localWidth - el.offset.x;
							result.width = (temp > result.width) ? temp : result.width;
							temp = parseFloat(e.style.top) + el.localHeight - el.offset.y;
							result.height = (temp > result.height) ? temp : result.height;
					}
				}
			}
			return result;
		};
		/**
Tell the Group to ask its constituent elements to render
@method render
@return This
@chainable
**/
		my.ElementGroup.prototype.render = function() {
			var i,
				iz,
				w,
				h,
				el;
			if (this.recalculateDimensions) {
				for (i = 0, iz = this.elements.length; i < iz; i++) {
					el = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
					el.setLocalDimensions();
				}
				this.recalculateDimensions = false;
			}
			if (this.checkEqualDimensions()) {
				this.currentWidth = 0;
				this.currentHeight = 0;
				for (i = 0, iz = this.elements.length; i < iz; i++) {
					el = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
					//el.group = this.name;
					if (el.localWidth > this.currentWidth) {
						this.currentWidth = el.localWidth;
					}
					if (el.localHeight > this.currentHeight) {
						this.currentHeight = el.localHeight;
					}
				}
			}
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				el = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				el.renderElement();
				if (el.type === 'Stack') {
					my.group[el.name].render();
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
			var i,
				iz,
				temp;
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
check whether this.equalHeight or this.equalWidth has been set to true

@method checkEqualDimensions
@return True if either equalWidth or equalHeight is true; false otherwise
**/
		my.ElementGroup.prototype.checkEqualDimensions = function() {
			return (this.equalHeight || this.equalWidth) ? true : false;
		};
		/**
Add elements to the Group
@method addElementsToGroup
@param {Array} item Array of ELEMENTNAME Strings; alternatively, a single ELEMENTNAME String can be supplied as the argument
@return This
@chainable
**/
		my.ElementGroup.prototype.addElementsToGroup = function(item) {
			var i,
				iz;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
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
			var i,
				iz;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
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
			var i,
				iz;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
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
			var i,
				iz;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
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
			var i,
				iz,
				temp;
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
			var i,
				iz;
			items = my.safeObject(items);
			for (i = 0, iz = this.entitys.length; i < iz; i++) {
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
			var i,
				iz,
				temp;
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				temp = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				temp.set(items);
			}
			return this;
		};
		/**
Ask all elements in the Group to perform a dimension update operation
@method updateDimensions
@param {Object} items Object containing attribute key:value pairs
@return This
@chainable
**/
		my.ElementGroup.prototype.updateDimensions = function() {
			var i,
				iz,
				temp;
			for (i = 0, iz = this.elements.length; i < iz; i++) {
				temp = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
				temp.setLocalDimensions();
				temp.setDimensions();
				temp.offset.flag = false;
				if (temp.type === 'Stack') {
					my.group[temp.name].updateDimensions();
				}
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
			var i,
				iz,
				p,
				pStart,
				element,
				sv,
				arg = {
					pivot: '',
					handleX: 0,
					handleY: 0
				};
			item = (my.isa(item, 'str')) ? item : false;
			if (item) {
				p = my.stack[item] || my.pad[item] || my.element[item] || my.entity[item] || my.point[item] || false;
				if (p) {
					pStart = (p.type === 'Point') ? p.local : p.start;
					for (i = 0, iz = this.elements.length; i < iz; i++) {
						element = my.stack[this.elements[i]] || my.pad[this.elements[i]] || my.element[this.elements[i]] || false;
						if (element) {
							sv = my.v.set(element.start);
							sv.vectorSubtract(pStart);
							arg.pivot = item;
							arg.handleX = -sv.x;
							arg.handleY = -sv.y;
							element.set(arg);
						}
					}
				}
			}
			return this;
		};

		return my;
	}(scrawl));
}
