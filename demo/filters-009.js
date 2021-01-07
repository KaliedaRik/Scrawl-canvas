// # Demo Filters 009 
// Filter parameters: chroma

// [Run code](../../demo/filters-009.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
// + Chroma filters can have more than one range; each range array should be added to the `ranges` attribute
const myFilter = scrawl.makeFilter({

    name: 'chroma',
    method: 'chroma',

    ranges: [[0, 0, 0, 92, 127, 92]],
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

    filters: ['chroma'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let lowCol = document.querySelector('#lowColor'),
        highCol = document.querySelector('#highColor');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    low color: ${lowCol.value}
    high color: ${highCol.value}
    range: [${myFilter.ranges}]`;
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
const interpretColors = function () {

    const converter = scrawl.makeColor({
        name: 'converter',
    });

    const lowColor = document.querySelector('#lowColor');
    const highColor = document.querySelector('#highColor');

    let lowRed = 0,
        lowGreen = 0,
        lowBlue = 0,
        highRed = 92,
        highGreen = 127,
        highBlue = 92;

    return function () {

        converter.convert(lowColor.value);

        lowRed = converter.r;
        lowGreen = converter.g;
        lowBlue = converter.b;

        converter.convert(highColor.value);

        highRed = converter.r;
        highGreen = converter.g;
        highBlue = converter.b;

        myFilter.set({

            ranges: [[lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue]],
        })
    }
}();
scrawl.addNativeListener(['input', 'change'], interpretColors, '.controlItem');

scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => myFilter.set({ opacity: parseFloat(e.target.value) }), 
    '#opacity');


// Setup form
document.querySelector('#lowColor').value = '#000000';
document.querySelector('#highColor').value = '#5c7f5c';
document.querySelector('#opacity').value = 1;


// #### Development and testing
console.log(scrawl.library);
