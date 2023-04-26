// # Demo Canvas 046 
// Kill cycles for Cell, Group, Tween/Ticker, Picture and Asset objects, and Picture source elements in the DOM

// [Run code](../../demo/canvas-046.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Smoke ring generator
// We could place this code in its own module then import it into this code
// + The generator creates a new Cell, adds a Polyline entity to it, compiles the Cell and captures the output into a DOM image. 
// + It then creates a Picture entity from the asset captured from the Cell.
// + Finally it constructs a Tween to animate various aspects of the Picture entity.
// + When the Tween completes it will destroy all the objects - including the DOM &lt;img> element - associated with the smoke ring, and then destroy itself.

// Smoke ring factory
const buildSmokeRing = function (namespace, canvasWrapper) {

    // A line of boilerplate to help with namespacing various objects
    const getName = (name) => `${namespace}-${name}`;

    // Use a Color object to generate colors on demand, in a restricted color range
    // + Not efficient - doing it this way to test `scrawl.purge()` functionality
    const colorMaker = scrawl.makeColor({
        name: getName('color-maker'),
        minimumColor: 'blue',
        maximumColor: 'red',
        colorSpace: 'OKLAB',
    });

    // Create new Cell
    const cell = canvasWrapper.buildCell({
        name: getName('cell'),
        width: 600,
        height: 600,
        cleared: false,
        compiled: false,
        shown: false,
    });

    // Create a set of coordinates to be consumed by the Polyline entity
    const v = scrawl.requestVector(0, 200),
        pins = [];

    for (let i = 0; i < 120; i++) {
        v.rotate((Math.random() * 45) - 10);
        pins.push([v.x + ((Math.random() * 120) - 60) + 300, v.y + ((Math.random() * 120) - 60) + 300])
    }
    scrawl.releaseVector(v);

    // Create Polyline entity
    scrawl.makePolyline({

        name: getName('snake'),
        group: getName('cell'),

        pins: pins,
        start: ['center', 'center'],
        handle: ['center', 'center'],

        lineWidth: 2,
        lineJoin: 'round',
        tension: 1,
        strokeStyle: colorMaker.getRangeColor(Math.random()),

        method: 'draw',
        globalAlpha: 0.1,
    });

    // Tell SC that we want to capture the results of our Cell's next compile action in a DOM &lt;img> object
    // + This is a one-off action that has to be set up again each time we want to capture an image
    scrawl.createImageFromCell(cell, true);

    // Now we can perform a clear-compile on the Cell, outside of the Display cycle
    cell.clear();
    cell.compile();

    // Create the Picture entity, which uses the image asset created in the previous step
scrawl.makePicture({

        name: getName('smoke-ring'),
        group: canvasWrapper.get('baseGroup'),

        start: ['center', 'center'],
        handle: ['center', 'center'],

        // When we create an image from a Cell, the resulting asset is automatically named by adding `-image` to that Cell's name
        // + We named our Cell `getName('cell')`, so the image asset generated from it will be called `getName('cell-image')`
        asset: getName('cell-image'),

        // The image asset generated from our Cell has been stored in a dynamically created &lt;img> element on the DOM. We need to clear this out too when the smoke ring dies
        removeAssetOnKill: true,

        dimensions: [600, 600],
        copyDimensions: [600, 600],
    });

    // Create the Tween that will animate the Picture entity
    scrawl.makeTween({

        name: getName('tween'),
        duration: '16s',
        targets: getName('smoke-ring'),

        // The Tween will run once and then destroy all the scrawl.library objects associated with the namespace supplied to the `buildSmokeRing` function, including itself and its ticker.
        cycles: 1,
        killOnComplete: true,

        completeAction: () => {

            // Object cleanup acomplished via SC's `library.purge()` function
            scrawl.library.purge(namespace);

            // Recreate the smoke ring
            // + We do this in a `setTimeout` to make sure it runs __after__ the current `requestAnimationFrame` tick completes
            setTimeout(() => buildSmokeRing(namespace, canvasWrapper), 0);
        },

        definitions: [
            {
                attribute: 'scale',
                start: 0,
                end: 2,
                engine: 'easeIn3',
            },
            {
                attribute: 'globalAlpha',
                start: 1,
                end: 0,
            },
            {
                attribute: 'roll',
                start: 0,
                end: (Math.random() * 180) - 90,
                engine: 'easeIn',
            },
        ]
    }).run();
};


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const lib = scrawl.library;

    return `Cells: ${lib.cellnames.join(', ')}
Groups: ${lib.groupnames.join(', ')}
Assets: ${lib.assetnames.join(', ')}
Entitys: ${lib.entitynames.join(', ')}
Styles: ${lib.stylesnames.join(', ')}
Tickers: ${lib.animationtickersnames.join(', ')}
Tweens: ${lib.tweennames.join(', ')}`;
});


// Create the Display cycle animation
const render = scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// The tween runs for 16 seconds, and we want a regular supply of rings ... so we release some initially to get the scene running
setTimeout(() => buildSmokeRing(`first`, canvas), 0);
setTimeout(() => buildSmokeRing(`second`, canvas), 3700);
setTimeout(() => buildSmokeRing(`third`, canvas), 8100);
setTimeout(() => buildSmokeRing(`fourth`, canvas), 12300);


// #### Additional testing
// Test ticker halt/resume: halt when the browser loses focus, and resume them when it regains focus
// + Focus can be lost anytime user clicks away from the browser window, or clicks on a different browser window tab, or even clicking in the dev inspector panel
// + We could use` scrawl.stopCoreAnimationLoop()` and `scrawl.startCoreAnimationLoop()` to achieve this, but that action will stop ALL canvas animations on the page, not just this demo.
// + Instead, we halt/resume the Tweens themselves, alongside the RenderAnimation object.

const actionBlur = () => scrawl.library.tweennames.forEach(t => {

    const tween = scrawl.library.tween[t];
    if (tween && tween.isRunning()) tween.halt();

    render.halt();
});
scrawl.addNativeListener('blur', actionBlur, window);

const actionFocus = () => scrawl.library.tweennames.forEach(t => {

    const tween = scrawl.library.tween[t];
    if (tween && !tween.isRunning()) tween.resume();

    render.run();
});
scrawl.addNativeListener('focus', actionFocus, window);


// #### Development and testing
console.log(scrawl.library);
