// TODO: write up purpose of module



import { loader } from './demo-m006-utils.js';

export default function (items) {

    // #### Proceed checks
    let { canvas, namespace, scrawl } = items;

    if (!(canvas && namespace && scrawl)) return {
        animation: null,
        kill: () => {},
    }


    // #### Boilerplate
    const name = item => `${namespace}-${item}`;

    const assets = loader(canvas, scrawl);
    console.log(namespace, assets);


    // #### Scene
    canvas.setAsCurrentCanvas();


    // #### Animation
    const animation = scrawl.makeRender({
        name: name('animation'),
        target: canvas,
        observer: true,
    });


    // Return object
    return {
        animation,
        kill: () => scrawl.library.purge(namespace),
    };
};
