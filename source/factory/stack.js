/*
# Stack factory
*/
import { constructors, group, stack, stacknames, element, artefact, artefactnames } from '../core/library.js';
import { generateUuid, mergeOver, pushUnique, isa_dom, removeItem, xt, xto, addStrings } from '../core/utilities.js';
import { rootElements, setRootElementsSort, addDomShowElement, setDomShowRequired, domShow } from '../core/document.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeGroup } from './group.js';
import { makeElement } from './element.js';
import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import cascadeMix from '../mixin/cascade.js';
import domMix from '../mixin/dom.js';

/*
## Stack constructor
*/
const Stack = function (items = {}) {

	let g, el;

	this.makeName(items.name);
	this.register();
	this.initializePositions();
	this.initializeCascade();

	this.dimensions[0] = 300;
	this.dimensions[1] = 150;

	this.pathCorners = [];
	this.css = {};
	this.here = {};
	this.perspective = {

		x: '50%',
		y: '50%',
		z: 0
	};
	this.dirtyPerspective = true;

	this.initializeDomLayout(items);

	g = makeGroup({
		name: this.name,
		host: this.name
	});
	this.addGroups(g.name);

	this.set(this.defs);
	this.set(items);

	el = this.domElement;

	if (el) {

		if (this.trackHere) pushUnique(uiSubscribedElements, this.name);

		if (el.getAttribute('data-group') === 'root') {

			pushUnique(rootElements, this.name);
			setRootElementsSort();
		}
	}

	// this.apply();
	
	return this;
};

/*
## Stack object prototype setup
*/
let P = Stack.prototype = Object.create(Object.prototype);
P.type = 'Stack';
P.lib = 'stack';
P.isArtefact = true;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = cascadeMix(P);
P = domMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	position: 'relative',

/*

*/
	perspective: null,

/*

*/
	trackHere: true
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/
G.perspectiveX = function () {

	return this.perspective.x;
};

/*

*/
G.perspectiveY = function () {

	return this.perspective.y;
};

/*

*/
G.perspectiveZ = function () {

	return this.perspective.z;
};

/*

*/
S.perspectiveX = function (item) {

	this.perspective.x = item;
	this.dirtyPerspective = true;
};

/*

*/
S.perspectiveY = function (item) {

	this.perspective.y = item;
	this.dirtyPerspective = true;
};

/*

*/
S.perspectiveZ = function (item) {

	this.perspective.z = item;
	this.dirtyPerspective = true;
};

/*

*/
S.perspective = function (item = {}) {

	this.perspective.x = (xt(item.x)) ? item.x : this.perspective.x;
	this.perspective.y = (xt(item.y)) ? item.y : this.perspective.y;
	this.perspective.z = (xt(item.z)) ? item.z : this.perspective.z;
	this.dirtyPerspective = true;
};

/*

*/
D.perspectiveX = function (item) {

	this.perspective.x = addStrings(this.perspective.x, item);
	this.dirtyPerspective = true;
};

/*

*/
D.perspectiveY = function (item) {

	this.perspective.y = addStrings(this.perspective.y, item);
	this.dirtyPerspective = true;
};


/*
## Define prototype functions
*/

/*

*/
P.updateArtefacts = function (items = {}) {

	this.groupBuckets.forEach(grp => {

		grp.artefactBuckets.forEach(art => {

			if (items.dirtyScale) art.dirtyScale = true;
			if (items.dirtyDimensions) art.dirtyDimensions = true;
			if (items.dirtyLock) art.dirtyLock = true;
			if (items.dirtyStart) art.dirtyStart = true;
			if (items.dirtyOffset) art.dirtyOffset = true;
			if (items.dirtyHandle) art.dirtyHandle = true;
			if (items.dirtyRotation) art.dirtyRotation = true;
			if (items.dirtyPathObject) art.dirtyPathObject = true;
			if (items.dirtyCollision) art.dirtyCollision = true;
		})
	});
};

P.cleanDimensionsAdditionalActions = function () {

	if (this.groupBuckets) {

		this.updateArtefacts({
			dirtyDimensions: true,
		});
	}

	this.dirtyDomDimensions = true;
};

/*

*/
P.cleanPerspective = function () {

	this.dirtyPerspective = false;

	let p = this.perspective;

	this.domPerspectiveString = `perspective-origin: ${p.x} ${p.y}; perspective: ${p.z}px;`;
	this.domShowRequired = true;

	if (this.groupBuckets) {

		this.updateArtefacts({
			dirtyHandle: true,
			dirtyPathObject: true,
			dirtyCollision: true,
		});
	}
};

/*

*/
P.clear = function () {

	return Promise.resolve(true);
};

/*

*/
P.compile = function () {

	let self = this;

	return new Promise((resolve, reject) => {

		self.sortGroups();

		self.prepareStamp()

		self.stamp()
		.then(() => {

			let promises = [];

			self.groupBuckets.forEach(mygroup => promises.push(mygroup.stamp()));

			return Promise.all(promises);
		})
		.then(() => resolve(true))
		.catch((err) => reject(false));
	})
};

/*

*/
P.show = function () {

	return new Promise((resolve) => {

		domShow();
		resolve(true);
	});
};

/*

*/
P.render = function () {

	let self = this;

	return new Promise((resolve, reject) => {

		self.compile()
		.then(() => self.show())
		.then(() => resolve(true))
		.catch((err) => reject(false));
	});
};

/*
TODO - update in line with stuff in core/document.js addInitialStackElement()
*/
P.addExistingDomElements = function (search) {

	let elements, el, captured, i, iz;

	if (xt(search)) {

		elements = (search.substring) ? document.querySelectorAll(search) : [].concat(search);

		for (i = 0, iz = elements.length; i < iz; i++) {

			el = elements[i];
			
			if (isa_dom(el)) {

				captured = makeElement({
					name: el.id || el.name,
					domElement: el,
					group: this.name,
					host: this.name,
					position: 'absolute',
					setInitialDimensions: true,
				});

				if (captured && captured.domElement) this.domElement.appendChild(captured.domElement);
			}
		}
	}
	return this;
};

/*
Takes an 'items' object as an argument. The only required attribute of the argument is __.tag__, which determines the type of element that will be created (for example - setting tag to 'div' will create a new &lt;div> element)

Any other Element artefact attribute can also be included in the argument object, including __.text__ and __.content__ attributes to set the new DOM Element's textContent and innerHTML attributes.

If position and dimension values are not included in the argument, the element will be given default values of [0,0] for start, offset and handle; and dimensions of 100px width and height.

The new element will also default to a CSS box-sizing style value of 'border-box', unless the argument's __.boxSizing__ attribute has been set to 'content-box' - this will override any 'borderBox' attribute value in the argument's __.css__ object (if one has been included)
*/
P.addNewElement = function (items = {}) {

	if (items.tag) {

		items.domElement = document.createElement(items.tag);
		items.domElement.setAttribute('data-group', this.name);
		if (!xt(items.group)) items.group = this.name;
		items.host = this.name;

		if (!items.position) items.position = 'absolute';
		if (!xt(items.width)) items.width = 100;
		if (!xt(items.height)) items.height = 100;

		let myElement = makeElement(items);

		if (myElement && myElement.domElement) {

			if (!xt(items.boxSizing)) myElement.domElement.style.boxSizing = 'border-box';

			this.domElement.appendChild(myElement.domElement);
		}

		return myElement;
	}
	return false;
};

/*
TODO - review and recode

*/
P.demolish = function (removeFromDom = false) {

	let el = this.domElement,
		name = this.name,
		grp = group[this.group],
		i, iz, item;

	for (i = 0, iz = this.groups.length; i < iz; i++) {

		item = group[this.groups[i]];

		if (item) item.demolishGroup(removeFromDom);
	}

	if (grp) grp.removeArtefacts(name);

	if (el && removeFromDom) el.parentNode.removeChild(el);

	// also needs to remove itself from subscribe arrays in pivot, mimic, path artefacts

	removeItem(uiSubscribedElements, name);

	delete stack[name];
	removeItem(stacknames, name);

	delete artefact[name];
	removeItem(artefactnames, name);

	removeItem(rootElements, name);
	setRootElementsSort();

	return true;
};


/*
## Exported factory function
*/
const makeStack = function (items) {

	return new Stack(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Stack = Stack;

export {
	makeStack,
};
