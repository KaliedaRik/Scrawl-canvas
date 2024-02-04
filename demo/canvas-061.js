// # Demo Canvas 065
// Wide Gamut 2D Graphics using HTML Canvas

// [Run code](../../demo/filters-064.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

// Red
const outerBlock = scrawl.makeBlock({
    name: 'rgb-red',
    start: ['25%', '25%'],
    handle: ['center', 'center'],
    dimensions: ['50%', '50%'],
    fillStyle: 'rgb(255 0 0)',
});

const innerBlock = scrawl.makeBlock({
    name: 'p3-red',
    handle: ['center', 'center'],
    pivot: 'rgb-red',
    lockTo: 'pivot',
    dimensions: ['25%', '25%'],
    fillStyle: 'color(display-p3 1 0 0)',
});

// Green
outerBlock.clone({
    name: 'rgb-green',
    start: ['75%', '25%'],
    fillStyle: 'rgb(0 255 0)',
});

innerBlock.clone({
    name: 'p3-green',
    pivot: 'rgb-green',
    fillStyle: 'color(display-p3 0 1 0)',
});

// Blue
outerBlock.clone({
    name: 'rgb-blue',
    start: ['25%', '75%'],
    fillStyle: 'rgb(0 0 255)',
});

innerBlock.clone({
    name: 'p3-blue',
    pivot: 'rgb-blue',
    fillStyle: 'color(display-p3 0 0 1)',
});

// Magenta
outerBlock.clone({
    name: 'rgb-magenta',
    start: ['75%', '75%'],
    fillStyle: 'rgb(255 0 255)',
});

innerBlock.clone({
    name: 'p3-magenta',
    pivot: 'rgb-magenta',
    fillStyle: 'color(display-p3 1 0 1)',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
