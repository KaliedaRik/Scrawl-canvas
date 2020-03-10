// ## Demo DOM 014 - second scene

// [Load and run multiple scripts on same page](../../demo/dom-014.html)
import scrawl from '../source/scrawl.js'

let canvas = scrawl.library.artefact.mycanvas2;
canvas.setAsCurrentCanvas();

canvas.set({
    css: {
        border: '1px solid black'
    }
});

let myRadial = scrawl.makeRadialGradient({
    name: 'circle-waves',

    startX: '30%',
    startY: '30%',
    endX: '50%',
    endY: '50%',

    endRadius: '50%',

    paletteStart: 200,
    paletteEnd: 800,

    delta: {
        paletteStart: -1,
        paletteEnd: -1
    },

    cyclePalette: true
})
.updateColor(0, 'black')
.updateColor(99, 'red')
.updateColor(199, 'black')
.updateColor(299, 'blue')
.updateColor(399, 'black')
.updateColor(499, 'gold')
.updateColor(599, 'black')
.updateColor(699, 'green')
.updateColor(799, 'black')
.updateColor(899, 'lavender')
.updateColor(999, 'black');

scrawl.makeGradient({
    name: 'colored-pipes',
    endX: '100%',
    cyclePalette: true
})
.updateColor(0, 'black')
.updateColor(49, 'yellow')
.updateColor(99, 'black')
.updateColor(149, 'lightyellow')
.updateColor(199, 'black')
.updateColor(249, 'goldenrod')
.updateColor(299, 'black')
.updateColor(349, 'lemonchiffon')
.updateColor(399, 'black')
.updateColor(449, 'gold')
.updateColor(499, 'black')
.updateColor(549, 'tan')
.updateColor(599, 'black')
.updateColor(649, 'wheat')
.updateColor(699, 'black')
.updateColor(749, 'yellowgreen')
.updateColor(799, 'black')
.updateColor(849, 'peachpuff')
.updateColor(899, 'black')
.updateColor(949, 'papayawhip')
.updateColor(999, 'black');

scrawl.makeGradient({
    name: 'linear',
    endX: '100%',
})
.updateColor(0, 'blue')
.updateColor(495, 'red')
.updateColor(500, 'yellow')
.updateColor(505, 'red')
.updateColor(999, 'green');

scrawl.makeBlock({
    name: 'cell-locked-block',

    width: 150,
    height: 150,

    startX: 180,
    startY: 120,

    handleX: 'center',
    handleY: 'center',

    fillStyle: 'linear',
    strokeStyle: 'coral',
    lineWidth: 6,

    delta: {
        roll: 0.5
    },

    method: 'fillAndDraw',

}).clone({
    name: 'entity-locked-block',

    scale: 1.2,
    startY: 480,

    lockFillStyleToEntity: true,

}).clone({
    name: 'animated-block',

    width: 160,
    height: 90,

    startY: 300,

    fillStyle: 'colored-pipes',
    lineWidth: 2,

    delta: {
        roll: -0.2
    },
});

scrawl.makeWheel({
    name: 'cell-locked-wheel',

    radius: 75,

    startX: 480,
    startY: 120,
    handleX: 'center',
    handleY: 'center',

    fillStyle: 'linear',
    strokeStyle: 'coral',
    lineWidth: 6,
    lineDash: [4, 4],

    delta: {
        roll: -0.5
    },

    method: 'fillAndDraw',

}).clone({
    name: 'entity-locked-wheel',

    scale: 1.2,
    startY: 480,

    lockFillStyleToEntity: true,

}).clone({
    name: 'animated-wheel',

    scale: 0.9,
    startY: 300,

    fillStyle: myRadial,
    lineWidth: 2,
    lineDash: [],

    delta: {
        roll: 0.2
    },
});

let tweenEngine = (start, change, position) => {

    let temp = 1 - position,
        val;

    val = (position < 0.5) ?
        start + ((position * position) * change * 2) :
        (start + change) + ((temp * temp) * -change * 2);

    return val % 1000;
};

let tweeny = scrawl.makeTween({
    name: 'mytween',
    targets: 'colored-pipes',
    duration: 5000,
    cycles: 1,
    definitions: [{
        attribute: 'paletteStart',
        integer: true,
        start: 0,
        end: 2999,
        engine: tweenEngine
    }, {
        attribute: 'paletteEnd',
        integer: true,
        start: 999,
        end: 3998,
        engine: tweenEngine
    }]
});

let current = scrawl.makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
});

let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage2');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        dragging = current();

        testMessage.textContent = `Animation threshhold set to 1.0
- 100% of the canvas must be visible for the animation to run
Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Currently dragging: ${(dragging) ? dragging.artefact.name : 'nothing'}`;
    };
}();

let animateGradients = function () {

    let dragging;

    return function () {

        myRadial.updateByDelta();
        dragging = current();

        if (dragging && dragging.artefact.name === 'animated-block' && !tweeny.isRunning()) tweeny.run();
    }
}();

let animation = scrawl.makeRender({

    name: 'demo-animation2',
    target: canvas,
    commence: animateGradients,
    afterShow: report,
});

// Switch animation on/off when at least 50% of canvas is showing - this is standard ES16 Javascript, not part of Scrawl-canvas
let observer = new IntersectionObserver((entries, observer) => {

    entries.forEach(entry => {

        console.log('observer B starts', animation.name, animation.isRunning(), entry.intersectionRatio, entry.isIntersecting);

        if (entry.isIntersecting && !animation.isRunning()) animation.run();
        else if (!entry.isIntersecting && animation.isRunning()) animation.halt();

        console.log('observer B completes', animation.name, animation.isRunning(), entry.intersectionRatio, entry.isIntersecting);
    });
}, { threshold: 1 });
observer.observe(canvas.domElement);

console.log('#014b', scrawl.library);
