// # Demo Canvas 209
// EnhancedLabel - clone entity, drag-drop; shadows, gradients and patterns

// [Run code](../../demo/canvas-209.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;

// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// #### Styling
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

    name: name('brick-pattern'),
    imageSource: 'img/brick.png',
});


// #### User interaction: drag-drop
// Make an object to hold functions we'll use for group-based UI
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

// Create a drag group
// + We define the EnhancedLabel entitys later - for now we just need their names
const buttons = scrawl.makeGroup({ name: name('buttons-group') })
    .addArtefacts(
        name('Britain-label'),
        name('Thailand-label'),
        name('China-label'),
        name('Egypt-label'),
    );

// Create two functions to do the `stampOrder` manipulation via the groups
// + We create these button groups below
const promoteStampOrders = (name) => {

    // Promote the ones that match the name
    if (name.includes('Britain')) britainGroup.set({ order: 9999 });
    else if (name.includes('Thailand')) thailandGroup.set({ order: 9999 });
    else if (name.includes('China')) chinaGroup.set({ order: 9999 });
    else if (name.includes('Egypt')) egyptGroup.set({ order: 9999 });
};

const demoteStampOrders = () => {

    // Demote them all!
    britainGroup.set({ order: 1 });
    thailandGroup.set({ order: 2 });
    chinaGroup.set({ order: 3 });
    egyptGroup.set({ order: 4 });
};

// Use a state variable to keep track of which button is being dragged
// + We also make use of this in the Display cycle report functionality
let currentlyDragging = false;

// With all the above in place, we can now create the drag-and-drop zone
const userInteraction = scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: buttons,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,

    updateOnStart: () => {

        // Invoking the function that `makeDragZone` returns gives us access to the entity being dragged (if any)
// @ts-expect-error
        currentlyDragging = userInteraction();

        // Invoke the stampOrder promotion
// @ts-expect-error
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


// #### Groups
// Each button gets its own group
const britainGroup = scrawl.makeGroup({
    name: name('Britain-group'),
    order: 1,
    host: canvas.base,

    checkForEntityHover: true,
    onEntityHover: setCursorTo.pointer,
    onEntityNoHover: setCursorTo.auto,
});

const thailandGroup = britainGroup.clone({
    name: name('Thailand-group'),
    order: 2,
});

const chinaGroup = britainGroup.clone({
    name: name('China-group'),
    order: 3,
});

const egyptGroup = britainGroup.clone({
    name: name('Egypt-group'),
    order: 4,
});


// #### Entity generation
// Helper functions
const calculateInitialRoll = () => Math.random() * 360;

const calculateInitialDeltaObject = () => {

    let d = Math.random() - 0.5;
    d += (d > 0) ? 0.2 : -0.2;

    return { roll: d };
};

// Create the template entitys that will be used by our EnhancedLabel entitys
scrawl.makeWheel({

    name: name('Britain-template'),
    group: name('Britain-group'),
    radius: 80,
    start: ['30%', '25%'],
    handle: ['center', 'center'],
    roll: calculateInitialRoll(),
    method: 'none',

}).clone({

    name: name('Thailand-template'),
    group: name('Thailand-group'),
    roll: calculateInitialRoll(),
    startX: '70%',

}).clone({

    name: name('China-template'),
    group: name('China-group'),
    roll: calculateInitialRoll(),
    startY: '75%',

}).clone({

    name: name('Egypt-template'),
    group: name('Egypt-group'),
    roll: calculateInitialRoll(),
    startX: '30%',

// Create the background entitys
}).clone({

    name: name('Britain-background'),
    group: name('Britain-group'),
    pivot: name('Britain-template'),
    lockTo: 'pivot',

    radius: 90,

    strokeStyle: 'rgb(0 0 150)',
    fillStyle: 'rgb(200 200 255)',
    lineWidth: 5,
    method: 'fillThenDraw',

}).clone({

    name: name('Thailand-background'),
    group: name('Thailand-group'),
    pivot: name('Thailand-template'),
    strokeStyle: 'rgb(150 150 0)',
    fillStyle: 'rgb(255 255 200)',

}).clone({

    name: name('China-background'),
    group: name('China-group'),
    pivot: name('China-template'),
    strokeStyle: 'rgb(150 0 0)',
    fillStyle: 'rgb(255 200 200)',

}).clone({

    name: name('Egypt-background'),
    group: name('Egypt-group'),
    pivot: name('Egypt-template'),
    strokeStyle: 'rgb(0 150 0)',
    fillStyle: 'rgb(200 255 200)',
});

// Create the EnhancedLabel entitys
// + We finesse the word sizes and vertical positioning (including the underline) using CSS
scrawl.makeEnhancedLabel({

    name: name('Britain-label'),
    group: name('Britain-group'),
    layoutTemplate: name('Britain-template'),

    fontString: 'bold 24px "Roboto Serif',
    text: '<p class="welcome-text">Welcome&nbsp;to <span class="country-name">Britain</span></p>',

    delta: calculateInitialDeltaObject(),
    noDeltaUpdates: true,

    textHandle: ['center', 'alphabetic'],
    lineSpacing: 2,
    lineAdjustment: 28,
    letterSpacing: '2px',
    wordSpacing: '2px',

    fillStyle: `rgb(220 170 140)`,

    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 1,
    shadowColor: 'black',

    globalAlpha: 1,
    globalCompositeOperation: 'source-over',

}).clone({

    name: name('Thailand-label'),
    group: name('Thailand-group'),
    layoutTemplate: name('Thailand-template'),

    fontString: 'bold 24px "Noto Thai Sans',
    text: '<p class="welcome-text">ยินดีต้อนรับสู่ <span class="country-name">ประเทศไทย</span></p>',

    delta: calculateInitialDeltaObject(),

}).clone({

    name: name('China-label'),
    group: name('China-group'),
    layoutTemplate: name('China-template'),

    fontString: 'bold 24px "Noto Chinese Simple Sans',
    text: '<p class="welcome-text">欢迎来到 <span class="country-name">中国</span></p>',

    delta: calculateInitialDeltaObject(),

}).clone({

    name: name('Egypt-label'),
    group: name('Egypt-group'),
    layoutTemplate: name('Egypt-template'),

    fontString: 'bold 24px "Noto Arabic Sans',
    text: '<p class="welcome-text">مرحبا&nbsp;بكم&nbsp;فى <span class="country-name">مصر</span></p>',

    delta: calculateInitialDeltaObject(),

    direction: 'rtl',
    letterSpacing: '0px',
    wordSpacing: '4px',
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
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
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: buttons,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        lockFillStyleToEntity: ['lockFillStyleToEntity', 'boolean'],
        noDeltaUpdates: ['noDeltaUpdates', 'boolean'],
        ['text-fillStyle']: ['fillStyle', 'raw'],
        ['underline-fillStyle']: ['underlineStyle', 'raw'],
        globalCompositeOperation: ['globalCompositeOperation', 'raw'],
        globalAlpha: ['globalAlpha', 'float'],
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
// @ts-expect-error
document.querySelector('#globalCompositeOperation').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#globalAlpha').value = 1;


// #### Development and testing
console.log(scrawl.library);
