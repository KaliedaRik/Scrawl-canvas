import { constructors, artefact } from '../core/library.js';
import { mergeOver, addStrings, pushUnique } from '../core/utilities.js';
import { makeCoordinate } from './coordinate.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
import curveMix from '../mixin/shapeCurve.js';
const Quadratic = function (items = {}) {
this.control = makeCoordinate();
this.currentControl = makeCoordinate();
this.controlLockTo = 'coord';
this.curveInit(items);
this.shapeInit(items);
this.dirtyControl = true;
return this;
};
let P = Quadratic.prototype = Object.create(Object.prototype);
P.type = 'Quadratic';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
P = curveMix(P);
let defaultAttributes = {
control: null,
controlPivot: '',
controlPivotCorner: '',
addControlPivotHandle: false,
addControlPivotOffset: false,
controlPath: '',
controlPathPosition: 0,
addControlPathHandle: false,
addControlPathOffset: true,
controlLockTo: '',
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, []);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, ['control']);
P.packetObjects = pushUnique(P.packetObjects, ['controlPivot', 'controlPath']);
P.packetFunctions = pushUnique(P.packetFunctions, []);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.controlPivot = function (item) {
this.setControlHelper(item, 'controlPivot', 'control');
this.updateDirty();
this.dirtyControl = true;
};
S.controlPath = function (item) {
this.setControlHelper(item, 'controlPath', 'control');
this.updateDirty();
this.dirtyControl = true;
this.currentControlPathData = false;
};
S.controlPathPosition = function (item) {
this.controlPathPosition = item;
this.dirtyControl = true;
this.currentControlPathData = false;
};
D.controlPathPosition = function (item) {
this.controlPathPosition += item;
this.dirtyControl = true;
this.currentControlPathData = false;
};
S.controlX = function (coord) {
if (coord != null) {
this.control[0] = coord;
this.updateDirty();
this.dirtyControl = true;
this.currentControlPathData = false;
}
};
S.controlY = function (coord) {
if (coord != null) {
this.control[1] = coord;
this.updateDirty();
this.dirtyControl = true;
this.currentControlPathData = false;
}
};
S.control = function (x, y) {
this.setCoordinateHelper('control', x, y);
this.updateDirty();
this.dirtyControl = true;
this.currentControlPathData = false;
};
D.controlX = function (coord) {
let c = this.control;
c[0] = addStrings(c[0], coord);
this.updateDirty();
this.dirtyControl = true;
this.currentControlPathData = false;
};
D.controlY = function (coord) {
let c = this.control;
c[1] = addStrings(c[1], coord);
this.updateDirty();
this.dirtyControl = true;
this.currentControlPathData = false;
};
D.control = function (x, y) {
this.setDeltaCoordinateHelper('control', x, y);
this.updateDirty();
this.dirtyControl = true;
this.currentControlPathData = false;
};
S.controlLockTo = function (item) {
this.controlLockTo = item;
this.updateDirty();
this.dirtyControlLock = true;
this.currentControlPathData = false;
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makeQuadraticPath();
this.pathDefinition = p;
};
P.makeQuadraticPath = function () {
let [startX, startY] = this.currentStampPosition;
let [controlX, controlY] = this.currentControl;
let [endX, endY] = this.currentEnd;
let cx = (controlX - startX).toFixed(2),
cy = (controlY - startY).toFixed(2),
ex = (endX - startX).toFixed(2),
ey = (endY - startY).toFixed(2);
return `m0,0q${cx},${cy} ${ex},${ey}`;
};
P.cleanDimensions = function () {
this.dirtyDimensions = false;
this.dirtyHandle = true;
this.dirtyOffset = true;
this.dirtyStart = true;
this.dirtyControl = true;
this.dirtyEnd = true;
};
P.preparePinsForStamp = function () {
let ePivot = this.endPivot,
ePath = this.endPath,
cPivot = this.controlPivot,
cPath = this.controlPath;
this.dirtyPins.forEach(name => {
if ((cPivot && cPivot.name === name) || (cPath && cPath.name === name)) {
this.dirtyControl = true;
if (this.controlLockTo.includes('path')) this.currentControlPathData = false;
}
if ((ePivot && ePivot.name === name) || (ePath && ePath.name === name)) {
this.dirtyEnd = true;
if (this.endLockTo.includes('path')) this.currentEndPathData = false;
}
});
this.dirtyPins.length = 0;
};
const makeQuadratic = function (items = {}) {
items.species = 'quadratic';
return new Quadratic(items);
};
constructors.Quadratic = Quadratic;
export {
makeQuadratic,
};
