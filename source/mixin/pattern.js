// # Pattern mixin
// Most of the code relating to the [CanvasPattern API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) can be found here.
// + To create a pattern from an image asset, use the [Pattern factory](../factory/pattern.html).
// + We can also use a Scrawl-canvas [Cell](../factory/cell.html) as the asset for a pattern.
// + In both cases, we assign the pattern to an entity's `fillStyle` or `strokeStyle` attribute by supplying the Pattern object or Cell wrapper's String name to it.


// #### Imports
import { isa_number, mergeOver, Ωempty } from '../helper/utilities.js';

import { cell } from '../core/library.js';

// Shared constants
import { _isArray, BLANK, T_CELL, T_NOISE } from '../helper/shared-vars.js';

// Local constants
const _A = 'a',
    _B = 'b',
    _C = 'c',
    _D = 'd',
    _E = 'e',
    _F = 'f',
    MAT_POS = ['a', 'b', 'c', 'd', 'e', 'f'],
    MAT_REPEAT = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
    REPEAT = 'repeat';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __repeat__ - String indicating how to repeat the pattern's image. Possible values are: `repeat` (default), `repeat-x`, `repeat-y`, `no-repeat`
        repeat: REPEAT,

// __patternMatrix__ - Scrawl-canvas will apply a 2d-style, 6 value [DOMMatrix](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix) to the pattern each time it is recreated. Changing the values of the matrix will change the rotation, skew, etc of the pattern. Pseudo-attributes can be used to set individual elements of the matrix, as follows:
// + `stretchX` (or `matrixA`) - generally used for horizontal (x axis) scale
// + `skewY` (or `matrixB`) - generally used for horizontal (x axis) skew
// + `skewX` (or `matrixC`) - generally used for vertical (y axis) skew
// + `stretchY` (or `matrixD`) - generally used for vertical (y axis) scale
// + `shiftX` (or `matrixE`) - generally used for horizontal (x axis) positioning
// + `shiftY` (or `matrixF`) - generally used for vertical (y axis) positioning
//
// To rotate the pattern, update the B and C matrix values in tandem. Results will be dependent on the surrounding matrix values. See demo [Canvas-035](../../demo/canvas-035.html) to explore further.
        patternMatrix: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const S = P.setters,
        G = P.getters;

// __repeat__
    S.repeat = function (item) {

        if (MAT_REPEAT.includes(item)) this.repeat = item;
        else this.repeat = this.defs.repeat;
    };

// `checkMatrixExists` - internal helper function
    P.checkMatrixExists = function () {

        if (!this.patternMatrix) this.patternMatrix = new DOMMatrix();
    };

// `updateMatrixNumber` - internal helper function
    P.updateMatrixNumber = function (item, pos) {

        this.checkMatrixExists();

        item = (item.substring) ? parseFloat(item) : item;

        const posCheck = MAT_POS.includes(pos);

        if (isa_number(item) && posCheck) this.patternMatrix[pos] = item;
    };

// __matrixA__, __matrixB__, __matrixC__, __matrixD__, __matrixE__, __matrixF__ - these _pseudo-attributes_ can be used to set individual attributes of the `patternMatrix` DOMMatrix object
    S.matrixA = function (item) { this.updateMatrixNumber(item, _A); };
    S.matrixB = function (item) { this.updateMatrixNumber(item, _B); };
    S.matrixC = function (item) { this.updateMatrixNumber(item, _C); };
    S.matrixD = function (item) { this.updateMatrixNumber(item, _D); };
    S.matrixE = function (item) { this.updateMatrixNumber(item, _E); };
    S.matrixF = function (item) { this.updateMatrixNumber(item, _F); };

// __stretchX__, __skewY__, __skewX__, __stretchY__, __shiftX__, __shiftY__ - these _pseudo-attributes_ can be used to set individual attributes of the `patternMatrix` DOMMatrix object
    S.stretchX = function (item) { this.updateMatrixNumber(item, _A); };
    S.skewY = function (item) { this.updateMatrixNumber(item, _B); };
    S.skewX = function (item) { this.updateMatrixNumber(item, _C); };
    S.stretchY = function (item) { this.updateMatrixNumber(item, _D); };
    S.shiftX = function (item) { this.updateMatrixNumber(item, _E); };
    S.shiftY = function (item) { this.updateMatrixNumber(item, _F); };

// `retrieveMatrixNumber` - internal helper function
    P.retrieveMatrixNumber = function (pos) {

        this.checkMatrixExists();
        return this.patternMatrix[pos];
    };

    G.matrixA = function () { return this.retrieveMatrixNumber(_A); };
    G.matrixB = function () { return this.retrieveMatrixNumber(_B); };
    G.matrixC = function () { return this.retrieveMatrixNumber(_C); };
    G.matrixD = function () { return this.retrieveMatrixNumber(_D); };
    G.matrixE = function () { return this.retrieveMatrixNumber(_E); };
    G.matrixF = function () { return this.retrieveMatrixNumber(_F); };

    G.stretchX = function () { return this.retrieveMatrixNumber(_A); };
    G.skewY = function () { return this.retrieveMatrixNumber(_B); };
    G.skewX = function () { return this.retrieveMatrixNumber(_C); };
    G.stretchY = function () { return this.retrieveMatrixNumber(_D); };
    G.shiftX = function () { return this.retrieveMatrixNumber(_E); };
    G.shiftY = function () { return this.retrieveMatrixNumber(_F); };

// __patternMatrix__ - the argument must be an Array containing 6 Number elements in the form of `[a, b, c, d, e, f]`
    S.patternMatrix = function (item) {

        if (_isArray(item)) {

            const update = this.updateMatrixNumber;

            update(item[0], _A);
            update(item[1], _B);
            update(item[2], _C);
            update(item[3], _D);
            update(item[4], _E);
            update(item[5], _F);
        }
    };


// #### Prototype functions

// `buildStyle` - internal function: creates the pattern on the Cell's CanvasRenderingContext2D engine.
    P.buildStyle = function (mycell) {

        if (mycell) {

            if (mycell.substring) mycell = cell[mycell];

            let source = this.source,
                loaded = this.sourceLoaded;

            const repeat = this.repeat,
                engine = mycell.engine;

            if (this.type === T_CELL || this.type === T_NOISE) {

                source = this.element;
                loaded = true;
            }
            if (engine && loaded) {

                const p = engine.createPattern(source, repeat);

                p.setTransform(this.patternMatrix);

                return p;
            }
        }
        return BLANK;
    };
}
