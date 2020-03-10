import { mergeOver } from '../core/utilities.js';
import { makeAnchor } from '../factory/anchor.js';
export default function (P = {}) {
let defaultAttributes = {
anchor: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.anchorDescription = function () {
if (this.anchor) return this.anchor.get('description');
return '';
};
G.anchorType = function () {
if (this.anchor) return this.anchor.get('type');
return '';
};
G.anchorTarget = function () {
if (this.anchor) return this.anchor.get('target');
return '';
};
G.anchorRel = function () {
if (this.anchor) return this.anchor.get('rel');
return '';
};
G.anchorReferrerPolicy = function () {
if (this.anchor) return this.anchor.get('referrerpolicy');
return '';
};
G.anchorPing = function () {
if (this.anchor) return this.anchor.get('ping');
return '';
};
G.anchorHreflang = function () {
if (this.anchor) return this.anchor.get('hreflang');
return '';
};
G.anchorHref = function () {
if (this.anchor) return this.anchor.get('href');
return '';
};
G.anchorDownload = function () {
if (this.anchor) return this.anchor.get('download');
return '';
};
S.anchorDescription = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.description(item);
};
S.anchorType = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.anchorType(item);
};
S.anchorTarget = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.target(item);
};
S.anchorRel = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.rel(item);
};
S.anchorReferrerPolicy = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.referrerpolicy(item);
};
S.anchorPing = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.ping(item);
};
S.anchorHreflang = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.hreflang(item);
};
S.anchorHref = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.href(item);
};
S.anchorDownload = function (item) {
if (!this.anchor) this.buildAnchor(items);
if (this.anchor) this.anchor.setters.download(item);
};
S.anchor = function (items = {}) {
if (!this.anchor) this.buildAnchor(items);
else this.anchor.set(items);
};
P.buildAnchor = function (items = {}) {
if (this.anchor) this.anchor.demolish();
if (!items.name) items.name = `${this.name}-anchor`;
if (!items.description) items.description = `Anchor link for ${this.name} ${this.type}`;
this.anchor = makeAnchor(items);
};
P.rebuildAnchor = function () {
if (this.anchor) this.anchor.build();
};
P.demolishAnchor = function () {
if (this.anchor) this.anchor.demolish();
};
P.clickAnchor = function () {
if (this.anchor) this.anchor.click();
};
return P;
};
