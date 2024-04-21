// # Demo Canvas 032
// Freehand drawing
// + Note that the Polyline entity remains experimental technology and may be subject to breaking changes in future minor updates

// [Run code](../../demo/canvas-032.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Internal state variables
const currentPins = [],
    lineHold = [],
    lineBin = [];

let counter = 0,
    currentLine, lastX, lastY;


// Use a color factory object to generate random colors within a restricted palette
const myColorFactory = scrawl.makeColor({

    name: name('colors'),
    minimumColor: 'red',
    maximumColor: 'green',
});


// Freehand line drawing functions, used by event listeners attached to the canvas element
const startLine = function () {

    const here = canvas.getBaseHere();

    if (here.active) {

        currentPins.push([here.x, here.y]);

        currentLine = scrawl.makePolyline({

            name: name(`line-${counter}`),

            pins: currentPins,
            mapToPins: true,

            tension: 0.3,

            strokeStyle: myColorFactory.getRangeColor(Math.random()),
            lineWidth: 4 + Math.floor(Math.random() * 20),

            lineCap: 'round',
            lineJoin: 'round',

            method: 'draw',
        });

        counter++;
    }
};
scrawl.addListener('down', startLine, canvas.domElement);

const endLine = function () {

    if (currentLine) lineHold.push(currentLine);

    currentLine = false;
    currentPins.length = 0;
    lastX = -1;
    lastY = -1;
};
scrawl.addListener(['up', 'leave'], endLine, canvas.domElement);

const checkLine = function () {

    const here = canvas.getBaseHere();

    if (currentLine && here.active) {

        const {x, y} = here;

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

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction

// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);

// Undo action
scrawl.addNativeListener('click', () => {

    const line = lineHold.pop();

    if (line) {

        line.set({ visibility: false });
        lineBin.push(line);
    }

}, '#undo-button');

// Redo action
scrawl.addNativeListener('click', () => {

    const line = lineBin.pop();

    if (line) {

        line.set({ visibility: true });
        lineHold.push(line);
    }

}, '#redo-button');

// Clear action
scrawl.addNativeListener('click', () => {

    lineHold.forEach(line => line && line.kill());
    lineHold.length = 0;

    lineBin.forEach(line => line && line.kill());
    lineBin.length = 0;

}, '#clear-button');


// #### Development and testing
console.log(scrawl.library);
