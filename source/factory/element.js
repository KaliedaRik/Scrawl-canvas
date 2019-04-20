/*
# Element factory
*/
import { group, element, elementnames, artefact, artefactnames, constructors } from '../core/library.js';
import { generateUuid, pushUnique, removeItem, xt } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import domMix from '../mixin/dom.js';

/*
## Element constructor
*/
const Element = function (items = {}) {
	
	let dims;

	this.makeName(items.name);
	this.register();
	this.css = {};
	this.set(this.defs);
	this.set(items);
	this.uuid = generateUuid();

	if(this.domElement){

		// positioning (generally go for absolute)
		this.setPosition();

		// identifier
		this.domElement.setAttribute('data-uuid', this.uuid);

		// listeners
		if(this.trackHere) pushUnique(uiSubscribedElements, this.name);

		// sort out initial dimensions
		if (!xt(items.width, items.height)) {

			dims = this.domElement.getBoundingClientRect();
			
			if (!xt(items.width)) this.width = dims.width;
			if (!xt(items.height)) this.height = dims.height;
		}
		this.dirtyDimensions = true;
	}

	// correcting initial roll/pitch/yaw zero settings
	if (!this.roll && !this.pitch && !this.yaw) this.dirtyRotationActive = false;

	return this;
};

/*
## Element object prototype setup
*/
let P = Element.prototype = Object.create(Object.prototype);
P.type = 'Element';
P.lib = 'element';
P.isArtefact = true;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = domMix(P);

/*
## Define prototype functions
*/

/*

*/
P.demolish = function (removeFromDom = false) {

	let el = this.domElement,
		name = this.name,
		g = group[this.group];

	if (g) g.removeArtefacts(name);

	if (el && removeFromDom) el.parentNode.removeChild(el);

	removeItem(uiSubscribedElements, name);

	delete element[name];
	removeItem(elementnames, name);

	delete artefact[name];
	removeItem(artefactnames, name);

	return true;
};

/*
## Exported factory function
*/
const makeElement = function (items) {
	
	return new Element(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Element = Element;

export {
	makeElement,
};
