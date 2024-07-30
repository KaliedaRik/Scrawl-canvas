/* eslint-disable */
// # Demo Rapier 001
// Rapier physics engine - stacking boxes

// [Run code](../../demo/rapier-001.html)


// #### Import statements
// Rapier runs in Wasm-land, SC runs as it normally does in these demos
import * as scrawl from '../source/scrawl.js';

/** @ts-expect-error */
import rapier from 'https://cdn.skypack.dev/@dimforge/rapier2d-compat';

import { reportSpeed } from './utilities.js';


// To handle the Rapier-SC interface, we can create a Rapier factory in another file and import it
// + This Rapier factory is just a proof-of-concept showing one approach to the interface problem
import { makeRapier } from './modules/rapier-utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');

// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


const colorMaker = scrawl.makeColor({
    name: name('color-generator'),
    maximumColor: "orange",
    minimumColor: "brown"
});


// Create the Rapier model data we will be animating. We'll do this using a bespoke data model to define the rigid bodies used in the rapier world, which also includes some SC-related data used when we display these models
// + The rapier model's scene dimensions are, in this instance, a 1m x 1m square. The starting position and dimensions of the boxes we are designing should thus be given as a portion of that square.
// + Rapier's coordinate system starts at the bottom-left corner of the scene; the canvas coordinate system starts at the top-left corner. We'll handle this coordinate complexity as part of the Rapier factory's setup. For defining starting positions, we'll stick to Rapier coordinates.
// + Rapier automatically sets its rigid body block coordinates at the center of the block.
// + Rapier gives many of its objects `handles` (names) automatically - these are unique Integers. SC `handle` attributes are something completely different.
//
// ```
// {
//   startX: Number between 0 and 1 
//   startY: Number between 0 and 1 
//   width: Number between 0 and 1 
//   height: Number between 0 and 1 
//   color: valid CSS color String
//   isFixed: Boolean
// }
// ```

const bodies = [];

// We need a fixed ground object
// + Rapier automatically centers cuboid shapes around their start coordinates
bodies.push({
    startX: 300 / 600,
    startY: 5 / 600,
    width: 1200 / 600,
    height: 10 / 600,
    color: 'green',
    isFixed: true,
});

// Build out the blocks in a 6 by 6 grid
// + We know the canvas dimensions are 600 x 600px; to convert to Rapier positions we divide by 600
// for (let x = 50; x < 600; x += 100) {

//     for (let y = 50; y < 600; y += 100) {

//         bodies.push({
//             startX: x / 600,
//             startY: y / 600,
//             width: (((Math.random() * 50) + 30) / 600),
//             height: (((Math.random() * 40) + 30) / 600),
//             color: colorMaker.getRangeColor(Math.random()),
//             isFixed: false,
//         });
//     }
// }

        bodies.push({
            startX: 0.5,
            startY: 0.85,
            width: 0.2,
            height: 0.2,
            color: colorMaker.getRangeColor(Math.random()),
            isFixed: false,
        });

// Bring together all the arguments we're going to push into the Rapier factory
const args = {
    scrawl,
    rapier,
    canvas,
    pixelsPerMeter: 600,
    bodies,
    genericWorld: true,
};

// Invoke the Rapier factory
const model = makeRapier(args);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animations
scrawl.makeRender({

    name: name('visual-display'),
    target: canvas,
    afterShow: report,
});

const modelAnimation = scrawl.makeRender({

    name: name('model-animation'),
    noTarget: true,
    delay: true,

    // @ts-ignore
    commence: () => model.update(),
});


// #### User interaction
const runButton = document.querySelector("#run"),
    haltButton = document.querySelector("#halt");

scrawl.addNativeListener("click", () => {

    runButton.setAttribute("disabled", "disabled");
    haltButton.removeAttribute("disabled");

    if (!modelAnimation.isRunning()) modelAnimation.run();

}, runButton);

scrawl.addNativeListener("click", () => {

    runButton.removeAttribute("disabled");
    haltButton.setAttribute("disabled", "disabled");

    if (modelAnimation.isRunning()) modelAnimation.halt();

}, haltButton);


// #### Development and testing
console.log(model);
console.log(scrawl.library);
