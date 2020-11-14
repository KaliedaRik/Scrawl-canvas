// # Demo Particles 001 
// Emitter entity, and Particle World, basic functionality

// [Run code](../../demo/particles-001.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: '#000040',
});

// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',

    tickMultiplier: 2,

    userAttributes: [
        {
            key: 'hello', 
            defaultValue: 'Hello World',
            setter: function (item) { this.hello = `Hello ${item}!`},
        },
        {
            key: 'testCoordinate', 
            type: 'Coordinate',
            getter: function () { return [].concat(this.testCoordinate) },
            setter: function (item) { this.testCoordinate.set(item) },
        },
        {
            key: 'particleColor', 
            defaultValue: '#F0F8FF',
        },
        {
            key: 'alphaDecay', 
            defaultValue: 6,
        },
    ],

    hello: 'Wonderful Person',
    testCoordinate: [100, 100],
});

// Test the World object's user-defined attributes
console.log(myWorld.get('hello'));
myWorld.set({ testCoordinate: ['center', 'center'] });
console.log(myWorld.get('testCoordinate'));

const myEmitter = scrawl.makeEmitter({

    name: 'use-raw-2d-context',
    world: myWorld,

    start: ['center', 'center'],

    historyLength: 100,

    generationRate: 60,
    killAfterTime: 5,
    killAfterTimeVariation: 0.1,

    artefact: scrawl.makeBlock({
        visibility: false,
    }),

    rangeX: 40,
    rangeFromX: -20,

    rangeY: 40,
    rangeFromY: -20,

    rangeZ: -1,
    rangeFromZ: -0.2,

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let engine = host.engine,
                history = particle.history,
                remaining, radius, alpha, x, y, z,
                endRad = Math.PI * 2;

            engine.save();
            engine.fillStyle = myWorld.get('particleColor');

            engine.beginPath();
            history.forEach((p, index) => {

                [remaining, z, x, y] = p;
                radius = 6 * (1 + (z / 3));
                alpha = remaining / myWorld.alphaDecay;

                if (radius > 0) {

                    engine.globalAlpha = alpha;
                    engine.moveTo(x, y);
                    engine.arc(x, y, radius, 0, endRad);
                }
            });
            engine.fill();
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

let mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            myEmitter.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();



// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: mouseCheck,
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

        'color-controller': ['particleColor', 'raw'],
        'world-speed': ['tickMultiplier', 'float'],
        'color-alpha': ['alphaDecay', 'float'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myEmitter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        generationRate: ['generationRate', 'int'],
        historyLength: ['historyLength', 'int'],
        killAfterTime: ['killAfterTime', 'float'],
        killAfterTimeVariation: ['killAfterTimeVariation', 'float'],
        'range_x': ['rangeX', 'float'],
        'rangefrom_x': ['rangeFromX', 'float'],
        'range_y': ['rangeY', 'float'],
        'rangefrom_y': ['rangeFromY', 'float'],
        'range_z': ['rangeZ', 'float'],
        'rangefrom_z': ['rangeFromZ', 'float'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: canvas,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        background: ['backgroundColor', 'raw'],
    },
});


const useGravity = function () {

    const selector = document.querySelector('#gravity');

    return function () {

        if (selector.value === "yes") {

            myEmitter.set({
                forces: ['gravity'],
            });
        }
        else {

            myEmitter.set({
                forces: [],
            });
        }
    }
}();
scrawl.addNativeListener(['input', 'change'], useGravity, '#gravity');

document.querySelector('#color-controller').value = '#F0F8FF';
document.querySelector('#world-speed').value = 2;
document.querySelector('#color-alpha').value = 6;
document.querySelector('#gravity').value = 'no';

document.querySelector('#generationRate').value = 60;
document.querySelector('#historyLength').value = 100;
document.querySelector('#killAfterTime').value = 5;
document.querySelector('#killAfterTimeVariation').value = 0.1;

document.querySelector('#range_x').value = 40;
document.querySelector('#rangefrom_x').value = -20;
document.querySelector('#range_y').value = 40;
document.querySelector('#rangefrom_y').value = -20;
document.querySelector('#range_z').value = -1;
document.querySelector('#rangefrom_z').value = -0.2;

// #### Development and testing
console.log(scrawl.library);

