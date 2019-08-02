/*
# Force factory - code appears to be working as expected, but can almost certainly be improved
*/

import { constructors } from '../core/library.js';
import { mergeOver, isa_fn, mergeDiscard } from '../core/utilities.js';

import { requestCoordinate, releaseCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';

/*
## Force constructor
*/
const Force = function (items = {}) {
	
	let argObject = items;

	if (isa_fn(items)) {

		argObject = {};
		argObject.fn = items;
	}

	if (!isa_fn(argObject.fn)) argObject.fn = (l, p) => l;

	this.makeName(argObject.name);
	this.register();
	
	this.set(this.defs);

	this.args = {};

	this.set(argObject);

	return this;
};

/*
## Force object prototype setup
*/
let P = Force.prototype = Object.create(Object.prototype);
P.type = 'Force';
P.lib = 'force';
P.isArtefact = false;
P.isAsset = false;


/*
Apply mixins to prototype object
*/
P = baseMix(P);


/*
## Define default attributes
*/
let defaultAttributes = {

	// The function is where a particular force gets calculated for a particular particle
	fn: null,

	// The args object is where we can store attributes specific to the calculation of a force. Included so we can clone (and save/load) force objects. Otherwise, users/coders would have to stick such attribute values into their local code, or the browser's global scope (which we don't want)
	args: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

S.args = function (items) {

	if (items) this.args = mergeDiscard(this.args, items);
};


/*
Physics calculation - the force function can be anything. All we're doing here is invoking it for a given load coordinate array on a given particle object
*/
P.calculate = function (load, particle) {

	load = this.fn(load, particle);
	return load;
};

/*
TODO - Currently a copy of mixin/base.js function
*/
P.clone = function (items) {

	let self = this,
		regex = /^(local|dirty|current)/;

	let copied = JSON.parse(JSON.stringify(this));
	copied.name = (items.name) ? items.name : generateUuid();

	Object.entries(this).forEach(([key, value]) => {

		if (regex.test(key)) delete copied[key];
		if (isa_fn(this[key])) copied[key] = self[key];
	}, this);

	let clone = new Particle(copied);
	clone.set(items);

	return clone;
};


/*
## Exported factory function
*/
const makeForce = function (items) {
	
	return new Force(items);
};

constructors.Force = Force;

/*
## Some default forces, for convenience
*/
makeForce({
	name: 'defaultGravity',
	args: {
		gravity: 9.8,
	},
	fn: function (load, particle) {
		load[1] += particle.mass * this.args.gravity;
		return load;
	}
});

makeForce({
	name: 'defaultDrag',
	args: {
		airDensity: 1.23,
	},
	fn: function (load, particle) {

		let coord = requestCoordinate(),
			currentVelocity = particle.currentVelocity;

		coord.setFromArray(currentVelocity);

		let d = coord.reverse().normalize(),
			s = currentVelocity.getMagnitude(),
			df = 0.5 * this.args.airDensity * s * s * particle.area * particle.drag;

		d.scalarMultiply(df);

		load.add(d);

		releaseCoordinate(coord);

		return load;
	}
});


export {
	makeForce,
};
