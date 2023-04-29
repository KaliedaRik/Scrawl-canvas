// # Demo Modules 006
// Animation observer; Scrollytelling: Third canvas
//
// Related files:
// + [Scrollytelling - main demo](../modules-006.html)
import {
    loader,
    calculateTargetPosition,
    reducedMotionFunctions,
} from './demo-m006-utils.js';


export default function (items) {

    // #### Proceed checks
    const { canvas, namespace, scrawl } = items;

    if (!(canvas && namespace && scrawl)) return {
        animation: null,
        kill: () => {},
    }


    // #### Boilerplate
    const name = item => `${namespace}-${item}`;

    const assets = loader(canvas, scrawl);
    console.log(namespace, assets);


    // #### Helpers
    const base = canvas.get('baseName');

    const targetPos = calculateTargetPosition(assets.target, 3);

    const balance = 3200;


    // #### Scene
    const title = 'The yellow labels can be dragged';

    canvas.set({
        title,
        label: 'An interactive canvas. An arrow appears in the center; its outline is drawn as the user scrolls. Labels tell the user the canvas shape and size. These labels are draggable. Links appear in the bottom corners.', 
    }).setAsCurrentCanvas();

    const animGroup = scrawl.makeGroup({
        name: name('animated-group'),
        host: base,
    });

    const dragGroup = scrawl.makeGroup({
        name: name('drag-group'),
        host: base,
    });

    const arrow = scrawl.makeShape({

        name: name('arrow'),
        group: animGroup,

        pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

        start: ['center', 'center'],
        handle: ['center', 'center'],

        strokeStyle: 'pink',
        fillStyle: 'darkred',
        lineWidth: 20,
        lineJoin: 'round',
        lineCap: 'round',

        scale: 0.7,
        scaleOutline: false,
        roll: -90,

        // We create this effect using a dashed line with very large dash/nodash values
        // + We can then set the offset to the point where the displayed dash ends, so it looks like the arrow doesn't have a stroke
        lineDash: [balance, balance],
        lineDashOffset: balance,

        // To retrieve the Shape's length, we need to tell it that it is being used as a path
        useAsPath: true,
        precision: 1,

        method: 'fillThenDraw',
    });

    const lineProgressLabel = scrawl.makePhrase({
        name: name('progress-label'),
        group: dragGroup,
        width: 200,
        start: ['50%', '50%'],
        justify: 'center',
        handle: ['center', 'center'],
        font: '1em monospace',
        lineHeight: 1,
        fillStyle: 'yellow',
        boundingBoxColor: 'yellow',
        lineWidth: 1,
        method: 'fill',

        onEnter: function () {
            canvas.set({ css: { cursor: 'pointer' }});
            this.set({ showBoundingBox: true});
        },
        onLeave: function () {
            canvas.set({ css: { cursor: 'auto' }});
            this.set({ showBoundingBox: false});
        },
    });

    const shapeLabel = lineProgressLabel.clone({
        name: name('shape-label'),
        text: 'Canvas shape: ???',
        start: ['25%', '50%'],
    });

    const sizeLabel = lineProgressLabel.clone({
        name: name('size-label'),
        text: 'Canvas size: ???',
        start: ['75%', '50%'],
    });

    scrawl.makePhrase({
        name: name('arrow-link'),
        group: animGroup,
        start: ['2%', '98%'],
        handle: ['left', 'bottom'],
        font: '1.4em Arial, sans-serif',
        text: 'Arrows',
        fillStyle: 'white',
        lineHeight: 1,
        underlinePosition: 0.8,
        underlineStyle: 'white',
        exposeText: false,

        onEnter: function () {
            canvas.set({ 
                css: { cursor: 'pointer' },
                title: 'https://en.wikipedia.org/wiki/Arrow',
            });
            this.set({ text: `§UNDERLINE§${this.text}`});
        },
        onLeave: function () {
            canvas.set({ 
                css: { cursor: 'auto' },
                title,
            });
            this.set({ text: this.text.replace('§UNDERLINE§', '')});
        },
        onUp: function () {
            this.clickAnchor();
        },
        anchor: {
            name: name('arrow-anchor'),
            href: 'https://en.wikipedia.org/wiki/Arrow',
            description: 'Wikipedia article on arrows',
            focusAction: true,
            blurAction: true,
        },
    }).clone({
        name: name('label-link'),
        start: ['98%', '98%'],
        handle: ['right', 'bottom'],
        text: 'Labels',

        onEnter: function () {
            canvas.set({ 
                css: { cursor: 'pointer' },
                title: 'https://en.wikipedia.org/wiki/Label',
            });
            this.set({ text: `§UNDERLINE§${this.text}`});
        },
        anchor: {
            name: name('label-anchor'),
            href: 'https://en.wikipedia.org/wiki/Label',
            description: 'Wikipedia article on labels',
            focusAction: true,
            blurAction: true,
        },
    });


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
            lineProgressLabel.set({
                start: ['50%', '50%'],
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
            lineProgressLabel.set({
                start: ['50%', '50%'],
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
            lineProgressLabel.set({
                start: ['50%', '35%'],
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
            lineProgressLabel.set({
                start: ['50%', '50%'],
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
            lineProgressLabel.set({
                start: ['50%', '50%'],
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


    // #### Animation
    scrawl.makeWorld({

        name: name('world'),

        userAttributes: [{
            key: 'progress', 
            defaultValue: 0,
            setter: function (item) {

                this.progress = item;

                if (arrow.length != null) {

                    arrow.set({ 
                        lineDashOffset: balance - Math.round(arrow.length * item),
                    });
                }
            },
        }],
    });

    const ticker = scrawl.makeTicker({
        name: name('ticker'),
        cycles: 0,
        duration: 1000,
    });

    scrawl.makeTween({
        name: name('tween-1'),
        ticker: name('ticker'),
        time: 0,
        duration: 1000,
        targets: [name('world')],
        definitions: [{
            attribute: 'progress',
            start: 0.001,
            end: 1,
        }],
    });

    const commence = () => {

        const scroll = targetPos();

        ticker.seekTo(scroll);

        lineProgressLabel.set({
            text: `Progress: ${(scroll / 10).toFixed(1)}%`,
        })
    };

    const staticGroup = scrawl.makeGroup({
        name: name('static-group'),
        host: base,
    });

    const placeholder = scrawl.makePicture({
        name: name('placeholder-image'),
        group: staticGroup,
        start: ['center', 'center'],
        handle: ['center', 'center'],
        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],
        asset: assets.placeholder,
    });

    const animation = scrawl.makeRender({
        name: name('animation'),
        target: canvas,
        observer: true,
        afterCreated: () => {
            canvas.updateDisplay();
        },
    });


    // #### Accessibility - reduced-motion preference
    const reducedMotion = reducedMotionFunctions({
        fixed: staticGroup,
        animated: [animGroup, dragGroup],
        commence,
        animation,
    });

    canvas.set({ ...reducedMotion });


    // Return object
    return {
        animation,
        kill: () => scrawl.library.purge(namespace),
    };
}
