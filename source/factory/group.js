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


// #### Demos:
// + [Canvas-014](../../demo/canvas-014.html) - Line, quadratic and bezier Shapes - control lock alternatives
// + [Canvas-020](../../demo/canvas-020.html) - Testing createImageFromXXX functionality
// + [DOM-003](../../demo/dom-003.html) - Dynamically create and clone Element artefacts; drag and drop elements (including SVG elements) around a Stack
// + [DOM-008](../../demo/dom-008.html) - 3d animated cube
// + [DOM-009](../../demo/dom-009.html) - Stop and restart the main animation loop; add and remove event listener; retrieve all artefacts at a given coordinate


// #### Imports
import { constructors, cell, artefact, group, entity, asset } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, Ωempty } from '../core/utilities.js';
import { scrawlCanvasHold } from '../core/document.js';

import { filterEngine } from './filterEngine.js';
import { requestCell, releaseCell } from './cell.js';
import { importDomImage } from './imageAsset.js';

import baseMix from '../mixin/base.js';
import filterMix from '../mixin/filter.js';


// #### Group constructor
const Group = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.artefacts = [];
    this.artefactBuckets = [];

    this.set(this.defs);
    this.set(items);

    return this;
};


// #### Group prototype
let P = Group.prototype = Object.create(Object.prototype);
P.type = 'Group';
P.lib = 'group';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = filterMix(P);


// #### Group attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
let defaultAttributes = {

// __artefacts__ - an Array containing the names of all artefact objects included in this group.
    artefacts: null,

// __order__ - positive integer Number, which determines the order in which Stack and Cell controllers will process this Group object during the Display cycle
    order: 0,

// __visibility__ - Boolean flag; when unset, the Group will __not__ be processed by Stack and Cell controllers as part of the Display cycle
    visibility: true,

// __regionRadius__ - positive Number (measured in px), used as an initial test as part of collision detection functionality
    regionRadius: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['artefactBuckets', 'batchResort']);


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

    return clone;
};


// #### Kill management
P.kill = function (killArtefacts = false) {

    let myname = this.name;

    // Remove the Group object from affected Stack and Cell objects' `groups` attribute
    Object.entries(artefact).forEach(([name, art]) => {

        if (Array.isArray(art.groups) && art.groups.indexOf(myname) >= 0) {

            removeItem(art.groups, myname);
            art.batchResort = true;
        };
    });

    Object.entries(cell).forEach(([name, obj]) => {

        if (Array.isArray(obj.groups) && obj.groups.indexOf(myname) >= 0) {

            removeItem(obj.groups, myname);
            obj.batchResort = true;
        };
    });

    if (killArtefacts) this.artefactBuckets.forEach(item => item.kill());

    // Remove Group object from the Scrawl-canvas library
    return this.deregister();
}

P.killArtefacts = function () {

    this.artefactBuckets.forEach(item => item.kill());

    return this;
}


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters;

// Artefect membership of the Group object is better handled by the dedicated artefact management functions - __addArtefacts__, __removeArtefacts__, __clearArtefacts__, __moveArtefactsIntoGroup__.  

// Returns a new Array containing the name String values of current artefact members 
G.artefacts = function () {

    return [].concat(this.artefacts);
};

// Replaces the existing artefact membership with new members, supplied as an Array of name-String values
S.artefacts = function (item) {

    this.artefacts = [];

    this.addArtefacts(item);
};

// Adds the Group to a new controller Stack or Cell object. NOTE that this does not remove the Group from its existing host!
S.host = function (item) {

    let host = this.getHost(item);

    if (host && host.addGroups) {
        
        this.host = item;
        host.addGroups(this.name);

        this.dirtyHost = true;
    }
};

// Update the Group's `order` attribute, and tell its current host that it will need to resort its associated Groups
S.order = function (item) {

    let host = this.getHost(this.host);

    this.order = item;

    if (host) {

        host.set({
            batchResort: true
        });
    }
};


// #### Prototype functions

// `getHost` - internal helper function
P.getHost = function (item) {

    let host = this.currentHost;

    if (!host || host.substring) return artefact[item] || cell[item] || artefact[host] || cell[host] || null;
    else return host;
};

// `forceStamp` - invoke the Group to instruct its artefact members to perform a `stamp` action, ignoring whether the Group `visibility` flag setting
P.forceStamp = function () {

    let v = this.visibility;
    this.visibility = true;
    this.stamp()
    this.visibility = v;
};


// `stamp` - the Display Cycle is mediated through Groups.
P.stamp = function () {

    // Check we have a host of some sort (either a Stack artefact or a Cell asset)
    if (this.dirtyHost || !this.currentHost) {

        this.dirtyHost = false;

        let currentHost = this.getHost(this.host);

        if (currentHost) this.currentHost = currentHost;
        else this.dirtyHost = true;
    }

    if (this.visibility) {

        let { currentHost, stashOutput, noFilters, filters } = this;

        if (currentHost) {

            // Check if artefacts need to be sorterd and, if yes, sort them by their order attribute
            this.sortArtefacts();

            // Check to see if there is a Group filter in place or if the Group needs to stash its output and, if yes, pull a Cell asset from the pool
            let filterCell = (stashOutput || (!noFilters && filters && filters.length)) ?
                requestCell() :
                false;

            // Setup the pool Cell, if required
            if (filterCell && filterCell.element) {

                let dims = currentHost.currentDimensions;

                if (dims) {

                    filterCell.element.width = dims[0];
                    filterCell.element.height = dims[1];
                }
                filterCell.engine.save();
            }

            // We save/restore the canvas engine at this point because some entitys may have their `method` attribute set to `clip` and the only way to get rid of a clip region from an engine is to save the engine before applying the clip, then restoring the engine afterwards
            // + This has implications for tracking engine attributes
            else if (currentHost.engine) currentHost.engine.save();

            // Prepare the Group's artefacts for the forthcoming stamp activity
            this.prepareStamp(filterCell);

            // Get the Group's artefacts to stamp themselves on the current host or pool Cell
            this.stampAction(filterCell);

            if (filterCell) {

                filterCell.engine.restore();
                releaseCell(filterCell);
            }
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

        let floor = Math.floor,
            buckets = [];
        
        this.artefacts.forEach(name => {

            let obj = artefact[name],
                order = floor(obj.order) || 0;

            if (!buckets[order]) buckets[order] = [];

            buckets[order].push(obj);
        });

         this.artefactBuckets = buckets.reduce((a, v) => a.concat(v), []);
    }
};

// `prepareStamp` - initial action in the Display cycle, before Stacks/Cells start their clear/compile/show cascade
P.prepareStamp = function (myCell) {

    let host = this.currentHost;

    if (myCell) host = myCell;

    this.artefactBuckets.forEach(art => {

        if (art.lib === 'entity') {
            
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

    let mystash = (this.currentHost && this.currentHost.stashOutput) ? true : false;

    let { dirtyFilters, currentFilters, artefactBuckets, noFilters, filters, stashOutput, currentHost } = this;

    if (dirtyFilters || !currentFilters) this.cleanFilters();

    artefactBuckets.forEach(art => {

        if (art && art.stamp) art.stamp();
    });

    if (myCell) {

        if (!noFilters && filters && filters.length) {

            let img = this.applyFilters(myCell);
            this.stashAction(img);
        }
        else if (stashOutput) {

            // We set up things to draw the group on a pool cell if the Group's `stashOutput` flag is set to true - so now we have to paint it back into the host Cell
            let tempElement = myCell.element,
                tempEngine = myCell.engine,
                realEngine = (currentHost && currentHost.engine) ? currentHost.engine : false;

            if (realEngine) {

                realEngine.save();
                
                realEngine.globalCompositeOperation = 'source-over';
                realEngine.globalAlpha = 1;
                realEngine.setTransform(1, 0, 0, 1, 0, 0);

                realEngine.drawImage(tempElement, 0, 0);
                
                realEngine.restore();

                let tempImg = tempEngine.getImageData(0, 0, tempElement.width, tempElement.height);

                this.stashAction(tempImg);
            }
        }
    }
};

// `applyFilters` - filters can be applied to entity artefacts at the group level, in addition to any filters applied at the entity level.
P.applyFilters = function (myCell) {

    let currentHost = this.currentHost,
        filterHost = myCell;

    if (!currentHost || !filterHost) return false;

    // Get handles to current and filter Cell elements and engines
    let currentElement = currentHost.element,
        currentEngine = currentHost.engine;

    let filterCellElement = filterHost.element,
        filterCellEngine = filterHost.engine;

    // Action a request to use the filtered artefacts as a stencil - as determined by the Group's `isStencil` flag
    if (this.isStencil) {
        
        filterCellEngine.save();
        filterCellEngine.globalCompositeOperation = 'source-in';
        filterCellEngine.globalAlpha = 1;
        filterCellEngine.setTransform(1, 0, 0, 1, 0, 0);
        filterCellEngine.drawImage(currentElement, 0, 0);
        filterCellEngine.restore();
    } 

    // At this point we will send the contents of the filterHost canvas over to the filter engine
    filterCellEngine.setTransform(1, 0, 0, 1, 0, 0);

    let myimage = filterCellEngine.getImageData(0, 0, filterCellElement.width, filterCellElement.height);

    this.preprocessFilters(this.currentFilters);

    let img = filterEngine.action({
        image: myimage,
        filters: this.currentFilters,
    })

    if (img) {

        filterCellEngine.globalCompositeOperation = 'source-over';
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


// `stashAction` - internal function which creates an ImageAsset object (and, as determined by the setting of the Group's `stashOutputAsAsset` flag, an &lt;img> element which gets attached to the DOM document in the `scrawlCanvasHold` hidden &lt;div> element) from the Group's entity's output.
//
// NOTE: the `stashOutput` and `stashOutputAsAsset` flags are not Group object attributes. They are set on the group as a result of invoking the `scrawl.createImageFromGroup` function, and will be set to false as soon as the `Group.stashAction` function runs (in other words, stashing a Group's output is a one-off operation).
P.stashAction = function (img) {

    if (!img) return false;

    if (this.stashOutput) {

        this.stashOutput = false;

        let [x, y, width, height] = this.getCellCoverage(img);

        let myCell = requestCell(),
            myEngine = myCell.engine,
            myElement = myCell.element;

        myElement.width = width;
        myElement.height = height;

        myEngine.putImageData(img, -x, -y);

        this.stashedImageData = myEngine.getImageData(0, 0, width, height);

        if (this.stashOutputAsAsset) {

            this.stashOutputAsAsset = false;

            if (!this.stashedImage) {

                let newimg = this.stashedImage = document.createElement('img');

                newimg.id = `${this.name}-groupimage`;

                newimg.onload = function () {

                    scrawlCanvasHold.appendChild(newimg);
                    importDomImage(`#${newimg.id}`);
                };

                newimg.src = myElement.toDataURL();
            }
            else this.stashedImage.src = myElement.toDataURL();
        }
        releaseCell(myCell);
    }
};

// `getCellCoverage` - internal function which calculates the cumulative coverage of the Group's artefacts. Used as part of the `stashAction` functionality
P.getCellCoverage = function (img) {

    let width = img.width,
        height = img.height,
        data = img.data,
        maxX = 0,
        maxY = 0,
        minX = width,
        minY = height,
        counter = 3,
        x, y;

    for (y = 0; y < height; y++) {

        for (x = 0; x < width; x++) {

            if (data[counter]) {

                if (minX > x) minX = x;
                if (maxX < x) maxX = x;
                if (minY > y) minY = y;
                if (maxY < y) maxY = y;
            }

            counter += 4;
        }
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

    if (args && Array.isArray(args[0])) args = args[0];

    args.forEach(item => {

        if (item) {

            if (item.substring) pushUnique(this.artefacts, item);
            else if (item.name) pushUnique(this.artefacts, item.name);
        }
    }, this);

    this.batchResort = true;
    return this;
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

    let temp, art, grp;

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
    this.artefactBuckets.length = 0;
    this.batchResort = true;
    return this;
};


// `updateArtefacts` - passes the __items__ argument object through to each of the Group's artefact's `setDelta` function
P.updateArtefacts = function (items) {

    this.cascadeAction(items, 'setDelta');
    return this;
};


// `setArtefacts` - passes the __items__ argument object through to each of the Group's artefact's `set` function
P.setArtefacts = function (items) {

    this.cascadeAction(items, 'set');
    return this;
};

// `updateByDelta` - passes the __items__ argument object through to each of the Group's artefact's `updateByDelta` function
P.updateByDelta = function () {

    this.cascadeAction(false, 'updateByDelta');
    return this;
};

// `reverseByDelta` - passes the __items__ argument object through to each of the Group's artefact's `reverseByDelta` function
P.reverseByDelta = function () {

    this.cascadeAction(false, 'reverseByDelta');
    return this;
};

// `addArtefactClasses` - specifically for non-entity artefacts. Passes the __items__ argument String through to each of the Group's artefact's `addClasses` function
P.addArtefactClasses = function (items) {

    this.cascadeAction(items, 'addClasses');
    return this;
};

// `removeArtefactClasses` - specifically for non-entity artefacts. Passes the __items__ argument String through to each of the Group's artefact's `removeClasses` function
P.removeArtefactClasses = function (items) {

    this.cascadeAction(items, 'removeClasses');
    return this;
};


// `cascadeAction` - internal helper function for the above artefact manipulation functionality
P.cascadeAction = function (items, action) {

    this.artefacts.forEach(name => {

        let art = artefact[name];
        
        if(art && art[action]) art[action](items);
    });
    return this;
};


// `setDeltaValues` - passes the __items__ argument object through to each of the Group's artefact's `setDeltaValues` function
P.setDeltaValues = function (items = Ωempty) {

    this.artefactBuckets.forEach(art => art.setDeltaValues(items));

    return this;
};

// We can add and remove filters to each of the Group's entity artefacts using the following functions. The argument for each function can be one or more Filter name-Strings, or the Filter objects themselves, separated by commas.

// `addFiltersToEntitys`
P.addFiltersToEntitys = function (...args) {

    this.artefacts.forEach(name => {

        let ent = entity[name];
        
        if (ent && ent.addFilters) ent.addFilters(args);
    });
    return this;
};

// `removeFiltersFromEntitys`
P.removeFiltersFromEntitys = function (...args) {

    this.artefacts.forEach(name => {

        let ent = entity[name];

        if (ent && ent.removeFilters) ent.removeFilters(args);
    });
    return this;
};

// `clearFiltersFromEntitys` - clears all filters from all the Group's entity artefacts.
P.clearFiltersFromEntitys = function () {

    this.artefacts.forEach(name => {

        let ent = entity[name];

        if (ent && ent.clearFilters) ent.clearFilters();
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

    let myCell = requestCell(),
        artBuckets = this.artefactBuckets;

    this.sortArtefacts();

    for (let i = artBuckets.length - 1; i >= 0; i--) {

        let art = artBuckets[i];
        
        if (art) {

            let result = art.checkHit(items, myCell);

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

    let myCell = requestCell(),
        artBuckets = this.artefactBuckets,
        resultNames = [],
        results = [];

    this.sortArtefacts();
    
    for (let i = artBuckets.length - 1; i >= 0; i--) {

        let art = artBuckets[i];
        
        if (art) {

            let result = art.checkHit(items, myCell);
            
            if (result && result.artefact) {

                let hit = result.artefact;

                if (resultNames.indexOf(hit.name) < 0) {

                    resultNames.push(hit.name);
                    results.push(result);
                }
            }
        }
    }

    releaseCell(myCell);
    return results;
};


// The `getArtefactCollisions` function returns an array of hit reports from all of the Group object's artefacts which are currently in collision with the __sensor__ coordinates supplied by the artefact argument. The function will always return an array of hit reports, or an empty array if no hits are reported.
//
// The argument must be either the artefact object itself, or its String name.
P.getArtefactCollisions = function (art) {

    // return empty array if no argument, or the argument is not an artefact, or the Group is empty
    if (!art || !art.isArtefact || !this.artefactBuckets.length) return [];

    if (art.substring) art = artefact[art];

    // Return empty array if the artefact argument has not been setup to check for collisions
    if (!art.collides) return [];

    let artBuckets = this.artefactBuckets,
        targets = [],
        target, i, iz;

    // Get entity collision data
    let [entityRadius, entitySensors] = art.cleanCollisionData();

    // Winnow step 1: don't check the entity itself, or any missing or malformed artefacts in the Group
    for (i = 0, iz = artBuckets.length; i < iz; i++) {

        target = artBuckets[i];

        if (!target || !target.cleanCollisionData || art.name === target.name) targets.push(false);
        else targets.push(target);
    }

    // Winnow step 2: exclude all targets outside the artefact/target collision radius
    let [entityStampX, entityStampY] = art.currentStampPosition;

    let combinedRadius, targetData, dx, dy, dh;

    for (i = 0, iz = targets.length; i < iz; i++) {

        target = targets[i];

        if (target) {

            let [targetStampX, targetStampY] = target.currentStampPosition;

            targetData = target.cleanCollisionData();
            combinedRadius = entityRadius + targetData[0];

            dx = entityStampX - targetStampX;
            dy = entityStampY - targetStampY;
            dh = Math.sqrt((dx * dx) + (dy * dy));

            if (dh > combinedRadius) targets[i] = false;
        }
    }

    // Winnow step 3: perform hit checks on remaining targets - this will not retrieve targets entirely inside the artefact
    let myCell = requestCell();

    for (i = 0, iz = targets.length; i < iz; i++) {

        target = targets[i];

        if (target) targets[i] = target.checkHit(entitySensors, myCell);
    }

    // return filtered results
    releaseCell(myCell);

    return targets.filter(target => !!target);
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
const makeGroup = function (items) {

    if (!items) return false;
    return new Group(items);
};

constructors.Group = Group;

// #### Exports
export {
    makeGroup,
};
