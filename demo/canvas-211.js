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


// #### User interaction: accessibility - keyboard
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

const copySelectionToConsole = () => {

    const units = mylabel.get('textUnits'),
        maxIndex = units.length - 1;

    if (startIndex >= 0 && startIndex <= maxIndex && endIndex >= 0 && endIndex <= maxIndex) {

        const starts = (startIndex > endIndex) ? endIndex : startIndex,
            ends = (startIndex > endIndex) ? startIndex : endIndex;

        let text = '';

        for (let i = starts; i <= ends; i++) {

            text += units[i].chars;
        }
        console.log(`Text to copy: [${text}]`);
    }
    else console.log('Nothing to copy');
}

scrawl.makeKeyboardZone({

    zone: canvas,

    ctrlOnly: {
        c: () => copySelectionToConsole(),
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

        if (startIndex >= 0 && startIndex <= maxIndex && endIndex >= 0 && endIndex <= maxIndex) {

            const starts = (startIndex > endIndex) ? endIndex : startIndex,
                ends = (startIndex > endIndex) ? startIndex : endIndex;

            for (let i = starts; i <= ends; i++) {

                mylabel.setTextUnit(i, selectionHighlight);
            }
        }

        if (cursorIndex >= 0 && cursorIndex <= maxIndex) mylabel.setTextUnit(cursorIndex, cursorHighlight);
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

    checkHitUseTemplate: false,

    delta: {
        pathPosition: 0.0005,
    },
    noDeltaUpdates: true,
});


// #### User interaction: mouse/touch
const checkMouseHover = () => {

    const hit = mylabel.checkHit(canvas.here);

    if (hit && typeof hit !== 'boolean' && hit.index != null) {

        if (selectionInProgress) endIndex = hit.index;
        else cursorIndex = hit.index;

        updateTextUnits();
    }
};

scrawl.addListener('down', () => {

    updateTextUnits(true);

    const hit = mylabel.checkHit(canvas.here);

    if (hit && typeof hit !== 'boolean' && hit.index != null) {

        cursorIndex = hit.index;
        startIndex = cursorIndex;
        endIndex = cursorIndex;
        selectionInProgress = true;
    }
    else {

        cursorIndex = -1;
        startIndex = -1;
        endIndex = -1;
        selectionInProgress = false;
    }

}, canvas.domElement);

scrawl.addListener(['up', 'leave'], () => {

    selectionInProgress = false;

}, canvas.domElement);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: checkMouseHover,
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


const fontSelector = document.querySelector('#font');
const updateFont = (event) => {

    const font = event.target.value;

    if (font) {

        switch (font) {

            case 'roboto-serif' :
                mylabel.set({
                    fontString: '16px "Roboto Serif"',
                    text: westernText,
                    direction: 'ltr',
                });
                break;

            case 'noto-hebrew-serif' :
                mylabel.set({
                    fontString: '16px "Noto Hebrew Serif"',
                    text: 'כל אדם זכאי לחירות הדעה והבטוי, לרבות החירות להחיק בדעות ללא כל הפרעה, ולבקש ידיעות ודעות, ולקבלן ולמסרן בכל הדרכים וללא סייגי גבולות כל אדם, כחבר החברה, זכאי לבטחון סוציאלי וזכאי לתבוע שהזכויות הכלכליות הסוציאליות והתרבותיות, שהן חיוניות לכבודו כאדם ולהתפתחות החופשית של אישיותו, יובטחו במשמץ לאומי ובשיתוף פעולה בינלאומי בהתאם לארגונה ולאוצרותיה של המדינה כל אדם זכאי למנוחה ולפנאי',
                    direction: 'rtl',
                });
                break;

            case 'noto-japanese-sans' :
                mylabel.set({
                    fontString: '16px "Noto Japanese Sans"',
                    text: '人類社会のすべての構成員の固有の尊厳と平等で譲ることのできない権利とを承認することは&#x2060;、世界における自由&#x2060;、正義及び平和の基礎であるので&#x2060;、 人権の無視及び軽侮が&#x2060;、人類の良心を踏みにじった野蛮行為をもたらし&#x2060;、言論及び信仰の自由が受けられ&#x2060;、恐怖及び欠乏のない世界の到来が&#x2060;、一般の人々の最高の願望として宣言されたので&#x2060;、 人間が専制と圧迫とに対する最後の手段として反逆に訴えることがないようにするためには&#x2060;、法の支配によって人権を保護することが肝要であるので&#x2060;、 諸国間の友好関係の発展を促進することが肝要であるので&#x2060;、',
                    direction: 'ltr',
                });
                break;
        }
    }
};
scrawl.addNativeListener('change', (e) => updateFont(e), fontSelector);


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
