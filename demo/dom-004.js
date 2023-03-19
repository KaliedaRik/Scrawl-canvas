// # Demo DOM 004
// Limitless rockets (clone and destroy elements, tweens, tickers)

// [Run code](../../demo/dom-004.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed, killTicker, reportFullLibrary } from './utilities.js';


// #### Scene setup
let library = scrawl.library,
    artefact = library.artefact,
    stack = artefact.mystack;

stack.set({
    width: 300,
    height: 600,
    css: {
        overflow: 'hidden'
    }
});

stack.addExistingDomElements('#rocket');
let rocket = artefact.rocket;

rocket.set({
    startX: 600,
    startY: 540,
    width: 50,
    height: 100,
    handleX: 570,
    handleY: 'center',
});


// Set a tween up as a template which can be cloned, but will never itself run
let tween = scrawl.makeTween({

    name: 'template',

    duration: 5000,
    killOnComplete: true,
    useNewTicker: true,

    definitions: [
        {
            attribute: 'roll',
            start: 0,
            end: 65
        }
    ],

    commenceAction: function () {

// @ts-expect-error
        this.set({
            targets: rocket.clone({
                name: `${this.name}-element`,
            })
        });
    },

    completeAction: function () {

        artefact[`${this.name}-element`].kill();
    },
}).removeFromTicker();


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage', () => reportFullLibrary(scrawl));


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: stack,
    afterShow: report,
});


// #### User interaction
// Create event listener to generate and start new element and tween
let counter = 0;
let flyRocket = function(e) {

    e.preventDefault();
    e.returnValue = false;

    tween.clone({
        name: `rocket-${counter}`,
    }).run();

    counter ++;
};
scrawl.addNativeListener('click', flyRocket, stack.domElement);


// #### Development and testing
console.log(scrawl.library);

console.log('Performing tests ...');
killTicker(stack, 'template_ticker', 4000);
