// # Core user interaction
// A set of functions that are closely tied to the [core/document.js](./document.html) functionality, and a couple of additional coder convenience functions.
//
// Scrawl-canvas adds some event listeners (mouse movement, screen resize, scrolling) to the window object. These help maintain a centralizerd mouse/touch cursor tracking facility that updates here and then cascades and localizes to artefacts (stacks, canvases and element wrapper objects) which need to keep track of a __local, immediately updated mouse/touch coordinate__.
//
// Checks to see if events have occurred happen once per requestAnimationFrame tick - this is to choke the more eager event listeners which can, at times, fire thousands of times a second.

// #### Imports
import * as library from "./library.js";
import { xt, xta, isa_dom, isa_fn, isa_boolean, isa_obj, λnull } from "./utilities.js";
import { addListener, addNativeListener, removeListener, removeNativeListener } from "./events.js";

import { makeAnimation } from "../factory/animation.js";

// `Exported array` (to modules). DOM element wrappers subscribe for updates by adding themselves to the __uiSubscribedElements__ array. When an event fires, the updated data will be pushed to them automatically
const uiSubscribedElements = [];


// Local boolean flags. 
let trackMouse = false,
    mouseChanged = false,
    viewportChanged = false;


// `Exported object` (to modules and the scrawl object). The __currentCorePosition__ object holds the __global__ mouse cursor position, alongside browser view dimensions and scroll position
const currentCorePosition = {
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    w: 0,
    h: 0,
    type: 'mouse'
};


// __resizeAction__ function - to check if a view resize has occurred; if yes, flag that currentCorePosition object needs to be updated
const resizeAction = function (e) {

    let w = document.documentElement.clientWidth,
        h = document.documentElement.clientHeight;

    if (currentCorePosition.w !== w || currentCorePosition.h !== h) {
        currentCorePosition.w = w;
        currentCorePosition.h = h;
        mouseChanged = true;
        viewportChanged = true;
    }
};


// __scrollAction__ function - to check if a view scroll has occurred; if yes, flag that currentCorePosition object needs to be updated
const scrollAction = function (e) {

    let x = window.pageXOffset,
        y = window.pageYOffset;

    if (currentCorePosition.scrollX !== x || currentCorePosition.scrollY !== y) {
        currentCorePosition.x += (x - currentCorePosition.scrollX);
        currentCorePosition.y += (y - currentCorePosition.scrollY);
        currentCorePosition.scrollX = x;
        currentCorePosition.scrollY = y;
        mouseChanged = true;
    }
};


// __moveAction__ function - to check if mouse cursor position has changed; if yes, update currentCorePosition object and flag that the updated needs to cascade to subscribed elements at the next RAF invocation.

// The events that trigger this function (pointermove, pointerup, pointerdown, pointerleave, pointerenter; or mousemove, mouseup, mousedown, mouseleave, mouseenter) are tied to the window object, not to any particular DOM element.
const moveAction = function (e) {

    let x = Math.round(e.pageX),
        y = Math.round(e.pageY);

    if (currentCorePosition.x !== x || currentCorePosition.y !== y) {
        currentCorePosition.type = (navigator.pointerEnabled) ? 'pointer' : 'mouse';
        currentCorePosition.x = x;
        currentCorePosition.y = y;
        mouseChanged = true;
    }
};


// __touchAction__ function - maps touch coordinates to the mouse cursor position (via currentCorePosition) and then immediately invokes a cascade update action to all subscribed elements.

// The events that trigger this function (touchstart, touchmove, touchend, touchcancel) are tied to the window object, not to any particular DOM element.

// Note: this is different to mouse moveAction, which is choked via an animation object so update checks happen on each requestAnimationFrame. 
//
// TODO: Need to keep an eye on how many times touchAction gets run, for example during a touch-driven drag-and-drop action. If necessary, add a Date.now mediated choke to the check (say minimum 15ms between checks?) to minimize impact on the wider Scrawl-canvas ecosystem.
const touchAction = function (e) {

    if (e.type === 'touchstart' || e.type === 'touchmove') {

        if (e.touches && e.touches[0]) {

            let touch = e.touches[0],
                x = Math.round(touch.pageX),
                y = Math.round(touch.pageY);

            if (currentCorePosition.x !== x || currentCorePosition.y !== y) {
                currentCorePosition.type = 'touch';
                currentCorePosition.x = x;
                currentCorePosition.y = y;
                updateUiSubscribedElements();
            }
        }
    }
};


// Functions to update uiSubscribedElements attached to specified DOM elements. Each stack or canvas element tracked by Scrawl-canvas will include a local __here__ object which includes details of the element's current dimensions, relative position, and the position of the mouse cursor in relation to its top-left corner. These all need to be updated whenever there's a resize, scroll or cursor movement.
const updateUiSubscribedElements = function () {

    for (let i = 0, iz = uiSubscribedElements.length; i < iz; i++) {

        updateUiSubscribedElement(uiSubscribedElements[i]);
    }
};

const updateUiSubscribedElement = function (art) {

    let dom = library.artefact[art];
    if (!xt(dom)) throw new Error(`core/userInteraction updateUiSubscribedElement() error - artefact does not exist: ${art}`);

    let el = dom.domElement;
    if (!isa_dom(el)) throw new Error(`core/userInteraction updateUiSubscribedElement() error - DOM element missing: ${art}`);

    let dims = el.getBoundingClientRect(),
        dox = Math.round(dims.left + window.pageXOffset),
        doy = Math.round(dims.top + window.pageYOffset);

    if (!dom.here) dom.here = {}; 

    let here = dom.here;

    here.w = Math.round(dims.width);
    here.h = Math.round(dims.height);

    here.type = currentCorePosition.type;

    // DOM-based artefacts have the option of creating a local mouse move event listener, which better tracks mouse movements across them when their element has been rotated in three dimensions. This if/else 
    if (!dom.localMouseListener) {

        here.localListener = false;
        here.active = true;

        here.x = Math.round(currentCorePosition.x - dox);
        here.y = Math.round(currentCorePosition.y - doy);

        here.normX = (here.w) ? here.x / here.w : false;
        here.normY = (here.h) ? here.y / here.h : false;
        here.offsetX = dox;
        here.offsetY = doy;

        if (here.normX < 0 || here.normX > 1 || here.normY < 0 || here.normY > 1) here.active = false;
    }
    else {

        here.localListener = true;
        here.active = false;

        here.normX = (here.originalWidth) ? here.x / here.originalWidth : false;
        here.normY = (here.originalHeight) ? here.y / here.originalHeight : false;
        here.offsetX = dox;
        here.offsetY = doy;

        if (here.x > dom.activePadding && here.x < here.originalWidth - dom.activePadding && here.y > 0 + dom.activePadding && here.y < here.originalHeight - dom.activePadding) here.active = true;
    }

    if (dom.type === 'Canvas') dom.updateBaseHere(here, dom.fit);

    // Automatically check for element resize
    // + The artefact's `checkForResize` flag needs to be set
    // + We ignore resizing actions while dimensions-related dirty flags are set (to prevent getting ourselves into a continuous feedback loop)
    if (dom.checkForResize && !dom.dirtyDimensions && !dom.dirtyDomDimensions) {

        let [w, h] = dom.currentDimensions;

        if (dom.type === 'Canvas') {

            // Regardless of the setting of &lt;canvas> element's `boxSizing` style attribute:
            // + It will include padding and borders in its `getBoundingClientRect` object (and its `getComputedStyle` width/height values), but these are specifically excluded from the element's `width` and `height` attributes
            // + Which leads to the normal resize test - `if (w !== here.w || h !== here.h)` - triggering on every mouse/scroll/resize event, which in turn leads to the canvas dimensions increasing uncontrollably.
            // + Solved by subtracting padding/border values from the `getBoundingClientRect` dimension values before performing the test.
            // + Tested in Demo [Canvas-004](../../demo/canvas-004.html).
            if (!dom.computedStyles) dom.computedStyles = window.getComputedStyle(dom.domElement);

            let s = dom.computedStyles,
                hw = Math.floor(here.w - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth) - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)),
                hh = Math.floor(here.h - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth) - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom));

            if (w !== hw || h !== hh) {

                dom.set({

                    dimensions: [hw, hh],
                });
            }
        }
        else {
        
            // Stack and Element artefacts resize test.
            // + Tested in Demo [DOM-011](../../demo/dom-011.html).
            if (w !== here.w || h !== here.h) {

                dom.set({

                    dimensions: [here.w, here.h],
                });
            }
        }
    }
};

const updatePhraseEntitys = function () {

    for (const [name, ent] of Object.entries(library.entity)) {

        if (ent.type === 'Phrase') {

            ent.dirtyDimensions = true;
            ent.dirtyFont = true;
        }
    }
};

// Internal functions that get triggered when setting a DOM-based artefact's `trackHere` attribute. They add/remove an event listener to the artefact's domElement.
const addLocalMouseMoveListener = function (wrapper) {

    if (isa_obj(wrapper)) {

        if (wrapper.localMouseListener) wrapper.localMouseListener();

        if (!wrapper.here) wrapper.here = {};

        wrapper.here.originalWidth = wrapper.currentDimensions[0];
        wrapper.here.originalHeight = wrapper.currentDimensions[1];

        wrapper.localMouseListener = addListener('move', function (e) {

            if (wrapper.here) {

                wrapper.here.x = Math.round(parseFloat(e.offsetX));
                wrapper.here.y = Math.round(parseFloat(e.offsetY));
            }
        }, wrapper.domElement);
    }
};

const removeLocalMouseMoveListener = function (wrapper) {

    if (isa_obj(wrapper)) {

        if (wrapper.localMouseListener) wrapper.localMouseListener();

        wrapper.localMouseListener = false;
    }
};


// Animation object which checks whether any window event listeners have fired, and actions accordingly
const coreListenersTracker = makeAnimation({

    name: 'coreListenersTracker',
    order: 0,
    delay: true,
    fn: function () {

        if (!uiSubscribedElements.length) return false;

        if (trackMouse && mouseChanged) {

            mouseChanged = false;
            updateUiSubscribedElements();
        }

        if (viewportChanged) {

            viewportChanged = false;
            updatePhraseEntitys();
        }
    },
});

// `Exported functions` (to modules and the scrawl object). Event listeners can be a drain on web page efficiency. If a web page contains only static canvas (and/or stack) displays, with no requirement for user interaction, we can minimize Scrawl-canvas's impact on those pages by switching off the core listeners (and also the core animation loop).
const startCoreListeners = function () {

    actionCoreListeners('removeEventListener');
    actionCoreListeners('addEventListener');

    trackMouse = true;
    mouseChanged = true;
    coreListenersTracker.run();
};

const stopCoreListeners = function () {

    trackMouse = false;
    mouseChanged = false;
    coreListenersTracker.halt();

    actionCoreListeners('removeEventListener');
};

// Helper function
const actionCoreListeners = function (action) {

    if (navigator.pointerEnabled || navigator.msPointerEnabled) {

        window[action]('pointermove', moveAction, false);
        window[action]('pointerup', moveAction, false);
        window[action]('pointerdown', moveAction, false);
        window[action]('pointerleave', moveAction, false);
        window[action]('pointerenter', moveAction, false);
    }
    else {

        window[action]('mousemove', moveAction, false);
        window[action]('mouseup', moveAction, false);
        window[action]('mousedown', moveAction, false);
        window[action]('mouseleave', moveAction, false);
        window[action]('mouseenter', moveAction, false);

        window[action]('touchmove', touchAction, false);
        window[action]('touchstart', touchAction, false);
        window[action]('touchend', touchAction, false);
        window[action]('touchcancel', touchAction, false);
    }

    window[action]('scroll', scrollAction, false);
    window[action]('resize', resizeAction, false);
};

// `Exported functions` (to modules). Invoke the resize and/or scroll event listeners once, outside the regular requestAnimationFrame tick.
const applyCoreResizeListener = function () {

    resizeAction();
    mouseChanged = true;
};

const applyCoreScrollListener = function () {

    scrollAction();
    mouseChanged = true;
};


// #### Convenience functions
//
// Okay, so I got very bored of writing boilerplate to react to various form elements user interactions across the demos. So I wrote some functions to setup (and take down) batches of DOM event listeners to make my life easier. These are:
// + scrawl.addNativeListener()
// + scrawl.removeNativeListener()
//
// Then there was the use case for reacting to various mouse (and touch) events, so I bundled all those up into a set of complementary functions:
// + scrawl.addListener()
// + scrawl.removeListener()
//
// Even so, there was still a lot of boilerplate code to write, in particular to listening for user interaction with form elements (which can be anywhere on the web page). So I further factorised that code into an __observeAndUpdate__ function which uses the listener functions internally.
//
// I have no idea how useful the observeAndUpdate function will be to anyone else. All I know is that it works for me and my demos, and that makes me happy.
//
// Note: observeAndUpdate() returns a function that will (in theory) remove all the bundled event listeners from their DOM elements when it is invoked. Not yet tested.

// `Exported function` (to modules and the scrawl object). Capture changes in a form and apply them to a target Scrawl-canvas artefact, asset, style, group, etc object
const observeAndUpdate = function (items = Ωempty) {

    if (!xta(items.event, items.origin, items.updates)) return false;

    let target = (items.target.substring && items.targetLibrarySection) ?
        library[items.targetLibrarySection][items.target] :
        items.target;

    if (!target) return false;

    let event = items.event,
        origin = items.origin;

    let listener = (items.useNativeListener) ? addNativeListener : addListener,
        killListener = (items.useNativeListener) ? removeNativeListener : removeListener;

    let stop = λnull;

    if (items.preventDefault) {

        stop = (e) => {

            e.preventDefault();
            e.returnValue = false;
        };
    }

    let func = function (e) {

        stop(e);

        let id = (e && e.target) ? e.target.id : false;

        if (id) {

            let updates = items.updates,
                actionArray = updates[id];

            if (actionArray) {

                let actionAttribute = actionArray[0],
                    action = actionArray[1],
                    targetVal = e.target.value,
                    actionFlag = true,
                    val;

                switch (action) {

                    case 'float' :
                        val = parseFloat(targetVal);
                        break;

                    case 'int' :
                        val = parseInt(targetVal, 10);
                        break;

                    case 'round' :
                        val = Math.round(targetVal);
                        break;

                    case 'roundDown' :
                        val = Math.floor(targetVal);
                        break;

                    case 'roundUp' :
                        val = Math.ceil(targetVal);
                        break;

                    case 'raw' :
                        val = targetVal;
                        break;

                    case 'string' :
                        val = `${targetVal}`;
                        break;

                    case 'boolean' :
                        if (xt(targetVal)) {

                            if (targetVal.substring) {

                                if ('true' === targetVal.toLowerCase()) val = true;
                                else if ('false' === targetVal.toLowerCase()) val = false;
                                else val = (parseFloat(targetVal)) ? true : false;
                            }
                            else val = (targetVal) ? true : false;
                        }
                        else val = false;
                        break;

                    default :
                        if (action.substring) val = `${parseFloat(targetVal)}${action}`;
                        else actionFlag = false;
                }

                if (actionFlag) {

                    if (target.type === 'Group') {

                        target.setArtefacts({
                            [actionAttribute]: val
                        });
                    }
                    else {

                        target.set({
                            [actionAttribute]: val
                        });
                    }
                }
            }
        }
    };

    let kill = function () {

        killListener(event, func, origin);
    };

    listener(event, func, origin);

    return kill;
};


// #### Drag-and-drop zones.
//
// __makeDragZone__ is an attempt to make setting up drag-and-drop functionality within a Scrawl-canvas stack or canvas as simple as possible
//
// Required attribute of the argument object:
// + __.zone__ - either the String name of the Stack or Canvas artefact which will host the zone, or the Stack or Canvas artefact itself
//
// Additional, optional, attributes in the argument object
// + __.coordinateSource__ - an object containing a `here` object
// + __.collisionGroup__ - String name of Group object, or Group object itself
// + __.startOn__ - Array of Strings
// + __.endOn__ - Array of Strings
// + __.updateOnStart__ - Function, or a `set` object to be applied to the current artefact
// + __.updateOnEnd__ - Function, or a `set` object to be applied to the current artefact
// + __.exposeCurrentArtefact__ - Boolean
// 
// If `exposeCurrentArtefact` attribute is true, the factory returns a function that can be invoked at any time to get the collision data object (containing x, y, artefact attributes) for the artefact being dragged (false if nothing is being dragged). 
//
// Invoking the returned function with a single argument that evaluates to true will trigger the kill function.
//
// If the exposeCurrentArtefact attribute is false, or omitted, the function returns a kill function that can be invoked to remove the event listeners from the Stack or Canvas zone's DOM element.
// 
// NOTE: drag-and-drop functionality using this factory function __is not guaranteed__ for artefacts referencing a path, or for artefacts whose reference artefact in turn references another artefact in any way.

// `Exported function` (to modules and the scrawl object). Add drag-and-drop functionality to a canvas or stack.
const makeDragZone = function (items = Ωempty) {

    let {zone, coordinateSource, collisionGroup, startOn, endOn, updateOnStart, updateOnEnd, exposeCurrentArtefact} = items

    // `zone` is required
    // + must be either a Canvas or Stack wrapper, or a wrapper's String name
    if (!zone) return new Error('dragZone constructor - no zone supplied');

    if (zone.substring) zone = artefact[zone];

    if (!zone || ['Canvas', 'Stack'].indexOf(zone.type) < 0) return new Error('dragZone constructor - zone object is not a Stack or Canvas wrapper');

    let target = zone.domElement;

    if (!target) return new Error('dragZone constructor - zone does not contain a target DOM element');

    // `collisionGroup` is optional; defaults to zone's namesake group
    // + must be a Group object
    if (!collisionGroup) {

        if (zone.type === 'Canvas') collisionGroup = library.group[zone.base.name];
        else collisionGroup = library.group[zone.name];
    }
    else if (collisionGroup.substring) collisionGroup = library.group[collisionGroup];

    if (!collisionGroup || collisionGroup.type !== 'Group') return new Error('dragZone constructor - unable to recover collisionGroup group');

    // `coordinateSource` will be an object containing `x` and `y` attributes
    // + default's to the zone's `here` object
    if (coordinateSource) {

        if (coordinateSource.here) coordinateSource = coordinateSource.here;
        else if (!xta(coordinateSource.x, coordinateSource.y)) coordinateSource = false;
    }
    else {

        if (zone.type === 'Canvas') coordinateSource = zone.base.here;
        else coordinateSource = zone.here;
    }

    if (!coordinateSource) return new Error('dragZone constructor - unable to discover a usable coordinateSource object');

    // `startOn`, `endOn` - if supplied, then need to be arrays
    if (!Array.isArray(startOn)) startOn = ['down'];
    if (!Array.isArray(endOn)) endOn = ['up'];

    // We can only drag one artefact at a time; that artefact - alongside the hit coordinate's x and y values -  is stored in the `current` variable
    let current = false;

    // `updateOnStart`, `updateOnEnd` - if supplied, then need to be functions
    if (isa_obj(updateOnStart)) updateOnStart = function () { current.artefact.set(items.updateOnStart) };
    if (!isa_fn(updateOnStart)) updateOnStart = λnull;

    if (isa_obj(updateOnEnd)) updateOnEnd = function () { current.artefact.set(items.updateOnEnd) };
    if (!isa_fn(updateOnEnd)) updateOnEnd = λnull;

    // `exposeCurrentArtefact` - if supplied, then needs to be a boolean
    if (!isa_boolean(exposeCurrentArtefact)) exposeCurrentArtefact = false;

    const checkE = function (e) {

        if (e.cancelable) {
            
            e.preventDefault();
            e.returnValue = false;
        }
    };

    const pickup = function (e) {

        checkE(e);

        let type = e.type;

        if (type === 'touchstart' || type === 'touchcancel') touchAction(e);

        current = collisionGroup.getArtefactAt(coordinateSource);

        if (current) {

            current.artefact.pickupArtefact(coordinateSource);
            updateOnStart();
        }
    };

    let drop = function (e) {

        checkE(e);

        if (current) {

            current.artefact.dropArtefact();
            updateOnEnd();
            current = false;
        }
    };

    const kill = function () {

        removeListener(startOn, pickup, target);
        removeListener(endOn, drop, target);
    };

    const getCurrent = function (actionKill = false) {

        if (actionKill) kill();
        else return current;
    };

    addListener(startOn, pickup, target);
    addListener(endOn, drop, target);

    if (exposeCurrentArtefact) return getCurrent;
    else return kill;
};

// #### Exports
export {
    uiSubscribedElements,
    currentCorePosition,
    addLocalMouseMoveListener,
    removeLocalMouseMoveListener,
    startCoreListeners,
    stopCoreListeners,
    applyCoreResizeListener,
    applyCoreScrollListener,
    observeAndUpdate,
    makeDragZone,
};
