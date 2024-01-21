// # Shape path calculation
// The function, and its helper functions, translates SVG path data string - example: `M0,0H100V100H-100V-100z` - into data which can be used to construct the a Path2D object which can be consumed by the canvasRenderingContext2D engine's `fill`, `stroke` and `isPointInPath` functions
// + TODO: this file is in the wrong place: it's not a mixin; it exports a single function currently imported only by ./factory.shape.js; and it duplicates Vector code
// + Code has been separated out into its own file because it is a potential candidate for hiving off to a web worker


// #### Imports
import { _atan2, _cos, _max, _min, _pow, _seal, _sin, _sqrt, BEZIER, CLOSE, GET_BEZIER, GET_QUADRATIC, LINEAR, MOVE, QUADRATIC, UNKNOWN, ZERO_STR } from './shared-vars.js';

import { releaseArray, requestArray } from './array-pool.js';


// We only use one pathCalcObject, but treat it like a pool of such objects for resetting to defaults
const pathCalcObjectPool = [];

export const requestPathCalcObject = function () {

    if (!pathCalcObjectPool.length) pathCalcObjectPool.push(_seal({
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
        xRange: [],
        yRange: [],
    }));

    return pathCalcObjectPool.shift();
};

export const releasePathCalcObject = function (a) {

    a.localPath = null;
    a.length = 0;
    a.units.length = 0;
    a.maxX = 0;
    a.maxY = 0;
    a.minX = 0;
    a.minY = 0;
    a.unitLengths.length = 0;
    a.unitPartials.length = 0;
    a.unitPositions.length = 0;
    a.unitProgression.length = 0;
    a.xRange.length = 0;
    a.yRange.length = 0;

    pathCalcObjectPool.push(a);
};


// #### Export function
export const calculatePath = (d, scale, start, useAsPath, precision, result) => {

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
        mySet = d.match(/([A-Za-z][0-9. ,-]*)/g),
        localMatch = /(-?[0-9.]+\b)/g;

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
        reflectY = 0;

    // Local function to populate the temporary myData array with data for every path partial
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
                        buildArrays(points.slice(j, j + 1));
                    }
                    break;

                case 'V':
                    for (j = 0, jz = points.length; j < jz; j++) {

                        points[j] = (points[j] * scale) - oldY;
                        curY += points[j];
                        reflectX = reflectY = 0;
                        buildArrays(points.slice(j, j + 1));
                    }
                    break;

                case 'M':
                    for (j = 0, jz = points.length; j < jz; j += 2) {

                        points[j] = (points[j] * scale) - oldX;
                        points[j + 1] = (points[j + 1] * scale) - oldY;
                        curX += points[j];
                        curY += points[j + 1];
                        reflectX = reflectY = 0;
                        buildArrays(points.slice(j, j + 2));
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
                        buildArrays(points.slice(j, j + 2));
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
                        buildArrays(points.slice(j, j + 4));
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
                        buildArrays(points.slice(j, j + 6));
                    }
                    break;

                case 'A':
                    for (j = 0, jz = points.length; j < jz; j += 7) {

                        points[j + 5] = (points[j + 5] * scale) - oldX;
                        points[j + 6] = (points[j + 6] * scale) - oldY;
                        curX += points[j + 5];
                        curY += points[j + 6];
                        reflectX = reflectY = 0;
                        buildArrays(points.slice(j, j + 7));
                    }
                    break;

                case 'h':
                    for (j = 0, jz = points.length; j < jz; j++) {

                        points[j] *= scale;
                        curX += points[j];
                        reflectX = reflectY = 0;
                        buildArrays(points.slice(j, j + 1));
                    }
                    break;

                case 'v':
                    for (j = 0, jz = points.length; j < jz; j++) {

                        points[j] *= scale;
                        curY += points[j];
                        reflectX = reflectY = 0;
                        buildArrays(points.slice(j, j + 1));
                    }
                    break;

                case 'm':
                case 'l':
                case 't':
                    for (j = 0, jz = points.length; j < jz; j += 2) {

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
                        buildArrays(points.slice(j, j + 2));
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
                        buildArrays(points.slice(j, j + 4));
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
                        buildArrays(points.slice(j, j + 6));
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
                        buildArrays(points.slice(j, j + 7));
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

        if (myPts) {

            for (j = 0, jz = myPts.length; j < jz; j++) {

                myPts[j] = myPts[j].toFixed(1);
            }

            localPath += `${curData.c}${curData.p.join()}`;

            for (j = 0, jz = myPts.length; j < jz; j++) {

                myPts[j] = parseFloat(myPts[j]);
            }

        }
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
                        units[i] = [MOVE, x, y];
                        break;

                    case 'l' :
                        units[i] = [LINEAR, x, y, p[0] + x, p[1] + y];
                        break;

                    case 't' :
                        if (prevData && (prevData.rx || prevData.ry)) {

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
                        if (prevData && (prevData.rx || prevData.ry)) {

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
                        units[i] = [LINEAR, x, y, p[5] + x, p[6] + y];
                        break;

                    case 'z' :
                        if (isNaN(x)) x = 0;
                        if (isNaN(y)) y = 0;
                        units[i] = [CLOSE, x, y];
                        break;

                    default :
                        if (isNaN(x)) x = 0;
                        if (isNaN(y)) y = 0;
                        units[i] = [UNKNOWN, x, y];
                }
            }
            else units[i] = [`no-points-${c}`, x, y];
        }

        for (i = 0, iz = units.length; i < iz; i++) {

            const [spec, ...data] = units[i];

            let localResults;

            switch (spec) {

                case LINEAR :
                case QUADRATIC :
                case BEZIER :
                    localResults = getShapeUnitMetaData(spec, precision, data);
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

            mySum += unitLengths[i] / myLen;
            unitPartials[i] = parseFloat(mySum.toFixed(6));
        }
    }

    result.length = parseFloat(myLen.toFixed(1));

    // calculate bounding box dimensions
    result.maxX = _max(...xPoints);
    result.maxY = _max(...yPoints);
    result.minX = _min(...xPoints);
    result.minY = _min(...yPoints);

    result.xRange.push(...xPoints);
    result.yRange.push(...yPoints);

    releaseArray(points);
    releaseArray(myData);
    releaseArray(xPoints);
    releaseArray(yPoints);

    return result;
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
    arg += (angle * 0.01745329251);

    const mag = _sqrt((v.x * v.x) + (v.y * v.y));

    v.x = mag * _cos(arg);
    v.y = mag * _sin(arg);
};

// #### Helper functions

// `getShapeUnitMetaData`
const getShapeUnitMetaData = function (species, precision, args) {

    let xPts = [],
        yPts = [],
        len = 0,
        w, h;

    const progression = [],
        positions = [];

    // We want to separate out linear species before going into the while loop
    // + because these calculations will be simple
    if (species == LINEAR) {

        const [sx, sy, ex, ey] = args;

        w = ex - sx;
        h = ey - sy;

        len = _sqrt((w * w) + (h * h));

        xPts = xPts.concat([sx, ex]);
        yPts = yPts.concat([sy, ey]);
    }
    else if (species == BEZIER || (species == QUADRATIC)) {

        const func = (species == BEZIER) ? GET_BEZIER : GET_QUADRATIC;

        let flag = false,
            step = 0.25,
            newLength = 0,
            oldX, oldY, x, y, t, res;

        while (!flag) {

            xPts.length = 0;
            yPts.length = 0;
            newLength = 0;
            progression.length = 0;
            positions.length = 0;

            res = getXY[func](0, ...args);
            oldX = res.x;
            oldY = res.y;
            xPts.push(oldX);
            yPts.push(oldY);

            for (t = step; t <= 1; t += step) {

                res = getXY[func](t, ...args);
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

    [GET_BEZIER]: function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

        const T = 1 - t;

        return {
            x: (_pow(T, 3) * sx) + (3 * t * _pow(T, 2) * cp1x) + (3 * t * t * T * cp2x) + (t * t * t * ex),
            y: (_pow(T, 3) * sy) + (3 * t * _pow(T, 2) * cp1y) + (3 * t * t * T * cp2y) + (t * t * t * ey)
        };
    },

    [GET_QUADRATIC]: function (t, sx, sy, cp1x, cp1y, ex, ey) {

        const T = 1 - t;

        return {
            x: T * T * sx + 2 * T * t * cp1x + t * t * ex,
            y: T * T * sy + 2 * T * t * cp1y + t * t * ey
        };
    },
};
