// # Demo Filters 025
// Filter parameters: Glitch filter

// [Run code](../../demo/filters-025.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


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

// @ts-expect-error
    return `    Level: ${level.value}\n    Mixed offset - min: ${offsetMin.value}; max ${offsetMax.value}\n    Red offset - min: ${offsetRedMin.value}; max ${offsetRedMax.value}\n    Green offset - min: ${offsetGreenMin.value}; max ${offsetGreenMax.value}\n    Blue offset - min: ${offsetBlueMin.value}; max ${offsetBlueMax.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

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

// @ts-expect-error
level.value = 0.2;
// @ts-expect-error
step.value = 1;
// @ts-expect-error
useMixedChannel.options.selectedIndex = 1;
// @ts-expect-error
transparentEdges.options.selectedIndex = 0;
// @ts-expect-error
offsetMin.value = -10;
// @ts-expect-error
offsetMax.value = 10;
// @ts-expect-error
offsetRedMin.value = 0;
// @ts-expect-error
offsetRedMax.value = 0;
// @ts-expect-error
offsetGreenMin.value = 0;
// @ts-expect-error
offsetGreenMax.value = 0;
// @ts-expect-error
offsetBlueMin.value = 0;
// @ts-expect-error
offsetBlueMax.value = 0;
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
