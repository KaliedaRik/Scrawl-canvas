// # Demo Filters 013
// Filter parameters: flood

// [Run code](../../demo/filters-013.html)
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

    name: name('flood'),
    method: 'flood',

    red: 255,
    green: 255,
    blue: 0,
    alpha: 255,

    opacity: 0.4,
});

const colorFactory = scrawl.makeColor({

    name: name('colors'),
});



// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('flood')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Reference color: ${dom.reference.value}
    Red: ${dom.red.value}
    Green: ${dom.green.value}
    Blue: ${dom.blue.value}
    Alpha: ${dom.alpha.value}
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
    ['input', 'reference', '#ffff00'],
    ['input', 'red', '255'],
    ['input', 'green', '255'],
    ['input', 'blue', '0'],
    ['input', 'alpha', '255'],
    ['input', 'opacity', '0.4'],
]);


// Handle user input from the color selector
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        const val = e.target.value;

        myFilter.set({ reference: val });

        const [r, g, b, a] = colorFactory.extractRGBfromColor(val);

        dom.red.value = `${r}`;
        dom.green.value = `${g}`;
        dom.blue.value = `${b}`;
        dom.alpha.value = `${Math.round(a * 255)}`;
    }
}, '.colorSelector');


// Handle remaining input updates
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        red: ['red', 'int'],
        green: ['green', 'int'],
        blue: ['blue', 'int'],
        alpha: ['alpha', 'int'],
        opacity: ['opacity', 'float'],
    },

    callback: () => {

        const val = (v) => parseInt(v, 10);

        dom.reference.value = colorFactory.convertRGBtoHex(
            val(dom.red.value),
            val(dom.green.value),
            val(dom.blue.value)
        );
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
