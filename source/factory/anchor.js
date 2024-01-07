// # Anchor factory
// In Scrawl-canvas, an Anchor object holds all the data and functionality required to turn an artefact into a link. That functionality gets defined in this file.
//
// Scrawl-canvas uses the [Anchor mixin](../mixin/anchor.html) to add anchor functionality to artefacts - in particular canvas entitys. This (alongside Button objects) gives us a interactive canvas containing dynamic, clickable regions.
//
// NOTE - generating an anchor will have an impact on the DOM document code, as an (off-viewport) &lt;a> element will be added to it.
//
// The __makeAnchor__ function is not exposed to the 'scrawl' object, thus objects can only be created indirectly. Anchors can be saved, cloned and killed as part of wider save/kill/clone functionality.


// #### Demos:
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility
// + [Packets-001](../../demo/packets-001.html) - Save and load Scrawl-canvas entity using text packets


// #### Imports
import { artefact, constructors } from '../core/library.js';

import { doCreate, isa_dom, isa_fn, mergeOver, pushUnique, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';

import { _A, ANCHOR, BLUR, CLICK, DOWNLOAD, FOCUS, HREF, HREFLANG, ONCLICK, PING, REFERRERPOLICY, REL, T_ANCHOR, TARGET, TYPE, ZERO_STR } from '../core/shared-vars.js';


// #### Anchor constructor
const Anchor = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);
    this.set(items);

    this.build();

    return this;
};


// #### Anchor prototype
const P = Anchor.prototype = doCreate();
P.type = T_ANCHOR;
P.lib = ANCHOR;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Anchor attributes
const defaultAttributes = {

// __host__ - Every anchor will belong to exactly one Artefact.
    host: null,

// __description__ - The text that Scrawl-canvas will include between the anchor tags, when building the anchor. __Always include a description__ for accessibility.
    description: ZERO_STR,

// The following attributes are detailed in [MDN's &lt;a> reference page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a).
    download: ZERO_STR,
    href: ZERO_STR,
    hreflang: ZERO_STR,
    ping: ZERO_STR,
    referrerpolicy: ZERO_STR,
    rel: 'noreferrer',
    target: '_blank',
    anchorType: ZERO_STR,

// The __clickAction__ attribute is a ___function which returns a string command___ which in turn gets attached to the anchor DOM element's __onclick__ attribute. Invoking the result is handled entirely by the browser (as is normal).

// ##### Example usage
//
// This __doesn't work!__ The browser will generate an error, rather than output an update to the console, when the user clicks on the canvas entity associated with the anchor (although navigation will still occur - the wikipedia page will open in a new browser tab):
// ```
// anchor: {
//     name: 'wikipedia-box-link',
//     href: 'https://en.wikipedia.org/wiki/Box',
//     description: 'Link to the Wikipedia article on boxes (opens in new tab)',
//
//     clickAction: function () { console.log('box clicked') },
// }
// ```
// This __works as expected__ - the function returns a string which can then be attached to the &lt;a> DOM element's _onclick_ attribute:
// ```
// anchor: {
//     name: 'wikipedia-box-link',
//     href: 'https://en.wikipedia.org/wiki/Box',
//     description: 'Link to the Wikipedia article on boxes (opens in new tab)',
//
//     clickAction: function () { return `console.log('box clicked')` },
// },
// ```
    clickAction: null,

// We can instruct the anchor to add event listeners for focus and blur events using the __focusAction__ and __blurAction__ Boolean flags. When set to true, the ___focus___ event listener will invoke the host entity's `onEnter` function; the ___blur___ event listener invokes the `onLeave` function. Default is to ignore these events
    focusAction: false,
    blurAction: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['domElement']);
P.packetObjects = pushUnique(P.packetExclusions, ['host']);
P.packetFunctions = pushUnique(P.packetFunctions, ['clickAction']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.demolish = function () {

    if (this.domElement && this.hold) this.hold.removeChild(this.domElement);

    this.deregister();
};


// #### Get, Set, deltaSet
const S = P.setters;

// Value should be the artefact object, or its name-String
S.host = function (item) {

    const h = (item.substring) ? artefact[item] : item;

    if (h && h.name) this.host = h;
};

// Used internally - do not set directly! A reference to the hidden DOM hold &lt;div> elemenbt where the anchors &lt;a> element is kept.
S.hold = function (item) {

    if (isa_dom(item)) {

        if (this.domElement && this.hold) this.hold.removeChild(this.domElement);

        this.hold = item;

        if (this.domElement) this.hold.appendChild(this.domElement);
    }
};

// While the Scrawl-canvas anchor object keeps copies of all of its &lt;a> DOM element's attributes locally, they also need to be updated on that element. Most of the setter functions manage this using the `anchor.update()` helper function.
//
// The artefact with which an anchor object is associated maps these attributes to itself as follows:
// ```
// anchor.description     ~~> artefact.anchorDescription
// anchor.anchorType      ~~> artefact.anchorType
// anchor.target          ~~> artefact.anchorTarget
// anchor.rel             ~~> artefact.anchorRel
// anchor.referrerPolicy  ~~> artefact.anchorReferrerPolicy
// anchor.ping            ~~> artefact.anchorPing
// anchor.hreflang        ~~> artefact.anchorHreflang
// anchor.href            ~~> artefact.anchorHref
// anchor.download        ~~> artefact.anchorDownload
// ```
// One or more of these attributes can also be set (in the artefact factory argument, or when invoking artefact.set) using an 'anchor' attribute:
// ```
// artefact.set({
//
//     anchor: {
//         description: 'value',
//         anchorType: 'value',
//         target: 'value',
//         rel: 'value',
//         referrerPolicy: 'value',
//         ping: 'value',
//         hreflang: 'value',
//         href: 'value',
//         download: 'value',
//     },
// });
// ```
S.download = function (item) {

    this.download = item;
    if (this.domElement) this.update(DOWNLOAD);
};

S.href = function (item) {

    this.href = item;
    if (this.domElement) this.update(HREF);
};

S.hreflang = function (item) {

    this.hreflang = item;
    if (this.domElement) this.update(HREFLANG);
};

S.ping = function (item) {

    this.ping = item;
    if (this.domElement) this.update(PING);
};

S.referrerpolicy = function (item) {

    this.referrerpolicy = item;
    if (this.domElement) this.update(REFERRERPOLICY);
};

S.rel = function (item) {

    this.rel = item;
    if (this.domElement) this.update(REL);
};

S.target = function (item) {

    this.target = item;
    if (this.domElement) this.update(TARGET);
};

// These last setters do not follow previous behaviour because Scrawl-canvas anchor objects save the values for each under a different attribute key, compared to the DOM element's attribute key:
// + `anchor.description -> a.textContent` - this is the text between the &lt;a> element's opening and closing tags
// + `anchor.clickAction -> a.onclick` - a function that returns an string which is added to the DOM element's 'onclick' attribute
//
S.anchorType = function (item) {

    this.anchorType = item;
    if (this.domElement) this.domElement.type = item;
};

S.description = function (item) {

    this.description = item;
    if (this.domElement) this.domElement.textContent = item;
};

S.clickAction = function (item) {

    if (isa_fn(item)) {

        this.clickAction = item;
        if (this.domElement) this.domElement.setAttribute(ONCLICK, item());
    }
};


// #### Prototype functions
// The `build` function builds the &lt;a> element and adds it to the DOM
//
// Scrawl-canvas generated anchor links are kept in hidden &lt;nav> elements - either the Canvas object's nav, or the Scrawl-canvas default nav (referenced by _scrawlNavigationHold_) which Scrawl-canvas automatically generates and adds to the top of the DOM &lt;body> element when it first runs.
//
// This is done to give screen readers access to link URLs and descriptions associated with Canvas graphical entitys (which visually impaired users may not be able to see). It also allows links to be tabbed through and invoked in the normal way (which may vary dependent on how browsers implement tab focus functionality)
P.build = function () {

    if (this.domElement && this.hold) this.hold.removeChild(this.domElement);

    const link = document.createElement(_A);

    link.id = this.name;

    if (this.download) link.setAttribute(DOWNLOAD, this.download);
    if (this.href) link.setAttribute(HREF, this.href);
    if (this.hreflang) link.setAttribute(HREFLANG, this.hreflang);
    if (this.ping) link.setAttribute(PING, this.ping);
    if (this.referrerpolicy) link.setAttribute(REFERRERPOLICY, this.referrerpolicy);
    if (this.rel) link.setAttribute(REL, this.rel);
    if (this.target) link.setAttribute(TARGET, this.target);
    if (this.anchorType) link.setAttribute(TYPE, this.anchorType);

    if (this.clickAction && isa_fn(this.clickAction)) link.setAttribute(ONCLICK, this.clickAction());

    if (this.description) link.textContent = this.description;

    if (this.focusAction) link.addEventListener(FOCUS, () => this.host.onEnter(), false);
    if (this.blurAction) link.addEventListener(BLUR, () => this.host.onLeave(), false);

    this.domElement = link;

    if (this.hold) this.hold.appendChild(link);
};


// Internal function - update the DOM element attribute
P.update = function (item) {

    if (this.domElement) this.domElement.setAttribute(item, this[item]);
};


// To action a user `click` on an artifact with an associated anchor object, we generate a DOM MouseEvent originating from the anchor element which the browser can act on in the usual manner (browser/device dependent)
P.click = function () {

    if (!this.hasBeenRecentlyClicked) {

        const e = new MouseEvent(CLICK, {
            view: window,
            bubbles: true,
            cancelable: true
        });

        // This choke mechanism is intended to prevent "Maximum call stack size exceeded" errors occurring
        // + Was causing an issue in Demo [Canvas-027](../../demo/canvas-027.html), where two entitys share the same anchor
        this.hasBeenRecentlyClicked = true;

        const self = this;
        setTimeout(() => self.hasBeenRecentlyClicked = false, 200);

        return this.domElement.dispatchEvent(e);
    }
    else return false;
};


// #### Factory
// To create an anchor, include an anchor definition object in any artefact object's factory argument:
// ```
// // get a handle on the canvas where the block/link will be defined
// // (in this case a canvas with id="mycanvas")
// let canvas = scrawl.library.artefact.mycanvas;
// canvas.setAsCurrentCanvas();
//
// // Define a block entity
// scrawl.makeBlock({
//
//     name: 'demo-anchor-block',
//
//     width: '40%',
//     height: '40%',
//
//     startX: '25%',
//     startY: '25%',
//
//     // Define the anchor object's attributes
//     anchor: {
//         name: 'wikipedia-water-link',
//         href: 'https://en.wikipedia.org/wiki/Water',
//         description: 'Link to the Wikipedia article on water (opens in new tab)',
//     },
//
//     // Add an action to take when user clicks on the block entity
//     onUp: this.clickAnchor,
// });
//
// // Add a listener to propagate DOM-detected click events on our canvas
// // back into the Scrawl-canvas event system
// scrawl.addListener('up', () => canvas.cascadeEventAction('up'), canvas.domElement);
// ```
export const makeAnchor = function (items) {

    if (!items) return false;
    return new Anchor(items);
};

constructors.Anchor = Anchor;
