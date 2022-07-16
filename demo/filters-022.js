// # Demo Filters 022 
// Filter parameters: mapToGradient

// [Run code](../../demo/filters-022.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the gradients
const redToBlue = scrawl.makeGradient({
    name: 'red-to-blue',
    endX: '100%',

    easing: 'linear',
    precision: 1,

    colors: [
        [0, 'red'],
        [999, 'blue']
    ],
});

const blueToRed = scrawl.makeGradient({
    name: 'blue-to-red',
    endX: '100%',

    easing: 'linear',
    precision: 1,

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

    easing: 'linear',
    precision: 1,

    animateByDelta: true,
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

    easing: 'linear',
    precision: 1,

    animateByDelta: true,

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

// Test the ability to load a user-created easing algorithm into the gradient
const bespokeEasings = {

    'user-steps': (val) => {

        if (val < 0.2) return 0.1;
        if (val < 0.4) return 0.3;
        if (val < 0.6) return 0.5;
        if (val < 0.8) return 0.7;
        return 0.9;
    },
    'user-repeat': (val) => (val * 4) % 1,
};


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

// @ts-expect-error
    return `    Opacity - ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
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

scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    const items = {
        easing: val,
    };

    if (['user-steps', 'user-repeat'].includes(val)) items.easing = bespokeEasings[val];

    blueToRed.set(items);
    redToBlue.set(items);
    animatedGradient1.set(items);
    animatedGradient2.set(items);

}, '#easing');

// Setup form
const opacity = document.querySelector('#opacity');
// @ts-expect-error
opacity.value = 1;

// @ts-expect-error
document.querySelector('#useNaturalGrayscale').value = '0';
// @ts-expect-error
document.querySelector('#gradient').value = 'red-to-blue';
// @ts-expect-error
document.querySelector('#easing').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
