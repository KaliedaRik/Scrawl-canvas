# Scrawl-canvas artefacts and the DOM
[The `<canvas>` element](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element) has been part of HTML since the introduction of HTML5. It provides scripts with a resolution-dependent bitmap canvas, which can be used for rendering graphs, game graphics, art, or other visual images in real time.

Canvas scripts are written in Javascript using the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), and added to the HTML markup in `<script>` elements. It's fair to say that the Canvas API is generally low-level and not dev-user-friendly - its purpose is to render [immediate-mode graphics](https://learn.microsoft.com/en-us/windows/win32/learnwin32/retained-mode-versus-immediate-mode) into the bitmap supplied by the `<canvas>` element.

The Scrawl-canvas code stands between the `<canvas>` element and the Canvas API. The repo introduces a [scene graph](https://en.wikipedia.org/wiki/Scene_graph) which dev-users can use to build a **retained-mode graphics** canvas display.

> **tl;dr:** Scrawl-canvas has been designed to work **WITH** the [web page](https://developer.mozilla.org/en-US/docs/Web/HTML) (HTML, CSS) and its [Document Object Model](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) (DOM). ***It has not been designed to replace it!***

Given the above, there are some things repo-devs need to keep in mind when devloping and maintaining SC:
+ A web page may include many `<canvas>` elements, but it is not the job of SC to manage them all. SC only manages those canvases that it has been asked to manage - either by including the `data-scrawl-canvas` attribute in the `<canvas>` element's markup, or when instructed to do so using the `scrawl.addCanvas()` or `scrawl.getCanvas()` functions. See the test demos [DOM-012](../demo/dom-012.html), [DOM-014](../../demo/dom-014.html) and [DOM-017](../demo/dom-017.html) for examples.
+ When instructed to do so, SC will wrap (multiple) `<canvas>` elements in SC Canvas artefact objects. Part of the wrapping process involves mutating the `<canvas>` element's markup and contents so that SC can better manage it. **All SC-mediated DOM mutations must happen only to the elements that SC has wrapped, and should not spread beyond those elements!**
+ It is a fact of life that CSS markup and the `<canvas>` element don't play nicely together. Also the `<canvas>` element is barely [responsive](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design), and hostile to [accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility). It is up to SC to manage these difficult relationships to ease the dev-user's burden as much as possible - though there are actions the dev-user can take when building a canvas display to make things even easier.
+ Wherever possible, SC should leverage CSS and the DOM to Get Things Done. This includes such things as: using `<canvas>` element `data-` attributes for passing information into the SC system; using DOM markup (`<img>`, `<video>` elements) to define properly responsive assets for use by Picture entitys and Pattern styles; leveraging CSS for styling EnhancedLabel text layout and styling functionality; updating the wrapped `<canvas>` element's inline CSS style attribute for positioning withing an SC stack; etc.
+ SC needs to support `<canvas>` elements which appear in less expected parts of the web page - for instance the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) and the [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).
+ **Accessibility is paramount!** SC needs to support accessibility-related settings that an end-user sets on their device, and at the same time make it as easy as possible for the dev-user to code the functionality to respect those settings, and respond appropriately to any changes the end-user may make to them while the canvas display is running on the page.
+ **Responsiveness is hard!** SC has a responsibility to the dev-user to make coding responsive canvas displays as easy as possible. This means, in practice, giving the SC canvas wrapper object state to: understand the capabilities of the device on which the browser is displaying; know where the `<canvas>` element sits in relation to the browser's viewport; keep track of its current shape and size; and sufficient functionality to react to changes in this environmental state.

Much of the code that handles DOM-related interactions and manipulations can be found in various mixins - in particular:
+ [mixin/cascade.js](../source/mixin/cascade.html) - for managing groups
+ [mixin/display-shape.js](../source/mixin/display-shape.html) - for handling element shape and size state, and changes to that state
+ [mixin/dom.js](../source/mixin/dom.html) - interacting with, and responding to changes in, the DOM environment
+ [mixin/mimic.js](../source/mixin/mimic.html) - to manage positioning by reference functionality
+ [mixin/path.js](../source/mixin/path.html) - to manage positioning along a path functionality
+ [mixin/pivot.js](../source/mixin/pivot.html) - to manage positioning by reference functionality
+ [mixin/position.js](../source/mixin/position.html) - to manage relative and absolute positioning  functionality

## Scrawl-canvas stacks
The key purpose of SC is to position graphical entitys onto a `<canvas>` element, in a given order, so that those entitys build some form of graphical representation, chart, imagery, infographic, artwork (etc) that can be displayed as part of a web page. More information can be found in the [positioning system page](sc-positioning.html) in the Runbook.

**SC extends this positioning system to the DOM.** Any element that displays as a [block-level box](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_and_inline_layout_in_normal_flow) (CSS: `display: block`) can be included in the SC ecosystem to act as a space in the web page where that element's direct child elements can be positioned, manipulated and animated using SC functionality.

### A brief history of SC Stacks
SC Stacks started as a concept to position DOM elements - in particular elements that could be used to control canvas displays and animations - directly over a `<canvas>` element. 

This was necessary because the normal way of positioning such elements over a parent element (that is: mark the parent as `position: relative` and the child as `position: absolute`) does not work with `<canvas>` elements. Instead, dev-users would have to place the `<canvas>` element in a containing element (usually a `<div>` element) and mark that container as relatively positioned, with the canvas and any other direct child elements becoming absolutely positioned.

From that initial idea, it was only a short conceptual step to get SC to manage child element positions in the same way as it already managed graphical entity positioning in the canvas display - using absolute and relative start coordinates, positioning by reference to other artifacts, etc.

SC Stacks also offered repo-devs an easy way to introduce functionality to the canvas display which the Canvas API did not (and still doesn't) offer: [perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective). Rather than engage in complex mathematics to mimic the appearance of perspective in a canvas scene, dev-users could instead rotate the `<canvas>` element in 3d space to quickly achieve the same effect. See test demos [DOM-013](../../demo/dom-013.html) and [DOM-015](../../demo/dom-015.html) for examples of this functionality in action.

Today SC Stacks are tightly integrated into the SC ecosystem. Stacks, like Canvas wrappers, take part in the [SC Display cycle](sc-animation-systems.html) and use the same functionality to add [SC event listeners](sc-events-signals.html) to their DOM elements. And an SC Stack's direct child elements get wrapped into SC artefact objects (called Element) and tracked in the SC library just like graphical entity objects.

## Wrapping DOM elements into SC artefact objects
SC directly manipulates and manages certain types of DOM element on the web page. To do this, it has to wrap the affected DOM elements into **artefact objects**. This happens when:
+ Any `<canvas>` element with a `data-scrawl-canvas` attribute is found in the DOM during page initialization; that element will be wrapped in an SC `Canvas` object.
+ Any element with a `display: block;` CSS property which has a `data-scrawl-stack` attribute is found in the DOM, again during page initialization; such elements will be wrapped in an SC `Stack` object.
+ The dev-user adds a new canvas to the web page using the `scrawl.addCanvas()` function.
+ The dev-user adds a new stack to the web page using the `scrawl.addStack()` function.
+ The canvas or stack element is defined as part of a component in a front end framework - React, Angular, Vue, Svelte, etc - and the component code includes an invocation to `scrawl.getCanvas('canvas-id-string')` and/or  `scrawl.getStack('stack-id-string')` as part of the component's mount functionality.

Note that all direct child elements of a wrapped `Stack` object will be wrapped in SC `Element` objects - except for `<canvas>` elements (see above) - at the same time as the stack element gets wrapped.

## Canvas and Stack shared functionality
Need to talk about (in no particular order:
+ CSS and dimensions
+ Responding to changes in dimension and size
+ Perspective
+ 3d rotation - `pitch`, `yaw`, `roll`
+ Tracking mouse/touch/pointer events - and the `here` object
+ Accessibility - responding to user preferences settings and updates
+ Keyboard/tab navigation 
+ Events
+ Other CSS and classes
+ Groups and the cascade as part of the Display cycle

## Additional Canvas artefact notes

### Changes made to the `<canvas>` DOM element as SC wraps it
SC makes extensive changes to the `<canvas>` DOM element as part of its wrapping functionality. **These changes are essential as they give SC the power to make the `<canvas>` element both responsive, and more accessible.**
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
                                                    -webkit-font-smoothing: auto;"
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

## Additional Stack artefact notes

### Changes made to a typical DOM stack element as SC wraps it
SC makes extensive changes to DOM stack elements as it wraps them. The purpose of this is to make it easier to position and animate the (absolutely positioned) direct child elements included in the stack - which is achieved using standard inline CSS styling.

SC also adds **corner divs** inside the DOM element, which can then be used across the SC ecosystem for reference positioning other artefacts and entitys:
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
                                                    -webkit-font-smoothing: auto;"
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

## Element artefact notes

### Changes made to a DOM direct child element discovered in a stack element
When SC wraps a stack element, it will also wrap all of the direct child elements of that stack element. As part of this process, each child element will become [absolutely positioned](https://developer.mozilla.org/en-US/docs/Web/CSS/position) within the (relatively positioned) stack element. SC will make its best effort to replicate the element's position within the SC Stack before wrapping commenced - but this cannot be guaranteed.

Other than positioning considerations, the mutations made to the direct child elements of a stack element are similar to the changes made to the stack element itself as it is wrapped - including the addition of **corner divs**:
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
                                                    -webkit-font-smoothing: auto;"
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

