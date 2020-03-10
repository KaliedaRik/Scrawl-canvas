import { constructors } from '../core/library.js';
import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';
const Gradient = function (items = {}) {
this.stylesInit(items);
return this;
};
let P = Gradient.prototype = Object.create(Object.prototype);
P.type = 'Gradient';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
P = stylesMix(P);
P.buildStyle = function (cell = {}) {
if (cell) {
let engine = cell.engine;
if (engine) {
let gradient = engine.createLinearGradient(...this.gradientArgs);
return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
}
}
return 'rgba(0,0,0,0)';
};
P.updateGradientArgs = function (x, y) {
let gradientArgs = this.gradientArgs,
currentStart = this.currentStart,
currentEnd = this.currentEnd;
let sx = currentStart[0] + x,
sy = currentStart[1] + y,
ex = currentEnd[0] + x,
ey = currentEnd[1] + y;
if (sx === ex && sy === ey) ex++;
gradientArgs.length = 0;
gradientArgs.push(sx, sy, ex, ey);
};
const makeGradient = function (items) {
return new Gradient(items);
};
constructors.Gradient = Gradient;
export {
makeGradient,
};
