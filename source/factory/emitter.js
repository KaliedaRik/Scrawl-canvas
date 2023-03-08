// # Emitter factory
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
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - Emitter using artefacts
// + [particles-003](../../demo/particles-003.html) - Position Emitter entity: start; pivot; mimic; path; mouse; drag-and-drop
// + [particles-004](../../demo/particles-004.html) - Emit particles along the length of a path
// + [particles-005](../../demo/particles-005.html) - Emit particles from inside an artefact's area
// + [particles-006](../../demo/particles-006.html) - Fixed number of Particles in a field; preAction and postAction functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality
// + [particles-012](../../demo/particles-012.html) - Use Net entity particles as reference coordinates for other artefacts
// + [delaunator-001](../../demo/delaunator-001.html) - Delauney triangulation and Voronoi cell visualisation


// #### Imports
import { constructors, tween, artefact, group, world } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt, xta, Ωempty } from '../core/utilities.js';
import { currentGroup } from './canvas.js';

import { requestParticle, releaseParticle } from './particle.js';
import { requestCell, releaseCell } from './cell.js';
import { makeVector, requestVector, releaseVector } from './vector.js';
import { requestCoordinate, releaseCoordinate } from './coordinate.js';
import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Emitter constructor
const Emitter = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.initializePositions();
    this.set(this.defs);

    // The entity has a hit zone which can be used for drag-and-drop, and other user interactions. Thus the `onXYZ` UI functions remain relevant.
    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    // Each instantiated entity will include two color factories - one for creating random fillStyle color Strings for generated particles, the other for generating strokeStyle colors.
    this.fillColorFactory = makeColor({ name: `${this.name}-fillColorFactory`});
    this.strokeColorFactory = makeColor({ name: `${this.name}-strokeColorFactory`});

    // The `range` attributes use Vector objects in which to hold their data.
    this.range = makeVector();
    this.rangeFrom = makeVector();

    // As part of its `stamp` functionality the Emitter entity will invoke three user-defined `xyzAction` functions. If none of these functions are supplied to the entity, then it will not display anything on the canvas.
    this.preAction = λnull;
    this.stampAction = λnull;
    this.postAction = λnull;

    // Setup the particle store, including the arrays used for winnowing out and killing dead particles
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
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, calculateOrder, stampOrder, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
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

    // __range__ and __rangeFrom__ - Vector objects with some convenience pseudo-attributes to make setting them a bit easier: _rangeX, rangeY, rangeZ, rangeFromX, rangeFromY, rangeFromZ_.
    // + These attributes set each generated particle'sinitial velocity; their values represent the distance travelled in the x, y and z directions, as measured in pixels-per-second.
    // + The `rangeFrom` attributes (float Numbers that can be negative) the lowest value in that dimension that will be generated. This value is ___local to the particle___ thus negative values are to the left (x) or above (y) or behind (z) the particle's initial position.
    // + The `range` attributes (again, float Numbers that can be negative) are the ___maximum (or least maximum) random value___ which will be added to the rangeFrom value. 
    // + All particles are assigned a (constrained) random velocity in this manner when they are generated.
    range: null,
    rangeFrom: null,

    // __generationRate__ - positive integer Number - Emitter entitys use ___ephemeral particles___ to produce their visual effects, generating a steady stream of particles over time and then killing them off in various ways. Attribute _sets the maximum number of particles that the Emitter will generate every second_.
    generationRate: 0,

    // __particleCount__ - positive integer Number - attribute _sets the maximum number of particles that the Emitter will manage and display at any one time_.
    particleCount: 0,

    // __generateAlongPath__, __generateInArea__ - Object-based flags (default: `false`) - to set the flags, assign an entity object to them
    // + the default action is for the Emitter to generate its particles from a single coordinate which can be determined from the Emitter's `lockTo` attribute - thus the coordinate can be the absolute/relative start coordinates, or a path/pivot/mimic reference entity, or a Net particle, or the mouse cursor.
    // + If we set the `generateAlongPath` attribute to a path-based entity then the Emitter will use that path to set the initial coordinate for all its generated particles
    // + If we set the `generateInArea` attribute to any entity then the Emitter will use that entity's area to set the initial coordinate for all its generated particles
    // + `generateInArea` takes precedence over `generateAlongPath`, which in turn takes precedence over the default coordinate behaviour
    generateAlongPath: null,
    generateInArea: null,
    generateFromExistingParticles: false,
    generateFromExistingParticleHistories: false,
    limitDirectionToAngleMultiples: 0,

    // __generationChoke__ - Number measuring milliseconds (default: 15) - because both `generateAlongPath` and `generateInArea` functionalities use a `while` loop, we need a way to break out of those loops should they fail to generate an acceptable coordinate within a given amount of time. This attribute sets the maximum time the entity will spend on generating semi-random coordinates during any one Display cycle loop.
    generationChoke: 15,

    // Emitter entitys will continuously generate new particles (up to the limit set in the `particleCount` attribute). The `killAfterTime`, `killRadius` and `killBeyondCanvas` attributes set out the circumstances in which existing particles will be removed from the entity's `particleStore` attribute
    // + __killAfterTime__ - a positive float Number - sets the maximum time (measured in ___seconds___) that a particle will live before it is killed and removed. This time is set on particle generation and is not updatable. We can add some randomness to the time through the __killAfterTimeVariation__ attribute.
    // + __killRadius__ - a positive float Number - sets the maximum distance (measurted in pixels) from its initial position that a particle can move. If it moves beyond that distance, it will be killed. Again, some variation can be introduced through the __killRadiusVariation__ attribute.
    // + __killBeyondCanvas__ - a Boolean flag (default: `false`) - when set, any particle that moves beyond its host Cell's canvas dimensions will be killed and removed.
    killAfterTime: 0,
    killAfterTimeVariation: 0,

    killRadius: 0,
    killRadiusVariation: 0,

    killBeyondCanvas: false,

    // __historyLength__ - positive integer Number - every Particle will keep a record of its recent state, in a set of ParticleHistory arrays stored in the Particle's `history` Array. The Emitter entity will set the maximum permitted length of the history array whenever it generates a new Particle. 
    historyLength: 1,

    // Emitter entitys will, as part of the Display cycle, apply any force objects assigned to a Particle. The initial forces assigned to every new Particle will be in line with the Force objects included in the Emitter's __forces__ Array.
    // + To set the Array, supply a new Array containing Force objects, and/or the name Strings of those Force objects, to the `forces` attribute.
    forces: null,

    // __mass__, __massVariation__ - positive float Number - the initial mass assigned to each Particle when it is generated.
    // + The `mass` attribute is used by the pre-defined ___gravity Force___
    mass: 1,
    massVariation: 0,

    // Physics calculations are handled by the Emitter entity's physics __engine__ which must be a String value of either `euler` (the default engine), `improved-euler` or `runge-kutta`.
    engine: 'euler',

    // Note that the __hitRadius__ attribute is tied directly to the __width__ and __height__ attributes (which are effectively meaningless for this entity)
    // + This attribute is absolute - unlike other Scrawl-canvas radius attributes it cannot be set using a percentage String value
    hitRadius: 10,

    // We can tell the entity to display its hit zone by setting the `showHitRadius` flag. The hit zone outline color attribute `hitRadiusColor` accepts any valid CSS color String value
    showHitRadius: false,
    hitRadiusColor: '#000000',

    // __resetAfterBlur__ - positive float Number (measuring seconds) - physics simulations can be brittle, particularly if they are forced to calculate Particle loads (accelerations), velocities and speeds over a large time step. Rather than manage that time step in cases where the user may neglect or navigate away from the browser tab containing the physics animation, Scrawl-canvas will stop, clear, and recreate the scene if the time it takes the user to return to (re-focus on) the web page is greater than the value set in this attribute.
    resetAfterBlur: 3,

    // ##### Not defined in the defs object, but set up in the constructor and setters
    
    // __particleStore__ - an Array where all the Emitter's current particles will be stored. To render the entity, we need to iterate through these particles and use them to repeatedly stamp the Emitter's artefact - or perform equivalent &lt;canvas> context engine instructions - onto the host Cell. These actions will be defined in the `stampAction` function.

    // The user-defined stamp functions __preAction__, __stampAction__ and __postAction__ are invoked in turn one each tick of the Display cycle. By default these functions do nothing, meaning nothing gets drawn to the canvas
    // + `preAction` and `postAction` - these functions receive a single argument, a Cell wrapper on which we can draw additional graphics (if needed) - see Demo [Particles 006](../../demo/particles-006.html) for a working example
    // + `stampAction` - define all major rendering actions in this function. The function receives the following arguments: `(artefact, particle, host)` - where `artefact` is the Emitter entity's artefact object (if any has been defined/set); `particle` is the current Particle object whose history needs to be rendered onto the canvas; and `host` is the Cell wrapper on which we will draw our graphics

    // __fillColorFactory__ and __strokeColorFactory__ - Color objects - there will never be a need to define these attributes as this is done as part of the factory's object build functionality. Used to generate fill and stroke colors for each newly generated particle

};
P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['forces', 'particleStore', 'deadParticles', 'liveParticles', 'fillColorFactory', 'strokeColorFactory']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, ['world', 'artefact', 'generateInArea', 'generateAlongPath']);
P.packetFunctions = pushUnique(P.packetFunctions, ['preAction', 'stampAction', 'postAction']);

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

    if (killArtefact) this.artefact.kill();

    if (killWorld) this.world.kill();

    this.fillColorFactory.kill();
    this.strokeColorFactory.kill();
    
    this.deadParticles.forEach(p => p.kill());
    this.liveParticles.forEach(p => p.kill());
    this.particleStore.forEach(p => p.kill());
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

S.preAction = function (item) {

    if (isa_fn(item)) {

        this.preAction = item;
        this.dirtyFilterIdentifier = true;
    }
};
S.stampAction = function (item) {

    if (isa_fn(item)) {

        this.stampAction = item;
        this.dirtyFilterIdentifier = true;
    }
};
S.postAction = function (item) {

    if (isa_fn(item)) {

        this.postAction = item;
        this.dirtyFilterIdentifier = true;
    }
};


S.world = function (item) {

    let w;

    if (item.substring) w = world[item];
    else if (isa_obj(item) && item.type === 'World') w = item;

    if (w) {

        this.world = w;
    }
};

S.artefact = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art) {

        this.artefact = art;
        this.dirtyFilterIdentifier = true;
    }
};

// To generate along a path, or in an area, we set the `generateAlongPath` or `generateInArea` attributes to the (path-based) artefact we shall be using for the template. This can be the artefact's String name, or the artefact object itself
S.generateAlongPath = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art && art.useAsPath) this.generateAlongPath = art;
    else this.generateAlongPath = false;

    this.dirtyFilterIdentifier = true;
};

S.generateInArea = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art) this.generateInArea = art;
    else this.generateInArea = false;

    this.dirtyFilterIdentifier = true;
};

// Color management - we can set these attributes (`fillColor fillMinimumColor fillMaximumColor, strokeColor strokeMinimumColor strokeMaximumColor`) on the Emitter object - the setter functions pass the color value onto the appropriate color factory for processing and update
S.fillColor = function (item) {

    this.fillColorFactory.set({color: item});
    this.dirtyFilterIdentifier = true;
};
S.fillMinimumColor = function (item) {

    this.fillColorFactory.set({minimumColor: item});
    this.dirtyFilterIdentifier = true;
};
S.fillMaximumColor = function (item) {

    this.fillColorFactory.set({maximumColor: item});
    this.dirtyFilterIdentifier = true;
};

S.strokeColor = function (item) {

    this.strokeColorFactory.set({color: item});
    this.dirtyFilterIdentifier = true;
};
S.strokeMinimumColor = function (item) {

    this.strokeColorFactory.set({minimumColor: item});
    this.dirtyFilterIdentifier = true;
};
S.strokeMaximumColor = function (item) {

    this.strokeColorFactory.set({maximumColor: item});
    this.dirtyFilterIdentifier = true;
};

S.hitRadius = function (item) {

    if (item.toFixed) {

        this.hitRadius = item;
        this.width = this.height = item * 2;
    }
};
D.hitRadius = function (item) {

    if (item.toFixed) {

        this.hitRadius += item;
        this.width = this.height = this.hitRadius * 2;
    }
};
S.width = function (item) {

    if (item.toFixed) {

        this.hitRadius = item / 2;
        this.width = this.height = item;
    }
};
D.width = function (item) {

    if (item.toFixed) {

        this.hitRadius = item / 2;
        this.width = this.height = item;
    }
};
S.height = S.width;
D.height = D.width;


// #### Prototype functions

// `prepareStamp` - internal - overwrites the entity mixin function
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

    if (this.lockTo.indexOf('mouse') >= 0 || this.lockTo.indexOf('particle') >= 0) {

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }

    if (this.dirtyStampPositions) this.cleanStampPositions();
    if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

    // Functionality specific to Emitter entitys
    let now = Date.now();

    let {particleStore, deadParticles, liveParticles, particleCount, generationRate, generatorChoke, resetAfterBlur} = this;

    // Create thew generator choke, if necessary
    if (!generatorChoke) {

        this.generatorChoke = generatorChoke = now;
    }

    // Check through particles, removing all particles that have completed their lives
    particleStore.forEach(p => {

        if (p.isRunning) liveParticles.push(p);
        else deadParticles.push(p);
    });
    particleStore.length = 0;

    deadParticles.forEach(d => releaseParticle(d));
    deadParticles.length = 0;

    particleStore.push(...liveParticles);
    liveParticles.length = 0;

    // Determine how many new particles need to be generated
    let elapsed = now - generatorChoke;

    // Need to prevent generation of new particles if the elapsed time is due to the user focussing on another tab in the browser before returning to the tab running this Scrawl-canvas animation
    if ((elapsed / 1000) > resetAfterBlur) {

        elapsed = 0;
        this.generatorChoke = now;
    }

    if (elapsed > 0 && generationRate) {

        let canGenerate = Math.floor((generationRate / 1000) * elapsed);

        if (particleCount) {

            let reqParticles = particleCount - particleStore.length;
            
            if (reqParticles <= 0) canGenerate = 0;
            else if (reqParticles < canGenerate) canGenerate = reqParticles;
        }

        if (canGenerate) {

            this.addParticles(canGenerate);

            // We only update the choke value after particles have been generated
            // + Ensures that if we only want 2 particles a second, our requirement will be respected
            this.generatorChoke = now;
        }
    }
};

// `addParticles` - internal function called by `prepareStamp` ... if you are not a fan of overly-complex functions, look away now.
//
// We can add particles to an emitter in a number of different ways, determined by the setting of two flag attributes on the emitter. The flags are actioned in the following order:
// + __generateInArea__ - when this flag attribute is set to an artefact object, the emitter will use that artefact's outline to decide where new particles will be added to the scene
// + __generateAlongPath__ - similarly, when this flag attribute is set to a shape-based entity (with its `useAsPath` attribute flag set to true), the emitter will use the path to dettermine wshere the new particle will be added.
//
// If neither of the above flags has been set, then the emitter will add particles from a single coordinate. This coordinate will be calculated according to the values set In the `lockTo` attribute (which can also be set using the `lockXTo` and `lockYTo` pseudo-attributes):
// + ___start___ - use the emitter entity's start/handle/offset coordinates - which can be absolute px Number or relative % String values
// + ___pivot___ - use a pivot entity to calculate the emitter's reference coordinate
// + ___mimic___ - use a mimic entity to calculate the emitter's reference coordinate
// + ___path___ - use a Shape-based entity's path to determine the emitter's reference coordinate
// + ___mouse___ - use the mouse/touch/pointer cursor value as the emitter's coordinate
P.addParticles = function (req) {

    const rnd = Math.random;

    // internal helper functions, used when creating the particle
    const calc = function (item, itemVar) {
        return item + ((rnd() * itemVar * 2) - itemVar);
    };

    const velocityCalc = function (item, itemVar) {
        return item + (rnd() * itemVar);
    };

    let i, p, cx, cy,
        timeChoke = Date.now();

    // The emitter object retains details of the initial values required for eachg particle it generates
    let {historyLength, engine, forces, mass, massVariation, fillColorFactory, strokeColorFactory, range, rangeFrom, currentStampPosition, particleStore, killAfterTime, killAfterTimeVariation, killRadius, killRadiusVariation, killBeyondCanvas, currentRotation, generateAlongPath, generateInArea, generateFromExistingParticles, generateFromExistingParticleHistories, limitDirectionToAngleMultiples, generationChoke} = this;

    let {x, y, z} = range;
    let {x:fx, y:fy, z:fz} = rangeFrom;

    // Use an artefact's current area location to determine where the particle will be generated
    if (generateInArea) {

        let host = this.currentHost;

        if (host) {

            const hostCanvas = host.element;

            const {width, height} = hostCanvas;

            if (!generateInArea.pathObject || generateInArea.dirtyPathObject) generateInArea.cleanPathObject();

            const testCell = requestCell(),
                testEngine = testCell.engine,
                coord = requestCoordinate();

            let {pathObject, winding, currentStart} = generateInArea;

            [cx, cy] = currentStart;

            const test = (item) => testEngine.isPointInPath(pathObject, ...item, winding);

            testCell.rotateDestination(testEngine, cx, cy, generateInArea);
            
            GenerateInAreaLoops:    
            for (i = 0; i < req; i++) {

                let coordFlag = false;

                while (!coordFlag) {

                    if (timeChoke + generationChoke < Date.now()) break GenerateInAreaLoops;

                    coord.set(rnd() * width, rnd() * height);

                    if (test(coord)) coordFlag = true;
                }

                p = requestParticle();

                p.set({
                    positionX: coord[0],
                    positionY: coord[1],
                    positionZ: 0,

                    velocityX: velocityCalc(fx, x),
                    velocityY: velocityCalc(fy, y),
                    velocityZ: velocityCalc(fz, z),

                    historyLength, 
                    engine, 
                    forces, 

                    mass: calc(mass, massVariation), 

                    fill: fillColorFactory.getRangeColor(Math.random()),
                    stroke: strokeColorFactory.getRangeColor(Math.random()),
                });

                let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
                let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

                p.run(timeKill, radiusKill, killBeyondCanvas);

                particleStore.push(p);
            }
            releaseCell(testCell);
            releaseCoordinate(coord);
        }
    }
    // Use an Shape-based entity's path to determine where the particle will be generated
    else if (generateAlongPath) {

        if (generateAlongPath.useAsPath) {

            if (!generateAlongPath.pathObject || generateAlongPath.dirtyPathObject) generateAlongPath.cleanPathObject();

            GenerateAlongPathLoops:
            for (i = 0; i < req; i++) {

                let coord = false,
                    coordFlag = false;

                while (!coordFlag) {

                    if (timeChoke + generationChoke < Date.now()) break GenerateAlongPathLoops;

                    coord = generateAlongPath.getPathPositionData(rnd(), true);
                    
                    if (coord) coordFlag = true;
                }

                p = requestParticle();

                p.set({
                    positionX: coord.x,
                    positionY: coord.y,
                    positionZ: 0,

                    velocityX: velocityCalc(fx, x),
                    velocityY: velocityCalc(fy, y),
                    velocityZ: velocityCalc(fz, z),

                    historyLength, 
                    engine, 
                    forces, 

                    mass: calc(mass, massVariation), 
 
                    fill: fillColorFactory.getRangeColor(Math.random()),
                    stroke: strokeColorFactory.getRangeColor(Math.random()),
                });

                let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
                let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

                p.run(timeKill, radiusKill, killBeyondCanvas);

                particleStore.push(p);
            }
        }
    }
    // TODO: documentation
    else if (generateFromExistingParticleHistories) {
        let len = particleStore.length,
            v, r, parent, history, ignore1, ignore2, startval,
            res = requestVector();

        for (i = 0; i < req; i++) {

            if (len) {

                parent = particleStore[Math.floor(Math.random() * len)];
                history = parent.history;

                if (history && history.length > 1) {

                    [ignore1, ignore2, ...startval] = history[Math.floor(Math.random() * history.length)];

                    if (startval) res.setFromArray(startval);
                    else res.setFromVector(parent.position);
                }
                else res.setFromVector(parent.position);
            }
            else res.setFromArray(currentStampPosition);

            p = requestParticle();

            p.set({
                positionX: res.x,
                positionY: res.y,
                positionZ: res.z,

                historyLength, 
                engine, 
                forces, 

                mass: calc(mass, massVariation), 

                fill: fillColorFactory.getRangeColor(Math.random()),
                stroke: strokeColorFactory.getRangeColor(Math.random()),
            });

            if (limitDirectionToAngleMultiples) {

                res.zero();
                r = Math.floor(360 / limitDirectionToAngleMultiples)
                res.x = velocityCalc(fx, x);
                res.rotate((Math.floor(Math.random() * r)) * limitDirectionToAngleMultiples);

                p.set({
                    velocityX: res.x,
                    velocityY: res.y,
                    velocityZ: velocityCalc(fz, z),
                });
            }
            else {

                p.set({
                    velocityX: velocityCalc(fx, x),
                    velocityY: velocityCalc(fy, y),
                    velocityZ: velocityCalc(fz, z),
                });
            }
            releaseVector(res);

            p.velocity.rotate(currentRotation);

            let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
            let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

            p.run(timeKill, radiusKill, killBeyondCanvas);

            particleStore.push(p);
        }
    }
    // TODO: documentation
    else if (generateFromExistingParticles) {

        let len = particleStore.length,
            v, r, parent,
            res = requestVector();

        for (i = 0; i < req; i++) {

            if (len) {

                parent = particleStore[Math.floor(Math.random() * len)];
                res.setFromVector(parent.position);
            }
            else res.setFromArray(currentStampPosition);

            p = requestParticle();

            p.set({
                positionX: res.x,
                positionY: res.y,
                positionZ: res.z,

                historyLength, 
                engine, 
                forces, 

                mass: calc(mass, massVariation), 

                fill: fillColorFactory.getRangeColor(Math.random()),
                stroke: strokeColorFactory.getRangeColor(Math.random()),
            });

            if (limitDirectionToAngleMultiples) {

                res.zero();
                r = Math.floor(360 / limitDirectionToAngleMultiples)
                res.x = velocityCalc(fx, x);
                res.rotate((Math.floor(Math.random() * r)) * limitDirectionToAngleMultiples);

                p.set({
                    velocityX: res.x,
                    velocityY: res.y,
                    velocityZ: velocityCalc(fz, z),
                });
            }
            else {

                p.set({
                    velocityX: velocityCalc(fx, x),
                    velocityY: velocityCalc(fy, y),
                    velocityZ: velocityCalc(fz, z),
                });
            }
            releaseVector(res);

            p.velocity.rotate(currentRotation);

            let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
            let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

            p.run(timeKill, radiusKill, killBeyondCanvas);

            particleStore.push(p);
        }
    }
    // Generate the particle using the emitter's start coordinate, or a reference artifact's coordinate
    else {

        [cx, cy] = currentStampPosition;
        
        for (i = 0; i < req; i++) {

            p = requestParticle();

            p.set({
                positionX: cx,
                positionY: cy,
                positionZ: 0,

                velocityX: velocityCalc(fx, x),
                velocityY: velocityCalc(fy, y),
                velocityZ: velocityCalc(fz, z),

                historyLength, 
                engine, 
                forces, 

                mass: calc(mass, massVariation), 

                fill: fillColorFactory.getRangeColor(Math.random()),
                stroke: strokeColorFactory.getRangeColor(Math.random()),
            });

            p.velocity.rotate(currentRotation);

            let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
            let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

            p.run(timeKill, radiusKill, killBeyondCanvas);

            particleStore.push(p);
        }
    }
};

// `regularStamp` - overwriters the functionality defined in the entity.js mixin
P.regularStamp = function () {

    let {world, artefact, particleStore, preAction, stampAction, postAction, lastUpdated, resetAfterBlur, showHitRadius, hitRadius, hitRadiusColor, currentStampPosition} = this;

    let host = this.currentHost;

    let deltaTime = 16 / 1000,
        now = Date.now();

    if (lastUpdated) deltaTime = (now - lastUpdated) / 1000;

    // If the user has focussed on another tab in the browser before returning to the tab running this Scrawl-canvas animation, then we risk breaking the page by continuing the animation with the existing particles - simplest solution is to remove all the particles and, in effect, restarting the emitter's animation.
    if (deltaTime > resetAfterBlur) {

        particleStore.forEach(p => releaseParticle(p));
        particleStore.length = 0;
        deltaTime = 16 / 1000;
    }

    particleStore.forEach(p => p.applyForces(world, host));
    particleStore.forEach(p => p.update(deltaTime, world));


    // Perform canvas drawing before the main (developer-defined) `stampAction` function
    preAction.call(this, host);

    particleStore.forEach(p => {

        p.manageHistory(deltaTime, host);
        stampAction.call(this, artefact, p, host);
    });

    // Perform further canvas drawing after the main (developer-defined) `stampAction` function
    postAction.call(this, host);

    if (showHitRadius) {

        let engine = host.engine;

        engine.save();
        engine.lineWidth = 1;
        engine.strokeStyle = hitRadiusColor;

        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.beginPath();
        engine.arc(currentStampPosition[0], currentStampPosition[1], hitRadius, 0, Math.PI * 2);
        engine.stroke();

        engine.restore();
    }

    this.lastUpdated = now;
};

// `checkHit` - overwrites the function defined in mixin/position.js
// + The Emitter entity's hit area is a circle centred on the entity's rotation/reflection (start) position or, where the entity's position is determined by reference (pivot, mimic, path, etc), the reference's current position.
// + Emitter entitys can be dragged and dropped around a canvas display like any other Scrawl-canvas artefact.
P.checkHit = function (items = [], mycell) {

    if (this.noUserInteraction) return false;

    let tests = (!Array.isArray(items)) ?  [items] : items;

    let currentStampPosition = this.currentStampPosition,
        res = false,
        tx, ty;

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

        let v = requestVector(currentStampPosition).vectorSubtract(test);

        if (v.getMagnitude() < this.hitRadius) res = true;

        releaseVector(v);

        return res;

    }, this)) {

        let r = this.checkHitReturn(tx, ty, mycell);

        return r;
    }
    return false;
};


// #### Factory
// ```
// let myWorld = scrawl.makeWorld({
//
//     name: 'demo-world',
//     tickMultiplier: 2,
//     userAttributes: [
//         {
//             key: 'particleColor', 
//             defaultValue: '#F0F8FF',
//         },
//         {
//             key: 'alphaDecay', 
//             defaultValue: 6,
//         },
//     ],
// });
//
// scrawl.makeEmitter({
//
//     name: 'use-raw-2d-context',
//     world: myWorld,
//     start: ['center', 'center'],
//
//     generationRate: 60,
//     killAfterTime: 5,
//
//     historyLength: 50,
//
//     rangeX: 40,
//     rangeFromX: -20,
//     rangeY: 40,
//     rangeFromY: -20,
//     rangeZ: -1,
//     rangeFromZ: -0.2,
//
//     stampAction: function (artefact, particle, host) {
//
//         let engine = host.engine,
//             history = particle.history,
//             remaining, radius, alpha, x, y, z,
//             endRad = Math.PI * 2;
//
//         engine.save();
//         engine.fillStyle = myWorld.get('particleColor');
//         engine.beginPath();
//         history.forEach((p, index) => {
//             [remaining, z, x, y] = p;
//             radius = 6 * (1 + (z / 3));
//             alpha = remaining / myWorld.alphaDecay;
//             if (radius > 0 && alpha > 0) {
//                 engine.moveTo(x, y);
//                 engine.arc(x, y, radius, 0, endRad);
//             }
//         });
//         engine.globalAlpha = alpha;
//         engine.fill();
//         engine.restore();
//     },
// });
// ```
const makeEmitter = function (items) {

    if (!items) return false;
    return new Emitter(items);
};

constructors.Emitter = Emitter;


// #### Exports
export {
    makeEmitter,
};
