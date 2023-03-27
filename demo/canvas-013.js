// # Demo Canvas 013 
// Path-defined entitys: Oval, Rectangle, Line, Quadratic, Bezier, Tetragon, Polygon, Star, Spiral, Cog

// [Run code](../../demo/canvas-013.html)
import {
    library as L,
    makeBezier,
    makeCog,
    makeLine,
    makeOval,
    makePicture,
    makePolygon,
    makeQuadratic,
    makeRectangle,
    makeRender,
    makeSpiral,
    makeStar,
    makeTetragon,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = L.canvas.mycanvas


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// ##### makeOval factory function 
makeOval({
    name: name('circle'),
    fillStyle: 'lightGreen',
    method: 'fillAndDraw',
    startX: 20,
    startY: 20,
    radius: 40,

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('ellipse'),
    startX: 120,
    radiusY: 60,

}).clone({
    name: name('egg'),
    startX: 220,
    radiusX: '7%',
    radiusY: '3%',
    intersectY: 0.6,

}).clone({
    name: name('shield'),
    startX: 335,
    radiusY: '2.7%',
    intersectY: -0.2,

}).clone({
    name: name('splodge'),
    startX: 460,
    radius: 50,
    offshootA: 1.2,
    offshootB: -0.5,
    intersectY: 0.32,
});

// ##### makeRectangle factory function 
makeRectangle({
    name: name('ovalRectangle'),
    startX: 20,
    startY: 200,
    rectangleWidth: 120,
    rectangleHeight: 80,
    radius: '50%',
    fillStyle: 'lightblue',
    method: 'fillAndDraw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('tab'),
    startX: 165,
    rectangleHeight: 40,
    radiusT: 20,
    radiusB: 0,

}).clone({
    name: name('blockRectangle'),
    startX: 310,
    rectangleHeight: 60,
    radius: 0,

}).clone({
    name: name('notRectangle'),
    startX: 460,
    radiusX: '15%',
    radiusY: '25%',
    offshootA: -0.2,
    offshootB: 0.2,
});

// ##### makeLine factory function 
makeLine({
    name: name('firstLine'),
    startX: 20,
    startY: 320,
    endX: 580,
    endY: 295,
    lineWidth: 3,
    lineCap: 'round',
    strokeStyle: 'darkgoldenrod',
    method: 'draw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('secondLine'),
    startY: '16.5%',
    endY: '13.7%',

}).clone({
    name: name('thirdLine'),
    startX: '20%',
    startY: '14%',
    endX: '85%',
    endY: '14%',
});

// ##### makeQuadratic factory function 
makeQuadratic({
    name: name('firstQuad'),
    startX: '5%',
    startY: '20%',
    controlX: '50%',
    controlY: '15%',
    endX: '95%',
    endY: '20%',
    lineWidth: 3,
    lineCap: 'round',
    strokeStyle: 'darkseagreen',
    method: 'draw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('secondQuad'),
    startX: '12%',
    endX: '88%',
    startY: '21.5%',
    endY: '21.5%',

}).clone({
    name: name('thirdQuad'),
    startX: '19%',
    endX: '81%',
    startY: '23%',
    endY: '23%',
});

// ##### makeBezier factory function 
makeBezier({
    name: name('firstBezier'),
    startX: '5%',
    startY: '27%',
    startControlX: '40%',
    startControlY: '22%',
    endControlX: '60%',
    endControlY: '32%',
    endX: '95%',
    endY: '27%',
    lineWidth: 3,
    lineCap: 'round',
    strokeStyle: 'linen',
    method: 'draw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('secondBezier'),
    startX: '7%',
    startControlY: '18%',
    endControlY: '36%',
    endX: '93%',

}).clone({
    name: name('thirdBezier'),
    startX: '9%',
    startControlY: '14%',
    endControlY: '40%',
    endX: '91%',
});

// ##### makeTetragon factory function 
makeTetragon({
    name: name('square'),
    fillStyle: 'lightGreen',
    method: 'fillAndDraw',
    startX: 20,
    startY: 750,
    radius: 40,

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('diamond'),
    startX: 120,
    radiusY: 60,

}).clone({
    name: name('triangle'),
    startX: 220,
    radiusX: '7%',
    radiusY: '3%',
    intersectY: 1,

}).clone({
    name: name('arrow'),
    startX: 330,
    radiusY: '2.6%',
    intersectY: 1.2,

}).clone({
    name: name('skewarrow'),
    startX: 470,
    radius: 50,
    intersectX: 0.32,
});

// ##### makePolygon factory function 
makePolygon({
    name: name('equiTriangle'),
    startX: 20,
    startY: 935,
    sideLength: 60,
    sides: 3,
    fillStyle: 'lightblue',
    method: 'fillAndDraw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('pentagon'),
    startX: 120,
    sides: 5,

}).clone({
    name: name('hexagon'),
    startX: 260,
    sides: 6,

}).clone({
    name: name('11sides'),
    startX: 420,
    sideLength: 30,
    sides: 11,
});

// ##### makeStar factory function 
makeStar({
    name: name('5star'),
    startX: 20,
    startY: 1080,
    radius1: 80,
    radius2: 50,
    points: 5,
    fillStyle: 'linen',
    method: 'fillAndDraw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('6star'),
    startX: 220,
    points: 6,

}).clone({
    name: name('twistedstar'),
    startX: 420,
    radius2: 20,
    twist: 115,
});

// ##### makeSpiral factory function 
makeSpiral({
    name: name('spiral1'),
    strokeStyle: 'darkgreen',
    method: 'draw',
    startX: 50,
    startY: 1310,
    loops: 5,
    loopIncrement: 0.1,
    drawFromLoop: 0,
    scale: 70,
    scaleOutline: false,

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('spiral2'),
    startX: 350,
    drawFromLoop: 3,

}).clone({
    name: name('spiral3'),
    startY: 1550,
    loopIncrement: 0.3,
    drawFromLoop: 0,

}).clone({
    name: name('spiral4'),
    startX: 50,
    loopIncrement: 0.3,
    drawFromLoop: 3,
});

// ##### makeCog factory function 
makeCog({
    name: name('tooth-cog'),
    startX: 20,
    startY: 1790,
    outerRadius: 80,
    innerRadius: 65,
    outerControlsDistance: 4,
    innerControlsDistance: 2,
    points: 20,
    fillStyle: 'orchid',
    lineWidth: 2,
    method: 'fillAndDraw',
    curve: 'line',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('blade-tooth-cog'),
    outerControlsOffset: 5,
    startX: 220,

}).clone({
    name: name('twist-tooth-cog'),
    startX: 420,
    outerControlsOffset: 0,
    twist: 15,
});

makeCog({
    name: name('hill-cog'),
    startX: 20,
    startY: 1980,
    outerRadius: 80,
    innerRadius: 65,
    outerControlsDistance: 4,
    innerControlsDistance: 2,
    points: 20,
    fillStyle: 'slategrey',
    lineWidth: 2,
    method: 'fillAndDraw',
    curve: 'quadratic',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('blade-hill-cog'),
    outerControlsOffset: 5,
    startX: 220,

}).clone({
    name: name('twist-hill-cog'),
    startX: 420,
    outerControlsOffset: 0,
    twist: 15,
});

makeCog({
    name: name('smooth-cog'),
    startX: 20,
    startY: 2170,
    outerRadius: 80,
    innerRadius: 60,
    outerControlsDistance: 10,
    innerControlsDistance: 6,
    points: 12,
    fillStyle: 'coral',
    lineWidth: 2,
    method: 'fillAndDraw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: name('blade-smooth-cog'),
    outerControlsOffset: 15,
    startX: 220,

}).clone({
    name: name('twist-smooth-cog'),
    startX: 420,
    outerControlsOffset: 0,
    twist: 15,
});


// #### Development and testing
// Create entitys to use the above Shape entitys as paths along which they can be animated
makePicture({

    name: name('tab-bear'),
    imageSource: 'img/bunny.png',

    width: 26,
    height: 37,

    copyWidth: 26,
    copyHeight: 37,

    handleX: 'center',
    handleY: 'center',

    path: name('tab'),
    pathPosition: 0,
    lockTo: 'path',
    addPathRotation: true,

    delta: {
        pathPosition: 0.0015,
    },

}).clone({
    name: name('blockRectangle-bear'),
    path: name('blockRectangle'),
    pathPosition: 0.05,

}).clone({
    name: name('circle-bear'),
    path: name('circle'),
    pathPosition: 0.1,

}).clone({
    name: name('egg-bear'),
    path: name('egg'),
    pathPosition: 0.15,

}).clone({
    name: name('ellipse-bear'),
    path: name('ellipse'),
    pathPosition: 0.2,

}).clone({
    name: name('firstBezier-bear'),
    path: name('firstBezier'),
    pathPosition: 0.25,

}).clone({
    name: name('firstLine-bear'),
    path: name('firstLine'),
    pathPosition: 0.3,

}).clone({
    name: name('firstQuad-bear'),
    path: name('firstQuad'),
    pathPosition: 0.35,

}).clone({
    name: name('notRectangle-bear'),
    path: name('notRectangle'),
    pathPosition: 0.4,

}).clone({
    name: name('ovalRectangle-bear'),
    path: name('ovalRectangle'),
    pathPosition: 0.45,

}).clone({
    name: name('secondBezier-bear'),
    path: name('secondBezier'),
    pathPosition: 0.5,

}).clone({
    name: name('secondLine-bear'),
    path: name('secondLine'),
    pathPosition: 0.55,

}).clone({
    name: name('secondQuad-bear'),
    path: name('secondQuad'),
    pathPosition: 0.6,

}).clone({
    name: name('shield-bear'),
    path: name('shield'),
    pathPosition: 0.65,

}).clone({
    name: name('splodge-bear'),
    path: name('splodge'),
    pathPosition: 0.7,

}).clone({
    name: name('thirdBezier-bear'),
    path: name('thirdBezier'),
    pathPosition: 0.75,

}).clone({
    name: name('thirdQuad-bear'),
    path: name('thirdQuad'),
    pathPosition: 0.8,

}).clone({
    name: name('thirdLine-bear'),
    path: name('thirdLine'),
    pathPosition: 0.85,

}).clone({
    name: name('square-bear'),
    path: name('square'),
    pathPosition: 0,

}).clone({
    name: name('diamond-bear'),
    path: name('diamond'),
    pathPosition: 0.05,

}).clone({
    name: name('triangle-bear'),
    path: name('triangle'),
    pathPosition: 0.1,

}).clone({
    name: name('arrow-bear'),
    path: name('arrow'),
    pathPosition: 0.15,

}).clone({
    name: name('skewarrow-bear'),
    path: name('skewarrow'),
    pathPosition: 0.2,

}).clone({
    name: name('equiTriangle-bear'),
    path: name('equiTriangle'),
    pathPosition: 0.25,

}).clone({
    name: name('pentagon-bear'),
    path: name('pentagon'),
    pathPosition: 0.3,

}).clone({
    name: name('hexagon-bear'),
    path: name('hexagon'),
    pathPosition: 0.35,

}).clone({
    name: name('11sides-bear'),
    path: name('11sides'),
    pathPosition: 0.4,

}).clone({
    name: name('5star-bear'),
    path: name('5star'),
    pathPosition: 0.45,

}).clone({
    name: name('6star-bear'),
    path: name('6star'),
    pathPosition: 0.5,

}).clone({
    name: name('twistedstar-bear'),
    path: name('twistedstar'),
    pathPosition: 0.55,

}).clone({
    name: name('spiral1-bear'),
    path: name('spiral1'),
    pathPosition: 0,

}).clone({
    name: name('spiral2-bear'),
    path: name('spiral2'),
    pathPosition: 0.25,

}).clone({
    name: name('spiral3-bear'),
    path: name('spiral3'),
    pathPosition: 0.5,

}).clone({
    name: name('spiral4-bear'),
    path: name('spiral4'),
    pathPosition: 0.75,

}).clone({
    name: name('tooth-cog-bear'),
    path: name('tooth-cog'),
    pathPosition: 0,

}).clone({
    name: name('blade-tooth-cog-bear'),
    path: name('blade-tooth-cog'),
    pathPosition: 0.3,

}).clone({
    name: name('twist-tooth-cog-bear'),
    path: name('twist-tooth-cog'),
    pathPosition: 0.6,

}).clone({
    name: name('hill-cog-bear'),
    path: name('hill-cog'),
    pathPosition: 0.1,

}).clone({
    name: name('blade-hill-cog-bear'),
    path: name('blade-hill-cog'),
    pathPosition: 0.4,

}).clone({
    name: name('twist-hill-cog-bear'),
    path: name('twist-hill-cog'),
    pathPosition: 0.7,

}).clone({
    name: name('smooth-cog-bear'),
    path: name('smooth-cog'),
    pathPosition: 0.2,

}).clone({
    name: name('blade-smooth-cog-bear'),
    path: name('blade-smooth-cog'),
    pathPosition: 0.5,

}).clone({
    name: name('twist-smooth-cog-bear'),
    path: name('twist-smooth-cog'),
    pathPosition: 0.8,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(L);
