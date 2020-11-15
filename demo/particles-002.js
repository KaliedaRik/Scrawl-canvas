// # Demo Particles 002 
// Emitter using artefacts

// [Run code](../../demo/particles-002.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

scrawl.importDomImage('#bunny');

canvas.setBase({
    backgroundColor: '#000040',
});


let wheel = scrawl.makeWheel({ 

    name: 'particle-wheel-entity',
    radius: 16, 
    handle: ['center', 'center'],

    fillStyle: 'bisque',

    startAngle: 20,
    endAngle: -20,
    includeCenter: true,

    lineWidth: 2,
    method: 'fillThenDraw',
    visibility: false, 

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

let block = scrawl.makeBlock({ 

    name: 'particle-block-entity',
    dimensions: [30, 20],
    handle: ['center', 'center'],
    fillStyle: 'yellow',

    lineWidth: 2,
    method: 'fillThenDraw',
    visibility: false, 

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

let star = scrawl.makeStar({

    name: 'particle-star-entity',

    radius1: 18,
    radius2: 12,

    points: 5,

    handle: ['center', 'center'],

    fillStyle: 'papayawhip',
    lineWidth: 2,

    method: 'fillThenDraw',
    visibility: false, 

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

let picture = scrawl.makePicture({

    name: 'particle-image-entity',
    asset: 'bunny',

    width: 26,
    height: 37,

    handle: ['center', 'center'],

    copyWidth: '100%',
    copyHeight: '100%',

    lineWidth: 2,

    method: 'fillThenDraw',
    visibility: false, 

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

let phrase = scrawl.makePhrase({

    name: 'particle-phrase-entity',

    text: 'Hello',
    font: 'bold 40px Garamond, serif',

    handle: ['center', 'center'],

    fillStyle: 'green',

    lineWidth: 2,

    method: 'fillThenDraw',
    visibility: false, 

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});


// Create a World object; add some user-defined attributes to it
let myWorld = scrawl.makeWorld({

    name: 'demo-world',

    tickMultiplier: 2,

    userAttributes: [
        {
            key: 'particleColor', 
            defaultValue: '#b9b5df',
        },
        {
            key: 'alphaDecay', 
            defaultValue: 6,
        },
    ],
});


const myemitter = scrawl.makeEmitter({

    name: 'use-artefact',
    world: myWorld,

    start: ['center', 'center'],

    historyLength: 20,

    generationRate: 10,
    killAfterTime: 5,

    killRadius: 50, 
    killRadiusVariation: 0,

    artefact: star,

    rangeX: 40,
    rangeFromX: -20,

    rangeY: 40,
    rangeFromY: -20,

    rangeZ: -1,
    rangeFromZ: -0.2,

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let history = particle.history,
                fill = particle.fill,
                remaining, alpha, scale, roll, position, z;

            let {particleColor, alphaDecay} = myWorld;

            artefact.set({
                strokeStyle: particleColor,
                fillStyle: fill,
            });

            history.forEach((p, index) => {

                [remaining, z, ...position] = p;
                
                alpha = remaining / alphaDecay;
                if (alpha < 0) alpha = 0;

                roll = alpha * 720;

                scale = 1 + (z / 3);
                if (scale < 0.001) scale = 0; 

                // Do not stamp the artefact if we cannot see it
                if (alpha && scale) {

                    artefact.simpleStamp(host, {
                        start: position,
                        scale: scale,
                        globalAlpha: alpha,
                        roll: roll,
                    });
                }
                else p.isRunning = false;
            });
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

            myemitter.set({
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

    target: myemitter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        generationRate: ['generationRate', 'int'],
        historyLength: ['historyLength', 'int'],
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

const useArtefact = function () {

    const selector = document.querySelector('#artefact');

    let choice, val;

    return function () {

        val = selector.value;
        choice = false;

        switch (val) {

            case 'star' :
                choice = star;
                break;

            case 'wheel' :
                choice = wheel;
                break;

            case 'block' :
                choice = block;
                break;

            case 'picture' :
                choice = picture;
                break;

            case 'phrase' :
                choice = phrase;
                break;
        }

        if (choice) {

            myemitter.set({
                artefact: choice,
            });
        }
    }
}();
scrawl.addNativeListener(['input', 'change'], useArtefact, '#artefact');

const setLowColor = function () {

    const selector = document.querySelector('#min-fill'),
        colorFactory = myemitter.fillColorFactory;

    return function () {

        colorFactory.setMinimumColor(selector.value);
    }
}();
scrawl.addNativeListener(['input', 'change'], setLowColor, '#min-fill');

const setHighColor = function () {

    const selector = document.querySelector('#max-fill'),
        colorFactory = myemitter.fillColorFactory;

    return function () {

        colorFactory.setMaximumColor(selector.value);
    }
}();
scrawl.addNativeListener(['input', 'change'], setHighColor, '#max-fill');


document.querySelector('#min-fill').value = '#000000';
document.querySelector('#max-fill').value = '#ffffff';
document.querySelector('#color-controller').value = '#F0F8FF';
document.querySelector('#background').value = '#000040';
document.querySelector('#world-speed').value = 2;
document.querySelector('#color-alpha').value = 6;
document.querySelector('#generationRate').value = 10;
document.querySelector('#historyLength').value = 20;
document.querySelector('#artefact').value = 'star';

// #### Development and testing
console.log(scrawl.library);
