// # Demo Filters 105
// Use entitys to generate points for the tiles filter

// [Run code](../../demo/filters-105.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


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
    mode: 'points',
    // hexRadius: 50,
    // offsetX: 200,
    // offsetY: 200,
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

    const pointsData = [],
        len = spiral.length,
        step = (1 / (Math.floor(len / distance)));

    for (let i = step, pos; i < 1; i += step) {

        pos = spiral.getPathPositionData(i);

        pointsData.push(pos.x, pos.y);
    }

    myFilter.set({ pointsData });
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
    Step along path: ${distance}
    Spiral: radiusIncrement: ${dom.spiral_radius.value}, radiusIncrementAdjust: ${dom.spiral_radius_adjust.value}
    Opacity: ${dom.opacity.value}`;
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
const dom = scrawl.initializeDomInputs([
    ['input', 'path_step', '50'],
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

// LineSpiral adjustments
scrawl.addNativeListener(['change', 'input'], () => {

    spiral.set({
        radiusIncrement: parseFloat(dom.spiral_radius.value),
        radiusIncrementAdjust: parseFloat(dom.spiral_radius_adjust.value),
    });

    updateFilterPoints();

}, '.spiral-control');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, [plainCanvas, filteredCanvas], `#${plainNamespace} .assets`, [plainImg, filteredImg]);


// #### Development and testing
console.log(scrawl.library);
