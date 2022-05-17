// # Demo Snippets 006
// Editable header elements with various text fill effects 
//
// Related files:
// + [Editable header elements with various text color effects](../snippets-006.html)


// ### 'Worley text gradient' snippet
//
// __Purpose:__ imports the element's text and adds Worley noise effect to it.
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

        // Text color also has to be suppressed, to prevent it showing over the canvas text. But we need it to remain in place so that user can select/copy text as normal, and screen readers can read it
        el.style.color = 'rgba(0,0,0,0)';

        // The snippet will take details of its font family and size from the DOM element's computed styles
        const {fontStyle, fontVariant, fontWeight, fontSize, fontFamily, lineHeight, width, height} = compStyles;

        const yOffset = dataset.yOffset ? parseFloat(dataset.yOffset) : 0;
        const lineheightAdjuster = dataset.lineheightAdjuster ? parseFloat(dataset.lineheightAdjuster) : 1;
        const baseColor = dataset.baseColor ? dataset.baseColor : 'black';
        const highlightColor = dataset.highlightColor ? dataset.highlightColor : 'orange';
        const noiseSumFunction = dataset.noiseSumFunction ? dataset.noiseSumFunction : 'random';
        const noiseScale = dataset.noiseScale ? parseFloat(dataset.noiseScale) : '50';

        const outlineColor = dataset.outlineColor ? dataset.outlineColor : 'black';
        const outlineWidth = dataset.outlineWidth ? dataset.outlineWidth : '1';

        const worley = scrawl.makeNoiseAsset({

          name: `${name}-noise-generator`,

          colors: [
            [0, highlightColor],
            [999, baseColor],
          ],
          colorSpace: 'LAB',

          noiseEngine: 'worley-euclidean',
          sumFunction: noiseSumFunction,
          scale: parseFloat(noiseScale),
          width: Math.ceil(parseFloat(width)),
          height: Math.ceil(parseFloat(height)),
        });

        scrawl.makePattern({
          name: `${name}-noise-pattern`,
          asset: `${name}-noise-generator`,
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

            // This is a bad fix for mis-aligned text - a better solution would be to expose startX and startY so coder could set them individually for each instance where this snippet is used, so the replacement canvas text can line up exactly with its surrounding text
            startY: yOffset,
            method: 'fill',

            // We do not want to expose this canvas text in the DOM as it already exists in the DOM (this snippet just makes it invisible by setting its color to 'transparent'). The last thing non-visual users need is repeated text.
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

            fillStyle: `${name}-noise-pattern`,
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
