/*
# Base mixin
*/
import * as library from '../core/library.js';
import { mergeOver, pushUnique, generateUuid, isa_fn, isa_vector, addStrings } from '../core/utilities.js';

import { makeVector } from '../factory/vector.js';

export default function (obj = {}) {

/*
Define the getters, setters and deltaSetters objects, and the defs object
*/
	let protoAttributes = {

/*
The __defs__ object supplies default values for a Scrawl-canvas object. Setter functions will check to see that a related defs attribute exists before allowing users to update an object attribute. Similarly the getter function will use the defs object to supply default values for an attribute that has not otherwise been set, or has been deleted by a user.
*/
		defs: {},
		
/*
The __getters__ object holds a suite of functions for given factory object attributes that need to have their values processed before they can be returned to the user.
*/
		getters: {},
		
/*
The __setters__ object holds a suite of functions for given factory object attributes that need to process a new value before setting it to the attribute.
*/
		setters: {},
		
/*
The __deltaSetters__ object holds a suite of functions for given factory object attributes that need to process a new value before adding it to the attribute's existing value.
*/
		deltaSetters: {}
	};
	obj = mergeOver(obj, protoAttributes);

/*
## Define attributes

All factories using the base mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*
Scrawl-canvas relies on unique __name__ values being present in a factory object for a wide range of functionalities. Most of the library sections store an object by its name value, for example: _scrawl.artefact.myelement_
*/
		name: '',

/*
We can store a datetime value, for when the factory object was created, in the __created__ attribute (default: 0-length string).
*/
		created: '',

/*
We can store a datetime value, for when the factory object was last updated, in the __updated__ attribute (default: 0-length string).
*/
		updated: '',

/*
We can store a string value in the __title__ attribute - for use by assistive technology (default: 0-length string).
*/
		title: '',

/*
We can store a string value in the __comment__ attribute - for use by assistive technology (default: 0-length string).
*/
		comment: '',
	};
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define functions to be added to the factory prototype
*/

/*
Retrieve an attribute value using the __get__ function. While many attributes can be retrieved directly - for example, _scrawl.artefact.myelement.scale_ - some attributes should only ever be retrieved using get:

    scrawl.artefact.myelement.get('startX');
    -> 200
*/
	obj.get = function (item) {

		let undef,
			g = this.getters[item],
			d, i;

		if (g) {

			return g.call(this);
		}
		else{

			d = this.defs[item];

			if (typeof d !== 'undefined') {

				i = this[item];
				return (typeof i !== 'undefined') ? i : d;
			}
			else {
				return undef;
			}
		}
	};

/*
Set an attribute value using the __set__ function. It is extremely important that all factory object attributes are set using the set function; setting an attribute directly will lead to unexpected behaviour! The set function takes a single object as its argument.

    scrawl.artefact.myelement.set({
        startX: 50,
        startY: 200,
        scale: 1.5,
        roll: 90,
    });
*/
	obj.set = function (items = {}) {

		let key, i, iz, s,
			setters = this.setters,
			keys = Object.keys(items),
			d = this.defs;

		for(i = 0, iz = keys.length; i < iz; i++){

			key = keys[i];

			if(key !== 'name'){

				s = setters[key];
				if(s){

					s.call(this, items[key]);
				}
				else if (typeof d[key] !== 'undefined') {

					this[key] = items[key];
				}
			}
		}
		return this;
	};

/*
Add a value to an existing attribute value using the __setDelta__ function. It is extremely important that all factory object attributes are updated using the setDelta function; updating an attribute directly will lead to unexpected behaviour! The setDelta function takes a single object as its argument.

    scrawl.artefact.myelement.setDelta({
        startX: 10,
        startY: -20,
        scale: 0.05,
        roll: 5,
    });
*/
	obj.setDelta = function (items = {}) {

		let key, i, iz, s, item,
			setters = this.deltaSetters,
			keys = Object.keys(items),
			d = this.defs;

		for(i = 0, iz = keys.length; i < iz; i++){

			key = keys[i];

			if(key !== 'name'){

				item = items[key];
				s = setters[key];

				if(s){

					s.call(this, item);
				}
				else if (typeof d[key] !== 'undefined') {

					this[key] = addStrings(this[key], item);
				}
			}
		}
		return this;
	};

/*
Most Scrawl-canvas factory objects can be copied using the __clone__ function. The result will be an exact copy of the original, additionally set with values supplied in the argument object.

    scrawl.artefact.myelement.clone({
        name: 'myclonedelement',
        startY: 60,
    });
*/
	obj.clone = function (items = {}) {

		let copied, clone, keys, key,
			that, i, iz;

		copied = JSON.parse(JSON.stringify(this));
		copied.name = (items.name) ? items.name : generateUuid();

		keys = Object.keys(this);
		that = this;

		for (i = 0, iz = keys.length; i < iz; i++) {

			key = keys[i];

			if(/^(local|dirty|current)/.test(key)){
				delete copied[key];
			}
			if (isa_fn(this[key])) {
				copied[key] = that[key];
			}
		}

		clone = new library.constructors[this.type](copied);
		clone.set(items);
		return clone;
	};

/*
Get a record of a factory object using the __saveOut__ function. The object returned will contain only non-default attribute values. Passing _true_ as an argument will result in a JSON string of the result object being returned.
*/
	obj.saveOut = function (asString = false) {

		let d = this.defs,
			keys = Object.keys(d),
			i, iz, item,
			result = {};

		for(i = 0, iz = keys.length; i < iz; i++){

			item = keys[i];

			switch(item){

				case 'name' :
					result.name = this.name;

				default :
					if(this[item] !== d[item]){
						result[item] = this[item];
					}
			}
		}
		return (asString) ? JSON.stringify(result) : result;
	};

/*
Functions for checking that a given attribute is a vector or array, and supplying new vectors or arrays if this is not the case.
*/
	obj.checkVector = function (v) {

		if (v) {

			if (!isa_vector(this[v])) {

				this[v] = makeVector({
					name: `${this.name}_${v}`
				});
			}
		}
	};

/*
If the user/coder doesn't supply a name value for a factory function, then Scrawl-canvas will generate a random name for the object to use.
*/
	obj.makeName = function (item) {

		if (item && item.substring && library[`${this.lib}names`].indexOf(item) < 0) this.name = item;				
		else this.name = generateUuid();

		return this;
	};

/*
Many (but not all) factory functions will register their result objects in the scrawl lobrary. The section where the object is stored is dependent on the factory function's type value. Some objects are stored in more than one place - for example the artefacts section will include Stack, Element and Canvas objects in addition to various Entity objects
*/
	obj.register = function () {

		let arr = library[`${this.lib}names`],
			mylib = library[this.lib];

		if(this.name){

			if(this.artefact){

				pushUnique(library.artefactnames, this.name);
				library.artefact[this.name] = this;
			}

			pushUnique(arr, this.name);
			mylib[this.name] = this;
		}

		return this;
	};

	return obj;
};
