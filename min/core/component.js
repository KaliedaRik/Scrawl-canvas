import { isa_dom, isa_boolean, isa_obj, defaultNonReturnFunction } from "./utilities.js";
import { artefact, unstackedelement } from "./library.js";
import { makeAnimationObserver } from './document.js';
import { makeRender } from "../factory/renderAnimation.js";
import { makeUnstackedElement } from "../factory/unstackedElement.js";
const makeComponent = function (items) {
let domElement = (isa_dom(items.domElement)) ? items.domElement : false,
animationHooks = (isa_obj(items.animationHooks)) ? items.animationHooks : {},
canvasSpecs = (isa_obj(items.canvasSpecs)) ? items.canvasSpecs : {},
observerSpecs = (isa_obj(items.observerSpecs)) ? items.observerSpecs : {},
includeCanvas = (isa_boolean(items.includeCanvas)) ? items.includeCanvas : true;
if (domElement && domElement.id && artefact[domElement.id]) {
return makeStackComponent(domElement, canvasSpecs, animationHooks, observerSpecs);
}
return makeUnstackedComponent(domElement, canvasSpecs, animationHooks, observerSpecs, includeCanvas);
};
const makeStackComponent = function (domElement, canvasSpecs, animationHooks, observerSpecs) {
let myElement = artefact[domElement.id];
if (!myElement) return false;
canvasSpecs.isComponent = true;
let myCanvas = myElement.addCanvas(canvasSpecs);
animationHooks.name = `${myElement.name}-animation`;
animationHooks.target = myCanvas;
let myAnimation = makeRender(animationHooks);
let myObserver = makeAnimationObserver(myAnimation, myElement, observerSpecs);
let destroy = () => {
myObserver();
myAnimation.kill();
myCanvas.demolish();
myElement.demolish(true);
};
return {
element: myElement,
canvas: myCanvas,
animation: myAnimation,
demolish: destroy,
};
};
const makeUnstackedComponent = function (domElement, canvasSpecs, animationHooks, observerSpecs, includeCanvas) {
let myElement,
id = domElement.id;
if (id && unstackedelement[id]) myElement = unstackedelement[id];
else myElement = makeUnstackedElement(domElement);
canvasSpecs.isComponent = true;
let myCanvas = (includeCanvas) ? myElement.addCanvas(canvasSpecs) : false;
animationHooks.name = `${myElement.name}-animation`;
if (myCanvas) {
if (!animationHooks.afterClear) animationHooks.afterClear = () => myElement.updateCanvas();
animationHooks.target = myCanvas;
}
let myAnimation = makeRender(animationHooks);
let myObserver = makeAnimationObserver(myAnimation, myElement, observerSpecs);
let destroy = () => {
myObserver();
myAnimation.kill();
if (myCanvas) myCanvas.demolish();
myElement.demolish(true);
};
return {
element: myElement,
canvas: myCanvas,
animation: myAnimation,
demolish: destroy,
};
};
export {
makeComponent,
};
