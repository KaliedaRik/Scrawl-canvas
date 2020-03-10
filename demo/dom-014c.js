// ## Demo DOM 014 - third scene

// [Load and run multiple scripts on same page](../../demo/dom-014.html)
import scrawl from '../source/scrawl.js'

let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    element = artefact.myelement,
    canvas = artefact.mycanvas3,
    cell = canvas.base;

canvas.setAsCurrentCanvas();

stack.set({
    width: 600,
    height:400,
    perspectiveZ: 1200,
});


canvas.set({
    width: '100%',
    height:'100%',
    backgroundColor: 'black',
});

cell.set({
    width: '100%',
    height:'100%',
});

let testers = scrawl.makeGroup({

    name: 'testers',
    host: 'mystack',
});

element.set({

    group: 'testers',

    startX: 300,
    startY: 200,
    handleX: 100,
    handleY: 100,

    width: 200,
    height: 200,

    roll: 10,
    pitch: 20,
    yaw: 30,

    css: {
        borderWidth: '6px',
    },

    collides: true,
});

let baseColor = 'aliceblue',
    highlightColor = 'red',
    gridSize = 40;

let grid = scrawl.makeGroup({

    name: 'grid',
    host: cell.name,
});

for (let y = 0; y < 400; y += gridSize) {

    for (let x = 0; x < 600; x += gridSize) {

        scrawl.makeBlock({

            name: `grid-${x / gridSize}-${y / gridSize}`,
            group: 'grid',

            width: gridSize - 0.5,
            height: gridSize - 0.5,
            startX: x,
            startY: y,

            fillStyle: baseColor,

            method: 'fill',
        });
    }
}

scrawl.makeDragZone({

    zone: stack,
    collisionGroup: testers,
    endOn: ['up', 'leave'],
});

let checkHits = function () {

    let hits = [];

    return function () {

        hits.forEach(hit => hit.artefact.set({
            fillStyle: baseColor
        }));

        hits = grid.getArtefactCollisions(element);

        hits.forEach(hit => hit.artefact.set({
            fillStyle: highlightColor
        }));
    };
}();

let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage3');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Animation threshhold set to 0.0
- at least 1px of the stack must be visible for the animation to run
Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();

let animations = scrawl.makeRender({

    name: 'demo-animation3',
    target: [stack, canvas],
    afterCreated: () => element.set({ roll: 10.001 }),
    commence: checkHits,
    afterShow: report,
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: element,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        handle_xAbsolute: ['handleX', 'round'],
        handle_yAbsolute: ['handleY', 'round'],

        offset_xAbsolute: ['offsetX', 'round'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        pitch: ['pitch', 'float'],
        yaw: ['yaw', 'float'],
        scale: ['scale', 'float'],

        sensitivity: ['sensorSpacing', 'round'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: stack,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        perspective: ['perspectiveZ', 'round'],
    },
});


// Setup form
document.querySelector('#sensitivity').value = 50;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 10;
document.querySelector('#pitch').value = 20;
document.querySelector('#yaw').value = 30;
document.querySelector('#scale').value = 1;
document.querySelector('#perspective').value = 1200;

// Switch animation on/off when at least 1px of stack is showing - this is standard ES16 Javascript, not part of Scrawl-canvas
let observer = new IntersectionObserver((entries, observer) => {

    console.log('observer C starts', animations[0].name, animations[0].isRunning());

    // We're only observing the stack's DOM element here, but we need to switch both the stack and the canvas animation renders on or off
    entries.forEach(entry => {

        if (entry.isIntersecting) animations.forEach(anim => !anim.isRunning() && anim.run());
        else if (!entry.isIntersecting) animations.forEach(anim => anim.isRunning() && anim.halt());
    });

    console.log('observer C completes', animations[0].name, animations[0].isRunning());
    // The second IntersectionObserver argument is the options object
    // + passing an empty object will set the threshold value to 0.0
    // + which means if > 0px of the stack DOM element is visible, the animations will run 
}, {});
observer.observe(stack.domElement);

console.log('#014c', scrawl.library);
