// # Tracer factory
// Description TODO

// Unit emitters create a particle and maintain it themselves
// Spray emitters request/release particles


// #### Demos:
// + [particles-011](../../demo/particles-011.html) - Tracer entity: basic functionality


// #### Imports
import { constructors, artefact, world, styles } from '../core/library.js';
import { pushUnique, mergeOver, λnull, isa_fn, isa_obj, xt, xta } from '../core/utilities.js';
import { currentGroup } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makeParticle } from './particle.js';
import { requestCell, releaseCell } from './cell.js';
import { makeVector, requestVector, releaseVector } from './vector.js';
import { makeColor } from './color.js';

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

    this.particle = makeParticle(items);

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

    particle: null,

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

    clone.particle = makeParticle({
        name: this.name,
        historyLength: items.historyLength || this.historyLength || 1,
    });

    return clone;
};


// #### Kill management
P.kill = function (killArtefact = false) {

    if (killArtefact) this.artefact.kill();

    this.particle.kill();

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

    let {artefact, particle, stampAction, showHitRadius, hitRadius, hitRadiusColor, currentStampPosition} = this;

    if (artefact) {

        if (!host) host = this.getHost();

        particle.set({
            position: currentStampPosition,
        });

        particle.manageHistory(0, host);
        stampAction.call(this, artefact, particle, host);

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
