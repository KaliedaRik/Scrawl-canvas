// # Particle factory
// Description TODO


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - Emitter using artefacts
// + [particles-003](../../demo/particles-003.html) - Position Emitter entity: start; pivot; mimic; path; mouse
// + [particles-004](../../demo/particles-004.html) - Emit particles along the length of a path
// + [particles-005](../../demo/particles-005.html) - Emit particles from inside an artefact's area
// + [particles-006](../../demo/particles-006.html) - Fixed number of Particles in a field; preAction and postAction functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality



// #### Imports
import { constructors, artefact, force } from '../core/library.js';
import { mergeOver, pushUnique, λnull, isa_obj } from '../core/utilities.js';

import { requestParticleHistoryObject, releaseParticleHistoryObject } from './particleHistory.js';
import { requestVector, releaseVector, makeVector } from './vector.js';

import baseMix from '../mixin/base.js';


// #### Particle constructor
const Particle = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);
    this.initializePositions();
    this.set(items);

    return this;
};


// #### Particle prototype
let P = Particle.prototype = Object.create(Object.prototype);

P.type = 'Particle';
P.lib = 'particle';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Particle attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

// The __position__ attribute represents a particle's world coordinate, and is held in an `[x, y, z]` Vector object. The default values are `{x:0, y:0, z:0}`, placing the artifact at the world's top-left corner.
    position: null,

// __velocity__ - 
    velocity: null,

// __load__ - 
    load: null,

// __history__ - 
    history: null,

// __historyLength__ - 
    historyLength: 1,

// __engine__ - 
    engine: 'euler',

// __forces__ - 
    forces: null,

// __springs__ - 
    springs: null,

// __mass__ - 
    mass: 1,

// __area__ - 
    area: 1,

// __airFriction__ - 
    airFriction: 1,

// __liquidFriction__ - 
    liquidFriction: 1, 

// __solidFriction__ - 
    solidFriction: 1,

// __fill__ and __stroke__ - 
    fill: '#000000',
    stroke: '#000000',
};
P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, []);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)']);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, ['position', 'velocity', 'acceleration']);
P.packetFunctions = pushUnique(P.packetFunctions, []);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.factoryKill = function () {

    this.history.forEach(h => releaseParticleHistoryObject(h));
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __position__, __positionX__, __positionY__, __positionZ__
// + Currently assuming that arguments to the pseudo-attribute S and D functions are Numbers
G.positionX = function () { return this.position.x; };
G.positionY = function () { return this.position.y; };
G.positionZ = function () { return this.position.z; };

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
// + Currently assuming that arguments to the pseudo-attribute S and D functions are Numbers
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

// __forces__
// + Currently assuming that arguments to the pseudo-attribute S and D functions are Numbers
S.forces = function (item) {

    if (item) {

        if (Array.isArray(item)) {

            this.forces.length = 0;
            this.forces = this.forces.concat(item);
        }
        else this.forces.push(item);
    }
};

// Remove certain attributes from the set/deltaSet functionality
S.load = λnull;
S.springs = λnull;
S.history = λnull;

D.load = λnull;


// #### Prototype functions
// `initializePositions` - Internal function called by all particle factories 
// + Setup initial Arrays and Objects.
P.initializePositions = function () {

    this.initialPosition = makeVector();
    this.position = makeVector();
    this.velocity = makeVector();
    this.load = makeVector();

    this.forces = [];
    this.springs = [];
    this.history = [];

    this.isRunning = false;
};



// `update` - calculate the particles's position vector
P.update = function (tick, world, host) {

    // Add up loads from forces acting on this particle
    let i, iz, f;

    this.load.zero();

    this.forces.forEach(key => {

        let f = force[key];

        if (f && f.action) f.action(this, world, host);
    });

    // Apply loads to update position; three engines can be used: `euler` (the simplest engine, which is also the default), `improved-euler`, or `runge-kutta` - which is the most accurate, but also the most computationally intensive engine
    particleEngines[this.engine].call(this, tick * world.tickMultiplier);
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

            let [w, h] = host.currentDimensions;

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

// `run` - internal function. We define the triggers that will kill the particle at the same time as we start it running. This function should only be called by an Emitter entity. Note that there is no equivalent 'halt' function; instead, we set the particle's `isRunning` attribute to false to get it removed from the system. 
P.run = function (timeKill, radiusKill, killBeyondCanvas) {

    this.hasLifetime = false;
    if (timeKill) {

        this.remainingTime = timeKill;
        this.hasLifetime = true;
    }

    this.distanceLimit = 0;
    if (radiusKill) {
        
        this.initialPosition.set(this.position);
        this.distanceLimit = radiusKill;
    }

    this.killBeyondCanvas = killBeyondCanvas;

    this.isRunning = true;
};


// #### Factory
// Scrawl-canvas does not expose the particle factory functions in the scrawl object. Instead, particles are consumed by the [emitter entity factory](./emitter.html) via the particle pool.
const makeParticle = function (items) {
    return new Particle(items);
};

constructors.Particle = Particle;


// #### Particle pool
// An attempt to reuse simple particles rather than constantly creating and deleting them
const particlePool = [];

// `exported function` - retrieve a Particle from the particle pool
const requestParticle = function (items) {

    if (!particlePool.length) particlePool.push(new Particle());

    let v = particlePool.shift();

    v.set(items);

    return v
};

// `exported function` - return a Particle to the particle pool. Failing to return Particles to the pool may lead to more inefficient code and possible memory leaks.
const releaseParticle = function (item) {

    if (item && item.type === 'Particle') {

        item.history.forEach(h => releaseParticleHistoryObject(h));
        item.history.length = 0;

        if (particlePool.length < 10) {

            item.set(item.defs);
            particlePool.push(item);
        }
        else item.kill()
    }
};


const particleEngines = {

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

    'improved-euler': function (tick) {

        let {position, velocity, load, mass} = this;

        // linear motion
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

    'runge-kutta': function (tick) {

        let {position, velocity, load, mass} = this;

        // linear motion
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

// #### Exports
export {
    makeParticle,

    requestParticle,
    releaseParticle,
};
