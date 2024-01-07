// # Button mixin
// The [button object](./factory/button.js) holds all the data and functionality required to turn an artefact into an HTML clickable &lt;button> element. This mixin adds functionality to artefacts for creating and managing button objects.
//
// Each artifact can have a maximum of one button object associated with it.


// #### Imports
import { canvas } from '../core/library.js';

import { isa_obj, mergeOver, Ωempty } from '../core/utilities.js';

import { makeButton } from '../factory/button.js';
import { scrawlNavigationHold } from '../core/document.js';

import { AUTOFOCUS, BLUR_ACTION, DESCRIPTION, CLICK_ACTION, DISABLED, ELEMENT_NAME, ELEMENT_TYPE, ELEMENT_VALUE, FOCUS_ACTION, FORM, FORM_ACTION, FORM_ENCTYPE, FORM_METHOD, FORM_NOVALIDATE, FORM_TARGET, POPOVER_TARGET, POPOVER_TARGETACTION, T_CANVAS,  T_CELL } from '../core/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __anchor__ - a handle to the anchor object. When creating or setting an artefact this can be supplied in the argument object as a Javascript object containing the data required to create the anchor.
        button: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// `demolishAnchor` - Note that a `handlePacketAnchor` function is also defined in the [position](./position.html) mixin, to manage the surrounding kill functionality.
    P.demolishButton = function () {

        if (this.button) this.button.demolish();
    };


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters;

// The following attributes (which largely map to [HTML button attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)) can be included in the argument object passed to the artefact's factory and `set` functions, or passed as a String to the `get` function:
// ```
// artefact.buttonAutofocus       ~~>  button.autofocus       boolean - default: false
// artefact.buttonDescription     ~~>  button.description     string - default: ''
// artefact.buttonDisabled        ~~>  button.disabled        boolean - default: false
// artefact.buttonForm            ~~>  button.form            string (id of &lt;form> element) - default: null
// artefact.buttonFormAction      ~~>  button.formAction      string (URL of processing API's endpoint) - default: null
// artefact.buttonFormEnctype     ~~>  button.formEnctype     string[1] - default: null
// artefact.buttonFormMethod      ~~>  button.formMethod      string[2] - default: null
// artefact.buttonFormNoValidate  ~~>  button.formNoValidate  boolean - default: false
// artefact.buttonFormTarget      ~~>  button.formTarget      string[3] - default: null
// artefact.buttonElementName     ~~>  button.elementName     string - default: null
// artefact.buttonPopoverTarget   ~~>  button.popoverTarget   string (id of popover element) - default: null
// artefact.buttonPopoverTargetAction   ~~>  button.popoverTargetAction   string[4] - default: null
// artefact.buttonElementType     ~~>  button.elementType     string[5] - default: 'button'
// artefact.buttonElementValue    ~~>  button.elementValue    string - default: null
// artefact.buttonFocusAction     ~~>  button.focusAction     boolean - default: false
// artefact.buttonBlurAction      ~~>  button.blurAction      boolean - default: false
// artefact.buttonClickAction     ~~>  button.clickAction     function - returns onclick string
//
// [1] - 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'
// [2] - 'post', 'get', 'dialog'
// [3] - name attribute of a browsing context; or '_self', '_blank', '_parent', '_top'
// [4] - 'hide', 'show', 'toggle'
// [5] - 'submit', 'reset', 'button'
//
// ```
//
// __buttonAutofocus__
    G.buttonAutofocus = function () { return this.buttonGetHelper(AUTOFOCUS); };
    S.buttonAutofocus = function (item) { return this.buttonSetHelper(AUTOFOCUS, item); };

// __buttonDescription__
    G.buttonDescription = function () { return this.buttonGetHelper(DESCRIPTION); };
    S.buttonDescription = function (item) { return this.buttonSetHelper(DESCRIPTION, item); };

// __buttonDisabled__
    G.buttonDisabled = function () { return this.buttonGetHelper(DISABLED); };
    S.buttonDisabled = function (item) { return this.buttonSetHelper(DISABLED, item); };

// __buttonForm__
    G.buttonForm = function () { return this.buttonGetHelper(FORM); };
    S.buttonForm = function (item) { return this.buttonSetHelper(FORM, item); };

// __buttonFormAction__
    G.buttonFormAction = function () { return this.buttonGetHelper(FORM_ACTION); };
    S.buttonFormAction = function (item) { return this.buttonSetHelper(FORM_ACTION, item); };

// __buttonFormEnctype__
    G.buttonFormEnctype = function () { return this.buttonGetHelper(FORM_ENCTYPE); };
    S.buttonFormEnctype = function (item) { return this.buttonSetHelper(FORM_ENCTYPE, item); };

// __buttonFormMethod__
    G.buttonFormMethod = function () { return this.buttonGetHelper(FORM_METHOD); };
    S.buttonFormMethod = function (item) { return this.buttonSetHelper(FORM_METHOD, item); };

// __buttonFormNoValidate__
    G.buttonFormNoValidate = function () { return this.buttonGetHelper(FORM_NOVALIDATE); };
    S.buttonFormNoValidate = function (item) { return this.buttonSetHelper(FORM_NOVALIDATE, item); };

// __buttonFormTarget__
    G.buttonFormTarget = function () { return this.buttonGetHelper(FORM_TARGET); };
    S.buttonFormTarget = function (item) { return this.buttonSetHelper(FORM_TARGET, item); };

// __buttonElementName__
    G.buttonElementName = function () { return this.buttonGetHelper(ELEMENT_NAME); };
    S.buttonElementName = function (item) { return this.buttonSetHelper(ELEMENT_NAME, item); };

// __buttonPopoverTarget__
    G.buttonPopoverTarget = function () { return this.buttonGetHelper(POPOVER_TARGET); };
    S.buttonPopoverTarget = function (item) { return this.buttonSetHelper(POPOVER_TARGET, item); };

// __buttonPopoverTargetAction__
    G.buttonPopoverTargetAction = function () { return this.buttonGetHelper(POPOVER_TARGETACTION); };
    S.buttonPopoverTargetAction = function (item) { return this.buttonSetHelper(POPOVER_TARGETACTION, item); };

// __buttonElementType__
    G.buttonElementType = function () { return this.buttonGetHelper(ELEMENT_TYPE); };
    S.buttonElementType = function (item) { return this.buttonSetHelper(ELEMENT_TYPE, item); };

// __buttonElementValue__
    G.buttonElementValue = function () { return this.buttonGetHelper(ELEMENT_VALUE); };
    S.buttonElementValue = function (item) { return this.buttonSetHelper(ELEMENT_VALUE, item); };

// __buttonFocusAction__
    G.buttonFocusAction = function () { return this.buttonGetHelper(FOCUS_ACTION); };
    S.buttonFocusAction = function (item) { return this.buttonSetHelper(FOCUS_ACTION, item); };

// __buttonBlurAction__
    G.buttonBlurAction = function () { return this.buttonGetHelper(BLUR_ACTION); };
    S.buttonBlurAction = function (item) { return this.buttonSetHelper(BLUR_ACTION, item); };

// __buttonClickAction__
    G.buttonClickAction = function () { return this.buttonGetHelper(CLICK_ACTION); };
    S.buttonClickAction = function (item) { return this.buttonSetHelper(CLICK_ACTION, item); };

// __button__
// The artefact's factory and `set` functions' argument object can include a single __button__ attribute, whose value should be an object containing button key:value pairs
// ```
// artefact.set({
//
//     button: { ... },
// });
// ```
    S.button = function (items) {

        if (!this.button) this.buildButton(items);
        else this.button.set(items);
    };

// Internal helper functions
    P.buttonGetHelper = function(key) {

        if (this.button) return this.button.get(key);
        return null;
    }

    P.buttonSetHelper = function(key, val) {

        if (!this.button) this.buildButton();
        if (this.button) this.button.set({ [key]: val });
    }


// #### Prototype functions

// The `buildButton` function triggers the (re)build of the &lt;a> element and adds it to the DOM
//
// Scrawl-canvas generated button elements are kept in hidden &lt;nav> elements (alongside anchor links) - either the Canvas object's nav, or the Scrawl-canvas default nav (referenced by _scrawlNavigationHold_) which Scrawl-canvas automatically generates and adds to the top of the DOM &lt;body> element when it first runs.
//
// This is done to allow buttons to be tabbed through and invoked in the normal way (which may vary dependent on how browsers implement tab focus functionality)
    P.buildButton = function (items) {

        if (isa_obj(items)) {

            if (this.button) this.button.demolish();

            if (!items.buttonName) items.buttonName = `${this.name}-button`;
            if (!items.description) items.description = `Button for ${this.name} ${this.type}`;

            items.host = this;
            items.hold = this.getButtonHold();

            this.button = makeButton(items);
        }
    };

// `getButtonHold` - internal function. Locate the current DOM hold element allocated for hosting &lt;a> elements.
    P.getButtonHold = function () {

        const entityHost = this.currentHost;

        if (entityHost) {

            if (entityHost.type === T_CANVAS) return entityHost.navigation;

            if (entityHost.type === T_CELL) {

                const cellHost = (entityHost.currentHost) ? entityHost.currentHost : canvas[entityHost.host];

                if (cellHost && cellHost.type === T_CANVAS) return cellHost.navigation;
            }
        }
        this.dirtyButtonHold = true;

        return scrawlNavigationHold;
    }

// `rebuildButton` - triggers the Button object's `build` function
    P.rebuildButton = function () {

        if (this.button) this.button.build();
    };



// `clickButton` - function to pass a user click (or whatever event has been set up) on the artefact through to the button object, for action.
    P.clickButton = function () {

        if (this.button) this.button.click();
    };

// Return the prototype
    return P;
}
