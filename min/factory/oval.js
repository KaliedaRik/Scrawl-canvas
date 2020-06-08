import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
const Oval = function (items = {}) {
this.shapeInit(items);
return this;
};
let P = Oval.prototype = Object.create(Object.prototype);
P.type = 'Oval';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
let defaultAttributes = {
radiusX: 5,
radiusY: 5,
intersectX: 0.5,
intersectY: 0.5,
offshootA: 0.55,
offshootB: 0,
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
S.offshootA = function (item) {
this.offshootA = item;
this.updateDirty();
};
S.offshootB = function (item) {
this.offshootB = item;
this.updateDirty();
};
D.offshootA = function (item) {
if (item.toFixed) {
this.offshootA += item;
this.updateDirty();
}
};
D.offshootB = function (item) {
if (item.toFixed) {
this.offshootB += item;
this.updateDirty();
}
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
p = this.makeOvalPath();
this.pathDefinition = p;
};
P.makeOvalPath = function () {
let A = parseFloat(this.offshootA.toFixed(6)),
B = parseFloat(this.offshootB.toFixed(6)),
radiusX = this.radiusX,
radiusY = this.radiusY,
width, height;
if (radiusX.substring || radiusY.substring) {
let here = this.getHere();
let rx = (radiusX.substring) ? (parseFloat(radiusX) / 100) * here.w : radiusX,
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
let myData = `m0,0`;
myData += `c${starboard * A},${fore * B} ${starboard - (starboard * B)},${fore - (fore * A)}, ${starboard},${fore} `;
myData += `${-starboard * B},${aft * A} ${-starboard + (starboard * A)},${aft - (aft * B)} ${-starboard},${aft} `;
myData += `${-port * A},${-aft * B} ${-port + (port * B)},${-aft + (aft * A)} ${-port},${-aft} `;
myData += `${port * B},${-fore * A} ${port - (port * A)},${-fore + (fore * B)} ${port},${-fore}z`;
return myData;
};
P.calculateLocalPathAdditionalActions = function () {
let [x, y, w, h] = this.localBox;
this.pathDefinition = this.pathDefinition.replace('m0,0', `m${-x},${-y}`);
this.pathCalculatedOnce = false;
this.calculateLocalPath(this.pathDefinition, true);
};
const makeOval = function (items = {}) {
items.species = 'oval';
return new Oval(items);
};
constructors.Oval = Oval;
export {
makeOval,
};
