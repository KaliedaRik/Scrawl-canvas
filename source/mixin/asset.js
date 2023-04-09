// # Asset mixin
// The asset factories - [ImageAsset](../factory/imageAsset.html), [SpriteAsset](../factory/spriteAsset.html), and [VideoAsset](../factory/videoAsset.html) - are wrappers around images and videos which can either be pulled from the current document (DOM-based assets) or fetched from the server using an URL address.
// + Assets are used (consumed) by Picture entitys and Pattern styles.
// + This mixin adds functionality common to all three factories to them as part of their initialization.
// + The mixin is also used by the [Cell](../factory/cell.html) factory, as &lt;canvas> elements can be used by Picture entitys and Pattern styles as their image sources.

// Assets can be loaded into scrawl using dedicated import and create functions:
// + `scrawl.importImage`
// + `scrawl.importDomImage`
// + `scrawl.importDomVideo`
// + `scrawl.importVideo`
// + `scrawl.importMediaStream`
// + `scrawl.importSprite`
// + `scrawl.createImageFromCell`
// + `scrawl.createImageFromGroup`
// + `scrawl.createImageFromEntity`
//
// Assets will also be created when Picture entitys or Pattern styles are defined using a 'scrawl.make' function (`makePicture`, `makePattern`), or updated with the `set` function, where the _imageSource_, _videoSource_ or _spriteSource_ key in the argument object has been set to a valid URL path string.
//
// Be aware that __loading assets takes time!__ 
// + Performing a single render operation immediately after defining or updating a Picture entity or Pattern style will almost certainly fail to render the expected image/sprite/video in the canvas. 
// + The load functionality is asynchronous (using Promises). 
// + To display the resulting images in the canvas, it needs to be running an animation object (for instance, __scrawl.makeRender__) so that updates appear as soon as they have loaded, as part of the animation's Display cycle functionality.


// #### Imports
import { mergeOver, pushUnique, λnull, Ωempty } from '../core/utilities.js';

import { SOURCE, SOURCE_LOADED, SUBSCRIBERS } from '../core/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __sourceLoaded__ - A flag to indicate that the source image or video has completed sufficient loading (or streaming) to be usefully consumed by Picture entitys and Pattern styles.
// + __Note that this flag cannot be directly or indirectly set.__ The asset wrapper's functionality will handle the checking of load progress, and notify its subscribers that the load has completed as-and-when required.
        sourceLoaded: false,

// __source__ - A handle to the DOM element supplying the image - either an &lt;img>, &lt;video> or &lt;canvas> element.
// + Note that the ___Web Canvas API does not support___ using the &lt;picture> element as a legitimate image source. 
// + However most browsers allow the &lt;img> element to use __srcset__ and __sizes__ attributes, which will give them the same type of functionality as picture elements - for example to determine the most appropriately sized image file for the browser/device's viewport dimensions.
// + Asset wrappers will detect, and handle actions required, if/when a browser decides to download a new image file, to update the &lt;img> element with a more detailed image, for instance when the browser viewport changes its dimensions, or a device is rotated from portrait to landscape viewing.
// + The web Canvas API claims that __SVG__ images can be used as legitimate image sources for the canvas element. To make this happen, the SVG file needs to be set as the src attribute of an &lt;img> element, and the resulting image will be entirely static, and rasterized! 
// + For this reason, we don't recommend trying to use SVG files for canvas image sources; instead, the SVG can be included in a Scrawl-canvas display by adding it - as an &lt;svg> element - to a Scrawl-canvas stack (see Demo DOM-003 for an example of this approach).
// + &lt;img> elements using an animated GIF as their src are not supported.
// + ___Be aware that this attribute cannot be directly or indirectly set.___ Scrawl-canvas will update it as part of its asset loading and wrapper creation functionality.
        source: null,

// __subscribers__ - An Array containing the Picture entity and Pattern style Objects, who wish to use the asset as their source. 
// + Pictures and Patterns may subscribe to a maximum of ONE asset at any given time, though they may set/update that asset subscription to a different asset whenever required (which involves unsubscribing their existing asset).
// + ___Note that the contents of this Array cannot be directly or indirectly set.___ Picture entitys and Pattern styles will subscribe and unsubscribe to an asset as part of their source acquisition functionality (via the asset wrapper's __subscribe__ and __unsubscribe__ functions).
        subscribers: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
// Assets do not include their source images (or videos!) in their packet output. They do include the String name values of each of their subscribers.
    P.packetExclusions = pushUnique(P.packetExclusions, [SOURCE_LOADED, SOURCE, SUBSCRIBERS]);


    P.finalizePacketOut = function (copy, items) {

        if (this.subscribers && this.subscribers.length) {

            copy.subscribers = this.subscribers.map(sub => sub.name);
        }
        return copy;
    };


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
    P.kill = function (removeDomEntity = false) {

        if (removeDomEntity && this.source) this.source.remove();
        return this.deregister();
    };


// #### Get, Set, deltaSet
    const G = P.getters, 
        S = P.setters, 
        D = P.deltaSetters;


// __source__ - imageAsset.js and videoAsset.js overwrite this function, thus only put here so cell.js also gains the function - which I don't think it will ever need as cells ARE their own source.
    S.source = function (item) {

        if (item) {

            // No action required for Canvas objects as they don't have a source; they ARE the source!
            if (this.sourceLoaded) this.notifySubscribers();
        }
    };

// __subscribers__ - we disable the ability to set the subscribers Array directly. Picture entitys and Pattern styles will manage their subscription to the asset using their subscribe() and unsubscribe() functions.
    S.subscribers = λnull;


// #### Prototype functions

// `assetConstructor` - Common actions required by __imageAsset__, __spriteAsset__, and __videoAsset__ factories as part if their instance constructor work.
    P.assetConstructor = function (items) {

        this.makeName(items.name);
        this.register();
        this.subscribers = [];
        this.set(this.defs);
        this.set(items);

        if (items.subscribe) this.subscribers.push(items.subscribe);

        return this;
    };


// ##### Subscribe and unsubscribe to an asset
// `subscribe`
    P.subscribe = function (sub) {

        if (sub && sub.name) {

            const name = sub.name;

            if (this.subscribers.every(item => item.name !== name)) this.subscribeAction(sub);
        }
    };


// `subscribeAction` - separated out because cells handle things differently (they ARE the source)
    P.subscribeAction = function (sub) {

        if (sub) {

            this.subscribers.push(sub);
            sub.asset = this;
            sub.source = this.source;
            this.notifySubscriber(sub);
        }
    };

// `unsubscribe`
    P.unsubscribe = function (sub) {

        if (sub && sub.name) {

            const name = sub.name,
                index = this.subscribers.findIndex(item => item.name === name);

            if (index >= 0) {

                sub.source = null;
                sub.asset = null;
                sub.sourceNaturalHeight = 0;
                sub.sourceNaturalWidth = 0;
                sub.sourceLoaded = false;
                this.subscribers.splice(index, 1)
            }
        }
    };

// `notifySubscribers`, `notifySubscriber` - Subscriber notification in the asset factories will happen when something changes with the image. Changes vary across the different types of asset:
// + __imageAsset__ - needs to update its subscribers when an image completes loading - or, for &lt;img> sources with srcset (and sizes) attributes, when the image completes a reload of its source data.
// + __spriteAsset__ - will also update its subscribers each time it moves to a new sprite image frame, if the sprite is being animated
// + __videoAsset__ - will update its subscribers for every RAF tick while the video is playing, or if the video is halted and seeks to a different time in the video play stream.
// + __noiseAsset__ - will update its subscribers when any of its attributes changes (Note: factory/noiseAsset.js overwrites these functions).
// + __reactionDiffusionAsset__ - will update its subscribers when any of its attributes changes (Note: factory/reactionDiffusionAsset.js overwrites these functions).
//
// All notifications are push; the notification is achieved by setting various attributes and flags in each subscriber.
    P.notifySubscribers = function () {

        this.subscribers.forEach(sub => this.notifySubscriber(sub), this);
    };

    P.notifySubscriber = function (sub) {

        sub.sourceNaturalWidth = this.sourceNaturalWidth;
        sub.sourceNaturalHeight = this.sourceNaturalHeight;
        sub.sourceLoaded = this.sourceLoaded;
        sub.source = this.source;
        sub.dirtyImage = true;
        sub.dirtyCopyStart = true;
        sub.dirtyCopyDimensions = true;
        sub.dirtyImageSubscribers = true;
        sub.dirtyFilterIdentifier = true;
    };
};
