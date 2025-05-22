// # Demo DOM 008
// 3d animated cube
//
// To note: this demo includes an edge case where each canvas has a shadow dot which will track the mouse cursor, but only while the cursor is moving and happens to be over the canvas. When the cursor is stationary the shadow dot will not move even though the canvas itself has rotated
// + This is because each canvas is using a local `here` object, which better tracks mouse positions over the rotated canvas
// + This *local here* is gets updated by an event listener attached to the canvas DOM element listening for mouse/pointer/touch movements over it
// + An alternative to this approach is to use the regular `here` functionality to determine current mouse position and rotate the results (using quaternions) to match each canvas element's current 3d rotation, recalculating every time the mouse moves or the canvas rotates.
// + (There may be alternative, better solutions but we can't think of any at the moment)
// + The current solution is computationally cheap (the browser does it for us) but, in this particular edge case, unsatisfactory
// + **Action:** we could do the work, but only if someone comes up with a compelling reason to do it! For now, mark as "won't fix"

// [Run code](../../demo/dom-008.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Convenience labels - to save some typing
const stack = scrawl.findStack('mystack');


// Namespacing boilerplate
const namespace = stack.name;
const name = (n) => `${namespace}-${n}`;


const pin = scrawl.findElement('pin'),
    front = scrawl.findCanvas('frontface'),
    back = scrawl.findCanvas('backface'),
    top = scrawl.findCanvas('topface'),
    bottom = scrawl.findCanvas('bottomface'),
    left = scrawl.findCanvas('leftface'),
    right = scrawl.findCanvas('rightface');

const faces = scrawl.makeGroup({

    name: name('faces'),

}).addArtefacts(left, right, top, bottom, front, back);

stack.set({
    perspectiveX: '50%',
    perspectiveY: '50%',
    perspectiveZ: 1000,
});

pin.set({
    order: 1,
    width: 0,
    height: 0,
    start: ['center', 'center'],
    lockTo: 'start',

    // To spin the cube we only need to rotate this element
    // - canvases pivot to the cube element for position/rotation
    delta: {
        pitch: 0.4,
        yaw: 0.8,
        roll: 0.2,
    }
});

// Give our canvases some common values, via their Group
faces.setArtefacts({

    // Make sure the canvases get processed after the pin
    // - so that they pick up changes to its positioning
    order: 2,

    start: ['center', 'center'],
    handle: ['center', 'center'],

    // Offset each canvas from the pin
    offsetZ: 150,
    trackHere: 'local',

    // Set each canvas to pivot to the pin
    lockTo: 'pivot',
    pivot: pin,

    // Automatically add the pin's rotation values to each canvas's initial rotation value (set below)
    addPivotRotation: true,

    // Styling common to all the canvas elements
    css: { backfaceVisibility: 'hidden' },
});

// Give each canvas its initial rotation
right.set({ yaw: 90 });
top.set({ pitch: 90 });
back.set({ pitch: 180 });
left.set({ yaw: 270 });
bottom.set({ pitch: 270 });


// Build some gradients to color the canvases
scrawl.makeGradient({

    name: name('red-gradient'),
    endX: '100%',
    endY: '100%',
    colors: [
        [0, '#f88'],
        [499, '#f00'],
        [999, '#800'],
    ],
    colorSpace: 'OKLAB',

}).clone({

    name: name('green-gradient'),
    colors: [
        [0, '#8f8'],
        [499, '#0f0'],
        [999, '#080'],
    ]

}).clone({

    name: name('blue-gradient'),
    colors: [
        [0, '#aaf'],
        [499, '#66f'],
        [999, '#66a'],
    ]

}).clone({

    name: name('yellow-gradient'),
    colors: [
        [0, '#ff8'],
        [499, '#ff0'],
        [999, '#880'],
    ]

}).clone({

    name: name('magenta-gradient'),
    colors: [
        [0, '#f8f'],
        [499, '#f0f'],
        [999, '#808'],
    ]

}).clone({

    name: name('cyan-gradient'),
    colors: [
        [0, '#8ff'],
        [499, '#0ff'],
        [999, '#088'],
    ]
});

// Display a gradient on each canvas using a Block entity
scrawl.makeBlock({

    name: name('topface-block'),
    group: top.get('baseGroup'),
    dimensions: ['100%', '100%'],
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: name('red-gradient'),

}).clone({

    name: name('leftface-block'),
    group: left.get('baseGroup'),
    fillStyle: name('green-gradient'),

}).clone({

    name: name('bottomface-block'),
    group: bottom.get('baseGroup'),
    fillStyle: name('yellow-gradient'),

}).clone({

    name: name('rightface-block'),
    group: right.get('baseGroup'),
    fillStyle: name('magenta-gradient'),

}).clone({

    name: name('frontface-block'),
    group: front.get('baseGroup'),
    fillStyle: name('cyan-gradient'),

}).clone({

    name: name('backface-block'),
    group: back.get('baseGroup'),
    fillStyle: name('blue-gradient'),
});

// Display a translucent dot on each canvas, pivoted to the mouse
scrawl.makeWheel({

    name: name('topface-dot'),
    group: top.get('baseGroup'),
    radius: '20%',
    handle: ['center', 'center'],
    lockTo: 'mouse',
    fillStyle: 'rgba(127 127 127 / 0.4)',
    strokeStyle: 'rgba(127 127 127 / 0.8)',
    method: 'fillThenDraw',

}).clone({

    name: name('leftface-dot'),
    group: left.get('baseGroup'),

}).clone({

    name: name('bottomface-dot'),
    group: bottom.get('baseGroup'),

}).clone({

    name: name('rightface-dot'),
    group: right.get('baseGroup'),

}).clone({

    name: name('frontface-dot'),
    group: front.get('baseGroup'),

}).clone({

    name: name('backface-dot'),
    group: back.get('baseGroup'),
});

// Add a label to each canvas using a Label entity
scrawl.makeLabel({

    name: name('topface-label'),
    group: top.get('baseGroup'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    text: 'TOP',
    accessibleText: '§ canvas element',
    fontString: 'bold 3rem sans-serif',
    fillStyle: 'yellow',
    lineWidth: 2,
    method: 'fillThenDraw',

  }).clone({

    name: name('bottomface-label'),
    group: bottom.get('baseGroup'),
    text: 'BOTTOM',

  }).clone({

    name: name('leftface-label'),
    group: left.get('baseGroup'),
    text: 'LEFT',

  }).clone({

    name: name('rightface-label'),
    group: right.get('baseGroup'),
    text: 'RIGHT',

  }).clone({

    name: name('frontface-label'),
    group: front.get('baseGroup'),
    text: 'FRONT',

  }).clone({

    name: name('backface-label'),
    group: back.get('baseGroup'),
    text: 'BACK',
  });


// #### Scene animation
const stackCheck = (function () {

    let stackActive = false;
    const here = stack.here;

    return function () {

        if (here.active !== stackActive) {

            stackActive = here.active;

            pin.set({
                lockTo: (stackActive) ? 'mouse' : 'start',
            });
        }
    }
})();


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: stack,
    commence: stackCheck,
    afterShow: report,
});

scrawl.makeRender({

    name: name('canvas-animation'),
    target: [top, bottom, left, right, front, back],
});

// #### Development and testing
console.log(scrawl.library);
