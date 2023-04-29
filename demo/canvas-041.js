// # Demo Canvas 041 
// Access and use a canvas context engine using the makeAnimation factory

// [Run code](../../demo/canvas-041.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Ignore pixel ratio considerations
// + Leads to issues when dragging the browser between screens with different pixel ratio densities
scrawl.setIgnorePixelRatio(true);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


const boxes = [];

const engine = {

    width: canvas.get("width"),
    height: canvas.get("height"),
    count: 1000,
};

// Setup the display canvas
canvas.set({

    width: engine.width,
    height: engine.height,

}).render();

// Build and populate our cache Cell with pre-drawn boxes
canvas.buildCell({

    name: 'cache',
    width: 50 * 40,
    height: 50,
    cleared: false,
    compiled: false,
    shown: false,
    willReadFrequently: false,
});

const source = scrawl.library.cell.cache.element;
const sourceEngine = scrawl.library.cell.cache.engine;

sourceEngine.fillStyle = 'white';
sourceEngine.strokeStyle = 'black';
sourceEngine.lineWidth = 1;

for (let i = 0; i < 40; i++) {

    const size = 10 + i,
        delta = Math.floor(size / 2) + 0.5;

    sourceEngine.setTransform(1, 0, 0, 1, (50 * i) + 25, 25);
    sourceEngine.fillRect(-delta, -delta, size, size);
    sourceEngine.strokeRect(-delta, -delta, size, size);
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
        ctx = canvas.base.engine;

    let box, x, y, deltaX, boxpos, width;

    return function () {

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        for (let i = 0, iz = boxes.length; i < iz; i++) {

            box = boxes[i];
            [x, y, deltaX, boxpos] = box;
            width = boxpos + 10

            ctx.drawImage(source, ~~(boxpos * 50), 0, 50, 50, ~~(x - 25), ~~(y - 25), 50, 50);

            x += deltaX;
            if (x < -width) x += engineWidth + (width * 2);
            box[0] = x;
        }
    }
}();

// Speed reporter
const report = reportSpeed('#reportmessage', function () {

    return `Box count: ${boxes.length}`;
});



// The animation loop object
scrawl.makeAnimation({

    name: 'demo-animation',

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
