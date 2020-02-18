/*
# Loom factory
*/
import { constructors, group, artefact } from '../core/library.js';
import { defaultNonReturnFunction, defaultFalseReturnFunction, mergeOver, xt, xta, addStrings, pushUnique, mergeDiscard } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makeAnchor } from '../factory/anchor.js';
import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from '../factory/filter.js';

import baseMix from '../mixin/base.js';
import filterMix from '../mixin/filter.js';


/*
## Loom constructor
*/
const Loom = function (items = {}) {

	this.makeName(items.name);
	this.register();

	this.set(this.defs);

	this.state = makeState();

	if (!items.group) items.group = currentGroup;

	this.onEnter = defaultNonReturnFunction;
	this.onLeave = defaultNonReturnFunction;
	this.onDown = defaultNonReturnFunction;
	this.onUp = defaultNonReturnFunction;

	this.delta = {};

	this.set(items);

	this.output = document.createElement('img');

	return this;
};


/*
## Loom object prototype setup
*/
let P = Loom.prototype = Object.create(Object.prototype);
P.type = 'Loom';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = filterMix(P);


/*
## Define default attributes
*/
let defaultAttributes = {

/*
Position defaults used by Loom
*/
	visibility: true,
	order: 0,
	delta: null,
	host: null,
	group: null,
	anchor: null,
	collides: false,
	sensorSpacing: 50,

	noCanvasEngineUpdates: false,
	noDeltaUpdates: false,
	noFilters: false,
/*
Entity defaults used by Loom
*/
	onEnter: null,
	onLeave: null,
	onDown: null,
	onUp: null,

	method: 'fill',


/*
A loom uses 2 Shape paths to construct a frame between which the image will be redrawn
*/
	fromPath: null,
	toPath: null,

/*
A loom can set the start and end points on each of its paths, between which the image will be drawn. These can be animated to allow the image to 'flow' between one part of the display and another, changing its shape as it moves
*/
	fromPathStart: 0,
	fromPathEnd: 1,

	toPathStart: 0,
	toPathEnd: 1,

	synchronizePathCursors: true,
	loopPathCursors: true,

/*
Copying the source image to the output happens, by default, by rows. To change this to columns set the 'isHorizontalCopy' attribute to false 
*/
	isHorizontalCopy: true,

/*
Mainly for library development/testing work - shows the loom entity's bounding box - which is calculated from the 
*/
	showBoundingBox: false,
	boundingBoxColor: '#000000',

/*
The Picture entity source for this loom. For initialization and/or set, we can supply either the Picture entity itself, or its string name attribute
*/
	source: null,

/*
Internal attribute - cannot be instantiated or set
*/
	output: null,
	targetImage: null,

/**
The current Frame drawing process often leads to moire interference patterns appearing in the resulting image. Scrawl uses resizing to blur out these patterns. 

The interferenceFactor attribute sets the resizing ratio; while he interferenceLoops attribute sets the number of times the image gets resized. 

If patterns still appear in the final image, tweak these values to see if a better output can be achieved
**/
	interferenceLoops: 2,
	interferenceFactor: 1.03,
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/
S.fromPath = function (item) {

	if (item) {

		let oldPath = this.fromPath,
			newPath = (item.substring) ? artefact[item] : item,
			name = this.name;

		if (newPath && newPath.name && newPath.useAsPath) {

			if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);

			pushUnique(newPath.pathed, name);

			this.fromPath = newPath;

			this.dirtyStart = true;
		}
	}
};

S.toPath = function (item) {

	if (item) {

		let oldPath = this.toPath,
			newPath = (item.substring) ? artefact[item] : item,
			name = this.name;

		if (newPath && newPath.name && newPath.useAsPath) {

			if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);

			pushUnique(newPath.pathed, name);

			this.toPath = newPath;

			this.dirtyStart = true;
		}
	}
};

/*

*/
S.source = function (item) {

	item = (item.substring) ? artefact[item] : item;

	if (item && item.type === 'Picture') {

		this.source = item;
		this.dirtyOutput = true;
	}
};

S.output = defaultNonReturnFunction;
S.targetImage = defaultNonReturnFunction;

/*

*/
S.isHorizontalCopy = function (item) {

	this.isHorizontalCopy = (item) ? true : false;
	this.dirtyStart = true;
	this.dirtyOutput = true;
};

/*

*/
S.synchronizePathCursors = function (item) {

	this.synchronizePathCursors = (item) ? true : false;

	if (item) {

		this.toPathStart = this.fromPathStart;
		this.toPathEnd = this.fromPathEnd;
	}

	this.dirtyOutput = true;
};

/*

*/
S.loopPathCursors = function (item) {

	this.loopPathCursors = (item) ? true : false;

	if (item) {

		let c,
			floor = Math.floor;

		c = this.fromPathStart
		if (c < 0 || c > 1) this.fromPathStart = c - floor(c);

		c = this.fromPathEnd
		if (c < 0 || c > 1) this.fromPathEnd = c - floor(c);

		c = this.toPathStart
		if (c < 0 || c > 1) this.toPathStart = c - floor(c);

		c = this.toPathEnd
		if (c < 0 || c > 1) this.toPathEnd = c - floor(c);
	}

	this.dirtyOutput = true;
};

/*

*/
S.fromPathStart = function (item) {

	if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
	this.fromPathStart = item;
	if (this.synchronizePathCursors) this.toPathStart = item;
	this.dirtyOutput = true;
};
S.fromPathEnd = function (item) {

	if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
	this.fromPathEnd = item;
	if (this.synchronizePathCursors) this.toPathEnd = item;
	this.dirtyOutput = true;
};
S.toPathStart = function (item) {

	if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
	this.toPathStart = item;
	if (this.synchronizePathCursors) this.fromPathStart = item;
	this.dirtyOutput = true;
};
S.toPathEnd = function (item) {

	if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
	this.toPathEnd = item;
	if (this.synchronizePathCursors) this.fromPathEnd = item;
	this.dirtyOutput = true;
};
D.fromPathStart = function (item) {

	let val = this.fromPathStart += item;

	if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
	this.fromPathStart = val;
	if (this.synchronizePathCursors) this.toPathStart = val;
	this.dirtyOutput = true;
};
D.fromPathEnd = function (item) {

	let val = this.fromPathEnd += item;

	if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
	this.fromPathEnd = val;
	if (this.synchronizePathCursors) this.toPathEnd = val;
	this.dirtyOutput = true;
};
D.toPathStart = function (item) {

	let val = this.toPathStart += item;

	if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
	this.toPathStart = val;
	if (this.synchronizePathCursors) this.fromPathStart = val;
	this.dirtyOutput = true;
};
D.toPathEnd = function (item) {

	let val = this.toPathEnd += item;

	if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
	this.toPathEnd = val;
	if (this.synchronizePathCursors) this.fromPathEnd = val;
	this.dirtyOutput = true;
};


/*
Copied from position mixin
*/
S.delta = function (items = {}) {

	if (items) this.delta = mergeDiscard(this.delta, items);
};

G.anchorDescription = function () {

	if (this.anchor) return this.anchor.get('description');
	return '';
};
G.anchorType = function () {

	if (this.anchor) return this.anchor.get('type');
	return '';
};
G.anchorTarget = function () {

	if (this.anchor) return this.anchor.get('target');
	return '';
};
G.anchorRel = function () {

	if (this.anchor) return this.anchor.get('rel');
	return '';
};
G.anchorReferrerPolicy = function () {

	if (this.anchor) return this.anchor.get('referrerpolicy');
	return '';
};
G.anchorPing = function () {

	if (this.anchor) return this.anchor.get('ping');
	return '';
};
G.anchorHreflang = function () {

	if (this.anchor) return this.anchor.get('hreflang');
	return '';
};
G.anchorHref = function () {

	if (this.anchor) return this.anchor.get('href');
	return '';
};
G.anchorDownload = function () {

	if (this.anchor) return this.anchor.get('download');
	return '';
};

S.anchorDescription = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.description(item);
};
S.anchorType = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.anchorType(item);
};
S.anchorTarget = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.target(item);
};
S.anchorRel = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.rel(item);
};
S.anchorReferrerPolicy = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.referrerpolicy(item);
};
S.anchorPing = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.ping(item);
};
S.anchorHreflang = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.hreflang(item);
};
S.anchorHref = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.href(item);
};
S.anchorDownload = function (item) {

	if (!this.anchor) this.buildAnchor(items);
	if (this.anchor) this.anchor.setters.download(item);
};

S.anchor = function (items = {}) {

	if (!this.anchor) this.buildAnchor(items);
	else this.anchor.set(items);
};

S.sensorSpacing = function (val) {

	this.sensorSpacing = val;
	this.dirtyCollision = true;
};

D.sensorSpacing = function (val) {

	this.sensorSpacing += val;
	this.dirtyCollision = true;
};

/*
Overrides (possibly) position mixin functionalities
*/
S.host = function (item) {

	if (item) {

		let host = artefact[item];

		if (host && host.here) this.host = host.name;
		else this.host = item;
	}
	else this.host = '';
};

S.group = function (item) {

	let g;

	if (item) {

		if (this.group && this.group.type === 'Group') this.group.removeArtefacts(this.name);

		if (item.substring) {

			g = group[item];

			if (g) this.group = g;
			else this.group = item;
		}
		else this.group = item;
	}

	if (this.group && this.group.type === 'Group') this.group.addArtefacts(this.name);
};

P.getBasicData = function () {

	return {
		w: this.boundingBox[2],
		h: this.boundingBox[3],

		roll: 0,
		scale: 1,
		visibility: this.visibility,

		x: this.boundingBox[0],
		y: this.boundingBox[1],
		startX: this.boundingBox[0],
		startY: this.boundingBox[1],
		offsetX: 0,
		offsetY: 0,
		handleX: 0,
		handleY: 0,

		pivot: false,
		path: false,
		mimic: false,

		fromPath: (this.fromPath) ? this.fromPath.name : false,
		toPath: (this.toPath) ? this.toPath.name : false,

		lockX: 'start',
		lockY: 'start',
		isBeingDragged: false
	}
};

P.getHost = function () {

	if (this.currentHost) return this.currentHost;
	else if (this.host) {

		let host = artefact[this.host];

		if (host) {

			this.currentHost = host;
			this.dirtyHost = true;
			return this.currentHost;
		}
	}
	return currentCorePosition;
};

P.getHere = function () {

	return currentCorePosition;
};

P.cleanCollisionData = function () {

	return [0, []];
};

P.getSensors = function () {

	return [];
}

P.checkHit = function (items = [], mycell) {

	if (this.noUserInteraction) return false;

	let tests = (!Array.isArray(items)) ?  [items] : items,
		testData, tx, ty, cx, cy, index;

	if (this.targetImage) testData = this.targetImage.data;

	let [x, y, w, h] = this.getBoundingBox();

	if (tests.some(test => {

		if (Array.isArray(test)) {

			tx = test[0];
			ty = test[1];
		}
		else if (xta(test, test.x, test.y)) {

			tx = test.x;
			ty = test.y;
		}
		else return false;

		if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;

		cx = tx - x;
		cy = ty - y;

		if (cx < 0 || cx > w || cy < 0 || cy > h) return false; 

		// Only get the test image when we really, really have to (and do it only once for this test cycle)
		if (this.dirtyTestImage) this.cleanOutput(true);

		index = (((cy * w) + cx) * 4) + 3;

		if (testData) return (testData[index] > 0) ? true : false;
		else return false;

	}, this)) {

		return {
			x: tx,
			y: ty,
			artefact: this
		};
	}
	return false;
};

P.buildAnchor = function (items = {}) {

	if (this.anchor) this.anchor.demolish();

	if (!items.name) items.name = `${this.name}-anchor`;
	if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;

	this.anchor = makeAnchor(items);
};

P.rebuildAnchor = function () {

	if (this.anchor) this.anchor.build();
};

P.demolishAnchor = function () {

	if (this.anchor) this.anchor.demolish();
};

P.clickAnchor = function () {

	if (this.anchor) this.anchor.click();
};


/*
Copied from entity mixin (will change)
*/
G.group = function () {

	return (this.group) ? this.group.name : '';
};

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

P.updateByDelta = function () {

	this.setDelta(this.delta);

	return this;
};

P.reverseByDelta = function () {

	let temp = {};
	
	Object.entries(this.delta).forEach(([key, val]) => {

		if (val.substring) val = -(parseFloat(val)) + '%';
		else val = -val;

		temp[key] = val;
	});

	this.setDelta(temp);

	return this;
};

P.setDeltaValues = function (items = {}) {

	let delta = this.delta, 
		oldVal, action;

	Object.entries(items).forEach(([key, requirement]) => {

		if (xt(delta[key])) {

			action = requirement;

			oldVal = delta[key];

			switch (action) {

				case 'reverse' :
					if (oldVal.toFixed) delta[key] = -oldVal;
					// TODO: reverse String% (and em, etc) values
					break;

				case 'zero' :
					if (oldVal.toFixed) delta[key] = 0;
					// TODO: zero String% (and em, etc) values
					break;

				case 'add' :
					break;

				case 'subtract' :
					break;

				case 'multiply' :
					break;

				case 'divide' :
					break;
			}
		}
	})
	return this;
};

P.midInitActions = defaultNonReturnFunction;
P.preCloneActions = defaultNonReturnFunction;
P.postCloneActions = defaultNonReturnFunction;

P.clone = defaultFalseReturnFunction;

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

P.prepareStamp = function() {

	if (this.dirtyStart) this.getBoundingBox();
	
	if (this.dirtyFilters) {

		this.cleanFilters();
		this.dirtyOutput = true;
	}
	
	if (this.dirtyOutput) this.cleanOutput();
};

P.cleanPathObject = function () {};

P.cleanOutput = function (saveHitImage = false) {

	let sourceImage = this.source;

	if (sourceImage && sourceImage.type === 'Picture') {

		let fPath = this.fromPath,
			tPath = this.toPath;

		if(fPath && fPath.getBoundingBox && tPath && tPath.getBoundingBox) {

			this.dirtyOutput = false;

			// Gather data to set the OUTPUT cell dimensions, and the output start coordinates
			let [X, Y, outputWidth, outputHeight] = this.getBoundingBox();

			// Gather data to set the SOURCE cell dimensions 
			let fPathLength = fPath.length,
				fPathStart = this.fromPathStart,
				fPathEnd = this.fromPathEnd,

				tPathLength = tPath.length,
				tPathStart = this.toPathStart,
				tPathEnd = this.toPathEnd,

				sourceDimension = Math.max(fPathLength, tPathLength),

				isHorizontalCopy = this.isHorizontalCopy,

				sourceWidth = (isHorizontalCopy) ? outputWidth : sourceDimension, 
				sourceHeight = (isHorizontalCopy) ? sourceDimension : outputHeight;

			// Use two pool cells for this work
			let sourceCell = requestCell(),
				sourceEngine = sourceCell.engine,
				sourceCanvas = sourceCell.element;

			sourceCanvas.width = sourceWidth;
			sourceCanvas.height = sourceHeight;

			let outputCell = requestCell(),
				outputEngine = outputCell.engine,
				outputCanvas = outputCell.element;

			outputCanvas.width = outputWidth;
			outputCanvas.height = outputHeight;

			const cleanup = () => {

				// output result to loom's output, stored in an &lt;img> element
				this.output.src = outputCanvas.toDataURL();

				this.dirtyTestImage = true;
				if (saveHitImage) {

					this.dirtyTestImage = false;
					this.targetImage = outputEngine.getImageData(0, 0, outputWidth, outputHeight);
				}

				// Release the hounds!
				releaseCell(sourceCell);
				releaseCell(outputCell);
			};

			// Copy image into source cell
			sourceImage.simpleStamp(sourceCell, {
				startX: 0,
				startY: 0,
				width: sourceWidth,
				height: sourceHeight,
				method: 'fill'
			});

			// Calculations to move source cell to output cell
			let fx, fy, tx, ty, dx, dy, dLength, dAngle, cos, sin;

			let magicHorizontalPi = 0.5 * Math.PI,
				magicVerticalPi = magicHorizontalPi - 1.5708,

				loop = this.loopPathCursors,

				fCursor = fPathStart,
				tCursor = tPathStart,
				fPartial, tPartial;

			if (isHorizontalCopy) {

				if (fPathStart < fPathEnd) fPartial = (fPathEnd - fPathStart) / sourceHeight;
				else fPartial = (1 - (fPathStart - fPathEnd)) / sourceHeight;

				if (tPathStart < tPathEnd) tPartial = (tPathEnd - tPathStart) / sourceHeight;
				else tPartial = (1 - (tPathStart - tPathEnd)) / sourceHeight;

				for (let i = 0, iz = sourceHeight; i < iz; i++) {

					if(fCursor >= 0 && fCursor <= 1 && tCursor >= 0 && tCursor <= 1) {

						({x: fx, y: fy} = fPath.getPathPositionData(fCursor));
						({x: tx, y: ty} = tPath.getPathPositionData(tCursor));

						dx = tx - fx;
						dy = ty - fy;

						fx -= X;
						fy -= Y;

						dLength = Math.hypot(dx, dy);
						dAngle = -Math.atan2(dx, dy) + magicHorizontalPi;

						cos = Math.cos(dAngle);
						sin = Math.sin(dAngle);

						outputEngine.setTransform(cos, sin, -sin, cos, fx, fy);
						outputEngine.drawImage(sourceCanvas, 0, i, sourceWidth, 1, 0, 0, dLength, 1);
					}

					fCursor += fPartial;
					tCursor += tPartial;

					if (loop) {

						if (fCursor < 0 || fCursor > 1) {

							if (fCursor < 0) fCursor += 1;
							else fCursor -= 1;
						}
						if (tCursor < 0 || tCursor > 1) {

							if (tCursor < 0) tCursor += 1;
							else tCursor -= 1;
						}
					} 
				}
			}
			else {

				if (fPathStart < fPathEnd) fPartial = (fPathEnd - fPathStart) / sourceWidth;
				else fPartial = (1 - (fPathStart - fPathEnd)) / sourceWidth;

				if (tPathStart < tPathEnd) tPartial = (tPathEnd - tPathStart) / sourceWidth;
				else tPartial = (1 - (tPathStart - tPathEnd)) / sourceWidth;

				for (let i = 0, iz = sourceWidth; i < iz; i++) {

					if(fCursor >= 0 && fCursor <= 1 && tCursor >= 0 && tCursor <= 1) {

						({x: fx, y: fy} = fPath.getPathPositionData(fCursor));
						({x: tx, y: ty} = tPath.getPathPositionData(tCursor));

						dx = tx - fx;
						dy = ty - fy;

						fx -= X;
						fy -= Y;

						dLength = Math.hypot(dx, dy);
						dAngle = -Math.atan2(dx, dy) + magicVerticalPi;

						cos = Math.cos(dAngle);
						sin = Math.sin(dAngle);

						outputEngine.setTransform(cos, sin, -sin, cos, fx, fy);
						outputEngine.drawImage(sourceCanvas, i, 0, 1, sourceHeight, 0, 0, 1, dLength);
					}

					fCursor += fPartial;
					tCursor += tPartial;

					if (loop) {

						if (fCursor < 0 || fCursor > 1) {

							if (fCursor < 0) fCursor += 1;
							else fCursor -= 1;
						}
						if (tCursor < 0 || tCursor > 1) {

							if (tCursor < 0) tCursor += 1;
							else tCursor -= 1;
						}
					} 
				}
			}

			// Get rid of the ugly lines created in the output image
			let iFactor = this.interferenceFactor,
				iLoops = this.interferenceLoops,

				iWidth = Math.ceil(outputWidth * iFactor),
				iHeight = Math.ceil(outputHeight * iFactor);

			sourceCanvas.width = iWidth;
			sourceCanvas.height = iHeight;

			outputEngine.setTransform(1, 0, 0, 1, 0, 0);
			sourceEngine.setTransform(1, 0, 0, 1, 0, 0);

			for (let j = 0; j < iLoops; j++) {

				sourceEngine.drawImage(outputCanvas, 0, 0, outputWidth, outputHeight, 0, 0, iWidth, iHeight);
				outputEngine.drawImage(sourceCanvas, 0, 0, iWidth, iHeight, 0, 0, outputWidth, outputHeight);
			}

			if (!this.noFilters && this.filters && this.filters.length) {

				let currentHost = this.getHost(),
					prefilterImage;

				// if we're using the entity as a stencil, copy the entity cell's current display over the entity in the blank canvas
				if (this.isStencil && currentHost.type === 'Cell') {

					sourceCanvas.width = currentHost.element.width;
					sourceCanvas.height = currentHost.element.height;

					sourceEngine.save();
					sourceEngine.globalCompositeOperation = 'source-in';
					sourceEngine.globalAlpha = 1;
					sourceEngine.setTransform(1, 0, 0, 1, 0, 0);
					sourceEngine.drawImage(currentHost.element, X, Y);
					sourceEngine.restore();

					prefilterImage = sourceEngine.getImageData(X, Y, outputWidth, outputHeight);
				} 
				else {

					outputEngine.setTransform(1, 0, 0, 1, 0, 0);
					prefilterImage = outputEngine.getImageData(0, 0, outputWidth, outputHeight);
				}

				let worker = requestFilterWorker();

				actionFilterWorker(worker, {
					image: prefilterImage,
					filters: this.currentFilters
				})
				.then(filteredImage => {

					// handle the web worker response
					if (filteredImage) {

						outputEngine.globalCompositeOperation = 'source-over';
						outputEngine.globalAlpha = 1;
						outputEngine.setTransform(1, 0, 0, 1, 0, 0);
						outputEngine.putImageData(filteredImage, 0, 0);

						releaseFilterWorker(worker);
						cleanup();
					}
					else throw new Error('image issue');
				})
				.catch((err) => {

					releaseFilterWorker(worker);
					console.log(err)
					cleanup();
				});
			}
			else cleanup();
		}
	}
};

P.stamp = function () {

	if (this.visibility) return this.regularStamp();
	else return Promise.resolve(false);
};

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

P.regularStampSynchronousActions = function () {

	let dest = this.currentHost;

	if (dest) {

		let engine = dest.engine;

		if (!this.noCanvasEngineUpdates) dest.setEngine(this);

		this[this.method](engine);
	}
};

P.doStroke = function (engine) {

	let fPath = this.fromPath,
		tPath = this.toPath;

	if(fPath && fPath.getBoundingBox && tPath && tPath.getBoundingBox) {

		let host = this.currentHost;

		if (host) {

			let fStart = fPath.currentStampPosition,
				fEnd = fPath.currentEnd,
				tStart = tPath.currentStampPosition,
				tEnd = tPath.currentEnd;

			host.rotateDestination(engine, fStart[0], fStart[1], fPath);
			engine.stroke(fPath.pathObject);

			host.rotateDestination(engine, tStart[0], tStart[1], fPath);
			engine.stroke(tPath.pathObject);

			engine.setTransform(1,0, 0, 1, 0, 0);
			engine.beginPath()
			engine.moveTo(...fEnd);
			engine.lineTo(...tEnd);
			engine.moveTo(...tStart);
			engine.lineTo(...fStart);
			engine.closePath();
			engine.stroke();
		}
	}
};

P.doFill = function (engine) {

	let output = this.output;
	let [x, y] = this.getBoundingBox();

	engine.setTransform(1, 0, 0, 1, 0, 0);
	engine.drawImage(output, x, y);
};

/*
Override entity draw/fill methods
*/
P.fill = function (engine) {


	this.doFill(engine);

	if (this.showBoundingBox) this.drawBoundingBox(engine);

};

P.draw = function (engine) {

	this.doStroke(engine);

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.drawAndFill = function (engine) {

	this.doStroke(engine);
	this.currentHost.clearShadow();
	this.doFill(engine);

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.fillAndDraw = function (engine) {

	this.doFill(engine);
	this.currentHost.clearShadow();
	this.doStroke(engine);

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.drawThenFill = function (engine) {

	this.doStroke(engine);
	this.doFill(engine);

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.fillThenDraw = function (engine) {

	this.doFill(engine);
	this.doStroke(engine);

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.clear = function (engine) {

	let gco = engine.globalCompositeOperation;
	let output = this.output;
	let [x, y] = this.getBoundingBox();

	engine.setTransform(1, 0, 0, 1, 0, 0);
	engine.globalCompositeOperation = 'destination-out';
	engine.drawImage(output, x, y);
	engine.globalCompositeOperation = gco;

	if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.none = defaultNonReturnFunction;

/*

*/
P.drawBoundingBox = function (engine) {

	if (this.dirtyStart) this.getBoundingBox();

	engine.save();

	let t = engine.getTransform();
	engine.setTransform(1, 0, 0, 1, 0, 0);

	engine.strokeStyle = this.boundingBoxColor;
	engine.lineWidth = 1;
	engine.globalCompositeOperation = 'source-over';
	engine.globalAlpha = 1;
	engine.shadowOffsetX = 0;
	engine.shadowOffsetY = 0;
	engine.shadowBlur = 0;

	engine.strokeRect(...this.boundingBox);

	engine.restore();
	engine.setTransform(t);
};


/*

*/
P.getBoundingBox = function () {

	let fPath = this.fromPath,
		tPath = this.toPath;

	if(fPath && fPath.getBoundingBox && tPath && tPath.getBoundingBox) {

		if (this.dirtyStart) {

			this.dirtyStart = false;

			let [lsx, lsy, sw, sh, sx, sy] = fPath.getBoundingBox();
			let [lex, ley, ew, eh, ex, ey] = tPath.getBoundingBox();

			lsx += sx;
			lsy += sy;
			lex += ex;
			ley += ey;

			let minX = Math.min(lsx, lex);
			let maxX = Math.max(lsx + sw, lex + ew);
			let minY = Math.min(lsy, ley);
			let maxY = Math.max(lsy + sh, ley + eh);

			this.boundingBox = [minX, minY, maxX - minX, maxY - minY];

			this.dirtyOutput = true;
		}
	}
	else this.boundingBox = [0, 0, 0, 0];

	return this.boundingBox;
};


/*
## Exported factory function
*/
const makeLoom = function (items) {
	return new Loom(items);
};

constructors.Loom = Loom;

export {
	makeLoom,
};
