// # Demo Canvas 041
// Access and use a canvas context engine using the makeAnimation factory

// [Run code](../../demo/canvas-041.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// + We are also going to ignore the device's pixel density
scrawl.setIgnorePixelRatio(true);


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Premise of the demo - based on the constraints described in the [Slaylines canvas engine comparison repo](https://github.com/slaylines/canvas-engines-comparison)
// + Library demos make use of an `engine` object, which includes details of the supplied &lt;canvas> element's dimensions, and a count of the number of boxes currently being drawn on that canvas
const engine = {

    width: canvas.get('width'),
    height: canvas.get('height'),
    count: 1000,
};

// + We are going to keep details of all our boxes (their current state) in an array
const boxes = [];


// Setup the display canvas
canvas.set({

    width: engine.width,
    height: engine.height,

}).render();


// Build and populate our cache Cell with pre-drawn boxes
const cache = canvas.buildCell({

    name: name('cache'),
    width: 50 * 40,
    height: 50,
    cleared: false,
    compiled: false,
    shown: false,
    willReadFrequently: false,
});


// Convenience variables
const source = cache.element;
const sourceEngine = cache.engine;


// The source canvas will hold a set of differently sized boxes, which we later draw onto the display canvas.
// + Generate the boxes once; draw them many times
sourceEngine.fillStyle = 'white';
sourceEngine.strokeStyle = 'black';
sourceEngine.lineWidth = 1;
sourceEngine.translate(25, 25);

for (let i = 0; i < 40; i++) {

    const size = 10 + i,
        delta = Math.floor(size / 2) + 0.5;

    sourceEngine.fillRect(-delta, -delta, size, size);
    sourceEngine.strokeRect(-delta, -delta, size, size);
    sourceEngine.translate(50, 0);

}


// On start, and UI, create the required number of box objects
// - these are plain JS objects holding data for our box drawing routine
const buildBoxes = function (boxesRequired) {

    const { width, height } = engine;
    let size, x, y, dx;

    boxes.length = 0;

    for (let i = 0; i < boxesRequired; i++) {

        size = 10 + Math.random() * 40;
        x = Math.floor(Math.random() * width);
        y = Math.floor(Math.random() * height);
        dx = -1 - Math.random();

        boxes.push([x, y, dx, Math.floor(size - 10)]);
    }
};

// Use the box data to draw the appropriate box images onto the screen at the required positions
const drawBoxes = function () {

    const engineWidth = engine.width,
        ctx = canvas.getBase().engine,
        trunc = Math.trunc;

    let box, x, y, deltaX, boxpos, width;

    return function () {

        for (let i = 0, iz = boxes.length; i < iz; i++) {

            box = boxes[i];
            [x, y, deltaX, boxpos] = box;
            width = boxpos + 10;

            ctx.drawImage(source, trunc(boxpos * 50), 0, 50, 50, trunc(x - 25), trunc(y - 25), 50, 50);

            x += deltaX;
            if (x < -width) x += engineWidth + (width * 2);
            box[0] = x;
        }
    }
}();


// Speed reporter
const report = reportSpeed('#reportmessage', function () {

    return `    Box count: ${boxes.length}`;
});



// The animation loop object
scrawl.makeAnimation({

    name: name('animation'),

    fn: () => {

        if (boxes.length !== engine.count) buildBoxes(engine.count);

        canvas.clear();
        drawBoxes();
        canvas.show();
        report();
    },
});

scrawl.addListener("up", () => engine.count += 1000, canvas.domElement);


// #### Development and testing
console.log(scrawl.library);
