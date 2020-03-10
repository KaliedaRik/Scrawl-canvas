
// # Loom factory

// TODO - documentation

// #### To instantiate objects from the factory

// #### Library storage

// #### Clone functionality

// #### Kill functionality
import { constructors, artefact } from '../core/library.js';
import { currentGroup } from '../core/document.js';
import { mergeOver, mergeDiscard, pushUnique, defaultNonReturnFunction, defaultThisReturnFunction, xta } from '../core/utilities.js';

import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';

import baseMix from '../mixin/base.js';
import anchorMix from '../mixin/anchor.js';
import filterMix from '../mixin/filter.js';



// ## Loom constructor
const Loom = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    this.state = makeState();

    if (!items.group) items.group = currentGroup;

    this.onEnter = defaultNonReturnFunction;
    this.onLeave = defaultNonReturnFunction;
    this.onDown = defaultNonReturnFunction;
    this.onUp = defaultNonReturnFunction;

    this.delta = {};

    this.set(items);

    this.fromPathData = [];
    this.toPathData = [];

    this.watchFromPath = null;
    this.watchIndex = -1;
    this.engineInstructions = [];
    this.engineDeltaLengths = [];

    return this;
};



// ## Loom object prototype setup
let P = Loom.prototype = Object.create(Object.prototype);
P.type = 'Loom';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;



// Apply mixins to prototype object
P = baseMix(P);
P = anchorMix(P);
P = filterMix(P);



// ## Define default attributes
let defaultAttributes = {


// A Loom entity uses 2 Shape paths to construct a frame between which the image will be redrawn.

// The positioning, scaling etc of each strut is set in the constituent Shape entitys, not the Loom entity. 
    fromPath: null,
    toPath: null,


// The Loom entity can set the start and end cursors on each of its path struts, between which the image will be drawn. These can be animated to allow the image to 'flow' between one part of the display and another, changing its shape as it moves
    fromPathStart: 0,
    fromPathEnd: 1,

    toPathStart: 0,
    toPathEnd: 1,


// To make sure the 'from' and 'to' strut start points, and end points, have the same value set the Loom's __synchronizePathCursors__ attribute to true (default). Setting it to 'false' allows the cursors to be set independently on each strut ... which in turn may lead to unexpected display consequences
    synchronizePathCursors: true,


// For animation purposes, the image will move between the struts with the bottom of the page appearing again at the top of the Loom as it moves down (and vice versa). To change this functionality - so that the image slowly disappears as it animates up and down past the ends of the struts, set the __loopPathCursors__ attribute to false
    loopPathCursors: true,


// Copying the source image to the output happens, by default, by rows - which effectively means the struts are on the left-hand and right-hand edges of the image. 

// To change this to columns (which sets the struts to the top and bottom edges of the image) set the 'isHorizontalCopy' attribute to false 
    isHorizontalCopy: true,


// Mainly for library development/testing work - shows the loom entity's bounding box - which is calculated from the constituent Shape entitys' current bounding boxes
    showBoundingBox: false,
    boundingBoxColor: '#000000',


// The Picture entity source for this loom. For initialization and/or set, we can supply either the Picture entity itself, or its string name attribute

// The content image displayed by the Loom entity are set in the Picture entity, not the Loom, and can be any artefact supported by the Picture (image, video, sprite, or a Cell artefact)

// Note that any filters should be applied to the Picture entity; Loom entitys do not support filter functionality but will apply a Picture's filters to the source image as-and-where appropriate

// If the Picture entity is hosting a video or sprite asset, we need to update the input on every frame. It's easier to tell the Loom entity to do this using a flag, rather than get the Picture entity to update all its Loom subscribers on every display cycle. For Pictures using image assets the __sourceIsVideoOrSprite__ flag must be set to false (the default); setting the flag to true will significantly degrade display and animation performance
    source: null,
    sourceIsVideoOrSprite: false,

// The current Frame drawing process often leads to moire interference patterns appearing in the resulting image. Scrawl uses resizing to blur out these patterns. 

// The interferenceFactor attribute sets the resizing ratio; while he interferenceLoops attribute sets the number of times the image gets resized. 

// If patterns still appear in the final image, tweak these values to see if a better output can be achieved
    interferenceLoops: 2,
    interferenceFactor: 1.03,


// The Loom entity does not use the __position__ and __entity__ mixins (used by most other entitys) as its positioning is entirely dependent on the position, rotation, scale etc of its constituent Shape path entity struts. It does, however, require these attributes (alongside their setters and getters)
    visibility: true,
    order: 0,
    delta: null,
    host: null,
    group: null,
    anchor: null,
    collides: false,


// Canvas engine updates are required for the Loom's border - strokeStyle and line styling; if a Loom is to be drawn without a border, then setting the __noCanvasEngineUpdates__ attribute to true may help improve rendering efficiency
    noCanvasEngineUpdates: false,


// Loom entitys support delta animation - achieved by updating the fromPathStart, fromPathEnd, toPathStart and toPathEnd attributes by appropriate (and small!) values. If the Loom is not going to be animated by delta values, setting the __noDeltaUpdates__ attributes to true may help improve rendering efficiency
    noDeltaUpdates: false,


// Loom entitys support __collision detection__, reporting a hit when a test coordinate falls within the Loom's output image. As a result, Looms can also accept and act on the four __on__ functions
    onEnter: null,
    onLeave: null,
    onDown: null,
    onUp: null,


// To switch off collision detection for a Loom entity - which might help improve rendering efficiency - set the __noUserInteraction__ attribute to true
    noUserInteraction: false,


// Anchor objects can also be assigned to Loom entitys, meaning the following attributes are supported

// + anchorDescription
// + anchorType
// + anchorTarget
// + anchorRel
// + anchorReferrerPolicy
// + anchorPing
// + anchorHreflang
// + anchorHref
// + anchorDownload

// And the anchor attributes can also be supplied as a key:value object assigned to the __anchor__ attribute:

//     anchor: {
//         description
//         download
//         href
//         hreflang
//         ping
//         referrerpolicy
//         rel:
//         target:
//         anchorType
//         clickAction: 
//     }



// Note that Loom entitys DO NOT SUPPORT the sensor component of the Scrawl-canvas collisions system and will return an empty array when asked to supply sensor coordinates for testing against other artefacts.



// All normal Scrawl-canvas entity stamping methods are supported
    method: 'fill',


// Loom entitys support appropriate styling attributes, mainly for their stroke styles (used with the 'draw', 'drawAndFill', 'fillAndDraw', 'drawThenFill' and 'fillThenDraw' stamping methods)

// The following attributes are thus supported:

// + globalAlpha
// + globalCompositeOperation

// Alpha and Composite operations will be applied to both the Loom entity's border (the Shape entitys, with connecting lines between their paths' start and end points) and fill (the image displayed between the Loom's struts)

// + lineWidth
// + lineCap
// + lineJoin
// + lineDash
// + lineDashOffset
// + miterLimit

// All line attributes are supported

// + strokeStyle

// The Loom entity's strokeStyle can be any style supported by Scrawl-canvas - color strings, gradient objects, and pattern objects

// + shadowOffsetX
// + shadowOffsetY
// + shadowBlur
// + shadowColor

// The shadow attributes will only be applied to the stroke (border), not to the Loom's fill (image)
};
P.defs = mergeOver(P.defs, defaultAttributes);

// ## Define getter, setter and deltaSetter functions
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;


// Setters and getters copied over from the entity mixin
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


// Host, group and here functionality (copied from position mixin)
S.host = function (item) {

    if (item) {

        let host = artefact[item];

        if (host && host.here) this.host = host.name;
        else this.host = item;
    }
    else this.host = '';
};
P.getHost = function () {

    if (this.currentHost) return this.currentHost;
    else if (this.host) {

        let host = artefact[this.host];

        if (host) {

            this.currentHost = host;
            this.dirtyHost = true;
            return this.currentHost;
        }
    }
    return currentCorePosition;
};

G.group = function () {

    return (this.group) ? this.group.name : '';
};
S.group = function (item) {

    let g;

    if (item) {

        if (this.group && this.group.type === 'Group') this.group.removeArtefacts(this.name);

        if (item.substring) {

            g = group[item];

            if (g) this.group = g;
            else this.group = item;
        }
        else this.group = item;
    }

    if (this.group && this.group.type === 'Group') this.group.addArtefacts(this.name);
};

P.getHere = function () {

    return currentCorePosition;
};


// Delta functionality - copied over from position mixin
S.delta = function (items = {}) {

    if (items) this.delta = mergeDiscard(this.delta, items);
};
P.updateByDelta = function () {

    this.setDelta(this.delta);

    return this;
};

P.reverseByDelta = function () {

    let temp = {};
    
    Object.entries(this.delta).forEach(([key, val]) => {

        if (val.substring) val = -(parseFloat(val)) + '%';
        else val = -val;

        temp[key] = val;
    });

    this.setDelta(temp);

    return this;
};

P.setDeltaValues = function (items = {}) {

    let delta = this.delta, 
        oldVal, action;

    Object.entries(items).forEach(([key, requirement]) => {

        if (xt(delta[key])) {

            action = requirement;

            oldVal = delta[key];

            switch (action) {

                case 'reverse' :
                    if (oldVal.toFixed) delta[key] = -oldVal;
                    // TODO: reverse String% (and em, etc) values
                    break;

                case 'zero' :
                    if (oldVal.toFixed) delta[key] = 0;
                    // TODO: zero String% (and em, etc) values
                    break;

                case 'add' :
                    break;

                case 'subtract' :
                    break;

                case 'multiply' :
                    break;

                case 'divide' :
                    break;
            }
        }
    })
    return this;
};


// Invalidate mid-init functionality
P.midInitActions = defaultNonReturnFunction;


// Loom entities __CANNOT BE CLONED!__

// This is because Loom entitys are __compound entitys__ which bring together other entitys to make a new thing. Attempting to clone a Loom would also require decsions on whether to clone the underlying entitys

// (Note: I'm sure it could be done, but I'm not going to do it for Scrawl-canvas v8)
P.clone = defaultThisReturnFunction;


// Invalidating sensor functionality
P.cleanCollisionData = function () {

    return [0, []];
};
P.getSensors = function () {

    return [];
};


// TODO - documentation
S.fromPath = function (item) {

    if (item) {

        let oldPath = this.fromPath,
            newPath = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newPath && newPath.name && newPath.useAsPath) {

            if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);

            pushUnique(newPath.pathed, name);

            this.fromPath = newPath;

            this.dirtyStart = true;
        }
    }
};

S.toPath = function (item) {

    if (item) {

        let oldPath = this.toPath,
            newPath = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newPath && newPath.name && newPath.useAsPath) {

            if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);

            pushUnique(newPath.pathed, name);

            this.toPath = newPath;

            this.dirtyStart = true;
        }
    }
};

// TODO - documentation
S.source = function (item) {

    item = (item.substring) ? artefact[item] : item;

    if (item && item.type === 'Picture') {

        let src = this.source;

        if (src && src.type === 'Picture') src.imageUnsubscribe(this.name);

        this.source = item;
        item.imageSubscribe(this.name);
        this.dirtyInput = true;
    }
};

// TODO - documentation
S.isHorizontalCopy = function (item) {

    this.isHorizontalCopy = (item) ? true : false;
    this.dirtyPathData = true;
};

// TODO - documentation
S.synchronizePathCursors = function (item) {

    this.synchronizePathCursors = (item) ? true : false;

    if (item) {

        this.toPathStart = this.fromPathStart;
        this.toPathEnd = this.fromPathEnd;
    }

    this.dirtyPathData = true;
};

// TODO - documentation
S.loopPathCursors = function (item) {

    this.loopPathCursors = (item) ? true : false;

    if (item) {

        let c,
            floor = Math.floor;

        c = this.fromPathStart
        if (c < 0 || c > 1) this.fromPathStart = c - floor(c);

        c = this.fromPathEnd
        if (c < 0 || c > 1) this.fromPathEnd = c - floor(c);

        c = this.toPathStart
        if (c < 0 || c > 1) this.toPathStart = c - floor(c);

        c = this.toPathEnd
        if (c < 0 || c > 1) this.toPathEnd = c - floor(c);
    }

    this.dirtyOutput = true;
};

// TODO - documentation
S.fromPathStart = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
    this.fromPathStart = item;
    if (this.synchronizePathCursors) this.toPathStart = item;
    this.dirtyPathData = true;
};
S.fromPathEnd = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
    this.fromPathEnd = item;
    if (this.synchronizePathCursors) this.toPathEnd = item;
    this.dirtyPathData = true;
};
S.toPathStart = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
    this.toPathStart = item;
    if (this.synchronizePathCursors) this.fromPathStart = item;
    this.dirtyPathData = true;
};
S.toPathEnd = function (item) {

    if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
    this.toPathEnd = item;
    if (this.synchronizePathCursors) this.fromPathEnd = item;
    this.dirtyPathData = true;
};
D.fromPathStart = function (item) {

    let val = this.fromPathStart += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
    this.fromPathStart = val;
    if (this.synchronizePathCursors) this.toPathStart = val;
    this.dirtyPathData = true;
};
D.fromPathEnd = function (item) {

    let val = this.fromPathEnd += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
    this.fromPathEnd = val;
    if (this.synchronizePathCursors) this.toPathEnd = val;
    this.dirtyPathData = true;
};
D.toPathStart = function (item) {

    let val = this.toPathStart += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
    this.toPathStart = val;
    if (this.synchronizePathCursors) this.fromPathStart = val;
    this.dirtyPathData = true;
};
D.toPathEnd = function (item) {

    let val = this.toPathEnd += item;

    if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
    this.toPathEnd = val;
    if (this.synchronizePathCursors) this.fromPathEnd = val;
    this.dirtyPathData = true;
};


// This function is called before we get into the entity stamp promise cascade (thus it's a synchronous function). This is where we need to check whether we need to recalculate the path data which we'll use later to build the Loom entity's output image.

// We only need to recalculate the path data on the initial render, and afterwards when the __dirtyPathData__ flag has been set

// If we perform the recalculation, then we need to make sure to set the __dirtyOutput__ flag, which will trigger the output image build
P.prepareStamp = function() {

    let fPath = this.fromPath,
        tPath = this.toPath;

    // Sanity check 1
    // - getBoundingBox will recalculate and set the dirtyPathData flag 
    //   if paths have set the Loom's dirtyStart flag
    let [startX, startY, outputWidth, outputHeight] = this.getBoundingBox();

    // Sanity check 2
    // - we can set the dirtyPathData ourselves if paths start/end coordinates have changed
    //   in case Shape path roll/scale/flip/etc updates don't get messaged to the Loom entity
    if (!this.dirtyPathData) {

        let {x: testFromStartX, y: testFromStartY} = fPath.getPathPositionData(0);
        let {x: testFromEndX, y: testFromEndY} = fPath.getPathPositionData(1);
        let {x: testToStartX, y: testToStartY} = tPath.getPathPositionData(0);
        let {x: testToEndX, y: testToEndY} = tPath.getPathPositionData(1);

        let localPathTests = [testFromStartX, testFromStartY, testFromEndX, testFromEndY, testToStartX, testToStartY, testToEndX, testToEndY];

        if (!this.pathTests || this.pathTests.some((item, index) => item !== localPathTests[index])) {

            this.pathTests = localPathTests;
            this.dirtyPathData = true;
        }
    }

    if (this.dirtyPathData || !this.fromPathData.length) {

        this.dirtyPathData = false;

        this.watchIndex = -1;
        this.engineInstructions.length = 0;
        this.engineDeltaLengths.length = 0;

        let mCeil = Math.ceil,
            mMax = Math.max,
            mMin = Math.min,
            mFloor = Math.floor;

        let fromPathData = this.fromPathData;
        fromPathData.length = 0;

        let toPathData = this.toPathData;
        toPathData.length = 0;

        if(fPath && tPath) {

            let fPathLength = mCeil(fPath.length),
                tPathLength = mCeil(tPath.length),
                pathSteps, pathDelta, x, y;

            pathSteps = this.setSourceDimension(mMax(fPathLength, tPathLength));

            let fPathStart = this.fromPathStart,
                fPathEnd = this.fromPathEnd,
                tPathStart = this.toPathStart,
                tPathEnd = this.toPathEnd,
                fPartial, tPartial, fRatio, tRatio, minPartial;

            if (fPathStart < fPathEnd) fPartial = fPathEnd - fPathStart;
            else fPartial = fPathEnd + (1 - fPathStart);
            if (fPartial < 0.005) fPartial = 0.005;

            if (tPathStart < tPathEnd) tPartial = tPathEnd - tPathStart;
            else tPartial = tPathEnd + (1 - tPathStart);
            if (tPartial < 0.005) tPartial = 0.005;

            minPartial = mCeil(mMin(fPartial, tPartial));

            pathDelta = 1 / (pathSteps * (1 / minPartial));

            for (let cursor = 0; cursor <= 1; cursor += pathDelta) {

                ({x, y} = fPath.getPathPositionData(cursor));
                fromPathData.push([x - startX, y - startY]);

                ({x, y} = tPath.getPathPositionData(cursor));
                toPathData.push([x - startX, y - startY]);
            }

            this.fromPathSteps = fPartial / minPartial;
            this.toPathSteps = tPartial / minPartial;

            this.watchFromPath = (this.fromPathSteps === 1) ? true : false;

            this.dirtyOutput = true;
        }
        else this.dirtyPathData = true;
    }

    if (this.sourceIsVideoOrSprite) this.dirtyInput = true;
};

// TODO - documentation
P.setSourceDimension = function (val) {

    // prepareStamp does the dimension calculation itself, then supplies the new value
    // - we just need to update this.sourceDimension and set the dirtyInput flag
    if (val) {

        if (this.sourceDimension !== val) {

            this.sourceDimension = val;
            this.dirtyInput = true;
        }
    }

    // if other functions call setSourceDimension, they will do it without supplying a new value
    // - in which case we can calculate and update it here
    // - other functions do it as a sanity check 
    else {

        let fPath = this.fromPath,
            tPath = this.toPath;

        if(fPath && tPath) {

            let mCeil = Math.ceil,
                fPathLength = mCeil(fPath.length),
                tPathLength = mCeil(tPath.length);

            let steps = Math.max(fPathLength, tPathLength);

            if (this.sourceDimension !== steps) this.sourceDimension = steps;
        }
        else this.sourceDimension = 0;
    }
    return this.sourceDimension;
};


// Simple stamping is entirely synchronous

// TODO: we may have to disable this functionality for the Loom entity, if we use a web worker for either the prepareStamp calculations, or to build the output image itself
P.simpleStamp = function (host, changes = {}) {

    if (host && host.type === 'Cell') {

        this.currentHost = host;
        
        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }

        this.regularStampSynchronousActions();
    }
};


// All entity stamping - except for simple stamps - goes through the asynchronous __stamp__ function, which needs to return a promise which will resolve in due course

// While other entitys have to worry about applying filters as part of the stamping process, this is not an issue for Loom entitys because filters are defined on, and applied to, the source Picture entity, not the Loom itself

// Instead we check which dirty flags need actioning, and call a range of different functions to process the work. These flags are:

// + dirtyInput (the Picture entity has reported a change in its source, or copy attributes)
// + dirtyOutput (to render the cleaned input, or take account that the Loom paths' cursors have changed)
P.stamp = function (force = false, host, changes) {

    if (force) {

        if (host && host.type === 'Cell') this.currentHost = host;

        if (changes) {

            this.set(changes);
            this.prepareStamp();
        }
        return this.regularStamp();
    }

    if (this.visibility) {

        let self = this,
            dirtyInput = this.dirtyInput,
            dirtyOutput = this.dirtyOutput;

        if (dirtyInput) {

            return new Promise((resolve, reject) => {

                self.cleanInput()
                .then(res => {

                    self.sourceImageData = res;
                    return self.cleanOutput();
                })
                .then(res => {

                    self.output = res;
                    return self.regularStamp();
                })
                .then(res => {

                    resolve(true);
                })
                .catch(err => {
                    
                    reject(err);
                });
            })
        }
        else if (dirtyOutput) {

            return new Promise((resolve, reject) => {

                self.cleanOutput()
                .then(res => {

                    self.output = res;
                    return self.regularStamp();
                })
                .then(res => {

                    resolve(true);
                })
                .catch(err => {
                    
                    reject(err);
                });
            })
        }
        else return this.regularStamp();
    }
    else return Promise.resolve(false);
};

// TODO - documentation
P.cleanInput = function () {

    let self = this;

    return new Promise((resolve, reject) => {

        self.dirtyInput = false;

        self.setSourceDimension();

        let sourceDimension = self.sourceDimension;

        if (!sourceDimension) {

            self.dirtyInput = true;
            reject(new Error(`${self.name} - cleanInput Error: source has a zero dimension`));
        }

        let cell = requestCell(),
            engine = cell.engine,
            canvas = cell.element;

        canvas.width = sourceDimension;
        canvas.height = sourceDimension;
        engine.setTransform(1, 0, 0, 1, 0, 0);

        self.source.stamp(true, cell, {
            startX: 0,
            startY: 0,
            handleX: 0,
            handleY: 0,
            offsetX: 0,
            offsetY: 0,
            roll: 0,
            scale: 1,

            width: sourceDimension,
            height: sourceDimension,

            method: 'fill',
        })
        .then(res => {

            let sourceImageData = engine.getImageData(0, 0, sourceDimension, sourceDimension);

            releaseCell(cell);
            resolve(sourceImageData);
        })
        .catch(err => {

            releaseCell(cell);
            reject(err);
        });
    });
};

// TODO - documentation
P.cleanOutput = function () {
    
    let self = this;

    return new Promise((resolve, reject) => {

        self.dirtyOutput = false;

        self.setSourceDimension();
        
        let sourceDimension = self.sourceDimension, 
            sourceData = self.sourceImageData;

        if (sourceDimension && sourceData) {

            let mHypot = Math.hypot,
                mFloor = Math.floor,
                mCeil = Math.ceil,
                mAtan2 = Math.atan2,
                mCos = Math.cos,
                mSin = Math.sin;

            let fromPathData = self.fromPathData,
                toPathData = self.toPathData,

                dataLen = fromPathData.length,

                fPathStart = self.fromPathStart,
                fCursor = fPathStart * dataLen,
                fStep = self.fromPathSteps || 1,

                tPathStart = self.toPathStart,
                tCursor = tPathStart * dataLen,
                tStep = self.toPathSteps || 1,

                magicHorizontalPi = 0.5 * Math.PI,
                magicVerticalPi = magicHorizontalPi - 1.5708,

                isHorizontalCopy = self.isHorizontalCopy,
                loop = self.loopPathCursors,

                fx, fy, tx, ty, dx, dy, dLength, dAngle, cos, sin, 

                watchFromPath = self.watchFromPath,
                watchIndex = self.watchIndex, 
                engineInstructions = self.engineInstructions,
                engineDeltaLengths = self.engineDeltaLengths,
                instruction;

            let [startX, startY, outputWidth, outputHeight] = self.getBoundingBox();

            let inputCell = requestCell(),
                inputEngine = inputCell.engine,
                inputCanvas = inputCell.element;

            inputCanvas.width = sourceDimension;
            inputCanvas.height = sourceDimension;
            inputEngine.setTransform(1, 0, 0, 1, 0, 0);
            inputEngine.putImageData(sourceData, 0, 0);

            let outputCell = requestCell(),
                outputEngine = outputCell.engine,
                outputCanvas = outputCell.element;

            outputCanvas.width = outputWidth;
            outputCanvas.height = outputHeight;
            outputEngine.globalAlpha = self.state.globalAlpha;
            outputEngine.setTransform(1, 0, 0, 1, 0, 0);

            if(!engineInstructions.length) {

                for (let i = 0; i < sourceDimension; i++) {

                    if (watchIndex < 0) {

                        if (watchFromPath && fCursor < 1) watchIndex = i;
                        else if (!watchFromPath && tCursor < 1) watchIndex = i;
                    }

                    if (fCursor < dataLen && tCursor < dataLen && fCursor >= 0 && tCursor >= 0) {

                        [fx, fy] = fromPathData[mFloor(fCursor)];
                        [tx, ty] = toPathData[mFloor(tCursor)];

                        dx = tx - fx;
                        dy = ty - fy;

                        dLength = mHypot(dx, dy);

                        if (isHorizontalCopy) {

                            dAngle = -mAtan2(dx, dy) + magicHorizontalPi;
                            cos = mCos(dAngle);
                            sin = mSin(dAngle);

                            engineInstructions.push([cos, sin, -sin, cos, fx, fy]);
                            engineDeltaLengths.push(dLength);
                        }
                        else {

                            dAngle = -mAtan2(dx, dy) + magicVerticalPi;
                            cos = mCos(dAngle);
                            sin = mSin(dAngle);

                            engineInstructions.push([cos, sin, -sin, cos, fx, fy, dLength]);
                            engineDeltaLengths.push(dLength);
                        }
                    }
                    else {

                        engineInstructions.push(false);
                        engineDeltaLengths.push(false);
                    }

                    fCursor += fStep;
                    tCursor += tStep;

                    if (loop) {

                        if (fCursor >= dataLen) fCursor -= dataLen;
                        if (tCursor >= dataLen) tCursor -= dataLen;
                    }
                }
                if (watchIndex < 0) watchIndex = 0;
                self.watchIndex = watchIndex;
            }

            if (isHorizontalCopy) {


                for (let i = 0; i < sourceDimension; i++) {

                    instruction = engineInstructions[watchIndex];

                    if (instruction) {

                        outputEngine.setTransform(...instruction);
                        outputEngine.drawImage(inputCanvas, 0, watchIndex, sourceDimension, 1, 0, 0, engineDeltaLengths[watchIndex], 1);
                    }
                    watchIndex++;

                    if (watchIndex >= sourceDimension) watchIndex = 0;
                }
            }
            else {

                for (let i = 0; i < sourceDimension; i++) {

                    instruction = engineInstructions[watchIndex];

                    if (instruction) {

                        outputEngine.setTransform(...instruction);
                        outputEngine.drawImage(inputCanvas, watchIndex, 0, 1, sourceDimension, 0, 0, 1, engineDeltaLengths[watchIndex]);
                    }
                    watchIndex++;

                    if (watchIndex >= sourceDimension) watchIndex = 0;
                }
            }

            let iFactor = self.interferenceFactor,
                iLoops = self.interferenceLoops,

                iWidth = mCeil(outputWidth * iFactor),
                iHeight = mCeil(outputHeight * iFactor);

            inputCanvas.width = iWidth;
            inputCanvas.height = iHeight;

            outputEngine.setTransform(1, 0, 0, 1, 0, 0);
            inputEngine.setTransform(1, 0, 0, 1, 0, 0);

            for (let j = 0; j < iLoops; j++) {

                inputEngine.drawImage(outputCanvas, 0, 0, outputWidth, outputHeight, 0, 0, iWidth, iHeight);
                outputEngine.drawImage(inputCanvas, 0, 0, iWidth, iHeight, 0, 0, outputWidth, outputHeight);
            }

            let outputData = outputEngine.getImageData(0, 0, outputWidth, outputHeight);

            releaseCell(inputCell);
            releaseCell(outputCell);

            self.dirtyTargetImage = true;

            resolve(outputData);
        }
        else reject(new Error(`${this.name} - cleanOutput Error: source has a zero dimension, or no data`));
    });
};

// TODO - documentation
P.regularStamp = function () {

    let self = this;

    return new Promise((resolve, reject) => {

        if (self.currentHost) {

            self.regularStampSynchronousActions();
            resolve(true);
        }
        reject(new Error(`${self.name} has no current host`));
    });
};

P.regularStampSynchronousActions = function () {

    let dest = this.currentHost;

    if (dest) {

        let engine = dest.engine;

        if (!this.noCanvasEngineUpdates) dest.setEngine(this);

        this[this.method](engine);
    }
};


// Loom calculates its bounding box from the Shape path entitys associated with it

// This function recalculates when presented with a __dirtyStart__ flag - we rely on the Shape entitys to tell us when their paths have changed/updated

// Results get stashed in the __boundingBox__ attribute for easier access, but all the method functions call this function just in case the box needs recalculating.
P.getBoundingBox = function () {

    let fPath = this.fromPath,
        tPath = this.toPath;

    if(fPath && tPath) {

        if (this.dirtyStart) {

            if (fPath.getBoundingBox && tPath.getBoundingBox) {

                this.dirtyStart = false;

                let [lsx, lsy, sw, sh, sx, sy] = fPath.getBoundingBox();
                let [lex, ley, ew, eh, ex, ey] = tPath.getBoundingBox();

                lsx += sx;
                lsy += sy;
                lex += ex;
                ley += ey;

                let minX = Math.min(lsx, lex);
                let maxX = Math.max(lsx + sw, lex + ew);
                let minY = Math.min(lsy, ley);
                let maxY = Math.max(lsy + sh, ley + eh);

                this.boundingBox = [minX, minY, maxX - minX, maxY - minY];

                this.dirtyPathData = true;
            }
            else this.boundingBox = [0, 0, 0, 0];
        }
    }
    else this.boundingBox = [0, 0, 0, 0];

    return this.boundingBox;
};


// These 'method' functions stamp the Loom entity onto the canvas context supplied to them in the __engine__ argument
P.fill = function (engine) {


    this.doFill(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);

};

P.draw = function (engine) {

    this.doStroke(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.drawAndFill = function (engine) {

    this.doStroke(engine);
    this.currentHost.clearShadow();
    this.doFill(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.fillAndDraw = function (engine) {

    this.doFill(engine);
    this.currentHost.clearShadow();
    this.doStroke(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.drawThenFill = function (engine) {

    this.doStroke(engine);
    this.doFill(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.fillThenDraw = function (engine) {

    this.doFill(engine);
    this.doStroke(engine);

    if (this.showBoundingBox) this.drawBoundingBox(engine);
};


P.clear = function (engine) {

    let output = this.output,
        canvas = (this.currentHost) ? this.currentHost.element : false,
        gco = engine.globalCompositeOperation;

    if (output && canvas) {

        let tempCell = requestCell(),
            tempEngine = tempCell.engine,
            tempCanvas = tempCell.element;

        let [x, y, w, h] = this.getBoundingBox();

        tempCanvas.width = w;
        tempCanvas.height = h;

        tempEngine.putImageData(output, 0, 0);
        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.globalCompositeOperation = 'destination-out';
        engine.drawImage(tempCanvas, 0, 0, w, h, x, y, w, h);
        engine.globalCompositeOperation = gco;

        releaseCell(tempCell);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    }
};


P.none = defaultNonReturnFunction;


// The stroke and fill functions handle most of the stuff that the 'method' functions require to stamp the Loom entity onto a canvas cell
P.doStroke = function (engine) {

    let fPath = this.fromPath,
        tPath = this.toPath;

    if(fPath && fPath.getBoundingBox && tPath && tPath.getBoundingBox) {

        let host = this.currentHost;

        if (host) {

            let fStart = fPath.currentStampPosition,
                fEnd = fPath.currentEnd,
                tStart = tPath.currentStampPosition,
                tEnd = tPath.currentEnd;

            host.rotateDestination(engine, fStart[0], fStart[1], fPath);
            engine.stroke(fPath.pathObject);

            host.rotateDestination(engine, tStart[0], tStart[1], fPath);
            engine.stroke(tPath.pathObject);

            engine.setTransform(1,0, 0, 1, 0, 0);
            engine.beginPath()
            engine.moveTo(...fEnd);
            engine.lineTo(...tEnd);
            engine.moveTo(...tStart);
            engine.lineTo(...fStart);
            engine.closePath();
            engine.stroke();
        }
    }
};


// putImageData turns transparent pixels in the output, transparent in the host canvas - which is not what we want

// Problem solved by putting output into a pool cell, then drawing it from there to the host cell
P.doFill = function (engine) {

    let output = this.output,
        canvas = (this.currentHost) ? this.currentHost.element : false;

    if (output && canvas) {

        let tempCell = requestCell(),
            tempEngine = tempCell.engine,
            tempCanvas = tempCell.element;

        let [x, y, w, h] = this.getBoundingBox();

        tempCanvas.width = w;
        tempCanvas.height = h;

        tempEngine.putImageData(output, 0, 0);
        engine.setTransform(1, 0, 0, 1, 0, 0);
        engine.drawImage(tempCanvas, 0, 0, w, h, x, y, w, h);

        releaseCell(tempCell);
    }
};


// Usually only need to draw the bounding box during development work, to make sure the getBoundingBox calculation is operating correctly
P.drawBoundingBox = function (engine) {

    if (this.dirtyStart) this.getBoundingBox();

    engine.save();

    let t = engine.getTransform();
    engine.setTransform(1, 0, 0, 1, 0, 0);

    engine.strokeStyle = this.boundingBoxColor;
    engine.lineWidth = 1;
    engine.globalCompositeOperation = 'source-over';
    engine.globalAlpha = 1;
    engine.shadowOffsetX = 0;
    engine.shadowOffsetY = 0;
    engine.shadowBlur = 0;

    engine.strokeRect(...this.boundingBox);

    engine.restore();
    engine.setTransform(t);
};


// The __checkHit__ functionality can be used in the same way it is for other entitys (and groups)

// One difference is that this function checks hits against an ImageData object, thus doesn't need to be supplied with a pool canvas so that it can do its job

// Note: will check for the __dirtyTargetImage__ flag, which normally gets checked as part of the rendering cycle
P.checkHit = function (items = []) {

    if (this.noUserInteraction) return false;

    let tests = (!Array.isArray(items)) ?  [items] : items,
        targetData = (this.output && this.output.data) ? this.output.data : false, 
        tx, ty, cx, cy, index;

    if (targetData) {

        let [x, y, w, h] = this.getBoundingBox();

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

            cx = tx - x;
            cy = ty - y;

            if (cx < 0 || cx > w || cy < 0 || cy > h) return false; 

            index = (((cy * w) + cx) * 4) + 3;

            if (targetData) return (targetData[index] > 0) ? true : false;
            else return false;

        }, this)) {

            return {
                x: tx,
                y: ty,
                artefact: this
            };
        }
    }
    return false;
};



// ## Exported factory function
const makeLoom = function (items) {
    return new Loom(items);
};

constructors.Loom = Loom;

export {
    makeLoom,
};
