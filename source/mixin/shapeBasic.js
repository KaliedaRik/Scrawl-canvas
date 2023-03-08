// # Shape-basic mixin
// This mixin defines the key attributes and functionality for all Scrawl-canvas __path-defined entitys__. 

// #### Imports
import { artefact } from '../core/library.js';
import { radian, mergeOver, xt, λnull, pushUnique, Ωempty } from '../core/utilities.js';

import { requestVector, releaseVector } from '../factory/vector.js';

import calculatePath from './shapePathCalculation.js';

import entityMix from './entity.js';


// #### Export function
export default function (P = Ωempty) {


// #### Mixins
// + [entity](../mixin/entity.html)
    P = entityMix(P);


// #### Shared attributes
    let defaultAttributes = {

        species: '',
        useAsPath: false,

        precision: 10,
        constantPathSpeed: false,

        pathDefinition: '',

        showBoundingBox: false,
        boundingBoxColor: 'rgb(0 0 0 / 0.5)',
        minimumBoundingBoxDimensions: 20,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['dimensions', 'pathed']);
    P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
    P.packetCoordinates = pushUnique(P.packetCoordinates, []);
    P.packetObjects = pushUnique(P.packetObjects, []);
    P.packetFunctions = pushUnique(P.packetFunctions, []);

    P.finalizePacketOut = function (copy, items) {

        let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
        copy = mergeOver(copy, stateCopy);

        copy = this.handlePacketAnchor(copy, items);

        return copy;
    };


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    let G = P.getters,
        S = P.setters,
        D = P.deltaSetters;

    S.species = function (item) {

        if (xt(item)) {

            this.species = item;
            this.updateDirty();
        }
    };

    S.precision = function (item) {

        if (xt(item) && item.toFixed) {

            this.precision = item;
            this.updateDirty();
        }
    };

    S.constantPathSpeed = function (item) {

        this.constantPathSpeed = item;
        this.updateDirty();
    };

    // Invalidate __dimensions__ setters - dimensions are an emergent property of shapes, not a defining property
    S.width = λnull;
    S.height = λnull;
    S.dimensions = λnull;
    D.width = λnull;
    D.height = λnull;
    D.dimensions = λnull;

    // __pathDefinition__
    S.pathDefinition = function (item) {

        if (item.substring) this.pathDefinition = item;
        this.pathCalculatedOnce = false;
        this.dirtyPathObject = true;
    };


// #### Prototype functions

    // `updateDirty` - internal setter helper function
    P.updateDirty = function () {

        this.dirtySpecies = true;
        this.dirtyPathObject = true;
        this.dirtyFilterIdentifier = true;
    };

    // `midInitActions` - internal constructor helper function
    P.midInitActions = function (items) {

        this.set(items);
    };

    // `shapeInit` - internal constructor helper function
    P.shapeInit = function (items) {

        this.entityInit(items);

        this.units = [];
        this.unitLengths = [];
        this.unitPartials = [];

        this.pathed = [];

        this.localBox = [];
    };


// #### Path-related functionality

    // `positionPointOnPath`
    P.positionPointOnPath = function (vals) {

        let v = requestVector(vals);

        v.vectorSubtract(this.currentStampHandlePosition);

        if(this.flipReverse) v.x = -v.x;
        if(this.flipUpend) v.y = -v.y;

        v.rotate(this.roll);

        v.vectorAdd(this.currentStampPosition);

        let res = {
            x: v.x,
            y: v.y
        }

        releaseVector(v);

        return res;
    };

    // `getBezierXY`
    P.getBezierXY = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

        let T = 1 - t;

        return {
            x: (Math.pow(T, 3) * sx) + (3 * t * Math.pow(T, 2) * cp1x) + (3 * t * t * T * cp2x) + (t * t * t * ex),
            y: (Math.pow(T, 3) * sy) + (3 * t * Math.pow(T, 2) * cp1y) + (3 * t * t * T * cp2y) + (t * t * t * ey)
        };
    };

    // `getQuadraticXY`
    P.getQuadraticXY = function (t, sx, sy, cp1x, cp1y, ex, ey) {

        let T = 1 - t;

        return {
            x: T * T * sx + 2 * T * t * cp1x + t * t * ex,
            y: T * T * sy + 2 * T * t * cp1y + t * t * ey
        };
    };

    // `getLinearXY`
    P.getLinearXY = function (t, sx, sy, ex, ey) {

        return {
            x: sx + ((ex - sx) * t),
            y: sy + ((ey - sy) * t)
        };
    };

    // `getBezierAngle`
    P.getBezierAngle = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

        let T = 1 - t,
            dx = Math.pow(T, 2) * (cp1x - sx) + 2 * t * T * (cp2x - cp1x) + t * t * (ex - cp2x),
            dy = Math.pow(T, 2) * (cp1y - sy) + 2 * t * T * (cp2y - cp1y) + t * t * (ey - cp2y);

        return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
    };

    // `getQuadraticAngle`
    P.getQuadraticAngle = function (t, sx, sy, cp1x, cp1y, ex, ey) {

        let T = 1 - t,
            dx = 2 * T * (cp1x - sx) + 2 * t * (ex - cp1x),
            dy = 2 * T * (cp1y - sy) + 2 * t * (ey - cp1y);

        return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
    };

    // `getLinearAngle`
    P.getLinearAngle = function (t, sx, sy, ex, ey) {

        let dx = ex - sx,
            dy = ey - sy;

        return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
    };

    // `getConstantPosition` - internal function called by `getPathPositionData`
    P.getConstantPosition = function (pos) {

        if (!pos || !pos.toFixed || isNaN(pos)) return 0;
        if (pos >= 1) return 0.9999;

        let positions = this.unitPositions;

        if (positions && positions.length) {

            let len = this.length,
                progress = this.unitProgression,
                positions = this.unitPositions,
                requiredProgress = pos * len,
                index = -1,
                currentProgress, indexProgress, lastProgress, diffProgress,
                currentPosition, indexPosition, nextPosition, diffPosition;

            for (let i = 0, iz = progress.length; i < iz; i++) {

                if (requiredProgress <= progress[i]) {

                    index = i - 1;
                    break;
                }
            }

            if (index < 0) {

                // first segment
                indexProgress = progress[0];
                currentPosition = (requiredProgress / indexProgress) * positions[0];
            }
            else {

                // subsequent segments - progress is pixel lengths
                indexProgress = progress[index];
                lastProgress = (index) ? progress[index - 1] : 0;
                diffProgress = indexProgress - lastProgress;

                // ... and position is in the range 0-1
                indexPosition = positions[index];
                nextPosition = positions[index + 1];
                diffPosition = nextPosition - indexPosition;

                currentPosition = indexPosition + (((requiredProgress - indexProgress) / diffProgress) * diffPosition);
            }
            return currentPosition;
        }
        else return pos;
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

            myPoint.angle = angle;

            return myPoint;
        }
        return false;
    }

    // `getPathPositionData` - function called by `getPathPositionData`
    // + Also useful in user code to retrieve the Cell-relative coordinates of any point (measured as a float Number between `0` and `1` along the path)
    // + The second argument - a Boolean - rectifies for constant speed
    P.getPathPositionData = function (pos, constantSpeed = false) {

        if (this.useAsPath && xt(pos) && pos.toFixed) {

            let remainder = pos % 1,
                unitPartials = this.unitPartials,
                previousLen = 0, 
                stoppingLen, myLen, i, iz, unit, species;

            // ... because sometimes everything doesn't all add up to 1
            if (pos === 0) remainder = 0;
            else if (pos === 1) remainder = 0.9999;

            if (constantSpeed) remainder = this.getConstantPosition(remainder);

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
            return this.buildPathPositionObject(unit, myLen);
        }
        return false;
    };


// #### Display cycle functionality

    // `prepareStamp` - the purpose of most of these actions is described in the [entity mixin function](http://localhost:8080/docs/source/mixin/entity.html#section-31) that this function overwrites
    P.prepareStamp = function() {

        if (this.dirtyHost) this.dirtyHost = false;

        if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyHandle) {

            this.dirtyPathObject = true;

            if (this.dirtyScale || this.dirtySpecies)  this.pathCalculatedOnce = false;
       }

        if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0 || this.lockTo.indexOf('particle') >= 0) this.dirtyStampPositions = true;

        if (this.dirtyScale) this.cleanScale();

        if (this.dirtyStart) this.cleanStart();

        if (this.dirtyOffset) this.cleanOffset();
        if (this.dirtyRotation) this.cleanRotation();

        if (this.dirtyStampPositions) this.cleanStampPositions();

        if (this.dirtySpecies) this.cleanSpecies();
        if (this.dirtyPathObject) this.cleanPathObject();

        if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
    };

    // `cleanDimensions` - internal helper function called by `prepareStamp` 
    // + Dimensional data has no meaning in the context of Shape entitys (beyond positioning handle Coordinates): width and height are emergent properties that cannot be set on the entity.
    P.cleanDimensions = function () {

        this.dirtyDimensions = false;

        this.dirtyStart = true;
        this.dirtyHandle = true;
        this.dirtyOffset = true;
    };

    // `cleanPathObject` - internal helper function - called by `prepareStamp`
    P.cleanPathObject = function () {

        this.dirtyPathObject = false;

        if (!this.noPathUpdates || !this.pathObject) {

            if (this.dirtyDimensions) {

                this.cleanSpecies();
                this.pathCalculatedOnce = false;
            }

            this.calculateLocalPath(this.pathDefinition);

            if (this.dirtyDimensions) this.cleanDimensions();
            if (this.dirtyHandle) this.cleanHandle();
            if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

            let handle = this.currentStampHandlePosition;

            this.pathObject = new Path2D(`m${-handle[0]},${-handle[1]}${this.localPath}`);
        }
    };

    // `calculateLocalPath` - internal helper function - called by `cleanPathObject`
    P.calculateLocalPath = function (d, isCalledFromAdditionalActions) {

        let res;

        if (!this.pathCalculatedOnce) {

            res = calculatePath(d, this.currentScale, this.currentStart, this.useAsPath, this.precision);
            this.pathCalculatedOnce = true;
        }

        if (res) {

            this.localPath = res.localPath;
            this.length = res.length;

            let maxX = res.maxX,
                maxY = res.maxY,
                minX = res.minX,
                minY = res.minY;

            let dims = this.dimensions,
                currentDims = this.currentDimensions,
                box = this.localBox;

            dims[0] = parseFloat((maxX - minX).toFixed(1));
            dims[1] = parseFloat((maxY - minY).toFixed(1));
            
            if(dims[0] !== currentDims[0] || dims[1] !== currentDims[1]) {

                currentDims[0] = dims[0];
                currentDims[1] = dims[1];
                this.dirtyHandle = true;
            }

            box.length = 0;
            box.push(parseFloat(minX.toFixed(1)), parseFloat(minY.toFixed(1)), dims[0], dims[1]);

            if (this.useAsPath) {

                // we can do work here to flatten some of these arrays
                const {units, unitLengths, unitPartials, unitProgression, unitPositions} = res;

                let lastLength = 0, 
                    currentPartial,
                    lastPartial,
                    progression, 
                    flatProgression = [],
                    flatPositions = [],
                    positions,
                    i, iz, j, jz, l, p;

                for (i = 0, iz = unitLengths.length; i < iz; i++) {

                    lastLength += unitLengths[i];
                    progression = unitProgression[i];

                    if (progression) {

                        lastPartial = unitPartials[i];
                        currentPartial = unitPartials[i + 1] - lastPartial;
                        positions = unitPositions[i];

                        for (j = 0, jz = progression.length; j < jz; j++) {

                            l = lastLength + progression[j];
                            flatProgression.push(parseFloat(l.toFixed(1)));

                            p = lastPartial + (positions[j] * currentPartial);
                            flatPositions.push(parseFloat(p.toFixed(6)));
                        }
                    }


                }
                this.units = units;
                this.unitLengths = unitLengths;
                this.unitPartials = unitPartials;

                this.unitProgression = flatProgression;
                this.unitPositions = flatPositions;
            }
            if (!isCalledFromAdditionalActions) this.calculateLocalPathAdditionalActions();
        }
    };
    P.calculateLocalPathAdditionalActions = λnull;

// `updatePathSubscribers`
    P.updatePathSubscribers = function () {

        this.pathed.forEach(name => {

            let instance = artefact[name];

            if (instance) {

                instance.currentPathData = false;
                instance.dirtyStart = true;
                if (instance.addPathHandle) instance.dirtyHandle = true;
                if (instance.addPathOffset) instance.dirtyOffset = true;
                if (instance.addPathRotation) instance.dirtyRotation = true;

                if (instance.type === 'Polyline') instance.dirtyPins = true;
                else if (instance.type === 'Line' || instance.type === 'Quadratic' || instance.type === 'Bezier') instance.dirtyPins.push(this.name);
            }
        }, this);
    };

// #### Stamp methods
// All actual drawing is achieved using the entity's pre-calculated [Path2D object](https://developer.mozilla.org/en-US/docs/Web/API/Path2D).

    // `draw`
    P.draw = function (engine) {

        engine.stroke(this.pathObject);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    },

    // `fill`
    P.fill = function (engine) {

        engine.fill(this.pathObject, this.winding);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    },

    // `drawAndFill`
    P.drawAndFill = function (engine) {

        let p = this.pathObject;

        engine.stroke(p);
        this.currentHost.clearShadow();
        engine.fill(p, this.winding);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    },

    // `fillAndDraw`
    P.fillAndDraw = function (engine) {

        let p = this.pathObject;

        engine.stroke(p);
        this.currentHost.clearShadow();
        engine.fill(p, this.winding);
        engine.stroke(p);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    },

    // `drawThenFill`
    P.drawThenFill = function (engine) {

        let p = this.pathObject;

        engine.stroke(p);
        engine.fill(p, this.winding);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    },

    // `fillThenDraw`
    P.fillThenDraw = function (engine) {

        let p = this.pathObject;

        engine.fill(p, this.winding);
        engine.stroke(p);
        if (this.showBoundingBox) this.drawBoundingBox(engine);
    },

    // `clear`
    P.clear = function (engine) {

        let gco = engine.globalCompositeOperation;

        engine.globalCompositeOperation = 'destination-out';
        engine.fill(this.pathObject, this.winding);
        
        engine.globalCompositeOperation = gco;

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    },    

    // `drawBoundingBox`
    P.drawBoundingBox = function (engine) {

        engine.save();

        engine.strokeStyle = this.boundingBoxColor;
        engine.lineWidth = 1;
        engine.globalCompositeOperation = 'source-over';
        engine.globalAlpha = 1;
        engine.shadowOffsetX = 0;
        engine.shadowOffsetY = 0;
        engine.shadowBlur = 0;

        engine.strokeRect(...this.getBoundingBox());

        engine.restore();
    };

    // `getBoundingBox`
    P.getBoundingBox = function () {

        let floor = Math.floor,
            ceil = Math.ceil,
            minDims = this.minimumBoundingBoxDimensions;

        let [x, y, w, h] = this.localBox;
        let [hX, hY] = this.currentStampHandlePosition;
        let [sX, sY] = this.currentStampPosition;

        // Pad out excessively thin widths and heights
        if (w < minDims) w = minDims;
        if (h < minDims) h = minDims;

        return [floor(x - hX), floor(y - hY), ceil(w), ceil(h), sX, sY];
    };

// Return the prototype
    return P;
};
