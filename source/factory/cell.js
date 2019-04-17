/*
# Cell factory
*/
import { artefact, radian, constructors, styles, stylesnames } from '../core/library.js';
import { convertLength, generateUuid, isa_canvas, mergeOver, xt, xtGet } from '../core/utilities.js';

import { makeGroup } from './group.js';
import { makeState } from './state.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from './filter.js';
import { colorList } from './color.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import cascadeMix from '../mixin/cascade.js';
import assetMix from '../mixin/asset.js';
import filterMix from '../mixin/filter.js';

/*
## Cell constructor
*/
const Cell = function (items = {}) {

	this.makeName(items.name);

	if (!isa_canvas(items.element)) {

		let mycanvas = document.createElement('canvas');
		mycanvas.id = this.name;

		// TODO: consider whether a cell can (and should be able to) take % dimensions
		mycanvas.width = xtGet(items.width, this.defs.width);
		mycanvas.height = xtGet(items.height, this.defs.height);
		items.element = mycanvas;
	}

	this.installElement(items.element);

	if (items.isPool) this.set(this.poolDefs) 
	else {
		this.register();
		this.set(this.defs);
	}

	this.set(items);
	this.state.setStateFromEngine(this.engine);

	if (!items.isPool) {

		makeGroup({
			name: this.name,
			host: this.name
		});
	}

	return this;
};

/*
## Cell object prototype setup
*/
let P = Cell.prototype = Object.create(Object.prototype);
P.type = 'Cell';
P.lib = 'cell';
P.isArtefact = false;
P.isAsset = true;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = cascadeMix(P);
P = assetMix(P);
P = filterMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	element: null,

/*

*/
	engine: null,

/*

*/
	state: null,

/*

*/
	controller: null,

/*

*/
	destination: null,

/*

*/
	width: 300,

/*

*/
	height: 100,

/*

*/
	cleared: true,

/*

*/
	compiled: true,

/*

*/
	shown: true,

/*

*/
	compileOrder: 0,

/*

*/
	showOrder: 0,

/*

*/
	backgroundColor: '',

/*

*/
	alpha: 1,

/*

*/
	scale: 1,

/*

*/
	composite: 'source-over',

/*

*/
	isBase: false,

/*

*/
	localizeHere: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);

/*
Cells don't have a need for these default attributes, which will have been added in by mixin/asset.js
*/
delete P.defs.source;
delete P.defs.sourceLoaded;

P.poolDefs = {
	element: null,
	engine: null,
	state: null,
	width: 300,
	height: 100,
	alpha: 1,
	composite: 'source-over',
}

/*
## Define attribute getters and setters
*/
let G = P.getters, 
	S = P.setters,
	D = P.deltaSetters;

/*

*/
P.get = function (item) {

	let getter = this.getters[item];

	if (getter) return getter.call(this);

	else {

		let def = this.defs[item],
			state = this.state,
			val;

		if (typeof def != 'undefined') {

			val = this[item];
			return (typeof val != 'undefined') ? val : def;
		}

		def = state.defs[item];

		if (typeof def != 'undefined') {

			val = state[item];
			return (typeof val != 'undefined') ? val : def;
		}
		return undef;
	}
};

/*

*/
G.width = function () {

	return this.localWidth || this.element.getAttribute('width');
};

/*

*/
G.height = function () {

	return this.localHeight || this.element.getAttribute('height');
};

S.source = function () {};

/*

*/
S.width = function (item) {

	this.width = item;
	this.dirtyDimensions = true;
};

/*

*/
S.height = function (item) {

	this.height = item;
	this.dirtyDimensions = true;
};

/*

*/
S.element = function (item) {

	if(isa_canvas(item)) this.installElement(item);
};

/*

*/
S.cleared = function (item) {

	this.cleared = item;
	this.updateControllerCells();
};

/*

*/
S.compiled = function (item) {

	this.compiled = item;
	this.updateControllerCells();
};

/*

*/
S.shown = function (item) {

	this.shown = item;
	this.updateControllerCells();
};

/*

*/
S.compileOrder = function (item) {

	this.compileOrder = item;
	this.updateControllerCells();
};

/*

*/
S.showOrder = function (item) {

	this.showOrder = item;
	this.updateControllerCells();
};

/*
Do nothing - the __engine__ MUST match the current element
*/
S.engine = function (item) {};

/*
Do nothing - the __state__ MUST reflect the state of the Cell's engine
*/
S.state = function (item) {};

/*
## Define prototype functions
*/

/*
Overrides mixin/asset.js function
*/
P.checkSource = function (width, height) {

	if (this.width !== width || this.height !== height) this.notifySubscribers();
};

/*
Overrides mixin/asset.js function
*/
P.notifySubscriber = function (sub) {

	sub.sourceNaturalWidth = this.width;
	sub.sourceNaturalHeight = this.height;
	sub.sourceLoaded = true;
	sub.dirtyImage = true;
};

/*
Overrides mixin/asset.js function
*/
P.subscribeAction = function (sub = {}) {

	subs.push(sub);
	sub.asset = this;
	sub.source = this.element;
	this.notifySubscriber(subs[i])
};

/*

*/
P.installElement = function (element) {

	this.element = element;
	this.engine = this.element.getContext('2d');

	this.state = makeState({
		engine: this.engine
	});

	return this;
};

/*

*/
P.updateControllerCells = function () {

	if (this.controller) this.controller.dirtyCells = true;
};

/*

*/
P.setEngineFromState = function (engine) {

	this.allKeys.forEach(key => this[key] = engine[key], this);

	this.lineDash = (xt(engine.lineDash)) ? engine.lineDash : [];
	this.lineDashOffset = xtGet(engine.lineDashOffset, 0);

	return this;
};

/*

*/
P.setToDefaults = function () {

	let items = this.state.defs,
		state = this.state,
		engine = this.engine,
		isArray = Array.isArray;

	Object.entries(items).forEach(([key, value]) => {

		if (key === 'lineDash') {

			if (!isArray(engine.lineDash)) engine.lineDash = [];
			else engine.lineDash.length = 0;

			if (!isArray(state.lineDash)) state.lineDash = [];
			else state.lineDash.length = 0;
		}
		else {

			engine[key] = value;
			state[key] = value;
		}
	});
	return this;
};

/*

*/
P.stylesArray = ['Gradient', 'RadialGradient', 'Pattern'];
P.setEngine = function (entity) {

	let state = this.state,
		entityState = entity.state,
		engine, item,
		changes = entityState.getChanges(entity, state),
		action = this.setEngineActions,
		stylesArray = this.stylesArray;

	if (Object.keys(changes).length) {

		engine = this.engine;

		for (item in changes) {

			action[item](changes[item], engine, stylesArray, entity, this);
			state[item] = changes[item];
		}
	}
	return entity;
};

/*

*/
P.setEngineActions = {

	fillStyle: function (item, engine, stylesArray, entity, layer) {

		if (item.substring) {

			if (stylesnames.indexOf(item) >= 0) {

				let brokenStyle = styles[item];

				if (brokenStyle) {
					
					entity.state.fillStyle = brokenStyle;
					engine.fillStyle = brokenStyle.getData(entity, layer, true);
				}
			}
			else engine.fillStyle = item;
		}
		else engine.fillStyle = item.getData(entity, layer, true);
	},

	font: function (item, engine) {
		engine.font = item;
	},

	globalAlpha: function (item, engine) {
		engine.globalAlpha = item;
	},

	globalCompositeOperation: function (item, engine) {
		engine.globalCompositeOperation = item;
	},

	lineCap: function (item, engine) {
		engine.lineCap = item;
	},

	lineDash: function (item, engine) {

		engine.lineDash = item;

		if (engine.setLineDash) engine.setLineDash(item);
	},

	lineDashOffset: function (item, engine) {
		engine.lineDashOffset = item;
	},

	lineJoin: function (item, engine) {
		engine.lineJoin = item;
	},

	lineWidth: function (item, engine) {
		engine.lineWidth = item;
	},

	shadowBlur: function (item, engine) {
		engine.shadowBlur = item;
	},

	shadowColor: function (item, engine) {
		engine.shadowColor = item;
	},

	shadowOffsetX: function (item, engine) {
		engine.shadowOffsetX = item;
	},

	shadowOffsetY: function (item, engine) {
		engine.shadowOffsetY = item;
	},

	strokeStyle: function (item, engine, stylesArray, entity, layer) {

		if (item.substring) {

			if (stylesnames.indexOf(item) >= 0) {

				let brokenStyle = styles[item];

				if (brokenStyle) {

					entity.state.strokeStyle = brokenStyle;
					engine.strokeStyle = brokenStyle.getData(entity, layer, false);
				}
			}
			else engine.strokeStyle = item;
		}
		else engine.strokeStyle = item.getData(entity, layer, false);
	},

	miterLimit: function (item, engine) {
		engine.miterLimit = item;
	},

	textAlign: function (item, engine) {
		engine.textAlign = item;
	},

	textBaseline: function (item, engine) {
		engine.textBaseline = item;
	}
};

/*

*/
P.clearShadow = function () {

	this.engine.shadowOffsetX = 0.0;
	this.engine.shadowOffsetY = 0.0;
	this.engine.shadowBlur = 0.0;
	this.state.shadowOffsetX = 0.0;
	this.state.shadowOffsetY = 0.0;
	this.state.shadowBlur = 0.0;

	return this;
};

/*

*/
P.restoreShadow = function (entity) {

	let state = entity.state;

	this.engine.shadowOffsetX = state.shadowOffsetX;
	this.engine.shadowOffsetY = state.shadowOffsetY;
	this.engine.shadowBlur = state.shadowBlur;
	this.state.shadowOffsetX = state.shadowOffsetX;
	this.state.shadowOffsetY = state.shadowOffsetY;
	this.state.shadowBlur = state.shadowBlur;

	return this;
};

/*

*/
P.setToClearShape = function () {

	this.engine.fillStyle = 'rgba(0,0,0,0)';
	this.engine.strokeStyle = 'rgba(0,0,0,0)';
	this.engine.shadowColor = 'rgba(0,0,0,0)';
	this.state.fillStyle = 'rgba(0,0,0,0)';
	this.state.strokeStyle = 'rgba(0,0,0,0)';
	this.state.shadowColor = 'rgba(0,0,0,0)';

	return this;
};

/*

*/
P.saveEngine = function () {

	this.engine.save();
	return this;
};

/*

*/
P.restoreEngine = function () {

	this.engine.restore();
	return this;
};

/*

*/
P.clear = function () {

	let self = this;

	return new Promise((resolve) => {

		let engine = self.engine,
			bgc = self.backgroundColor;

		self.renderPrecheck();

		let w = self.localWidth,
			h = self.localHeight;

		engine.setTransform(1,0,0,1,0,0);

		if (bgc) {

			let tempBackground = engine.fillStyle,
				tempGCO = engine.globalCompositeOperation,
				tempAlpha = engine.globalAlpha;

			engine.fillStyle = bgc;
			engine.globalCompositeOperation = 'source-over';
			engine.globalAlpha = 1;
			engine.fillRect(0, 0, w, h);
			engine.fillStyle = tempBackground;
			engine.globalCompositeOperation = tempGCO;
			engine.globalAlpha = tempAlpha;
		}
		else engine.clearRect(0, 0, w, h);

		resolve(true);
	});
};

/*

*/
P.compile = function(){

	let self = this;

	return new Promise((resolve) => {

		self.sortGroups();
		self.renderPrecheck();

		let promises = [];

		self.groupBuckets.forEach(mygroup => promises.push(mygroup.stamp()));

		Promise.all(promises)
		.then((res) => {

			if (self.filters && self.filters.length) return self.applyFilters();
			else return true;
		})
		.then(() => resolve(true))
		.catch(() => resolve(false));
	});
};

/*

*/
P.show = function () {

	var self = this;

	return new Promise((resolve) => {

		// get the destination cell's canvas context
		let engine = (self.destination) ? self.destination.engine : false,
			currentHandle, scale, width, height,
			temp, fit, pasteX, pasteY, pasteWidth, pasteHeight, relWidth, relHeight, state,
			floor = Math.floor;

		if (engine) {

			temp = [];
			scale = self.scale;

			if (self.isBase) {
				// copy the base canvas over to the display canvas. This copy operation ignores any scale, roll or position attributes set on the base cell, instead complying with the controller's fit attribute requirements
				self.renderPrecheck();

				state = self.destination.state;

				if (state.globalCompositeOperation !== self.composite) {

					state.globalCompositeOperation = self.composite;
					engine.globalCompositeOperation = self.composite;
				}

				if (state.globalAlpha !== self.alpha) {

					state.globalAlpha = self.alpha;
					engine.globalAlpha = self.alpha;
				}

				engine.setTransform(1, 0, 0, 1, 0, 0);

				fit = (self.controller) ? self.controller.fit : 'none';
				width = floor(self.localWidth);
				height = floor(self.localHeight);
				
				switch (fit) {

					case 'contain' :

						// base must copy into display resized, centered, letterboxing if necessary, maintaining aspect ratio
						relWidth = self.destinationWidth / (width || 1);
						relHeight = self.destinationHeight / (height || 1);

						if (relWidth > relHeight) {

							pasteWidth = floor(width * relHeight);
							pasteHeight = floor(height * relHeight);
							pasteY = 0;
							pasteX = floor((self.destinationWidth - (width * relHeight)) / 2);
						}
						else {

							pasteWidth = floor(width * relWidth);
							pasteHeight = floor(height * relWidth);
							pasteX = 0;
							pasteY = floor((self.destinationHeight - (height * relWidth)) / 2);
						}

						engine.drawImage(self.element, 0, 0, width, height, pasteX, pasteY, pasteWidth, pasteHeight);
						break;

					case 'cover' :

						// base must copy into display resized, centered, leaving no letterbox area, maintaining aspect ratio
						relWidth = self.destinationWidth / (width || 1);
						relHeight = self.destinationHeight / (height || 1);

						if (relWidth < relHeight) {

							pasteWidth = floor(width * relHeight);
							pasteHeight = floor(height * relHeight);
							pasteY = 0;
							pasteX = floor((self.destinationWidth - (width * relHeight)) / 2);
						}
						else{

							pasteWidth = floor(width * relWidth);
							pasteHeight = floor(height * relWidth);
							pasteX = 0;
							pasteY = floor((self.destinationHeight - (height * relWidth)) / 2);
						}

						engine.drawImage(self.element, 0, 0, width, height, pasteX, pasteY, pasteWidth, pasteHeight);
						break;

					case 'fill' :

						// base must copy into display resized, distorting the aspect ratio as necessary
						pasteWidth = floor(self.destinationWidth);
						pasteHeight = floor(self.destinationHeight);

						engine.drawImage(self.element, 0, 0, width, height, 0, 0, pasteWidth, pasteHeight);
						break;

					case 'none' :
					default :

						// base copies into display as-is, centred, maintaining aspect ratio
						pasteX = floor((self.destinationWidth - width) / 2);
						pasteY = floor((self.destinationHeight - height) / 2);

						engine.drawImage(self.element, 0, 0, width, height, pasteX, pasteY, width, height);
				}
			}
			else if (scale > 0) {

				// cell canvases are treated like entitys on the base canvas: they can be positioned, scaled and rotated. Positioning will respect lockXto and lockYto; flipReverse and flipUpend; and can be pivoted to other artefacts, or follow a path eltity. If pivoted to the mouse, they will use the base canvas's .here attribute, which takes into account differences between the base and display canvas dimensions.

				currentHandle = self.currentHandle;

				self.renderPrecheck();
				temp = self.showHelper(engine);

				self.updateStampX();
				self.updateStampY();

				self.rotateDestination(engine, self.stampX, self.stampY);

				width = floor(self.localWidth);
				height = floor(self.localHeight);
				pasteX = floor(-currentHandle.x * scale);
				pasteY = floor(-currentHandle.y * scale);
				pasteWidth = floor(width * scale);
				pasteHeight = floor(height * scale);

				engine.drawImage(self.element, 0, 0, width, height, pasteX, pasteY, pasteWidth, pasteHeight);
			}

			if (xt(temp[0])) engine.globalCompositeOperation = temp[0];

			if (xt(temp[1])) engine.globalAlpha = temp[1];

			resolve(true);
		}
		else resolve(false);
	});
};

/*

*/
P.showHelper = function (engine) {

	let dState = this.destination.state, 
		dComposite, dAlpha;

	if (dState.globalCompositeOperation !== this.composite) {

		dComposite = dState.globalCompositeOperation;
		engine.globalCompositeOperation = this.composite;
	}

	if (dState.globalAlpha !== this.alpha) {

		dAlpha = dState.globalAlpha;
		engine.globalAlpha = this.alpha;
	}

	engine.setTransform(1, 0, 0, 1, 0, 0);
	return [dComposite, dAlpha];
};

/*

*/
P.applyFilters = function () {

	let self = this;

	if(this.dirtyFilters || !this.currentFilters) this.cleanFilters();

	return new Promise(function(resolve){

		let engine = self.engine,
			oldComposite = engine.globalCompositeOperation,
			oldAlpha = engine.globalAlpha,
			image, worker;

		image = engine.getImageData(0, 0, self.localWidth, self.localHeight);
		worker = requestFilterWorker();

		actionFilterWorker(worker, {
			image: image,
			filters: self.currentFilters
		})
		.then((img) => {

			releaseFilterWorker(worker);

			if (img) {

				engine.globalCompositeOperation = self.filterComposite || 'source-over';
				engine.globalAlpha = self.filterAlpha || 1;
				engine.putImageData(img, 0, 0);
				engine.globalCompositeOperation = oldComposite;
				engine.globalAlpha = oldAlpha;
				
				resolve(true);
			}
			else resolve(false);
		})
		.catch((err) => {

			releaseFilterWorker(worker);
			resolve(false);
		});
	});
};

/*

*/
P.renderPrecheck = function () {

	let d = this.destination,
		dw, dh;

	dw = dh = 0;

	if (d) {

		dw = d.localWidth || d.width || 0,
		dh = d.localHeight || d.height || 0;
	}

	if (this.dirtyDimensions || this.destinationWidth !== dw || this.destinationHeight !== dh) {

		if (dw && dh) this.cleanDimensions(dw, dh);
	}

	if (this.localizeHere) this.updateHere();

	if (!this.isBase) {

		if (this.dirtyStart) this.cleanStart();
		if (this.dirtyHandle) this.cleanHandle();
	}
};

/*

*/
P.cleanDimensions = function (w, h) {

	this.dirtyDimensions = false;

	let d = this.destination;

	this.destinationWidth = (xt(w)) ? w : d.localWidth || d.width || 0;
	this.destinationHeight = (xt(h)) ? h : d.localHeight || d.height || 0;

	this.element.width = this.localWidth = convertLength(this.width, this.destinationWidth);
	this.element.height = this.localHeight = convertLength(this.height, this.destinationHeight);
};

/*

*/
P.updateHere = function () {

	let d = this.controller,
		rx, ry, dHere, here,
		round = Math.round;

	if (d && d.here) {

		if (!this.here) this.here = {};

		dHere = d.here;
		here = this.here;
		rx = this.localWidth / dHere.w;
		ry = this.localHeight / dHere.h;

		here.xRatio = rx;
		here.x = round(dHere.x * rx);
		here.yRatio = ry;
		here.y = round(dHere.y * ry);
	}
};

/*

*/
P.cleanStart = function () {

	this.dirtyStart = false;

	let w, h;

	if (this.destination) {

		w = (this.destination.localWidth) ? this.destination.localWidth : this.destination.width || 0;
		h = (this.destination.localHeight) ? this.destination.localHeight : this.destination.height || 0;
		
		this.cleanVectorParameter('currentStart', this.start, w, h);
	}
	else this.cleanVectorParameter('currentStart', this.start, 0, 0);
};

/*

*/
P.cleanHandle = function () {

	this.dirtyHandle = false;

	this.cleanVectorParameter('currentHandle', this.handle, this.localWidth, this.localHeight);
};

/*

*/
P.rotateDestination = function (engine, x, y, entity) {

	let self = (entity) ? entity : this,
		reverse, upend, cos, sin,
		rotation = 0, 
		pivot = (self.pivot) ? artefact[self.pivot] : false, 
		rotateOnPivot, pivotRoll, addPivotHandle, ph, addPathRoll;

	reverse = (self.flipReverse) ? -1 : 1;
	upend = (self.flipUpend) ? -1 : 1;
	rotateOnPivot = self.rotateOnPivot;
	addPivotHandle = self.addPivotHandle;
	addPathRoll = self.addPathRoll;

	if (pivot && addPivotHandle) {

		ph = pivot.currentHandle;
		pivotRoll = pivot.roll;

		engine.setTransform(reverse, 0, 0, upend, x, y);
		engine.rotate(pivotRoll * radian);
		
		if (!rotateOnPivot) rotation -= pivotRoll;

		if (self.lockXTo === 'pivot') engine.translate(-ph.x, 0);
		if (self.lockYTo === 'pivot') engine.translate(0, -ph.y);

		rotation += self.roll;

		if (addPathRoll) rotation += self.pathRoll;

		if (rotation) engine.rotate(rotation * radian);
	}
	else {

		rotation += self.roll;

		if (pivot && rotateOnPivot) rotation += pivot.roll;

		if (addPathRoll) rotation += self.pathRoll;

		if (rotation) {

			rotation *= radian;
			cos = Math.cos(rotation);
			sin = Math.sin(rotation);
			engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), x, y);
		}
		else engine.setTransform(reverse, 0, 0, upend, x, y);
	}

	return this;
};

/*
## Cell pool
*/
const cellPool = [];

/*

*/
const requestCell = function () {

	if (!cellPool.length) {

		cellPool.push(makeCell({
			name: `pool_${generateUuid()}`,
			isPool: true
		}));
	}

	return cellPool.shift();
};

/*

*/
const releaseCell = function (c) {

	if (c && c.type === 'Cell') cellPool.push(c.setToDefaults());
};


/*
## Exported factory function
*/
const makeCell = function (items) {

	return new Cell(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Cell = Cell;

export {
	makeCell,
	requestCell,
	releaseCell,
};
