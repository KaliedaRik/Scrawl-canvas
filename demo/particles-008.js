// # Demo Particles 008 
// Net entity: generation and basic functionality, including Spring objects

// [Run code](../../demo/particles-008.html)
import scrawl from '../source/scrawl.js'


// Import image from DOM
scrawl.importDomImage('.flowers');


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});

// For this Demo, we are creating a flag and pinning it to a pole. This is the pole.
scrawl.makeLine({

    startX: 'center',
    startY: 30,
    endX: 'center',
    endY: 'bottom',

    lineWidth: 8,
    lineCap: 'round',
    strokeStyle: 'brown',

    method: 'draw',
})


// #### Particle physics animation scene

// Create a World object which we can then assign to the Net entity
let myWorld = scrawl.makeWorld({

    name: 'demo-world',
    tickMultiplier: 2,

    userAttributes: [
        {
            key: 'wind', 
            defaultValue: 0,
        },
    ],
});

// Create a 'wind' force; we will update the wind direction/strength as part of the Display cycle
scrawl.makeForce({

    name: 'wind',
    action: (particle, world, host) => {

        particle.load.vectorAdd({
            x: world.wind,
            y: 0,
        });
    },
});

let changeWind = function () {

    let newWind = myWorld.wind + Math.random() - 0.5;

    if (newWind < -15) newWind = -15;
    if (newWind > 15) newWind = 15;

    myWorld.set({
        wind: newWind,
    });
};


// Create a Net entity
const myNet = scrawl.makeNet({

    name: 'test-net',

    // Every net __must__ be associated with a World object. The attribute's value can be the World object's String name value, or the object itself
    world: myWorld,

    // The entity's `start` coordinates determine where the first pin will be placed on the canvas
    startX: 'center',
    startY: 40,

    // The Net entity comes with four pre-defined `generate` functions - we will be testing 'weak-net' and 'strong-net' in this demo.
    // + We can define our own generate function if the pre-defined functions do not meet our needs.
    generate: 'weak-net',

    // The `postGenerate` function runs immediately after the `generate` function has created all of the Net entity's Particle and Spring objects.
    // + If the `generate` function has defined particles and/or springs that we do not need, we can kill them here
    // + We can also set the attributes of specified Particles, including making them static (immobile, unaffected by forces and springs applied to them)
    postGenerate: function () {

        // Names for 'weak-net' and 'strong-net' Particles are consistent: `${Net-entity-name}-${row-number}-${column-number}`
        const regex = RegExp('.*(-0-0|-4-0|-9-0)$');

        this.particleStore.forEach(p => {

            if (regex.test(p.name)) {

                // Change the appearance of the selected Particles, and remove the forces acting on them
                p.set({ 
                    fill: 'black',
                    stroke: 'black',
                    forces: [],
                });

                // Prevent Springs associated with the selected Particles from moving them
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

    // We tell the Net entity how many rows and columns of Particles we want it to create
    rows: 10,
    columns: 14,

    // The distance between rows and columns can be set using either absolute (px) Number values, or relative % String values
    rowDistance: 15,
    columnDistance: '5%',

    // We can get the Net entity to display its springs
    showSprings: true,
    showSpringsColor: 'green',

    // Particle physics attributes
    mass: 1,
    forces: ['gravity', 'wind'],
    engine: 'runge-kutta',
    damperConstant: 5,

    // We can assign an artefact that we will be using for the particle animation, or we can define it here as part of the Net factory
    artefact: scrawl.makeWheel({

        name: 'particle-wheel',
        radius: 3,

        handle: ['center', 'center'],

        method: 'fillThenDraw',
        fillStyle: 'gold',
        strokeStyle: 'blue',

        visibility: false, 

        globalAlpha: 1,

        noUserInteraction: true,
        noPositionDependencies: true,
        noFilters: true,
        noDeltaUpdates: true,
    }),

    // The `stampAction` function describes the steps that our Net will take to draw each of its particles (and springs, hit regions) onto the host canvas screen.
    stampAction: function (artefact, particle, host) {

        let [r, z, ...start] = particle.history[0];

        artefact.simpleStamp(host, { 
            start,
            fillStyle: particle.fill, 
            strokeStyle: particle.stroke, 
        });
    },
});

scrawl.makePicture({

    name: 'my-flower',
    asset: 'iris',

    copyStartX: 0,
    copyStartY: 0,

    copyWidth: '100%',
    copyHeight: '100%',

    visibility: false,
});


// ___The Loom entity definition___
let myMesh = scrawl.makeMesh({

    name: 'display-mesh',

    net: 'test-net',
    source: 'my-flower',

    method: 'fillThenDraw',

    visibility: false,
});



// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    let springConst = document.querySelector('#springConstant'),
        mass = document.querySelector('#mass'),
        restLength = document.querySelector('#restLength'),
        tickMultiplier = document.querySelector('#tickMultiplier'),
        damperConst = document.querySelector('#damperConstant');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Tick multiplier: ${tickMultiplier.value}
    Particle mass: ${mass.value}
    Rest length multiplier: ${restLength.value}
    Wind speed: ${myWorld.wind.toFixed(2)}
    Spring constant: ${springConst.value}
    Damper constant: ${damperConst.value}`;
    };
}();

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: changeWind,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
const updateSprings = function (e) {

    if (e && e.target && e.target.id) {

        if (e.target.id === 'springConstant') myNet.set({ springConstant: parseFloat(e.target.value)});
        if (e.target.id === 'damperConstant') myNet.set({ damperConstant: parseFloat(e.target.value)});
        if (e.target.id === 'restLength') myNet.set({ restLength: parseFloat(e.target.value)});
        if (e.target.id === 'generate') myNet.set({ generate: e.target.value});
        if (e.target.id === 'engine') myNet.set({ engine: e.target.value});
        if (e.target.id === 'mass') myNet.set({ mass: parseFloat(e.target.value)});
        if (e.target.id === 'tickMultiplier') myWorld.set({ tickMultiplier: parseFloat(e.target.value)});
        if (e.target.id === 'mesh') {
            if (parseInt(e.target.value, 10)) {
                myNet.set({
                    showSprings: false,
                });
                myNet.artefact.set({
                    globalAlpha: 0,
                });
                myMesh.set({
                    visibility: true,
                });
            }
            else {
                myNet.set({
                    showSprings: true,
                });
                myNet.artefact.set({
                    globalAlpha: 1,
                });
                myMesh.set({
                    visibility: false,
                });
            }
        }

        myNet.restart();
    }
};
scrawl.addNativeListener(['input', 'change'], updateSprings, '.controlItem');

document.querySelector('#generate').value = 'weak-net';
document.querySelector('#springConstant').value = 50;
document.querySelector('#damperConstant').value = 5;
document.querySelector('#restLength').value = 1;
document.querySelector('#mass').value = 1;
document.querySelector('#engine').value = 'runge-kutta';
document.querySelector('#tickMultiplier').value = 2;
document.querySelector('#mesh').value = '0';


// #### Development and testing
console.log(scrawl.library);
