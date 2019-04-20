/*
# Canvas factory
*/
import { cell, constructors } from '../core/library.js';
import { rootElements, setRootElementsSort, setCurrentCanvas, domShow } from '../core/DOM.js';
import { generateUuid, mergeOver, pushUnique, removeItem, xt } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeState } from './state.js';
import { makeCell } from './cell.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import domMix from '../mixin/dom.js';

/*
## Canvas constructor
*/
const Canvas = function (items = {}) {

	let dims, cellArgs, parent;

	this.makeName(items.name);
	this.register();
	this.css = {};
	this.set(this.defs);
	this.set(items);
	this.uuid = generateUuid();

	if (this.domElement) {

		// discover whether the canvas is a child of a stack element
		this.group = items.group || '';

		// positioning
		this.setPosition();

		// identifier
		this.domElement.setAttribute('data-uuid', this.uuid);

		if (this.trackHere) pushUnique(uiSubscribedElements, this.name);

		// sort out initial dimensions
		if (!xt(items.width, items.height)) {

			dims = this.domElement.getBoundingClientRect();

			if (!xt(items.width)) this.width = this.localWidth = dims.width;
			if (!xt(items.height)) this.height = this.localHeight = dims.height;
		}

		this.dirtyDimensions = true;

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
			width: this.localWidth,
			height: this.localHeight,
			cleared: true,
			compiled: true,
			shown: false,
			isBase: true,
			localizeHere: true,
			destination: this,
			controller: this,
			order: 10,
		};
		this.base = this.buildCell(cellArgs);

		// even if it is a child of a stack element, it needs to be recorded as a 'rootElement'
		pushUnique(rootElements, this.name);
		setRootElementsSort();
	}

	// correcting initial roll/pitch/yaw zero settings
	if (!this.roll && !this.pitch && !this.yaw) this.dirtyRotationActive = false;

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
G.width = function () {

	if (!xt(this.width)) {

		let w = this.domElement.width;

		this.width = (xt(w)) ? parseFloat(w) : this.defs.width;
		this.dirtyDimensions = true;
		this.dirtyHandle = true;
	}
	return this.width;
};

/*

*/
G.height = function () {

	if (!xt(this.height)) {

		let h = this.domElement.height;

		this.height = (xt(h)) ? parseFloat(h) : this.defs.height;
		this.dirtyDimensions = true;
		this.dirtyHandle = true;
	}
	return this.height;
};

/*

*/
S.width = function (item) {

	this.width = (xt(item)) ? item : this.defs.width;

	this.dimensionsUpdateHelper('width');
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

/*

*/
S.height = function (item) {

	this.height = (xt(item)) ? item : this.defs.height;

	this.dimensionsUpdateHelper('height');
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

/*

*/
D.width = function (item) {

	this.width = addStrings(this.width, item);

	this.dimensionsUpdateHelper('width');
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

/*

*/
D.height = function (item) {

	this.height = addStrings(this.height, item);

	this.dimensionsUpdateHelper('height');
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

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
P.dimensionsUpdateHelper = function (dim) {

	let here = this.getHere(),
		w, h;

	if (dim === 'width') {

		w = (here) ? here.w : this.defaultAttributes.width;
		this.localWidth = (this.width.substring) ? (parseFloat(this.width) / 100) * w : this.width;
	}
	else if (dim === 'height') {

		h = (here) ? here.h : this.defaultAttributes.height;
		this.localHeight = (this.height.substring) ? (parseFloat(this.height) / 100) * h : this.height;
	}

	if (this.base) this.base.dirtyDimensions = true;
};

/*

*/
P.setNow = function (items) {

	this.set(items);
	this.setNowHelper();
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
P.setAsCurrentCanvas = function () {

	if (this.base) setCurrentCanvas(this);
	return this;
};

/*

*/
P.deltaSetNow = function (items) {

	this.deltaSet(items);
	this.setNowHelper();
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
P.setNowHelper = function () {

	this.cleanCells();
	this.base.renderPrecheck(this);

	this.cells.forEach(mycell => cell[mycell].renderPrecheck(this), this);
};

/*

*/
P.setBaseHelper = function () {

	this.cleanCells();
	this.base.renderPrecheck(this);

	this.cells.forEach(item => {

		let mycell = cell[item];

		if (mycell) {

			mycell.dirtyStart = true;
			mycell.dirtyHandle = true;
		}
	});
};

/*

*/
P.buildCell = function (items = {}) {

	let destination = items.destination || false;

	if (!destination) items.destination = this.base;
	else if (destination.substring) items.destination = cell[destination] || this.base;

	let mycell = makeCell(items);
	
	this.addCell(mycell);
	this.cleanCells();
	return mycell;
};

/*

*/
P.addCell = function (item) {

	item = (item.substring) ? item : item.name || false;

	if (item) {

		pushUnique(this.cells, item);
		cell[item].renderPrecheck(this);
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

	if (this.dirtyDimensions) {

		this.dirtyDimensions = false;

		this.domElement.setAttribute('width', this.localWidth);
		this.domElement.setAttribute('height', this.localHeight);
	}
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
