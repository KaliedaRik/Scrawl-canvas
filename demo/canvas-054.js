// # Demo Canvas 054 
// Animated contour lines: map a complex gradient to NoiseAsset output

// [Run code](../../demo/canvas-054.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;


// Add the NoiseAsset, and a Picture entity in which to display it
const myNoise = scrawl.makeNoiseAsset({
    name: 'base-noise',
    width: 600,
    height: 600,
    scale: 80,

    paletteStart: 399,
    paletteEnd: 999,
    choke: 50,
    precision: 1,
    delta: {
        paletteStart: -1,
        paletteEnd: -1,
    },

    cyclePalette: true,

    colorSpace: 'LAB',

    colors: [
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

scrawl.makePicture({
    name: 'base-noise-subscriber',
    asset: 'base-noise',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,

    commence: () => myNoise.update(),
});


// #### Development and testing
console.log(scrawl.library);
