import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, xt, defaultNonReturnFunction } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import tweenMix from '../mixin/tween.js';
const Action = function (items = {}) {
this.makeName(items.name);
this.register();
this.set(this.defs);
this.set(items);
this.calculateEffectiveTime();
if (xt(items.ticker)) this.addToTicker(items.ticker);
return this;
};
let P = Action.prototype = Object.create(Object.prototype);
P.type = 'Action';
P.lib = 'tween';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
P = tweenMix(P);
let defaultAttributes = {
revert: null
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['targets']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, []);
P.packetFunctions = pushUnique(P.packetFunctions, ['revert', 'action']);
P.finalizePacketOut = function (copy, items) {
if (Array.isArray(this.targets)) copy.targets = this.targets.map(t => t.name);
return copy;
};
let S = P.setters;
S.revert = function (item) {
this.revert = item;
if (typeof this.revert !== 'function') this.revert = defaultNonReturnFunction;
};
S.triggered = function (item) {
if (this.triggered !== item) {
if (item) this.action();
else this.revert();
this.triggered = item;
}
};
P.set = function (items = {}) {
if (items) {
let setters = this.setters,
defs = this.defs,
ticker = (xt(items.ticker)) ? this.ticker : false;
Object.entries(items).forEach(([key, value]) => {
if (key !== 'name') {
let predefined = setters[key];
if (predefined) predefined.call(this, value);
else if (typeof defs[key] !== 'undefined') this[key] = value;
}
}, this);
if (ticker) {
this.ticker = ticker;
this.addToTicker(items.ticker);
}
else if (xt(items.time)) this.calculateEffectiveTime();
}
return this;
};
P.getEndTime = function () {
return this.effectiveTime;
};
P.update = function (items) {
let reversed = this.reversed,
effectiveTime = this.effectiveTime,
triggered = this.triggered,
reverseOnCycleEnd = this.reverseOnCycleEnd,
tick = items.tick,
reverseTick = items.reverseTick,
willLoop = items.willLoop,
next = items.next;
if (reversed) {
if (reverseTick >= effectiveTime) {
if (!triggered) {
this.action();
this.triggered = true;
}
}
else {
if (triggered) {
this.revert();
this.triggered = false;
}
}
}
else {
if (tick >= effectiveTime) {
if (!triggered) {
this.action();
this.triggered = true;
}
}
else {
if (triggered) {
this.revert();
this.triggered = false;
}
}
}
if (willLoop) this.triggered = !this.triggered;
return true;
};
const makeAction = function (items) {
return new Action(items);
};
constructors.Action = Action;
export {
makeAction,
};
