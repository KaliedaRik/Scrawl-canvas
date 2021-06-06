// # Demo Canvas 017 
// Phrase entity - test lineHeight, letterSpacing and justify attributes; setSectionStyles() functionality

// [Run code](../../demo/canvas-017.html)
import scrawl from '../source/scrawl.js';


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Create Phrase entity
let lorem = scrawl.makePhrase({

    name: 'myPhrase',

    startX: 300,
    startY: 200,
    handleX: '50%',
    handleY: '50%',
    width: '50%',

    sectionClassMarker: '[§<>]',

    text: '&shy;§ITALIC§Lorem§/ITALIC§ ipsum §Red-Text§har varit <ITALIC>standard</ITALIC> &auml;nda sedan §SMALL-CAPS§1500-talet§/SMALL-CAPS§, när-en-ok&aring;nd-§BOLD§bok§DEFAULTS§sättare-tog att antal §BOLD§bok§/BOLD§stäver §OVERLINE§och <HIGHLIGHT>blandade§/OVERLINE§ dem</HIGHLIGHT> för §size-24§Red-Text§att§DEFAULTS§ g&ouml;ra, §Letter-spacing-10§ett prov§UNDERLINE§exemplar</UNDERLINE>§/Letter-spacing-10§ §MONO§av en §BOLD§b&oacute;k.',

    font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

    fillStyle: '#003399',

    method: 'fill',
    showBoundingBox: true,
});

lorem.addSectionClass('Red-Text', { fill: 'red' })
.addSectionClass('size-24', { size: '24px' })
.addSectionClass('Letter-spacing-10', { space: 10 })
.addSectionClass('/Letter-spacing-10', { space: 0 })
.addSectionClass('MONO', { family: 'monospace' });


// Add a pivoted Wheel entity
scrawl.makeWheel({

    method: 'fillAndDraw',
    fillStyle: 'gold',
    strokeStyle: 'darkblue',

    radius: 5,
    handleX: 'center',
    handleY: 'center',

    pivot: 'myPhrase',
    lockTo: 'pivot',
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
    Width: ${lorem.dimensions[0]}; Roll: ${lorem.roll}; Scale: ${lorem.scale}
    Line height: ${lorem.lineHeight}; Letter spacing: ${lorem.letterSpacing}; Overline: ${lorem.overlinePosition}`;
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
scrawl.observeAndUpdate({

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
document.querySelector('#overline').value = 0.1;
document.querySelector('#absoluteWidth').value = 300;
document.querySelector('#lineHeight').value = 1.5;
document.querySelector('#letterSpacing').value = 0;
document.querySelector('#justify').options.selectedIndex = 0;
document.querySelector('#family').options.selectedIndex = 0;
document.querySelector('#size_px').value = 16;
document.querySelector('#size_string').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
