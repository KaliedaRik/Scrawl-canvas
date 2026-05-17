// # Demo Canvas 008
// Picture entity position; manipulate copy attributes

// [Run code](../../demo/canvas-008.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import image from DOM, and create Picture entity using it
scrawl.importDomImage('.flowers');


scrawl.makeGradient({

    name: name('stroke-gradient'),
    endX: '33%',
    spread: 'reflect',
    operations: [{
        operation: 'add-noise',
        stage: 'after-spread',
        parameters: {
            noise: 'bluenoise',
            strength: 0.08,
        },
    }],
});

scrawl.makePattern({

    name: name('stroke-pattern'),
    asset: 'brick',
});

const piccy = scrawl.makePicture({

    name: name('myFlower'),
    asset: 'iris',

    width: 200,
    height: 200,

    startX: 300,
    startY: 200,
    handleX: 100,
    handleY: 100,

    copyWidth: 200,
    copyHeight: 200,
    copyStartX: 100,
    copyStartY: 100,

    lineWidth: 10,
    strokeStyle: 'gold',

    order: 1,
    method: 'drawAndFill',

});

// Create a second Picture entity, this time pulling in the image dynamically
piccy.clone({

    name: name('myFactory'),
    imageSource: 'img/canalFactory-800.webp',

    width: 600,
    height: 400,

    startX: 0,
    startY: 0,
    handleX: 0,
    handleY: 0,

    copyWidth: 600,
    copyHeight: 400,
    copyStartX: 150,
    copyStartY: 0,

    order: 0,
    method: 'fill',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    // Getting values using this approach allows us to see the raw, unprocessed values held by the entity.
    // + Use piccy.get('attributeName') to obtain the processed values being used by the entity
    const [copyW, copyH] = piccy.copyDimensions;
    const [copyX, copyY] = piccy.copyStart;
    const [pasteX, pasteY] = piccy.start;
    const [pasteW, pasteH] = piccy.dimensions;
    const [handleX, handleY] = piccy.handle;

    const {roll, scale} = piccy;

    return `    Copy - x: ${copyX}, y: ${copyY}, w: ${copyW}, h: ${copyH}
    Paste - x: ${pasteX}, y: ${pasteY}, w: ${pasteW}, h:${pasteH}
    Handle - x: ${handleX}, y: ${handleY}
    Roll: ${roll}; Scale: ${scale}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: piccy,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        copy_start_xPercent: ['copyStartX', '%'],
        copy_start_xAbsolute: ['copyStartX', 'round'],

        copy_start_yPercent: ['copyStartY', '%'],
        copy_start_yAbsolute: ['copyStartY', 'round'],

        copy_dims_widthPercent: ['copyWidth', '%'],
        copy_dims_widthAbsolute: ['copyWidth', 'round'],

        copy_dims_heightPercent: ['copyHeight', '%'],
        copy_dims_heightAbsolute: ['copyHeight', 'round'],

        paste_dims_widthPercent: ['width', '%'],
        paste_dims_widthAbsolute: ['width', 'round'],

        paste_dims_heightPercent: ['height', '%'],
        paste_dims_heightAbsolute: ['height', 'round'],

        paste_start_xPercent: ['startX', '%'],
        paste_start_xAbsolute: ['startX', 'round'],
        paste_start_xString: ['startX', 'raw'],

        paste_start_yPercent: ['startY', '%'],
        paste_start_yAbsolute: ['startY', 'round'],
        paste_start_yString: ['startY', 'raw'],

        paste_handle_xPercent: ['handleX', '%'],
        paste_handle_xAbsolute: ['handleX', 'round'],
        paste_handle_xString: ['handleX', 'raw'],

        paste_handle_yPercent: ['handleY', '%'],
        paste_handle_yAbsolute: ['handleY', 'round'],
        paste_handle_yString: ['handleY', 'raw'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],

        scaleOutline: ['scaleOutline', 'boolean'],
        scaleShadow: ['scaleShadow', 'boolean'],
        shadowBlur: ['shadowBlur', 'round'],
        shadowOffsetX: ['shadowOffsetX', 'round'],
        shadowOffsetY: ['shadowOffsetY', 'round'],
        lineWidth: ['lineWidth', 'round'],
        method: ['method', 'raw'],
        strokeStyle: ['strokeStyle', 'raw'],
        lockStrokeStyleToEntity: ['lockStrokeStyleToEntity', 'boolean'],
    },
});

// Setup form
scrawl.initializeDomInputs([
    ['input', 'copy_dims_heightAbsolute', '200'],
    ['input', 'copy_dims_heightPercent', '50'],
    ['input', 'copy_dims_widthAbsolute', '200'],
    ['input', 'copy_dims_widthPercent', '50'],
    ['input', 'copy_start_xAbsolute', '100'],
    ['input', 'copy_start_xPercent', '25'],
    ['input', 'copy_start_yAbsolute', '100'],
    ['input', 'copy_start_yPercent', '25'],
    ['input', 'lineWidth', '10'],
    ['input', 'paste_dims_heightAbsolute', '200'],
    ['input', 'paste_dims_heightPercent', '50'],
    ['input', 'paste_dims_widthAbsolute', '200'],
    ['input', 'paste_dims_widthPercent', '33'],
    ['input', 'paste_handle_xAbsolute', '100'],
    ['input', 'paste_handle_xPercent', '50'],
    ['input', 'paste_handle_yAbsolute', '100'],
    ['input', 'paste_handle_yPercent', '50'],
    ['input', 'paste_start_xAbsolute', '300'],
    ['input', 'paste_start_xPercent', '50'],
    ['input', 'paste_start_yAbsolute', '200'],
    ['input', 'paste_start_yPercent', '50'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'shadowBlur', '0'],
    ['input', 'shadowOffsetX', '0'],
    ['input', 'shadowOffsetY', '0'],
    ['select', 'lockStrokeStyleToEntity', 0],
    ['select', 'method', 3],
    ['select', 'paste_handle_xString', 1],
    ['select', 'paste_handle_yString', 1],
    ['select', 'paste_start_xString', 1],
    ['select', 'paste_start_yString', 1],
    ['select', 'reverse', 0],
    ['select', 'scaleOutline', 1],
    ['select', 'scaleShadow', 0],
    ['select', 'strokeStyle', 0],
    ['select', 'upend', 0],
]);


// #### Development and testing
console.log(scrawl.library);
