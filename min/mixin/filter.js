import { filter } from '../core/library.js';
import { mergeOver, pushUnique, removeItem } from '../core/utilities.js';
export default function (P = {}) {
let defaultAttributes = {
filters: null,
isStencil: false,
filterAlpha: 1,
filterComposite: 'source-over',
};
P.defs = mergeOver(P.defs, defaultAttributes);
let S = P.setters;
S.filters = function (item) {
if (!Array.isArray(this.filters)) this.filters = [];
if (item) {
if (Array.isArray(item)) {
this.filters = item;
this.dirtyFilters = true;
this.dirtyImageSubscribers = true;
}
else if (item.substring) {
pushUnique(this.filters, item);
this.dirtyFilters = true;
this.dirtyImageSubscribers = true;
}
}
};
P.cleanFilters = function () {
this.dirtyFilters = false;
if (!this.filters) this.filters = [];
let myfilters = this.filters,
floor = Math.floor,
buckets = [];
myfilters.forEach(name => {
let myobj = filter[name],
order = floor(myobj.order) || 0;
if (!buckets[order]) buckets[order] = [];
buckets[order].push(myobj);
});
this.currentFilters = buckets.reduce((a, v) => a.concat(v), []);
};
P.addFilters = function (...args) {
if (!Array.isArray(this.filters)) this.filters = [];
args.forEach(item => {
if (this.name, 'addFilters', item) {
if (item.substring) pushUnique(this.filters, item);
else if (item.type === 'Filter') pushUnique(this.filters, item.name);
}
}, this);
this.dirtyFilters = true;
this.dirtyImageSubscribers = true;
return this;
};
P.removeFilters = function (...args) {
if (!Array.isArray(this.filters)) this.filters = [];
args.forEach(item => {
if (item) {
if (item.substring) removeItem(this.filters, item);
else if (item.type === 'Filter') removeItem(this.filters, item.name);
}
}, this);
this.dirtyFilters = true;
this.dirtyImageSubscribers = true;
return this;
};
P.clearFilters = function () {
if (!Array.isArray(this.filters)) this.filters = [];
this.filters.length = 0;
this.dirtyFilters = true;
this.dirtyImageSubscribers = true;
return this;
};
return P;
};
