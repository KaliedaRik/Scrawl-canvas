// # Demo Canvas 045 
// Building more complex patterns

// [Run code](../../demo/canvas-045.html)
import scrawl from '../source/scrawl.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.setBase({
    backgroundColor: 'azure',
    // The order in which we compile Cells becomes important when building more complex patterns with additional Cells
    compileOrder: 2,
});

// STEP 1. We define a gradient, then apply it to some Blocks we create in a new canvas Cell. This gives us a more interesting gradient pattern than the default 'linear' and 'radial' gradients supplied by the Canvas API
scrawl.makeGradient({
    name: 'linear',
    endX: '100%',
    endY: '100%',
})
.updateColor(0, 'white')
.updateColor(420, 'red')
.updateColor(500, 'yellow')
.updateColor(580, 'red')
.updateColor(999, 'black');

canvas.buildCell({
    name: 'gradient-sub-pattern',
    dimensions: [50, 50],
    shown: false,
    compileOrder: 0,
});

// Populate our new Cell with blocks using our linear gradient
scrawl.makeBlock({
    name: 'gradient-block-br',
    group: 'gradient-sub-pattern',
    dimensions: [25, 25],
    start: ['center', 'center'],
    fillStyle: 'linear',
    lockFillStyleToEntity: true,
}).clone({
    name: 'gradient-block-bl',
    roll: 90,
}).clone({
    name: 'gradient-block-tl',
    roll: 180,
}).clone({
    name: 'gradient-block-tr',
    roll: 270,
});

// STEP 2: We have a pattern that we can use, but we can make it even more interesting using an SVG turbulence-and-displacement filter. We define the SVG in the HTML code, then apply it to a new Cell we create for the effect.
canvas.buildCell({
    name: 'warped-pattern',
    dimensions: [400, 400],
    shown: false,
    compileOrder: 1,
});

scrawl.makeBlock({
    name: 'warped-pattern-block',
    group: 'warped-pattern',
    dimensions: [900, 900],
    start: ['center', 'center'],
    handle: ['center', 'center'],
    roll: 45,
    fillStyle: 'gradient-sub-pattern',
    filter: 'url(#svg-noise)',
});

// STEP 3: We can animate our SVG filter using a combination of a Scrawl-canvas World object and some SC tweens
const turbulence = document.querySelector('feTurbulence');
const displacement = document.querySelector('feDisplacementMap');

const myWorld = scrawl.makeWorld({
    name: 'svg-filter-accessor',
    userAttributes: [
        {
            key: 'baseFreqX', 
            defaultValue: 0,
            setter: function (item) {
                this.baseFreqX = item;
                turbulence.setAttribute('baseFrequency', `${this.baseFreqX} ${this.baseFreqY}`);
            },
        },
        {
            key: 'baseFreqY', 
            defaultValue: 0,
            setter: function (item) {
                this.baseFreqY = item;
                turbulence.setAttribute('baseFrequency', `${this.baseFreqX} ${this.baseFreqY}`);
            },
        },
        {
            key: 'scale', 
            defaultValue: 0,
            setter: function (item) {
                this.scale = item;
                displacement.setAttribute('scale', `${this.scale}`);
            },
        }
    ],
});

scrawl.makeTween({
    name: 'horizontal-turbulence',
    duration: 6000,
    targets: myWorld,
    cycles: 0,
    reverseOnCycleEnd: true,
    definitions: [
        {
            attribute: 'baseFreqX',
            start: 0.01,
            end: 0.025,
            engine: 'easeOutIn'
        },
    ]
}).run();

scrawl.makeTween({
    name: 'vertical-turbulence',
    duration: 7000,
    targets: myWorld,
    cycles: 0,
    reverseOnCycleEnd: true,
    definitions: [
        {
            attribute: 'baseFreqY',
            start: 0.01,
            end: 0.025,
            engine: 'easeOutIn'
        },
    ]
}).run();

scrawl.makeTween({
    name: 'scale-displacement',
    duration: 10000,
    targets: myWorld,
    cycles: 0,
    reverseOnCycleEnd: true,
    definitions: [
        {
            attribute: 'scale',
            start: 15,
            end: 25,
            engine: 'easeOutIn'
        },
    ]
}).run();

// STEP 4. We are now in a position where we can use our Cells as pattern fills for some SC entitys.
scrawl.makePolygon({
    name: 'hex',
    sides: 6,
    radius: 90,
    roll: 30,
    start: [470, 140],
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',
    // To use a Cell as a pattern we just assign its name to the entity's fillStyle attribute
    fillStyle: 'warped-pattern',
});


// STEP 5. If we want, we can add filters to our entitys, to give our pattern a different look.
scrawl.makeFilter({
    name: 'notred',
    method: 'notred',
}).clone({
    name: 'sepia',
    method: 'sepia',
}).clone({
    name: 'invert',
    method: 'invert',
});

scrawl.makeOval({
    name: 'egg',
    radiusX: 60,
    radiusY: 80,
    roll: 30,
    intersectY: 0.6,
    start: [70, 210],
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',
    fillStyle: 'warped-pattern',
    filters: ['sepia'],
});

scrawl.makeTetragon({
    name: 'arrow',
    start: [160, 290],
    fillStyle: 'warped-pattern',
    radiusX: 60,
    radiusY: 80,
    intersectY: 1.2,
    intersectX: 0.32,
    roll: -60,
    filters: ['invert'],
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',
});

// STEP 6. There's one additional thing we can do with our pattern - pass it into a Pattern object where we can warp and resize it. Then we can apply it to entitys via the Pattern object.
scrawl.makePattern({
    name: 'wavy-pattern',
    asset: 'warped-pattern',
    matrixB: 0.7,
    matrixF: -150,
});

scrawl.makeBlock({
    name: 'boring-block',
    start: [50, 50],
    dimensions: [140, 170],
    fillStyle: 'wavy-pattern',
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',

}).clone({
    name: 'tipsy-block',
    start: [250, 130],
    dimensions: [210, 90],
    roll: -30,
    filters: ['notred'],
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

scrawl.makeDragZone({
    zone: canvas,
    endOn: ['up', 'leave'],
});

// #### Development and testing
console.log(scrawl.library);
