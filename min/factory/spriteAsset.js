import { constructors } from '../core/library.js';
import { mergeOver, generateUuid, xt, isa_obj,
defaultNonReturnFunction, defaultThisReturnFunction } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
const SpriteAsset = function (items = {}) {
this.assetConstructor(items);
return this;
};
let P = SpriteAsset.prototype = Object.create(Object.prototype);
P.type = 'Sprite';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;
P = baseMix(P);
P = assetMix(P);
let defaultAttributes = {
manifest: null,
};
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
S.source = function (items = []) {
if (items && items[0]) {
if (!this.sourceHold) this.sourceHold = {};
let hold = this.sourceHold;
items.forEach(item => {
let name = item.id || item.name;
if (name) hold[name] = item;
})
this.source = items[0];
this.sourceNaturalWidth = items[0].naturalWidth;
this.sourceNaturalHeight = items[0].naturalHeight;
this.sourceLoaded = items[0].complete;
}
};
P.checkSource = defaultNonReturnFunction;
const importSprite = function (...args) {
let reg = /.*\/(.*?)\./,
fileTlas = /\.(jpeg|jpg|png|gif|webp|svg|JPEG|JPG|PNG|GIF|WEBP|SVG)/,
results = [];
args.forEach(item => {
let name, urls, className, visibility, manifest,
parent = false;
let flag = false;
if (item.substring) {
let match = reg.exec(item);
name = (match && match[1]) ? match[1] : '';
urls = [item];
className = '';
visibility = false;
manifest = item.replace(fileTlas, '.json');
flag = true;
}
else {
if (!isa_obj(item) || !item.imageSrc || !item.manifestSrc) results.push(false);
else {
name = item.name || '';
urls = Array.isArray(item.imageSrc) ? item.imageSrc : [item.imageSrc];
manifest = item.manifestSrc;
className = item.className || '';
visibility = item.visibility || false;
parent = document.querySelector(item.parent);
flag = true;
}
}
if (flag) {
let image = makeSpriteAsset({
name: name,
});
if (isa_obj(manifest)) image.manifest = manifest;
else {
fetch(manifest)
.then(response => {
if (response.status !== 200) throw new Error('Failed to load manifest');
return response.json();
})
.then(jsonString => image.manifest = jsonString)
.catch(err => console.log(err.message));
}
let imgArray = [];
urls.forEach(url => {
let img = document.createElement('img'),
filename, match;
if (fileTlas.test(url)) {
match = reg.exec(url);
filename = (match && match[1]) ? match[1] : '';
}
img.name = filename || name;
img.className = className;
img.crossorigin = 'anonymous';
img.style.display = (visibility) ? 'block' : 'none';
if (parent) parent.appendChild(img);
img.src = url;
imgArray.push(img);
});
image.set({
source: imgArray,
});
results.push(name);
}
else results.push(false);
});
return results;
};
const gettableSpriteAssetAtributes = [];
const settableSpriteAssetAtributes = [];
const makeSpriteAsset = function (items) {
return new SpriteAsset(items);
};
constructors.SpriteAsset = SpriteAsset;
export {
makeSpriteAsset,
gettableSpriteAssetAtributes,
settableSpriteAssetAtributes,
importSprite,
};
