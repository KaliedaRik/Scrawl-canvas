// # Demo Modules 003
// Factory functions to create more complex, compound entitys
//
// Related files:
// + [Entity ring builder module](./modules/entity-ring-builder.html)
//
// [Run code](../../demo/modules-003.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// Import the entity ring factory
import buildEntityRing from './modules/entity-ring-builder.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    compileOrder: 1,
});


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Some gradients for our scene
const parasolGradient = scrawl.makeGradient({
    name: name('parasol-gradient'),
    endY: '100%',
    paletteEnd: 299,
    colors: [
        [0, 'red'],
        [999, 'transparent']
    ],
});

scrawl.makeGradient({
    name: name('plank-gradient'),
    endX: '100%',
    colors: [
        [0, 'gold'],
        [999, 'green']
    ],
});


// A parasol compound-entity
// + See the [entity ring builder module](./modules/entity-ring-builder.html) for an explanation of the argument attributes used to construct the compound entity
const parasol = buildEntityRing({

    namespace: 'parasol',
    canvas,
    scrawl,

    dimensions: 400,
    buildStartAngle: -20,
    buildEndAngle: 200,
    buildStepAngle: 5,
    reflectOnly: false,

    entity: scrawl.makeBlock({
        name: name('parasol-template'),
        start: ['center', 'center'],
        dimensions: [200, 18],
        method: 'fill',
        fillStyle: name('parasol-gradient'),
        lockFillStyleToEntity: true,
    }),
});

// A ring-of-planks compound-entity
const plank = buildEntityRing({

    namespace: 'plank',
    canvas,
    scrawl,

    dimensions: 600,
    buildStartAngle: -90,
    buildEndAngle: 210,
    buildStepAngle: 30,
    buildOffset: 190,
    reflectOnly: false,

    entity: scrawl.makeBlock({
        name: name('plank-template'),
        start: ['center', 'center'],
        handle: ['center', 'top'],
        dimensions: [150, 30],
        lineWidth: 2,
        fillStyle: name('plank-gradient'),
        lockFillStyleToEntity: true,
        method: 'fillThenDraw',
        delta: {
            roll: 0.3,
        },
    }),
});

// We can now use our compound entitys to create a scene
scrawl.makePicture({
    name: name('plank-picture'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    asset: plank.cell.name,
    dimensions: [600, 600],
    copyDimensions: ['100%', '100%'],
    method: 'fill',
    delta: {
        roll: -0.25,
    }
});

scrawl.makePicture({
    name: name('parasol-picture'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    asset: parasol.cell,
    dimensions: [400, 400],
    copyDimensions: ['100%', '100%'],
    method: 'fill',
    scale: 0.8,
    delta: {
        roll: 0.1,
    }
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

// And some additional animation for the parasol gradient
const ticker = scrawl.makeTicker({
    name: name('parasol-gradient-ticker'),
    cycles: 0,
    duration: '12s',
});

scrawl.makeTween({
    name: name('parasol-start-palette-tween'),
    targets: parasolGradient,
    ticker: name('parasol-gradient-ticker'),
    duration: '60%',
    time: '10%',
    reverseOnCycleEnd: true,
    definitions: [
        {
            attribute: 'paletteStart',
            start: 0,
            end: 700,
            integer: true,
            engine: 'easeOutIn',
        }
    ]
}).clone({

    name: name('parasol-end-palette-tween'),
    time: '30%',
    definitions: [
        {
            attribute: 'paletteEnd',
            start: 299,
            end: 999,
            integer: true,
            engine: 'easeOutIn',
        }
    ]
});

ticker.run();


// #### Development and testing
console.log(scrawl.library);
