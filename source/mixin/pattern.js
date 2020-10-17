// # Pattern mixin
// Most of the code relating to the [CanvasPattern API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) can be found here.
// + To create a pattern from an image asset, use the [Pattern factory](../factory/pattern.html).
// + We can also use a Scrawl-canvas [Cell](../factory/cell.html) as the asset for a pattern.
// + In both cases, we assign the pattern to an entity's `fillStyle` or `strokeStyle` attribute by supplying the Pattern object or Cell wrapper's String name to it.


// #### Imports
import { mergeOver } from '../core/utilities.js';
import { cell } from '../core/library.js';


// #### Export function
export default function (P = {}) {


// #### Shared attributes
    let defaultAttributes = {

// __repeat__ - String indicating how to repeat the pattern's image. Possible values are: `repeat` (default), `repeat-x`, `repeat-y`, `no-repeat`
        repeat: 'repeat',

// __patternMatrix?__ - Float Number values - Scrawl-canvas will apply a 2d-style, 6 value [DOMMatrix](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix) to the pattern each time it is recreated. Changing these values will change the rotation, skew, etc of the pattern.
        matrixA: 1,
        matrixB: 0,
        matrixC: 0,
        matrixD: 1,
        matrixE: 0,
        matrixF: 0,
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


// #### Prototype functions

// `buildStyle` - internal function: creates the pattern on the Cell's CanvasRenderingContext2D engine.
    P.buildStyle = function (mycell = {}) {

        if (mycell) {

            if (mycell.substring) mycell = cell[mycell];

            let source = this.source, 
                loaded = this.sourceLoaded,
                repeat = this.repeat,
                engine = mycell.engine;

            if (this.type === 'Cell') {

                source = this.element;
                loaded = true;
            }

            if (engine && loaded) {

                let {matrixA:a, matrixB:b, matrixC:c, matrixD:d, matrixE:e, matrixF:f} = this;

                let p = engine.createPattern(source, repeat),
                    m = new DOMMatrix([a, b, c, d, e, f]);

                p.setTransform(m);

                return p;
            }
        }
        return 'rgba(0,0,0,0)';
    };


// Return the prototype
    return P;
};
