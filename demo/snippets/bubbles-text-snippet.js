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

        let { canvas, group, dataset, compStyles, name, yOffset, fontSize, lineHeight, initCanvas, initPhrase, textGroup, eternalTweens, responsiveFunctions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
        if (contrastMediaQuery.matches) {
            return { error: 'User has indicated they want maximum contrast' };
        }

        initCanvas();

        let textColor = '#c213bc',
            darkTextColor = '#fcdeef',
            outlineColor = '#f59dcf',
            darkOutlineColor = '#f59dcf',
            outlineWidth = 0.05,
            bubbleColor = '#fcdeef',
            darkBubbleColor = '#ed5fb0',
            bubbleOutlineColor = '#c213bc',
            darkBubbleOutlineColor = '#c213bc',
            bubbleDensity = 50;

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

        let bubbleFillColor = bubbleColor,
            bubbleStrokeColor = bubbleOutlineColor,
            textFillColor = textColor,
            textStrokeColor = outlineColor;

        const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (colorSchemeMediaQuery.matches) {
            bubbleFillColor = darkBubbleColor;
            bubbleStrokeColor = darkBubbleOutlineColor;
            textFillColor = darkTextColor;
            textStrokeColor = darkOutlineColor;
        }

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
            fillStyle: bubbleFillColor,
            strokeStyle: bubbleStrokeColor,
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
            fillStyle: textFillColor,
            underlineStyle: textFillColor,
            method: 'fill',
            order: 0,
        });

        initPhrase(textFill);

        const textStroke = textFill.clone({
            name: `${name}-text-outline`,
            order: 2,
            strokeStyle: textStrokeColor,
            lineWidth: outlineWidth * fontSize,
            underlineStyle: 'transparent',
            method: 'draw',
        });

        textGroup.addArtefacts(textFill, textStroke);

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

        additionalDemolishActions.push(() => {
            bubblesGroup.kill();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
