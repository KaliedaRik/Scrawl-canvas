// # Demo Filters 008 
// Filter parameters: tint

// [Run code](../../demo/filters-008.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'tint',
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
    name: 'my-color-factory',
});


// Create the target entity
const piccy = scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['tint'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    return `    In Red - red: ${redInRed.value} green: ${greenInRed.value} blue: ${blueInRed.value} → ${redColor.value}\n    In Green - red: ${redInGreen.value} green: ${greenInGreen.value} blue: ${blueInGreen.value} → ${greenColor.value}\n    In Blue -  red: ${redInBlue.value} green: ${greenInBlue.value} blue: ${blueInBlue.value} → ${blueColor.value}\n    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});

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

// @ts-expect-error
            redInRed.value = r;
// @ts-expect-error
            greenInRed.value = g;
// @ts-expect-error
            blueInRed.value = b;
        }
        else if ('greenColor' === target) {
            
            myFilter.set({ greenColor: val });

// @ts-expect-error
            redInGreen.value = r;
// @ts-expect-error
            greenInGreen.value = g;
// @ts-expect-error
            blueInGreen.value = b;
        }
        else if ('blueColor' === target) {
            
            myFilter.set({ blueColor: val });

// @ts-expect-error
            redInBlue.value = r;
// @ts-expect-error
            greenInBlue.value = g;
// @ts-expect-error
            blueInBlue.value = b;
        }
    }
}, '.colorSelector');


// #### User interaction
// Setup form observer functionality
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

// @ts-expect-error
        let rR = Math.round(redInRed.value * 255),
// @ts-expect-error
            gR = Math.round(greenInRed.value * 255),
// @ts-expect-error
            bR = Math.round(blueInRed.value * 255),
// @ts-expect-error
            rG = Math.round(redInGreen.value * 255),
// @ts-expect-error
            gG = Math.round(greenInGreen.value * 255),
// @ts-expect-error
            bG = Math.round(blueInGreen.value * 255),
// @ts-expect-error
            rB = Math.round(redInBlue.value * 255),
// @ts-expect-error
            gB = Math.round(greenInBlue.value * 255),
// @ts-expect-error
            bB = Math.round(blueInBlue.value * 255);

// @ts-expect-error
        redColor.value = colorFactory.convertRGBtoHex(rR, gR, bR);
// @ts-expect-error
        greenColor.value = colorFactory.convertRGBtoHex(rG, gG, bG);
// @ts-expect-error
        blueColor.value = colorFactory.convertRGBtoHex(rB, gB, bB);
    },
});

// Setup form
const redInRed = document.querySelector('#redInRed'),
    greenInRed = document.querySelector('#greenInRed'),
    blueInRed = document.querySelector('#blueInRed'),
    redInGreen = document.querySelector('#redInGreen'),
    greenInGreen = document.querySelector('#greenInGreen'),
    blueInGreen = document.querySelector('#blueInGreen'),
    redInBlue = document.querySelector('#redInBlue'),
    greenInBlue = document.querySelector('#greenInBlue'),
    blueInBlue = document.querySelector('#blueInBlue'),
    redColor = document.querySelector('#redColor'),
    greenColor = document.querySelector('#greenColor'),
    blueColor = document.querySelector('#blueColor'),
    opacity = document.querySelector('#opacity');

// @ts-expect-error
redInRed.value = 0.39;
// @ts-expect-error
redInGreen.value = 0.35;
// @ts-expect-error
redInBlue.value = 0.27;
// @ts-expect-error
greenInRed.value = 0.77;
// @ts-expect-error
greenInGreen.value = 0.69;
// @ts-expect-error
greenInBlue.value = 0.53;
// @ts-expect-error
blueInRed.value = 0.19;
// @ts-expect-error
blueInGreen.value = 0.17;
// @ts-expect-error
blueInBlue.value = 0.13;

// @ts-expect-error
redColor.value = colorFactory.convertRGBtoHex(Math.round(0.39 * 255), Math.round(0.77 * 255), Math.round(0.19 * 255));
// @ts-expect-error
greenColor.value = colorFactory.convertRGBtoHex(Math.round(0.35 * 255), Math.round(0.69 * 255), Math.round(0.17 * 255));
// @ts-expect-error
blueColor.value = colorFactory.convertRGBtoHex(Math.round(0.27 * 255), Math.round(0.53 * 255), Math.round(0.13 * 255));

// @ts-expect-error
opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
