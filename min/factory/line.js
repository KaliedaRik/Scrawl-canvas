import { constructors } from '../core/library.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
import curveMix from '../mixin/shapeCurve.js';
const Line = function (items = {}) {
this.curveInit(items);
this.shapeInit(items);
return this;
};
let P = Line.prototype = Object.create(Object.prototype);
P.type = 'Line';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
P = curveMix(P);
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makeLinePath();
this.pathDefinition = p;
};
P.makeLinePath = function () {
let [startX, startY] = this.currentStampPosition;
let [endX, endY] = this.currentEnd;
let x = (endX - startX).toFixed(2),
y = (endY - startY).toFixed(2);
return `m0,0l${x},${y}`;
};
P.cleanDimensions = function () {
this.dirtyDimensions = false;
this.dirtyHandle = true;
this.dirtyOffset = true;
this.dirtyStart = true;
this.dirtyEnd = true;
};
P.preparePinsForStamp = function () {
let ePivot = this.endPivot,
ePath = this.endPath;
this.dirtyPins.forEach(name => {
if ((ePivot && ePivot.name === name) || (ePath && ePath.name === name)) {
this.dirtyEnd = true;
if (this.endLockTo.includes('path')) this.currentEndPathData = false;
}
});
this.dirtyPins.length = 0;
};
const makeLine = function (items = {}) {
items.species = 'line';
return new Line(items);
};
constructors.Line = Line;
export {
makeLine,
};
