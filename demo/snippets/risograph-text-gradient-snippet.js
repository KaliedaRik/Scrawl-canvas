// # Demo Snippets 006
// Editable header elements with various text fill effects 
//
// Related files:
// + [Editable header elements with various text color effects](../snippets-006.html)


// ### 'Risograph text gradient' snippet
//
// __Purpose:__ imports the element's text and adds an animated gradient effect to it.
//
// __Function input:__ 
// + the DOM element - generally a block or inline-block element.
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
// import wordGradient from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => wordGradient(el));
// ```


// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import * as scrawl from '../../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// __Effects on the element:__ 
// + Imports the element's background color, and sets the element background to `transparent`
// + Imports the element's text node text, and sets the text color to `transparent`
// + ___Note that canvas text will NEVER be as good as DOM text!___
export default function (el) {

    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // Set some convenience variables
        let canvas = snippet.canvas,
            group = canvas.base.name,
            animation = snippet.animation,
            wrapper = snippet.element,
            compStyles = wrapper.elementComputedStyles,
            name = wrapper.name,
            dataset = el.dataset;

        // Background color has to be suppressed to allow the canvas to show behind the text. We can move the background color to the canvas element
        let backgroundColor = compStyles.backgroundColor;

        if (backgroundColor) {

            canvas.set({
                backgroundColor,
            });
            el.style.backgroundColor = 'transparent';
        }

        canvas.base.set({
            compileOrder: 1,
        })

        // Text color also has to be suppressed, to prevent it showing over the canvas text. But we need it to remain in place so that user can select/copy text as normal, and screen readers can read it
        el.style.color = 'rgba(0,0,0,0)';

        // The snippet will take details of its font family and size from the DOM element's computed styles
        const {fontStyle, fontVariant, fontWeight, fontSize, fontFamily, lineHeight, width, height} = compStyles;

        const yOffset = dataset.yOffset ? parseFloat(dataset.yOffset) : 0;
        const lineheightAdjuster = dataset.lineheightAdjuster ? parseFloat(dataset.lineheightAdjuster) : 1;
        const topColor = dataset.topColor ? dataset.topColor : 'lightblue';
        const bottomColor = dataset.bottomColor ? dataset.bottomColor : 'blue';
        const randomRadius = dataset.randomRadius ? parseFloat(dataset.randomRadius) : '50';
        const randomLevel = dataset.randomLevel ? parseFloat(dataset.randomLevel) : '1';

        const outlineColor = dataset.outlineColor ? dataset.outlineColor : 'black';
        const outlineWidth = dataset.outlineWidth ? dataset.outlineWidth : '1';

        scrawl.makeGradient({
            name: `${name}-riso-gradient`,
            colors: [
                [0, 'white'],
                [999, 'black'],
            ],
            startY: '-20%',
            endY: '120%',
        });

        scrawl.makeFilter({
            name: `${name}-random-filter`,
            method: 'randomNoise',
            height: randomRadius,
            level: randomLevel,
        });

        scrawl.makeFilter({
            name: `${name}-threshold-filter`,
            method: 'threshold',
            level: 127,
            lowColor: bottomColor,
            highColor: topColor,
        });

        const cell = canvas.buildCell({
            name: `${name}-riso-cell`,
            width: '100%',
            height: parseFloat(lineHeight),
            cleared: false,
            compiled: false,
            shown: false,
        });

        scrawl.makeBlock({
            name: `${name}-riso-block`,
            group: `${name}-riso-cell`,
            // dimensions: ['100%', '200%'],
            // startY: '-50%',
            dimensions: ['100%', '100%'],
            fillStyle: `${name}-riso-gradient`,
            lockFillStyleToEntity: true,
            filters: [`${name}-random-filter`, `${name}-threshold-filter`],
        });

        cell.compile();

        scrawl.makePattern({
            name: `${name}-riso-pattern`,
            asset: `${name}-riso-cell`,
        });

        const textFill = scrawl.makePhrase({

            name: `${name}-text-stencil`,
            group,
            order: 0,

            style: fontStyle, 
            variant: fontVariant, 
            weight: fontWeight, 
            size: fontSize, 
            family: fontFamily,
            width: '100%',

            // Because the lineHeight computed style is a px length, not a unitless number
            lineHeight: (parseFloat(lineHeight) / parseFloat(fontSize)) * lineheightAdjuster,

            text: el.innerText, 

            startY: yOffset,
            method: 'fill',

            exposeText: false,

        });

        const textStroke = textFill.clone({

            name: `${name}-text-outline`,
            order: 2,
            lineWidth: parseFloat(outlineWidth),
            strokeStyle: outlineColor,
            method: 'draw',
        });

        scrawl.makeBlock({

            name: `${name}-text-fill`,
            group,
            order: 1,

            width: '100%',
            height: '100%',

            fillStyle: `${name}-riso-pattern`,
            globalCompositeOperation: 'source-in',
        });

        const updateText = (e) => {
            textFill.set({ text: el.innerText });
            textStroke.set({ text: el.innerText });
        }
        const focusText = (e) => el.style.color = 'rgba(0,0,0,0.2)';
        const blurText = (e) => el.style.color = 'rgba(0,0,0,0)';

        scrawl.addNativeListener('input', updateText, el);
        scrawl.addNativeListener('focus', focusText, el);
        scrawl.addNativeListener('blur', blurText, el);
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};

console.log(scrawl.library);