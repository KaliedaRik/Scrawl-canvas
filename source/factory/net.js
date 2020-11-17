// # Net factory
// Description TODO


// #### Imports
import { constructors, artefact, world, styles, particle } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';

import { makeParticle } from './particle.js';
import { makeVector, requestVector, releaseVector } from './vector.js';
import { makeSpring } from './particleSpring.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Net constructor
const Net = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.initializePositions();

    this.set(this.defs);

    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    this.generate = λnull;
    this.postGenerate = λnull;
    this.stampAction = λnull;

    this.particleStore = [];
    this.springs = [];

    if (!items.group) items.group = currentGroup;

    this.set(items);

    if (this.purge) this.purgeArtefact(this.purge);

    return this;
};


// #### Net prototype
let P = Net.prototype = Object.create(Object.prototype);

P.type = 'Net';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = entityMix(P);

// #### Net attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

    world: null,
    artefact: null,

    stampAction: null,

    generate: null,
    postGenerate: null,

    historyLength: 1,
    engine: 'euler',
    forces: null,
    springs: null,
    mass: 1,
    area: 1,
    airFriction: 1,
    liquidFriction: 1, 
    solidFriction: 1,

    // weakNet, strongNet
    rows: 0,
    columns: 0, 
    rowDistance: 0,
    columnDistance: 0,
    showSprings: false,
    showSpringsColor: '#000000',

    // Spring
    springConstant: 50,
    damperConstant: 10,

    // This is a ratio figure, not the actual rest length. If == 1, spring restLength will equal the initial distance between the two particles. < 1 and the length will be proportionately smaller; > 1 gives results in a longer length
    restLength: 1,

    particleStore: null,

    resetAfterBlur: 3,
};
P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['forces', 'springs', 'particleStore']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, ['world', 'artefact']);
P.packetFunctions = pushUnique(P.packetFunctions, ['generate', 'postGenerate', 'stampAction']);

P.finalizePacketOut = function (copy, items) {

    let forces = items.forces || this.forces || false;
    if (forces) {

        let tempForces = [];
        forces.forEach(f => {

            if (f.substring) tempForces.push(f);
            else if (isa_obj(f) && f.name) tempForces.push(f.name);
        });
        copy.forces = tempForces;
    }

    let springs = items.springs || this.springs || false;
    if (springs) {

        let tempSprings = [];
        this.springs.forEach(s => {

            if (s.substring) tempSprings.push(s);
            else if (isa_obj(s) && s.name) tempSprings.push(s.name);
        });
        copy.springs = tempSprings;
    }

    let tempParticles = [];
    this.particleStore.forEach(p => tempParticles.push(p.saveAsPacket()));
    copy.particleStore = tempParticles;

    return copy;
};

// #### Clone management
P.postCloneAction = function(clone, items) {

    return clone;
};


// #### Kill management
P.kill = function (killArtefact = false, killWorld = false) {

    this.isRunning = false;

    if (killArtefact) this.artefact.kill();

    if (killWorld) this.world.kill();

    this.particleStore.forEach(p => p.kill());

    this.deregister();

    return true;
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

S.generate = function (item) {

    if (isa_fn(item)) this.generate = item;

    else if (item.substring && generators[item]) this.generate = generators[item];
};

S.postGenerate = function (item) {

    if (isa_fn(item)) this.postGenerate = item;
};

S.stampAction = function (item) {

    if (isa_fn(item)) this.stampAction = item;
};


S.world = function (item) {

    let w;

    if (item.substring) w = world[item];
    else if (isa_obj(item) && item.type === 'World') w = item;

    if (w) this.world = w;
};

S.artefact = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art) this.artefact = art;
};

// #### Prototype functions

// `prepareStamp` - internal - overwrites the entity mixin function
P.prepareStamp = function () {

    // Entity-mixin-related functionality
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
};

// `stamp` - returns a Promise. This is the function invoked by Group objects as they cascade the Display cycle __compile__ step through to their member artefacts.
// + Overwriters the functionality defined in the 
P.stamp = function (force = false, host, changes) {

    if (this.isRunning) {

        let {world, artefact, particleStore, springs, generate, postGenerate, stampAction, lastUpdated, resetAfterBlur, showSprings, showSpringsColor} = this;

        if (artefact) {


            if (!host) host = this.getHost();

            let deltaTime = 16 / 1000,
                now = Date.now();

            if (lastUpdated) deltaTime = (now - lastUpdated) / 1000;

            // If the user has focussed on another tab in the browser before returning to the tab running this Scrawl-canvas animation, then we risk breaking the page by continuing the animation with the existing particles - simplest solution is to remove all the particles and, in effect, restarting the emitter's animation.
            if (deltaTime > resetAfterBlur) {

                particleStore.forEach(p => p.kill());
                particleStore.length = 0;
                springs.forEach(s => s.kill());
                springs.length = 0;
                deltaTime = 16 / 1000;
            }

            if (!particleStore.length) {

                generate.call(this, host);
                postGenerate.call(this);
            }

            particleStore.forEach(p => p.applyForces(world, host));

            springs.forEach(s => s.applySpring());

            particleStore.forEach(p => p.update(deltaTime, world));

            // TODO: detect and manage collisions

            // Do visuals
            if (showSprings) {

                let engine = host.engine;

                engine.save();
                engine.strokeStyle = showSpringsColor;
                engine.lineWidth = 1;
                engine.setTransform(1, 0, 0, 1, 0, 0);
                engine.beginPath();

                springs.forEach(s => {

                    let {particleFrom, particleTo} = s;

                    engine.moveTo(particleFrom.position.x, particleFrom.position.y);
                    engine.lineTo(particleTo.position.x, particleTo.position.y);
                });
                engine.stroke();
                engine.restore();
            }

            particleStore.forEach(p => {

                p.manageHistory(deltaTime, host);
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

P.restart = function () {

    this.particleStore.forEach(p => p.kill());
    this.particleStore.length = 0;
    this.springs.forEach(s => s.kill());
    this.springs.length = 0;
    
    this.lastUpdated = Date.now();

    this.isRunning = true;
    return this;
};

const generators = {

    'weak-net': function (host) {

        let { particleStore, artefact, historyLength, engine, forces, springs, mass, area, airFriction, liquidFriction, solidFriction, rows, columns, rowDistance, columnDistance, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength } = this;

        let [x, y] = this.currentStampPosition;
        let [width, height] = host.currentDimensions;

        let deltaR = (rowDistance.substring) ? (parseFloat(rowDistance) / 100) * height : rowDistance;
        let deltaC = (columnDistance.substring) ? (parseFloat(columnDistance) / 100) * height : columnDistance;

        let dx, dy, p, i, j;

        // generate particles
        for (i = 0; i < rows; i++) {

            dy = (deltaR * i) + y;

            for (j = 0; j < columns; j++) {

                dx = (deltaC * j) + x;

                p = makeParticle({

                    name: `${name}-${i}-${j}`,

                    positionX: dx,
                    positionY: dy,
                    positionZ: 0,

                    velocityX: 0,
                    velocityY: 0,
                    velocityZ: 0,

                    historyLength, 
                    engine, 
                    forces, 

                    mass,
                    area,  
                    airFriction,  
                    liquidFriction,  
                    solidFriction,  

                    fill: artefact.get('fillStyle'),
                    stroke: artefact.get('strokeStyle'),
                });

                p.run(0, 0, false);

                particleStore.push(p);
            }
        }

        // generate springs
        for (i = 0; i < rows; i++) {

            for (j = 0; j < columns - 1; j++) {

                let f = particle[`${name}-${i}-${j}`],
                    t = particle[`${name}-${i}-${j + 1}`],
                    v = requestVector(f.position).vectorSubtract(t.position),
                    l = v.getMagnitude();

                let s = makeSpring({

                    name: `${name}-horizontal-${i}-${j}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            }
        }

        for (i = 0; i < columns; i++) {

            for (j = 0; j < rows - 1; j++) {

                let f = particle[`${name}-${j}-${i}`],
                    t = particle[`${name}-${j + 1}-${i}`],
                    v = requestVector(f.position).vectorSubtract(t.position),
                    l = v.getMagnitude();

                let s = makeSpring({

                    name: `${name}-vertical-${i}-${j}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            }
        }
    },

    'strong-net': function (host) {

        let { particleStore, artefact, historyLength, engine, forces, springs, mass, area, airFriction, liquidFriction, solidFriction, rows, columns, rowDistance, columnDistance, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength } = this;

        let [x, y] = this.currentStampPosition;
        let [width, height] = host.currentDimensions;

        let deltaR = (rowDistance.substring) ? (parseFloat(rowDistance) / 100) * height : rowDistance;
        let deltaC = (columnDistance.substring) ? (parseFloat(columnDistance) / 100) * height : columnDistance;

        let dx, dy, p, i, j;

        // generate particles
        for (i = 0; i < rows; i++) {

            dy = (deltaR * i) + y;

            for (j = 0; j < columns; j++) {

                dx = (deltaC * j) + x;

                p = makeParticle({

                    name: `${name}-${i}-${j}`,

                    positionX: dx,
                    positionY: dy,
                    positionZ: 0,

                    velocityX: 0,
                    velocityY: 0,
                    velocityZ: 0,

                    historyLength, 
                    engine, 
                    forces, 

                    mass,
                    area,  
                    airFriction,  
                    liquidFriction,  
                    solidFriction,  

                    fill: artefact.get('fillStyle'),
                    stroke: artefact.get('strokeStyle'),
                });

                p.run(0, 0, false);

                particleStore.push(p);
            }
        }

        // generate springs
        for (i = 0; i < rows; i++) {

            for (j = 0; j < columns - 1; j++) {

                let f = particle[`${name}-${i}-${j}`],
                    t = particle[`${name}-${i}-${j + 1}`],
                    v = requestVector(f.position).vectorSubtract(t.position),
                    l = v.getMagnitude();

                let s = makeSpring({

                    name: `${name}-horizontal-${i}-${j}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            }
        }

        for (i = 0; i < columns; i++) {

            for (j = 0; j < rows - 1; j++) {

                let f = particle[`${name}-${j}-${i}`],
                    t = particle[`${name}-${j + 1}-${i}`],
                    v = requestVector(f.position).vectorSubtract(t.position),
                    l = v.getMagnitude();

                let s = makeSpring({

                    name: `${name}-vertical-${i}-${j}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            }
        }

        for (i = 0; i < columns - 1; i++) {

            for (j = 0; j < rows - 1; j++) {

                let f = particle[`${name}-${j}-${i}`],
                    t = particle[`${name}-${j + 1}-${i + 1}`],
                    v = requestVector(f.position).vectorSubtract(t.position),
                    l = v.getMagnitude();

                let s = makeSpring({

                    name: `${name}-diagonal-right-${i}-${j}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            }
        }

        for (i = 0; i < columns - 1; i++) {

            for (j = rows - 1; j > 0; j--) {

                let f = particle[`${name}-${j}-${i}`],
                    t = particle[`${name}-${j - 1}-${i + 1}`],
                    v = requestVector(f.position).vectorSubtract(t.position),
                    l = v.getMagnitude();

                let s = makeSpring({

                    name: `${name}-diagonal-left-${i}-${j}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            }
        }
    },
};


// #### Factory
// ```
// ```
const makeNet = function (items) {
    return new Net(items);
};

constructors.Net = Net;


// #### Exports
export {
    makeNet,
};
