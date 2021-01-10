// # Demo Filters 003 
// Filter parameters: brightness, saturation

// [Run code](../../demo/filters-003.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    filter = scrawl.library.filter;

scrawl.importDomImage('.flowers');


// Create the filters
scrawl.makeFilter({
    name: 'brightness',
    method: 'brightness',
    level: 1,
}).clone({
    name: 'saturation',
    method: 'saturation',
});

const levelFilters = [filter.brightness, filter.saturation];


// Create the target entitys
scrawl.makePicture({

    name: 'brightness-picture',

    asset: 'iris',

    dimensions: [200, 200],

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['brightness'],

}).clone({

    name: 'saturation-picture',
    startX: 200,
    filters: ['saturation'],
});

scrawl.makePhrase({

    name: 'brightness-label',
    text: 'Brightness',

    font: '30px sans-serif',

    fillStyle: 'white',
    lineWidth: 4,

    method: 'drawThenFill',

    pivot: 'brightness-picture',
    lockTo: 'pivot',
    offset: [5, 5],

}).clone({

    name: 'saturation-label',
    text: 'Saturation',
    pivot: 'saturation-picture',
})


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
// scrawl.addNativeListener(['input', 'change'], (e) => {

//     levelFilters.forEach(f => f.set({ opacity: parseFloat(e.target.value) }));

// }, '#opacity');

// scrawl.addNativeListener(['input', 'change'], (e) => {

//     levelFilters.forEach(f => f.set({ level: parseFloat(e.target.value) }));

// }, '#level');

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: filter.brightness,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        opacity: ['opacity', 'float'],
        level: ['level', 'float'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: filter.saturation,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        opacity: ['opacity', 'float'],
        level: ['level', 'float'],
    },
});

// Setup form
document.querySelector('#includeRed').options.selectedIndex = 1;
document.querySelector('#includeGreen').options.selectedIndex = 1;
document.querySelector('#includeBlue').options.selectedIndex = 1;
document.querySelector('#opacity').value = 1;
document.querySelector('#level').value = 1;


// #### Development and testing
console.log(scrawl.library);
