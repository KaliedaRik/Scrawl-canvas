// # Demo Modules 004
// Factory function to load, play and expose a Lottie animation as an asset for use by Scrawl-canvas Picture entitys and Pattern styles
//
// Related files:
// + [Lottie loader - main module](../modules-004.html)


// #### The Lottie animation loader function
// This factory takes a single __items__ Javascript Object argument (to match the functionality of built-in Scrawl-canvas factories). Two of the attributes of this argument object are required, the others will fall back on default values. These attrributes are:
// + __name__ (required) - String - unique name value
// + __src__ (required) - String - path to the lottie.json animation file
// + __scrawl__ (required) - the Scrawl-canvas object
// + __width__ - Number - width of the animation; default `1000`
// + __bodymovinLibrary__ - String - CDN path at which the Bodymovin library can be obtained; default: `https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.8.1/lottie.min.js`
//
// The factory returns a Promise which resolves to an object which contains handles to the RawAsset Object, the Bodymovin controller Object, and a `kill` function which will remove all objects and DOM infrastructure when invoked.
export default function (items) {

    let { src, bodymovinLibrary, width, name, loop, autoplay, scrawl } = items;

    if (!(src && name && scrawl)) return false;

    if (loop == null) loop = false;
    if (autoplay == null) autoplay = false;
    if (!width) width = 1000;

    if (!bodymovinLibrary) bodymovinLibrary = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.8.1/lottie.min.js';

    const doWork = function () {

        const hold = document.createElement('div');
        hold.style.height = '0';
        hold.style.overflow = 'hidden';

        const container = document.createElement('div');
        container.style.width = `${width}px`;
        container.id = name;

        hold.appendChild(container);
        document.body.appendChild(hold);

/* eslint-disable */
// @ts-expect-error
        const controller = bodymovin.loadAnimation({

/* eslint-enable */
            container,
            path: src,
            renderer: 'canvas',
            loop: true,
            autoplay: true,
            name,
        });

        const asset = scrawl.makeRawAsset({

            name: `${name}-asset`,

            userAttributes: [{
                key: 'lottie', 
                defaultValue: controller,
                setter: () => {},
            },{
                key: 'lottieCanvas', 
                defaultValue: null,
                setter: () => {},
            },{
                key: 'canvasWidth', 
                defaultValue: 0,
                setter: () => {},
            },{
                key: 'canvasHeight', 
                defaultValue: 0,
                setter: () => {},
            },{
                key: 'trigger', 
                defaultValue: false,
                setter: function (item) { this.dirtyData = item },
            }],

            updateSource: function (assetWrapper) {

                let { element, engine, canvasWidth, canvasHeight, lottieCanvas } = assetWrapper;

                if (!lottieCanvas) {

                    const c = container.querySelector('canvas');

                    if (c) {

                        lottieCanvas = this.lottieCanvas = c;
                        canvasWidth = this.canvasWidth = c.width;
                        canvasHeight = this.canvasHeight = c.height;
                    }
                }

                if (lottieCanvas) {

                    element.width = canvasWidth;
                    element.height = canvasHeight;

                    engine.drawImage(lottieCanvas, 0, 0, canvasWidth, canvasHeight);
                }
            },
        });
        return {
            asset,
            controller,
            kill: () => {
                asset.kill();
                controller.destroy();
                hold.remove();
            },
        }
    };

// @ts-expect-error
    if (!window.bodymovin) {

        return new Promise(resolve => {

            const script = document.createElement('script');
            script.src = bodymovinLibrary;
            script.type = 'text/javascript';

            script.onload = function () {
                resolve(doWork());
            };

            document.body.appendChild(script);
        });
    }
    return Promise.resolve(doWork());
}
