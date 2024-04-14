// # Demo Filters 002
// Filter parameters: red, green, blue, cyan, magenta, yellow, notred, notgreen, notblue, grayscale, sepia, invert

// [Run code](../../demo/filters-002.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Preparation
const filterMethods = [
    'red',       'green',    'blue',
    'cyan',      'magenta',  'yellow',
    'notred',    'notgreen', 'notblue',
    'grayscale', 'sepia',    'invert'
];

const positions = [
    [10, 10],  [140, 10],  [270, 10],
    [10, 140], [140, 140], [270, 140],
    [10, 270], [140, 270], [270, 270],
    [10, 400], [140, 400], [270, 400],
];

const filters = [];

const pictureGroup = scrawl.makeGroup({

    name: name('pictures'),
    host: canvas.getBase(),
});

pictureGroup.clone({

    name: name('labels'),
});


const capitalize = (item) => item[0].toUpperCase() + item.slice(1);


// Build out the filters and entitys
filterMethods.forEach((n, index) => {

    filters.push(scrawl.makeFilter({

        name: name(`${n}-filter`),
        method: n,
    }));

    scrawl.makePicture({

        name: name(`${n}-output`),
        group: name('pictures'),

        asset: 'iris',

        start: positions[index],
        dimensions: [120, 120],

        copyDimensions: ['100%', '100%'],

        filters: [name(`${n}-filter`)],
    });

    scrawl.makeLabel({

        name: name(`${n}-label`),
        group: name('labels'),

        text: capitalize(n),

        fontString: '20px sans-serif',

        fillStyle: 'white',
        lineWidth: 4,

        method: 'drawThenFill',

        pivot: name(`${n}-output`),
        lockTo: 'pivot',
        offset: [5, 5],
    });
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
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
const dom = initializeDomInputs([
    ['input', 'opacity', '1'],
    ['select', 'memoizeFilterOutput', 0],
]);


// Updating the Picture entitys for memoizeFilterOutput
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: dom.memoizeFilterOutput,

    target: pictureGroup,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        memoizeFilterOutput: ['memoizeFilterOutput', 'boolean'],
    },
});


// Updating the Filter objects for opacity
scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = parseFloat(e.target.value);
    filters.forEach(f => f.set({ opacity: val }));

}, dom.opacity);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', pictureGroup);


// #### Development and testing
console.log(scrawl.library);
