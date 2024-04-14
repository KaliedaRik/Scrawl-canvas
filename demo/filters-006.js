// # Demo Filters 006
// Filter parameters: channelLevels

// [Run code](../../demo/filters-006.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('channel-levels'),
    method: 'channelLevels',

    red: [50, 200],
    green: [60, 220, 150],
    blue: [40, 180],
    alpha: [],
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('channel-levels')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Red: [${dom.red.value}]
    Green: [${dom.green.value}]
    Blue: [${dom.blue.value}]
    Alpha: [${dom.alpha.value}]
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
const dom = initializeDomInputs([
    ['input', 'red', '50, 200'],
    ['input', 'green', '60, 220, 150'],
    ['input', 'blue', '40, 180'],
    ['input', 'alpha', ''],
    ['input', 'opacity', '1'],
]);


// We're dealing with text input fields which need to be gathered into arrays
scrawl.addNativeListener(
    ['input', 'change'],
    (e) => {

        if (e && e.target) {

            const target = e.target.id,
                val = e.target.value;

            let a;

            if (target === 'opacity') a = val;
            else {

                const temp = val.split(',');
                a = [];
                temp.forEach(t => isFinite(t) && a.push(t));
            }

            myFilter.set({
                [target]: a,
            });
        }
    },
    '.controlItem'
);


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
