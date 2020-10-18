// # Demo Canvas 036 
// Cell functionality (functionality and associated tests needs to be expanded)

// [Run code](../../demo/canvas-036.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


canvas.set({

    backgroundColor: 'honeydew',

    // Make the Canvas adapt to changes in its container's dimensions
    checkForResize: true,

    // Cascade changes in the Canvas dimensions down to its base Cell
    isComponent: true,
});

// Create a shape track along which we can animate a Cell
scrawl.makeOval({

    name: 'mytrack',

    radiusX: '40%',
    radiusY: '40%',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    strokeStyle: '#808080',
    lineWidth: 10,
    method: 'draw',

    useAsPath: true,
    precision: 0.1,
});


// Create a Cell on the canvas
const cell1 = canvas.buildCell({

    name: 'cell-1',

    width: 100,
    height: 50,

    startX: 200,
    startY: 150,

    handleX: '20%',
    handleY: '50%',

    delta: {
        roll: -1,
    },

    backgroundColor: 'lightblue',
});

// Cells cannot be cloned (yet - may introduce that functionality in a future update)
const cell2 = canvas.buildCell({

    name: 'cell-2',

    width: '20%',
    height: '20%',

    startX: '60%',
    startY: '50%',

    handleX: 30,
    handleY: 50,

    delta: {
        roll: 0.4,
    },

    backgroundColor: 'pink',
});

// This Cell will animate along the track we created earlier
const cell3 = canvas.buildCell({

    name: 'cell-3',

    width: 100,
    height: 50,

    handleX: 'center',
    handleY: 'bottom',

    path: 'mytrack',
    lockTo: 'path',
    addPathRotation: true,
    constantPathSpeed: true,

    delta: {
      pathPosition: -0.001,
    },

    backgroundColor: 'black',
});

// Add labels to Cells
scrawl.makePhrase({

    name: 'label-1',
    group: 'cell-1',

    text: 'Cell 1',

    start: [5, 5],

}).clone({

    name: 'label-2',
    group: 'cell-2',

    text: 'Cell 2',

}).clone({

    name: 'label-3',
    group: 'cell-3',

    text: 'Cell 3',
    fillStyle: 'white',
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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Canvas dimensions: ${canvas.currentDimensions}
Base dimensions: ${canvas.base.currentDimensions}
Cell 1 dimensions: ${cell1.currentDimensions}
Cell 2 dimensions: ${cell2.currentDimensions}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
