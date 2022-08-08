// # Demo Filters 105 
// Use entitys to generate points for the tiles filter

// [Run code](../../demo/filters-105.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'tiles',
    method: 'tiles',
    tileRadius: 50,
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


// Create the line spiral
const spiral = scrawl.makeLineSpiral({

    name: 'points-from-spiral',
    start: [200, 200],
    handle: ['center', 'center'],
    radiusIncrement: 0.05,
    radiusIncrementAdjust: 1,
    stepLimit: 1500,
    useAsPath: true,
    method: 'draw',
    globalAlpha: 0.3,
});


// To make show/hide for the paths (once we have more than one of them) easier
const pathGroup = scrawl.makeGroup({

    name: 'paths-group',

}).addArtefacts('points-from-spiral');


// Current paths, and their shared step distance
// TODO: add more path options, for testing/general interest
let distance = 50,
    currentPaths = spiral.name;


// Update filter with spiral points data
const getPointsFromSpiral = () => {

    const len = spiral.length,
        step = (1 / (Math.floor(len / distance))),
        points = [],
        coord = scrawl.requestCoordinate(),
        pos = spiral.get('position');

    let x, y;

    for (let i = step; i <= 1; i += step) {

        [x, y] = coord.setFromVector(spiral.getPathPositionData(i)).subtract(pos);
// @ts-expect-error
        points.push(Math.round(x), Math.round(y));
    }
    [x, y] = coord.setFromVector(spiral.getPathPositionData(0.00000001)).subtract(pos);
// @ts-expect-error
    points.push(Math.round(x), Math.round(y));

    [x, y] = coord.setFromVector(spiral.getPathPositionData(0.99999999)).subtract(pos);
// @ts-expect-error
    points.push(Math.round(x), Math.round(y));

    scrawl.releaseCoordinate(coord);

    myFilter.set({ points });
};

const updateFilterPoints = () => {

    switch (currentPaths) {

        case spiral.name :
            getPointsFromSpiral();
            break;
    }
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Tile dimensions - radius: ${tile_radius.value}px\n    Origin offset - x: ${offset_x.value}px y: ${offset_y.value}px\n    Step along path: ${distance}\n    Spiral: radiusIncrement: ${spiralRadius.value}; radiusIncrementAdjust: ${spiralRadiusAdjust.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
    afterCreated: updateFilterPoints,
});


// #### User interaction
// Filter updates
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.filter-control',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        opacity: ['opacity', 'float'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        tile_radius: ['tileRadius', 'round'],
    },
});

// Update step limit along paths
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    distance = parseInt(value, 10);

    updateFilterPoints();

}, '#path-step');

// Show or hide the paths
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    pathGroup.setArtefacts({
        method: (value === 'show') ? 'draw' : 'none',
    });

}, '#show-path');

// Move the paths
scrawl.addNativeListener(['change', 'input'], (e) => {

    pathGroup.setArtefacts({
// @ts-expect-error
        start: [parseInt(offset_x.value, 10), parseInt(offset_y.value, 10)],
    });

}, '.move-paths');

// LineSpiral adjustments
scrawl.addNativeListener(['change', 'input'], (e) => {

    spiral.set({
// @ts-expect-error
        radiusIncrement: parseFloat(spiralRadius.value),
// @ts-expect-error
        radiusIncrementAdjust: parseFloat(spiralRadiusAdjust.value),
    });

    updateFilterPoints();

}, '.spiral-control');


// Setup form
const pathStep = document.querySelector('#path-step'),
    offset_x = document.querySelector('#offset_x'),
    offset_y = document.querySelector('#offset_y'),
    tile_radius = document.querySelector('#tile_radius'),
    opacity = document.querySelector('#opacity'),
    spiralRadius = document.querySelector('#spiral-radius'),
    spiralRadiusAdjust = document.querySelector('#spiral-radius-adjust'),
    showPath = document.querySelector('#show-path');

// @ts-expect-error
pathStep.value = 50;
// @ts-expect-error
opacity.value = 1;
// @ts-expect-error
showPath.value = 'show';
// @ts-expect-error
offset_x.value = 200;
// @ts-expect-error
offset_y.value = 200;
// @ts-expect-error
tile_radius.value = 50;
// @ts-expect-error
spiralRadius.value = 0.05;
// @ts-expect-error
spiralRadiusAdjust.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
