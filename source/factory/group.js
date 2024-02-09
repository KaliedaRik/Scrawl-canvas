// # Group factory
// Scrawl-canvas uses Group objects to gather together artefact objects (Block, Canvas, Element, Grid, Loom, Phrase, Picture, Shape, Stack, Wheel) for common functions.
//
// Groups connect artefacts with controller objects - Stack, Cell - through which the Display cycle can cascade. Each controller object can have more than one Group associated with it. Only Groups whose __visibility__ flag has been set to true will propagate the Display cycle cascade to their member artefacts. The order in which each controller object invokes its Group objects is determined by each Group object's __order__ value.
//
// Groups can also be used for purposes beyond the Display cycle:
// + They are closely involved in collision detection functionality.
// + They can be used to propagate updates to their constituent artefacts - for instance animating them in a coordinated manner.
// + Filters can be applied to entity objects at the Group level
//
// Additional functionality to help control and interact with Groups is defined in the __cascade__ mixin. Groups also use the __base__ mixin, thus they come equipped with packet functionality, alongside clone and kill functions.
//
// NOTE: __Groups are NOT used to position a set of artefacts in the display__ - they have no positioning functionality, which is instead handled by the artefact objects themselves. To position and move a collection of artefacts around the display, choose one of them to act as a a reference, and then __pivot__ or __mimic__ other artefacts to that reference. When you position or animate the reference artefact, all the other artefacts will position/move with it. See Demo [Canvas-002](../../demo/canvas-002.html) for an example.


// #### Imports
import { artefact, cell, constructors, entity, group } from '../core/library.js';

import { doCreate, mergeOver, pushUnique, removeItem, λnull, Ωempty } from '../helper/utilities.js';

import { filterEngine } from '../helper/filter-engine.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { importDomImage } from '../asset-management/image-asset.js';

import { releaseArray, requestArray } from '../helper/array-pool.js';

import baseMix from '../mixin/base.js';
import filterMix from '../mixin/filter.js';

import { _isArray, _floor, _values, ACCEPTED_OWNERS, ADD_CLASSES, ENTITY, GROUP, IMG, REMOVE_CLASSES, REVERSE_BY_DELTA, SET, SET_DELTA, SOURCE_IN, SOURCE_OVER, T_GROUP, UPDATE_BY_DELTA } from '../helper/shared-vars.js';


// #### Group constructor
const Group = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.artefacts = [];
    this.artefactCalculateBuckets = [];
    this.artefactStampBuckets = [];

    this.set(this.defs);

    this.onEntityHover = λnull;
    this.onEntityNoHover = λnull;
    this.isHovering = null;

    this.set(items);

    return this;
};


// #### Group prototype
const P = Group.prototype = doCreate();
P.type = T_GROUP;
P.lib = GROUP;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);
filterMix(P);


// #### Group attributes
const defaultAttributes = {

// __artefacts__ - an Array containing the names of all artefact objects included in this group.
    artefacts: null,

// __order__ - positive integer Number, which determines the order in which Stack and Cell controllers will process this Group object during the Display cycle
    order: 0,

// __visibility__ - Boolean flag; when unset, the Group will __not__ be processed by Stack and Cell controllers as part of the Display cycle
    visibility: true,

// __regionRadius__ - positive Number (measured in px), used as an initial test as part of collision detection functionality
    regionRadius: 0,

// __checkForEntityHover__ - we can trigger groups, as part of the Display cycle, to check if any of their entitys are currently hittable (the mouse cursor is hovering over them) and run functions based on changes in hover state. This is not the same as canvas `cascadeEventActions`
    checkForEntityHover: false,

// __onEntityHover__ - define tasks to be performed for `down` events
    onEntityHover: null,

// __onEntityNoHover__ - define tasks to be performed for `up` events
    onEntityNoHover: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['artefactCalculateBuckets', 'artefactStampBuckets', 'batchResort']);
P.packetFunctions = pushUnique(P.packetFunctions, ['onEntityHover', 'onEntityNoHover']);


// #### Clone management
P.postCloneAction = function(clone, items) {

    let host;

    if (items.host) {

        host = artefact[items.host];
    }
    else {

        host = (this.currentHost) ? this.currentHost : (this.host) ? artefact[this.host] : false;
    }

    if (host) {

        host.addGroups(clone.name);
        if (!clone.host) clone.host = host.name;
    }

    if (this.onEntityHover) clone.onEntityHover = this.onEntityHover;
    if (this.onEntityNoHover) clone.onEntityNoHover = this.onEntityNoHover;

    return clone;
};


// #### Kill management
P.kill = function (killArtefacts = false) {

    if (killArtefacts) this.artefactCalculateBuckets.forEach(item => item.kill());

    const myname = this.name;

    // Remove the Group object from affected Stack and Cell objects' `groups` attribute
    _values(artefact).forEach(art => {

        if (_isArray(art.groups) && art.groups.includes(myname)) {

            removeItem(art.groups, myname);
            art.batchResort = true;
        }
    });

    _values(cell).forEach(obj => {

        if (_isArray(obj.groups) && obj.groups.includes(myname)) {

            removeItem(obj.groups, myname);
            obj.batchResort = true;
        }
    });

    // Remove Group object from the Scrawl-canvas library
    return this.deregister();
}

P.killArtefacts = function () {

    this.artefactCalculateBuckets.forEach(item => item.kill());

    return this;
}


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters;

// Artefect membership of the Group object is better handled by the dedicated artefact management functions - __addArtefacts__, __removeArtefacts__, __clearArtefacts__, __moveArtefactsIntoGroup__.

// Returns a new Array containing the name String values of current artefact members
G.artefacts = function () {

    return [].concat(this.artefacts);
};

// Replaces the existing artefact membership with new members, supplied as an Array of name-String values
S.artefacts = function (item) {

    if (!this.artefacts) this.artefacts = [];
    this.artefacts.length = 0;

    this.addArtefacts(item);
};

// Adds the Group to a new controller Stack or Cell object. NOTE that this does not remove the Group from its existing host!
S.host = function (item) {

    const host = this.getHost(item);

    if (host && host.addGroups) {

        this.host = item;
        host.addGroups(this.name);

        this.dirtyHost = true;
    }
};

// Update the Group's `order` attribute, and tell its current host that it will need to resort its associated Groups
S.order = function (item) {

    const host = this.getHost(this.host);

    this.order = item;

    if (host) {

        host.set({
            batchResort: true
        });
    }
};

// __noFilters__
S.noFilters = function (item) {

    this.noFilters = item;
    this.dirtyFilterIdentifier = true;
};

// #### Prototype functions

// `getHost` - internal helper function
P.getHost = function (item) {

    if (item) {

        if (item.type && ACCEPTED_OWNERS.includes(item.type)) return item;
        if (item.substring) return artefact[item] || cell[item];
    }

    const host = this.currentHost;

    if (host && host.substring) return artefact[host] || cell[host];

    return host;
};

// `forceStamp` - invoke the Group to instruct its artefact members to perform a `stamp` action, ignoring whether the Group `visibility` flag setting
P.forceStamp = function () {

    const v = this.visibility;
    this.visibility = true;
    this.stamp()
    this.visibility = v;
};

// `stamp` - the Display Cycle is mediated through Groups.
P.stamp = function () {

    // Check we have a host of some sort (either a Stack artefact or a Cell asset)
    if (this.dirtyHost || !this.currentHost) {

        this.dirtyHost = false;

        const currentHost = this.getHost(this.host);

        if (currentHost) this.currentHost = currentHost;
        else this.dirtyHost = true;
    }

    if (this.visibility) {

        const { currentHost, stashOutput, noFilters, filters } = this;

        if (currentHost) {

            // Check if artefacts need to be sorterd and, if yes, sort them by their order attribute
            this.sortArtefacts();

            // Check to see if there is a Group filter in place or if the Group needs to stash its output and, if yes, pull a Cell asset from the pool
            const filterCell = (stashOutput || (!noFilters && filters && filters.length)) ?
                requestCell() :
                false;

            // Setup the pool Cell, if required
            if (filterCell && filterCell.element) {

                const dims = currentHost.currentDimensions,
                    fEl = filterCell.element;

                if (dims && fEl) {

                    fEl.width = dims[0];
                    fEl.height = dims[1];
                }
            }

            // We save/restore the canvas engine at this point because some entitys may have their `method` attribute set to `clip` and the only way to get rid of a clip region from an engine is to save the engine before applying the clip, then restoring the engine afterwards
            // + This has implications for tracking engine attributes
            else if (currentHost.engine) currentHost.engine.save();

            // Prepare the Group's artefacts for the forthcoming stamp activity
            this.prepareStamp(filterCell);

            // Get the Group's artefacts to stamp themselves on the current host or pool Cell
            this.stampAction(filterCell);

            if (filterCell) releaseCell(filterCell);
            else {

                if (currentHost.engine) {

                    currentHost.engine.restore();
                    currentHost.setEngineFromState(currentHost.engine);
                }
            }
        }
    }
};

// `sortArtefacts` - internal function. Uses a bucket sort algorithm
P.sortArtefacts = function () {

    if (this.batchResort) {

        this.batchResort = false;

        const calcBuckets = requestArray(),
            stampBuckets = requestArray();

        const { artefacts, artefactCalculateBuckets, artefactStampBuckets } = this;

        let obj, order, i, iz, name, arr;

        for (i = 0, iz = artefacts.length; i < iz; i++) {

            name = artefacts[i];
            obj = artefact[name];

            if (obj) {

                // Sort for artefact calculateOrder
                order = _floor(obj.calculateOrder);
                if (!calcBuckets[order]) calcBuckets[order] = requestArray();
                calcBuckets[order].push(obj);

                // Sort for artefact stampOrder
                order = _floor(obj.stampOrder);
                if (!stampBuckets[order]) stampBuckets[order] = requestArray();
                stampBuckets[order].push(obj);
            }
        }

        artefactCalculateBuckets.length = 0;
        for (i = 0, iz = calcBuckets.length; i < iz; i++) {

            arr = calcBuckets[i];

            if (arr) {

                artefactCalculateBuckets.push(...arr);
                releaseArray(arr);
            }
        }
        releaseArray(calcBuckets);

        artefactStampBuckets.length = 0;
        for (i = 0, iz = stampBuckets.length; i < iz; i++) {

            arr = stampBuckets[i];

            if (arr) {

                artefactStampBuckets.push(...arr);
                releaseArray(arr);
            }
        }
        releaseArray(stampBuckets);
    }
};

// `prepareStamp` - initial action in the Display cycle, before Stacks/Cells start their clear/compile/show cascade
P.prepareStamp = function (myCell) {

    let host = this.currentHost;

    if (myCell) host = myCell;

    this.artefactCalculateBuckets.forEach(art => {

        if (art.lib === ENTITY) {

            if (!art.currentHost || art.currentHost.name !== host.name) {

                art.currentHost = host;
                if (!myCell) art.dirtyHost = true;
            }
        }

        if (!art.noDeltaUpdates) art.updateByDelta();

        art.prepareStamp();
    });
};

// `stampAction` - the key Group-mediated action in the Display cycle, invoked as part of the `compile` functionality.
P.stampAction = function (myCell) {

    const { dirtyFilters, currentFilters, artefactStampBuckets, noFilters, filters, stashOutput, currentHost } = this;

    if (dirtyFilters || !currentFilters) this.cleanFilters();

    artefactStampBuckets.forEach(art => {

        if (art && art.stamp) art.stamp();
    });

    if (myCell) {

        if (!noFilters && filters && filters.length) {

            const img = this.applyFilters(myCell);
            this.stashAction(img);
        }
        else if (stashOutput) {

            // We set up things to draw the group on a pool cell if the Group's `stashOutput` flag is set to true - so now we have to paint it back into the host Cell
            const tempElement = myCell.element,
                tempEngine = myCell.engine,
                realEngine = (currentHost && currentHost.engine) ? currentHost.engine : false;

            if (realEngine) {

                realEngine.save();

                realEngine.globalCompositeOperation = SOURCE_OVER;
                realEngine.globalAlpha = 1;
                realEngine.setTransform(1, 0, 0, 1, 0, 0);

                realEngine.drawImage(tempElement, 0, 0);

                realEngine.restore();

                const tempImg = tempEngine.getImageData(0, 0, tempElement.width, tempElement.height);

                this.stashAction(tempImg);
            }
        }
    }
};

// `applyFilters` - filters can be applied to entity artefacts at the group level, in addition to any filters applied at the entity level.
P.applyFilters = function (myCell) {

    const currentHost = this.currentHost;

    if (!currentHost || !myCell) return false;

    // Get handles to current and filter Cell elements and engines
    const currentElement = currentHost.element,
        currentEngine = currentHost.engine;

    const filterCellElement = myCell.element,
        filterCellEngine = myCell.engine;

    // Action a request to use the filtered artefacts as a stencil - as determined by the Group's `isStencil` flag
    if (this.isStencil) {

        filterCellEngine.save();
        filterCellEngine.globalCompositeOperation = SOURCE_IN;
        filterCellEngine.globalAlpha = 1;
        filterCellEngine.setTransform(1, 0, 0, 1, 0, 0);
        filterCellEngine.drawImage(currentElement, 0, 0);
        filterCellEngine.restore();

        this.dirtyFilterIdentifier = true;
    }

    // At this point we will send the contents of the filterHost canvas over to the filter engine
    filterCellEngine.setTransform(1, 0, 0, 1, 0, 0);

    const myimage = filterCellEngine.getImageData(0, 0, filterCellElement.width, filterCellElement.height);

    this.preprocessFilters(this.currentFilters);

    const img = filterEngine.action({
        identifier: this.filterIdentifier,
        image: myimage,
        filters: this.currentFilters,
    })

    if (img) {

        filterCellEngine.globalCompositeOperation = SOURCE_OVER;
        filterCellEngine.globalAlpha = 1;
        filterCellEngine.setTransform(1, 0, 0, 1, 0, 0);
        filterCellEngine.putImageData(img, 0, 0);
    }

    currentEngine.save();
    currentEngine.setTransform(1, 0, 0, 1, 0, 0);
    currentEngine.drawImage(filterCellElement, 0, 0);
    currentEngine.restore();

    return img;
};


// `stashAction` - internal function which creates an ImageAsset object (and, as determined by the setting of the Group's `stashOutputAsAsset` flag, an &lt;img> element which gets attached to the host &lt;canvas> element's `canvasHold` hidden &lt;div> element) from the Group's entity's output.
//
// NOTE: the `stashOutput` and `stashOutputAsAsset` flags are not Group object attributes. They are set on the group as a result of invoking the `scrawl.createImageFromGroup` function, and will be set to false as soon as the `Group.stashAction` function runs (in other words, stashing a Group's output is a one-off operation).
P.stashAction = function (img) {

    if (!img) return false;

    if (this.stashOutput) {

        this.stashOutput = false;

        const [x, y, width, height] = this.getCellCoverage(img);

        const myCell = requestCell(),
            myEngine = myCell.engine,
            myElement = myCell.element;

        myElement.width = width;
        myElement.height = height;

        myEngine.putImageData(img, -x, -y);

        this.stashedImageData = myEngine.getImageData(0, 0, width, height);

        if (this.stashOutputAsAsset) {

            const stashId = this.stashOutputAsAsset.substring ? this.stashOutputAsAsset : `${this.name}-groupimage`;

            this.stashOutputAsAsset = false;

            if (!this.stashedImage) {

                const host = this.currentHost;
                const control = (host) ? host.getController() : null;

                if (control) {

                    const that = this;

                    const newimg = document.createElement(IMG);
                    newimg.id = stashId;
                    newimg.alt = `A cached image of the ${this.name} Group of entitys`;

                    newimg.onload = function () {

                        control.canvasHold.appendChild(newimg);
                        that.stashedImage = newimg;
                        importDomImage(`#${stashId}`);
                    };

                    newimg.src = myElement.toDataURL();
                }
            }
            else this.stashedImage.src = myElement.toDataURL();
        }
        releaseCell(myCell);
    }
};

// `getCellCoverage` - internal function which calculates the cumulative coverage of the Group's artefacts. Used as part of the `stashAction` functionality
P.getCellCoverage = function (img) {

    const { width, height, data } = img;

    let maxX = 0,
        maxY = 0,
        minX = width,
        minY = height,
        counter = 3,
        x, y, i, iz;

    for (i = 0, iz = width * height; i < iz; i++) {

        if (data[counter]) {

            y = _floor(i / width);
            x = i - (y * width);

            if (minX > x) minX = x;
            if (maxX < x) maxX = x;
            if (minY > y) minY = y;
            if (maxY < y) maxY = y;
        }
        counter += 4;
    }
    if (minX < maxX && minY < maxY) return [minX, minY, maxX - minX, maxY - minY];
    else return [0, 0, width, height];
};


// #### Artefact management
// Artefacts should be added to, and removed from, the Group object using the functions detailed below.
//
// The argument for each function can be one or more artefact object's name attribute, or the artefact objects themselves, separated by commas.

// `addArtefacts` - an artefact can belong to more than one Group
P.addArtefacts = function (...args) {

    if (args && _isArray(args[0])) args = args[0];

    args.forEach(item => {

        if (item) {

            if (item.substring) pushUnique(this.artefacts, item);
            else if (item.name) pushUnique(this.artefacts, item.name);
        }
    }, this);

    this.batchResort = true;
    return this;
};

// `getArtefact` - return the artifact with the given name IF the artefact is a member of the group
P.getArtefact = function (name) {

    if (this.artefacts.includes(name)) return artefact[name] || false;
    return false;
};

// `removeArtefacts` - remove an artefact from this Group
P.removeArtefacts = function (...args) {

    args.forEach(item => {

        if (item) {

            if (item.substring) removeItem(this.artefacts, item);
            else if (item.name) removeItem(this.artefacts, item.name);
        }
    }, this);

    this.batchResort = true;
    return this;
};

// `moveArtefactsIntoGroup` - remove the artefact from their current Group (which is generally their Display cycle group, as set in their `group` and/or `host` attribute) and add them to this Group
P.moveArtefactsIntoGroup = function (...args) {

    let temp, art;

    args.forEach(item => {

        if (item) {

            art = (item.substring) ? artefact[item] : item;

            if (art && art.isArtefact) {

                if (art.group) temp = art.group;
                else if (art.host) temp = group[art.host];
                else temp = false;
            }

            if (temp) {

                temp.removeArtefacts(item);
                temp.batchResort = true;
            }
            pushUnique(this.artefacts, item);
        }
    }, this);

    this.batchResort = true;
    return this;
};

// `clearArtefacts` - remove all artefacts from this Group
P.clearArtefacts = function () {

    this.artefacts.length = 0;
    this.artefactCalculateBuckets.length = 0;
    this.artefactStampBuckets.length = 0;
    this.batchResort = true;
    return this;
};

// `updateArtefacts` - passes the __items__ argument object through to each of the Group's artefact's `setDelta` function
P.updateArtefacts = function (items) {

    this.cascadeAction(items, SET_DELTA);
    return this;
};


// `setArtefacts` - passes the __items__ argument object through to each of the Group's artefact's `set` function
P.setArtefacts = function (items) {

    this.cascadeAction(items, SET);
    return this;
};

// `updateByDelta` - passes the __items__ argument object through to each of the Group's artefact's `updateByDelta` function
P.updateByDelta = function () {

    this.cascadeAction(false, UPDATE_BY_DELTA);
    return this;
};

// `reverseByDelta` - passes the __items__ argument object through to each of the Group's artefact's `reverseByDelta` function
P.reverseByDelta = function () {

    this.cascadeAction(false, REVERSE_BY_DELTA);
    return this;
};

// `addArtefactClasses` - specifically for non-entity artefacts. Passes the __items__ argument String through to each of the Group's artefact's `addClasses` function
P.addArtefactClasses = function (items) {

    this.cascadeAction(items, ADD_CLASSES);
    return this;
};

// `removeArtefactClasses` - specifically for non-entity artefacts. Passes the __items__ argument String through to each of the Group's artefact's `removeClasses` function
P.removeArtefactClasses = function (items) {

    this.cascadeAction(items, REMOVE_CLASSES);
    return this;
};

// `cascadeAction` - internal helper function for the above artefact manipulation functionality
P.cascadeAction = function (items, action) {

    let art;

    this.artefacts.forEach(name => {

        art = artefact[name];

        if(art && art[action]) art[action](items);
    });
    return this;
};

// `setDeltaValues` - passes the __items__ argument object through to each of the Group's artefact's `setDeltaValues` function
P.setDeltaValues = function (items = Ωempty) {

    this.artefactCalculateBuckets.forEach(art => art.setDeltaValues(items));

    return this;
};

// We can add and remove filters to each of the Group's entity artefacts using the following functions. The argument for each function can be one or more Filter name-Strings, or the Filter objects themselves, separated by commas.

// `addFiltersToEntitys`
// TODO: don't think this is tested anywhere - build test!
P.addFiltersToEntitys = function (...args) {

    let ent;

    this.artefacts.forEach(name => {

        ent = entity[name];

        if (ent && ent.addFilters) ent.addFilters(args);
    });
    return this;
};

// `removeFiltersFromEntitys`
// TODO: don't think this is tested anywhere - build test!
P.removeFiltersFromEntitys = function (...args) {

    let ent;

    this.artefacts.forEach(name => {

        ent = entity[name];

        if (ent && ent.removeFilters) ent.removeFilters(args);
    });
    return this;
};

// `clearFiltersFromEntitys` - clears all filters from all the Group's entity artefacts.
// TODO: don't think this is tested anywhere - build test!
P.clearFiltersFromEntitys = function () {

    let ent;

    this.artefacts.forEach(name => {

        ent = entity[name];

        if (ent && ent.clearFilters) ent.clearFilters();
    });
    return this;
};

// `recalculateFonts` - gets Label and EnhancedLabel entitys in the Group to recalculate their font/text dimensions.
P.recalculateFonts = function () {

    let ent;

    this.artefacts.forEach(name => {

        ent = entity[name];

        if (ent && ent.recalculateFont) ent.recalculateFont();
    });
    return this;
};

// #### Collision functionality
// The `getArtefactAt` function checks to see if any of the Group object's artefacts are located at the supplied coordinates in the argument object.
//
// The hit report from the first artefact to respond back positively (artefacts with the highest order value are checked first) will be returned by the function.
//
// Where no artefacts are present at that coordinate the function returns false.
//
// A __hit report__ is a Javascript object with the following attributes:
// + `x` - the x coordinate supplied in this functions argument object
// + `y` - the y coordinate supplied in this functions argument object
// + `artefact` - the Scrawl-canvas artefact object reporting the hit
//
// This function forms part of the Scrawl-canvas library's __drag-and-drop__ functionality.
P.getArtefactAt = function (items) {

    this.sortArtefacts();

    const myCell = requestCell(),
        artBuckets = this.artefactStampBuckets;

    let art, result;

    for (let i = artBuckets.length - 1; i >= 0; i--) {

        art = artBuckets[i];

        if (art) {

            result = art.checkHit(items, myCell);

            if (result) {

                releaseCell(myCell);
                return result;
            }
        }
    }
    releaseCell(myCell);
    return false;
};

// The `getAllArtefactsAt` function returns an array of hit reports from all of the Group object's artefacts located at the supplied coordinates in the argument object. The artefact with the highest order attribute value will be returned first in the response array.
//
// The function will always return an array of hit reports, or an empty array if no hits are reported.
P.getAllArtefactsAt = function (items) {

    this.sortArtefacts();

    const myCell = requestCell(),
        artBuckets = this.artefactStampBuckets,
        resultNames = requestArray(),
        results = [];

    let art, result, hit;

    for (let i = artBuckets.length - 1; i >= 0; i--) {

        art = artBuckets[i];

        if (art) {

            result = art.checkHit(items, myCell);

            if (result && result.artefact) {

                hit = result.artefact;

                if (!resultNames.includes(hit.name)) {

                    resultNames.push(hit.name);
                    results.push(result);
                }
            }
        }
    }
    releaseCell(myCell);
    releaseArray(resultNames);

    if (this.checkForEntityHover) {

        const foundArtefacts = (results.length) ? true : false,
            isHovering = this.isHovering;

        if (isHovering !== foundArtefacts) {

            this.isHovering = foundArtefacts;

            if (foundArtefacts) this.onEntityHover();
            else this.onEntityNoHover();
        }
    }
    return results;
};


// #### Factory
// ```
// let faces = scrawl.makeGroup({
//
//     // Unique name to keep track of the Group
//     name: 'faces',
//
//     // Groups generally associate with a primary controller (a Stack or Cell object)
//     host: 'mystack',
// });
// ```
export const makeGroup = function (items) {

    if (!items) return false;
    return new Group(items);
};

constructors.Group = Group;
