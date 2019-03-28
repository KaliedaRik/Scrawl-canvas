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
const getSafeObject = (item) => {

	return (Object.prototype.toString.call(item) === '[object Object]') ? item : safeObject;
};

/*
__isa_canvas__ checks to make sure the argument is a DOM &lt;canvas> element
*/ 
const isa_canvas = (item) => {

	return (Object.prototype.toString.call(item) === '[object HTMLCanvasElement]') ? true : false;
};

/*
__isa_dom__ checks to make sure the argument is a DOM element of some sort
*/ 
const isa_dom = (item) => {

	return (item && item.querySelector && item.dispatchEvent) ? true : false;
};

const isa_engine = (item) => {

	return (item && item.quadraticCurveTo) ? true : false;
};

/*
__isa_fn__ checks to make sure the argument is a JavaScript function object
*/ 
const isa_fn = (item) => {

	return (typeof item === 'function') ? true : false;
};

/*
__isa_img__ checks to make sure the argument is a DOM &lt;img> element
*/ 
const isa_img = (item) => {

	return (Object.prototype.toString.call(item) === '[object HTMLImageElement]') ? true : false;
};

/*
__isa_obj__ checks to make sure the argument is a JavaScript Object
*/ 
const isa_obj = (item) => {

	return (Object.prototype.toString.call(item) === '[object Object]') ? true : false;
};

/*
__isa_quaternion__ checks to make sure the argument is a Scrawl-canvas Quaternion object
*/ 
const isa_quaternion = (item) => {

	return (item && item.type && item.type === 'Quaternion') ? true : false;
};

/*
__isa_str__ checks to make sure the argument is a JavaScript String
*/ 
const isa_str = (item) => {

	return (item && item.substring) ? true : false;
};

/*
__isa_vector__ checks to make sure the argument is a Scrawl-canvas Vector object
*/ 
const isa_vector = (item) => {

	return (item && item.type && item.type === 'Vector') ? true : false;
};

/*
__isa_video__ checks to make sure the argument is a DOM &lt;video> element
*/ 
const isa_video = (item) => {

	return (Object.prototype.toString.call(item) === '[object HTMLVideoElement]') ? true : false;
};

/*
__loadScript__ is a dedicated function for loading scrawl-canvas javascript files. It takes two arguments:

Note: trying to deprecate this functionality

* _src_ - 'path/to/file.js', or an array of such strings
* _callback_ - a callback function (with no arguments)

The (currently) preferred method for loading scrawl-canvas into a web page is to use the &lt;script> tag with additional data-attributes to determine the extensions to load and the script to trigger once script loading completes.

For more details on loading scrawl-canvas, see:

* <a href="../tests/dom_001.html">demo</a>
* <a href="./dom_001.html">demo code</a>
*/
const loadScripts = (src, callback) => {

	var i, iz, item, count, el;

	if (typeof src == 'undefined') src = [];
	else if (src.substring) src = [src];

	if (typeof callback !== 'function') callback = function(){};

	if (Array.isArray(src)) {

		count = src.length;

		for (i = 0, iz = src.length; i < iz; i++) {

			item = src[i];
			el = document.createElement('script');
			el.type = 'text/javascript';
			el.async = 'true';

			el.onload = (e) => {

				count--;
				
				if (!count) callback();
			};

			el.onerror = (e) => console.log('scrawl.utils.loadScripts error', e.target.src);

			el.src = item;

			document.body.appendChild(el);
		}
	}
};

/*
__locateTarget__ - a private function and attribute to help retrieve data from the scrawl-canvas library
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
const mergeInto = (o1, o2) => {

	for (let key in o2) {

		if (o2.hasOwnProperty(key) && typeof o1[key] == 'undefined') o1[key] = o2[key];
	}
	return o1;
};

/*
__mergeOver__ takes two objects and writes the attributes of one over the other. This function mutates the 'original' object rather than generating a third, new onject

Example:

    var original = { name: 'Peter', age: 42, job: 'lawyer' };
    var additional = { age: 32, job: 'coder', pet: 'cat' };
    scrawl.utils.mergeOver(original, additional);
    
    -> { name: 'Peter', age: 32, job: 'coder', pet: 'cat' }
*/
const mergeOver = (o1, o2) => {

	for (let key in o2) {

		if (o2.hasOwnProperty(key)) o1[key] = o2[key];
	}
	return o1;
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
const pushUnique = (item, o) => {

	if (xta(item, o) && Array.isArray(item)) {

		if (item.indexOf(o) < 0) item.push(o);

		return item;
	}
	return false;
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
const removeItem = (item, o) => {

	if (xta(item, o) && Array.isArray(item)) {

		let index = item.indexOf(o);

		if (index >= 0) item.splice(index, 1);

		return item;
	}
	return false;
};

/*
__xt__ checks to see if argument exists (is not 'undefined')
*/ 
const xt = (item) => {

	return (typeof item == 'undefined') ? false : true;
};

/*
__xta__ checks to make sure that all the arguments supplied to the function exist (none are 'undefined')
*/ 
const xta = (...args) => {

	if (args.length) {

		for (let i = 0, iz = args.length; i < iz; i++) {

			if (typeof args[i] === 'undefined') return false;
		}
		return true;
	}
	return false;
};

/*
__xtGet__ returns the first existing (not 'undefined') argument supplied to the function
*/ 
const xtGet = (...args) => {

	if (args.length) {

		for (let i = 0, iz = args.length; i < iz; i++) {

			if (typeof args[i] !== 'undefined') return args[i];
		}
	}
	return null;
};

/*
__xto__ checks to make sure that at least one of the arguments supplied to the function exists (is not 'undefined')
*/ 
const xto = (...args) => {

	if (args.length) {

		for (let i = 0, iz = args.length; i < iz; i++) {

			if (typeof args[i] !== 'undefined') return true;
		}
	}
	return false;
};

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
	loadScripts,
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
