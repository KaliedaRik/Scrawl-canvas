/*
# Position mixin
*/
import { artefact, group } from '../core/library.js';
import { defaultNonReturnFunction, mergeOver, mergeInto, isa_obj, xt, xta, addStrings, xtGet, pushUnique, removeItem } from '../core/utilities.js';
import { currentCorePosition } from '../core/userInteraction.js';

export default function (P = {}) {

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
		mimicPaddingWidth: 0,
		mimicPaddingHeight: 0,
		localMimicPaddingWidth: 0,
		localMimicPaddingHeight: 0,

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
		path: '',

/*

*/
		pathPosition: 0,

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
	P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = P.getters,
		S = P.setters,
		D = P.deltaSetters;

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
	S.mimicPadding = function (item) {

		this.mimicPaddingWidth = item;
		this.mimicPaddingHeight = item;
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.mimicPaddingWidth = function (item) {

		this.mimicPaddingWidth = item;
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.mimicPaddingHeight = function (item) {

		this.mimicPaddingHeight = item;
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
Overwrites the old delta object with a new one, thus no practical way of resetting a subset of existing attributes in the delta object with new values
*/
	S.delta = function (item) {

		this.delta = isa_obj(item) ? item : {};
	};

/*

*/
	// S.mimic = function (item) {

	// 	if (item && artefact[item]) this.mimic = item;
	// 	else this.mimic = '';
	// };

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
		this.dirtyStart = true;
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
		this.dirtyHandle = true;
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
	D.mimicPadding = function (item) {

		let d = addStrings(this.mimicPadding, item);

		this.mimicPaddingWidth = d;
		this.mimicPaddingHeight = d;
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.mimicPaddingWidth = function (item) {

		this.mimicPaddingWidth = addStrings(this.mimicPadding, item);
		this.dirtyDimensions = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.mimicPaddingHeight = function (item) {

		this.mimicPaddingHeight = addStrings(this.mimicPadding, item);
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
	P.setDeltaValues = function (items, method) {

		method = (method.substring) ? method.toLowerCase() : 'replace';
		items = isa_obj(items) ? items : {};

		let delta = this.delta;

		switch (method) {

			case 'into' :
				// Merges new data __into__ the old data - new attributes added, old attributes unchanged
				delta = mergeInto(delta, items);
				break;

			case 'over' :
				// Merges new data __over__ the old data - new attributes added, old attributes overwritten
				delta = mergeOver(delta, items);
				break;

			case 'reverse' :
				// Iterates through argument object, which contains key:true values, reversing the sign on those key attributes
				let keys = Object.keys(items);

				keys.forEach(key => {

					let item = delta[key];

					if (items[key] && xt(item)) {

						if (item.substring) delta[key] = -(parseFloat(item)) + '%';
						else delta[key] = -item;
					}
				});
				break;

			case 'replace' :
				// Overwrites the old delta object with a new one
				delta = items;
				break;
		}
	};

/*

*/
	P.updateByDelta = function () {

		if (this.delta) this.setDelta(this.delta);
		return this;
	};

/*

*/
	P.reverseByDelta = function () {

		let temp, keys, key, i, iz, d, item;

		if (this.delta) {

			let delta = this.delta,
				temp = {},
				keys = Object.keys(delta);
			
			keys.forEach(key => {

				let item = delta[key];

				if (item.substring) item = -(parseFloat(item)) + '%';
				else item = -item;

				temp[key] = item;
			});

			this.setDelta(temp);
		}
		return this;
	};

/*

*/
	P.cleanVectorParameter = function (currentLabel, external, width, height) {

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
	P.cleanHandle = function () {

		this.cleanVectorParameter('currentHandle', this.handle, this.localWidth, this.localHeight);
	};

/*

*/
	P.cleanStart = function () {

		let here = this.getHere();

		if (here) this.cleanVectorParameter('currentStart', this.start, here.w, here.h);
	};

/*

*/
	P.updatePivotSubscribers = function () {

		this.dirtyPivoted = false;

		let pivoted = this.pivoted;

		if (pivoted && pivoted.length) {

			pivoted.forEach(name => {

				item = artefact[name];

				if (item) item.dirtyOffset = true;
			});
		}
	};

/*

*/
	P.cleanOffsetHelper = function () {

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
	P.getHere = function () {

		return (this.currentHost && this.currentHost.here) ? this.currentHost.here : currentCorePosition;
	};

/*

*/
	P.getStart = function () {

		return {
			x: this.currentStart.x, 
			y: this.currentStart.y
		};
	};

/*

*/
	P.getPathData = function () {

		let pathPos = this.pathPosition;

		if (this.currentPathData && this.currentPathPosition === pathPos) return this.currentPathData;
		else {

			let path = this.path;

			if (path && path.substring) {

				path = this.path = artefact[this.path];

				if (path.type === 'Shape' && path.useAsPath) path.subscribers.push(this.name);
				else {

					path = this.path = false;
				}
			}
			if (path) {

				this.currentPathData = path.getPathPositionData(pathPos);
				this.currentPathPosition = pathPos;
				return this.currentPathData;
			}
		}
		return false;
	};

/*

*/
	P.updateStampX = function () {

		let lock = this.lockXTo,
			cs = this.currentStart,
			ct = this.currentOffset,
			dt = this.dragOffset,
			pivot, path, pathData, here, host,
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
					if (this.path) {

						pathData = this.getPathData();

						if (pathData) z = pathData.x;
					}
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
	P.updateStampY = function () {

		let lock = this.lockYTo,
			cs = this.currentStart,
			ct = this.currentOffset,
			dt = this.dragOffset,
			pivot, path, pathData, here, host,
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
					if (this.path) {

						pathData = this.getPathData();

						if (pathData) z = pathData.y;
					}
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
	P.prepareMimicStamp = function () {

		let mimic = artefact[this.mimic];

		if (mimic) {

			this.mimicType = mimic.type;

			if (this.position !== mimic.position) this.prepareMimicStampPosition(mimic);

			if (this.localWidth !== mimic.localWidth || this.localHeight !== mimic.localHeight) this.prepareMimicStampDimensions(mimic);

			if (this.roll !== mimic.roll || this.pitch !== mimic.pitch || this.yaw !== mimic.yaw) this.prepareMimicStampRotation(mimic);

			if (this.scale !== mimic.scale) this.prepareMimicStampScale(mimic);

			this.prepareMimicStampStart(mimic);
		}
		else this.mimicType = '';
	};

/*

*/
	P.prepareMimicStampPosition = function (mimic) {

		if (xt(mimic.position)) {

			this.position = mimic.position;
			this.dirtyPosition = true;
			this.setPosition();
		}
	};

/*

*/
	P.prepareMimicStampScale = function (mimic) {

		if (xt(mimic.scale)) {

			this.localScale = this.scale;
			this.scale = mimic.scale;
		}
	};

/*

*/
	P.prepareMimicStampDimensions = function (mimic) {

		let updatedWidth, updatedHeight;

		if (xt(mimic.localWidth)) {

			updatedWidth = mimic.localWidth;

			this.width = updatedWidth;
			this.localWidth = updatedWidth;
		}

		if (xt(mimic.localHeight)) {

			updatedHeight = mimic.localHeight;

			this.height = updatedHeight;
			this.localHeight = updatedHeight;
		}

		if (mimic.type !== 'Phrase') this.dirtyDimensions = true;
	};

/*

*/
	P.prepareMimicStampRotation = function (mimic) {

		if (xt(mimic.roll)) this.roll = mimic.roll;
		if (xt(mimic.pitch)) this.pitch = mimic.pitch;
		if (xt(mimic.yaw)) this.yaw = mimic.yaw;

		if (xt(this.dirtyRotation)) {

			this.dirtyRotationActive = true;
			this.dirtyRotation = true;
			this.cleanRotation();
		}
	};

/*

*/
	P.prepareMimicStampStart = function (mimic) {

		if (xt(mimic.start) && mimic.start.type === 'Vector'){

			this.start.x = mimic.start.x;
			this.start.y = mimic.start.y;
			this.dirtyStart = true;
		}

		if (xt(mimic.handle) && mimic.handle.type === 'Vector'){

			this.handle.x = mimic.handle.x;
			this.handle.y = mimic.handle.y;
			this.dirtyHandle = true;
		}

		if (xt(mimic.flipUpend)) this.flipUpend = mimic.flipUpend;
		if (xt(mimic.flipReverse)) this.flipReverse = mimic.flipReverse;

		if (xt(mimic.lockXTo)) this.lockXTo = mimic.lockXTo;
		if (xt(mimic.lockXTo)) this.lockYTo = mimic.lockYTo;
	};

/*

/*

*/
	P.pickupArtefact = function (items = {}) {

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
	P.dropArtefact = function () {

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

	return P;
};
