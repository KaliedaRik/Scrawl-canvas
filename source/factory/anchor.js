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

import { _A, _keys, ANCHOR, BLUR, CLICK, DOWNLOAD, FOCUS, HREF, HREFLANG, NAME, ONCLICK, PING, REFERRERPOLICY, REL, T_ANCHOR, TARGET, UNDEF, TYPE, ZERO_STR } from '../core/shared-vars.js';


// #### Anchor constructor
const Anchor = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);
    this.set(items);

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

// __disabled__ - When set to true, will prevent the anchor &lt;a> element from being added to the &lt;canvas> element's &lt;nav> div on the next build cycle.
    disabled: false,

// The following attributes are detailed in [MDN's &lt;a> reference page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a).
    download: ZERO_STR,
    href: ZERO_STR,
    hreflang: ZERO_STR,
    ping: ZERO_STR,
    referrerpolicy: ZERO_STR,
    rel: 'noreferrer',
    target: '_blank',
    anchorType: ZERO_STR,

// __clickAction__ - function - actions to be performed when user tabs to the hidden &lt;a> element and presses the keyboard return button. Function cannot take any arguments.
    clickAction: null,

// We can instruct the anchor to add event listeners for focus and blur events using the __focusAction__ and __blurAction__ Boolean flags. When set to true, the ___focus___ event listener will invoke the host entity's `onEnter` function; the ___blur___ event listener invokes the `onLeave` function.
    focusAction: true,
    blurAction: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['domElement']);
P.packetObjects = pushUnique(P.packetObjects, ['host']);
P.packetFunctions = pushUnique(P.packetFunctions, ['clickAction']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.demolish = function () {

    if (this.domElement && this.hold) this.hold.removeChild(this.domElement);

    this.deregister();
};


// #### Get, Set, deltaSet
P.set = function (items = Ωempty) {

    let i, key, val, fn;

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            val = items[key];

            if (key && key != NAME && val != null) {

                fn = setters[key];

                if (fn) fn.call(this, val);
                else if (typeof defs[key] != UNDEF) this[key] = val;
            }
        }
        this.build();
    }
    return this;
};

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
// anchor.anchorType      ~~> artefact.anchorType
// anchor.description     ~~> artefact.anchorDescription
// anchor.download        ~~> artefact.anchorDownload
// anchor.href            ~~> artefact.anchorHref
// anchor.hreflang        ~~> artefact.anchorHreflang
// anchor.ping            ~~> artefact.anchorPing
// anchor.referrerPolicy  ~~> artefact.anchorReferrerPolicy
// anchor.rel             ~~> artefact.anchorRel
// anchor.target          ~~> artefact.anchorTarget
// ```
// One or more of these attributes can also be set (in the artefact factory argument, or when invoking artefact.set) using an 'anchor' attribute.


// #### Prototype functions
// The `build` function builds the &lt;a> element and adds it to the DOM
P.build = function () {

    const { hold, host } = this;

    if (host && hold) {

        const { anchorType, blurAction, clickAction, description, download, focusAction, href, hreflang, name, ping, referrerpolicy, rel, target } = this;

        let link = this.domElement;

        if (link) {

            if (clickAction) link.removeEventListener(CLICK, clickAction, false);
            if (focusAction) link.removeEventListener(FOCUS, () => host.onEnter(), false);
            if (blurAction) link.removeEventListener(BLUR, () => host.onLeave(), false);

            hold.removeChild(link);
        }

        link = document.createElement(_A);

        link.id = name;

        if (download) link.setAttribute(DOWNLOAD, download);
        if (href) link.setAttribute(HREF, href);
        if (hreflang) link.setAttribute(HREFLANG, hreflang);
        if (ping) link.setAttribute(PING, ping);
        if (referrerpolicy) link.setAttribute(REFERRERPOLICY, referrerpolicy);
        if (rel) link.setAttribute(REL, rel);
        if (target) link.setAttribute(TARGET, target);
        if (anchorType) link.setAttribute(TYPE, anchorType);

        if (clickAction && isa_fn(clickAction)) link.addEventListener(CLICK, clickAction, false);

        if (description) link.textContent = description;

        if (focusAction) link.addEventListener(FOCUS, () => host.onEnter(), false);
        if (blurAction) link.addEventListener(BLUR, () => host.onLeave(), false);

        this.domElement = link;

        hold.appendChild(link);
    }
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
