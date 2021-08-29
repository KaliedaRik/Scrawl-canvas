// # Demo Filters 011a 
// Filter parameters: chromakey

// [Run code](../../demo/filters-011a.html)
import scrawl from '../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

scrawl.importDomImage('.flowers');

canvas.setBase({
    backgroundColor: 'red',
})


// #### Filter setup and user interaction
const action = {
    action: 'colors-to-alpha',
    red: 0,
    green: 127,
    blue: 0,
    opaqueAt: 1,
    transparentAt: 0,
    opacity: 1,
};

const converter = scrawl.makeColor({
    name: 'chromakey-converter',
});

const myFilter = scrawl.makeFilter({

    name: 'chromakey',
    actions: [{action: 'grayscale'}, action],
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target && e.target.id) {

        let val = e.target.value;

        switch (e.target.id) {

            case 'color' :
                converter.convert(val);
                action.red = converter.r;
                action.green = converter.g;
                action.blue = converter.b;
                break;

            case 'opaqueAt' :
                action.opaqueAt = parseFloat(val);
                break;

            case 'transparentAt' :
                action.transparentAt = parseFloat(val);
                break;

            case 'opacity' :
                action.opacity = parseFloat(val);
                break;
        }

        myFilter.set({ actions: [{action: 'grayscale'}, action]});
    }

}, '.controlItem');


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
        opaq = document.querySelector('#opaqueAt'),
        opacity = document.querySelector('#opacity');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Key color: ${col.value}
    Transparent at: ${trans.value}, Opaque at: ${opaq.value}
    Opacity: ${opacity.value}`;
    };
}();


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
document.querySelector('#color').value = '#007700';

console.log(scrawl.library);
