// # Demo Filters 003
// Filter parameters: brightness, saturation

// [Run code](../../demo/filters-003.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filters
scrawl.makeFilter({

    name: name('brightness'),
    method: 'brightness',
    level: 1,

}).clone({

    name: name('saturation'),
    method: 'saturation',
});

scrawl.makeFilter({

    name: name('advanced-brightness'),
    actions: [{
        action: 'modulate-channels',
        red: 1,
        green: 1,
        blue: 1,
        alpha: 1,
    }],

}).clone({

    name: name('advanced-saturation'),
    actions: [{
        action: 'modulate-channels',
        red: 1,
        green: 1,
        blue: 1,
        alpha: 1,
        saturation: true,
    }],
});

const simpleFilters = [
    scrawl.findFilter(name('brightness')),
    scrawl.findFilter(name('saturation')),
];

const advancedFilters = [
    scrawl.findFilter(name('advanced-brightness')),
    scrawl.findFilter(name('advanced-saturation')),
];


// Create the target entitys
const pictureGroup = scrawl.makeGroup({

    name: name('picture-group'),
    host: canvas.getBase(),
});

const labelGroup = scrawl.makeGroup({

    name: name('label-group'),
    host: canvas.getBase(),
});


scrawl.makePicture({

    name: name('brightness-picture'),
    group: pictureGroup,

    asset: 'iris',

    dimensions: [200, 200],

    copyDimensions: ['100%', '100%'],

    method: 'fill',

    filters: [name('brightness')],

}).clone({

    name: name('saturation-picture'),
    startX: 200,
    filters: [name('saturation')],

}).clone({

    name: name('advanced-saturation-picture'),
    startY: 200,
    filters: [name('advanced-saturation')],

}).clone({

    name: name('advanced-brightness-picture'),
    startX: 0,
    filters: [name('advanced-brightness')],
});

scrawl.makeLabel({

    name: name('brightness-label'),
    group: labelGroup,

    text: 'Brightness',

    fontString: '16px sans-serif',

    fillStyle: 'white',
    lineWidth: 4,

    method: 'drawThenFill',

    pivot: name('brightness-picture'),
    lockTo: 'pivot',
    offset: [5, 5],

}).clone({

    name: name('saturation-label'),
    text: 'Saturation',
    pivot: name('saturation-picture'),

}).clone({

    name: name('advanced-saturation-label'),
    text: 'Mod channels + saturation',
    pivot: name('advanced-saturation-picture'),

}).clone({

    name: name('advanced-brightness-label'),
    text: 'Mod channels',
    pivot: name('advanced-brightness-picture'),
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Level: ${dom.level.value}
    Opacity: ${dom.opacity.value}

    Red channel: ${dom.red.value}
    Green channel: ${dom.green.value}
    Blue channel: ${dom.blue.value}
    Alpha channel: ${dom.alpha.value}`;
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
    ['input', 'opacity', '1'],
    ['input', 'level', '1'],
    ['input', 'red', '1'],
    ['input', 'green', '1'],
    ['input', 'blue', '1'],
    ['input', 'alpha', '1'],
]);


scrawl.addNativeListener(['input', 'change'], () => {

    simpleFilters.forEach(f => {
        f.set({
            opacity: dom.opacity.value,
        });
    });

    advancedFilters.forEach(f => {
        f.set({
            actions: [{
                action: 'modulate-channels',
                opacity: dom.opacity.value,
                red: dom.red.value,
                green: dom.green.value,
                blue: dom.blue.value,
                alpha: dom.alpha.value,
                saturation: (name('advanced-saturation') === f.name) ? true : false,
            }],
        });
    });

}, dom.opacity);

scrawl.addNativeListener(['input', 'change'], () => {

    simpleFilters.forEach(f => {
        f.set({
            level: dom.level.value,
        });
    });

}, dom.level);

scrawl.addNativeListener(['input', 'change'], () => {

    advancedFilters.forEach(f => {
        f.set({
            actions: [{
                action: 'modulate-channels',
                opacity: dom.opacity.value,
                red: dom.red.value,
                green: dom.green.value,
                blue: dom.blue.value,
                alpha: dom.alpha.value,
                saturation: (name('advanced-saturation') === f.name) ? true : false,
            }],
        });
    });

}, '.modulatecontrol');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, pictureGroup);


// #### Development and testing
console.log(scrawl.library);
