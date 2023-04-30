// # Demo Filters 027
// Filter parameters: reducePalette

// [Run code](../../demo/filters-027.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas1 = scrawl.library.canvas['canvas-1'];
const canvas2 = scrawl.library.canvas['canvas-2'];

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'reducePalette',
    method: 'reducePalette',
    palette: 'black-white',
});


// Create the target entity
const dithered = scrawl.makePicture({

    name: 'dithered-image',
    group: canvas1.base.name,
    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['reducePalette'],
});

const original = dithered.clone({

    name: 'original-image',
    group: canvas2.base.name,
    filters: [],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Commonest colors: ${commonestColors.value}\n    Minimum color distance: ${minimumColorDistance.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: [canvas1, canvas2],
});

scrawl.makeRender({

    name: "demo-reporter",
    noTarget: true,
    afterShow: report,
});


// #### User interaction
scrawl.makeUpdater({

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
        noiseType: ['noiseType', 'raw'],
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
const commonestColors = document.querySelector('#paletteNumber');

// @ts-expect-error
opacity.value = 1;
// @ts-expect-error
minimumColorDistance.value = 1000;
// @ts-expect-error
commonestColors.value = 10;

// @ts-expect-error
document.querySelector('#palette').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#memoizeFilterOutput').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#paletteString').value = 'yellow, green, darkgreen, limegreen, olivedrab, mediumseagreen, seagreen, lightblue, darkslategray, lavender, slateblue, mediumslateblue, black, indigo, brown, antiquewhite';
// @ts-expect-error
document.querySelector('#paletteNumber').value = 16;
// @ts-expect-error
document.querySelector('#seed').value = 'some-random-string-or-other';
// @ts-expect-error
document.querySelector('#noiseType').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#useLabForPaletteDistance').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop([canvas1, canvas2], '#my-image-store', [dithered, original]);


// #### Development and testing
console.log(scrawl.library);
