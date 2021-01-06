// # Pattern factory
// Scrawl-canvas Pattern objects implement the Canvas API's [createPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern) method. The resulting [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.
// + Most pattern-related functionality has been coded up in the [styles mixin](../mixin/styles.html), and is documented there.
// + Functionality associated with __assets__, which Patterns use as their source, has been coded up in the [assetConsumer mixin](../mixin/assetConsumer.html).
// + Patterns fully participate in the Scrawl-canvas packet system, thus can be saved, restored, cloned, killed, etc.
// + Patterns cannot be animated as such, but a Cell wrapper that is used as the Pattern's source can be animated in any of the normal ways.
// + Scrawl-canvas does not support the Canvas API `CanvasPattern.setTransform()` method - it appears to be based on the SVGMatrix interface, which was deprecated in the SVG2 standard.


// #### Demos:
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility
// + [Canvas-035](../../demo/canvas-035.html) - Pattern style functionality


// #### Imports
import { constructors, cell, entity } from '../core/library.js';
import { mergeOver, pushUnique, isa_obj } from '../core/utilities.js';
import { gettableVideoAssetAtributes, settableVideoAssetAtributes } from './videoAsset.js';
import { gettableImageAssetAtributes, settableImageAssetAtributes } from './imageAsset.js';


import baseMix from '../mixin/base.js';
import patternMix from '../mixin/pattern.js';
import assetConsumerMix from '../mixin/assetConsumer.js';


// #### Pattern constructor
const Pattern = function (items = {}) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
    this.set(items);

    return this;
};


// #### Pattern prototype
let P = Pattern.prototype = Object.create(Object.prototype);

P.type = 'Pattern';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);
P = patternMix(P);
P = assetConsumerMix(P);


// #### Pattern attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [pattern mixin](../mixin/pattern.html): __repeat__.
// + Attributes defined in the [assetConsumer mixin](../mixin/assetConsumer.html): __asset, spriteTrack, imageSource, spriteSource, videoSource, source__.
let defaultAttributes = {};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['asset']);

P.finalizePacketOut = function (copy, items) {

    if (Array.isArray(items.patternMatrix)) copy.patternMatrix = items.patternMatrix;
    else {

        let m = this.patternMatrix;
        if (m) copy.patternMatrix = [m.a, m.b, m.c, m.d, m.e, m.f];
    }

    return copy;
};

// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    let { name, asset, removeAssetOnKill } = this;

    if (isa_obj(asset)) asset.unsubscribe(this);

    // Remove style from all entity state objects
    Object.entries(entity).forEach(([label, ent]) => {

        let state = ent.state;

        if (state) {

            let fill = state.fillStyle,
                stroke = state.strokeStyle;

            if (isa_obj(fill) && fill.name === name) state.fillStyle = state.defs.fillStyle;
            if (isa_obj(stroke) && stroke.name === name) state.strokeStyle = state.defs.strokeStyle;
        }
    });

    // Cascade kill invocation to the asset object, if required
    if (removeAssetOnKill) {

        if (removeAssetOnKill.substring) asset.kill(true);
        else asset.kill();
    }
    
    // Remove style from the Scrawl-canvas library
    this.deregister();
    
    return this;
};


// #### Get, Set, deltaSet
// Pattern `get` and `set` (but not `deltaSet`) functions need to take into account their current source, whose attributes can be retrieved/amended directly on the Picture object

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
                val;

            if (typeof def != 'undefined') {

                val = this[item];
                return (typeof val != 'undefined') ? val : def;
            }
            return undef;
        }
    }
};

// `set`
P.set = function (items = {}) {

    if (Object.keys(items).length) {

        let setters = this.setters,
            defs = this.defs,
            source = this.source,
            predefined;

        Object.entries(items).forEach(([key, value]) => {

            if ((key.indexOf('video_') === 0 || key.indexOf('image_') === 0) && source) {

                if (settableVideoAssetAtributes.indexOf(key) >= 0) source[key.substring(6)] = value
                else if (settableImageAssetAtributes.indexOf(key) >= 0) source[key.substring(6)] = value
            }

            else if (key && key !== 'name' && value != null) {

               predefined = setters[key];

                if (predefined) predefined.call(this, value);
                else if (typeof defs[key] !== 'undefined') this[key] = value;
            }
        }, this);
    }
    return this;
};


// #### Prototype functions

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
// + This is the point when we clean Scrawl-canvas assets which have told their subscribers that asset data/attributes have updated
P.getData = function (entity, cell) {

    if (this.dirtyAsset) this.cleanAsset();
    this.asset.checkSource(this.sourceNaturalWidth, this.sourceNaturalHeight);

    return this.buildStyle(cell);
};


// #### Factory
// ```
// scrawl.importDomImage('.mypatterns');
//
// scrawl.makePattern({
//
//     name: 'brick-pattern',
//     asset: 'brick',
//
// }).clone({
//
//     name: 'marble-pattern',
//     imageSource: 'img/marble.png',
// });
//
// scrawl.makeBlock({
//
//     name: 'marble-block',
//
//     width: '40%',
//     height: '40%',
//
//     startX: '25%',
//     startY: '25%',
//
//     handleX: 'center',
//     handleY: 'center',
//
//     lineWidth: 20,
//     lineJoin: 'round',
//
//     method: 'fillThenDraw',
//
//     fillStyle: 'marble-pattern',
//     strokeStyle: 'brick-pattern',
// });
// ```
const makePattern = function (items) {
    return new Pattern(items);
};

constructors.Pattern = Pattern;


// #### Exports
export {
    makePattern,
};
