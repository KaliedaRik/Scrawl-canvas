// # Demo Filters 004 
// Filter parameters: threshold

// [Run code](../../demo/filters-004.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'threshold',
    method: 'threshold',

    level: 127,

    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,

    highRed: 255,
    highGreen: 255,
    highBlue: 255,
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

    filters: ['threshold'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Low color: ${lowCol.value}, High color: ${highCol.value}\n    Level: ${level.value}\n    Red: ${red.value}; Green: ${green.value}; Blue: ${blue.value}; Alpha: ${alpha.value}; \n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        opacity: ['opacity', 'float'],
        level: ['level', 'round'],
        lowColor: ['lowColor', 'raw'],
        highColor: ['highColor', 'raw'],
        red: ['red', 'round'],
        green: ['green', 'round'],
        blue: ['blue', 'round'],
        alpha: ['alpha', 'round'],
        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],
        useMixedChannel: ['useMixedChannel', 'boolean'],
    },
});

// Setup form
const lowCol = document.querySelector('#lowColor'),
    highCol = document.querySelector('#highColor'),
    level = document.querySelector('#level'),
    red = document.querySelector('#red'),
    green = document.querySelector('#green'),
    blue = document.querySelector('#blue'),
    alpha = document.querySelector('#alpha'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
lowCol.value = '#000000';
// @ts-expect-error
highCol.value = '#ffffff';
// @ts-expect-error
level.value = 128;
// @ts-expect-error
red.value = 128;
// @ts-expect-error
green.value = 128;
// @ts-expect-error
blue.value = 128;
// @ts-expect-error
alpha.value = 128;
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#useMixedChannel').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeRed').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeGreen').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeBlue').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeAlpha').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
