// # Demo Filters 002a
// Filters - cache output to improve render speeds

// [Run code](../../demo/filters-002a.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Create some convenience shortcut variables to various sections of the Scrawl-canvas library
const canvas = scrawl.library.canvas.mycanvas,
    filters = scrawl.library.filter,
    groups = scrawl.library.group,
    entitys = scrawl.library.entity;


// Import image from the DOM
scrawl.importDomImage('.flowers');


// Create the filters
scrawl.makeFilter({
    name: 'red',
    method: 'red',
}).clone({
    name: 'green',
    method: 'green',
}).clone({
    name: 'blue',
    method: 'blue',
}).clone({
    name: 'cyan',
    method: 'cyan',
}).clone({
    name: 'magenta',
    method: 'magenta',
}).clone({
    name: 'yellow',
    method: 'yellow',
}).clone({
    name: 'notred',
    method: 'notred',
}).clone({
    name: 'notgreen',
    method: 'notgreen',
}).clone({
    name: 'notblue',
    method: 'notblue',
}).clone({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'sepia',
    method: 'sepia',
}).clone({
    name: 'invert',
    method: 'invert',
});


// #### Original entitys
// For each filter, we shall create a Picture entity which applies that filter to the source image. To make things easier for us later on, we'll gather these entitys into their own Group
const originals = scrawl.makeGroup({

    name: 'originals',
    host: canvas.base.name,
});

scrawl.makePicture({

    name: 'red-filter',
    group: 'originals',
    asset: 'iris',

    start: [10, 10],
    dimensions: [120, 120],

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['red'],

}).clone({

    name: 'green-filter',
    startX: 140,
    filters: ['green'],

}).clone({

    name: 'blue-filter',
    startX: 270,
    filters: ['blue'],

}).clone({

    name: 'cyan-filter',
    start: [10, 140],
    filters: ['cyan'],

}).clone({

    name: 'magenta-filter',
    startX: 140,
    filters: ['magenta'],

}).clone({

    name: 'yellow-filter',
    startX: 270,
    filters: ['yellow'],

}).clone({

    name: 'notred-filter',
    start: [10, 270],
    filters: ['notred'],

}).clone({

    name: 'notgreen-filter',
    startX: 140,
    filters: ['notgreen'],

}).clone({

    name: 'notblue-filter',
    startX: 270,
    filters: ['notblue'],

}).clone({

    name: 'grayscale-filter',
    start: [10, 400],
    filters: ['grayscale'],

}).clone({

    name: 'sepia-filter',
    startX: 140,
    filters: ['sepia'],

}).clone({

    name: 'invert-filter',
    startX: 270,
    filters: ['invert'],
});


// #### Cache entitys
// We delay creating the Picture entitys that make use of the original entitys' cached output until after the first Display cycle completes. As for the original entitys, we'll store the cache entitys in their own group to make things easier for us going forward
const cache = scrawl.makeGroup({

    name: 'cache',
    host: canvas.base.name,
});

const createCachePictures = () => {

    // We can get a lot of the data for each cache entity from the original entity that it's shadowing. And we can iterate through each original entity using the originals Group object
    originals.artefacts.forEach(name => {

        const e = entitys[name];

        if (e) {

            scrawl.makePicture({

                name: `${name}-cached`,
                group: 'cache',
                asset: `${name}-image`,

                start: e.get('start'),
                handle: e.get('handle'),
                dimensions: e.get('dimensions'),
                copyDimensions: ['100%', '100%'],
            });
        }
    });
};

// We will also be displaying labels over each Picture entity to let people know which filter we've used on the Picture entity. We will position these labels using Picture entitys as pivots.
const addLabels = () => {

    // The Phrase entitys can go in the canvas element's default Group. To make sure they display correctly (after the Picture entitys have been stamped) we'll set the default Group's order attribute to a higher value
    groups[canvas.base.name].set({
        order: 1,
    });

    scrawl.makePhrase({

        name: 'red-label',
        text: 'Red',

        font: '20px sans-serif',

        fillStyle: 'white',
        lineWidth: 4,

        method: 'drawThenFill',

        pivot: 'red-filter-cached',
        lockTo: 'pivot',
        offset: [5, 5],

    }).clone({

        name: 'green-label',
        text: 'Green',
        pivot: 'green-filter-cached',

    }).clone({

        name: 'blue-label',
        text: 'Blue',
        pivot: 'blue-filter-cached',

    }).clone({

        name: 'cyan-label',
        text: 'Cyan',
        pivot: 'cyan-filter-cached',

    }).clone({

        name: 'magenta-label',
        text: 'Magenta',
        pivot: 'magenta-filter-cached',

    }).clone({

        name: 'yellow-label',
        text: 'Yellow',
        pivot: 'yellow-filter-cached',

    }).clone({

        name: 'notred-label',
        text: 'Notred',
        pivot: 'notred-filter-cached',

    }).clone({

        name: 'notgreen-label',
        text: 'Notgreen',
        pivot: 'notgreen-filter-cached',

    }).clone({

        name: 'notblue-label',
        text: 'Notblue',
        pivot: 'notblue-filter-cached',

    }).clone({

        name: 'grayscale-label',
        text: 'Grayscale',
        pivot: 'grayscale-filter-cached',

    }).clone({

        name: 'sepia-label',
        text: 'Sepia',
        pivot: 'sepia-filter-cached',

    }).clone({

        name: 'invert-label',
        text: 'Invert',
        pivot: 'invert-filter-cached',
    });
};


// #### Caching Picture entity output
// Because we need to recapture filter output whenever the user updates the filters' `opacity` attribute, we'll put these calls in a dedicated function
const cacheAction = () => {

    scrawl.createImageFromEntity(entitys['red-filter'], true);
    scrawl.createImageFromEntity(entitys['green-filter'], true);
    scrawl.createImageFromEntity(entitys['blue-filter'], true);
    scrawl.createImageFromEntity(entitys['cyan-filter'], true);
    scrawl.createImageFromEntity(entitys['magenta-filter'], true);
    scrawl.createImageFromEntity(entitys['yellow-filter'], true);
    scrawl.createImageFromEntity(entitys['notred-filter'], true);
    scrawl.createImageFromEntity(entitys['notgreen-filter'], true);
    scrawl.createImageFromEntity(entitys['notblue-filter'], true);
    scrawl.createImageFromEntity(entitys['grayscale-filter'], true);
    scrawl.createImageFromEntity(entitys['sepia-filter'], true);
    scrawl.createImageFromEntity(entitys['invert-filter'], true);
};

// Invoke the cache function before the first Display cycle
cacheAction();


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,

    // #### Caching (continued)
    // Hide the originals group; create the Picture entitys that will display the cached images, alongside the Phrase labels that describe them
    afterCreated: () => {
        originals.set({ visibility: false });
        createCachePictures();
        addLabels();
    },
});


// #### User interaction
const myFilters = [
    filters.red,
    filters.green,
    filters.blue,
    filters.cyan,
    filters.magenta,
    filters.yellow,
    filters.notred,
    filters.notgreen,
    filters.notblue,
    filters.grayscale,
    filters.sepia,
    filters.invert
];

// Update the `opacity` attribute for all the filters
scrawl.addNativeListener(['input', 'change'], (e) => {

    const val = parseFloat(e.target.value);

    myFilters.forEach(f => f.set({ opacity: val }));

    // To capture the new filtered output we need to make sure the original entitys take part in the next Display cycle. We also need to instruct them to capture the results of that Display cycle
    originals.set({ visibility: true });
    cache.set({ visibility: false });
    cacheAction();

    // We give the Display cycle sufficient time to run before again hiding the original entitys and displaying the cache entitys in their place
    setTimeout(() => {
        originals.set({ visibility: false });
        cache.set({ visibility: true });
    }, 50);

}, '#opacity');

// Setup form
const opacity = document.querySelector('#opacity');
// @ts-expect-error
opacity.value = 1;


// #### Development and testing
console.log(scrawl.library);
