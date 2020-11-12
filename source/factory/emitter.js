// # Emitter factory
// Description TODO

// Unit emitters create a particle and maintain it themselves
// Spray emitters request/release particles


// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-002](../../demo/particles-002.html) - DEMO NAME


// #### Imports
import { constructors, artefact } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt } from '../core/utilities.js';
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

    world: null,
    artefact: null,

    stampAction: null,

    historyLength: 1,
    engine: 'euler',
    forces: null,
    springs: null,
    mass: 1,
    area: 1,
    airFriction: 1,
    liquidFriction: 1, 
    solidFriction: 1,

    massVariation: 0,
    areaVariation: 0,
    airFrictionVariation: 0,
    liquidFrictionVariation: 0, 
    solidFrictionVariation: 0,

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

    killBeyondScale: 0,

    generateAlongPath: false,
    generateInArea: false,

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

    let now = Date.now();

    let {particleStore, deadParticles, liveParticles, minimumCount, maximumCount, generationRate, generatorChoke} = this;

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

    let elapsed = now - generatorChoke;

    if (elapsed > 0 && generationRate) {

        let canGenerate = Math.floor((generationRate / 1000) * elapsed);

        if (canGenerate) {

            this.addParticles(canGenerate);
            this.generatorChoke = now;
        }
    }
};

P.addParticles = function (req) {

    const calc = function (item, itemVar) {
        return item + ((Math.random() * itemVar * 2) - itemVar);
    };

    const velocityCalc = function (item, itemVar) {
        return item + (Math.random() * itemVar);
    };

    let i, p, cx, cy, temp;

    let {historyLength, engine, forces, springs, mass, massVariation, area, areaVariation, airFriction, airFrictionVariation, liquidFriction, liquidFrictionVariation, solidFriction, solidFrictionVariation, fillColorFactory, strokeColorFactory, range, rangeFrom, currentStampPosition, particleStore, killAfterTime, killAfterTimeVariation, killRadius, killRadiusVariation, killBeyondCanvas, killBeyondScale, currentRotation, generateAlongPath, generateInArea} = this;

    let {x, y, z} = range;
    let {x:fx, y:fy, z:fz} = rangeFrom;

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
                springs, 

                mass: calc(mass, massVariation), 
                area: calc(area, areaVariation),  
                airFriction: calc(airFriction, airFrictionVariation),  
                liquidFriction: calc(liquidFriction, liquidFrictionVariation),  
                solidFriction: calc(solidFriction, solidFrictionVariation),  

                fill: fillColorFactory.get('random'),
                stroke: strokeColorFactory.get('random'),
            });

            let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
            let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

            p.run(timeKill, radiusKill, killBeyondCanvas, killBeyondScale);

            particleStore.push(p);
        }
        releaseCell(testCell);
        releaseVector(testVector);
    }
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
                    springs, 

                    mass: calc(mass, massVariation), 
                    area: calc(area, areaVariation),  
                    airFriction: calc(airFriction, airFrictionVariation),  
                    liquidFriction: calc(liquidFriction, liquidFrictionVariation),  
                    solidFriction: calc(solidFriction, solidFrictionVariation),  

                    fill: fillColorFactory.get('random'),
                    stroke: strokeColorFactory.get('random'),
                });

                let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
                let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

                p.run(timeKill, radiusKill, killBeyondCanvas, killBeyondScale);

                particleStore.push(p);
            }
        }
    }
    else {

        [cx, cy] = currentStampPosition;
        
        for (i = 0; i < req; i++) {

            p = requestParticle();

            p.set({
                positionX: cx,
                positionY: cy,
                positionZ: 0,

                // velocityX: fx + (rnd() * x),
                // velocityY: fy + (rnd() * y),
                // velocityZ: fz + (rnd() * z),
                velocityX: velocityCalc(fx, x),
                velocityY: velocityCalc(fy, y),
                velocityZ: velocityCalc(fz, z),

                historyLength, 
                engine, 
                forces, 
                springs, 

                // mass: mass + ((rnd() * massVariation * 2) - massVariation), 
                // area: area + ((rnd() * areaVariation * 2) - areaVariation), 
                // airFriction: airFriction + ((rnd() * airFrictionVariation * 2) - airFrictionVariation), 
                // liquidFriction: liquidFriction + ((rnd() * liquidFrictionVariation * 2) - liquidFrictionVariation), 
                // solidFriction: solidFriction + ((rnd() * solidFrictionVariation * 2) - solidFrictionVariation),
                mass: calc(mass, massVariation), 
                area: calc(area, areaVariation),  
                airFriction: calc(airFriction, airFrictionVariation),  
                liquidFriction: calc(liquidFriction, liquidFrictionVariation),  
                solidFriction: calc(solidFriction, solidFrictionVariation),  

                fill: fillColorFactory.get('random'),
                stroke: strokeColorFactory.get('random'),
            });

            p.velocity.rotate(currentRotation);

            // let timeKill = Math.abs(killAfterTime + ((rnd() * killAfterTimeVariation * 2) - killAfterTimeVariation));
            // let radiusKill = Math.abs(killRadius + ((rnd() * killRadiusVariation * 2) - killRadiusVariation));
            let timeKill = Math.abs(calc(killAfterTime, killAfterTimeVariation));
            let radiusKill = Math.abs(calc(killRadius, killRadiusVariation));

            p.run(timeKill, radiusKill, killBeyondCanvas, killBeyondScale);

            particleStore.push(p);
        }
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
