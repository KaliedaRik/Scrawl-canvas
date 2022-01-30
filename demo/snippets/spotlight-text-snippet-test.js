import * as scrawl from '../../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


export default function (el) {

    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        let canvas = snippet.canvas,
            animation = snippet.animation,
            wrapper = snippet.element,
            name = wrapper.name;

        canvas.setAsCurrentCanvas();

        let spotlightGradient = scrawl.makeRadialGradient({
            name: `${name}-gradient`,
            startX: '50%',
            startY: '50%',
            endX: '50%',
            endY: '50%',
            endRadius: '20%',
        })
        .updateColor(0, 'white')
        .updateColor(999, 'lightgray');

        animation.commence = function () {

            let active = false;

            return function () {

                if (canvas.here.active !== active) {

                    active = canvas.here.active;
                    block.set({
                        lockTo: (active) ? 'mouse' : 'start',
                        fillStyle: (active) ? spotlightGradient : 'lightgray',
                    });
                }
            };
        }();

        let block = scrawl.makeBlock({
            name: `${name}-spotlight`,
            width: '200%',
            height: '200%',

            startX: "50%",
            startY: "50%",
            handleX: "50%",
            handleY: "50%",

            fillStyle: 'lightgray',
            lockFillStyleToEntity: true,

            method: 'fill', 
        });

        scrawl.makeBlock({
            name: `${name}-box`,
            width: '50%',
            height: '50%',
            startX: '25%',
            startY: '25%',
            globalAlpha: 0.3,
            strokeStyle: 'lightgreen',
            lineWidth: 40,
            method: 'draw',
        });
    }
    return snippet;
};
