// # Demo Canvas 045
// Use clipping entitys as pivots; clipping entitys and cascade events

// [Run code](../../demo/canvas-045.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Get image
scrawl.importDomImage('.ohara-koson');


// First interaction - when user moves their mouse across the bird in its bough, wheels will spin
const spinFactory = function (namespace, radius, order, duration, clockwise) {

    const name = (n) => `${namespace}-${n}`;

    scrawl.makeGroup({

        name: name('group'),
        host: canvas.base,
        order,
    });

    const clipper = scrawl.makeWheel({

        name: name(`clip-${radius}`),
        group: name('group'),
        start: [200, 250],
        handle: ['center', 'center'],
        radius,
        method: 'clip',

        onEnter: () => !tween.isRunning() && tween.run(),
        onLeave: () => !tween.isRunning() && tween.run(),
    });

    const tween = scrawl.makeTween({

        name: name(`tween-${radius}`),
        targets: name(`clip-${radius}`),
        duration,
        definitions: [
            {
                attribute: 'roll',
                start: (clockwise) ? 0 : 360,
                end: (clockwise) ? 360 : 0,
                engine: 'easeOutIn',
            },
        ],
    });

    scrawl.makePicture({

        name: name(`hoop-${radius}`),
        group: name('group'),
        asset: 'songbird',

        pivot: name(`clip-${radius}`),
        addPivotRotation: true,
        lockTo: 'pivot',

        handle: ['center', 'center'],
        dimensions: [radius * 2, radius * 2],
        copyDimensions: [radius * 2, radius * 2],
        copyStart: [200 - radius, 250 - radius],
    });

    return clipper;
}

spinFactory(name('outer-ring'), 170, 1, '4s', true);
spinFactory(name('thin-ring'), 130, 2, '2.6s', true);
spinFactory(name('thick-ring'), 120, 3, '5.3s', false);
spinFactory(name('inner-ring'), 60, 4, '4s', true);
spinFactory(name('center'), 20, 5, '4s', false);


// Second interaction - when the user moves their mouse across the signature area, details about the painting will fade into view
scrawl.makeBlock({

    name: name('details-trigger'),
    start: ['5%', '70%'],
    dimensions: ['80%', '22%'],
    method: 'none',
    onEnter: () => !detailsTween.isRunning() && detailsTween.run(),
});

scrawl.makeEnhancedLabel({

    name: name('painting-details'),
    layoutTemplate: name('details-trigger'),
    fontString: '15px Arial, sans-serif',
    justifyLine: 'end',
    fillStyle: 'gray',
    globalAlpha: 0,
    order: 8,
    text: 'Songbird and flowering camellia (1910 - 1930) <span style="font-style: italic;">Ohara Koson (Japanese, 1877-1945)</span>',
});

const detailsTween = scrawl.makeTween({

    name: name('show-details'),
    targets: name('painting-details'),
    duration: 5000,
    cycles: 2,
    reverseOnCycleEnd: true,

    definitions: [
        {
            attribute: 'globalAlpha',
            start: 0,
            end: 1,
            engine: 'easeIn5',
        },
    ],
});


// Complete the painting by adding in the non-interactive bits
scrawl.makePicture({

    name: name('koson-songbird'),
    asset: 'songbird',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    globalCompositeOperation: 'destination-over',
    order: 10,
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
scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);

// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);


// #### Development and testing
console.log(scrawl.library);
