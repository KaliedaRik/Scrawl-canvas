import { constructors, cell, entity } from '../core/library.js';
import { mergeOver, pushUnique, isa_fn, isa_obj } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import assetConsumerMix from '../mixin/assetConsumer.js';
const Pattern = function (items = {}) {
this.makeName(items.name);
this.register();
this.set(this.defs);
this.set(items);
return this;
};
let P = Pattern.prototype = Object.create(Object.prototype);
P.type = 'Pattern';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
P = assetConsumerMix(P);
let defaultAttributes = {
repeat: 'repeat',
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetObjects = pushUnique(P.packetObjects, ['asset']);
P.kill = function () {
let myname = this.name;
if (isa_obj(this.asset)) this.asset.unsubscribe(this);
Object.entries(entity).forEach(([name, ent]) => {
let state = ent.state;
if (state) {
let fill = state.fillStyle,
stroke = state.strokeStyle;
if (isa_obj(fill) && fill.name === myname) state.fillStyle = state.defs.fillStyle;
if (isa_obj(stroke) && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
}
});
this.deregister();
return this;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
P.repeatValues = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']
S.repeat = function (item) {
if (this.repeatValues.indexOf(item) >= 0) this.repeat = item;
else this.repeat = this.defs.repeat;
};
P.buildStyle = function (mycell = {}) {
if (this.sourceLoaded && mycell) {
let engine = false;
if (mycell.substring) {
let realcell = cell[mycell];
if (realcell && realcell.engine) engine = realcell.engine;
}
else if (mycell.engine) engine = mycell.engine;
if (engine) return engine.createPattern(this.source, this.repeat);
}
return 'rgba(0,0,0,0)';
};
P.getData = function (entity, cell) {
if (this.dirtyAsset) this.cleanAsset();
this.asset.checkSource(this.sourceNaturalWidth, this.sourceNaturalHeight);
return this.buildStyle(cell);
};
const makePattern = function (items) {
return new Pattern(items);
};
constructors.Pattern = Pattern;
export {
makePattern,
};
