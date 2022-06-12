// # Demo Filters 014 
// Filter parameters: areaAlpha

// [Run code](../../demo/filters-014.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'areaAlpha',
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

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['areaAlpha'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Tile dimensions - width: ${tile_width.value} height: ${tile_height.value}\n    Gutter dimensions - width: ${gutter_width.value} height: ${gutter_height.value}\n    Offset - x: ${offset_x.value} y: ${offset_y.value}\n    areaAlphaLevels array: [${alpha_0.value}, ${alpha_1.value}, ${alpha_2.value}, ${alpha_3.value}]\n    Opacity: ${opacity.value}`;
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

        tile_width: ['tileWidth', 'round'],
        tile_height: ['tileHeight', 'round'],
        gutter_width: ['gutterWidth', 'round'],
        gutter_height: ['gutterHeight', 'round'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        opacity: ['opacity', 'float'],
    },
});

scrawl.addNativeListener(['input', 'change'], function (e) {

// @ts-expect-error
    let a0 = parseInt(alpha_0.value, 10),
// @ts-expect-error
        a1 = parseInt(alpha_1.value, 10),
// @ts-expect-error
        a2 = parseInt(alpha_2.value, 10),
// @ts-expect-error
        a3 = parseInt(alpha_3.value, 10);

        myFilter.set({
            areaAlphaLevels: [a0, a2, a1, a3],
        });

}, '.alphas');

// Setup form
const tile_width = document.querySelector('#tile_width'),
    tile_height = document.querySelector('#tile_height'),
    gutter_width = document.querySelector('#gutter_width'),
    gutter_height = document.querySelector('#gutter_height'),
    alpha_0 = document.querySelector('#alpha_0'),
    alpha_1 = document.querySelector('#alpha_1'),
    alpha_2 = document.querySelector('#alpha_2'),
    alpha_3 = document.querySelector('#alpha_3'),
    offset_x = document.querySelector('#offset_x'),
    offset_y = document.querySelector('#offset_y'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
tile_width.value = 10;
// @ts-expect-error
tile_height.value = 10;
// @ts-expect-error
gutter_width.value = 10;
// @ts-expect-error
gutter_height.value = 10;
// @ts-expect-error
offset_x.value = 0;
// @ts-expect-error
offset_y.value = 0;
// @ts-expect-error
opacity.value = 1;
// @ts-expect-error
alpha_0.value = 255;
// @ts-expect-error
alpha_1.value = 0;
// @ts-expect-error
alpha_2.value = 255;
// @ts-expect-error
alpha_3.value = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
