// # Demo Canvas 036
// Cell functionality (functionality and associated tests needs to be expanded)

// [Run code](../../demo/canvas-036.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


// Create a Cell on the canvas
const cell1 = canvas.buildCell({

    name: 'cell-1',

    width: 200,
    height: 200,

    startX: 150,
    startY: 150,

    handleX: '40%',
    handleY: '40%',

    delta: {
        roll: -0.6,
    },

    backgroundColor: 'lightblue',
});

// Cells cannot be cloned (yet - may introduce that functionality in a future update)
const cell2 = canvas.buildCell({

    name: 'cell-2',

    width: '20%',
    height: '20%',

    startX: '60%',
    startY: '50%',

    handleX: 30,
    handleY: 50,

    delta: {
        roll: 0.4,
    },

    backgroundColor: 'lightblue',
});

// Create a shape track along which we can animate a Cell
scrawl.makeOval({

    name: 'mytrack',

    radiusX: '40%',
    radiusY: '40%',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    strokeStyle: '#808080',
    lineWidth: 10,
    method: 'draw',

    useAsPath: true,
    precision: 0.1,
});

// This Cell will animate along the track we created earlier
const cell3 = canvas.buildCell({

    name: 'cell-3',

    width: 100,
    height: 50,

    handleX: 'center',
    handleY: 'bottom',

    path: 'mytrack',
    lockTo: 'path',
    addPathRotation: true,
    constantPathSpeed: true,

    delta: {
      pathPosition: -0.001,
    },

    backgroundColor: 'black',
});

// Create some entitys to which we can pivot and mimic Cells
// + Cells cannot take part in artefact functionality such as drag-and-drop because they are assets who use positional mixins to gain artefact-like behaviour, but they can't be included in Groups because they are limited to grouping Artefacts together
// + One way to get around this limitation is to use Block entitys for testing collision detection, and then route mouse hover functionality through to any Cells pivoting or mimicking them. This should also allow us to drag-and-drop Cells (by proxy)
const myGroup = scrawl.makeGroup({

    name: 'target-group',
    host: canvas.base.name,
});

scrawl.makeBlock({

    name: 'block-1',
    group: 'target-group',

    start: ['80%', '10%'],
    handle: ['center', 'center'],
    dimensions: ['18%', '18%'],

    fillStyle: 'blue',
    strokeStyle: 'coral',
    lineWidth: 4,

    delta: {
        roll: -0.2,
    },

    method: 'fillThenDraw',

}).clone({

    name: 'block-2',
    dimensions: [120, 100],
    handle: ['left', 'top'],
    startY: '80%',

    roll: 30,

    delta: {
        roll: 0,
    },
});

// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: myGroup,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});

// Check to see if a Cell will mimic on an entity
const cell4 = canvas.buildCell({

    name: 'cell-4',

    mimic: 'block-1',
    lockTo: 'mimic',

    width: -20,
    height: -20,

    handleX: -10,
    handleY: -10,

    useMimicDimensions: true,
    useMimicScale: true,
    useMimicStart: true,
    useMimicHandle: true,
    useMimicOffset: false,
    useMimicRotation: true,

    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: true,
    addOwnOffsetToMimic: false,
    addOwnRotationToMimic: false,

    backgroundColor: 'lavender',
});

// Check to see if a Cell will pivot to an entity
const cell5 = canvas.buildCell({

    name: 'cell-5',

    pivot: 'block-2',
    lockTo: 'pivot',

    dimensions: [110, 90],
    handle: [-5, -5],

    addPivotRotation: true,

    backgroundColor: 'lavender',
});

// Add in a hover check
scrawl.library.entity['block-1'].set({

    onEnter: function () {

        this.set({
            scale: 1.2,
        });

        cell4.set({
            backgroundColor: 'pink',
        });
    },

    onLeave: function () {

        this.set({
            scale: 1,
        });

        cell4.set({
            backgroundColor: 'lavender',
        });
    },
});

scrawl.library.entity['block-2'].set({

    onEnter: () => cell5.set({ backgroundColor: 'pink' }),

    onLeave: () => cell5.set({ backgroundColor: 'lavender' }),
});

scrawl.addListener('move', () => canvas.here.active && canvas.cascadeEventAction('move'), canvas.domElement);

// Add labels to Cells
scrawl.makePhrase({

    name: 'label-1',
    group: 'cell-1',

    text: 'Cell 1',
    font: '20px sans-serif',
    fillStyle: 'red',

    start: [5, 5],

}).clone({

    name: 'label-2',
    group: 'cell-2',

    text: 'Cell 2',

    start: ['center', 'center'],
    handle: ['center', 'center'],

}).clone({

    name: 'label-3',
    group: 'cell-3',

    text: 'Cell 3',
    fillStyle: 'white',

}).clone({

    name: 'label-4',
    group: 'cell-4',

    text: 'Cell 4',
    fillStyle: 'green',

}).clone({

    name: 'label-5',
    group: 'cell-5',

    text: 'Cell 5',
});

// .. Also add some other entitys to the Cells
scrawl.makeWheel({

    name: 'wheel-1',
    group: 'cell-1',

    radius: 30,

    start: [100, 120],

    strokeStyle: 'red',
    lineWidth: 8,
    method: 'draw',

}).clone({

    name: 'wheel-2',
    group: 'cell-2',

    radius: 40,

    start: ['center', 'center'],
    handle: ['center', 'center'],

}).clone({

    name: 'wheel-3',
    group: canvas.base.name,

    strokeStyle: 'green',

    start: ['85%', '85%'],
    pivot: 'cell-3',
    lockTo: 'pivot',
});

scrawl.makeBlock({

    name: 'mimic-block',

    group: canvas.base.name,

    fillStyle: 'yellow',
    strokeStyle: 'green',
    lineWidth: 4,
    method: 'fillThenDraw',

    mimic: 'cell-2',
    lockTo: 'mimic',

    width: 30,
    height: 30,

    handleX: 15,
    handleY: 15,

    useMimicDimensions: true,
    useMimicScale: false,
    useMimicStart: true,
    useMimicHandle: true,
    useMimicOffset: false,
    useMimicRotation: true,

    addOwnDimensionsToMimic: true,
    addOwnScaleToMimic: false,
    addOwnStartToMimic: false,
    addOwnHandleToMimic: true,
    addOwnOffsetToMimic: false,
    addOwnRotationToMimic: false,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    // __Warning: directly accessing current- attributes is dangerous. Directly setting current- attributes is fatal!__
    return `Canvas dimensions: ${canvas.currentDimensions.join(', ')}
Base dimensions: ${canvas.base.currentDimensions.join(', ')}
Cell 1 dimensions: ${cell1.currentDimensions.join(', ')}
Cell 2 dimensions: ${cell2.currentDimensions.join(', ')}
Cell 3 dimensions: ${cell3.currentDimensions.join(', ')}
Cell 4 dimensions: ${cell4.currentDimensions.join(', ')}
Cell 5 dimensions: ${cell5.currentDimensions.join(', ')}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
