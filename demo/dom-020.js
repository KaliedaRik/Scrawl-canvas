// # Demo DOM 020
// Using the EyeDropper API

// [Run code](../../demo/dom-020.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.base.set({
    compileOrder: 1,
});

scrawl.importDomImage('.flowers');


// Create the background
const checkerboard = canvas.buildCell({
    name: 'checkerboard',
    width: 16,
    height: 16,
    backgroundColor: '#444',
    compileOrder: 0,
    cleared: false,
    compiled: false,
    // shown: false,
    useAsPattern: true,
});

scrawl.makeBlock({
    name: 'checkerboard-block-1',
    group: 'checkerboard',
    dimensions: ['50%', '50%'],
    fillStyle: '#bbb',
}).clone({
    name: 'checkerboard-block-2',
    start: ['50%', '50%'],
});

checkerboard.clear();
checkerboard.compile();

scrawl.makePicture({
    name: 'checkerboard-image',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    fillStyle: 'checkerboard',
});


// Create the filter
const myFilter = scrawl.makeFilter({
    name: 'chromakey',
    method: 'chromakey',
    red: 190,
    green: 129,
    blue: 223,
    opaqueAt: 0.39,
    transparentAt: 0.32,
});


// Create the target entity
const piccy = scrawl.makePicture({
    name: 'base-piccy',
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    filters: ['chromakey'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Reference color: ${reference.value}\n    Transparent at: ${transparentAt.value}, Opaque at: ${opaqueAt.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        transparentAt: ['transparentAt', 'float'],
        opaqueAt: ['opaqueAt', 'float'],
        opacity: ['opacity', 'float'],
        reference: ['reference', 'raw'],
    },
});


// Setup form
const reference = document.querySelector('#reference'),
    opaqueAt = document.querySelector('#opaqueAt'),
    transparentAt = document.querySelector('#transparentAt'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
reference.value = '#be81df';
// @ts-expect-error
opaqueAt.value = 0.39;
// @ts-expect-error
transparentAt.value = 0.32;
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
