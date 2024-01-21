// # DOM event listeners
//
// Each scrawl-canvas stack and canvas can have __bespoke Scrawl-canvas listeners__ attached to them, to track user mouse and touch interactions with that element. Scrawl-canvas defines five bespoke listeners:
// + __move__ - track mouse cursor and touch movements across the DOM element
// + __down__ - register a new touch interaction, or user pressing the left mouse button
// + __up__ - register the end of a touch interaction, or user releasing the left mouse button
// + __enter__ - trigger an event when the mouse cursor or touch event enters into the DOM element
// + __leave__ - trigger an event when the mouse cursor or touch event exits from the DOM element
//
// The functions all takes the following arguments:
// + __evt__ - String name of the event ('move', 'down', 'up', 'enter', 'leave'), or an array of such strings
// + __fn__ - the function to be called when the event listener(s) trigger
// + __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String; these elements need to be registered in the Scrawl-canvas library beforehend (done automatically for stack and canvas elements)


// #### Imports
import { isa_fn, isa_dom, λnull, Ωempty } from "../helper/utilities.js";

import { releaseArray, requestArray } from '../helper/array-pool.js';

import { _isArray, ADD_EVENT_LISTENER, DOWN, ENTER, FUNCTION, LEAVE, MOUSE_DOWN, MOUSE_ENTER, MOUSE_LEAVE, MOUSE_MOVE, MOUSE_UP, MOVE, POINTER_DOWN, POINTER_ENTER, POINTER_LEAVE, POINTER_MOVE, POINTER_UP, REMOVE_EVENT_LISTENER, TOUCH_END, TOUCH_ENTER, TOUCH_FOLLOW, TOUCH_LEAVE, TOUCH_MOVE, TOUCH_START, UP } from '../helper/shared-vars.js';


// #### Functionality
// `Exported function` (to modules and scrawl object) - __scrawl.makeAnimationObserver__ - function to create and start a [DOM IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) object.
//
// The function expects 3 arguments, in the following order:
// + a Scrawl-canvas animation object (required) - either [Animation](../factory/Animation.html) or [RenderAnimation](../factory/RenderAnimation.html)
// + A Scrawl-canvas element wrapper object (required) - either [Canvas](../factory/Canvas.html), [Stack](../factory/Stack.html) or [Element](../factory/Element.html)
// + A Javascript object (optional) containing options to be applied to the observer - `root`, `rootMargin`, `threshold`
//
// The function returns a function which, when invoked, will disconnect the observer from the DOM.
export const makeAnimationObserver = function (anim, wrapper, specs = Ωempty) {

    if (typeof window.IntersectionObserver == FUNCTION && anim && anim.run) {

        const observer = new IntersectionObserver((entries) => {

            let i, iz, entry;

            for (i = 0, iz = entries.length; i < iz; i++) {

                entry = entries[i];
                if (entry.isIntersecting && !anim.isRunning()) anim.run();
                else if (!entry.isIntersecting && anim.isRunning()) anim.halt();
            }
        }, specs);

        if (wrapper && wrapper.domElement) {

            observer.observe(wrapper.domElement);
        }

        return function () {

            observer.disconnect();
        }
    }
    return λnull;
}

// `Exported function` (to modules and scrawl object) - __scrawl.addListener__. Returns a kill function which, when invoked (no arguments required), will remove the event listener(s) from all DOM elements to which they have been attached.
export const addListener = function (evt, fn, targ) {

    if (evt && isa_fn(fn) && targ) {

        actionListener(evt, fn, targ, REMOVE_EVENT_LISTENER);
        actionListener(evt, fn, targ, ADD_EVENT_LISTENER);

        return function () {

            removeListener(evt, fn, targ);
        };
    }
    return λnull;
};

// `Exported function` (to modules and scrawl object) - __scrawl.removeListener__. The counterpart to 'addListener' is __removeListener__ which removes Scrawl-canvas event listeners from DOM elements in a similar way
export const removeListener = function (evt, fn, targ) {

    if (evt && isa_fn(fn) && targ) actionListener(evt, fn, targ, REMOVE_EVENT_LISTENER);
};

// Because devices and browsers differ in their approach to user interaction (mouse vs pointer vs touch), the actual functionality for adding and removing the event listeners associated with each approach is handled by dedicated actionXXXListener functions

// TODO: code up the functionality to manage touch events
const actionListener = function (evt, fn, targ, action) {

    const events = requestArray(),
        targets = requestArray();

    if (_isArray(evt)) events.push(...evt);
    else events.push(evt);

    if (targ.substring) targets.push(...document.body.querySelectorAll(targ));
    else if (_isArray(targ)) targets.push(...targ);
    else targets.push(targ);

    if (navigator.pointerEnabled || navigator.msPointerEnabled) actionPointerListener(events, fn, targets, action);
    else actionMouseListener(events, fn, targets, action);

    releaseArray(targets);
    releaseArray(events);
};

const actionMouseListener = function (events, fn, targets, action) {

    let i, iz, j, jz, e, t;

    for (i = 0, iz = events.length; i < iz; i++) {

        e = events[i];

        for (j = 0, jz = targets.length; j < jz; j++) {

            t = targets[j];

            if (isa_dom(t) || t.document || t.characterSet) {

                switch (e) {

                    case MOVE:
                        t[action](MOUSE_MOVE, fn, false);
                        t[action](TOUCH_MOVE, fn, {passive: false});
                        t[action](TOUCH_FOLLOW, fn, {passive: false});
                        break;

                    case UP:
                        t[action](MOUSE_UP, fn, false);
                        t[action](TOUCH_END, fn, {passive: false});
                        break;

                    case DOWN:
                        t[action](MOUSE_DOWN, fn, false);
                        t[action](TOUCH_START, fn, {passive: false});
                        break;

                    case LEAVE:
                        t[action](MOUSE_LEAVE, fn, false);
                        t[action](TOUCH_LEAVE, fn, {passive: false});
                        break;

                    case ENTER:
                        t[action](MOUSE_ENTER, fn, false);
                        t[action](TOUCH_ENTER, fn, {passive: false});
                        break;
                }
            }
        }
    }
};

const actionPointerListener = function (events, fn, targets, action) {

    let i, iz, j, jz, e, t;

    for (i = 0, iz = events.length; i < iz; i++) {

        e = events[i];

        for (j = 0, jz = targets.length; j < jz; j++) {

            t = targets[j];

            if (isa_dom(t) || t.document || t.characterSet) {

                switch (e) {

                    case MOVE:
                        t[action](POINTER_MOVE, fn, false);
                        break;

                    case UP:
                        t[action](POINTER_UP, fn, false);
                        break;

                    case DOWN:
                        t[action](POINTER_DOWN, fn, false);
                        break;

                    case LEAVE:
                        t[action](POINTER_LEAVE, fn, false);
                        break;

                    case ENTER:
                        t[action](POINTER_ENTER, fn, false);
                        break;
                }
            }
        }
    }
};

// __Any event listener__ can be added to a Scrawl-canvas stack or canvas DOM element.
//
// The __scrawl.addNativeListener__ function makes adding and removing these 'native' listeners a little easier: multiple event listeners (which all trigger the same function) can be added to multiple DOM elements (that have been registered in the Scrawl-canvas library) in a single function call.
//
// The function requires three arguments:
// + __evt__ - String name of the event ('click', 'input', 'change', etc), or an array of such strings
// + __fn__ - the function to be called when the event listener(s) trigger
// + __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String. Note that `window` and ``

// `Exported function` (to modules and scrawl object). Returns a kill function which, when invoked (no arguments required), will remove the event listener(s) from all DOM elements to which they have been attached.
export const addNativeListener = function (evt, fn, targ) {

    if (evt && isa_fn(fn) && targ) {

        actionNativeListener(evt, fn, targ, REMOVE_EVENT_LISTENER);
        actionNativeListener(evt, fn, targ, ADD_EVENT_LISTENER);

        return function () {

            removeNativeListener(evt, fn, targ);
        };
    }
    return λnull;
};

// `Exported function` (to modules and scrawl object). The counterpart to 'addNativeListener' is __scrawl.removeNativeListener__ which removes event listeners from DOM elements in a similar way
export const removeNativeListener = function (evt, fn, targ) {

    if (evt && isa_fn(fn) && targ) actionNativeListener(evt, fn, targ, REMOVE_EVENT_LISTENER);
};

const actionNativeListener = function (evt, fn, targ, action) {

    const events = requestArray(),
        targets = requestArray();

    let i, iz, j, jz, e, t;

    if (_isArray(evt)) events.push(...evt);
    else events.push(evt);

    if (targ.substring) targets.push(...document.body.querySelectorAll(targ));
    else if (_isArray(targ)) targets.push(...targ);
    else targets.push(targ);

    for (i = 0, iz = events.length; i < iz; i++) {

        e = events[i];

        for (j = 0, jz = targets.length; j < jz; j++) {

            t = targets[j];

            if (isa_dom(t) || t.document || t.characterSet) t[action](e, fn, false);
        }
    }
    releaseArray(targets);
    releaseArray(events);
};
