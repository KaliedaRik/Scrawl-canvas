import { getSnippetData } from './text-snippet-helper.js';

// __Effects on the element:__ 
// + Imports the element's background color, and sets the element background to `transparent`
// + Imports the element's text node text, and sets the text color to `transparent`
// + ___Note that canvas text will NEVER be as good as DOM text!___
export default function (el, scrawl) {

    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        let { canvas, group, dataset, name, width, height, yOffset, initCanvas, initPhrase, textGroup, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        })

        const baseColor = dataset.baseColor ? dataset.baseColor : 'black';
        const highlightColor = dataset.highlightColor ? dataset.highlightColor : 'orange';
        const noiseSumFunction = dataset.noiseSumFunction ? dataset.noiseSumFunction : 'random';
        const noiseScale = dataset.noiseScale ? parseFloat(dataset.noiseScale) : 50;
        const noiseOutput = dataset.noiseOutput ? dataset.noiseOutput : 'X';
        const shadowColor = dataset.shadowColor ? dataset.shadowColor : 'black';
        const shadowOffsetX = dataset.shadowOffsetX ? parseFloat(dataset.shadowOffsetX) : 0;
        const shadowOffsetY = dataset.shadowOffsetY ? parseFloat(dataset.shadowOffsetY) : 0;
        const shadowBlur = dataset.shadowBlur ? parseFloat(dataset.shadowBlur) : 0;


        const worley = scrawl.makeNoiseAsset({
            name: `${name}-noise-generator`,
            colors: [
                [0, highlightColor],
                [999, baseColor],
            ],
            colorSpace: 'LAB',
            noiseEngine: 'worley-euclidean',
            sumFunction: noiseSumFunction,
            scale: noiseScale,
            worleyOutput: noiseOutput,
            width: Math.ceil(width),
            height: Math.ceil(height),
        });

        const p1 = scrawl.makePattern({
            name: `${name}-noise-pattern`,
            asset: `${name}-noise-generator`,
        });

        const f1 = scrawl.makeFilter({
            name: `${name}-blur-filter`,
            method: 'gaussianBlur',
            radius: shadowBlur,
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
            startX: shadowOffsetX,
            startY: yOffset + shadowOffsetY,
            fillStyle: shadowColor,
            filters: shadowBlur ? [`${name}-blur-filter`] : [],
            memoizeFilterOutput: true,
            globalCompositeOperation: 'destination-over',
        });

        textGroup.addArtefacts(textFill, textStroke);

        scrawl.makeBlock({
            name: `${name}-text-fill`,
            group,
            order: 1,
            width: '100%',
            height: '100%',
            fillStyle: `${name}-noise-pattern`,
            globalCompositeOperation: 'source-in',
        });

        additionalDemolishActions.push(() => {
            f1.kill();
            p1.kill();
            worley.kill();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
