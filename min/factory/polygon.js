import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import { requestVector, releaseVector } from './vector.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
const Polygon = function (items = {}) {
this.shapeInit(items);
return this;
};
let P = Polygon.prototype = Object.create(Object.prototype);
P.type = 'Polygon';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
let defaultAttributes = {
sides: 0,
radius: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let S = P.setters,
D = P.deltaSetters;
S.sides = function (item) {
this.sides = item;
this.updateDirty();
};
D.sides = function (item) {
this.sides += item;
this.updateDirty();
};
S.radius = function (item) {
this.radius = item;
this.updateDirty();
};
D.radius = function (item) {
this.radius += item;
this.updateDirty();
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makePolygonPath();
this.pathDefinition = p;
};
P.makePolygonPath = function () {
let radius = this.radius,
sides = this.sides,
turn = 360 / sides,
myPath = ``,
yPts = [],
currentY = 0,
myMax, myMin, myYoffset;
let v = requestVector({x: 0, y: -radius});
for (let i = 0; i < sides; i++) {
v.rotate(turn);
currentY += v.y;
yPts.push(currentY);
myPath += `${v.x.toFixed(1)},${v.y.toFixed(1)} `;
}
releaseVector(v);
myMin = Math.min(...yPts);
myMax = Math.max(...yPts);
myYoffset = (((Math.abs(myMin) + Math.abs(myMax)) - radius) / 2).toFixed(1);
myPath = `m0,${myYoffset}l${myPath}z`;
return myPath;
};
const makePolygon = function (items = {}) {
items.species = 'polygon';
return new Polygon(items);
};
constructors.Polygon = Polygon;
export {
makePolygon,
};
