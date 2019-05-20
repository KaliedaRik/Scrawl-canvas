/*
# Entity mixin
*/
import * as library from '../core/library.js';
import { defaultNonReturnFunction, defaultThisReturnFunction, defaultFalseReturnFunction, 
	generateUuid, isa_fn, mergeOver, xt, addStrings } from '../core/utilities.js';
import { currentGroup } from '../core/DOM.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makePoint } from '../factory/point.js';
import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from '../factory/filter.js';

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
		group: '',

/*

*/
		pathObject: null,

/*

*/
		winding: 'nonzero',

/*

*/
		collisionPoints: null,

/*

*/
		checkHitMethod: 'path',

/*

*/
		flipReverse: false,

/*

*/
		flipUpend: false,

/*

*/
		fastStamp: false,

/*

*/
		scaleOutline: true,

/*

*/
		lockFillStyleToEntity: false,

/*

*/
		lockStrokeStyleToEntity: false,
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
	G.width = function () {

		return this.localWidth;
	};

/*

*/
	G.height = function () {

		return this.localHeight;
	};

/*

*/
	G.group = function () {

		return (this.group) ? this.group.name : '';
	};

/*

*/
	G.collisionPoints = function () {

		return this.getCollisionPointCoordinates();
	};

/*

*/
	S.width = function (item) {

		this.width = (xt(item)) ? item : this.defs.width;

		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPathObject = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.height = function (item) {
		
		this.height = (xt(item)) ? item : this.defs.height;

		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPathObject = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.scale = function (item) {

		this.scale = (xt(item)) ? item : this.defs.scale;

		this.dirtyPathObject = true;
		this.dirtyScale = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.collisionPoints = function (item) {

		this.addCollisionPoints(item);
	};

/*
ISSUE - stack elements get given a group String for this attribute; here we're just assigning the entire group object
- they need to be brought more into alignment!
*/
	S.group = function (item) {

		let g;

		if(this.group) this.group.removeArtefacts(this.name);

		if (item) {

			if (item.substring) {

				g = library.group[item];

				if (g) this.group = g;
			}
			else if (item.type === 'Group') this.group = item;
			else this.group = null;
		}

		if (this.group) this.group.addArtefacts(this.name);
	};
			
/*

*/
	S.roll = function (item) {

		if (item.toFixed) {

			if (item < -360 || item > 360) item = item % 360;

			this.roll = item;
		}
	};

/*

*/
	S.lockStylesToEntity = function (item) {

		this.lockFillStyleToEntity = item;
		this.lockStrokeStyleToEntity = item;
	};

/*

*/
	D.width = function (item) {

		this.width = addStrings(this.width, item);

		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPathObject = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.height = function (item) {

		this.height = addStrings(this.height, item);

		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPathObject = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.scale = function (item) {

		this.scale = addStrings(this.scale, item);

		this.dirtyPathObject = true;
		this.dirtyScale = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.roll = function (item) {

		let r; 

		if (item.toFixed) {

			r = this.roll + item;
			
			if (r < -360 || r > 360) r = r % 360;

			this.roll = r;
		}
	};

/*
## Define functions to be added to the factory prototype
*/

/*

*/
	P.getHostDimensions = function () {

		if (this.group && this.group.host) {

			let h = library.cell[this.group.host];

			if (h) {

				return {
					w: h.localWidth,
					h: h.localHeight
				};
			}
		}
		console.log(this.name, 'unable to get host dimensions - returning default 100 x 100');
		return {w: 100, h: 100};
	};

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

				if (key !== 'name') {

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

				if (key !== 'name') {

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
		this.set(this.defs);

		this.state = makeState();

		if (!items.group) items.group = currentGroup;

		this.set(items);

		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyStart = true;

		this.dirtyPathObject = true;

		this.dirtyRotation = null;
	};

/*

*/
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

		if (this.asset || this.source) {

			let tempAsset = this.asset,
				tempSource = this.source;

			this.asset = tempAsset.name;
			this.source = tempSource.name;

			copied = JSON.parse(JSON.stringify(this));

			this.asset = tempAsset;
			this.source = tempSource;
		}
		else copied = JSON.parse(JSON.stringify(this));

		copied.name = (items.name) ? items.name : generateUuid();

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
This is a null function required by entitys to match a function used by DOM elements
*/
	P.makeCollidable = defaultThisReturnFunction;

/*
This is a null function required by entitys to match a function used by DOM elements
*/
	P.getBox = defaultFalseReturnFunction;

/*
Replicates and adapts function defined in mixin.dom.js
*/
	P.addCollisionPoints = function (...args) {

		let pointMaker = function (item) {

			return makePoint({
				name: `${this.name}_cp_${item}`,
				pivot: this.name,
				group: this.group
			});
		};

		let collisionPoints = this.collisionPoints = [],
			pointsArray = new Set();

		args.forEach(arg => {

			if (arg != null && arg.substring) {

				arg = arg.toLowerCase();

				switch (arg) {

					case 'corners' :
						pointsArray.add('ne').add('nw').add('sw').add('se');
						break;

					case 'edges' :
						pointsArray.add('n').add('w').add('s').add('e');
						break;

					case 'border' :
						pointsArray.add('ne').add('nw').add('sw').add('se').add('n').add('w').add('s').add('e');
						break;

					case 'center' :
						pointsArray.add('c');
						break;

					case 'all' :
						pointsArray.add('ne').add('nw').add('sw').add('se').add('n').add('w').add('s').add('e').add('c');
						break;

					case 'ne' :
					case 'e' :
					case 'se' :
					case 's' :
					case 'sw' :
					case 'w' :
					case 'nw' :
					case 'n' :
						pointsArray.add(arg);
						break;
				}
			}
		});

		let topArray = ['ne', 'n', 'nw'],
			middleArray = ['e', 'w', 'c'],
			leftArray = ['nw', 'w', 'sw'],
			centerArray = ['n', 's', 'c'];

		pointsArray.forEach(val => {

			let point = pointMaker(val);

			if (topArray.indexOf(val) >= 0) point.set({ offsetY: 'top' });
			else if (middleArray.indexOf(val) >= 0) point.set({ offsetY: 'center' });
			else point.set({ offsetY: 'bottom' });

			if (leftArray.indexOf(val) >= 0) point.set({ offsetX: 'left' });
			else if (centerArray.indexOf(val) >= 0) point.set({ offsetX: 'center' });
			else point.set({ offsetX: 'right' });

			collisionPoints.push(point);
		});
		return this;
	};

/*
NEEDS coding up
*/
	P.getCollisionPointCoordinates = function (host) {

		return false;
	};

/*
CURRENTLY does not support filters on entitys
*/
	P.simpleStamp = function (host, changes = {}) {

		if (host && host.type === 'Cell') {

			this.currentHost = host;
			
			if (changes) {

				this.set(changes);
				this.prepareStamp();
			}

			this.regularStampSynchronousActions();
		}
	};

/*

*/
	P.prepareStamp = function() {
// console.log(this.name, 'prepareStamp')
		if (this.mimic) this.prepareMimicStamp();

		if (this.dirtyDimensions) this.cleanDimensions();
		if (this.dirtyStart) this.cleanStart();
		if (this.dirtyHandle) this.cleanHandle();
		if (this.dirtyOffset || this.dirtyScale || this.pivot) this.cleanOffset();
		if (this.dirtyPathObject) this.cleanPathObject();
		if (this.dirtyPivoted) this.updatePivotSubscribers();
	};

/*
Overwrites mixin/position.js function
*/
	P.prepareMimicStampRotation = function (mimic) {

		if (xt(mimic.roll)) this.roll = mimic.roll;
	};

/*

*/
	P.cleanHandle = function () {

		if (this.localWidth && this.localHeight) {

			this.dirtyPathObject = true;
			this.dirtyHandle = false;

			this.cleanVectorParameter('currentHandle', this.handle, this.localWidth, this.localHeight);
		}
	};

/*

*/
	P.cleanOffset = function () {

		this.dirtyOffset = false;
		this.dirtyScale = false;

		let dims = this.cleanOffsetHelper();

		this.cleanVectorParameter('currentOffset', this.offset, dims[0], dims[1]);
	};

/*

*/
	P.cleanStart = function () {

		let host = this.currentHost;

		if (host) {

			this.dirtyStart = false;

			this.cleanVectorParameter('currentStart', this.start, host.localWidth, host.localHeight);
		}
	};

/*

*/
	P.cleanDimensions = function () {

		let host = this.currentHost,
			w, h, mw, mh;

		if (host) {

			this.dirtyDimensions = false;

			w = this.width;
			h = this.height;

			if (w.substring) this.localWidth = (parseFloat(w) / 100) * host.localWidth;
			else this.localWidth = w;

			if (h.substring) this.localHeight = (parseFloat(h) / 100) * host.localHeight;
			else this.localHeight = h;

			if (this.mimic) {

				mw = this.mimicPaddingWidth;
				mh = this.mimicPaddingHeight

				if (mw.substring) this.localMimicPaddingWidth = (parseFloat(mw) / 100) * host.localWidth;
				else this.localMimicPaddingWidth = mw;

				if (mh.substring) this.localMimicPaddingHeight = (parseFloat(mh) / 100) * host.localHeight;
				else this.localMimicPaddingHeight = mh;
			}
		}
	};

/*
EVERY ENTITY FILE will need to define its own .cleanPathObject function
*/
	P.cleanPathObject = defaultNonReturnFunction;

/*

*/
	P.stamper = {

		draw: function (engine, entity) {

			engine.stroke(entity.pathObject);
		},

		fill: function (engine, entity) {

			engine.fill(entity.pathObject, entity.winding);
		},

		drawFill: function (engine, entity) {

			engine.stroke(entity.pathObject);
			entity.currentHost.clearShadow();
			engine.fill(entity.pathObject, entity.winding);
		},

		fillDraw: function (engine, entity) {

			engine.stroke(entity.pathObject);
			entity.currentHost.clearShadow();
			engine.fill(entity.pathObject, entity.winding);
			engine.stroke(entity.pathObject);
		},

		floatOver: function (engine, entity) {

			engine.stroke(entity.pathObject);
			engine.fill(entity.pathObject, entity.winding);
		},

		sinkInto: function (engine, entity) {

			engine.fill(entity.pathObject, entity.winding);
			engine.stroke(entity.pathObject);
		},

		clear: function (engine, entity) {

			let gco = engine.globalCompositeOperation;

			engine.globalCompositeOperation = 'destination-out';
			engine.fill(entity.pathObject, entity.winding);
			
			engine.globalCompositeOperation = gco;
		},	

		none: function (engine, entity) {},	
	};

/*

*/
	P.stamp = function () {

		if (this.visibility) {

			if (this.filters && this.filters.length) return this.filteredStamp();
			else return this.regularStamp();
		}
		else return Promise.resolve(false);
	};

/*

*/
	P.filteredStamp = function(){

		let self = this;

		if (this.dirtyFilters) this.cleanFilters();

		return new Promise((resolve) => {

			let oldHost, oldElement, oldEngine, oldComposite, oldAlpha, host, 
				hostElement, hostEngine, hostState, oldFastStamp,
				image, w, h, worker;

			let cleanup = function () {

				releaseFilterWorker(worker);
				oldEngine.globalCompositeOperation = self.filterComposite || 'source-over';
				oldEngine.globalAlpha = self.filterAlpha || 1;
				oldEngine.setTransform(1, 0, 0, 1, 0, 0);

				oldEngine.drawImage(hostElement, 0, 0);
				releaseCell(host);

				oldEngine.globalCompositeOperation = oldComposite;
				oldEngine.globalAlpha = oldAlpha;
				self.currentHost = oldHost;
				self.fastStamp = oldFastStamp;
			};

			oldHost = self.currentHost;
			oldElement = oldHost.element;
			oldEngine = oldHost.engine;
			oldComposite = oldEngine.globalCompositeOperation;
			oldAlpha = oldEngine.globalAlpha;

			host = self.currentHost = requestCell();
			hostElement = host.element;
			hostEngine = host.engine;
			hostState = host.state;

			w = host.width = hostElement.width = oldHost.localWidth;
			h = host.height = hostElement.height = oldHost.localHeight;

			oldFastStamp = self.fastStamp;
			self.fastStamp = false;

			self.regularStampSynchronousActions();

			if (self.isStencil) {

				// This is where we copy over the current canvas to the new canvas using appropriate gco
				hostState.globalCompositeOperation = hostEngine.globalCompositeOperation = 'source-in';
				hostState.globalAlpha = hostEngine.globalAlpha = 1;
				hostEngine.setTransform(1, 0, 0, 1, 0, 0);
				hostEngine.drawImage(oldElement, 0, 0);
			} 

			// At this point we will send the contents of the host canvas over to the web worker, alongside details of the filters we wish to apply to it
			image = hostEngine.getImageData(0, 0, w, h);
			worker = requestFilterWorker();

			actionFilterWorker(worker, {
				image: image,
				filters: self.currentFilters
			})
			.then((image) => {

				if (image) {

					hostEngine.putImageData(image, 0, 0);
					cleanup();
					resolve(true);
				}
				else throw 'image issue';
			})
			.catch((err) => {

				cleanup();
				resolve(false);
			});
		});
	};

/*

*/
	P.regularStamp = function () {

		let self = this;

		return new Promise((resolve) => {

			// let dest = self.currentHost, 
			// 	engine, x, y;

			// if (dest) {

			// 	engine = dest.engine;
			// 	x = self.updateStampX();
			// 	y = self.updateStampY();

			// 	dest.rotateDestination(engine, x, y, self);

			// 	if (!self.fastStamp) dest.setEngine(self);

			// 	self.stamper[self.method](engine, self);

			// 	resolve(true);
			// }

			if (self.currentHost) {

				self.regularStampSynchronousActions();
				resolve(true);
			}
			resolve(false);
		});
	};

/*

*/
	P.regularStampSynchronousActions = function () {

		let dest = this.currentHost, 
			engine, x, y;

		if (dest) {

			engine = dest.engine;
			x = this.updateStampX();
			y = this.updateStampY();

			dest.rotateDestination(engine, x, y, this);

			if (!this.fastStamp) dest.setEngine(this);

			this.stamper[this.method](engine, this);
		}
	};

/*

*/
	P.checkHit = function (items = {}) {

		let dest = this.currentHost;

		if (dest) {

			let tests = (!Array.isArray(items)) ?  [items] : items;

			let engine = dest.engine,
				x = this.updateStampX(),
				y = this.updateStampY(),
				tx, ty;

			if (this.dirtyPathObject) this.cleanPathObject();

			dest.rotateDestination(engine, x, y, this);

			if (tests.some(test => {

				if (Object.prototype.toString.call(test) !== '[object Object]') return false;

				tx = test.x;
				ty = test.y;

				if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;

				return engine.isPointInPath(this.pathObject, tx, ty, this.winding);

			}, this)) return {
				x: tx,
				y: ty,
				artefact: this
			};
		}
		return false;
	};

	return P;
};
