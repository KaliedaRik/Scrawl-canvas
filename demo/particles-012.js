// # Demo Particles 012 
// Use Net entity particles as reference coordinates for other artefacts

// [Run code](../../demo/particles-012.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
scrawl.importDomImage('#bunny');

let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});


// #### Particle physics animation scene

// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,

});

// Create the Net entity and pin the top row of Particles
const myNet = scrawl.makeNet({

    name: 'test-net',
    world: myWorld,

    start: [50, 20],

    generate: 'weak-net',

    postGenerate: function () {

        const regex = RegExp('-0-[0-9]+$');

        this.particleStore.forEach(p => {

            if (regex.test(p.name)) {

                p.set({ forces: [] });

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

    forces: ['gravity'],

    mass: 3,
    springConstant: 200,

    engine: 'runge-kutta',

    showSpringsColor: 'lightGray',
    showSprings: true,

    particlesAreDraggable: true,

    artefact: scrawl.makeBlock({

        name: 'unseen-net-block',
        visibility: false, 
    }),
});


// Create a range of entitys which use Net Particles as their reference coordinate.
scrawl.makeBlock({

    name: 'block1',

    width: 80,
    height: 40,

    particle: 'test-net-3-3',
    lockTo: 'particle',

    strokeStyle: 'red',
    lineWidth: 5,

    method: 'draw',

}).clone({

    name: 'block2',
    particle: 'test-net-1-3',
});

scrawl.makeWheel({

    name: 'wheel1',

    radius: 50,
    handle: ['center', 'center'],

    particle: 'test-net-3-12',
    lockTo: 'particle',

    strokeStyle: 'blue',
    lineWidth: 5,

    method: 'draw',

}).clone({

    name: 'wheel2',
    particle: 'test-net-5-12',
});

scrawl.makePicture({

    name: 'bunny1',
    asset: 'bunny',

    width: 26,
    height: 37,

    handle: ['center', 'center'],

    copyWidth: '100%',
    copyHeight: '100%',

    particle: 'test-net-11-5',
    lockTo: 'particle',

    method: 'fill',

}).clone({

    name: 'bunny2',
    particle: 'test-net-11-6',

}).clone({

    name: 'bunny3',
    particle: 'test-net-11-7',

}).clone({

    name: 'bunny4',
    particle: 'test-net-11-8',

}).clone({

    name: 'bunny5',
    particle: 'test-net-11-9',
});

scrawl.makePhrase({

    name: 'phrase1',

    text: 'HELLO',
    font: '30px sans-serif',

    particle: 'test-net-7-1',
    lockTo: 'particle',

}).clone({

    name: 'phrase2',
    particle: 'test-net-9-15',
    handleX: 'right',
    handleY: 'bottom',
    lineHeight: 0.7,
});

scrawl.makeStar({

    name: 'star1',

    radius1: 12,
    radius2: 8,

    points: 5,

    handle: ['center', 'center'],

    fillStyle: 'gold',
    method: 'fillThenDraw',

    particle: 'test-net-11-4',
    lockTo: 'particle',

}).clone({

    name: 'star2',
    particle: 'test-net-11-10',
});


scrawl.makeLine({

    name: 'line1',

    particle: 'test-net-1-1',
    lockTo: 'particle',

    endParticle: 'test-net-5-2',
    endLockTo: 'particle',

    lineWidth: 8,
    strokeStyle: 'coral',
    lineCap: 'round',

    method: 'draw',

}).clone({

    name: 'line2',
    particle: 'test-net-5-2',
    endParticle: 'test-net-5-6',
});

scrawl.makeQuadratic({

    name: 'quad1',

    particle: 'test-net-1-7',
    lockTo: 'particle',

    controlParticle: 'test-net-3-12',
    controlLockTo: 'particle',

    endParticle: 'test-net-6-7',
    endLockTo: 'particle',

    lineWidth: 8,
    strokeStyle: 'olivedrab',
    lineCap: 'round',

    method: 'draw',

}).clone({

    name: 'quad2',
    particle: 'test-net-1-7',
    controlParticle: 'test-net-2-9',
    endParticle: 'test-net-3-7',
});

scrawl.makeBezier({

    name: 'bezier1',

    particle: 'test-net-8-5',
    lockTo: 'particle',

    startControlParticle: 'test-net-4-7',
    startControlLockTo: 'particle',

    endControlParticle: 'test-net-12-9',
    endControlLockTo: 'particle',

    endParticle: 'test-net-8-11',
    endLockTo: 'particle',

    lineWidth: 8,
    strokeStyle: 'purple',
    lineCap: 'round',

    method: 'draw',

}).clone({

    name: 'bezier2',
    particle: 'test-net-9-5',
    startControlParticle: 'test-net-5-7',
    endControlParticle: 'test-net-13-9',
    endParticle: 'test-net-9-11',
});

scrawl.makeTracer({

    name: 'trace-1',

    historyLength: 50,

    particle: 'test-net-11-13',
    lockTo: 'particle',

    artefact: scrawl.makeWheel({

        name: 'burn-1',

        radius: 5,

        handle: ['center', 'center'],

        fillStyle: 'teal',
        method: 'fill',
        visibility: false,
    }),

    stampAction: function (artefact, particle, host) {

        let history = particle.history,
            len = history.length,
            remaining, z, start;

        history.forEach((p, index) => {

            [remaining, z, ...start] = p;
            
            artefact.simpleStamp(host, {
                start,
                scale: (len - index) / len,
            });
        });
    },

}).clone({

    name: 'trace-2',
    particle: 'test-net-11-14',
    artefact: scrawl.library.entity['burn-1'].clone({ name: 'burn-2'}),
    
}).clone({

    name: 'trace-3',
    particle: 'test-net-12-14',
    artefact: scrawl.library.entity['burn-1'].clone({ name: 'burn-3'}),
    
}).clone({

    name: 'trace-4',
    particle: 'test-net-12-13',
    artefact: scrawl.library.entity['burn-1'].clone({ name: 'burn-4'}),
});

scrawl.makeEmitter({

    name: 'emitter-1',
    world: myWorld,

    particle: 'test-net-12-2',
    lockTo: 'particle',

    historyLength: 50,

    forces: ['gravity'],

    generationRate: 10,
    killAfterTime: 4,

    rangeX: 20,
    rangeFromX: -10,

    rangeY: 20,
    rangeFromY: -40,

    rangeZ: -1,
    rangeFromZ: -0.2,

    fillMinimumColor: 'yellow',
    fillMaximumColor: 'red',

    stampAction: function (artefact, particle, host) {

        let engine = host.engine,
            history = particle.history,
            len = history.length,
            remaining, radius, alpha, x, y, z,
            endRad = Math.PI * 2;

        let colorFactory = this.fillColorFactory;

        engine.save();
        engine.setTransform(1, 0, 0, 1, 0, 0);

        if (len > 0) {

            [remaining, z, x, y] = history[0];

            alpha = remaining / 7;

            if (alpha > 0) {

                engine.globalAlpha = alpha;

                history.forEach((p, index) => {

                    [remaining, z, x, y] = p;
                    radius = 2 * (1 + (z / 6));

                    if (radius > 0) {

                        engine.beginPath();
                        engine.moveTo(x, y);
                        engine.arc(x, y, radius, 0, endRad);
                        engine.fillStyle = colorFactory.get(1 - (index / len));
                        engine.fill();
                    }
                });
            }
        }
        engine.restore();
    },
});

scrawl.makePolyline({

    name: 'polyline-1',

    pins: [[0,0], [0,10], [120,10], [120,0]],
    tension: 0.3,

    particle: 'test-net-12-5',
    lockTo: 'particle',

    strokeStyle: 'cornflowerblue',
    lineWidth: 6,
    lineCap: 'round',
    lineJoin: 'round',
    method: 'draw',

}).clone({

    name: 'polyline-2',
    lockTo: 'start',

    tension: 0.4,
    closed: true,
    useParticlesAsPins: true,

    mapToPins: true,
    pins: ['test-net-0-1', 'test-net-0-2', 'test-net-0-3', 'test-net-0-4', 'test-net-0-5', 'test-net-0-6', 'test-net-0-7', 'test-net-0-8', 'test-net-0-9', 'test-net-0-10', 'test-net-0-11', 'test-net-0-12', 'test-net-0-13', 'test-net-0-14', 'test-net-0-15', 'test-net-1-16', 'test-net-2-16', 'test-net-3-16', 'test-net-4-16', 'test-net-5-16', 'test-net-6-16', 'test-net-7-16', 'test-net-8-16', 'test-net-9-16', 'test-net-10-16', 'test-net-11-16', 'test-net-12-16', 'test-net-13-16', 'test-net-14-15', 'test-net-14-14', 'test-net-14-13', 'test-net-14-12', 'test-net-14-11', 'test-net-14-10', 'test-net-14-9', 'test-net-14-8', 'test-net-14-7', 'test-net-14-6', 'test-net-14-5', 'test-net-14-4', 'test-net-14-3', 'test-net-14-2', 'test-net-14-1', 'test-net-13-0', 'test-net-12-0', 'test-net-11-0', 'test-net-10-0', 'test-net-9-0', 'test-net-8-0', 'test-net-7-0', 'test-net-6-0', 'test-net-5-0', 'test-net-4-0', 'test-net-3-0', 'test-net-2-0', 'test-net-1-0'],

    strokeStyle: 'rosybrown',

    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowBlur: 2,
    shadowColor: 'black',
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
// Make the Net Particles draggable
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
