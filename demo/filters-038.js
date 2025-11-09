// # Demo Filters 038
// Using the matrix filter to create directional blur effects

// [Run code](../../demo/filters-038.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop, addCheckerboardBackground } from './utilities.js';


// #### Scene setup
const canvas = scrawl.findCanvas('mycanvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// Create the filters
const matrix = scrawl.makeFilter({

    name: name('matrix'),
    actions: [{
        action: 'matrix',
        width: 9,
        height: 1,
        offsetX: 4,
        offsetY: 0,
        weights: [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9],
        includeAlpha: false,
    }],
});

const action = matrix.actions[0];

// Build a directional 2D kernel by rasterizing a line through the center.
// + length = total tap count (odd). angleDeg measured CCW, 0° = +X (to the right).
// + profile: "box" | "gauss". sigma used only for gauss (in taps, e.g. length/3).
const makeDirectionalKernel = (length, angleDeg, profile = "box", sigma = length / 3) => {

    if (length % 2 === 0) length += 1;

    const r = (length - 1) >> 1,
        size = 2 * r + 1;

    const cx = r,
        cy = r;

    const theta = angleDeg * Math.PI / 180;

    const dx = Math.cos(theta), dy = Math.sin(theta),
        x0 = cx - r * dx, y0 = cy - r * dy,
        x1 = cx + r * dx, y1 = cy + r * dy;

    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0,
        wx = (x1 - x0) / steps, wy = (y1 - y0) / steps;

    const weights = new Float32Array(size * size);

    const hits = [];

    let ax = x0,
        ay = y0,
        i, xi, yi, idx;

    for (i = 0; i <= steps; i++, ax += wx, ay += wy) {

        xi = Math.round(ax);
        yi = Math.round(ay);

        idx = yi * size + xi;

        if (xi >= 0 && xi < size && yi >= 0 && yi < size) hits.push({ idx, t: i - steps / 2 });
    }

    let sum = 0,
        w;

    for (const h of hits) {

        w = (profile === "gauss")
            ? Math.exp(-0.5 * (h.t / sigma) * (h.t / sigma))
            : 1;

        weights[h.idx] += w;
        sum += w;
    }

    if (sum > 0) {

        for (let i = 0; i < weights.length; i++) {

            weights[i] /= sum;
        }
    }

    return {
        width: size,
        height: size,
        offsetX: cx,
        offsetY: cy,
        weights,
    };
};


// Create the target entity
const piccy = scrawl.makePicture({

    name: name('image'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [name('matrix')],
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', function () {

    const w = action.weights.join(', ');

    return `
    Length: ${dom.length.value}
    Angle: ${dom.angle.value}
    Sigma: ${dom.sigma.value}

    Matrix actions array: [{
        width: ${action.width},
        height: ${action.height},
        offsetX: ${action.offsetX},
        offsetY: ${action.offsetY},
        weights: [${w}],
    }]

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
const dom = scrawl.initializeDomInputs([
    ['input', 'length', '9'],
    ['input', 'angle', '0'],
    ['input', 'sigma', '2'],
    ['input', 'opacity', '1'],
    ['select', 'profile', 0],
    ['select', 'memoizeFilterOutput', 0],
]);


const memoize = () => {

    piccy.set({
        memoizeFilterOutput: dom.memoizeFilterOutput.value === '0' ? false : true,
    });
};
scrawl.addNativeListener(['input', 'change'], memoize, '#memoizeFilterOutput');


// Manage filter updates
const updateOpacity = () => {

    matrix.set({
        opacity: parseFloat(dom.opacity.value),
    });
};
scrawl.addNativeListener(['input', 'change'], updateOpacity, '.filter-opacity');

const updateMatrix = () => {

    const length = parseInt(dom.length.value, 10),
        angle = parseInt(dom.angle.value, 10),
        sigma = parseFloat(dom.sigma.value),
        profile = dom.profile.value;

    const vals = makeDirectionalKernel(length, angle, profile, sigma);

    action.width = vals.width;
    action.height = vals.height;
    action.offsetX = vals.offsetX;
    action.offsetY = vals.offsetY;
    action.weights = [...vals.weights];

    matrix.set({
        actions: [action],
    });
};
scrawl.addNativeListener(['input', 'change'], updateMatrix, '.filter-control');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, canvas, `#${namespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);
