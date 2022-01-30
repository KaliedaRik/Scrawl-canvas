// # Demo Particles 008 
// Net entity: generation and basic functionality, including Spring objects

// [Run code](../../demo/particles-008.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// Import image from DOM
scrawl.importDomImage('.flowers');


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});

// For this Demo, we are creating a flag and pinning it to a pole. This is the pole.
scrawl.makeLine({

    name: 'flagpole',

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
// @ts-expect-error
            x: world.wind,
            y: 0,
        });
    },
});

let changeWind = function () {

// @ts-expect-error
    let newWind = myWorld.wind + Math.random() - 0.5;

    if (newWind < -15) newWind = -15;
    if (newWind > 15) newWind = 15;

    myWorld.set({
// @ts-expect-error
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

// @ts-expect-error
        this.particleStore.forEach(p => {

            if (regex.test(p.name)) {

                // Change the appearance of the selected Particles, and remove the forces acting on them
                p.set({ 
                    fill: 'black',
                    stroke: 'black',
                    forces: [],
                });

                // Prevent Springs associated with the selected Particles from moving them
// @ts-expect-error
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


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Tick multiplier: ${tickMultiplier.value}\n    Particle mass: ${mass.value}\n    Rest length multiplier: ${restLength.value}\n    Wind speed: ${myWorld.wind.toFixed(2)}\n    Spring constant: ${springConst.value}\n    Damper constant: ${damperConst.value}`;
});

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

        myNet.restart();
    }
};
scrawl.addNativeListener(['input', 'change'], updateSprings, '.controlItem');

const springConst = document.querySelector('#springConstant'),
    mass = document.querySelector('#mass'),
    restLength = document.querySelector('#restLength'),
    tickMultiplier = document.querySelector('#tickMultiplier'),
    damperConst = document.querySelector('#damperConstant');

// @ts-expect-error
springConst.value = 50;
// @ts-expect-error
damperConst.value = 5;
// @ts-expect-error
restLength.value = 1;
// @ts-expect-error
mass.value = 1;
// @ts-expect-error
tickMultiplier.value = 2;

// @ts-expect-error
document.querySelector('#generate').value = 'weak-net';
// @ts-expect-error
document.querySelector('#engine').value = 'runge-kutta';


// #### Development and testing
console.log(scrawl.library);
