// # Cascade mixin
// This mixin sets up the Scrawl-canvas functionality required to perform its __Display cycle__.
// + The Display cycle is initiated by [Stack](../factory/stack.html) and DOM-related [Cell](../factory/cell.html) wrappers (generally [Canvas](../factory/canvas.html) wrappers) - __controller objects__
// + The cycle cascades from the wrappers to all artefact objects associated with them, as mediated by [Group](../factory/group.html) objects.
//
// The mixin also includes code to assist __drag-and-drop__ functionality.


// #### Imports
import { group } from '../core/library.js';

import { mergeOver, pushUnique, removeItem, xtGet, Ωempty } from '../core/utilities.js';

import { releaseArray, requestArray } from '../factory/array-pool.js';

import { _floor, ADD_ARTEFACT_CLASSES, REMOVE_ARTEFACT_CLASSES, REVERSE_BY_DELTA, SET_ARTEFACTS, UPDATE_ARTEFACTS, UPDATE_BY_DELTA } from '../core/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// The __groups__ attribute holds the String names of all the Group objects associated with the controller object.
        groups: null,

// The __groupBuckets__ attribute holds a reference to each Group object, in a set of arrays grouping Groups according to their order values.
        groupBuckets: null,

// The __batchResort__ Boolean flag determines whether the Groups will be sorted by their order value before instructions get passed to each in sequence. Best to leave this flag alone to do its job.
        batchResort: true,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters;

// __groups__
    G.groups = function () {

        return [].concat(this.groups);
    };

    S.groups = function (item) {

        this.groups = [];
        this.addGroups(item);
    };


// #### Prototype functions

// `sortGroups` - internal function - Groups are sorted from the __groups__ Array into the __groupBuckets__ array using a bespoke bucket sort algorithm, based on each Group object's __order__ attribute
    P.sortGroups = function () {

        if (this.batchResort) {

            this.batchResort = false;

            const {groups, groupBuckets} = this;
            const buckets = requestArray();

            let i, iz, obj, name, order, arr;

            for (i = 0, iz = groups.length; i < iz; i++) {

                name = groups[i];
                obj = group[name];

                if (obj) {

                    order = _floor(obj.order) || 0;

                    if (!buckets[order]) buckets[order] = requestArray();

                    buckets[order].push(obj);
                }
            }
            groupBuckets.length = 0;

            for (i = 0, iz = buckets.length; i < iz; i++) {

                arr = buckets[i];

                if (arr) {

                    groupBuckets.push(...arr);
                    releaseArray(arr);
                }
            };
            releaseArray(buckets);
        }
    };


// `initializeCascade` - internal function used by factory constructors
    P.initializeCascade = function () {

        this.groups = [];
        this.groupBuckets = [];
    };


// ##### Group management
// Groups should be added to, and removed from, the controller object using the __addGroups__ and __removeGroups__ functions. The argument can be one or more Group object's name attribute, or the Group object(s) itself.

// `addGroups`
    P.addGroups = function (...args) {

        args.forEach(item => {

            if (item && item.substring) pushUnique(this.groups, item);
            else if (group[item]) pushUnique(this.groups, item.name);

        }, this);

        this.batchResort = true;
        return this;
    };

// `removeGroups`
    P.removeGroups = function (...args) {

        args.forEach( item => {

            if (item && item.substring) removeItem(this.groups, item);
            else if (group[item]) removeItem(this.groups, item.name);

        }, this);

        this.batchResort = true;
        return this;
    };


// `cascadeAction` - internal helper function used by the functions below
    P.cascadeAction = function (items, action) {

        let grp;

        this.groups.forEach( groupname => {

            grp = group[groupname];

            if (grp) grp[action](items);

        }, this);

        return this;
    };

// `updateArtefacts` - Update all artefact objects in all the controller object's Groups. The supplied argument will be passed on to each artefact's `setDelta` function.
    P.updateArtefacts = function (items) {

        this.cascadeAction(items, UPDATE_ARTEFACTS);
        return this;
    };

// `updateArtefacts` - Set all artefact objects in all the controller object's Groups. The supplied argument will be passed on to each artefact's `set` functions
    P.setArtefacts = function (items) {

        this.cascadeAction(items, SET_ARTEFACTS);
        return this;
    };

// `addArtefactClasses` - specific to DOM-related artefacts (Stack, Canvas, Element)
    P.addArtefactClasses = function (items) {

        this.cascadeAction(items, ADD_ARTEFACT_CLASSES);
        return this;
    };

// `removeArtefactClasses` - specific to DOM-related artefacts (Stack, Canvas, Element)
    P.removeArtefactClasses = function (items) {

        this.cascadeAction(items, REMOVE_ARTEFACT_CLASSES);
        return this;
    };

// `updateByDelta` - triggers the related artefact function, to update (add) its attributes by values held in its `delta` object attribute
    P.updateByDelta = function () {

        this.cascadeAction(false, UPDATE_BY_DELTA);
        return this;
    };

// `reverseByDelta` - triggers the related artefact function, to reverse (subtract) its attributes by values held in its `delta` object attribute
    P.reverseByDelta = function () {

        this.cascadeAction(false, REVERSE_BY_DELTA);
        return this;
    };


// ##### Collision detection
// The `getArtefactAt` function checks to see if any of the controller object's Groups' artefacts are located at the supplied coordinates in the argument object. 
// + The first artefact to report back as being at that coordinate will be returned by the function
// + Where no artefacts are present at that coordinate the function returns false. 
// + The artefact with the highest order attribute value will be returned first. 
// + This function forms part of the Scrawl-canvas __drag-and-drop__ functionality.
    P.getArtefactAt = function (items) {

        items = xtGet(items, this.here, false);

        if (items) {

            let grp, result;

            for (let i = this.groups.length - 1; i >= 0; i--) {

                grp = group[this.groups[i]];

                if (grp) {

                    result = grp.getArtefactAt(items);

                    if (result) return result;
                }
            }
        }
        return false;
    };


 // The `getAllArtefactsAt` function returns all of the controller object's Groups' artefacts located at the supplied coordinates in the argument object. 
 // + The artefact with the highest order attribute value will be returned first. 
 // + The function will always return an array of artefact objects, or an empty Array
    P.getAllArtefactsAt = function (items) {

        items = xtGet(items, this.here, false);

        const results = [];

        if (items) {

            let grp, result;
            
            for (let i = this.groups.length - 1; i >= 0; i--) {

                grp = group[this.groups[i]];

                if (grp) {

                    result = grp.getAllArtefactsAt(items);

                    if (result) results.push(...result);
                }
            }
        }
        return results;
    };
};
