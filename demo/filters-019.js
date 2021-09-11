// # Demo Filters 019 
// Using a Noise asset with a displace filter

// [Run code](../../demo/filters-019.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    noiseCanvas = scrawl.library.canvas['noise-canvas'];

scrawl.importDomImage('.flowers');


let noiseAsset = scrawl.makeNoiseAsset({

    name: 'my-noise-generator',
    width: 400,
    height: 400,

    noiseEngine: 'improved-perlin',

    rainbowColors: [
        [0, '#000000'],
        [19, '#806e58'],
        [39, '#ab7533'],
        [59, '#f78b07'],
        [79, '#fae69d'],
        [99, '#e8e7e3'],
        [119, '#babab6'],
        [139, '#f7f7f2'],
        [159, '#b0b094'],
        [179, '#f2f2dc'],
        [199, '#757544'],
        [219, '#e6e670'],
        [239, '#dbdb2a'],
        [259, '#919129'],
        [279, '#969608'],
        [299, '#f5f50c'],
        [319, '#f5da0c'],
        [339, '#968606'],
        [359, '#d6c53a'],
        [379, '#918839'],
        [399, '#f5eb90'],
        [419, '#c7c293'],
        [439, '#c7b093'],
        [459, '#c9c0b3'],
        [479, '#f7f0e6'],
        [499, '#bf9a65'],
        [519, '#b56e07'],
        [539, '#f79502'],
        [559, '#d69533'],
        [579, '#704402'],
        [599, '#805d2a'],
        [619, '#ebd9d5'],
        [639, '#dfede1'],
        [659, '#dfe9ed'],
        [679, '#a0cadb'],
        [699, '#d2f0fc'],
        [719, '#7d888c'],
        [739, '#a8b2b5'],
        [759, '#edf3f5'],
        [779, '#a2c0de'],
        [799, '#8a98a6'],
        [819, '#b4b6b8'],
        [839, '#f2f5f7'],
        [859, '#eaebda'],
        [879, '#d2d687'],
        [899, '#686b2e'],
        [919, '#aab038'],
        [939, '#474a14'],
        [959, '#b4bd28'],
        [979, '#656b03'],
        [999, '#000000'],
    ],
});

// Create the filter
scrawl.makeFilter({

    name: 'noise',
    method: 'image',

    asset: 'my-noise-generator',

    width: 400,
    height: 400,

    copyWidth: '100%',
    copyHeight: '100%',

    lineOut: 'map',
});

scrawl.makeFilter({

    name: 'displace',
    method: 'displace',

    lineMix: 'map',

    scaleX: 20,
    scaleY: 20,

    transparentEdges: true,
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

    filters: ['noise', 'displace'],
});

scrawl.makePicture({

    name: 'noisecanvas-display',
    group: noiseCanvas.base.name,

    width: '100%',
    height: '100%',
    copyWidth: '100%',
    copyHeight: '100%',

    asset: 'my-noise-generator',
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `Dimensions: width - ${width.value}, height - ${height.value}
Color (monochrome): start: ${monochromeStart.value}; range: ${monochromeRange.value}
Color (hue): start: ${hueStart.value}; range: ${hueRange.value}; saturation: ${saturation.value}; luminosity: ${luminosity.value}
Scale: ${scale.value}; Size: ${size.value}
Octaves: ${octaves.value}; Sine frequency coefficient: ${sineFrequencyCoeff.value}
Persistence: ${persistence.value}; Lacunarity: ${lacunarity.value}; Sum amplitude: ${sumAmplitude.value}; Worley depth: ${worleyDepth.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: [canvas, noiseCanvas],
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: noiseAsset,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        width: ['width', 'round'],
        height: ['height', 'round'],
        noiseEngine: ['noiseEngine', 'raw'],
        color: ['color', 'raw'],
        gradientStart: ['gradientStart', 'raw'],
        gradientEnd: ['gradientEnd', 'raw'],
        octaveFunction: ['octaveFunction', 'raw'],
        octaves: ['octaves', 'round'],
        sumFunction: ['sumFunction', 'raw'],
        sineFrequencyCoeff: ['sineFrequencyCoeff', 'float'],
        smoothing: ['smoothing', 'raw'],
        scale: ['scale', 'round'],
        size: ['size', 'round'],
        seed: ['seed', 'raw'],
        persistence: ['persistence', 'float'],
        lacunarity: ['lacunarity', 'round'],
        sumAmplitude: ['sumAmplitude', 'float'],
        monochromeStart: ['monochromeStart', 'round'],
        monochromeRange: ['monochromeRange', 'round'],
        hueStart: ['hueStart', 'float'],
        hueRange: ['hueRange', 'float'],
        saturation: ['saturation', 'float'],
        luminosity: ['luminosity', 'float'],
        worleyOutput: ['worleyOutput', 'raw'],
        worleyDepth: ['worleyDepth', 'round'],
    },
});

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = e.target.value;

    if (val === 'sine' || val === 'sine-x' || val === 'sine-y') {

        sineFrequencyCoeff.removeAttribute('disabled');
        sumAmplitude.setAttribute('disabled', 'true');
    }
    else if (val === 'modular' || val === 'random') {

        sineFrequencyCoeff.setAttribute('disabled', 'true');
        sumAmplitude.removeAttribute('disabled');
    }
    else {

        sineFrequencyCoeff.setAttribute('disabled', 'true');
        sumAmplitude.setAttribute('disabled', 'true');
    }

}, '#sumFunction');

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = e.target.value;

    if (val === 'simplex') smoothing.setAttribute('disabled', 'true');
    else smoothing.removeAttribute('disabled');

}, '#noiseEngine');

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = parseFloat(e.target.value);

    if (val > 1) {
        persistence.removeAttribute('disabled');
        lacunarity.removeAttribute('disabled');
    }
    else {
        persistence.setAttribute('disabled', 'true');
        lacunarity.setAttribute('disabled', 'true');
    }
}, '#octaves');

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = e.target.value;

    if (val === 'monochrome') {
        monochromeStart.removeAttribute('disabled');
        monochromeRange.removeAttribute('disabled');
        gradientStart.setAttribute('disabled', 'true');
        gradientEnd.setAttribute('disabled', 'true');
        hueStart.setAttribute('disabled', 'true');
        hueRange.setAttribute('disabled', 'true');
        saturation.setAttribute('disabled', 'true');
        luminosity.setAttribute('disabled', 'true');
    }
    else if (val === 'hue') {
        hueStart.removeAttribute('disabled');
        hueRange.removeAttribute('disabled');
        saturation.removeAttribute('disabled');
        luminosity.removeAttribute('disabled');
        monochromeStart.setAttribute('disabled', 'true');
        monochromeRange.setAttribute('disabled', 'true');
        gradientStart.setAttribute('disabled', 'true');
        gradientEnd.setAttribute('disabled', 'true');
    }
    else {
        gradientStart.removeAttribute('disabled');
        gradientEnd.removeAttribute('disabled');
        monochromeStart.setAttribute('disabled', 'true');
        monochromeRange.setAttribute('disabled', 'true');
        hueStart.setAttribute('disabled', 'true');
        hueRange.setAttribute('disabled', 'true');
        saturation.setAttribute('disabled', 'true');
        luminosity.setAttribute('disabled', 'true');
    }
}, '#color');

// Setup form
const width = document.querySelector('#width'),
    height = document.querySelector('#height'),
    octaves = document.querySelector('#octaves'),
    sineFrequencyCoeff = document.querySelector('#sineFrequencyCoeff'),
    scale = document.querySelector('#scale'),
    size = document.querySelector('#size'),
    persistence = document.querySelector('#persistence'),
    lacunarity = document.querySelector('#lacunarity'),
    monochromeStart = document.querySelector('#monochromeStart'),
    monochromeRange = document.querySelector('#monochromeRange'),
    hueStart = document.querySelector('#hueStart'),
    hueRange = document.querySelector('#hueRange'),
    saturation = document.querySelector('#saturation'),
    luminosity = document.querySelector('#luminosity'),
    sumAmplitude = document.querySelector('#sumAmplitude'),
    worleyDepth = document.querySelector('#worleyDepth');

const noiseEngine = document.querySelector('#noiseEngine'),
    color = document.querySelector('#color'),
    gradientStart = document.querySelector('#gradientStart'),
    gradientEnd = document.querySelector('#gradientEnd'),
    octaveFunction = document.querySelector('#octaveFunction'),
    sumFunction = document.querySelector('#sumFunction'),
    smoothing = document.querySelector('#smoothing'),
    seed = document.querySelector('#seed'),
    worleyOutput = document.querySelector('#worleyOutput');

width.value = 400;
height.value = 400;
octaves.value = 1;
sineFrequencyCoeff.value = 1;
scale.value = 50;
size.value = 256;
persistence.value = 0.5;
lacunarity.value = 2;
monochromeStart.value = 0;
monochromeRange.value = 255;
hueStart.value = 0;
hueRange.value = 120;
saturation.value = 100;
luminosity.value = 50;
sumAmplitude.value = 5;
worleyDepth.value = 0;

noiseEngine.options.selectedIndex = 1;
color.options.selectedIndex = 0;
gradientStart.value = '#ff0000';
gradientEnd.value = '#00ff00';
octaveFunction.options.selectedIndex = 0;
sumFunction.options.selectedIndex = 0;
smoothing.options.selectedIndex = 3;
seed.value = 'noize';
worleyOutput.options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
