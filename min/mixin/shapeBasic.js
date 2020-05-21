import { radian, artefact } from '../core/library.js';
import { mergeOver, xt, defaultNonReturnFunction, pushUnique } from '../core/utilities.js';
import { requestVector, releaseVector } from '../factory/vector.js';
import calculatePath from './shapePathCalculation.js';
export default function (P = {}) {
let defaultAttributes = {
species: '',
useAsPath: false,
precision: 10,
constantPathSpeed: false,
pathDefinition: '',
showBoundingBox: false,
boundingBoxColor: 'rgba(0,0,0,0.5)',
minimumBoundingBoxDimensions: 20,
};
P.defs = mergeOver(P.defs, defaultAttributes);
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
S.width = defaultNonReturnFunction;
S.height = defaultNonReturnFunction;
S.dimensions = defaultNonReturnFunction;
D.width = defaultNonReturnFunction;
D.height = defaultNonReturnFunction;
D.dimensions = defaultNonReturnFunction;
S.pathDefinition = function (item) {
if (item.substring) this.pathDefinition = item;
this.dirtyPathObject = true;
};
P.updateDirty = function () {
this.dirtySpecies = true;
this.dirtyPathObject = true;
};
P.midInitActions = function (items) {
this.set(items);
};
P.shapeInit = function (items) {
this.entityInit(items);
this.units = [];
this.unitLengths = [];
this.unitPartials = [];
this.pathed = [];
this.localBox = [];
};
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
P.getBezierXY = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
let T = 1 - t;
return {
x: (Math.pow(T, 3) * sx) + (3 * t * Math.pow(T, 2) * cp1x) + (3 * t * t * T * cp2x) + (t * t * t * ex),
y: (Math.pow(T, 3) * sy) + (3 * t * Math.pow(T, 2) * cp1y) + (3 * t * t * T * cp2y) + (t * t * t * ey)
};
};
P.getQuadraticXY = function (t, sx, sy, cp1x, cp1y, ex, ey) {
let T = 1 - t;
return {
x: T * T * sx + 2 * T * t * cp1x + t * t * ex,
y: T * T * sy + 2 * T * t * cp1y + t * t * ey
};
};
P.getLinearXY = function (t, sx, sy, ex, ey) {
return {
x: sx + ((ex - sx) * t),
y: sy + ((ey - sy) * t)
};
};
P.getBezierAngle = function (t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
let T = 1 - t,
dx = Math.pow(T, 2) * (cp1x - sx) + 2 * t * T * (cp2x - cp1x) + t * t * (ex - cp2x),
dy = Math.pow(T, 2) * (cp1y - sy) + 2 * t * T * (cp2y - cp1y) + t * t * (ey - cp2y);
return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};
P.getQuadraticAngle = function (t, sx, sy, cp1x, cp1y, ex, ey) {
let T = 1 - t,
dx = 2 * T * (cp1x - sx) + 2 * t * (ex - cp1x),
dy = 2 * T * (cp1y - sy) + 2 * t * (ey - cp1y);
return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};
P.getLinearAngle = function (t, sx, sy, ex, ey) {
let dx = ex - sx,
dy = ey - sy;
return (-Math.atan2(dx, dy) + (0.5 * Math.PI)) / radian;
};
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
indexProgress = progress[0];
currentPosition = (requiredProgress / indexProgress) * positions[0];
}
else {
indexProgress = progress[index];
lastProgress = (index) ? progress[index - 1] : 0;
diffProgress = indexProgress - lastProgress;
indexPosition = positions[index];
nextPosition = positions[index + 1];
diffPosition = nextPosition - indexPosition;
currentPosition = indexPosition + (((requiredProgress - indexProgress) / diffProgress) * diffPosition);
}
return currentPosition;
}
else return pos;
};
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
P.getPathPositionData = function (pos, constantSpeed = false) {
if (this.useAsPath && xt(pos) && pos.toFixed) {
let remainder = pos % 1,
unitPartials = this.unitPartials,
previousLen = 0,
stoppingLen, myLen, i, iz, unit, species;
if (pos === 0) remainder = 0;
else if (pos === 1) remainder = 0.9999;
if (constantSpeed) remainder = this.getConstantPosition(remainder);
for (i = 0, iz = unitPartials.length; i < iz; i++) {
species = this.units[i][0];
if (species === 'move' || species === 'close' || species === 'unknown') continue;
stoppingLen = unitPartials[i];
if (remainder <= stoppingLen) {
unit = this.units[i];
myLen = (remainder - previousLen) / (stoppingLen - previousLen);
break;
}
previousLen = stoppingLen;
}
return this.buildPathPositionObject(unit, myLen);
}
return false;
}
P.calculateSensors = function () {
let sensorSpacing = this.sensorSpacing || 50,
length = this.length,
segments = parseInt(length / sensorSpacing, 10),
pos = 0,
data, i, iz;
if (segments < 4) segments = 4;
let segmentLength = 1 / segments;
let sensors = this.currentSensors;
sensors.length = 0;
data = this.getPathPositionData(0);
sensors.push([data.x, data.y]);
for (i = 0; i < segments; i++) {
pos += segmentLength;
data = this.getPathPositionData(pos);
sensors.push([data.x, data.y]);
}
};
P.prepareStamp = function() {
if (this.dirtyHost) this.dirtyHost = false;
if (this.dirtyScale || this.dirtySpecies || this.dirtyDimensions || this.dirtyStart || this.dirtyHandle) {
this.dirtyPathObject = true;
if (this.collides) this.dirtyCollision = true;
if (this.dirtyScale || this.dirtySpecies)  this.pathCalculatedOnce = false;
}
if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {
this.dirtyStampPositions = true;
if (this.collides) this.dirtyCollision = true;
}
if ((this.dirtyRotation || this.dirtyOffset) && this.collides) this.dirtyCollision = true;
if (this.dirtyCollision && !this.useAsPath) {
this.dirtyPathObject = true;
this.pathCalculatedOnce = false;
}
if (this.dirtyScale) this.cleanScale();
if (this.dirtyStart) this.cleanStart();
if (this.dirtyOffset) this.cleanOffset();
if (this.dirtyRotation) this.cleanRotation();
if (this.dirtyStampPositions) this.cleanStampPositions();
if (this.dirtySpecies) this.cleanSpecies();
if (this.dirtyPathObject) this.cleanPathObject();
if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();
};
P.cleanDimensions = function () {
this.dirtyDimensions = false;
this.dirtyStart = true;
this.dirtyHandle = true;
this.dirtyOffset = true;
};
P.cleanPathObject = function () {
this.dirtyPathObject = false;
if (!this.noPathUpdates || !this.pathObject) {
this.calculateLocalPath(this.pathDefinition);
if (this.dirtyDimensions) this.cleanDimensions();
if (this.dirtyHandle) this.cleanHandle();
if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();
let handle = this.currentStampHandlePosition;
this.pathObject = new Path2D(`m${-handle[0]},${-handle[1]}${this.localPath}`);
}
};
P.calculateLocalPath = function (d, isCalledFromAdditionalActions) {
let res;
if (this.collides) this.useAsPath = true;
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
P.calculateLocalPathAdditionalActions = defaultNonReturnFunction;
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
P.draw = function (engine) {
engine.stroke(this.pathObject);
if (this.showBoundingBox) this.drawBoundingBox(engine);
},
P.fill = function (engine) {
engine.fill(this.pathObject, this.winding);
if (this.showBoundingBox) this.drawBoundingBox(engine);
},
P.drawAndFill = function (engine) {
let p = this.pathObject;
engine.stroke(p);
this.currentHost.clearShadow();
engine.fill(p, this.winding);
if (this.showBoundingBox) this.drawBoundingBox(engine);
},
P.fillAndDraw = function (engine) {
let p = this.pathObject;
engine.stroke(p);
this.currentHost.clearShadow();
engine.fill(p, this.winding);
engine.stroke(p);
if (this.showBoundingBox) this.drawBoundingBox(engine);
},
P.drawThenFill = function (engine) {
let p = this.pathObject;
engine.stroke(p);
engine.fill(p, this.winding);
if (this.showBoundingBox) this.drawBoundingBox(engine);
},
P.fillThenDraw = function (engine) {
let p = this.pathObject;
engine.fill(p, this.winding);
engine.stroke(p);
if (this.showBoundingBox) this.drawBoundingBox(engine);
},
P.clear = function (engine) {
let gco = engine.globalCompositeOperation;
engine.globalCompositeOperation = 'destination-out';
engine.fill(this.pathObject, this.winding);
engine.globalCompositeOperation = gco;
if (this.showBoundingBox) this.drawBoundingBox(engine);
},
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
P.getBoundingBox = function () {
let floor = Math.floor,
ceil = Math.ceil,
minDims = this.minimumBoundingBoxDimensions;
let [x, y, w, h] = this.localBox;
let [hX, hY] = this.currentStampHandlePosition;
let [sX, sY] = this.currentStampPosition;
if (w < minDims) w = minDims;
if (h < minDims) h = minDims;
return [floor(x - hX), floor(y - hY), ceil(w), ceil(h), sX, sY];
};
return P;
};
