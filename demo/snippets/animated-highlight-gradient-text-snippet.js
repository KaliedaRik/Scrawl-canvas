// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)
//
// ### 'Animated gradient effect used to color text' snippet
//
// __Purpose:__ Displays text with an animated gradient over the text fill
// + This snippet supports dark-mode alternative colors
// + This snippet supports high contrast alternative colors
// + This snippet supports an animation effect which can be disabled in an accessible manner
//
// __Function input:__
// + the DOM element - generally a block or inline-block element.
//
// __Customisation:__ The snippet can be customised using the following data- attributes applied using CSS variables, or directly to the HTML header element:
// + `data-base-color` - any CSS color string
// + `data-main-color` - any CSS color string
// + `data-dark-main-color` - any CSS color string
// + `data-highlight-color` - any CSS color string
// + `data-dark-highlight-color` - any CSS color string
// + `data-gradient-easing` - (string) easing function, for example: `linear`, `easeOutIn3`, etc
// + `data-gradient-skew-x` - (-2 - 2) skew the gradient pattern horizontally
// + `data-gradient-skew-y` - (-2 - 2) skew the gradient pattern vertically
// + `data-gradient-stretch-x` - (0 - 4) stretch the gradient pattern horizontally
// + `data-gradient-stretch-y` - (0 - 4) stretch the gradient pattern vertically
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
        const { canvas, group, compStyles, dataset, name, lineHeight, initCanvas, initPhrase, textGroup, responsiveFunctions, contrastMoreActions, contrastOtherActions, colorSchemeDarkActions, colorSchemeLightActions, animationFunctions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        // Initialise the canvas
        initCanvas();

        canvas.base.set({
            compileOrder: 1,
        })

        // Initialize and collect developer-supplied data
        let mainColor = 'black',
            highlightColor = 'lightgreen',
            darkMainColor = 'ivory',
            darkHighlightColor = 'green',
            gradientEasing = 'linear',
            gradientSkewX = 0,
            gradientSkewY = 0,
            gradientStretchX = 1,
            gradientStretchY = 1,
            contrastColor = 'black',
            darkContrastColor = 'white';

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
            precision: 4,
        });

        const cell = canvas.buildCell({
            name: `${name}-highlight-gradient-cell`,
            width: 16,
            height: lineHeight,
            shown: false,
            useAsPattern: true,
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

        // Accessibility
        colorSchemeLightActions.push(() => {
            myGradient.set({
                colors: [
                    [0, mainColor],
                    [199, highlightColor],
                    [399, mainColor],
                    [599, highlightColor],
                    [799, mainColor],
                    [999, mainColor],
                ],
            });
        });

        colorSchemeDarkActions.push(() => {
            myGradient.set({
                colors: [
                    [0, darkMainColor],
                    [199, darkHighlightColor],
                    [399, darkMainColor],
                    [599, darkHighlightColor],
                    [799, darkMainColor],
                    [999, darkMainColor],
                ],
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

            const localLineHeight = parseFloat(items.lineHeight);

            cell.set({
                height: localLineHeight,
            });
        });

        // Additional animation functionality
        animationFunctions.push(() => myGradient.updateByDelta());

        // Cleanup
        additionalDemolishActions.push(() => {
            myGradient.kill();
            p1.kill();
            cell.kill();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
}
