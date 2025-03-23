# Scrawl-canvas filters
The purpose of a computer graphics filter is to take an input graphic, apply a set of manipulations to each pixel in the graphic, and output the modified result. For web pages, filter algorithms are generally applied to elements - including `<canvas>` elements - using the [CSS filter property](https://developer.mozilla.org/en-US/docs/Web/CSS/filter).

CSS filters are a set of functions which the dev-user can use to quickly apply a range of effects - `blur()`, `saturate()`, `drop-shadow()`, etc - either to a DOM element or to the background behind that element. While these filters can be stacked (eg: sepia + blur), for more advanced effects CSS offers a `url()` filter, which allows the dev-user to apply an [SVG-defined filter effect](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter) to the element.

Note that SVG filters are complex and powerful. In addition to the MDN page linked above, the following resources may be of interest to the inquisitive:
+ (Webplatform, 2015) - [A summary of the various SVG filter primatives](https://webplatform.github.io/docs/svg/tutorials/smarter_svg_filters/)
+ (Codrops, 2019) - [A series of articles around SVG filters](https://tympanus.net/codrops/2019/01/15/svg-filters-101/)
+ (yoksel.github.io) - [An interactive SVG filters playground](https://yoksel.github.io/svg-filters/#/)

> **tl;dr:** Filter effects - however they are used in a web page - are often computationally expensive and risk slowing down page speed and responsiveness. Use filters wisely!

Browsers extend the use of these filters to Javascript-driven paint operations in the `<canvas>` element. The canvas context engine includes a [filter property](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) (note: the key is singular), which dev-users can use to apply CSS filters to specific fill and stroke invocations. SC implements this functionality via regular `set` function calls: `cell.set({filter: string})` for the entire Cell object's display, and `entity.set({filter: string})` for individual entity objects within the display. See test demo [Filters-501](../../demo/filters-501.html) to see this functionality in action.

## The SC filter engine
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

While the modern approach offers more versatility when it comes to chaining filter primitive functions together to create complex effects, the legacy approach is often more convenient for creating simpler effects. Compare the different approaches to creating a simple pixellation filter:
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

#### Filter stacking
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

#### Filter chaining
SVG filters include a way to define the inputs for an SVG filter primitive, and label the primitive's output so that it can be used as an input for a subsequent primitive operation. This method of **filter chaining** is what gives SVG filters their unique power to break away from the linear stacking approach to filter composition.

SC follows in SVG's footsteps. Every SC filter primative function includes `lineIn` and `lineOut` argument attributes to define the primitive's input data and output label; some functions also require a `lineMix` attribute 

[todo]

### Stencil filters
[todo]

### Filter output memoization
[todo]

### One-time filter output stashing operations
[todo]

## SC filter primative functions
[todo]

## SC predefined filter effects
[todo intro]

### Method: `alphaToChannels`
Copies an input's alpha channel value over to each selected channel's value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. 

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
Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to the appropriate value specified in the `areaAlphaLevels` attribute. Can be used to create horizontal or vertical bars, or chequerboard effects:
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
Performs a blend operation on two inputs - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#blending) for more details.

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
Sets the input's red and green channel values to zero.

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
A bespoke [box blur](https://en.wikipedia.org/wiki/Box_blur) function. Creates visual artefacts with various settings that might be useful. 

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
Adjusts the brightness of the input.

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
Produces a [posterization effect](https://en.wikipedia.org/wiki/Posterization) on the input. 

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

alpha                       yes         [0]
blue                        yes         [0]
green                       yes         [0]
red                         yes         [0]
```

### Method: `channels`
Adjusts the value of each input channel by a specified multiplier.

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
Restricts the number of color values that each channel can set by imposing regular bands on each channel. This produces a [posterization effect](https://en.wikipedia.org/wiki/Posterization) on the input.

The `clamp` attribute determines where in the band the color reference value should fall.

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
Calculates an average value from each pixel's included channels and applies that value to the pixel's alpha channel.

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
Produces a [chroma key compositing effect](https://en.wikipedia.org/wiki/Chroma_key) across the input.

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
Produces a [chroma key compositing effect](https://en.wikipedia.org/wiki/Chroma_key) across the input.

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
Clamp each color channel to a range determined by a set of `low` and `high` channel values. These attributes' values should be integer Numbers (between `0` and `255`). 

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
Perform a Porter-Duff compositing operation on two inputs - see [W3C Compositing and Blending recommendations](https://www.w3.org/TR/compositing-1/#porterduffcompositingoperators) for details.

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
Performs a special form of matrix operation on each input pixel's color and alpha channels, calculating the new value using neighbouring pixel values. This is (roughly) equivalent to the SVG (`<feMorphology>`)[https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology] filter primative.

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
Applies an array of weights values to the input's pixel data. This represents a (vague) form of [tone mapping](https://en.wikipedia.org/wiki/Tone_mapping).

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
Sets the input's red channel values to zero, and averages the remaining channel colors for each pixel

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
Moves pixels around the input image, based on the color channel values supplied by a displacement map image. This is the SC filter engine's attempt to reproduce the SVG [`<feDisplacementMap>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap) filter primative.

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
Applies a preset 3x3 edge-detect matrix to the input

Creates an ActionObject for the `matrix` primitive function.

See test demo [Filters-019](../../demo/filters-019.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

// __emboss__ (new in v8.4.0) - outputs a black-gray-red emboss effect
    emboss: function (f) {
        const actions = [];
        if (f.useNaturalGrayscale) {
            actions.push({
                action: GRAYSCALE,
                lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
                lineOut: EMBOSS_WORK,
            });
        }
        else {
            actions.push({
                action: AVERAGE_CHANNELS,
                lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
                lineOut: EMBOSS_WORK,
                includeRed: true,
                includeGreen: true,
                includeBlue: true,
            });
        }
        if (f.clamp) {
            actions.push({
                action: CLAMP_CHANNELS,
                lineIn: EMBOSS_WORK,
                lineOut: EMBOSS_WORK,
                lowRed: 0 + f.clamp,
                lowGreen: 0 + f.clamp,
                lowBlue: 0 + f.clamp,
                highRed: 255 - f.clamp,
                highGreen: 255 - f.clamp,
                highBlue: 255 - f.clamp,
            });
        }
        if (f.smoothing) {
            actions.push({
                action: GAUSSIAN_BLUR,
                lineIn: EMBOSS_WORK,
                lineOut: EMBOSS_WORK,
                radius: f.smoothing,
            });
        }
        actions.push({
            action: EMBOSS,
            lineIn: EMBOSS_WORK,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            angle: (f.angle != null) ? f.angle : 0,
            strength: (f.strength != null) ? f.strength : 1,
            tolerance: (f.tolerance != null) ? f.tolerance : 0,
            keepOnlyChangedAreas: (f.keepOnlyChangedAreas != null) ? f.keepOnlyChangedAreas : false,
            postProcessResults: (f.postProcessResults != null) ? f.postProcessResults : true,
        });
        f.actions = actions;
    },

// __flood__ (new in v8.4.0) - creates a uniform sheet of the required color, which can then be used by other filter actions
// + Note that the `alpha` value is given in the range `0-255` (like the color channels), not `0-1` or `0%-100%` (as is expected in various CSS color String definitions)
// + Since v8.7.0, this filter also accepts a `reference` color string in place of the `red, green, blue, alpha` values
    flood: function (f) {

        let red = (f.red != null) ? f.red : 0,
            green = (f.green != null) ? f.green : 0,
            blue = (f.blue != null) ? f.blue : 0,
            alpha = (f.alpha != null) ? f.alpha : 255;

        const excludeAlpha = (f.excludeAlpha != null) ? f.excludeAlpha : false;

        if (f.reference != null) {

            [red, green, blue, alpha] = colorEngine.extractRGBfromColor(f.reference);

            alpha = _round(alpha * 255);

            f.red = red;
            f.green = green;
            f.blue = blue;
            f.alpha = alpha;

            delete f.reference;
        }

        f.actions = [{
            action: FLOOD,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            red,
            green,
            blue,
            alpha,
            excludeAlpha,
        }];
    },

// __gaussianBlur__ - from this GitHub repository: https://github.com/nodeca/glur/blob/master/index.js (code accessed 1 June 2021)
    gaussianBlur: function (f) {
        if (f.radius != null) {
            f.radiusHorizontal = f.radius;
            f.radiusVertical = f.radius;
            delete f.radius;
        }

        f.actions = [{
            action: GAUSSIAN_BLUR,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : true,
            excludeTransparentPixels: (f.excludeTransparentPixels != null) ? f.excludeTransparentPixels : false,
            opacity: (f.opacity != null) ? f.opacity : 1,
            radiusHorizontal: (f.radiusHorizontal != null) ? f.radiusHorizontal : 1,
            radiusVertical: (f.radiusVertical != null) ? f.radiusVertical : 1,
        }];
    },

// __glitch__ - semi-randomly shift rows left/right
    glitch: function (f) {
        f.actions = [{
            action: GLITCH,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            useMixedChannel: (f.useMixedChannel != null) ? f.useMixedChannel : true,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            step: (f.step != null) ? f.step : 1,
            offsetMin: (f.offsetMin != null) ? f.offsetMin : 0,
            offsetMax: (f.offsetMax != null) ? f.offsetMax : 0,
            offsetRedMin: (f.offsetRedMin != null) ? f.offsetRedMin : 0,
            offsetRedMax: (f.offsetRedMax != null) ? f.offsetRedMax : 0,
            offsetGreenMin: (f.offsetGreenMin != null) ? f.offsetGreenMin : 0,
            offsetGreenMax: (f.offsetGreenMax != null) ? f.offsetGreenMax : 0,
            offsetBlueMin: (f.offsetBlueMin != null) ? f.offsetBlueMin : 0,
            offsetBlueMax: (f.offsetBlueMax != null) ? f.offsetBlueMax : 0,
            offsetAlphaMin: (f.offsetAlphaMin != null) ? f.offsetAlphaMin : 0,
            offsetAlphaMax: (f.offsetAlphaMax != null) ? f.offsetAlphaMax : 0,
            transparentEdges: (f.transparentEdges != null) ? f.transparentEdges : false,
            level: (f.level != null) ? f.level : 0,
        }];
    },

### Method: `gray`
Averages the input's color channel values for each pixel.

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

// __grayscale__ - produces a more realistic black-and-white photograph effect
    grayscale: function (f) {
        f.actions = [{
            action: GRAYSCALE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

### Method: `green`
Sets the input's red and blue channel values to zero.

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

// __image__ (new in v8.4.0) - load an image into the filter engine, where it can then be used by other filter actions - useful for effects such as watermarking an image
    image: function (f) {

        f.actions = [{
            action: PROCESS_IMAGE,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            asset: (f.asset != null) ? f.asset : ZERO_STR,
            width: (f.width != null) ? f.width : 1,
            height: (f.height != null) ? f.height : 1,
            copyWidth: (f.copyWidth != null) ? f.copyWidth : 1,
            copyHeight: (f.copyHeight != null) ? f.copyHeight : 1,
            copyX: (f.copyX != null) ? f.copyX : 0,
            copyY: (f.copyY != null) ? f.copyY : 0,
        }];
    },

// __invert__ - inverts the colors in the image, producing an effect similar to a photograph negative
    invert: function (f) {
        f.actions = [{
            action: INVERT_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            includeRed: true,
            includeGreen: true,
            includeBlue: true,
        }];
    },

### Method: `magenta`
Sets the input's green channel values to zero, and averages the remaining channel colors for each pixel

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

// __mapToGradient__ - produces a more realistic black-and-white photograph effect
    mapToGradient: function (f) {

        if (f.gradient && f.gradient.substring) f.gradient = styles[f.gradient];

        f.actions = [{
            action: MAP_TO_GRADIENT,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            useNaturalGrayscale: (f.useNaturalGrayscale != null) ? f.useNaturalGrayscale : false,
            gradient: f.gradient || makeGradient(),
        }];
    },

// __matrix__ - applies a 3x3 convolution matrix, kernel or mask operation to the image
    matrix: function (f) {
        f.actions = [{
            action: MATRIX,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: 3,
            height: 3,
            offsetX: 1,
            offsetY: 1,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            weights: (f.weights != null) ? f.weights : [0,0,0,0,1,0,0,0,0],
        }];
    },

// __matrix5__ - applies a 5x5 convolution matrix, kernel or mask operation to the image
    matrix5: function (f) {
        f.actions = [{
            action: MATRIX,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: 5,
            height: 5,
            offsetX: 2,
            offsetY: 2,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            weights: (f.weights != null) ? f.weights : [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
        }];
    },

// __modifyOk__ - (new in v8.14.0) - for each pixel: convert to OKLAB; add a value to each of the OKLAB channels; convert back to RGB
    modifyOk: function (f) {
        f.actions = [{
            action: MODIFY_OK_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            channelL: (f.channelL != null) ? f.channelL : 0,
            channelA: (f.channelA != null) ? f.channelA : 0,
            channelB: (f.channelB != null) ? f.channelB : 0,
        }];
    },

// __modulateOk__ - (new in v8.14.0) - for each pixel: convert to OKLAB; multiply each of the OKLAB channels by a given value; convert back to RGB
    modulateOk: function (f) {
        f.actions = [{
            action: MODULATE_OK_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            channelL: (f.channelL != null) ? f.channelL : 1,
            channelA: (f.channelA != null) ? f.channelA : 1,
            channelB: (f.channelB != null) ? f.channelB : 1,
        }];
    },

// __negative__ - (new in v8.14.0) - for each pixel: convert to OKLCH; rotate hue value 180deg; subtract luminance from 1; convert back to RGB
    negative: function (f) {
        f.actions = [{
            action: NEGATIVE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
        }];
    },

// __newsprint__ - Attempts to simulate a black-white dither effect similar to newsprint
    newsprint: function (f) {
        f.actions = [{
            action: NEWSPRINT,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: (f.width != null) ? f.width : 1,
        }];
    },

### Method: `notblue`
Sets the input's blue channel values to zero.

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
Sets the input's green channel values to zero.

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
Sets the input's red channel values to zero.

Creates an ActionObject for the `set-channel-to-level` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

// __offset__ (new in v8.4.0) - moves the image in its entirety by the given offset
    offset: function (f) {
        f.actions = [{
            action: OFFSET,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            offsetRedX: (f.offsetX != null) ? f.offsetX : 0,
            offsetRedY: (f.offsetY != null) ? f.offsetY : 0,
            offsetGreenX: (f.offsetX != null) ? f.offsetX : 0,
            offsetGreenY: (f.offsetY != null) ? f.offsetY : 0,
            offsetBlueX: (f.offsetX != null) ? f.offsetX : 0,
            offsetBlueY: (f.offsetY != null) ? f.offsetY : 0,
            offsetAlphaX: (f.offsetX != null) ? f.offsetX : 0,
            offsetAlphaY: (f.offsetY != null) ? f.offsetY : 0,
        }];
    },

// __offsetChannels__ (new in v8.4.0) - moves each channel  by an offset set for that channel. Can create a crude stereoscopic output
    offsetChannels: function (f) {
        f.actions = [{
            action: OFFSET,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            offsetRedX: (f.offsetRedX != null) ? f.offsetRedX : 0,
            offsetRedY: (f.offsetRedY != null) ? f.offsetRedY : 0,
            offsetGreenX: (f.offsetGreenX != null) ? f.offsetGreenX : 0,
            offsetGreenY: (f.offsetGreenY != null) ? f.offsetGreenY : 0,
            offsetBlueX: (f.offsetBlueX != null) ? f.offsetBlueX : 0,
            offsetBlueY: (f.offsetBlueY != null) ? f.offsetBlueY : 0,
            offsetAlphaX: (f.offsetAlphaX != null) ? f.offsetAlphaX : 0,
            offsetAlphaY: (f.offsetAlphaY != null) ? f.offsetAlphaY : 0,
        }];
    },

// __pixelate__ - averages the colors in a block to produce a series of obscuring tiles. This is a simplified version of the `tiles` filter
    pixelate: function (f) {
        f.actions = [{
            action: PIXELATE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            tileWidth: (f.tileWidth != null) ? f.tileWidth : 1,
            tileHeight: (f.tileHeight != null) ? f.tileHeight : 1,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
        }];
    },

// __randomNoise__ (new in v8.6.0) - creates a stippling effect across the image
    randomNoise: function (f) {

        const noiseType = (NOISE_VALUES.includes(f.noiseType)) ? f.noiseType : RANDOM;

        f.actions = [{
            action: RANDOM_NOISE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            width: (f.width != null) ? f.width : 1,
            height: (f.height != null) ? f.height : 1,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            noiseType,
            level: (f.level != null) ? f.level : 0,
            noWrap: (f.noWrap != null) ? f.noWrap : false,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : true,
            excludeTransparentPixels: (f.excludeTransparentPixels != null) ? f.excludeTransparentPixels : true,
        }];
    },

### Method: `red`
Sets the input's blue and green channel values to zero

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

// __reducePalette__ - reduce the number of colors in its palette
    reducePalette: function (f) {

        let palette = (f.palette != null) ? f.palette : BLACK_WHITE;

        f.actions = [];

        if (palette.substring) {

            if (palette.includes(ARG_SPLITTER)) {

                palette = palette.split(ARG_SPLITTER);
                palette.forEach(p => p.trim());
            }
        }

        // `useBluenoise` is deprecated
        // + use `noiseType: 'bluenoise'` instead
        let noiseType = (f.useBluenoise) ? BLUENOISE : f.noiseType || RANDOM;
        if (!NOISE_VALUES.includes(noiseType)) noiseType = RANDOM;

        f.actions.push({
            action: REDUCE_PALETTE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            minimumColorDistance: (f.minimumColorDistance != null) ? f.minimumColorDistance : 1000,
            palette,
            noiseType,
            opacity: (f.opacity != null) ? f.opacity : 1,
        });
    },

// __rotateHue__ - (new in v8.14.0) - for each pixel: convert to OKLCH; rotate hue value by given angle; convert back to RGB
    rotateHue: function (f) {
        f.actions = [{
            action: ROTATE_HUE,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            angle: (f.angle != null) ? f.angle : 0,
        }];
    },

// __saturation__ - alters the saturation level of the image
    saturation: function (f) {
        const level = (f.level != null) ? f.level : 1;

        f.actions = [{
            action: MODULATE_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            red: level,
            green: level,
            blue: level,
            saturation: true,
        }];
    },

// __sepia__ - recalculates the values of each color channel (a tint action) to create a more 'antique' version of the image
    sepia: function (f) {
        f.actions = [{
            action: TINT_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed: 0.393,
            redInGreen: 0.349,
            redInBlue: 0.272,
            greenInRed: 0.769,
            greenInGreen: 0.686,
            greenInBlue: 0.534,
            blueInRed: 0.189,
            blueInGreen: 0.168,
            blueInBlue: 0.131,
        }];
    },

### Method: `sharpen`
Applies a preset 3x3 sharpen matrix to the input.

Creates an ActionObject for the `matrix` primitive function.

See test demo [Filters-019](../../demo/filters-019.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

// __swirl__ - for each pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate.
// + This filter can handle multiple swirls in a single pass
    swirl: function (f) {
        const startX = (f.startX != null) ? f.startX : PC50,
            startY = (f.startY != null) ? f.startY : PC50,
            innerRadius = (f.innerRadius != null) ? f.innerRadius : 0,
            outerRadius = (f.outerRadius != null) ? f.outerRadius : PC30,
            angle = (f.angle != null) ? f.angle : 0,
            easing = (f.easing != null) ? f.easing : LINEAR,
            staticSwirls = (f.staticSwirls != null) ? f.staticSwirls : [];

        const swirls = [...staticSwirls];
        swirls.push([startX, startY, innerRadius, outerRadius, angle, easing]);

        f.actions = [{
            action: SWIRL,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            swirls,
        }];
    },

// __threshold__ - creates a duotone effect - grayscales the input then, for each pixel, checks the color channel values against a "level" argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color.
// + Since v8.7.0, this filter also accepts `lowColor` and `highColor` CSS color Strings in place of the `lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue` values
    threshold: function (f) {
        let lowRed = (f.lowRed != null) ? f.lowRed : 0,
            lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
            lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
            lowAlpha = (f.lowAlpha != null) ? f.lowAlpha : 255,
            highRed = (f.highRed != null) ? f.highRed : 255,
            highGreen = (f.highGreen != null) ? f.highGreen : 255,
            highBlue = (f.highBlue != null) ? f.highBlue : 255,
            highAlpha = (f.highAlpha != null) ? f.highAlpha : 255;

        if (f.lowColor != null) {

            [lowRed, lowGreen, lowBlue, lowAlpha] = colorEngine.extractRGBfromColor(f.lowColor);

            lowAlpha = _round(lowAlpha * 255);

            f.lowRed = lowRed;
            f.lowGreen = lowGreen;
            f.lowBlue = lowBlue;
            f.lowAlpha = lowAlpha;

            f.low = [lowRed, lowGreen, lowBlue, lowAlpha];

            delete f.lowColor;
        }

        if (f.highColor != null) {

            [highRed, highGreen, highBlue, highAlpha] = colorEngine.extractRGBfromColor(f.highColor);

            highAlpha = _round(highAlpha * 255);

            f.highRed = highRed;
            f.highGreen = highGreen;
            f.highBlue = highBlue;
            f.highAlpha = highAlpha;

            f.high = [highRed, highGreen, highBlue, highAlpha];

            delete f.highColor;
        }

        const low = (f.low != null) ? f.low : [lowRed, lowGreen, lowBlue, lowAlpha],
            high = (f.high != null) ? f.high : [highRed, highGreen, highBlue, highAlpha];

        f.actions = [{
            action: THRESHOLD,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            level: (f.level != null) ? f.level : 128,
            red: (f.red != null) ? f.red : 128,
            green: (f.green != null) ? f.green : 128,
            blue: (f.blue != null) ? f.blue : 128,
            alpha: (f.alpha != null) ? f.alpha : 128,
            low,
            high,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
            useMixedChannel: (f.useMixedChannel != null) ? f.useMixedChannel : true,
        }];
    },

// __tiles__ - averages the colors in a group of pixels to produce a series of obscuring tiles. This is a more complex version of the `pixelate` filter
    tiles: function (f) {
        f.actions = [{
            action: TILES,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            tileWidth: (f.tileWidth != null) ? f.tileWidth : 1,
            tileHeight: (f.tileHeight != null) ? f.tileHeight : 1,
            tileRadius: (f.tileRadius != null) ? f.tileRadius : 1,
            offsetX: (f.offsetX != null) ? f.offsetX : 0,
            offsetY: (f.offsetY != null) ? f.offsetY : 0,
            angle: (f.angle != null) ? f.angle : 0,
            points: (f.points != null) ? f.points : RECT_GRID,
            seed: (f.seed != null) ? f.seed : DEFAULT_SEED,
            includeRed: (f.includeRed != null) ? f.includeRed : true,
            includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
            includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
            includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
        }];
    },

// __tint__ - has similarities to the SVG &lt;feColorMatrix> filter element, but excludes the alpha channel from calculations. Rather than set a matrix, we set nine arguments to determine how the value of each color channel in a pixel will affect both itself and its fellow color channels.
    tint: function (f) {

        let redInRed = (f.redInRed != null) ? f.redInRed : 1,
            redInGreen = (f.redInGreen != null) ? f.redInGreen : 0,
            redInBlue = (f.redInBlue != null) ? f.redInBlue : 0,
            greenInRed = (f.greenInRed != null) ? f.greenInRed : 0,
            greenInGreen = (f.greenInGreen != null) ? f.greenInGreen : 1,
            greenInBlue = (f.greenInBlue != null) ? f.greenInBlue : 0,
            blueInRed = (f.blueInRed != null) ? f.blueInRed : 0,
            blueInGreen = (f.blueInGreen != null) ? f.blueInGreen : 0,
            blueInBlue = (f.blueInBlue != null) ? f.blueInBlue : 1;

        if (f.redColor != null) {

            [redInRed, greenInRed, blueInRed] = colorEngine.extractRGBfromColor(f.redColor);

            redInRed /= 255;
            greenInRed /= 255;
            blueInRed /= 255;

            f.redInRed = redInRed;
            f.greenInRed = greenInRed;
            f.blueInRed = blueInRed;

            delete f.redColor;
        }

        if (f.greenColor != null) {

            [redInGreen, greenInGreen, blueInGreen] = colorEngine.extractRGBfromColor(f.greenColor);

            redInGreen /= 255;
            greenInGreen /= 255;
            blueInGreen /= 255;

            f.redInGreen = redInGreen;
            f.greenInGreen = greenInGreen;
            f.blueInGreen = blueInGreen;

            delete f.greenColor;
        }

        if (f.blueColor != null) {

            [redInBlue, greenInBlue, blueInBlue] = colorEngine.extractRGBfromColor(f.blueColor);

            redInBlue /= 255;
            greenInBlue /= 255;
            blueInBlue /= 255;

            f.redInBlue = redInBlue;
            f.greenInBlue = greenInBlue;
            f.blueInBlue = blueInBlue;

            delete f.blueColor;
        }

        f.actions = [{
            action: TINT_CHANNELS,
            lineIn: (f.lineIn != null) ? f.lineIn : ZERO_STR,
            lineOut: (f.lineOut != null) ? f.lineOut : ZERO_STR,
            opacity: (f.opacity != null) ? f.opacity : 1,
            redInRed,
            redInGreen,
            redInBlue,
            greenInRed,
            greenInGreen,
            greenInBlue,
            blueInRed,
            blueInGreen,
            blueInBlue,
        }];
    },

### Method: `yellow`
Sets the input's blue channel values to zero, and averages the remaining channel colors for each pixel

Creates an ActionObject for the `average-channels` primitive function.

See test demos [Filters-001](../../demo/filters-001.html) and [Filters-002](../../demo/filters-002.html).
```
Attribute                   Retained?   Default
--------------------------  ----------  ----------------
lineIn                      yes         ''
lineOut                     yes         ''
opacity                     yes         1
```

## Filter engine internal processes and code considerations
[todo]

### Preparations to use the filter engine
[todo]

#### Protocol to apply filters to entity objects
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

#### Protocol to apply filters to Group objects
[todo]

#### Protocol to apply filters to Cell objects
[todo]

#### Protocol to apply filters to EnhancedLabel entity objects
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

