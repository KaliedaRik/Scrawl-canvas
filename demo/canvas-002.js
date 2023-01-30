// # Demo Canvas 002 
// Block and wheel entity positioning (start, pivot, mimic, mouse)

// [Run code](../../demo/canvas-002.html)
import {
    addNativeListener,
    library as L,
    makeBlock,
    makeRender,
    makeWheel,
    observeAndUpdate,
} from '../source/scrawl.js'

import { reportSpeed, killArtefact } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
let canvas = L.artefact.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create and clone block and wheel entitys. For the sake of safety and sanity, create the (reference) entitys on which other artefacts will pivot and mimic first. Then create those other artefacts.
//
// Note: setting this entity's `method` value to __none__ means that while it will perform all necessary calculations as part of the Display cycle, it will not complete its stamp action, thus will not appear on the display. This differs from setting its `visibility` attribute to false, which will make the entity skip both calculation and stamp operations
let myPivot = makeWheel({
    name: name('mouse-pivot'),
    method: 'none',

    startX: 'center',
    startY: 'center',
});

let myblock = makeBlock({
    name: name('base-block'),

    width: 150,
    height: 100,

    handleX: 'center',
    handleY: 'center',

    offsetX: -140,
    offsetY: -50,

    // To pivot this entity to the reference entity, we need to set both its `pivot` attribute (to the reference entity's name, or the entity itself) __and also__ set the `lockTo` attribute to the value __'pivot'__
    pivot: name('mouse-pivot'),
    lockTo: 'pivot',

    fillStyle: 'darkblue',
    strokeStyle: 'gold',
    method: 'fillAndDraw',

    lineWidth: 6,
    lineJoin: 'round',

    delta: {
        roll: 0.5,
    },
});

let mywheel = makeWheel({
    name: name('base-wheel'),

    radius: 60,
    startAngle: 35,
    endAngle: -35,

    handleX: 'center',
    handleY: 'center',

    offsetX: 140,
    offsetY: 50,

    pivot: name('mouse-pivot'),
    lockTo: 'pivot',

    fillStyle: 'purple',
    strokeStyle: 'gold',
    method: 'fillAndDraw',

    lineWidth: 6,
    lineJoin: 'round',

    delta: {
        roll: -0.5,
    },
});

myblock.clone({
    name: name('pivot-block'),

    height: 30,

    handleX: 'center',
    handleY: 'center',

    strokeStyle: 'red',
    lineWidth: 3,
    method: 'draw',

    pivot: name('base-block'),
    lockTo: 'pivot',

    offsetX: 0,
    offsetY: 110,
    addPivotOffset: true,

    delta: {
        roll: 0,
    },

}).clone({
    name: name('pivot-wheel'),

    pivot: name('base-wheel'),
    addPivotRotation: true,

    handleX: 0,
    handleY: '50%',

    offsetY: 0,

}).clone({
    name: name('mimic-wheel'),

    // `mimic` is an extended form of `pivot`
    mimic: name('base-wheel'),
    lockTo: 'mimic',

    // When an entity mimics another entity's dimensions, its own dimensions (width, height) can be added to the mimic dimensions
    width: 20,
    height: 20,

    // Handles can be directly affected by mimic dimensions. If the entity adds its own dimensions to the mimics dimensions, then it may also need to add appropriate handle values to the mimic's handle
    handleX: 10,
    handleY: 10,

    strokeStyle: 'darkgreen',

    // The default values for the __useMimic__ and __addOwn__ variables is 'false' - including false attributes here only for convenience during development work
    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicHandle: true,
    useMimicOffset: true,
    useMimicRotation: true,
    useMimicFlip: true,

    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: true,
    addOwnOffsetToMimic: false,
    addOwnRotationToMimic: false,
});

mywheel.clone({
    name: name('mimic-block'),

    mimic: name('base-block'),
    lockTo: 'mimic',

    width: 60,

    strokeStyle: 'darkgreen',
    lineWidth: 3,
    method: 'draw',

    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicOffset: true,
    useMimicRotation: true,
    addOwnDimensionsToMimic: true,
});


// #### User interaction
// Function to check whether mouse cursor is over canvas, and lock the reference entity accordingly
let mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            myPivot.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();

// For this demo we will suppress touchmove functionality over the canvas
addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);

// Setup form observer functionality.
observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas.base,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        backgroundColor: ['backgroundColor', 'raw'],
        clearAlpha: ['clearAlpha', 'float'],
    },
});

const backgroundColorSelector = document.querySelector('#backgroundColor'),
    clearAlphaInput = document.querySelector('#clearAlpha');

// @ts-expect-error
backgroundColorSelector.value = '';
// @ts-expect-error
clearAlphaInput.value = 0.9;


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
// @ts-expect-error
    return `    clearAlpha: ${clearAlphaInput.value}`;
});

// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: canvas,
    commence: mouseCheck,
    afterShow: report,
});


// #### Development and testing
console.log(L);

console.log('Performing tests ...');

killArtefact(canvas, name('mouse-pivot'), 4000, () => {

    myPivot = L.entity[name('mouse-pivot')];

    L.entity[name('base-block')].set({

        pivot: myPivot,
        lockTo: 'pivot',
    });

    L.entity[name('base-wheel')].set({

        pivot: myPivot,
        lockTo: 'pivot',
    });
});

killArtefact(canvas, name('mimic-block'), 6000);
