// # Demo Canvas 018 
// Phrase entity - text along a path

// [Run code](../../demo/canvas-018.html)
import scrawl from '../source/scrawl.js';


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Create Shape entitys for paths
scrawl.makeOval({

    name: 'oval-path',

    strokeStyle: 'black',
    method: 'draw',

    startX: 'center',
    startY: 'center',
    handleX: 'center',
    handleY: 'center',

    radiusX: '40%',
    radiusY: '42%',

    useAsPath: true,
});

let spiral = scrawl.makeSpiral({

    name: 'spiral-path',

    strokeStyle: 'darkgreen',
    method: 'draw',

    startX: 'center',
    startY: 'center',
    handleX: 'center',
    handleY: 'center',

    loops: 5,
    loopIncrement: 1,
    drawFromLoop: 2,

    scale: 40,
    scaleOutline: false,

    flipUpend: true,
    roll: 30,

    useAsPath: true,
});


// Create Phrase entitys
scrawl.makePhrase({
    name: 'label',

    text: 'H&epsilon;lj&ouml;!',
    font: 'bold 40px Garamond, serif',

    width: 120,
    handleX: 'center',
    handleY: '70%',

    method: 'fillAndDraw',

    justify: 'center',
    lineHeight: 1,

    fillStyle: 'green',
    strokeStyle: 'gold',

    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 2,
    shadowColor: 'black',

    path: 'oval-path',
    lockTo: 'path',
    addPathRotation: true,

    delta: {
        pathPosition: 0.0008,
    }
});

let lorem = scrawl.makePhrase({

    name: 'myPhrase',

    sectionClassMarker: '[§<>]',

    text: '&shy;§ITALIC§Lorem§/ITALIC§ ipsum §Red-Text§har varit <ITALIC>standard</ITALIC> &auml;nda sedan §SMALL-CAPS§1500-talet§/SMALL-CAPS§, när-en-ok&aring;nd-§BOLD§bok§DEFAULTS§sättare-tog att antal §BOLD§bok§/BOLD§stäver §OVERLINE§och <HIGHLIGHT>blandade§/OVERLINE§ dem</HIGHLIGHT> för §size-24§Red-Text§att§DEFAULTS§ g&ouml;ra, §Letter-spacing-10§ett prov§UNDERLINE§exemplar</UNDERLINE>§/Letter-spacing-10§ §MONO§av en §BOLD§b&oacute;k.',
    font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

    justify: 'center',

    fillStyle: '#003399',

    method: 'fill',

    textPath: 'spiral-path',
    textPathPosition: 0.9,

    handleY: 12,

    delta: {
        textPathPosition: -0.0006,
    }
});

lorem.addSectionClass('Red-Text', { fill: 'red' })
.addSectionClass('size-24', { size: '24px' })
.addSectionClass('Letter-spacing-10', { space: 10 })
.addSectionClass('/Letter-spacing-10', { space: 0 })
.addSectionClass('MONO', { family: 'monospace' });


// Create other entitys
scrawl.makePicture({

    name: 'bunny',
    imageSource: 'img/bunny.png',

    width: 26,
    height: 37,

    copyWidth: 26,
    copyHeight: 37,

    handleX: 'center',
    handleY: 'center',

    path: 'oval-path',
    pathPosition: .50,
    lockTo: 'path',
    addPathRotation: true,

    delta: {
        pathPosition: 0.0008,
    }
})


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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Observer functionality for the ___spiral___ Shape entity
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: spiral,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        start_xAbsolute: ['startX', 'round'],
        start_yAbsolute: ['startY', 'round'],
        handle_xAbsolute: ['handleX', 'round'],
        handle_yAbsolute: ['handleY', 'round'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],
    },
});

// Observer functionality for the ___lorem___ Phrase entity
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: lorem,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        overline: ['overlinePosition', 'float'],
        letterSpacing: ['letterSpacing', 'float'],
        family: ['family', 'raw'],
        size_px: ['size', 'px'],

        direction: ['textPathDirection', 'raw'],
        justify: ['justify', 'raw'],
    },
});

// Setup form
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 40;
document.querySelector('#upend').options.selectedIndex = 1;
document.querySelector('#reverse').options.selectedIndex = 0;
document.querySelector('#direction').options.selectedIndex = 0;
document.querySelector('#justify').options.selectedIndex = 1;
document.querySelector('#overline').value = 0.1;
document.querySelector('#letterSpacing').value = 0;
document.querySelector('#family').options.selectedIndex = 0;
document.querySelector('#size_px').value = 16;
