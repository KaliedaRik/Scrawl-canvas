import { constructors, canvas, cell, group, artefact } from '../core/library.js';
import { mergeOver, isa_obj,
defaultThisReturnFunction, defaultNonReturnFunction } from '../core/utilities.js';
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
let defaultAttributes = {};
P.defs = mergeOver(P.defs, defaultAttributes);
P.saveAsPacket = function () {
return [this.name, this.type, this.lib, {}];
};
P.stringifyFunction = defaultNonReturnFunction;
P.processPacketOut = defaultNonReturnFunction;
P.finalizePacketOut = defaultNonReturnFunction;
P.clone = defaultThisReturnFunction;
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
P.checkSource = function (width, height) {
let el = this.source;
if (this.sourceLoaded) {
if (this.sourceNaturalWidth !== el.naturalWidth ||
this.sourceNaturalHeight !== el.naturalHeight ||
this.sourceNaturalWidth !== width ||
this.sourceNaturalHeight !== height) {
this.sourceNaturalWidth = el.naturalWidth;
this.sourceNaturalHeight = el.naturalHeight;
this.notifySubscribers();
}
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
let image = makeImageAsset({
name: name,
source: item,
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
