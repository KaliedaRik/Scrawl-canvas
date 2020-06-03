// # Shape-curve mixin
// This mixin defines additional attributes and functionality used byScrawl-canvas __line__, __quadratic__ and __bezier__ path-defined entitys. 
//
// These entitys have additional positioning coordinates (`startControl` and `endControl` for Bezier entitys; `control` for Quadratic entitys; all three entity types use the `end` coordinate) which we use to construct and position them. Other artefacts can pivot themselves to these coordinates, and path-defined entitys can pivot the coordinates to other artefacts.

// #### Imports
import { artefact } from '../core/library.js';
import { mergeOver, isa_boolean, xt, xta, addStrings, removeItem, pushUnique } from '../core/utilities.js';

import { makeCoordinate } from '../factory/coordinate.js';


const capitalize = (s) => {

    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

        end: null,
        currentEnd: null,

        endPivot: '',
        endPivotCorner: '',
        addEndPivotHandle: false,
        addEndPivotOffset: false,

        endPath: '',
        endPathPosition: 0,
        addEndPathHandle: false,
        addEndPathOffset: true,

        endLockTo: '',

        useStartAsControlPoint: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['controlledLineOffset']);
    P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
    P.packetCoordinates = pushUnique(P.packetCoordinates, ['end']);
    P.packetObjects = pushUnique(P.packetObjects, ['endPivot', 'endPath']);
    P.packetFunctions = pushUnique(P.packetFunctions, []);


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
P.factoryKill = function () {

    Object.entries(artefact).forEach(([name, art]) => {

        if (art.name !== this.name) {

            if (art.startControlPivot && art.startControlPivot.name === this.name) art.set({ startControlPivot: false});
            if (art.controlPivot && art.controlPivot.name === this.name) art.set({ controlPivot: false});
            if (art.endControlPivot && art.endControlPivot.name === this.name) art.set({ endControlPivot: false});
            if (art.endPivot && art.endPivot.name === this.name) art.set({ endPivot: false});

            if (art.startControlPath && art.startControlPath.name === this.name) art.set({ startControlPath: false});
            if (art.controlPath && art.controlPath.name === this.name) art.set({ controlPath: false});
            if (art.endControlPath && art.endControlPath.name === this.name) art.set({ endControlPath: false});
            if (art.endPath && art.endPath.name === this.name) art.set({ endPath: false});
        }
    });
};


// #### Get, Set, deltaSet
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;

    // __useStartAsControlPoint__
    S.useStartAsControlPoint = function (item) {

        this.useStartAsControlPoint = item;

        if (!item) {

            let controlledLine = this.controlledLineOffset;
            controlledLine[0] = 0;
            controlledLine[1] = 0;
        }

        this.updateDirty();
    };

    // __endPivot__
    S.endPivot = function (item) {

        this.setControlHelper(item, 'endPivot', 'end');
        this.updateDirty();
        this.dirtyEnd = true;
    };

    // __endPath__
    S.endPath = function (item) {

        this.setControlHelper(item, 'endPath', 'end');
        this.updateDirty();
        this.dirtyEnd = true;
    };

    // __endPathPosition__
    S.endPathPosition = function (item) {

        this.endPathPosition = item;
        this.dirtyEnd = true;
        this.currentEndPathData = false;
    };
    D.endPathPosition = function (item) {

        this.endPathPosition += item;
        this.dirtyEnd = true;
        this.currentEndPathData = false;
    };

    // __end__
    // + pseudo-attributes __endX__, __endY__
    S.endX = function (coord) {

        if (coord != null) {

            this.end[0] = coord;
            this.updateDirty();
            this.dirtyEnd = true;
            this.currentEndPathData = false;
        }
    };
    S.endY = function (coord) {

        if (coord != null) {

            this.end[1] = coord;
            this.updateDirty();
            this.dirtyEnd = true;
            this.currentEndPathData = false;
        }
    };
    S.end = function (x, y) {

        this.setCoordinateHelper('end', x, y);
        this.updateDirty();
        this.dirtyEnd = true;
        this.currentEndPathData = false;
    };
    D.endX = function (coord) {

        let c = this.end;
        c[0] = addStrings(c[0], coord);
        this.updateDirty();
        this.dirtyEnd = true;
        this.currentEndPathData = false;
    };
    D.endY = function (coord) {

        let c = this.end;
        c[1] = addStrings(c[1], coord);
        this.updateDirty();
        this.dirtyEnd = true;
        this.currentEndPathData = false;
    };
    D.end = function (x, y) {

        this.setDeltaCoordinateHelper('end', x, y);
        this.updateDirty();
        this.dirtyEnd = true;
        this.currentEndPathData = false;
    };

    // __endLockTo__
    S.endLockTo = function (item) {

        this.endLockTo = item;
        this.updateDirty();
        this.dirtyEndLock = true;
        this.currentEndPathData = false;
    };

// #### Prototype functions

    // `curveInit` - internal constructor helper function
    P.curveInit = function (items) {

        this.end = makeCoordinate();
        this.currentEnd = makeCoordinate();
        this.endLockTo = 'coord';
        this.dirtyEnd = true;

        this.dirtyPins = [];

        this.controlledLineOffset = makeCoordinate();
    };


    // `setControlHelper` - internal setter helper function
    P.setControlHelper = function (item, attr, label) {

        let isPivot = (attr.indexOf('Pivot') > 0) ? true : false;

        if (isa_boolean(item) && !item) {

            this[attr] = null;

            if (isPivot) {

                if (this[`${label}LockTo`] === 'pivot') {

                    this[`${label}LockTo`] = 'start';

                    if (label === 'startControl') this.dirtyStartControlLock = true;
                    else if (label === 'control') this.dirtyControlLock = true;
                    else if (label === 'endControl') this.dirtyEndControlLock = true;
                    else this.dirtyEndLock = true;
                }
            }
            else {

                if (this[`${label}LockTo`] === 'path') {

                    this[`${label}LockTo`] = 'start';

                    if (label === 'startControl') this.dirtyStartControlLock = true;
                    else if (label === 'control') this.dirtyControlLock = true;
                    else if (label === 'endControl') this.dirtyEndControlLock = true;
                    else this.dirtyEndLock = true;
                }
            }
        }
        else if (item) {

            let oldControl = this[attr],
                newControl = (item.substring) ? artefact[item] : item;

            if (newControl && newControl.isArtefact) {

                if (oldControl && oldControl.isArtefact) {

                    if (isPivot) removeItem(oldControl.pivoted, this.name);
                    else removeItem(oldControl.pathed, this.name);
                }

                if (isPivot) pushUnique(newControl.pivoted, this.name);
                else pushUnique(newControl.pathed, this.name);

                this[attr] = newControl;
            }
        }
    };

    // `buildPathPositionObject` - internal function called by `getPathPositionData`
    P.buildPathPositionObject = function (unit, myLen) {

        if (unit) {

            let [unitSpecies, ...vars] = unit;

            let myPoint, angle;

            switch (unitSpecies) {

                case 'linear' :
                    myPoint = this.positionPointOnPath(this.getLinearXY(myLen, ...vars));
                    angle = this.getLinearAngle(myLen, ...vars);
                    break;

                case 'quadratic' :
                    myPoint = this.positionPointOnPath(this.getQuadraticXY(myLen, ...vars));
                    angle = this.getQuadraticAngle(myLen, ...vars);
                    break;
                    
                case 'bezier' :
                    myPoint = this.positionPointOnPath(this.getBezierXY(myLen, ...vars));
                    angle = this.getBezierAngle(myLen, ...vars);
                    break;
            }

            let flipAngle = 0
            if (this.flipReverse) flipAngle++;
            if (this.flipUpend) flipAngle++;

            if (flipAngle === 1) angle = -angle;

            angle += this.roll;

            let stamp = this.currentStampPosition,
                lineOffset = this.controlledLineOffset,
                localBox = this.localBox;

            myPoint.x += lineOffset[0];
            myPoint.y += lineOffset[1];

            myPoint.angle = angle;

            return myPoint;
        }
        return false;
    };


// #### Display cycle functionality

// `prepareStamp` - the purpose of most of these actions is described in the [entity mixin function](http://localhost:8080/docs/source/mixin/entity.html#section-31) that this function overwrites
    P.prepareStamp = function() {

        if (this.dirtyHost) this.dirtyHost = false;

        // `preparePinsForStamp` function defined in line, quadratic and bezier modules
        if (this.dirtyPins.length) {

            this.preparePinsForStamp();
        }

// `dirtyLock` flags (one for each control) - trigger __cleanLock__ functions - which in turn set appropriate dirty flags on the entity.
        if (this.dirtyLock) this.cleanLock();
        if (this.dirtyStartControlLock) this.cleanControlLock('startControl');
        if (this.dirtyEndControlLock) this.cleanControlLock('endControl');
        if (this.dirtyControlLock) this.cleanControlLock('control');
        if (this.dirtyEndLock) this.cleanControlLock('end');

        if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd || this.dirtyHandle) {

            this.dirtyPathObject = true;
            if (this.collides) this.dirtyCollision = true;

// `dirtySpecies` flag is specific to Shape entitys
            if (this.useStartAsControlPoint && this.dirtyStart) {

                this.dirtySpecies = true;
                this.pathCalculatedOnce = false;
            }

// `pathCalculatedOnce` - calculating path data is an expensive operation - use this flag to limit the calculation to run only when needed
            if (this.dirtyScale || this.dirtySpecies || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd)  this.pathCalculatedOnce = false;
        }

        if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

            this.dirtyStampPositions = true;
            if (this.collides) this.dirtyCollision = true;

// `useStartAsControlPoint` 
// + When false, this flag indicates that line, quadratic and bezier shapes should treat `start` Coordinate updates as an instruction to move the entire Shape. 
// + When true, the Coordinate is used to define the shape of the Shape relative to its other control/end Coordinates
            if (this.useStartAsControlPoint) {

                this.dirtySpecies = true;
                this.dirtyPathObject = true;
                this.pathCalculatedOnce = false;
            }
        }

        if ((this.dirtyRotation || this.dirtyOffset) && this.collides) this.dirtyCollision = true;

        if (this.dirtyCollision && !this.useAsPath) {

            this.dirtyPathObject = true;
            this.pathCalculatedOnce = false;
        }

        if (this.dirtyScale) this.cleanScale();

        if (this.dirtyStart) this.cleanStart();
        if (this.dirtyStartControl) this.cleanControl('startControl');
        if (this.dirtyEndControl) this.cleanControl('endControl');
        if (this.dirtyControl) this.cleanControl('control');
        if (this.dirtyEnd) this.cleanControl('end');

        if (this.dirtyOffset) this.cleanOffset();
        if (this.dirtyRotation) this.cleanRotation();

        if (this.dirtyStampPositions) this.cleanStampPositions();

// `cleanSpecies` - creates the SVG path String which will be used by `cleanPathObject` - each species creates the local path in its own way
        if (this.dirtySpecies) this.cleanSpecies();
        if (this.dirtyPathObject) this.cleanPathObject();

        if (this.dirtyPositionSubscribers) {

            this.updatePositionSubscribers();
            this.updateControlPathSubscribers();
        }
    };

// `cleanControlLock` - internal helper function - called by `prepareStamp`
    P.cleanControlLock = function (label) {

        let capLabel = capitalize(label);

        this[`dirty${capLabel}Lock`] = false;
        this[`dirty${capLabel}`] = true;
    };

// `cleanControl` - internal helper function - called by `prepareStamp`
    P.cleanControl = function (label) {

        let capLabel = capitalize(label);

        this[`dirty${capLabel}`] = false;

        let pivotLabel = `${label}Pivot`,
            pathLabel = `${label}Path`,
            pivot = this[pivotLabel],
            path = this[pathLabel],
            art, pathData;

        if (pivot && pivot.substring) {

            art = artefact[pivot];

            if (art) pivot = art;
        }

        if (path && path.substring) {

            art = artefact[path];

            if (art) path = art;
        }

        let lock = this[`${label}LockTo`], 
            x, y, ox, oy, here, flag,
            raw = this[label],
            current = this[`current${capLabel}`];

        if (lock === 'pivot' && (!pivot || pivot.substring)) lock = 'coord';
        else if (lock === 'path' && (!path || path.substring)) lock = 'coord';

        switch(lock) {

            case 'pivot' :

                if (this.pivotCorner && pivot.getCornerCoordinate) {

                    [x, y] = pivot.getCornerCoordinate(this[`${label}PivotCorner`]);
                }
                else [x, y] = pivot.currentStampPosition;

                if (!this.addPivotOffset) {

                    [ox, oy] = pivot.currentOffset;
                    x -= ox;
                    y -= oy;
                }

                break;

            case 'path' :

                pathData = this.getControlPathData(path, label, capLabel);

                x = pathData.x;
                y = pathData.y;

                if (!this.addPathOffset) {

                    x -= path.currentOffset[0];
                    y -= path.currentOffset[1];
                }

                break;

            case 'mouse' :

                here = this.getHere();

                x = here.x || 0;
                y = here.y || 0;

                break;

            default :
                
                x = y = 0;

                here = this.getHere();

                if (xt(here)) {

                    if (xta(here.w, here.h)) {

                        this.cleanPosition(current, raw, [here.w, here.h]);
                        [x, y] = current;
                    }
                }
        }

        current[0] = x;
        current[1] = y;

        this.dirtySpecies = true;
        this.dirtyPathObject = true;
        this.dirtyPositionSubscribers = true;
    };

// `getControlPathData` - internal helper function - called by `cleanControl`
    P.getControlPathData = function (path, label, capLabel) {

        let checkAttribute = this[`current${capLabel}PathData`];

        if (checkAttribute) return checkAttribute;

        let pathPos = this[`${label}PathPosition`],
            tempPos = pathPos,
            pathData = path.getPathPositionData(pathPos);

        if (pathPos < 0) pathPos += 1;
        if (pathPos > 1) pathPos = pathPos % 1;

        pathPos = parseFloat(pathPos.toFixed(6));
        if (pathPos !== tempPos) this[`${label}PathPosition`] = pathPos;

        if (pathData) {

            this[`current${capLabel}PathData`] = pathData;
            return pathData;
        }

        else {

            let here = this.getHere();

            if (xt(here)) {

                if (xta(here.w, here.h)) {

                    let current = this[`current${capLabel}`];

                    this.cleanPosition(current, this[label], [here.w, here.h]);

                    return {
                        x: current[0],
                        y: current[1]
                    };
                }
            }
            return {
                x: 0,
                y: 0
            };
        }
    };

// `updateControlPathSubscribers`
    P.updateControlPathSubscribers = function () {

        // THIS WON'T WORK - got rid of these 'subscriber' Arrays!
        let items = [].concat(this.endSubscriber, this.endControlSubscriber, this.controlSubscriber, this.startControlSubscriber);

        items.forEach(name => {

            let instance = artefact[name];

            if (instance) {

                if (instance.type === 'Line' || instance.type === 'Quadratic' || instance.type === 'Bezier') {

                    if (instance.type === 'Quadratic') {

                        instance.dirtyControl = true;
                        instance.currentControlPathData = false;
                    }

                    else if (instance.type === 'Bezier') {

                        instance.dirtyStartControl = true;
                        instance.dirtyEndControl = true;
                        instance.currentStartControlPathData = false;
                        instance.currentEndControlPathData = false;
                    }
                    instance.currentEndPathData = false;
                    instance.dirtyEnd = true;
                }
                instance.currentPathData = false;
                instance.dirtyStart = true;
            }
        });
    };


// Return the prototype
    return P;
};
