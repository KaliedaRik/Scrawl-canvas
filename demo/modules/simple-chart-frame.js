// import scrawl from 'https://unpkg.com/scrawl-canvas@8.0.11';
import scrawl from '../../source/scrawl.js';

scrawl.importDomImage('.crime');

let background, 
    title, subtitle, 
    yLabelTop, yLabelBottom, 
    xLabelLeft, xLabelRight, 
    group;

// Magic numbers to define where the chart will go within the grid
const graphWidth = 90;
const graphHeight = 80;
const graphBottom = 95;
const graphLeft = 10;

const build = function (namespace, canvas, backgroundImage) {

    group = scrawl.makeGroup({

        name: `${namespace}-group`,
        host: canvas.base.name,
        order: 1,
        visibility: false,
    });

    background = scrawl.makePicture({

        name: `${namespace}-background`,
        group: group,
        order: 0,

        width: '100%',
        height: '100%',

        copyWidth: '100%',
        copyHeight: '100%',

        globalAlpha: 0.65,

        asset: backgroundImage,
    });

    title = scrawl.makePhrase({

        name: `${namespace}-title`,
        group: group,
        order: 1,

        text: 'No title',

        width: '100%',
        justify: 'center',

        startY: '3%',

        font: '1.5rem Roboto, Arial, sans-serif',

        fillStyle: 'black',

        shadowColor: 'white',
        shadowBlur: 6,
    });

    subtitle = title.clone({

        name: `${namespace}-subtitle`,
        text: 'No data selected',

        startY: '9%',
        size: '1.2rem',
    });
    subtitle.addSectionClass('RED', { fill: 'darkred' });

    yLabelTop = scrawl.makePhrase({

        name: `${namespace}-y-top`,
        group: group,
        order: 1,

        text: '0',

        startX: '1%',
        startY: '12%',

        font: '0.9rem Roboto, Arial, sans-serif',

        fillStyle: 'darkred',

        shadowColor: 'white',
        shadowBlur: 6,
    });

    yLabelBottom = yLabelTop.clone({

        name: `${namespace}-y-bottom`,
        startY: '92%',
    });

    xLabelLeft = yLabelTop.clone({

        name: `${namespace}-x-left`,
        startX: '10%',
        startY: '96%',
    });

    xLabelRight = xLabelLeft.clone({

        name: `${namespace}-x-right`,
        startX: '89%',
    });

    scrawl.makeLine({

        name: `${namespace}-upperline`,
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

        name: `${namespace}-lowerline`,

        startY: `${graphBottom}%`,
        endY: `${graphBottom}%`,

    }).clone({

        name: `${namespace}-leftline`,

        startX: `${graphLeft}%`,
        endX: `${graphLeft}%`,

        startY: `${graphBottom - graphHeight}%`,
        endY: `${graphBottom}%`,
    });

    show();
};

const kill = () => group.kill(true);

const hide = () => group.visibility = false;
const show = () => group.visibility = true;

const updateTextHelper = function (item, text) {

    item.set({
        text: text,
    });
};

const updateTitle = (text) => updateTextHelper(title, text);
const updateSubtitle = (text) => updateTextHelper(subtitle, text);
const updateYTop = (text) => updateTextHelper(yLabelTop, text);
const updateYBottom = (text) => updateTextHelper(yLabelBottom, text);
const updateXLeft = (text) => updateTextHelper(xLabelLeft, text);
const updateXRight = (text) => updateTextHelper(xLabelRight, text);

const updateBackground = function (asset) {

    background.set({
        asset: asset,
    });
};

export {
    graphWidth,
    graphHeight,
    graphBottom,
    graphLeft,

    build,
    kill,

    hide,
    show,

    updateTitle,
    updateSubtitle,
    updateYTop,
    updateYBottom,
    updateXLeft,
    updateXRight,

    updateBackground,
};
