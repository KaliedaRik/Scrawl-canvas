// ## Demo DOM 014 - first scene

// [Load and run multiple scripts on same page](../../demo/dom-014.html)
import scrawl from '../source/scrawl.js'

let canvas = scrawl.library.artefact.mycanvas1;
canvas.setAsCurrentCanvas();

canvas.setBase({
    backgroundColor: 'aliceblue',
});

let myPivot = scrawl.makeWheel({
    name: 'mouse-pivot',
    method: 'none',

    startX: 'center',
    startY: 'center',
});

let myblock = scrawl.makeBlock({
    name: 'base-block',

    width: 150,
    height: 100,

    handleX: 'center',
    handleY: 'center',

    offsetX: -140,
    offsetY: -50,

    pivot: 'mouse-pivot',
    lockTo: 'pivot',

    fillStyle: 'darkblue',
    strokeStyle: 'gold',
    method: 'fillAndDraw',

    lineWidth: 6,
    lineJoin: 'round',

    delta: {
        roll: 0.5,
    },
});

let mywheel = scrawl.makeWheel({
    name: 'base-wheel',

    radius: 60,
    startAngle: 35,
    endAngle: -35,

    handleX: 'center',
    handleY: 'center',

    offsetX: 140,
    offsetY: 50,

    pivot: 'mouse-pivot',
    lockTo: 'pivot',

    fillStyle: 'purple',
    strokeStyle: 'gold',
    method: 'fillAndDraw',

    lineWidth: 6,
    lineJoin: 'round',

    delta: {
        roll: -0.5,
    },
});

myblock.clone({
    name: 'pivot-block',

    height: 30,

    handleX: 'center',
    handleY: 'center',

    strokeStyle: 'red',
    lineWidth: 3,
    method: 'draw',

    pivot: 'base-block',
    lockTo: 'pivot',

    offsetX: 0,
    offsetY: 110,
    addPivotOffset: true,

    delta: {
        roll: 0,
    },

}).clone({
    name: 'pivot-wheel',

    pivot: 'base-wheel',
    addPivotRotation: true,

    handleX: 0,
    handleY: '50%',

    offsetY: 0,

}).clone({
    name: 'mimic-wheel',

    mimic: 'base-wheel',
    lockTo: 'mimic',

    width: 20,
    height: 20,

    handleX: 10,
    handleY: 10,

    strokeStyle: 'darkgreen',

    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicHandle: true,
    useMimicOffset: true,
    useMimicRotation: true,
    useMimicFlip: true,

    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: true,
    addOwnOffsetToMimic: false,
    addOwnRotationToMimic: false,
});

mywheel.clone({
    name: 'mimic-block',

    mimic: 'base-block',
    lockTo: 'mimic',

    width: 60,

    strokeStyle: 'darkgreen',
    lineWidth: 3,
    method: 'draw',

    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicHandle: false,
    useMimicOffset: true,
    useMimicRotation: true,

    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: false,
    addOwnOffsetToMimic: false,
    addOwnRotationToMimic: false,
});

let mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            myPivot.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();

let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage1');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Animation threshhold set to 0.5
 - 50% of canvas must be visible for animation to run
Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();

let animation = scrawl.makeRender({

    name: 'demo-animation1',
    target: canvas,
    commence: mouseCheck,
    afterShow: report,
    delay: true
});

// Switch animation on/off when at least 50% of canvas is showing - this is standard ES16 Javascript, not part of Scrawl-canvas
let observer = new IntersectionObserver((entries, observer) => {

    entries.forEach(entry => {

        console.log('observer A starts', animation.name, animation.isRunning(), entry.intersectionRatio, entry.isIntersecting);

        if (entry.isIntersecting && !animation.isRunning()) animation.run();
        else if (!entry.isIntersecting && animation.isRunning()) animation.halt();

        console.log('observer A completes', animation.name, animation.isRunning(), entry.intersectionRatio, entry.isIntersecting);
    });
}, { threshold: 0.5 });
observer.observe(canvas.domElement);

console.log('#014a', scrawl.library);
