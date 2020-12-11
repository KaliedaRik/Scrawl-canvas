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


// #### Exports
export {
    addStrings,
    convertTime,
    correctForZero,
    λnull,
    λthis,
    λpromise,
    generateUuid,
    generateUniqueString,
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
