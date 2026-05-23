// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
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
// __Customisation:__ The snippet can be customised using the following `--data-???` CSS custom properties:
// + `--data-top-color` - any CSS color string (default: `lightblue`)
// + `--data-dark-top-color` - any CSS color string (default: `#d7e3f5`)
// + `--data-bottom-color` - any CSS color string (default: `blue`)
// + `--data-dark-bottom-color` - any CSS color string (default: `#598ad9`)
// + `--data-outline-color` - any CSS color string (default: `black`)
// + `--data-dark-outline-color` - any CSS color string (default: `#f4f5d7`)
// + `--data-outline-width` - (unit % of font size) outline width as a percentage of the font size (default: `0.04`)
// + `--data-random-radius` - (0 - 1) the amount of mixing of the top and bottom colors (default: `0.8`)
// + `--data-random-level` - (0 - 1) the density of the color mixing (default: `1`)
// + `--data-contrast-color` - any CSS color string, used when user has set `prefers-contrast: more` (default: `black`)
// + `--data-dark-contrast-color` - any CSS color string, used when user has set `prefers-contrast: more` (default: `white`)
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
                demolishAction = snippet.demolish,
                animation = snippet.animation,
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

                topColor: compStyles.getPropertyValue('--data-top-color') || 'lightblue',
                darkTopColor: compStyles.getPropertyValue('--data-dark-top-color') || '#d7e3f5',
                bottomColor: compStyles.getPropertyValue('--data-bottom-color') || 'blue',
                darkBottomColor: compStyles.getPropertyValue('--data-dark-bottom-color') || '#598ad9',
                outlineColor: compStyles.getPropertyValue('--data-outline-color') || 'black',
                darkOutlineColor: compStyles.getPropertyValue('--data-dark-outline-color') || '#f4f5d7',
                outlineWidth: compStyles.getPropertyValue('--data-outline-width') || '0.04',
                randomRadius: compStyles.getPropertyValue('--data-random-radius') || '0.8',
                randomLevel: compStyles.getPropertyValue('--data-random-level') || '1',
                contrastColor: compStyles.getPropertyValue('--data-contrast-color') || 'black',
                darkContrastColor: compStyles.getPropertyValue('--data-dark-contrast-color') || 'white',
            };

            // Build the risograph effect
            const risoGradient = scrawl.makeGradient({

                name: name('riso-gradient'),

                startY: 0,
                endY: Math.round(parseFloat(compStyles.lineHeight)),

                spread: 'repeat',

                colors: [
                    [0, userData.bottomColor],
                    [499, userData.bottomColor],
                    [500, userData.topColor],
                    [999, userData.topColor],
                ],

                operations: [{
                    operation: 'add-noise',
                    stage: 'after-spread',
                    parameters: {
                        noise: 'random',
                        strength: parseFloat(userData.randomRadius),
                        seed: name('riso-noise'),
                    },
                }],
            });

            const template = scrawl.makeBlock({
                name: name('template'),
                calculateOrder: 0,
                stampOrder: 4,
                dimensions: ['100%', '100%'],
                visibility: false,

                // globalCompositeOperation: 'source-over',
                // globalCompositeOperation: 'source-in',
                // globalCompositeOperation: 'source-out',
                // globalCompositeOperation: 'source-atop',
                // globalCompositeOperation: 'source-only',
                globalCompositeOperation: 'destination-over',
                // globalCompositeOperation: 'destination-in',
                // globalCompositeOperation: 'destination-out',
                // globalCompositeOperation: 'destination-atop',
                // globalCompositeOperation: 'destination-only',
            });

            const effect = scrawl.makeBlock({
                name: name('riso-effect'),
                dimensions: ['100%', '100%'],
                fillStyle: name('riso-gradient'),

                order: 2,
                visibility: false,

                // globalCompositeOperation: 'source-over',
                globalCompositeOperation: 'source-in',
                // globalCompositeOperation: 'source-out',
                // globalCompositeOperation: 'source-atop',
                // globalCompositeOperation: 'source-only',
                // globalCompositeOperation: 'destination-over',
                // globalCompositeOperation: 'destination-in',
                // globalCompositeOperation: 'destination-out',
                // globalCompositeOperation: 'destination-atop',
                // globalCompositeOperation: 'destination-only',
            });

            const textFill = scrawl.makeEnhancedLabel({
                name: name('content'),
                layoutTemplate: name('template'),
                order: 1,

                text: processText(el.innerHTML),
                fontString: compStyles.font,

                fillStyle: 'black',
                globalAlpha: 1,
                method: 'fill',
                textHandleY: 'alphabetic',
                visibility: false,

                direction: userData.direction,
                fontStretch: userData.fontStretch,
                letterSpacing: userData.letterSpacing,
                wordSpacing: userData.wordSpacing,
                fontVariantCaps: userData.fontVariantCaps,
                lineSpacing: getLineSpacing(),
                justifyLine: userData.justifyLine,

                globalCompositeOperation: 'source-over',
                // globalCompositeOperation: 'source-in',
                // globalCompositeOperation: 'source-out',
                // globalCompositeOperation: 'source-atop',
                // globalCompositeOperation: 'source-only',
                // globalCompositeOperation: 'destination-over',
                // globalCompositeOperation: 'destination-in',
                // globalCompositeOperation: 'destination-out',
                // globalCompositeOperation: 'destination-atop',
                // globalCompositeOperation: 'destination-only',
            });

            const textOutline = scrawl.makeEnhancedLabel({
                name: name('outline'),
                layoutTemplate: name('template'),
                order: 3,

                text: processText(el.innerHTML),
                fontString: compStyles.font,

                fillStyle: 'black',

                method: 'draw',
                textHandleY: 'alphabetic',
                visibility: false,

                direction: userData.direction,
                fontStretch: userData.fontStretch,
                letterSpacing: userData.letterSpacing,
                wordSpacing: userData.wordSpacing,
                fontVariantCaps: userData.fontVariantCaps,
                lineSpacing: getLineSpacing(),
                justifyLine: userData.justifyLine,

                strokeStyle: userData.outlineColor,
                lineWidth: parseFloat(compStyles.lineHeight) * parseFloat(userData.outlineWidth),

                // globalCompositeOperation: 'source-over',
                // globalCompositeOperation: 'source-in',
                // globalCompositeOperation: 'source-out',
                // globalCompositeOperation: 'source-atop',
                // globalCompositeOperation: 'source-only',
                globalCompositeOperation: 'destination-over',
                // globalCompositeOperation: 'destination-in',
                // globalCompositeOperation: 'destination-out',
                // globalCompositeOperation: 'destination-atop',
                // globalCompositeOperation: 'destination-only',
            });

            const texts = scrawl.makeGroup({
                name: name('text-group'),
            }).addArtefacts(textFill, textOutline);

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

                    texts.setArtefacts({
                        visibility: true,
                    });

                    effect.set({
                        visibility: true,
                    })

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
                // + Should also prevent flashes of badly sized content when canvas scrolls into view
                if (!animation.isRunning() && now > lastResize + resizeChoke) {

                    resizeAction();
                    animation.updateOnce();
                    lastResize = now;
                }
            };

            const resizeAction = () => {

                if (resizeFlag) {

                    resizeFlag = false;

                    texts.setArtefacts({
                        fontString: compStyles.font,
                        lineWidth: parseFloat(compStyles.lineHeight) * parseFloat(userData.outlineWidth),
                    });

                    if (meta) {

                        const displacement = getLineAdjustment();

                        template.set({
                            startY: displacement,
                            handleY: displacement,
                        });

                        texts.setArtefacts({
                            letterSpacing: compStyles.letterSpacing,
                            wordSpacing: compStyles.wordSpacing,
                        });

                        risoGradient.set({
                            endY: Math.round(parseFloat(compStyles.lineHeight)),
                        });
                    }
                }
            };

            animation.updateHook('afterShow', resizeAction);

            additionalDemolishActions.push(
                scrawl.addNativeListener('resize', setResizeFlag, window),
            );


            // User interaction - editing the text
            if (el.getAttribute('contenteditable')) {

                const updateText = () => {
                    texts.setArtefacts({
                        text: processText(el.innerHTML),
                    });
                }
                const focusText = () => {
                    el.style.color = 'rgb(0 0 0 / 0.4)';
                }
                const blurText = () => {
                    el.style.color = 'transparent';
                }

                scrawl.addNativeListener('input', updateText, el);
                scrawl.addNativeListener('focus', focusText, el);
                scrawl.addNativeListener('blur', blurText, el);

                additionalDemolishActions.push(() => {
                    scrawl.removeNativeListener('input', updateText, el);
                    scrawl.removeNativeListener('focus', focusText, el);
                    scrawl.removeNativeListener('blur', blurText, el);
                });
            }


            // Accessibility
            const colorSchemeLightAction = () => {

                risoGradient.set({
                    colors: [
                        [0, userData.bottomColor],
                        [999, userData.topColor],
                    ],
                });

                texts.setArtefacts({
                    strokeStyle: userData.outlineColor,
                });
            };

            const colorSchemeDarkAction = () => {

                risoGradient.set({
                    colors: [
                        [0, userData.darkBottomColor],
                        [499, userData.darkBottomColor],
                        [500, userData.darkTopColor],
                        [999, userData.darkTopColor],
                    ],
                });

                texts.setArtefacts({
                    strokeStyle: userData.darkOutlineColor,
                });
            };

            const moreContrastAction = () => {

                const color = (canvas.here.prefersDarkColorScheme) ?
                    userData.darkContrastColor :
                    userData.contrastColor;

                template.set({
                    visibility: false,
                });

                texts.setArtefacts({
                    visibility: false,
                });

                effect.set({
                    visibility: false,
                });

                el.style.color = color;
            };

            const otherContrastAction = () => {

                const isDark = canvas.here.prefersDarkColorScheme;

                const lowColor = (isDark) ? userData.darkBottomColor : userData.bottomColor;
                const highColor = (isDark) ? userData.darkTopColor : userData.topColor;

                const strokeStyle = (isDark) ? userData.darkOutlineColor : userData.outlineColor;

                risoGradient.set({
                    colors: [
                        [0, lowColor],
                        [499, lowColor],
                        [500, highColor],
                        [999, highColor],
                    ],
                });

                template.set({
                    visibility: true,
                });

                texts.setArtefacts({
                    visibility: true,
                    strokeStyle,
                });

                effect.set({
                    visibility: true,
                });

                el.style.color = 'transparent';
            };

            canvas.set({
                colorSchemeLightAction,
                colorSchemeDarkAction,
                moreContrastAction,
                otherContrastAction,
            });


            animation.updateOnce();

            // Return the snippet, so coders can access the snippet's parts
            // + In case they need to tweak the output to meet the web page's specific requirements
            return snippet;
        }
    }
    return null;
}
