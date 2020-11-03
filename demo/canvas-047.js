// # Demo Canvas 047 
// Filter parameters: pixelate

// [Run code](../../demo/canvas-047.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'pixelate',
    method: 'pixelate',

    tileWidth: 10,
    tileHeight: 10,
    offsetX: 0,
    offsetY: 0,
});


// Create the target entity
scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['pixelate'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let tile_width = document.querySelector('#tile_width'),
        tile_height = document.querySelector('#tile_height'),
        offset_x = document.querySelector('#offset_x'),
        offset_y = document.querySelector('#offset_y');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Tile dimensions - width: ${tile_width.value} height: ${tile_height.value}
    Offset - x: ${offset_x.value} y: ${offset_y.value}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        tile_width: ['tileWidth', 'round'],
        tile_height: ['tileHeight', 'round'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
    },
});

// Setup form
document.querySelector('#tile_width').value = 10;
document.querySelector('#tile_height').value = 10;
document.querySelector('#offset_x').value = 0;
document.querySelector('#offset_y').value = 0;


// #### Development and testing
console.log(scrawl.library);
