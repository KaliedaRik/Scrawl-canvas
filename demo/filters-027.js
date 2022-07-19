// # Demo Filters 027 
// Filter parameters: reducePalette

// [Run code](../../demo/filters-027.html)
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

    name: 'reducePalette',
    method: 'reducePalette',
    palette: 'black-white',
});


// Create the target entity
const dithered = scrawl.makePicture({

    name: 'dithered-image',

    asset: 'iris',

    width: '50%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['reducePalette'],
});

const original = dithered.clone({

    name: 'original-image',
    startX: '50%',
    filters: [],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Minimum color distance: ${minimumColorDistance.value}\n    Opacity: ${opacity.value}`;
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

    event: ['change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        palette: ['palette', 'raw'],
        paletteString: ['palette', 'raw'],
        paletteNumber: ['palette', 'round'],
        minimumColorDistance: ['minimumColorDistance', 'round'],
        seed: ['seed', 'raw'],
        useBluenoise: ['useBluenoise', 'boolean'],
        useLabForPaletteDistance: ['useLabForPaletteDistance', 'boolean'],
        opacity: ['opacity', 'float'],
    },
});

scrawl.addNativeListener('change', (e) => {

    const val = (e.target.value === '0') ? false : true;

    dithered.set({ memoizeFilterOutput: val });

}, '#memoizeFilterOutput');


// Setup form
const opacity = document.querySelector('#opacity');
const minimumColorDistance = document.querySelector('#minimumColorDistance');

// @ts-expect-error
opacity.value = 1;
// @ts-expect-error
minimumColorDistance.value = 1000;

// @ts-expect-error
document.querySelector('#palette').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#paletteString').value = 'yellow, green, darkgreen, limegreen, olivedrab, mediumseagreen, seagreen, lightblue, darkslategray, lavender, slateblue, mediumslateblue, black, indigo, brown, antiquewhite';
// @ts-expect-error
document.querySelector('#paletteNumber').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#seed').value = 'some-random-string-or-other';
// @ts-expect-error
document.querySelector('#useBluenoise').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#useLabForPaletteDistance').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', [dithered, original]);


// #### Development and testing
console.log(scrawl.library);
