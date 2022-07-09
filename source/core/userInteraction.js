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
    viewportChanged = false,
    prefersContrastChanged = false,
    prefersReducedMotionChanged = false,
    prefersDarkColorSchemeChanged = false,
    prefersReduceTransparencyChanged = false,
    prefersReduceDataChanged = false;


// `Exported object` (to modules and the scrawl object). The __currentCorePosition__ object holds the __global__ mouse cursor position, alongside browser view dimensions and scroll position
const currentCorePosition = {
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    w: 0,
    h: 0,
    type: 'mouse',
    prefersReducedMotion: false,
    prefersDarkColorScheme: false,
    prefersReduceTransparency: false,
    prefersContrast: false,
    prefersReduceData: false,
    rawTouches: [],
};


// ### Accessibility preferences

// __contrastMediaQuery__ - real-time check on the `prefers-reduced-motion` user preference, as set for the device or OS
const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");

contrastMediaQuery.addEventListener('change', () => {

    let res = contrastMediaQuery.matches;

    if (currentCorePosition.prefersContrast !== res) {

        currentCorePosition.prefersContrast = res;
        prefersContrastChanged = true;
    }
});
currentCorePosition.prefersContrast = contrastMediaQuery.matches;

// __reducedMotionMediaQuery__ - real-time check on the `prefers-reduced-motion` user preference, as set for the device or OS
const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

reducedMotionMediaQuery.addEventListener('change', () => {

    let res = reducedMotionMediaQuery.matches;

    if (currentCorePosition.prefersReducedMotion !== res) {

        currentCorePosition.prefersReducedMotion = res;
        prefersReducedMotionChanged = true;
    }
});
currentCorePosition.prefersReducedMotion = reducedMotionMediaQuery.matches;

// __colorSchemeMediaQuery__ - real-time check on the `prefers-color-scheme` user preference, as set for the device or OS
const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

colorSchemeMediaQuery.addEventListener('change', () => {

    let res = colorSchemeMediaQuery.matches;

    if (currentCorePosition.prefersDarkColorScheme !== res) {

        currentCorePosition.prefersDarkColorScheme = res;
        prefersDarkColorSchemeChanged = true;
    }
});
currentCorePosition.prefersDarkColorScheme = colorSchemeMediaQuery.matches;

// __reducedTransparencyMediaQuery__ - real-time check on the `prefers-reduced-transparency` user preference, as set for the device or OS
const reducedTransparencyMediaQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");

reducedTransparencyMediaQuery.addEventListener('change', () => {

    let res = reducedTransparencyMediaQuery.matches;

    if (currentCorePosition.prefersReduceTransparency !== res) {

        currentCorePosition.prefersReduceTransparency = res;
        prefersReduceTransparencyChanged = true;
    }
});
currentCorePosition.prefersReduceTransparency = reducedTransparencyMediaQuery.matches;

// __reducedDataMediaQuery__ - real-time check on the `prefers-reduced-data` user preference, as set for the device or OS
const reducedDataMediaQuery = window.matchMedia("(prefers-reduced-data: reduce)");

reducedDataMediaQuery.addEventListener('change', () => {

    let res = reducedDataMediaQuery.matches;

    if (currentCorePosition.prefersReduceData !== res) {

        currentCorePosition.prefersReduceData = res;
        prefersReduceDataChanged = true;
    }
});
currentCorePosition.prefersReduceData = reducedDataMediaQuery.matches;


// ### Watch for browser window resize, or device rotation, which trigger changes in the viewport dimensions

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


// ### Watch for scrolling interactions

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

// ### Watch for mouse, pointer and touch movement

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
let touchActionLastChecked = 0,
    touchActionChoke = 16;

const getTouchActionChoke = function () {

    return touchActionChoke;
};

const setTouchActionChoke = function (val) {

    if (val && val.toFixed && !isNaN(val)) touchActionChoke = val;
};

const touchAction = function (e, resetCoordsToZeroOnTouchEnd = true) {

    currentCorePosition.rawTouches.length = 0;

    if (e.touches && e.touches.length) {

        currentCorePosition.rawTouches.push(...e.touches);

        const touch = e.touches[0],
            x = Math.round(touch.pageX),
            y = Math.round(touch.pageY);

        if (currentCorePosition.x !== x || currentCorePosition.y !== y) {

            currentCorePosition.type = 'touch';
            currentCorePosition.x = x;
            currentCorePosition.y = y;
        }
    }
    else {

        currentCorePosition.type = 'touch';

        if (resetCoordsToZeroOnTouchEnd) {

            currentCorePosition.x = 0;
            currentCorePosition.y = 0;
        }
    }

    const now = Date.now();

    if (now > touchActionLastChecked + touchActionChoke) {

        touchActionLastChecked = now;
        updateUiSubscribedElements();
    }
};

// ## Cascade interaction results down to subscribed elements

// Functions to update uiSubscribedElements attached to specified DOM elements. Each stack or canvas element tracked by Scrawl-canvas will include a local __here__ object which includes details of the element's current dimensions, relative position, and the position of the mouse cursor in relation to its top-left corner. These all need to be updated whenever there's a resize, scroll or cursor movement.
const updateUiSubscribedElements = function () {

    for (let i = 0, iz = uiSubscribedElements.length; i < iz; i++) {

        updateUiSubscribedElement(uiSubscribedElements[i]);
    }
};

const updateUiSubscribedElement = function (art) {

    const dom = library.artefact[art];

    if (dom) {

        if (!dom.here) dom.here = {}; 

        const { here, domElement:el } = dom;

        // Accessibility
        here.prefersContrast = currentCorePosition.prefersContrast;
        here.prefersReducedMotion = currentCorePosition.prefersReducedMotion;
        here.prefersDarkColorScheme = currentCorePosition.prefersDarkColorScheme;
        here.prefersReduceTransparency = currentCorePosition.prefersReduceTransparency;
        here.prefersReduceData = currentCorePosition.prefersReduceData;

        if (prefersContrastChanged) dom.contrastActions();
        if (prefersReducedMotionChanged) dom.reducedMotionActions();
        if (prefersDarkColorSchemeChanged) dom.colorSchemeActions();
        if (prefersReduceTransparencyChanged) dom.reducedTransparencyActions();
        if (prefersReduceDataChanged) dom.reducedDataActions();

        // DOM-element-dependant values
        if (el) {

            const dims = el.getBoundingClientRect(),
                dox = Math.round(dims.left + window.pageXOffset),
                doy = Math.round(dims.top + window.pageYOffset),
                dot = dims.top,
                doh = dims.height,
                wih = window.innerHeight;

            here.w = Math.round(dims.width);
            here.h = Math.round(doh);

            here.type = currentCorePosition.type;

            // Position of the artefact in the browser/device viewport
            const ivpt = dot / wih,
                ivpb = (dot + doh) / wih,
                ivpc = (ivpt + ivpb) / 2;

            here.inViewportTop = ivpt;
            here.inViewportBase = ivpb;
            here.inViewportCenter = ivpc;

            // DOM-based artefacts have the option of creating a local mouse move event listener, which better tracks mouse movements across them when their element has been rotated in three dimensions.
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
            // Default mouse tracking behaviour
            else {

                here.localListener = true;
                here.active = false;

                here.normX = (here.originalWidth) ? here.x / here.originalWidth : false;
                here.normY = (here.originalHeight) ? here.y / here.originalHeight : false;
                here.offsetX = dox;
                here.offsetY = doy;

                if (here.x > dom.activePadding && here.x < here.originalWidth - dom.activePadding && here.y > 0 + dom.activePadding && here.y < here.originalHeight - dom.activePadding) here.active = true;
            }

            const touches = currentCorePosition.rawTouches;

            if (touches.length) {

                if (!here.touches) here.touches = [];

                here.touches.length = 0;

                for (let i = 0, iz = touches.length; i < iz; i++) {

                    const touch = touches[i];

                    here.touches.push([Math.round(touch.pageX - dox), Math.round(touch.pageY - doy)]);
                }
            }

            // Canvas `fit` attribute adjustments
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

        if ((trackMouse && mouseChanged) || prefersReducedMotionChanged || prefersDarkColorSchemeChanged || prefersReduceTransparencyChanged || prefersReduceDataChanged) {

            updateUiSubscribedElements();

            if (trackMouse && mouseChanged) {

                mouseChanged = false;
            }

            if (prefersReducedMotionChanged || prefersDarkColorSchemeChanged || prefersReduceTransparencyChanged || prefersReduceDataChanged) {

                prefersReducedMotionChanged = false,
                prefersDarkColorSchemeChanged = false,
                prefersReduceTransparencyChanged = false,
                prefersReduceDataChanged = false;
            }
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

        window[action]('touchmove', touchAction, {passive: true});
        window[action]('touchstart', touchAction, {passive: true});
        window[action]('touchend', touchAction, {passive: true});
        window[action]('touchcancel', touchAction, {passive: true});
    }

    window[action]('scroll', scrollAction, {passive: true});
    window[action]('resize', resizeAction, false);
};

// `Exported functions` (to modules). Invoke the resize and/or scroll event listeners once, outside the regular requestAnimationFrame tick.
const applyCoreResizeListener = function () {

    resizeAction();
    mouseChanged = true;
    viewportChanged = true;
};

const applyCoreScrollListener = function () {

    scrollAction();
    mouseChanged = true;
};

const forceUpdate = function () {

    mouseChanged = true;
    viewportChanged = true;
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
//
// __observeAndUpdate - example__
// ```
// scrawl.observeAndUpdate({
//
//     // The input event which will trigger the O&U 
//     event: ['input', 'change'],
//
//     // CSS selector used to gather the DOM elements this O&U will be attached to
//     origin: '.controlItem',
//
//     // The SC artefact, or Group object, to be updated by user interaction changes
//     target: piccy,
//
//     // Performs an `addNativeListener` when true; `addListener` when false
//     useNativeListener: true,
//
//     // Invokes the event listener's `preventDefault` function
//     preventDefault: true,
//
//     // The SC artefact attributes to be updated by various DOM inputs. See below
//     updates: {
//
//         copy_start_xPercent: ['copyStartX', '%'],
//         copy_start_xAbsolute: ['copyStartX', 'round'],
//
//         copy_start_yPercent: ['copyStartY', '%'],
//         copy_start_yAbsolute: ['copyStartY', 'round'],
//
//         copy_dims_widthPercent: ['copyWidth', '%'],
//         copy_dims_widthAbsolute: ['copyWidth', 'round'],
//
//         copy_dims_heightPercent: ['copyHeight', '%'],
//         copy_dims_heightAbsolute: ['copyHeight', 'round'],
//     },
//
//     // A callback function to be performed after any attributes updates
//     callback: () => myLoom.update(),
//
//     // Similarly, we can invoke a function to run before performing the updates
//     setup: () => myLoom.update(),
// });
// ```

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

    let setup = (isa_fn(items.setup)) ? items.setup : λnull;

    let callback = (isa_fn(items.callback)) ? items.callback : λnull;

    let func = function (e) {

        stop(e);

        let id = (e && e.target) ? e.target.id : false;

        if (id) {

            let updates = items.updates,
                actionArray = updates[id];

            if (actionArray) {

                setup();

                let actionAttribute = actionArray[0],
                    action = actionArray[1],
                    targetVal = e.target.value,
                    actionFlag = true,
                    val;

                switch (action) {

                    // Supplied value converted to float Number
                    case 'float' :
                        val = parseFloat(targetVal);
                        break;

                    // Supplied value converted to integer Number
                    case 'int' :
                        val = parseInt(targetVal, 10);
                        break;

                    // Supplied value rounded up or down to nearest integer Number
                    case 'round' :
                        val = Math.round(targetVal);
                        break;

                    // Supplied value rounded down to nearest integer Number
                    case 'roundDown' :
                        val = Math.floor(targetVal);
                        break;

                    // Supplied value rounded up to nearest integer Number
                    case 'roundUp' :
                        val = Math.ceil(targetVal);
                        break;

                    // Supplied value not modified in any way
                    case 'raw' :
                        val = targetVal;
                        break;

                    // Supplied value converted to String
                    case 'string' :
                        val = `${targetVal}`;
                        break;

                    // Supplied value converted to Boolean
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

                    // Supplied value converted to float number, then action value (eg: '%') added to result to output a String
                    default :
                        if (action.substring) val = `${parseFloat(targetVal)}${action}`;
                        else actionFlag = false;
                }

                // Update - we can apply updates to a Group of artefacts, or to a single artefact
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

                    // Invoke any supplied callback function
                    callback();
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
// + __.updateOnStart__, __.updateOnShiftStart__ - Function, or a `set` object to be applied to the current artefact
// + __.updateOnEnd__, __.updateOnShiftEnd__ - Function, or a `set` object to be applied to the current artefact
// + __.updateWhileMoving__, __.updateWhileShiftMoving__ - Function to be run while drag is in progress
// + __.exposeCurrentArtefact__ - Boolean (default: false)
// + __.preventTouchDefaultWhenDragging__ - Boolean (default: false)
// + __.resetCoordsToZeroOnTouchEnd__ - Boolean (default: true)
// 
// If `exposeCurrentArtefact` attribute is true, the factory returns a function that can be invoked at any time to get the collision data object (containing x, y, artefact attributes) for the artefact being dragged (false if nothing is being dragged). 
//
// Invoking the returned function with a single argument that evaluates to true will trigger the kill function.
//
// If the exposeCurrentArtefact attribute is false, or omitted, the function returns a kill function that can be invoked to remove the event listeners from the Stack or Canvas zone's DOM element.
// 
// NOTE: drag-and-drop functionality using this factory function __is not guaranteed__ for artefacts referencing a path, or for artefacts whose reference artefact in turn references another artefact in any way.

// `Exported function` (to modules and the scrawl object). Add drag-and-drop functionality to a canvas or stack.
const dragZones = {};

const processDragZoneData = function (items = Ωempty, doAddListeners, doRemoveListeners) {

    let {
        zone, 
        coordinateSource, 
        collisionGroup, 
        startOn, 
        endOn, 
        updateOnStart, 
        updateOnEnd, 
        updateWhileMoving, 
        updateOnShiftStart, 
        updateOnShiftEnd, 
        updateWhileShiftMoving, 
        updateOnPrematureExit,
        exposeCurrentArtefact, 
        preventTouchDefaultWhenDragging, 
        resetCoordsToZeroOnTouchEnd, 
        processingOrder,
    } = items;

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

    if (exposeCurrentArtefact == null) exposeCurrentArtefact = false;
    if (preventTouchDefaultWhenDragging == null) preventTouchDefaultWhenDragging = false;
    if (resetCoordsToZeroOnTouchEnd == null) resetCoordsToZeroOnTouchEnd = true;

    // `updateOnStart`, `updateOnEnd`, `updateOnShiftStart`, `updateOnShiftEnd` - if supplied, then needs to be key:value objects which will be applied to the entity (using set) or, alternatively, a callback function
    if (isa_obj(updateOnStart)) updateOnStart = function () { current.artefact.set(items.updateOnStart) };
    if (!isa_fn(updateOnStart)) updateOnStart = λnull;

    if (isa_obj(updateOnShiftStart)) updateOnShiftStart = function () { current.artefact.set(items.updateOnShiftStart) };
    if (!isa_fn(updateOnShiftStart)) updateOnShiftStart = updateOnStart;

    if (isa_obj(updateOnEnd)) updateOnEnd = function () { current.artefact.set(items.updateOnEnd) };
    if (!isa_fn(updateOnEnd)) updateOnEnd = λnull;

    if (isa_obj(updateOnShiftEnd)) updateOnShiftEnd = function () { current.artefact.set(items.updateOnShiftEnd) };
    if (!isa_fn(updateOnShiftEnd)) updateOnShiftEnd = updateOnEnd;

    // `updateWhileMoving`, `updateWhileShiftMoving` - if supplied, needs to be a callback function
    if (!isa_fn(updateWhileMoving)) updateWhileMoving = λnull;
    if (!isa_fn(updateWhileShiftMoving)) updateWhileShiftMoving = updateWhileMoving;

    // `updateOnPrematureExit` - if supplied, needs to be a callback function
    if (!isa_fn(updateOnPrematureExit)) updateOnPrematureExit = λnull;

    // `exposeCurrentArtefact` - if supplied, then needs to be a boolean
    if (!isa_boolean(exposeCurrentArtefact)) exposeCurrentArtefact = false;

    if (processingOrder == null) processingOrder = 0;

    // We can only drag one artefact at a time; that artefact - alongside the hit coordinate's x and y values -  is stored in the `current` variable
    let current = false;

    const checkE = function (e) {

        if (e && e.cancelable) {
            
            if (preventTouchDefaultWhenDragging && current) {

                e.preventDefault();
                e.returnValue = false;
            }
            else if (!preventTouchDefaultWhenDragging) {

                e.preventDefault();
                e.returnValue = false;
            }
        }
    };

    const pickup = function (e = {}) {

        checkE(e);

        let type = e.type;
        if (type === 'touchstart' || type === 'touchcancel') touchAction(e, resetCoordsToZeroOnTouchEnd);

        current = collisionGroup.getArtefactAt(coordinateSource);

        if (current) {

            current.artefact.pickupArtefact(coordinateSource);
            if (e.shiftKey) updateOnShiftStart(e);
            else updateOnStart(e);
        }
        return {
            current,
            move,
            drop,
        };
    };

    const move = function (e = {}) {

        if (current) {

            checkE(e);

            let type = e.type;
            if (type === 'touchmove') touchAction(e);

            if (e.shiftKey) updateWhileShiftMoving(e);
            else updateWhileMoving(e);
        }
    };

    const drop = function (e = {}) {

        if (current) {

            checkE(e);

            let type = e.type;
            if (type === 'touchend') {

                touchAction(e, resetCoordsToZeroOnTouchEnd);
            }

            current.artefact.dropArtefact();
            if (e.shiftKey) updateOnShiftEnd(e);
            else updateOnEnd(e);
            current = false;
        }
    };

    if (!dragZones[zone.name]) {

        dragZones[zone.name] = [];
        doAddListeners(startOn, endOn, target);
    }

    const kill = function () {

        const name = `${zone.name}_${collisionGroup.name}_${processingOrder}`;

        dragZones[zone.name] = dragZones[zone.name].filter(z => z.name !== name);

        if (!dragZones[zone.name].length) doRemoveListeners(startOn, endOn, target);
    };

    const getCurrent = function (actionKill) {

        if (actionKill) {

            if (actionKill === 'exit' || actionKill === 'drop') {

                drop();
                updateOnPrematureExit();
            }
            else kill();
        }
        else return current;
    };

    const data = {
        name: `${zone.name}_${collisionGroup.name}_${processingOrder}`,
        exposeCurrentArtefact, 
        target,
        processingOrder,
        pickup,
        move,
        drop,
        kill,
        getCurrent,
    };

    dragZones[zone.name].push(data);

    dragZones[zone.name].sort((a, b) => a.processingOrder - b.processingOrder);

    return {
        exposeCurrentArtefact, 
        getCurrent,
        kill,
        zone,
    };
};

const makeDragZone = function (items = Ωempty) {

    const pickup = (e = {}) => {

        if (e && e.target) {

            let myTarget = e.target,
                name = '';

            while (!name) {

                if (dragZones[myTarget.id]) name = myTarget.id;
                if (myTarget.tagName === 'BODY') break;
                myTarget = myTarget.parentElement;
            }

            const variants = dragZones[name];

            if (variants) {

                for (let i = 0, iz = variants.length; i < iz; i++) {

                    const v = variants[i];

                    const res = v.pickup(e);

                    if (res.current) {

                        currentMove = res.move;
                        currentDrop = res.drop;
                        break;
                    }
                }
            }
        }
    };

    let currentMove = λnull;
    const move = (e = {}) => {

        currentMove(e);
    };

    let currentDrop = λnull;
    const drop = (e = {}) => {

        currentDrop(e);
        currentMove = λnull;
        currentDrop = λnull;
    };

    const doAddListeners = (startOn, endOn, target) => {

        addListener(startOn, pickup, target);
        addListener('move', move, target);
        addListener(endOn, drop, target);
    };

    const doRemoveListeners = (startOn, endOn, target) => {

        removeListener(startOn, pickup, target);
        removeListener('move', move, target);
        removeListener(endOn, drop, target);
    };

    const processedData = processDragZoneData(items, doAddListeners, doRemoveListeners);

    if (processedData.exposeCurrentArtefact) return processedData.getCurrent;
    else return processedData.kill;
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
    forceUpdate,
    observeAndUpdate,
    makeDragZone,
    getTouchActionChoke,
    setTouchActionChoke,
};
