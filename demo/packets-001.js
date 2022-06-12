// # Demo Packets 001
// Save and load Scrawl-canvas entity using text packets

// [Run code](../../demo/packets-001.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
let canvas = scrawl.library.canvas.mycanvas;

// Event listeners
scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);
scrawl.addListener('up', () => canvas.cascadeEventAction('up'), canvas.domElement);

// Testing Block entity
let box = scrawl.makeBlock({

    name: 'my-box',

    startX: 10,
    startY: 10,

    width: 100,
    height: 50,

    fillStyle: 'red',

    onEnter: function () {
// @ts-expect-error
        this.set({
            fillStyle: 'pink',
        });
    },

    onLeave: function () {
// @ts-expect-error
        this.set({
            fillStyle: 'red',
        });
    },

// @ts-expect-error
    onUp: function () { this.clickAnchor() },

    anchor: {
        name: 'wikipedia-box-link',
        href: 'https://en.wikipedia.org/wiki/Box',
        description: 'Link to the Wikipedia article on boxes (opens in new tab)',

        clickAction: function () { return `console.log('box clicked')` },
    },
});

//     Test 1 - no argument supplied
let boxPacket1 = box.saveAsPacket();

//     Test 2 - argument === true
let boxPacket2 = box.saveAsPacket(true);

//     Test 3 - argument.includeDefaults === true
let boxPacket3 = box.saveAsPacket({
    includeDefaults: true,
});

//     Test 4 - argument.includeDefaults === Array
let boxPacket4 = box.saveAsPacket({
    includeDefaults: ['handle', 'miterLimit', 'onUp', 'useMimicScale', 'anchor'],
});

console.log('Save test 1 result: ', boxPacket1);
console.log('Save test 2 result: ', boxPacket2);
console.log('Save test 3 result: ', boxPacket3);
console.log('Save test 4 result: ', boxPacket4);
// Save tests - expected results
// ```
// TEST 1
// [
//     "my-box",
//     "Block",
//     "entity",
//     {
//         "name":"my-box",
//         "dimensions":[100,50],
//         "start":[10,10],
//         "delta":{},
//         "onEnter":"~~~\n\t\tthis.set({\n\t\t\tfillStyle: 'pink',\n\t\t});\n\t",
//         "onLeave":"~~~\n\t\tthis.set({\n\t\t\tfillStyle: 'red',\n\t\t});\n\t",
//         "onUp":"~~~ this.clickAnchor() ",
//         "anchor":{
//             "name":"wikipedia-box-link",
//             "description":"Link to the Wikipedia article on boxes (opens in new tab)",
//             "href":"https://en.wikipedia.org/wiki/Box",
//             "clickAction":"~~~ return `console.log('box clicked')`"
//         },
//         "group":"mycanvas_base",
//         "fillStyle":"red"
//     }
// ]
//    
// TEST 2, TEST 3
// [
//     "my-box",
//     "Block",
//     "entity",
//     {
//         "name":"my-box",
//         "dimensions":[100,50],
//         "start":[10,10],
//         "handle":[0,0],
//         "offset":[0,0],
//         "delta":{},
//         "lockTo":["start","start"],
//         "visibility":true,
//         "order":0,
//         "addPivotHandle":false,
//         "addPivotOffset":true,
//         "addPivotRotation":false,
//         "pathPosition":0,
//         "addPathHandle":false,
//         "addPathOffset":true,
//         "addPathRotation":false,
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
//         "scale":1,
//         "roll":0,
//         "collides":false,
//         "sensorSpacing":50,
//         "noUserInteraction":false,
//         "noDeltaUpdates":false,
//         "noPositionDependencies":false,
//         "noCanvasEngineUpdates":false,
//         "noFilters":false,
//         "noPathUpdates":false,
//         "method":"fill",
//         "winding":"nonzero",
//         "flipReverse":false,
//         "flipUpend":false,
//         "scaleOutline":true,
//         "lockFillStyleToEntity":false,
//         "lockStrokeStyleToEntity":false,
//         "isStencil":false,
//         "filterAlpha":1,
//         "filterComposite":"source-over",
//         "onEnter":"~~~\n\t\tthis.set({\n\t\t\tfillStyle: 'pink',\n\t\t});\n\t",
//         "onLeave":"~~~\n\t\tthis.set({\n\t\t\tfillStyle: 'red',\n\t\t});\n\t",
//         "onDown":"~~~",
//         "onUp":"~~~",
//         "anchor":{
//             "name":"wikipedia-box-link",
//             "description":
//             "Link to the Wikipedia article on boxes (opens in new tab)",
//             "download":"",
//             "href":"https://en.wikipedia.org/wiki/Box",
//             "hreflang":"",
//             "ping":"",
//             "referrerpolicy":"",
//             "rel":"noreferrer",
//             "target":"_blank",
//             "anchorType":"",
//             "clickAction":"~~~ return `console.log('box clicked')`"
//         },
//         "group":"mycanvas_base",
//         "fillStyle":"red",
//         "strokeStyle":"rgba(0,0,0,1)",
//         "globalAlpha":1,
//         "globalCompositeOperation":"source-over",
//         "lineWidth":1,
//         "lineCap":"butt",
//         "lineJoin":"miter",
//         "lineDash":[],
//         "lineDashOffset":0,
//         "miterLimit":10,
//         "shadowOffsetX":0,
//         "shadowOffsetY":0,
//         "shadowBlur":0,
//         "shadowColor":"rgba(0,0,0,0)",
//         "font":"12px sans-serif",
//         "textAlign":"start",
//         "textBaseline":"alphabetic"
//     }
// ]
//    
// TEST 4
// [
//     "my-box",
//     "Block",
//     "entity",
//     {
//         "name":"my-box",
//         "dimensions":[100,50],
//         "start":[10,10],
//         "handle":[0,0],
//         "delta":{},
//         "useMimicScale":false,
//         "onEnter":"~~~\n\t\tthis.set({\n\t\t\tfillStyle: 'pink',\n\t\t});\n\t",
//         "onLeave":"~~~\n\t\tthis.set({\n\t\t\tfillStyle: 'red',\n\t\t});\n\t",
//         "onUp":"~~~",
//         "anchor":{
//             "name":"wikipedia-box-link",
//             "description":"Link to the Wikipedia article on boxes (opens in new tab)",
//             "href":"https://en.wikipedia.org/wiki/Box",
//             "clickAction":"~~~ return `console.log('box clicked')`"
//         },
//         "group":"mycanvas_base",
//         "fillStyle":"red",
//         "miterLimit":10
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
    canvas.importPacket('./packets/packets-003-block')
    .then(res => console.log('Import test 3 success -', res))
    .catch(err => console.log('Import test 3 error -', err));

    // __Import test 4__ - expect the import to succeed
    canvas.importPacket('./packets/packets-003-block.txt')
    .then(res => console.log('Import test 4 success -', res))
    .catch(err => console.log('Import test 4 error -', err));

    setTimeout(() => {

        // __Import test 5__ - expect the import to succeed
        canvas.importPacket('./packets/packets-003-block-updated.txt')
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

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});

console.log(scrawl.library);