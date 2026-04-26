// # Demo Filters 017
// Filter parameters: displace

// [Run code](../../demo/filters-017.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const noiseFilter = scrawl.makeFilter({

    name: name('noise'),
    method: 'image',

    asset: 'perlin',

    copyWidth: '100%',
    copyHeight: '100%',

    backgroundColor: 'rgb(127 127 127 / 1)',

    lineOut: 'map',
});

console.log(noiseFilter.saveAsPacket());

const myFilter = scrawl.makeFilter({

    name: name('displace'),
    method: 'displace',

    lineMix: 'map',

    offsetX: 0,
    offsetY: 0,

    strengthX: 20,
    strengthY: 20,
});

console.log(myFilter.saveAsPacket());


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('noise'), name('displace')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
Displace
    Strength - x: ${dom.strength_x.value}, y: ${dom.strength_y.value}
    Offset - x: ${dom.offset_x.value}, y: ${dom.offset_y.value}
    Opacity: ${dom.opacity.value}

Asset
    Copy start - x: ${dom.copyStartX.value}%, y: ${dom.copyStartY.value}%
    Copy dimensions - width: ${dom.copyWidth.value}%, height: ${dom.copyHeight.value}%
    Paste offset - x: ${dom.image_offset_x.value}%, y: ${dom.image_offset_y.value}%
    Scale: ${dom.scale.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = scrawl.initializeDomInputs([
    ['input', 'offset_x', '0'],
    ['input', 'offset_y', '0'],
    ['input', 'strength_x', '20'],
    ['input', 'strength_y', '20'],
    ['input', 'opacity', '1'],
    ['select', 'transparent_edges', 0],
    ['select', 'useInputAsMask', 0],
    ['select', 'lineMix', 0],
    ['select', 'channelX', 0],
    ['select', 'channelY', 1],

    ['input', 'copyStartX', '0'],
    ['input', 'copyStartY', '0'],
    ['input', 'copyWidth', '100'],
    ['input', 'copyHeight', '100'],
    ['input', 'scale', '1'],

    ['select', 'asset', 0],
    ['input', 'image_offset_x', '0'],
    ['input', 'image_offset_y', '0'],
    ['select', 'fit', 0],
    ['select', 'smoothing', 0],
    ['select', 'positionX', 1],
    ['select', 'positionY', 1],
    ['select', 'lineOut', 0],
]);


// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        channelX: ['channelX', 'raw'],
        channelY: ['channelY', 'raw'],
        offset_x: ['offsetX', 'round'],
        offset_y: ['offsetY', 'round'],
        strength_x: ['strengthX', 'float'],
        strength_y: ['strengthY', 'float'],
        transparent_edges: ['transparentEdges', 'boolean'],
        useInputAsMask: ['useInputAsMask', 'boolean'],
        lineMix: ['lineMix', 'raw'],
        opacity: ['opacity', 'float'],
    },
});

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.assetControlItem',

    target: noiseFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        asset: ['asset', 'raw'],
        lineOut: ['lineOut', 'raw'],
        copyStartX: ['copyStartX', '%'],
        copyStartY: ['copyStartY', '%'],
        copyWidth: ['copyWidth', '%'],
        copyHeight: ['copyHeight', '%'],
        scale: ['scale', 'float'],
        fit: ['fit', 'raw'],
        smoothing: ['smoothing', 'boolean'],
        image_offset_x: ['offsetX', '%'],
        image_offset_y: ['offsetY', '%'],
        positionX: ['positionX', 'raw'],
        positionY: ['positionY', 'raw'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
