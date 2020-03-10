// ## Demo Canvas 019 

// [Artefact collision detection](../../demo/canvas-019.html)
import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'black',
});


// Setup the background grid
let myGrid = scrawl.makeGrid({

    name: 'test-grid',

    width: '100%',
    height: '100%',

    columns: 60,
    rows: 40,

    columnGutterWidth: 0.3,
    rowGutterWidth: 0.3,

    tileSources: [
        {
            type: 'color',
            source: 'aliceblue',
        }, {
            type: 'color',
            source: 'red',
        }
    ]
});


// Create test entitys
let testers = scrawl.makeGroup({

    name: 'testers',
    host: canvas.base.name,
    order: 1,
});

let myblock = scrawl.makeBlock({

    name: 'block-tester',
    group: 'testers',
    collides: true,

    width: 120,
    height: 40,

    startX: 60,
    startY: 60,

    fillStyle: 'rgba(0,140,50,0.7)',
    method: 'fill',
});

let mypicture = scrawl.makePicture({

    name: 'picture-tester',
    group: 'testers',
    collides: true,

    imageSource: 'img/iris.png',

    width: 150,
    height: 100,

    startX: 420,
    startY: 70,

    copyWidth: 150,
    copyHeight: 100,
    copyStartX: 100,
    copyStartY: 150,

    method: 'fill',
    globalAlpha: 0.8,
});

let myphrase = scrawl.makePhrase({

    name: 'phrase-tester',
    group: 'testers',
    collides: true,

    text: 'H&epsilon;lj&ouml;!',
    font: 'bold 40px Garamond, serif',

    width: 120,
    startX: 250,
    startY: 150,

    justify: 'center',
    lineHeight: 1,

    fillStyle: 'rgb(50,0,0)',
    method: 'fill',
    globalAlpha: 0.6,
});

let myoval = scrawl.makeOval({

    name: 'shape-oval-tester',
    group: 'testers',
    collides: true,

    startX: 30,
    startY: 160,

    radiusX: 40,
    radiusY: 55,
    intersectY: 0.6,

    fillStyle: 'rgba(20, 50, 180, 0.7)',
    method: 'fill',
});

let mybezier = scrawl.makeBezier({

    name: 'shape-bezier-tester',
    group: 'testers',
    collides: true,

    startX: 200,
    startY: 210,
    startControlX: 260,
    startControlY: 180,
    endControlX: 320,
    endControlY: 300,
    endX: 380,
    endY: 240,

    lineWidth: 3,
    lineCap: 'round',
    strokeStyle: 'orange',
    method: 'draw',

    boundingBoxColor: 'lightgray',
    showBoundingBox: true,
});

let mycircle = scrawl.makeWheel({

    name: 'wheel-circle-tester',
    group: 'testers',
    collides: true,

    radius: 50,

    startX: 460,
    startY: 220,

    fillStyle: 'rgba(100, 0, 100, 0.7)',
    method: 'fill',
});

let myflatcircle = mycircle.clone({

    name: 'wheel-flatcircle-tester',

    startAngle: 50,
    endAngle: -50,

    startX: 260,
    startY: 25,

    fillStyle: 'rgba(100, 140, 30, 0.7)',
});

let mypie = myflatcircle.clone({

    name: 'wheel-pie-tester',

    includeCenter: true,

    startX: 320,
    startY: 280,

    fillStyle: 'rgba(20, 100, 250, 0.7)',
});

let myslice = mypie.clone({

    name: 'wheel-slice-tester',

    clockwise: false,

    startX: 120,
    startY: 260,

    fillStyle: 'rgba(180, 100, 60, 0.7)',
});


// Create the drag-and-drop zone
let current = scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: 'testers',
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
});


// Function to display grid blocks which are currently in collision with the selected test entity
let currentEntity = myblock;

let checkHits = function () {

    myGrid.setAllTilesTo(0);

    let hits = myGrid.checkHit(currentEntity.getSensors());

    if (hits) myGrid.setTilesTo(hits.tiles, 1);
};


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        dragging = current();

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Currently dragging: ${(dragging) ? dragging.artefact.name : 'nothing'}
Pools - cell: ${scrawl.cellPoolLength()}; coordinate: ${scrawl.coordinatePoolLength()}; vector: ${scrawl.vectorPoolLength()}; quaternion: ${scrawl.quaternionPoolLength()}`;
    };
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: checkHits,
    afterShow: report,
});


// User interaction - setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: testers,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        handle_xAbsolute: ['handleX', 'round'],
        handle_yAbsolute: ['handleY', 'round'],

        offset_xAbsolute: ['offsetX', 'round'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],

        sensitivity: ['sensorSpacing', 'round'],
    },
});

let updateArtefact = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let item = currentEntity.name,
        target = e.target.value;

    if (target !== item) {

        if (target === 'block') currentEntity = myblock;
        else if (target === 'phrase') currentEntity = myphrase;
        else if (target === 'picture') currentEntity = mypicture;
        else if (target === 'bezier') currentEntity = mybezier;
        else if (target === 'oval') currentEntity = myoval;
        else if (target === 'circle') currentEntity = mycircle;
        else if (target === 'dome') currentEntity = myflatcircle;
        else if (target === 'pie') currentEntity = mypie;
        else if (target === 'slice') currentEntity = myslice;
    }
};
scrawl.addNativeListener(['input', 'change'], updateArtefact, '#artefact');

// Setup form
document.querySelector('#artefact').options.selectedIndex = 0;
document.querySelector('#sensitivity').value = 50;
document.querySelector('#handle_xAbsolute').value = 0;
document.querySelector('#handle_yAbsolute').value = 0;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
