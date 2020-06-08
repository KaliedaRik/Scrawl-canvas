import { mergeOver, mergeDiscard, xt } from '../core/utilities.js';
export default function (P = {}) {
let defaultAttributes = {
delta: null,
noDeltaUpdates: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);
mergeOver(P, defaultAttributes);
let S = P.setters,
D = P.deltaSetters;
S.delta = function (items = {}) {
if (items) this.delta = mergeDiscard(this.delta, items);
};
P.updateByDelta = function () {
this.setDelta(this.delta);
return this;
};
P.reverseByDelta = function () {
let temp = {};
Object.entries(this.delta).forEach(([key, val]) => {
if (val.substring) val = -(parseFloat(val)) + '%';
else val = -val;
temp[key] = val;
});
this.setDelta(temp);
return this;
};
P.setDeltaValues = function (items = {}) {
let delta = this.delta,
oldVal, action;
Object.entries(items).forEach(([key, requirement]) => {
if (xt(delta[key])) {
action = requirement;
oldVal = delta[key];
switch (action) {
case 'reverse' :
if (oldVal.toFixed) delta[key] = -oldVal;
break;
case 'zero' :
if (oldVal.toFixed) delta[key] = 0;
break;
case 'add' :
break;
case 'subtract' :
break;
case 'multiply' :
break;
case 'divide' :
break;
}
}
})
return this;
};
return P;
};
