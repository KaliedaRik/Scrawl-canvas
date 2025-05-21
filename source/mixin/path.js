// # Path mixin
// This mixin defines the attributes and functionality required by an artefact so that it can position and rotate itself along the contours of a shape-based entity.


// #### Imports
import { artefact } from '../core/library.js';

import { isa_boolean, mergeOver, pushUnique, removeItem, Ωempty } from '../helper/utilities.js';

// Shared constants
import { _abs, PATH, START, ZERO_STR } from '../helper/shared-vars.js';

// Local constants (none defined)


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __path__ - reference Shape entity object. Can also be set using the Shape's name-String.
        path: ZERO_STR,

// __pathPosition__ - float Number between `0.0` - `1.0` representing the distance along the Shape path which is to be used as the reference coordinate.
        pathPosition: 0,

// __addPathHandle__, __addPathOffset__, __addPathRotation__ - Boolean flags. When set, the artifact will add its own values to the reference artefact's values, rather than use them as replacement values.
        addPathHandle: false,
        addPathOffset: true,
        addPathRotation: false,

// __constantSpeedAlongPath__ - Boolean flag. When set to true, corrections will be applied to make sure the artefact moves along the path at a constant speed (rather than slowing down when it approaches a bend)
        constantSpeedAlongPath: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.packetObjects = pushUnique(P.packetObjects, ['path']);


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const S = P.setters,
        D = P.deltaSetters;


// #### Prototype functions

// __path__
    S.path = function (item) {

        if (isa_boolean(item) && !item) {

            this.path = null;

            if (this.lockTo[0] === PATH) this.lockTo[0] = START;
            if (this.lockTo[1] === PATH) this.lockTo[1] = START;

            this.dirtyStampPositions = true;
            this.dirtyStampHandlePositions = true;
        }
        else {

            const oldPath = this.path,
                newPath = (item.substring) ? artefact[item] : item,
                name = this.name;

            if (newPath && newPath.name && newPath.useAsPath) {

                if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);

                pushUnique(newPath.pathed, name);

                this.path = newPath;
                this.dirtyStampPositions = true;
                this.dirtyStampHandlePositions = true;
            }

            // To help fix the bug where user has pathed to an artefact which they have not yet defined
            else if (newPath == null) this.path = item;
        }
    };

//  __pathPosition__
// + TODO: current functionality is for pathPosition to loop - is there a case for adding a pathPosition loop flag? If yes, then when that flag is false values < 0 would be corrected back to 0, and vals > 1 would be corrected back to 1.
    S.pathPosition = function (item) {

        if (item < 0) item = _abs(item);
        if (item > 1) item = item % 1;

        this.pathPosition = item;
        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
        this.currentPathData = false;
    };
    D.pathPosition = function (item) {

        let pos = this.pathPosition + item

        if (pos < 0) pos += 1;
        if (pos > 1) pos = pos % 1;

        this.pathPosition = pos;
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

        const path = this.path;

        if (path) {

            const val = path.getPathPositionData(this.pathPosition, this.constantSpeedAlongPath);

            if (this.addPathRotation) this.dirtyRotation = true;

            this.currentPathData = val;

            return val;
        }
        return false;
    };
}
