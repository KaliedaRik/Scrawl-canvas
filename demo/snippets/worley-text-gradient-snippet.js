// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)
//
// ### 'Worley noise used to color text' snippet
//
// __Purpose:__ Worley noise is a form of procedural texture which can be generated and used to simulate textures which look (a bit) like stone, water or biological cells.
// + This snippet supports dark-mode alternative colors
// + This snippet supports high contrast alternative colors
// + This snippet is not animated
//
// __Function input:__
// + the DOM element - generally a block or inline-block element.
//
// __Customisation:__ The snippet can be customised using the following data- attributes applied using CSS variables, or directly to the HTML header element:
// + `data-base-color` - any CSS color string
// + `data-dark-base-color` - any CSS color string
// + `data-highlight-color` - any CSS color string
// + `data-dark-highlight-color` - any CSS color string
// + `data-noise-sum-function` - permitted values include: `none`, `sine-x`, `sine-y`, `sine`, `modular`, `random`
// + `data-noise-scale` - (+number) a form of zoom level
// + `data-noise-output` - permitted values include: `X`, `YminusX`, `ZminusX`, etc</li>
// + `data-shadow-color` - any CSS color string, for the text shadow
// + `data-dark-shadow-color` - any CSS color string, for the text shadow
// + `data-shadow-offset-x` - (unit % of font size) percentage of the font size to offset the text shadow horizontally
// + `data-shadow-offset-y` - (unit % of font size) percentage of the font size to offset the text shadow vertically
// + `data-shadow-blur` - (unit % of font size) percentage of the font size to blur the shadow
// + `data-contrast-color` - any CSS color string, used when user has set `prefers-contrast: more`
// + `data-dark-contrast-color` - any CSS color string, used when user has set `prefers-contrast: more`
//
// __Function output:__ a Javascript object will be returned, containing the following attributes
// ```
// {
//     element     // the Scrawl-canvas wrapper for the DOM element supplied to the function
//     canvas      // the Scrawl-canvas wrapper for the snippet's canvas
//     animation   // the Scrawl-canvas animation object
//     demolish    // remove the snippet from the Scrawl-canvas library
// }
// ```
// ##### Usage example:
// ```
// import * as scrawl from 'path/to/scrawl-canvas/library';
//
// import mySnippet from './relative/or/absolute/path/to/this/file.js';
// let myElements = document.querySelectorAll('.some-class');
// myElements.forEach(el => mySnippet(el, scrawl));
// ```

// Additional font-specific customisation can be added courtesy of the Text Snippet Helper module
import { getSnippetData } from './text-snippet-helper.js';

// __Effects on the element:__
// + Imports the element's background color, and sets the element background to `transparent`
// + Imports the element's text node text, and sets the text color to `transparent`
// + ___Note that canvas text will NEVER be as good as DOM text!___
export default function (el, scrawl) {

    // Apply the snippet to the DOM element
    const snippet = scrawl.makeSnippet({
        domElement: el,
    });

    // Only proceed if the snippet is successfully generated
    if (snippet) {

        // Import data and functionality from the Text Snippet Helper module
        const { canvas, group, dataset, compStyles, name, width, height, fontSize, yOffset, initCanvas, initPhrase, textGroup, responsiveFunctions, contrastMoreActions, contrastOtherActions, colorSchemeDarkActions, colorSchemeLightActions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        // Initialise the canvas
        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        });

        // Initialize and collect developer-supplied data
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
            shadowBlur = 0,
            contrastColor = 'black',
            darkContrastColor = 'white';

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

        if (dataset.contrastColor) contrastColor = dataset.contrastColor;
        else {
            const s = compStyles.getPropertyValue('--data-contrast-color');
            if (s) contrastColor = s;
        }

        if (dataset.darkContrastColor) darkContrastColor = dataset.darkContrastColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-contrast-color');
            if (s) darkContrastColor = s;
        }

        // Build the text effect
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
            startX: Math.round(fontSize * shadowOffsetX),
            startY: Math.round((fontSize * yOffset) + (fontSize * shadowOffsetY)),
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

        // Accessibility
        colorSchemeLightActions.push((items = {}) => {

            const localWidth = parseFloat(items.width),
                localHeight = parseFloat(items.height);

            worley.set({
                colors: [
                    [0, highlightColor],
                    [999, baseColor],
                ],
                width: localWidth,
                height: localHeight,
            });

            textStroke.set({
                fillStyle: shadowColor,
            });
        });

        colorSchemeDarkActions.push((items = {}) => {

            const localWidth = parseFloat(items.width),
                localHeight = parseFloat(items.height);

            worley.set({
                colors: [
                    [0, darkHighlightColor],
                    [999, darkBaseColor],
                ],
                width: localWidth,
                height: localHeight,
            });

            textStroke.set({
                fillStyle: darkShadowColor,
            });
        });

        contrastMoreActions.push(() => {
            el.style.color = (canvas.here.prefersDarkColorScheme) ? darkContrastColor : contrastColor;
            textGroup.setArtefacts({
                visibility: false,
            });
        });

        contrastOtherActions.push(() => {
            el.style.color = 'transparent';
            textGroup.setArtefacts({
                visibility: true,
            });
        });

        // Responsiveness
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
                startX: Math.round(localFontSize * shadowOffsetX),
                startY: Math.round((localFontSize * yOffset) + (localFontSize * shadowOffsetY)),
            });
        });

        // Cleanup
        additionalDemolishActions.push(() => {
            f1.kill();
            p1.kill();
            worley.kill();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
}
