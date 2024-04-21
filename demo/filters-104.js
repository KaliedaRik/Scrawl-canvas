// # Demo Filters 104
// Compound filters: Use a white-transparent gradient as a filter input

// [Run code](../../demo/filters-104.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, initializeDomInputs } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// #### Gradients and pattern definitions
// We display the gradients in a Block entity, in a dedicated Cell
// + The Cell will act as a pattern source for entitys elsewhere
// + Because we're using it as a pattern, the Cell comes with a pattern matrix
// + The pattern matrix lets us warp and stretch the pattern to meet our needs
const patternCell = canvas.buildCell({

    name: name('bar-cell-pattern'),
    dimensions: [80, 80],
    shown: false,
    skewX: 0,
    stretchX: 1,
    shiftX: 0,
    skewY: 0,
    stretchY: 1,
    shiftY: 0,
});

const barGradient = scrawl.makeGradient({

    name: name('bar-cell-gradient'),
    endX: '100%',

    colors: [
        [0, 'transparent'],
        [199, 'transparent'],
        [499, 'white'],
        [799, 'transparent'],
        [999, 'transparent'],
    ],
});

const ringGradient = scrawl.makeRadialGradient({

    name: name('ring-cell-gradient'),
    startX: '50%',
    startY: '50%',
    endX: '50%',
    endY: '50%',

    startRadius: '0%',
    endRadius: '50%',

    colors: [
        [0, 'transparent'],
        [199, 'transparent'],
        [499, 'white'],
        [799, 'transparent'],
        [999, 'transparent'],
    ],
});

const updateGradients = (items) => {

    barGradient.set(items);
    ringGradient.set(items);
};

const filterBlock = scrawl.makeBlock({

    name: name('bar-cell-box'),
    group: name('bar-cell-pattern'),
    dimensions: ['100%', '100%'],
    fillStyle: name('bar-cell-gradient'),
});


// #### Build an image source for our compound filter
// We can use anything that generates image data as part of our filter
// + This includes a new Cell, which will display a Block entity
// + The Block entity uses our pattern Cell for its `fillStyle` attribute
const filterCell = canvas.buildCell({

    name: name('bar-cell'),
    dimensions: ['100%', '100%'],
    shown: false,
});

scrawl.makeBlock({

    name: name('bar-base-box'),
    group: name('bar-cell'),
    dimensions: ['100%', '100%'],
    fillStyle: name('bar-cell-pattern'),
});


// #### Filter definitions
// Define our filters - we'll populate them with actions data later
const glassBarsFilter = scrawl.makeFilter({ name: name('glass-bars') }),
    displaceBarsFilter = scrawl.makeFilter({ name: name('displace-bars') }),
    etchingFilter = scrawl.makeFilter({ name: name('etching') }),
    greenMonitorFilter = scrawl.makeFilter({ name: name('green-monitor') });

// We define some variables and helper functions here, to cut down on code
let fOffsetX = 0,
    fOffsetY = 0,
    fOpacity = 1,
    fBlend = 'multiply',
    fDisplaceX = 10,
    fDisplaceY = 10;

// All the examples make use of the gradient pattern; this filter loads it into the engine
const getProcessImageFilter = () => {
    return [{
        action: 'process-image',
        asset: name('bar-cell'),
        width: '100%',
        height: '100%',
        copyWidth: '100%',
        copyHeight: '100%',
        lineOut: 'bars',
    }];
};

// Three of the examples use a blend filter to merge the gradient pattern into the image
const getBlendFilter = () => {
    return [{
        action: 'blend',
        lineMix: 'bars',
        blend: fBlend,
        offsetX: fOffsetX,
        offsetY: fOffsetY,
        opacity: fOpacity,
    }];
};

// This uses the gradient pattern as a displacement map for the displace filter
const getDisplaceFilter = () => {
    return [{
        action: 'displace',
        lineMix: 'bars',
        offsetX: fOffsetX,
        offsetY: fOffsetY,
        opacity: fOpacity,
        scaleX: fDisplaceX,
        scaleY: fDisplaceY,
    }];
};

// Several filters require the image to be grayscaled at the start of the processing chain
const getGrayscaleFilter = () => {
    return [{
        action: 'grayscale',
    }];
};

// Filters to configure the image (make it green) before applying the blend filter
const getMonitorFilter = () => {
    return [{
        action: 'modulate-channels',
        red: 0,
        green: 1.3,
        blue: 0,
    }];
};

// Filters to configure the image (give it a black-white drawing effect) before applying the blend filter
const getEtchFilter = () => {
    return [{
        action: 'gaussian-blur',
        radius: 1,
    }, {
        action: 'matrix',
        weights: [1, 1, 1, 1, -8, 1, 1, 1, 1],
    }, {
        action: 'invert-channels',
    }, {
        action: 'threshold',
        level: 252,
    }];
};

// Helper function to update filter action arrays with user choices
const updateFilters = () => {

    glassBarsFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getBlendFilter(),
        ],
    });

    displaceBarsFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getDisplaceFilter(),
        ],
    });

    etchingFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getGrayscaleFilter(),
            ...getEtchFilter(),
            ...getBlendFilter(),
        ],
    });

    greenMonitorFilter.set({
        actions: [
            ...getProcessImageFilter(),
            ...getGrayscaleFilter(),
            ...getMonitorFilter(),
            ...getBlendFilter(),
        ],
    });
};

// Initial filter build
updateFilters();


// #### Build the scene
// We need something to apply our filters to
const target = scrawl.makePicture({

    name: name('target-image'),

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: [name('glass-bars')],
});

// Add some Drag-and-Drop image loading functionality
// + So users can check the filter effects against different images
addImageDragAndDrop(canvas, `#${namespace} .assets`, target);


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    return `
    Filter dimensions - width: ${dom.filter_width.value}%, height: ${dom.filter_height.value}%
    Filter offset - x: ${dom.filter_offset_x.value}px, y: ${dom.filter_offset_y.value}px
    Pattern dimensions - width: ${dom.pattern_width.value}px, height: ${dom.pattern_height.value}px
    Pattern matrix - shiftX: ${dom.shiftX.value}, shiftY: ${dom.shiftY.value}, skewX: ${dom.skewX.value}, skewY: ${dom.skewY.value}, stretchX: ${dom.stretchX.value}, stretchY: ${dom.stretchY.value}
    Displace filter scaling - x: ${dom.filter_scale_x.value}, y: ${dom.filter_scale_y.value}
    Opacity: ${dom.opacity.value}`;
});

// Create the Display cycle animation
scrawl.makeRender({

    name: name('animation'),
    target: canvas,
    afterShow: report,
});


// #### User interaction
// Setup form
const dom = initializeDomInputs([
    ['input', 'opacity', '1'],
    ['input', 'skewX', '0'],
    ['input', 'skewY', '0'],
    ['input', 'stretchX', '1'],
    ['input', 'stretchY', '1'],
    ['input', 'shiftX', '0'],
    ['input', 'shiftY', '0'],
    ['input', 'pattern_width', '80'],
    ['input', 'pattern_height', '80'],
    ['input', 'filter_width', '100'],
    ['input', 'filter_height', '100'],
    ['input', 'filter_offset_x', '0'],
    ['input', 'filter_offset_y', '0'],
    ['input', 'filter_scale_x', '10'],
    ['input', 'filter_scale_y', '10'],
    ['select', 'filterEffect', 0],
    ['select', 'patternGradient', 0],
    ['select', 'easing', 0],
    ['select', 'blend', 8],
]);


// Update pattern values
scrawl.makeUpdater({

    event: ['change', 'input'],
    origin: '.patternCell',

    target: patternCell,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        pattern_width: ['width', 'round'],
        pattern_height: ['height', 'round'],
        shiftX: ['shiftX', 'round'],
        shiftY: ['shiftY', 'round'],
        skewX: ['skewX', 'float'],
        skewY: ['skewY', 'float'],
        stretchX: ['stretchX', 'float'],
        stretchY: ['stretchY', 'float'],
    },
});


// Update filter dimensions
scrawl.makeUpdater({

    event: ['change', 'input'],
    origin: '.filterCell',

    target: filterCell,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        filter_width: ['width', '%'],
        filter_height: ['height', '%'],
    },
});


// Update gradient choice
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    filterBlock.set({
        fillStyle: name(value),
    });
}, '.filterBlock');


// Update filter offset, opacity, blend choices
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    switch (t.id) {

        case 'filter_offset_x' :
            fOffsetX = parseInt(value, 10);
            break;

        case 'filter_offset_y' :
            fOffsetY = parseInt(value, 10);
            break;

        case 'filter_scale_x' :
            fDisplaceX = parseInt(value, 10);
            break;

        case 'filter_scale_y' :
            fDisplaceY = parseInt(value, 10);
            break;

        case 'opacity' :
            fOpacity = parseFloat(value);
            break;

        case 'blend' :
            fBlend = value;
            break;
    }
    updateFilters();

}, '.filterObject');


// Update gradient easing
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    updateGradients({
        easing: value,
    });

}, '.gradient');


// #### Changing the filter effect
// We do quite a bit of work here to set things up for the example's initial display
// + This includes setting the user controls to match the initial settings
scrawl.addNativeListener(['change', 'input'], (e) => {

    const t = e.target,
        value = t.value;

    switch (value) {

        case 'glass-bars' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'multiply';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: 0,
                skewY: 0,
                stretchX: 1,
                stretchY: 1,
            });

            filterBlock.set({
                fillStyle: name('bar-cell-gradient'),
            });

            dom.skewX.value = 0;
            dom.skewY.value = 0;
            dom.stretchX.value = 1;
            dom.stretchY.value = 1;
            dom.shiftX.value = 0;
            dom.shiftY.value = 0;
            dom.blend.value = 'multiply';
            dom.patternGradient.value = 'bar-cell-gradient';
            dom.pattern_width.value = 80;
            dom.pattern_height.value = 80;

            break;

        case 'displace-bars' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'multiply';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: 0,
                skewY: 0,
                stretchX: 1,
                stretchY: 1,
            });

            filterBlock.set({
                fillStyle: name('ring-cell-gradient'),
            });

            dom.skewX.value = 0;
            dom.skewY.value = 0;
            dom.stretchX.value = 1;
            dom.stretchY.value = 1;
            dom.shiftX.value = 0;
            dom.shiftY.value = 0;
            dom.blend.value = 'multiply';
            dom.patternGradient.value = 'ring-cell-gradient';
            dom.pattern_width.value = 80;
            dom.pattern_height.value = 80;

            break;

        case 'etching' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'screen';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: -0.65,
                skewY: -0.31,
                stretchX: 1,
                stretchY: 0.26,
            });

            filterBlock.set({
                fillStyle: name('bar-cell-gradient'),
            });

            dom.skewX.value = -0.65;
            dom.skewY.value = -0.31;
            dom.stretchX.value = 1;
            dom.stretchY.value = 0.26;
            dom.shiftX.value = 0;
            dom.shiftY.value = 0;
            dom.blend.value = 'screen';
            dom.patternGradient.value = 'bar-cell-gradient';
            dom.pattern_width.value = 80;
            dom.pattern_height.value = 80;

            break;

        case 'green-monitor' :
            fOffsetX = 0;
            fOffsetY = 0;
            fOpacity = 1;
            fBlend = 'luminosity';
            fDisplaceX = 10;
            fDisplaceY = 10;

            patternCell.set({
                width: 80,
                height: 80,
                shiftX: 0,
                shiftY: 0,
                skewX: 1.04,
                skewY: 0.05,
                stretchX: 0.35,
                stretchY: 0,
            });

            filterBlock.set({
                fillStyle: name('bar-cell-gradient'),
            });

            dom.skewX.value = 1.04;
            dom.skewY.value = 0.05;
            dom.stretchX.value = 0.35;
            dom.stretchY.value = 0;
            dom.shiftX.value = 0;
            dom.shiftY.value = 0;
            dom.blend.value = 'luminosity';
            dom.patternGradient.value = 'bar-cell-gradient';
            dom.pattern_width.value = 80;
            dom.pattern_height.value = 80;

            break;
    }

    filterCell.set({
        width: '100%',
        height: '100%',
    });

    updateFilters();

    updateGradients({
        easing: 'linear',
    });

    dom.opacity.value = 1;
    dom.filter_width.value = 100;
    dom.filter_height.value = 100;
    dom.filter_offset_x.value = 0;
    dom.filter_offset_y.value = 0;
    dom.filter_scale_x.value = 10;
    dom.filter_scale_y.value = 10;
    dom.easing.value = 'linear';

/** @ts-expect-error */
    target.clearFilters().addFilters(name(value));

}, '.filterEffect');




// #### Development and testing
console.log(scrawl.library);
