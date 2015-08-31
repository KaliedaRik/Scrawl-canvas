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
* Device.transform - default: false;

@class window.scrawl_Stacks
**/

		/**
scrawl.init hook function - modified by stacks module
@method pageInit
@private
**/
		my.pageInit = function() {
			my.getStacks();
			if (my.device.canvas) {
				my.getCanvases();
			}
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
				myCanvas,
				makeStack = my.makeStack,
				makeElement = my.makeElement,
				stk = my.stk,
				elm = my.elm,
				element = my.element;
			s = document.getElementsByClassName("scrawlstack");
			stacks = [];
			if (s.length > 0) {
				for (i = 0, iz = s.length; i < iz; i++) {
					stacks.push(s[i]);
				}
				for (i = 0, iz = s.length; i < iz; i++) {
					myStack = makeStack({
						stackElement: stacks[i]
					});
					for (j = 0, jz = stk[myStack.name].children.length; j < jz; j++) {
						stk[myStack.name].children[j].style.position = 'absolute';
						if (stk[myStack.name].children[j].tagName !== 'CANVAS') {
							makeElement({
								domElement: stk[myStack.name].children[j],
								group: myStack.name
							});
						}
						else {
							stk[myStack.name].children[j].className += ' stack:' + myStack.name;
						}
					}
					if (element[myStack.name]) {
						myStack.group = element[myStack.name].group;
						delete element[myStack.name];
						delete elm[myStack.name];
						my.removeItem(my.elementnames, myStack.name);
					}
					if (stacks[i].className.match(/withcanvas/)) {
						myCanvas = document.createElement('canvas');
						myCanvas.style.position = 'absolute';
						myCanvas.id = myStack.name + '_canvas';
						myCanvas.className = 'lockTo:' + myStack.name;
						stk[myStack.name].appendChild(myCanvas);
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
							stack = my.makeStack({
								stackElement: myElement
							});
						}
					}
					myPad = my.makePad({
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
				myStack,
				cont = my.contains,
				get = my.xtGet,
				elementnames = my.elementnames,
				stacknames = my.stacknames,
				stk = my.stk,
				makeElement = my.makeElement;
			s = document.getElementsByClassName("scrawl");
			el = [];
			if (s.length > 0) {
				for (i = 0, iz = s.length; i < iz; i++) {
					el.push(s[i]);
				}
				for (i = 0, iz = s.length; i < iz; i++) {
					myName = get(el.id, el.name, false);
					if (!cont(elementnames, myName)) {
						if (el[i].className.indexOf('stack:') !== -1) {
							myStack = el[i].className.match(/stack:(\w+)/);
							if (cont(stacknames, myStack[1])) {
								stk[myStack[1]].appendChild(el[i]);
								makeElement({
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
                name:   'mycanvas',
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
				stackParent,
				xt = my.xt,
				get = my.xtGet,
				round = Math.round;
			items = my.safeObject(items);
			items.width = get(items.width, 300);
			items.height = get(items.height, 150);
			if (xt(items.stackName)) {
				myStk = my.stack[items.stackName];
				if (!myStk) {
					if (!xt(items.parentElement)) {
						stackParent = document.body;
					}
					else {
						stackParent = (items.parentElement.substring) ? document.getElementById(items.parentElement) : items.parentElement;
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
			if (items.width.substring) {
				items.width = round((parseFloat(items.width) / 100) * parseFloat(myParent.style.width));
			}
			if (items.height.substring) {
				items.height = round((parseFloat(items.height) / 100) * parseFloat(myParent.style.height));
			}
			myCanvas = document.createElement('canvas');
			myCanvas.style.position = get(items.position, 'absolute');
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
				myStack,
				get = my.xtGet;
			if (items.stackName.substring && my.xt(items.parentElement)) {
				items.parentElement = (items.parentElement.substring) ? document.getElementById(items.parentElement) : items.parentElement;
				myElement = document.createElement('div');
				myElement.id = items.stackName;
				myElement.style.width = get(items.width, 300) + 'px';
				myElement.style.height = get(items.height, 150) + 'px';
				items.parentElement.appendChild(myElement);
				items.stackElement = myElement;
				myStack = my.makeStack(items);
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
				iz,
				s = my.stack,
				sn = my.stacknames,
				p = my.pad,
				pn = my.padnames,
				e = my.element,
				en = my.elementnames;
			item = (my.xt(item)) ? item : 'all';
			if (item === 'stack' || item === 'all') {
				for (i = 0, iz = sn.length; i < iz; i++) {
					s[sn[i]].setDisplayOffsets();
				}
			}
			if (item === 'pad' || item === 'all') {
				for (i = 0, iz = pn.length; i < iz; i++) {
					p[pn[i]].setDisplayOffsets();
				}
			}
			if (item === 'element' || item === 'all') {
				for (i = 0, iz = en.length; i < iz; i++) {
					e[en[i]].setDisplayOffsets();
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
				p,
				pad = my.pad;
			my.renderElements();
			p = (my.xt(pads)) ? [].concat(pads) : my.padnames;
			for (i = 0, iz = p.length; i < iz; i++) {
				pad[p[i]].render();
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
				s,
				stack = my.stack,
				stacknames = my.stacknames;
			for (i = 0, iz = stacknames.length; i < iz; i++) {
				s = stack[stacknames[i]];
				if (!s.group) {
					s.render();
				}
			}
			return true;
		};
		/**
A __display__ function to initialize DOM elements with their existing values
@method domInit
@return Always true
**/
		my.domInit = function() {
			var i,
				iz,
				s,
				stack = my.stack,
				stacknames = my.stacknames;
			for (i = 0, iz = stacknames.length; i < iz; i++) {
				s = stack[stacknames[i]];
				if (!s.group) {
					s.domInit();
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
				s,
				stack = my.stack,
				stacknames = my.stacknames,
				group = my.group;
			items = my.safeObject(items);
			if (items.group && items.group.substring && group[items.group] && group[items.group].type === 'ElementGroup') {
				group[items.group].update(items);
			}
			else {
				for (i = 0, iz = stacknames.length; i < iz; i++) {
					s = stack[stacknames[i]];
					if (!s.group) {
						s.update(items);
					}
				}
			}
			return true;
		};

		/**
DOM element css3 3d transform support

True if the CSS2 3d functionality is supported; false otherwise
@property transform
@type Boolean
@default false
**/
		my.d.Device.transform = false;

		/**
Check if device supports CSS3 3d transforms
@method getStacksDeviceData
@private
**/
		my.Device.prototype.getStacksDeviceData = function() {
			var c = document.createElement('div');
			this.transform = my.xto(c.style.webkitPerspectiveOrigin, c.style.mozPerspectiveOrigin, c.style.msPerspectiveOrigin, c.style.perspectiveOrigin);
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
Element 2d roll value
@property PageElement.roll
@type Number
@default 0
**/
		my.d.PageElement.roll = 0;
		/**
Element 2d pitch value
@property PageElement.pitch
@type Number
@default 0
**/
		my.d.PageElement.pitch = 0;
		/**
Element 2d yaw value
@property PageElement.yaw
@type Number
@default 0
**/
		my.d.PageElement.yaw = 0;
		/**
Element 2d deltaRoll value
@property PageElement.deltaRoll
@type Number
@default 0
**/
		my.d.PageElement.deltaRoll = 0;
		/**
Element 2d deltaPitch value
@property PageElement.deltaPitch
@type Number
@default 0
**/
		my.d.PageElement.deltaPitch = 0;
		/**
Element 2d deltaYaw value
@property PageElement.deltaYaw
@type Number
@default 0
**/
		my.d.PageElement.deltaYaw = 0;
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
		/**
A flag to determine whether an element uses the browser viewport for its position and dimensions reference
@property PageElement.viewport
@type Boolean
@default false
**/
		my.d.PageElement.viewport = false;
		/**
A flag to tell scrawl to add corner trackers to the element

Corner trackers can be used by the PerspectiveCornersCell entity to bind its corners to a DOM element within a stack
@property PageElement.includeCornerTrackers
@type Boolean
@default false
**/
		my.d.PageElement.includeCornerTrackers = false;
		/**
Corner tracker vector
@property PageElement.topLeft
@type Vector
@default false
**/
		my.d.PageElement.topLeft = false;
		/**
Corner tracker vector
@property PageElement.topRight
@type Vector
@default false
**/
		my.d.PageElement.topRight = false;
		/**
Corner tracker vector
@property PageElement.bottomRight
@type Vector
@default false
**/
		my.d.PageElement.bottomRight = false;
		/**
Corner tracker vector
@property PageElement.bottomLeft
@type Vector
@default false
**/
		my.d.PageElement.bottomLeft = false;
		/**
Corner tracker div element
@property PageElement.topLeftDiv
@type DOM element object
@default false
**/
		my.d.PageElement.topLeftDiv = false;
		/**
Corner tracker div element
@property PageElement.topRightDiv
@type DOM element object
@default false
**/
		my.d.PageElement.topRightDiv = false;
		/**
Corner tracker div element
@property PageElement.bottomRightDiv
@type DOM element object
@default false
**/
		my.d.PageElement.bottomRightDiv = false;
		/**
Corner tracker div element
@property PageElement.bottomLeftDiv
@type DOM element object
@default false
**/
		my.d.PageElement.bottomLeftDiv = false;
		/**
Index of mouse vector to use when pivot === 'mouse'

The Pad/Stack/Element.mice object can hold details of multiple touch events - when an entity is assigned to a 'mouse', it needs to know which of those mouse trackers to use. Default: mouse (for the mouse cursor vector)
@property mouseIndex
@type String
@default 'mouse'
**/
		my.d.PageElement.mouseIndex = 'mouse';
		my.mergeInto(my.d.Pad, my.d.PageElement);
		/**
PageElement constructor hook function - modified by stacks module
@method stacksPageElementConstructor
@private
**/
		my.PageElement.prototype.stacksPageElementConstructor = function(items) {
			var temp = my.safeObject(items.start),
				so = my.safeObject,
				vec = my.makeVector,
				get = my.xtGet,
				quat = my.makeQuaternion,
				d = my.d[this.type];
			this.start = vec({
				name: this.type + '.' + this.name + '.start',
				x: get(items.startX, temp.x, 0),
				y: get(items.startY, temp.y, 0)
			});
			this.currentStart = vec({
				name: this.type + '.' + this.name + '.current.start'
			});
			this.currentStart.flag = false;
			temp = so(items.delta);
			this.delta = vec({
				name: this.type + '.' + this.name + '.delta',
				x: get(items.deltaX, temp.x, 0),
				y: get(items.deltaY, temp.y, 0)
			});
			temp = so(items.handle);
			this.handle = vec({
				name: this.type + '.' + this.name + '.handle',
				x: get(items.handleX, temp.x, 0),
				y: get(items.handleY, temp.y, 0)
			});
			temp = so(items.translate);
			this.currentHandle = vec({
				name: this.type + '.' + this.name + '.current.handle'
			});
			this.currentHandle.flag = false;
			this.translate = vec({
				name: this.type + '.' + this.name + '.translate',
				x: get(items.translateX, temp.x, 0),
				y: get(items.translateY, temp.y, 0),
				z: get(items.translateZ, temp.z, 0)
			});
			temp = so(items.deltaTranslate);
			this.deltaTranslate = vec({
				name: this.type + '.' + this.name + '.deltaTranslate',
				x: get(items.deltaTranslateX, temp.x, 0),
				y: get(items.deltaTranslateY, temp.y, 0),
				z: get(items.deltaTranslateZ, temp.z, 0)
			});
			this.pivot = get(items.pivot, d.pivot);
			this.path = get(items.path, d.path);
			this.pathRoll = get(items.pathRoll, d.pathRoll);
			this.addPathRoll = get(items.addPathRoll, d.addPathRoll);
			this.pathSpeedConstant = get(items.pathSpeedConstant, d.pathSpeedConstant);
			this.pathPlace = get(items.pathPlace, d.pathPlace);
			this.deltaPathPlace = get(items.deltaPathPlace, d.deltaPathPlace);
			this.lockX = get(items.lockX, d.lockX);
			this.lockY = get(items.lockY, d.lockY);
			this.lockTo = get(items.lockTo, d.lockTo);
			this.scale = get(items.scale, 1);
			this.viewport = get(items.viewport, false);
			this.visibility = get(items.visibility, d.visibility);
			this.pitch = items.pitch || 0;
			this.yaw = items.yaw || 0;
			this.roll = items.roll || 0;
			this.rotation = quat({
				name: this.type + '.' + this.name + '.rotation'
			}).setFromEuler({
				pitch: this.pitch,
				yaw: this.yaw,
				roll: this.roll
			});
			this.deltaPitch = items.deltaPitch || 0;
			this.deltaYaw = items.deltaYaw || 0;
			this.deltaRoll = items.deltaRoll || 0;
			this.deltaRotation = quat({
				name: this.type + '.' + this.name + '.deltaRotation'
			}).setFromEuler({
				pitch: this.deltaPitch,
				yaw: this.deltaYaw,
				roll: this.deltaRoll
			});
			this.rotationTolerance = get(items.rotationTolerance, d.rotationTolerance);
			this.group = get(items.group, false);
			if (this.group) {
				my.group[this.group].addElementsToGroup(this.name);
			}
			this.includeCornerTrackers = get(items.includeCornerTrackers, false);
			if (this.includeCornerTrackers) {
				this.addCornerTrackers();
			}
			this.mouseIndex = get(items.mouseIndex, 'mouse');
		};
		/**
@method addCornerTrackers
@return This
@chainable
@private
**/
		my.PageElement.prototype.addCornerTrackers = function() {
			var corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				temp,
				el = this.getElement(),
				i;
			for (i = 0; i < 4; i++) {
				this[corners[i]] = my.makeVector();
				temp = document.createElement('div');
				temp.id = this.name + '_' + corners[i];
				temp.style.width = 0;
				temp.style.height = 0;
				temp.style.margin = 0;
				temp.style.border = 0;
				temp.style.padding = 0;
				temp.style.position = 'absolute';
				switch (corners[i]) {
					case 'topLeft':
						temp.style.top = 0;
						temp.style.left = 0;
						break;
					case 'topRight':
						temp.style.top = 0;
						temp.style.right = 0;
						break;
					case 'bottomRight':
						temp.style.bottom = 0;
						temp.style.right = 0;
						break;
					case 'bottomLeft':
						temp.style.bottom = 0;
						temp.style.left = 0;
						break;
				}
				el.appendChild(temp);
				this[corners[i] + 'Div'] = temp;
			}
			this.updateCornerTrackers();
			return this;
		};
		/**
@method updateCornerTrackers
@return This
@chainable
@private
**/
		my.PageElement.prototype.updateCornerTrackers = function() {
			var corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
				temp, left, top,
				stack = my.stack[my.group[this.group].stack],
				device = my.device,
				el = this.getElement(),
				i;
			for (i = 0; i < 4; i++) {
				if (this[corners[i]] && this[corners[i] + 'Div']) {
					temp = this[corners[i] + 'Div'].getBoundingClientRect();
					left = parseFloat(el.style.borderLeftWidth);
					left = isNaN(left) ? 0 : left;
					top = parseFloat(el.style.borderTopWidth);
					top = isNaN(top) ? 0 : top;
					this[corners[i]].x = temp.left + device.offsetX - stack.displayOffsetX - left;
					this[corners[i]].y = temp.top + device.offsetY - stack.displayOffsetY - top;
				}
			}
			return this;
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
				el,
				cont = my.contains;
			el = this.getElement();
			if (cont(stat1, item)) {
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
			if (cont(stat2, item)) {
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
			var xt = my.xt,
				xto = my.xto;
			items = my.safeObject(items);
			my.Base.prototype.set.call(this, items);
			if (xto(items.start, items.startX, items.startY)) {
				this.setStart(items);
			}
			if (xto(items.handle, items.handleX, items.handleY)) {
				this.setHandle(items);
			}
			if (xto(items.delta, items.deltaX, items.deltaY)) {
				this.setDeltaAttribute(this);
			}
			if (xto(items.translate, items.translateX, items.translateY, items.translateZ)) {
				this.setTranslate(items);
			}
			if (xto(items.deltaTranslate, items.deltaTranslateX, items.deltaTranslateY, items.deltaTranslateZ)) {
				this.setDeltaTranslate(items);
			}
			if (xto(items.pitch, items.yaw, items.roll)) {
				this.setRotation(items);
			}
			if (xto(items.deltaPitch, items.deltaYaw, items.deltaRoll)) {
				this.setDeltaRotation(items);
			}
			if (xt(items.includeCornerTrackers)) {
				this.includeCornerTrackers = items.includeCornerTrackers;
				if (!this.topLeftDiv) {
					this.addCornerTrackers();
				}
			}
			if (xto(items.width, items.height, items.scale, items.border, items.borderLeft, items.borderRight, items.borderTop, items.borderBottom, items.borderWidth, items.borderLeftWidth, items.borderRightWidth, items.borderTopWidth, items.borderBottomWidth, items.padding, items.paddingLeft, items.paddingRight, items.paddingTop, items.paddingBottom, items.boxSizing, items.lockTo)) {
				if (my.group[this.group] && my.group[this.group].checkEqualDimensions()) {
					my.group[this.group].recalculateDimensions = true;
				}
				this.setLocalDimensions();
				this.setDimensions();
			}
			if (xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.border, items.borderLeft, items.borderRight, items.borderTop, items.borderBottom, items.borderWidth, items.borderLeftWidth, items.borderRightWidth, items.borderTopWidth, items.borderBottomWidth, items.padding, items.paddingLeft, items.paddingRight, items.paddingTop, items.paddingBottom, items.boxSizing, items.lockTo)) {
				this.currentHandle.flag = false;
			}
			if (xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start, items.border, items.borderLeft, items.borderRight, items.borderTop, items.borderBottom, items.borderWidth, items.borderLeftWidth, items.borderRightWidth, items.borderTopWidth, items.borderBottomWidth, items.padding, items.paddingLeft, items.paddingRight, items.paddingTop, items.paddingBottom, items.boxSizing, items.lockTo)) {
				this.setDisplayOffsets();
			}
			if (xto(items.handleX, items.handleY, items.handle)) {
				this.setTransformOrigin();
			}
			if (xt(items.group)) {
				this.setGroupAttribute(items);
			}
			if (xt(items.pivot)) {
				this.setPivotAttribute(items);
			}
			if (xto(items.title, items.comment)) {
				this.setAccessibility(items);
			}
			this.setStyles(items);
			return this;
		};
		/**
Augments Base.setStart(), to allow users to set the start attributes using start, startX, startY
@method setStart
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setStart = function(items) {
			var temp,
				so = my.safeObject,
				get = my.xtGet,
				vec = my.makeVector,
				isvec = my.isa_vector;
			items = so(items);
			if (!isvec(this.start)) {
				this.start = vec(items.start || this.start);
				this.start.name = this.type + '.' + this.name + '.start';
			}
			temp = so(items.start);
			this.start.x = get(items.startX, temp.x, this.start.x);
			this.start.y = get(items.startY, temp.y, this.start.y);
			if (!isvec(this.currentStart)) {
				this.currentStart = vec({
					name: this.type + '.' + this.name + '.current.start'
				});
			}
			this.currentStart.flag = false;
			return this;
		};
		/**
Augments Base.setHandle(), to allow users to set the handle attributes using handle, handleX, handleY
@method setHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setHandle = function(items) {
			var temp,
				so = my.safeObject,
				get = my.xtGet,
				vec = my.makeVector,
				isvec = my.isa_vector;
			items = so(items);
			if (!isvec(this.handle)) {
				this.handle = vec(items.handle || this.handle);
				this.handle.name = this.type + '.' + this.name + '.handle';
			}
			temp = so(items.handle);
			this.handle.x = get(items.handleX, temp.x, this.handle.x);
			this.handle.y = get(items.handleY, temp.y, this.handle.y);
			if (!isvec(this.currentHandle)) {
				this.currentHandle = vec({
					name: this.type + '.' + this.name + '.current.handle'
				});
			}
			this.currentHandle.flag = false;
			return this;
		};
		/**
Augments PageElement.set(), to allow users to set the delta attributes using delta, deltaX, deltaY

The scrawlAnimation module adds a __delta__ attribute to Cells and Entitys - this is an inbuilt delta vector which can be used to automatically animate the start vector of these objects - via the updateStart, revertStart and reverse functions - as part of the animation cycle.

Be aware that this is different to the PageElement.setDelta() function inherited by Cells and Entitys. setDelta is used to add a supplied argument value to the existing values of any numerical attribute of a Cell or Entity object, and is thus not limited to the animation cycle.

@method setDeltaAttribute
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setDeltaAttribute = function(items) {
			var temp,
				so = my.safeObject,
				get = my.xtGet;
			items = so(items);
			if (!my.isa_vector(this.delta)) {
				this.delta = my.makeVector(items.delta || this.delta);
			}
			temp = so(items.delta);
			this.delta.x = get(items.deltaX, temp.x, this.delta.x);
			this.delta.y = get(items.deltaY, temp.y, this.delta.y);
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
				iz,
				group = my.group,
				groupnames = my.groupnames,
				cont = my.contains;
			for (i = 0, iz = groupnames.length; i < iz; i++) {
				temp = group[groupnames[i]];
				if (temp.type === 'ElementGroup') {
					if (groupnames[i] === items.group) {
						temp.addElementsToGroup(this.name);
					}
					else {
						if (cont(temp.elements, this.name)) {
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
			var temp,
				get = my.xtGet,
				t;
			items = my.safeObject(items);
			if (!this.translate.type || this.translate.type !== 'Vector') {
				this.translate = my.makeVector(items.translate || this.translate);
			}
			temp = my.safeObject(items.translate);
			t = this.translate;
			t.x = get(items.translateX, temp.x, t.x);
			t.y = get(items.translateY, temp.y, t.y);
			t.z = get(items.translateZ, temp.z, t.z);
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
			if (item.substring) {
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
			if (item.substring) {
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
			var temp,
				get = my.xtGet,
				t;
			items = my.safeObject(items);
			if (!this.deltaTranslate.type || this.deltaTranslate.type !== 'Vector') {
				this.deltaTranslate = my.makeVector(items.deltaTranslate || this.deltaTranslate);
			}
			temp = my.safeObject(items.deltaTranslate);
			t = this.deltaTranslate;
			t.x = get(items.deltaTranslateX, temp.x, t.x);
			t.y = get(items.deltaTranslateY, temp.y, t.y);
			t.z = get(items.deltaTranslateZ, temp.z, t.z);
			return this;
		};
		my.css = ['all', 'background', 'backgroundAttachment', 'backgroundBlendMode', 'backgroundClip', 'backgroundColor', 'backgroundOrigin', 'backgroundPosition', 'backgroundRepeat', 'border', 'borderBottom', 'borderBottomColor', 'borderBottomStyle', 'borderBottomWidth', 'borderCollapse', 'borderColor', 'borderLeft', 'borderLeftColor', 'borderLeftStyle', 'borderLeftWidth', 'borderRight', 'borderRightColor', 'borderRightStyle', 'borderRightWidth', 'borderSpacing', 'borderStyle', 'borderTop', 'borderTopColor', 'borderTopStyle', 'borderTopWidth', 'borderWidth', 'clear', 'color', 'columns', 'content', 'counterIncrement', 'counterReset', 'cursor', 'direction', 'display', 'emptyCells', 'float', 'font', 'fontFamily', 'fontKerning', 'fontLanguageOverride', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontSynthesis', 'fontVariant', 'fontVariantAlternates', 'fontVariantCaps', 'fontVariantEastAsian', 'fontVariantLigatures', 'fontVariantNumeric', 'fontVariantPosition', 'fontWeight', 'grid', 'gridArea', 'gridAutoColumns', 'gridAutoFlow', 'gridAutoPosition', 'gridAutoRows', 'gridColumn', 'gridColumnStart', 'gridColumnEnd', 'gridRow', 'gridRowStart', 'gridRowEnd', 'gridTemplate', 'gridTemplateAreas', 'gridTemplateRows', 'gridTemplateColumns', 'hyphens', 'imageRendering', 'imageResolution', 'imageOrientation', 'imeMode', 'inherit', 'initial', 'isolation', 'justifyContent', 'letterSpacing', 'lineBreak', 'lineHeight', 'listStyle', 'listStyleImage', 'listStylePosition', 'listStyleType', 'margin', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'marks', 'mask', 'maskType', 'mixBlendMode', 'objectFit', 'objectPosition', 'opacity', 'orphans', 'outline', 'outlineColor', 'outlineOffset', 'outlineStyle', 'outlineWidth', 'overflow', 'overflowWrap', 'overflowX', 'overflowY', 'padding', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'pageBreakAfter', 'pageBreakBefore', 'pageBreakInside', 'pointerEvents', 'position', 'quotes', 'resize', 'rubyAlign', 'rubyMerge', 'rubyPosition', 's', 'scrollBehavior', 'shapeImageThreshold', 'shapeMargin', 'shapeOutside', 'tableLayout', 'tabSize', 'textAlign', 'textAlignLast', 'textCombineUpright', 'textDecoration', 'textDecorationColor', 'textDecorationLine', 'textDecorationStyle', 'textIndent', 'textOrientation', 'textOverflow', 'textRendering', 'textShadow', 'textTransform', 'textUnderlinePosition', 'touchAction', 'unicodeBidi', 'unicodeRange', 'unset', 'verticalAlign', 'visibility', 'whiteSpace', 'widows', 'willChange', 'wordBreak', 'wordSpacing', 'wordWrap', 'writingMode'];
		//need to complete this array
		my.xcss = ['alignContent', 'alignItems', 'alignSelf', 'animation', 'animationDelay', 'animationDirection', 'animationDuration', 'animationFillMode', 'animationIterationCount', 'animationName', 'animationPlayState', 'animationTimingFunction', 'backfaceVisibility', 'backgroundImage', 'backgroundSize', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderImage', 'borderImageOutset', 'borderImageRepeat', 'borderImageSlice', 'borderImageSource', 'borderImageWidth', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'boxDecorationBreak', 'boxShadow', 'boxSizing', 'columnCount', 'columnFill', 'columnGap', 'columnRule', 'columnRuleColor', 'columnRuleStyle', 'columnRuleWidth', 'columnSpan', 'columnWidth', 'filter', 'flex', 'flexBasis', 'flexDirection', 'flexFlow', 'flexGrow', 'flexShrink', 'flexWrap'];
		/**
Handles the setting of many CSS attributes
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
				iz,
				firstLetter,
				remainder,
				cont = my.contains;
			items = my.safeObject(items);
			el = this.getElement();
			k = Object.keys(items);
			for (i = 0, iz = k.length; i < iz; i++) {
				if (k[i] === 'visibility') {
					if (items.visibility.substring) {
						this.visibility = (!cont(stat, items.visibility)) ? true : false;
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
				else if (cont(my.xcss, k[i])) {
					firstLetter = k[i][0].toUpperCase;
					remainder = k[i].substr(1);
					el.style['webkit' + firstLetter + remainder] = items[k[i]];
					el.style['moz' + firstLetter + remainder] = items[k[i]];
					el.style['ms' + firstLetter + remainder] = items[k[i]];
					el.style['o' + firstLetter + remainder] = items[k[i]];
					el.style[k[i]] = items[k[i]];
				}
				else if (cont(my.css, k[i])) {
					el.style[k[i]] = items[k[i]];
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
			var temp,
				xto = my.xto,
				translate = this.translate,
				deltaTranslate = this.deltaTranslate,
				q1 = my.workquat.q1,
				group;
			items = my.safeObject(items);
			if (xto(items.start, items.startX, items.startY)) {
				this.setDeltaStart(items);
			}
			if (xto(items.handle, items.handleX, items.handleY)) {
				this.setDeltaHandle(items);
			}
			if (xto(items.translate, items.translateX, items.translateY)) {
				temp = my.safeObject(items.translate);
				translate.x += my.xtGet(items.translateX, temp.x, 0);
				translate.y += my.xtGet(items.translateY, temp.y, 0);
				translate.z += my.xtGet(items.translateZ, temp.z, 0);
			}
			if (xto(items.deltaTranslate, items.deltaTranslateX, items.deltaTranslateY)) {
				temp = (my.isa_obj(items.deltaTranslate)) ? items.deltaTranslate : {};
				deltaTranslate.x += my.xtGet(items.deltaTranslateX, temp.x, 0);
				deltaTranslate.y += my.xtGet(items.deltaTranslateY, temp.y, 0);
				deltaTranslate.z += my.xtGet(tems.deltaTranslateZ, temp.z, 0);
			}
			if (xto(items.pitch, items.yaw, items.roll)) {
				temp = q1.setFromEuler({
					pitch: items.pitch || 0,
					yaw: items.yaw || 0,
					roll: items.roll || 0,
				});
				this.rotation.quaternionMultiply(temp);
			}
			if (xto(items.deltaPitch, items.deltaYaw, items.deltaRoll)) {
				temp = q1.setFromEuler({
					pitch: items.deltaPitch || 0,
					yaw: items.deltaYaw || 0,
					roll: items.deltaRoll || 0,
				});
				this.deltaRotation.quaternionMultiply(temp);
			}
			if (xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale)) {
				this.currentHandle.flag = false;
			}
			if (xto(items.handleX, items.handleY, items.handle, items.width, items.height, items.scale, items.startX, items.startY, items.start)) {
				this.setDisplayOffsets();
			}
			if (xto(items.handleX, items.handleY, items.handle)) {
				this.setTransformOrigin();
			}
			if (xto(items.width, items.height, items.scale)) {
				group = my.group[this.group];
				if (group && group.checkEqualDimensions()) {
					group.recalculateDimensions = true;
				}
				this.setLocalDimensions();
				this.setDimensions();
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
		my.PageElement.prototype.setDeltaStart = function(items) {
			var temp,
				x,
				y,
				so = my.safeObject,
				get = my.xtGet,
				perc = my.addPercentages;
			items = so(items);
			temp = so(items.start);
			x = get(items.startX, temp.x, 0);
			y = get(items.startY, temp.y, 0);
			this.start.x = (this.start.x.toFixed) ? this.start.x + x : perc(this.start.x, x);
			this.start.y = (this.start.y.toFixed) ? this.start.y + y : perc(this.start.y, y);
			this.currentStart.flag = false;
			return this;
		};
		/**
Adds the value of each attribute supplied in the argument to existing values. This function accepts handle, handleX, handleY
@method setDeltaHandle
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
		my.PageElement.prototype.setDeltaHandle = function(items) {
			var temp,
				x,
				y,
				so = my.safeObject,
				get = my.xtGet,
				perc = my.addPercentages;
			items = so(items);
			temp = so(items.handle);
			x = get(items.handleX, temp.x, 0);
			y = get(items.handleY, temp.y, 0);
			this.handle.x = (this.handle.x.toFixed) ? this.handle.x + x : perc(this.handle.x, x);
			this.handle.y = (this.handle.y.toFixed) ? this.handle.y + y : perc(this.handle.y, y);
			this.currentHandle.flag = false;
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
			item = my.xtGet(item, 'all');
			this.updateStartActions[item](my.addPercentages, this.start, this.delta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			this.setDisplayOffsets();
			return this;
		};
		/**
updateStart helper object

@method PageElement.updateStartActions
@private
**/
		my.PageElement.prototype.updateStartActions = {
			x: function(perc, start, delta, add) {
				start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
			},
			y: function(perc, start, delta, add) {
				start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
			},
			path: function(perc, start, delta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
			},
			all: function(perc, start, delta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x + delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y + delta.y : perc(start.y, delta.y);
				}
			}
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
			item = my.xtGet(item, 'all');
			this.revertStartActions[item](my.subtractPercentages, this.start, this.delta, my.addWithinBounds, this);
			this.currentStart.flag = false;
			if (my.xt(this.collisionArray)) {
				this.collisionArray.length = 0;
			}
			this.setDisplayOffsets();
			return this;
		};
		/**
revertStart helper object

@method PageElement.revertStartActions
@private
**/
		my.PageElement.prototype.revertStartActions = {
			x: function(perc, start, delta, add) {
				start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
			},
			y: function(perc, start, delta, add) {
				start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
			},
			path: function(perc, start, delta, add, obj) {
				obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
			},
			all: function(perc, start, delta, add, obj) {
				if (obj.deltaPathPlace) {
					obj.pathPlace = add(obj.pathPlace, -obj.deltaPathPlace);
				}
				if (delta.x) {
					start.x = (start.x.toFixed) ? start.x - delta.x : perc(start.x, delta.x);
				}
				if (delta.y) {
					start.y = (start.y.toFixed) ? start.y - delta.y : perc(start.y, delta.y);
				}
			}
		};
		/**
Swaps the values of an attribute between two objects
@method PageElement.exchange
@param {Object} obj Object with which this object will swap attribute values
@param {String} item Attribute to be swapped
@return This
@chainable
**/
		my.PageElement.prototype.exchange = function(obj, item) {
			var temp;
			if (my.isa_obj(obj)) {
				temp = this[item] || this.get(item);
				this[item] = obj[item] || obj.get(item);
				obj[item] = temp;
				this.setDisplayOffsets();
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
			item = my.xtGet(item, 'all');
			this.reverseActions[item](this.delta, my.reversePercentage, this);
			this.setDisplayOffsets();
			return this;
		};
		/**
reverse helper object
@method PageElement.reverseActions
@private
**/
		my.PageElement.prototype.reverseActions = {
			deltaX: function(delta, perc) {
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
			},
			deltaY: function(delta, perc) {
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			},
			delta: function(delta, perc) {
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			},
			deltaPathPlace: function(delta, perc, obj) {
				obj.deltaPathPlace = -obj.deltaPathPlace;
			},
			all: function(delta, perc, obj) {
				obj.deltaPathPlace = -obj.deltaPathPlace;
				delta.x = (delta.x.toFixed) ? -delta.x : perc(delta.x);
				delta.y = (delta.y.toFixed) ? -delta.y : perc(delta.y);
			}
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
			var rotation = this.rotation,
				translate = this.translate;
			items = my.safeObject(items);
			if (my.isa_quaternion(items.quaternion)) {
				rotation.set(this.deltaRotation); //deltaRotation represents the initial, world rotation of the element
				rotation.quaternionRotate(items.quaternion); //quaternion is the local amount we want to rotate the element by
				translate.zero();
				translate.vectorAdd(this.deltaTranslate);
				translate.rotate3d(items.quaternion, items.distance);
			}
			else {
				//opposite to above; rotation is the world rotation, deltaRotation the local rotation to be applied
				rotation.quaternionRotate(this.deltaRotation);
				translate.vectorAdd(this.deltaTranslate);
			}
			return this;
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
				i,
				ox,
				oy,
				dx,
				dy,
				handle,
				start,
				device,
				round = Math.round,
				rotation = this.rotation,
				v = rotation.v,
				scale = this.scale,
				style,
				translate = this.translate,
				el,
				result;
			g = my.group[this.group];
			el = this.getElement();
			style = el.style;
			if (!this.currentHandle.flag) {
				this.updateCurrentHandle();
			}
			handle = this.currentHandle;
			if (!this.currentStart.flag && g.stack) {
				this.updateCurrentStart(my.stack[g.stack]);
			}
			if (this.path) {
				this.setStampUsingPath();
			}
			else if (this.pivot) {
				this.setStampUsingPivot();
			}
			start = this.currentStart;

			if (g && (g.equalWidth || g.equalHeight)) {
				this.setDimensions();
			}

			if (rotation.getMagnitude() !== 1) {
				rotation.normalize();
			}

			pere[0] = round(translate.x * scale);
			pere[1] = round(translate.y * scale);
			pere[2] = round(translate.z * scale);
			pere[3] = v.x;
			pere[4] = v.y;
			pere[5] = v.z;
			pere[6] = rotation.getAngle(false);

			for (i = 0; i < 7; i++) {
				if (pere[i] < 0.000001 && pere[i] > -0.000001) {
					pere[i] = 0;
				}
			}

			result = 'translate3d(' + pere[0] + 'px,' + pere[1] + 'px,' + pere[2] + 'px) rotate3d(' + pere[3] + ',' + pere[4] + ',' + pere[5] + ',' + pere[6] + 'rad)';
			style.webkitTransform = result;
			style.transform = result;

			style.zIndex = pere[2];

			if (this.viewport) {
				device = my.device;
				ox = device.offsetX - this.displayOffsetX + handle.x;
				oy = device.offsetY - this.displayOffsetY + handle.y;
				dx = (start.x.substring) ? start.x * scale : start.x;
				dy = (start.y.substring) ? start.y * scale : start.y;
				style.left = ox - dx + 'px';
				style.top = oy - dy + 'px';
			}
			else {
				style.left = (start.x.substring) ? ((start.x * scale) + handle.x) + 'px' : (start.x + handle.x) + 'px';
				style.top = (start.y.substring) ? ((start.y * scale) + handle.y) + 'px' : (start.y + handle.y) + 'px';
			}

			this.updateCornerTrackers();

			return this;
		};
		/**
updateCurrentHandle helper object

@method getReferenceDimensions
@param {Object} reference object - Stack, Pad, Element, Cell or Entity (Block, Wheel, Phrase, Picture, Path, Shape or Frame)
@return Object with attributes {w: width, h: height, c: centered}
@private
**/
		my.PageElement.prototype.getReferenceDimensions = {
			Stack: function(reference) {
				return {
					w: reference.localWidth,
					h: reference.localHeight
				};
			},
			Pad: function(reference) {
				return {
					w: reference.localWidth,
					h: reference.localHeight
				};
			},
			Element: function(reference) {
				return {
					w: reference.localWidth,
					h: reference.localHeight
				};
			}
		};
		/**
Convert handle percentage values to numerical values, stored in currentHandle

@method updateCurrentHandle
@return This
@chainable
@private
**/
		my.PageElement.prototype.updateCurrentHandle = function() {
			var dims, cont, conv, handle, test, testx, testy, currentHandle, scale;
			if (!this.currentHandle.flag) {
				dims = this.getReferenceDimensions[this.type](this);
				cont = my.contains;
				conv = this.numberConvert;
				handle = this.handle;
				test = ['top', 'bottom', 'left', 'right', 'center'];
				testx = handle.x.substring;
				testy = handle.y.substring;
				currentHandle = this.currentHandle;
				scale = this.scale || 1;
				currentHandle.x = (testx) ? conv(handle.x, dims.w) : handle.x;
				currentHandle.y = (testy) ? conv(handle.y, dims.h) : handle.y;
				if (testx) {
					currentHandle.x *= scale;
				}
				if (testy) {
					currentHandle.y *= scale;
				}
				if (isNaN(currentHandle.x)) {
					currentHandle.x = 0;
				}
				if (isNaN(currentHandle.y)) {
					currentHandle.y = 0;
				}
				currentHandle.reverse();
				currentHandle.flag = true;
				// console.log(this.name, this.scale, this.width, this.localWidth, this.height, this.localHeight, currentHandle.x, currentHandle.y);
			}
			return this;
		};
		/**
Convert start percentage values to numerical values, stored in currentStart

@method updateCurrentStart
@param {Object} reference object - Stack, Pad, Element, Cell or Entity (Block, Wheel, Phrase, Picture, Path, Shape or Frame)
@return This
@chainable
@private
**/
		my.PageElement.prototype.updateCurrentStart = function(reference) {
			var dims, conv, start, currentStart;
			if (!this.currentStart.flag && reference && reference.type) {
				currentStart = this.currentStart;
				dims = this.getReferenceDimensions[reference.type](reference);
				conv = this.numberConvert;
				start = this.start;
				currentStart.x = (start.x.substring) ? conv(start.x, dims.w) : start.x;
				currentStart.y = (start.y.substring) ? conv(start.y, dims.h) : start.y;
				if (isNaN(currentStart.x) || isNaN(currentStart.y)) {
					currentStart.x = 0;
					currentStart.y = 0;
					return this;
				}
				currentStart.flag = true;
			}
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
				angle,
				e = my.entity[this.path],
				start = this.start;
			if (e && e.type === 'Path') {
				here = e.getPerimeterPosition(this.pathPlace, this.pathSpeedConstant, this.addPathRoll);
				if (here) {
					start.x = (!this.lockX) ? here.x : start.x;
					start.y = (!this.lockY) ? here.y : start.y;
					this.pathRoll = here.r || 0;
					if (this.addPathRoll) {
						this.rotation.setFromEuler({
							pitch: this.pitch,
							yaw: this.yaw,
							roll: this.pathRoll + this.roll
						});
					}
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
			var mouse,
				stack,
				myP,
				myPVector,
				pEntity,
				x, y,
				start = this.currentStart,
				conv = this.numberConvert;
			if (my.point) {
				myP = my.point[this.pivot];
				if (myP) {
					pEntity = my.entity[myP.entity];
					myPVector = myP.getCurrentCoordinates().rotate(pEntity.roll).vectorAdd(pEntity.currentStart);
					start.x = (!this.lockX) ? myPVector.x : start.x;
					start.y = (!this.lockY) ? myPVector.y : start.y;
					return this;
				}
			}
			myP = my.entity[this.pivot];
			if (myP) {
				myPVector = (myP.type === 'Particle') ? myP.get('place') : myP.get('start');
				start.x = (!this.lockX) ? myPVector.x : start.x;
				start.y = (!this.lockY) ? myPVector.y : start.y;
				return this;
			}
			myP = my.xtGet(my.pad[this.pivot], my.element[this.pivot], my.stack[this.pivot]);
			if (myP) {
				this.setStampUsingDomElement(myP);
				return this;
			}
			if (this.pivot === 'mouse') {
				if (this.group) {
					stack = my.stack[my.group[this.group].stack];
					x = (start.x.substring) ? conv(start.x, stack.localWidth) : start.x;
					y = (start.y.substring) ? conv(start.y, stack.localHeight) : start.y;
					x = (isNaN(x)) ? 0 : x;
					y = (isNaN(y)) ? 0 : y;
					mouse = stack.mice[this.mouseIndex] || {};
					if (!my.xt(mouse)) {
						mouse.x = 0;
						mouse.y = false;
						mouse.active = false;
					}
					if (this.oldX == null && this.oldY == null) { //jshint ignore:line
						this.oldX = x;
						this.oldY = y;
					}
					start.x = (!this.lockX) ? x + mouse.x - this.oldX : x;
					start.y = (!this.lockY) ? y + mouse.y - this.oldY : y;
					this.oldX = mouse.x;
					this.oldY = mouse.y;
				}
			}
			return this;
		};
		/**
Stamp helper hook function - amended by stacks module

@method setStampUsingStacksPivot
@return this
**/
		my.Position.prototype.setStampUsingStacksPivot = function() {
			var myP = my.xtGet(my.pad[this.pivot], my.element[this.pivot], my.stack[this.pivot]);
			if (myP) {
				this.setStampUsingDomElement(myP);
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
			var estart = e.currentStart,
				start = this.start;
			start.x = (!this.lockX) ? estart.x : start.x;
			start.y = (!this.lockY) ? estart.y : start.y;
		};
		/**
setStampUsingPivot helper function
@method PageElement.setStampUsingLockTo
@return nothing
@private
**/
		my.PageElement.prototype.setStampUsingLockTo = function(e) {
			var start = e.currentStart,
				handle = e.currentHandle,
				current = this.currentStart,
				g,
				x,
				y;
			if (!start.flag) {
				e.setStart();
			}
			if (!handle.flag) {
				e.setHandle();
			}
			x = start.x + handle.x;
			y = start.y + handle.y;
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
			current.x = x;
			current.y = y;
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
				y,
				handle,
				scale,
				style;
			el = this.getElement();
			if (el) {
				style = el.style;
				handle = this.handle;
				scale = this.scale;
				x = (handle.x.substring) ? handle.x : (handle.x * scale) + 'px';
				y = (handle.y.substring) ? handle.y : (handle.y * scale) + 'px';
				t = x + ' ' + y;
				style.mozTransformOrigin = t;
				style.webkitTransformOrigin = t;
				style.msTransformOrigin = t;
				style.oTransformOrigin = t;
				style.transformOrigin = t;
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
			if (this.viewport) {
				this.setLocalDimensions();
			}
			myDisplay = this.getElement();
			if (myDisplay.offsetParent) {
				do {
					if (!this.viewport || this.name != myDisplay.id) {
						dox += myDisplay.offsetLeft;
						doy += myDisplay.offsetTop;
					}
					myDisplay = myDisplay.offsetParent;
				} while (myDisplay.offsetParent);
			}
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
				s,
				style,
				scale = this.scale;
			parent = (my.xt(my.group[this.group])) ? my.stack[my.group[this.group].stack] : false;
			if (this.viewport) {
				w = my.device.width;
				h = my.device.height;
			}
			else if (parent) {
				w = parent.localWidth;
				h = parent.localHeight;
			}
			el = this.getElement();
			if (el) {
				style = el.style;
				s = window.getComputedStyle(el, null);
			}
			wVal = parseFloat(this.width);
			if (wVal === 0 || isNaN(wVal)) {
				if (el) {
					style.width = 'auto';
					this.localWidth = parseFloat(s.getPropertyValue('width'));
				}
			}
			else if ((this.viewport || parent) && my.isa(this.width, 'str') && w) {
				measure = this.width.match(/^-?\d+\.?\d*(\D*)/);
				unit = measure[1];
				if (unit === '%') {
					this.localWidth = ((parseFloat(this.width) / 100) * w) * scale;
				}
				else {
					this.localWidth = parseFloat(this.width) * scale;
				}
			}
			else {
				this.localWidth = parseFloat(this.width) * scale;
			}
			hVal = parseFloat(this.height);
			if (hVal === 0 || isNaN(hVal)) {
				if (el) {
					style.height = 'auto';
					this.localHeight = parseFloat(s.getPropertyValue('height'));
				}
			}
			else if ((this.viewport || parent) && my.isa(this.height, 'str') && h) {
				measure = this.height.match(/^-?\d+\.?\d*(\D*)/);
				unit = measure[1];
				if (unit === '%') {
					this.localHeight = ((parseFloat(this.height) / 100) * h) * scale;
				}
				else {
					this.localHeight = parseFloat(this.height) * scale;
				}
			}
			else {
				this.localHeight = parseFloat(this.height) * scale;
			}
			if (this.viewport) {
				this.setDimensions();
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
				el,
				style;
			el = this.getElement();
			if (el) {
				style = el.style;
				group = my.group[this.group];
				w = (group && group.equalWidth) ? group.currentWidth : this.localWidth;
				h = (group && group.equalHeight) ? group.currentHeight : this.localHeight;
				style.width = w + 'px';
				style.height = h + 'px';
			}
			return this;
		};
		/**
Reinitialize element with existing values
@method domInitialize
@return This
@chainable
**/
		my.PageElement.prototype.domInitialize = function() {
			var start = this.start,
				handle = this.handle,
				d = my.d[this.type];
			this.set({
				startX: start.x || 0,
				startY: start.y || 0,
				handleX: handle.x || 0,
				handleY: handle.y || 0,
				width: this.width || d.width,
				height: this.height || d.height,
				scale: this.scale || 1
			});
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
Alias for makeStack()
@method newStack
@param {Object} items Key:value Object argument for setting attributes
@return Stack object
@private
**/
		my.newStack = function(items) {
			return my.makeStack(items);
		};
		/**
Alias for makeElement()
@method newElement
@param {Object} items Key:value Object argument for setting attributes
@return Element object
@private
**/
		my.newElement = function(items) {
			return my.makeElement(items);
		};
		/**
Alias for makeElementGroup()
@method newElementGroup
@param {Object} items Key:value Object argument for setting attributes
@return ElementGroup object
@private
**/
		my.newElementGroup = function(items) {
			return my.makeElementGroup(items);
		};
		/**
A __factory__ function to generate new Stack objects
@method makeStack
@param {Object} items Key:value Object argument for setting attributes
@return Stack object
@private
**/
		my.makeStack = function(items) {
			return new my.Stack(items);
		};
		/**
A __factory__ function to generate new Element objects
@methodmakewElement
@param {Object} items Key:value Object argument for setting attributes
@return Element object
@private
**/
		my.makeElement = function(items) {
			return new my.Element(items);
		};
		/**
A __factory__ function to generate new ElementGroup objects
@method makeElementGroup
@param {Object} items Key:value Object argument for setting attributes
@return ElementGroup object
@private
**/
		my.makeElementGroup = function(items) {
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
			var c;
			items = my.safeObject(items);
			if (this.lockTo) {
				if (my.xto(items.width, items.height, items.scale)) {
					this.setLocalDimensions();
				}
			}
			if (this.group) {
				c = my.canvas[this.name].style;
				c.margin = '0';
				c.webkitBoxSizing = 'border-box';
				c.mozBoxSizing = 'border-box';
				c.boxSizing = 'border-box';
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
				c,
				cell = my.cell,
				cells = this.cells;
			if (my.xt(cells)) {
				for (i = 0, iz = cells.length; i < iz; i++) {
					c = cell[cells[i]];
					if (this.lockTo && c.name === this.base) {
						c.set({
							width: this.localWidth,
							height: this.localHeight
						});
					}
					if (c.name === this.display) {
						c.set({
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
			var e,
				estart,
				ecurrentstart,
				mystart;
			e = my.element[this.pivot] || my.stack[this.pivot] || my.pad[this.pivot] || false;
			if (e) {
				ecurrentstart = e.currentStart;
				estart = e.start;
				mystart = this.currentStart;
				if (!this.lockX) {
					mystart.x = (estart.x.substring) ? ecurrentstart.x * e.scale : ecurrentstart.x;
				}
				if (!this.lockY) {
					mystart.y = (estart.y.substring) ? ecurrentstart.y * e.scale : ecurrentstart.y;
				}
				return this;
			}
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
			var temp,
				vec = my.makeVector,
				name,
				style,
				get = my.xtGet;
			items = my.safeObject(items);
			if (my.xt(items.stackElement)) {
				items.width = get(items.width, items.stackElement.style.width, my.d.Stack.width);
				items.height = get(items.height, items.stackElement.style.height, my.d.Stack.height);
				items.name = get(items.stackName, items.name, items.stackElement.id, items.stackElement.name, 'Stack');
				my.PageElement.call(this, items);
				if (this.name.match(/~~~/)) {
					this.name = this.name.replace(/~~~/g, '_');
				}
				name = this.name;
				items.stackElement.id = name;
				items.stackElement.style.position = 'relative';
				my.stack[name] = this;
				my.stk[name] = items.stackElement;
				my.pushUnique(my.stacknames, name);
				this.setDisplayOffsets();
				this.setAccessibility(items);
				temp = my.safeObject(items.perspective);
				this.perspective = vec({
					name: this.type + '.' + name + '.perspective',
					x: get(items.perspectiveX, temp.x, 'center'),
					y: get(items.perspectiveY, temp.y, 'center'),
					z: get(items.perspectiveZ, temp.z, 0)
				});
				this.currentPerspective = vec({
					name: this.type + '.' + name + '.current.perspective'
				});
				this.currentPerspective.flag = false;
				this.groups = [name];
				my.makeElementGroup({
					name: name,
					stack: name
				});
				this.group = get(items.group, false);
				if (this.group) {
					my.group[this.group].addElementsToGroup(name);
				}
				this.setStyles(items);
				this.setPerspective();
				this.setTransformOrigin();
				if (this.group) {
					style = my.stk[name].style;
					style.margin = '0';
					style.webkitBoxSizing = 'border-box';
					style.mozBoxSizing = 'border-box';
					style.boxSizing = 'border-box';
					items.stackElement.style.position = 'absolute';
				}
				this.interactive = get(items.interactive, true);
				if (this.interactive) {
					this.addMouseMove();
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
			currentPerspective: {
				x: 0,
				y: 0,
				z: 0
			},
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
				i,
				iz,
				perspective,
				so = my.safeObject,
				get = my.xtGet,
				xt = my.xt,
				xto = my.xto,
				group = my.group,
				stack = my.stack,
				g, e;
			items = so(items);
			my.PageElement.prototype.set.call(this, items);
			g = group[this.name];
			if (xto(items.width, items.height, items.scale, items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
				if (xto(items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
					perspective = this.perspective;
					temp = so(items.perspective);
					perspective.x = get(items.perspectiveX, temp.x, perspective.x);
					perspective.y = get(items.perspectiveY, temp.y, perspective.y);
					perspective.z = get(items.perspectiveZ, temp.z, perspective.z);
					this.currentPerspective.flag = false;
				}
				this.setPerspective();
			}
			if (xto(items.start, items.startX, items.startY, items.width, items.height, items.scale)) {
				if (g) {
					g.setDirtyStarts();
				}
				else {
					this.currentStart = false;
				}
			}
			if (xto(items.handle, items.handleX, items.handleY, items.width, items.height, items.scale)) {
				if (g) {
					g.setDirtyHandles();
				}
				else {
					this.currentHandle = false;
				}
			}
			if (xto(items.width, items.height, items.scale)) {
				if (g) {
					g.updateDimensions();
				}
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
				i,
				iz,
				x, y, z,
				perspective,
				perc = my.addPercentages,
				so = my.safeObject,
				get = my.xtGet,
				xt = my.xt,
				xto = my.xto,
				group = my.group,
				stack = my.stack,
				g, e;
			items = so(items);
			my.PageElement.prototype.setDelta.call(this, items);
			g = group[this.name];
			if (xto(items.width, items.height, items.scale, items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
				if (xto(items.perspective, items.perspectiveX, items.perspectiveY, items.perspectiveZ)) {
					perspective = this.perspective;
					temp = so(items.perspective);
					x = get(items.perspectiveX, temp.x, 0);
					y = get(items.perspectiveY, temp.y, 0);
					perspective.x = (perspective.x.substring) ? perc(perspective.x, x) : perspective.x + x;
					perspective.y = (perspective.y.substring) ? perc(perspective.y, y) : perspective.y + y;
					perspective.z += get(items.perspectiveZ, temp.z, 0);
					this.currentPerspective.flag = false;
				}
				this.setPerspective();
			}
			if (xto(items.start, items.startX, items.startY, items.width, items.height, items.scale)) {
				if (g) {
					g.setDirtyStarts();
				}
				else {
					this.currentStart = false;
				}
			}
			if (xto(items.handle, items.handleX, items.handleY, items.width, items.height, items.scale)) {
				if (g) {
					g.setDirtyHandles();
				}
				else {
					this.currentHandle = false;
				}
			}
			if (xto(items.width, items.height, items.scale)) {
				if (g) {
					g.updateDimensions();
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
				if (parent && this.width.substring && w) {
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
					el.style.height = 'auto';
					this.localHeight = parseFloat(elRes.getPropertyValue('height'));
				}
				else {
					this.localHeight = 0;
				}
			}
			else {
				if (parent && this.height.substring && h) {
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
			if (item.substring) {
				var myElement = my.makeElement({
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
			if (item.substring) {
				myArray = document.getElementsByClassName(item);
				for (i = 0, iz = myArray.length; i < iz; i++) {
					thisElement = myArray[i];
					if (thisElement.nodeName !== 'CANVAS') {
						myElement = my.makeElement({
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
			var group = my.group,
				groups = this.groups;
			for (var i = 0, iz = groups.length; i < iz; i++) {
				group[groups[i]].render();
			}
			return true;
		};
		/**
Reinitialize element with existing values
@method domInit
@return Always true
**/
		my.Stack.prototype.domInit = function() {
			var group = my.group,
				groups = this.groups;
			for (var i = 0, iz = groups.length; i < iz; i++) {
				group[groups[i]].domInit();
			}
			return true;
		};
		/**
Update element 3d transitions, via the Stack's groups
@method update
@return Always true
**/
		my.Stack.prototype.update = function() {
			var group = my.group,
				groups = this.groups;
			for (var i = 0, iz = groups.length; i < iz; i++) {
				group[groups[i]].update();
			}
			return true;
		};
		/**
Calculates the pixels value of the object's perspective attribute
@method setPerspective
@return Set the Stack element's perspective point
**/
		my.Stack.prototype.setPerspective = function() {
			var x, y, sx, sy,
				el,
				perspective = this.perspective,
				current = this.currentPerspective,
				style,
				scale = this.scale,
				result1, result2;
			sx = (perspective.x.substring) ? scale : 1;
			sy = (perspective.y.substring) ? scale : 1;
			if (!current.flag) {
				this.setCurrentPerspective();
			}
			el = this.getElement();
			style = el.style;
			x = current.x * sx;
			y = current.y * sy;
			result1 = x + 'px ' + y + 'px';
			result2 = current.z + 'px';
			style.mozPerspectiveOrigin = result1;
			style.webkitPerspectiveOrigin = result1;
			style.perspectiveOrigin = result1;
			style.mozPerspective = result2;
			style.webkitPerspective = result2;
			style.perspective = result2;
		};
		/**
setPerspective helper function
@method setCurrentPerspective
@return Set the Stack element's perspective point
**/
		my.Stack.prototype.setCurrentPerspective = function() {
			var given = this.perspective,
				current = this.currentPerspective,
				el = (this.group) ? my.stack[my.group[this.group].stack] : this,
				conv = this.numberConvert;
			current.x = (given.x.substring) ? conv(given.x, el.localWidth) : given.x;
			current.y = (given.y.substring) ? conv(given.y, el.localHeight) : given.y;
			current.z = given.z;
			return this;
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
			var get = my.xtGet,
			style;
			items = my.safeObject(items);
			if (my.xt(items.domElement)) {
				items.width = get(items.width, items.domElement.style.width, my.d.Stack.width);
				items.height = get(items.height, items.domElement.style.height, my.d.Stack.height);
				items.name = get(items.elementName, items.name, items.domElement.id, items.domElement.name, 'Element');
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
				this.setStyles(items);
				this.setTransformOrigin();
				if (this.group) {
					style = my.elm[this.name].style;
					style.margin = '0';
					style.webkitBoxSizing = 'border-box';
					style.mozBoxSizing = 'border-box';
					style.boxSizing = 'border-box';
				}
				this.interactive = get(items.interactive, false);
				if (this.interactive) {
					this.addMouseMove();
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

* scrawl.makeElementGroup()

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
			var xt = my.xt,
				get = my.xtGet,
				pu = my.pushUnique;
			items = my.safeObject(items);
			my.Base.call(this, items);
			this.entitys = (xt(items.entitys)) ? [].concat(items.entitys) : [];
			this.elements = (xt(items.elements)) ? [].concat(items.elements) : [];
			this.stack = items.stack || false;
			this.equalWidth = get(items.equalWidth, false);
			this.equalHeight = get(items.equalHeight, false);
			this.currentWidth = 0;
			this.currentHeight = 0;
			if (this.stack) {
				pu(my.stack[this.stack].groups, this.name);
			}
			my.group[this.name] = this;
			pu(my.groupnames, this.name);
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
				stack,
				entity = my.entity,
				entitys = this.entitys;
			stack = my.stack[this.stack];
			for (i = 0, iz = entitys.length; i < iz; i++) {
				//PROBABLY NEED TO amend the varous stamping routines to accommodate using a Stack's data instead of Cell data
				entity[entitys[i]].stamp('none', stack);
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
				i, iz,
				handle,
				elements = this.elements,
				style;
			for (i = 0, iz = elements.length; i < iz; i++) {
				el = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
				if (el.visibility) {
					e = el.getElement();
					handle = el.currentHandle;
					style = e.style;
					switch (el.type) {
						case 'Stack':
							temp = el.getStackDimensions();
							result.width = (temp.width > result.width) ? temp.width : result.width;
							result.height = (temp.height > result.height) ? temp.height : result.height;
							break;
						default:
							temp = parseFloat(style.left) + el.localWidth - handle.x;
							result.width = (temp > result.width) ? temp : result.width;
							temp = parseFloat(style.top) + el.localHeight - handle.y;
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
				el,
				elements = this.elements,
				group = my.group;
			if (this.recalculateDimensions) {
				for (i = 0, iz = elements.length; i < iz; i++) {
					el = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
					el.setLocalDimensions();
				}
				this.recalculateDimensions = false;
			}
			if (this.checkEqualDimensions()) {
				this.currentWidth = 0;
				this.currentHeight = 0;
				for (i = 0, iz = elements.length; i < iz; i++) {
					el = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
					if (el.localWidth > this.currentWidth) {
						this.currentWidth = el.localWidth;
					}
					if (el.localHeight > this.currentHeight) {
						this.currentHeight = el.localHeight;
					}
				}
			}
			for (i = 0, iz = elements.length; i < iz; i++) {
				el = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
				el.renderElement();
				if (el.type === 'Stack') {
					group[el.name].render();
				}
			}
			return this;
		};
		/**
Reinitialize group elements with existing values
@method domInit
@return This
@chainable
**/
		my.ElementGroup.prototype.domInit = function() {
			var i,
				iz,
				el,
				elements = this.elements,
				group = my.group;
			for (i = 0, iz = elements.length; i < iz; i++) {
				el = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
				el.domInitialize();
				if (el.type === 'Stack') {
					group[el.name].domInit();
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
				temp,
				elements = this.elements,
				group = my.group;
			for (i = 0, iz = elements.length; i < iz; i++) {
				temp = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
				temp.update3d(items);
				if (temp.type === 'Stack') {
					group[temp.name].update(items);
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
				iz,
				elements = this.elements,
				pu = my.pushUnique;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
				pu(elements, item[i]);
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
				iz,
				elements = this.elements,
				ri = my.removeItem;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
				ri(elements, item[i]);
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
				iz,
				entitys = this.entitys,
				pu = my.pushUnique;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
				pu(entitys, item[i]);
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
				iz,
				entitys = this.entitys,
				ri = my.removeItem;
			item = (my.xt(item)) ? [].concat(item) : [];
			for (i = 0, iz = item.length; i < iz; i++) {
				ri(entitys, item[i]);
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
				temp,
				elements = this.elements;
			items = my.safeObject(items);
			for (i = 0, iz = elements.length; i < iz; i++) {
				temp = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
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
				iz,
				entitys = this.entitys,
				entity = my.entity;
			items = my.safeObject(items);
			for (i = 0, iz = entitys.length; i < iz; i++) {
				entity[entitys[i]].setDelta(items);
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
				temp,
				elements = this.elements;
			for (i = 0, iz = elements.length; i < iz; i++) {
				temp = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
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
				temp,
				elements = this.elements;
			for (i = 0, iz = elements.length; i < iz; i++) {
				temp = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
				temp.setLocalDimensions();
				temp.setDimensions();
				temp.currentHandle.flag = false;
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
			var entitys = this.entitys,
				entity = my.entity;
			for (var i = 0, iz = entitys.length; i < iz; i++) {
				entity[entitys[i]].set(items);
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
				},
				v = my.v,
				elements = this.elements;
			item = (item.substring) ? item : false;
			if (item) {
				p = my.stack[item] || my.pad[item] || my.element[item] || my.entity[item] || my.point[item] || false;
				if (p) {
					pStart = (p.type === 'Point') ? p.local : p.start;
					for (i = 0, iz = elements.length; i < iz; i++) {
						element = my.stack[elements[i]] || my.pad[elements[i]] || my.element[elements[i]] || false;
						if (element) {
							sv = v.set(element.start);
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
		/**
Augments ElementGroup.set()
@method setDirtyStarts
@return This
@chainable
@private
**/
		my.ElementGroup.prototype.setDirtyStarts = function() {
			var entity = my.entity,
				entitys = this.entitys,
				elements = this.elements,
				stack = my.stack,
				pad = my.pad,
				element = my.element,
				group = my.group,
				e,
				i, iz,
				xt = my.xt;
			for (i = 0, iz = entitys.length; i < iz; i++) {
				e = entity[entitys[i]];
				if (xt(e)) {
					e.currentStart.flag = false;
				}
			}
			for (i = 0, iz = elements.length; i < iz; i++) {
				e = stack[elements[i]] || pad[elements[i]] || element[elements[i]] || false;
				if (e) {
					if (e.type === 'Stack' && group[e.name]) {
						group[e.name].setDirtyStarts();
					}
					e.currentStart.flag = false;
				}
			}
			return this;
		};
		/**
Augments ElementGroup.set()
@method setDirtyHandles
@return This
@chainable
@private
**/
		my.ElementGroup.prototype.setDirtyHandles = function() {
			var entity = my.entity,
				entitys = this.entitys,
				elements = this.elements,
				stack = my.stack,
				pad = my.pad,
				element = my.element,
				group = my.group,
				e,
				i, iz,
				xt = my.xt;
			for (i = 0, iz = entitys.length; i < iz; i++) {
				e = entity[entitys[i]];
				if (xt(e)) {
					e.currentHandle.flag = false;
				}
			}
			for (i = 0, iz = elements.length; i < iz; i++) {
				e = stack[elements[i]] || pad[elements[i]] || element[elements[i]] || false;
				if (e) {
					if (e.type === 'Stack' && group[e.name]) {
						group[e.name].setDirtyHandles();
					}
					e.currentHandle.flag = false;
				}
			}
			return this;
		};

		return my;
	}(scrawl));
}
