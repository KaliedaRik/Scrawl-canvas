// # Demo Canvas 053 
// Display output from a Reaction-Diffusion asset

// [Run code](../../demo/canvas-053.html)
import {
    addNativeListener,
    library as L,
    makeBlock,
    makePattern,
    makeReactionDiffusionAsset,
    makeRender,
    makeSpiral,
    makeWheel,
    observeAndUpdate,
    setIgnorePixelRatio,
} from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
setIgnorePixelRatio(false);


// #### Scene setup
let canvas = L.artefact.mycanvas;

// Magic numbers
const canvasDimension = 400,
    assetDimension = 80;

// Make the canvas responsive
// canvas.set({
//     fit: 'cover',
//     checkForResize: true,
//     ignoreCanvasCssDimensions: true,
// }).setBase({
//     dimensions: [canvasDimension, canvasDimension],
// });


// Build and display the reaction-diffusion asset
const colorStops = {
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

const reactionAsset = makeReactionDiffusionAsset({

    name: 'reaction-diffusion-asset',
    width: assetDimension,
    height: assetDimension,

// @ts-expect-error
    colors: colorStops['monochrome'],
});

// Test that the RD asset output is always tileable by displaying it via a Pattern style
const myPattern = makePattern({

    name: 'rd-pattern',
    asset: reactionAsset,
});

// Display the RD asset output in a block
// + We could also display it in a Picture entity, or use it in a Filter object
makeBlock({

    name: 'rd-block',
    dimensions: ['100%', '100%'],
    fillStyle: 'rd-pattern',
});


// Entitys that can be used by the RD asset for its initialization
// + Start positions and dimensions need to be in absolute coordinates/lengths because the RD asset will `simpleStamp` the entity onto a temporary canvas and populate the scene with the alpha channel values from the resulting ImageData object.
// ```
// ent.simpleStamp(cell, {
//     fillStyle: 'white',
//     strokeStyle: 'white',
// });
// ```
makeBlock({
    name: 'initial-square',
    dimensions: [30, 30],
    visibility: false,
});

makeWheel({
    name: 'initial-circle',
    start: [4, 4],
    radius: 15,
    lineWidth: 6,
    method: 'draw',
    visibility: false,
});

makeSpiral({
    name: 'initial-spiral',
    loops: 5,
    loopIncrement: 8,
    drawFromLoop: 0,
    lineWidth: 3,
    method: 'draw',
    visibility: false,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

// @ts-expect-error
    const {currentGeneration, maxGenerations, initialRandomSeedLevel, diffusionRateA, diffusionRateB, feedRate, killRate, width, height} = reactionAsset;

    const mx = myPattern.patternMatrix;

    const matrixVals = (mx) ? 
        `[${mx.a}, ${mx.b}, ${mx.c}, ${mx.d}, ${mx.e}, ${mx.f}]` :
        '[]';

// @ts-expect-error
    return `    Generation: ${reactionAsset.currentGeneration} of ${reactionAsset.maxGenerations}\n    Initial random seed level: ${reactionAsset.initialRandomSeedLevel}\n    Diffusion rates - A: ${reactionAsset.diffusionRateA}, B: ${reactionAsset.diffusionRateB}\n    Feed rate: ${reactionAsset.feedRate}; Kill rate: ${reactionAsset.killRate}\n    Asset dimensions - width: ${reactionAsset.width}, height: ${reactionAsset.height}\n    Pattern matrix: ${matrixVals}`;
});


// Create the Display cycle animation
makeRender({

    name: 'demo-animation',
    target: canvas,

    commence: () => reactionAsset.update(),
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
addNativeListener('input', (e) => {

    e.preventDefault();

    if (e && e.target) {

        let val = e.target.value;

        switch (val) {

            case 'square':
                reactionAsset.set({
                    initialSettingPreference: 'entity',
                    initialSettingEntity: 'initial-square',
                });
                break;

            case 'circle':
                reactionAsset.set({
                    initialSettingPreference: 'entity',
                    initialSettingEntity: 'initial-circle',
                });
                break;

            case 'spiral':
                reactionAsset.set({
                    initialSettingPreference: 'entity',
                    initialSettingEntity: 'initial-spiral',
                });
                break;

            default: 
                reactionAsset.set({
                    initialSettingPreference: 'random',
                });
        }
    }
}, '#initialSettingPreference');

addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();

    if (e && e.target) {

        let val = e.target.value;

        reactionAsset.set({
            colors: colorStops[val],
        })
    }
}, '#colorStops');

addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();

    let val = e.target.value;

    if (['user-steps', 'user-repeat'].includes(val)) {
        reactionAsset.set({
            easing: bespokeEasings[val],
        });
    }
    else {
        reactionAsset.set({
            easing: val,
        });
    }

}, '#easing');

observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myPattern,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        matrixA: ['matrixA', 'float'],
        matrixB: ['matrixB', 'float'],
        matrixC: ['matrixC', 'float'],
        matrixD: ['matrixD', 'float'],
        matrixE: ['matrixE', 'round'],
        matrixF: ['matrixF', 'round'],
    },
});

observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: reactionAsset,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        initialRandomSeedLevel: ['initialRandomSeedLevel', 'float'],
        diffusionRateA: ['diffusionRateA', 'float'],
        diffusionRateB: ['diffusionRateB', 'float'],
        feedRate: ['feedRate', 'float'],
        killRate: ['killRate', 'float'],
        drawEvery: ['drawEvery', 'round'],
        maxGenerations: ['maxGenerations', 'round'],
        canvasWidth: ['width', 'round'],
        canvasHeight: ['height', 'round'],
        randomEngineSeed: ['randomEngineSeed', 'raw'],

        paletteStart: ['paletteStart', 'round'],
        paletteEnd: ['paletteEnd', 'round'],
        precision: ['precision', 'round'],
        cyclePalette: ['cyclePalette', 'boolean'],
        colorSpace: ['colorSpace', 'raw'],
        returnColorAs: ['returnColorAs', 'raw'],
    },
});

// This listener updates the RD asset with the selected preset value. Most of the following code is to update the the Demo's user interface
addNativeListener(['change', 'input'], (e) => {

    e.preventDefault();

    if (e && e.target) {

        let val = e.target.value;

        reactionAsset.set({
            preset: val,
        });

        switch (val) {

            case 'negativeBubbles':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.098;
// @ts-expect-error
                qs_killRate.value = 0.0555;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.05;
                break;

            case 'positiveBubbles':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.098;
// @ts-expect-error
                qs_killRate.value = 0.057;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.1;
                break;

            case 'precriticalBubbles':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.082;
// @ts-expect-error
                qs_killRate.value = 0.059;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.08;
                break;

            case 'wormsAndLoops':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.082;
// @ts-expect-error
                qs_killRate.value = 0.06;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.08;
                break;

            case 'stableSolitons':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.074;
// @ts-expect-error
                qs_killRate.value = 0.064;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.15;
                break;

            case 'uSkateWorld':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.062;
// @ts-expect-error
                qs_killRate.value = 0.0609;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'worms':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.058;
// @ts-expect-error
                qs_killRate.value = 0.065;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.1;
                break;

            case 'wormsJoinIntoMazes':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.046;
// @ts-expect-error
                qs_killRate.value = 0.063;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'negatons':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.046;
// @ts-expect-error
                qs_killRate.value = 0.0594;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'turingPatterns':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.042;
// @ts-expect-error
                qs_killRate.value = 0.059;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'chaosToTuringNegatons':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.039;
// @ts-expect-error
                qs_killRate.value = 0.058;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'fingerprints':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.037;
// @ts-expect-error
                qs_killRate.value = 0.06;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'chaosWithNegatons':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.0353;
// @ts-expect-error
                qs_killRate.value = 0.0566;
// @ts-expect-error
                qs_maxGenerations.value = 0;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'spotsAndWorms':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.034;
// @ts-expect-error
                qs_killRate.value = 0.0618;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'selfReplicatingSpots':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.03;
// @ts-expect-error
                qs_killRate.value = 0.063;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'superResonantMazes':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.03;
// @ts-expect-error
                qs_killRate.value = 0.0565;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'mazes':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.029;
// @ts-expect-error
                qs_killRate.value = 0.057;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'mazesWithSomeChaos':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.026;
// @ts-expect-error
                qs_killRate.value = 0.055;
// @ts-expect-error
                qs_maxGenerations.value = 0;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'chaos':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.026;
// @ts-expect-error
                qs_killRate.value = 0.051;
// @ts-expect-error
                qs_maxGenerations.value = 0;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.009;
                break;

            case 'warringMicrobes':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.022;
// @ts-expect-error
                qs_killRate.value = 0.059;
// @ts-expect-error
                qs_maxGenerations.value = 0;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'spotsAndLoops':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.018;
// @ts-expect-error
                qs_killRate.value = 0.051;
// @ts-expect-error
                qs_maxGenerations.value = 0;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'movingSpots':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.014;
// @ts-expect-error
                qs_killRate.value = 0.054;
// @ts-expect-error
                qs_maxGenerations.value = 0;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'waves':
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.014;
// @ts-expect-error
                qs_killRate.value = 0.045;
// @ts-expect-error
                qs_maxGenerations.value = 0;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            default: 
// @ts-expect-error
                qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
                qs_diffusionRateB.value = 0.105;
// @ts-expect-error
                qs_feedRate.value = 0.054;
// @ts-expect-error
                qs_killRate.value = 0.062;
// @ts-expect-error
                qs_maxGenerations.value = 4000;
// @ts-expect-error
                qs_initialRandomSeedLevel.value = 0.0045;
        }
    }
}, '#presets');

// Setup form
const qs_presets = document.querySelector('#presets'),
    qs_initialRandomSeedLevel = document.querySelector('#initialRandomSeedLevel'),
    qs_diffusionRateA = document.querySelector('#diffusionRateA'),
    qs_diffusionRateB = document.querySelector('#diffusionRateB'),
    qs_feedRate = document.querySelector('#feedRate'),
    qs_killRate = document.querySelector('#killRate'),
    qs_drawEvery = document.querySelector('#drawEvery'),
    qs_maxGenerations = document.querySelector('#maxGenerations'),
    qs_canvasWidth = document.querySelector('#canvasWidth'),
    qs_canvasHeight = document.querySelector('#canvasHeight'),
    qs_matrixA = document.querySelector('#matrixA'),
    qs_matrixB = document.querySelector('#matrixB'),
    qs_matrixC = document.querySelector('#matrixC'),
    qs_matrixD = document.querySelector('#matrixD'),
    qs_matrixE = document.querySelector('#matrixE'),
    qs_matrixF = document.querySelector('#matrixF'),
    qs_initialSettingPreference = document.querySelector('#initialSettingPreference'),
    qs_randomEngineSeed = document.querySelector('#randomEngineSeed'),
    qs_paletteStart = document.querySelector('#paletteStart'),
    qs_paletteEnd = document.querySelector('#paletteEnd'),
    qs_precision = document.querySelector('#precision'),
    qs_easing = document.querySelector('#easing'),
    qs_colorStops = document.querySelector('#colorStops'),
    qs_cyclePalette = document.querySelector('#cyclePalette'),
    qs_colorSpace = document.querySelector('#colorSpace'),
    qs_returnColorAs = document.querySelector('#returnColorAs');


// @ts-expect-error
qs_presets.options.selectedIndex = 0;
// @ts-expect-error
qs_initialRandomSeedLevel.value = 0.1;
// @ts-expect-error
qs_diffusionRateA.value = 0.2097;
// @ts-expect-error
qs_diffusionRateB.value = 0.105;
// @ts-expect-error
qs_feedRate.value = 0.054;
// @ts-expect-error
qs_killRate.value = 0.062;
// @ts-expect-error
qs_drawEvery.value = 10;
// @ts-expect-error
qs_maxGenerations.value = 4000;
// @ts-expect-error
qs_canvasWidth.value = assetDimension;
// @ts-expect-error
qs_canvasHeight.value = assetDimension;
// @ts-expect-error
qs_matrixA.value = 1;
// @ts-expect-error
qs_matrixB.value = 0;
// @ts-expect-error
qs_matrixC.value = 0;
// @ts-expect-error
qs_matrixD.value = 1;
// @ts-expect-error
qs_matrixE.value = 0;
// @ts-expect-error
qs_matrixF.value = 0;
// @ts-expect-error
qs_initialSettingPreference.selectedIndex = 0;
// @ts-expect-error
qs_randomEngineSeed.value = reactionAsset.get('randomEngineSeed');
// @ts-expect-error
qs_paletteStart.value = 0;
// @ts-expect-error
qs_paletteEnd.value = 999;
// @ts-expect-error
qs_precision.value = 1;
// @ts-expect-error
qs_colorStops.options.selectedIndex = 0;
// @ts-expect-error
qs_easing.options.selectedIndex = 0;
// @ts-expect-error
qs_cyclePalette.options.selectedIndex = 0;
// @ts-expect-error
qs_colorSpace.options.selectedIndex = 0;
// @ts-expect-error
qs_returnColorAs.options.selectedIndex = 0;

// #### Development and testing
console.log(L);
