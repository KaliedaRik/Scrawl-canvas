// # Demo Packets 001
// Save and load Scrawl-canvas entity using text packets

// [Run code](../../demo/packets-001.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Event listeners
scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);
scrawl.addListener('up', () => canvas.cascadeEventAction('up'), canvas.domElement);

// Testing Block entity
const box = scrawl.makeBlock({

    name: name('my-box'),

    startX: 10,
    startY: 10,

    width: 100,
    height: 50,

    fillStyle: 'red',

    onEnter: function () {
/** @ts-expect-error */
        this.set({
            fillStyle: 'pink',
        });
    },

    onLeave: function () {
/** @ts-expect-error */
        this.set({
            fillStyle: 'red',
        });
    },

/** @ts-expect-error */
    onUp: function () { this.clickAnchor() },

    anchor: {
        name: 'wikipedia-box-link',
        href: 'https://en.wikipedia.org/wiki/Box',
        description: 'Link to the Wikipedia article on boxes (opens in new tab)',

        clickAction: function () { return `console.log('box clicked')` },
    },
});

//     Test 1 - no argument supplied
const boxPacket1 = box.saveAsPacket();

//     Test 2 - argument === true
const boxPacket2 = box.saveAsPacket(true);

//     Test 3 - argument.includeDefaults === true
const boxPacket3 = box.saveAsPacket({
    includeDefaults: true,
});

//     Test 4 - argument.includeDefaults === Array
const boxPacket4 = box.saveAsPacket({
    includeDefaults: ['handle', 'miterLimit', 'onUp', 'useMimicScale', 'anchor', 'delta', 'filter', 'filters'],
});

console.log('Save test 1 result: ', JSON.parse(boxPacket1));
console.log('Save test 2 result: ', JSON.parse(boxPacket2));
console.log('Save test 3 result: ', JSON.parse(boxPacket3));
console.log('Save test 4 result: ', JSON.parse(boxPacket4));
// Save tests - expected results
// ```
// TEST 1
// [
//     "mycanvas-my-box",
//     "Block",
//     "entity",
//     {
//         "name":"mycanvas-my-box",
//         "dimensions":[100,50],
//         "start":[10,10],
//         "onEnter":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'pink',\n        });\n    ",
//         "onLeave":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'red',\n        });\n    ",
//         "onUp":"~~~ this.clickAnchor() ",
//         "anchor":{
//             "name":"wikipedia-box-link",
//             "description":"Link to the Wikipedia article on boxes (opens in new tab)",
//             "href":"https://en.wikipedia.org/wiki/Box",
//             "host":"mycanvas-my-box",
//             "clickAction":"~~~ return `console.log('box clicked')` "
//         },
//         "group":"mycanvas_base",
//         "fillStyle":"red"
//     }
// ]

// TEST 2, TEST 3
// [
//     "mycanvas-my-box",
//     "Block",
//     "entity",
//     {
//         "name":"mycanvas-my-box",
//         "dimensions":[100,50],
//         "start":[10,10],
//         "handle":[0,0],
//         "offset":[0,0],
//         "delta":{},
//         "deltaConstraints":{},
//         "lockTo":["start","start"],
//         "pivot":"",
//         "mimic":"",
//         "filters":[],
//         "visibility":true,
//         "calculateOrder":0,
//         "stampOrder":0,
//         "bringToFrontOnDrag":true,
//         "ignoreDragForX":false,
//         "ignoreDragForY":false,
//         "scale":1,
//         "roll":0,
//         "noUserInteraction":false,
//         "noPositionDependencies":false,
//         "noCanvasEngineUpdates":false,
//         "noFilters":false,
//         "noPathUpdates":false,
//         "noDeltaUpdates":false,
//         "checkDeltaConstraints":false,
//         "performDeltaChecks":false,
//         "pivotPin":0,
//         "pivotIndex":-1,
//         "addPivotHandle":false,
//         "addPivotOffset":true,
//         "addPivotRotation":false,
//         "useMimicDimensions":false,
//         "useMimicScale":false,
//         "useMimicStart":false,
//         "useMimicHandle":false,
//         "useMimicOffset":false,
//         "useMimicRotation":false,
//         "useMimicFlip":false,
//         "addOwnDimensionsToMimic":false,
//         "addOwnScaleToMimic":false,
//         "addOwnStartToMimic":false,
//         "addOwnHandleToMimic":false,
//         "addOwnOffsetToMimic":false,
//         "addOwnRotationToMimic":false,
//         "path":"",
//         "pathPosition":0,
//         "addPathHandle":false,
//         "addPathOffset":true,
//         "addPathRotation":false,
//         "constantSpeedAlongPath":false,
//         "isStencil":false,
//         "memoizeFilterOutput":false,
//         "method":"fill",
//         "winding":"nonzero",
//         "flipReverse":false,
//         "flipUpend":false,
//         "scaleOutline":true,
//         "scaleShadow":false,
//         "lockFillStyleToEntity":false,
//         "lockStrokeStyleToEntity":false,
//         "onEnter":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'pink',\n        });\n    ",
//         "onLeave":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'red',\n        });\n    ",
//         "onUp":"~~~ this.clickAnchor() ",
//         "anchor":{
//             "name":"wikipedia-box-link",
//             "description":"Link to the Wikipedia article on boxes (opens in new tab)",
//             "disabled":false,
//             "tabOrder":0,
//             "download":"",
//             "href":"https://en.wikipedia.org/wiki/Box",
//             "hreflang":"",
//             "ping":"",
//             "referrerpolicy":"",
//             "rel":"noreferrer",
//             "target":"_blank",
//             "anchorType":"",
//             "focusAction":true,
//             "blurAction":true,
//             "host":"mycanvas-my-box",
//             "clickAction":"~~~ return `console.log('box clicked')` "
//         },
//         "group":"mycanvas_base",
//         "fillStyle":"red",
//         "strokeStyle":"rgb(0 0 0 / 1)",
//         "globalAlpha":1,
//         "globalCompositeOperation":"source-over",
//         "lineWidth":1,
//         "lineCap":"butt",
//         "lineJoin":"miter",
//         "lineDashOffset":0,
//         "miterLimit":10,
//         "shadowOffsetX":0,
//         "shadowOffsetY":0,
//         "shadowBlur":0,
//         "shadowColor":"rgb(0 0 0 / 1)",
//         "font":"12px sans-serif",
//         "direction":"ltr",
//         "fontKerning":"normal",
//         "textRendering":"auto",
//         "letterSpacing":"0px",
//         "wordSpacing":"0px",
//         "fontStretch":"normal",
//         "fontVariantCaps":"normal",
//         "filter":"none",
//         "imageSmoothingEnabled":true,
//         "imageSmoothingQuality":"high",
//         "textAlign":"left",
//         "textBaseline":"top",
//         "lineDash":[]
//     }
// ]

// TEST 4
// [
//     "mycanvas-my-box",
//     "Block",
//     "entity",
//     {
//         "name":"mycanvas-my-box",
//         "dimensions":[100,50],
//         "start":[10,10],
//         "handle":[0,0],
//         "delta":{},
//         "filters":[],
//         "useMimicScale":false,
//         "onEnter":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'pink',\n        });\n    ",
//         "onLeave":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'red',\n        });\n    ",
//         "onUp":"~~~ this.clickAnchor() ",
//         "anchor":{
//             "name":"wikipedia-box-link",
//             "description":"Link to the Wikipedia article on boxes (opens in new tab)",
//             "href":"https://en.wikipedia.org/wiki/Box",
//             "host":"mycanvas-my-box",
//             "clickAction":"~~~ return `console.log('box clicked')` "
//         },
//         "group":"mycanvas_base",
//         "fillStyle":"red",
//         "miterLimit":10,
//         "filter":"none"
//     }
// ]
// ```


// Import tests - note that __importPacket() is an asynchronous function that returns a promise__
box.kill();
console.log('Import test setup - check to see if entity has been deleted', Object.keys(scrawl.library.entity));

// __Import test 1__ - expect the import to fail due to a bad packet (malformed JSON string)
canvas.importPacket(boxPacket1.substring(0, 50))
.then(res => console.log('Import test 1 success -', res))
.catch(err => console.log('Import test 1 error -', err));

// __Import test 2__ - expect the import to succeed
canvas.importPacket(boxPacket1)
.then(res => console.log('Import test 2 success -', res))
.catch(err => console.log('Import test 2 error -', err));

setTimeout(() => {

    // __Import test 3__ - expect the import to fail due to incorrect url (missing .txt)
    canvas.importPacket('./packets/packets-001-block')
    .then(res => console.log('Import test 3 success -', res))
    .catch(err => console.log('Import test 3 error -', err));

    // __Import test 4__ - expect the import to succeed
    canvas.importPacket('./packets/packets-001-block.txt')
    .then(res => console.log('Import test 4 success -', res))
    .catch(err => console.log('Import test 4 error -', err));

    setTimeout(() => {

        // __Import test 5__ - expect the import to succeed
        canvas.importPacket('./packets/packets-001-block-updated.txt')
        .then(res => console.log('Import test 5 success -', res))
        .catch(err => console.log('Import test 5 error -', err));
    }, 5000);
}, 5000);

// Import tests - expected results (result order may vary due to asynchronous fetch/promise resolve)
//
//     SETUP
//     Import test setup - check to see if entity has been deleted |> []
//
//     TEST 1
//     Import test 1 error - Error: Failed to process packet due to JSON parsing error - Unexpected end of JSON input
//
//     TEST 2
//     Import test 2 success - |> Block
//
//     TEST 3
//     Import test 3 error - Error: Packet import from server failed - 404: Not Found - http://localhost:8080/demo/packets/packets-003-block
//
//     TEST 4
//     Import test 4 success - |> Block
//
//     TEST 5
//     Import test 5 success - |> Block


const report = reportSpeed('#reportmessage');


// #### Scene animation
// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});

console.log(scrawl.library);
