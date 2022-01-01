// # Demo Filters 020 
// Parameters for: clampChannels filter

// [Run code](../../demo/filters-020.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'clamp',
    method: 'clampChannels',

    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,
    highRed: 255,
    highGreen: 255,
    highBlue: 255,
    opacity: 1,
});

const colorFactory = scrawl.makeColor({
    name: 'my-color-factory',
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

    filters: ['clamp'],
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Red - low: ${lowRed.value}; high - ${highRed.value}
    Green - low: ${lowGreen.value}; high - ${highGreen.value}
    Blue - low: ${lowBlue.value}; high - ${highBlue.value}
    Color - low: ${lowColor.value}; high: ${highColor.value}
    Opacity - ${opacity.value}`;
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

        'low-red': ['lowRed', 'round'],
        'low-green': ['lowGreen', 'round'],
        'low-blue': ['lowBlue', 'round'],
        'high-red': ['highRed', 'round'],
        'high-green': ['highGreen', 'round'],
        'high-blue': ['highBlue', 'round'],
        'opacity': ['opacity', 'float'],
    },

    callback: () => {

        lowColor.value = colorFactory.convertRGBtoHex(lowRed.value, lowGreen.value, lowBlue.value);
        highColor.value = colorFactory.convertRGBtoHex(highRed.value, highGreen.value, highBlue.value);
    },
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        const target = e.target.id,
            val = e.target.value;

        let [r, g, b] = colorFactory.extractRGBfromColor(val)

        if ('low-color' === target) {

            myFilter.set({ lowColor: val });

            lowRed.value = r;
            lowGreen.value = g;
            lowBlue.value = b;
        }
        else if ('high-color' === target) {
            
            myFilter.set({ highColor: val });

            highRed.value = r;
            highGreen.value = g;
            highBlue.value = b;
        }
    }
}, '.colorSelector');

// Setup form
const lowRed = document.querySelector('#low-red'),
    lowGreen = document.querySelector('#low-green'),
    lowBlue = document.querySelector('#low-blue'),
    highRed = document.querySelector('#high-red'),
    highGreen = document.querySelector('#high-green'),
    highBlue = document.querySelector('#high-blue'),
    lowColor = document.querySelector('#low-color'),
    highColor = document.querySelector('#high-color'),
    opacity = document.querySelector('#opacity');

lowRed.value = 0;
lowGreen.value = 0;
lowBlue.value = 0;
highRed.value = 255;
highGreen.value = 255;
highBlue.value = 255;
lowColor.value = '#000000';
highColor.value = '#ffffff';
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
