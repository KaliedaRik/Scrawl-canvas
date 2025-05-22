// # VideoAsset factory
// The factory generates wrapper Objects around &lt;video> elements which can either be pulled from the current document (DOM-based assets) or fetched from the server using an URL address.
//
// Scrawl-canvas can also create VideoAssets from the Web API [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) and [Screen Capture](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API) interfaces.


// #### Imports
import { constructors } from '../core/library.js';

import { doCreate, generateUniqueString, mergeOver, λcloneError, λnull, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

// Shared constants
import { _isArray, ANONYMOUS, ASSET, ASSET_IMPORT_REGEX, AUTO, BLOCK, NONE, SOURCE, T_VIDEO, VIDEO, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const _VIDEO = 'VIDEO',
    MAYBE = 'maybe';

// `gettableVideoAssetAtributes`, `settableVideoAssetAtributes` - exported Arrays.
// + TODO - I was planning to make the &lt;video> element's attributes accessible to Picture entitys and Pattern styles - need to check if work has been completed at their end.
export const gettableVideoAssetAtributes = [
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
];

export const settableVideoAssetAtributes = [
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
];


// #### VideoAsset constructor
const VideoAsset = function (items = Ωempty) {

    this.makeName(items.name);
    this.register();
    this.subscribers = [];
    this.set(this.defs);

    this.source = null;
    this.currentSrc = null;
    this.currentFile = null;
    this.sourceNaturalWidth = 0;
    this.sourceNaturalHeight = 0;

    this.onMediaStreamEnd = λnull;
    this.isAudioOnly = false;

    this.set(items);

    if (items.subscribe) this.subscribers.push(items.subscribe);

    return this;
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
const defaultAttributes = {
    mediaStream: null,
    mediaStreamTrack: null,
    onMediaStreamEnd: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// Assets do not take part in the packet or clone systems; they can, however, be used for importing and actioning packets as they retain those base functions
P.saveAsPacket = function () {

    return [this.name, this.type, this.lib, {}];
};
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;


// #### Clone management
P.clone = λcloneError;


// #### Kill management
P.kill = function (removeDomEntity = false) {

    if (removeDomEntity && this.source) this.source.remove();

    if (this.mediaStream && this.mediaStreamTrack && this.mediaStream.active) {

        this.mediaStream.removeTrack(this.mediaStreamTrack);
    }

    return this.deregister();
};


// #### Get, Set, deltaSet
const S = P.setters;


// __source__
S.source = function (item) {

    if (item) {

        if (item.tagName.toUpperCase() === _VIDEO) {

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

        if (item.tagName.toUpperCase() === _VIDEO) {

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
export const importMediaStream = function (items = Ωempty) {

    // Setup the constraints object with user-supplied data in the items argument
    const constraints = {};

    constraints.audio = (items.audio != null) ? items.audio : false;
    constraints.video = (items.video != null) ? items.video : false;

    // We need a video element to receive the media stream
    const name = items.name || generateUniqueString();

    const el = document.createElement(VIDEO);

    const vid = makeVideoAsset({
        name: name,
        source: el,
        onMediaStreamEnd: items.onMediaStreamEnd || λnull,
    });

    if (!constraints.video) vid.isAudioOnly = true;

    return new Promise((resolve, reject) => {

        if (navigator && navigator.mediaDevices) {

            navigator.mediaDevices.getUserMedia(constraints)
            .then(mediaStream => {

                vid.mediaStream = mediaStream;

                // For audio-only video
                if (vid.isAudioOnly) {

                    const actuals = mediaStream.getAudioTracks();

                    if (_isArray(actuals) && actuals[0]) {

                        vid.mediaStreamTrack = actuals[0];
                        vid.mediaStreamTrack.addEventListener("ended", vid.onMediaStreamEnd);
                    }
                }

                // For video-only video
                else {

                    const actuals = mediaStream.getVideoTracks();
                    let data;

                    if (_isArray(actuals) && actuals[0]) {

                        data = actuals[0].getConstraints();
                        vid.mediaStreamTrack = actuals[0];
                        vid.mediaStreamTrack.addEventListener("ended", vid.onMediaStreamEnd);
                    }
                    el.id = vid.name;

                    if (data) {

                        el.width = data.width;
                        el.height = data.height;
                    }

                    el.srcObject = mediaStream;

                    el.onloadedmetadata = function () { el.play(); }
                }
                resolve(vid);
            })
            .catch (err => {

                console.log(err);
                resolve(vid);
            });
        }
        else reject('Navigator.mediaDevices object not found');
    });
};

// `importScreenCapture` - __Warning: experimental!__
//
// This function will attempt to link a screen capture stream to an offscreen &lt;video> element, which then gets wrapped in a videoAsset instance which can be displayed in a canvas via a Picture entity (or even a Pattern style).

// It takes an object argument with the following (optional) attributes - see the [MDN getDisplayMedia page](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) for details. Defaults are as follows:
// ```
// {
//     video: {
//         displaySurface: "browser",
//     },
//     audio: {
//         suppressLocalAudioPlayback: false,
//     },
//     preferCurrentTab: false,
//     selfBrowserSurface: "exclude",
//     systemAudio: "include",
//     surfaceSwitching: "include",
//     monitorTypeSurfaces: "include",
// }
// ```
export const importScreenCapture = function (items = Ωempty) {

    // Setup the default displayMediaOptions object - attributes will be overwritten by user-supplied data in the items argument
    const displayMediaOptions = {
        video: {
            displaySurface: "browser",
        },
        audio: {
            suppressLocalAudioPlayback: false,
        },
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        systemAudio: "include",
        surfaceSwitching: "include",
        monitorTypeSurfaces: "include",
    };

    // We need a video element to receive the media stream
    const name = items.name || generateUniqueString();

    const el = document.createElement(VIDEO);

    const vid = makeVideoAsset({
        name: name,
        source: el,
        onMediaStreamEnd: items.onMediaStreamEnd || λnull,
    });

    return new Promise((resolve, reject) => {

        if (navigator && navigator.mediaDevices) {

            navigator.mediaDevices.getDisplayMedia({
                ...displayMediaOptions,
                ...items,
            })
            .then(mediaStream => {

                vid.mediaStream = mediaStream;

                const actuals = mediaStream.getVideoTracks();

                let data;

                if (_isArray(actuals) && actuals[0]) {

                    data = actuals[0].getConstraints();
                    vid.mediaStreamTrack = actuals[0];
                    vid.mediaStreamTrack.addEventListener("ended", vid.onMediaStreamEnd);
                }

                el.id = vid.name;

                if (data) {

                    el.width = data.width;
                    el.height = data.height;
                }

                el.srcObject = mediaStream;

                el.onloadedmetadata = function () {

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


// #### Factory (not exported)
const makeVideoAsset = function (items) {

    if (!items) return false;
    return new VideoAsset(items);
};

constructors.VideoAsset = VideoAsset;
