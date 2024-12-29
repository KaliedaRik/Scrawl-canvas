# The Scrawl-canvas positioning system
The key purpose of SC is to position graphical entitys onto a canvas element, in a given order, so that those entitys build some form of graphical representation, chart, imagery, infographic, artwork (etc) that can be displayed as part of a web page.

## Background
As background knowledge, we need to understand that a DOM &lt;canvas> element, and SC's representation of that element (as `Canvas` and `Cell` wrapper artefacts) are very different things.

+ **DOM &lt;canvas> elements** are part of the HTML5 specification. The element includes attributes - `height=`, `width=` - used to define a ***coordinate space*** (measured in CSS pixels) within which drawing operations can take place. The visual representation of the canvas element in the web page can be styled using CSS; note that when the element's CSS styling dimensions diverge from its coordinate space dimensions, browsers will scale the coordinate space (ignoring aspect ratio) to fit into the styled dimensions. Drawing operations are, for 2D graphics, defined by the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API); these operations are managed by a [context interface](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D). 

+ **SC Canvas artefacts** wrap DOM &lt;canvas> elements and bring them into the SC ecosystem. They include handles to the DOM element itself and its context interface, though users should generally avoid directly interacting with them. Instead, graphical operations are handled by Cell artefacts, of which each Canvas wrapper will have at least one - the ***base Cell***. Users can control how the base cell will display in the DOM &lt;canvas> element, allowing us to build real-time responsive graphical displays.

+ **SC Cell artefacts** wrap regular (auto-generated) &lt;canvas> elements that are **not** added to the web page's DOM. Every Canvas wrapper includes, at a minimum, a ***base Cell***, and can include additional Cell artefacts as necessary. Note that these additional &lt;canvas> elements are nothing special: SC does not make use of the [OffscreenCanvas interface](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) or, indeed, Web Workers.

> **tl;dr: We only need to care about Cell artefact dimensions.** All SC graphical operations happen in Cell artefacts and end up in the Canvas artefact's base Cell. Every Cell we create will have its own dimensions - a ***cell coordinate space*** - which can diverge from the associated DOM &lt;canvas> element's dimensions. Canvas artefacts handle the transfer of graphical data from their base Cell to their DOM &lt;canvas> element automatically.

From this point on:
+ When we refer to `Cell` we (generally) mean an SC Canvas artefact's base Cell artefact.
+ A `host coordinate system` is the Cell artefact's coordinate space.
+ `Entitys` refer to graphical objects which can be stamped onto a Cell.
+ A `local coordinate system` is a coordinate system specific to a given entity.

Furthermore, **positioning** refers to the *location* of an entity on the Cell, alongside that entity's *dimensions*, *scale* (relative to its default dimensions) and *rotation* (relative to the Cell's coordinate space axes).

Also, while we concentrate on the positioning of graphical entitys in this document, SC extends the positioning system to include DOM elements within an SC "stack" element.

## The rotation-reflection point
When we position an entity, we are in fact positioning that entity's ***rotation-reflection*** point, around which the entity will stamp itself onto the Cell.

By default, the rotation-reflection point is located at the top-left corner of the entity, and represents the `[0, 0]` coordinate of that entity's local coordinate system.

We position this rotation-reflection point in the Cell's host coordinate system, which starts at the Cell's top left corner and extends the width (x axis) and height (y axis) of its drawing space. 

SC allows us to position an entity's rotation-reflection point in several different ways:

+ ***Absolute positioning*** using pixel coordinates (`[x, y]`) relative to the Cell's top-left corner - for example `[50, 50]` represents a position 50px from the Cell's left border and 50px from the top border.

+ ***Relative positioning*** using percentage ratio coordinates (`['x%', 'y%']`) relative to the Cell's current width and height dimensions - for example `['50%', '50%']` represents a position at the centre of the Cell.

+ ***Positioning by reference*** where an entity can use the current position of another entity to calculate its own position on the Cell.

### The `start` and `position` entity attribute
We **set** an entity's relative, or absolute, position using its `start` attribute. For convenience, we can also set each part of the coordinate using the `startX` and `startY` pseudo-attributes.

We can mix-and-match absolute and relative values in a coordinate: `[200, '40%']` is a legitimate coordinate, as is `['40%', 200]`.

Setting an entity's `start` attribute will also set the entity's `dirtyStart` boolean flag to true. At the start of the next [Display cycle](https://sc-display-cycle.md) the SC system performs a check across all entitys and, for those marked dirty, will perform calculations to ***clean*** their `start` attribute, placing the result (measured in cell coordinate space pixels) into the private `currentStart` attribute.

When we **get** an entity's `start` coordinate, the `currentStart` attribute will be returned. Note that any attempt to ***set*** `the currentStart` will have no effect on the entity.

Directly setting an entity's `start` or (worse!) `currentStart` attribute will lead to unexpected behaviours and bugs. Always use the `entity.set({ start: [x, y]})` or `entity.deltaSet({ start: [x, y]})` functionality!

### The `offset` and `position` entity attributes
An entity's `start` (and `currentStart`) value does not represent its rotation-reflection point. We are able to offset the rotation-reflection point from the start coordinate using the entity's `offset` attribute. See [Demo Canvas-002](../demo/canvas-002.html) for an example of this functionality.

We can **get** an entity's current cell coordinate space rotation-reflection coordinate at any time using the `position` pseudo-attribute; the `positionX` and `positionY` pseudo-attributes are also supported. Note that any attempt to ***set*** these pseudo-attributes will have no effect on the entity.








### The `handle` entity attribute.














