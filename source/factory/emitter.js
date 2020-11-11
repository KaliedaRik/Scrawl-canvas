// # Emitter factory
// Description TODO

// Unit emitters create a particle and maintain it themselves
// Spray emitters request/release particles


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - DEMO NAME


// #### Imports
import { constructors, artefact } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { requestParticle, releaseParticle } from './particle.js';
import { makeVector } from './vector.js';


import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Emitter constructor
const Emitter = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.initializePositions();

    this.set(this.defs);

    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    this.stampAction = λnull;

    this.range = makeVector();
    this.rangeFrom = makeVector();
    this.particleStore = [];
    this.deadParticles = [];
    this.liveParticles = [];

    if (!items.group) items.group = currentGroup;

    this.set(items);

    if (this.purge) this.purgeArtefact(this.purge);

    return this;
};


// #### Emitter prototype
let P = Emitter.prototype = Object.create(Object.prototype);

P.type = 'Emitter';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = entityMix(P);

// #### Emitter attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

    group: null,
    order: 0,
    world: null,
    artefact: null,

    // lifespan: 1,
    killParticleAfter: 0,
    killParticleBeyond: 0,

    depth: 0,
    stampAction: null,

    // Particle-specific attributes
    // + store them here so that we can use them when generating nerw particles
    historyLength: 1,
    engine: 'euler',
    forces: null,
    springs: null,
    mass: 1,
    area: 1,
    airFriction: 1,
    liquidFriction: 1, 
    solidFriction: 1,

    // attributes specific to emitters

    // __range__ defines a vector whose x/y/z values represent the +/- values to be used when generating the initial 'velocity' value for new particles. 
    // + effectively a direction in which the new particles are fired when launched.
    // + we should also be able to change the direction when the emitter's `roll` attribute is non-zero
    range: null,
    rangeFrom: null,

    //
    maxParticles: 1,

    // 
    particleChoke: 0,
    batchParticlesIn: 1,

    // 
    particleStore: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['group', 'artefact', 'particle']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function (killEntity) {

    // if (killEntity) this.entity.kill();
    
    // this.particle.kill();
    // this.deregister();

    // return true;
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

S.rangeX = function (val) { this.range.x = val; };
S.rangeY = function (val) { this.range.y = val; };
S.rangeZ = function (val) { this.range.z = val; };
S.range = function (item) { this.range.set(item); };

S.rangeFromX = function (val) { this.rangeFrom.x = val; };
S.rangeFromY = function (val) { this.rangeFrom.y = val; };
S.rangeFromZ = function (val) { this.rangeFrom.z = val; };
S.rangeFrom = function (item) { this.rangeFrom.set(item); };

S.stampAction = function (item) {

    if (isa_fn(item)) this.stampAction = item;
};

// S.completeAction = function (item) {

//     if (isa_fn(item)) this.completeAction = item;
// };


S.artefact = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art) this.artefact = art;
};

// __group__
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

// __host__ - internal function
S.host = function (item) {

    if (item) {

        let host = artefact[item];

        if (host && host.here) this.host = host.name;
        else this.host = item;
    }
    else this.host = '';
};


// #### Prototype functions

// P.prepareStamp = λnull;
// P.updateByDelta = λnull;

P.prepareStamp = function () {

    if (this.dirtyHost) {

        this.dirtyHost = false;
        this.dirtyDimensions = true;
    }

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

    if (this.dirtyScale) this.cleanScale();

    if (this.dirtyDimensions) this.cleanDimensions();

    if (this.dirtyLock) this.cleanLock();

    if (this.dirtyStart) this.cleanStart();

    if (this.dirtyOffset) this.cleanOffset();

    if (this.dirtyHandle) this.cleanHandle();

    if (this.dirtyRotation) this.cleanRotation();

    if (this.lockTo.indexOf('mouse') >= 0) {

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }

    if (this.dirtyStampPositions) this.cleanStampPositions();
    if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

    if (this.dirtyPathObject) this.cleanPathObject();

    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

    if (this.anchor && this.dirtyAnchorHold) {

        this.dirtyAnchorHold = false;
        this.buildAnchor(this.anchor);
    }












    let now = Date.now();

    let {generatorChoke, particleChoke, particleStore, deadParticles, liveParticles, killParticleAfter, killParticleBeyond, batchParticlesIn, maxParticles} = this;

    if (!generatorChoke) {

        this.generatorChoke = generatorChoke = now;
    }

    particleStore.forEach(p => {

        if (p.isRunning) liveParticles.push(p);
        else deadParticles.push(p);
    });
    particleStore.length = 0;

    deadParticles.forEach(d => releaseParticle(d));
    deadParticles.length = 0;

    particleStore.push(...liveParticles);
    liveParticles.length = 0;

    if (this.generatorChoke <= now) {

        let currentParticles = particleStore.length;

        if (currentParticles < maxParticles) {

            let requiredParticles = maxParticles - currentParticles;

            if (requiredParticles > batchParticlesIn) requiredParticles = batchParticlesIn;

            this.addParticles(requiredParticles);
        }
        this.generatorChoke += particleChoke;
    }
};

P.addParticles = function (req) {

    let i, p,
        rnd = Math.random;

    let {killParticleAfter, killParticleBeyond, historyLength, engine, forces, springs, mass, area, airFriction, liquidFriction, solidFriction, range, rangeFrom, roll, currentStampPosition, particleStore} = this;

    let {x, y, z} = range;
    let {x:fx, y:fy, z:fz} = rangeFrom;

    let [cx, cy] = currentStampPosition;
    
    for (i = 0; i < req; i++) {

        p = requestParticle();

        p.set({
            positionX: cx,
            positionY: cy,
            positionZ: 0,

            velocityX: fx + (rnd() * x),
            velocityY: fy + (rnd() * y),
            velocityZ: fz + (rnd() * z),

            historyLength, 
            engine, 
            forces, 
            springs, 
            mass, 
            area, 
            airFriction, 
            liquidFriction, 
            solidFriction,
        });

        p.run(killParticleAfter, killParticleBeyond);

        particleStore.push(p);
    }
};

// `stamp` - returns a Promise. This is the function invoked by Group objects as they cascade the Display cycle __compile__ step through to their member artefacts.
// + Overwriters the functionality defined in the 
P.stamp = function (force = false, host, changes) {

    if (this.isRunning) {

        let {world, artefact, particleStore, stampAction, lastUpdated} = this;

        if (artefact) {

            if (!host) host = this.getHost();

            let deltaTime = 16 / 1000,
                now = Date.now();

            if (lastUpdated) deltaTime = (now - lastUpdated) / 1000;

            particleStore.forEach(p => {

                p.update(deltaTime, world)
                stampAction.call(this, artefact, p, host);
            });
            this.lastUpdated = now;
        }
    }
    return Promise.resolve(true);
};

P.run = function () {

    this.isRunning = true;
    return this;
};

P.halt = function () {

    this.isRunning = false;
    return this;
};


// `getHost` - internal function - return the __host__ object. Hosts can be various things, for instance:
// + Element wrapper will have a Stack as its host
// + Stack and Canvas wrappers can also have a Stack host
// + Cells will have either a Canvas, or another Cell, as their host
// + Entity artefacts will use a Cell as their host
//
// All of the above can exist without a host (though in many cases this means they don't do much). Stack and Canvas wrappers will often be unhosted, sitting as `root` elements in the web page DOM
P.getHost = function () {

    if (this.currentHost) return this.currentHost;
    else if (this.host) {

        let host = artefact[this.host];

        if (host) {

            this.currentHost = host;
            return this.currentHost;
        }
    }
    return currentCorePosition;
};


// #### Factory
// ```
// scrawl.makeParticle({
// })
// ```
const makeEmitter = function (items) {
    return new Emitter(items);
};

constructors.Emitter = Emitter;


// #### Exports
export {
    makeEmitter,
};
