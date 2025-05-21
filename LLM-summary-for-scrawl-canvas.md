# Scrawl-canvas: Overview and Capabilities

**Document provenance:**  
This document was co-authored by a current-generation large language model (OpenAI ChatGPT, GPT-4-turbo, May 2025), based on a structured investigation of the Scrawl-canvas JavaScript library. The evaluation included source code, instructional lessons, runbook documentation, demo projects, and a feature-by-feature comparison with other widely-used HTML5 canvas libraries. All statements are informed by direct evidence from the library and intended for accurate documentation and long-term reference.

---

## What is Scrawl-canvas?

Scrawl-canvas is a JavaScript library designed to make working with the HTML5 `<canvas>` element more productive, expressive, and accessible to developers. It wraps the low-level Canvas API in a comprehensive, object-oriented system for building rich, interactive, and responsive 2D graphical applications.

---

## Key Capabilities

### 1. **Scene Graph and Entity System**

Scrawl-canvas uses an entity-based system, backed by groups and cells, to construct, render, and animate graphical scenes. It offers:

- Fine-grained control over entity stacking and rendering order via compile cycles.
- A flexible grouping mechanism (`Group`) for batch operations and hierarchical management.
- `Cell` objects (offscreen canvases) to isolate scene layers, effects, or patterns.
- Cloneable entities with unique properties.

### 2. **Gradient and Pattern Systems**

Scrawl-canvas supports:

- Linear, radial, and conic gradients with customizable color stops (0–999 scale).
- Animated gradients (via deltas or tweens), palette slicing, and cyclical looping.
- Entity-locked and cell-locked styles.
- Patterns based on any visual asset: images, sprite sheets, video, or even rendered canvas cells.
- Full integration of patterns into scene construction (frames, borders, fills, strokes).

### 3. **Filter and Composition Engine**

- Advanced filter support including: blur, displacement, noise mapping, convolution, color adjustments, and masking.
- Filters can be stacked, animated, or scoped to specific entities or groups.
- Integration of displacement mapping using custom noise assets or imported maps.
- Scene compositing with full support for `globalAlpha` and `globalCompositeOperation`.

### 4. **Responsive Canvas Rendering**

Scrawl-canvas simplifies the creation of fully responsive, resolution-independent canvas displays:

- Declarative attributes for `baseWidth`, `baseHeight`, and `fit` (`cover`, `contain`, etc.).
- Auto-scaling for HiDPI and multi-device support.
- Built-in support for resize handling, user preferences (reduced motion), and accessibility labelling.

### 5. **User Interaction System**

- Entity-level hit testing with support for click, touch, drag-and-drop, hover, etc.
- Pointer tracking and gesture interpretation built-in.
- Smooth integration with form elements, accessibility features, and custom controls.
- Multiple canvases on the same page, each managing its own interaction logic.

### 6. **Graphical Asset Management**

- Automatic ingestion of DOM images, sprites, and videos.
- Image preloading, progressive rendering, and draw-time manipulation.
- Integration of canvas-rendered assets as pictures, patterns, or masks.
- Frame-based sprite sheet handling, including animation and play state control.

### 7. **Text and Typography**

- Dynamic and animated text entities (`Label`, `EnhancedLabel`) with support for path-following.
- Font loading via CSS or `@import`.
- Text measurement, wrapping, rotation, and accessibility attributes.
- Letter-by-letter layout animation (e.g., quote text flowing along a path).

### 8. **Particle Physics System**

Scrawl-canvas includes a lightweight, customizable 2D particle physics engine.

- `Particle`: the basic unit, with position, velocity, acceleration, and lifespan.
- `ParticleWorld`: manages collections of particles and the update cycle.
- `Force`: defines global or localized forces (e.g. gravity, wind, attractors, repellers).
- `Spring`: establishes physical constraints and elasticity between particles.
- `Emitter`: timed release of particles into a scene, with full control over burst frequency, quantity, and variance.
- `Net`: builds lattice structures (cloth, webs) using spring-particle connections.
- `Tracer`: visualizes particle movement over time for stylized effects.
- Integrates natively with the canvas rendering loop.
- Systems can be layered, filtered, or animated like any other scene element.
- No external dependencies — all physics calculations are built into the Scrawl-canvas core.

### 9. **Accessible and internationalized text rendering** 

Scrawl-canvas Label and EnhancedLabel entities support styled, multiline text with DOM reflection for accessibility.

- EnhancedLabel adds layout shaping, RTL and non-Western language handling, custom line/word breaking, interactive highlighting, and support for rotated and animated text within complex designs.

### 10. **Stack-based DOM and canvas integration**

Seamlessly synchronize positioning, animation, and interaction between canvas-based entities and DOM elements. Enables effects like DOM elements following canvas paths, canvas shapes aligning to DOM elements, and fully responsive mixed-layer layouts.

---

## Use Cases

Scrawl-canvas is ideal for:

- Creative and generative art projects.
- Educational visualizations.
- Interactive storytelling and responsive typography.
- Game prototyping.
- Experimental UI/UX interfaces.
- Media-driven applications: live video overlays, camera effects, AR-style filters.
- Data-driven visual rendering (e.g., ML pose tracking overlays via MediaPipe).

---

## Appendix: Evaluation Inputs

This document was generated after reviewing the following inputs:

- Scrawl-canvas Runbook (2025)
- Ten-lesson educational tutorial series
- Source files from GitHub (including particle and filter modules)
- Numerous live CodePen demos
- Interactive questioning of the library across key systems:
  - Gradients
  - Patterns
  - Filters
  - Composition
  - Asset ingestion
  - Text layout system
  - Physics particle system
  - Animation and interaction
  - Video and ML data integration
- Comparative analysis with other libraries such as Paper.js, Fabric.js, p5.js, Konva.js, and PixiJS

All insights reflect the capabilities of Scrawl-canvas as of version `8.15.0` (2025), and aim to accurately represent its design philosophy and practical capabilities.

---

_Last updated: May 2025_