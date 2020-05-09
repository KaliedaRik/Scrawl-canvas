// # Demo Canvas 028 
// Image magnifier; test some composite operations

// [Run code](../../demo/canvas-028.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
scrawl.importDomImage('.angels');

let canvas = scrawl.library.canvas.mycanvas;

canvas.set({

    fit: 'cover',
    checkForResize: true,

}).setBase({

    width: 800,
    height: 400,

}).setAsCurrentCanvas();

let magnifier = scrawl.makeGroup({

    name: 'magnifier-group',
    host: canvas.base.name,
    order: 1,

});

scrawl.makeGroup({

    name: 'background-group',
    host: canvas.base.name,
    order: 2
});

let myradius = 80;

let mybackground = scrawl.makePicture({

    name: 'background',
    group: 'background-group',

    asset: 'small-angels',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    globalCompositeOperation: 'destination-over',
});

scrawl.makeWheel({

    name: 'magnifier',
    group: 'magnifier-group',

    order: 1,

    radius: 80,

    handleX: 'center',
    handleY: 'center',

    lockTo: 'mouse',

    method: 'fill',

}).clone({

    name: 'magnifier-rim',

    order: 3,

    lineWidth: 5,
    strokeStyle: 'gold',

    method: 'draw',
});

let myMagnifierImage = scrawl.makePicture({

    name: 'enlarged',
    group: 'magnifier-group',

    order: 2,

    asset: 'big-angels',

    width: myradius * 2,
    height: myradius * 2,

    copyWidth: myradius * 2,
    copyHeight: myradius * 2,

    handleX: 'center',
    handleY: 'center',

    lockTo: 'mouse',

    globalCompositeOperation: 'source-in',
});

let checkMagnifier = function () {

    let display, base;

    return function () {

        if (!display) display = canvas.here;
        if (!base) base = canvas.base.here;

        let active = display.active;

        magnifier.set({
            visibility: (active) ? true : false,
        });

        if (active) {

            myMagnifierImage.set({

                copyStartX: (base.x * 3) - myradius,
                copyStartY: (base.y * 3) - myradius,
            });
        }
    };
}();

let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,

        displayed = canvas.here,
        hidden = canvas.base.here,

        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Display canvas mouse - x: ${displayed.x}, y: ${displayed.y}
Base canvas mouse - x: ${hidden.x}, y: ${hidden.y}`;
    };
}();

scrawl.makeRender({
    name: 'demo-animation',
    target: canvas,

    commence: checkMagnifier,
    afterShow: report,
});

console.log(scrawl.library);
