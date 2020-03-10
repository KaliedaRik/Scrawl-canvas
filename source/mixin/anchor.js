
// # Anchor mixin

// This mixin adds functionality to artefacts, which allows them to act as an anchor - a link - to external URLs (eg web pages). 

// In Scrawl-canvas, an anchor object holds all the data and functionality required to turn an artefact into a link. That functionality gets defined in the factory file (./factory/anchor.js). This mixin makes it easy for the user to gain access to the anchor object via the artefact object.

// ### Examples of using anchors:

//     // get a handle on the canvas where the block/link will be defined 
//     // (in this case a canvas with id="mycanvas")
//     let canvas = scrawl.library.artefact.mycanvas;
//     canvas.setAsCurrentCanvas();

//     // Define a block entity
//     scrawl.makeBlock({

//         name: 'demo-anchor-block',

//         width: '40%',
//         height: '40%',

//         startX: '25%',
//         startY: '25%',

//         // Define the anchor object's attributes
//         anchor: {
//             name: 'wikipedia-water-link',
//             href: 'https://en.wikipedia.org/wiki/Water',
//             description: 'Link to the Wikipedia article on water (opens in new tab)',
//         },

//         // Add an action to take when user clicks on the block entity
//         onUp: this.clickAnchor,
//     });

//     // Add a listener to propagate DOM-detected click events on our canvas 
//     // back into the Scrawl-canvas event system
//     let mylinks = () => canvas.cascadeEventAction('up');
//     scrawl.addListener('up', mylinks, canvas.domElement);
import { mergeOver } from '../core/utilities.js';
import { makeAnchor } from '../factory/anchor.js';

export default function (P = {}) {


// ## Define attributes

// All factories using the anchor mixin will add these attributes to their prototype objects
    let defaultAttributes = {


// Add an anchor attribute to the artefact - acts as a handle to the anchor object
        anchor: null,


// The mixin includes functionality to pass anchor-related attribute values through to its anchor object when the object is created or updated. Those attributes are stored in the anchor object, not the artefact object.
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// ## Define getter, setter and deltaSetter functions
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;


// These Get functions pass calls on the artefact object through to the artefact's associated anchor object (if it exists). As all of the attributes are strings, the Get functions will return '' strings if there is no anchor object currently assigned to the artefact.
    G.anchorDescription = function () {

        if (this.anchor) return this.anchor.get('description');
        return '';
    };
    G.anchorType = function () {

        if (this.anchor) return this.anchor.get('type');
        return '';
    };
    G.anchorTarget = function () {

        if (this.anchor) return this.anchor.get('target');
        return '';
    };
    G.anchorRel = function () {

        if (this.anchor) return this.anchor.get('rel');
        return '';
    };
    G.anchorReferrerPolicy = function () {

        if (this.anchor) return this.anchor.get('referrerpolicy');
        return '';
    };
    G.anchorPing = function () {

        if (this.anchor) return this.anchor.get('ping');
        return '';
    };
    G.anchorHreflang = function () {

        if (this.anchor) return this.anchor.get('hreflang');
        return '';
    };
    G.anchorHref = function () {

        if (this.anchor) return this.anchor.get('href');
        return '';
    };
    G.anchorDownload = function () {

        if (this.anchor) return this.anchor.get('download');
        return '';
    };


// All of the Set functions will check to see if an anchor object has been created/associated with the artefact and, if not, create one to accept the set values.

// The following attributes can be included in the object passed to the artefact's set() function:

// + anchorDescription
// + anchorType
// + anchorTarget
// + anchorRel
// + anchorReferrerPolicy
// + anchorPing
// + anchorHreflang
// + anchorHref (required if the anchor is to work as a URL link to external web pages)
// + anchorDownload

// Also, the artefact's set() function can include a single __anchor__ attribute, whose value should be an object containing some of the above attribute key:value pairs
    S.anchorDescription = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.description(item);
    };
    S.anchorType = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.anchorType(item);
    };
    S.anchorTarget = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.target(item);
    };
    S.anchorRel = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.rel(item);
    };
    S.anchorReferrerPolicy = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.referrerpolicy(item);
    };
    S.anchorPing = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.ping(item);
    };
    S.anchorHreflang = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.hreflang(item);
    };
    S.anchorHref = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.href(item);
    };
    S.anchorDownload = function (item) {

        if (!this.anchor) this.buildAnchor(items);
        if (this.anchor) this.anchor.setters.download(item);
    };

    S.anchor = function (items = {}) {

        if (!this.anchor) this.buildAnchor(items);
        else this.anchor.set(items);
    };


// These functions handle adding an anchor object to an artefact, or rebuilding it, or deleting it from the artefact. Each artifact can have a maximum of one anchor object associated with it.
    P.buildAnchor = function (items = {}) {

        if (this.anchor) this.anchor.demolish();

        if (!items.name) items.name = `${this.name}-anchor`;
        if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;

        this.anchor = makeAnchor(items);
    };

    P.rebuildAnchor = function () {

        if (this.anchor) this.anchor.build();
    };

    P.demolishAnchor = function () {

        if (this.anchor) this.anchor.demolish();
    };


// Function to pass a user click (or whatever event has been set up) on the artefact through to the anchor object, for action.
    P.clickAnchor = function () {

        if (this.anchor) this.anchor.click();
    };

// Return the prototype
    return P;
};
