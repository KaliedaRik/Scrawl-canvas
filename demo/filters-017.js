// # Demo Filters 017 
// Filter parameters: displace

// [Run code](../../demo/filters-017.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
scrawl.makeFilter({

    name: 'noise',
    method: 'image',

    asset: 'perlin',

    width: 500,
    height: 500,

    copyWidth: '100%',
    copyHeight: '100%',

    lineOut: 'map',
});

const myFilter = scrawl.makeFilter({

    name: 'displace',
    method: 'displace',

    lineMix: 'map',

    offsetX: 0,
    offsetY: 0,

    scaleX: 1,
    scaleY: 1,
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

    filters: ['noise', 'displace'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let scale_x = document.querySelector('#scale_x'),
        scale_y = document.querySelector('#scale_y'),
        offset_x = document.querySelector('#offset_x'),
        offset_y = document.querySelector('#offset_y'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Scales - x: ${scale_x.value} y: ${scale_y.value}
    Offsets - x: ${offset_x.value} y: ${offset_y.value}
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

        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        scale_x: ['scaleX', 'float'],
        scale_y: ['scaleY', 'float'],
        transparent_edges: ['transparentEdges', 'boolean'],
        opacity: ['opacity', 'float'],
    },
});

// Setup form
document.querySelector('#offset_x').value = 0;
document.querySelector('#offset_y').value = 0;
document.querySelector('#scale_x').value = 1;
document.querySelector('#scale_y').value = 1;
document.querySelector('#opacity').value = 1;
document.querySelector('#transparent_edges').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
