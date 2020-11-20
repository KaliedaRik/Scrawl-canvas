// # Emitter factory
// Description TODO

// Unit emitters create a particle and maintain it themselves
// Spray emitters request/release particles


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - Emitter using artefacts
// + [particles-003](../../demo/particles-003.html) - Position Emitter entity: start; pivot; mimic; path; mouse; drag-and-drop
// + [particles-004](../../demo/particles-004.html) - Emit particles along the length of a path
// + [particles-005](../../demo/particles-005.html) - Emit particles from inside an artefact's area
// + [particles-006](../../demo/particles-006.html) - Fixed number of Particles in a field; preAction and postAction functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality


// #### Imports
import { constructors, artefact, world, styles } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt, xta } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { requestParticle, releaseParticle } from './particle.js';
import { requestCell, releaseCell } from './cell.js';
import { makeVector, requestVector, releaseVector } from './vector.js';
import { makeColor } from './color.js';

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

    this.fillColorFactory = makeColor({ name: `${this.name}-fillColorFactory`});
    this.strokeColorFactory = makeColor({ name: `${this.name}-strokeColorFactory`});

    this.preAction = λnull;
    this.stampAction = λnull;
    this.postAction = λnull;

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

    world: null,
    artefact: null,

    preAction: null,
    stampAction: null,
    postAction: null,

    historyLength: 1,
    engine: 'euler',
    forces: null,
    mass: 1,

    massVariation: 0,

    fillColorFactory: null,
    strokeColorFactory: null,

    // attributes specific to emitters

    // __range__ defines a vector whose x/y/z values represent the +/- values to be used when generating the initial 'velocity' value for new particles. 
    // + effectively a direction in which the new particles are fired when launched.
    // + we should also be able to change the direction when the emitter's `roll` attribute is non-zero
    range: null,
    rangeFrom: null,

    particleCount: 0,

    generationRate: 0,

    killAfterTime: 0,
    killAfterTimeVariation: 0,

    killRadius: 0,
    killRadiusVariation: 0,

    killBeyondCanvas: false,

    generateAlongPath: false,
    generateInArea: false,

    particleStore: null,

    resetAfterBlur: 3,

    hitRadius: 10,
    showHitRadius: false,
    hitRadiusColor: '#000000',
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
P.kill = function (killArtefact = false, killWorld = false) {

    this.isRunning = false;

    if (killArtefact) this.artefact.kill();

    if (killWorld) this.world.kill();

    this.fillColorFactory.kill();
    this.strokeColorFactory.kill();
    
    this.deadParticles.forEach(p => p.kill());
    this.liveParticles.forEach(p => p.kill());
    this.particleStore.forEach(p => p.kill());

    this.deregister();

    return true;
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

// `stamp` - returns a Promise. This is the function invoked by Group objects as they cascade the Display cycle __compile__ step through to their member artefacts.
// + Overwriters the functionality defined in the 
P.stamp = function (force = false, host, changes) {

    if (this.isRunning) {

        let {world, artefact, particleStore, preAction, stampAction, postAction, lastUpdated, resetAfterBlur, showHitRadius, hitRadius, hitRadiusColor, currentStampPosition} = this;

        if (artefact) {


            if (!host) host = this.getHost();

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


            // TODO: detect and manage collisions

            // Perform canvas drawing before the main (developer-defined) `stampAction` function
            preAction.call(this, host);

            // Emitter entitys must always be associated with one (and only one) artefact - it uses the artefact to rapidly visualise particles. The artefact can update its attributes (eg position, scale, roll, fillStyle, strokeStyle, etc) in response to the current Particle's attributes.
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
