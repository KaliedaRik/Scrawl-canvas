/*
# Core user interaction
*/
import { artefact } from "./library.js";
import { xta, pushUnique } from "./utilities.js";

import { makeAnimation } from "../factory/animation.js";

const uiSubscribedElements = [];

/*
Scrawl-canvas mouse tracking functionality can be switched off by setting the __scrawl.ui.trackMouse__ flag to false
*/
let trackMouse = false,
	mouseChanged = false;

/*
__currentPos__ object holds the mouse cursor position, alongside browser view dimensions and scroll position
*/
const currentCorePosition = {
	x: 0,
	y: 0,
	scrollX: 0,
	scrollY: 0,
	w: 0,
	h: 0,
	type: 'mouse'
};

/*
__resizeAction__ function - to check if a view resize has occurred; if yes, flag that currentCorePosition object needs to be updated
*/
const resizeAction = function (e) {

	let w = document.documentElement.clientWidth,
		h = document.documentElement.clientHeight;

	if (currentCorePosition.w !== w || currentCorePosition.h !== h) {
		currentCorePosition.w = w;
		currentCorePosition.h = h;
		mouseChanged = true;
	}
};

/*
__scrollAction__ function - to check if a view scroll has occurred; if yes, flag that currentCorePosition object needs to be updated
*/
const scrollAction = function (e) {

	let x = window.pageXOffset,
		y = window.pageYOffset;

	if (currentCorePosition.scrollX !== x || currentCorePosition.scrollY !== y) {
		currentCorePosition.x += (x - currentCorePosition.scrollX);
		currentCorePosition.y += (y - currentCorePosition.scrollY);
		currentCorePosition.scrollX = x;
		currentCorePosition.scrollY = y;
		mouseChanged = true;
	}
};

/*
__moveAction__ function - to check if mouse cursor position has changed; if yes, flag that currentCorePosition object needs to be updated
*/
const moveAction = function (e) {

	let x = Math.round(e.pageX),
		y = Math.round(e.pageY);

	if (currentCorePosition.x !== x || currentCorePosition.y !== y) {
		currentCorePosition.type = (navigator.pointerEnabled) ? 'pointer' : 'mouse';
		currentCorePosition.x = x;
		currentCorePosition.y = y;
		mouseChanged = true;
	}
};

/*
Functions to update uiSubscribedElements attached to specified DOM elements. Each stack or canvas element tracked by Scrawl-canvas will include a local __here__ object which includes details of the element's current dimensions, relative position, and the position of the mouse cursor in relation to its top-left corner. These all need to be updated whenever there's a resize, scroll or cursor movement.
*/
const updateUiSubscribedElements = function () {

	uiSubscribedElements.forEach((item) => updateUiSubscribedElement(item));
};

/*

*/
const updateUiSubscribedElement = function (art) {

	let dom = artefact[art];

	if (xta(dom, dom.domElement)) {

		let el = dom.domElement,
			dims = el.getBoundingClientRect(),
			dox = Math.round(dims.left + window.pageXOffset),
			doy = Math.round(dims.top + window.pageYOffset);

		if (!dom.here) dom.here = {}; 

		let here = dom.here;

		here.x = Math.round(currentCorePosition.x - dox);
		here.y = Math.round(currentCorePosition.y - doy);
		here.w = Math.round(dims.width);
		here.h = Math.round(dims.height);
		here.normX = (here.w) ? here.x / here.w : false;
		here.normY = (here.h) ? here.y / here.h : false;
		here.offsetX = dox;
		here.offsetY = doy;
		here.type = currentCorePosition.type;
		here.active = true;

		if (here.normX < 0 || here.normX > 1 || here.normY < 0 || here.normY > 1) here.active = false;
	}
};

/*
Attach and remove core listeners attached to the __window__ object
*/
const coreListenersTracker = makeAnimation({

	name: 'coreListenersTracker',
	order: 0,
	delay: true,
	fn: function () {

		return new Promise((resolve) => {

			if (!uiSubscribedElements.length) resolve(false);

			if (trackMouse && mouseChanged) {

				mouseChanged = false;
				updateUiSubscribedElements();
			}

			resolve(true);
		});
	},
});

/*

*/
const startCoreListeners = function () {

	actionCoreListeners('removeEventListener');
	actionCoreListeners('addEventListener');

	trackMouse = true;
	mouseChanged = true;
	coreListenersTracker.run();
};

/*

*/
const stopCoreListeners = function () {

	trackMouse = false;
	mouseChanged = false;
	coreListenersTracker.halt();

	actionCoreListeners('removeEventListener');
};

/*

*/
const actionCoreListeners = function (action) {

	if (navigator.pointerEnabled || navigator.msPointerEnabled) {

		window[action]('pointermove', moveAction, false);
		window[action]('pointerup', moveAction, false);
		window[action]('pointerdown', moveAction, false);
		window[action]('pointerleave', moveAction, false);
		window[action]('pointerenter', moveAction, false);
	}
	else {

		window[action]('mousemove', moveAction, false);
		window[action]('mouseup', moveAction, false);
		window[action]('mousedown', moveAction, false);
		window[action]('mouseleave', moveAction, false);
		window[action]('mouseenter', moveAction, false);
	}

	window[action]('scroll', scrollAction, false);
	window[action]('resize', resizeAction, false);
};

/*

*/
const applyCoreResizeListener = function () {
	resizeAction();
	mouseChanged = true;
};

const applyCoreMoveListener = function () {
	moveAction();
	mouseChanged = true;
};

const applyCoreScrollListener = function () {
	scrollAction();
	mouseChanged = true;
};

export {
	uiSubscribedElements,
	currentCorePosition,
	startCoreListeners,
	stopCoreListeners,
	applyCoreResizeListener,
	applyCoreMoveListener,
	applyCoreScrollListener,
};
