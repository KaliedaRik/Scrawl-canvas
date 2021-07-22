// # Demo Canvas 046 
// Kill cycles for Cell, Group, Tween/Ticker, Picture and Asset objects, and Picture source elements in the DOM

// [Run code](../../demo/canvas-046.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Smoke ring generator
// We could place this code in its own module then import it into this code
// + The generator creates a new Cell, adds a Polyline entity to it, compiles the Cell and captures the output into a DOM image. 
// + It then destroys the Cell and Polyline and creates a Picture entity from the asset they produced
// + Finally it constructs a Tween to animate various aspects of the Picture entity
// + When the Tween completes it will destroy the image asset wrapper and the Picture entity, then remove the &lt;img> element from the DOM, after which it will destroy itself
// + In other words, by the time the Tween completes, none of the objects generated for the smoke ring effect should remain in the Scrawl-canvas library or the page DOM.

// Use a Color object to generate colors on demand, in a restricted color range
const colorMaker = scrawl.makeColor({
    name: 'color-maker',
    minimumColor: 'blue',
    maximumColor: 'green',
});

// To avoid nameclashes, we're using a counter as part of the smokering's name
let counter = 0;

// The main function
const buildSmokeRing = function (namespace, canvasWrapper, color) {

    // Create new Cell
    const cell = canvasWrapper.buildCell({
        name: `${namespace}-cell`,
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
    let snake = scrawl.makePolyline({

        name: `${namespace}-snake`,
        group: `${namespace}-cell`,

        pins: pins,
        start: ['center', 'center'],
        handle: ['center', 'center'],

        lineWidth: 2,
        lineJoin: 'round',
        tension: 1,
        strokeStyle: color,

        method: 'draw',
        globalAlpha: 0.1,
    });

    // We need to perform a clear-compile on the Cell, outside of the Display cycle
    cell.clear();
    scrawl.createImageFromCell(cell, true);
    cell.compile();
    snake.kill();
    cell.kill();

    // Create the Picture entity which will destroy the (dearly departed) Polyline on the canvas
    let img = scrawl.makePicture({
        name: `${namespace}-smokering`,
        group: canvasWrapper.base.name,

        start: ['center', 'center'],
        handle: ['center', 'center'],

        asset: `${namespace}-cell-image`,

        // 'dom' - is the magic String that tells Scrawl-canvas to remove both the asset wrapper object, and the &lt;img> element itself. Any other non-false value will cause only the asset wrapper object to remove itself.
        removeAssetOnKill: 'dom',

        dimensions: [600, 600],
        copyDimensions: [600, 600],
    });

    // Create the Tween that will animate the Picture entity
    scrawl.makeTween({

        name: `${namespace}-tween`,
        duration: '16s',
        targets: `${namespace}-smokering`,

        // The Tween will run once and then destroy the Picture, the &lt;img> element and its asset wrapper, and then itself
        cycles: 1,
        killOnComplete: true,
        completeAction: () => {

            img.kill(true);

            counter++;
            buildSmokeRing(`ring${counter}`, canvas, colorMaker.getRangeColor(Math.random()));
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


// Create a fade effect at the cell level - without this, the smoke ring just looks like a squiggly line
canvas.setBase({
    clearAlpha: 0.985,
})


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Cells: ${scrawl.library.cellnames.join(', ')}
Groups: ${scrawl.library.groupnames.join(', ')}
Assets: ${scrawl.library.assetnames.join(', ')}
Entitys: ${scrawl.library.entitynames.join(', ')}
Tickers: ${scrawl.library.animationtickersnames.join(', ')}
Tweens: ${scrawl.library.tweennames.join(', ')}`;
    };
}();

// Create the Display cycle animation
const render = scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// The tween runs for 16 seconds, and we want a regular supply of rings ... so we release some initially to get the scene running
setTimeout(() => buildSmokeRing(`initRingFirst`, canvas, colorMaker.getRangeColor(Math.random())), 0);
setTimeout(() => buildSmokeRing(`initRingSecond`, canvas, colorMaker.getRangeColor(Math.random())), 3700);
setTimeout(() => buildSmokeRing(`initRingThird`, canvas, colorMaker.getRangeColor(Math.random())), 8100);
setTimeout(() => buildSmokeRing(`initRingFourth`, canvas, colorMaker.getRangeColor(Math.random())), 12300);

// We also want to halt the animation when the browser page loses focus, and resume them when it regains focus
// + We could use` scrawl.stopCoreAnimationLoop()` and `scrawl.startCoreAnimationLoop()` to achieve this, but that action will stop ALL canvas animations on the page, not just this demo.
// + Instead, we can halt/resume/run our render animation, and also any existing smoke ring Tweens.
window.addEventListener('blur', () => {
    scrawl.library.animationtickersnames.forEach(t => {
        if (t.indexOf('ring') === 0) {
            let ticker = scrawl.library.animationtickers[t];
            if (ticker) ticker.halt();
        }
    });
    render.halt();
});

// We could add the focus event listener the same as we did the blur listener, or we can add it using Scrawl-canvas functionality:
scrawl.addNativeListener('focus', () => {
    scrawl.library.animationtickersnames.forEach(t => {
        if(t.indexOf('ring') === 0) {
            let ticker = scrawl.library.animationtickers[t];
            if (ticker) ticker.resume();
        }
    });
    render.run();
}, window);


// #### Development and testing
console.log(scrawl.library);
