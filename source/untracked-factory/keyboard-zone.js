// # Keyboard zones.
// __makeKeyboardZone__ is an attempt to make setting up keyboard listeners (for accessibility) within a Scrawl-canvas stack or canvas as simple as possible. Similar to the drag zone functionality, SC tries to limit the number of keyboard event listeners attached to a particular DOM element to the bare minimum
//
// Required attribute of the argument object:
// + __.zone__ - either the String name of the Stack or Canvas artefact which will host the zone, or the Stack or Canvas artefact itself
//
// Additional, optional, attributes in the argument object
// + `'none', 'shiftOnly', 'altOnly', 'ctrlOnly', 'metaOnly', 'shiftAlt', 'shiftCtrl', 'shiftMeta', 'altCtrl', 'altMeta', 'ctrlMeta', 'shiftAltCtrl', 'shiftAltMeta', 'shiftCtrlMeta', 'altCtrlMeta', 'all'` - a set of objects containing `keyboard Key: function` attributes defining the group of actions to take when the user presses the associated key or key-combination.


// #### Imports
import { artefact } from "../core/library.js";

import { mergeDiscard, λnull, Ωempty } from "../helper/utilities.js";

import { addNativeListener, removeNativeListener } from "../core/events.js";

import { $BODY, _keys, ACCEPTED_WRAPPERS, KEY_DOWN, KEY_UP, KEYBOARD_GROUPS, NONE, T_ESCAPE, T_TAB } from '../helper/shared-vars.js';


// Local constants
const keyboardZones = {};

const processKeyboardZoneData = function (items = Ωempty, doAddListeners, doRemoveListeners) {

    let zone = items.zone;

    // `zone` is required
    // + must be either a Canvas or Stack wrapper, or a wrapper's String name
    if (!zone) return new Error('keyboardZone constructor - no zone supplied');

    if (zone.substring) zone = artefact[zone];

    if (!zone || !ACCEPTED_WRAPPERS.includes(zone.type)) return new Error('keyboardZone constructor - zone object is not a Stack or Canvas wrapper');

    const target = zone.domElement;

    if (!target) return new Error('keyboardZone constructor - zone does not contain a target DOM element');

    let zoneItem = keyboardZones[zone.name];

    if (!zoneItem) {

        keyboardZones[zone.name] = {};
        zoneItem = keyboardZones[zone.name];
        doAddListeners(target);
    }

    if (!zoneItem.extraKeys) {

        zoneItem.extraKeys = {
            Shift: false,
            Control: false,
            Alt: false,
            Meta: false,
        };
    }

    if (!zoneItem.keyGroups) {

        const groups = {};
        KEYBOARD_GROUPS.forEach(g => groups[g] = {});
        zoneItem.keyGroups = groups;
    }

    const KG = zoneItem.keyGroups;

    KEYBOARD_GROUPS.forEach(g => {

        const keymap = items[g];
        if (keymap != null) mergeDiscard(KG[g], keymap);
    });

    if (!zoneItem.onKeyDown) {

        zoneItem.onKeyDown = (e = Ωempty) => {

            if (e && e.key) {

                e.preventDefault();

                const { extraKeys, keyGroups } = zoneItem;
                const { key } = e;

               // Tab, Esc
                if (T_TAB === key || T_ESCAPE === key) {

                    target.blur();
                    return;
                }
                if (extraKeys[key] != null) {

                    extraKeys[key] = true;
                    return;
                }

                const { Shift, Control, Alt, Meta } = extraKeys;

                let group = keyGroups.none;

                if (Shift || Control || Alt || Meta) {

                    if (Shift) {
                        if (Alt) {
                            if (Control) {
                                if (Meta) group = keyGroups.all;
                                else group = keyGroups.shiftAltCtrl;
                            }
                            else {
                                if (Meta) group = keyGroups.shiftAltMeta;
                                else group = keyGroups.shiftAlt;
                            }
                        }
                        else {
                            if (Control) {
                                if (Meta) group = keyGroups.shiftCtrlMeta;
                                else group = keyGroups.shiftCtrl;
                            }
                            else {
                                if (Meta) group = keyGroups.shiftMeta;
                                else group = keyGroups.shiftOnly;
                            }
                        }
                    }
                    else {
                        if (Alt) {
                            if (Control) {
                                if (Meta) group = keyGroups.altCtrlMeta;
                                else group = keyGroups.altCtrl;
                            }
                            else {
                                if (Meta) group = keyGroups.altMeta;
                                else group = keyGroups.altOnly;
                            }
                        }
                        else {
                            if (Control) {
                                if (Meta) group = keyGroups.ctrlMeta;
                                else group = keyGroups.ctrlOnly;
                            }
                            else {
                                if (Meta) group = keyGroups.altOnly;
                                else group = keyGroups.none;
                            }
                        }
                    }
                }
                if (group[key]) group[key]();
            }
        };
    }

    if (!zoneItem.onKeyUp) {

        zoneItem.onKeyUp = (e = Ωempty) => {

            if (e && e.key) {

                e.preventDefault();

                const extraKeys = zoneItem.extraKeys;
                const key = e.key;

                if (extraKeys[key] != null) extraKeys[key] = false;
            }
        };
    }

    // __kill__ - A function to remove the internal key mappings associated with the target DOM element, and then remove the keyboard listeners attached to that element
    if (!zoneItem.kill) {

        zoneItem.kill = function () {

            delete keyboardZones[zone.name];
            doRemoveListeners(target);
        };
    }

    // __getMappedKeys__ - A function which returns an Array of the defined keys for the given group, the name of which should be supplied as the function's argument
    // + To update key mappings, invoke the `makeKeyboardZone` function again, including the new mappings as part of the argument object
    const getMappedKeys = (keyGroup = NONE) => {

        if (zoneItem.keyGroups[keyGroup] != null) {

            return _keys(zoneItem.keyGroups[keyGroup]);
        }
        return [];
    }

    // The return includes both the `kill` and `getMappedKeys` functions
    return {
        kill: zoneItem.kill,
        getMappedKeys,
    }
}

// `Exported function` (to modules and the SC object). Add keyboard listenning functionality to a canvas or stack wrapper.
export const makeKeyboardZone = function (items = Ωempty) {

    // The exposed `actionKeyDown` function will search for the target element (if user has started the drag while the mouse cursor was over a child of the Stack wrapper) and then apply the required keystroke actions while that element remains focussed
    const actionKeyDown = (e = Ωempty) => {

        if (e && e.target) {

            let myTarget = e.target,
                name = '';

            while (!name) {

                if (keyboardZones[myTarget.id]) name = myTarget.id;
                if (myTarget.tagName === $BODY) break;
                myTarget = myTarget.parentElement;
            }

            const actions = keyboardZones[name];

            if (actions) {

                actions.onKeyDown(e);
                currentKeyUp = actions.onKeyUp;
            }
            else currentKeyUp = λnull;
        }
    };


    // The exposed `actionKeyUp` function will change to match the equivalent funtions supplied by the zone selected during the `actionKeyDown` stage of the operation
    let currentKeyUp = λnull;
    const actionKeyUp = (e) => {

        currentKeyUp(e);
    };

    // Listeners are added to the DOM element when the first keyboard zone is created for that target
    const doAddListeners = (target) => {

        addNativeListener(KEY_DOWN, actionKeyDown, target);
        addNativeListener(KEY_UP, actionKeyUp, target);
    };


    // Listeners are only removed from the DOM element when all the keyboard zones associated with that target have been killed
    const doRemoveListeners = (target) => {

        removeNativeListener(KEY_DOWN, actionKeyDown, target);
        removeNativeListener(KEY_UP, actionKeyUp, target);
    };

    // Returns an object containing the `kill` and `getMappedKeys` functions for this keyboard mapping
    return processKeyboardZoneData(items, doAddListeners, doRemoveListeners);
};
