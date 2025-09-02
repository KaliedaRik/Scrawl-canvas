// # Demo DOM 003
// Dynamically create and clone Element artefacts; drag and drop elements (including SVG elements) around a Stack

// [Run code](../../demo/dom-003.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
const stack = scrawl.findStack('mystack');

// Namespacing boilerplate
const namespace = stack.name;
const name = (n) => `${namespace}-${n}`;


// Create a new group to which we can assign the artefacts we want to drag around the stack
const hitGroup = scrawl.makeGroup({

    name: name('my-hit-group'),
    host: stack.name,
});

// TODO: we need perspectiveZ (CSS perspective) to be picked up from CSS setting in html file. The code where this is handled is in mixin/dom.js lines 355 onwards. Currently is a known issue (low priority)
stack.set({
    perspectiveZ: 1200,
    css: {
        overflow: 'hidden',
    },
});

// Generate new (DOM) element artefacts and add them to the stack via our new group
stack.addNewElement({

    name: name('basic-square'),
    group: hitGroup,
    tag: 'div',

    text: 'Default square <div>',

    css: {
        border: '1px solid black',
        padding: '1em',
        textAlign: 'center',
        cursor: 'grab',
// Test to make sure that SC ignores attempts to set CSS values for `top`, `right`, `bottom`, `left`
        bottom: '0',
    },

}).clone({

    name: name('oval'),

    startX: 150,
    startY: 50,
    width: 150,
    height: 'auto',

    classes: 'circle',
    text: 'Oval <div> with added class',

    css: {
        font: '12px monospace',
        left: '0',
    },
});

// Clones will create literal clones of the element they are cloning. Thus cannot clone an element and attempt to change its tag value at the same time.
stack.addNewElement({

    name: name('list'),
    group: name('my-hit-group'),
    tag: 'ul',

    width: '25%',
    height: 80,
    startX: 400,
    startY: 120,
    handleX: 'center',
    handleY: 'center',
    roll: 30,

    classes: 'red-text',

    content: `<li>unordered list</li>
<li>with several</li>
<li>bullet points</li>`,

    css: {
        font: '12px fantasy',
        paddingInlineStart: '20px',
        paddingTop: '0.5em',
        margin: '0',
        border: '1px solid red',
        cursor: 'grab',
        top: '0',
    },

}).clone({

    name: name('list-no-border'),

    startY: 250,
    scale: 1.25,
    pitch: 60,
    yaw: 80,

    css: {
        border: 0,
        right: '0',
    },
});


// Generate more elements - these ones won't be draggable: instead we will pivot them to the element artefacts generated above
stack.addNewElement({

    name: name('pivot-1'),
    tag: 'div',

    width: 12,
    height: 12,
    handleX: 'center',
    handleY: 'center',

    pivot: name('basic-square'),
    lockTo: 'pivot',
    order: 1,

    css: {
        backgroundColor: 'blue',
        bottom: '0',
    },

}).clone({

    name: name('pivot-2'),
    pivot: name('oval'),

}).clone({

    name: name('pivot-3'),
    pivot: name('list'),

}).clone({

    name: name('pivot-4'),
    pivot: name('list-no-border'),
});


// Handle the pre-existing SVG DOM elements that have been automatically imported into the stack
// + SVG elements, because their child elements are effectively instructions on how to draw them, do not play nicely with Scrawl-canvas's inbuilt __drag-and-drop__ functionality.
// + We can get around this issue in two ways
//
// Option 1 (simple yet disappointing)
// + Add a new Element to the Stack
// + Set the SVG Element artefact to pivot to the new Element
stack.addNewElement({

    name: name('weather-icon-dragger'),
    tag: 'div',

    width: 40,
    height: 40,

    startX: 340,
    startY: 360,
    handleX: 'center',
    handleY: 'center',

    group: hitGroup.name,

    classes: 'circle',
    css: {
        cursor: 'grab',
        border: '5px solid gold',
        backgroundColor: 'darkgray',
    },
});

scrawl.findElement('weathericon').set({

    pivot: name('weather-icon-dragger'),
    lockTo: 'pivot',
    order: 1,
});

// Option 2 (more complex yet more pleasing)
// + Add a new &lt;div> Element to the Stack to act as the &lt;svg> DOM element's parent element
// + Set the SVG Element wrapper's `start` attribute to the new Element's top-left corner
// + Append the &lt;svg> DOM element to the parent DOM element
// + After the first Display cycle has completed, we can remove the SVG Element wrapper from SC
const simpleSvg = scrawl.findElement('simple-svg'),
    simpleSvgElement = simpleSvg.domElement;

const svgContainer = stack.addNewElement({

    name: name('simple-svg-container'),
    tag: 'div',

    width: parseInt(simpleSvgElement.getAttribute('width'), 10),
    height: parseInt(simpleSvgElement.getAttribute('height'), 10),

    start: [120, 300],
    handle: ['center', 'center'],

    group: hitGroup,

    pitch: 30,
    yaw: 50,

    css: { cursor: 'grab' },
});

simpleSvg.set({ start: [0, 0] });

svgContainer.domElement.appendChild(simpleSvgElement);


// #### User interaction
// Create the drag-and-drop zone
scrawl.makeDragZone({

    zone: stack,
    collisionGroup: hitGroup,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: stack,
    afterShow: report,

    afterCreated: () => {

        // The Elements in the Stack don't know their corner positions, and thus their hit zones (for drag-and-drop), until after the first render. This one-time-run function is enough to get the Elements to perform the necessary recalculations.
        stack.reset();

        // We can also remove the unwanted SVG artefact object from SC at this point.
        // + Passing the `kill` function a `false` boolean stops SC trying to remove the SVG markup from the DOM
        simpleSvg.kill(false);
    },
});


// #### Development and testing
console.log(scrawl.library);
