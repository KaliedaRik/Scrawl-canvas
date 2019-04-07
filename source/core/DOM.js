/*
# Core DOM element discovery and management, and the Scrawl-canvas display cycle

Scrawl-canvas breaks down the display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.

The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value
*/

import { isa_canvas, generateUuid, isa_fn, isa_dom, isa_str, pushUnique, removeItem, xt } from "./utilities.js";
import { artefact, canvas, group, stack, css, xcss } from "./library.js";

import { makeStack } from "../factory/stack.js";
import { makeElement } from "../factory/element.js";
import { makeCanvas } from "../factory/canvas.js";

/*
## Core DOM element discovery and management
*/
let rootElements = [],
	interimBatches = [],
	rootElementBatches = [];

let rootElementsSort = true,
	setRootElementsSort = () => {rootElementsSort = true};

const sortRootElements = function () {

	let floor = Math.floor;

	if (rootElementsSort) {

		rootElementsSort = false;
		interimBatches.length = 0;

		rootElements.forEach((item) => {

			let art = artefact[item],
				order = (art) ? floor(art.order) : 0;

			if (!interimBatches[order]) interimBatches[order] = [];
			
			interimBatches[order].push(art.name);
		});

		rootElementBatches = interimBatches.reduce((a, v) => a.concat(v), []);
	}
};

/*

*/
const addInitialStackElement = function (element) {

	let mygroup = element.getAttribute('data-group');

	let mystack = makeStack({
		name: element.id || element.getAttribute('name'),
		domElement: element,
		group: (mygroup) ? mygroup : ''
	});

	[...element.children].forEach((child) => {
	
		if (child.getAttribute('data-stack') == null && !isa_canvas(child)) {

			makeElement({
				name: child.id || child.getAttribute('name'),
				domElement: child,
				group: mystack.name
			});
		}
		else child.setAttribute('data-group', mystack.name);
	});

	return mystack;
};

/*
create __canvas__ wrappers and controllers for a given canvas element.
*/
const addInitialCanvasElement = function (element) {

	let mygroup = element.getAttribute('data-group');

	return makeCanvas({
		name: element.id || element.getAttribute('name'),
		domElement: element,
		group: (mygroup) ? mygroup : ''
	});
};

/*

*/
const getStacks = function () {
		
	document.querySelectorAll('[data-stack]').forEach((element) => addInitialStackElement(element));
};

/*
Parse the DOM, looking for &lt;canvas> elements; then create __cell__ wrappers and __pad__ controllers for each canvas found. Canvas elements do not need to be part of a stack and can appear anywhere in the HTML body.
*/ 
const getCanvases = function () {

	document.querySelectorAll('canvas').forEach((element, index) => {

		let item = addInitialCanvasElement(element);

		if (!index) setCurrentCanvas(item);
	});
};

/*
Programmatically add Scrawl-canvas stack and canvas elements to the DOM document

TODO - add a canvas element to the DOM document programmatically
*/
const addCanvas = function (items = {}) {

	// will need to automatically set the new canvas as the currentCanvas and currentGroup
	// to maintain previous functionality
	return true;
};

/*
Scrawl-canvas expects one canvas element (if any canvases are present) to act as the 'current' canvas on which other factory functions - such as adding new entitys - can act. The current canvas can be changed at any time using __scrawl.setCurrentCanvas__
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
Use __addStack__ to add a Scrawl-canvas stack element to a web page, or transform an existing element into a stack element
items object should include 

* __element__ - the DOM element to be the stack - if not present, will autogenerate a div element
* __host__ - the host element, either as the DOM element itself, or some sort of CSS search string; if not present, will create the stack at the stack element's current place or, failing all else, add the stack to the end of the document body
* __name__ - String identifier for the stack; if not included the function will attempt to use the element's existing id or name attribute or, failing that, generate a random name for the stack.
* any other regular stack attribute
*/
const addStack = function (items = {}) {

	let el, host, mystack, name;

	if (isa_str(items.element)) items.element = document.querySelector(items.element);

	if (isa_dom(items.element)) {

		el = items.element;
		host = (xt(items.host)) ? items.host : el.parentElement;
	}
	else {

		el = document.createElement('div');
		host = (xt(items.host)) ? items.host : document.body;
	}

	if (isa_str(host)) host = document.querySelector(host);

	name = items.name || el.id || el.getAttribute('name') || '';

	if (!name) name = generateUuid();

	el.id = name;

	el.setAttribute('data-stack', true);

	if (host.getAttribute('data-stack') != null) {

		let hostInScrawl = stack[host.id];

		if (hostInScrawl) el.setAttribute('data-group', hostInScrawl.name);
	}

	mystack = addInitialStackElement(el);

	if (rootElements.indexOf(host.id) < 0) pushUnique(rootElements, mystack.name);
	else removeItem(rootElements, mystack.name);

	if (!el.parentElement || host.id !== el.parentElement.id) host.appendChild(el);

	[...el.childNodes].forEach((child) => {

		if (child.id && rootElements.indexOf(child.id) >= 0) removeItem(rootElements, child.id);
	});

	rootElementsSort = true;
	return mystack;
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
*/
const addListener = function (evt, fn, targ) {

	if (isa_fn(fn)) {

		actionListener(evt, fn, targ, 'removeEventListener');
		actionListener(evt, fn, targ, 'addEventListener');
	}
};

/*
The counterpart to 'addListener' is __removeListener__ which removes Scrawl-canvas event listeners from DOM elements in a similar way
*/ 
const removeListener = function (evt, fn, targ) {

	if (isa_fn(fn)) actionListener(evt, fn, targ, 'removeEventListener');
};

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

	events.forEach((myevent) => {

		targets.forEach((target) => {

			if (isa_dom(target)) {

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
			}
		});
	});
};

const actionPointerListener = function (events, fn, targets, action) {

	events.forEach((myevent) => {

		targets.forEach((target) => {

			if (isa_dom(target)) {

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
*/
const addNativeListener = function (evt, fn, targ) {

	if (isa_fn(fn)) {

		actionNativeListener(evt, fn, targ, 'removeEventListener');
		actionNativeListener(evt, fn, targ, 'addEventListener');
	}
};

/*
The counterpart to 'addNativeListener' is __removeNativeListener__ which removes event listeners from DOM elements in a similar way
*/ 
const removeNativeListener = function (evt, fn, targ) {

	if (isa_fn(fn)) actionNativeListener(evt, fn, targ, 'removeEventListener');
};

const actionNativeListener = function (evt, fn, targ, action) {

	let events = [].concat(evt),
		targets;

	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	events.forEach((myevent) => {

		targets.forEach((target) => {

			if (isa_dom(target)) target[action](myevent, fn, false);
		});
	});
};

/*
## Scrawl-canvas display cycle

Scrawl-canvas breaks down the display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.

The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value

Each display cycle function returns a Promise object which will resolve as true if the function completes successfully; false otherwise. These promises will never reject
*/

/*
### Clear

* for a canvas, clear its display (reset all pixels to 0, or the designated background color) ready for it to be redrawn
* for a stack element - no action required
*/
const clear = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('clear');
};

/*
### Compile

* for both canvas and stack elements, perform necessary entity/element positional calculations
* for a canvas, stamp associated entitys onto the canvas
*/
const compile = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('compile');
};

/*
### Show

* stamp additional 'layer' canvases onto the base canvas, then copy the base canvas onto the display canvas
* for a stack element - no action required
*/
const show = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('show');
};

/*
### Render

* orchestrate the clear, compile and show actions on each stack and canvas DOM element
*/
const render = function (...items) {

	displayCycleHelper(items);
	return displayCycleBatchProcess('render');
};

/*
Helper functions coordinate the actions required to complete a display cycle
*/
const displayCycleHelper = function (items) {

	if (items.length) rootElementBatches = items;
	else if (rootElementsSort) sortRootElements();
};

/*

*/
const displayCycleBatchProcess = function (method) {

	return new Promise((resolve) => {

		let promises = [];

		rootElementBatches.forEach((name) => {

			let item = artefact[name];

			if (item && item[method]) promises.push(item[method]());
		})

		Promise.all(promises)
		.then(() => resolve(true))
		.catch((err) => resolve(false));
	})
};

/*

*/
const domShowElements = [];
const addDomShowElement = function (item = '') {

	if (item && item.substring) pushUnique(domShowElements, item);
};

let domShowRequired = false;
const setDomShowRequired = function (val = true) {

	domShowRequired = val;
};

const domShow = function () {

	if (domShowRequired) {

		domShowRequired = false;
		
		let myartefacts = [].concat(domShowElements);
		domShowElements.length = 0;

		myartefacts.forEach((name) => {

			let art = artefact[name];

			if (art) {

				let el = art.domElement;

				if (el) {

					let style = el.style;

					// update perspective
					if (art.dirtyPerspective) {

						art.dirtyPerspective = false;

						let p = art.perspective,
							perspective = `${p.z}px`,
							origin = `${p.x} ${p.y}`;

						style.webkitPerspectiveOrigin = origin;
						style.mozPerspectiveOrigin = origin;
						style.perspectiveOrigin = origin;

						style.webkitPerspective = perspective;
						style.mozPerspective = perspective;
						style.perspective = perspective;
					}

					// update position
					if (art.dirtyPosition) {

						art.dirtyPosition = false;
						style.position = art.position;
					}

					// update dimensions
					if (art.dirtyDimensions) {

						art.dirtyDimensions = false;

						if (art.type === 'Canvas') {

							el.width = art.localWidth;
							el.height = art.localHeight;
						}
						else {

							style.width = `${art.localWidth}px`;
							style.height = (art.localHeight) ? `${art.localHeight}px` : 'auto';
						}
					}

					// update handle/transformOrigin
					if (art.dirtyHandle) {

						art.dirtyHandle = false;
						style.transformOrigin = art.transformOrigin;
					}

					// update transform
					if (art.dirtyTransform) {

						art.dirtyTransform = false;
						style.transform = art.currentTransform;
					}

					// update visibility
					if (art.dirtyVisibility) {

						art.dirtyVisibility = false;
						style.display = (art.visibility) ? 'block' : 'none';
					}

					// update other CSS changes
					if (art.dirtyCss) {

						art.dirtyCss = false;

						let items = art.css || {};

						Object.entries(items).forEach(([key, value]) => {

							if (xcss.has(key)) {

								let keyName = `${key[0].toUpperCase}${key.substr(1)}`;

								style[`webkit${keyName}`] = value;
								style[`moz${keyName}`] = value;
								style[`ms${keyName}`] = value;
								style[`o${keyName}`] = value;
								style[key] = value;
							}
							else if (css.has(key)) style[key] = value;
						});
					}
				}
			}
		});
	}
}

/*
Used by Scrawl-canvas worker functionality to locate worker-related javascript files on the server
*/
const setScrawlPath = function (url) {

	window.scrawlPath = url;
};

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

	addDomShowElement,
	setDomShowRequired,
	domShow,

	setScrawlPath,
};
