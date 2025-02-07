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

The init file is the first piece of code to run when importing the SC library. Note that ***the code will not run if it finds itself in an environment which doesn't include a global `window` object***.

```
import { startCoreAnimationLoop } from './animation-loop.js';
import { getCanvases } from '../factory/canvas.js';
import { getStacks } from '../factory/stack.js';

import { startCoreListeners, applyCoreResizeListener, applyCoreScrollListener } from './user-interaction.js';

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

### Discovery
[TODO: write up]

### The core animation loop
[TODO: write up]

### Core event listeners
[TODO: write up]





