// # Asset consumer mixin
// This mixin needs to be applied to any factory which wishes to use an asset. Asset objects are wrappers for managing &lt;img>, &lt;video> and (offscreen) &lt;canvas> elements.
//
// Currently only [Picture](../factory/picture.html) entity and [Pattern](../factory/pattern.html) style factories use assets. This mixin defines attributes and functionality common to both.


// #### Imports
import { mergeOver, xt, Ωempty } from '../helper/utilities.js';

import { asset } from '../core/library.js';

import { _now } from '../helper/shared-vars.js';

import { importImage } from '../factory/image-asset.js';
import { importVideo } from '../factory/video-asset.js';
import { importSprite } from '../factory/sprite-asset.js';

import { ADD_TEXT_TRACK, CAN_PLAY_TYPE, CAPTURE_STREAM, DEFAULT, FAST_SEEK, LOAD, PAUSE, PLAY, SET_MEDIA_KEYS, SET_SINK_ID, T_SPRITE, T_VIDEO } from '../helper/shared-vars.js';


// #### Export function
export default function (P = Ωempty) {


// #### Shared attributes
    const defaultAttributes = {

// __asset__ - eventually becomes the current asset wrapper object (as generated by the `imageAsset`, `spriteAsset` and `videoAsset` factories).
        asset: null,


// __removeAssetOnKill__ - A flag that determines whether, when the entity object is killed (has its `kill` function invoked), the kill functionality should cascade to the asset object.
// + `false` (default) - do not cascade the kill action
// + any value that is not false - remove the asset wrapper object
// + value is a truthy String - for example, `'dom'` - also remove the underlying asset element from the DOM
        removeAssetOnKill: false,


// ##### Spritesheet-specific attributes
        spriteIsRunning: false,
        spriteLastFrameChange: 0,
        spriteCurrentFrame: 0,
        spriteTrack: DEFAULT,
        spriteForward: true,
        spriteFrameDuration: 100,
        spriteWillLoop: true,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);

// #### Packet management
// No additional packet functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
    const G = P.getters,
        S = P.setters;

    G.sourceDimensions = function () {

        return [this.sourceNaturalWidth, this.sourceNaturalHeight];
    };

// __asset__ - Setting the Asset object. Updating the asset will set the dirtyAsset flag.
    S.asset = function (item) {

        const oldAsset = this.asset,
            newAsset = (item && item.name) ? item.name : item;

        if (oldAsset && !oldAsset.substring) oldAsset.unsubscribe(this);

        this.asset = newAsset;
        this.dirtyAsset = true;
    };

// ##### Setting the source
// Argument needs to be a path/file String that will be used to import the new Image, Video or Sprite file and construct an appropriate Asset object wrapper for it.

// __imageSource__
    S.imageSource = function (item) {

        const results = importImage(item);

        if (results) {

            const myAsset = asset[results[0]];

            if (myAsset) {

                const oldAsset = this.asset;

                if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);

                myAsset.subscribe(this);
            }
        }
    };

// __videoSource__
    S.videoSource = function (item) {

        const result = importVideo(item);

        if (result) {

            const myAsset = asset[result];

            if (myAsset) {

                const oldAsset = this.asset;

                if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);

                myAsset.subscribe(this);
            }
        }
    };

// __spriteSource__
    S.spriteSource = function (item) {

        const result = importSprite(item);

        if (result) {

            const myAsset = asset[result];

            if (myAsset) {

                const oldAsset = this.asset;

                if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);

                myAsset.subscribe(this);
            }
        }
    };


// #### Prototype functions

// `cleanAsset` - Cleaning the Asset object
    P.cleanAsset = function () {

        const ast = this.asset;

        if (ast && ast.substring) {

            const myAsset = asset[ast];

            if (myAsset) {

                this.dirtyAsset = false;
                myAsset.subscribe(this);
            }
        }
    };


// ##### Video actions
// These functions largely map to a selection of the asset's source &lt;video> element's [functions](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement). They allow the video to be controlled/coded by invoking the appropriate function on the Picture entity or Pattern style instance, rather than having to seek out the asset wrapper object to invoke the functions on them.

// `videoAction` - internal helper function
    P.videoAction = function (action, ...args) {

        const myAsset = this.asset;

        if (myAsset && myAsset.type == T_VIDEO) return myAsset[action](...args);
    };

// `videoPromiseAction` - internal helper function
    P.videoPromiseAction = function (action, ...args) {

        const myAsset = this.asset;

        if (myAsset && myAsset.type == T_VIDEO) return myAsset[action](...args);
        else return Promise.reject('Asset not a video');
    };

// `videoAddTextTrack`
    P.videoAddTextTrack = function (kind, label, language) {
        return this.videoAction(ADD_TEXT_TRACK, kind, label, language);
    };

// `videoCaptureStream`
    P.videoCaptureStream = function () {
        return this.videoAction(CAPTURE_STREAM);
    };

// `videoCanPlayType`
    P.videoCanPlayType = function (mytype) {
        return this.videoAction(CAN_PLAY_TYPE, mytype);
    };

// `videoFastSeek`
    P.videoFastSeek = function (time) {
        return this.videoAction(FAST_SEEK, time);
    };

// `videoLoad`
    P.videoLoad = function () {
        return this.videoAction(LOAD);
    };

// `videoPause`
    P.videoPause = function () {
        return this.videoAction(PAUSE);
    };

// `videoPlay`
    P.videoPlay = function () {
        return this.videoPromiseAction(PLAY);
    };

// `videoSetMediaKeys`
    P.videoSetMediaKeys = function (keys) {
        return this.videoPromiseAction(SET_MEDIA_KEYS, keys);
    };

// `videoSetSinkId`
    P.videoSetSinkId = function () {
        return this.videoPromiseAction(SET_SINK_ID);
    };


// ##### Sprite actions
// Add functions to the Picture entity or Pattern style factories which can be used to control image sprite animation playback.

// `checkSpriteFrame`
    P.checkSpriteFrame = function () {

        const asset = this.asset;

        if (asset && asset.type == T_SPRITE && asset.manifest) {

            const copyArray = this.copyArray;

            if (this.spriteIsRunning) {

                const last = this.spriteLastFrameChange,
                    choke = this.spriteFrameDuration,
                    now = _now();

                if (now > last + choke) {

                    const manifest = asset.manifest;

                    if (manifest) {

                        const track = manifest[this.spriteTrack],
                            len = track.length,
                            loop = this.spriteWillLoop;

                        let frame = this.spriteCurrentFrame;

                        frame = (this.spriteForward) ? frame + 1 : frame - 1;

                        if (frame < 0) frame = (loop) ? len - 1 : 0;
                        if (frame >= len) frame = (loop) ? 0 : len - 1;

                        const [source, x, y, w, h] = track[frame];

                        copyArray.length = 0;
                        copyArray.push(x, y, w, h);

                        this.dirtyCopyStart = false;
                        this.dirtyCopyDimensions = false;

                        const sourceName = this.source.id || this.source.name;

                        if (source != sourceName) {

                            const newSource = asset.sourceHold[source];

                            if (newSource) this.source = newSource;
                        }

                        this.spriteCurrentFrame = frame;
                        this.spriteLastFrameChange = now;
                    }
                }
            }
            else {

                const [, x, y, w, h] = asset.manifest[this.spriteTrack][this.spriteCurrentFrame],
                    [cx, cy, cw, ch] = copyArray;

                if (cx != x || cy != y || cw != w || ch != h) {

                    copyArray.length = 0;
                    copyArray.push(x, y, w, h);

                    this.dirtyCopyStart = false;
                    this.dirtyCopyDimensions = false;
                }
            }
        }
    };

// `playSprite`
    P.playSprite = function (speed, loop, track, forward, frame) {

        if (xt(speed)) this.spriteFrameDuration = speed;
        if (xt(loop)) this.spriteWillLoop = loop;
        if (xt(track)) this.spriteTrack = track;
        if (xt(forward)) this.spriteForward = forward;
        if (xt(frame)) this.spriteCurrentFrame = frame;

        this.spriteLastFrameChange = _now();
        this.spriteIsRunning = true;
    }

// `haltSprite`
    P.haltSprite = function (speed, loop, track, forward, frame) {

        if (xt(speed)) this.spriteFrameDuration = speed;
        if (xt(loop)) this.spriteWillLoop = loop;
        if (xt(track)) this.spriteTrack = track;
        if (xt(forward)) this.spriteForward = forward;
        if (xt(frame)) this.spriteCurrentFrame = frame;

        this.spriteIsRunning = false;
    }
}
