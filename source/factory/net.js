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
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt, xta, Ωempty } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';

import { makeParticle } from './particle.js';
import { requestVector, releaseVector } from './vector.js';
import { makeSpring } from './particleSpring.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Net constructor
const Net = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.initializePositions();
    this.set(this.defs);

    // The entity places a `hitRadius` around each of its particles - effectively a distributed hit zone which can be used for drag-and-drop, and other user interactions..
    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    // Net entitys generate their Particles once, on initialization, in line with the `generate` function's instructions. Scrawl-canvas includes a number of pre-built generator functions, which we can reference by their String names: `weak-net`, `strong-net`, `weak-shape`, `strong-shape`
    this.generate = λnull;

    // The `postGenerate` function runs imediately after the `generate` function. We can use it to amend the attributes of selected Particles, for instance to make them static.
    this.postGenerate = λnull;

    // As part of its `stamp` functionality the Net entity will invoke the `stampAction` function. If not supplied, the entity will not display anything on the canvas.
    this.stampAction = λnull;

    // Setup the particle store, and the entity's `springs` Array
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

    // __world__ - World object; can be set using the String name of a World object, or the World object itself.
    world: null,

    // __artefact__ - In theory, any Scrawl-canvas object whose `isArtefact` flag is set to `true` can be assigned to this attribute. However this has not been tested on non-entity artefacts. For now, stick to Scrawl-canvas entity objects.
    // + Can be set using the String name of an artefact object, or the artefact object itself.
    artefact: null,

    // __historyLength__ - positive integer Number - every Particle will keep a record of its recent state, in a set of ParticleHistory arrays stored in the Particle's `history` Array. The Net entity will set the maximum permitted length of the history array whenever it generates a new Particle. 
    historyLength: 1,

    // Net entitys will, as part of the Display cycle, apply any force objects assigned to a Particle. The initial forces assigned to every new Particle will be in line with the Force objects included in the Net's __forces__ Array.
    // + To set the Array, supply a new Array containing Force objects, and/or the name Strings of those Force objects, to the `forces` attribute.
    forces: null,

    // __mass__ - positive float Number - the initial mass assigned to each Particle when it is generated. Note that, unlike Net entitys, a Net entity will generate all its Particles with the same mass value
    // + The `mass` attribute is used by the pre-defined ___gravity Force___
    mass: 1,

    // Physics calculations are handled by the Net entity's physics __engine__ which must be a String value of either `euler` (the default engine), `improved-euler` or `runge-kutta`.
    engine: 'euler',

    // __springConstant__, __damperConstant__ - positive float Numbers - used for the initial values for any Spring objects generated to connect two Particles
    springConstant: 50,
    damperConstant: 10,

    // This is a ratio figure, not the actual rest length. If `== 1`, spring restLength will equal the initial distance between the two particles. `< 1` and the length will be proportionately smaller; `> 1` gives results in a longer length
    restLength: 1,

    // __showSprings__ - Boolean flag - when set, Scrawl-canvas will display the Spring connections between Particle pairs
    showSprings: false,

    // __showSpringColor__ - CSS color String - the strokeStyle color used to display the Spring objects
    showSpringsColor: '#000000',

    // ##### weak-net, strong-net
    // __rows__, __columns__ - positive integer Numbers
    rows: 0,
    columns: 0, 

    // __rowDistance__, __columnDistance__ - positive float Numbers, representing the absolute pixel distance between rows and columns, or percentage String values representing the distance as measured relative to the host Cell's dimensions
    rowDistance: 0,
    columnDistance: 0,

    // ##### weak-shape, strong-shape
    // __shapeTemplate__ - String name of a shape-based entity, or the entity object itself - used as the template along which particles will be generated
    shapeTemplate: null,

    // __precision__ - positive integer Number - the number of particles to generate along the template path
    precision: 20,

    // __joinTemplateEnds__ - Boolean flag - when set, springs will be generated to connect the start and the end particles on the template  path
    joinTemplateEnds: false,

    particlesAreDraggable: false,

    // Note that the __hitRadius__ attribute - a positive float Number - is absolute, and has nothing to do with the entity's dimensions. Net entity hit zones are tied to its Particles, not its start coordinate.
    hitRadius: 10,


    // __showHitRadius__ - Boolean flag - when set, Scrawl-canvas will display appropriate circles around each of the Net entity's Particles (in addition to any artefact stamped at the Particle's position)
    showHitRadius: false,

    // __hitRadiusColor__ - CSS color String - the strokeStyle color used to display the hit radius
    hitRadiusColor: '#000000',

    // __resetAfterBlur__ - positive float Number (measuring seconds) - physics simulations can be brittle, particularly if they are forced to calculate Particle loads (accelerations), velocities and speeds over a large time step. Rather than manage that time step in cases where the user may neglect or navigate away from the browser tab containing the physics animation, Scrawl-canvas will stop, clear, and recreate the scene if the time it takes the user to return to (re-focus on) the web page is greater than the value set in this attribute.
    resetAfterBlur: 3,

    // ##### Not defined in the defs object, but set up in the constructor and setters
    
    // __particleStore__ - an Array where all the Net's current particles will be stored. To render the entity, we need to iterate through these particles and use them to repeatedly stamp the Net's artefact - or perform equivalent &lt;canvas> context engine instructions - onto the host Cell. These actions will be defined in the `stampAction` function.

    // __stampAction__ - define all major rendering actions in this function. The function receives the following arguments: `(artefact, particle, host)` - where `artefact` is the Net entity's artefact object (if any has been defined/set); `particle` is the current Particle object whose history needs to be rendered onto the canvas; and `host` is the Cell wrapper on which we will draw our graphics

    // __springs__ - Array - holds all the entity's Spring objects
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
    this.dirtyFilterIdentifier = true;
};

S.shapeTemplate = function (item) {

    let art;

    if (item.substring) art = entity[item];
    else if (isa_obj(item) && item.isArtefact && xt(item.species)) art = item;

    if (art) this.shapeTemplate = art;
    this.dirtyFilterIdentifier = true;
};

// #### Prototype functions

// `regularStamp` - overwriters the functionality defined in the entity.js mixin
P.regularStamp = function () {

    let {world, artefact:art, particleStore, springs, generate, postGenerate, stampAction, lastUpdated, resetAfterBlur, showSprings, showSpringsColor, showHitRadius, hitRadius, hitRadiusColor} = this;

    let globalAlpha = 1,
        globalCompositeOperation = 'source-over';

    if (this.state) {
        globalAlpha = this.state.globalAlpha;
        globalCompositeOperation = this.state.globalCompositeOperation;
    }

    let host = this.currentHost;

    // The particle system is a physics system, which means we need to advance it by a small amount of time as part of each Display cycle
    let deltaTime = 16 / 1000,
        now = Date.now();

    if (lastUpdated) deltaTime = (now - lastUpdated) / 1000;

    // If the user has focussed on another tab in the browser before returning to the tab running this Scrawl-canvas animation, then we risk breaking the page by continuing the animation with the existing particles - simplest solution is to remove all the particles and, in effect, restart the Net's animation.
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
        engine.globalAlpha = globalAlpha;
        engine.globalCompositeOperation = globalCompositeOperation;
        engine.strokeStyle = showSpringsColor;
        engine.shadowOffsetX = 0,
        engine.shadowOffsetY = 0,
        engine.shadowBlur = 0,
        engine.shadowColor = 'rgba(0,0,0,0)',
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
        engine.globalAlpha = globalAlpha;
        engine.globalCompositeOperation = globalCompositeOperation;
        engine.lineWidth = 1;
        engine.strokeStyle = hitRadiusColor;
        engine.shadowOffsetX = 0,
        engine.shadowOffsetY = 0,
        engine.shadowBlur = 0,
        engine.shadowColor = 'rgba(0,0,0,0)',

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
};

// `restart` - force the Net to purge its particles/springs, rebuild itself, and restart its animation from the beginning
P.restart = function () {

    this.purgeParticlesFromLibrary();
    
    this.lastUpdated = Date.now();

    return this;
};

// `checkHit` - overwrites the function defined in mixin/position.js
// + The Net entity's hit areas are circles centred on the entity's Particle's positions. 
// + Nets cannot be dragged; the Particles that make up the Net can be dragged.
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

// `checkHitReturn` - overwrites the function defined in mixin/position.js
// + The return object includes the Particle object that recorded the hit, saved in the object's `particle` attribute
P.checkHitReturn = function (x, y, cell, particle) {

    return {
        x: x,
        y: y,
        artefact: this,
        particle: particle,
    };
};

// `pickupArtefact` - overwrites the function defined in mixin/position.js
// + One of the entity's Particle objects is being dragged, not the entity itself
P.pickupArtefact = function (items) {

    let particle = this.lastHitParticle;

    if (xta(items, particle)) {

        particle.isBeingDragged = items;
        particle.dragOffset = requestVector(particle.position).vectorSubtract(items);
        this.lastHitParticle
    }
    return this;
};

// `dropArtefact` - overwrites the function defined in mixin/position.js
// + One of the entity's Particle objects is being dragged, not the entity itself
P.dropArtefact = function () {

    this.lastHitParticle.isBeingDragged = null;
    releaseVector(this.lastHitParticle.dragOffset);
    this.lastHitParticle.dragOffset = null;
    this.lastHitParticle = null;
    return this;
};

// #### Pre-defined Net generators
const generators = {

    // `weak-net` - a net made up of rows and columns, with particles at each row/column intersection. The generator will connect each Particle with springs to up to four of its closest horizontal and vertical neighbors
    // + Can be used to model cloth
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

            const springMaker = function (particleFrom, particleTo, springName) {

                let v, l, s;

                v = requestVector(particleFrom.position).vectorSubtract(particleTo.position);
                l = v.getMagnitude();

                s = makeSpring({

                    name: springName,

                    particleFrom,
                    particleTo,

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
                    springMaker(f, t, `${name}-${i}-${j}~${name}-${i}-${j + 1}`);
                }
            }

            for (i = 0; i < columns; i++) {

                for (j = 0; j < rows - 1; j++) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j + 1}-${i}`];
                    springMaker(f, t, `${name}-${j}-${i}~${name}-${j + 1}-${i}`);
                }
            }
        }
    },

    // `strong-net` - a net made up of rows and columns, with particles at each row/column intersection. The generator will connect each Particle with springs to up to eight of its closest horizontal, vertical and diagonal neighbors
    // + Can be used to model a soft-bodied object
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

            const springMaker = function (particleFrom, particleTo, springName) {

                let v, l, s;

                v = requestVector(particleFrom.position).vectorSubtract(particleTo.position);
                l = v.getMagnitude();

                s = makeSpring({

                    name: springName,

                    particleFrom,
                    particleTo,

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
                    springMaker(f, t, `${name}-${i}-${j}~${name}-${i}-${j + 1}`);
                }
            }

            for (i = 0; i < columns; i++) {

                for (j = 0; j < rows - 1; j++) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j + 1}-${i}`];
                    springMaker(f, t, `${name}-${j}-${i}~${name}-${j + 1}-${i}`);
                }
            }

            for (i = 0; i < columns - 1; i++) {

                for (j = 0; j < rows - 1; j++) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j + 1}-${i + 1}`];
                    springMaker(f, t, `${name}-${j}-${i}~${name}-${j + 1}-${i + 1}`);
                }
            }

            for (i = 0; i < columns - 1; i++) {

                for (j = rows - 1; j > 0; j--) {

                    f = particle[`${name}-${j}-${i}`];
                    t = particle[`${name}-${j - 1}-${i + 1}`];
                    springMaker(f, t, `${name}-${j}-${i}~${name}-${j - 1}-${i + 1}`);
                }
            }
        }
    },

    // `weak-shape` - __Warning: not very stable!__ - a rope of Particles set along a path. The generator will connect each Particle with springs to up to six of its closest neighbors
    'weak-shape': function (host) {

        let { particleStore, artefact:art, historyLength, engine, forces, springs, mass, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength, shapeTemplate, precision, joinTemplateEnds } = this;

        const springMaker = function (particleFrom, particleTo, springName) {

            let v, l, s;

            v = requestVector(particleFrom.position).vectorSubtract(particleTo.position);
            l = v.getMagnitude();

            s = makeSpring({

                name: springName,

                particleFrom,
                particleTo,

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
                springMaker(f, t, `${name}-${i}~${name}-${i + 1}`);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t, `${name}-${precision - 1}~${name}-${0}`);
            }

            for (i = 0; i < precision - 2; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 2}`];
                springMaker(f, t, `${name}-${i}~${name}-${i + 2}`);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t, `${name}-${precision - 2}~${name}-${0}`);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t, `${name}-${precision - 1}~${name}-${1}`);
            }

            for (i = 0; i < precision - 3; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 3}`];
                springMaker(f, t, `${name}-${i}~${name}-${i + 3}`);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 3}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t, `${name}-${precision - 3}~${name}-${0}`);

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t, `${name}-${precision - 2}~${name}-${1}`);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${2}`];
                springMaker(f, t, `${name}-${precision - 1}~${name}-${2}`);
            }
        }
    },

    // `strong-shape` - __Warning: generally unstable!__ - a rope of Particles set along a path. The generator will connect each Particle with springs to up to six of its closest neighbors, and make an additional connection with a Particle at some distance from it (to act as a strut)
    'strong-shape': function (host) {

        let { particleStore, artefact:art, historyLength, engine, forces, springs, mass, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength, shapeTemplate, precision, joinTemplateEnds } = this;

        const springMaker = function (particleFrom, particleTo, springName) {

            let v, l, s;

            v = requestVector(particleFrom.position).vectorSubtract(particleTo.position);
            l = v.getMagnitude();

            s = makeSpring({

                name: springName,

                particleFrom,
                particleTo,

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
                springMaker(f, t, `${name}-${i}~${name}-${i + 1}`);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t, `${name}-${precision - 1}~${name}-${0}`);
            }

            for (i = 0; i < precision - 2; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 2}`];
                springMaker(f, t, `${name}-${i}~${name}-${i + 2}`);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t, `${name}-${precision - 2}~${name}-${0}`);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t, `${name}-${precision - 1}~${name}-${1}`);
            }

            for (i = 0; i < precision - 3; i++) {

                f = particle[`${name}-${i}`];
                t = particle[`${name}-${i + 3}`];
                springMaker(f, t, `${name}-${i}~${name}-${i + 3}`);
            }

            if (joinTemplateEnds) {

                f = particle[`${name}-${precision - 3}`];
                t = particle[`${name}-${0}`];
                springMaker(f, t, `${name}-${precision - 3}~${name}-${0}`);

                f = particle[`${name}-${precision - 2}`];
                t = particle[`${name}-${1}`];
                springMaker(f, t, `${name}-${precision - 2}~${name}-${1}`);

                f = particle[`${name}-${precision - 1}`];
                t = particle[`${name}-${2}`];
                springMaker(f, t, `${name}-${precision - 1}~${name}-${2}`);
            }

            let halfPrecision = Math.floor(precision / 2);

            for (i = 0; i < precision - halfPrecision; i++) {

                f = particle[`${name}-${i}`];

                if (i + halfPrecision < precision - 1) {

                    t = particle[`${name}-${i + halfPrecision}`];
                    springMaker(f, t, `${name}-${i}~${name}-${i + halfPrecision}`);
                }
            }
        }
    },

    // `hub-spoke` - __Warning: highly unstable!__ - a rope of Particles set along a path. The generator will connect each Particle with springs to its closest neighbors, and make an additional connection with a 'hub' particle at the template's rotation-reflection point.
    'hub-spoke': function (host) {

        let { shapeTemplate, precision } = this;

        if (shapeTemplate && shapeTemplate.type && precision) {

            let { particleStore, artefact:art, historyLength, engine, forces, springs, mass, showSprings, showSpringsColor, name, springConstant, damperConstant, restLength, joinTemplateEnds } = this;

            const springMaker = function (particleFrom, particleTo, springName) {

                let v, l, s;

                v = requestVector(particleFrom.position).vectorSubtract(particleTo.position);
                l = v.getMagnitude();

                s = makeSpring({

                    name: springName,

                    particleFrom,
                    particleTo,

                    springConstant, 
                    damperConstant,

                    restLength: l * restLength,
                });

                springs.push(s);
                releaseVector(v);
            };

            let i, p, f, t, hub;

            if (['Bezier', 'Line', 'Oval', 'Polygon', 'Polyline', 'Quadratic', 'Rectangle', 'Shape', 'Spiral', 'Star', 'Tetragon'].indexOf(shapeTemplate.type) >= 0) {

                // build the rim
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
                    springMaker(f, t, `${name}-${i}-${i + 1}`);
                }

                if (joinTemplateEnds) {

                    f = particle[`${name}-${precision - 1}`];
                    t = particle[`${name}-${0}`];
                    springMaker(f, t, `${name}-${precision - 1}-0`);
                }

                for (i = 0; i < precision - 2; i++) {

                    f = particle[`${name}-${i}`];
                    t = particle[`${name}-${i + 2}`];
                    springMaker(f, t, `${name}-${i}~${name}-${i + 2}`);
                }

                if (joinTemplateEnds) {

                    f = particle[`${name}-${precision - 2}`];
                    t = particle[`${name}-${0}`];
                    springMaker(f, t, `${name}-${precision - 2}~${name}-${0}`);

                    f = particle[`${name}-${precision - 1}`];
                    t = particle[`${name}-${1}`];
                    springMaker(f, t, `${name}-${precision - 1}~${name}-${1}`);
                }
            }
            else if (['Block', 'Cell', 'Element', 'Grid', 'Phrase', 'Picture', 'Stack'].indexOf(host.type) >= 0) {

            }
            else if (host.type === 'Wheel') {

            }

            let [x, y] = shapeTemplate.get('position');

            hub = makeParticle({

                name: `${name}-hub`,

                positionX: x,
                positionY: y,
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

            hub.run(0, 0, false);

            particleStore.forEach((p, index) => springMaker(p, hub, `${name}-${index}-hub`));

            particleStore.push(hub);
        }
    },
};


// #### Factory
const makeNet = function (items) {

    if (!items) return false;
    return new Net(items);
};

constructors.Net = Net;


// #### Exports
export {
    makeNet,
};
