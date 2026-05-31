// # Shape-basic mixin
// This mixin defines the key attributes and functionality for all Scrawl-canvas __path-defined entitys__.


// #### Imports
import { artefact } from '../core/library.js';

import { mergeOver, pushUnique, xt, λnull, Ωempty } from '../helper/utilities.js';

import { calculatePath } from '../helper/shape-path-calculation.js';

import entityMix from './entity.js';

// Shared constants
import { _atan2, _isFinite, _parse, _piHalf, _pow, _radian, BEZIER, CLOSE, DESTINATION_OUT, LINEAR, MOUSE, MOVE, PARTICLE, QUADRATIC, SOURCE_OVER, T_BEZIER, T_LINE, T_POLYLINE, T_QUADRATIC, UNKNOWN, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const HALFTRANS = 'rgb(0 0 0 / 0.5)',
    CURVE_PATH_TYPES = [T_LINE, T_QUADRATIC, T_BEZIER];


// #### Export function
export default function (P = Ωempty) {


// #### Mixins
// + [entity](../mixin/entity.html)
    entityMix(P);


// #### Shared attributes
    const defaultAttributes = {

        species: ZERO_STR,
        useAsPath: false,

        precision: 10,

        pathDefinition: ZERO_STR,

        showBoundingBox: false,
        boundingBoxColor: HALFTRANS,
        minimumBoundingBoxDimensions: 20,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['dimensions', 'pathed']);

    P.finalizePacketOut = function (copy, items) {

        const stateCopy = _parse(this.state.saveAsPacket(items))[3];
        copy = mergeOver(copy, stateCopy);

        copy = this.handlePacketAnchor(copy, items);

        return copy;
    };


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const S = P.setters,
        D = P.deltaSetters;

    S.species = function (item) {

        if (xt(item)) {

            this.species = item;
            this.updateDirty();
        }
    };

    S.precision = function (item) {

        if (_isFinite(item)) {

            this.precision = item;
            this.updateDirty();
        }
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
        this.dirtyDrawGradientCache = true;
        this.dirtyfillGradientCache = true;
    };

    // `shapeInit` - internal constructor helper function
    P.shapeInit = function (items) {

        this.units = [];
        this.unitLengths = [];
        this.unitPartials = [];

        this.pathed = [];

        this.localBox = [];

        this.localPath = null;
        this.length = 0;

        this.unitProgression = [];
        this.unitPositions = [];

        this.entityInit(items);
    };


// #### Path-related functionality

    // `positionPointOnPath`
    P.positionPointOnPath = function (vals) {

        let x = vals.x - this.currentStampHandlePosition[0],
            y = vals.y - this.currentStampHandlePosition[1];

        if (this.flipReverse) x = -x;
        if (this.flipUpend) y = -y;

        const r = this.roll * _radian,
            cos = Math.cos(r),
            sin = Math.sin(r),
            rx = (x * cos) - (y * sin),
            ry = (x * sin) + (y * cos);

        return {
            x: rx + this.currentStampPosition[0],
            y: ry + this.currentStampPosition[1],
        };
    };

    // `getConstantPosition` - internal function called by `getPathPositionData`
    P.getConstantPosition = function (pos) {

        if (!_isFinite(pos)) return 0;
        if (pos >= 1) return 0.9999;

        const { unitPositions, unitProgression, length } = this;

        if (!length || !unitPositions || !unitProgression) return 0;

        if (unitPositions && unitPositions.length) {

            const arraysLen = unitPositions.length;

            let index = 0,
                steadyDistance = 0,
                dynamicDistance = 0,
                sectionRatio;

            for (let i = 0; i < arraysLen; i++) {

                sectionRatio = unitProgression[i] / length;

                if (pos > sectionRatio) {

                    steadyDistance = unitPositions[i];
                    dynamicDistance = sectionRatio;
                    index++;
                }
            }

            if (index >= arraysLen) index = arraysLen - 1;

            const remainingDynamicDistance = (index) ? (pos - dynamicDistance) : pos;

            const dynamicSegmentLength = (index)
                ? (unitProgression[index] - unitProgression[index - 1]) / length
                : unitProgression[index] / length;

            const steadySegmentLength = (index)
                ? (unitPositions[index] - unitPositions[index - 1])
                : unitPositions[index];

            if (!dynamicSegmentLength) return steadyDistance;

            const steadyToDynamicRatio = steadySegmentLength / dynamicSegmentLength;

            steadyDistance += (remainingDynamicDistance * steadyToDynamicRatio);

            return steadyDistance;
        }
        else return pos;
    };

    // `buildPathPositionObject` - internal function called by `getPathPositionData`
    P.buildPathPositionObject = function (unit, myLen) {

        if (!unit) return false;

        const unitSpecies = unit[0],
            point = {
                x: 0,
                y: 0,
            };

        let angle, T, dx, dy;

        switch (unitSpecies) {

            case LINEAR :
                point.x = unit[1] + ((unit[3] - unit[1]) * myLen);
                point.y = unit[2] + ((unit[4] - unit[2]) * myLen);

                dx = unit[3] - unit[1];
                dy = unit[4] - unit[2];
                angle = (-_atan2(dx, dy) + _piHalf) / _radian;
                break;

            case QUADRATIC :
                T = 1 - myLen;

                point.x = (T * T * unit[1]) + (2 * T * myLen * unit[3]) + (myLen * myLen * unit[5]);
                point.y = (T * T * unit[2]) + (2 * T * myLen * unit[4]) + (myLen * myLen * unit[6]);

                dx = (2 * T * (unit[3] - unit[1])) + (2 * myLen * (unit[5] - unit[3]));
                dy = (2 * T * (unit[4] - unit[2])) + (2 * myLen * (unit[6] - unit[4]));
                angle = (-_atan2(dx, dy) + _piHalf) / _radian;
                break;

            case BEZIER :
                T = 1 - myLen;

                point.x = (_pow(T, 3) * unit[1]) + (3 * myLen * _pow(T, 2) * unit[3]) + (3 * myLen * myLen * T * unit[5]) + (myLen * myLen * myLen * unit[7]);
                point.y = (_pow(T, 3) * unit[2]) + (3 * myLen * _pow(T, 2) * unit[4]) + (3 * myLen * myLen * T * unit[6]) + (myLen * myLen * myLen * unit[8]);

                dx = (_pow(T, 2) * (unit[3] - unit[1])) + (2 * myLen * T * (unit[5] - unit[3])) + (myLen * myLen * (unit[7] - unit[5]));
                dy = (_pow(T, 2) * (unit[4] - unit[2])) + (2 * myLen * T * (unit[6] - unit[4])) + (myLen * myLen * (unit[8] - unit[6]));
                angle = (-_atan2(dx, dy) + _piHalf) / _radian;
                break;

            default :
                return false;
        }

        const myPoint = this.positionPointOnPath(point);

        let flipAngle = 0;
        if (this.flipReverse) flipAngle++;
        if (this.flipUpend) flipAngle++;

        if (flipAngle === 1) angle = -angle;

        angle += this.roll;

        // Special consideration for curve shapes - line, quadratic, bezier
        if (CURVE_PATH_TYPES.includes(this.type)) {

            const lineOffset = this.controlledLineOffset;

            myPoint.x += lineOffset[0];
            myPoint.y += lineOffset[1];
        }

        myPoint.angle = angle;

        return myPoint;
    };

    // `getPathPositionData`
    // + Also useful in user code to retrieve the Cell-relative coordinates of any point (measured as a float Number between `0` and `1` along the path)
    // + The second argument - a Boolean - rectifies for constant speed
    P.getPathPositionData = function (pos, constantSpeed = false) {

        if (this.useAsPath && xt(pos) && pos.toFixed) {

            const unitPartials = this.unitPartials;

            let previousLen = 0,
                remainder = ((pos % 1) + 1) % 1,
                denom;

            let stoppingLen, myLen, i, iz, unit, species;

            // ... because sometimes everything doesn't all add up to 1
            if (pos === 0) remainder = 0;
            else if (pos === 1) remainder = 0.9999;

            if (constantSpeed) remainder = this.getConstantPosition(remainder);

            // 1. Determine the pertinent subpath to use for calculation
            for (i = 0, iz = unitPartials.length; i < iz; i++) {

                species = this.units[i][0];
                if (species === MOVE || species === CLOSE || species === UNKNOWN) continue;

                stoppingLen = unitPartials[i];

                if (remainder <= stoppingLen) {

                    // 2. Calculate point along the subpath the pos value represents
                    unit = this.units[i];

                    denom = (stoppingLen - previousLen);
                    myLen = denom ? (remainder - previousLen) / denom : 0;

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

        this.setGradientCacheFlags();

        if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyHandle) {

            this.dirtyPathObject = true;

            if (this.useFillGradientCache) this.dirtyFillGradientCache = true;
            if (this.useDrawGradientCache) this.dirtyDrawGradientCache = true;

            if (this.dirtyScale || this.dirtySpecies)  this.pathCalculatedOnce = false;
       }

        if (this.dirtyRotation || this.dirtySpecies || this.dirtyPathObject) {

            if (this.useFillGradientCache) this.dirtyFillGradientCache = true;
            if (this.useDrawGradientCache) this.dirtyDrawGradientCache = true;
        }

        if (this.isBeingDragged || this.lockTo.includes(MOUSE) || this.lockTo.includes(PARTICLE)) this.dirtyStampPositions = true;

        if (this.dirtyScale) this.cleanScale();

        if (this.dirtyStart) this.cleanStart();

        if (this.dirtyOffset) this.cleanOffset();
        if (this.dirtyRotation) this.cleanRotation();

        if (this.dirtyStampPositions || this.dirtyStampHandlePositions) {

            if (this.useFillGradientCache) this.dirtyFillGradientCache = true;
            if (this.useDrawGradientCache) this.dirtyDrawGradientCache = true;
        }

        if (this.dirtyStampPositions) this.cleanStampPositions();

        if (this.dirtySpecies) this.cleanSpecies();
        if (this.dirtyPathObject) this.cleanPathObject();

        if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

        // `prepareStampTabsHelper` is defined in the `mixin/hidden-dom-elements.js` file - handles updates to anchor and button objects
        this.prepareStampTabsHelper();
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

            this.calculateLocalPath();

            if (this.dirtyDimensions) this.cleanDimensions();
            if (this.dirtyHandle) this.cleanHandle();
            if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

            const handle = this.currentStampHandlePosition;

            this.pathObject = new Path2D(`m${-handle[0]},${-handle[1]}${this.localPath}`);
        }
    };

    // `calculateLocalPath` - internal helper function - called by `cleanPathObject`
    P.calculateLocalPath = function (isCalledFromAdditionalActions = false) {

        let res;

        if (!this.pathCalculatedOnce) {

            res = calculatePath(this);
            this.pathCalculatedOnce = true;
        }

        if (res) {

            this.localPath = res.localPath;
            this.length = res.length;

            const maxX = res.maxX,
                maxY = res.maxY,
                minX = res.minX,
                minY = res.minY;

            const dims = this.dimensions,
                currentDims = this.currentDimensions,
                box = this.localBox;

            dims[0] = maxX - minX;
            dims[1] = maxY - minY;

            if(dims[0] !== currentDims[0] || dims[1] !== currentDims[1]) {

                currentDims[0] = dims[0];
                currentDims[1] = dims[1];
                this.dirtyHandle = true;
            }

            box.length = 0;
            box.push(minX, minY, dims[0], dims[1]);

            if (!isCalledFromAdditionalActions) this.calculateLocalPathAdditionalActions();
        }
    };

    P.calculateLocalPathAdditionalActions = λnull;

// `updatePathSubscribers`
    P.updatePathSubscribers = function () {

        let art;

        this.pathed.forEach(name => {

            art = artefact[name];

            if (art) {

                art.currentPathData = false;
                art.dirtyStart = true;
                if (art.addPathHandle) art.dirtyHandle = true;
                if (art.addPathOffset) art.dirtyOffset = true;
                if (art.addPathRotation) art.dirtyRotation = true;

                if (art.type === T_POLYLINE) art.dirtyPins = true;
                else if (art.type === T_LINE || art.type === T_QUADRATIC || art.type === T_BEZIER) art.dirtyPins.push(this.name);
            }
        }, this);
    };

// #### Stamp methods
// All actual drawing is achieved using the entity's pre-calculated [Path2D object](https://developer.mozilla.org/en-US/docs/Web/API/Path2D).

    // `draw`
    P.draw = function (engine) {

        if (this.useDrawGradientCache) this.applyFromWorkstore(engine, this.identifierDrawGradientCache);
        else engine.stroke(this.pathObject);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    };

    // `fill`
    P.fill = function (engine) {

        if (this.useFillGradientCache) this.applyFromWorkstore(engine, this.identifierFillGradientCache);
        else engine.fill(this.pathObject, this.winding);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    };

    // `drawAndFill`
    P.drawAndFill = function (engine) {

        const p = this.pathObject,
            winding = this.winding,
            apply = this.applyFromWorkstore.bind(this),
            drawUse = this.useDrawGradientCache,
            drawId = this.identifierDrawGradientCache,
            fillUse = this.useFillGradientCache,
            fillId = this.identifierFillGradientCache;

        if (drawUse) apply(engine, drawId);
        else engine.stroke(p);

        if (fillUse) apply(engine, fillId);
        else engine.fill(p, winding);

        this.currentHost.clearShadow();

        if (drawUse) apply(engine, drawId);
        else engine.stroke(p);

        if (fillUse) apply(engine, fillId);
        else engine.fill(p, winding);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    };

    // `fillAndDraw`
    P.fillAndDraw = function (engine) {

        const p = this.pathObject,
            winding = this.winding,
            apply = this.applyFromWorkstore.bind(this),
            drawUse = this.useDrawGradientCache,
            drawId = this.identifierDrawGradientCache,
            fillUse = this.useFillGradientCache,
            fillId = this.identifierFillGradientCache;

        if (fillUse) apply(engine, fillId);
        else engine.fill(p, winding);

        if (drawUse) apply(engine, drawId);
        else engine.stroke(p);

        this.currentHost.clearShadow();

        if (fillUse) apply(engine, fillId);
        else engine.fill(p, winding);

        if (drawUse) apply(engine, drawId);
        else engine.stroke(p);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    };

    // `drawThenFill`
    P.drawThenFill = function (engine) {

        const p = this.pathObject,
            apply = this.applyFromWorkstore.bind(this);

        if (this.useDrawGradientCache) apply(engine, this.identifierDrawGradientCache);
        else engine.stroke(p);

        if (this.useFillGradientCache) apply(engine, this.identifierFillGradientCache);
        else engine.fill(p, this.winding);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    };

    // `fillThenDraw`
    P.fillThenDraw = function (engine) {

        const p = this.pathObject,
            apply = this.applyFromWorkstore.bind(this);

        if (this.useFillGradientCache) apply(engine, this.identifierFillGradientCache);
        else engine.fill(p, this.winding);

        if (this.useDrawGradientCache) apply(engine, this.identifierDrawGradientCache);
        else engine.stroke(p);

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    };

    // `clear`
    P.clear = function (engine) {

        const gco = engine.globalCompositeOperation;

        engine.globalCompositeOperation = DESTINATION_OUT;
        engine.fill(this.pathObject, this.winding);

        engine.globalCompositeOperation = gco;

        if (this.showBoundingBox) this.drawBoundingBox(engine);
    };

    // `drawBoundingBox`
    P.drawBoundingBox = function (engine) {

        engine.save();

        engine.strokeStyle = this.boundingBoxColor;
        engine.lineWidth = 1;
        engine.globalCompositeOperation = SOURCE_OVER;
        engine.globalAlpha = 1;
        engine.shadowOffsetX = 0;
        engine.shadowOffsetY = 0;
        engine.shadowBlur = 0;

        engine.strokeRect(...this.getBoundingBox());

        engine.restore();
    };

    // `getBoundingBox`
    P.getBoundingBox = function () {

        const minDims = this.minimumBoundingBoxDimensions;

/* eslint-disable-next-line */
        let [x, y, w, h] = this.localBox;
        const [hX, hY] = this.currentStampHandlePosition;
        const [sX, sY] = this.currentStampPosition;

        // Pad out excessively thin widths and heights
        if (w < minDims) w = minDims;
        if (h < minDims) h = minDims;

        return [x - hX, y - hY, w, h, sX, sY];
    };
}
