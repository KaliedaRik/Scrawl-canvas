// # Demo Filters 025
// Filter parameters: Glitch filter

// [Run code](../../demo/filters-025.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

const glitch = scrawl.makeFilter({

    name: 'glitch',
    method: 'glitch',
    level: 0.2,
    offsetMin: -10,
    offsetMax: 10,
});


// Create the target entity
const piccy = scrawl.makePicture({

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['glitch'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Level: ${level.value}
    Mixed offset - min: ${offsetMin.value}; max ${offsetMax.value}
    Red offset - min: ${offsetRedMin.value}; max ${offsetRedMax.value}
    Green offset - min: ${offsetGreenMin.value}; max ${offsetGreenMax.value}
    Blue offset - min: ${offsetBlueMin.value}; max ${offsetBlueMax.value}
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

    target: glitch,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        opacity: ['opacity', 'float'],
        level: ['level', 'float'],
        step: ['step', 'round'],
        offsetMin: ['offsetMin', 'round'],
        offsetMax: ['offsetMax', 'round'],
        offsetRedMin: ['offsetRedMin', 'round'],
        offsetRedMax: ['offsetRedMax', 'round'],
        offsetGreenMin: ['offsetGreenMin', 'round'],
        offsetGreenMax: ['offsetGreenMax', 'round'],
        offsetBlueMin: ['offsetBlueMin', 'round'],
        offsetBlueMax: ['offsetBlueMax', 'round'],
        useMixedChannel: ['useMixedChannel', 'boolean'],
        transparentEdges: ['transparentEdges', 'boolean'],
    },
});

// Setup form
const level = document.querySelector('#level');
const step = document.querySelector('#step');
const useMixedChannel = document.querySelector('#useMixedChannel');
const transparentEdges = document.querySelector('#transparentEdges');
const offsetMin = document.querySelector('#offsetMin');
const offsetMax = document.querySelector('#offsetMax');
const offsetRedMin = document.querySelector('#offsetRedMin');
const offsetRedMax = document.querySelector('#offsetRedMax');
const offsetGreenMin = document.querySelector('#offsetGreenMin');
const offsetGreenMax = document.querySelector('#offsetGreenMax');
const offsetBlueMin = document.querySelector('#offsetBlueMin');
const offsetBlueMax = document.querySelector('#offsetBlueMax');
const opacity = document.querySelector('#opacity');

level.value = 0.2;
step.value = 1;
useMixedChannel.options.selectedIndex = 1;
transparentEdges.options.selectedIndex = 0;
offsetMin.value = -10;
offsetMax.value = 10;
offsetRedMin.value = 0;
offsetRedMax.value = 0;
offsetGreenMin.value = 0;
offsetGreenMax.value = 0;
offsetBlueMin.value = 0;
offsetBlueMax.value = 0;
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
