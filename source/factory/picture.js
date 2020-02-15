/*
# Picture factory
*/
import { constructors, asset } from '../core/library.js';

import { gettableVideoAssetAtributes, settableVideoAssetAtributes } from './videoAsset.js';
import { gettableImageAssetAtributes, settableImageAssetAtributes } from './imageAsset.js';

import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import entityMix from '../mixin/entity.js';
import assetConsumerMix from '../mixin/assetConsumer.js';
import assetPositionsMix from '../mixin/assetPositions.js';
import filterMix from '../mixin/filter.js';

/*
## Picture constructor
*/
const Picture = function (items = {}) {

	this.copyStart = makeCoordinate();
	this.currentCopyStart = makeCoordinate();

	this.copyDimensions = makeCoordinate();
	this.currentCopyDimensions = makeCoordinate();

	this.copyArray = [];
	this.pasteArray = [];

	this.entityInit(items);

	if (!items.copyStart) {

		if (!items.copyStartX) this.copyStart[0] = 0;
		if (!items.copyStartY) this.copyStart[1] = 0;
	}

	if (!items.copyDimensions) {

		if (!items.copyWidth) this.copyDimensions[0] = 1;
		if (!items.copyHeight) this.copyDimensions[1] = 1;
	}

	this.dirtyCopyStart = true;
	this.dirtyCopyDimensions = true;
	this.dirtyImage = true;

	return this;
};

/*
## Picture object prototype setup
*/
let P = Picture.prototype = Object.create(Object.prototype);
P.type = 'Picture';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = entityMix(P);
P = assetConsumerMix(P);
P = assetPositionsMix(P);
P = filterMix(P);


/*
Overrides mixin/entity.js
*/
P.prepareStamp = function() {

	if (this.dirtyAsset) this.cleanAsset();

	if (this.asset) {

		if (this.asset.type === 'Sprite') this.checkSpriteFrame(this);
		else this.asset.checkSource(this.sourceNaturalWidth, this.sourceNaturalHeight);
	}

	if (this.dirtyDimensions || this.dirtyHandle || this.dirtyScale) this.dirtyPaste = true;

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

	if (this.dirtyCopyStart) this.cleanCopyStart();
	if (this.dirtyCopyDimensions) this.cleanCopyDimensions();
	if (this.dirtyImage) this.cleanImage();
	if (this.dirtyPaste) this.preparePasteObject();

	if (this.dirtyPathObject) {

		this.cleanPathObject();
		this.dirtyCollision = true;
	}

	// update artefacts subscribed to this artefact (using it as their pivot or mimic source), if required
	if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
};

/*

*/
P.preparePasteObject = function () {

	this.dirtyPaste = false;

	let handle = this.currentStampHandlePosition,
		dims = this.currentDimensions,
		scale = this.currentScale;

	let x = -handle[0] * scale,
		y = -handle[1] * scale,
		w = dims[0] * scale,
		h = dims[1] * scale;

	let pasteArray = this.pasteArray;

	pasteArray.length = 0;
	pasteArray.push(x, y, w, h);

	this.dirtyPathObject = true;
};

/*

*/
P.cleanPathObject = function () {

	this.dirtyPathObject = false;

	if (!this.noPathUpdates || !this.pathObject) {

		if (!this.pasteArray) this.preparePasteObject();

		let p = this.pathObject = new Path2D();

		p.rect(...this.pasteArray);
	}
};

/*

*/
P.draw = function (engine) {

	engine.stroke(this.pathObject);
};

P.fill = function (engine) {

	engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
};

P.drawAndFill = function (engine) {

	engine.stroke(this.pathObject);
	this.currentHost.clearShadow();
	engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
};

P.fillAndDraw = function (engine) {

	engine.stroke(this.pathObject);
	this.currentHost.clearShadow();
	engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
	engine.stroke(this.pathObject);
};

P.drawThenFill = function (engine) {

	engine.stroke(this.pathObject);
	engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
};

P.fillThenDraw = function (engine) {

	engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
	engine.stroke(this.pathObject);
};


/*
## Exported factory function
*/
const makePicture = function (items) {
	return new Picture(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Picture = Picture;

export {
	makePicture,
};
