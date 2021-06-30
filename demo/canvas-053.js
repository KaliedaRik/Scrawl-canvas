// # Demo Canvas 053 
// Display output from a Reaction-Diffusion asset

// [Run code](../../demo/canvas-053.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Magic numbers
const canvasDimension = 400,
    assetDimension = 80;


// Make the canvas responsive
canvas.set({
    fit: 'cover',
    checkForResize: true,
}).setBase({
    dimensions: [canvasDimension, canvasDimension],
});


// Build and display the reaction-diffusion asset
const reactionAsset = scrawl.makeReactionDiffusionAsset({

    name: 'reaction-diffusion-asset',
    width: assetDimension,
    height: assetDimension,
});

// Test that the RD asset output is always tileable by displaying it via a Pattern style
scrawl.makePattern({

    name: 'rd-pattern',
    asset: reactionAsset,
});

// Display the RD asset output in a block
// + We could also display it in a Picture entity, or use it in a Filter object
scrawl.makeBlock({

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
scrawl.makeBlock({
    name: 'initial-square',
    dimensions: [30, 30],
    visibility: false,
});

scrawl.makeWheel({
    name: 'initial-circle',
    start: [4, 4],
    radius: 15,
    lineWidth: 6,
    method: 'draw',
    visibility: false,
});

scrawl.makeSpiral({
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
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
    Generation: ${reactionAsset.currentGeneration} of ${reactionAsset.maxGenerations}
    Initial random seed level: ${reactionAsset.initialRandomSeedLevel}
    Diffusion rates - A: ${reactionAsset.diffusionRateA}, B: ${reactionAsset.diffusionRateB}
    Feed rate: ${reactionAsset.feedRate}; Kill rate: ${reactionAsset.killRate}
    Asset dimensions - width: ${reactionAsset.width}, height: ${reactionAsset.height}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,

    commence: () => reactionAsset.update(),
    afterShow: report,
});


// #### User interaction
// Setup form observer functionality
scrawl.addNativeListener('input', (e) => {

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

scrawl.observeAndUpdate({

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
        color: ['color', 'raw'],
        gradientStart: ['gradientStart', 'raw'],
        gradientEnd: ['gradientEnd', 'raw'],
        monochromeStart: ['monochromeStart', 'round'],
        monochromeRange: ['monochromeRange', 'round'],
        hueStart: ['hueStart', 'float'],
        hueRange: ['hueRange', 'float'],
        saturation: ['saturation', 'float'],
        luminosity: ['luminosity', 'float'],
        randomEngineSeed: ['randomEngineSeed', 'raw'],
    },
});

// This listener updates the RD asset with the selected preset value. Most of the following code is to update the the Demo's user interface
scrawl.addNativeListener(['change', 'input'], (e) => {

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
    qs_color = document.querySelector('#color'),
    qs_gradientStart = document.querySelector('#gradientStart'),
    qs_gradientEnd = document.querySelector('#gradientEnd'),
    qs_monochromeStart = document.querySelector('#monochromeStart'),
    qs_monochromeRange = document.querySelector('#monochromeRange'),
    qs_hueStart = document.querySelector('#hueStart'),
    qs_hueRange = document.querySelector('#hueRange'),
    qs_saturation = document.querySelector('#saturation'),
    qs_luminosity = document.querySelector('#luminosity'),
    qs_initialSettingPreference = document.querySelector('#initialSettingPreference'),
    qs_randomEngineSeed = document.querySelector('#randomEngineSeed');

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
qs_color.options.selectedIndex = 0;
qs_gradientStart.value = '#ff0000';
qs_gradientEnd.value = '#00ff00';
qs_monochromeStart.value = 0;
qs_monochromeRange.value = 255;
qs_hueStart.value = 0;
qs_hueRange.value = 120;
qs_saturation.value = 100;
qs_luminosity.value = 50;
qs_initialSettingPreference.selectedIndex = 0;
qs_randomEngineSeed.value = reactionAsset.get('randomEngineSeed');

// #### Development and testing
console.log(scrawl.library);
