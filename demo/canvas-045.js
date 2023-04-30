// # Demo Canvas 045
// Use clipping entitys as pivots; clipping entitys and cascade events

// [Run code](../../demo/canvas-045.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
scrawl.importDomImage('.ohara-koson')

const canvas = scrawl.library.canvas.mycanvas;


// First interaction - when user moves their mouse across the bird in its bough, wheels will spin
const spinFactory = function (name, radius, order, duration, clockwise) {

    scrawl.makeGroup({
        name: `${name}-group`,
        host: canvas.base.name,
        order,
    });

    const clipper = scrawl.makeWheel({
        name: `${name}-clip-${radius}`,
        group: `${name}-group`,
        start: [200, 250],
        handle: ['center', 'center'],
        radius,
        method: 'clip',

        onEnter: function () {
            if (!tween.isRunning()) tween.run();
        },

        onLeave: function () {
            if (!tween.isRunning()) tween.run();
        },
    });

    const tween = scrawl.makeTween({
        name: `${name}-tween-${radius}`,
        targets: `${name}-clip-${radius}`,
        duration,
        definitions: [
            {
                attribute: 'roll',
                start: (clockwise) ? 0 : 360,
                end: (clockwise) ? 360 : 0,
                engine: 'easeOutIn',
            },
        ],
    });

    scrawl.makePicture({
        name: `${name}-hoop-${radius}`,
        group: `${name}-group`,
        asset: 'songbird',

        pivot: `${name}-clip-${radius}`,
        addPivotRotation: true,
        lockTo: 'pivot',

        handle: ['center', 'center'],
        dimensions: [radius * 2, radius * 2],
        copyDimensions: [radius * 2, radius * 2],
        copyStart: [200 - radius, 250 - radius],
    });
    return clipper;
}

spinFactory('outer-ring', 170, 1, '4s', true);
spinFactory('thin-ring', 130, 2, '2.6s', true);
spinFactory('thick-ring', 120, 3, '5.3s', false);
spinFactory('inner-ring', 60, 4, '4s', true);
spinFactory('center', 20, 5, '4s', false);


// Second interaction - when the user moves their mouse across the signature, details about the painting will fade into view
scrawl.makePhrase({
  name: 'painting-details',
  text: `Songbird and flowering camellia §GRAY§(1910 - 1930)
§ITALIC§Ohara Koson (Japanese, 1877-1945)`,
  font: '15px Arial, sans-serif',
  start: ['10%', '72%'],
  width: '80%',
  globalAlpha: 0,
  order: 8,
}).addSectionClass('GRAY', { fill: 'gray' });

const detailsTween = scrawl.makeTween({
  name: 'show-details',
  targets: 'painting-details',
  duration: 5000,
  cycles: 2,
  reverseOnCycleEnd: true,
  definitions: [
    {
      attribute: 'globalAlpha',
      start: 0,
      end: 1,
      engine: 'easeIn5',
    },
  ],
});

scrawl.makeBlock({
  name: 'details-trigger',
  start: ['72%', '76%'],
  dimensions: ['12%', '16%'],
  method: 'none',
  onEnter: function () {
    if (!detailsTween.isRunning()) detailsTween.run();
  },
});


// Complete the painting by adding in the non-interactive bits
scrawl.makePicture({
  name: 'koson-songbird',
  asset: 'songbird',
  dimensions: ['100%', '100%'],
  copyDimensions: ['100%', '100%'],
  globalCompositeOperation: 'destination-over',
  order: 10,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);

// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener('touchmove', (e) => {

    e.preventDefault();
    e.returnValue = false;

}, canvas.domElement);


// #### Development and testing
console.log(scrawl.library);
