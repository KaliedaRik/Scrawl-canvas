// # Demo Canvas 073
// 2D Stable Fluids simulation (Stam 1999)

// [Run code](../../demo/canvas-073.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.findCanvas('my-canvas');


// Namespacing boilerplate
const namespace = canvas.name;
const name = (n) => `${namespace}-${n}`;

const [cWidth, cHeight] = canvas.get('dimensions'),
    here = canvas.here;

const _max = Math.max,
    _min = Math.min,
    _floor = Math.floor;

// Create the easel cell
const eWidth = _floor(cWidth / 4),
    eHeight = _floor(cHeight / 4);

const easel = canvas.buildCell({
    name: name('easel-cell'),
    dimensions: [eWidth, eHeight],
    cleared: false,
    compiled: false,
    shown: false,
});

// Get handles to the Cell's engine and pixel data
const easelData = easel.getCellData(true),
    pixelState = easelData.pixelState;

easel.paintCellData(easelData);


// Create the display Picture
scrawl.makePicture({
    name: name('display'),
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    asset: easel,
    imageSmoothingEnabled: false,
});


// Fluid simulation
const len = eWidth * eHeight;

const eWm1 = eWidth - 1,
    eWm15 = eWidth - 1.5,
    eWm2 = eWidth - 2,
    eHm1 = eHeight - 1,
    eHm15 = eHeight - 1.5,
    eHm2 = eHeight - 2;

const innerIndicesLUT = new Uint32Array(len * 3);

let counter = 0
for (let y = 1; y < eHm1; y++) {

    for (let x = 1; x < eWm1; x++) {

        const index = y * eWidth + x;

        innerIndicesLUT[counter++] = index;
        innerIndicesLUT[counter++] = x;
        innerIndicesLUT[counter++] = y;
    }
}

console.log(innerIndicesLUT)

// Tweakable variables
const dt = 1/60,
    visc = 0.001,
    diff = 0.0001;

// Fields (double buffers for advection/diffuse)
let u = new Float32Array(len),
    v = new Float32Array(len),
    u0 = new Float32Array(len),
    v0 = new Float32Array(len),
    p = new Float32Array(len),
    div = new Float32Array(len),
    dye = new Float32Array(len),
    dye0 = new Float32Array(len);

// Helper functions
const setBoundary = function (field, solid = true) {

    let i, index0, index1;

    for (i = 0; i < eHeight; i++) {

        index0 = i * eWidth + 0;
        index1 = i * eWidth + 1;
        field[index0] = field[index1];

        index0 = i * eWidth + eWm1;
        index1 = i * eWidth + eWm2;
        field[index0] = field[index1];
    }

    for (i = 0; i < eWidth; i++) {

        index0 = 0 * eWidth + i;
        index1 = 1 * eWidth + i;
        field[index0] = field[index1];

        index0 = eHm1 * eWidth + i;
        index1 = eHm2 * eWidth + i;
        field[index0] = field[index1];
    }
};

const jacobi = function (out, b, alpha, rcpBeta, iterations){

    let k, i, iz, index;

    for (k = 0; k < iterations; k++) {

        for (i = 0, iz = innerIndicesLUT.length; i < iz; i += 3) {

            index = innerIndicesLUT[i];

            out[index] = (
                b[index] +
                out[index - 1] +
                out[index + 1] +
                out[index - eWidth] +
                out[index + eWidth]
            ) * rcpBeta;
        }
        setBoundary(out);
    }
};

const advect = function (out, inp, u, v, dt) {

    let i, iz, xf, yf, x0, x1, sx, y0, y1, sy, a, b, index, y0width, y1width;

    for (i = 0, iz = innerIndicesLUT.length; i < iz; i += 3) {

        index = innerIndicesLUT[i];

        xf = innerIndicesLUT[i + 1] - dt * u[index] * eWm2;
        xf = xf < 0.5 ? 0.5 : xf > eWm15 ? eWm15 : xf;

        yf = innerIndicesLUT[i + 2] - dt * v[index] * eHm2;
        yf = yf < 0.5 ? 0.5 : yf > eHm15 ? eHm15 : yf;

        x0 = _floor(xf);
        y0 = _floor(yf);

        x1 = x0 + 1;
        y1 = y0 + 1;

        sx = xf - x0;
        sy = yf - y0;

        y0width = y0 * eWidth;
        y1width = y1 * eWidth;

        a = inp[y0width + x0] * (1 - sx) + inp[y0width + x1] * sx;
        b = inp[y1width + x0] * (1 - sx) + inp[y1width + x1] * sx;

        out[index] = a * (1 - sy) + b * sy;
    }
    setBoundary(out);
};

const project = function (u, v, p, div) {

    let i, iz, index;

    for (i = 0, iz = innerIndicesLUT.length; i < iz; i += 3) {

        index = innerIndicesLUT[i];

        div[index] = -0.5 * (
            (u[index + 1] - u[index - 1]) +
            (v[index + eWidth] - v[index - eWidth])
        );

        p[index] = 0;
    }
    setBoundary(div);
    setBoundary(p);

    // Solve ∇²p = div via Jacobi
    jacobi(p, div, 1, 0.25, 20);

    for (i = 0, iz = innerIndicesLUT.length; i < iz; i += 3) {

        index = innerIndicesLUT[i];

        u[index] -= 0.5 * (p[index + 1] - p[index - 1]);
        v[index] -= 0.5 * (p[index + eWidth] - p[index - eWidth]);
    }
    setBoundary(u);
    setBoundary(v);
};

const diffuse = function (out, inp, rate) {

    const a = rate,
        beta = 1 + 4 * a;

    out.set(inp);

    let k, i, iz, index;

    for (k = 0; k < 20; k++) {

        for (i = 0, iz = innerIndicesLUT.length; i < iz; i += 3) {

            index = innerIndicesLUT[i];

            out[index] = (
                inp[index] +
                a * (
                    out[index - 1] +
                    out[index + 1] +
                    out[index - eWidth] +
                    out[index + eWidth]
                )
            ) / beta;
        }
        setBoundary(out);
    }
}

// Simulation step
const emitter1 = {
    x: 2,
    y: _floor(eHeight / 2) - 1,
    radius: 2,
    dyeRate: 1.0,
    vx: 1.5 / eWidth,
    vy: 0
};
const emitter2 = {
    x: eWidth - 2,
    y: _floor(eHeight / 2) + 1,
    radius: 2,
    dyeRate: 1.0,
    vx: -1.2 / eWidth,
    vy: 0
};

const step = function () {

    // emitter 1 (to show something on the canvas)
    let { x: ex, y: ey, radius: r, dyeRate, vx, vy } = emitter1;
    let r2 = r * r,
        minX = _max(1, ex - r),
        maxX = _min(eWm2, ex + r),
        minY = _max(1, ey - r),
        maxY = _min(eHm2, ey + r);

    let y, x, dx, dy, i;

    for (y = minY; y <= maxY; y++) {

        for (x = minX; x <= maxX; x++) {

            dx = x - ex;
            dy = y - ey;

            if (dx * dx + dy * dy <= r2) {

                i = y * eWidth + x;
                dye[i] = _min(1, dye[i] + dyeRate * dt);
                u[i] += vx;
                v[i] += vy;
            }
        }
    }

    // emitter 2 (to show some conflict)
    ({ x: ex, y: ey, radius: r, dyeRate, vx, vy } = emitter2);
    r2 = r * r;
    minX = _max(1, ex - r);
    maxX = _min(eWm2, ex + r);
    minY = _max(1, ey - r);
    maxY = _min(eHm2, ey + r);

    for (y = minY; y <= maxY; y++) {

        for (x = minX; x <= maxX; x++) {

            dx = x - ex;
            dy = y - ey;

            if (dx * dx + dy * dy <= r2) {

                i = y * eWidth + x;
                dye[i] = _min(1, dye[i] + dyeRate * dt);
                u[i] += vx;
                v[i] += vy;
            }
        }
    }

    // add forces (example: decay dye slightly)
    for (let i = 0; i < len; i++) {

        dye[i] *= 0.995;
    }

    // velocity diffusion
    diffuse(u0, u, visc);
    diffuse(v0, v, visc);

    // project
    project(u0, v0, p, div);

    // advect velocity
    advect(u, u0, u0, v0, dt);
    advect(v, v0, u0, v0, dt);
    project(u, v, p, div);

    // advect dye
    advect(dye0, dye, u, v, dt);

    // dye diffusion (optional)
    diffuse(dye, dye0, diff);
};

const drawCell = () => {

    let i, p, v, c;

    for (i = 0; i < len; i++) {

        v = _max(0, _min(1, dye[i]));

        c = (v * 255) | 0;

        p = pixelState[i];

        p.red = c;
        p.green = c;
        p.blue = 127 - (c / 2);
    }
    easel.paintCellData(easelData);
};


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');

// Create the Display cycle animation
const render = scrawl.makeRender({

    name: name('animation'),
    target: canvas,

    commence: () => {
        step();
        drawCell();
    },

    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
