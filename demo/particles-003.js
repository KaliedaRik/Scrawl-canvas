// # Demo Particles 003 
// Emitter positioning

// [Run code](../../demo/particles-003.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

scrawl.importDomImage('#bunny');

canvas.setBase({
    backgroundColor: '#000040',
});


let wheel = scrawl.makeWheel({ 

    name: 'particle-wheel-entity',
    radius: 10, 
    handle: ['center', 'center'],

    fillStyle: 'bisque',

    startAngle: 20,
    endAngle: -20,
    includeCenter: true,

    lineWidth: 2,
    method: 'fillThenDraw',
    visibility: false, 
});

let block = scrawl.makeBlock({ 

    name: 'particle-block-entity',
    dimensions: [20, 8],
    handle: ['center', 'center'],
    fillStyle: 'yellow',

    lineWidth: 2,
    method: 'fillThenDraw',
    visibility: false, 
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
})

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

    name: 'use-raw-2d-context',
    world: myWorld,

    start: ['center', 'center'],

    historyLength: 5,

    killParticleAfter: 5,

    maxParticles: 500,
    batchParticlesIn: 1, 

    particleChoke: 0,

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
                remaining, alpha, scale, roll, position, z;

            let {particleColor, alphaDecay} = myWorld;

            history.forEach((p, index) => {

                [remaining, z, ...position] = p;
                
                alpha = remaining / alphaDecay;
                if (alpha < 0) alpha = 0;

                roll = alpha * 720;

                scale = 1 + (z / 3);
                if (scale < 0.001) scale = 0; 

                if (alpha && scale) {

                    artefact.simpleStamp(host, {
                        start: position,
                        scale: scale,
                        globalAlpha: alpha,
                        strokeStyle: particleColor,
                        roll: roll,
                    });
                }
            })
        }
    },

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

        maxParticles: ['maxParticles', 'int'],
        particleChoke: ['particleChoke', 'int'],
        historyLength: ['historyLength', 'int'],
        killParticleAfter: ['killParticleAfter', 'int'],
        batchParticlesIn: ['batchParticlesIn', 'int'],
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


document.querySelector('#color-controller').value = '#F0F8FF';
document.querySelector('#world-speed').value = 2;
document.querySelector('#color-alpha').value = 6;
document.querySelector('#maxParticles').value = 500;
document.querySelector('#particleChoke').value = 0;
document.querySelector('#historyLength').value = 5;
document.querySelector('#killParticleAfter').value = 5;
document.querySelector('#batchParticlesIn').value = 1;
document.querySelector('#artefact').value = 'star';

// #### Development and testing
console.log(scrawl.library);
