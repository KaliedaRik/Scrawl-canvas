// # Demo Particles 009 
// Net particles: drag-and-drop; collisions

// [Run code](../../demo/particles-009.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'slategray',
});

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


scrawl.makeGroup({

    name: 'static-objects',
    host: canvas.base.name,
});

scrawl.makeWheel({

    name: 'big-ball',
    group: 'static-objects',
    radius: 80,
    start: [120,240],

    fillStyle: 'lavender',
    strokeStyle: 'red',
    lineWidth: 3,
    method: 'fillThenDraw',
});

scrawl.makeBlock({

    name: 'big-block',
    group: 'static-objects',
    width: 115,
    height: 115,
    roll: 45,
    start: [420,240],

    fillStyle: 'lavender',
    strokeStyle: 'red',
    lineWidth: 3,
    method: 'fillThenDraw',
});

// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,
});

const myNet = scrawl.makeNet({

    name: 'test-net',
    world: myWorld,

    pivot: 'topline',
    lockTo: 'pivot',

    generate: 'weak-net',

    postGenerate: function () {

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

    rows: 12,
    columns: 17,
    rowDistance: 25,
    columnDistance: 30,
    showSprings: true,
    showSpringsColor: 'azure',

    forces: ['gravity'],

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

        if (particle && particle.history && particle.history[0]) {

            let [r, z, startX, startY] = particle.history[0];

            artefact.simpleStamp(host, { 
                startX, 
                startY,
                fillStyle: particle.fill, 
                strokeStyle: particle.stroke, 
            });
        }
    },

    particlesAreDraggable: true,
    showHitRadius: true,
    hitRadiusColor: 'red',

}).run();


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
// Make the Emitter draggable
scrawl.makeGroup({

    name: 'my-draggable-group',

}).addArtefacts('test-net');

scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'my-draggable-group',
    endOn: ['up', 'leave'],
});


// #### Development and testing
console.log(scrawl.library);
