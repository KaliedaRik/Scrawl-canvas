// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)

import { getSnippetData } from './text-snippet-helper.js';

export default function (el, scrawl) {

    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        let { canvas, group, animation, compStyles, dataset, name, height, lineHeight, initCanvas, initPhrase, textGroup, responsiveFunctions, animationFunctions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
        if (contrastMediaQuery.matches) {
            return { error: 'User has indicated they want maximum contrast' };
        }

        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        })

        let mainColor = 'black',
            highlightColor = 'lightgreen',
            darkMainColor = 'ivory',
            darkHighlightColor = 'green',
            gradientEasing = 'linear',
            gradientSkewX = 0,
            gradientSkewY = 0,
            gradientStretchX = 1,
            gradientStretchY = 1;

        if (dataset.mainColor) mainColor = dataset.mainColor;
        else {
            const s = compStyles.getPropertyValue('--data-main-color');
            if (s) mainColor = s;
        }

        if (dataset.darkMainColor) darkMainColor = dataset.darkMainColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-main-color');
            if (s) darkMainColor = s;
        }

        if (dataset.highlightColor) highlightColor = dataset.highlightColor;
        else {
            const s = compStyles.getPropertyValue('--data-highlight-color');
            if (s) highlightColor = s;
        }

        if (dataset.darkHighlightColor) darkHighlightColor = dataset.darkHighlightColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-highlight-color');
            if (s) darkHighlightColor = s;
        }

        if (dataset.gradientEasing) gradientEasing = dataset.gradientEasing;
        else {
            const s = compStyles.getPropertyValue('--data-gradient-easing');
            if (s) gradientEasing = s;
        }

        if (dataset.gradientSkewX) gradientSkewX = parseFloat(dataset.gradientSkewX);
        else {
            const s = compStyles.getPropertyValue('--data-gradient-skew-x');
            if (s) gradientSkewX = parseFloat(s);
        }

        if (dataset.gradientSkewY) gradientSkewY = parseFloat(dataset.gradientSkewY);
        else {
            const s = compStyles.getPropertyValue('--data-gradient-skew-y');
            if (s) gradientSkewY = parseFloat(s);
        }

        if (dataset.gradientStretchX) gradientStretchX = parseFloat(dataset.gradientStretchX);
        else {
            const s = compStyles.getPropertyValue('--data-gradient-stretch-x');
            if (s) gradientStretchX = parseFloat(s);
        }

        if (dataset.gradientStretchY) gradientStretchY = parseFloat(dataset.gradientStretchY);
        else {
            const s = compStyles.getPropertyValue('--data-gradient-stretch-y');
            if (s) gradientStretchY = parseFloat(s);
        }

        let color1 = mainColor,
            color2 = highlightColor;

        const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (colorSchemeMediaQuery.matches) {
            color1 = darkMainColor;
            color2 = darkHighlightColor;
        }

        const myGradient = scrawl.makeGradient({
            name: `${name}-highlight-gradient`,
            colors: [
                [0, color1],
                [199, color2],
                [399, color1],
                [599, color2],
                [799, color1],
                [999, color1],
            ],
            endY: '100%',
            delta: {
                paletteStart: -3,
                paletteEnd: -3,
            },
            cyclePalette: true,
            easing: gradientEasing,
            precision: 4,
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

        const p1 = scrawl.makePattern({
            name: `${name}-highlight-gradient-pattern`,
            asset: `${name}-highlight-gradient-cell`,
            stretchX: gradientStretchY,
            stretchY: gradientStretchX,
            skewX: gradientSkewY,
            skewY: gradientSkewX,
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

        responsiveFunctions.push((items = {}) => {

            const localLineHeight = parseFloat(items.lineHeight);

            cell.set({
                height: localLineHeight,
            });
        });

        animationFunctions.push(() => myGradient.updateByDelta());

        additionalDemolishActions.push(() => {
            myGradient.kill();
            p1.kill();
            cell.kill();
        });
    }
    return snippet;
};
