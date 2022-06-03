// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Animated highlight gradient text snippet](./animated-highlight-gradient-text-snippet.html)
// + [Bubbles text snippet](./bubbles-text-snippet.html)
// + [Risograph text gradient snippet](./risograph-text-gradient-snippet.html)
// + [Swirling stripes text snippet](./swirling-stripes-text-snippet.html)
// + [Worley text gradient snippet](./worley-text-gradient-snippet.html)

// ### Text snippet helper function
//
// __Purpose__ - Used by text snippets to handle some boilerplate and common functionality:
// + Handles most work related to matching the canvas font to the HTML element's font
// + Retrieves the `data-` attributes which handle canvas text alignment with the HTML element's text layout
// + For editable HTML elements, handles user updates to the text
// + Canvas initialization, including accessibility
// + Phrase entity initialisation, and updates - including adapting the HTML element to accommodate the phrase's dimensions
// + Animation boilerplate code, including animation accessibility - create and manage the `play|pause` `button` element created and added to the HTML element
//
// __Function input__ - The Scrawl-canvas snippet object, alongside the SC object (both arguments required).
//
// __Function output__ - A Javascript object with the following `key:value` attributes:
// + `canvas` - SC snippet's Canvas wrapper
// + `group` - (string) Canvas wrapper's base Cell's name value
// + `animation` - SC snippet's animation object
// + `wrapper` - SC snippet's Element artefact wrapper
// + `dataset` - HTML element's `dataset` object
// + `compStyles` - HTML element's `elementComputedStyles` object
// + `name` - (string) SC snippet's Element artefact wrapper's name value
//
// + `width` - (number px) initial HTML element width value
// + `height` - (number px) initial HTML element height value
// + `lineHeight` - (number px) initial HTML element line height value
// + `fontSize` - (number px) initial HTML element font size value
// + `yOffset` - user-defined canvas font vertical positioning correction value
//
// + `textGroup` - the non-cell group used to manage and update the two Phrase entitys
//
// + `initCanvas` - function to invoke to initialize the Canvas wrapper
// + `initPhrase` - function to invoke to initialize the Phrase entitys
// + `processText` - function to handle `contenteditable` element text updates
//
// + `responsiveFunctions` - Array to hold snippet-specific functions relating to responsiveness
// + `animationFunctions` - Array to hold snippet-specific functions relating to running animations
// + `animationStartFunctions` - Array to hold snippet-specific functions relating to `animation.run()`
// + `animationEndFunctions` - Array to hold snippet-specific functions relating to `animation.halt()`
// + `contrastMoreActions` - Array to hold a `prefers-contrast` accessibility change function
// + `contrastOtherActions` - Array to hold a `prefers-contrast` accessibility change function
// + `colorSchemeDarkActions` - Array to hold a `prefers-color-scheme` accessibility change function
// + `colorSchemeLightActions` - Array to hold a `prefers-color-scheme` accessibility change function
// + `eternalTweens` - Array to hold sets of continuously-running tweens created by the snippet
// + `additionalDemolishActions` - Array to hold snippet-specific functions relating to snippet demolition
export const getSnippetData = (snippet, scrawl) => {

    const canvas = snippet.canvas,
        group = canvas.base.name,
        animation = snippet.animation,
        wrapper = snippet.element,
        demolishAction = snippet.demolish,
        el = wrapper.domElement,
        compStyles = wrapper.elementComputedStyles,
        name = wrapper.name,
        dataset = el.dataset;

    const {fontStyle, fontVariant, fontWeight, fontSize, fontFamily, lineHeight, color, width, height, backgroundColor, textAlign, letterSpacing} = compStyles;

    let yOffset = 0,
        lineheightAdjuster = 1,
        underlinePosition = 0.8,
        underlineWidth = 0.05,
        noUnderlineGlyphs = '',
        isAnimated = false;

    if (dataset.yOffset) yOffset = parseFloat(dataset.yOffset);
    else {
        const s = compStyles.getPropertyValue('--data-y-offset');
        if (s) yOffset = parseFloat(s);
    }

    if (dataset.lineheightAdjuster) lineheightAdjuster = parseFloat(dataset.lineheightAdjuster);
    else {
        const s = compStyles.getPropertyValue('--data-lineheight-adjuster');
        if (s) lineheightAdjuster = parseFloat(s);
    }

    if (dataset.underlinePosition) underlinePosition = parseFloat(dataset.underlinePosition);
    else {
        const s = compStyles.getPropertyValue('--data-underline-position');
        if (s) underlinePosition = parseFloat(s);
    }

    if (dataset.underlineWidth) underlineWidth = parseFloat(dataset.underlineWidth);
    else {
        const s = compStyles.getPropertyValue('--data-underline-width');
        if (s) underlineWidth = parseFloat(s);
    }

    if (dataset.noUnderlineGlyphs) noUnderlineGlyphs = dataset.noUnderlineGlyphs;
    else {
        const s = compStyles.getPropertyValue('--data-no-underline-glyphs');
        if (s) noUnderlineGlyphs = s;
    }

    if (dataset.isAnimated) isAnimated = dataset.isAnimated;
    else {
        const s = compStyles.getPropertyValue('--data-is-animated');
        if (s) isAnimated = s;
    }

    const additionalDemolishActions = [];
    const responsiveFunctions = [];
    const animationFunctions = [];
    const animationStartFunctions = [];
    const animationEndFunctions = [];
    const contrastMoreActions = [];
    const contrastOtherActions = [];
    const colorSchemeDarkActions = [];
    const colorSchemeLightActions = [];
    const eternalTweens = [];

    const initCanvas = () => {

        el.style.color = 'transparent';
        el.style.overflow = 'hidden';

        canvas.setColorSchemeDarkAction(() => colorSchemeDarkActions.forEach(a => a(compStyles)));
        canvas.setColorSchemeLightAction(() => colorSchemeLightActions.forEach(a => a(compStyles)));
        canvas.setMoreContrastAction(() => contrastMoreActions.forEach(a => a(compStyles)));
        canvas.setOtherContrastAction(() => contrastOtherActions.forEach(a => a(compStyles)));
    };

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

    if (el.getAttribute('contenteditable')) {

        const updateText = (e) => {
            textGroup.setArtefacts({ text: processText(el.innerHTML) });
        }
        const focusText = (e) => {
            el.style.color = 'gray';
        }
        const blurText = (e) => {
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

    const initPhrase = (phrase) => {

        const localLineHeight = parseFloat(lineHeight),
            localFontSize = parseFloat(fontSize);

        phrase.set({
            style: fontStyle, 
            variant: fontVariant, 
            weight: fontWeight, 
            size: fontSize, 
            family: fontFamily, 
            lineHeight: (localLineHeight / localFontSize) * lineheightAdjuster, 
            width: '100%',
            text: processText(el.innerHTML),
            startY: Math.round(localFontSize * yOffset),
            underlinePosition,
            underlineWidth: Math.round(localFontSize * underlineWidth) || 1,
            noUnderlineGlyphs,
            underlineStyle: 'black',
            justify: textAlign || 'left',
            letterSpacing: letterSpacing || 0,
            exposeText: false,
        });
    };

    // This is a specific fix to handle cases where, because of differences in the way SC and the browser calculate how to fit words on a line, SC phrases may break the text onto an additional line not required by the DOM element
    let localWidth = width;
    let localHeight = parseFloat(height);

    const textHeightAction = () => {

        if (textGroup.artefacts.length) {

            const art = textGroup.getArtefact(textGroup.artefacts[0]);
            const headerHeight = art.get('height');

            if (headerHeight !== localHeight) {
                el.style.height = `${headerHeight}px`;
                localHeight = headerHeight;
            }
        }
    };

    const updatePhrase = () => {

        if (textGroup.artefacts.length && compStyles.width !== localWidth) {

            localWidth = compStyles.width;

            const {fontStyle, fontVariant, fontWeight, fontSize, fontFamily, lineHeight, textAlign, letterSpacing} = compStyles;

            const localLineHeight = parseFloat(lineHeight),
                localFontSize = parseFloat(fontSize);

            textGroup.setArtefacts({
                style: fontStyle, 
                variant: fontVariant, 
                weight: fontWeight, 
                size: fontSize, 
                family: fontFamily, 
                lineHeight: (localLineHeight / localFontSize) * lineheightAdjuster, 
                startY: Math.round(localFontSize * yOffset),
                underlineWidth: Math.round(localFontSize * underlineWidth) || 1,
                justify: textAlign || 'left',
                letterSpacing: letterSpacing || 0,
            });
            responsiveFunctions.forEach(r => r(compStyles));
        }
    };

    const textGroup = scrawl.makeGroup({
        name: `${name}-text-group`,
    });

    let doAnimation = false;

    const commenceActions = () => {

        updatePhrase();
        textHeightAction();

        if (doAnimation) {
            animationFunctions.forEach(f => f(compStyles));
        }
    }

    animation.set({
        commence: commenceActions,
    });

    if (isAnimated) {

        doAnimation = true;

        if ('static' === compStyles.position) el.style.position = 'relative';

        const control = document.createElement('button');

        control.style.position = 'absolute';
        control.style.fontSize = '12px';
        control.style.display = 'block';
        control.style.top = '0';
        control.style.right = '0';
        control.textContent = 'Halt';
        control.setAttribute('contenteditable', 'false');

        const controlClick = (e) => {
            doAnimation = !doAnimation;

            if (doAnimation) {

                control.textContent = 'Halt';
                animationStartFunctions.forEach(a => a());
                eternalTweens.forEach(t => t.resume());
            }
            else {

                control.textContent = 'Play';
                animationEndFunctions.forEach(a => a());
                eternalTweens.forEach(t => t.halt());
            }
        };

        scrawl.addNativeListener('click', controlClick, control);

        el.appendChild(control);

        additionalDemolishActions.push(() => {
            scrawl.removeNativeListener('click', controlClick, control);
        });
    }

    snippet.demolish = () => {
        eternalTweens.forEach(t => t.kill());
        textGroup.kill();
        additionalDemolishActions.forEach(f => f());
        demolishAction();
    };

    return {
        canvas,
        group,
        animation,
        wrapper,
        dataset,
        compStyles,
        name,

        width: parseFloat(width),
        height: localHeight,
        lineHeight: parseFloat(lineHeight),
        fontSize: parseFloat(fontSize),
        yOffset,

        textGroup,

        initCanvas,
        initPhrase,
        processText,

        responsiveFunctions,
        animationFunctions,
        animationStartFunctions,
        animationEndFunctions,
        contrastMoreActions,
        contrastOtherActions,
        colorSchemeDarkActions,
        colorSchemeLightActions,
        eternalTweens,
        additionalDemolishActions,
    };
}
