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
import { isa_fn, isa_dom, λnull, Ωempty } from "./utilities.js";

// `Exported function` (to modules and scrawl object) - __scrawl.makeAnimationObserver__ - function to create and start a [DOM IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) object.
//
// The function expects 3 arguments, in the following order:
// + a Scrawl-canvas animation object (required) - either [Animation](../factory/Animation.html) or [RenderAnimation](../factory/RenderAnimation.html)
// + A Scrawl-canvas element wrapper object (required) - either [Canvas](../factory/Canvas.html), [Stack](../factory/Stack.html) or [Element](../factory/Element.html)
// + A Javascript object (optional) containing options to be applied to the observer - `root`, `rootMargin`, `threshold`
//
// The function returns a function which, when invoked, will disconnect the observer from the DOM.
const makeAnimationObserver = function (anim, wrapper, specs = Ωempty) {

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
const addListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document addListener() error - no function supplied: ${evt}, ${targ}`);

    actionListener(evt, fn, targ, 'removeEventListener');
    actionListener(evt, fn, targ, 'addEventListener');

    return function () {

        removeListener(evt, fn, targ);
    };
};

// `Exported function` (to modules and scrawl object) - __scrawl.removeListener__. The counterpart to 'addListener' is __removeListener__ which removes Scrawl-canvas event listeners from DOM elements in a similar way
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

    let i, iz, j, jz, myevent, target;

    for (i = 0, iz = events.length; i < iz; i++) {

        myevent = events[i]; 

        for (j = 0, jz = targets.length; j < jz; j++) {

            target = targets[j];

            if (isa_dom(target) || target.document || target.characterSet) {
                
                switch (myevent) {
                
                    case 'move':
                        target[action]('mousemove', fn, false);
                        target[action]('touchmove', fn, {passive: true});
                        target[action]('touchfollow', fn, {passive: true});
                        break;

                    case 'up':
                        target[action]('mouseup', fn, false);
                        target[action]('touchend', fn, {passive: true});
                        break;

                    case 'down':
                        target[action]('mousedown', fn, false);
                        target[action]('touchstart', fn, {passive: true});
                        break;

                    case 'leave':
                        target[action]('mouseleave', fn, false);
                        target[action]('touchleave', fn, {passive: true});
                        break;

                    case 'enter':
                        target[action]('mouseenter', fn, false);
                        target[action]('touchenter', fn, {passive: true});
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
const addNativeListener = function (evt, fn, targ) {

    if (!isa_fn(fn)) throw new Error(`core/document addNativeListener() error - no function supplied: ${evt}, ${targ}`);

    actionNativeListener(evt, fn, targ, 'removeEventListener');
    actionNativeListener(evt, fn, targ, 'addEventListener');

    return function () {

        removeNativeListener(evt, fn, targ);
    };
};

// `Exported function` (to modules and scrawl object). The counterpart to 'addNativeListener' is __scrawl.removeNativeListener__ which removes event listeners from DOM elements in a similar way
const removeNativeListener = function (evt, fn, targ) {

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

// ## Accessibility, and user-defined, preferences

// #### Demos:
// + [Canvas-033](../../demo/canvas-033.html) - User preferences: prefers-color-scheme; prefers-reduced-motion

// #### prefers-reduced-motion media query
// In many devices users have the option to set a system-wide flag indicating that, wherever possible, application and website animations should be reduced and/or prevented from playing. Scrawl-canvas investigates for this setting and supplies hooks to which developers can attach hook functions defining the actions to take when reduced motion has been requested, and for whenever this setting is changed.
// 
// Exported function `reducedMotionActions` - __we strongly recommend that, whenever a &lt;canvas> scene is animated, developers call this function as part of their definition code.__ By default this function will run the `reducedMotion_reduceAction` function when reduced motion has been requested; in all other cases the `reducedMotion_noPreferenceAction` function will be invoked.
// + `reducedMotion_reduceAction` is by default a null-function. If actions need to be taken to reduce the speed of a canvas animation, or to stop it, then coders should replace this hook function with their own. Set using the `scrawl.setReduceMotionAction()` function
// + `reducedMotion_noPreferenceAction` - again, a null function by default. Coders can replace it with their own function to revert the actions set out in their reduceAction function (for instance, to restart a canvas animation). Set using the `scrawl.setNoPreferenceMotionAction()` function
//
// ```
// __Example code__
//
// const myAnimation = scrawl.makeRender({
//     name: 'scene-animation',
//     target: mycanvas,
//     delay: true,
// });
//
// scrawl.setReduceMotionAction(() => myAnimation.halt());
// scrawl.setNoPreferenceMotionAction(() => myAnimation.run());
//
// scrawl.reducedMotionActions();
// ```
const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let prefersReducedMotion = reducedMotionMediaQuery.matches,
    reducedMotion_reduceAction = λnull,
    reducedMotion_noPreferenceAction = λnull;

const reducedMotionActions = () => {

    if (prefersReducedMotion) reducedMotion_reduceAction();
    else reducedMotion_noPreferenceAction();
};

reducedMotionMediaQuery.addEventListener('change', () => {

    prefersReducedMotion = reducedMotionMediaQuery.matches;
    reducedMotionActions();
});

const setReduceMotionAction = (func) => reducedMotion_reduceAction = func;
const setNoPreferenceMotionAction = (func) => reducedMotion_noPreferenceAction = func;


// #### prefers-color-scheme media query
// In many devices users have the option to set a system-wide flag indicating that, wherever possible, application and website interfaces should use a dark, or light, color scheme. Scrawl-canvas investigates for this setting and supplies hooks to which developers can attach hook functions defining the actions to take when a preference has been selected, and for whenever this setting is changed. Where no selection has been made, Scrawl-canvas assumes that a light color scheme is preferred.
//
// Exported function `colorSchemeActions` - depending on the user selection, the appropriate color scheme hook function is run; where no selection has been made, this will be the lightAction function.
// + `colorScheme_darkAction` is by default a null-function. If actions need to be taken to update a scene to match surrounding dark-theme designs, then coders should replace this hook function with their own. Set using the `scrawl.setColorSchemeDarkAction()` function
// + `colorScheme_lightAction` - again, a null function by default. Coders can replace it with their own function to revert the actions set out in their darkAction function. Set using the `scrawl.setColorSchemeLightAction()` function
//
// ```
// __Example code__
//
// const canvas = scrawl.library.mycanvas;
//
// const myBlock = scrawl.makeBlock({
//     name: 'myThemedBlock',
//     start: ['center', 'center'],
//     handle: ['center', 'center'],
//     dimensions: ['30%', '30%'],
//     method: 'fill',
// });
//
// scrawl.setColorSchemeDarkAction(() => {
//     canvas.set({ backgroundColor: 'black'});
//     myBlock.set({ fillStyle: 'white'});
// });
//
// scrawl.setColorSchemeLightAction(() => {
//     canvas.set({ backgroundColor: 'white'});
//     myBlock.set({ fillStyle: 'black'});
// });
//
// scrawl.colorSchemeActions();
// ```

const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

let prefersColorScheme = colorSchemeMediaQuery.matches,
    colorScheme_darkAction = λnull,
    colorScheme_lightAction = λnull;

const colorSchemeActions = () => {

    if (prefersColorScheme) colorScheme_darkAction();
    else colorScheme_lightAction();
};

colorSchemeMediaQuery.addEventListener('change', () => {

    prefersColorScheme = colorSchemeMediaQuery.matches;
    colorSchemeActions();
});

const setColorSchemeLightAction = (func) => colorScheme_lightAction = func;
const setColorSchemeDarkAction = (func) => colorScheme_darkAction = func;


// Monitoring the device pixel ratio
let dpr_changeAction = λnull;
const setPixelRatioChangeAction = (func) => dpr_changeAction = func;

let dpr = 0;
const getPixelRatio = () => dpr;

let ignorePixelRatio = true;
const getIgnorePixelRatio = () => ignorePixelRatio;
const setIgnorePixelRatio = (val) => ignorePixelRatio = val;

const updatePixelRatio = () => {

    dpr = window.devicePixelRatio;

    console.log(`current dpr - ${dpr}`);

    if (!ignorePixelRatio) dpr_changeAction();

    matchMedia(`(resolution: ${dpr}dppx)`).addEventListener("change", updatePixelRatio, { once: true });
};

updatePixelRatio();



// #### Exports
export {
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,

    makeAnimationObserver,

    reducedMotionActions,
    setReduceMotionAction,
    setNoPreferenceMotionAction,

    colorSchemeActions,
    setColorSchemeDarkAction,
    setColorSchemeLightAction,

    getPixelRatio,
    setPixelRatioChangeAction,
    getIgnorePixelRatio,
    setIgnorePixelRatio,
};
