
// # Element factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality


// ## Imports
import { group, element, elementnames, artefact, artefactnames, constructors } from '../core/library.js';
import { generateUuid, pushUnique, mergeOver, removeItem, xt, isa_obj, isa_dom, isa_boolean } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';

import { makeCanvas } from './canvas.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import domMix from '../mixin/dom.js';


// ## Element constructor
const Element = function (items = {}) {
    
    let el = items.domElement;

    this.makeName(items.name);
    this.register();

    if (el) {

        // Scrawl-canvas does not retain an Element's textContent or innerHTML values internally. However these can be set on initialization, and subsequently, by using the attributes __.text__ (for textContent, which automatically escapes all HTML-related tags and entities) and __.content__ (which should respect HTML tags and entities) 
        if (items.text) el.textContent = items.text;
        else if (items.content) el.innerHTML = items.content;
    }

    this.initializePositions();
    this.dimensions[0] = this.dimensions[1] = 100;

    this.pathCorners = [];
    this.css = {};
    this.here = {};

    this.initializeDomLayout(items);

    this.set(this.defs);
    this.set(items);

    el = this.domElement;

    if (el) {

        el.id = this.name;

        if (this.trackHere) pushUnique(uiSubscribedElements, this.name);
    }

    this.apply();
    
    return this;
};


// ## Element object prototype setup
let P = Element.prototype = Object.create(Object.prototype);
P.type = 'Element';
P.lib = 'element';
P.isArtefact = true;
P.isAsset = false;



// Apply mixins to prototype object
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = domMix(P);

// ## Define default attributes
let defaultAttributes = {};
P.defs = mergeOver(P.defs, defaultAttributes);



// ## Packet management
// Nothing additional to do here?


// ## Kill functionality
P.factoryKill = function () {

    removeItem(uiSubscribedElements, this.name);

    this.domElement.remove();
};




// ## Define getter, setter and deltaSetter functions
let S = P.setters;


// This is the preferred way to update an element's text content because the text supplied in the argument is not treated as HTML by the browser. 

// When we update the DOM attribute __element.textContent__, it deletes any position-reporting corner divs we may have added to the element. Thus we need to repopulate the element with its 'kids' after updating the text
S.text = function (item) {

    if (isa_dom(this.domElement)) {

        let el = this.domElement,
            kids = el.querySelectorAll('[data-corner-div="sc"]');

        el.textContent = item;

        kids.forEach(kid => el.appendChild(kid));

        this.dirtyContent = true;
    }
};


// __WARNING - S.content is a dangerous function!__ It does not perform any character escaping before inserting the supplied argument into the element. Raw HTML (including, for instance, &lt;script> tags) will be added to the DOM. It's up to the coder to make sure this content is safe!

// When we update the DOM attribute __element.innerHTML__, it deletes any position-reporting corner divs we may have added to the element. Thus we need to repopulate the element with its 'kids' after updating the text
S.content = function (item) {

    if (this.domElement) {

        let el = this.domElement,
            kids = el.querySelectorAll('[data-corner-div="sc"]');

        el.innerHTML = item;

        kids.forEach(kid => el.appendChild(kid));

        this.dirtyContent = true;
    }
};


// ## Define prototype functions

// TODO - documentation
P.cleanDimensionsAdditionalActions = function () {

    this.dirtyDomDimensions = true;
};


// Adds a new &lt;canvas> element to Scrawl-canvas stack immediately before this element, and sets up the canvas to mimic the element (meaning it will mimic changes to the element's dimensions, positioning, scale and 3D rotational values)

// The function can accept a Javascript object argument containing key:value pairs which will be used to set up the new canvas's attributes after it has been created.

// To make the canvas look as if it is in front of the element, set the element's opacity CSS attribute to 0

// This function is used when adding a Scrawl-canvas component to a stacked element.
P.addCanvas = function (items = {}) {

    if (!this.canvas) {

        let canvas = document.createElement('canvas'),
            el = this.domElement;

        let rect = el.getBoundingClientRect(),
            style = window.getComputedStyle(el);

        el.parentNode.insertBefore(canvas, this.domElement);

        let art = makeCanvas({
            name: `${this.name}-canvas`,
            domElement: canvas,

            position: 'absolute',

            width: rect.width,
            height: rect.height,

            mimic: this.name,
            lockTo: 'mimic',
            
            useMimicDimensions: true,
            useMimicScale: true,
            useMimicStart: true,
            useMimicHandle: true,
            useMimicOffset: true,
            useMimicRotation: true,

            addOwnDimensionsToMimic: false,
            addOwnScaleToMimic: false,
            addOwnStartToMimic: false,
            addOwnHandleToMimic: false,
            addOwnOffsetToMimic: false,
            addOwnRotationToMimic: false,
        });

        art.set(items);

        this.canvas = art;

        return art;
    }
};


// ## Exported factory function
const makeElement = function (items) {
    
    return new Element(items);
};

constructors.Element = Element;

export {
    makeElement,
};
