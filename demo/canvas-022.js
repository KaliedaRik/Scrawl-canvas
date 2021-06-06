// # Demo Canvas 022 
// Grid entity - basic functionality (color, gradients)

// [Run code](../../demo/canvas-022.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'gray',
    css: {
        border: '1px solid black'
    }
});

// Create gradients
let cellGradient = scrawl.makeGradient({
    name: 'blue-green',
    endX: '100%',
})
.updateColor(0, 'blue')
.updateColor(500, 'gold')
.updateColor(999, 'green');

let gridGradient = scrawl.makeGradient({
    name: 'red-blue',
    endX: '100%',
    endY: '100%',
})
.updateColor(0, 'red')
.updateColor(500, 'gold')
.updateColor(999, 'lightblue');


// Define Grid `tileSource` Array objects
let blueSource = {
    type: 'color',
    source: 'aliceblue',
};

let redSource = {
    type: 'color',
    source: 'red',
};

let cellGradientSource = {
    type: 'cellGradient',
    source: cellGradient,
};

let gridGradientSource = {
    type: 'gridGradient',
    source: gridGradient,
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

    tileSources: [blueSource, redSource]
});


// #### User interaction
// Function to check for mouse position hits over the Grid entity, and adapt it accordingly
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


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Grid - columns: ${myGrid.columns.toFixed(0)}; rows: ${myGrid.rows.toFixed(0)}
    Grid dimensions - width: ${myGrid.dimensions[0]}; height: ${myGrid.dimensions[1]}
    Grid gutter widths - column: ${myGrid.columnGutterWidth.toFixed(0)}; row: ${myGrid.rowGutterWidth.toFixed(0)}
    Start - x: ${myGrid.start[0]}, y: ${myGrid.start[1]}
    Handle - x: ${myGrid.handle[0]}, y: ${myGrid.handle[1]}
    Offset - x: ${myGrid.offset[0]}, y: ${myGrid.offset[1]}
    Roll: ${myGrid.roll}; Scale: ${myGrid.scale}
    canvas.here - x: ${canvas.here.x.toFixed(0)}, y: ${canvas.here.y.toFixed(0)}; ${hitReport}`;
    };
}();

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
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

let updateBaseFill = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

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

let updateHighlightFill = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

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


// #### Development and testing
console.log(scrawl.library);
