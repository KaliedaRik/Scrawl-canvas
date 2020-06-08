// # Position-physics mixin
// This mixin defines additional attributes and functions for an artefact that uses physics functionality


// #### Imports
import { artefact } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, isa_boolean } from '../core/utilities.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

// __path__ - reference Shape entity object. Can also be set using the Shape's name-String.
        path: '',

// __pathPosition__ - float Number between `0.0` - `1.0` representing the distance along the Shape path which is to be used as the reference coordinate.
        pathPosition: 0,

// __addPathHandle__, __addPathOffset__, __addPathRotation__ - Boolean flags. When set, the artifact will add its own values to the reference artefact's values, rather than use them as replacement values.
        addPathHandle: false,
        addPathOffset: true,
        addPathRotation: false,
        constantPathSpeed: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);
    mergeOver(P, defaultAttributes);


// #### Packet management
    P.packetObjects = pushUnique(P.packetObjects, ['path']);


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    let S = P.setters,
        D = P.deltaSetters;


// #### Prototype functions

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
        this.currentPathData = false;
    };
    D.pathPosition = function (item) {

        let pos = this.pathPosition + item

        if (pos < 0) pos += 1;
        if (pos > 1) pos = pos % 1;

        this.pathPosition = parseFloat(pos.toFixed(6));
        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
        this.currentPathData = false;
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


// #### Prototype functions

// `getPathData`
    P.getPathData = function () {

        if (this.currentPathData) return this.currentPathData;

        let pathPos = this.pathPosition,
            path = this.path,
            currentPathData;

        if (path) {

            currentPathData = path.getPathPositionData(pathPos, this.constantPathSpeed);

            if (this.addPathRotation) this.dirtyRotation = true;

            this.currentPathData = currentPathData;

            return currentPathData;
        }
        return false;
    };


// Return the prototype
    return P;
};
