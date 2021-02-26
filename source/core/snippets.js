// # Scrawl-canvas snippets

// ___To be aware - this functionality is HIGHLY EXPERIMENTAL; it will be subject to short-notice breaking changes as we amend and inprove the concept of Scrawl-canvas components___

// TODO - documentation



// ## Imports
import { isa_dom, isa_boolean, isa_obj } from "./utilities.js";
import { artefact, unstackedelement } from "./library.js";
import { makeAnimationObserver } from './events.js';

import { makeRender } from "../factory/renderAnimation.js";
import { makeUnstackedElement } from "../factory/unstackedElement.js";



// TODO - documentation
const makeSnippet = function (items) {

    let domElement = (isa_dom(items.domElement)) ? items.domElement : false,
        animationHooks = (isa_obj(items.animationHooks)) ? items.animationHooks : {},
        canvasSpecs = (isa_obj(items.canvasSpecs)) ? items.canvasSpecs : {},
        observerSpecs = (isa_obj(items.observerSpecs)) ? items.observerSpecs : {},
        includeCanvas = (isa_boolean(items.includeCanvas)) ? items.includeCanvas : true;

    if (domElement && domElement.id && artefact[domElement.id]) {

        return makeStackSnippet(domElement, canvasSpecs, animationHooks, observerSpecs);
    }
    return makeUnstackedSnippet(domElement, canvasSpecs, animationHooks, observerSpecs, includeCanvas);
};

// TODO - documentation
const makeStackSnippet = function (domElement, canvasSpecs, animationHooks, observerSpecs) {

    let myElement = artefact[domElement.id];

    if (!myElement) return false;

    canvasSpecs.isComponent = true;

    let myCanvas = myElement.addCanvas(canvasSpecs);
    myElement.elementComputedStyles = window.getComputedStyle(domElement);

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

// TODO - documentation
const makeUnstackedSnippet = function (domElement, canvasSpecs, animationHooks, observerSpecs, includeCanvas) {

    const unsupportedElements = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];

    if (!domElement || unsupportedElements.indexOf(domElement.tagName) >= 0) return {};

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


// TODO - documentation
export {
    makeSnippet,
};
