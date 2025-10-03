// # Demo Canvas 022
// Grid entity - basic functionality (color, gradients)

// [Run code](../../demo/canvas-022.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create gradients
const cellGradient = scrawl.makeGradient({
    name: name('blue-green'),
    endX: '100%',
    colorSpace: 'OKLAB',
    colors: [
        [0, 'blue'],
        [500, 'gold'],
        [999, 'green']
    ],
});

const gridGradient = scrawl.makeGradient({
    name: name('red-blue'),
    endX: '100%',
    endY: '100%',
    colors: [
        [0, 'red'],
        [500, 'gold'],
        [999, 'lightblue']
    ],
    colorSpace: 'OKLAB',
});


// Define Grid `tileSource` Array objects
const blueSource = {
    type: 'color',
    source: 'aliceblue',
};

const redSource = {
    type: 'color',
    source: 'red',
};

const cellGradientSource = {
    type: 'cellGradient',
    source: cellGradient,
};

const gridGradientSource = {
    type: 'gridGradient',
    source: gridGradient,
};


// Create the Grid entity
const myGrid = scrawl.makeGrid({

    name: name('test-grid'),

    startX: 'center',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    width: 300,
    height: 200,

    columns: 6,
    rows: 6,

    tileSources: [blueSource, redSource]
});


// #### User interaction
// Function to check for mouse position hits over the Grid entity, and adapt it accordingly
let hitReport = '';
const checkHitTiles = () => {

    const hits = myGrid.checkHit(canvas.here);

    myGrid.setAllTilesTo(0);

    if (typeof hits !== 'boolean' && hits) {

        myGrid.setTilesTo(hits.tiles, 1);
        hitReport = `Hits - x: ${hits.x}, y: ${hits.y}, tiles: ${hits.tiles.join(', ')}`;
    }
    else hitReport = 'Hits - none reported';
};

// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const [startX, startY] = myGrid.start;
    const [handleX, handleY] = myGrid.handle;
    const [offsetX, offsetY] = myGrid.offset;
    const [width, height] = myGrid.dimensions;

    const here = canvas.here;

    const {roll, scale, columns, rows, columnGutterWidth, rowGutterWidth} = myGrid;

    return `    Grid - columns: ${columns.toFixed(0)}; rows: ${rows.toFixed(0)}
    Grid dimensions - width: ${width}; height: ${height}
    Grid gutter widths - column: ${columnGutterWidth.toFixed(0)}; row: ${rowGutterWidth.toFixed(0)}
    Start - x: ${startX}, y: ${startY}
    Handle - x: ${handleX}, y: ${handleY}
    Offset - x: ${offsetX}, y: ${offsetY}
    Roll: ${roll}; Scale: ${scale}
    canvas.here - x: ${here.x}, y: ${here.y}; ${hitReport}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: checkHitTiles,
    afterShow: report,
});


// #### More user interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myGrid,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        columns: ['columns', 'round'],
        rows: ['rows', 'round'],

        relativeWidth: ['width', '%'],
        absoluteWidth: ['width', 'round'],

        relativeHeight: ['height', '%'],
        absoluteHeight: ['height', 'round'],

        columnGutter: ['columnGutterWidth', 'float'],
        rowGutter: ['rowGutterWidth', 'float'],

        start_xPercent: ['startX', '%'],
        start_xAbsolute: ['startX', 'round'],
        start_xString: ['startX', 'raw'],

        start_yPercent: ['startY', '%'],
        start_yAbsolute: ['startY', 'round'],
        start_yString: ['startY', 'raw'],

        handle_xPercent: ['handleX', '%'],
        handle_xAbsolute: ['handleX', 'round'],
        handle_xString: ['handleX', 'raw'],

        handle_yPercent: ['handleY', '%'],
        handle_yAbsolute: ['handleY', 'round'],
        handle_yString: ['handleY', 'raw'],

        offset_xPercent: ['offsetX', '%'],
        offset_xAbsolute: ['offsetX', 'round'],

        offset_yPercent: ['offsetY', '%'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
    },
});

const updateBaseFill = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    switch (val) {

        case 'blueSource' :
            myGrid.setTileSourceTo(0, blueSource);
            break;

        case 'redSource' :
            myGrid.setTileSourceTo(0, redSource);
            break;

        case 'cellGradientSource' :
            myGrid.setTileSourceTo(0, cellGradientSource);
            break;

        case 'gridGradientSource' :
            myGrid.setTileSourceTo(0, gridGradientSource);
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], updateBaseFill, '#baseFill');

const updateHighlightFill = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    switch (val) {

        case 'blueSource' :
            myGrid.setTileSourceTo(1, blueSource);
            break;

        case 'redSource' :
            myGrid.setTileSourceTo(1, redSource);
            break;

        case 'cellGradientSource' :
            myGrid.setTileSourceTo(1, cellGradientSource);
            break;

        case 'gridGradientSource' :
            myGrid.setTileSourceTo(1, gridGradientSource);
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], updateHighlightFill, '#highlightFill');

const updateGridStroke = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    switch (val) {

        case 'base' :
            myGrid.set({
                gutterColor: 0
            });
            break;

        case 'highlight' :
            myGrid.set({
                gutterColor: 1
            });
            break;

        case 'blueSource' :
            myGrid.set({
                gutterColor: blueSource
            });
            break;

        case 'redSource' :
            myGrid.set({
                gutterColor: redSource
            });
            break;

        case 'cellGradientSource' :
            myGrid.set({
                gutterColor: cellGradientSource
            });
            break;

        case 'gridGradientSource' :
            myGrid.set({
                gutterColor: gridGradientSource
            });
            break;

        default :
            myGrid.set({
                gutterColor: '#808080'
            });
    }
    console.log(myGrid.saveAsPacket());
};
scrawl.addNativeListener(['input', 'change'], updateGridStroke, '#gridStroke');


// Setup form
scrawl.initializeDomInputs([
    ['input', 'absoluteHeight', '200'],
    ['input', 'absoluteWidth', '300'],
    ['input', 'columnGutter', '1'],
    ['input', 'columns', '6'],
    ['input', 'handle_xAbsolute', '150'],
    ['input', 'handle_xPercent', '50'],
    ['input', 'handle_yAbsolute', '100'],
    ['input', 'handle_yPercent', '50'],
    ['input', 'offset_xAbsolute', '0'],
    ['input', 'offset_xPercent', '0'],
    ['input', 'offset_yAbsolute', '0'],
    ['input', 'offset_yPercent', '0'],
    ['input', 'relativeHeight', '50'],
    ['input', 'relativeWidth', '50'],
    ['input', 'roll', '0'],
    ['input', 'rows', '6'],
    ['input', 'scale', '1'],
    ['input', 'start_xAbsolute', '300'],
    ['input', 'start_xPercent', '50'],
    ['input', 'start_yAbsolute', '200'],
    ['input', 'start_yPercent', '50'],
    ['select', 'baseFill', 0],
    ['select', 'gridStroke', 0],
    ['select', 'handle_xString', 1],
    ['select', 'handle_yString', 1],
    ['select', 'highlightFill', 1],
    ['select', 'reverse', 0],
    ['select', 'start_xString', 1],
    ['select', 'start_yString', 1],
    ['select', 'upend', 0],
]);


// #### Development and testing
// TODO: need to develop a test for killing and resurrecting the Grid entity
console.log(scrawl.library);
