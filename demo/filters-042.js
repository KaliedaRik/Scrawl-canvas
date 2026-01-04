// # Demo Filters 042
// Parameters for: okCurveWeights filter

// [Run code](../../demo/filters-042.html)
import * as scrawl from '../source/scrawl.js';

import { addImageDragAndDrop } from './utilities.js';

// #### Scene setup
const oCanvas = scrawl.findCanvas('output-canvas');
const wCanvas = scrawl.findCanvas('channel-weights-canvas');


// Namespacing boilerplate
const oNamespace = oCanvas.name;
const wNamespace = wCanvas.name;
const oName = (n) => `${oNamespace}-${n}`;
const wName = (n) => `${wNamespace}-${n}`;


// Import the initial image used by the Picture entity
scrawl.importDomImage('.flowers');


// UI sampling resolution (Bezier → curve)
const UI_L_SAMPLES = 256;
const UI_C_SAMPLES = 256;
const UI_AB_SAMPLES = 256;

// Filter engine resolutions (fixed, strict)
const L_WEIGHTS_SIZE = 501;
const C_WEIGHTS_SIZE = 201;
const AB_WEIGHTS_SIZE = 501;


// OKLab curves
const myFilter = scrawl.makeFilter({

    name: oName('oklab-curves'),
    method: 'okCurveWeights',

    opacity: 1,

    // We start with “no-op” curves from the filter’s point of view.
    curves: {
        luminance: [],
        chroma: [],
        aChannel: [],
        bChannel: [],
    },
});


// Output canvas
const piccy = scrawl.makePicture({

    name: oName('image'),
    group: oCanvas.get('baseGroup'),
    asset: 'iris',
    copyDimensions: ['100%', '100%'],
    dimensions: ['95%', '95%'],
    handle: ['center', 'center'],
    start: ['center', 'center'],

    filters: [myFilter],
});


// Weights canvas
wCanvas.buildCell({

    name: wName('curves-cell'),
    dimensions: [360, 360],
});

const curveArray = ['red', 'green', 'blue', 'black'];

curveArray.forEach((color, index) => {

    const groupName = wName(`${color}-pins-group`);

    scrawl.makeGroup({

        name: groupName,
        host: wCanvas.getBase(),
        order: index,
    });

    scrawl.makeWheel({

        name: wName(`${color}-pin-start`),
        group: groupName,
        radius: 12,
        start: [0, 360],
        fillStyle: color,
        strokeStyle: 'gold',
        method: 'fillThenDraw',
        handle: ['center', 'center'],

    }).clone({

        name: wName(`${color}-pin-cs`),
        radius: 8,
        start: [120, 240],
        method: 'fill',

    }).clone({

        name: wName(`${color}-pin-ce`),
        start: [240, 120],

    }).clone({

        name: wName(`${color}-pin-end`),
        radius: 12,
        start: [360, 0],
        method: 'fillThenDraw',
    });

    scrawl.makeBezier({

        name: wName(`${color}-bezier`),
        group: wName('curves-cell'),

        strokeStyle: color,
        lineWidth: 1,
        method: 'draw',

        pivot: wName(`${color}-pin-start`),
        lockTo: 'pivot',

        startControlPivot: wName(`${color}-pin-cs`),
        startControlLockTo: 'pivot',

        endControlPivot: wName(`${color}-pin-ce`),
        endControlLockTo: 'pivot',

        endPivot: wName(`${color}-pin-end`),
        endLockTo: 'pivot',

        useStartAsControlPoint: true,
        useAsPath: true,
    });
});

// #### User interaction
let draggedPin;

const dragGroup = scrawl.makeGroup({
    name: wName('drag-group'),
});

dragGroup.addArtefacts(
    wName('black-pin-start'),
    wName('black-pin-cs'),
    wName('black-pin-ce'),
    wName('black-pin-end'),
);

const currentPin = scrawl.makeDragZone({

    zone: wCanvas,
    collisionGroup: wName('drag-group'),
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,

    updateOnStart: () => {

        draggedPin = currentPin();

        if (typeof draggedPin !== 'boolean' && draggedPin) {

            const pin = draggedPin.artefact,
                name = pin.name;

            if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

/** @ts-expect-error */
                pin.isBeingDragged = false;
                pin.set({
                    lockYTo: 'mouse',
                });
            }
        }
    },

    updateOnEnd: () => {

        if (typeof draggedPin !== 'boolean' && draggedPin) {

            const pin = draggedPin.artefact,
                name = pin.name;

            if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

                pin.set({
                    start: pin.get('position'),
                    lockYTo: 'start',
                });
            }
        }
        draggedPin = false;

        recalculateWeights();
    },
});


// Helper: sample a Bezier path into a [0,1] *absolute* curve array
const sampleBezierToCurve = (curveEntity, sampleCount) => {

    if (!curveEntity) return new Array(sampleCount).fill(0);

    const buckets = new Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) buckets[i] = [];

    const width = 360;
    const height = 360;

    const STEPS = 1000;

    for (let t = 0; t <= 1; t += 1 / STEPS) {

        const pos = curveEntity.getPathPositionData(t);
        if (!pos) continue;

        const { x, y } = pos;

        const xn = x / width;
        const yn = y / height;

        const clampedX = (xn < 0) ? 0 : (xn > 1 ? 1 : xn);
        const clampedY = (yn < 0) ? 0 : (yn > 1 ? 1 : yn);

        let idx = Math.floor(clampedX * (sampleCount - 1));
        if (idx < 0) idx = 0;
        else if (idx >= sampleCount) idx = sampleCount - 1;

        const v = 1 - clampedY;

        buckets[idx].push(v);
    }

    const out = new Array(sampleCount);
    let lastValue = 0;

    for (let i = 0; i < sampleCount; i++) {

        const arr = buckets[i];
        if (arr.length) {

            const sum = arr.reduce((acc, val) => acc + val, 0);
            lastValue = sum / arr.length;
        }
        else {

            lastValue = i / (sampleCount - 1);
        }

        if (lastValue < 0) lastValue = 0;
        else if (lastValue > 1) lastValue = 1;

        out[i] = lastValue;
    }

    return out;
};

// Helper: build delta-curve (offsets) at engine resolution
// + src[] is an absolute curve in [0,1] over [0,1]; we resample to targetSize,
// + then subtract the diagonal (identity) so the result is an array of offsets.
const buildDeltaCurve = (src, targetSize) => {

    if (!src || !src.length) return [];

    const n = src.length;
    const out = new Array(targetSize);
    const last = n - 1;
    const EPS = 1e-2;

    for (let i = 0; i < targetSize; i++) {

        const t = (targetSize === 1) ? 0 : (i / (targetSize - 1));

        const idx = t * last;
        const j = idx | 0;
        const f = idx - j;

        const v0 = src[j];
        const v1 = (j < last) ? src[j + 1] : src[last];

        const val = v0 * (1 - f) + v1 * f;
        const identity = t;

        const delta = val - identity;

        out[i] = (delta < -EPS || delta > EPS) ? delta : 0;
    }
    return out;
};

// Filter weights (curves) recalculation
let curvesForFilter;

const lumCurve = scrawl.findEntity(wName('black-bezier'));
const chromaCurve = scrawl.findEntity(wName('red-bezier'));
const aCurve = scrawl.findEntity(wName('green-bezier'));
const bCurve = scrawl.findEntity(wName('blue-bezier'));

const recalculateWeights = function () {

    // Build new *absolute* curves from the Bezier paths (UI resolution)
    const luminance = sampleBezierToCurve(lumCurve, UI_L_SAMPLES);
    const chroma = sampleBezierToCurve(chromaCurve, UI_C_SAMPLES);
    const aChannel = sampleBezierToCurve(aCurve, UI_AB_SAMPLES);
    const bChannel = sampleBezierToCurve(bCurve, UI_AB_SAMPLES);

    // Convert to engine delta curves (offsets)
    curvesForFilter = {
        luminance: buildDeltaCurve(luminance, L_WEIGHTS_SIZE),
        chroma: buildDeltaCurve(chroma, C_WEIGHTS_SIZE),
        aChannel: buildDeltaCurve(aChannel, AB_WEIGHTS_SIZE),
        bChannel: buildDeltaCurve(bChannel, AB_WEIGHTS_SIZE),
    };

    myFilter.set({ curves: curvesForFilter });

    updateOutput();
};


// #### Scene animation
scrawl.makeRender({

    name: oName('animation'),
    target: [wCanvas, oCanvas],
    afterCreated: () => recalculateWeights(),
});

const updateOutput = () => {

    if (curvesForFilter && curvesForFilter.luminance) {

        const msg = `Luminance curve
    length: ${curvesForFilter.luminance.length}
    vals: ${curvesForFilter.luminance.join(', ')}

Chroma curve
    length: ${curvesForFilter.chroma.length}
    vals: ${curvesForFilter.chroma.join(', ')}

aChannel curve
    length: ${curvesForFilter.aChannel.length}
    vals: ${curvesForFilter.aChannel.join(', ')}

bChannel curve
    length: ${curvesForFilter.bChannel.length}
    vals: ${curvesForFilter.bChannel.join(', ')}
`;

        document.querySelector('#reportmessage').textContent = msg;
    }
};

// #### User interaction

// Setup form
scrawl.initializeDomInputs([
    ['input', 'opacity', '1'],
]);

scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {
        opacity: ['opacity', 'float'],
    },
});

// Channel buttons (under the curves canvas)
let selected, selectedGroup;

scrawl.addNativeListener('click', (e) => {

    if (e && e.target && e.target.id) {

        if (selectedGroup) {

            const order = selectedGroup.get('order') - 10;

            selectedGroup.setArtefacts({ order });
            selectedGroup.set({ order });
        }

        selected = e.target.id;
        selectedGroup = scrawl.findGroup(wName(`${selected}-pins-group`));

        if (selectedGroup) {

            document.querySelectorAll('.channel-selector').forEach(el => el.classList.remove('selected'));

            const order = selectedGroup.get('order') + 10;

            selectedGroup.setArtefacts({ order });
            selectedGroup.set({ order });

            dragGroup.clearArtefacts();
            dragGroup.addArtefacts(
                wName(`${selected}-pin-start`),
                wName(`${selected}-pin-cs`),
                wName(`${selected}-pin-ce`),
                wName(`${selected}-pin-end`),
            );

            e.target.classList.add('selected');
        }
    }
}, '.channel-selector');

scrawl.addNativeListener(['input', 'change'], () => updateOutput(), '.controlItem');


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop(scrawl, oCanvas, `#${oNamespace} .assets`, piccy);


// #### Development and testing
console.log(scrawl.library);

updateOutput();
