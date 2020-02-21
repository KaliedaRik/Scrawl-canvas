/*
# Anchor factory

In Scrawl-canvas, an anchor object holds all the data and functionality required to turn an artefact into a link. That functionality gets defined in this file. 

Scrawl-canvas uses a mixin (code kept in ./mixin/anchor.js) to add anchor functionality to artefacts - in particular canvas entitys.

This gives us a interactive canvas containing dynamic, clickable regions.

Note that while anchors are primarily for generating URL links to (external site) web pages, they can also be used to trigger any other desired action. This can be achieved by setting the anchor object's __clickAction__ attribute to a function. For instance:

+ We can define a clickAction which emits a Google Analytics tracker message before performing the URL navigation (see demo Canvas-009)

+ We can suppress the click action (via 'preventDefault') and instead action code supplied by a third party library - though there's usually better ways to achieve this via other Scrawl-canvas functionalities, for instance by using Scrawl-canvas enhanced event listeners or artefact functions (onEnter, onLeave, onDown, onUp).

Details of how to add an anchor to a Scrawl-canvas artefact (including DOM elements in a Scrawl-canvas stack) can be found in the anchor mixin file.
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
The following attributes are detailed in https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a - they are (most of) the DOM element's attributes

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
The clickAction is a function which gets attached to the anchor DOM element's __onclick__ attribute. Invoking this function is handled entirely by the browser (as is normal)
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
The __build()__ function builds the &lt;a> element and adds it to the DOM

All Scrawl-canvas generated anchor links are kept in a hidden &lt;nav> element (referenced by _scrawlNavigationHold_) which Scrawl-canvas automatically generates and adds to the top of the body element when it first runs. 

This is done to give screen readers access to link URLs and descriptions associated with Canvas graphical entitys (which visually impaired users may not be able to see). It also allows links to be tabbed through and invoked in the normal way (which may vary dependent on how browsers implement tab focus functionality)
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
To action a user click on an artifact with an associated anchor object, we generate a DOM MouseEvent originating from the anchor element which the browser can act on in the usual manner (browser/device dependent)
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
