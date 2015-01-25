YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Action",
        "Animation",
        "Base",
        "Block",
        "BlurFilter",
        "BrightnessFilter",
        "Cell",
        "ChannelStepFilter",
        "ChannelsFilter",
        "Color",
        "Context",
        "Design",
        "Element",
        "ElementGroup",
        "Entity",
        "Filter",
        "Force",
        "Gradient",
        "GreyscaleFilter",
        "Group",
        "Image",
        "InvertFilter",
        "LeachFilter",
        "Link",
        "MatrixFilter",
        "NoiseFilter",
        "Pad",
        "PageElement",
        "Particle",
        "Path",
        "Pattern",
        "Phrase",
        "Picture",
        "PixelateFilter",
        "Point",
        "Position",
        "Quaternion",
        "RadialGradient",
        "SaturationFilter",
        "Shape",
        "Spring",
        "SpriteAnimation",
        "Stack",
        "StereoFilter",
        "Text",
        "ThresholdFilter",
        "Timeline",
        "TintFilter",
        "Tween",
        "Vector",
        "Video",
        "Wheel",
        "window.scrawl",
        "window.scrawl_Animation",
        "window.scrawl_Block",
        "window.scrawl_Collisions",
        "window.scrawl_Color",
        "window.scrawl_Factories",
        "window.scrawl_Filters",
        "window.scrawl_Images",
        "window.scrawl_Path",
        "window.scrawl_Phrase",
        "window.scrawl_Physics",
        "window.scrawl_SaveLoad",
        "window.scrawl_Shape",
        "window.scrawl_Stacks",
        "window.scrawl_Wheel"
    ],
    "modules": [
        "scrawlAnimation",
        "scrawlBlock",
        "scrawlCollisions",
        "scrawlColor",
        "scrawlCore",
        "scrawlFilters",
        "scrawlImages",
        "scrawlPath",
        "scrawlPathFactories",
        "scrawlPhrase",
        "scrawlPhysics",
        "scrawlSaveLoad",
        "scrawlShape",
        "scrawlStacks",
        "scrawlWheel"
    ],
    "allModules": [
        {
            "displayName": "scrawlAnimation",
            "name": "scrawlAnimation",
            "description": "# scrawlAnimation\n\n## Purpose and features\n\nThe Animation module adds support for animation and tweening to the core\n\n* Adds and starts an animation loop to the core\n* Defines the Animation object, used to program animation sequences\n* Defines the Tween object - a specialized form of animation which has pre-determined start and end points, durations and easing options\n* Adds functionality to various core objects and functions so they can take advantage of the animation object"
        },
        {
            "displayName": "scrawlBlock",
            "name": "scrawlBlock",
            "description": "# scrawlBlock\n\n## Purpose and features\n\nThe Block module adds Block entitys - squares and rectangles - to the core module\n\n* Defines 'rect' objects for displaying on a Cell's canvas\n* Performs 'rect' based drawing operations on canvases"
        },
        {
            "displayName": "scrawlCollisions",
            "name": "scrawlCollisions",
            "description": "# scrawlCollisions\n\n## Purpose and features\n\nThe Collisions module adds support for detecting collisions between entitys\n\n* Adds functionality to various core objects and functions so they can take detect collisions"
        },
        {
            "displayName": "scrawlColor",
            "name": "scrawlColor",
            "description": "# scrawlColor\n\n## Purpose and features\n\nThe Color module adds a controllable color object that can be used with entity fillStyle and strokeStyle attributes"
        },
        {
            "displayName": "scrawlCore",
            "name": "scrawlCore",
            "description": "# scrawlCore\n\n## Version 4.1.0 - 25 January 2015\n\nDeveloped by Rik Roots - <rik.roots@gmail.com>, <rik@rikweb.org.uk>\n\nScrawl demo website: <http://scrawl.rikweb.org.uk>\n\n### Be aware that the current develop branch (probably) includes changes beyond v4.1.0 that break that version\n\nThe next version, being coded up on the develop branch, will be v4.1.1, for bugfixes only\n\n## Purpose and features\n\nThe core module is the only essential module in Scrawl. It must always be directly, and completely, loaded into the web page before any additional Scrawl modules are added to it. \n\n* Defines the Scrawl scope - __window.scrawl__\n\n* Defines a number of utility methods used throughout Scrawl.js\n\n* Defines the Scrawl library - all significant objects created by Scrawl can be found here\n\n* Searches the DOM for &lt;canvas&gt; elements, and imports them into the Scrawl library\n\n* Instantiates controllers (Pad objects) and wrappers (Cell objects) for each &lt;canvas&gt; element\n\n* Instantiates Context engine objects for each Cell object\n\n* Defines mouse functionality in relation to &lt;canvas&gt; elements\n\n* Defines the core functionality for Entity objects to be displayed on &lt;canvas&gt; elements; the different types of Entitys are defined in separate modules which need to be loaded into the core\n\n* Defines Group objects, used to group entitys together for display and interaction purposes\n\n* Defines Design objects - Gradient and RadialGradient - which can be used by Entity objects for their _fill_ and _stroke_ styles; additional Design objects (Pattern, Color) are defined in separate modules\n\n## Loading the module"
        },
        {
            "displayName": "scrawlFilters",
            "name": "scrawlFilters",
            "description": "# scrawlFilters\n\n## Purpose and features\n\nThe Filters module adds a set of filter algorithms to the Scrawl library"
        },
        {
            "displayName": "scrawlImages",
            "name": "scrawlImages",
            "description": "# scrawlImages\n\n## Purpose and features\n\nThe Images module adds support for displaying images on canvas elements\n\n* Defines the EntityImage object, which wraps &lt;img&gt; and &lt;svg&gt; elements\n* Adds functionality to load images into the Scrawl library dynamically (after the web page hads loaded)\n* Defines the Picture entity, which can be used to display file images (including animated entity sheets), other &lt;canvas&gt; elements, and &lt;video&gt; elements (experimental)\n* Defines the AnimSheet object, which in turn define and control action sequences from entity sheet images\n* Defines the Pattern design, which uses images for entity fillStyle and strokeStyle attributes"
        },
        {
            "displayName": "scrawlPath",
            "name": "scrawlPath",
            "description": "# scrawlPath\n\n## Purpose and features\n\nThe Path module adds Path entitys - path-based objects - to the core module\n\n* Defines a entity composed of lines, quadratic and bezier curves, etc\n* Can act as a path along which other entitys can be positioned and animated\n* See also Shape object, which achieves a similar thing in a different way"
        },
        {
            "displayName": "scrawlPathFactories",
            "name": "scrawlPathFactories",
            "description": "# scrawlPathFactories\n\n## Purpose and features\n\nThe Factories module adds a set of factory functions to the Scrawl library, which can be used to generate both Path and Shape entitys"
        },
        {
            "displayName": "scrawlPhrase",
            "name": "scrawlPhrase",
            "description": "# scrawlPhrase\n\n## Purpose and features\n\nThe Phrase module adds Phrase entitys - single and multi-line text objects - to the core module\n\n* Defines text objects for displaying on a Cell's canvas\n* Handles all related font functionality\n* Performs text drawing operations on canvases"
        },
        {
            "displayName": "scrawlPhysics",
            "name": "scrawlPhysics",
            "description": "# scrawlPhysics\n\n## Purpose and features\n\nAdds an (experimental) physics engine to the core\n\n* Adds Particle, Spring and Force objects to the mix\n* Defines a number of engines for calculating interactions between these objects"
        },
        {
            "displayName": "scrawlSaveLoad",
            "name": "scrawlSaveLoad",
            "description": "# scrawlSaveLoad\n\n## Purpose and features\n\nAdds the ability to save and load Scrawl objects and scenes as JSON strings\n\n_This module is experimental and thus likely to change significantly as Scrawl evolves_"
        },
        {
            "displayName": "scrawlShape",
            "name": "scrawlShape",
            "description": "# scrawlShape\n\n## Purpose and features\n\nThe Shape module adds Shape entitys - path-based objects - to the core module\n\n* Defines a entity composed of lines, quadratic and bezier curves, etc\n* See also Path object, which achieves a similar thing in a different way"
        },
        {
            "displayName": "scrawlStacks",
            "name": "scrawlStacks",
            "description": "# scrawlStacks\n\n## Purpose and features\n\nThe Stacks module adds support for CSS3 3d transformations to visible &lt;canvas&gt;, and other, elements\n\n* Significantly amends the PageElement object and functions\n* Adds core functions for detecting and including Scrawl stacks and associated elements in the library\n* Defines the Stack object, which contains all DOM elements to be manipulated by this stack\n* Defines the Element object, which wrap DOM elements (excluding &lt;canvas&gt; elements) included in a stack"
        },
        {
            "displayName": "scrawlWheel",
            "name": "scrawlWheel",
            "description": "# scrawlWheel\n\n## Purpose and features\n\nThe Wheel module adds Wheel entitys - circles, segments and filled arcs - to the core module\n\n* Defines 'arc' objects for displaying on a Cell's canvas\n* Performs 'arc' based drawing operations on canvases"
        }
    ]
} };
});