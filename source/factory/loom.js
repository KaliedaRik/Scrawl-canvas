/*
# Loom factory
*/
import { constructors, group, artefact, radian } from '../core/library.js';
import { defaultNonReturnFunction, generateUuid, isa_fn, mergeOver, xt, xta, addStrings, pushUnique } from '../core/utilities.js';
import { currentGroup, scrawlCanvasHold } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makeAnchor } from '../factory/anchor.js';
import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from '../factory/filter.js';
import { importDomImage } from '../factory/imageAsset.js';

import baseMix from '../mixin/base.js';


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


/*
## Define default attributes
*/
let defaultAttributes = {

/*
Position defaults used by Loom
*/
	visibility: true,
	order: 0,
	host: null,
	group: null,
	anchor: null,
	collides: false,
	sensorSpacing: 50,

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

	useFromPathCursorsOnly: false,

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

/*

*/
S.isHorizontalCopy = function (item) {

	this.isHorizontalCopy = (item) ? true : false;
	this.dirtyStart = true;
	this.dirtyOutput = true;
};

/*

*/
S.useFromPathCursorsOnly = function (item) {

	this.useFromPathCursorsOnly = (item) ? true : false;

	if (item) {

		this.toPathStart = this.fromPathStart;
		this.toPathEnd = this.fromPathEnd;
	}

	this.dirtyOutput = true;
};

/*

*/
S.fromPathStart = function (item) {

	if (item < 0 || item > 1) item = (item > 0.5) ? 1 : 0;
	
	this.fromPathStart = item;

	if (this.useFromPathCursorsOnly) this.toPathStart = item;

	this.dirtyOutput = true;
};
S.fromPathEnd = function (item) {

	if (item < 0 || item > 1) item = (item > 0.5) ? 1 : 0;

	this.fromPathEnd = item;

	if (this.useFromPathCursorsOnly) this.toPathEnd = item;
	
	this.dirtyOutput = true;
};
S.toPathStart = function (item) {

	if (!this.useFromPathCursorsOnly) {

		if (item < 0 || item > 1) item = (item > 0.5) ? 1 : 0;
		this.toPathStart = item;
		this.dirtyOutput = true;
	}
};
S.toPathEnd = function (item) {

	if (!this.useFromPathCursorsOnly) {
		
		if (item < 0 || item > 1) item = (item > 0.5) ? 1 : 0;
		this.toPathEnd = item;
		this.dirtyOutput = true;
	}
};
D.fromPathStart = function (item) {

	this.fromPathStart += item;

	if (this.fromPathStart < 0 || this.fromPathStart > 1) this.fromPathStart = (this.fromPathStart > 0.5) ? 1 : 0;

	if (this.useFromPathCursorsOnly) this.toPathStart = this.fromPathStart;

	this.dirtyOutput = true;
};
D.fromPathEnd = function (item) {

	this.fromPathEnd += item;

	if (this.fromPathEnd < 0 || this.fromPathEnd > 1) this.fromPathEnd = (this.fromPathEnd > 0.5) ? 1 : 0;

	if (this.useFromPathCursorsOnly) this.toPathEnd = this.fromPathEnd;

	this.dirtyOutput = true;
};
D.toPathStart = function (item) {

	if (!this.useFromPathCursorsOnly) {
		
		this.toPathStart += item;
		if (this.toPathStart < 0 || this.toPathStart > 1) this.toPathStart = (this.toPathStart > 0.5) ? 1 : 0;
		this.dirtyOutput = true;
	}
};
D.toPathEnd = function (item) {

	if (!this.useFromPathCursorsOnly) {
		
		this.toPathEnd += item;
		if (this.toPathEnd < 0 || this.toPathEnd > 1) this.toPathEnd = (this.toPathEnd > 0.5) ? 1 : 0;
		this.dirtyOutput = true;
	}
};


/*
Copied from position mixin
*/
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

	// if (this.noUserInteraction) return false;

	// if (!this.pathObject || this.dirtyPathObject) {

	// 	this.cleanPathObject();
	// }

	// let tests = (!Array.isArray(items)) ?  [items] : items,
	// 	poolCellFlag = false;

	// if (!mycell) {

	// 	mycell = requestCell();
	// 	poolCellFlag = true;
	// }

	// let engine = mycell.engine,
	// 	stamp = this.currentStampPosition,
	// 	x = stamp[0],
	// 	y = stamp[1],
	// 	tx, ty;

	// if (tests.some(test => {

	// 	if (Array.isArray(test)) {

	// 		tx = test[0];
	// 		ty = test[1];
	// 	}
	// 	else if (xta(test, test.x, test.y)) {

	// 		tx = test.x;
	// 		ty = test.y;
	// 	}
	// 	else return false;

	// 	if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;

	// 	mycell.rotateDestination(engine, x, y, this);

	// 	return engine.isPointInPath(this.pathObject, tx, ty, this.winding);

	// }, this)) {

	// 	if (poolCellFlag) releaseCell(mycell);

	// 	return {
	// 		x: tx,
	// 		y: ty,
	// 		artefact: this
	// 	};
	// }
	
	// if (poolCellFlag) releaseCell(mycell);
	
	return false;
};

P.buildAnchor = function (items = {}) {

	// if (this.anchor) this.anchor.demolish();

	// if (!items.name) items.name = `${this.name}-anchor`;
	// if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;

	// this.anchor = makeAnchor(items);
};

P.rebuildAnchor = function () {

	// if (this.anchor) this.anchor.build();
};

P.demolishAnchor = function () {

	// if (this.anchor) this.anchor.demolish();
};

P.clickAnchor = function () {

	// if (this.anchor) this.anchor.click();
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

P.clone = function(items = {}) {

	return false;

	// let regex = /^(local|dirty|current)/,
	// 	stateDefs = this.state.defs,
	// 	copied, myCurrentState, myCloneState;

	// let updateCopiedState = (copy, defs, item) => {

	// 	let temp = copy[item];
	// 	copy[item] = defs[item];

	// 	if (temp) {

	// 		if (temp.substring) copy[item] = temp;
	// 		else if (temp.name) copy[item] = temp.name;
	// 	}
	// };

	// this.preCloneActions();

	// let grp = this.group;
	// this.group = grp.name;
	
	// let host = this.currentHost;
	// delete this.currentHost;

	// myCurrentState = this.state;
	// if (items.sharedState) myCloneState = this.state;
	// else myCloneState = mergeOver({}, this.state);
	// delete this.state;

	// let tempAsset = this.asset, 
	// 	tempSource = this.source, 
	// 	tempPivot = this.pivot, 
	// 	tempMimic = this.mimic, 
	// 	tempPath = this.path;

	// if (tempAsset && tempAsset.name) this.asset = tempAsset.name;
	// if (tempPivot && tempPivot.name) this.pivot = tempPivot.name;
	// if (tempMimic && tempMimic.name) this.mimic = tempMimic.name;
	// if (tempPath && tempPath.name) this.path = tempPath.name;

	// delete this.source;

	// let tempPathObject = this.pathObject;
	// delete this.pathObject;

	// copied = JSON.parse(JSON.stringify(this));

	// if (tempAsset) this.asset = tempAsset;
	// if (tempSource) this.source = tempSource;
	// if (tempPivot) this.pivot = tempPivot;
	// if (tempMimic) this.mimic = tempMimic;
	// if (tempPath) this.path = tempPath;

	// this.pathObject = tempPathObject;

	// copied.name = (items.name) ? items.name : generateUuid();

	// if (this.anchor && this.anchor.clickAction) copied.anchor.clickAction = this.anchor.clickAction;
	// if (items.anchor) copied.anchor = mergeOver(copied.anchor, items.anchor);

	// this.group = grp;
	// this.currentHost = host;

	// this.state = myCurrentState;
	// if (!items.sharedState) {
		
	// 	updateCopiedState(myCloneState, stateDefs, 'fillStyle');
	// 	updateCopiedState(myCloneState, stateDefs, 'strokeStyle');
	// 	updateCopiedState(myCloneState, stateDefs, 'shadowColor');
	// }

	// Object.entries(this).forEach(([key, value]) => {

	// 	if (regex.test(key)) delete copied[key];
	// 	if (isa_fn(this[key])) copied[key] = this[key];
	// }, this);

	// if (this.group) copied.group = this.group.name;

	// let clone = new library.constructors[this.type](copied);

	// if (items.sharedState) clone.state = myCloneState;
	// else clone.set(myCloneState);

	// clone.set(items);

	// this.postCloneActions(clone, items);

	// return clone;
};

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
	if (this.dirtyOutput) this.cleanOutput();
};

P.cleanPathObject = function () {};

P.cleanOutput = function () {

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
				fCursor, fPartial, tCursor, tPartial;

			if (isHorizontalCopy) {

				fCursor = fPathStart;
				fPartial = (fPathEnd - fPathStart) / sourceHeight;

				tCursor = tPathStart;
				tPartial = (tPathEnd - tPathStart) / sourceHeight;

				for (let i = 0, iz = sourceHeight; i < iz; i++) {

					({x: fx, y: fy} = fPath.getPathPositionData(fCursor));
					({x: tx, y: ty} = tPath.getPathPositionData(tCursor));

					fCursor += fPartial;
					if (fCursor > 1 || fCursor < 0) (fCursor > 0.5) ? fCursor -= 1 : fCursor += 1;

					tCursor += tPartial;
					if (tCursor > 1 || tCursor < 0) (tCursor > 0.5) ? tCursor -= 1 : tCursor += 1;

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
			}
			else {

				fCursor = fPathStart;
				fPartial = (fPathEnd - fPathStart) / sourceWidth;

				tCursor = tPathStart;
				tPartial = (tPathEnd - tPathStart) / sourceWidth;

				for (let i = 0, iz = sourceWidth; i < iz; i++) {

					({x: fx, y: fy} = fPath.getPathPositionData(fCursor));
					({x: tx, y: ty} = tPath.getPathPositionData(tCursor));
					fCursor += fPartial;
					tCursor += tPartial;

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
			}

			// Get rid of the ugly lines created in the output image
			let iFactor = this.interferenceFactor,
				iLoops = this.interferenceLoops,
				iWidth = Math.ceil(outputWidth * iFactor),
				iHeight = Math.ceil(outputHeight * iFactor);

			sourceCanvas.width = iWidth;
			sourceCanvas.height = iHeight;
			sourceEngine.setTransform(1, 0, 0, 1, 0, 0);
			outputEngine.setTransform(1, 0, 0, 1, 0, 0);

			for (let j = 0; j < iLoops; j++) {

				sourceEngine.drawImage(outputCanvas, 0, 0, outputWidth, outputHeight, 0, 0, iWidth, iHeight);
				outputEngine.drawImage(sourceCanvas, 0, 0, iWidth, iHeight, 0, 0, outputWidth, outputHeight);
			}

			// output result to loom's output, stored in an &lt;img> element
			this.output.src = outputCanvas.toDataURL();

			// Release the hounds!
			releaseCell(sourceCell);
			releaseCell(outputCell);
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
