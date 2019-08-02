/*
# Core DOM element discovery and management, and the Scrawl-canvas display cycle

Scrawl-canvas breaks down the display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.

The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value
*/

import { isa_canvas, generateUuid, isa_fn, isa_dom, pushUnique, removeItem, xt, defaultNonReturnFunction } from "./utilities.js";
import { artefact, canvas, group, stack, css, xcss } from "./library.js";

import { makeStack } from "../factory/stack.js";
import { makeElement } from "../factory/element.js";
import { makeCanvas } from "../factory/canvas.js";

import { makeAnimation } from "../factory/animation.js";


/*
## Core DOM element discovery and management
*/

/*
Stack artefacts can be nested within each other, and canvas artefacts can also be nested inside a stack. A Display cycle can be triggered on a given Stack or Canvas artefact at any time (but usually as part of an animation loop); as part of that loop a stack artefact will also trigger a Display cycle on any child stacks.

The __rootElements__ array keeps track of all 'root' stack artefacts, and also includes all canvas artefacts, whether they're part of a stack or not.
*/
let rootElements = [],
	rootElements_sorted = [];

let rootElementsSort = true,
	setRootElementsSort = () => {rootElementsSort = true};

const sortRootElements = function () {

	let floor = Math.floor;

	if (rootElementsSort) {

		rootElementsSort = false;

		let buckets = [];

		rootElements.forEach((item) => {

			let art = artefact[item],
				order = (art) ? floor(art.order) : 0;

			if (!buckets[order]) buckets[order] = [];
			
			buckets[order].push(art.name);
		});

		rootElements_sorted = buckets.reduce((a, v) => a.concat(v), []);
	}
};

/*
Create a __stack__ artefact wrapper for a given stack element.
*/
const addInitialStackElement = function (el) {

	let mygroup = el.getAttribute('data-group'),
		myname = el.id || el.getAttribute('name'),
		position = 'absolute';

	if (!mygroup) {

		el.setAttribute('data-group', 'root');
		mygroup = 'root';
		position = 'relative';
	}

	if (!myname) {

		myname = generateUuid();
		el.id = myname;
	}

	let mystack = makeStack({
		name: myname,
		domElement: el,
		group: mygroup,
		host: mygroup,
		position: position,
		setInitialDimensions: true
	});

	processNewStackChildren(el, myname);

	return mystack;
};

/*
Helper function
*/
const processNewStackChildren = function (el, name) {

	let hostDims = el.getBoundingClientRect(),
		y = 0;

	// Only go down one level of hierarchy here; stacks don't do hierarchies, only interested in knowing about immediate child elements
	Array.from(el.children).forEach(child => {
	
		if (child.getAttribute('data-stack') == null && !isa_canvas(child)) {

			let dims = child.getBoundingClientRect(),
				computed = window.getComputedStyle(child);

			let yHeight = parseFloat(computed.marginTop) + parseFloat(computed.borderTopWidth) + parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom) + parseFloat(computed.borderBottomWidth) + parseFloat(computed.marginBottom);

			y = (!y) ? dims.top - hostDims.top : y;

			let args = {
				name: child.id || child.getAttribute('name'),
				domElement: child,
				group: name,
				host: name,
				position: 'absolute',
				width: dims.width,
				height: dims.height,
				startX: dims.left - hostDims.left,
				startY: y,
				classes: (child.className) ? child.className : '',
			};

			y += yHeight + dims.height;

			makeElement(args);
		}

		// no need to worry about processing child stacks - they'll already be in the list of stacks to be processed
		else child.setAttribute('data-group', name);
	});
};

/*
Create a __canvas__ artefact wrapper for a given canvas element.
*/
const addInitialCanvasElement = function (el) {

	let mygroup = el.getAttribute('data-group'),
		myname = el.id || el.getAttribute('name'),
		position = 'absolute';

	if (!mygroup) {

		el.setAttribute('data-group', 'root');
		mygroup = 'root';
		position = el.style.position;
	}

	if (!myname) {

		myname = generateUuid();
		el.id = myname;
	}

	return makeCanvas({
		name: myname,
		domElement: el,
		group: mygroup,
		host: mygroup,
		position: position,
		setInitialDimensions: true
	});
};

/*
Parse the DOM, looking for all elements that have been given a __data-stack__ attribute; then create __Stack__ artefact wrappers for each of them. 

Will also create wrappers for all _direct child elements__ (one level down) within the stack and create appropriate wrappers (Stack, Canvas, Element) for them.

*/
const getStacks = function () {
		
	document.querySelectorAll('[data-stack]').forEach(el => addInitialStackElement(el));
};

/*
Parse the DOM, looking for &lt;canvas> elements; then create __Canvas__ artefact and __Cell__ asset wrappers for each canvas found. Canvas elements do not need to be part of a stack and can appear anywhere in the HTML body.
*/ 
const getCanvases = function () {

	document.querySelectorAll('canvas').forEach((el, index) => {

		let item = addInitialCanvasElement(el);

		if (!index) setCurrentCanvas(item);
	});
};

/*
Use __addStack__ to add a Scrawl-canvas stack element to a web page, or transform an existing element into a stack element. The items argument can include 

* __element__ - the DOM element to be the stack - if not present, will autogenerate a div element
* __host__ - the host element, either as the DOM element itself, or some sort of CSS search string; if not present, will create the stack at the stack element's current place or, failing all else, add the stack to the end of the document body
* __name__ - String identifier for the stack; if not included the function will attempt to use the element's existing id or name attribute or, failing that, generate a random name for the stack.
* any other regular stack attribute
*/
const addStack = function (items = {}) {

	// define variables
	let el, host, hostinscrawl, mystack, mygroup, name,
		position = 'absolute',
		newElement = false;

	// get, or generate a new, stack-to-be element
	if (items.element && items.element.substring) el = document.querySelector(items.element);
	else if (isa_dom(items.element)) el = items.element;
	else {

		newElement = true;
		el = document.createElement('div');
	}

	// get element's host (parent-to-be) element
	if (items.host && items.host.substring) {

		host = document.querySelector(items.host);
		if (!host) host = document.body;
	}
	else if (isa_dom(items.host)) host = items.host;
	else if (xt(el.parentElement)) host = el.parentElement;
	else host = document.body;

	// if dimensions have been set in the argument, apply them to the stack-to-be element
	if (xt(items.width)) el.style.width = (items.width.toFixed) ? `${items.width}px` : items.width;
	if (xt(items.height)) el.style.height = (items.height.toFixed) ? `${items.height}px` : items.height;

	// make sure the stack-to-be element has an id attribute
	name = items.name || el.id || el.getAttribute('name') || '';
	if (!name) name = generateUuid();
	el.id = name;

	// set the 'data-stack' attribute on the stack-to-be element
	el.setAttribute('data-stack', 'data-stack');

	// determine whether the parent element is already known to Scrawl-canvas - affects the stack-to-be element's group 
	if (host && host.getAttribute('data-stack') != null) {

		hostinscrawl = artefact[host.id];

		mygroup = (hostinscrawl) ? hostinscrawl.name : 'root';
	}
	else mygroup = 'root';

	// set the 'data-group' attribute on the stack-to-be element
	el.setAttribute('data-group', mygroup);

	// determine what the stack-to-be element's position style attribute will be
	if (mygroup === 'root') position = 'relative';

	// add (or move) the stack-to-be element to/in the DOM
	if (!el.parentElement || host.id !== el.parentElement.id) host.appendChild(el);

	// create the Scrawl-canvas Stack artefact
	mystack = makeStack({
		name: name,
		domElement: el,
		group: mygroup,
		host: mygroup,
		position: position,
		setInitialDimensions: true
	});

	processNewStackChildren(el, name);

	// in case any of the child elements were already a Scrawl-canvas stack, un-root them (if required)
	Array.from(el.childNodes).forEach(child => {

		if (child.id && rootElements.indexOf(child.id) >= 0) removeItem(rootElements, child.id);
	});

	// set the new Stack's remaining attributes, clearing out any attributes already handled
	delete items.name;
	delete items.element;
	delete items.host;
	delete items.width;
	delete items.height;
	mystack.set(items);

	// tidy up and complete
	rootElementsSort = true;
	return mystack;
};

/*
Use __addCanvas__ to add a Scrawl-canvas canvas element to a web page. The items argument should include 

* __host__ - the host element, either as the DOM element itself, or some sort of CSS search string, or a Scrawl-canvas Stack entity. If no host is supplied, Scrawl-canvas will add the new canvas element to the DOM document body; in all cases, the new canvas element is appended at the end of the host element (or DOM document)
* __name__ - String identifier for the element; will generate a random name for the canvas if no name is supplied.
* any other regular Scrawl-canvas Canvas artefact attribute

By default, Scrawl-canvas will setup the new Canvas as the 'current canvas', and will add mouse/pointer tracking functionality to it. If no dimensions are supplied then the Canvas will default to 300px wide and 150px high.
*/
const addCanvas = function (items = {}) {

	let el = document.createElement('canvas'),
		myname = (items.name) ? items.name : generateUuid(),
		host = items.host,
		mygroup = 'root',
		width = items.width || 300,
		height = items.height || 150,
		position = 'relative';

	if (host.substring) {

		let temphost = artefact[host];

		if (!temphost && host) host = document.querySelector(host);
		else host = temphost;
	}

	if (host) {

		if (host.type === 'Stack') {

			mygroup = host.name;
			position = 'absolute';
			host = host.domElement;
		}
		else if (!isa_dom(host)) host = document.body;
	}
	else host = document.body;

	el.id = myname;
	el.setAttribute('data-group', mygroup);
	el.width = width;
	el.height = height;
	el.style.position = position;

	host.appendChild(el);

	let mycanvas = makeCanvas({
		name: myname,
		domElement: el,
		group: mygroup,
		host: mygroup,
		position: position,
		setInitialDimensions: false,
		setAsCurrentCanvas: (xt(items.setAsCurrentCanvas)) ? items.setAsCurrentCanvas : true,
		trackHere: (xt(items.trackHere)) ? items.trackHere : true,
	});

	delete items.group;
	delete items.host;
	delete items.name;
	delete items.element;
	delete items.position;
	delete items.setInitialDimensions;
	delete items.setAsCurrentCanvas;
	delete items.trackHere;

	mycanvas.set(items);

	return mycanvas;
};

/*
Scrawl-canvas expects one canvas element (if any canvases are present) to act as the 'current' canvas on which other factory functions - such as adding new entitys - can act. The current canvas can be changed at any time using __scrawl.setCurrentCanvas__

Note: need to write a demo to test this functionality
*/
let currentCanvas = null,
	currentGroup = null;

const setCurrentCanvas = function (item) {

	let changeFlag = false;

	if (item) {

		if (item.substring) {

			let mycanvas = canvas[item];

			if (mycanvas) {
				currentCanvas = mycanvas;
				changeFlag = true;	
			}
		}
		else if (item.type === 'Canvas') {

			currentCanvas = item;	
			changeFlag = true;	
		} 
	}

	if (changeFlag && currentCanvas.base) {

		let mygroup = group[currentCanvas.base.name];

		if (mygroup) currentGroup = mygroup;
	}
};

/*
## Scrawl-canvas user interaction listeners
Each scrawl-canvas stack and canvas can have bespoke Scrawl-canvas listeners attached to them, to track user mouse and touch interactions with that element. Scrawl-canvas defines five bespoke listeners:

* __move__ - track mouse cursor and touch movements across the DOM element
* __down__ - register a new touch interaction, or user pressing the left mouse button
* __up__ - register the end of a touch interaction, or user releasing the left mouse button
* __enter__ - trigger an event when the mouse cursor or touch event enters into the DOM element
* __leave__ - trigger an event when the mouse cursor or touch event exits from the DOM element

The functions all takes the following arguments:

* __evt__ - String name of the event ('move', 'down', 'up', 'enter', 'leave'), or an array of such strings
* __fn__ - the function to be called when the event listener(s) trigger
* __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String; these elements need to be registered in the Scrawl-canvas library beforehend (done automatically for stack and canvas elements)

Returns a kill function which, when invoked (no arguments required), will remove the event listener(s) from all DOM elements to which they have been attached.
*/
const addListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document addListener() error - no function supplied: ${evt}, ${targ}`);

	actionListener(evt, fn, targ, 'removeEventListener');
	actionListener(evt, fn, targ, 'addEventListener');

	return function () {

		removeListener(evt, fn, targ);
	};
};

/*
The counterpart to 'addListener' is __removeListener__ which removes Scrawl-canvas event listeners from DOM elements in a similar way
*/ 
const removeListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document removeListener() error - no function supplied: ${evt}, ${targ}`);

	actionListener(evt, fn, targ, 'removeEventListener');
};

/*
Because devices and browsers differ in their approach to user interaction (mouse vs pointer vs touch), the actual functionality for adding and removing the event listeners associated with each approach is handled by dedicated actionXXXListener functions

TODO: code up the functionality to manage touch events
*/
const actionListener = function (evt, fn, targ, action) {

	let events = [].concat(evt),
		targets;
	
	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	if (navigator.pointerEnabled || navigator.msPointerEnabled) actionPointerListener(events, fn, targets, action);
	else actionMouseListener(events, fn, targets, action);
};

const actionMouseListener = function (events, fn, targets, action) {

	events.forEach(myevent => {

		targets.forEach(target => {

			if (!isa_dom(target)) throw new Error(`core/document actionMouseListener() error - bad target: ${myevent}, ${target}`);

			switch (myevent) {
			
				case 'move':
					target[action]('mousemove', fn, false);
					target[action]('touchmove', fn, false);
					target[action]('touchfollow', fn, false);
					break;

				case 'up':
					target[action]('mouseup', fn, false);
					target[action]('touchend', fn, false);
					break;

				case 'down':
					target[action]('mousedown', fn, false);
					target[action]('touchstart', fn, false);
					break;

				case 'leave':
					target[action]('mouseleave', fn, false);
					target[action]('touchleave', fn, false);
					break;

				case 'enter':
					target[action]('mouseenter', fn, false);
					target[action]('touchenter', fn, false);
					break;
			}
		});
	});
};

const actionPointerListener = function (events, fn, targets, action) {

	events.forEach(myevent => {

		targets.forEach(target => {

			if (!isa_dom(target)) throw new Error(`core/document actionPointerListener() error - bad target: ${myevent}, ${target}`);

			switch (myevent) {
			
				case 'move':
					target[action]('pointermove', fn, false);
					break;

				case 'up':
					target[action]('pointerup', fn, false);
					break;

				case 'down':
					target[action]('pointerdown', fn, false);
					break;

				case 'leave':
					target[action]('pointerleave', fn, false);
					break;

				case 'enter':
					target[action]('pointerenter', fn, false);
					break;
			}
		});
	});
};

/*
Any event listener can be added to a Scrawl-canvas stack or canvas DOM element. The __addNativeListener__ makes adding and removing these 'native' listeners a little easier: multiple event listeners (which all trigger the same function) can be added to multiple DOM elements (that have been registered in the Scrawl-canvas library) in a single function call.

The function requires three arguments:

* __evt__ - String name of the event ('click', 'input', 'change', etc), or an array of such strings
* __fn__ - the function to be called when the event listener(s) trigger
* __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String

Returns a kill function which, when invoked (no arguments required), will remove the event listener(s) from all DOM elements to which they have been attached.
*/
const addNativeListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document addNativeListener() error - no function supplied: ${evt}, ${targ}`);

	actionNativeListener(evt, fn, targ, 'removeEventListener');
	actionNativeListener(evt, fn, targ, 'addEventListener');

	return function () {

		removeNativeListener(evt, fn, targ);
	};
};

/*
The counterpart to 'addNativeListener' is __removeNativeListener__ which removes event listeners from DOM elements in a similar way
*/ 
const removeNativeListener = function (evt, fn, targ) {

	if (!isa_fn(fn)) throw new Error(`core/document removeNativeListener() error - no function supplied: ${evt}, ${targ}`);

	actionNativeListener(evt, fn, targ, 'removeEventListener');
};

const actionNativeListener = function (evt, fn, targ, action) {

	let events = [].concat(evt),
		targets;

	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	events.forEach(myevent => {

		targets.forEach(target => {

			if (!isa_dom(target)) throw new Error(`core/document actionNativeListener() error - bad target: ${myevent}, ${target}`);

			target[action](myevent, fn, false);
		});
	});
};

/*
## Scrawl-canvas display cycle

Scrawl-canvas breaks down the Display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.

The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value

Each display cycle function returns a Promise object which will resolve as true if the function completes successfully; false otherwise. These promises will never reject

Note that Scrawl-canvas supplies a convenience function - __makeRender()__ - for automating the process of creating an animation object to handle the Display cycle
*/

/*
### Clear

* For canvas artefacts, clear its Cell assets' display (reset all pixels to 0, or the designated background color) ready for them to be redrawn
* For stack artefacts - no action required
*/
const clear = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('clear');
};

/*
### Compile

* For both canvas and stack artefacts, perform necessary entity/element positional calculations
* Additionally for canvas artefacts, stamp associated entitys onto the canvas's constituent cell assets
*/
const compile = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('compile');
};

/*
### Show

* For canvas artefacts, stamp additional 'layer' canvases onto the base canvas, then copy the base canvas onto the display canvas
* For stack artefacts - invoke the __domShow__ function, if any of its constituent elements require DOM-related updating
*/
const show = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('show');
};

/*
### Render

* Orchestrate the clear, compile and show actions on each stack and canvas DOM element
*/
const render = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('render');
};

/*
Helper functions coordinate the actions required to complete a display cycle
*/
const displayCycleHelper = function (items) {

	if (items.length) rootElements_sorted = items;
	else if (rootElementsSort) sortRootElements();
};

const displayCycleBatchProcess = function (method) {

	return new Promise((resolve, reject) => {

		let promises = [];

		rootElements_sorted.forEach((name) => {

			let item = artefact[name];

			if (item && item[method]) promises.push(item[method]());
		})

		Promise.all(promises)
		.then(() => resolve(true))
		.catch((err) => reject(false));
	})
};

/*
### makeRender

Generate an animation object which will run a clear/compile/show display ccycle on an renderable artefact such as a Stack or Canvas.

We can also add in user-composed __display cycle hook functions__ which will run at appropriate places in the display cycle. These hooks are:

* commence
* afterClear
* afterCompile
* afterShow
* error

Returns the Animation object, through which the render functionality can be halted, resumed, and/or killed
*/
const makeRender = function (items = {}) {

	if (!items) return false;

	let target;

	if (!items.target) target = {
		clear: clear,
		compile: compile,
		show: show
	};
	else target = (items.target.substring) ? artefact[items.target] : items.target;

	if (!target.clear || !target.compile || !target.show) return false;

	let commence = (isa_fn(items.commence)) ? items.commence : defaultNonReturnFunction,
		afterClear = (isa_fn(items.afterClear)) ? items.afterClear : defaultNonReturnFunction,
		afterCompile = (isa_fn(items.afterCompile)) ? items.afterCompile : defaultNonReturnFunction,
		afterShow = (isa_fn(items.afterShow)) ? items.afterShow : defaultNonReturnFunction,
		error = (isa_fn(items.error)) ? items.error : defaultNonReturnFunction;

	return makeAnimation({

		name: items.name || '',
		order: items.order || 1,
		
		fn: function() {
			
			return new Promise((resolve, reject) => {

				Promise.resolve(commence())
				.then(() => target.clear())
				.then(() => Promise.resolve(afterClear()))
				.then(() => target.compile())
				.then(() => Promise.resolve(afterCompile()))
				.then(() => target.show())
				.then(() => Promise.resolve(afterShow()))
				.then(() => resolve(true))
				.catch(err => {

					error(err);
					reject(err);
				});
			});
		},
	});
};

/*
Scrawl-canvas batch process all DOM element updates, to minimize disruptive impacts on web page performance. We don't maintain a full/comprehensive 'shadow' or 'virtual' DOM, but Scrawl-canvas does maintain a record of element (absolute) position and dimension data, alongside details of scaling, perspective and any other CSS related data (including CSS classes) which we tell it about, on a per-element basis.

The decision on whether to update a DOM element is mediated through a suite of 'dirty' flags assigned on the Scrawl-canvas artefact object which wraps each DOM element. As part of the compile component of the Scrawl-canvas Display cycle, the code will take a decision on whether the DOM element needs to be updated and insert the artefact's name in the __domShowElements__ array, and set the __domShowRequired__ flag to true, which will then trigger the __domShow()__ function to run at the end of each Display cycle.

The domShow() function is exported, and can be triggered for any DOM-related artefact at any time by invoking it with the artefact's name as the function's argument.

The order in which DOM elements get updated is determined by the __order__ attributes set on the Stack artefact, on Group objects, and (least important) on the element artefact.
*/
const domShowElements = [];
const addDomShowElement = function (item = '') {

	if (!item) throw new Error(`core/document addDomShowElement() error - false argument supplied: ${item}`);
	if (!item.substring) throw new Error(`core/document addDomShowElement() error - argument not a string: ${item}`);

	pushUnique(domShowElements, item);
};

let domShowRequired = false;
const setDomShowRequired = function (val = true) {

	domShowRequired = val;
};

const domShow = function (singleArtefact = '') {

	if (domShowRequired || singleArtefact) {

		let myartefacts;

		if (singleArtefact) myartefacts = [singleArtefact];
		else {

			domShowRequired = false;
			myartefacts = [].concat(domShowElements);
			domShowElements.length = 0;
		}

		// given the critical nature of these loops, using 'for' instead of 'forEach'
		let i, iz, name, art, el, style,
			p, dims, w, h,
			j, jz, items, keys, key, keyName, value;

		for (i = 0, iz = myartefacts.length; i < iz; i++) {

			name = myartefacts[i];

			art = artefact[name];
			if (!art) throw new Error(`core/document domShow() error - artefact missing: ${name}`);

			el = art.domElement;
			if (!el) throw new Error(`core/document domShow() error - DOM element missing: ${name}`);

			style = el.style;

			// update perspective
			if (art.dirtyPerspective) {

				art.dirtyPerspective = false;

				p = art.perspective;

				style.perspectiveOrigin = `${p.x} ${p.y}`;
				style.perspective = `${p.z}px`;
			}

			// update position
			if (art.dirtyPosition) {

				art.dirtyPosition = false;
				style.position = art.position;
			}

			// update dimensions
			if (art.dirtyDomDimensions) {

				art.dirtyDomDimensions = false;

				dims = art.currentDimensions;
				w = dims[0];
				h = dims[1];

				if (art.type === 'Canvas') {

					el.width = w;
					el.height = h;
				}
				else {

					style.width = `${w}px`;
					style.height = (h) ? `${h}px` : 'auto';
				}
			}

			// update handle/transformOrigin
			if (art.dirtyTransformOrigin) {

				art.dirtyTransformOrigin = false;
				style.transformOrigin = art.currentTransformOriginString;
			}

			// update transform
			if (art.dirtyTransform) {

				art.dirtyTransform = false;
				style.transform = art.currentTransformString;
			}

			// update visibility
			if (art.dirtyVisibility) {

				art.dirtyVisibility = false;
				style.display = (art.visibility) ? 'block' : 'none';
			}

			// update other CSS changes
			if (art.dirtyCss) {

				art.dirtyCss = false;

				items = art.css || {};
				keys = Object.keys(items);

				for (j = 0, jz = keys.length; j < jz; j++) {

					key = keys[j];
					value = items[key];

					if (xcss.has(key)) {

						keyName = `${key[0].toUpperCase}${key.substr(1)}`;

						style[`webkit${keyName}`] = value;
						style[`moz${keyName}`] = value;
						style[`ms${keyName}`] = value;
						style[`o${keyName}`] = value;
						style[key] = value;
					}
					else if (css.has(key)) style[key] = value;
				}
			}

			// update element classes
			if (art.dirtyClasses) {

				art.dirtyClasses = false;
				el.className = art.classes;
			}
		}
	}
};

/*
Holding area - mainly for ARIA content, but also used by Phrase entity for font height calculations
*/
let scrawlCanvasHold = document.createElement('div');
scrawlCanvasHold.style.padding = 0;
scrawlCanvasHold.style.border = 0;
scrawlCanvasHold.style.margin = 0;
scrawlCanvasHold.style.width = '4500px';
scrawlCanvasHold.style.boxSizing = 'border-box';
scrawlCanvasHold.style.position = 'absolute';
scrawlCanvasHold.style.top = '-5000px';
scrawlCanvasHold.style.left = '-5000px';
document.body.appendChild(scrawlCanvasHold);

/*
Navigation area - canvas anchor links
*/
let scrawlNavigationHold = document.createElement('nav');
scrawlNavigationHold.style.position = 'absolute';
scrawlNavigationHold.style.top = '-5000px';
scrawlNavigationHold.style.left = '-5000px';
document.body.prepend(scrawlNavigationHold);

export {
	getCanvases,
	getStacks,

	addCanvas,
	addStack,
	setCurrentCanvas,

	currentCanvas,
	currentGroup,

	rootElements,
	setRootElementsSort,

	addListener,
	removeListener,
	addNativeListener,
	removeNativeListener,

	clear,
	compile,
	show,
	render,

	makeRender,

	addDomShowElement,
	setDomShowRequired,
	domShow,

	scrawlCanvasHold,
	scrawlNavigationHold,
};
