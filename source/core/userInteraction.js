/*
# Core user interaction
*/
import { artefact } from "./library.js";
import { xta, pushUnique, removeItem } from "./utilities.js";

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

	for (let i = 0, iz = uiSubscribedElements.length; i < iz; i++) {
		updateUiSubscribedElement(uiSubscribedElements[i]);
	}
};

/*

*/
const updateUiSubscribedElement = function (art) {

	let dom, el, dims, l, t, h, dox, doy;

	dom = artefact[art];

	if (xta(dom, dom.domElement)) {

		el = dom.domElement;
		dims = el.getBoundingClientRect();
		dox = Math.round(dims.left + window.pageXOffset);
		doy = Math.round(dims.top + window.pageYOffset);

		if (!dom.here) dom.here = {}; 

		h = dom.here;
		h.x = Math.round(currentCorePosition.x - dox);
		h.y = Math.round(currentCorePosition.y - doy);
		h.w = Math.round(dims.width);
		h.h = Math.round(dims.height);
		h.normX = (h.w) ? h.x / h.w : false;
		h.normY = (h.h) ? h.y / h.h : false;
		h.offsetX = dox;
		h.offsetY = doy;
		h.type = currentCorePosition.type;
		h.active = true;

		if (h.normX < 0 || h.normX > 1 || h.normY < 0 || h.normY > 1) h.active = false;
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

	if (navigator.pointerEnabled) {
		window.addEventListener('pointermove', moveAction, false);
		window.addEventListener('pointerup', moveAction, false);
		window.addEventListener('pointerdown', moveAction, false);
		window.addEventListener('pointerleave', moveAction, false);
		window.addEventListener('pointerenter', moveAction, false);
	}
	else {
		window.addEventListener('mousemove', moveAction, false);
		window.addEventListener('mouseup', moveAction, false);
		window.addEventListener('mousedown', moveAction, false);
		window.addEventListener('mouseleave', moveAction, false);
		window.addEventListener('mouseenter', moveAction, false);
	}

	window.addEventListener('scroll', scrollAction, false);
	window.addEventListener('resize', resizeAction, false);

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

	if (navigator.pointerEnabled) {
		window.removeEventListener('pointermove', moveAction, false);
		window.removeEventListener('pointerup', moveAction, false);
		window.removeEventListener('pointerdown', moveAction, false);
		window.removeEventListener('pointerleave', moveAction, false);
		window.removeEventListener('pointerenter', moveAction, false);
	}
	else {
		window.removeEventListener('mousemove', moveAction, false);
		window.removeEventListener('mouseup', moveAction, false);
		window.removeEventListener('mousedown', moveAction, false);
		window.removeEventListener('mouseleave', moveAction, false);
		window.removeEventListener('mouseenter', moveAction, false);
	}

	window.removeEventListener('scroll', scrollAction, false);
	window.removeEventListener('resize', resizeAction, false);
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
