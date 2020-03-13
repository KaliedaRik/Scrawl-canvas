// ## Demo DOM 008

// [3d animated cube](../../demo/dom-008.html)
import scrawl from '../source/scrawl.js'


// Scene setup
let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    cube = artefact.cube;


let faces = scrawl.makeGroup({
    name: 'faces',
    host: 'mystack',
}).addArtefacts('leftface', 'rightface', 'topface', 'bottomface', 'frontface', 'backface');


stack.set({
    perspectiveX: '50%',
    perspectiveY: '50%',
    perspectiveZ: 1200
});


cube.set({
    order: 1,
    width: 0,
    height: 0,
    startX: 'center',
    startY: 'center',
    handleX: 'center',
    handleY: 'center',
    lockTo: 'start',
    css: {
        border: '20px solid black',
    },
    delta: {
        roll: 0.4,
        pitch: 0.8,
        yaw: 1.2,
    },
});


faces.setArtefacts({
    order: 2,
    width: 200,
    height: 200,
    startX: 'center',
    startY: 'center',
    handleX: 'center',
    handleY: 'center',
    offsetZ: 100,
    lockTo: 'pivot',
    pivot: 'cube',
    addPivotRotation: true,
    css: {
        border: '1px solid blue',
        textAlign: 'center'
    }
});


artefact.frontface.set({
    css: { backgroundColor: 'rgba(255, 0, 0, 0.4)' },
});
artefact.rightface.set({
    css: { backgroundColor: 'rgba(0, 0, 127, 0.4)' },
    yaw: 90,
});
artefact.topface.set({
    css: { backgroundColor: 'rgba(0, 255, 0, 0.4)' },
    pitch: 90,
});
artefact.backface.set({
    css: { backgroundColor: 'rgba(127, 0, 0, 0.4)' },
    pitch: 180,
});
artefact.leftface.set({
    css: { backgroundColor: 'rgba(0, 0, 255, 0.4)' },
    yaw: 270,
});
artefact.bottomface.set({
    css: { backgroundColor: 'rgba(0, 127, 0, 0.4)' },
    pitch: 270,
});


// Function to check whether mouse cursor is over stack, and lock the element artefact accordingly
let stackCheck = function () {

    let active = false;

    return function () {

        if (stack.here.active !== active) {

            active = stack.here.active;

            cube.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, text,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

    name: 'demo-animation',
    target: stack,
    commence: stackCheck,
    afterShow: report,
});
