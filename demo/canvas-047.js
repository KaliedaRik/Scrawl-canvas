// # Demo Canvas 047
// Easing functions for Color and Tween factories

// [Run code](../../demo/canvas-047.html)
import * as scrawl from '../source/scrawl.js';

import { reportSpeed } from './utilities.js';

// #### Scene setup
const canvas = scrawl.library.canvas.mycanvas;


const easingDisplayComponent = function (name, ypos) {

    const color = scrawl.makeColor({
        name: `${name}-color`,
        easing: name,
        minimumColor: 'red',
        maximumColor: 'green',
    });

    scrawl.makeLine({
        name: `${name}-line`,
        startX: 122,
        startY: ypos + 12,
        endX: 752,
        endY: ypos + 12,
        method: 'draw',
    });

    const wheel = scrawl.makeWheel({
        name: `${name}-wheel`,
        radius: 12,
        startX: 110,
        startY: ypos,
        method: 'fill',
        fillStyle: color.getRangeColor(0),
    });

    scrawl.makePhrase({
        name: `${name}-label`,
        text: name,
        accessibleText: 'Example of §',
        startX: 10,
        startY: ypos + 6,
    });

    scrawl.makeTween({
        name: `${name}-move-tween`,
        targets: wheel,
        duration: 8000,
        cycles: 0,
        reverseOnCycleEnd: true,
        definitions: [
            {
                attribute: 'startX',
                start: 110,
                end: 740,
                engine: name,
            },
        ],
    }).run();

    scrawl.makeTween({
        name: `${name}-color-tween`,
        targets: wheel,
        duration: 8000,
        cycles: 0,
        reverseOnCycleEnd: true,
        definitions: [
            {
                attribute: 'fillStyle',
                start: 0,
                end: 1,
                engine: function (start, change, position) { return color.getRangeColor(position) },
            },
        ],
    }).run();
};

const easings = ['linear', 'out', 'easeOut', 'easeOut3', 'easeOut4', 'easeOut5', 'easeOutSine', 'easeOutQuad', 'easeOutCubic', 'easeOutQuart', 'easeOutQuint', 'easeOutExpo', 'easeOutCirc', 'easeOutBack', 'easeOutElastic', 'easeOutBounce', 'in', 'easeIn', 'easeIn3', 'easeIn4', 'easeIn5', 'easeInSine', 'easeInQuad', 'easeInCubic', 'easeInQuart', 'easeInQuint', 'easeInExpo', 'easeInCirc', 'easeInBack', 'easeInElastic', 'easeInBounce', 'easeOutIn', 'easeOutIn3', 'easeOutIn4', 'easeOutIn5', 'easeOutInSine', 'easeOutInQuad', 'easeOutInCubic', 'easeOutInQuart', 'easeOutInQuint', 'easeOutInExpo', 'easeOutInCirc', 'easeOutInBack', 'easeOutInElastic', 'easeOutInBounce', 'easeInOut', 'easeInOut3', 'easeInOut4', 'easeInOut5', 'none', 'nOnSeNsE', 'cosine', 'hermite', 'quintic'];

easings.forEach((easing, index) => easingDisplayComponent(easing, 50 + (index * 30)));


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Display cycle animation
scrawl.makeRender({

    name: "demo-animation",
    target: canvas,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
