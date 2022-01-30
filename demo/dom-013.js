// # Demo DOM 013
// Track mouse movements over a 3d rotated and scaled canvas element

// [Run code](../../demo/dom-013.html)

import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


const stack = scrawl.library.stack.mystack,
    canvas = scrawl.library.canvas.mycanvas;

stack.set({
    perspectiveZ: 1200,
    css: {
        backgroundColor: 'slategray',
    },
});

canvas.set({
    start: ['center', 'center'],
    handle: ['center', 'center'],
    backgroundColor: 'beige',

    trackHere: 'local',
});

const ball = scrawl.makeWheel({

    name: 'red-ball',
    group: canvas.base.name,

    start: ['center', 'center'],
    handle: ['center', 'center'],

    radius: 40,
    lineWidth: 8,
    fillStyle: 'red',
    strokeStyle: 'orange',
    method: 'fillThenDraw',

})

const offset = ball.clone({

    name: 'offset-ball',
    radius: 12,
    lineWidth: 3,
    fillStyle: 'blue',
    strokeStyle: 'green',
});

const checkCanvasIsActive = function () {

    const here = canvas.here;

    let isActive = false;

    return function () {

        // We only want this function to run in the canvas render animation, though it will be called by both the canvas and stack renders
        if (this.target.name == 'mycanvas') {

            if (here.active != isActive) {

                isActive = here.active;

                ball.set({
                    lockTo: (isActive) ? 'mouse' : 'start',
                });
            }
        }
    }
}();


// #### Scene animation
let clientX = 0,
    clientY = 0,
    movementX = 0,
    movementY = 0,
    offsetX = 0,
    offsetY = 0,
    pageX = 0,
    pageY = 0,
    screenX= 0,
    screenY = 0;

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
            startX: offsetX,
            startY: offsetY,
        });
    }

}, canvas.domElement);


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const here = canvas.here;
    const basehere = canvas.base.here;

    return `    client: ${clientX}, ${clientY}
    offset: ${offsetX}, ${offsetY}
    page: ${pageX}, ${pageY}
    screen: ${screenX}, ${screenY}
    movement: ${movementX}, ${movementY}

    canvas here x/y: ${here.x}, ${here.y}; dims: ${here.w}, ${here.h}; original dims: ${here.originalWidth}, ${here.originalHeight}; active: ${here.active}
    base here x/y: ${basehere.x}, ${basehere.y}; dims: ${basehere.w}, ${basehere.h}; active: ${basehere.active}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: [stack, canvas],

    commence: checkCanvasIsActive,
    afterShow: report,
});


// #### User interaction
// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener(['touchmove'], (e) => {

    e.preventDefault();
    e.returnValue = false;

}, [stack.domElement, canvas.domElement]);

// Setup form observer functionality
scrawl.observeAndUpdate({

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

// Setup form
// @ts-expect-error
document.querySelector('#width').value = 400;
// @ts-expect-error
document.querySelector('#height').value = 400;
// @ts-expect-error
document.querySelector('#start_xAbsolute').value = 300;
// @ts-expect-error
document.querySelector('#start_yAbsolute').value = 300;
// @ts-expect-error
document.querySelector('#handle_xAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#handle_yAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#offset_xAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#offset_yAbsolute').value = 0;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#pitch').value = 0;
// @ts-expect-error
document.querySelector('#yaw').value = 0;
// @ts-expect-error
document.querySelector('#scale').value = 1;

console.log(scrawl.library);