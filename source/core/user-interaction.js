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

import { getTrackMouse, setTrackMouse, getMouseChanged, setMouseChanged, getViewportChanged, setViewportChanged, getPrefersContrastChanged, setPrefersContrastChanged, getPrefersReducedMotionChanged, setPrefersReducedMotionChanged, getPrefersDarkColorSchemeChanged, setPrefersDarkColorSchemeChanged, getPrefersReduceTransparencyChanged, setPrefersReduceTransparencyChanged, getPrefersReduceDataChanged, setPrefersReduceDataChanged } from './system-flags.js';

import { _computed, _floor, _now, _round, _seal, _values, ADD_EVENT_LISTENER, CHANGE, MOUSE, MOUSE_DOWN, MOUSE_ENTER, MOUSE_LEAVE, MOUSE_MOVE, MOUSE_UP, MOVE, POINTER, POINTER_DOWN, POINTER_ENTER, POINTER_LEAVE, POINTER_MOVE, POINTER_UP, REMOVE_EVENT_LISTENER, RESIZE, SCROLL, T_CANVAS, T_PHRASE, TOUCH, TOUCH_CANCEL, TOUCH_END, TOUCH_MOVE, TOUCH_START } from './shared-vars.js'


// `Exported array` (to modules). DOM element wrappers subscribe for updates by adding themselves to the __uiSubscribedElements__ array. When an event fires, the updated data will be pushed to them automatically
export const uiSubscribedElements = [];


// `Exported object` (to modules and the scrawl object). The __currentCorePosition__ object holds the __global__ mouse cursor position, alongside browser view dimensions and scroll position
export const currentCorePosition = _seal({
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    w: 0,
    h: 0,
    type: MOUSE,
    prefersReducedMotion: false,
    prefersDarkColorScheme: false,
    prefersReduceTransparency: false,
    prefersContrast: false,
    prefersReduceData: false,
    rawTouches: [],
});


// ### Accessibility preferences

// __contrastMediaQuery__ - real-time check on the `prefers-reduced-motion` user preference, as set for the device or OS
const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");

contrastMediaQuery.addEventListener(CHANGE, () => {

    const res = contrastMediaQuery.matches;

    if (currentCorePosition.prefersContrast != res) {

        currentCorePosition.prefersContrast = res;
        setPrefersContrastChanged(true);
    }
});
currentCorePosition.prefersContrast = contrastMediaQuery.matches;

// __reducedMotionMediaQuery__ - real-time check on the `prefers-reduced-motion` user preference, as set for the device or OS
const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

reducedMotionMediaQuery.addEventListener(CHANGE, () => {

    const res = reducedMotionMediaQuery.matches;

    if (currentCorePosition.prefersReducedMotion != res) {

        currentCorePosition.prefersReducedMotion = res;
        setPrefersReducedMotionChanged(true);
    }
});
currentCorePosition.prefersReducedMotion = reducedMotionMediaQuery.matches;

// __colorSchemeMediaQuery__ - real-time check on the `prefers-color-scheme` user preference, as set for the device or OS
const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

colorSchemeMediaQuery.addEventListener(CHANGE, () => {

    const res = colorSchemeMediaQuery.matches;

    if (currentCorePosition.prefersDarkColorScheme != res) {

        currentCorePosition.prefersDarkColorScheme = res;
        setPrefersDarkColorSchemeChanged(true);
    }
});
currentCorePosition.prefersDarkColorScheme = colorSchemeMediaQuery.matches;

// __reducedTransparencyMediaQuery__ - real-time check on the `prefers-reduced-transparency` user preference, as set for the device or OS
const reducedTransparencyMediaQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");

reducedTransparencyMediaQuery.addEventListener(CHANGE, () => {

    const res = reducedTransparencyMediaQuery.matches;

    if (currentCorePosition.prefersReduceTransparency != res) {

        currentCorePosition.prefersReduceTransparency = res;
        setPrefersReduceTransparencyChanged(true);
    }
});
currentCorePosition.prefersReduceTransparency = reducedTransparencyMediaQuery.matches;

// __reducedDataMediaQuery__ - real-time check on the `prefers-reduced-data` user preference, as set for the device or OS
const reducedDataMediaQuery = window.matchMedia("(prefers-reduced-data: reduce)");

reducedDataMediaQuery.addEventListener(CHANGE, () => {

    const res = reducedDataMediaQuery.matches;

    if (currentCorePosition.prefersReduceData != res) {

        currentCorePosition.prefersReduceData = res;
        setPrefersReduceDataChanged(true);
    }
});
currentCorePosition.prefersReduceData = reducedDataMediaQuery.matches;


// ### Watch for browser window resize, or device rotation, which trigger changes in the viewport dimensions

// __resizeAction__ function - to check if a view resize has occurred; if yes, flag that currentCorePosition object needs to be updated
const resizeAction = function () {

    const w = document.documentElement.clientWidth,
        h = document.documentElement.clientHeight;

    if (currentCorePosition.w != w || currentCorePosition.h != h) {

        currentCorePosition.w = w;
        currentCorePosition.h = h;
        setMouseChanged(true);
        setViewportChanged(true);
    }
};


// ### Watch for scrolling interactions

// __scrollAction__ function - to check if a view scroll has occurred; if yes, flag that currentCorePosition object needs to be updated
const scrollAction = function () {

    const x = window.pageXOffset,
        y = window.pageYOffset;

    if (currentCorePosition.scrollX != x || currentCorePosition.scrollY != y) {
        currentCorePosition.x += (x - currentCorePosition.scrollX);
        currentCorePosition.y += (y - currentCorePosition.scrollY);
        currentCorePosition.scrollX = x;
        currentCorePosition.scrollY = y;
        setMouseChanged(true);
    }
};

// ### Watch for mouse, pointer and touch movement

// __moveAction__ function - to check if mouse cursor position has changed; if yes, update currentCorePosition object and flag that the updated needs to cascade to subscribed elements at the next RAF invocation.

// The events that trigger this function (pointermove, pointerup, pointerdown, pointerleave, pointerenter; or mousemove, mouseup, mousedown, mouseleave, mouseenter) are tied to the window object, not to any particular DOM element.
const moveAction = function (e) {

    const x = _round(e.pageX),
        y = _round(e.pageY);

    if (currentCorePosition.x != x || currentCorePosition.y != y) {
        currentCorePosition.type = (navigator.pointerEnabled) ? POINTER : MOUSE;
        currentCorePosition.x = x;
        currentCorePosition.y = y;
        setMouseChanged(true);
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

export const touchAction = function (e, resetCoordsToZeroOnTouchEnd = true) {

    currentCorePosition.rawTouches.length = 0;

    if (e.touches && e.touches.length) {

        currentCorePosition.rawTouches.push(...e.touches);

        const touch = e.touches[0],
            x = _round(touch.pageX),
            y = _round(touch.pageY);

        if (currentCorePosition.x !== x || currentCorePosition.y !== y) {

            currentCorePosition.type = TOUCH;
            currentCorePosition.x = x;
            currentCorePosition.y = y;
        }
    }
    else {

        currentCorePosition.type = TOUCH;

        if (resetCoordsToZeroOnTouchEnd) {

            currentCorePosition.x = 0;
            currentCorePosition.y = 0;
        }
    }

    const now = _now();

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

        if (getPrefersContrastChanged()) dom.contrastActions();
        if (getPrefersReducedMotionChanged()) dom.reducedMotionActions();
        if (getPrefersDarkColorSchemeChanged()) dom.colorSchemeActions();
        if (getPrefersReduceTransparencyChanged()) dom.reducedTransparencyActions();
        if (getPrefersReduceDataChanged()) dom.reducedDataActions();

        // DOM-element-dependant values
        if (el) {

            const dims = el.getBoundingClientRect(),
                dox = _round(dims.left + window.pageXOffset),
                doy = _round(dims.top + window.pageYOffset),
                dot = dims.top,
                doh = dims.height,
                wih = window.innerHeight;

            here.w = _round(dims.width);
            here.h = _round(doh);

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

                here.x = _round(currentCorePosition.x - dox);
                here.y = _round(currentCorePosition.y - doy);

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

                    here.touches.push([_round(touch.pageX - dox), _round(touch.pageY - doy)]);
                }
            }

            // Canvas `fit` attribute adjustments
            if (dom.type == T_CANVAS) dom.updateBaseHere(here, dom.fit);

            // Automatically check for element resize
            // + The artefact's `checkForResize` flag needs to be set
            // + We ignore resizing actions while dimensions-related dirty flags are set (to prevent getting ourselves into a continuous feedback loop)

            if (dom.checkForResize && !dom.dirtyDimensions && !dom.dirtyDomDimensions) {

                const [w, h] = dom.currentDimensions;

                if (dom.type == T_CANVAS) {
                    // Regardless of the setting of &lt;canvas> element's `boxSizing` style attribute:
                    // + It will include padding and borders in its `getBoundingClientRect` object (and its `getComputedStyle` width/height values), but these are specifically excluded from the element's `width` and `height` attributes
                    // + Which leads to the normal resize test - `if (w !== here.w || h !== here.h)` - triggering on every mouse/scroll/resize event, which in turn leads to the canvas dimensions increasing uncontrollably.
                    // + Solved by subtracting padding/border values from the `getBoundingClientRect` dimension values before performing the test.
                    // + Tested in Demo [Canvas-004](../../demo/canvas-004.html).
                    if (!dom.computedStyles) dom.computedStyles = _computed(dom.domElement);

                    const s = dom.computedStyles,
                        hw = _floor(here.w - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth) - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)),
                        hh = _floor(here.h - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth) - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom));

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

    _values(library.entity).forEach(ent => {

        if (ent.type == T_PHRASE) {

            ent.dirtyDimensions = true;
            ent.dirtyFont = true;
        }
    })
};

// Internal functions that get triggered when setting a DOM-based artefact's `trackHere` attribute. They add/remove an event listener to the artefact's domElement.
export const addLocalMouseMoveListener = function (wrapper) {

    if (isa_obj(wrapper)) {

        if (wrapper.localMouseListener) wrapper.localMouseListener();

        if (!wrapper.here) wrapper.here = {};

        wrapper.here.originalWidth = wrapper.currentDimensions[0];
        wrapper.here.originalHeight = wrapper.currentDimensions[1];

        wrapper.localMouseListener = addListener(MOVE, function (e) {

            if (wrapper.here) {

                wrapper.here.x = _round(parseFloat(e.offsetX));
                wrapper.here.y = _round(parseFloat(e.offsetY));
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

        const trackMouse = getTrackMouse();
        const mouseChanged = getMouseChanged();
        const viewportChanged = getViewportChanged();
        const prefersReducedMotionChanged = getPrefersReducedMotionChanged();
        const prefersDarkColorSchemeChanged = getPrefersDarkColorSchemeChanged();
        const prefersReduceTransparencyChanged = getPrefersReduceTransparencyChanged();
        const prefersReduceDataChanged = getPrefersReduceDataChanged();

        if (!uiSubscribedElements.length) return false;

        if ((trackMouse && mouseChanged) || prefersReducedMotionChanged || prefersDarkColorSchemeChanged || prefersReduceTransparencyChanged || prefersReduceDataChanged) {

            updateUiSubscribedElements();

            if (trackMouse && mouseChanged) {

                setMouseChanged(false);
            }

            if (prefersReducedMotionChanged || prefersDarkColorSchemeChanged || prefersReduceTransparencyChanged || prefersReduceDataChanged) {

                setPrefersReducedMotionChanged(false);
                setPrefersDarkColorSchemeChanged(false);
                setPrefersReduceTransparencyChanged(false);
                setPrefersReduceDataChanged(false);
            }
        }

        if (viewportChanged) {

            setViewportChanged(false);
            updatePhraseEntitys();
        }
    },
});

// `Exported functions` (to modules and the scrawl object). Event listeners can be a drain on web page efficiency. If a web page contains only static canvas (and/or stack) displays, with no requirement for user interaction, we can minimize Scrawl-canvas's impact on those pages by switching off the core listeners (and also the core animation loop).
export const startCoreListeners = function () {

    actionCoreListeners(REMOVE_EVENT_LISTENER);
    actionCoreListeners(ADD_EVENT_LISTENER);

    setTrackMouse(true);
    setMouseChanged(true);
    coreListenersTracker.run();
};

export const stopCoreListeners = function () {

    setTrackMouse(false);
    setMouseChanged(false);
    coreListenersTracker.halt();

    actionCoreListeners(REMOVE_EVENT_LISTENER);
};

// Helper function
const actionCoreListeners = function (action) {

    if (navigator.pointerEnabled || navigator.msPointerEnabled) {

        window[action](POINTER_MOVE, moveAction, false);
        window[action](POINTER_UP, moveAction, false);
        window[action](POINTER_DOWN, moveAction, false);
        window[action](POINTER_LEAVE, moveAction, false);
        window[action](POINTER_ENTER, moveAction, false);
    }
    else {

        window[action](MOUSE_MOVE, moveAction, false);
        window[action](MOUSE_UP, moveAction, false);
        window[action](MOUSE_DOWN, moveAction, false);
        window[action](MOUSE_LEAVE, moveAction, false);
        window[action](MOUSE_ENTER, moveAction, false);

        window[action](TOUCH_MOVE, touchAction, {passive: true});
        window[action](TOUCH_START, touchAction, {passive: true});
        window[action](TOUCH_END, touchAction, {passive: true});
        window[action](TOUCH_CANCEL, touchAction, {passive: true});
    }

    window[action](SCROLL, scrollAction, {passive: true});
    window[action](RESIZE, resizeAction, false);
};

// `Exported functions` (to modules). Invoke the resize and/or scroll event listeners once, outside the regular requestAnimationFrame tick.
export const applyCoreResizeListener = function () {

    resizeAction();
    setMouseChanged(true);
    setViewportChanged(true);
};

export const applyCoreScrollListener = function () {

    scrollAction();
    setMouseChanged(true);
};
