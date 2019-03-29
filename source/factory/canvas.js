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
let Cp = Canvas.prototype = Object.create(Object.prototype);
Cp.type = 'Canvas';
Cp.lib = 'canvas';
Cp.artefact = true;

/*
Apply mixins to prototype object
*/
Cp = baseMix(Cp);
Cp = positionMix(Cp);
Cp = domMix(Cp);

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
Cp.defs = mergeOver(Cp.defs, defaultAttributes);

/*
## Define attribute getters and setters
*/
let G = Cp.getters,
	S = Cp.setters,
	D = Cp.deltaSetters;

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
Cp.fitDefaults = ['fill', 'contain', 'cover'];
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
Cp.dimensionsUpdateHelper = function (dim) {

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
Cp.setNow = function (items) {

	this.set(items);
	this.setNowHelper();
	return this;
};

/*

*/
Cp.setBase = function (items) {

	if (this.base) {

		this.base.set(items);
		this.setBaseHelper();
	}
	return this;
};

/*

*/
Cp.setAsCurrentCanvas = function () {

	if (this.base) setCurrentCanvas(this);
	return this;
};

/*

*/
Cp.deltaSetNow = function (items) {

	this.deltaSet(items);
	this.setNowHelper();
	return this;
};

/*

*/
Cp.deltaSetBase = function (items) {

	if (this.base) {

		this.base.deltaSet(items);
		this.setBaseHelper();
	}
	return this;
};

/*

*/
Cp.setNowHelper = function () {

	let i, iz,
		cells = this.cells;

	this.cleanCells();

	this.base.renderPrecheck(this);

	for (i = 0, iz = cells.length; i < iz; i++) {

		cell[cells[i]].renderPrecheck(this);
	}
};

/*

*/
Cp.setBaseHelper = function () {

	let i, iz, item,
		cells = this.cells;

	this.cleanCells();

	this.base.renderPrecheck(this);

	for (i = 0, iz = cells.length; i < iz; i++) {

		item = cell[cells[i]];
		item.dirtyStart = true;
		item.dirtyHandle = true;
	}
};

/*

*/
Cp.buildCell = function (items = {}) {

	let destination = items.destination || false,
		c;

	if (!destination) items.destination = this.base;
	else if (destination.substring) items.destination = cell[destination] || this.base;

	c = makeCell(items);
	
	this.addCell(c);
	this.cleanCells();
	return c;
};

/*

*/
Cp.addCell = function (item) {

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
Cp.removeCell = function (item) {

	item = (item.substring) ? item : item.name || false;

	if (item) {

		removeItem(this.cells, item);
		this.dirtyCells = true;
	}
	return this;
};

/*
TODO - is this all that is needed?
*/
Cp.killCell = function (item) {

	this.dirtyCells = true;
	return this;
};

/*
TODO - code up this functionality
*/
Cp.demolish = function (removeFromDom) {

	return true;
};

/*

*/
Cp.clear = function () {

	let self = this;

	if (this.dirtyCells) this.cleanCells();

	return new Promise((resolve) => {

		self.batchActionCells(0, 'clear')
		.then(() => resolve(true))
		.catch((err) => {
			console.log('CANVAS CLEAR no base error', self.name, err);
			resolve(false);
		});
	});
};

/*

*/
Cp.compile = function () {

	let self = this;

	if (this.dirtyCells) this.cleanCells();
	
	return new Promise((resolve) => {

		self.batchActionCells(0, 'compile')
		.then(() => self.prepareStamp())
		.then(() => self.stamp())
		.then(() => resolve(true))
		.catch((err) => {
			console.log('CANVAS COMPILE no base error', self.name, err);
			resolve(false);
		});
	});
};

/*

*/
Cp.show = function(){

	let self = this;

	if (this.dirtyCells) this.cleanCells();
	
	return new Promise((resolve) => {

		self.batchActionCells(0, 'show')
		.then((res) => {

			self.engine.clearRect(0, 0, self.localWidth, self.localHeight);
			return self.base.show();
		})
		.then(() => {

			domShow();
			resolve(true);
		})
		.catch((err) => {
			console.log('CANVAS SHOW error', self.name, err);
			resolve(false);
		});
	});
};

/*

*/
Cp.render = function () {

	let self = this;

	if (this.dirtyCells) this.cleanCells();
	
	return new Promise((resolve) => {

		self.clear()
		.then(() => self.compile())
		.then(() => self.show())
		.then(() => resolve(true))
		.catch((err) => {
			console.log('CANVAS RENDER error', self.name, err);
			resolve(false);
		});
	});
};

/*

*/
Cp.cleanCells = function () {

	let i, iz, item, order,
		tempClear = [],
		tempCompile = [],
		tempShow = [],
		cells = this.cells;

	for (i = 0, iz = cells.length; i < iz; i++) {

		item = cell[cells[i]];

		if (item) {

			if (item.cleared) tempClear.push(item);

			if (item.compiled){

				order = item.compileOrder;

				if (!tempCompile[order]) tempCompile[order] = [];

				tempCompile[order].push(item);
			}

			if (item.shown) {

				order = item.showOrder;

				if( !tempShow[order]) tempShow[order] = [];
				tempShow[order].push(item);
			}
		}
	}

	this.cellBatchesClear = [tempClear];
	this.cellBatchesCompile = [];
	this.cellBatchesShow = [];

	for (i = 0, iz = tempCompile.length; i < iz; i++) {

		item = tempCompile[i];
		
		if (item) this.cellBatchesCompile.push(item);
	}

	for (i = 0, iz = tempShow.length; i < iz; i++) {

		item = tempShow[i];

		if (item) this.cellBatchesShow.push(item);
	}

	if (this.dirtyDimensions) {

		this.domElement.setAttribute('width', this.localWidth);
		this.domElement.setAttribute('height', this.localHeight);
		this.dirtyDimensions = false;
	}

	this.dirtyCells = false;
};

/*

*/
Cp.batchActionCells = function (counter, action) {

	let self = this;

	return new Promise((resolve) => {

		let i, iz, item, check,
			promiseArray,
			bucket,
			items = false;

		switch (action) {

			case 'clear' :
				bucket = self.cellBatchesClear;
				break;

			case 'compile' :
				bucket = self.cellBatchesCompile;
				break;
				
			case 'show' :
				bucket = self.cellBatchesShow;
				break;
			
			default :
				bucket = false;
		};

		if (bucket) items = bucket[counter];

		if (items) {

			let promiseArray = [Promise.resolve(true)];

			for (i = 0, iz = items.length; i < iz; i++) {

				item = items[i];
				promiseArray.push(item[action]());
			}

			Promise.all(promiseArray)
			.then((res) => {

				check = bucket[counter + 1];

				if (check) {

					self.batchActionCells(counter + 1, action)
					.then(() => resolve(true))
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
