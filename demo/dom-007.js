// # Demo DOM 007
// Animate a DOM element using the delta attribute object; dynamically change classes on a DOM element

// [Run code](../../demo/dom-007.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const stack = scrawl.findStack('mystack');


// Namespacing boilerplate
const namespace = stack.name;
const name = (n) => `${namespace}-${n}`;


let currentClass = '';


// Create a new Group for the box elements, against which we will be checking for hits
// + the box elements have been imported already and assigned to the Stack's default group, but we can move them to the new Group using `.set()`
const hitgroup = scrawl.makeGroup({

    name: name('hitareas'),
    host: stack,
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
scrawl.findElement('rightbox').set({

    group: hitgroup,

    startX: '55%',
    startY: '15%',
    roll: 10,

    css: { backgroundColor: 'red' },
});

scrawl.findElement('leftbox').set({

    group: hitgroup,

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
const flower = scrawl.findElement('flower');

flower.set({

    dimensions: [200, 200],
    start: ['50%', '50%'],
    handle: ['center', 'center'],
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
const checkForFlowerClassUpdates = function () {

/** @ts-expect-error */
    const current = hitgroup.getArtefactAt([flower.get('start')]).artefact;

    // console.log(flower.get('start'), current)

    if (current && !currentClass) {

        currentClass = (current.name === 'leftbox') ? 'make_blue' : 'make_red';
        flower.addClasses(`${currentClass} test_class`);
    }
    else if (!current && currentClass) {

        flower.removeClasses(`${currentClass} test_class rogue_class`);
        currentClass = '';
    }
};


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Current classes: "${flower.get('classes')}"`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    commence: checkForFlowerClassUpdates,
    target: stack,
    afterShow: report,

    // We need to finalize the stack's display after the first Display cycle completes
    afterCreated: () => stack.reset(),
});


// #### Development and testing
console.log(scrawl.library);
