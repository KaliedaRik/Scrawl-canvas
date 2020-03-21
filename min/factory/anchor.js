import { constructors, artefact } from '../core/library.js';
import { scrawlNavigationHold } from '../core/document.js';
import { mergeOver, pushUnique, isa_fn, isa_dom } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
const Anchor = function (items = {}) {
this.makeName(items.name);
this.register();
this.set(this.defs);
this.set(items);
this.build();
return this;
};
let P = Anchor.prototype = Object.create(Object.prototype);
P.type = 'Anchor';
P.lib = 'anchor';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
let defaultAttributes = {
host: null,
description: '',
download: '',
href: '',
hreflang: '',
ping: '',
referrerpolicy: '',
rel: 'noreferrer',
target: '_blank',
anchorType: '',
clickAction: null,
focusAction: false,
blurAction: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['domElement']);
P.packetObjects = pushUnique(P.packetExclusions, ['host']);
P.packetFunctions = pushUnique(P.packetFunctions, ['clickAction']);
P.demolish = function () {
if (this.domElement && this.hold) this.hold.removeChild(this.domElement);
this.deregister();
};
let S = P.setters;
S.host = function (item) {
let h = (item.substring) ? artefact[item] : item;
if (h && h.name) this.host = h;
};
S.hold = function (item) {
if (isa_dom(item)) {
if (this.domElement && this.hold) this.hold.removeChild(this.domElement);
this.hold = item;
if (this.domElement) this.hold.appendChild(this.domElement);
}
};
S.download = function (item) {
this.download = item;
if (this.domElement) this.update('download');
};
S.href = function (item) {
this.href = item;
if (this.domElement) this.update('href');
};
S.hreflang = function (item) {
this.hreflang = item;
if (this.domElement) this.update('hreflang');
};
S.ping = function (item) {
this.ping = item;
if (this.domElement) this.update('ping');
};
S.referrerpolicy = function (item) {
this.referrerpolicy = item;
if (this.domElement) this.update('referrerpolicy');
};
S.rel = function (item) {
this.rel = item;
if (this.domElement) this.update('rel');
};
S.target = function (item) {
this.target = item;
if (this.domElement) this.update('target');
};
S.anchorType = function (item) {
this.anchorType = item;
if (this.domElement) this.update('type');
};
S.description = function (item) {
this.description = item;
if (this.domElement) this.domElement.textContent = item;
};
S.clickAction = function (item) {
if (isa_fn(item)) {
this.clickAction = item;
if (this.domElement) this.domElement.setAttribute('onclick', item());
}
};
P.build = function () {
if (this.domElement && this.hold) this.hold.removeChild(this.domElement);
let link = document.createElement('a');
link.id = this.name;
if (this.download) link.setAttribute('download', this.download);
if (this.href) link.setAttribute('href', this.href);
if (this.hreflang) link.setAttribute('hreflang', this.hreflang);
if (this.ping) link.setAttribute('ping', this.ping);
if (this.referrerpolicy) link.setAttribute('referrerpolicy', this.referrerpolicy);
if (this.rel) link.setAttribute('rel', this.rel);
if (this.target) link.setAttribute('target', this.target);
if (this.anchorType) link.setAttribute('type', this.anchorType);
if (this.clickAction && isa_fn(this.clickAction)) link.setAttribute('onclick', this.clickAction());
if (this.description) link.textContent = this.description;
if (this.focusAction) link.addEventListener('focus', (e) => this.host.onEnter(), false);
if (this.blurAction) link.addEventListener('blur', (e) => this.host.onLeave(), false);
this.domElement = link;
if (this.hold) this.hold.appendChild(link);
};
P.update = function (item) {
if (this.domElement) this.domElement.setAttribute(item, this[item]);
};
P.click = function () {
let e = new MouseEvent('click', {
view: window,
bubbles: true,
cancelable: true
});
return this.domElement.dispatchEvent(e);
};
const makeAnchor = function (items) {
return new Anchor(items);
};
constructors.Anchor = Anchor;
export {
makeAnchor,
};
