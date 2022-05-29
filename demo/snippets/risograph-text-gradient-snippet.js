// # Demo Snippets 006
// Editable header element color font snippets
//
// Related files:
// + [Editable header element color font snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)

import { getSnippetData } from './text-snippet-helper.js';

export default function (el, scrawl) {

    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        let { canvas, group, dataset, name, lineHeight, initCanvas, initPhrase, textGroup, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        })

        const topColor = dataset.topColor ? dataset.topColor : 'lightblue';
        const bottomColor = dataset.bottomColor ? dataset.bottomColor : 'blue';
        const outlineColor = dataset.outlineColor ? dataset.outlineColor : 'black';
        const outlineWidth = dataset.outlineWidth ? parseFloat(dataset.outlineWidth) : 0;
        const randomRadius = dataset.randomRadius ? parseFloat(dataset.randomRadius) : '50';
        const randomLevel = dataset.randomLevel ? parseFloat(dataset.randomLevel) : '1';

        const g1 = scrawl.makeGradient({
            name: `${name}-riso-gradient`,
            colors: [
                [0, 'white'],
                [999, 'black'],
            ],
            startY: '-20%',
            endY: '120%',
        });

        const f1 = scrawl.makeFilter({
            name: `${name}-random-filter`,
            method: 'randomNoise',
            height: randomRadius,
            level: randomLevel,
        });

        const f2 = scrawl.makeFilter({
            name: `${name}-threshold-filter`,
            method: 'threshold',
            level: 127,
            lowColor: bottomColor,
            highColor: topColor,
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
        });

        cell.compile();

        const p1 = scrawl.makePattern({
            name: `${name}-riso-pattern`,
            asset: `${name}-riso-cell`,
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
            lineWidth: outlineWidth,
            strokeStyle: outlineColor,
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
