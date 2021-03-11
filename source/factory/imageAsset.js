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
import { constructors, canvas, cell, group, artefact } from '../core/library.js';
import { mergeOver, isa_obj, λthis, λnull, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';


// #### ImageAsset constructor
const ImageAsset = function (items = Ωempty) {

    return this.assetConstructor(items);
};


// #### ImageAsset prototype
let P = ImageAsset.prototype = Object.create(Object.prototype);
P.type = 'Image';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
P = baseMix(P);
P = assetMix(P);


// #### ImageAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
let defaultAttributes = {

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
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __source__
S.source = function (item) {

    if (item) {

        // For &lt;img> and &lt;picture> elements
        if (['IMG', 'PICTURE'].indexOf(item.tagName.toUpperCase()) >= 0) {

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
    this.currentFile = this.currentSrc.split("/").pop();
};


// #### Prototype functions

// `checkSource`
P.checkSource = function (width, height) {

    let el = this.source,
        action = 'element';

    if (this.sourceLoaded) {

        let iDims = this.intrinsicDimensions[this.currentFile];

        if (this.currentSrc !== el.currentSrc) {

            this.set({
                currentSrc: el.currentSrc
            });

            iDims = this.intrinsicDimensions[this.currentFile];
            
            if (iDims) action = 'intrinsic';
            else action = 'zero';
        }
        else if (iDims) action = 'intrinsic';

        switch (action) {

            case 'zero' :

                this.sourceNaturalWidth = 0;
                this.sourceNaturalHeight = 0;
                this.notifySubscribers();
                break;

            case 'intrinsic' :

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
        };
    }
};

// `gettableImageAssetAtributes`, `settableImageAssetAtributes` - exported Arrays.
const gettableImageAssetAtributes = [];
const settableImageAssetAtributes = [];


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
const importImage = function (...args) {

    let reg = /.*\/(.*?)\./,
        results = [];

    args.forEach(item => {

        let name, url, className, visibility, 
            parent = false;

        let flag = false;

        if (item.substring) {

            let match = reg.exec(item);

            name = (match && match[1]) ? match[1] : '';
            url = item;
            className = '';
            visibility = false;

            flag = true;
        }
        else {

            item = (isa_obj(item)) ? item : false;

            if (item && item.src) {

                name = item.name || '';

                url = item.src;
                className = item.className || '';
                visibility = item.visibility || false;
                if (item.parent) parent = document.querySelector(item.parent);

                flag = true;
            }
        }    

        if (flag) {

            let image = makeImageAsset({
                name: name,
                intrinsicDimensions: {},
            });

            let img = document.createElement('img');

            img.name = name;
            img.className = className;
            img.crossorigin = 'anonymous';

            img.style.display = (visibility) ? 'block' : 'none';

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
const importDomImage = function (query) {

    let reg = /.*\/(.*?)\./;

    let items = document.querySelectorAll(query);

    items.forEach(item => {

        let name;

        if (['IMG', 'PICTURE'].indexOf(item.tagName.toUpperCase()) >= 0) {

            if (item.id || item.name) name = item.id || item.name;
            else {

                let match = reg.exec(item.src);
                name = (match && match[1]) ? match[1] : '';
            }

            let intrinsics = item.dataset.dimensions || {};
            if (intrinsics.substring) intrinsics = JSON.parse(intrinsics);

            let image = makeImageAsset({
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

// `createImageFromCell`
const createImageFromCell = function (item, stashAsAsset = false) {

    let mycell = (item.substring) ? cell[item] || canvas[item] : item;

    if (mycell.type === 'Canvas') mycell = mycell.base;

    if (mycell.type === 'Cell') {

        mycell.stashOutput = true;

        if (stashAsAsset) mycell.stashOutputAsAsset = true;
    }
};

// `createImageFromGroup`
const createImageFromGroup = function (item, stashAsAsset = false) {

    let mygroup;

    if (item && !item.substring) {

        if (item.type === 'Group') mygroup = item;
        else if (item.type === 'Cell') mygroup = group[item.name];
        else if (item.type === 'Canvas') mygroup = group[item.base.name];
    }
    else if (item && item.substring) mygroup = group[item];

    if (mygroup) {

        mygroup.stashOutput = true;

        if (stashAsAsset) mygroup.stashOutputAsAsset = true;
    }
};

// `createImageFromEntity`
const createImageFromEntity = function (item, stashAsAsset = false) {

    let myentity = (item.substring) ? artefact[item] : item;

    if (myentity.isArtefact) {

        myentity.stashOutput = true;

        if (stashAsAsset) myentity.stashOutputAsAsset = true;
    }
};


// #### Factory
const makeImageAsset = function (items) {

    if (!items) return false;
    return new ImageAsset(items);
};

constructors.ImageAsset = ImageAsset;


// #### Exports
export {
    makeImageAsset,

    gettableImageAssetAtributes,
    settableImageAssetAtributes,

    importImage,
    importDomImage,

    createImageFromCell,
    createImageFromGroup,
    createImageFromEntity,
};
