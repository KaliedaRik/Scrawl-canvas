// # Demo Filters 028
// Stencil (background) filter functionality

// [Run code](../../demo/filters-028.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// #### Define filters
// __Displace__ filter
scrawl.makeNoiseAsset({

    name: name('my-noise-generator'),
    width: 400,
    height: 400,
    scale: 60,

    sumFunction: 'modular',
    sumAmplitude: 4,

    noiseEngine: 'worley-manhattan',
});

// TODO: this is required to make the noise asset work ... but there must be a better way?
scrawl.makePicture({
    name: name('temp-1'),
    asset: name('my-noise-generator'),
    dimensions: [100, 100],
    copyDimensions: ['100%', '100%'],
    method: 'none',
});

scrawl.makeFilter({
    name: name('displace'),
    actions: [
        {
            action: 'process-image',
            asset: name('my-noise-generator'),
            width: 400,
            height: 400,
            copyWidth: 400,
            copyHeight: 400,
            lineOut: 'noise-map',
        },
        {
            action: 'displace',
            lineMix: 'noise-map',
            scaleX: 3,
            scaleY: 3,
            transparentEdges: true,
        }
    ],
});

// __Blue__ filter
scrawl.makeFilter({

    name: name('blue'),
    method: 'blue',
});

// __Emboss__ filter
scrawl.makeFilter({

    name: name('emboss'),
    method: 'emboss',
    angle: 225,
    strength: 10,
    tolerance: 50,
});

// __Threshhold__ filter
scrawl.makeFilter({
    name: name('threshold'),
    method: 'threshold',
    level: 127,
    lowRed: 100,
    lowGreen: 0,
    lowBlue: 0,
    highRed: 220,
    highGreen: 60,
    highBlue: 60,
});

// __Swirl__ filter
scrawl.makeFilter({
    name: name('swirl'),
    method: 'swirl',
    startX: '50%',
    startY: '50%',
    innerRadius: 0,
    outerRadius: '50%',
    angle: 240,
    easing: 'easeOutSine',
});

// __Pixellate__ filter
scrawl.makeFilter({
    name: name('pixelate'),
    method: 'pixelate',
    tileWidth: 20,
    tileHeight: 20,
    offsetX: 8,
    offsetY: 8,
});

// __Gaussian Blur__ filter
scrawl.makeFilter({
    name: name('gaussianBlur'),
    method: 'gaussianBlur',
    radius: 4,
});

// __ChannelLevels__ filter
scrawl.makeFilter({
    name: name('channelLevels'),
    method: 'channelLevels',
    red: [50, 200],
    green: [60, 220, 150],
    blue: [40, 180],
    alpha: [],
});


// #### Scene entitys
const piccy = scrawl.makePicture({

    name: name('background'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
});

const group = scrawl.makeGroup({
    name: name('mouse-group'),
    host: canvas.get('baseName'),
});

const outlineGroup = scrawl.makeGroup({
    name: name('outline-group'),
    host: canvas.get('baseName'),
});

// Gradient
scrawl.makeGradient({

    name: name('gradient'),
    endX: '100%',

    colors: [
        [0, 'blue'],
        [350, 'red'],
        [500, 'transparent'],
        [649, 'red'],
        [999, 'green']
    ],
    colorSpace: 'OKLAB',
    precision: 5,
});

// Note: stencil filters cannot be memoized, which makes them slow
// + We can't memoize what we don't know, and we have no way of knowing what the canvas behind the entity will look like, or if it has changed since the last Display cycle
const cog = scrawl.makeCog({

    name: name('cog'),
    group,
    start: ['center', 'center'],
    handle: ['center', 'center'],
    outerRadius: 120,
    innerRadius: 80,
    outerControlsDistance: 20,
    innerControlsDistance: 16,
    points: 12,
    fillStyle: name('gradient'),
    lockFillStyleToEntity: true,
    delta: {
        roll: 0.5,
    },
    isStencil: true,
    visibility: false,
});

cog.clone({

    name: name('cog-outline'),
    group: outlineGroup,
    strokeStyle: 'white',
    lineWidth: 2,
    method: 'draw',
    pivot: name('cog'),
    lockTo: 'pivot',
    isStencil: false,
});

const block = scrawl.makeBlock({

    name: name('block'),
    group,
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: [200, 120],
    fillStyle: 'red',
    isStencil: true,
});

block.clone({

    name: name('block-outline'),
    group: outlineGroup,
    strokeStyle: 'white',
    lineWidth: 2,
    method: 'draw',
    pivot: name('block'),
    lockTo: 'pivot',
    isStencil: false,
});

// Cat spritesheet image file taken from https://www.kisspng.com/png-walk-cycle-css-animations-drawing-sprite-sprite-1064760/
scrawl.importSprite('img/cat-sprite.png');

const cat = scrawl.makePicture({

    name: name('cat'),
    group,
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: [300, 150],
    roll: 20,
    asset: 'cat-sprite',
    spriteTrack: 'walk',
    spriteFrameDuration: 100,
    isStencil: true,
    visibility: false,
});

cat.clone({

    name: name('cat-outline'),
    group: outlineGroup,
    strokeStyle: 'white',
    lineWidth: 2,
    method: 'draw',
    pivot: name('cat'),
    lockTo: 'pivot',
    isStencil: false,
});

let stencil = block;


// #### Scene animation
// Function to check whether mouse cursor is over canvas, and lock the reference entity accordingly
const mouseCheck = function () {

    let active = false;

    return function () {

        if (canvas.here.active !== active) {

            active = canvas.here.active;

            stencil.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();


// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    globalAlpha - ${dom.globalAlpha.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: mouseCheck,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = initializeDomInputs([
    ['input', 'globalAlpha', '1'],
    ['select', 'filter', 0],
    ['select', 'entity', 0],
    ['select', 'globalCompositeOperation', 0],
]);


// Handle the filter selector
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        e.preventDefault();
        e.returnValue = false;

        const val = e.target.value;

        if (val) {

            group.setArtefacts({
                filters: [name(val)],
            });
        }
        else {

            group.setArtefacts({
                filters: [],
            });
        }
    }
}, dom.filter);


// Handle the entity selector
scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        e.preventDefault();
        e.returnValue = false;

        const val = e.target.value;

        if (val) {

            group.setArtefacts({
                visibility: false,
            });

            outlineGroup.setArtefacts({
                visibility: false,
            });

            cat.haltSprite();

            /** @ts-expect-error */
            stencil = group.getArtefact(name(val));

            stencil.set({
                visibility: true,
            });

            if (val === 'cat') cat.playSprite();

            outlineGroup.getArtefact(name(`${val}-outline`)).set({
                visibility: true,
            });
        }
    }
}, dom.entity);


// Handle the composite and alpha inputs
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: group,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        globalAlpha: ['globalAlpha', 'float'],
        globalCompositeOperation: ['globalCompositeOperation', 'raw'],
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
