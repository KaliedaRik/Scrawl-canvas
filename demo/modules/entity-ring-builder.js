// # Demo Modules 003
// Factory functions to create more complex, compound entitys
//
// Related files:
// + [Compound entitys - main module](../modules-003.html)
//
// Import the Scrawl-canvas object 
// + There's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import scrawl from '../../source/scrawl.js';


// #### The entity ring factory
// This factory takes a single __items__ Javascript Object argument (to match the functionality of built-in Scrawl-canvas factories). Three of the attributes of this argument object are required, the others will fall back on default values. These attrributes are:
// + __canvas__ (required) - Scrawl-canvas Canvas wrapper object - the canvas which will be hosting the compound entity we are about to create
// + __name__ (required) - String - unique name value
// + __entity__ (required) - Scrawl-canvas entity object - any valid entity that has already been created
// + __dimensions__ - Number - the square dimensions of the compound entity; default: 400
// + __buildStartAngle__ - Number - the angle of the first entity we lay down; default: -45
// + __buildEndAngle__ - Number - the angle of the last entity we lay down - note that this needs to be sufficient to cover at least half of the ring, which we can then copy and stamp to create the final output; default: 225
// + __buildStepAngle__ - Number - the repeat value - higher values lead to fewer entitys making up the final ring; default: 15
// + __buildOffset__ - Number - the entity's offset from the center of the ring (as measured in px); default: 0
// + __reflectOnly__ - Boolean - when the ring half is copied and pasted back into the final output, it can be set to reflect only, which will give us a bilateral rather than a radial symmetry; default: false
export default function (items = {}) {

    if (!items.canvas || !items.entity || !items.name) return false;

    let canvas = items.canvas,
        name = items.name,
        entity = items.entity,
        dimensions = items.dimensions || 400,
        buildStartAngle = items.buildStartAngle || -45,
        buildEndAngle = items.buildEndAngle || 225,
        buildStepAngle = items.buildStepAngle || 15,
        buildOffset = items.buildOffset || 0,
        reflectOnly = items.reflectOnly || false;

    const cell = canvas.buildCell({
        name: `${name}-cell`,
        dimensions: [dimensions, dimensions],
        shown: false,
        compileOrder: 0,
    });

    const clip = scrawl.makeGroup({
        name: `${name}-clip-group`,
        host: `${name}-cell`,
        order: 0,
    });

    const reflect = scrawl.makeGroup({
        name: `${name}-reflect-group`,
        host: `${name}-cell`,
        order: 1,
    });

    scrawl.makeBlock({
        name: `${name}-clipper`,
        group: `${name}-clip-group`,
        start: ['left', 'center'],
        dimensions: ['100%', '50%'],
        method: 'clip'
    });

    let v = scrawl.requestVector(0, buildOffset);
    v.rotate(buildStartAngle);

    for (let i = buildStartAngle; i <= buildEndAngle; i += buildStepAngle) {

        entity.clone({
            name: `${name}-ringitem-${i}`,
            group: `${name}-clip-group`,
            roll: i,
            offset: [v.x, v.y],
        });

        v.rotate(buildStepAngle);
    }

    scrawl.releaseVector(v);

    scrawl.makePicture({
        name: `${name}-reflection`,
        group: `${name}-reflect-group`,
        asset: `${name}-cell`,

        start: ['center', '25%'],
        handle: ['center', 'center'],
        flipUpend: true,
        flipReverse: !reflectOnly,

        dimensions: ['100%', '50%'],
        copyDimensions: ['100%', '50%'],
        copyStartY: '50%',

        method: 'fill',
    });

    entity.set({
        visibility: false,
    });

    return {
        cell,
        kill: () => {

            clip.kill(true);
            reflect.kill(true);
            cell.kill();
        },
    }
};
