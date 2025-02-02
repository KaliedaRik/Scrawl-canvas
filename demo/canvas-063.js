// # Demo Canvas 063
// Rectangle entity attributes and functionality

// [Run code](../../demo/filters-063.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


const myRectangle = scrawl.makeRectangle({
    name: name('my-rectangle'),
    start: ['center', 'center'],
    handle: ['center', 'center'],

    rectangleWidth: 300,
    rectangleHeight: 300,

    fillStyle: 'cornflowerblue',
    strokeStyle: 'darkblue',
    lineWidth: 4,
    lineJoin: 'round',
    method: 'fillThenDraw',
});

scrawl.makeWheel({
    name: name('pin'),
    radius: 5,
    fillStyle: 'red',
    pivot: name('my-rectangle'),
    lockTo: 'pivot',
    handle: ['center', 'center'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const {
        roll,
        scale,
        rectangleHeight,
        rectangleWidth,
        radiusBLX,
        radiusBLY,
        radiusBRX,
        radiusBRY,
        radiusTLX,
        radiusTLY,
        radiusTRX,
        radiusTRY,
        offshootA,
        offshootB,
        start,
        handle,
        offset,
    } = myRectangle;

    const {
        lineWidth,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur
/** @ts-expect-error */
    } = myRectangle.state;

    return `    Dimensions - rectangleWidth: ${rectangleWidth}, rectangleHeight: ${rectangleHeight}
    Radius X - TLX: ${radiusTLX}, TRX: ${radiusTRX}, BRX: ${radiusBRX}, BLX: ${radiusBLX}
    Radius Y - TLY: ${radiusTLY}, TRY: ${radiusTRY}, BRY: ${radiusBRY}, BLY: ${radiusBLY}
    Offshoots: offshootA: ${offshootA}, offshootB: ${offshootB}
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

    target: myRectangle,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        rectangleWidth_absolute: ['rectangleWidth', 'round'],
        rectangleHeight_absolute: ['rectangleHeight', 'round'],
        rectangleWidth_relative: ['rectangleWidth', '%'],
        rectangleHeight_relative: ['rectangleHeight', '%'],
        offshootA: ['offshootA', 'float'],
        offshootB: ['offshootB', 'float'],

        radius_absolute: ['radius', 'round'],
        radius_relative: ['radius', '%'],
        radiusX_absolute: ['radiusX', 'round'],
        radiusX_relative: ['radiusX', '%'],
        radiusY_absolute: ['radiusY', 'round'],
        radiusY_relative: ['radiusY', '%'],
        radiusT_absolute: ['radiusT', 'round'],
        radiusT_relative: ['radiusT', '%'],
        radiusR_absolute: ['radiusR', 'round'],
        radiusR_relative: ['radiusR', '%'],
        radiusB_absolute: ['radiusB', 'round'],
        radiusB_relative: ['radiusB', '%'],
        radiusL_absolute: ['radiusL', 'round'],
        radiusL_relative: ['radiusL', '%'],
        radiusTX_absolute: ['radiusTX', 'round'],
        radiusTX_relative: ['radiusTX', '%'],
        radiusTY_absolute: ['radiusTY', 'round'],
        radiusTY_relative: ['radiusTY', '%'],
        radiusRX_absolute: ['radiusRX', 'round'],
        radiusRX_relative: ['radiusRX', '%'],
        radiusRY_absolute: ['radiusRY', 'round'],
        radiusRY_relative: ['radiusRY', '%'],
        radiusBX_absolute: ['radiusBX', 'round'],
        radiusBX_relative: ['radiusBX', '%'],
        radiusBY_absolute: ['radiusBY', 'round'],
        radiusBY_relative: ['radiusBY', '%'],
        radiusLX_absolute: ['radiusLX', 'round'],
        radiusLX_relative: ['radiusLX', '%'],
        radiusLY_absolute: ['radiusLY', 'round'],
        radiusLY_relative: ['radiusLY', '%'],
        radiusTLX_absolute: ['radiusTLX', 'round'],
        radiusTLX_relative: ['radiusTLX', '%'],
        radiusTLY_absolute: ['radiusTLY', 'round'],
        radiusTLY_relative: ['radiusTLY', '%'],
        radiusTRX_absolute: ['radiusTRX', 'round'],
        radiusTRX_relative: ['radiusTRX', '%'],
        radiusTRY_absolute: ['radiusTRY', 'round'],
        radiusTRY_relative: ['radiusTRY', '%'],
        radiusBRX_absolute: ['radiusBRX', 'round'],
        radiusBRX_relative: ['radiusBRX', '%'],
        radiusBRY_absolute: ['radiusBRY', 'round'],
        radiusBRY_relative: ['radiusBRY', '%'],
        radiusBLX_absolute: ['radiusBLX', 'round'],
        radiusBLX_relative: ['radiusBLX', '%'],
        radiusBLY_absolute: ['radiusBLY', 'round'],
        radiusBLY_relative: ['radiusBLY', '%'],

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


// Setup form
initializeDomInputs([
    ['input', 'rectangleWidth_absolute', '300'],
    ['input', 'rectangleHeight_absolute', '300'],
    ['input', 'rectangleWidth_relative', '75'],
    ['input', 'rectangleHeight_relative', '75'],
    ['input', 'offshootA', '0.55'],
    ['input', 'offshootB', '0'],

    ['input', 'radius_absolute', '0'],
    ['input', 'radius_relative', '0'],
    ['input', 'radiusX_absolute', '0'],
    ['input', 'radiusX_relative', '0'],
    ['input', 'radiusY_absolute', '0'],
    ['input', 'radiusY_relative', '0'],
    ['input', 'radiusT_absolute', '0'],
    ['input', 'radiusT_relative', '0'],
    ['input', 'radiusR_absolute', '0'],
    ['input', 'radiusR_relative', '0'],
    ['input', 'radiusB_absolute', '0'],
    ['input', 'radiusB_relative', '0'],
    ['input', 'radiusL_absolute', '0'],
    ['input', 'radiusL_relative', '0'],
    ['input', 'radiusTX_absolute', '0'],
    ['input', 'radiusTX_relative', '0'],
    ['input', 'radiusTY_absolute', '0'],
    ['input', 'radiusTY_relative', '0'],
    ['input', 'radiusRX_absolute', '0'],
    ['input', 'radiusRX_relative', '0'],
    ['input', 'radiusRY_absolute', '0'],
    ['input', 'radiusRY_relative', '0'],
    ['input', 'radiusBX_absolute', '0'],
    ['input', 'radiusBX_relative', '0'],
    ['input', 'radiusBY_absolute', '0'],
    ['input', 'radiusBY_relative', '0'],
    ['input', 'radiusLX_absolute', '0'],
    ['input', 'radiusLX_relative', '0'],
    ['input', 'radiusLY_absolute', '0'],
    ['input', 'radiusLY_relative', '0'],
    ['input', 'radiusTLX_absolute', '0'],
    ['input', 'radiusTLX_relative', '0'],
    ['input', 'radiusTLY_absolute', '0'],
    ['input', 'radiusTLY_relative', '0'],
    ['input', 'radiusTRX_absolute', '0'],
    ['input', 'radiusTRX_relative', '0'],
    ['input', 'radiusTRY_absolute', '0'],
    ['input', 'radiusTRY_relative', '0'],
    ['input', 'radiusBRX_absolute', '0'],
    ['input', 'radiusBRX_relative', '0'],
    ['input', 'radiusBRY_absolute', '0'],
    ['input', 'radiusBRY_relative', '0'],
    ['input', 'radiusBLX_absolute', '0'],
    ['input', 'radiusBLX_relative', '0'],
    ['input', 'radiusBLY_absolute', '0'],
    ['input', 'radiusBLY_relative', '0'],

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
    ['select', 'method', 4],
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
