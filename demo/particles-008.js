// # Demo Particles 008 
// Net entity: generation and basic functionality, including Spring objects

// [Run code](../../demo/particles-008.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue',
});

scrawl.makeLine({

    startX: 'center',
    startY: 30,
    endX: 'center',
    endY: 'bottom',

    lineWidth: 30,
    lineCap: 'round',
    strokeStyle: 'brown',

    method: 'draw',
})


// Create a World object; add some user-defined attributes to it
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

scrawl.makeForce({

    name: 'wind',
    action: (particle, world, host) => {

        particle.load.vectorAdd({
            x: world.wind,
            y: 0,
        });
    },
});


const myNet = scrawl.makeNet({

    name: 'test-net',
    world: myWorld,

    startX: 'center',
    startY: 40,

    generate: 'weak-net',

    postGenerate: function () {

        const regex = RegExp('.*(-0-0|-4-0|-9-0)$');

        this.particleStore.forEach(p => {

            if (regex.test(p.name)) {

                p.set({ 
                    fill: 'black',
                    stroke: 'black',
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

    rows: 10,
    columns: 14,
    rowDistance: 15,
    columnDistance: '5%',
    showSprings: true,
    showSpringsColor: 'green',

    forces: ['gravity', 'wind'],

    engine: 'runge-kutta',

    artefact: scrawl.makeWheel({

        name: 'particle-wheel',
        radius: 3,

        handle: ['center', 'center'],

        method: 'fillThenDraw',
        fillStyle: 'gold',
        strokeStyle: 'blue',

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

}).run();


// #### Scene animation
let changeWind = function () {

    let newWind = myWorld.wind + Math.random() - 0.5;

    if (newWind < -15) newWind = -15;
    if (newWind > 15) newWind = 15;

    myWorld.set({
        wind: newWind,
    });
};

// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    let springConst = document.querySelector('#springConstant'),
        restLength = document.querySelector('#restLength'),
        tickMultiplier = document.querySelector('#tickMultiplier'),
        damperConst = document.querySelector('#damperConstant');


    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Tick multiplier: ${tickMultiplier.value}
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
        if (e.target.id === 'tickMultiplier') myWorld.set({ tickMultiplier: parseFloat(e.target.value)});

        myNet.restart();
    }
};
scrawl.addNativeListener(['input', 'change'], updateSprings, '.controlItem');

document.querySelector('#generate').value = 'weak-net';
document.querySelector('#springConstant').value = 50;
document.querySelector('#damperConstant').value = 10;
document.querySelector('#restLength').value = 1;
document.querySelector('#engine').value = 'runge-kutta';
document.querySelector('#tickMultiplier').value = 2;


// #### Development and testing
console.log(scrawl.library);
