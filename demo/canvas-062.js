// # Demo Canvas 062
// Tetragon and Oval entity attributes and functionality

// [Run code](../../demo/filters-062.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// #### Scene setup
const ovalCanvas = scrawl.findCanvas('oval-canvas');
const ovalNamespace = ovalCanvas.name;
const oName = (n) => `${ovalNamespace}-${n}`;

scrawl.importDomImage('.mypatterns');

scrawl.makeGradient({

    name: oName('stroke-gradient'),
    endX: '33%',
    spread: 'reflect',
    operations: [{
        operation: 'add-noise',
        stage: 'after-spread',
        parameters: {
            noise: 'bluenoise',
            strength: 0.08,
        },
    }],

}).clone({

    name: oName('fill-gradient'),
    endX: '33%',
    spread: 'repeat',
    operations: [{
        operation: 'add-ripple',
        stage: 'on-coordinates',
        parameters: {
            amplitude: 20,
            frequency: 0.1,
            phase: 0,
            originX: '50%',
            originY: '50%',
        },
    }],
});

scrawl.makePattern({

    name: oName('fill-pattern'),
    asset: 'brick',

}).clone({

    name: oName('stroke-pattern'),
    asset: 'leaves',

});


ovalCanvas.setAsCurrentCanvas();

const myOval = scrawl.makeOval({
    name: oName('my-oval'),
    start: ['center', 'center'],
    handle: ['center', 'center'],

    radius: 150,

    fillStyle: 'khaki',
    strokeStyle: 'teal',
    lineWidth: 4,
    lineJoin: 'round',
    method: 'fillThenDraw',
});

scrawl.makeWheel({
    name: oName('pin'),
    radius: 5,
    fillStyle: 'red',
    pivot: oName('my-oval'),
    lockTo: 'pivot',
    handle: ['center', 'center'],
});

const tetraCanvas = scrawl.findCanvas('tetragon-canvas');
const tetraNamespace = tetraCanvas.name;
const tName = (n) => `${tetraNamespace}-${n}`;

tetraCanvas.setAsCurrentCanvas();

scrawl.makeTetragon({
    name: tName('my-tetra'),
    start: ['center', 'center'],
    handle: ['center', 'center'],

    radius: 150,

    fillStyle: 'skyblue',
    strokeStyle: 'maroon',
    lineWidth: 4,
    lineJoin: 'round',
    method: 'fillThenDraw',
});

scrawl.makeWheel({
    name: tName('pin'),
    radius: 5,
    fillStyle: 'red',
    pivot: tName('my-tetra'),
    lockTo: 'pivot',
    handle: ['center', 'center'],
});

const shared = scrawl.makeGroup({

    name: 'shared',

}).addArtefacts(myOval, tName('my-tetra'));

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const {
        roll,
        scale,
        radiusX,
        radiusY,
        intersectX,
        intersectY,
        offshootA,
        offshootB,
        start,
        handle,
        offset,
    } = myOval;

    const {
        lineWidth,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur
/** @ts-expect-error */
    } = myOval.state;

    return `    Radius - radiusX: ${radiusX}, radiusY: ${radiusY}, 
    Intersect - intersectX: ${intersectX}, intersectY: ${intersectY}, 
    Offshoot - offshootA: ${offshootA}, offshootB: ${offshootB}, 
    Start - [${start}]; Handle - [${handle}]; Offset - [${offset}]
    Roll: ${roll}; Scale: ${scale}; lineWidth: ${lineWidth}
    Shadow - offsetX: ${shadowOffsetX}; offsetY: ${shadowOffsetY}; blur: ${shadowBlur}; `;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: oName('animation'),
    target: ovalCanvas,
    afterShow: report,
});

scrawl.makeRender({

    name: tName('animation'),
    target: tetraCanvas,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: shared,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        radiusX_absolute: ['radiusX', 'round'],
        radiusX_relative: ['radiusX', '%'],
        radiusY_absolute: ['radiusY', 'round'],
        radiusY_relative: ['radiusY', '%'],
        intersectX: ['intersectX', 'float'],
        intersectY: ['intersectY', 'float'],
        offshootA: ['offshootA', 'float'],
        offshootB: ['offshootB', 'float'],

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

        fillStyle: ['fillStyle', 'raw'],
        lockFillStyleToEntity: ['lockFillStyleToEntity', 'boolean'],
        strokeStyle: ['strokeStyle', 'raw'],
        lockStrokeStyleToEntity: ['lockStrokeStyleToEntity', 'boolean'],
    },
});


// Setup form
scrawl.initializeDomInputs([
    ['input', 'radiusX_absolute', '150'],
    ['input', 'radiusX_relative', '37.5'],
    ['input', 'radiusY_absolute', '150'],
    ['input', 'radiusY_relative', '37.5'],
    ['input', 'intersectX', '0.5'],
    ['input', 'intersectY', '0.5'],
    ['input', 'offshootA', '0.55'],
    ['input', 'offshootB', '0'],

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
    ['select', 'scaleShadow', 0],
    ['select', 'showBoundingBox', 0],
    ['select', 'start_xString', 1],
    ['select', 'start_yString', 1],
    ['select', 'upend', 0],
    ['select', 'winding', 0],

    ['select', 'fillStyle', 0],
    ['select', 'lockFillStyleToEntity', 0],
    ['select', 'strokeStyle', 0],
    ['select', 'lockStrokeStyleToEntity', 0],
]);


// #### Development and testing
console.log(scrawl.library);
