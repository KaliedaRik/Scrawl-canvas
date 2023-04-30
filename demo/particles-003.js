// # Demo Particles 003
// Position Emitter entity: start; pivot; mimic; path; mouse; drag-and-drop

// [Run code](../../demo/particles-003.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;

scrawl.importDomImage('#bunny');


// Create Block and Shape entitys that can be used as pivot, mimic and path objects for the Emitter entity
scrawl.makeBlock({

    name: 'pivot-entity',
    dimensions: [50, 30],
    start: ['20%', '20%'],
    handle: ['center', 'center'],
    order: 1,
    roll: 90,

    strokeStyle: 'darkred',
    lineWidth: 5,
    method: 'draw',

}).clone({

    name: 'mimic-entity',
    start: ['80%', '80%'],

    delta: {
        roll: 0.3,
    },

});

scrawl.makeShape({

    name: 'path-entity',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

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
});


// #### Particle physics animation scene

// Create gradient
scrawl.makeGradient({
    name: 'linear1',
    endX: '100%',
    colors: [
        [0, 'pink'],
        [999, 'darkgreen']
    ],
});


// Create entitys that we can use with the particle emitter
const wheel = scrawl.makeWheel({

    name: 'particle-wheel-entity',
    radius: 20,
    handle: ['center', 'center'],

    startAngle: 20,
    endAngle: -20,
    includeCenter: true,

    fillStyle: 'linear1',
    method: 'fillThenDraw',
    visibility: false,

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

const block = scrawl.makeBlock({

    name: 'particle-block-entity',
    dimensions: [40, 16],
    handle: ['center', 'center'],

    fillStyle: 'linear1',
    lockFillStyleToEntity: true,

    method: 'fillThenDraw',
    visibility: false,

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

const star = scrawl.makeStar({

    name: 'particle-star-entity',

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

const picture = scrawl.makePicture({

    name: 'particle-image-entity',
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

    name: 'demo-world',
    tickMultiplier: 2,
});


// Create the particle Emitter entity
const myemitter = scrawl.makeEmitter({

    name: 'position-tester',
    world: myWorld,

    // Start coordinates (relative to Cell dimensions)
    start: ['40%', '60%'],

    // Pivot
    pivot: 'pivot-entity',
    addPivotRotation: true,

    // Mimic
    mimic: 'mimic-entity',
    useMimicStart: true,
    useMimicRotation: true,

    // Path
    path: 'path-entity',
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

    artefact: star,

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
// @ts-expect-error
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
const particlenames = scrawl.library.particlenames,
    particle = scrawl.library.particle;

const report = reportSpeed('#reportmessage', function () {

    // ParticleHistory arrays are not saved in the Scrawl-canvas library; instead we need to count them in each particle
    let historyCount = 0;
    particlenames.forEach(n => {

        const p = particle[n];
        if (p) historyCount += p.history.length;
    });

    return `    Particles: ${particlenames.length}
    Stamps per display: ${historyCount}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Make the Emitter draggable
// + KNOWN BUG - the emitter is not draggable on first user mousedown, but is draggable afterwards
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('position-tester');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myemitter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        position: ['lockTo', 'raw'],
    },
});

const useArtefact = function () {

    const selector = document.querySelector('#artefact');

    let choice, val;

    return function () {

// @ts-expect-error
        val = selector.value;

        switch (val) {

            case 'star' :
                choice = star;
                break;

            case 'wheel' :
                choice = wheel;
                break;

            case 'block' :
                choice = block;
                break;

            case 'picture' :
                choice = picture;
                break;
        }

        if (choice) {

            myemitter.set({
                artefact: choice,
            });
        }
    }
}();
scrawl.addNativeListener(['input', 'change'], useArtefact, '#artefact');

// Initialize form values
// @ts-expect-error
document.querySelector('#artefact').value = 'star';
// @ts-expect-error
document.querySelector('#position').value = 'start';


// #### Development and testing
console.log(scrawl.library);
