// # Core user interaction
// A set of functions that are closely tied to the [core/document.js](./document.html) functionality, and a couple of additional coder convenience functions.
//
// Scrawl-canvas adds some event listeners (mouse movement, screen resize, scrolling) to the window object. These help maintain a centralizerd mouse/touch cursor tracking facility that updates here and then cascades and localizes to artefacts (stacks, canvases and element wrapper objects) which need to keep track of a __local, immediately updated mouse/touch coordinate__.
//
// Checks to see if events have occurred happen once per requestAnimationFrame tick - this is to choke the more eager event listeners which can, at times, fire thousands of times a second.


// #### Imports
import * as library from "./library.js";
import { isa_obj } from "./utilities.js";
import { addListener } from "./events.js";

import { makeAnimation } from "../factory/animation.js";

// `Exported array` (to modules). DOM element wrappers subscribe for updates by adding themselves to the __uiSubscribedElements__ array. When an event fires, the updated data will be pushed to them automatically
export const uiSubscribedElements = [];


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
export const currentCorePosition = {
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

export const getTouchActionChoke = function () {

    return touchActionChoke;
};

export const setTouchActionChoke = function (val) {

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
export const addLocalMouseMoveListener = function (wrapper) {

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

export const removeLocalMouseMoveListener = function (wrapper) {

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
export const startCoreListeners = function () {

    actionCoreListeners('removeEventListener');
    actionCoreListeners('addEventListener');

    trackMouse = true;
    mouseChanged = true;
    coreListenersTracker.run();
};

export const stopCoreListeners = function () {

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
export const applyCoreResizeListener = function () {

    resizeAction();
    mouseChanged = true;
    viewportChanged = true;
};

export const applyCoreScrollListener = function () {

    scrollAction();
    mouseChanged = true;
};

export const forceUpdate = function () {

    mouseChanged = true;
    viewportChanged = true;
};
