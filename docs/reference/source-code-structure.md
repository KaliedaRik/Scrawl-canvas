# Scrawl-canvas source code structure
A brief overview of the source code folder and file structure, alongside reasons for the decisions to structure the code in this way.

Note that this page only covers the `source/*` folder structure. For details of other files held in the repo, see the [Repository structure, and release protocol](./repo-structure.html) page.

## Folder overview

```
| - scrawl.js                       Entry file
| - scrawl.d.ts                     TS types definitions for the dev-user API
|
| - asset-management
|   | - [asset management files]
|
| - core
|   | - animation-loop.js
|   | - display-cycle.js
|   | - document.js
|   | - events.js
|   | - init.js                     On-load initialization
|   | - library.js                  References to all tracked objects
|   | - snippets.js
|   | - user-interaction.js
|
| - factory
|   | - [factory function files to generate new tracked objects]
|
| - helper
|   | - array-pool.js
|   | - document-root-elements.js
|   | - filter-engine-bluenoise-data.js
|   | - filter-engine.js
|   | - random-seed.js
|   | - shape-path-calculation.js
|   | - shared-vars.js
|   | - system-flags.js
|   | - utilities.js
|   | - workstore.js
|
| - mixin
|   | - [mixin files to pre-populate factory files with default attributes and functions]
|
| - untracked-factory
|   | - cell-fragment.js
|   | - coordinate.js
|   | - drag-zone.js
|   | - keyboard-zone.js
|   | - observe-update.js
|   | - palette.js
|   | - particle-history.js
|   | - quaternion.js
|   | - state.js
|   | - text-style.js
|   | - vector.js
```

## Core coding guidelines 
The following guidelines (which is not a complete list) underpin the decisions made when designing the code architecture. Some of these are based on the need to compute as quickly as possible; others are more whimsical:

1. No third party code direct dependencies. Ever.

2. All code is written in modular Javascript, using `import` and `export` statements to share code between files.

3. [Circular dependencies](https://en.wikipedia.org/wiki/Circular_dependency) between files should be avoided at all costs.

4. (Repo-devs maintain a Typescript definitions file purely to support code completion functionality in the dev-user's preferred development environment.)

5. Javascript is a [prototypal language](https://en.wikipedia.org/wiki/Prototype-based_programming). Javascript classes are expressly forbidden from the code base!

6. SC uses mixin files to implement inheritance.

7. Minimise lookups: mixin files should add attributes and functions to an object's prototype directly. Say no to hierarchies!

8. Minimise [object shape](https://mathiasbynens.be/notes/shapes-ics) deformation: define an object's attributes up-front, with default values; do not add additional attributes once the object has been created; do not delete attributes. 

9. Functional programming has its place, except when it is wasteful. Minimise wastefulness, for example by using pooled objects.

10. Constant string variables should be created once, and only once, throughout the code base.

11. Prefer fast functionality over clever functionality. This includes iterators.

12. Avoid asynchronous functionality except where absolutely necessary. No web workers!

13. Cache data aggressively.

14. Wherever possible, functions should only accept a single {key: value} object argument.

15. An object should only update its state once per Display cycle. Signal state changes (including between objects) using dirty flags.

Also, SC enforces additional coding preferences via linting rules, invoked by running the command `yarn lint`. 

## Common file structures
Repo-devs make every effort to keep files tidy, in particular by maintaining a similar file structure for similar types of files. This is an attempt to minimise cognitive overload.

Note that repo-devs encourage inline comments. The repo includes tool chaining to extract these comments into document files as part of the `yarn build` functionality. Use `// [... comment]` single-line comments - the tooling doesn't (yet) recognise (JS-style) `/* ... multi-line comments */`.

### Factory files
SC uses [factory pattern](https://www.patterns.dev/vanilla/factory-pattern) files to define objects that a dev-user can create. Much of the functionality in factory files is shared between them, so as part of the factory file SC invokes **mixin functions** to add that functionality. Additional functionality specific to that object is then defined.

As far as possible, all factory files use the following code structure - for instance `factory/wheel.js`:

```
// # Wheel factory
// [... top level documentation for the factory]


// Imports come first
import { constructors } from '../core/library.js';
import { addStrings, doCreate, isa_number, mergeOver, xt, xto, Ωempty } from '../helper/utilities.js';

// Also import the mixins to be applied to the factory
import baseMix from '../mixin/base.js';
import entityMix from '../mixin/entity.js';

// Import shared constants
import { _radian, DIMENSIONS, ENTITY, PC } from '../helper/shared-vars.js';

// Define local constants and non-prototypal functions
const T_WHEEL = 'Wheel';


// Wheel constructor
const Wheel = function (items = Ωempty) {

    [... constructor code]

    // Return the object
    return this;
};


// Wheel prototype
const P = Wheel.prototype = doCreate();
P.type = T_WHEEL;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// Apply mixin code to the prototype
baseMix(P);
entityMix(P);


// Define Wheel-specific attributes
const defaultAttributes = {
    radius: 5,
    startAngle: 0,
    endAngle: 360,
    clockwise: true,
    includeCenter: false,
    closed: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// Packet management code
// No additional packet functionality required


// Clone management code
// No additional clone functionality required


// Kill management code
// No additional kill functionality required


// Enhance getter and setter functionality supplied by the mixins
const S = P.setters,
    D = P.deltaSetters;

S.width = function (val) {

    [setter code for this attribute]
};
D.width = function (val) {

    [setter code for this attribute]
};

[ ... et cetera ]


// Define wheel-specific functionality (may overwrite functions supplied by the mixins)
P.dimensionsHelper = function () {

    [...function code]
};

[ ... et cetera ]


// Define the Factory's exported function
export const makeWheel = function (items) {

    if (!items) return false;
    return new Wheel(items);
};

constructors.Wheel = Wheel;
```

### Mixin files
SC uses the [mixin pattern](https://www.patterns.dev/vanilla/mixin-pattern/) to add attributes and functionality to the objects generated by the factory functions. SC mixin files return a single function which can then be used in factory files. For example, let's look at `mixin/entity.js`:

```
// # Entity mixin
// [... top level documentation for the mixin]


// Imports come first
import { addStrings, mergeOver, pushUnique, xt, λnull, Ωempty } from '../helper/utilities.js';
import { makeState } from '../untracked-factory/state.js';
import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';
import { filterEngine } from '../helper/filter-engine.js';
import { importDomImage } from '../asset-management/image-asset.js';
import { currentGroup } from '../factory/canvas.js';

// Mixins are (for expedience) hierarchical
import positionMix from '../mixin/position.js';
import deltaMix from '../mixin/delta.js';
import pivotMix from '../mixin/pivot.js';
import mimicMix from '../mixin/mimic.js';
import pathMix from '../mixin/path.js';
import hiddenElementsMix from '../mixin/hidden-dom-elements.js';
import anchorMix from '../mixin/anchor.js';
import buttonMix from '../mixin/button.js';
import filterMix from '../mixin/filter.js';

// Import shared constants
import { 
    _floor, _keys, _parse, DESTINATION_OUT, FILL, GOOD_HOST, IMG, MOUSE, NAME, 
    PARTICLE, SOURCE_IN, SOURCE_OVER, STATE_KEYS,  UNDEF, ZERO_STR 
} from '../helper/shared-vars.js';

// Define local constants and non-prototypal functions
const NONZERO = 'nonzero';


// #### Export function
export default function (P = Ωempty) {


// Handle the imported mixins first
    positionMix(P);
    deltaMix(P);
    pivotMix(P);
    mimicMix(P);
    pathMix(P);
    hiddenElementsMix(P);
    anchorMix(P);
    buttonMix(P);
    filterMix(P);


// Handle the shared attributes
    const defaultAttributes = {
        method: FILL,
        pathObject: null,
        winding: NONZERO,
        flipReverse: false,
        flipUpend: false,
        scaleOutline: true,
        lockFillStyleToEntity: false,
        lockStrokeStyleToEntity: false,
        onEnter: null,
        onLeave: null,
        onDown: null,
        onUp: null,
        onOtherInteraction: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['state']);
    P.packetFunctions = pushUnique(P.packetFunctions, [
        'onEnter', 'onLeave', 'onDown', 'onUp', 'onOtherInteraction'
    ]);
    P.processEntityPacketOut = function (key, value, incs) {[...]};
    P.processFactoryPacketOut = function (key, value, incs) {[...]};
    P.finalizePacketOut = function (copy, items) {[...]};


// Clone management
    P.postCloneAction = function(clone, items) {[...]};


// Kill management
// No additional kill functionality defined here


// Getters and setters functionality
    const G = P.getters,
        S = P.setters;

    G.group = function () {[...]};
    S.lockStylesToEntity = function (item) {[...]};

    [ ... et cetera ]


// Prototype functions
    P.entityInit = function (items = Ωempty) {[...]};
    P.midInitActions = λnull;

    [ ... et cetera ]
}
```

### Other files
For other files, always `import` first, then define functionality. Exported functions should start with `export` (no end-of-file export objects).
