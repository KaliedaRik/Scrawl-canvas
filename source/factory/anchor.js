/*
# Anchor factory
*/
import { constructors } from '../core/library.js';
import { scrawlNavigationHold } from '../core/document.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';

/*
## Anchor constructor
*/
const Anchor = function (items = {}) {
	
	this.makeName(items.name);
	this.register();
	
	this.set(this.defs);
	this.set(items);

	this.build();

	return this;
};

/*
## Anchor object prototype setup
*/
let P = Anchor.prototype = Object.create(Object.prototype);
P.type = 'Anchor';
P.lib = 'anchor';
P.isArtefact = false;
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
The text that Scrawl-canvas will include between the anchor tags, when building the anchor. __Always include a description__ for accessibility
*/
	description: '',

/*
The following attributes are detailed in https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a

* the HTML Anchor element 'type' attribute is stored in the Scrawl-canvas Anchor object using the key 'anchorType'

Scrawl-canvas will build a link element and add it to the DOM, then invoke a click event on it when required to do so.
*/
	download: '',
	href: '',
	hreflang: '',
	ping: '',
	referrerpolicy: '',
	rel: 'noreferrer',
	target: '_blank',
	anchorType: '',

/*
	
*/
	clickAction: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


let S = P.setters;

S.download = function (item) {

	this.download = item;
	if (this.domElement) this.update('download');
};

S.href = function (item) {

	this.href = item;
	if (this.domElement) this.update('href');
};

S.hreflang = function (item) {

	this.hreflang = item;
	if (this.domElement) this.update('hreflang');
};

S.ping = function (item) {

	this.ping = item;
	if (this.domElement) this.update('ping');
};

S.referrerpolicy = function (item) {

	this.referrerpolicy = item;
	if (this.domElement) this.update('referrerpolicy');
};

S.rel = function (item) {

	this.rel = item;
	if (this.domElement) this.update('rel');
};

S.target = function (item) {

	this.target = item;
	if (this.domElement) this.update('target');
};

S.anchorType = function (item) {

	this.anchorType = item;
	if (this.domElement) this.update('type');
};

S.description = function (item) {

	this.description = item;
	if (this.domElement) this.domElement.textContent = item;
};

S.clickAction = function (item) {

	this.clickAction = item;
	if (this.domElement) this.domElement.setAttribute('onclick', item());
};


/*
## Define prototype functions
*/

/*

*/
P.build = function () {

	if (this.domElement) scrawlNavigationHold.removeChild(this.domElement);

	let link = document.createElement('a');

	link.id = this.name;

	if (this.download) link.setAttribute('download', this.download);
	if (this.href) link.setAttribute('href', this.href);
	if (this.hreflang) link.setAttribute('hreflang', this.hreflang);
	if (this.ping) link.setAttribute('ping', this.ping);
	if (this.referrerpolicy) link.setAttribute('referrerpolicy', this.referrerpolicy);
	if (this.rel) link.setAttribute('rel', this.rel);
	if (this.target) link.setAttribute('target', this.target);
	if (this.anchorType) link.setAttribute('type', this.anchorType);

	if (this.clickAction) link.setAttribute('onclick', this.clickAction());

	if (this.description) link.textContent = this.description;

	this.domElement = link;

	scrawlNavigationHold.appendChild(link);
};

/*

*/
P.update = function (item) {

	if (this.domElement) this.domElement.setAttribute(item, this[item]);
};

/*

*/
P.click = function () {

	let e = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	});

	return this.domElement.dispatchEvent(e);
};

/*

*/
P.demolish = function () {

	if (this.domElement) scrawlNavigationHold.removeChild(this.domElement);

	this.deregister();
};


/*
## Exported factory function
*/
const makeAnchor = function (items) {
	
	return new Anchor(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Anchor = Anchor;

export {
	makeAnchor,
};
