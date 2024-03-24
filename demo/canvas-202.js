// # Demo Canvas 202
// Label entity - basic support for non-western fonts

// [Run code](../../demo/canvas-202.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;

const html = document.querySelector('#text-in-html');
// @ts-expect-error
html.style.font = '60px serif';
// @ts-expect-error
html.style.direction = 'ltr';
html.textContent = 'Long live the world!';


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


const mylabel = scrawl.makeLabel({
    name: name('my-label'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    fontString: '60px serif',
    text: 'Long live the world!',
    method: 'drawThenFill',
    fillStyle: 'orange',
    strokeStyle: 'black',
    lineWidth: 4,
    lineCap: 'round',
    lineJoin: 'round',
    showBoundingBox: true,
});

scrawl.makeWheel({
    name: name('pin'),
    radius: 4,
    handle: ['center', 'center'],
    pivot: name('my-label'),
    lockTo: 'pivot',
    fillStyle: 'blue',
})


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const boxReadout = `
    width: ${mylabel.get('width')}
    height: ${mylabel.get('height')}
`;

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
Box data:${boxReadout}
Positioning:${position}
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
        offsetX: ['offsetX', 'int'],
        offsetY: ['offsetY', 'int'],

        roll: ['roll', 'float'],
        scale: ['scale', 'float'],

        upend: ['flipUpend', 'boolean'],
        reverse: ['flipReverse', 'boolean'],

        wordSpacing: ['wordSpacing', 'px'],
        letterSpacing: ['letterSpacing', 'px'],

        direction: ['direction', 'raw'],
        fontKerning: ['fontKerning', 'raw'],
        textRendering: ['textRendering', 'raw'],
    },

    // We need to let the changes settle before transferring them over to our DOM element
    callback: () => setTimeout(() => {

// @ts-expect-error
        html.style.transform = `scale(${mylabel.get('scale')}) rotate(${mylabel.get('roll')}deg)`;
// @ts-expect-error
        html.style.letterSpacing = mylabel.get('letterSpacing');
// @ts-expect-error
        html.style.wordSpacing = mylabel.get('wordSpacing');
// @ts-expect-error
        html.style.direction = mylabel.get('direction');
// @ts-expect-error
        html.style.fontKerning = mylabel.get('fontKerning');
// @ts-expect-error
        html.style.textRendering = mylabel.get('textRendering');
    }, 50),
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
                    fontString: '40px "Bungee"',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
                break;

            case 'bungee-spice' :
                mylabel.set({
                    fontString: '40px "Bungee Spice"',
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
                    fontString: '60px serif',
                    text: 'Long live the world!',
                    direction: 'ltr',
                });
        }

        // We need to let the changes settle before transferring them over to our DOM element
        setTimeout(() => {

// @ts-expect-error
            html.style.font = mylabel.get('fontString');
// @ts-expect-error
            html.style.direction = mylabel.get('direction');
            html.textContent = mylabel.get('text');
        }, 50);
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
document.querySelector('#offsetX').value = 0;
// @ts-expect-error
document.querySelector('#offsetY').value = 0;
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
document.querySelector('#direction').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#fontKerning').options.selectedIndex = 0;
// @ts-expect-error
document.querySelector('#textRendering').options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
