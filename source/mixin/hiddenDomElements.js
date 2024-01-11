// # Hidden DOM Elements mixin


// #### Imports
import { canvas } from '../core/library.js';

import { isa_obj, mergeOver, Ωempty } from '../core/utilities.js';

import { ANCHORTYPE, BLUR_ACTION, CLICK_ACTION, DESCRIPTION, DISABLED, DOWNLOAD, FOCUS_ACTION, HREF, HREFLANG, NAME, PING, REFERRERPOLICY, REL, T_CANVAS, T_CELL, TAB_ORDER, TARGET } from '../core/shared-vars.js';


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
}
