import { constructors } from '../core/library.js';
import { generateUuid } from '../core/utilities.js';
const UserObject = function (items = {}) {
this.set(items);
if (!this.name) this.name = generateUuid();
return this;
};
let P = UserObject.prototype = Object.create(Object.prototype);
P.set = function (items = {}) {
Object.entries(items).forEach(([key, value]) => this[key] = items[key]);
};
const makeUserObject = function (items) {
return new UserObject(items);
};
constructors.UserObject = UserObject;
export {
makeUserObject,
};
