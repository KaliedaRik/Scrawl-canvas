// # Demo Particles 004 
// Emit particles along the length of a path

// [Run code](../../demo/particles-004.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


// Create user-controllable Bezier entity 
scrawl.makeWheel({

    name: 'pin-1',
    order: 2,

    startX: 75,
    startY: 200,

    handleX: 'center',
    handleY: 'center',

    radius: 10,
    fillStyle: 'blue',
    strokeStyle: 'darkgray',
    lineWidth: 2,
    method: 'fillAndDraw',

}).clone({
    name: 'pin-2',
    startX: 225,

}).clone({
    name: 'pin-3',
    startX: 375,

}).clone({
    name: 'pin-4',
    startX: 525,
});

let pins = scrawl.makeGroup({

    name: 'my-pins',
    host: canvas.base.name,

}).addArtefacts('pin-1', 'pin-2', 'pin-3', 'pin-4');


scrawl.makeBezier({

    name: 'my-bezier',

    pivot: 'pin-1',
    lockTo: 'pivot',
    useStartAsControlPoint: true,

    startControlPivot: 'pin-2',
    startControlLockTo: 'pivot',

    endControlPivot: 'pin-3',
    endControlLockTo: 'pivot',

    endPivot: 'pin-4',
    endLockTo: 'pivot',

    method: 'draw',

    useAsPath: true,
});


// #### Particle physics animation scene

// Create a World object which we can then assign to the particle emitter
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,
});

// Create the particle Emitter entity
scrawl.makeEmitter({

    name: 'line-emitter',
    world: myWorld,

    generationRate: 120,
    killAfterTime: 5,

    rangeY: 10,
    rangeFromY: 10,

    rangeZ: -1,
    rangeFromZ: -0.2,

    // We tell the Emitter to generate its particles along our curve by setting its `generateAlongPath` attribute to the Bezier entity's String name, or the entity object itself.
    generateAlongPath: 'my-bezier',

    // We can define an entity to be used as the Emitter's stamp at the same time as we define the Emitter itself
    artefact: scrawl.makeStar({

        name: 'particle-star-entity',

        radius1: 12,
        radius2: 8,

        points: 5,

        handle: ['center', 'center'],

        fillStyle: 'gold',
        method: 'fillThenDraw',
        visibility: false, 

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            remaining, globalAlpha, scale, start, z, roll;

        history.forEach((p, index) => {

            [remaining, z, ...start] = p;
            globalAlpha = remaining / 6;
            scale = 1 + (z / 3);

            if (globalAlpha > 0 && scale > 0) {

                roll = globalAlpha * 720;

                artefact.simpleStamp(host, {start, scale, globalAlpha, roll});
            }
        });
    },
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    let particlenames = scrawl.library.particlenames,
        particle = scrawl.library.particle,
        historyCount;

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        historyCount = 0;
        particlenames.forEach(n => {

            let p = particle[n];
            if (p) historyCount += p.history.length;
        });

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Particles: ${particlenames.length}
    Stamps per display: ${historyCount}`;
    };
}();

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: pins,
    endOn: ['up', 'leave'],
});


// #### Development and testing
console.log(scrawl.library);
