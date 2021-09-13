// # Demo Filters 024 
// Filter parameters: curveWeights

// [Run code](../../demo/filters-024.html)
import scrawl from '../source/scrawl.js';


// #### Scene setup
scrawl.setIgnorePixelRatio(false);

scrawl.importDomImage('.flowers');

const oCanvas = scrawl.library.canvas['output-canvas'];
const wCanvas = scrawl.library.canvas['channel-weights-canvas'];


// #### Curves filter
const weights = new Array(1024);
weights.fill(0);

const myFilter = scrawl.makeFilter({

    name: 'my-filter',
    method: 'curveWeights',

    weights: [...weights],
});


// #### Output canvas
scrawl.makePicture({

    name: 'base-piccy',
    group: oCanvas.base.name,

    asset: 'iris',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    method: 'fill',

    filters: ['my-filter'],
});


// #### Weights canvas
let curvesCell = wCanvas.buildCell({

    name: 'curves-cell',
    dimensions: [360, 360],
});

const curveArray = ['red', 'green', 'blue', 'black'];

curveArray.forEach((name, index) => {

    scrawl.makeGroup({

        name: `${name}-pins-group`,
        host: wCanvas.base.name,
        order: index,
    });

    scrawl.makeWheel({

        name: `${name}-pin-start`,
        group: `${name}-pins-group`,
        radius: 12,
        start: [0, 360],
        fillStyle: name,
        strokeStyle: 'gold',
        method: 'fillThenDraw',
        handle: ['center', 'center'],

    }).clone({

        name: `${name}-pin-cs`,
        radius: 8,
        start: [120, 240],
        method: 'fill',

    }).clone({

        name: `${name}-pin-ce`,
        start: [240, 120],

    }).clone({

        name: `${name}-pin-end`,
        radius: 12,
        start: [360, 0],
        method: 'fillThenDraw',
    });

    scrawl.makeBezier({

        name: `${name}-bezier`,
        group: 'curves-cell',

        strokeStyle: name,
        lineWidth: 1,
        method: 'draw',

        pivot: `${name}-pin-start`,
        lockTo: 'pivot',
        startControlPivot: `${name}-pin-cs`,
        startControlLockTo: 'pivot',
        endControlPivot: `${name}-pin-ce`,
        endControlLockTo: 'pivot',
        endPivot: `${name}-pin-end`,
        endLockTo: 'pivot',

        useStartAsControlPoint: true,
        useAsPath: true,
    });
});


// #### User interaction
// Create the drag-and-drop zone
let draggedPin = false;

let dragGroup = scrawl.makeGroup({
    name: 'drag-group',
});

dragGroup.addArtefacts('black-pin-start', 'black-pin-cs', 'black-pin-ce', 'black-pin-end');

const currentPin = scrawl.makeDragZone({

    zone: wCanvas,
    collisionGroup: 'drag-group',
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,

    updateOnStart: () => {

        draggedPin = currentPin();

        if (draggedPin) {

            let pin = draggedPin.artefact,
                name = pin.name;

            if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

                pin.isBeingDragged = false;
                pin.set({
                    lockXTo: 'mouse',
                });
            }
        }
    },

    updateOnEnd: () => {

        if (draggedPin) {

            let pin = draggedPin.artefact,
                name = pin.name;

            if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

                pin.set({
                    start: pin.get('position'),
                    lockXTo: 'start',
                });
            }
        }
        draggedPin = false;

        recalculateWeights();
    },
});


// Filter weights recalculation
const recalculateWeights = function () {

    const allCurve = scrawl.library.entity['black-bezier'],
        redCurve = scrawl.library.entity['red-bezier'],
        greenCurve = scrawl.library.entity['green-bezier'],
        blueCurve = scrawl.library.entity['blue-bezier'];

    const step = 360 / 256,
        inverseStep = 256 / 360;

    const { engine, element } = curvesCell;

    return function () {

        const [startAllX, temp0] = allCurve.get('position');
        const [endAllX, temp1] = allCurve.get('endPosition');

        const [startRedX, temp2] = redCurve.get('position');
        const [endRedX, temp3] = redCurve.get('endPosition');

        const [startGreenX, temp4] = greenCurve.get('position');
        const [endGreenX, temp5] = greenCurve.get('endPosition');

        const [startBlueX, temp6] = blueCurve.get('position');
        const [endBlueX, temp7] = blueCurve.get('endPosition');

        const redArray = [],
            greenArray = [],
            blueArray = [],
            allArray = [];

        for (let i = 0; i < 1; i += 0.001) {

            let r = redCurve.getPathPositionData(i),
                g = greenCurve.getPathPositionData(i),
                b = blueCurve.getPathPositionData(i),
                a = allCurve.getPathPositionData(i);

            let {x:xr, y:yr} = r;
            let {x:xg, y:yg} = g;
            let {x:xb, y:yb} = b;
            let {x:xa, y:ya} = a;

            xr = Math.floor(xr * inverseStep);
            xg = Math.floor(xg * inverseStep);
            xb = Math.floor(xb * inverseStep);
            xa = Math.floor(xa * inverseStep);

            yr = 256 - (yr * inverseStep);
            yg = 256 - (yg * inverseStep);
            yb = 256 - (yb * inverseStep);
            ya = 256 - (ya * inverseStep);

            if (!redArray[xr]) redArray[xr] = [];
            redArray[xr].push(yr);

            if (!greenArray[xg]) greenArray[xg] = [];
            greenArray[xg].push(yg);

            if (!blueArray[xb]) blueArray[xb] = [];
            blueArray[xb].push(yb);

            if (!allArray[xa]) allArray[xa] = [];
            allArray[xa].push(ya);
        }

        let temp, tempLen, res;

        for (let i = 0, cursor = 0; i < 256; i++) {

            if (!redArray[i]) redArray[i] = [];
            tempLen = redArray[i].length;
            if (!tempLen) {
                if (startRedX < endRedX) {
                    if (i < startRedX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
                else {
                    if (i > startRedX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
            }
            else {
                temp = [...redArray[i]];
                res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
                weights[cursor] = res - i;
            }
            cursor++;

            if (!greenArray[i]) greenArray[i] = [];
            tempLen = greenArray[i].length;
            if (!tempLen) {
                if (startGreenX < endGreenX) {
                    if (i < startGreenX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
                else {
                    if (i > startGreenX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
            }
            else {
                temp = [...greenArray[i]];
                res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
                weights[cursor] = res - i;
            }
            cursor++;

            if (!blueArray[i]) blueArray[i] = [];
            tempLen = blueArray[i].length;
            if (!tempLen) {
                if (startBlueX < endBlueX) {
                    if (i < startBlueX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
                else {
                    if (i > startBlueX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
            }
            else {
                temp = [...blueArray[i]];
                res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
                weights[cursor] = res - i;
            }
            cursor++;

            if (!allArray[i]) allArray[i] = [];
            tempLen = allArray[i].length;
            if (!tempLen) {
                if (startAllX < endAllX) {
                    if (i < startAllX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
                else {
                    if (i > startAllX) weights[cursor] = -i;
                    else weights[cursor] = 255 - i;
                }
            }
            else {
                temp = [...allArray[i]];
                res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
                weights[cursor] = res - i;
            }
            cursor++;
        }

        myFilter.set({
            weights: [...weights],
        });

        updateOutput();
    }
}();


// #### Scene animation
// In this demo we continuously animate the (right hand side) curves canvas, but only update the (left hand side) output canvas when the filter changes
const demoAnimation = scrawl.makeRender({

    name: "demo-animation",
    target: wCanvas,
});

const updateOutput = () => {

    oCanvas.render();
    document.querySelector('#reportmessage').textContent = weights.join(', ');
}

updateOutput();


// #### User interaction
// Top form (for opacity, use mixed channel controls)
scrawl.observeAndUpdate({

    event: ['input', 'change'],
    origin: '.controlItem',

    target: myFilter,

    useNativeListener: true,
    preventDefault: true,

    updates: {

        opacity: ['opacity', 'float'],
        useMixedChannel: ['useMixedChannel', 'boolean'],
    },
});


// Channel buttons (under the curves canvas)
let selected = false,
    selectedGroup = false;

scrawl.addNativeListener('click', (e) => {

    if (e && e.target && e.target.id) {

        if (selectedGroup) {

            let order = selectedGroup.get('order') - 10;

            selectedGroup.setArtefacts({ order });
            selectedGroup.set({ order });
        }

        selected = e.target.id;
        selectedGroup = scrawl.library.group[`${selected}-pins-group`];

        if (selectedGroup) {

            document.querySelectorAll('.channel-selector').forEach(el => el.classList.remove('selected'));

            let order = selectedGroup.get('order') + 10;

            selectedGroup.setArtefacts({ order });
            selectedGroup.set({ order });

            dragGroup.clearArtefacts();
            dragGroup.addArtefacts(`${selected}-pin-start`, `${selected}-pin-cs`, `${selected}-pin-ce`, `${selected}-pin-end`);

            e.target.classList.add('selected');
        }
    }
}, '.channel-selector');

scrawl.addNativeListener(['input', 'change'], () => updateOutput(), '.controlItem');


// Setup form
document.querySelector('#useMixedChannel').options.selectedIndex = 1;
document.querySelector('#opacity').value = 1;


// #### Development and testing
console.log(scrawl.library);
