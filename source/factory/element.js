/*
# Element factory
*/
import { group, element, elementnames, artefact, artefactnames, constructors } from '../core/library.js';
import { generateUuid, pushUnique, removeItem, xt } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import domMix from '../mixin/dom.js';

/*
## Element constructor
*/
const Element = function (items = {}) {
	
	let el = items.domElement;

	this.makeName(items.name);
	this.register();

	if (el) {

		// Scrawl-canvas does not retain an Element's textContent or innerHTML values internally. However these can be set on initialization, and subsequently, by using the attributes __.text__ (for textContent, which automatically escapes all HTML-related tags and entities) and __.content__ (which should respect HTML tags and entities) 
		if (items.text) el.textContent = items.text;
		else if (items.content) el.innerHTML = items.content;
	}

	this.initializePositions();
	this.dimensions[0] = this.dimensions[1] = 100;

	this.pathCorners = [];
	this.css = {};
	this.here = {};

	this.initializeDomLayout(items);

	this.set(this.defs);
	this.set(items);

	el = this.domElement;

	if (el) {

		el.id = this.name;

		if (this.trackHere) pushUnique(uiSubscribedElements, this.name);
	}

	this.apply();
	
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
P = anchorMix(P);
P = domMix(P);

let S = P.setters;

S.text = function (item) {

	if (this.domElement) {

		let el = this.domElement,
			kids = el.querySelectorAll('[data-corner-div="sc"]');

		el.textContent = item;

		kids.forEach(kid => el.appendChild(kid));

		this.dirtyContent = true;
	}
};

S.content = function (item) {

	if (this.domElement) {

		let el = this.domElement,
			kids = el.querySelectorAll('[data-corner-div="sc"]');

		el.innerHTML = item;

		kids.forEach(kid => el.appendChild(kid));

		this.dirtyContent = true;
	}
};

/*
## Define prototype functions
*/

P.cleanDimensionsAdditionalActions = function () {

	this.dirtyDomDimensions = true;
};

/*

*/
P.demolish = function (removeFromDom = false) {

	let el = this.domElement,
		name = this.name,
		g = this.group;

	if (g) g.removeArtefacts(name);

	if (el && removeFromDom) el.parentNode.removeChild(el);

	// also needs to remove itself from subscribe arrays in pivot, mimic, path artefacts
	if (this.pivot) removeItem(this.pivot.pivoted, this.name);
	if (this.path) removeItem(this.path.pathed, this.name);
	if (this.mimic) removeItem(this.mimic.mimicked, this.name);

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
