// # Demo Canvas 038 
// Responsive Shape-based entitys

// [Run code](../../demo/canvas-038.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.set({

    backgroundColor: 'honeydew',
    baseMatchesCanvasDimensions: true,
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
});

// Create a shape track along which we can animate a Cell
scrawl.makeOval({

    name: 'responsive-oval',

    radiusX: '40%',
    radiusY: '40%',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    strokeStyle: 'grey',
    lineWidth: 10,
    method: 'draw',

}).clone({

    name: 'static-oval',

    radiusX: 100,
    radiusY: 140,

    strokeStyle: 'blue',
});

scrawl.makeTetragon({

    name: 'responsive-diamond',

    strokeStyle: 'lightgreen',
    lineWidth: 6,
    method: 'draw',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    radiusX: '40%',
    radiusY: '40%',

}).clone({

    name: 'static-diamond',

    strokeStyle: 'darkgreen',

    radiusX: 100,
    radiusY: 140,    
});

scrawl.makeLine({

    name: 'responsive-line',

    strokeStyle: 'orange',
    lineWidth: 8,
    method: 'draw',

    start: ['20%', '45%'],
    end: ['80%', '45%'],

}).clone({

    name: 'static-line',

    strokeStyle: 'brown',

    start: [50, 210],
    end: [350, 210],
});

scrawl.makeRectangle({

    name: 'responsive-rectangle',

    strokeStyle: 'red',
    lineWidth: 4,
    method: 'draw',

    start: ['center', '25%'],
    handle: ['center', 'center'],

    rectangleWidth: '60%',
    rectangleHeight: '15%',

    radiusT: '5%',
    radiusB: '15%',

}).clone({

    name: 'static-rectangle',
    startY: '75%',

    strokeStyle: 'pink',

    rectangleWidth: 200,
    rectangleHeight: 100,

    radius: 15,
})

scrawl.makeStar({

    name: 'responsive-star',

    start: ['center', '25%'],
    handle: ['center', 'center'],

    radius1: '20%',
    radius2: '10%',

    points: 5,

    strokeStyle: '#420',
    lineWidth: 4,
    method: 'draw',

}).clone({

    name: 'static-star',
    startY: '75%',
    strokeStyle: '#840',

    radius1: 120,
    radius2: 80,
});

scrawl.makeCog({

    name: 'static-cog',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    outerRadius: 180,
    innerRadius: 160,
    outerControlsDistance: 10,
    innerControlsDistance: 6,

    points: 36,
    strokeStyle: 'coral',
    lineWidth: 8,
    method: 'draw',

}).clone({

    name: 'responsive-cog',

    outerRadius: `${(180/400) * 100}%`,
    innerRadius: `${(160/400) * 100}%`,
    outerControlsDistance: `${(10/400) * 100}%`,
    innerControlsDistance: `${(6/400) * 100}%`,

    strokeStyle: 'orchid',
    lineWidth: 4,
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});

// #### Development and testing
console.log(scrawl.library);
