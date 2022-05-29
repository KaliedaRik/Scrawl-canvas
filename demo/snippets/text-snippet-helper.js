// # Demo Snippets 006
// Editable header element color font snippets
//
// Related files:
// + [Editable header element color font snippets](../snippets-006.html)
// + [Animated highlight gradient text snippet](./animated-highlight-gradient-text-snippet.html)
// + [Risograph text gradient snippet](./risograph-text-gradient-snippet.html)
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

    const {fontStyle, fontVariant, fontWeight, fontSize, fontFamily, lineHeight, width, height, backgroundColor} = compStyles;

    const yOffset = dataset.yOffset ? parseFloat(dataset.yOffset) : 0;
    const lineheightAdjuster = dataset.lineheightAdjuster ? parseFloat(dataset.lineheightAdjuster) : 1;

    const underlinePosition = dataset.underlinePosition ? parseFloat(dataset.underlinePosition) : 0.6;
    const underlineWidth = dataset.underlineWidth ? parseFloat(dataset.underlineWidth) : 1;
    const noUnderlineGlyphs = dataset.noUnderlineGlyphs || '';

    const isAnimated = dataset.isAnimated || false;

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

    // This is a specific fix to handle cases where, because of differences in the way SC and the browser calculate how to fit words on a line, SC phrases may break the text onto an additional line not required by the DOM element
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

    let additionalDemolishActions = [];

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

        phrase.set({
            style: fontStyle, 
            variant: fontVariant, 
            weight: fontWeight, 
            size: fontSize, 
            family: fontFamily, 
            lineHeight: (parseFloat(lineHeight) / parseFloat(fontSize)) * lineheightAdjuster, 
            width: '100%',
            text: processText(el.innerHTML),
            startY: yOffset,
            underlinePosition,
            underlineWidth,
            noUnderlineGlyphs,
            underlineStyle: 'black',
            exposeText: false,
        });
    };

    const textGroup = scrawl.makeGroup({
        name: `${name}-text-group`,
    });

   //  const fontUpdateAction = () => {

   //      const {fontStyle, fontVariant, fontWeight, fontSize, fontFamily, lineHeight} = compStyles;

   //      textGroup.setArtefacts({
   //          style: fontStyle, 
   //          variant: fontVariant, 
   //          weight: fontWeight, 
   //          size: fontSize, 
   //          family: fontFamily, 
   //          lineHeight: (parseFloat(lineHeight) / parseFloat(fontSize)) * lineheightAdjuster,
   //      });
   // };

    const animationFunctions = [];

    let doAnimation = false;

    const commenceActions = () => {

        textHeightAction();

        if (doAnimation) {
            animationFunctions.forEach(f => f());
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
        control.style.font = '12px Arial, sans-serif';
        control.style.display = 'block';
        control.style.top = '0';
        control.style.right = '0';
        control.textContent = 'Halt';
        control.setAttribute('contenteditable', 'false');

        const controlClick = (e) => {

            doAnimation = !doAnimation;
            control.textContent = (doAnimation) ? 'Halt' : 'Play';
        };

        scrawl.addNativeListener('click', controlClick, control);

        el.appendChild(control);

        if ('reduced' === isAnimated) {

            doAnimation = false;
            control.textContent = 'Play';
        }

        additionalDemolishActions.push(() => {
            scrawl.removeNativeListener('click', controlClick, control);
            resizeObserver.unobserve(el);
            textGroup.kill();
        });
    }


    snippet.demolish = () => {
        additionalDemolishActions.forEach(f => f());
        demolishAction();
    };

    return {
        canvas,
        group,
        animation,
        wrapper,
        dataset,
        name,

        width: parseFloat(width),
        height: localHeight,
        lineHeight: parseFloat(lineHeight),
        yOffset,

        textGroup,

        initCanvas,
        initPhrase,
        processText,

        animationFunctions,
        additionalDemolishActions,
    };
}
