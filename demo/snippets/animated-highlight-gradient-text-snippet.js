// # Demo Snippets 006
// Editable header elements with various text fill effects 
//
// Related files:
// + [Editable header elements with various text color effects](../snippets-006.html)

import { getSnippetData } from './text-snippet-helper.js';

export default function (el, scrawl) {

    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        let { canvas, group, animation, dataset, name, height, lineHeight, initCanvas, initPhrase, textGroup, animationFunctions } = getSnippetData(snippet, scrawl);

        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        })

        const mainColor = dataset.mainColor ? dataset.mainColor : 'black';
        const highlightColor = dataset.highlightColor ? dataset.highlightColor : 'lightgreen';
        const gradientEasing = dataset.gradientEasing ? dataset.gradientEasing : 'linear';

        const myGradient = scrawl.makeGradient({
            name: `${name}-highlight-gradient`,
            colors: [
                [0, mainColor],
                [199, highlightColor],
                [399, mainColor],
                [599, highlightColor],
                [799, mainColor],
                [999, mainColor],
            ],
            endY: '100%',
            delta: {
                paletteStart: -3,
                paletteEnd: -3,
            },
            cyclePalette: true,
            easing: gradientEasing,
            precision: 3,
        });

        const cell = canvas.buildCell({
            name: `${name}-highlight-gradient-cell`,
            width: 16,
            height: lineHeight,
            shown: false,
        });

        scrawl.makeBlock({
            name: `${name}-highlight-gradient-block`,
            group: `${name}-highlight-gradient-cell`,
            dimensions: ['100%', '100%'],
            fillStyle: `${name}-highlight-gradient`,
            lockFillStyleToEntity: true,
        });

        scrawl.makePattern({
            name: `${name}-highlight-gradient-pattern`,
            asset: `${name}-highlight-gradient-cell`,
        });

        const textFill = scrawl.makePhrase({
            name: `${name}-text-stencil`,
            group,
            order: 0,
        });

        initPhrase(textFill);

        textGroup.addArtefacts(textFill);

        scrawl.makeBlock({
            name: `${name}-text-fill`,
            group,
            order: 1,
            width: '100%',
            height: '100%',
            fillStyle: `${name}-highlight-gradient-pattern`,
            globalCompositeOperation: 'source-in',
        });

        const updateGradient = () => myGradient.updateByDelta();
        animationFunctions.push(updateGradient);
    }
    return snippet;
};
