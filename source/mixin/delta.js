// # Position-physics mixin
// This mixin defines additional attributes and functions for an artefact that uses physics functionality


// #### Imports
import { mergeOver, mergeDiscard } from '../core/utilities.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

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
    };
    P.defs = mergeOver(P.defs, defaultAttributes);
    mergeOver(P, defaultAttributes);


// #### Packet management
// No additional packet management functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    let S = P.setters,
        D = P.deltaSetters;

// __delta__
    S.delta = function (items = {}) {

        if (items) this.delta = mergeDiscard(this.delta, items);
    };


// #### Prototype functions

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


// Return the prototype
    return P;
};
