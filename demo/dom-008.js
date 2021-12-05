// # Demo DOM 008
// 3d animated cube

// [Run code](../../demo/dom-008.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    cube = artefact.cube;


// The 'faces' Element artefacts are defined in the demo's `html` file (they are children of the Stack element). To make controlling them easier, we can create a Group object linked to the Stack and shift them into it.
let faces = scrawl.makeGroup({
    name: 'faces',
    host: 'mystack',
}).moveArtefactsIntoGroup('leftface', 'rightface', 'topface', 'bottomface', 'frontface', 'backface');


// Give the Stack element some perspective depth
stack.set({
    perspectiveX: '50%',
    perspectiveY: '50%',
    perspectiveZ: 1200
});


// The 'cube' Element artefact (also defined in html, but not shifted into our new group) will act as the reference artefact for our 'faces' Elements
cube.set({
    order: 1,
    width: 0,
    height: 0,
    startX: 'center',
    startY: 'center',
    handleX: 'center',
    handleY: 'center',
    lockTo: 'start',

    // Give the Element a border, so we can see it
    css: {
        border: '20px solid black',
    },

    // Delta animate the cube Element's rotation:
    // + `pitch` represents rotation along the x-axis
    // + `yaw` represents rotation along the y-axis
    // + `roll` represents rotation along the z-axis
    //
    // Values are in degrees, not radians!
    delta: {
        pitch: 0.8,
        yaw: 1.2,
        roll: 0.4,
    },
});


// Give our 'faces' Elements some common values, via their Group
faces.setArtefacts({

    // Make sure the Elements get processed _after_ the reference Element, so that they pick up changes to its positioning
    order: 2,

    width: 200,
    height: 200,
    startX: 'center',
    startY: 'center',
    handleX: 'center',
    handleY: 'center',

    // Offset each Element from the reference Element
    offsetZ: 100,

    // Set each Element to `pivot` to the reference Element
    lockTo: 'pivot',
    pivot: 'cube',

    // Automatically add the reference Element's rotation values to each Element's initial rotation value (set below)
    addPivotRotation: true,

    // Styling common to all the 'faces' Elements
    css: {
        border: '1px solid blue',
        textAlign: 'center',
        backfaceVisibility: 'hidden',
    }
});


// Give each 'faces' Element its own color and initial rotation
artefact.frontface.set({
    css: { backgroundColor: 'rgba(255, 0, 0, 0.4)' },
});
artefact.rightface.set({
    css: { backgroundColor: 'rgba(0, 0, 127, 0.4)' },
    yaw: 90,
});
artefact.topface.set({
    css: { backgroundColor: 'rgba(0, 255, 0, 0.4)' },
    pitch: 90,
});
artefact.backface.set({
    css: { backgroundColor: 'rgba(127, 0, 0, 0.4)' },
    pitch: 180,
});
artefact.leftface.set({
    css: { backgroundColor: 'rgba(0, 0, 255, 0.4)' },
    yaw: 270,
});
artefact.bottomface.set({
    css: { backgroundColor: 'rgba(0, 127, 0, 0.4)' },
    pitch: 270,
});


// #### User interaction
// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener(['touchmove'], (e) => {

    e.preventDefault();
    e.returnValue = false;

}, stack.domElement);

// Function to check whether mouse cursor is over the Stack element, and lock the cube Element accordingly
let stackCheck = function () {

    let active = false;

    return function () {

        if (stack.here.active !== active) {

            active = stack.here.active;

            cube.set({
                lockTo: (active) ? 'mouse' : 'start'
            });
        }
    };
}();


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: stack,
    commence: stackCheck,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
