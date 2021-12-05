// # Demo Canvas 023 
// Grid entity - using picture-based assets (image, video, sprite)

// [Run code](../../demo/canvas-023.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

// Import assets
scrawl.importDomVideo('.myvideo');
scrawl.importDomImage('.flowers');
scrawl.importSprite('img/cat-sprite.png');

canvas.set({
    backgroundColor: 'aliceblue',
    css: {
        border: '1px solid black'
    }
});

// Create the picture entitys
scrawl.makePicture({

    name: 'myFlower',
    asset: 'iris',

    visibility: false,
    method: 'fill',

    width: '100%',
    height: '100%',

    copyWidth: 200,
    copyHeight: 200,
    copyStartX: 100,
    copyStartY: 100,
});

let viddyOne = scrawl.makePicture({

    name: 'first-video',
    asset: 'waves',

    width: '100%',
    height: '100%',

    visibility: false,
    method: 'fill',

    copyWidth: 200,
    copyHeight: 200,
    copyStartX: 100,
    copyStartY: 100,
});

scrawl.makePicture({

    name: 'walking-cat',
    asset: 'cat-sprite',
    spriteTrack: 'walk',
    spriteFrameDuration: 100,

    width: '100%',
    height: '100%',

    visibility: false,
    method: 'fill',

}).playSprite();

// Assign pictures to `gridSource` objects
let imageGrid = {
    type: 'gridPicture',
    source: 'myFlower',
};

let imageTile = {
    type: 'tilePicture',
    source: 'myFlower',
};

let videoGrid = {
    type: 'gridPicture',
    source: 'first-video',
};

let videoTile = {
    type: 'tilePicture',
    source: 'first-video',
};

let spriteGrid = {
    type: 'gridPicture',
    source: 'walking-cat',
};

let spriteTile = {
    type: 'tilePicture',
    source: 'walking-cat',
};

// Create the Grid entity
let myGrid = scrawl.makeGrid({

    name: 'test-grid',

    startX: 'center',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    width: 300,
    height: 200,

    columns: 6,
    rows: 6,

    tileSources: [imageGrid, imageTile]
});


// #### Scene animation
// Function to track mouse movement across the Grid
// + if the pointer is over a Grid tile, it will show the Grid's highlight fill (tile source 1)
// + other Grid tiles will show the Grid's base fill (tile source 0)
let hitReport = '';
let checkHitTiles = () => {

    let hits = myGrid.checkHit(canvas.here);

    myGrid.setAllTilesTo(0);

    if (hits) {

        myGrid.setTilesTo(hits.tiles, 1);
        hitReport = `Hits - x: ${hits.x}, y: ${hits.y}, tiles: ${hits.tiles.join(', ')}`;
    }
    else hitReport = 'Hits - none reported';
};


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let [startX, startY] = myGrid.start;
    let [handleX, handleY] = myGrid.handle;
    let [offsetX, offsetY] = myGrid.offset;
    let [width, height] = myGrid.dimensions;

    let here = canvas.here;

    let {roll, scale, columns, rows, columnGutterWidth, rowGutterWidth} = myGrid;

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

    name: 'demo-animation',
    target: canvas,
    commence: checkHitTiles,
    afterShow: report,
});


// #### User interaction
// Observer functionality for manipulating the Grid entity's attributes
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

// Event listeners for setting Grid tile fills
let updateBaseFill = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    switch (val) {

        case 'imageGrid' :
            myGrid.setTileSourceTo(0, imageGrid);
            break;

        case 'imageTile' :
            myGrid.setTileSourceTo(0, imageTile);
            break;

        case 'videoGrid' :
            myGrid.setTileSourceTo(0, videoGrid);
            break;

        case 'videoTile' :
            myGrid.setTileSourceTo(0, videoTile);
            break;

        case 'spriteGrid' :
            myGrid.setTileSourceTo(0, spriteGrid);
            break;

        case 'spriteTile' :
            myGrid.setTileSourceTo(0, spriteTile);
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], updateBaseFill, '#baseFill');


let updateHighlightFill = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    switch (val) {

        case 'imageGrid' :
            myGrid.setTileSourceTo(1, imageGrid);
            break;

        case 'imageTile' :
            myGrid.setTileSourceTo(1, imageTile);
            break;

        case 'videoGrid' :
            myGrid.setTileSourceTo(1, videoGrid);
            break;

        case 'videoTile' :
            myGrid.setTileSourceTo(1, videoTile);
            break;

        case 'spriteGrid' :
            myGrid.setTileSourceTo(1, spriteGrid);
            break;

        case 'spriteTile' :
            myGrid.setTileSourceTo(1, spriteTile);
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], updateHighlightFill, '#highlightFill');


// Event listener for setting Grid gutter fills
let updateGridStroke = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

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

        case 'imageGrid' :
            myGrid.set({
                gutterColor: imageGrid
            });
            break;

        case 'imageTile' :
            myGrid.set({
                gutterColor: imageTile
            });
            break;

        case 'videoGrid' :
            myGrid.set({
                gutterColor: videoGrid
            });
            break;

        case 'videoTile' :
            myGrid.set({
                gutterColor: videoTile
            });
            break;

        case 'spriteGrid' :
            myGrid.set({
                gutterColor: spriteGrid
            });
            break;

        case 'spriteTile' :
            myGrid.set({
                gutterColor: spriteTile
            });
            break;

        default :
            myGrid.set({
                gutterColor: '#808080'
            });
    }
};
scrawl.addNativeListener(['input', 'change'], updateGridStroke, '#gridStroke');


// Event listener for clicks on the &lt;canvas> element
// + Because many browsers/devices will not allow video to be played until a user interacts with it in some way
scrawl.addListener(['move', 'up'], function () {

    viddyOne.set({
        video_muted: true,
        video_loop: true,
    }).videoPlay();
}, canvas.domElement);

// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);


// Setup form
document.querySelector('#columns').value = 6;
document.querySelector('#rows').value = 6;
document.querySelector('#columnGutter').value = 1;
document.querySelector('#rowGutter').value = 1;
document.querySelector('#relativeWidth').value = 50;
document.querySelector('#absoluteWidth').value = 300;
document.querySelector('#relativeHeight').value = 50;
document.querySelector('#absoluteHeight').value = 200;
document.querySelector('#baseFill').options.selectedIndex = 0;
document.querySelector('#highlightFill').options.selectedIndex = 1;
document.querySelector('#gridStroke').options.selectedIndex = 0;
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 150;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#offset_xPercent').value = 0;
document.querySelector('#offset_yPercent').value = 0;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
