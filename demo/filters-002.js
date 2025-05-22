// # Demo Filters 002
// Filters - cache entity output to improve render speeds

// [Run code](../../demo/filters-002.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
// Create some convenience shortcut variables to various sections of the Scrawl-canvas library
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

const cacheGroup = pictureGroup.clone({

    name: name('cached'),
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

    scrawl.makePicture({

        name: name(`${n}-cached`),
        group: name('cached'),

        // The assets we will create from the previous picture entitys have `-image` attached to the picture's name
        asset: name(`${n}-output-image`),

        start: positions[index],
        dimensions: [120, 120],

        copyDimensions: ['100%', '100%'],
    });

    scrawl.makeLabel({

        name: name(`${n}-label`),
        group: name('labels'),

        text: capitalize(n),

        fontString: '20px sans-serif',

        fillStyle: 'white',
        lineWidth: 4,

        method: 'drawThenFill',

        pivot: name(`${n}-cached`),
        lockTo: 'pivot',
        offset: [5, 5],
    });
});


// The cache function
let cachingInProgress = false;
const cacheAction = () => {

    if (!cachingInProgress) {

        cachingInProgress = true;

        pictureGroup.set({ visibility: true });
        cacheGroup.set({ visibility: false });

        pictureGroup.getArtefactNames().forEach(n => scrawl.createImageFromEntity(n, true));

        setTimeout(() => {

            cachingInProgress = false;

            pictureGroup.set({ visibility: false });
            cacheGroup.set({ visibility: true });

        }, 50);
    }
};


// Run the initial caching action
cacheAction();


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
const dom = scrawl.initializeDomInputs([
    ['input', 'opacity', '1'],
]);


// Updating the Filter objects for opacity
scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = parseFloat(e.target.value);
    filters.forEach(f => f.set({ opacity: val }));

    cacheAction();

}, dom.opacity);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, pictureGroup, cacheAction);


// #### Development and testing
console.log(scrawl.library);
