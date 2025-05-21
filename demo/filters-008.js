// # Demo Filters 008
// Filter parameters: tint

// [Run code](../../demo/filters-008.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: name('tint'),
    method: 'tint',

    // These values create the sepia tint
    redInRed: 0.393,
    redInGreen: 0.349,
    redInBlue: 0.272,
    greenInRed: 0.769,
    greenInGreen: 0.686,
    greenInBlue: 0.534,
    blueInRed: 0.189,
    blueInGreen: 0.168,
    blueInBlue: 0.131,
});

const colorFactory = scrawl.makeColor({

    name: name('colors'),
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: [name('tint')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    In Red - red: ${dom.redInRed.value} | green: ${dom.greenInRed.value} | blue: ${dom.blueInRed.value} → ${dom.redColor.value}
    In Green - red: ${dom.redInGreen.value} | green: ${dom.greenInGreen.value} | blue: ${dom.blueInGreen.value} → ${dom.greenColor.value}
    In Blue -  red: ${dom.redInBlue.value} | green: ${dom.greenInBlue.value} | blue: ${dom.blueInBlue.value} → ${dom.blueColor.value}
    Opacity: ${dom.opacity.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const _round = Math.round,
    red = colorFactory.convertRGBtoHex(_round(0.39 * 255), _round(0.77 * 255), _round(0.19 * 255)),
    green = colorFactory.convertRGBtoHex(_round(0.35 * 255), _round(0.69 * 255), _round(0.17 * 255)),
    blue = colorFactory.convertRGBtoHex(_round(0.27 * 255), _round(0.53 * 255), _round(0.13 * 255));

const dom = scrawl.initializeDomInputs([
    ['input', 'redInRed', '0.39'],
    ['input', 'greenInRed', '0.77'],
    ['input', 'blueInRed', '0.19'],
    ['input', 'redInGreen', '0.35'],
    ['input', 'greenInGreen', '0.69'],
    ['input', 'blueInGreen', '0.17'],
    ['input', 'redInBlue', '0.27'],
    ['input', 'greenInBlue', '0.53'],
    ['input', 'blueInBlue', '0.13'],
    ['input', 'redColor', red],
    ['input', 'greenColor', green],
    ['input', 'blueColor', blue],
    ['input', 'opacity', '1'],
]);


// Handle the color inputs
scrawl.addNativeListener(['change'], (e) => {

    if (e && e.target) {

        const target = e.target.id,
            val = e.target.value;

        let [r, g, b] = colorFactory.extractRGBfromColor(val);

        r /= 255;
        g /= 255;
        b /= 255;

        if ('redColor' === target) {

            myFilter.set({ redColor: val });

            dom.redInRed.value = r.toFixed(0);
            dom.greenInRed.value = g.toFixed(0);
            dom.blueInRed.value = b.toFixed(0);
        }
        else if ('greenColor' === target) {

            myFilter.set({ greenColor: val });

            dom.redInGreen.value = r.toFixed(0);
            dom.greenInGreen.value = g.toFixed(0);
            dom.blueInGreen.value = b.toFixed(0);
        }
        else if ('blueColor' === target) {

            myFilter.set({ blueColor: val });

            dom.redInBlue.value = r.toFixed(0);
            dom.greenInBlue.value = g.toFixed(0);
            dom.blueInBlue.value = b.toFixed(0);
        }
    }
}, '.colorSelector');


// Setup form observer functionality for other inputs
scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        redInRed: ['redInRed', 'float'],
        redInGreen: ['redInGreen', 'float'],
        redInBlue: ['redInBlue', 'float'],
        greenInRed: ['greenInRed', 'float'],
        greenInGreen: ['greenInGreen', 'float'],
        greenInBlue: ['greenInBlue', 'float'],
        blueInRed: ['blueInRed', 'float'],
        blueInGreen: ['blueInGreen', 'float'],
        blueInBlue: ['blueInBlue', 'float'],
        opacity: ['opacity', 'float'],
    },

    callback: () => {

        const rR = _round(parseFloat(dom.redInRed.value) * 255),
            gR = _round(parseFloat(dom.greenInRed.value) * 255),
            bR = _round(parseFloat(dom.blueInRed.value) * 255),
            rG = _round(parseFloat(dom.redInGreen.value) * 255),
            gG = _round(parseFloat(dom.greenInGreen.value) * 255),
            bG = _round(parseFloat(dom.blueInGreen.value) * 255),
            rB = _round(parseFloat(dom.redInBlue.value) * 255),
            gB = _round(parseFloat(dom.greenInBlue.value) * 255),
            bB = _round(parseFloat(dom.blueInBlue.value) * 255);

        dom.redColor.value = colorFactory.convertRGBtoHex(rR, gR, bR);
        dom.greenColor.value = colorFactory.convertRGBtoHex(rG, gG, bG);
        dom.blueColor.value = colorFactory.convertRGBtoHex(rB, gB, bB);
    },
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
