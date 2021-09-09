// # Demo DOM 004
// Limitless rockets (clone and destroy elements, tweens, tickers)

// [Run code](../../demo/dom-004.html)
import scrawl from '../source/scrawl.js'

import { reportSpeed, killTicker } from './utilities.js';


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
const report = reportSpeed('#reportmessage', function () {

    const lib = scrawl.library;

    let t = Object.keys(lib.tween),
        a = Object.keys(lib.artefact),
        n = Object.keys(lib.animation),
        k = Object.keys(lib.animationtickers),
        e = Object.keys(lib.element),
        tn = lib.tweennames.length,
        an = lib.artefactnames.length,
        nn = lib.animationnames.length,
        kn = lib.animationtickersnames.length,
        en = lib.elementnames.length;

    return `Tween - ${t.length}, ${tn}: ${t.join(', ')}
Artefact - ${a.length}, ${an}: ${a.join(', ')}
Element - ${e.length}, ${en}: ${e.join(', ')}
Tickers - ${k.length}, ${kn}: ${k.join(', ')}
Animation - ${n.length}, ${nn}: ${n.join(', ')}`;
});


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
