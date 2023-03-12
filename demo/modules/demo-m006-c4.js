// # Demo Modules 006
// Animation observer; Scrollytelling: Fourth canvas
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


    // #### Scene
    const targetPos = calculateTargetPosition(assets.target, 5);

    canvas.set({
        label: 'The canvas displays an image of statues in a cemetery (Havana, Cuba). As the user scrolls through the page the image moves to focus on particular points of interest', 
    }).setAsCurrentCanvas();

    canvas.setBase({
        backgroundColor: 'yellow',
    });

    const base = canvas.base;

    const angelAsset = assets.angels;
    const angelDimensions = angelAsset.intrinsicDimensions[angelAsset.currentFile];

    const angelsGroup = scrawl.makeGroup({
        name: name('angels-group'),
        host: canvas.get('baseName'),
    });

    const angels = scrawl.makePicture({
        name: name('angels'),
        group: angelsGroup,
        dimensions: angelDimensions,
        copyDimensions: angelDimensions,
        asset: angelAsset,
        scale: (2 / 3),
        start: ['center', 'center'],
        handle: ['55%', '50%'],
        memoizeFilterOutput: true,
    });

    const filter = scrawl.makeFilter({
        name: name('angel-filter'),
        method: 'notgreen',
        opacity: 0,
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
        duration: 300,
        targets: angels,
        definitions: [{
            attribute: 'scale',
            start: (2 / 3),
            end: 1,
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-2'),
        time: 50,
        duration: 300,
        definitions: [{
            attribute: 'handleY',
            start: '50%',
            end: '35%',
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-3'),
        time: 150,
        duration: 300,
        definitions: [{
            attribute: 'handleX',
            start: '55%',
            end: '40%',
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-4'),
        time: 350,
        duration: 200,
        definitions: [{
            attribute: 'handleY',
            start: '35%',
            end: '65%',
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-5'),
        time: 450,
        duration: 300,
        definitions: [{
            attribute: 'handleX',
            start: '40%',
            end: '68%',
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-6'),
        time: 600,
        duration: 200,
        definitions: [{
            attribute: 'handleY',
            start: '65%',
            end: '55%',
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-7'),
        time: 700,
        duration: 200,
        definitions: [{
            attribute: 'scale',
            start: 1,
            end: 2,
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-8'),
        time: 800,
        duration: 200,
        definitions: [{
            attribute: 'roll',
            start: 0,
            end: 50,
            engine: 'easeOutIn',
        }],
    }).clone({
        name: name('tween-9'),
        targets: filter,
        time: 850,
        duration: 150,
        definitions: [{
            attribute: 'opacity',
            start: 0,
            end: 1,
        }],
    });

    scrawl.makeAction({
        name: name('filter-action-main'),
        ticker: name('ticker'),
        time: 850,
        action: () => base.addFilters(filter),
        revert: () => base.removeFilters(filter),
    });

    scrawl.addNativeListener('focus', () => {
        angels.set({
            scale: (2 / 3),
            roll: 0,
            handle: ['55%', '50%'],
        });
        base.set({
            filters: [],
        });
        filter.set({
            opacity: 0,
        });
    }, assets.target);

    const commence = () => ticker.seekTo(targetPos());

    const staticGroup = scrawl.makeGroup({
        name: name('static-group'),
        host: canvas.get('baseName'),
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
        animated: angelsGroup,
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
