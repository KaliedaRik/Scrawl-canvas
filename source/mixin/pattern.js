// # Pattern mixin
// Most of the code relating to the [CanvasPattern API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) can be found here.
// + To create a pattern from an image asset, use the [Pattern factory](../factory/pattern.html).
// + We can also use a Scrawl-canvas [Cell](../factory/cell.html) as the asset for a pattern.
// + In both cases, we assign the pattern to an entity's `fillStyle` or `strokeStyle` attribute by supplying the Pattern object or Cell wrapper's String name to it.


// #### Imports
import { mergeOver, isa_number, Ωempty } from '../core/utilities.js';
import { cell } from '../core/library.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    let defaultAttributes = {

// __repeat__ - String indicating how to repeat the pattern's image. Possible values are: `repeat` (default), `repeat-x`, `repeat-y`, `no-repeat`
        repeat: 'repeat',

// __patternMatrix__ - Scrawl-canvas will apply a 2d-style, 6 value [DOMMatrix](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix) to the pattern each time it is recreated. Changing the values of the matrix will change the rotation, skew, etc of the pattern. Pseudo-attributes can be used to set individual elements of the matrix, as follows:
// + `matrixA` - generally used for horizontal (x axis) scale
// + `matrixB` - generally used for horizontal (x axis) skew
// + `matrixC` - generally used for vertical (y axis) skew
// + `matrixD` - generally used for vertical (y axis) scale
// + `matrixE` - generally used for horizontal (x axis) positioning
// + `matrixF` - generally used for vertical (y axis) positioning
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
    let S = P.setters;

// __repeat__
    P.repeatValues = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'];
    S.repeat = function (item) {

        if (this.repeatValues.indexOf(item) >= 0) this.repeat = item;
        else this.repeat = this.defs.repeat;
    };

// `updateMatrixNumber` - internal helper function
    P.matrixNumberPosCheck = ['a', 'b', 'c', 'd', 'e', 'f'];

    P.updateMatrixNumber = function (item, pos) {

        if (!this.patternMatrix) this.patternMatrix = new DOMMatrix();

        item = (item.substring) ? parseFloat(item) : item;

        let posCheck = this.matrixNumberPosCheck.indexOf(pos);

        if (isa_number(item) && posCheck >= 0) this.patternMatrix[pos] = item;
    };

// __matrixA__, __matrixB__, __matrixC__, __matrixD__, __matrixE__, __matrixF__ - these _pseudo-attributes_ can be used to set individual attributes of the `patternMatrix` DOMMatrix object
    S.matrixA = function (item) { this.updateMatrixNumber(item, 'a'); };
    S.matrixB = function (item) { this.updateMatrixNumber(item, 'b'); };
    S.matrixC = function (item) { this.updateMatrixNumber(item, 'c'); };
    S.matrixD = function (item) { this.updateMatrixNumber(item, 'd'); };
    S.matrixE = function (item) { this.updateMatrixNumber(item, 'e'); };
    S.matrixF = function (item) { this.updateMatrixNumber(item, 'f'); };

// __patternMatrix__ - the argument must be an Array containing 6 Number elements in the form of `[a, b, c, d, e, f]`
    S.patternMatrix = function (item) {

        if (Array.isArray(item)) {

            let update = this.updateMatrixNumber;

            update(item[0], 'a');
            update(item[1], 'b');
            update(item[2], 'c');
            update(item[3], 'd');
            update(item[4], 'e');
            update(item[5], 'f');
        }
    };


// #### Prototype functions

// `buildStyle` - internal function: creates the pattern on the Cell's CanvasRenderingContext2D engine.
    P.buildStyle = function (mycell) {

        if (mycell) {

            if (mycell.substring) mycell = cell[mycell];

            let source = this.source, 
                loaded = this.sourceLoaded,
                repeat = this.repeat,
                engine = mycell.engine;

            if (this.type === 'Cell' || this.type === 'Noise') {

                source = this.element;
                loaded = true;
            }
            if (engine && loaded) {

                let p = engine.createPattern(source, repeat);

                p.setTransform(this.patternMatrix);

                return p;
            }
        }
        return 'rgba(0,0,0,0)';
    };

// Return the prototype
    return P;
};
