// # Demo Canvas 068
// LineSpiral entity attributes and functionality

// [Run code](../../demo/canvas-068.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


const mySpiral = scrawl.makeLineSpiral({

    name: name('my-spiral'),

    start: ['center', 'center'],
    handle: ['center', 'center'],

    fillStyle: 'thistle',
    strokeStyle: 'slateblue',
    lineWidth: 2,

    angleIncrement: 72,
    radiusIncrement: 5,
    stepLimit: 50,

    method: 'fillAndDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const {
        roll,
        scale,
        startRadius,
        radiusIncrement,
        radiusIncrementAdjust,
        startAngle,
        angleIncrement,
        angleIncrementAdjust,
        start,
        handle,
        offset,
    } = mySpiral;

    const {
        lineWidth,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur
/** @ts-expect-error */
    } = mySpiral.state;

    return `    Radius - startRadius: ${startRadius}, radiusIncrement: ${radiusIncrement}, radiusIncrementAdjust: ${radiusIncrementAdjust}
    Angle - startAngle: ${startAngle}, angleIncrement: ${angleIncrement}, angleIncrementAdjust: ${angleIncrementAdjust}
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

    target: mySpiral,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        startRadius: ['startRadius', 'float'],
        radiusIncrement: ['radiusIncrement', 'float'],
        radiusIncrementAdjust: ['radiusIncrementAdjust', 'float'],
        startAngle: ['startAngle', 'float'],
        angleIncrement: ['angleIncrement', 'float'],
        angleIncrementAdjust: ['angleIncrementAdjust', 'float'],
        stepLimit: ['stepLimit', 'float'],

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

// Set the DOM input values
const dom = initializeDomInputs([
    ['input', 'startRadius', '0'],
    ['input', 'radiusIncrement', '5'],
    ['input', 'radiusIncrementAdjust', '1'],
    ['input', 'startAngle', '0'],
    ['input', 'angleIncrement', '72'],
    ['input', 'angleIncrementAdjust', '1'],
    ['input', 'stepLimit', '50'],

    ['input', 'handle_xAbsolute', '150'],
    ['input', 'handle_xPercent', '50'],
    ['input', 'handle_yAbsolute', '100'],
    ['input', 'handle_yPercent', '50'],
    ['input', 'lineWidth', '2'],
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
    ['select', 'method', 2],
    ['select', 'reverse', 0],
    ['select', 'scaleOutline', 1],
    ['select', 'showBoundingBox', 0],
    ['select', 'start_xString', 1],
    ['select', 'start_yString', 1],
    ['select', 'upend', 0],
    ['select', 'winding', 0],
]);


// #### Development and testing
console.log(scrawl.library);
