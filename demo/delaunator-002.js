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

const triangleCenter = (pts, del, t) => {

    const vertices = pointsOfTriangle(del, t).map(p => pts[p]);

    return circumcenter(vertices[0], vertices[1], vertices[2]);
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

// #### Scene setup
const canvas = scrawl.library.artefact.mycanvas;

// Import image from DOM, and create Picture entity using it
scrawl.importDomImage('.flowers');

// Magic number - base Cell dimensions
const baseDimension = 400;

canvas.set({

    // Make the canvas responsive
    fit: 'cover',
    checkForResize: true,

}).setBase({

    // Set the base Cell
    width: baseDimension,
    height: baseDimension,
    backgroundColor: 'black',
});


// Create the coordinates to be used as the Voronoi web's points - for this deo these coordinates will be static, except for the first point which will track the mouse cursor position over the canvas
const coordArray = [],
    coord = scrawl.requestCoordinate(),
    center = [baseDimension/2, baseDimension/2];

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

        // __points__ - an array holding the coordinate arrays we generate elsewhere
        // + For this demo, we will be updating the first coordinate point with the mouse cursor's position when it is over the canvas element
        key: 'points', 
        defaultValue: [],
        setter: function (item) {

            this.points = [...item];
        },
    },{
        // __here__ - a handle to our Canvas wrapper's base Cell's `here` object, which gives us the current mouse cursor coordinates
        key: 'here', 
        defaultValue: null,
    },{
        // __delaunay__ - a handle to the current Delaunator object we recreate on each update
        key: 'delaunay', 
        defaultValue: null,
    },{
        // __canvasWidth__, __canvasHeight__ - make the RawAsset's dimensions the same as our canvas base Cell's dimensions
        key: 'canvasWidth', 
        defaultValue: baseDimension,
    },{
        key: 'canvasHeight', 
        defaultValue: baseDimension,
    },{
        // __trigger__ - we update the RawAsset at the start of each Display cycle by setting its `trigger` attribute. All the work with recreating the Delaunator object happens here
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
    // + We clear the RawAsset's canvas, then draw the updated Voronoi web onto it
    updateSource: function (assetWrapper) {

        const { element, engine, points, delaunay, canvasWidth, canvasHeight } = assetWrapper;

        element.width = canvasWidth;
        if (!element.height) element.height = canvasHeight;

        engine.strokeStyle = 'black';
        engine.lineWidth = 2;

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

// Initialize the RawAsset with relevant data
myAsset.set({
    points: coordArray,
    here: canvas.base.here,
});

// The RawAsset needs a subscriber to make it active - currently filters do not subscribe to assets so we need to do it via an otherwise unused Picture entity
scrawl.makePicture({

    name: 'temp',
    asset: 'voronoi-web',
    display: 'none',
});

// We apply the mosaic effect over our image using a Scrawl-canvas filter
scrawl.makeFilter({

    name: 'mosaic-filter',

    actions: [{
        // Load our RawAsset's output - the Voronoi web - into the filter
        action: 'process-image',
        lineOut: 'web',
        asset: 'voronoi-web',
        width: baseDimension,
        height: baseDimension,
        copyWidth: '100%',
        copyHeight: '100%',
    },{
        // Create the tiles from the Voronoi web
        action: 'flood',
        lineOut: 'white-background',
        red: 255,
        green: 255,
        blue: 255,
        alpha: 255,
    },{
        action: 'compose',
        lineIn: 'web',
        lineMix: 'white-background',
        lineOut: 'webbed-background',
    },{
        action: 'channels-to-alpha',
        lineIn: 'webbed-background',
        lineOut: 'webbed-background',
        includeRed: true,
        includeGreen: false,
        includeBlue: false,
    },{
        // Apply our image over the tiles
        action: 'compose',
        lineIn: 'source',
        lineMix: 'webbed-background',
        compose: 'source-atop',
    },{
        // Tile shadows - blur the voronoi web then apply it, offset up and left, to the image 
        action: 'gaussian-blur',
        lineIn: 'web',
        lineOut: 'blurred-web',
        radius: 3,
    },{
        action: 'compose',
        lineMix: 'blurred-web',
        offsetX: -2,
        offsetY: -2,
        compose: 'destination-atop',
    },{
        // Tile highlights - invert the blurred web then apply it, offset down and right, to the image 
        action: 'invert-channels',
        lineIn: 'blurred-web',
        lineOut: 'blurred-web',
    },{
        action: 'compose',
        lineMix: 'blurred-web',
        offsetX: 2,
        offsetY: 2,
        compose: 'destination-atop',
    }],
});

// Display our image in a Picture entity - the filter is applied here 
scrawl.makePicture({

    name: 'myFlower',
    asset: 'iris',

    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],

    filters: ['mosaic-filter'],
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

    // We need to update our RawAsset at the start of each Display cycle
    commence: () => myAsset.set({ trigger: true }),
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
