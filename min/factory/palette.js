import { constructors } from '../core/library.js';
import { defaultNonReturnFunction, isa_obj, mergeOver, xt, xta, pushUnique } from '../core/utilities.js';
import { makeColor } from './color.js';
import baseMix from '../mixin/base.js';
const Palette = function (items = {}) {
this.makeName(items.name);
this.register();
this.set(this.defs);
this.colors = items.colors || {'0 ': [0,0,0,1], '999 ': [255,255,255,1]};
this.stops = Array(1000);
this.set(items);
this.dirtyPalette = true;
return this;
};
let P = Palette.prototype = Object.create(Object.prototype);
P.type = 'Palette';
P.lib = 'palette';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
let defaultAttributes = {
colors: null,
stops: null,
cyclic: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['stops']);
let G = P.getters,
S = P.setters;
S.colors = function (item) {
if (isa_obj(item)) {
this.colors = item;
this.dirtyPalette = true;
}
};
S.stops = defaultNonReturnFunction;
P.set = function (items = {}) {
let keys = Object.keys(items),
i, iz, key;
for (i = 0, iz = keys.length; i < iz; i++) {
key = keys[i];
this[key] = items[key];
}
};
P.recalculateHold = [];
P.recalculate = function () {
let keys, i, iz, j, jz, cursor, diff,
current, next, nextKey, temp,
r, g, b, a,
colors = this.colors,
stops = this.stops,
make = this.makeColorString,
hold = this.recalculateHold;
keys = Object.keys(colors);
keys = keys.map(n => parseInt(n, 10))
keys.sort((a, b) => a - b);
stops.fill('rgba(0,0,0,0)');
this.dirtyPalette = false;
for (i = 0, iz = keys.length - 1; i < iz; i++) {
cursor = keys[i];
nextKey = keys[i + 1];
diff = nextKey - cursor;
current = colors[cursor + ' '];
next = colors[nextKey + ' '];
r = (next[0] - current[0]) / diff;
g = (next[1] - current[1]) / diff;
b = (next[2] - current[2]) / diff;
a = (next[3] - current[3]) / diff;
for (j = 0, jz = diff; j < jz; j++) {
hold[0] = current[0] + (r * j);
hold[1] = current[1] + (g * j);
hold[2] = current[2] + (b * j);
hold[3] = current[3] + (a * j);
stops[cursor] = make(hold);
cursor++;
}
}
stops[cursor] = make(next);
if (this.cyclic) {
cursor = keys[keys.length - 1];
nextKey = keys[0];
diff = (nextKey + 1000) - cursor;
current = colors[cursor + ' '];
next = colors[nextKey + ' '];
r = (next[0] - current[0]) / diff;
g = (next[1] - current[1]) / diff;
b = (next[2] - current[2]) / diff;
a = (next[3] - current[3]) / diff;
for (j = 0, jz = diff; j < jz; j++) {
hold[0] = current[0] + (r * j);
hold[1] = current[1] + (g * j);
hold[2] = current[2] + (b * j);
hold[3] = current[3] + (a * j);
stops[cursor] = make(hold);
cursor++;
if (cursor > 999) cursor -= 1000;
}
}
else {
cursor = keys[0];
if (cursor > 0) {
temp = stops[cursor];
for (i = 0, iz = cursor; i < iz; i++) {
stops[i] = temp;
}
}
cursor = keys[keys.length - 1];
if (cursor < 999) {
temp = stops[cursor];
for (i = cursor, iz = 1000; i < iz; i++) {
stops[i] = temp;
}
}
}
};
P.makeColorString = function (item) {
let f = Math.floor,
r, g, b, a;
let constrainer = (n, min, max) => {
n = (n < min) ? min : n;
n = (n > max) ? max : n;
return n;
};
r = constrainer(f(item[0]), 0, 255),
g = constrainer(f(item[1]), 0, 255),
b = constrainer(f(item[2]), 0, 255),
a = constrainer(item[3], 0, 1);
return `rgba(${r},${g},${b},${a})`;
};
P.updateColor = function (index, color) {
let f = this.factory;
if (xta(index, color)) {
index = (index.substring) ? parseInt(index, 10) : Math.floor(index);
if (index >= 0 && index <= 999) {
f.convert(color);
index += ' ';
this.colors[index] = [f.r, f.g, f.b, f.a];
this.dirtyPalette = true;
}
}
};
P.removeColor = function (index) {
if (xt(index)) {
index = (index.substring) ? parseInt(index, 10) : Math.floor(index);
if (index >= 0 && index <= 999) {
index += ' ';
delete this.colors[index];
this.dirtyPalette = true;
}
}
};
P.addStopsToGradient = function (gradient, start, end, cycle) {
let stops = this.stops,
keys = Object.keys(this.colors),
spread, offset, i, iz, item, n;
if (gradient) {
keys = keys.map(n => parseInt(n, 10))
keys.sort((a, b) => a - b);
if (!xta(start, end)) {
start = 0;
end = 999;
}
if (start === end) return stops[start] || 'rgba(0,0,0,0)';
else if (start < end) {
gradient.addColorStop(0, stops[start]);
gradient.addColorStop(1, stops[end]);
spread = end - start;
for (i = 0, iz = keys.length; i < iz; i++) {
item = keys[i];
if (item > start && item < end) {
offset = (item - start) / spread;
if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
}
}
}
else {
if (cycle) {
gradient.addColorStop(0, stops[start]);
gradient.addColorStop(1, stops[end]);
n = 999 - start;
spread = n + end;
for (i = 0, iz = keys.length; i < iz; i++) {
item = keys[i];
if (item > start) offset = (item - start) / spread;
else if (item < end) offset = (item + n) / spread;
else continue;
if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
}
}
else {
gradient.addColorStop(0, stops[start]);
gradient.addColorStop(1, stops[end]);
spread = start - end;
for (i = 0, iz = keys.length; i < iz; i++) {
item = keys[i];
if (item < start && item > end) {
offset = 1 - ((item - end) / spread);
if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
}
}
}
}
return gradient;
}
else return 'rgba(0,0,0,0)';
};
P.factory = makeColor({
opaque: false
});
const makePalette = function (items) {
return new Palette(items);
};
constructors.Palette = Palette;
export {
makePalette,
};
