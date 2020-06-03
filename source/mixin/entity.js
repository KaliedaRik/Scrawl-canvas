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
import * as library from '../core/library.js';
import { λnull, generateUuid, isa_fn, mergeOver, pushUnique, xt, xta, addStrings } from '../core/utilities.js';
import { currentGroup, scrawlCanvasHold } from '../core/document.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from '../factory/filter.js';
import { importDomImage } from '../factory/imageAsset.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

// __method__ - String value which tells the entity _how_ it will display itself on the canvas. Available options are:
// + `draw` - stroke the entity outline with the entity's `strokeStyle` color, gradient or pattern - including shadow
// + `fill` - fill the entity with the entity's `fillStyle` color, gradient or pattern - including shadow
// + `drawAndFill` - stroke the entity's outline, remove shadow, then fill it
// + `fillAndDraw` - fill the entity's outline, remove shadow, then stroke it
// + `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
// + `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
// + `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
// + `none` - perform all the calculations required, but don't perform the final stamping
        method: 'fill',

// __pathObject__ - Scrawl-canvas holds details of every type of entity's outline in a `Path2D` object - used both for draw/fill operations, and for collision detection work
        pathObject: null,

// __winding__ - String with value `evenodd` or `nonzero` (default)
// + Canvas fill (flood) drawing operations can take into account an entity's winding choice. Two are available: the [non-zero rule](https://en.wikipedia.org/wiki/Nonzero-rule); and the [even-odd rule](https://en.wikipedia.org/wiki/Even%E2%80%93odd_rule)
        winding: 'nonzero',

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
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
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
// + CSS format color String - `#fff`, `#ffffff`, `rgb(255,255,255)`, `rgba(255,255,255,1)`, `white`, etc
// + COLORNAME String
//
// __font__, __textAlign__, __textBaseline__ - the Canvas API standards for using fonts on a canvas are near-useless, and often lead to a sub-par display of text. The Scrawl-canvas Phrase entity uses the following attributes internally, but has its own set of attributes for defining the font styling used by its text.

    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['state']);
    P.packetFunctions = pushUnique(P.packetFunctions, ['onEnter', 'onLeave', 'onDown', 'onUp']);

    P.processEntityPacketOut = function (key, value, includes) {

        return this.processFactoryPacketOut(key, value, includes);
    };

    P.processFactoryPacketOut = function (key, value, includes) {

        let result = true;

        if(includes.indexOf(key) < 0 && value === this.defs[key]) result = false;

        return result;
    };

    P.finalizePacketOut = function (copy, items) {

        let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
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
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;

// __group__ - returns the entity's latest Group's String name, not the Group object itself
    G.group = function () {

        return (this.group) ? this.group.name : '';
    };

// __lockStylesToEntity__ - a pseudo-attribute which will set the `lockFillStyleToEntity` and `lockStrokeStyleToEntity` flags to the same Boolean value
    S.lockStylesToEntity = function (item) {

        this.lockFillStyleToEntity = item;
        this.lockStrokeStyleToEntity = item;
    };

// __flipUpend__
    S.flipUpend = function (item) {

        if (item !== this.flipUpend && this.collides) this.dirtyCollision = true;
        this.flipUpend = item;
    };

// __flipReverse__
    S.flipReverse = function (item) {

        if (item !== this.flipReverse && this.collides) this.dirtyCollision = true;
        this.flipReverse = item;
    };

// Entity `get`, `set` and `deltaSet` functions need to take into account the entity State object, whose attributes can be retrieved/amended directly on the entity object
    P.get = function (item) {

        let getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            let def = this.defs[item],
                state = this.state,
                val;

            if (typeof def != 'undefined') {

                val = this[item];
                return (typeof val != 'undefined') ? val : def;
            }

            def = state.defs[item];

            if (typeof def != 'undefined') {

                val = state[item];
                return (typeof val != 'undefined') ? val : def;
            }
            return undef;
        }
    };

    P.set = function (items = {}) {

        if (items) {

            let setters = this.setters,
                defs = this.defs,
                state = this.state,
                stateSetters = (state) ? state.setters : {},
                stateDefs = (state) ? state.defs : {};

            Object.entries(items).forEach(([key, value]) => {

                if (key && key !== 'name' && value != null) {

                    let predefined = setters[key],
                        stateFlag = false;

                    if (!predefined) {

                        predefined = stateSetters[key];
                        stateFlag = true;
                    }

                    if (predefined) predefined.call(stateFlag ? this.state : this, value);
                    else if (typeof defs[key] !== 'undefined') this[key] = value;
                    else if (typeof stateDefs[key] !== 'undefined') state[key] = value;
                }
            }, this);
        }
        return this;
    };

    P.setDelta = function (items = {}) {

        if (items) {

            let setters = this.deltaSetters,
                defs = this.defs,
                state = this.state,
                stateSetters = (state) ? state.deltaSetters : {},
                stateDefs = (state) ? state.defs : {};

            Object.entries(items).forEach(([key, value]) => {

                if (key && key !== 'name' && value != null) {

                    let predefined = setters[key],
                        stateFlag = false;

                    if (!predefined) {

                        predefined = stateSetters[key];
                        stateFlag = true;
                    }

                    if (predefined) predefined.call(stateFlag ? this.state : this, value);
                    else if (typeof defs[key] !== 'undefined') this[key] = addStrings(this[key], value);
                    else if (typeof stateDefs[key] !== 'undefined') state[key] = addStrings(state[key], value);
                }
            }, this);
        }
        return this;
    };

// #### Prototype functions

// `entityInit` - internal function, called by all entity factory constructors
    P.entityInit = function (items = {}) {

        this.makeName(items.name);
        this.register();
        this.initializePositions();

        this.set(this.defs);

        this.state = makeState();

        if (!items.group) items.group = currentGroup;

        this.onEnter = λnull;
        this.onLeave = λnull;
        this.onDown = λnull;
        this.onUp = λnull;

        this.set(items);

        this.midInitActions(items);
    };

    P.midInitActions = λnull;


// #### Display cycle functionality
// Entitys - as artefacts - take part in the Display cycle at the `compile` stage, when Cell wrappers trigger a compile action cascade through their associated Group objects to entity objects included in those groups.
//
// The main entity compile-related functions are:
// + __prepareStamp__ - a synchronous function called at the start of the compile step where an entity will check its dirty flags and update position, dimensions and other attributes accordingly.
// + __stamp__ - a function that returns a Promise - this is where the main drawing activity happens. This function calls one of two other functions: __filteredStamp__; or __regularStamp__ (both returning Promises) which in turn rely on the __regularStampSynchronousActions__ function where all the drawing magic happens.
// 
// The stamp functionality can be triggered outside of the Display cycle, if required - for instance when compiling a Cell display setup as a static background layer, which excludes itself from the Display cycle cascade's `clear` and `compile` steps.
// + Invoking `entity.stamp` is an asynchronous call returning a Promise which needs to be handled accordingly - in particular for error management.
// + Alternatively, the __simpleStamp__ function will make the entity perform a synchronous action (no Promise returned); the function ignores any filter requirements set on the entity.

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

// Any change in an entity's __roll__ attribute means the entity will need to recalculate its collision sensors, as indicated by the entity setting its own `dirtyCollision` flag.
        if (this.dirtyRotation && this.collides) this.dirtyCollision = true;

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
        if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }

// Invoke the __cleanStampPositions__ and __cleanStampHandlePositions__ functions, if needed, to update current positional data prior to the stamping operation. Both functions will set the `dirtyPositionSubscribers` flag if changes to positional values result from the calculations.
        if (this.dirtyStampPositions) this.cleanStampPositions();
        if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

// If the entity's Path2D object has been marked as dirty by the `dirtyPathObject` flag, rebuild it by invoking the __cleanPathObject__ function - results in the entity setting its `dirtyCollision` flag.
        if (this.dirtyPathObject) {

            this.cleanPathObject();
            if (this.collides) this.dirtyCollision = true;
        }

// `dirtyPositionSubscribers` - update any artefacts subscribed to this entity as their `pivot` or `mimic` source, if required, by invoking the __updatePositionSubscribers__ function.
        if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

// The `dirtyCollision` flag is not checked or actioned here - it only needs to be dealt with when an entity is asked to perform a __checkHit__ calculation.

// The `dirtyFilters` flag is checked and handled by the __filteredStamp__ function.

// `dirtyAnchorHold` - if the entity has an Anchor object, and any updates have been made to its data, it needs to be rebuilt by invoking the __buildAnchor__ function.
        if (this.anchor && this.dirtyAnchorHold) {

            this.dirtyAnchorHold = false;
            this.buildAnchor(this.anchor);
        }
    };


// `cleanPathObject` - ___this function will be overwritten by every entity Factory___, to meet their individual requirements.
// + The function needs to build a Canvas API [Path2D](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) object and store it in the __pathObject__ attribute. The Path2D object is used for both entity stamping (see below) and entity collision detection work.
    P.cleanPathObject = λnull;

// ##### Step 2: invoke the entity's stamp action
// `stamp` - returns a Promise. This is the function invoked by Group objects as they cascade the Display cycle __compile__ step through to their member artefacts.
    P.stamp = function (force = false, host, changes) {

        let filterTest = (!this.noFilters && this.filters && this.filters.length) ? true : false;

        if (force) {

            if (host && host.type === 'Cell') this.currentHost = host;

            if (changes) {

                this.set(changes);
                this.prepareStamp();
            }

            if (filterTest) return this.filteredStamp();
            else return this.regularStamp();
        }

        if (this.visibility) {

            if (this.stashOutput || filterTest) return this.filteredStamp();
            else return this.regularStamp();
        }
        return Promise.resolve(false);
    };

// `regularStamp` - handles stamping functionality for all entitys that do not have any filter functions associated with them - returns a Promise.
    P.regularStamp = function () {

        let self = this;

        return new Promise((resolve, reject) => {

            if (self.currentHost) {

                self.regularStampSynchronousActions();
                resolve(true);
            }
            reject(false);
        });
    };

// `filteredStamp` - handles stamping functionality for all __entitys that have filter functions__ associated with them - returns a Promise.
// + Filters require the use of the [Filter web worker](../worker/filter.html) which returns its results asynchronously.
    P.filteredStamp = function(){

        // Clean and sort the Entity-level filters before sending them to the filter worker for application
        if (this.dirtyFilters || !this.currentFilters) this.cleanFilters();

        let self = this;

        return new Promise((resolve, reject) => {

            // An internal cleanup function to release resources and restore the non-filter defaults to what they were before. It's also in the cleanup phase that we (finally) copy over the results of the filter over to the current canvas display, taking into account the entity's composite and alpha values
            let cleanup = function () {

                if (worker) releaseFilterWorker(worker);

                currentEngine.save();
                
                currentEngine.globalCompositeOperation = self.filterComposite;
                currentEngine.globalAlpha = self.filterAlpha;
                currentEngine.setTransform(1, 0, 0, 1, 0, 0);

                currentEngine.drawImage(filterElement, 0, 0);
                
                // This is also the point at which we action any requests to stash the Cell output and (optionally) create/update imageAsset objects and associated &lt;img> elements for use elsewhere in the Scrawl-canvas ecosystem.
                if (self.stashOutput) {

                    self.stashOutput = false;

                    let [stashX, stashY, stashWidth, stashHeight] = self.getCellCoverage(filterEngine.getImageData(0, 0, filterElement.width, filterElement.height));

                    self.stashedImageData = filterEngine.getImageData(stashX, stashY, stashWidth, stashHeight);

                    if (self.stashOutputAsAsset) {

                        // KNOWN ISSUE - it takes time for the images to load the new dataURLs generated from canvas elements. See demo [Canvas-020](../../demo/canvas-020.html) for a workaround.
                        self.stashOutputAsAsset = false;

                        filterElement.width = stashWidth;
                        filterElement.height = stashHeight;
                        filterEngine.putImageData(self.stashedImageData, 0, 0);

                        if (!self.stashedImage) {

                            let newimg = self.stashedImage = document.createElement('img');

                            newimg.id = `${self.name}-image`;

                            newimg.onload = function () {

                                scrawlCanvasHold.appendChild(newimg);
                                importDomImage(`#${newimg.id}`);
                            };

                            newimg.src = filterElement.toDataURL();
                        }
                        else self.stashedImage.src = filterElement.toDataURL();
                    }
                }
        
                releaseCell(filterHost);

                currentEngine.restore();

                self.currentHost = currentHost;
                self.noCanvasEngineUpdates = oldNoCanvasEngineUpdates;
            };

            // Save current host data into a set of vars, ready for restoration after web worker completes or fails
            let currentHost = self.currentHost,
                currentElement = currentHost.element,
                currentEngine = currentHost.engine,
                currentDimensions = currentHost.currentDimensions;

            // Get and prepare a pool Cell for the filter operations
            let filterHost = requestCell(),
                filterElement = filterHost.element,
                filterEngine = filterHost.engine;

            self.currentHost = filterHost;
            
            let w = filterElement.width = currentDimensions[0] || currentElement.width,
                h = filterElement.height = currentDimensions[1] || currentElement.height;

            // Switch off fast stamp
            let oldNoCanvasEngineUpdates = self.noCanvasEngineUpdates;
            self.noCanvasEngineUpdates = false;

             // Stamp the entity onto the pool Cell
            self.regularStampSynchronousActions();

            let worker, myimage;

            if (!self.noFilters && self.filters && self.filters.length) {

                // If we're using the entity as a stencil, copy the entity cell's current display over the entity in the pool Cell
                if (self.isStencil) {

                    filterEngine.save();
                    filterEngine.globalCompositeOperation = 'source-in';
                    filterEngine.globalAlpha = 1;
                    filterEngine.setTransform(1, 0, 0, 1, 0, 0);
                    filterEngine.drawImage(currentElement, 0, 0);
                    filterEngine.restore();
                } 

                filterEngine.setTransform(1, 0, 0, 1, 0, 0);

                myimage = filterEngine.getImageData(0, 0, w, h);
                worker = requestFilterWorker();

                // Pass control over to the web worker
                actionFilterWorker(worker, {
                    image: myimage,
                    filters: self.currentFilters
                })
                .then(img => {

                    // Handle the web worker response
                    if (img) {

                        filterEngine.globalCompositeOperation = 'source-over';
                        filterEngine.globalAlpha = 1;
                        filterEngine.setTransform(1, 0, 0, 1, 0, 0);
                        filterEngine.putImageData(img, 0, 0);

                        cleanup();
                        resolve(true);
                    }
                    else throw new Error('image issue');
                })
                .catch((err) => {

                    cleanup();
                    reject(false);
                });
            }

            // Where no filter is required, but we still want to stash the results
            else {

                cleanup();
                resolve(true);
            }
        });
    };

// `getCellCoverage` - internal helper function - calculates the box start and dimensions values for the entity on its current Cell host, to help minimize work required when applying filters to the entity output. Also used when building an image when the `scrawl.createImageFromEntity` function is invoked.
    P.getCellCoverage = function (img) {

        let width = img.width,
            height = img.height,
            data = img.data,
            maxX = 0,
            maxY = 0,
            minX = width,
            minY = height,
            counter = 3,
            x, y;

        for (y = 0; y < height; y++) {

            for (x = 0; x < width; x++) {

                if (data[counter]) {

                    if (minX > x) minX = x;
                    if (maxX < x) maxX = x;
                    if (minY > y) minY = y;
                    if (maxY < y) maxY = y;
                }

                counter += 4;
            }
        }
        if (minX < maxX && minY < maxY) return [minX, minY, maxX - minX, maxY - minY];
        else return [0, 0, width, height];
    };

// `simpleStamp` - an alternative to the `stamp` function, to get an entity to stamp its output onto a Cell.
// + Note that this is a synchronous action, thus cannot be included in a Display cycle cascade.
// + Will ignore any filters assigned to the entity (because they require asynchronous Promises for the Filter web worker)
    P.simpleStamp = function (host, changes = {}) {

        if (host && host.type === 'Cell') {

            this.currentHost = host;
            
            this.set(changes);
            this.prepareStamp();

            this.regularStampSynchronousActions();
        }
    };

// ##### Stamping the entity onto a Cell wrapper &lt;canvas> element
// `regularStampSynchronousActions` - this function ___coordinates the actions required___ for an entity to display its output on a Cell wrapper's &lt;canvas> element.
//
// Scrawl-canvas stamps an entity onto a Cell by moving and rotating the Cell engine's `transformation` (its coordinate grid) to match the entity's __start__ and __offset__ coordinates, alongside any requirements to rotate (__roll__) and flip (__flipReverse__, __flipUpend__) the transformation as set out by the entity object.
// + We use the Web API CanvasRenderingContext2D engine's `setTransform` method to perform these actions when we invoke the Cell wrapper's __rotateDestination__ function.
// + ___We never invoke the engine's `translate`, `rotate` or `scale` methods___ on the transformation. All positional, rotational and scaling data is kept in the entity object, and calculated as part of its __prepareStamp__ step. This means we don't need to keep track of the transformation's current state, and makes the entity stamping operation more efficient.
// + Scrawl-canvas __does not support skew operations__ on the transformation - use a more appropriately shaped entity instead.
// + Scrawl-canvas __does not support non-isometric scaling__ (applying different scaling factors along the x and y axes) - most entitys include width and height attributes: use those instead.
// + We only use the transformation's `save` and `restore` methods where it makes sense to do so - for instance in very limited actions where the save and restore invocations are close enough in the code base that we don't lose sight of them (and remember to restore after the action completes). They are ___not___ used when updating the engine's attributes to match an entity's stamping requirements!
    P.regularStampSynchronousActions = function () {

        // Get a handle to the Cell wrapper - which needs to be assigned and checked prior to calling this function
        let dest = this.currentHost;

        if (dest) {

            let engine = dest.engine,
                stamp = this.currentStampPosition,
                x = stamp[0],
                y = stamp[1];

            // Get the Cell wrapper to perform required transformations on its &lt;canvas> element's 2D engine
            dest.rotateDestination(engine, x, y, this);

            // Get the Cell wrapper to update its 2D engine's attributes to match the entity's requirements
            if (!this.noCanvasEngineUpdates) dest.setEngine(this);

            // Invoke the appropriate __stamping method__ (below)
            this[this.method](engine);
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

// `drawAndFill` - stroke the entity's outline, remove shadow, then fill it
    P.drawAndFill = function (engine) {

        let p = this.pathObject;

        engine.stroke(p);
        this.currentHost.clearShadow();
        engine.fill(p, this.winding);
    };

// `fillAndDraw` - fill the entity's outline, remove shadow, then stroke it
    P.fillAndDraw = function (engine) {

        let p = this.pathObject;

        engine.stroke(p);
        this.currentHost.clearShadow();
        engine.fill(p, this.winding);
        engine.stroke(p);
    };

// `drawThenFill` - stroke the entity's outline, then fill it (shadow applied twice)
    P.drawThenFill = function (engine) {

        let p = this.pathObject;

        engine.stroke(p);
        engine.fill(p, this.winding);
    };

// `fillThenDraw` - fill the entity's outline, then stroke it (shadow applied twice)
    P.fillThenDraw = function (engine) {

        let p = this.pathObject;

        engine.fill(p, this.winding);
        engine.stroke(p);
    };

// `clear` - remove everything that would have been covered if the entity had performed fill (including shadow)
    P.clear = function (engine) {

        let gco = engine.globalCompositeOperation;

        engine.globalCompositeOperation = 'destination-out';
        engine.fill(this.pathObject, this.winding);
        
        engine.globalCompositeOperation = gco;
    };

// `none` - perform all the calculations required, but don't perform the final stamping
    P.none = function (engine) {}

// Return the prototype
    return P;
};
