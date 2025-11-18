# Scrawl-canvas events and signals
SC does not include a bespoke implementation of an event-driven system. SC artefact, entity and animation objects do not generate any [custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) as part of their functionality.

Instead SC relies on the normal [event system](https://developer.mozilla.org/en-US/docs/Web/Events) provided by the browser to handle user interactions with an SC Canvas or Stack display:
+ SC uses a number of system-generated event listeners to handle changes in the browser environment, for instance:

  - A single event listener to track mouse movement across the viewport.

  - Similarly, event listeners to react to user-initiated page scrolling and browser window resize events.

  - [Intersection observers](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to report on `<canvas>` and stack DOM element positioning within the browser viewport.

  - Event listeners assigned to various [CSS matchMedia() queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) to monitor, in particular, user-set media preferences.

+ SC also supplies the product-dev with a set of convenience functions to capture various user interactions with a Canvas or Stack display, including:
  - Mouse, touch and pointer events.
  - Drag-and-drop functionality.
  - Keyboard navigation and trigger events.
  - Interactions with form element controls.
  - Responsive image management.
  - Media stream, and screen capture, events.

For the most part, these events do not trigger immediate changes in the SC system or its data. Rather they will update values held in the `currentCorePosition` object (which acts as SC's Single Source of Truth for this data) and set relevant [dirty flags](https://gameprogrammingpatterns.com/dirty-flag.html) which the system can then address during the next Display cycle.

This **signals system** pattern is also used by other SC objects – in particular artefact and entity objects – to communicate changes in their data to other objects that rely on the changed data for their own calculations: when a change occurs dirty flags will be set, but actioning those changes and alerting subscribed objects of those changes is deferred until the next Display cycle.

## System events
[write up]
+ Intro text - can divide system listeners into 2 groups: those that listen on the window, and those that listen on the canvas
+ Most code is in core/user-interactions.js and helper/system-flags.js
+ We can divide functionality into groups:
  - Core listeners, which track the browser viewport dimensions (resize), the page position within the viewport (scroll), and the pointer/touch position over the viewport (move). Product-devs can switch these listeners on/off as a whole (tied to RAF animation) and trigger each individually if the need arises
  - Environment listeners: dynamically tracking accessibility preferences; and the device and screen capabilities on which the window currently displays (display-p3, device ixel ratio). Also includes some font management functionality.

### The core listeners tracker function
[write up]
+ SC doesn't debounce system event listeners. Instead, it limits the functionality triggered - setting dirty flags maintained in the system-flags.js file, alongside updating the tracked data values in the `currentCorePosition` object.
+ user-interaction.js exports an array - `uiSubscribedElements` - which Canvas/Stack wrapper artefacts can add their name values to (and remove them).
+ The `coreListenersTracker` function is an SC animation object which runs once at the start of each RAF
  - Can be controlled by Product-devs using `scrawl.startCoreListeners()` and `scrawl.stopCoreListeners()` functions.
  - Triggers the `updateUiSubscribedElements` function when required, and also updates font-related data.
+ The `updateUiSubscribedElements` function loops through the `uiSubscribedElements` array and, for each artefact object:
  - Updates the artefact's `here` object with updated data
  - Triggers the artefact's accessibility hook functions
  - Updates the artefact's dimensions using its `set` functionality (so the artefact can set its own appropriate dirty flags)
+ core/user-interactions.js also exports some internal functions - `applyCoreResizeListener`, `applyCoreScrollListener`, `purgeFontMetadata`, `purgeFontMetadata` - which repo-devs can import into other SC files. Use with care!

#### Resize action
[write up]

#### Scroll action
[write up]

#### Move action
[write up]

### Tracking the browser environment
[write up]

#### Accessibility preferences
[write up]

Preferences:
+ prefers-contrast
+ prefers-reduced-motion
+ prefers-color-scheme
+ prefers-reduced-transparency
+ prefers-reduced-data
+ inverted-colors
+ forced-colors

#### System and device screen capabilities
[write up]

Capabilities:
+ Display-P3 support
+ Device pixel ratio

#### Font management
[write up]

## Dynamic asset management
[write up]

### Responsive images
[write up]

### Responsive video and video streams
[write up]

### Third-party canvas sources
[write up]

## Pointer (mouse and touch) interaction
[write up]

### SC event listener convenience functions
[write up]

#### The `addListener()` function
[write up]

#### The `addNativeListener()` function
[write up]

#### Cascading events
[write up]

#### Group hover event functionality
[write up]

### Drag-and-drop functionality
[write up]

## Non-pointer interaction
[write up]

### Scrawl-canvas Anchor and Button objects
[write up]

### Keyboard navigation
[write up]

### User interaction with form controls 
[write up]

### Keyboard shortcut management
[write up]

## The Scrawl-canvas signalling system
SC uses a system of `dirty` flags and `clean` functions, alongside `subscriber` Arrays and `updateSubscribers` functions, to manage communication across the SC objects estate. The system is diffuse rather than centralised, relying on objects to subscribe themselves to other objects to receive notifications (via `dirty` flags) of when the other object state changes.

> **tl;dr** Repo-devs need to be aware that the signalling system is the most brittle part of the code base. If issues arise, the problem may well be because of a failure to signal under a given circumstance, or a failure to clean in the correct order. In particular the order in which cleaning operations take place is important!

### Marking objects as `dirty`
The signalling system rests on the ability of objects to set dirty flags when something changes. This is the reason why SC is so aggressively opinionated about the need for all object updates to be routed through the `object.set()` and `object.setDelta()` functions.

The basal `set` and `setDelta` functions get defined in the [mixin/base.js](../source/mixin/base.html) file. This is also where the object prototype `getters`, `setters` and `deltaSetters` objects get created, alongside the `defs` object used to store an object's default attribute values. Each of these objects store data keyed to attribute Strings:

The example code demonstrates the basic `set` operation:
```
prototype.defs = {

  attributeOne: 0,
  attributeTwo: 0,
};

prototype.setters = {

  attributeTwo: function (item) {

    this.attributeTwo = item * 2;

    this.dirtyAttributeTwo = true;
    this.dirtyOtherThing = true;
  },
};

prototype.set = function (items = Ωempty) {

  let i, key, val, fn;

  const keys = _keys(items),
    keysLen = keys.length;

  if (keysLen) {

    const setters = this.setters,
      defs = this.defs;

    for (i = 0; i < keysLen; i++) {

      key = keys[i];
      val = items[key];

      // The object.name attribute can only be set during object construction
      if (key && key !== NAME && val != null) {

        // Accept the update if there is a dedicated setter function for the attribute
        fn = setters[key];

        if (fn) fn.call(this, val);

        // Accept the update if the attribute exists in the defs object
        else if (typeof defs[key] !== UNDEF) this[key] = val;
      }
    }
  }
  return this;
};

// Later, something updates the object using a set invocation
object.set({
  attributeOne: 10,
  attributeTwo: 10,
  attributeThree: 10,
});

// The results of the set invocation:
// - attributeOne is defined in the defs object, the update is accepted
// - attributeTwo has a setter function, the update is accepted and processed
//   - this includes setting some associated dirty flags
// - attributeThree is neither defined in the defs object, nor the setters object
//   - the update is ignored
```

Repo-devs have chosen to use this approach because:
+ It keeps the factory file code understandable:
  - Object attributes can be defined and explained in the `defs` object.
  - Attribute updates requiring `dirty` flags to be set can be managed more easily.
+ It prevents product-devs accidentally damaging object shapes, which can lead to code efficiency degredation.
+ It couples tightly with the object `packet` (serialization) system, and thus with the accompanying object `clone` system.
+ Mixin and factory files can easily add attributes to the `defs` object to meet their particular requirements.
+ Mixin and factory files can easily overwrite the `get`, `set` and `setDelta` functions, and individual `getter`, `setter` and `deltaSetter` attribute functions, to meet their particular requirements.

The downside to this approach is that the SC signals system has not been centralised. Instead it adapts to the individual requirements of each mixin and factory file code.

The code base currently (as of Nov 2025) includes a total of 75 `dirty` flag attributes, which may be defined in one file but actioned in various ways by downstream files: 
+ `dirtyAnchor`, `dirtyAria`, `dirtyAsset`, `dirtyAssetSubscribers`, `dirtyButton`, `dirtyCache`, `dirtyCells`, `dirtyClasses`, `dirtyContent`, `dirtyControl`, `dirtyControlLock`, `dirtyCopyDimensions`, `dirtyCopyStart`, `dirtyCss`, `dirtyData`, `dirtyDimensions`, `dirtyDimensionsOverride`, `dirtyDisplayArea`, `dirtyDisplayShape`, `dirtyDomDimensions`, `dirtyEnd`, `dirtyEndControl`, `dirtyEndControlLock`, `dirtyEndLock`, `dirtyFilterIdentifier`, `dirtyFilters`, `dirtyFiltersCache`, `dirtyFont`, `dirtyHandle`, `dirtyHeight`, `dirtyHost`, `dirtyImage`, `dirtyImageSubscribers`, `dirtyInput`, `dirtyLayout`, `dirtyLock`, `dirtyMimicDimensions`, `dirtyMimicHandle`, `dirtyMimicOffset`, `dirtyMimicRotation`, `dirtyMimicScale`, `dirtyNavigationTabOrder`, `dirtyNoise`, `dirtyOffset`, `dirtyOffsetZ`, `dirtyOutput`, `dirtyPalette`, `dirtyPaletteData`, `dirtyParticles`, `dirtyPaste`, `dirtyPathData`, `dirtyPathObject`, `dirtyPerspective`, `dirtyPins`, `dirtyPivotRotation`, `dirtyPosition`, `dirtyPositionSubscribers`, `dirtyRotation`, `dirtyScale`, `dirtyScene`, `dirtySpecies`, `dirtyStampHandlePositions`, `dirtyStampOrder`, `dirtyStampPositions`, `dirtyStart`, `dirtyStartControl`, `dirtyStartControlLock`, `dirtyStyle`, `dirtyTargetImage`, `dirtyText`, `dirtyTextLayout`, `dirtyTextTabOrder`, `dirtyTransform`, `dirtyTransformOrigin`, `dirtyVisibility`, `dirtyZIndex`.

Because of the need to set `dirty` flags to notify objects that they will need to do work to update their state, repo-devs should always use the `set` functions within the code base.
+ For instance Tween animation objects use `target.set()` to communicate time-based updates to target objects.
+ Similarly the observe-update object uses `target.set()` to inform an SC object of end-user interactions with DOM form elements.

> **tl;dr:** Product-devs should never update an SC object using `object.attribute = newValue` or `object['attribute'] = newValue` approaches. Such code will break SC functionality!
> 
> Instead all object updates should be performed using the `object.set({ key: value, ...})` or `object.setDelta({ key: value, ...})` functions.

### Cleaning `dirty` objects
[write up]


Files:
+ [core/events.js](../source/core/events.html)
+ [core/user-interaction.js](../source/core/user-interaction.html)
+ [factory/anchor.js](../source/factory/anchor.html)
+ [factory/button.js](../source/factory/button.html)
+ [factory/canvas.js](../source/factory/canvas.html)
+ [factory/cell.js](../source/factory/cell.html)
+ [factory/group.js](../source/factory/group.html)
+ [factory/render-animation.js](../source/factory/render-animation.html)
+ [mixin/anchor.js](../source/mixin/anchor.html)
+ [mixin/button.js](../source/mixin/button.html)
+ [mixin/cell-key-functions.js](../source/mixin/cell-key-functions.html)
+ [mixin/entity.js](../source/mixin/entity.html)
+ [untracked-factory/drag-zone.js](../source/untracked-factory/drag-zone.html)
+ [untracked-factory/keyboard-zone.js](../source/untracked-factory/keyboard-zone.html)
+ [untracked-factory/observe-update.js](../source/untracked-factory/observe-update.html)

