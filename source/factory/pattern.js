// # Pattern factory
// Scrawl-canvas Pattern objects implement the Canvas API's [createPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern) method. The resulting [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) object can be used by any Scrawl-canvas entity as its `fillStyle` or `strokeStyle`.
// + Most pattern-related functionality has been coded up in the [styles mixin](../mixin/styles.html), and is documented there.
// + Functionality associated with __assets__, which Patterns use as their source, has been coded up in the [assetConsumer mixin](../mixin/assetConsumer.html).
// + Patterns fully participate in the Scrawl-canvas packet system, thus can be saved, restored, cloned, killed, etc.
// + Patterns cannot be animated as such, but a Cell wrapper that is used as the Pattern's source can be animated in any of the normal ways.
// + Scrawl-canvas does not support the Canvas API `CanvasPattern.setTransform()` method - it appears to be based on the SVGMatrix interface, which was deprecated in the SVG2 standard.


// #### Demos:
// + [Canvas-009](../../demo/canvas-009.html) - Pattern styles; Entity web link anchors; Dynamic accessibility


// #### Imports
import { constructors, cell, entity } from '../core/library.js';
import { mergeOver, pushUnique, isa_fn, isa_obj } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
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
P = assetConsumerMix(P);


// #### Pattern attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [assetConsumer mixin](../mixin/assetConsumer.html): __asset, spriteTrack, imageSource, spriteSource, videoSource, source__.
let defaultAttributes = {

// __repeat__ - String indicating how to repeat the pattern's image. Possible values are: `repeat` (default), `repeat-x`, `repeat-y`, `no-repeat`
    repeat: 'repeat',

// ___Additional attributes and pseudo-attributes___ are defined in the [assetConsumer mixin](../mixin/assetConsumer.html)
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetObjects = pushUnique(P.packetObjects, ['asset']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    let myname = this.name;

    if (isa_obj(this.asset)) this.asset.unsubscribe(this);

    // Remove style from all entity state objects
    Object.entries(entity).forEach(([name, ent]) => {

        let state = ent.state;

        if (state) {

            let fill = state.fillStyle,
                stroke = state.strokeStyle;

            if (isa_obj(fill) && fill.name === myname) state.fillStyle = state.defs.fillStyle;
            if (isa_obj(stroke) && stroke.name === myname) state.strokeStyle = state.defs.strokeStyle;
        }
    });
    
    // Remove style from the Scrawl-canvas library
    this.deregister();
    
    return this;
};


// #### Get, Set, deltaSet
let G = P.getters,
    S = P.setters,
    D = P.deltaSetters;

// __repeat__
P.repeatValues = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']
S.repeat = function (item) {

    if (this.repeatValues.indexOf(item) >= 0) this.repeat = item;
    else this.repeat = this.defs.repeat;
};


// #### Prototype functions

// `buildStyle` - internal function: creates the pattern on the Cell's CanvasRenderingContext2D engine.
P.buildStyle = function (mycell = {}) {
    
    if (this.sourceLoaded && mycell) {

        let engine = false;

        if (mycell.substring) {

            let realcell = cell[mycell];

            if (realcell && realcell.engine) engine = realcell.engine;
        }
        else if (mycell.engine) engine = mycell.engine;

        if (engine) return engine.createPattern(this.source, this.repeat);
    }
    return 'rgba(0,0,0,0)';
};

// `getData` function called by Cell objects when calculating required updates to its CanvasRenderingContext2D engine, specifically for an entity's __fillStyle__, __strokeStyle__ and __shadowColor__ attributes.
// + This is the point when we clean Scrawl-canvas assets which have told their subscribers that asset data/attributes have updated
P.getData = function (entity, cell, isFill) {

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
