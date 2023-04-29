// # Demo Filters 013 
// Filter parameters: flood

// [Run code](../../demo/filters-013.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

const colorFactory = scrawl.makeColor({
    name: 'my-color-factory',
});


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'flood',
    method: 'flood',

    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
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

    filters: ['flood'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Red: ${red.value}, Green: ${green.value}, Blue: ${blue.value}, Alpha: ${alpha.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        red: ['red', 'int'],
        green: ['green', 'int'],
        blue: ['blue', 'int'],
        alpha: ['alpha', 'int'],
        opacity: ['opacity', 'float'],
    },

    callback: () => {

// @ts-expect-error
        reference.value = colorFactory.convertRGBtoHex(red.value, green.value, blue.value);
    },
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        const val = e.target.value;

        myFilter.set({ 
            reference: val, 
        });

        const [r, g, b, a] = colorFactory.extractRGBfromColor(val)

// @ts-expect-error
        red.value = r;
// @ts-expect-error
        green.value = g;
// @ts-expect-error
        blue.value = b;
// @ts-expect-error
        alpha.value = Math.round(a * 255);
    }
}, '.colorSelector');


// Setup form
const opacity = document.querySelector('#opacity'),
    reference = document.querySelector('#reference'),
    red = document.querySelector('#red'),
    green = document.querySelector('#green'),
    blue = document.querySelector('#blue'),
    alpha = document.querySelector('#alpha');

// @ts-expect-error
opacity.value = 1;
// @ts-expect-error
reference.value = '#000000';
// @ts-expect-error
red.value = 0;
// @ts-expect-error
green.value = 0;
// @ts-expect-error
blue.value = 0;
// @ts-expect-error
alpha.value = 255;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
