// # Demo Modules 006
// Animation observer; Scrollytelling: Second canvas
//
// Related files:
// + [Scrollytelling - main demo](../modules-006.html)
import {
    loader,
    calculateTargetPosition,
    reducedMotionFunctions,
    staticPlaceholderCorrection,
} from './demo-m006-utils.js';


export default function (items) {

    // #### Proceed checks
    let { canvas, namespace, scrawl } = items;

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


    // #### Scene
    canvas.set({
        label: 'An animated canvas showing an image of angel statues in Havana cemetery, Cuba. The image is revealed via a sequence of expanding, increasingly opaque discs as the user scrolls down the page.', 
    }).setAsCurrentCanvas();


    const group1 = scrawl.makeGroup({
        name: name('animated-group-1'),
        host: base,
    });

    const group2 = group1.clone({
        name: name('animated-group-2'),
        host: base,
    });

    const group3 = group1.clone({
        name: name('animated-group-3'),
        host: base,
    })

    const group4 = group1.clone({
        name: name('animated-group-4'),
        host: base,
        order: 1,
    });

    scrawl.makeWheel({
        name: name('circle-1'),
        group: group1,
        start: ['center', 'center'],
        handle: ['center', 'center'],
        radius: 0,
        globalAlpha: 0,
    }).clone({
        name: name('circle-2'),
        group: group2,
        startX: '30%',
    }).clone({
        name: name('circle-3'),
        startX: '70%',
    }).clone({
        name: name('circle-4'),
        startX: 'center',
        startY: '30%'
    }).clone({
        name: name('circle-5'),
        startY: '70%'
    }).clone({
        name: name('circle-6'),
        group: group3,
        startX: '35%',
        startY: '35%',
    }).clone({
        name: name('circle-7'),
        startX: '65%',
    }).clone({
        name: name('circle-8'),
        startY: '65%',
    }).clone({
        name: name('circle-9'),
        startX: '35%',
    });

    scrawl.makePicture({
        name: name('angels-image'),
        group: group4,
        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],
        asset: assets.angel,
        globalCompositeOperation: 'source-in',
    });


    // #### Animation
    const ticker = scrawl.makeTicker({
        name: name('ticker'),
        cycles: 0,
        duration: 1000,
    });

    scrawl.makeTween({
        name: name('tween-1'),
        ticker: name('ticker'),
        time: 0,
        duration: 400,
        targets: group1,
        definitions: [{
            attribute: 'globalAlpha',
            start: 0,
            end: 1,
            engine: 'easeIn3',
        },{
            attribute: 'radius',
            start: 0,
            end: 100,
        }],
    }).clone({
        name: name('tween-2'),
        time: 300,
        targets: group2,
    }).clone({
        name: name('tween-3'),
        time: 600,
        targets: group3,
    });

    const commence = () => ticker.seekTo(targetPos());

    const staticGroup = scrawl.makeGroup({
        name: name('static-group'),
        host: base,
    });

    const placeholder = scrawl.makePicture({
        name: name('static-angels-image'),
        group: staticGroup,
        start: ['center', 'center'],
        handle: ['center', 'center'],
        dimensions: ['100%', '100%'],
        copyDimensions: ['100%', '100%'],
        asset: assets.placeholder,
    });

    const placeholderCorrection = staticPlaceholderCorrection(placeholder)
    const halt = () => placeholderCorrection();

    const animation = scrawl.makeRender({
        name: name('animation'),
        target: canvas,
        observer: true,
    });


    // #### Accessibility - reduced-motion preference
    const reducedMotion = reducedMotionFunctions({
        fixed: staticGroup,
        animated: [group1, group2, group3, group4],
        commence,
        halt,
        animation,
    });

    canvas.set({ ...reducedMotion });


    // #### Return object
    return {
        animation,
        kill: () => scrawl.library.purge(namespace),
    };
};
