// # Demo Canvas 053
// Display output from a Reaction-Diffusion asset

// [Run code](../../demo/canvas-053.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Magic numbers
const assetDimension = 80;


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

const reactionAsset = scrawl.makeReactionDiffusionAsset({

    name: name('my-rediff'),
    width: assetDimension,
    height: assetDimension,

/** @ts-expect-error */
    colors: colorStops['monochrome'],
});

// Test that the RD asset output is always tileable by displaying it via a Pattern style
const myPattern = scrawl.makePattern({

    name: name('my-rediff-pattern'),
    asset: reactionAsset,
});

// Display the RD asset output in a block
// + We could also display it in a Picture entity, or use it in a Filter object
scrawl.makeBlock({

    name: name('my-rediff-block'),
    dimensions: ['100%', '100%'],
    fillStyle: name('my-rediff-pattern'),
});


// Entitys that can be used by the RD asset for its initialization
// + Start positions and dimensions need to be in absolute coordinates/lengths because the RD asset will `simpleStamp` the entity onto a temporary canvas and populate the scene with the alpha channel values from the resulting ImageData object.
// ```
// ent.simpleStamp(cell, {
//     fillStyle: 'white',
//     strokeStyle: 'white',
// });
// ```
scrawl.makeBlock({
    name: name('initial-square'),
    dimensions: [30, 30],
    visibility: false,
});

scrawl.makeWheel({
    name: name('initial-circle'),
    start: [4, 4],
    radius: 15,
    lineWidth: 6,
    method: 'draw',
    visibility: false,
});

scrawl.makeSpiral({
    name: name('initial-spiral'),
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

    return `
    Generation: ${reactionAsset.get('generation')} of ${dom.maxGenerations.value}
    Initial random seed level: ${dom.initialRandomSeedLevel.value}
    Diffusion rates - A: ${dom.diffusionRateA.value}, B: ${dom.diffusionRateB.value}
    Feed rate: ${dom.feedRate.value}; Kill rate: ${dom.killRate.value}
    Asset dimensions - width: ${dom.width.value}, height: ${dom.height.value}

    Pattern matrix
        stretchX: ${myPattern.get('stretchX')}; stretchY: ${myPattern.get('stretchY')}
        skewX: ${myPattern.get('skewX')}; skewY: ${myPattern.get('skewY')}
        shiftX: ${myPattern.get('shiftX')}; shiftY: ${myPattern.get('shiftY')}`;
});


// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    commence: () => reactionAsset.update(),
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.addNativeListener('input', (e) => {

    e.preventDefault();

    if (e && e.target) {

        const val = e.target.value;

        switch (val) {

            case 'square':
                reactionAsset.set({
                    initialSettingPreference: 'entity',
                    initialSettingEntity: name('initial-square'),
                });
                break;

            case 'circle':
                reactionAsset.set({
                    initialSettingPreference: 'entity',
                    initialSettingEntity: name('initial-circle'),
                });
                break;

            case 'spiral':
                reactionAsset.set({
                    initialSettingPreference: 'entity',
                    initialSettingEntity: name('initial-spiral'),
                });
                break;

            default:
                reactionAsset.set({
                    initialSettingPreference: 'random',
                });
        }
    }
}, '#initialSettingPreference');

scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();

    if (e && e.target) {

        const val = e.target.value;

        reactionAsset.set({
            colors: colorStops[val],
        })
    }
}, '#colorStops');

scrawl.addNativeListener(['input', 'change'], (e) => {

    e.preventDefault();

    const val = e.target.value;

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

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myPattern,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        stretchX: ['stretchX', 'float'],
        skewX: ['skewX', 'float'],
        skewY: ['skewY', 'float'],
        stretchY: ['stretchY', 'float'],
        shiftX: ['shiftX', 'round'],
        shiftY: ['shiftY', 'round'],
    },
});

scrawl.makeUpdater({

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
        width: ['width', 'round'],
        height: ['height', 'round'],
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
scrawl.addNativeListener(['change', 'input'], (e) => {

    e.preventDefault();

    if (e && e.target) {

        const val = e.target.value;

        reactionAsset.set({
            preset: val,
        });

        switch (val) {

            case 'negativeBubbles':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.098';
                dom.killRate.value = '0.0555';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.05';
                break;

            case 'positiveBubbles':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.098';
                dom.killRate.value = '0.057';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.1';
                break;

            case 'precriticalBubbles':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.082';
                dom.killRate.value = '0.059';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.08';
                break;

            case 'wormsAndLoops':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.082';
                dom.killRate.value = '0.06';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.08';
                break;

            case 'stableSolitons':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.074';
                dom.killRate.value = '0.064';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.15';
                break;

            case 'uSkateWorld':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.062';
                dom.killRate.value = '0.0609';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'worms':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.058';
                dom.killRate.value = '0.065';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.1';
                break;

            case 'wormsJoinIntoMazes':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.046';
                dom.killRate.value = '0.063';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'negatons':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.046';
                dom.killRate.value = '0.0594';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'turingPatterns':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.042';
                dom.killRate.value = '0.059';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'chaosToTuringNegatons':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.039';
                dom.killRate.value = '0.058';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'fingerprints':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.037';
                dom.killRate.value = '0.06';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'chaosWithNegatons':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.0353';
                dom.killRate.value = '0.0566';
                dom.maxGenerations.value = '0';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'spotsAndWorms':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.034';
                dom.killRate.value = '0.0618';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'selfReplicatingSpots':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.03';
                dom.killRate.value = '0.063';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'superResonantMazes':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.03';
                dom.killRate.value = '0.0565';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'mazes':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.029';
                dom.killRate.value = '0.057';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'mazesWithSomeChaos':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.026';
                dom.killRate.value = '0.055';
                dom.maxGenerations.value = '0';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'chaos':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.026';
                dom.killRate.value = '0.051';
                dom.maxGenerations.value = '0';
                dom.initialRandomSeedLevel.value = '0.009';
                break;

            case 'warringMicrobes':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.022';
                dom.killRate.value = '0.059';
                dom.maxGenerations.value = '0';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'spotsAndLoops':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.018';
                dom.killRate.value = '0.051';
                dom.maxGenerations.value = '0';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'movingSpots':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.014';
                dom.killRate.value = '0.054';
                dom.maxGenerations.value = '0';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            case 'waves':
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.014';
                dom.killRate.value = '0.045';
                dom.maxGenerations.value = '0';
                dom.initialRandomSeedLevel.value = '0.0045';
                break;

            default:
                dom.diffusionRateA.value = '0.2097';
                dom.diffusionRateB.value = '0.105';
                dom.feedRate.value = '0.054';
                dom.killRate.value = '0.062';
                dom.maxGenerations.value = '4000';
                dom.initialRandomSeedLevel.value = '0.0045';
        }
    }
}, '#presets');

// Setup form
// const qs_presets = document.querySelector('#presets'),
//     qs_initialRandomSeedLevel = document.querySelector('#initialRandomSeedLevel'),
//     qs_diffusionRateA = document.querySelector('#diffusionRateA'),
//     qs_diffusionRateB = document.querySelector('#diffusionRateB'),
//     qs_feedRate = document.querySelector('#feedRate'),
//     qs_killRate = document.querySelector('#killRate'),
//     qs_drawEvery = document.querySelector('#drawEvery'),
//     qs_maxGenerations = document.querySelector('#maxGenerations'),
//     qs_canvasWidth = document.querySelector('#canvasWidth'),
//     qs_canvasHeight = document.querySelector('#canvasHeight'),
//     qs_matrixA = document.querySelector('#matrixA'),
//     qs_matrixB = document.querySelector('#matrixB'),
//     qs_matrixC = document.querySelector('#matrixC'),
//     qs_matrixD = document.querySelector('#matrixD'),
//     qs_matrixE = document.querySelector('#matrixE'),
//     qs_matrixF = document.querySelector('#matrixF'),
//     qs_initialSettingPreference = document.querySelector('#initialSettingPreference'),
//     qs_randomEngineSeed = document.querySelector('#randomEngineSeed'),
//     qs_paletteStart = document.querySelector('#paletteStart'),
//     qs_paletteEnd = document.querySelector('#paletteEnd'),
//     qs_precision = document.querySelector('#precision'),
//     qs_easing = document.querySelector('#easing'),
//     qs_colorStops = document.querySelector('#colorStops'),
//     qs_cyclePalette = document.querySelector('#cyclePalette'),
//     qs_colorSpace = document.querySelector('#colorSpace'),
//     qs_returnColorAs = document.querySelector('#returnColorAs');

// Set the DOM input values
const dom = initializeDomInputs([
    ['input', 'diffusionRateA', '0.2097'],
    ['input', 'diffusionRateB', '0.105'],
    ['input', 'feedRate', '0.054'],
    ['input', 'killRate', '0.062'],
    ['input', 'drawEvery', '10'],
    ['input', 'maxGenerations', '4000'],
    ['input', 'width', `${assetDimension}`],
    ['input', 'height', `${assetDimension}`],
    ['input', 'randomEngineSeed', reactionAsset.get('randomEngineSeed')],
    ['input', 'initialRandomSeedLevel', '0.0045'],
    ['input', 'stretchX', '1'],
    ['input', 'stretchY', '1'],
    ['input', 'skewX', '0'],
    ['input', 'skewY', '0'],
    ['input', 'shiftX', '0'],
    ['input', 'shiftY', '0'],
    ['input', 'paletteStart', '0'],
    ['input', 'paletteEnd', '999'],
    ['input', 'precision', '1'],
    ['select', 'preset', 0],
    ['select', 'initialSettingPreference', 0],
    ['select', 'colorStops', 0],
    ['select', 'cyclePalette', 0],
    ['select', 'colorSpace', 0],
    ['select', 'returnColorAs', 0],
    ['select', 'easing', 0],
]);

// /** @ts-expect-error */
// qs_presets.options.selectedIndex = 0;
// /** @ts-expect-error */
// qs_initialRandomSeedLevel.value = 0.1;
// /** @ts-expect-error */
// qs_diffusionRateA.value = 0.2097;
// /** @ts-expect-error */
// qs_diffusionRateB.value = 0.105;
// /** @ts-expect-error */
// qs_feedRate.value = 0.054;
// /** @ts-expect-error */
// qs_killRate.value = 0.062;
// /** @ts-expect-error */
// qs_drawEvery.value = 10;
// /** @ts-expect-error */
// qs_maxGenerations.value = 4000;
// /** @ts-expect-error */
// qs_canvasWidth.value = assetDimension;
// /** @ts-expect-error */
// qs_canvasHeight.value = assetDimension;
// /** @ts-expect-error */
// qs_matrixA.value = 1;
// /** @ts-expect-error */
// qs_matrixB.value = 0;
// /** @ts-expect-error */
// qs_matrixC.value = 0;
// /** @ts-expect-error */
// qs_matrixD.value = 1;
// /** @ts-expect-error */
// qs_matrixE.value = 0;
// /** @ts-expect-error */
// qs_matrixF.value = 0;
// /** @ts-expect-error */
// qs_initialSettingPreference.selectedIndex = 0;
// /** @ts-expect-error */
// qs_randomEngineSeed.value = reactionAsset.get('randomEngineSeed');
// /** @ts-expect-error */
// qs_paletteStart.value = 0;
// /** @ts-expect-error */
// qs_paletteEnd.value = 999;
// /** @ts-expect-error */
// qs_precision.value = 1;
// /** @ts-expect-error */
// qs_colorStops.options.selectedIndex = 0;
// /** @ts-expect-error */
// qs_easing.options.selectedIndex = 0;
// /** @ts-expect-error */
// qs_cyclePalette.options.selectedIndex = 0;
// /** @ts-expect-error */
// qs_colorSpace.options.selectedIndex = 0;
// /** @ts-expect-error */
// qs_returnColorAs.options.selectedIndex = 0;

// #### Development and testing
console.log(scrawl.library);
