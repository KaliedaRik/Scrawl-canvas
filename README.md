# Welcome to the Scrawl-canvas Library
Version: `8.6.3 - 14 Nov 2021` 

Scrawl-canvas website: [scrawl-v8.rikweb.org.uk](https://scrawl-v8.rikweb.org.uk).

__Do you want to contribute?__ Don't be afraid - reach out and let's see what magic we can create together!

[![Rate on Openbase](https://badges.openbase.io/js/rating/scrawl-canvas.svg)](https://openbase.io/js/scrawl-canvas?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge)

### What?
Scrawl-canvas is a Javascript library for working with the HTML5 &lt;canvas> element. The library:
+ Defines a set of factory functions for creating a wide range of graphic artefacts and effects, which can be drawn on a canvas.
+ Includes an adaptable - yet easy to use - protocol for positioning, displaying and animating artefacts and effects across the canvas.
+ Adds functionality to make &lt;canvas> elements `responsive`, adapting their size to their surrounding environment while remaining fully `interactive`.
+ Helps make canvas elements more `accessible` for both keyboard and AT users.

https://user-images.githubusercontent.com/5357530/141673995-df239c38-2ba1-43f3-831c-b655524f2f40.mp4

### Why?
Working with the native Canvas API is hard work - particularly when the desired result is more complex than a couple of coloured boxes in a static display. 

But the benefits of using canvases for graphical displays and animations are also great: 
+ Canvases are part of the DOM (unlike Flash); 
+ They are natively wired for events and user interactions; 
+ They use immediate mode redering (which makes them very quick); and 
+ The canvas-related APIs are designed to be used with Javascript.

___Sadly these advantages are also significant barriers:___
+ Working directly with the canvas-related APIs means writing significant amounts of Javascript boilerplate code.
+ &lt;canvas> elements can be resized and styled using CSS, but changing the CSS size does not affect the element's drawing dimensions - leading to ugly results.
+ Events work on the canvas, not on the graphical objects within the canvas - we cannot use those objects as links or hot-spots (click/tap events), we cannot give them the equivalent of a CSS hover state (focus/blur events), we cannot drag-and-drop them around the display (move events).
+ Tracking a user's interaction with the various parts of a canvas display is particularly difficult.
+ We cannot easily save and share displays, effects and animations; each &lt;canvas> element's output is tightly coupled to the code that defines that output.
+ __Of most concern__, canvases are entirely graphical - visual - by nature; they come with __significant accessibility issues__. Given the ever-stricter requirements for websites to be accessible to all users, this makes using a canvas to present important information a dangerous proposition.

### Scrawl-canvas overcomes these barriers
Scrawl-canvas is fast, and developer-friendly. It's suitable for building infographics, games, interactive videos - whatever we can imagine for a 2D graphical presentation. And it is modular - we can break the code for a particular effect into its own module file which can be reused in other projects.

Scrawl-canvas offers all of this while never losing its hard focus on making the &lt;canvas> element `accessible, responsive and fully interactive` while at the same time offering a `pleasant developer experience`. 

Scrawl-canvas is fun to work with!

## Installation and use

There are three main ways to include Scrawl-canvas in your project:

### Download, unpack, use

1. Download the zipped file from GitHub
2. Unzip the file to a folder in your project. 
3. Import the library into the script code where you will be using it.

Alternatively, a zip package of the v8.6.3 files can be downloaded from this link: [scrawl.rikweb.org.uk/downloads/scrawl-canvas_8-6-3.zip](https://scrawl.rikweb.org.uk/downloads/scrawl-canvas_8-6-3.zip) - that package only includes the minified file.

```html
<!-- Hello world -->
<!DOCTYPE html>
<html>
<head>
    <title>Scrawl-canvas Hello World</title>
</head>
<body>
    
    <canvas id="mycanvas"></canvas>

    <!-- The library is entirely modular and needs to be imported into a module script -->
    <script type="module">

        import scrawl from './relative-or-absolute/path/to/scrawl-canvas/min/scrawl.js';

        // Get a handle to the canvas element
        let canvas = scrawl.library.canvas.mycanvas;

        // Setup the scene to be displayed in the canvas
        scrawl.makePhrase({

            name: 'hello',
            text: 'Hello, World!',

            width: '100%',

            startX: 20,
            startY: 20,

            font: 'bold 40px Garamond, serif',
        });

        // Render the canvas scene once
        canvas.render();

    </script>

</body>
</html>
```

### CDN - unpkg.com
This will pull the requested npm package directly into your web page:
```html
<script type="module">
    import scrawl from 'https://unpkg.com/scrawl-canvas@8.6.3';
    [...]
</script>
```

### NPM/Yarn
1. Add the library to your project using NPM or Yarn
2. Import the library into the script code where you will be using it.

```
// either
$> npm install scrawl-canvas

// or
$> yarn add scrawl-canvas

// then in your script file
import scrawl from 'scrawl-canvas';

// Scrawl-canvas has no dependencies
// - it can be used as-is, with no further installation steps required
```

## Local development and testing
After forking this repo down to your local machine, `cd` into the scrawl-canvas folder, run `yarn install` or `npm install` (for the local build toolchain - the library itself has no external dependencies) and start a local server. For instance if you have [light-server](https://github.com/txchen/light-server) installed:

```sh
$> cd ./path/to/Scrawl-canvas
$> yarn install
$> light-server --serve . --open

light-server is listening at http://0.0.0.0:4000
  serving static dir: .
```

### Code visualisation
![Visualization of the codebase](./diagram.svg)

### Testing
The code base does not include any ___unit testing___ frameworks. Instead, we rely on a set of Demo tests which allow us to perform ___integration testing___ and ___user interface testing___.

Why this approach? Because most of the Scrawl-canvas functionality revolves around various forms of animation, which requires visual inspection of the Demo tests to check that the canvas display - and thus, by inference, the underlying code - performs as expected.

Most Demos include some form of user interaction, which allows us to test specific aspects of the code base.

### Documentation
The source code has been extensively commented. We generate documentation from that code using [Docco](http://ashkenas.com/docco/). Documentation is regenerated each time the library is rebuilt.

### Minification
We minify the source code using [rollup](https://rollupjs.org/guide/en/) and its [terser](https://terser.org/) [plugin](https://www.npmjs.com/package/rollup-plugin-terser).

### Building the library

Running the following command on the command line will recreate the minified file, and regenerate the documentation:

```sh
$> yarn build
```


### Development team
Developed by Rik Roots: rik.roots@rikworks.co.uk
