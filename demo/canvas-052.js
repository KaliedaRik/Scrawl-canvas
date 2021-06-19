// # Demo Canvas 052 
// Reaction-Diffusion assets

// [Run code](../../demo/canvas-052.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

const noise = scrawl.makeNoiseAsset({

    name: 'my-noise-generator',
    width: 400,
    height: 400,
    scale: 50,
});

const rda = scrawl.makeReactionDiffusionAsset({

    name: 'my-rda',
    initialDataImage: 'my-noise-generator',
});

// TEMP - we want the RD to trigger noise output, not an otherwise unused picture entity
scrawl.makePicture({

    name: 'input',
    asset: 'my-noise-generator',

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    method: 'none',
});

const output = scrawl.makePicture({
    
    name: 'output',
    asset: 'my-rda',

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    const rdaWidth = document.querySelector('#rdaWidth'),
        rdaHeight = document.querySelector('#rdaHeight'),
        feedRate = document.querySelector('#feedRate'),
        killRate = document.querySelector('#killRate'),
        diffRateA = document.querySelector('#diffRateA'),
        diffRateB = document.querySelector('#diffRateB'),
        timestep = document.querySelector('#timestep'),
        generations = document.querySelector('#generations');

    const naWidth = document.querySelector('#width'),
        naHeight = document.querySelector('#height'),
        naScale = document.querySelector('#scale');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    RD asset 
        - width: ${rdaWidth.value}, height: ${rdaHeight.value}; timestep: ${timestep.value}; generations: ${generations.value}
        - diffusion rates - A: ${diffRateA.value}, B: ${diffRateB.value}
        - feed rate: ${feedRate.value}; kill rate: ${killRate.value}
    Noise asset
        - width: ${naWidth.value}, height: ${naHeight.value}; scale: ${naScale.value}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.display-control',

    target: output,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        copyStartX: ['copyStartX', '%'],
        copyStartY: ['copyStartY', '%'],
        copyWidth: ['copyWidth', '%'],
        copyHeight: ['copyHeight', '%'],
    },
});

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.noise-control',

    target: noise,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        width: ['width', 'round'],
        height: ['height', 'round'],
        noiseEngine: ['noiseEngine', 'raw'],
        scale: ['scale', 'round'],
    },
});

scrawl.addNativeListener(['input', 'change'], () => {

    rda.set({
        generations: rda.get('generations'),
    });
}, '.noise-control');

scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.rda-control',

    target: rda,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        rdaWidth: ['width', 'round'],
        rdaHeight: ['height', 'round'],

        feedRate: ['staticFeedRate', 'float'],
        killRate: ['staticKillRate', 'float'],

        diffRateA: ['diffusionRateA', 'float'],
        diffRateB: ['diffusionRateB', 'float'],

        timestep: ['timestep', 'float'],
        generations: ['generations', 'round'],

        color: ['color', 'raw'],
        gradientStart: ['gradientStart', 'raw'],
        gradientEnd: ['gradientEnd', 'raw'],
        monochromeStart: ['monochromeStart', 'round'],
        monochromeRange: ['monochromeRange', 'round'],
        hueStart: ['hueStart', 'float'],
        hueRange: ['hueRange', 'float'],
        saturation: ['saturation', 'float'],
        luminosity: ['luminosity', 'float'],
    },
});

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = e.target.value,
        ms = document.querySelector('#monochromeStart'),
        mr = document.querySelector('#monochromeRange'),
        gs = document.querySelector('#gradientStart'),
        ge = document.querySelector('#gradientEnd'),
        hs = document.querySelector('#hueStart'),
        hr = document.querySelector('#hueRange'),
        s = document.querySelector('#saturation'),
        l = document.querySelector('#luminosity');

    if (val === 'monochrome') {
        ms.removeAttribute('disabled');
        mr.removeAttribute('disabled');
        gs.setAttribute('disabled', 'true');
        ge.setAttribute('disabled', 'true');
        hs.setAttribute('disabled', 'true');
        hr.setAttribute('disabled', 'true');
        s.setAttribute('disabled', 'true');
        l.setAttribute('disabled', 'true');
    }
    else if (val === 'hue') {
        hs.removeAttribute('disabled');
        hr.removeAttribute('disabled');
        s.removeAttribute('disabled');
        l.removeAttribute('disabled');
        ms.setAttribute('disabled', 'true');
        mr.setAttribute('disabled', 'true');
        gs.setAttribute('disabled', 'true');
        ge.setAttribute('disabled', 'true');
    }
    else {
        gs.removeAttribute('disabled');
        ge.removeAttribute('disabled');
        ms.setAttribute('disabled', 'true');
        mr.setAttribute('disabled', 'true');
        hs.setAttribute('disabled', 'true');
        hr.setAttribute('disabled', 'true');
        s.setAttribute('disabled', 'true');
        l.setAttribute('disabled', 'true');
    }
}, '#color');


// Setup form
document.querySelector('#width').value = 400;
document.querySelector('#height').value = 400;
document.querySelector('#scale').value = 50;
document.querySelector('#color').options.selectedIndex = 0;
document.querySelector('#gradientStart').value = '#ff0000';
document.querySelector('#gradientEnd').value = '#00ff00';
document.querySelector('#monochromeStart').value = 0;
document.querySelector('#monochromeRange').value = 255;
document.querySelector('#hueStart').value = 0;
document.querySelector('#hueRange').value = 120;
document.querySelector('#saturation').value = 100;
document.querySelector('#luminosity').value = 50;

document.querySelector('#rdaWidth').value = 200;
document.querySelector('#rdaHeight').value = 200;
document.querySelector('#feedRate').value = 0.054;
document.querySelector('#killRate').value = 0.062;
document.querySelector('#diffRateA').value = 0.2095;
document.querySelector('#diffRateB').value = 0.105;
document.querySelector('#timestep').value = 1;
document.querySelector('#generations').value = 50;


// #### Development and testing
console.log(scrawl.library);
