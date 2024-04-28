// # Demo Canvas 207
// EnhancedLabel entity - styling multiline text

// [Run code](../../demo/canvas-207.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


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
// Setup form
const dom = initializeDomInputs([
    ['', 'domText'],
    ['input', 'alignment', '0'],
    ['input', 'height', '80'],
    ['input', 'letterSpacing', '0'],
    ['input', 'lineAdjustment', '0'],
    ['input', 'lineSpacing', '1.5'],
    ['input', 'localAlignment', '0'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'width', '60'],
    ['input', 'wordSpacing', '0'],
    ['select', 'breakTextOnSpaces', 1],
    ['select', 'font', 0],
    ['select', 'justifyLine', 0],
    ['select', 'textHandleX', 1],
    ['select', 'textHandleY', 4],
    ['select', 'textUnitFlow', 0],
]);


const updateDisplayText = () => {

    const dims = myLayout.get('dimensions');

    const style = dom.domText.style;

    let justify = myLabel.get('justifyLine');
    if (justify === 'space-between') justify = 'justify';
    if (justify === 'space-around') justify = 'justify-all';

    setTimeout(() => {

        dom.domText.innerHTML = myLabel.get('rawText');
        style.direction = myLabel.get('direction');
        style.font = myLabel.get('fontString');
        style.lineHeight = myLabel.get('lineSpacing');
        if (dims[0]) style.width = `${dims[0]}px`;
        if (dims[1]) style.height = `${dims[1]}px`;
        style.textAlign = justify;
        style.transform = `rotate(${myLayout.get('roll')}deg) scale(${myLayout.get('scale')})`;
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

        lineAdjustment: ['lineAdjustment', 'float'],
        alignment: ['alignment', 'float'],
        justifyLine: ['justifyLine', 'raw'],
        lineSpacing: ['lineSpacing', 'float'],
        letterSpacing: ['letterSpacing', 'float'],
        wordSpacing: ['wordSpacing', 'float'],
        textHandleX: ['textHandleX', 'raw'],
        textHandleY: ['textHandleY', 'raw'],
        textUnitFlow: ['textUnitFlow', 'raw'],
        breakTextOnSpaces: ['breakTextOnSpaces', 'boolean'],
    },

    callback: updateDisplayText,
});

const updateLocalAlignment = (event) => {

    const val = parseFloat(event.target.value);

    if (Number.isFinite(val)) myLabel.setAllTextUnits({ localAlignment: val });
};
scrawl.addNativeListener(['change', 'input'], (e) => updateLocalAlignment(e), dom.localAlignment);


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


const updateFont = (event) => {

    const font = event.target.value;

    if (font) {

        switch (font) {

            case 'garamond' :
                myLabel.set({ fontString: '16px Garamond' });
                break;

            case 'roboto' :
                myLabel.set({ fontString: '16px "Roboto Sans"' });
                break;

            case 'roboto-mono' :
                myLabel.set({ fontString: '16px "Roboto Mono"' });
                break;

            case 'bungee' :
                myLabel.set({ fontString: '16px "Bungee"'});
                break;

            case 'carter-one' :
                myLabel.set({ fontString: '16px "Carter One"' });
                break;

            case 'mountains-of-christmas' :
                myLabel.set({ fontString: '16px "Mountains Of Christmas"' });
                break;

            default : myLabel.set({ fontString: '16px serif' });
        }
        updateDisplayText();
    }
};
scrawl.addNativeListener('change', (e) => updateFont(e), dom.font);


// #### Development and testing
console.log(scrawl.library);
