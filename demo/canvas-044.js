// # Demo Canvas 044
// Building more complex patterns

// [Run code](../../demo/canvas-044.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// STEP 1. We define a gradient, then apply it to some Blocks we create in a new canvas Cell. This gives us a more interesting gradient pattern than the default 'linear' and 'radial' gradients supplied by the Canvas API
scrawl.makeGradient({

    name: name('linear'),
    endX: '100%',
    endY: '100%',
    colors: [
        [0, 'white'],
        [420, 'red'],
        [500, 'yellow'],
        [580, 'red'],
        [999, 'black'],
    ],
});

// Add a new Cell to our canvas
const patternCell = canvas.buildCell({

    name: name('gradient-pattern-cell'),
    dimensions: [50, 50],
    shown: false,
});

// Populate our new Cell with Block entitys that use our linear gradient
scrawl.makeBlock({

    name: name('gradient-block-br'),
    group: name('gradient-pattern-cell'),
    dimensions: [25, 25],
    start: ['center', 'center'],
    fillStyle: name('linear'),
    lockFillStyleToEntity: true,

}).clone({

    name: name('gradient-block-bl'),
    roll: 90,

}).clone({

    name: name('gradient-block-tl'),
    roll: 180,

}).clone({

    name: name('gradient-block-tr'),
    roll: 270,
});


// STEP 2. Apply a Noise-based displacement filter to our pattern Cell. We can then animate this filter to make it more interesting

// Create the Noise asset
scrawl.makeNoiseAsset({

    name: name('my-noise-generator'),
    width: 50,
    height: 50,
    octaves: 5,
    scale: 2,
    noiseEngine: 'simplex',
});

// TEST: see if we can load the Noise asset directly into a Picture entity, and into a Pattern style - we'll use these for background textures.
scrawl.makePicture({

    name: name('test-picture'),

    dimensions: [300, 400],
    copyDimensions: ['100%', '100%'],

    asset: name('my-noise-generator'),

    globalAlpha: 0.2,
});

scrawl.makePattern({

    name: name('test-pattern'),
    asset: name('my-noise-generator'),
});

scrawl.makeBlock({

    name: name('test-pattern-block'),
    startX: 300,
    dimensions: [300, 400],

    fillStyle: name('test-pattern'),

    globalAlpha: 0.2,
});

// Build filters that use the Noise asset
scrawl.makeFilter({

    name: name('noise'),
    method: 'image',
    asset: name('my-noise-generator'),
    width: 400,
    height: 400,
    copyWidth: '100%',
    copyHeight: '100%',
    lineOut: 'map',
});

const displacer =  scrawl.makeFilter({

    name: name('displace'),
    method: 'displace',
    lineMix: 'map',
    scaleX: 20,
    scaleY: 20,
});

// Update our Cell with the filters
patternCell.set({
    filters: [name('noise'), name('displace')]
});

// Animate the displacer filter using a Tween
scrawl.makeTween({

    name: name('turbulence'),
    duration: 6000,
    targets: displacer,
    cycles: 0,
    reverseOnCycleEnd: true,
    definitions: [
        {
            attribute: 'scaleX',
            start: 1,
            end: 150,
            engine: 'easeOutIn'
        },
        {
            attribute: 'scaleY',
            start: 150,
            end: 1,
            engine: 'easeOutIn'
        },
    ]
}).run();


// STEP 3. We are now in a position where we can use our Cells as pattern fills for some SC entitys.
scrawl.makePolygon({

    name: name('hex'),
    sides: 6,
    sideLength: 90,
    roll: 30,
    start: [470, 140],
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',

    // To use a Cell as a pattern we just assign its name to the entity's fillStyle attribute
    fillStyle: name('gradient-pattern-cell'),
});


// STEP 4. If we want, we can add some color-based filters to our entitys, to give our pattern a different look.
scrawl.makeFilter({

    name: name('notred'),
    method: 'notred',

}).clone({

    name: name('sepia'),
    method: 'sepia',

}).clone({

    name: name('invert'),
    method: 'invert',
});

scrawl.makeOval({

    name: name('egg'),
    radiusX: 60,
    radiusY: 80,
    roll: 30,
    intersectY: 0.6,
    start: [70, 210],
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',
    fillStyle: name('gradient-pattern-cell'),
    filters: [name('sepia')],
});

scrawl.makeTetragon({

    name: name('arrow'),
    start: [160, 290],
    fillStyle: name('gradient-pattern-cell'),
    radiusX: 60,
    radiusY: 80,
    intersectY: 1.2,
    intersectX: 0.32,
    roll: -60,
    filters: [name('invert')],
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',
});


// STEP 5. There's one additional thing we can do with our Cell-based pattern - pass it into a Pattern object where we can warp and resize it. Then we can apply it to entitys via the Pattern object.
scrawl.makePattern({

    name: name('wavy-pattern'),
    asset: name('gradient-pattern-cell'),
    skewY: 0.7,
    shiftY: -150,
});

scrawl.makeBlock({

    name: name('boring-block'),
    start: [50, 50],
    dimensions: [140, 170],
    fillStyle: name('wavy-pattern'),
    lineWidth: 2,
    strokeStyle: 'green',
    lineJoin: 'round',
    method: 'fillThenDraw',

}).clone({

    name: name('tipsy-block'),
    start: [250, 130],
    dimensions: [210, 90],
    roll: -30,
    filters: [name('notred')],
});


// #### User interaction
const setCursorTo = {

    auto: () => {
        canvas.set({
            css: {
                cursor: 'auto',
            },
        });
    },
    pointer: () => {
        canvas.set({
            css: {
                cursor: 'grab',
            },
        });
    },
    grabbing: () => {
        canvas.set({
            css: {
                cursor: 'grabbing',
            },
        });
    },
};

// We can change the cursor for a subset of entitys declared on the canvas.base cell
scrawl.makeGroup({

    name: name('my-draggable-entitys'),
    host: canvas.base,
    checkForEntityHover: true,
    onEntityHover: setCursorTo.pointer,
    onEntityNoHover: setCursorTo.auto,

}).moveArtefactsIntoGroup(name('hex'), name('egg'), name('arrow'), name('boring-block'), name('tipsy-block'));

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('my-draggable-entitys'),
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
    updateOnStart: setCursorTo.grabbing,
    updateOnEnd: setCursorTo.pointer,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: () => canvas.checkHover(),
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
