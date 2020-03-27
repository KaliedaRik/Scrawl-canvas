import * as library from '../core/library.js';
import { defaultNonReturnFunction, defaultThisReturnFunction, defaultFalseReturnFunction,
generateUuid, isa_fn, mergeOver, pushUnique, xt, xta, addStrings } from '../core/utilities.js';
import { currentGroup, scrawlCanvasHold } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';
import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from '../factory/filter.js';
import { importDomImage } from '../factory/imageAsset.js';
export default function (P = {}) {
let defaultAttributes = {
method: 'fill',
pathObject: null,
winding: 'nonzero',
flipReverse: false,
flipUpend: false,
scaleOutline: true,
lockFillStyleToEntity: false,
lockStrokeStyleToEntity: false,
onEnter: null,
onLeave: null,
onDown: null,
onUp: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['state']);
P.packetFunctions = pushUnique(P.packetFunctions, ['onEnter', 'onLeave', 'onDown', 'onUp']);
P.processEntityPacketOut = function (key, value, includes) {
return this.processFactoryPacketOut(key, value, includes);
};
P.processFactoryPacketOut = function (key, value, includes) {
let result = true;
if(includes.indexOf(key) < 0 && value === this.defs[key]) result = false;
return result;
};
P.finalizePacketOut = function (copy, items) {
let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
copy = mergeOver(copy, stateCopy);
copy = this.handlePacketAnchor(copy, items);
return copy;
};
P.postCloneAction = function(clone, items) {
if (this.onEnter) clone.onEnter = this.onEnter;
if (this.onLeave) clone.onLeave = this.onLeave;
if (this.onDown) clone.onDown = this.onDown;
if (this.onUp) clone.onUp = this.onUp;
if (items.sharedState) clone.state = this.state;
if (items.anchor) {
items.anchor.host = clone;
if (!xt(items.anchor.focusAction)) items.anchor.focusAction = this.anchor.focusAction;
if (!xt(items.anchor.blurAction)) items.anchor.blurAction = this.anchor.blurAction;
clone.buildAnchor(items.anchor);
if (!items.anchor.clickAction) clone.anchor.clickAction = this.anchor.clickAction;
}
return clone;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.group = function () {
return (this.group) ? this.group.name : '';
};
S.lockStylesToEntity = function (item) {
this.lockFillStyleToEntity = item;
this.lockStrokeStyleToEntity = item;
};
S.flipUpend = function (item) {
if (item !== this.flipUpend) this.dirtyCollision = true;
this.flipUpend = item;
};
S.flipReverse = function (item) {
if (item !== this.flipReverse) this.dirtyCollision = true;
this.flipReverse = item;
};
P.get = function (item) {
let getter = this.getters[item];
if (getter) return getter.call(this);
else {
let def = this.defs[item],
state = this.state,
val;
if (typeof def != 'undefined') {
val = this[item];
return (typeof val != 'undefined') ? val : def;
}
def = state.defs[item];
if (typeof def != 'undefined') {
val = state[item];
return (typeof val != 'undefined') ? val : def;
}
return undef;
}
};
P.set = function (items = {}) {
if (items) {
let setters = this.setters,
defs = this.defs,
state = this.state,
stateSetters = (state) ? state.setters : {},
stateDefs = (state) ? state.defs : {};
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key],
stateFlag = false;
if (!predefined) {
predefined = stateSetters[key];
stateFlag = true;
}
if (predefined) predefined.call(stateFlag ? this.state : this, value);
else if (typeof defs[key] !== 'undefined') this[key] = value;
else if (typeof stateDefs[key] !== 'undefined') state[key] = value;
}
}, this);
}
return this;
};
P.setDelta = function (items = {}) {
if (items) {
let setters = this.deltaSetters,
defs = this.defs,
state = this.state,
stateSetters = (state) ? state.deltaSetters : {},
stateDefs = (state) ? state.defs : {};
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key],
stateFlag = false;
if (!predefined) {
predefined = stateSetters[key];
stateFlag = true;
}
if (predefined) predefined.call(stateFlag ? this.state : this, value);
else if (typeof defs[key] !== 'undefined') this[key] = addStrings(this[key], value);
else if (typeof stateDefs[key] !== 'undefined') state[key] = addStrings(state[key], value);
}
}, this);
}
return this;
};
P.entityInit = function (items = {}) {
this.makeName(items.name);
this.register();
this.initializePositions();
this.set(this.defs);
this.state = makeState();
if (!items.group) items.group = currentGroup;
this.onEnter = defaultNonReturnFunction;
this.onLeave = defaultNonReturnFunction;
this.onDown = defaultNonReturnFunction;
this.onUp = defaultNonReturnFunction;
this.set(items);
this.midInitActions(items);
};
P.midInitActions = defaultNonReturnFunction;
P.prepareStamp = function() {
if (this.dirtyHost) {
this.dirtyHost = false;
this.dirtyDimensions = true;
}
if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;
if (this.dirtyRotation) this.dirtyCollision = true;
if (this.dirtyScale) this.cleanScale();
if (this.dirtyDimensions) this.cleanDimensions();
if (this.dirtyLock) this.cleanLock();
if (this.dirtyStart) this.cleanStart();
if (this.dirtyOffset) this.cleanOffset();
if (this.dirtyHandle) this.cleanHandle();
if (this.dirtyRotation) this.cleanRotation();
if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
if (this.dirtyStampPositions) this.cleanStampPositions();
if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();
if (this.dirtyPathObject) {
this.cleanPathObject();
this.dirtyCollision = true;
}
if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
if (this.anchor && this.dirtyAnchorHold) {
this.dirtyAnchorHold = false;
this.buildAnchor(this.anchor);
}
};
P.cleanPathObject = defaultNonReturnFunction;
P.stamp = function (force = false, host, changes) {
let filterTest = (!this.noFilters && this.filters && this.filters.length) ? true : false;
if (force) {
if (host && host.type === 'Cell') this.currentHost = host;
if (changes) {
this.set(changes);
this.prepareStamp();
}
if (filterTest) return this.filteredStamp();
else return this.regularStamp();
}
if (this.visibility) {
if (this.stashOutput || filterTest) return this.filteredStamp();
else return this.regularStamp();
}
return Promise.resolve(false);
};
P.regularStamp = function () {
let self = this;
return new Promise((resolve, reject) => {
if (self.currentHost) {
self.regularStampSynchronousActions();
resolve(true);
}
reject(false);
});
};
P.filteredStamp = function(){
if (this.dirtyFilters || !this.currentFilters) this.cleanFilters();
let self = this;
return new Promise((resolve, reject) => {
let cleanup = function () {
if (worker) releaseFilterWorker(worker);
currentEngine.save();
currentEngine.globalCompositeOperation = self.filterComposite;
currentEngine.globalAlpha = self.filterAlpha;
currentEngine.setTransform(1, 0, 0, 1, 0, 0);
currentEngine.drawImage(filterElement, 0, 0);
if (self.stashOutput) {
self.stashOutput = false;
let [stashX, stashY, stashWidth, stashHeight] = self.getCellCoverage(filterEngine.getImageData(0, 0, filterElement.width, filterElement.height));
self.stashedImageData = filterEngine.getImageData(stashX, stashY, stashWidth, stashHeight);
if (self.stashOutputAsAsset) {
self.stashOutputAsAsset = false;
filterElement.width = stashWidth;
filterElement.height = stashHeight;
filterEngine.putImageData(self.stashedImageData, 0, 0);
if (!self.stashedImage) {
let newimg = self.stashedImage = document.createElement('img');
newimg.id = `${self.name}-image`;
newimg.onload = function () {
scrawlCanvasHold.appendChild(newimg);
importDomImage(`#${newimg.id}`);
};
newimg.src = filterElement.toDataURL();
}
else self.stashedImage.src = filterElement.toDataURL();
}
}
releaseCell(filterHost);
currentEngine.restore();
self.currentHost = currentHost;
self.noCanvasEngineUpdates = oldNoCanvasEngineUpdates;
};
let currentHost = self.currentHost,
currentElement = currentHost.element,
currentEngine = currentHost.engine,
currentDimensions = currentHost.currentDimensions;
let filterHost = requestCell(),
filterElement = filterHost.element,
filterEngine = filterHost.engine;
self.currentHost = filterHost;
let w = filterElement.width = currentDimensions[0] || currentElement.width,
h = filterElement.height = currentDimensions[1] || currentElement.height;
let oldNoCanvasEngineUpdates = self.noCanvasEngineUpdates;
self.noCanvasEngineUpdates = false;
self.regularStampSynchronousActions();
let worker, myimage;
if (!self.noFilters && self.filters && self.filters.length) {
if (self.isStencil) {
filterEngine.save();
filterEngine.globalCompositeOperation = 'source-in';
filterEngine.globalAlpha = 1;
filterEngine.setTransform(1, 0, 0, 1, 0, 0);
filterEngine.drawImage(currentElement, 0, 0);
filterEngine.restore();
}
filterEngine.setTransform(1, 0, 0, 1, 0, 0);
myimage = filterEngine.getImageData(0, 0, w, h);
worker = requestFilterWorker();
actionFilterWorker(worker, {
image: myimage,
filters: self.currentFilters
})
.then(img => {
if (img) {
filterEngine.globalCompositeOperation = 'source-over';
filterEngine.globalAlpha = 1;
filterEngine.setTransform(1, 0, 0, 1, 0, 0);
filterEngine.putImageData(img, 0, 0);
cleanup();
resolve(true);
}
else throw new Error('image issue');
})
.catch((err) => {
cleanup();
reject(false);
});
}
else {
cleanup();
resolve(true);
}
});
};
P.getCellCoverage = function (img) {
let width = img.width,
height = img.height,
data = img.data,
maxX = 0,
maxY = 0,
minX = width,
minY = height,
counter = 3,
x, y;
for (y = 0; y < height; y++) {
for (x = 0; x < width; x++) {
if (data[counter]) {
if (minX > x) minX = x;
if (maxX < x) maxX = x;
if (minY > y) minY = y;
if (maxY < y) maxY = y;
}
counter += 4;
}
}
if (minX < maxX && minY < maxY) return [minX, minY, maxX - minX, maxY - minY];
else return [0, 0, width, height];
};
P.simpleStamp = function (host, changes = {}) {
if (host && host.type === 'Cell') {
this.currentHost = host;
this.set(changes);
this.prepareStamp();
this.regularStampSynchronousActions();
}
};
P.regularStampSynchronousActions = function () {
let dest = this.currentHost;
if (dest) {
let engine = dest.engine,
stamp = this.currentStampPosition,
x = stamp[0],
y = stamp[1];
dest.rotateDestination(engine, x, y, this);
if (!this.noCanvasEngineUpdates) dest.setEngine(this);
this[this.method](engine);
}
};
P.draw = function (engine) {
engine.stroke(this.pathObject);
};
P.fill = function (engine) {
engine.fill(this.pathObject, this.winding);
};
P.drawAndFill = function (engine) {
let p = this.pathObject;
engine.stroke(p);
this.currentHost.clearShadow();
engine.fill(p, this.winding);
};
P.fillAndDraw = function (engine) {
let p = this.pathObject;
engine.stroke(p);
this.currentHost.clearShadow();
engine.fill(p, this.winding);
engine.stroke(p);
};
P.drawThenFill = function (engine) {
let p = this.pathObject;
engine.stroke(p);
engine.fill(p, this.winding);
};
P.fillThenDraw = function (engine) {
let p = this.pathObject;
engine.fill(p, this.winding);
engine.stroke(p);
};
P.clear = function (engine) {
let gco = engine.globalCompositeOperation;
engine.globalCompositeOperation = 'destination-out';
engine.fill(this.pathObject, this.winding);
engine.globalCompositeOperation = gco;
};
P.none = function (engine) {}
return P;
};
