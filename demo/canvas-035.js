// # Demo Canvas 035
// Pattern style functionality

// [Run code](../../demo/canvas-035.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


canvas.setBase({
    compileOrder: 1,
});


// Create image-based patterns
scrawl.makePattern({

    name: name('bunny-pattern'),
    imageSource: 'img/bunny.png',

}).clone({

    name: name('water-pattern'),
    imageSource: 'img/water.png',

}).clone({

    name: name('leaves-pattern'),
    imageSource: 'img/leaves.png',

});


// Create video-based pattern
const videoPattern = scrawl.makePattern({

    name: name('video-pattern'),
    videoSource: 'img/Sea - 4006.mp4',
});

// The video can't play until we detect some form of user interaction
const videoCheck = scrawl.addListener('up', () => {

    if (videoPattern.get('video_paused')) {

        videoPattern.set({

            video_muted: true,
            video_loop: true,

        }).videoPlay();

        // Check is one-time only - remove listener once it has done its work
        videoCheck();
    }

}, canvas.domElement);


// Create a Cell to use as a pattern
canvas.buildCell({

    name: name('cell-pattern'),

    width: 50,
    height: 50,

    backgroundColor: 'lightblue',

    shown: false,
    useAsPattern: true,
});

scrawl.makeBlock({

    name: name('cell-pattern-block'),
    group: name('cell-pattern'),

    width: 40,
    height: 40,

    startX: 'center',
    startY: 'center',

    handleX: 'center',
    handleY: 'center',

    method: 'fill',

    fillStyle: name('water-pattern'),

    delta: {
        roll: -0.3
    },
});


// Create a spritesheet-based pattern
// + As defined in the [CanvasPattern API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) the pattern constructor takes an image source (&lt;img>, SVG &lt;image>, &lt;video>, &lt;canvas>, ImageBitmap, or OffscreenCanvas) as its argument, but is not able to use just a part of that source for the pattern.
// + To use a spritesheet as a source, we need to work around this limitation by putting a Picture entity using the spritesheet into a Cell, then using the Cell as the pattern's source.
canvas.buildCell({

    name: name('cat-pattern'),

    width: 150,
    height: 75,

    shown: false,
    useAsPattern: true,
});

scrawl.makePicture({

    name: name('cell-pattern-sprite'),
    group: name('cat-pattern'),

    width: '100%',
    height: '100%',

    spriteSource: 'img/cat-sprite.png',
    spriteTrack: 'walk',
    spriteFrameDuration: 100,

}).playSprite();


// We'll display the patterns in a Block entity which users can update and interact with, for testing
const myBlock = scrawl.makeBlock({

    name: name('test-block'),

    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: [300, 200],

    fillStyle: name('bunny-pattern'),

    lineWidth: 6,
    strokeStyle: 'black',

    method: 'fillThenDraw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const bunny = scrawl.findPattern(name('bunny-pattern'));

    return `
    Matrix: [${bunny.get('matrixA')}, ${bunny.get('matrixB')}, ${bunny.get('matrixC')}, ${bunny.get('matrixD')}, ${bunny.get('matrixE')}, ${bunny.get('matrixF')}]
    stretchX: ${bunny.get('stretchX')}, stretchY: ${bunny.get('stretchY')}
    skewX: ${bunny.get('skewX')}, skewY: ${bunny.get('skewY')}
    shiftX: ${bunny.get('shiftX')}, shiftY: ${bunny.get('shiftY')}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});

// Setup form observer functionality for display block
scrawl.makeUpdater({

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
    },
});

// Setup form observer functionality for patterns
// + we'll cascade form updates to all patterns, and Cells used as patterns
const myPatterns = [
    scrawl.findPattern(name('bunny-pattern')),
    scrawl.findPattern(name('leaves-pattern')),
    scrawl.findPattern(name('video-pattern')),
    scrawl.findPattern(name('cell-pattern')),
    scrawl.findPattern(name('cat-pattern')),
];

const updatePattern = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    myBlock.set({ fillStyle: name(val)});
};
scrawl.addNativeListener(['input', 'change'], updatePattern, '#pattern');

const updateRepeat = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value;

    myPatterns.forEach(p => p.set({repeat: val}));
};
scrawl.addNativeListener(['input', 'change'], updateRepeat, '#repeat');

const updateMatrix = (e) => {

    e.preventDefault();
    e.returnValue = false;

    const val = e.target.value,
        id = e.target.id;

    myPatterns.forEach(p => p.set({[id]: parseFloat(val)}));
};
scrawl.addNativeListener(['input', 'change'], updateMatrix, '.matrix');


// Setup form
initializeDomInputs([
    ['input', 'absoluteHeight', '200'],
    ['input', 'absoluteWidth', '300'],
    ['input', 'handle_xAbsolute', '150'],
    ['input', 'handle_xPercent', '50'],
    ['input', 'handle_yAbsolute', '100'],
    ['input', 'handle_yPercent', '50'],
    ['input', 'offset_xAbsolute', '0'],
    ['input', 'offset_xPercent', '0'],
    ['input', 'offset_yAbsolute', '0'],
    ['input', 'offset_yPercent', '0'],
    ['input', 'relativeHeight', '50'],
    ['input', 'relativeWidth', '50'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['select', 'pattern', 0],
    ['select', 'repeat', 0],
    ['select', 'reverse', 0],
    ['select', 'scaleOutline', 1],
    ['select', 'upend', 0],
]);


// #### Development and testing
console.log(scrawl.library);
