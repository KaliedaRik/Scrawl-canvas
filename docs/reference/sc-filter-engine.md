# Scrawl-canvas filters
The purpose of a computer graphics filter is to take an input graphic, apply a set of manipulations to each pixel in the graphic, and output the modified result. For web pages, filter algorithms are generally applied to elements - including `<canvas>` elements - using the [CSS filter property](https://developer.mozilla.org/en-US/docs/Web/CSS/filter).

> **tl;dr:** Filter effects - however they are used in a web page - are often computationally expensive and risk slowing down page speed and responsiveness. Use filters wisely!

## CSS and SVG filters
CSS filters are a set of functions which the dev-user can use to quickly apply a range of effects - `blur()`, `saturate()`, `drop-shadow()`, etc - either to a DOM element or to the background behind that element. While these filters can be stacked (eg: sepia + blur), for more advanced effects CSS offers a `url()` filter, which allows the dev-user to apply an [SVG-defined filter effect](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter) to the element.

Note that SVG filters are complex and powerful. In addition to the MDN page linked above, the following resources may be of interest to the inquisitive:
+ (Webplatform, 2015) - [A summary of the various SVG filter primatives](https://webplatform.github.io/docs/svg/tutorials/smarter_svg_filters/)
+ (Codrops, 2019) - [A series of articles around SVG filters](https://tympanus.net/codrops/2019/01/15/svg-filters-101/)
+ (yoksel.github.io) - [An interactive SVG filters playground](https://yoksel.github.io/svg-filters/#/)

Browsers extend the use of these filters to Javascript-driven paint operations in the `<canvas>` element. The canvas context engine includes a [filter property](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) (note: the key is singular), which dev-users can use to apply CSS filters to specific fill and stroke invocations. SC implements this functionality via regular `set` function calls: `cell.set({filter: string})` for the entire Cell object's display, and `entity.set({filter: string})` for individual entity objects within the display. Test demo [Filters-501](../../demo/filters-501.html) shows this functionality in action.

## The SC filter factory
While browsers have (for the most part) supported general CSS filter functionality since 2013, extending that support to the canvas context engine `engine.filter` property has lagged and (as of March 2025, with respect to Safari browsers) remains incomplete.

Given how useful filter functionality can be for creating various `<canvas>`-based displays and products, repo-devs built a bespoke filter engine into SC. Much of the functionality for the filter engine is defined in the [helper/filter-engine.js](../source/helper/filter-engine.html) file. This filter engine - which is an entirely novel filter system, separate from CSS filters - acts as a singleton object, created during SC initialization, and handles all SC-specific filter effect processing across all `<canvas>` elements present on the web page.

> **tl;dr:** The SC filter engine has been inspired by (the better parts of) the [Filter Effects Module Level 1](https://drafts.fxtf.org/filter-effects/) specification (which itself is based on the [SVG 1.1 (Second Edition) Filter Effects](https://www.w3.org/TR/SVG11/filters.html) specification). *It is* ***NOT an emulation*** *of that specification*.

### The `scrawl.makeFilter()` factory function
SC filters have been built to operate seamlessly with the wider SC environment. Dev-users can create a Filter object using the `scrawl.makeFilter()` factory function. Once created, the filter can be applied multiple times to Cell, Group and entity objects by adding it to their `filters` (note: the key is plural!) Array:
+ Filter objects can be applied to entity, Group and Cell objects during their instantiation using the `filters: ['name-string', Filter-object, ...]` attribute. This attribute expects to receive an Array of Filter objects and/or those objects' `name` strings.
+ Following instantiation, any entity, Group or Cell object can have its `filters` Array updated using the `object.addFilters('name-string', Filter-object, ...)`, `object.removeFilters('name-string', Filter-object, ...)` and `object.clearFilters()` functions.

The code associated with assigning and managing Filter objects on Cell, Group and entity objects can be found in the [mixin/filter.js](../source/mixin/filter.html) file. The factory function code itself is defined in the [factory/filter.js](../source/factory/filter.html) file.

#### Create Filter objects
Dev users can instantiate a Filter object at any time using the `scrawl.makeFilter({key: value, ...})` factory function. The factory takes a single object for its argument, all of whose attributes are optional:
```
Attribute   Type             Default               Comments
----------  ---------------  --------------------  ---------------------------------------------------
name        String           computer-generated    Must be unique
actions     ActionObject[]   []                    Action objects define filter actions
method      String           ''                    Convenience alternative to generate ActionObjects
lineIn      String           ''                    ID string of chained filter input
lineMix     String           ''                    ID string of chained filter input
lineOut     String           ''                    ID string for this filter's output
opacity     Number           1                     Float number between 0 and 1
...                                                (Additional ActionObject-specific attributes)
```

The Filter objects generated by the `scrawl.makeFilter()` factory function are *tracked objects*, thus each object requires its own unique `name` attribute when being instantiated. Once created, they can be retrieved from the SC library using the `scrawl.findFilter('name-string')` function.

There are actually two ways to use the factory function, both of which are equally valid:
+ For the *modern* approach, dev-users can define an Array of **action objects** keyed to the `actions` attribute. These action objects outline a set of **filter primative functions**, alongside the values to be fed into those functions, which together create the desired filter effect.
+ The *legacy* approach uses the `method` attribute, alongside the required attributes for the method. SC will automatically create the appropriate action objects for the stipulated method as part of the Filter object's instantiation.

While the modern approach offers more versatility when it comes to chaining filter primitive functions together to create complex effects, the legacy approach is often more convenient for creating simpler effects. It is also easier to animate legacy filter attributes. Compare the different approaches to creating a simple pixellation filter:
```
Legacy approach                           Modern approach
--------------------------------------    -----------------------------------
const pixels = scrawl.makeFilter({        const pixels = scrawl.makeFilter({
  name: 'my-pixellated-filter',             name: 'my-pixellated-filter',
  method: 'pixelate',                       actions: [{
  tileWidth: 20,                              action: 'pixelate',
  tileHeight: 20,                             offsetX: 8,
  offsetX: 8,                                 offsetY: 8,
  offsetY: 8,                                 tileHeight: 20,
});                                           tileWidth: 20,
                                            }],
                                          });
```

More complex filters - such as this comic-effect filter, as seen in test demo [Filters-103](../../demo/filters-103.html) - are easier to build and edit using the modern approach:
```
const comicFilter = scrawl.makeFilter({
  name: 'my-comic-effect-filter',
  actions: [{
    action: 'gaussian-blur',
    radius: 1,
    lineOut: 'outline1',
  }, {
    action: 'matrix',
    lineIn: 'outline1',
    lineOut: 'outline2',
    width: 3,
    height: 3,
    offsetX: 1,
    offsetY: 1,
    weights: [0,1,0,1,-4,1,0,1,0],
  }, {
    action: 'threshold',
    lineIn: 'outline2',
    lineOut: 'outline3',
    level: 6,
    high: [0, 0, 0, 255],
    low: [0, 0, 0, 0],
    includeAlpha: true,
  }, {
    action: 'gaussian-blur',
    radius: 1,
    lineIn: 'outline3',
    lineOut: 'outline4',
  }, {
    action: 'step-channels',
    clamp: 'round',
    lineOut: 'color1',
    red: 16,
    green: 16,
    blue: 16,
  }, {
    action: 'gaussian-blur',
    radius: 4,
    lineIn: 'color1',
    lineOut: 'color2',
  }, {
    action: 'compose',
    compose: 'destination-over',
    lineIn: 'color2',
    lineMix: 'outline4',
  }],
});
```

#### Serialize, clone and kill Filter objects
Filter objects can be serialized using the `filter.saveAsPacket()` function. To deserialize a Filter packet string use either `object.importPacket('url-string' | ['url-string', ...])` or `object.actionPacket('packet-string')` functions where `object` is any existing SC *tracked object*.

To clone a Filter object, use the `filter.clone({key: value, ...})` function. Data included in the function's argument object will overwrite the existing Filter object's values.

The `filter.kill()` function will remove the Filter object entirely from the SC environment. This includes removing the filter from any Cell, Group or entity object that may be using it.

## Filter application
[todo]

### Stacking filters
CSS filters can be combined:
```
<div class="filtered-div">
  <p>This is a div element with a CSS filter effect applied to it</p>
</div>

<style>
  .filtered-div {
    filter: hue-rotate(90deg) drop-shadow(6px 6px 2px black);
  }
</style>
```

In the above example, the browser will first apply the `hue-rotate` filter to the `<div>` element, then pass the result of that pixel manipulation to the `drop-shadow` filter for further processing before delivering the final output to the browser's display.

The simplest way to think of this is as a form of layer stacking: the original input goes at the bottom of the stack then each filter is added, in turn, over the original input until all the filters have been applied. In effect the output from the previous filter becomes the input for the next filter. The end user only sees the final result of the entire operation.

The SC filter engine follows much the same process (unless directed otherwise). When an entity with an Array of Filter objects gets stamped on its host Cell, the filter engine will take all of those filters and apply their primative functions, in turn, to the entity display. Only once the last primative function completes does the filter engine return the results to the SC system for stamping onto the host Cell.

This means that the order in which Filter objects appear in the `entity.filters` Array becomes very important:

```
scrawl.makeFilter({
  name: 'my-gray-filter',
  method: 'gray',
}).clone({
  name: 'my-red-filter',
  method: 'red',
});

// This first image will have all of its blue/green channel colors set to 0
// before the cross-channel-averaging gray effect is applied 
// - it will display as (a dark) monochrome white
scrawl.makePicture({
  name: 'gray-image',
  asset: 'iris',
  dimensions: ['100%', '100%'],
  copyDimensions: ['100%', '100%'],
  filters: ['my-red-filter', 'my-gray-filter'],

// This cloned image has the filters defined in reverse order
// - it will display as monochrome red
}).clone({
  name: 'red-image',
  filters: ['my-gray-filter', 'my-red-filter'],
});
```

| input > red > gray > output | input > gray > red > output |
|---|---|
|![Red before grayscale](sc-filter-engine-asset-001.webp)|![Grayscale before red](sc-filter-engine-asset-002.webp)|

### Chaining filters
SVG filters include a way to define the inputs for an SVG filter primitive, and label the primitive's output so that it can be used as an input for a subsequent primitive operation. This method of **filter chaining** is what gives SVG filters their unique power to break away from the linear stacking approach to filter composition.

SC follows in SVG's footsteps. Every SC filter primative function includes `lineIn` and `lineOut` argument attributes to define the primitive's input data and output label; some functions also require a `lineMix` attribute 

[todo]

### Using objects as filter stencils
[todo]

### Memoizing a filtered object's output
[todo]

### One-time capture of a filtered object's output
[todo]

### Internal coding protocols
[todo]

#### Apply filters to Cell objects
[todo]

#### Apply filters to Group objects
[todo]

#### Apply filters to entity objects
SC filters are applied to the display output of entity objects at the point where they are stamped onto their host Cell. This is achieved using the following protocol:
1. Determine whether any filters need to be applied to the entity:
  - If no, use the entity's `regularStamp` functionality (not detailed below).
  - If yes, use the entity's `filteredStamp` functionality.
2. If the entity has not been stamped before, or its `entity.dirtyFilters` flag is `true`, process the filter objects into the internal `entity.currentFilters` Array so they are ready for application.
3. Request a `pool` Cell object, size it to match the host Cell's dimensions and `regularStamp` the entity onto it (ignoring the `entity.globalCompositeOperation` attribute).
  - If the `entity.isStencil` Boolean flag has been set to `true`, stamp the host Cell's current display over the entity (using `globalCompositeOperation: 'source-in'`).
4. Get the current image data from the `pool` Cell
5. Preprocess the filter objects - specifically to retrieve data for any external images used by the filters.
6. Invoke the filter engine's `filterEngine.action()` function, passing all the required data to it.
7. Reset the `pool` Cell and stamp the filter engine's returned `imageData` data into it.
8. If the `entity.stashOutput` Boolean flag has been set to `true`, stash the `pool` data, either in a DOM `<img>` element or as `imageData` assigned to the `entity.stashedImageData` attribute.
9. Stamp the `pool` Cell onto the host Cell (taking into account the `entity.globalCompositeOperation` attribute).
10. Release the `pool` Cell object.

All entity objects, apart from the EnhancedLabel entity, share the above functionality, whose code can be found in the [mixin/entity.js](../source/mixin/entity.html) file - specifically the `filteredStamp()` and `getCellCoverage()` functions.

#### Apply filters to EnhancedLabel entity objects
[todo]

## The SC filter engine
[todo]

### Resources used by the filter engine
[todo]

#### The seeded random numbers generator
[todo]

#### Noise generators
[todo]

#### Colors and gradients
[todo]

### Code efficiency
[todo]

#### External caching using the SC workstore
[todo]

#### Filter engine internal cache
[todo]

#### Color caches
[todo]

### Protocol for processing a filter request
[todo]


The code associated with assigning and managing Filter objects on Cell, Group and entity objects, and applying filter effects to them, is spread across the repo as follows:
+ [factory/cell.js](../source/factory/cell.html) - 
+ [factory/enhanced-label.js](../source/factory/enhanced-label.html) - 
+ [factory/group.js](../source/factory/group.html) - 

Two additional filter-related files also exist:
+ [factory/filter.js](../source/factory/filter.html) - 
+ [helper/filter-engine-bluenoise-data.js](../source/helper/filter-engine-bluenoise-data.html) - 

Filter primitives with no or one filter primitive input can be linked together to a **filter chain**.

## SC filter primitive functions
[todo]

### Alpha channel filters
[Needs a sentence]

#### Action: `area-alpha`
Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to the appropriate value specified in the `areaAlphaLevels` attribute. Can be used to create horizontal or vertical bars, or chequerboard effects:
+ Top left quadrant dimensions: `tileWidth`, `tileHeight`
+ Top right quadrant dimensions: `gutterWidth`, `tileHeight`
+ Bottom left quadrant dimensions: `tileWidth`, `gutterHeight`
+ Bottom right quadrant dimensions: `gutterWidth`, `gutterHeight`

The `offset` values represent an offset from the top-left corner of the display. Partial tiles will be displayed as appropriate along the top and left edges of the display.

Specify the new alpha channel values in the `areaAlphaLevels` attribute Array as follows:
+ [top-left quadrant, top-right quadrant, bottom-left quadrant, bottom-right quadrant]

Used by factory function method: `areaAlpha`.

See test demo [Filters-014](../../demo/filters-014.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  areaAlphaLevels: [255, 0, 0, 0],
  gutterHeight: 1,
  gutterWidth: 1,
  offsetX: 0,
  offsetY: 0,
  tileHeight: 1,
  tileWidth: 1,
}
```

#### Action: `channels-to-alpha`
Calculates an average value from each pixel's included channels and applies that value to the pixel's alpha channel.

Used by factory function method: `channelsToAlpha`.

No test demo available for this method.
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  includeBlue: true,
  includeGreen: true,
  includeRed: true,
}
```

#### Action: `chroma`
Produces a [chroma key compositing effect](https://en.wikipedia.org/wiki/Chroma_key) across the input.

Using an array of `range` arrays, determines whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. 

Each `range` array comprises six integer Numbers (between `0` and `255`) representing the following channel values: 
+ `[minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue]`

Used by factory function method: `chroma`.

See test demo [Filters-010](../../demo/filters-010.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  ranges: [],
}
```

#### Action: `colors-to-alpha`
Produces a [chroma key compositing effect](https://en.wikipedia.org/wiki/Chroma_key) across the input.

Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the `red`, `green` and `blue` arguments. These attributes' values should be integer Numbers (between `0` and `255`).

The sensitivity of the effect can be manipulated using the `transparentAt` and `opaqueAt` attribute values, both of which lie in the range `0-1`.

Used by factory function method: `chromakey`.

See test demo [Filters-011](../../demo/filters-011.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  blue: 0,
  green: 255,
  red: 0,

  transparentAt: 0,
  opaqueAt: 1,
}
```

### Color channel filters
[Needs a sentence]

#### Action: `alpha-to-channels`
Copies an input's alpha channel value over to each selected channel's value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. 

Setting the appropriate `includeChannel` flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate `excludeChannel` flag will set that channel's value to zero.

Used by factory function method: `alphaToChannels`.

No test demo available for this action.
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  excludeBlue: true,
  excludeGreen: true,
  excludeRed: true,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,
}
```

#### Action: `average-channels`
Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to `0`.

Used by factory function methods: `blue`, `cyan`, `emboss`, `gray`, `green`, `magenta`, `red`, `yellow`.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  excludeBlue: false,
  excludeGreen: false,
  excludeRed: false,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,
}
```

#### Action: `clamp-channels`
Clamp each color channel to a range determined by a set of `low` and `high` channel values. These attributes' values should be integer Numbers (between `0` and `255`). 

Used by factory function method: `clampChannels`.

See test demo [Filters-020](../../demo/filters-020.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  highBlue: 255,
  highGreen: 255,
  highRed: 255,

  lowBlue: 0,
  lowGreen: 0,
  lowRed: 0,
}
```

#### Action: `flood`
Creates a uniform sheet of the required color, which can then be used by other filter actions. 

The color are set through the `red`, `green`, `blue` and `alpha` attributes; these attribute values should be integer Numbers (between `0` and `255`). 

The flood can be restricted to only apply to non-transparent input pixels using the `excludeAlpha` flag.

Used by factory function method: `flood`.

See test demo [Filters-013](../../demo/filters-013.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  alpha: 255,
  blue: 0,
  green: 0,
  red: 0,

  excludeAlpha: false,
}
```

#### Action: `grayscale`
Averages the input's appropriately weighted color channel values for each pixel, to produce a more realistic black-and-white monochrome effect.

Used by factory function methods: `emboss`, `grayscale`.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,
}
```

#### Action: `invert-channels`
Inverts the color channel values in the input (`0 > 255`, `200 > 55`, etc), producing an effect similar to a photograph negative. 

Color channels can be excluded from the calculation using the `include` flags. Has no impact on the alpha channel.

Used by factory function method: `invert`.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  includeBlue: true,
  includeGreen: true,
  includeRed: true,
}
```

#### Action: `lock-channels-to-levels`
Produces a [posterization effect](https://en.wikipedia.org/wiki/Posterization) on the input. 

Takes in four arguments - `red`, `green`, `blue` and `alpha` - each of which is an Array of zero or more integer Numbers (between 0 and 255). 

The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value

Used by factory function method: `channelLevels`.

See test demo [Filters-006](../../demo/filters-006.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  alpha: [255],
  blue: [0],
  green: [0],
  red: [0],
}
```

#### Action: `map-to-gradient`
Applies a gradient to a grayscaled input. 

The type of grayscale can be set using the `useNaturalGrayscale` flag. The grayscale is applied as part of the primative function and does not need to be created in a prior chained ActionObject.

The `gradient` attribute can be a Gradient object, or that object's `name` attribute.

Used by factory function method: `mapToGradient`.

See test demo [Filters-022](../../demo/filters-022.html)
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  useNaturalGrayscale: false,
  gradient: default Gradient object,
}
```

#### Action: `modulate-channels`
Multiplies each channel's value by the supplied argument value. A channel-argument's value of `0` will set that channel's value to zero; a value of `1` will leave the channel value unchanged. 

If the `saturation` flag is set to `true` the calculation changes to start at that pixel's grayscale values.

Used by factory function methods: `brightness`, `channels`, `saturation`.

See test demos [Filters-003](../../demo/filters-003.html), [Filters-007](../../demo/filters-007.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  alpha: 1,
  blue: 1,
  green: 1,
  red: 1,

  saturation: false,
}
```

#### Action: `set-channel-to-level`
Sets the value of each pixel's included channel to the value supplied in the `level` attribute.

Used by factory function methods: `notRed`, `notGreen`, `notBlue`.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  includeAlpha: false,
  includeBlue: false,
  includeGreen: false,
  includeRed: false,

  level: 0,
}
```

#### Action: `step-channels`
Restricts the number of color values that each channel can set by imposing regular bands on each channel. This produces a [posterization effect](https://en.wikipedia.org/wiki/Posterization) on the input.

Takes three divisor values - `red`, `green`, `blue`. For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of `50` applied to a channel value of `120` will give a result of `100`.

The `clamp` attribute determines where in the band the color reference value should fall:
+ `down` (default) - uses `Math.floor()` for the calculation.
+ `up` - uses `Math.ceil()`.
+ `round` - uses `Math.round()`.

Used by factory function method: `channelstep`.

See test demo [Filters-005](../../demo/filters-005.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  blue: 1,
  green: 1,
  red: 1,

  clamp: 'down',
}

The clamp attribute permitted values are:
  'down',           'round',            'up'
```

#### Action: `threshold`
Creates a duotone effect across the input:
+ Grayscales the input.
+ For each pixel, checks the color channel values against a `level` argument: 
  - pixels with channel values above the level value are assigned to the `high` color;
  - otherwise they are updated to the `low` color.

The `high` and `low` attributes are both Arrays in the form:
+ `[redVal, greenVal, blueVal, alphaVal]` where values are positive integers in the range `0`-`255`.

If the `useMixedChannel` flag is set to `true`, processing occurs on a per-pixel level; otherwise processing happens on a per-channel basis. Individual channel levels can be set in the `red`, `green`, `blue` and `alpha` attributes. Channels can also be excluded from the calculation.

Used by factory function method: `threshold`.

See test demo [Filters-004](../../demo/filters-004.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  level: 128,

  alpha: 128,
  blue: 128,
  green: 128,
  red: 128,

  low: [0, 0, 0, 0],
  high: [255, 255, 255, 255],

  includeRed: true,
  includeGreen: true,
  includeBlue: true,
  includeAlpha: false,

  useMixedChannel: true,
}
```

#### Action: `tint-channels`
Transforms an input's pixel values based on an interplay between the values of each pixel's channel values:
```
Red channel     = (val * redInRed)   + (val * greenInRed)   + (val * blueInRed)
Green channel   = (val * redInGreen) + (val * greenInGreen) + (val * blueInGreen)
Blue channel    = (val * redInBlue)  + (val * greenInBlue)  + (val * blueInBlue)

Where: 
  val = the pixel channel's original value
  multipliers are float Number values between 0 and 1
```

Used by factory function methods: `sepia`, `tint`.

See test demo [Filters-008](../../demo/filters-008.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  blueInBlue: 1,
  blueInGreen: 0,
  blueInRed: 0,
  greenInBlue: 0,
  greenInGreen: 1,
  greenInRed: 0,
  redInBlue: 0,
  redInGreen: 0,
  redInRed: 1,
}
```

#### Action: `vary-channels-by-weights`
Applies an array of weights values to the input's pixel data. This represents a (vague) form of [tone mapping](https://en.wikipedia.org/wiki/Tone_mapping).

The `weights` Array needs to be exactly (256 * 4 = 1024) elements long. For each color level, we supply four weights: `redweight, greenweight, blueweight, allweight`
+ The default weighting for all elements is `0`. Weights are added to a pixel channel's value, thus weighting values need to be integer Numbers, either positive or negative
+ The `useMixedChannel` flag uses a different calculation, where a pixel's channel values are combined to give their grayscale value, then that weighting (stored as the `allweight` weighting value) is added to each channel value, pro-rata in line with the grayscale channel weightings. (Note: this produces a different result compared to tools supplied in various other graphic manipulation software).

Used by factory function method: `curveWeights`.

Dev-users are advised to find some way to generate the array data programmatically. See test demo [Filters-024](../../demo/filters-024.html) for inspiration.
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  weights: [],
  useMixedChannel: true,
}
```

### Composition filters
[Needs a sentence]

#### Action: `blend`
Uses two inputs - `lineIn`, `lineMix` - and combines their pixel data using various separable and non-separable blend modes, as defined in the [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#blending) specification.

Note that the inputs may be of different sizes: the output - `lineOut` - image size will be the same as the source (NOT `lineIn`) image. The `lineMix` input can be moved relative to the `lineIn` input using the `offsetX` and `offsetY` attributes.

Used by factory function method: `blend`.

See test demo [Filters-102](../../demo/filters-102.html).
```
Default object
{
  lineIn: '',
  lineMix: '',
  lineOut: '',
  opacity: 1,

  blend: 'normal',
  offsetX: 0,
  offsetY: 0,
}

The blend attribute permitted values are:
  'color'           'color-burn'        'color-dodge'       'darken'
  'difference'      'exclusion'         'hard-light'        'hue'
  'lighten'         'lighter'           'luminosity'        'multiply'
  'normal'          'overlay'           'saturation'        'screen'
  'soft-light'
```

#### Action: `compose`
Perform a Porter-Duff compositing operation on two inputs - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators) for details.

Note that the `lineMix` input - which MUST be specified - can be offset using the `offsetX` and `offsetY` attributes.

Used by factory function method: `compose`.

See test demo [Filters-101](../../demo/filters-101.html).
```
Default object
{
  lineIn: '',
  lineMix: '',
  lineOut: '',
  opacity: 1,

  compose: 'normal',
  offsetX: 0,
  offsetY: 0,
}

The compose attribute permitted values are:
  'destination-only'      'source-only'           'clear'
  'destination-over'      'source-over'           'xor'
  'destination-in'        'source-in'             'normal'
  'destination-out'       'source-out'
  'destination-atop'      'source-atop'
```

#### Action: `process-image`
Loads an image into the filter engine, where it can then be used by other filter actions. Useful for effects such as watermarking an image.

The portion of the image to be imported into the filter engine can be controlled using the `copy` attributes. These attributes can be set in either absolute pixel values, or relative (to the image) 'string%' values.

The `asset` attribute is required, and should be the name string of the asset. Any valid asset is permitted, including Cell objects. Where things go wrong, the system will attempt to load a `1x1` transparent pixel in place of the asset.

If the image's dimensions differ from the source dimensions then, where a given dimension is smaller than source, that dimension will be centered; where the image dimension is larger then that dimension will be pinned to the top, or left. Note that Filters will run faster when the asset's dimensions match the dimensions of the source to which the filter is being applied.

The `lineOut` attribute's value must be a (unique) string, which other primitive functions can use as their `lineIn` and `lineMix` values.

Assets are loaded into the filter engine each time the filter runs and are not persisted when the filter completes. Adding assets to a filter chain will very often disable filter memoization functionality!

Used by factory function method: `image`.

See test demos [Filters-101](../../demo/filters-101.html) and [Filters-102](../../demo/filters-102.html), which include image filters.
```
Default object
{
  lineOut: '',

  asset: '',

  copyHeight: 1,
  copyWidth: 1,
  copyX: 0,
  copyY: 0,

  height: 1,
  width: 1,
}
```

### Convolution filters
[Needs a sentence]

#### Action: `blur`
A bespoke [box blur](https://en.wikipedia.org/wiki/Box_blur) function. Creates visual artefacts with various settings that might be useful. 

By default the visible chanels are included in the calculation while the `alpha` channel is excluded. Transparent pixels (which tend to be transparent black) can also be excluded from the calculation.

The functionality defines separate `radius` (box width and height) values for the vertical and horizontal passes. The number of `passes` performed can also be increased.

The `step` values are used to determined which pixels within the box should be included in the calculation; a greater `step` value will lead to more (potentially useful) visual artefacts in the result.

Used by factory function method: `blur`.

See test demo [Filters-033](../../demo/filters-033.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  excludeTransparentPixels: false,
  includeAlpha: false,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,

  passesHorizontal: 1,
  processHorizontal: true,
  radiusHorizontal: 1,
  stepHorizontal: 1,

  passesVertical: 1,
  processVertical: true,
  radiusVertical: 1,
  stepVertical: 1,
}
```

#### Action: `corrode`
Performs a special form of matrix operation on each input pixel's color and alpha channels, calculating the new value using neighbouring pixel values. This is (roughly) equivalent to the SVG (`<feMorphology>`)[https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology] filter primative.

The matrix dimensions can be set using the `width` and `height` arguments, while setting the home pixel's position within the matrix can be set using the `offsetX` and `offsetY` arguments.

The operation will set the pixel's channel value to match either the lowest, highest, mean or median values as dictated by its neighbours - this value is set in the `operation` attribute.

Channels can be selected for inclusion in the calculation by setting the various `include` flags.

Used by factory function method: `corrode`.

See test demo [Filters-021](../../demo/filters-021.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  includeAlpha: true,
  includeBlue: false,
  includeGreen: false,
  includeRed: false,

  height: 3,
  offsetX: 1,
  offsetY: 1,
  width: 3,

  operation: 'mean',
}

The operation attribute permitted values are:
  'lowest'    'highest'   'mean'      'median'
```

#### Action: `emboss`
Performs a [directional difference filter](https://en.wikipedia.org/wiki/Image_embossing) across the input, using a `3x3` weighted matrix.

The `angle` (measured in degrees) and `strength` attributes contribute to the weights used in the matrix.

The function also handles some post-processing effects, controlled by the `postProcessResults` and `keepOnlyChangedAreas` flags, and the `tolerance` positive float Number attribute..

Used as the final step by factory function method: `emboss`.

See test demo [Filters-018](../../demo/filters-018.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  angle: 0,
  strength: 1,

  keepOnlyChangedAreas: false,
  postProcessResults: false,
  tolerance: 0,
}
```

#### Action: `gaussian-blur`
Generates a [gaussian blur](https://en.wikipedia.org/wiki/Gaussian_blur) effect from the input. 

Note that this code is not original. It has been adapted from this GitHub repository: https://github.com/nodeca/glur/blob/master/index.js (code last accessed 1 June 2021).

The horizontal and vertical parts of the blur can be separately set. Channels can also be excluded from the blur calculations, and the blur effect can be restricted to just the non-transparent parts of the input.

Used by factory function method: `gaussianBlur`.

See test demo [Filters-034](../../demo/filters-034.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  excludeTransparentPixels: false,
  includeAlpha: true,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,

  radiusHorizontal: 1,
  radiusVertical: 1,
}
```

#### Action: `matrix`
Applies a [convolution matrix](https://en.wikipedia.org/wiki/Kernel_(image_processing)) (also known as a kernel, or mask) operation to the input.

The matrix dimensions must be set using the `width` and `height` attributes, and the weights for the matrix supplied in the `weights` attribute's Array. The length of the `weights` array must equal `width x height`.

The matrix does not need to be centered. Use the `offset` attributes to define the position of the home pixel within the matrix grid.

Individual channels can be excluded from the calculation.

Used by factory function methods: `edgeDetect`, `matrix`, `matrix5`, `sharpen`.

See test demo [Filters-012](../../demo/filters-012.html)
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  height: 3,
  offsetY: 1,
  offsetX: 1,
  width: 3,

  weights: [],

  includeAlpha: false,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,
}
```

#### Action: `newsprint`
Attempts to simulate a black-white dither effect similar to newsprint across the input.

The `width` attribute defines the size of the blocks used in the filter.

Used by factory function method: `newsprint`.

See test demo [Filters-016](../../demo/filters-016.html)
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  width: 1,
}
```

#### Action: `pixelate`
Averages the colors within a set of rectangular blocks across the input to produce a series of obscuring tiles.

Individual channels can be included in the calculation by setting their respective `include` flags.

The effect can be offset using the `offset` attributes (measured in `px`).

Used by factory function method: `pixelate`.

See test demo [Filters-009](../../demo/filters-009.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  includeAlpha: false,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,

  offsetX: 0,
  offsetY: 0,
  tileHeight: 1,
  tileWidth: 1,
}
```

#### Action: `tiles`
Covers the input with tiles whose color matches the average channel values for the pixels included in each tile. Has a similarity to the `pixelate` filter, but uses a set of coordinate points to generate the tiles which results in a more Delauney-like output.

The filter has four modes, set on the `points` attribute:
+ `'rect-grid'` - generates a regular grid of tiles, where: `offsetX`, `offsetY` represent the origin coordinate from which the grid will be calculated; `tileWidth`, `tileHeight` supply the dimensions of the rectangular tiles; `angle` is the amount of tile rotation.
+ `'hex-grid'` - generates a hexagonal grid of tiles, where: `offsetX`, `offsetY` represent the origin coordinate from which the grid will be calculated; `tileRadius` supplies the radius for each hexagonal tile; `angle` is the amount of tile rotation.
+ Number - semi-randomly generates a set of points to the given value, constrained to an area determined by the `tileRadius`, `offsetX`, `offsetY` and `angle` arguments. Unlike other versions, this version will only include pixels within the bounds of circle of the given radius centered on the supplied offset coordinate values. To vary the randomness of point generation, the user can supply a `seed` argument, used when initializing the pseudo-random number generator.
+ Array eg: `[x1, y1, x2, y2, ...]` - actions the points as described in the array. Pixel selection for each point is constrained by the supplied `tileRadius`, `offsetX` and `offsetY` arguments.

Dev-users should be aware that initial calculation of the tile sets is very computationally intensive.

Channels can be included in the calculation by setting the appropriate `include` flags.

Used by factory function method: `tiles`.

See test demo [Filters-015](../../demo/filters-015.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  points: 'rect-grid',

  angle: 0,
  offsetX: 0,
  offsetY: 0,
  seed: DEFAULT_SEED,
  tileHeight: 1,
  tileRadius: 1,
  tileWidth: 1,

  includeAlpha: false,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,
}

The points attribute's permitted values are:
  'rect-grid'     'hex-grid'      Number          Number[]      
```

### Displacement filters
[Needs a sentence]

#### Action: `displace`
Moves pixels around the input image, based on the color channel values supplied by a displacement map image. This is the SC filter engine's attempt to reproduce the SVG [`<feDisplacementMap>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap) filter primative.

Note that the `lineMix` input - which MUST be specified - can be offset using the `offsetX` and `offsetY` attributes. Ideally, the mix image should be the same size as the input image, but it can be larger or smaller - hence the inclusion of these attributes. The displacement transform will only happen when both inputs have pixels at the appropriate coordinate

As for the SVG filter primative, translations in the `x` and `y` axes are tied to the pixel values in a given color channel. These pixel values can be scaled.

When a pixel moves it can leave a copy of itself behind in case another pixel doesn't replace itself. If this behaviour is not wanted it can be switched off using the `transparentEdges` flag.

Used by factory function method: `displace`.

See test demo [Filters-017](../../demo/filters-017.html).
```
Default object
{
  lineIn: '',
  lineMix: '',
  lineOut: '',
  opacity: 1,

  channelX: 'red',
  channelY: 'green',
  offsetX: 0,
  offsetY: 0,
  scaleX: 1,
  scaleY: 1,
  transparentEdges: false,
}

The channelX and channelY attribute permitted values are:
  'red'       'green'     'blue'      'alpha'
```

#### Action: `glitch`
Generates a semi-random shift across the input's horizontal rows.

The effect can be generated across channels, or applied to channels separately, through the `useMixedChannel` flag. 

The `level` value (a float Number between `0` and `1`) determines the likliness of a glitch occurring in a row, while the `step` value (a positive integer Number greater than 0) controls the number of rows to be included in each glitch.

The strength of the glitch is controlled by the various `offset` attributes.

Used by factory function method: `glitch`.

See test demo [Filters-025](../../demo/filters-025.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  level: 0,
  seed: DEFAULT_SEED,
  step: 1,
  transparentEdges: false,

  useMixedChannel: true,
  offsetMax: 0,
  offsetMin: 0,

  offsetAlphaMax: 0,
  offsetAlphaMin: 0,
  offsetBlueMax: 0,
  offsetBlueMin: 0,
  offsetGreenMax: 0,
  offsetGreenMin: 0,
  offsetRedMax: 0,
  offsetRedMin: 0,
}
```

#### Action: `offset`
Moves each channel input by an offset (measured in `px`) set for that channel.

Used by factory function methods: `offset`, `offsetChannels`.

See test demos [Filters-035](../../demo/filters-035.html), [Filters-036](../../demo/filters-036.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  offsetAlphaX: 0,
  offsetAlphaY: 0,
  offsetBlueX: 0,
  offsetBlueY: 0,
  offsetGreenX: 0,
  offsetGreenY: 0,
  offsetRedX: 0,
  offsetRedY: 0,
}
```

#### Action: `random-noise`
Creates a stippling effect across the image.

The spread of the effect can be controlled using the `width` and `height` attributes (which can be negative). Dev-users can manage the intensity of the effect using the `level` attribute, which ranges from `0` to `1`.

The effect can be wrapped by setting the `noWrap` Boolean flag. Channels can be excluded from the calculations using their respective `include` flags.

The effect supports 3 noise types:
+ `random` noise creates a general spread effect; the [pseudorandom generator's](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) `seed` can be set to any String value.
+ `ordered` and `bluenoise` noise can be used for more directional results.

Used by factory function method: `randomNoise`.

See test demo [Filters-023](../../demo/filters-023.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  includeAlpha: true,
  includeBlue: true,
  includeGreen: true,
  includeRed: true,

  height: 1,
  level: 0,
  width: 1,

  excludeTransparentPixels: true,
  noiseType: 'random',
  noWrap: false,
  seed: DEFAULT_SEED,
}

The noiseType permitted values are:
  'bluenoise'     'ordered'       'random'
```

#### Action: `swirl`
For each input pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate.

This filter can handle multiple swirls in a single pass. Each swirl is defined in an object with the following attributes:
+ The `start` and `radius` attributes can be defined in absolute `px` Number values, or relative `%` String values - relative to the input width.
+ The `angle` Number value is measured in degrees - a value of `720` will result in a swirl of 2 complete turns.
+ The `easing` value can be any valid easing string identifier (for example `'linear'`, `'easeOutIn'`, etc) or, alternatively, a dev-user defined easing function.

```
{
  startX: Number | String;
  startY: Number | String;
  innerRadius: Number | String;
  outerRadius: Number | String;
  angle: Number;
  easing: String | EasingFunctionObject;
}
```

Used by factory function method: `swirl`.

See test demo [Filters-026](../../demo/filters-026.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  swirls: [],
}
```

### OK filters
[Needs a sentence]

#### Action: `modify-ok-channels`
For each pixel in the input:
+ Convert to OKLAB
+ Add a value to each of the OKLAB channels
+ Convert back to RGB

Where: 
+ `L` (luminance) channel controls brightness, and will be a value between `0.0` (black) and `1.0` (white)
+ `A` (red-green) channel controls red-green hues - values range from `-0.4` (full green) to `+0.4` (full red)
+ `B` (yellow-blue) channel controls yellow-blue hues - values range from `-0.4` (full blue) to `+0.4` (full yellow)

Used by factory function method: `modifyOk`.

See test demo [Filters-031](../../demo/filters-031.html)
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  channelA: 0,
  channelB: 0,
  channelL: 0,
}
```

#### Action: `modulate-ok-channels`
For each pixel in the input:
+ Convert to OKLAB
+ Multiplies a value to each of the OKLAB channels
+ Convert back to RGB

Where: 
+ `L` (luminance) channel controls brightness, and will be a value between `0.0` (black) and `1.0` (white)
+ `A` (red-green) channel controls red-green hues - values range from `-0.4` (full green) to `+0.4` (full red)
+ `B` (yellow-blue) channel controls yellow-blue hues - values range from `-0.4` (full blue) to `+0.4` (full yellow)

Used by factory function method: `modulateOk`.

See test demo [Filters-032](../../demo/filters-032.html)
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  channelA: 1,
  channelB: 1,
  channelL: 1,
}
```

#### Action: `negative`
For each pixel in the input:
+ Convert to OKLCH
+ Rotate hue value `180deg`
+ Subtract luminance from 1
+ Convert back to RGB

Used by factory function method: `negative`.

See test demo [Filters-030](../../demo/filters-030.html)
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,
}
```

#### Action: `reduce-palette`
Analyses the input and, dependant on settings:
+ If necessary, calculate a "commonest colors" reduced palette based on the input colors, guided by the number of colors required and a [minimum color distance](https://en.wikipedia.org/wiki/Color_difference) between the selected colors.
+ Apply the palette to the input, using a given [dithering effect](https://en.wikipedia.org/wiki/Dither).

The `palette` attribute is multi-functional. It can accept:
+ A defined string to create various grayscale outputs: `'black-white', 'monochrome-4', 'monochrome-8', 'monochrome-16'`
+ An Array of predefined CSS Color strings which will form the reduced palette.
+ A Number, representing the number of "commonest color" colors to calculate for the reduced palette.

The effect can output different dithering results dependent on the selected `noiseType` value.

Used by factory function method: `reducePalette`.

See test demo [Filters-027](../../demo/filters-027.html).
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  minimumColorDistance: 1000,
  noiseType: 'random',
  palette: 'black-white',
  seed: DEFAULT_SEED,
}

The noiseType permitted values are:
  'bluenoise'     'ordered'       'random'
```

#### Action: `rotate-hue`
For each pixel in the input:
+ Convert to OKLCH
+ Rotate hue value by given angle (measured in degrees)
+ Convert back to RGB

Used by factory function method: `rotateHue`.

See test demo [Filters-029](../../demo/filters-029.html)
```
Default object
{
  lineIn: '',
  lineOut: '',
  opacity: 1,

  angle: 0,
}
```

## SC predefined filter effects
[todo intro]

### Method: `alphaToChannels`
**(Color channels filter)** Copies an input's alpha channel value over to each selected channel's value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. 

Setting the appropriate `includeChannel` flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate `excludeChannel` flag will set that channel's value to zero.

Creates an ActionObject for the `alpha-to-channels` primitive function.

No test demo available for this method.
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

excludeBlue                 yes         true
excludeGreen                yes         true
excludeRed                  yes         true
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true
```

### Method: `areaAlpha`
**(Alpha channel filter)** Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to the appropriate value specified in the `areaAlphaLevels` attribute. Can be used to create horizontal or vertical bars, or chequerboard effects:
+ Top left quadrant dimensions: `tileWidth`, `tileHeight`
+ Top right quadrant dimensions: `gutterWidth`, `tileHeight`
+ Bottom left quadrant dimensions: `tileWidth`, `gutterHeight`
+ Bottom right quadrant dimensions: `gutterWidth`, `gutterHeight`

The `offset` values represent an offset from the top-left corner of the display. Partial tiles will be displayed as appropriate along the top and left edges of the display.

Specify the new alpha channel values in the `areaAlphaLevels` attribute Array as follows:
+ [top-left quadrant, top-right quadrant, bottom-left quadrant, bottom-right quadrant]

Creates an ActionObject for the `area-alpha` primitive function.

See test demo [Filters-014](../../demo/filters-014.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

areaAlphaLevels             yes         [255, 0, 0, 0]
gutterHeight                yes         1
gutterWidth                 yes         1
offsetX                     yes         0
offsetY                     yes         0
tileHeight                  yes         1
tileWidth                   yes         1
```

### Method: `blend`
**(Composition filter)** Performs a blend operation on two inputs - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#blending) for more details.

Note that the `lineMix` input - which MUST be specified - can be offset using the `offsetX` and `offsetY` attributes.

Creates an ActionObject for the `blend` primitive function.

See test demo [Filters-102](../../demo/filters-102.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineMix                     yes         ''
lineOut                     yes         ''
opacity                     yes         1

blend                       yes         'normal'
offsetX                     yes         0
offsetY                     yes         0

The blend attribute permitted values are:
  'color'           'color-burn'        'color-dodge'       'darken'
  'difference'      'exclusion'         'hard-light'        'hue'
  'lighten'         'lighter'           'luminosity'        'multiply'
  'normal'          'overlay'           'saturation'        'screen'
  'soft-light'
```

### Method: `blue`
**(Color channels filter)** Sets the input's red and green channel values to zero.

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `blur`
**(Convolution filter)** A bespoke [box blur](https://en.wikipedia.org/wiki/Box_blur) function. Creates visual artefacts with various settings that might be useful. 

Dev-users are strongly advised to memoize the results from this filter as it is very resource-intensive. Use the gaussian blur filter for a smoother result.

By default the visible chanels are included in the calculation while the `alpha` channel is excluded. Transparent pixels (which tend to be transparent black) can also be excluded from the calculation.

The functionality defines separate `radius` (box width and height) values for the vertical and horizontal passes. The number of `passes` performed can also be increased.

The `step` values are used to determined which pixels within the box should be included in the calculation; a greater `step` value will lead to more (potentially useful) visual artefacts in the result.

Creates an ActionObject for the `blur` primitive function.

See test demo [Filters-033](../../demo/filters-033.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

excludeTransparentPixels    yes         false
includeAlpha                yes         false
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true
passes                      no          (pseudo-attribute)
passesHorizontal            yes         1
passesVertical              yes         1
processHorizontal           yes         true
processVertical             yes         true
radius                      no          (pseudo-attribute)
radiusHorizontal            yes         1
radiusVertical              yes         1
step                        no          (pseudo-attribute)
stepHorizontal              yes         1
stepVertical                yes         1
```

### Method: `brightness`
**(Color channels filter)** Adjusts the brightness of the input.

Creates an ActionObject for the `modulate-channels` primitive function.

See test demo [Filters-003](../../demo/filters-003.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

level                       yes         1
```

### Method: `channelLevels`
**(Color channels filter)** Produces a [posterization effect](https://en.wikipedia.org/wiki/Posterization) on the input. 

Takes in four arguments - `red`, `green`, `blue` and `alpha` - each of which is an Array of zero or more integer Numbers (between 0 and 255). 

The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value

Creates an ActionObject for the `lock-channels-to-levels` primitive function.

See test demo [Filters-006](../../demo/filters-006.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

alpha                       yes         [255]
blue                        yes         [0]
green                       yes         [0]
red                         yes         [0]
```

### Method: `channels`
**(Color channels filter)** Adjusts the value of each input channel by a specified multiplier.

Creates an ActionObject for the `modulate-channels` primitive function.

See test demo [Filters-007](../../demo/filters-007.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

alpha                       yes         1
blue                        yes         1
green                       yes         1
red                         yes         1
```

### Method: `channelstep`
**(Color channels filter)** Restricts the number of color values that each channel can set by imposing regular bands on each channel. This produces a [posterization effect](https://en.wikipedia.org/wiki/Posterization) on the input.

Takes three divisor values - `red`, `green`, `blue`. For each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor. For example a divisor value of `50` applied to a channel value of `120` will give a result of `100`.

The `clamp` attribute determines where in the band the color reference value should fall:
+ `down` (default) - uses `Math.floor()` for the calculation.
+ `up` - uses `Math.ceil()`.
+ `round` - uses `Math.round()`.

Creates an ActionObject for the `step-channels` primitive function.

See test demo [Filters-005](../../demo/filters-005.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

clamp                       yes         'down'

blue                        yes         1
green                       yes         1
red                         yes         1

The clamp attribute permitted values are:
  'down',           'round',            'up'
```

### Method: `channelsToAlpha`
**(Alpha channel filter)** Calculates an average value from each pixel's included channels and applies that value to the pixel's alpha channel.

Creates an ActionObject for the `channels-to-alpha` primitive function.

No test demo available for this method.
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true
```

### Method: `chroma`
**(Alpha channel filter)** Produces a [chroma key compositing effect](https://en.wikipedia.org/wiki/Chroma_key) across the input.

Using an array of `range` arrays, determines whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. 

Each `range` array comprises six integer Numbers (between `0` and `255`) representing the following channel values: 
+ `[minimum-red, minimum-green, minimum-blue, maximum-red, maximum-green, maximum-blue]`

Dev-users can also define `range` Arrays as 
+ `[minimum-CSS-color-string, maximum-CSS-color-string]`

Creates an ActionObject for the `chroma` primitive function.

See test demo [Filters-010](../../demo/filters-010.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

ranges                      yes         []
```

### Method: `chromakey`
**(Alpha channel filter)** Produces a [chroma key compositing effect](https://en.wikipedia.org/wiki/Chroma_key) across the input.

Determine the alpha channel value for each pixel depending on the closeness to that pixel's color channel values to a reference color supplied in the `red`, `green` and `blue` arguments. These attributes' values should be integer Numbers (between `0` and `255`).

Dev-users can also supply the reference color as a CSS-color-string, in a `reference` attribute.

The sensitivity of the effect can be manipulated using the `transparentAt` and `opaqueAt` attribute values, both of which lie in the range `0-1`.

Creates an ActionObject for the `colors-to-alpha` primitive function.

See test demo [Filters-011](../../demo/filters-011.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

reference                   no          (pseudo-attribute)
blue                        yes         0
green                       yes         255
red                         yes         0

transparentAt               yes         0
opaqueAt                    yes         1
```

### Method: `clampChannels`
**(Color channels filter)** Clamp each color channel to a range determined by a set of `low` and `high` channel values. These attributes' values should be integer Numbers (between `0` and `255`). 

Dev-users can also supply the reference colors as CSS-color-strings, in `lowColor` and `highColor` attributes.

Creates an ActionObject for the `clamp-channels` primitive function.

See test demo [Filters-020](../../demo/filters-020.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

highColor                   no          (pseudo-attribute)
highBlue                    yes         255
highGreen                   yes         255
highRed                     yes         255

lowColor                    no          (pseudo-attribute)
lowBlue                     yes         0
lowGreen                    yes         0
lowRed                      yes         0
```

### Method: `compose`
**(Composition filter)** Perform a Porter-Duff compositing operation on two inputs - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators) for details.

Note that the `lineMix` input - which MUST be specified - can be offset using the `offsetX` and `offsetY` attributes.

Creates an ActionObject for the `compose` primitive function.

See test demo [Filters-101](../../demo/filters-101.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineMix                     yes         ''
lineOut                     yes         ''
opacity                     yes         1

compose                     yes         'normal'
offsetX                     yes         0
offsetY                     yes         0

The compose attribute permitted values are:
  'destination-only'      'source-only'           'clear'
  'destination-over'      'source-over'           'xor'
  'destination-in'        'source-in'             'normal'
  'destination-out'       'source-out'
  'destination-atop'      'source-atop'
```

### Method: `corrode`
**(Convolution filter)** Performs a special form of matrix operation on each input pixel's color and alpha channels, calculating the new value using neighbouring pixel values. This is (roughly) equivalent to the SVG (`<feMorphology>`)[https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology] filter primative.

The matrix dimensions can be set using the `width` and `height` arguments, while setting the home pixel's position within the matrix can be set using the `offsetX` and `offsetY` arguments.

The operation will set the pixel's channel value to match either the lowest, highest, mean or median values as dictated by its neighbours - this value is set in the `operation` attribute.

Channels can be selected for inclusion in the calculation by setting the `includeRed`, `includeGreen`, `includeBlue` (all false by default) and `includeAlpha` (default: true) flags.

Dev-users should note that this filter is expensive, thus much slower to complete compared to other filter effects. Memoization is strongly advised!

Creates an ActionObject for the `corrode` primitive function.

See test demo [Filters-021](../../demo/filters-021.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

includeAlpha                yes         true
includeBlue                 yes         false
includeGreen                yes         false
includeRed                  yes         false

height                      yes         3
offsetX                     yes         1
offsetY                     yes         1
width                       yes         3

operation                   yes         'mean'

The operation attribute permitted values are:
  'lowest'    'highest'   'mean'      'median'
```

### Method: `curveWeights`
**(Color channels filter)** Applies an array of weights values to the input's pixel data. This represents a (vague) form of [tone mapping](https://en.wikipedia.org/wiki/Tone_mapping).

The `weights` Array needs to be exactly (256 * 4 = 1024) elements long. For each color level, we supply four weights: `redweight, greenweight, blueweight, allweight`
+ The default weighting for all elements is `0`. Weights are added to a pixel channel's value, thus weighting values need to be integer Numbers, either positive or negative
+ The `useMixedChannel` flag uses a different calculation, where a pixel's channel values are combined to give their grayscale value, then that weighting (stored as the `allweight` weighting value) is added to each channel value, pro-rata in line with the grayscale channel weightings. (Note: this produces a different result compared to tools supplied in various other graphic manipulation software).

Creates an ActionObject for the `vary-channels-by-weights` primitive function.

Dev-users are advised to find some way to generate the array data programmatically. See test demo [Filters-024](../../demo/filters-024.html) for inspiration.
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

weights                     yes         false (valid values must be Array.length 1024)
useMixedChannel             yes         true
```

### Method: `cyan`
**(Color channels filter)** Sets the input's red channel values to zero, and averages the remaining channel colors for each pixel

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `displace`
**(Displacement filter)** Moves pixels around the input image, based on the color channel values supplied by a displacement map image. This is the SC filter engine's attempt to reproduce the SVG [`<feDisplacementMap>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap) filter primative.

Note that the `lineMix` input - which MUST be specified - can be offset using the `offsetX` and `offsetY` attributes. Ideally, the mix image should be the same size as the input image, but it can be larger or smaller - hence the inclusion of these attributes. The displacement transform will only happen when both inputs have pixels at the appropriate coordinate

As for the SVG filter primative, translations in the `x` and `y` axes are tied to the pixel values in a given color channel. These pixel values can be scaled.

When a pixel moves it can leave a copy of itself behind in case another pixel doesn't replace itself. If this behaviour is not wanted it can be switched off using the `transparentEdges` flag.

Creates an ActionObject for the `displace` primitive function.

See test demo [Filters-017](../../demo/filters-017.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineMix                     yes         ''
lineOut                     yes         ''
opacity                     yes         1

channelX                    yes         'red'
channelY                    yes         'green'
offsetX                     yes         0
offsetY                     yes         0
scaleX                      yes         1
scaleY                      yes         1
transparentEdges            yes         false

The channelX and channelY attribute permitted values are:
  'red'       'green'     'blue'      'alpha'
```

### Method: `edgeDetect`
**(Convolution filter)** Applies a preset 3x3 edge-detect matrix to the input

Creates an ActionObject for the `matrix` primitive function.

See test demo [Filters-019](../../demo/filters-019.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `emboss`
**(Convolution filter)** Outputs an emboss effect across the input.

This method creates a chain of FilterAction objects, the composition of which can be controlled by a set of flags supplied by the dev-user:
+ `useNaturalGrayscale` Boolean - if `true` the filter will start with a `grayscale` pass; default is to use an `average-channels` pass.
+ `clamp` positive integer Number - clamps each color channel by the given value, using a `clampChannels` pass; pushes channel values towards a value of 127. Default is `0` (no pass).
+ `smoothing` positive float Number - adds a `gaussianBlur` pass with the attribute's value acting as the radius. Default is `0` (no pass).

The final FilterAction object added to the chain performs an `emboss` pass on what has gone before. This filter primative function, which calculates and applies a 3x3 convolution matrix to the image data, accepts a number of attributes:
+ `angle` float Number (measured in degrees) - contributes to the weights used in the matrix
+ `strength` float Number - contributes to the weights used in the matrix
+ `postProcessResults` Boolean - if set to `true`, extra work happens after the matrix pass completes to either smooth pixel channels towards `127`, taking into account a `tolerance` value, or alternatively make qualifying pixels transparent
+ `tolerance` positive float Number - only used during post-processing
+ `keepOnlyChangedAreas` Boolean - determines whether, during post-processing, pixels will be smoothed towards 127, or set to transparent.

Creates a chain of primitive function ActionObjects as follows:
+ `grayscale` \| `average-channels` > (`clamp`) > (`gaussianBlur`) > `emboss`

See test demo [Filters-018](../../demo/filters-018.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

useNaturalGrayscale         yes         false
clamp                       yes         0
smoothing                   yes         0

angle                       yes         0
strength                    yes         1    

postProcessResults          yes         false
tolerance                   yes         0
keepOnlyChangedAreas        yes         false
```

### Method: `flood`
**(Color channels filter)** Creates a uniform sheet of the required color, which can then be used by other filter actions. The color are set through the `red`, `green`, `blue` and `alpha` attributes; these attributes' values should be integer Numbers (between `0` and `255`). 

Dev-users can also supply a `reference` color as a CSS-color-string.

The flood can be restricted to only apply to non-transparent input pixels using the `excludeAlpha` flag.

Creates an ActionObject for the `flood` primitive function.

See test demo [Filters-013](../../demo/filters-013.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

reference                   no          (pseudo-attribute)
alpha                       yes         255
blue                        yes         0
green                       yes         0
red                         yes         0

excludeAlpha                yes         false
```

### Method: `gaussianBlur`
**(Convolution filter)** Generates a [gaussian blur](https://en.wikipedia.org/wiki/Gaussian_blur) effect from the input. 

The horizontal and vertical parts of the blur can be separately set. Channels can also be excluded from the blur calculations, and the blur effect can be restricted to just the non-transparent parts of the input.

Creates an ActionObject for the `gaussian-blur` primitive function.

See test demo [Filters-034](../../demo/filters-034.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

excludeTransparentPixels    yes         false
includeAlpha                yes         true
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true

radius                      no          (pseudo-attribute)
radiusHorizontal            yes         1
radiusVertical              yes         1
```

### Method: `glitch`
**(Displacement filter)** Generates a semi-random shift across the input's horizontal rows.

The effect can be generated across channels, or applied to channels separately, through the `useMixedChannel` flag. 

The `level` value (a float Number between `0` and `1`) determines the likliness of a glitch occurring in a row, while the `step` value (a positive integer Number greater than 0) controls the number of rows to be included in each glitch.

The strength of the glitch is controlled by the various `offset` attributes.

Creates an ActionObject for the `glitch` primitive function.

See test demo [Filters-025](../../demo/filters-025.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

level                       yes         0
seed                        yes         DEFAULT_SEED string
step                        yes         1
transparentEdges            yes         false

offsetAlphaMax              yes         0
offsetAlphaMin              yes         0
offsetBlueMax               yes         0
offsetBlueMin               yes         0
offsetGreenMax              yes         0
offsetGreenMin              yes         0
offsetMax                   yes         0
offsetMin                   yes         0
offsetRedMax                yes         0
offsetRedMin                yes         0

useMixedChannel             yes         true
```

### Method: `gray`
**(Color channels filter)** Averages the input's color channel values for each pixel.

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `grayscale`
**(Color channels filter)** Averages the input's appropriately weighted color channel values for each pixel, to produce a more realistic black-and-white monochrome effect.

Creates an ActionObject for the `grayscale` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `green`
**(Color channels filter)** Sets the input's red and blue channel values to zero.

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `image`
**(Composition filter)** Loads an image into the filter engine, where it can then be used by other filter actions. Useful for effects such as watermarking an image.

The portion of the image to be imported into the filter engine can be controlled using the `copy` attributes. These attributes can be set in either absolute pixel values, or relative (to the image) 'string%' values.

The `asset` attribute is required, and should be the name string of the asset. Any valid asset is permitted, including Cell objects. Where things go wrong, the system will attempt to load a `1x1` transparent pixel in place of the asset.

If the image's dimensions differ from the source dimensions then, where a given dimension is smaller than source, that dimension will be centered; where the image dimension is larger then that dimension will be pinned to the top, or left. Note that Filters will run faster when the asset's dimensions match the dimensions of the source to which the filter is being applied.

The `lineOut` attribute's value must be a (unique) string, which other primitive functions can use as their `lineIn` and `lineMix` values.

Assets are loaded into the filter engine each time the filter runs and are not persisted when the filter completes. Adding assets to a filter chain will very often disable filter memoization functionality!

Creates an ActionObject for the `process-image` primitive function.

See test demos [Filters-101](../../demo/filters-101.html) and [Filters-102](../../demo/filters-102.html), which include image filters.
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineOut                     yes         ''

asset                       yes         ''

copyHeight                  yes         1
copyWidth                   yes         1
copyX                       yes         0
copyY                       yes         0

height                      yes         1
width                       yes         1
```

### Method: `invert`
**(Color channels filter)** Inverts the color channel values in the input (`0 > 255`, `200 > 55`, etc), producing an effect similar to a photograph negative. 

Color channels can be excluded from the calculation using the `include` flags. Has no impact on the alpha channel.

Creates an ActionObject for the `invert-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true
```

### Method: `magenta`
**(Color channels filter)** Sets the input's green channel values to zero, and averages the remaining channel colors for each pixel

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `mapToGradient`
**(Color channels filter)** Applies a gradient to a grayscaled input. 

The type of grayscale can be set using the `useNaturalGrayscale` flag. The grayscale is applied as part of the primative function and does not need to be created in a prior chained ActionObject.

The `gradient` attribute can be a Gradient object, or that object's `name` attribute.

Creates an ActionObject for the `map-to-gradient` primitive function.

See test demo [Filters-022](../../demo/filters-022.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

useNaturalGrayscale         yes         false
gradient                    yes         default Gradient object
```

### Method: `matrix`
**(Convolution filter)** Applies a 3x3 [convolution matrix](https://en.wikipedia.org/wiki/Kernel_(image_processing)) (also known as a kernel, or mask) operation to the input.

The `weights` attribute should be an Array of length `9`.

Individual channels can be excluded from the calculation.

Creates an ActionObject for the `matrix` primitive function.

See test demo [Filters-012](../../demo/filters-012.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

includeAlpha                yes         true
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true

weights                     yes         [
                                          0, 0, 0,
                                          0, 1, 0,
                                          0, 0, 0
                                        ]
```

### Method: `matrix5`
**(Convolution filter)** Applies a 5x5 [convolution matrix](https://en.wikipedia.org/wiki/Kernel_(image_processing)) (also known as a kernel, or mask) operation to the input.

The `weights` attribute should be an Array of length `25`.

Individual channels can be excluded from the calculation.

Creates an ActionObject for the `matrix` primitive function.

See test demo [Filters-012](../../demo/filters-012.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

includeAlpha                yes         true
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true

weights                     yes         [
                                          0, 0, 0, 0, 0, 
                                          0, 0, 0, 0, 0, 
                                          0, 0, 1, 0, 0,
                                          0, 0, 0, 0, 0, 
                                          0, 0, 0, 0, 0, 
                                        ]
```

### Method: `modifyOk`
**(OK filter)** For each pixel in the input:
+ Convert to OKLAB
+ Add a value to each of the OKLAB channels
+ Convert back to RGB

Where: 
+ `L` (luminance) channel controls brightness, and will be a value between `0.0` (black) and `1.0` (white)
+ `A` (red-green) channel controls red-green hues - values range from `-0.4` (full green) to `+0.4` (full red)
+ `B` (yellow-blue) channel controls yellow-blue hues - values range from `-0.4` (full blue) to `+0.4` (full yellow)

Creates an ActionObject for the `modify-ok-channels` primitive function.

See test demo [Filters-031](../../demo/filters-031.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

channelA                    yes         0
channelB                    yes         0
channelL                    yes         0
```

### Method: `modulateOk`
**(OK filter)** For each pixel in the input:
+ Convert to OKLAB
+ Multiply a value to each of the OKLAB channels
+ Convert back to RGB

Creates an ActionObject for the `modulate-ok-channels` primitive function.

See test demo [Filters-032](../../demo/filters-032.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

channelA                    yes         1
channelB                    yes         1
channelL                    yes         1
```

### Method: `negative`
**(OK filter)** For each pixel in the input:
+ Convert to OKLCH
+ Rotate hue value `180deg`
+ Subtract luminance from 1
+ Convert back to RGB

Creates an ActionObject for the `negative` primitive function.

See test demo [Filters-030](../../demo/filters-030.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `newsprint`
**(Convolution filter)** Attempts to simulate a black-white dither effect similar to newsprint across the input.

The `width` attribute defines the size of the blocks used in the filter.

Creates an ActionObject for the `newsprint` primitive function.

See test demo [Filters-016](../../demo/filters-016.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

width                       yes         1
```

### Method: `notblue`
**(Color channels filter)** Sets the input's blue channel values to zero.

Creates an ActionObject for the `set-channel-to-level` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `notgreen`
**(Color channels filter)** Sets the input's green channel values to zero.

Creates an ActionObject for the `set-channel-to-level` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `notred`
**(Color channels filter)** Sets the input's red channel values to zero.

Creates an ActionObject for the `set-channel-to-level` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `offset`
**(Displacement filter)** Moves the input in its entirety by the given offsets.

Creates an ActionObject for the `offset` primitive function.

See test demo [Filters-035](../../demo/filters-035.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

offsetX                     yes         0
offsetY                     yes         0
```

### Method: `offsetChannels`
**(Displacement filter)** Moves each channel input by an offset set for that channel.

Creates an ActionObject for the `offset` primitive function.

See test demo [Filters-036](../../demo/filters-036.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

offsetAlphaX                yes         0
offsetAlphaY                yes         0
offsetBlueX                 yes         0
offsetBlueY                 yes         0
offsetGreenX                yes         0
offsetGreenY                yes         0
offsetRedX                  yes         0
offsetRedY                  yes         0
```

### Method: `pixelate`
**(Convolution filter)** Averages the colors within a set of rectangular blocks across the input to produce a series of obscuring tiles.

Individual channels can be included in the calculation by setting their respective `include` flags.

The effect can be offset using the `offset` attributes (measured in `px`).

Creates an ActionObject for the `pixelate` primitive function.

See test demo [Filters-009](../../demo/filters-009.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

includeAlpha                yes         false
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true

offsetX                     yes         0
offsetY                     yes         0
tileHeight                  yes         1
tileWidth                   yes         1
```

### Method: `randomNoise`
**(Displacement filter)** Creates a stippling effect across the image.

The spread of the effect can be controlled using the `width` and `height` attributes (which can be negative). Dev-users can manage the intensity of the effect using the `level` attribute, which ranges from `0` to `1`.

The effect can be wrapped by setting the `noWrap` Boolean flag. Channels can be excluded from the calculations using their respective `include` flags.

The effect supports 3 noise types:
+ `random` noise creates a general spread effect; the [pseudorandom generator's](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) `seed` can be set to any String value.
+ `ordered` and `bluenoise` noise can be used for more directional results.

Creates an ActionObject for the `random-noise` primitive function.

See test demo [Filters-023](../../demo/filters-023.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

includeAlpha                yes         true
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true

height                      yes         1
level                       yes         0
width                       yes         1

excludeTransparentPixels    yes         true
noiseType                   yes         'random'
noWrap                      yes         false
seed                        yes         DEFAULT_SEED

The noiseType permitted values are:
  'bluenoise'     'ordered'       'random'
```

### Method: `red`
**(Color channels filter)** Sets the input's blue and green channel values to zero

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `reducePalette`
**(OK filter)** Analyses the input and, dependant on settings:
+ If necessary, calculate a "commonest colors" reduced palette based on the input colors, guided by the number of colors required and a [minimum color distance](https://en.wikipedia.org/wiki/Color_difference) between the selected colors.
+ Apply the palette to the input, using a given [dithering effect](https://en.wikipedia.org/wiki/Dither).

The `palette` attribute is multi-functional. It can accept:
+ A defined string to create various grayscale outputs: `'black-white', 'monochrome-4', 'monochrome-8', 'monochrome-16'`
+ An Array of predefined CSS Color strings which will form the reduced palette.
+ A Number, representing the number of "commonest color" colors to calculate for the reduced palette.

The effect can output different dithering results dependent on the selected `noiseType` value.

Be aware this is a complex and expensive filter! Dev-users are strongly advised to memoize its output.

Creates an ActionObject for the `reduce-palette` primitive function.

See test demo [Filters-027](../../demo/filters-027.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

minimumColorDistance        yes         1000
noiseType                   yes         'random'
palette                     yes         'black-white'
seed                        yes         DEFAULT_SEED

The noiseType permitted values are:
  'bluenoise'     'ordered'       'random'
```

### Method: `rotateHue`
**(OK filter)** For each pixel in the input:
+ Convert to OKLCH
+ Rotate hue value by given angle (measured in degrees)
+ Convert back to RGB

Creates an ActionObject for the `rotate-hue` primitive function.

See test demo [Filters-029](../../demo/filters-029.html)
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

angle                       yes         0
```

### Method: `saturation`
**(Color channels filter)** Adjusts the saturation of the input.

Creates an ActionObject for the `modulate-channels` primitive function.

See test demo [Filters-003](../../demo/filters-003.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

level                       yes         1
```

### Method: `sepia`
**(Color channels filter)** Applies a predefined tint to the input.

Creates an ActionObject for the `tint-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `sharpen`
**(Convolution filter)** Applies a preset 3x3 sharpen matrix to the input.

Creates an ActionObject for the `matrix` primitive function.

See test demo [Filters-019](../../demo/filters-019.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

### Method: `swirl`
**(Displacement filter)** For each input pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate.

This filter can handle multiple swirls in a single pass. Each swirl is defined in an object with the following attributes:
+ The `start` and `radius` attributes can be defined in absolute `px` Number values, or relative `%` String values - relative to the input width.
+ The `angle` Number value is measured in degrees - a value of `720` will result in a swirl of 2 complete turns.
+ The `easing` value can be any valid easing string identifier (for example `'linear'`, `'easeOutIn'`, etc) or, alternatively, a dev-user defined easing function.

```
{
  startX: Number | String;
  startY: Number | String;
  innerRadius: Number | String;
  outerRadius: Number | String;
  angle: Number;
  easing: String | EasingFunctionObject;
}
```

To generate a single swirl, define these attributes directly in the factory function's argument object. This swirl can be animated. Additional swirls need to be defined as objects within an Array assigned to the `swirls` attribute.

Creates an ActionObject for the `swirl` primitive function.

See test demo [Filters-026](../../demo/filters-026.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

startX                      yes         1
startY                      yes         1
innerRadius                 yes         1
outerRadius                 yes         '30%'
angle                       yes         0
easing                      yes         'linear'

swirls                      yes         []
```

### Method: `threshold`
**(Color channels filter)** Creates a duotone effect across the input:
+ Grayscales the input.
+ For each pixel, checks the color channel values against a `level` argument: 
  - pixels with channel values above the level value are assigned to the `high` color;
  - otherwise they are updated to the `low` color.

The `high` and `low` color channels can be set using their related attributes. Alternatively dev-users can set the `highColor` and `lowColor` attributes to CSS Color strings.

If the `useMixedChannel` flag is set to `true`, processing occurs on a per-pixel level; otherwise processing happens on a per-channel basis. Individual channel levels can be set in the `red`, `green`, `blue` and `alpha` attributes. Channels can also be excluded from the calculation.

Creates an ActionObject for the `threshold` primitive function.

See test demo [Filters-004](../../demo/filters-004.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

level                       yes         128

alpha                       yes         128
blue                        yes         128
green                       yes         128
red                         yes         128

highColor                   no          (pseudo-attribute)
highAlpha                   yes         255
highBlue                    yes         255
highGreen                   yes         255
highRed                     yes         255

lowColor                    no          (pseudo-attribute)
lowAlpha                    yes         255
lowBlue                     yes         0
lowGreen                    yes         0
lowRed                      yes         0

includeRed                  yes         true
includeGreen                yes         true
includeBlue                 yes         true
includeAlpha                yes         false

useMixedChannel             yes         true
```

### Method: `tiles`
**(Convolution filter)** Covers the input with tiles whose color matches the average channel values for the pixels included in each tile. Has a similarity to the `pixelate` filter, but uses a set of coordinate points to generate the tiles which results in a more Delauney-like output.

The filter has four modes, set on the `points` attribute:
+ `'rect-grid'` - generates a regular grid of tiles, where: `offsetX`, `offsetY` represent the origin coordinate from which the grid will be calculated; `tileWidth`, `tileHeight` supply the dimensions of the rectangular tiles; `angle` is the amount of tile rotation.
+ `'hex-grid'` - generates a hexagonal grid of tiles, where: `offsetX`, `offsetY` represent the origin coordinate from which the grid will be calculated; `tileRadius` supplies the radius for each hexagonal tile; `angle` is the amount of tile rotation.
+ Number - semi-randomly generates a set of points to the given value, constrained to an area determined by the `tileRadius`, `offsetX`, `offsetY` and `angle` arguments. Unlike other versions, this version will only include pixels within the bounds of circle of the given radius centered on the supplied offset coordinate values. To vary the randomness of point generation, the user can supply a `seed` argument, used when initializing the pseudo-random number generator.
+ Array eg: `[x1, y1, x2, y2, ...]` - actions the points as described in the array. Pixel selection for each point is constrained by the supplied `tileRadius`, `offsetX` and `offsetY` arguments.

Dev-users should be aware that initial calculation of the tile sets is very computationally intensive.

Channels can be included in the calculation by setting the appropriate `include` flags.

Creates an ActionObject for the `tiles` primitive function.

See test demo [Filters-015](../../demo/filters-015.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

points                      yes         'rect-grid',

angle                       yes         0
offsetX                     yes         0
offsetY                     yes         0
seed                        yes         DEFAULT_SEED,
tileHeight                  yes         1
tileRadius                  yes         1
tileWidth                   yes         1

includeAlpha                yes         false
includeBlue                 yes         true
includeGreen                yes         true
includeRed                  yes         true

The points attribute's permitted values are:
  'rect-grid'     'hex-grid'      Number          Number[]      
```

### Method: `tint`
**(Color channels filter)** Transforms an input's pixel values based on an interplay between the values of each pixel's channel values:
```
Red channel     = (val * redInRed)   + (val * greenInRed)   + (val * blueInRed)
Green channel   = (val * redInGreen) + (val * greenInGreen) + (val * blueInGreen)
Blue channel    = (val * redInBlue)  + (val * greenInBlue)  + (val * blueInBlue)

Where: 
  val = the pixel channel's original value
  multipliers are float Number values between 0 and 1
```

Dev-users can set the multipliers either as float Numbers in the nine supplied attributes, or by using the `redColor`, `greenColor`, `blueColor` attributes, which can be set to CSS Color string values:
```
redColor     -> [ redInRed,   greenInRed,   blueInRed   ]
greenColor   -> [ redInGreen, greenInGreen, blueInGreen ]
blueColor    -> [ redInBlue,  greenInBlue,  blueInBlue  ]
```

Creates an ActionObject for the `tint-channels` primitive function.

See test demo [Filters-008](../../demo/filters-008.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1

blueColor                   no          (pseudo-attribute)
blueInBlue                  yes         1
blueInGreen                 yes         0
blueInRed                   yes         0
greenColor                  no          (pseudo-attribute)
greenInBlue                 yes         0
greenInGreen                yes         1
greenInRed                  yes         0
redColor                    no          (pseudo-attribute)
redInBlue                   yes         0
redInGreen                  yes         0
redInRed                    yes         1
```

### Method: `yellow`
**(Color channels filter)** Sets the input's blue channel values to zero, and averages the remaining channel colors for each pixel

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```
