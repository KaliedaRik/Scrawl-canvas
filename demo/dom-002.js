// # Demo DOM 002
// Element mouse, pivot and mimic functionality

// [Run code](../../demo/dom-002.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const stack = scrawl.findStack('mystack');


// Namespacing boilerplate
const namespace = stack.name;
const name = (n) => `${namespace}-${n}`;


// Give the stack element some depth
stack.set({
    perspectiveZ: 1200,
    css: {
        overflow: 'hidden',
    },
});


// Setup the main element
const element = scrawl.findElement('myelement');
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
const mimic = scrawl.findElement('mymimic');
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
    order: 1,
});


// Setup the pivot element
const pivot = scrawl.findElement('mypivot');
pivot.set({
    pivot: 'myelement',
    lockTo: 'pivot',
    order: 1,
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

/** @ts-expect-error */
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

    name: name('animation'),
    target: stack,
    commence: stackCheck,
    afterShow: report,
});


// #### User interaction
// Housekeeping - set the DOM input values to their starting values on each page reload
initializeDomInputs([
    ['input', 'dims_widthPercent', '50'],
    ['input', 'dims_heightPercent', '50'],
    ['input', 'dims_widthAbsolute', '250'],
    ['input', 'dims_heightAbsolute', '250'],
    ['input', 'start_xPercent', '50'],
    ['input', 'start_yPercent', '50'],
    ['input', 'start_xAbsolute', '250'],
    ['input', 'start_yAbsolute', '250'],
    ['input', 'handle_xPercent', '50'],
    ['input', 'handle_yPercent', '50'],
    ['input', 'handle_xAbsolute', '125'],
    ['input', 'handle_yAbsolute', '125'],
    ['input', 'roll', '10'],
    ['input', 'pitch', '20'],
    ['input', 'yaw', '30'],
    ['input', 'scale', '1'],
    ['input', 'mimic_dims', '10'],
    ['select', 'start_xString', 1],
    ['select', 'start_yString', 1],
    ['select', 'handle_xString', 1],
    ['select', 'handle_yString', 1],
    ['select', 'pivot_handle', 0],
    ['select', 'pivot_rotation', 0],
    ['select', 'mimic_rotation', 0],
]);


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


// #### Development and testing
console.log(scrawl.library);
