// # Element factory
// The Scrawl-canvas Stack/Element system is an attempt to supplement DOM elements with Scrawl-canvas entity [positioning and dimensioning](../mixin/position.html) functionality.
//
// During initialization Scrawl-canvas will search the DOM tree and automatically create Stack wrappers for any element which has been given a `data-scrawl-stack` attribute which resolves to true. Every direct (first level) child inside the stack element will have Element wrappers created for them (except for &lt;canvas> elements).


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_dom, removeItem, Ωempty } from '../helper/utilities.js';

import { uiSubscribedElements } from '../core/user-interaction.js';

import { makeCanvas } from './canvas.js';

import baseMix from '../mixin/base.js';
import domMix from '../mixin/dom.js';

// Shared constants
import { ABSOLUTE, CANVAS, CORNER_SELECTOR, ELEMENT, MIMIC } from '../helper/shared-vars.js';

// Local constants
const T_ELEMENT = 'Element';

// Cannot be used as stack elements
const FORBIDDEN_ELEMENTS = ['BASE', 'HEAD', 'LINK', 'META', 'STYLE', 'TITLE', 'BODY', 'DD', 'DT', 'FIGCAPTION', 'HR', 'LI', 'ABBR', 'B', 'BDI', 'BDO', 'BR', 'CITE', 'CODE', 'DATA', 'DFN', 'EM', 'I', 'KBD', 'MARK', 'Q', 'RP', 'RT', 'RUBY', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TIME', 'U', 'VAR', 'WBR', 'AREA', 'MAP', 'TRACK', 'SOURCE', 'NOSCRIPT', 'SCRIPT', 'DEL', 'INS', 'CAPTION', 'COL', 'COLGROUP', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'DATALIST', 'FIELDSET', 'LABEL', 'LEGEND', 'OPTGROUP', 'OPTION', 'SLOT', 'DIALOG', 'SUMMARY', 'TEMPLATE', 'ACRONYM', 'BIG', 'CENTER', 'CONTENT', 'DIR', 'FONT', 'FRAME', 'FRAMESET', 'IMAGE', 'MARQUEE', 'MENUITEM', 'NOBR', 'NOEMBED', 'NOFRAMES', 'PARAM', 'PLAINTEXT', 'RB', 'RTC', 'SHADOW', 'STRIKE', 'TT', 'XMP', 'ANIMATE', 'ANIMATEMOTION', 'ANIMATETRANSFORM', 'CIRCLE', 'CLIPPATH', 'CURSOR', 'DEFS', 'DESC', 'ELLIPSE', 'FEBLEND', 'FECOLORMATRIX', 'FECOMPONENTTRANSFER', 'FECOMPOSITE', 'FECONVOLVEMATRIX', 'FEDIFFUSELIGHTING', 'FEDISPLACEMENTMAP', 'FEDISTANTLIGHT', 'FEDROPSHADOW', 'FEFLOOD', 'FEFUNCA', 'FEFUNCB', 'FEFUNCG', 'FEFUNCR', 'FEGAUSSIANBLUR', 'FEIMAGE', 'FEMERGE', 'FEMERGENODE', 'FEMORPHOLOGY', 'FEOFFSET', 'FEPOINTLIGHT', 'FESPECULARLIGHTING', 'FESPOTLIGHT', 'FETILE', 'FETURBULENCE', 'FILTER', 'FONT-FACE-FORMAT', 'FONT-FACE-NAME', 'FONT-FACE-SRC', 'FONT-FACE-URI', 'FONT-FACE', 'FONT', 'FONT', 'FOREIGNOBJECT', 'G', 'GLYPH', 'GLYPHREF', 'HKERN', 'IMAGE', 'LINE', 'LINEARGRADIENT', 'MARKER', 'MASK', 'METADATA', 'MISSING-GLYPH', 'MPATH', 'PATH', 'PATTERN', 'POLYGON', 'POLYLINE', 'RADIALGRADIENT', 'RECT', 'SCRIPT', 'SET', 'STOP', 'STYLE', 'SWITCH', 'SYMBOL', 'TEXT', 'TEXTPATH', 'TREF', 'TSPAN', 'USE', 'VIEW', 'VKERN'];


// #### Element constructor
const Element = function (items = Ωempty) {

    const el = items.domElement;

    // Restrict what can become an Element
    // + The last check is to exclude Web Components
    if (el && !FORBIDDEN_ELEMENTS.includes(el.tagName) && !el.tagName.includes('-')) {

        this.makeName(items.name);
        this.register();

        if (el) {

            // Scrawl-canvas does not retain an Element's textContent or innerHTML values internally. However these can be set on initialization, and subsequently, by using the attributes `text` (for textContent, which automatically escapes all HTML-related tags and entities) and `content` (which should respect HTML tags and entities)
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

        this.initializeAccessibility();

        this.mimic = null;
        this.pivot = null;
        this.dirtyContent = true;
        this.dirtyCss = true;
        this.dirtyStampOrder = true;
        this.localMouseListener = null;
        this.canvas = null;
        this.elementComputedStyles = null;

        this.set(items);

        const myEl = this.domElement;

        if (myEl) myEl.id = this.name;

        return this;
    }
    return null;
};


// #### Element prototype
const P = Element.prototype = doCreate();
P.type = T_ELEMENT;
P.lib = ELEMENT;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
domMix(P);


// #### Element attributes
// No additional attributes required beyond those supplied by the mixins


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.factoryKill = function (removeElement = true) {

    removeItem(uiSubscribedElements, this.name);

    if (removeElement) this.domElement.remove();
};


// #### Get, Set, deltaSet
const S = P.setters;


// `text` - __this is the preferred way to update an element's text content__ because the text supplied in the argument is not treated as HTML by the browser.
//
// When we update the DOM attribute `element.textContent`, it deletes any position-reporting corner divs we may have added to the element. Thus we need to repopulate the element with its 'kids' after updating the text
S.text = function (item) {

    const el = this.domElement;

    if (isa_dom(el)) {

        const corners = el.querySelectorAll(CORNER_SELECTOR);

        el.textContent = item;

        corners.forEach(c => el.appendChild(c));

        this.dirtyContent = true;
    }
};


// `content` - __WARNING - this is a dangerous function!__ It does not perform any character escaping before inserting the supplied argument into the element. Raw HTML (including, for instance, &lt;script> tags) will be added to the DOM. It's up to the developer to make sure this content is safe!
//
// When we update the DOM attribute `element.innerHTML`, it deletes any position-reporting corner divs we may have added to the element. Thus we need to repopulate the element with its 'kids' after updating the text
S.content = function (item) {

    const el = this.domElement;

    if (isa_dom(el)) {

        const corners = el.querySelectorAll(CORNER_SELECTOR);

        el.innerHTML = item;

        corners.forEach(c => el.appendChild(c));

        this.dirtyContent = true;
    }
};


// #### Prototype functions

// `cleanDimensionsAdditionalActions` - overwrites mixin/position function.
P.cleanDimensionsAdditionalActions = function () {

    this.dirtyDomDimensions = true;
};


// #### Snippet-related functions

// `addCanvas` - adds a new &lt;canvas> element to Scrawl-canvas stack immediately before this element, and sets up the canvas to mimic the element (meaning it will mimic changes to the element's dimensions, positioning, scale and 3D rotational values)
// + The function can accept a Javascript object argument containing key:value pairs which will be used to set up the new canvas's attributes after it has been created.
// + To make the canvas look as if it is in front of the element, set the element's opacity CSS attribute to 0
// + This function is used when adding a Scrawl-canvas snippet to a stacked element.
P.addCanvas = function (items = Ωempty) {

    if (!this.canvas) {

        const canvas = document.createElement(CANVAS),
            el = this.domElement;

        canvas.id = `${this.name}-canvas`;

        const rect = el.getBoundingClientRect();

        el.parentNode.insertBefore(canvas, this.domElement);

        const art = makeCanvas({
            name: `${this.name}-canvas`,
            domElement: canvas,

            position: ABSOLUTE,

            width: rect.width,
            height: rect.height,

            mimic: this.name,
            lockTo: MIMIC,

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
    else return this.canvas;
};


// #### Factory
// ```
// Get a handle to a Stack wrapper
// let stack = scrawl.library.stack.mystack;
//
// stack.addNewElement({
//
//     name: 'list',
//     tag: 'ul',
//
//     width: '25%',
//     height: 80,
//
//     startX: 400,
//     startY: 120,
//     handleX: 'center',
//     handleY: 'center',
//
//     roll: 30,
//
//     classes: 'red-text',
//
//     content: `<li>unordered list</li>
// <li>with several</li>
// <li>bullet points</li>`,
//
//     css: {
//         font: '12px fantasy',
//         paddingInlineStart: '20px',
//         paddingTop: '0.5em',
//         margin: '0',
//         border: '1px solid red',
//         cursor: 'grab',
//     },
//
// }).clone({
//
//     name: 'list-no-border',
//
//     startY: 250,
//     scale: 1.25,
//     pitch: 60,
//     yaw: 80,
//
//     css: {
//         border: 0,
//     },
// });
// ```
export const makeElement = function (items) {

    if (!items) return false;
    return new Element(items);
};

constructors.Element = Element;
