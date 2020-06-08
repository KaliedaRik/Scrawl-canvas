import { isa_fn, isa_dom, λnull } from "./utilities.js";
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
else return λnull;
}
const addListener = function (evt, fn, targ) {
if (!isa_fn(fn)) throw new Error(`core/document addListener() error - no function supplied: ${evt}, ${targ}`);
actionListener(evt, fn, targ, 'removeEventListener');
actionListener(evt, fn, targ, 'addEventListener');
return function () {
removeListener(evt, fn, targ);
};
};
const removeListener = function (evt, fn, targ) {
if (!isa_fn(fn)) throw new Error(`core/document removeListener() error - no function supplied: ${evt}, ${targ}`);
actionListener(evt, fn, targ, 'removeEventListener');
};
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
const addNativeListener = function (evt, fn, targ) {
if (!isa_fn(fn)) throw new Error(`core/document addNativeListener() error - no function supplied: ${evt}, ${targ}`);
actionNativeListener(evt, fn, targ, 'removeEventListener');
actionNativeListener(evt, fn, targ, 'addEventListener');
return function () {
removeNativeListener(evt, fn, targ);
};
};
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
export {
addListener,
removeListener,
addNativeListener,
removeNativeListener,
makeAnimationObserver,
};
