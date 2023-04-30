// # Stack factory
// The Scrawl-canvas Stack/Element system is an attempt to supplement DOM elements with Scrawl-canvas entity positioning and dimensioning functionality.
// + Entitys exist in a Cell environment
// + They can position themselves within that Cell either __absolutely__ (px coordinates), or __relatively__ (% coordinates, with values relative to the Cell's dimensions), or __by reference__ (using other entity's coordinates to calculate their own coordinates - `pivot`, `mimic`, `path`)
// + They can also base their dimensions on absolute (px) or relative (%) values
// + They can be __animated__ directly (`set`, `deltaSet`), or through automation (`delta` object), or through the Scrawl-canvas `tween` functionality
// + They can be stored and retrieved ('packet' functionality), cloned ('clone', based on packets) and killed ('kill' functions)
//
// __A Stack is a wrapper object around a DOM element__, whose direct children are given Scrawl-canvas Element wrappers:
// ```
// Stack    ~~> Canvas/Cell
// Element  ~~> Entity (eg Block)
// ```
// During initialization Scrawl-canvas will search the DOM tree and automatically create Stack wrappers for any element which has been given a `data-scrawl-stack` attribute which resolves to true. Every direct (first level) child inside the stack element will have Element wrappers created for them (except for &lt;canvas> elements). As part of this work, Scrawl-canvas will modify the affected elements' `position` CSS style:
// + Stack elements have `relative` positioning within the DOM
// + Element elements have `absolute` positioning within the Stack
//
// The Stack factory is not used directly; the factory is not exported as part of the __scrawl object__ during Scrawl-canvas initialization. Instead, wrappers can be created for a DOM-based &lt;div> element using the following scrawl function:
// + `scrawl.addStack` - generates a new &lt;div> element, creates a wrapper for it, then adds it to the DOM.
//
// Stack wrapper objects use the __base__, __position__, __anchor__, __cascade__ and __dom__ mixins. Thus Stack wrappers are also __artefact__ objects: if a Stack's DOM element is a direct child of another Stack wrapper's element then it can be positioned, dimensioned and rotated like any other artefact.
//
// By default, all Stack wrappers will track mouse/touch movements across their DOM element, supplying this data to constituent Canvas objects and artefacts as-and-when-required.
//
// Stack wrappers are used by Scrawl-canvas to invoke the __Display cycle cascade__. As such, they include `clear`, `compile`, `show` and `render` functions to manage the Display cycle. These functions are asynchronous, returning Promises.
//
// Stack wrappers are excluded from the Scrawl-canvas packet system; they cannot be saved or cloned. Killing a Stack wrapper will remove its DOM element from the document - __including all Elements and Canvases that it contains__.


// #### Demos:
// + All stack demos include Stack wrapper functionality - most of which happens behind the scenes and does not need to be directly coded.
// + [DOM-001](../../demo/dom-001.html) - Loading the scrawl-canvas library using a script tag in the HTML code
// + [DOM-003](../../demo/dom-003.html) - Dynamically create and clone Element artefacts; drag and drop elements (including SVG elements) around a Stack
// + [DOM-010](../../demo/dom-010.html) - Add and remove (kill) Scrawl-canvas Stack elements programmatically


// #### Imports
import { artefact, constructors, group, purge, stack } from '../core/library.js';

import { addStrings, doCreate, generateUniqueString, isa_canvas, isa_dom, mergeOver, removeItem, xt, λnull, λthis, Ωempty } from '../core/utilities.js';

import { domShow } from '../core/document.js';

import { rootElementsAdd, rootElementsIncludes, rootElementsRemove } from "../core/document-root-elements.js";

import { currentCorePosition, uiSubscribedElements } from '../core/user-interaction.js';

import { makeGroup } from './group.js';
import { makeElement } from './element.js';

import baseMix from '../mixin/base.js';
import cascadeMix from '../mixin/cascade.js';
import domMix from '../mixin/dom.js';
import displayMix from '../mixin/display-shape.js';

import { $DATA_SCRAWL_STACK, $SCRIPT, _computed, _isArray, _values, ABSOLUTE, BORDER_BOX, DATA_SCRAWL_GROUP, DATA_SCRAWL_STACK, DIV, NAME, PC50, RELATIVE, ROOT, STACK, SUBSCRIBE, T_STACK, ZERO_STR } from '../core/shared-vars.js';


// #### Stack constructor
const Stack = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.initializePositions();
    this.initializeCascade();

    this.dimensions[0] = 300;
    this.dimensions[1] = 150;

    this.pathCorners = [];
    this.css = {};
    this.here = {};
    this.perspective = {

        x: PC50,
        y: PC50,
        z: 0
    };
    this.dirtyPerspective = true;

    this.initializeDomLayout(items);

    const g = makeGroup({
        name: this.name,
        host: this.name
    });
    this.addGroups(g.name);

    this.set(this.defs);

    this.initializeDisplayShapeActions();

    this.initializeAccessibility();

    this.set(items);

    const el = this.domElement;

    if (el) {

        const ds = el.dataset;

        if (ds.isResponsive) this.isResponsive = true;

        if (el.getAttribute(DATA_SCRAWL_GROUP) == ROOT) rootElementsAdd(this.name);
    }
    return this;
};


// #### Stack prototype
const P = Stack.prototype = doCreate();
P.type = T_STACK;
P.lib = STACK;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [cascade](../mixin/cascade.html)
// + [dom](../mixin/dom.html)
// + [display](../mixin/displayShape.html)
baseMix(P);
cascadeMix(P);
domMix(P);
displayMix(P);


// #### Stack attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, calculateOrder, stampOrder, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [cascade mixin](../mixin/cascade.html): __groups__.
// + Attributes defined in the [dom mixin](../mixin/dom.html): __domElement, pitch, yaw, offsetZ, css, classes, position, actionResize, trackHere, domAttributes__.
// + Attributes defined in the [display mixin](../mixin/displayShape.html): __breakToBanner, breakToLandscape, breakToPortrait, breakToSkyscraper, actionBannerShape, actionLandscapeShape, actionRectangleShape, actionPortraitShape, actionSkyscraperShape__.
const defaultAttributes = {

// __position__, __perspective__ - while most of the Stack wrapper's DOM element's attributes are handled through CSS, Scrawl-canvas takes control of some positioning-related attributes. Most of these are defined in the [dom mixin](../mixin/dom.html) - but the position and perspective attributes are managed in this module
    position: RELATIVE,
    perspective: null,

// __trackHere__
    trackHere: SUBSCRIBE,

// TODO: This is all about a mad idea we may have for making stacks 'responsive' to viewport changes. It needs a lot more thinking through. Search on 'isResponsive' to find the relevant function below
    isResponsive: false,
    containElementsInHeight: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet/Clone management
// This functionality is disabled for Stack objects
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {

    return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;


// #### Kill functionality
P.factoryKill = function () {

    const myname = this.name;

    // rootElements and uiSubscribedElements arrays
    rootElementsRemove(myname);
    removeItem(uiSubscribedElements, myname);

    // Groups
    if (group[myname]) group[myname].kill();

    _values(artefact).forEach(art => {

        if (art.host === myname) art.kill();
    });

    // DOM removals
    this.domElement.remove();
}


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// Similar to start, handle, dimensions, etc Scrawl-canvas supplies some pseudo-attributes to help set and manage the Stack wrapper's `perspective` object:
// + `perspectiveX`
// + `perspectiveY`
// + `perspectiveZ`
G.perspectiveX = function () {

    return this.perspective.x;
};
G.perspectiveY = function () {

    return this.perspective.y;
};
G.perspectiveZ = function () {

    return this.perspective.z;
};

S.perspectiveX = function (item) {

    this.perspective.x = item;
    this.dirtyPerspective = true;
};
S.perspectiveY = function (item) {

    this.perspective.y = item;
    this.dirtyPerspective = true;
};
S.perspectiveZ = function (item) {

    this.perspective.z = item;
    this.dirtyPerspective = true;
};
S.perspective = function (item = Ωempty) {

    this.perspective.x = (xt(item.x)) ? item.x : this.perspective.x;
    this.perspective.y = (xt(item.y)) ? item.y : this.perspective.y;
    this.perspective.z = (xt(item.z)) ? item.z : this.perspective.z;
    this.dirtyPerspective = true;
};
D.perspectiveX = function (item) {

    this.perspective.x = addStrings(this.perspective.x, item);
    this.dirtyPerspective = true;
};
D.perspectiveY = function (item) {

    this.perspective.y = addStrings(this.perspective.y, item);
    this.dirtyPerspective = true;
};

// `group` - get the Stack's namesake group
// + Note that Stack wrappers can action more than one group
G.group = function () {

    return group[this.name];
};


// #### Prototype functions

// `updateArtefacts` - internal function. Iterate through all Element and Canvas wrappers associated with the Stack wrapper's Group object and set a range of dirty flags on them, for future processing by each as appropriate.
P.updateArtefacts = function (items = Ωempty) {

    this.groupBuckets.forEach(grp => {

        grp.artefactCalculateBuckets.forEach(art => {

            if (items.dirtyScale) art.dirtyScale = true;
            if (items.dirtyDimensions) art.dirtyDimensions = true;
            if (items.dirtyLock) art.dirtyLock = true;
            if (items.dirtyStart) art.dirtyStart = true;
            if (items.dirtyOffset) art.dirtyOffset = true;
            if (items.dirtyHandle) art.dirtyHandle = true;
            if (items.dirtyRotation) art.dirtyRotation = true;
            if (items.dirtyPathObject) art.dirtyPathObject = true;
        })
    });
};

// `cleanDimensionsAdditionalActions` - overwrites mixin/position function. Promulgates Stack dimension changes through to all Element and Canvas wrappers associated with the Stack wrapper's Group object.
P.cleanDimensionsAdditionalActions = function () {

    if (this.groupBuckets) {

        this.updateArtefacts({
            dirtyDimensions: true,
            dirtyPath: true,
            dirtyStart: true,
            dirtyHandle: true,
        });
    }

    this.dirtyDomDimensions = true;
    this.dirtyPath = true;
    this.dirtyStart = true;
    this.dirtyHandle = true;
    this.dirtyDisplayShape = true;
    this.dirtyDisplayArea = true;
};

// `cleanPerspective` - internal function
P.cleanPerspective = function () {

    this.dirtyPerspective = false;

    const p = this.perspective;

    this.domPerspectiveString = `perspective-origin: ${p.x} ${p.y}; perspective: ${p.z}px;`;
    this.domShowRequired = true;

    if (this.groupBuckets) {

        this.updateArtefacts({
            dirtyHandle: true,
            dirtyPathObject: true,
        });
    }
};


// TODO - experimental! `checkResponsive`
//
// Scrawl-canvas Stack artefacts - at the __root__ level - cannot have 'String%' dimensions, which means they have absolute dimensions - because everything that relies on 'String%' dimensions needs an absolute (number) value for their calculations at the root, which is the stack.
//
// But we still need to make Stacks responsive. We do this by checking if the viewport dimensions have changed (a resize action has taken place) and - if yes - update the stack's absolute dimensions accordingly ... if the __isResponsive__ flag has been set to true for the Stack (default is 'false' - may change this in due course).
//
// We call this check in the __clear__ function below, because it's doing nothing else useful at the moment and it makes sense to get updates in place here before everything launches into the compile part of the display cycle
P.checkResponsive = function () {

    if (this.isResponsive && this.trackHere) {

        // Start keeping track of the viewport dimensions
        if (!this.currentVportWidth) this.currentVportWidth = currentCorePosition.w;
        if (!this.currentVportHeight) this.currentVportHeight = currentCorePosition.h;

        // If last display cycle responded to dimension changes, need to finalise height now
        if (this.dirtyHeight && this.containElementsInHeight) {

            this.dirtyHeight = false;
        }

        if (this.currentVportWidth !== currentCorePosition.w) {

            this.currentVportWidth = currentCorePosition.w;

            if (this.containElementsInHeight) {

                // Won't be updated until the next display cycle, but flag it now for action
                // - needed because text in elements flow as part of normal DOM operations
                this.dirtyHeight = true;
            }
        }

        if (this.currentVportHeight !== currentCorePosition.h) {

            this.currentVportHeight = currentCorePosition.h;
        }
    }
};


// ##### Display cycle functions

// `clear`
P.clear = function () {

    this.checkResponsive();
};

// `compile`
P.compile = function () {

    this.sortGroups();
    this.prepareStamp()
    this.stamp();

    this.groupBuckets.forEach(mygroup => mygroup.stamp());
};

// `show`
P.show = function () {

    domShow();
};

// `render`
P.render = function () {

    this.compile();
    this.show();
};

// `addExistingDomElements` - argument is a CSS query search String. All elements in the DOM matching the search will be __moved__ into the Stack wrapper's DOM element and given Scrawl-canvas Element wrappers. While Scrawl-canvas will try its best to respect the elements' CSS attributes, they will be __positioned absolutely__ within the Stack and given start, handle and offset values of `[0, 0]`.
P.addExistingDomElements = function (search) {

    if (xt(search)) {

        let el, captured, i, iz;

        const elements = (search.substring) ? document.querySelectorAll(search) : [].concat(search);

        for (i = 0, iz = elements.length; i < iz; i++) {

            el = elements[i];

            if (isa_dom(el)) {

                captured = makeElement({
                    name: el.id || el.name,
                    domElement: el,
                    group: this.name,
                    host: this.name,
                    position: ABSOLUTE,
                    setInitialDimensions: true,
                });

                if (captured && captured.domElement) this.domElement.appendChild(captured.domElement);
            }
        }
    }
    return this;
};

// `addNewElement` - takes an 'items' object as an argument. The only required attribute of the argument is __tag__, which determines the type of element that will be created (for example - setting tag to 'div' will create a new &lt;div> element)
// + Any other Element artefact attribute can also be included in the argument object, including __text__ and __content__ attributes to set the new DOM Element's textContent and innerHTML attributes.
// + If position and dimension values are not included in the argument, the element will be given default values of [0,0] for start, offset and handle; and dimensions of 100px width and height.
// + The new element will also default to a CSS box-sizing style value of 'border-box', unless the argument's __boxSizing__ attribute has been set to 'content-box' - this will override any 'borderBox' attribute value in the argument's __.css__ object (if one has been included)
P.addNewElement = function (items) {

    if (items && items.tag) {

        items.domElement = document.createElement(items.tag);
        items.domElement.setAttribute(DATA_SCRAWL_GROUP, this.name);
        if (!xt(items.group)) items.group = this.name;
        items.host = this.name;

        if (!items.position) items.position = ABSOLUTE;

        if (items.dimensions && _isArray(items.dimensions)) {

            items.width = items.dimensions[0] || 100;
            items.height = items.dimensions[1] || 100;
        }

        if (!xt(items.width)) items.width = 100;
        if (!xt(items.height)) items.height = 100;

        const myElement = makeElement(items);

        if (myElement && myElement.domElement) {

            if (!xt(items.boxSizing)) myElement.domElement.style.boxSizing = BORDER_BOX;

            this.domElement.appendChild(myElement.domElement);
        }

        return myElement;
    }
    return false;
};


// #### Factory
const makeStack = function (items) {

    if (!items) return false;
    return new Stack(items);
};

constructors.Stack = Stack;


// #### Stack discovery
// `Exported function` (to modules). Parse the DOM, looking for all elements that have been given a __data-stack__ attribute; then create __Stack__ artefact wrappers for each of them.
//
// This function will also create wrappers for all __direct child elements__ (one level down) within the stack, and create appropriate wrappers (Stack, Canvas, Element) for them.
export const getStacks = function (query = $DATA_SCRAWL_STACK) {

    document.querySelectorAll(query).forEach(el => addInitialStackElement(el));
};

// Create a __stack__ artefact wrapper for a given stack element.
const addInitialStackElement = function (el) {

    let mygroup = el.getAttribute(DATA_SCRAWL_GROUP),
        myname = el.id || el.getAttribute(NAME),
        position = ABSOLUTE;

    if (!mygroup) {

        el.setAttribute(DATA_SCRAWL_GROUP, ROOT);
        mygroup = ROOT;
        position = RELATIVE;
    }

    if (!myname) {

        myname = generateUniqueString();
        el.id = myname;
    }

    const mystack = makeStack({
        name: myname,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: true,
    });

    processNewStackChildren(el, myname);

    return mystack;
};

// Helper function for addInitialStackElement()
const processNewStackChildren = function (el, name) {

    const hostDims = el.getBoundingClientRect();

    let y = 0,
        dims, computed, yHeight, args;

    // Only go down one level of hierarchy here; stacks don't do hierarchies, only interested in knowing about immediate child elements
    Array.from(el.children).forEach(child => {

        if (child.getAttribute(DATA_SCRAWL_STACK) == null && !isa_canvas(child) && child.tagName != $SCRIPT) {

            dims = child.getBoundingClientRect();
            computed = _computed(child);

            yHeight = parseFloat(computed.marginTop) + parseFloat(computed.borderTopWidth) + parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom) + parseFloat(computed.borderBottomWidth) + parseFloat(computed.marginBottom);

            y = (!y) ? dims.top - hostDims.top : y;

            args = {
                name: child.id || child.getAttribute(NAME),
                domElement: child,
                group: name,
                host: name,
                position: ABSOLUTE,
                width: dims.width,
                height: dims.height,
                startX: dims.left - hostDims.left,
                startY: y,
                classes: (child.className) ? child.className : ZERO_STR,
            };

            y += yHeight + dims.height;

            makeElement(args);
        }

        // No need to worry about processing child stacks - they'll already be in the list of stacks to be processed
        else child.setAttribute(DATA_SCRAWL_GROUP, name);
    });
};

// `Exported function` (to modules and scrawl object). Use __addStack__ to add a Scrawl-canvas stack element to a web page, or transform an existing element into a stack element. The items argument can include
// + __element__ - the DOM element to be the stack - if not present, will autogenerate a div element
// + __host__ - the host element, either as the DOM element itself, or some sort of CSS search string; if not present, will create the stack at the stack element's current place or, failing all else, add the stack to the end of the document body
// + __name__ - String identifier for the stack; if not included the function will attempt to use the element's existing id or name attribute or, failing that, generate a random name for the stack.
// + any other regular stack attribute
export const addStack = function (items = Ωempty) {

    // define variables
    let el, host, hostinscrawl, mygroup, name,
        position = ABSOLUTE;

    // get, or generate a new, stack-to-be element
    if (items.element && items.element.substring) el = document.querySelector(items.element);
    else if (isa_dom(items.element)) el = items.element;
    else el = document.createElement(DIV);

    // get element's host (parent-to-be) element
    if (items.host && items.host.substring) {

        host = document.querySelector(items.host);
        if (!host) host = document.body;
    }
    else if (isa_dom(items.host)) host = items.host;
    else if (xt(el.parentElement)) host = el.parentElement;
    else host = document.body;

    // if dimensions have been set in the argument, apply them to the stack-to-be element
    if (xt(items.width)) el.style.width = (items.width.toFixed) ? `${items.width}px` : items.width;
    if (xt(items.height)) el.style.height = (items.height.toFixed) ? `${items.height}px` : items.height;

    // make sure the stack-to-be element has an id attribute
    name = items.name || el.id || el.getAttribute(NAME) || ZERO_STR;
    if (!name) name = generateUniqueString();
    el.id = name;

    // set the 'data-scrawl-stack' attribute on the stack-to-be element
    el.setAttribute(DATA_SCRAWL_STACK, DATA_SCRAWL_STACK);

    // determine whether the parent element is already known to Scrawl-canvas - affects the stack-to-be element's group
    if (host && host.getAttribute(DATA_SCRAWL_STACK) != null) {

        hostinscrawl = artefact[host.id];

        mygroup = (hostinscrawl) ? hostinscrawl.name : ROOT;
    }
    else mygroup = ROOT;

    // set the 'data-scrawl-group' attribute on the stack-to-be element
    el.setAttribute(DATA_SCRAWL_GROUP, mygroup);

    // determine what the stack-to-be element's position style attribute will be
    if (mygroup == ROOT) position = RELATIVE;

    // add (or move) the stack-to-be element to/in the DOM
    if (!el.parentElement || host.id !== el.parentElement.id) host.appendChild(el);

    // create the Scrawl-canvas Stack artefact
    const mystack = makeStack({
        name: name,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: true
    });

    processNewStackChildren(el, name);

    // in case any of the child elements were already a Scrawl-canvas stack, un-root them (if required)
    Array.from(el.childNodes).forEach(child => {

        if (child.id && rootElementsIncludes(child.id)) rootElementsRemove(child.id);
    });

    // set the new Stack's remaining attributes, clearing out any attributes already handled
    delete items.name;
    delete items.element;
    delete items.host;
    delete items.width;
    delete items.height;
    mystack.set(items);

    // tidy up and complete
    return mystack;
};

// `Exported function` (to modules and scrawl object). Parse the DOM, looking for a specific element; then create a __Stack__ artefact wrapper for it.
export const getStack = function (search) {

    const el = document.querySelector(`#${search}`);

    const s = stack[search];

    if (s) {

        if (el.dataset.scrawlGroup != null) return s;
        else purge(search);
    }

    if (el) {
        const newStack = addInitialStackElement(el);
        return newStack;
    }
    return undefined;
};

