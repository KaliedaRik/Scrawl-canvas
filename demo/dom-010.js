// # Demo DOM 010
// Add and remove (kill) Scrawl-canvas stack elements programmatically

// [Run code](../../demo/dom-010.html)
import * as scrawl from '../source/scrawl.js'


// #### Scene setup
// None for this demo

// #### Scene animation
// Animation loop - can't use `scrawl.makeRender` in this case because there's no initial stack/canvas arterfact to render. Using `scrawl.makeAnimation` which in turn runs `scrawl.render` instead
scrawl.makeAnimation({

    name: 'demo-animation',
    fn: function () {scrawl.render()},
});


// #### User interaction
// Buttons listener - the control buttons are never part of a Scrawl-canvas stack
const controls = function () {

    const b1 = document.querySelector('#action_1'),
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
    b4.disabled = 'disabled';

    let newStack, hostStack;

    return function (e) {

        e.preventDefault();
        e.returnValue = false;

        switch (e.target.id) {

            case 'action_1':
// @ts-expect-error
                b1.disabled = 'disabled';
// @ts-expect-error
                b2.disabled = '';

                newStack = scrawl.addStack({
                    host: '#target',
                    name: 'my-new-stack',
                    width: 300,
                    height: 50,
                });

                break;

            case 'action_2':

// @ts-expect-error
                b1.disabled = '';
// @ts-expect-error
                b2.disabled = 'disabled';

                newStack.kill();

                break;

            case 'action_3':

// @ts-expect-error
                b3.disabled = 'disabled';
// @ts-expect-error
                b4.disabled = '';

                hostStack = scrawl.addStack({
                    element: '#target',
                });

                break;

            case 'action_4':

// @ts-expect-error
                if (b1.disabled) {

// @ts-expect-error
                    b1.disabled = '';
// @ts-expect-error
                    b2.disabled = 'disabled';
                }

// @ts-expect-error
                b3.disabled = 'disabled';
// @ts-expect-error
                b4.disabled = 'disabled';

                hostStack.kill();

                break;
        }
    };
}();

scrawl.addListener('up', controls, '.control_button');

// #### Development and testing
console.log(scrawl.library);
