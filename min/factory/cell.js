import { artefact, asset, tween, radian, constructors, styles, stylesnames, cell, cellnames, group, canvas } from '../core/library.js';
import { generateUuid, isa_canvas, mergeOver, λthis, λnull } from '../core/utilities.js';
import { scrawlCanvasHold } from '../core/document.js';
import { makeGroup } from './group.js';
import { makeState } from './state.js';
import { makeCoordinate } from './coordinate.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from './filter.js';
import { importDomImage } from './imageAsset.js';
import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import deltaMix from '../mixin/delta.js';
import pivotMix from '../mixin/pivot.js';
import mimicMix from '../mixin/mimic.js';
import pathMix from '../mixin/path.js';
import anchorMix from '../mixin/anchor.js';
import cascadeMix from '../mixin/cascade.js';
import assetMix from '../mixin/asset.js';
import filterMix from '../mixin/filter.js';
const Cell = function (items = {}) {
this.makeName(items.name);
if (!items.isPool) this.register();
this.initializePositions();
this.initializeCascade();
if (!isa_canvas(items.element)) {
let mycanvas = document.createElement('canvas');
mycanvas.id = this.name;
mycanvas.width = 300;
mycanvas.height = 150;
items.element = mycanvas;
}
this.installElement(items.element);
if (items.isPool) this.set(this.poolDefs)
else this.set(this.defs);
this.set(items);
this.state.setStateFromEngine(this.engine);
if (!items.isPool) {
makeGroup({
name: this.name,
host: this.name
});
}
this.subscribers = [];
this.sourceNaturalDimensions = makeCoordinate();
this.sourceLoaded = true;
return this;
};
let P = Cell.prototype = Object.create(Object.prototype);
P.type = 'Cell';
P.lib = 'cell';
P.isArtefact = false;
P.isAsset = true;
P = baseMix(P);
P = positionMix(P);
P = deltaMix(P);
P = pivotMix(P);
P = mimicMix(P);
P = pathMix(P);
P = anchorMix(P);
P = cascadeMix(P);
P = assetMix(P);
P = filterMix(P);
let defaultAttributes = {
cleared: true,
compiled: true,
shown: true,
compileOrder: 0,
showOrder: 0,
backgroundColor: '',
alpha: 1,
composite: 'source-over',
scale: 1,
localizeHere: false,
repeat: 'repeat',
isBase: false,
controller: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
delete P.defs.source;
delete P.defs.sourceLoaded;
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {
return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;
P.kill = function () {
let myname = this.name
Object.entries(canvas).forEach(([name, cvs]) => {
if (cvs.cells.indexOf(myname) >= 0) cvs.removeCell(myname);
if (cvs.base && cvs.base.name === myname) {
cvs.set({
visibility: false,
});
}
});
if (this.anchor) this.demolishAnchor();
Object.entries(artefact).forEach(([name, art]) => {
if (art.name !== myname) {
if (art.pivot && art.pivot.name === myname) art.set({ pivot: false});
if (art.mimic && art.mimic.name === myname) art.set({ mimic: false});
if (art.path && art.path.name === myname) art.set({ path: false});
let state = art.state;
if (state) {
let fill = state.fillStyle,
stroke = state.strokeStyle;
if (fill.name && fill.name === myname) state.fillStyle = state.defs.fillStyle;
if (stroke.name && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
}
}
});
Object.entries(tween).forEach(([name, t]) => {
if (t.checkForTarget(myname)) t.removeFromTargets(this);
});
if (group[this.name]) group[this.name].kill();
this.deregister();
return this;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
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
G.width = function () {
return this.currentDimensions[0] || this.element.getAttribute('width');
};
S.width = function (item) {
this.dimensions[0] = item;
this.dirtyDimensions = true;
};
G.height = function () {
return this.currentDimensions[1] || this.element.getAttribute('height');
};
S.height = function (item) {
this.dimensions[1] = item;
this.dirtyDimensions = true;
};
S.source = function () {};
S.engine = function (item) {};
S.state = function (item) {};
S.element = function (item) {
if(isa_canvas(item)) this.installElement(item);
};
S.cleared = function (item) {
this.cleared = item;
this.updateControllerCells();
};
S.compiled = function (item) {
this.compiled = item;
this.updateControllerCells();
};
S.shown = function (item) {
this.shown = item;
this.updateControllerCells();
};
S.compileOrder = function (item) {
this.compileOrder = item;
this.updateControllerCells();
};
S.showOrder = function (item) {
this.showOrder = item;
this.updateControllerCells();
};
S.stashX = function (val) {
if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
this.stashCoordinates[0] = val;
};
S.stashY = function (val) {
if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
this.stashCoordinates[1] = val;
};
S.stashWidth = function (val) {
if (!this.stashDimensions) {
let dims = this.currentDimensions;
this.stashDimensions = [dims[0], dims[1]];
}
this.stashDimensions[0] = val;
};
S.stashHeight = function (val) {
if (!this.stashDimensions) {
let dims = this.currentDimensions;
this.stashDimensions = [dims[0], dims[1]];
}
this.stashDimensions[1] = val;
};
D.stashX = function (val) {
if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
let c = this.stashCoordinates;
c[0] = addStrings(c[0], val);
};
D.stashY = function (val) {
if (!this.stashCoordinates) this.stashCoordinates = [0, 0];
let c = this.stashCoordinates;
c[1] = addStrings(c[1], val);
};
D.stashWidth = function (val) {
if (!this.stashDimensions) {
let dims = this.currentDimensions;
this.stashDimensions = [dims[0], dims[1]];
}
let c = this.stashDimensions;
c[0] = addStrings(c[0], val);
};
D.stashHeight = function (val) {
if (!this.stashDimensions) {
let dims = this.currentDimensions;
this.stashDimensions = [dims[0], dims[1]];
}
let c = this.stashDimensions;
c[1] = addStrings(c[1], val);
};
P.repeatValues = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']
S.repeat = function (item) {
if (this.repeatValues.indexOf(item) >= 0) this.repeat = item;
else this.repeat = this.defs.repeat;
};
P.checkSource = function (width, height) {
if (this.currentDimensions[0] !== width || this.currentDimensions[1] !== height) this.notifySubscribers();
};
P.getData = function (entity, cell) {
this.checkSource(this.sourceNaturalDimensions[0], this.sourceNaturalDimensions[1]);
return this.buildStyle(cell);
};
P.buildStyle = function (mycell = {}) {
if (mycell) {
let engine = false;
if (mycell.substring) {
let realcell = cell[mycell];
if (realcell && realcell.engine) engine = realcell.engine;
}
else if (mycell.engine) engine = mycell.engine;
if (engine) return engine.createPattern(this.element, this.repeat);
}
return 'rgba(0,0,0,0)';
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
P.cleanDimensionsAdditionalActions = function() {
let element = this.element;
if (element) {
let control = this.controller,
current = this.currentDimensions,
base = this.isBase;
if (base && control && control.isComponent) {
let controlDims = this.controller.currentDimensions,
dims = this.dimensions;
dims[0] = current[0] = controlDims[0];
dims[1] = current[1] = controlDims[1];
}
let [w, h] = current;
element.width = w;
element.height = h;
this.setEngineFromState(this.engine);
if (base && control) control.updateBaseHere();
if (this.groupBuckets) {
this.updateArtefacts({
dirtyDimensions: true,
});
}
}
};
P.notifySubscriber = function (sub) {
sub.sourceNaturalDimensions[0] = this.currentDimensions[0];
sub.sourceNaturalDimensions[1] = this.currentDimensions[1];
sub.sourceLoaded = true;
sub.dirtyImage = true;
};
P.subscribeAction = function (sub = {}) {
this.subscribers.push(sub);
sub.asset = this;
sub.source = this.element;
this.notifySubscriber(sub)
};
P.installElement = function (element) {
this.element = element;
this.engine = this.element.getContext('2d');
this.state = makeState({
engine: this.engine
});
return this;
};
P.updateControllerCells = function () {
if (this.controller) this.controller.dirtyCells = true;
};
P.setEngineFromState = function (engine) {
let state = this.state;
state.allKeys.forEach(key => {
if (key === 'lineDash') {
engine.lineDash = state.lineDash;
engine.setLineDash(engine.lineDash);
}
else engine[key] = state[key];
}, state);
engine.textAlign = state.textAlign;
engine.textBaseline = state.textBaseline;
return this;
};
P.setToDefaults = function () {
let items = this.state.defs,
state = this.state,
engine = this.engine,
isArray = Array.isArray;
Object.entries(items).forEach(([key, value]) => {
if (key === 'lineDash') {
if (!isArray(engine.lineDash)) engine.lineDash = [];
else engine.lineDash.length = 0;
if (!isArray(state.lineDash)) state.lineDash = [];
else state.lineDash.length = 0;
}
else {
engine[key] = value;
state[key] = value;
}
});
engine.textAlign = state.textAlign = 'left';
engine.textBaseline = state.textBaseline = 'top';
return this;
};
P.stylesArray = ['Gradient', 'RadialGradient', 'Pattern'];
P.setEngine = function (entity) {
let state = this.state,
entityState = entity.state,
engine, item,
changes = entityState.getChanges(entity, state),
action = this.setEngineActions,
stylesArray = this.stylesArray;
if (Object.keys(changes).length) {
engine = this.engine;
for (item in changes) {
action[item](changes[item], engine, stylesArray, entity, this);
state[item] = changes[item];
}
}
return entity;
};
P.setEngineActions = {
fillStyle: function (item, engine, stylesArray, entity, layer) {
if (item.substring) {
let brokenStyle = false;
if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];
if (brokenStyle) {
entity.state.fillStyle = brokenStyle;
engine.fillStyle = brokenStyle.getData(entity, layer);
}
else engine.fillStyle = item;
}
else engine.fillStyle = item.getData(entity, layer);
},
font: function (item, engine) {
engine.font = item;
},
globalAlpha: function (item, engine) {
engine.globalAlpha = item;
},
globalCompositeOperation: function (item, engine) {
engine.globalCompositeOperation = item;
},
lineCap: function (item, engine) {
engine.lineCap = item;
},
lineDash: function (item, engine) {
engine.lineDash = item;
if (engine.setLineDash) engine.setLineDash(item);
},
lineDashOffset: function (item, engine) {
engine.lineDashOffset = item;
},
lineJoin: function (item, engine) {
engine.lineJoin = item;
},
lineWidth: function (item, engine) {
engine.lineWidth = item;
},
miterLimit: function (item, engine) {
engine.miterLimit = item;
},
shadowBlur: function (item, engine) {
engine.shadowBlur = item;
},
shadowColor: function (item, engine) {
engine.shadowColor = item;
},
shadowOffsetX: function (item, engine) {
engine.shadowOffsetX = item;
},
shadowOffsetY: function (item, engine) {
engine.shadowOffsetY = item;
},
strokeStyle: function (item, engine, stylesArray, entity, layer) {
if (item.substring) {
let brokenStyle = false;
if (stylesnames.indexOf(item) >= 0) brokenStyle = styles[item];
else if (cellnames.indexOf(item) >= 0) brokenStyle = cell[item];
if (brokenStyle) {
entity.state.strokeStyle = brokenStyle;
engine.strokeStyle = brokenStyle.getData(entity, layer);
}
else engine.strokeStyle = item;
}
else engine.strokeStyle = item.getData(entity, layer);
},
};
P.clearShadow = function () {
this.engine.shadowOffsetX = 0.0;
this.engine.shadowOffsetY = 0.0;
this.engine.shadowBlur = 0.0;
this.state.shadowOffsetX = 0.0;
this.state.shadowOffsetY = 0.0;
this.state.shadowBlur = 0.0;
return this;
};
P.restoreShadow = function (entity) {
let state = entity.state;
this.engine.shadowOffsetX = state.shadowOffsetX;
this.engine.shadowOffsetY = state.shadowOffsetY;
this.engine.shadowBlur = state.shadowBlur;
this.state.shadowOffsetX = state.shadowOffsetX;
this.state.shadowOffsetY = state.shadowOffsetY;
this.state.shadowBlur = state.shadowBlur;
return this;
};
P.setToClearShape = function () {
this.engine.fillStyle = 'rgba(0,0,0,0)';
this.engine.strokeStyle = 'rgba(0,0,0,0)';
this.engine.shadowColor = 'rgba(0,0,0,0)';
this.state.fillStyle = 'rgba(0,0,0,0)';
this.state.strokeStyle = 'rgba(0,0,0,0)';
this.state.shadowColor = 'rgba(0,0,0,0)';
return this;
};
P.saveEngine = function () {
this.engine.save();
return this;
};
P.restoreEngine = function () {
this.engine.restore();
return this;
};
P.clear = function () {
let self = this;
return new Promise((resolve) => {
let engine = self.engine,
bgc = self.backgroundColor;
self.prepareStamp();
let w = self.currentDimensions[0],
h = self.currentDimensions[1];
engine.setTransform(1,0,0,1,0,0);
if (bgc) {
let tempBackground = engine.fillStyle,
tempGCO = engine.globalCompositeOperation,
tempAlpha = engine.globalAlpha;
engine.fillStyle = bgc;
engine.globalCompositeOperation = 'source-over';
engine.globalAlpha = 1;
engine.fillRect(0, 0, w, h);
engine.fillStyle = tempBackground;
engine.globalCompositeOperation = tempGCO;
engine.globalAlpha = tempAlpha;
}
else engine.clearRect(0, 0, w, h);
resolve(true);
});
};
P.compile = function(){
let mystash = this.stashOutput;
this.sortGroups();
this.prepareStamp();
if(this.dirtyFilters || !this.currentFilters) this.cleanFilters();
let self = this;
let next = (counter) => {
return new Promise((resolve, reject) => {
let grp = self.groupBuckets[counter];
if (grp && grp.stamp) {
grp.stamp()
.then(res => {
next(counter + 1)
.then(res => {
resolve(true);
})
.catch(err => reject(false));
})
.catch(err => reject(false));
}
else {
if (!self.noFilters && self.filters && self.filters.length) {
self.applyFilters()
.then(res => self.stashOutputAction())
.then(res => resolve(true))
.catch(err => reject(false));
}
else {
self.stashOutputAction()
.then(res => resolve(true))
.catch(err => reject(false));
}
}
});
};
return next(0);
};
P.show = function () {
var self = this;
return new Promise((resolve) => {
let host = self.getHost(),
engine = (host && host.engine) ? host.engine : false;
if (engine) {
let floor = Math.floor,
scale = self.currentScale,
currentDimensions = self.currentDimensions,
curWidth = floor(currentDimensions[0]),
curHeight = floor(currentDimensions[1]),
hostDimensions = host.currentDimensions,
destWidth = floor(hostDimensions[0]),
destHeight = floor(hostDimensions[1]),
composite = self.composite,
alpha = self.alpha,
controller = self.controller,
element = self.element,
paste;
engine.save();
engine.setTransform(1, 0, 0, 1, 0, 0);
if (self.isBase) {
if (!self.basePaste) self.basePaste = [];
paste = self.basePaste;
self.prepareStamp();
engine.globalCompositeOperation = 'source-over';
engine.globalAlpha = 1;
engine.clearRect(0, 0, destWidth, destHeight);
engine.globalCompositeOperation = composite;
engine.globalAlpha = alpha;
let fit = (controller) ? controller.fit : 'none',
relWidth, relHeight;
switch (fit) {
case 'contain' :
relWidth = destWidth / (curWidth || 1);
relHeight = destHeight / (curHeight || 1);
if (relWidth > relHeight) {
paste[0] = floor((destWidth - (curWidth * relHeight)) / 2);
paste[1] = 0;
paste[2] = floor(curWidth * relHeight);
paste[3] = floor(curHeight * relHeight);
}
else {
paste[0] = 0;
paste[1] = floor((destHeight - (curHeight * relWidth)) / 2);
paste[2] = floor(curWidth * relWidth);
paste[3] = floor(curHeight * relWidth);
}
break;
case 'cover' :
relWidth = destWidth / (curWidth || 1);
relHeight = destHeight / (curHeight || 1);
if (relWidth < relHeight) {
paste[0] = floor((destWidth - (curWidth * relHeight)) / 2);
paste[1] = 0;
paste[2] = floor(curWidth * relHeight);
paste[3] = floor(curHeight * relHeight);
}
else{
paste[0] = 0;
paste[1] = floor((destHeight - (curHeight * relWidth)) / 2);
paste[2] = floor(curWidth * relWidth);
paste[3] = floor(curHeight * relWidth);
}
break;
case 'fill' :
paste[0] = 0;
paste[1] = 0;
paste[2] = floor(destWidth);
paste[3] = floor(destHeight);
break;
case 'none' :
default :
paste[0] = floor((destWidth - curWidth) / 2);
paste[1] = floor((destHeight - curHeight) / 2);
paste[2] = curWidth;
paste[3] = curHeight;
}
}
else if (scale > 0) {
if (!self.paste) self.paste = [];
paste = self.paste;
self.prepareStamp();
engine.globalCompositeOperation = composite;
engine.globalAlpha = alpha;
let handle = self.currentStampHandlePosition,
stamp = self.currentStampPosition;
paste[0] = floor(-handle[0] * scale);
paste[1] = floor(-handle[1] * scale);
paste[2] = floor(curWidth * scale);
paste[3] = floor(curHeight * scale);
self.rotateDestination(engine, stamp[0], stamp[1]);
}
engine.drawImage(element, 0, 0, curWidth, curHeight, ...paste);
engine.restore();
resolve(true);
}
else resolve(false);
});
};
P.applyFilters = function () {
let self = this;
return new Promise(function(resolve){
let engine = self.engine,
oldComposite = engine.globalCompositeOperation,
oldAlpha = engine.globalAlpha,
image, worker;
image = engine.getImageData(0, 0, self.currentDimensions[0], self.currentDimensions[1]);
worker = requestFilterWorker();
actionFilterWorker(worker, {
image: image,
filters: self.currentFilters
})
.then((img) => {
releaseFilterWorker(worker);
if (img) {
engine.globalCompositeOperation = self.filterComposite || 'source-over';
engine.globalAlpha = self.filterAlpha || 1;
engine.putImageData(img, 0, 0);
engine.globalCompositeOperation = oldComposite;
engine.globalAlpha = oldAlpha;
resolve(true);
}
else resolve(false);
})
.catch((err) => {
releaseFilterWorker(worker);
resolve(false);
});
});
};
P.stashOutputAction = function () {
let self = this;
if (this.stashOutput) {
this.stashOutput = false;
return new Promise ((resolve, reject) => {
let [cellWidth, cellHeight] = self.currentDimensions,
stashCoordinates = self.stashCoordinates,
stashDimensions = self.stashDimensions,
stashX = (stashCoordinates) ? stashCoordinates[0] : 0,
stashY = (stashCoordinates) ? stashCoordinates[1] : 0,
stashWidth = (stashDimensions) ? stashDimensions[0] : cellWidth,
stashHeight = (stashDimensions) ? stashDimensions[1] : cellHeight;
if (stashWidth.substring || stashHeight.substring || stashX.substring || stashY.substring || stashX || stashY || stashWidth !== cellWidth || stashHeight !== cellHeight) {
if (stashWidth.substring) stashWidth = (parseFloat(stashWidth) / 100) * cellWidth;
if (isNaN(stashWidth) || stashWidth <= 0) stashWidth = 1;
if (stashWidth > cellWidth) stashWidth = cellWidth;
if (stashHeight.substring) stashHeight = (parseFloat(stashHeight) / 100) * cellHeight;
if (isNaN(stashHeight) || stashHeight <= 0) stashHeight = 1;
if (stashHeight > cellHeight) stashHeight = cellHeight;
if (stashX.substring) stashX = (parseFloat(stashX) / 100) * cellWidth;
if (isNaN(stashX) || stashX < 0) stashX = 0;
if (stashX + stashWidth > cellWidth) stashX = cellWidth - stashWidth;
if (stashY.substring) stashY = (parseFloat(stashY) / 100) * cellHeight;
if (isNaN(stashY) || stashY < 0) stashY = 0;
if (stashY + stashHeight > cellHeight) stashY = cellHeight - stashHeight;
}
self.engine.save();
self.engine.setTransform(1, 0, 0, 1, 0, 0);
self.stashedImageData = self.engine.getImageData(stashX, stashY, stashWidth, stashHeight);
self.engine.restore();
if (self.stashOutputAsAsset) {
self.stashOutputAsAsset = false;
let sourcecanvas, mycanvas;
mycanvas = requestCell();
sourcecanvas = mycanvas.element;
sourcecanvas.width = stashWidth;
sourcecanvas.height = stashHeight;
mycanvas.engine.putImageData(self.stashedImageData, 0, 0);
if (!self.stashedImage) {
let newimg = self.stashedImage = document.createElement('img');
newimg.id = `${self.name}-image`;
newimg.onload = function () {
scrawlCanvasHold.appendChild(newimg);
importDomImage(`#${newimg.id}`);
};
newimg.src = sourcecanvas.toDataURL();
}
else self.stashedImage.src = sourcecanvas.toDataURL();
releaseCell(mycanvas);
}
resolve(true);
});
}
else return Promise.resolve(false)
};
P.getHost = function () {
if (this.currentHost) return this.currentHost;
else if (this.host) {
let host = asset[this.host] || artefact[this.host];
if (host) this.currentHost = host;
return (host) ? this.currentHost : currentCorePosition;
}
return currentCorePosition;
};
P.updateBaseHere = function (controllerHere, fit) {
if (this.isBase) {
if (!this.here) this.here = {};
let here = this.here,
dims = this.currentDimensions;
let active = controllerHere.active;
if (dims[0] !== controllerHere.w || dims[1] !== controllerHere.h) {
if (!this.basePaste) this.basePaste = [];
let pasteX = this.basePaste[0];
let localWidth = dims[0],
localHeight = dims[1],
remoteWidth = controllerHere.w,
remoteHeight = controllerHere.h,
remoteX = controllerHere.x,
remoteY = controllerHere.y;
let relWidth = localWidth / remoteWidth || 1,
relHeight = localHeight / remoteHeight || 1,
round = Math.round,
offsetX, offsetY;
here.w = localWidth;
here.h = localHeight;
switch (fit) {
case 'contain' :
case 'cover' :
if (pasteX) {
offsetX = (remoteWidth - (localWidth / relHeight)) / 2;
here.x = round((remoteX - offsetX) * relHeight);
here.y = round(remoteY * relHeight);
}
else {
offsetY = (remoteHeight - (localHeight / relWidth)) / 2;
here.x = round(remoteX * relWidth);
here.y = round((remoteY - offsetY) * relWidth);
}
break;
case 'fill' :
here.x = round(remoteX * relWidth);
here.y = round(remoteY * relHeight);
break;
case 'none' :
default :
offsetX = (remoteWidth - localWidth) / 2;
offsetY = (remoteHeight - localHeight) / 2;
here.x = round(remoteX - offsetX);
here.y = round(remoteY - offsetY);
}
if (here.x < 0 || here.x > localWidth) active = false;
if (here.y < 0 || here.y > localHeight) active = false;
here.active = active;
}
else {
here.x = controllerHere.x;
here.y = controllerHere.y;
here.w = controllerHere.w;
here.h = controllerHere.h;
here.active = active;
}
controllerHere.baseActive = active;
}
};
P.prepareStamp = function () {
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
};
P.updateHere = function () {
let d = this.controller,
rx, ry, dHere, here,
round = Math.round;
let [w, h] = this.currentDimensions;
if (d && d.here) {
if (!this.here) this.here = {};
dHere = d.here;
here = this.here;
rx = w / dHere.w;
ry = h / dHere.h;
here.xRatio = rx;
here.x = round(dHere.x * rx);
here.yRatio = ry;
here.y = round(dHere.y * ry);
here.w = w;
here.h = h;
}
};
P.getEntityHits = function () {
let response = [],
results = [],
resultNames = [];
if (this.groupBuckets) {
this.groupBuckets.forEach(grp => {
if (grp.visibility) results.push(grp.getAllArtefactsAt(this.here));
}, this);
}
if (results.length) {
results = results.reduce((a, v) => a.concat(v), []);
results.forEach(item => {
let art = item.artefact;
if (art.visibility && resultNames.indexOf(art.name) < 0) {
resultNames.push(art.name);
response.push(art);
}
})
}
return response;
};
P.rotateDestination = function (engine, x, y, entity) {
let self = (entity) ? entity : this,
mimic = self.mimic,
reverse, upend,
rotation = self.currentRotation;
if (mimic && mimic.name && self.useMimicFlip) {
reverse = (mimic.flipReverse) ? -1 : 1;
upend = (mimic.flipUpend) ? -1 : 1;
}
else {
reverse = (self.flipReverse) ? -1 : 1;
upend = (self.flipUpend) ? -1 : 1;
}
if (rotation) {
rotation *= radian;
let cos = Math.cos(rotation),
sin = Math.sin(rotation);
engine.setTransform((cos * reverse), (sin * reverse), (-sin * upend), (cos * upend), x, y);
}
else engine.setTransform(reverse, 0, 0, upend, x, y);
return this;
};
const cellPool = [];
P.poolDefs = {
element: null,
engine: null,
state: null,
width: 300,
height: 100,
alpha: 1,
composite: 'source-over',
}
const requestCell = function () {
if (!cellPool.length) {
cellPool.push(makeCell({
name: `pool_${generateUuid()}`,
isPool: true
}));
}
return cellPool.shift();
};
const releaseCell = function (c) {
if (c && c.type === 'Cell') {
c.engine.setTransform(1,0,0,1,0,0);
cellPool.push(c.setToDefaults());
}
};
const makeCell = function (items) {
return new Cell(items);
};
constructors.Cell = Cell;
export {
makeCell,
requestCell,
releaseCell,
};
