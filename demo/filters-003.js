// # Demo Filters 003 
// Filter parameters: brightness, saturation

// [Run code](../../demo/filters-003.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


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

scrawl.makeFilter({
    name: 'advancedbrightness',
    actions: [{
        action: 'modulate-channels',
        red: 1,
        green: 1,
        blue: 1,
        alpha: 1,
    }],
}).clone({
    name: 'advancedsaturation',
    actions: [{
        action: 'modulate-channels',
        red: 1,
        green: 1,
        blue: 1,
        alpha: 1,
        saturation: true,
    }],
});

const simpleFilters = [filter.brightness, filter.saturation];
const advancedFilters = [filter.advancedbrightness, filter.advancedsaturation];


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

}).clone({

    name: 'advanced-saturation-picture',
    startY: 200,
    filters: ['advancedsaturation'],

}).clone({

    name: 'advanced-brightness-picture',
    startX: 0,
    filters: ['advancedbrightness'],
});

scrawl.makePhrase({

    name: 'brightness-label',
    text: 'Brightness',

    font: '30px sans-serif',
    width: '45%',

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

}).clone({

    name: 'advanced-saturation-label',
    text: 'Modulate channels + saturation',
    pivot: 'advanced-saturation-picture',

}).clone({

    name: 'advanced-brightness-label',
    text: 'Modulate channels',
    pivot: 'advanced-brightness-picture',
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
    Level: ${level.value}
    Opacity: ${opacity.value}
    R: ${red.value}; G: ${green.value}; B: ${blue.value}; A: ${alpha.value}; `;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.addNativeListener(['input', 'change'], () => {

    simpleFilters.forEach(f => {
        f.set({
            opacity: opacity.value,
        });
    });

    advancedFilters.forEach(f => {
        f.set({
            actions: [{
                action: "modulate-channels",
                opacity: opacity.value,
                red: red.value,
                green: green.value,
                blue: blue.value,
                alpha: alpha.value,
                saturation: ('advancedsaturation' === f.name) ? true : false,
            }],
        });
    });

}, '#opacity');

scrawl.addNativeListener(['input', 'change'], () => {

    simpleFilters.forEach(f => {
        f.set({
            level: level.value,
        });
    });

}, '#level');

scrawl.addNativeListener(['input', 'change'], () => {

    advancedFilters.forEach(f => {
        f.set({
            actions: [{
                action: "modulate-channels",
                opacity: opacity.value,
                red: red.value,
                green: green.value,
                blue: blue.value,
                alpha: alpha.value,
                saturation: ('advancedsaturation' === f.name) ? true : false,
            }],
        });
    });

}, '.modulatecontrol');

// Setup form
const opacity = document.querySelector('#opacity');
const level = document.querySelector('#level');
const red = document.querySelector('#red');
const green = document.querySelector('#green');
const blue = document.querySelector('#blue');
const alpha = document.querySelector('#alpha');

opacity.value = 1;
level.value = 1;
red.value = 1;
green.value = 1;
blue.value = 1;
alpha.value = 1;


// #### Development and testing
console.log(scrawl.library);
