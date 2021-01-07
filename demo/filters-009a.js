// # Demo Filters 009 
// Filter parameters: chroma

// [Run code](../../demo/filters-009.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

canvas.setBase({
    backgroundColor: 'black',
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
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    let col = document.querySelector('#color'),
        trans = document.querySelector('#transparentAt'),
        opaq = document.querySelector('#opaqueAt');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Key color: ${col.value}
    Transparent at: ${trans.value}
    Opaque at: ${opaq.value}`;
    };
}();


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
document.querySelector('#color').value = '#007700';


// #### Development and testing
console.log(scrawl.library);
