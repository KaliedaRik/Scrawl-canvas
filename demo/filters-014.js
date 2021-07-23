// # Demo Filters 014 
// Filter parameters: areaAlpha

// [Run code](../../demo/filters-014.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'areaAlpha',
    method: 'areaAlpha',

    tileWidth: 10,
    tileHeight: 10,
    gutterWidth: 10,
    gutterHeight: 10,
    offsetX: 0,
    offsetY: 0,
    areaAlphaLevels: [255, 255, 0, 0],
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

    filters: ['areaAlpha'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let tile_width = document.querySelector('#tile_width'),
        tile_height = document.querySelector('#tile_height'),
        gutter_width = document.querySelector('#gutter_width'),
        gutter_height = document.querySelector('#gutter_height'),
        alpha_0 = document.querySelector('#alpha_0'),
        alpha_1 = document.querySelector('#alpha_1'),
        alpha_2 = document.querySelector('#alpha_2'),
        alpha_3 = document.querySelector('#alpha_3'),
        offset_x = document.querySelector('#offset_x'),
        offset_y = document.querySelector('#offset_y'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Tile dimensions - width: ${tile_width.value} height: ${tile_height.value}
    Gutter dimensions - width: ${gutter_width.value} height: ${gutter_height.value}
    Offset - x: ${offset_x.value} y: ${offset_y.value}
    areaAlphaLevels array: [${alpha_0.value}, ${alpha_1.value}, ${alpha_2.value}, ${alpha_3.value}]
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
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        tile_width: ['tileWidth', 'round'],
        tile_height: ['tileHeight', 'round'],
        gutter_width: ['gutterWidth', 'round'],
        gutter_height: ['gutterHeight', 'round'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        opacity: ['opacity', 'float'],
    },
});

scrawl.addNativeListener(['input', 'change'], function (e) {

    let a0 = parseInt(document.querySelector('#alpha_0').value, 10),
        a1 = parseInt(document.querySelector('#alpha_1').value, 10),
        a2 = parseInt(document.querySelector('#alpha_2').value, 10),
        a3 = parseInt(document.querySelector('#alpha_3').value, 10);

        myFilter.set({
            areaAlphaLevels: [a0, a2, a1, a3],
        });

}, '.alphas');

// Setup form
document.querySelector('#tile_width').value = 10;
document.querySelector('#tile_height').value = 10;
document.querySelector('#gutter_width').value = 10;
document.querySelector('#gutter_height').value = 10;
document.querySelector('#offset_x').value = 0;
document.querySelector('#offset_y').value = 0;
document.querySelector('#opacity').value = 1;
document.querySelector('#alpha_0').value = 255;
document.querySelector('#alpha_1').value = 0;
document.querySelector('#alpha_2').value = 255;
document.querySelector('#alpha_3').value = 0;


// #### Development and testing
console.log(scrawl.library);
