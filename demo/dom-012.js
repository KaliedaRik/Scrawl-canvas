// # Demo DOM 012
// Add and remove (kill) Scrawl-canvas canvas elements programmatically

// [Run code](../../demo/dom-012.html)
import * as scrawl from '../source/scrawl.js';


// #### Scene setup
let library = scrawl.library,
    artefact = library.artefact,
    canvasnames = library.canvasnames,
    mystack = artefact.mystack;


// #### Scene animation
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, text,
        testMessage = document.querySelector('#reportmessage');

    let artefactnames = library.artefactnames,
        stacknames = library.stacknames,
        cellnames = library.cellnames,
        stack = library.stack,
        canvas = library.canvas,
        cell = library.cell;

    let a, s, el, c;

    return function () {

        a = Object.keys(artefact);
        s = Object.keys(stack);
        el = Object.keys(canvas);
        c = Object.keys(cell);

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
artefact - ${a.length}, ${artefactnames.length}: [${(artefactnames).join(', ')}] 
stack - ${s.length}, ${stacknames.length}: [${(stacknames).join(', ')}] 
canvas - ${el.length}, ${canvasnames.length}: [${(canvasnames).join(', ')}]
cell - ${c.length}, ${cellnames.length}: [${(cellnames).join(', ')}]`;
    };
}();


// Animation loop 
//
// We can't use `.makeRender()` in this case because there's no initial stack/canvas arterfact to render. Using `.makeAnimation()` and `.render()` - which use promises - instead
scrawl.makeAnimation({

    name: 'demo-animation',
    fn: function () { scrawl.render() },
});


// #### User interaction
let controls = function () {

    // the control buttons are never part of a Scrawl-canvas stack
    let b1 = document.querySelector('#action_1'),
        b2 = document.querySelector('#action_2'),
        b3 = document.querySelector('#action_3'),
        b4 = document.querySelector('#action_4');

// @ts-expect-error
    b1.disabled = '';
// @ts-expect-error
    b2.disabled = 'disabled';
// @ts-expect-error
    b3.disabled = '';
// @ts-expect-error
    b4.disabled = '';

    let stackCanvas, divCanvas;

    // Using a color factory object to generate random colors within a restricted palette
    scrawl.makeColor({
        name: 'templateColor',
        minimumColor: 'maroon',
        maximumColor: 'darkgreen',
    });

    // Test color packet and clone functionality
    let colorFactory = scrawl.library.styles.templateColor.clone({
        name: 'myColorObject',
    });

    console.log(colorFactory.saveAsPacket());
    // ```
    // RESULTS:
    // [
    //     "myColorObject",
    //     "Color",
    //     "styles",
    //     {
    //         "name":"myColorObject",
    //         "easingFunction":"a~~~ return a; ",
    //         "rgb":[0,0,0,0],
    //         "rgb_max":[0,100,0,1],
    //         "rgb_min":[128,0,0,1],
    //         "hsl":[0,0,0,0],
    //         "hsl_max":[120,100,19.53125,1],
    //         "hsl_min":[0,100,25,1],
    //         "hwb":[0,0,100,0],
    //         "hwb_max":[120,0,60.9375,1],
    //         "hwb_min":[0,0,50,1],
    //         "xyz":[0,0,0,0],
    //         "xyz_max":[4.557171452378752,9.114342904757503,1.5190571507929174,1],
    //         "xyz_min":[8.902087024697204,4.589194232421498,0.4166107652198255,1],
    //         "lab":[0,0,0,0],
    //         "lab_max":[36.20351872497332,-43.3725486689954,41.861707982223464,1],
    //         "lab_min":[25.530784572416167,48.05284709622495,38.06053447826044,1],
    //         "lch":[0,0,0,0],
    //         "lch_max":[36.20351872497332,60.27918855818587,136.01550402033251,1],
    //         "lch_min":[25.530784572416167,61.29992168693225,38.381187278486735,1]
    //     }
    // ]
    // ```

    return function (e) {

        e.preventDefault();
        e.returnValue = false;
        
        switch (e.target.id) {

            case 'action_1':
// @ts-expect-error
                b1.disabled = 'disabled';
// @ts-expect-error
                b2.disabled = '';

                stackCanvas = scrawl.addCanvas({

                    // Test to make sure host attribute accepts both Stack object and CSS search String
                    host: (Math.random() > 0.5) ? mystack : '#mystack',

                    name: 'my-new-canvas',
                    width: 300,
                    height: 50,
                    backgroundColor: 'lavender',
                });

                break;

            case 'action_2':

// @ts-expect-error
                b1.disabled = '';
// @ts-expect-error
                b2.disabled = 'disabled';

                if (stackCanvas) stackCanvas.kill();

                break;

            case 'action_3':

// @ts-expect-error
                b1.disabled = '';
// @ts-expect-error
                b2.disabled = 'disabled';
// @ts-expect-error
                b3.disabled = 'disabled';

                mystack.kill();
                mystack = false;

                break;
                
            case 'action_4':

                scrawl.addCanvas({
                    name: `extra-canvas-${canvasnames.length}`,
                    host: (Math.random() > 0.5) ? '#not-a-stack' : '',
                    width: 300,
                    height: 50,
                    backgroundColor: colorFactory.getRangeColor(Math.random()),
                });

                break;
        }
    };
}();
scrawl.addListener('up', controls, '.control_button');


// #### Development and testing
console.log(scrawl.library);
