# Scrawl-canvas page load initialization
Scrawl-canvas is a [modular javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) library, which needs to be ***included*** into other Typescript/Javascript code. For instance, if the library has been added via `npm install` or `yarn add` then we can include the library into code like this:

```
include * as scrawl from 'scrawl-canvas';
```

While this `include` statement may happen many times across different JS/TS files in a web page, ***the SC code itself will run just once, during page load***, when the browser first encounters the `include` statement. For every subsequent encounter, the browser just returns the SC object (`scrawl`) that was generated on that first encounter. This has implications when using SC in framework environments such as React, Vue, Angular, Svelte, etc.

> **tl;dr: We strongly recommend that code using Scrawl-canvas only runs after the page's HTML download completes.** This is because SC initialization code will interrogate the web page's DOM, looking for &lt;canvas> and &lt;div> stack elements that we want it to manage ... but this only happens once per page load!

## The `scrawl.js` file
The `package.json` file has the following structure:

```
{
  "name": "scrawl-canvas",
  "version": [current version number],
  "description": [current version number and release date],
  "main": "./min/scrawl.js",
  "type": "module",
  "types": "./source/scrawl.d.ts",
  "scripts": [ ... various script definitions ],
  "keywords": [ ... various keywords ],
  "repository": { ... repository details },
  "license": "MIT",
  "homepage": "https://github.com/KaliedaRik/Scrawl-canvas#readme",
  "devDependencies": { ... note: no direct or peer dependencies permitted! },
  "packageManager": "yarn@4.0.1"
}
```

This tells us that the library's entry point is the `min/scrawl.js` file (which includes all of the library's `source` folder's code). Note that the minified file has not been [tree-shaken](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) - a known issue that has not yet been fixed.

> **tl;dr: If tree shaking is essential** then developers can edit the `scrawl.js` file, commenting out the functionality they do not need in their project. They will have to rebuild the library locally, and be aware that updating the library at any point will destroy their prior work with this file (unless they take action in their dev toolchain to somehow preserve the file between updates).

The `source/scrawl.js` file looks like this:

```
// ## Initialize Scrawl-canvas
import { init as _init } from './core/init.js';
export const init = _init;

if (typeof window !== 'undefined') _init();

// ## Export Scrawl-canvas module functions
export {
    startCoreAnimationLoop,
    stopCoreAnimationLoop,
} from './core/animation-loop.js';
export {
    clear,
    compile,
    show,
    render,
} from './core/display-cycle.js';
export { recalculateFonts } from './core/document.js';
export {
    addListener,
    removeListener,
    addNativeListener,
    removeNativeListener,
    makeAnimationObserver,
} from './core/events.js';
export * as library from './core/library.js';

[ ... etc ]
```

When the browser's JS engine runs this code it will at the same time construct all of the factory and other objects used by the SC system.

## The `core/init.js` file

The init file is the first piece of functionality to run when importing the SC library. Note that ***the code will not run if it finds itself in an environment which doesn't include a global `window` object***.

```
import { startCoreAnimationLoop } from './animation-loop.js';
import { getCanvases } from '../factory/canvas.js';
import { getStacks } from '../factory/stack.js';

import { 
	startCoreListeners,
	applyCoreResizeListener,
	applyCoreScrollListener,
} from './user-interaction.js';

export const init = function () {

	// Discovery phase
    getStacks();
    getCanvases();

	// Start the core animation loop
    startCoreAnimationLoop();

	// Start the core listeners on the window object
    applyCoreResizeListener();
    applyCoreScrollListener();
    startCoreListeners();
};
```

### Imports
For a project whose only action relating to SC is to import the library into code, where we have commented out all the export lines in the `scrawl.js` file except the first four, the browser will read and run code from the following library modules:
+ `asset-management/image-asset.js`
+ `core/animation-loop.js`
+ `core/document.js`
+ `core/events.js`
+ `core/init.js`
+ `core/library.js`
+ `core/user-interaction.js`
+ `factory/anchor.js`
+ `factory/animation.js`
+ `factory/button.js`
+ `factory/canvas.js`
+ `factory/cell.js`
+ `factory/color.js`
+ `factory/element.js`
+ `factory/group.js`
+ `factory/stack.js`
+ `helper/array-pool.js`
+ `helper/document-root-elements.js`
+ `helper/filter-engine-bluenoise-data.js`
+ `helper/filter-engine.js`
+ `helper/random-seed.js`
+ `helper/shared-vars.js`
+ `helper/system-flags.js`
+ `helper/utilities.js`
+ `helper/workstore.js`
+ `mixin/anchor.js`
+ `mixin/asset.js`
+ `mixin/base.js`
+ `mixin/button.js`
+ `mixin/cascade.js`
+ `mixin/cell-key-functionality.js`
+ `mixin/delta.js`
+ `mixin/display-shape.js`
+ `mixin/dom.js`
+ `mixin/filter.js`
+ `mixin/hidden-dom-elements.js`
+ `mixin/mimic.js`
+ `mixin/path.js`
+ `mixin/pattern.js`
+ `mixin/pivot.js`
+ `mixin/position.js`
+ `untracked-factory/cell-fragment.js`
+ `untracked-factory/coordinate.js`
+ `untracked-factory/quaternion.js`
+ `untracked-factory/state.js`
+ `untracked-factory/vector.js`

All other SC modules are loaded as a consequence of being included as exports from the `scrawl.js` file.

### Discovery activity
The `init()` function, when it runs, invokes two discovery operations:
+ `getStacks()` - to find and wrap all DOM elements marked with a `data-scrawl-stack` attribute into [Stack artefact objects](../source/factory/stack.html). Additionally, all direct child elements of the stack element will be wrapped in [Element artefact objects](../source/factory/element.html)
+ `getCanvases()` - to find and wrap all &lt;canvas> elements marked with a `data-scrawl-canvas` attribute into [Canvas artefact objects](../source/factory/canvas.html)

Because this discovery activity happens as soon as the SC code loads, and only happens once per page load, it is imperative that the code does not run until the browser has downloaded the HTML file and constructed its Document Object Model from the file's content.

It's also important to remember that this discovery activity will only find &lt;canvas> elements (and stacks) that already exist in (have been hard-coded into) the HTML file. Any &lt;canvas> element added to the DOM after page load - for instance through [framework client-side hydration](https://en.wikipedia.org/wiki/Hydration_(web_development)) or an [Islands architecture](https://www.patterns.dev/vanilla/islands-architecture/) pattern - will not be found during the discovery phase and thus will not have been wrapped into the SC library.

This has implications for when we want to retrieve the generated artefacts from the SC library for further use:
+ If the artefact was created as part of the discovery process, we can use the `scrawl.findArtefact('element-id')`, `scrawl.findCanvas('element-id')` or `scrawl.findStack('element-id')` functions to retrieve them. Most of the [SC demo tests](../../demo/index.html) include this functionality
+ If, however, the HTML element was added to the DOM after the initial load - as happens in various component-based frameworks such as React, Angular, Vue, Svelte, etc - then we need to use the `scrawl.getCanvas('element-id')` and `scrawl.getStack('element-id')` functions, which perform a post-load discovery operation and wrap the element in a Canvas or Stack wrapper artefact. This functionality can be seen in [demo DOM-017](../demo/dom-017.html)

## The Scrawl-canvas animation loop
The SC system runs a single [RequestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) animation loop, which we start as part of the initialization work. More details about the animation loop can be found in the [core.animation-loop.js](../source/core/animation-loop.html) file.

During initialization a number of system animations get created and added to the animation loop:
+ `SC-core-filters-cleanup-action` - defined in [helper/filter-engine.js](../source/helper/filter-engine.html)
+ `SC-core-gradient-delta-animation` - defined in [mixin/styles.js](../source/mixin/styles.html)
+ `SC-core-listeners-tracker` - defined in [core/user-interaction.js](../source/core/user-interaction.html)
+ `SC-core-tickers-animation` - defined in [factory/ticker.js](../source/factory/ticker.html)
+ `SC-core-workstore-hygeine` - defined in [helper/workstore.js](../source/helper/workstore.html)

Note that by default, the animation loop is throttled to run at a maximum 60 frames-per-second. This rate can only be changed after initialization completes.

## Core constants, flags and event listeners
Two of the key drivers for SC is to make &lt;canvas> elements responsive to their environments, and offer high-level functionality for user interactions with those responsive elements. Much of the code that handles this functionality can be found in the [core/user-interaction.js](../source/core/user-interaction.html) file.

The code in this file makes heavy use of shared constants and system flags. As a result, these also need to be instantiated as part of the initialization process.

### Shared constants
The thinking behind shared constants is that we should minimize the work required to create throwaway strings and arrays used in loops or conditional tests - especially when we find ourselves using the same string or array across different files.

To solve this issue we define and export a common set of strings and arrays in the [helper/shared-vars.js](../source/helper/shared-vars.html) file. Examples of exports in the file include:

```
export const _piDouble = Math.PI * 2;
export const _piHalf = Math.PI * 0.5;
export const _pow = Math.pow;
export const _radian = Math.PI / 180;
export const _random = Math.random;
...
export const ACCEPTED_WRAPPERS = ['Canvas', 'Stack'];
export const ADD_EVENT_LISTENER = 'addEventListener';
...
export const INT_COLOR_SPACES = ['RGB', 'HSL', 'HWB', 'XYZ', 'LAB', 'LCH', 'OKLAB', 'OKLCH'];
export const INVERT_CHANNELS = 'invert-channels';
export const LEAVE = 'leave';
...
export const T_CELL = 'Cell';
export const T_COLOR = 'Color';
export const T_COORDINATE = 'Coordinate';
export const T_ENHANCED_LABEL = 'EnhancedLabel';
...
export const WHITE = 'rgb(255 255 255 / 1)';
export const WIDTH = 'width';
export const ZERO_PATH = 'M0,0';
export const ZERO_STR = '';
```

Note that we don't have any proof that this helps cut down on unnecessary work. It's just part of the SC ethos to only define constants once, and to define/export a constant from this file if we find ourselves using it in different modules.

### System flags
SC uses flags - commonly Boolean - for much of its internal signalling and communications work. Many of the flags related to system state get defined in the [helper/system-flags.js](../source/helper/system-flags.html) file. For example:

```
let mouseChanged = false;
export const getMouseChanged = () => mouseChanged;
export const setMouseChanged = (val) => mouseChanged = val;

let viewportChanged = false;
export const getViewportChanged = () => viewportChanged;
export const setViewportChanged = (val) => viewportChanged = val;

let prefersContrastChanged = false;
export const getPrefersContrastChanged = () => prefersContrastChanged;
export const setPrefersContrastChanged = (val) => prefersContrastChanged = val;
```

### The `currentCorePosition` object
SC keeps track of system state, and changes to that state, in its `currentCorePosition` object:

```
export const currentCorePosition = {
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    w: 0,
    h: 0,
    type: MOUSE,
    prefersReducedMotion: false,
    prefersDarkColorScheme: false,
    prefersReduceTransparency: false,
    prefersContrast: false,
    prefersReduceData: false,
    displaySupportsP3Color: false,
    canvasSupportsP3Color: false,
    devicePixelRatio: 0,
    rawTouches: [],
};
```

SC checks for changes to system state using an animation object - `SC-core-listeners-tracker` - that runs once at the start of each animation loop. When changes are detected Canvas and Stack artefacts will be informed (via `dirty flags`). When they in turn run their Display cycle functionality they will cascade that information to their constituent objects who will, if necessary, update their state to reflect the changed environment. 

### Browser mouse, scroll and resize events

### User preferences media queries and events

## Scrawl-canvas pools
SC code needs to run fast. For this reason functional programming approaches, where new objects get created rather than existing objects mutated, adds computational weight (and excessive garbage collection) which is best avoided.

Instead, SC code makes use of a set of pooled objects and arrays for much of its functionality. These pools get initialised when the browser first imports the relevant modules, and start as empty arrays. While some of these pools are made available to the user via scrawl functions, others are strictly internal.

Pooled objects/arrays include:
+ [internal only] Generic **zero-length arrays**, from [helper/array-pool.js](../source/helper/array-pool.html); note that the pool will be periodically culled - `requestArray()`, `releaseArray()`
+ [internal only] SC basic **Cell objects** from [untracked-factory/cell-fragment.js](../source/untracked-factory/cell-fragment.html), wrapping unattached &lt;canvas> elements and their associated 2D context engines - `requestCell()`, `releaseCell()`
+ [exported] SC **coordinate arrays**, from [untracked-factory/coordinate.js](../source/untracked-factory/coordinate.html) - `requestCoordinate()`, `releaseCoordinate()`
+ [internal only] SC **particle objects** from [factory/particle.js](../source/factory/particle.html); note that the pool will be periodically culled - `requestParticle()`, `releaseParticle()`
+ [internal only] SC **particle history arrays** from [untracked-factory/particle-history.js](../source/untracked-factory/particle-history.html); note that the pool will be periodically culled - `requestParticleHistory()`, `releaseParticleHistory()`
+ [exported] SC **quaternion objects**, from [untracked-factory/quaternion.js](../source/untracked-factory/quaternion.html) - `requestQuaternion()`, `releaseQuaternion()`
+ [exported] SC **vector objects**, from [untracked-factory/vector.js](../source/untracked-factory/vector.html) - `requestVector()`, `releaseVector()`

> **tl;dr: Always release requested pooled objects/arrays!** Failure to release them will lead to less efficient code and (potentially) slow memory leaks.

## Scrawl-canvas filter engine
SC comes with a sophisticated set of filters which can be applied at the entity, Group or Cell level - see [demo Canvas-007](../demo/canvas-007.html) for an example.

The functionality to generate these filters and apply them to entitys, Groups and Cells is housed in a single filter engine object whose code can be found in the [helper/filter-engine.js](../source/helper/filter-engine.html) file. This singleton object is instantiated as part of the SC initialization process as a by-product of both the Cell and Group modules importing it.

The filter engine module will also set up a permanent animation object - `SC-core-filters-cleanup-action` - to run once at the end of every animation loop iteration, to reset [filter object](../source/factory/filter.html) `dirtyFilterIdentifier` flags back to `false`.

## Scrawl-canvas workstore
The SC workstore is an internal mechanism for caching various computationally-intensive objects; it is used in particular by the singleton filter engine but is available for use by other SC modules as required.

Every object cached in the workstore includes a timestamp indicating the last time it was accessed; the workstore actively purges objects that haven't been recently accessed. This action is handled by an animation object - `SC-core-workstore-hygeine` - which gets instantiated at the same time as the workstore.

More details about workstore functionality can be found in its [module file](../source/helper/workstore.html).



