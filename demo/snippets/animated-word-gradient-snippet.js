// # Demo Snippets 004
// Snippets included in the Scrawl-canvas demo/snippets folder
//
// Related files:
// + [Snippets included in the Scrawl-canvas demo/snippets folder](../snippets-004.html)
// + [Animated hover gradient snippet](./animated-hover-gradient-snippet.html)
// + [Animated word gradient snippet](./animated-word-gradient-snippet.html)
// + [Green box snippet](./green-box-snippet.html)
// + [Jazzy button snippet](./jazzy-button-snippet.html)
// + [Page performance snippet](./page-performance-snippet.html)
// + [Pan image snippet](./pan-image-snippet.html)
// + [Placeholder effect snippet](./placeholder-effect-snippet.html)
// + [Ripple effect snippet](./ripple-effect-snippet.html)
// + [Spotlight text snippet](./spotlight-text-snippet.html)
// + [Word highlighter snippet](./word-highlighter-snippet.html)


// ### 'Animated word gradient' snippet
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
// myElements.forEach(el => wordGradient(scrawl, el));
// ```


// __Effects on the element:__
// + Imports the element's background color, and sets the element background to `transparent`
// + Imports the element's text node text, and sets the text color to `transparent`
// + ___Note that canvas text will NEVER be as good as DOM text!___
export default function (scrawl, el) {

    // Apply the snippet to the DOM element
    const snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // Set some convenience variables
        const canvas = snippet.canvas,
            group = canvas.base.name,
            animation = snippet.animation,
            wrapper = snippet.element,
            compStyles = wrapper.elementComputedStyles,
            name = wrapper.name;

        // The snippet will take details of its font family and size from the DOM element's computed styles
        // + Note that Firefox does not supply a font string; font details are broken up into their constituent parts and need to be reconstructed. The code below will not pick up bold fonts:
        const backgroundColor = compStyles.backgroundColor || '#f2f2f2',
            fontString = compStyles.font || `${(compStyles.fontStyle != 'normal') ? compStyles.fontStyle + ' ' : ''}${(compStyles.fontVariant != 'normal') ? compStyles.fontVariant + ' ' : ''}${compStyles.fontSize} ${compStyles.fontFamily}` || '20px sans-serif';

        canvas.set({
            backgroundColor,
        });
        el.style.backgroundColor = 'transparent';
        el.style.color = 'transparent';

        const animatedGradient = scrawl.makeGradient({
            name: `${name}-gradient`,
            start: [0, '-150%'],
            end: [0, '250%'],
            paletteStart: 0,
            paletteEnd: 299,
            delta: {
                paletteStart: -1,
                paletteEnd: -1,
            },
            cyclePalette: true,
        })
        .updateColor(0, 'orange')
        .updateColor(89, 'orange')
        .updateColor(110, 'red')
        .updateColor(289, 'red')
        .updateColor(310, 'lightblue')
        .updateColor(489, 'lightblue')
        .updateColor(510, 'gold')
        .updateColor(689, 'gold')
        .updateColor(710, 'green')
        .updateColor(889, 'green')
        .updateColor(910, 'orange')
        .updateColor(999, 'orange');

        scrawl.makePhrase({
            name: `${name}-text`,
            group,
            font: fontString,
            text: el.innerText,
            fillStyle: `${name}-gradient`,

            // This is a bad fix for mis-aligned text - a better solution would be to expose startX and startY so coder could set them individually for each instance where this snippet is used, so the replacement canvas text can line up exactly with its surrounding text
            startY: '16%',
            method: 'fill',

            // We do not want to expose this canvas text in the DOM as it already exists in the DOM (this snippet just makes it invisible by setting its color to 'transparent'). The last thing non-visual users need is repeated text.
            exposeText: false,
        });

        animation.set({
            commence: () => animatedGradient.updateByDelta(),
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
}
