// # Demo DOM 004
// Limitless rockets (clone and destroy elements, tweens, tickers)

// [Run code](../../demo/dom-004.html)
import scrawl from '../source/scrawl.js'


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
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        let t = Object.keys(library.tween),
            a = Object.keys(artefact),
            n = Object.keys(library.animation),
            k = Object.keys(library.animationtickers),
            e = Object.keys(library.element);

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
tween - ${t.length}, ${library.tweennames.length}: ${t.join(', ')}
artefact - ${a.length}, ${library.artefactnames.length}: ${a.join(', ')}
element - ${e.length}, ${library.elementnames.length}: ${e.join(', ')}
tickers - ${k.length}, ${library.animationtickersnames.length}: ${k.join(', ')}
animation - ${n.length}, ${library.animationnames.length}: ${n.join(', ')}`;
    };
}();


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

// To test kill functionality
let killTicker = (name, time) => {

    let packet;

    setTimeout(() => {

        console.log(`${name} alive
    removed from tickers: ${(scrawl.library.animationtickers[name]) ? 'no' : 'yes'}`);

        packet = scrawl.library.animationtickers[name].saveAsPacket();

        scrawl.library.animationtickers[name].kill();

        setTimeout(() => {

            console.log(`${name} killed
    removed from tickers: ${(scrawl.library.animationtickers[name]) ? 'no' : 'yes'}`);

            stack.actionPacket(packet);

            setTimeout(() => {

                console.log(`${name} resurrected
    removed from tickers: ${(scrawl.library.animationtickers[name]) ? 'no' : 'yes'}`);
            }, 100);
        }, 100);
    }, time);
};

killTicker('template_ticker', 4000);
