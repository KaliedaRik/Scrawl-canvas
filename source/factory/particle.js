/*
# Particle factory
*/

import { constructors, force, spring, particle, artefact, group } from '../core/library.js';
import { mergeOver, defaultZeroReturnFunction, defaultBlankStringReturnFunction, defaultNonReturnFunction, addStrings, defaultFalseReturnFunction, defaultThisReturnFunction, mergeDiscard, xt, xta, isa_fn } from '../core/utilities.js';
import { currentCorePosition } from '../core/userInteraction.js';
import { currentGroup } from '../core/document.js';

import { makeCoordinate, requestCoordinate, releaseCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';

/*
## Particle constructor
*/
const Particle = function (items = {}) {
	
	this.makeName(items.name);
	this.register();
	
	this.set(this.defs);

	this.initializePositions();
	if (!items.group) items.group = currentGroup;

	this.set(items);

	return this;
};

/*
## Particle object prototype setup
*/
let P = Particle.prototype = Object.create(Object.prototype);
P.type = 'Particle';
P.lib = 'particle';
P.isArtefact = true;
P.isAsset = false;


/*
Apply mixins to prototype object
*/
P = baseMix(P);


/*
## Define default attributes
*/
let defaultAttributes = {

	host: null,
	group: null,

	// For position attributes, we assume 1px === 1 meter
	start: null,
	offset: null,
	delta: null,	

	// Velocity will updates during the course of a physics model run, in line with the forces, springs and collisions acting on the particle. Can be set with an initial velocity, but don't mess with this attribute during the run.
	velocity: null,

	// Flag that determines whether to calculate position using start/delta functionality (true) or physics functionality (false, default)
	isFixed: false,

	// Particle mass value, in kilograms
	mass: 1,

	// Particle radius, in meters
	radius: 0.1,

	// Projected surface area - assumed to be of a sphere - in square meters
	area: 0.03,

	// Air drag coefficient - assumed to be operating on a smooth sphere
	drag: 0.42,

	// Elasticity coefficient, where 0.0 = 100% elastic and 1.0 is 100% inelastic
	elasticity: 1,

	// arrays to hold Spring and Force objects
	springs: null,
	forces: null,

	// Particle calculator engine - a String value. 
	// Current engines include: 'rungeKutter' (most accurate), 'improvedEuler', 'euler' (default)
	engine: 'euler',

	isFirstRun: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*
The start coordinates set the particle position at the start of any model run. They don't change as the model runs.

Start should act like any other artefact start coordinate, accepting absolute (number) and relative (% string or nameString) values. 

Note that Particles cannot be pivoted, or mimic other artefacts, or use a Shape entity path - if such functionality is required, use a non-visible Block entity with zero dimensions instead.

For constant velocities unaffected by any force or spring, use delta functionality applied to the start coordinates.

To make a particle use its start coordinates throughout a model run, set the __isFixed__ flag to true.
*/
G.startX = function () {

	return this.currentStart[0];
};

G.startY = function () {

	return this.currentStart[1];
};

S.startX = function (coord) {

	if (coord != null) {

		this.start[0] = coord;
		this.dirtyStart = true;
	}
};

S.startY = function (coord) {

	if (coord != null) {

		this.start[1] = coord;
		this.dirtyStart = true;
	}
};

S.start = function (x, y) {

	this.setCoordinateHelper('start', x, y);
	this.dirtyStart = true;
};

D.startX = function (coord) {

	let c = this.start;
	c[0] = addStrings(c[0], coord);
	this.dirtyStart = true;
};

D.startY = function (coord) {

	let c = this.start;
	c[1] = addStrings(c[1], coord);
	this.dirtyStart = true;
};

D.start = function (x, y) {

	this.setDeltaCoordinateHelper('start', x, y);
	this.dirtyStart = true;
};

/*

*/
G.positionX = function () {

	return this.currentStampPosition[0];
};

G.positionY = function () {

	return this.currentStampPosition[1];
};

/*
For constant velocities unaffected by any force or spring, use delta functionality
*/
G.velocityX = function () {

	return this.velocity[0];
};

G.velocityY = function () {

	return this.velocity[1];
};

S.velocityX = function (coord) {

	if (coord != null) {

		this.velocity[0] = coord;
		this.dirtyVelocity = true;
	}
};

S.velocityY = function (coord) {

	if (coord != null) {

		this.velocity[1] = coord;
		this.dirtyVelocity = true;
	}
};

S.velocity = function (x, y) {

	this.setCoordinateHelper('velocity', x, y);
	this.dirtyVelocity = true;
};

/*

*/
S.delta = function (items = {}) {

	if (items) this.delta = mergeDiscard(this.delta, items);
};

S.host = function (item) {

	if (item) {

		let host = artefact[item];

		if (host && host.here) this.host = host.name;
		else this.host = item;
	}
	else this.host = '';

	this.dirtyDimensions = true;
	this.dirtyHandle = true;
	this.dirtyStart = true;
	this.dirtyOffset = true;
};

S.group = function (item) {

	let g;

	if (item) {

		if (this.group && this.group.type === 'Group') this.group.removeArtefacts(this.name);

		if (item.substring) {

			g = group[item];

			if (g) this.group = g;
			else this.group = item;
		}
		else this.group = item;
	}

	if (this.group && this.group.type === 'Group') this.group.addArtefacts(this.name);
};

S.forces = function (items) {

	this.addForce(items);
};

// TODO: determine whether we want a springs array setter - my current thinking is: too complex to be handled in particle initialization because purpose of spring is to link 2 particles


/*
## Define prototype functions
*/

P.getBasicData = function () {

	return {
		w: 0,
		h: 0,

		roll: 0,
		scale: 0,
		visibility: false,

		x: this.currentStampPosition[0],
		y: this.currentStampPosition[1],
		startX: this.currentStart[0],
		startY: this.currentStart[1],
		offsetX: 0,
		offsetY: 0,
		handleX: 0,
		handleY: 0,

		pivot: false,
		path: false,
		mimic: false,

		lockX: 'start',
		lockY: 'start',
		isBeingDragged: false,
	};
};

P.initializePositions = function () {

	this.start = makeCoordinate();
	this.currentStart = makeCoordinate();

	this.velocity = makeCoordinate();
	this.currentVelocity = makeCoordinate();

	this.currentStampPosition = makeCoordinate();
	this.previousStampPosition = makeCoordinate();

	this.currentHandle = [0, 0];
	this.currentOffset = [0, 0];
	this.currentRotation = 0;

	this.pivoted = [];
	this.controlSubscriber = [];
	this.startControlSubscriber = [];
	this.endControlSubscriber = [];
	this.endSubscriber = [];

	this.springs = [];
	this.forces = [];

	this.dirtyStart = true;
	this.dirtyVelocity = true;

	this.isFirstRun = true;
};

/*
Adapted from mixin/position.js functions
*/
P.getHost = function () {

	if (this.currentHost) return this.currentHost;
	else if (this.group) {

		let grp = this.group,
			host = grp.currentHost;

		if (host) {

			this.currentHost = host;
			this.dirtyHost = true;
			return this.currentHost;
		}
	}
	return false;
};

P.getHere = function () {

	let host = this.getHost();

	if (host) {

		if (host.here) return host.here;
		else if (host.currentDimensions) {

			let dims = host.currentDimensions;

			if (dims) {

				return {
					w: dims[0],
					h: dims[1]
				}
			}
		}
	}
	return false;
};

/*
Same as mixin/position.js function
*/
P.setCoordinateHelper = function (label, x, y) {

	let c = this[label];

	if (Array.isArray(x)) {

		c[0] = x[0];
		c[1] = x[1];
	}
	else {

		c[0] = x;
		c[1] = y;
	}
};

P.setDeltaCoordinateHelper = function (label, x, y) {

	let c = this[label],
		myX = c[0],
		myY = c[1];

	if (Array.isArray(x)) {

		c[0] = addStrings(myX, x[0]);
		c[1] = addStrings(myY, x[1]);
	}
	else {

		c[0] = addStrings(myX, x);
		c[1] = addStrings(myY, y);
	}
};

/*
Start (and velocity) coordinates can accept both numbers (absolute positioning) and strings (relative positioning) - hence the need to clean them
*/
P.cleanPosition = function (current, source, dimensions) {

	let val, dim;

	for (let i = 0; i < 2; i++) {

		val = source[i];
		dim = dimensions[i];

		if (val.toFixed) current[i] = val;
		else if (val === 'left' || val === 'top') current[i] = 0;
		else if (val === 'right' || val === 'bottom') current[i] = dim;
		else if (val === 'center') current[i] = dim / 2;
		else current[i] = (parseFloat(val) / 100) * dim;
	}
};

P.cleanStart = function (here) {

	this.dirtyStart = false;

	if (xt(here)) {

		if (xta(here.w, here.h)) this.cleanPosition(this.currentStart, this.start, [here.w, here.h]);
		else this.dirtyStart = true;
	}
	else this.dirtyStart = true;
};

P.cleanVelocity = function (here) {

	this.dirtyVelocity = false;

	if (xt(here)) {

		if (xta(here.w, here.h)) this.cleanPosition(this.currentVelocity, this.velocity, [here.w, here.h]);
		else this.dirtyVelocity = true;
	}
	else this.dirtyVelocity = true;
};

/*
Overwrites mixin/base.js functionality
*/
P.clone = function (items) {

	let self = this,
		regex = /^(local|dirty|current)/;

	let grp = this.group;
	this.group = grp.name;
	
	let host = this.currentHost;
	delete this.currentHost;

	let forces = this.forces;
	delete this.forces;

	let springs = this.springs;
	delete this.springs;

	let copied = JSON.parse(JSON.stringify(this));
	copied.name = (items.name) ? items.name : generateUuid();

	this.group = grp;
	this.currentHost = host;
	this.forces = forces;
	this.springs = springs;

	Object.entries(this).forEach(([key, value]) => {

		if (regex.test(key)) delete copied[key];
		if (isa_fn(this[key])) copied[key] = self[key];
	}, this);

	let clone = new Particle(copied);
	clone.set(items);

	clone.addForce(forces);
	clone.addSpring(springs);

	return clone;
};

/*
Argument for add/remove force/spring functions must be an array of String force/springnames and/or the force/spring objects themselves
*/
P.addForce = function (args) {

	if(Array.isArray(args)) {

		let forces = this.forces,
			currentForcenames = forces.map(item => item.name);

		args.forEach(myforce => {

			if (myforce.substring) myforce = force[myforce];

			if (myforce && currentForcenames.indexOf(myforce.name) < 0) forces.push(myforce);
		});
	}
	return this;
};

P.removeForce = function (args) {

	if (Array.isArray(args)) {

		let forces = this.forces,
			currentForcenames = forces.map(item => item.name),
			indexes = [], test;

		args.forEach((myforce) => {

			if (myforce.substring) myforce = force[myforce];

			if (myforce) {

				test = currentForcenames.indexOf(myforce.name);
				if (test >= 0) indexes.push(test);
			};
		});

		indexes.forEach(i => forces[i] = false);

		forces = forces.filter(f => f !== false);
	}
	return this;
};

P.addSpring = function (args) {

	if (Array.isArray(args)) {

		let springs = this.springs,
			currentSpringnames = springs.map(item => item.name);

		args.forEach(myspring => {

			if (myspring.substring) myspring = spring[myspring];

			if (myspring && !currentSpringnames.indexOf(myspring.name) >= 0) {

				springs.push(myspring);

				myspring.set({
					particle: this,
				});
			};
		});
	}
	return this;
};

P.removeSpring = function (args) {

	if (Array.isArray(args)) {

		let springs = this.springs,
			currentSpringnames = springs.map(item => item.name),
			indexes = [], test;

		args.forEach(myspring => {

			if (myspring.substring) myspring = force[myspring];

			if (myspring) {

				test = currentSpringnames.indexOf(myspring.name);
				if (test >= 0) indexes.push(test);
			};
		});

		indexes.forEach(i => springs[i] = false);

		springs = springs.filter(s => s !== false);
	}
	return this;
};

P.moveSpringTo = function (myspring, myparticle) {

	if (myspring && myspring.substring) myspring = spring[myspring];
	if (myparticle && myparticle.substring) myparticle = particle[myparticle];

	if (xta(myspring, myparticle) && myspring.type === 'Spring' && myparticle.type === 'Particle') {

		this.removeSpring(myspring);

		let attachment = myspring.detachParticle(this);

		if (attachment) {

			myspring.attachParticle(myparticle, attachment);
			myparticle.addSpring(myspring);
		}
	}
	return this;
};

/* 
needs to return a promise? Not prepareStamp. stamp has to return a promise

We need to:

1. check dirtyStart and dirtyVelocity, and clean if required - will always do this, even if isFixed flag is false (so we can capture initial start/velocity values)

2. Perform the calculations - this will differ according to whether isFixed is true or false

a. isFixed === true; use currentStart and delta changes

b. isFixed === false; use physics functionality

3. In both cases, it is the currentStampPosition values which get updated (no need to check for associated dirty flag because we're assuming these will always change, thus always need to be updated on each cycle)

... that's all we're doing. Particles never show up visibly on the canvas/stack - instead artefacts pivot to them and get positioned accordingly.
*/
P.prepareStamp = function () {

	let here = this.getHere(),
		stamp = this.currentStampPosition,
		previous = this.previousStampPosition,
		start, velocity;

	if (this.isFirstRun) {

		if (here) {

			this.isFirstRun = false;

			this.cleanStart(here);
			this.cleanVelocity(here);

			start = this.currentStart;
			velocity = this.currentVelocity;

			stamp[0] = start[0];
			stamp[1] = start[1];

			this.lastTimeCheck = Date.now();
			this.deltaTime = 0;
		}
	}

	previous.setFromArray(stamp);

	if (this.isFixed) {

		if (this.dirtyVelocity) this.cleanVelocity(here);

		if (velocity[0] || velocity[1]) {

			velocity = this.currentVelocity;

			stamp[0] += velocity[0];
			stamp[1] += velocity[1];
		}
		else {

			this.updateByDelta();

			start = this.currentStart;

			stamp[0] = start[0];
			stamp[1] = start[1];
		}
	}
	else {

		let now = Date.now();

		this.deltaTime = (now - this.lastTimeCheck) / 1000;
		this.lastTimeCheck = now;

		let deltaTime = this.deltaTime;

		if (deltaTime) {

			let eng = this.engine;

			switch (eng) {

				case 'improvedEuler' :
					this.updateImprovedEuler(deltaTime);
					break;

				case 'rungeKutter' :
					this.updateRungeKutter(deltaTime);
					break;

				default :
					this.updateEuler(deltaTime);
			}
		}
	} 
	this.updatePositionSubscribers();
};

// All the work gets done in prepareStamp, which is synchronous
// - if we ever need to move to asynchronous processing (eg web workers) then that functionality will need to move here
P.stamp = P.forceStamp = function() {

	return Promise.resolve(true);
};

/*
Forces (and springs) get calculated for each particle on each cycle
*/
P.apply = function (load) {

	this.forces.forEach(f => f.calculate(load, this), this);
	this.springs.forEach(s => s.calculate(load));

	return load;
};

/*
The physics engines code
*/
P.updateImprovedEuler = function (deltaTime) {

	let load = requestCoordinate(),
		currentVelocity = this.currentVelocity,
		stamp = this.currentStampPosition;

	load = this.apply(load);

	let temp1 = requestCoordinate(),
		temp2 = requestCoordinate();

	temp1.setFromArray(load).scalarDivide(this.mass).scalarMultiply(deltaTime);
	temp2.setFromArray(load).add(temp1).scalarDivide(this.mass).scalarMultiply(deltaTime);

	temp1.add(temp2).scalarDivide(2);

	currentVelocity.add(temp1);

	load.setFromArray(currentVelocity).scalarMultiply(deltaTime);

	stamp.add(load);

	releaseCoordinate(load);
	releaseCoordinate(temp1);
	releaseCoordinate(temp2);
};

P.updateRungeKutter = function (deltaTime) {

	let load = requestCoordinate(),
		currentVelocity = this.currentVelocity,
		stamp = this.currentStampPosition;

	load = this.apply(load);

	let temp1 = requestCoordinate(),
		temp2 = requestCoordinate(),
		temp3 = requestCoordinate(),
		temp4 = requestCoordinate();

	temp1.setFromArray(load).scalarDivide(this.mass).scalarMultiply(deltaTime);
	temp2.setFromArray(load).add(temp1).scalarDivide(this.mass).scalarMultiply(deltaTime);
	temp3.setFromArray(load).add(temp2).scalarDivide(this.mass).scalarMultiply(deltaTime);
	temp4.setFromArray(load).add(temp3).scalarDivide(this.mass).scalarMultiply(deltaTime);

	temp2.scalarMultiply(2);
	temp3.scalarMultiply(2);

	temp1.add(temp2).add(temp3).add(temp4).scalarDivide(6);

	currentVelocity.add(temp1);

	load.setFromArray(currentVelocity).scalarMultiply(deltaTime);

	stamp.add(load);

	releaseCoordinate(load);
	releaseCoordinate(temp1);
	releaseCoordinate(temp2);
	releaseCoordinate(temp3);
	releaseCoordinate(temp4);
};

P.updateEuler = function (deltaTime) {

	let load = requestCoordinate(),
		currentVelocity = this.currentVelocity,
		stamp = this.currentStampPosition;

	load = this.apply(load);

	load.scalarDivide(this.mass).scalarMultiply(deltaTime);

	currentVelocity.add(load);

	load.setFromArray(currentVelocity).scalarMultiply(deltaTime);

	stamp.add(load);

	releaseCoordinate(load);
};

P.linearCollide = function (otherParticle) {

	let myStamp = this.currentStampPosition,
		otherStamp = otherParticle.currentStampPosition,
		myVelocity = this.currentVelocity,
		otherVelocity = otherParticle.currentVelocity,
		myMass = this.mass,
		otherMass = otherParticle.mass,
		normal = requestCoordinate(),
		relativeVelocity = requestCoordinate();

	normal.setFromArray(myStamp).vectorSubtract(otherStamp).normalize();
	relativeVelocity.setFromArray(myVelocity).vectorSubtract(otherVelocity);

	let impactScalar = relativeVelocity.getDotProduct(normal),
		impact = requestCoordinate(),
		temp = requestCoordinate();

	impactScalar = -impactScalar * (1 + ((this.elasticity + otherParticle.elasticity) / 2));
	impactScalar /= ((1 / myMass) + (1 / otherMass));

	impact.setFromArray(normal).scalarMultiply(impactScalar);

	temp.setFromArray(impact).scalarDivide(myMass);
	myVelocity.add(temp);

	temp.setFromArray(impact).scalarDivide(otherMass).reverse();
	otherVelocity.add(temp);

	releaseCoordinate(normal);
	releaseCoordinate(relativeVelocity);
	releaseCoordinate(impact);
	releaseCoordinate(temp);
};

/*
Delta functions are all the same as mixin/position.js functions
*/
P.updateByDelta = function () {

	this.setDelta(this.delta);

	return this;
};

P.reverseByDelta = function () {

	let temp = {};
	
	Object.entries(this.delta).forEach(([key, val]) => {

		if (val.substring) val = -(parseFloat(val)) + '%';
		else val = -val;

		temp[key] = val;
	});

	this.setDelta(temp);

	return this;
};

P.setDeltaValues = function (items = {}) {

	let delta = this.delta, 
		oldVal, action;

	Object.entries(items).forEach(([key, requirement]) => {

		if (xt(delta[key])) {

			action = requirement;

			oldVal = delta[key];

			switch (action) {

				case 'reverse' :
					if (oldVal.toFixed) delta[key] = -oldVal;
					// TODO: reverse String% (and em, etc) values
					break;

				case 'zero' :
					if (oldVal.toFixed) delta[key] = 0;
					// TODO: zero String% (and em, etc) values
					break;

				case 'add' :
					break;

				case 'subtract' :
					break;

				case 'multiply' :
					break;

				case 'divide' :
					break;
			}
		}
	})
	return this;
};

/*
Assuming that updates will occur on every cycle - necessary because particles are invisible, and their positions will only matter to artefacts pivoting to them
*/
P.updatePositionSubscribers = function () {

	if (this.pivoted && this.pivoted.length) this.updatePivotSubscribers();
	if (this.controlSubscriber && this.controlSubscriber.length) this.updateControlSubscribers();
	if (this.startControlSubscriber && this.startControlSubscriber.length) this.updateStartControlSubscribers();
	if (this.endControlSubscriber && this.endControlSubscriber.length) this.updateEndControlSubscribers();
	if (this.endSubscriber && this.endSubscriber.length) this.updateEndSubscribers();

};

P.updateControlSubscribers = function () {

	this.controlSubscriber.forEach(name => {

		let instance = artefact[name];

		if (instance) instance.dirtyControl = true;
	});
};

P.updateStartControlSubscribers = function () {

	this.startControlSubscriber.forEach(name => {

		let instance = artefact[name];

		if (instance) instance.dirtyStartControl = true;
	});
};

P.updateEndControlSubscribers = function () {

	this.endControlSubscriber.forEach(name => {

		let instance = artefact[name];

		if (instance) instance.dirtyEndControl = true;
	});
};

P.updateEndSubscribers = function () {

	this.endSubscriber.forEach(name => {

		let instance = artefact[name];

		if (instance) instance.dirtyEnd = true;
	});
};

P.updatePivotSubscribers = function () {

	this.pivoted.forEach(name => {

		let instance = artefact[name];

		if (instance) instance.dirtyStampPositions = true;
	});
};


/*
## Exported factory function
*/
const makeParticle = function (items) {
	
	return new Particle(items);
};

constructors.Particle = Particle;

export {
	makeParticle,
};
