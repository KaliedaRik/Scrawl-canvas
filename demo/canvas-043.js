// # Demo Canvas 041 
// Filter parameters: red, green, blue, cyan, magenta, yellow, notred, notgreen, notblue

// [Run code](../../demo/canvas-041.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

scrawl.makeFilter({
    name: 'grayscale',
    method: 'grayscale',
}).clone({
    name: 'sepia',
    method: 'sepia',
}).clone({
    name: 'invert',
    method: 'invert',
});

let filterPics = scrawl.makeGroup({

    name: 'picture-filters',
    host: canvas.base.name,
});

scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',
});

scrawl.makePicture({

    name: 'gray-piccy',
    group: 'picture-filters',

    asset: 'iris',

    dimensions: ['40%', '40%'],
    start: ['25%', '25%'],
    handle: ['center', 'center'],

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['grayscale'],

}).clone({

    name: 'invert-piccy',
    start: ['50%', '50%'],
    filters: ['invert'],

}).clone({

    name: 'sepia-piccy',
    start: ['75%', '75%'],
    filters: ['sepia'],
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
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: filterPics,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        filterAlpha: ['filterAlpha', 'float'],
        filterComposite: ['filterComposite', 'raw'],
    },
});

// Setup form
document.querySelector('#filterAlpha').value = 1;
document.querySelector('#filterComposite').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
