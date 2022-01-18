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
canvas.set({
    fit: 'cover',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
}).setBase({
    dimensions: [canvasDimension, canvasDimension],
});


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

    const {currentGeneration, maxGenerations, initialRandomSeedLevel, diffusionRateA, diffusionRateB, feedRate, killRate, width, height} = reactionAsset;

    const mx = myPattern.patternMatrix;

    const matrixVals = (mx) ? 
        `[${mx.a}, ${mx.b}, ${mx.c}, ${mx.d}, ${mx.e}, ${mx.f}]` :
        '[]';

    return `    Generation: ${reactionAsset.currentGeneration} of ${reactionAsset.maxGenerations}
    Initial random seed level: ${reactionAsset.initialRandomSeedLevel}
    Diffusion rates - A: ${reactionAsset.diffusionRateA}, B: ${reactionAsset.diffusionRateB}
    Feed rate: ${reactionAsset.feedRate}; Kill rate: ${reactionAsset.killRate}
    Asset dimensions - width: ${reactionAsset.width}, height: ${reactionAsset.height}
    Pattern matrix: ${matrixVals}`;
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
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.098;
                qs_killRate.value = 0.0555;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.05;
                break;

            case 'positiveBubbles':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.098;
                qs_killRate.value = 0.057;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.1;
                break;

            case 'precriticalBubbles':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.082;
                qs_killRate.value = 0.059;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.08;
                break;

            case 'wormsAndLoops':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.082;
                qs_killRate.value = 0.06;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.08;
                break;

            case 'stableSolitons':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.074;
                qs_killRate.value = 0.064;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.15;
                break;

            case 'uSkateWorld':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.062;
                qs_killRate.value = 0.0609;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'worms':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.058;
                qs_killRate.value = 0.065;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.1;
                break;

            case 'wormsJoinIntoMazes':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.046;
                qs_killRate.value = 0.063;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'negatons':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.046;
                qs_killRate.value = 0.0594;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'turingPatterns':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.042;
                qs_killRate.value = 0.059;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'chaosToTuringNegatons':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.039;
                qs_killRate.value = 0.058;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'fingerprints':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.037;
                qs_killRate.value = 0.06;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'chaosWithNegatons':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.0353;
                qs_killRate.value = 0.0566;
                qs_maxGenerations.value = 0;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'spotsAndWorms':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.034;
                qs_killRate.value = 0.0618;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'selfReplicatingSpots':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.03;
                qs_killRate.value = 0.063;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'superResonantMazes':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.03;
                qs_killRate.value = 0.0565;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'mazes':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.029;
                qs_killRate.value = 0.057;
                qs_maxGenerations.value = 4000;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'mazesWithSomeChaos':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.026;
                qs_killRate.value = 0.055;
                qs_maxGenerations.value = 0;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'chaos':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.026;
                qs_killRate.value = 0.051;
                qs_maxGenerations.value = 0;
                qs_initialRandomSeedLevel.value = 0.009;
                break;

            case 'warringMicrobes':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.022;
                qs_killRate.value = 0.059;
                qs_maxGenerations.value = 0;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'spotsAndLoops':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.018;
                qs_killRate.value = 0.051;
                qs_maxGenerations.value = 0;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'movingSpots':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.014;
                qs_killRate.value = 0.054;
                qs_maxGenerations.value = 0;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            case 'waves':
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.014;
                qs_killRate.value = 0.045;
                qs_maxGenerations.value = 0;
                qs_initialRandomSeedLevel.value = 0.0045;
                break;

            default: 
                qs_diffusionRateA.value = 0.2097;
                qs_diffusionRateB.value = 0.105;
                qs_feedRate.value = 0.054;
                qs_killRate.value = 0.062;
                qs_maxGenerations.value = 4000;
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


qs_presets.options.selectedIndex = 0;
qs_initialRandomSeedLevel.value = 0.1;
qs_diffusionRateA.value = 0.2097;
qs_diffusionRateB.value = 0.105;
qs_feedRate.value = 0.054;
qs_killRate.value = 0.062;
qs_drawEvery.value = 10;
qs_maxGenerations.value = 4000;
qs_canvasWidth.value = assetDimension;
qs_canvasHeight.value = assetDimension;
qs_matrixA.value = 1;
qs_matrixB.value = 0;
qs_matrixC.value = 0;
qs_matrixD.value = 1;
qs_matrixE.value = 0;
qs_matrixF.value = 0;
qs_initialSettingPreference.selectedIndex = 0;
qs_randomEngineSeed.value = reactionAsset.get('randomEngineSeed');
qs_paletteStart.value = 0;
qs_paletteEnd.value = 999;
qs_precision.value = 1;
qs_colorStops.options.selectedIndex = 0;
qs_easing.options.selectedIndex = 0;
qs_cyclePalette.options.selectedIndex = 0;
qs_colorSpace.options.selectedIndex = 0;
qs_returnColorAs.options.selectedIndex = 0;

// #### Development and testing
console.log(L);
