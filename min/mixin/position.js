import { artefact, group, tween } from '../core/library.js';
import { λnull, mergeOver, isa_obj, xt, xta, xto, xtGet, addStrings, pushUnique } from '../core/utilities.js';
import { currentCorePosition } from '../core/userInteraction.js';
import { makeCoordinate } from '../factory/coordinate.js';
import { requestCell, releaseCell } from '../factory/cell.js';
export default function (P = {}) {
let defaultAttributes = {
group: null,
visibility: true,
order: 0,
start: null,
handle: null,
offset: null,
dimensions: null,
pivoted: null,
mimicked: null,
lockTo: null,
scale: 1,
roll: 0,
noUserInteraction: false,
noPositionDependencies: false,
noCanvasEngineUpdates: false,
noFilters: false,
noPathUpdates: false,
purge: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['pathObject', 'mimicked', 'pivoted']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)', 'Subscriber$']);
P.packetCoordinates = pushUnique(P.packetCoordinates, ['start', 'handle', 'offset']);
P.packetObjects = pushUnique(P.packetObjects, ['group']);
P.packetFunctions = pushUnique(P.packetFunctions, []);
P.processPacketOut = function (key, value, includes) {
let result = true;
switch (key) {
case 'lockTo' :
if (value[0] === 'start' && value[1] === 'start') {
result = (includes.indexOf('lockTo') >= 0) ? true : false;
}
break;
default :
if (this.lib === 'entity') result = this.processEntityPacketOut(key, value, includes);
else if (this.isArtefact) result = this.processDOMPacketOut(key, value, includes);
}
return result;
};
P.handlePacketAnchor = function (copy, items) {
if (this.anchor) {
let a = JSON.parse(this.anchor.saveAsPacket(items))[3];
copy.anchor = a;
}
return copy;
}
P.kill = function () {
let myname = this.name
Object.entries(group).forEach(([name, grp]) => {
if (grp.artefacts.indexOf(myname) >= 0) grp.removeArtefacts(myname);
});
if (this.anchor) this.demolishAnchor();
Object.entries(artefact).forEach(([name, art]) => {
if (art.name !== myname) {
if (art.pivot && art.pivot.name === myname) art.set({ pivot: false});
if (art.mimic && art.mimic.name === myname) art.set({ mimic: false});
if (art.path && art.path.name === myname) art.set({ path: false});
if (Array.isArray(art.pins)) {
art.pins.forEach((item, index) => {
if (isa_obj(item) && item.name === myname) art.removePinAt(index);
});
}
}
});
Object.entries(tween).forEach(([name, t]) => {
if (t.checkForTarget(myname)) t.removeFromTargets(this);
});
this.factoryKill();
this.deregister();
return this;
};
P.factoryKill = λnull;
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.startX = function () {
return this.currentStart[0];
};
G.startY = function () {
return this.currentStart[1];
};
G.start = function () {
return [].concat(this.currentStart);
};
S.startX = function (coord) {
if (coord != null) {
this.start[0] = coord;
this.dirtyStart = true;
}
};
S.startY = function (coord) {
if (coord != null) {
this.start[1] = coord;
this.dirtyStart = true;
}
};
S.start = function (x, y) {
this.setCoordinateHelper('start', x, y);
this.dirtyStart = true;
};
D.startX = function (coord) {
let c = this.start;
c[0] = addStrings(c[0], coord);
this.dirtyStart = true;
};
D.startY = function (coord) {
let c = this.start;
c[1] = addStrings(c[1], coord);
this.dirtyStart = true;
};
D.start = function (x, y) {
this.setDeltaCoordinateHelper('start', x, y);
this.dirtyStart = true;
};
G.handleX = function () {
return this.currentHandle[0];
};
G.handleY = function () {
return this.currentHandle[1];
};
G.handle = function () {
return [].concat(this.currentHandle);
};
S.handleX = function (coord) {
if (coord != null) {
this.handle[0] = coord;
this.dirtyHandle = true;
}
};
S.handleY = function (coord) {
if (coord != null) {
this.handle[1] = coord;
this.dirtyHandle = true;
}
};
S.handle = function (x, y) {
this.setCoordinateHelper('handle', x, y);
this.dirtyHandle = true;
};
D.handleX = function (coord) {
let c = this.handle;
c[0] = addStrings(c[0], coord);
this.dirtyHandle = true;
};
D.handleY = function (coord) {
let c = this.handle;
c[1] = addStrings(c[1], coord);
this.dirtyHandle = true;
};
D.handle = function (x, y) {
this.setDeltaCoordinateHelper('handle', x, y);
this.dirtyHandle = true;
};
G.offsetX = function () {
return this.currentOffset[0];
};
G.offsetY = function () {
return this.currentOffset[1];
};
G.offset = function () {
return [].concat(this.currentOffset);
};
S.offsetX = function (coord) {
if (coord != null) {
this.offset[0] = coord;
this.dirtyOffset = true;
}
};
S.offsetY = function (coord) {
if (coord != null) {
this.offset[1] = coord;
this.dirtyOffset = true;
}
};
S.offset = function (x, y) {
this.setCoordinateHelper('offset', x, y);
this.dirtyOffset = true;
};
D.offsetX = function (coord) {
let c = this.offset;
c[0] = addStrings(c[0], coord);
this.dirtyOffset = true;
};
D.offsetY = function (coord) {
let c = this.offset;
c[1] = addStrings(c[1], coord);
this.dirtyOffset = true;
};
D.offset = function (x, y) {
this.setDeltaCoordinateHelper('offset', x, y);
this.dirtyOffset = true;
};
G.width = function () {
return this.currentDimensions[0];
};
G.height = function () {
return this.currentDimensions[1];
};
G.dimensions = function () {
return [].concat(this.currentDimensions);
};
S.width = function (val) {
if (val != null) {
this.dimensions[0] = val;
this.dirtyDimensions = true;
}
};
S.height = function (val) {
if (val != null) {
this.dimensions[1] = val;
this.dirtyDimensions = true;
}
};
S.dimensions = function (w, h) {
this.setCoordinateHelper('dimensions', w, h);
this.dirtyDimensions = true;
};
D.width = function (val) {
let c = this.dimensions;
c[0] = addStrings(c[0], val);
this.dirtyDimensions = true;
};
D.height = function (val) {
let c = this.dimensions;
c[1] = addStrings(c[1], val);
this.dirtyDimensions = true;
};
D.dimensions = function (w, h) {
this.setDeltaCoordinateHelper('dimensions', w, h);
this.dirtyDimensions = true;
}
S.lockTo = function (item) {
if (Array.isArray(item)) {
this.lockTo[0] = item[0];
this.lockTo[1] = item[1];
}
else {
this.lockTo[0] = item;
this.lockTo[1] = item;
}
this.dirtyLock = true;
};
S.lockXTo = function (item) {
this.lockTo[0] = item;
this.dirtyLock = true;
};
S.lockYTo = function (item) {
this.lockTo[1] = item;
this.dirtyLock = true;
};
S.roll = function (item) {
this.roll = item;
this.dirtyRotation = true;
};
D.roll = function (item) {
this.roll += item;
this.dirtyRotation = true;
};
S.scale = function (item) {
this.scale = item;
this.dirtyScale = true;
};
D.scale = function (item) {
this.scale += item;
this.dirtyScale = true;
};
S.host = function (item) {
if (item) {
let host = artefact[item];
if (host && host.here) this.host = host.name;
else this.host = item;
}
else this.host = '';
this.dirtyDimensions = true;
this.dirtyHandle = true;
this.dirtyStart = true;
this.dirtyOffset = true;
};
S.group = function (item) {
let g;
if (item) {
if (this.group && this.group.type === 'Group') this.group.removeArtefacts(this.name);
if (item.substring) {
g = group[item];
if (g) this.group = g;
else this.group = item;
}
else this.group = item;
}
if (this.group && this.group.type === 'Group') this.group.addArtefacts(this.name);
};
P.purgeArtefact = function (item) {
const doPurge = function (art, val) {
switch (val) {
case 'pivot' :
delete art.pivot;
delete art.pivotCorner;
delete art.pivotPin;
delete art.addPivotHandle;
delete art.addPivotOffset;
delete art.addPivotRotation;
break;
case 'mimic' :
delete art.mimic;
delete art.useMimicDimensions;
delete art.useMimicScale;
delete art.useMimicStart;
delete art.useMimicHandle;
delete art.useMimicOffset;
delete art.useMimicRotation;
delete art.useMimicFlip;
delete art.addOwnDimensionsToMimic;
delete art.addOwnScaleToMimic;
delete art.addOwnStartToMimic;
delete art.addOwnHandleToMimic;
delete art.addOwnOffsetToMimic;
delete art.addOwnRotationToMimic;
break;
case 'path' :
delete art.path;
delete art.pathPosition;
delete art.addPathHandle;
delete art.addPathOffset;
delete art.addPathRotation;
delete art.constantPathSpeed;
break;
case 'filter' :
delete art.filter;
delete art.filterAlpha;
delete art.filterComposite;
delete art.isStencil;
break;
}
}
if (item.substring) {
if (item === 'all') item = ['pivot', 'mimic', 'path', 'filter'];
else item = [item];
}
if (Array.isArray(item)) item.forEach(purge => doPurge(this, purge));
return this;
};
P.initializePositions = function () {
this.dimensions = makeCoordinate();
this.start = makeCoordinate();
this.handle = makeCoordinate();
this.offset = makeCoordinate();
this.currentDimensions = makeCoordinate();
this.currentStart = makeCoordinate();
this.currentHandle = makeCoordinate();
this.currentOffset = makeCoordinate();
this.currentDragOffset = makeCoordinate();
this.currentDragCache = makeCoordinate();
this.currentStartCache = makeCoordinate();
this.currentStampPosition = makeCoordinate();
this.currentStampHandlePosition = makeCoordinate();
this.delta = {};
this.lockTo = ['start', 'start'];
this.pivoted = [];
this.mimicked = [];
this.dirtyScale = true;
this.dirtyDimensions = true;
this.dirtyLock = true;
this.dirtyStart = true;
this.dirtyOffset = true;
this.dirtyHandle = true;
this.dirtyRotation = true;
this.isBeingDragged = false;
this.initializeDomPositions();
};
P.initializeDomPositions = λnull;
P.setCoordinateHelper = function (label, x, y) {
let c = this[label];
if (Array.isArray(x)) {
c[0] = x[0];
c[1] = x[1];
}
else if (isa_obj(x)) {
if (xto(x.x, x.y)) {
c[0] = xtGet(x.x, c[0]);
c[1] = xtGet(x.y, c[1]);
}
else {
c[0] = xtGet(x.width, x.w, c[0]);
c[1] = xtGet(x.height, x.h, c[1]);
}
}
else {
c[0] = x;
c[1] = y;
}
};
P.setDeltaCoordinateHelper = function (label, x, y) {
let c = this[label],
myX = c[0],
myY = c[1];
if (Array.isArray(x)) {
c[0] = addStrings(myX, x[0]);
c[1] = addStrings(myY, x[1]);
}
else if (isa_obj(x)) {
if (xto(x.x, x.y)) {
c[0] = addStrings(myX, xtGet(x.x, 0));
c[1] = addStrings(myY, xtGet(x.y, 0));
}
else {
c[0] = addStrings(myX, xtGet(x.width, x.w, 0));
c[1] = addStrings(myY, xtGet(x.height, x.h, 0));
}
}
else {
c[0] = addStrings(myX, x);
c[1] = addStrings(myY, y);
}
};
P.getHost = function () {
if (this.currentHost) return this.currentHost;
else if (this.host) {
let host = artefact[this.host];
if (host) {
this.currentHost = host;
this.dirtyHost = true;
return this.currentHost;
}
}
return currentCorePosition;
};
P.getHere = function () {
let host = this.getHost();
if (host) {
if (host.here) return host.here;
else if (host.currentDimensions) {
let dims = host.currentDimensions;
if (dims) {
return {
w: dims[0],
h: dims[1]
}
}
}
}
return currentCorePosition;
};
P.cleanPosition = function (current, source, dimensions) {
let val, dim;
for (let i = 0; i < 2; i++) {
val = source[i];
dim = dimensions[i];
if (val.toFixed) current[i] = val;
else if (val === 'left' || val === 'top') current[i] = 0;
else if (val === 'right' || val === 'bottom') current[i] = dim;
else if (val === 'center') current[i] = dim / 2;
else current[i] = (parseFloat(val) / 100) * dim;
}
};
P.cleanScale = function () {
this.dirtyScale = false;
let scale,
myscale = this.scale,
mimic = this.mimic,
oldScale = this.currentScale;
if(mimic && this.useMimicScale) {
if (mimic.currentScale) {
scale = mimic.currentScale;
if (this.addOwnScaleToMimic) scale += myscale;
}
else {
scale = myscale;
this.dirtyMimicScale = true;
}
}
else scale = myscale;
this.currentScale = scale;
this.dirtyDimensions = true;
this.dirtyHandle = true;
if (oldScale !== this.currentScale) this.dirtyPositionSubscribers = true;
if (this.mimicked && this.mimicked.length) this.dirtyMimicScale = true;
};
P.cleanDimensions = function () {
this.dirtyDimensions = false;
let host = this.getHost(),
dims = this.dimensions,
curDims = this.currentDimensions;
if (host) {
let hostDims = (host.currentDimensions) ? host.currentDimensions : [host.w, host.h];
let [w, h] = dims,
oldW = curDims[0],
oldH = curDims[1];
if (w.substring) w = (parseFloat(w) / 100) * hostDims[0];
if (h.substring) {
if (h === 'auto') h = 0;
else h = (parseFloat(h) / 100) * hostDims[1];
}
let mimic = this.mimic,
mimicDims;
if (mimic && mimic.name && this.useMimicDimensions) mimicDims = mimic.currentDimensions;
if (mimicDims) {
curDims[0] = (this.addOwnDimensionsToMimic) ? mimicDims[0] + w : mimicDims[0];
curDims[1] = (this.addOwnDimensionsToMimic) ? mimicDims[1] + h : mimicDims[1];
}
else {
curDims[0] = w;
curDims[1] = h;
}
this.cleanDimensionsAdditionalActions();
this.dirtyStart = true;
this.dirtyHandle = true;
this.dirtyOffset = true;
if (oldW !== curDims[0] || oldH !== curDims[1]) this.dirtyPositionSubscribers = true;
if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;
}
else this.dirtyDimensions = true;
};
P.cleanDimensionsAdditionalActions = λnull;
P.cleanLock = function () {
this.dirtyLock = false;
this.dirtyStart = true;
this.dirtyHandle = true;
};
P.cleanStart = function () {
this.dirtyStart = false;
let here = this.getHere();
if (xt(here)) {
if (xta(here.w, here.h)) {
this.cleanPosition(this.currentStart, this.start, [here.w, here.h]);
this.dirtyStampPositions = true;
}
else this.dirtyStart = true;
}
else this.dirtyStart = true;
};
P.cleanOffset = function () {
this.dirtyOffset = false;
let here = this.getHere();
if (xt(here)) {
if (xta(here.w, here.h)) {
this.cleanPosition(this.currentOffset, this.offset, [here.w, here.h]);
this.dirtyStampPositions = true;
if (this.mimicked && this.mimicked.length) this.dirtyMimicOffset = true;
}
else this.dirtyOffset = true;
}
else this.dirtyOffset = true;
};
P.cleanHandle = function () {
this.dirtyHandle = false;
let current = this.currentHandle;
this.cleanPosition(current, this.handle, this.currentDimensions);
this.dirtyStampHandlePositions = true;
if (this.mimicked && this.mimicked.length) this.dirtyMimicHandle = true;
};
P.cleanRotation = function () {
this.dirtyRotation = false;
let roll,
myroll = this.roll,
oldRoll = this.currentRotation,
path = this.path,
mimic = this.mimic,
pivot = this.pivot,
lock = this.lockTo;
if (path && lock.indexOf('path') >= 0) {
roll = myroll;
if (this.addPathRotation) {
let pathData = this.getPathData();
if (pathData) roll += pathData.angle;
}
}
else if (mimic && this.useMimicRotation && lock.indexOf('mimic') >= 0) {
if (xt(mimic.currentRotation)) {
roll = mimic.currentRotation;
if (this.addOwnRotationToMimic) roll += myroll;
}
else this.dirtyMimicRotation = true;
}
else {
roll = myroll;
if (pivot && this.addPivotRotation && lock.indexOf('pivot') >= 0) {
if (xt(pivot.currentRotation)) roll += pivot.currentRotation;
else this.dirtyPivotRotation = true;
}
}
this.currentRotation = roll;
if (roll !== oldRoll) this.dirtyPositionSubscribers = true;
if (this.mimicked && this.mimicked.length) this.dirtyMimicRotation = true;
};
P.cleanStampPositions = function () {
this.dirtyStampPositions = false;
let stamp = this.currentStampPosition,
start = this.currentStart,
oldX = stamp[0],
oldY = stamp[1];
if (this.noPositionDependencies) {
stamp[0] = start[0];
stamp[1] = start[1];
}
else {
let lockArray = this.lockTo,
localLockArray = [],
lock, i, coord, here, pathData,
hereFlag = false,
offset = this.currentOffset,
isBeingDragged = this.isBeingDragged,
drag = this.currentDragOffset,
cache = this.currentStartCache,
pivot = this.pivot,
path = this.path,
mimic = this.mimic;
if (isBeingDragged) {
localLockArray = ['mouse', 'mouse'];
hereFlag = true;
if (this.getCornerCoordinate) this.cleanPathObject();
}
else {
for (i = 0; i < 2; i++) {
lock = lockArray[i];
if (lock === 'pivot' && !pivot) lock = 'start';
else if (lock === 'path' && !path) lock = 'start';
else if (lock === 'mimic' && !mimic) lock = 'start';
if (lock === 'mouse') hereFlag = true;
localLockArray[i] = lock;
}
}
if (hereFlag) here = this.getHere();
for (i = 0; i < 2; i++) {
lock = localLockArray[i];
switch (lock) {
case 'pivot' :
if (this.pivotCorner && pivot.getCornerCoordinate) {
coord = pivot.getCornerCoordinate(this.pivotCorner, (i) ? 'y' : 'x');
}
else if (pivot.type === 'Polyline') {
coord = pivot.getPinAt(this.pivotPin, (i) ? 'y' : 'x');
}
else coord = pivot.currentStampPosition[i];
if (!this.addPivotOffset) coord -= pivot.currentOffset[i];
coord += offset[i];
break;
case 'path' :
pathData = this.getPathData();
if (pathData) {
coord = (i) ? pathData.y : pathData.x;
if (!this.addPathOffset) coord -= path.currentOffset[i];
}
else coord = start[i] + offset[i];
break;
case 'mimic' :
if (this.useMimicStart || this.useMimicOffset) {
coord = mimic.currentStampPosition[i];
if (this.useMimicStart && this.addOwnStartToMimic) coord += start[i];
if (this.useMimicOffset && this.addOwnOffsetToMimic) coord += offset[i];
if (!this.useMimicStart) coord = coord - mimic.currentStart[i] + start[i];
if (!this.useMimicOffset) coord = coord - mimic.currentOffset[i] + offset[i];
}
else coord = start[i] + offset[i];
break;
case 'mouse' :
coord = (i === 0) ? here.x : here.y;
if (isBeingDragged) {
cache[i] = coord;
coord += drag[i];
}
coord += offset[i];
break;
default :
coord = start[i] + offset[i];
}
stamp[i] = coord;
}
}
if (oldX !== stamp[0] || oldY !== stamp[1]) this.dirtyPositionSubscribers = true;
};
P.cleanStampHandlePositions = function () {
this.dirtyStampHandlePositions = false;
let stampHandle = this.currentStampHandlePosition,
handle = this.currentHandle,
oldX = stampHandle[0],
oldY = stampHandle[1];
if (this.noPositionDependencies) {
stampHandle[0] = handle[0];
stampHandle[1] = handle[1];
}
else {
let lockArray = this.lockTo,
lock, i, coord, here, myscale,
pivot = this.pivot,
path = this.path,
mimic = this.mimic;
for (i = 0; i < 2; i++) {
lock = lockArray[i];
if (lock === 'pivot' && !pivot) lock = 'start';
if (lock === 'path' && !path) lock = 'start';
if (lock === 'mimic' && !mimic) lock = 'start';
coord = handle[i];
switch (lock) {
case 'pivot' :
if (this.addPivotHandle) coord += pivot.currentHandle[i];
break;
case 'path' :
if (this.addPathHandle) coord += path.currentHandle[i];
break;
case 'mimic' :
if (this.useMimicHandle) {
coord = mimic.currentHandle[i];
if (this.addOwnHandleToMimic) coord += handle[i];
}
break;
}
stampHandle[i] = coord;
}
}
this.cleanStampHandlePositionsAdditionalActions();
if (oldX !== stampHandle[0] || oldY !== stampHandle[1]) this.dirtyPositionSubscribers = true;
};
P.cleanStampHandlePositionsAdditionalActions = λnull;
P.checkHit = function (items = [], mycell) {
if (this.noUserInteraction) return false;
if (!this.pathObject || this.dirtyPathObject) {
this.cleanPathObject();
}
let tests = (!Array.isArray(items)) ?  [items] : items,
poolCellFlag = false;
if (!mycell) {
mycell = requestCell();
poolCellFlag = true;
}
let engine = mycell.engine,
stamp = this.currentStampPosition,
x = stamp[0],
y = stamp[1],
tx, ty;
if (tests.some(test => {
if (Array.isArray(test)) {
tx = test[0];
ty = test[1];
}
else if (xta(test, test.x, test.y)) {
tx = test.x;
ty = test.y;
}
else return false;
if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;
mycell.rotateDestination(engine, x, y, this);
return engine.isPointInPath(this.pathObject, tx, ty, this.winding);
}, this)) {
let r = this.checkHitReturn(tx, ty, mycell);
if (poolCellFlag) releaseCell(mycell);
return r;
}
if (poolCellFlag) releaseCell(mycell);
return false;
};
P.checkHitReturn = function (x, y, cell) {
return {
x: x,
y: y,
artefact: this
};
};
P.pickupArtefact = function (items = {}) {
let {x, y} = items;
if (xta(x, y)) {
this.isBeingDragged = true;
this.currentDragCache.set(this.currentDragOffset);
if (this.lockTo[0] === 'start') {
this.currentDragOffset[0] = this.currentStart[0] - x;
}
else if (this.lockTo[0] === 'pivot' && this.pivot) {
this.currentDragOffset[0] = this.pivot.get('startX') - x;
}
else if (this.lockTo[0] === 'mimic' && this.mimic) {
this.currentDragOffset[0] = this.mimic.get('startX') - x;
}
if (this.lockTo[1] === 'start') {
this.currentDragOffset[1] = this.currentStart[1] - y;
}
else if (this.lockTo[1] === 'pivot' && this.pivot) {
this.currentDragOffset[1] = this.pivot.get('startY') - y;
}
else if (this.lockTo[1] === 'mimic' && this.mimic) {
this.currentDragOffset[1] = this.mimic.get('startY') - y;
}
this.order += 9999;
this.group.batchResort = true;
if (xt(this.dirtyPathObject)) this.dirtyPathObject = true;
}
return this;
};
P.dropArtefact = function () {
this.start.set(this.currentStartCache).add(this.currentDragOffset);
this.dirtyStart = true;
this.currentDragOffset.set(this.currentDragCache);
this.order = (this.order >= 9999) ? this.order - 9999 : 0;
this.group.batchResort = true;
if (xt(this.dirtyPathObject)) this.dirtyPathObject = true;
this.isBeingDragged = false;
return this;
};
P.updatePositionSubscribers = function () {
this.dirtyPositionSubscribers = false;
if (this.pivoted && this.pivoted.length) this.updatePivotSubscribers();
if (this.mimicked && this.mimicked.length) this.updateMimicSubscribers();
if (this.pathed && this.pathed.length) this.updatePathSubscribers();
};
P.updatePivotSubscribers = λnull;
P.updateMimicSubscribers = λnull;
P.updatePathSubscribers = λnull;
P.updateImageSubscribers = λnull;
return P;
};
