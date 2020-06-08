import { constructors, canvas, cell, group, artefact } from '../core/library.js';
import { mergeOver, isa_obj, λthis, λnull } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
const ImageAsset = function (items = {}) {
return this.assetConstructor(items);
};
let P = ImageAsset.prototype = Object.create(Object.prototype);
P.type = 'Image';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;
P = baseMix(P);
P = assetMix(P);
let defaultAttributes = {
intrinsicDimensions: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.saveAsPacket = function () {
return [this.name, this.type, this.lib, {}];
};
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.clone = λthis;
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.source = function (item = {}) {
if (item) {
if (['IMG', 'PICTURE'].indexOf(item.tagName.toUpperCase()) >= 0) {
this.source = item;
this.sourceNaturalWidth = item.naturalWidth;
this.sourceNaturalHeight = item.naturalHeight;
this.sourceLoaded = item.complete;
}
if (this.sourceLoaded) this.notifySubscribers();
}
};
S.currentSrc = function (item) {
this.currentSrc = item;
this.currentFile = this.currentSrc.split("/").pop();
};
P.checkSource = function (width, height) {
let el = this.source,
action = 'element';
if (this.sourceLoaded) {
let iDims = this.intrinsicDimensions[this.currentFile];
if (this.currentSrc !== el.currentSrc) {
this.set({
currentSrc: el.currentSrc
});
iDims = this.intrinsicDimensions[this.currentFile];
if (iDims) action = 'intrinsic';
else action = 'zero';
}
else if (iDims) action = 'intrinsic';
switch (action) {
case 'zero' :
this.sourceNaturalWidth = 0;
this.sourceNaturalHeight = 0;
this.notifySubscribers();
break;
case 'intrinsic' :
if (this.sourceNaturalWidth !== iDims[0] ||
this.sourceNaturalHeight !== iDims[1]) {
this.sourceNaturalWidth = iDims[0];
this.sourceNaturalHeight = iDims[1];
this.notifySubscribers();
}
break;
default:
if (this.sourceNaturalWidth !== el.naturalWidth ||
this.sourceNaturalHeight !== el.naturalHeight ||
this.sourceNaturalWidth !== width ||
this.sourceNaturalHeight !== height) {
this.sourceNaturalWidth = el.naturalWidth;
this.sourceNaturalHeight = el.naturalHeight;
this.notifySubscribers();
}
};
}
};
const gettableImageAssetAtributes = [];
const settableImageAssetAtributes = [];
const importImage = function (...args) {
let reg = /.*\/(.*?)\./,
results = [];
args.forEach(item => {
let name, url, className, visibility,
parent = false;
let flag = false;
if (item.substring) {
let match = reg.exec(item);
name = (match && match[1]) ? match[1] : '';
url = item;
className = '';
visibility = false;
flag = true;
}
else {
item = (isa_obj(item)) ? item : false;
if (item && item.src) {
name = item.name || '';
url = item.src;
className = item.className || '';
visibility = item.visibility || false;
if (item.parent) parent = document.querySelector(item.parent);
flag = true;
}
}
if (flag) {
let image = makeImageAsset({
name: name,
intrinsicDimensions: {},
});
let img = document.createElement('img');
img.name = name;
img.className = className;
img.crossorigin = 'anonymous';
img.style.display = (visibility) ? 'block' : 'none';
if (parent) parent.appendChild(img);
img.onload = () => {
image.set({
source: img,
});
};
img.src = url;
image.set({
source: img,
});
results.push(name);
}
else results.push(false);
});
return results;
};
const importDomImage = function (query) {
let reg = /.*\/(.*?)\./;
let items = document.querySelectorAll(query);
items.forEach(item => {
let name;
if (['IMG', 'PICTURE'].indexOf(item.tagName.toUpperCase()) >= 0) {
if (item.id || item.name) name = item.id || item.name;
else {
let match = reg.exec(item.src);
name = (match && match[1]) ? match[1] : '';
}
let intrinsics = item.dataset.dimensions || {};
if (intrinsics.substring) intrinsics = JSON.parse(intrinsics);
let image = makeImageAsset({
name: name,
source: item,
intrinsicDimensions: intrinsics,
currentSrc: item.currentSrc,
});
item.onload = () => {
image.set({
source: item,
});
};
}
});
};
const createImageFromCell = function (item, stashAsAsset = false) {
let mycell = (item.substring) ? cell[item] || canvas[item] : item;
if (mycell.type === 'Canvas') mycell = mycell.base;
if (mycell.type === 'Cell') {
mycell.stashOutput = true;
if (stashAsAsset) mycell.stashOutputAsAsset = true;
}
};
const createImageFromGroup = function (item, stashAsAsset = false) {
let mygroup;
if (item && !item.substring) {
if (item.type === 'Group') mygroup = item;
else if (item.type === 'Cell') mygroup = group[item.name];
else if (item.type === 'Canvas') mygroup = group[item.base.name];
}
else if (item && item.substring) mygroup = group[item];
if (mygroup) {
mygroup.stashOutput = true;
if (stashAsAsset) mygroup.stashOutputAsAsset = true;
}
};
const createImageFromEntity = function (item, stashAsAsset = false) {
let myentity = (item.substring) ? artefact[item] : item;
if (myentity.isArtefact) {
myentity.stashOutput = true;
if (stashAsAsset) myentity.stashOutputAsAsset = true;
}
};
const makeImageAsset = function (items) {
return new ImageAsset(items);
};
constructors.ImageAsset = ImageAsset;
export {
makeImageAsset,
gettableImageAssetAtributes,
settableImageAssetAtributes,
importImage,
importDomImage,
createImageFromCell,
createImageFromGroup,
createImageFromEntity,
};
