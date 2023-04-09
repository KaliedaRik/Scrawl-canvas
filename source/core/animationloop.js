// # The Animation Loop
// Scrawl-canvas runs a single, centralized requestAnimationFrame (RAF) function - __animationLoop__ - for all animation objects. 
//
// [Animation objects](../factory/animation.html) are Scrawl-canvas objects with a __fn__ attribute; the function will be invoked once per RAF cycle. 
//
// The RAF function is first invoked as part of Scrawl-canvas initialization when it loads into a web page, and continues to run while the __doAnimation__ flag remains true.
//
// To stop the RAF:
//
// `scrawl.stopCoreAnimationLoop()`
//
// To restart the RAF after it has been stopped:
//
// `scrawl.startCoreAnimationLoop()`
//
// ... Functionality tested in [Demo DOM-009](../../demo/dom-009.html)
//
// As part of initialization, two animation objects are created and added to the __animate__ array:
// + __coreTickersAnimation__ (order: 0) - which will invoke all ticker animations currently subscribed to it - [factory/ticker.js](../factory/ticker.html)
// + __coreListenersTracker__ (order: 0) - which channels window-based events (mouse/touch movement, viewport resize, scrolling) to Scrawl-canvas objects that need to take action in response (thus choking such actions to a maximum 60-per-second) - [core/userInteraction.js](./userInteraction.html)
//
// Additional animations can be created via a number of 'make' functions:
// + makeAnimation (runs by default) - [factory/animation.js](../factory/animation.html)
// + makeRender (runs by default) - [factory/renderAnimation.js](../factory/renderAnimation.html)
// + makeTicker (halted by default) - [factory/ticker.js](../factory/ticker.html)
// + makeTween (halted by default) - [factory/tween.js](../factory/tween.html)
//
// These objects can be added to the _animate_ Array by invoking their __run__ function, and removed by invoking their __halt__ function.
//
// The order in which animations objects run during each RAF cycle (= __Display cycle__) can be (partly) determined by the objects' __order__ attribute: those with a lower order value will be invoked before those with a higher value.
//
// Note that ticker/tween animations will all run before other animations (order differences between tickers/tween objects will be respected).


// #### Imports
import { animation } from "./library.js";

import {
    pushUnique,
    removeItem,
} from './utilities.js';

import {
    getResortBatchAnimations,
    setResortBatchAnimations,
    getDoAnimation,
    setDoAnimation,
} from './system-flags.js';

import {
    _floor,
} from './shared-vars.js';


// Local constants 
let animate_sorted = [];
const animate = [];

export const animateAdd = (val) => {
    pushUnique(animate, val);
    setResortBatchAnimations(true);
};

export const animateRemove = (val) => {
    removeItem(animate, val);
    setResortBatchAnimations(true);
};

export const animateIncludes = (val) => animate.includes(val);


// ### Functionality

// Scrawl-canvas animation sorter uses a 'bucket sort' algorithm
const sortAnimations = () => {

    let buckets = [],
        obj, order, i, iz, name;

    for (i = 0, iz = animate.length; i < iz; i++) {

        name = animate[i];
        obj = animation[name];

        if (obj) {

            order = _floor(obj.order) || 0;

            if (!buckets[order]) buckets[order] = [];

            buckets[order].push(obj);
        }
    }
    animate_sorted = buckets.reduce((a, v) => a.concat(v), []);
};

// The __requestAnimationFrame__ function
const animationLoop = () => {

    if (getResortBatchAnimations()) {

        setResortBatchAnimations(false);
        sortAnimations();
    }

    for (let i = 0, iz = animate_sorted.length; i < iz; i++) {

        animate_sorted[i].fn();
    }
    
    if (getDoAnimation()) window.requestAnimationFrame(animationLoop);
};

// `Exported function` (modules and scrawl object). Start the RAF function running
export const startCoreAnimationLoop = () => {

    setDoAnimation(true);
    animationLoop();
};

// `Exported function` (modules and scrawl object). Halt the RAF function
export const stopCoreAnimationLoop = () => setDoAnimation(false);
