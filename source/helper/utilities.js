// # Core utility functions
// A ragtag collection of helper functions which other modules can import and use


import { _cos, _create, _entries, _floor, _freeze, _isArray, _isFinite, _pi, _pow, _random, _sin, _sqrt, $CANVAS_ELEMENT, $OBJECT, BOOLEAN, BOTTOM, CENTER, FUNCTION, LEFT, MS, PC, PC0, PC100, PC50, RIGHT, T_QUATERNION, TOP, UNDEF } from './shared-vars.js';


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
export const addStrings = (current, delta) => {

    if ((delta != null)) {

        // Correct for labels
        if (LEFT == current || TOP == current) current = PC0;
        else if (RIGHT == current || BOTTOM == current) current = PC100;
        else if (CENTER == current) current = PC50;

        const stringFlag = (current.substring || delta.substring) ? true : false;

        if (isa_number(current)) current += (isa_number(delta) ? delta : parseFloat(delta));
        else current = parseFloat(current) + (isa_number(delta) ? delta : parseFloat(delta));

        return (stringFlag) ? current + PC : current;
    }
    return current;
};


// __constrain__ - clamps a value between a minimum and maximum value
export const constrain = function (val, min, max) {

    if (val < min) return min;
    if (val > max) return max;
    return val;
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
export const convertTime = (item) => {

    if (isa_number(item)) return [MS, item];

    if (item.substring) {

        const a = item.match(/^\d+\.?\d*(\D*)/);
        let timeUnit = (a[1].toLowerCase) ? a[1].toLowerCase() : MS;

        let timeValue = parseFloat(item);

        if (_isFinite(timeValue)) {

            switch (timeUnit) {

                case 's':
                    timeValue *= 1000;
                    break;

                case '%':
                    break;

                default:
                    timeUnit = MS;
            }

            return [timeUnit, timeValue];
        }
        return [MS, 0];
    }
};


// __correctAngle__ makes sure any degree-based angle is in the range `0-360`
export const correctAngle = (item) => {

    if (!_isFinite(item)) return 0;

    item = item % 360;

    if (item < 0) item += 360;

    return item;
};


// __correctForZero__ checks and corrects for minor deviations from zero (eNumbers)
export const correctForZero = (item) => {

    if (_isFinite(item)) {

        if (item < -0.000001) return item;
        if (item > 0.000001) return item;
    }
    return 0;
};


// __λ functions__ helps us avoid errors when invoking a function attribute settable by the coder
export const λnull = () => {};
export const λfirstArg = function (a) { return a; };
export const λthis = function () { return this; };
export const λpromise = () => Promise.resolve(true);
export const Ωempty = _freeze({});


// __generateUuid__ is a simple (crude) uuid generator
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
// (imported 2017-07-08)
export const generateUuid = () => {

    function s4() {

        return _floor((1 + _random()) * 0x10000).toString(16).substring(1);
    }

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};


// __generateUniqueString__ is a simple random String generator
// https://gist.github.com/SimonHoiberg/ad2710c8626c5a74cddd8f6385795cc0
// (imported 2020-11-22)
export const generateUniqueString = () => {

    return performance.now().toString(36) + _random().toString(36).substr(2);
};

// __interpolate__ clamp a value between a maximum and minimum value
export const interpolate = function (val, min, max) {

    return min + val * (max - min);
};

// __isa_boolean__ checks to make sure the argument is a boolean
export const isa_boolean = item => (typeof item == BOOLEAN) ? true : false;


// __isa_canvas__ checks to make sure the argument is a DOM &lt;canvas> element
export const isa_canvas = item => (Object.prototype.toString.call(item) == $CANVAS_ELEMENT) ? true : false;


// __isa_dom__ checks to make sure the argument is a DOM element of some sort
export const isa_dom = item => (item && item.querySelector && item.dispatchEvent) ? true : false;


// __isa_fn__ checks to make sure the argument is a JavaScript function object
export const isa_fn = item => (typeof item == FUNCTION) ? true : false;


// __isa_number__ checks to make sure the argument is true number (excluding NaN)
export const isa_number = item => (_isFinite(item)) ? true : false;


// __isa_obj__ checks to make sure the argument is a JavaScript Object
export const isa_obj = item => (Object.prototype.toString.call(item) == $OBJECT) ? true : false;


// __isa_quaternion__ checks to make sure the argument is a Scrawl-canvas Quaternion object
export const isa_quaternion = item => (item && item.type && item.type == T_QUATERNION) ? true : false;


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
export const mergeOver = (original, additional) => {

    if (isa_obj(original) && isa_obj(additional)) {

        for (const key in additional) {

/* eslint-disable-next-line */
            if (additional.hasOwnProperty(key)) original[key] = additional[key];
        }
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
export const mergeDiscard = (original, additional) => {

    if (isa_obj(original) && isa_obj(additional)) {

        _entries(additional).forEach(([key, val]) => {

            if (val === null) delete original[key];
            else original[key] = additional[key];
        });
    }
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
export const pushUnique = (myArray, potentialMember) => {

    if (_isArray(myArray)) {

        if (_isArray(potentialMember)) {

            potentialMember.forEach(item => pushUnique(myArray, item));
        }
        else {

            if (!myArray.includes(potentialMember)) myArray.push(potentialMember);
        }
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
export const removeItem = (myArray, unwantedMember) => {

    if (_isArray(myArray)) {

        const index = myArray.indexOf(unwantedMember);

        if (index >= 0) myArray.splice(index, 1);

    }
    return myArray;
};


// __xt__ checks to see if argument exists (is not 'undefined')
export const xt = item => (typeof item == UNDEF) ? false : true;


// __xta__ checks to make sure that all the arguments supplied to the function exist (none are 'undefined')
export const xta = (...args) => args.every(item => typeof item != UNDEF);


// __xtGet__ returns the first existing (not 'undefined') argument supplied to the function
export const xtGet = (...args) => args.find(item => typeof item != UNDEF);


// __xto__ checks to make sure that at least one of the arguments supplied to the function exists (is not 'undefined')
export const xto = (...args) => (args.find(item => typeof item != UNDEF)) ? true : false;


// ##### Easing engines
// `easeEngines` - an object in which keys define various easing functions
export const easeEngines = {

// Legacy easings
    out: (t) => 1 - _cos((t * _pi) / 2),
    in: (t) => _sin((t * _pi) / 2),
    easeIn: (t) => {

        const temp = 1 - t;
        return 1 - (temp * temp);
    },
    easeIn3: (t) => {

        const temp = 1 - t;
        return 1 - (temp * temp * temp);
    },
    easeIn4: (t) => {

        const temp = 1 - t;
        return 1 - (temp * temp * temp * temp);
    },
    easeIn5: (t) => {

        const temp = 1 - t;
        return 1 - (temp * temp * temp * temp * temp);
    },
    easeOutIn: (t) => (t < 0.5) ? 2 * t * t : 1 - _pow(-2 * t + 2, 2) / 2,
    easeOutIn3: (t) => (t < 0.5) ? 4 * t * t * t : 1 - _pow(-2 * t + 2, 3) / 2,
    easeOutIn4: (t) => (t < 0.5) ? 8 * t * t * t * t : 1 - _pow(-2 * t + 2, 4) / 2,
    easeOutIn5: (t) => (t < 0.5) ? 16 * t * t * t * t * t : 1 - _pow(-2 * t + 2, 5) / 2,

    easeInOut: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-2 * tin * tin);
        return 0.5 + _pow(2 * tout, 2) / 2;
    },
    easeInOut3: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-4 * tin * tin * tin);
        return 0.5 + _pow(2 * tout, 3) / 2;
    },
    easeInOut4: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-8 * tin * tin * tin * tin);
        return 0.5 + _pow(2 * tout, 4) / 2;
    },
    easeInOut5: (t) => {

        const tin = 0.5 - t,
            tout = t - 0.5;

        if (t < 0.5) return 0.5 + (-16 * tin * tin * tin * tin * tin);
        return 0.5 + _pow(2 * tout, 5) / 2;
    },

    easeOut: (t) => t * t,
    easeOut3: (t) => t * t * t,
    easeOut4: (t) => t * t * t * t,
    easeOut5: (t) => t * t * t * t * t,

    none: (val) => val,
    linear: (val) => val,

    // Noise functionality easing engines
    cosine: (t) => .5 * (1 + _cos((1 - t) * _pi)),
    hermite: (t) => t * t * (-t * 2 + 3),
    quintic: (t) => t * t * t * (t * (t * 6 - 15) + 10),

// The following easing variations come from the [easings.net](https://easings.net/) web page
// + Note: the naming convention for easing is different in Scrawl-canvas. Easing out implies a speeding up, while easing in implies a slowing down. Think of a train easing into a station, and then easing out of it again as it continues its journey.
    easeOutSine: (t) => 1 - _cos((t * _pi) / 2),
    easeInSine: (t) => _sin((t * _pi) / 2),
    easeOutInSine: (t) => -(_cos(_pi * t) - 1) / 2,

    easeOutQuad: (t) => t * t,
    easeInQuad: (t) => 1 - ((1 - t) * (1 - t)),
    easeOutInQuad: (t) => (t < 0.5) ? 2 * t * t : 1 - _pow(-2 * t + 2, 2) / 2,

    easeOutCubic: (t) => t * t * t,
    easeInCubic: (t) => 1 - _pow(1 - t, 3),
    easeOutInCubic: (t) => (t < 0.5) ? 4 * t * t * t : 1 - _pow(-2 * t + 2, 3) / 2,

    easeOutQuart: (t) => t * t * t * t,
    easeInQuart: (t) => 1 - _pow(1 - t, 4),
    easeOutInQuart: (t) => (t < 0.5) ? 8 * t * t * t * t : 1 - _pow(-2 * t + 2, 4) / 2,

    easeOutQuint: (t) => t * t * t * t * t,
    easeInQuint: (t) => 1 - _pow(1 - t, 5),
    easeOutInQuint: (t) => (t < 0.5) ? 16 * t * t * t * t * t : 1 - _pow(-2 * t + 2, 5) / 2,

    easeOutExpo: (t) => (t === 0) ? 0 : _pow(2, 10 * t - 10),
    easeInExpo: (t) => (t === 1) ? 1 : 1 - _pow(2, -10 * t),
    easeOutInExpo: (t) => {
        if (t === 0 || t === 1) return t;
        return t < 0.5 ? _pow(2, 20 * t - 10) / 2 : (2 - _pow(2, -20 * t + 10)) / 2;
    },

    easeOutCirc: (t) => 1 - _sqrt(1 - _pow(t, 2)),
    easeInCirc: (t) => _sqrt(1 - _pow(t - 1, 2)),
    easeOutInCirc: (t) => {

        if (t < 0.5) return (1 - _sqrt(1 - _pow(2 * t, 2))) / 2;
        return (_sqrt(1 - _pow(-2 * t + 2, 2)) + 1) / 2;
    },

    easeOutBack: (t) => (2.70158 * t * t * t) - (1.70158 * t * t),
    easeInBack: (t) => 1 + (2.70158 * _pow(t - 1, 3)) + (1.70158 * _pow(t - 1, 2)),
    easeOutInBack: (t) => {

        const c1 = 1.70158, c2 = c1 * 1.525;
        if (t < 0.5) return (_pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
        return (_pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },

    easeOutElastic: (t) => {

        const c4 = (2 * _pi) / 3;
        if (t === 0 || t === 1) return t;
        return -_pow(2, 10 * t - 10) * _sin((t * 10 - 10.75) * c4);
    },
    easeInElastic: (t) => {

        const c4 = (2 * _pi) / 3;
        if (t === 0 || t === 1) return t;
        return _pow(2, -10 * t) * _sin((t * 10 - 0.75) * c4) + 1;
    },
    easeOutInElastic: (t) => {

        const c5 = (2 * _pi) / 4.5;
        if (t === 0 || t === 1) return t;
        if (t < 0.5) return -(_pow(2, 20 * t - 10) * _sin((20 * t - 11.125) * c5)) / 2;
        return (_pow(2, -20 * t + 10) * _sin((20 * t - 11.125) * c5)) / 2 + 1;
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


// Code to detect browser from Code Box: https://code-boxx.com/detect-browser-with-javascript/
// + Ideally we need to get rid of the need for this functionality. Currently used in `/core/events.js` only
export const detectBrowser = function () {

    const result = [];

/* eslint-disable-next-line */
    if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.includes(' OPR/')) result.push('old-opera');

    if (typeof InstallTrigger != UNDEF) result.push('firefox');

/* eslint-disable-next-line */
    else if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() == "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari != UNDEF && safari.pushNotification))) result.push('safari');

/* eslint-disable-next-line */
    if (/*@cc_on!@*/false || !!document.documentMode) result.push('internet-explorer');

    if (!result.includes('internet-explorer') && !!window.StyleMedia) result.push('edge');

    if(window.chrome) result.push('chrome');

    if((result.includes('chrome') || result.includes('old-opera')) && !!window.CSS) result.push('blink');

    return result;
};


// Create an Object prototype
export const doCreate = () => _create(Object.prototype);
