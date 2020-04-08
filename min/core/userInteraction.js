import * as library from "./library.js";
import { xt, xta, isa_dom, isa_fn, defaultNonReturnFunction } from "./utilities.js";
import { addListener, addNativeListener, removeListener, removeNativeListener } from "./document.js";
import { makeAnimation } from "../factory/animation.js";
const uiSubscribedElements = [];
let trackMouse = false,
mouseChanged = false;
const currentCorePosition = {
x: 0,
y: 0,
scrollX: 0,
scrollY: 0,
w: 0,
h: 0,
type: 'mouse'
};
const resizeAction = function (e) {
let w = document.documentElement.clientWidth,
h = document.documentElement.clientHeight;
if (currentCorePosition.w !== w || currentCorePosition.h !== h) {
currentCorePosition.w = w;
currentCorePosition.h = h;
mouseChanged = true;
}
};
const scrollAction = function (e) {
let x = window.pageXOffset,
y = window.pageYOffset;
if (currentCorePosition.scrollX !== x || currentCorePosition.scrollY !== y) {
currentCorePosition.x += (x - currentCorePosition.scrollX);
currentCorePosition.y += (y - currentCorePosition.scrollY);
currentCorePosition.scrollX = x;
currentCorePosition.scrollY = y;
mouseChanged = true;
}
};
const moveAction = function (e) {
let x = Math.round(e.pageX),
y = Math.round(e.pageY);
if (currentCorePosition.x !== x || currentCorePosition.y !== y) {
currentCorePosition.type = (navigator.pointerEnabled) ? 'pointer' : 'mouse';
currentCorePosition.x = x;
currentCorePosition.y = y;
mouseChanged = true;
}
};
const touchAction = function (e) {
if (e.type === 'touchstart' || e.type === 'touchmove') {
if (e.touches && e.touches[0]) {
let touch = e.touches[0],
x = Math.round(touch.pageX),
y = Math.round(touch.pageY);
if (currentCorePosition.x !== x || currentCorePosition.y !== y) {
currentCorePosition.type = 'touch';
currentCorePosition.x = x;
currentCorePosition.y = y;
updateUiSubscribedElements();
}
}
}
};
const updateUiSubscribedElements = function () {
uiSubscribedElements.forEach(item => updateUiSubscribedElement(item));
};
const updateUiSubscribedElement = function (art) {
let dom = library.artefact[art];
if (!xt(dom)) throw new Error(`core/userInteraction updateUiSubscribedElement() error - artefact does not exist: ${art}`);
let el = dom.domElement;
if (!isa_dom(el)) throw new Error(`core/userInteraction updateUiSubscribedElement() error - DOM element missing: ${art}`);
let dims = el.getBoundingClientRect(),
dox = Math.round(dims.left + window.pageXOffset),
doy = Math.round(dims.top + window.pageYOffset);
if (!dom.here) dom.here = {};
let here = dom.here;
here.x = Math.round(currentCorePosition.x - dox);
here.y = Math.round(currentCorePosition.y - doy);
here.w = Math.round(dims.width);
here.h = Math.round(dims.height);
here.normX = (here.w) ? here.x / here.w : false;
here.normY = (here.h) ? here.y / here.h : false;
here.offsetX = dox;
here.offsetY = doy;
here.type = currentCorePosition.type;
here.active = true;
if (here.normX < 0 || here.normX > 1 || here.normY < 0 || here.normY > 1) here.active = false;
if (dom.type === 'Canvas') dom.updateBaseHere(here, dom.fit);
if (dom.checkForResize && !dom.dirtyDimensions && !dom.dirtyDomDimensions) {
let [w, h] = dom.currentDimensions;
if (dom.type === 'Canvas') {
if (!dom.computedStyles) dom.computedStyles = window.getComputedStyle(dom.domElement);
let s = dom.computedStyles,
hw = here.w - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth),
hh = here.h - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth);
if (w !== hw || h !== hh) {
dom.set({
dimensions: [hw, hh],
});
}
}
else {
if (w !== here.w || h !== here.h) {
dom.set({
dimensions: [here.w, here.h],
});
}
}
}
};
const coreListenersTracker = makeAnimation({
name: 'coreListenersTracker',
order: 0,
delay: true,
fn: function () {
return new Promise((resolve) => {
if (!uiSubscribedElements.length) resolve(false);
if (trackMouse && mouseChanged) {
mouseChanged = false;
updateUiSubscribedElements();
}
resolve(true);
});
},
});
const startCoreListeners = function () {
actionCoreListeners('removeEventListener');
actionCoreListeners('addEventListener');
trackMouse = true;
mouseChanged = true;
coreListenersTracker.run();
};
const stopCoreListeners = function () {
trackMouse = false;
mouseChanged = false;
coreListenersTracker.halt();
actionCoreListeners('removeEventListener');
};
const actionCoreListeners = function (action) {
if (navigator.pointerEnabled || navigator.msPointerEnabled) {
window[action]('pointermove', moveAction, false);
window[action]('pointerup', moveAction, false);
window[action]('pointerdown', moveAction, false);
window[action]('pointerleave', moveAction, false);
window[action]('pointerenter', moveAction, false);
}
else {
window[action]('mousemove', moveAction, false);
window[action]('mouseup', moveAction, false);
window[action]('mousedown', moveAction, false);
window[action]('mouseleave', moveAction, false);
window[action]('mouseenter', moveAction, false);
window[action]('touchmove', touchAction, false);
window[action]('touchstart', touchAction, false);
window[action]('touchend', touchAction, false);
window[action]('touchcancel', touchAction, false);
}
window[action]('scroll', scrollAction, false);
window[action]('resize', resizeAction, false);
};
const applyCoreResizeListener = function () {
resizeAction();
mouseChanged = true;
};
const applyCoreScrollListener = function () {
scrollAction();
mouseChanged = true;
};
const observeAndUpdate = function (items = {}) {
if (!xta(items.event, items.origin, items.updates)) return false;
let target = (items.target.substring && items.targetLibrarySection) ?
library[items.targetLibrarySection][items.target] :
items.target;
if (!target) return false;
let event = items.event,
origin = items.origin;
let listener = (items.useNativeListener) ? addNativeListener : addListener,
killListener = (items.useNativeListener) ? removeNativeListener : removeListener;
let stop = defaultNonReturnFunction;
if (items.preventDefault) {
stop = (e) => {
e.preventDefault();
e.returnValue = false;
};
}
let func = function (e) {
stop(e);
let id = (e && e.target) ? e.target.id : false;
if (id) {
let updates = items.updates,
actionArray = updates[id];
if (actionArray) {
let actionAttribute = actionArray[0],
action = actionArray[1],
targetVal = e.target.value,
actionFlag = true,
val;
switch (action) {
case 'float' :
val = parseFloat(targetVal);
break;
case 'int' :
val = parseInt(targetVal, 10);
break;
case 'round' :
val = Math.round(targetVal);
break;
case 'roundDown' :
val = Math.floor(targetVal);
break;
case 'roundUp' :
val = Math.ceil(targetVal);
break;
case 'raw' :
val = targetVal;
break;
case 'boolean' :
if (xt(targetVal)) {
if (targetVal.substring) {
if ('true' === targetVal.toLowerCase()) val = true;
else if ('false' === targetVal.toLowerCase()) val = false;
else val = (parseFloat(targetVal)) ? true : false;
}
else val = (targetVal) ? true : false;
}
else val = false;
break;
default :
if (action.substring) val = `${parseFloat(targetVal)}${action}`;
else actionFlag = false;
}
if (actionFlag) {
if (target.type === 'Group') {
target.setArtefacts({
[actionAttribute]: val
});
}
else {
target.set({
[actionAttribute]: val
});
}
}
}
}
};
let kill = function () {
killListener(event, func, origin);
};
listener(event, func, origin);
return kill;
};
const makeDragZone = function (items = {}) {
if (!items.zone) return false;
let target = (items.zone.substring) ? artefact[items.zone] : items.zone;
if (!target) return false;
let targetElement = target.domElement,
coordinateSource,
collisionGroup = (items.collisionGroup && items.collisionGroup.substring) ? library.group[items.collisionGroup] : items.collisionGroup,
startOn = (items.startOn) ? items.startOn : ['down'],
endOn = (items.endOn) ? items.endOn : ['up'];
if (target.type === 'Stack') {
coordinateSource = items.coordinateSource;
if (!coordinateSource) coordinateSource = target.here;
collisionGroup = items.collisionGroup;
if (!collisionGroup) collisionGroup = library.group[target.name];
else if (collisionGroup.substring) collisionGroup = library.group[collisionGroup];
}
else if (target.type === 'Canvas') {
coordinateSource = items.coordinateSource;
if (!coordinateSource) coordinateSource = target.base.here;
collisionGroup = items.collisionGroup;
if (!collisionGroup) collisionGroup = library.group[target.base.name];
else if (collisionGroup.substring) collisionGroup = library.group[collisionGroup];
}
if (!xta(targetElement, collisionGroup)) return false;
let current = false;
let pickup = function (e) {
if (e.cancelable) {
e.preventDefault();
e.returnValue = false;
}
let type = e.type;
if (type === 'touchstart' || type === 'touchcancel') touchAction(e);
if (!coordinateSource && target.type === 'Canvas') coordinateSource = target.base.here;
current = collisionGroup.getArtefactAt(coordinateSource);
if (current) current.artefact.pickupArtefact(coordinateSource);
};
let drop = function (e) {
if (e.cancelable) {
e.preventDefault();
e.returnValue = false;
}
if (current) {
current.artefact.dropArtefact();
current = false;
}
};
let kill = function () {
removeListener(startOn, pickup, targetElement);
removeListener(endOn, drop, targetElement);
};
let getCurrent = function (actionKill = false) {
if (actionKill) kill();
else return current;
};
addListener(startOn, pickup, targetElement);
addListener(endOn, drop, targetElement);
if (items.exposeCurrentArtefact) return getCurrent;
else return kill;
};
export {
uiSubscribedElements,
currentCorePosition,
startCoreListeners,
stopCoreListeners,
applyCoreResizeListener,
applyCoreScrollListener,
observeAndUpdate,
makeDragZone,
};
