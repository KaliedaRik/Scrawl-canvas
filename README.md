# SCRAWL-CANVAS Library 
Version 8.0.0 - 5 April 2020

Scrawl-canvas website: https://scrawl.rikweb.org.uk

#### What?
Scrawl-canvas is a JavaScript library for working with the HTML5 &lt;canvas> element. The library:
+ Automatically discovers existing &lt;canvas> elements in a web page.
+ Can add new &lt;canvas> elements to the web page.
+ Defines a set of factory functions for creating a wide range of graphic artefacts and effects, which can be drawn on a canvas.
+ Includes an adaptable - yet easy to use - protocol for positioning, displaying and animating artefacts and effects across the canvas.
+ Adds functionality to make &lt;canvas> elements responsive, adapting their size according to their surrounding environment.
+ Makes the canvas both accessible, and interactive - including the ability to easily track user interactions with artifacts.

#### Why?
There are a number of other Javascript libraries available, each with their streangths and weaknesses. Some have been designed to make the production of charts and other data visualisations easier. Some focus on game development. Libraries which attempt to emulate Flash/Actionscript animations have been developed, as have libraries whose aim is to combine 2D, 3D and even SVG graphics into a usable whole. Speed is a key goal for some of the best libraries, while ease-of-use is an objective for many others.

Working with the native Canvas API is hard work - particularly when the desired result is more complex than a couple of coloured boxes in a static display. 

But the benefits of using canvases for graphical displays and animations are also great: canvases are part of the DOM (unlike Flash); they are natively wired for events and user interactions; they use immediate mode redering (which makes them very quick); and the canvas-related APIs are designed to be used with Javascript.

Yet these advantages are also significant barriers:
+ Working directly with the canvas-related APIs leads to writing significant amounts of JS boilerplate code.
+ &lt;canvas> elements can be resized and styled using CSS, but changing the CSS size does not affect the element's drawing dimensions - leading to sub-optimal graphic displays.
+ Events work on the canvas, not on the artefacts within the canvas - we cannot use artefacts as links or hot-spots (click/tap events), we cannot give them the equivalent of a CSS hover state (focus/blur events), we cannot drag-and-drop them around the display (move events).
+ Tracking a user's interaction with the various parts of a canvas display is particularly difficult.
+ We cannot save and share artefacts; each canvas display is tightly coupled to the code that defines the display.
+ __Of most concern__, canvases are entirely graphical - visual - by nature; they come with __significant accessibility issues__. Given the ever-stricter requirements for websites to be accessible to all users, this makes using a canvas to present important information a dangerous proposition.

#### Scrawl-canvas overcomes these barriers
Yes, Scrawl-canvas aims to be fast, and developer-friendly. It also aims to be broadly focussed, suitable for building infographics, games, interactive videos - whatever we can imagine for a 2D graphical presentation.

But __the main purpose of Scrawl-canvas__ is to make the &lt;canvas> element, and the parts that make up its displays and animations, __responsive, interactive, linkable, trackable. And accessible!__ 

## Installation and use

There are two main ways to include Scrawl-canvas in your project:

#### Download, unpack, use

1. Download the files from this link: [scrawl.rikweb.org.uk/downloads/scrawl-canvas_8-0-0.zip](https://scrawl.rikweb.org.uk/downloads/scrawl-canvas_8-0-0.zip). 
2. Unzip the files to a folder in your project. 
3. Import the library into the script code where you will be using it.

```
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

        <!-- Get a handle to the canvas element -->
        let canvas = scrawl.library.canvas.mycanvas;

        <!-- Setup the scene to be displayed in the canvas -->
        scrawl.makePhrase({

            name: 'hello',
            text: 'Hello, World!',

            width: '100%',

            startX: 20,
            startY: 20,

            font: 'bold 40px Garamond, serif',
        });

        <!-- Render the canvas scene once -->
        canvas.render()
        .catch(err => {});

    </script>

</body>
</html>
```

#### NPM/Yarn
This approach is still experimental. Add the library to a React/Vue/Svelte/etc project at your own risk - your mileage may vary!

1. Add the library to your project using NPM or Yarn
2. Import the library into the script code where you will be using it.

```
// either
npm install scrawl-canvas

// or
yarn add scrawl-canvas

// then in your script file
import scrawl from 'scrawl-canvas';
```

## Local development and testing
After downloading the library and unzipping it into a directory or folder, cd into that folder on the command line and start a local server. For instance if you have `http-server` installed:

```
$> cd ./path/to/Scrawl-canvas
$> http-server

Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.0.4:8080
Hit CTRL-C to stop the server
```

Navigate to http://localhost:8080 to access the documentation and demo tests.

#### Testing
The code base does not include any ___unit testing___ frameworks. Instead, we rely on a set of Demo tests which allow us to perform ___integration testing___ and ___user interface testing___.

Why this approach? Because most of the Scrawl-canvas functionality revolves around various forms of animation, which requires visual inspection of the Demo tests to check that the canvas display - and thus, by inference, the underlying code - performs as expected.

Most Demos include some form of user interaction, which allows us to test specific aspects of the code base.

#### Documentation
The source code has been extensively commented. We generate documentation from that code using [Docco](http://ashkenas.com/docco/) - which has not been included in the GitHub repository and thus needs to be installed separately if you want to regenerate the documentation after making local changes to the source base.

#### Minification
We minify the source code using a small shell script, nothing more. Code added to a project using NMP or Yarn will import the minified code by default.

#### Development team
Developed by Rik Roots: rik.roots@rikworks.co.uk

__Do you want to contribute?__ I've been developing this project for too long by myself, and would really welcome contributions from - even collaboration with - people who can bring a different perspective and a fresh set of eyes to the work.

