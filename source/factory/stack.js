/*
# Stack factory
*/
import { constructors, group, stack, stacknames, element, elementnames, artefact } from '../core/library.js';
import { generateUuid, mergeOver, pushUnique, isa_dom, removeItem, xt, xto, addStrings } from '../core/utilities.js';
import { rootElements, setRootElementsSort, addDomShowElement, setDomShowRequired, domShow } from '../core/DOM.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeGroup } from './group.js';
import { makeElement } from './element.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import cascadeMix from '../mixin/cascade.js';
import domMix from '../mixin/dom.js';

/*
## Stack constructor
*/
const Stack = function (items = {}) {

	let dims, g;

	this.makeName(items.name);
	this.register();
	this.css = {};
	this.set(this.defs);
	this.set(items);
	this.uuid = generateUuid();

	if (this.domElement) {

		// positioning (generally go for relative)
		this.setPosition();

		// identifier
		this.domElement.setAttribute('data-uuid', this.uuid);

		// listeners
		if (this.trackHere) pushUnique(uiSubscribedElements, this.name);

		// sort out initial dimensions
		if (!xto(items.width, items.height)) {

			dims = this.domElement.getBoundingClientRect();
			
			if(!xt(items.width)) this.width = dims.width;
			if(!xt(items.height)) this.height = dims.height;
		}
		this.dirtyDimensions = true;

		// group
		g = makeGroup({
			name: this.name,
			host: this.name
		});
		this.addGroups(g.name);

		// render
		pushUnique(rootElements, this.name);
		setRootElementsSort();
	}

	// correcting initial roll/pitch/yaw zero settings
	if (!this.roll && !this.pitch && !this.yaw) this.dirtyRotationActive = false;

	return this;
};

/*
## Stack object prototype setup
*/
let Sp = Stack.prototype = Object.create(Object.prototype);
Sp.type = 'Stack';
Sp.lib = 'stack';
Sp.artefact = true;

/*
Apply mixins to prototype object
*/
Sp = baseMix(Sp);
Sp = positionMix(Sp);
Sp = cascadeMix(Sp);
Sp = domMix(Sp);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	position: 'relative',

/*

*/
	perspective: {x:'50%',y:'50%',z:0},

/*

*/
	trackHere: true
};
Sp.defs = mergeOver(Sp.defs, defaultAttributes);

let G = Sp.getters,
	S = Sp.setters,
	D = Sp.deltaSetters;

/*

*/
S.width = function (item) {

	this.width = (xt(item)) ? item : this.defs.width;
	this.dimensionsUpdateHelper();
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

/*

*/
S.height = function (item) {

	this.height = (xt(item)) ? item : this.defs.height;
	this.dimensionsUpdateHelper();
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

/*

*/
D.width = function (item) {

	this.width = addStrings(this.width, item);
	this.dimensionsUpdateHelper();
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

/*

*/
D.height = function (item) {

	this.height = addStrings(this.height, item);
	this.dimensionsUpdateHelper();
	this.dirtyDimensions = true;
	this.dirtyHandle = true;
};

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

	this.checkVector('perspective');
	this.perspective.x = item;
	this.dirtyPerspective = true;
};

/*

*/
S.perspectiveY = function (item) {

	this.checkVector('perspective');
	this.perspective.y = item;
	this.dirtyPerspective = true;
};

/*

*/
S.perspectiveZ = function (item) {

	this.checkVector('perspective');
	this.perspective.z = item;
	this.dirtyPerspective = true;
};

/*

*/
S.perspective = function (item = {}) {

	this.checkVector('perspective');
	this.perspective.x = (xt(item.x)) ? item.x : this.perspective.x;
	this.perspective.y = (xt(item.y)) ? item.y : this.perspective.y;
	this.perspective.z = (xt(item.z)) ? item.z : this.perspective.z;
	this.dirtyPerspective = true;
};

/*

*/
D.perspectiveX = function (item) {

	this.checkVector('perspective');
	this.perspective.x = addStrings(this.perspective.x, item);
	this.dirtyPerspective = true;
};

/*

*/
D.perspectiveY = function (item) {

	this.checkVector('perspective');
	this.perspective.y = addStrings(this.perspective.y, item);
	this.dirtyPerspective = true;
};


/*
## Define prototype functions
*/

/*

*/
Sp.dimensionsUpdateHelper = function () {

	let groups = this.groups,
		i, iz, grp;

	if (groups) {

		for (i = 0, iz = groups.length; i < iz; i++) {

			grp = group[groups[i]];
			
			if (grp) {
				grp.setArtefacts({
					dirtyDimensions: true,
					dirtyHandle: true,
					dirtyStart: true,
				});
			}
		}
	}
	
	if (this.here) {

		this.here.w = this.width;
		this.here.h = this.height;
	}
};

/*

*/
Sp.setPerspective = function () {

	addDomShowElement(this.name);
	setDomShowRequired(true);
};

/*

*/
Sp.setPerspectiveNow = function () {

	let style, p,
		perspective, origin;

	this.dirtyPerspective = false;

	if (this.domElement) {

		style = this.domElement.style;
		p = this.perspective;

		perspective = `${p.z}px`;
		origin = `${p.x} ${p.y}`;

		style.webkitPerspectiveOrigin = origin;
		style.mozPerspectiveOrigin = origin;
		style.perspectiveOrigin = origin;
		style.webkitPerspective = perspective;
		style.mozPerspective = perspective;
		style.perspective = perspective;
	}
};

/*

*/
Sp.clear = function () {
	return Promise.resolve(true);
};

/*

*/
Sp.compile = function () {
	// all stack compile operations are synchronous but, because stacks are processed alongside other artifacts, the function has to return a promise.
	let self = this;

	return new Promise((resolve) => {

		self.sortGroups();

		if (self.dirtyPerspective) self.setPerspective();

		self.prepareStamp()

		self.stamp()
		.then(() => self.batchStampGroups(0))
		.then(() => resolve(true))
		.catch((err) => resolve(false));
	});
};

/*

*/
Sp.batchStampGroups = function (counter) {

	let self = this;

	return new Promise((resolve) => {

		let i, iz, item, check,
			promiseArray,
			items = self.groupBuckets[counter];

		if (items) {

			promiseArray = [Promise.resolve(true)];

			for (i = 0, iz = items.length; i < iz; i++) {

				item = items[i];
				promiseArray.push(item.stamp());
			}

			Promise.all(promiseArray)
			.then(() => {

				check = self.groupBuckets[counter + 1];
				
				if (check) {

					self.batchStampGroups(counter + 1)
					.then(() => resolve(true))
					.catch((err) => resolve(false));
				}
				else resolve(true);
			})
			.catch((err) => resolve(false));
		}
		else resolve(true);
	});
};

/*

*/
Sp.show = function () {

	return new Promise((resolve) => {

		domShow();
		resolve(true);
	});
};

/*

*/
Sp.render = function () {

	let self = this;

	return new Promise((resolve) => {

		self.compile()
		.then(() => self.show())
		.then(() => resolve(true))
		.catch((err) => resolve(false));
	});
};

/*

*/
Sp.addDomElementToStack = function (search) {

	let elements, el, captured, i, iz;

	if (xt(search)) {

		elements = (search.substring) ? document.querySelectorAll(search) : [].concat(search);

		for (i = 0, iz = elements.length; i < iz; i++) {

			el = elements[i];
			
			if (isa_dom(el)) {

				captured = makeElement({
					name: el.id || el.name,
					domElement: el,
					group: this.name
				});

				if (captured && captured.domElement) this.domElement.appendChild(captured.domElement);
			}
		}
	}
	return this;
};

/*

*/
Sp.demolish = function (removeFromDom = false) {

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
