// # Demo Snippets 002
// Scrawl-canvas stack element snippets

// [Run code](../../demo/snippets-002.html)


// Import Scrawl-canvas
import scrawl from '../source/scrawl.js'

// Import and apply snippet code to DOM elements
import greenBox from './snippets/green-box-snippet.js';
let boxElements = document.querySelectorAll('.green-box');
boxElements.forEach(el => greenBox(el));


// #### Scene setup
// Create some useful variables for use elsewhere in the script
let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    element = artefact.myelement;


// Give the stack element some depth
stack.set({
    perspectiveZ: 1200
});


// Setup the main element
element.set({
    startX: 250,
    startY: 250,
    handleX: 125,
    handleY: 125,
    width: 250,
    height: 250,
    roll: 10,
    pitch: 20,
    yaw: 30
});


// #### Scene animation

// Function to check whether mouse cursor is over stack, and lock the element artefact accordingly
let stackCheck = function () {

    let active = false;

    return function () {

        if (stack.here.active !== active) {

            active = stack.here.active;

            element.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();


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
lock to: «${element.lockTo}»; width: ${element.get('width')}; height: ${element.get('height')}
start: [${element.start}]; handle: [${element.handle}]
scale: ${element.get('scale')}; roll: ${element.get('roll')}°; pitch: ${element.get('pitch')}°; yaw: ${element.get('yaw')}°`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: stack,
    commence: stackCheck,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: element,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        dims_widthPercent: ['width', '%'],
        dims_widthAbsolute: ['width', 'round'],

        dims_heightPercent: ['height', '%'],
        dims_heightAbsolute: ['height', 'round'],

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
        pitch: ['pitch', 'float'],
        yaw: ['yaw', 'float'],
        scale: ['scale', 'float'],
    },
});

// Housekeeping - set the DOM input values to their starting values on each page reload
document.querySelector('#dims_widthPercent').value = 50;
document.querySelector('#dims_heightPercent').value = 50;
document.querySelector('#dims_widthAbsolute').value = 250;
document.querySelector('#dims_heightAbsolute').value = 250;
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 250;
document.querySelector('#start_yAbsolute').value = 250;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#handle_xAbsolute').value = 125;
document.querySelector('#handle_yAbsolute').value = 125;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 10;
document.querySelector('#pitch').value = 20;
document.querySelector('#yaw').value = 30;
document.querySelector('#scale').value = 1;


// #### Development and testing
console.log(scrawl.library);
