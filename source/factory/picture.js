// # Picture factory
// Picture entitys are image, video or canvas-based rectangles rendered onto a DOM &lt;canvas> element using the Canvas API's [CanvasRenderingContext2D interface](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) - in particular the [drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage) method.
// + Positioning and dimensions functionality for the Picture is supplied by the __position__ mixin, while rendering functionality comes from the __entity__ mixin.
// + Pictures can use [ImageAsset](./imageAsset.html), [SpriteAsset](./spriteAsset.html), [VideoAsset](./videoAsset.html), or [Cells](./cell.html) for the source of the image they display.
// + Additionally, we can restrict the display to a portion of the source by defining and updating `copy` attributes.
//
// We define the source copy area in a similar way to how we position and dimension the Picture entity on its Cell host, using two additional [Coordinate](./coordinate.html) Arrays to hold our data.
// + for both positioning and dimensions, we can define the coordinate in absolute, or relative, terms
// + __absolute__ positioning and dimensions - where we give the artefact a Number coordinate measured in pixels.
// + __relative__ positioning and dimensions - where we use String percentage coordinates, with `['0%', '0%']` representing the top left corner of the source, and `['100%', '100%']` its bottom right corner.
//
// Source dimensions are the ___natural width and height___ of the image or video
// + The code will check automatically to make sure that any combination of start and dimensions values does not lead to an attempt to copy image data that does not exist (which otherwise throws an error).
// + Where `copyStartX + width` values are greater than the source width, the start value will be reduced until the copy frame fits within the bounds of the source dimensions.
// + Where `copyStartY + height` values are greater than the source height, the start value will be reduced until the copy frame fits within the bounds of the source dimensions.
//
// Loading sources is an asynchronous action. If we attempt to stamp a Picture entity whose source has not yet been fetched or loaded, the Picture will skip its stamp functionality for that Display cycle.
// + Stamping a Picture entity directly, immediately after defining it, will (almost certainly) lead to the image not displaying on the canvas.
// + For this reason, its best to use Picture entitys inside a Display cycle animation. As soon as the source finishes loading, the Picture entity will display as expected.
//
// Also:
// + Pictures can use CSS color Strings for their strokeStyle values, alongside __Gradient__, __RadialGradient__, __Color__ and __Pattern__ objects.
// + They will also accept __Filter__ objects.
// + They can use __Anchor__ objects for user navigation.
// + They can be rendered to the canvas by including them in a __Cell__ object's __Group__.
// + They can be __animated__ directly, or using delta animation, or act as the target for __Tween__ animations.
// + Pictures (but not their source assets) can be cloned, and killed.


// #### Imports
import { artefact, constructors } from '../core/library.js';

import { addStrings, doCreate, isa_obj, mergeOver, pushUnique, removeItem, xta, Ωempty } from '../helper/utilities.js';

import { gettableVideoAssetAtributes, settableVideoAssetAtributes } from '../asset-management/video-asset.js';

import { gettableImageAssetAtributes, settableImageAssetAtributes } from '../asset-management/image-asset.js';

import { makeCoordinate } from '../untracked-factory/coordinate.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';
import assetConsumerMix from '../mixin/asset-consumer.js';

import { $IMAGE, $VIDEO, _keys, COPY_DIMENSIONS, COPY_START, ENTITY, MOUSE, NAME, PARTICLE, STATE_KEYS, T_PICTURE, T_SPRITE, UNDEF } from '../helper/shared-vars.js';


// #### Picture constructor
const Picture = function (items = Ωempty) {

    this.copyStart = makeCoordinate();
    this.currentCopyStart = makeCoordinate();

    this.copyDimensions = makeCoordinate();
    this.currentCopyDimensions = makeCoordinate();

    this.copyArray = [];
    this.pasteArray = [];

    this.entityInit(items);

    if (!items.copyStart) {

        if (!items.copyStartX) this.copyStart[0] = 0;
        if (!items.copyStartY) this.copyStart[1] = 0;
    }

    if (!items.copyDimensions) {

        if (!items.copyWidth) this.copyDimensions[0] = 1;
        if (!items.copyHeight) this.copyDimensions[1] = 1;
    }

    this.imageSubscribers = [];

    this.dirtyCopyStart = true;
    this.dirtyCopyDimensions = true;
    this.dirtyImage = true;

    return this;
};


// #### Picture prototype
const P = Picture.prototype = doCreate();
P.type = T_PICTURE;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
entityMix(P);
assetConsumerMix(P);


// #### Picture attributes
const defaultAttributes = {

// __copyStart__ - Coordinate array
// + We can use the pseudo-attributes __copyStartX__ and __copyStartY__ to make working with the Coordinate easier.
    copyStart: null,

// __copyDimensions__ - Coordinate array
// + We can use the pseudo-attributes __copyWidth__ and __copyHeight__ to make working with the Coordinate easier.
    copyDimensions: null,

// __checkHitIgnoreTransparency__ - Boolean - when set, will check the stashedImage data to return whether a coordinate is hitting the image; otherwise checkHit will use the Picture entity's dimensions to calculate the hit
    checkHitIgnoreTransparency: false,

// ___Additional attributes and pseudo-attributes___ are defined in the [assetConsumer mixin](../mixin/assetConsumer.html)
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetCoordinates = pushUnique(P.packetCoordinates, ['copyStart', 'copyDimensions']);
P.packetObjects = pushUnique(P.packetObjects, ['asset']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.factoryKill = function () {

    const { asset, removeAssetOnKill } = this;

    if (isa_obj(asset)) {

        asset.unsubscribe(this);

        // Cascade kill invocation to the asset object, if required
        if (removeAssetOnKill) asset.kill(true);
    }
};

// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __copyStart__
// + Including __copyStartX__, __copyStartY__
G.copyStart = function () {

    return [].concat(this.currentCopyStart);
};
G.copyStartX = function () {

    return this.currentCopyStart[0];
};
G.copyStartY = function () {

    return this.currentCopyStart[1];
};
S.copyStartX = function (coord) {

    if (coord != null) {

        this.copyStart[0] = coord;
        this.dirtyCopyStart = true;
        this.dirtyImageSubscribers = true;
        this.dirtyFilterIdentifier = true;
    }
};
S.copyStartY = function (coord) {

    if (coord != null) {

        this.copyStart[1] = coord;
        this.dirtyCopyStart = true;
        this.dirtyImageSubscribers = true;
        this.dirtyFilterIdentifier = true;
    }
};
S.copyStart = function (x, y) {

    this.setCoordinateHelper(COPY_START, x, y);
    this.dirtyCopyStart = true;
    this.dirtyImageSubscribers = true;
    this.dirtyFilterIdentifier = true;
};
D.copyStartX = function (coord) {

    const c = this.copyStart;
    c[0] = addStrings(c[0], coord);
    this.dirtyCopyStart = true;
    this.dirtyImageSubscribers = true;
    this.dirtyFilterIdentifier = true;
};
D.copyStartY = function (coord) {

    const c = this.copyStart;
    c[1] = addStrings(c[1], coord);
    this.dirtyCopyStart = true;
    this.dirtyFilterIdentifier = true;
};
D.copyStart = function (x, y) {

    this.setDeltaCoordinateHelper(COPY_START, x, y);
    this.dirtyCopyStart = true;
    this.dirtyImageSubscribers = true;
    this.dirtyFilterIdentifier = true;
};

// __copyDimensions__
// + Including __copyWidth__, __copyHeight__
G.copyWidth = function () {

    return this.currentCopyDimensions[0];
};
G.copyHeight = function () {

    return this.currentCopyDimensions[1];
};
G.copyDimensions = function () {

    return [].concat(this.currentCopyDimensions);
};
S.copyWidth = function (val) {

    if (val != null) {

        this.copyDimensions[0] = val;
        this.dirtyCopyDimensions = true;
        this.dirtyImageSubscribers = true;
        this.dirtyFilterIdentifier = true;
    }
};
S.copyHeight = function (val) {

    if (val != null) {

        this.copyDimensions[1] = val;
        this.dirtyCopyDimensions = true;
        this.dirtyImageSubscribers = true;
        this.dirtyFilterIdentifier = true;
    }
};
S.copyDimensions = function (w, h) {

    this.setCoordinateHelper(COPY_DIMENSIONS, w, h);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
    this.dirtyFilterIdentifier = true;
};
D.copyWidth = function (val) {

    const c = this.copyDimensions;
    c[0] = addStrings(c[0], val);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
    this.dirtyFilterIdentifier = true;
};
D.copyHeight = function (val) {

    const c = this.copyDimensions;
    c[1] = addStrings(c[1], val);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
    this.dirtyFilterIdentifier = true;
};
D.copyDimensions = function (w, h) {

    this.setDeltaCoordinateHelper(COPY_DIMENSIONS, w, h);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
    this.dirtyFilterIdentifier = true;
};

S.checkHitIgnoreTransparency = function (item) {

    this.checkHitIgnoreTransparency = item;

    if (item) this.stashOutput = true;
};

// Picture `get` and `set` (but not `deltaSet`) functions need to take into account their current source, whose attributes can be retrieved/amended directly on the Picture object

// `get`
P.get = function (item) {

    const source = this.source;

    if ((item.indexOf($VIDEO) == 0 || item.indexOf($IMAGE) == 0) && source) {

        if (gettableVideoAssetAtributes.includes(item)) return source[item.substring(6)];
        else if (gettableImageAssetAtributes.includes(item)) return source[item.substring(6)];
    }

    else {

        const getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            const state = this.state;

            let def = this.defs[item],
                val;

            if (typeof def != UNDEF) {

                val = this[item];
                return (typeof val != UNDEF) ? val : def;
            }

            def = state.defs[item];

            if (typeof def != UNDEF) {

                val = state[item];
                return (typeof val != UNDEF) ? val : def;
            }
            return undefined;
        }
    }
};

// `set`
P.set = function (items = Ωempty) {

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs,
            source = this.source,
            state = this.state;

        const stateSetters = (state) ? state.setters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let fn, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if ((key.indexOf($VIDEO) == 0 || key.indexOf($IMAGE) == 0) && source) {

                if (settableVideoAssetAtributes.includes(key)) source[key.substring(6)] = value
                else if (settableImageAssetAtributes.includes(key)) source[key.substring(6)] = value
            }

            else if (key && key != NAME && value != null) {

                if (!STATE_KEYS.includes(key)) {

                    fn = setters[key];

                    if (fn) fn.call(this, value);
                    else if (typeof defs[key] != UNDEF) this[key] = value;
                }
                else {

                    fn = stateSetters[key];

                    if (fn) fn.call(state, value);
                    else if (typeof stateDefs[key] != UNDEF) state[key] = value;
                }
            }
        }
    }
    return this;
};


// #### Subscriber management

// `updateImageSubscribers`
P.updateImageSubscribers = function () {

    this.dirtyImageSubscribers = false;

    if (this.imageSubscribers.length) {

        this.imageSubscribers.forEach(name => {

            const instance = artefact[name];

            if (instance) instance.dirtyInput = true;
        });
    }
};

// `imageSubscribe`
P.imageSubscribe = function (name) {

    if (name && name.substring) pushUnique(this.imageSubscribers, name);
};

// `imageUnsubscribe`
P.imageUnsubscribe = function (name) {

    if (name && name.substring) removeItem(this.imageSubscribers, name);
};


// #### Display cycle functionality

// `cleanImage`
P.cleanImage = function () {

    const natWidth = this.sourceNaturalWidth,
        natHeight = this.sourceNaturalHeight;

    if (xta(natWidth, natHeight) && natWidth > 0 && natHeight > 0) {

        this.dirtyImage = false;

        const start = this.currentCopyStart,
            x = start[0],
            y = start[1];

        const dims = this.currentCopyDimensions,
            w = dims[0],
            h = dims[1];

        if (x + w > natWidth) start[0] = natWidth - w;
        if (y + h > natHeight) start[1] = natHeight - h;

        const copyArray = this.copyArray;

        copyArray.length = 0;
        copyArray.push(~~start[0], ~~start[1], ~~w, ~~h);
    }
};

// `cleanCopyStart`
P.cleanCopyStart = function () {

    const width = this.sourceNaturalWidth,
        height = this.sourceNaturalHeight;

    if (xta(width, height) && width > 0 && height > 0) {

        this.dirtyCopyStart = false;

        this.cleanPosition(this.currentCopyStart, this.copyStart, [width, height]);

        const current = this.currentCopyStart,
            x = current[0],
            y = current[1];

        if (x < 0 || x > width) {

            if (x < 0) current[0] = 0;
            else current[0] = width - 1;
        }

        if (y < 0 || y > height) {

            if (y < 0) current[1] = 0;
            else current[1] = height - 1;
        }
        this.dirtyImage = true;
    }
};

// `cleanCopyDimensions`
P.cleanCopyDimensions = function () {

    const natWidth = this.sourceNaturalWidth,
        natHeight = this.sourceNaturalHeight;

    if (xta(natWidth, natHeight) && natWidth > 0 && natHeight > 0) {

        this.dirtyCopyDimensions = false;

        const dims = this.copyDimensions,
            currentDims = this.currentCopyDimensions,
            width = dims[0],
            height = dims[1];

        if (width.substring) currentDims[0] = (parseFloat(width) / 100) * natWidth;
        else currentDims[0] = width;

        if (height.substring) currentDims[1] = (parseFloat(height) / 100) * natHeight;
        else currentDims[1] = height;

        const currentWidth = currentDims[0],
            currentHeight = currentDims[1];

        if (currentWidth <= 0 || currentWidth > natWidth) {

            if (currentWidth <= 0) currentDims[0] = 1;
            else currentDims[0] = natWidth;
        }

        if (currentHeight <= 0 || currentHeight > natHeight) {

            if (currentHeight <= 0) currentDims[1] = 1;
            else currentDims[1] = natHeight;
        }
        this.dirtyImage = true;
    }
};


// `prepareStamp`
P.prepareStamp = function() {

    // The asset itself will update the Picture entity object when changes occur, by setting the entity's `dirtyAsset` flag
    if (this.dirtyAsset) this.cleanAsset();

    // Not content with the dirty flag, the entity now interrogates its asset via its `checkSource` to trigger it to directly rewrite key information if it has changed - particularly dimensional data
    if (this.asset) {

        if (this.asset.type == T_SPRITE) this.checkSpriteFrame(this);
        else {

            if (this.asset.checkSource) this.asset.checkSource(this.sourceNaturalWidth, this.sourceNaturalHeight);
            else this.dirtyAsset = true;
        }
    }

    //  See the [entity mixin function](http://localhost:8080/docs/source/mixin/entity.html#section-31) for details on the following checks and actions
    if (this.dirtyDimensions || this.dirtyHandle || this.dirtyScale) this.dirtyPaste = true;

    if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle) this.dirtyPathObject = true;

    if (this.dirtyScale) this.cleanScale();
    if (this.dirtyDimensions) this.cleanDimensions();
    if (this.dirtyLock) this.cleanLock();
    if (this.dirtyStart) this.cleanStart();
    if (this.dirtyOffset) this.cleanOffset();
    if (this.dirtyHandle) this.cleanHandle();
    if (this.dirtyRotation) this.cleanRotation();

    if (this.isBeingDragged || this.lockTo.includes(MOUSE) || this.lockTo.includes(PARTICLE)) {

        this.dirtyStampPositions = true;
        this.dirtyStampHandlePositions = true;
    }

    if (this.dirtyStampPositions) this.cleanStampPositions();
    if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

    if (this.dirtyCopyStart) this.cleanCopyStart();
    if (this.dirtyCopyDimensions) this.cleanCopyDimensions();
    if (this.dirtyImage) this.cleanImage();
    if (this.dirtyPaste) this.preparePasteObject();

    if (this.dirtyPathObject) this.cleanPathObject();

    // Update artefacts subscribed to this artefact (using it as their pivot or mimic source), if required
    if (this.dirtyPositionSubscribers) this.updatePositionSubscribers();

    // Specifically for Loom entitys
    if (this.dirtyImageSubscribers) this.updateImageSubscribers();

    // `prepareStampTabsHelper` is defined in the `mixin/hiddenDomElements.js` file - handles updates to anchor and button objects
    this.prepareStampTabsHelper();
};

// `preparePasteObject` - internal function
// + the __pasteArray__ is a convenience Array containing start coordinate and dimensions data, which we can quickly add to the render engine's drawImage function (which gets called many times)
P.preparePasteObject = function () {

    this.dirtyPaste = false;

    const handle = this.currentStampHandlePosition,
        dims = this.currentDimensions,
        scale = this.currentScale;

    const x = -handle[0] * scale,
        y = -handle[1] * scale,
        w = dims[0] * scale,
        h = dims[1] * scale;

    const pasteArray = this.pasteArray;

    pasteArray.length = 0;
    pasteArray.push(~~x, ~~y, ~~w, ~~h);

    this.dirtyPathObject = true;
};

// `cleanPathObject` - internal function
// + For Picture entitys, the pathObject is a rectangle
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        if (!this.pasteArray || this.pasteArray.length != 4) this.preparePasteObject();

        if (this.pasteArray.length != 4) this.dirtyPathObject = true;
        else {

            const p = this.pathObject = new Path2D();

            p.rect(...this.pasteArray);
        }
    }
};

// ##### Stamp methods

// `draw`
P.draw = function (engine) {

    engine.stroke(this.pathObject);
};

// `fill`
P.fill = function (engine) {

    const [x, y, w, h] = this.copyArray;
    if (this.source && w && h) engine.drawImage(this.source, x, y, w, h, ...this.pasteArray);
};

// `drawAndFill`
P.drawAndFill = function (engine) {

    const [x, y, w, h] = this.copyArray;
    const [_x, _y, _w, _h] = this.pasteArray;

    if (this.source && w && h) {

        engine.stroke(this.pathObject);
        engine.drawImage(this.source, x, y, w, h, _x, _y, _w, _h);

        this.currentHost.clearShadow();

        engine.stroke(this.pathObject);
        engine.drawImage(this.source, x, y, w, h, _x, _y, _w, _h);
    }
};

// `fillAndDraw`
P.fillAndDraw = function (engine) {

    const [x, y, w, h] = this.copyArray;
    const [_x, _y, _w, _h] = this.pasteArray;

    if (this.source && w && h) {

        engine.drawImage(this.source, x, y, w, h, _x, _y, _w, _h);
        engine.stroke(this.pathObject);

        this.currentHost.clearShadow();

        engine.drawImage(this.source, x, y, w, h, _x, _y, _w, _h);
        engine.stroke(this.pathObject);
    }

    engine.stroke(this.pathObject);
};

// `drawThenFill`
P.drawThenFill = function (engine) {

    const [x, y, w, h] = this.copyArray;
    if (this.source && w && h) {

        engine.stroke(this.pathObject);
        engine.drawImage(this.source, x, y, w, h, ...this.pasteArray);
    }
};

// `fillThenDraw`
P.fillThenDraw = function (engine) {

    const [x, y, w, h] = this.copyArray;
    if (this.source && w && h) {

        engine.drawImage(this.source, x, y, w, h, ...this.pasteArray);
        engine.stroke(this.pathObject);
    }
};

// `checkHitReturn` - overwrites mixin/position.js function
P.checkHitReturn = function (x, y, cell) {

    if (this.checkHitIgnoreTransparency && cell && cell.engine) {

        const [copyX, copyY, copyWidth, copyHeight] = this.copyArray;

        if (xta(copyX, copyY, copyWidth, copyHeight)) {

            const pasteWidth = this.pasteArray[2];
            const [stampX, stampY] = this.currentStampPosition;

            const img = cell.engine.getImageData(copyX, copyY, copyWidth, copyHeight);

            const myX = x - stampX,
                myY = y - stampY;

            const index = (((myY * pasteWidth) + myX) * 4) + 3;

            if (img.data[index]) {

                return {
                    x: x,
                    y: y,
                    artefact: this
                };
            }
        }
        return false;
    }
    else {

        return {
            x: x,
            y: y,
            artefact: this
        };
    }
};


// #### Factory
// ```
// scrawl.importDomImage('.flowers');
//
// scrawl.makePicture({
//
//     name: 'myFlower',
//     asset: 'iris',
//
//     width: 200,
//     height: 200,
//
//     startX: 300,
//     startY: 200,
//     handleX: 100,
//     handleY: 100,
//
//     copyWidth: 200,
//     copyHeight: 200,
//     copyStartX: 100,
//     copyStartY: 100,
//
//     lineWidth: 10,
//     strokeStyle: 'gold',
//
//     order: 1,
//     method: 'drawAndFill',
//
// }).clone({
//
//     name: 'myFactory',
//     imageSource: 'img/canalFactory-800.png',
//
//     width: 600,
//     height: 400,
//
//     startX: 0,
//     startY: 0,
//     handleX: 0,
//     handleY: 0,
//
//     copyWidth: 600,
//     copyHeight: 400,
//     copyStartX: 150,
//     copyStartY: 0,
//
//     order: 0,
//     method: 'fill',
// });
// ```
export const makePicture = function (items) {

    if (!items) return false;
    return new Picture(items);
};

constructors.Picture = Picture;
