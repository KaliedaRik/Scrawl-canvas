// # Demo Filters 105
// Use entitys to generate points for the tiles filter

// [Run code](../../demo/filters-105.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const plainCanvas = scrawl.findCanvas('plain-canvas');
const plainNamespace = plainCanvas.name;
const plainName = (n) => `${plainNamespace}-${n}`;

const filteredCanvas = scrawl.findCanvas('filtered-canvas');
const filteredNamespace = filteredCanvas.name;
const filteredName = (n) => `${filteredNamespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: filteredName('tiles'),
    method: 'tiles',
    tileRadius: 50,
    offsetX: 200,
    offsetY: 200,
});

// Create the target entity
const plainImg = scrawl.makePicture({

    name: plainName('image'),
    group: plainCanvas.get('baseName'),

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',
});

const filteredImg = plainImg.clone({

    name: filteredName('image'),
    group: filteredCanvas.get('baseName'),
    filters: [filteredName('tiles')],
});


// Create the line spiral
const spiral = scrawl.makeLineSpiral({

    name: filteredName('points-from-spiral'),
    group: filteredCanvas.get('baseName'),
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

    name: filteredName('paths-group'),

}).addArtefacts(spiral);


// Current paths, and their shared step distance
// TODO: add more path options, for testing/general interest
let distance = 50;
const currentPaths = spiral.name;


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
/** @ts-expect-error */
        points.push(Math.round(x), Math.round(y));
    }
    [x, y] = coord.setFromVector(spiral.getPathPositionData(0.00000001)).subtract(pos);
/** @ts-expect-error */
    points.push(Math.round(x), Math.round(y));

    [x, y] = coord.setFromVector(spiral.getPathPositionData(0.99999999)).subtract(pos);
/** @ts-expect-error */
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

    return `
    Tile dimensions - radius: ${dom.tile_radius.value}px
    Origin offset - x: ${dom.offset_x.value}px, y: ${dom.offset_y.value}px
    Step along path: ${distance}
    Spiral: radiusIncrement: ${dom.spiral_radius.value}, radiusIncrementAdjust: ${dom.spiral_radius_adjust.value}, Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({
    name: plainName('animation'),
    target: plainCanvas,
});

scrawl.makeRender({
    name: filteredName('animation'),
    target: filteredCanvas,
    afterShow: report,
    afterCreated: updateFilterPoints,
});


// #### User interaction
// Setup form
const dom = initializeDomInputs([
    ['input', 'path_step', '50'],
    ['input', 'offset_x', '200'],
    ['input', 'offset_y', '200'],
    ['input', 'tile_radius', '50'],
    ['input', 'spiral_radius', '0.04'],
    ['input', 'spiral_radius_adjust', '1'],
    ['input', 'opacity', '1'],
    ['select', 'show_path', 1],
    ['select', 'points', 0],
]);


// Filter updates
scrawl.makeUpdater({

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

}, '#path_step');

// Show or hide the paths
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    pathGroup.setArtefacts({
        method: (value === 'show') ? 'draw' : 'none',
    });

}, '#show_path');

// Move the paths
scrawl.addNativeListener(['change', 'input'], () => {

    pathGroup.setArtefacts({
        start: [parseInt(dom.offset_x.value, 10), parseInt(dom.offset_y.value, 10)],
    });

}, '.move-paths');

// LineSpiral adjustments
scrawl.addNativeListener(['change', 'input'], () => {

    spiral.set({
        radiusIncrement: parseFloat(dom.spiral_radius.value),
        radiusIncrementAdjust: parseFloat(dom.spiral_radius_adjust.value),
    });

    updateFilterPoints();

}, '.spiral-control');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop([plainCanvas, filteredCanvas], `#${plainNamespace} .assets`, [plainImg, filteredImg]);


// #### Development and testing
console.log(scrawl.library);
