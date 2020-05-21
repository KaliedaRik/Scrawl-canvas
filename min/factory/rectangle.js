import { constructors } from '../core/library.js';
import { mergeOver, addStrings } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import shapeMix from '../mixin/shapeBasic.js';
import filterMix from '../mixin/filter.js';
const Rectangle = function (items = {}) {
this.shapeInit(items);
this.currentRectangleWidth = 1;
this.currentRectangleHeight = 1;
return this;
};
let P = Rectangle.prototype = Object.create(Object.prototype);
P.type = 'Rectangle';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = shapeMix(P);
P = filterMix(P);
let defaultAttributes = {
rectangleWidth: 10,
rectangleHeight: 10,
radiusTLX: 0,
radiusTLY: 0,
radiusTRX: 0,
radiusTRY: 0,
radiusBRX: 0,
radiusBRY: 0,
radiusBLX: 0,
radiusBLY: 0,
offshootA: 0.55,
offshootB: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);
let S = P.setters,
D = P.deltaSetters;
S.radius = function (item) {
this.setRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX', 'radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
S.radiusX = function (item) {
this.setRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX']);
};
S.radiusY = function (item) {
this.setRectHelper(item, ['radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
S.radiusT = function (item) {
this.setRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY']);
};
S.radiusB = function (item) {
this.setRectHelper(item, ['radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY']);
};
S.radiusL = function (item) {
this.setRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusBLX', 'radiusBLY']);
};
S.radiusR = function (item) {
this.setRectHelper(item, ['radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY']);
};
S.radiusTX = function (item) {
this.setRectHelper(item, ['radiusTLX', 'radiusTRX']);
};
S.radiusBX = function (item) {
this.setRectHelper(item, ['radiusBRX', 'radiusBLX']);
};
S.radiusLX = function (item) {
this.setRectHelper(item, ['radiusTLX', 'radiusBLX']);
};
S.radiusRX = function (item) {
this.setRectHelper(item, ['radiusTRX', 'radiusBRX']);
};
S.radiusTY = function (item) {
this.setRectHelper(item, ['radiusTLY', 'radiusTRY']);
};
S.radiusBY = function (item) {
this.setRectHelper(item, ['radiusBRY', 'radiusBLY']);
};
S.radiusLY = function (item) {
this.setRectHelper(item, ['radiusTLY', 'radiusBLY']);
};
S.radiusRY = function (item) {
this.setRectHelper(item, ['radiusTRY', 'radiusBRY']);
};
S.radiusTL = function (item) {
this.setRectHelper(item, ['radiusTLX', 'radiusTLY']);
};
S.radiusTR = function (item) {
this.setRectHelper(item, ['radiusTRX', 'radiusTRY']);
};
S.radiusBL = function (item) {
this.setRectHelper(item, ['radiusBLX', 'radiusBLY']);
};
S.radiusBR = function (item) {
this.setRectHelper(item, ['radiusBRX', 'radiusBRY']);
};
S.radiusTLX = function (item) {
this.setRectHelper(item, ['radiusTLX']);
};
S.radiusTLY = function (item) {
this.setRectHelper(item, ['radiusTLY']);
};
S.radiusTRX = function (item) {
this.setRectHelper(item, ['radiusTRX']);
};
S.radiusTRY = function (item) {
this.setRectHelper(item, ['radiusTRY']);
};
S.radiusBRX = function (item) {
this.setRectHelper(item, ['radiusBRX']);
};
S.radiusBRY = function (item) {
this.setRectHelper(item, ['radiusBRY']);
};
S.radiusBLX = function (item) {
this.setRectHelper(item, ['radiusBLX']);
};
S.radiusBLY = function (item) {
this.setRectHelper(item, ['radiusBLY']);
};
D.radius = function (item) {
this.deltaRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX', 'radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
D.radiusX = function (item) {
this.deltaRectHelper(item, ['radiusTLX', 'radiusTRX', 'radiusBRX', 'radiusBLX', 'radiusX']);
};
D.radiusY = function (item) {
this.deltaRectHelper(item, ['radiusTLY', 'radiusTRY', 'radiusBRY', 'radiusBLY', 'radiusY']);
};
D.radiusT = function (item) {
this.deltaRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusTRX', 'radiusTRY']);
};
D.radiusB = function (item) {
this.deltaRectHelper(item, ['radiusBRX', 'radiusBRY', 'radiusBLX', 'radiusBLY']);
};
D.radiusL = function (item) {
this.deltaRectHelper(item, ['radiusTLX', 'radiusTLY', 'radiusBLX', 'radiusBLY']);
};
D.radiusR = function (item) {
this.deltaRectHelper(item, ['radiusTRX', 'radiusTRY', 'radiusBRX', 'radiusBRY']);
};
D.radiusTX = function (item) {
this.deltaRectHelper(item, ['radiusTLX', 'radiusTRX']);
};
D.radiusBX = function (item) {
this.deltaRectHelper(item, ['radiusBRX', 'radiusBLX']);
};
D.radiusLX = function (item) {
this.deltaRectHelper(item, ['radiusTLX', 'radiusBLX']);
};
D.radiusRX = function (item) {
this.deltaRectHelper(item, ['radiusTRX', 'radiusBRX']);
};
D.radiusTY = function (item) {
this.deltaRectHelper(item, ['radiusTLY', 'radiusTRY']);
};
D.radiusBY = function (item) {
this.deltaRectHelper(item, ['radiusBRY', 'radiusBLY']);
};
D.radiusLY = function (item) {
this.deltaRectHelper(item, ['radiusTLY', 'radiusBLY']);
};
D.radiusRY = function (item) {
this.deltaRectHelper(item, ['radiusTRY', 'radiusBRY']);
};
D.radiusTL = function (item) {
this.deltaRectHelper(item, ['radiusTLX', 'radiusTLY']);
};
D.radiusTR = function (item) {
this.deltaRectHelper(item, ['radiusTRX', 'radiusTRY']);
};
D.radiusBL = function (item) {
this.deltaRectHelper(item, ['radiusBLX', 'radiusBLY']);
};
D.radiusBR = function (item) {
this.deltaRectHelper(item, ['radiusBRX', 'radiusBRY']);
};
D.radiusTLX = function (item) {
this.deltaRectHelper(item, ['radiusTLX']);
};
D.radiusTLY = function (item) {
this.deltaRectHelper(item, ['radiusTLY']);
};
D.radiusTRX = function (item) {
this.deltaRectHelper(item, ['radiusTRX']);
};
D.radiusTRY = function (item) {
this.deltaRectHelper(item, ['radiusTRY']);
};
D.radiusBRX = function (item) {
this.deltaRectHelper(item, ['radiusBRX']);
};
D.radiusBRY = function (item) {
this.deltaRectHelper(item, ['radiusBRY']);
};
D.radiusBLX = function (item) {
this.deltaRectHelper(item, ['radiusBLX']);
};
D.radiusBLY = function (item) {
this.deltaRectHelper(item, ['radiusBLY']);
};
S.offshootA = function (item) {
this.offshootA = item;
this.updateDirty();
};
S.offshootB = function (item) {
this.offshootB = item;
this.updateDirty();
};
D.offshootA = function (item) {
if (item.toFixed) {
this.offshootA += item;
this.updateDirty();
}
};
D.offshootB = function (item) {
if (item.toFixed) {
this.offshootB += item;
this.updateDirty();
}
};
S.rectangleWidth = function (val) {
if (val != null) {
this.rectangleWidth = val;
this.dirtyDimensions = true;
}
};
S.rectangleHeight = function (val) {
if (val != null) {
this.rectangleHeight = val;
this.dirtyDimensions = true;
}
};
D.rectangleWidth = function (val) {
this.rectangleWidth = addStrings(this.rectangleWidth, val);
this.dirtyDimensions = true;
};
D.rectangleHeight = function (val) {
this.rectangleHeight = addStrings(this.rectangleHeight, val);
this.dirtyDimensions = true;
};
P.setRectHelper = function (item, corners) {
this.updateDirty();
corners.forEach(corner => {
this[corner] = item;
}, this);
};
P.deltaRectHelper = function (item, corners) {
this.updateDirty();
corners.forEach(corner => {
this[corner] = addStrings(this[corner], item);
}, this);
};
P.cleanSpecies = function () {
this.dirtySpecies = false;
let p = 'M0,0';
p = this.makeRectanglePath();
this.pathDefinition = p;
};
P.cleanDimensions = function () {
let host = this.getHost();
if (host) {
let hostDims = (host.currentDimensions) ? host.currentDimensions : [host.w, host.h];
let w = this.rectangleWidth,
h = this.rectangleHeight,
oldW = this.currentRectangleWidth || 1,
oldH = this.currentRectangleHeight || 1;
if (w.substring) w = (parseFloat(w) / 100) * hostDims[0];
if (h.substring) h = (parseFloat(h) / 100) * hostDims[1];
let mimic = this.mimic,
mimicDims;
if (mimic && mimic.name && this.useMimicDimensions) mimicDims = mimic.currentDimensions;
if (mimicDims) {
this.currentRectangleWidth = (this.addOwnDimensionsToMimic) ? mimicDims[0] + w : mimicDims[0];
this.currentRectangleHeight = (this.addOwnDimensionsToMimic) ? mimicDims[1] + h : mimicDims[1];
}
else {
this.currentRectangleWidth = w;
this.currentRectangleHeight = h;
}
this.currentDimensions[0] = this.currentRectangleWidth;
this.currentDimensions[1] = this.currentRectangleHeight;
this.dirtyStart = true;
this.dirtyHandle = true;
this.dirtyOffset = true;
if (oldW !== this.currentRectangleWidth || oldH !== this.currentRectangleHeight) this.dirtyPositionSubscribers = true;
if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;
}
else this.dirtyDimensions = true;
};
P.makeRectanglePath = function () {
if (this.dirtyDimensions) this.cleanDimensions()
let width = this.currentRectangleWidth,
height = this.currentRectangleHeight;
let A = this.offshootA,
B = this.offshootB;
let _tlx = this.radiusTLX,
_tly = this.radiusTLY,
_trx = this.radiusTRX,
_try = this.radiusTRY,
_brx = this.radiusBRX,
_bry = this.radiusBRY,
_blx = this.radiusBLX,
_bly = this.radiusBLY;
if (_tlx.substring || _tly.substring || _trx.substring || _try.substring || _brx.substring || _bry.substring || _blx.substring || _bly.substring) {
_tlx = (_tlx.substring) ? (parseFloat(_tlx) / 100) * width : _tlx;
_tly = (_tly.substring) ? (parseFloat(_tly) / 100) * height : _tly;
_trx = (_trx.substring) ? (parseFloat(_trx) / 100) * width : _trx;
_try = (_try.substring) ? (parseFloat(_try) / 100) * height : _try;
_brx = (_brx.substring) ? (parseFloat(_brx) / 100) * width : _brx;
_bry = (_bry.substring) ? (parseFloat(_bry) / 100) * height : _bry;
_blx = (_blx.substring) ? (parseFloat(_blx) / 100) * width : _blx;
_bly = (_bly.substring) ? (parseFloat(_bly) / 100) * height : _bly;
}
let myData = 'm0,0';
if (width - _tlx - _trx !== 0) myData += `h${width - _tlx - _trx}`;
if (_trx + _try !== 0) myData += `c${_trx * A},${_try * B} ${_trx - (_trx * B)},${_try - (_try * A)}, ${_trx},${_try}`;
if (height - _try - _bry !== 0) myData += `v${height - _try - _bry}`;
if (_brx + _bry !== 0) myData += `c${-_brx * B},${_bry * A} ${-_brx + (_brx * A)},${_bry - (_bry * B)} ${-_brx},${_bry}`;
if (-width + _blx + _brx !== 0) myData += `h${-width + _blx + _brx}`;
if (_blx + _bly !== 0) myData += `c${-_blx * A},${-_bly * B} ${-_blx + (_blx * B)},${-_bly + (_bly * A)} ${-_blx},${-_bly}`;
if (-height + _tly + _bly !== 0) myData += `v${-height + _tly + _bly}`;
if (_tlx + _tly !== 0) myData += `c${_tlx * B},${-_tly * A} ${_tlx - (_tlx * A)},${-_tly + (_tly * B)} ${_tlx},${-_tly}`;
myData += 'z';
return myData;
};
P.calculateLocalPathAdditionalActions = function () {
let [x, y, w, h] = this.localBox;
this.pathDefinition = this.pathDefinition.replace('m0,0', `m${-x},${-y}`);
this.pathCalculatedOnce = false;
this.calculateLocalPath(this.pathDefinition, true);
};
const makeRectangle = function (items = {}) {
items.species = 'rectangle';
return new Rectangle(items);
};
constructors.Rectangle = Rectangle;
export {
makeRectangle,
};
