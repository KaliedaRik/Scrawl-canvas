// # Demo Canvas 211
// EnhancedLabel entity - keyboard navigation; hit tests

// [Run code](../../demo/canvas-211.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// #### Accessibility - keyboard
canvas.set({
    includeInTabNavigation: true,
});

let startIndex = -1,
    endIndex = -1,
    cursorIndex = 0,
    selectionInProgress = false;

const clearSelection = () => {

    startIndex = -1;
    endIndex = -1;
    cursorIndex = 0;
    selectionInProgress = false;
    updateTextUnits(true);
};

const updateSelection = () => {

    startIndex = cursorIndex;
    endIndex = cursorIndex;
    selectionInProgress = !selectionInProgress;
    updateTextUnits();
};

const moveCursor = (direction) => {

    const maxIndex = mylabel.get('textUnits').length - 1;

    switch (direction) {

        case 'backwards' :

            if (cursorIndex > 0) --cursorIndex;

            break;

        case 'forwards' :
            if (cursorIndex < maxIndex) ++cursorIndex;
            break;
    }

    if (selectionInProgress) endIndex = cursorIndex;

    updateTextUnits();
};

const copySelectionToClipboard = () => {

    console.log('Will copy selected text to clipboard here');
}

scrawl.makeKeyboardZone({

    zone: canvas,

    ctrlOnly: {
        c: () => copySelectionToClipboard(),
    },

    none: {
        Backspace: () => clearSelection(),
        Enter: () => updateSelection(),
        ArrowLeft: () => moveCursor('backwards'),
        ArrowUp: () => moveCursor('backwards'),
        ArrowRight: () => moveCursor('forwards'),
        ArrowDown: () => moveCursor('forwards'),
    },
});

const cursorHighlight = {
    localStyle: {
        includeHighlight: true,
        highlightStyle: 'black',
        fillStyle: 'yellow',
    }
};

const selectionHighlight = {
    localStyle: {
        includeHighlight: true,
        highlightStyle: 'orange',
    }
};

const noHighlight = {
    localStyle: null,
};

const updateTextUnits = (clear = false) => {

    mylabel.setAllTextUnits(noHighlight);

    if (!clear) {

        const maxIndex = mylabel.get('textUnits').length - 1;

        if (selectionInProgress) {

            if (startIndex >= 0 && startIndex <= maxIndex && endIndex >= 0 && endIndex <= maxIndex) {

                const starts = (startIndex > endIndex) ? endIndex : startIndex,
                    ends = (startIndex > endIndex) ? startIndex : endIndex;

                for (let i = starts; i <= ends; i++) {

                    mylabel.setTextUnit(i, selectionHighlight);
                }
            }
        }
        else if (cursorIndex >= 0 && cursorIndex <= maxIndex) mylabel.setTextUnit(cursorIndex, cursorHighlight);
    }
};


// #### Create entitys
const westernText = '<span class="underline">Lorem</span> ipsum <b>dolor sit</b> amet, con&shy;sectetur 😀 adi&shy;piscing &eacute;lit, sed <s>do eius-mod</s> <u>tempoj yn&shy;figizqunt</u> ut <span class="stamp-outlined">labore et dolore</span> <span class="green-highlight">magna aliqua.</span> Ut enim ad <span class="bold">minim veniam,</span> quis <span class="letter-spaced">nostrud</span> exercit-ation <span class="strike">ullamco laboris</span> nisi ut aliquip ex ea <span class="make-monospace">"commodo"</span> consequat. Duis <em>(aute irure d&ouml;lor)</em> in reprehenderit 🤖&icirc;n <i>voluptate</i> velit &copy;2024 <i>esse &lt;cillum&gt; <b>dolore</b> eu fug🎻iat nulla</i> pariatur. <span class="red">Excepteur sint</span> occaecat &iexcl;cupidatat! <strong>non proident,</strong> <span class="word-spaced">sunt in culpa qui</span> offici&thorn;a deserunt <span class="make-bigger"><span class="green-highlight">mollit</span> anim</span> id est laborum.';

scrawl.makeSpiral({
    name: name('spiral-track'),
    strokeStyle: 'rgb(0 0 0 / 0.2)',
    method: 'draw',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    loops: 5,
    loopIncrement: 50,
    drawFromLoop: 2,
    scaleOutline: false,
    useAsPath: true,
    constantPathSpeed: true,
});

const mylabel = scrawl.makeEnhancedLabel({

    name: name('my-label'),
    fontString: '16px "Roboto Sans"',
    text: westernText,

    layoutTemplate: name('spiral-track'),
    useLayoutTemplateAsPath: true,

    textHandle: ['center', 'alphabetic'],

    breakTextOnSpaces: false,

    delta: {
        pathPosition: 0.0005,
    },
    noDeltaUpdates: true,
});



// #### User interaction


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User form interaction
const animationSelector = document.querySelector('#animation');

const updateAnimation = (event) => {

    const val = event.target.value;

    if (val) mylabel.set({ noDeltaUpdates: false });
    else mylabel.set({ noDeltaUpdates: true });
};
scrawl.addNativeListener('change', (e) => updateAnimation(e), animationSelector);

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mylabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        letterSpacing: ['letterSpacing', 'px'],
        wordSpacing: ['wordSpacing', 'px'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        textUnitFlow: ['textUnitFlow', 'raw'],

        alignment: ['alignment', 'float'],

        alignTextUnitsToPath: ['alignTextUnitsToPath', 'boolean'],
        breakTextOnSpaces: ['breakTextOnSpaces', 'boolean'],

        flipReverse: ['flipReverse', 'boolean'],
        flipUpend: ['flipUpend', 'boolean'],
    },

    callback: clearSelection,
});


// Setup form
// @ts-expect-error
animationSelector.options.selectedIndex = 0;

// @ts-expect-error
document.querySelector('#breakTextOnSpaces').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#alignment').value = 0;
// @ts-expect-error
document.querySelector('#flipReverse').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#flipUpend').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#alignTextUnitsToPath').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#letterSpacing').value = 0;
// @ts-expect-error
document.querySelector('#wordSpacing').value = 0;
// @ts-expect-error
document.querySelector('#textUnitFlow').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
