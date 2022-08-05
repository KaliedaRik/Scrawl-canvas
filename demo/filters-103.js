// # Demo Filters 103 
// A gallery of compound filter effects

// [Run code](../../demo/filters-103.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed, addImageDragAndDrop } from './utilities.js';


scrawl.importDomImage('.flowers');


// #### Create the filters
const myFilter = scrawl.makeFilter({

    name: 'tiles',
    method: 'tiles',
    tileRadius: 50,
    offsetX: 200,
    offsetY: 200,
});


// #### Scene setup and animation
const {
    'canvas-1':canvas1, 
    'canvas-2':canvas2, 
    'canvas-3':canvas3, 
    'canvas-4':canvas4,
} = scrawl.library.canvas;

// Create the target entitys
scrawl.makePicture({

    name: 'canvas-output-1',
    group: canvas1.base.name,
    asset: 'iris',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    filters: [],

}). clone({

    name: 'canvas-output-2',
    group: canvas2.base.name,
    filters: [],

}). clone({

    name: 'canvas-output-3',
    group: canvas3.base.name,
    filters: [],

}). clone({

    name: 'canvas-output-4',
    group: canvas4.base.name,
    filters: [],
});

const pictures = scrawl.makeGroup({
    name: 'target-images',
}).addArtefacts('canvas-output-1', 'canvas-output-2', 'canvas-output-3', 'canvas-output-4')

const report = reportSpeed('#reportmessage');

scrawl.makeRender({

    name: "demo-animation",
    target: [canvas1, canvas2, canvas3, canvas4],
});

scrawl.makeRender({
    name: "demo-reporter",
    afterShow: report,
});


// #### Drag-and-Drop image loading functionality
addImageDragAndDrop([canvas1, canvas2, canvas3, canvas4], '#my-image-store', pictures);


// #### Development and testing
console.log(scrawl.library);
