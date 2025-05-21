// # Demo Filters 015
// Filter parameters: tiles

// [Run code](../../demo/filters-015.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('tiles'),
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

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('tiles')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Tile dimensions - width: ${dom.tile_width.value}px, height: ${dom.tile_height.value}px, radius: ${dom.tile_radius.value}px
    Origin offset - x: ${dom.offset_x.value}px, y: ${dom.offset_y.value}px
    Angle: ${dom.angle.value}
    Random points: ${dom.random_points.value}
    Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const dom = scrawl.initializeDomInputs([
    ['input', 'tile_width', '20'],
    ['input', 'tile_height', '20'],
    ['input', 'tile_radius', '14'],
    ['input', 'offset_x', '200'],
    ['input', 'offset_y', '200'],
    ['input', 'angle', '0'],
    ['input', 'random_points', '20'],
    ['input', 'opacity', '1'],
    ['select', 'points', 0],
    ['select', 'include_red', 1],
    ['select', 'include_green', 1],
    ['select', 'include_blue', 1],
    ['select', 'include_alpha', 0],
]);


// Update points value selector
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    switch (value) {

        case 'random' :
            myFilter.set({
                points: parseInt(dom.random_points.value, 10),
                tileRadius: 100,
            });
            dom.tile_radius.value = '100';
            break;

        case 'hex-grid' :
            myFilter.set({
                points: value,
                tileRadius: 20,
                tileHeight: 40,
            });
            dom.tile_radius.value = '20';
            dom.tile_height.value = '40';
            break;

        case 'rect-grid' :
            myFilter.set({
                points: value,
                tileWidth: 20,
                tileHeight: 20,
            });
            dom.tile_width.value = '20';
            dom.tile_height.value = '20';
            break;
    }
}, dom.points);


// Update random-points value range
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

        if (dom.points.value === 'random') {

            myFilter.set({
                points: parseInt(value, 10),
            });
        }
}, dom.random_points);


// Setup form observer functionality for remaining inputs/selectors
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

        include_red: ['includeRed', 'boolean'],
        include_green: ['includeGreen', 'boolean'],
        include_blue: ['includeBlue', 'boolean'],
        include_alpha: ['includeAlpha', 'boolean'],

        opacity: ['opacity', 'float'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
