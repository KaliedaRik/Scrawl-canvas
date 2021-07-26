// # Demo Canvas 055 
// Crescent entity functionality

// [Run code](../../demo/canvas-055.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

const myMoon = scrawl.makeCrescent({
    name: 'my-crescent',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    outerRadius: 150,
    innerRadius: 100,
    displacement: 40,

    fillStyle: 'orange',
    strokeStyle: 'darkslategray',
    lineWidth: 4,
    lineJoin: 'round',
    method: 'fillThenDraw',
});

scrawl.makeWheel({
    name: 'pin',
    radius: 5,
    fillStyle: 'red',
    pivot: 'my-crescent',
    lockTo: 'pivot',
    handle: ['center', 'center'],
});


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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myMoon,

    useNativeListener: true,
    preventDefault: true,

    updates: {

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

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],

        outerRadius: ['outerRadius', 'round'],
        innerRadius: ['innerRadius', 'round'],
        displacement: ['displacement', 'round'],
        displayIntersect: ['displayIntersect', 'boolean'],
    },
});

// Setup form
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
document.querySelector('#outerRadius').value = 150;
document.querySelector('#innerRadius').value = 100;
document.querySelector('#displacement').value = 40;
document.querySelector('#displayIntersect').options.selectedIndex = 0;

// #### Development and testing
console.log(scrawl.library);
