/*
# Cell factory
*/
import { artefact, asset, radian, constructors, styles, stylesnames, cell, cellnames, group } from '../core/library.js';
import { convertLength, generateUuid, isa_canvas, mergeOver, xt, xtGet } from '../core/utilities.js';
import { scrawlCanvasHold } from '../core/document.js';

import { makeGroup } from './group.js';
import { makeState } from './state.js';
import { makeCoordinate } from './coordinate.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from './filter.js';
import { importDomImage } from './imageAsset.js';

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
The following booleans determine whether a Cell canvas will, clear, compile and/or show itself as part of the Display cycle.

* __cleared__ - Clearing the cell wipes it clean ready for new drawing activity - for cells that contain static imagery (such as a background) that only needs to be drawn once during an animation it makes no sense to construct its display on each iteration of the Display cycle. Can also be set to false if the compile step builds on, rather than replaces, the cell's current imagery.

* __compiled__ - Compiling the cell triggers the 'stamp cascade', where (visible) entitys in (visible) groups assigned to the cell are instructed to stamp themselves onto the cell. Again, set thisto false if the cell's imagery does not need to be redrawn on each iteration of the Display cycle.

* __shown__ - Showing the cell instructs it to stamp itself onto the 'base' cell or, for base cells, to stamp itself onto the display &lt;canvas> element in line with that canvas's wrapper's 'fit' attribute. This can be switched off if the cell is (for instance) being used as an asset source for a Picture entity or Pattern style.

Note that cells will clear and compile in the order given (ascending) of their __compileOrder__ and __showOrder__ values. Cells sharing a compileOrder or showOrder value will be compiled and shown determined by the order in which they were declared in the script where they were created.

Note that as part of the Display cycle, Scrawl-canvas will complete all tasks of the clear part of the process before moving on to the compile stage, which again will complete before the show stage triggers.
*/
	cleared: true,
	compiled: true,
	shown: true,

	compileOrder: 0,
	showOrder: 0,

/*
By default, cells have a background color of 'rgba(0,0,0,0)' - transparent, which gets applied as the end step in the clear part of the display cycle. Setting the __backgroundColor__ attribute ensures the Cell will use that color instead. Any CSS color String is a valid argument (but not gradients or patterns, which get applied at a later stage in the Display cycle).

Base cells can have this attribute set via their controller Canvas.
*/
	backgroundColor: '',

/*
Non-base Cells will stamp themselves onto the 'base' Cell as part of the Display cycle's show stage. We can mediate this action by setting the Cell's __alpha__ and __composite__ attributes to valid Rendering2DContext 'globalAlpha' and 'globalCompositeOperation' values.

We can also scale the Cell's size in the displayed Canvas by setting the __scale__ attribute to an appropriate value.
*/
	alpha: 1,
	composite: 'source-over',
	scale: 1,


/*
__localizeHere__ - when true, Scrawl-canvas will calculate a local .here object for the Cell, which allows mouse cursor movements to be tracked across. In general, only 'base' Cells need this information; set the attribute to false if there is no need for the displayed &lt;canvas> element to have mouse/touch/pointer-based user interaction. 
*/
	localizeHere: false,

/*
Any Cell can be used as an asset by a Pattern styles. The __repeat__ attribute determines how the Pattern will consume the Cell asset.
*/
	repeat: 'repeat',

/*
### Scrawl-canvas sets the following attributes automatically; do not change their values!

__isBase__ - Every displayed &lt;canvas> element - wrapped in a Scrawl-canvas Canvas object (factory/canvas.js) - must possess at least one Cell object, known as its 'base' Cell. 
*/
	isBase: false,

/*
__element__ - Equivalent to the Canvas's domElement attribute - a reference link to the &lt;canvas> element object. Cells are canvases which do not get added to the DOM document.
*/
	element: null,

/*
__engine__ - The Cell's &lt;canvas> element's CanvasRenderingContext2D interface/engine.
*/
	engine: null,

/*
__state__ - The Cell's State object (factory/state.js) - see that file for details.
*/
	state: null,

/*
__controller__ - A reference link to the displayed &lt;canvas> element's Scrawl-canvas wrapper (factory/canvas.js) - only 'base' cells require this handle.
*/
	controller: null,

/*
__sourceNaturalDimensions__ - for internal use by Picture entitys and Pattern styles using the Cell as their asset source.
*/
	sourceNaturalDimensions: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);

/*
Cells don't have a need for these default attributes, which will have been added in by mixin/asset.js
*/
delete P.defs.source;
delete P.defs.sourceLoaded;


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
Stash coordinates and dimensions allow us to store, and export to an image asset, a portion of the Cell's current display which can then be used (for instance) by Pattern styles.

Each of these values can be either absolute px Numbers, or relative (to the Cell's own dimensions) '%' strings
*/
S.stashX = function (val) {

	if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
	this.stashCoordinates[0] = val;
};
S.stashY = function (val) {

	if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
	this.stashCoordinates[1] = val;
};
S.stashWidth = function (val) {

	if (!this.stashDimensions) {

		let dims = this.currentDimensions;
		this.stashDimensions = [dims[0], dims[1]];
	}
	this.stashDimensions[0] = val;
};
S.stashHeight = function (val) {

	if (!this.stashDimensions) {

		let dims = this.currentDimensions;
		this.stashDimensions = [dims[0], dims[1]];
	}
	this.stashDimensions[1] = val;
};
D.stashX = function (val) {

	if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

	let c = this.stashCoordinates;
	c[0] = addStrings(c[0], val);
};
D.stashY = function (val) {

	if (!this.stashCoordinates) this.stashCoordinates = [0, 0];

	let c = this.stashCoordinates;
	c[1] = addStrings(c[1], val);
};
D.stashWidth = function (val) {

	if (!this.stashDimensions) {

		let dims = this.currentDimensions;
		this.stashDimensions = [dims[0], dims[1]];
	}

	let c = this.stashDimensions;
	c[0] = addStrings(c[0], val);
};
D.stashHeight = function (val) {

	if (!this.stashDimensions) {

		let dims = this.currentDimensions;
		this.stashDimensions = [dims[0], dims[1]];
	}

	let c = this.stashDimensions;
	c[1] = addStrings(c[1], val);
};

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

	if(this.dirtyFilters || !this.currentFilters) this.cleanFilters();

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

			// The else branch should only trigger once all the groups have been processed. At this point we should be okay to action any Cell-level filters on the output, and stash the output (if required)
			else {

				if (!self.noFilters && self.filters && self.filters.length) {

					self.applyFilters()
					.then(res => {

						resolve(true);
					})
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

				// Cell canvases are treated like entitys on the base canvas: they can be positioned, scaled and rotated. Positioning will respect lockTo; flipReverse and flipUpend; and can be pivoted to other artefacts, or follow a path entity, etc. If pivoted to the mouse, they will use the base canvas's .here attribute, which takes into account differences between the base and display canvas dimensions.

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

			if (self.stashOutput) self.stashOutputAction();
			resolve(true);
		}
		else {

			if (self.stashOutput) self.stashOutputAction();
			resolve(false);
		}
	});
};

/*
Internal function - add filters to the Cell's current output.

Filters are applied via a web worker, hence the need to wrap the functionality in a Promise
*/
P.applyFilters = function () {

	let self = this;

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
Internal function - stash the Cell's current output. While this function can be called at any time, the simplest way to invoke it is to set the Cell's __stashOutput__ flag to true, which will then invoke this function at the end of the compile step of the Display cycle (after any filters have been applied to the cell display).

The simplest way to set the stashOutput flag is to call __scrawl.createImageFromCell__(cellName_or_cellObject, stashOutputAsAsset_flag) from the user code.

We can limit the area of the cell display to be stashed by setting the Cell's __stashX__, __stashY__, __stashWidth__ and __stashHeight__ values appropriately. These can all be either absolute (positive) number values, or %String number values relative to the Cell element's dimensions.

We store the generated imageData object into the Cell object's __stashedImageData__ attribute.

If we are also stashing an image, an &lt;img> element will be generated and stored in the Cell object's __stashedImage__ attribute. We also generate an imageAsset wrapper for the object that will have the name _cellname+'-image'_, which gets added to the assets section of the Scrawl-canvas library.

KNOWN ISSUE - it takes time for the images to load the new dataURLs generated from canvas elements
ANNOYING ISSUE - images generated from cells are (currently) buggy - a timing issue, I think
*/
P.stashOutputAction = function () {

	let [cellWidth, cellHeight] = this.currentDimensions,
		stashCoordinates = this.stashCoordinates,
		stashDimensions = this.stashDimensions,
		stashX = (stashCoordinates) ? stashCoordinates[0] : 0, 
		stashY = (stashCoordinates) ? stashCoordinates[1] : 0, 
		stashWidth = (stashDimensions) ? stashDimensions[0] : cellWidth, 
		stashHeight = (stashDimensions) ? stashDimensions[1] : cellHeight;

	// Keep the stashed image within bounds of the Cell's dimensions.
	if (stashWidth.substring || stashHeight.substring || stashX.substring || stashY.substring || stashX || stashY || stashWidth !== cellWidth || stashHeight !== cellHeight) {

		if (stashWidth.substring) stashWidth = (parseFloat(stashWidth) / 100) * cellWidth;
		if (isNaN(stashWidth) || stashWidth <= 0) stashWidth = 1;
		if (stashWidth > cellWidth) stashWidth = cellWidth;

		if (stashHeight.substring) stashHeight = (parseFloat(stashHeight) / 100) * cellHeight;
		if (isNaN(stashHeight) || stashHeight <= 0) stashHeight = 1;
		if (stashHeight > cellHeight) stashHeight = cellHeight;

		if (stashX.substring) stashX = (parseFloat(stashX) / 100) * cellWidth;
		if (isNaN(stashX) || stashX < 0) stashX = 0;
		if (stashX + stashWidth > cellWidth) stashX = cellWidth - stashWidth;

		if (stashY.substring) stashY = (parseFloat(stashY) / 100) * cellHeight;
		if (isNaN(stashY) || stashY < 0) stashY = 0;
		if (stashY + stashHeight > cellHeight) stashY = cellHeight - stashHeight;
	}

	// Get the imageData object, and stash it
	this.stashedImageData = this.engine.getImageData(stashX, stashY, stashWidth, stashHeight);

	// Get the dataUrl String, updating the stashed &lt;img> element with it
	if (this.stashOutputAsAsset) {

		this.stashOutputAsAsset = false;

		let cellFlag = false,
			sourcecanvas, mycanvas;

		if (stashWidth !== cellWidth || stashHeight !== cellHeight) {

			cellFlag = true;
			
			mycanvas = requestCell();
			sourcecanvas = mycanvas.element;

			sourcecanvas.width = stashWidth;
			sourcecanvas.height = stashHeight;

			mycanvas.engine.putImageData(this.stashedImageData, 0, 0);
		}
		else sourcecanvas = this.element;

		if (!this.stashedImage) {

			let self = this;

			let newimg = this.stashedImage = document.createElement('img');

			newimg.id = `${this.name}-image`;

			newimg.onload = function () {

				scrawlCanvasHold.appendChild(newimg);
				importDomImage(`#${newimg.id}`);
			};

			newimg.src = sourcecanvas.toDataURL();
		}
		else this.stashedImage.src = sourcecanvas.toDataURL();

		if (cellFlag) {

			releaseCell(mycanvas);
		}
	}
	this.stashOutput = false;
};

/*
Internal function - get a reference to the Cell's current host (where it will be stamping itself as part of the Display cycle).

Note that Cells can (in theory: not tested yet) belong to more than one Canvas object Group - they can be used in multiple &lt;canvas> elements, thus the need to check which canvas is the current host at this point in the Display cycle.
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
Internal function - keeping the Canvas object's 'base' Cell's .here attribute up-to-date with accurate mouse/pointer/touch cursor data
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
Remove a Cell object from the Scrawl-canvas ecosystem by invoking its __demolishCell__ function.
*/
P.demolishCell = function () {

	if (this.controller) this.controller.removeCell(this.name);

	let grp = group[this.name];

	if (grp) grp.demolishGroup();

	this.deregister();

	return true;
};

/*
Internal function - steps to be performed before the Cell stamps its visual contents onto a Canvas object's base cell's canvas. Will be invoked as part of the Display cycle 'show' functionality.

Cells can emulate (most of) the functionality of entity artefacts, in that they can be positioned (start, handle, offset), rotated, scaled and flipped when they stamp themselves on the base cell. They can also be positioned using pivot, path and mouse functionality, and they can be dragged and dropped across the displayed &lt;canvas> element as part of defined user interaction.

Note that Cells acting as a Canvas object's 'base' cell will position themselves on the displayed Canvas in line with their Canvas controller's 'fit' attribute, disregarding any positional information it may have been given.
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
Internal function - get the Cell to update its .here information
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
Returns an array of entity Objects responding 'true' to a checkHit call on them, for the Cell's current .here attribute coordinates.

Used in particular with Canvas.cascadeEventAction() function
*/
P.getEntityHits = function () {

	let response = [],
		results = [],
		resultNames = [];

	if (this.groupBuckets) {

		this.groupBuckets.forEach(grp => {

			if (grp.visibility) results.push(grp.getAllArtefactsAt(this.here));
		}, this);
	}

	if (results.length) {

		results = results.reduce((a, v) => a.concat(v), []);

		results.forEach(item => {

			let art = item.artefact;

			if (art.visibility && resultNames.indexOf(art.name) < 0) {

				resultNames.push(art.name);
				response.push(art);
			}
		})
	}
	return response;
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

A number of processes - for instance collision functionality, and applying filters to entitys and groups - require the use of a &lt;canvas> element and its CanvasRenderingContext2D engine. Rather than generate these canvas elements on the fly, we store them in a pool, to help make the code more efficiant.

To use a pool cell, request it using the exposed __requestCell__ function.

IT IS IMPERATIVE that requested cells are released once work with them completes, using the __releaseCell__ function. Failure to do this leads to impaired performance as Javascript creates new canvas elements (often in multiples of 60 per second) which need to be garbage collected by the Javascript engine, thus leading to increasingly shoddy performance the longer the animation runs.

The __cellPoolLength__ function (supplied for debugging purposes) returns a string reporting on how many Cell objects are currently held in the pool, and how many have been created since the web page / Javascript first loaded.
*/
const cellPool = [];
let cellPoolCount = 0;

const generatedPoolCanvases = [];

const cellPoolLength = function () {

	return `${cellPool.length} (from ${cellPoolCount} generated)`;
}

P.poolDefs = {
	element: null,
	engine: null,
	state: null,
	width: 300,
	height: 100,
	alpha: 1,
	composite: 'source-over',
}

const requestCell = function () {

	if (!cellPool.length) {

		cellPool.push(makeCell({
			name: `pool_${generateUuid()}`,
			isPool: true
		}));
		cellPoolCount++;

		generatedPoolCanvases.push(cellPool[0].element)
	}

	return cellPool.shift();
};

const releaseCell = function (c) {

	if (c && c.type === 'Cell') {

		c.engine.setTransform(1,0,0,1,0,0);
		cellPool.push(c.setToDefaults());
	}
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
	cellPoolLength,
	makeCell,
	requestCell,
	releaseCell,

	generatedPoolCanvases,
};
