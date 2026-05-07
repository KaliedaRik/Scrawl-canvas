// # Demo Filters 101
// Using assets in the filter stream; filter compositing

// [Run code](../../demo/filters-101.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addCheckerboardBackground, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the background
addCheckerboardBackground(scrawl, canvas, namespace);


// Create the assets
canvas.buildCell({

    name: name('star-cell'),
    dimensions: [400, 400],
    shown: false,
});

scrawl.makeStar({

    name: name('my-star'),
    group: name('star-cell'),
    radius1: 200,
    radius2: 100,
    roll: 60,
    points: 4,
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: 'blue',
    strokeStyle: 'red',
    lineWidth: 10,
    method: 'fillThenDraw',
});

canvas.buildCell({

    name: name('wheel-cell'),
    dimensions: [400, 400],
    shown: false,
});

scrawl.makeWheel({

    name: name('my-wheel'),
    group: name('wheel-cell'),
    radius: 150,
    startAngle: 30,
    endAngle: -30,
    includeCenter: true,
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: 'green',
    strokeStyle: 'yellow',
    lineWidth: 10,
    method: 'fillThenDraw',
    delta: {
        roll: -0.3,
    },
});


// Create the filters
scrawl.makeFilter({

    name: name('star-filter'),
    method: 'image',
    asset: name('star-cell'),
    copyWidth: 400,
    copyHeight: 400,
    lineOut: 'star',

}).clone({

    name: name('wheel-filter'),
    asset: name('wheel-cell'),
    lineOut: 'wheel',
});

const imageFilter = scrawl.makeFilter({

    name: name('flower-filter'),
    method: 'image',
    asset: 'iris',
    copyStartX: '15%',
    copyStartY: '5%',
    copyWidth: '70%',
    copyHeight: '90%',
    lineOut: 'flower',
});

console.log(imageFilter.saveAsPacket());

const composeFilter = scrawl.makeFilter({

    name: name('block-filter'),
    method: 'compose',
    lineIn: 'star',
    lineMix: 'source',
    offsetX: 0,
    offsetY: 0,
    compose: 'source-over',
});

console.log(composeFilter.saveAsPacket());


// Display the filter in a Block entity
scrawl.makeGradient({

    name: name('linear'),
    endX: '100%',
    colors: [
        [0, 'blue'],
        [495, 'red'],
        [500, 'yellow'],
        [505, 'red'],
        [999, 'green']
    ],
});

scrawl.makeBlock({

    name: name('display-block'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: ['90%', '90%'],
    roll: -20,
    lineWidth: 10,
    fillStyle: name('linear'),
    lockFillStyleToEntity: true,
    strokeStyle: 'coral',
    method: 'fillThenDraw',

    // Load in the three image filters, then the compose filter to combine two of them
    // + the results display in a Block entity!
    filters: [name('star-filter'), name('wheel-filter'), name('flower-filter'), name('block-filter')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
Line mix
    Offset - x: ${dom.comp_offset_x.value}, y: ${dom.comp_offset_y.value}
    Opacity: ${dom.opacity.value}

Flower
    Copy start x: ${dom.copyStartX.value}%
    Copy start y: ${dom.copyStartY.value}%
    Copy width: ${dom.copyWidth.value}%
    Copy height: ${dom.copyHeight.value}%
    Scale: ${dom.scale.value}
    Paste offset x: ${dom.image_offset_x.value}%
    Paste offset y: ${dom.image_offset_y.value}%`;
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
    ['input', 'comp_offset_x', '0'],
    ['input', 'comp_offset_y', '0'],
    ['input', 'opacity', '1'],
    ['select', 'source', 2],
    ['select', 'destination', 0],
    ['select', 'composite', 0],

    ['input', 'copyStartX', '15'],
    ['input', 'copyStartY', '5'],
    ['input', 'copyWidth', '70'],
    ['input', 'copyHeight', '90'],
    ['input', 'scale', '1'],
    ['input', 'image_offset_x', '0'],
    ['input', 'image_offset_y', '0'],
    ['select', 'fit', 0],
    ['select', 'smoothing', 0],
    ['select', 'positionX', 1],
    ['select', 'positionY', 1],
]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: composeFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        source: ['lineIn', 'raw'],
        destination: ['lineMix', 'raw'],
        composite: ['compose', 'raw'],
        opacity: ['opacity', 'float'],
        comp_offset_x: ['offsetX', 'round'],
        comp_offset_y: ['offsetY', 'round'],
    },
});

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.assetControlItem',

    target: imageFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        copyStartX: ['copyStartX', '%'],
        copyStartY: ['copyStartY', '%'],
        copyWidth: ['copyWidth', '%'],
        copyHeight: ['copyHeight', '%'],
        scale: ['scale', 'float'],
        fit: ['fit', 'raw'],
        smoothing: ['smoothing', 'boolean'],
        image_offset_x: ['offsetX', '%'],
        image_offset_y: ['offsetY', '%'],
        positionX: ['positionX', 'raw'],
        positionY: ['positionY', 'raw'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, imageFilter);


// #### Development and testing
console.log(scrawl.library);
