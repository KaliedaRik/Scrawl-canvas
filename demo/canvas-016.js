// # Demo Canvas 016
// CSS predefined color space strings - srgb, srgb-linear, display-p3, a98-rgb, prophoto-rgb, rec2020, xyz-d50, xyz-d65, xyz

// [Run code](../../demo/canvas-016.html)
import * as scrawl from '../source/scrawl.js';


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;

const width = canvas.get('width');

const data = [
    ['srgb', 'color(srgb 0.5 1 0.25)', 'color(srgb 20% 0.6 100%)', 'color(srgb 0.5 0 1 / 0.5)'],
    ['srgb-linear', 'color(srgb-linear 0.5 1 0.25)', 'color(srgb-linear 20% 0.6 100%)', 'color(srgb-linear 0.5 0 1 / 0.5)'],
    ['display-p3', 'color(display-p3 0.5 1 0.25)', 'color(display-p3 20% 0.6 100%)', 'color(display-p3 0.5 0 1 / 0.5)'],
    ['a98-rgb', 'color(a98-rgb 0.5 1 0.25)', 'color(a98-rgb 20% 0.6 100%)', 'color(a98-rgb 0.5 0 1 / 0.5)'],
    ['prophoto-rgb', 'color(prophoto-rgb 0.5 1 0.25)', 'color(prophoto-rgb 20% 0.6 100%)', 'color(prophoto-rgb 0.5 0 1 / 0.5)'],
    ['rec2020', 'color(rec2020 0.5 1 0.25)', 'color(rec2020 20% 0.6 100%)', 'color(rec2020 0.5 0 1 / 0.5)'],
    ['xyz-d50', 'color(xyz-d50 0.5 1 0.25)', 'color(xyz-d50 20% 0.6 100%)', 'color(xyz-d50 0.5 0 1 / 0.5)'],
    ['xyz-d65', 'color(xyz-d65 0.5 1 0.25)', 'color(xyz-d65 20% 0.6 100%)', 'color(xyz-d65 0.5 0 1 / 0.5)'],
    ['xyz', 'color(xyz 0.5 1 0.25)', 'color(xyz 20% 0.6 100%)', 'color(xyz 0.5 0 1 / 0.5)'],
    ['malformed', 'color(rec2020 0.5 1.2 0.25)', 'color(srgb 0.5 1.2 0.25)', 'color(display-p3 0.5 1.2 0.25)'],
];

const len = data.length;
const blockWidth = ((width * 0.9) / len) - 10;

data.forEach((d, index) => {

    const [label, top, mid, base] = d;

    scrawl.makeBlock({
        name: `${label}-top`,
        startX: (blockWidth * index) + (index * 10) + 10,
        startY: '10%',
        width: blockWidth,
        height: '28%',
        fillStyle: top,
    }).clone({
        name: `${label}-mid`,
        startY: '40%',
        fillStyle: mid,
    }).clone({
        name: `${label}-base`,
        startY: '70%',
        fillStyle: base,
    });

    scrawl.makeLabel({
        name: `label-${label}-main`,
        text: label,
        accessibleText: 'Color strings of type: §',
        startX: (blockWidth * index) + (index * 10) + 10,
        startY: '3%',
    });

    scrawl.makeLabel({
        name: `label-${label}-top`,
        pivot: `${label}-top`,
        lockTo: 'pivot',
        text: top,
        accessibleText: 'Color generated: §',
        fillStyle: 'black',
        shadowColor: 'gray',
        shadowOffsetY: 1,
        roll: 53,
        order: 1,
    }).clone({
        name: `label-${label}-mid`,
        pivot: `${label}-mid`,
        text: mid,
    }).clone({
        name: `label-${label}-base`,
        pivot: `${label}-base`,
        text: base,
    });
});


// #### Scene animation
const shutdownRender = () => {

    if (scrawl.library.fontfamilymetadatanames.includes('100px sans-serif')) myRender.halt();
    else console.log('... waiting for font to load');
}

const myRender = scrawl.makeRender({

    name: `render`,
    target: canvas,
    afterShow: shutdownRender,
});


// #### Development and testing
console.log(scrawl.library);
