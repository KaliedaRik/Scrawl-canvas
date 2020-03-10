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
const capitalize = (s) => {
if (typeof s !== 'string') return ''
return s.charAt(0).toUpperCase() + s.slice(1)
}
const convertLength = (val, len) => {
if (!xt(val)) throw new Error(`core/base error - convertLength() bad value argument: ${val}`);
if (!isa_number(len)) throw new Error(`core/base error - convertLength() bad length argument: ${len}`);
if (isa_number(val)) return val;
else {
switch(val){
case 'top' :
case 'left' :
return 0;
case 'bottom' :
case 'right' :
return len;
case 'center' :
return len / 2;
default :
val = parseFloat(val);
if (!isa_number(val)) throw new Error(`core/base error - convertLength() value converst to NaN: ${val}`);
return ( val / 100) * len;
}
}
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
const defaultNonReturnFunction = () => {};
const defaultArgReturnFunction = (a) => a;
const defaultThisReturnFunction = function () { return this; };
const defaultFalseReturnFunction = () => false;
const defaultZeroReturnFunction = () => 0;
const defaultBlankStringReturnFunction = () => '';
const defaultPromiseReturnFunction = () => Promise.resolve(true);
const ensureInteger = (val) => {
val = parseInt(val, 10);
if (!isa_number(val)) val = 0;
return val;
};
const ensurePositiveInteger = (val) => {
val = parseInt(val, 10);
if (!isa_number(val)) val = 0;
return Math.abs(val);
};
const ensureFloat = (val, precision) => {
val = parseFloat(val);
if (!isa_number(val)) val = 0;
if (!isa_number(precision)) precision = 0;
return parseFloat(val.toFixed(precision));
};
const ensurePositiveFloat = (val, precision) => {
val = parseFloat(val);
if (!isa_number(val)) val = 0;
if (!isa_number(precision)) precision = 0;
return Math.abs(parseFloat(val.toFixed(precision)));
};
const ensureString = (val) => {
return (val.substring) ? val : val.toString;
};
const generateUuid = () => {
function s4() {
return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
const isa_boolean = item => (typeof item === 'boolean') ? true : false;
const isa_canvas = item => (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;
const isa_dom = item => (item && item.querySelector && item.dispatchEvent) ? true : false;
const isa_engine = item => (item && item.quadraticCurveTo) ? true : false;
const isa_fn = item => (typeof item === 'function') ? true : false;
const isa_img = item => (Object.prototype.toString.call(item) === '[object HTMLImageElement]') ? true : false;
const isa_number = item => (typeof item != 'undefined' && item.toFixed && !Number.isNaN(item)) ? true : false;
const isa_obj = item => (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
const isa_quaternion = item => (item && item.type && item.type === 'Quaternion') ? true : false;
const isa_str = item => (item && item.substring) ? true : false;
const isa_vector = item => (item && item.type && item.type === 'Vector') ? true : false;
const isa_video = item => (Object.prototype.toString.call(item) === '[object HTMLVideoElement]') ? true : false;
const locateTargetSections = ['artefact', 'group', 'animation', 'tween', 'styles'];
const locateTarget = (item) => {
if(item && item.substring){
let result;
return (locateTargetSections.some(section => {
result = library[section][item];
return result;
})) ? result : false;
}
return false;
};
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
const btoaUTF16 = function (sString) {
console.log(sString.length, sString)
sString = sString.replace(/\0/g, '');
console.log(sString.length)
let aUTF16CodeUnits = new Uint16Array(sString.length);
Array.prototype.forEach.call(aUTF16CodeUnits, function (el, idx, arr) {
arr[idx] = sString.charCodeAt(idx);
});
let result = btoa(String.fromCharCode.apply(null, new Uint8Array(aUTF16CodeUnits.buffer)));
console.log(result)
console.log(atobUTF16(result))
return result;
};
const atobUTF16 = function (sBase64) {
let sBinaryString = atob(sBase64),
aBinaryView = new Uint8Array(sBinaryString.length);
Array.prototype.forEach.call(aBinaryView, function (el, idx, arr) {
arr[idx] = sBinaryString.charCodeAt(idx);
});
return String.fromCharCode.apply(null, new Uint16Array(aBinaryView.buffer));
};
export {
addStrings,
convertLength,
capitalize,
convertTime,
defaultNonReturnFunction,
defaultArgReturnFunction,
defaultThisReturnFunction,
defaultFalseReturnFunction,
defaultZeroReturnFunction,
defaultBlankStringReturnFunction,
defaultPromiseReturnFunction,
ensureInteger,
ensurePositiveInteger,
ensureFloat,
ensurePositiveFloat,
ensureString,
generateUuid,
isa_boolean,
isa_canvas,
isa_dom,
isa_engine,
isa_fn,
isa_img,
isa_number,
isa_obj,
isa_quaternion,
isa_str,
isa_vector,
isa_video,
locateTarget,
mergeDiscard,
mergeInto,
mergeOver,
pushUnique,
removeItem,
xt,
xta,
xtGet,
xto,
atobUTF16,
btoaUTF16,
};
