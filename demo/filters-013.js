// # Demo Filters 013 
// Filter parameters: flood

// [Run code](../../demo/filters-013.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'flood',
    method: 'flood',

    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
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

    filters: ['flood'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let flood = document.querySelector('#flood'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Flood color: ${flood.value}
    Opacity: ${opacity.value}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Use a color object to convert between CSS hexadecimal and RGB decimal colors
const converter = scrawl.makeColor({
    name: 'converter',
});

scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => myFilter.set({ opacity: parseFloat(e.target.value) }), 
    '#opacity');

scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => {

        converter.convert(e.target.value);

        myFilter.set({ 
            red: converter.r,
            green: converter.g,
            blue: converter.b,
        });
    }, 
    '#flood');

// Setup form
document.querySelector('#flood').value = '#000000';
document.querySelector('#opacity').value = 1;


// #### Development and testing
console.log(scrawl.library);
