// # Demo Filters 019 
// Using a Noise asset with a displace filter

// [Run code](../../demo/filters-019.html)
import scrawl from '../source/scrawl.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    noiseCanvas = scrawl.library.canvas['noise-canvas'];

scrawl.importDomImage('.flowers');


let noiseAsset = scrawl.makeNoise({

    name: 'my-noise-generator',
    width: 400,
    height: 400,

    noiseFunction: 'simplex',
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
        modularAmplitude = document.querySelector('#modularAmplitude');

    return function () {

        testMessage.textContent = `Dimensions: width - ${width.value}, height - ${height.value}
Color (monochrome): start: ${monochromeStart.value}; range: ${monochromeRange.value}
Color (hue): start: ${hueStart.value}; range: ${hueRange.value}; saturation: ${saturation.value}; luminosity: ${luminosity.value}
Scale: ${scale.value}; Size: ${size.value}
Octaves: ${octaves.value}; Sine frequency coefficient: ${sineFrequencyCoeff.value}
Persistence: ${persistence.value}; Lacunarity: ${lacunarity.value}; Modular amplitude: ${modularAmplitude.value}`;
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
        noiseFunction: ['noiseFunction', 'raw'],
        color: ['color', 'raw'],
        gradientStart: ['gradientStart', 'raw'],
        gradientEnd: ['gradientEnd', 'raw'],
        octaveFunction: ['octaveFunction', 'raw'],
        octaves: ['octaves', 'round'],
        sumFunction: ['sumFunction', 'raw'],
        sineFrequencyCoeff: ['sineFrequencyCoeff', 'float'],
        smoothing: ['smoothing', 'float'],
        scale: ['scale', 'round'],
        size: ['size', 'round'],
        seed: ['seed', 'raw'],
        persistence: ['persistence', 'float'],
        lacunarity: ['lacunarity', 'round'],
        modularAmplitude: ['modularAmplitude', 'float'],
        monochromeStart: ['monochromeStart', 'round'],
        monochromeRange: ['monochromeRange', 'round'],
        hueStart: ['hueStart', 'float'],
        hueRange: ['hueRange', 'float'],
        saturation: ['saturation', 'float'],
        luminosity: ['luminosity', 'float'],
    },
});

scrawl.addNativeListener(['input', 'change'], function (e) {

    let val = e.target.value;

    if (null != val) {

        let oFunc = document.querySelector('#octaveFunction'),
            oct = document.querySelector('#octaves'),
            sFunc = document.querySelector('#sumFunction');

        switch (val) {

            case 'plain' :
                noiseAsset.presetTo(val);
                oct.value = 1;
                oFunc.options.selectedIndex = 0;
                sFunc.options.selectedIndex = 0;
                break;

            case 'clouds' :
                noiseAsset.presetTo(val);
                oct.value = 5;
                oFunc.options.selectedIndex = 0;
                sFunc.options.selectedIndex = 0;
                break;

            case 'turbulence' :
                noiseAsset.presetTo(val);
                oct.value = 5;
                oFunc.options.selectedIndex = 1;
                sFunc.options.selectedIndex = 0;
                break;

            case 'marble' :
                noiseAsset.presetTo(val);
                oct.value = 5;
                oFunc.options.selectedIndex = 1;
                sFunc.options.selectedIndex = 1;
                break;

            case 'wood' :
                noiseAsset.presetTo(val);
                oct.value = 1;
                oFunc.options.selectedIndex = 0;
                sFunc.options.selectedIndex = 2;
                break;
        }
    }
}, '#presets');

// Setup form
document.querySelector('#width').value = 400;
document.querySelector('#height').value = 400;
document.querySelector('#noiseFunction').options.selectedIndex = 1;
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
document.querySelector('#modularAmplitude').value = 5;
document.querySelector('#presets').options.selectedIndex = 0;
document.querySelector('#monochromeStart').value = 0;
document.querySelector('#monochromeRange').value = 255;
document.querySelector('#hueStart').value = 0;
document.querySelector('#hueRange').value = 120;
document.querySelector('#saturation').value = 100;
document.querySelector('#luminosity').value = 50;


// #### Development and testing
console.log(scrawl.library);
