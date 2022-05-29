// # Demo Canvas 020 
// Testing createImageFromXXX functionality

// [Run code](../../demo/canvas-020.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas,
    hold = scrawl.library.artefact.holdcanvas;


// Create gradients
let myGrad = scrawl.makeGradient({
    name: 'linear1',
    endX: '100%',
    colors: [
        [0, 'pink'],
        [999, 'darkgreen']
    ],
}).clone({
    name: 'linear2',
    colors: [
        [0, 'darkblue'],
        [999, 'white']
    ],
}).clone({
    name: 'linear3',
    colors: [
        [0, 'yellow'],
        [999, 'purple']
    ],
}).clone({
    name: 'linear4',
    colors: [
        [0, 'black'],
        [999, 'coral']
    ],
});


// Create entitys
let block1 = scrawl.makeBlock({
    name: 'b1',
    group: canvas.base.name,

    width: '70%',
    height: '70%',
    startX: '5%',
    startY: '5%',

    fillStyle: 'linear1',
    lockFillStyleToEntity: true,
    strokeStyle: 'coral',
    lineWidth: 4,
    method: 'fillThenDraw',
});

let block2 = block1.clone({
    name: 'b2',
    startX: '70%',
    startY: '65%',
    handleX: 'center',
    handleY: 'center',
    scale: 0.5,
    fillStyle: 'linear2',
    strokeStyle: 'red',

    delta: {
        roll: -0.5
    },
    order: 1,
});

let wheel1 = scrawl.makeWheel({
    name: 'w1',
    group: canvas.base.name,

    radius: '15%',
    startX: '80%',
    startY: '30%',
    handleX: 'center',
    handleY: 'center',
    fillStyle: 'linear3',
    lockFillStyleToEntity: true,
    strokeStyle: 'orange',
    lineWidth: 4,
    method: 'fillThenDraw',
});

let wheel2 = wheel1.clone({
    name: 'w2',
    startX: '30%',
    startY: '60%',
    handleX: '-10%',
    handleY: 'center',
    scale: 0.7,
    fillStyle: 'linear4',
    strokeStyle: 'lightblue',

    delta: {
        roll: 1
    },
    order: 1,
});


// Create the filter
scrawl.makeFilter({
    name: 'invert',
    method: 'invert',
});


// Create a new group with an entity that will only be caught in the Cell's filter
scrawl.makeGroup({
    name: 'temp-group',
    host: canvas.base.name
});

scrawl.makeBlock({
    name: 'temp-block',
    group: 'temp-group',

    start: [50,50],
    dimensions: [40, 40],
    fillStyle: 'red',
});


// Functionality to capture cell, group and entity images
let captureImages = false;

let imageCapture = function () {

    if (captureImages) {

        scrawl.createImageFromCell(canvas, true);
        scrawl.createImageFromGroup(canvas, true);
        scrawl.createImageFromEntity(block1, true);
        scrawl.createImageFromEntity(block2, true);
        scrawl.createImageFromEntity(wheel1, true);
        scrawl.createImageFromEntity(wheel2, true);

        captureImages = false;
    }
};


// Add Picture entitys to the hold canvas, using the assets we will create from the main canvas
scrawl.makePicture({

    name: 'cell-image',
    group: hold.base.name,

    width: '13%',
    height: '76%',

    startX: '3%',
    startY: '2%',

    asset: 'mycanvas_base-image',
    copyWidth: '100%',
    copyHeight: '100%',

    lineWidth: 2,
    lineDash: [6, 4],
    strokeStyle: 'red',

    method: 'drawThenFill',

}).clone({

    name: 'group-image',
    asset: 'mycanvas_base-groupimage',
    startX: '19%',

}).clone({

    name: 'b1-image',
    asset: 'b1-image',
    startX: '35%',

}).clone({

    name: 'b2-image',
    asset: 'b2-image',
    startX: '51%',

}).clone({

    name: 'w1-image',
    asset: 'w1-image',
    startX: '67%',

}).clone({

    name: 'w2-image',
    asset: 'w2-image',
    startX: '83%',
});


// Give the hold Picture entitys some labels
scrawl.makePhrase({

    name: 'cell-phrase',
    group: hold.base.name,

    text: 'Cell',
    font: '15px Arial, sans-serif',

    startY: '85%',
    pivot: 'cell-image',
    lockXTo: 'pivot',

}).clone({

    name: 'group-phrase',
    text: 'Group',
    pivot: 'group-image',

}).clone({

    name: 'b1-phrase',
    text: 'Block1',
    pivot: 'b1-image',
    
}).clone({

    name: 'b2-phrase',
    text: 'Block2',
    pivot: 'b2-image',
    
}).clone({

    name: 'w1-phrase',
    text: 'Wheel1',
    pivot: 'w1-image',
    
}).clone({

    name: 'w2-phrase',
    text: 'Wheel2',
    pivot: 'w2-image',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation - note that the render is not targeted, thus will run document-wide to act on both &lt;canvas> elements
scrawl.makeRender({

    name: 'demo-animation',

    // The Display cycle needs to run once before the entitys, Group and Cell are ready to have their images captured
    afterCreated: () => captureImages = true,
    
    commence: imageCapture,
    afterShow: report,
});


// #### User interaction
// Event listeners
let events = function () {

    let base = canvas.base,
        group = scrawl.library.group[base.name],
        currentTarget;

    return function (e) {

        e.preventDefault();
        e.returnValue = false;

        let val = e.target.value;

        if (val !== currentTarget) {

            currentTarget = val;

            base.clearFilters();
            group.clearFilters();
            group.clearFiltersFromEntitys();

            switch (currentTarget) {

                case 'block1' :
                    block1.addFilters('invert');
                    break;

                case 'block2' :
                    block2.addFilters('invert');
                    break;

                case 'wheel1' :
                    wheel1.addFilters('invert');
                    break;

                case 'wheel2' :
                    wheel2.addFilters('invert');
                    break;

                case 'group' :
                    group.addFilters('invert');
                    break;

                case 'cell' :
                    base.addFilters('invert');
                    break;
            }

            captureImages = true;
        }
    };
}();
scrawl.addNativeListener(['input'], events, '.controlItem');

// Set the DOM input values
// @ts-expect-error
document.querySelector('#target').value = '';


// #### Development and testing
console.log(scrawl.library);
