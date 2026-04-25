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
let box = scrawl.makeBlock({

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

console.log('Save test 1 result: ', boxPacket1);
console.log('Save test 2 result: ', boxPacket2);
console.log('Save test 3 result: ', boxPacket3);
console.log('Save test 4 result: ', boxPacket4);

// saveAsPacket expected results:
// - Save test 1 result:  ["mycanvas-my-box","Block","entity",{"name":"mycanvas-my-box","dimensions":[100,50],"start":[10,10],"onEnter":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'pink',\n        });\n    ","onLeave":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'red',\n        });\n    ","onUp":"~~~ this.clickAnchor() ","anchor":{"name":"wikipedia-box-link","description":"Link to the Wikipedia article on boxes (opens in new tab)","href":"https://en.wikipedia.org/wiki/Box","host":"mycanvas-my-box","clickAction":"~~~ return `console.log('box clicked')` "},"group":"mycanvas_base","fillStyle":"red"}] packets-001.js:78:9
// - Save test 2 result:  ["mycanvas-my-box","Block","entity",{"name":"mycanvas-my-box","dimensions":[100,50],"start":[10,10],"handle":[0,0],"offset":[0,0],"delta":{},"deltaConstraints":{},"lockTo":["start","start"],"pivot":"","mimic":"","filters":[],"visibility":true,"calculateOrder":0,"stampOrder":0,"bringToFrontOnDrag":true,"ignoreDragForX":false,"ignoreDragForY":false,"scale":1,"roll":0,"noUserInteraction":false,"noPositionDependencies":false,"noCanvasEngineUpdates":false,"noFilters":false,"noPathUpdates":false,"noDeltaUpdates":false,"checkDeltaConstraints":false,"performDeltaChecks":false,"pivotPin":0,"pivotIndex":-1,"addPivotHandle":false,"addPivotOffset":true,"addPivotRotation":false,"useMimicDimensions":false,"useMimicScale":false,"useMimicStart":false,"useMimicHandle":false,"useMimicOffset":false,"useMimicRotation":false,"useMimicFlip":false,"addOwnDimensionsToMimic":false,"addOwnScaleToMimic":false,"addOwnStartToMimic":false,"addOwnHandleToMimic":false,"addOwnOffsetToMimic":false,"addOwnRotationToMimic":false,"path":"","pathPosition":0,"addPathHandle":false,"addPathOffset":true,"addPathRotation":false,"constantSpeedAlongPath":false,"isStencil":false,"memoizeFilterOutput":false,"method":"fill","winding":"nonzero","flipReverse":false,"flipUpend":false,"scaleOutline":true,"scaleShadow":false,"lockFillStyleToEntity":false,"lockStrokeStyleToEntity":false,"onEnter":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'pink',\n        });\n    ","onLeave":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'red',\n        });\n    ","onUp":"~~~ this.clickAnchor() ","anchor":{"name":"wikipedia-box-link","description":"Link to the Wikipedia article on boxes (opens in new tab)","disabled":false,"tabOrder":0,"download":"","href":"https://en.wikipedia.org/wiki/Box","hreflang":"","ping":"","referrerpolicy":"","rel":"noreferrer","target":"_blank","anchorType":"","focusAction":true,"blurAction":true,"host":"mycanvas-my-box","clickAction":"~~~ return `console.log('box clicked')` "},"group":"mycanvas_base","fillStyle":"red","strokeStyle":"rgb(0 0 0 / 1)","globalAlpha":1,"globalCompositeOperation":"source-over","lineWidth":1,"lineCap":"butt","lineJoin":"miter","lineDashOffset":0,"miterLimit":10,"shadowOffsetX":0,"shadowOffsetY":0,"shadowBlur":0,"shadowColor":"rgb(0 0 0 / 1)","font":"12px sans-serif","direction":"ltr","fontKerning":"normal","textRendering":"auto","letterSpacing":"0px","wordSpacing":"0px","fontStretch":"normal","fontVariantCaps":"normal","filter":"none","imageSmoothingEnabled":true,"imageSmoothingQuality":"high","textAlign":"left","textBaseline":"top","lineDash":[]}] packets-001.js:79:9
// - Save test 3 result:  ["mycanvas-my-box","Block","entity",{"name":"mycanvas-my-box","dimensions":[100,50],"start":[10,10],"handle":[0,0],"offset":[0,0],"delta":{},"deltaConstraints":{},"lockTo":["start","start"],"pivot":"","mimic":"","filters":[],"visibility":true,"calculateOrder":0,"stampOrder":0,"bringToFrontOnDrag":true,"ignoreDragForX":false,"ignoreDragForY":false,"scale":1,"roll":0,"noUserInteraction":false,"noPositionDependencies":false,"noCanvasEngineUpdates":false,"noFilters":false,"noPathUpdates":false,"noDeltaUpdates":false,"checkDeltaConstraints":false,"performDeltaChecks":false,"pivotPin":0,"pivotIndex":-1,"addPivotHandle":false,"addPivotOffset":true,"addPivotRotation":false,"useMimicDimensions":false,"useMimicScale":false,"useMimicStart":false,"useMimicHandle":false,"useMimicOffset":false,"useMimicRotation":false,"useMimicFlip":false,"addOwnDimensionsToMimic":false,"addOwnScaleToMimic":false,"addOwnStartToMimic":false,"addOwnHandleToMimic":false,"addOwnOffsetToMimic":false,"addOwnRotationToMimic":false,"path":"","pathPosition":0,"addPathHandle":false,"addPathOffset":true,"addPathRotation":false,"constantSpeedAlongPath":false,"isStencil":false,"memoizeFilterOutput":false,"method":"fill","winding":"nonzero","flipReverse":false,"flipUpend":false,"scaleOutline":true,"scaleShadow":false,"lockFillStyleToEntity":false,"lockStrokeStyleToEntity":false,"onEnter":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'pink',\n        });\n    ","onLeave":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'red',\n        });\n    ","onUp":"~~~ this.clickAnchor() ","anchor":{"name":"wikipedia-box-link","description":"Link to the Wikipedia article on boxes (opens in new tab)","disabled":false,"tabOrder":0,"download":"","href":"https://en.wikipedia.org/wiki/Box","hreflang":"","ping":"","referrerpolicy":"","rel":"noreferrer","target":"_blank","anchorType":"","focusAction":true,"blurAction":true,"host":"mycanvas-my-box","clickAction":"~~~ return `console.log('box clicked')` "},"group":"mycanvas_base","fillStyle":"red","strokeStyle":"rgb(0 0 0 / 1)","globalAlpha":1,"globalCompositeOperation":"source-over","lineWidth":1,"lineCap":"butt","lineJoin":"miter","lineDashOffset":0,"miterLimit":10,"shadowOffsetX":0,"shadowOffsetY":0,"shadowBlur":0,"shadowColor":"rgb(0 0 0 / 1)","font":"12px sans-serif","direction":"ltr","fontKerning":"normal","textRendering":"auto","letterSpacing":"0px","wordSpacing":"0px","fontStretch":"normal","fontVariantCaps":"normal","filter":"none","imageSmoothingEnabled":true,"imageSmoothingQuality":"high","textAlign":"left","textBaseline":"top","lineDash":[]}] packets-001.js:80:9
// - Save test 4 result:  ["mycanvas-my-box","Block","entity",{"name":"mycanvas-my-box","dimensions":[100,50],"start":[10,10],"handle":[0,0],"delta":{},"filters":[],"useMimicScale":false,"onEnter":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'pink',\n        });\n    ","onLeave":"~~~\n/** @ts-expect-error */\n        this.set({\n            fillStyle: 'red',\n        });\n    ","onUp":"~~~ this.clickAnchor() ","anchor":{"name":"wikipedia-box-link","description":"Link to the Wikipedia article on boxes (opens in new tab)","href":"https://en.wikipedia.org/wiki/Box","host":"mycanvas-my-box","clickAction":"~~~ return `console.log('box clicked')` "},"group":"mycanvas_base","fillStyle":"red","miterLimit":10,"filter":"none"}] packets-001.js:81:9


box.kill();
console.log('Import test setup - check to see if entity has been deleted', Object.keys(scrawl.library.entity));
// Kill test expected result:
// - Import test setup - check to see if entity has been deleted 
// - Array []

const importTester = (time = 0, action = false, url = '', label = 'no test name', override) => {

    if (action) {

        setTimeout(() => {

            try {
                const res = canvas.actionPacket(url, override);
                console.log('SUCCESS', label, res);
            }
            catch (err) { console.log('ERROR',label, err); }
        }, time);

    }
    else {

        setTimeout(() => {

            canvas.importPacket(url, override)
            .then(res => {

                console.log('SUCCESS', label, res);
            })
            .catch(err => {

                console.log('ERROR',label, err)
            });
        }, time)
    }
};

const fullOverride = {
    reviveFunctions: true,
    allowDOMElementCreation: true,
};

const noDomOverride = {
    reviveFunctions: true,
};

[
    [1000, true, boxPacket1.substring(0, 50), 'Import test 1'],
    [2000, true, boxPacket1, 'Import test 2'],
    [3000, true, boxPacket1, 'Import test 3', fullOverride],
    [4000, true, boxPacket1, 'Import test 4', noDomOverride],
    [5000, false, './packets/packets-001-block', 'Import test 5'],
    [6000, false, './packets/packets-001-block.txt', 'Import test 6'],
    [7000, false, './packets/packets-001-block.txt', 'Import test 7', fullOverride],
    [8000, false, './packets/packets-001-block-updated.txt', 'Import test 8', fullOverride]
].forEach(item => importTester(...item));

// actionPacket and importPacket Expected results:
// ```
// Failed to process packet due to JSON parsing error - JSON.parse: unterminated string at line 1 column 51 of the JSON data base.js:564:53
// SUCCESS Import test 1 Error: Failed to process packet due to JSON parsing error - JSON.parse: unterminated string at line 1 column 51 of the JSON data
//     actionPacket http://localhost:3000/source/mixin/base.js:472
//     importTester http://localhost:3000/demo/packets-001.js:105
//     setTimeout handler*importTester http://localhost:3000/demo/packets-001.js:102
//     <anonymous> http://localhost:3000/demo/packets-001.js:137
//     <anonymous> http://localhost:3000/demo/packets-001.js:137
// packets-001.js:106:25
// SC packet import skipped function revival for mycanvas-my-box.onEnter base.js:585:33
// SC packet import skipped function revival for mycanvas-my-box.onLeave base.js:585:33
// SC packet import skipped function revival for mycanvas-my-box.onUp base.js:585:33
// SUCCESS Import test 2 
// Object { … }
// packets-001.js:106:25
// SUCCESS Import test 3 
// Object { … }
// packets-001.js:106:25
// XHR
// GET
// http://localhost:3000/demo/packets/packets-001-block
// [HTTP/1.1 404 Not Found 1ms]
// 
// ERROR Import test 4 Error: Packet import from server failed - 404: Not Found - http://localhost:3000/demo/packets/packets-001-block
//     getPacket http://localhost:3000/source/mixin/base.js:402
//     promise callback*default/P.importPacket/getPacket/< http://localhost:3000/source/mixin/base.js:400
//     getPacket http://localhost:3000/source/mixin/base.js:377
//     importPacket http://localhost:3000/source/mixin/base.js:429
//     importTester http://localhost:3000/demo/packets-001.js:116
//     setTimeout handler*importTester http://localhost:3000/demo/packets-001.js:114
//     <anonymous> http://localhost:3000/demo/packets-001.js:137
//     <anonymous> http://localhost:3000/demo/packets-001.js:137
// packets-001.js:123:25
// SC packet import skipped function revival for mycanvas-my-box.onEnter base.js:585:33
// SC packet import skipped function revival for mycanvas-my-box.onLeave base.js:585:33
// SUCCESS Import test 5 
// Object { … }
// packets-001.js:119:25
// SUCCESS Import test 6 
// Object { … }
// packets-001.js:119:25
// SUCCESS Import test 7 
// Object { … }
// packets-001.js:119:25
// ```


const report = reportSpeed('#reportmessage');

// #### Scene animation
// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});

console.log(scrawl.library);
