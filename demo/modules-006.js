// # Demo Modules 006
// Animation observer; Scrollytelling

// Related files:
// + [First canvas module](./modules/demo-m006-c1.html)
// + [Second canvas module](./modules/demo-m006-c2.html)
// + [Third canvas module](./modules/demo-m006-c3.html)
// + [Fourth canvas module](./modules/demo-m006-c4.html)
// + [Demo utilities helper module](./modules/demo-m006-utils.html)
//
// [Run code](../../demo/modules-006.html)
import * as scrawl from '../source/scrawl.js';


// Fix CSS styling - defaults to no JS display which needs to be updated
document.querySelector('body').classList.add('javascript-enabled');


// Namespace boilerplate
const namespace = 'demo57'
const name = item => `${namespace}-${item}`;


// #### Scene setup
const {
    'st-1-canvas': canvas1,
    'st-2-canvas': canvas2,
    'st-3-canvas': canvas3,
    'st-4-canvas': canvas4,
} = scrawl.library.canvas;


// #### Infographic canvas 1
import initCanvas1 from './modules/demo-m006-c1.js';

const canvas1api = initCanvas1({
    canvas: canvas1,
    namespace: name('st-1-observer'),
    scrawl,
});


// #### Infographic canvas 2
import initCanvas2 from './modules/demo-m006-c2.js';

const canvas2api = initCanvas2({
    canvas: canvas2,
    namespace: name('st-2'),
    scrawl,
});


// #### Infographic canvas 3
import initCanvas3 from './modules/demo-m006-c3.js';

const canvas3api = initCanvas3({
    canvas: canvas3,
    namespace: name('st-3'),
    scrawl,
});


// #### Infographic canvas 4
import initCanvas4 from './modules/demo-m006-c4.js';

const canvas4api = initCanvas4({
    canvas: canvas4,
    namespace: name('st-4'),
    scrawl,
});


// #### Report animation
import { reportSpeed } from './utilities.js';

const report = reportSpeed('#reportmessage', function () {

    const running = [];

    if (canvas1api.animation.isRunning()) running.push('st-1-canvas');
    if (canvas2api.animation.isRunning()) running.push('st-2-canvas');
    if (canvas3api.animation.isRunning()) running.push('st-3-canvas');
    if (canvas4api.animation.isRunning()) running.push('st-4-canvas');

    if (running.length) return `Running animations: ${running.join('; ')}`;
    return 'Running animations: none';
});

scrawl.makeRender({
    name: name('animation'),
    noTarget: true,
    afterShow: report,
});


// #### Developing
console.log(scrawl.library);
