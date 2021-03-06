// # Demo Filters 020 
// Parameters for: clampChannels filter

// [Run code](../../demo/filters-020.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


const myFilter = scrawl.makeFilter({

    name: 'clamp',
    method: 'clampChannels',

    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,
    highRed: 255,
    highGreen: 255,
    highBlue: 255,
    opacity: 1,
});


// Create the target entity
scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['clamp'],
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let lowRed = document.querySelector('#low-red'),
        lowGreen = document.querySelector('#low-green'),
        lowBlue = document.querySelector('#low-blue'),
        highRed = document.querySelector('#high-red'),
        highGreen = document.querySelector('#high-green'),
        highBlue = document.querySelector('#high-blue'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Red: ${lowRed.value} - ${highRed.value} 
    Green: ${lowGreen.value} - ${highGreen.value} 
    Blue: ${lowBlue.value} - ${highBlue.value} 
    Opacity - ${opacity.value}`;
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

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        'low-red': ['lowRed', 'round'],
        'low-green': ['lowGreen', 'round'],
        'low-blue': ['lowBlue', 'round'],
        'high-red': ['highRed', 'round'],
        'high-green': ['highGreen', 'round'],
        'high-blue': ['highBlue', 'round'],
        'opacity': ['opacity', 'float'],
    },
});

// Setup form
document.querySelector('#low-red').value = 0;
document.querySelector('#low-green').value = 0;
document.querySelector('#low-blue').value = 0;
document.querySelector('#high-red').value = 255;
document.querySelector('#high-green').value = 255;
document.querySelector('#high-blue').value = 255;
document.querySelector('#opacity').value = 1;


// #### Development and testing
console.log(scrawl.library);
