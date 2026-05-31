// # Shape path calculation
// The function, and its helper functions, translates SVG path data string - example: `M0,0H100V100H-100V-100z` - into data which can be used to construct the a Path2D object which can be consumed by the canvasRenderingContext2D engine's `fill`, `stroke` and `isPointInPath` functions
// + TODO: this file is in the wrong place: it's not a mixin; it exports a single function currently imported only by ./factory.shape.js; and it duplicates Vector code
// + Code has been separated out into its own file because it is a potential candidate for hiving off to a web worker


// #### Imports
import { releaseArray, requestArray } from './array-pool.js';

// Shared constants
import { _abs, _acos, _atan2, _cos, _isFinite, _max, _min, _piDouble, _piHalf, _pow, _radian, _sin, _sqrt, _tan, BEZIER, CLOSE, LINEAR, MOVE, QUADRATIC, UNKNOWN, ZERO_STR } from './shared-vars.js';

// Local constants
const GET_BEZIER = 'getBezierXY',
    GET_QUADRATIC = 'getQuadraticXY';

const resultObject = {
    localPath: null,
    length: 0,
    maxX: 0,
    maxY: 0,
    minX: 0,
    minY: 0,
    unitLengths: [],
    unitPartials: [],
    units: [],
    unitPositions: [],
    unitProgression: [],
};

const cleanResultObject = function (res) {

    res.localPath = null;
    res.length = 0;
    res.units.length = 0;
    res.maxX = 0;
    res.maxY = 0;
    res.minX = 0;
    res.minY = 0;
    res.unitLengths.length = 0;
    res.unitPartials.length = 0;
    res.unitPositions.length = 0;
    res.unitProgression.length = 0;

    return res;
};


// #### Export function
export const calculatePath = (myEntity) => {

    const {
        pathDefinition: d,
        currentScale: scale,
        currentStart: start,
        useAsPath,
    } = myEntity;

    const result = cleanResultObject(resultObject);

    let precision = myEntity.precision;

    if (precision == null || isNaN(precision)) precision = 10;

    // Setup local variables
    const points = requestArray(),
        myData = requestArray(),
        xPoints = requestArray(),
        yPoints = requestArray(),
        units = result.units,
        unitLengths = result.unitLengths,
        unitPartials = result.unitPartials,
        progression = result.unitProgression,
        positions = result.unitPositions,
        mySet = d.match(/([MmZzLlHhVvCcSsQqTtAa][^MmZzLlHhVvCcSsQqTtAa]*)/g) || [],
        localMatch = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;

    let command = ZERO_STR,
        localPath = ZERO_STR,
        myLen = 0,
        i, iz, j, jz,
        checkMatch,
        curX = 0,
        curY = 0,
        oldX = 0,
        oldY = 0,
        reflectX = 0,
        reflectY = 0,
        subpathStartX = 0,
        subpathStartY = 0;

    // Local function to populate the temporary myData array with data for every path partial
    const pointArrays = requestArray();

    const copyPoints = (source, start, count) => {

        const res = requestArray();

        for (let i = 0; i < count; i++) res[i] = source[start + i];

        pointArrays.push(res);
        return res;
    };

    const buildArrays = (thesePoints) => {

        myData.push({
            c: command.toLowerCase(),
            p: thesePoints || null,
            x: oldX,
            y: oldY,
            cx: curX,
            cy: curY,
            rx: reflectX,
            ry: reflectY
        });

        if (!useAsPath) {

            xPoints.push(curX);
            yPoints.push(curY);
        }

        oldX = curX;
        oldY = curY;
    };

    // The purpose of this loop is to
    // 1. convert all point values from strings to floats
    // 2. scale every value
    // 3. relativize every value to the last stated cursor position
    // 4. populate the temporary myData array with data which can be used for all subsequent calculations
    for (i = 0, iz = mySet.length; i < iz; i++) {

        command = mySet[i][0];
        points.length = 0;
        checkMatch = mySet[i].match(localMatch);
        if (checkMatch) points.push(...checkMatch);

        if (points.length) {

            for (j = 0, jz = points.length; j < jz; j++) {

                points[j] = parseFloat(points[j]);
            }

            if (i === 0) {

                if (command === 'M') {

                    oldX = (points[0] * scale) - start.x;
                    oldY = (points[1] * scale) - start.y;
                    command = 'm';
                }
            }
            else {

                oldX = curX;
                oldY = curY;
            }

            switch (command) {

                case 'H':
                    for (j = 0, jz = points.length; j < jz; j++) {

                        points[j] = (points[j] * scale) - oldX;
                        curX += points[j];
                        reflectX = reflectY = 0;
                        buildArrays(copyPoints(points, j, 1));
                    }
                    break;

                case 'V':
                    for (j = 0, jz = points.length; j < jz; j++) {

                        points[j] = (points[j] * scale) - oldY;
                        curY += points[j];
                        reflectX = reflectY = 0;
                        buildArrays(copyPoints(points, j, 1));
                    }
                    break;

                case 'M':
                    for (j = 0, jz = points.length; j < jz; j += 2) {

                        const isFirstPair = (j === 0),
                            saved = command;

                        if (!isFirstPair) command = 'L';

                        points[j] = (points[j] * scale) - oldX;
                        points[j + 1] = (points[j + 1] * scale) - oldY;
                        curX += points[j];
                        curY += points[j + 1];
                        reflectX = reflectY = 0;
                        buildArrays(copyPoints(points, j, 2));

                        if (isFirstPair) {

                            subpathStartX = curX;
                            subpathStartY = curY;
                        }

                        command = saved;
                    }
                    break;

                case 'L':
                case 'T':
                    for (j = 0, jz = points.length; j < jz; j += 2) {

                        points[j] = (points[j] * scale) - oldX;
                        points[j + 1] = (points[j + 1] * scale) - oldY;
                        curX += points[j];
                        curY += points[j + 1];

                        if (command === 'T') {

                            reflectX = points[j] + oldX;
                            reflectY = points[j + 1] + oldY;
                        }
                        else {

                            reflectX = reflectY = 0;
                        }
                        buildArrays(copyPoints(points, j, 2));
                    }
                    break;

                case 'Q':
                case 'S':
                    for (j = 0, jz = points.length; j < jz; j += 4) {

                        points[j] = (points[j] * scale) - oldX;
                        points[j + 1] = (points[j + 1] * scale) - oldY;
                        points[j + 2] = (points[j + 2] * scale) - oldX;
                        points[j + 3] = (points[j + 3] * scale) - oldY;
                        curX += points[j + 2];
                        curY += points[j + 3];
                        reflectX = points[j] + oldX;
                        reflectY = points[j + 1] + oldY;
                        buildArrays(copyPoints(points, j, 4));
                    }
                    break;

                case 'C':
                    for (j = 0, jz = points.length; j < jz; j += 6) {

                        points[j] = (points[j] * scale) - oldX;
                        points[j + 1] = (points[j + 1] * scale) - oldY;
                        points[j + 2] = (points[j + 2] * scale) - oldX;
                        points[j + 3] = (points[j + 3] * scale) - oldY;
                        points[j + 4] = (points[j + 4] * scale) - oldX;
                        points[j + 5] = (points[j + 5] * scale) - oldY;
                        curX += points[j + 4];
                        curY += points[j + 5];
                        reflectX = points[j + 2] + oldX;
                        reflectY = points[j + 3] + oldY;
                        buildArrays(copyPoints(points, j, 6));
                    }
                    break;

                case 'A':
                    for (j = 0, jz = points.length; j < jz; j += 7) {

                        points[j] *= scale;
                        points[j + 1] *= scale;
                        points[j + 5] = (points[j + 5] * scale) - oldX;
                        points[j + 6] = (points[j + 6] * scale) - oldY;
                        curX += points[j + 5];
                        curY += points[j + 6];
                        reflectX = reflectY = 0;
                        buildArrays(copyPoints(points, j, 7));
                    }
                    break;

                case 'h':
                    for (j = 0, jz = points.length; j < jz; j++) {

                        points[j] *= scale;
                        curX += points[j];
                        reflectX = reflectY = 0;
                        buildArrays(copyPoints(points, j, 1));
                    }
                    break;

                case 'v':
                    for (j = 0, jz = points.length; j < jz; j++) {

                        points[j] *= scale;
                        curY += points[j];
                        reflectX = reflectY = 0;
                        buildArrays(copyPoints(points, j, 1));
                    }
                    break;

                case 'm':
                case 'l':
                case 't':
                    for (j = 0, jz = points.length; j < jz; j += 2) {

                        const saved = command;
                        if (saved === 'm' && j > 0) command = 'l';

                        points[j] *= scale;
                        points[j + 1] *= scale;
                        curX += points[j];
                        curY += points[j + 1];

                        if (command === 't') {

                            reflectX = points[j] + oldX;
                            reflectY = points[j + 1] + oldY;
                        }
                        else {

                            reflectX = reflectY = 0;
                        }
                        buildArrays(copyPoints(points, j, 2));

                        if (saved === 'm' && j === 0) {

                            subpathStartX = curX;
                            subpathStartY = curY;
                        }

                        command = saved;
                    }
                    break;

                case 'q':
                case 's':
                    for (j = 0, jz = points.length; j < jz; j += 4) {

                        points[j] *= scale;
                        points[j + 1] *= scale;
                        points[j + 2] *= scale;
                        points[j + 3] *= scale;
                        curX += points[j + 2];
                        curY += points[j + 3];
                        reflectX = points[j] + oldX;
                        reflectY = points[j + 1] + oldY;
                        buildArrays(copyPoints(points, j, 4));
                    }
                    break;

                case 'c':
                    for (j = 0, jz = points.length; j < jz; j += 6) {

                        points[j] *= scale;
                        points[j + 1] *= scale;
                        points[j + 2] *= scale;
                        points[j + 3] *= scale;
                        points[j + 4] *= scale;
                        points[j + 5] *= scale;
                        curX += points[j + 4];
                        curY += points[j + 5];
                        reflectX = points[j + 2] + oldX;
                        reflectY = points[j + 3] + oldY;
                        buildArrays(copyPoints(points, j, 6));
                    }
                    break;

                case 'a':
                    for (j = 0, jz = points.length; j < jz; j += 7) {

                        points[j] *= scale;
                        points[j + 1] *= scale;
                        points[j + 5] *= scale;
                        points[j + 6] *= scale;
                        curX += points[j + 5];
                        curY += points[j + 6];
                        reflectX = reflectY = 0;
                        buildArrays(copyPoints(points, j, 7));
                    }
                    break;
            }

        }
        else {

            reflectX = reflectY = 0;
            buildArrays();
        }
    }

    // This loop builds the local path string
    for (i = 0, iz = myData.length; i < iz; i++) {

        const curData = myData[i],
            myPts = curData.p;

        if (myPts) localPath += `${curData.c}${curData.p.join()}`;
        else localPath += `${curData.c}`;
    }

    result.localPath = localPath;

    // Calculates unit lengths and sum of lengths, alongside obtaining data to build a more accurate bounding box
    if (useAsPath) {

        // Request a vector - used for reflection points
        const v = vector;
        let curData, prevData, c, p, x, y, cx, cy;

        // This loop calculates this.units array data
        // + because the lengths calculations requires absolute coordinates
        // + and TtSs path units use reflective coordinates
        for (i = 0, iz = myData.length; i < iz; i++) {

            curData = myData[i];
            prevData = (i > 0) ? myData[i - 1] : false;

            ({c, p, x, y, cx, cy} = curData);

            if (p) {

                switch (c) {

                    case 'h' :
                        units[i] = [LINEAR, x, y, p[0] + x, y];
                        break;

                    case 'v' :
                        units[i] = [LINEAR, x, y, x, p[0] + y];
                        break;

                    case 'm' :
                        subpathStartX = cx;
                        subpathStartY = cy;

                        units[i] = [MOVE, x, y];
                        break;

                    case 'l' :
                        units[i] = [LINEAR, x, y, p[0] + x, p[1] + y];
                        break;

                    case 't' :
                        if (prevData && _isFinite(prevData.rx) && _isFinite(prevData.ry)) {

                            setVector(v, prevData.rx - cx, prevData.ry - cy);
                            rotateVector(v, 180);

                            units[i] = [QUADRATIC, x, y, v.x + cx, v.y + cy, p[0] + x, p[1] + y];
                        }
                        else units[i] = [QUADRATIC, x, y, x, y, p[0] + x, p[1] + y];
                        break;

                    case 'q' :
                        units[i] = [QUADRATIC, x, y, p[0] + x, p[1] + y, p[2] + x, p[3] + y];
                        break;

                    case 's' :
                        if (prevData && _isFinite(prevData.rx) && _isFinite(prevData.ry)) {

                            setVector(v, prevData.rx - cx, prevData.ry - cy);
                            rotateVector(v, 180);

                            units[i] = [BEZIER, x, y, v.x + cx, v.y + cy, p[0] + x, p[1] + y, p[2] + x, p[3] + y];
                        }
                        else units[i] = [BEZIER, x, y, x, y, p[0] + x, p[1] + y, p[2] + x, p[3] + y];
                        break;

                    case 'c' :
                        units[i] = [BEZIER, x, y, p[0] + x, p[1] + y, p[2] + x, p[3] + y, p[4] + x, p[5] + y];
                        break;

                    case 'a' :
                        {
                            const sx = x,
                                sy = y,
                                ex = x + p[5],
                                ey = y + p[6];

                            const curves = arcToCubicBeziers(
                                sx,
                                sy,
                                _abs(p[0]),
                                _abs(p[1]),
                                p[2],
                                p[3] ? 1 : 0,
                                p[4] ? 1 : 0,
                                ex,
                                ey,
                            );

                            if (!curves.length) units[i] = [LINEAR, sx, sy, ex, ey];
                            else {

                                const insertAt = i,
                                    splice = requestArray();

                                let px = sx,
                                    py = sy,
                                    c1x, c1y, c2x, c2y, x2, y2;

                                for (let k = 0, kz = curves.length; k < kz; k += 6) {

                                    c1x = curves[k];
                                    c1y = curves[k + 1];
                                    c2x = curves[k + 2];
                                    c2y = curves[k + 3];
                                    x2 = curves[k + 4];
                                    y2 = curves[k + 5];

                                    splice.push([BEZIER, px, py, c1x, c1y, c2x, c2y, x2, y2]);

                                    px = x2;
                                    py = y2;
                                }
                                units.splice(insertAt, 1, ...splice);

                                releaseArray(splice);
                            }
                            releaseArray(curves);
                        }
                        break;

                    case 'z' :
                        if (!_isFinite(x)) x = 0;
                        if (!_isFinite(y)) y = 0;
                        units[i] = [CLOSE, x, y, subpathStartX, subpathStartY];
                        break;

                    default :
                        if (!_isFinite(x)) x = 0;
                        if (!_isFinite(y)) y = 0;
                        units[i] = [UNKNOWN, x, y];
                }
            }
            else units[i] = [`no-points-${c}`, x, y];
        }

        for (i = 0, iz = units.length; i < iz; i++) {

            const unit = units[i],
                spec = unit[0];

            let localResults;

            switch (spec) {

                case LINEAR :
                case QUADRATIC :
                case BEZIER :
                case CLOSE :
                    localResults = getShapeUnitMetaData(spec, precision, unit);
                    unitLengths[i] = localResults.length;
                    xPoints.push(...localResults.xPoints);
                    yPoints.push(...localResults.yPoints);
                    progression.push(localResults.progression);
                    positions.push(localResults.positions);
                    break;

                default :
                    unitLengths[i] = 0;
            }
        }

        myLen = unitLengths.reduce((a, v) => a + v, 0);

        let mySum = 0;

        for (i = 0, iz = unitLengths.length; i < iz; i++) {

            if (myLen === 0) unitPartials[i] = 0;
            else {

                mySum += unitLengths[i] / myLen;
                unitPartials[i] = mySum;
            }
        }

        if (myEntity) {

            const entityUnits = myEntity.units,
                entityUnitLengths = myEntity.unitLengths,
                entityUnitPartials = myEntity.unitPartials,
                entityUnitProgression = myEntity.unitProgression,
                entityUnitPositions = myEntity.unitPositions;

            entityUnits.length = 0;
            entityUnitLengths.length = 0;
            entityUnitPartials.length = 0;
            entityUnitProgression.length = 0;
            entityUnitPositions.length = 0;

            entityUnits.push(...units);
            entityUnitLengths.push(...unitLengths);
            entityUnitPartials.push(...unitPartials);

            let lastLength = 0,
                currentPartial,
                lastPartial,
                prog,
                pos,
                l, p,
                j, jz;

            for (i = 0, iz = unitLengths.length; i < iz; i++) {

                lastLength += unitLengths[i];
                prog = progression[i];

                if (prog) {

                    lastPartial = unitPartials[i];
                    currentPartial = (i + 1 < unitPartials.length) ? unitPartials[i + 1] - lastPartial : 1 - lastPartial;

                    pos = positions[i];

                    for (j = 0, jz = prog.length; j < jz; j++) {

                        l = lastLength + prog[j];
                        entityUnitProgression.push(l);

                        p = lastPartial + (pos[j] * currentPartial);
                        entityUnitPositions.push(p);
                    }
                }
            }
        }
    }
    result.length = myLen;

    // calculate bounding box dimensions
    if (!xPoints.length) {

        result.minX = result.maxX = subpathStartX;
        result.minY = result.maxY = subpathStartY;
    }
    else {

        let minX = xPoints[0],
            maxX = xPoints[0],
            minY = yPoints[0],
            maxY = yPoints[0],
            x, y;

        for (i = 1, iz = xPoints.length; i < iz; i++) {

            x = xPoints[i];
            y = yPoints[i];

            if (x < minX) minX = x;
            else if (x > maxX) maxX = x;

            if (y < minY) minY = y;
            else if (y > maxY) maxY = y;
        }

        result.minX = minX;
        result.maxX = maxX;
        result.minY = minY;
        result.maxY = maxY;
    }

    releaseArray(...pointArrays);
    releaseArray(points, myData, xPoints, yPoints, pointArrays);

    return {
        localPath: result.localPath,
        length: result.length,
        minX: result.minX,
        maxX: result.maxX,
        minY: result.minY,
        maxY: result.maxY,
    };

};


// #### Locally defined Vector
// + TODO: consider whether we could swap out this vector stuff for a pool coordinate?
const vector = {

    x: 0,
    y: 0
};

const setVector = function (v, x, y) {

    v.x = x;
    v.y = y;
};

const rotateVector = function (v, angle) {

    let arg = _atan2(v.y, v.x);
    arg += (angle * _radian);

    const mag = _sqrt((v.x * v.x) + (v.y * v.y));

    v.x = mag * _cos(arg);
    v.y = mag * _sin(arg);
};

// #### Helper functions

// `getShapeUnitMetaData`
const getShapeUnitMetaData = function (species, precision, unit) {

    const xPts = [],
        yPts = [];

    let len = 0,
        w, h;

    const progression = [],
        positions = [],
        res = { x: 0, y: 0 };

    // We want to separate out linear species before going into the while loop
    // + because these calculations will be simple
    if (species === LINEAR || species === CLOSE) {

        const sx = unit[1],
            sy = unit[2],
            ex = unit[3],
            ey = unit[4];

        w = ex - sx;
        h = ey - sy;

        len = _sqrt((w * w) + (h * h));

        xPts.push(sx, ex);
        yPts.push(sy, ey);
    }
    else if (species === BEZIER || (species === QUADRATIC)) {

        const func = (species === BEZIER) ? GET_BEZIER : GET_QUADRATIC;

        let flag = false,
            step = 0.25,
            newLength = 0,
            oldX, oldY, x, y, t;

        while (!flag) {

            xPts.length = 0;
            yPts.length = 0;
            newLength = 0;
            progression.length = 0;
            positions.length = 0;

            getXY[func](res, 0, unit);
            oldX = res.x;
            oldY = res.y;
            xPts.push(oldX);
            yPts.push(oldY);

            for (t = step; t <= 1; t += step) {

                getXY[func](res, t, unit);
                ({x, y} = res)

                xPts.push(x);
                yPts.push(y);

                w = x - oldX;
                h = y - oldY;

                newLength += _sqrt((w * w) + (h * h));
                oldX = x;
                oldY = y;

                progression.push(newLength);
                positions.push(t);
            }

            // Stop the while loop if we're getting close to the true length of the curve
            if (newLength < len + precision) flag = true;

            len = newLength;

            step /= 2;

            // Stop the while loop after checking a maximum of 129 points along the curve
            if (step < 0.004) flag = true;
        }
    }

    return {
        length: len,
        xPoints: xPts,
        yPoints: yPts,
        positions: positions,
        progression: progression,
    };
};

// `getXY`
const getXY = {

    [GET_BEZIER]: function (res, t, unit) {

        const T = 1 - t,
            sx = unit[1],
            sy = unit[2],
            cp1x = unit[3],
            cp1y = unit[4],
            cp2x = unit[5],
            cp2y = unit[6],
            ex = unit[7],
            ey = unit[8];

        res.x = (_pow(T, 3) * sx) + (3 * t * _pow(T, 2) * cp1x) + (3 * t * t * T * cp2x) + (t * t * t * ex);
        res.y = (_pow(T, 3) * sy) + (3 * t * _pow(T, 2) * cp1y) + (3 * t * t * T * cp2y) + (t * t * t * ey);
    },

    [GET_QUADRATIC]: function (res, t, unit) {

        const T = 1 - t,
            sx = unit[1],
            sy = unit[2],
            cp1x = unit[3],
            cp1y = unit[4],
            ex = unit[5],
            ey = unit[6];

        res.x = T * T * sx + 2 * T * t * cp1x + t * t * ex;
        res.y = T * T * sy + 2 * T * t * cp1y + t * t * ey;
    },
};

// Convert an SVG arc (endpoint param) into an array of cubic Beziers.
// Returns array of [cp1x, cp1y, cp2x, cp2y, x, y] segments.
const arcToCubicBeziersAngle = function (u, v) {

    const dot = u.x * v.x + u.y * v.y,
        mag = _sqrt((u.x * u.x + u.y * u.y) * (v.x * v.x + v.y * v.y));

    if (mag === 0) return 0;

    let ang = _acos(_min(1, _max(-1, dot / mag)));

    if (u.x * v.y - u.y * v.x < 0) ang = -ang;

    return ang;
};

const arcToCubicBeziers = function (x1, y1, rx, ry, phi, fa, fs, x2, y2) {

    // Based on SVG 1.1 spec F.6.5
    const rad = phi * _radian,
        cos = _cos(rad),
        sin = _sin(rad);

    // Step 1: compute (x1', y1')
    const dx2 = (x1 - x2) / 2,
        dy2 = (y1 - y2) / 2,
        x1p = cos * dx2 + sin * dy2,
        y1p = -sin * dx2 + cos * dy2;

    let rxs = Math.abs(rx),
        rys = Math.abs(ry);

    if (rxs === 0 || rys === 0) return [];

    // Correct radii
    const lambda = (x1p * x1p) / (rxs * rxs) + (y1p * y1p) / (rys * rys);

    if (lambda > 1) {

        const s = Math.sqrt(lambda);
        rxs *= s;
        rys *= s;
    }

    // Step 2: compute center (cx', cy')
    const sign = (fa === fs) ? -1 : 1,
        rxs2 = rxs * rxs,
        rys2 = rys * rys,
        num = rxs2 * rys2 - rxs2 * y1p * y1p - rys2 * x1p * x1p,
        den = rxs2 * y1p * y1p + rys2 * x1p * x1p;

    if (den === 0) return [];

    const coef = sign * _sqrt(_max(0, num / den)),
        cxp = coef * (rxs * y1p / rys),
        cyp = coef * (-rys * x1p / rxs);

    // Step 3: center (cx, cy)
    const cx = cos * cxp - sin * cyp + (x1 + x2) / 2,
        cy = sin * cxp + cos * cyp + (y1 + y2) / 2;

    const ux = (x1p - cxp) / rxs,
        uy = (y1p - cyp) / rys,
        vx = (-x1p - cxp) / rxs,
        vy = (-y1p - cyp) / rys;

    const theta1 = arcToCubicBeziersAngle({x:1, y:0}, {x:ux, y:uy});

    let dtheta = arcToCubicBeziersAngle({x:ux, y:uy}, {x:vx, y:vy});

    if (!fs && dtheta > 0) dtheta -= _piDouble;
    if (fs && dtheta < 0) dtheta += _piDouble;

    // Split into segments of <= 90°
    const segs = Math.ceil(Math.abs(dtheta) / _piHalf),
        delta = dtheta / segs,
        t = (4 / 3) * _tan(delta / 4);

    const beziers = requestArray();

    let i, th1, th2,
        cosTh1, sinTh1, cosTh2, sinTh2,
        _x1, _y1, _x2, _y2, _dx1, _dy1, _dx2, _dy2,
        cp1x, cp1y, cp2x, cp2y;


    for (i = 0; i < segs; i++) {

        th1 = theta1 + i * delta;
        th2 = th1 + delta;

        cosTh1 = _cos(th1);
        sinTh1 = _sin(th1);
        cosTh2 = _cos(th2);
        sinTh2 = _sin(th2);

        _x1 = cx + rxs * (cos * cosTh1 - sin * sinTh1);
        _y1 = cy + rys * (sin * cosTh1 + cos * sinTh1);
        _x2 = cx + rxs * (cos * cosTh2 - sin * sinTh2);
        _y2 = cy + rys * (sin * cosTh2 + cos * sinTh2);

        _dx1 = -rxs * (cos * sinTh1 + sin * cosTh1);
        _dy1 = -rys * (sin * sinTh1 - cos * cosTh1);
        _dx2 = -rxs * (cos * sinTh2 + sin * cosTh2);
        _dy2 = -rys * (sin * sinTh2 - cos * cosTh2);

        cp1x = _x1 + t * _dx1;
        cp1y = _y1 + t * _dy1;
        cp2x = _x2 - t * _dx2;
        cp2y = _y2 - t * _dy2;

        beziers.push(cp1x, cp1y, cp2x, cp2y, _x2, _y2);
    }
    return beziers;
};
