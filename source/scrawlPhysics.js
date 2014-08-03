//---------------------------------------------------------------------------------
// The MIT License (MIT)
//
// Copyright (c) 2014 Richard James Roots
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//---------------------------------------------------------------------------------

/**
# scrawlPhysics

## Purpose and features

Adds an (experimental) physics engine to the core

* Adds Particle, Spring and Force objects to the mix
* Defines a number of engines for calculating interactions between these objects

@module scrawlPhysics
**/

var scrawl = (function(my){
	'use strict';

/**
# window.scrawl

scrawlPhysics module adaptions to the Scrawl library object

## New library sections

* scrawl.force - for Force objects
* scrawl.spring - for Spring objects
* scrawl.physics - an area for storing physics constants and variables that affect multiple particles

Particle objects are treated like sprites, and stored in the scrawl.sprite section of the library

@class window.scrawl_Physics
**/

/**
An Object containing parameter:value pairs representing the physical parameters within which a physics model operates
@property physics
@type {Object}
**/
	my.physics = {
/**
Gravity - positive values are assumed to act downwards from the top of the &lt;canvas&gt; element. Measured in meters per second squared
@property physics.gravity
@type Number
@default 9.8
**/		
		gravity: 9.8,
/**
Air density, measured in kilograms per cubic meter; default is air density at seal level
@property physics.airDensity
@type Number
@default 1.23
**/		
		airDensity: 1.23,
/**
Change in time since last update, measured in seconds
@property physics.deltaTime
@type Number
@default 0
**/		
		deltaTime: 0,
		};
	my.workphys = {
		v1: my.newVector(),
		v2: my.newVector(),
		v3: my.newVector(),
		v4: my.newVector(),
		v5: my.newVector(),
		};
/**
A __general__ function to undertake a round of calculations for Spring objects
@method updateSprings
@param {Array} [items] Array of SPRINGNAMES; defaults to all Spring objects
@return True on success; false otherwise
**/
	my.updateSprings = function(items){
		if(my.springnames.length > 0){
			var s = [];
			items = (my.isa(items,'arr')) ? items : my.springnames;
			for(var i = 0, iz = items.length; i < iz; i++){
				s.push((my.isa(items[i],'obj')) ? items[i] : ((my.isa(items[i],'str')) ? my.spring[items[i]] : false));
				}
			for(var j = 0, jz = s.length; j < jz; j++){
				if(s[j]){
					s[j].update();
					}
				}
			return true;
			}
		return false;
		};
/**
scrawl.init hook function - modified by physics module

Initiates two forces:

* force.gravity() - gravity force at sea level
* force.drag() - air drag force at sea level
@method physicsInit
**/
	my.physicsInit = function(){
		my.newForce({
			name: 'gravity',
			fn: function(ball){
				ball.load.vectorAdd({y: ball.mass * my.physics.gravity});
				},
			});
		my.newForce({
			name: 'drag',
			fn: function(ball){
				var d, s, df;
				ball.resetWork();
				d = ball.work.velocity.reverse().normalize();
				s = ball.velocity.getMagnitude();
				df = 0.5 * my.physics.airDensity * s * s * ball.get('area') * ball.get('drag');
				d.scalarMultiply(df);
				ball.load.vectorAdd(d);
				},
			});
		};
/**
A __factory__ function to generate new Particle objects
@method newParticle
@param {Object} items Key:value Object argument for setting attributes
@return Particle object
**/
	my.newParticle = function(items){
		return new my.Particle(items);
		};
/**
A __factory__ function to generate new Spring objects
@method newSpring
@param {Object} items Key:value Object argument for setting attributes
@return Spring object
**/
	my.newSpring = function(items){
		return new my.Spring(items);
		};
/**
A __factory__ function to generate new Force objects
@method newForce
@param {Object} items Key:value Object argument for setting attributes
@return Force object
**/
	my.newForce = function(items){
		return new my.Force(items);
		};
		
/**
# Particle
	
## Instantiation

* scrawl.newParticle()

## Purpose

* Defines Particle object, for physics simulations

## Access

* scrawl.sprite.PARTICLENAME - for the Animation object

@class Particle
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Particle = function(items){
		my.Base.call(this, items);
		items = my.safeObject(items);
		this.place = my.newVector();
		this.work.place = my.newVector();
		this.velocity = my.newVector();
		this.work.velocity = my.newVector();
		this.set(items);
		this.priorPlace = my.newVector(this.place);
		this.engine = items.engine || 'euler';
		this.userVar = items.userVar || {};
		this.mobile = (my.isa(items.mobile,'bool')) ? items.mobile : true;
		this.forces = items.forces || [];
		this.springs = items.springs || [];
		this.mass = items.mass || my.d.Particle.mass;
		this.elasticity = items.elasticity || my.d.Particle.elasticity;
		this.radius = items.radius || my.d.Particle.radius;
		if(items.radius || items.area){
			this.area = items.area || 2 * Math.PI * this.get('radius') * this.get('radius') || my.d.Particle.area;
			}
		this.load = my.newVector();
		my.sprite[this.name] = this;
		my.pushUnique(my.spritenames, this.name);
		this.group = my.Sprite.prototype.getGroup.call(this, items);
		my.group[this.group].addSpritesToGroup(this.name);
		return this;
		};
	my.Particle.prototype = Object.create(my.Base.prototype);
/**
@property type
@type String
@default 'Particle'
@final
**/		
	my.Particle.prototype.type = 'Particle';
	my.Particle.prototype.classname = 'spritenames';
	my.Particle.prototype.order = 0;	//included to allow normal sprites to sort themselves properly
	my.d.Particle = {
/**
Current group
@property group
@type String
@default ''
**/		
		group: '',
		order: 0,
/**
Mobility flag; when false, particle is fixed to the Cell at its position attribute coordinate vector
@property mobile
@type Boolean
@default true
**/		
		mobile: true,
/**
Particle mass value, in kilograms
@property mass
@type Number
@default 1
**/		
		mass: 1,
/**
Particle radius, in meters
@property radius
@type Number
@default 0.1
**/		
		radius: 0.1,
/**
Projected surface area - assumed to be of a sphere - in square meters
@property area
@type Number
@default 0.03
**/		
		area: 0.03,
/**
Air drag coefficient - assumed to be operating on a smooth sphere
@property drag
@type Number
@default 0.42
**/		
		drag: 0.42,
/**
Elasticity coefficient, where 0.0 = 100% elastic and 1.0 is 100% inelastic
@property elasticity
@type Number
@default 1
**/		
		elasticity: 1,
/**
Object in which user key:value pairs can be stored - clonable
@property userVar
@type Object
@default {}
**/		
		userVar: {},
/**
Position vector - assume 1 pixel = 1 meter

Vector attributes can be set using the following alias attributes:

* place.x - __startX__ or __start.x__
* place.y - __startY__ or __start.y__
@property place
@type Vector
@default Zero values vector
**/		
		place: {x:0,y:0,z:0},
/**
Velocity vector - assume 1 pixel = 1 meter per second

Vector attributes can be set using the following alias attributes:

* velocity.x - __deltaX__ or __delta.x__
* velocity.y - __deltaY__ or __delta.y__
@property velocity
@type Vector
@default Zero values vector
**/		
		velocity: {x:0,y:0,z:0},
/**
Particle calculator engine - a String value. 

Current engines include: 'rungeKutter' (most accurate), 'improvedEuler', 'euler' (default)
@property engine
@type String
@default 'euler'
**/		
		engine: 'euler',
/**
An Array containing FORCENAME Strings and/or force Functions
@property forces
@type Array
@default []
**/		
		forces: [],
/**
An Array containing SPRINGNAME Strings
@property springs
@type Array
@default []
**/		
		springs: [],
/**
Load Vector - recreated at the start of every calculation cycle iteration
@property load
@type Vector
@default Zero vector
@private
**/		
		load: my.newVector(),
		};
	my.mergeInto(my.d.Particle, my.d.Scrawl);
/**
Augments Base.set()

Allows users to set the Particle's position and velocity attributes using startX, startY, start, deltaX, deltaY, delta values
@method set
@param {Object} items Object consisting of key:value attributes
@return This
@chainable
**/
	my.Particle.prototype.set = function(items){
		items = my.safeObject(items);
		var temp;
		my.Base.prototype.set.call(this, items);
		if(!this.place.type || this.place.type !== 'Vector'){
			this.place = my.newVector(items.place || this.place);
			}
		if(my.xto([items.start, items.startX, items.startY])){
			temp = (my.isa(items.start,'obj')) ? items.start : {};
			this.place.x = (my.xt(items.startX)) ? items.startX : ((my.xt(temp.x)) ? temp.x : this.place.x);
			this.place.y = (my.xt(items.startY)) ? items.startY : ((my.xt(temp.y)) ? temp.y : this.place.y);
			}
		if(!this.velocity.type || this.velocity.type !== 'Vector'){
			this.velocity = my.newVector(items.velocity || this.velocity);
			}
		if(my.xto([items.delta, items.deltaX, items.deltaY])){
			temp = (my.isa(items.delta,'obj')) ? items.delta : {};
			this.velocity.x = (my.xt(items.deltaX)) ? items.deltaX : ((my.xt(temp.x)) ? temp.x : this.velocity.x);
			this.velocity.y = (my.xt(items.deltaY)) ? items.deltaY : ((my.xt(temp.y)) ? temp.y : this.velocity.y);
			}
		return this;
		};
/**
Augments Base.clone()
@method clone
@param {Object} items Object consisting of key:value attributes
@return Cloned Particle object
@chainable
**/
	my.Particle.prototype.clone = function(items){
		var a = my.Base.prototype.clone.call(this, items);
		a.place = my.newVector(a.place);
		a.velocity = my.newVector(a.velocity);
		a.forces = [];
		for(var i=0, z=this.forces.length; i<z; i++){
			a.forces.push(this.forces[i]);
			}
		return a;
		};
/**
Add a force to the forces array
@method addForce
@param {Object} item Anonymous Function, or FORCENAME String
@return This
@chainable
**/
	my.Particle.prototype.addForce = function(item){
		if(my.xt(item)){
			this.forces.push(item);
			}
		return this;
		};
	my.Particle.prototype.revert = function(){
		this.place.set(this.priorPlace);
		return this;
		};
/**
Undertake a calculation cycle iteration
@method stamp
@return This
@chainable
**/
	my.Particle.prototype.stamp = function(){
		if(this.mobile){
			this.calculateLoads();
			switch(this.engine){
				case 'improvedEuler' :
					this.updateImprovedEuler();
					break;
				case 'rungeKutter' :
					this.updateRungeKutter();
					break;
				default :
					this.updateEuler();
				}
			}
		return this;
		};
/**
Alias for Particle.stamp()
@method forceStamp
@return This
@chainable
**/
	my.Particle.prototype.forceStamp = function(){
		return this.stamp();
		};
/**
Alias for Particle.stamp()
@method update
@return This
@chainable
**/
	my.Particle.prototype.update = function(){
		return this.stamp();
		};
/**
Calculate the loads (via forces) acting on the particle for this calculation cycle iteration
@method calculateLoads
@return This
@chainable
@private
**/
	my.Particle.prototype.calculateLoads = function(){
		var i = 0, iz = 0;
		this.load.zero();
		for(i = 0, iz = this.forces.length; i < iz; i++){
			if(my.isa(this.forces[i], 'str') && my.contains(my.forcenames, this.forces[i])){
				my.force[this.forces[i]].run(this);
				}
			else{
				this.forces[i](this);
				}
			}
		for(i = 0, iz = this.springs.length; i < iz; i++){
			if(my.spring[this.springs[i]].start === this.name){
				this.load.vectorAdd(my.spring[this.springs[i]].force);
				}
			else if(my.spring[this.springs[i]].end === this.name){
				this.load.vectorSubtract(my.spring[this.springs[i]].force);
				}
			}
		return this;
		};
/**
Calculation cycle engine
@method updateEuler
@return This
@chainable
@private
**/
	my.Particle.prototype.updateEuler = function(){
		this.resetWork();
		var v1 = my.workphys.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(my.physics.deltaTime);
		this.work.velocity.vectorAdd(v1);
		this.velocity.set(this.work.velocity);
		this.priorPlace.set(this.place);
		this.place.vectorAdd(this.work.velocity.scalarMultiply(my.physics.deltaTime));
		return this;
		};
/**
Calculation cycle engine
@method updateImprovedEuler
@return This
@chainable
@private
**/
	my.Particle.prototype.updateImprovedEuler = function(){
		this.resetWork();
		var v1 = my.workphys.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(my.physics.deltaTime),
			v2 = my.workphys.v2.set(this.load).vectorAdd(v1).scalarDivide(this.mass).scalarMultiply(my.physics.deltaTime),
			v3 = v1.vectorAdd(v2).scalarDivide(2);
		this.work.velocity.vectorAdd(v3);
		this.velocity.set(this.work.velocity);
		this.priorPlace.set(this.place);
		this.place.vectorAdd(this.work.velocity.scalarMultiply(my.physics.deltaTime));
		return this;
		};
/**
Calculation cycle engine
@method updateRungeKutter
@return This
@chainable
@private
**/
	my.Particle.prototype.updateRungeKutter = function(){
		this.resetWork();
		var v1 = my.workphys.v1.set(this.load).scalarDivide(this.mass).scalarMultiply(my.physics.deltaTime).scalarDivide(2),
			v2 = my.workphys.v2.set(this.load).vectorAdd(v1).scalarDivide(this.mass).scalarMultiply(my.physics.deltaTime).scalarDivide(2),
			v3 = my.workphys.v3.set(this.load).vectorAdd(v2).scalarDivide(this.mass).scalarMultiply(my.physics.deltaTime),
			v4 = my.workphys.v4.set(this.load).vectorAdd(v3).scalarDivide(this.mass).scalarMultiply(my.physics.deltaTime),
			v5 = my.workphys.v5;
		v2.scalarMultiply(2);
		v3.scalarMultiply(2);
		v5.set(v1).vectorAdd(v2).vectorAdd(v3).vectorAdd(v4).scalarDivide(6);
		this.work.velocity.vectorAdd(v5);
		this.velocity.set(this.work.velocity);
		this.priorPlace.set(this.place);
		this.place.vectorAdd(this.work.velocity.scalarMultiply(my.physics.deltaTime));
		return this;
		};
/**
Calculation cycle engine - linear particle collisions
@method linearCollide
@return This
@chainable
@private
**/
	my.Particle.prototype.linearCollide = function(b){
		this.resetWork();
		var normal = my.workphys.v1.set(this.place).vectorSubtract(b.place).normalize(),
			relVelocity = my.workphys.v2.set(this.velocity).vectorSubtract(b.velocity),
			impactScalar = relVelocity.getDotProduct(normal),
			impact = my.workphys.v3;
		impactScalar = -impactScalar * (1 + ((this.elasticity + b.elasticity)/2));
		impactScalar /= ((1/this.mass)+(1/b.mass));
		impact.set(normal).scalarMultiply(impactScalar);
		this.velocity.vectorAdd(impact.scalarDivide(this.mass));
		b.velocity.vectorAdd(impact.scalarDivide(b.mass).reverse());
		return this;
		};
/**
Create a new Spring object and add it to this, and another, Particle objects' springs array

Argument can be either a PARTICLENAME String, or an Object which includes an __end__ attribute set to a PARTICLENAME String
@method addSpring
@param {Object} items Object consisting of key:value attributes; alternatively, use a PARTICLENAME String
@return This
@chainable
**/
	my.Particle.prototype.addSpring = function(items){
		var mySpring = false, end = false;
		if(my.isa(items,'str') && my.contains(my.spritenames, items)){
			end = items;
			var myItems = {};
			myItems.start = this.name;
			myItems.end = items;
			mySpring = my.newSpring(myItems);
			}
		else{
			items = (my.isa(items,'obj')) ? items : {};
			end = items.end || false;
			if(end && my.contains(my.spritenames, end)){
				items.start = this.name;
				mySpring = my.newSpring(items);
				}
			}
		if(mySpring){
			my.pushUnique(this.springs, mySpring.name);
			my.pushUnique(my.sprite[end].springs, mySpring.name);
			}
		return this;
		};
/**
Delete all springs associated with this Particle
@method removeSprings
@return This
@chainable
**/
	my.Particle.prototype.removeSprings = function(){
//		var temp = [];
//		for(i = 0, iz = this.springs.length; i < iz; i++){
//			temp.push(this.springs[i]);
//			}
		var temp = this.springs.slice(0);
		for(var i = 0, iz = temp.length; i < iz; i++){
			my.spring[temp[i]].kill();
			}
		return this;
		};
/**
Delete a named Spring object from this Particle
@method removeSpringsTo
@param {String} item SPRINGNAME String
@return This
@chainable
**/
	my.Particle.prototype.removeSpringsTo = function(item){
		if(my.xt(item) && my.contains(my.spritenames, item)){
			var temp = [], 
				s, i, iz;
			for(i = 0, iz = this.springs.length; i < iz; i++){
				s = my.spring[this.springs[i]];
				if(s.start === this.name || s.end === this.name){
					temp.push(this.springs[i]);
					}
				}
			for(i = 0, iz = temp.length; i < iz; i++){
				my.spring[temp[i]].kill();
				}
			}
		return this;
		};
	//the following dummy functions allow Particle objects to play nicely as part of a wider sprite Group object
	my.Particle.prototype.pickupSprite = function(item){return this;};
	my.Particle.prototype.dropSprite = function(item){return this;};
	my.Particle.prototype.updateStart = function(){return this;};
		
	my.pushUnique(my.sectionlist, 'spring');
	my.pushUnique(my.nameslist, 'springnames');
/**
# Spring
	
## Instantiation

* scrawl.newSpring()
* Particle.addSpring()

## Purpose

* Defines a Spring object connecting two Particle objects

## Access

* scrawl.spring.SPRINGNAME - for the Spring object

@class Spring
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Spring = function Spring(items){
		items = my.safeObject(items);
		if(my.xta([items.start, items.end])){
			var b1 = my.sprite[items.start];
			var b2 = my.sprite[items.end];
			my.Base.call(this, items);
			this.start = items.start;
			this.end = items.end;
			this.springConstant = items.springConstant || 1000;
			this.damperConstant = items.damperConstant || 100;
			if(my.xt(items.restLength)){
				this.restLength = items.restLength;
				}
			else{
				var r = my.workphys.v1.set(b2.place);
				r.vectorSubtract(b1.place);
				this.restLength = r.getMagnitude();
				}
			this.currentLength = items.currentLength || this.restLength;
			this.force = my.newVector();
			this.work.force = my.newVector();
			my.spring[this.name] = this;
			my.pushUnique(my.springnames, this.name);
			return this;
			}
		return false;
		};
	my.Spring.prototype = Object.create(my.Base.prototype);
/**
@property type
@type String
@default 'Spring'
@final
**/		
	my.Spring.prototype.type = 'Spring';
	my.Spring.prototype.classname = 'springnames';
	my.d.Spring = {
/**
First Particle PARTICLENAME
@property start
@type String
@default ''
**/		
		start: '',
/**
Second Particle PARTICLENAME
@property end
@type String
@default ''
**/		
		end: '',
/**
Spring constant
@property springConstant
@type Number
@default 1000
**/		
		springConstant: 1000,
/**
Spring damper constant
@property damperConstant
@type Number
@default 100
**/		
		damperConstant: 100,
/**
Rest length, in pixels, between the Spring object's two Particle objects
@property restLength
@type Number
@default 1
**/		
		restLength: 1,
/**
Current length, in pixels, between the Spring object's two Particle objects

Recalculated as part of each  calculation cycle iteration
@property currentLength
@type Number
@default 1
@private
**/		
		currentLength: 1,
/**
Vector representing the Spring object's current force on its Particles

Recalculated as part of each  calculation cycle iteration
@property force
@type Vector
@default Zero value vector
@private
**/		
		force: {x:0,y:0,z:0},
		};
	my.mergeInto(my.d.Spring, my.d.Scrawl);
/**
Calculate the force exerted by the spring for this calculation cycle iteration
@method update
@return This
@chainable
@private
**/
	my.Spring.prototype.update = function(){
		var vr = my.workphys.v1.set(my.sprite[this.end].velocity).vectorSubtract(my.sprite[this.start].velocity),
			r = my.workphys.v2.set(my.sprite[this.end].place).vectorSubtract(my.sprite[this.start].place),
			r_norm = my.workphys.v3.set(r).normalize(),
			r_norm2 = my.workphys.v4.set(r_norm);
		this.force.set(r_norm.scalarMultiply(this.springConstant * (r.getMagnitude() - this.restLength)).vectorAdd(vr.vectorMultiply(r_norm2).scalarMultiply(this.damperConstant).vectorMultiply(r_norm2)));
		return this;
		};
/**
Remove this Spring from its Particle objects, and from the scrawl library
@method kill
@return Always true
**/
	my.Spring.prototype.kill = function(){
		my.removeItem(my.sprite[this.start].springs, this.name);
		my.removeItem(my.sprite[this.end].springs, this.name);
		delete my.spring[this.name];
		my.removeItem(my.springnames, this.name);
		return true;
		};

	my.pushUnique(my.sectionlist, 'force');
	my.pushUnique(my.nameslist, 'forcenames');
/**
# Force
	
## Instantiation

* scrawl.newForce()

## Purpose

* Defines a Force function that can calculate forces on Particle objects

Two forces are pre-defined by scrawl:

* __scrawl.force.gravity__ - calculates the gravitational force acting on a Particle, as determined by the _scrawl.physics.gravity_ value and the Particle's _mass_
* __scrawl.force.drag__ - calculates the air drag force acting on a Particle, as determined by the scrawl.physics.airDensity value, and the Particle's _area_ and _drag_ attribute values
@class Force
@constructor
@extends Base
@param {Object} [items] Key:value Object argument for setting attributes
**/		
	my.Force = function Force(items){
		my.Base.call(this, items);
		items = my.safeObject(items);
		this.fn = items.fn || function(){}; 
		my.force[this.name] = this;
		my.pushUnique(my.forcenames, this.name);
		return this;
		};
	my.Force.prototype = Object.create(my.Base.prototype);
/**
@property type
@type String
@default 'Force'
@final
**/		
	my.Force.prototype.type = 'Force';
	my.Force.prototype.classname = 'forcenames';
	my.d.Force = {
/**
Anonymous function for calculating a force on a Particle

Functions need to be in the form:

	function(ball){
		//get or build a Vector object to hold the result
		var result = scrawl.newVector();	//creating the vector
		var result = scrawl.workphys.v1;	//using an existing work vector: scrawl.workphys.v1 to v5

		//calculate the force - Particle attributes are available via the _ball_ argument
		
		//add the force to the Particle's load Vector
		ball.load.vectorAdd(result);
		}

@property fn
@type Function
@default function(){}
**/		
		fn: function(){},
		};
	my.mergeInto(my.d.Force, my.d.Scrawl);
/**
Calculate the force for this calculation cycle iteration
@method run
@return force Vector, as defined in the force function
**/
	my.Force.prototype.run = function(item){
		return this.fn(item);
		};
/**
Remove this Force from the scrawl library
@method kill
@return Always true
**/
	my.Force.prototype.kill = function(){
		delete my.force[this.name];
		my.removeItem(my.forcenames, this.name);
		return true;
		};

	return my;
	}(scrawl));
