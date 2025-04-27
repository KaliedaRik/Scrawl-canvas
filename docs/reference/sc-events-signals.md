# Scrawl-canvas events and signals
SC does not include a bespoke implementation of an event-driven system. SC artefact, entity and animation objects do not generate any [custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) as part of their functionality.

Instead SC relies on the normal [event system](https://developer.mozilla.org/en-US/docs/Web/Events) provided by the browser to handle user interactions with an SC Canvas or Stack display:
+ SC uses a number of system-generated event listeners to handle changes in the browser environment, for instance:
  - A single event listener to track mouse movement across the viewport.
  - Similarly, event listeners to react to user-initiated page scrolling and browser window resize events.
  - [Intersection observers](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to report on `<canvas>` and stack DOM element positioning within the browser viewport.
  - Event listeners assigned to various [CSS matchMedia() queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) to monitor, in particular, user-set media preferences.
+ SC also supplies the dev-user with a set of convenience functions to capture various user interactions with a Canvas or Stack display, including:
  - Mouse, touch and pointer events.
  - Drag-and-drop functionality.
  - Keyboard navigation and trigger events.
  - Interactions with form element controls.
  - Responsive image management.
  - Media stream, and screen capture, events.

[add something about signals]

## System events
[write up]

### The core listeners tracker function
[write up]

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
[write up]

### Marking objects as `dirty`
[write up]

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

