// # Core utility functions
// A ragtag collection of helper functions which other modules can import and use

// #### Imports
import * as library from "./library.js";

// #### Functions

// __addStrings__ adds the two arguments together and returns a percentage string value if either of the values was a string; 
//
// Examples:
// ```
// addStrings(20, 40);
// -> '60%'
//    
// addStrings('20%', 40);
// -> '60%'
//  
// addStrings(20, '40%');
// -> '60%'
//  
// addStrings('20%', '40%');
// -> '60%'
// ```

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


// __generateUuid__ is a simple (crude) uuid generator 
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
// (imported 2017-07-08)
const generateUuid = () => {

    function s4() {

        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};


// __generateUuid__ is a simple (crude) uuid generator 
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
const isa_number = item => (typeof item != 'undefined' && item.toFixed && !Number.isNaN(item)) ? true : false;


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


// Seedable random numbers
// The following code has been lifted in its entirety from https://github.com/skratchdot/random-seed

/*
 * random-seed
 * https://github.com/skratchdot/random-seed
 *
 * This code was originally written by Steve Gibson and can be found here:
 *
 * https://www.grc.com/otg/uheprng.htm
 *
 * It was slightly modified for use in node, to pass jshint, and a few additional
 * helper functions were added.
 *
 * Copyright (c) 2013 skratchdot
 * Dual Licensed under the MIT license and the original GRC copyright/license
 * included below.
 */
/*  ============================================================================
                                    Gibson Research Corporation
                UHEPRNG - Ultra High Entropy Pseudo-Random Number Generator
    ============================================================================
    LICENSE AND COPYRIGHT:  THIS CODE IS HEREBY RELEASED INTO THE PUBLIC DOMAIN
    Gibson Research Corporation releases and disclaims ALL RIGHTS AND TITLE IN
    THIS CODE OR ANY DERIVATIVES. Anyone may be freely use it for any purpose.
    ============================================================================
    This is GRC's cryptographically strong PRNG (pseudo-random number generator)
    for JavaScript. It is driven by 1536 bits of entropy, stored in an array of
    48, 32-bit JavaScript variables.  Since many applications of this generator,
    including ours with the "Off The Grid" Latin Square generator, may require
    the deteriministic re-generation of a sequence of PRNs, this PRNG's initial
    entropic state can be read and written as a static whole, and incrementally
    evolved by pouring new source entropy into the generator's internal state.
    ----------------------------------------------------------------------------
    ENDLESS THANKS are due Johannes Baagoe for his careful development of highly
    robust JavaScript implementations of JS PRNGs.  This work was based upon his
    JavaScript "Alea" PRNG which is based upon the extremely robust Multiply-
    With-Carry (MWC) PRNG invented by George Marsaglia. MWC Algorithm References:
    http://www.GRC.com/otg/Marsaglia_PRNGs.pdf
    http://www.GRC.com/otg/Marsaglia_MWC_Generators.pdf
    ----------------------------------------------------------------------------
    The quality of this algorithm's pseudo-random numbers have been verified by
    multiple independent researchers. It handily passes the fermilab.ch tests as
    well as the "diehard" and "dieharder" test suites.  For individuals wishing
    to further verify the quality of this algorithm's pseudo-random numbers, a
    256-megabyte file of this algorithm's output may be downloaded from GRC.com,
    and a Microsoft Windows scripting host (WSH) version of this algorithm may be
    downloaded and run from the Windows command prompt to generate unique files
    of any size:
    The Fermilab "ENT" tests: http://fourmilab.ch/random/
    The 256-megabyte sample PRN file at GRC: https://www.GRC.com/otg/uheprng.bin
    The Windows scripting host version: https://www.GRC.com/otg/wsh-uheprng.js
    ----------------------------------------------------------------------------
    Qualifying MWC multipliers are: 187884, 686118, 898134, 1104375, 1250205,
    1460910 and 1768863. (We use the largest one that's < 2^21)
    ============================================================================ */


/*  ============================================================================
This is based upon Johannes Baagoe's carefully designed and efficient hash
function for use with JavaScript.  It has a proven "avalanche" effect such
that every bit of the input affects every bit of the output 50% of the time,
which is good.  See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
============================================================================
*/
var Mash = function () {
    var n = 0xefc8249d;
    var mash = function (data) {
        if (data) {
            data = data.toString();
            for (var i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        } else {
            n = 0xefc8249d;
        }
    };
    return mash;
};

var uheprng = function (seed) {
    return (function () {
        var o = 48; // set the 'order' number of ENTROPY-holding 32-bit values
        var c = 1; // init the 'carry' used by the multiply-with-carry (MWC) algorithm
        var p = o; // init the 'phase' (max-1) of the intermediate variable pointer
        var s = new Array(o); // declare our intermediate variables array
        var i; // general purpose local
        var j; // general purpose local
        var k = 0; // general purpose local

        // when our "uheprng" is initially invoked our PRNG state is initialized from the
        // browser's own local PRNG. This is okay since although its generator might not
        // be wonderful, it's useful for establishing large startup entropy for our usage.
        var mash = new Mash(); // get a pointer to our high-performance "Mash" hash

        // fill the array with initial mash hash values
        for (i = 0; i < o; i++) {
            s[i] = mash(Math.random());
        }

        // this PRIVATE (internal access only) function is the heart of the multiply-with-carry
        // (MWC) PRNG algorithm. When called it returns a pseudo-random number in the form of a
        // 32-bit JavaScript fraction (0.0 to <1.0) it is a PRIVATE function used by the default
        // [0-1] return function, and by the random 'string(n)' function which returns 'n'
        // characters from 33 to 126.
        var rawprng = function () {
            if (++p >= o) {
                p = 0;
            }
            var t = 1768863 * s[p] + c * 2.3283064365386963e-10; // 2^-32
            return s[p] = t - (c = t | 0);
        };

        // this EXPORTED function is the default function returned by this library.
        // The values returned are integers in the range from 0 to range-1. We first
        // obtain two 32-bit fractions (from rawprng) to synthesize a single high
        // resolution 53-bit prng (0 to <1), then we multiply this by the caller's
        // "range" param and take the "floor" to return a equally probable integer.
        var random = function (range) {
            return Math.floor(range * (rawprng() + (rawprng() * 0x200000 | 0) * 1.1102230246251565e-16)); // 2^-53
        };

        // this EXPORTED function 'string(n)' returns a pseudo-random string of
        // 'n' printable characters ranging from chr(33) to chr(126) inclusive.
        random.string = function (count) {
            var i;
            var s = '';
            for (i = 0; i < count; i++) {
                s += String.fromCharCode(33 + random(94));
            }
            return s;
        };

        // this PRIVATE "hash" function is used to evolve the generator's internal
        // entropy state. It is also called by the EXPORTED addEntropy() function
        // which is used to pour entropy into the PRNG.
        var hash = function () {
            var args = Array.prototype.slice.call(arguments);
            for (i = 0; i < args.length; i++) {
                for (j = 0; j < o; j++) {
                    s[j] -= mash(args[i]);
                    if (s[j] < 0) {
                        s[j] += 1;
                    }
                }
            }
        };

        // this EXPORTED "clean string" function removes leading and trailing spaces and non-printing
        // control characters, including any embedded carriage-return (CR) and line-feed (LF) characters,
        // from any string it is handed. this is also used by the 'hashstring' function (below) to help
        // users always obtain the same EFFECTIVE uheprng seeding key.
        random.cleanString = function (inStr) {
            inStr = inStr.replace(/(^\s*)|(\s*$)/gi, ''); // remove any/all leading spaces
            inStr = inStr.replace(/[\x00-\x1F]/gi, ''); // remove any/all control characters
            inStr = inStr.replace(/\n /, '\n'); // remove any/all trailing spaces
            return inStr; // return the cleaned up result
        };

        // this EXPORTED "hash string" function hashes the provided character string after first removing
        // any leading or trailing spaces and ignoring any embedded carriage returns (CR) or Line Feeds (LF)
        random.hashString = function (inStr) {
            inStr = random.cleanString(inStr);
            mash(inStr); // use the string to evolve the 'mash' state
            for (i = 0; i < inStr.length; i++) { // scan through the characters in our string
                k = inStr.charCodeAt(i); // get the character code at the location
                for (j = 0; j < o; j++) { //    "mash" it into the UHEPRNG state
                    s[j] -= mash(k);
                    if (s[j] < 0) {
                        s[j] += 1;
                    }
                }
            }
        };

        // this EXPORTED function allows you to seed the random generator.
        random.seed = function (seed) {
            if (typeof seed === 'undefined' || seed === null) {
                seed = Math.random();
            }
            if (typeof seed !== 'string') {
                seed = stringify(seed, function (key, value) {
                    if (typeof value === 'function') {
                        return (value).toString();
                    }
                    return value;
                });
            }
            random.initState();
            random.hashString(seed);
        };

        // this handy exported function is used to add entropy to our uheprng at any time
        random.addEntropy = function ( /* accept zero or more arguments */ ) {
            var args = [];
            for (i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            hash((k++) + (new Date().getTime()) + args.join('') + Math.random());
        };

        // if we want to provide a deterministic startup context for our PRNG,
        // but without directly setting the internal state variables, this allows
        // us to initialize the mash hash and PRNG's internal state before providing
        // some hashing input
        random.initState = function () {
            mash(); // pass a null arg to force mash hash to init
            for (i = 0; i < o; i++) {
                s[i] = mash(' '); // fill the array with initial mash hash values
            }
            c = 1; // init our multiply-with-carry carry
            p = o; // init our phase
        };

        // we use this (optional) exported function to signal the JavaScript interpreter
        // that we're finished using the "Mash" hash function so that it can free up the
        // local "instance variables" is will have been maintaining.  It's not strictly
        // necessary, of course, but it's good JavaScript citizenship.
        random.done = function () {
            mash = null;
        };

        // if we called "uheprng" with a seed value, then execute random.seed() before returning
        if (typeof seed !== 'undefined') {
            random.seed(seed);
        }

        // Returns a random integer between 0 (inclusive) and range (exclusive)
        random.range = function (range) {
            return random(range);
        };

        // Returns a random float between 0 (inclusive) and 1 (exclusive)
        random.random = function () {
            return random(Number.MAX_VALUE - 1) / Number.MAX_VALUE;
        };

        // Returns a random float between min (inclusive) and max (exclusive)
        random.floatBetween = function (min, max) {
            return random.random() * (max - min) + min;
        };

        // Returns a random integer between min (inclusive) and max (inclusive)
        random.intBetween = function (min, max) {
            return Math.floor(random.random() * (max - min + 1)) + min;
        };

        // when our main outer "uheprng" function is called, after setting up our
        // initial variables and entropic state, we return an "instance pointer"
        // to the internal anonymous function which can then be used to access
        // the uheprng's various exported functions.  As with the ".done" function
        // above, we should set the returned value to 'null' once we're finished
        // using any of these functions.
        return random;
    }());
};

// ... And this code comes from https://github.com/moll/json-stringify-safe
function stringify(obj, replacer, spaces, cycleReplacer) {
    return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
    var stack = [], keys = []

    if (cycleReplacer == null) cycleReplacer = function(key, value) {
        if (stack[0] === value) return "[Circular ~]"
        return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
    }

    return function(key, value) {
        if (stack.length > 0) {
            var thisPos = stack.indexOf(this)
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
            if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
        }
        else stack.push(value)

        return replacer == null ? value : replacer.call(this, key, value)
    }
}

const seededRandomNumberGenerator = function (seed) {

    return new uheprng(seed);
};


// ##### Easing functions
// The following easing variations come from the [easings.net](https://easings.net/) web page
// + Note: the naming convention for easing is different in Scrawl-canvas. Easing out implies a speeding up, while easing in implies a slowing down. Think of a train easing into a station, and then easing out of it again as it continues its journey. 
const easeOutSine = function (t) { return 1 - Math.cos((t * Math.PI) / 2) };
const easeInSine = function (t) { return Math.sin((t * Math.PI) / 2) };
const easeOutInSine = function (t) { return -(Math.cos(Math.PI * t) - 1) / 2 };

const easeOutQuad = function (t) { return t * t };
const easeInQuad = function (t) { return 1 - ((1 - t) * (1 - t)) };
const easeOutInQuad = function(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 };

const easeOutCubic = function(t) { return t * t * t };
const easeInCubic = function(t) { return 1 - Math.pow(1 - t, 3) };
const easeOutInCubic = function(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 };

const easeOutQuart = function(t) { return t * t * t * t };
const easeInQuart = function(t) { return 1 - Math.pow(1 - t, 4) };
const easeOutInQuart = function(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2 };

const easeOutQuint = function(t) { return t * t * t * t * t };
const easeInQuint = function(t) { return 1 - Math.pow(1 - t, 5) };
const easeOutInQuint = function(t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2 };

const easeOutExpo = function(t) { return t === 0 ? 0 : Math.pow(2, 10 * t - 10) };
const easeInExpo = function(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t) };
const easeOutInExpo = function(t) {
    if (t === 0 || t === 1) return t;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;        
};

const easeOutCirc = function(t) { return 1 - Math.sqrt(1 - Math.pow(t, 2)) };
const easeInCirc = function(t) { return Math.sqrt(1 - Math.pow(t - 1, 2)) };
const easeOutInCirc = function(t) { return t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2 };

const easeOutBack = function(t) { return (2.70158 * t * t * t) - (1.70158 * t * t) };
const easeInBack = function(t) { return 1 + (2.70158 * Math.pow(t - 1, 3)) + (1.70158 * Math.pow(t - 1, 2)) };
const easeOutInBack = function(t) {
    let c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

const easeOutElastic = function(t) {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

const easeInElastic = function(t) {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const easeOutInElastic = function(t) {
    const c5 = (2 * Math.PI) / 4.5;
    if (t === 0 || t === 1) return t;
    return t < 0.5 ? 
        -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2 : 
        (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

const easeOutBounce = function(t) {
    t = 1 - t;
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return 1 - (n1 * t * t);
    if (t < 2 / d1) return 1 - (n1 * (t -= 1.5 / d1) * t + 0.75);
    if (t < 2.5 / d1) return 1 - (n1 * (t -= 2.25 / d1) * t + 0.9375);
    return 1 - (n1 * (t -= 2.625 / d1) * t + 0.984375);
};

const easeInBounce = function(t) {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

const easeOutInBounce = function(t) {
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
};



// #### Exports
export {
    addStrings,
    convertTime,
    correctForZero,
    λnull,
    λfirstArg,
    λthis,
    λpromise,
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
    seededRandomNumberGenerator,
    xt,
    xta,
    xtGet,
    xto, 

    easeOutSine,
    easeInSine,
    easeOutInSine,
    easeOutQuad,
    easeInQuad,
    easeOutInQuad,
    easeOutCubic,
    easeInCubic,
    easeOutInCubic,
    easeOutQuart,
    easeInQuart,
    easeOutInQuart,
    easeOutQuint,
    easeInQuint,
    easeOutInQuint,
    easeOutExpo,
    easeInExpo,
    easeOutInExpo,
    easeOutCirc,
    easeInCirc,
    easeOutInCirc,
    easeOutBack,
    easeInBack,
    easeOutInBack,
    easeOutElastic,
    easeInElastic,
    easeOutInElastic,
    easeOutBounce,
    easeInBounce,
    easeOutInBounce,
};

