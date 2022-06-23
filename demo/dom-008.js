// # Demo DOM 008
// 3d animated cube

// [Run code](../../demo/dom-008.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Convenience labels - to save some typing
const artefact = scrawl.library.artefact,
  stack = artefact.mystack,
  pin = artefact.pin,
  front = artefact.frontface,
  back = artefact.backface,
  top = artefact.topface,
  bottom = artefact.bottomface,
  left = artefact.leftface,
  right = artefact.rightface;

const faces = scrawl.makeGroup({
    name: "faces"
}).addArtefacts(left, right, top, bottom, front, back);

stack.set({
    perspectiveX: "50%",
    perspectiveY: "50%",
    perspectiveZ: 1200
});

pin.set({
    order: 1,
    width: 0,
    height: 0,
    start: ["center", "center"],
    lockTo: "start",

    // To spin the cube we only need to rotate this element
    // - canvases pivot to the cube element for position/rotation
    delta: {
        pitch: 0.4,
        yaw: 0.8,
        roll: 0.2
    }
});

// Give our canvases some common values, via their Group
faces.setArtefacts({

    // Make sure the canvases get processed after the pin
    // - so that they pick up changes to its positioning
    order: 2,

    trackHere: "local",

    // Common dimensions; common start/handle values
    width: 300,
    height: 300,
    baseMatchesCanvasDimensions: true,
    start: ["center", "center"],
    handle: ["center", "center"],

    // Offset each canvas from the pin
    offsetZ: 150,

    // Set each canvas to pivot to the pin
    lockTo: "pivot",
    pivot: pin,

    // Automatically add the pin's rotation values to each canvas's initial rotation value (set below)
    addPivotRotation: true,

    // Styling common to all the canvas elements
    css: {
        backfaceVisibility: "hidden"
    }
});

// Give each canvas its initial rotation
right.set({
    yaw: 90
});
top.set({
    pitch: 90
});
back.set({
    pitch: 180
});
left.set({
    yaw: 270
});
bottom.set({
    pitch: 270
});


// Build some gradients to color the canvases
scrawl.makeGradient({

    name: "red-gradient",
    endX: "100%",
    endY: "100%",
    colors: [
        [0, "#fff"],
        [499, "#f00"],
        [999, "#000"]
    ]

}).clone({

    name: "green-gradient",
    colors: [
        [0, "#fff"],
        [499, "#0f0"],
        [999, "#000"]
    ]

}).clone({

    name: "blue-gradient",
    colors: [
        [0, "#fff"],
        [499, "#00f"],
        [999, "#000"]
    ]

}).clone({

    name: "yellow-gradient",
    colors: [
        [0, "#fff"],
        [499, "#ff0"],
        [999, "#000"]
    ]

}).clone({

    name: "magenta-gradient",
    colors: [
        [0, "#fff"],
        [499, "#f0f"],
        [999, "#000"]
    ]

}).clone({

    name: "cyan-gradient",
    colors: [
        [0, "#fff"],
        [499, "#0ff"],
        [999, "#000"]
    ]
});

// Display a gradient on each canvas using a Block entity
scrawl.makeBlock({

    name: "topface-block",
    group: top.base.name,
    dimensions: ["100%", "100%"],
    start: ["center", "center"],
    handle: ["center", "center"],
    fillStyle: "red-gradient"

}).clone({

    name: "leftface-block",
    group: left.base.name,
    fillStyle: "green-gradient"

}).clone({

    name: "bottomface-block",
    group: bottom.base.name,
    fillStyle: "yellow-gradient",
    roll: -90

}).clone({

    name: "rightface-block",
    group: right.base.name,
    fillStyle: "magenta-gradient",
    roll: 90

}).clone({

    name: "frontface-block",
    group: front.base.name,
    fillStyle: "cyan-gradient",
    roll: 0

}).clone({

    name: "backface-block",
    group: back.base.name,
    fillStyle: "blue-gradient",
    roll: -90
});

// Add a label to each canvas using a Phrase entity
scrawl
  .makePhrase({
    name: "topface-label",
    group: top.base.name,
    start: ["center", "center"],
    handle: ["center", "center"],
    text: "TOP",
    family: "sans-serif",
    weight: "bold",
    size: "3em",
    lineHeight: 0,
    fillStyle: "yellow",
    lineWidth: 2,
    method: "fillThenDraw"
  })
  .clone({
    name: "bottomface-label",
    group: bottom.base.name,
    text: "BOTTOM"
  })
  .clone({
    name: "leftface-label",
    group: left.base.name,
    text: "LEFT"
  })
  .clone({
    name: "rightface-label",
    group: right.base.name,
    text: "RIGHT"
  })
  .clone({
    name: "frontface-label",
    group: front.base.name,
    text: "FRONT"
  })
  .clone({
    name: "backface-label",
    group: back.base.name,
    text: "BACK"
  });


// #### Scene animation
const stackCheck = (function () {

    let stackActive = false,
        here = stack.here;

    return function () {

        if (here.active != stackActive) {

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

    name: 'demo-animation-stack',
    target: stack,
    commence: stackCheck,
    afterShow: report,
});

scrawl.makeRender({

    name: 'demo-animation-canvases',
    target: [top, bottom, left, right, front, back],
});


// #### Development and testing
console.log(scrawl.library);
