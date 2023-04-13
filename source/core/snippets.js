// # Scrawl-canvas snippets

// ___To be aware - this functionality is HIGHLY EXPERIMENTAL; it will be subject to short-notice breaking changes as we amend and inprove the concept of Scrawl-canvas snippets___

// TODO - documentation


// ## Imports
import { artefact, unstackedelement } from "./library.js";

import { isa_boolean, isa_dom, isa_obj } from "./utilities.js";

import { makeAnimationObserver } from './events.js';

import { makeRender } from "../factory/render-animation.js";
import { makeUnstackedElement } from "../factory/unstacked-element.js";

import { _computed, NON_SNIPPET_ELEMENTS } from './shared-vars.js';


// TODO - documentation
export const makeSnippet = function (items) {

    const el = (isa_dom(items.domElement)) ? items.domElement : false,
        hooks = (isa_obj(items.animationHooks)) ? items.animationHooks : {},
        cSpec = (isa_obj(items.canvasSpecs)) ? items.canvasSpecs : {},
        oSpec = (isa_obj(items.observerSpecs)) ? items.observerSpecs : {},
        c = (isa_boolean(items.includeCanvas)) ? items.includeCanvas : true;

    if (el && el.id && artefact[el.id]) {

        return makeStackSnippet(el, cSpec, hooks, oSpec);
    }
    return makeUnstackedSnippet(el, cSpec, hooks, oSpec, c);
};

// TODO - documentation
const makeStackSnippet = function (el, cSpec, hooks, oSpec) {

    const element = artefact[el.id];

    if (!element) return false;

    cSpec.baseMatchesCanvasDimensions = true;
    cSpec.ignoreCanvasCssDimensions = true;
    cSpec.checkForResize = true;

    const canvas = element.addCanvas(cSpec);
    element.elementComputedStyles = _computed(el);

    hooks.name = `${element.name}-animation`;
    hooks.target = canvas;

    const animation = makeRender(hooks);

    const observer = makeAnimationObserver(animation, element, oSpec);

    const demolish = () => {
        observer();
        animation.kill();
        canvas.demolish();
        element.demolish(true);
    };

    return {
        element,
        canvas,
        animation,
        demolish,
    };
};

// TODO - documentation
const makeUnstackedSnippet = function (el, cSpec, hooks, oSpec, c) {

    if (!el || NON_SNIPPET_ELEMENTS.includes(el.tagName)) return {};

    const id = el.id;
    let element;

    if (id && unstackedelement[id]) element = unstackedelement[id];
    else element = makeUnstackedElement(el);

    cSpec.baseMatchesCanvasDimensions = true;
    cSpec.checkForResize = true;

    const canvas = (c) ? element.addCanvas(cSpec) : false;

    hooks.name = `${element.name}-animation`;
    if (canvas) {

        if (!hooks.afterClear) hooks.afterClear = () => element.updateCanvas();
        hooks.target = canvas;
    }
    else hooks.noTarget = true;

    const animation = makeRender(hooks);

    const observer = makeAnimationObserver(animation, element, oSpec);

    const demolish = () => {
        observer();
        animation.kill();
        if (canvas) canvas.demolish();
        element.demolish(true);
    };

    return {
        element,
        canvas,
        animation,
        demolish,
    };
};
