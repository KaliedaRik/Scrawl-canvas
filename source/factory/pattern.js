// # Pattern factory
// Scrawl-canvas Pattern objects implement the Canvas API's [createPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern) method. The resulting [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.
// + Most pattern-related functionality has been coded up in the [styles mixin](../mixin/styles.html), and is documented there.
// + Functionality associated with __assets__, which Patterns use as their source, has been coded up in the [assetConsumer mixin](../mixin/assetConsumer.html).
// + Patterns fully participate in the Scrawl-canvas packet system, thus can be saved, restored, cloned, killed, etc.
// + Patterns cannot be animated as such, but a Cell wrapper that is used as the Pattern's source can be animated in any of the normal ways.
// + Scrawl-canvas does not support the Canvas API `CanvasPattern.setTransform()` method - it appears to be based on the SVGMatrix interface, which was deprecated in the SVG2 standard.


// #### Imports
import { constructors, entity } from '../core/library.js';

import { doCreate, pushUnique, isa_obj, Ωempty } from '../helper/utilities.js';

import { gettableVideoAssetAtributes, settableVideoAssetAtributes } from '../asset-management/video-asset.js';

import { gettableImageAssetAtributes, settableImageAssetAtributes } from '../asset-management/image-asset.js';

import baseMix from '../mixin/base.js';
import patternMix from '../mixin/pattern.js';
import assetConsumerMix from '../mixin/asset-consumer.js';

import { $IMAGE, $VIDEO, _isArray, _keys, _values, NAME, STYLES, T_PATTERN, UNDEF } from '../helper/shared-vars.js';


// #### Pattern constructor
const Pattern = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.set(this.defs);
    this.set(items);

    return this;
};


// #### Pattern prototype
const P = Pattern.prototype = doCreate();
P.type = T_PATTERN;
P.lib = STYLES;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);
patternMix(P);
assetConsumerMix(P);


// #### Pattern attributes
// No additional attributes required beyond those supplied by the mixins


// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['asset']);

P.finalizePacketOut = function (copy, items) {

    if (_isArray(items.patternMatrix)) copy.patternMatrix = items.patternMatrix;
    else {

        const m = this.patternMatrix;
        if (m) copy.patternMatrix = [m.a, m.b, m.c, m.d, m.e, m.f];
    }

    return copy;
};

// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    const { name, asset, removeAssetOnKill } = this;
    let state, defs, fill, stroke;

    if (isa_obj(asset)) asset.unsubscribe(this);

    // Remove style from all entity state objects
    _values(entity).forEach(ent => {

        state = ent.state;
        defs = state.defs;

        if (state) {

            fill = state.fillStyle;
            stroke = state.strokeStyle;

            if (isa_obj(fill) && fill.name === name) state.fillStyle = defs.fillStyle;
            if (isa_obj(stroke) && stroke.name === name) state.strokeStyle = defs.strokeStyle;
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

    const source = this.source;

    if ((item.indexOf($VIDEO) === 0 || item.indexOf($IMAGE) === 0) && source) {

        if (gettableVideoAssetAtributes.includes(item)) return source[item.substring(6)];
        else if (gettableImageAssetAtributes.includes(item)) return source[item.substring(6)];
    }

    else {

        const getter = this.getters[item];

        if (getter) return getter.call(this);

        else {

            const def = this.defs[item];

            if (typeof def !== UNDEF) {

                const val = this[item];
                return (typeof val !== UNDEF) ? val : def;
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
            source = this.source,
            defs = this.defs;

        let fn, i, key, value;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            value = items[key];

            if ((key.indexOf($VIDEO) === 0 || key.indexOf($IMAGE) === 0) && source) {

                if (settableVideoAssetAtributes.includes(key)) source[key.substring(6)] = value
                else if (settableImageAssetAtributes.includes(key)) source[key.substring(6)] = value
            }

            else if (key && key !== NAME && value != null) {

                fn = setters[key];

                if (fn) fn.call(this, value);
                else if (typeof defs[key] !== UNDEF) this[key] = value;
            }
        }
        this.dirtyFilterIdentifier = true;
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
export const makePattern = function (items) {

    if (!items) return false;
    return new Pattern(items);
};

constructors.Pattern = Pattern;
