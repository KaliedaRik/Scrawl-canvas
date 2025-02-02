// # Demo Canvas 065
// Star entity attributes and functionality

// [Run code](../../demo/filters-065.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


const myStar = scrawl.makeStar({
    name: name('my-star'),
    start: ['center', 'center'],
    handle: ['center', 'center'],

    radius1: 150,
    radius2: 100,
    points: 5,

    fillStyle: 'beige',
    strokeStyle: 'darkred',
    lineWidth: 6,
    lineJoin: 'round',
    method: 'fillThenDraw',
});

scrawl.makeWheel({
    name: name('pin'),
    radius: 5,
    fillStyle: 'red',
    pivot: name('my-star'),
    lockTo: 'pivot',
    handle: ['center', 'center'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const {
        roll,
        scale,
        radius1,
        radius2,
        points,
        twist,
        start,
        handle,
        offset,
    } = myStar;

    const {
        lineWidth,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur
/** @ts-expect-error */
    } = myStar.state;

    return `    Radius - 1: ${radius1}, 2: ${radius2}
    Points - ${points}, Twist - ${twist}
    Start - [${start}]; Handle - [${handle}]; Offset - [${offset}]
    Roll: ${roll}; Scale: ${scale}; lineWidth: ${lineWidth}
    Shadow - offsetX: ${shadowOffsetX}; offsetY: ${shadowOffsetY}; blur: ${shadowBlur}; `;
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

    target: myStar,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        radius1_absolute: ['radius1', 'round'],
        radius1_relative: ['radius1', '%'],
        radius2_absolute: ['radius2', 'round'],
        radius2_relative: ['radius2', '%'],
        points: ['points', 'round'],
        twist: ['twist', 'round'],

        handle_xAbsolute: ['handleX', 'round'],
        handle_xPercent: ['handleX', '%'],
        handle_xString: ['handleX', 'raw'],
        handle_yAbsolute: ['handleY', 'round'],
        handle_yPercent: ['handleY', '%'],
        handle_yString: ['handleY', 'raw'],
        lineJoin: ['lineJoin', 'raw'],
        lineWidth: ['lineWidth', 'round'],
        method: ['method', 'raw'],
        offset_xAbsolute: ['offsetX', 'round'],
        offset_xPercent: ['offsetX', '%'],
        offset_yAbsolute: ['offsetY', 'round'],
        offset_yPercent: ['offsetY', '%'],
        reverse: ['flipReverse', 'boolean'],
        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
        scaleOutline: ['scaleOutline', 'boolean'],
        scaleShadow: ['scaleShadow', 'boolean'],
        shadowBlur: ['shadowBlur', 'round'],
        shadowOffsetX: ['shadowOffsetX', 'round'],
        shadowOffsetY: ['shadowOffsetY', 'round'],
        showBoundingBox: ['showBoundingBox', 'boolean'],
        start_xAbsolute: ['startX', 'round'],
        start_xPercent: ['startX', '%'],
        start_xString: ['startX', 'raw'],
        start_yAbsolute: ['startY', 'round'],
        start_yPercent: ['startY', '%'],
        start_yString: ['startY', 'raw'],
        upend: ['flipUpend', 'boolean'],
        winding: ['winding', 'raw'],
    },
});


// Setup form
initializeDomInputs([
    ['input', 'radius1_absolute', '150'],
    ['input', 'radius1_relative', '37.5'],
    ['input', 'radius2_absolute', '100'],
    ['input', 'radius2_relative', '25'],
    ['input', 'points', '5'],
    ['input', 'twist', '0'],

    ['input', 'handle_xAbsolute', '150'],
    ['input', 'handle_xPercent', '50'],
    ['input', 'handle_yAbsolute', '100'],
    ['input', 'handle_yPercent', '50'],
    ['input', 'lineWidth', '6'],
    ['input', 'offset_xAbsolute', '0'],
    ['input', 'offset_xPercent', '0'],
    ['input', 'offset_yAbsolute', '0'],
    ['input', 'offset_yPercent', '0'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'shadowBlur', '0'],
    ['input', 'shadowOffsetX', '0'],
    ['input', 'shadowOffsetY', '0'],
    ['input', 'start_xAbsolute', '300'],
    ['input', 'start_xPercent', '50'],
    ['input', 'start_yAbsolute', '200'],
    ['input', 'start_yPercent', '50'],
    ['select', 'handle_xString', 1],
    ['select', 'handle_yString', 1],
    ['select', 'lineJoin', 1],
    ['select', 'method', 4],
    ['select', 'reverse', 0],
    ['select', 'scaleOutline', 1],
    ['select', 'scaleShadow', 0],
    ['select', 'showBoundingBox', 0],
    ['select', 'start_xString', 1],
    ['select', 'start_yString', 1],
    ['select', 'upend', 0],
    ['select', 'winding', 0],
]);

// #### Development and testing
console.log(scrawl.library);
