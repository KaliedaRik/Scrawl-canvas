/*
# Cell factory
*/
import { artefact, asset, radian, constructors, styles, stylesnames, cell, cellnames } from '../core/library.js';
import { convertLength, generateUuid, isa_canvas, mergeOver, xt, xtGet } from '../core/utilities.js';

import { makeGroup } from './group.js';
import { makeState } from './state.js';
import { makeCoordinate } from './coordinate.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from './filter.js';

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

	if (!items.isPool) this.register();

	this.initializePositions();
	this.initializeCascade();

	if (!isa_canvas(items.element)) {

		let mycanvas = document.createElement('canvas');
		mycanvas.id = this.name;

		mycanvas.width = 300;
		mycanvas.height = 150;
		items.element = mycanvas;
	}

	this.installElement(items.element);

	if (items.isPool) this.set(this.poolDefs) 
	else this.set(this.defs);

	this.set(items);

	this.state.setStateFromEngine(this.engine);

	if (!items.isPool) {

		makeGroup({
			name: this.name,
			host: this.name
		});
	}

	this.subscribers = [];
	this.sourceNaturalDimensions = makeCoordinate();

	this.sourceLoaded = true;

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

/*

*/
	sourceNaturalDimensions: null,

/*

*/
	repeat: 'repeat',
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

	return this.currentDimensions[0] || this.element.getAttribute('width');
};

/*

*/
G.height = function () {

	return this.currentDimensions[1] || this.element.getAttribute('height');
};

S.source = function () {};

/*

*/
S.width = function (item) {

	this.dimensions[0] = item;
	this.dirtyDimensions = true;
};

/*

*/
S.height = function (item) {

	this.dimensions[1] = item;
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

*/
P.repeatValues = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']

S.repeat = function (item) {

	if (this.repeatValues.indexOf(item) >= 0) this.repeat = item;
	else this.repeat = this.defs.repeat;
};

/*
## Define prototype functions
*/

/*
Overrides mixin/asset.js function
*/
P.checkSource = function (width, height) {

	if (this.currentDimensions[0] !== width || this.currentDimensions[1] !== height) this.notifySubscribers();
};

/*
Used when a cell is the source for a pattern style
*/
P.getData = function (entity, cell, isFill) {

	this.checkSource(this.sourceNaturalDimensions[0], this.sourceNaturalDimensions[1]);

	return this.buildStyle(cell);
};

/*
Used when a cell is the source for a pattern style
*/
P.buildStyle = function (mycell = {}) {
	
	if (mycell) {

		let engine = false;

		if (mycell.substring) {

			let realcell = cell[mycell];

			if (realcell && realcell.engine) engine = realcell.engine;
		}
		else if (mycell.engine) engine = mycell.engine;

		if (engine) return engine.createPattern(this.element, this.repeat);
	}
	return 'rgba(0,0,0,0)';
};

P.cleanDimensionsAdditionalActions = function() {

	if (this.element) {

		let dims = this.currentDimensions;

		this.element.width = dims[0];
		this.element.height = dims[1];
	}
};

/*
Overrides mixin/asset.js function
*/
P.notifySubscriber = function (sub) {

	sub.sourceNaturalDimensions[0] = this.currentDimensions[0];
	sub.sourceNaturalDimensions[1] = this.currentDimensions[1];
	sub.sourceLoaded = true;
	sub.dirtyImage = true;
};

/*
Overrides mixin/asset.js function
*/
P.subscribeAction = function (sub = {}) {

	this.subscribers.push(sub);
	sub.asset = this;
	sub.source = this.element;
	this.notifySubscriber(sub)
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

			let brokenStyle = false;

			if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
			else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

			if (brokenStyle) {
				
				entity.state.fillStyle = brokenStyle;
				engine.fillStyle = brokenStyle.getData(entity, layer, true);
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

	miterLimit: function (item, engine) {
		engine.miterLimit = item;
	},

	textAlign: function (item, engine) {
		engine.textAlign = item;
	},

	textBaseline: function (item, engine) {
		engine.textBaseline = item;
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

			let brokenStyle = false;

			if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
			else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];

			if (brokenStyle) {
				
				entity.state.strokeStyle = brokenStyle;
				engine.strokeStyle = brokenStyle.getData(entity, layer, true);
			}
			else engine.strokeStyle = item;
		}
		else engine.strokeStyle = item.getData(entity, layer, false);
	},
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

		self.prepareStamp();

		let w = self.currentDimensions[0],
			h = self.currentDimensions[1];

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

	this.sortGroups();
	this.prepareStamp();

	let self = this;

	// Doing it this way to ensure that each group completes its stamp action before the next one starts
	let next = (counter) => {

		return new Promise((resolve, reject) => {

			let grp = self.groupBuckets[counter];

			if (grp && grp.stamp) {

				grp.stamp()
				.then(res => {

					next(counter + 1)
					.then(res => resolve(true))
					.catch(err => reject(false));
				})
				.catch(err => reject(false));
			}

			// The else branch should only trigger once all the groups have been processed. At this point we should be okay to action any Cell-level filters on the output
			else {

				if (self.filters && self.filters.length) {

					self.applyFilters()
					.then(res => resolve(true))
					.catch(err => reject(false));
				}
				else resolve(true);
			}
		});
	};
	return next(0);
};

/*

*/
P.show = function () {

	var self = this;

	return new Promise((resolve) => {

		// get the destination cell's canvas context
		let host = self.getHost(),
			engine = (host && host.engine) ? host.engine : false;

		if (engine) {

			let floor = Math.floor,
				scale = self.currentScale,
				currentDimensions = self.currentDimensions,
				curWidth = floor(currentDimensions[0]),
				curHeight = floor(currentDimensions[1]),
				hostDimensions = host.currentDimensions,
				destWidth = hostDimensions[0],
				destHeight = hostDimensions[1],
				composite = self.composite,
				alpha = self.alpha,
				controller = self.controller,
				element = self.element,
				paste;

			engine.save();
			engine.setTransform(1, 0, 0, 1, 0, 0);
				
			if (self.isBase) {

				if (!self.basePaste) self.basePaste = [];
				paste = self.basePaste;

				// copy the base canvas over to the display canvas. This copy operation ignores any scale, roll or position attributes set on the base cell, instead complying with the controller's fit attribute requirements
				self.prepareStamp();

				engine.globalCompositeOperation = 'source-over';
				engine.globalAlpha = 1;
				engine.clearRect(0, 0, destWidth, destHeight);

				engine.globalCompositeOperation = composite;
				engine.globalAlpha = alpha;

				let fit = (controller) ? controller.fit : 'none',
					relWidth, relHeight;
				
				switch (fit) {

					case 'contain' :
						// base must copy into display resized, centered, letterboxing if necessary, maintaining aspect ratio
						relWidth = destWidth / (curWidth || 1);
						relHeight = destHeight / (curHeight || 1);

						if (relWidth > relHeight) {

							paste[0] = floor((destWidth - (curWidth * relHeight)) / 2);
							paste[1] = 0;
							paste[2] = floor(curWidth * relHeight);
							paste[3] = floor(curHeight * relHeight);
						}
						else {

							paste[0] = 0;
							paste[1] = floor((destHeight - (curHeight * relWidth)) / 2);
							paste[2] = floor(curWidth * relWidth);
							paste[3] = floor(curHeight * relWidth);
						}
						break;

					case 'cover' :
						// base must copy into display resized, centered, leaving no letterbox area, maintaining aspect ratio
						relWidth = destWidth / (curWidth || 1);
						relHeight = destHeight / (curHeight || 1);

						if (relWidth < relHeight) {

							paste[0] = floor((destWidth - (curWidth * relHeight)) / 2);
							paste[1] = 0;
							paste[2] = floor(curWidth * relHeight);
							paste[3] = floor(curHeight * relHeight);
						}
						else{

							paste[0] = 0;
							paste[1] = floor((destHeight - (curHeight * relWidth)) / 2);
							paste[2] = floor(curWidth * relWidth);
							paste[3] = floor(curHeight * relWidth);
						}
						break;

					case 'fill' :
						// base must copy into display resized, distorting the aspect ratio as necessary
						paste[0] = 0;
						paste[1] = 0;
						paste[2] = floor(destWidth);
						paste[3] = floor(destHeight);
						break;

					case 'none' :
					default :
						// base copies into display as-is, centred, maintaining aspect ratio
						paste[0] = floor((destWidth - curWidth) / 2);
						paste[1] = floor((destHeight - curHeight) / 2);
						paste[2] = curWidth;
						paste[3] = curHeight;
				}
			}
			else if (scale > 0) {

				if (!self.paste) self.paste = [];
				paste = self.paste;

				// cell canvases are treated like entitys on the base canvas: they can be positioned, scaled and rotated. Positioning will respect lockTo; flipReverse and flipUpend; and can be pivoted to other artefacts, or follow a path entity. If pivoted to the mouse, they will use the base canvas's .here attribute, which takes into account differences between the base and display canvas dimensions.

				self.prepareStamp();

				engine.globalCompositeOperation = composite;
				engine.globalAlpha = alpha;

				let handle = self.currentStampHandlePosition,
					stamp = self.currentStampPosition;

				paste[0] = floor(-handle[0] * scale);
				paste[1] = floor(-handle[1] * scale);
				paste[2] = floor(curWidth * scale);
				paste[3] = floor(curHeight * scale);

				self.rotateDestination(engine, stamp[0], stamp[1]);
			}

			engine.drawImage(element, 0, 0, curWidth, curHeight, ...paste);
			engine.restore();

			resolve(true);
		}
		else resolve(false);
	});
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

		image = engine.getImageData(0, 0, self.currentDimensions[0], self.currentDimensions[1]);
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
P.getHost = function () {

	if (this.currentHost) return this.currentHost;
	else if (this.host) {

		let host = asset[this.host] || artefact[this.host];

		if (host) this.currentHost = host;
		
		return (host) ? this.currentHost : currentCorePosition;
	}
	return currentCorePosition;
};

/*

*/
P.updateBaseHere = function (controllerHere, fit) {

	if (this.isBase) {

		if (!this.here) this.here = {};

		let here = this.here,
			dims = this.currentDimensions;

		let active = controllerHere.active;

		if (dims[0] !== controllerHere.w || dims[1] !== controllerHere.h) {

			if (!this.basePaste) this.basePaste = [];

			let pasteX = this.basePaste[0];

			let localWidth = dims[0],
				localHeight = dims[1],
				remoteWidth = controllerHere.w,
				remoteHeight = controllerHere.h,
				remoteX = controllerHere.x,
				remoteY = controllerHere.y;

			let relWidth = localWidth / remoteWidth || 1,
				relHeight = localHeight / remoteHeight || 1,
				round = Math.round,
				offsetX, offsetY;

			here.w = localWidth;
			here.h = localHeight;

			switch (fit) {

				case 'contain' :
				case 'cover' :

					if (pasteX) {

						offsetX = (remoteWidth - (localWidth / relHeight)) / 2;

						here.x = round((remoteX - offsetX) * relHeight);
						here.y = round(remoteY * relHeight);
					}
					else {

						offsetY = (remoteHeight - (localHeight / relWidth)) / 2;

						here.x = round(remoteX * relWidth);
						here.y = round((remoteY - offsetY) * relWidth);
					}
					break;

				case 'fill' :
					here.x = round(remoteX * relWidth);
					here.y = round(remoteY * relHeight);
					break;

				case 'none' :
				default :
					offsetX = (remoteWidth - localWidth) / 2;
					offsetY = (remoteHeight - localHeight) / 2;

					here.x = round(remoteX - offsetX);
					here.y = round(remoteY - offsetY);
			}

			if (here.x < 0 || here.x > localWidth) active = false;
			if (here.y < 0 || here.y > localHeight) active = false;

			here.active = active;
		}
		else {

			here.x = controllerHere.x;
			here.y = controllerHere.y;
			here.w = controllerHere.w;
			here.h = controllerHere.h;
			here.active = active;
		}
		controllerHere.baseActive = active;
	}
};

/*

*/
P.prepareStamp = function () {

	if (this.dirtyScale) this.cleanScale();
	if (this.dirtyDimensions) this.cleanDimensions();
	if (this.dirtyLock) this.cleanLock();
	if (this.dirtyStart) this.cleanStart();
	if (this.dirtyOffset) this.cleanOffset();
	if (this.dirtyHandle) this.cleanHandle();
	if (this.dirtyRotation) this.cleanRotation();

	if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

		this.dirtyStampPositions = true;
		this.dirtyStampHandlePositions = true;
	}

	if (this.dirtyStampPositions) this.cleanStampPositions();
	if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();
};

/*

*/
P.updateHere = function () {

	let d = this.controller,
		rx, ry, dHere, here, 
		round = Math.round;

	let [w, h] = this.currentDimensions;

	if (d && d.here) {

		if (!this.here) this.here = {};

		dHere = d.here;
		here = this.here;
		rx = w / dHere.w;
		ry = h / dHere.h;

		here.xRatio = rx;
		here.x = round(dHere.x * rx);
		here.yRatio = ry;
		here.y = round(dHere.y * ry);
		here.w = w;
		here.h = h;
	}
};

/*

*/
P.rotateDestination = function (engine, x, y, entity) {

	let self = (entity) ? entity : this,
		mimic = self.mimic,
		reverse, upend,
		rotation = self.currentRotation;

	if (mimic && mimic.name && self.useMimicFlip) {

		reverse = (mimic.flipReverse) ? -1 : 1;
		upend = (mimic.flipUpend) ? -1 : 1;
	}
	else {

		reverse = (self.flipReverse) ? -1 : 1;
		upend = (self.flipUpend) ? -1 : 1;
	}

	if (rotation) {

		rotation *= radian;

		let cos = Math.cos(rotation),
			sin = Math.sin(rotation);

		engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), x, y);
	}
	else engine.setTransform(reverse, 0, 0, upend, x, y);

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
