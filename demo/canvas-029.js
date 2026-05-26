// # Demo Canvas 029
// Image smoothing

// [Run code](../../demo/canvas-029.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


scrawl.importDomImage('.flowers');


canvas.buildCell({

    name: name('text-cell'),
    dimensions: [100, 100],
    shown: false,
});


scrawl.makeLabel({

    name: name('hello-world-in-cell'),
    group: name('text-cell'),

    text: 'Hello world!',

    start: ['center', 'center'],
    handle: ['center', 'center'],
});


scrawl.makePicture({

    name: name('flower'),
    asset: 'iris',

    start: [3, 3],
    dimensions: [297, 297],

    copyStart: [200, 200],
    copyDimensions: [50, 50],

    lineWidth: 6,
    strokeStyle: 'gold',

    method: 'fillThenDraw',

}).clone({

    name: name('hello'),
    asset: name('text-cell'),

    start: [300, 300],
    dimensions: [297, 297],

    copyStart: [15, 15],
    copyDimensions: [70, 70],
});

scrawl.makeLabel({

    name: name('hello-world-in-base-1'),

    text: 'Hello world!',

    start: ['25%', '60%'],
    handle: ['center', 'center'],

}).clone({

    name: name('hello-world-in-base-2'),
    startY: '70%',
    scale: 2,

}).clone({

    name: name('hello-world-in-base-3'),
    startY: '85%',
    scale: 4.5,
});

scrawl.makePattern({

    name: name('bunny-pattern'),
    imageSource: 'img/bunny.png',
    patternStretchX: 3,
    patternStretchY: 3,
});

scrawl.makeBlock({

    name: name('pattern-block'),

    start: [300, 3],
    dimensions: [297, 297],

    lineWidth: 6,
    fillStyle: name('bunny-pattern'),
    strokeStyle: 'gold',

    method: 'fillThenDraw',
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


// #### Development and testing
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas.get('baseName'),
    targetLibrarySection: 'group',

    useNativeListener: true,
    preventDefault: true,

    updates: {

        imageSmoothingEnabled: ['imageSmoothingEnabled', 'boolean'],
        imageSmoothingQuality: ['imageSmoothingQuality', 'raw'],
    },
});


// Setup form
scrawl.initializeDomInputs([
    ['select', 'imageSmoothingEnabled', 1],
    ['select', 'imageSmoothingQuality', 2],
]);


console.log(scrawl.library);
