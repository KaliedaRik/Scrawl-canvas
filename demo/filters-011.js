// # Demo Filters 011 
// Filter parameters: chromakey

// [Run code](../../demo/filters-011.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

canvas.setBase({
    backgroundColor: 'red',
})


// Create the filter
// + Chroma filters can have more than one range; each range array should be added to the `ranges` attribute
const myFilter = scrawl.makeFilter({

    name: 'chromakey',
    method: 'chromakey',

    red: 0,
    green: 127,
    blue: 0,

    opaqueAt: 1,
    transparentAt: 0,
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

    filters: ['chromakey'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `    Key color: ${color.value}
    Transparent at: ${transparentAt.value}, Opaque at: ${opaqueAt.value}
    Opacity: ${opacity.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
const interpretColors = function () {

    const converter = scrawl.makeColor({
        name: 'converter',
    });

    const color = document.querySelector('#color');

    return function () {

        converter.convert(color.value);

        myFilter.set({
            red: converter.r,
            green: converter.g,
            blue: converter.b,
        });
    }
}();
scrawl.addNativeListener(['input', 'change'], interpretColors, '.controlItem');

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        transparentAt: ['transparentAt', 'float'],
        opaqueAt: ['opaqueAt', 'float'],
        opacity: ['opacity', 'float'],
    },
});


// Setup form
const color = document.querySelector('#color'),
    opaqueAt = document.querySelector('#opaqueAt'),
    transparentAt = document.querySelector('#transparentAt'),
    opacity = document.querySelector('#opacity');

color.value = '#007700';
opaqueAt.value = 1;
transparentAt.value = 0;
opacity.value = 1;


// #### Development and testing
console.log(scrawl.library);
