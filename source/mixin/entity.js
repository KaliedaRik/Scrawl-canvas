 // # Entity mixin
// This mixin builds on the base and position mixins to give Canvas entity objects (Scrawl-canvas [Block](../factory/block.html), [Grid](../factory/grid.html), [Loom](../factory/loom.html), [Phrase](../factory/phrase.html), [Picture](../factory/picture.html), [Shape](../factory/shape.html), [Wheel](../factory/wheel.html)) the ability to act as __artefacts__.
//
// Entitys differ from non-entity artefacts in that they are restricted to Cell wrappers (though no harm should come if they are included in Stack-related Groups).
// + The entity object represents a set of instructions for rendering graphical lines and shapes onto a &lt;canvas> CanvasRenderingContext2D engine, using the Canvas API to do this
// + The engine requirements for the render - `fillStyle`, `font`, `globalAlpha`, `globalCompositeOperation`, `lineCap`, `lineDash`, `lineDashOffset`, `lineJoin`, `lineWidth`, `miterLimit`, `shadowBlur`, `shadowColor`, `shadowOffsetX`, `shadowOffsetY`, `strokeStyle`, `textAlign`, `textBaseline` - are kept in a separate [State object](../factory.state.html). Note that these attributes are initialized/updated directly on the entity object
// + Entitys can act as hotspots within a &lt;canvas> display; we can create hover and click effects for them
//
// Entitys are, nevertheless, full artefact objects which can interact with other artefacts and the mouse/touch cursor in all the normal ways: positioning (`pivot` and `path`) and dimensioning (`mimic`) functionality; collision detection (including __drag-and-drop__); etc


// #### Imports
import { addStrings, mergeOver, pushUnique, xt, λnull, Ωempty } from '../helper/utilities.js';

import { makeState } from '../factory/state.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { filterEngine } from '../helper/filter-engine.js';
import { importDomImage } from '../asset-management/image-asset.js';
import { currentGroup } from '../factory/canvas.js';

import positionMix from '../mixin/position.js';
import deltaMix from '../mixin/delta.js';
import pivotMix from '../mixin/pivot.js';
import mimicMix from '../mixin/mimic.js';
import pathMix from '../mixin/path.js';
import hiddenElementsMix from '../mixin/hiddenDomElements.js';
import anchorMix from '../mixin/anchor.js';
import buttonMix from '../mixin/button.js';
import filterMix from '../mixin/filter.js';

import { _floor, _keys, _parse, DESTINATION_OUT, FILL, GOOD_HOST, IMG, MOUSE, NAME, NONZERO, PARTICLE, SOURCE_IN, SOURCE_OVER, STATE_KEYS,  UNDEF, ZERO_STR } from '../helper/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Mixins
    positionMix(P);
    deltaMix(P);
    pivotMix(P);
    mimicMix(P);
    pathMix(P);
    hiddenElementsMix(P);
    anchorMix(P);
    buttonMix(P);
    filterMix(P);


// #### Shared attributes
    const defaultAttributes = {

// __method__ - String value which tells the entity _how_ it will display itself on the canvas. Available options are:
// + `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
// + `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
// + `drawAndFill` - stroke the entity's outline, remove shadow, then fill it
// + `fillAndDraw` - fill the entity's outline, remove shadow, then stroke it
// + `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
// + `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
// + `clip` - use shape to restrict future drawing area (best used in a separate group)
// + `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
// + `none` - perform all the calculations required, but don't perform the final stamping
        method: FILL,

// __pathObject__ - Scrawl-canvas holds details of every type of entity's outline in a `Path2D` object - used both for draw/fill operations, and for collision detection work
        pathObject: null,

// __winding__ - String with value `evenodd` or `nonzero` (default)
// + Canvas fill (flood) drawing operations can take into account an entity's winding choice. Two are available: the [non-zero rule](https://en.wikipedia.org/wiki/Nonzero-rule); and the [even-odd rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule)
        winding: NONZERO,

// __flipReverse__, __flipUpend__ - Boolean flags which determine the orientation of the entity when it stamps itself on the display.
// + a `reversed` entity is effectively flipped 180&deg; around a vertical line passing through that entity's rotation-reflection (start) point - a face looking to the right will now look to the left
// + an `upended` entity is effectively flipped 180&deg; around a horizontal line passing through that entity's rotation-reflection (start) point - a normal face will now appear upside-down
        flipReverse: false,
        flipUpend: false,

// __scaleOutline__ - Boolean flag. When set, the entity will increase its `lineWidth` proportionat to the entity's `scale` value - an entity of scale = 2 will display lines twice the thickness of the same entity at scale = 1
        scaleOutline: true,

// __lockFillStyleToEntity__, __lockStrokeStyleToEntity__ - Boolean flags.
// + When set, these flags instruct any gradient-type style (Scrawl-canvas Gradient, RadialGradient) to map their `start` and `end` coordinates to the entity's dimensions
// + Default action is for gradient-type styles to map their coordinates to the host Cell's dimensions
        lockFillStyleToEntity: false,
        lockStrokeStyleToEntity: false,

// ##### Event listener functions
// Entity objects have the ability to act as 'hotspots' within a canvas display, reacting to mouse/pointer movements over the canvas. Four mouse-like events are supported:
// + `enter` - triggers when the cursor passes over the entity's outline into its fillable area
// + `down` - triggers when a user presses their (left) mouse key while inside the entity's fillable area
// + `up` - triggers when a user releases their (left) mouse key while inside the entity's fillable area - this can also be used for capturing mouse click and touch tap actions
// + `leave` - triggers when the cursor passes over the entity's outline away from its fillable area
//
// The events are regular functions.
// + `this` refers to the entity object, giving the functions access to any attribute and method set on it.
// + They can also use variables defined elsewhere in the script code (though these will need to be rehydrated if the entity is packet stored and resurrected - see Demo [Canvas-009](../../demo/canvas-009.html) tests for an example of doing this)
//
// Scrawl-canvas will not automatically trigger these functions:
// + They can be triggered as part of an Animation object's function checking for hits on a Group of entitys
// + Similar checks can be included in a RenderAnimation hook function
// + Alternatively we can set up an event listener on the DOM &lt;canvas> element, which invokes a call to cascade a mouse/touch `move` event down to its associated entitys - in this case the entitys will check the event themselves and trigger the appropriate function
//
// The functions defined in these attributes will be included in entity `packet` functionality, and can be safely cloned

// __onEnter__ - define tasks to be performed for `enter` events
        onEnter: null,

// __onLeave__ - define tasks to be performed for `leave` events
        onLeave: null,

// __onDown__ - define tasks to be performed for `down` events
        onDown: null,

// __onUp__ - define tasks to be performed for `up` events
        onUp: null,

// ##### State object attributes
// We can treat the following attributes as if they are entity object attributes, though in fact they are stored and managed by __State objects__
//
// __fillStyle__ and __strokeStyle__ - color, gradient or pattern used to outline or fill a entity. Can be:
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255 255 255)`, `rgb(255 255 255 / 1)`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
// + COLORNAME String
// + GRADIENTNAME String
// + RADIALGRADIENTNAME String
// + PATTERNNAME String
//
// __globalAlpha__ - entity transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
//
// __globalCompositeOperation__ - compositing method for applying the entity to an existing Cell (&lt;canvas&gt;) display. Permitted values include
// + 'source-over'
// + 'source-atop'
// + 'source-in'
// + 'source-out'
// + 'destination-over'
// + 'destination-atop'
// + 'destination-in'
// + 'destination-out'
// + 'lighter'
// + 'darker'
// + 'copy'
// + 'xor'
// + any other permitted value - be aware that different browsers may render these operations in different ways, and some options are not supported by all browsers.
//
// __lineWidth__ - Number (in pixels)
//
// __lineCap__ - how the ends of lines will display. Permitted values include:
// + 'butt'
// + 'round'
// + 'square'
//
// __lineJoin__ - how line joints will display. Permitted values include:
// + 'miter'
// + 'round'
// + 'bevel'
//
// __lineDash__ - an array of integer Numbers representing line and gap values (in pixels), for example [5,2,2,2] for a long-short dash pattern
//
// __lineDashOffset__ - distance along the entity's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
//
// __miterLimit__ - affecting the 'pointiness' of the line join where two lines join at an acute angle
//
// __shadowOffsetX__, __shadowOffsetY__ - horizontal and vertical offsets for a entity's shadow, in Number pixels
//
// __shadowBlur__ - the blur width for a entity's shadow, in Number pixels
//
// __shadowColor__ - the color used for an entity's shadow effect. Can be:
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255 255 255)`, `rgb(255 255 255 / 1)`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
// + COLORNAME String
//
// __font__, __textAlign__, __textBaseline__ - the Canvas API standards for using fonts on a canvas are near-useless, and often lead to a sub-par display of text. The Scrawl-canvas Phrase entity uses the following attributes internally, but has its own set of attributes for defining the font styling used by its text.
//
// __filter__ - the Canvas 2D engine supports the [filter attribute](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) on an experimental basis, thus it is not guaranteed to work in all browsers and devices. The filter attribute takes a String value (default: 'none') defining one or more filter functions to be applied to the entity as it is stamped on the canvas.
// + Be aware that entitys can also take a `filters` Array - this represents an array of Scrawl-canvas filters to be applied to the entity (or group or Cell). The two filter systems are completely separate - combine their effects at your own risk!
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['state']);
    P.packetFunctions = pushUnique(P.packetFunctions, ['onEnter', 'onLeave', 'onDown', 'onUp']);

    P.processEntityPacketOut = function (key, value, incs) {

        return this.processFactoryPacketOut(key, value, incs);
    };

    P.processFactoryPacketOut = function (key, value, incs) {

        let result = true;

        if(!incs.indexOf(key) && value == this.defs[key]) result = false;

        return result;
    };

    P.finalizePacketOut = function (copy, items) {

        const stateCopy = _parse(this.state.saveAsPacket(items))[3];
        copy = mergeOver(copy, stateCopy);

        copy = this.handlePacketAnchor(copy, items);

        return copy;
    };


// #### Clone management
    P.postCloneAction = function(clone, items) {

        if (this.onEnter) clone.onEnter = this.onEnter;
        if (this.onLeave) clone.onLeave = this.onLeave;
        if (this.onDown) clone.onDown = this.onDown;
        if (this.onUp) clone.onUp = this.onUp;

        // Shared state
        if (items.sharedState) clone.state = this.state;

        // Cloned anchors
        if (items.anchor) {

            items.anchor.host = clone;

            if (!xt(items.anchor.focusAction)) items.anchor.focusAction = this.anchor.focusAction;
            if (!xt(items.anchor.blurAction)) items.anchor.blurAction = this.anchor.blurAction;

            clone.buildAnchor(items.anchor);

            if (!items.anchor.clickAction) clone.anchor.clickAction = this.anchor.clickAction;
        }
        return clone;
    };


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters;

// __group__ - returns the entity's latest Group's String name, not the Group object itself
    G.group = function () {

        return (this.group) ? this.group.name : ZERO_STR;
    };

// __lockStylesToEntity__ - a pseudo-attribute which will set the `lockFillStyleToEntity` and `lockStrokeStyleToEntity` flags to the same Boolean value
    S.lockStylesToEntity = function (item) {

        this.lockFillStyleToEntity = item;
        this.lockStrokeStyleToEntity = item;
    };

// Entity `get`, `set` and `deltaSet` functions need to take into account the entity State object, whose attributes can be retrieved/amended directly on the entity object
    P.get = function (item) {

        const getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            const state = this.state;
            let def = this.defs[item];
            let val;

            if (def != null) {

                val = this[item];
                return (typeof val != UNDEF) ? val : def;
            }

            def = state.defs[item];

            if (def != null) {

                val = state[item];
                return (typeof val != UNDEF) ? val : def;
            }
            return null;
        }
    };

    P.set = function (items = Ωempty) {

        const keys = _keys(items),
            len = keys.length;

        if (len) {

            const setters = this.setters,
                defs = this.defs,
                state = this.state;

            const stateSetters = (state) ? state.setters : Ωempty;
            const stateDefs = (state) ? state.defs : Ωempty;

            let fn, i, key, val;

            for (i = 0; i < len; i++) {

                key = keys[i];
                val = items[key];

                if (key && key != NAME && val != null) {

                    if (!STATE_KEYS.includes(key)) {

                        fn = setters[key];

                        if (fn) fn.call(this, val);
                        else if (typeof defs[key] != UNDEF) this[key] = val;
                    }
                    else {

                        fn = stateSetters[key];

                        if (fn) fn.call(state, val);
                        else if (typeof stateDefs[key] != UNDEF) state[key] = val;
                    }
                }
            }
        }
        return this;
    };

    P.setDelta = function (items = Ωempty) {

        const keys = _keys(items),
            len = keys.length;

        if (len) {

            const setters = this.deltaSetters,
                defs = this.defs,
                state = this.state;

            const stateSetters = (state) ? state.deltaSetters : Ωempty;
            const stateDefs = (state) ? state.defs : Ωempty;

            let fn, i, key, val;

            for (i = 0; i < len; i++) {

                key = keys[i];
                val = items[key];

                if (key && key != NAME && val != null) {

                    if (!STATE_KEYS.includes(key)) {

                        fn = setters[key];

                        if (fn) fn.call(this, val);
                        else if (typeof defs[key] != UNDEF) this[key] = addStrings(this[key], val);
                    }
                    else {

                        fn = stateSetters[key];

                        if (fn) fn.call(state, val);
                        else if (typeof stateDefs[key] != UNDEF) state[key] = addStrings(state[key], val);
                    }
                }
            }
        }
        return this;
    };


// #### Prototype functions

// `entityInit` - internal function, called by all entity factory constructors
    P.entityInit = function (items = Ωempty) {

        this.modifyConstructorInputForAnchorButton(items);

        this.makeName(items.name);
        this.register();
        this.initializePositions();

        this.state = makeState(Ωempty);

        this.set(this.defs);

        if (!items.group) items.group = currentGroup;

        this.onEnter = λnull;
        this.onLeave = λnull;
        this.onDown = λnull;
        this.onUp = λnull;

        this.set(items);

        this.midInitActions(items);

        if (this.purge) this.purgeArtefact(this.purge);
    };

    P.midInitActions = λnull;


// #### Display cycle functionality
// Entitys - as artefacts - take part in the Display cycle at the `compile` stage, when Cell wrappers trigger a compile action cascade through their associated Group objects to entity objects included in those groups.
//
// The main entity compile-related functions are:
// + __prepareStamp__ - a synchronous function called at the start of the compile step where an entity will check its dirty flags and update position, dimensions and other attributes accordingly.
// + __stamp__ - this is where the main drawing activity happens. This function calls one of two other functions: __filteredStamp__; or __regularStamp__ which in turn rely on the __regularStampSynchronousActions__ function where all the drawing magic happens.
//
// The stamp functionality can be triggered outside of the Display cycle, if required - for instance when compiling a Cell display setup as a static background layer, which excludes itself from the Display cycle cascade's `clear` and `compile` steps.

// ##### Step 1: prepare the entity for stamping
// `prepareStamp` - all entity objects need to check the following dirty flags and take corrective action when a flag is set.
// + The order in which flags get checked is important!
// + As part of the checking process, additional dirty flags may be set early in the function, for processing later on in the function.
//
// If an entity relies on another artefact as a `pivot`, `mimic` or `path` reference, those artefacts should be processed earlier in the compile cascade. This can be achieved by:
// + Placing the reference artefacts in a different Group, whose __order__ attribute has been set to a lower value than this entity's Group's order value
// + If both entity and reference artefact are in the same Group, give this entity an order value higher than its reference.
// + If both entity and the reference artefact are in the same Group, and have the same order value, then make sure that the reference artefact is defined in code before the entity.
//
// Note that some entity factories need to overwrite this function to meet their particular requirements. Many of the _clean functions_ mentioned below are defined in the [position mixin](./position.html).
    P.prepareStamp = function() {

// `dirtyHost` - set by a Cell wrapper on the entitys associated with it (via the Cell's associated Group objects) whenever the Cell's dimensions change. The entity sets its own `dirtyDimensions` flag as a result.
        if (this.dirtyHost) {

            this.dirtyHost = false;
            this.dirtyDimensions = true;
        }

// A number of updates (__scale__, __dimensions__, __start__, __offset__, __handle__) require the entity to recalculate its Path2D object - if any of them are set, then the entity sets its own `dirtyPathObject` flag as a result.
        if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

// `dirtyScale` - triggers __cleanScale__ function - which in turn sets the `dirtyDimensions`, `dirtyHandle` and (if required) `dirtyPositionSubscribers`, `dirtyMimicScale` flags on the entity.
        if (this.dirtyScale) this.cleanScale();

// `dirtyDimensions` - triggers __cleanDimensions__ function - which in turn sets the `dirtyStart`, `dirtyHandle`, `dirtyOffset` and (if required) `dirtyPositionSubscribers`, `dirtyMimicDimensions` flags on the entity.
        if (this.dirtyDimensions) this.cleanDimensions();

// `dirtyLock` - triggers __cleanLock__ function - which in turn sets the `dirtyStart` and `dirtyHandle` flags on the entity.
        if (this.dirtyLock) this.cleanLock();

// `dirtyStart` - triggers __cleanStart__ function - which in turn sets the `dirtyStampPositions` flag on the entity.
        if (this.dirtyStart) this.cleanStart();

// `dirtyOffset` - triggers __cleanOffset__ function - which in turn sets the `dirtyStampPositions` and (if required) `dirtyMimicOffset` flags on the entity.
        if (this.dirtyOffset) this.cleanOffset();

// `dirtyHandle` - triggers __cleanHandle__ function - which in turn sets the `dirtyStampHandlePositions` and (if required) `dirtyMimicHandle` flags on the entity.
        if (this.dirtyHandle) this.cleanHandle();

// `dirtyRotation` - triggers __cleanRotation__ function - which in turn sets (if required) `dirtyMimicRotation`, `dirtyPivotRotation`, `dirtyPositionSubscribers` flags on the entity.
        if (this.dirtyRotation) this.cleanRotation();

// To handle situations where the entity position is currently under the influence of the mouse/touch cursor - where true, entity will set its own `dirtyStampPositions`, `dirtyStampHandlePositions` flags
        if (this.isBeingDragged || this.lockTo.includes(MOUSE) || this.lockTo.includes(PARTICLE)) {

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }

// Invoke the __cleanStampPositions__ and __cleanStampHandlePositions__ functions, if needed, to update current positional data prior to the stamping operation. Both functions will set the `dirtyPositionSubscribers` flag if changes to positional values result from the calculations.
        if (this.dirtyStampPositions) this.cleanStampPositions();
        if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

// If the entity's Path2D object has been marked as dirty by the `dirtyPathObject` flag, rebuild it by invoking the __cleanPathObject__ function.
        if (this.dirtyPathObject) this.cleanPathObject();

// `dirtyPositionSubscribers` - update any artefacts subscribed to this entity as their `pivot` or `mimic` source, if required, by invoking the __updatePositionSubscribers__ function.
        if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

// `prepareStampTabsHelper` is defined in the `mixin/hiddenDomElements.js` file - handles updates to anchor and button objects
        this.prepareStampTabsHelper();
    };

// The `dirtyFilters` flag is checked and handled by the __filteredStamp__ function.

// `cleanPathObject` - ___this function will be overwritten by every entity Factory___, to meet their individual requirements.
// + The function needs to build a Canvas API [Path2D](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) object and store it in the __pathObject__ attribute. The Path2D object is used for both entity stamping (see below) and entity collision detection work.
    P.cleanPathObject = λnull;

// ##### Step 2: invoke the entity's stamp action
// `stamp` - this is the function invoked by Group objects as they cascade the Display cycle __compile__ step through to their member artefacts.
    P.stamp = function (force = false, host, changes) {

        const filterTest = (!this.noFilters && this.filters && this.filters.length) ? true : false;

        if (force) {

            if (host && GOOD_HOST.includes(host.type)) this.currentHost = host;

            if (changes) this.set(changes);

            this.prepareStamp();

            if (filterTest) return this.filteredStamp(filterTest);
            else return this.regularStamp();
        }

        if (this.visibility) {

            if (this.stashOutput || filterTest) return this.filteredStamp(filterTest);
            else return this.regularStamp();
        }
    };

// `regularStamp` - this function ___coordinates the actions required___ for an entity to display its output on a Cell wrapper's &lt;canvas> element.
//
// Scrawl-canvas stamps an entity onto a Cell by moving and rotating the Cell engine's `transformation` (its coordinate grid) to match the entity's __start__ and __offset__ coordinates, alongside any requirements to rotate (__roll__) and flip (__flipReverse__, __flipUpend__) the transformation as set out by the entity object.
// + We use the Web API CanvasRenderingContext2D engine's `setTransform` method to perform these actions when we invoke the Cell wrapper's __rotateDestination__ function.
// + ___We never invoke the engine's `translate`, `rotate` or `scale` methods___ on the transformation. All positional, rotational and scaling data is kept in the entity object, and calculated as part of its __prepareStamp__ step. This means we don't need to keep track of the transformation's current state, and makes the entity stamping operation more efficient.
// + Scrawl-canvas __does not support skew operations__ on the transformation - use a more appropriately shaped entity instead.
// + Scrawl-canvas __does not support non-isometric scaling__ (applying different scaling factors along the x and y axes) - most entitys include width and height attributes: use those instead.
// + We only use the transformation's `save` and `restore` methods where it makes sense to do so - for instance in very limited actions where the save and restore invocations are close enough in the code base that we don't lose sight of them (and remember to restore after the action completes). They are ___not___ used when updating the engine's attributes to match an entity's stamping requirements!
    P.regularStamp = function () {

        const dest = this.currentHost;

        if (dest) {

            const engine = dest.engine;
            const [x, y] = this.currentStampPosition;

            // Get the Cell wrapper to perform required transformations on its &lt;canvas> element's 2D engine
            dest.rotateDestination(engine, x, y, this);

            // Get the Cell wrapper to update its 2D engine's attributes to match the entity's requirements
            if (!this.noCanvasEngineUpdates) dest.setEngine(this);

            // Invoke the appropriate __stamping method__ (below)
            this[this.method](engine);
        }
    };

// `filteredStamp` - handles stamping functionality for all __entitys that have filter functions__ associated with them.
    P.filteredStamp = function(hasFilters = false) {

        const { dirtyFilters, currentHost, state } = this;

        // Clean and sort the Entity-level filters before sending them to the filter engine for application
        if (dirtyFilters || !this.currentFilters) this.cleanFilters();

        // Save current host data into a set of vars, ready for restoration after web engine completes or fails
        const {
            element: currEl,
            engine: currEng,
            currentDimensions: currDims,
        } = currentHost;

        // Get and prepare a pool Cell for the filter operations
        const filterHost = requestCell();

        const {
            element: filterEl,
            engine: filterEng,
        } = filterHost;

        this.currentHost = filterHost;

        const w = currDims ? currDims[0] : currEl.width,
            h = currDims ? currDims[1] : currEl.height;

        if (w && h) {

            filterHost.w = filterEl.width = w;
            filterHost.h = filterEl.height = h;

            // Switch off fast stamp
            const oldNoCanvasEngineUpdates = this.noCanvasEngineUpdates;
            this.noCanvasEngineUpdates = false;

            // Stamp the entity onto the pool Cell
            this.regularStamp();

            if (hasFilters) {

                const filters = this.currentFilters;

                // If we're using the entity as a stencil, copy the entity cell's current display over the entity in the pool Cell
                if (this.isStencil) {

                    filterEng.save();
                    filterEng.globalCompositeOperation = SOURCE_IN;
                    filterEng.globalAlpha = 1;
                    filterEng.setTransform(1, 0, 0, 1, 0, 0);
                    filterEng.drawImage(currEl, 0, 0);
                    filterEng.restore();

                    this.dirtyFilterIdentifier = true;
                }

                filterEng.setTransform(1, 0, 0, 1, 0, 0);

                const myimage = filterEng.getImageData(0, 0, w, h);

                this.preprocessFilters(filters);

                const img = filterEngine.action({
                    identifier: this.filterIdentifier,
                    image: myimage,
                    filters,
                });

                if (img) {

                    filterEng.globalCompositeOperation = SOURCE_OVER;
                    filterEng.globalAlpha = 1;
                    filterEng.setTransform(1, 0, 0, 1, 0, 0);
                    filterEng.putImageData(img, 0, 0);
                }
            }
            currEng.save();

            currEng.globalAlpha = (state && state.globalAlpha) ? state.globalAlpha : 1;
            currEng.globalCompositeOperation = (state && state.globalCompositeOperation) ? state.globalCompositeOperation : SOURCE_OVER;

            currEng.setTransform(1, 0, 0, 1, 0, 0);

            currEng.drawImage(filterEl, 0, 0);

            // This is also the point at which we action any requests to stash the Cell output and (optionally) create/update imageAsset objects and associated &lt;img> elements for use elsewhere in the Scrawl-canvas ecosystem.
            if (this.stashOutput) {

                this.stashOutput = false;

                const [stashX, stashY, stashWidth, stashHeight] = this.getCellCoverage(filterEng.getImageData(0, 0, filterEl.width, filterEl.height));

                this.stashedImageData = filterEng.getImageData(stashX, stashY, stashWidth, stashHeight);

                if (this.stashOutputAsAsset) {

                    const stashId = this.stashOutputAsAsset.substring ? this.stashOutputAsAsset : `${this.name}-image`;

                    // KNOWN ISSUE - it takes time for the images to load the new dataURLs generated from canvas elements. See demo [Canvas-020](../../demo/canvas-020.html) for a workaround.
                    this.stashOutputAsAsset = false;

                    filterEl.width = stashWidth;
                    filterEl.height = stashHeight;
                    filterEng.putImageData(this.stashedImageData, 0, 0);

                    if (!this.stashedImage) {

                        const control = this.group.currentHost.getController();

                        if (control) {

                            const that = this;

                            const newimg = document.createElement(IMG);
                            newimg.id = stashId;
                            newimg.alt = `A cached image of the ${this.name} ${this.type} entity`;

                            newimg.onload = function () {

                                control.canvasHold.appendChild(newimg);
                                that.stashedImage = newimg;
                                importDomImage(`#${stashId}`);
                            };

                            newimg.src = filterEl.toDataURL();
                        }
                    }
                    else this.stashedImage.src = filterEl.toDataURL();
                }
            }
            currEng.restore();

            this.currentHost = currentHost;
            this.noCanvasEngineUpdates = oldNoCanvasEngineUpdates;
        }
        releaseCell(filterHost);
    };

// `getCellCoverage` - internal helper function - calculates the box start and dimensions values for the entity on its current Cell host, to help minimize work required when applying filters to the entity output. Also used when building an image when the `scrawl.createImageFromEntity` function is invoked.
    P.getCellCoverage = function (img) {

        const { width, height, data } = img;

        let maxX = 0,
            maxY = 0,
            minX = width,
            minY = height,
            counter = 3,
            x, y, i, iz;

        for (i = 0, iz = width * height; i < iz; i++) {

            if (data[counter]) {

                y = _floor(i / width);
                x = i - (y * width);

                if (minX > x) minX = x;
                if (maxX < x) maxX = x;
                if (minY > y) minY = y;
                if (maxY < y) maxY = y;
            }
            counter += 4;
        }
        if (minX < maxX && minY < maxY) return [minX, minY, maxX - minX, maxY - minY];
        else return [0, 0, width, height];
    };

// `simpleStamp` - an alternative to the `stamp` function, to get an entity to stamp its output onto a Cell.
// + Note that this is a synchronous action, thus cannot be included in a Display cycle cascade.
// + Will ignore any filters assigned to the entity
    P.simpleStamp = function (host, changes) {

        if (host && GOOD_HOST.includes(host.type)) {

            this.currentHost = host;

            if (changes) this.set(changes);
            this.prepareStamp();

            this.regularStamp();
        }
    };


// ##### Stamp methods
// All actual drawing is achieved using the entity's pre-calculated [Path2D object](https://developer.mozilla.org/en-US/docs/Web/API/Path2D).

// `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
    P.draw = function (engine) {

        engine.stroke(this.pathObject);
    };

// `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
    P.fill = function (engine) {

        engine.fill(this.pathObject, this.winding);
    };

// `drawAndFill` - stamp the entity stroke, then fill, then remove shadow and repeat
    P.drawAndFill = function (engine) {

        const p = this.pathObject;

        engine.stroke(p);
        engine.fill(p, this.winding);
        this.currentHost.clearShadow();
        engine.stroke(p);
        engine.fill(p, this.winding);
    };

// `drawAndFill` - stamp the entity fill, then stroke, then remove shadow and repeat
    P.fillAndDraw = function (engine) {

        const p = this.pathObject;

        engine.fill(p, this.winding);
        engine.stroke(p);
        this.currentHost.clearShadow();
        engine.fill(p, this.winding);
        engine.stroke(p);
    };

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
    P.drawThenFill = function (engine) {

        const p = this.pathObject;

        engine.stroke(p);
        engine.fill(p, this.winding);
    };

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
    P.fillThenDraw = function (engine) {

        const p = this.pathObject;

        engine.fill(p, this.winding);
        engine.stroke(p);
    };

// `clip` - restrict drawing activities to the entity's enclosed area
    P.clip = function (engine) {

        engine.clip(this.pathObject, this.winding);
     };

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
    P.clear = function (engine) {

        const gco = engine.globalCompositeOperation;

        engine.globalCompositeOperation = DESTINATION_OUT;
        engine.fill(this.pathObject, this.winding);

        engine.globalCompositeOperation = gco;
    };

// `none` - perform all the calculations required, but don't perform the final stamping
    P.none = function () {}
}
