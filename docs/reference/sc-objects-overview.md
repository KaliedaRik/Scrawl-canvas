# Scrawl-canvas objects overview
The [`<canvas>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas), alongside the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) used to program it, is an **[immediate mode](https://learn.microsoft.com/en-us/windows/win32/learnwin32/retained-mode-versus-immediate-mode) graphics system**. What this means in practical terms is that all Canvas API drawing instructions have to be set out in a Javascript file, or written directly in a `<script>` element, and run in their entirety to generate the canvas display. For animation, this needs to be repeated for every frame of the animation.

Most canvas libraries - including Scrawl-canvas - act as a buffer between the developer and the Canvas API by introducing a stateful [scene graph](https://en.wikipedia.org/wiki/Scene_graph) composed of objects, and groups of objects, which define a set of entities to be drawn onto the canvas. The scene graph gets **rendered** onto the canvas once, then re-rendered only when changes to its state require it. Some canvas libraries are sophisticated enough to only re-render those parts of their scene graph that change, thus minimising the work the browser needs to do. They are, effectively, **retained mode graphics systems**.

## Object creation and the SC library
When a user develops an SC canvas display they start by defining the set of artefacts and entitys they will use in the display, using [factory functions](https://en.wikipedia.org/wiki/Factory_(object-oriented_programming)) supplied by SC for that purpose. These factory functions are easy to identify because they are all named along the lines of `makeSomething`:

```
// Factory functions always return the object they've just created
const redBlock = scrawl.makeBlock({
  name: 'my-red-block',
  width: 200,
  height: 150,
  startX: 50,
  startY: 80,
  fillStyle: 'red',
  method: 'fill',
});
```

Factory functions are each defined in their own Javascript files in the repo. Looking at the repo structure we can see that most of these files are located in the `factory` folder:

```
| - scrawl.js                       Entry file
| - scrawl.d.ts                     TS types definitions for the user API
|
| - asset-management
|   | - [...]
|
| - core
|   | - library.js                  <- the library file
|   | - [...]
|
| - factory
|   | - block.js                    <- makeBlock()
|   | - color.js                    <- makeColor()
|   | - filter.js                   <- makeFilter()
|   | - gradient.js                 <- makeGradient()
|   | - group.js                    <- makeGroup()
|   | - picture.js                  <- makePicture()
|   | - render-animation.js         <- makeRender()
|   | - wheel.js                    <- makeWheel()
|   | - [...]
|
| - helper
|   | - [...]
|
| - mixin
|   | - base.js                     <- the base file
|   | - [...]
|
| - untracked-factory
|   | - drag-zone.js                <- makeDragZone()
|   | - keyboard-zone.js            <- makeKeyboardZone()
|   | - [...]
```

### The `base` mixin
The key difference between the files in the `factory` and `untracked-factory` folders is that the objects created by the factory folder files get tracked in the **SC library**. They also share critical functionality defined in the [`mixin/base.js`](../source/mixin/base.html) file. This functionality includes:
+ The mechanisms to **define an attribute**, give it a **default value** and supply **setter** and **getter** functions to read and update those attributes - `.get() .set() .setDelta()`.
+ The `name` attribute, and the functionality to make sure objects have names that are (mostly) unique in the SC library.
+ Object serialization and deserialization functionality through the **packet management** system.
+ Object **cloning functionality**, which is built on top of the packet management system - `.clone()`.
+ Registering and deregistering objects in the SC library, including object **kill functionality** - `.kill()`.

### Object naming
Every tracked SC object needs a name - if the user fails to provide the factory function with a `name` attribute SC will assign the object a random (and very ugly) name.

Object names need to be (mostly) unique because SC uses the `name` attribute as the object's key in the SC library. The user should always be able to locate an object in the library, and retrieve it, if they know its name.

> **tl;dr: namespacing objects in the SC library is highly recommended!** Because the SC library can quickly fill with objects, keeping the library tidy becomes a priority - particularly when objects are no longer required for the `<canvas>` display.

A simple way for the user to namespace objects is to use a small piece of boilerplate code in their project files, along the lines of: 

```
const namespace = `${canvas.name}-somenamespacestring`;
const name = (n) => `${namespace}-${n}`;

// Object creation
scrawl.makeBlock({
  name: name('red-block'),
  ...
}).clone({
  name: name('blue-block'),
  ...
});

// Purging objects from the SC library
scrawl.purge(namespace);
```

### The Scrawl-canvas library
The SC library comprises a set of `{key: value}` objects where we store all tracked objects created by the SC factory functions. The library is divided into the following sections:

```
anchor
  |-- Anchor object instances
  |-- Button object instances
  |
animation
  |-- Animation object instances
  |-- RenderAnimation object instances
  |
  |-- (Animation SC-core-filters-cleanup-action)
  |-- (Animation SC-core-gradient-delta-animation)
  |-- (Animation SC-core-listeners-tracker)
  |-- (Animation SC-core-tickers-animation)
  |-- (Animation SC-core-workstore-hygeine)
  |
animationtickers
  |-- Ticker object instances
  |
artefact
  |-- Canvas artefact instances
  |-- Element artefact instances
  |-- Stack artefact instances
  |
  |-- Bezier entity instances
  |-- Block entity instances
  |-- Cog entity instances
  |-- Crescent entity instances
  |-- Emitter entity instances [physics engine]
  |-- EnhancedLabel entity instances
  |-- Grid entity instances
  |-- Label entity instances
  |-- LineSpiral entity instances
  |-- Line entity instances
  |-- Loom entity instances
  |-- Mesh entity instances [physics-related]
  |-- Net entity instances [physics engine]
  |-- Oval entity instances
  |-- Picture entity instances
  |-- Polygon entity instances
  |-- Polyline entity instances
  |-- Quadratic entity instances
  |-- Rectangle entity instances
  |-- Shape entity instances
  |-- Spiral entity instances
  |-- Star entity instances
  |-- Tetragon entity instances
  |-- Tracer entity instances [physics engine]
  |-- Wheel entity instances
  |
asset
  |-- ImageAsset object instances
  |-- NoiseAsset object instances
  |-- RawAsset object instances
  |-- RdAsset object instances
  |-- VideoAsset object instances
  |
  |-- Cell object instances
  |
canvas
  |-- Canvas artefact instances
  |
cell
  |-- Cell object instances
  |
element
  |-- Element artefact instances
  |
entity
  |-- Bezier entity instances
  |-- Block entity instances
  |-- Cog entity instances
  |-- Crescent entity instances
  |-- Emitter entity instances [physics engine]
  |-- EnhancedLabel entity instances
  |-- Grid entity instances
  |-- Label entity instances
  |-- LineSpiral entity instances
  |-- Line entity instances
  |-- Loom entity instances
  |-- Mesh entity instances [physics-related]
  |-- Net entity instances [physics engine]
  |-- Oval entity instances
  |-- Picture entity instances
  |-- Polygon entity instances
  |-- Polyline entity instances
  |-- Quadratic entity instances
  |-- Rectangle entity instances
  |-- Shape entity instances
  |-- Spiral entity instances
  |-- Star entity instances
  |-- Tetragon entity instances
  |-- Tracer entity instances [physics engine]
  |-- Wheel entity instances
  |
filter
  |-- Filter object instances
  |
fontfamilymetadata
  |-- Font data objects [text layout engine]
  |
force
  |-- Force object instances [physics engine]
  |
  |-- (Force gravity)
  |
group
  |-- Group object instances
  |
particle
  |-- Particle object instances [physics engine]
  |
spring
  |-- Spring object instances [physics engine]
  |
stack
  |-- Stack artefact instances
  |
styles
  |-- Color object instances
  |-- ConicGradient object instances
  |-- Gradient object instances
  |-- Pattern object instances
  |-- RadialGradient object instances
  |
  |-- (Color SC-core-color-engine)
  |
tween
  |-- Action object instances
  |-- Tween object instances
  |
unstackedelement
  |-- UnstackedElement object instances [snippets]
  |
world
  |-- World object instances [physics engine]
```

Some points of interest:
+ Object `name` attributes need to be unique in each section: Group objects and Cell objects can share the same name; Canvas, Element, Stack, Cell and entity object names must be unique between them.
+ The `artefact` section is a collection of all the objects in the `canvas`, `element`, `entity` and `stack` sections.
+ Canvas objects will always have an associated Cell object to act as its **base Cell** (though their `name` attributes differ).
+ Cell objects will always have one Group object with which it shares its `name` attribute.
+ Cell objects, while their own thing, can also act similarly to an `artefact` object (positioning on another Cell object) and like an `asset` object (for Picture and Pattern objects); they do not get recorded in the `artefact` section but they will have an entry in the `asset` section.
+ The (objects in parentheses) get created during [page load initialization](sc-initialization.html) and should not be tampered with.


### Locating objects in the SC library
The SC library provides helper functions for locating objects in the library. Each function targets a specific section, and they all follow the same pattern: `findSomething('object-name')`

```
// Object creation
scrawl.makeBlock({
  name: name('red-block'),
  ...
});

// Object retrieval
const myRedBlock = scrawl.findEntity(name('red-block'));
```

Alternatively, users can get the object directly from the library using dot.notation:

```
const myRedBlock = scrawl.library.entity[name('red-block')];
```

### Deleting objects, and SC library hygeine
The easiest way to delete an object is to invoke its **kill** function: `myRedBlock.kill()`. This will delete all references to the object across the SC system and remove it from the SC library.

However there may be times when a user wants to delete many objects, for instance if they have set up a static background and want to free up some memory for other tasks. This is where **namespacing** the objects becomes really useful as SC exports a function - `scrawl.purge('namespace-string')` - to purge all objects whose names start with that namespace string from the system. See [Demo Canvas-046](../../demo/canvas-046.html) for a working example.

## Getting and setting object attributes
While the SC (bespoke) property accessor functionality may seem over-complicated on first glance, the system has been built in this way for reasons that have evolved over the course of the library's history:

+ Every factory function constructs its object instances in the same way, assigning all the attributes that the object instance will ever hold with default values before populating those attributes with values supplied to it in the function's argument object. This is done to establish the [object instance's shape](https://mathiasbynens.be/notes/shapes-ics) in a way that promotes Javascript engine speed.
+ The object instance's setter (`.set()`, `.setDelta()`) functions do the necessary work to maintain the instance's shape: if the user tries to add a new attribute to the instance, it will be ignored. These functions also manage part of the [SC signals system](sc-events-signals.html), which tells objects that they need to update (some of) their attribute values as a result of updates in other parts of the ecosystem.
+ The object instances that a factory function generates can be complicated, with nested arrays, functions and objects assigned to attributes. SC property accessors try to simplify the getting and setting of instance attributes so that developers don't need to remember the instance's shape to get work done (thus, a better developer experience).

> **tl;dr:** SC does ***not*** encourage the use of [Javascript property accessors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors) (dot-notation or bracket-notation syntax) for getting or setting values on factory-generated object instances in product code. Use the `.get('attribute')`, `.set({key: value, ...})` and `.setDelta({key: value, ...})` functions instead.

The SC property accessor functionality is initially defined in the [base mixin file](../source/mixin/base.html). However each factory function generates differently shaped instance objects so some mixin files and factory functions will overwrite the accessor functions to make sure they meet the needs of the instance. For example, the `.get()` function gets overwritten in the following files:
+ [mixin/entity.js](../source/mixin/entity.html) - to include context engine state attributes
+ [factory/loom.js](../source/factory/loom.html) - a complex entity that uses other entitys for its functionality
+ [factory/mesh.js](../source/factory/mesh.html) - a complex entity that uses other entitys for its functionality
+ [factory/picture.js](../source/factory/picture.html) - to include asset object attributes and functionality
+ [mixin/styles.js](../source/mixin/styles.html) - to include gradient palette functionality
+ [factory/cell.js](../source/factory/cell.html) - to include styles functionality
+ [factory/color.js](../source/factory/color.html) - to include gradient palette functionality
+ [factory/pattern.js](../source/factory/pattern.html) - to include asset object attributes and functionality
+ [mixin/text.js](../source/mixin/text.html) - to include text-style functionality

(For future consideration: there may be some merit to reworking the SC property accessor functionality, to use [Object.defineProperty()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) - it could simplify the code base and allow developers to more safely use dot-notation/bracket-notation syntax in their product code. This would, however, be a significant amount of work for - potentially! - minimal benefit.)

## Object serialization and cloning
SC objects can be [serialized](https://en.wikipedia.org/wiki/Serialization) into strings - for storage, transmission over networks, etc - and deserialized from those strings back into objects. This includes serializing functions assigned to object attributes.

Javascript does not tell a good story when it comes to serializing functions. By necessity, SC has to use the Javascript [`Function() constructor`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function) as part of the deserialization process. Some people may consider this to be a security risk but, compared to using `eval()` to deserialize the function, the risk is minimal (but not eliminated).

Because of the issues surrounding Javascript object serialization, SC implemenets its own serialization functionality called **packet management**. Much of this functionality gets defined in the [base mixin file](../source/mixin/base.html) using the following prototype attributes and functions:
+ [internal] `packetExclusions - string[]`
+ [internal] `packetExclusionsByRegex - string[]`
+ [internal] `packetCoordinates - string[]`
+ [internal] `packetObjects - string[]`
+ [internal] `packetFunctions - string[]`
+ **[public] `saveAsPacket - function(items: object)`**
+ [internal] `stringifyFunction - function (val: string)`
+ [internal] `processPacketOut - function (key, value, incl)`
+ [internal] `finalizePacketOut - function (copy: object)`
+ **[public] `importPacket - function (items: URLstring | URLstring[])`**
+ **[public] `actionPacket - function (packet: string)`**
+ [internal] `actionPacketFunctions - function(obj: object, item: string)`

Much of the complexity in the packet management system arises from the shapes of the object instances produced by the factory functions, and the need to (as far as possible) minimize the string lengths of the packets produced by the system. For this reason mixin files and factory functions will add data to the base mixin's attributes and, on occasion, overwrite functions - in particular `finalizePacketOut()`.

> **tl;dr:** The packet management system is still a work-in-progress - it works, but it can work better. Some SC objects have not yet been included in the system (such as: Canvas); and there's more work to be done around string length minimization.

An example of a packet string created by SC object serialization looks like this:

```
const block = scrawl.makeBlock({
    name: name('block-fill'),
    width: 100,
    height: 100,
    startX: 25,
    startY: 25,
    fillStyle: 'green',
    strokeStyle: 'gold',
    lineWidth: 6,
    lineJoin: 'round',
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowBlur: 2,
    shadowColor: 'black',
});

console.log(block.saveAsPacket());

// Results
["mycanvas-block-fill","Block","entity",{"name":"mycanvas-block-fill","dimensions":[100,10
0],"start":[25,25],"delta":{},"deltaConstraints":{},"pivot":null,"mimic":null,"filters":[]
,"visibility":true,"calculateOrder":0,"stampOrder":0,"bringToFrontOnDrag":true,"ignoreDrag
ForX":false,"ignoreDragForY":false,"scale":1,"roll":0,"noUserInteraction":false,"noPositio
nDependencies":false,"noCanvasEngineUpdates":false,"noFilters":false,"noPathUpdates":false
,"noDeltaUpdates":false,"checkDeltaConstraints":false,"performDeltaChecks":false,"pivotPin
":0,"pivotIndex":-1,"addPivotHandle":false,"addPivotOffset":true,"addPivotRotation":false,
"useMimicDimensions":false,"useMimicScale":false,"useMimicStart":false,"useMimicHandle":fa
lse,"useMimicOffset":false,"useMimicRotation":false,"useMimicFlip":false,"addOwnDimensions
ToMimic":false,"addOwnScaleToMimic":false,"addOwnStartToMimic":false,"addOwnHandleToMimic"
:false,"addOwnOffsetToMimic":false,"addOwnRotationToMimic":false,"pathPosition":0,"addPath
Handle":false,"addPathOffset":true,"addPathRotation":false,"constantSpeedAlongPath":false,
"isStencil":false,"memoizeFilterOutput":false,"method":"fill","winding":"nonzero","flipRev
erse":false,"flipUpend":false,"scaleOutline":true,"scaleShadow":false,"lockFillStyleToEnti
ty":false,"lockStrokeStyleToEntity":false,"onEnter":"~~~","onLeave":"~~~","onDown":"~~~","
onUp":"~~~","onOtherInteraction":"~~~","group":"mycanvas_base","fillStyle":"green","stroke
Style":"gold","lineWidth":6,"lineJoin":"round","shadowOffsetX":4,"shadowOffsetY":4,"shadow
Blur":2,"shadowColor":"black"}]
``` 

Because packet management is central to SC functionality it gets tested in a number of the demos. More dedicated packet management testing happens in demos [Packets-001](../../demo/packets-001.html) and [Packets-002](../../demo/packets-002.html).

### Clone functionality
The SC cloning functionality is tied closely to the packet functionality. To create a clone of an object SC will first serialize the object, and then deserialize the resulting string to create a new object, which can in turn action the updates described in the `.clone()` function's argument object.

Most SC clone functionality is coded into the [base mixin file](../source/mixin/base.html) `.clone({key: value, ...})` function. Various mixin and factory functions will finesse that functionality to better match their instance object shape requirements by overwriting the base mixin's `postCloneAction()` function.

## Exceptions to the outlined processes
The ecosystem of mixin and factory functions which make up the SC stateful scene graph is necessarily complex, partly to meet the requirements of a (hopefully) fast and memory-efficient code base, but also to make the creation of `<canvas>` displays with SC as simple as possible for developers (good UX).

Most factory function and mixin files follow the above outlined processes; a few do not. Brief details of these divergent files are given below.

### Canvas and Stack factory functions
The [Canvas](../source/factory/canvas.html) and [Stack](../source/factory/stack.html) factory functions do not contribute (for the most part) to the SC scene graph. Instead they are the mechanisms by which the scene graph deploys to the web page. Because of this intimate connection to the web page's [Document Object Model](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), these functions do not export a `makeCanvas` or `makeStack` function.

There's three ways a user can add an SC-controlled `<canvas>` or `<div>` stack to a web page:
+ Hard-code the elements into the web page, so that SC can discover and wrap the elements into the SC ecosystem as part of [initialization discovery](sc-initialization.html). Most of the test demos rely on this approach.
+ Use the SC functions `scrawl.addCanvas()` and `scrawl.addStack()` to insert and wrap new `<canvas>` and `<div>` stack elements into the DOM after page load completes. See demos [DOM-010](../../demo/dom-010.html) (for Stacks) and [DOM-012](../../demo/dom-012.html) (for Canvases) for examples of using this approach.
+ Rely on a 3rd party framework - such as React, Angular, Vue, Svelte, etc - to create and add the canvas or stack elements to the DOM as part of their normal component functionality, and then wrap those elements into the SC ecosystem using the `scrawl.getCanvas()` and `scrawl.getStack()` functions. See demo [DOM-017](../../demo/dom-017.html) for an example of using this approach.

For the moment, SC does not support packet management and cloning functionality for Canvas and Stack instances. This may change in the future.

The `myStack.kill()` and `myCanvas.kill()` functions will not only remove the Canvas and Stack object instances from the SC ecosystem, but also kill any SC objects associated with the Canvas and Stack instances. Additionally, the kill functions will delete the `<canvas>` and `<div>` stack elements from the DOM.

### Cell factory function
The [Cell factory function](../source/factory/cell.html) does export a `makeCell()` function, but this is only used internally by other modules in the repo code.

Instead, Cells have to be created against the Canvas wrapper object which will host the Cell object: `myCanvas.buildCell({name: string, key: value, ...})`.

For the moment, SC does not support packet management and cloning functionality for Cell instances. This may change in the future.

The `myCell.kill()` function does work, removing both the Cell instance and its associated Group instance but not any artefacts or entitys associated with that Group.

### Animation and RenderAnimation factory functions
The [Animation](../source/factory/animation.html) and [RenderAnimation](../source/factory/render-animation.html) factory functions export `scrawl.makeAnimation()` and `scrawl.makeRender()` functions for instance creation.

For the moment, SC does not support packet management and cloning functionality for Animation or RenderAnimation instances. This may change in the future.

Animation instances include an `.onKill` attribute which accepts a function as its value. When the `myAnimation.kill()` function is invoked this additional kill function will run immediately prior to the instance's removal from the SC system.

### Loom and Mesh entity factory functions
The [Loom](../source/factory/loom.html) and [Mesh](../source/factory/mesh.html) entity factory functions differ from other entity factories in that they do not use the [mixin/entity.js](../source/mixin/entity.html) mixin. This is because they rely on other entitys to define their positions in a canvas display.

Packet management support has been coded for these entitys, but tests have not yet been written for the functionality. Cloning functionality has, for the time being, been disabled. Kill functionality has been enabled but, again, not properly tested. 

### Image-based asset management factory functions
Image-based asset code does not include factory functions to create instances of the assets. This is because image-based assets are often closely tied to image files which need to be fetched across the network, or to `<img>` and `<video>` elements in the DOM.

To fetch and wrap an image or video file, users can set the file URL in a `.source` attribute when creating [Picture](../source/factory/picture.html) entity or [Pattern](../source/factory/pattern.html) style instances.

Alternatively, users can invoke `scrawl.importImage('url-string')`, `scrawl.importSprite('url-string')` and `scrawl.importVideo('url-string')` to load these assets from remote files.

However the best approach for managing visual assets is to define them in the DOM and then import them using the `scrawl.importDomImage('css-query-string')` and `scrawl.importDomVideo('css-query-string')` functions. This allows the user to define these assets in a responsive manner, and to import multiple assets in a single invocation. The associated SC files include functionality to manage responsive image and video elements (TODO code up similar functionality for sprite assets):
+ [ImageAsset](../source/asset-management/image-asset.html)
+ [SpriteAsset](../source/asset-management/sprite-asset.html)
+ [VideoAsset](../source/asset-management/video-asset.html)

Users can, in a similar way, import browser [media streams](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) and [screen capture streams](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API) for use in canvas displays by invoking the `scrawl.importMediaStream()` and `scrawl.importScreenCapture()` functions. Note that browsers will impose an [end user consent check](https://developer.mozilla.org/en-US/docs/Web/Privacy#opt-in_for_powerful_features) before the asset can be imported into the SC environment.

SC does not support packet management and cloning functionality for any asset instances (including [NoiseAsset](../source/asset-management/noise-asset.html), [RawAsset](../source/asset-management/raw-asset.html) and [ReactionDiffusionAsset](../source/asset-management/reaction-diffusion-asset.html)). Kill functionality works as expected.

### Pool-based factory functions
Users can request the following pool-based objects. **It is imperative that if the user requests an object, they must release it when done with it** - failure to do so may lead to slow memory leaks and degraded performance over time:
+ [Coordinate](../source/untracked-factory/coordinate.html) - `requestCoordinate()`, `releaseCoordinate()`
+ [Quaternion](../source/untracked-factory/quaternion.html) - `requestQuaternion()`, `releaseQuaternion()`
+ [Vector](../source/untracked-factory/vector.html) - `requestVector()`, `releaseVector()`

Note that these pooled objects are not tracked in the SC library.
