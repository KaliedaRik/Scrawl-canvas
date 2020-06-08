import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
const Spiral = function (items = {}) {
this.shapeInit(items);
return this;
};
let P = Spiral.prototype = Object.create(Object.prototype);
P.type = 'Spiral';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
let defaultAttributes = {
loops: 1,
loopIncrement: 1,
drawFromLoop: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let S = P.setters,
D = P.deltaSetters;
S.loops = function (item) {
this.loops = item;
this.updateDirty();
};
D.loops = function (item) {
this.loops += item;
this.updateDirty();
};
S.loopIncrement = function (item) {
this.loopIncrement = item;
this.updateDirty();
};
D.loopIncrement = function (item) {
this.loopIncrement += item;
this.updateDirty();
};
S.drawFromLoop = function (item) {
this.drawFromLoop = Math.floor(item);
this.updateDirty();
};
D.drawFromLoop = function (item) {
this.drawFromLoop = Math.floor(this.drawFromLoop + item);
this.updateDirty();
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makeSpiralPath();
this.pathDefinition = p;
};
P.firstTurn = [
[0.043, 0, 0.082, -0.035, 0.088, -0.088],
[0.007, -0.057, -0.024, -0.121, -0.088, -0.162],
[-0.07, -0.045, -0.169, -0.054, -0.265, -0.015],
[-0.106, 0.043, -0.194, 0.138, -0.235, 0.265],
[-0.044, 0.139, -0.026, 0.3, 0.058, 0.442],
[0.091, 0.153, 0.25, 0.267, 0.442, 0.308],
[0.206, 0.044, 0.431, -0.001, 0.619, -0.131],
[0.2, -0.139, 0.34, -0.361, 0.381, -0.619]
];
P.subsequentTurns = [
[0, -0.27, -0.11, -0.52, -0.29, -0.71],
[-0.19, -0.19, -0.44, -0.29, -0.71, -0.29],
[-0.27, 0, -0.52, 0.11, -0.71, 0.29],
[-0.19, 0.19, -0.29, 0.44, -0.29, 0.71],
[0, 0.27, 0.11, 0.52, 0.29, 0.71],
[0.19, 0.19, 0.44, 0.29, 0.71, 0.29],
[0.27, 0, 0.52, -0.11, 0.71, -0.29],
[0.19, -0.19, 0.29, -0.44, 0.29, -0.71]
];
P.makeSpiralPath = function () {
let loops = Math.floor(this.loops),
loopIncrement = this.loopIncrement,
drawFromLoop = Math.floor(this.drawFromLoop),
x1, y1, x2, y2, x3, y3,
sx1, sy1, sx2, sy2, sx3, sy3,
firstTurn = this.firstTurn,
subsequentTurns = this.subsequentTurns,
currentTurn = [];
for (let i = 0; i < firstTurn.length; i++) {
[x1, y1, x2, y2, x3, y3] = firstTurn[i];
currentTurn.push([x1 * loopIncrement, y1 * loopIncrement, x2 * loopIncrement, y2 * loopIncrement, x3 * loopIncrement, y3 * loopIncrement]);
}
let path = 'm0,0';
for (let j = 0; j < loops; j++) {
for (let i = 0; i < currentTurn.length; i++) {
[x1, y1, x2, y2, x3, y3] = currentTurn[i];
if (j >= drawFromLoop) path += `c${x1},${y1} ${x2},${y2} ${x3},${y3}`;
[sx1, sy1, sx2, sy2, sx3, sy3] = subsequentTurns[i];
currentTurn[i] = [x1 + (sx1 * loopIncrement), y1 + (sy1 * loopIncrement), x2 + (sx2 * loopIncrement), y2 + (sy2 * loopIncrement), x3 + (sx3 * loopIncrement), y3 + (sy3 * loopIncrement)];
}
}
return path;
};
P.calculateLocalPathAdditionalActions = function () {
let [x, y, w, h] = this.localBox,
scale = this.scale;
this.pathDefinition = this.pathDefinition.replace('m0,0', `m${-x / scale},${-y / scale}`);
this.pathCalculatedOnce = false;
this.calculateLocalPath(this.pathDefinition, true);
};
const makeSpiral = function (items = {}) {
items.species = 'spiral';
return new Spiral(items);
};
constructors.Spiral = Spiral;
export {
makeSpiral,
};
