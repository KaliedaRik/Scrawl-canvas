// # Demo DOM 021
// Popover API - use canvas elements in popover content

// [Run code](../../demo/dom-021.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    base = canvas.get('baseName');


// Get a handle on the popover element
const popover = document.querySelector('#mypopover');


// #### Build display

const dragGroup = scrawl.makeGroup({
    name: 'my-drag-group',
    order: 1,
    host: base,
});

const closeButtonGroup = scrawl.makeGroup({
    name: 'my-close-button-group',
    order: 2,
    host: base,
});

const backgroundGroup = scrawl.makeGroup({
    name: 'my-background-group',
    order: 0,
    host: base,
});

// Arrow shape entity
// + Will change scale and rotation depending on the canvas size/shape
const arrow = scrawl.makeShape({
    name: 'arrow',
    group: backgroundGroup,
    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    strokeStyle: 'pink',
    fillStyle: 'darkred',
    lineWidth: 6,
    lineJoin: 'round',
    lineCap: 'round',
    scale: 0.7,
    scaleOutline: false,
    roll: -90,
    method: 'fillThenDraw',
});


// Draggable phrase entitys
// + Will update their text values depending on the canvas shape
const shapeLabel = scrawl.makeLabel({
    name: 'shape-label',
    group: dragGroup,
    bringToFrontOnDrag: false,
    text: 'Canvas shape: ???',
    start: ['25%', '50%'],
    handle: ['center', 'center'],
    fontString: '24px "Roboto Sans"',
    fillStyle: 'yellow',
    boundingBoxStyle: 'yellow',
    lineWidth: 1,
    method: 'fill',

    onEnter: function () {
        canvas.set({ css: { cursor: 'pointer' }});
// @ts-expect-error
        this.set({ showBoundingBox: true});
    },
    onLeave: function () {
        canvas.set({ css: { cursor: 'auto' }});
// @ts-expect-error
        this.set({ showBoundingBox: false});
    },
});

const sizeLabel = shapeLabel.clone({
    name: 'size-label',
    text: 'Canvas size: ???',
    start: ['75%', '50%'],
});


// Close button
// + The rectangle entity includes a button attribute
// + Users navigating with keyboard tabs will be able to tab to the button
// + When clicked, the popover will close
const closeButton = scrawl.makeRectangle({

    name: 'close-button',
    group: closeButtonGroup,
    rectangleWidth: 100,
    rectangleHeight: 40,
    radius: 6,
    start: ['right', 'top'],
    handle: ['center', 'center'],
    offset: [-58, 28],
    method: 'fillThenDraw',
    fillStyle: 'white',
    strokeStyle: 'orange',
    lineWidth: 2,

    onEnter: function () {
        canvas.set({ css: { cursor: 'pointer' }});
// @ts-expect-error
        this.set({ fillStyle: 'yellow'});
    },
    onLeave: function () {
        canvas.set({ css: { cursor: 'auto' }});
// @ts-expect-error
        this.set({ fillStyle: 'white'});
    },
    button: {
        name: 'close-el',
        description: 'Close',
        popoverTarget: 'mypopover',
        popoverTargetAction: 'hide',
        disabled: true,
    },

    onUp: function () {
// @ts-expect-error
        this.clickButton();
    },
});

scrawl.makeLabel({
    name: 'close-button-label',
    group: closeButtonGroup,
    text: 'Close',
    pivot: 'close-button',
    lockTo: 'pivot',
    handle: ['center', 'center'],
    fontString: '24px  "Roboto Sans"',
    fillStyle: 'black',
    method: 'fill',
});


// Popover event listener
// + When the popover opens we want the close button to take focus (this is browser dependent - sometimes user will need to tab to the button to focus it).
// + When the popover closes, we need to disable the button to take it out of the tabbing order.
scrawl.addNativeListener('toggle', (e) => {

    if (e.newState === 'open') {
        closeButton.set({
            buttonDisabled: false,
            buttonAutofocus: true,
        });

        // The canvas gets resized by the browser but in the popover context this doesn't get picked up (until the user interacts with the web page, for example by moving the mouse cursor). So we need to manually invoke the canvas wrapper's reaction to the change ourselves.
        canvas.apply();
    }

    else {
        closeButton.set({
            buttonDisabled: true,
        });
    }

}, popover);


// #### User interaction
scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);
scrawl.addListener('up', () => canvas.cascadeEventAction('up'), canvas.domElement);


// Drag zone for the phrase size and shape labels
scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: dragGroup,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Responsiveness
canvas.setDisplayShapeBreakpoints({

    breakToBanner: 2,
    breakToLandscape: 1.5,
    breakToPortrait: 0.75,
    breakToSkyscraper: 0.5,

    breakToSmallest: (410 * 820),
    breakToSmaller: (720 * 1000),
    breakToLarger: (1000 * 1000),
    breakToLargest: (1200 * 1000),
});

canvas.set({
    actionBannerShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: banner',
            start: ['25%', '50%'],
        });
        sizeLabel.set({
            start: ['75%', '50%'],
        });
        arrow.set({
            roll: -90,
        });
    },

    actionLandscapeShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: landscape',
            start: ['25%', '50%'],
        });
        sizeLabel.set({
            start: ['75%', '50%'],
        });
        arrow.set({
            roll: -112.5,
        });
    },

    actionRectangleShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: rectangular',
            start: ['30%', '65%'],
        });
        sizeLabel.set({
            start: ['70%', '65%'],
        });
        arrow.set({
            roll: -135,
        });
    },

    actionPortraitShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: portrait',
            start: ['50%', '25%'],
        });
        sizeLabel.set({
            start: ['50%', '75%'],
        });
        arrow.set({
            roll: -157.5,
        });
    },

    actionSkyscraperShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: skyscraper',
            start: ['50%', '25%'],
        });
        sizeLabel.set({
            start: ['50%', '75%'],
        });
        arrow.set({
            roll: -180,
        });
    },

    actionLargestArea: () => {
        sizeLabel.set({
            text: 'Canvas size: largest',
        });
        arrow.set({
            scale: 1,
        });
    },

    actionLargerArea: () => {
        sizeLabel.set({
            text: 'Canvas size: larger',
        });
        arrow.set({
            scale: 0.85,
        });
    },

    actionRegularArea: () => {
        sizeLabel.set({
            text: 'Canvas size: regular',
        });
        arrow.set({
            scale: 0.7,
        });
    },

    actionSmallerArea: () => {
        sizeLabel.set({
            text: 'Canvas size: smaller',
        });
        arrow.set({
            scale: 0.55,
        });
    },

    actionSmallestArea: () => {
        sizeLabel.set({
            text: 'Canvas size: smallest',
        });
        arrow.set({
            scale: 0.4,
        });
    },
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({
    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
