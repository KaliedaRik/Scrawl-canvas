// # Demo Particles 006 
// Fixed number of particles in a field; preAction and postAction functionality

// [Run code](../../demo/particles-006.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'beige',
});


scrawl.makeBlock({

    name: 'field-block',

    width: '100%',
    height: '100%',

    method: 'none',
});

// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,

    userAttributes: [
        {
            key: 'connectionRadius', 
            defaultValue: 80,
        },
    ],
});

const myEmitter = scrawl.makeEmitter({

    name: 'field-emitter',
    world: myWorld,

    generationRate: 100,
    particleCount: 50,

    generateInArea: 'field-block',
    killBeyondCanvas: true,

    rangeX: 12,
    rangeFromX: -6,

    rangeY: 8,
    rangeFromY: -4,

    artefact: scrawl.makeStar({

        name: 'particle-star-entity',

        radius1: 4,
        radius2: 2,

        points: 5,

        handle: ['center', 'center'],

        fillStyle: 'beige',
        strokeStyle: 'gray',
        method: 'fillThenDraw',

        visibility: false, 

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    preAction: function (host) {

        let particles = this.particleStore,
            engine = host.engine,
            radius = this.world.connectionRadius;

        engine.save();

        engine.setTransform(1, 0, 0, 1, 0, 0);

        engine.strokeStyle = 'midnightblue';

        for (let i = 0, iz = particles.length; i < iz; i++) {

            let fromParticle = particles[i],
                fromHistory = fromParticle.history;

            if (fromHistory && fromHistory[0]) {

                let [fr, fz, fx, fy] = fromHistory[0];

                for (let j = i + 1, jz = particles.length; j < jz; j ++) {

                    let toParticle = particles[j],
                        toHistory = toParticle.history;

                    if (toHistory && toHistory[0]) {

                        let [tr, tz, tx, ty] = toHistory[0];

                        let test = scrawl.requestVector(fx, fy).vectorSubtractArray([tx, ty]),
                            mag = test.getMagnitude();

                        scrawl.releaseVector(test);
 
                         if (mag < radius) {

                            let opacity = (radius - mag) / radius;

                            engine.globalAlpha = opacity;

                            engine.beginPath();
                            engine.moveTo(fx, fy);
                            engine.lineTo(tx, ty);
                            engine.stroke();
                        }
                   }
                }
            }
        }
        engine.restore();
    },

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history && particle.history[0]) {

            let [r, z, startX, startY] = particle.history[0];

            artefact.simpleStamp(host, { startX, startY });
        }
    },

    postAction: function (host) {

        let particles = this.particleStore,
            engine = host.engine,
            here = host.here;

        if (here.active) {

            let {x, y} = here;

            engine.save();
            engine.setTransform(1, 0, 0, 1, 0, 0);
            engine.strokeStyle = 'red';

            for (let i = 0, iz = particles.length; i < iz; i++) {

                let fromParticle = particles[i],
                    fromHistory = fromParticle.history;

                if (fromHistory && fromHistory[0]) {

                    let [fr, fz, fx, fy] = fromHistory[0];

                    let test = scrawl.requestVector(fx, fy).vectorSubtractArray([x, y]),
                        mag = test.getMagnitude();

                    scrawl.releaseVector(test);

                    if (mag < 100) {

                        let opacity = (100 - mag) / 100;

                        engine.globalAlpha = opacity;

                        engine.beginPath();
                        engine.moveTo(fx, fy);
                        engine.lineTo(x, y);
                        engine.stroke();
                    }
                }
            }
            engine.restore();
        }
    },

}).run();


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
    Drawn entitys: ${historyCount}`;
    };
}();

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myWorld,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        connectionRadius: ['connectionRadius', 'int'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myEmitter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        particleCount: ['particleCount', 'int'],
    },
});

// #### Development and testing
console.log(scrawl.library);
