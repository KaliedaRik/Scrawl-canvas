/*
# Spring factory - this code is tempramental, not producing expected (desired) outcomes
*/
import { constructors, particle } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import { requestCoordinate, releaseCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';

/*
## Spring constructor
*/
const Spring = function (items = {}) {
	
	this.makeName(items.name);
	this.register();
	
	this.set(this.defs);
	this.set(items);

	return this;
};

/*
## Spring object prototype setup
*/
let P = Spring.prototype = Object.create(Object.prototype);
P.type = 'Spring';
P.lib = 'spring';
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

	// First Particle (the 'from' Particle) handle
	start: null,

	// Second Particle (the 'to' Particle) handle
	end: null,

	// Spring constant
	springConstant: 1000,

	// Spring damper constant
	damperConstant: 100,

	// Rest length, in pixels, between the Spring object's two Particle objects
	restLength: 1,
};
P.defs = mergeOver(P.defs, defaultAttributes);


let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;


S.start = function (item) {

	if (item) {

		if (item.substring) item = particle[item];

		if (item && item.type === 'Particle') {

			this.start = item;
			item.addSpring([this]);
		}
	}
};

S.end = function (item) {

	if (item) {

		if (item.substring) item = particle[item];

		if (item && item.type === 'Particle') {

			this.end = item;
			item.addSpring([this]);
		}
	}
};

P.attachParticle = function (item, asStart) {

	if (item) {

		if (item.substring) item = particle[item];

		if (item && item.type === 'Particle') {

			let name = item.name;

			if (this.start && this.start.name === name) this.start = item;
			else if (this.end && this.end.name === name) this.end = item;
		}
	}
};

P.detachParticle = function (item) {

	let isStart = false;

	if (item) {

		if (item.substring) item = particle[item];

		if (item && item.type === 'Particle') {

			let name = item.name;

			if (this.start && this.start.name === name) {

				isStart = 'start';
				this.start = null;
			}
			else if (this.end && this.end.name === name) {

				isStart = 'end';
				this.end = null;
			}
		}
	}
	return isStart;
};

/*
## Define prototype functions
*/

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
Physics calculation - not working as expected
*/
P.calculate = function(load) {

	let start = this.start,
		end = this.end,
		deltaVelocity = requestCoordinate(),
		deltaPosition = requestCoordinate(),
		deltaPositionNorm = requestCoordinate(),
		hold = requestCoordinate(),
		force = requestCoordinate(),
		length, springLength;

	deltaVelocity.setFromArray(end.currentVelocity).subtract(start.currentVelocity);
	deltaPosition.setFromArray(end.currentStampPosition).subtract(start.currentStampPosition);
	deltaPositionNorm.setFromArray(deltaPosition).normalize();
	hold.setFromArray(deltaPositionNorm);

	length = deltaPosition.getMagnitude() - this.restLength;
	springLength = this.springConstant * length;

	force.setFromArray(deltaPositionNorm).scalarMultiply(springLength);

	deltaVelocity.multiply(hold).scalarMultiply(this.damperConstant).multiply(hold);

	force.add(deltaVelocity);

	load.add(force);

	releaseCoordinate(deltaVelocity);
	releaseCoordinate(deltaPosition);
	releaseCoordinate(deltaPositionNorm);
	releaseCoordinate(hold);
	releaseCoordinate(force);

	return load;
};


/*
## Exported factory function
*/
const makeSpring = function (items) {
	
	return new Spring(items);
};

constructors.Spring = Spring;

export {
	makeSpring,
};
