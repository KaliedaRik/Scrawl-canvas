// # Demo Canvas 212
// EnhancedLabel entity - updating font parts; experiments with variable font

// [Run code](../../demo/canvas-212.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


scrawl.makeGradient({
    name: name('linear-gradient'),
    endX: '100%',
    endY: '100%',

    colors: [
        [0, 'black'],
        [99, 'black'],
        [100, 'red'],
        [199, 'red'],
        [200, 'black'],
        [299, 'black'],
        [300, 'blue'],
        [399, 'blue'],
        [400, 'black'],
        [499, 'black'],
        [500, 'green'],
        [599, 'green'],
        [600, 'black'],
        [699, 'black'],
        [700, 'orange'],
        [799, 'orange'],
        [800, 'black'],
        [899, 'black'],
        [900, 'yellow'],
        [999, 'yellow'],
    ],
    colorSpace: 'OKLAB',
    precision: 5,
});

scrawl.makePattern({

    name: name('water-pattern'),
    imageSource: 'img/water.png',
});

scrawl.makeBlock({

    name: name('block-template'),

    start: ['25%', 'center'],
    handle: ['center', 'center'],
    dimensions: ['40%', '80%'],

    method: 'none',
});

const myLabel = scrawl.makeEnhancedLabel({

    name: name('block-label'),

    layoutTemplate: name('block-template'),
    fontString: '25px "Roboto Flex"',
    text: 'Lorem ipsum dolor sit amet, con&shy;sectetur 😀 adi&shy;piscing &eacute;lit, <span style="font-size: 120%;">sed do eius-mod tempor in&shy;cididunt</span> ut <span style="--SC-fill-style: slategray">labore et dolore</span> magna aliqua.',

    justifyLine: 'start',
    textHandle: ['center', 'alphabetic'],
    lockFillStyleToEntity: true,
});

scrawl.makeLine({

    name: name('line'),

    start: ['55%', '90%'],
    end: ['90%', '10%'],

    useAsPath: true,
    useStartAsControlPoint: true,

    method: 'none',
});

scrawl.makeQuadratic({

    name: name('quadratic'),

    start: ['55%', '90%'],
    control: ['60%', '50%'],
    end: ['90%', '10%'],

    useAsPath: true,
    useStartAsControlPoint: true,
    precision: 1,

    method: 'none',
});

scrawl.makeBezier({

    name: name('bezier'),

    start: ['55%', '90%'],
    startControl: ['80%', '60%'],
    endControl: ['70%', '40%'],
    end: ['90%', '10%'],

    useAsPath: true,
    useStartAsControlPoint: true,
    precision: 1,

    method: 'draw',
});

scrawl.makeOval({

    name: name('oval'),

    start: ['75%', '50%'],
    handle: ['center', 'center'],
    radiusX: '15%',
    radiusY: '35%',
    roll: 30,

    useAsPath: true,
    useStartAsControlPoint: true,
    precision: 1,

    method: 'none',
});

scrawl.makeEnhancedLabel({

    name: name('path-label'),

    layoutTemplate: name('bezier'),
    fontString: '25px "Roboto Flex"',
    text: 'Lorem ipsum dolor sit amet',

    useLayoutTemplateAsPath: true,
    breakTextOnSpaces: false,

    textHandle: ['center', 'alphabetic'],
    lockFillStyleToEntity: true,

    delta: {
        pathPosition: -0.002,
    },
});

scrawl.makeEnhancedLabel({

    name: name('check-label'),

    layoutTemplate: name('bezier'),
    fontString: '25px serif',
    text: 'Lorem ipsum dolor sit amet',

    useLayoutTemplateAsPath: true,
    breakTextOnSpaces: false,

    textHandle: ['center', '-100%'],
});

scrawl.makeWheel({

    name: name('start-mark'),
    radius: 4,
    handle: ['center', 'center'],
    path: name('bezier'),
    constantSpeedAlongPath: true,
    lockTo: 'path',
    fillStyle: 'yellow',
    method: 'fillThenDraw',
    delta: {
        pathPosition: -0.002,
    },
});


const labelGroup = scrawl.makeGroup({

    name: name('labels-group'),

}).addArtefacts(name('block-label'), name('path-label'), name('check-label'));


const pathLabelsGroup = scrawl.makeGroup({

    name: name('path-labels-group'),

}).addArtefacts(name('path-label'), name('check-label'), name('start-mark'));


const pathGroup = scrawl.makeGroup({

    name: name('paths-group'),

}).addArtefacts(name('line'), name('quadratic'), name('bezier'), name('oval'));


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', () => {
    return `
Font.details:
    Font string (entity): ${myLabel.get('fontString')}
    Font string (canvas): ${myLabel.get('canvasFont')}

    Font size: ${myLabel.get('fontSize')}
    Font style: ${myLabel.get('fontStyle')}
    Font stretch: ${myLabel.get('fontStretch')}
    Font variant: ${myLabel.get('fontVariantCaps')}
    Font weight: ${myLabel.get('fontWeight')}
    `;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = initializeDomInputs([
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'fontWeight', '400'],
    ['input', 'fontStretch', '100'],
    ['select', 'fontSize', 0],
    ['select', 'fontVariantCaps', 0],
    ['select', 'fontStyle', 0],
    ['select', 'lockFillStyleToEntity', 1],
    ['select', 'fillStyle', 0],
    ['select', 'layoutTemplate', 2],
]);


scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: labelGroup,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        fontSize: ['fontSize', 'raw'],
        roll: ['roll', 'float'],
        scale: ['scale', 'float'],
        fontWeight: ['fontWeight', 'int'],
        fontVariantCaps: ['fontVariantCaps', 'raw'],
        fontStyle: ['fontStyle', 'raw'],
        fontStretch: ['fontStretch', '%'],
        lockFillStyleToEntity: ['lockFillStyleToEntity', 'boolean'],
        fillStyle: ['fillStyle', 'raw'],
    },
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target) {

        pathGroup.setArtefacts({ method: 'none' });

        const selected = scrawl.findEntity(name(e.target.value));

        if (selected) {

            selected.set({ method: 'draw' });

            pathLabelsGroup.setArtefacts({ 

                // For the EnhancedLabel entitys
                layoutTemplate: selected,

                // For the wheel entity
                path: selected,
            });
        }
    }

}, dom.layoutTemplate);


// #### Development and testing
console.log(scrawl.library);
