// # Demo Canvas 022 
// Grid entity - basic functionality (color, gradients)

// [Run code](../../demo/canvas-022.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.artefact.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create gradients
const cellGradient = scrawl.makeGradient({
    name: name('blue-green'),
    endX: '100%',
    colors: [
        [0, 'blue'],
        [500, 'gold'],
        [999, 'green']
    ],
    colorSpace: 'OKLAB',
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
    canvas.here - x: ${here.x.toFixed(0)}, y: ${here.y.toFixed(0)}; ${hitReport}`;
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
scrawl.observeAndUpdate({

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
// @ts-expect-error
document.querySelector('#columns').value = 6;
// @ts-expect-error
document.querySelector('#rows').value = 6;
// @ts-expect-error
document.querySelector('#columnGutter').value = 1;
// @ts-expect-error
document.querySelector('#rowGutter').value = 1;
// @ts-expect-error
document.querySelector('#relativeWidth').value = 50;
// @ts-expect-error
document.querySelector('#absoluteWidth').value = 300;
// @ts-expect-error
document.querySelector('#relativeHeight').value = 50;
// @ts-expect-error
document.querySelector('#absoluteHeight').value = 200;
// @ts-expect-error
document.querySelector('#baseFill').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#highlightFill').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#gridStroke').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#start_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_xAbsolute').value = 300;
// @ts-expect-error
document.querySelector('#start_yAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#handle_xAbsolute').value = 150;
// @ts-expect-error
document.querySelector('#handle_yAbsolute').value = 100;
// @ts-expect-error
document.querySelector('#start_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#start_yString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_yString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#offset_xPercent').value = 0;
// @ts-expect-error
document.querySelector('#offset_yPercent').value = 0;
// @ts-expect-error
document.querySelector('#offset_xAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#offset_yAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#upend').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#reverse').options.selectedIndex = 0;


// #### Development and testing
// TODO: need to develop a test for killing and resurrecting the Grid entity
console.log(scrawl.library);
