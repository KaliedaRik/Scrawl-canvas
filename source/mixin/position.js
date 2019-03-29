/*
# Position mixin
*/
import { artefact, group } from '../core/library.js';
import { defaultNonReturnFunction, mergeOver, mergeInto, isa_obj, xt, xta, addStrings, xtGet, pushUnique, removeItem } from '../core/utilities.js';
import { currentCorePosition } from '../core/userInteraction.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the position mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*

*/
		lockXTo: 'start',

/*

*/
		lockYTo: 'start',

/*

*/
		mimic: '',

/*

*/
		start: {},

/*

*/
		currentStart: {},

/*

*/
		handle: {},

/*

*/
		currentHandle: {},

/*

*/
		offset: {},

/*

*/
		currentOffset: {},

/*

*/
		dragOffset: {},

/*

*/
		pivot: '',

/*

*/
		pivoted: {},

/*

*/
		addPivotHandle: false,

/*

*/
		rotateOnPivot: false,

/*

*/
		roll: 0,

/*

*/
		pathRoll: 0,

/*

*/
		addPathRoll: false,

/*

*/
		visibility: true,

/*

*/
		order: 0,

/*

*/
		width: 0,

/*

*/
		height: 0,

/*

*/
		scale: 1,

/*

*/
		delta: {},
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
	G.startX = function () {

		this.checkVector('start');
		return this.start.x;
	};

/*

*/
	G.startY = function () {

		this.checkVector('start');
		return this.start.y;
	};

/*

*/
	G.handleX = function () {

		this.checkVector('handle');
		return this.handle.x;
	};
	
/*

*/
	G.handleY = function () {

		this.checkVector('handle');
		return this.handle.y;
	};

/*

*/
	G.offsetX = function () {

		this.checkVector('offset');
		return this.offset.x;
	};

/*

*/
	G.offsetY = function () {

		this.checkVector('offset');
		return this.offset.y;
	};

/*

*/
	G.dragOffsetX = function () {

		this.checkVector('dragOffset');
		return this.dragOffset.x;
	};

/*

*/
	G.dragOffsetY = function () {

		this.checkVector('dragOffset');
		return this.dragOffset.y;
	};

/*

*/
	S.startX = function (item) {

		this.checkVector('start');
		this.start.x = item;
		this.dirtyStart = true;
	};

/*

*/
	S.startY = function (item) {

		this.checkVector('start');
		this.start.y = item;
		this.dirtyStart = true;
	};

/*

*/
	S.start = function (item = {}) {

		this.checkVector('start');
		this.start.x = (xt(item.x)) ? item.x : this.start.x;
		this.start.y = (xt(item.y)) ? item.y : this.start.y;
		this.dirtyStart = true;
	};

/*

*/
	S.handleX = function (item) {

		this.checkVector('handle');
		this.handle.x = item;
		this.dirtyHandle = true;
	};

/*

*/
	S.handleY = function (item) {

		this.checkVector('handle');
		this.handle.y = item;
		this.dirtyHandle = true;
	};

/*

*/
	S.handle = function (item = {}) {

		this.checkVector('handle');
		this.handle.x = (xt(item.x)) ? item.x : this.handle.x;
		this.handle.y = (xt(item.y)) ? item.y : this.handle.y;
		this.dirtyHandle = true;
	};

/*

*/
	S.pivot = function (item) {

		let p;

		if (this.pivot !== item) {

			if (this.pivot) {

				p = artefact[this.pivot];
				if (p) {

					if( !p.pivoted) p.pivoted = [];
					removeItem(p.pivoted, this.name);
				}
			}
			if (item) {

				p = artefact[item];
				if (p) {

					if (!p.pivoted) p.pivoted = [];
					pushUnique(p.pivoted, this.name);
				}
			}
		}
		this.pivot = item
	};

/*

*/
	S.offsetX = function (item) {

		this.checkVector('offset');
		this.offset.x = item;
		this.dirtyOffset = true;
	};

/*

*/
	S.offsetY = function (item) {

		this.checkVector('offset');
		this.offset.y = item;
		this.dirtyOffset = true;
	};

/*

*/
	S.offset = function (item = {}) {

		this.checkVector('offset');
		this.offset.x = (xt(item.x)) ? item.x : this.offset.x;
		this.offset.y = (xt(item.y)) ? item.y : this.offset.y;
		this.dirtyVelocity = true;
		this.dirtyOffset = true;
	};

/*

*/
	S.dragOffsetX = defaultNonReturnFunction;
	S.dragOffsetY = defaultNonReturnFunction;
	S.dragOffset = defaultNonReturnFunction;

/*

*/
	S.width = function (item) {

		this.width = item;
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.height = function (item) {

		this.height = item;
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.lockTo = function (item) {

		this.lockXTo = item;
		this.lockYTo = item;
	};

/*

*/
	S.roll = function (item) {

		this.roll = item;
		this.dirtyRotation = true;
	};

/*

*/
	S.scale = function (item) {

		this.scale = item;
		this.dirtyScale = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.delta = function (item) {

		// overwrites the old delta object with a new one
		this.delta = isa_obj(item) ? item : {};
	};

/*

*/
	S.mimic = function (item) {

		if (item && artefact[item]) this.mimic = item;
		else this.mimic = '';
	};

/*

*/
	D.startX = function (item) {

		this.checkVector('start');
		this.start.x = addStrings(this.start.x, item);
		this.dirtyStart = true;
	};

/*

*/
	D.startY = function (item) {

		this.checkVector('start');
		this.start.y = addStrings(this.start.y, item);
		this.dirtyStart = true;
	};

/*

*/
	D.start = function (item = {}) {

		this.checkVector('start');
		this.start.x = (xt(item.x)) ? addStrings(this.start.x, item) : this.start.x;
		this.start.y = (xt(item.y)) ? addStrings(this.start.y, item) : this.start.y;
		this.dirtyVelocity = true;
	};

/*

*/
	D.handleX = function (item) {

		this.checkVector('handle');
		this.handle.x = addStrings(this.handle.x, item);
		this.dirtyHandle = true;
	};

/*

*/
	D.handleY = function (item) {

		this.checkVector('handle');
		this.handle.y = addStrings(this.handle.y, item);
		this.dirtyHandle = true;
	};

/*

*/
	D.handle = function (item = {}) {

		this.checkVector('handle');
		this.handle.x = (xt(item.x)) ? addStrings(this.handle.x, item) : this.handle.x;
		this.handle.y = (xt(item.y)) ? addStrings(this.handle.y, item) : this.handle.y;
		this.dirtyVelocity = true;
	};

/*

*/
	D.offsetX = function (item) {

		this.checkVector('offset');
		this.offset.x = addStrings(this.offset.x, item);
		this.dirtyOffset = true;
	};

/*

*/
	D.offsetY = function (item) {

		this.checkVector('offset');
		this.offset.y = addStrings(this.offset.y, item);
		this.dirtyOffset = true;
	};

/*

*/
	D.offset = function (item = {}) {

		this.checkVector('offset');
		this.offset.x = (xt(item.x)) ? addStrings(this.offset.x, item) : this.offset.x;
		this.offset.y = (xt(item.y)) ? addStrings(this.offset.y, item) : this.offset.y;
		this.dirtyOffset = true;
		this.dirtyVelocity = true;
	};

/*

*/
	D.dragOffsetX = defaultNonReturnFunction;
	D.dragOffsetY = defaultNonReturnFunction;
	D.dragOffset = defaultNonReturnFunction;

/*

*/
	D.width = function (item) {

		this.width = addStrings(this.width, item);
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.height = function (item) {

		this.height = addStrings(this.height, item);
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.roll = function (item) {

		this.roll += item;
		this.dirtyRotation = true;
	};

/*

*/
	D.scale = function (item) {

		this.scale += item;
		this.dirtyScale = true;
		this.dirtyPivoted = true;
	};

/*
## Define functions to be added to the factory prototype
*/

/*

*/
	obj.setDeltaValues = function (items, method) {

		method = (method.substring) ? method.toLowerCase() : 'replace';
		items = isa_obj(items) ? items : {};

		let i, iz, keys, key, item, d;

		switch (method) {

			case 'into' :
				// merges new data __into__ the old data - new attributes added, old attributes unchanged
				this.delta = mergeInto(this.delta, items);
				break;

			case 'over' :
				// merges new data __over__ the old data - new attributes added, old attributes overwritten
				this.delta = mergeOver(this.delta, items);
				break;

			case 'reverse' :
				// iterates through argument object, which contains key:true values, reversing the sign on those key attributes
				keys = Object.keys(items);

				for (i = 0, iz = keys.length; i < iz; i++) {

					key = keys[i];
					item = this.delta[key];

					if (items[key] && xt(item)) {

						if (item.substring) this.delta[key] = -(parseFloat(item)) + '%';
						else this.delta[key] = -item;
					}
				}
				break;

			case 'replace' :
				// overwrites the old delta object with a new one
				this.delta = items;
				break;
		}
	};

/*

*/
	obj.updateByDelta = function () {

		if (this.delta) this.setDelta(this.delta);
		return this;
	};

/*

*/
	obj.reverseByDelta = function () {

		let temp, keys, key, i, iz, d, item;

		if (this.delta) {

			d = this.delta;
			temp = {};
			keys = Object.keys(d);
			
			for (i = 0, iz = keys.length; i < iz; i++) {

				key = keys[i];
				item = d[key];

				if (item.substring) item = -(parseFloat(item)) + '%';
				else item = -item;

				temp[key] = item;
			}
			this.setDelta(temp);
		}
		return this;
	};

/*

*/
	obj.cleanVectorParameter = function (currentLabel, external, width, height) {

		let dim, def, current;

		let getResult = {
			left: () => 0,
			top: () => 0,
			right: () => dim,
			bottom: () => dim,
			center: () => dim / 2,
			percent: () => (parseFloat(def) / 100) * dim
		};

		if (xta(currentLabel, external, width, height)) {

			this.checkVector(currentLabel);
			current = this[currentLabel];

			def = xtGet(external.x, false);

			if (def.toFixed) current.x = def;
			else if (def.substring) {

				dim = width;

				if (getResult[def]) current.x = getResult[def]();
				else current.x = getResult.percent();
			}

			def = xtGet(external.y, false);

			if (def.toFixed) current.y = def;
			else if (def.substring){

				dim = height;

				if (getResult[def]) current.y = getResult[def]();
				else current.y = getResult.percent();
			}
		}
	};

/*

*/
	obj.cleanHandle = function () {

		this.cleanVectorParameter('currentHandle', this.handle, this.localWidth, this.localHeight);
	};

/*

*/
	obj.cleanStart = function () {

		let here = this.getHere();

		if (here) this.cleanVectorParameter('currentStart', this.start, here.w, here.h);
	};

/*

*/
	obj.updatePivotSubscribers = function () {

		let p = this.pivoted,
			i, iz, item;

		if (p && p.length) {

			for (i = 0, iz = p.length; i < iz; i++) {

				item = artefact[p[i]];

				if (item) item.dirtyOffset = true;
			}
		}
		this.dirtyPivoted = false;
	};

/*

*/
	obj.cleanOffsetHelper = function () {

		let w, h,
			pivot = this.pivot;

		w = this.localWidth;
		h = this.localHeight;

		if (pivot) {

			pivot = artefact[pivot];
			
			if (pivot) {

				if (pivot.dirtyDimensions) pivot.cleanDimensions();

				w = (pivot.localWidth || parseFloat(pivot.width) || 0) * pivot.scale;
				h = (pivot.localHeight || parseFloat(pivot.height) || 0) * pivot.scale;
			}
		}
		return [w, h];
	};

/*

*/
	obj.getHere = function () {

		return (this.currentHost && this.currentHost.here) ? this.currentHost.here : currentCorePosition;
	};

/*

*/
	obj.getStart = function () {

		return {
			x: this.currentStart.x, 
			y: this.currentStart.y
		};
	};

/*

*/
	obj.updateStampX = function () {

		let lock = this.lockXTo,
			cs = this.currentStart,
			ct = this.currentOffset,
			dt = this.dragOffset,
			pivot, here, host,
			z = cs.x;

		if (lock !== 'start') {

			switch (lock) {

				case 'pivot' :
					if (this.pivot) {

						pivot = artefact[this.pivot];

						if (pivot) z = pivot.stampX;
					}
					break;

				case 'path' :
					break;

				case 'mouse' :
					host = this.currentHost || this.destination || false;

					if (host) {

						here = host.here;

						if (here) {

							z = here.x;

							if (this.localDrag) {

								this.oldX = z;
								z += dt.x;
							}
						}
					}
					break;
			}
		}

		this.stampX = z;
		return z + ct.x;
	};

/*

*/
	obj.updateStampY = function () {

		let lock = this.lockYTo,
			cs = this.currentStart,
			ct = this.currentOffset,
			dt = this.dragOffset,
			pivot, here, host,
			z = cs.y;

		if (lock !== 'start') {

			switch (lock) {

				case 'pivot' :
					if (this.pivot) {

						pivot = artefact[this.pivot];
						
						if (pivot) z = pivot.stampY;
					}
					break;

				case 'path' :
					break;

				case 'mouse' :
					host = this.currentHost || this.destination || false;

					if (host) {

						here = host.here;

						if (here) {

							z = here.y;

							if (this.localDrag) {

								this.oldY = z;
								z += dt.y;
							}
						}
					}
					break;
			}
		}

		this.stampY = z;
		return z + ct.y;
	};

/*

*/
	obj.pickupArtefact = function (items = {}) {

		this.oldLockXTo = this.lockXTo;
		this.oldLockYTo = this.lockYTo;
		this.lockXTo = 'mouse';
		this.lockYTo = 'mouse';

		this.checkVector('dragOffset');
		this.oldDragOffsetX = this.dragOffset.x;
		this.oldDragOffsetY = this.dragOffset.y;
		this.dragOffset.x = this.currentStart.x - items.x;
		this.dragOffset.y = this.currentStart.y - items.y;

		this.localDrag = true;
		this.order += 9999;

		if (isa_obj(this.group)) this.group.batchResort = true;
		else if (group[this.group]) group[this.group].batchResort = true;

		if (xt(this.dirtyPathObject)) this.dirtyPathObject = true;

		return this;
	};

/*

*/
	obj.dropArtefact = function () {

		this.start.x = this.oldX + this.dragOffset.x;
		this.start.y = this.oldY + this.dragOffset.y;
		delete this.oldX;
		delete this.oldY;

		this.dirtyStart = true;
		this.lockXTo = this.oldLockXTo;
		this.lockYTo = this.oldLockYTo;
		delete this.oldLockXTo;
		delete this.oldLockYTo;

		this.dragOffset.x = this.oldDragOffsetX;
		this.dragOffset.y = this.oldDragOffsetY;
		delete this.oldDragOffsetX;
		delete this.oldDragOffsetY;

		this.localDrag = false;
		this.order = (this.order >= 9999) ? this.order - 9999 : 0;

		if (isa_obj(this.group)) this.group.batchResort = true;
		else if (group[this.group]) group[this.group].batchResort = true;

		if (xt(this.dirtyPathObject)) this.dirtyPathObject = true;

		return this;
	};

	return obj;
};
