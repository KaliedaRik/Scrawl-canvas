import { constructors, entity } from '../core/library.js';
import { mergeOver, pushUnique, isa_number, isa_obj,
defaultNonReturnFunction, xt, xta } from '../core/utilities.js';
import { requestCell, releaseCell } from './cell.js';
import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import anchorMix from '../mixin/anchor.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';
const Grid = function (items = {}) {
this.tileFill = [];
this.tileSources = [];
this.entityInit(items);
if (!items.tileSources) {
this.tileSources = [].concat([{
type: 'color',
source: '#000000',
},
{
type: 'color',
source: '#ffffff',
}]);
}
if (!items.tileFill) {
this.tileFill.length = this.columns * this.rows;
this.tileFill.fill(0);
}
else if (Array.isArray(items.tileFill) && this.tileFill.length === items.tileFill.length) {
this.tileFill = items.tileFill;
}
this.tilePaths = [];
this.tileRealCoordinates = [];
this.tileVirtualCoordinates = [];
if (!items.dimensions) {
if (!items.width) this.currentDimensions[0] = this.dimensions[0] = 20;
if (!items.height) this.currentDimensions[1] = this.dimensions[1] = 20;
}
return this;
};
let P = Grid.prototype = Object.create(Object.prototype);
P.type = 'Grid';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;
P = baseMix(P);
P = positionMix(P);
P = anchorMix(P);
P = entityMix(P);
P = filterMix(P);
let defaultAttributes = {
columns: 2,
rows: 2,
columnGutterWidth: 1,
rowGutterWidth: 1,
gutterColor: '#808080',
tileFill: null,
tileSources: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);
P.packetExclusions = pushUnique(P.packetExclusions, ['tileSources']);
P.finalizePacketOut = function (copy, items) {
let cSources = copy.tileSources = [],
tSources = this.tileSources;
tSources.forEach(item => {
cSources.push({
type: item.type,
source: (isa_obj(item.source)) ? item.source.name : item.source
});
});
if (isa_obj(copy.gutterColor)) copy.gutterColor = copy.gutterColor.name;
let stateCopy = JSON.parse(this.state.saveAsPacket(items))[3];
copy = mergeOver(copy, stateCopy);
copy = this.handlePacketAnchor(copy, items);
return copy;
};
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
S.columns = function (item) {
if (isa_number(item)) {
if (!Number.isInteger(item)) item = parseInt(item, 10);
if (item !== this.columns) {
let i, iz, j,
currentFill = this.tileFill,
currentCols = this.columns,
newFill = [];
this.columns = item;
for (i = 0, iz = this.rows; i < iz; i++) {
for (j = 0; j < item; j++) {
if (j < currentCols) newFill.push(currentFill[(i * currentCols) + j]);
else newFill.push(0);
}
}
this.tileFill = newFill;
}
}
this.dirtyPathObject = true;
};
S.rows = function (item) {
if (isa_number(item)) {
if (!Number.isInteger(item)) item = parseInt(item, 10);
if (item !== this.rows) {
let currentRows = this.rows;
this.rows = item;
this.tileFill.length = this.columns * item;
if (currentRows < item) this.tileFill.fill(0, currentRows * this.columns);
}
}
this.dirtyPathObject = true;
};
D.columns = defaultNonReturnFunction;
D.rows = defaultNonReturnFunction;
/*
TODO - documentation
*/
P.setAllTilesTo = function (val) {
if (isa_number(val)) {
if (!Number.isInteger(val)) val = parseInt(val, 10);
this.tileFill.fill(val);
}
};
P.setTilesTo = function (tiles, val) {
let tileFill = this.tileFill;
if (xt(tiles) && isa_number(val)) {
if (!Number.isInteger(val)) val = parseInt(val, 10);
if (isa_number(tiles)) tileFill[tiles] = val;
else if (Array.isArray(tiles)) {
tiles.forEach(tile => {
if (isa_number(tile)) tileFill[tile] = val;
});
}
}
};
P.setTileSourceTo = function (index, obj) {
if (isa_number(index) && isa_obj(obj)) {
if (obj.type && obj.source) this.tileSources[index] = obj;
}
};
P.removeTileSource = function (index) {
if (isa_number(index) && index) {
this.tileSources[index] = null;
this.tileFill = this.tileFill.map(item => item === index ? 0 : item);
}
};
P.getTileSource = function (row, col) {
if (isa_number(row)) {
if (!isa_number(col)) return this.tileFill[row];
else return this.tileFill[(row * this.rows) + col];
}
};
P.getTilesUsingSource = function (index) {
if (isa_number(index)) this.tileFill.map(item => item === index ? 1 : 0);
};
P.cleanPathObject = function () {
this.dirtyPathObject = false;
if (!this.noPathUpdates || !this.pathObject) {
let p = this.pathObject = new Path2D(),
rowLines = new Path2D(),
colLines = new Path2D();
let handle = this.currentStampHandlePosition,
scale = this.currentScale,
dims = this.currentDimensions;
let x = -handle[0] * scale,
y = -handle[1] * scale,
w = dims[0] * scale,
h = dims[1] * scale;
p.rect(x, y, w, h);
let cols = this.columns,
rows = this.rows,
colWidth = w / cols,
rowHeight = h / rows,
paths = this.tilePaths,
real = this.tileRealCoordinates,
virtual = this.tileVirtualCoordinates,
i, j, cx, cy;
rowLines.moveTo(x, y);
rowLines.lineTo(x + w, y);
for (i = 1; i <= rows; i++) {
let ry = y + (i * rowHeight);
rowLines.moveTo(x, ry);
rowLines.lineTo(x + w, ry);
}
this.rowLines = rowLines;
colLines.moveTo(x, y);
colLines.lineTo(x, y + h);
for (j = 1; j <= cols; j++) {
let cx = x + (j * colWidth);
colLines.moveTo(cx, y);
colLines.lineTo(cx, y + h);
}
this.columnLines = colLines;
paths.length = 0;
real.length = 0;
virtual.length = 0;
for (i = 0; i < rows; i++) {
for (j = 0; j < cols; j++) {
let path = new Path2D();
cx = j * colWidth;
cy = i * rowHeight;
path.rect(x + cx, y + cy, colWidth, rowHeight);
paths.push(path);
virtual.push([cx, cy]);
real.push([x + cx, y + cy]);
}
}
this.currentTileWidth = colWidth;
this.currentTileHeight = rowHeight;
}
};
P.performFill = function (engine) {
engine.save();
let composer = requestCell(),
compEngine = composer.engine,
compCanvas = composer.element;
let tileSources = this.tileSources,
tileFill = this.tileFill,
tilePaths = this.tilePaths,
tileRealCoords = this.tileRealCoordinates,
tileVirtualCoords = this.tileVirtualCoordinates,
winding = this.winding,
tileWidth = this.currentTileWidth,
tileHeight = this.currentTileHeight,
scale = this.scale;
let dims = this.currentDimensions;
let currentPicture;
tileSources.forEach((obj, index) => {
if (obj && obj.type) {
switch (obj.type) {
case 'color' :
engine.fillStyle = obj.source;
break;
case 'cellGradient' :
this.lockFillStyleToEntity = false;
engine.fillStyle = obj.source.getData(this, this.currentHost, true);
break;
case 'gridGradient' :
this.lockFillStyleToEntity = true;
engine.fillStyle = obj.source.getData(this, this.currentHost, true);
break;
}
}
let validTiles = tileFill.map(item => item === index ? true : false);
if (validTiles.length) {
switch (obj.type) {
case 'gridPicture' :
currentPicture = (obj.source.substring) ? entity[obj.source] : obj.source;
if (currentPicture.simpleStamp) {
compCanvas.width = dims[0] * scale;
compCanvas.height = dims[1] * scale;
compEngine.globalCompositeOperation = 'source-over';
compEngine.fillStyle = '#000000';
validTiles.forEach((tile, pos) => {
if (tile) compEngine.fillRect(tileVirtualCoords[pos][0], tileVirtualCoords[pos][1], tileWidth, tileHeight);
});
compEngine.globalCompositeOperation = 'source-in';
currentPicture.simpleStamp(composer, {
startX: 0,
startY: 0,
width: dims[0] * scale,
height: dims[1] * scale,
method: 'fill'
});
engine.drawImage(compCanvas, tileRealCoords[0][0], tileRealCoords[0][1]);
}
break;
case 'tilePicture' :
currentPicture = (obj.source.substring) ? entity[obj.source] : obj.source;
if (currentPicture.simpleStamp) {
compCanvas.width = tileWidth;
compCanvas.height = tileHeight;
compEngine.globalCompositeOperation = 'source-over';
currentPicture.simpleStamp(composer, {
startX: 0,
startY: 0,
width: tileWidth,
height: tileHeight,
method: 'fill'
});
validTiles.forEach((tile, pos) => tile && engine.drawImage(compCanvas, tileRealCoords[pos][0], tileRealCoords[pos][1]));
}
break;
default :
validTiles.forEach((tile, pos) => tile && engine.fill(tilePaths[pos], winding));
}
}
});
let gColor = this.gutterColor,
gRow = this.rowGutterWidth,
gCol = this.columnGutterWidth,
gObject;
if(xt(gColor)) {
if (gColor.substring) {
gObject = {
type: 'color',
source: this.gutterColor
};
}
else if (isa_obj(gColor)) gObject = gColor;
else if (isa_number(gColor) && isa_obj(tileSources[gColor])) gObject = tileSources[gColor];
switch (gObject.type) {
case 'cellGradient' :
this.lockFillStyleToEntity = false;
engine.strokeStyle = gObject.source.getData(this, this.currentHost, true);
break;
case 'gridGradient' :
this.lockFillStyleToEntity = true;
engine.strokeStyle = gObject.source.getData(this, this.currentHost, true);
break;
case 'color' :
engine.strokeStyle = gObject.source;
break;
}
switch (gObject.type) {
case 'gridPicture' :
case 'tilePicture' :
if(gRow || gCol) {
currentPicture = (gObject.source.substring) ? entity[gObject.source] : gObject.source;
if (currentPicture.simpleStamp) {
let handle = this.currentStampHandlePosition,
scale = this.currentScale,
x = handle[0] * scale,
y = handle[1] * scale;
compCanvas.width = dims[0] * scale;
compCanvas.height = dims[1] * scale;
compEngine.globalCompositeOperation = 'source-over';
compEngine.strokeStyle = '#000000';
compEngine.translate(x, y);
if (gRow) {
compEngine.lineWidth = gRow;
compEngine.stroke(this.rowLines);
}
if (gCol) {
compEngine.lineWidth = gCol;
compEngine.stroke(this.columnLines);
}
compEngine.globalCompositeOperation = 'source-in';
currentPicture.simpleStamp(composer, {
startX: 0,
startY: 0,
width: dims[0] * scale,
height: dims[1] * scale,
method: 'fill'
});
engine.drawImage(compCanvas, tileRealCoords[0][0], tileRealCoords[0][1]);
compEngine.translate(0, 0);
}
}
break;
default :
if (gRow) {
engine.lineWidth = gRow;
engine.stroke(this.rowLines);
}
if (gCol) {
engine.lineWidth = gCol;
engine.stroke(this.columnLines);
}
}
}
releaseCell(composer);
engine.restore();
};
P.fill = function (engine) {
this.performFill(engine);
};
P.drawAndFill = function (engine) {
let p = this.pathObject;
engine.stroke(p);
this.currentHost.clearShadow();
this.performFill(engine);
};
P.fillAndDraw = function (engine) {
let p = this.pathObject;
engine.stroke(p);
this.currentHost.clearShadow();
this.performFill(engine);
engine.stroke(p);
};
P.drawThenFill = function (engine) {
let p = this.pathObject;
engine.stroke(p);
this.performFill(engine);
};
P.fillThenDraw = function (engine) {
let p = this.pathObject;
this.performFill(engine);
engine.stroke(p);
};
P.checkHit = function (items = [], mycell) {
if (this.noUserInteraction) return false;
if (!this.pathObject || this.dirtyPathObject) {
this.cleanPathObject();
}
let tests = (!Array.isArray(items)) ?  [items] : items,
poolCellFlag = false;
if (!mycell) {
mycell = requestCell();
poolCellFlag = true;
}
let engine = mycell.engine,
stamp = this.currentStampPosition,
x = stamp[0],
y = stamp[1],
isGood, tx, ty,
tiles = new Set(),
tilePaths = this.tilePaths;
const getCoords = (coords) => {
let x, y;
if (Array.isArray(coords)) {
x = coords[0];
y = coords[1];
}
else if (xta(coords, coords.x, coords.y)) {
x = coords.x;
y = coords.y;
}
else return [false];
if (!x.toFixed || !y.toFixed || isNaN(x) || isNaN(y)) return [false];
return [true, x, y];
}
mycell.rotateDestination(engine, x, y, this);
if (tests.some(test => {
[isGood, tx, ty] = getCoords(test);
if (!isGood) return false;
else return engine.isPointInPath(this.pathObject, tx, ty, this.winding);
}, this)) {
tests.forEach(test => {
[isGood, tx, ty] = getCoords(test);
if (isGood) {
tilePaths.some((path, index) => {
if (engine.isPointInPath(path, tx, ty, this.winding)) {
tiles.add(index);
return true;
}
return false;
})
}
})
if (poolCellFlag) releaseCell(mycell);
return {
x: tx,
y: ty,
tiles: [...tiles],
artefact: this
};
}
if (poolCellFlag) releaseCell(mycell);
return false;
};
const makeGrid = function (items) {
return new Grid(items);
};
constructors.Grid = Grid;
export {
makeGrid,
};
