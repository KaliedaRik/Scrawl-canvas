// # Grid factory
// The Grid entity is a graphical representation of __a grid with equal width columns and equal height rows__, separated by gutters. Each tile within the grid can be filled with a different color, or a different gradient, or a different Picture entity output.


// #### Imports
import { constructors, entity } from '../core/library.js';

import { doCreate, isa_number, isa_obj, mergeOver, pushUnique, xt, xta, λnull, Ωempty } from '../helper/utilities.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

import { releaseCoordinate, requestCoordinate } from '../untracked-factory/coordinate.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

// Shared constants
import { _isArray, _isFinite, _parse, BLACK, COLOR, ENTITY, FILL, SOURCE_OVER, T_GRID, WHITE } from '../helper/shared-vars.js';

// Local constants
const _isInteger = Number.isSafeInteger || Number.isInteger,
    CELL_GRADIENT = 'cellGradient',
    DESTINATION_IN = 'destination-in',
    GRAY = 'rgb(127 127 127 / 1)',
    GRID_GRADIENT = 'gridGradient',
    GRID_PICTURE = 'gridPicture',
    TILE_PICTURE = 'tilePicture',
    TOP = 'top',
    LEFT = 'left',
    CENTER = 'center',
    BOTTOM = 'bottom',
    RIGHT = 'right',
    HORIZONTAL_POSITIONS = ['left', 'center', 'right'],
    VERTICAL_POSITIONS = ['top', 'center', 'bottom'];


// #### Grid constructor
const Grid = function (items = Ωempty) {

    this.tileFill = [];
    this.tileSources = [];

    this.rowLines = null;
    this.columnLines = null;
    this.currentTileWidth = 0;
    this.currentTileHeight = 0;

    this.entityInit(items);

    if (!items.tileSources) {

        this.tileSources = [].concat([{

            type: COLOR,
            source: BLACK,
        },
        {

            type: COLOR,
            source: WHITE,
        }]);
    }

    if (!items.tileFill) {

        this.tileFill.length = this.columns * this.rows;
        this.tileFill.fill(0);
    }
    else if (_isArray(items.tileFill) && this.tileFill.length === items.tileFill.length) {

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
const P = Grid.prototype = doCreate();
P.type = T_GRID;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);


// #### Grid attributes
const defaultAttributes = {

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
    gutterColor: GRAY,

// __horizontalPivotPosition__ - the x coordinate to return to artefacts using a tile as their pivot
// + Permitted values: 'left', 'center', 'right'
    horizontalPivotPosition: LEFT,

// __verticalPivotPosition__ - the y coordinate to return to artefacts using a tile as their pivot
// + Permitted values: 'top', 'center', 'bottom'
    verticalPivotPosition: TOP,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['tileSources']);

P.finalizePacketOut = function (copy, items) {

    const cSources = copy.tileSources = [],
        tSources = this.tileSources;

    tSources.forEach(item => {

        cSources.push({
            type: item.type,
            source: (isa_obj(item.source)) ? item.source.name : item.source
        });
    });

    if (isa_obj(copy.gutterColor)) copy.gutterColor = copy.gutterColor.name;

    const stateCopy = _parse(this.state.saveAsPacket(items))[3];
    copy = mergeOver(copy, stateCopy);

    copy = this.handlePacketAnchor(copy, items);

    return copy;
};


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const S = P.setters,
    D = P.deltaSetters;

// __columns__
S.columns = function (item) {

    if (isa_number(item)) {

        if (!_isInteger(item)) item = parseInt(item, 10);

        if (item !== this.columns) {

            let i, iz, j;

            const currentFill = this.tileFill,
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
    this.dirtyFilterIdentifier = true;
};
D.columns = λnull;

// __rows__
S.rows = function (item) {

    if (isa_number(item)) {

        if (!_isInteger(item)) item = parseInt(item, 10);

        if (item !== this.rows) {

            const currentRows = this.rows;

            this.rows = item;

            this.tileFill.length = this.columns * item;

            if (currentRows < item) this.tileFill.fill(0, currentRows * this.columns);
        }
    }
    this.dirtyPathObject = true;
    this.dirtyFilterIdentifier = true;
};
D.rows = λnull;

S.horizontalPivotPosition = function (item) {

    if (item.substring) {

        item = item.toLowerCase();

        if (HORIZONTAL_POSITIONS.includes(item)) this.horizontalPivotPosition = item;
    }
};

S.verticalPivotPosition = function (item) {

    if (item.substring) {

        item = item.toLowerCase();

        if (VERTICAL_POSITIONS.includes(item)) this.verticalPivotPosition = item;
    }
};


// #### Tile management

// `setAllTilesTo` - change the fill for all tiles in a Grid
// + Argument is an integer Number representing the index of a tileSource object
P.setAllTilesTo = function (val) {

    if (isa_number(val)) {

        if (!_isInteger(val)) val = parseInt(val, 10);

        this.tileFill.fill(val);
        this.dirtyFilterIdentifier = true;
    }
    return this;
};

// `setTileFill` - update the tileFill array
// + The array supplied as an argument must be the same length as current rows * columns
P.setTileFill = function (item) {

    const { columns, rows } = this;

    if (_isArray(item) && item.length === columns * rows) {

        this.tileFill = item;
        this.dirtyFilterIdentifier = true;
    }
    return this;
};

// `setTilesTo` - change the fill for a (set of) tile(s) in a Grid - requires two arguments:
// + First argument is an integer Number representing the position of a tile in the tileFill Array, or an Array of such Numbers
// + Second argument is an integer Number representing the index of a tileSource object
P.setTilesTo = function (tiles, val) {

    const tileFill = this.tileFill;

    if (xt(tiles) && isa_number(val)) {

        if (!_isInteger(val)) val = parseInt(val, 10);

        if (isa_number(tiles)) tileFill[tiles] = val;
        else if (_isArray(tiles)) {

            tiles.forEach(tile => {

                if (isa_number(tile)) tileFill[tile] = val;
            });
        }
        this.dirtyFilterIdentifier = true;
    }
    return this;
};

// `setTileSourceTo` - update or replace a tileSource object - requires two arguments:
// + First argument is the integer Number index of the tileSource object to be replaced
// + Second argument is the new or updated object
P.setTileSourceTo = function (index, obj) {

    if (isa_number(index) && isa_obj(obj)) {

        if (obj.type && obj.source) this.tileSources[index] = obj;
    }
    return this;
};

// `removeTileSource` - remove a tileSource object
// + Argument is an integer Number representing the index of a tileSource object
// + Object will be replaced with `null`
P.removeTileSource = function (index) {

    if (_isFinite(index)) {

        this.tileSources[index] = null;

        this.tileFill = this.tileFill.map(item => item === index ? 0 : item);
    }
    return this;
};

// `getTileSource` - returns the tileSource index Number for the given tile. Function is overloaded:
// + One argument: Number representing the position of a tile in the tileFill Array.
// + Two arguments: The `(row, column)` position of the tile in the Grid - both values start from `0`
P.getTileSource = function (row, col) {

    if (isa_number(row)) {

        if (!isa_number(col)) return this.tileFill[row];
        else return this.tileFill[(row * this.columns) + col];
    }
};

// `getTilesUsingSource` - returns an Array of tileFill index Numbers representing tiles that are currently using the tileSource Object at the given tileSource index.
P.getTilesUsingSource = function (key) {

    const res = [];

    if (isa_number(key)) this.tileFill.forEach((val, index) => val === key && res.push(index));

    return res;
};


// #### Convenience helpers

// `tileIndexFromPosition` - returns the tileFill index for a (row, col) pair
P.tileIndexFromPosition = function (row, col) {

    if (_isFinite(row) && _isFinite(col) && row >= 0 && col >= 0) {

        const rows = this.rows,
            cols = this.columns;

        row = (row | 0);
        col = (col | 0);

        if (row < rows && col < cols) return (row * cols) + col;
    }

    // On failure return -1
    return -1;
};

// `positionIndices` - returns [row, col] for a tileFill index
P.positionIndices = function (index) {

    if (_isFinite(index) && index >= 0) {

        const rows = this.rows,
            cols = this.columns;

        index = (index | 0);

        if (cols > 0 && index < rows * cols) return [~~(index / cols), index % cols];
    }

    // On failure return an empty array
    return [];
};

// `rowIndex` - returns row for a tileFill index
P.rowIndex = function (index) {

    if (_isFinite(index) && index >= 0) {

        const rows = this.rows,
            cols = this.columns;

        index = (index | 0);

        if (cols > 0 && index < rows * cols) return ~~(index / cols);
    }

    // On failure return -1
    return -1;
};

// `columnIndex` - returns column for a tileFill index
P.columnIndex = function (index) {

    if (_isFinite(index) && index >= 0) {

        const rows = this.rows,
            cols = this.columns;

        index = (index | 0);

        if (cols > 0 && index < rows * cols) return index % cols;
    }

    // On failure return -1
    return -1;
};

// `fillRow` - paint an entire row
// + Argument object: { row, index }
P.fillRow = function (items = Ωempty) {

    let { row, index } = items;

    if (_isFinite(row) && _isFinite(index) && row >= 0 && index >= 0) {

        const cols = this.columns,
            rows = this.rows;

        row = (row | 0);
        index = (index | 0);

        if (cols > 0 && rows > 0 && row < rows) {

            const start = row * cols,
                fill = this.tileFill;

            for (let c = 0; c < cols; c++) {

                fill[start + c] = index;
            }

            this.dirtyFilterIdentifier = true;
        }
    }
    return this;
};

// `fillColumn` - paint an entire column
// + Argument object: { column, index }
P.fillColumn = function (items = Ωempty) {

    let { column, index } = items;

    if (_isFinite(column) && _isFinite(index) && column >= 0 && index >= 0) {

        const cols = this.columns,
            rows = this.rows;

        column = (column | 0);
        index = (index | 0);

        if (cols > 0 && rows > 0 && column < cols) {

            const fill = this.tileFill;

            for (let r = 0; r < rows; r++) {

                fill[(r * cols) + column] = index;
            }

            this.dirtyFilterIdentifier = true;
        }
    }
    return this;
};

// `fillRect` - paint a rectangular region (inclusive)
// + Argument object: { rowStart, columnStart, rowEnd, columnEnd, index }
P.fillRect = function (items = Ωempty) {

    let { rowStart, columnStart, rowEnd, columnEnd, index } = items;

    if (_isFinite(rowStart) && _isFinite(rowEnd) && _isFinite(columnStart) && _isFinite(columnEnd) && _isFinite(index)) {

        // normalize bounds
        rowStart = (rowStart | 0);
        rowEnd = (rowEnd | 0);
        columnStart = (columnStart | 0);
        columnEnd = (columnEnd | 0);
        index = (index | 0);

        if (rowStart > rowEnd) [rowStart, rowEnd] = [rowEnd, rowStart];
        if (columnStart > columnEnd) [columnStart, columnEnd] = [columnEnd, columnStart];

        const cols = this.columns,
            rows = this.rows;

        if (
            rowStart >= 0 && rowStart < rows &&
            rowEnd >= 0 && rowEnd < rows &&
            columnStart >= 0 && columnStart < cols &&
            columnEnd >= 0 && columnEnd < cols &&
            index >= 0
        ) {

            const fill = this.tileFill;

            let r, c, base;

            for (r = rowStart; r <= rowEnd; r++) {

                base = r * cols;

                for (c = columnStart; c <= columnEnd; c++) {

                    fill[base + c] = index;
                }
            }

            this.dirtyFilterIdentifier = true;
        }
    }
    return this;
};


// #### Internal helpers

// `cleanPathObject` - internal - used for entity stamping (Display cycle), and collision detection
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        const p = this.pathObject = new Path2D(),
            rowLines = new Path2D(),
            colLines = new Path2D();

        const handle = this.currentStampHandlePosition,
            scale = this.currentScale,
            dims = this.currentDimensions;

        const x = -handle[0] * scale,
            y = -handle[1] * scale,
            w = dims[0] * scale,
            h = dims[1] * scale;

        p.rect(x, y, w, h);

        const cols = this.columns,
            rows = this.rows,
            colWidth = w / cols,
            rowHeight = h / rows,
            paths = this.tilePaths,
            real = this.tileRealCoordinates,
            virtual = this.tileVirtualCoordinates;

        let i, j, cx, cy;

        rowLines.moveTo(x, y);
        rowLines.lineTo(x + w, y);

        for (i = 1; i <= rows; i++) {

            const ry = y + (i * rowHeight);

            rowLines.moveTo(x, ry);
            rowLines.lineTo(x + w, ry);
        }
        this.rowLines = rowLines;

        colLines.moveTo(x, y);
        colLines.lineTo(x, y + h);

        for (j = 1; j <= cols; j++) {

            cx = x + (j * colWidth);

            colLines.moveTo(cx, y);
            colLines.lineTo(cx, y + h);
        }
        this.columnLines = colLines;

        paths.length = 0;
        real.length = 0;
        virtual.length = 0;

        for (i = 0; i < rows; i++) {

            for (j = 0; j < cols; j++) {

                const path = new Path2D();

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

P.getTilePivotCoordsAt = function (index) {

    if (_isFinite(index) && index >= 0) {

        const tiles = this.tileRealCoordinates;

        if (index < tiles.length) {

            const start = this.currentStampPosition,
                offset = [...tiles[index]],
                angle = this.currentRotation,
                horizontalPivotPosition = this.horizontalPivotPosition,
                verticalPivotPosition = this.verticalPivotPosition,
                width = this.currentTileWidth,
                height = this.currentTileHeight;

            if (horizontalPivotPosition === RIGHT) offset[0] += width;
            else if (horizontalPivotPosition === CENTER) offset[0] += width / 2;

            if (verticalPivotPosition === BOTTOM) offset[1] += height;
            else if (verticalPivotPosition === CENTER) offset[1] += height / 2;

            if (this.flipReverse) offset[0] = -offset[0];
            if (this.flipUpend) offset[1] = -offset[1];

            const coord = requestCoordinate();
            coord.setFromArray(offset).rotate(angle).add(start);

            const res = [...coord];

            releaseCoordinate(coord);

            return res;
        }
    }

    return [...this.currentStampPosition];
};


// ##### Stamp methods

// `performFill` - internal stamp method helper function
// + If you are not a fan of long, complex functions ... look away now!
P.performFill = function (engine) {

    const currentScale = this.currentScale || 0;

    if (currentScale > 0) {

        // Grab the current engine values for various things
        engine.save();

        const composer = requestCell(),
            compEngine = composer.engine,
            compCanvas = composer.element;

        const tileSources = this.tileSources,
            tileFill = this.tileFill,
            tilePaths = this.tilePaths,
            tileRealCoords = this.tileRealCoordinates,
            tileVirtualCoords = this.tileVirtualCoordinates,
            winding = this.winding,
            tileWidth = this.currentTileWidth,
            tileHeight = this.currentTileHeight;

        const dims = this.currentDimensions;

        let currentPicture;

        // Iterate through the grid's tileSources
        tileSources.forEach((obj, index) => {

            // Set up the engine fillStyle value (where required)
            if (obj && obj.type) {

                switch (obj.type) {

                    case COLOR :

                        engine.fillStyle = obj.source;
                        break;

                    case CELL_GRADIENT :

                        this.lockFillStyleToEntity = false;
                        engine.fillStyle = obj.source.getData(this, this.currentHost);
                        break;

                    case GRID_GRADIENT :

                        this.lockFillStyleToEntity = true;
                        engine.fillStyle = obj.source.getData(this, this.currentHost);
                        break;
                }
            }

            // Get an map of tiles using this source
            const validTiles = tileFill.map(item => item === index ? true : false);

            if (validTiles.length) {

                switch (obj.type) {

                    // Use pool canvases to compose the output
                    case GRID_PICTURE : {

                        currentPicture = (obj.source.substring) ? entity[obj.source] : obj.source;

                        if (currentPicture.simpleStamp) {

                            const W = dims[0] * currentScale,
                                H = dims[1] * currentScale;

                            compCanvas.width = W;
                            compCanvas.height = H;
                            compEngine.globalCompositeOperation = SOURCE_OVER;

                            currentPicture.simpleStamp(composer, {
                            startX: 0,
                                startY: 0,
                                width: W,
                                height: H,
                                method: FILL,
                            });

                            const masker = requestCell(),
                                mEngine = masker.engine,
                                mCanvas = masker.element;

                            mCanvas.width = W;
                            mCanvas.height = H;

                            mEngine.fillStyle = WHITE;

                            let use, ux, uy;

                            for (let i = 0, iz = validTiles.length; i < iz; i++) {

                                use = validTiles[i];

                                if (use) {

                                    [ux, uy] = tileVirtualCoords[i];

                                    mEngine.fillRect(ux, uy, tileWidth, tileHeight);
                                }
                            }

                            compEngine.globalCompositeOperation = DESTINATION_IN;
                            compEngine.drawImage(mCanvas, 0, 0);

                            engine.drawImage(compCanvas, ~~tileRealCoords[0][0], ~~tileRealCoords[0][1]);

                            releaseCell(masker);
                        }
                        break;
                    }

                    case TILE_PICTURE :

                        currentPicture = (obj.source.substring) ? entity[obj.source] : obj.source;

                        if (currentPicture.simpleStamp) {

                            compCanvas.width = tileWidth;
                            compCanvas.height = tileHeight;
                            compEngine.globalCompositeOperation = SOURCE_OVER;

                            currentPicture.simpleStamp(composer, {
                                startX: 0,
                                startY: 0,
                                width: tileWidth,
                                height: tileHeight,
                                method: FILL,
                            });

                            validTiles.forEach((tile, pos) => tile && engine.drawImage(compCanvas, ~~tileRealCoords[pos][0], ~~tileRealCoords[pos][1]));
                        }
                        break;

                    default :

                        validTiles.forEach((tile, pos) => tile && engine.fill(tilePaths[pos], winding));
                }
            }
        });

        const gColor = this.gutterColor,
            gRow = this.rowGutterWidth,
            gCol = this.columnGutterWidth;

        let gObject;

        if(xt(gColor)) {

            // Assign (or construct) the appropriate object to gObject
            if (gColor.substring) {

                gObject = {
                    type: COLOR,
                    source: this.gutterColor
                };
            }
            else if (isa_obj(gColor)) gObject = gColor;
            else if (isa_number(gColor) && isa_obj(tileSources[gColor])) gObject = tileSources[gColor];

            // Set the engine's strokeStyle to the appropriate value (if needed)
            switch (gObject.type) {

                case CELL_GRADIENT :

                    this.lockFillStyleToEntity = false;
                    engine.strokeStyle = gObject.source.getData(this, this.currentHost);
                    break;

                case GRID_GRADIENT :

                    this.lockFillStyleToEntity = true;
                    engine.strokeStyle = gObject.source.getData(this, this.currentHost);
                    break;

                case COLOR :

                    engine.strokeStyle = gObject.source;
                    break;
            }

            switch (gObject.type) {

                // Use pool canvas to compose the output
                // + gridPicture and tilePicture both treated the same
                case GRID_PICTURE :
                case TILE_PICTURE : {

                    if (gRow || gCol) {

                        currentPicture = (gObject.source.substring) ? entity[gObject.source] : gObject.source;

                        if (currentPicture.simpleStamp) {

                            const handle = this.currentStampHandlePosition,
                                x = handle[0] * currentScale,
                                y = handle[1] * currentScale,
                                W = dims[0] * currentScale,
                                H = dims[1] * currentScale;

                            compCanvas.width = W;
                            compCanvas.height = H;
                            compEngine.globalCompositeOperation = SOURCE_OVER;

                            currentPicture.simpleStamp(composer, {
                                startX: 0,
                                startY: 0,
                                width: W,
                                height: H,
                                method: FILL,
                            });

                            const masker = requestCell(),
                                mEngine = masker.engine,
                                mCanvas = masker.element;

                            mCanvas.width = W;
                            mCanvas.height = H;

                            mEngine.translate(x, y);
                            mEngine.strokeStyle = WHITE;

                            if (gRow) {

                                mEngine.lineWidth = gRow;
                                mEngine.stroke(this.rowLines);
                            }
                            if (gCol) {

                                mEngine.lineWidth = gCol;
                                mEngine.stroke(this.columnLines);
                            }

                            compEngine.globalCompositeOperation = DESTINATION_IN;
                            compEngine.drawImage(mCanvas, 0, 0);

                            engine.drawImage(compCanvas, ~~tileRealCoords[0][0], ~~tileRealCoords[0][1]);

                            releaseCell(masker);
                        }
                    }
                    break;
                }
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
    }
};

// `fill`
P.fill = function (engine) {

    this.performFill(engine);
};

// `drawAndFill`
P.drawAndFill = function (engine) {

    const p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    this.performFill(engine);
};

// `fillAndDraw`
P.fillAndDraw = function (engine) {

    const p = this.pathObject;

    engine.stroke(p);
    this.currentHost.clearShadow();
    this.performFill(engine);
    engine.stroke(p);
};

// `drawThenFill`
P.drawThenFill = function (engine) {

    const p = this.pathObject;

    engine.stroke(p);
    this.performFill(engine);
};

// `fillThenDraw`
P.fillThenDraw = function (engine) {

    const p = this.pathObject;

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
P.checkHit = function (items = []) {

    if (this.noUserInteraction) return false;

    if (!this.pathObject || this.dirtyPathObject) {

        this.cleanPathObject();
    }

    const tests = (!_isArray(items)) ?  [items] : items;

    const mycell = requestCell(),
        engine = mycell.engine,
        stamp = this.currentStampPosition,
        x = stamp[0],
        y = stamp[1],
        tiles = new Set(),
        tilePaths = this.tilePaths;

    let isGood, tx, ty;

    const getCoords = (coords) => {

        let x, y;

        if (_isArray(coords)) {

            x = coords[0];
            y = coords[1];
        }
        else if (xta(coords, coords.x, coords.y)) {

            x = coords.x;
            y = coords.y;
        }
        else return [false];

        if (!_isFinite(x) || !_isFinite(y)) return [false];

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
        });

        releaseCell(mycell);

        return {
            x: tx,
            y: ty,
            tiles: [...tiles],
            artefact: this
        };
    }

    releaseCell(mycell);
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
export const makeGrid = function (items) {

    if (!items) return false;
    return new Grid(items);
};

constructors.Grid = Grid;
