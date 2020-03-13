// # Animation Loop - core

// TODO - document the purpose of this core file


// ## Imports
import { animation } from "./library.js";

// TODO - documentation
let animate = [],
    doAnimation = false,
    resortBatchAnimations = true,
    animate_sorted = [];

// TODO - documentation
const resortAnimations = function () {
    resortBatchAnimations = true;
};

// TODO - documentation
const sortAnimations = function () {

    if (resortBatchAnimations) {

        resortBatchAnimations = false;

        let floor = Math.floor,
            buckets = [];

        animate.forEach(name => {

            let obj = animation[name];

            if (obj) {

                let order = floor(obj.order) || 0;

                if (!buckets[order]) buckets[order] = [];

                buckets[order].push(obj);
            }
        });

        animate_sorted = buckets.reduce((a, v) => a.concat(v), []);
    }
};

// TODO - documentation
const animationLoop = function () {

    let promises = [];

    if (resortBatchAnimations) sortAnimations();

    animate_sorted.forEach((item) => {

        if (item.fn) promises.push(item.fn());
    });

    Promise.all(promises)
    .then(() => {

        if (doAnimation) window.requestAnimationFrame(() => animationLoop());
    })
    .catch((err) => console.log('animationLoop error: ', err.message));
};

// TODO - documentation
const startCoreAnimationLoop = function () {

    doAnimation = true;
    animationLoop();
};

// TODO - documentation
const stopCoreAnimationLoop = function () {
    
    doAnimation = false;
};


// TODO - documentation
export {
    animate,
    resortAnimations,
    startCoreAnimationLoop,
    stopCoreAnimationLoop,
};
