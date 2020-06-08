import { constructors, artefact } from '../core/library.js';
import { mergeOver, isa_obj, isa_boolean, pushUnique, xt, xta, removeItem } from '../core/utilities.js';
import { makeCoordinate } from '../factory/coordinate.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
const Polyline = function (items = {}) {
this.pins = [];
this.currentPins = [];
this.controlledLineOffset = makeCoordinate();
this.shapeInit(items);
return this;
};
let P = Polyline.prototype = Object.create(Object.prototype);
P.type = 'Polyline';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
let defaultAttributes = {
pins: null,
tension: 0,
closed: false,
mapToPins: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['controlledLineOffset']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, []);
P.packetFunctions = pushUnique(P.packetFunctions, []);
P.finalizePacketOut = function (copy, items) {
let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
copy = mergeOver(copy, stateCopy);
copy = this.handlePacketAnchor(copy, items);
Object.keys(copy).forEach(key => {
if (key === 'pins') {
let temp = [];
copy.pins.forEach(pin => {
if (isa_obj(pin)) temp.push(pin.name);
else if (Array.isArray(pin)) temp.push([].concat(pin));
else temp.push(pin);
});
copy.pins = temp;
}
});
return copy;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.pins = function (item) {
if (xt(item)) return this.getPinAt(item);
return this.currentPins.concat();
};
S.pins = function (item) {
if (xt(item)) {
let pins = this.pins;
if (Array.isArray(item)) {
pins.forEach((item, index) => this.removePinAt(index));
pins.length = 0;
pins.push(...item);
this.updateDirty();
}
else if (isa_obj(item) && xt(item.index)) {
let element = pins[item.index];
if (Array.isArray(element)) {
if (xt(item.x)) element[0] = item.x;
if (xt(item.y)) element[1] = item.y;
this.updateDirty();
}
}
}
};
D.pins = function (item) {
if (xt(item)) {
let pins = this.pins;
if (isa_obj(item) && xt(item.index)) {
let element = pins[item.index];
if (Array.isArray(element)) {
if (xt(item.x)) element[0] = addStrings(element[0], item.x);
if (xt(item.y)) element[1] = addStrings(element[1], item.y);
this.updateDirty();
}
}
}
};
S.tension = function (item) {
if (item.toFixed) {
this.tension = item;
this.updateDirty();
}
};
D.tension = function (item) {
if (item.toFixed) {
this.tension += item;
this.updateDirty();
}
};
S.closed = function (item) {
this.closed = item;
this.updateDirty();
};
S.mapToPins = function (item) {
this.mapToPins = item;
this.updateDirty();
};
S.flipUpend = function (item) {
this.flipUpend = item;
this.updateDirty();
};
S.flipReverse = function (item) {
this.flipReverse = item;
this.updateDirty();
};
S.useAsPath = function (item) {
this.useAsPath = item;
this.updateDirty();
};
S.pivot = function (item) {
if (isa_boolean(item) && !item) {
this.pivot = null;
if (this.lockTo[0] === 'pivot') this.lockTo[0] = 'start';
if (this.lockTo[1] === 'pivot') this.lockTo[1] = 'start';
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
else {
let oldPivot = this.pivot,
newPivot = (item.substring) ? artefact[item] : item,
name = this.name;
if (newPivot && newPivot.name) {
if (oldPivot && oldPivot.name !== newPivot.name) removeItem(oldPivot.pivoted, name);
pushUnique(newPivot.pivoted, name);
this.pivot = newPivot;
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
}
this.updateDirty();
};
P.updateDirty = function () {
this.dirtySpecies = true;
this.dirtyPathObject = true;
this.dirtyPins = true;
};
P.getPinAt = function (index, coord) {
let i = Math.floor(index);
if (this.useAsPath) {
let pos = this.getPathPositionData(this.unitPartials[i]);
if (coord) {
if (coord === 'x') return pos.x;
if (coord === 'y') return pos.y;
}
return [pos.x, pos.y];
}
else {
let pins = this.currentPins,
pin = pins[i];
let [x, y, w, h] = this.localBox;
let [px, py] = pin;
let [ox, oy] = pins[0];
let [lx, ly] = this.localOffset;
let [sx, sy] = this.currentStampPosition;
let dx, dy;
if (this.mapToPins) {
dx = px - ox + x;
dy = py - ox + y;
}
else {
dx = px - lx;
dy = py - ly;
}
if (coord) {
if (coord === 'x') return sx + dx;
if (coord === 'y') return sy + dy;
}
return [sx + dx, sy + dy];
}
return (coord) ? 0 : [0, 0];
};
P.updatePinAt = function (item, index) {
if (xta(item, index)) {
index = Math.floor(index);
let pins = this.pins;
if (index < pins.length && index >= 0) {
let oldPin = pins[index];
if (isa_obj(oldPin) && oldPin.pivoted) removeItem(oldPin.pivoted, this.name);
pins[index] = item;
this.updateDirty();
}
}
};
P.removePinAt = function (index) {
index = Math.floor(index);
let pins = this.pins;
if (index < pins.length && index >= 0) {
let oldPin = pins[index];
if (isa_obj(oldPin) && oldPin.pivoted) removeItem(oldPin.pivoted, this.name);
pins[index] = null;
this.updateDirty();
}
};
P.prepareStamp = function() {
if (this.dirtyHost) this.dirtyHost = false;
if (this.dirtyPins || this.dirtyLock) this.dirtySpecies = true;
if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyHandle) {
this.dirtyPathObject = true;
if (this.dirtyScale || this.dirtySpecies)  this.pathCalculatedOnce = false;
}
if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) this.dirtyStampPositions = true;
if (this.dirtyScale) this.cleanScale();
if (this.dirtyStart) this.cleanStart();
if (this.dirtyOffset) this.cleanOffset();
if (this.dirtyRotation) this.cleanRotation();
if (this.dirtyStampPositions) this.cleanStampPositions();
if (this.dirtySpecies) this.cleanSpecies();
if (this.dirtyPathObject) {
this.cleanPathObject();
this.updatePathSubscribers();
}
if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makePolylinePath();
this.pathDefinition = p;
};
P.getPathParts = function (x0, y0, x1, y1, x2, y2, t) {
let squareroot = Math.sqrt,
power = Math.pow;
let d01 = squareroot(power(x1 - x0,2) + power(y1 - y0, 2)),
d12 = squareroot(power(x2 - x1,2) + power(y2 - y1, 2)),
fa = t * d01 / (d01 + d12),
fb = t * d12 / (d01 + d12),
p1x = x1 - fa * (x2 - x0),
p1y = y1 - fa * (y2 - y0),
p2x = x1 + fb * (x2 - x0),
p2y = y1 + fb * (y2 - y0);
return [p1x, p1y, x1, y1, p2x, p2y];
};
P.buildLine = function (x, y, coords) {
let p = `m0,0l`;
for (let i = 2; i < coords.length; i += 6) {
p += `${coords[i] - x},${coords[i + 1] - y} `;
x = coords[i];
y = coords[i + 1];
}
return p;
};
P.buildCurve = function (x, y, coords) {
let p = `m0,0c`,
counter = 0;
for (let i = 0; i < coords.length; i += 2) {
p += `${coords[i] - x},${coords[i + 1] - y} `;
counter++;
if (counter > 2) {
x = coords[i];
y = coords[i + 1];
counter = 0;
}
}
return p;
};
P.cleanCoordinate = function (coord, dim) {
if (coord.toFixed) return coord;
if (coord === 'left' || coord === 'top') return 0;
if (coord === 'right' || coord === 'bottom') return dim;
if (coord === 'center') return dim / 2;
return (parseFloat(coord) / 100) * dim;
};
P.cleanPinsArray = function () {
this.dirtyPins = false;
let pins = this.pins,
current = this.currentPins;
current.length = 0;
let w = 1,
h = 1,
here = this.getHere(),
clean = this.cleanCoordinate,
x, y;
if (xta(here, here.w, here.h)) {
w = here.w;
h = here.h;
}
pins.forEach((item, index) => {
let temp;
if (item && item.substring) {
temp = artefact[item];
pins[index] = temp;
}
else temp = item;
if (temp) {
if (Array.isArray(temp)) {
[x, y] = temp;
current.push([clean(x, w), clean(y, h)]);
}
else if (isa_obj(temp) && temp.currentStart) {
let name = this.name;
if (temp.pivoted.indexOf(name) < 0) pushUnique(temp.pivoted, name);
current.push([...temp.currentStampPosition]);
}
}
});
let mx = current[0][0],
my = current[0][1];
current.forEach(e => {
if (e[0] < mx) mx = e[0];
if (e[1] < my) my = e[1];
})
this.localOffset = [mx, my];
this.updatePivotSubscribers();
}
P.makePolylinePath = function () {
let getPathParts = this.getPathParts,
buildLine = this.buildLine,
buildCurve = this.buildCurve,
pins = this.pins,
cPin = this.currentPins,
tension = this.tension,
closed = this.closed;
if (this.dirtyPins) this.cleanPinsArray();
let cLen = cPin.length,
first = cPin[0],
last = cPin[cLen - 1],
calc = [],
result = 'm0,0';
if (closed) {
let startPoint = [].concat(...getPathParts(...last, ...first, ...cPin[1], tension));
for (let i = 0; i < cLen - 2; i++) {
calc = calc.concat(...getPathParts(...cPin[i], ...cPin[i + 1], ...cPin[i + 2], tension));
}
calc = calc.concat(...getPathParts(...cPin[cLen - 2], ...last, ...first, tension));
calc.unshift(startPoint[4], startPoint[5]);
calc.push(startPoint[0], startPoint[1], startPoint[2], startPoint[3]);
if (tension) result = buildCurve(first[0], first[1], calc) + 'z';
else result = buildLine(first[0], first[1], calc) + 'z';
}
else {
calc.push(first[0], first[1]);
for (let i = 0; i < cLen - 2; i++) {
calc = calc.concat(...getPathParts(...cPin[i], ...cPin[i + 1], ...cPin[i + 2], tension));
}
calc.push(last[0], last[1], last[0], last[1]);
if (tension) result = buildCurve(first[0], first[1], calc);
else result = buildLine(first[0], first[1], calc);
}
return result;
};
P.calculateLocalPathAdditionalActions = function () {
let [x, y, w, h] = this.localBox,
def = this.pathDefinition;
if (this.mapToPins) {
this.set({
start: this.currentPins[0],
});
}
else this.pathDefinition = def.replace('m0,0', `m${-x},${-y}`);
this.pathCalculatedOnce = false;
this.calculateLocalPath(this.pathDefinition, true);
};
P.updatePathSubscribers = function () {
this.pathed.forEach(name => {
let instance = artefact[name];
if (instance) instance.dirtyStart = true;
});
};
const makePolyline = function (items = {}) {
items.species = 'polyline';
return new Polyline(items);
};
constructors.Polyline = Polyline;
export {
makePolyline,
};
