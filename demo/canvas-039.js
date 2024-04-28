// # Demo Canvas 039
// Detecting mouse/pointer cursor movements across a non-base Cell

// [Run code](../../demo/canvas-039.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Create a second cell for the canvas
// + This cell will act as a moveable layer (start, handle, offset, roll, flipUpend, flipReverse)
// + We will also add entitys to the new Cell, and create a drag zone on it so those entitys can be dragged and dropped across the Cell.
const mycell = canvas.buildCell({

    name: name('test-cell'),

    width: 600,
    height: 400,

    startX: 380,
    startY: 200,

    handleX: 400,
    handleY: 200,

    offsetX: 0,
    offsetY: 60,

    roll: 120,
    scale: 0.8,

    flipUpend: true,
    flipReverse: false,

    backgroundColor: 'lightblue',
});


// Make an object to hold functions we'll use for UI
const setCursorTo = {

    auto: () => {
        canvas.set({
            css: {
                cursor: 'auto',
            },
        });
    },
    pointer: () => {
        canvas.set({
            css: {
                cursor: 'pointer',
            },
        });
    },
    grabbing: () => {
        canvas.set({
            css: {
                cursor: 'grabbing',
            },
        });
    },
};

// Create the drag group
scrawl.makeGroup({

    name: name('drag-group'),
    host: mycell,
    checkForEntityHover: true,
    onEntityHover: setCursorTo.pointer,
    onEntityNoHover: setCursorTo.auto,
})

// Create draggable entitys
scrawl.makeWheel({

    name: name('wheel-1'),
    group: name('drag-group'),

    radius: 40,

    start: [250, 150],
    handle: ['center', 'center'],

    fillStyle: 'red',

}).clone({

    name: name('wheel-2'),
    start: [250, 250],
    fillStyle: 'blue',

}).clone({

    name: name('wheel-3'),
    start: [350, 250],
    fillStyle: 'green',

}).clone({

    name: name('wheel-4'),
    start: [350, 150],
    fillStyle: 'yellow',
});

scrawl.makeBlock({

    name: name('block-1'),
    group: name('test-cell'),

    start: ['5%', '5%'],
    dimensions: ['90%', '90%'],

    lineWidth: 5,
    method: 'draw',
})

scrawl.makeWheel({

    name: name('mouse-wheel'),
    group: name('test-cell'),

    radius: 6,
    handle: ['center', 'center'],

    lockTo: 'mouse',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const [startX, startY] = mycell.start;
    const [handleX, handleY] = mycell.handle;
    const [offsetX, offsetY] = mycell.offset;
    const [width, height] = mycell.dimensions;

    const {roll, scale} = mycell;

    return `    Start - x: ${startX}, y: ${startY}
    Handle - x: ${handleX}, y: ${handleY}
    Offset - x: ${offsetX}, y: ${offsetY}
    Dimensions - width: ${width}, height: ${height}
    Roll: ${roll}; Scale: ${scale}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: ('animation'),
    target: canvas,

    // Non-base Cells do not routinely update their local here object, has to be triggered manually
    commence: () => {
        mycell.updateHere();
        canvas.checkHover();
    },
    afterShow: report,
});


// #### User interaction
// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('drag-group'),
    coordinateSource: mycell,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
    updateOnStart: setCursorTo.grabbing,
    updateOnEnd: setCursorTo.pointer,
});

// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);

// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mycell,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        width: ['width', 'round'],
        height: ['height', 'round'],

        start_x: ['startX', 'round'],
        start_y: ['startY', 'round'],

        handle_x: ['handleX', 'round'],
        handle_y: ['handleY', 'round'],

        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
    },
});

// Setup form
initializeDomInputs([
    ['input', 'start_x', '380'],
    ['input', 'start_y', '200'],
    ['input', 'handle_x', '400'],
    ['input', 'handle_y', '200'],
    ['input', 'offset_x', '0'],
    ['input', 'offset_y', '60'],
    ['input', 'roll', '120'],
    ['input', 'scale', '0.8'],
    ['input', 'width', '600'],
    ['input', 'height', '400'],
    ['select', 'upend', 1],
    ['select', 'reverse', 0],
]);


// #### Development and testing
console.log(scrawl.library);
