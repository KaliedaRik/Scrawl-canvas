// # Demo Canvas 204
// Label entity - gradients and patterns

// [Run code](../../demo/canvas-204.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


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
        [494, 'red'],
        [495, 'yellow'],
        [504, 'yellow'],
        [505, 'red'],
        [999, 'green'],
    ],
    colorSpace: 'OKLAB',
    precision: 5,

}).clone({

    name: name('reflected-gradient'),
    endX: '40%',
    spread: 'reflect',
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

    lineWidth: 2,

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
const report = reportSpeed('#reportmessage', () => {

    return `
    useTextStyleForOutline: ${dom.useTextStyleForOutline.value === '0' ? false : true}
    useTextStyleForBoundingBox: ${dom.useTextStyleForBoundingBox.value === '0' ? false : true}
    useTextStyleForUnderline: ${dom.useTextStyleForUnderline.value === '0' ? false : true}
    `
});


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
        boundingBoxStyle: ['boundingBoxStyle', 'raw'],
        fillStyle: ['fillStyle', 'raw'],
        includeUnderline: ['includeUnderline', 'boolean'],
        letterSpacing: ['letterSpacing', 'px'],
        lockFillStyleToEntity: ['lockFillStyleToEntity', 'boolean'],
        method: ['method', 'raw'],
        reverse: ['flipReverse', 'boolean'],
        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
        showBoundingBox: ['showBoundingBox', 'boolean'],
        strokeStyle: ['strokeStyle', 'raw'],
        underlineStyle: ['underlineStyle', 'raw'],
        upend: ['flipUpend', 'boolean'],
        useTextStyleForBoundingBox: ['useTextStyleForBoundingBox', 'boolean'],
        useTextStyleForOutline: ['useTextStyleForOutline', 'boolean'],
        useTextStyleForUnderline: ['useTextStyleForUnderline', 'boolean'],
        wordSpacing: ['wordSpacing', 'px'],
    },
});


// Setup form
const dom = scrawl.initializeDomInputs([
    ['input', 'letterSpacing', '0'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'wordSpacing', '0'],
    ['select', 'boundingBoxStyle', 0],
    ['select', 'fillStyle', 0],
    ['select', 'includeUnderline', 1],
    ['select', 'lockFillStyleToEntity', 0],
    ['select', 'method', 0],
    ['select', 'reverse', 0],
    ['select', 'showBoundingBox', 0],
    ['select', 'strokeStyle', 0],
    ['select', 'underlineStyle', 0],
    ['select', 'upend', 0],
    ['select', 'useTextStyleForBoundingBox', 0],
    ['select', 'useTextStyleForOutline', 0],
    ['select', 'useTextStyleForUnderline', 0],
]);


// #### Development and testing
console.log(scrawl.library);
