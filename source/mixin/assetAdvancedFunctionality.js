// # AssetAdvancedFunctionality mixin
// The following functionality is shared between NoiseAsset, ArtAsset and RdAsset objects


// #### Imports
import { mergeOver, pushUnique, λnull, Ωempty } from '../core/utilities.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    let defaultAttributes = {

        // __color__ - String value determining how the generated noise will be output on the canvas. Currently recognised values are: `monochrome` (default), `gradient` and `hue`
        color: 'monochrome',

        // When the `color` choice has been set to `monochrome` we can clamp the pixel values using the __monochromeStart__ and __monochromeRange__ attributes, both of which take integer Numbers. 
        // + Accepted monochromeStart values are 0 to 255
        // + Accepted monochromeRange values are -255 to 255
        // + Be aware that the monochromeRange value will be recalculated to make sure calculated pixel values remain in the 0-255 color channel range
        monochromeStart: 0,
        monochromeRange: 255,

        // When the `color` choice has been set to `gradient` we can control the start and end colors of the gradient using the __gradientStart__ and __gradientEnd__ attributes
        gradientStart: '#ff0000',
        gradientEnd: '#00ff00',

        // When the `color` choice has been set to `hue` we can control the pixel colors (in terms of their HSL components) using the __hueStart__, __hueRange__, __saturation__ and __luminosity__ attributes:
        // + `hueStart` - float Number value in degrees, will be clamped to between 0 and 360
        // + `hueRange` - float Number value in degrees, can be negative as well as positive
        // + `saturation` - float Number value, between 0 and 100
        // + `luminosity` - float Number value, between 0 and 100
        hueStart: 0,
        hueRange: 120,
        saturation: 100,
        luminosity: 50,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet management functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    let G = P.getters, 
        S = P.setters, 
        D = P.deltaSetters;


    P.supportedColorSchemes = ['monochrome', 'gradient', 'hue'];
    S.color = function (item) {

        if (this.supportedColorSchemes.indexOf(item) >= 0) {

            this.color = item;
            this.dirtyOutput = true;
        }
    };

    S.gradientStart = function (item) {

        if (item.substring) {

            this.colorFactory.setMinimumColor(item);
            this.dirtyOutput = true;
        }
    };

    S.gradientEnd = function (item) {

        if (item.substring) {

            this.colorFactory.setMaximumColor(item);
            this.dirtyOutput = true;
        }
    };

    S.monochromeStart = function (item) {

        if (item.toFixed && item >= 0) {

            this.monochromeStart = item % 360;
            this.dirtyOutput = true;
        }
    };

    S.monochromeRange = function (item) {

        if (item.toFixed && item >= -255 && item < 256) {

            this.monochromeRange = Math.floor(item);
            this.dirtyOutput = true;
        }
    };

    S.hueStart = function (item) {

        if (item.toFixed) {

            this.hueStart = item;
            this.dirtyOutput = true;
        }
    };

    S.hueRange = function (item) {

        if (item.toFixed) {

            this.hueRange = item;
            this.dirtyOutput = true;
        }
    };

    S.saturation = function (item) {

        if (item.toFixed && item >= 0 && item <= 100) {

            this.saturation = Math.floor(item);
            this.dirtyOutput = true;
        }
    };

    S.luminosity = function (item) {

        if (item.toFixed && item >= 0 && item <= 100) {

            this.luminosity = Math.floor(item);
            this.dirtyOutput = true;
        }
    };


// #### Prototype functions

    // `installElement` - internal function, used by the constructor
    P.installElement = function (element) {

        this.element = element;
        this.engine = this.element.getContext('2d');

        return this;
    };

    // `checkSource`
    // + Gets invoked by subscribers (who have a handle to the asset instance object) as part of the display cycle.
    // + ArtAsset assets will automatically pass this call onto `notifySubscribers`, where dirty flags get checked and rectified
    P.checkSource = function (width, height) {

        this.notifySubscribers();
    };

    // `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
    // + This is the point when we clean Scrawl-canvas assets which have told their subscribers that asset data/attributes have updated
    P.getData = function (entity, cell) {

        this.notifySubscribers();

        return this.buildStyle(cell);
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

                let {element, engine, width, height, color, colorFactory, monochromeStart, monochromeRange, hueStart, hueRange, saturation, luminosity} = this;

                // Update the Canvas element's dimensions - this will also clear the canvas display
                element.width = width;
                element.height = height;

                let img = engine.getImageData(0, 0, width, height),
                    d = img.data,
                    len = width * height,
                    i, v, c;

                // Rebuild the display, pixel-by-pixel
                switch (color) {

                    case 'hue' :

                        for (i = 0; i < len; i++) {

                            v = hueStart + (this.getOutputValue(i, width) * hueRange);
                            if (v < 0) v += 360;
                            if (v > 360) v %= 360;

                            let [r, g, b] = colorFactory.getRGBfromHSL(v, saturation, luminosity);

                            c = i * 4;

                            d[c] = r;
                            d[++c] = g;
                            d[++c] = b;
                            d[++c] = 255;
                        }
                        break;

                    case 'gradient' :

                        for (i = 0; i < len; i++) {

                            v = this.getOutputValue(i, width);
                            colorFactory.convert(colorFactory.getRangeColor(v));

                            let {r, g, b, a} = colorFactory; 
                            
                            c = i * 4;

                            d[c] = r;
                            d[++c] = g;
                            d[++c] = b;
                            d[++c] = Math.floor(a * 255);
                        }
                        break;

                    // The default color preference is monochrome
                    default :

                        if (monochromeRange > 0) {

                            if (monochromeStart + monochromeRange > 255) monochromeRange = 255 - monochromeStart;
                        }
                        else if (monochromeRange < 0) {

                            if (monochromeStart - monochromeRange < 0) monochromeRange = monochromeStart;
                        }

                        for (i = 0; i < len; i++) {

                            v = Math.floor(monochromeStart + (this.getOutputValue(i, width) * monochromeRange));

                            c = i * 4;

                            d[c] = v;
                            d[++c] = v;
                            d[++c] = v;
                            d[++c] = 255;
                        }
                }
                engine.putImageData(img, 0, 0);
            }
        }
    };

// Return the prototype
    return P;
};
