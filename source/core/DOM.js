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
const rootElements = [];
const rootElementBatches = [];
const interimBatches = [];

let rootElementsSort = true;
const setRootElementsSort = function () {
	rootElementsSort = true;
};

/*

*/
const sortRootElements = function () {

	let i, iz, order, item,
		floor = Math.floor;

	if (rootElementsSort) {

		rootElementsSort = false;
		interimBatches.length = 0;

		for (i = 0, iz = rootElements.length; i < iz; i++) {

			item = artefact[rootElements[i]] || {};
			order = floor(item.order) || 0;

			if (!interimBatches[order]) interimBatches[order] = [];
			
			interimBatches[order].push(item.name);
		}

		rootElementBatches.length = 0;

		for (i = 0, iz = interimBatches.length; i < iz; i++) {

			if (interimBatches[i].length) rootElementBatches.push(interimBatches[i]);
		}
	}
};

/*

*/
const addInitialStackElement = function (s) {

	let j, jz, e, g, stk;

	g = s.getAttribute('data-group');

	stk = makeStack({

		name: s.id || s.getAttribute('name'),
		domElement: s,
		group: (g) ? g : ''
	});

	for (j = 0, jz = s.children.length; j < jz; j++) {

		e = s.children[j];

		if (e.getAttribute('data-stack') == null && !isa_canvas(e)) {

			makeElement({

				name: e.id || e.getAttribute('name'),
				domElement: e,
				group: stk.name
			});
		}
		else e.setAttribute('data-group', stk.name);
	}
	return stk;
};

/*
create __canvas__ wrappers and controllers for a given canvas element.
*/
const addInitialCanvasElement = function (s) {

	let g, myCanvas;

	g = s.getAttribute('data-group');

	myCanvas = makeCanvas({

		name: s.id || s.getAttribute('name'),
		domElement: s,
		group: (g) ? g : ''
	});

	return myCanvas;
};

/*
Parse the DOM, looking for stack elements; then create __stack__ wrappers for each one found.
*/ 
const getStacks = function () {

	let stacksList, i, iz;

	stacksList = document.querySelectorAll('[data-stack]');
		
	for (i = 0, iz = stacksList.length; i < iz; i++) {

		addInitialStackElement(stacksList[i]);
	}
};

/*
Parse the DOM, looking for &lt;canvas> elements; then create __cell__ wrappers and __pad__ controllers for each canvas found. Canvas elements do not need to be part of a stack and can appear anywhere in the HTML body.
*/ 
const getCanvases = function () {

	let canvasList, i, iz, item;

	canvasList = document.querySelectorAll('canvas');
		
	for (i = 0, iz = canvasList.length; i < iz; i++) {

		item = addInitialCanvasElement(canvasList[i]);

		// we set the FIRST discovered canvas to be the current canvas and group
		if(i === 0) setCurrentCanvas(item);
	}
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

	let temp,
		changeFlag = false;

	if (item) {
		if (item.substring) {

			temp = canvas[item]

			if (temp) {
				currentCanvas = temp;
				changeFlag = true;	
			}
		}
		else if (item.type === 'Canvas') {

			currentCanvas = item;	
			changeFlag = true;	
		} 
	}

	if (changeFlag && currentCanvas.base) {

		temp = group[currentCanvas.base.name];

		if (temp) currentGroup = temp;
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

	let el, host, hostInScrawl, stk, name, i, iz, children, item;

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

		hostInScrawl = stack[host.id];

		if (hostInScrawl) el.setAttribute('data-group', hostInScrawl.name);
	}

	stk = addInitialStackElement(el);

	if (rootElements.indexOf(host.id) < 0) pushUnique(rootElements, stk.name);
	else removeItem(rootElements, stk.name);

	if (!el.parentElement || host.id !== el.parentElement.id) host.appendChild(el);

	children = el.childNodes;

	for (i = 0, iz = children.length; i < iz; i++) {

		item = children[i];

		if (item.id && rootElements.indexOf(item.id) >= 0) removeItem(rootElements, item.id);
	}

	rootElementsSort = true;
	return stk;
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

	let targets, i, iz, j, jz, nav;

	removeListener(evt, fn, targ);

	nav = (navigator.pointerEnabled || navigator.msPointerEnabled) ? true : false;
	
	evt = [].concat(evt);
	
	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	if (isa_fn(fn)) {

		for (j = 0, jz = evt.length; j < jz; j++) {

			for (i = 0, iz = targets.length; i < iz; i++) {

				if (isa_dom(targets[i])) {

					switch (evt[j]) {
					
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

						case 'up':

							if (nav) {

								targets[i].addEventListener('pointerup', fn, false);
							}
							else {

								targets[i].addEventListener('mouseup', fn, false);
								targets[i].addEventListener('touchend', fn, false);
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

						case 'leave':

							if (nav) {

								targets[i].addEventListener('pointerleave', fn, false);
							}
							else {

								targets[i].addEventListener('mouseleave', fn, false);
								targets[i].addEventListener('touchleave', fn, false);
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
					}
				}
			}
		}
	}
	return true;
};

/*
The counterpart to 'addListener' is __removeListener__ which removes event listeners from DOM elements in a similar way
*/ 
const removeListener = function (evt, fn, targ) {

	let targets, i, iz, j, jz, nav;

	evt = [].concat(evt);
	
	nav = (navigator.pointerEnabled || navigator.msPointerEnabled) ? true : false;
	
	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	if (isa_fn(fn)) {

		for (j = 0, jz = evt.length; j < jz; j++) {

			for (i = 0, iz = targets.length; i < iz; i++) {

				if (isa_dom(targets[i])) {

					switch (evt[j]) {

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

						case 'up':

							if (nav) {
								targets[i].removeEventListener('pointerup', fn, false);
							}
							else {

								targets[i].removeEventListener('mouseup', fn, false);
								targets[i].removeEventListener('touchend', fn, false);
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

						case 'leave':

							if (nav) {

								targets[i].removeEventListener('pointerleave', fn, false);
							}
							else {

								targets[i].removeEventListener('mouseleave', fn, false);
								targets[i].removeEventListener('touchleave', fn, false);
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
					}
				}
			}
		}
	}
	return true;
};

/*
Any event listener can be added to a scrawl-canvas stack or canvas DOM element. The __addNativeListener__ makes adding and removing these 'native' listeners a little easier: multiple event listeners (which all trigger the same function) can be added to multiple DOM elements (that have been registered in the Scrawl-canvas library) in a single function call.
The function requires three arguments:

* __evt__ - the event listener object, or an array of event listener objects
* __fn__ - the function to be called when the event listener(s) trigger
* __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String
*/
const addNativeListener = function (evt, fn, targ) {

	let targets, i, iz, j, jz;

	removeNativeListener(evt, fn, targ);

	evt = [].concat(evt);

	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	if (isa_fn(fn)) {

		for (j = 0, jz = evt.length; j < jz; j++) {

			for (i = 0, iz = targets.length; i < iz; i++) {

				targets[i].addEventListener(evt[j], fn, false);
			}
		}
	}
};

/*
The counterpart to 'addNativeListener' is __removeNativeListener__ which removes event listeners from DOM elements in a similar way
*/ 
const removeNativeListener = function (evt, fn, targ) {

	let targets, i, iz, j, jz;

	evt = [].concat(evt);

	if (targ.substring) targets = document.body.querySelectorAll(targ);
	else if (Array.isArray(targ)) targets = targ;
	else targets = [targ];

	if (isa_fn(fn)) {

		for (j = 0, jz = evt.length; j < jz; j++) {

			for (i = 0, iz = targets.length; i < iz; i++) {

				targets[i].removeEventListener(evt[j], fn, false);
			}
		}
	}
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
const clear = function (items) {

	return new Promise((resolve) => {

		displayCycleHelper(items);

		displayCycleBatchProcess(0, 'clear')
		.then((res) => resolve(true))
		.catch((err) => resolve(false));
	});
};

/*
### Compile

* for both canvas and stack elements, perform necessary entity/element positional calculations
* for a canvas, stamp associated entitys onto the canvas
*/
const compile = function (items) {

	return new Promise((resolve) => {

		displayCycleHelper(items);

		displayCycleBatchProcess(0, 'compile')
		.then((res) => resolve(true))
		.catch((err) => resolve(false));
	});
};

/*
### Show

* stamp additional 'layer' canvases onto the base canvas, then copy the base canvas onto the display canvas
* for a stack element - no action required
*/
const show = function (items) {

	return new Promise((resolve) => {

		displayCycleHelper(items);

		displayCycleBatchProcess(0, 'show')
		.then((res) => resolve(true))
		.catch((err) => resolve(false));
	});
};

/*
### Render

* orchestrate the clear, compile and show actions on each stack and canvas DOM element
*/
const render = function (items) {

	return new Promise(function(resolve, reject){

		displayCycleHelper(items);

		displayCycleBatchProcess(0, 'render')
		.then((res) => resolve(true))
		.catch((err) => resolve(false));
	});
};

/*
Helper functions coordinate the actions required to complete a display cycle
*/
const displayCycleHelper = function (items) {

	items = (items) ? [].concat(items) : [];

	if (!items.length) {

		if (rootElementsSort) sortRootElements();
	}
	else rootElementBatches = [items];
};

/*

*/
const displayCycleBatchProcess = function (counter, method) {

	return new Promise((resolve) => {

		let i, iz, item, check,
			promiseArray,
			items = rootElementBatches[counter];

		if (items) {

			promiseArray = [Promise.resolve(true)];

			for (i = 0, iz = items.length; i < iz; i++) {

				item = artefact[items[i]];
				promiseArray.push(item[method]());
			}

			Promise.all(promiseArray)
			.then((res) => {

				check = rootElementBatches[counter + 1];

				if (check) {
					
					displayCycleBatchProcess(counter + 1, method)
					.then((res) => resolve(true))
					.catch((err) => resolve(false));
				}
				else resolve(true);
			})
			.catch((err) => resolve(false));
		}
		else resolve(true);
	});
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

	let myartefacts, art, style, el, 
		i, iz,
		p, perspective, origin,
		j, jz, keys, key, keyName, items, item;

	if (domShowRequired) {

		domShowRequired = false;
		myartefacts = [].concat(domShowElements);
		domShowElements.length = 0;

		for (i = 0, iz = myartefacts.length; i < iz; i++) {

			art = artefact[myartefacts[i]];

			if (art) {

				el = art.domElement;

				if (el) {

					style = el.style;

					// update perspective
					if (art.dirtyPerspective) {

						art.dirtyPerspective = false;

						p = art.perspective;

						perspective = `${p.z}px`;
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

						items = art.css || {};

						keys = Object.keys(items);

						for (j = 0, jz = keys.length; j < jz; j++) {

							key = keys[j];

							if (xcss.has(key)) {

								keyName = `${key[0].toUpperCase}${key.substr(1)}`;
								item = items[key];

								style[`webkit${keyName}`] = item;
								style[`moz${keyName}`] = item;
								style[`ms${keyName}`] = item;
								style[`o${keyName}`] = item;
								style[key] = item;
							}
							else if (css.has(key)) style[key] = items[key];
						}
					}
				}
			}
		}
	}
}

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
};
