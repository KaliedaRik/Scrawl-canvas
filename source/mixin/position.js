// # Position mixin
// This mixin defines the key attributes and functionality of Scrawl-canvas __artefact objects__. 
//
// We define an artefact as something that can be displayed in a Scrawl-canvas [Canvas](../factory/stack.html) or [Stack](../factory/stack.html) wrapper - both of which wrap DOM elements in the web page document - &lt;canvas>, and other DOM elements (most commonly a &lt;div> element), respectively.
// + We call canvas based artefacts __entity objects__ - these objects represent a shape, path or image drawn in the canvas. 
// + Entitys include: [Block](../factory/block.html); [Grid](../factory/grid.html); [Loom](../factory/loom.html); [Phrase](../factory/phrase.html) for text; [Picture](../factory/picture.html) for images, videos, etc; [Shape](../factory/shape.html)s of various types; and [Wheel](../factory/wheel.html).
// + __Other artefacts__ live in stack containers. They include nested Stack wrappers, Canvas wrappers (which can exist outside of a stack); and [Element](../factory/element.html) wrappers for other direct child elements.
//
// ##### Positioning
// Artefacts break away from the normal flow mechanisms of the HTML document; instead they are explicitly positioned within their containers in a variety of ways:
// + __absolute__ positioning - where we give the artefact a coordinate, measured in pixels from the top left corner of the container (`[0, 0]`, `[347, 26.4]`, etc). 
// + __relative__ positioning - where we supply the artefact with percentage coordinates, with `['0%', '0%']` representing the top left corner of the container, and `['100%', '100%']` its bottom right corner.
// + __reference__ positioning - this is where an artefact will use another artefact's ___current___ (not given) coordinate to determine its own position. We can reference by `pivot`, or by `mimic`, or by `path`.
//
// Scrawl-canvas uses [Coordinate Arrays](../factory/coordinate.html) - `[x, y]` - for storing artefact coordinates. The ___Javascript types___ of the `x` and `y` parts of the coordinate can be either Numbers or Strings, and do not need to match each other: `['5%', 20]` and `[10, '15.4%']` are as valid as `[10, 20]` and `['5%', '15.4%']`.
//
// ##### The artefact 'rotation-reflection' point
// Every artefact has a __start__ coordinate which, by default, is set at the artefact's top-left corner - even for Wheels and Shapes! 
// + When we rotate an artefact, we rotate it around this coordinate. When we ___flip___ entity artefacts, we flip them around the artefact's local horizontal or vertical axis drawn through this coordinate. 
// + Thus what we call a 'start' coordinate is in fact the artefact's __Rotation-Reflection__ point.
//
// The R-R point does not need to be at the artefact's top-left corner. We can move it by giving the artefact a __handle__ coordinate - a distance measured from the artefact's top-left corner. Just as for the start coordinate, we can set the handle coordinate using absolute, relative or reference values:
// + __absolute__ handles - where we give the artefact a distance, measured in pixels from its top left corner . 
// + __relative__ handles - where we supply the artefact with percentage distances measured against the artefact's own dimensions.
// + __reference__ handles.
// + In all cases, ___the distancing effect is along the artefact's local horizontal and vertical axes___ - if the artefact is rotated, then those axes will not be perpendicular to the containing Canvas or Stack axes.
//
// Normally this is enough information to position an artefact in its container. However there may be times when we need to move the artefact's R-R point a given distance along the container axes. We can achieve this by giving the artefact an __offset__ coordinate.
// + __absolute__ offsets - where we give the artefact a distance, measured in pixels from its top left corner. 
// + __relative__ offsets - where we supply the artefact with percentage distances measured against the ___container's dimensions___.
// + __reference__ offsets.
//
// An artefact can have both a handle and an offset; handle distances move the R-R point along the artefact's axes (which may be diagonal lines), while offsets move it along the container's axes.
//
// ##### Artefact dimensions
// Another use for Coordinate Arrays is to __set the artefact's dimensions - their width and height values__. In this case we can think of the coordinate in terms of `[w, h]`. All artefacts, except Shape and Loom entitys, require dimension data.
//
// Just as for positioning data, an artefact's dimensions data can be supplied in absolute, relative or reference terms:
// + __absolute__ dimensions - where we give the artefact a width and height, measured in pixels from its top left corner. 
// + __relative__ dimensions - where we supply the artefact with percentage widths and height values, measured against the ___container's dimensions___.
// + __reference__ dimensions.
//
// ##### Artefact pseudo-attributes
// Scrawl-canvas uses the following pseudo-attributes to make working with Coordinates easier:
// + __startX__ and __startY__ - for getting and setting the `start` (R-R) Coordinate values
// + __handleX__ and __handleY__ - for getting and setting the `handle` Coordinate values
// + __offsetX__ and __offsetY__ - for getting and setting the `offset` Coordinate values
// + __width__ and __height__ - for getting and setting the `dimensions` Coordinate values
//
// Scrawl-canvas also supports the following ___pseudo-values___, which can be used when setting __relative__ coordinates:
// + `['left', 'top']` == `['0%', '0%']`
// + `['center', 'center']` == `['50%', '50%']`
// + `['bottom', 'right']` == `['100%', '100%']`
//
// ```
// // The following code creates a block entity
// // - half the width and height of its canvas
// // - positioned in the middle of the canvas:
// scrawl.makeBlock({
//
//     name: 'my-block',
//
//     startX: 'center',
//     startY: 'center',
//
//     handleX: 'center',
//     handleY: 'center',
//
//     width: '50%',
//     height: '50%',
//
//     lineWidth: 10,
//     fillStyle: 'blue',
//     strokeStyle: 'red',
//
//     method: 'fillThenDraw',
// });
// ```
//
// ##### Referencing other artefacts
// Scrawl-canvas allows an artefact to reference other artefacts. The referenced objects supply data back to the first artefact, which it then uses to update its position and dimensions. 
// + This all happens automatically once the reference is set up, with updates occuring as part of the Scrawl-canvas __Display cycle__.
// + To move a group of artefacts as a single unit, we can set up one as the reference artefact, with the rest using handles and offsets to supply distancing data from the reference. Updates to the reference artefact will now be transmitted automatically to all artefacts using it as their `pivot` or `mimic`.
// 
// We __create a reference__ by setting the value of one or more of the following attributes to a reference artefact's name-String, or to the object itself:
// + `pivot` - once set, we can then use the referenced artefact's __start__ coordinate as this artefact's start value. With appropriate flags set, we can add this artefact's __handle__ and __offset__ coordinates to the start value.
// + `mimic` - extends the 'pivot' concept to include dimensions, alongside adding this artefact's data to the referenced artefact's data in various ways.
// + `path` - use a Shape entity's path to determine this artefact's position and rotation values.
//
// We __action a reference__ by setting this artefact's `lockTo` Array attribute. Ther lock array is similar to coordinate Arrays: it is a two-element array of Strings in the form `[x-lock, y-lock]`. Five lock strings are supported:
// + `start` - use this artefact's own start (and other) values
// + `pivot` - use the pivot reference artefact's start (and other) values
// + `mimic` - use the mimic reference artefact's start (and other) values
// + `path` - use the Shape entity's path to calculate this artefact's start (and rotation) values
// + `mouse` - use the mouse/touch cursor's current position as the reference for this artefact's start value
//
// The __lockTo__ Array supports the pseudo-attributes __lockXTo__ and __lockYTo__ to make working with it easier.
// + Setting `lockTo` sets both elements of the Array to the supplied String
// + `lockXTo` and `lockYTo` allow us to separate the x and y coordinates
//
// For instance if we set the lock to `['start', 'mouse']` we can make the artefact track the mouse across the container along an (invisible) vertical line, whose position is determined by the artefact's x coordinate value.
//
// ##### Artefact rotation
// Scrawl-canvas artefacts can be rotated around their __Rotation-Reflection point__: 
// + Entity artefacts, being representations of 2-dimensional graphical shapes drawn on a &lt;canvas> element, are restricted to rotating around the R-R point's ___z-axis___.
// + Other artefacts, when part of a Stack container, can be rotated in 3 dimensions along the R-R point's ___x-axis___, ___y-axis___ and ___z-axis___.
//
// Scrawl canvas measures rotations in __degrees__, not radians. An artefact's rotation values are stored in the following attributes:
// + __roll__ - for `z-axis` rotations
// + __yaw__ - for `y-axis` rotations
// + __pitch__ - for `x-axis` rotations
//
// These __euler__ attributes are named after the [Aircraft principal axes](https://en.wikipedia.org/wiki/Aircraft_principal_axes) - mainly because I find it difficult to keep the mathematical representations in my head when thinking about rotations in 3 dimensions, but an image of an aircraft is a lot easier to visualize.
// + Internally, Scrawl-canvas stores rotational data in [Quaternion objects](../factory/quaternion.html) rather than in matrices. 
// 
// Instead of 3D rotations, entity artefacts have two Boolean flags - __flipReverse__, __flipUpend__ - which determine the orientation of the entity when it stamps itself on the display. 
// + a `reversed` entity is effectively flipped 180&deg; around a vertical line passing through that entity's rotation-reflection (start) point - a face looking to the right will now look to the left
// + an `upended` entity is effectively flipped 180&deg; around a horizontal line passing through that entity's rotation-reflection (start) point - a normal face will now appear upside-down
// 
// We can ___emulate 3D rotations for Picture entity artefacts___ using the [Loom entity](../factory/loom.html) - see Demo [DOM-015](../../demo/dom-015.html) for an example of this in action.
//
// ##### Collision detection
// The Scrawl-canvas collision detection system is entirely artefact-based
// + By default, the CD system is disabled for artefacts
// + However every artefact includes a `checkHit` function which reports whether a given Coordinate is in collision with it, using the Canvas API CanvasRenderingContext2D [isPointInPath](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath) function.
// + We can enable an artefact's CD functionality by setting its __collides__ flag.
// + When the `collides` flag is enabled, the artefact will (re)generate a set of __sensor point coordinates__ as part of any changes to its position and rotation.
// + These sensor points sit along the artefact's ___stroke path___; their density is determined by the value of its __sensorSpacing__ attribute (default: 50px)
// + The collision detection functionality itself is mediated by Group objects; we can get an artefact to feed in its sensor points to the Group's `getArtefactAt` or `getAllArtefactsAt` functions, which return a __hit report object__, or an Array of such objects, or false if no hits are detected.
//
// See Demos [Canvas-019](../../demo/canvas-019.html) and [DOM-013](../../demo/dom-013.html) for examples of this functionality in action.

// #### Imports
import { artefact, group, tween } from '../core/library.js';
import { defaultNonReturnFunction, mergeOver, mergeInto, mergeDiscard, 
    isa_obj, isa_number, isa_boolean, xt, xta, xto, xtGet, 
    addStrings, pushUnique, removeItem } from '../core/utilities.js';
import { currentCorePosition } from '../core/userInteraction.js';

import { makeCoordinate } from '../factory/coordinate.js';
import { requestCell, releaseCell } from '../factory/cell.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

// __group__ - every Scrawl-canvas artefact should belong to at least one Group, and can belong to more than one Group. Groups can be used for a variety of purposes, and play a major role in the __Display cycle__ and in __collision detection__.
// + Most group-related functionality takes place elsewhere. An artefact's `group` attribute is used mainly as a 'convenience handle', to make moving an artefact from one Group to another a bit easier.
// + As part of an artefact's initialization, the code will assign the artefact to a Group. We can indicate which Group to assign the new artefact to by setting the argument attribute to the Group's name attribute String, or to the Group itself - the set code will automatically update this attribute to a reference to the Group object:
//
// ```
// let myGroup = scrawl.buildGroup({
//     name: 'my-first-group',
// });
//
// let myBlock = scrawl.makeBlock({
//     group: myGroup,
// });
// ```
// + Similarly the __set__ function's object argument can accept a name String, or the new group's object itself:
//
// ```
// myBlock.set({
//     group: 'my-first-group',
// });
// ```
// + If no group value is supplied when building a new __entity__, then the ___current group___ will be assigned as the entity's group. This is a Scrawl-canvas 'global' value which will update whenever the user sets a Canvas wrapper as the current canvas:
//
// ```
// scrawl.setCurrentCanvas('my-other-canvas');
// ```
// + For some Canvas and Stack wrappers, the value of their group attribute will be set to `root` - this indicates that the wrapper's DOM element is not contained within another Stack.
// + TODO: we need to decide whether we want a user-available scrawl.setCurrentStack function and, if yes, how that will impact on the core/document.js __currentGroup__ variable exported by that module - given that we will then have both currentStack and currentCanvas variables, but only one currentGroup variable shared between them.
        group: null,


// The __visibility__ attribute is a boolean flag (default: true); when the flag is set, the Display cycle functionality will run on the artefact. If the attribute's value is false, then the Display cycle functionality will ignore the artefact. This has the following effects:
// + for DOM-based artefacts, the dom element will have its CSS tweaked to hide the element (`display: block` switches to `display: none`).
// + for canvas-based entitys, the entity will be ignored during the Display cycle's `compile` step's Promise cascade.
        visibility: true,


// The __order__ attribute - an integer Number (default: 0) - determines the order in which an artefact will be processed as part of a Group. 
// + For instance, entity artefacts with higher order values will be processed after those with lower values, with the effect that the entity will be displayed on top of those other entitys (and stamping over them if they overlap)
// + Note that Group objects also have an order attribute: all artefacts in a Group with a lower order value will be processed before those with a higher order value.
// + Cell wrappers (a Canvas wrapper can have more than one Cell) have a `compileOrder` attribute which does the same job.
// + Finally, Animation objects have order values; the same effect applies.
// + ___If the display of an artefact does not appear to be following the order value it has been given___, the problem may lie in either the order values assigned to that artefact's Group, or host (Cell, Canvas, Stack), or even the Animation object that contributes to the Display cycle.
        order: 0,


// The __start__ attribute represents an artefact's ___Rotation-Reflexion point___, and is held in an `[x, y]` Coordinate Array. The default values are `[0, 0]`, placing the artifact at the container object's (Cell, Stack) top-left corner.
// ```
// let myBlock = scrawl.makeBlock({
//     startX: 20,
//     startY: 'center',
// });
//
// myBlock.set({
//     start: [-100, '-12%'],
// });
//
// myBlock.set({
//     start: {
//         x: 'left',
//         y: 388.5,
//     },
// });
//
// // Don't use string labels ('top', 'left', etc) when delta setting
// myBlock.setDelta({
//     startX: '-0.05%',
// });
//
// myBlock.setDelta({
//     start: [1, '0.5%'],
// });
// ```
// + Start values DO NOT respect the artefact's `scale` attribute.
        start: null,


// The __handle__ attribute represents a distance from the artefact's ___Rotation-Reflexion___ point, measured along the ___artefact's local axes___. It is held in an `[x, y]` Coordinate Array. The default values are `[0, 0]`.
// + Handle values WILL respect the artefact's `scale` attribute.
        handle: null,


// The __offset__ attribute represents an offset from the artefact's ___Rotation-Reflexion___ point, measured along the ___container's axes___. It is held in an `[x, y]` Coordinate Array. The default values are `[0, 0]`.
// + Offset values DO NOT respect the artefact's __scale__ attribute.
// + the _pseudo-values_ `top`, `center`, etc have no meaning in the context of offsets.
        offset: null,


// The __dimensions__ attribute represents the artefact's __width__ and __height__. It is held in a `[w, h]` Coordinate Array. The default values vary between different types of artefact.
// + Dimensions values WILL respect the artefact's `scale` attribute.
        dimensions: null,

// __delta__ - a Javascript object containing `{key:value, key:value, etc}` attributes. 
// + As part of the Display cycle, delta values get added to artefact attribute values - this is a very simple form of animation.
// + __noDeltaUpdates__ - Boolean flag to switch off the automatic application of delta attribute values as part of each iteration of the Display cycle.
// + Delta updates can be invoked independently from the Display cycle by invoking `artefact.updateByDelta`, `artefact.reverseByDelta`.
// + In addition to using `artefact.set`, we can also update the delta object values using `artefact.setDeltaValues`.
//
// ```
// // This Block artefact will animate itself across the <canvas> element
// // - it will move to the right and upwards until the `delta` values are updated
// // - animation will stop when the `noDeltaUpdates` flag is set
// let myBlock = scrawl.makeBlock({
//     start: ['left', 500],
//     delta: {
//         startX: 0.5,
//         startY: '-0.3',
//     },
//     noDeltaUpdates: false,
// });
// ```
        delta: null,
        noDeltaUpdates: false,

// __pivot__ - reference artefact object. Can also be set using the artefact's name-String.
        pivot: '',

// __pivotCorner__ - Element artefacts allow other artefacts to use their corner positions as pivots, by setting this attribute to `topLeft`, `topRight`, `bottomRight` or `bottomLeft`; default is `''` to use the Element's start coordinate.
        pivotCorner: '',  

// __pivotPin__ - Polyline entitys are composed of a set of pin coordinates with the start being pin[0]; can reference other pins by setting this attribute to the appropriate index value (for example, the second pin will be pin[1]).
        pivotPin: 0,

// __pivoted__ - internal Array holding details of the artefacts using this artefact as their pivot reference.
        pivoted: null,

// __addPivotHandle__, __addPivotOffset__, __addPivotRotation__ - Boolean flags. When set, the artifact will add its own values to the reference artefact's values, rather than use them as replacement values.
        addPivotHandle: false,
        addPivotOffset: true,
        addPivotRotation: false,

// __path__ - reference Shape entity object. Can also be set using the Shape's name-String.
        path: '',

// __pathPosition__ - float Number between `0.0` - `1.0` representing the distance along the Shape path which is to be used as the reference coordinate.
        pathPosition: 0,

// __addPathHandle__, __addPathOffset__, __addPathRotation__ - Boolean flags. When set, the artifact will add its own values to the reference artefact's values, rather than use them as replacement values.
        addPathHandle: false,
        addPathOffset: true,
        addPathRotation: false,

// __mimic__ - reference artefact object. Can also be set using the artefact's name-String.
        mimic: '',

// __mimicked__ - internal Array holding details of the artefacts using this artefact as their mimic reference.
        mimicked: null,

// __useMimic...__ - a set of Boolean flags determining which attributes should be taken from the mimic reference artefact. By default, the artefact will use its own attribute values; setting any of these flags changes the behaviour for that attribute.
        useMimicDimensions: false,
        useMimicScale: false,
        useMimicStart: false,
        useMimicHandle: false,
        useMimicOffset: false,
        useMimicRotation: false,
        useMimicFlip: false,

// __addOwn...ToMimic__ - a set of Boolean flags determining which mimic attributes should be added to this artefact's own attribute values. By default, none are added; setting any of these flags changes the behaviour for that attribute.
        addOwnDimensionsToMimic: false,
        addOwnScaleToMimic: false,
        addOwnStartToMimic: false,
        addOwnHandleToMimic: false,
        addOwnOffsetToMimic: false,
        addOwnRotationToMimic: false,


// __lockTo__ - `[x-lock, y-lock]` Array; locks can be set to: `start` (the default), `pivot`, `path`, `mimic`, or `mouse`.
// + The lock values can be set individually using the pseudo-attributes __lockXTo__ and __lockYTo__.
        lockTo: null,


// All artefacts (except compound entities such as Loom) can be scaled by setting their __scale__ attribute to an appropriate float Number value:
// + A value of __0__ effectively makes the artefact disappear from the display (though setting the artefact's __visibility__ flag to false is a more efficient approach).
// + Scale value __less than 1__ will shrink the artefact around its rotation-reflection point.
// + Setting the value to __1__ (the default) removes all scaling effects on the artefact.
// + Values __greater than 1__ will expand the artefact around its rotation-reflection point.
        scale: 1,

// __roll__ - float Number representing the artefact's rotation around the `z-axis` of its ___Rotation-Reflection point___.
// + values represent ___degrees___, not radians.
// + Some effort is made in the code to keep this value within the bounds of `-360` and `+360`. Value is measured in degrees (not radians!)
        roll: 0,

// __collides__ - by default, artefacts do not perform collision detection; it has to be switched on by setting this Boolean flag.
// + mouse/touch cursor position detection over the artefact - for a range of functionalities including _drag-and-drop_, hover state, etc - is enabled by default and cannot be switched off.
        collides: false,

// __sensorSpacing__ - integer Number value representing the distance (measured in px) between collision detection sensors placed along the artefact's stroke path.
        sensorSpacing: 50,


// ##### Animation speed
//
// Scrawl-canvas assumes that an artefact will be _ready for anything_. However if we know beforehand that an artefact will not be requiring certain functionalities, we can switch them off; this will help make the artefact render more quickly. These __noXXX__ flags include:
//
// + __noUserInteraction__ - switch off basic collision functionality (used by 'drag-and-drop') and ongoing update calculations.
//
// + __noPositionDependencies__ - short-circuit the position calculations associated with pivot, mimic, path and mouse positioning.
//
// + __noCanvasEngineUpdates__ - specifically for canvas entity artefacts, skip updating the host Cell wrapper's CanvasRenderingContext2D engine with the entity's [State](../factory/state.html) attributes - meaning that the entity will use the previously stamped entity's State values.
//
// + __noFilters__ - skip the checks for, and application of, [Filters](../factory/filter.html) to the entity artefact - even if filters have been added to the entity.
//
// + __noPathUpdates__ - only calculate the artefact's path once - this disables updates to the artefact's handle and scale attributes.
        noUserInteraction: false,
        noPositionDependencies: false,
        noCanvasEngineUpdates: false,
        noFilters: false,
        noPathUpdates: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
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


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
    P.kill = function () {

        let myname = this.name

        // Remove artefact from all groups
        Object.entries(group).forEach(([name, grp]) => {

            if (grp.artefacts.indexOf(myname) >= 0) grp.removeArtefacts(myname);
        });

        // If the artefact has an anchor, it needs to be removed
        if (this.anchor) this.demolishAnchor();

        // Remove from other artefacts
        Object.entries(artefact).forEach(([name, art]) => {

            if (art.name !== myname) {

                if (art.pivot && art.pivot.name === myname) art.set({ pivot: false});
                if (art.mimic && art.mimic.name === myname) art.set({ mimic: false});
                if (art.path && art.path.name === myname) art.set({ path: false});

                if (Array.isArray(art.pins)) {

                	art.pins.forEach((item, index) => {

                		if (isa_obj(item) && item.name === myname) art.removePinAt(index);
                	});
                }
            }
        });

        // Remove from tweens and actions targets arrays
        Object.entries(tween).forEach(([name, t]) => {

            if (t.checkForTarget(myname)) t.removeFromTargets(this);
        });

        // Factory-specific actions required to complete the kill
        this.factoryKill();
        
        // Remove artefact from the Scrawl-canvas library
        this.deregister();
        
        return this;
    };

// Specific factories can overwrite this function to perform additional actions required to clean themselves from the Scrawl-canvas system
    P.factoryKill = defaultNonReturnFunction;



// #### Get, Set, deltaSet
// + The getter functions return the __current, pixel-based values__ for the `start`, `handle`, `offset` and `dimensions` attribute Coordinates.
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;

// __start__, __startX__, __startY__
    G.startX = function () {

        return this.currentStart[0];
    };
    G.startY = function () {

        return this.currentStart[1];
    };
    G.start = function () {

        return [].concat(this.currentStart);
    };
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

// __handle__, __handleX__, __handleY__
    G.handleX = function () {

        return this.currentHandle[0];
    };
    G.handleY = function () {

        return this.currentHandle[1];
    };
    G.handle = function () {

        return [].concat(this.currentHandle);
    };
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

// __offset__, __offsetX__, __offsetY__
    G.offsetX = function () {

        return this.currentOffset[0];
    };
    G.offsetY = function () {

        return this.currentOffset[1];
    };
    G.offset = function () {

        return [].concat(this.currentOffset);
    };
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

// __dimensions__, __width__, __height__
    G.width = function () {

        return this.currentDimensions[0];
    };
    G.height = function () {

        return this.currentDimensions[1];
    };
    G.dimensions = function () {

        return [].concat(this.currentDimensions);
    };
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

// __sensorSpacing__
    S.sensorSpacing = function (val) {

        this.sensorSpacing = val;
        if (this.collides) this.dirtyCollision = true;
    };
    D.sensorSpacing = function (val) {

        this.sensorSpacing += val;
        if (this.collides) this.dirtyCollision = true;
    };


// __pivot__
    S.pivot = function (item) {

        if (isa_boolean(item) && !item) {

            this.pivot = null;

            if (this.lockTo[0] === 'pivot') this.lockTo[0] = 'start';
            if (this.lockTo[1] === 'pivot') this.lockTo[1] = 'start';

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
        else {

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
        }
    };


// __pivotCorner__
    P.pivotCorners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    S.pivotCorner = function (item) {

        if (this.pivotCorners.indexOf(item) >= 0) this.pivotCorner = item;
    };


// __addPivotHandle__, __addPivotOffset__, __addPivotRotation__
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


// __path__
    S.path = function (item) {

        if (isa_boolean(item) && !item) {

            this.path = null;

            if (this.lockTo[0] === 'path') this.lockTo[0] = 'start';
            if (this.lockTo[1] === 'path') this.lockTo[1] = 'start';

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
        else {

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
        }
    };

//  __pathPosition__
// + TODO: current functionality is for pathPosition to loop - is there a case for adding a pathPosition loop flag? If yes, then when that flag is false values < 0 would be corrected back to 0, and vals > 1 would be corrected back to 1.
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


// __addPathHandle__, __addPathOffset__, __addPathRotation__
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


// __mimic__
    S.mimic = function (item) {

        if (isa_boolean(item) && !item) {

            this.mimic = null;

            if (this.lockTo[0] === 'mimic') this.lockTo[0] = 'start';
            if (this.lockTo[1] === 'mimic') this.lockTo[1] = 'start';

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
        else {

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
        }
    };


// __useMimicDimensions__, __useMimicScale__, __useMimicStart__, __useMimicHandle__, __useMimicOffset__, __useMimicRotation__
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

// __addOwnDimensionsToMimic__, __addOwnScaleToMimic__, __addOwnStartToMimic__, __addOwnHandleToMimic__, __addOwnOffsetToMimic__, __addOwnRotationToMimic__
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
            

// __lockXTo__, __lockYTo__, __lockTo__
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

// __roll__
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


// __scale__
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

// __delta__
    S.delta = function (items = {}) {

        if (items) this.delta = mergeDiscard(this.delta, items);
    };

// __host__ - internal function
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

// __group__
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


// #### Prototype functions

// `initializePositions` - Internal function called by all artefact factories 
// + Setup initial Arrays and Objects, including `current...` and `...Subscriber` Arrays.
// + Create a variety of `dirty...` flags, setting them all to true. 
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


// `setCoordinateHelper` - internal helper function used by positional and dimensional setter (S.) functions. Arguments are:
// + __label__ - either `dimensions`, `start`, `handle` or `offset`
// + __x__ - this can be either an `[x, y]` Array, or an `{x: val, y: val}` object, or a Number, or %String value
// + (for dimensions, `[w, h]`, or `{w: val, h: val}`, or `{width: val, height: val}`, etc)
// + __y__ - if `x` is a Number or String, then `y` should also be a Number or String
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


// `setCoordinateHelper` - internal helper function used by positional and dimensional delta-setter (D.) functions. Arguments are:
// + __label__ - either `dimensions`, `start`, `handle` or `offset`
// + __x__ - this can be either an `[x, y]` Array, or an `{x: val, y: val}` object, or a Number, or %String value
// + (for dimensions, `[w, h]`, or `{w: val, h: val}`, or `{width: val, height: val}`, etc)
// + __y__ - if `x` is a Number or String, then `y` should also be a Number or String
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

// `updateByDelta` - this function gets called as part of every display cycle iteration, meaning that if an attribute is set to a non-zero value in the __delta__ attribute object then those __delta animations__ will start playing immediately.
    P.updateByDelta = function () {

        this.setDelta(this.delta);

        return this;
    };


// `reverseByDelta` - The opposite action to 'updateByDelta'; values in the __delta__ attribute object will be subtracted from the current value for that Scrawl-canvas object.
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

// `setDeltaValues`
// + TODO - the idea is that we can do things like 'add:1', 'subtract:5', 'multiply:6', 'divide:3.4', etc
// + for this to work, we need to do do work here to split the val string on the ':'
// + for now, just do reverse and zero numbers
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


// `getHost` - internal function - return the __host__ object. Hosts can be various things, for instance:
// + Element wrapper will have a Stack as its host
// + Stack and Canvas wrappers can also have a Stack host
// + Cells will have either a Canvas, or another Cell, as their host
// + Entity artefacts will use a Cell as their host
//
// All of the above can exist without a host (though in many cases this means they don't do much). Stack and Canvas wrappers will often be unhosted, sitting as `root` elements in the web page DOM
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


// `getHere` - the __here__ parameter is owned by Canvas, Stack and (if enabled) Element artefacts and is set on them by calling `updateUiSubscribedElement` - thus not defined or updated by the artefact itself.
//
// ```
// here {x, y, w, h, normX, normY, offsetX, offsetY, type, active}
// ```
//
// Cell assets also have a __here__ parameter, defined and updated by themselves with reference to their current Canvas host
// ```
// here {x, y, w, h, xRatio, yRatio}
// ```
// + NOTE: Canvas, Stack, Element (if enabled) and Cell all need to create their `here` attribute immediately after they first calculate their `currentDimensions` Coordinate, which needs to happen as part of the constructor!
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

// #### Clean functions
// Clean functions are triggered by artefacts as they prepare to stamp themselves into their host environment. The decision to trigger a clean function is mediated by various `dirty...` flags, which get set when the artefact is updated via `set` and `deltaSet` calls.

// `cleanPosition` - internal helper function used by `cleanStart`, `cleanHandle` and `cleanOffset` functions
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


// `cleanScale` - set the artefact's __currentScale__ value.
// + Scaling has widespread effects across a range of the artefact's other positional and display attributes.
// + Artefacts may use other artefacts to set their own scale values - `mimic`, `pivot`
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


// `cleanDimensions` - calculate the artefact's __currentDimensions__ Array
// + Dimensions DO scale - but scaling happens elsewhere
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


// `cleanDimensionsAdditionalActions` - overwritten by some artefact factory files
    P.cleanDimensionsAdditionalActions = defaultNonReturnFunction;


// `cleanLock` - clean function for __lockTo__ array
    P.cleanLock = function () {

        this.dirtyLock = false;

        this.dirtyStart = true;
        this.dirtyHandle = true;
    };


// `cleanStart` - calculate the artefact's __currentStart__ Array
// + Start values do NOT scale
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


// `cleanOffset` - calculate the artefact's __currentOffset__ Array
// + Offset values do NOT scale
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


// `cleanHandle` - calculate the artefact's __currentHandle__ Array
// + Handle values DO scale - but scaling happens elsewhere:
// + DOM elements (Stack, Element, Canvas) manage handle offset in their CSS `transform` string
// + Entities manage it as part of each entity's `cleanPath` calculation
    P.cleanHandle = function () {

        this.dirtyHandle = false;

        let current = this.currentHandle;

        this.cleanPosition(current, this.handle, this.currentDimensions);
        this.dirtyStampHandlePositions = true;

        if (this.mimicked && this.mimicked.length) this.dirtyMimicHandle = true;
    };


// `cleanRotation` - calculate the artefact's __currentRotation__ value
// + For entity artefacts, the value is a Number
// + For DOM-based artefacts, the value will be a Quaternion object
// + This function only handles the __roll__ attribute; it is overwritten in the [dom mixin](./dom.html) to extend coverage to __yaw__ and __pitch__ attributes
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


// `cleanStampPositions` 
// + the __currentStampPosition__ Coordinate represents the combination of __start__ and __offset__ Coordinates to determine the current value of the artefact's _Rotation-Reflection point_.
// + The calculation does not take into account the __handle__ Coordinate which, for entity artefacts, gets applied after the canvas engine transformation is performend for its stamp operation.
// + DOM-based artefacts will also take handle values into consideration after the fact.
// + The `x` and `y` coordinates are handled separately, and are dependant on the the lock set for each in the __lockTo__ Array.
// + Artefacts that are currently in __drag mode__ (whose lock values are temporarily overridden) also need to take into account drag offset values.
// + Rotation and flip attributes are handled separately, alongside handle values, as part of the actual stamp operation.
// + If either __currentStampPosition__ coordinate changes as a result of this function, the `dirtyPositionSubscribers` flag will be set so that the change can be cascaded to any artefacts using this one as a `pivot` or `mimic` for their start or offset values.
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
                
                // `x` and `y` coordinates can have different lockTo values
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

            // We loop twice - once for each coordinate: `x` is calculated on the first loop (`i === 0`); `y` on the second (`i === 1`)
            for (i = 0; i < 2; i++) {

                lock = localLockArray[i];

                switch (lock) {

                    case 'pivot' :

                    	// When the pivot is an Element artefact, can use its corner values as pivots
                        if (this.pivotCorner && pivot.getCornerCoordinate) {

                            coord = pivot.getCornerCoordinate(this.pivotCorner, (i) ? 'y' : 'x');
                        }

                        // When the pivot is a Polyline entity, need also to confirm which pin to use (default 0)
                        else if (pivot.type === 'Polyline') {

                        	coord = pivot.getPinAt(this.pivotPin, (i) ? 'y' : 'x');
                        }

                        // Everything else
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
                            if (this.collides) this.dirtyCollision = true;
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


// `cleanStampPositionsAdditionalActions` - some artefact types need to perform additional calculations to finalize the values in the __currentStampPosition__ array. Those factory functions will overwrite this function as required.
    P.cleanStampPositionsAdditionalActions = defaultNonReturnFunction;


// `cleanStampHandlePositions` 
// + an entity's __currentStampHandlePosition__ values get applied after the canvas grid has been set up for the stamp operation. 
// + Entities include handle values as part of their 'path' calculation.
// + DOM-based artefacts include handle values as part of their CSS transform string.
// + Handle values DO scale, but not here; that happens when the transform/path is recalculated.
// + If either currentStampHandlePosition coordinate changes as a result of this function, the `dirtyPositionSubscribers` flag will be set so that the change can be cascaded to any artefacts using this one as a pivot or mimic for their start, handle or offset values.
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

            // We loop twice - once for each coordinate: `x` is calculated on the first loop (`i === 0`); `y` on the second (`i === 1`)
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
        
        // At the moment only Shape type artefacts require additional calculations to complete the cleanHandle functionality. 
        // + If this changes, then we should amend code so that we pass code flow to a `cleanStampHandlePositionsAdditionalActions` function, then move this `if` statement into an override of that function in the mixin/shape.js module file.
        if (this.type === 'Shape') {

            let box = this.localBox;
            stampHandle[0] += box[0];
            stampHandle[1] += box[1];
        }

        if (oldX !== stampHandle[0] || oldY !== stampHandle[1]) this.dirtyPositionSubscribers = true;

        if (this.domElement && this.collides) this.dirtyPathObject = true;
    };

// #### Collision functionality

// `cleanCollisionData`
// + We only need to recalculate collisions data when the artefact has been asked to perform some collision detection functionality - it does not happen as part of the Display cycle
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

// `calculateCollisionRadius`
// We can use the __currentCollisionRadius__ attribute to quickly calculate whether two given artefacts are capable of intersecting, before proceeding to check if they do intersect (assuming they can)
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

            // BUG: fails for DOM-based artefacts (Stack, Canvas, Element) whose computed height is `0` - because: `auto`?
            radii.push(Math.sqrt(((sx - lx) * (sx - lx)) + ((sy - ty) * (sy - ty))));
            radii.push(Math.sqrt(((sx - rx) * (sx - rx)) + ((sy - by) * (sy - by))));
            radii.push(Math.sqrt(((sx - lx) * (sx - lx)) + ((sy - by) * (sy - by))));
            radii.push(Math.sqrt(((sx - rx) * (sx - rx)) + ((sy - ty) * (sy - ty))));

            this.currentCollisionRadius = Math.ceil(Math.max(...radii));
        }
    };

// `calculateSensors` - internal function - overwritten by various artefact factories to meet their specific requirements
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


// `getSensors`
    P.getSensors = function () {

        let [entityRadius, entitySensors] = this.cleanCollisionData();
        return entitySensors;
    }

// `getPathData`
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


// `checkHit`
// + We use pool Cells (see [Cell code](../factory/cell.html)) to help calculate whether (any of) the Coordinate(s) supplied in the first argument are colliding with the artefact. 
// + This works both for entitys and for DOM-based artefacts.
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

            let r = this.checkHitReturn(tx, ty, mycell);

            if (poolCellFlag) releaseCell(mycell);

            return r;
        }
        
        if (poolCellFlag) releaseCell(mycell);
        
        return false;
    };

    // Function overwritten by entitys, if required
    P.checkHitReturn = function (x, y, cell) {

        return {
            x: x,
            y: y,
            artefact: this
        };
    };

// `pickupArtefact`
P.pickupArtefact = function (items = {}) {

    let {x, y} = items;

    if (xta(x, y)) {

        this.isBeingDragged = true;
        this.currentDragCache.set(this.currentDragOffset);

        if (this.lockTo[0] === 'start') {
            this.currentDragOffset[0] = this.currentStart[0] - x;
        }
        else if (this.lockTo[0] === 'pivot' && this.pivot) {
            this.currentDragOffset[0] = this.pivot.get('startX') - x;
        }
        else if (this.lockTo[0] === 'mimic' && this.mimic) {
            this.currentDragOffset[0] = this.mimic.get('startX') - x;
        }

        if (this.lockTo[1] === 'start') {
            this.currentDragOffset[1] = this.currentStart[1] - y;
        }
        else if (this.lockTo[1] === 'pivot' && this.pivot) {
            this.currentDragOffset[1] = this.pivot.get('startY') - y;
        }
        else if (this.lockTo[1] === 'mimic' && this.mimic) {
            this.currentDragOffset[1] = this.mimic.get('startY') - y;
        }

        this.order += 9999;

        this.group.batchResort = true;

        if (xt(this.dirtyPathObject)) this.dirtyPathObject = true;
    }
    return this;
};

// `dropArtefact`
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

// #### Subscription management
// Artefacts can subscribe to other artefacts so that they can be notified when a particular attribute changes. 
// + This notification happens when an artefact completes cleaning its attributes and detects that there have been changes which other artefacts need to be aware.
// + The artefact doesbn't change any values in artefacts which have subscribed to them - unlike asset objects, which do directly update attribute values in their subscribing artefacts. 
// + Instead, the artefact sets the appropriate `dirty` flags which the subscribing artefacts can process as they progress through the Display cycle.
// + Because the update functionality cascades from one controlling function - `updatePositionSubscribers` - we also define a range of subsidiary functions here 
// + TODO: some of the subsidiary functions should be moved to more appropriate factory code?

// `updatePositionSubscribers`
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

// `updateControlSubscribers`
    P.updateControlSubscribers = function () {

        this.controlSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyControl = true;
        });
    };

// `updateStartControlSubscribers`
    P.updateStartControlSubscribers = function () {

        this.startControlSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyStartControl = true;
        });
    };

// `updateEndControlSubscribers`
    P.updateEndControlSubscribers = function () {

        this.endControlSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyEndControl = true;
        });
    };

// `updateEndSubscribers`
    P.updateEndSubscribers = function () {

        this.endSubscriber.forEach(name => {

            let instance = artefact[name];

            if (instance) instance.dirtyEnd = true;
        });
    };

// `updatePivotSubscribers`
    P.updatePivotSubscribers = function () {

        this.pivoted.forEach(name => {

            let instance = artefact[name];

            if (instance) {

                instance.dirtyStart = true;
                if (instance.addPivotHandle) instance.dirtyHandle = true;
                if (instance.addPivotOffset) instance.dirtyOffset = true;
                if (instance.addPivotRotation) instance.dirtyRotation = true;

                if (instance.type === 'Polyline') instance.dirtyPins = true;
            }
        });
    };

// `updateMimicSubscribers`
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


// `updatePathSubscribers`
    P.updatePathSubscribers = defaultNonReturnFunction;


// `updateImageSubscribers`
    P.updateImageSubscribers = defaultNonReturnFunction;

// Return the prototype
    return P;
};
