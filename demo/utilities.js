import * as scrawl from '../source/scrawl.js';
const L = scrawl.library;

// Function to display frames-per-second data, and other information relevant to the demo
const reportSpeed = function (output = '', xtra = () => '') {

    if (!output) return function () {};

        const testMessage = document.querySelector(output),
            history = []

        let testTicker = Date.now(),
            testTime, testNow,
            averageTime = 0;

        const addTime = (t) => {

            if (history.length > 60) history.shift();
            history.push(t);
            averageTime = history.reduce((p, c) => p + c, 0);
            averageTime /= history.length;
        }


    return function () {

        testNow = Date.now();

        testTime = testNow - testTicker;
        testTicker = testNow;

        addTime(testTime);

        let text = `Screen refresh: ${Math.ceil(averageTime)}ms; fps: ${Math.floor(1000 / averageTime)}`;

        if (xtra) {

            text += `
${xtra()}`;
        }

        testMessage.textContent = text;
    };
};


// Get a full, dynamic report on the Scrawl-canvas library's current contents
const reportFullLibrary = (scrawl) => {

    const {
        anchor, anchornames,
        animation, animationnames,
        animationtickers, animationtickersnames,
        artefact, artefactnames,
        asset, assetnames,
        canvas, canvasnames,
        cell, cellnames,
        element, elementnames,
        entity, entitynames,
        filter, filternames,
        force, forcenames,
        group, groupnames,
        particle, particlenames,
        spring, springnames,
        stack, stacknames,
        styles, stylesnames,
        tween, tweennames,
        unstackedelement, unstackedelementnames,
        world, worldnames,
    } = scrawl.library;

    const compareObjectToArray = (obj, arr) => {

        const keys = Object.keys(obj);

        if (keys.length !== arr.length) return false;

        return keys.every(k => arr.includes(k));
    };

    const getSectionOutput = (label, obj, arr) => {

        if ('animation' === label) {
            let t = `${label}: ${arr.length} (${compareObjectToArray(obj, arr)})`;
            for (const [key, value] of Object.entries(obj)) {
                t += `\n    ${key} - ${value.isRunning() ? 'running' : 'halted'}`;
            }
            return t;
        }

        if ('animationtickers' === label) {
            let t = `${label}: ${arr.length} (${compareObjectToArray(obj, arr)})`;
            for (const [key, value] of Object.entries(obj)) {
                t += `\n    ${key} - ${value.isRunning() && value.checkObserverRunningState() ? 'running' : 'halted'}`;
            }
            return t;
        }

        return `${label}: ${arr.length} (${compareObjectToArray(obj, arr)}) - ${arr.join(', ')}`;
    };
    return `
${getSectionOutput('anchor', anchor, anchornames)}
${getSectionOutput('animation', animation, animationnames)}
${getSectionOutput('animationtickers', animationtickers, animationtickersnames)}
${getSectionOutput('artefact', artefact, artefactnames)}
${getSectionOutput('asset', asset, assetnames)}
${getSectionOutput('canvas', canvas, canvasnames)}
${getSectionOutput('cell', cell, cellnames)}
${getSectionOutput('element', element, elementnames)}
${getSectionOutput('entity', entity, entitynames)}
${getSectionOutput('filter', filter, filternames)}
${getSectionOutput('force', force, forcenames)}
${getSectionOutput('group', group, groupnames)}
${getSectionOutput('particle', particle, particlenames)}
${getSectionOutput('spring', spring, springnames)}
${getSectionOutput('stack', stack, stacknames)}
${getSectionOutput('styles', styles, stylesnames)}
${getSectionOutput('tween', tween, tweennames)}
${getSectionOutput('unstackedelement', unstackedelement, unstackedelementnames)}
${getSectionOutput('world', world, worldnames)}
    `;
}


// Test to check that artefacts are properly killed and resurrected
const killArtefact = (canvas, name, time, finishResurrection = () => {}) => {

    if (canvas && canvas.base && name && time) {

        const groupname = canvas.base.name;

        let res, packet;

        const checkGroupBucket = (name, groupname) => {

            res = L.group[groupname].artefactCalculateBuckets.filter(e => e.name === name );
            return (res.length) ? 'no' : 'yes';
        };

        setTimeout(() => {

            console.log(`${name} alive
        removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
        removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
        removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}`);

            packet = L.artefact[name].saveAsPacket();

            L.artefact[name].kill();

            setTimeout(() => {

                console.log(`${name} killed
        removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
        removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
        removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}`);

                canvas.actionPacket(packet);

                setTimeout(() => {

                    console.log(`${name} resurrected
        removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
        removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
        removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}`);

                    if (finishResurrection) finishResurrection();

                }, 100);
            }, 100);
        }, time);
    }
    else console.log('killArtefact test invoked improperly');
};


// To test styles (Gradient) kill functionality
const killStyle = (canvas, name, time, finishResurrection = () => {}) => {

    if (canvas && canvas.base && name && time) {

        let packet;

        setTimeout(() => {

            console.log(`${name} alive
        removed from styles: ${(L.styles[name]) ? 'no' : 'yes'}
        removed from stylesnames: ${(L.stylesnames.indexOf(name) >= 0) ? 'no' : 'yes'}`);

            packet = L.styles[name].saveAsPacket();

            L.styles[name].kill();

            setTimeout(() => {

                console.log(`${name} killed
        removed from styles: ${(L.styles[name]) ? 'no' : 'yes'}
        removed from stylesnames: ${(L.stylesnames.indexOf(name) >= 0) ? 'no' : 'yes'}`);

                canvas.actionPacket(packet);

                setTimeout(() => {

                    console.log(`${name} resurrected
        removed from styles: ${(L.styles[name]) ? 'no' : 'yes'}
        removed from stylesnames: ${(L.stylesnames.indexOf(name) >= 0) ? 'no' : 'yes'}`);

                    finishResurrection();

                }, 100);
            }, 100);
        }, time);
    }
    else console.log('killStyle test invoked improperly');
};

// To test artefact + anchor kill functionality
const killArtefactAndAnchor = (canvas, name, anchorname, time, finishResurrection = () => {}) => {

    const groupname = 'mycanvas_base';

    let packet, res;

    const checkGroupBucket = (name, groupname) => {

        res = L.group[groupname].artefactCalculateBuckets.filter(e => e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    setTimeout(() => {

        console.log(`${name} alive
    removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}
    anchor removed: ${(L.anchor[anchorname]) ? 'no' : 'yes'}`);

        packet = L.artefact[name].saveAsPacket();

        L.artefact[name].kill();

        setTimeout(() => {

            console.log(`${name} killed
    removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}
    anchor removed: ${(L.anchor[anchorname]) ? 'no' : 'yes'}`);

            canvas.actionPacket(packet);

            setTimeout(() => {

                console.log(`${name} resurrected
    removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}
    anchor removed: ${(L.anchor[anchorname]) ? 'no' : 'yes'}`);

                finishResurrection();

            }, 100);
        }, 100);
    }, time);
};

// To test Polyline artefact kill functionality
const killPolylineArtefact = (canvas, name, time, myline, restore = () => {}) => {

    const groupname = 'mycanvas_base';

    let packet, res;

    const checkGroupBucket = (name, groupname) => {

        res = L.group[groupname].artefactCalculateBuckets.filter(e => e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    const checkPinsArray = (name) => {

        if (myline.pins.indexOf(name) >= 0) return 'no';

        res = myline.pins.filter(e => e && e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    setTimeout(() => {

        console.log(`${name} alive
    removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}`);

        packet = L.artefact[name].saveAsPacket();

        L.artefact[name].kill();

        setTimeout(() => {

            console.log(`${name} killed
    removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}`);

            canvas.actionPacket(packet);

            setTimeout(() => {

                if (restore) restore();

                console.log(`${name} resurrected
    removed from artefact: ${(L.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(L.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(L.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(L.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(L.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactCalculateBuckets: ${checkGroupBucket(name, groupname)}`);

                console.log(myline.saveAsPacket());

            }, 500);
        }, 500);
    }, time);
};

const killTicker = (stack, name, time) => {

    let packet;

    setTimeout(() => {

        console.log(`${name} alive
    removed from tickers: ${(L.animationtickers[name]) ? 'no' : 'yes'}`);

        packet = L.animationtickers[name].saveAsPacket();

        L.animationtickers[name].kill();

        setTimeout(() => {

            console.log(`${name} killed
    removed from tickers: ${(L.animationtickers[name]) ? 'no' : 'yes'}`);

            stack.actionPacket(packet);

            setTimeout(() => {

                console.log(`${name} resurrected
    removed from tickers: ${(L.animationtickers[name]) ? 'no' : 'yes'}`);
            }, 100);
        }, 100);
    }, time);
};

const addImageDragAndDrop = (canvas, selector, targets, callback = () => {}) => {

    // #### Drag-and-Drop image loading functionality
    const store = document.querySelector(selector);
    const timeoutDelay = 200;

    let counter = 0;

    const wrappers = [];
    if (Array.isArray(canvas)) wrappers.push(...canvas);
    else wrappers.push(canvas);

    if (!Array.isArray(targets)) targets = [targets];

    scrawl.addNativeListener(['dragenter', 'dragover', 'dragleave'], (e) => {

        e.preventDefault();
        e.stopPropagation();

    }, wrappers.map(w => w.domElement));

    scrawl.addNativeListener('drop', (e) => {

        e.preventDefault();
        e.stopPropagation();

        const dt = e.dataTransfer;

        if (dt) [...dt.files].forEach(addImageAsset);

    }, wrappers.map(w => w.domElement));

    const addImageAsset = (file) => {

        if (file.type.indexOf('image/') === 0) {

            const reader = new FileReader();

            reader.readAsDataURL(file);

            reader.onloadend = function() {

                // Create a name for our new asset
                const name = `user-upload-${counter}`;
                counter++;

                // Add the image to the DOM and create our asset from it
                const img = document.createElement('img');

                // @ts-expect-error
                img.src = reader.result;
                img.id = name;
                store.appendChild(img);

                scrawl.importDomImage(`#${name}`);

                // Update our Picture entity's asset attribute so it displays the new image
                targets.forEach(target => {

                    if (target.type === 'Group') {

                        target.setArtefacts({
                            asset: name,
                        });
                    }
                    else {

                        target.set({
                            asset: name,
                        });
                    }
                });

                // HOW TO: set the Picture entity's copy dimensions to take into account any difference between the old and new image's dimensions
                // + Because of asynch stuff, we need to wait for stuff to complete before performing this functionality
                // + The Picture entity copies (for the sake of our sanity) a square part of the image. Thus we shall use the new image's shorter dimension as the copy dimension and offset the longer copy start so we are viewing the middle of it
                setTimeout(() => {

                    const asset = L.asset[name];

                    const width = asset.get('width'),
                        height = asset.get('height');

                    let copyStartX = 0,
                        copyStartY = 0,
                        dim = 0;

                    if (width > height) {

                        copyStartX = (width - height) / 2;
                        dim = height;
                    }
                    else {

                        copyStartY = (height - width) / 2;
                        dim = width;
                    }

                    targets.forEach(target => {

                        if (target.type === 'Group') {

                            target.setArtefacts({
                                copyStartX,
                                copyStartY,
                                copyWidth: dim,
                                copyHeight: dim,
                            });
                        }
                        else {

                            target.set({
                                copyStartX,
                                copyStartY,
                                copyWidth: dim,
                                copyHeight: dim,
                            });
                        }
                    })

                    if (callback) setTimeout(callback, timeoutDelay);
                }, timeoutDelay);
            }
        }
    };
};

const addCheckerboardBackground = (canvas, namespace) => {

    // Namespace boilerplate
    const name = (item) => `${namespace}-${item}`;

    // Create the background
    const checkerboard = canvas.buildCell({
        name: name('checkerboard-background-cell'),
        dimensions: [16, 16],
        backgroundColor: '#999',
        cleared: false,
        compiled: false,
        shown: false,
        useAsPattern: true,
    });

    scrawl.makeBlock({
        name: name('checkerboard-background-block-1'),
        group: name('checkerboard-background-cell'),
        dimensions: ['50%', '50%'],
        fillStyle: '#bbb',
    }).clone({
        name: name('checkerboard-background-block-2'),
        start: ['50%', '50%'],
    });

    checkerboard.clear();
    checkerboard.compile();

    scrawl.makeBlock({
        name: name('checkerboard-background'),
        group: canvas.get('baseName'),
        dimensions: ['100%', '100%'],
        fillStyle: name('checkerboard-background-cell'),
    });
};

export {
    reportSpeed,
    reportFullLibrary,

    killArtefact,
    killArtefactAndAnchor,
    killPolylineArtefact,
    killStyle,
    killTicker,

    addCheckerboardBackground,
    addImageDragAndDrop,
}
