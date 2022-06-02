// # Demo Snippets 006
// Editable header text colorizer and animation effect snippets
//
// Related files:
// + [Editable header text colorizer and animation effect snippets](../snippets-006.html)
// + [Text snippet helper](./text-snippet-helper.html)

import { getSnippetData } from './text-snippet-helper.js';

export default function (el, scrawl) {

    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        let { canvas, group, animation, compStyles, dataset, name, height, lineHeight, initCanvas, initPhrase, textGroup, responsiveFunctions, animationFunctions, animationEndFunctions, additionalDemolishActions } = getSnippetData(snippet, scrawl);

        const contrastMediaQuery = window.matchMedia("(prefers-contrast: more)");
        if (contrastMediaQuery.matches) {
            return { error: 'User has indicated they want maximum contrast' };
        }

        initCanvas();

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

        let color1 = mainColor,
            color2 = stripeColor;

        const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (colorSchemeMediaQuery.matches) {
            color1 = darkMainColor;
            color2 = darkStripeColor;
        }

        let gradientChangeAt = Math.floor(stripeRatio * 1000);
        if (gradientChangeAt < 1) gradientChangeAt = 1;
        if (gradientChangeAt > 997) gradientChangeAt = 997;
        const myGradient = scrawl.makeGradient({
            name: `${name}-swirlstripe-gradient`,
            colors: [
                [0, color2],
                [gradientChangeAt, color2],
                [gradientChangeAt + 1, color1],
                [999, color1],
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

        responsiveFunctions.push((items = {}) => {

            const localLineHeight = parseFloat(items.lineHeight);

            cell.set({
                height: localLineHeight,
            });

            swirl.set({
                outerRadius: Math.ceil(localLineHeight * 2),
            });
        });

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

        additionalDemolishActions.push(() => {
            myGradient.kill();
            p1.kill();
            swirl.kill();
            cell.kill();
        });
    }
    return snippet;
};
