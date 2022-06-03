// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)
//
// ### 'Horizontally striped text with swirl animation' snippet
//
// __Purpose:__ Paints the text with a striped gradient pattern, and adds a swirl effect when the user moves their browser's cursor over the text
// + This snippet supports dark-mode alternative colors
// + This snippet does not support high contrast alternative colors
// + This snippet supports an animation effect which can be disabled in an accessible manner
//
// __Function input:__ 
// + the DOM element - generally a block or inline-block element.
//
// __Customisation:__ The snippet can be customised using the following data- attributes applied using CSS variables, or directly to the HTML header element:
// + `data-main-color` - any CSS color string
// + `data-dark-main-color` - any CSS color string
// + `data-stripe-color` - any CSS color string
// + `data-dark-stripe-color` - any CSS color string
// + `data-stripe-ratio` - (0 - 1) the ratio of stripe to main color; higher values show wider stripes
// + `data-swirl-angle` - (degrees) higher values lead to a tighter swirl; use negative values to reverse the swirl direction
// + `data-gradient-skew-x` - (-2 - 2) skew the gradient pattern horizontally
// + `data-gradient-skew-y` - (-2 - 2) skew the gradient pattern vertically
// + `data-gradient-stretch-x` - (0 - 4) stretch the gradient pattern horizontally
// + `data-gradient-stretch-y` - (0 - 4) stretch the gradient pattern vertically
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
        let { canvas, group, animation, compStyles, dataset, name, height, lineHeight, initCanvas, initPhrase, textGroup, responsiveFunctions, colorSchemeDarkActions, colorSchemeLightActions, animationFunctions, animationEndFunctions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        // Initialise the canvas
        initCanvas();

        // Initialize and collect developer-supplied data
        let mainColor = 'black',
            darkMainColor = 'white',
            stripeColor = 'red',
            darkStripeColor = '#e34e49',
            stripeRatio = 0.5,
            swirlAngle = 90,
            gradientSkewX = 0,
            gradientSkewY = 0,
            gradientStretchX = 1,
            gradientStretchY = 1;

        if (dataset.mainColor) mainColor = dataset.mainColor;
        else {
            const s = compStyles.getPropertyValue('--data-main-color');
            if (s) mainColor = s;
        }

        if (dataset.darkMainColor) darkMainColor = dataset.darkMainColor;
        else {
            const s = compStyles.getPropertyValue('--data-main-color');
            if (s) darkMainColor = s;
        }

        if (dataset.stripeColor) stripeColor = dataset.stripeColor;
        else {
            const s = compStyles.getPropertyValue('--data-stripe-color');
            if (s) stripeColor = s;
        }

        if (dataset.darkStripeColor) darkStripeColor = dataset.darkStripeColor;
        else {
            const s = compStyles.getPropertyValue('--data-stripe-color');
            if (s) darkStripeColor = s;
        }

        if (dataset.stripeRatio) stripeRatio = parseFloat(dataset.stripeRatio);
        else {
            const s = compStyles.getPropertyValue('--data-gradient-easing');
            if (s) stripeRatio = parseFloat(s);
        }

        if (dataset.swirlAngle) swirlAngle = parseFloat(dataset.swirlAngle);
        else {
            const s = compStyles.getPropertyValue('--data-swirl-angle');
            if (s) swirlAngle = parseFloat(s);
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

        // Build the text effect
        let gradientChangeAt = Math.floor(stripeRatio * 1000);
        if (gradientChangeAt < 1) gradientChangeAt = 1;
        if (gradientChangeAt > 997) gradientChangeAt = 997;

        const myGradient = scrawl.makeGradient({
            name: `${name}-swirlstripe-gradient`,
            colors: [
                [0, stripeColor],
                [gradientChangeAt, stripeColor],
                [gradientChangeAt + 1, mainColor],
                [999, mainColor],
            ],
            endY: '100%',
            precision: 10,
        });

        const cell = canvas.buildCell({
            name: `${name}-swirlstripe-gradient-cell`,
            width: 16,
            height: lineHeight,
            shown: false,
        });

        scrawl.makeBlock({
            name: `${name}-swirlstripe-gradient-block-0`,
            group: `${name}-swirlstripe-gradient-cell`,
            dimensions: ['100%', '20%'],
            fillStyle: `${name}-swirlstripe-gradient`,
            lockFillStyleToEntity: true,
        }).clone({
            name: `${name}-swirlstripe-gradient-block-1`,
            startY: '20%',
        }).clone({
            name: `${name}-swirlstripe-gradient-block-2`,
            startY: '40%',
        }).clone({
            name: `${name}-swirlstripe-gradient-block-3`,
            startY: '60%',
        }).clone({
            name: `${name}-swirlstripe-gradient-block-4`,
            startY: '80%',
        });

        const p1 = scrawl.makePattern({
            name: `${name}-swirlstripe-gradient-pattern`,
            asset: `${name}-swirlstripe-gradient-cell`,
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
            fillStyle: `${name}-swirlstripe-gradient-pattern`,
            globalCompositeOperation: 'source-in',
        });

        const swirl = scrawl.makeFilter({
            name: `${name}-swirl-filter`,
            method: 'swirl',
            startX: '50%',
            startY: '50%',
            innerRadius: 0,
            outerRadius: Math.ceil(lineHeight * 2),
            easing: 'easeOutIn',
            angle: swirlAngle,
            transparentEdges: true,
        });

        canvas.base.set({
            compileOrder: 1,
            memoizeFilterOutput: true,
        });

        // Accessibility
        colorSchemeLightActions.push(() => {
            myGradient.set({
                colors: [
                    [0, stripeColor],
                    [gradientChangeAt, stripeColor],
                    [gradientChangeAt + 1, mainColor],
                    [999, mainColor],
                ],
            });
        });

        colorSchemeDarkActions.push(() => {
            myGradient.set({
                colors: [
                    [0, darkStripeColor],
                    [gradientChangeAt, darkStripeColor],
                    [gradientChangeAt + 1, darkMainColor],
                    [999, darkMainColor],
                ],
            });
        });

        // Responsiveness
        responsiveFunctions.push((items = {}) => {

            const localLineHeight = parseFloat(items.lineHeight);

            cell.set({
                height: localLineHeight,
            });

            swirl.set({
                outerRadius: Math.ceil(localLineHeight * 2),
            });
        });

        // Additional animation functionality
        let isActive = false;

        animationFunctions.push(() => {

            const {x, y, active} = canvas.here;

            if (active & !isActive) {

                isActive = true;

                canvas.base.set({
                    filters: [swirl.name],
                });
            }
            else if (!active && isActive) {

                isActive = false;

                canvas.base.set({
                    filters: [],
                });
            }

            if (isActive) {

                swirl.set({
                    startX: x,
                    startY: y,
                });
            }
        });

        animationEndFunctions.push(() => {

            canvas.base.set({
                filters: [],
            });
        });

        // Cleanup
        additionalDemolishActions.push(() => {
            myGradient.kill();
            p1.kill();
            swirl.kill();
            cell.kill();
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
