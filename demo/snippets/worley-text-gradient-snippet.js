// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
//
// ### 'Worley noise used to color text' snippet
//
// __Purpose:__ Worley noise is a form of procedural texture which can be generated and used to simulate textures which look (a bit) like stone, water or biological cells.
// + This snippet supports dark-mode alternative colors
// + This snippet supports high contrast alternative colors
// + This snippet is not animated
//
// __Function input:__
// + the DOM element - generally a block or inline-block element.
//
// __Customisation:__ The snippet can be customised using the following `--data-???` CSS custom properties:
// + `--data-base-color` - any CSS color string (default: `black`)
// + `--data-dark-base-color` - any CSS color string (default: `white`)
// + `--data-highlight-color` - any CSS color string (default: `orange`)
// + `--data-dark-highlight-color` - any CSS color string (default: `orange`)
// + `--data-noise-sum-function` - permitted values include: `none`, `sine-x`, `sine-y`, `sine`, `modular`, `random` (default: `random`)
// + `--data-noise-scale` - (+number) a form of zoom level (default: `50`)
// + `--data-noise-output` - permitted values include: `X`, `YminusX`, `ZminusX`, etc (default: `X`)
// + `--data-shadow-color` - any CSS color string, for the text shadow (default: `black`)
// + `--data-dark-shadow-color` - any CSS color string, for the text shadow (default: `white`)
// + `--data-shadow-offset-x` - (unit % of font size) percentage of the font size to offset the text shadow horizontally (default: `0`)
// + `--data-shadow-offset-y` - (unit % of font size) percentage of the font size to offset the text shadow vertically (default: ``0)
// + `--data-shadow-blur` - (unit % of font size) percentage of the font size to blur the shadow (default: `0`)
// + `--data-contrast-color` - any CSS color string (default: `black`)
// + `--data-dark-contrast-color` - any CSS color string (default: `white`)
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

                baseColor: compStyles.getPropertyValue('--data-base-color') || 'black',
                darkBaseColor: compStyles.getPropertyValue('--data-dark-base-color') || 'white',
                highlightColor: compStyles.getPropertyValue('--data-highlight-color') || 'orange',
                darkHighlightColor: compStyles.getPropertyValue('--data-dark-highlight-color') || 'orange',
                noiseSumFunction: compStyles.getPropertyValue('--data-noise-sum-function') || 'random',
                noiseOutput: compStyles.getPropertyValue('--data-noise-output') || 'X',
                noiseScale: compStyles.getPropertyValue('--data-noise-scale') || '50',
                shadowColor: compStyles.getPropertyValue('--data-shadow-color') || 'black',
                darkShadowColor: compStyles.getPropertyValue('--data-dark-shadow-color') || 'white',
                shadowOffsetX: compStyles.getPropertyValue('--data-shadow-offset-x') || '0',
                shadowOffsetY: compStyles.getPropertyValue('--data-shadow-offset-y') || '0',
                shadowBlur: compStyles.getPropertyValue('--data-shadow-blur') || '0',
                contrastColor: compStyles.getPropertyValue('--data-contrast-color') || 'black',
                darkContrastColor: compStyles.getPropertyValue('--data-dark-contrast-color') || 'white',
            };


            // Build the worley noise effect
            const worley = scrawl.makeNoiseAsset({
                name: name('worley-noise'),
                colors: [
                    [0, userData.highlightColor],
                    [999, userData.baseColor],
                ],
                colorSpace: 'OKLAB',
                noiseEngine: 'worley-euclidean',
                sumFunction: userData.noiseSumFunction,
                scale: userData.noiseScale,
                worleyOutput: userData.noiseOutput,
                width: Math.ceil(parseFloat(compStyles.width)),
                height: Math.ceil(parseFloat(compStyles.height)),
            });

            scrawl.makePattern({
                name: name('worley-pattern'),
                asset: name('worley-noise'),
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

                fillStyle: name('worley-pattern'),
                shadowOffsetX: userData.shadowOffsetX,
                shadowOffsetY: userData.shadowOffsetY,
                shadowBlur: userData.shadowBlur,
                shadowColor: userData.shadowColor,
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

                    label.set({
                        visibility: true,
                    });

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

                    worley.set({
                        width: Math.ceil(parseFloat(compStyles.width)),
                        height: Math.ceil(parseFloat(compStyles.height)),
                    });

                    label.set({
                        fontString: compStyles.font,
                    });

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


            // User interaction - editing the text
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

                worley.set({
                    colors: [
                        [0, userData.highlightColor],
                        [999, userData.baseColor],
                    ],
                });

                label.set({
                    shadowColor: userData.shadowColor,
                });
            };

            const colorSchemeDarkAction = () => {

                worley.set({
                    colors: [
                        [0, userData.darkHighlightColor],
                        [999, userData.darkBaseColor],
                    ],
                });

                label.set({
                    shadowColor: userData.darkShadowColor,
                });
            };

            const moreContrastAction = () => {

                const color = (canvas.here.prefersDarkColorScheme) ?
                    userData.darkContrastColor :
                    userData.contrastColor;

                label.set({
                    fillStyle: color,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 0,
                });
            };

            const otherContrastAction = () => {

                const isDark = canvas.here.prefersDarkColorScheme;

                const highlightColor = (isDark) ? userData.darkHighlightColor : userData.highlightColor;
                const baseColor = (isDark) ? userData.darkBaseColor : userData.baseColor;
                const shadowColor = (isDark) ? userData.darkShadowColor : userData.shadowColor;

                worley.set({
                    colors: [
                        [0, highlightColor],
                        [999, baseColor],
                    ],
                });

                label.set({
                    fillStyle: name('worley-pattern'),
                    shadowOffsetX: userData.shadowOffsetX,
                    shadowOffsetY: userData.shadowOffsetY,
                    shadowBlur: userData.shadowBlur,
                    shadowColor,
                });
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
