// # Demo Canvas 042 
// Filter parameters: grayscale, sepia, invert, brightness, saturation

// [Run code](../../demo/canvas-042.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    filter = scrawl.library.filter;

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
}).clone({
    name: 'brightness',
    method: 'brightness',
    level: 1,
}).clone({
    name: 'saturation',
    method: 'saturation',
});

const levelFilters = [filter.brightness, filter.saturation];

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

    name: 'invert-piccy',
    group: 'picture-filters',

    asset: 'iris',

    dimensions: ['40%', '40%'],
    start: ['50%', '50%'],
    handle: ['center', 'center'],

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['invert'],

}).clone({

    name: 'gray-piccy',
    start: ['25%', '25%'],
    filters: ['grayscale'],


}).clone({

    name: 'sepia-piccy',
    start: ['75%', '75%'],
    filters: ['sepia'],

}).clone({

    name: 'brightness-piccy',
    start: ['25%', '75%'],
    filters: ['brightness'],

}).clone({

    name: 'saturation-piccy',
    start: ['75%', '25%'],
    filters: ['saturation'],
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
    filterAlpha: ${scrawl.library.entity['invert-piccy'].filterAlpha}
    level: ${filter.brightness.level}`;
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
    },
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    levelFilters.forEach(f => f.set({ level: parseFloat(e.target.value) }));

}, '#level')

// Setup form
document.querySelector('#filterAlpha').value = 1;
document.querySelector('#level').value = 1;


// #### Development and testing
console.log(scrawl.library);
