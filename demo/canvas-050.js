// # Demo Canvas 050 
// Manipulate artefact delta animation values

// [Run code](../../demo/canvas-050.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Create a wheel entity which we can then bounce around the canvas
let myWheel = scrawl.makeWheel({

    name: 'ball',

    start: [300, '50%'],
    handle: ['center', 'center'],

    radius: 60,
    startAngle: 35,
    endAngle: -35,

    fillStyle: 'purple',
    strokeStyle: 'gold',
    lineWidth: 6,
    lineJoin: 'round',

    method: 'fillAndDraw',

    delta: {
        startX: 4,
        startY: '-0.3%',
        roll: -0.5,
    },
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,

    // We need to wait until the first Display cycle completes before setting up the delta constraint checking
    afterCreated: () => {

        myWheel.set({

            deltaConstraints: {
                startX: [50, 550, 'reverse'],
                startY: ['10%', '90%', 'reverse'],
                scale: [0.5, 2, 'reverse'],
            },
            checkDeltaConstraints: true,
        })
    },
});


// #### User interaction
scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.returnValue = false;

    switch (e.target.value) {

        case 'reverse' :
            myWheel.set({
                deltaConstraints: {
                    startX: [50, 550, 'reverse'],
                    startY: [0.5, 2, 'reverse'],
                    scale: [0.5, 2, 'reverse'],
                },
            });
            break;

        case 'loop' :
            myWheel.set({
                deltaConstraints: {
                    startX: [50, 550, 'loop'],
                    startY: ['10%', '90%', 'loop'],
                    scale: [0.5, 2, 'loop'],
                },
            });
            break;
    }
}, '#constraintAction');

scrawl.addNativeListener('click', (e) => {

    e.preventDefault();
    e.returnValue = false;

    let target = e.target;

    if (target) {

        if (parseInt(target.value, 10)) {

            target.value = '0';
            target.innerHTML = 'Add scaling';

            myWheel.setDeltaValues({
                scale: 'remove',
            });
        }
        else {

            target.value = '1';
            target.innerHTML = 'Remove scaling';

            myWheel.setDeltaValues({
                scale: 'newNumber:0.01',
            });
        }
    }

}, '#scaling');

document.querySelector('#scaling').value = '0';
document.querySelector('#scaling').innerHTML = 'Add scaling';
document.querySelector('#constraintAction').value = 'reverse';


// #### Development and testing
console.log(scrawl.library);
