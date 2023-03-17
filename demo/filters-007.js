// # Demo Filters 007 
// Filter parameters: channels

// [Run code](../../demo/filters-007.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'channels',
    method: 'channels',

    red: 1,
    green: 1,
    blue: 1,
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

    filters: ['channels'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Red: ${red.value}\n    Green: ${green.value}\n    Blue: ${blue.value}\n    Alpha: ${alpha.value}\n    Opacity: ${opacity.value}`;
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

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        red: ['red', 'float'],
        green: ['green', 'float'],
        blue: ['blue', 'float'],
        alpha: ['alpha', 'float'],
        opacity: ['opacity', 'float'],
    },
});

// Setup form
const red = document.querySelector('#red'),
    green = document.querySelector('#green'),
    blue = document.querySelector('#blue'),
    alpha = document.querySelector('#alpha'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
red.value = 1;
// @ts-expect-error
green.value = 1;
// @ts-expect-error
blue.value = 1;
// @ts-expect-error
alpha.value = 1;
// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
