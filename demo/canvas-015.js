// # Demo Canvas 015 
// Phrase entity (make, clone, method, multiline)

// [Run code](../../demo/canvas-015.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
    backgroundColor: 'aliceblue',
    css: {
        border: '1px solid black'
    }
});


// Create and clone Phrase entitys
scrawl.makePhrase({
    name: 'myphrase_fill',

    text: 'H&epsilon;lj&ouml;!',
    font: 'bold 40px Garamond, serif',

    width: 120,
    startX: '14%',
    startY: '28%',
    handleX: 'center',
    handleY: 'center',

    justify: 'center',
    lineHeight: 1,

    fillStyle: 'green',
    strokeStyle: 'gold',

    lineWidth: 2,
    lineJoin: 'round',
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 2,
    shadowColor: 'black',

    showBoundingBox: true,
    boundingBoxColor: 'red',

    textBaseline: 'bottom',

    exposeText: true,

}).clone({
    name: 'myphrase_draw',
    startX: '38%',
    method: 'draw',

}).clone({
    name: 'myphrase_drawAndFill',
    startX: '84%',
    method: 'drawAndFill',

}).clone({
    name: 'myphrase_fillAndDraw',
    startX: '62%',
    method: 'fillAndDraw',
    sharedState: true

}).clone({
    name: 'myphrase_drawThenFill',
    startX: '14%',
    startY: '67%',
    method: 'drawThenFill'

}).clone({
    name: 'myphrase_fillThenDraw',
    startX: '38%',
    method: 'fillThenDraw',

}).clone({
    name: 'myphrase_clear',
    startX: '62%',
    method: 'clear'

}).clone({
    name: 'myphrase_multiline',

    text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',

    size: '12px',
    weight: 'normal',

    startX: '84%',
    method: 'fill',

    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
});


// Change the fill and stroke styles on one of the phrase entitys, and any entity sharing that phrase's state
scrawl.library.artefact.myphrase_fillAndDraw.set({
    fillStyle: 'blue',
    strokeStyle: 'coral'
});


// #### User interaction
// Create the drag-and-drop zone
let current = scrawl.makeDragZone({

    zone: canvas,
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
});


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        dragging = current();

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
Currently dragging: ${(dragging) ? dragging.artefact.name : 'nothing'}`;
    };
}();


// Create the Display cycle animation
scrawl.makeRender({

    name: 'demo-animation',
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);

// To test kill functionality
let killArtefact = (name, time) => {

    let groupname = 'mycanvas_base',
        packet;

    let checkGroupBucket = (name, groupname) => {

        let res = scrawl.library.group[groupname].artefactBuckets.filter(e => e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    let checkTextHold = (name) => {

        let el = document.querySelector(`#${name}-text-hold`);
        return (el) ? 'no' : 'yes';
    };

    setTimeout(() => {

        console.log(`${name} alive
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}
    text hold removed from DOM: ${checkTextHold(name)}`);

        packet = scrawl.library.artefact[name].saveAsPacket();

        scrawl.library.artefact[name].kill();

        setTimeout(() => {

            console.log(`${name} killed
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}
    text hold removed from DOM: ${checkTextHold(name)}`);

            canvas.actionPacket(packet);

            setTimeout(() => {

                console.log(`${name} resurrected
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}
    text hold removed from DOM: ${checkTextHold(name)}`);
            }, 100);
        }, 100);
    }, time);
};

killArtefact('myphrase_fill', 4000);
killArtefact('myphrase_fillAndDraw', 5000);
killArtefact('myphrase_multiline', 6000);
