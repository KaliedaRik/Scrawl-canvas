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
    filters: ['blotchy-newsprint'],
    memoizeFilterOutput: true,

}). clone({

    name: 'canvas-output-2',
    group: canvas2.base.name,
    filters: ['jagged-shapes'],

}). clone({

    name: 'canvas-output-3',
    group: canvas3.base.name,
    filters: ['brass-rubbing'],

}). clone({

    name: 'canvas-output-4',
    group: canvas4.base.name,
    filters: [],
});

const pictures = scrawl.makeGroup({
    name: 'target-images',
}).addArtefacts('canvas-output-1', 'canvas-output-2', 'canvas-output-3', 'canvas-output-4')


// Animation
const report = reportSpeed('#reportmessage');

scrawl.makeRender({

    name: "demo-animation",
    target: [canvas1, canvas2, canvas3, canvas4],
});

scrawl.makeRender({
    name: "demo-reporter",
    afterShow: report,
});


// #### Filter setup
// Blotchy newsprint
scrawl.makeFilter({

    name: 'blotchy-newsprint',
    actions: [{
        action: 'newsprint',
        width: 3,
        opacity: 0.5,
    }, {
        action: 'gaussian-blur',
        radius: 2,
    }, {
        action: 'step-channels',
        red: 31,
        green: 31,
        blue: 31,
        clamp: 'round',
    }],
});


// Translucent jagged edges effect
const points1 = [],
    points2 = [];

for (let i = 0; i < 2000; i++) {
    points1.push(parseInt(Math.random() * 400, 10))
    points2.push(parseInt(Math.random() * 400, 10))
}

scrawl.makeFilter({

    name: 'jagged-shapes',
    actions: [{
        action: 'tiles',
        points: points1,
        tileRadius: 30,
    }, {
        action: 'tiles',
        points: points2,
        tileRadius: 30,
        opacity: 0.5
    }],
});


// Brass rubbing effect
scrawl.makeFilter({

    name: 'brass-rubbing',
    actions: [{
        action: 'gaussian-blur',
        radius: 2,
    }, {
        action: 'matrix',
        width: 3,
        height: 3,
        offsetX: 1,
        offsetY: 1,
        weights: [0,1,0,1,-4,1,0,1,0],
    }, {
        action: 'channels-to-alpha',
    }, {
        action: 'flood',
        red: 180,
    }],
});




// #### Drag-and-Drop image loading functionality
addImageDragAndDrop([canvas1, canvas2, canvas3, canvas4], '#my-image-store', pictures);


// #### Development and testing
console.log(scrawl.library);
