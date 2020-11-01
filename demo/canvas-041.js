// # Demo Canvas 041 
// Filter parameters: red, green, blue, cyan, magenta, yellow, notred, notgreen, notblue

// [Run code](../../demo/canvas-041.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

scrawl.makeFilter({
    name: 'red',
    method: 'red',
}).clone({
    name: 'green',
    method: 'green',
}).clone({
    name: 'blue',
    method: 'blue',
}).clone({
    name: 'cyan',
    method: 'cyan',
}).clone({
    name: 'magenta',
    method: 'magenta',
}).clone({
    name: 'yellow',
    method: 'yellow',
}).clone({
    name: 'notred',
    method: 'notred',
}).clone({
    name: 'notgreen',
    method: 'notgreen',
}).clone({
    name: 'notblue',
    method: 'notblue',
});

let piccy = scrawl.makePicture({

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',
});

let filterWheels = scrawl.makeGroup({

    name: 'wheel-filters',
    host: canvas.base.name,
});

scrawl.makeWheel({

    name: 'red-wheel',
    group: 'wheel-filters',
    radius: 50,

    startX: 80,
    startY: 80,

    handle: ['center', 'center'],

    method: 'fill',

    filters: ['red'],
    isStencil: true,

}).clone({

    name: 'green-wheel',
    startX: 200,
    filters: ['green'],

}).clone({

    name: 'blue-wheel',
    startX: 320,
    filters: ['blue'],

}).clone({

    name: 'cyan-wheel',
    startX: 80,
    startY: 200,
    filters: ['cyan'],

}).clone({

    name: 'magenta-wheel',
    startX: 200,
    filters: ['magenta'],

}).clone({

    name: 'yellow-wheel',
    startX: 320,
    filters: ['yellow'],

}).clone({

    name: 'notred-wheel',
    startX: 80,
    startY: 320,
    filters: ['notred'],

}).clone({

    name: 'notgreen-wheel',
    startX: 200,
    filters: ['notgreen'],

}).clone({

    name: 'notblue-wheel',
    startX: 320,
    filters: ['notblue'],
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

    target: filterWheels,

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
