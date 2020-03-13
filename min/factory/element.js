import { group, element, elementnames, artefact, artefactnames, constructors } from '../core/library.js';
import { generateUuid, pushUnique, mergeOver, removeItem, xt, isa_obj, isa_dom, isa_boolean } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';
import { makeCanvas } from './canvas.js';
import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import domMix from '../mixin/dom.js';
const Element = function (items = {}) {
let el = items.domElement;
this.makeName(items.name);
this.register();
if (el) {
if (items.text) el.textContent = items.text;
else if (items.content) el.innerHTML = items.content;
}
this.initializePositions();
this.dimensions[0] = this.dimensions[1] = 100;
this.pathCorners = [];
this.css = {};
this.here = {};
this.initializeDomLayout(items);
this.set(this.defs);
this.set(items);
el = this.domElement;
if (el) {
el.id = this.name;
if (this.trackHere) pushUnique(uiSubscribedElements, this.name);
}
this.apply();
return this;
};
let P = Element.prototype = Object.create(Object.prototype);
P.type = 'Element';
P.lib = 'element';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = domMix(P);
let defaultAttributes = {};
P.defs = mergeOver(P.defs, defaultAttributes);
let S = P.setters;
S.text = function (item) {
if (isa_dom(this.domElement)) {
let el = this.domElement,
kids = el.querySelectorAll('[data-corner-div="sc"]');
el.textContent = item;
kids.forEach(kid => el.appendChild(kid));
this.dirtyContent = true;
}
};
S.content = function (item) {
if (this.domElement) {
let el = this.domElement,
kids = el.querySelectorAll('[data-corner-div="sc"]');
el.innerHTML = item;
kids.forEach(kid => el.appendChild(kid));
this.dirtyContent = true;
}
};
P.cleanDimensionsAdditionalActions = function () {
this.dirtyDomDimensions = true;
};
P.demolish = function (removeFromDom = false) {
let el = this.domElement,
name = this.name,
g = this.group;
if (g) g.removeArtefacts(name);
if (el && removeFromDom) el.parentNode.removeChild(el);
if (this.pivot) removeItem(this.pivot.pivoted, this.name);
if (this.path) removeItem(this.path.pathed, this.name);
if (this.mimic) removeItem(this.mimic.mimicked, this.name);
removeItem(uiSubscribedElements, name);
delete element[name];
removeItem(elementnames, name);
delete artefact[name];
removeItem(artefactnames, name);
return true;
};
P.addCanvas = function (items = {}) {
if (!this.canvas) {
let canvas = document.createElement('canvas'),
el = this.domElement;
let rect = el.getBoundingClientRect(),
style = window.getComputedStyle(el);
el.parentNode.insertBefore(canvas, this.domElement);
let art = makeCanvas({
name: `${this.name}-canvas`,
domElement: canvas,
position: 'absolute',
width: rect.width,
height: rect.height,
mimic: this.name,
lockTo: 'mimic',
useMimicDimensions: true,
useMimicScale: true,
useMimicStart: true,
useMimicHandle: true,
useMimicOffset: true,
useMimicRotation: true,
addOwnDimensionsToMimic: false,
addOwnScaleToMimic: false,
addOwnStartToMimic: false,
addOwnHandleToMimic: false,
addOwnOffsetToMimic: false,
addOwnRotationToMimic: false,
});
art.set(items);
this.canvas = art;
return art;
}
};
const makeElement = function (items) {
return new Element(items);
};
constructors.Element = Element;
export {
makeElement,
};
