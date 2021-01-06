// # Demo Component 007
// Factory functions to create more complex, compound entitys

// [Run code](../../demo/component-007.html)
import scrawl from '../source/scrawl.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    backgroundColor: 'azure',
    compileOrder: 1,
});


// THE RING FACTORY
// We could put this code into its own file, then import it into any animation where we need to construct a ring of entitys
const buildEntityRing = function (items = {}) {

    if (!items.canvas || !items.entity || !items.name) return false;

    let canvas = items.canvas,
        name = items.name,
        entity = items.entity,
        dimensions = items.dimensions || 400,
        buildStartAngle = items.buildStartAngle || -45,
        buildEndAngle = items.buildEndAngle || 225,
        buildStepAngle = items.buildStepAngle || 15,
        buildOffset = items.buildOffset || 0,
        reflectOnly = items.reflectOnly || false;

    const cell = canvas.buildCell({
        name: `${name}-cell`,
        dimensions: [dimensions, dimensions],
        shown: false,
        compileOrder: 0,
    });

    const clip = scrawl.makeGroup({
        name: `${name}-clip-group`,
        host: `${name}-cell`,
        order: 0,
    });

    const reflect = scrawl.makeGroup({
        name: `${name}-reflect-group`,
        host: `${name}-cell`,
        order: 1,
    });

    scrawl.makeBlock({
        name: `${name}-clipper`,
        group: `${name}-clip-group`,
        start: ['left', 'center'],
        dimensions: ['100%', '50%'],
        method: 'clip'
    });

    let v = scrawl.requestVector(0, buildOffset);
    v.rotate(buildStartAngle);

    for (let i = buildStartAngle; i <= buildEndAngle; i += buildStepAngle) {

        entity.clone({
            name: `${name}-ringitem-${i}`,
            group: `${name}-clip-group`,
            roll: i,
            offset: [v.x, v.y],
        });

        v.rotate(buildStepAngle);
    }

    scrawl.releaseVector(v);

    scrawl.makePicture({
        name: `${name}-reflection`,
        group: `${name}-reflect-group`,
        asset: `${name}-cell`,

        start: ['center', '25%'],
        handle: ['center', 'center'],
        flipUpend: true,
        flipReverse: !reflectOnly,

        dimensions: ['100%', '50%'],
        copyDimensions: ['100%', '50%'],
        copyStartY: '50%',

        method: 'fill',
    });

    entity.set({
        visibility: false,
    });

    return {
        cell,
        kill: () => {

            clip.kill(true);
            reflect.kill(true);
            cell.kill();
        },
    }
};


// Some gradients for our scene
const parasolGradient = scrawl.makeGradient({
    name: 'parasol-gradient',
    endY: '100%',
    paletteEnd: 299,
})
.updateColor(0, 'red')
.updateColor(999, 'transparent');

scrawl.makeGradient({
    name: 'plank-gradient',
    endX: '100%',
})
.updateColor(0, 'gold')
.updateColor(999, 'green');


// A parasol compound-entity
const parasol = buildEntityRing({

    name: 'parasol',
    canvas,

    dimensions: 400,
    buildStartAngle: -20,
    buildEndAngle: 200,
    buildStepAngle: 5,
    reflectOnly: false,

    entity: scrawl.makeBlock({
        name: 'parasol-template',
        start: ['center', 'center'],
        dimensions: [200, 18],
        method: 'fill',
        fillStyle: 'parasol-gradient',
        lockFillStyleToEntity: true,
    }),
});

// A ring-of-planks compound-entity
const plank = buildEntityRing({

    name: 'plank',
    canvas,

    dimensions: 600,
    buildStartAngle: -90,
    buildEndAngle: 210,
    buildStepAngle: 30,
    buildOffset: 190,
    reflectOnly: false,

    entity: scrawl.makeBlock({
        name: 'plank-template',
        start: ['center', 'center'],
        handle: ['center', 'top'],
        dimensions: [150, 30],
        lineWidth: 2,
        fillStyle: 'plank-gradient',
        lockFillStyleToEntity: true,
        method: 'fillThenDraw',
        delta: {
            roll: 0.3,
        },
    }),
});

// We can now use our compound entitys to create a scene
scrawl.makePicture({
    name: 'plank-picture',
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
    name: 'parasol-picture',
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
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});

// And some additional animation for the parasol gradient
const ticker = scrawl.makeTicker({
    name: 'parasol-gradient-ticker',
    cycles: 0,
    duration: '12s',
});

scrawl.makeTween({
    name: 'parasol-start-palette-tween',
    targets: parasolGradient,
    ticker: 'parasol-gradient-ticker',
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

    name: 'parasol-end-palette-tween',
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
