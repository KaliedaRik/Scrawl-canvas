// # Demo Snippets 006
// Editable header element color font snippets
//
// Related files:
// + [Editable header element color font snippets](../snippets-006.html)
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

        let { canvas, group, dataset, name, yOffset, lineHeight, initCanvas, initPhrase, textGroup, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        initCanvas();

        const textColor = dataset.textColor ? dataset.textColor : 'darkblue';
        const outlineColor = dataset.outlineColor ? dataset.outlineColor : 'black';
        const outlineWidth = dataset.outlineWidth ? parseFloat(dataset.outlineWidth) : 2;
        const bubbleMaxColor = dataset.bubbleMaxColor ? dataset.bubbleMaxColor : 'lightblue';
        const bubbleMinColor = dataset.bubbleMinColor ? dataset.bubbleMinColor : 'pink';
        const bubbleOutlineColor = dataset.bubbleOutlineColor ? dataset.bubbleOutlineColor : 'white';
        const bubbleDensity = dataset.bubbleDensity ? parseFloat(dataset.bubbleDensity) : 50;

        const fizz = scrawl.makeWheel({
            name: `${name}-bubbles-template`,
            group,
            order: 1,
            startY: '100%',
            handleX: 'center',
            handleY: 'center',
            strokeStyle: bubbleOutlineColor,
            method: 'fillThenDraw',
            globalCompositeOperation: 'source-atop',
            visibility: false,
            noDeltaUpdates: true,
            noPositionDependencies: true,
            noFilters: true,
            noUserInteraction: true,
        });

        const colorFactory = scrawl.makeColor({
            name: `${name}-bubbles-color-factory`,
            minimumColor: bubbleMinColor,
            maximumColor: bubbleMaxColor,
            internalColorSpaces: 'LAB',
        });

        const tweens = [];

        for (let i = 0; i < bubbleDensity; i++) {

            const bubble = fizz.clone({
                name: `${name}-bubble-${i}`,
                radius: Math.round((Math.random() * 20) + 20),
                fillStyle: colorFactory.getRangeColor(Math.random()),
                startX: `${Math.random() * 100}%`,
                visibility: true,
                purge: 'all',
            });

            const myRandom = Math.random();

            tweens.push(scrawl.makeTween({
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
                }, {
                    attribute: 'globalAlpha',
                    start: 1,
                    end: 0.2,
                }],
            }).run());
        }

        const textFill = scrawl.makePhrase({
            name: `${name}-text-stencil`,
            group,
            fillStyle: textColor,
            underlineStyle: textColor,
            method: 'fill',
            order: 0,
        });

        initPhrase(textFill);

        const textStroke = textFill.clone({
            name: `${name}-text-outline`,
            order: 2,
            strokeStyle: outlineColor,
            lineWidth: outlineWidth,
            underlineStyle: 'transparent',
            method: 'draw',
        });

        textGroup.addArtefacts(textFill, textStroke);

        // scrawl.makeBlock({
        //     name: `${name}-text-fill`,
        //     group,
        //     order: 1,
        //     width: '100%',
        //     height: '100%',
        //     fillStyle: `${name}-bubbles-pattern`,
        //     globalCompositeOperation: 'source-in',
        // });

        const killTweens = () => tweens.forEach(t => t.kill());

        additionalDemolishActions.push(() => {
            // cell.kill();
            // pattern.kill();
            colorFactory.kill();
            killTweens();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
