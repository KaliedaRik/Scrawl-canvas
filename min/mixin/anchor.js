import { canvas } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import { makeAnchor } from '../factory/anchor.js';
import { scrawlNavigationHold } from '../core/document.js';
export default function (P = {}) {
let defaultAttributes = {
anchor: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.demolishAnchor = function () {
if (this.anchor) this.anchor.demolish();
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.anchorDescription = function () {
if (this.anchor) return this.anchor.get('description');
return '';
};
S.anchorDescription = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.description(item);
};
G.anchorType = function () {
if (this.anchor) return this.anchor.get('type');
return '';
};
S.anchorType = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.anchorType(item);
};
G.anchorTarget = function () {
if (this.anchor) return this.anchor.get('target');
return '';
};
S.anchorTarget = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.target(item);
};
G.anchorRel = function () {
if (this.anchor) return this.anchor.get('rel');
return '';
};
S.anchorRel = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.rel(item);
};
G.anchorReferrerPolicy = function () {
if (this.anchor) return this.anchor.get('referrerpolicy');
return '';
};
S.anchorReferrerPolicy = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.referrerpolicy(item);
};
G.anchorPing = function () {
if (this.anchor) return this.anchor.get('ping');
return '';
};
S.anchorPing = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.ping(item);
};
G.anchorHreflang = function () {
if (this.anchor) return this.anchor.get('hreflang');
return '';
};
S.anchorHreflang = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.hreflang(item);
};
G.anchorHref = function () {
if (this.anchor) return this.anchor.get('href');
return '';
};
S.anchorHref = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.href(item);
};
G.anchorDownload = function () {
if (this.anchor) return this.anchor.get('download');
return '';
};
S.anchorDownload = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.download(item);
};
S.anchorFocusAction = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.focusAction(item);
};
S.anchorBlurAction = function (item) {
if (!this.anchor) this.buildAnchor();
if (this.anchor) this.anchor.setters.blurAction(item);
};
S.anchor = function (items = {}) {
if (!this.anchor) this.buildAnchor(items);
else this.anchor.set(items);
};
P.buildAnchor = function (items = {}) {
if (this.anchor) this.anchor.demolish();
if (!items.name) items.name = `${this.name}-anchor`;
if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;
items.host = this;
items.hold = this.getAnchorHold();
this.anchor = makeAnchor(items);
};
P.getAnchorHold = function () {
let entityHost = this.currentHost;
if (entityHost) {
if (entityHost.type === 'Canvas') return entityHost.navigation;
if (entityHost.type === 'Cell') {
let cellHost = (entityHost.currentHost) ? entityHost.currentHost : canvas[entityHost.host];
if (cellHost && cellHost.type === 'Canvas') return cellHost.navigation;
}
}
this.dirtyAnchorHold = true;
return scrawlNavigationHold;
}
P.rebuildAnchor = function () {
if (this.anchor) this.anchor.build();
};
P.clickAnchor = function () {
if (this.anchor) this.anchor.click();
};
return P;
};
