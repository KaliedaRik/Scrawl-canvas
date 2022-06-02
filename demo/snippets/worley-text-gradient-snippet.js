// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)

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

        let { canvas, group, dataset, compStyles, name, width, height, fontSize, yOffset, initCanvas, initPhrase, textGroup, responsiveFunctions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
        if (contrastMediaQuery.matches) {
            return { error: 'User has indicated they want maximum contrast' };
        }

        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        });

        let baseColor = 'black',
            darkBaseColor = 'white',
            highlightColor = 'orange',
            darkHighlightColor = 'orange',
            noiseSumFunction = 'random',
            noiseOutput = 'X',
            noiseScale = 50,
            shadowColor = 'black',
            darkShadowColor = 'white',
            shadowOffsetX = 0,
            shadowOffsetY = 0,
            shadowBlur = 0;

        if (dataset.baseColor) baseColor = dataset.baseColor;
        else {
            const s = compStyles.getPropertyValue('--data-base-color');
            if (s) baseColor = s;
        }

        if (dataset.darkBaseColor) darkBaseColor = dataset.darkBaseColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-base-color');
            if (s) darkBaseColor = s;
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

        if (dataset.noiseSumFunction) noiseSumFunction = dataset.noiseSumFunction;
        else {
            const s = compStyles.getPropertyValue('--data-noise-sum-function');
            if (s) noiseSumFunction = s;
        }

        if (dataset.noiseOutput) noiseOutput = dataset.noiseOutput;
        else {
            const s = compStyles.getPropertyValue('--data-noise-output');
            if (s) noiseOutput = s;
        }

        if (dataset.noiseScale) noiseScale = parseFloat(dataset.noiseScale);
        else {
            const s = compStyles.getPropertyValue('--data-noise-scale');
            if (s) noiseScale = parseFloat(s);
        }

        if (dataset.shadowColor) shadowColor = dataset.shadowColor;
        else {
            const s = compStyles.getPropertyValue('--data-shadow-color');
            if (s) shadowColor = s;
        }

        if (dataset.darkShadowColor) darkShadowColor = dataset.darkShadowColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-shadow-color');
            if (s) darkShadowColor = s;
        }

        if (dataset.shadowOffsetX) shadowOffsetX = parseFloat(dataset.shadowOffsetX);
        else {
            const s = compStyles.getPropertyValue('--data-shadow-offset-x');
            if (s) shadowOffsetX = parseFloat(s);
        }

        if (dataset.shadowOffsetY) shadowOffsetY = parseFloat(dataset.shadowOffsetY);
        else {
            const s = compStyles.getPropertyValue('--data-shadow-offset-y');
            if (s) shadowOffsetY = parseFloat(s);
        }

        if (dataset.shadowBlur) shadowBlur = parseFloat(dataset.shadowBlur);
        else {
            const s = compStyles.getPropertyValue('--data-shadow-blur');
            if (s) shadowBlur = parseFloat(s);
        }

        let color1 = baseColor,
            color2 = highlightColor,
            color3 = shadowColor;

        const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (colorSchemeMediaQuery.matches) {
            color1 = darkBaseColor;
            color2 = darkHighlightColor;
            color3 = darkShadowColor;
        }

        const worley = scrawl.makeNoiseAsset({
            name: `${name}-noise-generator`,
            colors: [
                [0, color2],
                [999, color1],
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
            radius: Math.round(fontSize * shadowBlur),
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
            startX: Math.round(fontSize * shadowOffsetY),
            startY: Math.round((fontSize * yOffset) + (fontSize * shadowOffsetY)),
            fillStyle: color3,
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

        responsiveFunctions.push((items = {}) => {

            const localFontSize = parseFloat(items.fontSize),
                localWidth = parseFloat(items.width),
                localHeight = parseFloat(items.height);

            worley.set({
                width: localWidth,
                height: localHeight,
            });

            f1.set({
                radius: Math.round(localFontSize * shadowBlur),
            });

            textStroke.set({
                startX: Math.round(localFontSize * shadowOffsetY),
                startY: Math.round((localFontSize * yOffset) + (localFontSize * shadowOffsetY)),
            });
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
