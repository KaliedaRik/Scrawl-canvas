// # Demo DOM 002
// Element mouse, pivot and mimic functionality

// [Run code](../../demo/dom-002.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Create some useful variables for use elsewhere in the script
const artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    element = artefact.myelement,
    mimic = artefact.mymimic,
    pivot = artefact.mypivot;


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


// Setup the mimic element
mimic.set({
    width: 20,
    height: 20,
    offsetX: 60,

    roll: 15,
    pitch: 15,
    yaw: 15,

    mimic: 'myelement',
    lockTo: 'mimic',

    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicHandle: true,
    useMimicOffset: true,
    useMimicRotation: true,
    useMimicFlip: false,

    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: false,
    addOwnOffsetToMimic: true,
    addOwnRotationToMimic: false,
});


// Setup the pivot element
pivot.set({
    pivot: 'myelement',
    lockTo: 'pivot',
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
const report = reportSpeed('#reportmessage', function () {

    const [width, height] = element.dimensions;
    const [startX, startY] = element.start;
    const [handleX, handleY] = element.handle;

    const lockTo = element.lockTo.join(', ');

    const {roll, pitch, yaw, scale} = element;

    return `    lock to: «${lockTo}»
    dimensions - width: ${width}, height: ${height}
    start - x: ${startX}, y: ${startY}
    handle - x: ${handleX}, y: ${handleY}
    scale: ${scale}
    roll: ${roll}°, pitch: ${pitch}°, yaw: ${yaw}°`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: stack,
    commence: stackCheck,
    afterShow: report,
});


// #### User interaction
// For this demo we will suppress touchmove functionality over the canvas; we also need to disable Android magnification gesture - this is done in CSS with `touch-action: none;` - note: dragging issue does not affect Demo DOM-008
scrawl.addNativeListener(['touchmove'], (e) => {

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

// `target` doesn't have to be a Scrawl-canvas object. We can use the object's name, though we also have to tell the function where the object lives in the Scrawl-canvas library (usually this will be 'artefact')
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: 'mypivot',
    targetLibrarySection: 'artefact',

    useNativeListener: true,
    preventDefault: true,

    updates: {

        pivot_handle: ['addPivotHandle', 'boolean'],
        pivot_rotation: ['addPivotRotation', 'boolean'],
    },
});

// Using the Scrawl-canvas listener functions directly, in this case because we want to update more than one attribute in a single set action, which the makeUpdater function cannot do (because: too much of an edge case to handle)
const events = (e) => {

    e.preventDefault();
    e.returnValue = false;

    switch (e.target.id) {

        case 'mimic_dims':
            mimic.set({
                width: parseFloat(e.target.value),
                height: parseFloat(e.target.value),
            });
            break;

        case 'mimic_rotation':
            mimic.set({
                addOwnRotationToMimic: (e.target.value === '1') ? true : false,
            });
            break;
    }
};
scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


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
// @ts-expect-error
document.querySelector('#pivot_handle').value = 0;
// @ts-expect-error
document.querySelector('#pivot_rotation').value = 0;
// @ts-expect-error
document.querySelector('#mimic_dims').value = 10;
// @ts-expect-error
document.querySelector('#mimic_rotation').value = 0;


// #### Development and testing
console.log(scrawl.library);
