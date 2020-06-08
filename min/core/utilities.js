import * as library from "./library.js";
const addStrings = (current, delta) => {
if (!xt(delta)) throw new Error(`core/utilities addStrings() error - no delta argument supplied ${current}, ${delta}`);
if ((delta != null)) {
let stringFlag = (current.substring || delta.substring) ? true : false;
if (isa_number(current)) current += (isa_number(delta) ? delta : parseFloat(delta));
else current = parseFloat(current) + (isa_number(delta) ? delta : parseFloat(delta));
return (stringFlag) ? current + '%' : current;
}
return current;
};
const convertTime = (item) => {
let a, timeUnit, timeValue;
if (!xt(item)) throw new Error(`core/utilities convertTime() error - no argument supplied`);
if (isa_number(item)) return ['ms', item];
if (!item.substring) throw new Error(`core/utilities convertTime() error - invalid argument: ${item}`);
a = item.match(/^\d+\.?\d*(\D*)/);
timeUnit = (a[1].toLowerCase) ? a[1].toLowerCase() : 'ms';
timeValue = parseFloat(item);
if (!isa_number(timeValue)) throw new Error(`core/base error - convertTime() argument converts to NaN: ${item}`);
switch (timeUnit) {
case 's':
timeValue *= 1000;
break;
case '%':
break;
default:
timeUnit = 'ms';
}
return [timeUnit, timeValue];
};
const λnull = () => {};
const λthis = function () { return this; };
const λpromise = () => Promise.resolve(true);
const generateUuid = () => {
function s4() {
return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
const isa_boolean = item => (typeof item === 'boolean') ? true : false;
const isa_canvas = item => (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;
const isa_dom = item => (item && item.querySelector && item.dispatchEvent) ? true : false;
const isa_fn = item => (typeof item === 'function') ? true : false;
const isa_number = item => (typeof item != 'undefined' && item.toFixed && !Number.isNaN(item)) ? true : false;
const isa_obj = item => (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
const isa_quaternion = item => (item && item.type && item.type === 'Quaternion') ? true : false;
const mergeInto = (original, additional) => {
if (!isa_obj(original) || !isa_obj(additional)) throw new Error(`core/utilities mergeInto() error - insufficient arguments supplied ${original}, ${additional}`);
for (let key in additional) {
if (additional.hasOwnProperty(key) && typeof original[key] == 'undefined') original[key] = additional[key];
}
return original;
};
const mergeOver = (original, additional) => {
if (!isa_obj(original) || !isa_obj(additional)) throw new Error(`core/utilities mergeOver() error - insufficient arguments supplied ${original}, ${additional}`);
for (let key in additional) {
if (additional.hasOwnProperty(key)) original[key] = additional[key];
}
return original;
};
const mergeDiscard = (original, additional) => {
if (!isa_obj(original) || !isa_obj(additional)) throw new Error(`core/utilities mergeDiscard() error - insufficient arguments supplied ${original}, ${additional}`);
Object.entries(additional).forEach(([key, val]) => {
if (val === null) delete original[key];
else original[key] = additional[key];
});
return original;
};
const pushUnique = (myArray, potentialMember) => {
if (!xta(myArray, potentialMember)) throw new Error(`core/utilities pushUnique() error - insufficient arguments supplied ${myArray}, ${potentialMember}`);
if (!Array.isArray(myArray)) throw new Error(`core/utilities pushUnique() error - argument not an array ${myArray}`);
if (Array.isArray(potentialMember)) {
potentialMember.forEach(item => pushUnique(myArray, item));
}
else {
if (myArray.indexOf(potentialMember) < 0) myArray.push(potentialMember);
}
return myArray;
};
const removeItem = (myArray, unwantedMember) => {
if (!xta(myArray, unwantedMember)) throw new Error(`core/utilities removeItem() error - insufficient arguments supplied ${myArray}, ${unwantedMember}`);
if (!Array.isArray(myArray)) throw new Error(`core/utilities removeItem() error - argument not an array ${myArray}`);
let index = myArray.indexOf(unwantedMember);
if (index >= 0) myArray.splice(index, 1);
return myArray;
};
const xt = item => (typeof item == 'undefined') ? false : true;
const xta = (...args) => args.every(item => typeof item != 'undefined');
const xtGet = (...args) => args.find(item => typeof item != 'undefined');
const xto = (...args) => (args.find(item => typeof item != 'undefined')) ? true : false;
export {
addStrings,
convertTime,
λnull,
λthis,
λpromise,
generateUuid,
isa_boolean,
isa_canvas,
isa_dom,
isa_fn,
isa_number,
isa_obj,
isa_quaternion,
mergeDiscard,
mergeInto,
mergeOver,
pushUnique,
removeItem,
xt,
xta,
xtGet,
xto,
};
