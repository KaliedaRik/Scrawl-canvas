import scrawl from '../source/scrawl.js';


// Function to display frames-per-second data, and other information relevant to the demo
const reportSpeed = function (output = '', xtra = false) {

    if (!output) return function () {};

    let testTicker = Date.now(),
        testTime, testNow, dragging,
        testMessage = document.querySelector(output);

    return function () {

        testNow = Date.now();

        if (testNow - testTicker > 2) {

            testTime = testNow - testTicker;
            testTicker = testNow;

            let text = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;

            if (xtra) {

                text += `
${xtra()}`;
            }

            testMessage.textContent = text;
        }
    };
};


// Test to check that artefacts are properly killed and resurrected
const killArtefact = (canvas, name, time, finishResurrection) => {

    if (canvas && canvas.base && name && time) {

        let groupname = canvas.base.name,
            packet;

        let checkGroupBucket = (name, groupname) => {

            let res = scrawl.library.group[groupname].artefactBuckets.filter(e => e.name === name );
            return (res.length) ? 'no' : 'yes';
        };

        setTimeout(() => {

            console.log(`${name} alive
        removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
        removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
        removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

            packet = scrawl.library.artefact[name].saveAsPacket();

            scrawl.library.artefact[name].kill();

            setTimeout(() => {

                console.log(`${name} killed
        removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
        removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
        removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

                canvas.actionPacket(packet);

                setTimeout(() => {

                    console.log(`${name} resurrected
        removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
        removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
        removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
        removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

                    if (finishResurrection) finishResurrection();

                }, 100);
            }, 100);
        }, time);
    }
    else console.log('killArtefact test invoked improperly');
};


// To test styles (Gradient) kill functionality
const killStyle = (canvas, name, time, finishResurrection) => {

    if (canvas && canvas.base && name && time) {

        let packet;

        setTimeout(() => {

            console.log(`${name} alive
        removed from styles: ${(scrawl.library.styles[name]) ? 'no' : 'yes'}
        removed from stylesnames: ${(scrawl.library.stylesnames.indexOf(name) >= 0) ? 'no' : 'yes'}`);

            packet = scrawl.library.styles[name].saveAsPacket();

            scrawl.library.styles[name].kill();

            setTimeout(() => {

                console.log(`${name} killed
        removed from styles: ${(scrawl.library.styles[name]) ? 'no' : 'yes'}
        removed from stylesnames: ${(scrawl.library.stylesnames.indexOf(name) >= 0) ? 'no' : 'yes'}`);

                canvas.actionPacket(packet);

                setTimeout(() => {

                    console.log(`${name} resurrected
        removed from styles: ${(scrawl.library.styles[name]) ? 'no' : 'yes'}
        removed from stylesnames: ${(scrawl.library.stylesnames.indexOf(name) >= 0) ? 'no' : 'yes'}`);

                    finishResurrection();

                }, 100);
            }, 100);
        }, time);
    }
    else console.log('killStyle test invoked improperly');
};

// To test artefact + anchor kill functionality
const killArtefactAndAnchor = (canvas, name, anchorname, time, finishResurrection) => {

    let groupname = 'mycanvas_base',
        packet;

    let checkGroupBucket = (name, groupname) => {

        let res = scrawl.library.group[groupname].artefactBuckets.filter(e => e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    setTimeout(() => {

        console.log(`${name} alive
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}
    anchor removed: ${(scrawl.library.anchor[anchorname]) ? 'no' : 'yes'}`);

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
    anchor removed: ${(scrawl.library.anchor[anchorname]) ? 'no' : 'yes'}`);

            canvas.actionPacket(packet);

            setTimeout(() => {

                console.log(`${name} resurrected
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}
    anchor removed: ${(scrawl.library.anchor[anchorname]) ? 'no' : 'yes'}`);

                finishResurrection();

            }, 100);
        }, 100);
    }, time);
};

// To test Polyline artefact kill functionality
const killPolylineArtefact = (canvas, name, time, myline, restore) => {

    let groupname = 'mycanvas_base',
        packet;

    let checkGroupBucket = (name, groupname) => {

        let res = scrawl.library.group[groupname].artefactBuckets.filter(e => e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    let checkPinsArray = (name) => {

        if (myline.pins.indexOf(name) >= 0) return 'no';

        let res = myline.pins.filter(e => e && e.name === name );
        return (res.length) ? 'no' : 'yes';
    };

    setTimeout(() => {

        console.log(`${name} alive
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

        packet = scrawl.library.artefact[name].saveAsPacket();

        scrawl.library.artefact[name].kill();

        setTimeout(() => {

            console.log(`${name} killed
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

            canvas.actionPacket(packet);

            setTimeout(() => {

                if (restore) restore();

                console.log(`${name} resurrected
    removed from artefact: ${(scrawl.library.artefact[name]) ? 'no' : 'yes'}
    removed from artefactnames: ${(scrawl.library.artefactnames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from entity: ${(scrawl.library.entity[name]) ? 'no' : 'yes'}
    removed from entitynames: ${(scrawl.library.entitynames.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from polyline pins array: ${checkPinsArray(name)}
    removed from group.artefacts: ${(scrawl.library.group[groupname].artefacts.indexOf(name) >= 0) ? 'no' : 'yes'}
    removed from group.artefactBuckets: ${checkGroupBucket(name, groupname)}`);

                console.log(myline.saveAsPacket());

            }, 500);
        }, 500);
    }, time);
};

const killTicker = (stack, name, time) => {

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

const addImageDragAndDrop = (canvas, selector, targets, callback) => {

    // #### Drag-and-Drop image loading functionality
    const store = document.querySelector(selector);
    const timeoutDelay = 200;

    let counter = 0;

    if (!Array.isArray(targets)) targets = [targets];

    scrawl.addNativeListener(['dragenter', 'dragover', 'dragleave'], (e) => {

        e.preventDefault();
        e.stopPropagation();

    }, canvas.domElement);

    scrawl.addNativeListener('drop', (e) => {

        e.preventDefault();
        e.stopPropagation();

        const dt = e.dataTransfer;

        if (dt) [...dt.files].forEach(addImageAsset);

    }, canvas.domElement);

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
                img.src = reader.result;
                img.id = name;
                store.appendChild(img);

                scrawl.importDomImage(`#${name}`);

                // Update our Picture entity's asset attribute so it displays the new image
                targets.forEach(target => {

                    target.set({
                        asset: name,
                    });
                });

                // HOW TO: set the Picture entity's copy dimensions to take into account any difference between the old and new image's dimensions
                // + Because of asynch stuff, we need to wait for stuff to complete before performing this functionality
                // + The Picture entity copies (for the sake of our sanity) a square part of the image. Thus we shall use the new image's shorter dimension as the copy dimension and offset the longer copy start so we are viewing the middle of it
                setTimeout(() => {

                    const asset = scrawl.library.asset[name];

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

                        target.set({
                            copyStartX,
                            copyStartY,
                            copyWidth: dim,
                            copyHeight: dim,
                        });
                    })

                    if (callback) setTimeout(callback, timeoutDelay);
                }, timeoutDelay);
            }
        }
    };
};

export {
    reportSpeed,

    killArtefact,
    killArtefactAndAnchor,
    killPolylineArtefact,
    killStyle,
    killTicker,

    addImageDragAndDrop,
}
