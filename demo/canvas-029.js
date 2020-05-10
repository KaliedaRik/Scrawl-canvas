// # Demo Canvas 029 
// Spiral path

// [Run code](../../demo/canvas-029.html)
import scrawl from '../source/scrawl.js'

let canvas = scrawl.library.canvas.mycanvas;

// scrawl.makeWheel({
//     startX: 'center',
//     startY: 'center',
//     handleX: 'center',
//     handleY: 'center',
//     radius: 40,
//     fillStyle: 'lightgray',
// })

let buildSpiral = function (loops = 1, loopIncrement = 1, drawFromLoop = 0) {

    loops = Math.floor(loops);
    drawFromLoop = Math.floor(drawFromLoop);

    let x1, y1, x2, y2, x3, y3,
        sx1, sy1, sx2, sy2, sx3, sy3;

    let firstTurn = [
        [0.043, 0, 0.082, -0.035, 0.088, -0.088],
        [0.007, -0.057, -0.024, -0.121, -0.088, -0.162],
        [-0.07, -0.045, -0.169, -0.054, -0.265, -0.015],
        [-0.106, 0.043, -0.194, 0.138, -0.235, 0.265],
        [-0.044, 0.139, -0.026, 0.3, 0.058, 0.442],
        [0.091, 0.153, 0.25, 0.267, 0.442, 0.308],
        [0.206, 0.044, 0.431, -0.001, 0.619, -0.131],
        [0.2, -0.139, 0.34, -0.361, 0.381, -0.619]
    ];

    let subsequentTurns = [
        [0, -0.27, -0.11, -0.52, -0.29, -0.71],
        [-0.19, -0.19, -0.44, -0.29, -0.71, -0.29],
        [-0.27, 0, -0.52, 0.11, -0.71, 0.29],
        [-0.19, 0.19, -0.29, 0.44, -0.29, 0.71],
        [0, 0.27, 0.11, 0.52, 0.29, 0.71],
        [0.19, 0.19, 0.44, 0.29, 0.71, 0.29],
        [0.27, 0, 0.52, -0.11, 0.71, -0.29],
        [0.19, -0.19, 0.29, -0.44, 0.29, -0.71]
    ];

    let currentTurn = [];

    for (let i = 0; i < firstTurn.length; i++) {

        [x1, y1, x2, y2, x3, y3] = firstTurn[i];
        currentTurn.push([x1 * loopIncrement, y1 * loopIncrement, x2 * loopIncrement, y2 * loopIncrement, x3 * loopIncrement, y3 * loopIncrement]);
    }

    let path = 'M0,0';

    for (let j = 0; j < loops; j++) {

        for (let i = 0; i < currentTurn.length; i++) {

            [x1, y1, x2, y2, x3, y3] = currentTurn[i];

            if (j >= drawFromLoop) path += `c${x1},${y1} ${x2},${y2} ${x3},${y3}`;

            [sx1, sy1, sx2, sy2, sx3, sy3] = subsequentTurns[i];
            currentTurn[i] = [x1 + (sx1 * loopIncrement), y1 + (sy1 * loopIncrement), x2 + (sx2 * loopIncrement), y2 + (sy2 * loopIncrement), x3 + (sx3 * loopIncrement), y3 + (sy3 * loopIncrement)];
        }
    }
    return path;
};

scrawl.makeShape({

    name: 'original-values',

    startX: '50%',
    startY: '50%',
    handleX: 'center',
    handleY: 'center',

    pathDefinition: 'M 0,0C 0.043,0           0.082,-0.035    0.088,-0.088C 0.095,-0.145      0.064,-0.209    0,-0.25C -0.07,-0.295      -0.169,-0.304   -0.265,-0.265C -0.371,-0.222   -0.459,-0.127   -0.5,0  C -0.544,0.139      -0.526,0.3      -0.442,0.442  C -0.351,0.595      -0.192,0.709    0,0.75  C 0.206,0.794       0.431,0.749     0.619,0.619  C 0.819,0.48        0.959,0.258     1,0  C 1.043,-0.273      0.972,-0.561    0.795,-0.795  C 0.61,-1.043       0.324,-1.209    0,-1.25  C -0.339,-1.293     -0.691,-1.195   -0.972,-0.972  C -1.266,-0.739     -1.459,-0.390   -1.5,0  C -1.543,0.406      -1.419,0.821    -1.149,1.149  C -0.869,1.49       -0.456,1.709    0,1.75  C 0.472,1.793       0.95,1.642      1.326,1.326  C 1.713,0.999       1.958,0.522     2,0  C 2.043,-0.538      1.866,-1.08     1.503,-1.503  C 1.129,-1.937      0.589,-2.208    0,-2.25  C -0.605,-2.293     -1.21,-2.09     -1.679,-1.679  C -2.161,-1.259     -2.458,-0.655   -2.5,0  C -2.543,0.671      -2.313,1.34     -1.856,1.856  C -1.388,2.384      -0.721,2.708    0,2.75  C 0.737,2.793       1.47,2.537      2.033,2.033  C 2.608,1.518       2.958,0.788     3,0',

    method: 'draw',

    strokeStyle: 'green',
    lineWidth: 10,
    lineCap: 'round',

    scale: 40,
    scaleOutline: false,

}).clone({

    name: 'relative-values',

    pathDefinition: 'M0,0c0.043,    0   0.082,  -0.035  0.088,  -0.088c0.007,   -0.057  -0.024, -0.121  -0.088, -0.162c-0.07,   -0.045  -0.169, -0.054  -0.265, -0.015c-0.106,  0.043   -0.194, 0.138   -0.235, 0.265c-0.044,   0.139   -0.026, 0.3 0.058,  0.442c0.091,    0.153   0.25,   0.267   0.442,  0.308c0.206,    0.044   0.431,  -0.001  0.619,  -0.131c0.2, -0.139  0.34,   -0.361  0.381,  -0.619c0.043,   -0.273  -0.028, -0.561  -0.205, -0.795c-0.185,  -0.248  -0.471, -0.414  -0.795, -0.455c-0.339,  -0.043  -0.691, 0.055   -0.972, 0.278c-0.294,   0.233   -0.487, 0.582   -0.528, 0.972c-0.043,   0.406   0.081,  0.821   0.351,  1.149c0.28, 0.341   0.693,  0.56    1.149,  0.601c0.472,    0.043   0.95,   -0.108  1.326,  -0.424c0.387,   -0.327  0.632,  -0.804  0.674,  -1.326c0.043,   -0.538  -0.134, -1.08   -0.497, -1.503c-0.374,  -0.434  -0.914, -0.705  -1.503, -0.747c-0.605,  -0.043  -1.21,  0.16    -1.679, 0.571c-0.482,   0.42    -0.779, 1.024   -0.821, 1.679c-0.043,   0.671   0.187,  1.34    0.644,  1.856c0.468,    0.528   1.135,  0.852   1.856,  0.894c0.737,    0.043   1.47,   -0.213  2.033,  -0.717c0.575,   -0.515  0.925,  -1.245  0.967,  -2.033',

    strokeStyle: 'yellow',
    lineWidth: 6,

}).clone({

    name: 'calculated-values',

    pathDefinition: buildSpiral(3, -1),

    strokeStyle: 'blue',
    lineWidth: 2,

    lineDash: [20, 10],

    delta: {
        lineDashOffset: 0.4,
    }
});

// scrawl.makeSpiral({
//     name: 'mySpiral',

//     strokeStyle: 'red',
//     lineWidth: 3,
//     method: 'draw',

//     startX: 'center',
//     startY: 'center',
//     // handleX: 'center',
//     // handleY: 'center',

//     loops: 1,
//     // loopIncrement: 1,
//     loopIncrement: 0,
//     innerRadius: 20,

//     // roll: -86,

//     showBoundingBox: true,
// });

scrawl.makeRender({
    name: 'demo-animation',
    target: canvas,
});

console.log(scrawl.library.entity)