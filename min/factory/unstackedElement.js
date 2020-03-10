import { unstackedelement, unstackedelementnames, constructors } from '../core/library.js';
import { generateUuid, pushUnique, removeItem, xt, isa_obj, isa_boolean, mergeOver } from '../core/utilities.js';
import { uiSubscribedElements } from '../core/userInteraction.js';
import { makeCanvas } from './canvas.js';
import baseMix from '../mixin/base.js';
const UnstackedElement = function (el) {
let name = el.id || el.name;
this.makeName(name);
this.register();
el.setAttribute('data-scrawl-name', this.name);
this.domElement = el;
this.elementComputedStyles = window.getComputedStyle(el);
this.hostStyles = {};
this.canvasStartX = 0;
this.canvasStartY = 0;
this.canvasWidth = 0;
this.canvasHeight = 0;
this.canvasZIndex = 0;
return this;
};
let P = UnstackedElement.prototype = Object.create(Object.prototype);
P.type = 'UnstackedElement';
P.lib = 'unstackedelement';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
let defaultAttributes = {
canvasOnTop: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
P.demolish = function (removeFromDom = false) {
return true;
};
P.addCanvas = function (items = {}) {
if (!this.canvas) {
let canvas = document.createElement('canvas'),
el = this.domElement,
style = el.style;
if (style.position === 'static') style.position = 'relative';
el.prepend(canvas);
let art = makeCanvas({
name: `${this.name}-canvas`,
domElement: canvas,
position: 'absolute',
});
this.canvas = art;
art.set(items);
this.updateCanvas()
return art;
}
};
P.includedStyles = ['width', 'height', 'zIndex', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius'];
P.mimickedStyles = ['borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius'];
P.checkElementStyleValues = function () {
let results = {};
let el = this.domElement,
wrapper = this.canvas;
if (el && wrapper && wrapper.domElement) {
let host = this.hostStyles,
style = this.elementComputedStyles,
canvas = wrapper.domElement,
includedStyles = this.includedStyles,
mMax = Math.max;
let {x: elX, y: elY, width: elW, height: elH} = el.getBoundingClientRect();
let {x: canvasX, y: canvasY} = canvas.getBoundingClientRect();
includedStyles.forEach(item => {
switch (item) {
case 'width' :
let w = mMax(parseFloat(style.width), elW);
if (this.canvasWidth !== w) {
this.canvasWidth = w;
this.dirtyDimensions = true;
}
break;
case 'height' :
let h = mMax(parseFloat(style.height), elH);
if (this.canvasHeight !== h) {
this.canvasHeight = h;
this.dirtyDimensions = true;
}
break;
case 'zIndex' :
let z = (style.zIndex === 'auto') ? 0 : parseInt(style.zIndex, 10);
z = (this.canvasOnTop) ? z + 1 : z - 1;
if (this.canvasZIndex !== z) {
this.canvasZIndex = z;
this.dirtyZIndex = true;
}
break;
default :
let hi = host[item],
si = style[item];
if(!xt(hi) || hi !== si) {
host[item] = si;
results[item] = si;
}
}
});
let dx = elX - canvasX,
dy = elY - canvasY;
if (dx || dy) {
this.canvasStartX += dx;
this.canvasStartY += dy;
this.dirtyStart = true;
}
}
return results;
};
P.updateCanvas = function () {
if (this.canvas && this.canvas.domElement) {
let canvas = this.canvas,
style = canvas.domElement.style,
mimics = this.mimickedStyles,
updates = this.checkElementStyleValues();
for (let [key, value] of Object.entries(updates)) {
if (mimics.indexOf(key) >= 0) {
style[key] = value;
}
}
if (this.dirtyStart) {
this.dirtyStart = false;
canvas.set({
startX: this.canvasStartX,
startY: this.canvasStartY,
});
}
if (this.dirtyDimensions) {
this.dirtyDimensions = false;
let w = this.canvasWidth,
h = this.canvasHeight;
canvas.set({
width: w,
height: h,
});
canvas.dirtyDimensions = true;
canvas.base.set({
width: w,
height: h,
});
canvas.base.dirtyDimensions = true;
canvas.cleanDimensions();
canvas.base.cleanDimensions();
}
if (this.dirtyZIndex) {
this.dirtyZIndex = false;
style.zIndex = this.canvasZIndex;
}
}
};
const makeUnstackedElement = function (items) {
return new UnstackedElement(items);
};
constructors.UnstackedElement = UnstackedElement;
export {
makeUnstackedElement,
};
