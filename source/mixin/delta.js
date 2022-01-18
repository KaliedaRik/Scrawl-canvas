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
// + __deltaConstraints__ - Object mirroring the `delta` object which we use to set bounds on the delta values, and instructions on what to do when those bounds are crossed.
// + __noDeltaUpdates__ - Boolean flag to switch off the automatic application of delta attribute values as part of each iteration of the Display cycle.
// + __checkDeltaConstraints__ - Boolean flag to switch ON automatic constraint checks.
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
// 
// Note that the `delta` and `deltaConstraints` objects are set up in the mixin/position.js module, not here
        delta: null,
        noDeltaUpdates: false,
        deltaConstraints: null,
        checkDeltaConstraints: false,

// We do not want to perform any delta checks on any uninitalized attributes - in other words: no checks on the first iteration of the Display cycle
        performDeltaChecks: false,

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


    S.deltaConstraints = function (items = Ωempty) {

        if (items) this.deltaConstraints = mergeDiscard(this.deltaConstraints, items);
    };


// #### Prototype functions

 // `updateByDelta` - this function gets called as part of every display cycle iteration, meaning that if an attribute is set to a non-zero value in the __delta__ attribute object then those __delta animations__ will start playing immediately.
    P.updateByDelta = function () {

        this.setDelta(this.delta);

        if (this.checkDeltaConstraints) this.performDeltaConstraintsChecks();

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
        this.setDelta(temp);

        if (this.checkDeltaConstraints) this.performDeltaConstraintsChecks();

        return this;
    };

    P.performDeltaConstraintsChecks = function () {

        const {delta, deltaConstraints} = this;

        if (this.performDeltaChecks) {

            const keys = Object.keys(deltaConstraints),
                keysLen = keys.length;

            let key, keyIndex, item, min, max, action, performAction, performActionBecause, valArray, valIndex, val, i, isString, fMin, fMax, fVal;

            for (i = 0; i < keysLen; i++) {

                key = keys[i];
                item = deltaConstraints[key];

                if (Array.isArray(item) && item.length === 3) {

                    [min, max, action] = deltaConstraints[key];
                    isString = (min.substring) ? true : false;

                    if (isString) {

                        keyIndex = ['startX', 'startY', 'handleX', 'handleY', 'offsetX', 'offsetY', 'width', 'height'].indexOf(key);
                        valArray = false;
                        valIndex = 0;

                        if (keyIndex >= 0) {

                            if (keyIndex < 2) valArray = this.start;
                            else if (keyIndex < 4) valArray = this.handle;
                            else if (keyIndex < 6) valArray = this.offset;
                            else if (keyIndex < 6) valArray = this.dimensions;

                            if (['startY', 'handleY', 'offsetY', 'height'].indexOf(key) >= 0) valIndex = 1;

                            val = valArray[valIndex];
                        }
                        else val = this.get(key);

                        fMin = parseFloat(min);
                        fMax = parseFloat(max);
                        fVal = parseFloat(val);
                        performAction = '';

                        if (fVal < fMin) {

                            performAction = action;
                            performActionBecause = 0;
                        }
                        else if (fVal > fMax) {

                            performAction = action;
                            performActionBecause = 1;
                        }

                        if (performAction) {

                            switch (performAction) {

                                case 'reverse' :

                                    delta[key] = -parseFloat(delta[key]) + '%';

                                    this.set({
                                        [key]: fVal + parseFloat(delta[key]) + '%',
                                    });
                                    break; 

                                case 'loop' :

                                    if (performActionBecause) {

                                        this.set({
                                            [key]: fVal - (fMax - fMin) + '%',
                                        });
                                    }
                                    else {

                                        this.set({
                                            [key]: fVal + (fMax - fMin) + '%',
                                        });
                                    }
                                    break; 
                            }
                        }
                    }
                    else {

                        val = this.get(key);

                        performAction = '';

                        if (val < min) {

                            performAction = action;
                            performActionBecause = 0;
                        }
                        else if (val > max) {

                            performAction = action;
                            performActionBecause = 1;
                        }

                        if (performAction) {

                            switch (performAction) {

                                case 'reverse' :

                                    delta[key] = -delta[key];

                                    this.set({
                                        [key]: val + delta[key],
                                    });
                                    break; 

                                case 'loop' :

                                    if (performActionBecause) {

                                        this.set({
                                            [key]: val - (max - min),
                                        });
                                    }
                                    else {

                                        this.set({
                                            [key]: val + (max - min),
                                        });
                                    }
                                    break; 
                            }
                        }
                    }
                }
            }
        }
        else this.performDeltaChecks = true;
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
