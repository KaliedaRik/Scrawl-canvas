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

        let { canvas, group, dataset, compStyles, name, fontSize, lineHeight, initCanvas, initPhrase, textGroup, responsiveFunctions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
        if (contrastMediaQuery.matches) {
            return { error: 'User has indicated they want maximum contrast' };
        }

        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        });

        let topColor = 'lightblue',
            darkTopColor = '#d7e3f5',
            bottomColor = 'blue',
            darkBottomColor = '#598ad9',
            outlineColor = 'black',
            darkOutlineColor = '#f4f5d7',
            outlineWidth = 0.03,
            randomRadius = 0.8,
            randomLevel = 1;

        if (dataset.topColor) topColor = dataset.topColor;
        else {
            const s = compStyles.getPropertyValue('--data-top-color');
            if (s) topColor = s;
        }

        if (dataset.darkTopColor) darkTopColor = dataset.darkTopColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-top-color');
            if (s) darkTopColor = s;
        }

        if (dataset.bottomColor) bottomColor = dataset.bottomColor;
        else {
            const s = compStyles.getPropertyValue('--data-bottom-color');
            if (s) bottomColor = s;
        }

        if (dataset.darkBottomColor) darkBottomColor = dataset.darkBottomColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-bottom-color');
            if (s) darkBottomColor = s;
        }

        if (dataset.outlineColor) outlineColor = dataset.outlineColor;
        else {
            const s = compStyles.getPropertyValue('--data-outline-color');
            if (s) outlineColor = s;
        }

        if (dataset.darkOutlineColor) darkOutlineColor = dataset.darkOutlineColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-outline-color');
            if (s) darkOutlineColor = s;
        }

        if (dataset.outlineWidth) outlineWidth = parseFloat(dataset.outlineWidth);
        else {
            const s = compStyles.getPropertyValue('--data-outline-width');
            if (s) outlineWidth = parseFloat(s);
        }

        if (dataset.randomRadius) randomRadius = parseFloat(dataset.randomRadius);
        else {
            const s = compStyles.getPropertyValue('--data-random-radius');
            if (s) randomRadius = parseFloat(s);
        }

        if (dataset.randomLevel) randomLevel = parseFloat(dataset.randomLevel);
        else {
            const s = compStyles.getPropertyValue('--data-random-level');
            if (s) randomLevel = parseFloat(s);
        }

        let color1 = topColor,
            color2 = bottomColor,
            color3 = outlineColor;

        const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (colorSchemeMediaQuery.matches) {
            color1 = darkTopColor;
            color2 = darkBottomColor;
            color3 = darkOutlineColor;
        }

        const g1 = scrawl.makeGradient({
            name: `${name}-riso-gradient`,
            colors: [
                [0, 'white'],
                [999, 'black'],
            ],
            endY: '100%',
        });

        const f1 = scrawl.makeFilter({
            name: `${name}-random-filter`,
            method: 'randomNoise',
            height: Math.round(lineHeight * randomRadius),
            noWrap: true,
            level: randomLevel,
        });

        const f2 = scrawl.makeFilter({
            name: `${name}-threshold-filter`,
            method: 'threshold',
            level: 127,
            lowColor: color2,
            highColor: color1,
        });

        const cell = canvas.buildCell({
            name: `${name}-riso-cell`,
            width: '100%',
            height: lineHeight,
            cleared: false,
            compiled: false,
            shown: false,
        });

        scrawl.makeBlock({
            name: `${name}-riso-block`,
            group: `${name}-riso-cell`,
            dimensions: ['100%', '100%'],
            fillStyle: `${name}-riso-gradient`,
            lockFillStyleToEntity: true,
            filters: [`${name}-random-filter`, `${name}-threshold-filter`],
            memoizeFilterOutput: true,
        });

        cell.compile();

        const p1 = scrawl.makePattern({
            name: `${name}-riso-pattern`,
            asset: `${name}-riso-cell`,
            matrixF: Math.round(lineHeight / 10),
        });

        const textFill = scrawl.makePhrase({
            name: `${name}-text-stencil`,
            group,
            order: 0,
        });

        initPhrase(textFill);

        const textStroke = textFill.clone({
            name: `${name}-text-outline`,
            order: 2,
            lineWidth: outlineWidth * fontSize,
            strokeStyle: color3,
            method: 'draw',
            globalCompositeOperation: 'destination-over',
        });

        textGroup.addArtefacts(textFill, textStroke);

        scrawl.makeBlock({
            name: `${name}-text-fill`,
            group,
            order: 1,
            width: '100%',
            height: '100%',
            fillStyle: `${name}-riso-pattern`,
            globalCompositeOperation: 'source-in',
        });

        responsiveFunctions.push((items = {}) => {

            const localLineHeight = parseFloat(items.lineHeight),
                localFontSize = parseFloat(items.fontSize);

            cell.set({
                height: localLineHeight,
            });
            cell.clear();
            cell.compile();

            p1.set({
                matrixF: Math.round(localLineHeight / 10),
            });
            
            f1.set({
                height: Math.round(localLineHeight * randomRadius),
            });

            textStroke.set({
                lineWidth: outlineWidth * localFontSize,
            });
        });

        additionalDemolishActions.push(() => {
            f1.kill();
            f2.kill();
            g1.kill();
            p1.kill();
            cell.kill();
        });
    }
    return snippet;
};
