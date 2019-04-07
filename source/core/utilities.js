/*
# Core utility functions
*/
import * as library from "./library.js";

/*
__addStrings__ adds the two arguments together and returns a percentage string value

Examples:

    addStrings(20, 40);
    -> '60%'
    
    addStrings('20%', 40);
    -> '60%'
    
    addStrings(20, '40%');
    -> '60%'
    
    addStrings('20%', '40%');
    -> '60%'
*/
const addStrings = (current, delta) => {

	if (current.toFixed) current += (delta.toFixed) ? delta : parseFloat(delta);
	else current = parseFloat(current) + ((delta.toFixed) ? delta : parseFloat(delta));

	return current + '%';
};

/*
__bucketSort__ sorts the items in a scrawl-canvas library array (generally a -name array) based on an attribute value for an object in a related scrawl-canvas library object. *Private function*

Note - to be deprecated
*/ 
const bucketSort = (section, attribute, a) => {

	let s, b, i, iz, m, o, f, j, jz;

	if (Array.isArray(a) && a.length > 1) {

		s = library[section];

		if (s) {

			b = []
			b.push([]);
			
			for (i = 0, iz = a.length; i < iz; i++) {

				m = a[i];
				o = 0;
				
				if (m && s[m] && s[m][attribute]) o = Math.floor(s[m][attribute]);

				if (!b[o]) b[o] = [];

				b[o].push(a[i]);
			}

			f = [];

			for (i = 0, iz = b.length; i < iz; i++) {

				m = b[i];
				
				if (m) {

					for (j = 0, jz = m.length; j < jz; j++) {

						f.push(m[j]);
					}
				}
			}
			a.length = 0;
			a = a.concat(f);
		}
	}

	return a;
};

/*
__convertLength__ takes a value, checks if it is a percent value and - if true - returns a value relative to the supplied length; otherwise returns the value as a number

Examples:

    convertLength(20, 40);
    -> 20
    
    convertLength('20%', 40);
    -> 8
*/
const convertLength = (val, len) => {

	if(val.toFixed) return val;
	else{

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
				return (parseFloat(val) / 100) * len;
		}
	}
};

/*
__convertTime__ converts a time value into its component string suffix and (millisecond) number value properties; returns an array

Examples:

    convertTime(5000);
    -> ['ms', 5000]
    
    convertTime('50%');
    -> ['%', 50]
    
    convertTime('5000ms'); 
    -> ['ms', 5000]
    
    convertTime('5s');
    -> ['ms', 5000]
*/    
const convertTime = (item) => {

	let a, timeUnit, timeValue;

	if (xt(item) && item != null) {

		if (item.toFixed) return ['ms', item];

		a = item.match(/^\d+\.?\d*(\D*)/);
		timeUnit = (a[1].toLowerCase) ? a[1].toLowerCase() : 'ms';
		
		switch (timeUnit) {

			case 's':
				timeValue = parseFloat(item) * 1000;
				break;

			case '%':
				timeValue = parseFloat(item);
				break;

			default:
				timeUnit = 'ms';
				timeValue = parseFloat(item);
		}
		
		return [timeUnit, timeValue];
	}

	return ['error', 0];
};

/*
__defaultXYZReturnFunction__ helps us avoid errors when invoking a function attribute settable by the coder
*/ 
const defaultNonReturnFunction = () => {};
const defaultArgReturnFunction = (a) => { return a; };
const defaultThisReturnFunction = function () { return this; };
const defaultFalseReturnFunction = () => { return false; };

/*
__generateUuid__ is a simple (crude) uuid generator 
http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
(imported 2017-07-08)
*/
const generateUuid = () => {

	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

/*
__getSafeObject__ helps us avoid errors when accessing object attributes

Note - trying to deprecate this utility
*/ 
const safeObject = {};
const getSafeObject = item => (Object.prototype.toString.call(item) === '[object Object]') ? item : safeObject;

/*
__isa_canvas__ checks to make sure the argument is a DOM &lt;canvas> element
*/ 
const isa_canvas = item => (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;

/*
__isa_dom__ checks to make sure the argument is a DOM element of some sort
*/ 
const isa_dom = item => (item && item.querySelector && item.dispatchEvent) ? true : false;

/*
__isa_engine__ checks to make sure the argument is a &lt;canvas> element's contenxt engine'
*/ 
const isa_engine = item => (item && item.quadraticCurveTo) ? true : false;

/*
__isa_fn__ checks to make sure the argument is a JavaScript function object
*/ 
const isa_fn = item => (typeof item === 'function') ? true : false;

/*
__isa_img__ checks to make sure the argument is a DOM &lt;img> element
*/ 
const isa_img = item => (Object.prototype.toString.call(item) === '[object HTMLImageElement]') ? true : false;

/*
__isa_obj__ checks to make sure the argument is a JavaScript Object
*/ 
const isa_obj = item => (Object.prototype.toString.call(item) === '[object Object]') ? true : false;

/*
__isa_quaternion__ checks to make sure the argument is a Scrawl-canvas Quaternion object
*/ 
const isa_quaternion = item => (item && item.type && item.type === 'Quaternion') ? true : false;

/*
__isa_str__ checks to make sure the argument is a JavaScript String
*/ 
const isa_str = item => (item && item.substring) ? true : false;

/*
__isa_vector__ checks to make sure the argument is a Scrawl-canvas Vector object
*/ 
const isa_vector = item => (item && item.type && item.type === 'Vector') ? true : false;

/*
__isa_video__ checks to make sure the argument is a DOM &lt;video> element
*/ 
const isa_video = item => (Object.prototype.toString.call(item) === '[object HTMLVideoElement]') ? true : false;

/*
__locateTarget__ - a private function and attribute to help retrieve data from the scrawl-canvas library

Note - this function may no longer be required, and should certainly be deprecated
*/ 
const locateTargetSections = ['artefact', 'group', 'animation', 'tween', 'styles'];
const locateTarget = (item) => {

	var section, temp, i, iz;

	if(item && item.substring){

		for(i = 0, iz = locateTargetSections.length; i < iz; i++) {

			section = locateTargetSections[i];
			temp = library[section][item];

			if (temp) return temp;
		}
	}
	return false;
};

/*
__mergeInto__ takes two objects and merges the attributes of one into the other. This function mutates the 'original' object rather than generating a third, new onject

Example:

    var original = { name: 'Peter', age: 42, job: 'lawyer' };
    var additional = { age: 32, job: 'coder', pet: 'cat' };
    scrawl.utils.mergeInto(original, additional);
    
    -> { name: 'Peter', age: 42, job: 'lawyer', pet: 'cat' }
*/
const mergeInto = (original, additional) => {

	for (let key in additional) {

		if (additional.hasOwnProperty(key) && typeof original[key] == 'undefined') original[key] = additional[key];
	}
	return original;
};

/*
__mergeOver__ takes two objects and writes the attributes of one over the other. This function mutates the 'original' object rather than generating a third, new onject

Example:

    var original = { name: 'Peter', age: 42, job: 'lawyer' };
    var additional = { age: 32, job: 'coder', pet: 'cat' };
    scrawl.utils.mergeOver(original, additional);
    
    -> { name: 'Peter', age: 32, job: 'coder', pet: 'cat' }
*/
const mergeOver = (original, additional) => {

	for (let key in additional) {

		if (additional.hasOwnProperty(key)) original[key] = additional[key];
	}
	return original;
};

/*
__pushUnique__ adds a value to the end of an array, if that value is not already present in the array. This function mutates the array

Example:

    var myarray = ['apple', 'orange'];
    scrawl.utils.pushUnique(myarray, 'apple');    
    -> ['apple', 'orange']
    
    scrawl.utils.pushUnique(myarray, 'banana');
    -> ['apple', 'orange', 'banana']

*/
const pushUnique = (myArray, potentialMember) => {

	if (xta(myArray, potentialMember) && Array.isArray(myArray)) {

		if (myArray.indexOf(potentialMember) < 0) myArray.push(potentialMember);
	}
	return myArray;
};

/*
__removeItem__ removes a value from an array. This function mutates the array

Example:

    var myarray = ['apple', 'orange'];
    scrawl.utils.removeItem(myarray, 'banana');   
    -> ['apple', 'orange']
    
    scrawl.utils.removeItem(myarray, 'apple');    
    -> ['orange']
*/
const removeItem = (myArray, unwantedMember) => {

	if (xta(myArray, unwantedMember) && Array.isArray(myArray)) {

		let index = myArray.indexOf(unwantedMember);

		if (index >= 0) myArray.splice(index, 1);
	}
	return myArray;
};

/*
__xt__ checks to see if argument exists (is not 'undefined')
*/ 
const xt = item => (typeof item == 'undefined') ? false : true;

/*
__xta__ checks to make sure that all the arguments supplied to the function exist (none are 'undefined')
*/ 
const xta = (...args) => args.every(item => typeof item != 'undefined');

/*
__xtGet__ returns the first existing (not 'undefined') argument supplied to the function
*/ 
const xtGet = (...args) => args.find(item => typeof item != 'undefined');

/*
__xto__ checks to make sure that at least one of the arguments supplied to the function exists (is not 'undefined')
*/ 
const xto = (...args) => (args.find(item => typeof item != 'undefined')) ? true : false;

export {
	addStrings,
	bucketSort,
	convertLength,
	convertTime,
	defaultNonReturnFunction,
	defaultArgReturnFunction,
	defaultThisReturnFunction,
	defaultFalseReturnFunction,
	generateUuid,
	getSafeObject,
	isa_canvas,
	isa_dom,
	isa_engine,
	isa_fn,
	isa_img,
	isa_obj,
	isa_quaternion,
	isa_str,
	isa_vector,
	isa_video,
	locateTarget,
	mergeInto,
	mergeOver,
	pushUnique,
	removeItem,
	xt,
	xta,
	xtGet,
	xto
};
