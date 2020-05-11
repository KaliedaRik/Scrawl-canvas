// # Demo Canvas 029 
// Phrase entitys and gradients

// [Run code](../../demo/canvas-029.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.setBase({
    backgroundColor: 'aliceblue'
});


// Create Gradient
scrawl.makeGradient({
    name: 'linear',

    // endX: '100%',
    endY: '100%',
})
.updateColor(0, 'black')
.updateColor(49, 'red')
.updateColor(99, 'black')
.updateColor(149, 'orange')
.updateColor(199, 'black')
.updateColor(249, 'yellow')
.updateColor(299, 'black')
.updateColor(349, 'lightgreen')
.updateColor(399, 'black')
.updateColor(449, 'green')
.updateColor(499, 'black')
.updateColor(549, 'blue')
.updateColor(599, 'black')
.updateColor(649, 'indigo')
.updateColor(699, 'black')
.updateColor(749, 'violet')
.updateColor(799, 'black')
.updateColor(849, 'aliceblue')
.updateColor(899, 'black')
.updateColor(949, 'aliceblue')
.updateColor(999, 'black');

scrawl.makeQuadratic({

    name: 'my-quad',

    handleY: 'bottom',

    startX: '30%',
    startY: '90%',

    controlX: '60%',
    controlY: '70%',

    endX: '90%',
    endY: '90%',

    method: 'draw',

    useAsPath: true,
});


// Create Phrase entitys
scrawl.makePhrase({

    name: 'test-phrase-1',

    text: 'Test |ƒ∫ phrase',
    font: 'bold 46px Garamond, serif',

    width: '50%',
    justify: 'center',

    startX: '0%',
    startY: '10%',

    method: 'fill',

    fillStyle: 'linear',

}).clone({

    name: 'test-phrase-2',
    startX: '50%',

}).clone({

    name: 'test-phrase-3',
    startY: '30%',

    // lockFillStyleToEntity: true,

}).clone({

    name: 'test-phrase-4',

    roll: 80,
    scale: 0.8,
    startX: '10%',
    startY: '40%',

}).clone({

    name: 'test-phrase-5',

    roll: 0,
    scale: 1,

    order: 1,

    textPath: 'my-quad',

    lockFillStyleToEntity: false,

    delta: {
        textPathPosition: -0.005,
    }
});

scrawl.makePhrase({

    name: 'test-phrase-6',

    text: 'This is a much longer Phrase entity whose text should cross multiple lines. We need to check to see that the gradients get properly applied to each line of text.',

    font: 'bold 20px Garamond, serif',

    width: '40%',
    justify: 'left',
    lineHeight: 1.15,

    startX: '15%',
    startY: '30%',

    method: 'fill',

    fillStyle: 'linear',

}).clone({

    name: 'test-phrase-7',

    startX: '60%',
    startY: '50%',

    lockFillStyleToEntity: true,
});


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


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
