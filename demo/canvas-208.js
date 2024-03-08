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

const westernText = '<span class="underline">Lorem</span> ipsum <b>dolor sit</b> amet, con&shy;sectetur 😀 adi&shy;piscing &eacute;lit, sed <s>do eius-mod</s> <u>tempoj yn&shy;figizqunt</u> ut <span class="stamp-outlined">labore et dolore</span> <span class="green-highlight">magna aliqua.</span> Ut enim ad <span class="bold">minim veniam,</span> quis <span class="letter-spaced">nostrud</span> exercit-ation <span class="strike">ullamco laboris</span> nisi ut aliquip ex ea <span class="make-monospace">"commodo"</span> consequat. Duis <em>(aute irure d&ouml;lor)</em> in reprehenderit 🤖&icirc;n <i>voluptate</i> velit &copy;2024 <i>esse &lt;cillum&gt; <b>dolore</b> eu fug🎻iat nulla</i> pariatur. <span class="red">Excepteur sint</span> occaecat &iexcl;cupidatat! <strong>non proident,</strong> <span class="word-spaced">sunt in culpa qui</span> offici&thorn;a deserunt <span class="make-bigger"><span class="green-highlight">mollit</span> anim</span> id est laborum.';


const myLayout = scrawl.makeWheel({

    name: name('wheel-layout-engine'),
    width: '60%',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    startAngle: 135,
    endAngle: 45,
    strokeStyle: '#dddddd',
    method: 'draw',
});

const myLabel = scrawl.makeEnhancedLabel({

    name: name('my-label'),
    fontString: '16px "Roboto Sans"',
    text: westernText,
    layoutTemplate: name('wheel-layout-engine'),
    textHandle: ['center', 'alphabetic'],
    breakWordsOnHyphens: true,
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

    const dims = myLayout.get('dimensions');

    let justify = myLabel.get('justifyLine');
    if (justify === 'space-between') justify = 'justify';

    setTimeout(() => {

        displayText.innerHTML = myLabel.get('rawText');
// @ts-expect-error
        displayText.style.direction = myLabel.get('direction');
// @ts-expect-error
        displayText.style.font = myLabel.get('fontString');
// @ts-expect-error
        displayText.style.lineHeight = myLabel.get('lineSpacing');
// @ts-expect-error
        if (dims[0]) displayText.style.width = `${dims[0]}px`;
// @ts-expect-error
        if (dims[1]) displayText.style.height = `${dims[1]}px`;
// @ts-expect-error
        displayText.style.textAlign = justify;
// @ts-expect-error
        displayText.style.transform = `rotate(${myLayout.get('roll')}deg) scale(${myLayout.get('scale')})`;
    }, 50);
};

updateDisplayText();


scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myLabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        layoutTemplateLineOffset: ['layoutTemplateLineOffset', 'float'],
        alignment: ['alignment', 'float'],
        justifyLine: ['justifyLine', 'raw'],
        lineSpacing: ['lineSpacing', 'float'],
        textHandleY: ['textHandleY', 'raw'],
    },

    callback: updateDisplayText,
});

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myLayout,

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

const updateFont = (event) => {

    const font = event.target.value;

    if (font) {

        switch (font) {

            case 'garamond' :
                myLabel.set({ fontString: '16px Garamond' });
                break;

            case 'roboto' :
                myLabel.set({ fontString: '16px "Roboto Sans"'});
                break;

            case 'bungee' :
                myLabel.set({ fontString: '16px "Bungee"'});
                break;

            case 'carter-one' :
                myLabel.set({ fontString: '16px "Carter One"'});
                break;

            case 'mountains-of-christmas' :
                myLabel.set({ fontString: '16px "Mountains Of Christmas"'});
                break;

            default : myLabel.set({ fontString: '16px serif'});
        }
        updateDisplayText();
    }
};
scrawl.addNativeListener('change', (e) => updateFont(e), fontSelector);


// Setup form
// @ts-expect-error
fontSelector.options.selectedIndex = 0;

// @ts-expect-error
document.querySelector('#width').value = 60;
// @ts-expect-error
document.querySelector('#height').value = 80;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#layoutTemplateLineOffset').value = 0;
// @ts-expect-error
document.querySelector('#justifyLine').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#alignment').value = 0;
// @ts-expect-error
document.querySelector('#textHandleY').options.selectedIndex = 4;

// #### Development and testing
console.log(scrawl.library);
