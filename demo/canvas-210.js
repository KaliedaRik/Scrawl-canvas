// # Demo Canvas 210
// EnhancedLabel - TextUnit dynamic manipulation

// [Run code](../../demo/canvas-210.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;

// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


scrawl.makeWheel({

    name: name('ball'),
    radius: 80,
    strokeStyle: 'rgb(255 0 0)',
    lineWidth: 3,
    method: 'draw',
    handle: ['center', 'center'],
    lockTo: 'mouse',
});

scrawl.makeBlock({

    name: name('template'),
    dimensions: ['100%', '100%'],

    start: ['center', 'center'],
    handle: ['center', 'center'],

    method: 'none',
});

const effect = scrawl.makeEnhancedLabel({

    name: name('effect'),
    layoutTemplate: name('template'),

    fontString: '18px "Roboto Serif"',

    fillStyle: 'aliceblue',

    text: '&rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr; &rarr;',

    textHandle: ['center', 'center'],
    wordSpacing: '5px',
    justifyLine: 'space-around',
});


// To test line, quadratic, bezier pivoting
scrawl.makeLine({
    name: name('line'),

    useStartAsControlPoint: true,
    pivot: name('effect'),
    pivotIndex: 10,
    lockTo: 'pivot',

    endPivot: name('effect'),
    endPivotIndex: 200,
    endLockTo: 'pivot',

    lineWidth: 10,
    lineCap: 'round',
    strokeStyle: 'rgb(255 255 255 / 0.4)',
    method: 'draw',
});

scrawl.makeQuadratic({
    name: name('quad'),

    useStartAsControlPoint: true,
    pivot: name('effect'),
    pivotIndex: 10,
    lockTo: 'pivot',

    controlPivot: name('effect'),
    controlPivotIndex: 290,
    controlLockTo: 'pivot',

    endPivot: name('effect'),
    endPivotIndex: 574,
    endLockTo: 'pivot',

    lineWidth: 10,
    lineCap: 'round',
    strokeStyle: 'rgb(255 255 255 / 0.4)',
    method: 'draw',
});

scrawl.makeBezier({
    name: name('bezier'),

    useStartAsControlPoint: true,
    pivot: name('effect'),
    pivotIndex: 10,
    lockTo: 'pivot',

    startControlPivot: name('effect'),
    startControlPivotIndex: 270,
    startControlLockTo: 'pivot',

    endControlPivot: name('effect'),
    endControlPivotIndex: 390,
    endControlLockTo: 'pivot',

    endPivot: name('effect'),
    endPivotIndex: 594,
    endLockTo: 'pivot',

    lineWidth: 10,
    lineCap: 'round',
    strokeStyle: 'rgb(255 255 255 / 0.4)',
    method: 'draw',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Update TextUnit display on a per-display-cycle basis
let currentX = 0,
    currentY = 0;

const units = effect.get('textUnits'),
    here = canvas.here,
    radToDeg = 180 / Math.PI;

const updateTextUnits = () => {

    if (here.x !== currentX || here.y !== currentY) {

        const coord = scrawl.requestCoordinate();

        let distance, x, y, angle, arrowStyle;

        const displayedUnits = units.findAllDisplayedChars();

        displayedUnits.forEach(unit => {

            [x, y] = coord.setFromVector(here).subtract(unit.startData);

            distance = coord.getMagnitude();

// @ts-expect-error
            angle = Math.atan2(y, x) * radToDeg;

            arrowStyle = {};
// @ts-expect-error
            if (x < 0 && y < 0) arrowStyle.fillStyle = 'rgb(255 140 140)';
// @ts-expect-error
            else if (x > 0 && y < 0) arrowStyle.fillStyle = 'rgb(140 140 255)';
// @ts-expect-error
            else if (x < 0 && y > 0) arrowStyle.fillStyle = 'rgb(140 255 140)';
// @ts-expect-error
            else arrowStyle.fillStyle = 'rgb(255 255 0)';

            if (distance < 80) {
// @ts-expect-error
                arrowStyle.method = 'draw';
// @ts-expect-error
                arrowStyle.strokeStyle = 'rgb(255 255 255)';
                angle += 180;
            }

            effect.setTextUnit(unit.index, {

                // `localAlignment` gets added to the entity's alignment value
                localAlignment: angle,

                // `localStyle` can be used to override the following attributes on a per-TextUnit basis:
                // + `fillStyle`, `strokeStyle`, `method`
                // + `includeUnderline`, `underlineStyle`, `underlineOffset`, `underlineWidth`
                // + `includeOverline`, `overlineStyle`, `overlineOffset`, `overlineWidth`
                // + `includeHighlight`, `highlightStyle`
                localStyle: arrowStyle,
            });
        });

        currentX = here.x;
        currentY = here.y;

        scrawl.releaseCoordinate(coord);
    }
};


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: updateTextUnits,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
