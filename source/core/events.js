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
import { isa_fn, isa_dom, defaultNonReturnFunction } from "./utilities.js";

// TODO - documentation
//
// `Exported function` (to modules and scrawl object). 
const makeAnimationObserver = function (anim, wrapper, specs = {}) {

    if (typeof window.IntersectionObserver === 'function' && anim && anim.run) {

        let observer = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) !anim.isRunning() && anim.run();
                else if (!entry.isIntersecting) anim.isRunning() && anim.halt();
            });
        }, specs);

        if (wrapper && wrapper.domElement) {

            observer.observe(wrapper.domElement);
        }

        return function () {
            
            observer.disconnect();
        }
    }
    else return defaultNonReturnFunction;
}

// `Exported function` (to modules and scrawl object). Returns a kill function which, when invoked (no arguments required), will remove the event listener(s) from all DOM elements to which they have been attached.
const addListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document addListener() error - no function supplied: ${evt}, ${targ}`);

    actionListener(evt, fn, targ, 'removeEventListener');
    actionListener(evt, fn, targ, 'addEventListener');

    return function () {

        removeListener(evt, fn, targ);
    };
};

// `Exported function` (to modules and scrawl object). The counterpart to 'addListener' is __removeListener__ which removes Scrawl-canvas event listeners from DOM elements in a similar way
const removeListener = function (evt, fn, targ) {

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

    events.forEach(myevent => {

        targets.forEach(target => {

            if (!isa_dom(target)) throw new Error(`core/document actionMouseListener() error - bad target: ${myevent}, ${target}`);

            switch (myevent) {
            
                case 'move':
                    target[action]('mousemove', fn, false);
                    target[action]('touchmove', fn, false);
                    target[action]('touchfollow', fn, false);
                    break;

                case 'up':
                    target[action]('mouseup', fn, false);
                    target[action]('touchend', fn, false);
                    break;

                case 'down':
                    target[action]('mousedown', fn, false);
                    target[action]('touchstart', fn, false);
                    break;

                case 'leave':
                    target[action]('mouseleave', fn, false);
                    target[action]('touchleave', fn, false);
                    break;

                case 'enter':
                    target[action]('mouseenter', fn, false);
                    target[action]('touchenter', fn, false);
                    break;
            }
        });
    });
};

const actionPointerListener = function (events, fn, targets, action) {

    events.forEach(myevent => {

        targets.forEach(target => {

            if (!isa_dom(target)) throw new Error(`core/document actionPointerListener() error - bad target: ${myevent}, ${target}`);

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
        });
    });
};

// __Any event listener__ can be added to a Scrawl-canvas stack or canvas DOM element. 
// 
// The __addNativeListener__ function makes adding and removing these 'native' listeners a little easier: multiple event listeners (which all trigger the same function) can be added to multiple DOM elements (that have been registered in the Scrawl-canvas library) in a single function call.
//
// The function requires three arguments:
// + __evt__ - String name of the event ('click', 'input', 'change', etc), or an array of such strings
// + __fn__ - the function to be called when the event listener(s) trigger
// + __targ__ - either the DOM element object, or an array of DOM element objects, or a query selector String

// `Exported function` (to modules and scrawl object). Returns a kill function which, when invoked (no arguments required), will remove the event listener(s) from all DOM elements to which they have been attached.
const addNativeListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document addNativeListener() error - no function supplied: ${evt}, ${targ}`);

    actionNativeListener(evt, fn, targ, 'removeEventListener');
    actionNativeListener(evt, fn, targ, 'addEventListener');

    return function () {

        removeNativeListener(evt, fn, targ);
    };
};

// `Exported function` (to modules and scrawl object). The counterpart to 'addNativeListener' is __removeNativeListener__ which removes event listeners from DOM elements in a similar way
const removeNativeListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document removeNativeListener() error - no function supplied: ${evt}, ${targ}`);

    actionNativeListener(evt, fn, targ, 'removeEventListener');
};

const actionNativeListener = function (evt, fn, targ, action) {

    let events = [].concat(evt),
        targets;

    if (targ.substring) targets = document.body.querySelectorAll(targ);
    else if (Array.isArray(targ)) targets = targ;
    else targets = [targ];

    events.forEach(myevent => {

        targets.forEach(target => {

            if (!isa_dom(target)) throw new Error(`core/document actionNativeListener() error - bad target: ${myevent}, ${target}`);

            target[action](myevent, fn, false);
        });
    });
};


// #### Exports
export {
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    makeAnimationObserver,
};
