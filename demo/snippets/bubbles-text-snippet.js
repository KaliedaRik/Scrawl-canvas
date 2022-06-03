// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)
//
// ### 'Animated bubbles effect used to color text' snippet
//
// __Purpose:__ Displays text with an animation of rising bubbles over the text fill
// + This snippet supports dark-mode alternative colors
// + This snippet supports high contrast alternative colors
// + This snippet supports an animation effect which can be disabled in an accessible manner
//
// __Function input:__ 
// + the DOM element - generally a block or inline-block element.
//
// __Customisation:__ The snippet can be customised using the following data- attributes applied using CSS variables, or directly to the HTML header element:
// + `data-text-color` - any CSS color string
// + `data-dark-text-color` - any CSS color string
// + `data-outline-color` - any CSS color string
// + `data-dark-outline-color` - any CSS color string
// + `data-outline-width` - (unit % of font size) percentage of the font size for text outline width
// + `data-bubble-color` - any CSS color string
// + `data-dark-bubble-color` - any CSS color string
// + `data-bubble-outline-color` - any CSS color string
// + `data-dark-bubble-outline-color` - any CSS color string
// + `data-bubble-density` - the number of bubbles to generate
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
        let { canvas, group, dataset, compStyles, name, yOffset, fontSize, lineHeight, initCanvas, initPhrase, textGroup, eternalTweens, responsiveFunctions, contrastMoreActions, contrastOtherActions, colorSchemeDarkActions, colorSchemeLightActions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        // Initialise the canvas
        initCanvas();

        // Initialize and collect developer-supplied data
        let textColor = '#c213bc',
            darkTextColor = '#fcdeef',
            outlineColor = '#f59dcf',
            darkOutlineColor = '#f59dcf',
            outlineWidth = 0.05,
            bubbleColor = '#fcdeef',
            darkBubbleColor = '#ed5fb0',
            bubbleOutlineColor = '#c213bc',
            darkBubbleOutlineColor = '#c213bc',
            bubbleDensity = 50,
            contrastColor = 'black',
            darkContrastColor = 'white';

        if (dataset.textColor) textColor = dataset.textColor;
        else {
            const s = compStyles.getPropertyValue('--data-text-color');
            if (s) textColor = s;
        }

        if (dataset.darkTextColor) darkTextColor = dataset.darkTextColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-text-color');
            if (s) darkTextColor = s;
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

        if (dataset.bubbleColor) bubbleColor = dataset.bubbleColor;
        else {
            const s = compStyles.getPropertyValue('--data-bubble-color');
            if (s) bubbleColor = s;
        }

        if (dataset.darkBubbleColor) darkBubbleColor = dataset.darkBubbleColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-bubble-color');
            if (s) darkBubbleColor = s;
        }

        if (dataset.bubbleOutlineColor) bubbleOutlineColor = dataset.bubbleOutlineColor;
        else {
            const s = compStyles.getPropertyValue('--data-bubble-outline-color');
            if (s) bubbleOutlineColor = s;
        }

        if (dataset.darkBubbleOutlineColor) darkBubbleOutlineColor = dataset.darkBubbleOutlineColor;
        else {
            const s = compStyles.getPropertyValue('--data-dark-bubble-outline-color');
            if (s) darkBubbleOutlineColor = s;
        }

        if (dataset.bubbleDensity) bubbleDensity = parseFloat(dataset.bubbleDensity);
        else {
            const s = compStyles.getPropertyValue('--data-bubble-density');
            if (s) bubbleDensity = parseFloat(s);
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
        const bubblesGroup = scrawl.makeGroup({
            name: `${name}-bubbles-group`,
        });

        const fizz = scrawl.makeWheel({
            name: `${name}-bubbles-template`,
            group,
            order: 1,
            startY: '100%',
            handleX: 'center',
            handleY: 'center',
            fillStyle: bubbleColor,
            strokeStyle: bubbleOutlineColor,
            method: 'fillThenDraw',
            globalCompositeOperation: 'source-atop',
            noDeltaUpdates: true,
            noPositionDependencies: true,
            noFilters: true,
            noUserInteraction: true,
            purge: 'all',
        });

        bubblesGroup.addArtefacts(fizz);

        for (let i = 0; i < bubbleDensity; i++) {

            const bubble = fizz.clone({
                name: `${name}-bubble-${i}`,
                radius: Math.round((Math.random() * (fontSize / 2)) + 4),
                startX: `${Math.random() * 100}%`,
                noCanvasEngineUpdates: true,
                sharedState: true,
            });

            bubblesGroup.addArtefacts(bubble);

            const myRandom = Math.random();

            eternalTweens.push(scrawl.makeTween({
                name: bubble.name,
                targets: bubble,
                duration: Math.round((myRandom * 3000) + 5000),
                cycles: 0,
                definitions: [{
                    attribute: 'startY',
                    start: '100%',
                    end: '0%',
                }, {
                    attribute: 'scale',
                    start: 0.3,
                    end: Math.round((1 - myRandom) * 0.9) + 0.6,
                }],
            }).run());
        }

        const textFill = scrawl.makePhrase({
            name: `${name}-text-stencil`,
            group,
            fillStyle: textColor,
            underlineStyle: 'rgba(0 0 0 / 0)',
            method: 'fill',
            order: 0,
        });

        initPhrase(textFill);

        const textStroke = textFill.clone({
            name: `${name}-text-outline`,
            order: 2,
            strokeStyle: outlineColor,
            lineWidth: outlineWidth * fontSize,
            underlineStyle: outlineColor,
            method: 'draw',
        });

        textGroup.addArtefacts(textFill, textStroke);

        // Accessibility
        colorSchemeLightActions.push(() => {

            fizz.set({
                fillStyle: bubbleColor,
                strokeStyle: bubbleOutlineColor,
            });

            textFill.set({
                fillStyle: textColor,
            });

            textStroke.set({
                strokeStyle: outlineColor,
                underlineStyle: outlineColor,
            });
        });

        colorSchemeDarkActions.push(() => {

            fizz.set({
                fillStyle: darkBubbleColor,
                strokeStyle: darkBubbleOutlineColor,
            });

            textFill.set({
                fillStyle: darkTextColor,
            });

            textStroke.set({
                strokeStyle: darkOutlineColor,
                underlineStyle: darkOutlineColor,
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
                localRadius = localFontSize / 2;

            textStroke.set({
                lineWidth: outlineWidth * localFontSize,
            });

            bubblesGroup.setArtefacts({
                radius: Math.round((Math.random() * localRadius) + 4),
            });
        });

        // Cleanup
        additionalDemolishActions.push(() => {
            bubblesGroup.kill();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
