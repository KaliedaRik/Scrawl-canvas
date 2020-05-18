// # Shape-curve mixin
// This mixin defines additional attributes and functionality used byScrawl-canvas __line__, __quadratic__ and __bezier__ path-defined entitys. 
//
// These entitys have additional positioning coordinates (`startControl` and `endControl` for Bezier entitys; `control` for Quadratic entitys; all three entity types use the `end` coordinate) which we use to construct and position them. Other artefacts can pivot themselves to these coordinates, and path-defined entitys can pivot the coordinates to other artefacts.

// #### Imports
import { artefact } from '../core/library.js';
import { mergeOver, isa_boolean, xt, xta, addStrings, capitalize, removeItem, pushUnique } from '../core/utilities.js';

import { makeCoordinate } from '../factory/coordinate.js';


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

    // __end__
    // + pseudo-attributes __endX__, __endY__
    S.endX = function (coord) {

        if (coord != null) {

            this.end[0] = coord;
            this.updateDirty();
            this.dirtyEnd = true;
        }
    };
    S.endY = function (coord) {

        if (coord != null) {

            this.end[1] = coord;
            this.updateDirty();
            this.dirtyEnd = true;
        }
    };
    S.end = function (x, y) {

        this.setCoordinateHelper('end', x, y);
        this.updateDirty();
        this.dirtyEnd = true;
    };
    D.endX = function (coord) {

        let c = this.end;
        c[0] = addStrings(c[0], coord);
        this.updateDirty();
        this.dirtyEnd = true;
    };
    D.endY = function (coord) {

        let c = this.end;
        c[1] = addStrings(c[1], coord);
        this.updateDirty();
        this.dirtyEnd = true;
    };
    D.end = function (x, y) {

        this.setDeltaCoordinateHelper('end', x, y);
        this.updateDirty();
        this.dirtyEnd = true;
    };

    // __endLockTo__
    S.endLockTo = function (item) {

        this.endLockTo = item;
        this.updateDirty();
        this.dirtyEndLock = true;
    };

// #### Prototype functions

    // `curveInit` - internal constructor helper function
    P.curveInit = function (items) {

        this.end = makeCoordinate();
        this.currentEnd = makeCoordinate();
        this.endLockTo = 'coord';
        this.dirtyEnd = true;

        this.controlledLineOffset = makeCoordinate();
    };


    // `setControlHelper` - internal setter helper function
    P.setControlHelper = function (item, attr, label) {

        if (isa_boolean(item) && !item) {

            this[attr] = null;

            if (attr.indexOf('Pivot') > 0) {

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

                if (oldControl && oldControl.isArtefact && oldControl[`${label}Subscriber`]) removeItem(oldControl[`${label}Subscriber`], this.name);

                if (newControl[`${label}Subscriber`]) pushUnique(newControl[`${label}Subscriber`], this.name);

                this[attr] = newControl;
            }
        }
    };

    // `getPathPositionData`
    P.getPathPositionData = function (pos) {

        if (xt(pos) && pos.toFixed) {

            let remainder = pos % 1,
                unitPartials = this.unitPartials,
                previousLen = 0, 
                stoppingLen, myLen, i, iz, unit, species;

            // ... because sometimes everything doesn't all add up to 1
            if (pos === 0) remainder = 0;
            else if (pos === 1) remainder = 0.9999;

            // 1. Determine the pertinent subpath to use for calculation
            for (i = 0, iz = unitPartials.length; i < iz; i++) {

                species = this.units[i][0];
                if (species === 'move' || species === 'close' || species === 'unknown') continue;

                stoppingLen = unitPartials[i];

                if (remainder <= stoppingLen) {

                    // 2. Calculate point along the subpath the pos value represents
                    unit = this.units[i];
                    myLen = (remainder - previousLen) / (stoppingLen - previousLen);

                    break;
                }

                previousLen = stoppingLen;
            }

            // 3. Get coordinates and angle at that point from subpath; return results
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
        }
        return false;
    }


// #### Display cycle functionality

// `prepareStamp` - the purpose of most of these actions is described in the [entity mixin function](http://localhost:8080/docs/source/mixin/entity.html#section-31) that this function overwrites
    P.prepareStamp = function() {

        if (this.dirtyHost) this.dirtyHost = false;

// `dirtyLock` flags (one for each control) - trigger __cleanLock__ functions - which in turn set appropriate dirty flags on the entity.
        if (this.dirtyLock) this.cleanLock();
        if (this.dirtyStartControlLock) this.cleanControlLock('startControl');
        if (this.dirtyEndControlLock) this.cleanControlLock('endControl');
        if (this.dirtyControlLock) this.cleanControlLock('control');
        if (this.dirtyEndLock) this.cleanControlLock('end');

        if (this.startControlLockTo === 'path') this.dirtyStartControl = true;
        if (this.endControlLockTo === 'path') this.dirtyEndControl = true;
        if (this.controlLockTo === 'path') this.dirtyControl = true;
        if (this.endLockTo === 'path') this.dirtyEnd = true;

        if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd || this.dirtyHandle || this.dirtyPins) {

            this.dirtyPathObject = true;
            if (this.collides) this.dirtyCollision = true;

// `dirtySpecies` flag is specific to Shape entitys
            if (this.useStartAsControlPoint && this.dirtyStart) {

                this.dirtySpecies = true;
                this.pathCalculatedOnce = false;
            }

// `pathCalculatedOnce` - calculating path data is an expensive operation - use this flag to limit the calculation to run only when needed
            if (this.dirtyScale || this.dirtySpecies || this.dirtyStartControl || this.dirtyEndControl || this.dirtyControl || this.dirtyEnd || this.dirtyPins)  this.pathCalculatedOnce = false;

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

        if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
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

        this.updatePathSubscribers();
    };

// `getControlPathData` - internal helper function - called by `cleanControl`
    P.getControlPathData = function (path, label, capLabel) {

        let pathPos = this[`${label}PathPosition`],
            tempPos = pathPos,
            pathData = path.getPathPositionData(pathPos);

        if (pathPos < 0) pathPos += 1;
        if (pathPos > 1) pathPos = pathPos % 1;

        pathPos = parseFloat(pathPos.toFixed(6));
        if (pathPos !== tempPos) this[`${label}PathPosition`] = pathPos;

        if (pathData) return pathData;

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

// `cleanDimensions` - internal helper function called by `prepareStamp` 
// + Dimensional data has no meaning in the context of Shape entitys (beyond positioning handle Coordinates): width and height are emergent properties that cannot be set on the entity.
    P.cleanDimensions = function () {

        this.dirtyDimensions = false;
        this.dirtyHandle = true;
        this.dirtyOffset = true;

        this.dirtyStart = true;
        this.dirtyStartControl = true;
        this.dirtyEndControl = true;
        this.dirtyControl = true;
        this.dirtyEnd = true;
    };

// `updatePathSubscribers`
    P.updatePathSubscribers = function () {

        this.pathed.forEach(name => {

            let instance = artefact[name];

            if (instance) {

                instance.dirtyStart = true;
                if (instance.addPathHandle) instance.dirtyHandle = true;
                if (instance.addPathOffset) instance.dirtyOffset = true;
                if (instance.addPathRotation) instance.dirtyRotation = true;
            }
        });
    };

// Return the prototype
    return P;
};
