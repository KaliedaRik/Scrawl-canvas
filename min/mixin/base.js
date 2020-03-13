import * as library from '../core/library.js';
import { mergeOver, pushUnique, removeItem, generateUuid,
isa_fn, isa_boolean, isa_vector, isa_obj, addStrings, xt, xta,
defaultNonReturnFunction } from '../core/utilities.js';
export default function (P = {}) {
P.defs = {};
P.getters = {};
P.setters = {};
P.deltaSetters = {};
let defaultAttributes = {
name: '',
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.get = function (item) {
if (xt(item)) {
let getter = this.getters[item];
if (getter) return getter.call(this);
else {
let def = this.defs[item];
if (typeof def != 'undefined') {
let val = this[item];
return (typeof val != 'undefined') ? val : def;
}
}
}
return null;
};
P.set = function (items = {}) {
if (items) {
let setters = this.setters,
defs = this.defs;
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key];
if (predefined) predefined.call(this, value);
else if (typeof defs[key] !== 'undefined') this[key] = value;
}
}, this);
}
return this;
};
P.setDelta = function (items = {}) {
if (items) {
let setters = this.deltaSetters,
defs = this.defs;
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key];
if (predefined) predefined.call(this, value);
else if (typeof defs[key] != 'undefined') this[key] = addStrings(this[key], value);
}
}, this);
}
return this;
};
P.clone = function (items = {}) {
let myName = this.name,
myPacket, myTicker;
this.name = items.name || '';
if (items.useNewTicker) {
myTicker = this.ticker;
this.ticker = null;
myPacket = this.saveAsPacket();
this.ticker = myTicker;
}
else myPacket = this.saveAsPacket();
this.name = myName;
let clone = this.actionPacket(myPacket);
this.packetFunctions.forEach(func => {
if (this[func]) clone[func] = this[func];
});
clone = this.postCloneAction(clone, items);
clone.set(items);
return clone;
};
P.postCloneAction = function (clone, items) {
return clone;
};
P.packetExclusions = [];
P.packetExclusionsByRegex = [];
P.packetCoordinates = [];
P.packetObjects = [];
P.packetFunctions = [];
P.saveAsPacket = function (items = {}) {
if (isa_boolean(items) && items) items = {
includeDefaults: true,
}
let defs = this.defs,
defKeys = Object.keys(defs),
packetExclusions = this.packetExclusions,
packetExclusionsByRegex = this.packetExclusionsByRegex,
packetCoordinates = this.packetCoordinates,
packetObjects = this.packetObjects,
packetFunctions = this.packetFunctions,
packetDefaultInclusions = items.includeDefaults || false,
copy = {};
if (packetDefaultInclusions && !Array.isArray(packetDefaultInclusions)) {
packetDefaultInclusions = Object.keys(defs);
}
else if (!packetDefaultInclusions) packetDefaultInclusions = [];
Object.entries(this).forEach(([key, val]) => {
let flag = true,
test;
if (defKeys.indexOf(key) < 0) flag = false;
if (flag && packetExclusions.indexOf(key) >= 0) flag = false;
if (flag) {
test = packetExclusionsByRegex.some(reg => new RegExp(reg).test(key));
if (test) flag = false;
}
if (flag) {
if (packetFunctions.indexOf(key) >= 0) {
if (xt(val) && val !== null) {
let func = this.stringifyFunction(val);
if (func && func.length) copy[key] = func;
}
}
else if (packetObjects.indexOf(key) >= 0 && this[key].name) copy[key] = this[key].name;
else if (packetCoordinates.indexOf(key) >= 0) {
if (packetDefaultInclusions.indexOf(key) >= 0) copy[key] = val;
else if (val[0] || val[1]) copy[key] = val;
}
else {
test = this.processPacketOut(key, val, packetDefaultInclusions);
if (test) copy[key] = val;
}
}
}, this);
copy = this.finalizePacketOut(copy, items);
return JSON.stringify([this.name, this.type, this.lib, copy]);
};
P.stringifyFunction = function (val) {
let matches = val.toString().match(/\((.*?)\).*?\{(.*)\}/s);
let vars = matches[1];
let func = matches[2];
return (xta(vars, func)) ? `${vars}~~~${func}` : false;
};
P.processPacketOut = function (key, value, includes) {
let result = true;
if (includes.indexOf(key) < 0 && value === this.defs[key]) result = false;
return result;
};
P.finalizePacketOut = function (copy, items) {
return copy;
};
P.importPacket = function (items) {
let self = this;
const getPacket = function(url) {
return new Promise((resolve, reject) => {
let report;
if (!url.substring) reject(new Error('Packet url supplied for import is not a string'));
if (url[0] === '[') {
report = self.actionPacket(url);
if (report && report.lib) resolve(report);
else reject(report);
}
else if (url.indexOf('"name":') >= 0) {
reject(new Error('Bad packet supplied for import'));
}
else {
fetch(url)
.then(res => {
if (!res.ok) throw new Error(`Packet import from server failed - ${res.status}: ${res.statusText} - ${res.url}`);
return res.text();
})
.then(packet => {
report = self.actionPacket(packet);
if (report && report.lib) resolve(report);
else throw report;
})
.catch(error => reject(error));
}
});
};
if (Array.isArray(items)) {
let promises = [];
items.forEach(item => promises.push(getPacket(item)));
return new Promise((resolve, reject) => {
Promise.all(promises)
.then(res => resolve(res))
.catch(error => reject(error));
});
}
else if (items.substring) return getPacket(items);
else Promise.reject(new Error('Argument supplied for packet import is not a string or array of strings'));
};
P.actionPacketExclusions = ['Image', 'Sprite', 'Video', 'Canvas', 'Stack'];
P.actionPacket = function (packet) {
try {
if (packet && packet.substring) {
if (packet[0] === '[') {
let name, type, lib, update;
try {
[name, type, lib, update] = JSON.parse(packet);
}
catch (e) {
throw new Error(`Failed to process packet due to JSON parsing error - ${e.message}`);
}
if (xta(name, type, lib, update)) {
if (this.actionPacketExclusions.indexOf(type) >= 0) {
throw new Error(`Failed to process packet - Stacks, Canvases and visual assets are excluded from the packet system`);
}
let obj = library[lib][name];
if (obj) obj.set(update);
else {
if (update.outerHTML && update.host) {
let myParent = document.querySelector(`#${update.host}`);
if (myParent) {
let tempEl = document.createElement('div');
tempEl.innerHTML = update.outerHTML;
let myEl = tempEl.firstElementChild;
if (myEl) {
myEl.id = name;
myParent.appendChild(myEl);
update.domElement = myEl;
}
}
}
obj = new library.constructors[type](update);
if (!obj) throw new Error('Failed to create Scrawl-canvas object from supplied packet');
}
obj.packetFunctions.forEach(item => this.actionPacketFunctions(obj, item));
if (update.anchor && obj.anchor) {
obj.anchor.packetFunctions.forEach(item => {
obj.anchor[item] = update.anchor[item];
this.actionPacketFunctions(obj.anchor, item)
obj.anchor.build();
});
}
if (update.glyphStyles && obj.glyphStyles) {
update.glyphStyles.forEach((gStyle, index) => {
if (isa_obj(gStyle)) obj.setGlyphStyles(gStyle, index);
});
}
if (obj) return obj;
else throw new Error('Failed to process supplied packet');
}
else throw new Error('Failed to process packet - JSON string holds incomplete data');
}
else throw new Error('Failed to process packet - JSON string does not represent an array');
}
else throw new Error('Failed to process packet - not a JSON string');
}
catch (e) { console.log(e); return e }
};
P.actionPacketFunctions = function(obj, item) {
let fItem = obj[item];
if (xt(fItem) && fItem !== null && fItem.substring) {
if (fItem === '~~~') obj[item] = defaultNonReturnFunction;
else {
let args, func, f;
[args, func] = fItem.split('~~~');
args = args.split(',');
args = args.map(a => a.trim());
if (func.indexOf('[native code]') < 0) {
f = new Function(...args, func);
obj[item] = f.bind(obj);
}
else obj[item] = defaultNonReturnFunction;
}
}
};
P.makeName = function (item) {
if (item && item.substring && library[`${this.lib}names`].indexOf(item) < 0) this.name = item;
else this.name = generateUuid();
return this;
};
P.register = function () {
if (!xt(this.name)) throw new Error(`core/base error - register() name not set: ${this}`);
let arr = library[`${this.lib}names`],
mylib = library[this.lib];
if(this.isArtefact){
pushUnique(library.artefactnames, this.name);
library.artefact[this.name] = this;
}
if(this.isAsset){
pushUnique(library.assetnames, this.name);
library.asset[this.name] = this;
}
pushUnique(arr, this.name);
mylib[this.name] = this;
return this;
};
P.deregister = function () {
if (!xt(this.name)) throw new Error(`core/base error - deregister() name not set: ${this}`);
let arr = library[`${this.lib}names`],
mylib = library[this.lib];
if(this.isArtefact){
removeItem(library.artefactnames, this.name);
delete library.artefact[this.name];
}
if(this.isAsset){
removeItem(library.assetnames, this.name);
delete library.asset[this.name];
}
removeItem(arr, this.name);
delete mylib[this.name];
return this;
};
P.kill = function () {
return this.deregister();
}
return P;
};
