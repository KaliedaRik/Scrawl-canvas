// # Element factory
// The Scrawl-canvas Stack/Element system is an attempt to supplement DOM elements with Scrawl-canvas entity [positioning and dimensioning](../mixin/position.html) functionality.
// + [Entitys](../mixin/entity.html) exist in a [Cell](./cell.html) environment
// + They can position themselves within that Cell either __absolutely__ (px coordinates), or __relatively__ (% coordinates, with values relative to the Cell's dimensions), or __by reference__ (using other entity's coordinates to calculate their own coordinates - `pivot`, `mimic`, `path`)
// + They can also base their dimensions on absolute (px) or relative (%) values
// + They can be __animated__ directly (`set`, `deltaSet`), or through automation (`delta` object), or through the Scrawl-canvas `tween` functionality
// + They can be stored and retrieved ('packet' functionality), cloned ('clone', based on packets) and killed ('kill' functions)
//
// __A [Stack](./stack.html) is a wrapper object around a DOM element__, whose direct children are given Scrawl-canvas Element wrappers:
// ```
// Stack    ~~> Canvas/Cell
// Element  ~~> Entity (eg Block)
// ```
// During initialization Scrawl-canvas will search the DOM tree and automatically create Stack wrappers for any element which has been given a `data-scrawl-stack` attribute which resolves to true. Every direct (first level) child inside the stack element will have Element wrappers created for them (except for &lt;canvas> elements). As part of this work, Scrawl-canvas will modify the affected elements' `position` CSS style:
// + Stack elements have `relative` positioning within the DOM
// + Element elements have `absolute` positioning within the Stack
//
// The `makeElement` function is not exported by the scrawl object. To create a new Element within a Stack, use `mystack.addNewElement({})`.
//
// Element wrapper objects use the __base__, __position__, __anchor__ and __dom__ mixins. Thus Element wrappers are also __artefact__ objects. As such, Elements can be used (almost) like any other artefact; in particular, other artefacts - including any canvas-based entity - can use Elements as their pivot or mimic targets.
//
// Element wrappers are included in the Scrawl-canvas packet system; they can be saved and cloned. Killing an Element wrapper will remove its DOM element from the document.


// #### Demos:
// + All stack demos include examples of using Elements. In particular:
// + [DOM-002](../../demo/dom-002.html) - Element mouse, pivot and mimic functionality
// + [DOM-003](../../demo/dom-003.html) - Dynamically create and clone Element artefacts; drag and drop elements (including SVG elements) around a Stack
// + [DOM-004](../../demo/dom-004.html) - Limitless rockets (clone and destroy elements, tweens, tickers)
// + [DOM-006](../../demo/dom-006.html) - Tween actions on a DOM element; tracking tween and ticker activity (analytics)
// + [DOM-015](../../demo/dom-015.html) - Use stacked DOM artefact corners as pivot points
// + [Snippets-002](../../demo/snippets-002.html) - Scrawl-canvas stack element snippets


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_dom, removeItem, Ωempty } from '../helper/utilities.js';

import { uiSubscribedElements } from '../core/user-interaction.js';

import { makeCanvas } from './canvas.js';

import baseMix from '../mixin/base.js';
import domMix from '../mixin/dom.js';

import { ABSOLUTE, CANVAS, CORNER_SELECTOR, ELEMENT, MIMIC, T_ELEMENT } from '../helper/shared-vars.js';


// #### Element constructor
const Element = function (items = Ωempty) {

    const el = items.domElement;

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

    this.set(items);

    const myEl = this.domElement;

    if (myEl) myEl.id = this.name;

    this.apply();

    return this;
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
P.factoryKill = function () {

    removeItem(uiSubscribedElements, this.name);

    this.domElement.remove();
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
