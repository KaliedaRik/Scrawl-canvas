// # Demo Canvas 060
// Noise asset functionality

// [Run code](../../demo/filters-019.html)
import scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;

canvas.set({
    fit: 'cover',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
});

// Build and display the reaction-diffusion asset
const bespokeColors = {
  'stepped-grays': [
      [0, '#333'],
      [199, '#333'],
      [200, '#666'],
      [399, '#666'],
      [400, '#999'],
      [599, '#999'],
      [600, '#ccc'],
      [799, '#ccc'],
      [800, '#fff'],
      [999, '#fff'],
  ],
  'red-gradient': [
      [0, 'hsl(0 100% 40%)'],
      [999, 'hsl(0 100% 100%)'],
  ],
  'red-blue': [
      [0, 'rgb(255 0 0)'],
      [999, 'rgb(0 0 255)'],
  ],
  'red-green': [
      [0, 'rgb(255 0 0)'],
      [999, 'rgb(0 255 0)'],
  ],
  'hue-gradient': [
      [0, 'hwb(120 10% 10%)'],
      [999, 'hwb(240 10% 10%)'],
  ],
  'monochrome': [
      [0, 'black'],
      [999, 'white'],
  ],
}

const bespokeEasings = {

    'user-steps': (val) => {

        if (val < 0.2) return 0.1;
        if (val < 0.4) return 0.3;
        if (val < 0.6) return 0.5;
        if (val < 0.8) return 0.7;
        return 0.9;
    },
    'user-repeat': (val) => (val * 4) % 1,
};

let noiseAsset = scrawl.makeNoiseAsset({

    name: 'my-noise-generator',
    width: 400,
    height: 400,

    noiseEngine: 'improved-perlin',

    colors: bespokeColors['monochrome'],
});

scrawl.makePicture({

    name: 'noisecanvas-display',

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
Scale: ${scale.value}; Size: ${size.value}
Octaves: ${octaves.value}; Sine frequency coefficient: ${sineFrequencyCoeff.value}
Persistence: ${persistence.value}; Lacunarity: ${lacunarity.value}; Sum amplitude: ${sumAmplitude.value}; Worley depth: ${worleyDepth.value}`;
});


// Create the Display cycle animation
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
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
        worleyOutput: ['worleyOutput', 'raw'],
        worleyDepth: ['worleyDepth', 'round'],
        paletteStart: ['paletteStart', 'round'],
        paletteEnd: ['paletteEnd', 'round'],
        colorSpace: ['colorSpace', 'raw'],
        returnColorAs: ['returnColorAs', 'raw'],
        cyclePalette: ['cyclePalette', 'boolean'],
        precision: ['precision', 'round'],
    },
    callback: () => noiseAsset.update(),
});

scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();

    if (e && e.target) {

        let val = e.target.value;

        noiseAsset.set({
            colors: bespokeColors[val],
        });

        noiseAsset.update();
    }
}, '#colorStops');

scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();

    let val = e.target.value;

    if (['user-steps', 'user-repeat'].includes(val)) {
        noiseAsset.set({
            easing: bespokeEasings[val],
        });
    }
    else {
        noiseAsset.set({
            easing: val,
        });
    }
    noiseAsset.update();

}, '#easing');


// Setup form
const width = document.querySelector('#width'),
    height = document.querySelector('#height'),
    octaves = document.querySelector('#octaves'),
    sineFrequencyCoeff = document.querySelector('#sineFrequencyCoeff'),
    scale = document.querySelector('#scale'),
    size = document.querySelector('#size'),
    persistence = document.querySelector('#persistence'),
    lacunarity = document.querySelector('#lacunarity'),
    sumAmplitude = document.querySelector('#sumAmplitude'),
    worleyDepth = document.querySelector('#worleyDepth'),
    noiseEngine = document.querySelector('#noiseEngine'),
    octaveFunction = document.querySelector('#octaveFunction'),
    sumFunction = document.querySelector('#sumFunction'),
    smoothing = document.querySelector('#smoothing'),
    seed = document.querySelector('#seed'),
    worleyOutput = document.querySelector('#worleyOutput'),
    paletteStart = document.querySelector('#paletteStart'),
    paletteEnd = document.querySelector('#paletteEnd'),
    precision = document.querySelector('#precision'),
    easing = document.querySelector('#easing'),
    colorStops = document.querySelector('#colorStops'),
    cyclePalette = document.querySelector('#cyclePalette'),
    colorSpace = document.querySelector('#colorSpace'),
    returnColorAs = document.querySelector('#returnColorAs');

width.value = 400;
height.value = 400;
octaves.value = 1;
sineFrequencyCoeff.value = 1;
scale.value = 50;
size.value = 256;
persistence.value = 0.5;
lacunarity.value = 2;
sumAmplitude.value = 5;
worleyDepth.value = 0;
noiseEngine.options.selectedIndex = 1;
octaveFunction.options.selectedIndex = 0;
sumFunction.options.selectedIndex = 0;
smoothing.options.selectedIndex = 23;
seed.value = 'noize';
worleyOutput.options.selectedIndex = 0;
paletteStart.value = 0;
paletteEnd.value = 999;
precision.value = 1;
colorStops.options.selectedIndex = 0;
easing.options.selectedIndex = 0;
cyclePalette.options.selectedIndex = 0;
colorSpace.options.selectedIndex = 0;
returnColorAs.options.selectedIndex = 0;


// #### Development and testing
console.log(scrawl.library);
