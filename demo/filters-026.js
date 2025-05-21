// # Demo Filters 026
// Filter parameters: Swirl filter

// [Run code](../../demo/filters-026.html)
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
const swirl = scrawl.makeFilter({

    name: name('swirl'),
    method: 'swirl',
    startX: '50%',
    startY: 200,
    innerRadius: 0,
    outerRadius: '30%',
    angle: 90,
    staticSwirls: [
        ['20%', '20%', 0, '10%', 270, 'easeOutInSine'],
        ['20%', '80%', 0, '10%', -270, 'easeOutInSine'],
        ['80%', '80%', 0, '10%', -270, 'easeOutInSine'],
        ['80%', '20%', 0, '10%', 270, 'easeOutInSine']
    ]
});

// Test the ability to load a user-created easing algorithm into the gradient
const bespokeEasings = {

    'user-steps': (val) => {

        if (val < 0.2) return 0.1;
        if (val < 0.4) return 0.3;
        if (val < 0.6) return 0.7;
        if (val < 0.8) return 0.5;
        return 0.9;
    },
    'user-zigzag': (val) => {

        if (val < 0.3) return val * 3;
        else if (val < 0.7) return 0.9 - ((val - 0.3) * 2);
        else return 0.1 + ((val - 0.7) * 3);
    },
};

// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('swirl')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Start - x: ${swirl.startX}; y: ${swirl.startY}
    Radius - outer: ${swirl.outerRadius}; inner: ${swirl.innerRadius}
    Angle: ${dom.angle.value}
    Opacity: ${dom.opacity.value}`;
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
    ['input', 'start_xPercent', '50'],
    ['input', 'start_yPercent', '50'],
    ['input', 'start_xAbsolute', '200'],
    ['input', 'start_yAbsolute', '200'],
    ['input', 'innerRadius_percent', '0'],
    ['input', 'innerRadius_absolute', '0'],
    ['input', 'outerRadius_percent', '30'],
    ['input', 'outerRadius_absolute', '120'],
    ['input', 'angle', '90'],
    ['input', 'opacity', '1'],
    ['select', 'easing', 0],
]);


// Handle easing input
scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    if (['user-steps', 'user-zigzag'].includes(val)) {
        swirl.set({
            easing: bespokeEasings[val],
        });
    }
    else {
        swirl.set({
            easing: val,
        });
    }
}, '#easing');


// Handle all other user inputs
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: swirl,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        opacity: ['opacity', 'float'],
        start_xPercent: ['startX', '%'],
        start_yPercent: ['startY', '%'],
        start_xAbsolute: ['startX', 'round'],
        start_yAbsolute: ['startY', 'round'],
        innerRadius_percent: ['innerRadius', '%'],
        innerRadius_absolute: ['innerRadius', 'round'],
        outerRadius_percent: ['outerRadius', '%'],
        outerRadius_absolute: ['outerRadius', 'round'],
        angle: ['angle', 'round'],
        transparentEdges: ['transparentEdges', 'boolean'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
