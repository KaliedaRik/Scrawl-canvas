// # Demo Modules 006
// Animation observer; Scrollytelling: First canvas
//
// Related files:
// + [Scrollytelling - main demo](../modules-006.html)
import { loader, reducedMotionFunctions } from './demo-m006-utils.js';

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


    // #### Scene
    canvas.set({
        label: 'An animated canvas showing three text snippets at the top, center and bottom of the canvas. Each text describes the canvas element\'s current position (from 0% top to 100% bottom) in the browser\' viewport. The texts update as the user scrolls through the page.', 
    }).setAsCurrentCanvas();

    scrawl.makeGradient({
        name: name('background-gradient'),
        endY: '100%',
        colors: [
            [0, 'slategray'],
            [999, 'darkslategray'],
        ],
    });

    scrawl.makeBlock({
        name: name('background'),
        dimensions: ['100%', '100%'],
        fillStyle: name('background-gradient'),
    });

    const top = scrawl.makePhrase({
        name: name('top'),
        start: ['center', '5%'],
        handle: ['center', 'center'],
        font: '1em Arial, sans-serif',
        lineHeight: 1,
        fillStyle: 'white',
    });

    const middle = top.clone({
        name: name('middle'),
        startY: 'center',
    });

    const bottom = top.clone({
        name: name('bottom'),
        startY: '95%',
    });


    const staticGroup = scrawl.makeGroup({
        name: name('static-group'),
        host: canvas.get('baseName'),
    });

    scrawl.makePicture({
        name: name('placeholder'),
        group: staticGroup,
        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],
        asset: assets.placeholder,
    });


    // #### Animation
    const commence = () => {

        const { inViewportTop, inViewportCenter, inViewportBase } = canvas.here;

        top.set({
            text: `Canvas top: ${(inViewportTop * 100).toFixed(2)}%`,
        });

        middle.set({
            text: `Canvas center: ${(inViewportCenter * 100).toFixed(2)}%`,
        });

        bottom.set({
            text: `Canvas bottom: ${(inViewportBase * 100).toFixed(2)}%`,
        });
    };

    const animation = scrawl.makeRender({
        name: name('animation'),
        target: canvas,
        observer: true,
    });


    // #### Accessibility - reduced-motion preference
    const reducedMotion = reducedMotionFunctions({
        fixed: staticGroup,
        animated: canvas.get('baseGroup'),
        commence,
        animation,
    });

    canvas.set({ ...reducedMotion });


    // #### Return object
    return {
        animation,
        kill: () => scrawl.library.purge(namespace),
    };
}
