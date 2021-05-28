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


// #### Demos:
// + [Canvas-008](../../demo/canvas-008.html) - Picture entity position; manipulate copy attributes
// + [Canvas-010](../../demo/canvas-010.html) - Use video sources and media streams for Picture entitys
// + [Canvas-021](../../demo/canvas-021.html) - Import and use spritesheets
// + [Canvas-023](../../demo/canvas-023.html) - Grid entity - using picture-based assets (image, video, sprite)
// + [Canvas-024](../../demo/canvas-024.html) - Loom entity functionality
// + [Canvas-025](../../demo/canvas-025.html) - Responsive images
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets - save and load a range of different entitys


// #### Imports
import { constructors, asset, artefact } from '../core/library.js';

import { mergeOver, xta, addStrings, pushUnique, removeItem, isa_obj, Ωempty } from '../core/utilities.js';

import { gettableVideoAssetAtributes, settableVideoAssetAtributes } from './videoAsset.js';
import { gettableImageAssetAtributes, settableImageAssetAtributes } from './imageAsset.js';
import { stateKeys } from './state.js';

import { makeCoordinate } from './coordinate.js';

import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';
import assetConsumerMix from '../mixin/assetConsumer.js';


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
let P = Picture.prototype = Object.create(Object.prototype);
P.type = 'Picture';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
// + [base](../mixin/base.html)
// + [entity](../mixin/entity.html)
// + [assetConsumer](../mixin/assetConsumer.html)
P = baseMix(P);
P = entityMix(P);
P = assetConsumerMix(P);


// #### Picture attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [position mixin](../mixin/position.html): __group, visibility, order, start, _startX_, _startY_, handle, _handleX_, _handleY_, offset, _offsetX_, _offsetY_, dimensions, _width_, _height_, pivoted, mimicked, lockTo, _lockXTo_, _lockYTo_, scale, roll, noUserInteraction, noPositionDependencies, noCanvasEngineUpdates, noFilters, noPathUpdates, purge, bringToFrontOnDrag__.
// + Attributes defined in the [delta mixin](../mixin/delta.html): __delta, noDeltaUpdates__.
// + Attributes defined in the [pivot mixin](../mixin/pivot.html): __pivot, pivotCorner, addPivotHandle, addPivotOffset, addPivotRotation__.
// + Attributes defined in the [mimic mixin](../mixin/mimic.html): __mimic, useMimicDimensions, useMimicScale, useMimicStart, useMimicHandle, useMimicOffset, useMimicRotation, useMimicFlip, addOwnDimensionsToMimic, addOwnScaleToMimic, addOwnStartToMimic, addOwnHandleToMimic, addOwnOffsetToMimic, addOwnRotationToMimic__.
// + Attributes defined in the [path mixin](../mixin/path.html): __path, pathPosition, addPathHandle, addPathOffset, addPathRotation, constantPathSpeed__.
// + Attributes defined in the [entity mixin](../mixin/entity.html): __method, pathObject, winding, flipReverse, flipUpend, scaleOutline, lockFillStyleToEntity, lockStrokeStyleToEntity, onEnter, onLeave, onDown, onUp, _fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, lineDash, lineDashOffset, miterLimit, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, filter___.
// + Attributes defined in the [anchor mixin](../mixin/anchor.html): __anchor__.
// + Attributes defined in the [filter mixin](../mixin/filter.html): __filters, isStencil__.
// + Attributes defined in the [assetConsumer mixin](../mixin/assetConsumer.html): __asset, spriteTrack, imageSource, spriteSource, videoSource, source__.
let defaultAttributes = {

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
P.factoryKill = function (killAsset = false) {

    let { asset, removeAssetOnKill } = this;

    if (isa_obj(asset)) asset.unsubscribe(this);

    // Cascade kill invocation to the asset object, if required
    if (removeAssetOnKill) {

        if (removeAssetOnKill.substring) asset.kill(true);
        else asset.kill();
    }
};

// #### Get, Set, deltaSet
let G = P.getters,
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
    }
};
S.copyStartY = function (coord) {

    if (coord != null) {

        this.copyStart[1] = coord;
        this.dirtyCopyStart = true;
        this.dirtyImageSubscribers = true;
    }
};
S.copyStart = function (x, y) {

    this.setCoordinateHelper('copyStart', x, y);
    this.dirtyCopyStart = true;
    this.dirtyImageSubscribers = true;
};
D.copyStartX = function (coord) {

    let c = this.copyStart;
    c[0] = addStrings(c[0], coord);
    this.dirtyCopyStart = true;
    this.dirtyImageSubscribers = true;
};
D.copyStartY = function (coord) {

    let c = this.copyStart;
    c[1] = addStrings(c[1], coord);
    this.dirtyCopyStart = true;
};
D.copyStart = function (x, y) {

    this.setDeltaCoordinateHelper('copyStart', x, y);
    this.dirtyCopyStart = true;
    this.dirtyImageSubscribers = true;
};

// __copyDimensions__
// + Including __copyWidth__, __copyHeight__
G.copyWidth = function () {

    return this.currentCopyDimensions[0];
};
G.copyHeight = function () {

    return this.currentCopyDimensions[1];
};
G.copyDimensions = function (w, h) {

    return [].concat(this.currentCopyDimensions);
};
S.copyWidth = function (val) {

    if (val != null) {

        this.copyDimensions[0] = val;
        this.dirtyCopyDimensions = true;
        this.dirtyImageSubscribers = true;
    }
};
S.copyHeight = function (val) {

    if (val != null) {

        this.copyDimensions[1] = val;
        this.dirtyCopyDimensions = true;
        this.dirtyImageSubscribers = true;
    }
};
S.copyDimensions = function (w, h) {

    this.setCoordinateHelper('copyDimensions', w, h);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
};
D.copyWidth = function (val) {

    let c = this.copyDimensions;
    c[0] = addStrings(c[0], val);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
};
D.copyHeight = function (val) {

    let c = this.copyDimensions;
    c[1] = addStrings(c[1], val);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
};
D.copyDimensions = function (w, h) {

    this.setDeltaCoordinateHelper('copyDimensions', w, h);
    this.dirtyCopyDimensions = true;
    this.dirtyImageSubscribers = true;
};

S.checkHitIgnoreTransparency = function (item) {

    this.checkHitIgnoreTransparency = item;

    if (item) this.stashOutput = true;
};

// Picture `get` and `set` (but not `deltaSet`) functions need to take into account their current source, whose attributes can be retrieved/amended directly on the Picture object

// `get`
P.get = function (item) {

    let source = this.source;

    if ((item.indexOf('video_') === 0 || item.indexOf('image_') === 0) && source) {

        if (gettableVideoAssetAtributes.indexOf(item) >= 0) return source[item.substring(6)];
        else if (gettableImageAssetAtributes.indexOf(item) >= 0) return source[item.substring(6)];
    }

    else {

        let getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            let def = this.defs[item],
                state = this.state,
                val;

            if (typeof def != 'undefined') {

                val = this[item];
                return (typeof val != 'undefined') ? val : def;
            }

            def = state.defs[item];

            if (typeof def != 'undefined') {

                val = state[item];
                return (typeof val != 'undefined') ? val : def;
            }
            return undef;
        }
    }
};

// `set`
P.set = function (items = Ωempty) {

    const keys = Object.keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs,
            source = this.source,
            state = this.state;

        const stateSetters = (state) ? state.setters : Ωempty;
        const stateDefs = (state) ? state.defs : Ωempty;

        let predefined, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if ((key.indexOf('video_') === 0 || key.indexOf('image_') === 0) && source) {

                if (settableVideoAssetAtributes.indexOf(key) >= 0) source[key.substring(6)] = value
                else if (settableImageAssetAtributes.indexOf(key) >= 0) source[key.substring(6)] = value
            }

            else if (key && key !== 'name' && value != null) {

                if (stateKeys.indexOf(key) < 0) {

                    predefined = setters[key];

                    if (predefined) predefined.call(this, value);
                    else if (typeof defs[key] != 'undefined') this[key] = value;
                }
                else {

                    predefined = stateSetters[key];

                    if (predefined) predefined.call(state, value);
                    else if (typeof stateDefs[key] != 'undefined') state[key] = value;
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

            let instance = artefact[name];

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

    let natWidth = this.sourceNaturalWidth,
        natHeight = this.sourceNaturalHeight;

    if (xta(natWidth, natHeight)) {

        this.dirtyImage = false;

        let start = this.currentCopyStart,
            x = start[0],
            y = start[1];

        let dims = this.currentCopyDimensions,
            w = dims[0],
            h = dims[1];

        if (x + w > natWidth) start[0] = natWidth - w;
        if (y + h > natHeight) start[1] = natHeight - h;

        let copyArray = this.copyArray;

        copyArray.length = 0;
        copyArray.push(start[0], start[1], w, h);
    }
};

// `cleanCopyStart`
P.cleanCopyStart = function () {

    let width = this.sourceNaturalWidth,
        height = this.sourceNaturalHeight;

    if (xta(width, height)) {

        this.dirtyCopyStart = false;

        this.cleanPosition(this.currentCopyStart, this.copyStart, [width, height]);

        let current = this.currentCopyStart,
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

    let natWidth = this.sourceNaturalWidth,
        natHeight = this.sourceNaturalHeight;

    if (xta(natWidth, natHeight)) {

        this.dirtyCopyDimensions = false;

        let dims = this.copyDimensions,
            currentDims = this.currentCopyDimensions,
            width = dims[0], 
            height = dims[1];

        if (width.substring) currentDims[0] = (parseFloat(width) / 100) * natWidth;
        else currentDims[0] = width;

        if (height.substring) currentDims[1] = (parseFloat(height) / 100) * natHeight;
        else currentDims[1] = height;

        let currentWidth = currentDims[0],
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

        if (this.asset.type === 'Sprite') this.checkSpriteFrame(this);
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

    if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0 || this.lockTo.indexOf('particle') >= 0) {

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
};

// `preparePasteObject` - internal function
// + the __pasteArray__ is a convenience Array containing start coordinate and dimensions data, which we can quickly add to the render engine's drawImage function (which gets called many times)
P.preparePasteObject = function () {

    this.dirtyPaste = false;

    let handle = this.currentStampHandlePosition,
        dims = this.currentDimensions,
        scale = this.currentScale;

    let x = -handle[0] * scale,
        y = -handle[1] * scale,
        w = dims[0] * scale,
        h = dims[1] * scale;

    let pasteArray = this.pasteArray;

    pasteArray.length = 0;
    pasteArray.push(x, y, w, h);

    this.dirtyPathObject = true;
};

// `cleanPathObject` - internal function
// + For Picture entitys, the pathObject is a rectangle
P.cleanPathObject = function () {

    this.dirtyPathObject = false;

    if (!this.noPathUpdates || !this.pathObject) {

        if (!this.pasteArray) this.preparePasteObject();

        let p = this.pathObject = new Path2D();

        p.rect(...this.pasteArray);
    }
};

// ##### Stamp methods

// `draw`
P.draw = function (engine) {

    engine.stroke(this.pathObject);
};

// `fill`
P.fill = function (engine) {

    let [x, y, w, h] = this.copyArray;
    if (this.source && w && h) engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
};

// `drawAndFill`
P.drawAndFill = function (engine) {

    let [x, y, w, h] = this.copyArray;
    if (this.source && w && h) {

        engine.stroke(this.pathObject);
        engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);

        this.currentHost.clearShadow();

        engine.stroke(this.pathObject);
        engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
    }
};

// `fillAndDraw`
P.fillAndDraw = function (engine) {

    let [x, y, w, h] = this.copyArray;
    if (this.source && w && h) {

        engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
        engine.stroke(this.pathObject);

        this.currentHost.clearShadow();

        engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
        engine.stroke(this.pathObject);
    }

    engine.stroke(this.pathObject);
};

// `drawThenFill`
P.drawThenFill = function (engine) {

    let [x, y, w, h] = this.copyArray;
    if (this.source && w && h) {

        engine.stroke(this.pathObject);
        engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
    }
};

// `fillThenDraw`
P.fillThenDraw = function (engine) {

    let [x, y, w, h] = this.copyArray;
    if (this.source && w && h) {

        engine.drawImage(this.source, ...this.copyArray, ...this.pasteArray);
        engine.stroke(this.pathObject);
    }
};

// `checkHitReturn` - overwrites mixin/position.js function
P.checkHitReturn = function (x, y, cell) {

    if (this.checkHitIgnoreTransparency && cell && cell.engine) {

        let [copyX, copyY, copyWidth, copyHeight] = this.copyArray;
        let [pasteX, pasteY, pasteWidth, pasteHeight] = this.pasteArray;
        let [stampX, stampY] = this.currentStampPosition;

        let img = cell.engine.getImageData(copyX, copyY, copyWidth, copyHeight);

        let myX = x - stampX,
            myY = y - stampY;

        let index = (((myY * pasteWidth) + myX) * 4) + 3;

        if (img.data[index]) {

            return {
                x: x,
                y: y,
                artefact: this
            };
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
const makePicture = function (items) {

    if (!items) return false;
    return new Picture(items);
};

constructors.Picture = Picture;


// #### Exports
export {
    makePicture,
};
