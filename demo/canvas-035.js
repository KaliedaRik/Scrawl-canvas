// # Demo Canvas 035 
// Pattern style functionality

// [Run code](../../demo/canvas-035.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas,
    styles = scrawl.library.styles,
    cells = scrawl.library.cell;

canvas.base.set({

    compileOrder: 1,
});


// Create image-based patterns
scrawl.makePattern({

    name: 'bunny-pattern',
    imageSource: 'img/bunny.png',

}).clone({

    name: 'water-pattern',
    imageSource: 'img/water.png',

}).clone({

    name: 'leaves-pattern',
    imageSource: 'img/leaves.png',

});


// Create video-based pattern
const videoPattern = scrawl.makePattern({

    name: 'video-pattern',
    videoSource: 'img/Sea - 4006.mp4',
}); 

// The video can't play until we detect some form of user interaction
scrawl.addListener('up', () => {

    if (videoPattern.get('video_paused')) {

        videoPattern.set({

            video_muted: true,
            video_loop: true,

        }).videoPlay();
    }

}, canvas.domElement);


// Create a Cell to use as a pattern
canvas.buildCell({

    name: 'cell-pattern',

    width: 50,
    height: 50,

    backgroundColor: 'lightblue',

    shown: false,
});

scrawl.makeBlock({

    name: 'cell-pattern-block',
    group: 'cell-pattern',

    width: 40,
    height: 40,

    startX: 'center',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    method: 'fill',

    fillStyle: 'water-pattern',

    delta: {
        roll: -0.3
    },
});


// Create a spritesheet-based pattern
// + As defined in the [CanvasPattern API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) the pattern constructor takes an image source (&lt;img>, SVG &lt;image>, &lt;video>, &lt;canvas>, ImageBitmap, or OffscreenCanvas) as its argument, but is not able to use just a part of that source for the pattern. 
// + To use a spritesheet as a source, we need to work around this limitation by putting a Picture entity using the spritesheet into a Cell, then using the Cell as the pattern's source.
canvas.buildCell({

    name: 'cat-pattern',

    width: 150,
    height: 75,

    shown: false,
});

scrawl.makePicture({

    name: 'cell-pattern-sprite',
    group: 'cat-pattern',

    width: '100%',
    height: '100%',

    spriteSource: 'img/cat-sprite.png',
    spriteTrack: 'walk',
    spriteFrameDuration: 100,

}).playSprite();


// We'll display the patterns in a Block entity which users can update and interact with, for testing
const myBlock = scrawl.makeBlock({

    name: 'test-block',

    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: [300, 200],

    fillStyle: 'bunny-pattern',

    lineWidth: 6,
    strokeStyle: 'black',

    method: 'fillThenDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let matrix, matrixVals = '';

    return function () {

        if (!matrix) matrix = videoPattern.patternMatrix;matrixVals

        if (matrix) matrixVals = `A: ${matrix.a}, B: ${matrix.b}, C: ${matrix.c}, D: ${matrix.d}, E: ${matrix.e}, F: ${matrix.f}`;

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Matrix - ${matrixVals}`;
    };
}();

// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
});

// Setup form observer functionality for display block
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myBlock,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        relativeWidth: ['width', '%'],
        absoluteWidth: ['width', 'round'],

        relativeHeight: ['height', '%'],
        absoluteHeight: ['height', 'round'],

        handle_xPercent: ['handleX', '%'],
        handle_xAbsolute: ['handleX', 'round'],

        handle_yPercent: ['handleY', '%'],
        handle_yAbsolute: ['handleY', 'round'],

        offset_xPercent: ['offsetX', '%'],
        offset_xAbsolute: ['offsetX', 'round'],

        offset_yPercent: ['offsetY', '%'],
        offset_yAbsolute: ['offsetY', 'round'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
        scaleOutline: ['scaleOutline', 'boolean'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],

        pattern: ['fillStyle', 'raw'],
    },
});

// Setup form observer functionality for patterns
// + we'll cascade form updates to all patterns, and Cells used as patterns
const myPatterns = [styles['bunny-pattern'], styles['leaves-pattern'], styles['video-pattern'], cells['cell-pattern'], cells['cat-pattern']];

let updateRepeat = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value;

    myPatterns.forEach(p => p.set({repeat: val}));
};
scrawl.addNativeListener(['input', 'change'], updateRepeat, '#repeat');

let updateMatrix = (e) => {

    e.preventDefault();
    e.returnValue = false;

    let val = e.target.value,
        id = e.target.id;

    myPatterns.forEach(p => p.set({[id]: parseFloat(val)}));
};
scrawl.addNativeListener(['input', 'change'], updateMatrix, '.matrix');


// Setup form
document.querySelector('#relativeWidth').value = 50;
document.querySelector('#absoluteWidth').value = 300;
document.querySelector('#relativeHeight').value = 50;
document.querySelector('#absoluteHeight').value = 200;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#handle_xAbsolute').value = 150;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#offset_xPercent').value = 0;
document.querySelector('#offset_yPercent').value = 0;
document.querySelector('#offset_xAbsolute').value = 0;
document.querySelector('#offset_yAbsolute').value = 0;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
document.querySelector('#scaleOutline').options.selectedIndex = 1;
document.querySelector('#pattern').options.selectedIndex = 0;
document.querySelector('#repeat').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);

