// # Demo Filters 016 
// Filter blend operation

// [Run code](../../demo/filters-016.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    compileOrder: 1,
});

// Create the assets
scrawl.importDomImage('.flowers');

canvas.buildCell({

    name: 'star-cell',
    dimensions: [400, 400],
    shown: false,
});

scrawl.makeStar({

    name: 'my-star',
    group: 'star-cell',

    radius1: 200,
    radius2: 100,

    roll: 60,

    points: 4,

    start: ['center', 'center'],
    handle: ['center', 'center'],

    fillStyle: 'blue',
    strokeStyle: 'red',
    lineWidth: 10,
    method: 'fillThenDraw',
});

canvas.buildCell({

    name: 'wheel-cell',
    dimensions: [400, 400],
    shown: false,
});

scrawl.makeWheel({

    name: 'my-wheel',
    group: 'wheel-cell',

    radius: 150,

    startAngle: 30,
    endAngle: -30,
    includeCenter: true,

    start: ['center', 'center'],
    handle: ['center', 'center'],

    fillStyle: 'green',
    strokeStyle: 'yellow',
    lineWidth: 10,
    method: 'fillThenDraw',

    delta: {
        roll: -0.3,
    },
});


// Create the filters
scrawl.makeFilter({

    name: 'star-filter',
    method: 'image',

    asset: 'star-cell',

    width: 400,
    height: 400,

    copyWidth: 400,
    copyHeight: 400,

    lineOut: 'star',

}).clone({

    name: 'wheel-filter',
    asset: 'wheel-cell',
    lineOut: 'wheel',
});

scrawl.makeFilter({

    name: 'flower-filter',
    method: 'image',

    asset: 'iris',

    width: 200,
    height: 200,
    
    copyX: '25%',
    copyY: 100,
    copyWidth: '50%',
    copyHeight: 200,

    lineOut: 'flower',
});

let composeFilter = scrawl.makeFilter({

    name: 'block-filter',
    method: 'blend',

    lineIn: 'source',
    lineMix: 'star',

    offsetX: 30,
    offsetY: 30,

    compose: 'normal',
});

// Display the filter in a Block entity

scrawl.makeGradient({
    name: 'linear',
    endX: '100%',
    colors: [
        [0, 'blue'],
        [495, 'red'],
        [500, 'yellow'],
        [505, 'red'],
        [999, 'green']
    ],
});

scrawl.makeBlock({

    name: 'display-block',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: ['90%', '90%'],
    roll: -20,

    lineWidth: 10,
    fillStyle: 'linear',
    lockFillStyleToEntity: true,
    strokeStyle: 'coral',
    method: 'fillThenDraw',

    // Load in the three image filters, then the compose filter to combine two of them
    // + the results display in a Block entity!
    filters: ['star-filter', 'wheel-filter', 'flower-filter', 'block-filter'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let ox = document.querySelector('#offset-x'),
        oy = document.querySelector('#offset-y'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Offset - x: ${ox.value}, y: ${oy.value}
    Opacity: ${opacity.value}`;
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

    target: composeFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        source: ['lineIn', 'raw'],
        destination: ['lineMix', 'raw'],
        blend: ['blend', 'raw'],
        opacity: ['opacity', 'float'],
        'offset-x': ['offsetX', 'round'],
        'offset-y': ['offsetY', 'round'],
    },
});

// Setup form
document.querySelector('#source').options.selectedIndex = 0;
document.querySelector('#destination').options.selectedIndex = 2;
document.querySelector('#blend').options.selectedIndex = 0;
document.querySelector('#opacity').value = 1;
document.querySelector('#offset-x').value = 30;
document.querySelector('#offset-y').value = 30;


// #### Development and testing
console.log(scrawl.library);
