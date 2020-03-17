import { entity, asset, palette } from '../core/library.js';
import { addStrings, defaultNonReturnFunction, mergeOver, xt, isa_obj, mergeDiscard } from '../core/utilities.js';
import { makeCoordinate } from '../factory/coordinate.js';
import { makePalette } from '../factory/palette.js';
export default function (P = {}) {
let defaultAttributes = {
start: null,
end: null,
palette: null,
paletteStart: 0,
paletteEnd: 999,
cyclePalette: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.finalizePacketOut = function (copy, items) {
if (items.colors) copy.colors = items.colors;
else if (this.palette && this.palette.colors) copy.colors = this.palette.colors;
else copy.colors = {'0 ': [0,0,0,1], '999 ': [255,255,255,1]};
return copy;
};
P.kill = function () {
let myname = this.name;
if (this.palette && this.palette.kill) this.palette.kill();
Object.entries(entity).forEach(([name, ent]) => {
let state = ent.state;
if (state) {
let fill = state.fillStyle,
stroke = state.strokeStyle;
if (isa_obj(fill) && fill.name === myname) state.fillStyle = state.defs.fillStyle;
if (isa_obj(stroke) && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
}
});
this.deregister();
return this;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.startX = function () {
return this.currentStart[0];
};
G.startY = function () {
return this.currentStart[1];
};
G.endX = function () {
return this.currentEnd[0];
};
G.endY = function () {
return this.currentEnd[1];
};
S.startX = function (coord) {
if (coord != null) {
this.start[0] = coord;
this.dirtyStart = true;
}
};
S.startY = function (coord) {
if (coord != null) {
this.start[1] = coord;
this.dirtyStart = true;
}
};
S.start = function (x, y) {
this.setCoordinateHelper('start', x, y);
this.dirtyStart = true;
};
D.startX = function (coord) {
let c = this.start;
c[0] = addStrings(c[0], coord);
this.dirtyStart = true;
};
D.startY = function (coord) {
let c = this.start;
c[1] = addStrings(c[1], coord);
this.dirtyStart = true;
};
D.start = function (x, y) {
this.setDeltaCoordinateHelper('start', x, y);
this.dirtyStart = true;
};
S.endX = function (coord) {
if (coord != null) {
this.end[0] = coord;
this.dirtyEnd = true;
}
};
S.endY = function (coord) {
if (coord != null) {
this.end[1] = coord;
this.dirtyEnd = true;
}
};
S.end = function (x, y) {
this.setCoordinateHelper('end', x, y);
this.dirtyEnd = true;
};
D.endX = function (coord) {
let c = this.end;
c[0] = addStrings(c[0], coord);
this.dirtyEnd = true;
};
D.endY = function (coord) {
let c = this.end;
c[1] = addStrings(c[1], coord);
this.dirtyEnd = true;
};
D.end = function (x, y) {
this.setDeltaCoordinateHelper('end', x, y);
this.dirtyEnd = true;
};
S.palette = function (item = {}) {
if(item.type === 'Palette') this.palette = item;
};
S.paletteStart = function (item) {
if (item.toFixed) {
this.paletteStart = item;
if(item < 0 || item > 999) this.paletteStart = (item > 500) ? 999 : 0;
}
};
S.paletteEnd = function (item) {
if (item.toFixed) {
this.paletteEnd = item;
if (item < 0 || item > 999) this.paletteEnd = (item > 500) ? 999 : 0;
}
};
D.paletteStart = function (item) {
let p;
if (item.toFixed) {
p = this.paletteStart + item;
if (p < 0 || p > 999) {
if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
else p = (item > 500) ? 999 : 0;
}
this.paletteStart = p;
}
};
D.paletteEnd = function (item) {
let p;
if (item.toFixed) {
p = this.paletteEnd + item;
if (p < 0 || p > 999) {
if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
else p = (item > 500) ? 999 : 0;
}
this.paletteEnd = p;
}
};
S.colors = function (item) {
let p = this.palette;
if (p && p.colors) p.set({ colors: item });
};
S.delta = function (items = {}) {
if (items) this.delta = mergeDiscard(this.delta, items);
};
P.get = function (item) {
let getter = this.getters[item];
if (getter) return getter.call(this);
else {
let def = this.defs[item],
palette = this.palette,
val;
if (typeof def !== 'undefined') {
val = this[item];
return (typeof val !== 'undefined') ? val : def;
}
def = palette.defs[item];
if (typeof def !== 'undefined') {
val = palette[item];
return (typeof val !== 'undefined') ? val : def;
}
else return undef;
}
};
P.set = function (items = {}) {
if (items) {
let setters = this.setters,
defs = this.defs,
palette = this.palette,
paletteSetters = (palette) ? palette.setters : {},
paletteDefs = (palette) ? palette.defs : {};
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key],
paletteFlag = false;
if (!predefined) {
predefined = paletteSetters[key];
paletteFlag = true;
}
if (predefined) predefined.call(paletteFlag ? this.palette : this, value);
else if (typeof defs[key] !== 'undefined') this[key] = value;
else if (typeof paletteDefs[key] !== 'undefined') palette[key] = value;
}
}, this);
}
return this;
};
P.setDelta = function (items = {}) {
if (items) {
let setters = this.deltaSetters,
defs = this.defs,
palette = this.palette,
paletteSetters = (palette) ? palette.deltaSetters : {},
paletteDefs = (palette) ? palette.defs : {};
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key],
paletteFlag = false;
if (!predefined) {
predefined = paletteSetters[key];
paletteFlag = true;
}
if (predefined) predefined.call(paletteFlag ? this.palette : this, value);
else if (typeof defs[key] != 'undefined') this[key] = addStrings(this[key], value);
else if (typeof paletteDefs[key] !== 'undefined') palette[key] = addStrings(this[key], value);
}
}, this);
}
return this;
};
P.setCoordinateHelper = function (label, x, y) {
let c = this[label];
if (Array.isArray(x)) {
c[0] = x[0];
c[1] = x[1];
}
else {
c[0] = x;
c[1] = y;
}
};
P.setDeltaCoordinateHelper = function (label, x, y) {
let c = this[label],
myX = c[0],
myY = c[1];
if (Array.isArray(x)) {
c[0] = addStrings(myX, x[0]);
c[1] = addStrings(myY, x[1]);
}
else {
c[0] = addStrings(myX, x);
c[1] = addStrings(myY, y);
}
};
P.updateByDelta = function () {
this.setDelta(this.delta);
return this;
};
P.stylesInit = function (items = {}) {
this.makeName(items.name);
this.register();
this.gradientArgs = [];
this.start = makeCoordinate();
this.end = makeCoordinate();
this.currentStart = makeCoordinate();
this.currentEnd = makeCoordinate();
this.palette = makePalette({
name: `${this.name}_palette`,
});
this.delta = {};
this.set(this.defs);
this.set(items);
};
P.getData = function (entity, cell, isFill) {
if(this.palette && this.palette.dirtyPalette) this.palette.recalculate();
this.cleanStyle(entity, cell, isFill);
this.finalizeCoordinates(entity, isFill);
return this.buildStyle(cell);
};
P.cleanStyle = function (entity = {}, cell = {}, isFill) {
let dims, w, h, scale;
if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {
dims = entity.currentDimensions;
scale = entity.currentScale;
w = dims[0] * scale;
h = dims[1] * scale;
}
else {
dims = cell.currentDimensions;
w = dims[0];
h = dims[1];
}
this.cleanPosition(this.currentStart, this.start, [w, h]);
this.cleanPosition(this.currentEnd, this.end, [w, h]);
this.cleanRadius(w);
};
P.cleanPosition = function (current, source, dimensions) {
let val, dim;
for (let i = 0; i < 2; i++) {
val = source[i];
dim = dimensions[i];
if (val.toFixed) current[i] = val;
else if (val === 'left' || val === 'top') current[i] = 0;
else if (val === 'right' || val === 'bottom') current[i] = dim;
else if (val === 'center') current[i] = dim / 2;
else current[i] = (parseFloat(val) / 100) * dim;
}
};
P.finalizeCoordinates = function (entity = {}, isFill) {
let currentStart = this.currentStart,
currentEnd = this.currentEnd,
entityStampPosition = entity.currentStampPosition,
entityStampHandlePosition = entity.currentStampHandlePosition,
entityScale = entity.currentScale,
correctX, correctY;
if (entity.lockFillStyleToEntity || entity.lockStrokeStyleToEntity) {
correctX = -(entityStampHandlePosition[0] * entityScale) || 0;
correctY = -(entityStampHandlePosition[1] * entityScale) || 0;
}
else {
correctX = -entityStampPosition[0] || 0;
correctY = -entityStampPosition[1] || 0;
}
if (entity.flipReverse) correctX = -correctX;
if (entity.flipUpend) correctY = -correctY;
this.updateGradientArgs(correctX, correctY);
};
P.cleanRadius = defaultNonReturnFunction;
P.buildStyle = function (cell) {
return 'rgba(0,0,0,0)';
};
P.addStopsToGradient = function (gradient, start, stop, cycle) {
if (this.palette) return this.palette.addStopsToGradient(gradient, start, stop, cycle);
return gradient;
};
P.updateColor = function (index, color) {
if (this.palette) this.palette.updateColor(index, color);
return this;
};
P.removeColor = function (index) {
if (this.palette) this.palette.removeColor(index);
return this;
};
return P;
};
