// # Demo Filters 013 
// Filter parameters: flood

// [Run code](../../demo/filters-013.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


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

    return `    Red: ${red.value}, Green: ${green.value}, Blue: ${blue.value}, Alpha: ${alpha.value}
    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Use a color object to convert between CSS hexadecimal and RGB decimal colors
const converter = scrawl.makeColor({
    name: 'converter',
});

scrawl.observeAndUpdate({

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

        reference.value = colorFactory.convertRGBtoHex(red.value, green.value, blue.value);
    },
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        const target = e.target.id,
            val = e.target.value;

        myFilter.set({ 
            reference: val, 
        });

        let [r, g, b, a] = colorFactory.extractRGBfromColor(val)

        red.value = r;
        green.value = g;
        blue.value = b;
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

opacity.value = 1;
reference.value = '#000000';
red.value = 0;
green.value = 0;
blue.value = 0;
alpha.value = 255;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
