import { constructors, cell, group, entity } from '../core/library.js';
import { mergeOver, removeItem } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
const Filter = function (items = {}) {
this.makeName(items.name);
this.register();
this.set(this.defs);
this.set(items);
return this;
};
let P = Filter.prototype = Object.create(Object.prototype);
P.type = 'Filter';
P.lib = 'filter';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
let defaultAttributes = {
method: '',
level: 0,
lowRed: 0,
lowGreen: 0,
lowBlue: 0,
highRed: 255,
highGreen: 255,
highBlue: 255,
red: 0,
green: 0,
blue: 0,
redInRed: 0,
redInGreen: 0,
redInBlue: 0,
greenInRed: 0,
greenInGreen: 0,
greenInBlue: 0,
blueInRed: 0,
blueInGreen: 0,
blueInBlue: 0,
offsetX: 0,
offsetY: 0,
tileWidth: 1,
tileHeight: 1,
radius: 1,
passes: 1,
shrinkingRadius: false,
includeAlpha: false,
weights: null,
ranges: null,
userDefined: '',
udVariable0: '',
udVariable1: '',
udVariable2: '',
udVariable3: '',
udVariable4: '',
udVariable5: '',
udVariable6: '',
udVariable7: '',
udVariable8: '',
udVariable9: '',
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.kill = function () {
let myname = this.name;
Object.entries(entity).forEach(([name, ent]) => {
let f = ent.filters;
if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
});
Object.entries(group).forEach(([name, grp]) => {
let f = grp.filters;
if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
});
Object.entries(cell).forEach(([name, c]) => {
let f = c.filters;
if (f && f.indexOf(myname) >= 0) removeItem(f, myname);
});
this.deregister();
return this;
};
const filterPool = [];
const requestFilterWorker = function () {
if (!filterPool.length) filterPool.push(buildFilterWorker());
return filterPool.shift();
};
const releaseFilterWorker = function (f) {
filterPool.push(f);
};
const buildFilterWorker = function () {
let path = import.meta.url.slice(0, -('factory/filter.js'.length))
let filterUrl = (window.scrawlEnvironmentOffscreenCanvasSupported) ?
`${path}worker/filter.js` :
`${path}worker/filter.js`;
return new Worker(filterUrl);
};
const actionFilterWorker = function (worker, items) {
return new Promise((resolve, reject) => {
worker.onmessage = (e) => {
if (e && e.data && e.data.image) resolve(e.data.image);
else resolve(false);
};
worker.onerror = (e) => {
console.log('error', e.lineno, e.message);
resolve(false);
};
worker.postMessage(items);
});
};
const makeFilter = function (items) {
return new Filter(items);
};
constructors.Filter = Filter;
export {
makeFilter,
requestFilterWorker,
releaseFilterWorker,
actionFilterWorker,
};
