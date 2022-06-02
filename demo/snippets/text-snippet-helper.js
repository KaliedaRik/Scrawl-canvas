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

    const {fontStyle, fontVariant, fontWeight, fontSize, fontFamily, lineHeight, width, height, backgroundColor, textAlign, letterSpacing} = compStyles;

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

    const initCanvas = () => {

        if (backgroundColor) {

            canvas.set({ backgroundColor });
            el.style.backgroundColor = 'transparent';
        }
        el.style.color = 'rgba(0,0,0,0)';
        el.style.overflow = 'hidden';
    };

    const processText = t => {
        t = t.replace(/<canvas.*<\/canvas>/gi, '');
        t = t.replace(/<button.*<\/button>/gi, '');
        return t;
    }

    const additionalDemolishActions = [];
    const responsiveFunctions = [];
    const animationFunctions = [];
    const animationStartFunctions = [];
    const animationEndFunctions = [];
    const eternalTweens = [];


    if (el.getAttribute('contenteditable')) {

        const updateText = (e) => {
            textGroup.setArtefacts({ text: processText(el.innerHTML) });
        }
        const focusText = (e) => el.style.color = 'rgba(0,0,0,0.2)';
        const blurText = (e) => el.style.color = 'rgba(0,0,0,0)';

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
        // control.style.backgroundColor = 'transparent';
        // control.style.borderRadius = '2px';
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

        const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (reducedMotionMediaQuery.matches) {
            setTimeout(() => {
                doAnimation = false;
                control.textContent = 'Play';
            }, 5000);
        }

        additionalDemolishActions.push(() => {
            scrawl.removeNativeListener('click', controlClick, control);
            textGroup.kill();
        });
    }

    snippet.demolish = () => {
        eternalTweens.forEach(t => t.kill());
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
        eternalTweens,
        additionalDemolishActions,
    };
}
