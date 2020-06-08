import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shapeBasic.js';
const Shape = function (items = {}) {
this.shapeInit(items);
return this;
};
let P = Shape.prototype = Object.create(Object.prototype);
P.type = 'Shape';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = shapeMix(P);
let defaultAttributes = {};
P.defs = mergeOver(P.defs, defaultAttributes);
P.cleanSpecies = function () {
this.dirtySpecies = false;
};
P.cleanStampHandlePositionsAdditionalActions = function () {
let box = this.localBox,
stampHandle = this.currentStampHandlePosition;
stampHandle[0] += box[0];
stampHandle[1] += box[1];
};
const makeShape = function (items) {
return new Shape(items);
};
constructors.Shape = Shape;
export {
makeShape,
};
