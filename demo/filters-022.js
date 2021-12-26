// # Demo Filters 022 
// Filter parameters: mapToGradient

// [Run code](../../demo/filters-022.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the gradients
scrawl.makeGradient({
    name: 'red-to-blue',
    endX: '100%',

    colors: [
        [0, 'red'],
        [999, 'blue']
    ],
});

scrawl.makeGradient({
    name: 'blue-to-red',
    endX: '100%',

    colors: [
        [999, 'red'],
        [0, 'blue']
    ],
});

const animatedGradient1 = scrawl.makeGradient({

    name: 'rainbow',
    endX: '100%',
    delta: {
        paletteStart: -1,
        paletteEnd: -1,
    },
    cyclePalette: true,
})
.updateColor(0, '#ff0000')
.updateColor(83, '#000000')
.updateColor(166, '#ffff00')
.updateColor(249, '#000000')
.updateColor(332, '#00ff00')
.updateColor(415, '#000000')
.updateColor(499, '#00ffff')
.updateColor(582, '#000000')
.updateColor(665, '#0000ff')
.updateColor(749, '#000000')
.updateColor(832, '#ff00ff')
.updateColor(915, '#000000')
.updateColor(999, '#ff0000');

const animatedGradient2 = scrawl.makeGradient({

    name: 'banded',
    endX: '100%',

    delta: {
        paletteStart: -1,
        paletteEnd: -1,
    },
    cyclePalette: true,

    colors: [
        [0, 'red'],
        [339, 'red'],
        [360, 'yellow'],
        [479, 'yellow'],
        [500, 'green'],
        [839, 'green'],
        [860, 'blue'],
        [979, 'blue'],
        [999, 'red']
    ],
});


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'my-filter',
    method: 'mapToGradient',

    gradient: 'red-to-blue',
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['my-filter'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Opacity - ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,

    commence: () => {
        animatedGradient1.updateByDelta();
        animatedGradient2.updateByDelta();
    },

    afterShow: report,
});


// #### User interaction
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        useNaturalGrayscale: ['useNaturalGrayscale', 'boolean'],
        gradient: ['gradient', 'raw'],
        opacity: ['opacity', 'float'],
    },
});

// Setup form
const opacity = document.querySelector('#opacity');
opacity.value = 1;

document.querySelector('#useNaturalGrayscale').value = '0';
document.querySelector('#gradient').value = 'red-to-blue';


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
