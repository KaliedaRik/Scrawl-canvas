// # Net factory
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


// #### Demos:
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop functionality
// + [particles-010](../../demo/particles-010.html) - Net entity: using a shape path as a net template
// + [particles-012](../../demo/particles-012.html) - Use Net entity particles as reference coordinates for other artefacts


// #### Imports
import { constructors, artefact, artefactnames, entity, world, particle } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt, xta } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';

import { makeParticle } from './particle.js';
import { requestVector, releaseVector } from './vector.js';
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
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, filter___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
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

    // weak-net, strong-net
    rows: 0,
    columns: 0, 
    rowDistance: 0,
    columnDistance: 0,

    // weak-shape, strong-shape
    shapeTemplate: null,
    precision: 20,
    joinTemplateEnds: false,

    // Spring
    springConstant: 50,
    damperConstant: 10,
    showSprings: false,
    showSpringsColor: '#000000',

    // This is a ratio figure, not the actual rest length. If == 1, spring restLength will equal the initial distance between the two particles. < 1 and the length will be proportionately smaller; > 1 gives results in a longer length
    restLength: 1,

    particleStore: null,

    resetAfterBlur: 3,

    particlesAreDraggable: false,
    hitRadius: 10,
    showHitRadius: false,
    hitRadiusColor: '#000000',
};
P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['forces', 'springs', 'particleStore']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, ['world', 'artefact', 'shapeTemplate']);
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
P.factoryKill = function (killArtefact, killWorld) {

    this.isRunning = false;
    if (killArtefact) {

        this.artefact.kill();
        if (this.shapeTemplate) this.shapeTemplate.kill();
    }

    if (killWorld) this.world.kill();
    this.purgeParticlesFromLibrary();
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

S.shapeTemplate = function (item) {

    let art;

    if (item.substring) art = entity[item];
    else if (isa_obj(item) && item.isArtefact && xt(item.species)) art = item;

    if (art) this.shapeTemplate = art;
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

// `regularStampSynchronousActions` - overwriters the functionality defined in the entity.js mixin
P.regularStampSynchronousActions = function () {

    // Unlike other entitys, Net entitys need to be __running__ before they can be stamped
    if (this.isRunning) {

        let {world, artefact:art, particleStore, springs, generate, postGenerate, stampAction, lastUpdated, resetAfterBlur, showSprings, showSpringsColor, showHitRadius, hitRadius, hitRadiusColor} = this;

        let host = this.currentHost;

        // The particle system is a physics system, which means we need to advance it by a small amount of time as part of each Display cycle
        let deltaTime = 16 / 1000,
            now = Date.now();

        if (lastUpdated) deltaTime = (now - lastUpdated) / 1000;

        // If the user has focussed on another tab in the browser before returning to the tab running this Scrawl-canvas animation, then we risk breaking the page by continuing the animation with the existing particles - simplest solution is to remove all the particles and, in effect, restart the emitter's animation.
        if (deltaTime > resetAfterBlur) {

            this.purgeParticlesFromLibrary();
            deltaTime = 16 / 1000;
        }

        // If we have no particles, we need to generate them
        if (!particleStore.length) {

            generate.call(this, host);
            postGenerate.call(this);
        }

        // The physics core of the function: 
        // + Calculate the forces acting on each of the Net entity's particles
        // + Add the Spring constraints to the particles
        // + Get the particles to update themselves, using the appropriate physics engine
        particleStore.forEach(p => p.applyForces(world, host));
        springs.forEach(s => s.applySpring());
        particleStore.forEach(p => p.update(deltaTime, world));

        // Additional visuals are available - specifically we can draw in the springs acting on particle pairs before we stamp the artefact on them
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

        // The display cycle core of the function
        // + Get each particle to update its history
        // + Using that history, get each particle to stamp some ink onto the canvas.
        particleStore.forEach(p => {

            p.manageHistory(deltaTime, host);
            stampAction.call(this, art, p, host);
        });

        // A second set of additional visuals - display each particle's hit region
        if (showHitRadius) {

            let engine = host.engine;

            engine.save();
            engine.lineWidth = 1;
            engine.strokeStyle = hitRadiusColor;

            engine.setTransform(1, 0, 0, 1, 0, 0);
            engine.beginPath();

            particleStore.forEach(p => {
                engine.moveTo(p.position.x, p.position.y);
                engine.arc(p.position.x, p.position.y, hitRadius, 0, Math.PI * 2);
            });
            
            engine.stroke();
            engine.restore();
        }

        // The final critical step - remember the absolute time value of when we started to perform this Display cycle
        this.lastUpdated = now;
    }
};

P.run = function () {

    this.isRunning = true;
    return this;
};
P.halt = function () {

    this.isRunning = false;
    return this;
};
P.purgeParticlesFromLibrary = function () {

    let {particleStore, springs} = this;

    // Net entity particles can be referenced by other artefacts (when using them for positioning coordinates. New particles will be created with the same names as the old ones, so it is enough to replace these references with the String names of the particles)
    artefactnames.forEach(a => {

        let tempArt = artefact[a];

        if (tempArt) {

            if (tempArt.particle && !tempArt.particle.substring && tempArt.particle.name) tempArt.particle = tempArt.particle.name;

            // Polyline entitys go one step further in that they can also use Particles in their pin array
            if (tempArt.type === 'Polyline' && tempArt.useParticlesAsPins) {

                tempArt.pins.forEach((pin, index) => {

                    if (isa_obj(pin) && pin.type === 'Particle') {

                        tempArt.pins[index] = pin.name;
                        tempArt.dirtyPins = true;
                    }
                });
            }
        }
    });

    // Now we can tell all the Net entity's particles to kill themselves
    particleStore.forEach(p => p.kill());
    particleStore.length = 0;

    // We can also get rid of all the Spring objects as they will be recreated alongside the particle objects as part of the Net entity's `generate` functionality.
    springs.forEach(s => s.kill());
    springs.length = 0;
};

P.restart = function () {

    this.purgeParticlesFromLibrary();
    
    this.lastUpdated = Date.now();

    this.isRunning = true;
    return this;
};

P.checkHit = function (items = [], mycell) {

    this.lastHitParticle = null;

    if (!this.particlesAreDraggable) return false;

    if (this.noUserInteraction) return false;

    let tests = (!Array.isArray(items)) ?  [items] : items;

    let particleStore = this.particleStore,
        res = false,
        tx, ty, i, iz, p;

    if (tests.some(test => {

        if (Array.isArray(test)) {

            tx = test[0];
            ty = test[1];
        }
        else if (xta(test, test.x, test.y)) {

            tx = test.x;
            ty = test.y;
        }
        else return false;

        if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;

        let v = requestVector();

        for (i = 0, iz = particleStore.length; i < iz; i++) {

            p = particleStore[i];

            v.set(p.position).vectorSubtract(test);

            if (v.getMagnitude() < this.hitRadius) {

                res = p;
                break;
            }
        }
        releaseVector(v);

        return res;

    }, this)) {

        let r = this.checkHitReturn(tx, ty, mycell, res);

        this.lastHitParticle = res;

        return r;
    }
    return false;
};

// Function overwritten by entitys, if required
P.checkHitReturn = function (x, y, cell, particle) {

    return {
        x: x,
        y: y,
        artefact: this,
        particle: particle,
    };
};

// `pickupArtefact`
P.pickupArtefact = function (items = {}) {

    let particle = this.lastHitParticle;

    if (xta(items, particle)) {

        particle.isBeingDragged = items;
        particle.dragOffset = requestVector(particle.position).vectorSubtract(items);
        this.lastHitParticle
    }
    return this;
};

// `dropArtefact`
P.dropArtefact = function () {

    this.lastHitParticle.isBeingDragged = null;
    releaseVector(this.lastHitParticle.dragOffset);
    this.lastHitParticle.dragOffset = null;
    this.lastHitParticle = null;
    return this;
};

const generators = {

    'weak-net': function (host) {

        let { particleStore, artefact:art, historyLength, engine, forces, springs, mass, rows, columns, rowDistance, columnDistance, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength } = this;

        if (host && rows > 0 && columns > 0) {

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

                        fill: art.get('fillStyle'),
                        stroke: art.get('strokeStyle'),
                    });

                    p.run(0, 0, false);

                    particleStore.push(p);
                }
            }

            const springMaker = function (myF, myT) {

                let v, l, s;

                v = requestVector(f.position).vectorSubtract(t.position);
                l = v.getMagnitude();

                s = makeSpring({

                    name: `${name}-link-${i}-${i+1}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            };

            let f, t;

            // generate springs
            for (i = 0; i < rows; i++) {

                for (j = 0; j < columns - 1; j++) {

                    f = particle[`${name}-${i}-${j}`];
                    t = particle[`${name}-${i}-${j + 1}`];
                    springMaker(f, t);
                }
            }

            for (i = 0; i < columns; i++) {

                for (j = 0; j < rows - 1; j++) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j + 1}-${i}`];
                    springMaker(f, t);
                }
            }
        }
    },

    'strong-net': function (host) {

        let { particleStore, artefact:art, historyLength, engine, forces, springs, mass, rows, columns, rowDistance, columnDistance, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength } = this;

        if (host && rows > 0 && columns > 0) {

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

                        fill: art.get('fillStyle'),
                        stroke: art.get('strokeStyle'),
                    });

                    p.run(0, 0, false);

                    particleStore.push(p);
                }
            }

            const springMaker = function (myF, myT) {

                let v, l, s;

                v = requestVector(f.position).vectorSubtract(t.position);
                l = v.getMagnitude();

                s = makeSpring({

                    name: `${name}-link-${i}-${i+1}`,

                    particleFrom: f,
                    particleTo: t,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            };

            let f, t;

            // generate springs
            for (i = 0; i < rows; i++) {

                for (j = 0; j < columns - 1; j++) {

                    f = particle[`${name}-${i}-${j}`];
                    t = particle[`${name}-${i}-${j + 1}`];
                    springMaker(f, t);
                }
            }

            for (i = 0; i < columns; i++) {

                for (j = 0; j < rows - 1; j++) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j + 1}-${i}`];
                    springMaker(f, t);
                }
            }

            for (i = 0; i < columns - 1; i++) {

                for (j = 0; j < rows - 1; j++) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j + 1}-${i + 1}`];
                    springMaker(f, t);
                }
            }

            for (i = 0; i < columns - 1; i++) {

                for (j = rows - 1; j > 0; j--) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j - 1}-${i + 1}`];
                    springMaker(f, t);
                }
            }
        }
    },

    'weak-shape': function (host) {

        let { particleStore, artefact:art, historyLength, engine, forces, springs, mass, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength, shapeTemplate, precision, joinTemplateEnds } = this;

        const springMaker = function (myF, myT) {

            let v, l, s;

            v = requestVector(f.position).vectorSubtract(t.position);
            l = v.getMagnitude();

            s = makeSpring({

                name: `${name}-link-${i}-${i+1}`,

                particleFrom: f,
                particleTo: t,

                springConstant, 
                damperConstant,

                restLength: l * restLength,
            });

            springs.push(s);
            releaseVector(v);
        };

        let i, p, f, t;

        if (shapeTemplate && precision) {

            for (i = 0; i < precision; i++) {

                let coords = shapeTemplate.getPathPositionData(i / precision);

                p = makeParticle({

                    name: `${name}-${i}`,

                    positionX: coords.x,
                    positionY: coords.y,
                    positionZ: 0,

                    velocityX: 0,
                    velocityY: 0,
                    velocityZ: 0,

                    historyLength,
                    engine,
                    forces,

                    mass,

                    fill: art.get('fillStyle'),
                    stroke: art.get('strokeStyle'),
                });

                p.run(0, 0, false);

                particleStore.push(p);
            }

            for (i = 0; i < precision - 1; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 1}`];
                springMaker(f, t);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t);
            }

            for (i = 0; i < precision - 2; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 2}`];
                springMaker(f, t);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t);
            }

            for (i = 0; i < precision - 3; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 3}`];
                springMaker(f, t);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 3}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t);

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${2}`];
                springMaker(f, t);
            }
        }
    },

    'strong-shape': function (host) {

        let { particleStore, artefact:art, historyLength, engine, forces, springs, mass, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength, shapeTemplate, precision, joinTemplateEnds } = this;

        const springMaker = function (myF, myT) {

            let v, l, s;

            v = requestVector(f.position).vectorSubtract(t.position);
            l = v.getMagnitude();

            s = makeSpring({

                name: `${name}-link-${i}-${i+1}`,

                particleFrom: f,
                particleTo: t,

                springConstant, 
                damperConstant,

                restLength: l * restLength,
            });

            springs.push(s);
            releaseVector(v);
        };

        let i, p, f, t;

        if (shapeTemplate && precision) {

            for (i = 0; i < precision; i++) {

                let coords = shapeTemplate.getPathPositionData(i / precision);

                p = makeParticle({

                    name: `${name}-${i}`,

                    positionX: coords.x,
                    positionY: coords.y,
                    positionZ: 0,

                    velocityX: 0,
                    velocityY: 0,
                    velocityZ: 0,

                    historyLength,
                    engine,
                    forces,

                    mass,

                    fill: art.get('fillStyle'),
                    stroke: art.get('strokeStyle'),
                });

                p.run(0, 0, false);

                particleStore.push(p);
            }

            for (i = 0; i < precision - 1; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 1}`];
                springMaker(f, t);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t);
            }

            for (i = 0; i < precision - 2; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 2}`];
                springMaker(f, t);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t);
            }

            for (i = 0; i < precision - 3; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 3}`];
                springMaker(f, t);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 3}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t);

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${2}`];
                springMaker(f, t);
            }

            let halfPrecision = Math.floor(precision / 2);

            for (i = 0; i < precision - halfPrecision; i++) {

                f = particle[`${name}-${i}`];

                if (i + halfPrecision < precision - 1) {

                    t = particle[`${name}-${i + halfPrecision}`];
                    springMaker(f, t);
                }
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
