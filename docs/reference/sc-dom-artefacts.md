# Scrawl-canvas artefacts and the DOM
[The `<canvas>` element](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element) has been part of HTML since the introduction of HTML5. It provides scripts with a resolution-dependent bitmap canvas, which can be used for rendering graphs, game graphics, art, or other visual images in real time.

Canvas scripts are written in Javascript using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), and added to the HTML markup in `<script>` elements. It's fair to say that the Canvas API is generally low-level and not dev-user-friendly - its purpose is to render [immediate-mode graphics](https://learn.microsoft.com/en-us/windows/win32/learnwin32/retained-mode-versus-immediate-mode) into the bitmap supplied by the `<canvas>` element.

The Scrawl-canvas code stands between the `<canvas>` element and the Canvas API. The repo introduces a [scene graph](https://en.wikipedia.org/wiki/Scene_graph) which dev-users can use to build a **retained-mode graphics** canvas display.

> **tl;dr:** Scrawl-canvas has been designed to work **WITH** the [web page](https://developer.mozilla.org/en-US/docs/Web/HTML) (HTML, CSS) and its [Document Object Model](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) (DOM). ***It has not been designed to replace it!***

Given the above, there are some things repo-devs need to keep in mind when devloping and maintaining SC:
+ A web page may include many `<canvas>` elements, but it is not the job of SC to manage them all. SC only manages those canvases that it has been asked to manage - either by including the `data-scrawl-canvas` attribute in the `<canvas>` element's markup, or when instructed to do so using the `scrawl.addCanvas()` or `scrawl.getCanvas()` functions. See the test demos [DOM-012](../demo/dom-012.html), [DOM-014](../../demo/dom-014.html) and [DOM-017](../demo/dom-017.html) for examples.
+ When instructed to do so, SC will wrap (multiple) `<canvas>` elements in SC Canvas artefact objects. Part of the wrapping process involves mutating the `<canvas>` element's markup and contents so that SC can better manage it. **All SC-mediated DOM mutations must happen only to the elements that SC has wrapped, and should not spread beyond those elements!**
+ It is a fact of life that CSS markup and the `<canvas>` element don't play nicely together. Also the `<canvas>` element is barely [responsive](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design), and hostile to [accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility). It is up to SC to manage these difficult relationships to ease the dev-user's burden as much as possible - though there are actions the dev-user can take when building a canvas display to make things even easier.
+ Wherever possible, SC should leverage CSS and the DOM to Get Things Done. This includes such things like: 
  - using `<canvas>` element `data-` attributes for passing information into the SC system;
  - using DOM markup (`<img>`, `<video>` elements) to define properly responsive assets for use by Picture entitys and Pattern styles;
  - leveraging CSS for styling EnhancedLabel text layout and styling functionality;
  - updating the wrapped `<canvas>` element's inline CSS style attribute for positioning withing an SC stack;
  - etc.
+ SC needs to support `<canvas>` elements which appear in less expected parts of the web page - for instance the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) and the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).
+ **Accessibility is paramount!** SC needs to support accessibility-related settings that an end-user sets on their device, and at the same time make it as easy as possible for the dev-user to code the functionality to respect those settings, and respond appropriately to any changes the end-user may make to them while the canvas display is running on the page.
+ **Responsiveness is hard!** SC has a responsibility to the dev-user to make coding responsive canvas displays as easy as possible. This means, in practice, giving the SC canvas wrapper object state to:
  - understand the capabilities of the device on which the browser is displaying; 
  - know where the `<canvas>` element sits in relation to the browser's viewport; 
  - keep track of its current shape and size; and 
  - sufficient functionality to react to changes in this environmental state.

Much of the code that handles DOM-related interactions and manipulations can be found in various core files and mixins - in particular:
+ [core/document.js](../source/core/document.html) - for updating the DOM
+ [core/events.js](../source/core/events.html) - for tracking elements across the browser viewport
+ [helper/document-root-element.js](../source/helper/document-root-element.html) - for updating the DOM
+ [mixin/display-shape.js](../source/mixin/display-shape.html) - for handling element shape and size state, and changes to that state
+ [mixin/dom.js](../source/mixin/dom.html) - shared artefact object functionality
+ [mixin/position.js](../source/mixin/position.html) - for managing position  functionality

## Scrawl-canvas Stacks
The key purpose of SC is to position graphical entitys onto a `<canvas>` element, in a given order, so that those entitys build some form of graphical representation, chart, imagery, infographic, artwork (etc) that can be displayed as part of a web page. More information can be found in the [positioning system page](sc-positioning.html) in the Runbook.

**SC extends this positioning system to the DOM.** An HTML element can be included in the SC ecosystem to act as a space in the web page where that element's direct child elements can be positioned, manipulated and animated using SC functionality.

### A brief history of SC Stacks
Stacks started as a concept to position HTML elements - in particular elements that could be used to control canvas displays and animations - directly over a `<canvas>` element. 

This was necessary because the normal way of positioning such elements over a parent element (for instance: mark the parent as `position: relative` and the child as `position: absolute`) does not work with `<canvas>` elements. Instead, dev-users would have to place the `<canvas>` element in a containing element (usually a `<div>` element) and mark that container as relatively positioned, with the canvas and any other direct child elements becoming absolutely positioned.

From that initial idea, it was only a short conceptual step to get SC to manage child element positions in the same way as it already managed graphical entity positioning in the canvas display - using absolute and relative start coordinates, positioning by reference to other artifacts, etc.

Stacks also offered repo-devs an easy way to introduce functionality to the canvas display which the Canvas API did not (and still doesn't) offer. For example: [perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective) - rather than engage in complex mathematics to mimic the appearance of perspective in a canvas scene, dev-users could instead rotate the `<canvas>` element in 3d space to quickly achieve the same effect. See test demos [DOM-013](../../demo/dom-013.html) and [DOM-015](../../demo/dom-015.html) for examples of this functionality in action.

Today Stacks are tightly integrated into the SC ecosystem. Stacks, like Canvas wrappers, take part in the [SC Display cycle](sc-animation-systems.html) and use the same functionality to add [SC event listeners](sc-events-signals.html) to their DOM elements. And a Stack's direct child elements get wrapped into SC artefact objects (called Element) and tracked in the SC library just like graphical entity objects.

### HTML elements that can become Stack or Element artefacts
Messing with the web page DOM can become, well, messy. SC makes a best effort towards minimising this messiness - in part - by limiting the types of HTML elements which can be wrapped in SC artefact objects. These limitations get defined in the [helper/shared-vars.js](../source/helper/shared-vars.html) file.
+ **HTML elements that can be wrapped as Stack artefacts:** `<article>`, `<aside>`, `<div>`, `<footer>`, `<header>`, `<main>`, `<nav>`, `<section>`.
+ **HTML elements that can be wrapped as Element artefacts:** `<a>`, `<address>`, `<article>`, `<aside>`, `<audio>`, `<blockquote>`, `<button>`, `<details>`, `<div>`, `<dl>`, `<embed>`, `<fencedframe>`, `<figure>`, `<footer>`, `<form>`, `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`, `<header>`, `<hgroup>`, `<iframe>`, `<img>`, `<input>`, `<main>`, `<math>`, `<menu>`, `<meter>`, `<nav>`, `<object>`, `<ol>`, `<output>`, `<p>`, `<picture>`, `<pre>`, `<progress>`, `<search>`, `<section>`, `<select>`, `<svg>`, `<table>`, `<textarea>`, `<ul>`, `<video>`.

`<canvas>` elements can also be part of an Stack, with the same positioning functionality as afforded to Element objects. They cannot be their own Stack.

SC stacks can also (in theory) include other Stacks - nested stacks - though repo-devs don't currently test such functionality.

> **tl;dr:** Manipulating the DOM - particularly during SC initialization as the web page completes loading - may sometimes lead to page [layout shifts](https://developer.mozilla.org/en-US/docs/Glossary/CLS) around SC artefact DOM elements. It is up to the dev-user to accommodate any such issues in their projects.

### CSS considerations
The functionality that handles the transfer of artefact object state (position, rotation, etc) into the page DOM can be found in the [mixin/dom.js](../source/mixin/dom.html) file. This work happens as part of the [SC Display cycle](sc-animation-systems.html), and is achieved through [inline CSS updates](https://www.freecodecamp.org/news/inline-style-in-html/). Note that this may occasionally come into conflict with other JS libraries that use inline styling as part of their functionality; it's up to dev-users to manage and mitigate any such conflicts that arise.

The CSS properties that SC uses are:
+ `boxSizing` - all SC artefact DOM elements need to have this style property set to `border-box` to make calculations easier.
+ `position` - SC needs the DOM elements under its control to have either `relative` or `absolute` positioning.
+ `perspective`, `perspectiveOrigin` - specific to Stacks, to set the parameters for the Stack's 3d space. 
+ `display` - handles DOM element visibility.
+ `height`, `width` - for handling DOM element dimensions.
+ `transformOrigin` - for the artefact object's `handle` attribute (effectively the DOM element's position with respect to its rotation-reflection point)
+ `transform` - SC controls the DOM element's position in the Stack, alongside its 3d rotation and scale, using this property; for this reason SC also does what it can to restrict use of the `bottom`, `left`, `right` and `top` CSS properties.
+ `z-index` - to handle the SC artefact's `stampOrder` attribute.

### CSS classes
Beyond the above, SC expects dev-users to style their web pages in the normal way, for instance by applying [HTML classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class) to DOM elements.

SC includes functionality - `artefact.set({ classes: string })`, alongside `artefact.addClasses(string)` and `artefact.removeClasses(string)` - which gives dev-users the ability to add and remove classes via the SC artefact object. An example of this in action can be seen in the test demo [DOM-007](../../demo/dom-007.html).

## SC artefact object functionality
SC artefact objects share a lot of functionality with SC graphical entity objects - for instance managing object **position, rotation, scale and order** within an Stack, and managing their **dimensions** relative to the Stack. This functionality is coded in the [mixin/position.js](../source/mixin/position.html) file, as amended by the various DOM-related mixin and factory files. Further details can be found in the [SC positioning system](sc-positioning.html) page of the Runbook.

### Accessibility
More details about how SC helps dev-users address a range of accessibility issues for `<canvas>` elements can be found in the [accessibility page](sc-accessibility.html) of this Runbook.

For Stacks and Elements, the [accessibility considerations](https://www.w3.org/WAI/fundamentals/accessibility-intro/) are the same as for any other DOM element in the web page, and the responsibility for making these elements more accessible sit with the dev-user, not SC. Stack and Element animations can be controlled in the same way as Canvas animations - as described in the accessibility page of this Runbook.

SC does provide an easy way for the dev-user to detect the various [preference media features](https://www.smashingmagazine.com/2023/08/css-accessibility-inclusion-user-choice/) that the end-user may have set on their current device, which can be accessed through any SC artefact object as follows:
+ [forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors): `artefact.here.prefersForcedColors` - when `true` ('active'), the end user has their own color scheme which, if possible, they want the web page to use. Or, alternatively, use the device's [system colors](https://developer.mozilla.org/en-US/docs/Web/CSS/system-color).
+ [inverted-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/inverted-colors): `artefact.here.prefersInvertedColors` - when `true` ('inverted'), the end-user expects web page colors to present as their diametrically opposite color.
+ [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme): `artefact.here.prefersDarkColorScheme` - when `true` ('dark'), the end-user expects the web page to present using lighter text on a darker background.
+ [prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast): `artefact.here.prefersContrast` - the end-user can choose between four color contrast settings - 'no-preference', 'less', 'more', 'custom'; SC treats the choice as a binary between 'more' (`true`) and the others (`false`).
+ [prefers-reduced-data](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-data): `artefact.here.prefersReduceData` - when `true` ('reduce'), the end-user is asking for less data to be sent to their device.
+ [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): `artefact.here.prefersReducedMotion` - when `true` ('reduce'), the end-user wants to see minimal animation on the web page - long-running animations should complete within 5 seconds.
+ [prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency): `artefact.here.prefersReduceTransparency` - when `true` ('reduce'), the end-user expects the web page to present with a minimal amount of transparency.

SC sets the values of these `here` attributes during page load, and then listens for changes in them when, for instance, the user changes the settings in their device's operating system while the page is open. This functionality can be found in the [helper/system-flags.js](../source/helper/system-flags.html) and [core/user-interaction.js](../source/core/user-interaction.html) files.

Beyond that, it is up to the dev-user to code up functions to handle the initial states of, and subsequent changes to, these user preferences. They do this by setting their functions on artefact object hook attributes (defined in the [mixin/dom.js](../source/mixin/dom.html) file):
+ ***prefersContrast:*** - `moreContrastAction` and `otherContrastAction`
+ ***prefersDarkColorScheme:*** `colorSchemeDarkAction` and `colorSchemeLightAction`
+ ***prefersForcedColors:*** `activeForcedColorsAction` and `noForcedColorsAction`
+ ***prefersInvertedColors:*** `invertedColorsAction` and `normalColorsAction`
+ ***prefersReduceData:*** `reduceDataAction` and `noPreferenceDataAction`
+ ***prefersReducedMotion:***  `reduceMotionAction` and `noPreferenceMotionAction`
+ ***prefersReduceTransparency:*** `reduceTransparencyAction` and `noPreferenceTransparencyAction`

(With apologies for the slight inconsistency in the naming of the reduce-related preferences.)

### Progressive enhancement
To quote Wikipedia: "[Progressive enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement) is a strategy in web design that puts emphasis on web content first, allowing everyone to access the basic content and functionality of a web page, while users with additional browser features or faster Internet access receive the enhanced version instead."

This matters for SC because `<canvas>` elements require Javascript to work. In *JS-disabled environments*, the browser will treat the `<canvas>` tags like a `<div>` element and display the HTML between the tags (the **fallback content**, sometimes also called the [canvas shadow DOM](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/legacy/hh968259(v=vs.85)) - at least by Microsoft) instead.

It also matters for Accessibility because some devices which have a *JS-enabled environment* - such as screen readers - will similarly ignore the `<canvas>` tags and instead process (read out) the fallback content.

For the most part, building and supporting a web page that respects progressive enhancement is a task for dev-users. Even so, SC includes some guidelines and functionalities to make the work a little easier for dev-users:
+ Because SC is a JS library, it won't run in *JS-disabled environments*. Dev-users can include fallback content between the `<canvas>` tags and style it appropriately using their preferred method - for instance by using some `<noscript><style>...</style></noscript>` markup copy. Such content could include an `<img>` or `<figure>` element to display a static screenshot of the canvas scene.
+ When importing a `<canvas>` element into the SC system, SC will mutate that element (and only that element) to include some accessibility-friendly features. This mutation will not touch any fallback content the dev-user has already placed between the `<canvas>` tags.
+ Repo-devs need to make their best effort to ensure SC repo code does not error when running. Thus:
  - Avoid generating and throwing [error objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error); instead bypass that functionality (for instance, don't stamp a Picture entity if its `<img>` asset has not completed loading), or fail in a graceful manner so other Javascript code can continue to run.
  - But don't fail by means of [try-catch statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch): such code (at least in the past) kills web page performance!
  - (Rare exceptions to these "suggestions" can be found in the [mixin/base.js](../source/mixin/base.html) and [core/user-interaction.js](../source/core/user-interaction.html) files.)

Several of the SC test demos have been coded up in a way that respects progressive enhancement - for example test demo [Filters-004](../../demo/filters-004.html) has been written with fallback content between the `<canvas>` tags to include a placeholder image of the canvas scene, alongside an appropriately hidden `<div>` to contain the `<img>` assets which are used by the the canvas but should never appear elsewhere in the web page.

#### Advanced canvas-related functionality
Over the past few years browser developers have made excellent progress towards bringing their `<canvas>` element functionality, and support for the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), into closer alignment with the (ever evolving) [Canvas standards](https://html.spec.whatwg.org/multipage/canvas.html). 

SC, as a philosophy, tries to support (and simplify) as much of the Canvas API as it can. Making sure that SC-supported canvases can run in lesser-know parts of the web page is also of legitimate interest - with the following caveats:
+ SC actively avoids the Canvas API's [OffscreenCanvas interface](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) - SC does not work in web workers, nor are there any plans to make it work in them.
+ SC has no interest in supporting [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)- or [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)-driven canvas displays either externally, or internally within the repo code base. It can consume WebGL/WebGPU `<canvas>-based` output supplied by 3rd party code.
+ SC supports `<canvas>` elements using the [display-p3 color space](https://en.wikipedia.org/wiki/DCI-P3) when instructed to do so.
+ SC prefers to work with [SVG d path definitions](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) where possible, as they can be directly consumed by [Path2D interface objects](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) which, in turn, can be fed into the CanvasRenderingContext2D [engine.fill()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill), [engine.stroke()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke) and [engine.isPointInPath()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath) instance methods.
+ Newer CanvasRenderingContext2D functionality is preferred, once repo-devs have confidence that the functionality has support across the latest versions of browsers - except where that functionality would degrade current SC functionality:
  - `engine.setTransform(1, 0, 0, 1, 0, 0)` is (slowly) being replaced by [engine.resetTransform()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/resetTransform) through the repo code base and test demos.
  - Recent improvements to the [TextMetrics](https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics) interface have been incorporated into SC even though there remain some (annoying) differences in how browsers measure and present those values (because: text layout is hard!).
  - SC does not use the [drawFocusIfNeeded()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawFocusIfNeeded) instance method as it handles accessible graphical controls and links in a different way.
  - Recent browser work to support a wider range of [CSS color formats](https://www.w3.org/TR/css-color-4/) has actually helped to simplify the code in the SC Color factory - see the [factory/color.js](../source/factory/color.html) file.
  - The CanvasRenderingContext2D [engine.ellipse()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse) and [engine.roundRect()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect) instance methods are not supported, as SC already includes functionality to create these shapes (in a more versatile and useful way) - see the [factory/oval.js](../source/factory/oval.html) and [factory/rectangle.js](../source/factory/rectangle.html) factory files.
  - The CanvasRenderingContext2D [engine.filter](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter) property is supported, but with no great love. SC comes with its own (much better!) [filters functionality](sc-filter-engine.html).
+ SC not only supports the various CanvasAPI [CanvasGradient interface](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) methods (linear, radial, conic), it actively works to extend gradient functionality in interesting ways - for instance animating gradients, and easing linear gradients.
+ Investigate how to use an SC-managed `<canvas>` element as part of a [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) or [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) presentation - see test demos [DOM-018](../../demo/dom-018.html) and [DOM-021](../../demo/dom-021.html) respectively.
+ Investigate how to (easily) display a [Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API) media stream in an SC `<canvas>` - see test demo [DOM-019](../../demo/dom-019.html).
+ SC includes ***experimental functionality*** which attempts to emulate the functionality of the (relatively new and poorly supported) [CSS Houdini](https://developer.mozilla.org/en-US/docs/Web/API/Houdini_APIs) [Painting API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API) - see the [Snippets page](sc-snippets.html) in this Runbook for details.

#### How to test progressive enhancement locally
[TODO - write up.]

### Responsiveness
SC includes functionality to help manage three aspects of [responsive web design](https://www.smashingmagazine.com/2011/01/guidelines-for-responsive-web-design/) - in particular as it applies to the (notoriously unresponsive) `<canvas>` element:
+ **Responsive assets:** SC makes use of responsive [images](https://developer.mozilla.org/en-US/docs/Web/HTML/Responsive_images) and [videos](https://scottjehl.com/posts/using-responsive-video/) as assets for the Picture entity and Pattern style objects. See the [SC asset management and use](sc-assets.html) page in the Runbook for more information on how SC handles responsive assets.
+ **Canvas fit:** SC emulates the [CSS object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) property for `<canvas>` elements controlled by a Canvas artefact. See below for more details about Canvas fit.
+ **Artifact element shape and size:** SC includes functionality to keep track of a Canvas or Stack artefact's current shape and size within its web page environment - this is similar to the concept of [CSS containers](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) though implemented in a different way.

#### Tracking Artefact element shape and size
SC implements functionality to continually observe the dimensions of Stack and Canvas artefact elements, and gives dev-users a set of function hooks where they can implement changes to the canvas/stack display when various trigger measurements are crossed. This functionality is defined in the [mixin/display-shape.js](../source/mixin/display-shape.html) file. 

The SC implementation monitors not only for changes in size - `smallest, smaller, regular, larger, largest` - but also for changes in shape: `banner, landscape, rectangle, portrait, skyscraper`. The break points between each of these can be set by the dev-user. Test demo examples of the functionality in action include:
+ [Canvas-034](../../demo/canvas-034.html) - for Canvas artefacts
+ [DOM-016](../../demo/dom-016.html) - for Stack artefacts
+ [Modules-006](../../demo/modules-006.html) - a more complex use case (responsive scrollytelling)

**To note:** the [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API) became widely supported across browsers in mid-2020. SC currently doesn't use resize observers for this work, but probably should. TODO: investigate and (hopefully) implement.

### Perspective and 3d rotation
While any DOM block-like element can be given a [3d perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective) in which its child elements can be rotated, from an SC point of view perspective only applies to Stack artefact elements. 

Linked to perspective is the [perspective-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective-origin) attribute, which sets the position of the parent element's [vanishing point](https://en.wikipedia.org/wiki/Vanishing_point) relative to its position on the web page.

Note that SC doesn't use, or care about, [transform perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/perspective) in any of its calculations. If a dev-user tries to give an Element or Canvas artefact within a Stack a transform perspective it will be ignored as SC will overwrite the transform string to meet its own needs.

#### Euler rotation
SC measures an Element or Canvas artefact's 3d rotation relative to its Stack using [Euler angles](https://en.wikipedia.org/wiki/Euler_angles) (measured in degrees, not radians). Note that SC uses the [pitch-yaw-roll](https://simple.wikipedia.org/wiki/Pitch,_yaw,_and_roll) metaphor for describing rotations, where:
+ The `pitch` attribute describes a rotation around the display screen's horizontal (X) axis
+ The `yaw` attribute indicates a rotation around the display screen's vertical (Y) axis
+ The `roll` attribute (also used in 2d entity objects) measures rotation perpendicular to the display screen (the Z axis)

Under the hood, SC uses [quaternions](https://en.wikipedia.org/wiki/Quaternion) to store and manage artefact rotation - quaternion code can be found in the [untracked-factory/quaternion.js](../source/untracked-factory/quaternion.html) file, while the associated vector code is kept in the [untracked-factory/vector.js](../source/untracked-factory/vector.html) file.

#### Artefact offset
SC `offset` values (which are not the same as `handle` values) indicate a translation distance from an artefact or entity's ***rotation-reflection point*** - more details of which can be found in the [SC positioning system](sc-positioning.html) page of this Runbook.

All SC artefact and entity objects include an offset for the X and Y axes. Artefacts also include an `offsetZ` attribute to cover the Z axis offset. Note that unlike other offsets, the `offsetZ` value can only be an absolute Number value, not a relative String% value.

### User interaction and the `here` object
As part of artefact initialization, every Stack and Canvas object will receive a `here` object, containing the following real-time data:
```
active                    // Boolean - is the cursor over the DOM element?
baseActive                // Boolean - is cursor over Canvas's base Cell? (Canvas artefact only)
devicePixelRatio          // Number
h                         // Number - DOM element height
inViewportBase            // Number - DOM element position relative to viewport (0 - 1)
inViewportCenter          // Number - DOM element position relative to viewport (0 - 1)
inViewportTop             // Number - DOM element position relative to viewport (0 - 1)
localListener:            // Boolean - is artefact using a local listener?
normX                     // Number: x / w
normY                     // Number: y / h
offsetX                   // Number: element.left + window.pageXOffset
offsetY                   // Number: element.top + window.pageYOffset
originalHeight            // Number - height of unrotated artefact DOM element (local here only)
originalWidth             // Number - width of unrotated artefact DOM element (local here only)
prefersContrast           // Boolean - user preferences setting
prefersDarkColorScheme    // Boolean - user preferences setting
prefersForcedColors       // Boolean - user preferences setting
prefersInvertedColors     // Boolean - user preferences setting
prefersReduceData         // Boolean - user preferences setting
prefersReduceTransparency // Boolean - user preferences setting
prefersReducedMotion      // Boolean - user preferences setting
touches                   // [Array of touch x/y positions relative to DOM element top-left corner]
type                      // String - 'mouse', 'pointer', 'touch'
w                         // Number - DOM element width
x                         // Number - cursor x position relative to DOM element top-left corner
y                         // Number - cursor y position relative to DOM element top-left corner
```

#### Subscribing to `here` updates using `trackHere`
Artefact objects have to subscribe to get `here` updates; this happens internally as part of artefact instantiation. The functionality for handling the subscription process, and managing updates, happens in the [core/user-interaction.js](../source/core/user-interaction.html) file.

Whenever a Stack or Canvas artefact is instantiated, SC will automatically subscribe it to receive `here` updates.

By default SC Element artefacts do not take part in the `here` object functionality. If a dev-user ever wants an Element artefact to subscribe to `here` updates they can do so by setting the `artefact.trackHere` attribute to `'subscribe'`. Similarly to unregister any artifact, set the attribute to `''` or false.

A special case arises for tracking 3d-rotated artifact elements. The normal `here` object will update `here` values on the assumption that the artefact's DOM element has not been 3d-rotated. However, those values will be inaccurate for tracking movements over rotated elements. To solve this problem, an artefact can set their `artefact.trackHere` attribute to `'local'`. Examples of this functionality can be seen in the test demos [DOM-008](../../demo/dom-008.html) and [DOM-013](../../demo/dom-013.html).

### Setting and managing events
SC relies on regular [Javascript events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) to communicate user interactions. For convenience, SC bundles a number of closely-related mouse/touch/pointer events together to handle enter-move-down-up-leave type events across SC artefact DOM elements.

SC does not use [custom events](https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events) in the code base. Instead, SC provides dev-users with a diffuse system of function hooks which will be invoked at given points of, for example, the Display cycle.

SC also provides convenience functions for creating and removing Stack and Canvas DOM element Events. Further details can be found in the [Scrawl-canvas events and signals](sc-events-signals.html) page of this Runbook.

Examples of using events with Canvas and Stack artefacts can be found throughout the SC test demo suite. For instance, the test demos [Canvas-009](../../demo/canvas-009.html) and [DOM-006](../../demo/dom-006.html) include examples of using [Google Analytics](https://developers.google.com/analytics) to track user interactions with SC artefacts.

#### SC zone events (drag zones, keyboard zones)
SC includes functionality to apply two specific use-case scenarios to artefact object DOM elements.

First, the [drag and drop](https://en.wikipedia.org/wiki/Drag_and_drop) user interface has been a central feature of graphical UIs since the introduction of the *windows/icons/menus/pointers* (WIMP) paradigm in the early 1980s. SC implements a version of this drag-and-drop functionality through its `scrawl.makeDragZone()` factory function, defined in the [untracked-factory/drag-zone.js](../source/untracked-factory/drag-zone.html) file.

However, drag-and-drop UIs can introduce [significant accessibility issues](https://blog.logrocket.com/ux-design/drag-drop-ux-best-practices/). Thus SC also supplies [keyboard event](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) support for (Stack and) Canvas DOM elements through its `scrawl.makeKeyboardZone()` factory function, defined in the [untracked-factory/keyboard-zone.js](../source/untracked-factory/keyboard-zone.html) file.

Using these two zone event systems together dev-users, working with designers and UX experts, should be able to build their own bespoke Canvas-based user interfaces. For instance, see the proof-of-concept "studio editor" test demo [Modules-005](../../demo/modules-005.html) for one possible approach to developing such a solution.

> **tl;dr:** A number of Javascript 2D canvas libraries come with their own built-in drag-and-drop-based user interfaces where the user can click on a graphical entity to reveal an editing box with draggable handles around the entity. 
>
> ***SC deliberately does not include such a built-in solution***, on the grounds that the solutions chosen by those libraries are inherently inaccessible to people who do not use mouse/touch/pointer input mechanisms, or who interact with the canvas in a non-visual way. 
>
> Instead, SC includes the tools to create a canvas-based UI, but it is up to dev-users to build out the UI's functionality (in an accessible way!) to meet the specific needs of their own projects.

## Canvas artefact notes
SC will wrap `<canvas>` elements into Canvas artefact objects under the following conditions:
+ Any `<canvas>` element with a `data-scrawl-canvas` attribute discovered in the DOM during page initialization.
+ The dev-user adds a new `<canvas>` element to the web page using the `scrawl.addCanvas()` function.
+ The `<canvas>` element is defined as part of a component in a front end framework - React, Angular, Vue, Svelte, etc - and the component code includes an invocation to `scrawl.getCanvas('canvas-id-string')` as part of the component's mount functionality.

### Wrapping the `<canvas>` DOM element
SC makes extensive changes to the `<canvas>` DOM element as part of its wrapping functionality. ***These changes are essential as they give SC the power to make the `<canvas>` element both responsive, and more accessible.***

```
Before:                                         After:
----------------------------------------        ----------------------------------------
‹canvas                                         ‹canvas 
  id="mycanvas"                                   id="mycanvas"
  width="600"                                     width="600"
  height="400"                                    height="400"
  data-scrawl-canvas=""                           data-scrawl-canvas=""
  data-base-background-color="aliceblue"          data-base-background-color="aliceblue"
›‹/canvas›                                        data-scrawl-group="root"
                                                  style="
                                                    box-sizing: border-box;
                                                    perspective-origin: 50% 50%;
                                                    perspective: 0px;
                                                    width: 600px;
                                                    height: 400px;
                                                    transform-origin: 0px 0px 0px;
                                                    transform: translate(0px, 0px);
                                                    display: block;
                                                    z-index: 0;"
                                                  aria-labelledby="mycanvas-ARIA-label"
                                                  aria-describedby="mycanvas-ARIA-description"
                                                  title=""
                                                  role="img"
                                                  class=""
                                                ›
                                                  ‹nav
                                                    id="mycanvas-navigation"
                                                    aria-live="polite"
                                                    aria-busy="false"
                                                  ›‹/nav›
                                                  ‹div
                                                    id="mycanvas-text-hold"
                                                    aria-live="polite"
                                                    aria-busy="false"
                                                  ›‹/div›
                                                  ‹div
                                                    id="mycanvas-canvas-hold"
                                                    aria-hidden="true"
                                                    style="display: none;"
                                                  ›
                                                    ‹div
                                                      id="mycanvas-fontSizeCalculator"
                                                      aria-hidden="true"
                                                    ›‹/div›
                                                    ‹div
                                                      id="mycanvas-styles"
                                                      aria-hidden="true"
                                                    ›‹/div›
                                                  ‹/div›
                                                  ‹div
                                                    id="mycanvas-ARIA-label"
                                                    aria-live="polite"
                                                  ›mycanvas canvas element‹/div›
                                                  ‹div
                                                    id="mycanvas-ARIA-description"
                                                    aria-live="polite"
                                                  ›‹/div›
                                                ‹/canvas›
```

As SC wraps a `<canvas>` element into its artefact object, it will read and action the element's `data-` attributes:

```
<canvas> data- attribute      JS-constructor equivalent     Values
----------------------------  ----------------------------  ---------------------------------
data-base-background-color    backgroundColor               Any CSS color string
data-base-clear-alpha         clearAlpha                    'number'                 | number
data-base-height              baseHeight                    'number'                 | number
data-base-width               baseWidth                     'number'                 | number
data-canvas-color-space       canvasColorSpace              '' or 'display-p3'
data-description              description                   ARIA description
data-fit                      fit                           'cover', 'contain', 'fill', 'none'
data-is-responsive            isResponsive                  'boolean'                | boolean
data-label                    label                         ARIA label
data-will-read-frequently     willReadFrequently            'boolean'                | boolean
height                        height                        'number'                 | number
width                         width                         'number'                 | number
```

#### Accessibility
SC offers an easy way for dev-users to start making their canvases more accessible. The `label` and `description` attributes get written into `<div>` elements between the `<canvas>` element's tags, which the element then refers to through its `aria-labelledby` and `aria-describedby` attributes.

#### Responsiveness
SC will only do the work to make a `<canvas>` element responsive when the dev-user tells it to. This happens through the `isResponsive` attribute. Note that when this attribute is `true` SC will override any `width` and `height` values set on the Canvas.

Separately, every Canvas artefact, when created, generates its own `base` Cell object - a `<canvas>` element which is hidden, not added to the DOM (see the [SC scene graph](sc-groups-cells.html) page of this Runbooks for details). Dev-users can set the dimensions of this `base` Cell independently of the `<canvas>` element's dimensions using the `baseWidth` and `baseHeight` attributes.

Almost all of the painting work that SC does happens on `base` Cell objects, whose data only gets copied over to their display `<canvas>` once, at the end of each [Display cycle](sc-animation-systems.html). It is at this point that SC will attempt to fit the `base` Cell into the display `<canvas>`, emulating the CSS `object-fit` property (see below). Dev-users can set how they want the base to fit into the display using the `fit` attribute.

#### Color
To set a background color for the `base` Cell, dev-users can use the `backgroundColor` attribute. The attribute accepts any valid color string as defined in the [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) specification. 

> **tl;dr:** SC does not support [Level 5](https://www.w3.org/TR/css-color-5) relative colors, CMYK, or the CSS `color-mix()` and `contrast-color()` functions, nor are there any plans to do so at this time. Repo-devs need to keep these new and evolving specifications under review, and consider adding support for them in SC as-and-when they become better supported by browsers.

See below for how SC handles the wide-gamut `display-p3` color space.

#### Ghosting effect
SC includes functionality to display a [ghosting effect](https://brush.ninja/glossary/animation/ghosting/) in a canvas animation. The effect applies to everything moving in the animation - see test demo [Canvas-002](../../demo/canvas-002.html) for an example of the effect in action.

Dev-users can create a ghosting effect by setting the `clearAlpha` attribute - values above `0.95` usually generate a noticable effect - though the strength of the effect can vary between browsers and device screens.

Note that the effect will not work in situations where the `base` Cell also has a background color.

#### Canvas performance
In rare and specific circumstances, canvas performance may badly degrade in one particular browser compared to other browsers - see test demo [Canvas-009](../../demo/canvas-009.html) for a (fixed) example of this.

The issue (in Chrome) emerges from the interplay between small assets, entity shadows and the 2d canvas context engine's `willReadFrequently` setting. By default SC extracts all engines from `<canvas>` elements with `willReadFrequently: true`. This functionality for a given `<canvas>` element can be disabled by including the `data-will-read-frequently="false"` attribute in the element's markup. Dev-users are advised to test this solution across all browsers before committing the fix to production!

### `<canvas>` DOM elements and the wider page environment
Repo-devs have a responsibility to make sure that SC-managed `<canvas>` elements, as far as possible, behave "nicely" with the rest of the web page:
+ For some cases, this means building in functionality for handling particular user choices - for instance accommodating the capabilities of the operating system, browser and device screen the user has chosen.
+ In other cases (such as users choosing to zoom the page, or drag the browser window between screens with different capabilities) repo-devs need to make sure they check these edge cases as they work through the test demo suite.

#### Page scaling
Current accessibility guidelines suggest that when an end-user scales (zooms) a web page by up to 200%, the content of the web page should remain legible. Note that some end-users may want to scale the web page beyond 200%.

Note also that the end-user doesn't need to be disabled to want this! For instance, a web page that includes [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) functionality, where the content to be displayed fullscreen includes an SC-managed `<canvas>` element, will also zoom the canvas.

Repo-devs need to test page scaling to make sure that SC-managed `<canvas>` elements, when set up correctly, do not break the page as it scales up and down - test demo [Modules-006](../../demo/modules-006.html) is a good place to check this.

#### Screen device-pixel-ratio
The [devicePixelRatio attribute](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) (DPR) represents the resolution in physical pixels to the resolution in CSS pixels for the current display device. Browsers use the ratio internally to display crisp web pages on a range of different screens. Note that page scaling (see above) can affect the value of this attribute, though implementation details across browsers may vary.

SC includes functionality to monitor DPR, including changes to the attribute's value when, for instance, the end-user scales a browser window or drags the browser between screens with different pixel densities. This functionality is defined in the [core/user-interaction.js](../source/core/user-interaction.html) file. SC exports some funtions from that file to allow dev-users some control over how they want to manage DPR in their canvas scenes:
+ `scrawl.getPixelRatio()`
+ `scrawl.setPixelRatioChangeAction()`
+ `scrawl.getIgnorePixelRatio()`
+ `scrawl.setIgnorePixelRatio()`

Beyond that, SC mostly ignores DPR, so repo-devs shouldn't need to worry about it too much. Changes in DPR will trigger SC signalling for the Canvas artefact's associated Cell objects (via the `dirtyDimensions` flag), which in turn cascades down to graphical entitys who can then update their states to account for the new dimensions as part of the next Display cycle. 

Additional files with DPR-related functionality include:
+ [core/document.js](../source/core/document.html) - specifically the `domShow()` function
+ [factory/cell.js](../source/factory/cell.html) - only the `show()` function, and then only used in `fit: none` calculations
+ [factory/group.js](../source/factory/group.html) - as part of the Group object's `filter` functionality
+ [mixin/text.js](../source/mixin/text.html) - SC disables `engine.imageSmoothingEnabled` when it stamps text onto a Cell destined to be output on a device screen with a DPR value of `2` or above.

#### Wide-gamut color support - `display-p3`
By default `<canvas>` element 2d contenxt engines use the [`sRGB` color space](https://en.wikipedia.org/wiki/SRGB) to create and manipulate their canvas display. However modern device screens are often capable of displaying more colors than can be contained in the `sRGB` space.

[Recent work by browser-devs](https://github.com/WICG/canvas-color-space/blob/main/CanvasColorSpaceProposal.md) in this area has led to the introduction of a new [`display-p3` color space](https://en.wikipedia.org/wiki/DCI-P3). Some browsers now ship with support for the new color space in [canvas context engines](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext), including related imageData objects.

Dev-users can create SC-managed `<canvas>` elements that will support `display-p3` by:
+ Adding the `data-canvas-color-space="display-p3"` attribute to `<canvas>` elements in their HTML markup
+ Including the `canvasColorSpace: 'display-p3'` attribute in the object argument of the `scrawl.addCanvas()` factory function.

Note that setting the canvas color space can only be done once, when SC first wraps the `<canvas>` element into an artefact object; the setting cannot be changed after the artefact has been created. Also, if the color space has been set to `display-p3` but the end-user navigates to a page containing the `<canvas>` element using any browser (currently: Firefox) on any device screen (currently: older screens) that don't support the color space, SC will set up the canvas context engine to use the default `sRGB` color space.

Detecting `display-p3` color space support takes place in the [core/user-interaction.js](../source/core/user-interaction.html) file. See test demos [Canvas-055](../../demo/canvas-055.html), [Canvas-015](../../demo/canvas-015.html) and [Canvas-016](../../demo/canvas-016.html) (on supporting browsers/device screens) to see the color space in action.

#### Emulating CSS `object-fit`
In the [CSS Images Module Level 3](https://drafts.csswg.org/css-images/#the-object-fit) specification, the `object-fit` property *" specifies how the contents of a replaced element should be fitted to the box established by its used height and width."* The `<canvas>` element (according to MDN) can be treated as a [replaced element](https://developer.mozilla.org/en-US/docs/Web/CSS/Replaced_element), but only in *"specific cases"*. Thus it is up to each browser to decide whether the `object-fit` property can be applied to `<canvas>` elements.

As a result of the above, and because of the way SC works under-the-hood, SC (very loosely) emulates the CSS `object-fit` property for the `<canvas>` elements it manages. Dev-users can mark up their HTML to tell SC to fit a canvas into its parent element in a given way:

```
<div class="canvas-container">
  <canvas 
    id="mycanvas" 
    data-scrawl-canvas
    data-is-responsive="true" 
    data-base-width="1000" 
    data-base-height="1000" 
    data-fit="cover"
  ></canvas>
</div>
```

The code for managing this emulation can be found in the [factory/cell.js](../source/factory/cell.html) file - specifically the `cell.show()` function. Additional details can be found in the [Animation and the Display cycle](sc-animation-systems.html) page of this Runbook.

### Canvas `base` Cell pass-through functions
While the SC Canvas artefact wraps a `<canvas>` DOM element, hardly any graphical work happens in that canvas element. Instead, every Canvas artefact includes a Cell object - found at the `canvas.base` attribute - wrapping its own hidden `<canvas>` element which never gets added to the DOM. 

Performing (almost) all of the graphical work on this hidden canvas has significant speed advantages compared to doing that work in the visible canvas element: browsers can manage that work as they see fit rather than directly hit the DOM for every canvas manipulation update.

The Canvas artefact object affords a number of *convenience functions* to dev-users - essentially pass-through functions which take the function arguments and pass them through to the most appropriate `base` Cell object function. They also supply convenience functions for retrieving the `base` Cell object and its associated *namespace* Group object:
+ `canvas.get('baseName')` - retrieve the `base` Cell object's `name`, which is also the name used by that Cell object's *namesake* Group object (the same as `canvas?.base?.name`).
+ `canvas.get('baseGroup')` - retrieve the `base` Cell's Group object (equivalent to `canvas?.base?.group`).
+ `canvas.get('base')` and `canvas.getBase()` return the `base` Cell object (as does `canvas?.base`).
+ `canvas.getBaseHere()` returns the `base` Cell object's `here` object (as does `canvas?.base?.here`).
+ `canvas.set({backgroundColor: 'css-color-string'})` and `canvas.setBase({backgroundColor: 'css-color-string'})` both set the `base` Cell's background color.
+ More broadly, `canvas?.base?.set({key: value, ...})` and `canvas.setBase({key: value, ...})` are different ways of doing the same thing.
+ Similarly `canvas?.base?.setDelta({key: value, ...})` and `canvas.deltaSetBase({key: value, ...})` are equivalent.

## Stack artefact notes
SC will wrap DOM elements into Stack artefact objects under the following conditions:
+ Any element with a `display: block;` CSS property which has a `data-scrawl-stack` attribute discovered in the DOM during page initialization.
+ The dev-user adds a new Stack to the web page using the `scrawl.addStack()` function.
+ The Stack element is defined as part of a component in a front end framework - React, Angular, Vue, Svelte, etc - and the component code includes an invocation to `scrawl.getStack('stack-id-string')` as part of the component's mount functionality.

### Wrapping the Stack artefact's DOM element
SC makes extensive changes to DOM Stack elements as it wraps them. The purpose of this is to make it easier to position and animate the (absolutely positioned) direct child elements included in the Stack - which is achieved using standard inline CSS styling.

```
Before:                                         After:
----------------------------------------        ----------------------------------------
<div                                            <div 
  id="mystack"                                    id="mystack"
  data-scrawl-stack=""                            data-scrawl-stack=""
>                                                 data-scrawl-group="root"
  [... direct child elements ...]                 style="
</div>                                              box-sizing: border-box;
                                                    perspective-origin: 50% 50%;
                                                    perspective: 1200px;
                                                    position: relative;
                                                    width: 500px;
                                                    height: 500px;
                                                    transform-origin: 0px 0px 0px;
                                                    transform: translate(0px, 0px);
                                                    display: block;
                                                    z-index: 0;"
                                                  class=""
                                                >
                                                  [... direct child elements ...]

                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 0%; left: 0%;"
                                                  ></div>
                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 0%; left: 100%;"
                                                  ></div>
                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 100%; left: 100%;"
                                                  ></div>
                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 100%; left: 0%;"
                                                  ></div>
                                                </div>
```

### Stack and Element corners
SC adds a set of four zero-dimension `<div>` elements to every Stack and Element artefact's DOM element. This was originally done so that SC could keep track of the absolute coordinates for each artefact's corners, from which a [Path2D interface object](https://developer.mozilla.org/en-US/docs/Web/API/Path2D) can be constructed and then used as part of the SC hit detection functionality. Using this approach means that SC does not need to add event listeners to every DOM element it controls to handle, for instance, DOM element drag-and-drop interactions.

Later on, SC added functionality to allow these corner `<div>` elements to act as additional pivot points for other artefacts and entitys to use as part of their positioning functionality. Test demo [DOM-015](../../demo/dom-015.html) shows this functionality in action with a 3d-rotated Element artefact.

The functionality for corners management can be found in the [mixin/dom.js](../source/mixin/dom.html) file. Note that Canvas artefacts are unable to use this functionality.

## Element artefact notes
SC will wrap DOM elements into Element artefact objects under the following conditions:
+ The element is a direct child of a Stack element, discovered during page initialization.
+ The dev-user adds a new Stack containing direct child elements to the web page using the `scrawl.addStack()` function.
+ The element is a direct child of a Stack element defined in a component in a front end framework - React, Angular, Vue, Svelte, etc - and the component code includes an invocation to `scrawl.getStack('stack-id-string')` as part of the component's mount functionality.
+ The dev-user invokes the `stack.addExistingDomElements('CSS-search-string')` function in their code. This moves existing DOM elements into the Stack, wrapping them in Element artefact objects. Note that these DOM elements will initially be positioned in the top-left corner of the Stack; it is up to the dev-user to find (using `scrawl.findElement('element-id-string')`) and set (using `element.set({key: value, ...})`) them as needed after the import completes.
+ The dev-user invokes the `stack.addNewElement({key: value, ...})` function to create a new element in the Stack. See test demo [DOM-003](../../demo/dom-003.html) for an example of this functionality in action.

Note that Element artefact objects can be cloned using the `element.clone({key: value, ...})` function. This cloning functionality will also create a clone of the object's DOM element. See test demo [DOM-004](../../demo/dom-004.html). The cloning functionality is defined in the [mixin/base.js](../source/mixin/base.html) file.

### Wrapping the Element artefact's DOM element
As part of this wrapping process, elements will become [absolutely positioned](https://developer.mozilla.org/en-US/docs/Web/CSS/position) within their (relatively positioned) Stack element. During initialization SC will make its best effort to replicate the element's position within the Stack before wrapping commenced - but this cannot be guaranteed.

Other than positioning considerations, the mutations made to the direct child elements of a Stack element are similar to the changes made to the Stack element itself as it is wrapped - including the addition of **corner divs**:
```
Before:                                         After:
----------------------------------------        ----------------------------------------
<p id="myelement">                              <p
  This element can be positioned                  id="myelement"
  within the stack element                        class=""
  using Scrawl-canvas positioning;                style="
                                                    box-sizing: border-box;
  [... unwrapped child elements ...]                position: absolute;
</p>                                                width: 250px;
                                                    height: 250px;
                                                    transform-origin: 125px 125px 0px;
                                                    transform: 
                                                      translate(125px, 125px)
                                                      rotate3d(0.189308, 0.268536, 0.0381346, 0.674221rad);
                                                    display: block;
                                                    z-index: 0;"
                                                >
                                                  This element can be positioned 
                                                  within the stack element
                                                  using Scrawl-canvas positioning

                                                  [... unwrapped child elements ...]

                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 0%; left: 0%;"
                                                  ></div>
                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 0%; left: 100%;
                                                  "></div>
                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 100%; left: 100%;"
                                                  ></div>
                                                  <div
                                                    data-scrawl-corner-div="sc"
                                                    aria-hidden="true"
                                                    style="
                                                      width: 0px; height: 0px; position: absolute;
                                                      margin: 0px; border: 0px; padding: 0px;
                                                      top: 100%; left: 0%;
                                                  "></div>
                                                </p>
```

