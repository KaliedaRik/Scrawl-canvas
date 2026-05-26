// # Pattern mixin
// Most of the code relating to the [CanvasPattern API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) can be found here.
// + To create a pattern from an image asset, use the [Pattern factory](../factory/pattern.html).
// + We can also use a Scrawl-canvas [Cell](../factory/cell.html) as the asset for a pattern.
// + In both cases, we assign the pattern to an entity's `fillStyle` or `strokeStyle` attribute by supplying the Pattern object or Cell wrapper's String name to it.


// #### Imports
import { mergeOver, Ωempty } from '../helper/utilities.js';

import { cell } from '../core/library.js';

// Shared constants
import { BLANK, DRAW, FILL, T_CELL, T_NOISE } from '../helper/shared-vars.js';

// Local constants
const MAT_REPEAT = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
    REPEAT = 'repeat';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __repeat__ - String indicating how to repeat the pattern's image. Possible values are: `repeat` (default), `repeat-x`, `repeat-y`, `no-repeat`
        repeat: REPEAT,

// Pattern matrix values
        patternStretchX: 1,
        patternStretchY: 1,
        patternSkewX: 0,
        patternSkewY: 0,
        patternShiftX: 0,
        patternShiftY: 0,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const S = P.setters;

// __repeat__
    S.repeat = function (item) {

        if (MAT_REPEAT.includes(item)) this.repeat = item;
        else this.repeat = this.defs.repeat;
    };


// #### Prototype functions
    P.initializePattern = function () {

        this.currentPatternMatrix = new DOMMatrix();
    };

// `buildStyle` - internal function: creates the pattern on the Cell's CanvasRenderingContext2D engine.
    P.buildStyle = function (mycell, myentity, area) {

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

                if (p) {

                    const {
                        patternStretchX,
                        patternStretchY,
                        patternSkewX,
                        patternSkewY,
                        patternShiftX,
                        patternShiftY,
                    } = this;

                    const matrix = this.currentPatternMatrix;

                    // Base pattern-owned transform
                    matrix.a = patternStretchX;
                    matrix.b = patternSkewY;
                    matrix.c = patternSkewX;
                    matrix.d = patternStretchY;
                    matrix.e = patternShiftX;
                    matrix.f = patternShiftY;

                    if (
                        (area === FILL && myentity.lockFillStyleToEntity) ||
                        (area === DRAW && myentity.lockStrokeStyleToEntity)
                    ) {

                        const scale = myentity.currentScale || 1;

                        // Entity scale is not part of the canvas transform.
                        // + Add it only when the pattern is entity-locked.
                        matrix.a *= scale;
                        matrix.b *= scale;
                        matrix.c *= scale;
                        matrix.d *= scale;
                        matrix.e *= scale;
                        matrix.f *= scale;
                    }
                    else {

                        // The engine is already translated/rotated for the entity.
                        // + Undo that transform so the pattern behaves as cell-locked.
                        const inverse = engine.getTransform().invertSelf();

                        matrix.preMultiplySelf(inverse);
                    }

                    p.setTransform(matrix);

                    return p;
                }
            }
        }
        return BLANK;
    };
}
