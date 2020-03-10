import { group } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xtGet } from '../core/utilities.js';
export default function (P = {}) {
let defaultAttributes = {
groups: null,
groupBuckets: null,
batchResort: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let G = P.getters,
S = P.setters;
G.groups = function () {
return [].concat(this.groups);
};
S.groups = function (item) {
this.groups = [];
this.addGroups(item);
};
P.sortGroups = function (force = false) {
if (this.batchResort) {
this.batchResort = false;
let floor = Math.floor,
groupnames = this.groups,
buckets = [];
groupnames.forEach(name => {
let mygroup = group[name],
order = (mygroup) ? floor(mygroup.order) : 0;
if (!buckets[order]) buckets[order] = [];
buckets[order].push(mygroup);
});
this.groupBuckets = buckets.reduce((a, v) => a.concat(v), []);
}
};
P.initializeCascade = function () {
this.groups = [];
this.groupBuckets = [];
};
P.addGroups = function (...args) {
args.forEach( item => {
if (item && item.substring) pushUnique(this.groups, item);
else if (group[item]) pushUnique(this.groups, item.name);
}, this);
this.batchResort = true;
return this;
};
P.removeGroups = function (...args) {
args.forEach( item => {
if (item && item.substring) removeItem(this.groups, item);
else if (group[item]) removeItem(this.groups, item.name);
}, this);
this.batchResort = true;
return this;
};
P.cascadeAction = function (items, action) {
this.groups.forEach( groupname => {
let grp = group[groupname];
if (grp) grp[action](items);
}, this);
return this;
};
P.updateArtefacts = function (items) {
this.cascadeAction(items, 'updateArtefacts');
return this;
};
P.setArtefacts = function (items) {
this.cascadeAction(items, 'setArtefacts');
return this;
};
P.addArtefactClasses = function (items) {
this.cascadeAction(items, 'addArtefactClasses');
return this;
};
P.removeArtefactClasses = function (items) {
this.cascadeAction(items, 'removeArtefactClasses');
return this;
};
P.updateByDelta = function () {
this.cascadeAction(false, 'updateByDelta');
return this;
};
P.reverseByDelta = function () {
this.cascadeAction(false, 'reverseByDelta');
return this;
};
P.getArtefactAt = function (items) {
items = xtGet(items, this.here, false);
if (items) {
let grp, result;
for (let i = this.groups.length - 1; i >= 0; i--) {
grp = group[this.groups[i]];
if (grp) {
result = grp.getArtefactAt(items);
if (result) return result;
}
}
}
return false;
};
P.getAllArtefactsAt = function (items) {
items = xtGet(items, this.here, false);
if (items) {
let grp, result,
results = [];
for (let i = this.groups.length - 1; i >= 0; i--) {
grp = group[this.groups[i]];
if (grp) {
result = grp.getAllArtefactsAt(items);
if(result) results = results.concat(result);
}
}
return results;
}
return [];
};
return P;
};
