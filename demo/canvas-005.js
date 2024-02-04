// # Demo Canvas 005
// Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween; trigger canvas hover and drag UX

// [Run code](../../demo/canvas-005.html)
import {
    library as L,
    makeBlock,
    makeDragZone,
    makeGradient,
    makeRadialGradient,
    makeRender,
    makeTween,
    makeWheel,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = L.artefact.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Build the gradient objects
const myRadial = makeRadialGradient({
    name: name('circle-waves'),

    startX: '30%',
    startY: '30%',
    endX: '50%',
    endY: '50%',

    endRadius: '50%',

    paletteStart: 200,
    paletteEnd: 800,

    delta: {
        paletteStart: -1,
        paletteEnd: -1
    },

    cyclePalette: true,
    animateByDelta: true,

    colors: [
        [0, 'black'],
        [99, 'red'],
        [199, 'black'],
        [299, 'blue'],
        [399, 'black'],
        [499, 'gold'],
        [599, 'black'],
        [699, 'green'],
        [799, 'black'],
        [899, 'lavender'],
        [999, 'black']
    ],
});

makeGradient({
    name: name('colored-pipes'),
    endX: '100%',
    cyclePalette: true,

    easing: 'easeOutInQuad',
    precision: 1,

    colors: [
        [0, 'black'],
        [49, 'yellow'],
        [99, 'black'],
        [149, 'lightyellow'],
        [199, 'black'],
        [249, 'goldenrod'],
        [299, 'black'],
        [349, 'lemonchiffon'],
        [399, 'black'],
        [449, 'gold'],
        [499, 'black'],
        [549, 'tan'],
        [599, 'black'],
        [649, 'wheat'],
        [699, 'black'],
        [749, 'yellowgreen'],
        [799, 'black'],
        [849, 'peachpuff'],
        [899, 'black'],
        [949, 'papayawhip'],
        [999, 'black'],
    ],
});

makeGradient({
    name: name('linear'),
    endX: '100%',

    colors: [
        [0, 'blue'],
        [495, 'red'],
        [500, 'yellow'],
        [505, 'red'],
        [999, 'green']
    ],
    colorSpace: 'OKLAB',
    precision: 5,
});


// Build the block and wheel entitys
makeBlock({
    name: name('cell-locked-block'),

    width: 150,
    height: 150,

    startX: 180,
    startY: 120,

    handleX: 'center',
    handleY: 'center',

    fillStyle: name('linear'),
    strokeStyle: 'coral',
    lineWidth: 6,

    delta: {
        roll: 0.5
    },

    method: 'fillAndDraw',

}).clone({
    name: name('entity-locked-block'),

    scale: 1.2,
    startY: 480,

    lockFillStyleToEntity: true,

}).clone({
    name: name('animated-block'),

    width: 160,
    height: 90,

    startY: 300,

    fillStyle: name('colored-pipes'),
    lineWidth: 2,

    delta: {
        roll: -0.2
    },
});

makeWheel({
    name: name('cell-locked-wheel'),

    radius: 75,

    startX: 480,
    startY: 120,
    handleX: 'center',
    handleY: 'center',

    fillStyle: name('linear'),
    strokeStyle: 'coral',
    lineWidth: 6,
    lineDash: [4, 4],

    delta: {
        roll: -0.5
    },

    method: 'fillAndDraw',

}).clone({
    name: name('entity-locked-wheel'),

    scale: 1.2,
    startY: 480,

    lockFillStyleToEntity: true,

}).clone({
    name: name('animated-wheel'),

    scale: 0.9,
    startY: 300,

    fillStyle: myRadial,
    lineWidth: 2,
    lineDash: [],

    delta: {
        roll: 0.2
    },
});


// #### User interaction
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
                cursor: 'grab',
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

// Create the drag-and-drop zone
const current = makeDragZone({

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
// Tween, and the engine used by the tween to calculate values
const tweenEngine = (start, change, position) => {

    const temp = 1 - position;

    // This is a fairly basic ease-in-out function: the tween will call the function with start, change and position arguments, and the function is required to return a value calculated from those arguments
    const val = (position < 0.5) ?
        start + ((position * position) * change * 2) :
        (start + change) + ((temp * temp) * -change * 2);

    // We're asking the tween to calculate an ease over 3000 steps, but the palette cursors (paletteStart, paletteEnd) are only permitted to have integer values between 0 and 999. Effectively we're asking the tween to cycle through the palette 3 times.
    return val % 1000;
};

const tweeny = makeTween({
    name: name('mytween'),
    targets: name('colored-pipes'),
    duration: 5000,
    cycles: 1,
    definitions: [{
        attribute: 'paletteStart',
        integer: true,
        start: 0,
        end: 2999,
        engine: tweenEngine
    }, {
        attribute: 'paletteEnd',
        integer: true,
        start: 999,
        end: 3998,
        engine: tweenEngine
    }]
});


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    const dragging = current();

    if (typeof dragging !== 'boolean') {

        if (dragging && dragging.artefact) return `Currently dragging: ${dragging.artefact.name}`
    }
    return 'Currently dragging: nothing';
});


// Function to animate the gradients
const animateGradients = function () {

    const dragging = current();

    if (!tweeny.isRunning()) {

        if (typeof dragging !== 'boolean' && dragging) {

            if (dragging.artefact && dragging.artefact.name === name('animated-block')) tweeny.run();
        }
    }
};


// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: canvas,

    // Gradient animation is not automatically handled by the Display cycle
    // - instead we have to trigger it manually
    commence: animateGradients,

    // We have to tell the canvas to check UI for hovering states every Display cycle
    afterCompile: () => canvas.checkHover(),

    // Display the current frame rate - calculated at the end of each Display cycle
    afterShow: report,
});


// #### Development and testing
console.log(L);
