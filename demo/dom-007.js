// # Demo DOM 007
// Animate a DOM element using the delta attribute object; dynamically change classes on a DOM element

// [Run code](../../demo/dom-007.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    flower = artefact.flower,
    currentClass = '';


// Create a new Group for the box elements, against which we will be checking for hits
// + the box elements have been imported already and assigned to the Stack's default group, but we can move them to the new Group using `.set()`
let hitgroup = scrawl.makeGroup({
    name: 'hitareas',
    host: 'mystack',
});


// Update the Stack
stack.set({
    width: 600,
    height: 400,

    // This gets the browser to add a drag icon to the stack element's lower right corner, which in turn allows the user to drag-resize the element in real time.
    css: {
        overflow: 'hidden',
        resize: 'both'
    },

    // Switch on automated element resize capture and processing
    checkForResize: true,
});


// Update the boxes
artefact.rightbox.set({
    group: 'hitareas',

    startX: '55%',
    startY: '15%',
    roll: 10,

    css: { backgroundColor: 'red' },
});

artefact.leftbox.set({
    group: hitgroup.name,

    startX: '10%',
    startY: '35%',

    css: { backgroundColor: 'blue' },
});


// Batch-update the box artefacts using their shared Group
hitgroup.setArtefacts({
    width: '25%',
    height: '50%',

    css: { opacity: '0.4' },
});


// Update the flower wheel
flower.set({
    width: 200,
    height: 200,
    startX: '50%',
    startY: '50%',
    handleX: 'center',
    handleY: 'center',
    classes: 'make_round',
    delta: {
        startX: '0.4%',
        startY: '-0.3%',
        roll: 0.5,
    },

    // We will check for __boundary collisions__ using Scrawl-canvas delta checking functionality
    // + We supply an array for each delta attribute we want to check in the deltaConstraints Object
    // + The Array holds three items: `[minimum-value, maximum-value, action-to-take]`
    // + When the attribute updated by the delta value falls outside our boundaries, Scrawl-canvas takes the appropriate action
    // + The __reverse__ action will reverse the numerical sign of the affected delta object attribute value
    // + The __loop__ action will loop the artefact's attribute value from the maximum to the minimum value, or vice-versa as appropriate
    deltaConstraints: {
        startX: ['10%', '90%', 'reverse'],
        startY: ['10%', '90%', 'reverse'],
    },
    checkDeltaConstraints: true,
});


// #### Scene animation

// Updating the flower's DOM element's class attribute
let checkForFlowerClassUpdates = function () {

    let current = hitgroup.getArtefactAt([flower.get('start')]).artefact;

    if (current && !currentClass) {

        currentClass = (current.name === 'leftbox') ? 'make_blue' : 'make_red';
        flower.addClasses(currentClass);
    }
    else if (!current && currentClass) {

        flower.removeClasses(currentClass);
        currentClass = '';
    }
};


// Combining the two check functions above into a single function
let commenceActions = function () {

    // checkForFlowerBoundaryCollisions();
    checkForFlowerClassUpdates();
};


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const classes = flower.get('classes');

    return `Current classes: "${classes}"`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    commence: commenceActions,
    target: stack,
    afterShow: report,

    // We need to finalize the stack's display after the first Display cycle completes
    // + Tweaking thge stack's `height` attribute should cascade through to its constituent elements, so that they can finalize their own dimensions and positioning (which in this case are both set relative to the stack's dimensions).
    // + We also need to force the system to propagate the changes once; DOM element resize actions get processed only when mouse/touch cursor movements are detected, or a scroll or viewport resize event fires. To trigger this programmatically, we restart the Scrawl-canvas core listeners.
    afterCreated: () => {
        stack.set({height: 400.1});
        scrawl.startCoreListeners();
    },
});
