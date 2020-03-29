import { constructors } from '../core/library.js';
import { mergeOver, xt } from '../core/utilities.js';
import { requestCell, releaseCell } from './cell.js';
import baseMix from '../mixin/base.js';
const FontAttributes = function (items = {}) {
this.makeName(items.name);
this.set(this.defs);
this.set(items);
return this;
};
let P = FontAttributes.prototype = Object.create(Object.prototype);
P.type = 'FontAttributes';
P.lib = 'fontattribute';
P = baseMix(P);
let defaultAttributes = {
style: 'normal',
variant: 'normal',
weight: 'normal',
stretch: 'normal',
sizeValue: 12,
sizeMetric: 'px',
family: 'sans-serif',
};
P.defs = mergeOver(P.defs, defaultAttributes);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
G.size = function () {
return (this.sizeValue) ? `${this.sizeValue}${this.sizeMetric}` : this.sizeMetric;
};
S.size = function (item) {
if (xt(item)) {
let res,
size = 0,
metric = 'medium';
if (item.indexOf('xx-small') >= 0) metric = 'xx-small';
else if (item.indexOf('x-small') >= 0) metric = 'x-small';
else if (item.indexOf('smaller') >= 0) metric = 'smaller';
else if (item.indexOf('small') >= 0) metric = 'small';
else if (item.indexOf('xx-large') >= 0) metric = 'xx-large';
else if (item.indexOf('x-large') >= 0) metric = 'x-large';
else if (item.indexOf('larger') >= 0) metric = 'larger';
else if (item.indexOf('large') >= 0) metric = 'large';
else if (item.indexOf('medium') >= 0) metric = 'medium';
else {
size = 12;
metric = 'px'
}
if (/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
res = item.match(/.* (\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
metric = res[2];
}
else if (/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i.test(item)) {
res = item.match(/^(\d+\.\d+|\d+|\.\d+)(%|em|ch|ex|rem|vh|vw|vmin|vmax|px|cm|mm|in|pc|pt)?/i);
size = (res[1] !== '.') ? parseFloat(res[1]) : 12;
metric = res[2];
}
this.sizeValue = size;
this.sizeMetric = metric;
}
};
S.font = function (item) {
if (xt(item)) {
S.style.call(this, item);
S.variant.call(this, item);
S.weight.call(this, item);
S.stretch.call(this, item);
S.size.call(this, item);
S.family.call(this, item);
}
};
S.style = function (item) {
let v = 'normal';
if (xt(item)) {
v = (item.indexOf('italic') >= 0) ? 'italic' : v;
v = (item.indexOf('oblique') >= 0) ? 'oblique' : v;
}
this.style = v;
};
S.variant = function (item) {
let v = 'normal';
v = (item.indexOf('small-caps') >= 0) ? 'small-caps' : v;
this.variant = v;
};
S.weight = function (item) {
let v = 'normal';
if (xt(item)) {
if (item.toFixed) v = item;
else {
v = (item.indexOf('bold') >= 0) ? 'bold' : v;
v = (item.indexOf('lighter') >= 0) ? 'lighter' : v;
v = (item.indexOf('bolder') >= 0) ? 'bolder' : v;
v = (item.indexOf(' 100 ') >= 0) ? '100' : v;
v = (item.indexOf(' 200 ') >= 0) ? '200' : v;
v = (item.indexOf(' 300 ') >= 0) ? '300' : v;
v = (item.indexOf(' 400 ') >= 0) ? '400' : v;
v = (item.indexOf(' 500 ') >= 0) ? '500' : v;
v = (item.indexOf(' 600 ') >= 0) ? '600' : v;
v = (item.indexOf(' 700 ') >= 0) ? '700' : v;
v = (item.indexOf(' 800 ') >= 0) ? '800' : v;
v = (item.indexOf(' 900 ') >= 0) ? '900' : v;
v = (/^\d00$/.test(item)) ? item : v;
}
}
this.weight = v;
};
S.stretch = function (item) {
let v = 'normal';
if (xt(item)) {
v = (item.indexOf('semi-condensed') >= 0) ? 'semi-condensed' : v;
v = (item.indexOf('condensed') >= 0) ? 'condensed' : v;
v = (item.indexOf('extra-condensed') >= 0) ? 'extra-condensed' : v;
v = (item.indexOf('ultra-condensed') >= 0) ? 'ultra-condensed' : v;
v = (item.indexOf('semi-condensed') >= 0) ? 'semi-condensed' : v;
v = (item.indexOf('condensed') >= 0) ? 'condensed' : v;
v = (item.indexOf('extra-condensed') >= 0) ? 'extra-condensed' : v;
v = (item.indexOf('ultra-condensed') >= 0) ? 'ultra-condensed' : v;
}
this.stretch = v;
};
S.family = function (item) {
if (xt(item)) {
let guess = item.match(/( xx-small| x-small| small| medium| large| x-large| xx-large| smaller| larger|\d%|\dem|\dch|\dex|\drem|\dvh|\dvw|\dvmin|\dvmax|\dpx|\dcm|\dmm|\din|\dpc|\dpt) (.*)$/i);
this.family = (guess && guess[2]) ? guess[2] : item;
}
};
P.buildFont = function (scale = 1) {
let font = ''
if (this.style !== 'normal') font += `${this.style} `;
if (this.variant !== 'normal') font += `${this.variant} `;
if (this.weight !== 'normal') font += `${this.weight} `;
if (this.stretch !== 'normal') font += `${this.stretch} `;
if (this.sizeValue) font += `${this.sizeValue * scale}${this.sizeMetric} `;
else font += `${this.sizeMetric} `;
font += `${this.family}`;
let myCell = requestCell();
myCell.engine.font = font;
font = myCell.engine.font;
releaseCell(myCell);
return font;
};
P.update = function (scale = 1, items) {
if (items) this.set(items);
return this.buildFont(scale);
};
const makeFontAttributes = function (items) {
return new FontAttributes(items);
};
constructors.FontAttributes = FontAttributes;
export {
makeFontAttributes,
};
