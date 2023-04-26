// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)
//
// ### 'Two-color Risograph effect used to color text' snippet
//
// __Purpose:__ This effect is inspired by Risograph printing which uses a limited color palette, stippling colors to create a gradient effect.
// + This snippet supports dark-mode alternative colors
// + This snippet supports high contrast alternative colors
// + This snippet is not animated
//
// __Function input:__ 
// + the DOM element - generally a block or inline-block element.
//
// __Customisation:__ The snippet can be customised using the following data- attributes applied using CSS variables, or directly to the HTML header element:
// + `data-top-color` - any CSS color string
// + `data-dark-top-color` - any CSS color string
// + `data-bottom-color` - any CSS color string
// + `data-dark-bottom-color` - any CSS color string
// + `data-outline-color` - any CSS color string
// + `data-dark-outline-color` - any CSS color string
// + `data-outline-width` - (unit % of font size) outline width as a percentage of the font size
// + `data-random-radius` - (0 - 1) the amount of mixing of the top and bottom colors
// + `data-random-level` - (0 - 1) the density of the color mixing
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
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    // Only proceed if the snippet is successfully generated
    if (snippet) {

        // Import data and functionality from the Text Snippet Helper module
        let { canvas, group, dataset, compStyles, name, fontSize, lineHeight, initCanvas, initPhrase, textGroup, responsiveFunctions, contrastMoreActions, contrastOtherActions, colorSchemeDarkActions, colorSchemeLightActions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        // Initialise the canvas
        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        });

        // Initialize and collect developer-supplied data
        let topColor = 'lightblue',
            darkTopColor = '#d7e3f5',
            bottomColor = 'blue',
            darkBottomColor = '#598ad9',
            outlineColor = 'black',
            darkOutlineColor = '#f4f5d7',
            outlineWidth = 0.03,
            randomRadius = 0.8,
            randomLevel = 1,
            contrastColor = 'black',
            darkContrastColor = 'white';

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
            lowColor: bottomColor,
            highColor: topColor,
        });

        const cell = canvas.buildCell({
            name: `${name}-riso-cell`,
            width: 32,
            height: lineHeight,
            cleared: false,
            compiled: false,
            shown: false,
            useAsPattern: true,
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

        // Accessibility
        colorSchemeLightActions.push(() => {
            f2.set({
                lowColor: bottomColor,
                highColor: topColor,
            });
            cell.clear();
            cell.compile();
            textStroke.set({
                strokeStyle: outlineColor,
            });
        });

        colorSchemeDarkActions.push(() => {
            f2.set({
                lowColor: darkBottomColor,
                highColor: darkTopColor,
            });
            cell.clear();
            cell.compile();
            textStroke.set({
                strokeStyle: darkOutlineColor,
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

        // Cleanup
        additionalDemolishActions.push(() => {
            f1.kill();
            f2.kill();
            g1.kill();
            p1.kill();
            cell.kill();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
}
