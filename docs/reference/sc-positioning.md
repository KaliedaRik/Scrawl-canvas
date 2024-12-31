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

### The rotation-reflection point
When we position an entity, we are in fact positioning that entity's ***rotation-reflection*** point, around which the entity will stamp itself onto the Cell.

By default, the rotation-reflection point is located at the top-left corner of the entity, and represents the `[0, 0]` coordinate of that entity's local coordinate system.

We position this rotation-reflection point in the Cell's host coordinate system, which starts at the Cell's top left corner and extends the width (x axis) and height (y axis) of its drawing space. 

SC allows us to position an entity's rotation-reflection point in several different ways:

+ ***Absolute positioning*** using pixel coordinates (`[x, y]`) relative to the Cell's top-left corner - for example `[50, 50]` represents a position 50px from the Cell's left border and 50px from the top border.

+ ***Relative positioning*** using percentage ratio coordinates (`['x%', 'y%']`) relative to the Cell's current width and height dimensions - for example `['50%', '50%']` represents a position at the centre of the Cell.

+ ***Positioning by reference*** where an entity can use the current position of another entity to calculate its own position on the Cell.

## Absolute and relative positioning
The most direct way to position an entity is to give it `start`, `offset` and `handle` values, from which it will calculate its position on the Cell. Each of these attributes are Coordinates with a default value of `[0,0]`. Each atteribute also comes with a set of pseudo-attributes which allow the user to set and get the x and y components of the Coordinate separately.

### The `start` entity attribute
We **set** an entity's rotation-reflection point using its `start` attribute. For convenience, we can also set each part of the point's coordinate using the `startX` and `startY` pseudo-attributes.

We can mix-and-match absolute and relative values in a coordinate: `[200, '40%']` is a legitimate coordinate, as is `['40%', 200]`.

Setting an entity's `start` attribute will also set the entity's `dirtyStart` boolean flag to `true`. At the start of the next [Display cycle](https://sc-display-cycle.md) the SC system performs a check across all entitys and, for those marked dirty, will perform calculations to ***clean*** their `start` attribute, placing the result (measured in cell coordinate space pixels) into the private `currentStart` attribute.

When we **get** an entity's `start` coordinate, the `currentStart` attribute will be returned. Note that any attempt to ***set*** the `currentStart` will have unexpected effects on the entity.

Directly setting an entity's `start` or (worse!) `currentStart` value will lead to unexpected behaviours and bugs. Always use the `entity.set({ start: [x, y]})` or `entity.deltaSet({ start: [x, y]})` functionality!

### The `offset` and `position` entity attributes
An entity's `start` (and `currentStart`) value does not fully represent its rotation-reflection point. We are able to ***offset*** the rotation-reflection point from the start coordinate using the entity's `offset` attribute. See [Demo Canvas-002](../demo/canvas-002.html) for an example of this functionality.

These `offset` values, like `start` values, can be ***absolute*** (measured in pixels) or ***relative*** (as a percentage of the host Cell's current dimensions). When we **set** the entity's `offset` (`offsetX`, `offsetY`) value, we also set its `dirtyOffset` boolean flag to `true`. Similar to the `start` attribute, entitys will clean their dirty offsets and store the result in the private `currentOffset` attribute.

When we **get** an entity's `offset` coordinate, the `currentOffset` value will be returned. Note that any attempt to ***set*** the `currentOffset` will have unexpected effects on the entity.

We can **get** an entity's current rotation-reflection coordinate at any time using the `position` pseudo-attribute; the `positionX` and `positionY` pseudo-attributes are also supported. Note that any attempt to ***set*** these pseudo-attributes will have no effect on the entity.

```
{0,0} host coordinate system
    .---------|---------|---------|---------|---------.
    |                                                 |
    |    start        offset        handle            | @: start coordinate
    |    [10,5]       [5,2]         [0,0]             |
    |                                                 | o: rotation-reflection point
    |         @                                       | = currentStart + currentOffset
    |                                                 | = [10,5]       + [5,2]
    |              o---------+                        | = [15,7]
    |              |         | entity width: 10       |
    |              |         | entity height: 5       |
    -              |         | roll: 0                -
    |              |         | scale: 1               |
    |              +---------+                        |
    |                                                 | *: path-start-coordinate
    |    currentStart currentOffset currentHandle     | = rot-ref-point - (currentHandle * scale)
    |    [10,5]       [5,2]         [0,0]             | = [15,7]        - [0*1,0*1]
    |                                                 | = [15,7]        - [0,0]
    |                                                 | = [15,7]
    |                                                 |
    |                                                 |
    .---------|---------|---------|---------|---------.
                                                      {50,20}


{0,0} host coordinate system
    .---------|---------|---------|---------|---------.
    |                                                 |
    |    start         offset        handle           | @: start coordinate
    |    ['20%','50%'] ['10%','10%'] [0,0]            |
    |                                                 | o: rotation-reflection point
    |         @                                       | = currentStart + currentOffset
    |                                                 | = [10,5]       + [5,2]
    |              o---------+                        | = [15,7]
    |              |         | entity width: 10       |
    |              |         | entity height: 5       |
    -              |         | roll: 0                -
    |              |         | scale: 1               |
    |              +---------+                        |
    |                                                 | *: path-start-coordinate
    |    currentStart  currentOffset currentHandle    | = rot-ref-point - (currentHandle * scale)
    |    [10,5]        [5,2]         [0,0]            | = [15,7]        - [0*1,0*1]
    |                                                 | = [15,7]        - [0,0]
    |                                                 | = [15,7]
    |                                                 |
    |                                                 |
    .---------|---------|---------|---------|---------.
                                                      {50,20}

```

### The `handle` entity attribute.
In brief, SC ***paints*** an entity onto the canvas using the following protocol:
1. If necessary, clean the entity's dirty attributes and recalculate its rotation-reflection point.
2. If necessary, recalculate the entity's ***path2D object***, which will be used during the painting step to `fill` and/or `stroke` the entity onto the Cell.
3. Position and rotate the host Cell's context engine using the Canvas API `setTransform()` function - it is at this moment that we move the Cell's engine's coordinate system origin point - `[0,0]` - to match the entity's rotation-reflection point.
4. Update the Cell's engine state to match the entity's engine state.
5. Stamp the entity onto the Cell's DOM &lt;canvas> element.

The `start` and `offset` attributes discussed above both feed into the first step of the protocol.

Every entity has a [path2D object](https://developer.mozilla.org/en-US/docs/Web/API/Path2D), which SC uses for stroke/fill painting operations as well as the entity's ***hit*** functionality (for example: hover, and drag-and-drop, operations).

When building the entity's path2D object, SC takes into account the entity's ***dimensions*** and ***scale***. It also includes a (scaled) ***local displacement*** value which has the apparent effect of moving the rotation-reflection point away from the entity's top-left corner. Users can set this displacement value in the entity's `handle` attribute.

Similar to the `start` and `offset` values, `handle` values can be ***absolute*** (measured in pixels) or ***relative*** (as a percentage of the entity's current scaled dimensions). When we **set** the entity's `handle` (`handleX`, `handleY`) value, we also set its `dirtyHandle` boolean flag to `true`. After cleaning, the handle's calculated values get stored in the private `currentHandle` attribute.

When we **get** an entity's `handle` coordinate, the `currentHandle` value will be returned. Note that any attempt to ***set*** the `currentHandle` will have unexpected effects on the entity.

```
{0,0} host coordinate system
    .---------|---------|---------|---------|---------.
    |                                                 |
    |    start        offset        handle            | @: start coordinate
    |    [10,5]       [5,2]         [-4,1]            |
    |                                                 | o: rotation-reflection point
    |         @                                       | = currentStart + currentOffset
    |                  *---------+                    | = [10,5]       + [5,2]
    |              o   |         | entity width: 10   | = [15,7]
    |                  |         | entity height: 5   |
    -                  |         | roll: 0            |
    |                  |         | scale: 1           -
    |                  +---------+                    |
    |                                                 |
    |                                                 | *: path-start-coordinate
    |    currentStart currentOffset currentHandle     | = rot-ref-point - (currentHandle * scale)
    |    [10,5]       [5,2]         [-4,1]            | = [15,7]        - [-4*1,1*1]
    |                                                 | = [15,7]        - [-4,1]
    |                                                 | = [19,6]
    |                                                 |
    |                                                 |
    .---------|---------|---------|---------|---------.
                                                      {50,20}


{0,0} host coordinate system
    .---------|---------|---------|---------|---------.
    |                                                 |
    |    start        offset         handle           | @: start coordinate
    |    ['20%','50%'] ['10%','10%'] ['-40%','20%']   |
    |                                                 | o: rotation-reflection point
    |         @                                       | = currentStart + currentOffset
    |                  *---------+                    | = [10,5]       + [5,2]
    |              o   |         | entity width: 10   | = [15,7]
    |                  |         | entity height: 5   |
    -                  |         | roll: 0            |
    |                  |         | scale: 1           -
    |                  +---------+                    |
    |                                                 |
    |                                                 | *: path-start-coordinate
    |    currentStart currentOffset currentHandle     | = rot-ref-point - (currentHandle * scale)
    |    [10,5]       [5,2]         [-4,1]            | = [15,7]        - [-4*1,1*1]
    |                                                 | = [15,7]        - [-4,1]
    |                                                 | = [19,6]
    |                                                 |
    |                                                 |
    .---------|---------|---------|---------|---------.
                                                      {50,20}


```

## Positioning by reference
A foundational tenet of the SC positioning system is that any artefact (and thus entity) can position itself on the Cell by referencing any other artefact. 

In essence, this means that instead of using its own `currentStart` values when calculating the value of its rotation-reflection point, our entity will instead use the referenced artefact's `currentStart` values. SC manages this through a system of locks, alongside a (bespoke, and rudimentary) signals system.

### The `lockTo` entity attribute
The `lockTo` attribute is an Array containing two String values. Each value indicates how the entity wants to calculate its position along the Cell's `x` and `y` axes - `['x-axis-string', 'y-axis-string']`. The default value is `['start', 'start']`, indicating that the entity wishes both parts of its start coordinate to use absolute or relative positioning as described above.

Like the other coordinate-like attributes, `lockTo` comes with a set of pseudo-attributes - `lockXTo`, `lockYTo` - which users can use to set the individual elements of the attribute.

The following String values can be used in the `lockTo` attribute's Array:
+ `start` - (default): use absolute or relative positioning
+ `pivot`: use the referenced artefact's `currentStart` values to calculate the rotation-reflection point
+ `mimic`: use the referenced artefact's `currentStart` values to calculate the rotation-reflection point
+ `path`: use a given position's coordinates along the referenced artefact's ***path*** to calculate the rotation-reflection point
+ `particle`: use the referenced particle's current position to calculate the rotation-reflection point
+ `mouse`: use the mouse cursor's calculated position relative to the Cell to calculate the rotation-reflection point





