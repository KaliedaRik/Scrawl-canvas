// # Demo Canvas 059 
// CSS color space strings - rgb-key, rgb-hex, rgb(), rgba(), hsl(), hsla(), hwb(), lch(), lab()

// [Run code](../../demo/canvas-059.html)
import * as scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

const width = canvas.get('width');

const data = [
    ['rgb-key', 'red', 'orange', 'gold'],
    ['rgb-hex', '#f09', '#FF0099', '#ff009980'],
    ['rgb()', 'rgb(255, 0, 153)', 'rgb(2.55e2, 0e0, 1.53e2)', 'rgb(255 0 153)'],
    ['rgba()', 'rgba(100%, 0%, 60%, 1)', 'rgba(51 170 51 / 0.4)', 'rgba(51, 170, 51.6, 80%)'],
    ['hsl()', 'hsl(30, 100%, 50%)', 'hsl(30 100% 50%)', 'hsl(30.0 100% 50% / 60%)'],
    ['hsla()', 'hsla(30, 100%, 50%, 0.6)', 'hsla(30 100% 50% / 0.6)', 'hsla(30.2 100% 50% / 60%)'],
    ['hwb()', 'hwb(90 10% 10%)', 'hwb(90deg 10% 10% / 0.5)', 'hwb(.25turn 0% 40% / 50%)'],
    ['lch()', 'lch(29.2345% 44.2 27)', 'lch(52.2345% 72.2 56.2)', 'lch(52.2345% 72.2 56.2 / .5)'],
    ['lab()', 'lab(29.2345% 39.3825 20.0664)', 'lab(52.2345% 40.1645 59.9971)', 'lab(52.2345% 40.1645 59.9971 / .5)'],
];

const len = data.length;
const blockWidth = ((width * 0.9) / len) - 10;

data.forEach((d, index) => {

    const [label, col, max, min] = d;

    scrawl.makeBlock({
        name: `${label}-col`,
        startX: (blockWidth * index) + (index * 10) + 10,
        startY: '10%',
        width: blockWidth,
        height: '28%',
        fillStyle: col,
    }).clone({
        name: `${label}-min`,
        startY: '40%',
        fillStyle: min,
    }).clone({
        name: `${label}-max`,
        startY: '70%',
        fillStyle: max,
    });

    scrawl.makePhrase({
        name: `${label}-main-label`,
        text: label,
        startX: (blockWidth * index) + (index * 10) + 10,
        startY: '3%',
    })

    scrawl.makePhrase({
        name: `${label}-col-label`,
        pivot: `${label}-col`,
        lockTo: 'pivot',
        text: col,
        fillStyle: 'black',
        shadowColor: 'white',
        shadowBlur: 5,
        roll: 53,
        order: 1,
    }).clone({
        name: `${label}-min-label`,
        pivot: `${label}-min`,
        text: min,
    }).clone({
        name: `${label}-max-label`,
        pivot: `${label}-max`,
        text: max,
    });
});


// #### Scene animation
// None - rendering once should be sufficient
scrawl.render();


// #### Development and testing
console.log(scrawl.library);
