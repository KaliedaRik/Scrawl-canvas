// # Demo Modules 001
// Scrawl-canvas modularized code - London crime charts
//
// Related files:
// + [London crime charts - main module](../modules-001.html)
// + [London crime lines module](./london-crime-lines.html)
// + [London crime stacked bar module](./london-crime-stacked-bars.html)
// + [Simple chart frame module](./simple-chart-frame.html)
// + [Simple graph lines module](./simple-graph-lines.html)
// + [Simple graph stacked bars module](./simple-graph-stacked-bars.html)


// #### State and magic numbers
// API - exported functions
// + defined in the build function
const api = {};

// Dims - exported magic numbers
// + to define where the chart will go within the grid
const dims = {
    graphWidth: 90,
    graphHeight: 80,
    graphBottom: 95,
    graphLeft: 10,
};


// #### Build function
const build = function (items) {

    const { namespace, canvas, backgroundImage, scrawl } = items;

    if (namespace && canvas && backgroundImage && scrawl) {


        // Namespace boilerplate
        const name = (item) => `${namespace}-${item}`;


        // Build out the frame
        const { graphHeight, graphBottom, graphLeft } = dims;

        const group = scrawl.makeGroup({

            name: name('group'),
            host: canvas.base.name,
            order: 1,
        });

        const background = scrawl.makePicture({

            name: name('background'),
            group: group,
            order: 0,

            width: '100%',
            height: '100%',

            copyWidth: '100%',
            copyHeight: '100%',

            globalAlpha: 0.65,

            asset: backgroundImage,
        });

        const title = scrawl.makeLabel({

            name: name('title'),
            group: group,
            order: 1,
            accessibleTextOrder: 1,

            text: 'No title',

            start: ['center', '3%'],
            handle: ['center', 'center'],

            fontString: '1.5rem Roboto',
        });

        scrawl.makeBlock({

            name: name('subtitle-template'),
            group: group,

            start: ['center', '9%'],
            handle: ['center', 'center'],
            dimensions: ['100%', 1],

            method: 'none',
        })

        const subtitle = scrawl.makeEnhancedLabel({

            name: name('subtitle'),
            group: group,
            order: 1,

            layoutTemplate: name('subtitle-template'),

            text: 'No data selected',
            accessibleTextOrder: 2,

            fontString: '1.2rem Roboto',
            textHandleY: 'alphabetic',
        });

        const yLabelTop = scrawl.makeLabel({

            name: name('y-top'),
            group: group,
            order: 1,
            accessibleTextOrder: 6,

            text: '0',
            accessibleText: 'To § crimes',

            startX: '1%',
            startY: '12%',

            fontString: '0.9rem Roboto, Arial, sans-serif',

            fillStyle: 'darkred',
        });

        const yLabelBottom = yLabelTop.clone({

            name: name('y-bottom'),
            startY: '92%',
            accessibleText: 'Y axis. From § crimes',
            accessibleTextOrder: 5,
        });

        const xLabelLeft = yLabelTop.clone({

            name: name('x-left'),
            startX: '10%',
            startY: '96%',
            accessibleText: 'X axis. From year §',
            accessibleTextOrder: 3,
        });

        const xLabelRight = xLabelLeft.clone({

            name: name('x-right'),
            startX: '89%',
            accessibleText: 'To year §',
            accessibleTextOrder: 4,
        });

        scrawl.makeLine({

            name: name('upperline'),
            group: group,
            order: 1,

            startX: 0,
            startY: `${graphBottom - graphHeight}%`,

            endX: '100%',
            endY: `${graphBottom - graphHeight}%`,

            strokeStyle: 'red',
            method: 'draw',

            lineWidth: 1,

        }).clone({

            name: name('lowerline'),

            startY: `${graphBottom}%`,
            endY: `${graphBottom}%`,

        }).clone({

            name: name('leftline'),

            startX: `${graphLeft}%`,
            endX: `${graphLeft}%`,

            startY: `${graphBottom - graphHeight}%`,
            endY: `${graphBottom}%`,
        });


        // Accessibility
        canvas.set({
            includeInTabNavigation: true,
        });

        api.keyboard = scrawl.makeKeyboardZone({
            zone: canvas,
        });


        // Update frame entitys and assets
        const updateTextHelper = function (item, text) {

            if (item != null && text != null) item.set({ text });
        };

        api.updateTitle = (text) => updateTextHelper(title, text);
        api.updateSubtitle = (text) => updateTextHelper(subtitle, text);
        api.updateYTop = (text) => updateTextHelper(yLabelTop, text);
        api.updateYBottom = (text) => updateTextHelper(yLabelBottom, text);
        api.updateXLeft = (text) => updateTextHelper(xLabelLeft, text);
        api.updateXRight = (text) => updateTextHelper(xLabelRight, text);

        api.updateBackground = function (asset) {

            if (background != null && asset != null) background.set({ asset });
        };


        // Kill the frame
        api.kill = () => {

            scrawl.library.purge(namespace);
            api.keyboard();
        }
    }
};


// #### Export
export {
    build,
    dims,
    api,
};
