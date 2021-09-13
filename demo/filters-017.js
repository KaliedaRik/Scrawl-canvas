// # Demo Filters 017 
// Filter parameters: displace

// [Run code](../../demo/filters-017.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


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
const report = reportSpeed('#reportmessage', function () {

    return `    Scales - x: ${scaleX.value}, y: ${scaleY.value}
    Offset - x: ${offsetX.value}, y: ${offsetY.value}
    Opacity: ${opacity.value}`;
});


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
const offsetX = document.querySelector('#offset_x'),
    offsetY = document.querySelector('#offset_y'),
    scaleX = document.querySelector('#scale_x'),
    scaleY = document.querySelector('#scale_y'),
    opacity = document.querySelector('#opacity');

offsetX.value = 0;
offsetY.value = 0;
scaleX.value = 1;
scaleY.value = 1;
opacity.value = 1;

document.querySelector('#transparent_edges').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
