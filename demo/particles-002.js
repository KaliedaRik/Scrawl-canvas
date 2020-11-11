// # Demo Particles 002 
// Physics-based unit particles

// [Run code](../../demo/particles-002.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'midnightblue',
});

// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',

    tickMultiplier: 4,

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
    ],

    hello: 'Wonderful Person',
    testCoordinate: [100, 100],
});

// Test the World object's user-defined attributes
console.log(myWorld.get('hello'));
myWorld.set({ testCoordinate: ['center', 'center'] });
console.log(myWorld.get('testCoordinate'));


// // Create some physics-based unit particles
// scrawl.makeUnitPhysicsEmitter({

//     name: 'use-raw-2d-context',
//     world: myWorld,

//     position: [300, 300, 0],
//     velocity: [(Math.random() * 20) - 10, (Math.random() * 50) - 70, 0],
//     forces: ['gravity'],

//     historyLength: 100,
//     lifespan: 10,

//     artefact: scrawl.makeBlock({ visibility: false }),

//     stampAction: function (artefact, particle, host) {

//         let engine = host.engine,
//             history = particle.history,
//             remaining, x, y, z,
//             endRad = Math.PI * 2;

//         engine.save();
//         engine.fillStyle = 'red';
//         engine.globalAlpha = 1;

//         engine.beginPath();
//         history.forEach((p, index) => {

//             [remaining, z, x, y] = p;
//             engine.moveTo(x, y);
//             engine.arc(x, y, 2, 0, endRad);
//         });
//         engine.fill();
//         engine.restore();
//     },

//     completeAction: function () {

//         let { particle } = this;

//         if (particle) {

//             particle.set({
//                 position: [300, 300, 0],
//                 velocity: [(Math.random() * 20) - 10, (Math.random() * 50) - 70, 0],
//             });
//             this.run();
//         }
//     },
// });

// scrawl.makeUnitPhysicsEmitter({

//     name: 'single-physics-ball',
//     world: myWorld,

//     position: [300, 300, 0],
//     velocity: [(Math.random() * 20) - 10, (Math.random() * 50) - 70, Math.random() - 0.3],
//     forces: ['gravity'],

//     historyLength: 1,
//     lifespan: 8,

//     artefact: scrawl.makeWheel({ 
//         radius: 5, 
//         handle: ['center', 'center'],
//         fillStyle: 'blue',
//         visibility: false, 
//     }),


//     stampAction: function (artefact, particle, host) {

//         if (particle && particle.history && particle.history[0]) {

//             let [remaining, z, ...position] = particle.history[0],
//                 scale = 1 + (z / 3);

//             if (scale < 0.001) scale = 0.001; 

//             artefact.simpleStamp(host, {
//                 start: position,
//                 scale: scale,
//                 globalAlpha: remaining / 10,
//             });
//         }
//     },

//     completeAction: function () {

//         let { particle } = this;

//         if (particle) {

//             particle.set({
//                 position: [300, 300, 0],
//                 velocity: [(Math.random() * 20) - 10, (Math.random() * 50) - 70, Math.random() - 0.3],
//             });

//             this.run();
//         }
//     },
// });

// scrawl.makeUnitPhysicsEmitter({

//     name: 'multiple-simple-stamps',
//     world: myWorld,

//     position: [300, 300, 0],
//     velocity: [(Math.random() * 20) - 10, (Math.random() * 50) - 70, Math.random()],
//     forces: ['gravity'],

//     historyLength: 100,
//     lifespan: 9,

//     artefact: scrawl.makeWheel({ 

//         radius: 2, 
//         fillStyle: 'green',
//         visibility: false, 
//         handle: ['center', 'center'],
//     }),


//     stampAction: function (artefact, particle, host) {

//         if (particle && particle.history) {

//             particle.history.forEach((p, index) => {

//                 if (p && !(index % 4)) {

//                     let [remaining, z, ...position] = p;

//                     artefact.simpleStamp(host, {
//                         start: position,
//                         scale: 1 + (z / 4),
//                         globalAlpha: ((50 - index) / 50) / 3,
//                     });
//                 }
//             });
//         }
//     },

//     completeAction: function () {

//         let { particle } = this;

//         if (particle) {

//             particle.set({
//                 position: [300, 300, 0],
//                 velocity: [(Math.random() * 20) - 10, (Math.random() * 50) - 70, Math.random()],
//             });
//             this.run();
//         }
//     },
// });

// scrawl.makeSprayPhysicsEmitter({

//     name: 'single-physics-ball',
//     world: myWorld,

//     start: ['center', 'center'],

//     forces: ['gravity'],

//     historyLength: 1,

//     killParticleAfter: 8,
//     // killParticleBeyond: 500,

//     maxParticles: 2000,
//     batchParticlesIn: 5, 

//     artefact: scrawl.makeWheel({ 
//         radius: 5, 
//         handle: ['center', 'center'],
//         fillStyle: 'blue',
//         visibility: false, 
//     }),

//     rangeX: 60,
//     rangeFromX: -30,

//     rangeY: -50,
//     rangeFromY: -20,

//     rangeZ: 1,
//     rangeFromZ: 0,

//     stampAction: function (artefact, particle, host) {

//         if (particle && particle.history) {

//             particle.history.forEach(h => {

//                 if (h) {

//                     let [remaining, z, ...position] = h,
//                         scale = 1 + (z / 3),
//                         alpha = remaining / 10;

//                     artefact.simpleStamp(host, {
//                         start: position,
//                         scale: scale,
//                         globalAlpha: alpha,
//                     });
//                 }
//             });
//         }
//     },

// }).run();

const emitter1 = scrawl.makeEmitter({

    name: 'use-raw-2d-context',
    world: myWorld,

    start: ['center', 'center'],

    // lockTo: 'mouse',

    // forces: ['gravity'],

    historyLength: 100,

    killParticleAfter: 5,
    // killParticleBeyond: 500,

    maxParticles: 500,
    batchParticlesIn: 1, 

    // artefact: scrawl.makeWheel({ 
    //     radius: 5, 
    //     handle: ['center', 'center'],
    //     fillStyle: 'blue',
    //     visibility: false, 
    // }),
    artefact: scrawl.makeBlock(),

    rangeX: 40,
    rangeFromX: -20,

    rangeY: 40,
    rangeFromY: -20,

    // rangeX: 20,
    // rangeFromX: -10,

    // rangeY: -40,
    // rangeFromY: -40,

    rangeZ: -1,
    rangeFromZ: -0.2,

    stampAction: function (artefact, particle, host) {

//         let engine = host.engine,
//             history = particle.history,
//             remaining, x, y, z,
//             endRad = Math.PI * 2;

//         engine.save();
//         engine.fillStyle = 'red';
//         engine.globalAlpha = 1;

//         engine.beginPath();
//         history.forEach((p, index) => {

//             [remaining, z, x, y] = p;
//             engine.moveTo(x, y);
//             engine.arc(x, y, 2, 0, endRad);
//         });
//         engine.fill();
//         engine.restore();

        if (particle && particle.history) {

            let engine = host.engine,
                history = particle.history,
                remaining, radius, x, y, z,
                endRad = Math.PI * 2;

            engine.save();
            engine.fillStyle = 'aliceblue';

            engine.beginPath();
            history.forEach((p, index) => {

                [remaining, z, x, y] = p;
                radius = 6 * (1 + (z / 3));

                if (radius > 0) {

                    // engine.globalAlpha = remaining / 5;
                    engine.globalAlpha = remaining / 6;
                    engine.moveTo(x, y);
                    engine.arc(x, y, radius, 0, endRad);
                }
            });
            engine.fill();
            engine.restore();
        }
    },

}).run();

// const myblock = scrawl.makeBlock({

//     name: 'location-block',

//     start: ['center', 'center'],
//     handle: ['center', 'center'],
//     dimensions: [16, 12],
// });


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

let mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            emitter1.set({
                lockTo: (active) ? 'mouse' : 'start'
            });

            // if (active) emitter1.run();
            // else emitter1.halt();

            // if (active) {

            //     emitter1.set({
            //         // maxParticles: 500,
            //         batchParticlesIn: 1,
            //     })
            // }
            // else {

            //     emitter1.set({
            //         // maxParticles: 0,
            //         batchParticlesIn: 0,
            //     })
            // }
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


// #### Development and testing
console.log(scrawl.library);

