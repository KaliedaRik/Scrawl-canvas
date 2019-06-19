/*
# Canvas factory
*/
import { cell, constructors } from '../core/library.js';
import { rootElements, setRootElementsSort, setCurrentCanvas, domShow } from '../core/document.js';
import { generateUuid, mergeOver, pushUnique, removeItem, xt } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeState } from './state.js';
import { makeCell } from './cell.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
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
	}

	this.apply();
	
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
## Define prototype functions
*/

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

	this.base.updateBaseHere(this.here, this.fit);
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

	this.dirtyCells = true;
	return this;
};

/*
TODO - code up this functionality

Will meed to kill all cells associated with the visible canvas - except for che displayed cell?
- Makes no sense NOT to remove the canvas from the DOM - with no cells, it is a broken thing anyway
*/
P.demolish = function (removeFromDom) {

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
