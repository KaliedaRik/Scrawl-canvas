// # Button factory
// In Scrawl-canvas, a Button object holds all the data and functionality required to turn an artefact into a tab-able button. That functionality gets defined in this file.
//
// Scrawl-canvas uses the [Button mixin](../mixin/button.html) to add button functionality to artefacts - in particular canvas entitys. This (alongside Anchor objects) gives us a interactive canvas containing dynamic, clickable regions.
//
// We use buttons to trigger a desired action. This can be achieved by setting the button object's __clickAction__ attribute to a function.
//
// NOTE - generating a button will have an impact on the DOM document code, as an (off-viewport) &lt;a> element will be added to it.
//
// The __makeButton__ function is not exposed to the 'scrawl' object, thus objects can only be created indirectly. Buttons can be saved, cloned and killed as part of wider save/kill/clone functionality.


// #### Demos:
// + [DOM-021](../../demo/dom-021.html) - Use canvas elements in popover content


// #### Imports
import { artefact, constructors } from '../core/library.js';

import { doCreate, isa_dom, isa_fn, mergeOver, pushUnique, Ωempty } from '../core/utilities.js';

import baseMix from '../mixin/base.js';

import {
} from '../core/shared-vars.js';

import { _keys, _FORMACTION, _FORMENCTYPE, _FORMMETHOD, _FORMNOVALIDATE, _POPOVERTARGET, _POPOVERTARGETACTION, ANCHOR, AUTOFOCUS, BLUR, BUTTON, CLICK, DISABLED, FOCUS, FORM, NAME, T_BUTTON, TARGET, TYPE, UNDEF, VALUE, ZERO_STR } from '../core/shared-vars.js';


// #### Button constructor
const Button = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);
    this.set(items);

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

// The following attributes are detailed in [MDN's &lt;button> reference page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button).
    autofocus: false,
    disabled: false,
    form: ZERO_STR,
    formAction: ZERO_STR,
    formEnctype: ZERO_STR,
    formMethod: ZERO_STR,
    formNoValidate: false,
    formTarget: ZERO_STR,
    elementName: ZERO_STR,
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

    if (this.domElement && this.hold) this.hold.removeChild(this.domElement);

    this.deregister();
};


// #### Get, Set, deltaSet
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
        this.build();
    }
    return this;
};

const S = P.setters;

// Value should be the artefact object, or its name-String
S.host = function (item) {

    const h = (item.substring) ? artefact[item] : item;

    if (h && h.name) this.host = h;
};

// Used internally - do not set directly! A reference to the hidden DOM hold &lt;div> element where the &lt;button> element is kept.
S.hold = function (item) {

    if (isa_dom(item)) {

        if (this.domElement && this.hold) this.hold.removeChild(this.domElement);

        this.hold = item;

        if (this.domElement) this.hold.appendChild(this.domElement);
    }
};

// The artefact with which a button object is associated maps these additional attributes to itself as follows:
// ```
// button.autofocus           ~~>  artefact.buttonAutofocus            (autofocus)
// button.description         ~~>  artefact.buttonDescription          ()
// button.disabled            ~~>  artefact.buttonDisabled             (disabled)
// button.form                ~~>  artefact.buttonForm                 (form)
// button.formAction          ~~>  artefact.buttonFormAction           (formaction)
// button.formEnctype         ~~>  artefact.buttonFormEnctype          (formenctype)
// button.formMethod          ~~>  artefact.buttonFormMethod           (formmethod)
// button.formNoValidate      ~~>  artefact.buttonFormNoValidate       (formnovalidate)
// button.formTarget          ~~>  artefact.buttonFormTarget           (target)
// button.elementName         ~~>  artefact.buttonElementName          (name)
// button.popoverTarget       ~~>  artefact.buttonPopoverTarget        (popovertarget)
// button.popoverTargetAction ~~>  artefact.buttonPopoverTargetAction  (popovertargetaction)
// button.elementType         ~~>  artefact.buttonElementType          (type)
// button.elementValue        ~~>  artefact.buttonElementValue         (value)
// ```
// One or more of these attributes can also be set (in the artefact factory argument, or when invoking artefact.set) using a 'button' attribute


// #### Prototype functions
// The `build` function builds the &lt;button> element and adds it to the DOM
P.build = function () {

    const { hold, host } = this;

    if (host && hold) {

        const { autofocus, blurAction, clickAction, description, disabled, elementName, elementType, elementValue, focusAction, form, formAction, formEnctype, formMethod, formNoValidate, formTarget, name, popoverTarget, popoverTargetAction } = this;

        let btn = this.domElement;

        if (btn) {

            if (clickAction) btn.removeEventListener(CLICK, clickAction, false);
            if (focusAction) btn.removeEventListener(FOCUS, () => host.onEnter(), false);
            if (blurAction) btn.removeEventListener(BLUR, () => host.onLeave(), false);

            hold.removeChild(btn);
        }

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
        if (elementName) btn.setAttribute(NAME, elementName);
        if (popoverTarget) btn.setAttribute(_POPOVERTARGET, popoverTarget);
        if (popoverTargetAction) btn.setAttribute(_POPOVERTARGETACTION, popoverTargetAction);
        if (elementValue != null) btn.setAttribute(VALUE, elementValue);

        if (elementType) btn.setAttribute(TYPE, elementType);
        else btn.setAttribute(TYPE, BUTTON);

        if (clickAction && isa_fn(clickAction)) btn.addEventListener(CLICK, clickAction, false);

        if (description) btn.textContent = description;

        if (focusAction) btn.addEventListener(FOCUS, () => host.onEnter(), false);
        if (blurAction) btn.addEventListener(BLUR, () => host.onLeave(), false);

        this.domElement = btn;

        hold.appendChild(btn);
    }
};


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
//         elementName: 'close-button',
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
