// # Demo Canvas 017
// Phrase entity - test lineHeight, letterSpacing and justify attributes; setSectionStyles() functionality

// [Run code](../../demo/canvas-017.html)
import {
    library as L,
    makePhrase,
    makeRender,
    makeWheel,
    makeUpdater,
} from '../source/scrawl.js';

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

    startX: 300,
    startY: 200,
    handleX: '50%',
    handleY: '50%',
    width: '50%',

    // To make the initial italic styling stick, we need to insert a soft hyphen
    // + Yes, this is a bug
    // + We have no plans to fix this issue in the near future
    text: '&shy;§ITALIC§Lorem§/ITALIC§ ipsum §Red-Text§har varit <ITALIC>standard</ITALIC> &auml;nda sedan §SMALL-CAPS§1500-talet§/SMALL-CAPS§, när-en-ok&aring;nd-§BOLD§bok§DEFAULTS§sättare-tog att antal §BOLD§bok§/BOLD§stäver §OVERLINE§och <HIGHLIGHT>blandade§/OVERLINE§ dem</HIGHLIGHT> för §size-24§Red-Text§att§DEFAULTS§ g&ouml;ra, §Letter-spacing-10§ett prov§UNDERLINE§exemplar</UNDERLINE>§/Letter-spacing-10§ §MONO§av en §BOLD§b&oacute;k.',

    font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

    fillStyle: '#003399',

    method: 'fill',
    showBoundingBox: true,
});


// Add additional section classes directly to the library
L.sectionClasses['Red-Text'] = { fill: 'red' };
L.sectionClasses['size-24'] = { size: '24px' };
L.sectionClasses['Letter-spacing-10'] = { space: 10 };
L.sectionClasses['/Letter-spacing-10'] = { space: 0 };
L.sectionClasses['MONO'] = { family: 'monospace' };


// Add a pivoted Wheel entity
makeWheel({

    name: name('pin'),
    method: 'fillAndDraw',
    fillStyle: 'gold',
    strokeStyle: 'darkblue',

    radius: 5,
    handleX: 'center',
    handleY: 'center',

    pivot: name('myPhrase'),
    lockTo: 'pivot',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const [startX, startY] = lorem.start;
    const [handleX, handleY] = lorem.handle;
    const width = lorem.dimensions[0];

    const {roll, scale, lineHeight, letterSpacing, overlinePosition} = lorem;

    return `    Start - x: ${startX}, y: ${startY}
    Handle - x: ${handleX}, y: ${handleY}
    Width: ${width}; Roll: ${roll}; Scale: ${scale}
    Line height: ${lineHeight}; Letter spacing: ${letterSpacing}; Overline: ${overlinePosition}`;
});


// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: lorem,

    useNativeListener: true,
    preventDefault: true,

    updates: {

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

        overline: ['overlinePosition', 'float'],
        letterSpacing: ['letterSpacing', 'float'],
        lineHeight: ['lineHeight', 'float'],
        justify: ['justify', 'raw'],
        family: ['family', 'raw'],

        size_string: ['size', 'raw'],
        size_px: ['size', 'px'],
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
document.querySelector('#overline').value = 0.1;
// @ts-expect-error
document.querySelector('#absoluteWidth').value = 300;
// @ts-expect-error
document.querySelector('#lineHeight').value = 1.5;
// @ts-expect-error
document.querySelector('#letterSpacing').value = 0;
// @ts-expect-error
document.querySelector('#justify').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#family').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#size_px').value = 16;
// @ts-expect-error
document.querySelector('#size_string').options.selectedIndex = 0;


// #### Development and testing
console.log(L);
