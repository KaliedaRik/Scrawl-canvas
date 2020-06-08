import { mergeOver, pushUnique, λnull } from '../core/utilities.js';
export default function (P = {}) {
let defaultAttributes = {
sourceLoaded: false,
source: null,
subscribers: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['sourceLoaded', 'source', 'subscribers']);
P.finalizePacketOut = function (copy, items) {
if (this.subscribers && this.subscribers.length) {
copy.subscribers = this.subscribers.map(sub => sub.name);
}
return copy;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.source = function (item = {}) {
if (item) {
if (this.sourceLoaded) this.notifySubscribers();
}
};
S.subscribers = λnull;
P.assetConstructor = function (items = {}) {
this.makeName(items.name);
this.register();
this.subscribers = [];
this.set(this.defs);
this.set(items);
if (items.subscribe) this.subscribers.push(items.subscribe);
return this;
};
P.subscribe = function (sub = {}) {
if (sub && sub.name) {
let name = sub.name;
if (this.subscribers.every(item => item.name !== name)) this.subscribeAction(sub);
}
};
P.subscribeAction = function (sub = {}) {
this.subscribers.push(sub);
sub.asset = this;
sub.source = this.source;
this.notifySubscriber(sub);
};
P.unsubscribe = function (sub = {}) {
if (sub.name) {
let name = sub.name,
index = this.subscribers.findIndex(item => item.name === name);
if (index >= 0) {
sub.source = null;
sub.asset = null;
sub.sourceNaturalHeight = 0;
sub.sourceNaturalWidth = 0;
sub.sourceLoaded = false;
this.subscribers.splice(index, 1)
}
}
};
P.notifySubscribers = function () {
this.subscribers.forEach(sub => this.notifySubscriber(sub), this);
};
P.notifySubscriber = function (sub) {
sub.sourceNaturalWidth = this.sourceNaturalWidth;
sub.sourceNaturalHeight = this.sourceNaturalHeight;
sub.sourceLoaded = this.sourceLoaded;
sub.source = this.source;
sub.dirtyImage = true;
sub.dirtyCopyStart = true;
sub.dirtyCopyDimensions = true;
sub.dirtyImageSubscribers = true;
};
return P;
};
