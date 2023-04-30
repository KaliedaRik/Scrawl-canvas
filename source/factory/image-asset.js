// # ImageAsset factory
// The factory generates wrapper Objects around &lt;img> elements which can either be pulled from the current document (DOM-based assets), or fetched from the server using an URL address.
//
// Image-based assets can also be created from entity artefacts, groups of entity artefacts, and Cell wrappers
//
// ImageAssets are used by [Picture](./picture.html) and [Grid](./grid.html) entitys, and [Pattern](./pattern.html) styles.
//
// TODO: ImageAssets don't support animated `.gif` images (or if they do, then its entirely a lucky accident). Tested image formats are `.jpg` and `.png`.


// #### Demos:
// + [Canvas-008](../../demo/canvas-008.html) - Picture entity position; manipulate copy attributes
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility
// + [Canvas-023](../../demo/canvas-023.html) - Grid entity - using picture-based assets (image, video, sprite)
// + [Canvas-025](../../demo/canvas-025.html) - Responsive images


// #### Imports
import { artefact, canvas, cell, constructors, group } from '../core/library.js';

import { doCreate, isa_obj, mergeOver, λnull, λthis, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

import { _parse, ANONYMOUS, ASSET, ASSET_IMPORT_REGEX, BLOCK, ELEMENT, IMAGE_ELEMENTS, IMG, INTRINSIC, NONE, SLASH, T_CANVAS, T_CELL, T_GROUP, T_IMAGE, ZERO, ZERO_STR } from '../core/shared-vars.js';


// #### ImageAsset constructor
const ImageAsset = function (items = Ωempty) {

    return this.assetConstructor(items);
};


// #### ImageAsset prototype
const P = ImageAsset.prototype = doCreate();
P.type = T_IMAGE;
P.lib = ASSET;
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
baseMix(P);
assetMix(P);


// #### ImageAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
const defaultAttributes = {

// __intrinsicDimensions__ - Javascript object which defines the intrinsic dimensions of each image contributing to an &lt;img> element's `srcset` attribute. Can also be set in Javascript code:
// ```
// filename-String: [width-Number, height-Number]
// {
//     'river-300.jpg': [300, 225],
//     'river-600.jpg': [600, 450],
//     'river-900.jpg': [900, 675]
// }
// ```
    intrinsicDimensions: null,
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
const G = P.getters,
    S = P.setters;

// __source__
G.width = function () {

    return this.sourceNaturalWidth || this.source.naturalWidth || 0;
};
G.height = function () {

    return this.sourceNaturalHeight || this.source.naturalHeight || 0;
};

S.source = function (item) {

    if (item) {

        // For &lt;img> and &lt;picture> elements
        if (IMAGE_ELEMENTS.includes(item.tagName.toUpperCase())) {

            this.source = item;
            this.sourceNaturalWidth = item.naturalWidth;
            this.sourceNaturalHeight = item.naturalHeight;
            this.sourceLoaded = item.complete;
        }

        if (this.sourceLoaded) this.notifySubscribers();
    }
};

// __currentSrc__ - this attribute is not part of the defs object
S.currentSrc = function (item) {

    this.currentSrc = item;
    this.currentFile = this.currentSrc.split(SLASH).pop();
};


// #### Prototype functions

// `checkSource`
P.checkSource = function (width, height) {

    const el = this.source;

    let action = ELEMENT;

    if (this.sourceLoaded) {

        let iDims = this.intrinsicDimensions[this.currentFile];

        if (this.currentSrc !== el.currentSrc) {

            this.set({
                currentSrc: el.currentSrc
            });

            iDims = this.intrinsicDimensions[this.currentFile];

            if (iDims) action = INTRINSIC;
            else action = ZERO;
        }
        else if (iDims) action = INTRINSIC;

        switch (action) {

            case ZERO :

                this.sourceNaturalWidth = 0;
                this.sourceNaturalHeight = 0;
                this.notifySubscribers();
                break;

            case INTRINSIC :

                if (this.sourceNaturalWidth !== iDims[0] ||
                        this.sourceNaturalHeight !== iDims[1]) {

                    this.sourceNaturalWidth = iDims[0];
                    this.sourceNaturalHeight = iDims[1];

                    this.notifySubscribers();
                }
                break;

            default:

                if (this.sourceNaturalWidth !== el.naturalWidth ||
                        this.sourceNaturalHeight !== el.naturalHeight ||
                        this.sourceNaturalWidth !== width ||
                        this.sourceNaturalHeight !== height) {

                    this.sourceNaturalWidth = el.naturalWidth;
                    this.sourceNaturalHeight = el.naturalHeight;

                    this.notifySubscribers();
                }
        }
    }
};

// `gettableImageAssetAtributes`, `settableImageAssetAtributes` - exported Arrays.
export const gettableImageAssetAtributes = [];
export const settableImageAssetAtributes = [];


// #### Importing images into Scrawl-canvas

// `importImage` - load images from a remote server and create assets from them
//
// Arguments can be a comma-separated list of String urls. For example, for aimage file at server url `http://www.example.com/path/to/image/flower.jpg`:
// + Will attempt to give the new imageAsset object, and img element, a name/id value of eg 'flower' (but not guaranteed)
// + Will not add the new img element to the DOM
//
// Alternatively, the arguments can include an object with the following attributes:
// + __name__ string.
// + __src__ url string.
// + __parent__ CSS search string - if set, Scrawl-canvas will attempt to append the new img element to the corresponding DOM element.
// + __isVisible__ boolean - if true, and new img element has been added to DOM, make that image visible; default is false.
// + __className__ string - list of classes to be added to the new img element.
//
// Note: strings and object arguments can be mixed - Scrawl-canvas will interrrogate each argument in turn and take appropriate action to load the assets.
export const importImage = function (...args) {

    const results = [];

    args.forEach(item => {

        let name, url, className, visibility,
            parent = false;

        let flag = false;

        if (item.substring) {

            const match = ASSET_IMPORT_REGEX.exec(item);

            name = (match && match[1]) ? match[1] : ZERO_STR;
            url = item;
            className = ZERO_STR;
            visibility = false;

            flag = true;
        }
        else {

            item = (isa_obj(item)) ? item : false;

            if (item && item.src) {

                name = item.name || ZERO_STR;

                url = item.src;
                className = item.className || ZERO_STR;
                visibility = item.visibility || false;
                if (item.parent) parent = document.querySelector(item.parent);

                flag = true;
            }
        }

        if (flag) {

            const image = makeImageAsset({
                name: name,
                intrinsicDimensions: {},
            });

            const img = document.createElement(IMG);

            img.name = name;
            img.className = className;
            img.crossorigin = ANONYMOUS;

            img.style.display = (visibility) ? BLOCK : NONE;

            if (parent) parent.appendChild(img);

            img.onload = () => {

                image.set({
                    source: img,
                });
            };

            img.src = url;

            image.set({
                source: img,
            });

            results.push(name);
        }
        else results.push(false);
    });
    return results;
};

// `importDomImage` - import images defined in the web page HTML code
// + Required argument is a query string used to search the dom for matching elements
// + Scrawl-canvas does not remove &lt;img> elements from the DOM (this is a breaking change from Scrawl-canvas v7.0).
// + If &lt;img> elements should not appear, developers need to hide them in some way - for instance by positioning them (or their parent element) absolutely to the top or left of the display; or by giving their parent element zero width/height; or by setting their CSS: `display: none;`, `opacity: 0;`, etc.
export const importDomImage = function (query) {

    const items = document.querySelectorAll(query);

    items.forEach(item => {

        let name;

        if (IMAGE_ELEMENTS.includes(item.tagName.toUpperCase())) {

            if (item.id || item.name) name = item.id || item.name;
            else {

                const match = ASSET_IMPORT_REGEX.exec(item.src);
                name = (match && match[1]) ? match[1] : ZERO_STR;
            }

            let intrinsics = item.dataset.dimensions || {};
            if (intrinsics.substring) intrinsics = _parse(intrinsics);

            const image = makeImageAsset({
                name: name,
                source: item,
                intrinsicDimensions: intrinsics,
                currentSrc: item.currentSrc,
            });

            item.onload = () => {

                image.set({
                    source: item,
                });
            };
        }
    });
};

// We can get cells, groups and entitys to save their output as imagedata, which we can then use to build an asset which in turn can be used by Picture entitys and pattern styles
// + If the `stashAsAsset` argument is `true`, the asset will be created using the Cell/Group/entity name with `-image` suffixed to it as its id/name value
// + If `stashAsAsset` argument is a String, the asset will be created using that String as its id/name attribute

// `createImageFromCell`
export const createImageFromCell = function (item, stashAsAsset = false) {

    let mycell = (item.substring) ? cell[item] || canvas[item] : item;

    if (mycell.type == T_CANVAS) mycell = mycell.base;

    if (mycell.type == T_CELL) {

        mycell.stashOutput = true;

        if (stashAsAsset) mycell.stashOutputAsAsset = stashAsAsset;
    }
};

// `createImageFromGroup`
export const createImageFromGroup = function (item, stashAsAsset = false) {

    let mygroup;

    if (item && !item.substring) {

        if (item.type == T_GROUP) mygroup = item;
        else if (item.type == T_CELL) mygroup = group[item.name];
        else if (item.type == T_CANVAS) mygroup = group[item.base.name];
    }
    else if (item && item.substring) mygroup = group[item];

    if (mygroup) {

        mygroup.stashOutput = true;

        if (stashAsAsset) mygroup.stashOutputAsAsset = stashAsAsset;
    }
};

// `createImageFromEntity`
export const createImageFromEntity = function (item, stashAsAsset = false) {

    const myentity = (item.substring) ? artefact[item] : item;

    if (myentity.isArtefact) {

        myentity.stashOutput = true;

        if (stashAsAsset) myentity.stashOutputAsAsset = stashAsAsset;
    }
};


// #### Factory
export const makeImageAsset = function (items) {

    if (!items) return false;
    return new ImageAsset(items);
};

constructors.ImageAsset = ImageAsset;
