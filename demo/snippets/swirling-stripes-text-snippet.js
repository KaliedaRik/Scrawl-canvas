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
// __Customisation:__ The snippet can be customised using the following `--data-???` CSS custom properties:
// + `--data-main-color` - any CSS color string (default: `black`)
// + `--data-dark-main-color` - any CSS color string (default: `yellow`)
// + `--data-stripe-color` - any CSS color string (default: `red`)
// + `--data-dark-stripe-color` - any CSS color string (default: `red`)
// + `--data-stripe-ratio` - (0 - 1) the ratio of stripe to main color; higher values show wider stripes (default: `0.5`)
// + `--data-swirl-angle` - (degrees) higher values lead to a tighter swirl; use negative values to reverse the swirl direction (default: `90`)
// + `--data-pattern-skew-x` - (-2 - 2) skew the gradient pattern horizontally (default: `-1`)
// + `--data-pattern-skew-y` - (-2 - 2) skew the gradient pattern vertically (default: `0.5`)
// + `--data-pattern-stretch-x` - (0 - 4) stretch the gradient pattern horizontally (default: `1`)
// + `--data-pattern-stretch-y` - (0 - 4) stretch the gradient pattern vertically (default: `1`)
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
                lineSpacing: compStyles.lineSpacing || '1',
                lineAdjustment: compStyles.getPropertyValue('--data-line-adjustment') || '0',
                justifyLine: getJustifyLine(compStyles.textAlign),

                elBackgroundColor: compStyles.backgroundColor || 'transparent',

                mainColor: compStyles.getPropertyValue('--data-main-color') || 'black',
                darkMainColor: compStyles.getPropertyValue('--data-dark-main-color') || 'yellow',
                stripeColor: compStyles.getPropertyValue('--data-stripe-color') || 'red',
                darkStripeColor: compStyles.getPropertyValue('--data-dark-stripe-color') || 'red',
                stripeRatio: compStyles.getPropertyValue('--data-stripe-ratio') || '0.5',
                swirlAngle: compStyles.getPropertyValue('--data-swirl-angle') || '90',
            };


// Build the animated swirl effect
            const getOuterRadius = () => Math.ceil(parseFloat(compStyles.lineHeight) * 2);

            const swirl = scrawl.makeFilter({
                name: name('swirl-filter'),
                method: 'swirl',
                startX: '50%',
                startY: '50%',
                innerRadius: 0,
                outerRadius: getOuterRadius(),
                easing: 'easeOutIn',
                angle: userData.swirlAngle,
                transparentEdges: true,
            });

            const stripeRatio = parseFloat(userData.stripeRatio);

            const stripeGradient = scrawl.makeGradient({
                name: name('stripe-gradient'),

                startY: 0,
                endY: Math.ceil(parseFloat(compStyles.lineHeight) / 5),

                spread: 'repeat',

                colors: [
                    [0, userData.mainColor],
                    [Math.round(999 * stripeRatio), userData.mainColor],
                    [Math.round(999 * stripeRatio) + 1, userData.stripeColor],
                    [999, userData.stripeColor],
                ],
            });

            const template = scrawl.makeBlock({
                name: name('template'),
                dimensions: ['100%', '100%'],
                order: 4,
                visibility: false,
                globalCompositeOperation: 'destination-over',
            });

            const effect = scrawl.makeBlock({
                name: name('stripe-effect'),
                dimensions: ['100%', '100%'],
                fillStyle: name('stripe-gradient'),
                order: 1,
                visibility: false,
                globalCompositeOperation: 'source-over',
            });

            const label = scrawl.makeEnhancedLabel({
                name: name('content'),
                layoutTemplate: name('template'),
                order: 2,
                text: processText(el.innerHTML),
                fontString: compStyles.font,
                method: 'fill',
                fillStyle: 'black',
                textHandleY: 'alphabetic',
                visibility: false,
                direction: userData.direction,
                fontStretch: userData.fontStretch,
                letterSpacing: userData.letterSpacing,
                wordSpacing: userData.wordSpacing,
                fontVariantCaps: userData.fontVariantCaps,
                lineSpacing: getLineSpacing(),
                justifyLine: userData.justifyLine,
                globalCompositeOperation: 'destination-in',
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

                    canvas.base.set({ memoizeFilterOutput: true });

                    meta = scrawl.getFontMetadata(font);

                    const displacement = getLineAdjustment();

                    template.set({
                        startY: displacement,
                        handleY: displacement,
                        fillStyle: userData.elBackgroundColor,
                        visibility: true,
                    });

                    effect.set({ visibility: true });
                    label.set({ visibility: true });

                    animation.updateHook('commence', swirlEffect);
                }
            };

            const swirlEffect = () => {

                const base = canvas.base;

                if (isAnimated) {

                    const {x, y, active} = canvas.here;

                    if (active && !base.hasFilters()) base.addFilters(name('swirl-filter'));

                    if (active) {

                        swirl.set({
                            startX: x,
                            startY: y,
                        });
                    }
                    else if (base.hasFilters()) base.clearFilters();
                }
                else if (base.hasFilters()) base.clearFilters();
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

                    swirl.set({ outerRadius: getOuterRadius() });

                    stripeGradient.set({
                        endY: Math.ceil(parseFloat(compStyles.lineHeight) / 5),
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

                control.textContent = isAnimated ? 'Halt' : 'Play';
            };

            additionalDemolishActions.push(
                scrawl.addNativeListener('click', stopStartAction, control)
            );


// Accessibility
            const reduceMotionAction = () => {

                if (isAnimated) {

                    isAnimated = false;

                    control.textContent = 'Play';
                }
            };

            const noPreferenceMotionAction = () => {

                if (!isAnimated) {

                    isAnimated = true;

                    control.textContent = 'Halt';
                }
            };

            const colorSchemeLightAction = () => {

                stripeGradient.set({
                    colors: [
                        [0, userData.mainColor],
                        [Math.round(999 * stripeRatio), userData.mainColor],
                        [Math.round(999 * stripeRatio) + 1, userData.stripeColor],
                        [999, userData.stripeColor],
                    ],
                });
            };

            const colorSchemeDarkAction = () => {

                stripeGradient.set({
                    colors: [
                        [0, userData.darkMainColor],
                        [Math.round(999 * stripeRatio), userData.darkMainColor],
                        [Math.round(999 * stripeRatio) + 1, userData.darkStripeColor],
                        [999, userData.darkStripeColor],
                    ],
                });
            };

            canvas.set({
                colorSchemeLightAction,
                colorSchemeDarkAction,
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
