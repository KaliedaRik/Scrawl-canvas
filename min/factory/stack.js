import { constructors, group, stack, element, artefact, canvas } from '../core/library.js';
import { mergeOver, pushUnique, isa_dom, removeItem, xt, addStrings, λthis, λnull } from '../core/utilities.js';
import { rootElements, setRootElementsSort, domShow } from '../core/document.js';
import { uiSubscribedElements, currentCorePosition } from '../core/userInteraction.js';
import { makeGroup } from './group.js';
import { makeElement } from './element.js';
import { makeCoordinate } from './coordinate.js';
import baseMix from '../mixin/base.js';
import cascadeMix from '../mixin/cascade.js';
import domMix from '../mixin/dom.js';
const Stack = function (items = {}) {
let g, el;
this.makeName(items.name);
this.register();
this.initializePositions();
this.initializeCascade();
this.dimensions[0] = 300;
this.dimensions[1] = 150;
this.pathCorners = [];
this.css = {};
this.here = {};
this.perspective = {
x: '50%',
y: '50%',
z: 0
};
this.dirtyPerspective = true;
this.initializeDomLayout(items);
g = makeGroup({
name: this.name,
host: this.name
});
this.addGroups(g.name);
this.set(this.defs);
this.set(items);
el = this.domElement;
if (el) {
if (this.trackHere) pushUnique(uiSubscribedElements, this.name);
if (el.getAttribute('data-group') === 'root') {
pushUnique(rootElements, this.name);
setRootElementsSort();
}
}
return this;
};
let P = Stack.prototype = Object.create(Object.prototype);
P.type = 'Stack';
P.lib = 'stack';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = cascadeMix(P);
P = domMix(P);
let defaultAttributes = {
position: 'relative',
perspective: null,
trackHere: true,
isResponsive: false,
containElementsInHeight: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {
return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;
P.kill = function () {
let myname = this.name;
removeItem(rootElements, myname);
setRootElementsSort();
removeItem(uiSubscribedElements, myname);
if (group[myname]) group[myname].kill();
Object.entries(artefact).forEach(([name, art]) => {
if (art.host === myname) art.kill();
});
this.domElement.remove();
return this.deregister();
}
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.perspectiveX = function () {
return this.perspective.x;
};
G.perspectiveY = function () {
return this.perspective.y;
};
G.perspectiveZ = function () {
return this.perspective.z;
};
S.perspectiveX = function (item) {
this.perspective.x = item;
this.dirtyPerspective = true;
};
S.perspectiveY = function (item) {
this.perspective.y = item;
this.dirtyPerspective = true;
};
S.perspectiveZ = function (item) {
this.perspective.z = item;
this.dirtyPerspective = true;
};
S.perspective = function (item = {}) {
this.perspective.x = (xt(item.x)) ? item.x : this.perspective.x;
this.perspective.y = (xt(item.y)) ? item.y : this.perspective.y;
this.perspective.z = (xt(item.z)) ? item.z : this.perspective.z;
this.dirtyPerspective = true;
};
D.perspectiveX = function (item) {
this.perspective.x = addStrings(this.perspective.x, item);
this.dirtyPerspective = true;
};
D.perspectiveY = function (item) {
this.perspective.y = addStrings(this.perspective.y, item);
this.dirtyPerspective = true;
};
P.updateArtefacts = function (items = {}) {
this.groupBuckets.forEach(grp => {
grp.artefactBuckets.forEach(art => {
if (items.dirtyScale) art.dirtyScale = true;
if (items.dirtyDimensions) art.dirtyDimensions = true;
if (items.dirtyLock) art.dirtyLock = true;
if (items.dirtyStart) art.dirtyStart = true;
if (items.dirtyOffset) art.dirtyOffset = true;
if (items.dirtyHandle) art.dirtyHandle = true;
if (items.dirtyRotation) art.dirtyRotation = true;
if (items.dirtyPathObject) art.dirtyPathObject = true;
})
});
};
P.cleanDimensionsAdditionalActions = function () {
if (this.groupBuckets) {
this.updateArtefacts({
dirtyDimensions: true,
dirtyPath: true,
dirtyStart: true,
dirtyHandle: true,
});
}
this.dirtyDomDimensions = true;
this.dirtyPath = true;
this.dirtyStart = true;
this.dirtyHandle = true;
};
P.cleanPerspective = function () {
this.dirtyPerspective = false;
let p = this.perspective;
this.domPerspectiveString = `perspective-origin: ${p.x} ${p.y}; perspective: ${p.z}px;`;
this.domShowRequired = true;
if (this.groupBuckets) {
this.updateArtefacts({
dirtyHandle: true,
dirtyPathObject: true,
});
}
};
P.checkResponsive = function () {
if (this.isResponsive && this.trackHere) {
if (!this.currentVportWidth) this.currentVportWidth = currentCorePosition.w;
if (!this.currentVportHeight) this.currentVportHeight = currentCorePosition.h;
if (this.dirtyHeight && this.containElementsInHeight) {
console.log('stack height final fixes need to be done');
this.dirtyHeight = false;
}
if (this.currentVportWidth !== currentCorePosition.w) {
console.log('need to update for resized viewport width');
this.currentVportWidth = currentCorePosition.w;
if (this.containElementsInHeight) {
this.dirtyHeight = true;
}
}
if (this.currentVportHeight !== currentCorePosition.h) {
console.log('need to update for resized viewport height');
this.currentVportHeight = currentCorePosition.h;
}
}
};
P.clear = function () {
this.checkResponsive();
return Promise.resolve(true);
};
P.compile = function () {
let self = this;
return new Promise((resolve, reject) => {
self.sortGroups();
self.prepareStamp()
self.stamp()
.then(() => {
let promises = [];
self.groupBuckets.forEach(mygroup => promises.push(mygroup.stamp()));
return Promise.all(promises);
})
.then(() => resolve(true))
.catch((err) => reject(false));
})
};
P.show = function () {
return new Promise((resolve) => {
domShow();
resolve(true);
});
};
P.render = function () {
let self = this;
return new Promise((resolve, reject) => {
self.compile()
.then(() => self.show())
.then(() => resolve(true))
.catch((err) => reject(false));
});
};
P.addExistingDomElements = function (search) {
let elements, el, captured, i, iz;
if (xt(search)) {
elements = (search.substring) ? document.querySelectorAll(search) : [].concat(search);
for (i = 0, iz = elements.length; i < iz; i++) {
el = elements[i];
if (isa_dom(el)) {
captured = makeElement({
name: el.id || el.name,
domElement: el,
group: this.name,
host: this.name,
position: 'absolute',
setInitialDimensions: true,
});
if (captured && captured.domElement) this.domElement.appendChild(captured.domElement);
}
}
}
return this;
};
P.addNewElement = function (items = {}) {
if (items.tag) {
items.domElement = document.createElement(items.tag);
items.domElement.setAttribute('data-group', this.name);
if (!xt(items.group)) items.group = this.name;
items.host = this.name;
if (!items.position) items.position = 'absolute';
if (!xt(items.width)) items.width = 100;
if (!xt(items.height)) items.height = 100;
let myElement = makeElement(items);
if (myElement && myElement.domElement) {
if (!xt(items.boxSizing)) myElement.domElement.style.boxSizing = 'border-box';
this.domElement.appendChild(myElement.domElement);
}
return myElement;
}
return false;
};
const makeStack = function (items) {
return new Stack(items);
};
constructors.Stack = Stack;
export {
makeStack,
};
