// # Demo Canvas 205
// Label entity - updating font parts; experiments with variable font

// [Run code](../../demo/canvas-205.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


const mylabel = scrawl.makeLabel({

    name: name('my-label'),

    start: ['center', 'center'],
    handle: ['center', 'center'],

    fontString: '40px Garamond',
    text: 'Long live the world!',

    showBoundingBox: true,
    boundingBoxStyle: '#f008',
});


// #### User interaction
// Make an object to hold functions we'll use for UI
const setCursorTo = {
    auto: () => canvas.set({ css: { cursor: 'auto'}}),
    pointer: () => canvas.set({ css: { cursor: 'grab'}}),
    grabbing: () => canvas.set({ css: { cursor: 'grabbing'}}),
};

// Create the drag-and-drop zone
scrawl.makeDragZone({
    zone: canvas,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,
    updateOnStart: setCursorTo.grabbing,
    updateOnEnd: setCursorTo.pointer,
});

// Implement the hover check on the Canvas wrapper
canvas.set({
    checkForEntityHover: true,
    onEntityHover: setCursorTo.pointer,
    onEntityNoHover: setCursorTo.auto,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', () => {
    return `
Font.details:
    Raw font: ${mylabel.get('rawFont')}
    Default font: ${mylabel.get('defaultFont')}

    Font size: ${mylabel.fontSize}
    Font style: ${mylabel.fontStyle}
    Font stretch: ${mylabel.fontStretch}
    Font variant: ${mylabel.fontVariant}
    Font weight: ${mylabel.fontWeight}
    `;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: () => canvas.checkHover(),
    afterShow: report,
});


// #### User interaction
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mylabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        fontString: ['fontString', 'raw'],
        fontSize: ['fontSize', 'raw'],
        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
        'fontWeight-string': ['fontWeight', 'raw'],
        'fontWeight-number': ['fontWeight', 'int'],
        fontVariant: ['fontVariant', 'raw'],
        fontStyle: ['fontStyle', 'raw'],
        'fontStretch-string': ['fontStretch', 'raw'],
        'fontStretch-percent': ['fontStretch', '%'],
    },
});


// Setup form
// @ts-expect-error
document.querySelector('#fontString').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#fontSize').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#fontWeight-string').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#fontWeight-number').value = 400;
// @ts-expect-error
document.querySelector('#fontVariant').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#fontStyle').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#fontStretch-string').options.selectedIndex = 4;
// @ts-expect-error
document.querySelector('#fontStretch-percent').value = 100;



// #### Development and testing
console.log(scrawl.library);
