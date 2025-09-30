// # AssetAdvancedFunctionality mixin
// The following functionality is shared between NoiseAsset and RdAsset objects


// #### Imports
import { mergeOver, λnull, Ωempty } from '../helper/utilities.js';

import { makeGradient } from '../factory/gradient.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

// Shared constants
import { _floor, _now, _2D, CANVAS, PC100 } from '../helper/shared-vars.js';

// Local constants (none defined)


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __choke__ - used to limit the number of times the assets that use this mixin repaint their display canvases.
// + For example, the `asset-management/reaction-diffusion-asset.js` asset may run multiple iterations of its calculations in batches; we need to make sure the canvas repainting functionality does not trigger after each separate iteration.
        choke: 15,

// __paletteStart__, __paletteEnd__ _pseudo-attributes_ - We don't need to use the entire palette when building a gradient; we can restrict the palette using these start and end attributes.

// The __cyclePalette__  _pseudo-attribute_ tells the Palette object how to handle situations where the paletteStart value is greater than the paletteEnd value:
// + when false, we reverse the color stops
// + when true, we keep the normal order of color stops and pass through the 1/0 border

// The Gradient's __delta__ object is not stored in the defs object; it acts in a similar way to the artefact delta object - though it is restricted to adding delta values to Number and 'String%' attributes.
//
// The __colors__ _pseudo-attribute_ can be used to pass through an array of palette color objects to the Gradient Palette object. The data is not retained by the gradient object.
// + A better approach to managing gradient colors after it has been created is to use the `gradient.updateColor` and `gradient.removeColor` functions

// The __easing__ _pseudo-attribute_ represents a transformation that will be applied to a copy of the color stops Array - this allows us to create non-linear gradients. Value is passed through to the Palette object

// The __precision__ _pseudo-attribute_ - value is passed through to the Gradient Palette object

// The __colorSpace__ - String _pseudo-attribute_ defines the color space to be used by the Gradient Palette's Color object for its internal calculations - value is passed through to the Palette object
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH'` with `RGB` as the default
//
// The __returnColorAs__ - String _pseudo-attribute_ defines the type of color String the Gradient Palette's Color object will return - value is passed through to the Gradient Palette object
// + Accepted values from: `'RGB', 'HSL', 'HWB', 'LAB', 'LCH', 'OKLAB', 'OKLCH'` with `RGB` as the default
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet management functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
// These all route get/set/setDelta attribute changes through to the Gradient object
    const S = P.setters,
        D = P.deltaSetters;

    S.paletteStart = function (item) {

        if (this.gradient) this.gradient.set({ paletteStart: item });
    };
    D.paletteStart = function (item) {

        if (this.gradient) this.gradient.setDelta({ paletteStart: item });
    };

    S.paletteEnd = function (item) {

        if (this.gradient) this.gradient.set({ paletteEnd: item });
    };

    D.paletteEnd = function (item) {

        if (this.gradient) this.gradient.setDelta({ paletteEnd: item });
    };

    S.colors = function (item) {

        if (this.gradient) this.gradient.set({ colors: item });
    };

    S.precision = function (item) {

        if (this.gradient) this.gradient.set({ precision: item });
    };

    S.easing = function (item) {

        if (this.gradient) this.gradient.set({ easing: item });
    };
    S.easingFunction = S.easing;

    S.colorSpace = function (item) {

        if (this.gradient) this.gradient.set({ colorSpace: item });
    };
    S.returnColorAs = function (item) {

        if (this.gradient) this.gradient.set({ returnColorAs: item });
    };

    S.cyclePalette = function (item) {

        if (this.gradient) this.gradient.set({ cyclePalette: item });
    };

    S.delta = function (items = Ωempty) {

        if (this.gradient) this.gradient.set({ delta: items });
    };


// #### Prototype functions

    // `installElement` - internal function, used by the constructor
    P.installElement = function (name) {

        // Every asset factory that uses this mixin gets its own non-DOM-attached &lt;canvas> element primed with a 2D context engine. This canvas is used to display the visual representation of the asset:
        // + For `asset-management/noise-asset.js`, the noise data is held internally, and a display of that data gets generated via this mixin
        // + The same applies for `asset-management/reaction-diffusion-asset.js`
        const element = document.createElement(CANVAS);
        element.id = name;
        this.element = element;
        this.engine = this.element.getContext(_2D, {
            willReadFrequently: true,
        });

        // Asset factories like `noise-asset` and `reaction-diffusion-asset` store their output in a noise output Array of Arrays - each value is a float in the range 0.0 to 1.0.
        // + We can colourise this output - as we fetch it and paint it into the asset's display canvas - using a small (256px x 1px) canvas-generated gradient, where we map the color to be used for that pixel to the 256-color-long gradient where a value of 0.0 maps to color 0 and a value of 1.0 maps to color 255.
        this.gradient = makeGradient({
            name: `${name}-gradient`,
            endX: PC100,
            delta: {
                paletteStart: 0,
                paletteEnd: 0,
            },
            cyclePalette: false,
        });

        this.gradientLastUpdated = 0;

        return this;
    };

    // `checkSource`
    // + Gets invoked by subscribers (who have a handle to the asset instance object) as part of the display cycle.
    // + Assets will automatically pass this call onto `notifySubscribers`, where dirty flags get checked and rectified
    P.checkSource = function () {

        this.notifySubscribers();
    };

    // `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
    // + This is the point when we clean Scrawl-canvas assets which have told their subscribers that asset data/attributes have updated
    P.getData = function (entity, cell) {

        this.notifySubscribers();

        return this.buildStyle(cell);
    };

    // `notifySubscribers` - If the gradient is to be animated, then we need to update the asset at some point (generally the start) of each Display cycle by invoking this function
    P.update = function () {

        this.dirtyOutput = true;
    };

    // `notifySubscribers`, `notifySubscriber` - overwrites the functions defined in mixin/asset.js
    P.notifySubscribers = function () {

        if (this.dirtyOutput) this.cleanOutput();

        this.subscribers.forEach(sub => this.notifySubscriber(sub), this);
    };

    P.notifySubscriber = function (sub) {

        sub.sourceNaturalWidth = this.width;
        sub.sourceNaturalHeight = this.height;
        sub.sourceLoaded = true;
        sub.source = this.element;
        sub.dirtyImage = true;
        sub.dirtyCopyStart = true;
        sub.dirtyCopyDimensions = true;
        sub.dirtyImageSubscribers = true;
    };

    // `paintCanvas` - internal function called by the `cleanOutput` function
    P.paintCanvas = function () {

        if (this.checkOutputValuesExist()) {

            if (this.dirtyOutput) {

                this.dirtyOutput = false;

                const {element, engine, width, height, gradient, choke, gradientLastUpdated } = this;

                // Update the display element's dimensions - this will also clear the canvas display
                element.width = width;
                element.height = height;

                // Grab an ImageData object which we can use to quickly colorize the display output
                const img = engine.getImageData(0, 0, width, height),
                    iData = img.data,
                    len = width * height;

                const now = _now();

                if (gradientLastUpdated + choke < now) {

                    gradient.updateByDelta();

                    this.gradientLastUpdated = now;
                }

                // We use a pool cell to generate the current gradient. Note that gradients can be manipulated and animated in various ways
                const myCell = requestCell();
                const { element: helperElement, engine: helperEngine } = myCell;

                // Generate the gradient, and grab its display from the pool cell
                helperElement.width = 255;
                helperElement.height = 1;

                const linGrad = helperEngine.createLinearGradient(0, 0, 255, 0);

                gradient.addStopsToGradient(linGrad, gradient.paletteStart, gradient.paletteEnd, gradient.cyclePalette);

                helperEngine.fillStyle = linGrad;
                helperEngine.fillRect(0, 0, 256, 1);

                const gData = helperEngine.getImageData(0, 0, 256, 1).data;

                // Release the pool cell back into the wild
                releaseCell(myCell);

                // Colorize the display canvas's ImageData data array
                let i, v, c;

                for (i = 0; i < len; i++) {

                    v = _floor(this.getOutputValue(i, width) * 255) * 4;

                    c = i * 4;

                    iData[c] = gData[v];
                    iData[++c] = gData[++v];
                    iData[++c] = gData[++v];
                    iData[++c] = gData[++v];
                }

                // Copy the updated display data back into the display canvas
                engine.putImageData(img, 0, 0);
            }
        }
    };

    // Factories using this mixin need to overwrite these function attributes with useful code specific to the way they store asset output data
    P.checkOutputValuesExist = λnull;
    P.getOutputValue = λnull;
}
