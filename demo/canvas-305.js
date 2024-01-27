// # Demo Canvas 305
// Phrase entity - text along a path

// [Run code](../../demo/canvas-305.html)
import {
    library as L,
    makeOval,
    makePhrase,
    makePicture,
    makeRender,
    makeSpiral,
    makeUpdater,
} from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = L.artefact.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create Shape entitys for paths
makeOval({

    name: name('oval-path'),

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

const spiral = makeSpiral({

    name: name('spiral-path'),

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
makePhrase({

    name: name('label'),

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

    path: name('oval-path'),
    lockTo: 'path',
    addPathRotation: true,

    delta: {
        pathPosition: 0.0008,
    }
});

const lorem = makePhrase({

    name: name('myPhrase'),

    // Note that the `SMALL-CAPS` styling has been deprecated and shouldn't be used. Included here only for testing the deprecated functionality
    text: '&shy;§ITALIC§Lorem§/ITALIC§ ipsum §Red-Text§har varit <i>standard 😀</i> &auml;nda sedan §SMALL-CAPS§1500-talet§/SMALL-CAPS§, när-en-ok&aring;nd-§BOLD§bok§DEFAULTS§sättare-tog att antal 🤖 §BOLD§bok§/BOLD§stäver §OVERLINE§och <HIGHLIGHT>blandade§/OVERLINE§ dem</HIGHLIGHT> för §size-24§Red-Text§att§DEFAULTS§ g&ouml;ra, §Letter-spacing-10§ett 🎻 prov§u§exemplar</UNDERLINE>§/Letter-spacing-10§ §MONO§av en §BOLD§b&oacute;k.',

    font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

    justify: 'center',

    fillStyle: '#003399',

    method: 'fill',

    textPath: name('spiral-path'),
    textPathPosition: 0.9,

    handleY: 12,

    delta: {
        textPathPosition: -0.0006,
    }
});


// Add additional section classes to the library, via our new Phrase entity
lorem.addSectionClass('Red-Text', { fill: 'red' })
.addSectionClass('size-24', { size: '24px' })
.addSectionClass('Letter-spacing-10', { space: 10 })
.addSectionClass('/Letter-spacing-10', { space: 0 })
.addSectionClass('MONO', { family: 'monospace' });

// Create other entitys
makePicture({

    name: name('bunny'),
    imageSource: 'img/bunny.png',

    width: 26,
    height: 37,

    copyWidth: 26,
    copyHeight: 37,

    handleX: 'center',
    handleY: 'center',

    path: name('oval-path'),
    pathPosition: .50,
    lockTo: 'path',
    addPathRotation: true,

    delta: {
        pathPosition: 0.0008,
    }
})


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Observer functionality for the ___spiral___ Shape entity
makeUpdater({

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
makeUpdater({

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
// @ts-expect-error
document.querySelector('#start_xAbsolute').value = 300;
// @ts-expect-error
document.querySelector('#start_yAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#handle_xAbsolute').value = 100;
// @ts-expect-error
document.querySelector('#handle_yAbsolute').value = 100;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#scale').value = 40;
// @ts-expect-error
document.querySelector('#upend').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#reverse').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#direction').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#justify').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#overline').value = 0.1;
// @ts-expect-error
document.querySelector('#letterSpacing').value = 0;
// @ts-expect-error
document.querySelector('#family').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#size_px').value = 16;


// #### Development and testing
console.log(L);
