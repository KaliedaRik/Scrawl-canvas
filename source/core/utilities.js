// # Core utility functions
// A ragtag collection of helper functions which other modules can import and use

// #### Imports
import * as library from "./library.js";

// #### Functions

// __addStrings__ adds the two arguments together and returns a percentage string value if either of the values was a string; or a sum of the two numbers.
//
// Examples:
// ```
// addStrings(20, 40);
// -> 60
//    
// addStrings('20%', 40);
// -> '60%'
//  
// addStrings(20, '40%');
// -> '60%'
//  
// addStrings('20%', '40%');
// -> '60%'
//  
// addStrings('center', 3);
// -> '53%'
// ```

const addStrings = (current, delta) => {

    if (!xt(delta)) throw new Error(`core/utilities addStrings() error - no delta argument supplied ${current}, ${delta}`);

    if ((delta != null)) {

        // Correct for labels
        if ('left' === current || 'top' === current) current = '0%';
        else if ('right' === current || 'bottom' === current) current = '100%';
        else if ('center' === current) current = '50%';

        let stringFlag = (current.substring || delta.substring) ? true : false;

        if (isa_number(current)) current += (isa_number(delta) ? delta : parseFloat(delta));
        else current = parseFloat(current) + (isa_number(delta) ? delta : parseFloat(delta));

        return (stringFlag) ? current + '%' : current;
    }
    return current;
};


// __convertTime__ converts a time value into its component string suffix and (millisecond) number value properties; returns an array
//
// Examples:
// ```
// convertTime(5000);
// -> ['ms', 5000]
//    
// convertTime('50%');
// -> ['%', 50]
//  
// convertTime('5000ms'); 
// -> ['ms', 5000]
//  
// convertTime('5s');
// -> ['ms', 5000]
// ```
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


// __correctAngle__ makes sure any degree-based angle is in the range `0-360`
const correctAngle = (item) => {

    if (!item.toFixed || isNaN(item)) {

        console.log(`${item} is not a valid number`);
        return item;
    }

    if (item >= 0 && item < 360) return item;

    while (item < 0 || item >= 360) {

        if (item < 0) item += 360;
        else item -= 360;
    }
    return item;
}


// __correctForZero__ checks and corrects for minor deviations from zero (eNumbers)
const correctForZero = (item) => {

    if (!item.toFixed) return item;
    if (item == 0) return item;
    if (isNaN(item)) return 0;
    if (item < -0.000001) return item;
    if (item > 0.000001) return item;
    return 0;
};


// __λ functions__ helps us avoid errors when invoking a function attribute settable by the coder
const λnull = () => {};
const λfirstArg = function (a) { return a; };
const λthis = function () { return this; };
const λpromise = () => Promise.resolve(true);
const Ωempty = {};


// __generateUuid__ is a simple (crude) uuid generator 
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
// (imported 2017-07-08)
const generateUuid = () => {

    function s4() {

        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};


// __generateUniqueString__ is a simple random String generator
// https://gist.github.com/SimonHoiberg/ad2710c8626c5a74cddd8f6385795cc0
// (imported 2020-11-22)
const generateUniqueString = () => {

    return performance.now().toString(36) + Math.random().toString(36).substr(2);
};

// __interpolate__ clamp a value between a maximum and minimum value
const interpolate = function (val, min, max) {
    return min + val * (max - min);
};

// __isa_boolean__ checks to make sure the argument is a boolean
const isa_boolean = item => (typeof item === 'boolean') ? true : false;


// __isa_canvas__ checks to make sure the argument is a DOM &lt;canvas> element
const isa_canvas = item => (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;


// __isa_dom__ checks to make sure the argument is a DOM element of some sort
const isa_dom = item => (item && item.querySelector && item.dispatchEvent) ? true : false;


// __isa_fn__ checks to make sure the argument is a JavaScript function object
const isa_fn = item => (typeof item === 'function') ? true : false;


// __isa_number__ checks to make sure the argument is true number (excluding NaN)
const isa_number = item => (item != null && item.toFixed && !Number.isNaN(item)) ? true : false;


// __isa_obj__ checks to make sure the argument is a JavaScript Object
const isa_obj = item => (Object.prototype.toString.call(item) === '[object Object]') ? true : false;


// __isa_quaternion__ checks to make sure the argument is a Scrawl-canvas Quaternion object
const isa_quaternion = item => (item && item.type && item.type === 'Quaternion') ? true : false;


// __mergeInto__ takes two objects and merges the attributes of one into the other. This function mutates the 'original' object rather than generating a third, new onject
//
// Example:
// ```
// var original = { name: 'Peter', age: 42, job: 'lawyer' };
// var additional = { age: 32, job: 'coder', pet: 'cat' };
// scrawl.utils.mergeInto(original, additional);
//
// -> { name: 'Peter', age: 42, job: 'lawyer', pet: 'cat' }
// ```
const mergeInto = (original, additional) => {

    if (!isa_obj(original) || !isa_obj(additional)) throw new Error(`core/utilities mergeInto() error - insufficient arguments supplied ${original}, ${additional}`);

    for (let key in additional) {

        if (additional.hasOwnProperty(key) && typeof original[key] == 'undefined') original[key] = additional[key];
    }
    return original;
};


// __mergeOver__ takes two objects and writes the attributes of one over the other. This function mutates the 'original' object rather than generating a third, new onject
//
// Example:
// ```
// var original = { name: 'Peter', age: 42, job: 'lawyer' };
// var additional = { age: 32, job: 'coder', pet: 'cat' };
// scrawl.utils.mergeOver(original, additional);
//
// -> { name: 'Peter', age: 32, job: 'coder', pet: 'cat' }
// ```
const mergeOver = (original, additional) => {

    if (!isa_obj(original) || !isa_obj(additional)) throw new Error(`core/utilities mergeOver() error - insufficient arguments supplied ${original}, ${additional}`);

    for (let key in additional) {

        if (additional.hasOwnProperty(key)) original[key] = additional[key];
    }
    return original;
};


// __mergeDiscard__ iterates over the additional object to perform a mergeOver operation, and also removing attributes from the original object where they have been set to null in the additional object
//
// Example:
// ```
// var original = { name: 'Peter', age: 42, job: 'lawyer' };
// var additional = { age: 32, job: null, pet: 'cat' };
// scrawl.utils.mergeOver(original, additional);
//    
// -> { name: 'Peter', age: 32, pet: 'cat' }
// ```
const mergeDiscard = (original, additional) => {

    if (!isa_obj(original) || !isa_obj(additional)) throw new Error(`core/utilities mergeDiscard() error - insufficient arguments supplied ${original}, ${additional}`);

    Object.entries(additional).forEach(([key, val]) => {

        if (val === null) delete original[key];
        else original[key] = additional[key];
    });
    return original;
};


// __pushUnique__ adds a value to the end of an array, if that value is not already present in the array. This function mutates the array
//
// Example:
// ```
// var myarray = ['apple', 'orange'];
// scrawl.utils.pushUnique(myarray, 'apple');    
// -> ['apple', 'orange']
//
// scrawl.utils.pushUnique(myarray, 'banana');
// -> ['apple', 'orange', 'banana']
// ```
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


// __removeItem__ removes a value from an array. This function mutates the array
//
// Example:
// ```
// var myarray = ['apple', 'orange'];
// scrawl.utils.removeItem(myarray, 'banana');   
// -> ['apple', 'orange']
//
// scrawl.utils.removeItem(myarray, 'apple');    
// -> ['orange']
// ```
const removeItem = (myArray, unwantedMember) => {

    if (!xta(myArray, unwantedMember)) throw new Error(`core/utilities removeItem() error - insufficient arguments supplied ${myArray}, ${unwantedMember}`);

    if (!Array.isArray(myArray)) throw new Error(`core/utilities removeItem() error - argument not an array ${myArray}`);

    let index = myArray.indexOf(unwantedMember);

    if (index >= 0) myArray.splice(index, 1);

    return myArray;
};


// __xt__ checks to see if argument exists (is not 'undefined')
const xt = item => (typeof item == 'undefined') ? false : true;


// __xta__ checks to make sure that all the arguments supplied to the function exist (none are 'undefined')
const xta = (...args) => args.every(item => typeof item != 'undefined');


// __xtGet__ returns the first existing (not 'undefined') argument supplied to the function
const xtGet = (...args) => args.find(item => typeof item != 'undefined');


// __xto__ checks to make sure that at least one of the arguments supplied to the function exists (is not 'undefined')
const xto = (...args) => (args.find(item => typeof item != 'undefined')) ? true : false;


// ##### Easing engines
// `easeEngines` - an object in which keys define various easing functions
const easeEngines = {

// Legacy easings
    out: (t) => 1 - Math.cos((t * Math.PI) / 2),
    in: (t) => Math.sin((t * Math.PI) / 2),
    easeIn: (t) => {
        
        let temp = 1 - t;
        return 1 - (temp * temp);
    },
    easeIn3: (t) => {

        let temp = 1 - t;
        return 1 - (temp * temp * temp);
    },
    easeIn4: (t) => {

        let temp = 1 - t;
        return 1 - (temp * temp * temp * temp);
    },
    easeIn5: (t) => {

        let temp = 1 - t;
        return 1 - (temp * temp * temp * temp * temp);
    },
    easeOutIn: (t) => (t < 0.5) ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeOutIn3: (t) => (t < 0.5) ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutIn4: (t) => (t < 0.5) ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
    easeOutIn5: (t) => (t < 0.5) ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

    easeInOut: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-2 * tin * tin);
        return 0.5 + Math.pow(2 * tout, 2) / 2;
    },
    easeInOut3: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-4 * tin * tin * tin);
        return 0.5 + Math.pow(2 * tout, 3) / 2;
    },
    easeInOut4: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-8 * tin * tin * tin * tin);
        return 0.5 + Math.pow(2 * tout, 4) / 2;
    },
    easeInOut5: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-16 * tin * tin * tin * tin * tin);
        return 0.5 + Math.pow(2 * tout, 5) / 2;
    },

    easeOut: (t) => t * t,
    easeOut3: (t) => t * t * t,
    easeOut4: (t) => t * t * t * t,
    easeOut5: (t) => t * t * t * t * t,

    none: (val) => val,
    linear: (val) => val,

    // Noise functionality easing engines
    cosine: (t) => .5 * (1 + Math.cos((1 - t) * Math.PI)),
    hermite: (t) => t * t * (-t * 2 + 3),
    quintic: (t) => t * t * t * (t * (t * 6 - 15) + 10),

// The following easing variations come from the [easings.net](https://easings.net/) web page
// + Note: the naming convention for easing is different in Scrawl-canvas. Easing out implies a speeding up, while easing in implies a slowing down. Think of a train easing into a station, and then easing out of it again as it continues its journey. 
    easeOutSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeInSine: (t) => Math.sin((t * Math.PI) / 2),
    easeOutInSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

    easeOutQuad: (t) => t * t,
    easeInQuad: (t) => 1 - ((1 - t) * (1 - t)),
    easeOutInQuad: (t) => (t < 0.5) ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

    easeOutCubic: (t) => t * t * t,
    easeInCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeOutInCubic: (t) => (t < 0.5) ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

    easeOutQuart: (t) => t * t * t * t,
    easeInQuart: (t) => 1 - Math.pow(1 - t, 4),
    easeOutInQuart: (t) => (t < 0.5) ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,

    easeOutQuint: (t) => t * t * t * t * t,
    easeInQuint: (t) => 1 - Math.pow(1 - t, 5),
    easeOutInQuint: (t) => (t < 0.5) ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

    easeOutExpo: (t) => (t === 0) ? 0 : Math.pow(2, 10 * t - 10),
    easeInExpo: (t) => (t === 1) ? 1 : 1 - Math.pow(2, -10 * t),
    easeOutInExpo: (t) => {
        if (t === 0 || t === 1) return t;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },

    easeOutCirc: (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
    easeInCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
    easeOutInCirc: (t) => { 

        if (t < 0.5) return (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2;
        return (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
    },

    easeOutBack: (t) => (2.70158 * t * t * t) - (1.70158 * t * t),
    easeInBack: (t) => 1 + (2.70158 * Math.pow(t - 1, 3)) + (1.70158 * Math.pow(t - 1, 2)),
    easeOutInBack: (t) => {

        const c1 = 1.70158, c2 = c1 * 1.525;
        if (t < 0.5) return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
        return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },

    easeOutElastic: (t) => {

        const c4 = (2 * Math.PI) / 3;
        if (t === 0 || t === 1) return t;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeInElastic: (t) => {

        const c4 = (2 * Math.PI) / 3;
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeOutInElastic: (t) => {

        const c5 = (2 * Math.PI) / 4.5;
        if (t === 0 || t === 1) return t;
        if (t < 0.5) return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
        return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },

    easeOutBounce: (t) => {

        t = 1 - t;

        const n1 = 7.5625, 
            d1 = 2.75;

        if (t < 1 / d1) return 1 - (n1 * t * t);
        if (t < 2 / d1) return 1 - (n1 * (t -= 1.5 / d1) * t + 0.75);
        if (t < 2.5 / d1) return 1 - (n1 * (t -= 2.25 / d1) * t + 0.9375);
        return 1 - (n1 * (t -= 2.625 / d1) * t + 0.984375);
    },

    easeInBounce: (t) => {

        const n1 = 7.5625, 
            d1 = 2.75;

        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },

// This is wrong
    easeOutInBounce: (t) => {

        const n1 = 7.5625, d1 = 2.75;
        let res;

        if (t < 0.5) {
            t = 1 - 2 * t;
            if (t < 1 / d1) res = n1 * t * t;
            else if (t < 2 / d1) res = n1 * (t -= 1.5 / d1) * t + 0.75;
            else if (t < 2.5 / d1) res = n1 * (t -= 2.25 / d1) * t + 0.9375;
            else res = n1 * (t -= 2.625 / d1) * t + 0.984375;
            return (1 - res) / 2;
        }
        else {
            t = 2 * t - 1;
            if (t < 1 / d1) res = n1 * t * t;
            else if (t < 2 / d1) res = n1 * (t -= 1.5 / d1) * t + 0.75;
            else if (t < 2.5 / d1) res = n1 * (t -= 2.25 / d1) * t + 0.9375;
            else res = n1 * (t -= 2.625 / d1) * t + 0.984375;
            return (1 + res) / 2;
        }
    },
};


const getArrayType = someObject => someObject && someObject.constructor && someObject.constructor.name && someObject.constructor.name || null;


// Code to detect browser from Code Box: https://code-boxx.com/detect-browser-with-javascript/
// + Because there's times when it's easier to just shut down features in webkit-based browsers than deal with their nonsense (looking at you: Safari!)
const detectBrowser = function () {

    let result = [];

    if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) result.push('old-opera');

    if (typeof InstallTrigger !== 'undefined') result.push('firefox');

    else if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))) result.push('safari');

    if (/*@cc_on!@*/false || !!document.documentMode) result.push('internet-explorer');

    if (result.indexOf('internet-explorer') < 0 && !!window.StyleMedia) result.push('edge');

    if(!!window.chrome) result.push('chrome');

    if((result.indexOf('chrome') >= 0 || result.indexOf('old-opera') >= 0) && !!window.CSS) result.push('blink');

    return result;
};


// #### Exports
export {
    addStrings,
    convertTime,
    correctAngle,
    correctForZero,
    λnull,
    λfirstArg,
    λthis,
    λpromise,
    Ωempty,
    generateUuid,
    generateUniqueString,
    interpolate,
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

    easeEngines,

    getArrayType,

    detectBrowser,
};

