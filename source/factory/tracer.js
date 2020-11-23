// # Tracer factory
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
// = [Net](./net.html) - a (generally) larger entity which uses both forces and springs to manage the animation of its non-recycled particles. Note that other artefacts can use Net particles as a reference for their own positioning.



// #### Demos:
// + [particles-011](../../demo/particles-011.html) - Tracer entity: basic functionality
// + [particles-012](../../demo/particles-012.html) - Use Net entity particles as reference coordinates for other artefacts


// #### Imports
import { constructors, artefact } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xta } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';

import { makeParticle } from './particle.js';
import { requestVector, releaseVector } from './vector.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Tracer constructor
const Tracer = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.initializePositions();

    this.set(this.defs);

    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    this.stampAction = λnull;

    this.trace = makeParticle(items);

    if (!items.group) items.group = currentGroup;

    this.set(items);

    if (this.purge) this.purgeArtefact(this.purge);

    return this;
};


// #### Tracer prototype
let P = Tracer.prototype = Object.create(Object.prototype);

P.type = 'Tracer';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = entityMix(P);

// #### Emitter attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
let defaultAttributes = {

    artefact: null,

    trace: null,

    stampAction: null,

    historyLength: 1,

    hitRadius: 10,
    showHitRadius: false,
    hitRadiusColor: '#000000',
};
P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, []);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, ['artefact', 'particle']);
P.packetFunctions = pushUnique(P.packetFunctions, ['stampAction']);

P.finalizePacketOut = function (copy, items) {

    return copy;
};

// #### Clone management
P.postCloneAction = function(clone, items) {

    clone.trace = makeParticle({
        name: clone.name,
        historyLength: items.historyLength || this.historyLength || 1,
    });

    return clone;
};


// #### Kill management
P.kill = function (killArtefact = false) {

    if (killArtefact) this.artefact.kill();

    this.trace.kill();

    this.deregister();

    return true;
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

S.stampAction = function (item) {

    if (isa_fn(item)) this.stampAction = item;
};

S.artefact = function (item) {

    let art;

    if (item.substring) art = artefact[item];
    else if (isa_obj(item) && item.isArtefact) art = item;

    if (art) this.artefact = art;
};


// #### Prototype functions

// `stamp` - returns a Promise. This is the function invoked by Group objects as they cascade the Display cycle __compile__ step through to their member artefacts.
// + Overwriters the functionality defined in the 
P.stamp = function (force = false, host, changes) {

    let {artefact, trace, stampAction, showHitRadius, hitRadius, hitRadiusColor, currentStampPosition} = this;

    if (!host) host = this.getHost();

    trace.set({
        position: currentStampPosition,
    });

    trace.manageHistory(0, host);
    stampAction.call(this, artefact, trace, host);

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
    return Promise.resolve(true);
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
const makeTracer = function (items) {
    return new Tracer(items);
};

constructors.Tracer = Tracer;


// #### Exports
export {
    makeTracer,
};
