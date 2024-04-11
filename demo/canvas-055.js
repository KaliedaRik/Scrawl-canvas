// # Demo Canvas 055
// Crescent entity functionality

// [Run code](../../demo/canvas-055.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


const myMoon = scrawl.makeCrescent({
    name: name('my-crescent'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    outerRadius: 150,
    innerRadius: 100,
    displacement: 80,

    fillStyle: 'orange',
    strokeStyle: 'darkslategray',
    lineWidth: 4,
    lineJoin: 'round',
    method: 'fillThenDraw',
});

scrawl.makeWheel({
    name: name('pin'),
    radius: 5,
    fillStyle: 'red',
    pivot: name('my-crescent'),
    lockTo: 'pivot',
    handle: ['center', 'center'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const [startX, startY] = myMoon.start;
    const [handleX, handleY] = myMoon.handle;

    const {roll, scale, outerRadius, innerRadius, displacement} = myMoon;

    return `    Start - x: ${startX}, y: ${startY}
    Handle - x: ${handleX}, y: ${handleY}
    Radius - outer: ${outerRadius}, inner: ${innerRadius}, displacement: ${displacement}
    Roll: ${roll}; Scale: ${scale}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

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
initializeDomInputs([
    ['input', 'displacement', '80'],
    ['input', 'handle_xAbsolute', '150'],
    ['input', 'handle_xPercent', '50'],
    ['input', 'handle_yAbsolute', '100'],
    ['input', 'handle_yPercent', '50'],
    ['input', 'innerRadius', '100'],
    ['input', 'outerRadius', '150'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'start_xAbsolute', '300'],
    ['input', 'start_xPercent', '50'],
    ['input', 'start_yAbsolute', '200'],
    ['input', 'start_yPercent', '50'],
    ['select', 'displayIntersect', 0],
    ['select', 'handle_xString', 1],
    ['select', 'handle_yString', 1],
    ['select', 'reverse', 0],
    ['select', 'start_xString', 1],
    ['select', 'start_yString', 1],
    ['select', 'upend', 0],
]);


// #### Development and testing
console.log(scrawl.library);
