
// # Asset mixin

// The asset factories - __imageAsset__, __spriteAsset__, and __videoAsset__ - are wrappers around images and videos which can either be pulled from the current document (DOM-based assets) or fetched from the server using an URL address.

// Assets are used (consumed) by Picture entitys and Pattern styles.

// This mixin adds functionality common to all three factories to them as part of their initialization.

// The mixin is also used by the __cell__ factory, as &lt;canvas> elements can be used by Picture entitys and Pattern styles as their image sources.

// __TO BE AWARE:__ 

// + Assets can be loaded into scrawl using either a dedicated 'scrawl.import' function - __importImage__, __importDomImage__, __importDomVideo__, __importVideo__, __importMediaStream__, __importSprite__ - or 'scrawl.create' function () - __createImageFromCell__, __createImageFromGroup__, __createImageFromEntity__.

// + Assets will also be created when Picture entitys or Pattern styles are defined using a 'scrawl.make' function (__makePicture__, __makePattern__), or updated with the __.set()__ function, where the _imageSource_, _videoSource_ or _spriteSource_ key in the argument object has been set to a valid URL path string.

// + __Loading assets takes time!__ Performing a single render operation after defining or updating a Picture entity or Pattern style will almost certainly fail to render the expected image/sprite/video in the canvas. The load functionality is asynchronous (using Promises). To display the resulting images in the canvas, it needs to be running an animation object (for instance, __scrawl.makeRender__) so that updates appear as soon as they have loaded, as part of the animation's display cycle functionality.


// ## Imports
import { mergeOver, pushUnique, defaultNonReturnFunction } from '../core/utilities.js';

export default function (P = {}) {


// ## Define attributes

// All factories using the asset mixin will add these to their prototype objects
    let defaultAttributes = {


// A flag to indicate that the source image or video has completed sufficient loading (or streaming) to be usefully consumed by Picture entitys and Pattern styles.

// __Note that this flag cannot be directly or indirectly set.__ The asset wrapper's functionality will handle the checking of load progress, and notify its subscribers that the load has completed as-and-when required.
        sourceLoaded: false,


// A handle to the DOM element supplying the image - either an &lt;img>, &lt;video> or &lt;canvas> element.

// Note that the __web Canvas API does not support__ using the &lt;picture> element as a legitimate image source. However most browsers allow the &lt;img> element to use __srcset__ and __sizes__ attributes, which will give them the same type of functionality as picture elements - for example to determine the most appropriately sized image file for the browser/device's viewport dimensions.

// Asset wrappers will detect, and handle actions required, if/when a browser decides to download a new image file, to update the &lt;img> element with a more detailed image, for instance when the browser viewport changes its dimensions, or a device is rotated from portrait to landscape viewing.

// The web Canvas API claims that __SVG__ images can be used as legitimate image sources for the canvas element. To make this happen, the SVG file needs to be set as the src attribute of an &lt;img> element, and the resulting image will be entirely static, and rasterized! For this reason, we don't recommend trying to use SVG files for canvas image sources; instead, the SVG can be included in a Scrawl-canvas display by adding it - as an &lt;svg> element - to a Scrawl-canvas stack (see Demo DOM-003 for an example of this approach).

// __Note that this attribute cannot be directly or indirectly set.__ Scrawl-canvas will update it as part of its asset loading and wrapper creation functionality.
        source: null,


// An Array containing the Picture entity and Pattern style Objects, who wish to use the asset as their source. Pictures and Patterns may subscribe to a maximum of ONE asset at any given time, though they may set/update that asset subscription to a different asset whenever required (which involves unsubscribing their existing asset).

// __Note that the contents of this Array cannot be directly or indirectly set.__ Picture entitys and Pattern styles will subscribe and unsubscribe to an asset as part of their source acquisition functionality (via the asset wrapper's __subscribe__ and __unsubscribe__ functions).
        subscribers: null,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// ## Packet management
    P.packetExclusions = pushUnique(P.packetExclusions, ['sourceLoaded', 'source', 'subscribers']);


// Assets do not include their source images (or videos!) in their packet output. They do include the String name values of each of their subscribers.
    P.finalizePacketOut = function (copy, items) {

        if (this.subscribers && this.subscribers.length) {

            copy.subscribers = this.subscribers.map(sub => sub.name);
        }
        return copy;
    };


// ## Define getter, setter and deltaSetter functions
    let G = P.getters, 
        S = P.setters, 
        D = P.deltaSetters;


// imageAsset.js and videoAsset.js overwrite this function, thus only put here so cell.js also gains the function - which I don't think it will ever need as cells ARE their own source.
    S.source = function (item = {}) {

        if (item) {

            // No action required for Canvas objects as they don't have a source; they ARE the source!
            if (this.sourceLoaded) this.notifySubscribers();
        }
    };


// Disable the ability to set the subscribers Array directly.

// Picture entitys and Pattern styles will manage their subscription to the asset using their subscribe() and unsubscribe() functions.
    S.subscribers = defaultNonReturnFunction;


// ## Define functions to be added to the factory prototype



// Common actions required by __imageAsset__, __spriteAsset__, and __videoAsset__ factories as part if their instance constructor work.
    P.assetConstructor = function (items = {}) {

        this.makeName(items.name);
        this.register();
        this.subscribers = [];
        this.set(this.defs);
        this.set(items);

        if (items.subscribe) this.subscribers.push(items.subscribe);

        return this;
    };


// TODO 
// - work out whether, and how, we get rid of an asset wrapper. 
// - if we get rid of the wrapper, do we also get rid of the source element?

// This functionality disabled at the moment, both here and in the asset factories (except cell)


// Subscriber notification in the asset factories will happen when something changes with the image. Changes vary across the different types of asset:

// + imageAsset - needs to update its subscribers when an image completes loading - or, for &lt;img> sources with srcset (and sizes) attributes, when the image completes a reload of its source data.

// + spriteAsset - will also update its subscribers each time it moves to a new sprite image frame, if the sprite is being animated

// + videoAsset - will update its subscribers for every RAF tick while the video is playing, or if the video is halted and seeks to a different time in the video play stream.

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
    };


// The subscribe/unsubscribe functions.

// TODO: 
// + during kill/dismantle activity, Picture entitys and Pattern styles MUST remove themselves from their current asset's subscribers Array; failure to do so may lead to errors when the asset attempts to update an object that no longer exists, except as a reference to the subscriber Object in the subscribers Array.

// + failure to remove the killed entity/style will also lead to library bloat and memory issues.

// Thus: make sure that all asset wrappers are properly unsubscribing from assets when they suicide.
    P.subscribe = function (sub = {}) {

        if (sub && sub.name) {

            let name = sub.name;

            if (this.subscribers.every(item => item.name !== name)) this.subscribeAction(sub);
        }
    };


// Separated out because cells handle things differently (they ARE the source)
    P.subscribeAction = function (sub = {}) {

        this.subscribers.push(sub);
        sub.asset = this;
        sub.source = this.source;
        this.notifySubscriber(sub);
    };

    P.unsubscribe = function (sub = {}) {

        if (sub.name) {

            let name = sub.name,
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

// Return the prototype
    return P;
};
