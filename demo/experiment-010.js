import scrawl from '../source/scrawl.js'

let canvas = scrawl.library.artefact.mycanvas;

let vid;

scrawl.makeFilter({

    name: 'stepper',
    method: 'channelstep',
    red: 64,
    green: 64,
    blue: 64,

}).clone({

    name: 'gray',
    method: 'grayscale',

}).clone({

    name: 'lines',
    method: 'matrix',
    weights: [-1, -1, 0, -1, 1, 1, 0, 1, 1],
});



scrawl.importMediaStream({ audio: false })
.then(myface => {

    vid = scrawl.makePicture({

        name: 'camera-picture',
        asset: myface.name,

        width: '100%',
        height: '100%',

        copyWidth: '100%',
        copyHeight: '100%',

        method: 'fill',

        filters: ['gray', 'stepper', 'lines'],
    });
})
.catch(err => console.log(err.message));

scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
});
