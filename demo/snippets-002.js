// # Demo Snippets 002
// Scrawl-canvas stack element snippets
//
// Related files:
// + [Green box snippet](./snippets/green-box-snippet.html)
//
// [Run code](../../demo/snippets-002.html)


// Import the Scrawl-canvas object
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../source/scrawl.js'

// Import and apply snippet code to DOM elements
import greenBox from './snippets/green-box-snippet.js';
const boxElements = document.querySelectorAll('.green-box');
boxElements.forEach(el => greenBox(scrawl, el));


// #### Scene setup
// Create some useful variables for use elsewhere in the script
const artefact = scrawl.library.artefact,
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
const stackCheck = function () {

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
const report = function () {

    let testTicker = Date.now(),
        testTime, testNow;

    const testMessage = document.querySelector('#reportmessage');

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
// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, stack.domElement);

// Setup form observer functionality
scrawl.makeUpdater({

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
// @ts-expect-error
document.querySelector('#dims_widthPercent').value = 50;
// @ts-expect-error
document.querySelector('#dims_heightPercent').value = 50;
// @ts-expect-error
document.querySelector('#dims_widthAbsolute').value = 250;
// @ts-expect-error
document.querySelector('#dims_heightAbsolute').value = 250;
// @ts-expect-error
document.querySelector('#start_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_xAbsolute').value = 250;
// @ts-expect-error
document.querySelector('#start_yAbsolute').value = 250;
// @ts-expect-error
document.querySelector('#start_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#start_yString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_xAbsolute').value = 125;
// @ts-expect-error
document.querySelector('#handle_yAbsolute').value = 125;
// @ts-expect-error
document.querySelector('#handle_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_yString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#roll').value = 10;
// @ts-expect-error
document.querySelector('#pitch').value = 20;
// @ts-expect-error
document.querySelector('#yaw').value = 30;
// @ts-expect-error
document.querySelector('#scale').value = 1;


// #### Development and testing
console.log(scrawl.library);
