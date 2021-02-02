// # Demo Particles 009 
// Net particles: drag-and-drop; collisions

// [Run code](../../demo/particles-009.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'slategray',
});


// Define some filters
scrawl.makeFilter({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'invert',
    method: 'invert',
});

scrawl.makeFilter({
    name: 'tint',
    method: 'tint',
    redInRed: 0.5,      redInGreen: 1,      redInBlue: 0.9,
    greenInRed: 0,      greenInGreen: 0.3,  greenInBlue: 0.8,
    blueInRed: 0.8,     blueInGreen: 0.8,   blueInBlue: 0.4,
});

scrawl.makeFilter({
    name: 'matrix',
    method: 'matrix',
    weights: [-1, -1, 0, -1, 1, 1, 0, 1, 1],
});


// For this Demo, we are creating a sheet and pinning its top row to a rail. This is the rail.
scrawl.makeLine({

    name: 'topline',

    startX: '10%',
    startY: '5%',
    endX: '90%',
    endY: '5%',

    lineWidth: 20,
    lineCap: 'round',
    strokeStyle: 'brown',

    method: 'draw',
});


// #### Particle physics animation scene

// Create a repeller force, associated with a Wheel entity
const bigball = scrawl.makeWheel({

    name: 'big-ball',
    radius: 80,
    handle: ['center', 'center'],
    start: ['center', 320],

    fillStyle: 'coral',
    strokeStyle: 'orange',
    lineWidth: 3,
    method: 'fillThenDraw',

    // Default action is for a dragged entity to attempt to place itself over all other entitys (in its Group). We can prevent this by setting the `bringToFrontOnDrag` to `false`
    bringToFrontOnDrag: false,
});

// The repeller force
scrawl.makeForce({

    name: 'wheel-repellor',
    action: (particle, world, host) => {

        let {load, position} = particle;

        let ballPosition = bigball.get('position');

        // We are using Scrawl-canvas Pool vectors for this calculation, which we need to request before we can use them.
        let v = scrawl.requestVector(ballPosition).vectorSubtract(position);

        let mag = v.getMagnitude();

        if (mag && mag < bigball.get('radius')) {

            v.scalarMultiply(1 / (mag / 1000));
            load.vectorSubtract(v)
        }

        // When we are finished with the vector, we MUST release it back to the pool!
        scrawl.releaseVector(v);
    },
});


// Create a World object which we can then assign to the Net entity
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,

});


// Create the Net entity
const myNet = scrawl.makeNet({

    name: 'test-net',
    world: myWorld,

    pivot: 'topline',
    lockTo: 'pivot',

    generate: 'weak-net',

    postGenerate: function () {

        // We want to make all of the top row Particles visually different, and static
        const regex = RegExp('-0-[0-9]+$');

        this.particleStore.forEach(p => {

            if (regex.test(p.name)) {

                p.set({ 
                    fill: 'lightgrey',
                    stroke: 'red',
                    forces: [],
                });

                this.springs.forEach(s => {

                    if (s && s.particleFrom && s.particleFrom.name === p.name) {

                        s.particleFromIsStatic = true;
                    }
                    if (s && s.particleTo && s.particleTo.name === p.name) {

                        s.particleToIsStatic = true;
                    }
                })
            }
        });
    },

    rows: 15,
    columns: 17,
    rowDistance: 25,
    columnDistance: 30,
    showSprings: true,
    showSpringsColor: 'azure',

    forces: ['gravity', 'wheel-repellor'],

    mass: 3,
    springConstant: 100,

    engine: 'runge-kutta',

    artefact: scrawl.makeWheel({

        name: 'particle-wheel',
        radius: 7,

        handle: ['center', 'center'],

        method: 'fillThenDraw',
        fillStyle: 'yellow',
        strokeStyle: 'gold',

        visibility: false, 

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    stampAction: function (artefact, particle, host) {

        let [r, z, ...start] = particle.history[0];

        artefact.simpleStamp(host, { 
            start,
            fillStyle: particle.fill, 
            strokeStyle: particle.stroke, 
        });
    },

    // Make all of the Net entity's Particles draggable
    particlesAreDraggable: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
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


// #### User interaction
// Make both the Net entity's Particles, and the big ball, draggable
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('test-net', 'big-ball');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
});

// When we set a filter on a Net entity, all the entity's visual output will be filtered
const filterChoice = function (e) {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    myNet.clearFilters();
    if (val) myNet.addFilters(val);
};
scrawl.addNativeListener(['input', 'change'], filterChoice, '#filter');

// Set DOM form initial input values
document.querySelector('#filter').value = '';


// #### Development and testing
console.log(scrawl.library);
