// # The Animation Loop
// Scrawl-canvas runs a single, centralized requestAnimationFrame (RAF) function - __animationLoop__ - for all animation objects.
//
// [Animation objects](../factory/animation.html) are Scrawl-canvas objects with a __fn__ attribute; the function will be invoked once per RAF cycle.
//
// The RAF function is first invoked as part of Scrawl-canvas initialization when it loads into a web page, and continues to run while the __doAnimation__ flag remains true.


// #### Imports
import { animation } from "./library.js";

import { pushUnique, removeItem } from '../helper/utilities.js';

import { getDoAnimation, getResortBatchAnimations, setDoAnimation, setResortBatchAnimations } from '../helper/system-flags.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

// Shared constants
import { _floor, _now } from '../helper/shared-vars.js';

// Local constants
const animate_sorted = [];
const animate = [];


// Helper functions
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

    const buckets = requestArray();

    let obj, order, i, iz;

    for (i = 0, iz = animate.length; i < iz; i++) {

        obj = animation[animate[i]];

        if (obj) {

            order = _floor(obj.order) || 0;

            if (!buckets[order]) buckets[order] = requestArray();

            buckets[order].push(obj);
        }
    }
    animate_sorted.length = 0;

    for (i = 0, iz = buckets.length; i < iz; i++) {

        obj = buckets[i];

        if (obj) {

            animate_sorted.push(...obj);
            releaseArray(obj);
        }
    }
    releaseArray(buckets);
};

// The __requestAnimationFrame__ function
const animationLoop = () => {

    if (getResortBatchAnimations()) {

        setResortBatchAnimations(false);
        sortAnimations();
    }

    for (let i = 0, iz = animate_sorted.length; i < iz; i++) {

        const a = animate_sorted[i];

        if (a.chokedAnimation) {

            const now = _now();

            // Warning: magic number! `825` seems to allow the frame rate to reach the max frame rate; setting it to anything higher means the frame rate never reaches the max frame rate.
            if (a.lastRun + (825 / a.maxFrameRate) < now) {

                a.fn();
                a.lastRun = now;
            }
        }
        else a.fn();
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
