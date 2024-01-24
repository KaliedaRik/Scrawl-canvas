// # Demo Canvas 066
// Label entity

// [Run code](../../demo/canvas-066.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create Phrase entity
const lorem = scrawl.makeLabel({

    name: name('my-label'),

    start: ['center', 'center'],
    handle: ['center', 'center'],

    text: 'Say hello 😀 to my great font!',

    font: "1rem sans-serif",

    fillStyle: 'red',
});


// Add a pivoted Wheel entity
scrawl.makeWheel({

    name: name('pin'),
    method: 'fillAndDraw',
    fillStyle: 'gold',
    strokeStyle: 'darkblue',

    radius: 5,
    handleX: 'center',
    handleY: 'center',

    pivot: name('my-label'),
    lockTo: 'pivot',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `Testing ...`;
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

    target: lorem,

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

        font: ['font', 'raw'],
        fontKernning: ['fontKernning', 'raw'],
        fontStretch: ['fontStretch', 'raw'],
        fontVariantCaps: ['fontVariantCaps', 'raw'],
        wordSpacing: ['wordSpacing', 'float'],
        letterSpacing: ['letterSpacing', 'float'],
        textRendering: ['textRendering', 'raw'],
        direction: ['direction', 'raw'],
        textAlign: ['textAlign', 'raw'],
        textBaseline: ['textBaseline', 'raw'],
    },
});


// Setup form
// @ts-expect-error
document.querySelector('#start_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#handle_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_xAbsolute').value = 300;
// @ts-expect-error
document.querySelector('#start_yAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#handle_xAbsolute').value = 100;
// @ts-expect-error
document.querySelector('#handle_yAbsolute').value = 100;
// @ts-expect-error
document.querySelector('#start_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#start_yString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_xString').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#handle_yString').options.selectedIndex = 1;

// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#upend').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#reverse').options.selectedIndex = 0;

// @ts-expect-error
document.querySelector('#wordSpacing').value = 0;
// @ts-expect-error
document.querySelector('#letterSpacing').value = 0;
// @ts-expect-error
document.querySelector('#font').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#fontKernning').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#fontStretch').options.selectedIndex = 4;
// @ts-expect-error
document.querySelector('#fontVariantCaps').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#textRendering').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#direction').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#textAlign').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#textBaseline').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
