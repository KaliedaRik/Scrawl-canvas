import { animation } from "./library.js";
let doAnimation = false,
resortBatchAnimations = true,
animate_sorted = [];
let animate = [];
const resortAnimations = function () {
resortBatchAnimations = true;
};
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
const startCoreAnimationLoop = function () {
doAnimation = true;
animationLoop();
};
const stopCoreAnimationLoop = function () {
doAnimation = false;
};
export {
animate,
resortAnimations,
startCoreAnimationLoop,
stopCoreAnimationLoop,
};
