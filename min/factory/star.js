import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import { requestVector, releaseVector } from './vector.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
const Star = function (items = {}) {
this.shapeInit(items);
return this;
};
let P = Star.prototype = Object.create(Object.prototype);
P.type = 'Star';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
let defaultAttributes = {
radius1: 0,
radius2: 0,
points: 0,
twist: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let S = P.setters,
D = P.deltaSetters;
S.radius1 = function (item) {
this.radius1 = item;
this.updateDirty();
};
D.radius1 = function (item) {
this.radius1 += item;
this.updateDirty();
};
S.radius2 = function (item) {
this.radius2 = item;
this.updateDirty();
};
D.radius2 = function (item) {
this.radius2 += item;
this.updateDirty();
};
S.points = function (item) {
this.points = item;
this.updateDirty();
};
D.points = function (item) {
this.points += item;
this.updateDirty();
};
S.twist = function (item) {
this.twist = item;
this.updateDirty();
};
D.twist = function (item) {
this.twist += item;
this.updateDirty();
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makeStarPath();
this.pathDefinition = p;
};
P.makeStarPath = function () {
let points = this.points,
twist = this.twist,
radius1 = this.radius1,
radius2 = this.radius2,
turn = 360 / points,
xPts = [],
currentX, currentY, x, y,
myMin, myXoffset, myYoffset, i,
myPath = '';
let v1 = requestVector({x: 0, y: -radius1}),
v2 = requestVector({x: 0, y: -radius2});
currentX = v1.x;
currentY = v1.y;
xPts.push(currentX);
v2.rotate(-turn/2);
v2.rotate(twist);
for (i = 0; i < points; i++) {
v2.rotate(turn);
x = parseFloat((v2.x - currentX).toFixed(1));
currentX += x;
xPts.push(currentX);
y = parseFloat((v2.y - currentY).toFixed(1));
currentY += y;
myPath += `${x},${y} `;
v1.rotate(turn);
x = parseFloat((v1.x - currentX).toFixed(1));
currentX += x;
xPts.push(currentX);
y = parseFloat((v1.y - currentY).toFixed(1));
currentY += y;
myPath += `${x},${y} `;
}
releaseVector(v1);
releaseVector(v2);
myMin = Math.min(...xPts);
myXoffset = Math.abs(myMin).toFixed(1);
myPath = `m${myXoffset},0l${myPath}z`;
return myPath;
};
const makeStar = function (items = {}) {
items.species = 'star';
return new Star(items);
};
constructors.Star = Star;
export {
makeStar,
};
