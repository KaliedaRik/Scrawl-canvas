/*
# Adapted from Shape paths worker - used by factory/shape.js/calculateLocalPath()
*/

export default function (d, scale, start, useAsPath, precision) {

// console.log('shapePathCalculation default called')
	// setup local variables
	let points = [],
		myData = [],
		command = '',
		localPath = '',
		units = [],
		unitLengths = [],
		unitPartials = [],
		mySet = d.match(/([A-Za-z][0-9. ,\-]*)/g), 
		myLen = 0,
		i, iz, j, jz;

	let returnObject = {};

	let curX = 0, 
		curY = 0, 
		oldX = 0, 
		oldY = 0;

	let xPoints = [],
		yPoints = [];

	let reflectX = 0,
		reflectY = 0;

	// local function to populate the temporary myData array with data for every path partial
	let buildArrays = (thesePoints) => {

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

	// the purpose of this loop is to 
	// 1. convert all point values fromn strings to floats
	// 2. scale every value
	// 3. relativize every value to the last stated cursor position
	// 4. populate the temporary myData array with data which can be used for all subsequent calculations
	for (i = 0, iz = mySet.length; i < iz; i++) {

		command = mySet[i][0];
		points = mySet[i].match(/(-?[0-9.]+\b)/g) || [];

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

	// this loop builds the local path string
	for (i = 0, iz = myData.length; i < iz; i++) {

		let curData = myData[i],
			points = curData.p;

		if (points) {

			for (j = 0, jz = points.length; j < jz; j++) {

				points[j] = points[j].toFixed(1);
			}

			localPath += `${curData.c}${curData.p.join()}`;

			for (j = 0, jz = points.length; j < jz; j++) {

				points[j] = parseFloat(points[j]);
			}

		}
		else localPath += `${curData.c}`;
	}

	returnObject.localPath = localPath;

	// calculates unit lengths and sum of lengths, alongside obtaining data to build a more accurate bounding box 
	if (useAsPath) {

		// request a vector - used for reflection points
		let v = vector;

		// this loop calculates this.units array data
		// - because the lengths calculations requires absolute coordinates
		// - and TtSs path units use reflective coordinates
		for (i = 0, iz = myData.length; i < iz; i++) {

			let curData = myData[i],
				prevData = (i > 0) ? myData[i - 1] : false;

			let {c, p, x, y, cx, cy, rx, ry} = curData;

			if (p) {

				switch (c) {

					case 'h' :
						units[i] = ['linear', x, y, p[0] + x, y];
						break;

					case 'v' :
						units[i] = ['linear', x, y, x, p[0] + y];
						break;
						
					case 'm' :
						units[i] = ['move', x, y];
						break;
						
					case 'l' :
						units[i] = ['linear', x, y, p[0] + x, p[1] + y];
						break;
						
					case 't' :
						if (prevData && (prevData.rx || prevData.ry)) {

							setVector(v, prevData.rx - cx, prevData.ry - cy);
							rotateVector(v, 180);

							units[i] = ['quadratic', x, y, v.x + cx, v.y + cy, p[0] + x, p[1] + y];
						}
						else units[i] = ['quadratic', x, y, x, y, p[0] + x, p[1] + y];
						break;
						
					case 'q' :
						units[i] = ['quadratic', x, y, p[0] + x, p[1] + y, p[2] + x, p[3] + y];
						break;
						
					case 's' :
						if (prevData && (prevData.rx || prevData.ry)) {

							setVector(v, prevData.rx - cx, prevData.ry - cy);
							rotateVector(v, 180);

							units[i] = ['bezier', x, y, v.x + cx, v.y + cy, p[0] + x, p[1] + y, p[2] + x, p[3] + y];
						}
						else units[i] = ['bezier', x, y, x, y, p[0] + x, p[1] + y, p[2] + x, p[3] + y];
						break;
						
					case 'c' :
						units[i] = ['bezier', x, y, p[0] + x, p[1] + y, p[2] + x, p[3] + y, p[4] + x, p[5] + y];
						break;
						
					case 'a' :
						units[i] = ['linear', x, y, p[5] + x, p[6] + y];
						break;
						
					case 'z' :
						if (isNaN(x)) x = 0;
						if (isNaN(y)) y = 0;
						units[i] = ['close', x, y];
						break;

					default :
						if (isNaN(x)) x = 0;
						if (isNaN(y)) y = 0;
						units[i] = ['unknown', x, y];
				}
			}
		}

		returnObject.units = units;

		for (i = 0, iz = units.length; i < iz; i++) {

			let [spec, ...data] = units[i],
				results;

			switch (spec) {

				case 'linear' :
				case 'quadratic' :
				case 'bezier' :
					results = getShapeUnitMetaData(spec, precision, data);
					unitLengths[i] = results.length;
					xPoints = xPoints.concat(results.xPoints);
					yPoints = yPoints.concat(results.yPoints);
					break;
					
				default :
					unitLengths[i] = 0;
			}
		}

		myLen = unitLengths.reduce((a, v) => a + v, 0);

		let mySum = 0;

		for (i = 0, iz = unitLengths.length; i < iz; i++) {

			mySum += unitLengths[i] / myLen;
			unitPartials[i] = mySum;
		}
	}

	returnObject.unitLengths = unitLengths;
	returnObject.unitPartials = unitPartials;
	returnObject.length = parseFloat(myLen.toFixed(1));

	// calculate bounding box dimensions
	let maxX = Math.max(...xPoints),
		maxY = Math.max(...yPoints),
		minX = Math.min(...xPoints),
		minY = Math.min(...yPoints);

	returnObject.maxX = maxX;
	returnObject.maxY = maxY;
	returnObject.minX = minX;
	returnObject.minY = minY;

	return returnObject;
};

const vector = {

	x: 0,
	y: 0
};

const setVector = function (v, x, y) {

	v.x = x;
	v.y = y;
};

const rotateVector = function (v, angle) {

	let arg = Math.atan2(v.y, v.x);
	arg += (angle * 0.01745329251);
	
	let mag = Math.sqrt((v.x * v.x) + (v.y * v.y));

	v.x = mag * Math.cos(arg);
	v.y = mag * Math.sin(arg);
};

const getShapeUnitMetaData = function (species, precision, args) {

	let xPts = [],
		yPts = [],
		len = 0,
		w, h;

	// we want to separate out linear species before going into the while loop
	// - because these calculations will be simple
	if (species === 'linear') {

		let [sx, sy, ex, ey] = args;

		w = ex - sx,
		h = ey - sy;

		len = Math.sqrt((w * w) + (h * h));

		xPts = xPts.concat([sx, ex]);
		yPts = yPts.concat([sy, ey]);
	}
	else if (species === 'bezier' || (species === 'quadratic')) {

		let func = (species === 'bezier') ? 'getBezierXY' : 'getQuadraticXY',
			flag = false,
			step = 0.25,
			currentLength = 0,
			newLength = 0,
			oldX, oldY, x, y, t, res;

		while (!flag) {

			xPts.length = 0;
			yPts.length = 0;
			newLength = 0;

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

				w = x - oldX,
				h = y - oldY;

				newLength += Math.sqrt((w * w) + (h * h));
				oldX = x;
				oldY = y;
			}

			// stop the while loop if we're getting close to the true length of the curve
			if (newLength < len + precision) flag = true;

			len = newLength;

			step /= 2;

			// stop the while loop after checking a maximum of 129 points along the curve
			if (step < 0.004) flag = true;
		}
	}

	return {
		length: len,
		xPoints: xPts,
		yPoints: yPts
	};
};

const getXY = {

	getBezierXY: function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {

		let T = 1 - t;

		return {
			x: (Math.pow(T, 3) * sx) + (3 * t * Math.pow(T, 2) * cp1x) + (3 * t * t * T * cp2x) + (t * t * t * ex),
			y: (Math.pow(T, 3) * sy) + (3 * t * Math.pow(T, 2) * cp1y) + (3 * t * t * T * cp2y) + (t * t * t * ey)
		};
	},

	getQuadraticXY: function (t, sx, sy, cp1x, cp1y, ex, ey) {

		let T = 1 - t;

		return {
			x: T * T * sx + 2 * T * t * cp1x + t * t * ex,
			y: T * T * sy + 2 * T * t * cp1y + t * t * ey
		};
	},
};
