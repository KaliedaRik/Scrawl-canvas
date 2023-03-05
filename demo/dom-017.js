// # Demo DOM 017
// Testing getCanvas(), getStack() functionality

// [Run code](../../demo/dom-017.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, reportFullLibrary } from './utilities.js';


// #### Scene setup
const canvasParent = document.querySelector('#canvas-parent');
const canvasSwitchButton = document.querySelector('#canvas-switch');
const canvasReplaceButton = document.querySelector('#canvas-replace');
const canvasRemoveButton = document.querySelector('#canvas-remove');

const stackParent = document.querySelector('#stack-parent');
const stackSwitchButton = document.querySelector('#stack-switch');
const stackReplaceButton = document.querySelector('#stack-replace');
const stackRemoveButton = document.querySelector('#stack-remove');

// KeyboardZones and DragZones don't integrate with their canvas/stack parents - they're useful add-ons rather than an integrated part of the system. So we need to have an elegant way to handle them.
const dragZones = {};


// #### User interaction (CANVAS test) 
//
// Switch canvas
// ------------------------
// Load a new canvas with a different namespace into the parent element. Emulates a react component render when the component details have changed. For example: 
// + Start with the square canvas - onboard and capture details about that canvas and associated artefacts/objects in the libarary
// + Switch to the round canvas - capture details about that canvas and associated artefacts/objects in the libarary. __Details about the square canvas will not be removed from the library__ without specific instruction even though the related DOM canvas no longer exists
// + Switch back to the square canvas - it is at this point that SC should recognise the details it holds about the previous canvas are no longer relevant, purge everything related to that old canvas from the library, and then repopulate with new data
// + Existing functionality for Canvas.kill() is to delete the associated DOM data structures for that canvas from the page - though the canvas itself was removed some time prior and SC did nothing about it. Make sure that any errors emerging from that activity are properly captured and handled

// Replace canvas
// ------------------------
// Load a new canvas with the same namespace into the parent element. Emulates a react component render when the component details have NOT changed - the component is rendered again because something else in the page has triggered a more general render. For example: 
// + Start with the square canvas - onboard and capture details about that canvas and associated artefacts/objects in the libarary
// + Replace that canvas with another square canvas. SC needs to identify that while details about the canvas still exist, that canvas has gone and the new canvas needs to be processed and data about it - and all related artefacts/objects - stored in the library

// Remove canvas
// ------------------------
// Purge everything relating to the current canvas's namespace from the SC library


const insertCanvas = (element, parent) => {
    console.log('inserting a canvas into the DOM parent');

    parent.innerHTML = element;
};

const buildSquareCanvas = (namespace) => {
    console.log('build a new square canvas element', namespace);

    const name = n => `${namespace}-${n}`;
    
    // build canvas
    const c = `
    <canvas 
      id=${namespace}
      width="400"
      height="400"
      data-base-background-color="aliceblue"
    ></canvas>
    `;

    // insert and capture
    insertCanvas(c, canvasParent);

    const canvas = captureCanvasIntoLibrary(namespace);

    // create required artefacts/objects
    if (canvas != null) {

        scrawl.makeGradient({
            name: name('gradient'),
            end: ['100%', '100%'],
            colors: [
                [0, 'red'],
                [999, 'blue'],
            ],
            colorSpace: 'OKLAB',
        });

        scrawl.makeFilter({
            name: name('filter'),
            method: 'randomNoise',
            width: 20,
            height: 20,
            level: 1,
        });

        scrawl.makeBlock({
            name: name('block'),
            start: ['center', 'center'],
            handle: ['center', 'center'],
            dimensions: ['50%', '50%'],
            fillStyle: name('gradient'),
            lockFillStyleToEntity: true,
            lineWidth: 2,
            method: 'fillThenDraw',
            delta: {
                roll: 0.2,
            },
            filters: [name('filter')],
            anchor: {
                name: name('wikipedia-link'),
                href: 'https://en.wikipedia.org/wiki/Square',
                description: 'Link to the Wikipedia article on squares (opens in new tab)',
                focusAction: true,
                blurAction: true,
            },
            onEnter: function () { this.set({ lineWidth: 6 }) },
            onLeave: function () { this.set({ lineWidth: 2 }) },
            onUp: function () { this.clickAnchor() },
        });

        scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);

        scrawl.addNativeListener('click', () => {
            if (canvas.here.active) canvas.cascadeEventAction('up');
        }, canvas.domElement);

        scrawl.makeRender({
            name: name('animation'),
            target: canvas,
            observer: true,
        });

        scrawl.makeTween({
            name: name('tween'),
            cycles: 0,
            duration: 5000,
            targets: name('block'),
            definitions: [{
                attribute: 'scale',
                start: 0.8,
                end: 1.2,
                engine: 'easeOutIn',
            }],
            reverseOnCycleEnd: true,
        }).run();
    }
};

const buildCircleCanvas = (namespace) => {
    console.log('build a new circle canvas element', namespace);

    const name = n => `${namespace}-${n}`;
    
    // build canvas
    const c = `
    <canvas 
      id=${namespace}
      width="400"
      height="400"
      data-base-background-color="aliceblue"
    ></canvas>
    `;

    // insert and capture
    insertCanvas(c, canvasParent);

    const canvas = captureCanvasIntoLibrary(namespace);

    // create required artefacts/objects
    if (canvas != null) {

        scrawl.makeGradient({
            name: name('gradient'),
            end: ['100%', '100%'],
            colors: [
                [0, 'green'],
                [999, 'orange'],
            ],
            colorSpace: 'OKLAB',
        });

        scrawl.makeFilter({
            name: name('filter'),
            method: 'randomNoise',
            width: 20,
            height: 20,
            level: 1,
        });

        scrawl.makeWheel({
            name: name('wheel'),
            start: ['center', 'center'],
            handle: ['center', 'center'],
            startAngle: 30,
            endAngle: -30,
            radius: '25%',
            fillStyle: name('gradient'),
            lockFillStyleToEntity: true,
            lineWidth: 2,
            method: 'fillThenDraw',
            delta: {
                roll: 0.2,
            },
            filters: [name('filter')],
            anchor: {
                name: name('wikipedia-link'),
                href: 'https://en.wikipedia.org/wiki/Circle',
                description: 'Link to the Wikipedia article on circles (opens in new tab)',
                focusAction: true,
                blurAction: true,
            },
            onEnter: function () { this.set({ lineWidth: 6 }) },
            onLeave: function () { this.set({ lineWidth: 2 }) },
            onUp: function () { this.clickAnchor() },
        });

        scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);

        scrawl.addNativeListener('click', () => {
            if (canvas.here.active) canvas.cascadeEventAction('up');
        }, canvas.domElement);

        scrawl.makeRender({
            name: name('animation'),
            target: canvas,
            observer: true,
        });

        scrawl.makeTween({
            name: name('tween'),
            cycles: 0,
            duration: 5000,
            targets: name('wheel'),
            definitions: [{
                attribute: 'scale',
                start: 0.8,
                end: 1.2,
                engine: 'easeOutIn',
            }],
            reverseOnCycleEnd: true,
        }).run();
    }
};

const captureCanvasIntoLibrary = (namespace) => {
    console.log('capture the new canvas into the library:', namespace);

    return scrawl.getCanvas(namespace);
};

const swapCanvases = () => {
    console.log('swap the canvases!');

    if (currentCanvas === squareCanvasNamespace) {

        currentCanvas = circleCanvasNamespace;
        buildCircleCanvas(currentCanvas);
    }
    else {

        currentCanvas = squareCanvasNamespace;
        buildSquareCanvas(currentCanvas);
    }
};

const reloadCanvas = () => {
    console.log('reload the current canvas:', currentCanvas);

    if (currentCanvas === squareCanvasNamespace) buildSquareCanvas(currentCanvas);
    else if (currentCanvas === circleCanvasNamespace) buildCircleCanvas(currentCanvas);
    else console.log('nothing to reload');
};

const removeCanvas = () => {
    console.log('remove the current canvas:', currentCanvas);

    scrawl.library.purge(currentCanvas);
    currentCanvas = noCanvas;
};

// Initial display
const squareCanvasNamespace = 'my-square-canvas';
const circleCanvasNamespace = 'my-circle-canvas';
const noCanvas = '';

let currentCanvas = squareCanvasNamespace;

buildSquareCanvas(squareCanvasNamespace);

scrawl.addNativeListener('click', swapCanvases, canvasSwitchButton);
scrawl.addNativeListener('click', reloadCanvas, canvasReplaceButton);
scrawl.addNativeListener('click', removeCanvas, canvasRemoveButton);


// #### User interaction (STACK test) 
//
// Switch stack
// ------------------------
// Load a new stack with a different namespace into the parent element. Emulates a react component render when the component details have changed. For example: 
// + Start with the stack1 - onboard and capture details about that stack and associated artefacts/objects in the libarary
// + Switch to the stack2 - capture details about that stack and associated artefacts/objects in the libarary. __Details about the stack1 will not be removed from the library__ without specific instruction even though the related DOM stack no longer exists
// + Switch back to the stack1 - it is at this point that SC should recognise the details it holds about the previous stack are no longer relevant, purge everything related to that old stack from the library, and then repopulate with new data
// + Existing functionality for Stack.kill() is to delete the associated DOM data structures for that stack from the page - though the stack itself was removed some time prior and SC did nothing about it. Make sure that any errors emerging from that activity are properly captured and handled

// Replace stack
// ------------------------
// Load a new stack with the same namespace into the parent element. Emulates a react component render when the component details have NOT changed - the component is rendered again because something else in the page has triggered a more general render. For example: 
// + Start with the stack1 - onboard and capture details about that stack and associated artefacts/objects in the libarary
// + Replace that stack with another stack1. SC needs to identify that while details about the stack still exist, that stack has gone and the new stack needs to be processed and data about it - and all related artefacts/objects - stored in the library

// Remove stack
// ------------------------
// Purge everything relating to the current stack's namespace from the SC library

const insertStack = (element, parent) => {
    console.log('inserting a stack into the DOM parent');

    parent.innerHTML = element;
};

const buildStack1 = (namespace) => {
    console.log('build a new stack1 element', namespace);

    const name = n => `${namespace}-${n}`;
    
    // build stack
    const s = `
<div id="${namespace}" data-scrawl-stack>

    <div id="${name('simple-svg')}">
        <svg 
            width="200px" 
            height="150px" 
            xmlns="http://www.w3.org/2000/svg"
            viewbox="0 0 400 300">

            <rect width="100%" height="100%" fill="red" />
            <circle cx="100%" cy="100%" r="150" fill="blue" stroke="black" />
            <polygon points="120,0 240,225 0,225" fill="green"/>
            <text x="50" y="100" font-family="Verdana" font-size="55" fill="white" stroke="black" stroke-width="2">Hello!</text>
        </svg>
    </div>
    <div id="${name('dom-element')}">
        <p>Drag and drop the elements around the stack.</p>
        <ul>
            <li>Tomatoes</li>
            <li>Cauliflower</li>
            <li>Broccoli</li>
        </ul>
    </div>
</div>
    `;

    // insert and capture
    insertStack(s, stackParent);

    const stack = captureStackIntoLibrary(namespace);

    // create required artefacts/objects
    if (stack != null) {

        stack.set({
            dimensions: [400, 400],
            perspectiveZ: 1200,
            css: {
                margin: '1em auto',
                backgroundColor: 'lightgray',
                borderRadius: '10px',
            },
        });

        // Kill any old dragzone
        if (dragZones[namespace]) dragZones[namespace]();
        
        dragZones[namespace] = scrawl.makeDragZone({
            zone: stack,
            endOn: ['up', 'leave'],
            preventTouchDefaultWhenDragging: true,
        });

        const svg = scrawl.library.artefact[name('simple-svg')];
        if (svg) {
            svg.set({
                start: ['10%', '10%'],
                roll: -10,
                yaw: 40,
            });
        }

        const domEl = scrawl.library.artefact[name('dom-element')];
        if (domEl) {
            domEl.set({
                start: ['70%', '70%'],
                handle: ['50%', '50%'],
                dimensions: [200, 200],
                roll: 10,
                yaw: -35,
                css: {
                    border: '1px dashed green',
                    padding: '0.5em',
                    borderRadius: '10px',
                    display: 'grid',
                    justifyContents: 'center',
                    alignItems: 'center',
                    backgroundColor: 'beige'
                },
            });
        }

        scrawl.makeRender({
            name: name('animation'),
            target: stack,
            observer: true,
        });
    }
};

const buildStack2 = (namespace) => {
    console.log('build a new stack1 element', namespace);

    const name = n => `${namespace}-${n}`;
    
    // build stack
    const s = `
<div id="${namespace}" data-scrawl-stack>
    <canvas 
      id=${name('canvas')}
      width="400"
      height="400"
      data-base-background-color="honeydew"
    ></canvas>
</div>
    `;

    // insert and capture
    insertStack(s, stackParent);

    // Note: stacks don't capture any canvases they may contain
    const stack = captureStackIntoLibrary(namespace);
    const canvas = captureCanvasIntoLibrary(name('canvas'));

    // create required artefacts/objects
    if (stack != null && canvas != null) {

        stack.set({
            dimensions: [400, 400],
            perspectiveZ: 1200,
            css: {
                margin: '1em auto',
                backgroundColor: 'darkslategray',
                borderRadius: '10px',
            },
        });

        canvas.set({
            start: ['center', 'center'],
            handle: ['center', 'center'],
            trackHere: 'local',
            delta: {
                pitch: 0.25,
                yaw: 0.1,
                roll: 0.08,
            },
        });

        scrawl.makeBlock({
            name: name('canvas-border'),
            start: ['2.5%', '2.5%'],
            dimensions: ['95%', '95%'],
            lineWidth: 8,
            strokeStyle: 'orange',
            method: 'draw',
            order: 1,
        });

        scrawl.makeWheel({
            name: name('canvas-blob'),
            start: ['center', 'center'],
            handle: ['center', 'center'],
            lockTo: 'mouse',
            radius: '15%',
            fillStyle: 'blue',
            lineWidth: 8,
            strokeStyle: 'red',
            method: 'fillThenDraw',
        });

        scrawl.makeRender({
            name: name('animation'),
            target: [stack, canvas],
            observer: true,
            afterCreated: () => stack.set({ width: 400 }),
        });
    }
};

const captureStackIntoLibrary = (namespace) => {
    console.log('capture the new stack into the library:', namespace);

    return scrawl.getStack(namespace);
};

const swapStacks = () => {
    console.log('swap the stacks!');

    if (currentStack === stack1Namespace) {

        currentStack = stack2Namespace;
        buildStack2(currentStack);
    }
    else {

        currentStack = stack1Namespace;
        buildStack1(currentStack);
    }
};

const reloadStack = () => {
    console.log('reload the current stack:', currentStack);

    if (currentStack === stack1Namespace) buildStack1(currentStack);
    else if (currentStack === stack2Namespace) buildStack2(currentStack);
    else console.log('nothing to reload');
};

const removeStack = () => {
    console.log('remove the current stack:', currentStack);

    scrawl.library.purge(currentStack);
    currentStack = noStack;
};

// Initial display
const stack1Namespace = 'my-first-stack';
const stack2Namespace = 'my-second-stack';
const noStack = '';

let currentStack = stack1Namespace;

buildStack1(stack1Namespace);

scrawl.addNativeListener('click', swapStacks, stackSwitchButton);
scrawl.addNativeListener('click', reloadStack, stackReplaceButton);
scrawl.addNativeListener('click', removeStack, stackRemoveButton);



// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', () => reportFullLibrary(scrawl));


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "report-animation",
    noTarget: true,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
