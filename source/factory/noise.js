// # Noise factory
// TODO: documentatiomn


// #### Demos:
// + TODO: demos


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
// import patternMix from '../mixin/pattern.js';


// #### Noise constructor
const Noise = function (items = {}) {

    this.makeName(items.name);
    this.register();

    let mycanvas = document.createElement('canvas');
    mycanvas.id = this.name;

    mycanvas.width = 300;
    mycanvas.height = 150;

    this.installElement(mycanvas);

    this.set(this.defs);
    this.set(items);

    return this;
};


// #### Noise prototype
let P = Noise.prototype = Object.create(Object.prototype);
P.type = 'Noise';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
// + [base](../mixin/base.html)
// + [entity](../mixin/entity.html)
P = baseMix(P);
P = assetMix(P);


// #### Noise attributes
let defaultAttributes = {

};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;



// #### Prototype functions

// `installElement` - internal function, used by the constructor
P.installElement = function (element) {

    this.element = element;
    this.engine = this.element.getContext('2d');

    return this;
};

// https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 * 
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 * 
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash 
 */
P.murmurhash3_32_gc = function (key, seed = 12345) {

    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
    
    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;
    
    while (i < bytes) {
        k1 = 
          ((key.charCodeAt(i) & 0xff)) |
          ((key.charCodeAt(++i) & 0xff) << 8) |
          ((key.charCodeAt(++i) & 0xff) << 16) |
          ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;
        
        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }
    
    k1 = 0;
    
    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);
        
        k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
    }
    
    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
};

// PSEUDO-RANDOM NUMBER GENERATOR
// + https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/47593316
P.mulberry32 = function (a) {

    return function() {

        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;

        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

P.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];




// #### Factory
// ```
// TODO
// ```
const makeNoise = function (items) {
    return new Noise(items);
};

constructors.Noise = Noise;


// #### Exports
export {
    makeNoise,
};







// SIMPLEX NOISE
// From http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// - The code in that paper is written in Java and, the author says, not tweaked for speed

// const SimplexNoise = function (p) {

//     this.perm = p;

//     this.seedstring = 'HELLO WORLD',
    
//     let i;

//     if (!Array.isArray(p) || !p.substring) p = [];
//     if (p.substring) {

//         seedstring = p;
//         p = [];
//     };

//     if (p.length != 512) {

//         p.length = 0;

//         let randomizerseed = this.murmurhash3_32_gc(seedstring),
//             randomizer = new mulberry32(randomizerseed);

//         for (i = 0; i < 256; i++) {

//             p.push(randomizer());
//         }
//         let perm = [];

//         for (i = 0; i < 512; i++) {

//             perm[i] = p[i & 255];
//         }

//         this.perm = perm;
//     }
// };

// let P = SimplexNoise.prototype = Object.create(Object.prototype);

// P.getPerm = function () {

//     return this.perm;
// };

// P.getSeedstring = function () {

//     return this.seedstring;
// };

// P.dot = function (g, x = 0, y = 0, z = 0, w = 0) {

//     let [gx, gy, gz, gw] = g;

//     if (null == gz) return (gx * x) + (gy * y); 
//     if (null == gw) return (gx * x) + (gy * y) + (gz * z); 
//     return (gx * x) + (gy * y) + (gz * z) + (gw * w); 
// };

// P.noise = function (xin, yin) {

//     let n0, n1, n2;

//     const F2 = 0.5 * (Math.sqrt(3) - 1);

//     const s = (xin + yin) * F2;

//     let i = Math.floor(xin + s),
//         j = Math.floor(yin + s);

//     const G2 = (3.0 - Math.sqrt(3)) / 6;

//     let t = (i + j) * G2,
//         X0 = i - t,
//         Y0 = j - t,
//         x0 = xin - X0,
//         y0 = yin - Y0;

//     let i1, j1;

//     if(x0 > y0) {
//         i1 = 1; 
//         j1 = 0;
//     }
//     else {
//         i1 = 0; 
//         j1 = 1;
//     }

//     let x1 = x0 - i1 + G2,
//         y1 = y0 - j1 + G2,
//         x2 = x0 - 1 + (2.0 * G2),
//         y2 = y0 - 1 + (2.0 * G2);

//     let ii = i & 255,
//         jj = j & 255,
//         perm = this.perm,
//         gi0 = perm[ii + perm[jj]] % 12,
//         gi1 = perm[ii + i1 + perm[jj + j1]] % 12,
//         gi2 = perm[ii + 1 + perm[jj + 1]] % 12;

//     // Calculate the contribution from the three corners
//     double t0 = 0.5 - x0*x0-y0*y0;
//     if(t0<0) n0 = 0.0;
//     else {
//     t0 *= t0;
//     n0 = t0 * t0 * dot(grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
//     }

//     double t1 = 0.5 - x1*x1-y1*y1;
//     if(t1<0) n1 = 0.0;
//     else {
//     t1 *= t1;
//     n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
//     }

//     double t2 = 0.5 - x2*x2-y2*y2;
//     if(t2<0) n2 = 0.0;
//     else {
//     t2 *= t2;
//     n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
//     }

//     // Add contributions from each corner to get the final noise value.
//     // The result is scaled to return values in the interval [-1,1].
//     return 70.0 * (n0 + n1 + n2);
// }

// public static double noise(double xin, double yin) {

//     double n0, n1, n2; // Noise contributions from the three corners

//     // Skew the input space to determine which simplex cell we're in
//     final double F2 = 0.5*(Math.sqrt(3.0)-1.0);
//     double s = (xin+yin)*F2; // Hairy factor for 2D
//     int i = fastfloor(xin+s);
//     int j = fastfloor(yin+s);

//     final double G2 = (3.0-Math.sqrt(3.0))/6.0;
//     double t = (i+j)*G2;
//     double X0 = i-t; // Unskew the cell origin back to (x,y) space
//     double Y0 = j-t;
//     double x0 = xin-X0; // The x,y distances from the cell origin
//     double y0 = yin-Y0;

//     // For the 2D case, the simplex shape is an equilateral triangle.
//     // Determine which simplex we are in.
//     int i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
//     if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1)
//     else {i1=0; j1=1;} // upper triangle, YX order: (0,0)->(0,1)->(1,1)

//     // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
//     // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
//     // c = (3-sqrt(3))/6

//     double x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
//     double y1 = y0 - j1 + G2;
//     double x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
//     double y2 = y0 - 1.0 + 2.0 * G2;

//     // Work out the hashed gradient indices of the three simplex corners
//     int ii = i & 255;
//     int jj = j & 255;
//     int gi0 = perm[ii+perm[jj]] % 12;
//     int gi1 = perm[ii+i1+perm[jj+j1]] % 12;
//     int gi2 = perm[ii+1+perm[jj+1]] % 12;

//     // Calculate the contribution from the three corners
//     double t0 = 0.5 - x0*x0-y0*y0;
//     if(t0<0) n0 = 0.0;
//     else {
//     t0 *= t0;
//     n0 = t0 * t0 * dot(grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
//     }

//     double t1 = 0.5 - x1*x1-y1*y1;
//     if(t1<0) n1 = 0.0;
//     else {
//     t1 *= t1;
//     n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
//     }

//     double t2 = 0.5 - x2*x2-y2*y2;
//     if(t2<0) n2 = 0.0;
//     else {
//     t2 *= t2;
//     n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
//     }

//     // Add contributions from each corner to get the final noise value.
//     // The result is scaled to return values in the interval [-1,1].
//     return 70.0 * (n0 + n1 + n2);


/*
public class SimplexNoise { // Simplex noise in 2D, 3D and 4D

 private static int grad3[][] = {{1,1,0},{-1,1,0},{1,-1,0},{-1,-1,0},
 {1,0,1},{-1,0,1},{1,0,-1},{-1,0,-1},
 {0,1,1},{0,-1,1},{0,1,-1},{0,-1,-1}};

 // private static int grad4[][]= {{0,1,1,1}, {0,1,1,-1}, {0,1,-1,1}, {0,1,-1,-1},
 // {0,-1,1,1}, {0,-1,1,-1}, {0,-1,-1,1}, {0,-1,-1,-1},
 // {1,0,1,1}, {1,0,1,-1}, {1,0,-1,1}, {1,0,-1,-1},
 // {-1,0,1,1}, {-1,0,1,-1}, {-1,0,-1,1}, {-1,0,-1,-1},
 // {1,1,0,1}, {1,1,0,-1}, {1,-1,0,1}, {1,-1,0,-1},
 // {-1,1,0,1}, {-1,1,0,-1}, {-1,-1,0,1}, {-1,-1,0,-1},
 // {1,1,1,0}, {1,1,-1,0}, {1,-1,1,0}, {1,-1,-1,0},
 // {-1,1,1,0}, {-1,1,-1,0}, {-1,-1,1,0}, {-1,-1,-1,0}};

 private static int p[] = {151,160,137,91,90,15,
 131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
 190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
 88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
 77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
 102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
 135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
 5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
 223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
 129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
 251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
 49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
 138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180};

 // To remove the need for index wrapping, double the permutation table length
 private static int perm[] = new int[512];
 static { for(int i=0; i<512; i++) perm[i]=p[i & 255]; }

 // A lookup table to traverse the simplex around a given point in 4D.
 // Details can be found where this table is used, in the 4D noise method.
 // private static int simplex[][] = {
 // {0,1,2,3},{0,1,3,2},{0,0,0,0},{0,2,3,1},{0,0,0,0},{0,0,0,0},{0,0,0,0},{1,2,3,0},
 // {0,2,1,3},{0,0,0,0},{0,3,1,2},{0,3,2,1},{0,0,0,0},{0,0,0,0},{0,0,0,0},{1,3,2,0},
 // {0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},
 // {1,2,0,3},{0,0,0,0},{1,3,0,2},{0,0,0,0},{0,0,0,0},{0,0,0,0},{2,3,0,1},{2,3,1,0},
 // {1,0,2,3},{1,0,3,2},{0,0,0,0},{0,0,0,0},{0,0,0,0},{2,0,3,1},{0,0,0,0},{2,1,3,0},
 // {0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},
 // {2,0,1,3},{0,0,0,0},{0,0,0,0},{0,0,0,0},{3,0,1,2},{3,0,2,1},{0,0,0,0},{3,1,2,0},
 // {2,1,0,3},{0,0,0,0},{0,0,0,0},{0,0,0,0},{3,1,0,2},{0,0,0,0},{3,2,0,1},{3,2,1,0}};

 // This method is a *lot* faster than using (int)Math.floor(x)
 private static int fastfloor(double x) {
 return x>0 ? (int)x : (int)x-1;
 }

 private static double dot(int g[], double x, double y) {
 return g[0]*x + g[1]*y; }
 
 private static double dot(int g[], double x, double y, double z) {
 return g[0]*x + g[1]*y + g[2]*z; }
 
 private static double dot(int g[], double x, double y, double z, double w) {
 return g[0]*x + g[1]*y + g[2]*z + g[3]*w; }
 
// 2D simplex noise
public static double noise(double xin, double yin) {

    double n0, n1, n2; // Noise contributions from the three corners

    // Skew the input space to determine which simplex cell we're in
    final double F2 = 0.5*(Math.sqrt(3.0)-1.0);
    double s = (xin+yin)*F2; // Hairy factor for 2D
    int i = fastfloor(xin+s);
    int j = fastfloor(yin+s);

    final double G2 = (3.0-Math.sqrt(3.0))/6.0;
    double t = (i+j)*G2;
    double X0 = i-t; // Unskew the cell origin back to (x,y) space
    double Y0 = j-t;
    double x0 = xin-X0; // The x,y distances from the cell origin
    double y0 = yin-Y0;

    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    int i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    else {i1=0; j1=1;} // upper triangle, YX order: (0,0)->(0,1)->(1,1)

    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6

    double x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    double y1 = y0 - j1 + G2;
    double x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
    double y2 = y0 - 1.0 + 2.0 * G2;

    // Work out the hashed gradient indices of the three simplex corners
    int ii = i & 255;
    int jj = j & 255;
    int gi0 = perm[ii+perm[jj]] % 12;
    int gi1 = perm[ii+i1+perm[jj+j1]] % 12;
    int gi2 = perm[ii+1+perm[jj+1]] % 12;

    // Calculate the contribution from the three corners
    double t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) n0 = 0.0;
    else {
    t0 *= t0;
    n0 = t0 * t0 * dot(grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
    }

    double t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) n1 = 0.0;
    else {
    t1 *= t1;
    n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
    }

    double t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) n2 = 0.0;
    else {
    t2 *= t2;
    n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
}
 */

