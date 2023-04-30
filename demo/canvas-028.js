// # Demo Canvas 028
// Image magnifier; test some composite operations

// [Run code](../../demo/canvas-028.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
scrawl.importDomImage('.angels');

// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


const magnifier = scrawl.makeGroup({

    name: name('magnifier-group'),
    host: canvas.base.name,
    order: 1,

});

scrawl.makeGroup({

    name: name('background-group'),
    host: canvas.base.name,
    order: 2
});

const myradius = 80;

const mybackground = scrawl.makePicture({

    name: name('background'),
    group: name('background-group'),

    asset: 'small-angels',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    globalCompositeOperation: 'destination-over',
});

scrawl.makeWheel({

    name: name('magnifier'),
    group: name('magnifier-group'),

    order: 1,

    radius: 80,

    handleX: 'center',
    handleY: 'center',

    lockTo: 'mouse',

    method: 'fill',

}).clone({

    name: name('magnifier-rim'),

    order: 3,

    lineWidth: 5,
    strokeStyle: 'gold',

    method: 'draw',
});

const myMagnifierImage = scrawl.makePicture({

    name: name('enlarged'),
    group: name('magnifier-group'),

    order: 2,

    asset: 'big-angels',

    width: myradius * 2,
    height: myradius * 2,

    copyWidth: myradius * 2,
    copyHeight: myradius * 2,

    handleX: 'center',
    handleY: 'center',

    lockTo: 'mouse',

    globalCompositeOperation: 'source-in',
});

const checkMagnifier = function () {

    let display, base;

    return function () {

        if (!display) display = canvas.here;
        if (!base) base = canvas.base.here;

        const active = display.active;

        magnifier.set({
            visibility: (active) ? true : false,
        });

        if (active) {

            myMagnifierImage.set({

                copyStartX: (base.x * 3) - myradius,
                copyStartY: (base.y * 3) - myradius,
            });
        }
    };
}();


// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const displayed = canvas.here,
        hidden = canvas.base.here;

    return `Display canvas mouse - x: ${displayed.x}, y: ${displayed.y}
Base canvas mouse - x: ${hidden.x}, y: ${hidden.y}`;

});


// Create the Display cycle animation
scrawl.makeRender({
    name: name('animation'),
    target: canvas,

    commence: checkMagnifier,
    afterShow: report,
});


// #### User interaction
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.control-item',

    target: mybackground,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        composite: ['globalCompositeOperation', 'raw'],
    },
});
// @ts-expect-error
document.querySelector('#composite').value = 'destination-over';


// #### Development and testing
console.log(scrawl.library);
