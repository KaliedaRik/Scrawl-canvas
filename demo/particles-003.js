// # Demo Particles 003 
// Position Emitter entity: start; pivot; mimic; path; mouse

// [Run code](../../demo/particles-003.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

scrawl.importDomImage('#bunny');

canvas.setBase({
    backgroundColor: 'aliceblue',
});


let wheel = scrawl.makeWheel({ 

    name: 'particle-wheel-entity',
    radius: 20, 
    handle: ['center', 'center'],

    startAngle: 20,
    endAngle: -20,
    includeCenter: true,

    fillStyle: 'darkred',
    method: 'fill',
    visibility: false, 

    noUserInteraction: true,
    noPositionDependencies: true,
    noFilters: true,
    noDeltaUpdates: true,
});

let block = scrawl.makeBlock({ 

    name: 'particle-block-entity',
    dimensions: [40, 16],
    handle: ['center', 'center'],

    fillStyle: 'darkblue',
    method: 'fill',
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

    fillStyle: 'gold',
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

    method: 'fill',
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
});

scrawl.makeBlock({ 

    name: 'pivot-entity',
    dimensions: [50, 30],
    start: ['20%', '20%'],
    handle: ['center', 'center'],
    order: 1,
    roll: 90,

    strokeStyle: 'red',
    lineWidth: 5,
    method: 'draw',

}).clone({

    name: 'mimic-entity',
    start: ['80%', '80%'],

    delta: {
        roll: 0.3,
    },

});

scrawl.makeShape({

    name: 'path-entity',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    scale: 0.5,
    roll: -90,
    flipUpend: true,
    scaleOutline: false,
    useAsPath: true,
    precision: 2,

    strokeStyle: 'green',
    lineWidth: 3,
    method: 'draw',
});

const myemitter = scrawl.makeEmitter({

    name: 'position-tester',
    world: myWorld,

    start: ['40%', '60%'],

    pivot: 'pivot-entity',
    addPivotRotation: true,

    mimic: 'mimic-entity',
    useMimicStart: true,
    useMimicRotation: true,

    path: 'path-entity',
    pathPosition: 0,
    addPathRotation: true,

    delta: {
        pathPosition: 0.0004,
    },

    historyLength: 1,

    generationRate: 50,
    killAfterTime: 5,

    killBeyondCanvas: true,

    artefact: star,

    rangeX: 40,
    rangeFromX: -20,

    rangeY: -40,
    rangeFromY: -10,

    rangeZ: -1,
    rangeFromZ: -0.2,

    stampAction: function (artefact, particle, host) {

        if (particle && particle.history) {

            let history = particle.history,
                fill = particle.fill,
                remaining, alpha, scale, position, z,
                roll = this.get('roll');

            history.forEach((p, index) => {

                [remaining, z, ...position] = p;
                
                alpha = remaining / 6;
                if (alpha < 0) alpha = 0;

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

    target: myemitter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        position: ['lockTo', 'raw'],
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
        }

        if (choice) {

            myemitter.set({
                artefact: choice,
            });
        }
    }
}();
scrawl.addNativeListener(['input', 'change'], useArtefact, '#artefact');


document.querySelector('#artefact').value = 'star';
document.querySelector('#position').value = 'start';

// #### Development and testing
console.log(scrawl.library);
