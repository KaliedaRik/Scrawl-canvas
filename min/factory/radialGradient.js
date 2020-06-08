import { constructors } from '../core/library.js';
import { mergeOver, addStrings, isa_number, pushUnique } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';
const RadialGradient = function (items = {}) {
this.stylesInit(items);
return this;
};
let P = RadialGradient.prototype = Object.create(Object.prototype);
P.type = 'RadialGradient';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
P = stylesMix(P);
let defaultAttributes = {
startRadius: 0,
endRadius: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetObjects = pushUnique(P.packetObjects, ['palette']);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.startRadius = function (item) {
return this.currentStartRadius;
};
G.endRadius = function (item) {
return this.currentEndRadius;
};
S.startRadius = function (item) {
this.startRadius = item;
this.dirtyStyle = true;
};
S.endRadius = function (item) {
this.endRadius = item;
this.dirtyStyle = true;
};
D.startRadius = function (item) {
this.startRadius = addStrings(this.startRadius, item);
this.dirtyStyle = true;
};
D.endRadius = function (item) {
this.endRadius = addStrings(this.endRadius, item);
this.dirtyStyle = true;
};
P.cleanRadius = function (width) {
const convertLength = (val, len) => {
if (isa_number(val)) return val;
else {
switch(val){
case 'top' :
case 'left' :
return 0;
case 'bottom' :
case 'right' :
return len;
case 'center' :
return len / 2;
default :
val = parseFloat(val);
if (!isa_number(val)) return 0;
return ( val / 100) * len;
}
}
};
this.currentStartRadius = (width) ? convertLength(this.startRadius, width) : this.defs.startRadius;
this.currentEndRadius = (width) ? convertLength(this.endRadius, width) : this.defs.endRadius;
};
P.buildStyle = function (cell = {}) {
if (cell) {
let engine = cell.engine;
if (engine) {
let gradient = engine.createRadialGradient(...this.gradientArgs);
return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
}
}
return 'rgba(0,0,0,0)';
};
P.updateGradientArgs = function (x, y) {
let gradientArgs = this.gradientArgs,
currentStart = this.currentStart,
currentEnd = this.currentEnd,
sr = this.currentStartRadius,
er = this.currentEndRadius;
let sx = currentStart[0] + x,
sy = currentStart[1] + y,
ex = currentEnd[0] + x,
ey = currentEnd[1] + y;
if (sx === ex && sy === ey && sr === er) er++;
gradientArgs.length = 0;
gradientArgs.push(sx, sy, sr, ex, ey, er);
};
const makeRadialGradient = function (items) {
return new RadialGradient(items);
};
constructors.RadialGradient = RadialGradient;
export {
makeRadialGradient,
};
