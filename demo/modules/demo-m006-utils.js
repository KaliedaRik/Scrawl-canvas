// # Demo Modules 006
// Animation observer; Scrollytelling: utility functions
//
// Related files:
// + [Scrollytelling - main demo](../modules-006.html)


// #### Asset loader
// Assets are defined in the canvas element/shadow DOM in the HTML file
export const loader = (canvas, scrawl) => {

    const assets = scrawl.library.asset;

    const manifest = JSON.parse(canvas.domElement.dataset.manifest);

    scrawl.importDomImage(`.${manifest.class}`);

    const result = {};

    for (const [key, value] of Object.entries(manifest)) {

        if (key === 'target') {

            result[key] = document.querySelector(value);
        }

        else if (key !== 'class') {

            result[key] = assets[value];
        }
    }
    return result;
};


// #### Scrollytelling target range
// Scrollytelling often relies on an HTML element remaining sticky withing a parent or neighbour element. We can use the scroll progress of this target element to supply a timeline position which can advance/reverse a set of tweens/actions associated with that timeline in line with the user's scroll actions
// + `target` - the HTML element we measure progress on
// + `divisor` - a Number that represents the height ratio between the target and canvas elements
//
// Example of working out the divisor value:
// + The canvas has been set to a height of 100vh
// + The target (which contains the canvas) has been set to a height of 400vh
// + Thus the canvas will remain sticky in the viewport for 300vh
// + This means the target's `inViewportTop` value (calculated in the function) will range between `0` and `-3` while the canvas is sticky
// + Thus the divisor value should be `3`
export const calculateTargetPosition = (target, divisor) => {


    return function () {

        const dims = target.getBoundingClientRect();

        const dot = dims.top,
            wih = window.innerHeight,
            inViewportTop = dot / wih;

        // We start the animation after the target top moves above the viewport top
        // + which gives us a negative value that we correct here
        let result = (-inViewportTop * 1000) / divisor;

        // We clamp the result to the range 0 - 1000
        // + We can now use this for our timeline progression animation
        if (result < 0) result = 0;
        else if (result > 1000) result = 1000;

        return result;
    }
};


// #### Reduce motion functionality
// A convenience function to add the `reduceMotionAction` and `noPreferenceMotionAction` attributes to a canvas. Takes an Object argument containing the following attributes:
// + `fixed` - a group containing artefacts that display when the user requests reduced motion, or an Array of such groups
// + `animated` - a group containing artefacts that display when the user give no preference about reduced motion, or an Array of such groups
// + `animation` - the animation object
// + `commence` - a function that handles required animation actions at the start of each Display cycle
export const reducedMotionFunctions = (items) => {

    let {fixed, animated, animation, commence, halt } = items;

    if (!(fixed && animated && animation && commence)) return {};

    if (!Array.isArray(fixed)) fixed = [fixed];
    if (!Array.isArray(animated)) animated = [animated];

    if (halt == null) halt = () => {};

    return {

        reduceMotionAction: () => {

            fixed.forEach(a => a.setArtefacts({ visibility: true }));
            animated.forEach(a => a.setArtefacts({ visibility: false }));
            animation.set({ commence: halt });
        },
        noPreferenceMotionAction: () => {

            fixed.forEach(a => a.setArtefacts({ visibility: false }));
            animated.forEach(a => a.setArtefacts({ visibility: true }));
            animation.set({ commence });
        },
    }
};


// #### Reduce motion functionality
// Used to reconcile static image dimensions with canvas dimensions, so the images don't stretch or distort when shown in the canvas
export const staticPlaceholderCorrection = (img) => {

    let placeholderRatio = 0,
        width = 0,
        height = 0;

    return () => {

        const [w, h] = img.get('copyDimensions');

        if (width !== w || height !== h || !placeholderRatio) {

            width = w;
            height = h;
            placeholderRatio = h / w;

            if (placeholderRatio < 1) {

                img.set({
                    width: '100%',
                    height: `${100 * placeholderRatio}%`,
                });
            }
            else {

                img.set({
                    width: `${100 * (w / h)}%`,
                    height: '100%',
                });
            }
        }
    };
};
