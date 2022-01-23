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
    setIgnorePixelRatio,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
setIgnorePixelRatio(false);


// #### Scene setup
let canvas = L.canvas.mycanvas

canvas.set({
    backgroundColor: 'lightgray',
    css: {
        border: '1px solid black'
    }
});


// ##### makeOval factory function 
makeOval({
    name: 'circle',
    fillStyle: 'lightGreen',
    method: 'fillAndDraw',
    startX: 20,
    startY: 20,
    radius: 40,

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: 'ellipse',
    startX: 120,
    radiusY: 60,

}).clone({
    name: 'egg',
    startX: 220,
    radiusX: '7%',
    radiusY: '3%',
    intersectY: 0.6,

}).clone({
    name: 'shield',
    startX: 335,
    radiusY: '2.7%',
    intersectY: -0.2,

}).clone({
    name: 'splodge',
    startX: 460,
    radius: 50,
    offshootA: 1.2,
    offshootB: -0.5,
    intersectY: 0.32,
});

// ##### makeRectangle factory function 
makeRectangle({
    name: 'ovalRectangle',
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
    name: 'tab',
    startX: 165,
    rectangleHeight: 40,
    radiusT: 20,
    radiusB: 0,

}).clone({
    name: 'blockRectangle',
    startX: 310,
    rectangleHeight: 60,
    radius: 0,

}).clone({
    name: 'notRectangle',
    startX: 460,
    radiusX: '15%',
    radiusY: '25%',
    offshootA: -0.2,
    offshootB: 0.2,
});

// ##### makeLine factory function 
makeLine({
    name: 'firstLine',
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
    name: 'secondLine',
    startY: '16.5%',
    endY: '13.7%',

}).clone({
    name: 'thirdLine',
    startX: '20%',
    startY: '14%',
    endX: '85%',
    endY: '14%',
});

// ##### makeQuadratic factory function 
makeQuadratic({
    name: 'firstQuad',
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
    name: 'secondQuad',
    startX: '12%',
    endX: '88%',
    startY: '21.5%',
    endY: '21.5%',

}).clone({
    name: 'thirdQuad',
    startX: '19%',
    endX: '81%',
    startY: '23%',
    endY: '23%',
});

// ##### makeBezier factory function 
makeBezier({
    name: 'firstBezier',
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
    name: 'secondBezier',
    startX: '7%',
    startControlY: '18%',
    endControlY: '36%',
    endX: '93%',

}).clone({
    name: 'thirdBezier',
    startX: '9%',
    startControlY: '14%',
    endControlY: '40%',
    endX: '91%',
});

// ##### makeTetragon factory function 
makeTetragon({
    name: 'square',
    fillStyle: 'lightGreen',
    method: 'fillAndDraw',
    startX: 20,
    startY: 750,
    radius: 40,

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: 'diamond',
    startX: 120,
    radiusY: 60,

}).clone({
    name: 'triangle',
    startX: 220,
    radiusX: '7%',
    radiusY: '3%',
    intersectY: 1,

}).clone({
    name: 'arrow',
    startX: 330,
    radiusY: '2.6%',
    intersectY: 1.2,

}).clone({
    name: 'skewarrow',
    startX: 470,
    radius: 50,
    intersectX: 0.32,
});

// ##### makePolygon factory function 
makePolygon({
    name: 'equiTriangle',
    startX: 20,
    startY: 935,
    sideLength: 60,
    sides: 3,
    fillStyle: 'lightblue',
    method: 'fillAndDraw',

    showBoundingBox: true,
    useAsPath: true,

}).clone({
    name: 'pentagon',
    startX: 120,
    sides: 5,

}).clone({
    name: 'hexagon',
    startX: 260,
    sides: 6,

}).clone({
    name: '11sides',
    startX: 420,
    sideLength: 30,
    sides: 11,
});

// ##### makeStar factory function 
makeStar({
    name: '5star',
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
    name: '6star',
    startX: 220,
    points: 6,

}).clone({
    name: 'twistedstar',
    startX: 420,
    radius2: 20,
    twist: 115,
});

// ##### makeSpiral factory function 
makeSpiral({
    name: 'spiral1',
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
    name: 'spiral2',
    startX: 350,
    drawFromLoop: 3,

}).clone({
    name: 'spiral3',
    startY: 1550,
    loopIncrement: 0.3,
    drawFromLoop: 0,

}).clone({
    name: 'spiral4',
    startX: 50,
    loopIncrement: 0.3,
    drawFromLoop: 3,
});

// ##### makeCog factory function 
makeCog({
    name: 'tooth-cog',
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
    name: 'blade-tooth-cog',
    outerControlsOffset: 5,
    startX: 220,

}).clone({
    name: 'twist-tooth-cog',
    startX: 420,
    outerControlsOffset: 0,
    twist: 15,
});

makeCog({
    name: 'hill-cog',
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
    name: 'blade-hill-cog',
    outerControlsOffset: 5,
    startX: 220,

}).clone({
    name: 'twist-hill-cog',
    startX: 420,
    outerControlsOffset: 0,
    twist: 15,
});

makeCog({
    name: 'smooth-cog',
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
    name: 'blade-smooth-cog',
    outerControlsOffset: 15,
    startX: 220,

}).clone({
    name: 'twist-smooth-cog',
    startX: 420,
    outerControlsOffset: 0,
    twist: 15,
});


// #### Development and testing
// Create entitys to use the above Shape entitys as paths along which they can be animated
makePicture({

    name: '_tab',
    imageSource: 'img/bunny.png',

    width: 26,
    height: 37,

    copyWidth: 26,
    copyHeight: 37,

    handleX: 'center',
    handleY: 'center',

    path: 'tab',
    pathPosition: 0,
    lockTo: 'path',
    addPathRotation: true,

    delta: {
        pathPosition: 0.0015,
    },

}).clone({
    name: '_blockRectangle',
    path: 'blockRectangle',
    pathPosition: 0.05,

}).clone({
    name: '_circle',
    path: 'circle',
    pathPosition: 0.1,

}).clone({
    name: '_egg',
    path: 'egg',
    pathPosition: 0.15,

}).clone({
    name: '_ellipse',
    path: 'ellipse',
    pathPosition: 0.2,

}).clone({
    name: '_firstBezier',
    path: 'firstBezier',
    pathPosition: 0.25,

}).clone({
    name: '_firstLine',
    path: 'firstLine',
    pathPosition: 0.3,

}).clone({
    name: '_firstQuad',
    path: 'firstQuad',
    pathPosition: 0.35,

}).clone({
    name: '_notRectangle',
    path: 'notRectangle',
    pathPosition: 0.4,

}).clone({
    name: '_ovalRectangle',
    path: 'ovalRectangle',
    pathPosition: 0.45,

}).clone({
    name: '_secondBezier',
    path: 'secondBezier',
    pathPosition: 0.5,

}).clone({
    name: '_secondLine',
    path: 'secondLine',
    pathPosition: 0.55,

}).clone({
    name: '_secondQuad',
    path: 'secondQuad',
    pathPosition: 0.6,

}).clone({
    name: '_shield',
    path: 'shield',
    pathPosition: 0.65,

}).clone({
    name: '_splodge',
    path: 'splodge',
    pathPosition: 0.7,

}).clone({
    name: '_thirdBezier',
    path: 'thirdBezier',
    pathPosition: 0.75,

}).clone({
    name: '_thirdQuad',
    path: 'thirdQuad',
    pathPosition: 0.8,

}).clone({
    name: '_thirdLine',
    path: 'thirdLine',
    pathPosition: 0.85,

}).clone({
    name: '_square',
    path: 'square',
    pathPosition: 0,

}).clone({
    name: '_diamond',
    path: 'diamond',
    pathPosition: 0.05,

}).clone({
    name: '_triangle',
    path: 'triangle',
    pathPosition: 0.1,

}).clone({
    name: '_arrow',
    path: 'arrow',
    pathPosition: 0.15,

}).clone({
    name: '_skewarrow',
    path: 'skewarrow',
    pathPosition: 0.2,

}).clone({
    name: '_equiTriangle',
    path: 'equiTriangle',
    pathPosition: 0.25,

}).clone({
    name: '_pentagon',
    path: 'pentagon',
    pathPosition: 0.3,

}).clone({
    name: '_hexagon',
    path: 'hexagon',
    pathPosition: 0.35,

}).clone({
    name: '_11sides',
    path: '11sides',
    pathPosition: 0.4,

}).clone({
    name: '_5star',
    path: '5star',
    pathPosition: 0.45,

}).clone({
    name: '_6star',
    path: '6star',
    pathPosition: 0.5,

}).clone({
    name: '_twistedstar',
    path: 'twistedstar',
    pathPosition: 0.55,

}).clone({
    name: '_spiral1',
    path: 'spiral1',
    pathPosition: 0,

}).clone({
    name: '_spiral2',
    path: 'spiral2',
    pathPosition: 0.25,

}).clone({
    name: '_spiral3',
    path: 'spiral3',
    pathPosition: 0.5,

}).clone({
    name: '_spiral4',
    path: 'spiral4',
    pathPosition: 0.75,

}).clone({
    name: '_tooth-cog',
    path: 'tooth-cog',
    pathPosition: 0,

}).clone({
    name: '_blade-tooth-cog',
    path: 'blade-tooth-cog',
    pathPosition: 0.3,

}).clone({
    name: '_twist-tooth-cog',
    path: 'twist-tooth-cog',
    pathPosition: 0.6,

}).clone({
    name: '_hill-cog',
    path: 'hill-cog',
    pathPosition: 0.1,

}).clone({
    name: '_blade-hill-cog',
    path: 'blade-hill-cog',
    pathPosition: 0.4,

}).clone({
    name: '_twist-hill-cog',
    path: 'twist-hill-cog',
    pathPosition: 0.7,

}).clone({
    name: '_smooth-cog',
    path: 'smooth-cog',
    pathPosition: 0.2,

}).clone({
    name: '_blade-smooth-cog',
    path: 'blade-smooth-cog',
    pathPosition: 0.5,

}).clone({
    name: '_twist-smooth-cog',
    path: 'twist-smooth-cog',
    pathPosition: 0.8,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(L.entity);
