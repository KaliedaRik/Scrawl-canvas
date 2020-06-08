import { constructors, artefact } from '../core/library.js';
import { currentGroup } from '../core/document.js';
import { mergeOver, mergeDiscard, pushUnique, λnull, λthis, xta } from '../core/utilities.js';
import { makeState } from '../factory/state.js';
import { requestCell, releaseCell } from '../factory/cell.js';
import baseMix from '../mixin/base.js';
import anchorMix from '../mixin/anchor.js';
const Loom = function (items = {}) {
this.makeName(items.name);
this.register();
this.set(this.defs);
this.state = makeState();
if (!items.group) items.group = currentGroup;
this.onEnter = λnull;
this.onLeave = λnull;
this.onDown = λnull;
this.onUp = λnull;
this.delta = {};
this.set(items);
this.fromPathData = [];
this.toPathData = [];
this.watchFromPath = null;
this.watchIndex = -1;
this.engineInstructions = [];
this.engineDeltaLengths = [];
return this;
};
let P = Loom.prototype = Object.create(Object.prototype);
P.type = 'Loom';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = anchorMix(P);
let defaultAttributes = {
fromPath: null,
toPath: null,
fromPathStart: 0,
fromPathEnd: 1,
toPathStart: 0,
toPathEnd: 1,
synchronizePathCursors: true,
loopPathCursors: true,
constantPathSpeed: true,
isHorizontalCopy: true,
showBoundingBox: false,
boundingBoxColor: '#000000',
source: null,
sourceIsVideoOrSprite: false,
interferenceLoops: 2,
interferenceFactor: 1.03,
visibility: true,
order: 0,
delta: null,
host: null,
group: null,
anchor: null,
noCanvasEngineUpdates: false,
noDeltaUpdates: false,
onEnter: null,
onLeave: null,
onDown: null,
onUp: null,
noUserInteraction: false,
method: 'fill',
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['pathObject', 'state']);
P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, ['^(local|dirty|current)', 'Subscriber$']);
P.packetCoordinates = pushUnique(P.packetCoordinates, []);
P.packetObjects = pushUnique(P.packetObjects, ['group', 'fromPath', 'toPath', 'source']);
P.packetFunctions = pushUnique(P.packetFunctions, ['onEnter', 'onLeave', 'onDown', 'onUp']);
P.processPacketOut = function (key, value, includes) {
let result = true;
if(includes.indexOf(key) < 0 && value === this.defs[key]) result = false;
return result;
};
P.finalizePacketOut = function (copy, items) {
let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
copy = mergeOver(copy, stateCopy);
copy = this.handlePacketAnchor(copy, items);
return copy;
};
P.handlePacketAnchor = function (copy, items) {
if (this.anchor) {
let a = JSON.parse(this.anchor.saveAsPacket(items))[3];
copy.anchor = a;
}
return copy;
}
P.clone = λthis;
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
P.get = function (item) {
let getter = this.getters[item];
if (getter) return getter.call(this);
else {
let def = this.defs[item],
state = this.state,
val;
if (typeof def != 'undefined') {
val = this[item];
return (typeof val != 'undefined') ? val : def;
}
def = state.defs[item];
if (typeof def != 'undefined') {
val = state[item];
return (typeof val != 'undefined') ? val : def;
}
return undef;
}
};
P.set = function (items = {}) {
if (items) {
let setters = this.setters,
defs = this.defs,
state = this.state,
stateSetters = (state) ? state.setters : {},
stateDefs = (state) ? state.defs : {};
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key],
stateFlag = false;
if (!predefined) {
predefined = stateSetters[key];
stateFlag = true;
}
if (predefined) predefined.call(stateFlag ? this.state : this, value);
else if (typeof defs[key] !== 'undefined') this[key] = value;
else if (typeof stateDefs[key] !== 'undefined') state[key] = value;
}
}, this);
}
return this;
};
P.setDelta = function (items = {}) {
if (items) {
let setters = this.deltaSetters,
defs = this.defs,
state = this.state,
stateSetters = (state) ? state.deltaSetters : {},
stateDefs = (state) ? state.defs : {};
Object.entries(items).forEach(([key, value]) => {
if (key && key !== 'name' && value != null) {
let predefined = setters[key],
stateFlag = false;
if (!predefined) {
predefined = stateSetters[key];
stateFlag = true;
}
if (predefined) predefined.call(stateFlag ? this.state : this, value);
else if (typeof defs[key] !== 'undefined') this[key] = addStrings(this[key], value);
else if (typeof stateDefs[key] !== 'undefined') state[key] = addStrings(state[key], value);
}
}, this);
}
return this;
};
S.host = function (item) {
if (item) {
let host = artefact[item];
if (host && host.here) this.host = host.name;
else this.host = item;
}
else this.host = '';
};
G.group = function () {
return (this.group) ? this.group.name : '';
};
S.group = function (item) {
let g;
if (item) {
if (this.group && this.group.type === 'Group') this.group.removeArtefacts(this.name);
if (item.substring) {
g = group[item];
if (g) this.group = g;
else this.group = item;
}
else this.group = item;
}
if (this.group && this.group.type === 'Group') this.group.addArtefacts(this.name);
};
P.getHere = function () {
return currentCorePosition;
};
S.delta = function (items = {}) {
if (items) this.delta = mergeDiscard(this.delta, items);
};
S.fromPath = function (item) {
if (item) {
let oldPath = this.fromPath,
newPath = (item.substring) ? artefact[item] : item,
name = this.name;
if (newPath && newPath.name && newPath.useAsPath) {
if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);
pushUnique(newPath.pathed, name);
this.fromPath = newPath;
this.dirtyStart = true;
}
}
};
S.toPath = function (item) {
if (item) {
let oldPath = this.toPath,
newPath = (item.substring) ? artefact[item] : item,
name = this.name;
if (newPath && newPath.name && newPath.useAsPath) {
if (oldPath && oldPath.name !== newPath.name) removeItem(oldPath.pathed, name);
pushUnique(newPath.pathed, name);
this.toPath = newPath;
this.dirtyStart = true;
}
}
};
S.source = function (item) {
item = (item.substring) ? artefact[item] : item;
if (item && item.type === 'Picture') {
let src = this.source;
if (src && src.type === 'Picture') src.imageUnsubscribe(this.name);
this.source = item;
item.imageSubscribe(this.name);
this.dirtyInput = true;
}
};
S.isHorizontalCopy = function (item) {
this.isHorizontalCopy = (item) ? true : false;
this.dirtyPathData = true;
};
S.synchronizePathCursors = function (item) {
this.synchronizePathCursors = (item) ? true : false;
if (item) {
this.toPathStart = this.fromPathStart;
this.toPathEnd = this.fromPathEnd;
}
this.dirtyPathData = true;
};
S.loopPathCursors = function (item) {
this.loopPathCursors = (item) ? true : false;
if (item) {
let c,
floor = Math.floor;
c = this.fromPathStart
if (c < 0 || c > 1) this.fromPathStart = c - floor(c);
c = this.fromPathEnd
if (c < 0 || c > 1) this.fromPathEnd = c - floor(c);
c = this.toPathStart
if (c < 0 || c > 1) this.toPathStart = c - floor(c);
c = this.toPathEnd
if (c < 0 || c > 1) this.toPathEnd = c - floor(c);
}
this.dirtyOutput = true;
};
S.fromPathStart = function (item) {
if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
this.fromPathStart = item;
if (this.synchronizePathCursors) this.toPathStart = item;
this.dirtyPathData = true;
};
D.fromPathStart = function (item) {
let val = this.fromPathStart += item;
if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
this.fromPathStart = val;
if (this.synchronizePathCursors) this.toPathStart = val;
this.dirtyPathData = true;
};
S.fromPathEnd = function (item) {
if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
this.fromPathEnd = item;
if (this.synchronizePathCursors) this.toPathEnd = item;
this.dirtyPathData = true;
};
D.fromPathEnd = function (item) {
let val = this.fromPathEnd += item;
if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
this.fromPathEnd = val;
if (this.synchronizePathCursors) this.toPathEnd = val;
this.dirtyPathData = true;
};
S.toPathStart = function (item) {
if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
this.toPathStart = item;
if (this.synchronizePathCursors) this.fromPathStart = item;
this.dirtyPathData = true;
};
D.toPathStart = function (item) {
let val = this.toPathStart += item;
if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
this.toPathStart = val;
if (this.synchronizePathCursors) this.fromPathStart = val;
this.dirtyPathData = true;
};
S.toPathEnd = function (item) {
if (this.loopPathCursors && (item < 0 || item > 1)) item = item - Math.floor(item);
this.toPathEnd = item;
if (this.synchronizePathCursors) this.fromPathEnd = item;
this.dirtyPathData = true;
};
D.toPathEnd = function (item) {
let val = this.toPathEnd += item;
if (this.loopPathCursors && (val < 0 || val > 1)) val = val - Math.floor(val);
this.toPathEnd = val;
if (this.synchronizePathCursors) this.fromPathEnd = val;
this.dirtyPathData = true;
};
P.getHost = function () {
if (this.currentHost) return this.currentHost;
else if (this.host) {
let host = artefact[this.host];
if (host) {
this.currentHost = host;
this.dirtyHost = true;
return this.currentHost;
}
}
return currentCorePosition;
};
P.updateByDelta = function () {
this.setDelta(this.delta);
return this;
};
P.reverseByDelta = function () {
let temp = {};
Object.entries(this.delta).forEach(([key, val]) => {
if (val.substring) val = -(parseFloat(val)) + '%';
else val = -val;
temp[key] = val;
});
this.setDelta(temp);
return this;
};
P.setDeltaValues = function (items = {}) {
let delta = this.delta,
oldVal, action;
Object.entries(items).forEach(([key, requirement]) => {
if (xt(delta[key])) {
action = requirement;
oldVal = delta[key];
switch (action) {
case 'reverse' :
if (oldVal.toFixed) delta[key] = -oldVal;
break;
case 'zero' :
if (oldVal.toFixed) delta[key] = 0;
break;
case 'add' :
break;
case 'subtract' :
break;
case 'multiply' :
break;
case 'divide' :
break;
}
}
})
return this;
};
P.midInitActions = λnull;
P.cleanCollisionData = function () {
return [0, []];
};
P.getSensors = function () {
return [];
};
P.prepareStamp = function() {
let fPath = this.fromPath,
tPath = this.toPath;
let [startX, startY, outputWidth, outputHeight] = this.getBoundingBox();
if (!this.dirtyPathData) {
let {x: testFromStartX, y: testFromStartY} = fPath.getPathPositionData(0);
let {x: testFromEndX, y: testFromEndY} = fPath.getPathPositionData(1);
let {x: testToStartX, y: testToStartY} = tPath.getPathPositionData(0);
let {x: testToEndX, y: testToEndY} = tPath.getPathPositionData(1);
let localPathTests = [testFromStartX, testFromStartY, testFromEndX, testFromEndY, testToStartX, testToStartY, testToEndX, testToEndY];
if (!this.pathTests || this.pathTests.some((item, index) => item !== localPathTests[index])) {
this.pathTests = localPathTests;
this.dirtyPathData = true;
}
}
if (this.dirtyPathData || !this.fromPathData.length) {
this.dirtyPathData = false;
this.watchIndex = -1;
this.engineInstructions.length = 0;
this.engineDeltaLengths.length = 0;
let mCeil = Math.ceil,
mMax = Math.max,
mMin = Math.min,
mFloor = Math.floor;
let fromPathData = this.fromPathData;
fromPathData.length = 0;
let toPathData = this.toPathData;
toPathData.length = 0;
if(fPath && tPath) {
let fPathLength = mCeil(fPath.length),
tPathLength = mCeil(tPath.length),
pathSteps, pathDelta, x, y;
pathSteps = this.setSourceDimension(mMax(fPathLength, tPathLength));
let fPathStart = this.fromPathStart,
fPathEnd = this.fromPathEnd,
tPathStart = this.toPathStart,
tPathEnd = this.toPathEnd,
fPartial, tPartial, fRatio, tRatio, minPartial,
pathSpeed = this.constantPathSpeed;
if (fPathStart < fPathEnd) fPartial = fPathEnd - fPathStart;
else fPartial = fPathEnd + (1 - fPathStart);
if (fPartial < 0.005) fPartial = 0.005;
if (tPathStart < tPathEnd) tPartial = tPathEnd - tPathStart;
else tPartial = tPathEnd + (1 - tPathStart);
if (tPartial < 0.005) tPartial = 0.005;
minPartial = mCeil(mMin(fPartial, tPartial));
pathDelta = 1 / (pathSteps * (1 / minPartial));
for (let cursor = 0; cursor <= 1; cursor += pathDelta) {
({x, y} = fPath.getPathPositionData(cursor, pathSpeed));
fromPathData.push([x - startX, y - startY]);
({x, y} = tPath.getPathPositionData(cursor, pathSpeed));
toPathData.push([x - startX, y - startY]);
}
this.fromPathSteps = fPartial / minPartial;
this.toPathSteps = tPartial / minPartial;
this.watchFromPath = (this.fromPathSteps === 1) ? true : false;
this.dirtyOutput = true;
}
else this.dirtyPathData = true;
}
if (this.sourceIsVideoOrSprite) this.dirtyInput = true;
};
P.setSourceDimension = function (val) {
if (val) {
if (this.sourceDimension !== val) {
this.sourceDimension = val;
this.dirtyInput = true;
}
}
else {
let fPath = this.fromPath,
tPath = this.toPath;
if(fPath && tPath) {
let mCeil = Math.ceil,
fPathLength = mCeil(fPath.length),
tPathLength = mCeil(tPath.length);
let steps = Math.max(fPathLength, tPathLength);
if (this.sourceDimension !== steps) this.sourceDimension = steps;
}
else this.sourceDimension = 0;
}
return this.sourceDimension;
};
P.simpleStamp = function (host, changes = {}) {
if (host && host.type === 'Cell') {
this.currentHost = host;
if (changes) {
this.set(changes);
this.prepareStamp();
}
this.regularStampSynchronousActions();
}
};
P.stamp = function (force = false, host, changes) {
if (force) {
if (host && host.type === 'Cell') this.currentHost = host;
if (changes) {
this.set(changes);
this.prepareStamp();
}
return this.regularStamp();
}
if (this.visibility) {
let self = this,
dirtyInput = this.dirtyInput,
dirtyOutput = this.dirtyOutput;
if (dirtyInput) {
return new Promise((resolve, reject) => {
self.cleanInput()
.then(res => {
self.sourceImageData = res;
return self.cleanOutput();
})
.then(res => {
self.output = res;
return self.regularStamp();
})
.then(res => {
resolve(true);
})
.catch(err => {
reject(err);
});
})
}
else if (dirtyOutput) {
return new Promise((resolve, reject) => {
self.cleanOutput()
.then(res => {
self.output = res;
return self.regularStamp();
})
.then(res => {
resolve(true);
})
.catch(err => {
reject(err);
});
})
}
else return this.regularStamp();
}
else return Promise.resolve(false);
};
P.cleanInput = function () {
let self = this;
return new Promise((resolve, reject) => {
self.dirtyInput = false;
self.setSourceDimension();
let sourceDimension = self.sourceDimension;
if (!sourceDimension) {
self.dirtyInput = true;
reject(new Error(`${self.name} - cleanInput Error: source has a zero dimension`));
}
let cell = requestCell(),
engine = cell.engine,
canvas = cell.element;
canvas.width = sourceDimension;
canvas.height = sourceDimension;
engine.setTransform(1, 0, 0, 1, 0, 0);
self.source.stamp(true, cell, {
startX: 0,
startY: 0,
handleX: 0,
handleY: 0,
offsetX: 0,
offsetY: 0,
roll: 0,
scale: 1,
width: sourceDimension,
height: sourceDimension,
method: 'fill',
})
.then(res => {
let sourceImageData = engine.getImageData(0, 0, sourceDimension, sourceDimension);
releaseCell(cell);
resolve(sourceImageData);
})
.catch(err => {
releaseCell(cell);
reject(err);
});
});
};
P.cleanOutput = function () {
let self = this;
return new Promise((resolve, reject) => {
self.dirtyOutput = false;
self.setSourceDimension();
let sourceDimension = self.sourceDimension,
sourceData = self.sourceImageData;
if (sourceDimension && sourceData) {
let mHypot = Math.hypot,
mFloor = Math.floor,
mCeil = Math.ceil,
mAtan2 = Math.atan2,
mCos = Math.cos,
mSin = Math.sin;
let fromPathData = self.fromPathData,
toPathData = self.toPathData,
dataLen = fromPathData.length,
fPathStart = self.fromPathStart,
fCursor = fPathStart * dataLen,
fStep = self.fromPathSteps || 1,
tPathStart = self.toPathStart,
tCursor = tPathStart * dataLen,
tStep = self.toPathSteps || 1,
magicHorizontalPi = 0.5 * Math.PI,
magicVerticalPi = magicHorizontalPi - 1.5708,
isHorizontalCopy = self.isHorizontalCopy,
loop = self.loopPathCursors,
fx, fy, tx, ty, dx, dy, dLength, dAngle, cos, sin,
watchFromPath = self.watchFromPath,
watchIndex = self.watchIndex,
engineInstructions = self.engineInstructions,
engineDeltaLengths = self.engineDeltaLengths,
instruction;
let [startX, startY, outputWidth, outputHeight] = self.getBoundingBox();
let inputCell = requestCell(),
inputEngine = inputCell.engine,
inputCanvas = inputCell.element;
inputCanvas.width = sourceDimension;
inputCanvas.height = sourceDimension;
inputEngine.setTransform(1, 0, 0, 1, 0, 0);
inputEngine.putImageData(sourceData, 0, 0);
let outputCell = requestCell(),
outputEngine = outputCell.engine,
outputCanvas = outputCell.element;
outputCanvas.width = outputWidth;
outputCanvas.height = outputHeight;
outputEngine.globalAlpha = self.state.globalAlpha;
outputEngine.setTransform(1, 0, 0, 1, 0, 0);
if(!engineInstructions.length) {
for (let i = 0; i < sourceDimension; i++) {
if (watchIndex < 0) {
if (watchFromPath && fCursor < 1) watchIndex = i;
else if (!watchFromPath && tCursor < 1) watchIndex = i;
}
if (fCursor < dataLen && tCursor < dataLen && fCursor >= 0 && tCursor >= 0) {
[fx, fy] = fromPathData[mFloor(fCursor)];
[tx, ty] = toPathData[mFloor(tCursor)];
dx = tx - fx;
dy = ty - fy;
dLength = mHypot(dx, dy);
if (isHorizontalCopy) {
dAngle = -mAtan2(dx, dy) + magicHorizontalPi;
cos = mCos(dAngle);
sin = mSin(dAngle);
engineInstructions.push([cos, sin, -sin, cos, fx, fy]);
engineDeltaLengths.push(dLength);
}
else {
dAngle = -mAtan2(dx, dy) + magicVerticalPi;
cos = mCos(dAngle);
sin = mSin(dAngle);
engineInstructions.push([cos, sin, -sin, cos, fx, fy, dLength]);
engineDeltaLengths.push(dLength);
}
}
else {
engineInstructions.push(false);
engineDeltaLengths.push(false);
}
fCursor += fStep;
tCursor += tStep;
if (loop) {
if (fCursor >= dataLen) fCursor -= dataLen;
if (tCursor >= dataLen) tCursor -= dataLen;
}
}
if (watchIndex < 0) watchIndex = 0;
self.watchIndex = watchIndex;
}
if (isHorizontalCopy) {
for (let i = 0; i < sourceDimension; i++) {
instruction = engineInstructions[watchIndex];
if (instruction) {
outputEngine.setTransform(...instruction);
outputEngine.drawImage(inputCanvas, 0, watchIndex, sourceDimension, 1, 0, 0, engineDeltaLengths[watchIndex], 1);
}
watchIndex++;
if (watchIndex >= sourceDimension) watchIndex = 0;
}
}
else {
for (let i = 0; i < sourceDimension; i++) {
instruction = engineInstructions[watchIndex];
if (instruction) {
outputEngine.setTransform(...instruction);
outputEngine.drawImage(inputCanvas, watchIndex, 0, 1, sourceDimension, 0, 0, 1, engineDeltaLengths[watchIndex]);
}
watchIndex++;
if (watchIndex >= sourceDimension) watchIndex = 0;
}
}
let iFactor = self.interferenceFactor,
iLoops = self.interferenceLoops,
iWidth = mCeil(outputWidth * iFactor),
iHeight = mCeil(outputHeight * iFactor);
inputCanvas.width = iWidth;
inputCanvas.height = iHeight;
outputEngine.setTransform(1, 0, 0, 1, 0, 0);
inputEngine.setTransform(1, 0, 0, 1, 0, 0);
for (let j = 0; j < iLoops; j++) {
inputEngine.drawImage(outputCanvas, 0, 0, outputWidth, outputHeight, 0, 0, iWidth, iHeight);
outputEngine.drawImage(inputCanvas, 0, 0, iWidth, iHeight, 0, 0, outputWidth, outputHeight);
}
let outputData = outputEngine.getImageData(0, 0, outputWidth, outputHeight);
releaseCell(inputCell);
releaseCell(outputCell);
self.dirtyTargetImage = true;
resolve(outputData);
}
else reject(new Error(`${this.name} - cleanOutput Error: source has a zero dimension, or no data`));
});
};
P.regularStamp = function () {
let self = this;
return new Promise((resolve, reject) => {
if (self.currentHost) {
self.regularStampSynchronousActions();
resolve(true);
}
reject(new Error(`${self.name} has no current host`));
});
};
P.regularStampSynchronousActions = function () {
let dest = this.currentHost;
if (dest) {
let engine = dest.engine;
if (!this.noCanvasEngineUpdates) dest.setEngine(this);
this[this.method](engine);
}
};
P.getBoundingBox = function () {
let fPath = this.fromPath,
tPath = this.toPath;
if(fPath && tPath) {
if (this.dirtyStart) {
if (fPath.getBoundingBox && tPath.getBoundingBox) {
this.dirtyStart = false;
let [lsx, lsy, sw, sh, sx, sy] = fPath.getBoundingBox();
let [lex, ley, ew, eh, ex, ey] = tPath.getBoundingBox();
if (isNaN(lsx) || isNaN(lsy) || isNaN(sw) || isNaN(sh) || isNaN(sx) || isNaN(sy) || isNaN(lex) || isNaN(ley) || isNaN(ew) || isNaN(eh) || isNaN(ex) || isNaN(ey)) this.dirtyStart = true;
if (lsx == lex && lsy == ley && sw == ew && sh == eh && sx == ex && sy == ey) this.dirtyStart = true;
lsx += sx;
lsy += sy;
lex += ex;
ley += ey;
let minX = Math.min(lsx, lex);
let maxX = Math.max(lsx + sw, lex + ew);
let minY = Math.min(lsy, ley);
let maxY = Math.max(lsy + sh, ley + eh);
this.boundingBox = [minX, minY, maxX - minX, maxY - minY];
this.dirtyPathData = true;
}
else this.boundingBox = [0, 0, 0, 0];
}
}
else this.boundingBox = [0, 0, 0, 0];
return this.boundingBox;
};
P.fill = function (engine) {
this.doFill(engine);
if (this.showBoundingBox) this.drawBoundingBox(engine);
};
P.draw = function (engine) {
this.doStroke(engine);
if (this.showBoundingBox) this.drawBoundingBox(engine);
};
P.drawAndFill = function (engine) {
this.doStroke(engine);
this.currentHost.clearShadow();
this.doFill(engine);
if (this.showBoundingBox) this.drawBoundingBox(engine);
};
P.fillAndDraw = function (engine) {
this.doFill(engine);
this.currentHost.clearShadow();
this.doStroke(engine);
if (this.showBoundingBox) this.drawBoundingBox(engine);
};
P.drawThenFill = function (engine) {
this.doStroke(engine);
this.doFill(engine);
if (this.showBoundingBox) this.drawBoundingBox(engine);
};
P.fillThenDraw = function (engine) {
this.doFill(engine);
this.doStroke(engine);
if (this.showBoundingBox) this.drawBoundingBox(engine);
};
P.clear = function (engine) {
let output = this.output,
canvas = (this.currentHost) ? this.currentHost.element : false,
gco = engine.globalCompositeOperation;
if (output && canvas) {
let tempCell = requestCell(),
tempEngine = tempCell.engine,
tempCanvas = tempCell.element;
let [x, y, w, h] = this.getBoundingBox();
tempCanvas.width = w;
tempCanvas.height = h;
tempEngine.putImageData(output, 0, 0);
engine.setTransform(1, 0, 0, 1, 0, 0);
engine.globalCompositeOperation = 'destination-out';
engine.drawImage(tempCanvas, 0, 0, w, h, x, y, w, h);
engine.globalCompositeOperation = gco;
releaseCell(tempCell);
if (this.showBoundingBox) this.drawBoundingBox(engine);
}
};
P.none = λnull;
P.doStroke = function (engine) {
let fPath = this.fromPath,
tPath = this.toPath;
if(fPath && fPath.getBoundingBox && tPath && tPath.getBoundingBox) {
let host = this.currentHost;
if (host) {
let fStart = fPath.currentStampPosition,
fEnd = fPath.getPathPositionData(1),
tStart = tPath.currentStampPosition,
tEnd = tPath.getPathPositionData(1);
host.rotateDestination(engine, fStart[0], fStart[1], fPath);
engine.stroke(fPath.pathObject);
host.rotateDestination(engine, tStart[0], tStart[1], fPath);
engine.stroke(tPath.pathObject);
engine.setTransform(1,0, 0, 1, 0, 0);
engine.beginPath()
engine.moveTo(fEnd.x, fEnd.y);
engine.lineTo(tEnd.x, tEnd.y);
engine.moveTo(...tStart);
engine.lineTo(...fStart);
engine.closePath();
engine.stroke();
}
}
};
P.doFill = function (engine) {
let output = this.output,
canvas = (this.currentHost) ? this.currentHost.element : false;
if (output && canvas) {
let tempCell = requestCell(),
tempEngine = tempCell.engine,
tempCanvas = tempCell.element;
let [x, y, w, h] = this.getBoundingBox();
tempCanvas.width = w;
tempCanvas.height = h;
tempEngine.putImageData(output, 0, 0);
engine.setTransform(1, 0, 0, 1, 0, 0);
engine.drawImage(tempCanvas, 0, 0, w, h, x, y, w, h);
releaseCell(tempCell);
}
};
P.drawBoundingBox = function (engine) {
if (this.dirtyStart) this.getBoundingBox();
engine.save();
let t = engine.getTransform();
engine.setTransform(1, 0, 0, 1, 0, 0);
engine.strokeStyle = this.boundingBoxColor;
engine.lineWidth = 1;
engine.globalCompositeOperation = 'source-over';
engine.globalAlpha = 1;
engine.shadowOffsetX = 0;
engine.shadowOffsetY = 0;
engine.shadowBlur = 0;
engine.strokeRect(...this.boundingBox);
engine.restore();
engine.setTransform(t);
};
P.checkHit = function (items = []) {
if (this.noUserInteraction) return false;
let tests = (!Array.isArray(items)) ?  [items] : items,
targetData = (this.output && this.output.data) ? this.output.data : false,
tx, ty, cx, cy, index;
if (targetData) {
let [x, y, w, h] = this.getBoundingBox();
if (tests.some(test => {
if (Array.isArray(test)) {
tx = test[0];
ty = test[1];
}
else if (xta(test, test.x, test.y)) {
tx = test.x;
ty = test.y;
}
else return false;
if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;
cx = tx - x;
cy = ty - y;
if (cx < 0 || cx > w || cy < 0 || cy > h) return false;
index = (((cy * w) + cx) * 4) + 3;
if (targetData) return (targetData[index] > 0) ? true : false;
else return false;
}, this)) {
return {
x: tx,
y: ty,
artefact: this
};
}
}
return false;
};
const makeLoom = function (items) {
return new Loom(items);
};
constructors.Loom = Loom;
export {
makeLoom,
};
