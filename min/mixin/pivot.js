import { artefact } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, isa_boolean } from '../core/utilities.js';
export default function (P = {}) {
let defaultAttributes = {
pivot: '',
pivotCorner: '',
pivotPin: 0,
addPivotHandle: false,
addPivotOffset: true,
addPivotRotation: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
mergeOver(P, defaultAttributes);
P.packetObjects = pushUnique(P.packetObjects, ['pivot']);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.pivot = function (item) {
if (isa_boolean(item) && !item) {
this.pivot = null;
if (this.lockTo[0] === 'pivot') this.lockTo[0] = 'start';
if (this.lockTo[1] === 'pivot') this.lockTo[1] = 'start';
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
else {
let oldPivot = this.pivot,
newPivot = (item.substring) ? artefact[item] : item,
name = this.name;
if (newPivot && newPivot.name) {
if (oldPivot && oldPivot.name !== newPivot.name) removeItem(oldPivot.pivoted, name);
pushUnique(newPivot.pivoted, name);
this.pivot = newPivot;
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
}
};
P.pivotCorners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
S.pivotCorner = function (item) {
if (this.pivotCorners.indexOf(item) >= 0) this.pivotCorner = item;
};
S.addPivotHandle = function (item) {
this.addPivotHandle = item;
this.dirtyHandle = true;
};
S.addPivotOffset = function (item) {
this.addPivotOffset = item;
this.dirtyOffset = true;
};
S.addPivotRotation = function (item) {
this.addPivotRotation = item;
this.dirtyRotation = true;
};
P.updatePivotSubscribers = function () {
this.pivoted.forEach(name => {
let instance = artefact[name];
if (instance) {
instance.dirtyStart = true;
if (instance.addPivotHandle) instance.dirtyHandle = true;
if (instance.addPivotOffset) instance.dirtyOffset = true;
if (instance.addPivotRotation) instance.dirtyRotation = true;
if (instance.type === 'Polyline') instance.dirtyPins = true;
else if (instance.type === 'Line' || instance.type === 'Quadratic' || instance.type === 'Bezier') instance.dirtyPins.push(this.name);
}
}, this);
};
return P;
};
