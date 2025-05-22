// # Demo Canvas 205
// Label entity - updating font parts; experiments with variable font

// [Run code](../../demo/canvas-205.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
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
    Font string (entity): ${mylabel.get('fontString')}
    Font string (canvas): ${mylabel.get('canvasFont')}

    Font size: ${mylabel.get('fontSize')}
    Font style: ${mylabel.get('fontStyle')}
    Font stretch: ${mylabel.get('fontStretch')}
    Font variant: ${mylabel.get('fontVariantCaps')}
    Font weight: ${mylabel.get('fontWeight')}
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
        fontWeight_string: ['fontWeight', 'raw'],
        fontWeight_number: ['fontWeight', 'int'],
        fontVariantCaps: ['fontVariantCaps', 'raw'],
        fontStyle: ['fontStyle', 'raw'],
        fontStretch_string: ['fontStretch', 'raw'],
        fontStretch_percent: ['fontStretch', '%'],
    },
});


// Setup form
scrawl.initializeDomInputs([
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'fontWeight_number', '400'],
    ['input', 'fontStretch_percent', '100'],
    ['select', 'fontString', 0],
    ['select', 'fontSize', 0],
    ['select', 'fontWeight_string', 0],
    ['select', 'fontVariantCaps', 0],
    ['select', 'fontStyle', 0],
    ['select', 'fontStretch_string', 4],
]);


// #### Development and testing
console.log(scrawl.library);
