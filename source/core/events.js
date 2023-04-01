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
import { isa_fn, isa_dom, λnull, Ωempty, detectBrowser } from "./utilities.js";
import { canvas, cell, entity } from "./library.js";

// `Exported function` (to modules and scrawl object) - __scrawl.makeAnimationObserver__ - function to create and start a [DOM IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) object.
//
// The function expects 3 arguments, in the following order:
// + a Scrawl-canvas animation object (required) - either [Animation](../factory/Animation.html) or [RenderAnimation](../factory/RenderAnimation.html)
// + A Scrawl-canvas element wrapper object (required) - either [Canvas](../factory/Canvas.html), [Stack](../factory/Stack.html) or [Element](../factory/Element.html)
// + A Javascript object (optional) containing options to be applied to the observer - `root`, `rootMargin`, `threshold`
//
// The function returns a function which, when invoked, will disconnect the observer from the DOM.
export const makeAnimationObserver = function (anim, wrapper, specs = Ωempty) {

    if (typeof window.IntersectionObserver === 'function' && anim && anim.run) {

        let observer = new IntersectionObserver((entries, observer) => {

            let i, iz, entry;

            for (i = 0, iz = entries.length; i < iz; i++) {

                entry = entries[i];
                if (entry.isIntersecting) !anim.isRunning() && anim.run();
                else if (!entry.isIntersecting) anim.isRunning() && anim.halt();
            }
        }, specs);

        if (wrapper && wrapper.domElement) {

            observer.observe(wrapper.domElement);
        }

        return function () {
            
            observer.disconnect();
        }
    }
    else return λnull;
}

// `Exported function` (to modules and scrawl object) - __scrawl.addListener__. Returns a kill function which, when invoked (no arguments required), will remove the event listener(s) from all DOM elements to which they have been attached.
export const addListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document addListener() error - no function supplied: ${evt}, ${targ}`);

    actionListener(evt, fn, targ, 'removeEventListener');
    actionListener(evt, fn, targ, 'addEventListener');

    return function () {

        removeListener(evt, fn, targ);
    };
};

// `Exported function` (to modules and scrawl object) - __scrawl.removeListener__. The counterpart to 'addListener' is __removeListener__ which removes Scrawl-canvas event listeners from DOM elements in a similar way
export const removeListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document removeListener() error - no function supplied: ${evt}, ${targ}`);

    actionListener(evt, fn, targ, 'removeEventListener');
};

// Because devices and browsers differ in their approach to user interaction (mouse vs pointer vs touch), the actual functionality for adding and removing the event listeners associated with each approach is handled by dedicated actionXXXListener functions

// TODO: code up the functionality to manage touch events
const actionListener = function (evt, fn, targ, action) {

    let events = [].concat(evt),
        targets;
    
    if (targ.substring) targets = document.body.querySelectorAll(targ);
    else if (Array.isArray(targ)) targets = targ;
    else targets = [targ];

    if (navigator.pointerEnabled || navigator.msPointerEnabled) actionPointerListener(events, fn, targets, action);
    else actionMouseListener(events, fn, targets, action);
};

const actionMouseListener = function (events, fn, targets, action) {

    let i, iz, j, jz, myevent, target;

    for (i = 0, iz = events.length; i < iz; i++) {

        myevent = events[i]; 

        for (j = 0, jz = targets.length; j < jz; j++) {

            target = targets[j];

            if (isa_dom(target) || target.document || target.characterSet) {
                
                switch (myevent) {
                
                    case 'move':
                        target[action]('mousemove', fn, false);
                        target[action]('touchmove', fn, {passive: false});
                        target[action]('touchfollow', fn, {passive: false});
                        break;

                    case 'up':
                        target[action]('mouseup', fn, false);
                        target[action]('touchend', fn, {passive: false});
                        break;

                    case 'down':
                        target[action]('mousedown', fn, false);
                        target[action]('touchstart', fn, {passive: false});
                        break;

                    case 'leave':
                        target[action]('mouseleave', fn, false);
                        target[action]('touchleave', fn, {passive: false});
                        break;

                    case 'enter':
                        target[action]('mouseenter', fn, false);
                        target[action]('touchenter', fn, {passive: false});
                        break;
                }
            }
            else throw new Error(`core/document actionMouseListener() error - bad target: ${myevent}, ${target}`);
        }
    }
};

const actionPointerListener = function (events, fn, targets, action) {

    let i, iz, j, jz, myevent, target;

    for (i = 0, iz = events.length; i < iz; i++) {

        myevent = events[i]; 

        for (j = 0, jz = targets.length; j < jz; j++) {

            target = targets[j];

            if (isa_dom(target) || target.document || target.characterSet) {

                switch (myevent) {
                
                    case 'move':
                        target[action]('pointermove', fn, false);
                        break;

                    case 'up':
                        target[action]('pointerup', fn, false);
                        break;

                    case 'down':
                        target[action]('pointerdown', fn, false);
                        break;

                    case 'leave':
                        target[action]('pointerleave', fn, false);
                        break;

                    case 'enter':
                        target[action]('pointerenter', fn, false);
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

    if (!isa_fn(fn)) throw new Error(`core/document addNativeListener() error - no function supplied: ${evt}, ${targ}`);

    actionNativeListener(evt, fn, targ, 'removeEventListener');
    actionNativeListener(evt, fn, targ, 'addEventListener');

    return function () {

        removeNativeListener(evt, fn, targ);
    };
};

// `Exported function` (to modules and scrawl object). The counterpart to 'addNativeListener' is __scrawl.removeNativeListener__ which removes event listeners from DOM elements in a similar way
export const removeNativeListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document removeNativeListener() error - no function supplied: ${evt}, ${targ}`);

    actionNativeListener(evt, fn, targ, 'removeEventListener');
};

const actionNativeListener = function (evt, fn, targ, action) {

    let events = [].concat(evt),
        targets, i, iz, j, jz, myevent, target;

    if (targ.substring) targets = document.body.querySelectorAll(targ);
    else if (Array.isArray(targ)) targets = targ;
    else targets = [targ];

    for (i = 0, iz = events.length; i < iz; i++) {

        myevent = events[i];

        for (j = 0, jz = targets.length; j < jz; j++) {

            target = targets[j];
            if (isa_dom(target) || target.document || target.characterSet) target[action](myevent, fn, false);
            else throw new Error(`core/document actionNativeListener() error - bad target: ${myevent}, ${target}`);
        }
    }
};


// ## Monitoring the device pixel ratio
// DPR is detected here, but mainly handled in the `factory/cell.js` file
// + We scale the cell by DPR - this should be the only time we touch native scale functionality!
// + All the other scaling functionality in SC is handled by computiation - applying the scaling factor to dimensions, start, handle, offset etc values which then get saved in the `current` equivalent attributes
let dpr_changeAction = λnull;
export const setPixelRatioChangeAction = (func) => dpr_changeAction = func;

const browserIs = detectBrowser();

let dpr = 0;
export const getPixelRatio = () => dpr;

let ignorePixelRatio = false;
export const getIgnorePixelRatio = () => ignorePixelRatio;
export const setIgnorePixelRatio = (val) => ignorePixelRatio = val;

const updatePixelRatio = () => {

    dpr = window.devicePixelRatio;

    for (const [name, wrapper] of Object.entries(canvas)) {

        wrapper.dirtyDimensions = true;
    }

    for (const [name, wrapper] of Object.entries(cell)) {

        wrapper.dirtyDimensions = true;
    }

    for (const [name, ent] of Object.entries(entity)) {

        ent.dirtyHost = true;
    }

    if (!ignorePixelRatio) dpr_changeAction();

    // __Note:__ I have no idea what Safari is doing - maybe device pixel ratio stuff is handled internally? 
    // + Whatever. Safari does not like, or respond to, this matchmedia query
    // + As long as the demos display as expected in Safari on both 1dppx and 2dppx (Retina) screens, and dragging the Safari browser between screens with different dppx values doesn't break the display or freeze the page, then I think we're okay
    if (!browserIs.includes('safari')) {

        matchMedia(`(resolution: ${dpr}dppx)`).addEventListener("change", updatePixelRatio, { once: true });
    }
};

updatePixelRatio();
