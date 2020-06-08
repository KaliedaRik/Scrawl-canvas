import { artefact } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, isa_boolean } from '../core/utilities.js';
export default function (P = {}) {
let defaultAttributes = {
path: '',
pathPosition: 0,
addPathHandle: false,
addPathOffset: true,
addPathRotation: false,
constantPathSpeed: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
mergeOver(P, defaultAttributes);
P.packetObjects = pushUnique(P.packetObjects, ['path']);
let S = P.setters,
D = P.deltaSetters;
S.path = function (item) {
if (isa_boolean(item) && !item) {
this.path = null;
if (this.lockTo[0] === 'path') this.lockTo[0] = 'start';
if (this.lockTo[1] === 'path') this.lockTo[1] = 'start';
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
else {
let oldPath = this.path,
newPath = (item.substring) ? artefact[item] : item,
name = this.name;
if (newPath && newPath.name && newPath.useAsPath) {
if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);
pushUnique(newPath.pathed, name);
this.path = newPath;
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
}
};
S.pathPosition = function (item) {
if (item < 0) item = Math.abs(item);
if (item > 1) item = item % 1;
this.pathPosition = parseFloat(item.toFixed(6));
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
this.currentPathData = false;
};
D.pathPosition = function (item) {
let pos = this.pathPosition + item
if (pos < 0) pos += 1;
if (pos > 1) pos = pos % 1;
this.pathPosition = parseFloat(pos.toFixed(6));
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
this.currentPathData = false;
};
S.addPathHandle = function (item) {
this.addPathHandle = item;
this.dirtyHandle = true;
};
S.addPathOffset = function (item) {
this.addPathOffset = item;
this.dirtyOffset = true;
};
S.addPathRotation = function (item) {
this.addPathRotation = item;
this.dirtyRotation = true;
};
P.getPathData = function () {
if (this.currentPathData) return this.currentPathData;
let pathPos = this.pathPosition,
path = this.path,
currentPathData;
if (path) {
currentPathData = path.getPathPositionData(pathPos, this.constantPathSpeed);
if (this.addPathRotation) this.dirtyRotation = true;
this.currentPathData = currentPathData;
return currentPathData;
}
return false;
};
return P;
};
