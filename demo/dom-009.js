// # Demo DOM 009
// Stop and restart the main animation loop; add and remove event listener; retrieve all artefacts at a given coordinate

// [Run code](../../demo/dom-009.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const artefact = scrawl.library.artefact,
    stack = artefact.mystack;

stack.set({
    width: 600,
    height: 600,
});


// Create a group to hold all the circles
const circleGroup = scrawl.makeGroup({
    name: 'circles',
    host: 'mystack',
}).moveArtefactsIntoGroup('f_0', 'f_1', 'f_2', 'f_3', 'f_4', 'f_5', 'f_6', 'f_7', 'f_8', 'f_9', 'f_10', 'f_11', 'f_12', 'f_13', 'f_14', 'f_15', 'f_16', 'f_17', 'f_18', 'f_19', 'f_20', 'f_21', 'f_22', 'f_23', 'f_24', 'f_25', 'f_26', 'f_27', 'f_28', 'f_29', 'f_30', 'f_31', 'f_32', 'f_33', 'f_34', 'f_35', 'f_36', 'f_37', 'f_38', 'f_39', 'f_40', 'f_41', 'f_42', 'f_43', 'f_44', 'f_45', 'f_46', 'f_47', 'f_48', 'f_49');

// Simple random integer number generator
const getRandom = (n) => Math.round(Math.random() * n);

// Using a color factory object to generate random colors within a restricted palette
const colorFactory = scrawl.makeColor({
    name: 'myColorObject',
    minimumColor: 'maroon',
    maximumColor: 'darkgreen',
});

circleGroup.artefacts.forEach(name => {

    const d = getRandom(50) + 50;

    const art = artefact[name];

    art.set({
        width: d,
        height: d,

        startX: `${getRandom(20) + 40}%`,
        startY: `${getRandom(20) + 40}%`,
        handleX: getRandom(500) - 250,
        handleY: getRandom(500) - 250,

        roll: getRandom(360),
        collides: true,

        delta: {
            roll: (getRandom(5) / 20) + 0.15
        },

        css: {
            backgroundColor: colorFactory.getRangeColor(Math.random()),
            border: '1px solid black',
        }
    });
});


// Create a group to hold the buttons (also: test Group cloning and packet functionality)
console.log(circleGroup.saveAsPacket());
// ```
// RESULTS:
// [
//     "circles",
//     "Group",
//     "group",
//     {
//         "name":"circles",
//         "artefacts":["f_0","f_1","f_2","f_3",etc],
//         "host":"mystack"
//     }
// ]
// ```


// Test group cloning
const buttonGroup = circleGroup.clone({
    name: 'buttons',
}).clearArtefacts().moveArtefactsIntoGroup('start_animation', 'stop_animation', 'start_listeners', 'stop_listeners');

console.log(buttonGroup.saveAsPacket());
// ```
// RESULTS:
// [
//     "buttons",
//     "Group",
//     "group",
//     {
//         "name":"buttons",
//         "artefacts":["start_animation","stop_animation","start_listeners","stop_listeners"],
//         "host":"mystack"
//     }
// ]
// ```


// User controls setup
buttonGroup.setArtefacts({
    width: 240,
    height: 28,
    css: {
        textAlign: 'left',
    },
    domAttributes: {
        disabled: '',
    },
});

artefact.start_animation.set({
    startY: 0,
});
artefact.stop_animation.set({
    startY: 30,
    domAttributes: {
        disabled: 'disabled',
    },
});
artefact.start_listeners.set({
    startY: 60,
});
artefact.stop_listeners.set({
    startY: 90,
    domAttributes: {
        disabled: 'disabled',
    },
});

// The `apply` function triggers the artefact to render itself outside of the Scrawl-canvas display cycle - this will then trigger artefacts (in this case the 50 circles) to recalculate their positions so they can correctly place themselves within the Stack
stack.apply();


// Variable holds a value shared betwen two different functions
let targetsLength = 0;


// #### Scene animation
// Clean up circles before the start of next display cycle
const reviewCircleClasses = function () {

    let firstRun = true;

    return function () {

        // we need the animation cycle to run once before we disable it
        if(firstRun){
            firstRun = false;
            scrawl.stopCoreAnimationLoop();
        }

        // updating the scene step 1 - clear out all instances of the 'make_opaque' CSS class from circles
        circleGroup.removeArtefactClasses('make_opaque');

        // updating the scene step 2 - check for hits on every iteration of the animation
        const targets = circleGroup.getAllArtefactsAt(stack.here);

        // updating the scene step 3 - add the 'make_opaque' CSS class to circles under the current cursor position
// @ts-expect-error
        targets.forEach(target => target.artefact.addClasses('make_opaque'));
        targetsLength = targets.length;
    };
}();


// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {
    return `Hits: ${targetsLength}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: stack,
    commence: reviewCircleClasses,
    afterShow: report,
});


// #### User interaction
// For this demo we will suppress touchmove functionality over the canvas
scrawl.addNativeListener(['touchmove'], (e) => {

    e.preventDefault();
    e.returnValue = false;

}, stack.domElement);

// Event listener for the buttons
const buttonControls = function () {

    let spinListener;

    const startAnimationButton = artefact.start_animation,
        stopAnimationButton = artefact.stop_animation,
        startListenersButton = artefact.start_listeners,
        stopListenersButton = artefact.stop_listeners;

    // Defining the spin event listener here
    const spin = (e) => {

        e.preventDefault();
        e.returnValue = false;

        if (e.target.id == 'mystack') {

            circleGroup.setDeltaValues({
                roll: 'reverse'
            });
        }
    };

    return function (e) {

        e.preventDefault();
        e.returnValue = false;

        switch (e.target.id) {

            case 'start_animation':
                scrawl.startCoreAnimationLoop();

                // the `updateDomAttributes` function is the same as using `.set({ domAttributes: { whatever: 'something' }})`
                startAnimationButton.updateDomAttributes('disabled', 'disabled');
                stopAnimationButton.updateDomAttributes('disabled', '');
                break;

            case 'stop_animation':
                scrawl.stopCoreAnimationLoop();

                startAnimationButton.updateDomAttributes('disabled', '');
                stopAnimationButton.updateDomAttributes('disabled', 'disabled');
                break;

            case 'start_listeners':
                // addListener returns a function that can be invoked to remove the event listener from the DOM
                spinListener = scrawl.addListener('up', spin, stack.domElement);

                startListenersButton.updateDomAttributes('disabled', 'disabled');
                stopListenersButton.updateDomAttributes('disabled', '');
                break;

            case 'stop_listeners':
                // Remove the spin event listener by invoking the function returned when creating it
                if (spinListener) spinListener();
                spinListener = false;

                startListenersButton.updateDomAttributes('disabled', '');
                stopListenersButton.updateDomAttributes('disabled', 'disabled');
                break;
        }
    };
}();

scrawl.addListener('up', buttonControls, '.controls');

// #### Development and testing
console.log(scrawl.library);
