import { animation, artefact, constructors } from '../core/library.js';
import { clear, compile, show } from '../core/document.js';
import { makeAnimationObserver } from '../core/events.js';
import { mergeOver, pushUnique, removeItem, xt, λnull, λthis } from '../core/utilities.js';
import { animate, resortAnimations } from '../core/animationloop.js';
import baseMix from '../mixin/base.js';
const RenderAnimation = function (items = {}) {
let target;
if (!items.target) target = {
clear: clear,
compile: compile,
show: show
};
else if (Array.isArray(items.target)) {
let multiReturn = []
items.target.forEach(tempTarget => {
let tempItems = Object.assign({}, items);
tempItems.name = `${tempItems.name}_${tempTarget.name}`;
tempItems.target = tempTarget;
multiReturn.push(new RenderAnimation(tempItems));
});
return multiReturn;
}
else target = (items.target.substring) ? artefact[items.target] : items.target;
if (!target || !target.clear || !target.compile || !target.show) return false;
this.makeName(items.name);
this.order = (xt(items.order)) ? items.order : this.defs.order;
this.onRun = items.onRun || λnull;
this.onHalt = items.onHalt || λnull;
this.onKill = items.onKill || λnull;
this.target = target;
this.commence = items.commence || λnull;
this.afterClear = items.afterClear || λnull;
this.afterCompile = items.afterCompile || λnull;
this.afterShow = items.afterShow || λnull;
this.afterCreated = items.afterCreated || λnull;
this.error = items.error || λnull;
this.readyToInitialize = true;
let self = this;
this.fn = function () {
return new Promise((resolve, reject) => {
Promise.resolve(self.commence())
.then(() => self.target.clear())
.then(() => Promise.resolve(self.afterClear()))
.then(() => self.target.compile())
.then(() => Promise.resolve(self.afterCompile()))
.then(() => self.target.show())
.then(() => Promise.resolve(self.afterShow()))
.then(() => {
if (self.readyToInitialize) {
self.afterCreated();
self.readyToInitialize = false;
}
resolve(true);
})
.catch(err => {
self.error(err);
reject(err);
});
});
}
this.register();
if (items.observer) this.observer = makeAnimationObserver(this, this.target);
if(!items.delay) this.run();
return this;
};
let P = RenderAnimation.prototype = Object.create(Object.prototype);
P.type = 'RenderAnimation';
P.lib = 'animation';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
let defaultAttributes = {
order: 1,
onRun: null,
onHalt: null,
onKill: null,
commence: null,
afterClear: null,
afterCompile: null,
afterShow: null,
afterCreated: null,
error: null,
target: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.saveAsPacket = function () {
return `[${this.name}, ${this.type}, ${this.lib}, {}]`
};
P.clone = λthis;
P.kill = function () {
this.onKill();
removeItem(animate, this.name);
resortAnimations();
this.deregister();
return true;
};
P.run = function () {
this.onRun();
pushUnique(animate, this.name);
resortAnimations();
return this;
};
P.isRunning = function () {
return (animate.indexOf(this.name) >= 0) ? true : false;
};
P.halt = function () {
this.onHalt();
removeItem(animate, this.name);
resortAnimations();
return this;
};
const makeRender = function (items) {
return new RenderAnimation(items);
};
constructors.RenderAnimation = RenderAnimation;
export {
makeRender,
};
