/*
# Anchor factory

In Scrawl-canvas, an anchor object holds all the data and functionality required to turn an artefact into a link. That functionality gets defined in this file. 

Scrawl-canvas uses a mixin (code kept in ./mixin/anchor.js) to add anchor functionality to artefacts - in particular canvas entitys.

This gives us a interactive canvas containing dynamic, clickable regions.

Note that while anchors are primarily for generating URL links to (external site) web pages, they can also be used to trigger any other desired action. This can be achieved by setting the anchor object's __clickAction__ attribute to a function. For instance:

+ We can define a clickAction which emits a Google Analytics tracker message before performing the URL navigation (see demo Canvas-009)

+ We can suppress the click action (via 'preventDefault') and instead action code supplied by a third party library - though there's usually better ways to achieve this via other Scrawl-canvas functionalities, for instance by using Scrawl-canvas enhanced event listeners or artefact functions (onEnter, onLeave, onDown, onUp).

#### Instantiate objects from the factory: NO

NOTE - generating an anchor will have an impact on the DOM document code, as an (off-viewport) &lt;a> element will be added to it.

The __makeAnchor__ function is not exposed to the 'scrawl' object, thus objects can only be created indirectly.

To create an anchor, include an anchor definition object in any artefact object's factory argument:

    // get a handle on the canvas where the block/link will be defined 
    // (in this case a canvas with id="mycanvas")
    let canvas = scrawl.library.artefact.mycanvas;
    canvas.setAsCurrentCanvas();

    // Define a block entity
    scrawl.makeBlock({

    	name: 'demo-anchor-block',

    	width: '40%',
    	height: '40%',

    	startX: '25%',
    	startY: '25%',

    	// Define the anchor object's attributes
    	anchor: {
    		name: 'wikipedia-water-link',
    		href: 'https://en.wikipedia.org/wiki/Water',
    		description: 'Link to the Wikipedia article on water (opens in new tab)',
    	},

        // Add an action to take when user clicks on the block entity
    	onUp: this.clickAnchor,
    });

    // Add a listener to propagate DOM-detected click events on our canvas 
    // back into the Scrawl-canvas event system
    let mylinks = () => canvas.cascadeEventAction('up');
    scrawl.addListener('up', mylinks, canvas.domElement);

The factory uses all attributes and functions defined by the 'base' mixin, alongside those defined in this file.

#### Library storage: YES, BUT ...

+ scrawl.library.anchor

Anchor objects have a 1-to-1 relationship with the artefacts they are created with. The anchor object is always accessible via the artefact object (at __myartefact.anchor__). 

Anchor functionality (setting its attributes, invoking its functions) can be performed on the artefact object, which maps anchor functionality onto itself.

#### Clone functionality: YES, BUT ...

An anchor object (and its associated DOM element) will be cloned when its parent artefact is cloned.

#### Kill functionality: (tbd)

Currently using a 'demolish' function

TODO: review and update kill functionality through the entire Scrawl-canvas system
*/
import { constructors } from '../core/library.js';
import { scrawlNavigationHold } from '../core/document.js';
import { mergeOver, pushUnique, isa_fn } from '../core/utilities.js';

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

+ the HTML Anchor element 'type' attribute is stored in the Scrawl-canvas Anchor object using the key 'anchorType'

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
The __clickAction__ attribute is a ___function which returns a string command___ which in turn gets attached to the anchor DOM element's __onclick__ attribute. Invoking the result is handled entirely by the browser (as is normal).

Example usage

This __doesn't work!__ The browser will generate an error, rather than output an update to the console, when the user clicks on the canvas entity associated with the anchor (although navigation will still occur - the wikipedia page will open in a new browser tab):

    anchor: {
        name: 'wikipedia-box-link',
        href: 'https://en.wikipedia.org/wiki/Box',
        description: 'Link to the Wikipedia article on boxes (opens in new tab)',

        clickAction: function () { console.log('box clicked') },
    }

This __works as expected__ - the function returns a string which can then be attached to the &lt;a> DOM element's _onclick_ attribute:

    anchor: {
        name: 'wikipedia-box-link',
        href: 'https://en.wikipedia.org/wiki/Box',
        description: 'Link to the Wikipedia article on boxes (opens in new tab)',

        clickAction: function () { return `console.log('box clicked')` },
    },
*/
	clickAction: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


/*
## Packet management

Overwriting base mixin functions.
*/
P.packetExclusions = pushUnique(P.packetExclusions, ['domElement']);
P.packetFunctions = pushUnique(P.packetFunctions, ['clickAction']);


/*
## Define attribute getters and setters
*/

let S = P.setters;

/*
While the Scrawl-canvas anchor object keeps copies of all of its &lt;a> DOM element's attributes locally, they also need to be updated on that element. Most of the setter functions manage this using the anchor.update() helper function.

The artefact with which an anchor object is associated maps these attributes to itself as follows:

	anchor.description     -> artefact.anchorDescription
	anchor.type            -> artefact.anchorType
	anchor.target          -> artefact.anchorTarget
	anchor.rel             -> artefact.anchorRel
	anchor.referrerPolicy  -> artefact.anchorReferrerPolicy
	anchor.ping            -> artefact.anchorPing
	anchor.hreflang        -> artefact.anchorHreflang
    anchor.href            -> artefact.anchorHref
    anchor.download        -> artefact.anchorDownload

One or more of these attributes can also be set (in the artefact factory argument, or when invoking artefact.set) using an 'anchor' attribute:

    artefact.set({
    
        anchor: {
            description: 'value',
            type: 'value',
            target: 'value',
            rel: 'value',
            referrerPolicy: 'value',
            ping: 'value',
            hreflang: 'value',
            href: 'value',
            download: 'value',
        },
    });
*/
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

/*
These last setters do not follow previous behaviour because Scrawl-canvas anchor objects save the values for each under a different attribute key, compared to the DOM element's attribute key:

+ anchor.description -> a.textContent - this is the text between the &lt;a> element's opening and closing tags
+ anchor.clickAction -> a.onclick - a function that returns an string which is added to the DOM element's 'onclick' attribute
*/
S.description = function (item) {

	this.description = item;
	if (this.domElement) this.domElement.textContent = item;
};

S.clickAction = function (item) {

	if (isa_fn(item)) {

		this.clickAction = item;
		if (this.domElement) this.domElement.setAttribute('onclick', item());
	}
};


/*
## Define prototype functions
*/

/*
The __build__ function builds the &lt;a> element and adds it to the DOM

All Scrawl-canvas generated anchor links are kept in a hidden &lt;nav> element (referenced by _scrawlNavigationHold_) which Scrawl-canvas automatically generates and adds to the top of the body element when it first runs. 

This is done to give screen readers access to link URLs and descriptions associated with Canvas graphical entitys (which visually impaired users may not be able to see). It also allows links to be tabbed through and invoked in the normal way (which may vary dependent on how browsers implement tab focus functionality)

TODO: consider whether the top of the document is the best place to store hidden anchor elements. It may be better to store them in a nextChild element following the canvas/stack element where the artefact is being used?
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

	if (this.clickAction && isa_fn(this.clickAction)) link.setAttribute('onclick', this.clickAction());

	if (this.description) link.textContent = this.description;

	this.domElement = link;

	scrawlNavigationHold.appendChild(link);
};

/*
Internal function - update the DOM element attribute
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
TODO - documentation
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

constructors.Anchor = Anchor;

export {
	makeAnchor,
};
