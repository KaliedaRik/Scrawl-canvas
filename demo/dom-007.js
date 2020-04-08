// # Demo DOM 007
// Animate a DOM element using the delta attribute object; dynamically change classes on a DOM element

// [Run code](../../demo/dom-007.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let artefact = scrawl.library.artefact,
    stack = artefact.mystack,
    flower = artefact.flower,
    leftbox = artefact.leftbox,
    rightbox = artefact.rightbox,
    deltaX = 0.4,
    deltaY = -0.3,
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
rightbox.set({
    group: 'hitareas',

    startX: '55%',
    startY: '15%',
    roll: 10,

    css: { backgroundColor: 'red' },
});

leftbox.set({
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
        startX: `${deltaX}%`,
        startY: `${deltaY}%`,
        roll: 0.5,
    },
});


// #### Scene animation
// Boundary checking can get very messy very quickly, particularly when using delta animation. The following boilerplate will work in many situations:
// 1. check to see if the artefact has crossed the boundary. If it has, then...
// 2. reverse the artefact away from the boundary along the path it has just travelled along
// 3. check to see which of the delta values needs to be updated - for bouncing an artefact around an enclosed box, reversing the sign on the appropriate delta value is often enough
// 4. move the artefact forward using its new delta values
let checkForFlowerBoundaryCollisions = function () {

    // __Step 0__ - determine the current boundary values (in this case they are dynamic, relative to the current dimensions of the Stack) and the current position of the flower element (again, a dynamic coordinate relative to Stack dimensions)
    let [x, y] = flower.get('start'),
        [minX, minY] = stack.get('dimensions');

    minX /= 10;
    minY /= 10;

    let maxX = minX * 9,
        maxY = minY * 9;

    // __Step 1__ - check for boundary crossings
    if (x < minX || x > maxX || y < minY || y > maxY) {

        // __Step 2__ - reverse out of danger
        flower.reverseByDelta();

        // __Step 3__ - update the appropriate delta values for the flower
        let changes = {};

        if (x < minX || x > maxX) {

            deltaX = -deltaX;
            changes.startX = `${deltaX}%`;
        }
        if (y < minY || y > maxY) {

            deltaY = -deltaY;
            changes.startY = `${deltaY}%`;
        }

        flower.set({
            delta: changes
        });

        // __Step 4__ - move forward away from the boundary
        flower.updateByDelta();
    }
};


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

    checkForFlowerBoundaryCollisions();
    checkForFlowerClassUpdates();
};


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Current classes: "${flower.get('classes')}"`;
    };
}();


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
