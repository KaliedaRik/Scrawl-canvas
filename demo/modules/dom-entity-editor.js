// # Demo Modules 005
// Accessible GUI-based simple canvas editor
//
// Related files:
// + [Accessible GUI-based simple canvas editor - main demo](../modules-005.html)
//
// #### Usage
// This sub-module creates accessible forms which can be used to update attributes to a selected entity, or group of entitys. The forms update in real-time as the user selects entitys for editing. The sub-module's output is required by the entity-navigation sub-module, to help build a fully accessible editing environment.
//
// __Inputs to the `initializeDomEntityEditor` function__
// + `queryString` - CSS query string to locate the DOM element where the entity editor form will appear (required)
//
// __Output from the `initializeDomEntityEditor` function__ - is an object containing the following attributes:
// + `dashboard` - an object containing functions - `refresh, update, queue` - which will be consumed by other sub-modules
// + `killDomEntityEditor` - kill function, to remove everything associated with the DOM entity editor from the SC library


// ### Template functions
// This sort of functionality could also be managed by React/Vue/Svelte/etc components if the code is going to run in those environments
const getElementHelper = (tag, classSuffix, contents) => {

    const el = document.createElement(tag);
    el.classList.add(`sc-dee-${classSuffix}`);

    if (contents != null) {

        if (Array.isArray(contents)) contents.forEach(c => el.appendChild(c));
        else el.appendChild(contents);
    }
    return el;
};

const getContainer = (contents) => getElementHelper('div', 'container', contents);
const getForm = (contents = []) => getElementHelper('form', 'form', contents);

const addTitle = (title) => {

    const el = document.createElement('h3');
    el.classList.add('sc-dee-title');

    if (title != null) el.textContent = title;

    return el;
};

const fieldHandles = {};

const getInputField = (entity, key, fieldData) => {

    const el = document.createElement('div');
    el.classList.add('sc-dee-field-container');

    const field = document.createElement('input');

    field.id = key;

    field.setAttribute('type', fieldData.inputType);
    if ('Group' !== entity.type) field.setAttribute('value', entity.get(key));

    field.classList.add('sc-dee-field-controller');
    field.style.fontSize = 'inherit';
    field.style.fontFamily = 'inherit';

    if (fieldData.controlMin != null) field.setAttribute('min', fieldData.controlMin);
    if (fieldData.controlMax != null) field.setAttribute('max', fieldData.controlMax);
    if (fieldData.controlStep != null) field.setAttribute('step', fieldData.controlStep);

    if (fieldData.order.includes('00 ')) el.classList.add('sc-dee-field-color-0');
    else if (fieldData.order.includes('01 ')) el.classList.add('sc-dee-field-color-1');
    else if (fieldData.order.includes('02 ')) el.classList.add('sc-dee-field-color-2');
    else if (fieldData.order.includes('03 ')) el.classList.add('sc-dee-field-color-3');
    else if (fieldData.order.includes('04 ')) el.classList.add('sc-dee-field-color-4');

    const label = document.createElement('label');
    label.textContent = fieldData.label;
    label.setAttribute('for', key);

    el.appendChild(label);
    el.appendChild(field);

    fieldHandles[key] = field;

    return el;
};

const getSelectField = (entity, key, fieldData) => {

    const isBoolean = ('boolean' === fieldData.glue[1]);
    const optionsList = [];
    
    const el = document.createElement('div');
    el.classList.add('sc-dee-field-container');

    const field = document.createElement('select');

    field.id = key;

    for (const [k, v] of Object.entries(fieldData.selectOptions)) {

        optionsList.push(v);

        const opt = document.createElement('option');
        opt.setAttribute('value', v);
        opt.textContent = k;

        field.appendChild(opt);
    }

    field.classList.add('sc-dee-field-controller');
    field.style.fontSize = 'inherit';
    field.style.fontFamily = 'inherit';

    if ('Group' !== entity.type) {

        const entityVal = entity.get(key);

        if (isBoolean) {

            field.options.selectedIndex = entityVal ? 1 : 0;
        }
        else field.options.selectedIndex = optionsList.indexOf(entityVal);
    }
    else field.options.selectedIndex = 0;

    if (fieldData.order.includes('00 ')) el.classList.add('sc-dee-field-color-0');
    else if (fieldData.order.includes('01 ')) el.classList.add('sc-dee-field-color-1');
    else if (fieldData.order.includes('02 ')) el.classList.add('sc-dee-field-color-2');
    else if (fieldData.order.includes('03 ')) el.classList.add('sc-dee-field-color-3');
    else if (fieldData.order.includes('04 ')) el.classList.add('sc-dee-field-color-4');

    const label = document.createElement('label');
    label.textContent = fieldData.label;
    label.setAttribute('for', key);

    el.appendChild(label);
    el.appendChild(field);

    fieldHandles[key] = field;

    return el;
};

const addFields = (entity) => {

    let fieldData;

    if ('Group' !== entity.type) {

        fieldData = {
            ...commonRequirements,
            ...entityRequirements[entity.type],
        };
    }
    else {

        fieldData = {
            ...groupRequirements,
        };
    }

    let fieldKeys = Object.keys(fieldData);

    fieldKeys = fieldKeys.sort((a, b) => {

        const A = fieldData[a],
            B = fieldData[b];

        if (A.order === B.order) {

            return (A.label < B.label) ? -1 : 1;
        }
        return (A.order < B.order) ? -1 : 1;
    });

    const elements = [];

    fieldKeys.forEach(key => {

        const data = fieldData[key];

        if (data.selectOptions != null) elements.push(getSelectField(entity, key, data));
        else if (data.inputType != null) elements.push(getInputField(entity, key, data));
    });
    return elements;
};

// Definition objects - define the form inputs based on the entity type, or the inputs for group selections
const groupRequirements = {

    method: {
        order: '02 display',
        label: 'Stamp Method',
        selectOptions: {
            'draw': 'draw',
            'fill': 'fill',
            'drawAndFill': 'drawAndFill',
            'fillAndDraw': 'fillAndDraw',
            'drawThenFill': 'drawThenFill',
            'fillThenDraw': 'fillThenDraw',
            'clear': 'clear',
        },
        glue: ['method', 'raw'],
    },
    flipUpend: {
        order: '01 position flip',
        label: 'Flip Upend',
        selectOptions: {
            false: '0',
            true: '1',
        },
        glue: ['flipUpend', 'boolean'],
    },
    flipReverse: {
        order: '01 position flip',
        label: 'Flip Reverse',
        selectOptions: {
            false: '0',
            true: '1',
        },
        glue: ['flipReverse', 'boolean'],
    },
    fillStyle: {
        order: '02 display style',
        label: 'Fill',
        inputType: 'color',
        glue: ['fillStyle', 'raw'],
    },
    strokeStyle: {
        order: '02 display style',
        label: 'Stroke',
        inputType: 'color',
        glue: ['strokeStyle', 'raw'],
    },
    lineWidth: {
        order: '03 display line',
        label: 'Line Width',
        inputType: 'number',
        controlMin: 0,
        controlStep: 0.5,
        glue: ['lineWidth', 'float'],
    },
    lineCap: {
        order: '03 display line',
        label: 'Line Cap',
        selectOptions: {
            butt: 'butt',
            round: 'round',
            square: 'square',
        },
        glue: ['lineCap', 'raw'],
    },
    lineJoin: {
        order: '03 display line',
        label: 'Line Join',
        selectOptions: {
            miter: 'miter',
            round: 'round',
            join: 'bevel',
        },
        glue: ['lineJoin', 'raw'],
    },
    scaleOutline: {
        order: '03 display line',
        label: 'Scale Outline',
        selectOptions: {
            false: '0',
            true: '1',
        },
        glue: ['scaleOutline', 'boolean'],
    },
    shadowOffsetX: {
        order: '04 display shadow',
        label: 'Shadow Offset X (px)',
        inputType: 'number',
        controlStep: 0.5,
        glue: ['shadowOffsetX', 'float'],
    },
    shadowOffsetY: {
        order: '04 display shadow',
        label: 'Shadow Offset Y (px)',
        inputType: 'number',
        controlStep: 0.5,
        glue: ['shadowOffsetY', 'float'],
    },
    shadowBlur: {
        order: '04 display shadow',
        label: 'Shadow Blur',
        inputType: 'number',
        controlMin: 0,
        controlStep: 0.5,
        glue: ['shadowBlur', 'float'],
    },
    shadowColor: {
        order: '04 display shadow',
        label: 'Shadow Color',
        inputType: 'color',
        glue: ['shadowColor', 'raw'],
    },
};

const commonRequirements = {

    ...groupRequirements,

    handleX: {
        order: '01 position handle',
        label: 'Handle X (%)',
        inputType: 'number',
        controlStep: 1,
        glue: ['handleX', '%'],
    },
    handleY: {
        order: '01 position handle',
        label: 'Handle Y (%)',
        inputType: 'number',
        controlStep: 1,
        glue: ['handleY', '%'],
    },
    startX: {
        order: '01 position start',
        label: 'Start X (px)',
        inputType: 'number',
        controlStep: 1,
        glue: ['startX', 'round'],
    },
    startY: {
        order: '01 position start',
        label: 'Start Y (px)',
        inputType: 'number',
        controlStep: 1,
        glue: ['startY', 'round'],
    },
    offsetX: {
        order: '01 position offset',
        label: 'Offset X (px)',
        inputType: 'number',
        controlStep: 1,
        glue: ['offsetX', 'round'],
    },
    offsetY: {
        order: '01 position offset',
        label: 'Offset Y (px)',
        inputType: 'number',
        controlStep: 1,
        glue: ['offsetY', 'round'],
    },
    roll: {
        order: '01 shape roll',
        label: 'Roll (deg)',
        inputType: 'number',
        controlMin: -360,
        controlMax: 360,
        controlStep: 0.2,
        glue: ['roll', 'float'],
    },
    scale: {
        order: '01 shape scale',
        label: 'Scale',
        inputType: 'number',
        controlMin: 0,
        controlStep: 0.005,
        glue: ['scale', 'float'],
    },
};

const entityRequirements = {

    Block: {
        width: {
            order: '00 shape',
            label: 'Width (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['width', 'round'],
        },
        height: {
            order: '00 shape',
            label: 'Height (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['height', 'round'],
        },
    },

    Wheel: {
        radius: {
            order: '00 shape',
            label: 'Radius (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['radius', 'round'],
        },
        startAngle: {
            order: '00 shape',
            label: 'Start Angle (deg)',
            inputType: 'number',
            controlMin: -360,
            controlMax: 360,
            controlStep: 0.2,
            glue: ['startAngle', 'float'],
        },
        endAngle: {
            order: '00 shape',
            label: 'End Angle (deg)',
            inputType: 'number',
            controlMin: -360,
            controlMax: 360,
            controlStep: 0.2,
            glue: ['endAngle', 'float'],
        },
        includeCenter: {
            order: '00 shape',
            label: 'Include Center',
            selectOptions: {
                false: '0',
                true: '1',
            },
            glue: ['includeCenter', 'boolean'],
        },
        closed: {
            order: '00 shape',
            label: 'Closed',
            selectOptions: {
                false: '0',
                true: '1',
            },
            glue: ['closed', 'boolean'],
        },
    },

    Phrase: {
        width: {
            order: '00 shape',
            label: 'Width (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['width', 'round'],
        },
        text: {
            order: '00 content',
            label: 'Text',
            inputType: 'text',
            glue: ['text', 'raw'],
        },
        lineHeight: {
            order: '00 shape',
            label: 'Line height',
            inputType: 'number',
            controlMin: 0,
            controlStep: 0.1,
            glue: ['lineHeight', 'float'],
        },
        letterSpacing: {
            order: '00 shape',
            label: 'Letter spacing (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 0.2,
            glue: ['letterSpacing', 'float'],
        },
        justify: {
            order: '00 shape',
            label: 'Justify text',
            selectOptions: {
                left: 'left',
                center: 'center',
                right: 'right',
                full: 'full',
            },
            glue: ['justify', 'raw'],
        },
        family: {
            order: '00 shape',
            label: 'Font family',
            selectOptions: {
                'sans-serif': 'sans-serif',
                serif: 'serif',
                monospace: 'monospace',
                fantasy: 'fantasy',
            },
            glue: ['family', 'raw'],
        },
        sizeValue: {
            order: '00 shape',
            label: 'Font size value (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['sizeValue', 'round'],
        },
    },

    Picture: {
        width: {
            order: '00 shape',
            label: 'Width (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['width', 'round'],
        },
        height: {
            order: '00 shape',
            label: 'Height (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['height', 'round'],
        },
        copyStartX: {
            order: '02 display copyStart',
            label: 'Copy start X (px)',
            inputType: 'number',
            controlStep: 1,
            glue: ['copyStartX', 'round'],
        },
        copyStartY: {
            order: '02 display copyStart',
            label: 'Copy start Y (px)',
            inputType: 'number',
            controlStep: 1,
            glue: ['copyStartY', 'round'],
        },
        copyWidth: {
            order: '02 display copyWidth',
            label: 'Copy width (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['copyWidth', 'round'],
        },
        copyHeight: {
            order: '02 display copyHeight',
            label: 'Copy height (px)',
            inputType: 'number',
            controlMin: 0,
            controlStep: 1,
            glue: ['copyHeight', 'round'],
        },
    },
};


// ### Exported function
const initializeDomEntityEditor = (items = {}, scrawl) => {

    // Check we have required arguments/values
    const { queryString } = items;

    if (scrawl == null) throw new Error('SC DOM entity editor module error: missing Scrawl-canvas object argument');

    let argsCheck = '';

    if (queryString == null) argsCheck += ' - entity editor query string'

    if (argsCheck.length) throw new Error(`SC DOM entity editor module error: missing arguments${argsCheck}`);


    // DOM editor contents management
    let observer;

    const updateObserver = (entity, callback) => {

        // Clean out the old observer
        if (observer) observer();

        const updates = {};

        let fieldData;


        if ('Group' === entity.type) {

            fieldData = {
                ...groupRequirements,
            };
        }
        else {

            fieldData = {
                ...commonRequirements,
                ...entityRequirements[entity.type],
            };
        }

        for (const [k, v] of Object.entries(fieldData)) {

            updates[k] = v.glue;
        }

        observer = scrawl.makeUpdater({

            event: ['input', 'change'],
            origin: '.sc-dee-field-controller',
            target: entity,
            useNativeListener: true,
            preventDefault: true,
            updates,
            callback,
        });
    };

    const doEditorUpdate = (container) => {

        if (container != null) {

            currentEditor.replaceWith(container);
            currentEditor = container;
        }
    };

    const addEntityEditor = (entity, callback) => {

        const title = addTitle(`Editing: ${entity.name}`);
        const form = getForm();

        const fields = addFields(entity);
        fields.forEach(f => form.appendChild(f));

        const container = getContainer([title, form]);

        doEditorUpdate(container);
        updateObserver(entity, callback);
    };

    const addGroupEditor = (entitys, callback) => {

        const title = addTitle(`Group editing: ${entitys.artefacts.join(', ')}`);
        const form = getForm();

        const fields = addFields(entitys);
        fields.forEach(f => form.appendChild(f));

        const container = getContainer([title, form]);

        doEditorUpdate(container);
        updateObserver(entitys, callback);
    };

    const removeEditor = () => {

        const title = addTitle('Select an entity to edit its attributes');
        const container = getContainer(title);

        doEditorUpdate(container);

        if (observer) observer();
        observer = null;
    };


    // Get a handle to the DOM element which will host the entity editor HTML, and empty it of all child elements and nodes. We can then add a dummy element to be replaced by subsequent operations
    const domEntityEditor = document.querySelector(queryString);

    while (domEntityEditor.firstChild) {

        domEntityEditor.removeChild(domEntityEditor.firstChild);
    }

    let currentEditor = document.createElement('div');
    
    domEntityEditor.appendChild(currentEditor);


    // Now we can add the default message to the editor
    removeEditor();

    // Exported function to show/hide the entityEditor component
    const updateDomEntityEditor = (selectedGroup = null, callback) => {

        if (selectedGroup == null) throw new Error('SC DOM entity editor operation error: cannot update editor - no group supplied');

        if (!callback) callback = () => {};

        if (selectedGroup.artefacts.length > 1) {

            addGroupEditor(selectedGroup, callback);
        }
        else if (selectedGroup.artefacts.length === 1) {

            const entity = selectedGroup.getArtefact(selectedGroup.artefacts[0]);

            if (entity && entity.name) {

                addEntityEditor(entity, callback);
            }
        }
        else removeEditor();
    };

    // Exported array/function to collect and process updates
    const domFieldUpdates = [];

    const updateDomFields = (selectedGroup) => {

        if (selectedGroup.artefacts.length === 1) {

            while (domFieldUpdates.length) {

                const update = domFieldUpdates.shift();

                for (const [key, value] of Object.entries(update)) {

                    const handle = fieldHandles[key];
                    if (handle) handle.value = value;
                }
            }
        }
    };

    // #### Cleanup and return
    const killDomEntityEditor = () => {

        if (observer) observer();
    };

    // Return object
    return {
        dashboard: {
            refresh: updateDomEntityEditor,
            update: updateDomFields,
            queue: domFieldUpdates,
        },
        killDomEntityEditor,
    }
};


// #### Export
export {
    initializeDomEntityEditor,
};
