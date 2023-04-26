// # Demo Filters 005 
// Filter parameters: channelstep

// [Run code](../../demo/filters-005.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'channelstep',
    method: 'channelstep',

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

    filters: ['channelstep'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Red: ${red.value}, Green: ${green.value}, Blue: ${blue.value}\n    Opacity: ${opacity.value}`;
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

        red: ['red', 'float'],
        green: ['green', 'float'],
        blue: ['blue', 'float'],
        opacity: ['opacity', 'float'],
        clamp: ['clamp', 'raw'],
    },
});

// Setup form
const red = document.querySelector('#red'),
    green = document.querySelector('#green'),
    blue = document.querySelector('#blue'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
red.value = 1;
// @ts-expect-error
green.value = 1;
// @ts-expect-error
blue.value = 1;
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#clamp').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
