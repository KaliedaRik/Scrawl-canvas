// # Demo Filters 037
// Parameters for: negative filter

// [Run code](../../demo/filters-037.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('luminanceToAlpha'),
    method: 'luminanceToAlpha',

}).clone({

    name: name('alphaToLuminance'),
    method: 'alphaToLuminance',
});

scrawl.makeFilter({

    name: name('channelsToAlpha'),
    method: 'channelsToAlpha',

}).clone({

    name: name('floodToBlack'),
    method: 'flood',
    excludeAlpha: true,
});

scrawl.makeFilter({

    name: name('alphaToChannels'),
    method: 'alphaToChannels',

}).clone({

    name: name('gray'),
    method: 'gray',

}).clone({

    name: name('grayscale'),
    method: 'grayscale',

});


// Create the target entitys
const myPictures = scrawl.makeGroup({

    name: name('pictures-group'),
    host: canvas.base,
});

const piccy = scrawl.makePicture({

    name: name('luminanceToAlpha-image'),
    group: myPictures,
    asset: 'iris',
    dimensions: [300, 300],
    copyDimensions: ['100%', '100%'],

    filters: [name('luminanceToAlpha')],
    memoizeFilterOutput: true,
});

piccy.clone({

    name: name('reversed-luminanceToAlpha-image'),
    startY: 300,

    filters: [name('luminanceToAlpha'), name('alphaToLuminance')],
});

piccy.clone({

    name: name('channelsToAlpha-image'),
    startX: 300,

    filters: [name('channelsToAlpha'), name('floodToBlack')],
});

piccy.clone({

    name: name('reversed-channelsToAlpha-image'),
    startX: 300,
    startY: 300,

    filters: [name('channelsToAlpha'), name('floodToBlack'), name('alphaToChannels')],
});

piccy.clone({

    name: name('gray-image'),
    startX: 600,

    filters: [name('gray')],
});

piccy.clone({

    name: name('grayscale-image'),
    startX: 600,
    startY: 300,

    filters: [name('grayscale')],
});

const furniture = scrawl.makeGroup({

    name: name('furniture'),
    host: canvas.base,
});

scrawl.makeBlock({

    name: name('divider-1'),
    group: furniture,
    dimensions: ['100%', 1],
    startY: 300,

    fillStyle: 'yellow',

}).clone({

    name: name('divider-2'),
    dimensions: [1, '100%'],
    startX: 300,
    startY: 0,

}).clone({

    name: name('divider-3'),
    startX: 600,
});

scrawl.makeLabel({

    name: name('label-1'),
    group: furniture,
    text: '1',
    fontString: '30px sans-serif',
    fillStyle: 'yellow',
    pivot: name('luminanceToAlpha-image'),
    lockTo: 'pivot',
    handle: [-6, -2],

}).clone({

    name: name('label-2'),
    text: '2',
    pivot: name('reversed-luminanceToAlpha-image'),

}).clone({

    name: name('label-3'),
    text: '3',
    pivot: name('channelsToAlpha-image'),

}).clone({

    name: name('label-4'),
    text: '4',
    pivot: name('reversed-channelsToAlpha-image'),

}).clone({

    name: name('label-5'),
    text: '5',
    pivot: name('gray-image'),

}).clone({

    name: name('label-6'),
    text: '6',
    pivot: name('grayscale-image'),
});



// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = initializeDomInputs([
    ['select', 'memoizeFilterOutput', 1],
]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: dom.memoizeFilterOutput,

    target: myPictures,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        memoizeFilterOutput: ['memoizeFilterOutput', 'boolean'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, myPictures);


// #### Development and testing
console.log(scrawl.library);
