// # VideoAsset factory
// The factory generates wrapper Objects around &lt;video> elements which can either be pulled from the current document (DOM-based assets) or fetched from the server using an URL address.
//
// Scrawl-canvas can also create VideoAssets from the Web API [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) interface - ___this is an experimental feature___.
//
// VideoAssets are used by [Picture](./picture.html) and [Grid](./grid.html) entitys, and [Pattern](./pattern.html) styles (though not recommended).


// #### Demos:
// + [Canvas-010](../../demo/canvas-010.html) - Use video sources and media streams for Picture entitys
// + [Canvas-023](../../demo/canvas-023.html) - Grid entity - using picture-based assets (image, video, sprite)


// #### Imports
import { constructors } from '../core/library.js';

import { 
    doCreate,
    generateUniqueString, 
    xt, 
    λthis, 
    λnull, 
    Ωempty, 
} from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

import { 
    _freeze,
    _isArray,
    ASSET_IMPORT_REGEX,
} from '../core/shared-vars.js';


// Local constants
const _VIDEO = 'VIDEO',
    ANONYMOUS = 'anonymous',
    ASSET = 'asset',
    AUTO = 'auto',
    BLOCK = 'block',
    MAYBE = 'maybe',
    NONE = 'none',
    SOURCE = 'source',
    T_VIDEO = 'Video',
    VIDEO = 'video',
    ZERO_STR = '';

// `gettableVideoAssetAtributes`, `settableVideoAssetAtributes` - exported Arrays.
// + TODO - I was planning to make the &lt;video> element's attributes accessible to Picture entitys and Pattern styles - need to check if work has been completed at their end.
export const gettableVideoAssetAtributes = _freeze([
    'video_audioTracks',
    'video_autoPlay',
    'video_buffered',
    'video_controller',
    'video_controls',
    'video_controlsList',
    'video_crossOrigin',
    'video_currentSrc',
    'video_currentTime',
    'video_defaultMuted',
    'video_defaultPlaybackRate',
    'video_disableRemotePlayback',
    'video_duration',
    'video_ended',
    'video_error',
    'video_loop',
    'video_mediaGroup',
    'video_mediaKeys',
    'video_muted',
    'video_networkState',
    'video_paused',
    'video_playbackRate',
    'video_readyState',
    'video_seekable',
    'video_seeking',
    'video_sinkId',
    'video_src',
    'video_srcObject',
    'video_textTracks',
    'video_videoTracks',
    'video_volume',
]);

export const settableVideoAssetAtributes = _freeze([
    'video_autoPlay',
    'video_controller',
    'video_controls',
    'video_crossOrigin',
    'video_currentTime',
    'video_defaultMuted',
    'video_defaultPlaybackRate',
    'video_disableRemotePlayback',
    'video_loop',
    'video_mediaGroup',
    'video_muted',
    'video_playbackRate',
    'video_src',
    'video_srcObject',
    'video_volume',
]);


// #### VideoAsset constructor
const VideoAsset = function (items = Ωempty) {

    return this.assetConstructor(items);
};


// #### VideoAsset prototype
const P = VideoAsset.prototype = doCreate();
P.type = T_VIDEO;
P.lib = ASSET;
P.isArtefact = false;
P.isAsset = true;


// #### Mixins
baseMix(P);
assetMix(P);



// #### VideoAsset attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [asset mixin](../mixin/asset.html): __source, subscribers__.
//
// No additional attributes required beyond those supplied by the mixins


// #### Packet management
// Assets do not take part in the packet or clone systems; they can, however, be used for importing and actioning packets as they retain those base functions
P.saveAsPacket = function () {

    return [this.name, this.type, this.lib, {}];
};
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;


// #### Clone management
P.clone = λthis;


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
const G = P.getters,
    S = P.setters,
    D = P.deltaSetters;


// __source__
S.source = function (item) {

    if (item) {

        if (item.tagName.toUpperCase() == _VIDEO) {

            this.source = item;
            this.sourceNaturalWidth = item.videoWidth || 0;
            this.sourceNaturalHeight = item.videoHeight || 0;
            this.sourceLoaded = (item.readyState > 2) ? true : false;
        }

        if (this.sourceLoaded) this.notifySubscribers();
    }
};


// #### Prototype functions

// `checkSource`
// + Gets invoked by subscribers (who have a handle to the asset instance object) as part of the display cycle.
// + If any of the source &lt;video> element's relevant attributes have changed, the asset wrapper will immediately notify/update ALL of its subscribers by changing attributes on their objects.
// + TODO: there may be a more efficient way of doing this? If the first subscriber triggers a notify action, which propagates to all subscribers, then subsequent subscribers don't need to invoke this function for the remainder of this display cycle.
P.checkSource = function (width, height) {

    const source = this.source;

    if (source && source.readyState > 2) {

        this.sourceLoaded = true;

        if (this.sourceNaturalWidth !== source.videoWidth || 
                this.sourceNaturalHeight !== source.videoHeight || 
                this.sourceNaturalWidth !== width ||
                this.sourceNaturalHeight !== height) {

            this.sourceNaturalWidth = source.videoWidth;
            this.sourceNaturalHeight = source.videoHeight;

            this.notifySubscribers();
        }
    }
    else this.sourceLoaded = false;
};


// #### Managing video sources
// The following functions invoke their [namesake functions on the source &lt;video> element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement). 
// + Note that some of the functions are defined as being asynchronous; for these functions, we wrap the invocations in Promises which cascade back to the original invocation (probably in user code).
// + All of these functions are also mapped onto the factories which consume the videoAsset - Picture entitys and Pattern styles - so they can be invoked on those objects instead on the videoAsset instance.

// `addTextTrack`
P.addTextTrack = function (kind, label, language) {

    const source = this.source;

    if (source && source.addTextTrack) source.addTextTrack(kind, label, language);
};

// `captureStream`
P.captureStream = function () {

    const source = this.source;

    if (source && source.captureStream) return source.captureStream();
    else return false;
};

// `canPlayType`
P.canPlayType = function (mytype) {

    const source = this.source;

    if (source) return source.canPlayType(mytype);
    else return MAYBE;
};

// `fastSeek`
P.fastSeek = function (time) {

    const source = this.source;

    if (source && source.fastSeek) source.fastSeek(time);
};

// `load`
P.load = function () {

    const source = this.source;

    if (source) source.load();
};

// `pause`
P.pause = function () {

    const source = this.source;

    if (source) source.pause();
};

// `play`
P.play = function () {

    const source = this.source;

    if (source) return source.play().catch((e) => console.log(e.code, e.name, e.message));
    else return Promise.reject('Source not defined');
};

// `setMediaKeys`
P.setMediaKeys = function (keys) {

    const source = this.source;

    if (source) {

        if (source.setMediaKeys) return source.setMediaKeys(keys);
        else return Promise.reject('setMediaKeys not supported');
    }
    else return Promise.reject('Source not defined');
};

// `setSinkId`
P.setSinkId = function () {

    const source = this.source;

    if (source) {

        if (source.setSinkId) return source.setSinkId();
        else return Promise.reject('setSinkId not supported');
    }
    else return Promise.reject('Source not defined');
};



// #### Import videos

// `importDomVideo` - import videos defined in the web page HTML code
// + Required argument is a query string used to search the dom for matching elements
// + Scrawl-canvas does not remove &lt;video> elements from the DOM.
// + If &lt;video> elements should not appear, developers need to hide them in some way - for instance by positioning them (or their parent element) absolutely to the top or left of the display; or by giving their parent element zero width/height; or by setting their CSS: `display: none;`, `opacity: 0;`, etc.
export const importDomVideo = function (query) {

    const items = document.querySelectorAll(query);

    items.forEach(item => {

        let name;

        if (item.tagName.toUpperCase() == _VIDEO) {

            if (item.id || item.name) name = item.id || item.name;
            else {

                const match = ASSET_IMPORT_REGEX.exec(item.src);
                name = (match && match[1]) ? match[1] : ZERO_STR;
            }

            const vid = makeVideoAsset({
                name: name,
                source: item,
            });

            if (item.readyState <= 2) {

                item.oncanplay = () => {

                    vid.set({
                        source: item,
                    });
                };
            }
        }
    });
};


// `importMediaStream` - __Warning: experimental!__
// + This function will attempt to link a mediaStream - for instance from a device's camera - to an offscreen &lt;video> element, which then gets wrapped in a videoAsset instance which can be displayed in a canvas via a Picture entity (or even a Pattern style).
// + TODO - extend functionality so users can manipulate the mediaStream via the Picture entity using it as its asset
export const importMediaStream = function (items = Ωempty) {

    // Setup the constraints object with user-supplied data in the items argument
    let constraints = {};

    // For proof-of-concept, only interested in wheter to include or exclude audio in the capture
    constraints.audio = (xt(items.audio)) ? items.audio : true;

    // For video, limiting functionality to accepting user values for video width and height (as minDIMENSION, maxDIMENSION and the ideal DIMENSION, and a preference for which camera to use - where applicable
    constraints.video = {};
    
    let width = constraints.video.width = {};
    if (items.minWidth) width.min = items.minWidth;
    if (items.maxWidth) width.max = items.maxWidth;
    width.ideal = (items.width) ? items.width : 1280;
    
    let height = constraints.video.height = {};
    if (items.minHeight) height.min = items.minHeight;
    if (items.maxHeight) height.max = items.maxHeight;
    height.ideal = (items.height) ? items.height : 720;

    // For mobile devices etc - values can be 'user' or 'environment'
    if (items.facing) constraints.video.facingMode = items.facing;
    
    // We need a video element to receive the media stream
    let name = items.name || generateUniqueString();

    let el = document.createElement(VIDEO);

    let vid = makeVideoAsset({
        name: name,
        source: el,
    });

    return new Promise((resolve, reject) => {

        if (navigator && navigator.mediaDevices) {

            navigator.mediaDevices.getUserMedia(constraints)
            .then(mediaStream => {

                let actuals = mediaStream.getVideoTracks(),
                    data;

                if (_isArray(actuals) && actuals[0]) data = actuals[0].getConstraints();

                el.id = vid.name;

                if (data) {

                    el.width = data.width;
                    el.height = data.height;
                }

                el.srcObject = mediaStream;

                el.onloadedmetadata = function (e) {

                    el.play();
                }

                resolve(vid);
            })
            .catch (err => {

                console.log(err.message);
                resolve(vid);
            });
        }
        else reject('Navigator.mediaDevices object not found');
    });
};


// `importVideo` - load videos from a remote server and create assets from them
//
// Arguments can be a comma-separated list of String urls. For example, for a video link at server url `http://www.example.com/path/to/image/flower.mp4`:
// + Will attempt to give the new VideoAsset object, and video element, a name/id value of eg 'flower' (but not guaranteed)
// + Will not add the new video element to the DOM
//
// Alternatively, the arguments can include an object with the following attributes:
// + __name__ string.
// + __src__ url string.
// + __parent__ CSS search string - if set, Scrawl-canvas will attempt to append the new img element to the corresponding DOM element.
// + __isVisible__ boolean - if true, and new img element has been added to DOM, make that image visible; default is false.
// + __className__ string - list of classes to be added to the new img element.
//
// Note: strings and object arguments can be mixed - Scrawl-canvas will interrrogate each argument in turn and take appropriate action to load the assets.
//
// ___Using videos from 3rd Party cloud servers___ - for example, YouTube. DON'T. Services such as YouTube generally require users to embed videos into web pages using their video player technology. This is so page visitors can be served adverts and recommended videos, etc. Attempts to circumvent this functionality will often break the 3rd Party's _Terms of Service_.
// + This advice does not apply to developers who want to include a 3rd Party video player DOM element in a Scrawl-canvas Stack environment. If that meets your requirements, go for it!
export const importVideo = function (...args) {

    let result = ZERO_STR;

    if (args.length) {

        let name, className, visibility, parent, sources, preload;

        let flag = false;

        const firstArg = args[0];

        // one or more string urls has been passed to the function
        // - urls will be treated as &lt;source> elements assigned to a &lt;video> element
        if (firstArg.substring) {

            const match = ASSET_IMPORT_REGEX.exec(firstArg);
            name = (match && match[1]) ? match[1] : ZERO_STR;

            sources = [...args];
            className = ZERO_STR;
            visibility = false;
            parent = null;
            preload = AUTO;

            flag = true;
        }

        // a single object has been passed to the function
        // - only process if the object includes a src attribute
        else if (firstArg && firstArg.src) {

            name = firstArg.name || ZERO_STR;

            sources = [...firstArg.src];
            className = firstArg.className || ZERO_STR;
            visibility = firstArg.visibility || false;
            parent = document.querySelector(parent);
            preload = firstArg.preload || AUTO;

            flag = true;
        }

        // build the video element
        const video = makeVideoAsset({
            name: name,
        });

        if (flag) {

            const vid = document.createElement(VIDEO);

            vid.name = name;
            vid.className = className;

            vid.style.display = (visibility) ? BLOCK : NONE;

            vid.crossOrigin = ANONYMOUS;

            vid.preload = preload;

            sources.forEach(item => {

                const el = document.createElement(SOURCE);

                el.src = item;

                vid.appendChild(el);
            });

            vid.onload = () => {

                video.set({
                    source: vid,
                });

                if (parent) parent.appendChild(vid);
            };

            video.set({
                source: vid,
            });

            result = name;
        }
    }

    return result;
};


// #### Factory
export const makeVideoAsset = function (items) {

    if (!items) return false;
    return new VideoAsset(items);
};

constructors.VideoAsset = VideoAsset;
