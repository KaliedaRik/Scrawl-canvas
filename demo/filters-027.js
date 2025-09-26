// # Demo Filters 027
// Filter parameters: reducePalette

// [Run code](../../demo/filters-027.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas1 = scrawl.findCanvas('canvas-1');
const canvas2 = scrawl.findCanvas('canvas-2');


// Namespacing boilerplate
const namespace1 = canvas1.name;
const namespace2 = canvas2.name;
const name1 = (n) => `${namespace1}-${n}`;
const name2 = (n) => `${namespace2}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name1('reduce-palette'),
    method: 'reducePalette',
    palette: 'black-white',
    noiseType: 'bluenoise',
});


// Create the target entity
const dithered = scrawl.makePicture({

    name: name1('dithered-image'),
    group: canvas1.get('baseGroup'),
    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: [name1('reduce-palette')],
});

const original = dithered.clone({

    name: name2('original-image'),
    group: canvas2.get('baseGroup'),
    filters: [],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let LUP = scrawl.getLastUsedReducePalette();
    if (Array.isArray(LUP)) LUP = JSON.stringify(LUP);
    console.log(LUP);

    return `
    Commonest colors: ${dom.paletteNumber.value}
    Minimum color distance: ${dom.minimumColorDistance.value}
    Opacity: ${dom.opacity.value}

Last used palette:
    ${LUP}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'animation',
    target: [canvas1, canvas2],
});

scrawl.makeRender({

    name: 'reporter',
    noTarget: true,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = scrawl.initializeDomInputs([
    ['input', 'paletteNumber', '16'],
    ['input', 'minimumColorDistance', '10'],
    ['input', 'opacity', '1'],
    ['input', 'paletteString', 'rgb(255 0 0), rgb(0 255 0), rgb(0 0 255), rgb(255 255 0), rgb(0 0 0), rgb(255 255 255)'],
    ['input', 'seed', 'some-random-string-or-other'],
    ['select', 'memoizeFilterOutput', 0],
    ['select', 'noiseType', 2],
    ['select', 'palette', 0],
]);


// Handle memoizeFilterOutput input
scrawl.addNativeListener('change', (e) => {

    if (e && e.target) {

        const val = (e.target.value === '0') ? false : true;
        dithered.set({ memoizeFilterOutput: val });
    }

}, dom.memoizeFilterOutput);


// Handle all other user input
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
        opacity: ['opacity', 'float'],
    },
});



// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, [canvas1, canvas2], `#${namespace2} .assets`, [dithered, original]);


// #### Development and testing
console.log(scrawl.library);
