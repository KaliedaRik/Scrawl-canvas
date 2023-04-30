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

        const title = scrawl.makePhrase({

            name: name('title'),
            group: group,
            order: 1,

            text: 'No title',

            width: '100%',
            justify: 'center',

            startY: '3%',

            font: '1.5rem Roboto, Arial, sans-serif',

            fillStyle: 'black',
        });

        const subtitle = title.clone({

            name: name('subtitle'),
            text: 'No data selected',

            startY: '9%',
            size: '1.2rem',
        });

        subtitle.addSectionClass('RED', { fill: 'darkred' });

        const yLabelTop = scrawl.makePhrase({

            name: name('y-top'),
            group: group,
            order: 1,

            text: '0',

            startX: '1%',
            startY: '12%',

            font: '0.9rem Roboto, Arial, sans-serif',

            fillStyle: 'darkred',
        });

        const yLabelBottom = yLabelTop.clone({

            name: name('y-bottom'),
            startY: '92%',
        });

        const xLabelLeft = yLabelTop.clone({

            name: name('x-left'),
            startX: '10%',
            startY: '96%',
        });

        const xLabelRight = xLabelLeft.clone({

            name: name('x-right'),
            startX: '89%',
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
