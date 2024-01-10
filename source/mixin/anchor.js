// # Anchor mixin
// The [anchor object](./factory/anchor.js) holds all the data and functionality required to turn an artefact into an HTML clickable link - &lt;a> element - to external URLs. This mixin adds functionality to artefacts for creating and managing anchor objects.
//
// Each artifact can have a maximum of one anchor object associated with it.


// #### Imports
import { canvas } from '../core/library.js';

import { isa_obj, mergeOver, Ωempty } from '../core/utilities.js';

import { makeAnchor } from '../factory/anchor.js';

import { ANCHORTYPE, DESCRIPTION, DOWNLOAD, HREF, HREFLANG, PING, REFERRERPOLICY, REL, T_CANVAS, T_CELL, TARGET, TYPE, ZERO_STR } from '../core/shared-vars.js';


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
// artefact.anchorBlurAction        ~~>  anchor.blurAction
// artefact.anchorBlurAction        ~~>  anchor.blurAction      boolean - default: false
// artefact.anchorClickAction       ~~>  anchor.clickAction
// artefact.anchorClickAction       ~~>  anchor.clickAction     function - returns onclick string
// artefact.anchorDescription       ~~>  anchor.description
// artefact.anchorDownload          ~~>  anchor.download
// artefact.anchorFocusAction       ~~>  anchor.focusAction
// artefact.anchorFocusAction       ~~>  anchor.focusAction     boolean - default: false
// artefact.anchorHref              ~~>  anchor.href
// artefact.anchorHreflang          ~~>  anchor.hreflang
// artefact.anchorPing              ~~>  anchor.ping
// artefact.anchorReferrerPolicy    ~~>  anchor.referrerPolicy
// artefact.anchorRel               ~~>  anchor.rel
// artefact.anchorTarget            ~~>  anchor.target
// artefact.anchorType              ~~>  anchor.type
// ```

// __anchorDescription__
    G.anchorDescription = function () { return this.anchorGetHelper(DESCRIPTION); };
    S.anchorDescription = function (item) { return this.anchorSetHelper(DESCRIPTION, item); };

// __anchorType__
    G.anchorType = function () { return this.anchorGetHelper(ANCHORTYPE); };
    S.anchorType = function (item) { return this.anchorSetHelper(ANCHORTYPE, item); };

// __anchorTarget__
    G.anchorTarget = function () { return this.anchorGetHelper(TARGET); };
    S.anchorTarget = function (item) { return this.anchorSetHelper(TARGET, item); };

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

        if (isa_obj(items)) {

            if (this.anchor) this.anchor.demolish();

            if (!items.anchorName) items.anchorName = `${this.name}-anchor`;
            if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;

            items.host = this;
            items.hold = this.getAnchorHold();

            this.anchor = makeAnchor(items);
        }
    };

// `getAnchorHold` - internal function. Locate the current DOM hold element allocated for hosting &lt;a> elements.
    P.getAnchorHold = function () {

        const entityHost = this.currentHost;

        if (entityHost) {

            if (entityHost.type === T_CANVAS) return entityHost.navigation;

            if (entityHost.type === T_CELL) {

                const cellHost = (entityHost.currentHost) ? entityHost.currentHost : canvas[entityHost.host];

                if (cellHost && cellHost.type === T_CANVAS) return cellHost.navigation;
            }
        }
        this.dirtyAnchorHold = true;

        return null;
    }

// `rebuildAnchor` - triggers the Anchor object's `build` function
    P.rebuildAnchor = function () {

        if (this.anchor) this.anchor.build();
    };



// `clickAnchor` - function to pass a user click (or whatever event has been set up) on the artefact through to the anchor object, for action.
    P.clickAnchor = function () {

        if (this.anchor) this.anchor.click();
    };


    P.prepareStampTabsHelper = function () {

// `dirtyAnchorHold` - if the entity has an Anchor object, and any updates have been made to its data, it needs to be rebuilt by invoking the __buildAnchor__ function.
        if (this.anchor && this.dirtyAnchorHold) {

            this.dirtyAnchorHold = false;
            this.buildAnchor(this.anchor);
        }

// `dirtyButtonHold` - if the entity has a Button object, and any updates have been made to its data, it needs to be rebuilt by invoking the __buildButton__ function.
        if (this.button && this.dirtyButtonHold) {

            this.dirtyButtonHold = false;
            this.buildButton(this.button);
        }
    };
// Return the prototype
    return P;
}
