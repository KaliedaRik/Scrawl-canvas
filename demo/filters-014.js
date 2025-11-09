// # Demo Filters 014
// Filter parameters: areaAlpha

// [Run code](../../demo/filters-014.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, addCheckerboardBackground } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the background
addCheckerboardBackground(scrawl, canvas, namespace);


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('areaAlpha'),
    method: 'areaAlpha',

    tileWidth: 10,
    tileHeight: 10,
    gutterWidth: 10,
    gutterHeight: 10,
    offsetX: 0,
    offsetY: 0,
    areaAlphaLevels: [255, 255, 0, 0],
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('areaAlpha')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Tile dimensions - width: ${dom.tile_width.value}, height: ${dom.tile_height.value}
    Gutter dimensions - width: ${dom.gutter_width.value}, height: ${dom.gutter_height.value}
    Offset - x: ${dom.offset_x.value}, y: ${dom.offset_y.value}
    areaAlphaLevels array: [${dom.alpha_0.value}, ${dom.alpha_1.value}, ${dom.alpha_2.value}, ${dom.alpha_3.value}]
    Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = scrawl.initializeDomInputs([
    ['input', 'tile_width', '10'],
    ['input', 'tile_height', '10'],
    ['input', 'gutter_width', '10'],
    ['input', 'gutter_height', '10'],
    ['input', 'alpha_0', '255'],
    ['input', 'alpha_1', '0'],
    ['input', 'alpha_2', '255'],
    ['input', 'alpha_3', '0'],
    ['input', 'offset_x', '0'],
    ['input', 'offset_y', '0'],
    ['input', 'opacity', '1'],
]);


// Handle alpha-related user input
scrawl.addNativeListener(['input', 'change'], function () {

    const a0 = parseInt(dom.alpha_0.value, 10),
        a1 = parseInt(dom.alpha_1.value, 10),
        a2 = parseInt(dom.alpha_2.value, 10),
        a3 = parseInt(dom.alpha_3.value, 10);

    myFilter.set({ areaAlphaLevels: [a0, a2, a1, a3] });

}, '.alphas');


// Handle other user input
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        tile_width: ['tileWidth', 'round'],
        tile_height: ['tileHeight', 'round'],
        gutter_width: ['gutterWidth', 'round'],
        gutter_height: ['gutterHeight', 'round'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
