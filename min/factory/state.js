import { constructors, entity, styles } from '../core/library.js';
import { isa_obj, xt, xtGet } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
const State = function (items = {}) {
this.set(this.defs);
this.lineDash = [];
this.set(items);
return this;
};
let P = State.prototype = Object.create(Object.prototype);
P.type = 'State';
P = baseMix(P);
P.defs = {
fillStyle: 'rgba(0,0,0,1)',
strokeStyle: 'rgba(0,0,0,1)',
globalAlpha: 1,
globalCompositeOperation: 'source-over',
lineWidth: 1,
lineCap: 'butt',
lineJoin: 'miter',
lineDash: null,
lineDashOffset: 0,
miterLimit: 10,
shadowOffsetX: 0,
shadowOffsetY: 0,
shadowBlur: 0,
shadowColor: 'rgba(0,0,0,0)',
font: '12px sans-serif',
textAlign: 'left',
textBaseline: 'top',
};
P.processPacketOut = function (key, value, includes) {
let result = true;
switch (key) {
case 'lineDash' :
if (!value.length) {
result = (includes.indexOf('lineDash') >= 0) ? true : false;
}
break;
default :
if (includes.indexOf(key) < 0 && value === this.defs[key]) result = false;
}
return result;
};
P.finalizePacketOut = function (copy, items) {
let fill = copy.fillStyle,
stroke = copy.strokeStyle;
if (fill && !fill.substring) copy.fillStyle = fill.name;
if (stroke && !stroke.substring) copy.strokeStyle = stroke.name;
return copy;
};
P.set = function (items) {
let key, i, iz,
keys = Object.keys(items),
d = this.defs;
for (i = 0, iz = keys.length; i < iz; i++) {
key = keys[i];
if (key !== 'name') {
if (typeof d[key] !== 'undefined') this[key] = items[key];
}
}
return this;
};
P.get = function (item) {
let undef, d, i;
d = this.defs[item];
if (typeof d !== 'undefined') {
i = this[item];
return (typeof i !== 'undefined') ? i : d;
}
else return undef;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.fillStyle = function (item) {
let temp;
if (isa_obj(item) && item.lib === 'styles') this.fillStyle = item;
else{
temp = styles[item];
if (temp) this.fillStyle = temp;
else this.fillStyle = item;
}
};
S.strokeStyle = function (item) {
let temp;
if (isa_obj(item) && item.lib === 'styles') this.strokeStyle = item;
else{
temp = styles[item];
if (temp) this.strokeStyle = temp;
else this.strokeStyle = item;
}
};
P.allKeys = Object.keys(P.defs);
P.mainKeys = ['globalAlpha', 'globalCompositeOperation', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'];
P.lineKeys = ['lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'lineDashOffset', 'miterLimit'];
P.styleKeys = ['fillStyle', 'strokeStyle', 'shadowColor'];
P.textKeys = ['font'];
P.getChanges = function (ent, engineState) {
let mainKeys = this.mainKeys,
lineKeys = this.lineKeys,
styleKeys = this.styleKeys,
textKeys = this.textKeys,
k, style, scaled, i, iz, j, jz,
linedashFlag, desired, current,
defs = this.defs,
result = {};
let getItem = function (source, key) {
return (typeof source[key] != 'undefined') ? source[key] : defs[key];
};
if (ent.substring) ent = entity[ent];
for (i = 0, iz = mainKeys.length; i < iz; i++) {
k = mainKeys[i];
desired = getItem(this, k);
current = getItem(engineState, k);
if (current !== desired) result[k] = desired;
}
if (this.lineWidth || engineState.lineWidth) {
for (i = 0, iz = lineKeys.length; i < iz; i++) {
k = lineKeys[i];
desired = getItem(this, k);
current = getItem(engineState, k);
if (k == 'lineDash') {
if (desired.length || current.length) {
if (desired.length != current.length) result.lineDash = desired;
else {
linedashFlag = false;
for (j = 0, jz = desired.length; j < jz; j++) {
if (desired[j] != current[j]) {
linedashFlag = true;
break;
}
}
if (linedashFlag) result.lineDash = desired;
}
}
}
else if (k == 'lineWidth') {
if (ent.scaleOutline) {
scaled = (desired || 1) * (ent.scale || 1);
if (scaled !== current) result.lineWidth = scaled;
}
else {
if (desired !== current) result.lineWidth = desired;
}
}
else if (current !== desired) result[k] = desired
}
}
for (i = 0, iz = styleKeys.length; i < iz; i++) {
k = styleKeys[i];
current = getItem(engineState, k);
desired = getItem(this, k);
if (desired.substring && current !== desired) result[k] = desired;
else if (desired.type === 'Color') {
desired = desired.getData();
if (current !== desired) result[k] = desired;
}
else result[k] = desired;
}
if (ent.type === 'Phrase') {
for (i = 0, iz = textKeys.length; i < iz; i++) {
k = textKeys[i];
desired = getItem(this, k);
current = getItem(engineState, k);
if (current !== desired) result[k] = desired
}
}
return result;
};
P.setStateFromEngine = function (engine) {
let keys = this.allKeys,
key;
for (let i = 0, iz = keys.length; i < iz; i++) {
key = keys[i];
this[key] = engine[key];
}
this.lineDash = (xt(engine.lineDash)) ? engine.lineDash : [];
this.lineDashOffset = xtGet(engine.lineDashOffset, 0);
engine.textAlign = this.textAlign = 'left';
engine.textBaseline = this.textBaseline = 'top';
return this;
};
const makeState = function (items) {
return new State(items);
};
constructors.State = State;
export {
makeState,
};
