// # Demo Delaunator 002
// Responsive Voronoi cells in a RawAsset wrapper

// [Run code](../../demo/delaunator-002.html)
import scrawl from '../source/scrawl.js';
import Delaunator from 'https://cdn.skypack.dev/delaunator@5.0.0';


// The following functions are used to handle the Delaunay object
// + Code adapted from the [Delaunator Guide website](https://mapbox.github.io/delaunator/)
const edgesOfTriangle = (t) => [3 * t, 3 * t + 1, 3 * t + 2];

const pointsOfTriangle = (del, t) => {

    let { triangles } = del;

    return edgesOfTriangle(t).map(e => triangles[e]);
};

const triangleOfEdge = (e) => Math.floor(e / 3);

const nextHalfedge = (e) => (e % 3 === 2) ? e - 2 : e + 1;

const prevHalfedge = (e) => (e % 3 === 0) ? e + 2 : e - 1;

const forEachTriangleEdge = (pts, del, cb) => {

    let { triangles, halfedges } = del;

    let len = triangles.length;

    for (let e = 0; e < len; e++) {

        if (e > halfedges[e]) {

            const p = pts[triangles[e]];
            const q = pts[triangles[nextHalfedge(e)]];

            cb(e, p, q);
        }
    }
};

const forEachTriangle = (pts, del, cb) => {

    let len = del.triangles.length / 3;

    for (let t = 0; t < len; t++) {

        cb(t, pointsOfTriangle(del, t).map(p => pts[p]));
    }
};

const triangleCenter = (pts, del, t) => {

    const vertices = pointsOfTriangle(del, t).map(p => pts[p]);

    return circumcenter(vertices[0], vertices[1], vertices[2]);
};

const trianglesAdjacentToTriangle = (del, t) => {

    let { halfedges } = del;

    const adjacent = [];

    for (const e of edgesOfTriangle(t)) {

        const opposite = halfedges[e];

        if (opposite >= 0) adjacent.push(triangleOfEdge(opposite));
    }
    return adjacent;
};

const circumcenter = (a, b, c) => {

    if (a && b && c && a.length && b.length && c.length) {

        const ad = a[0] * a[0] + a[1] * a[1],
            bd = b[0] * b[0] + b[1] * b[1],
            cd = c[0] * c[0] + c[1] * c[1];

        const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));

        return [
            1 / D * (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1])),
            1 / D * (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0])),
        ];
    }
};

const forEachVoronoiEdge = (pts, del, cb) => {

    if (del) {

        let { triangles, halfedges } = del;

        let len = triangles.length;

        for (let e = 0; e < len; e++) {

            if (e < halfedges[e]) {

                const p = triangleCenter(pts, del, triangleOfEdge(e));
                const q = triangleCenter(pts, del, triangleOfEdge(halfedges[e]));

                cb(e, p, q);
            }
        }
    }
};

const edgesAroundPoint = (del, start) => {

    let { halfedges } = del;

    const result = [];

    let incoming = start;

    do {

        result.push(incoming);
        const outgoing = nextHalfedge(incoming);
        incoming = halfedges[outgoing];

    } while (incoming !== -1 && incoming !== start);

    return result;
};

const forEachVoronoiCell = (pts, del, cb) => {

    const index = new Map();

    let { triangles, halfedges } = del;

    let tLen = triangles.length,
        pLen = pts.length;

    for (let e = 0; e < tLen; e++) {

        const endpoint = triangles[nextHalfedge(e)];

        if (!index.has(endpoint) || halfedges[e] === -1) index.set(endpoint, e);
    }

    for (let p = 0; p < pLen; p++) {

        const incoming = index.get(p);

        const E = edgesAroundPoint(del, incoming);

        const T = E.map(triangleOfEdge);

        const V = T.map(t => triangleCenter(pts, del, t));

        cb(p, V);
    }
};


// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;


// Import image from DOM, and create Picture entity using it
scrawl.importDomImage('.flowers');

canvas.set({

    // Make the canvas responsive
    fit: 'cover',
    checkForResize: true,

}).setBase({

    width: 600,
    height: 600,
    compileOrder: 2,
});


// Create the coordinates to be used as the Voronoi web's points
const coordArray = [],
    coord = scrawl.requestCoordinate(),
    center = [300, 300];

coordArray.push(center);

for (let r = 1; r < 5; r++) {

    for (let p = 0; p < 50; p++) {
        
        coord.set(0, Math.floor(Math.random() * (r * 200)));
        coord.rotate(Math.random() * 360);
        coord.add(center);
        coordArray.push([...coord]);
    }
}
scrawl.releaseCoordinate(coord);

// We build the Voronoi web in a RawAsset wrapper
let myAsset = scrawl.makeRawAsset({

    name: 'voronoi-web',

    userAttributes: [{

        key: 'points', 
        defaultValue: [],
        setter: function (item) {

            this.points = [...item];
        },
    },{
        key: 'here', 
        defaultValue: null,
    },{
        key: 'delaunay', 
        defaultValue: null,
    },{
        key: 'canvasWidth', 
        defaultValue: 600,
    },{
        key: 'canvasHeight', 
        defaultValue: 600,
    },{
        // We update the RawAsset at the start of each Display cycle by setting its `trigger` attribute
        key: 'trigger', 
        defaultValue: false,
        setter: function (item) {

            const { points, here } = this;

            if (here && here.active) points[0] = [here.x, here.y];
            else points[0] = [...center];

            this.delaunay = Delaunator.from(points);

            this.dirtyData = item;
        },
    }],

    // `assetWrapper` is the same as `this` when function is declared with the function keyword
    updateSource: function (assetWrapper) {

        const { element, engine, points, delaunay, canvasWidth, canvasHeight } = assetWrapper;

        element.width = canvasWidth;
        if (!element.height) element.height = canvasHeight;

        engine.strokeStyle = 'red';
        engine.lineWidth = 4;

        engine.beginPath();

        forEachVoronoiEdge(points, delaunay, (e, p, q) => {

            if (p && q) {

                engine.moveTo(...p);
                engine.lineTo(...q);
            }
        });

        engine.stroke();
    },
});


myAsset.set({
    points: coordArray,
    here: canvas.base.here,
});

scrawl.makePicture({

    name: 'myFlower',
    asset: 'iris',

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

}).clone({

    name: 'temporary-for-development',
    asset: 'voronoi-web',

    globalCompositeOperation: 'darken',
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

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    commence: () => myAsset.set({ trigger: true }),
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
