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


// Create the easel cell
const eWidth = Math.floor(cWidth / 4),
    eHeight = Math.floor(cHeight / 4);

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

const IX = (x, y) => y * eWidth + x;

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

// ---- Helpers
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

const setBoundary = function (field, solid = true) {

    for (let y = 0; y < eHeight; y++) {

        field[IX(0, y)] = field[IX(1, y)];
        field[IX(eWidth - 1, y)] = field[IX(eWidth - 2, y)];
    }

    for (let x = 0; x < eWidth; x++) {

        field[IX(x, 0)] = field[IX(x, 1)];
        field[IX(x, eHeight - 1)] = field[IX(x, eHeight - 2)];
    }
};

const jacobi = function (out, b, alpha, rcpBeta, iterations){

    let k, y, x, i;

    for (k = 0; k < iterations; k++) {

        for (y = 1; y < eHeight - 1; y++) {

            for (x = 1; x < eWidth - 1; x++) {

                i = IX(x, y);

                out[i] = (
                    b[i] +
                    out[IX(x - 1, y)] +
                    out[IX(x + 1, y)] +
                    out[IX(x, y - 1)] +
                    out[IX(x, y + 1)]
                ) * rcpBeta;
            }
        }
        setBoundary(out);
    }
};

const advect = function (out, inp, u, v, dt) {

    let y, x, xf, yf, x0, x1, sx, y0, y1, sy, i00, i10, i01, i11, a, b,
        _floor = Math.floor;

    for (y = 1; y < eHeight - 1; y++) {

        for (x = 1; x < eWidth - 1; x++) {

            xf = x - dt * u[IX(x, y)] * (eWidth - 2);
            xf = clamp(xf, 0.5, eWidth - 1.5);

            yf = y - dt * v[IX(x, y)] * (eHeight - 2);
            yf = clamp(yf, 0.5, eHeight - 1.5);

            x0 = _floor(xf);
            y0 = _floor(yf);

            x1 = x0 + 1;
            y1 = y0 + 1;

            sx = xf - x0;
            sy = yf - y0;

            i00 = IX(x0, y0);
            i10 = IX(x1, y0);
            i01 = IX(x0, y1);
            i11 = IX(x1, y1);

            a = inp[i00] * (1 - sx) + inp[i10] * sx;
            b = inp[i01] * (1 - sx) + inp[i11] * sx;

            out[IX(x, y)] = a * (1 - sy) + b * sy;
        }
    }
    setBoundary(out);
};

const project = function (u, v, p, div) {

    let y, x, i;

    for (y = 1; y < eHeight - 1; y++) {

        for (x = 1; x < eWidth - 1; x++) {

            i = IX(x, y);

            div[i] = -0.5 * (
                (u[IX(x + 1, y)] - u[IX(x - 1, y)]) +
                (v[IX(x, y + 1)] - v[IX(x, y - 1)])
            );

            p[i] = 0;
        }
    }
    setBoundary(div);
    setBoundary(p);

    // Solve ∇²p = div via Jacobi
    jacobi(p, div, 1, 0.25, 20);

    // u -= ∂p/∂x; v -= ∂p/∂y
    for (y = 1; y < eHeight - 1; y++){

        for (x = 1; x < eWidth - 1; x++){

            i = IX(x, y);

            u[i] -= 0.5 * (p[IX(x + 1, y)] - p[IX(x - 1, y)]);
            v[i] -= 0.5 * (p[IX(x, y + 1)] - p[IX(x, y - 1)]);
        }
    }
    setBoundary(u);
    setBoundary(v);
};

const diffuse = function (out, inp, rate) {

    const a = rate,
        beta = 1 + 4 * a;

    out.set(inp);

    let k, y, x, i;

    for (k = 0; k < 20; k++) {

        for (y = 1; y < eHeight - 1; y++) {

            for (x = 1; x < eWidth - 1; x++) {
            
                i = IX(x, y);
            
                out[i] = (
                    inp[i] +
                    a * (
                        out[IX(x - 1, y)] +
                        out[IX(x + 1, y)] +
                        out[IX(x, y - 1)] +
                        out[IX(x, y + 1)]
                    )
                ) / beta;
            }
        }
        setBoundary(out);
    }
}

// Simulation step
const emitter1 = {
    x: 2,
    y: Math.floor(eHeight / 2) - 1,
    radius: 2,
    dyeRate: 1.0,
    vx: 1.5 / eWidth,
    vy: 0
};
const emitter2 = {
    x: eWidth - 2,
    y: Math.floor(eHeight / 2) + 1,
    radius: 2,
    dyeRate: 1.0,
    vx: -1.2 / eWidth,
    vy: 0
};

const step = function () {

    // emitter 1 (to show something on the canvas)
    let { x: ex, y: ey, radius: r, dyeRate, vx, vy } = emitter1;
    let r2 = r * r,
        minX = Math.max(1, ex - r),
        maxX = Math.min(eWidth  - 2, ex + r),
        minY = Math.max(1, ey - r),
        maxY = Math.min(eHeight - 2, ey + r);

    let y, x, dx, dy, i;

    for (y = minY; y <= maxY; y++) {

        for (x = minX; x <= maxX; x++) {

            dx = x - ex;
            dy = y - ey;

            if (dx * dx + dy * dy <= r2) {

                i = IX(x, y);
                dye[i] = Math.min(1, dye[i] + dyeRate * dt);
                u[i] += vx;
                v[i] += vy;
            }
        }
    }

    // emitter 2 (to show some conflict)
    ({ x: ex, y: ey, radius: r, dyeRate, vx, vy } = emitter2);
    r2 = r * r;
    minX = Math.max(1, ex - r);
    maxX = Math.min(eWidth - 2, ex + r);
    minY = Math.max(1, ey - r);
    maxY = Math.min(eHeight - 2, ey + r);

    for (y = minY; y <= maxY; y++) {

        for (x = minX; x <= maxX; x++) {

            dx = x - ex;
            dy = y - ey;

            if (dx * dx + dy * dy <= r2) {

                i = IX(x, y);
                dye[i] = Math.min(1, dye[i] + dyeRate * dt);
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

    let i, p, v, c,
        _max = Math.max,
        _min = Math.min;

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
