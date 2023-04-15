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
import { artefact, constructors, group, tween } from '../core/library.js';

import { doCreate, isa_fn, isa_obj, mergeOver, pushUnique, xta, λnull, Ωempty } from '../core/utilities.js';

import { currentGroup } from './canvas.js';
import { makeParticle } from './particle.js';

import { releaseVector, requestVector } from './vector.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

import { _isArray, _piDouble, BLACK, ENTITY, T_TRACER } from '../core/shared-vars.js';


// #### Tracer constructor
const Tracer = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.initializePositions();
    this.set(this.defs);

    // The entity has a hit zone which can be used for drag-and-drop, and other user interactions. Thus the `onXYZ` UI functions remain relevant.
    this.onEnter = λnull;
    this.onLeave = λnull;
    this.onDown = λnull;
    this.onUp = λnull;

    // As part of its `stamp` functionality the Tracer entity will invoke the `stampAction` function. If not supplied, the entity will not display anything on the canvas.
    this.stampAction = λnull;

    // Tracer entitys use just one Particle, which gets initialized here and stored in the `trace` attribute
    this.trace = makeParticle(items);

    if (!items.group) items.group = currentGroup;

    this.set(items);

    if (this.purge) this.purgeArtefact(this.purge);

    return this;
};


// #### Tracer prototype
const P = Tracer.prototype = doCreate();
P.type = T_TRACER;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);


// #### Tracer attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, calculateOrder, stampOrder, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, filter___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
const defaultAttributes = {

    // Note that Tracer entitys, unlike Emitters or Nets, do not need or use World objects; they are not affected by Forces or springs. They are - effectively - entitys that record their location coordinate, with the ability to remember a history of its recent locations.
    //
    // __artefact__ - In theory, any Scrawl-canvas object whose `isArtefact` flag is set to `true` can be assigned to this attribute. However this has not been tested on non-entity artefacts. For now, stick to Scrawl-canvas entity objects.
    // + Can be set using the String name of an artefact object, or the artefact object itself.
    artefact: null,

    // __historyLength__ - positive integer Number - every Particle will keep a record of its recent state, in a set of ParticleHistory arrays stored in the Particle's `history` Array. The Emitter entity will set the maximum permitted length of the history array whenever it generates a new Particle. 
    historyLength: 1,

    // Note that the __hitRadius__ attribute is tied directly to the __width__ and __height__ attributes (which are effectively meaningless for this entity)
    // + This attribute is absolute - unlike other Scrawl-canvas radius attributes it cannot be set using a percentage String value
    hitRadius: 10,

    // We can tell the entity to display its hit zone by setting the `showHitRadius` flag. The hit zone outline color attribute `hitRadiusColor` accepts any valid CSS color String value
    showHitRadius: false,
    hitRadiusColor: BLACK,

    // ##### Not defined in the defs object, but set up in the constructor and setters
    
    // __trace__ - the entity's Particle object

    // __stampAction__ - define all major rendering actions in this function. The function receives the following arguments: `(artefact, trace, host)` - where `artefact` is the Tracer entity's artefact object (if any has been defined/set); `trace` is the entity's Particle object whose history needs to be rendered onto the canvas; and `host` is the Cell wrapper on which we will draw our graphics
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
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
P.factoryKill = function (killArtefact) {

    if (killArtefact) this.artefact.kill();
    this.trace.kill();
};


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

S.stampAction = function (item) {

    if (isa_fn(item)) this.stampAction = item;
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


// #### Prototype functions

// `regularStamp` - overwriters the functionality defined in the entity.js mixin
P.regularStamp = function () {

    const {artefact, trace, stampAction, showHitRadius, hitRadius, hitRadiusColor, currentStampPosition} = this;

    const host = this.currentHost;

    trace.set({
        position: currentStampPosition,
    });

    trace.manageHistory(0, host);
    stampAction.call(this, artefact, trace, host);

    if (showHitRadius) {

        const engine = host.engine;

        engine.save();
        engine.lineWidth = 1;
        engine.strokeStyle = hitRadiusColor;

        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.beginPath();
        engine.arc(currentStampPosition[0], currentStampPosition[1], hitRadius, 0, _piDouble);
        engine.stroke();

        engine.restore();
    }
};

// `checkHit` - overwrites the function defined in mixin/position.js
// + The Tracer entity's hit area is a circle centred on the entity's rotation/reflection (start) position or, where the entity's position is determined by reference (pivot, mimic, path, etc), the reference's current position.
// + Tracer entitys can be dragged and dropped around a canvas display like any other Scrawl-canvas artefact.
P.checkHit = function (items = [], mycell) {

    if (this.noUserInteraction) return false;

    const tests = (!_isArray(items)) ?  [items] : items;

    const currentStampPosition = this.currentStampPosition;

    let res = false,
        tx, ty;

    if (tests.some(test => {

        if (_isArray(test)) {

            tx = test[0];
            ty = test[1];
        }
        else if (xta(test, test.x, test.y)) {

            tx = test.x;
            ty = test.y;
        }
        else return false;

        if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;

        const v = requestVector(currentStampPosition).vectorSubtract(test);

        if (v.getMagnitude() < this.hitRadius) res = true;

        releaseVector(v);

        return res;

    }, this)) {

        const r = this.checkHitReturn(tx, ty, mycell);

        return r;
    }
    return false;
};


// #### Factory
// ```
// ```
export const makeTracer = function (items) {

    if (!items) return false;
    return new Tracer(items);
};

constructors.Tracer = Tracer;
