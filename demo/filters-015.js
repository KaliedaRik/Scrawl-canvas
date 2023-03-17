// # Demo Filters 015 
// Filter parameters: tiles

// [Run code](../../demo/filters-015.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'tiles',
    method: 'tiles',

    points: 'rect-grid',

    tileWidth: 20,
    tileHeight: 20,
    tileRadius: 14,
    offsetX: 200,
    offsetY: 200,
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

    filters: ['tiles'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Tile dimensions - width: ${tile_width.value}px height: ${tile_height.value}px radius: ${tile_radius.value}px\n    Origin offset - x: ${offset_x.value}px y: ${offset_y.value}px\n    Angle: ${angle.value}\n    Random points: ${randomPoints.value}\n    Opacity: ${opacity.value}`;
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

        tile_width: ['tileWidth', 'round'],
        tile_height: ['tileHeight', 'round'],
        tile_radius: ['tileRadius', 'round'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        angle: ['angle', 'round'],

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],

        opacity: ['opacity', 'float'],
    },
});

// Update points value selector
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    switch (value) {

        case 'random' :
            myFilter.set({
// @ts-expect-error
                points: parseInt(randomPoints.value, 10),
                tileRadius: 100,
            });
// @ts-expect-error
            tile_radius.value = 100;
            break;

        case 'hex-grid' :
            myFilter.set({
                points: value,
                tileRadius: 20,
                tileHeight: 40,
            });
// @ts-expect-error
            tile_radius.value = 20;
// @ts-expect-error
            tile_height.value = 40;
            break;

        case 'rect-grid' :
            myFilter.set({
                points: value,
                tileWidth: 20,
                tileHeight: 20,
            });
// @ts-expect-error
            tile_width.value = 20;
// @ts-expect-error
            tile_height.value = 20;
            break;
    }
}, '#points');

// Update random-points value range
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

// @ts-expect-error
        if (points.value === 'random') {

            myFilter.set({
                points: parseInt(value, 10),
            });
        }
}, '#random-points');


// Setup form
const points = document.querySelector('#points'),
    tile_width = document.querySelector('#tile_width'),
    tile_height = document.querySelector('#tile_height'),
    tile_radius = document.querySelector('#tile_radius'),
    offset_x = document.querySelector('#offset_x'),
    offset_y = document.querySelector('#offset_y'),
    angle = document.querySelector('#angle'),
    randomPoints = document.querySelector('#random-points'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
points.value = 'rect-grid';
// @ts-expect-error
tile_width.value = 20;
// @ts-expect-error
tile_height.value = 20;
// @ts-expect-error
tile_radius.value = 14;
// @ts-expect-error
offset_x.value = 200;
// @ts-expect-error
offset_y.value = 200;
// @ts-expect-error
angle.value = 0;
// @ts-expect-error
randomPoints.value = 20;
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#includeRed').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeGreen').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeBlue').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#includeAlpha').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
