// # Anchor mixin
// The [anchor object](./factory/anchor.js) holds all the data and functionality required to turn an artefact into an HTML clickable link - &lt;a> element - to external URLs. This mixin adds functionality to artefacts for creating and managing anchor objects.
//
// Each artifact can have a maximum of one anchor object associated with it.

// #### Imports
import { canvas } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import { makeAnchor } from '../factory/anchor.js';
import { scrawlNavigationHold } from '../core/document.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

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
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;


// The following attributes (which largely map to [HTML anchor attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a)) can be included in the argument object passed to the artefact's factory and `set` functions, or passed as a String to the `get` function:
// ```
// artefact.anchorDescription       ~~>  anchor.description
// artefact.anchorType              ~~>  anchor.type
// artefact.anchorTarget            ~~>  anchor.target
// artefact.anchorRel               ~~>  anchor.rel
// artefact.anchorReferrerPolicy    ~~>  anchor.referrerPolicy
// artefact.anchorPing              ~~>  anchor.ping
// artefact.anchorHreflang          ~~>  anchor.hreflang
// artefact.anchorHref              ~~>  anchor.href
// artefact.anchorDownload          ~~>  anchor.download
// artefact.anchorFocusAction       ~~>  anchor.focusAction
// artefact.anchorBlurAction        ~~>  anchor.blurAction
// ```

// __anchorDescription__
    G.anchorDescription = function () {

        if (this.anchor) return this.anchor.get('description');
        return '';
    };
    S.anchorDescription = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.description(item);
    };

// __anchorType__
    G.anchorType = function () {

        if (this.anchor) return this.anchor.get('type');
        return '';
    };
    S.anchorType = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.anchorType(item);
    };

// __anchorTarget__
    G.anchorTarget = function () {

        if (this.anchor) return this.anchor.get('target');
        return '';
    };
    S.anchorTarget = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.target(item);
    };

// __anchorRel__
    G.anchorRel = function () {

        if (this.anchor) return this.anchor.get('rel');
        return '';
    };
    S.anchorRel = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.rel(item);
    };

// __anchorReferrerPolicy__
    G.anchorReferrerPolicy = function () {

        if (this.anchor) return this.anchor.get('referrerpolicy');
        return '';
    };
    S.anchorReferrerPolicy = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.referrerpolicy(item);
    };

// __anchorPing__
    G.anchorPing = function () {

        if (this.anchor) return this.anchor.get('ping');
        return '';
    };
    S.anchorPing = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.ping(item);
    };

// __anchorHreflang__
    G.anchorHreflang = function () {

        if (this.anchor) return this.anchor.get('hreflang');
        return '';
    };
    S.anchorHreflang = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.hreflang(item);
    };

// __anchorHref__
    G.anchorHref = function () {

        if (this.anchor) return this.anchor.get('href');
        return '';
    };
    S.anchorHref = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.href(item);
    };

// __anchorDownload__
    G.anchorDownload = function () {

        if (this.anchor) return this.anchor.get('download');
        return '';
    };
    S.anchorDownload = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.download(item);
    };

// __anchorFocusAction__
    S.anchorFocusAction = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.focusAction(item);
    };

// __anchorBlurAction__
    S.anchorBlurAction = function (item) {

        if (!this.anchor) this.buildAnchor();
        if (this.anchor) this.anchor.setters.blurAction(item);
    };

// The artefact's factory and `set` functions' argument object can include a single __anchor__ attribute, whose value should be an object containing anchor key:value pairs
// ```
// artefact.set({
//    
//     anchor: {
//         description: 'value',
//         type: 'value',
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
    S.anchor = function (items = {}) {

        if (!this.anchor) this.buildAnchor(items);
        else this.anchor.set(items);
    };


// #### Prototype functions

// The `buildAnchor` function triggers the (re)build of the &lt;a> element and adds it to the DOM
//
// Scrawl-canvas generated anchor links are kept in hidden &lt;nav> elements - either the Canvas object's nav, or the Scrawl-canvas default nav (referenced by _scrawlNavigationHold_) which Scrawl-canvas automatically generates and adds to the top of the DOM &lt;body> element when it first runs. 
//
// This is done to give screen readers access to link URLs and descriptions associated with Canvas graphical entitys (which visually impaired users may not be able to see). It also allows links to be tabbed through and invoked in the normal way (which may vary dependent on how browsers implement tab focus functionality)
    P.buildAnchor = function (items = {}) {

        if (this.anchor) this.anchor.demolish();

        if (!items.name) items.name = `${this.name}-anchor`;
        if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;

        items.host = this;
        items.hold = this.getAnchorHold();

        this.anchor = makeAnchor(items);
    };

// `getAnchorHold` - internal function. Locate the current DOM hold element allocated for hosting &lt;a> elements.
    P.getAnchorHold = function () {

        let entityHost = this.currentHost;

        if (entityHost) {

            if (entityHost.type === 'Canvas') return entityHost.navigation;

            if (entityHost.type === 'Cell') {

                let cellHost = (entityHost.currentHost) ? entityHost.currentHost : canvas[entityHost.host];

                if (cellHost && cellHost.type === 'Canvas') return cellHost.navigation;
            }
        }
        this.dirtyAnchorHold = true;

        return scrawlNavigationHold;
    }

// `rebuildAnchor` - triggers the Anchor object's `build` function
    P.rebuildAnchor = function () {

        if (this.anchor) this.anchor.build();
    };



// `clickAnchor` - function to pass a user click (or whatever event has been set up) on the artefact through to the anchor object, for action.
    P.clickAnchor = function () {

        if (this.anchor) this.anchor.click();
    };

// Return the prototype
    return P;
};
