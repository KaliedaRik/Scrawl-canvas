// # SpriteAsset factory
// The factory generates wrapper Objects around spritesheet &lt;img> elements fetched from the server using an URL address.
// + Scrawl-canvas expects every spritesheet to be accompanied by a __manifest__, defined in either a `.json` encoded file, or a Javascript object. There is no single source of truth for the requirements or format of manifests, so Scrawl-canvas uses its own manifest format.
//
// SpriteAssets are used by [Picture](./picture.html) and [Grid](./grid.html) entitys, and [Pattern](./pattern.html) styles.
//
// TODO: SpriteAssets don't support animated `.gif` images (or if they do, then its entirely a lucky accident). Tested image formats are `.jpg` and `.png`.


// #### Demos:
// + [Canvas-021](../../demo/canvas-021.html) - Import and use spritesheets
// + [Canvas-023](../../demo/canvas-023.html) - Grid entity - using picture-based assets (image, video, sprite)


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, isa_obj, λnull, λthis, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';


// #### SpriteAsset constructor
const SpriteAsset = function (items = Ωempty) {

    this.assetConstructor(items);

    return this;
};


// #### SpriteAsset prototype
let P = SpriteAsset.prototype = Object.create(Object.prototype);
P.type = 'Sprite';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
// + [base](../mixin/base.html)
// + [asset](../mixin/asset.html)
P = baseMix(P);
P = assetMix(P);


// #### SpriteAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
let defaultAttributes = {

// __manifest__ - TODO - documentation
    manifest: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// Assets do not take part in the packet or clone systems; they can, however, be used for importing and actioning packets as they retain those base functions
P.saveAsPacket = function () {

    return [this.name, this.type, this.lib, {}];
};
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;


// #### Clone management
P.clone = λthis;


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __source__
S.source = function (items = []) {

    if (items && items[0]) {

        if (!this.sourceHold) this.sourceHold = {};

        let hold = this.sourceHold;

        items.forEach(item => {

            let name = item.id || item.name;

            if (name) hold[name] = item;
        })

        this.source = items[0];
        this.sourceNaturalWidth = items[0].naturalWidth;
        this.sourceNaturalHeight = items[0].naturalHeight;
        this.sourceLoaded = items[0].complete;
    }
};



// #### Prototype functions

// Sprite assets do not use the `checkSource` function. Instead, Picture entitys will interrogate the checkSpriteFrame function (defined in mixin/assetConsumer.js)
P.checkSource = λnull;

// `gettableSpriteAssetAtributes`, `settableSpriteAssetAtributes` - exported Arrays.
const gettableSpriteAssetAtributes = [];
const settableSpriteAssetAtributes = [];


// #### Importing spritesheets into Scrawl-canvas

// `importSprite` - load sprite images and manifest files from a remote server and create assets from them
//
// Arguments can be a comma-separated list of String urls. For example, for a spritesheet at server url `http://www.example.com/path/to/image/flower.jpg`:
// + Will attempt to give the new spriteAsset object, and img element, a name/id value of eg 'flower' (but not guaranteed)
// + Will attempt to load the associated manifest JSON file, which it expects to find at '/path/to/image/flower.json'
// + Will not add the new img element to the DOM
//
// Note: if using an url string path to import the spritesheet image, a manifest JSON file with the same filename (ending in `.json`) in the same folder __must__ also be supplied!

// Alternatively, the arguments can include an object with the following attributes:
// + __name__ string.
// + __imageSrc__ (required) image url string, or an Array of such strings (for sprites using frames from multiple spritesheets).
// + __manifestSrc__ (required) JSON manifest file url string, or an object detailing the manifest.
// + __parent__ CSS search string - if set, Scrawl-canvas will attempt to append the new img element to the corresponding DOM element.
// + __isVisible__ boolean - if true, and new img element has been added to DOM, make that image visible; default is false.
// + __className__ string - list of classes to be added to the new img element.
//
// Note: strings and object arguments can be mixed - Scrawl-canvas will interrrogate each argument in turn and take appropriate action to load the assets.
//
// The __manifest__ must resolve to an object containing a set of attributes which represent 'tracks' - sequences of frames which, when run, will result in a particular animation (eg 'walk', 'turn', 'fire-arrow', 'die', etc). Each track attribute is an Array of arrays, with each sub-array supplying details of the source file, copy start coordinates, and copy dimensions for each frame:
// ```
// manifestSrc: {
//
//     "default" : [
//         ['picturename', copyStartX, copyStartY, width, height]
//     ],
//
//     "walk": [
//         ['picturename', copyStartX, copyStartY, width, height]
//         ['picturename', copyStartX, copyStartY, width, height]
//         ['picturename', copyStartX, copyStartY, width, height]
//     ],
// }
// ```
// + Note that the frames for any track can be spread across more than one spritesheet image file.
// Note also that the __default__ track is mandatory, and should consist of at least one frame.
const importSprite = function (...args) {

    let reg = /.*\/(.*?)\./,
        fileTlas = /\.(jpeg|jpg|png|gif|webp|svg|JPEG|JPG|PNG|GIF|WEBP|SVG)/,
        results = [];

    args.forEach(item => {

        // Load the sprite image in the normal way
        let name, urls, className, visibility, manifest, 
            parent = false;

        let flag = false;

        if (item.substring) {

            let match = reg.exec(item);

            name = (match && match[1]) ? match[1] : '';
            urls = [item];
            className = '';
            visibility = false;
            manifest = item.replace(fileTlas, '.json');

            flag = true;
        }
        else {

            if (!isa_obj(item) || !item.imageSrc || !item.manifestSrc) results.push(false);
            else {

                name = item.name || '';

                urls = Array.isArray(item.imageSrc) ? item.imageSrc : [item.imageSrc];
                manifest = item.manifestSrc;
                className = item.className || '';
                visibility = item.visibility || false;
                parent = document.querySelector(item.parent);

                flag = true;
            }
        }

        if (flag) {

            let image = makeSpriteAsset({
                name: name,
            });

            // Get manifest
            if (isa_obj(manifest)) image.manifest = manifest;
            else {

                fetch(manifest)
                .then(response => {

                    if (response.status !== 200) throw new Error('Failed to load manifest');
                    return response.json();
                })
                .then(jsonString => image.manifest = jsonString)
                .catch(err => console.log(err.message));
            }

            let imgArray = [];

            urls.forEach(url => {

                let img = document.createElement('img'),
                    filename, match;

                if (fileTlas.test(url)) {

                    match = reg.exec(url);
                    filename = (match && match[1]) ? match[1] : '';
                }

                img.name = filename || name;
                img.className = className;
                img.crossorigin = 'anonymous';

                img.style.display = (visibility) ? 'block' : 'none';

                if (parent) parent.appendChild(img);
                
                img.src = url;

                imgArray.push(img);
            });

            image.set({
                source: imgArray,
            });

            results.push(name);
        }
        else results.push(false);
    });
    return results;
};

// TODO: Scrawl-canvas does not yet support importing spritesheets defined in the web page HTML code


// #### Factory
const makeSpriteAsset = function (items) {

    if (!items) return false;
    return new SpriteAsset(items);
};

constructors.SpriteAsset = SpriteAsset;


// #### Exports
export {
    makeSpriteAsset,

    gettableSpriteAssetAtributes,
    settableSpriteAssetAtributes,

    importSprite,
};


// Examples used in Demos
// + Dino - https://www.gameart2d.com/free-dino-sprites.html
// + Wolf - https://opengameart.org/content/lpc-wolf-animation
// + Wall tiles - https://opengameart.org/content/2d-wall-tilesets
// + Bunny sprite - https://opengameart.org/content/bunny-sprite
// + Cat - https://www.kisspng.com/png-walk-cycle-css-animations-drawing-sprite-sprite-1064760/
