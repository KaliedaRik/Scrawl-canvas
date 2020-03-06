# Scrawl-canvas - specification and architecture

The following is an attempt to lay out our aims and objectives for the Scrawl-canvas library, and detail the architecture of the system.

Scrawl-canvas is a __client-side__ Javascript library, written entirely as ECMAScript 6 (ES6) Javascript modules. It loads into a web page when it is __imported__ into a __module &lt;script> element__ (or a file loaded as the source of the script element).

    <!DOCTYPE html>
    <html>

    <head>
        <title>Scrawl-canvas Hello World</title>
    </head>

    <body>
        
        <canvas id="mycanvas"></canvas>

        <script type="module">

            import scrawl from '../source/scrawl.js';

            let canvas = scrawl.library.artefact.mycanvas;

            scrawl.makePhrase({

                name: 'hello',
                text: 'Hello, World!',

                width: '100%',

                startX: 20,
                startY: 20,

                font: 'bold 40px Garamond, serif',
            });

            canvas.render()
            .catch(err => {});

        </script>

    </body>
    </html>

## System overview

The objective for Scrawl-canvas is to integrate the HTML5 &lt;canvas> element into web pages so that they become:

#### Responsive

+ A canvas will resize automatically in line with its environment, with no degradation of its graphical display - this is important because HTML5 canvas elements are added to a web page with fixed, pixel-denominated dimensions set directly on the element as attributes; attempting to resize the canvas using CSS leads to graphic distortions (stretching, pixellization, etc).

+ Discrete graphical components of the display - lines, boxes, text, images, etc (collectively known as __entitys__ in Scrawl-canvas nomenclature) will maintain their positioning and dimensions as the canvas they are drawn on changes its dimensions.

#### Interactive

+ A canvas will accurately maintain and report of the mouse cursor's position over its region, making user interaction with the canvas easier to code.

+ Canvas entitys (the spelling of the plural form of 'entity' is deliberate) will include functionality and state to allow them to react to mouse movements (CSS hover state) and act as hyperlinks (like HTML &lt;a> anchor elements in text, or the oldschool image maps defined using &lt;img>, &lt;map> and &lt;area> elements) - and do this accurately regardless of the dimensions of their canvas.

+ Entitys will also include event hooks which allows user interactions with them (and the wider Scrawl-canvas system) to be recorded through various third-party tracking and analytics libraries.

#### Accessible

+ Text added to a canvas will be replicated in the web document to make it accessible to site visitors using assistive technologies.

+ Descriptions of the graphical representaion of the canvas element will also be made accessible (using ARIA), and can be updated dynamically in response to, for instance, animation progression or user interactions.

+ Hyperlinks supported by entitys will also be accessible, for instance through keyboard tabbing.

#### Efficient

+ Scrawl-canvas animations will be (relatively) simple to set up and control. Animations can be made system-efficient so that they only run when the canvas is visible in the browser/device viewport.

+ Scrawl-canvas has a tweening system which includes built-in timelines and action points, and which can be run both temporally (over a given time period) and spatially (for example in response to user interaction with a range tool, or the canvas progression through the viewport). In addition to built-in easing functions, developers can add their own functions to tweens.

+ All animation code - tween cycles and the canvas __display cycle__ - is asynchronous (using Promises) and tied tightly to the browser's RequestAnimationFrame functionality.

+ Engine-intensive code - such as building offscreen canvases or starting new web workers - uses pools to minimise the impact on the browser's engine.

+ Canvas filter calculations are all handled in web workers to keep the main Javascript thread free for animation and user interaction. in addition to the built-in filters, developers can easily add in their own, bespoke filter functions.

#### Adaptable



#### Component-friendly



#### Integrated



## Developer objectives

Scrawl-canvas is aimed at front-end developers, who work to realise the dreams and irrealities of clients and designers and, at the same time, deliver projects that provide a good, stable experience to the website's visitors and customers.

For developers to feel confident that they can use Scrawl-canvas as part of a project's build, they need to know that:

+ The library's code base is solid, with minimal impact on other parts of the build.
+ The coding experience is consistent - for instance, factory arguments all follow the same pattern - and (relatively) easy to learn.
+ The canvases produced by the code run efficiently in the browser with every attempt made to minimize impact on the surrounding website's performance, and on the host machine's hardware.

#### Developers need to be aware that:

+ __Scrawl-canvas makes no attempt to support legacy browsers__ - the code base makes heavy use of functionality introduced by the ECMAScript 6 (ES6) Javascript standard (in particular modules, promises, web workers, modern Array functionality, etc)

+ The library code __will not work on the back-end__; it expects to find the _window_ object in its environment, which isn't found in backend systems such as Node.js

+ The library __loads into the web page as a module script__, which (probably) makes Scrawl-canvas incompatible with any development toolchain code bundlers (Webpack, Parcel, Rollup, etc) that load their bundled Javascript code into a web page using a normal &lt;script> element.

+ Scrawl-canvas __may break toolchain bundlers__ - for instance it won't work with Packet because that bundler chokes on import.meta.url.

### Consistent coding experience

Scrawl-canvas adopts some semantic and syntactical concepts and applies them across the board (as far as possible):

+ __Factory functions__ are used to create everything used in a Scrawl-canvas display. All factory functions follow the naming convention ".makeSomething({key:val})" - makeBlock, makeSpiral, makePicture, makeGradient, makeTween, makeAnimation, makeDragZone, makeRender, etc.

+ __Artefacts__ represent objects in the display which can be positioned, manipulated and animated. Artefacts are not limited to canvas graphics objects like a box or a circle ('entitys'); they also include DOM element wrappers ('stack', 'canvas', 'element').

+ __Styles__ represent different ways of filling and stroking entity artefacts. They include linear and radial gradients, image-based patterns, and color generators.

+ __Assets__ are wrappers for images, animated sprites and videos which get consumed by both 'picture' entitys and 'pattern' styles.

+ __Animations__ - including __tweens__ - come with factory functions which make their asynchronous nature easy to code with, and easy to manipulate after creation (run, halt, kill, etc). The 'makeRender' factory produces an animation which is aware of its positioning so it will halt automatically when its canvas (or stack) no longer appears in the browser's viewport

+ __Groups__ gather artefacts together and can have multiple uses (display, collision detection, etc). An artefact can belong to more than one group! Much of the basic group management stuff has been automated so developers do not have to worry about creating and using groups until they have a need for something beyond displaying stuff on a web page.

Once the Scrawl-canvas object is created, it can be easily updated using __set__ and __setDelta__ functions which accept a single object argument, using the same attributes, as used by the factory functions:

    import scrawl from './path/to/scrawl.js'

    // Use factory function to create and position a block entity
    let box = scrawl.makeBlock({

        name: 'my-box',

        startX: 10,
        startY: 10,

        width: 100,
        height: 50,

        fillStyle: 'red',
    });

    // Update our entity
    box.set({
        startX: '30%',
        startY: 'center',
    });


#### Generating Scrawl-canvas objects

As mentioned above, all Scrawl-canvas objects can be generated using various __factory functions__. But having to build every object takes a developer time and effort, so Scrawl-canvas offers ways to make this work easier.

+ Most Scrawl-canvas objects can be __cloned__, with the cloned object having exactly the same attributes as the original. If the clone function is supplied with a data argument - myArtefact.clone({key, value, key:value}) - then the clone will update its attributes with the new data.

+ Cloning allows us to build an object (artefact, tween, etc) and then use it as a __template__ from which new objects can be cloned whenever required.

+ We can also build (or update) Scrawl-canvas objects from text snippets called __packets__. These small JSON files can be kept in, and retrieved from, the web page itself (using various methods), or fetched from a server as-and-when needed.

+ Scrawl-canvas __components__ go further. These are small files of Scrawl-canvas code which can be imported and applied to any DOM element. Components add a small, interactive canvas to the element, alongside everything required to display additional graphics-based animations to the element's normal user interaction experience (changes on hovers, clicks, scrolling, etc).

    import scrawl from './path/to/scrawl.js';
    let artefacts = scrawl.library.artefact;

    // Use factory function to create and position a block entity
    scrawl.makeBlock({

        name: 'box-1',

        width: 100,
        height: 50,

        startX: 10,
        startY: 10,

        fillStyle: 'red',

    // Use first entity as a template, from which we can clone new entitys
    // - the clone's dimensions and startX values will be the same as the original's values
    // - the clone's name, startY and fillStyle values will change as part of the cloning process
    }).clone({

        name: 'box-2',
        startY: 60,
        fillStyle: 'blue',
    });

    // Update the first artefact's values using a text packet
    // - changes get applied as part of the importPacket function
    // - changes will not affect the second artefact's values
    artefacts['box-1'].importPacket('./path/to/packet.txt');

#### Positioning artefacts

HTML5 canvases are programmable bitmap images. Much (most!) of that programming is about positioning a cursor on the canvas (using pixel coordinates) and then telling it where to move (more positioning, more coordinates) so that lines and fills can be drawn on the canvas.

If the canvas display is static, this can be done once. If any part of the canvas is animated, then the drawing has to happen repeatedly - 60 times a second for a smooth animation in a modern browser.

__Scrawl-canvas makes positioning artefacts as simple and as painless as possible__ for the developer: 

+ An artefact can be positioned __absolutely__, using the canvas like a grid or map coordinate system. This is often good enough if the developer knows that the display they are building will always retain the same dimension ... but Scrawl-canvas puts a lot of effort into making canvases responsive, updating their dimensions in line with changes in the host web page's dimensions (such as when a user turns their device and the page responds by reflowing from portrait to landscape)

+ Thus artefacts can also be positioned __relatively__, defining their position on the canvas in percentage values of the canvas's current dimensions. When the canvas dimensions change, relatively positioned artefacts will automatically adjust and update their coordinates.

Even with relative positioning, if a canvas display includes many artefacts the developer still has to do a lot of work to set up the initial positions. And an animated scene often involves moving artefacts across the canvas in various interesting ways. Scrawl-canvas can simplify this too, using __reference__ positioning:

+ An artefact can be positioned - __pivoted__ - with reference to another artefact's position coordinates. When the reference artefact updates its position, so will all the artefacts using it as their pivot.

+ Artefact __mimicking__ is an extension of the pivot concept, allowing an artifact to automatically copy and use the rotational, dimensional and various other values of the artefact it mimics.

+ Artefacts can be given __paths__ - supplied by Shape entitys - along which they can position themselves. They can also be animated along the path. When the Shape path changes its own position - because Shape entitys can pivot on, and mimic, other artefacts (and position their various path control points using other paths!) - all artefacts using the path will automatically update their positions ... even if the changes happen while the artefact is animating along the path.

+ Finally, an artefact can be instructed to use the mouse/touch cursor as the source of its positioning data.

To complete the positioning system, an artefact's positioning coordinate can be split so that, for example, its x coordinate tracks the mouse cursor's x coordinate, while its y coordinate follows a path.

This means, in practice, that a canvas display can be built using a few key artefacts to position all the other artefacts in the display, making the whole system easier to manage, update and animate. We can even use DOM elements as pivot sources to position artefacts on the canvas.

[more stuff here]


## Scrawl-canvas architecture

#### The Scrawl.js import cascade

For non-prototype functions and variables defined in other files (in case developers wonder where a function or variable comes from):

    ./scrawl.js

        ./core/animationloop.js
            ./core/library.js

        ./core/document.js
            ./core/library.js
            ./core/utilities.js
            ./factory/animation.js
            ./factory/canvas.js
            ./factory/element.js
            ./factory/stack.js
            ./factory/unstackedElement.js

        ./core/library.js
            [none]

        ./core/userInteraction.js
            ./core/document.js
            ./core/library.js
            ./core/utilities.js
            ./factory/animation.js

        ./factory/action.js
            ./core/library.js
            ./core/utilities.js

        ./factory/animation.js
            ./core/animationloop.js
            ./core/library.js
            ./core/utilities.js

        ./factory/block.js
            ./core/library.js
            ./core/utilities.js

        ./factory/cell.js
            ./core/document.js
            ./core/library.js
            ./core/utilities.js
            ./factory/coordinate.js
            ./factory/filter.js
            ./factory/group.js
            ./factory/imageAsset.js
            ./factory/state.js

        ./factory/color.js
            ./core/library.js
            ./core/utilities.js

        ./factory/coordinate.js
            ./core/library.js
            ./core/utilities.js

        ./factory/filter.js
            ./core/library.js
            ./core/utilities.js

        ./factory/gradient.js
            ./core/library.js

        ./factory/grid.js
            ./core/library.js
            ./core/utilities.js
            ./factory/cell.js';

        ./factory/group.js
            ./core/library.js
            ./core/utilities.js
            ./factory/cell.js
            ./factory/filter.js
            ./factory/imageAsset.js

        ./factory/imageAsset.js
            ./core/library.js
            ./core/utilities.js

        ./factory/loom.js
            ./core/document.js
            ./core/library.js
            ./core/utilities.js
            ./factory/cell.js
            ./factory/state.js

        ./factory/pattern.js
            ./core/library.js
            ./core/utilities.js

        ./factory/phrase.js
            ./core/document.js
            ./core/library.js
            ./core/utilities.js
            ./factory/cell.js
            ./factory/fontAttributes.js

        ./factory/picture.js
            ./core/library.js
            ./core/utilities.js
            ./factory/coordinate.js
            ./factory/imageAsset.js
            ./factory/videoAsset.js

        ./factory/quaternion.js
            ./core/library.js
            ./core/utilities.js
            ./factory/vector.js';

        ./factory/radialGradient.js
            ./core/library.js
            ./core/utilities.js

        ./factory/shape.js
            ./core/library.js
            ./core/utilities.js
            ./factory/coordinate.js
            ./factory/vector.js

        ./factory/spriteAsset.js
            ./core/library.js
            ./core/utilities.js

        ./factory/ticker.js
            ./core/library.js
            ./core/utilities.js
            ./factory/animation.js

        ./factory/tween.js
            ./core/library.js
            ./core/utilities.js
            ./factory/ticker.js

        ./factory/userObject.js
            ./core/library.js
            ./core/utilities.js

        ./factory/vector.js
            ./core/library.js
            ./core/utilities.js

        ./factory/videoAsset.js
            ./core/library.js
            ./core/utilities.js

        ./factory/wheel.js
            ./core/library.js
            ./core/utilities.js

The following factories are NOT imported into the scrawl.js file:

    ./factory/anchor.js
        ./core/document.js
        ./core/library.js
        ./core/utilities.js';

    ./factory/canvas.js
        ./core/document.js
        ./core/library.js
        ./core/userInteraction.js
        ./core/utilities.js
        ./factory/cell.js
        ./factory/coordinate.js
        ./factory/state.js

    ./factory/element.js
        ./core/library.js
        ./core/userInteraction.js
        ./core/utilities.js
        ./factory/canvas.js

    ./factory/fontAttributes.js
        ./core/library.js
        ./core/utilities.js
        ./factory/cell.js

    ./factory/palette.js
        ./core/library.js
        ./core/utilities.js
        ./factory/color.js

    ./factory/stack.js
        ./core/document.js
        ./core/library.js
        ./core/userInteraction.js
        ./core/utilities.js
        ./factory/coordinate.js
        ./factory/element.js
        ./factory/group.js

    ./factory/state.js
        ./core/library.js
        ./core/utilities.js

    ./factory/unstackedElement.js
        ./core/library.js
        ./core/userInteraction.js
        ./core/utilities.js
        ./factory/canvas.js';


#### Building the factory functions' prototype objects

Prototype functions and variables for each factory instance are created using mixins. The order in which the mixins are applied is important!

    ./factory/action.js
        ./mixin/base.js
        ./mixin/tween.js

    ./factory/anchor.js
        ./mixin/base.js

    ./factory/animation.js
        ./mixin/base.js

    ./factory/block.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/entity.js
        ./mixin/filter.js';

    ./factory/canvas.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/dom.js

    ./factory/cell.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/cascade.js
        ./mixin/asset.js
        ./mixin/filter.js

    ./factory/color.js
        ./mixin/base.js

    ./factory/coordinate.js
        [none]

    ./factory/element.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/dom.js

    ./factory/filter.js
        ./mixin/base.js

    ./factory/fontAttributes.js
        ./mixin/base.js

    ./factory/gradient.js
        ./mixin/base.js
        ./mixin/styles.js

    ./factory/grid.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/entity.js
        ./mixin/filter.js

    ./factory/group.js
        ./mixin/base.js
        ./mixin/filter.js

    ./factory/imageAsset.js
        ./mixin/base.js
        ./mixin/asset.js

    ./factory/loom.js
        ./mixin/base.js
        ./mixin/anchor.js
        ./mixin/filter.js

    ./factory/palette.js
        ./mixin/base.js

    ./factory/pattern.js
        ./mixin/base.js
        ./mixin/assetConsumer.js

    ./factory/phrase.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/entity.js
        ./mixin/filter.js

    ./factory/picture.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/entity.js
        ./mixin/assetConsumer.js
        ./mixin/filter.js

    ./factory/quaternion.js
        [none]

    ./factory/radialGradient.js
        ./mixin/base.js
        ./mixin/styles.js

    ./factory/shape.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/entity.js
        ./mixin/filter.js
        ./mixin/shapePathCalculation.js

    ./factory/spriteAsset.js
        ./mixin/base.js
        ./mixin/asset.js

    ./factory/stack.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/cascade.js
        ./mixin/dom.js

    ./factory/state.js
        ./mixin/base.js

    ./factory/ticker.js
        ./mixin/base.js

    ./factory/tween.js
        ./mixin/base.js
        ./mixin/tween.js

    ./factory/unstackedElement.js
        ./mixin/base.js

    ./factory/userObject.js
        [none]

    ./factory/vector.js
        [none]

    ./factory/videoAsset.js
        ./mixin/base.js
        ./mixin/asset.js

    ./factory/wheel.js
        ./mixin/base.js
        ./mixin/position.js
        ./mixin/anchor.js
        ./mixin/entity.js
        ./mixin/filter.js

#### Exported Scrawl-canvas functions

    library

    // factory functions
    makeAction,
    makeAnimation,
    makeBezier,
    makeBlock,
    makeBoxedShape,
    makeColor,
    makeFilter,
    makeGradient,
    makeGrid,
    makeGroup,
    makeImageAsset,
    makeLine,
    makeLoom,
    makeOval,
    makePattern,
    makePhrase,
    makePicture,
    makePolygon,
    makePolyline,
    makeQuadratic,
    makeRadialGradient,
    makeRadialShape,
    makeRectangle,
    makeShape,
    makeSpiral,
    makeStar,
    makeTetragon,
    makeTicker,
    makeTween,
    makeUserObject,
    makeVideoAsset,
    makeWheel,

    // asset loaders
    createImageFromCell,
    createImageFromEntity,
    createImageFromGroup,
    importDomImage,
    importDomVideo,
    importImage,
    importMediaStream,
    importSprite,
    importVideo,

    // display cycle and animation
    clear,
    compile,
    makeAnimationObserver,
    makeRender,
    render,
    show,

    // useful functions
    addCanvas,
    addListener,
    addNativeListener,
    addStack,
    makeComponent,
    makeDragZone,
    observeAndUpdate,
    removeListener,
    removeNativeListener,
    setCurrentCanvas,

    // pool-related functions
    checkCoordinate,
    checkQuaternion,
    checkVector,
    coordinatePoolLength,
    quaternionPoolLength,
    releaseCoordinate,
    releaseQuaternion,
    releaseVector,
    requestCoordinate, 
    requestQuaternion, 
    requestVector, 
    vectorPoolLength,

    // other miscellaneous functions
    applyCoreMoveListener,
    applyCoreResizeListener,
    applyCoreScrollListener,
    cellPoolLength,
    currentCorePosition,
    generatedPoolCanvases,
    startCoreAnimationLoop, 
    startCoreListeners,
    stopCoreAnimationLoop,
    stopCoreListeners,

