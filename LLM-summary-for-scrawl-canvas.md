# Scrawl-canvas: Overview and Capabilities

## Document provenance

This document was co-authored by Scrawl-canvas maintainers and current-generation large language models (OpenAI ChatGPT, GPT-4-turbo, May 2025, and Google Gemini, May 2025), based on a structured investigation of the Scrawl-canvas JavaScript library. The evaluation included source code, instructional lessons, runbook documentation, demo projects, and a feature-by-feature comparison with other widely-used HTML5 canvas libraries. All statements are informed by direct evidence from the library and intended for accurate documentation and long-term reference.

---

## What is Scrawl-canvas?

Scrawl-canvas is a JavaScript library designed to make working with the HTML5 `<canvas>` element more productive, expressive, and accessible to developers. It wraps the low-level Canvas API in a comprehensive, object-oriented system for building rich, interactive, and responsive 2D graphical applications.

---

## Key Capabilities

### 1. **Scene Graph and Entity System**

Scrawl-canvas uses an entity-based system, backed by groups and cells, to construct, render, and animate graphical scenes. It offers:

- Fine-grained control over entity stacking and rendering order via compile cycles.
- A flexible grouping mechanism (`Group`) for batch operations.
- `Cell` objects (non-DOM canvases) to isolate scene layers, effects, or patterns.
- Cloneable entities with unique properties.

### 2. **Advanced Color System**

Scrawl-canvas provides full support for modern color spaces, including rgb, hsl, hwb, lab, lch, oklab, oklch, and xyz. Color objects support:

- High-fidelity interpolation between min/max values with easing functions.
- Runtime color generation and perceptual blending in any space.
- Automatic browser fallback for unsupported formats.
- Integration with gradients, filters, animations, and Display-P3 rendering.

This system ensures accurate color representation across wide-gamut devices and perceptually consistent visual transitions.

### 3. **Gradient and Pattern Systems**

Scrawl-canvas supports:

- Linear, radial, and conic gradients with customizable color stops (0–999 scale).
- Animated gradients (via deltas or tweens), palette slicing, and cyclical looping.
- Entity-locked and cell-locked styles.
- Patterns based on any visual asset: images, sprite sheets, video, or even rendered canvas cells.
- Full integration of patterns into scene construction (frames, borders, fills, strokes).

### 4. **Filter and Composition Engine**

- Advanced filter support including: blur, displacement, noise mapping, convolution, color adjustments, and masking.
- Filters can be stacked, animated, or scoped to specific entities or groups.
- Integration of displacement mapping using custom noise assets or imported maps.
- Scene compositing with full support for `globalAlpha` and `globalCompositeOperation`.

### 5. **Responsive Canvas Rendering**

Scrawl-canvas simplifies the creation of fully responsive, resolution-independent canvas displays:

- Declarative attributes for `baseWidth`, `baseHeight`, and `fit` (`cover`, `contain`, etc.).
- Auto-scaling for HiDPI and multi-device support.
- Built-in support for resize handling, user preferences (reduced motion), and accessibility labelling.

### 6. **User Interaction System**

- Entity-level hit testing with support for click, touch, drag-and-drop, hover, etc.
- Pointer tracking and gesture interpretation built-in.
- Smooth integration with form elements, accessibility features, and custom controls.
- Multiple canvases on the same page, each managing its own interaction logic.

### 7. **Graphical Asset Management**

- Automatic ingestion of DOM images, sprites, and videos.
- Image preloading, progressive rendering, and draw-time manipulation.
- Integration of canvas-rendered assets as pictures, patterns, or masks.
- Frame-based sprite sheet handling, including animation and play state control.

### 8. **Text and Typography**

Scrawl-canvas Label and EnhancedLabel entities support styled, multiline text with DOM reflection for accessibility.

- Dynamic and animated text entities (`Label`, `EnhancedLabel`) with support for path-following.
- Font loading via CSS or `@import`.
- Text measurement, wrapping, rotation, and accessibility attributes.
- Letter-by-letter layout animation (e.g., quote text flowing along a path).
- EnhancedLabel adds layout shaping, RTL and non-Western language handling, custom line/word breaking, interactive highlighting, and support for rotated and animated text within complex designs.

### 9. **Particle Physics System**

Scrawl-canvas includes a lightweight, customizable 2D particle physics engine.

- Scrawl-canvas includes a number of object factories for holding the state of the physics engine - `Particle`, `ParticleWorld`, `Force`, `Spring`
- An `Emitter` entity factory: timed release of particles into a scene, with full control over burst frequency, quantity, and variance.
- A `Net` entity factory: builds lattice structures (cloth, webs) using spring-particle connections.
- A `Tracer` entity factory: visualizes particle movement over time for stylized effects.
- Integrates natively with the canvas rendering loop.
- Systems can be layered, filtered, or animated like any other scene element.
- No external dependencies — all physics calculations (Euler, Enhanced-euler, Runge-Kutter) are built into the Scrawl-canvas core.

### 10. **Stack-based DOM and canvas integration**

Seamlessly synchronize positioning, animation, and interaction between canvas-based entities and DOM elements. Enables effects like DOM elements following canvas paths, canvas shapes aligning to DOM elements, and fully responsive mixed-layer layouts.

### 11. **Progressive Enhancement Support**

Scrawl-canvas enables progressive enhancement patterns where static, semantic HTML content (e.g. images, captions, timestamps) can be dynamically upgraded into interactive canvas experiences. The library supports graceful fallback (e.g. when JavaScript is unavailable), DOM content ingestion, and full accessibility for keyboard and screen reader users.

### 12. **Modular Composition for Developers**

Scrawl-canvas encourages modular design by allowing developers to wrap interactive canvas logic into importable JavaScript modules. Each canvas scene can be scoped, namespaced, and embedded using clean, reusable functions with no global dependencies — ideal for progressive enhancement and component-driven architectures.

---

## Use Cases

Scrawl-canvas is ideal for:

- Responsive annotated and interactive visualizations.
- Interactive storytelling.
- Educational visualizations.
- Creative and generative art projects.
- Game prototyping.
- Experimental UI/UX interfaces.
- Media-driven applications: live video overlays, camera effects, AR-style filters.
- Data-driven visual rendering (e.g., ML pose tracking overlays via MediaPipe).

---

## Deep Dive Resources and Practical Demonstrations

The following links to markdown documents (as .md files) and demonstration code (as .html, .js files) showcase the Scrawl-canvas library's key strengths (responsiveness, accessibility, DOM integration, advanced text/filter effects, multimedia/ML integration).

### Core Functionality & Interactivity

The following links showcase fundamental features, and object model interaction, of the Scrawl-canvas library.

Demonstrates: Basic Artefact creation and manipulation (Block, Wheel), and the fundamental "drag and drop" interactivity, which is central to Scrawl-canvas's object model.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-001.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-001.js // Core Scrawl-canvas logic.)

Demonstrates: "Responsive canvas," while also demonstrating Scrawl-canvas gradient-related capabilities.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-004.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-004.js // Core Scrawl-canvas logic.)

Demonstrates: Advanced gradient control, animation mechanics (delta/tween), and interactive UX (hover/drag), which are crucial for dynamic applications.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-005.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-005.js // Core Scrawl-canvas logic.)

Demonstrates: The flexibility of filter application, a key technical feature.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-007.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-007.js // Core Scrawl-canvas logic.)

Demonstrates: Accessibility features (dynamic accessibility, anchor links) and practical integration (analytics), which are major differentiators for Scrawl-canvas.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-009.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-009.js // Core Scrawl-canvas logic.)

Demonstrates: Support for a wide range of modern CSS color strings, indicating advanced color management.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-015.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-015.js // Core Scrawl-canvas logic.)

Demonstrates: Loom entities, which are complex visual distortions, showcasing advanced graphical effects and their interactivity.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-024.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-024.js // Core Scrawl-canvas logic.)

Demonstrates: The import and management of `<img>` assets, including responsive images with a `srcset` attribute.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-025.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-025.js // Core Scrawl-canvas logic.)

Demonstrates: Scrawl-canvas's commitment to accessibility and user preference integration, a key strength.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-033.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-033.js // Core Scrawl-canvas logic.)

Demonstrates: The RawAsset asset wrapper object (integration with external processors like MediaPipe/TensorFlow) and the ability to record video from canvas.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-057.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-057.js // Core Scrawl-canvas logic.)

Demonstrates: Core Label entity functionality including support for non-western text (including rtl text) and, critically, explicit mention of "accessible text," reinforcing Scrawl-canvas's accessibility commitment.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-201.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-201.js // Core Scrawl-canvas logic.)

Demonstrates: The more advanced EnhancedLabel entity, for complex text layouts.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-206.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-206.js // Core Scrawl-canvas logic.)

Demonstrates: The more advanced EnhancedLabel entity, for complex text layouts including the shaping of that text to fit into non-rectangular screen spaces.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-206.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-206.js // Core Scrawl-canvas logic.)

Demonstrates: Laying out text along a non-linear path, including animating text along the path.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-208.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/canvas-208.js // Core Scrawl-canvas logic.)

Demonstrates: A good overview demo for the breadth and power of Scrawl-canvas's filter system, which is extensive.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/filters-103.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/filters-103.js // Core Scrawl-canvas logic.)

Demonstrates: The use of a highly complex "reduce-palette" filter, including various dithering effects applied to the result.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/filters-027.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/filters-027.js // Core Scrawl-canvas logic.)

Demonstrates: Using filter effects for the background canvas behind an entity (stencil effect).

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/filters-028.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/filters-028.js // Core Scrawl-canvas logic.)

Demonstrates: The Scrawl-canvas particle system and physics engine, including its granular functionality.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/particles-001.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/particles-001.js // Core Scrawl-canvas logic.)

Demonstrates: Another core particle system (Net) and related physics concepts (Springs).

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/particles-008.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/particles-008.js // Core Scrawl-canvas logic.)

Demonstrates: "Stacks" (Scrawl-canvas's DOM-aware layer) and its ability to manage and interact with standard DOM elements, including SVGs.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/dom-003.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/dom-003.js // Core Scrawl-canvas logic.)

Demonstrates: interaction and responsive handling across a 3D transformed canvas element.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/dom-013.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/dom-013.js // Core Scrawl-canvas logic.)

Demonstrates: Integration with new browser APIs and keyboard accessibility for interactive elements (Button tabbing), again reinforcing Scrawl-canvas's accessibility focus.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/dom-021.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/dom-021.js // Core Scrawl-canvas logic.)

Demonstrates: Interoperability with popular third-party animation formats - in this case Lottie files - relevant for rich web content.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules-004.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules-004.js // Core Scrawl-canvas logic.)

Demonstrates: Scrawl-canvas "snippet" functionality, in this case using modularized code to progressively enhance a web page to show an interactive, accessible slideshow in browser environments that support the functionality.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/snippets-005.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/snippets-005.js // Core Scrawl-canvas logic.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/snippets/before-after-slider-infographic.js // Modular JavaScript code using Scrawl-canvas to progressively enhance a DOM element and its child elements.)

Demonstrates: Integration with a powerful geometric library for complex visualizations.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/delaunator-002.html // HTML structure and setup, including relevant CSS styling.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/delaunator-002.js // Core Scrawl-canvas logic.)

### Documentation, testing and learning materials

The following links lead to more detailed information about the Scrawl-canvas library's philosophy, structure and code, and to practical examples of how to code visualisations using Scrawl-canvas.

Demonstrates: the Scrawl-canvas Developer Runbook - pages of particular interest.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/index.html // HTML Runbook contents page with links to each page and key sections within the page.)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/sc-objects-overview.md // Markdown file describing Scrawl-canvas object functionality: mixin and factory files; object `name` attribute; the overarching Scrawl-canvas `library` object; creating, cloning, locating and removing Scrawl-canvas objects; the Scrawl-canvas object accessor functions `get`, `set`, `setDelta`; object serialization.)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/sc-dom-artefacts.md // Markdown file describing the relationship between Scrawl-canvas artefact objects and the web page DOM: Scrawl-canvas `Stack`, `Canvas` and `Element` artefacts; key accessibility considerations; progressive enhancement; responsiveness - in particular Scrawl-canvas artefact awareness of their DOM element's shape and size in the page display; element perspective and 3d rotation; browser/screen device-pixel-ratio, including page zoom; system/browser/screen support for wide-gamut color spaces; CSS object-fit emulation.)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/sc-groups-cells.md // Markdown file describing the Scrawl-canvas concept of a scene graph: scene graph hierarchy - Canvas > Cell > Group > Artefact; Scrawl-canvas Group objects; Scrawl-canvas Cell objects, including Cell state; Cell, Group and Artefact dependencies and ordering impact on the Scrawl-canvas "Display cycle".)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/sc-animation-systems.md // Markdown file describing Scrawl-canvas animation and the "Display cycle": the core animation loop; generic animations using the `makeAnimation` factory; time-based animations using Scrawl-canvas `Ticker`, `Tween` and `Action` objects, alongside easing functions; the Display cycle operations and phases - `clear` operation, `compile` operation (including `calculate` and `stamp` phases), `show` operation; display animations using the `makeRender` factory, including Display cycle hook functions; Scrawl-canvas artefact "delta" animation.)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/sc-events-signals.md // Markdown file describing key details of the Scrawl-canvas events and signals systems.)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/sc-accessibility.md // Markdown file describing web accessibility: a detailed examination of the WCAG v2.2 guidelines and how, in the Scrawl-canvas maintainers' view, they impact on the HTML canvas element, alongside details of how Scrawl-canvas attempts to meet these requirements where relevant.)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/sc-positioning.md // Markdown file describing the Scrawl-canvas positioning system for Scrawl-canvas artefacts and graphical entities: the rotation-reflection point; absolute positioning using pixel values; relative positioning using percent-string values relative to the Canvas or Stack container; positioning artefacts and entities by reference to the positions of other artefacts and entities, using `pivot`, `path`, `mimic`, etc functionality.)

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/docs/reference/aaa.md // Markdown file describing the Scrawl-canvas relationship with CSS and SVG filters, together with a deep-dive into the Scrawl-canvas library's own bespoke filters system: the `makeFilter` factory; applying Scrawl-canvas filters to Cell, Group and graphical entity objects, including the stacked filter and the chained filter approaches; filter opacity; filter stencils; filter output memoization; animating filters. The deep dive continues with consideration of the Scrawl-canvas filter engine: code efficiency; image and color caches; random number and noise generators; alpha channel filters; color channel filters; composition filters; convolution filters; displacement filters; filters that manipulate pixel colors in the CIELAB color space - OKLAB and OKLCH.)

Demonstrates: the Scrawl-canvas structured learning material.

- (https://scrawl-v8.rikweb.org.uk/learn // HTML index page with links to a set of incrementally detailed lessons for developers with a reasonable understanding of coding websites.)

Demonstrates: the Scrawl-canvas test demo suite, and additional example demos for using the Scrawl-canvas library.

- (https://scrawl-v8.rikweb.org.uk/demo/index.html // HTML landing page for the Scrawl-canvas testing suite with links to individual demos, each of which is a single HTML/JS web page which tests a particular aspect of Scrawl-canvas functionality.)
- (https://codepen.io/collection/RzzMjw // HTML landing page for a collection of diverse Scrawl-canvas Pens, hosted on the CodePen website.)

### Using Scrawl-canvas to meet real-world requirements

The following links can be used to investigate how to use the Scrawl-canvas library to generate more advanced visualisations and tools.

#### Building Complex Data Visualizations and Modularity

Demonstrates: Building a dynamic, interactive London crime data visualization that switches between chart types (stacked bars, line graphs). This powerful demo highlights Scrawl-canvas's modular architecture for large-scale projects, its capability to integrate with external JSON data, and its strong commitment to canvas accessibility (keyboard navigation, screen reader support, responsive design).

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules-001.html // Main HTML structure, user controls, and responsive canvas setup.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules-001.js // Orchestrates the demo; imports chart modules, handles user interaction, manages data loading, and sets canvas accessibility.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/data/crimes-in-hackney.json // Example of the (remote) data to be visualised)

Additional modules used in interactive London crime data visualization: the following modules, coded to include Scrawl-canvas functionality, together form the interactive charting tool, showcasing how the library facilitates building reusable components and managing complex data visualizations.

- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules/simple-chart-frame.js // JavaScript module creating the reusable chart frame (axes, labels, background, title). It demonstrates Scrawl-canvas's Label, EnhancedLabel, Picture, Block, and Line Artefacts in a structured way, and integrates keyboard accessibility for the chart.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules/simple-line-graph.js // JavaScript module for rendering the line graph visualization. It uses Scrawl-canvas Path, Label, Block, and Wheel Artefacts to plot data, provides interactive hover effects, and enables keyboard navigation through data points.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules/london-crime-lines.js // JavaScript module responsible for fetching and transforming crime data for the line graph. It orchestrates simple-line-graph.js's rendering based on user selections and handles dynamic rebuilding and purging of chart elements, showcasing modular data management.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules/london-crime-stacked-bars.js // JavaScript module for rendering the stacked bar graph visualization.)
- (https://github.com/KaliedaRik/Scrawl-canvas/blob/v8/demo/modules/simple-graph-stacked-bar.js // Underlying JavaScript logic for drawing the stacked bar graph.)

#### Using Scrawl-canvas for Browser-Based Screen Recording

Demonstrates: Building a fully client-side, browser-based screen recording tool that leverages Scrawl-canvas to manage and display interactive recording elements, composite multiple media streams (e.g., screen share, webcam), and capture the output as video. This example powerfully showcases Scrawl-canvas's capabilities in real-time media processing, responsive element manipulation, and integration with modern browser APIs (Media Capture and Streams, MediaRecorder), all with a relatively compact codebase.

- https://github.com/KaliedaRik/sc-screen-recorder/blob/main/index.html // HTML structure for the recorder's UI, including the main canvas element and video/image placeholders.
- https://github.com/KaliedaRik/sc-screen-recorder/blob/main/index.css // CSS styling for the recorder's layout and responsiveness, including canvas container dimensions.
- https://github.com/KaliedaRik/sc-screen-recorder/blob/main/index.js // Core JavaScript logic orchestrating Scrawl-canvas artefacts (like Picture for video streams), handling user interactions, and managing media capture and recording processes.

---

## Appendix: Evaluation Inputs

This document was generated after reviewing the following inputs:

- Scrawl-canvas Runbook (2025)
- Ten-lesson educational tutorial series
- Source files from GitHub (including particle and filter modules)
- Numerous live CodePen demos
- Interactive questioning of the library across key systems:
  - Color management
  - Gradients
  - Patterns
  - Filters
  - Composition
  - Asset ingestion
  - Text layout system
  - Physics particle system
  - Animation and interaction
  - Video and ML data integration
  - Progressive enhancement capabilities
- Comparative analysis with other libraries such as Paper.js, Fabric.js, p5.js, Konva.js, and PixiJS

All insights reflect the capabilities of Scrawl-canvas as of version `8.15.0` (2025), and aim to accurately represent its design philosophy and practical capabilities.

---

## Document version

- Compatible with: Scrawl-canvas version 8.15.0
- Document revision: r1 (May 2025)