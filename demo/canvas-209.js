// # Demo Canvas 209
// EnhancedLabel - clone entity, drag-drop, gradients and patterns

// [Run code](../../demo/canvas-209.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;

// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Create gradient and pattern
scrawl.makeGradient({
    name: name('linear-gradient'),
    endX: '100%',

    colors: [
        [0, 'blue'],
        [495, 'red'],
        [500, 'yellow'],
        [505, 'red'],
        [999, 'green'],
    ],
    colorSpace: 'OKLAB',
    precision: 5,
});

scrawl.makePattern({

    name: name('leaves-pattern'),
    imageSource: 'img/leaves.png',
});


// Create the template entitys that will be used by our EnhancedLabel entitys
const createInitialRoll = () => Math.random() * 360;

scrawl.makeWheel({

    name: name('Britain-button'),
    radius: 80,
    start: ['30%', '25%'],
    handle: ['center', 'center'],
    roll: createInitialRoll(),
    method: 'none',

}).clone({

    name: name('Thailand-button'),
    roll: createInitialRoll(),
    startX: '70%',

}).clone({
    
    name: name('China-button'),
    roll: createInitialRoll(),
    startY: '75%',

}).clone({
    
    name: name('Egypt-button'),
    roll: createInitialRoll(),
    startX: '30%',

// Create the background entitys
}).clone({
    
    name: name('Britain-border'),
    pivot: name('Britain-button'),
    lockTo: 'pivot',

    radius: 90,

    strokeStyle: 'rgb(0 0 150)',
    fillStyle: 'rgb(200 200 255)',
    lineWidth: 5,
    method: 'fillThenDraw',

}).clone({
    
    name: name('Thailand-border'),
    pivot: name('Thailand-button'),
    strokeStyle: 'rgb(150 150 0)',
    fillStyle: 'rgb(255 255 200)',

}).clone({
    
    name: name('China-border'),
    pivot: name('China-button'),
    strokeStyle: 'rgb(150 0 0)',
    fillStyle: 'rgb(255 200 200)',

}).clone({
    
    name: name('Egypt-border'),
    pivot: name('Egypt-button'),
    strokeStyle: 'rgb(0 150 0)',
    fillStyle: 'rgb(200 255 200)',
});


// Create the EnhancedLabel entitys
// - We finesse the word sizes and vertical positioning (including the underline) using CSS
const createDeltaRoll = () => {

    let d = Math.random() - 0.5;
    d += (d > 0) ? 0.2 : -0.2;

    return { roll: d };
};

scrawl.makeEnhancedLabel({

    name: name('Britain-message'),
    layoutTemplate: name('Britain-button'),
    text: '<p class="welcome-text">Welcome&nbsp;to <span class="country-name country-underline">Britain</span></p>',
    textHandle: ['center', 'alphabetic'],
    fontString: 'bold 24px "Roboto Serif',
    lineSpacing: 2,
    lineAdjustment: 28,
    letterSpacing: '2px',
    wordSpacing: '2px',

    fillStyle: `rgb(80 80 160)`,

    delta: createDeltaRoll(),
    noDeltaUpdates: true,

}).clone({

    name: name('Thailand-message'),
    layoutTemplate: name('Thailand-button'),
    text: '<p class="welcome-text">ยินดีต้อนรับสู่ <span class="country-name country-underline">ประเทศไทย</span></p>',

    fontString: 'bold 24px "Noto Thai Sans',

    delta: createDeltaRoll(),

}).clone({

    name: name('China-message'),
    layoutTemplate: name('China-button'),
    text: '<p class="welcome-text">欢迎来到 <span class="country-name country-underline">中国</span></p>',

    fontString: 'bold 24px "Noto Chinese Simple Sans',

    delta: createDeltaRoll(),

}).clone({

    name: name('Egypt-message'),
    layoutTemplate: name('Egypt-button'),
    text: '<p class="welcome-text">مرحبا&nbsp;بكم&nbsp;فى <span class="country-name country-underline">مصر</span></p>',

    direction: 'rtl',
    letterSpacing: '0px',
    wordSpacing: '4px',
    fontString: 'bold 24px "Noto Arabic Sans',

    delta: createDeltaRoll(),
});


// #### User interaction
// Create a drag group - EnhancedLabel entitys cannot be dragged, but their layoutTemplate entitys can.
const dragGroup = scrawl.makeGroup({ name: name('buttons-group') })
    .addArtefacts(
        name('Britain-button'),
        name('Thailand-button'),
        name('China-button'),
        name('Egypt-button'),
    );


// Make an object to hold functions we'll use for UI
const setCursorTo = {

    auto: () => {
        canvas.set({
            css: {
                cursor: 'auto',
            },
        });
    },
    pointer: () => {
        canvas.set({
            css: {
                cursor: 'grab',
            },
        });
    },
    grabbing: () => {
        canvas.set({
            css: {
                cursor: 'grabbing',
            },
        });
    },
};


// The entity we're dragging is the enhancedLabel's `layoutTemplate` entity
// + When dragging an entity, its `stampOrder` attribute gets massively inflated to make sure it displays over all other entitys.
// + But in this scenario, we never see the layoutTemplate. The entitys whose stampOrder value needs to increase are the EnhancedLabel using it, and the background wheel pivoted to it.
// + To achieve this, we need to do some work.


// First: set up groups for each nation's visible entitys
const britainGroup = scrawl.makeGroup({ name: name('Britain-group') })
    .addArtefacts(
        name('Britain-button'),
        name('Britain-border'),
        name('Britain-message'),
    );
britainGroup.setArtefacts({ stampOrder: 0});

const thailandGroup = scrawl.makeGroup({ name: name('Thailand-group') })
    .addArtefacts(
        name('Thailand-button'),
        name('Thailand-border'),
        name('Thailand-message'),
    );
thailandGroup.setArtefacts({ stampOrder: 1});

const chinaGroup = scrawl.makeGroup({ name: name('China-group') })
    .addArtefacts(
        name('China-button'),
        name('China-border'),
        name('China-message'),
    );
chinaGroup.setArtefacts({ stampOrder: 2});

const egyptGroup = scrawl.makeGroup({ name: name('Egypt-group') })
    .addArtefacts(
        name('Egypt-button'),
        name('Egypt-border'),
        name('Egypt-message'),
    );
egyptGroup.setArtefacts({ stampOrder: 3});


// Second: create two functions to do the `stampOrder` manipulation via the groups
const promoteStampOrders = (name) => {

    // Promote the ones that match the name
    if (name.includes('Britain')) britainGroup.setArtefacts({ stampOrder: 9999 });
    else if (name.includes('Thailand')) thailandGroup.setArtefacts({ stampOrder: 9999 });
    else if (name.includes('China')) chinaGroup.setArtefacts({ stampOrder: 9999 });
    else if (name.includes('Egypt')) egyptGroup.setArtefacts({ stampOrder: 9999 });
};

const demoteStampOrders = () => {

    // Demote them all!
    britainGroup.setArtefacts({ stampOrder: 0 });
    thailandGroup.setArtefacts({ stampOrder: 1 });
    chinaGroup.setArtefacts({ stampOrder: 2 });
    egyptGroup.setArtefacts({ stampOrder: 3 });
};


// Third: use a state variable to keep track of which button is being dragged
// + We also make use of this in the report functionality
let currentlyDragging = false;

// With all the above in place, we can now create the drag-and-drop zone
const userInteraction = scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('buttons-group'),
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,

    updateOnStart: () => {

        // Invoking the function that `makeDragZone` returns gives us access to the entity being dragged (if any)
        currentlyDragging = userInteraction();

        // Invoke the stampOrder promotion
        if (currentlyDragging) promoteStampOrders(currentlyDragging.artefact.name);

        // Update the cursor to show we're dragging something
        setCursorTo.grabbing();
    },

    updateOnEnd: () => {

        // Invoke the stampOrder demotion
        demoteStampOrders();

        // Set the state variable to false
        currentlyDragging = false;

        // Update the cursor - we're still hovering over the entity after dropping it
        setCursorTo.pointer();
    },
});


// Finally: implement the hover check on the Canvas wrapper
canvas.set({

    checkForEntityHover: true,
    onEntityHover: setCursorTo.pointer,
    onEntityNoHover: setCursorTo.auto,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const dragReport = `Currently dragging: ${(typeof currentlyDragging !== 'boolean' && currentlyDragging) ? currentlyDragging.artefact.name : 'nothing'}`;

    let fontReadout = `
`;
    document.fonts.forEach(k => {
        if (k.status === 'loaded') fontReadout +=(`    ${k.family} ${k.weight} ${k.style}\n`)
    });

    return `
${dragReport}

Loaded fonts:${fontReadout}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: () => canvas.checkHover(),
    afterShow: report,
});


// #### User controls
// Create a update group for the user controls.
const labelsGroup = scrawl.makeGroup({ name: name('labels-group') })
    .addArtefacts(
        name('Britain-message'),
        name('Thailand-message'),
        name('China-message'),
        name('Egypt-message'),
    );

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: labelsGroup,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        lockFillStyleToEntity: ['lockFillStyleToEntity', 'boolean'],
        noDeltaUpdates: ['noDeltaUpdates', 'boolean'],
        ['text-fillStyle']: ['fillStyle', 'raw'],
        ['underline-fillStyle']: ['underlineStyle', 'raw'],
    },
});


// Setup form
// @ts-expect-error
document.querySelector('#text-fillStyle').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#underline-fillStyle').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#lockFillStyleToEntity').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#noDeltaUpdates').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
