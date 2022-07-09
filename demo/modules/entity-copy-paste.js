// # Demo Modules 005
// Accessible GUI-based simple canvas editor
//
// Related files:
// + [Accessible GUI-based simple canvas editor - main demo](../modules-005.html)
//


// #### Usage
// TODO: add documentation

const initializeEntityCopyPaste = (items = {}, scrawl) => {

    // Check we have required arguments/values
    const { 
        canvas, 
        selectedEntitys, 
        addControllerAttributes, 
        updateControllerDisplay, 
        dashboard,
        createGui,
    } = items;

    if (scrawl == null) throw new Error('SC entity manipulation GUI module error: missing Scrawl-canvas object argument');

    let argsCheck = '';

    if (canvas == null) argsCheck += ' Canvas wrapper;';
    if (selectedEntitys == null) argsCheck += ' - Selected entitys group';
    if (addControllerAttributes == null) argsCheck += ' - Entity controller attributes';
    if (updateControllerDisplay == null) argsCheck += ' - Controllers display functions';
    if (dashboard == null) argsCheck += ' - DOM entity editor dashboard functionality';
    if (createGui == null) argsCheck += ' - Create GUI function';

    if (argsCheck.length) throw new Error(`SC entity manipulation GUI module error: missing arguments${argsCheck}`);


    // Packet-related code
    // + Copying (and deleting) entitys generates SC packets (stringified JSON) which we can then in the browser's Navigator clipboard
    // + These packets can then be added/restored onto the canvas by reading the clipboard and actioning the results on the Canvas wrapper
    // + There's unsolved issues around entity function attributes which will currently fail (because: scope), hence the need to reinstall those functions on the newly generated entity objects
    const entityGroupGetPackets = () => {

        const packets = [];

        selectedEntitys.artefacts.forEach(name => {

            let packet = selectedEntitys.getArtefact(name).saveAsPacket();
            packet = packet.replaceAll(name, `${name}-copy`);
            packets.push(packet);
        });
        return JSON.stringify(packets);
    };

    const entityGroupCopy = () => {

        return new Promise ((resolve, reject) => {

            const packetsString = entityGroupGetPackets();

            navigator.clipboard.writeText(packetsString)
            .then(res => resolve(packetsString))
            .catch(e => {

                console.log('entityGroupCopy error', e.message);
                reject(e);
            });
        })
    };

    const entityGroupPaste = () => {

        navigator.clipboard.readText()
        .then(res => {

            const packets = JSON.parse(res);

            selectedEntitys.clearArtefacts();

            packets.forEach(packet => {

                const entity = canvas.actionPacket(packet);

                entity.set({
                    ...addControllerAttributes,
                });

                selectedEntitys.addArtefacts(entity);
            });

            updateControllerDisplay.onEnd();
            dashboard.refresh(selectedEntitys);
            setTimeout(() => createGui(), 10);
        })
        .catch(e => console.log('entityGroupPaste error', e.message));
    };

    const entityGroupDelete = () => {

        entityGroupCopy()
        .then(res => {

            selectedEntitys.killArtefacts();
            updateControllerDisplay.onEnd();
            dashboard.refresh(selectedEntitys);
        })
        .catch(e => console.log('entityGroupDelete error', e.message));
    };

    // Keyboard event listener functions
    // + Using the standard `CTRL+C`, `CTRL+V`, `CTRL+X` keyboard shortcuts as these are well understood UX for end users
    const extraKeys = {
        ctrlKey: false,
    };

    const copyPasteKeysDown = (e) => {

        const { key } = e;

        // Tab, Enter/Return, Esc
        if ('Tab' === key || 'Escape' === key) {
            canvas.domElement.blur();
            return;
        }

        if ('Control' === key) extraKeys.ctrlKey = true;

        if (extraKeys.ctrlKey) {

            if ('c' === key) entityGroupCopy();
            else if ('v' === key) entityGroupPaste();
            else if ('x' === key) entityGroupDelete();
        }
        e.preventDefault();
    }
    scrawl.addNativeListener('keydown', copyPasteKeysDown, canvas.domElement);

    const copyPasteKeysUp = (e) => {

        const { key } = e;

        if ('Control' === key) extraKeys.ctrlKey = false;

        e.preventDefault();
    }
    scrawl.addNativeListener('keyup', copyPasteKeysUp, canvas.domElement);


    // #### Cleanup and return
    const killEntityCopyPaste = () => {
        copyPasteKeysDown();
        copyPasteKeysUp();
    };

    return {
        // ctrl: {
        //     copy: entityGroupCopy,
        //     paste: entityGroupPaste,
        //     delete: entityGroupDelete,
        // },
        // entityGroupCopy,
        // entityGroupPaste,
        // entityGroupDelete,
        killEntityCopyPaste,
    };
};


// #### Export
export {
    initializeEntityCopyPaste,
};
