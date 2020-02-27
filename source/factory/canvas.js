/*
# Canvas factory
*/
import { cell, constructors, artefact } from '../core/library.js';
import { rootElements, setRootElementsSort, setCurrentCanvas, domShow, scrawlCanvasHold } from '../core/document.js';
import { generateUuid, mergeOver, pushUnique, removeItem, xt, defaultThisReturnFunction } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeState } from './state.js';
import { makeCell } from './cell.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import domMix from '../mixin/dom.js';

/*
## Canvas constructor
*/
const Canvas = function (items = {}) {

	let g, el;

	this.makeName(items.name);
	this.register();
	this.initializePositions();

	this.dimensions[0] = 300;
	this.dimensions[1] = 150;

	this.pathCorners = [];
	this.css = {};
	this.here = {};
	this.perspective = {

		x: '50%',
		y: '50%',
		z: 0
	};
	this.dirtyPerspective = true;

	this.initializeDomLayout(items);

	this.set(this.defs);

	if (!items.label) items.label = `${this.name} canvas element`;

	this.set(items);

	this.cleanDimensions();

	el = this.domElement;

	if (el) {

		if (this.trackHere) pushUnique(uiSubscribedElements, this.name);

		this.engine = this.domElement.getContext('2d');

		this.state = makeState({
			engine: this.engine
		});

		// set up additional cells array
		this.cells = [];
		this.cellBatchesClear = [];
		this.cellBatchesCompile = [];
		this.cellBatchesShow = [];

		// setup base cell
		let cellArgs = {
			name: `${this.name}_base`,
			element: false,
			width: this.currentDimensions[0],
			height: this.currentDimensions[1],
			cleared: true,
			compiled: true,
			shown: false,
			isBase: true,
			localizeHere: true,
			host: this.name,
			controller: this,
			order: 10,
		};
		this.base = this.buildCell(cellArgs);

		// even if it is a child of a stack element, it needs to be recorded as a 'rootElement'
		pushUnique(rootElements, this.name);
		setRootElementsSort();

		// Accessibility
		if (!el.getAttribute('role')) el.setAttribute('role', 'img');

		let textHold = document.createElement('div');
		textHold.id = `${this.name}-text-hold`;
		textHold.style.width = '0px';
		textHold.style.height = '0px';
		textHold.style.maxWidth = '0px';
		textHold.style.maxHeight = '0px';
		textHold.style.border = '0px';
		textHold.style.padding = '0px';
		textHold.style.margin = '0px';
		textHold.style.overflow = 'hidden';
		this.textHold = textHold;
		el.parentNode.insertBefore(textHold, el.nextSibling);

		let ariaLabel = document.createElement('div');
		ariaLabel.id = `${this.name}-ARIA-label`;
		ariaLabel.textContent = this.label;
		this.ariaLabelElement = ariaLabel;
		scrawlCanvasHold.appendChild(ariaLabel);
		el.setAttribute('aria-labelledby', ariaLabel.id);

		let ariaDescription = document.createElement('div');
		ariaDescription.id = `${this.name}-ARIA-description`;
		ariaDescription.textContent = this.description;
		this.ariaDescriptionElement = ariaDescription;
		scrawlCanvasHold.appendChild(ariaDescription);
		el.setAttribute('aria-describedby', ariaDescription.id);

		this.cleanAria();
	}

	this.apply();

	if (items.setAsCurrentCanvas) this.setAsCurrentCanvas();
	
	return this;
};

/*
## Canvas object prototype setup
*/
let P = Canvas.prototype = Object.create(Object.prototype);
P.type = 'Canvas';
P.lib = 'canvas';
P.isArtefact = true;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = domMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*
TO TEST - position needs to change to 'absolute' when Canvas element is an artefact associated with a stack. But canvas elements can also be created independently of any stack, in which case position:relative should suffice
*/
	position: 'relative',

/*

*/
	trackHere: true,

/*

*/
	dirtyCells: true,

/*

*/
	fit: 'none',

/*
Accessibility attributes

* __title__ attribute is applied to the &lt;canvas> element's 'title' attribute, and will appear as a tooltip when the user hovers over the canvas

* __label__ and __description__ attributes are applied to (offscreen) div elements which are referenced by the &lt;canvas> element using 'aria-labelledby' and 'aria-describedby' attributes

If no label value is supplied to the canvas factory (as part of the function's argument object), then Scrawl-canvas will auto-generate a label based on the canvas's name. All three attributes can be updated dynamically using the usual .set() functionality.
*/
	title: '',
	label: '',
	description: '',

/*
Set to true if canvas is being used as part of a Scrawl-canvas component
*/
	isComponent: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define attribute getters and setters
*/
let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/
P.fitDefaults = ['fill', 'contain', 'cover'];
S.fit = function (item) {

	this.fit = (this.fitDefaults.indexOf(item) >= 0) ? item : 'none';
};

/*

*/
G.alpha = function () {

	return this.base.alpha;
};

/*

*/
G.backgroundColor = function () {

	return this.base.backgroundColor;
};

/*

*/
G.composite = function () {

	return this.base.composite;
};

/*

*/
S.alpha = function (item) {

	if (this.base) {

		this.base.set({
			alpha: item
		});
	}
};

/*

*/
S.backgroundColor = function (item) {

	if (this.base) {

		this.base.set({
			backgroundColor: item
		});
	}
};

/*

*/
S.title = function (item) {

	this.title = item;
	this.dirtyAria = true;
};

S.label = function (item) {

	this.label = item;
	this.dirtyAria = true;
};

S.description = function (item) {

	this.description = item;
	this.dirtyAria = true;
};

/*

*/
S.composite = function (item) {

	if (this.base) {
		this.base.set({
			composite: item
		});
	}
};

/*

*/
D.alpha = function(item) {

	if (this.base) {

		this.base.deltaSet({
			alpha: item
		});
	}
};

/*

*/
S.trackHere = function(bool) {

	if (xt(bool)) {

		if (bool) pushUnique(uiSubscribedElements, this.name);
		else removeItem(uiSubscribedElements, this.name);

		this.trackHere = bool;
	}
};


/*
## Define prototype functions
*/

/*
Decided against canvas cloning - too much of an edge case to be worth the code.
*/
P.clone = defaultThisReturnFunction;

/*

*/
P.setAsCurrentCanvas = function () {

	if (this.base) setCurrentCanvas(this);
	return this;
};

/*

*/
P.setBase = function (items) {

	if (this.base) {

		this.base.set(items);
		this.setBaseHelper();
	}
	return this;
};

/*

*/
P.deltaSetBase = function (items) {

	if (this.base) {

		this.base.deltaSet(items);
		this.setBaseHelper();
	}
	return this;
};

/*

*/
P.updateBaseHere = function () {

	if (this.base) this.base.updateBaseHere(this.here, this.fit);
};

/*

*/
P.setBaseHelper = function () {

	let items = {};

	if (this.base.dirtyScale) items.dirtyScale = true;
	if (this.base.dirtyDimensions) items.dirtyDimensions = true;
	if (this.base.dirtyLock) items.dirtyLock = true;
	if (this.base.dirtyStart) items.dirtyStart = true;
	if (this.base.dirtyOffset) items.dirtyOffset = true;
	if (this.base.dirtyHandle) items.dirtyHandle = true;
	if (this.base.dirtyRotation) items.dirtyRotation = true;

	this.cleanCells();
	this.base.prepareStamp();

	this.updateCells(items);
};

/*

*/
P.updateCells = function (items = {}) {

	this.cells.forEach(name => {

		let mycell = cell[name];

		if (mycell) {

			if (items.dirtyScale) mycell.dirtyScale = true;
			if (items.dirtyDimensions) mycell.dirtyDimensions = true;
			if (items.dirtyLock) mycell.dirtyLock = true;
			if (items.dirtyStart) mycell.dirtyStart = true;
			if (items.dirtyOffset) mycell.dirtyOffset = true;
			if (items.dirtyHandle) mycell.dirtyHandle = true;
			if (items.dirtyRotation) mycell.dirtyRotation = true;
		}
	});
};

/*

*/
P.buildCell = function (items = {}) {

	let host = items.host || false;

	if (!host) items.host = this.base.name;

	let mycell = makeCell(items);
	
	this.addCell(mycell);
	this.cleanCells();
	return mycell;
};

P.cleanDimensionsAdditionalActions = function () {

	if (this.cells) {

		this.updateCells({
			dirtyDimensions: true,
		});
	}

	this.dirtyDomDimensions = true;
};

/*

*/
P.addCell = function (item) {

	item = (item.substring) ? item : item.name || false;

	if (item) {

		pushUnique(this.cells, item);
		cell[item].prepareStamp();
		this.dirtyCells = true;
	}
	return item;
};

/*

*/
P.removeCell = function (item) {

	item = (item.substring) ? item : item.name || false;

	if (item) {

		removeItem(this.cells, item);
		this.dirtyCells = true;
	}
	return this;
};

/*
TODO - is this all that is needed? 

Assume that killing a cell involves also killing its associated group(s) and any entitys, tweens, filters etc currently associated with it?
*/
P.killCell = function (item) {

	let mycell = (item.substring) ? cell[item] : item;

	if (mycell) mycell.demolishCell();

	this.dirtyCells = true;
	return this;
};

/*
TODO - code up this functionality

In the DOM, we need to:
- remove the canvas element
- remove all the ARIA elements associated with it
- remove the textHold element associated with it

In Scrawl-canvas, we need to:
- remove the base cell associated with the canvas
	- which probably needs functionality coded up in factory/Cell.js
	- see if we need to add in checks for the existence of the object in tweens and pivot/mimic positioning functionality
- remove the canvas object from the library (artefact, canvas) - see if we need to overwrite core/base.js function
*/
P.demolish = function () {

	removeItem(uiSubscribedElements, this.name);

	removeItem(rootElements, this.name);
	setRootElementsSort();

	let el = this.domElement,
		textHold = this.textHold,
		ariaLabel = this.ariaLabelElement,
		ariaDescription = this.ariaDescriptionElement;

	textHold.parentNode.removeChild(textHold);
	ariaLabel.parentNode.removeChild(ariaLabel);
	ariaDescription.parentNode.removeChild(ariaDescription);
	el.parentNode.removeChild(el);

	this.killCell(this.base);

	this.deregister();

	return true;
};

/*

*/
P.clear = function () {

	let self = this;

	return new Promise((resolve) => {

		let promises = [];

		if (self.dirtyCells) self.cleanCells();

		self.cellBatchesClear.forEach(mycell => promises.push(mycell.clear()));

		Promise.all(promises)
		.then(() => resolve(true))
		.catch(() => resolve(false));
	});
};

/*

*/
P.compile = function () {

	let self = this;

	return new Promise((resolve) => {

		let promises = [];

		if (self.dirtyCells) self.cleanCells();

		self.cellBatchesCompile.forEach(mycell => promises.push(mycell.compile()));

		Promise.all(promises)
		.then(() => self.prepareStamp())
		.then(() => self.stamp())
		.then(() => resolve(true))
		.catch(() => resolve(false));
	});
};

/*

*/
P.show = function(){

	let self = this;

	return new Promise((resolve) => {

		let promises = [];

		if (self.dirtyCells) self.cleanCells();

		self.cellBatchesShow.forEach(mycell => promises.push(mycell.show()));

		Promise.all(promises)
		.then((res) => {

			self.engine.clearRect(0, 0, self.localWidth, self.localHeight);
			return self.base.show();
		})
		.then(() => {

			domShow();

			if (this.dirtyAria) this.cleanAria();

			resolve(true);
		})
		.catch(() => resolve(false));
	});
};

/*

*/
P.render = function () {

	let self = this;

	return new Promise((resolve) => {

		self.clear()
		.then(() => self.compile())
		.then(() => self.show())
		.then(() => resolve(true))
		.catch(() => resolve(false));
	});
};

/*

*/
P.cleanCells = function () {

	this.dirtyCells = false;

	let tempClear = [],
		tempCompile = [],
		tempShow = [],
		cells = this.cells,
		order;

	cells.forEach(item => {

		let mycell = cell[item];

		if (mycell) {

			if (mycell.cleared) tempClear.push(mycell);

			if (mycell.compiled) {

				order = mycell.compileOrder;

				if (!tempCompile[order]) tempCompile[order] = [];

				tempCompile[order].push(mycell);
			}

			if (mycell.shown) {

				order = mycell.showOrder;

				if (!tempShow[order]) tempShow[order] = [];
				tempShow[order].push(mycell);
			}
		}
	});

	this.cellBatchesClear = [].concat(tempClear);
	this.cellBatchesCompile = tempCompile.reduce((a, v) => a.concat(v), []);
	this.cellBatchesShow = tempShow.reduce((a, v) => a.concat(v), []);
};

/*
Trigger event action responses in (visible) entitys at the current mouse/touch 

Trigger event action responses in (visible) entitys at the current canvas element _here_ attribute coordinates

* Available cascadeEventAction arguments are: 'enter', 'leave', 'down', or 'up'

* A 'move' argument can also be used, which will trigger enter and leave actions on the entitys, as appropriate to each

Function returns an Array of name Strings for the entitys at the current mouse cursor coordinates 
*/
P.cascadeEventAction = function (action) {

	if (!this.currentActiveEntityNames) this.currentActiveEntityNames = [];

	let currentActiveEntityNames = this.currentActiveEntityNames,
		testActiveEntityObjects = [],
		testActiveEntityNames = [],
		newActiveEntityObjects = [],
		newActiveEntityNames = [],
		knownActiveEntityObjects = [],
		knownActiveEntityNames = [];

	// 1. Find all entitys currently colliding with the mouse/touch coordinate over the canvas
	this.cells.forEach(name => {

		let myCell = cell[name];

		if (myCell && (myCell.shown || myCell.isBase)) testActiveEntityObjects.push(myCell.getEntityHits());
	});

	testActiveEntityObjects = testActiveEntityObjects.reduce((a, v) => a.concat(v), []);

	// 2. Process the returned test results
	testActiveEntityObjects.forEach(item => {

		let name = item.name;

		if (testActiveEntityNames.indexOf(name) < 0) {

			testActiveEntityNames.push(name);

			if (currentActiveEntityNames.indexOf(name) < 0) {

				newActiveEntityObjects.push(item);
				newActiveEntityNames.push(name);
			}
			else {

				knownActiveEntityObjects.push(item);
				knownActiveEntityNames.push(name);
			}
		}
	});

	let currentActiveEntityObjects = newActiveEntityObjects.concat(knownActiveEntityObjects);

	// 3. Trigger the required action on each affected entity
	let doLeave = function () {

		if (currentActiveEntityNames.length) {

			newActiveEntityNames.forEach(name => removeItem(currentActiveEntityNames, name));
			knownActiveEntityNames.forEach(name => removeItem(currentActiveEntityNames, name));

			currentActiveEntityNames.forEach(name => {

				let myArt = artefact[name];

				if (myArt) myArt.onLeave();
			});
		}
	};

	switch (action) {

		case 'down' :
			currentActiveEntityObjects.forEach(art => art.onDown());
			break;

		case 'up' :
			currentActiveEntityObjects.forEach(art => art.onUp());
			break;

		case 'enter' :
			newActiveEntityObjects.forEach(art => art.onEnter());
			break;

		case 'leave' :
			doLeave();
			break;

		case 'move' :
			doLeave();
			newActiveEntityObjects.forEach(art => art.onEnter());
			break;
	}

	// 4. Cleanup and return
	this.currentActiveEntityNames = newActiveEntityNames.concat(knownActiveEntityNames);

	return this.currentActiveEntityNames;
};

/*

*/
P.cleanAria = function () {

	this.dirtyAria = false;
	this.domElement.setAttribute('title', this.title);
	this.ariaLabelElement.textContent = this.label;
	this.ariaDescriptionElement.textContent = this.description;
}


/*
## Exported factory function
*/
const makeCanvas = function (items) {
	return new Canvas(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Canvas = Canvas;

export {
	makeCanvas,
};
