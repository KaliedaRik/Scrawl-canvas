// # Demo Canvas 203
// Label entity - underline text

// [Run code](../../demo/canvas-203.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


scrawl.makeGradient({
    name: name('linear-gradient'),
    endX: '100%',

    colors: [
        [0, 'blue'],
        [495, 'red'],
        [500, 'yellow'],
        [505, 'red'],
        [999, 'green']
    ],
    colorSpace: 'OKLAB',
    precision: 5,
});

scrawl.makePattern({

    name: name('water-pattern'),
    imageSource: 'img/water.png',
});

const mylabel = scrawl.makeLabel({
    name: name('my-label'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fontString: '60px serif',
    text: 'Long live the world!',

    showBoundingBox: true,
    boundingBoxStyle: '#f008',

    includeUnderline: true,
    underlineWidth: 2,
    underlineOffset: 0.9,
    underlineGap: 3,
    lockFillStyleToEntity: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const boxReadout = `
    width: ${mylabel.get('width')}
    height: ${mylabel.get('height')}
    fontVerticalOffset: ${mylabel.get('fontVerticalOffset')}
`;

// @ts-expect-error
    const metrics = mylabel.metrics;
    const metricsReadout = `
    abbAscent: ${metrics.actualBoundingBoxAscent}
    abbDescent: ${metrics.actualBoundingBoxDescent}
    abbleft: ${metrics.actualBoundingBoxLeft}
    abbRight: ${metrics.actualBoundingBoxRight}
    fbbAscent: ${metrics.fontBoundingBoxAscent}
    fbbDescent: ${metrics.fontBoundingBoxDescent}
    alphabeticBaseline: ${metrics.alphabeticBaseline}
    hangingBaseline: ${metrics.hangingBaseline}
    ideographicBaseline: ${metrics.ideographicBaseline}
    width: ${metrics.width}
`;

    let fontReadout = `
`;
    document.fonts.forEach(k => {
        if (k.status == 'loaded') fontReadout +=(`    ${k.family} ${k.weight} ${k.style}\n`)
    })

    const position = `
    start - x: ${mylabel.get('startX')}px, y: ${mylabel.get('startY')}px
    handle - x: ${mylabel.get('handleX')}px, y: ${mylabel.get('handleY')}px
    offset - x: ${mylabel.get('offsetX')}px, y: ${mylabel.get('offsetY')}px
    scale: ${mylabel.get('scale')}, roll: ${mylabel.get('roll')}°
`;

    return `
Box data:${boxReadout}
Positioning:${position}
Font metrics:${metricsReadout}
Loaded fonts:${fontReadout}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: mylabel,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        startX: ['startX', '%'],
        startY: ['startY', '%'],
        handleX: ['handleX', '%'],
        handleY: ['handleY', '%'],
        'handleX-string': ['handleX', 'raw'],
        'handleY-string': ['handleY', 'raw'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],

        wordSpacing: ['wordSpacing', 'px'],
        letterSpacing: ['letterSpacing', 'px'],

        includeUnderline: ['includeUnderline', 'boolean'],
        underlineStyle: ['underlineStyle', 'raw'],
        underlineWidth: ['underlineWidth', 'int'],
        underlineOffset: ['underlineOffset', 'float'],
        underlineGap: ['underlineGap', 'float'],
    },
});

const selector = document.querySelector('#font');

const updateFont = (event) => {

    const font = event.target.value;

    if (font) {

        switch (font) {

            case 'serif' :
                mylabel.set({
                    fontString: '60px serif',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'sans-serif' :
                mylabel.set({
                    fontString: '60px sans-serif',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'monospace' :
                mylabel.set({
                    fontString: '40px monospace',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'cursive' :
                mylabel.set({
                    fontString: '60px cursive',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 5,
                });
                break;

            case 'fantasy' :
                mylabel.set({
                    fontString: '60px fantasy',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 14,
                });
                break;

            case 'garamond' :
                mylabel.set({
                    fontString: '60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'garamond-bold' :
                mylabel.set({
                    fontString: 'bold 60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'garamond-italic' :
                mylabel.set({
                    fontString: 'italic 60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'garamond-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto' :
                mylabel.set({
                    fontString: '60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-bold' :
                mylabel.set({
                    fontString: 'bold 60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-italic' :
                mylabel.set({
                    fontString: 'italic 60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-serif' :
                mylabel.set({
                    fontString: '50px "Roboto Serif"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-serif-bold' :
                mylabel.set({
                    fontString: 'bold 50px "Roboto Serif"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-serif-italic' :
                mylabel.set({
                    fontString: 'italic 50px "Roboto Serif"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-serif-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 50px "Roboto Serif"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-mono' :
                mylabel.set({
                    fontString: '45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-mono-bold' :
                mylabel.set({
                    fontString: 'bold 45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-mono-italic' :
                mylabel.set({
                    fontString: 'italic 45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'roboto-mono-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-arabic-sans' :
                mylabel.set({
                    fontString: '50px "Noto Arabic Sans"',
                    text: 'لا يعرض أحد لتدخل تعسفي',
                    direction: 'rtl',
                    fontVerticalOffset: 15,
                });
                break;

            case 'noto-arabic-naskh' :
                mylabel.set({
                    fontString: '50px "Noto Arabic Naskh"',
                    text: 'لا يعرض أحد لتدخل تعسفي',
                    direction: 'rtl',
                    fontVerticalOffset: 14,
                });
                break;

            case 'noto-urdu-nastaliq' :
                mylabel.set({
                    fontString: '50px "Noto Urdu Nastaliq"',
                    text: 'ہر انسان کو آزادیٔ فکر،',
                    direction: 'rtl',
                    fontVerticalOffset: 43,
                });
                break;

            case 'noto-chinese-simple-sans' :
                mylabel.set({
                    fontString: '50px "Noto Chinese Simple Sans"',
                    text: '鉴于对人类家庭所有',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-chinese-simple-serif' :
                mylabel.set({
                    fontString: '50px "Noto Chinese Simple Serif"',
                    text: '鉴于对人类家庭所有',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-devangari-sans' :
                mylabel.set({
                    fontString: '50px "Noto Devangari Sans"',
                    text: 'प्रत्येक व्यक्ति को विचार और',
                    direction: 'ltr',
                    fontVerticalOffset: 11,
                });
                break;

            case 'noto-devangari-serif' :
                mylabel.set({
                    fontString: '50px "Noto Devangari Serif"',
                    text: 'प्रत्येक व्यक्ति को विचार और',
                    direction: 'ltr',
                    fontVerticalOffset: 16,
                });
                break;

            case 'noto-hebrew-sans' :
                mylabel.set({
                    fontString: '50px "Noto Hebrew Sans"',
                    text: 'כל אדם זכאי לחירות',
                    direction: 'rtl',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-hebrew-serif' :
                mylabel.set({
                    fontString: '50px "Noto Hebrew Serif"',
                    text: 'כל אדם זכאי לחירות',
                    direction: 'rtl',
                    fontVerticalOffset: 6,
                });
                break;

            case 'noto-japanese-sans' :
                mylabel.set({
                    fontString: '50px "Noto Japanese Sans"',
                    text: '人類社会のすべて',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-japanese-serif' :
                mylabel.set({
                    fontString: '50px "Noto Japanese Serif"',
                    text: '人類社会のすべて',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-korean-sans' :
                mylabel.set({
                    fontString: '50px "Noto Korean Sans"',
                    text: '모든 사람은 의견의',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-korean-serif' :
                mylabel.set({
                    fontString: '50px "Noto Korean Serif"',
                    text: '모든 사람은 의견의',
                    direction: 'ltr',
                    fontVerticalOffset: 4,
                });
                break;

            case 'noto-mongolian-sans' :
                mylabel.set({
                    fontString: '50px "Noto Mongolian Sans"',
                    text: 'ᠬᠦᠮᠦᠨ ᠪᠦᠷ ᠲᠥᠷᠥᠵᠦ',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'noto-tai-le-sans' :
                mylabel.set({
                    fontString: '50px "Noto Tai Le Sans"',
                    text: 'ᥓᥣᥳ ᥞᥨᥛ ᥑᥤᥴ',
                    direction: 'ltr',
                    fontVerticalOffset: 6,
                });
                break;

            case 'noto-tai-tham-sans' :
                mylabel.set({
                    fontString: '50px "Noto Tai Tham Sans"',
                    text: 'ᨾᨶᩩᩔ᩼ᨴ᩠ᨦᩢᩉᩖᩣ᩠ᨿᨠᩮ᩠ᨯᩨᨾᩣᨾᩦ',
                    direction: 'ltr',
                    fontVerticalOffset: 13,
                });
                break;

            case 'noto-thai-looped-sans' :
                mylabel.set({
                    fontString: '50px "Noto Thai Looped Sans"',
                    text: 'โดยที่การยอมรับศักดิ์ศ',
                    direction: 'ltr',
                    fontVerticalOffset: 20,
                });
                break;

            case 'noto-thai-serif' :
                mylabel.set({
                    fontString: '50px "Noto Thai Serif"',
                    text: 'โดยที่การยอมรับศักดิ์ศ',
                    direction: 'ltr',
                    fontVerticalOffset: 20,
                });
                break;

            case 'noto-tirhuta-sans' :
                mylabel.set({
                    fontString: '50px "Noto Tirhuta Sans"',
                    text: '𑒮𑒩𑓂𑒫𑒹 𑒧𑒰𑒢𑒫𑒰𑓁 𑒮𑓂𑒫𑒞𑒢𑓂𑒞𑓂𑒩𑒰𑓁',
                    direction: 'ltr',
                    fontVerticalOffset: 15,
                });
                break;

            case 'bungee' :
                mylabel.set({
                    fontString: '60px "Bungee"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'bungee-spice' :
                mylabel.set({
                    fontString: '60px "Bungee Spice"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
                break;

            case 'carter-one' :
                mylabel.set({
                    fontString: '60px "Carter One"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 5,
                });
                break;

            case 'mountains-of-christmas' :
                mylabel.set({
                    fontString: '60px "Mountains Of Christmas"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 6,
                });
                break;

            default:
                mylabel.set({
                    fontString: '80px serif',
                    text: 'Long live the world!',
                    direction: 'ltr',
                    fontVerticalOffset: 0,
                });
        }
    }
};

scrawl.addNativeListener('change', (e) => updateFont(e), selector);


// Setup form
// @ts-expect-error
selector.options.selectedIndex = 0;

// @ts-expect-error
document.querySelector('#startX').value = 50;
// @ts-expect-error
document.querySelector('#startY').value = 50;
// @ts-expect-error
document.querySelector('#handleX').value = 50;
// @ts-expect-error
document.querySelector('#handleY').value = 50;
// @ts-expect-error
document.querySelector('#handleX-string').options.selectedIndex = 2;
// @ts-expect-error
document.querySelector('#handleY-string').options.selectedIndex = 3;
// @ts-expect-error
document.querySelector('#scale').value = 1;
// @ts-expect-error
document.querySelector('#roll').value = 0;
// @ts-expect-error
document.querySelector('#upend').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#reverse').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#letterSpacing').value = 0;
// @ts-expect-error
document.querySelector('#wordSpacing').value = 0;
// @ts-expect-error
document.querySelector('#includeUnderline').options.selectedIndex = 1;
// @ts-expect-error
document.querySelector('#underlineStyle').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#underlineWidth').value = 2;
// @ts-expect-error
document.querySelector('#underlineOffset').value = 0.9;
// @ts-expect-error
document.querySelector('#underlineGap').value = 3;


// #### Development and testing
console.log(scrawl.library);
