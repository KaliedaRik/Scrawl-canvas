// # AssetAdvancedFunctionality mixin
// The following functionality is shared between NoiseAsset and RdAsset objects


// #### Imports
import { 
    mergeOver, 
    pushUnique, 
    λnull, 
    Ωempty, 
} from '../core/utilities.js';

import { 
    _floor,
    _now,
} from '../core/shared-vars.js';

import { makeGradient } from '../factory/gradient.js';


// Local constants
const _2D = '2d',
    CANVAS = 'canvas',
    PC100 = '100%';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

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

        const element = document.createElement(CANVAS);
        element.id = name;
        this.element = element;
        this.engine = this.element.getContext(_2D, {
            willReadFrequently: true,
        });

        // The color canvas allows us to map contour-like lines across a noise or rd asset's output.
        const color = document.createElement(CANVAS);
        color.id = `${name}-color`;
        color.width = 256;
        color.height = 1;
        this.colorElement = color;
        this.colorEngine = this.colorElement.getContext(_2D, {
            willReadFrequently: true,
        });

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
    P.checkSource = function (width, height) {

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

                const {element, engine, width, height, colorElement, colorEngine, gradient, choke, gradientLastUpdated } = this;

                const palette = gradient.palette;

                // Update the Canvas element's dimensions - this will also clear the canvas display
                element.width = width;
                element.height = height;

                const img = engine.getImageData(0, 0, width, height),
                    iData = img.data,
                    len = width * height;
                
                let i, v, c;

                const now = _now();

                if (gradientLastUpdated + choke < now) {

                    gradient.updateByDelta();
                    this.gradientLastUpdated = now;
                }

                if (palette.dirtyPalette) palette.recalculate();

                const lg = colorEngine.createLinearGradient(0, 0, 255, 0);

                gradient.addStopsToGradient(lg, gradient.paletteStart, gradient.paletteEnd, gradient.cyclePalette);

                colorEngine.fillStyle = lg;
                colorEngine.fillRect(0, 0, 256, 1);

                const gData = colorEngine.getImageData(0, 0, 256, 1).data;

                for (i = 0; i < len; i++) {

                    v = _floor(this.getOutputValue(i, width) * 255) * 4;
                    
                    c = i * 4;

                    iData[c] = gData[v];
                    iData[++c] = gData[++v];
                    iData[++c] = gData[++v];
                    iData[++c] = gData[++v];
                }
                engine.putImageData(img, 0, 0);
            }
        }
    };
};
