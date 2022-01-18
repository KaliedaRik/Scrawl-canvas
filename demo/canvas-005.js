// # Demo Canvas 005 
// Cell-locked, and Entity-locked, gradients; animating gradients by delta, and by tween

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
    setIgnorePixelRatio,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
setIgnorePixelRatio(false);


// #### Scene setup
let canvas = L.artefact.mycanvas;

canvas.set({
    css: {
        border: '1px solid black'
    }
});


// Build the gradient objects
let myRadial = makeRadialGradient({
    name: 'circle-waves',

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
    name: 'colored-pipes',
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
    name: 'linear',
    endX: '100%',

    colors: [
        [0, 'blue'],
        [495, 'red'],
        [500, 'yellow'],
        [505, 'red'],
        [999, 'green']
    ],
});


// Build the block and wheel entitys
makeBlock({
    name: 'cell-locked-block',

    width: 150,
    height: 150,

    startX: 180,
    startY: 120,

    handleX: 'center',
    handleY: 'center',

    fillStyle: 'linear',
    strokeStyle: 'coral',
    lineWidth: 6,

    delta: {
        roll: 0.5
    },

    method: 'fillAndDraw',

}).clone({
    name: 'entity-locked-block',

    scale: 1.2,
    startY: 480,

    lockFillStyleToEntity: true,

}).clone({
    name: 'animated-block',

    width: 160,
    height: 90,

    startY: 300,

    fillStyle: 'colored-pipes',
    lineWidth: 2,

    delta: {
        roll: -0.2
    },
});

makeWheel({
    name: 'cell-locked-wheel',

    radius: 75,

    startX: 480,
    startY: 120,
    handleX: 'center',
    handleY: 'center',

    fillStyle: 'linear',
    strokeStyle: 'coral',
    lineWidth: 6,
    lineDash: [4, 4],

    delta: {
        roll: -0.5
    },

    method: 'fillAndDraw',

}).clone({
    name: 'entity-locked-wheel',

    scale: 1.2,
    startY: 480,

    lockFillStyleToEntity: true,

}).clone({
    name: 'animated-wheel',

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
// Create the drag-and-drop zone
let current = makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,
});


// #### Scene animation
// Tween, and the engine used by the tween to calculate values
let tweenEngine = (start, change, position) => {

    let temp = 1 - position,
        val;

    // This is a fairly basic ease-in-out function: the tween will call the function with start, change and position arguments, and the function is required to return a value calculated from those arguments
    val = (position < 0.5) ?
        start + ((position * position) * change * 2) :
        (start + change) + ((temp * temp) * -change * 2);

    // We're asking the tween to calculate an ease over 3000 steps, but the palette cursors (paletteStart, paletteEnd) are only permitted to have integer values between 0 and 999. Effectively we're asking the tween to cycle through the palette 3 times.
    return val % 1000;
};

let tweeny = makeTween({
    name: 'mytween',
    targets: 'colored-pipes',
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
    return `Currently dragging: ${(dragging) ? dragging.artefact.name : 'nothing'}`;
});


// Function to animate the gradients
let animateGradients = function () {

    let dragging;

    return function () {

        myRadial.updateByDelta();
        dragging = current();

        if (dragging && dragging.artefact.name === 'animated-block' && !tweeny.isRunning()) tweeny.run();
    }
}();


// Create the Display cycle animation
makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: animateGradients,
    afterShow: report,
});


// #### Development and testing
console.log(L);
