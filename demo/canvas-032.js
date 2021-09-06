// # Demo Canvas 032 
// Freehand drawing
// + Note that the Polyline entity remains experimental technology and may be subject to breaking changes in future minor updates

// [Run code](../../demo/canvas-032.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas,
    base = canvas.base;

canvas.set({

    backgroundColor: 'honeydew',
    fit: 'contain',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,

}).setBase({

    width: 1000,
    height: 1000,
});


// Internal state variables
let currentLine = false,
    currentPins = [],
    lineHold = [],
    lineBin = [],
    counter = 0,
    lastX, lastY;


// Use a color factory object to generate random colors within a restricted palette
const myColorFactory = scrawl.makeColor({

    name: 'color-factory',

    rMax: 160,
    gMax: 160,
    bMax: 160,
});


// Freehand line drawing functions, used by event listeners attached to the canvas element
let startLine = function () {

    if (base.here.active) {

        let coord = base.here;

        if (coord) {

            currentPins.push([coord.x, coord.y])

            currentLine = scrawl.makePolyline({

                name: `line-${counter}`,

                pins: currentPins,
                mapToPins: true,

                tension: 0.3,

                strokeStyle: myColorFactory.get('random'),
                lineWidth: 4 + Math.floor(Math.random() * 20),

                lineCap: 'round',
                lineJoin: 'round',

                method: 'draw',
            });

            counter++;
        }

    }
};
scrawl.addListener('down', startLine, canvas.domElement);

let endLine = function () {

    if (currentLine) lineHold.push(currentLine);

    currentLine = false;
    currentPins.length = 0;
    lastX = lastY = -1;
};
scrawl.addListener(['up', 'leave'], endLine, canvas.domElement);

let checkLine = function () {

    if (currentLine && base.here.active) {

        let coord = base.here;

        let x = coord.x,
            y = coord.y;

        if (x === lastX && y === lastY) return false;

        currentPins.push([x, y]);

        currentLine.set({
            pins: currentPins,
        });

        lastX = x;
        lastY = y;
    }
};
scrawl.addListener('move', checkLine, canvas.domElement);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction

// Undo action
scrawl.addNativeListener('click', (e) => {

    let line = lineHold.pop();

    if (line) {

        line.set({ visibility: false });
        lineBin.push(line);
    }

}, '#undo-button');

// Redo action
scrawl.addNativeListener('click', (e) => {

    let line = lineBin.pop();

    if (line) {

        line.set({ visibility: true });
        lineHold.push(line);
    }

}, '#redo-button');

// Clear action
scrawl.addNativeListener('click', (e) => {

    lineHold.forEach(line => line && line.kill());
    lineHold.length = 0;

    lineBin.forEach(line => line && line.kill());
    lineBin.length = 0;

}, '#clear-button');


console.log(scrawl.library);
