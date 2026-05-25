// # Demo Canvas 203
// Label entity - underline text

// [Run code](../../demo/canvas-203.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
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

scrawl.makeColor({

    name: name('color-object'),
}).get('random');

const mylabel = scrawl.makeLabel({
    name: name('my-label'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fontString: '60px serif',
    text: 'Long live the world!',

    includeUnderline: true,
    underlineWidth: 2,
    underlineOffset: 0.9,
    underlineGap: 3,
    lockFillStyleToEntity: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    let fontReadout = `
`;
    document.fonts.forEach(k => {
        if (k.status === 'loaded') fontReadout +=(`    ${k.family} ${k.weight} ${k.style}\n`)
    })

    const position = `
    start - x: ${mylabel.get('startX')}px, y: ${mylabel.get('startY')}px
    handle - x: ${mylabel.get('handleX')}px, y: ${mylabel.get('handleY')}px
    offset - x: ${mylabel.get('offsetX')}px, y: ${mylabel.get('offsetY')}px
    scale: ${mylabel.get('scale')}, roll: ${mylabel.get('roll')}°
`;

    return `
Position:${position}
Loaded fonts:${fontReadout}`
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Gather DOM elements; setup form
const dom = scrawl.initializeDomInputs([
    ['input', 'handleX', '50'],
    ['input', 'handleY', '50'],
    ['input', 'letterSpacing', '0'],
    ['input', 'roll', '0'],
    ['input', 'scale', '1'],
    ['input', 'startX', '50'],
    ['input', 'startY', '50'],
    ['input', 'underlineGap', '3'],
    ['input', 'underlineOffset', '0.9'],
    ['input', 'underlineWidth', '2'],
    ['input', 'wordSpacing', '0'],
    ['select', 'font', 0],
    ['select', 'handleX_string', 2],
    ['select', 'handleY_string', 3],
    ['select', 'includeUnderline', 1],
    ['select', 'reverse', 0],
    ['select', 'underlineStyle', 0],
    ['select', 'upend', 0],
]);


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
        handleX_string: ['handleX', 'raw'],
        handleY_string: ['handleY', 'raw'],

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

const updateFont = (event) => {

    const font = event.target.value;

    if (font) {

        switch (font) {

            case 'serif' :
                mylabel.set({
                    fontString: '60px serif',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'sans-serif' :
                mylabel.set({
                    fontString: '60px sans-serif',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'monospace' :
                mylabel.set({
                    fontString: '40px monospace',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'cursive' :
                mylabel.set({
                    fontString: '60px cursive',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'fantasy' :
                mylabel.set({
                    fontString: '60px fantasy',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'garamond' :
                mylabel.set({
                    fontString: '60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'garamond-bold' :
                mylabel.set({
                    fontString: 'bold 60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'garamond-italic' :
                mylabel.set({
                    fontString: 'italic 60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'garamond-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 60px Garamond',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto' :
                mylabel.set({
                    fontString: '60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-bold' :
                mylabel.set({
                    fontString: 'bold 60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-italic' :
                mylabel.set({
                    fontString: 'italic 60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 60px "Roboto Sans"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-serif' :
                mylabel.set({
                    fontString: '50px "Roboto Serif"',
                    text: 'Long live the world!',
                    direction: 'ltr',
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
                });
                break;

            case 'roboto-serif-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 50px "Roboto Serif"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono' :
                mylabel.set({
                    fontString: '45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono-bold' :
                mylabel.set({
                    fontString: 'bold 45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono-italic' :
                mylabel.set({
                    fontString: 'italic 45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'roboto-mono-bolditalic' :
                mylabel.set({
                    fontString: 'bold italic 45px "Roboto Mono"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'noto-arabic-sans' :
                mylabel.set({
                    fontString: '50px "Noto Arabic Sans"',
                    text: 'لا يعرض أحد لتدخل تعسفي',
                    direction: 'rtl',
                });
                break;

            case 'noto-arabic-naskh' :
                mylabel.set({
                    fontString: '50px "Noto Arabic Naskh"',
                    text: 'لا يعرض أحد لتدخل تعسفي',
                    direction: 'rtl',
                });
                break;

            case 'noto-urdu-nastaliq' :
                mylabel.set({
                    fontString: '50px "Noto Urdu Nastaliq"',
                    text: 'ہر انسان کو آزادیٔ فکر،',
                    direction: 'rtl',
                });
                break;

            case 'noto-chinese-simple-sans' :
                mylabel.set({
                    fontString: '50px "Noto Chinese Simple Sans"',
                    text: '鉴于对人类家庭所有',
                    direction: 'ltr',
                });
                break;

            case 'noto-chinese-simple-serif' :
                mylabel.set({
                    fontString: '50px "Noto Chinese Simple Serif"',
                    text: '鉴于对人类家庭所有',
                    direction: 'ltr',
                });
                break;

            case 'noto-devangari-sans' :
                mylabel.set({
                    fontString: '50px "Noto Devangari Sans"',
                    text: 'प्रत्येक व्यक्ति को विचार और',
                    direction: 'ltr',
                });
                break;

            case 'noto-devangari-serif' :
                mylabel.set({
                    fontString: '50px "Noto Devangari Serif"',
                    text: 'प्रत्येक व्यक्ति को विचार और',
                    direction: 'ltr',
                });
                break;

            case 'noto-hebrew-sans' :
                mylabel.set({
                    fontString: '50px "Noto Hebrew Sans"',
                    text: 'כל אדם זכאי לחירות',
                    direction: 'rtl',
                });
                break;

            case 'noto-hebrew-serif' :
                mylabel.set({
                    fontString: '50px "Noto Hebrew Serif"',
                    text: 'כל אדם זכאי לחירות',
                    direction: 'rtl',
                });
                break;

            case 'noto-japanese-sans' :
                mylabel.set({
                    fontString: '50px "Noto Japanese Sans"',
                    text: '人類社会のすべて',
                    direction: 'ltr',
                });
                break;

            case 'noto-japanese-serif' :
                mylabel.set({
                    fontString: '50px "Noto Japanese Serif"',
                    text: '人類社会のすべて',
                    direction: 'ltr',
                });
                break;

            case 'noto-korean-sans' :
                mylabel.set({
                    fontString: '50px "Noto Korean Sans"',
                    text: '모든 사람은 의견의',
                    direction: 'ltr',
                });
                break;

            case 'noto-korean-serif' :
                mylabel.set({
                    fontString: '50px "Noto Korean Serif"',
                    text: '모든 사람은 의견의',
                    direction: 'ltr',
                });
                break;

            case 'noto-mongolian-sans' :
                mylabel.set({
                    fontString: '50px "Noto Mongolian Sans"',
                    text: 'ᠬᠦᠮᠦᠨ ᠪᠦᠷ ᠲᠥᠷᠥᠵᠦ',
                    direction: 'ltr',
                });
                break;

            case 'noto-tai-le-sans' :
                mylabel.set({
                    fontString: '50px "Noto Tai Le Sans"',
                    text: 'ᥓᥣᥳ ᥞᥨᥛ ᥑᥤᥴ',
                    direction: 'ltr',
                });
                break;

            case 'noto-tai-tham-sans' :
                mylabel.set({
                    fontString: '50px "Noto Tai Tham Sans"',
                    text: 'ᨾᨶᩩᩔ᩼ᨴ᩠ᨦᩢᩉᩖᩣ᩠ᨿᨠᩮ᩠ᨯᩨᨾᩣᨾᩦ',
                    direction: 'ltr',
                });
                break;

            case 'noto-thai-sans' :
                mylabel.set({
                    fontString: '50px "Noto Thai Sans"',
                    text: 'โดยที่การยอมรับศักดิ์ศ',
                    direction: 'ltr',
                });
                break;

            case 'noto-thai-serif' :
                mylabel.set({
                    fontString: '50px "Noto Thai Serif"',
                    text: 'โดยที่การยอมรับศักดิ์ศ',
                    direction: 'ltr',
                });
                break;

            case 'noto-tirhuta-sans' :
                mylabel.set({
                    fontString: '50px "Noto Tirhuta Sans"',
                    text: '𑒮𑒩𑓂𑒫𑒹 𑒧𑒰𑒢𑒫𑒰𑓁 𑒮𑓂𑒫𑒞𑒢𑓂𑒞𑓂𑒩𑒰𑓁',
                    direction: 'ltr',
                });
                break;

            case 'bungee' :
                mylabel.set({
                    fontString: '60px "Bungee"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'bungee-spice' :
                mylabel.set({
                    fontString: '60px "Bungee Spice"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'carter-one' :
                mylabel.set({
                    fontString: '60px "Carter One"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'mountains-of-christmas' :
                mylabel.set({
                    fontString: '60px "Mountains Of Christmas"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            default:
                mylabel.set({
                    fontString: '80px serif',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
        }
    }
};

scrawl.addNativeListener('change', (e) => updateFont(e), dom.font);


// #### Development and testing
console.log(scrawl.library);
