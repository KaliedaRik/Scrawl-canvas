/*
# Entity mixin
*/
import * as library from '../core/library.js';
import { defaultNonReturnFunction, defaultThisReturnFunction, defaultFalseReturnFunction, 
	generateUuid, isa_fn, isa_obj, mergeOver, pushUnique, xt, xta } from '../core/utilities.js';
import { currentGroup } from '../core/DOM.js';

import { makePoint } from '../factory/point.js';
import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from '../factory/filter.js';

export default function (obj = {}) {

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
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = obj.getters,
		S = obj.setters,
		D = obj.deltaSetters;

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
	obj.get = function (item) {

		let undef,
			g = this.getters[item],
			d, i;

		if (g) return g.call(this);
		else{

			d = this.defs[item];

			if (typeof d !== 'undefined') {

				i = this[item];
				return (typeof i !== 'undefined') ? i : d;
			}

			d = this.state.defs[item];

			if (typeof d !== 'undefined') {

				i = this.state[item];
				return (typeof i !== 'undefined') ? i : d;
			}
			else return undef;
		}
	};

/*

*/
	obj.set = function (items) {

		let key, i, iz, s,
			keys = Object.keys(items),
			eSetters = this.setters,
			eDefs = this.defs,
			sSetters, sDefs;

		if (this.state) {

			sSetters = this.state.setters;
			sDefs = this.state.defs;
		}

		for (i = 0, iz = keys.length; i < iz; i++) {

			key = keys[i];

			if (key !== 'name') {

				s = eSetters[key];
				
				if (s) s.call(this, items[key]);
				else if (typeof eDefs[key] !== 'undefined') this[key] = items[key];
				else if (this.state) {

					s = sSetters[key];

					if (s) s.call(this.state, items[key]);
					else if (typeof sDefs[key] !== 'undefined') this.state[key] = items[key];
				}
			}
		}
		return this;
	};

/*

*/
	obj.setDelta = function (items) {

		let key, i, iz, s,
			keys = Object.keys(items),
			eSetters = this.deltaSetters,
			eDefs = this.defs,
			sSetters, sDefs;

		if (this.state) {

			sSetters = this.state.deltaSetters;
			sDefs = this.state.defs;
		}

		for (i = 0, iz = keys.length; i < iz; i++) {

			key = keys[i];
			
			if (key !== 'name') {

				s = eSetters[key];
				
				if (s) s.call(this, items[key]);
				else if (typeof eDefs[key] !== 'undefined') this[key] = items[key];
				else if (this.state) {

					s = sSetters[key];
					
					if (s) s.call(this, items[key]);
					else if (typeof sDefs[key] !== 'undefined') this.state[key] = items[key];
				}
			}
		}
		return this;
	};

/*

*/
	obj.entityInit = function (items = {}) {

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

		delete this.dirtyRotation;
	};

/*

*/
	obj.clone = function(items = {}) {

		let copied, clone, keys, key,
			that, i, iz, state, 
			group, host,
			stateDefs = this.state.defs;

		let updateCopiedState = function (copy, defs, item) {

			let temp = copy[item];

			copy[item] = defs[item];

			if (temp) {

				if (temp.substring) copy[item] = temp;
				else if (temp.name) copy[item] = temp.name;
			}
		};

		group = this.group;
		this.group = group.name;
		
		host = this.currentHost;
		delete this.currentHost;

		copied = JSON.parse(JSON.stringify(this));
		copied.name = (items.name) ? items.name : generateUuid();

		this.group = group;

		keys = Object.keys(this);
		that = this;

		for (i = 0, iz = keys.length; i < iz; i++) {

			key = keys[i];

			if (/^(local|dirty|current)/.test(key)) delete copied[key];

			if (isa_fn(this[key])) copied[key] = that[key];
		}

		state = copied.state;
		updateCopiedState(state, stateDefs, 'fillStyle');
		updateCopiedState(state, stateDefs, 'strokeStyle');
		updateCopiedState(state, stateDefs, 'shadowColor');
		delete copied.state;

		if (this.group) copied.group = this.group.name;

		clone = new library.constructors[this.type](copied);

		clone.set(state);
		clone.set(items);

		if (items.sharedState) clone.state = that.state;

		return clone;
	};

/*
This is a null function required by entitys to match a function used by DOM elements
*/
	obj.makeCollidable = defaultThisReturnFunction;

/*
This is a null function required by entitys to match a function used by DOM elements
*/
	obj.getBox = defaultFalseReturnFunction;

/*

*/
	obj.addCollisionPoints = function (...args) {

		let pointsArray, i, iz, item;

		this.collisionPoints = [];
		pointsArray = [];

		for (i = 0, iz = args.length; i < iz; i++) {

			item = args[i];

			if (item && item.substring) {
				
				item = item.toLowerCase();

				switch (item) {

					case 'ne' :
					case 'n' :
					case 'nw' :
					case 'w' :
					case 'sw' :
					case 's' :
					case 'se' :
					case 'e' :
						pushUnique(pointsArray, item);
						break;

					case 'corners' :
						pushUnique(pointsArray, 'ne');
						pushUnique(pointsArray, 'nw');
						pushUnique(pointsArray, 'sw');
						pushUnique(pointsArray, 'se');
						break;

					case 'edges' :
						pushUnique(pointsArray, 'n');
						pushUnique(pointsArray, 'w');
						pushUnique(pointsArray, 's');
						pushUnique(pointsArray, 'e');
						break;

					case 'border' :
						pushUnique(pointsArray, 'ne');
						pushUnique(pointsArray, 'n');
						pushUnique(pointsArray, 'nw');
						pushUnique(pointsArray, 'w');
						pushUnique(pointsArray, 'sw');
						pushUnique(pointsArray, 's');
						pushUnique(pointsArray, 'se');
						pushUnique(pointsArray, 'e');
						break;

					case 'center' :
						pushUnique(pointsArray, 'c');
						break;

					case 'all' :
						pushUnique(pointsArray, 'ne');
						pushUnique(pointsArray, 'n');
						pushUnique(pointsArray, 'nw');
						pushUnique(pointsArray, 'w');
						pushUnique(pointsArray, 'sw');
						pushUnique(pointsArray, 's');
						pushUnique(pointsArray, 'se');
						pushUnique(pointsArray, 'e');
						pushUnique(pointsArray, 'c');
						break;
				}
			}
		}

		this.finalizeCollisionPoints(pointsArray);

		return this;
	};

/*

*/
	obj.finalizeCollisionPoints = function (pointsArray) {

		let cp = this.collisionPoints,
			i, iz, item, pt;

		for (i = 0, iz = pointsArray.length; i < iz; i++) {

			item = pointsArray[i];

			pt = makePoint({
				name: `${this.name}_cp_${item}`,
				pivot: this.name,
				group: this.group
			});

			switch(item){

				case 'ne' :
					cp.push(pt.set({offsetX: 'right', offsetY: 'top'}));
					break;

				case 'n' :
					cp.push(pt.set({offsetX: 'center', offsetY: 'top'}));
					break;

				case 'nw' :
					cp.push(pt.set({offsetX: 'left', offsetY: 'top'}));
					break;

				case 'w' :
					cp.push(pt.set({offsetX: 'left', offsetY: 'center'}));
					break;

				case 'sw' :
					cp.push(pt.set({offsetX: 'left', offsetY: 'bottom'}));
					break;

				case 's' :
					cp.push(pt.set({offsetX: 'center', offsetY: 'bottom'}));
					break;

				case 'se' :
					cp.push(pt.set({offsetX: 'right', offsetY: 'bottom'}));
					break;

				case 'e' :
					cp.push(pt.set({offsetX: 'right', offsetY: 'center'}));
					break;

				case 'c' :
					cp.push(pt.set({offsetX: 'center', offsetY: 'center'}));
					break;
			}
		}
	};

/*
NEEDS coding up
*/
	obj.getCollisionPointCoordinates = function (host) {

		return false;
	};

/*
CURRENTLY does not support filters on entitys
*/
	obj.simpleStamp = function (host, changes = {}) {

		if (host && host.type === 'Cell') {

			this.currentHost = host;
			
			if (changes) {

				this.set(changes);
				this.prepareStamp();
			}

			return this.regularStampSynchronousActions();
		}

		return false;
	};

/*

*/
	obj.prepareStamp = function() {

		if (this.dirtyDimensions) this.cleanDimensions();
		if (this.dirtyStart) this.cleanStart();
		if (this.dirtyHandle) this.cleanHandle();
		if (this.dirtyOffset || this.dirtyScale || this.pivot) this.cleanOffset();
		if (this.dirtyPathObject) this.cleanPathObject();
		if (this.dirtyPivoted) this.updatePivotSubscribers();
	};

/*

*/
	obj.cleanHandle = function () {

		if (this.localWidth && this.localHeight) {

			this.cleanVectorParameter('currentHandle', this.handle, this.localWidth, this.localHeight);
			this.dirtyHandle = false;
			this.dirtyPathObject = true;
		}
	};

/*

*/
	obj.cleanOffset = function () {

		let dims = this.cleanOffsetHelper();

		this.cleanVectorParameter('currentOffset', this.offset, dims[0], dims[1]);

		this.dirtyOffset = false;
		this.dirtyScale = false;
	};

/*

*/
	obj.cleanStart = function () {

		let host = this.currentHost;

		if (host) {

			this.cleanVectorParameter('currentStart', this.start, host.localWidth, host.localHeight);
			this.dirtyStart = false;
		}
	};

/*

*/
	obj.cleanDimensions = function () {

		let host = this.currentHost,
			w, h;

		if (host) {

			w = this.width;
			h = this.height;

			if (w.substring) this.localWidth = (parseFloat(w) / 100) * host.localWidth;
			else this.localWidth = w;

			if (h.substring) this.localHeight = (parseFloat(h) / 100) * host.localHeight;
			else this.localHeight = h;

			this.dirtyDimensions = false;
		}
	};

/*
EVERY ENTITY FILE will need to define its own .cleanPathObject function
*/
	obj.cleanPathObject = defaultNonReturnFunction;

/*

*/
	obj.stamper = {

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
	};

/*

*/
	obj.stamp = function () {

		if (this.visibility) {

			if (this.filters && this.filters.length) return this.filteredStamp();
			else return this.regularStamp();
		}
		else return Promise.resolve(false);
	};

/*

*/
	obj.filteredStamp = function(){

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

				// this is where we copy over the current canvas to the new canvas using appropriate gco
				hostState.globalCompositeOperation = hostEngine.globalCompositeOperation = 'source-in';
				hostState.globalAlpha = hostEngine.globalAlpha = 1;
				hostEngine.setTransform(1, 0, 0, 1, 0, 0);
				hostEngine.drawImage(oldElement, 0, 0);
			} 

			// at this point we will send the contents of the host canvas over to the web worker, alongside details of the filters we wish to apply to it
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
	obj.regularStamp = function () {

		let self = this;

		return new Promise((resolve) => {

			let result = self.regularStampSynchronousActions();

			resolve(result);
		});
	};

/*

*/
	obj.regularStampSynchronousActions = function () {

		let dest = this.currentHost, 
			engine, x, y;

		if (dest) {

			engine = dest.engine;
			x = this.updateStampX();
			y = this.updateStampY();

			dest.rotateDestination(engine, x, y, this);

			if (!this.fastStamp) dest.setEngine(this);

			this.stamper[this.method](engine, this);

			return true;
		}
		else return false;
	};

/*

*/
	obj.checkHit = function (items = {}) {

		let tests, test, t,
			dest = this.currentHost, 
			i, iz, engine, x, y, tx, ty, result;

		if (dest) {

			tests = (!Array.isArray(items)) ?  [items] : items;

			engine = dest.engine;
			x = this.updateStampX();
			y = this.updateStampY();

			dest.rotateDestination(engine, x, y, this);

			for (i = 0, iz = tests.length; i < iz; i++) {

				t = tests[i];
				test = (Object.prototype.toString.call(t) === '[object Object]') ? t : {};

				tx = test.x || 0;
				ty = test.y || 0;

				result = (this.pathObject) ? 
					engine.isPointInPath(this.pathObject, tx, ty, this.winding) :
					engine.isPointInPath(tx, ty, this.winding);

				if (result) break;
			}

			if (result) {

				return {
					x: tx,
					y: ty,
					artefact: this
				};
			}
		}

		return false;
	};

	return obj;
};
