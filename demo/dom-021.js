// # Demo DOM 021
// Use canvas elements in popover content

// [Run code](../../demo/dom-021.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';


// #### Utility functions
// Can be exported from their own file and imported here - see [Demo modules-006](./modules-006.html) for a working demo of this practice
//
// __Asset loader__
// Use the loader to get data out of the HTML &lt;canvas> element's `data-manifest` attribute.
// + Manifests are not part of the Scrawl-canvas system; we're just using it here as a convenient way to associate images with various canvas shapes (for those users who prefer reduced motion or are using non-visual methods to read the web page).
const loader = () => {

    const assets = scrawl.library.asset;

    const manifest = JSON.parse(canvas.domElement.dataset.manifest);

    scrawl.importDomImage(`.${manifest.class}`);

    const result = {};

    for (const [key, value] of Object.entries(manifest)) {

        if (key !== 'class') {

            result[key] = assets[value];
        }
    }
    return result;
};

// __Reduce motion functionality__
// A convenience function to add the `reduceMotionAction` and `noPreferenceMotionAction` attributes to a canvas. Takes an Object argument containing the following attributes:
// + `fixed` - a group containing artefacts that display when the user requests reduced motion, or an Array of such groups
// + `animated` - a group containing artefacts that display when the user give no preference about reduced motion, or an Array of such groups
// + `animation` - the animation object
// + `commence` - a function that handles required animation actions at the start of each Display cycle
export const reducedMotionFunctions = (items) => {

    const {animation, commence } = items;
    let {fixed, animated, halt } = items;

    if (!(fixed && animated && animation && commence)) return {};

    if (!Array.isArray(fixed)) fixed = [fixed];
    if (!Array.isArray(animated)) animated = [animated];

    if (halt == null) halt = () => {};

    return {

        reduceMotionAction: () => {

            fixed.forEach(a => a.setArtefacts({ visibility: true }));
            animated.forEach(a => a.setArtefacts({ visibility: false }));
            animation.set({ commence: halt });
        },
        noPreferenceMotionAction: () => {

            fixed.forEach(a => a.setArtefacts({ visibility: false }));
            animated.forEach(a => a.setArtefacts({ visibility: true }));
            animation.set({ commence });
        },
    }
};


// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas,
    base = canvas.get('baseName');


// Load image assets
const assets = loader();
console.log(assets);


// Build display
const animGroup = scrawl.makeGroup({
    name: 'animated-group',
    host: base,
});

const dragGroup = scrawl.makeGroup({
    name: 'drag-group',
    host: base,
});

const staticGroup = scrawl.makeGroup({
    name: 'static-group',
    host: base,
});


const arrow = scrawl.makeShape({
    name: 'arrow',
    group: animGroup,
    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    strokeStyle: 'pink',
    fillStyle: 'darkred',
    lineWidth: 6,
    lineJoin: 'round',
    lineCap: 'round',
    scale: 0.7,
    scaleOutline: false,
    roll: -90,
    method: 'fillThenDraw',
});

const shapeLabel = scrawl.makePhrase({
    name: 'shape-label',
    group: dragGroup,
    text: 'Canvas shape: ???',
    width: 200,
    start: ['25%', '50%'],
    justify: 'center',
    handle: ['center', 'center'],
    font: '1.5rem monospace',
    lineHeight: 1.3,
    fillStyle: 'yellow',
    boundingBoxColor: 'yellow',
    lineWidth: 1,
    method: 'fill',

    onEnter: function () {
        canvas.set({ css: { cursor: 'pointer' }});
// @ts-expect-error
        this.set({ showBoundingBox: true});
    },
    onLeave: function () {
        canvas.set({ css: { cursor: 'auto' }});
// @ts-expect-error
        this.set({ showBoundingBox: false});
    },
});

const sizeLabel = shapeLabel.clone({
    name: 'size-label',
    text: 'Canvas size: ???',
    start: ['75%', '50%'],
});


// Close button
scrawl.makeRectangle({

    name: 'close-button',
    group: base,
    rectangleWidth: 200,
    rectangleHeight: 40,
    radius: 6,
    start: ['98%', '2%'],
    handle: ['right', 'top'],
    method: 'fillThenDraw',
    fillStyle: 'white',
    strokeStyle: 'orange',
    lineWidth: 2,

    onEnter: function () {
        canvas.set({ css: { cursor: 'pointer' }});
// @ts-expect-error
        this.set({ fillStyle: 'yellow'});
    },
    onLeave: function () {
        canvas.set({ css: { cursor: 'auto' }});
// @ts-expect-error
        this.set({ fillStyle: 'white'});
    },
    button: {
        name: 'close-me',
        elementName: 'close-me',
        description: 'Close',
        popoverTarget: 'mypopover',
        popoverTargetAction: 'hide',
        autofocus: true,
        focusAction: true,
        blurAction: true,
    },

// @ts-expect-error
    onUp: this.clickButton,
});

// scrawl.makePhrase({

//     name: 'close-button-label',
//     group: animationGroup,
//     text: 'Close',
//     width: 200,
//     start: ['98%', '2%'],
//     handle: ['right', 'top'],
//     justify: 'center',
//     font: '1rem Arial, sans-serif',
//     lineHeight: 1,
//     fillStyle: 'black',
//     method: 'fill',

//     onEnter: function () {
//         canvas.set({ css: { cursor: 'pointer' }});
// // @ts-expect-error
//         this.set({ showBoundingBox: true});
//     },
//     onLeave: function () {
//         canvas.set({ css: { cursor: 'auto' }});
// // @ts-expect-error
//         this.set({ showBoundingBox: false});
//     },
// });


// #### User interaction
scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);
scrawl.addListener('up', () => canvas.cascadeEventAction('up'), canvas.domElement);

scrawl.makeDragZone({
    zone: canvas,
    collisionGroup: dragGroup,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
});


// #### Responsiveness
canvas.setDisplayShapeBreakpoints({

    breakToBanner: 2,
    breakToLandscape: 1.5,
    breakToPortrait: 0.75,
    breakToSkyscraper: 0.5,

    breakToSmallest: (410 * 820),
    breakToSmaller: (720 * 1000),
    breakToLarger: (1000 * 1000),
    breakToLargest: (1200 * 1000),
});

canvas.set({
    actionBannerShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: banner',
            start: ['25%', '50%'],
        });
        sizeLabel.set({
            start: ['75%', '50%'],
        });
        placeholder.set({
            asset: assets.banner,
        })
        arrow.set({
            roll: -90,
        });
    },

    actionLandscapeShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: landscape',
            start: ['25%', '50%'],
        });
        sizeLabel.set({
            start: ['75%', '50%'],
        });
        placeholder.set({
            asset: assets.landscape,
        })
        arrow.set({
            roll: -112.5,
        });
    },

    actionRectangleShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: rectangular',
            start: ['30%', '65%'],
        });
        sizeLabel.set({
            start: ['70%', '65%'],
        });
        placeholder.set({
            asset: assets.rectangular,
        })
        arrow.set({
            roll: -135,
        });
    },

    actionPortraitShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: portrait',
            start: ['50%', '25%'],
        });
        sizeLabel.set({
            start: ['50%', '75%'],
        });
        placeholder.set({
            asset: assets.portrait,
        })
        arrow.set({
            roll: -157.5,
        });
    },

    actionSkyscraperShape: () => {
        shapeLabel.set({
            text: 'Canvas shape: skyscraper',
            start: ['50%', '25%'],
        });
        sizeLabel.set({
            start: ['50%', '75%'],
        });
        placeholder.set({
            asset: assets.skyscraper,
        })
        arrow.set({
            roll: -180,
        });
    },

    actionLargestArea: () => {
        sizeLabel.set({
            text: 'Canvas size: largest',
        });
        arrow.set({
            scale: 1,
        });
    },

    actionLargerArea: () => {
        sizeLabel.set({
            text: 'Canvas size: larger',
        });
        arrow.set({
            scale: 0.85,
        });
    },

    actionRegularArea: () => {
        sizeLabel.set({
            text: 'Canvas size: regular',
        });
        arrow.set({
            scale: 0.7,
        });
    },

    actionSmallerArea: () => {
        sizeLabel.set({
            text: 'Canvas size: smaller',
        });
        arrow.set({
            scale: 0.55,
        });
    },

    actionSmallestArea: () => {
        sizeLabel.set({
            text: 'Canvas size: smallest',
        });
        arrow.set({
            scale: 0.4,
        });
    },
});


const placeholder = scrawl.makePicture({
    name: 'placeholder-image',
    group: staticGroup,
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    asset: assets.placeholder,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
const commence = () => {};

const animation = scrawl.makeRender({
    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Accessibility - reduced-motion preference
const reducedMotion = reducedMotionFunctions({
    fixed: staticGroup,
    animated: [animGroup, dragGroup],
    commence,
    animation,
});

canvas.set({ ...reducedMotion });



// #### Development and testing
console.log(scrawl.library);
