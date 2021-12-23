// # Demo Filters 018 
// Filter parameters: emboss

// [Run code](../../demo/filters-018.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

canvas.setBase({
    backgroundColor: 'red',
});


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'emboss',
    method: 'emboss',
    angle: 225,
    strength: 3,
    smoothing: 0,
    tolerance: 0,
    clamp: 0,
    postProcessResults: true,
    useNaturalGrayscale: false,
    keepOnlyChangedAreas: false,
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['emboss'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Angle - ${angle.value}°, Strength - ${strength.value}, Smoothing - ${smoothing.value}, Clamp - ${clamp.value}
    Tolerance - ${tolerance.value}
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

        strength: ['strength', 'float'],
        angle: ['angle', 'float'],
        smoothing: ['smoothing', 'round'],
        tolerance: ['tolerance', 'round'],
        clamp: ['clamp', 'round'],
        postProcessResults: ['postProcessResults', 'boolean'],
        useNaturalGrayscale: ['useNaturalGrayscale', 'boolean'],
        keepOnlyChangedAreas: ['keepOnlyChangedAreas', 'boolean'],
        opacity: ['opacity', 'float'],
    },
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = (e.target.value === '0') ? false : true;

    piccy.set({ memoizeFilterOutput: val });

}, '#memoizeFilterOutput');

// Setup form
let strength = document.querySelector('#strength'),
    angle = document.querySelector('#angle'),
    smoothing = document.querySelector('#smoothing'),
    clamp = document.querySelector('#clamp'),
    tolerance = document.querySelector('#tolerance'),
    opacity = document.querySelector('#opacity');

strength.value = 3;
angle.value = 225;
smoothing.value = 0;
tolerance.value = 0;
clamp.value = 0;
opacity.value = 1;

document.querySelector('#postProcessResults').options.selectedIndex = 1;
document.querySelector('#useNaturalGrayscale').options.selectedIndex = 0;
document.querySelector('#keepOnlyChangedAreas').options.selectedIndex = 0;
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
