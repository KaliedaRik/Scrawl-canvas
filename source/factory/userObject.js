/*
# User Object factory
*/
import { constructors } from '../core/library.js';
import { generateUuid } from '../core/utilities.js';

/*
## User Object constructor
*/
const UserObject = function (items = {}) {

	this.set(items);

	if (!this.name) this.name = generateUuid();

	return this;
};

/*
## UserObject object prototype setup
*/
let Uop = UserObject.prototype = Object.create(Object.prototype);


/*
## Define prototype functions
*/

/*

*/
Uop.set = function (items = {}) {

	let keys = Object.keys(items),
		i, iz, key;

	for (i = 0, iz = keys.length; i < iz; i++) {

		key = keys[i];
		this[key] = items[key];
	}
};

/*
## Exported factory function
*/
const makeUserObject = function (items) {
	return new UserObject(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.UserObject = UserObject;

export {
	makeUserObject,
};
