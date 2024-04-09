// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
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
// __Customisation:__ The snippet can be customised using the following `--data-???` CSS custom properties:
// + `--data-main-color` - any CSS color string (default: `black`)
// + `--data-dark-main-color` - any CSS color string (default: `ivory`)
// + `--data-highlight-color` - any CSS color string (default: `lightgreen`)
// + `--data-dark-highlight-color` - any CSS color string (default: `darkgreen`)
// + `--data-gradient-easing` - (string) easing function, for example: `linear`, `easeOutIn3`, etc (default: `linear`)
// + `--data-gradient-skew-x` - (-2 - 2) skew the gradient pattern horizontally (default: `0`)
// + `--data-gradient-skew-y` - (-2 - 2) skew the gradient pattern vertically (default: `0`)
// + `--data-gradient-stretch-x` - (0 - 4) stretch the gradient pattern horizontally (default: `1`)
// + `--data-gradient-stretch-y` - (0 - 4) stretch the gradient pattern vertically (default: `1`)
// + `--data-contrast-color` - any CSS color string, used when user has set `prefers-contrast: more` (default: `black`)
// + `data-dark-contrast-color` - any CSS color string, used when user has set `prefers-contrast: more` (default: `white`)
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
// myElements.forEach(el => mySnippet(scrawl, el));
// ```
//
// __Effects on the element:__
// + Imports the element's background color, and sets the element background to `transparent`
// + Imports the element's text node text, and sets the text color to `transparent`
export default function (scrawl, el) {

    // Boilerplate - namespacing
    const namespace = el.id;
    const name = (val) => `${namespace}-${val}`;


    // Only progress if the supplied element has an `id` attribute
    if (namespace) {


        // Create the snippet for this DOM element
        const snippet = scrawl.makeSnippet({
            domElement: el,
        });


        // Only proceed if the snippet is successfully generated
        if (snippet) {


            // Unpack the snippet into the parts we'll be using
            const canvas = snippet.canvas,
                animation = snippet.animation,
                demolishAction = snippet.demolish,
                compStyles = snippet.element.elementComputedStyles;


            // Boilerplate - text processing
            const addTextNode = () => {
                const shy = document.createTextNode('!');
                el.appendChild(shy);
            };

            const processText = t => {
                t = t.replace(/<canvas.*<\/canvas>/gi, '');
                t = t.replace(/<button.*<\/button>/gi, '');
                if (!t.length) {
                    addTextNode();
                    t = '!';
                }
                return t;
            }


            // Boilerplate - demolish/kill functionality
            const additionalDemolishActions = [];

            snippet.demolish = () => {
                additionalDemolishActions.forEach(f => f());
                scrawl.purge(namespace);
                demolishAction();
            };


            // This makes the canvas element's base cell the default group for everything we create
            canvas.setAsCurrentCanvas();


            // Boilerplate - fix for text alignment
            const getJustifyLine = (val) => {

                if (val === 'justify') return 'space-between';
                if (val === 'justify-all') return 'space-around';
                if (val === 'match-parent') return 'start';
                return val;
            };


            // Boilerplate - fix for lineSpacing/lineHeight
            const getLineSpacing = () => parseFloat(compStyles.lineHeight) / parseFloat(compStyles.fontSize);


            // Initialize and collect developer-supplied data
            // + We also set the defaults here for missing colors/values
            const userData = {

                direction: compStyles.direction || 'ltr',
                fontStretch: compStyles.fontStretch || 'normal',
                letterSpacing: compStyles.letterSpacing || '0px',
                wordSpacing: compStyles.wordSpacing || '0px',
                fontVariantCaps: compStyles.fontVariantCaps || 'normal',
                lineAdjustment: compStyles.getPropertyValue('--data-line-adjustment') || '0',
                justifyLine: getJustifyLine(compStyles.textAlign),

                elBackgroundColor: compStyles.backgroundColor || 'transparent',

                mainColor: compStyles.getPropertyValue('--data-main-color') || 'black',
                darkMainColor: compStyles.getPropertyValue('--data-dark-main-color') || 'ivory',
                highlightColor: compStyles.getPropertyValue('--data-highlight-color') || 'lightgreen',
                darkHighlightColor: compStyles.getPropertyValue('--data-dark-highlight-color') || 'darkgreen',
                gradientEasing: compStyles.getPropertyValue('--data-gradient-easing').trim() || 'linear',
                gradientSkewX: compStyles.getPropertyValue('--data-gradient-skew-x') || '0',
                gradientSkewY: compStyles.getPropertyValue('--data-gradient-skew-y') || '0',
                gradientStretchX: compStyles.getPropertyValue('--data-gradient-stretch-x') || '1',
                gradientStretchY: compStyles.getPropertyValue('--data-gradient-stretch-y') || '1',
                contrastColor: compStyles.getPropertyValue('--data-contrast-color') || 'black',
                darkContrastColor: compStyles.getPropertyValue('--data-dark-contrast-color') || 'white',
            };


            // Build the animated highlight gradient effect
            const myGradient = scrawl.makeGradient({
                name: name('highlight-gradient'),
                colors: [
                    [0, userData.mainColor],
                    [199, userData.highlightColor],
                    [399, userData.mainColor],
                    [599, userData.highlightColor],
                    [799, userData.mainColor],
                    [999, userData.mainColor],
                ],
                endY: '100%',
                delta: {
                    paletteStart: -3,
                    paletteEnd: -3,
                },
                cyclePalette: true,
                easing: userData.gradientEasing,
                precision: 4,
                animateByDelta: true,
            });

            const cell = canvas.buildCell({
                name: name('highlight-gradient-cell'),
                width: 16,
                height: parseFloat(compStyles.lineHeight),
                cleared: false,
                compiled: false,
                shown: false,
            });

            scrawl.makeBlock({
                name: name('highlight-gradient-block'),
                group: name('highlight-gradient-cell'),
                dimensions: ['100%', '100%'],
                fillStyle: name('highlight-gradient'),
            });

            scrawl.makePattern({
                name: name('highlight-gradient-pattern'),
                asset: name('highlight-gradient-cell'),
                stretchX: parseFloat(userData.gradientStretchX),
                stretchY: parseFloat(userData.gradientStretchY),
                skewX: parseFloat(userData.gradientSkewX),
                skewY: parseFloat(userData.gradientSkewY),
            });

            const template = scrawl.makeBlock({
                name: name('template'),
                dimensions: ['100%', '100%'],
                visibility: false,
            });

            const label = scrawl.makeEnhancedLabel({
                name: name('content'),
                layoutTemplate: name('template'),

                text: processText(el.innerHTML),
                fontString: compStyles.font,

                textHandleY: 'alphabetic',
                visibility: false,
                cacheOutput: false,

                direction: userData.direction,
                fontStretch: userData.fontStretch,
                letterSpacing: userData.letterSpacing,
                wordSpacing: userData.wordSpacing,
                fontVariantCaps: userData.fontVariantCaps,
                lineSpacing: getLineSpacing(),
                justifyLine: userData.justifyLine,

                fillStyle: name('highlight-gradient-pattern'),
            });


            // Boilerplate - font adjustments
            let meta;

            const getLineAdjustment = () => {

                const size = parseFloat(compStyles.fontSize);
                const ratio = size / 100;
                return ratio * (meta.alphabeticBaseline + meta.verticalOffset + parseFloat(userData.lineAdjustment));
            };

            const updateOnFontLoad = () => {

                const font = compStyles.fontFamily,
                    check = scrawl.checkFontIsLoaded(font);

                if (check) {

                    el.style.backgroundColor = 'transparent';
                    el.style.color = 'transparent';

                    meta = scrawl.getFontMetadata(font);

                    const displacement = getLineAdjustment();

                    template.set({
                        startY: displacement,
                        handleY: displacement,
                        fillStyle: userData.elBackgroundColor,
                        visibility: true,
                    });

                    cell.set({
                        cleared: true,
                        compiled: true,
                    });

                    label.set({ visibility: true });

                    animation.updateHook('commence');
                }
            };

            animation.updateHook('commence', updateOnFontLoad);


            // Boilerplate user interaction - resizing the browser window
            let resizeFlag = true,
                lastResize = Date.now();

            const resizeChoke = 200;

            const setResizeFlag = () => {

                resizeFlag = true;

                const now = Date.now();

                // Canvases don't animate when outside of the browser viewport (to save CPU, battery, etc)
                // + This check forces those canvases to update once to adapt to the new viewport size
                // + Doing this should prevent unexpected horizontal scrollbars appearing on the page
                // + Should also minimize flashes of badly sized content when canvas scrolls into view
                if (!animation.isRunning() && now > lastResize + resizeChoke) {

                    resizeAction();
                    animation.updateOnce();
                    lastResize = now;
                }
            };

            const resizeAction = () => {

                if (resizeFlag) {

                    resizeFlag = false;

                    cell.set({ height: parseFloat(compStyles.lineHeight) });

                    label.set({ fontString: compStyles.font });

                    if (meta) {

                        const displacement = getLineAdjustment();

                        template.set({
                            startY: displacement,
                            handleY: displacement,
                        });

                        label.set({
                            letterSpacing: compStyles.letterSpacing,
                            wordSpacing: compStyles.wordSpacing,
                        });
                    }
                }
            };

            animation.updateHook('afterShow', resizeAction);

            additionalDemolishActions.push(
                scrawl.addNativeListener('resize', setResizeFlag, window),
            );


            // Boilerplate user interaction - editing the text
            if (el.getAttribute('contenteditable')) {

                const updateText = () => {
                    label.set({ text: processText(el.innerHTML) });
                }
                const focusText = () => {
                    el.style.color = 'rgb(0 0 0 / 0.4)';
                }
                const blurText = () => {
                    el.style.color = 'transparent';
                }

                additionalDemolishActions.push(
                    scrawl.addNativeListener('input', updateText, el),
                    scrawl.addNativeListener('focus', focusText, el),
                    scrawl.addNativeListener('blur', blurText, el),
                );
            }


            // Boilerplate - animation control
            if ('static' === compStyles.position) el.style.position = 'relative';

            const control = document.createElement('button');

            control.style.position = 'absolute';
            control.style.fontSize = '12px';
            control.style.display = 'block';
            control.style.top = '0';
            control.style.right = '0';
            control.textContent = 'Halt';
            control.setAttribute('contenteditable', 'false');

            el.appendChild(control);

            let isAnimated = true;

            const stopStartAction = () => {

                isAnimated = !isAnimated;

                myGradient.set({ animateByDelta: isAnimated });

                control.textContent = isAnimated ? 'Halt' : 'Play';
            };

            additionalDemolishActions.push(
                scrawl.addNativeListener('click', stopStartAction, control)
            );


            // Accessibility
            const reduceMotionAction = () => {

                if (isAnimated) {

                    isAnimated = false;

                    myGradient.set({ animateByDelta: isAnimated });

                    control.textContent = 'Play';
                }
            };

            const noPreferenceMotionAction = () => {

                if (!isAnimated) {

                    isAnimated = true;

                    myGradient.set({ animateByDelta: isAnimated });

                    control.textContent = 'Halt';
                }
            };

            const colorSchemeLightAction = () => {

                myGradient.set({
                    colors: [
                        [0, userData.mainColor],
                        [199, userData.highlightColor],
                        [399, userData.mainColor],
                        [599, userData.highlightColor],
                        [799, userData.mainColor],
                        [999, userData.mainColor],
                    ],
                });
            };

            const colorSchemeDarkAction = () => {

                myGradient.set({
                    colors: [
                        [0, userData.darkMainColor],
                        [199, userData.darkHighlightColor],
                        [399, userData.darkMainColor],
                        [599, userData.darkHighlightColor],
                        [799, userData.darkMainColor],
                        [999, userData.darkMainColor],
                    ],
                });
            };

            const moreContrastAction = () => {

                const prefersDark = canvas.here.prefersDarkColorScheme;

                const color = (prefersDark) ? userData.darkContrastColor : userData.contrastColor;

                label.set({ fillStyle: color });
            };

            const otherContrastAction = () => {

                label.set({ fillStyle: name('highlight-gradient-pattern') });
            };

            canvas.set({
                colorSchemeLightAction,
                colorSchemeDarkAction,
                moreContrastAction,
                otherContrastAction,
                reduceMotionAction,
                noPreferenceMotionAction,
            });


            // Render once, to get everything in place
            animation.updateOnce();

            // Return the snippet, so coders can access the snippet's parts
            // + In case they need to tweak the output to meet the web page's specific requirements
            return snippet;
        }
    }
    return null;
}
