// # Demo Canvas 052
// Noise asset functionality

// [Run code](../../demo/canvas-052.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


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

const noiseAsset = scrawl.makeNoiseAsset({

    name: name('noise'),
    width: 400,
    height: 400,

    noiseEngine: 'improved-perlin',

/** @ts-expect-error */
    colors: bespokeColors['monochrome'],
});

scrawl.makePicture({

    name: name('noise-image'),

    width: '100%',
    height: '100%',
    copyWidth: '100%',
    copyHeight: '100%',

    asset: name('noise'),
});

// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Dimensions: width - ${dom.width.value}, height - ${dom.height.value}
    Scale: ${dom.scale.value}; Size: ${dom.size.value}
    Octaves: ${dom.octaves.value}; Sine frequency coefficient: ${dom.sineFrequencyCoeff.value}
    Persistence: ${dom.persistence.value}; Lacunarity: ${dom.lacunarity.value}
    Sum amplitude: ${dom.sumAmplitude.value}; Worley depth: ${dom.worleyDepth.value}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.makeUpdater({

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

        const val = e.target.value;

        noiseAsset.set({
            colors: bespokeColors[val],
        });

        noiseAsset.update();
    }
}, '#colorStops');

scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();

    const val = e.target.value;

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


// Set the DOM input values
const dom = initializeDomInputs([
    ['input', 'height', '400'],
    ['input', 'lacunarity', '2'],
    ['input', 'octaves', '1'],
    ['input', 'paletteEnd', '999'],
    ['input', 'paletteStart', '0'],
    ['input', 'persistence', '0.5'],
    ['input', 'precision', '1'],
    ['input', 'scale', '50'],
    ['input', 'seed', 'noize'],
    ['input', 'sineFrequencyCoeff', '1'],
    ['input', 'size', '256'],
    ['input', 'sumAmplitude', '5'],
    ['input', 'width', '400'],
    ['input', 'worleyDepth', '0'],
    ['select', 'colorSpace', 0],
    ['select', 'colorStops', 0],
    ['select', 'cyclePalette', 0],
    ['select', 'easing', 0],
    ['select', 'noiseEngine', 1],
    ['select', 'octaveFunction', 0],
    ['select', 'returnColorAs', 0],
    ['select', 'smoothing', 23],
    ['select', 'sumFunction', 0],
    ['select', 'worleyOutput', 0],
]);


// #### Development and testing
console.log(scrawl.library);
