// # Demo Filters 018 
// Filter parameters: emboss

// [Run code](../../demo/filters-018.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


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

// @ts-expect-error
    return `    Angle - ${angle.value}°, Strength - ${strength.value}, Smoothing - ${smoothing.value}, Clamp - ${clamp.value}\n    Tolerance - ${tolerance.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

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

// @ts-expect-error
strength.value = 3;
// @ts-expect-error
angle.value = 225;
// @ts-expect-error
smoothing.value = 0;
// @ts-expect-error
tolerance.value = 0;
// @ts-expect-error
clamp.value = 0;
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#postProcessResults').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#useNaturalGrayscale').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#keepOnlyChangedAreas').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
