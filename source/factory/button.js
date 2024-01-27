// # Button factory
// In Scrawl-canvas, a Button object holds all the data and functionality required to turn an artefact into a tab-able button. That functionality gets defined in this file.
//
// Scrawl-canvas uses the [Button mixin](../mixin/button.html) to add button functionality to artefacts - in particular canvas entitys. This (alongside Anchor objects) gives us a interactive canvas containing dynamic, clickable regions.
//
// We use buttons to trigger a desired action. This can be achieved by setting the button object's __clickAction__ attribute to a function.
//
// NOTE - generating a button will have an impact on the DOM document code, as an (off-viewport) &lt;button> element will be added to it.
//
// The __makeButton__ function is not exposed to the 'scrawl' object, thus objects can only be created indirectly. Buttons can be saved, cloned and killed as part of wider save/kill/clone functionality.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, isa_fn, mergeOver, pushUnique, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';

import { _keys, _FORMACTION, _FORMENCTYPE, _FORMMETHOD, _FORMNOVALIDATE, _POPOVERTARGET, _POPOVERTARGETACTION, ANCHOR, AUTOFOCUS, BLUR, BUTTON, CLICK, DATA_TAB_ORDER, DISABLED, FOCUS, FORM, NAME, T_BUTTON, TARGET, TYPE, UNDEF, VALUE, ZERO_STR } from '../helper/shared-vars.js';


// #### Button constructor
const Button = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    this.host = items.host;
    this.controller = items.controller;
    this.hold = items.hold;

    this.set(items);

    this.dirtyButton = true;

    return this;
};


// #### Button prototype
// Note that button objects are stored in the `anchor` section of the SC Library
const P = Button.prototype = doCreate();
P.type = T_BUTTON;
P.lib = ANCHOR;
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
baseMix(P);


// #### Button attributes
const defaultAttributes = {

// __host__ - Every button will belong to exactly one Artefact.
    host: null,

// __description__ - The text that Scrawl-canvas will include between the button tags, when building the button. __Always include a description__ for accessibility.
    description: ZERO_STR,

// __tabOrder__ - All hidden Button &lt;button> elements have a default tabOrder attribute value of 0. SC does not touch this attribute. Instead, to order Button (and Anchor) DOM elements within the host &lt;canvas> element's &lt;nav> element we set a `data-tab-order` attribute with the tabOrder value, which the Canvas wrapper can then use to reorder the elements as part of the Display cycle.
    tabOrder: 0,

// The following attributes are detailed in [MDN's &lt;button> reference page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button).
// + Note that when the `disabled` attribute is set to true, will prevent the &lt;button> element from being added to the &lt;canvas> element's &lt;nav> element on the next build cycle.
    autofocus: false,
    disabled: false,
    form: ZERO_STR,
    formAction: ZERO_STR,
    formEnctype: ZERO_STR,
    formMethod: ZERO_STR,
    formNoValidate: false,
    formTarget: ZERO_STR,
    popoverTarget: ZERO_STR,
    popoverTargetAction: ZERO_STR,
    elementType: BUTTON,
    elementValue: ZERO_STR,

// __clickAction__ - function - actions to be performed when user tabs to the hidden button element and presses the keyboard return button. Function cannot take any arguments.
    clickAction: null,

// We can instruct the button to add event listeners for focus and blur events using the __focusAction__ and __blurAction__ Boolean flags. When set to true, the ___focus___ event listener will invoke the host entity's `onEnter` function; the ___blur___ event listener invokes the `onLeave` function. Default is to ignore these events
    focusAction: true,
    blurAction: true,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management
P.packetExclusions = pushUnique(P.packetExclusions, ['domElement']);
P.packetObjects = pushUnique(P.packetObjects, ['host']);
P.packetFunctions = pushUnique(P.packetFunctions, ['clickAction']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.demolish = function () {

    const { host, controller, domElement, hold, clickAction, focusAction, blurAction } = this;

    if (domElement && clickAction) domElement.removeEventListener(CLICK, clickAction, false);
    if (host && domElement && focusAction) domElement.removeEventListener(FOCUS, () => host.onEnter(), false);
    if (host && domElement && blurAction) domElement.removeEventListener(BLUR, () => host.onLeave(), false);

    if (hold && domElement) hold.removeChild(domElement);

    if (controller) controller.dirtyNavigationTabOrder = true;

    if (host) host.button = null;

    this.deregister();
};


// #### Get, Set, deltaSet
// The artefact with which a button object is associated maps these additional attributes to itself as follows:
// ```
// button.autofocus           ~~>  artefact.buttonAutofocus            (autofocus)
// button.description         ~~>  artefact.buttonDescription          ()
// button.disabled            ~~>  artefact.buttonDisabled             (disabled)
// button.elementType         ~~>  artefact.buttonElementType          (type)
// button.elementValue        ~~>  artefact.buttonElementValue         (value)
// button.form                ~~>  artefact.buttonForm                 (form)
// button.formAction          ~~>  artefact.buttonFormAction           (formaction)
// button.formEnctype         ~~>  artefact.buttonFormEnctype          (formenctype)
// button.formMethod          ~~>  artefact.buttonFormMethod           (formmethod)
// button.formNoValidate      ~~>  artefact.buttonFormNoValidate       (formnovalidate)
// button.formTarget          ~~>  artefact.buttonFormTarget           (target)
// button.popoverTarget       ~~>  artefact.buttonPopoverTarget        (popovertarget)
// button.popoverTargetAction ~~>  artefact.buttonPopoverTargetAction  (popovertargetaction)
// button.tabOrder            ~~>  artefact.buttonTabOrder             ()
// ```
// One or more of these attributes can also be set (in the artefact factory argument, or when invoking artefact.set) using a 'button' attribute
P.set = function (items = Ωempty) {

    let i, key, val, fn;

    const keys = _keys(items),
        keysLen = keys.length;

    if (keysLen) {

        const setters = this.setters,
            defs = this.defs;

        for (i = 0; i < keysLen; i++) {

            key = keys[i];
            val = items[key];

            if (key && key != NAME && val != null) {

                fn = setters[key];

                if (fn) fn.call(this, val);
                else if (typeof defs[key] != UNDEF) this[key] = val;
            }
        }
        this.dirtyButton = true;
    }
    return this;
};


// #### Prototype functions
// The `build` function builds the &lt;button> element and adds it to the DOM
P.build = function () {

    const { host } = this;

    if (host) {

        if (!this.controller) this.controller = host.getCanvasWrapper();
        if (!this.hold) this.hold = host.getCanvasNavElement();

        const { hold, controller } = this;

        if (hold && controller) {

            const { autofocus, blurAction, clickAction, description, disabled, elementType, elementValue, focusAction, form, formAction, formEnctype, formMethod, formNoValidate, formTarget, name, popoverTarget, popoverTargetAction, tabOrder } = this;

            let btn = this.domElement;

            if (btn && hold) {

                if (clickAction) btn.removeEventListener(CLICK, clickAction, false);
                if (focusAction) btn.removeEventListener(FOCUS, () => host.onEnter(), false);
                if (blurAction) btn.removeEventListener(BLUR, () => host.onLeave(), false);

                hold.removeChild(btn);
                this.domElement = null;
            }

            if (!disabled) {

                btn = document.createElement(BUTTON);

                btn.id = name;

                if (autofocus) btn.setAttribute(AUTOFOCUS, ZERO_STR);
                if (disabled) btn.setAttribute(DISABLED, ZERO_STR);
                if (form) btn.setAttribute(FORM, form);
                if (formAction) btn.setAttribute(_FORMACTION, formAction);
                if (formEnctype) btn.setAttribute(_FORMENCTYPE, formEnctype);
                if (formMethod) btn.setAttribute(_FORMMETHOD, formMethod);
                if (formNoValidate) btn.setAttribute(_FORMNOVALIDATE, ZERO_STR);
                if (formTarget) btn.setAttribute(TARGET, formTarget);
                if (popoverTarget) btn.setAttribute(_POPOVERTARGET, popoverTarget);
                if (popoverTargetAction) btn.setAttribute(_POPOVERTARGETACTION, popoverTargetAction);
                if (elementValue != null) btn.setAttribute(VALUE, elementValue);

                if (elementType) btn.setAttribute(TYPE, elementType);
                else btn.setAttribute(TYPE, BUTTON);

                btn.setAttribute(DATA_TAB_ORDER, tabOrder);

                if (clickAction && isa_fn(clickAction)) btn.addEventListener(CLICK, clickAction, false);

                if (description) btn.textContent = description;

                if (focusAction) btn.addEventListener(FOCUS, () => host.onEnter(), false);
                if (blurAction) btn.addEventListener(BLUR, () => host.onLeave(), false);

                this.domElement = btn;

                hold.appendChild(btn);
            }
            controller.dirtyNavigationTabOrder = true;
        }

    }
};


// `rebuild` - called as part of the Display cycle
P.rebuild = function () {

    if (this.dirtyButton) {

        this.build();
        this.dirtyButton = false;
    }
}


// To action a user `click` on an artifact with an associated button object, we generate a DOM MouseEvent originating from the button element which the browser can act on in the usual manner (browser/device dependent)
P.click = function () {

    if (!this.hasBeenRecentlyClicked) {

        const e = new MouseEvent(CLICK, {
            view: window,
            bubbles: true,
            cancelable: true
        });

        // This choke mechanism is intended to prevent "Maximum call stack size exceeded" errors occurring
        // + Was causing an issue in Demo [Canvas-027](../../demo/canvas-027.html), where two entitys share the same anchor
        this.hasBeenRecentlyClicked = true;

        const self = this;
        setTimeout(() => self.hasBeenRecentlyClicked = false, 200);

        return this.domElement.dispatchEvent(e);
    }
    else return false;
};


// #### Factory
// To create a button, include an button definition object in any artefact object's factory argument:
// ```
// // get a handle on the canvas where the block/button will be defined
// // (in this case a canvas with id="mycanvas")
// let canvas = scrawl.library.artefact.mycanvas;
// canvas.setAsCurrentCanvas();
//
// // Define a block entity
// scrawl.makeBlock({
//
//     name: 'demo-button-block',
//
//     width: '40%',
//     height: '40%',
//
//     startX: '25%',
//     startY: '25%',
//
//     // Define the button object's attributes
//     button: {
//         name: 'close-button',
//         description: 'Close',
//         popoverTarget: 'mypopover',
//         popoverTargetAction: 'hide',
//     },
//
//     // Add an action to take when user clicks on the block entity
//     onUp: this.clickButton,
// });
//
// // Add a listener to propagate DOM-detected click events on our canvas
// // back into the Scrawl-canvas event system
// scrawl.addListener('up', () => canvas.cascadeEventAction('up'), canvas.domElement);
// ```
export const makeButton = function (items) {

    if (!items) return false;
    return new Button(items);
};

constructors.Button = Button;
