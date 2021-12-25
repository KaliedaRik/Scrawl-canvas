// # Demo Filters 004 
// Filter parameters: threshold

// [Run code](../../demo/filters-004.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');


// Create the filter
const myFilter = scrawl.makeFilter({

    name: 'threshold',
    method: 'threshold',

    level: 127,

    lowRed: 0,
    lowGreen: 0,
    lowBlue: 0,

    highRed: 255,
    highGreen: 255,
    highBlue: 255,
});


// Create the target entity
scrawl.makePicture({

    name: 'base-piccy',

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['threshold'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Low color: ${lowCol.value}, High color: ${highCol.value}
    Level: ${level.value}
    Red: ${red.value}; Green: ${green.value}; Blue: ${blue.value}; Alpha: ${alpha.value}; 
    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Use a color object to convert between CSS hexadecimal and RGB decimal colors
const converter = scrawl.makeColor({
    name: 'converter',
});

// scrawl.addNativeListener(
//     ['input', 'change'], 
//     (e) => myFilter.set({ level: parseFloat(e.target.value) }), 
//     '#level');

// scrawl.addNativeListener(
//     ['input', 'change'], 
//     (e) => myFilter.set({ opacity: parseFloat(e.target.value) }), 
//     '#opacity');

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        opacity: ['opacity', 'float'],
        level: ['level', 'round'],
        red: ['red', 'round'],
        green: ['green', 'round'],
        blue: ['blue', 'round'],
        alpha: ['alpha', 'round'],
        includeRed: ['includeRed', 'boolean'],
        includeGreen: ['includeGreen', 'boolean'],
        includeBlue: ['includeBlue', 'boolean'],
        includeAlpha: ['includeAlpha', 'boolean'],
        useMixedChannel: ['useMixedChannel', 'boolean'],
    },
});

scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => {

        converter.convert(e.target.value);

        myFilter.set({ 
            lowRed: converter.r,
            lowGreen: converter.g,
            lowBlue: converter.b,
        });
    }, 
    '#lowColor');

scrawl.addNativeListener(
    ['input', 'change'], 
    (e) => {

        converter.convert(e.target.value);

        myFilter.set({ 
            highRed: converter.r,
            highGreen: converter.g,
            highBlue: converter.b,
        });
    }, 
    '#highColor');

// Setup form
const lowCol = document.querySelector('#lowColor'),
    highCol = document.querySelector('#highColor'),
    level = document.querySelector('#level'),
    red = document.querySelector('#red'),
    green = document.querySelector('#green'),
    blue = document.querySelector('#blue'),
    alpha = document.querySelector('#alpha'),
    opacity = document.querySelector('#opacity');

lowCol.value = '#000000';
highCol.value = '#ffffff';
level.value = 128;
red.value = 128;
green.value = 128;
blue.value = 128;
alpha.value = 128;
opacity.value = 1;

document.querySelector('#useMixedChannel').options.selectedIndex = 1;
document.querySelector('#includeRed').options.selectedIndex = 1;
document.querySelector('#includeGreen').options.selectedIndex = 1;
document.querySelector('#includeBlue').options.selectedIndex = 1;
document.querySelector('#includeAlpha').options.selectedIndex = 0;

// #### Development and testing
console.log(scrawl.library);
