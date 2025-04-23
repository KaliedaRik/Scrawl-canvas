// # Demo Particles 003
// Position Emitter entity: start; pivot; mimic; path; mouse; drag-and-drop

// [Run code](../../demo/particles-003.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('#bunny');


// Create Block and Shape entitys that can be used as pivot, mimic and path objects for the Emitter entity
scrawl.makeBlock({

    name: name('pivot'),
    dimensions: [50, 30],
    start: ['20%', '20%'],
    handle: ['center', 'center'],
    order: 1,
    roll: 90,
    strokeStyle: 'darkred',
    lineWidth: 5,
    method: 'draw',

}).clone({

    name: name('mimic'),
    start: ['80%', '80%'],
    delta: {
        roll: 0.3,
    },
});

scrawl.makeShape({

    name: name('path'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    scale: 0.5,
    roll: -90,
    flipUpend: true,
    scaleOutline: false,
    useAsPath: true,
    precision: 2,
    strokeStyle: 'green',
    lineWidth: 3,
    method: 'draw',
    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',
});


// #### Particle physics animation scene
// Create gradient
scrawl.makeGradient({

    name: name('gradient'),
    endX: '100%',
    colors: [
        [0, 'pink'],
        [999, 'darkgreen']
    ],
    colorSpace: 'OKLAB',
});


// Create entitys that we can use with the particle emitter
scrawl.makeWheel({

    name: name('wheel'),
    radius: 20,
    handle: ['center', 'center'],

    startAngle: 20,
    endAngle: -20,
    includeCenter: true,

    fillStyle: name('gradient'),
    method: 'fillThenDraw',
    visibility: false,

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

scrawl.makeBlock({

    name: name('block'),
    dimensions: [40, 16],
    handle: ['center', 'center'],

    fillStyle: name('gradient'),
    lockFillStyleToEntity: true,

    method: 'fillThenDraw',
    visibility: false,

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

scrawl.makeStar({

    name: name('star'),

    radius1: 18,
    radius2: 12,

    points: 5,

    handle: ['center', 'center'],

    fillStyle: 'gold',
    method: 'fillThenDraw',
    visibility: false,

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

scrawl.makePicture({

    name: name('picture'),
    asset: 'bunny',

    width: 26,
    height: 37,

    handle: ['center', 'center'],

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',
    visibility: false,

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});


// Create a World object which we can then assign to the particle emitter
const myWorld = scrawl.makeWorld({

    name: name('world'),
    tickMultiplier: 2,
});


// Create the particle Emitter entity
const myEmitter = scrawl.makeEmitter({

    name: name('position-tester'),
    world: myWorld,

    // Start coordinates (relative to Cell dimensions)
    start: ['40%', '60%'],

    // Pivot
    pivot: name('pivot'),
    addPivotRotation: true,

    // Mimic
    mimic: name('mimic'),
    useMimicStart: true,
    useMimicRotation: true,

    // Path
    path: name('path'),
    pathPosition: 0,
    addPathRotation: true,

    delta: {
        pathPosition: 0.0004,
    },

    // Particle generation
    historyLength: 1,
    generationRate: 50,
    killAfterTime: 5,

    // Another way to kill particles is to set the `killBeyondCanvas` flag. This will kill any particle that moves beyond the borders of its Cell's &lt;canvas> element
    killBeyondCanvas: true,

    artefact: name('star'),

    // These range settings will create a fountain effect, with the particle stars shrinking and fading as they age
    rangeX: 40,
    rangeFromX: -20,

    rangeY: -40,
    rangeFromY: -10,

    rangeZ: -1,
    rangeFromZ: -0.2,

    // Emitter entitys do not have dimensions as such; their `width` and `height` attributes are linked directly to their `hitRadius` attribute. Setting the `hitRadius` lets users drag-and-drop the Emitter around the canvas.
    hitRadius: 20,
    showHitRadius: true,
    hitRadiusColor: 'red',

    // `stampAction` function
    stampAction: function (artefact, particle, host) {

        const history = particle.history,
/** @ts-expect-error */
            roll = this.get('roll');

        let remaining, globalAlpha, scale, start, z;

        history.forEach(p => {

            [remaining, z, ...start] = p;
            globalAlpha = remaining / 6;
            scale = 1 + (z / 3);

            if (globalAlpha > 0 && scale > 0) {

                // Note that `simpleStamp` will work with both linear and radial gradients, but will ignore any attempt to add a filter to the Emitter entity.
                // + If a filter is required, apply it to the Emitter entity itself.
                artefact.simpleStamp(host, {start, scale, globalAlpha, roll});
            }
        });
    },
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const { particlenames, particle } = scrawl.library;

const report = reportSpeed('#reportmessage', function () {

    let historyCount = 0;
    particlenames.forEach(n => {

        const p = particle[n];
        if (p) historyCount += p.history.length;
    });

    return `
    Particles: ${particlenames.length}
    Stamps per display: ${historyCount}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const dom = scrawl.initializeDomInputs([
    ['select', 'position', 0],
    ['select', 'artefact', 0],
]);


// Make the Emitter draggable
scrawl.makeGroup({

    name: name('my-draggable-group'),

}).addArtefacts(myEmitter);

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('my-draggable-group'),
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: dom.position,

    target: myEmitter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        position: ['lockTo', 'raw'],
    },
});

const useArtefact = function (e) {

    if (e && e.target) {

        const val = scrawl.findEntity(name(e.target.value));

        if (val) myEmitter.set({ artefact: val });
    }
};
scrawl.addNativeListener(['input', 'change'], useArtefact, dom.artefact);


// #### Development and testing
console.log(scrawl.library);
