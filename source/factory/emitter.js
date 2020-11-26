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


// #### Imports
import { constructors, tween, artefact, group, world } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt, xta } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';

import { requestParticle, releaseParticle } from './particle.js';
import { requestCell, releaseCell } from './cell.js';
import { makeVector, requestVector, releaseVector } from './vector.js';
import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Emitter constructor
const Emitter = function (items = {}) {

    // The constructor doesn't use the entity mixin constructor, so everything there needs to be replicated here.
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
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
let defaultAttributes = {

    // __world__ - World object; can be set using the String name of a World object, or the World object itself.
    world: null,

    // __artefact__ - In theory, any Scrawl-canvas object whose `isArtefact` flag is set to `true` can be assigned to this attribute. However this has not been tested on non-entity artefacts. For now, stick to Scrawl-canvas entity objects.
    // + Can be set using the String name of an artefact object, or the artefact object itself.
    artefact: null,

    preAction: null,
    stampAction: null,
    postAction: null,

    fillColorFactory: null,
    strokeColorFactory: null,

    // attributes specific to emitters

    // __range__ defines a vector whose x/y/z values represent the +/- values to be used when generating the initial 'velocity' value for new particles. 
    // + effectively a direction in which the new particles are fired when launched.
    // + we should also be able to change the direction when the emitter's `roll` attribute is non-zero
    range: null,
    rangeFrom: null,

    particleStore: null,

    particleCount: 0,

    generationRate: 0,

    generateAlongPath: false,
    generateInArea: false,

    killAfterTime: 0,
    killAfterTimeVariation: 0,

    killRadius: 0,
    killRadiusVariation: 0,

    killBeyondCanvas: false,

    historyLength: 1,
    engine: 'euler',

    forces: null,

    mass: 1,
    massVariation: 0,

    // Note that the __hitRadius__ attribute is tied directly to the __width__ and __height__ attributes (which are effectively meaningless for this entity)
    // + This attribute is absolute - unlike other Scrawl-canvas radius attributes it cannot be set using a percentage String value
    hitRadius: 10,

    // We can tell the entity to display its hit zone by setting the `showHitRadius` flag. The hit zone outline color attribute `hitRadiusColor` accepts any valid CSS color String value
    showHitRadius: false,
    hitRadiusColor: '#000000',

    resetAfterBlur: 3,
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

    if (isa_fn(item)) this.preAction = item;
};
S.stampAction = function (item) {

    if (isa_fn(item)) this.stampAction = item;
};
S.postAction = function (item) {

    if (isa_fn(item)) this.postAction = item;
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

S.generateAlongPath = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art && art.useAsPath) this.generateAlongPath = art;
    else this.generateAlongPath = false;
};

S.generateInArea = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art) this.generateInArea = art;
    else this.generateInArea = false;
};

S.fillColor = function (item) {

    if (isa_obj(item)) this.fillColorFactory.set(item);
};

S.strokeColor = function (item) {

    if (isa_obj(item)) this.fillColorFactory.set(item);
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

    // internal helper functions, used when creating the particle
    const calc = function (item, itemVar) {
        return item + ((Math.random() * itemVar * 2) - itemVar);
    };

    const velocityCalc = function (item, itemVar) {
        return item + (Math.random() * itemVar);
    };

    let i, p, cx, cy, temp;

    // The emitter object retains details of the initial values required for eachg particle it generates
    let {historyLength, engine, forces, mass, massVariation, fillColorFactory, strokeColorFactory, range, rangeFrom, currentStampPosition, particleStore, killAfterTime, killAfterTimeVariation, killRadius, killRadiusVariation, killBeyondCanvas, currentRotation, generateAlongPath, generateInArea} = this;

    let {x, y, z} = range;
    let {x:fx, y:fy, z:fz} = rangeFrom;

    // Use an artefact's current area location to determine where the particle will be generated
    if (generateInArea) {

        if (!generateInArea.pathObject || generateInArea.dirtyPathObject) generateInArea.cleanPathObject();

        const testCell = requestCell(),
            testEngine = testCell.engine,
            testVector = requestVector();

        let {pathObject, winding, currentStampPosition, currentStampHandlePosition, currentDimensions} = generateInArea;

        let [testX, testY] = currentStampPosition;
        let [handleX, handleY] = currentStampHandlePosition;
        let [width, height] = currentDimensions;

        let testRoll = generateInArea.currentRotation,
            testScale = generateInArea.currentScale,
            testUpend = generateInArea.flipUpend,
            testReverse = generateInArea.flipReverse;

        if (!xt(generateInArea.species)) {

            width *= testScale;
            height *= testScale;
            handleX *= testScale;
            handleY *= testScale;
        }

        testCell.rotateDestination(testEngine, testX, testY, generateInArea);

        const test = (item) => testEngine.isPointInPath(pathObject, item.x, item.y, winding);
            
        for (i = 0; i < req; i++) {

            let coordFlag = false;

            while (!coordFlag) {

                testVector.set((Math.random() * width), (Math.random() * height)).vectorSubtractArray([handleX, handleY]);

                if (testReverse) testVector.x = -testVector.x
                if (testUpend) testVector.y = -testVector.y

                testVector.rotate(testRoll).vectorAddArray(currentStampPosition);

                if (test(testVector)) coordFlag = true;
            }

            p = requestParticle();

            p.set({
                positionX: testVector.x,
                positionY: testVector.y,
                positionZ: 0,

                velocityX: velocityCalc(fx, x),
                velocityY: velocityCalc(fy, y),
                velocityZ: velocityCalc(fz, z),

                historyLength, 
                engine, 
                forces, 

                mass: calc(mass, massVariation), 

                fill: fillColorFactory.get('random'),
                stroke: strokeColorFactory.get('random'),
            });

            let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
            let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

            p.run(timeKill, radiusKill, killBeyondCanvas);

            particleStore.push(p);
        }
        releaseCell(testCell);
        releaseVector(testVector);
    }
    // Use an Shape-based entity's path to determine where the particle will be generated
    else if (generateAlongPath) {

        if (generateAlongPath.useAsPath) {

            for (i = 0; i < req; i++) {

                temp = generateAlongPath.getPathPositionData(Math.random(), true);

                p = requestParticle();

                p.set({
                    positionX: temp.x,
                    positionY: temp.y,
                    positionZ: 0,

                    velocityX: velocityCalc(fx, x),
                    velocityY: velocityCalc(fy, y),
                    velocityZ: velocityCalc(fz, z),

                    historyLength, 
                    engine, 
                    forces, 

                    mass: calc(mass, massVariation), 
 
                    fill: fillColorFactory.get('random'),
                    stroke: strokeColorFactory.get('random'),
                });

                let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
                let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

                p.run(timeKill, radiusKill, killBeyondCanvas);

                particleStore.push(p);
            }
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

                fill: fillColorFactory.get('random'),
                stroke: strokeColorFactory.get('random'),
            });

            p.velocity.rotate(currentRotation);

            let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
            let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

            p.run(timeKill, radiusKill, killBeyondCanvas);

            particleStore.push(p);
        }
    }
};

// `regularStampSynchronousActions` - overwriters the functionality defined in the entity.js mixin
P.regularStampSynchronousActions = function () {

    if (this.isRunning) {

        let {world, artefact, particleStore, preAction, stampAction, postAction, lastUpdated, resetAfterBlur, showHitRadius, hitRadius, hitRadiusColor, currentStampPosition} = this;

        // if (!host) host = self.getHost();
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
// ```
const makeEmitter = function (items) {
    return new Emitter(items);
};

constructors.Emitter = Emitter;


// #### Exports
export {
    makeEmitter,
};
