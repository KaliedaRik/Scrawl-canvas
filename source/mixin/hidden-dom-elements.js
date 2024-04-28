// # Hidden DOM Elements mixin


// #### Imports
import { canvas } from '../core/library.js';

import { Ωempty } from '../helper/utilities.js';

import { _keys, ANCHOR_ATTRIBUTES, BUTTON_ATTRIBUTES, T_CANVAS, T_CELL } from '../helper/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
// No additional attributes required


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Prototype functions

// `getCanvasNavElement` - internal function. Locate the &lt;nav> DOM hold element to which &lt;button> and &lt;a> elements get added.
    P.getCanvasNavElement = function () {

        const entityHost = this.currentHost;

        if (entityHost) {

            if (entityHost.type === T_CANVAS) return entityHost.navigation;

            if (entityHost.type === T_CELL) {

                const cellHost = (entityHost.currentHost) ? entityHost.currentHost : canvas[entityHost.host];

                if (cellHost && cellHost.type === T_CANVAS) return cellHost.navigation;
            }
        }
        return null;
    }

// `getCanvasWrapper` - internal function. Retrieve the Canvas wrapper object that controls the DOM hold element.
    P.getCanvasWrapper = function () {

        const entityHost = this.currentHost;

        if (entityHost) {

            if (entityHost.type === T_CANVAS) return entityHost;

            if (entityHost.type === T_CELL) {

                const cellHost = (entityHost.currentHost) ? entityHost.currentHost : canvas[entityHost.host];

                if (cellHost && cellHost.type === T_CANVAS) return cellHost;
            }
        }
        return null;
    }

// `prepareStampTabsHelper` - internal function. Called by various `prepareStamp` functions
    P.prepareStampTabsHelper = function () {

        if (this.anchor) this.rebuildAnchor();
        if (this.button) this.rebuildButton();
    };

// `modifyConstructorInputForAnchorButton` - internal function. Called by various `prepareStamp` functions
    P.modifyConstructorInputForAnchorButton = function (items) {

        const keys = _keys(items);

        let anchorFlag = false;
        for (let i = 0, iz = ANCHOR_ATTRIBUTES.length; i < iz; i++) {

            if (keys.includes(ANCHOR_ATTRIBUTES[i])) {

                anchorFlag = true;
                break;
            }
        }

        let buttonFlag = false;
        for (let i = 0, iz = BUTTON_ATTRIBUTES.length; i < iz; i++) {

            if (keys.includes(BUTTON_ATTRIBUTES[i])) {

                buttonFlag = true;
                break;
            }
        }

        if (anchorFlag) {

            const a = items.anchor || {};

            if (items.anchorHref != null) {
                a.href = items.anchorHref;
                delete items.anchorHref;
            }

            if (items.anchorName != null) {
                a.name = items.anchorName;
                delete items.anchorName;
            }

            if (items.anchorDescription != null) {
                a.description = items.anchorDescription;
                delete items.anchorDescription;
            }

            if (items.anchorType != null) {
                a.anchorType = items.anchorType;
                delete items.anchorType;
            }

            if (items.anchorTarget != null) {
                a.target = items.anchorTarget;
                delete items.anchorTarget;
            }

            if (items.anchorTabOrder != null) {
                a.tabOrder = items.anchorTabOrder;
                delete items.anchorTabOrder;
            }

            if (items.anchorDisabled != null) {
                a.disabled = items.anchorDisabled;
                delete items.anchorDisabled;
            }

            if (items.anchorRel != null) {
                a.rel = items.anchorRel;
                delete items.anchorRel;
            }

            if (items.anchorReferrerPolicy != null) {
                a.referrerPolicy = items.anchorReferrerPolicy;
                delete items.anchorReferrerPolicy;
            }

            if (items.anchorPing != null) {
                a.ping = items.anchorPing;
                delete items.anchorPing;
            }

            if (items.anchorHreflang != null) {
                a.hrefLang = items.anchorHreflang;
                delete items.anchorHreflang;
            }

            if (items.anchorDownload != null) {
                a.download = items.anchorDownload;
                delete items.anchorDownload;
            }

            if (items.anchorFocusAction != null) {
                a.focusAction = items.anchorFocusAction;
                delete items.anchorFocusAction;
            }

            if (items.anchorBlurAction != null) {
                a.blurAction = items.anchorBlurAction;
                delete items.anchorBlurAction;
            }

            if (items.anchorClickAction != null) {
                a.clickAction = items.anchorClickAction;
                delete items.anchorClickAction;
            }
            items.anchor = a;
        }

        if (buttonFlag) {

            const b = items.button || {};

            if (items.buttonName != null) {
                b.name = items.buttonName;
                delete items.buttonName;
            }

            if (items.buttonAutofocus != null) {
                b.autofocus = items.buttonAutofocus;
                delete items.buttonAutofocus;
            }

            if (items.buttonDescription != null) {
                b.description = items.buttonDescription;
                delete items.buttonDescription;
            }

            if (items.buttonDisabled != null) {
                b.disabled = items.buttonDisabled;
                delete items.buttonDisabled;
            }

            if (items.buttonTabOrder != null) {
                b.tabOrder = items.buttonTabOrder;
                delete items.buttonTabOrder;
            }

            if (items.buttonForm != null) {
                b.form = items.buttonForm;
                delete items.buttonForm;
            }

            if (items.buttonFormAction != null) {
                b.formAction = items.buttonFormAction;
                delete items.buttonFormAction;
            }

            if (items.buttonFormEnctype != null) {
                b.formEncType = items.buttonFormEnctype;
                delete items.buttonFormEnctype;
            }

            if (items.buttonFormMethod != null) {
                b.formMethod = items.buttonFormMethod;
                delete items.buttonFormMethod;
            }

            if (items.buttonFormNoValidate != null) {
                b.formNoValidate = items.buttonFormNoValidate;
                delete items.buttonFormNoValidate;
            }

            if (items.buttonFormTarget != null) {
                b.formTarget = items.buttonFormTarget;
                delete items.buttonFormTarget;
            }

            if (items.buttonElementName != null) {
                b.elementName = items.buttonElementName;
                delete items.buttonElementName;
            }

            if (items.buttonPopoverTarget != null) {
                b.popoverTarget = items.buttonPopoverTarget;
                delete items.buttonPopoverTarget;
            }

            if (items.buttonPopoverTargetAction != null) {
                b.popoverTargetAction = items.buttonPopoverTargetAction;
                delete items.buttonPopoverTargetAction;
            }

            if (items.buttonElementType != null) {
                b.elementType = items.buttonElementType;
                delete items.buttonElementType;
            }

            if (items.buttonElementValue != null) {
                b.elementValue = items.buttonElementValue;
                delete items.buttonElementValue;
            }

            if (items.buttonFocusAction != null) {
                b.focusAction = items.buttonFocusAction;
                delete items.buttonFocusAction;
            }

            if (items.buttonBlurAction != null) {
                b.blurAction = items.buttonBlurAction;
                delete items.buttonBlurAction;
            }

            if (items.buttonClickAction != null) {
                b.clickAction = items.buttonClickAction;
                delete items.buttonClickAction;
            }
            items.button = b;
        }
    };
}
