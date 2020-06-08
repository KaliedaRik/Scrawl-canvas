import { artefact } from '../core/library.js';
import { mergeOver, pushUnique, isa_boolean } from '../core/utilities.js';
export default function (P = {}) {
let defaultAttributes = {
mimic: '',
useMimicDimensions: false,
useMimicScale: false,
useMimicStart: false,
useMimicHandle: false,
useMimicOffset: false,
useMimicRotation: false,
useMimicFlip: false,
addOwnDimensionsToMimic: false,
addOwnScaleToMimic: false,
addOwnStartToMimic: false,
addOwnHandleToMimic: false,
addOwnOffsetToMimic: false,
addOwnRotationToMimic: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
mergeOver(P, defaultAttributes);
P.packetObjects = pushUnique(P.packetObjects, ['mimic']);
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.mimic = function (item) {
if (isa_boolean(item) && !item) {
this.mimic = null;
if (this.lockTo[0] === 'mimic') this.lockTo[0] = 'start';
if (this.lockTo[1] === 'mimic') this.lockTo[1] = 'start';
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
else {
let oldMimic = this.mimic,
newMimic = (item.substring) ? artefact[item] : item,
name = this.name;
if (newMimic && newMimic.name) {
if (oldMimic && oldMimic.name !== newMimic.name) removeItem(oldMimic.mimicked, name);
pushUnique(newMimic.mimicked, name);
this.mimic = newMimic;
this.dirtyStampPositions = true;
this.dirtyStampHandlePositions = true;
}
}
};
S.useMimicDimensions = function (item) {
this.useMimicDimensions = item;
this.dirtyDimensions = true;
};
S.useMimicScale = function (item) {
this.useMimicScale = item;
this.dirtyScale = true;
};
S.useMimicStart = function (item) {
this.useMimicStart = item;
this.dirtyStart = true;
};
S.useMimicHandle = function (item) {
this.useMimicHandle = item;
this.dirtyHandle = true;
};
S.useMimicOffset = function (item) {
this.useMimicOffset = item;
this.dirtyOffset = true;
};
S.useMimicRotation = function (item) {
this.useMimicRotation = item;
this.dirtyRotation = true;
};
S.addOwnDimensionsToMimic = function (item) {
this.addOwnDimensionsToMimic = item;
this.dirtyDimensions = true;
};
S.addOwnScaleToMimic = function (item) {
this.addOwnScaleToMimic = item;
this.dirtyScale = true;
};
S.addOwnStartToMimic = function (item) {
this.addOwnStartToMimic = item;
this.dirtyStart = true;
};
S.addOwnHandleToMimic = function (item) {
this.addOwnHandleToMimic = item;
this.dirtyHandle = true;
};
S.addOwnOffsetToMimic = function (item) {
this.addOwnOffsetToMimic = item;
this.dirtyOffset = true;
};
S.addOwnRotationToMimic = function (item) {
this.addOwnRotationToMimic = item;
this.dirtyRotation = true;
};
P.updateMimicSubscribers = function () {
let DMH = this.dirtyMimicHandle;
let DMO = this.dirtyMimicOffset;
let DMR = this.dirtyMimicRotation;
let DMS = this.dirtyMimicScale;
let DMD = this.dirtyMimicDimensions;
this.mimicked.forEach(name => {
let instance = artefact[name];
if (instance) {
if (instance.useMimicStart) instance.dirtyStart = true;
if (DMH && instance.useMimicHandle) instance.dirtyHandle = true;
if (DMO && instance.useMimicOffset) instance.dirtyOffset = true;
if (DMR && instance.useMimicRotation) instance.dirtyRotation = true;
if (DMS && instance.useMimicScale) instance.dirtyScale = true;
if (DMD && instance.useMimicDimensions) instance.dirtyDimensions = true;
}
});
this.dirtyMimicHandle = false;
this.dirtyMimicOffset = false;
this.dirtyMimicRotation = false;
this.dirtyMimicScale = false;
this.dirtyMimicDimensions = false;
};
return P;
};
