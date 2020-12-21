// # Grid factory
// The Grid entity is a graphical representation of __a grid with equal width columns and equal height rows__, separated by gutters. Each tile within the grid can be filled with a different color, or a different gradient, or a different Picture entity output.
// + Each grid requires a mimimum of one column and one row; columns will divide into the Grid width evenly, rows divide evenly into the Grid height.
// + The __tiles__ can display as many different colors, or gradients, or Pictures, as are required for the display.
// + The __gutters__ between columns, and between rows, can be different values; gutter fills can also be colors, gradients or Picture entity output.
// + The display for each tile, and the gutters, can be easily updated.
// + Grid entity __hit reports__ include an extra attribute - an array of tiles that report being hit.
// + Grids will accept __Filter__ objects - filters are applied to the entire Grid, not to individual tiles.
// + They can use __Anchor__ objects for user navigation. 
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__. 
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Grids can be cloned, and killed.


// #### Demos:
// + [Canvas-022](../../demo/canvas-022.html) - Grid entity - basic functionality (color, gradients)
// + [Canvas-023](../../demo/canvas-023.html) - Grid entity - using picture-based assets (image, video, sprite)
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors, entity } from '../core/library.js';
import { mergeOver, pushUnique, isa_number, isa_obj, λnull, xt, xta } from '../core/utilities.js';

import { requestCell, releaseCell } from './cell.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';


// #### Grid constructor
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


// #### Block prototype
let P = Grid.prototype = Object.create(Object.prototype);
P.type = 'Grid';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [entity](../mixin/entity.html)
P = baseMix(P);
P = entityMix(P);


// #### Grid attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, filter___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
let defaultAttributes = {

// __columns__, __rows__ - integer Numbers representing the number of columns and rows in the Grid
    columns: 2,
    rows: 2,

// __columnGutterWidth__, __rowGutterWidth__ - float Number distances (measured in px) between tiles in the grid.
    columnGutterWidth: 1,
    rowGutterWidth: 1,

// __tileSources__ - Array of Javascript Objects
// + Each Object describes a source which can be used to fill tiles
// + Available fills include: `color`, `cellGradient`, `gridGradient`, `gridPicture`, `tilePicture`
    tileSources: null,

// __tileFill__ - Array of integer Numbers
// + Length of the Array will be `rows * columns`
// + Tiles are arranged left-to-right, top-to-bottom with tileFill[0] being the top left tile in the grid
// + Each Number represents the index of the tileSource object to be used to fill this tile
    tileFill: null,

// __gutterColor__ - can accept the following sources:
// + A valid CSS color String
// + The name-String of a Scrawl-canvas Gradient or RadialGradient object, or the object itself
// + An integer Number representing the index of a tileSource object
    gutterColor: '#808080',
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
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


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __columns__
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
D.columns = λnull;

// __rows__
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
D.rows = λnull;


// #### Tile management

// `setAllTilesTo` - change the fill for all tiles in a Grid 
// + Argument is an integer Number representing the index of a tileSource object
P.setAllTilesTo = function (val) {

    if (isa_number(val)) {

        if (!Number.isInteger(val)) val = parseInt(val, 10);

        this.tileFill.fill(val);
    }
};

// `setTilesTo` - change the fill for a (set of) tile(s) in a Grid - requires two arguments:
// + First argument is an integer Number representing the position of a tile in the tileFill Array, or an Array of such Numbers
// + Second argument is an integer Number representing the index of a tileSource object
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

// `setTileSourceTo` - update or replace a tileSource object - requires two arguments:
// + First argument is the integer Number index of the tileSource object to be replaced
// + Second argument is the new or updated object
P.setTileSourceTo = function (index, obj) {

    if (isa_number(index) && isa_obj(obj)) {

        if (obj.type && obj.source) this.tileSources[index] = obj;
    }
};

// `removeTileSource` - remove a tileSource object
// + Argument is an integer Number representing the index of a tileSource object
// + Object will be replaced with `null`
P.removeTileSource = function (index) {

    if (isa_number(index) && index) {

        this.tileSources[index] = null;

        this.tileFill = this.tileFill.map(item => item === index ? 0 : item);
    }
};

// `getTileSource` - returns the tileSource index Number for the given tile. Function is overloaded:
// + One argument: Number representing the position of a tile in the tileFill Array.
// + Two arguments: The `(row, column)` position of the tile in the Grid - both values start from `0`
P.getTileSource = function (row, col) {

    if (isa_number(row)) {

        if (!isa_number(col)) return this.tileFill[row];
        else return this.tileFill[(row * this.rows) + col];
    }
};

// `getTilesUsingSource` - returns an Array of tileFill index Numbers representing tiles that are currently using the tileSource Object at the given tileSource index.
P.getTilesUsingSource = function (key) {

    let res = [];

    if (isa_number(key)) this.tileFill.forEach((val, index) => val == key && res.push(index));

    return res;
};


// `cleanPathObject` - internal - used for entity stamping (Display cycle), and collision detection
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


// ##### Stamp methods

// `performFill` - internal stamp method helper function
// + If you are not a fan of long, complex functions ... look away now!
P.performFill = function (engine) {

    // Grab the current engine values for various things
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

    // Iterate through the grid's tileSources
    tileSources.forEach((obj, index) => {

        // Set up the engine fillStyle value (where required)
        if (obj && obj.type) {

            switch (obj.type) {

                case 'color' :

                    engine.fillStyle = obj.source;
                    break;

                case 'cellGradient' :

                    this.lockFillStyleToEntity = false;
                    engine.fillStyle = obj.source.getData(this, this.currentHost);
                    break;

                case 'gridGradient' :

                    this.lockFillStyleToEntity = true;
                    engine.fillStyle = obj.source.getData(this, this.currentHost);
                    break;
            }
        }

        // Get an map of tiles using this source
        let validTiles = tileFill.map(item => item === index ? true : false);

        if (validTiles.length) {

            switch (obj.type) {

                // Use pool canvas to compose the output
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

        // Assign (or construct) the appropriate object to gObject
        if (gColor.substring) {

            gObject = {
                type: 'color',
                source: this.gutterColor
            };
        }
        else if (isa_obj(gColor)) gObject = gColor;
        else if (isa_number(gColor) && isa_obj(tileSources[gColor])) gObject = tileSources[gColor];

        // Set the engine's strokeStyle to the appropriate value (if needed)
        switch (gObject.type) {

            case 'cellGradient' :

                this.lockFillStyleToEntity = false;
                engine.strokeStyle = gObject.source.getData(this, this.currentHost);
                break;

            case 'gridGradient' :

                this.lockFillStyleToEntity = true;
                engine.strokeStyle = gObject.source.getData(this, this.currentHost);
                break;

            case 'color' :

                engine.strokeStyle = gObject.source;
                break;
        }

        switch (gObject.type) {

            // Use pool canvas to compose the output
            // + gridPicture and tilePicture both treated the same
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

            // We have a color/gradient all set up - stroke the lines directly onto grid
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

// `fill`
P.fill = function (engine) {

    this.performFill(engine);
};

// `drawAndFill`
P.drawAndFill = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    this.performFill(engine);
};

// `fillAndDraw`
P.fillAndDraw = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    this.performFill(engine);
    engine.stroke(p);
};

// `drawThenFill`
P.drawThenFill = function (engine) {

    let p = this.pathObject;

    engine.stroke(p);
    this.performFill(engine);
};

// `fillThenDraw`
P.fillThenDraw = function (engine) {

    let p = this.pathObject;

    this.performFill(engine);
    engine.stroke(p);
};



// `checkHit` - overrides position mixin function
// + Grid entitys need to return ALL of the successful hit coordinates, not just the first
// + They also need to include the tile index(es) of where the hit(s) took place within them
//
// Returns an object with the following attributes
// ```
// {
//     x: x-coordinate of the _last_ successful hit,
//     y: y-coordinate of the _last_ successful hit,
//     tiles: Array of tile index Numbers representing each tile reporting a hit,
//     artefact: the Grid entity object
// }
// ```

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


// #### Factory
// ```
// let blueSource = {
//     type: 'color',
//     source: 'aliceblue',
// };
//
// let myGrid = scrawl.makeGrid({
//
//     name: 'test-grid',
//
//     startX: 'center',
//     startY: 'center',
//
//     handleX: 'center',
//     handleY: 'center',
//
//     width: 300,
//     height: 200,
//
//     columns: 6,
//     rows: 6,
//
//     tileSources: [blueSource, {
//         type: 'color',
//         source: 'red',
//     }],
// });
// ```
const makeGrid = function (items) {
    return new Grid(items);
};

constructors.Grid = Grid;


// #### Exports
export {
    makeGrid,
};
