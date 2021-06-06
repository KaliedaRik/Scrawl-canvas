// # Demo Canvas 016 
// Phrase entity position and font attributes; Block mimic functionality

// [Run code](../../demo/canvas-016.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Create Phrase entity
let lorem = scrawl.makePhrase({

    name: 'myPhrase',
    order: 1,

    startX: 300,
    startY: 200,
    handleX: '50%',
    handleY: '50%',
    width: '50%',

    text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',
    font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

    fillStyle: 'darkgreen',

    method: 'fill',
    showBoundingBox: true,

    // Use the `exposeText` attribute to expose the entity's text to the DOM, to make it accessible to people not able to view the canvas (for whatever reason)
    // + This flag is `true` by default
    exposeText: true,
});


// Add a background entity which will mimic the Phrase entity
scrawl.makeBlock({

    name: 'writing-paper',
    order: 0,

    width: 20,
    height: 20,
    handleX: 10,
    handleY: 10,

    fillStyle: 'rgb(240, 245, 255)',
    method: 'fillAndDraw',

    mimic: 'myPhrase',
    lockTo: 'mimic',

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

// Add a pivot wheel
scrawl.makeWheel({

    fillStyle: 'red',
    radius: 5,
    pivot: 'myPhrase',
    lockTo: 'pivot',
    handleX: 'center',
    handleY: 'center',

    order: 2,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Start - x: ${lorem.start[0]}, y: ${lorem.start[1]}
    Handle - x: ${lorem.handle[0]}, y: ${lorem.handle[1]}
    Offset - x: ${lorem.offset[0]}, y: ${lorem.offset[1]}
    Width: ${lorem.dimensions[0]}; Roll: ${lorem.roll}; Scale: ${lorem.scale}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
//
// KNOWN ISSUE: in the mix between updating scale, font size and font family, the height calculation occasionally glitches, giving an incorrect height value for the Phrase entity
scrawl.observeAndUpdate({

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

        weight: ['weight', 'raw'],
        style: ['style', 'raw'],
        variant: ['variant', 'raw'],
        family: ['family', 'raw'],

        size_string: ['size', 'raw'],
        size_px: ['size', 'px'],
    },
});

// Setup form
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
document.querySelector('#relativeWidth').value = 50;
document.querySelector('#absoluteWidth').value = 300;
document.querySelector('#weight').options.selectedIndex = 0;
document.querySelector('#style').options.selectedIndex = 0;
document.querySelector('#variant').options.selectedIndex = 0;
document.querySelector('#family').options.selectedIndex = 0;
document.querySelector('#size_px').value = 16;
document.querySelector('#size_string').options.selectedIndex = 0;
