# Scrawl-canvas accessibility
The responsibility for [making web pages accessible](https://www.w3.org/WAI/fundamentals/accessibility-intro/) lies with the dev-user, working closely with the page designer and product manager. If the page design calls for the use of `<canvas>` elements, then SC can help deliver a more accessible solution for those canvases.

We can break down the accessibility issues that need to be addressed as follows:
+ Respect, and adapt to, [user preference media features](https://www.smashingmagazine.com/2023/08/css-accessibility-inclusion-user-choice/)
  - prefers-contrast
  - prefers-reduced-motion
  - prefers-color-scheme
  - prefers-reduced-transparency
  - prefers-reduced-data
  - forced-colors (not yet handled by SC)
  - inverted-colors (not yet handled by SC)
+ Include readable markup and details about the canvas scene - `role`, `aria-label`, `aria-description`, etc
+ Add clearly visible accessible (tab-able) controls to start/stop stack and canvas display animations
+ Include controls in canvas displays for accessible (tab-able) navigation links and other user interactions with the canvas
+ Expose canvas-based graphical text to the DOM - in a sensible and meaningful way - that doesn't annoy the end-users who have to consume that information
+ Allow less common patterns for user interactions with graphical links (as far as possible) such as right-clicking on them or dragging them to the browser address bar to open the new page

