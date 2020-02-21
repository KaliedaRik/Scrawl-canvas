/*
# Entity mixin
*/
import * as library from '../core/library.js';
import { defaultNonReturnFunction, defaultThisReturnFunction, defaultFalseReturnFunction, 
	generateUuid, isa_fn, mergeOver, xt, xta, addStrings } from '../core/utilities.js';
import { currentGroup, scrawlCanvasHold } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from '../factory/filter.js';
import { importDomImage } from '../factory/imageAsset.js';

export default function (P = {}) {

/*
## Define attributes

All factories using the position mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*

*/
		method: 'fill',

/*

*/
		pathObject: null,

/*

*/
		winding: 'nonzero',

/*

*/
		flipReverse: false,

/*

*/
		flipUpend: false,

/*

*/
		scaleOutline: true,

/*

*/
		lockFillStyleToEntity: false,
		lockStrokeStyleToEntity: false,

/*

*/
		onEnter: null,
		onLeave: null,
		onDown: null,
		onUp: null,
	};
	P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = P.getters,
		S = P.setters,
		D = P.deltaSetters;

/*

*/
	G.group = function () {

		return (this.group) ? this.group.name : '';
	};

/*

*/
	S.lockStylesToEntity = function (item) {

		this.lockFillStyleToEntity = item;
		this.lockStrokeStyleToEntity = item;
	};

/*

*/
	S.flipUpend = function (item) {

		if (item !== this.flipUpend) this.dirtyCollision = true;
		this.flipUpend = item;
	};

/*

*/
	S.flipReverse = function (item) {

		if (item !== this.flipReverse) this.dirtyCollision = true;
		this.flipReverse = item;
	};


/*
## Define functions to be added to the factory prototype
*/

/*
Overwrites function defined in mixin/base.js - takes into account State object attributes
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
Overwrites function defined in mixin/base.js - takes into account State object attributes
*/
	P.set = function (items = {}) {

		if (items) {

			let setters = this.setters,
				defs = this.defs,
				state = this.state,
				stateSetters = (state) ? state.setters : {},
				stateDefs = (state) ? state.defs : {};

			Object.entries(items).forEach(([key, value]) => {

				if (key && key !== 'name' && value != null) {

					let predefined = setters[key],
						stateFlag = false;

					if (!predefined) {

						predefined = stateSetters[key];
						stateFlag = true;
					}

					if (predefined) predefined.call(stateFlag ? this.state : this, value);
					else if (typeof defs[key] !== 'undefined') this[key] = value;
					else if (typeof stateDefs[key] !== 'undefined') state[key] = value;
				}
			}, this);
		}
		return this;
	};

/*
Overwrites function defined in mixin/base.js - takes into account State object attributes
*/
	P.setDelta = function (items = {}) {

		if (items) {

			let setters = this.deltaSetters,
				defs = this.defs,
				state = this.state,
				stateSetters = (state) ? state.deltaSetters : {},
				stateDefs = (state) ? state.defs : {};

			Object.entries(items).forEach(([key, value]) => {

				if (key && key !== 'name' && value != null) {

					let predefined = setters[key],
						stateFlag = false;

					if (!predefined) {

						predefined = stateSetters[key];
						stateFlag = true;
					}

					if (predefined) predefined.call(stateFlag ? this.state : this, value);
					else if (typeof defs[key] !== 'undefined') this[key] = addStrings(this[key], value);
					else if (typeof stateDefs[key] !== 'undefined') state[key] = addStrings(state[key], value);
				}
			}, this);
		}
		return this;
	};

/*

*/
	P.entityInit = function (items = {}) {

		this.makeName(items.name);
		this.register();
		this.initializePositions();

		this.set(this.defs);

		this.state = makeState();

		if (!items.group) items.group = currentGroup;

		this.onEnter = defaultNonReturnFunction;
		this.onLeave = defaultNonReturnFunction;
		this.onDown = defaultNonReturnFunction;
		this.onUp = defaultNonReturnFunction;

		this.set(items);

		this.midInitActions(items);
	};

/*

*/
	P.midInitActions = defaultNonReturnFunction;
	P.preCloneActions = defaultNonReturnFunction;
	P.postCloneActions = defaultNonReturnFunction;

/*
Overwrites the clone function in mixin/base.js
*/
	P.clone = function(items = {}) {

		let regex = /^(local|dirty|current)/,
			stateDefs = this.state.defs,
			copied, myCurrentState, myCloneState;

		let updateCopiedState = (copy, defs, item) => {

			let temp = copy[item];
			copy[item] = defs[item];

			if (temp) {

				if (temp.substring) copy[item] = temp;
				else if (temp.name) copy[item] = temp.name;
			}
		};

		this.preCloneActions();

		let grp = this.group;
		this.group = grp.name;
		
		let host = this.currentHost;
		delete this.currentHost;

		myCurrentState = this.state;
		if (items.sharedState) myCloneState = this.state;
		else myCloneState = mergeOver({}, this.state);
		delete this.state;

		let tempAsset = this.asset, 
			tempSource = this.source, 
			tempPivot = this.pivot, 
			tempMimic = this.mimic, 
			tempPath = this.path;

		if (tempAsset && tempAsset.name) this.asset = tempAsset.name;
		if (tempPivot && tempPivot.name) this.pivot = tempPivot.name;
		if (tempMimic && tempMimic.name) this.mimic = tempMimic.name;
		if (tempPath && tempPath.name) this.path = tempPath.name;

		delete this.source;

		let tempPathObject = this.pathObject;
		delete this.pathObject;

		copied = JSON.parse(JSON.stringify(this));

		if (tempAsset) this.asset = tempAsset;
		if (tempSource) this.source = tempSource;
		if (tempPivot) this.pivot = tempPivot;
		if (tempMimic) this.mimic = tempMimic;
		if (tempPath) this.path = tempPath;

		this.pathObject = tempPathObject;

		copied.name = (items.name) ? items.name : generateUuid();

		if (this.anchor && this.anchor.clickAction) copied.anchor.clickAction = this.anchor.clickAction;
		if (items.anchor) copied.anchor = mergeOver(copied.anchor, items.anchor);

		this.group = grp;
		this.currentHost = host;

		this.state = myCurrentState;
		if (!items.sharedState) {
			
			updateCopiedState(myCloneState, stateDefs, 'fillStyle');
			updateCopiedState(myCloneState, stateDefs, 'strokeStyle');
			updateCopiedState(myCloneState, stateDefs, 'shadowColor');
		}

		Object.entries(this).forEach(([key, value]) => {

			if (regex.test(key)) delete copied[key];
			if (isa_fn(this[key])) copied[key] = this[key];
		}, this);

		if (this.group) copied.group = this.group.name;

		let clone = new library.constructors[this.type](copied);

		if (items.sharedState) clone.state = myCloneState;
		else clone.set(myCloneState);

		clone.set(items);

		this.postCloneActions(clone, items);

		return clone;
	};

/*
CURRENTLY does not support filters on entitys
*/
	P.simpleStamp = function (host, changes = {}) {

		if (host && host.type === 'Cell') {

			this.currentHost = host;
			
			this.set(changes);
			this.prepareStamp();

			this.regularStampSynchronousActions();
		}
	};

/*

*/
	P.prepareStamp = function() {

		if (this.dirtyHost) {

			this.dirtyHost = false;
			this.dirtyDimensions = true;
		}

		if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

		if (this.dirtyRotation) this.dirtyCollision = true;


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

		if (this.dirtyPathObject) {

			this.cleanPathObject();
			this.dirtyCollision = true;
		}

		// update artefacts subscribed to this artefact (using it as their pivot or mimic source), if required
		if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
	};

/*
EVERY ENTITY FILE will need to define its own .cleanPathObject function
*/
	P.cleanPathObject = defaultNonReturnFunction;

/*

*/
	P.draw = function (engine) {

		engine.stroke(this.pathObject);
	};

	P.fill = function (engine) {

		engine.fill(this.pathObject, this.winding);
	};

	P.drawAndFill = function (engine) {

		let p = this.pathObject;

		engine.stroke(p);
		this.currentHost.clearShadow();
		engine.fill(p, this.winding);
	};

	P.fillAndDraw = function (engine) {

		let p = this.pathObject;

		engine.stroke(p);
		this.currentHost.clearShadow();
		engine.fill(p, this.winding);
		engine.stroke(p);
	};

	P.drawThenFill = function (engine) {

		let p = this.pathObject;

		engine.stroke(p);
		engine.fill(p, this.winding);
	};

	P.fillThenDraw = function (engine) {

		let p = this.pathObject;

		engine.fill(p, this.winding);
		engine.stroke(p);
	};

	P.clear = function (engine) {

		let gco = engine.globalCompositeOperation;

		engine.globalCompositeOperation = 'destination-out';
		engine.fill(this.pathObject, this.winding);
		
		engine.globalCompositeOperation = gco;
	};

	P.none = function (engine) {}

/*

*/
	P.stamp = function (force = false, host, changes) {

		let filterTest = (!this.noFilters && this.filters && this.filters.length) ? true : false;

		if (force) {

			if (host && host.type === 'Cell') this.currentHost = host;

			if (changes) {

				this.set(changes);
				this.prepareStamp();
			}

			if (filterTest) return this.filteredStamp();
			else return this.regularStamp();
		}

		if (this.visibility) {

			if (this.stashOutput || filterTest) return this.filteredStamp();
			else return this.regularStamp();
		}
		return Promise.resolve(false);
	};

/*

*/
	P.filteredStamp = function(){

		// Clean and sort the Entity-level filters before sending them to the filter worker for application
		if (this.dirtyFilters || !this.currentFilters) this.cleanFilters();

		let self = this;

		return new Promise((resolve, reject) => {

			// An internal cleanup function to release resources and restore the non-filter defaults to what they were before. It's also in the cleanup phase that we (finally) copy over the results of the filter over to the current canvas display, taking into account the entity's composite and alpha values
			let cleanup = function () {

				if (worker) releaseFilterWorker(worker);

				currentEngine.save();
				
				currentEngine.globalCompositeOperation = self.filterComposite;
				currentEngine.globalAlpha = self.filterAlpha;
				currentEngine.setTransform(1, 0, 0, 1, 0, 0);

				currentEngine.drawImage(filterElement, 0, 0);
				
				// This is also the point at which we action any requests to stash the Cell output and (optionally) create/update imageAsset objects and associated &lt;img> elements for use elsewhere in the Scrawl-canvas ecosystem.
				if (self.stashOutput) {

					self.stashOutput = false;

					let [stashX, stashY, stashWidth, stashHeight] = self.getCellCoverage(filterEngine.getImageData(0, 0, filterElement.width, filterElement.height));

					self.stashedImageData = filterEngine.getImageData(stashX, stashY, stashWidth, stashHeight);

					if (self.stashOutputAsAsset) {

						// KNOWN ISSUE - it takes time for the images to load the new dataURLs generated from canvas elements. See demo canvas-020 for a setTimeout-based workaround.
						self.stashOutputAsAsset = false;

						filterElement.width = stashWidth;
						filterElement.height = stashHeight;
						filterEngine.putImageData(self.stashedImageData, 0, 0);

						if (!self.stashedImage) {

							let newimg = self.stashedImage = document.createElement('img');

							newimg.id = `${self.name}-image`;

							newimg.onload = function () {

								scrawlCanvasHold.appendChild(newimg);
								importDomImage(`#${newimg.id}`);
							};

							newimg.src = filterElement.toDataURL();
						}
						else self.stashedImage.src = filterElement.toDataURL();
					}
				}
		
				releaseCell(filterHost);

				currentEngine.restore();

				self.currentHost = currentHost;
				self.noCanvasEngineUpdates = oldNoCanvasEngineUpdates;
			};

			// save current host data into a set of vars, ready for restoration after web worker completes or fails
			let currentHost = self.currentHost,
				currentElement = currentHost.element,
				currentEngine = currentHost.engine,
				currentDimensions = currentHost.currentDimensions;

			// get and prepare a blank canvas for the filter operations
			let filterHost = requestCell(),
				filterElement = filterHost.element,
				filterEngine = filterHost.engine;

			self.currentHost = filterHost;
			
			let w = filterElement.width = currentDimensions[0] || currentElement.width,
				h = filterElement.height = currentDimensions[1] || currentElement.height;

			// Switch off fast stamp
			let oldNoCanvasEngineUpdates = self.noCanvasEngineUpdates;
			self.noCanvasEngineUpdates = false;

 			// stamp the entity onto the blank canvas
			self.regularStampSynchronousActions();

			// At this point we will send the contents of the host canvas over to the web worker, alongside details of the filters we wish to apply to it
			let worker, myimage;

			if (!self.noFilters && self.filters && self.filters.length) {

				// if we're using the entity as a stencil, copy the entity cell's current display over the entity in the blank canvas
				if (self.isStencil) {

					filterEngine.save();
					filterEngine.globalCompositeOperation = 'source-in';
					filterEngine.globalAlpha = 1;
					filterEngine.setTransform(1, 0, 0, 1, 0, 0);
					filterEngine.drawImage(currentElement, 0, 0);
					filterEngine.restore();
				} 

				filterEngine.setTransform(1, 0, 0, 1, 0, 0);

				myimage = filterEngine.getImageData(0, 0, w, h);
				worker = requestFilterWorker();

				actionFilterWorker(worker, {
					image: myimage,
					filters: self.currentFilters
				})
				.then(img => {

					// handle the web worker response
					if (img) {

						filterEngine.globalCompositeOperation = 'source-over';
						filterEngine.globalAlpha = 1;
						filterEngine.setTransform(1, 0, 0, 1, 0, 0);
						filterEngine.putImageData(img, 0, 0);

						cleanup();
						resolve(true);
					}
					else throw new Error('image issue');
				})
				.catch((err) => {

					cleanup();
					reject(false);
				});
			}

			// Where no filter is required, but we still want to stash the results
			else {

				cleanup();
				resolve(true);
			}
		});
	};

	P.getCellCoverage = function (img) {

		let width = img.width,
			height = img.height,
			data = img.data,
			maxX = 0,
			maxY = 0,
			minX = width,
			minY = height,
			counter = 3,
			x, y;

		for (y = 0; y < height; y++) {

			for (x = 0; x < width; x++) {

				if (data[counter]) {

					if (minX > x) minX = x;
					if (maxX < x) maxX = x;
					if (minY > y) minY = y;
					if (maxY < y) maxY = y;
				}

				counter += 4;
			}
		}
		if (minX < maxX && minY < maxY) return [minX, minY, maxX - minX, maxY - minY];
		else return [0, 0, width, height];
	};

/*

*/
	P.regularStamp = function () {

		let self = this;

		return new Promise((resolve, reject) => {

			if (self.currentHost) {

				self.regularStampSynchronousActions();
				resolve(true);
			}
			reject(false);
		});
	};

/*

*/
	P.regularStampSynchronousActions = function () {

		let dest = this.currentHost;

		if (dest) {

			let engine = dest.engine,
				stamp = this.currentStampPosition,
				x = stamp[0],
				y = stamp[1];

			dest.rotateDestination(engine, x, y, this);

			if (!this.noCanvasEngineUpdates) dest.setEngine(this);

			this[this.method](engine);
		}
	};

	return P;
};
