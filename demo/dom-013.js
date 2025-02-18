// # Demo DOM 013
// Track mouse movements over a 3d rotated and scaled canvas element

// [Run code](../../demo/dom-013.html)

import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


const stack = scrawl.findStack('mystack'),
    canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Give the stack element some depth
stack.set({
    perspectiveZ: 1200,
    css: {
        backgroundColor: 'slategray',
    },
});


// Setup the canvas within the stack
canvas.set({
    start: ['center', 'center'],
    handle: ['center', 'center'],
    trackHere: 'local',
    offsetZ: 150,
    pitch: 10,
    yaw: 15,
});


const ball = scrawl.makeWheel({

    name: name('red-ball'),
    group: canvas.get('baseGroup'),

    start: ['center', 'center'],
    handle: ['center', 'center'],

    radius: 40,
    lineWidth: 8,
    fillStyle: 'red',
    strokeStyle: 'orange',
    method: 'fillThenDraw',

})

const offset = ball.clone({

    name: name('offset-ball'),
    radius: 12,
    lineWidth: 3,
    fillStyle: 'blue',
    strokeStyle: 'green',
});


const checkCanvasIsActive = function () {

    ball.set({ lockTo: (canvas.here.active) ? 'mouse' : 'start' });
};


// #### Scene animation
let clientX = '0',
    clientY = '0',
    movementX = '0',
    movementY = '0',
    offsetX = '0',
    offsetY = '0',
    pageX = '0',
    pageY = '0',
    screenX= '0',
    screenY = '0';

scrawl.addListener('move', (e) => {

    if (e.type !== 'touchmove') {


        clientX = e.clientX.toFixed(0);
        clientY = e.clientY.toFixed(0);
        movementX = e.movementX.toFixed(0);
        movementY = e.movementY.toFixed(0);
        offsetX = e.offsetX.toFixed(0);
        offsetY = e.offsetY.toFixed(0);
        pageX = e.pageX.toFixed(0);
        pageY = e.pageY.toFixed(0);
        screenX= e.screenX.toFixed(0);
        screenY = e.screenY.toFixed(0);

        offset.set({
            startX: parseFloat(offsetX),
            startY: parseFloat(offsetY),
        });
    }

}, canvas.domElement);


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const here = canvas.here;
    const basehere = canvas.base.here;

    return `
    client: ${clientX}, ${clientY}
    offset: ${offsetX}, ${offsetY}
    page: ${pageX}, ${pageY}
    screen: ${screenX}, ${screenY}
    movement: ${movementX}, ${movementY}

canvas here:
    x/y: ${here.x}, ${here.y}
    dims: ${here.w}, ${here.h}
    original dims: ${here.originalWidth}, ${here.originalHeight}
    active: ${here.active}

base here:
    x/y: ${basehere.x}, ${basehere.y}
    dims: ${basehere.w}, ${basehere.h}
    active: ${basehere.active}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('stack-animation'),
    target: stack,
});

scrawl.makeRender({

    name: name('canvas-animation'),
    target: canvas,
    commence: checkCanvasIsActive,
});

scrawl.makeRender({

    name: name('reporting'),
    noTarget: true,
    afterShow: report,
});


// #### User interaction
// Housekeeping - set the DOM input values to their starting values on each page reload
initializeDomInputs([
    ['input', 'width', '400'],
    ['input', 'height', '400'],
    ['input', 'start_xAbsolute', '300'],
    ['input', 'start_yAbsolute', '300'],
    ['input', 'handle_xAbsolute', '200'],
    ['input', 'handle_yAbsolute', '200'],
    ['input', 'offset_xAbsolute', '0'],
    ['input', 'offset_yAbsolute', '0'],
    ['input', 'roll', '0'],
    ['input', 'pitch', '10'],
    ['input', 'yaw', '15'],
    ['input', 'scale', '1'],
]);


// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener(['touchmove'], (e) => {

    e.preventDefault();
    e.returnValue = false;

}, [stack.domElement, canvas.domElement]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        width: ['width', 'round'],
        height: ['height', 'round'],

        start_xAbsolute: ['startX', 'round'],
        start_yAbsolute: ['startY', 'round'],

        handle_xAbsolute: ['handleX', 'round'],
        handle_yAbsolute: ['handleY', 'round'],

        offset_xAbsolute: ['offsetX', 'round'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        pitch: ['pitch', 'float'],
        yaw: ['yaw', 'float'],
        scale: ['scale', 'float'],
    },
});


// #### Development and testing
console.log(scrawl.library);
