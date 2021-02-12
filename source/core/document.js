// # DOM management
// Core DOM element discovery and management functionality, and the Scrawl-canvas __Display cycle__.
//
// Scrawl-canvas breaks down the display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.
//
// The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value


// #### Imports
import { isa_canvas, generateUniqueString, isa_dom, pushUnique, removeItem, xt } from "./utilities.js";
import { artefact, canvas, group, stack, css, xcss } from "./library.js";

import { makeStack } from "../factory/stack.js";
import { makeElement } from "../factory/element.js";
import { makeCanvas } from "../factory/canvas.js";


// #### Root elements
//
// `Exported array and function` (to modules). Root elements are the boxes whose dimensions define the dimensions and positioning of all that they contain. All &lt;canvas> elements are root elements. Scrawl-canvas also allows other DOM elements (typically &lt;div> elements) to be defined as root elements called __stacks__, whose child elements can then be positioned and dimensioned just like entity objects in a canvas.
//
// Stacks can be nested within each other, and canvases can also be nested inside a stack. (Nothing can nest inside a canvas element). Only the top level stack will be included in the rootElements array.
//
// The Scrawl-canvas __Display cycle__ can start at the rootElements array, with each member of the array processed in turn.
//
// The __rootElements__ array keeps track of all 'root' stack artefacts, and also includes all canvas artefacts, whether they're part of a stack or not. __setRootElementSort__ forces the root
let rootElements = [],
    setRootElementsSort = () => {rootElementsSort = true};

// Local variables
let rootElements_sorted = [],
    rootElementsSort = true;
    
// Scrawl-canvas rootElements sorter uses a 'bucket sort' algorithm
const sortRootElements = function () {

    let floor = Math.floor;

    if (rootElementsSort) {

        rootElementsSort = false;

        let buckets = [],
            art, order;

        rootElements.forEach((item) => {

            art = artefact[item];

            if (art) {

                order = floor(art.order) || 0;

                if (!buckets[order]) buckets[order] = [];
                
                buckets[order].push(art.name);
            }
        });

        rootElements_sorted = buckets.reduce((a, v) => a.concat(v), []);
    }
};

// #### Stack discovery
// `Exported function` (to modules). Parse the DOM, looking for all elements that have been given a __data-stack__ attribute; then create __Stack__ artefact wrappers for each of them. 
//
// This function will also create wrappers for all __direct child elements__ (one level down) within the stack, and create appropriate wrappers (Stack, Canvas, Element) for them.
const getStacks = function () {
        
    document.querySelectorAll('[data-stack]').forEach(el => addInitialStackElement(el));
};

// Create a __stack__ artefact wrapper for a given stack element.
const addInitialStackElement = function (el) {

    let mygroup = el.getAttribute('data-group'),
        myname = el.id || el.getAttribute('name'),
        position = 'absolute';

    if (!mygroup) {

        el.setAttribute('data-group', 'root');
        mygroup = 'root';
        position = 'relative';
    }

    if (!myname) {

        myname = generateUniqueString();
        el.id = myname;
    }

    let mystack = makeStack({
        name: myname,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: true
    });

    processNewStackChildren(el, myname);

    return mystack;
};

// Helper function for addInitialStackElement()
const processNewStackChildren = function (el, name) {

    let hostDims = el.getBoundingClientRect(),
        y = 0;

    // Only go down one level of hierarchy here; stacks don't do hierarchies, only interested in knowing about immediate child elements
    Array.from(el.children).forEach(child => {
    
        if (child.getAttribute('data-stack') == null && !isa_canvas(child) && child.tagName !== 'SCRIPT') {

            let dims = child.getBoundingClientRect(),
                computed = window.getComputedStyle(child);

            let yHeight = parseFloat(computed.marginTop) + parseFloat(computed.borderTopWidth) + parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom) + parseFloat(computed.borderBottomWidth) + parseFloat(computed.marginBottom);

            y = (!y) ? dims.top - hostDims.top : y;

            let args = {
                name: child.id || child.getAttribute('name'),
                domElement: child,
                group: name,
                host: name,
                position: 'absolute',
                width: dims.width,
                height: dims.height,
                startX: dims.left - hostDims.left,
                startY: y,
                classes: (child.className) ? child.className : '',
            };

            y += yHeight + dims.height;

            makeElement(args);
        }

        // No need to worry about processing child stacks - they'll already be in the list of stacks to be processed
        else child.setAttribute('data-group', name);
    });
};

// `Exported function` (to modules and scrawl object). Use __addStack__ to add a Scrawl-canvas stack element to a web page, or transform an existing element into a stack element. The items argument can include 
// + __element__ - the DOM element to be the stack - if not present, will autogenerate a div element
// + __host__ - the host element, either as the DOM element itself, or some sort of CSS search string; if not present, will create the stack at the stack element's current place or, failing all else, add the stack to the end of the document body
// + __name__ - String identifier for the stack; if not included the function will attempt to use the element's existing id or name attribute or, failing that, generate a random name for the stack.
// + any other regular stack attribute
const addStack = function (items = {}) {

    // define variables
    let el, host, hostinscrawl, mystack, mygroup, name,
        position = 'absolute',
        newElement = false;

    // get, or generate a new, stack-to-be element
    if (items.element && items.element.substring) el = document.querySelector(items.element);
    else if (isa_dom(items.element)) el = items.element;
    else {

        newElement = true;
        el = document.createElement('div');
    }

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
    name = items.name || el.id || el.getAttribute('name') || '';
    if (!name) name = generateUniqueString();
    el.id = name;

    // set the 'data-stack' attribute on the stack-to-be element
    el.setAttribute('data-stack', 'data-stack');

    // determine whether the parent element is already known to Scrawl-canvas - affects the stack-to-be element's group 
    if (host && host.getAttribute('data-stack') != null) {

        hostinscrawl = artefact[host.id];

        mygroup = (hostinscrawl) ? hostinscrawl.name : 'root';
    }
    else mygroup = 'root';

    // set the 'data-group' attribute on the stack-to-be element
    el.setAttribute('data-group', mygroup);

    // determine what the stack-to-be element's position style attribute will be
    if (mygroup === 'root') position = 'relative';

    // add (or move) the stack-to-be element to/in the DOM
    if (!el.parentElement || host.id !== el.parentElement.id) host.appendChild(el);

    // create the Scrawl-canvas Stack artefact
    mystack = makeStack({
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

        if (child.id && rootElements.indexOf(child.id) >= 0) removeItem(rootElements, child.id);
    });

    // set the new Stack's remaining attributes, clearing out any attributes already handled
    delete items.name;
    delete items.element;
    delete items.host;
    delete items.width;
    delete items.height;
    mystack.set(items);

    // tidy up and complete
    rootElementsSort = true;
    return mystack;
};

// #### Canvas discovery
// `Exported function` (to modules). Parse the DOM, looking for &lt;canvas> elements; then create __Canvas__ artefact and __Cell__ asset wrappers for each canvas found. Canvas elements do not need to be part of a stack and can appear anywhere in the HTML body.
const getCanvases = function () {

    let item;

    document.querySelectorAll('canvas').forEach((el, index) => {

        item = addInitialCanvasElement(el);

        if (!index) setCurrentCanvas(item);
    });
};

// Create a __canvas__ artefact wrapper for a given canvas element.
const addInitialCanvasElement = function (el) {

    let mygroup = el.getAttribute('data-group'),
        myname = el.id || el.getAttribute('name'),
        position = 'absolute';

    if (!mygroup) {

        el.setAttribute('data-group', 'root');
        mygroup = 'root';
        position = el.style.position;
    }

    if (!myname) {

        myname = generateUniqueString();
        el.id = myname;
    }

    return makeCanvas({
        name: myname,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: true
    });
};

// `Exported function` (to modules and scrawl object). Parse the DOM, looking for a specific &lt;canvas> element; then create a __Canvas__ artefact and __Cell__ asset wrapper for it.
const getCanvas = function (search) {

    let el = document.querySelector(search),
        canvas = false;

    if (el) canvas = addInitialCanvasElement(el);

    setCurrentCanvas(canvas);
    return canvas;
};

// `Exported function` (to modules and scrawl object). Parse the DOM, looking for a specific element; then create a __Stack__ artefact wrapper for it.
const getStack = function (search) {

    let el = document.querySelector(search),
        stack;

    if (el) stack = addInitialStackElement(el);
    return stack;
};

// Scrawl-canvas expects one canvas element (if any canvases are present) to act as the 'current' canvas on which other factory functions - such as adding new entitys - can act. The current canvas can be changed at any time using __scrawl.setCurrentCanvas__

// `Exported variables` (to modules). 
let currentCanvas = null,
    currentGroup = null;

// `Exported function` (to modules and scrawl object). 
const setCurrentCanvas = function (item) {

    let changeFlag = false;

    if (item) {

        if (item.substring) {

            let mycanvas = canvas[item];

            if (mycanvas) {
                currentCanvas = mycanvas;
                changeFlag = true;    
            }
        }
        else if (item.type === 'Canvas') {

            currentCanvas = item;    
            changeFlag = true;    
        } 
    }

    if (changeFlag && currentCanvas.base) {

        let mygroup = group[currentCanvas.base.name];

        if (mygroup) currentGroup = mygroup;
    }
};

// `Exported function` (to modules and scrawl object). Use __addCanvas__ to add a Scrawl-canvas canvas element to a web page. The items argument should include 
// + __host__ - the host element, either as the DOM element itself, or some sort of CSS search string, or a Scrawl-canvas Stack entity. If no host is supplied, Scrawl-canvas will add the new canvas element to the DOM document body; in all cases, the new canvas element is appended at the end of the host element (or DOM document)
// + __name__ - String identifier for the element; will generate a random name for the canvas if no name is supplied.
// + any other regular Scrawl-canvas Canvas artefact attribute
//
// By default, Scrawl-canvas will setup the new Canvas as the 'current canvas', and will add mouse/pointer tracking functionality to it. If no dimensions are supplied then the Canvas will default to 300px wide and 150px high.
const addCanvas = function (items = {}) {

    let el = document.createElement('canvas'),
        myname = (items.name) ? items.name : generateUniqueString(),
        host = items.host,
        mygroup = 'root',
        width = items.width || 300,
        height = items.height || 150,
        position = 'relative';

    if (host.substring) {

        let temphost = artefact[host];

        if (!temphost && host) {

            host = document.querySelector(host);

            if (host) mygroup = host.id;
        }
        else host = temphost;
    }

    if (host) {

        if (host.type === 'Stack') {

            mygroup = host.name;
            position = 'absolute';
            host = host.domElement;
        }
        else if (!isa_dom(host)) host = document.body;
    }
    else host = document.body;

    el.id = myname;
    el.setAttribute('data-group', mygroup);
    el.width = width;
    el.height = height;
    el.style.position = position;

    host.appendChild(el);

    let mycanvas = makeCanvas({
        name: myname,
        domElement: el,
        group: mygroup,
        host: mygroup,
        position: position,
        setInitialDimensions: false,
        setAsCurrentCanvas: (xt(items.setAsCurrentCanvas)) ? items.setAsCurrentCanvas : true,
        trackHere: (xt(items.trackHere)) ? items.trackHere : 'subscribe',
    });

    delete items.group;
    delete items.host;
    delete items.name;
    delete items.element;
    delete items.position;
    delete items.setInitialDimensions;
    delete items.setAsCurrentCanvas;
    delete items.trackHere;

    mycanvas.set(items);

    return mycanvas;
};


// #### The Display cycle
// Scrawl-canvas breaks down the Display cycle into three parts: __clear__; __compile__; and __show__. These can be triggered either as a single, combined __render__ operation, or separately as-and-when needed.
//
// The order in which DOM stack and canvas elements are processed during the display cycle can be changed by setting that element's controller's __order__ attribute to a higher or lower integer value; elements are processed (in batches) from lowest to highest order value
//
// Each display cycle function is a normal Javascript function, invoked with no arguments and returning no status
//
// Note that Scrawl-canvas supplies a convenience function - __makeRender()__ - for automating the process of creating an animation object to handle the Display cycle

// ##### Clear
//
// + For canvas artefacts, clear its Cell assets' display (reset all pixels to 0, or the designated background color) ready for them to be redrawn
// + For stack artefacts - no action required

// `Exported function` (to modules and scrawl object). 
const clear = function (...items) {

    displayCycleHelper(items);
    return displayCycleBatchProcess('clear');
};

// ##### Compile
//
// + For both canvas and stack artefacts, perform necessary entity/element positional calculations
// + Additionally for canvas artefacts, stamp associated entitys onto the canvas's constituent cell assets

// `Exported function` (to modules and scrawl object). 
const compile = function (...items) {

    displayCycleHelper(items);
    return displayCycleBatchProcess('compile');
};

// ##### Show
//
// + For canvas artefacts, stamp additional 'layer' canvases onto the base canvas, then copy the base canvas onto the display canvas
// + For stack artefacts - invoke the __domShow__ function, if any of its constituent elements require DOM-related updating

// `Exported function` (to modules and scrawl object). 
const show = function (...items) {

    displayCycleHelper(items);
    return displayCycleBatchProcess('show');
};

// ##### Render
//
// + Orchestrate the clear, compile and show actions on each stack and canvas DOM element

// `Exported function` (to modules and scrawl object). 
const render = function (...items) {

    displayCycleHelper(items);
    return displayCycleBatchProcess('render');
};

// Helper functions coordinate the actions required to complete a display cycle
const displayCycleHelper = function (items) {

    if (items.length) rootElements_sorted = items;
    else if (rootElementsSort) sortRootElements();
};

const displayCycleBatchProcess = function (method) {

    rootElements_sorted.forEach(name => {

        let item = artefact[name];

        if (item && item[method]) item[method]();
    });
};


// #### DOM element updates
// Scrawl-canvas will batch process all DOM element updates, to minimize disruptive impacts on web page performance. We don't maintain a full/comprehensive 'shadow' or 'virtual' DOM, but Scrawl-canvas does maintain a record of element (absolute) position and dimension data, alongside details of scaling, perspective and any other CSS related data (including CSS classes) which we tell it about, on a per-element basis.
//
// The decision on whether to update a DOM element is mediated through a suite of 'dirty' flags assigned on the Scrawl-canvas artefact object which wraps each DOM element. As part of the compile component of the Scrawl-canvas Display cycle, the code will take a decision on whether the DOM element needs to be updated and insert the artefact's name in the __domShowElements__ array, and set the __domShowRequired__ flag to true, which will then trigger the __domShow()__ function to run at the end of each Display cycle.
//
// The domShow() function is exported, and can be triggered for any DOM-related artefact at any time by invoking it with the artefact's name as the function's argument.
//
// The order in which DOM elements get updated is determined by the __order__ attributes set on the Stack artefact, on Group objects, and (least important) on the element artefact.

// Local variable
const domShowElements = [];

// `Exported function` (to modules). 
const addDomShowElement = function (item = '') {

    if (!item) throw new Error(`core/document addDomShowElement() error - false argument supplied: ${item}`);
    if (!item.substring) throw new Error(`core/document addDomShowElement() error - argument not a string: ${item}`);

    pushUnique(domShowElements, item);
};

let domShowRequired = false;

// `Exported function` (to modules). 
const setDomShowRequired = function (val = true) {

    domShowRequired = val;
};

// `Exported function` (to modules). This is the __main DOM manipulation function__ which will be triggered once during each Display cycle.
const domShow = function (singleArtefact = '') {

    if (domShowRequired || singleArtefact) {

        let myartefacts;

        if (singleArtefact) myartefacts = [singleArtefact];
        else {

            domShowRequired = false;
            myartefacts = [].concat(domShowElements);
            domShowElements.length = 0;
        }

        // given the critical nature of these loops, using 'for' instead of 'forEach'
        let i, iz, name, art, el, style,
            p, dims, w, h,
            j, jz, items, keys, key, keyName, value;

        for (i = 0, iz = myartefacts.length; i < iz; i++) {

            name = myartefacts[i];

            art = artefact[name];
            if (!art) throw new Error(`core/document domShow() error - artefact missing: ${name}`);

            el = art.domElement;
            if (!el) throw new Error(`core/document domShow() error - DOM element missing: ${name}`);

            style = el.style;

            // update perspective
            if (art.dirtyPerspective) {

                art.dirtyPerspective = false;

                p = art.perspective;

                style.perspectiveOrigin = `${p.x} ${p.y}`;
                style.perspective = `${p.z}px`;
            }

            // update position
            if (art.dirtyPosition) {

                art.dirtyPosition = false;
                style.position = art.position;
            }

            // update dimensions
            if (art.dirtyDomDimensions) {

                art.dirtyDomDimensions = false;

                dims = art.currentDimensions;
                w = dims[0];
                h = dims[1];

                if (art.type === 'Canvas') {

                    el.width = w;
                    el.height = h;

                    // if (art.renderOnResize) art.render().catch(err => console.log(err));
                    if (art.renderOnResize) art.render();
                }
                else {

                    style.width = `${w}px`;
                    style.height = (h) ? `${h}px` : 'auto';
                }
            }

            // update handle/transformOrigin
            if (art.dirtyTransformOrigin) {

                art.dirtyTransformOrigin = false;
                style.transformOrigin = art.currentTransformOriginString;
            }

            // update transform
            if (art.dirtyTransform) {

                art.dirtyTransform = false;
                style.transform = art.currentTransformString;
            }

            // update visibility
            if (art.dirtyVisibility) {

                art.dirtyVisibility = false;
                style.display = (art.visibility) ? 'block' : 'none';
            }

            // update other CSS changes
            if (art.dirtyCss) {

                art.dirtyCss = false;

                items = art.css || {};
                keys = Object.keys(items);

                for (j = 0, jz = keys.length; j < jz; j++) {

                    key = keys[j];
                    value = items[key];

                    if (xcss.has(key)) {

                        keyName = `${key[0].toUpperCase}${key.substr(1)}`;

                        style[`webkit${keyName}`] = value;
                        style[`moz${keyName}`] = value;
                        style[`ms${keyName}`] = value;
                        style[`o${keyName}`] = value;
                        style[key] = value;
                    }
                    else if (css.has(key)) style[key] = value;
                }
            }

            // update element classes
            if (art.dirtyClasses) {

                art.dirtyClasses = false;
                if (el.className.substring) el.className = art.classes;
            }
        }
    }
};

// #### DOM Holding areas
// `Exported handles` (to modules). During its initialization phase, Scrawl-canvas will add two hidden 'hold' elements at the top and bottom of the document body where it can add additional elements as-and-when required. 

// Mainly for ARIA content. ARIA labels and descriptions are used by Scrawl-canvas &lt;canvas> elements to inform non-visual website visitors about content in the canvas.
let scrawlCanvasHold = document.createElement('div');
scrawlCanvasHold.style.padding = 0;
scrawlCanvasHold.style.border = 0;
scrawlCanvasHold.style.margin = 0;
scrawlCanvasHold.style.width = '4500px';
scrawlCanvasHold.style.boxSizing = 'border-box';
scrawlCanvasHold.style.position = 'absolute';
scrawlCanvasHold.style.top = '-5000px';
scrawlCanvasHold.style.left = '-5000px';
scrawlCanvasHold.id = 'Scrawl-ARIA-default-hold';
document.body.appendChild(scrawlCanvasHold);

// Navigation area - canvas anchor links. Canvases create their own (hidden) &lt;nav> elements that directly follow them in the DOM. These are used to store &lt;a> links for clickable entitys in the canvas display, making them accessible to non-visual users (for example: screen readers)
let scrawlNavigationHold = document.createElement('nav');
scrawlNavigationHold.style.position = 'absolute';
scrawlNavigationHold.style.top = '-5000px';
scrawlNavigationHold.style.left = '-5000px';
scrawlNavigationHold.id = 'Scrawl-navigation-default-hold';
document.body.prepend(scrawlNavigationHold);

// #### Exports
export {
    getCanvases,
    getCanvas,
    getStacks,
    getStack,

    addCanvas,
    addStack,
    setCurrentCanvas,

    currentCanvas,
    currentGroup,

    rootElements,
    setRootElementsSort,

    clear,
    compile,
    show,
    render,

    addDomShowElement,
    setDomShowRequired,
    domShow,

    scrawlCanvasHold,
    scrawlNavigationHold,
};
