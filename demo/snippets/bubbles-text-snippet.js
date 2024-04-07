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
// __Customisation:__ The snippet can be customised using the following `--data-???` CSS custom properties:
// + `--data-text-color` - any CSS color string (default: `#c213bc'`)
// + `--data-dark-text-color` - any CSS color string (default: `#fcdeef`)
// + `--data-outline-color` - any CSS color string (default: `#f59dcf`)
// + `--data-dark-outline-color` - any CSS color string (default: `#f59dcf`)
// + `--data-outline-width` - (unit % of font size) percentage of the font size for text outline width (default: `0.05`)
// + `--data-bubble-color` - any CSS color string (default: `#fcdeef`)
// + `--data-dark-bubble-color` - any CSS color string (default: `#ed5fb0`)
// + `--data-bubble-outline-color` - any CSS color string (default: `#c213bc`)
// + `--data-dark-bubble-outline-color` - any CSS color string (default: `#c213bc`)
// + `--data-bubble-density` - the number of bubbles to generate (default: `50`)
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

            canvas.base.set({
                compileOrder: 1,
            });


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

                textColor: compStyles.getPropertyValue('--data-text-color') || '#c213bc',
                darkTextColor: compStyles.getPropertyValue('--data-dark-text-color') || '#fcdeef',
                outlineColor: compStyles.getPropertyValue('--data-outline-color') || '#f59dcf',
                darkOutlineColor: compStyles.getPropertyValue('--data-dark-outline-color') || '#f59dcf',
                bubbleColor: compStyles.getPropertyValue('--data-bubble-color') || '#fcdeef',
                darkBubbleColor: compStyles.getPropertyValue('--data-dark-bubble-color') || '#ed5fb0',
                bubbleOutlineColor: compStyles.getPropertyValue('--data-bubble-outline-color') || '#c213bc',
                darkBubbleOutlineColor: compStyles.getPropertyValue('--data-dark-bubble-outline-color') || '#c213bc',
                contrastColor: compStyles.getPropertyValue('--data-contrast-color') || 'black',
                darkContrastColor: compStyles.getPropertyValue('--data-dark-contrast-color') || 'white',
                outlineWidth: compStyles.getPropertyValue('--data-outline-width') || '0.05',
                bubbleDensity: compStyles.getPropertyValue('--data-bubble-density') || '50',
            };

            const getLineWidth = () => parseFloat(userData.outlineWidth) * parseFloat(compStyles.fontSize);


            // Build the animated bubbles text effect
            const fizz = scrawl.makeWheel({
                name: name('bubble-template'),
                order: 1,
                startY: '100%',
                handleX: 'center',
                handleY: 'center',
                fillStyle: userData.bubbleColor,
                strokeStyle: userData.bubbleOutlineColor,
                lineWidth: getLineWidth() * 0.7,
                globalCompositeOperation: 'source-atop',
                method: 'none',
            });

            const bubblesGroup = scrawl.makeGroup({
                name: name('bubbles-group'),
            });

            const tweens = [];

            for (let i = 0; i < userData.bubbleDensity; i++) {

                const bubble = fizz.clone({
                    name: name(`bubble-${i}`),
                    radius: Math.round((Math.random() * (parseFloat(compStyles.fontSize) / 2)) + 4),
                    startX: `${Math.random() * 100}%`,
                    noCanvasEngineUpdates: true,
                    sharedState: true,
                    method: 'fillThenDraw',
                });

                bubblesGroup.addArtefacts(bubble);

                const myRandom = Math.random();

                tweens.push(scrawl.makeTween({
                    name: name(`bubble-${i}`),
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

                fillStyle: userData.textColor,
                strokeStyle: userData.outlineColor,
                lineWidth: getLineWidth(),

                method: 'fillAndDraw',
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

                    label.set({ visibility: true });

                    bubblesGroup.set({ visibility: true });

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
                            lineWidth: getLineWidth(),
                        });

                        bubblesGroup.setArtefacts({
                            lineWidth: getLineWidth() * 0.7,
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

                if (isAnimated) tweens.forEach(t => t.resume());
                else tweens.forEach(t => t.halt());

                control.textContent = isAnimated ? 'Halt' : 'Play';
            };

            additionalDemolishActions.push(
                scrawl.addNativeListener('click', stopStartAction, control)
            );


            // Accessibility
            const reduceMotionAction = () => {

                if (isAnimated) {

                    isAnimated = false;

                    tweens.forEach(t => t.halt());

                    control.textContent = 'Play';
                }
            };

            const noPreferenceMotionAction = () => {

                if (!isAnimated) {

                    isAnimated = true;

                    tweens.forEach(t => t.resume());

                    control.textContent = 'Halt';
                }
            };

            const colorSchemeLightAction = () => {

                fizz.set({

                    fillStyle: userData.bubbleColor,
                    strokeStyle: userData.bubbleOutlineColor,
                });

                label.set({

                    fillStyle: userData.textColor,
                    strokeStyle: userData.outlineColor,
                });
            };

            const colorSchemeDarkAction = () => {

                fizz.set({

                    fillStyle: userData.darkBubbleColor,
                    strokeStyle: userData.darkBubbleOutlineColor,
                });

                label.set({

                    fillStyle: userData.darkTextColor,
                    strokeStyle: userData.darkOutlineColor,
                });
            };

            const moreContrastAction = () => {

                const prefersDark = canvas.here.prefersDarkColorScheme;

                const color = (prefersDark) ? userData.darkContrastColor : userData.contrastColor;

                label.set({
                    fillStyle: color,
                    method: 'fill',
                });

                bubblesGroup.set({ visibility: false });
            };

            const otherContrastAction = () => {

                const prefersDark = canvas.here.prefersDarkColorScheme;

                const color = (prefersDark) ? userData.darkTextColor : userData.textColor;

                label.set({
                    fillStyle: color,
                    method: 'fillAndDraw',
                });

                bubblesGroup.set({ visibility: true });
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
