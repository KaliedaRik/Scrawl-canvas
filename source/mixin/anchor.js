// # Anchor mixin
// The [anchor object](./factory/anchor.js) holds all the data and functionality required to turn an artefact into an HTML clickable link - &lt;a> element - to external URLs. This mixin adds functionality to artefacts for creating and managing anchor objects.
//
// Each artifact can have a maximum of one anchor object associated with it.


// #### Imports
import { canvas } from '../core/library.js';

import { isa_obj, mergeOver, Ωempty } from '../core/utilities.js';

import { makeAnchor } from '../factory/anchor.js';

import { ANCHORTYPE, BLUR_ACTION, CLICK_ACTION, DESCRIPTION, DISABLED, DOWNLOAD, FOCUS_ACTION, HREF, HREFLANG, NAME, PING, REFERRERPOLICY, REL, T_CANVAS, T_CELL, TAB_ORDER, TARGET } from '../core/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __anchor__ - a handle to the anchor object. When creating or setting an artefact this can be supplied in the argument object as a Javascript object containing the data required to create the anchor.
        anchor: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// `demolishAnchor` - Note that a `handlePacketAnchor` function is also defined in the [position](./position.html) mixin, to manage the surrounding kill functionality.
    P.demolishAnchor = function () {

        if (this.anchor) this.anchor.demolish();
    };


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters;

// The following attributes (which largely map to [HTML anchor attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a)) can be included in the argument object passed to the artefact's factory and `set` functions, or passed as a String to the `get` function:
// ```
// artefact.anchorBlurAction        ~~>  anchor.blurAction      boolean - default: true
// artefact.anchorClickAction       ~~>  anchor.clickAction     function - returns onclick string
// artefact.anchorDescription       ~~>  anchor.description
// artefact.anchorDisabled          ~~>  anchor.disabled        boolean: - default: false
// artefact.anchorDownload          ~~>  anchor.download
// artefact.anchorFocusAction       ~~>  anchor.focusAction     boolean - default: true
// artefact.anchorHref              ~~>  anchor.href
// artefact.anchorHreflang          ~~>  anchor.hreflang
// artefact.anchorName              ~~>  anchor.name
// artefact.anchorPing              ~~>  anchor.ping
// artefact.anchorReferrerPolicy    ~~>  anchor.referrerPolicy
// artefact.anchorRel               ~~>  anchor.rel
// artefact.anchorTabOrder          ~~>  anchor.tabOrder         number - default: 0
// artefact.anchorTarget            ~~>  anchor.target
// artefact.anchorType              ~~>  anchor.type
// ```

// __anchorName__
    G.anchorName = function () { return this.anchorGetHelper(NAME); };

// __anchorDescription__
    G.anchorDescription = function () { return this.anchorGetHelper(DESCRIPTION); };
    S.anchorDescription = function (item) { return this.anchorSetHelper(DESCRIPTION, item); };

// __anchorType__
    G.anchorType = function () { return this.anchorGetHelper(ANCHORTYPE); };
    S.anchorType = function (item) { return this.anchorSetHelper(ANCHORTYPE, item); };

// __anchorTarget__
    G.anchorTarget = function () { return this.anchorGetHelper(TARGET); };
    S.anchorTarget = function (item) { return this.anchorSetHelper(TARGET, item); };

// __anchorTabOrder__
    G.anchorTabOrder = function () { return this.anchorGetHelper(TAB_ORDER); };
    S.anchorTabOrder = function (item) { return this.anchorSetHelper(TAB_ORDER, item); };

// __anchorDisabled__
    G.anchorDisabled = function () { return this.anchorGetHelper(DISABLED); };
    S.anchorDisabled = function (item) { return this.anchorSetHelper(DISABLED, item); };

// __anchorRel__
    G.anchorRel = function () { return this.anchorGetHelper(REL); };
    S.anchorRel = function (item) { return this.anchorSetHelper(REL, item); };

// __anchorReferrerPolicy__
    G.anchorReferrerPolicy = function () { return this.anchorGetHelper(REFERRERPOLICY); };
    S.anchorReferrerPolicy = function (item) { return this.anchorSetHelper(REFERRERPOLICY, item); };

// __anchorPing__
    G.anchorPing = function () { return this.anchorGetHelper(PING); };
    S.anchorPing = function (item) { return this.anchorSetHelper(PING, item); };

// __anchorHreflang__
    G.anchorHreflang = function () { return this.anchorGetHelper(HREFLANG); };
    S.anchorHreflang = function (item) { return this.anchorSetHelper(HREFLANG, item); };

// __anchorHref__
    G.anchorHref = function () { return this.anchorGetHelper(HREF); };
    S.anchorHref = function (item) { return this.anchorSetHelper(HREF, item); };

// __anchorDownload__
    G.anchorDownload = function () { return this.anchorGetHelper(DOWNLOAD); };
    S.anchorDownload = function (item) { return this.anchorSetHelper(DOWNLOAD, item); };

// __anchorFocusAction__
    S.anchorFocusAction = function (item) { return this.anchorSetHelper(FOCUS_ACTION, item); };

// __anchorBlurAction__
    S.anchorBlurAction = function (item) { return this.anchorSetHelper(BLUR_ACTION, item); };

// __anchorClickAction__
    S.anchorClickAction = function (item) { return this.anchorSetHelper(CLICK_ACTION, item); };

// The artefact's factory and `set` functions' argument object can include a single __anchor__ attribute, whose value should be an object containing anchor key:value pairs
// ```
// artefact.set({
//
//     anchor: { ... },
// });
// ```
    S.anchor = function (items) {

        if (!this.anchor) this.buildAnchor(items);
        else this.anchor.set(items);
    };


// Internal helper functions
    P.anchorGetHelper = function(key) {

        if (this.anchor) return this.anchor.get(key);
        return null;
    }

    P.anchorSetHelper = function(key, val) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.set({ [key]: val });
    }


// #### Prototype functions

// The `buildAnchor` function triggers the (re)build of the &lt;a> element and adds it to the DOM
    P.buildAnchor = function (items) {

console.log(this.name, 'buildAnchor')
        if (isa_obj(items)) {

            if (this.anchor) this.anchor.demolish();

            if (!items.anchorName) items.anchorName = `${this.name}-anchor`;
            if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;

            items.host = this;
            items.controller = this.getCanvasWrapper();
            items.hold = this.getCanvasNavElement();

            this.anchor = makeAnchor(items);
        }
    };

// `rebuildAnchor` - triggers the Anchor object's `build` function
    P.rebuildAnchor = function () {

        if (this.anchor) this.anchor.rebuild();
    };


// `clickAnchor` - function to pass a user click (or whatever event has been set up) on the artefact through to the anchor object, for action.
    P.clickAnchor = function () {

        if (this.anchor) this.anchor.click();
    };
}
