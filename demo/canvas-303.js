// # Demo Canvas 303
// Phrase entity position and font attributes; Block mimic functionality

// [Run code](../../demo/canvas-303.html)
import {
    library as L,
    makeBlock,
    makePhrase,
    makeRender,
    makeWheel,
    makeUpdater,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = L.artefact.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create Phrase entity
const lorem = makePhrase({

    name: name('myPhrase'),

    // Set the Phrase's compile ordering
    order: 1,

    startX: 300,
    startY: 200,
    handleX: '50%',
    handleY: '50%',
    width: '50%',

    text: 'Lorem ipsum har varit standard 😀 ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal 🤖 bokstäver och blandade dem för att göra ett 🎻 provexemplar av en bok.',
    fontString: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

    fillStyle: 'darkgreen',

    method: 'fill',
    showBoundingBox: true,

    // Use the `exposeText` attribute to expose the entity's text to the DOM, to make it accessible to people not able to view the canvas (for whatever reason)
    // + This flag is `true` by default
    exposeText: true,
});


// Add a background entity which will mimic the Phrase entity
makeBlock({

    name: name('writing-paper'),

    width: 20,
    height: 20,
    handleX: 10,
    handleY: 10,

    fillStyle: 'rgb(240, 245, 255)',
    method: 'fillAndDraw',

    // We mimic the Phrase entity's attributes using a set of flags to tell the Block which entitys need to be mimicked
    mimic: name('myPhrase'),
    lockTo: 'mimic',

    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicHandle: true,
    useMimicOffset: true,
    useMimicRotation: true,
    useMimicFlip: true,

    // We can also tell the Block to modify the mimicked attributes using its own values
    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: true,
    addOwnOffsetToMimic: false,
    addOwnRotationToMimic: false,

    // The Block needs to calculate its values after the Phrase has completed its calculations, but it needs to display before the Phrase (otherwise it would cover it)
    calculateOrder: 2,
    stampOrder: 0,
});

// Add a pivot wheel
makeWheel({

    name: name('pin'),
    fillStyle: 'red',
    radius: 5,
    pivot: name('myPhrase'),
    lockTo: 'pivot',
    handleX: 'center',
    handleY: 'center',

    order: 2,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const [startX, startY] = lorem.start;
    const [handleX, handleY] = lorem.handle;
    const width = lorem.dimensions[0];

    const {roll, scale} = lorem;

    const fontSize = lorem.get('fontSize'),
        fontString = lorem.get('fontString');

    return `    Start - x: ${startX}, y: ${startY}
    Handle - x: ${handleX}, y: ${handleY}
    Width: ${width}; Roll: ${roll}; Scale: ${scale}
    Font size: ${fontSize}
    Font string: ${fontString}`;
});


// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
//
// KNOWN ISSUE: in the mix between updating scale, font size and font family, the height calculation occasionally glitches, giving an incorrect height value for the Phrase entity
makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: lorem,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        relativeWidth: ['width', '%'],
        absoluteWidth: ['width', 'round'],

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

        weight: ['fontWeight', 'raw'],
        style: ['fontStyle', 'raw'],
        variant: ['fontVariant', 'raw'],
        family: ['fontFamily', 'raw'],

        size_string: ['fontSize', 'raw'],
        size_px: ['fontSize', 'px'],
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
document.querySelector('#relativeWidth').value = 50;
// @ts-expect-error
document.querySelector('#absoluteWidth').value = 300;
// @ts-expect-error
document.querySelector('#weight').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#style').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#variant').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#family').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#size_px').value = 16;
// @ts-expect-error
document.querySelector('#size_string').options.selectedIndex = 0;


// #### Development and testing
console.log(L)
