
// # Position mixin

// TODO - document the purpose of the mixin
import { artefact, group } from '../core/library.js';
import { defaultNonReturnFunction, mergeOver, mergeInto, mergeDiscard, 
    isa_obj, isa_number, xt, xta, xto, xtGet, 
    addStrings, pushUnique, removeItem } from '../core/utilities.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makeCoordinate, checkCoordinate } from '../factory/coordinate.js';
import { requestCell, releaseCell } from '../factory/cell.js';

export default function (P = {}) {


// ## Define attributes

// All factories using the position mixin will add these to their prototype objects
    let defaultAttributes = {


// Every Scrawl-canvas artefact should belong to at least one group, and can belong to more than one group. Groups can be used for a variety of purposes, and play a major role in the __display cycle__ and in __collision detection__.

// Most group-related functionality takes place elsewhere. An artefact's __group__ attribute is used mainly as a 'convenience handle', to make moving an artefact from one group to another a bit easier.

// As part of an artefact's initialization, the code will assign the artefact to a group. We can indicate which group to assign the new artefact to by setting the argument attribute to the group's name attribute String, or to the group itself - the set code will automatically update this attribute to a reference to the Group object.

//     let myGroup = scrawl.buildGroup({
//         name: 'my-first-group',
//     });

//     let myBlock = scrawl.makeBlock({
//         group: myGroup,
//     });

// Similarly the __set__ function's object argument can accept a name String, or the new group's object itself

//     myBlock.set({
//         group: 'my-first-group',
//     });

// If no group value is supplied when building a new __entity__, then the 'current group' will be assigned as the entity's group. This is a Scrawl-canvas 'global' value which will update whenever the user sets a canvas artefact as the current canvas:

//     scrawl.setCurrentCanvas('my-other-canvas');

// For some Canvas and Stack artefacts, the value of their group attribute will be set to "root" - this indicates that the stack or canvas is not contained within another stack.

// TODO: we need to decide whether we want a user-available scrawl.setCurrentStack function and, if yes, how that will impact on the core/document.js __currentGroup__ variable exported by that module - given that we will then have both currentStack and currentCanvas variables, but only one currentGroup variable shared between them.
        group: null,


// The __visibility__ attribute is a boolean flag (default: true); when the flag is set, the display cycle functionality will run on the artefact.

// If the attribute's value is false, then the display cycle functionality will ignore the artefact. This has the following effects:

// + for DOM-based artefacts, the dom element will have its CSS tweaked to hide the element ("display: block" switches to "display: none")

// + for canvas-based entitys, the entity will be ignored during the display cycle's 'compile' step's action cascade
        visibility: true,


// The __order__ attribute - an integer Number (default: 0) - determines the order in which an artefact will be processed as part of a group. 

// For instance, entity artefacts with higher order values will be processed after those with lower values, with the effect that the entity will be displayed on top of those other entitys (and stamping over them if they overlap)

// Note that Group objects also have an order attribute: all artefacts in a group with a lower order value will be processed before those with a higher order value.

// Cell assets also have an order attribute, which has a similar effect: groups in cells with a lower order value are processed earlier than those in cells with higher order values.

// Finally, animation objects have order values; the same effect applies.

// __If the display of an artefact does not appear to be following the order value it has been given__, the problem may lie in either the order values assigned to that artefact's group, or host (cell, canvas, stack), or even the animation object that contributes to the display cycle.
        order: 0,


// The start coordinate represents an artefact's __rotation-reflexion point__, and is held in an [x, y] coordinate array. The default values are [0, 0].

// During the display cycle the start coordinate will be calculated with the results placed in a currentStart coordinate array; this calculation will only happen when an artefact's __dirtyStart__ flag has been set.

// Start coordinates can be __absolute__ (represented by a Number), or __relative__ (represented by a String):

// + Absolute values are measured in pixels from the artefact's host's top left corner, with positive values moving to the right (x) or downwards (y) from that point. Values can be negative, and can be float values.

// + Relative values represent a percentage (eg: '42%') of the artefact's current dimensions - width for the x value, height for the y value. Again, values can be negative ('-12%') and can represent float values ('33.333%'). The following string aliases can also be used: 'top' or 'left' (both '0%'); 'bottom' or 'right' (both '100%'); and 'center' ('50%');

// Start coordinates can be set as part of an artefact's factory function, and updated using both that artefact's __set__ and __setDelta__ functions. The values can be presented as either an [x, y] Array, or an {x:value, y:value} Object, or using the pseudo-attributes __startX__ and __startY__

// NEVER set the start coordinate array directly, as those changes will not be picked up by the code! Directly setting startX or startY will also fail as those pseudo-attributes are not retained by the artefact.

//     let myBlock = scrawl.makeBlock({
//         startX: 20,
//         startY: 'center',
//     });

//     myBlock.set({
//         start: [-100, '-12%'],
//     });

//     myBlock.set({
//         start: {
//             x: 'left',
//             y: 388.5,
//         },
//     });

//     // Don't use string labels ('top', 'left', etc) when delta setting
//     myBlock.setDelta({
//         startX: '-0.05%'
//     });

//     myBlock.setDelta({
//         start: [1, '0.5%'],
//     });

// The start attribute can also be included in an artefact's __delta__ object. These values will be added to the start coordinate (and recalculated into the currentStart coordinate) on every iteration of the display cycle:

//     let myBlock = scrawl.makeBlock({
//         start: ['left', 500],
//         delta: {
//             startX: 0.5,
//             startY: '-0.3',
//         },
//     });
        start: null,


// The handle coordinate represents an offset from the artefact's __rotation-reflexion__ point, and is held in an [x, y] coordinate array. The default values are [0, 0].

// During the display cycle the handle coordinate will be calculated with the results placed in a currentHandle coordinate array; this calculation will only happen when an artefact's __dirtyHandle__ flag has been set.

// Unlike the start attribute, __relative__ handle values ('20%', 'bottom') use the attribute's own dimensions to calculate their values. Setting the handle attribute to ['center', 'center'] will have the apparent effect of moving the artefact's display so that it's rotation-reflection point appears to be centered.

// Handle offsets are applied to the artefact after rotation; animating a handle value will move the artefact along its local x/y axes, not the host's axes!

// Everything that applies to the start attribute also applies to the handle attribute, except:
// + We can set/update the attribute using the __handleX__ and __handleY__ pseudo-attributes.
// + Handle values DO take an artefact's __scale__ attribute into account when calculating current values.
        handle: null,


// The offset coordinate represents an offset from the artefact's __rotation-reflexion__ point, and is held in an [x, y] coordinate array. The default values are [0, 0]. Offsets, unlike handles, shift the artefact along the horizontal (x) and vertical (y), ignoring the artefact's rotation.

// During the display cycle the offset coordinate will be calculated with the results placed in a currentOffset coordinate array; this calculation will only happen when an artefact's __dirtyOffset__ flag has been set.

// Everything that applies to the start attribute also applies to the offset attribute, except:
// + We can set/update the attribute using the __offsetX__ and __offsetY__ pseudo-attributes.
// + Offset values DO NOT take an artefact's __scale__ attribute into account when calculating current values.
// + Using label strings ('top', 'center', etc) may have unexpected consequences - stick to Number or String% values instead.
        offset: null,


// TODO - documentation
        dimensions: null,

// TODO - documentation
        delta: null,

// TODO - documentation
        pivot: '',

// DOM elements will use this to return either start or one of their corners
        pivotCorner: '',         
        pivoted: null,

        addPivotHandle: false,
        addPivotOffset: true,
        addPivotRotation: false,

// TODO - documentation
        path: '',

        pathPosition: 0,

        addPathHandle: false,
        addPathOffset: true,
        addPathRotation: false,

// TODO: do these need to be in the defs object?
        controlSubscriber: null,
        startControlSubscriber: null,
        endControlSubscriber: null,
        endSubscriber: null,

// TODO - documentation
        mimic: '',
        mimicked: null,

        useMimicDimensions: false,
        useMimicScale: false,
        useMimicStart: false,
        useMimicHandle: false,
        useMimicOffset: false,
        useMimicRotation: false,
        useMimicFlip: false,

        addOwnDimensionsToMimic: false,
        addOwnScaleToMimic: false,
        addOwnStartToMimic: false,
        addOwnHandleToMimic: false,
        addOwnOffsetToMimic: false,
        addOwnRotationToMimic: false,


// The __lockTo__ attribute is an [x-lock, y-lock] Array which determines where the artefact will look for its x and y start coordinates.

// Scrawl-canvas allows an artefact to use different sources - 'start' (the default), 'pivot', 'path', 'mimic', or 'mouse'

// Note: __setting an artefact's pivot, path or mimic attribute to another artefact__ is not enough to make the artefact start using that pivot as its source for positioning data. __The lockTo attribute must also be set!__ 

// This approach allows an artefact to keep references to up to three different artifacts (in the pivot, path and mimic attributes), dynamically swapping between them as and when required. It also allows the x coordinate to be calculated separately from the y coordinate, using a different source.

// The __mouse__ value will make the artefact use the current host's 'here' coordinates. Stack, element and canvas artefacts will include mouse coordinates localized to their top-left corner as part of there 'here' attribute, thus allowing any artefact locked to the mouse to update its start position every time the mouse (or touch) cursor moves.

// The lock values can be set as part of an artefact's factory function, and updated using that artefact's __set__ function. The values can be presented as either an [x, y] Array, or using the pseudo-attributes __lockXTo__ and __lockYTo__.
        lockTo: null,


// All artefacts (except compound entities such as Loom) can be scaled by setting their __scale__ attribute to an appropriate integer or float Number value.

// + a value of __0__ effectively makes the artefact disappear from the display (though setting the artefact's __visibility__ flag to false is a more efficient approach)
// + scale value __less than 1__ will shrink the artefact around its rotation-reflection point
// + setting the value to _1_ (the default) removes all scaling effects on the artefact
// + values __greater than 1__ will expand the artefact around its rotation-reflection point
        scale: 1,

// TODO - documentation
        roll: 0,

// TODO - documentation
        collides: false,
        sensorSpacing: 50,


// #### Animation speed

// Scrawl-canvas assumes that an artefact will be "ready for anything". However if we know beforehand that an artefact will not be requiring certain functionalities, we can switch them off; this will help make the artefact render more quickly. These __noXXX__ flags include:

// + __noUserInteraction__ - switch off basic collision functionality (used by 'drag-and-drop') and ongoing update calculations

// + __noDeltaUpdates__ - switch off the automatic application of delta attribute values as part of each iteration of the Display cycle

// + __noPositionDependencies__ - short-circuit the position calculations associated with pivot, mimic, path and mouse positioning

// + __noCanvasEngineUpdates__ - specifically for canvas entity artefacts, skip updating the CanvasRenderingContext2D with the entity's styling attributes - meaning that the entity will use the previously rendered entity's styling

// + __noFilters__ - skip the checks for, and application of, filters to the entity artefact - even if filters have been added to the entity

// + __noPathUpdates__ - only calculate the artefact's path once - this disables updates to the artefact's handle and scale attributes 
        noUserInteraction: false,
        noDeltaUpdates: false,
        noPositionDependencies: false,
        noCanvasEngineUpdates: false,
        noFilters: false,
        noPathUpdates: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);



// ## Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['pathObject', 'mimicked', 'pivoted']);
    P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)', 'Subscriber$']);
    P.packetCoordinates = pushUnique(P.packetCoordinates, ['start', 'handle', 'offset']);
    P.packetObjects = pushUnique(P.packetObjects, ['group', 'pivot', 'path', 'mimic']);
    P.packetFunctions = pushUnique(P.packetFunctions, []);

    P.processPacketOut = function (key, value, includes) {

        let result = true;

        switch (key) {

            case 'lockTo' :

                if (value[0] === 'start' && value[1] === 'start') {

                    result = (includes.indexOf('lockTo') >= 0) ? true : false;
                }
                break;

            default :

                if (this.lib === 'entity') result = this.processEntityPacketOut(key, value, includes);
                else if (this.isArtefact) result = this.processDOMPacketOut(key, value, includes);
        }

        return result;
    };

    P.handlePacketAnchor = function (copy, items) {

        if (this.anchor) {

            let a = JSON.parse(this.anchor.saveAsPacket(items))[3];
            copy.anchor = a;
        }
        return copy;
    }



// ## Define getter, setter and deltaSetter functions
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;


// These getter functions return the __current, pixel-based values__ for the pseudo-attributes associated with the 'start', 'handle', 'offset' and 'dimensions' attribute Arrays. These values will be different from those returned from the real attributes:

//     // for a block entity in a 100px x 100px canvas

//     let myBlock = scrawl.makeBlock({
//         startX: '10%',
//         startY: 'center',
//         width: '40%',
//         height: 20,
//     });

//     myBlock.get('startX');          // 10
//     myBlock.get('startY');          // 50
//     myBlock.get('start');           // [10, 50]

//     myBlock.start                     // ['10%', 'center']

//     myBlock.get('width');           // 40
//     myBlock.get('height');          // 20
//     myBlock.get('dimensions');      // [40, 20]

//     myBlock.dimensions;              // ['40%', 20]
    G.startX = function () {

        return this.currentStart[0];
    };
    G.startY = function () {

        return this.currentStart[1];
    };
    G.start = function () {

        return [].concat(this.currentStart);
    };
    G.handleX = function () {

        return this.currentHandle[0];
    };
    G.handleY = function () {

        return this.currentHandle[1];
    };
    G.handle = function () {

        return [].concat(this.currentHandle);
    };
    G.offsetX = function () {

        return this.currentOffset[0];
    };
    G.offsetY = function () {

        return this.currentOffset[1];
    };
    G.offset = function () {

        return [].concat(this.currentOffset);
    };
    G.width = function () {

        return this.currentDimensions[0];
    };
    G.height = function () {

        return this.currentDimensions[1];
    };
    G.dimensions = function () {

        return [].concat(this.currentDimensions);
    };


// Changes to an artefact's dimensions attribute Array will set the __dirtyDimensions__ flag, which will cause the currentDimensions Array to be recalculated and cascaded to other artefacts.

// The pseudo-attributes __width__ and __height__ can also be used for setting an artefact's dimensions values.
    S.width = function (val) {

        if (val != null) {

            this.dimensions[0] = val;
            this.dirtyDimensions = true;
        }
    };
    S.height = function (val) {

        if (val != null) {

            this.dimensions[1] = val;
            this.dirtyDimensions = true;
        }
    };
    S.dimensions = function (w, h) {

        this.setCoordinateHelper('dimensions', w, h);
        this.dirtyDimensions = true;
    };
    D.width = function (val) {

        let c = this.dimensions;
        c[0] = addStrings(c[0], val);
        this.dirtyDimensions = true;
    };
    D.height = function (val) {

        let c = this.dimensions;
        c[1] = addStrings(c[1], val);
        this.dirtyDimensions = true;
    };
    D.dimensions = function (w, h) {

        this.setDeltaCoordinateHelper('dimensions', w, h);
        this.dirtyDimensions = true;
    }


// Changes to an artefact's start attribute Array will set the __dirtyStart__ flag, which will cause the currentStart Array to be recalculated and cascaded to other artefacts.

// The pseudo-attributes __startX__ and __startY__ can also be used for setting an artefact's start values.
    S.startX = function (coord) {

        if (coord != null) {

            this.start[0] = coord;
            this.dirtyStart = true;
        }
    };
    S.startY = function (coord) {

        if (coord != null) {

            this.start[1] = coord;
            this.dirtyStart = true;
        }
    };
    S.start = function (x, y) {

        this.setCoordinateHelper('start', x, y);
        this.dirtyStart = true;
    };
    D.startX = function (coord) {

        let c = this.start;
        c[0] = addStrings(c[0], coord);
        this.dirtyStart = true;
    };
    D.startY = function (coord) {

        let c = this.start;
        c[1] = addStrings(c[1], coord);
        this.dirtyStart = true;
    };
    D.start = function (x, y) {

        this.setDeltaCoordinateHelper('start', x, y);
        this.dirtyStart = true;
    };


// Changes to an artefact's handle attribute Array will set the __dirtyHandle__ flag, which will cause the currentHandle Array to be recalculated and cascaded to other artefacts.

// The pseudo-attributes __handleX__ and __handleY__ can also be used for setting an artefact's handle values.
    S.handleX = function (coord) {

        if (coord != null) {

            this.handle[0] = coord;
            this.dirtyHandle = true;
        }
    };

    S.handleY = function (coord) {

        if (coord != null) {

            this.handle[1] = coord;
            this.dirtyHandle = true;
        }
    };

    S.handle = function (x, y) {

        this.setCoordinateHelper('handle', x, y);
        this.dirtyHandle = true;
    };

    D.handleX = function (coord) {

        let c = this.handle;
        c[0] = addStrings(c[0], coord);
        this.dirtyHandle = true;
    };

    D.handleY = function (coord) {

        let c = this.handle;
        c[1] = addStrings(c[1], coord);
        this.dirtyHandle = true;
    };

    D.handle = function (x, y) {

        this.setDeltaCoordinateHelper('handle', x, y);
        this.dirtyHandle = true;
    };


// Changes to an artefact's offset attribute Array will set the __dirtyOffset__ flag, which will cause the currentOffset Array to be recalculated and cascaded to other artefacts.

// The pseudo-attributes __offsetX__ and __offsetY__ can also be used for setting an artefact's offset values.
    S.offsetX = function (coord) {

        if (coord != null) {

            this.offset[0] = coord;
            this.dirtyOffset = true;
        }
    };
    S.offsetY = function (coord) {

        if (coord != null) {

            this.offset[1] = coord;
            this.dirtyOffset = true;
        }
    };
    S.offset = function (x, y) {

        this.setCoordinateHelper('offset', x, y);
        this.dirtyOffset = true;
    };
    D.offsetX = function (coord) {

        let c = this.offset;
        c[0] = addStrings(c[0], coord);
        this.dirtyOffset = true;
    };
    D.offsetY = function (coord) {

        let c = this.offset;
        c[1] = addStrings(c[1], coord);
        this.dirtyOffset = true;
    };
    D.offset = function (x, y) {

        this.setDeltaCoordinateHelper('offset', x, y);
        this.dirtyOffset = true;
    };


// The __dragOffset__ Array is internal. We use it to store local offsets established as part of an artefact's dynamic drag/drop functionality.

// TODO: check whether any code is using artefact.get('dragOffset') - if not, we can delete these functions
//     - dragOffset is purely internal, and should be of no interest to the user - thus no need to keep related getter/setter functions??
    G.dragOffsetX = function () {

        return this.dragOffset[0];
    };
    G.dragOffsetY = function () {

        return this.dragOffset[1];
    };
    S.dragOffsetX = defaultNonReturnFunction;
    S.dragOffsetY = defaultNonReturnFunction;
    S.dragOffset = defaultNonReturnFunction;
    D.dragOffsetX = defaultNonReturnFunction;
    D.dragOffsetY = defaultNonReturnFunction;
    D.dragOffset = defaultNonReturnFunction;


// The sensorSpacing attribute can be set/deltaSet. Value changes trigger the setting of the __dirtyCollision__ flag which eventually leads to the recalculation of sensor coordinates within and around the artefact's border.
    S.sensorSpacing = function (val) {

        this.sensorSpacing = val;
        this.dirtyCollision = true;
    };
    D.sensorSpacing = function (val) {

        this.sensorSpacing += val;
        this.dirtyCollision = true;
    };


// The __pivot__ setter function can accept either a pivot's 'name' attribute string, or the pivot object itself.

// Changing the pivot will set the __dirtyStampPositions__ and __dirtyStampHandlePositions__ flags.
    S.pivot = function (item) {

        let oldPivot = this.pivot,
            newPivot = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newPivot && newPivot.name) {

            if (oldPivot && oldPivot.name !== newPivot.name) removeItem(oldPivot.pivoted, name);

            pushUnique(newPivot.pivoted, name);

            this.pivot = newPivot;
            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
    };


// DOM-based artefacts ('stack', 'canvas'[1], 'element') supply __corner pivots__ in addition to the common __start pivot__. When an artefact pivots to a DOM-based artefact it can choose whether to pivot to that artefact's start coordinate (default: ''), or to one of the corner coordinates. The choice of corner is kept, as a string value, in the __pivotCorner__ attribute.

// The pivotCorner attribute can be one of: 'topLeft', 'topRight', 'bottomRight' or 'bottomLeft'

// [1] Canvas artefact corner marker &lt;div> elements routinely report their coordinates as [0, 0] - this is expected behaviour.
    P.pivotCorners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    S.pivotCorner = function (item) {

        if (this.pivotCorners.indexOf(item) >= 0) this.pivotCorner = item;
    };


// Boolean flags to tweak pivot-tracking behaviour. Each setter will also set the appropriate dirty flag for each tweaked attribute
    S.addPivotHandle = function (item) {

        this.addPivotHandle = item;
        this.dirtyHandle = true;
    };
    S.addPivotOffset = function (item) {

        this.addPivotOffset = item;
        this.dirtyOffset = true;
    };
    S.addPivotRotation = function (item) {

        this.addPivotRotation = item;
        this.dirtyRotation = true;
    };


// The __path__ setter function can accept either a path' 'name' attribute string, or the path's object itself.

// The __pathPosition__ setter accepts a positive float Number between the values of 0 and 1. The deltaSetter will check whether the resulting addition takes the pathPosition value beyond those values and correct accordingly.

// TODO: current functionality is for pathPosition to loop - is there a case for adding a pathPosition loop flag? If yes, then when that flag is false values < 0 would be corrected back to 0, and vals > 1 would be corrected back to 1.

// Changing the path or the pathPosition attributes will set the __dirtyStampPositions__ and __dirtyStampHandlePositions__ flags.
    S.path = function (item) {

        let oldPath = this.path,
            newPath = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newPath && newPath.name && newPath.useAsPath) {

            if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);

            pushUnique(newPath.pathed, name);

            this.path = newPath;
            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
    };
    S.pathPosition = function (item) {

        if (item < 0) item = Math.abs(item);
        if (item > 1) item = item % 1;

        this.pathPosition = parseFloat(item.toFixed(6));
        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    };
    D.pathPosition = function (item) {

        let pos = this.pathPosition + item

        if (pos < 0) pos += 1;
        if (pos > 1) pos = pos % 1;

        this.pathPosition = parseFloat(pos.toFixed(6));
        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    };


// Boolean flags to tweak path-following behaviour. Each setter will also set the appropriate dirty flag for each tweaked attribute
    S.addPathHandle = function (item) {

        this.addPathHandle = item;
        this.dirtyHandle = true;
    };
    S.addPathOffset = function (item) {

        this.addPathOffset = item;
        this.dirtyOffset = true;
    };
    S.addPathRotation = function (item) {

        this.addPathRotation = item;
        this.dirtyRotation = true;
    };


// The __mimic__ setter function can accept either a mimic artefact's 'name' attribute string, or the mimic object itself.

// Changing the mimic will set the __dirtyStampPositions__ and __dirtyStampHandlePositions__ flags.
    S.mimic = function (item) {

        let oldMimic = this.mimic,
            newMimic = (item.substring) ? artefact[item] : item,
            name = this.name;

        if (newMimic && newMimic.name) {

            if (oldMimic && oldMimic.name !== newMimic.name) removeItem(oldMimic.mimicked, name);

            pushUnique(newMimic.mimicked, name);

            this.mimic = newMimic;
            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
    };


// Boolean flags to tweak mimic-tracking behaviour. Each setter will also set the appropriate dirty flag for each tweaked attribute
    S.useMimicDimensions = function (item) {

        this.useMimicDimensions = item;
        this.dirtyDimensions = true;
    };
    S.useMimicScale = function (item) {

        this.useMimicScale = item;
        this.dirtyScale = true;
    };
    S.useMimicStart = function (item) {

        this.useMimicStart = item;
        this.dirtyStart = true;
    };
    S.useMimicHandle = function (item) {

        this.useMimicHandle = item;
        this.dirtyHandle = true;
    };
    S.useMimicOffset = function (item) {

        this.useMimicOffset = item;
        this.dirtyOffset = true;
    };
    S.useMimicRotation = function (item) {

        this.useMimicRotation = item;
        this.dirtyRotation = true;
    };
    S.addOwnDimensionsToMimic = function (item) {

        this.addOwnDimensionsToMimic = item;
        this.dirtyDimensions = true;
    };
    S.addOwnScaleToMimic = function (item) {

        this.addOwnScaleToMimic = item;
        this.dirtyScale = true;
    };
    S.addOwnStartToMimic = function (item) {

        this.addOwnStartToMimic = item;
        this.dirtyStart = true;
    };
    S.addOwnHandleToMimic = function (item) {

        this.addOwnHandleToMimic = item;
        this.dirtyHandle = true;
    };
    S.addOwnOffsetToMimic = function (item) {

        this.addOwnOffsetToMimic = item;
        this.dirtyOffset = true;
    };
    S.addOwnRotationToMimic = function (item) {

        this.addOwnRotationToMimic = item;
        this.dirtyRotation = true;
    };
            

// For ease of use, we supply the user with 3 functions for setting __positioning locks__ on the lockTo array:

// + The __lockXTo__ pseudo-attribute will update the x coordinate lock value.
// + The __lockYTo__ pseudo-attribute will update the y coordinate lock value.
// + the __lockTo__ attribute will update both the x and y coordinates. It can accept: either an [x, y] Array; or a String value, in which case both x and y lock values are updated to that value.

// Valid lock String values are: 'start' (the default), 'pivot', 'path', 'mimic', and 'mouse'.

//     Example: create a block entity that follows mouse movements in the horizontal plane only

//     let myBlock = scrawl.makeBlock({
//         [... etc]
//         lockXTo: 'mouse',
//         lockYTo: 'start',
//     });

//     ... update the block so that it acts like the mouse's cursor

//     myBlock.set({
//         lockTo: 'mouse',
//     });
    S.lockTo = function (item) {

        if (Array.isArray(item)) {

            this.lockTo[0] = item[0];
            this.lockTo[1] = item[1];
        }
        else {

            this.lockTo[0] = item;
            this.lockTo[1] = item;
        }
        this.dirtyLock = true;
    };
    S.lockXTo = function (item) {

        this.lockTo[0] = item;
        this.dirtyLock = true;
    };
    S.lockYTo = function (item) {

        this.lockTo[1] = item;
        this.dirtyLock = true;
    };

// TODO - documentation
    S.roll = function (item) {

        if (!isa_number(item)) throw new Error(`mixin/position error - S.roll() argument not a number: ${item}`);

        this.roll = item;
        this.dirtyRotation = true;
    };
    D.roll = function (item) {

        if (!isa_number(item)) throw new Error(`mixin/position error - D.roll() argument not a number: ${item}`);
        
        this.roll += item;
        this.dirtyRotation = true;
    };


// TODO - check to see what happens when we apply a negative scale to an artefact
//     - adapt one of the demos so that the scale value can be set to a negative value
//     - decide if the results are something we want to keep as functionality
//         - if negative scales leads to unwelcome effects, adapt function to only accept +ve values
    S.scale = function (item) {

        if (!isa_number(item)) throw new Error(`mixin/position error - S.scale() argument not a number: ${item}`);
        
        this.scale = item;
        this.dirtyScale = true;
    };
    D.scale = function (item) {

        if (!isa_number(item)) throw new Error(`mixin/position error - D.scale() argument not a number: ${item}`);
        
        this.scale += item;
        this.dirtyScale = true;
    };

// TODO - documentation
    S.delta = function (items = {}) {

        if (items) this.delta = mergeDiscard(this.delta, items);
    };

// TODO - documentation
    S.host = function (item) {

        if (item) {

            let host = artefact[item];

            if (host && host.here) this.host = host.name;
            else this.host = item;
        }
        else this.host = '';

        this.dirtyDimensions = true;
        this.dirtyHandle = true;
        this.dirtyStart = true;
        this.dirtyOffset = true;
    };

// TODO - documentation
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


// ## Define functions to be added to the factory prototype



// Internal function to setup initial Arrays and Objects, including 'current...' and '...Subscriber' Arrays.

// It also creates a group 'dirty...' flags and sets them all to true. 

// Scrawl-canvas depends heavily on dirty flags. 

// + Changes to a Scrawl-canvas object via the __set()__ and __setDelta()__ functions will set relevant flags to true. 
// + Then, during the compile stage of the display cycle, we will recalculate and update only those attributes tagged for cleaning by the dirty flags. 
// + If nothing has happened to set any dirty flags to true since the last RequestAnimationFrame tick, then there's nothing new to calculate and we can proceed to displaying the object in the canvas (or stack) using existing calculated values.
// + most calculated values are kept in attributes starting with 'current...' eg currentHandle, currentStampPosition, etc.
    P.initializePositions = function () {

        this.dimensions = makeCoordinate();
        this.start = makeCoordinate();
        this.handle = makeCoordinate();
        this.offset = makeCoordinate();

        this.currentDimensions = makeCoordinate();
        this.currentStart = makeCoordinate();
        this.currentHandle = makeCoordinate();
        this.currentOffset = makeCoordinate();

        this.currentDragOffset = makeCoordinate();
        this.currentDragCache = makeCoordinate();
        this.currentStartCache = makeCoordinate();

        this.currentStampPosition = makeCoordinate();
        this.currentStampHandlePosition = makeCoordinate();

        this.delta = {};

        this.lockTo = ['start', 'start'];

        this.pivoted = [];
        this.mimicked = [];

        this.controlSubscriber = [];
        this.startControlSubscriber = [];
        this.endControlSubscriber = [];
        this.endSubscriber = [];

        this.dirtyScale = true;
        this.dirtyDimensions = true;
        this.dirtyLock = true;
        this.dirtyStart = true;
        this.dirtyOffset = true;
        this.dirtyHandle = true;
        this.dirtyRotation = true;

        this.isBeingDragged = false;

        this.initializeDomPositions();
    };

    P.initializeDomPositions = defaultNonReturnFunction;


// TODO - documentation - 'kill' functionality needs to be reconsidered and recoded across the whole code base

// Overwrites mixin/base.js function

    P.kill = function () {

        if (this.group && this.group.name) this.group.removeArtefacts(this.name);
        this.demolishAnchor();
        this.deregister();
        return this;
    };


// Helper function used by the 'dimensions', 'start', 'handle' and 'offset' setter functions. Arguments are:

// + __label__ - either 'dimensions', 'start', 'handle' or 'offset'
// + __x__ - this can be either an [x, y] array, or an {x: val, y: val} object, or a Number or %String value
// + __y__ - if x is a number or string, then y should also be a number or string

// (The array and object versions can also be [w, h], or {w:val, h:val}, or {width:val, height:val})
    P.setCoordinateHelper = function (label, x, y) {

        let c = this[label];

        if (Array.isArray(x)) {

            c[0] = x[0];
            c[1] = x[1];
        }
        else if (isa_obj(x)) {

            if (xto(x.x, x.y)) {

                c[0] = xtGet(x.x, c[0]);
                c[1] = xtGet(x.y, c[1]);
            }
            else {

                c[0] = xtGet(x.width, x.w, c[0]);
                c[1] = xtGet(x.height, x.h, c[1]);
            }
        }
        else {

            c[0] = x;
            c[1] = y;
        }
    };


// Helper function used by the 'dimensions', 'start', 'handle' and 'offset' delta-setter functions. Arguments are:

// + __label__ - either 'dimensions', 'start', 'handle' or 'offset'
// + __x__ - this can be either an [x, y] array, or an {x: val, y: val} object, or a Number or %String value
// + __y__ - if x is a number or string, then y should also be a number or string

// (The array and object versions can also be [w, h], or {w:val, h:val}, or {width:val, height:val})
    P.setDeltaCoordinateHelper = function (label, x, y) {

        let c = this[label],
            myX = c[0],
            myY = c[1];

        if (Array.isArray(x)) {

            c[0] = addStrings(myX, x[0]);
            c[1] = addStrings(myY, x[1]);
        }
        else if (isa_obj(x)) {

            if (xto(x.x, x.y)) {

                c[0] = addStrings(myX, xtGet(x.x, 0));
                c[1] = addStrings(myY, xtGet(x.y, 0));
            }
            else {

                c[0] = addStrings(myX, xtGet(x.width, x.w, 0));
                c[1] = addStrings(myY, xtGet(x.height, x.h, 0));
            }
        }
        else {

            c[0] = addStrings(myX, x);
            c[1] = addStrings(myY, y);
        }
    };


// This function gets called as part of every display cycle iteration, meaning that if an attribute is set to a non-zero value in the __delta__ attribute object then those __delta animations__ will start playing immediately.
    P.updateByDelta = function () {

        this.setDelta(this.delta);

        return this;
    };


// The opposite action to 'updateByDelta'; values in the __delta__ attribute object will be subtracted from the current value for that Scrawl-canvas object.
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

// TODO - documentation
    P.setDeltaValues = function (items = {}) {

        let delta = this.delta, 
            oldVal, action;

        Object.entries(items).forEach(([key, requirement]) => {

            if (xt(delta[key])) {

                // TODO - the idea is that we can do things like 'add:1', 'subtract:5', 'multiply:6', 'divide:3.4', etc
                // - for this to work, we need to do do work here to split the val string on the ':'
                // - for now, just do reverse and zero numbers

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


// Internal function - return the 'host' object. Hosts can be various things, for instance:

// + Element artefacts will have a stack artefact as its host
// + Stack and Canvas artifacts can also have a Stack host
// + Cells will have either a canvas, or another cell, as their host
// + Entity artefacts will use a Cell as their host

// All of the above can exist without a host (though in many cases this means they don't do much). Stack and Canvas artefacts will often be unhosted, sitting as root artefacts in the web page DOM
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


// The __here__ parameter is owned by Canvas, Stack and (if enabled) Element artefacts and is set on them by calling the core/userInteraction.js updateUiSubscribedElement() function - thus not defined or updated by the artefact itself.

//     here {x, y, w, h, normX, normY, offsetX, offsetY, type, active}


// Cell assets also have a __here__ parameter, defined and updated by themselves with reference to their current Canvas host

//     here {x, y, w, h, xRatio, yRatio}

// NOTE: Canvas, Stack, Element (if enabled) and Cell all need to create their .here attribute immediately after they first calculate their currentDimensions Coordinate, which needs to happen as part of the constructor!
    P.getHere = function () {

        let host = this.getHost();

        if (host) {

            if (host.here) return host.here;
            else if (host.currentDimensions) {

                let dims = host.currentDimensions;

                if (dims) {

                    return {
                        w: dims[0],
                        h: dims[1]
                    }
                }
            }
        }
        return currentCorePosition;
    };


// Helper function used by cleanStart, cleanHandle and cleanOffset functions
    P.cleanPosition = function (current, source, dimensions) {

        let val, dim;

        for (let i = 0; i < 2; i++) {

            val = source[i];
            dim = dimensions[i];

            if (val.toFixed) current[i] = val;
            else if (val === 'left' || val === 'top') current[i] = 0;
            else if (val === 'right' || val === 'bottom') current[i] = dim;
            else if (val === 'center') current[i] = dim / 2;
            else current[i] = (parseFloat(val) / 100) * dim;
        }
    };


// Set the artefact's currentScale value. Scaling has widespread effects across a range of the artefact's other positional and display attributes. Artefacts may use other artefacts to set their own scale values (mimicking)
    P.cleanScale = function () {

        this.dirtyScale = false;

        let scale,
            myscale = this.scale,
            mimic = this.mimic,
            oldScale = this.currentScale;

        if(mimic && this.useMimicScale) {

            if (mimic.currentScale) {

                scale = mimic.currentScale;

                if (this.addOwnScaleToMimic) scale += myscale;
            }
            else {

                scale = myscale;
                this.dirtyMimicScale = true;
            }
        }
        else scale = myscale;

        this.currentScale = scale;

        this.dirtyDimensions = true;
        this.dirtyHandle = true;

        if (oldScale !== this.currentScale) this.dirtyPositionSubscribers = true;

        if (this.mimicked && this.mimicked.length) this.dirtyMimicScale = true;
    };


// Set the artefact's currentDimensions values, depending on: 

// + Their width and height - if these are set to absolute (Number) values
// + Their host's width and height - if their own dimensions are set to %String values
// + Another artefact's width and height - if they are mimicking that artefact's dimensions

// Dimensions DO scale - but scaling happens elsewhere
    P.cleanDimensions = function () {

        this.dirtyDimensions = false;

        let host = this.getHost(),
            dims = this.dimensions,
            curDims = this.currentDimensions;

        if (host) {

            let hostDims = (host.currentDimensions) ? host.currentDimensions : [host.w, host.h];

            let [w, h] = dims,
                oldW = curDims[0],
                oldH = curDims[1];

            if (w.substring) w = (parseFloat(w) / 100) * hostDims[0];

            if (h.substring) {

                if (h === 'auto') h = 0;
                else h = (parseFloat(h) / 100) * hostDims[1];
            }

            let mimic = this.mimic,
                mimicDims;

            if (mimic && mimic.name && this.useMimicDimensions) mimicDims = mimic.currentDimensions;

            if (mimicDims) {

                curDims[0] = (this.addOwnDimensionsToMimic) ? mimicDims[0] + w : mimicDims[0];
                curDims[1] = (this.addOwnDimensionsToMimic) ? mimicDims[1] + h : mimicDims[1];
            }
            else {

                curDims[0] = w;
                curDims[1] = h;
            }

            this.cleanDimensionsAdditionalActions();

            this.dirtyStart = true;
            this.dirtyHandle = true;
            this.dirtyOffset = true;

            if (oldW !== curDims[0] || oldH !== curDims[1]) this.dirtyPositionSubscribers = true;

            if (this.mimicked && this.mimicked.length) this.dirtyMimicDimensions = true;
        }
        else this.dirtyDimensions = true;
    };


// This function gets overwritten by various (but not all) relevant factory files
    P.cleanDimensionsAdditionalActions = defaultNonReturnFunction;


// Clean function for __lock__ array - unsets the dirtyLock flag; sets the dirtyStart and dirtyHandle flags
    P.cleanLock = function () {

        this.dirtyLock = false;

        this.dirtyStart = true;
        this.dirtyHandle = true;
    };


// Clean function for __start__ arrays - if local 'here' tests pass, invokes cleanPosition() and unsets the dirtyStart flag

// Start values do NOT scale
    P.cleanStart = function () {

        this.dirtyStart = false;

        let here = this.getHere();

        if (xt(here)) {

            if (xta(here.w, here.h)) {

                this.cleanPosition(this.currentStart, this.start, [here.w, here.h]);
                this.dirtyStampPositions = true;
            }
            else this.dirtyStart = true;
        }
        else this.dirtyStart = true;
    };


// Clean function for __offset__ arrays - if local 'here' tests pass, invokes cleanPosition() and unsets the dirtyOffset flag; sets the dirtyStampPositions and, if needed, the dirtyMimicOffset flags

// Offset values do NOT scale
    P.cleanOffset = function () {

        this.dirtyOffset = false;

        let here = this.getHere();

        if (xt(here)) {

            if (xta(here.w, here.h)) {

                this.cleanPosition(this.currentOffset, this.offset, [here.w, here.h]);
                this.dirtyStampPositions = true;

                if (this.mimicked && this.mimicked.length) this.dirtyMimicOffset = true;
            }
            else this.dirtyOffset = true;
        }
        else this.dirtyOffset = true;
    };


// Clean function for __handle__ arrays - invokes cleanPosition() and unsets the dirtyHandle flag; sets the dirtyStampHandlePositions and, if needed, the dirtyMimicHandle flags

// Handle values DO scale - but scaling happens elsewhere:

// + DOM elements (stack, element, canvas) manage handle offset in their CSS transform string
// + Entities manage it as part of each entity's 'path' calculation
    P.cleanHandle = function () {

        this.dirtyHandle = false;

        let current = this.currentHandle;

        this.cleanPosition(current, this.handle, this.currentDimensions);
        this.dirtyStampHandlePositions = true;

        if (this.mimicked && this.mimicked.length) this.dirtyMimicHandle = true;
    };


// Clean function for the various __rotation__ attributes (roll, pitch, yaw). This function only handles __currentRoll__ recalculations; the function is overridden in the mixin/dom.js module to deal with DOM element 3D rotations.

// Rotation calculations vary according to the object's 'lockTo', 'pivot', 'mimic' and 'path' attributes, as an artefact can be set to use other artefacts' rotation values instead of its own values.

// Artefacts to which this artefact has subscribed for pivot and mimic purposes will set dirty flags (dirtyPivotRotation, dirtyMimicRotation) in this artefact when their rotation values change; these flags will be unset if the appropriate local tests pass.

// If this artefact's rotation values change as a result of cleaning, it will set the dirtyPositionSubscribers flag so the update can cascade through to other artefacts using it as a pivot or mimic 
    P.cleanRotation = function () {

        this.dirtyRotation = false;

        let roll,
            myroll = this.roll,
            oldRoll = this.currentRotation,
            path = this.path,
            mimic = this.mimic,
            pivot = this.pivot,
            lock = this.lockTo;

        if (path && lock.indexOf('path') >= 0) {

            roll = myroll;

            if (this.addPathRotation) {

                let pathData = this.getPathData();

                if (pathData) roll += pathData.angle;
            }

        }
        else if (mimic && this.useMimicRotation && lock.indexOf('mimic') >= 0) {

            if (xt(mimic.currentRotation)) {

                roll = mimic.currentRotation;

                if (this.addOwnRotationToMimic) roll += myroll;
            }
            else this.dirtyMimicRotation = true;
        } 
        else {

            roll = myroll;

            if (pivot && this.addPivotRotation && lock.indexOf('pivot') >= 0) {

                if (xt(pivot.currentRotation)) roll += pivot.currentRotation;
                else this.dirtyPivotRotation = true;
            }
            
        }

        this.currentRotation = roll;

        if (roll !== oldRoll) this.dirtyPositionSubscribers = true;

        // If this artefact is being mimicked by other artefacts, it needs to check its rotation values on every iteration of the display cycle
        if (this.mimicked && this.mimicked.length) this.dirtyMimicRotation = true;
    };


// __stampPosition__ represents the combination of start and offset positions to determine where the top left corner of any artefact should be placed. It represents the real __rotation-reflection point__ around which the artefact will display.

// Note that the calculation does not take into account _handle_ values, which get applied after the canvas grid is setup for the stamp operation

// DOM artefacts will also take handle values into consideration after the fact

// The X and Y coordinates are handled separately, and are dependant on the the lock set for each in the 'lockTo' array. Lock values can be: 'start' (the default for each coordinate), 'mouse' (to lock the coordinate to the mouse cursor), and 'pivot', 'path' or 'mimic' to use other artefacts for positioning.

// Artefacts that are currently in 'drag' mode (whose lock values are temporarily overridden) also need to take into account the drag offset values.

// Rotation and flip attributes are handled separately, alongside handle values, as part of the actual stamp operation.

// If either currentStampPosition coordinate changes as a result of this function, the dirtyPositionSubscribers flag will be set so that the change can be cascaded to any artefacts using this one as a pivot or mimic for their start or offset values.
    P.cleanStampPositions = function () {

        this.dirtyStampPositions = false;

        let stamp = this.currentStampPosition,
            start = this.currentStart,
            oldX = stamp[0],
            oldY = stamp[1];

        if (this.noPositionDependencies) {

            stamp[0] = start[0];
            stamp[1] = start[1];
        }
        else {

            let lockArray = this.lockTo,
                localLockArray = [],
                lock, i, coord, here, pathData,
                hereFlag = false,
                stamp = this.currentStampPosition,
                oldX = stamp[0],
                oldY = stamp[1],
                offset = this.currentOffset,
                isBeingDragged = this.isBeingDragged,
                drag = this.currentDragOffset,
                cache = this.currentStartCache,
                pivot = this.pivot,
                path = this.path,
                mimic = this.mimic;

            if (isBeingDragged) {

                localLockArray = ['mouse', 'mouse'];
                hereFlag = true;

                if (this.getCornerCoordinate) this.cleanPathObject();
            }
            else {
                
                // x and y coordinates can have different lockTo values
                for (i = 0; i < 2; i++) {

                    lock = lockArray[i];

                    if (lock === 'pivot' && !pivot) lock = 'start';
                    else if (lock === 'path' && !path) lock = 'start';
                    else if (lock === 'mimic' && !mimic) lock = 'start';

                    if (lock === 'mouse') hereFlag = true;

                    localLockArray[i] = lock;
                }
            }

            if (hereFlag) here = this.getHere();

            // We loop twice - once for each coordinate: x is calculated on the first loop (i === 0); y on the second (i === 1)
            for (i = 0; i < 2; i++) {

                lock = localLockArray[i];

                switch (lock) {

                    case 'pivot' :

                        if (this.pivotCorner && pivot.getCornerCoordinate) {

                            coord = pivot.getCornerCoordinate(this.pivotCorner, (i) ? 'y' : 'x');
                        }
                        else coord = pivot.currentStampPosition[i];

                        if (!this.addPivotOffset) coord -= pivot.currentOffset[i];

                        coord += offset[i];

                        break;

                    case 'path' :
                        pathData = this.getPathData();

                        if (pathData) {

                            coord = (i) ? pathData.y : pathData.x;

                            if (!this.addPathOffset) coord -= path.currentOffset[i];
                        }
                        else coord = start[i] + offset[i];

                        break;

                    case 'mimic' :
                        if (this.useMimicStart || this.useMimicOffset) {

                            coord = mimic.currentStampPosition[i];

                            if (this.useMimicStart && this.addOwnStartToMimic) coord += start[i];
                            if (this.useMimicOffset && this.addOwnOffsetToMimic) coord += offset[i];

                            if (!this.useMimicStart) coord = coord - mimic.currentStart[i] + start[i];
                            if (!this.useMimicOffset) coord = coord - mimic.currentOffset[i] + offset[i];
                        }
                        else coord = start[i] + offset[i];

                        break;

                    case 'mouse' :
                        coord = (i === 0) ? here.x : here.y;

                        if (isBeingDragged) {

                            cache[i] = coord;
                            coord += drag[i];
                            this.dirtyCollision = true;
                        }
                        coord += offset[i];

                        break;

                    default :
                        coord = start[i] + offset[i];
                }
                stamp[i] = coord;
            }
        }
        this.cleanStampPositionsAdditionalActions()

        if (oldX !== stamp[0] || oldY !== stamp[1]) this.dirtyPositionSubscribers = true;
    };


// Some artefact types need to perform additional calculations to finalize the values in the currentStampPosition array. Those factory functions will overwrite this function as required.
    P.cleanStampPositionsAdditionalActions = defaultNonReturnFunction;


// An artefact's currentHandle values get applied after the canvas grid has been set up for the stamp operation (by translating the grid to the currentStampPosition coordinates). 

// + DOM elements (stack, element, canvas) include handle values as part of their CSS transform string
// + Entities include handle values as part of their 'path' calculation

// Handle values DO scale, but not here; that happens when the transform/path is recalculated

// This function takes into account whether the artefact is pivoting on, or mimicking, another artefact.

// If either currentStampHandlePosition coordinate changes as a result of this function, the dirtyPositionSubscribers flag will be set so that the change can be cascaded to any artefacts using this one as a pivot or mimic for their start, handle or offset values.
    P.cleanStampHandlePositions = function () {

        this.dirtyStampHandlePositions = false;

        let stampHandle = this.currentStampHandlePosition,
            handle = this.currentHandle,
            oldX = stampHandle[0],
            oldY = stampHandle[1];

        if (this.noPositionDependencies) {

            stampHandle[0] = handle[0];
            stampHandle[1] = handle[1];
        }
        else {

            let lockArray = this.lockTo,
                lock, i, coord, here, myscale,
                pivot = this.pivot,
                path = this.path,
                mimic = this.mimic;

            // We loop twice - once for each coordinate: x is calculated on the first loop (i === 0); y on the second (i === 1)
            for (i = 0; i < 2; i++) {

                lock = lockArray[i];

                if (lock === 'pivot' && !pivot) lock = 'start';
                if (lock === 'path' && !path) lock = 'start';
                if (lock === 'mimic' && !mimic) lock = 'start';

                coord = handle[i];

                switch (lock) {

                    case 'pivot' :
                        if (this.addPivotHandle) coord += pivot.currentHandle[i];
                        break;

                    case 'path' :
                        if (this.addPathHandle) coord += path.currentHandle[i];
                        break;

                    case 'mimic' :
                        if (this.useMimicHandle) {

                            coord = mimic.currentHandle[i];

                            if (this.addOwnHandleToMimic) coord += handle[i];
                        }
                        break;
                }
                stampHandle[i] = coord;
            }
        }
        
        // At the moment only Shape type artefacts require additional calculations to complete the cleanHandle functionality. If this changes, then we should amend code so that we pass code flow to a cleanStampHandlePositionsAdditionalActions function, then move this 'if' statement into an override of that function in the mixin/shape.js module file
        if (this.type === 'Shape') {

            let box = this.localBox;
            stampHandle[0] += box[0];
            stampHandle[1] += box[1];
        }

        if (oldX !== stampHandle[0] || oldY !== stampHandle[1]) this.dirtyPositionSubscribers = true;

        if (this.domElement && this.collides) this.dirtyPathObject = true;
    };

// TODO - documentation
    P.cleanCollisionData = function () {

        if (!this.currentCollisionRadius) this.currentCollisionRadius = 0;
        if (!this.currentSensors) this.currentSensors = [];

        if (!this.noUserInteraction) {

            if (this.dirtyCollision) {

                this.dirtyCollision = false;

                this.calculateCollisionRadius();

                if (this.collides) this.calculateSensors();
            }
        }

        return [this.currentCollisionRadius, this.currentSensors];
    };

// TODO - documentation
    P.calculateCollisionRadius = function () {

        if (!this.noUserInteraction) {

            let stamp = this.currentStampPosition,
                handle = this.currentStampHandlePosition,
                dims = this.currentDimensions,
                scale = this.currentScale;

            let radii = [],
                sx = stamp[0],
                sy = stamp[1],
                lx = (sx - (handle[0] * scale)),
                ty = (sy - (handle[1] * scale)),
                rx = lx + (dims[0] * scale),
                by = ty + (dims[1] * scale);

            // BUG: fails for DOM artefact types (stack, canvas, element) whose computed height is 0 - because: 'auto'?
            radii.push(Math.sqrt(((sx - lx) * (sx - lx)) + ((sy - ty) * (sy - ty))));
            radii.push(Math.sqrt(((sx - rx) * (sx - rx)) + ((sy - by) * (sy - by))));
            radii.push(Math.sqrt(((sx - lx) * (sx - lx)) + ((sy - by) * (sy - by))));
            radii.push(Math.sqrt(((sx - rx) * (sx - rx)) + ((sy - ty) * (sy - ty))));

            // We can use the currentCollisionRadius attribute to quickly calculate whether two given artefacts are capable of intersecting, before proceeding to check if they do intersect (assuming they can)
            this.currentCollisionRadius = Math.ceil(Math.max(...radii));
        }
    };

// TODO - documentation
    P.calculateSensors = function () {

        if (!this.noUserInteraction) {

            let stamp = this.currentStampPosition,
                handle = this.currentStampHandlePosition,
                dims = this.currentDimensions,
                scale = this.currentScale,
                upend = this.flipUpend,
                reverse = this.flipReverse;

            let rotate = function(x, y, angle, sx, sy) {

                let arr = [0, 0];

                arr[0] = Math.atan2(y, x);
                arr[0] += (angle * 0.01745329251);
                arr[1] = Math.sqrt((x * x) + (y * y));

                return [Math.round(arr[1] * Math.cos(arr[0])) + sx, Math.round(arr[1] * Math.sin(arr[0])) + sy];
            };

            let sensors = this.currentSensors;
            sensors.length = 0;

            let roll = this.roll,
                sx = stamp[0],
                sy = stamp[1],
                handleX = (reverse) ? -handle[0] * scale : handle[0] * scale,
                handleY = (upend) ? -handle[1] * scale : handle[1] * scale,
                lx = -handleX,
                ty = -handleY,
                width = dims[0] * scale,
                height = dims[1] * scale,
                rx = (reverse) ? lx - width : lx + width,
                by = (upend) ? ty - height : ty + height;

            sensors.push(rotate(lx, ty, roll, sx, sy));
            sensors.push(rotate(rx, ty, roll, sx, sy));
            sensors.push(rotate(rx, by, roll, sx, sy));
            sensors.push(rotate(lx, by, roll, sx, sy));

            let sensorSpacing = this.sensorSpacing || 50,
                widthSensors = parseInt(width / sensorSpacing, 10),
                heightSensors = parseInt(height / sensorSpacing, 10),
                partial, place, i, iz;

            if (widthSensors) {

                let partial = width / (widthSensors + 1),
                    place = lx;

                for (i = 0; i < widthSensors; i++) {

                    place += (reverse) ? -partial : partial;
                    sensors.push(rotate(place, ty, roll, sx, sy));
                    sensors.push(rotate(place, by, roll, sx, sy));
                }
            }

            if (heightSensors) {

                let partial = height / (heightSensors + 1),
                    place = ty;

                for (i = 0; i < heightSensors; i++) {

                    place += (upend) ? -partial : partial;
                    sensors.push(rotate(lx, place, roll, sx, sy));
                    sensors.push(rotate(rx, place, roll, sx, sy));
                }
            }
        }
    };


// TODO - documentation
    P.getSensors = function () {

        let [entityRadius, entitySensors] = this.cleanCollisionData();
        return entitySensors;
    }

// TODO - documentation
    P.checkHit = function (items = [], mycell) {

        if (this.noUserInteraction) return false;

        if (!this.pathObject || this.dirtyPathObject) {

            this.cleanPathObject();
        }

        let tests = (!Array.isArray(items)) ?  [items] : items,
            poolCellFlag = false;

        if (!mycell) {

            mycell = requestCell();
            poolCellFlag = true;
        }

        let engine = mycell.engine,
            stamp = this.currentStampPosition,
            x = stamp[0],
            y = stamp[1],
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

            mycell.rotateDestination(engine, x, y, this);

            return engine.isPointInPath(this.pathObject, tx, ty, this.winding);

        }, this)) {

            if (poolCellFlag) releaseCell(mycell);

            return {
                x: tx,
                y: ty,
                artefact: this
            };
        }
        
        if (poolCellFlag) releaseCell(mycell);
        
        return false;
    };

// TODO - documentation
    P.updatePositionSubscribers = function () {

        this.dirtyPositionSubscribers = false;

        if (this.pivoted && this.pivoted.length) this.updatePivotSubscribers();
        if (this.mimicked && this.mimicked.length) this.updateMimicSubscribers();
        if (this.pathed && this.pathed.length) this.updatePathSubscribers();
        if (this.controlSubscriber && this.controlSubscriber.length) this.updateControlSubscribers();
        if (this.startControlSubscriber && this.startControlSubscriber.length) this.updateStartControlSubscribers();
        if (this.endControlSubscriber && this.endControlSubscriber.length) this.updateEndControlSubscribers();
        if (this.endSubscriber && this.endSubscriber.length) this.updateEndSubscribers();

    };

    P.updateControlSubscribers = function () {

        this.controlSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyControl = true;
        });
    };

    P.updateStartControlSubscribers = function () {

        this.startControlSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyStartControl = true;
        });
    };

    P.updateEndControlSubscribers = function () {

        this.endControlSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyEndControl = true;
        });
    };

    P.updateEndSubscribers = function () {

        this.endSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyEnd = true;
        });
    };

    P.updatePivotSubscribers = function () {

        this.pivoted.forEach(name => {

            let instance = artefact[name];

            if (instance) {

                instance.dirtyStart = true;
                if (instance.addPivotHandle) instance.dirtyHandle = true;
                if (instance.addPivotOffset) instance.dirtyOffset = true;
                if (instance.addPivotRotation) instance.dirtyRotation = true;
            }
        });
    };

    P.updateMimicSubscribers = function () {

        let DMH = this.dirtyMimicHandle;
        let DMO = this.dirtyMimicOffset;
        let DMR = this.dirtyMimicRotation;
        let DMS = this.dirtyMimicScale;
        let DMD = this.dirtyMimicDimensions;

        this.mimicked.forEach(name => {

            let instance = artefact[name];

            if (instance) {

                if (instance.useMimicStart) instance.dirtyStart = true;
                if (DMH && instance.useMimicHandle) instance.dirtyHandle = true;
                if (DMO && instance.useMimicOffset) instance.dirtyOffset = true;
                if (DMR && instance.useMimicRotation) instance.dirtyRotation = true;
                if (DMS && instance.useMimicScale) instance.dirtyScale = true;
                if (DMD && instance.useMimicDimensions) instance.dirtyDimensions = true;
            }
        });

        this.dirtyMimicHandle = false;
        this.dirtyMimicOffset = false;
        this.dirtyMimicRotation = false;
        this.dirtyMimicScale = false;
        this.dirtyMimicDimensions = false;
    };


// This is a holding function. The real function is in factory/shape.js as only shapes have to worry about updating their path subscribers
    P.updatePathSubscribers = defaultNonReturnFunction;


// This is a holding function. The real function is in factory/picture.js as only pictures need to deal with telling subscribers about image update issues
    P.updateImageSubscribers = defaultNonReturnFunction;

// TODO - documentation
    P.getPathData = function () {

        let pathPos = this.pathPosition,
            path = this.path,
            currentPathData;

        if (path) {

            currentPathData = path.getPathPositionData(pathPos);

            if (this.addPathRotation) this.dirtyRotation = true;

            return currentPathData;
        }
        return false;
    };


// TODO - documentation
    P.pickupArtefact = function (items = {}) {

        let {x, y} = items;

        if (xta(x, y)) {

            this.isBeingDragged = true;
            this.currentDragCache.set(this.currentDragOffset);
            this.currentDragOffset.set(this.currentStart).subtract([x, y]);

            this.order += 9999;

            this.group.batchResort = true;

            if (xt(this.dirtyPathObject)) this.dirtyPathObject = true;

        }

        return this;
    };

// TODO - documentation
    P.dropArtefact = function () {

        this.start.set(this.currentStartCache).add(this.currentDragOffset);
        this.dirtyStart = true;

        this.currentDragOffset.set(this.currentDragCache);

        this.order = (this.order >= 9999) ? this.order - 9999 : 0;

        this.group.batchResort = true;

        if (xt(this.dirtyPathObject)) this.dirtyPathObject = true;

        this.isBeingDragged = false;

        return this;
    };

// Return the prototype
    return P;
};
