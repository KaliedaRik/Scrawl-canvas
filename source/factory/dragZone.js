// # Drag-and-drop zones.

import * as library from "../core/library.js";
import { xta, isa_fn, isa_boolean, isa_obj, λnull, Ωempty } from "../core/utilities.js";
import { addListener, removeListener } from "../core/events.js";

// __makeDragZone__ is an attempt to make setting up drag-and-drop functionality within a Scrawl-canvas stack or canvas as simple as possible. The functionality has been designed to allow multiple drag zones to be set on a canvas or stack element, while limiting the number of event listeners that need to be applied to the element to make the magic happen.
//
// Required attribute of the argument object:
// + __.zone__ - either the String name of the Stack or Canvas artefact which will host the zone, or the Stack or Canvas artefact itself
//
// Additional, optional, attributes in the argument object
// + __.coordinateSource__ - an object containing a `here` object
// + __.coordinateSource__ - an object containing a `here` object
// + __.collisionGroup__ - String name of Group object, or Group object itself
// + __.startOn__ - Array of Strings
// + __.endOn__ - Array of Strings
// + __.exposeCurrentArtefact__ - Boolean (default: false)
// + __.preventTouchDefaultWhenDragging__ - Boolean (default: false)
// + __.resetCoordsToZeroOnTouchEnd__ - Boolean (default: true)
// 
// At the heart of the drag zone are a set of functions (or alternatively, objects that can be applied to the selected artefact) which define the actions that happen when a user starts, continues and stops dragging an artefact in the zone. It is possible to set different actions depending on whether the user is pressing the shift button while they perform the drag action:
// + __.updateOnStart__, __.updateOnShiftStart__ - Function, or a `set` object to be applied to the current artefact
// + __.updateOnEnd__, __.updateOnShiftEnd__ - Function, or a `set` object to be applied to the current artefact
// + __.updateWhileMoving__, __.updateWhileShiftMoving__ - Function to be run while drag is in progress
// + __.updateOnPrematureExit__ - Function that will run when checks (defined in code elsewhere) trigger a premature exit from the drag zone. The triggering code can be used, for instance, to make sure an artefact does not leave a given area of the cell, within the canvas element boundaries
//
// Multiple drag zones can be defined on a canvas or stack element. When a user presses the mouse button to start a drag the code will interrogate each drag zone in turn to discover if one of them has an artefact which collides with the mouse cursor; if yes, that drag zone takes precedence for the subsequent move and drop actions
// + __.processingOrder__ - positive integer Number - drag zones with a lower value will be interrogated ahead of those with a higher value
//
// If the `exposeCurrentArtefact` attribute is true, the `makeDragZone` factory returns a function that can be invoked at any time to get the collision data object (containing x, y, artefact attributes) for the artefact being dragged (false if nothing is being dragged). The function can also be triggered with the following string arguments:
// + `'exit'` or `'drop` - force the drag action to end
// + any other truthy argument - kill the drag zone object. If it was the only drag zone object associated with a given canvas or stack element then the event listeners will also be removed from the element
// + null, undefined, any other falsy argument - return the collision data object
//
// If the `exposeCurrentArtefact` attribute is false, or omitted, the function returns a kill function that can be invoked (with no arguments) to remove the event listeners from the Stack or Canvas zone's DOM element.
// 
// NOTE: drag-and-drop functionality using this factory function __is not guaranteed__ for artefacts referencing a path, or for artefacts whose reference artefact in turn references another artefact in any way.
const dragZones = {};

// Generate the drag zone and associate it with the zone element
const processDragZoneData = function (items = Ωempty, doAddListeners, doRemoveListeners) {

    let {
        zone, 
        coordinateSource, 
        collisionGroup, 
        startOn, 
        endOn, 
        updateOnStart, 
        updateOnEnd, 
        updateWhileMoving, 
        updateOnShiftStart, 
        updateOnShiftEnd, 
        updateWhileShiftMoving, 
        updateOnPrematureExit,
        exposeCurrentArtefact, 
        preventTouchDefaultWhenDragging, 
        resetCoordsToZeroOnTouchEnd, 
        processingOrder,
    } = items;

    // `zone` is required
    // + must be either a Canvas or Stack wrapper, or a wrapper's String name
    if (!zone) return new Error('dragZone constructor - no zone supplied');

    if (zone.substring) zone = artefact[zone];

    if (!zone || ['Canvas', 'Stack'].indexOf(zone.type) < 0) return new Error('dragZone constructor - zone object is not a Stack or Canvas wrapper');

    let target = zone.domElement;

    if (!target) return new Error('dragZone constructor - zone does not contain a target DOM element');

    // `collisionGroup` is optional; defaults to zone's namesake group
    // + must be a Group object
    if (!collisionGroup) {

        if (zone.type === 'Canvas') collisionGroup = library.group[zone.base.name];
        else collisionGroup = library.group[zone.name];
    }
    else if (collisionGroup.substring) collisionGroup = library.group[collisionGroup];

    if (!collisionGroup || collisionGroup.type !== 'Group') return new Error('dragZone constructor - unable to recover collisionGroup group');

    // `coordinateSource` will be an object containing `x` and `y` attributes
    // + default's to the zone's `here` object
    if (coordinateSource) {

        if (coordinateSource.here) coordinateSource = coordinateSource.here;
        else if (!xta(coordinateSource.x, coordinateSource.y)) coordinateSource = false;
    }
    else {

        if (zone.type === 'Canvas') coordinateSource = zone.base.here;
        else coordinateSource = zone.here;
    }

    if (!coordinateSource) return new Error('dragZone constructor - unable to discover a usable coordinateSource object');

    // `startOn`, `endOn` - if supplied, then need to be arrays
    if (!Array.isArray(startOn)) startOn = ['down'];
    if (!Array.isArray(endOn)) endOn = ['up'];

    if (exposeCurrentArtefact == null) exposeCurrentArtefact = false;
    if (preventTouchDefaultWhenDragging == null) preventTouchDefaultWhenDragging = false;
    if (resetCoordsToZeroOnTouchEnd == null) resetCoordsToZeroOnTouchEnd = true;

    // `updateOnStart`, `updateOnEnd`, `updateOnShiftStart`, `updateOnShiftEnd` - if supplied, then needs to be key:value objects which will be applied to the entity (using set) or, alternatively, a callback function
    if (isa_obj(updateOnStart)) updateOnStart = function () { current.artefact.set(items.updateOnStart) };
    if (!isa_fn(updateOnStart)) updateOnStart = λnull;

    if (isa_obj(updateOnShiftStart)) updateOnShiftStart = function () { current.artefact.set(items.updateOnShiftStart) };
    if (!isa_fn(updateOnShiftStart)) updateOnShiftStart = updateOnStart;

    if (isa_obj(updateOnEnd)) updateOnEnd = function () { current.artefact.set(items.updateOnEnd) };
    if (!isa_fn(updateOnEnd)) updateOnEnd = λnull;

    if (isa_obj(updateOnShiftEnd)) updateOnShiftEnd = function () { current.artefact.set(items.updateOnShiftEnd) };
    if (!isa_fn(updateOnShiftEnd)) updateOnShiftEnd = updateOnEnd;

    // `updateWhileMoving`, `updateWhileShiftMoving` - if supplied, needs to be a callback function
    if (!isa_fn(updateWhileMoving)) updateWhileMoving = λnull;
    if (!isa_fn(updateWhileShiftMoving)) updateWhileShiftMoving = updateWhileMoving;

    // `updateOnPrematureExit` - if supplied, needs to be a callback function
    if (!isa_fn(updateOnPrematureExit)) updateOnPrematureExit = λnull;

    // `exposeCurrentArtefact` - if supplied, then needs to be a boolean
    if (!isa_boolean(exposeCurrentArtefact)) exposeCurrentArtefact = false;

    if (processingOrder == null) processingOrder = 0;

    // We can only drag one artefact at a time; that artefact - alongside the hit coordinate's x and y values -  is stored in the `current` variable
    let current = false;

    const checkE = function (e) {

        if (e && e.cancelable) {
            
            if (preventTouchDefaultWhenDragging && current) {

                e.preventDefault();
                e.returnValue = false;
            }
            else if (!preventTouchDefaultWhenDragging) {

                e.preventDefault();
                e.returnValue = false;
            }
        }
    };

    const pickup = function (e = Ωempty) {

        checkE(e);

        let type = e.type;
        if (type === 'touchstart' || type === 'touchcancel') touchAction(e, resetCoordsToZeroOnTouchEnd);

        current = collisionGroup.getArtefactAt(coordinateSource);

        if (current) {

            current.artefact.pickupArtefact(coordinateSource);
            if (e.shiftKey) updateOnShiftStart(e);
            else updateOnStart(e);
        }
        return {
            current,
            move,
            drop,
        };
    };

    const move = function (e = Ωempty) {

        if (current) {

            checkE(e);

            let type = e.type;
            if (type === 'touchmove') touchAction(e);

            if (e.shiftKey) updateWhileShiftMoving(e);
            else updateWhileMoving(e);
        }
    };

    const drop = function (e = Ωempty) {

        if (current) {

            checkE(e);

            let type = e.type;
            if (type === 'touchend') {

                touchAction(e, resetCoordsToZeroOnTouchEnd);
            }

            current.artefact.dropArtefact();
            if (e.shiftKey) updateOnShiftEnd(e);
            else updateOnEnd(e);
            current = false;
        }
    };

    if (!dragZones[zone.name]) {

        dragZones[zone.name] = [];
        doAddListeners(startOn, endOn, target);
    }

    const kill = function () {

        const name = `${zone.name}_${collisionGroup.name}_${processingOrder}`;

        dragZones[zone.name] = dragZones[zone.name].filter(z => z.name !== name);

        if (!dragZones[zone.name].length) {
            doRemoveListeners(startOn, endOn, target);
            delete dragZones[zone.name];
        }
    };

    const getCurrent = function (actionKill) {

        if (actionKill) {

            if (actionKill === 'exit' || actionKill === 'drop') {

                drop();
                updateOnPrematureExit();
            }
            else kill();
        }
        else return current;
    };

    const data = {
        name: `${zone.name}_${collisionGroup.name}_${processingOrder}`,
        exposeCurrentArtefact, 
        target,
        processingOrder,
        pickup,
        move,
        drop,
        kill,
        getCurrent,
    };

    dragZones[zone.name].push(data);

    dragZones[zone.name].sort((a, b) => a.processingOrder - b.processingOrder);

    return {
        exposeCurrentArtefact, 
        getCurrent,
        kill,
        zone,
    };
};

// `Exported function` (to modules and the SC object). Add drag-and-drop functionality to a canvas or stack wrapper.
export const makeDragZone = function (items = Ωempty) {

    // The exposed `pickup` function will search for the target element (if user has started the drag while the mouse cursor was over a child of the Stack wrapper) and then interrogate each drag zone associated with that target until it finds a zone reporting a hit
    const pickup = (e = Ωempty) => {

        if (e && e.target) {

            let myTarget = e.target,
                name = '';

            while (!name) {

                if (dragZones[myTarget.id]) name = myTarget.id;
                if (myTarget.tagName === 'BODY') break;
                myTarget = myTarget.parentElement;
            }

            const variants = dragZones[name];

            if (variants) {

                for (let i = 0, iz = variants.length; i < iz; i++) {

                    const v = variants[i];

                    const res = v.pickup(e);

                    if (res.current) {

                        currentMove = res.move;
                        currentDrop = res.drop;
                        break;
                    }
                }
            }
        }
    };

    // The exposed `move` and `drop` functions will change to match the equivalent funtions supplied by the zone selected during the `pickup` stage of the operation
    let currentMove = λnull;
    const move = (e = Ωempty) => {

        currentMove(e);
    };

    let currentDrop = λnull;
    const drop = (e = Ωempty) => {

        currentDrop(e);
        currentMove = λnull;
        currentDrop = λnull;
    };

    // Listeners are added to the DOM element when the first drag zone is created for that target
    const doAddListeners = (startOn, endOn, target) => {

        addListener(startOn, pickup, target);
        addListener('move', move, target);
        addListener(endOn, drop, target);
    };

    // Listeners are only removed from the DOM element when all the drag zones associated with that target have been killed
    const doRemoveListeners = (startOn, endOn, target) => {

        removeListener(startOn, pickup, target);
        removeListener('move', move, target);
        removeListener(endOn, drop, target);
    };

    const processedData = processDragZoneData(items, doAddListeners, doRemoveListeners);

    // Return the appropriate function based on the value of the `exposeCurrentArtefact` attribute
    if (processedData.exposeCurrentArtefact) return processedData.getCurrent;
    else return processedData.kill;
};
