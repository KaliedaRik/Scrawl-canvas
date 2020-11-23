// # Demo Particles 007 
// Particle Force objects: generation and functionality

// [Run code](../../demo/particles-007.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

scrawl.importDomImage('#bunny');

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
            key: 'brownianIntensity', 
            defaultValue: 2,
        },
    ],
});

scrawl.makeForce({

    name: 'brownian-motion',
    action: (particle, world, host) => {

        let {load} = particle;

        let intensity = world.brownianIntensity;

        load.vectorAdd({
            x: (Math.random() * intensity * 2) - intensity,
            y: (Math.random() * intensity * 2) - intensity,
        });
    },
});

scrawl.makeForce({

    name: 'mouse-disruptor',
    action: (particle, world, host) => {

        let {load, position} = particle;

        let {here} = host;

        let v = scrawl.requestVector(here).vectorSubtract(position);

        let mag = v.getMagnitude();

        if (mag < 100) load.vectorAdd(v);

        scrawl.releaseVector(v);
    },
});


const myEmitter = scrawl.makeEmitter({

    name: 'field-emitter',
    world: myWorld,

    generationRate: 100,
    particleCount: 50,

    generateInArea: 'field-block',
    killBeyondCanvas: true,

    forces: ['brownian-motion', 'mouse-disruptor'],

    artefact: scrawl.makePicture({

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
    }),

    stampAction: function (artefact, particle, host) {

        let [r, z, ...start] = particle.history[0];
        artefact.simpleStamp(host, {start});
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
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myWorld,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        brownianIntensity: ['brownianIntensity', 'float'],
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
