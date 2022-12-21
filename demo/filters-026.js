// # Demo Filters 026
// Filter parameters: Swirl filter

// [Run code](../../demo/filters-026.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

const swirl = scrawl.makeFilter({

    name: 'swirl',
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

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['swirl'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    Start - x: ${swirl.startX}; y: ${swirl.startY}\n    Radius - outer: ${swirl.outerRadius}; inner: ${swirl.innerRadius}\n    Angle: ${angle.value}\n    Opacity: ${opacity.value}`;
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

scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

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

// Setup form
const opacity = document.querySelector('#opacity');
const angle = document.querySelector('#angle');

// @ts-expect-error
opacity.value = 1;
// @ts-expect-error
angle.value = 90;

// @ts-expect-error
document.querySelector('#start_xPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_yPercent').value = 50;
// @ts-expect-error
document.querySelector('#start_xAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#start_yAbsolute').value = 200;
// @ts-expect-error
document.querySelector('#innerRadius_percent').value = 0;
// @ts-expect-error
document.querySelector('#innerRadius_absolute').value = 0;
// @ts-expect-error
document.querySelector('#outerRadius_percent').value = 30;
// @ts-expect-error
document.querySelector('#outerRadius_absolute').value = 120;
// @ts-expect-error
document.querySelector('#easing').options.selectedIndex = 0;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
