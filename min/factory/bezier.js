import { constructors, artefact } from '../core/library.js';
import { mergeOver, addStrings, pushUnique } from '../core/utilities.js';
import { makeCoordinate } from './coordinate.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
import curveMix from '../mixin/shapeCurve.js';
const Bezier = function (items = {}) {
this.startControl = makeCoordinate();
this.endControl = makeCoordinate();
this.currentStartControl = makeCoordinate();
this.currentEndControl = makeCoordinate();
this.startControlLockTo = 'coord';
this.endControlLockTo = 'coord';
this.curveInit(items);
this.shapeInit(items);
this.dirtyStartControl = true;
this.dirtyEndControl = true;
return this;
};
let P = Bezier.prototype = Object.create(Object.prototype);
P.type = 'Bezier';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
P = curveMix(P);
let defaultAttributes = {
startControl: null,
startControlPivot: '',
startControlPivotCorner: '',
addStartControlPivotHandle: false,
addStartControlPivotOffset: false,
startControlPath: '',
startControlPathPosition: 0,
addStartControlPathHandle: false,
addStartControlPathOffset: true,
endControl: null,
endControlPivot: '',
endControlPivotCorner: '',
addEndControlPivotHandle: false,
addEndControlPivotOffset: false,
endControlPath: '',
endControlPathPosition: 0,
addEndControlPathHandle: false,
addEndControlPathOffset: true,
startControlLockTo: '',
endControlLockTo: '',
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, []);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, ['startControl', 'endControl']);
P.packetObjects = pushUnique(P.packetObjects, ['startControlPivot', 'startControlPath', 'endControlPivot', 'endControlPath']);
P.packetFunctions = pushUnique(P.packetFunctions, []);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.endControlPivot = function (item) {
this.setControlHelper(item, 'endControlPivot', 'endControl');
this.updateDirty();
this.dirtyEndControl = true;
};
S.endControlPath = function (item) {
this.setControlHelper(item, 'endControlPath', 'endControl');
this.updateDirty();
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
};
S.endControlPathPosition = function (item) {
this.endControlPathPosition = item;
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
};
D.endControlPathPosition = function (item) {
this.endControlPathPosition += item;
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
};
S.startControlPivot = function (item) {
this.setControlHelper(item, 'startControlPivot', 'startControl');
this.updateDirty();
this.dirtyStartControl = true;
};
S.startControlPath = function (item) {
this.setControlHelper(item, 'startControlPath', 'startControl');
this.updateDirty();
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
};
S.startControlPathPosition = function (item) {
this.startControlPathPosition = item;
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
};
D.startControlPathPosition = function (item) {
this.startControlPathPosition += item;
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
};
S.startControlX = function (coord) {
if (coord != null) {
this.startControl[0] = coord;
this.updateDirty();
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
}
};
S.startControlY = function (coord) {
if (coord != null) {
this.startControl[1] = coord;
this.updateDirty();
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
}
};
S.startControl = function (x, y) {
this.setCoordinateHelper('startControl', x, y);
this.updateDirty();
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
};
D.startControlX = function (coord) {
let c = this.startControl;
c[0] = addStrings(c[0], coord);
this.updateDirty();
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
};
D.startControlY = function (coord) {
let c = this.startControl;
c[1] = addStrings(c[1], coord);
this.updateDirty();
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
};
D.startControl = function (x, y) {
this.setDeltaCoordinateHelper('startControl', x, y);
this.updateDirty();
this.dirtyStartControl = true;
this.currentStartControlPathData = false;
};
S.endControlX = function (coord) {
if (coord != null) {
this.endControl[0] = coord;
this.updateDirty();
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
}
};
S.endControlY = function (coord) {
if (coord != null) {
this.endControl[1] = coord;
this.updateDirty();
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
}
};
S.endControl = function (x, y) {
this.setCoordinateHelper('endControl', x, y);
this.updateDirty();
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
};
D.endControlX = function (coord) {
let c = this.endControl;
c[0] = addStrings(c[0], coord);
this.updateDirty();
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
};
D.endControlY = function (coord) {
let c = this.endControl;
c[1] = addStrings(c[1], coord);
this.updateDirty();
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
};
D.endControl = function (x, y) {
this.setDeltaCoordinateHelper('endControl', x, y);
this.updateDirty();
this.dirtyEndControl = true;
this.currentEndControlPathData = false;
};
S.startControlLockTo = function (item) {
this.startControlLockTo = item;
this.updateDirty();
this.dirtyStartControlLock = true;
};
S.endControlLockTo = function (item) {
this.endControlLockTo = item;
this.updateDirty();
this.dirtyEndControlLock = true;
this.currentEndControlPathData = false;
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makeBezierPath();
this.pathDefinition = p;
};
P.makeBezierPath = function () {
let [startX, startY] = this.currentStampPosition;
let [startControlX, startControlY] = this.currentStartControl;
let [endControlX, endControlY] = this.currentEndControl;
let [endX, endY] = this.currentEnd;
let scx = (startControlX - startX).toFixed(2),
scy = (startControlY - startY).toFixed(2),
ecx = (endControlX - startX).toFixed(2),
ecy = (endControlY - startY).toFixed(2),
ex = (endX - startX).toFixed(2),
ey = (endY - startY).toFixed(2);
return `m0,0c${scx},${scy} ${ecx},${ecy} ${ex},${ey}`;
};
P.cleanDimensions = function () {
this.dirtyDimensions = false;
this.dirtyHandle = true;
this.dirtyOffset = true;
this.dirtyStart = true;
this.dirtyStartControl = true;
this.dirtyEndControl = true;
this.dirtyEnd = true;
};
P.preparePinsForStamp = function () {
let ePivot = this.endPivot,
ePath = this.endPath,
scPivot = this.startControlPivot,
scPath = this.startControlPath,
ecPivot = this.endControlPivot,
ecPath = this.endControlPath;
this.dirtyPins.forEach(name => {
if ((scPivot && scPivot.name === name) || (scPath && scPath.name === name)) {
this.dirtyStartControl = true;
if (this.startControlLockTo.includes('path')) this.currentStartControlPathData = false;
}
if ((ecPivot && ecPivot.name === name) || (ecPath && ecPath.name === name)) {
this.dirtyEndControl = true;
if (this.endControlLockTo.includes('path')) this.currentEndControlPathData = false;
}
if ((ePivot && ePivot.name === name) || (ePath && ePath.name === name)) {
this.dirtyEnd = true;
if (this.endLockTo.includes('path')) this.currentEndPathData = false;
}
});
this.dirtyPins.length = 0;
};
const makeBezier = function (items = {}) {
items.species = 'bezier';
return new Bezier(items);
};
constructors.Bezier = Bezier;
export {
makeBezier,
};
