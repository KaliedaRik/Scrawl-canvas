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

+ `pivot`: use the referenced artefact's `currentStart` values to calculate the rotation-reflection point. Users can reference an artefact by setting the entity's `pivot` attribute to the artefact's name String, or the artefact itself.

+ `mimic`: use the referenced artefact's `currentStart` values to calculate the rotation-reflection point. Users can reference an artefact by setting the entity's `mimic` attribute to the artefact's name String, or the artefact itself, alongside setting its `useMimicStart` flag to `true`.

+ `path`: use a given position's coordinates along the referenced artefact's ***path*** to calculate the rotation-reflection point. Users can reference a [path-based entity](sc-path-based-entitys.md) by setting our entity's `path` attribute to the referenced entity's name String, or the referenced entity itself. The position along the path is a float Number between `0` and `1` set on our entity's `pathPosition` attribute; note that this position can be affected by the value of the `constantSpeedAlongPath` boolean attribute - see [demo Canvas-030](../demo/canvas-030.html) for an example of this in action.

+ `particle`: use the referenced particle's current position to calculate the rotation-reflection point.

+ `mouse`: use the mouse cursor's calculated position relative to the Cell to calculate the rotation-reflection point

Users are able to set an entity to reference multiple artefacts, one each for the `pivot`, `mimic`, `path` and `particle` attributes. These attributes can be updated at any time. It is the `lockTo` attribute which determines which reference will be used to position the entity.

#### Pivot specifics
+ If the referenced artefact is an ***Element***, the entity is able to pivot to either the Element's start value, or to the position of any of the Element's current corner positions, depending on the value set on the entity's `pivotCorner` attribute.

+ If the referenced artefact is a ***Polyline***, the entity is able to pivot to any of the Polyline's pins, set on the entity's `pivotPin` attribute.

+ If the referenced artefact is an ***EnhancedLabel***, the entity is able to pivot to the EnhancedLabel's template artefact's start value, or to the position of a given textUnit within the EnhancedLabel, depending on the value set on the entity's `pivotIndex` attribute.

+ If the entity's `addPivotRotation` boolean flag is set to `true`, the entity will add the referenced artifact's rotation value to its own rotation value.

+ If the entity's `addPivotOffset` boolean flag is set to `true`, the entity will add the referenced artifact's `currentOffset` value to its own offset value.

+ If the entity's `addPivotHandle` boolean flag is set to `true`, the entity will add the referenced artifact's `currentHandle` value to its own handle value.

#### Mimic specifics
Mimic functionality allows an entity to mimic a range of the referenced artefacts attributes, as follows:

+ `start` - setting `useMimicStart` to `true` makes the entity use the referenced artefact's start attribute; setting `addOwnStartToMimic` will add together both the entity's and the referenced artefact's start values to generate the final result.

+ `offset` - setting `useMimicOffset` to `true` makes the entity use the referenced artefact's offset attribute; setting `addOwnOffsetToMimic` will add together both the entity's and the referenced artefact's offset values to generate the final result.

+ `handle` - setting `useMimicHandle` to `true` makes the entity use the referenced artefact's handle attribute; setting `addOwnHandleToMimic` will add together both the entity's and the referenced artefact's handle values to generate the final result.

+ `roll` - setting `useMimicRotation` to `true` makes the entity use the referenced artefact's roll attribute; setting `addOwnRotationToMimic` will add together both the entity's and the referenced artefact's roll values to generate the final result.

+ `dimensions` - setting `useMimicDimensions` to `true` makes the entity use the referenced artefact's dimensions attribute; setting `addOwnDimensionsToMimic` will add together both the entity's and the referenced artefact's dimensions values to generate the final result.

+ `scale` - setting `useMimicScale` to `true` makes the entity use the referenced artefact's scale attribute; setting `addOwnScaleToMimic` will add together both the entity's and the referenced artefact's scale values to generate the final result.

+ `flipReverse` and `flipUpend` - setting `useMimicFlip` to `true` makes the entity use the referenced artefact's flipReverse and flipUpend boolean flags as part of its calculations.

#### Path specifics
+ If the entity's `addPathRotation` boolean flag is set to `true`, the entity will add the referenced artifact's rotation value to its own rotation value.

+ If the entity's `addPathOffset` boolean flag is set to `true`, the entity will add the referenced artifact's `currentOffset` value to its own offset value.

+ If the entity's `addPathHandle` boolean flag is set to `true`, the entity will add the referenced artifact's `currentHandle` value to its own handle value.

### The SC signals system
(TODO - think of a good way to explain this)

### Calculation order
When the user adds `pivot`, `mimic`, and `path` references into their SC code, they also introduce artefact dependencies: if an artefact depends on another artefact to calculate some part of its own display (position, rotation, dimensions, scale), then the need arises for the referenced artefacts to complete their calculations for those attributes before the dependant artefact begins its own calculations.

> tl;dr; - SC includes no functionality to internally construct and maintain a dependency graph describing which artefacts need to calculate values before dependent artefact can calculate theirs. It is up to the user to tell SC the order in which artefacts should calculate/update their state.

The SC Display cycle comprises the following steps:
1. Clear
2. Compile
   - Calculate
   - Stamp
3. Show

A number of attributes are used across the code base to describer ordering; it's important not to confuse them:

+ SC ***Cell*** artefacts use their `compileOrder` and `showOrder` attributes to determine in which order they will perform the Display cycle compile and show steps.

+ SC ***Group*** objects have an `order` attribute which comes into play when two or more Groups contribute entitys to a Cell's display.

+ SC ***Artefacts*** have `calculateOrder` and `stampOrder` attributes (which can both be set to the same value using the `order` pseudo-attribute).

To understand ordering, consider the following code:

```
const canvas = scrawl.findCanvas('my-canvas');

canvas.addCell({
    name: 'my-extra-cell',
});

scrawl.makeGroup({
    name: 'my-additional-group',
    host: 'my-extra-cell',
});

canvas.addCell({
    name: 'my-hidden-cell',
    shown: false,
});

scrawl.makeBlock({
    name: 'yellow-block',
    group: 'my-hidden-group',
});

scrawl.makeBlock({
    name: 'black-block',
    pivot: 'white-block',
    lockTo: 'pivot'
});

scrawl.makeBlock({
    name: 'white-block',
});

scrawl.makeBlock({
    name: 'blue-block',
    group: 'my-additional-group',
});

scrawl.makeBlock({
    name: 'red-block',
    group: 'my-extra-cell',
    pivot: 'blue-block',
    lockTo: 'pivot',
});

scrawl.makeBlock({
    name: 'green-block',
    group: 'my-extra-cell',
    fillStyle: 'my-hidden-cell',
});
```

The SC Display cycle will process the above code in the following order:

```
Canvas {name: 'my-canvas'}

    Cell {name: 'my-extra-cell', compileOrder: 0, shown: true}

        Group {name: 'my-extra-cell', order: 0}
            Block {name: 'red-block', lockTo: 'pivot', pivot: 'blue-block', calculateOrder: 0}
            Block {name: 'green-block', lockTo: 'start', fillStyle: 'my-hidden-cell', calculateOrder: 0}

        Group {name: 'my-additional-group', order: 0}
            Block {name: 'blue-block', lockTo: 'start', calculateOrder: 0}

    Cell {name: 'my-hidden-cell', compileOrder: 0, shown: false}

        Group {name: 'my-hidden-cell', order: 0}
            Block {name: 'yellow-block', lockTo: 'start', calculateOrder: 0}

    Cell {name: 'my-canvas_base', compileOrder: 9999}

        Group {name: 'my-canvas_base'}
            Block {name: 'black-block', lockTo: 'pivot', pivot: 'white-block', calculateOrder: 0}
            Block {name: 'white-block', lockTo: 'start', calculateOrder: 0}
```

Which will lead to an incorrect canvas output:

**my-extra-cell**

1. `red-block` - has a ***pivot*** dependency on `blue-block`
2. `green-block` - has a ***stamp*** dependency on `my-hidden-cell`
3. `blue-block` - has no dependencies

**my-hidden-cell**

4. `yellow-block` - has no dependencies

**my-canvas_base**

5. `black-block` - has a ***pivot*** dependency on `white-block`
6. `white-block` - has no dependencies

To fix this, the user needs to give SC details about ordering, like this:

```
const canvas = scrawl.findCanvas('my-canvas');

// 'my-extra-cell' Cell needs to compile after 'my-hidden-cell'
canvas.addCell({
    name: 'my-extra-cell',
    compileOrder: 1,
});

// 'my-extra-cell' Group needs to compile after 'my-additional-group'
scrawl.findGroup('my-extra-cell').set({ order: 1 });

scrawl.makeGroup({
    name: 'my-additional-group',
    host: my-extra-cell,
});

// 'my-hidden-cell' Cell needs to compile before 'my-extra-cell'
canvas.addCell({
    name: 'my-hidden-cell',
    shown: false,
    compileOrder: 0,
});

scrawl.makeBlock({
    name: 'yellow-block',
    group: 'my-hidden-group',
});

// This block needs to calculate after its pivot
scrawl.makeBlock({
    name: 'black-block',
    pivot: 'white-block',
    lockTo: 'pivot',
    calculateOrder: 1,
});

scrawl.makeBlock({
    name: 'white-block',
});

scrawl.makeBlock({
    name: 'blue-block',
    group: 'my-additional-group',
});

scrawl.makeBlock({
    name: 'red-block',
    group: 'my-extra-cell',
    pivot: 'blue-block',
    lockTo: 'pivot',
});

scrawl.makeBlock({
    name: 'green-block',
    group: 'my-extra-cell',
    fillStyle: 'my-hidden-cell',
});
```

Now the SC Display cycle processes the code like this:
```
Canvas {name: 'my-canvas'}

    Cell {name: 'my-hidden-cell', compileOrder: 0, shown: false}

        Group {name: 'my-hidden-cell', order: 0}
            Block {name: 'yellow-block', lockTo: 'start', calculateOrder: 0}

    Cell {name: 'my-extra-cell', compileOrder: 1, shown: true}

        Group {name: 'my-additional-group', order: 0}
            Block {name: 'blue-block', lockTo: 'start', calculateOrder: 0}

        Group {name: 'my-extra-cell', order: 1}
            Block {name: 'red-block', lockTo: 'pivot', pivot: 'blue-block', calculateOrder: 0}
            Block {name: 'green-block', lockTo: 'start', fillStyle: 'my-hidden-cell', calculateOrder: 0}

    Cell {name: 'my-canvas_base', compileOrder: 9999}

        Group {name: 'my-canvas_base'}
            Block {name: 'white-block', lockTo: 'start', calculateOrder: 0}
            Block {name: 'black-block', lockTo: 'pivot', pivot: 'white-block', calculateOrder: 1}
```

Which will lead to the expected outcome:

**my-hidden-cell**

1. `yellow-block` - has no dependencies

**my-extra-cell**

2. `blue-block` - has no dependencies
3. `red-block` - has a ***pivot*** dependency on `blue-block`
4. `green-block` - has a ***stamp*** dependency on `my-hidden-cell`

**my-canvas_base**

5. `white-block` - has no dependencies
6. `black-block` - has a ***pivot*** dependency on `white-block`











