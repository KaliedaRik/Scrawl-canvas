import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import shapeMix from '../mixin/shapeBasic.js';
import filterMix from '../mixin/filter.js';
const Tetragon = function (items = {}) {
this.shapeInit(items);
return this;
};
let P = Tetragon.prototype = Object.create(Object.prototype);
P.type = 'Tetragon';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = shapeMix(P);
P = filterMix(P);
let defaultAttributes = {
radiusX: 5,
radiusY: 5,
intersectX: 0.5,
intersectY: 0.5,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let S = P.setters,
D = P.deltaSetters;
S.radius = function (item) {
this.setRectHelper(item, ['radiusX', 'radiusY']);
};
S.radiusX = function (item) {
this.setRectHelper(item, ['radiusX']);
};
S.radiusY = function (item) {
this.setRectHelper(item, ['radiusY']);
};
D.radius = function (item) {
this.deltaRectHelper(item, ['radiusX', 'radiusY']);
};
D.radiusX = function (item) {
this.deltaRectHelper(item, ['radiusX']);
};
D.radiusY = function (item) {
this.deltaRectHelper(item, ['radiusY']);
};
S.intersectA = function (item) {
this.intersectA = item;
this.updateDirty();
};
S.intersectB = function (item) {
this.intersectB = item;
this.updateDirty();
};
D.intersectA = function (item) {
if (item.toFixed) {
this.intersectA += item;
this.updateDirty();
}
};
D.intersectB = function (item) {
if (item.toFixed) {
this.intersectB += item;
this.updateDirty();
}
};
P.setRectHelper = function (item, corners) {
this.updateDirty();
corners.forEach(corner => {
this[corner] = item;
}, this);
};
P.deltaRectHelper = function (item, corners) {
this.updateDirty();
corners.forEach(corner => {
this[corner] = addStrings(this[corner], item);
}, this);
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makeTetragonPath();
this.pathDefinition = p;
};
P.makeTetragonPath = function () {
let radiusX = this.radiusX,
radiusY = this.radiusY,
width, height;
if (radiusX.substring || radiusY.substring) {
let here = this.getHere(),
rx = (radiusX.substring) ? (parseFloat(radiusX) / 100) * here.w : radiusX,
ry = (radiusY.substring) ? (parseFloat(radiusY) / 100) * here.h : radiusY;
width = rx * 2;
height = ry * 2;
}
else {
width = radiusX * 2;
height = radiusY * 2;
}
let port = parseFloat((width * this.intersectX).toFixed(2)),
starboard = parseFloat((width - port).toFixed(2)),
fore = parseFloat((height * this.intersectY).toFixed(2)),
aft = parseFloat((height - fore).toFixed(2));
let myData = 'm0,0';
myData += `l${starboard},${fore} ${-starboard},${aft} ${-port},${-aft} ${port},${-fore}z`;
return myData;
};
P.calculateLocalPathAdditionalActions = function () {
let [x, y, w, h] = this.localBox;
this.pathDefinition = this.pathDefinition.replace('m0,0', `m${-x},${-y}`);
this.pathCalculatedOnce = false;
this.calculateLocalPath(this.pathDefinition, true);
};
const makeTetragon = function (items = {}) {
items.species = 'tetragon';
return new Tetragon(items);
};
constructors.Tetragon = Tetragon;
export {
makeTetragon,
};
