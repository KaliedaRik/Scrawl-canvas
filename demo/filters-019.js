// # Demo Filters 019 
// Using a Noise asset with a displace filter

// [Run code](../../demo/filters-019.html)
import scrawl from '../source/scrawl.js';

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
let report = function () {

    let testMessage = document.querySelector('#reportmessage'),
        width = document.querySelector('#width'),
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

    return function () {

        testMessage.textContent = `Dimensions: width - ${width.value}, height - ${height.value}
Color (monochrome): start: ${monochromeStart.value}; range: ${monochromeRange.value}
Color (hue): start: ${hueStart.value}; range: ${hueRange.value}; saturation: ${saturation.value}; luminosity: ${luminosity.value}
Scale: ${scale.value}; Size: ${size.value}
Octaves: ${octaves.value}; Sine frequency coefficient: ${sineFrequencyCoeff.value}
Persistence: ${persistence.value}; Lacunarity: ${lacunarity.value}; Sum amplitude: ${sumAmplitude.value}; Worley depth: ${worleyDepth.value}`;
    };
}();


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

    let val = e.target.value,
        sfc = document.querySelector('#sineFrequencyCoeff'),
        ma = document.querySelector('#sumAmplitude');

    if (val === 'sine' || val === 'sine-x' || val === 'sine-y') {

        sfc.removeAttribute('disabled');
        ma.setAttribute('disabled', 'true');
    }
    else if (val === 'modular' || val === 'random') {

        sfc.setAttribute('disabled', 'true');
        ma.removeAttribute('disabled');
    }
    else {

        sfc.setAttribute('disabled', 'true');
        ma.setAttribute('disabled', 'true');
    }

}, '#sumFunction');

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = e.target.value,
        s = document.querySelector('#smoothing');

    if (val === 'simplex') s.setAttribute('disabled', 'true');
    else s.removeAttribute('disabled');

}, '#noiseEngine');

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = parseFloat(e.target.value),
        p = document.querySelector('#persistence'),
        l = document.querySelector('#lacunarity');

    if (val > 1) {
        p.removeAttribute('disabled');
        l.removeAttribute('disabled');
    }
    else {
        p.setAttribute('disabled', 'true');
        l.setAttribute('disabled', 'true');
    }
}, '#octaves');

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
document.querySelector('#noiseEngine').options.selectedIndex = 1;
document.querySelector('#color').options.selectedIndex = 0;
document.querySelector('#gradientStart').value = '#ff0000';
document.querySelector('#gradientEnd').value = '#00ff00';
document.querySelector('#octaveFunction').options.selectedIndex = 0;
document.querySelector('#octaves').value = 1;
document.querySelector('#sumFunction').options.selectedIndex = 0;
document.querySelector('#sineFrequencyCoeff').value = 1;
document.querySelector('#smoothing').options.selectedIndex = 3;
document.querySelector('#scale').value = 50;
document.querySelector('#size').value = 256;
document.querySelector('#seed').value = 'noize';
document.querySelector('#persistence').value = 0.5;
document.querySelector('#lacunarity').value = 2;
document.querySelector('#sumAmplitude').value = 5;
document.querySelector('#monochromeStart').value = 0;
document.querySelector('#monochromeRange').value = 255;
document.querySelector('#hueStart').value = 0;
document.querySelector('#hueRange').value = 120;
document.querySelector('#saturation').value = 100;
document.querySelector('#luminosity').value = 50;
document.querySelector('#worleyOutput').options.selectedIndex = 0;
document.querySelector('#worleyDepth').value = 0;


// #### Development and testing
console.log(scrawl.library);
