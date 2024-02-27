// # Observe and update
// Okay, so I got very bored of writing boilerplate to react to various form elements user interactions across the demos. So I wrote some functions to setup (and take down) batches of DOM event listeners to make my life easier. These are:
// + scrawl.addNativeListener()
// + scrawl.removeNativeListener()
//
// Then there was the use case for reacting to various mouse (and touch) events, so I bundled all those up into a set of complementary functions:
// + scrawl.addListener()
// + scrawl.removeListener()
//
// Even so, there was still a lot of boilerplate code to write, in particular to listening for user interaction with form elements (which can be anywhere on the web page). So I further factorised that code into an __observeAndUpdate__ function which uses the listener functions internally.
//
// I have no idea how useful the observeAndUpdate function will be to anyone else. All I know is that it works for me and my demos, and that makes me happy.
//
// Note: observeAndUpdate() returns a function that will (in theory) remove all the bundled event listeners from their DOM elements when it is invoked. Not yet tested.

// `Exported function` (to modules and the scrawl object). Capture changes in a form and apply them to a target Scrawl-canvas artefact, asset, style, group, etc object
//
// __observeAndUpdate - example__
// ```
// scrawl.observeAndUpdate({
//
//     // The input event which will trigger the O&U
//     event: ['input', 'change'],
//
//     // CSS selector used to gather the DOM elements this O&U will be attached to
//     origin: '.controlItem',
//
//     // The SC artefact, or Group object, to be updated by user interaction changes
//     target: piccy,
//
//     // Performs an `addNativeListener` when true; `addListener` when false
//     useNativeListener: true,
//
//     // Invokes the event listener's `preventDefault` function
//     preventDefault: true,
//
//     // The SC artefact attributes to be updated by various DOM inputs. See below
//     updates: {
//
//         copy_start_xPercent: ['copyStartX', '%'],
//         copy_start_xAbsolute: ['copyStartX', 'round'],
//
//         copy_start_yPercent: ['copyStartY', '%'],
//         copy_start_yAbsolute: ['copyStartY', 'round'],
//
//         copy_dims_widthPercent: ['copyWidth', '%'],
//         copy_dims_widthAbsolute: ['copyWidth', 'round'],
//
//         copy_dims_heightPercent: ['copyHeight', '%'],
//         copy_dims_heightAbsolute: ['copyHeight', 'round'],
//     },
//
//     // A callback function to be performed after any attributes updates
//     callback: () => myLoom.update(),
//
//     // Similarly, we can invoke a function to run before performing the updates
//     setup: () => myLoom.update(),
// });
// ```


// #### Imports
import * as library from "../core/library.js";

import { isa_fn, xt, xta, λnull, Ωempty } from "../helper/utilities.js";

import { addListener, addNativeListener, removeListener, removeNativeListener } from "../core/events.js";

import { _ceil, _floor, _round, FALSE, T_GROUP, TRUE } from '../helper/shared-vars.js';


// __observeAndUpdate__ - exported function
export const observeAndUpdate = function (items = Ωempty) {

    if (!xta(items.event, items.origin, items.updates)) return false;

    const target = (items.target.substring && items.targetLibrarySection) ?
        library[items.targetLibrarySection][items.target] :
        items.target;

    if (!target) return false;

    const event = items.event,
        origin = items.origin;

    const listener = (items.useNativeListener) ? addNativeListener : addListener,
        killListener = (items.useNativeListener) ? removeNativeListener : removeListener;

    let stop = λnull;

    if (items.preventDefault) {

        stop = (e) => {

            e.preventDefault();
            e.returnValue = false;
        };
    }

    const setup = (isa_fn(items.setup)) ? items.setup : λnull;

    const callback = (isa_fn(items.callback)) ? items.callback : λnull;

    const func = function (e) {

        stop(e);

        const id = (e && e.target) ? e.target.id : false;

        if (id) {

            const updates = items.updates,
                actionArray = updates[id];

            if (actionArray) {

                setup();

                const actionAttribute = actionArray[0],
                    action = actionArray[1],
                    targetVal = e.target.value;

                let actionFlag = true,
                    val;

                switch (action) {

                    // Supplied value converted to float Number
                    case 'float' :
                        val = parseFloat(targetVal);
                        break;

                    // Supplied value converted to integer Number
                    case 'int' :
                        val = parseInt(targetVal, 10);
                        break;

                    // Supplied value rounded up or down to nearest integer Number
                    case 'round' :
                        val = _round(targetVal);
                        break;

                    // Supplied value rounded down to nearest integer Number
                    case 'roundDown' :
                        val = _floor(targetVal);
                        break;

                    // Supplied value rounded up to nearest integer Number
                    case 'roundUp' :
                        val = _ceil(targetVal);
                        break;

                    // Supplied value not modified in any way
                    case 'raw' :
                        val = targetVal;
                        break;

                    // Supplied value not modified in any way
                    case 'parse' :
                        val = (targetVal.substring) ? JSON.parse(targetVal) : targetVal;
                        break;

                    // Supplied value converted to String
                    case 'string' :
                        val = `${targetVal}`;
                        break;

                    // Supplied value converted to Boolean
                    case 'boolean' :
                        if (xt(targetVal)) {

                            if (targetVal.substring) {

                                if (TRUE === targetVal.toLowerCase()) val = true;
                                else if (FALSE === targetVal.toLowerCase()) val = false;
                                else val = (parseFloat(targetVal)) ? true : false;
                            }
                            else val = (targetVal) ? true : false;
                        }
                        else val = false;
                        break;

                    // Supplied value converted to float number, then action value (eg: '%') added to result to output a String
                    default :
                        if (action.substring) val = `${parseFloat(targetVal)}${action}`;
                        else actionFlag = false;
                }

                // Update - we can apply updates to a Group of artefacts, or to a single artefact
                if (actionFlag) {

                    if (target.type === T_GROUP) {

                        target.setArtefacts({
                            [actionAttribute]: val
                        });
                    }
                    else {

                        target.set({
                            [actionAttribute]: val
                        });
                    }

                    // Invoke any supplied callback function
                    callback();
                }
            }
        }
    };

    const kill = function () {

        killListener(event, func, origin);
    };

    listener(event, func, origin);

    return kill;
};

export const makeUpdater = (items = Ωempty) => observeAndUpdate(items);
