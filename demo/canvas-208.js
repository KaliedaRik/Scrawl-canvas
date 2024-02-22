// # Demo Canvas 208
// EnhancedLabel entity - styling multiline text

// [Run code](../../demo/canvas-208.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


const displayText = document.querySelector('.demo-explanation-styles');

const westernText = '<span class="underline">Lorem</span> ipsum <b>dolor sit</b> amet, con&shy;sectetur 😀 adi&shy;piscing &eacute;lit, sed <s>do eius-mod</s> <u>tempor in&shy;cididunt</u> ut labore et dolore magna aliqua. Ut enim ad <span class="bold">minim veniam,</span> quis <span class="letter-spaced">nostrud</span> exercit-ation <span class="strike">ullamco laboris</span> nisi ut aliquip ex ea <span class="make-monospace">"commodo"</span> consequat. Duis <em>(aute irure d&ouml;lor)</em> in reprehenderit 🤖&icirc;n <i>voluptate</i> velit &copy;2024 <i>esse &lt;cillum&gt; <b>dolore</b> eu fug🎻iat nulla</i> pariatur. <span class="red">Excepteur sint</span> occaecat &iexcl;cupidatat! <strong>non proident,</strong> <span class="word-spaced">sunt in culpa qui</span> offici&thorn;a deserunt <span class="make-bigger">mollit anim</span> id est laborum.';


const wheelEngine = scrawl.makeWheel({

    name: name('wheel-layout-engine'),
    width: '60%',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fillStyle: 'transparent',
    visibility: false,
});

const mylabel = scrawl.makeEnhancedLabel({

    name: name('my-label'),
    fontString: '16px "Roboto Sans"',
    text: westernText,
    layoutEngine: name('wheel-layout-engine'),
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let fontReadout = `
`;
    document.fonts.forEach(k => {
        if (k.status == 'loaded') fontReadout +=(`    ${k.family} ${k.weight} ${k.style}\n`)
    })

    return `
Loaded fonts:${fontReadout}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
const updateDisplayText = () => {

    const dims = wheelEngine.get('dimensions');

    let justify = mylabel.get('justifyLine');
    if (justify === 'space-between') justify = 'justify';

    setTimeout(() => {

        displayText.innerHTML = mylabel.get('rawText');
// @ts-expect-error
        displayText.style.direction = mylabel.get('direction');
// @ts-expect-error
        displayText.style.font = mylabel.get('fontString');
// @ts-expect-error
        displayText.style.lineHeight = mylabel.get('lineSpacing');
// @ts-expect-error
        if (dims[0]) displayText.style.width = `${dims[0]}px`;
// @ts-expect-error
        if (dims[1]) displayText.style.height = `${dims[1]}px`;
// @ts-expect-error
        displayText.style.textAlign = justify;

    }, 50);
};

updateDisplayText();


scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mylabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        layoutEngineLineOffset: ['layoutEngineLineOffset', 'float'],
        alignment: ['alignment', 'float'],
        justifyLine: ['justifyLine', 'raw'],
        textUnitDirection: ['textUnitDirection', 'raw'],
        lineSpacing: ['lineSpacing', 'float'],
        breakTextOnSpaces: ['breakTextOnSpaces', 'boolean'],
        breakWordsOnHyphens: ['breakWordsOnHyphens', 'boolean'],
        hyphenString: ['hyphenString', 'raw'],
        truncateString: ['truncateString', 'raw'],
        showGuidelines: ['showGuidelines', 'boolean'],
        textHandleY: ['textHandleY', 'raw'],
    },

    callback: updateDisplayText,
});

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: name('wheel-layout-engine'),

    useNativeListener: true,
    preventDefault: true,

    updates: {

        width: ['width', '%'],
        height: ['height', '%'],
        scale: ['scale', 'float'],
        roll: ['roll', 'float'],
    },

    callback: updateDisplayText,
});


const fontSelector = document.querySelector('#font');
const lineSpacingSelector = document.querySelector('#lineSpacing');
const directionSelector = document.querySelector('#direction');
const breakTextOnSpacesSelector = document.querySelector('#breakTextOnSpaces');

const updateFont = (event) => {

    const font = event.target.value;

    if (font) {

        switch (font) {

            case 'garamond' :
                mylabel.set({ fontString: '16px Garamond' });
                break;

            case 'roboto' :
                mylabel.set({ fontString: '16px "Roboto Sans"'});
                break;

            case 'bungee' :
                mylabel.set({ fontString: '16px "Bungee"'});
                break;

            case 'carter-one' :
                mylabel.set({ fontString: '16px "Carter One"'});
                break;

            case 'mountains-of-christmas' :
                mylabel.set({ fontString: '16px "Mountains Of Christmas"'});
                break;

            default : mylabel.set({ fontString: '16px serif'});
        }

// @ts-expect-error
        if (mylabel.get('direction') === 'ltr') directionSelector.options.selectedIndex = 0;
// @ts-expect-error
        else directionSelector.options.selectedIndex = 1;

// @ts-expect-error
        if (mylabel.get('breakTextOnSpaces')) breakTextOnSpacesSelector.options.selectedIndex = 1;
// @ts-expect-error
        else breakTextOnSpacesSelector.options.selectedIndex = 0;

// @ts-expect-error
        lineSpacingSelector.value = mylabel.get('lineSpacing');

        updateDisplayText();
    }
};
scrawl.addNativeListener('change', (e) => updateFont(e), fontSelector);


// Setup form
// @ts-expect-error
fontSelector.options.selectedIndex = 0;
// @ts-expect-error
lineSpacingSelector.value = 1.5;
// @ts-expect-error
directionSelector.options.selectedIndex = 0;
// @ts-expect-error
breakTextOnSpacesSelector.options.selectedIndex = 1;

// @ts-expect-error
document.querySelector('#width').value = 60;
// @ts-expect-error
document.querySelector('#height').value = 80;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#layoutEngineLineOffset').value = 0;
// @ts-expect-error
document.querySelector('#justifyLine').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#alignment').value = 0;
// @ts-expect-error
document.querySelector('#textUnitDirection').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#breakWordsOnHyphens').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#hyphenString').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#truncateString').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#textHandleY').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#showGuidelines').options.selectedIndex = 0;

// #### Development and testing
console.log(scrawl.library);
