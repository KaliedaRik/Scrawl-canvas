// # Particle factory
// The Scrawl-canvas particle physics engine is a simple system designed to allow developers a way to add particle-based effects to their canvas animation scenes. The physics engine is built on top of the following components:
// + [Particle objects](./particle.html), which represent a 3-dimensional coordinate - based on a Scrawl-canvas [Vector object](./vector.html) - and include a history of recent positions which we can use to determine how to display that particle on screen.
// + [History arrays](./particleHistory.html) which can be pooled (reused) to cut down on Array creation and distruction during the animation.
// + [Force objects](./particleForce.html) which define the general and occasional forces to be applied to each particle in the system as the animation progresses - a __gravity__ force object is pre-defined by Scrawl-canvas.
// + [Spring objects](./particleSpring.html) used to define a constraint (connection) between two particles in a system.
// + [World objects](./particleWorld.html) where we can store attributes and values used by various objects; these attributes can be set up so that they will be inherited by clones of the World object. We can also influence the speed of the physics animation here.
//
// We do not have to handle particle generation and manipulation ourselves. Instead, Scrawl-canvas gives us three dedicated __entitys__ which we use to add particle animation effects to the canvas scene. These entitys are:
// + [Tracer](./tracer.html) - this entity generates a single non-recycled (in other words: long lasting) particle with a history, which we can use to display trace effects in the animation.
// + [Emitter](./emitter.html) - an entity which generates a stream of short-lived, recycled particles, each with its own history. Emitters are highly versatile entitys which can generate a wide range of effects.
// + [Net](./net.html) - a (generally) larger entity which uses both forces and springs to manage the animation of its non-recycled particles. Note that other artefacts can use Net particles as a reference for their own positioning.
//
// #### Particle physics
// The Scrawl-canvas particle physics engine system is based on a fairly classical understanding of particle ___kinetics___ (applying forces and constraints to a small, spherical object in 3D space) and ___kinematics___ (the movement of the small object in response to the forces and constraints applied to it).
//
// __Particles__ are represented in the system by a simple Scrawl-canvas object which wraps a set of Scrawl-canvas Vector objects describing the particle's position, velocity and load. The object also includes a history array detailing the recent particle's most recent movements, an array of Force objects, a mass attribute (for gravity calculations), and an engine attribute - particles can use different engines to calculate their movements, depending on the needs of the animation; more precise engines are slower, but more stable.
// + Note that all Particles are positioned using ___absolute__ (pixel-based) coordinates; they cannot be positioned relatively (using String% values), or by reference to an artefact or another Particle.
// + Entitys that use Particles for their display - Emitter, Net, Tracer - can, however, use all the normal entity positioning strategies.
// + All artefacts (including all entitys) can position themselves by reference to a named (non-recycled) Particle.
//
// #### The particle pool
// As part of a particle animation many thousands of Particle objects may need to be generated, used and then discarded. Scrawl-canvas attempts to make this more efficient by pooling particle objects so that they can be reused as the animation progresses. 


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - Emitter using artefacts
// + [particles-003](../../demo/particles-003.html) - Position Emitter entity: start; pivot; mimic; path; mouse; drag-and-drop
// + [particles-004](../../demo/particles-004.html) - Emit particles along the length of a path
// + [particles-005](../../demo/particles-005.html) - Emit particles from inside an artefact's area
// + [particles-006](../../demo/particles-006.html) - Fixed number of particles in a field; preAction and postAction functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop functionality
// + [particles-010](../../demo/particles-010.html) - Net entity: using a shape path as a net template
// + [particles-011](../../demo/particles-011.html) - Tracer entity: basic functionality
// + [particles-012](../../demo/particles-012.html) - Use Net entity particles as reference coordinates for other artefacts


// #### Imports
import { 
    constructors, 
    force, 
    spring, 
    springnames, 
} from '../core/library.js';

import { 
    doCreate,
    mergeOver, 
    pushUnique, 
    λnull, 
    Ωempty, 
} from '../core/utilities.js';

import { 
    releaseParticleHistoryObject, 
    requestParticleHistoryObject, 
} from './particleHistory.js';

import { 
    makeVector, 
    releaseVector, 
    requestVector, 
} from './vector.js';

// The Particle object uses the base mixin, thus it supports all the normal Scrawl-canvas functionality such as `get`, `set`, `setDelta`, `clone`, `kill`, etc.
import baseMix from '../mixin/base.js';

import { 
    _isArray,
} from '../core/shared-vars.js';


// Local constants
const BLACK = 'rgb(0 0 0 / 1)',
    EULER = 'euler',
    PARTICLE = 'particle',
    T_PARTICLE = 'Particle';


// #### Particle constructor
const Particle = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);
    this.initializePositions();
    this.set(items);

    return this;
};


// #### Particle prototype
const P = Particle.prototype = doCreate();

// Particles have their own section in the Scrawl-canvas library. They are not artefacts or assets.
P.type = T_PARTICLE;
P.lib = PARTICLE;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Particle attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
const defaultAttributes = {

// The __position__ attribute represents a particle's world coordinate, and is held in an `{x:value, y:value, z:value}` Vector object. The default values are `{x:0, y:0, z:0}`, placing the artifact at the Cell canvas's top-left corner. We can set the position using the __positionX__, __positionY__ and __positionZ__ pseudo-attributes.
    position: null,

// __velocity__ - Vector object, generally used internally as part of the particle physics calculation. We can give a particle an initial velocity using the __velocityX__, __velocityY__ and __velocityZ__ pseudo-attributes.
    velocity: null,

// __load__ - Vector object used internally as part of the particle physics calculation. Never attempt to amend this attribute as it gets reset to zero at the start of every Display cycle.
    load: null,

// __history__ - Array used to hold ParticleHistory arrays, which in turn include data on the particles position at a given time, and the time remaining for that particle to live. The latest history arrays are added to the start of the array, with the oldest history arrays at the end of the array.
    history: null,

// __historyLength__ - Number - we control how many ParticleHistory arrays the Particle will retain.
    historyLength: 1,

// __engine__ - a String value naming the physics engine to be used to calculate this Particle's movement in response to all the forces applied to it. Scrawl-canvas comes with three in-built engines:
//+ __'euler'__ - the simplest, quickest and least stable engine (default)
//+ __'runge-kutta'__ - the most complex, slowest and most stable engine
//+ __'improved-euler'__ - an engine that sits between the other two engines in terms of complexity, speed and stability.
    engine: EULER,

// __forces__ - an Array to hold Force objects that will be applied to this Particle.
    forces: null,

// __mass__ - a Number value representing the Particle's mass (in kg) - this value is used in the gravity force calculation.
    mass: 1,

// __fill__ and __stroke__ - CSS color values which can be used to display the Particle during the animation.
    fill: BLACK,
    stroke: BLACK,
};
P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, []);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)']);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, ['position', 'velocity', 'acceleration']);
P.packetFunctions = pushUnique(P.packetFunctions, []);


// #### Clone management
// In general we don't need to create or clone Particles objects ourselves; their generation is managed behind the scenes by the physics-related entitys.


// #### Kill management
P.factoryKill = function () {

    this.history.forEach(h => releaseParticleHistoryObject(h));

    let deadSprings = [];

    springnames.forEach(name => {

        let s = spring[name];

        if (s.particleFrom && s.particleFrom.name === this.name) deadSprings.push[s];
        else if (s.particleTo && s.particleTo.name === this.name) deadSprings.push[s];
    });

    deadSprings.forEach(s => s.kill());
};


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __positionX__, __positionY__, __positionZ__
G.positionX = function () { return this.position.x; };
G.positionY = function () { return this.position.y; };
G.positionZ = function () { return this.position.z; };

// We return the __position__ value as an `[x, y, z]` Array rather than as an object
G.position = function () {

    let s = this.position;
    return [s.x, s.y, s.z];
};

S.positionX = function (coord) { this.position.x = coord; };
S.positionY = function (coord) { this.position.y = coord; };
S.positionZ = function (coord) { this.position.z = coord; };

S.position = function (item) { this.position.set(item); };

D.positionX = function (coord) { this.position.x += coord; };
D.positionY = function (coord) { this.position.y += coord; };
D.positionZ = function (coord) { this.position.z += coord; };

D.position = λnull;

// __velocity__, __velocityX__, __velocityY__, __velocityZ__
// + There should be no need to access/amend these values
G.velocityX = function () { return this.velocity.x; };
G.velocityY = function () { return this.velocity.y; };
G.velocityZ = function () { return this.velocity.z; };

G.velocity = function () {

    let s = this.velocity;
    return [s.x, s.y, s.z];
};

S.velocityX = function (coord) { this.velocity.x = coord; };
S.velocityY = function (coord) { this.velocity.y = coord; };
S.velocityZ = function (coord) { this.velocity.z = coord; };

S.velocity = function (x, y, z) {

    this.velocity.set(x, y, z);
};

D.velocityX = function (coord) { this.velocity.x += coord; };
D.velocityY = function (coord) { this.velocity.y += coord; };
D.velocityZ = function (coord) { this.velocity.z += coord; };

D.velocity = λnull;

// __forces__ - generally no need to add forces to Particles ourselves as this is handled by the physics-based entitys
S.forces = function (item) {

    if (item) {

        if (_isArray(item)) {

            this.forces.length = 0;
            this.forces = this.forces.concat(item);
        }
        else this.forces.push(item);
    }
};

// Remove certain attributes from the set/deltaSet functionality
S.load = λnull;
S.history = λnull;

D.load = λnull;


// #### Prototype functions
// `initializePositions` - internal function called by all particle factories 
// + Setup initial Arrays and Objects.
P.initializePositions = function () {

    this.initialPosition = makeVector();
    this.position = makeVector();
    this.velocity = makeVector();
    this.load = makeVector();

    this.forces = [];
    this.history = [];

    // __isRunning__ - a Boolean flag used as part of internal Particle lifetime management
    this.isRunning = false;
};

// `applyForces` - internal function used to calculate the particles's load vector
// + Requires both a __world__ object and a __host__ (Cell) object as arguments
P.applyForces = function (world, host) {

    this.load.zero();

    let f;

    if (!this.isBeingDragged) {

        this.forces.forEach(key => {

            f = force[key];

            if (f && f.action) f.action(this, world, host);
        });
    }
};

// `update` - internal function used to calculate the Particles's position vector from its load and velocity vectors
// + Requires both a __tick__ Number (measured in seconds) and a __host__ (Cell) object as arguments
P.update = function (tick, world) {

    if (this.isBeingDragged) this.position.setFromVector(this.isBeingDragged).vectorAdd(this.dragOffset);
    else particleEngines[this.engine].call(this, tick * world.tickMultiplier);
};

// `manageHistory` - internal function. Every particle can retain a history of its previous time and position moments, held in a ParticleHistory Array.
P.manageHistory = function (tick, host) {

    let {history, remainingTime, position, historyLength, hasLifetime, distanceLimit, initialPosition, killBeyondCanvas} = this;

    let addHistoryFlag = true,
        remaining = 0;

    // A particle can have a lifetime value - a float Number measured in seconds, stored in the `remainingTime` attribute. This is flagged for action in the `hasLifetime` attribute. The particle has, in effect, three states:
    // + ___alive___ - on each tick a ParticleHistory object will be generated and added to the particle's `history` attribute array; if this addition takes the history array over its permitted length (as detailed in the particle's `historyLength` attribute) then the oldest ParticleHistory object is removed from the history array
    // + ___dying___ - if the particle has existed for longer than its alotted time - as detailed in its `remainingTime` attribute - then it enters a post-life phase where history objects are no longer generated on each tick, but the oldest ParticleHistory object continues to be removed from the history array
    // + ___dead___ - when the particle has existed for longer than its alotted time, and its history array is finally empty, then its `isRunning` flag can be set to false.
    //
    // Particle lifetime values are set by the emitter when creating the particles, based on the emitter's `killAfterTime` and `killAfterTimeVariation` attributes
    if (hasLifetime) {

        remaining = remainingTime - tick;

        if (remaining <= 0) {

            let last = history.pop();

            releaseParticleHistoryObject(last);

            addHistoryFlag = false;

            if (!history.length) this.isRunning = false;
        }
        else this.remainingTime = remaining;
    }

    // A particle can be killed off under the following additional circumstances:
    // + If we set the emitter's `killBeyondCanvas` flag to `true`
    // + If we set a kill radius - a distance from the particle's initial position beyond which the particle will be removed - defined in the emitter's `killRadius` and `killRadiusVariation` attributes
    let oldest = history[history.length - 1];

    if (oldest) {

        let [or, oz, ox, oy] = oldest;

        if (killBeyondCanvas) {

            let w = host.element.width,
                h = host.element.height;

            if (ox < 0 || oy < 0 || ox > w || oy > h) {

                addHistoryFlag = false;
                this.isRunning = false;
            }
        }

        if (distanceLimit) {

            let test = requestVector(initialPosition);

            test.vectorSubtractArray([ox, oy, oz]);

            if (test.getMagnitude() > distanceLimit) {

                addHistoryFlag = false;
                this.isRunning = false;
            }
            releaseVector(test);
        }
    }

    // Generate a new ParticleHistory object, if required, and remove any old ParticleHistory object beyond the history array's permitted length (as defined in the emitter's `historyLength` attribute)
    if (addHistoryFlag) {

        let {x, y, z} = position;

        let h = requestParticleHistoryObject();

        h.push(remaining, z, x, y);

        history.unshift(h);

        if (history.length > historyLength) {

            let old = history.splice(historyLength);

            old.forEach(item => releaseParticleHistoryObject(item));
        }
    }
};

// `run` - internal function. We define the triggers that will kill the particle at the same time as we start it running. This function should only be called by an physics entity (Emitter, Net, Tracer). Note that there is no equivalent `halt` function; instead, we set the particle's `isRunning` attribute to false to get it removed from the system. 
P.run = function (timeKill, radiusKill, killBeyondCanvas) {

    // We can kill a Particle if it has lasted longer than its alloted lifetime. Lifetime (if required) is assigned to the Particle by its entity when generated.
    this.hasLifetime = false;
    if (timeKill) {

        this.remainingTime = timeKill;
        this.hasLifetime = true;
    }

    // We can kill a Particle if it has passed a certain distance beyond its initial position. Kill radius value (if required) is assigned to the Particle by its entity when generated.
    this.distanceLimit = 0;
    if (radiusKill) {
        
        this.initialPosition.set(this.position);
        this.distanceLimit = radiusKill;
    }

    // We can kill a Particle if it has moved beyond the Cell's canvas's dimensions. This boolean is set on the Particle by its entity when generated.
    this.killBeyondCanvas = killBeyondCanvas;

    this.isRunning = true;
};


// #### Factory
// Scrawl-canvas does not expose the particle factory functions in the scrawl object. Instead, particles are consumed by the physics-based entitys: [Tracer](./tracer.html); [Emitter](./emitter.html); [Net](./net.html).
export const makeParticle = function (items) {

    if (!items) return false;
    return new Particle(items);
};

constructors.Particle = Particle;


// #### Particle pool
// An attempt to reuse Particle objects rather than constantly creating and deleting them
const particlePool = [];

// `exported function` - retrieve a Particle from the particle pool
export const requestParticle = function (items) {

    if (!particlePool.length) particlePool.push(new Particle());

    let v = particlePool.shift();

    v.set(items);

    return v
};

// `exported function` - return a Particle to the particle pool. Failing to return Particles to the pool may lead to more inefficient code and possible memory leaks.
export const releaseParticle = function (item) {

    if (item && item.type == T_PARTICLE) {

        item.history.forEach(h => releaseParticleHistoryObject(h));
        item.history.length = 0;

        item.set(item.defs);
        particlePool.push(item);

        // Do not keep excessive numbers of under-utilised particle objects in the pool
        if (particlePool.length > 50) {

            let temp = [].concat(particlePool);
            particlePool.length = 0;
            temp.forEach(p => p.kill());
        }
    }
};


// #### Particle physics engines
// These functions are called by the `update` function which assigns the Particle object as `this` as part of the call. The engines calculate particle acceleration and apply it to particle velocity and then, taking into account the time elapsed since the previous tick, particle position.
const particleEngines = {

    // __euler__ - the simplest and quickest engine, and the least accurate
    'euler': function (tick) {

        let {position, velocity, load, mass} = this;

        let acc = requestVector(),
            vel = requestVector(velocity);

        acc.setFromVector(load).scalarDivide(mass);

        vel.vectorAdd(acc.scalarMultiply(tick));

        velocity.setFromVector(vel);

        position.vectorAdd(vel.scalarMultiply(tick));

        releaseVector(acc, vel);
    },

    // __improved-euler__ is more accurate than the euler engine, but takes longer to calculate
    'improved-euler': function (tick) {

        let {position, velocity, load, mass} = this;

        let acc1 = requestVector(),
            acc2 = requestVector(),
            acc3 = requestVector(),
            vel = requestVector(velocity);

        acc1.setFromVector(load).scalarDivide(mass).scalarMultiply(tick);
        acc2.setFromVector(load).vectorAdd(acc1).scalarDivide(mass).scalarMultiply(tick);
        acc3.setFromVector(acc1).vectorAdd(acc2).scalarDivide(2);

        vel.vectorAdd(acc3);

        velocity.setFromVector(vel);

        position.vectorAdd(vel.scalarMultiply(tick));

        releaseVector(acc1, acc2, acc3, vel);
    },

    // __runge-kutta__ is very accurate, but also a lot more computationally expensive
    'runge-kutta': function (tick) {

        let {position, velocity, load, mass} = this;

        let acc1 = requestVector(),
            acc2 = requestVector(),
            acc3 = requestVector(),
            acc4 = requestVector(),
            acc5 = requestVector(),
            vel = requestVector(velocity);

        acc1.setFromVector(load).scalarDivide(mass).scalarMultiply(tick).scalarDivide(2);
        acc2.setFromVector(load).vectorAdd(acc1).scalarDivide(mass).scalarMultiply(tick).scalarDivide(2);
        acc3.setFromVector(load).vectorAdd(acc2).scalarDivide(mass).scalarMultiply(tick).scalarDivide(2);
        acc4.setFromVector(load).vectorAdd(acc3).scalarDivide(mass).scalarMultiply(tick).scalarDivide(2);

        acc2.scalarMultiply(2);
        acc3.scalarMultiply(2);

        acc5.setFromVector(acc1).vectorAdd(acc2).vectorAdd(acc3).vectorAdd(acc4).scalarDivide(6);

        vel.vectorAdd(acc5);

        velocity.setFromVector(vel);

        position.vectorAdd(vel.scalarMultiply(tick));

        releaseVector(acc1, acc2, acc3, acc4, acc5, vel);
    },
};
