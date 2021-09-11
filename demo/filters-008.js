// # Demo Filters 008 
// Filter parameters: tint

// [Run code](../../demo/filters-008.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'tint',
    method: 'tint',

    redInRed: 1,
    redInGreen: 0,
    redInBlue: 0,
    greenInRed: 0,
    greenInGreen: 1,
    greenInBlue: 0,
    blueInRed: 0,
    blueInGreen: 0,
    blueInBlue: 1,
});


// Create the target entity
scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['tint'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    In Red - red: ${redInRed.value} green: ${greenInRed.value} blue: ${blueInRed.value}
    In Green - red: ${redInGreen.value} green: ${greenInGreen.value} blue: ${blueInGreen.value}
    In Blue -  red: ${redInBlue.value} green: ${greenInBlue.value} blue: ${blueInBlue.value}
    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        redInRed: ['redInRed', 'float'],
        redInGreen: ['redInGreen', 'float'],
        redInBlue: ['redInBlue', 'float'],
        greenInRed: ['greenInRed', 'float'],
        greenInGreen: ['greenInGreen', 'float'],
        greenInBlue: ['greenInBlue', 'float'],
        blueInRed: ['blueInRed', 'float'],
        blueInGreen: ['blueInGreen', 'float'],
        blueInBlue: ['blueInBlue', 'float'],
        opacity: ['opacity', 'float'],
    },
});

// Setup form
const redInRed = document.querySelector('#redInRed'),
    greenInRed = document.querySelector('#greenInRed'),
    blueInRed = document.querySelector('#blueInRed'),
    redInGreen = document.querySelector('#redInGreen'),
    greenInGreen = document.querySelector('#greenInGreen'),
    blueInGreen = document.querySelector('#blueInGreen'),
    redInBlue = document.querySelector('#redInBlue'),
    greenInBlue = document.querySelector('#greenInBlue'),
    blueInBlue = document.querySelector('#blueInBlue'),
    opacity = document.querySelector('#opacity');

redInRed.value = 1;
redInGreen.value = 0;
redInBlue.value = 0;
greenInRed.value = 0;
greenInGreen.value = 1;
greenInBlue.value = 0;
blueInRed.value = 0;
blueInGreen.value = 0;
blueInBlue.value = 1;
opacity.value = 1;


// #### Development and testing
console.log(scrawl.library);
