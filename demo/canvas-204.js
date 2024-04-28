// # Demo Canvas 204
// Label entity - gradients and patterns

// [Run code](../../demo/canvas-204.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


scrawl.makeGradient({
    name: name('linear-gradient'),
    endX: '100%',

    colors: [
        [0, 'blue'],
        [495, 'red'],
        [500, 'yellow'],
        [505, 'red'],
        [999, 'green'],
    ],
    colorSpace: 'OKLAB',
    precision: 5,
});

scrawl.makePattern({

    name: name('water-pattern'),
    imageSource: 'img/water.png',
});

const mylabel = scrawl.makeLabel({

    name: name('my-label'),

    start: ['center', 'center'],
    handle: ['center', 'center'],

    fontString: 'bold italic 40px Garamond',
    text: 'Long live the world!',

    includeUnderline: true,
    underlineWidth: 3,
    underlineOffset: 0.9,
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
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: () => canvas.checkHover(),
    afterShow: report,
});


// #### User controls
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mylabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
        wordSpacing: ['wordSpacing', 'px'],
        letterSpacing: ['letterSpacing', 'px'],
        lockFillStyleToEntity: ['lockFillStyleToEntity', 'boolean'],
        fillStyle: ['fillStyle', 'raw'],
    },
});


// Setup form
initializeDomInputs([
    ['input', 'letterSpacing', '0'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'wordSpacing', '0'],
    ['select', 'reverse', 0],
    ['select', 'upend', 0],
    ['select', 'lockFillStyleToEntity', 0],
    ['select', 'fillStyle', 0],
]);


// #### Development and testing
console.log(scrawl.library);
