/*
# User Object factory

TODO - documentation

#### To instantiate objects from the factory

#### Library storage

#### Clone functionality

#### Kill functionality
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
let P = UserObject.prototype = Object.create(Object.prototype);


/*
## Define prototype functions
*/

/*
TODO - documentation
*/
P.set = function (items = {}) {

	Object.entries(items).forEach(([key, value]) => this[key] = items[key]);
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


/*
TODO - documentation
*/
export {
	makeUserObject,
};
