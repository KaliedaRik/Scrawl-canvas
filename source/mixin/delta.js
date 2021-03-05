// # Delta mixin
// This mixin defines additional attributes and functions for an artefact that uses delta functionality


// #### Imports
import { mergeOver, mergeDiscard, xt, Ωempty } from '../core/utilities.js';


// #### Export function
export default function (P = Ωempty) {


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
    S.delta = function (items = Ωempty) {

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
        
        const delta = this.delta,
            deltaKeys = Object.keys(delta),
            deltaLen = deltaKeys.length;

        for (let i = 0, key, val; i < deltaLen; i++) {

            key = deltaKeys[i];
            val = delta[key];

            if (val.substring) val = -(parseFloat(val)) + '%';
            else val = -val;

            temp[key] = val;
        }
        // Object.entries(this.delta).forEach(([key, val]) => {

        //     if (val.substring) val = -(parseFloat(val)) + '%';
        //     else val = -val;

        //     temp[key] = val;
        // });

        this.setDelta(temp);

        return this;
    };

// `setDeltaValues`
// Update the artefact's `delta` object in a more intelligent way. The function accepts an object argument containing a set of instructions which will be interpreted and applied to the delat object.
// ```
// // Original delta object:
// artefact.delta: {
//     width: 50,
//     height: '20%',
//     scale: 2,
// }
//
// // Function argument object to be applied to the delta object:
// {
//     width: 'add:20',
//     height: 'multiply:0.8',
//     scale: 'remove',
//     roll: 'newNumber:45',
// }
//
// // Result of applying the argument to the delta object:
// artefact.delta: {
//     width: 70,
//     height: '16%',
//     roll: 45,
// }
// ```
    P.setDeltaValues = function (items = Ωempty) {

        const delta = this.delta,
            keys = Object.keys(items),
            keysLen = keys.length;

        for (let i = 0, key, item, action, val, old; i < keysLen; i++) {

            key = keys[i];
            item = items[key];
            old = delta[key];

            if (item.indexOf(':') < 0) {
                action = item;
                val = false;
            }
            else {
                [action, val] = item.split(':');
            }

            switch (action) {

                case 'newString' :
                    if (val != null) delta[key] = val;
                    break;

                case 'newNumber' :
                    if (val != null) delta[key] = parseFloat(val);
                    break;

                case 'remove' :
                    delete delta[key];
                    break;

                case 'update' :
                    if (val != null) delta[key] = (old.substring) ? val : parseFloat(val);
                    break;

                case 'reverse' :
                    if (old.substring) val = -(parseFloat(old)) + '%';
                    else val = -old;
                    delta[key] = val;
                    break;

                case 'add' :
                    if (old.substring) val = (parseFloat(old) + parseFloat(val)) + '%';
                    else val += old;
                    delta[key] = val;
                    break;

                case 'multiply' :
                    if (old.substring) val = (parseFloat(old) * parseFloat(val)) + '%';
                    else val *= old;
                    delta[key] = val;
                    break;
            }
        }
        return this;
    };


// Return the prototype
    return P;
};
