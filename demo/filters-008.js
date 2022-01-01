// # Demo Filters 008 
// Filter parameters: tint

// [Run code](../../demo/filters-008.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


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

    return `    In Red - red: ${redInRed.value} green: ${greenInRed.value} blue: ${blueInRed.value} → ${redColor.value}
    In Green - red: ${redInGreen.value} green: ${greenInGreen.value} blue: ${blueInGreen.value} → ${greenColor.value}
    In Blue -  red: ${redInBlue.value} green: ${greenInBlue.value} blue: ${blueInBlue.value} → ${blueColor.value}
    Opacity: ${opacity.value}`;
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

        console.log(target, val);

        if ('redColor' === target) {

            myFilter.set({ redColor: val });

            redInRed.value = r;
            greenInRed.value = g;
            blueInRed.value = b;
        }
        else if ('greenColor' === target) {
            
            myFilter.set({ greenColor: val });

            redInGreen.value = r;
            greenInGreen.value = g;
            blueInGreen.value = b;
        }
        else if ('blueColor' === target) {
            
            myFilter.set({ blueColor: val });

            redInBlue.value = r;
            greenInBlue.value = g;
            blueInBlue.value = b;
        }
    }
}, '.colorSelector');


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

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

        let rR = Math.round(redInRed.value * 255),
            gR = Math.round(greenInRed.value * 255),
            bR = Math.round(blueInRed.value * 255),
            rG = Math.round(redInGreen.value * 255),
            gG = Math.round(greenInGreen.value * 255),
            bG = Math.round(blueInGreen.value * 255),
            rB = Math.round(redInBlue.value * 255),
            gB = Math.round(greenInBlue.value * 255),
            bB = Math.round(blueInBlue.value * 255);

        redColor.value = colorFactory.convertRGBtoHex(rR, gR, bR);
        greenColor.value = colorFactory.convertRGBtoHex(rG, gG, bG);
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

redInRed.value = 0.39;
redInGreen.value = 0.35;
redInBlue.value = 0.27;
greenInRed.value = 0.77;
greenInGreen.value = 0.69;
greenInBlue.value = 0.53;
blueInRed.value = 0.19;
blueInGreen.value = 0.17;
blueInBlue.value = 0.13;

redColor.value = colorFactory.convertRGBtoHex(Math.round(0.39 * 255), Math.round(0.77 * 255), Math.round(0.19 * 255));
greenColor.value = colorFactory.convertRGBtoHex(Math.round(0.35 * 255), Math.round(0.69 * 255), Math.round(0.17 * 255));
blueColor.value = colorFactory.convertRGBtoHex(Math.round(0.27 * 255), Math.round(0.53 * 255), Math.round(0.13 * 255));

opacity.value = 1;


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(canvas, '#my-image-store', piccy);


// #### Development and testing
console.log(scrawl.library);
