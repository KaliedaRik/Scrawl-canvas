// # Demo DOM 010
// Add and remove (kill) Scrawl-canvas stack elements programmatically

// [Run code](../../demo/dom-010.html)
import scrawl from '../source/scrawl.js'


// #### Scene setup
let library = scrawl.library;


// #### Scene animation
// Function that updates the live report on user activity
let report = function () {

    let testTicker = Date.now(),
        testTime, testNow, text,
        testMessage = document.querySelector('#reportmessage');

    let artefactnames = library.artefactnames,
        stacknames = library.stacknames,
        elementnames = library.elementnames,
        artefact = library.artefact,
        stack = library.stack,
        element = library.element;

    let a, s, el;

    return function () {

        a = Object.keys(artefact);
        s = Object.keys(stack);
        el = Object.keys(element);

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
artefact - ${a.length}, ${artefactnames.length}: [${(artefactnames).join(', ')}] 
stack - ${s.length}, ${stacknames.length}: [${(stacknames).join(', ')}] 
element - ${el.length}, ${elementnames.length}: [${(elementnames).join(', ')}]`;
    };
}();


// Animation loop - can't use `scrawl.makeRender` in this case because there's no initial stack/canvas arterfact to render. Using `scrawl.makeAnimation` which in turn runs `scrawl.render` instead
scrawl.makeAnimation({

    name: 'demo-animation',
    fn: function () {scrawl.render()},
});


// #### User interaction
// Buttons listener - the control buttons are never part of a Scrawl-canvas stack
let controls = function () {

    let b1 = document.querySelector('#action_1'),
        b2 = document.querySelector('#action_2'),
        b3 = document.querySelector('#action_3'),
        b4 = document.querySelector('#action_4');

    b1.disabled = '';
    b2.disabled = 'disabled';
    b3.disabled = '';
    b4.disabled = 'disabled';

    let newStack, hostStack;

    return function (e) {

        e.preventDefault();
        e.returnValue = false;
        
        switch (e.target.id) {

            case 'action_1':
                b1.disabled = 'disabled';
                b2.disabled = '';

                newStack = scrawl.addStack({
                    host: '#target',
                    name: 'my-new-stack',
                    width: 300,
                    height: 50,
                });

                break;

            case 'action_2':

                b1.disabled = '';
                b2.disabled = 'disabled';

                newStack.kill();

                break;

            case 'action_3':

                b3.disabled = 'disabled';
                b4.disabled = '';

                hostStack = scrawl.addStack({
                    element: '#target',
                });

                break;
                
            case 'action_4':

                if (b1.disabled) {

                    b1.disabled = '';
                    b2.disabled = 'disabled';
                }

                b3.disabled = 'disabled';
                b4.disabled = 'disabled';
                
                hostStack.kill();

                break;
        }
    };
}();

scrawl.addListener('up', controls, '.control_button');

// #### Development and testing
console.log(scrawl.library);
