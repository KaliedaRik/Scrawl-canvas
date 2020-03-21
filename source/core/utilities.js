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

// TODO documentation
const capitalize = (s) => {

    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}


// __convertLength__ takes a value, checks if it is a percent value and - if true - returns a value relative to the supplied length; otherwise returns the value as a number
//
// Examples:
// ```
// convertLength(20, 40);
// -> 20
//    
// convertLength('20%', 40);
// -> 8
// ```
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


// __defaultXYZReturnFunction__ helps us avoid errors when invoking a function attribute settable by the coder
const defaultNonReturnFunction = () => {};
const defaultArgReturnFunction = (a) => a;
const defaultThisReturnFunction = function () { return this; };
const defaultFalseReturnFunction = () => false;
const defaultZeroReturnFunction = () => 0;
const defaultBlankStringReturnFunction = () => '';
const defaultPromiseReturnFunction = () => Promise.resolve(true);


// __ensureInteger__ - return the value provided if it is an integer number and, if it isn't, return 0
const ensureInteger = (val) => {

    val = parseInt(val, 10);
    if (!isa_number(val)) val = 0;
    return val;
};


// __ensurePositiveInteger__ - return the value provided if it is a positive integer number and, if it isn't, return 0
const ensurePositiveInteger = (val) => {

    val = parseInt(val, 10);
    if (!isa_number(val)) val = 0;
    return Math.abs(val);
};


// __ensureFloat__ - return the value provided as a floating point number of given precision; return 0 if not a number
const ensureFloat = (val, precision) => {

    val = parseFloat(val);

    if (!isa_number(val)) val = 0;
    if (!isa_number(precision)) precision = 0;

    return parseFloat(val.toFixed(precision));
};


// __ensurePositiveFloat__ - return the value provided as a positive floating point number of given precision; return 0 if not a number
const ensurePositiveFloat = (val, precision) => {

    val = parseFloat(val);

    if (!isa_number(val)) val = 0;
    if (!isa_number(precision)) precision = 0;

    return Math.abs(parseFloat(val.toFixed(precision)));
};


// __ensureString__ - return a String representation of the value
const ensureString = (val) => {

    return (val.substring) ? val : val.toString;
};


// __generateUuid__ is a simple (crude) uuid generator 
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
// (imported 2017-07-08)
const generateUuid = () => {

    function s4() {

        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};


// __isa_boolean__ checks to make sure the argument is a boolean
const isa_boolean = item => (typeof item === 'boolean') ? true : false;


// __isa_canvas__ checks to make sure the argument is a DOM &lt;canvas> element
const isa_canvas = item => (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;


// __isa_dom__ checks to make sure the argument is a DOM element of some sort
const isa_dom = item => (item && item.querySelector && item.dispatchEvent) ? true : false;


// __isa_engine__ checks to make sure the argument is a &lt;canvas> element's context engine'
const isa_engine = item => (item && item.quadraticCurveTo) ? true : false;


// __isa_fn__ checks to make sure the argument is a JavaScript function object
const isa_fn = item => (typeof item === 'function') ? true : false;


// __isa_img__ checks to make sure the argument is a DOM &lt;img> element
const isa_img = item => (Object.prototype.toString.call(item) === '[object HTMLImageElement]') ? true : false;


// __isa_number__ checks to make sure the argument is true number (excluding NaN)
const isa_number = item => (typeof item != 'undefined' && item.toFixed && !Number.isNaN(item)) ? true : false;


// __isa_obj__ checks to make sure the argument is a JavaScript Object
const isa_obj = item => (Object.prototype.toString.call(item) === '[object Object]') ? true : false;


// __isa_quaternion__ checks to make sure the argument is a Scrawl-canvas Quaternion object
const isa_quaternion = item => (item && item.type && item.type === 'Quaternion') ? true : false;


// __isa_str__ checks to make sure the argument is a JavaScript String
const isa_str = item => (item && item.substring) ? true : false;


// __isa_vector__ checks to make sure the argument is a Scrawl-canvas Vector object
const isa_vector = item => (item && item.type && item.type === 'Vector') ? true : false;


// __isa_video__ checks to make sure the argument is a DOM &lt;video> element
const isa_video = item => (Object.prototype.toString.call(item) === '[object HTMLVideoElement]') ? true : false;


// __locateTarget__ - a private function and attribute to help retrieve data from the scrawl-canvas library

// __locateTarget__ - Used by gradients
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
};
