/*
# Asset consumer mixin
*/
import { mergeOver, xt } from '../core/utilities.js';
import { assetnames, asset } from '../core/library.js';

import { importImage } from '../factory/imageAsset.js';
import { importVideo } from '../factory/videoAsset.js';
import { importSprite } from '../factory/spriteAsset.js';

export default function (P = {}) {

/*
## Define attributes

All factories using the position mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*
Handle to the appropriate Asset object
*/
		asset: null,

/*
Set internally - handle to the DOM object which acts as the Asset object's source (tagName: IMG, VIDEO, CANVAS)
*/
		source: null,

/*
Source natural dimensions
*/
		sourceNaturalWidth: 0,
		sourceNaturalHeight: 0,

/*
Flag indicating that the Asset file(s) has successfully loaded
*/
		sourceLoaded: false,

/*
Sprite-specific attributes - set internally
*/
		spriteIsRunning: false,
		spriteLastFrameChange: 0,
		spriteCurrentFrame: 0,
		spriteTrack: 'default',
		// spriteTrackLength: 0,
		spriteForward: true,
		spriteFrameDuration: 100,
		spriteWillLoop: true, 
	};
	P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let S = P.setters;

/*
Setting the Asset object
*/
	S.asset = function (item) {

		let oldAsset = this.asset,
			newAsset = (item && item.name) ? item.name : item;

		if (oldAsset && !oldAsset.substring) {

			if (oldAsset.name !== newAsset) oldAsset.unsubscribe(this);
		}

		this.asset = newAsset;
		this.dirtyAsset = true;
	};

/*
Cleaning the Asset object
*/
	P.cleanAsset = function () {

		let ast = this.asset;

		if (ast && ast.substring) {

			let myAsset = asset[ast];

			if (myAsset) {

				this.dirtyAsset = false;
				myAsset.subscribe(this);
			}
		}
	};

/*
Setting the source - argument 'item' needs to be a path/file string that will be used to import the new Image, Video or Sprite file and construct an appropriate Asset object wrapper for it.
*/
	S.imageSource = function (item) {

		let results = importImage(item);

		if (results) {

			let myAsset = asset[results[0]];

			if (myAsset) {

				let oldAsset = this.asset;

				if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
			
				myAsset.subscribe(this);
			}
		}
	};

	S.videoSource = function (item) {

		let result = importVideo(item);

		if (result) {

			let myAsset = asset[result];

			if (myAsset) {

				let oldAsset = this.asset;

				if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
			
				myAsset.subscribe(this);
			}
		}
	};

	S.spriteSource = function (item) {

		let result = importSprite(item);

		if (result) {

			let myAsset = asset[result];

			if (myAsset) {

				let oldAsset = this.asset;

				if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
			
				myAsset.subscribe(this);
			}
		}
	};

/*
Video actions
*/
	P.videoAction = function (action, ...args) {

		let myAsset = this.asset;

		if (myAsset && myAsset.type === 'Video') return myAsset[action](...args);
	};

	P.videoPromiseAction = function (action, ...args) {

		let myAsset = this.asset;

		if (myAsset && myAsset.type === 'Video') return myAsset[action](...args);
		else return Promise.reject('Asset not a video');
	};

	P.videoAddTextTrack = function (kind, label, language) {
		return this.videoAction('addTextTrack', kind, label, language);
	};

	P.videoCaptureStream = function () {
		return this.videoAction('captureStream');
	};

	P.videoCanPlayType = function (mytype) {
		return this.videoAction('canPlayType', mytype);
	};

	P.videoFastSeek = function (time) {
		return this.videoAction('fastSeek', time);
	};

	P.videoLoad = function () {
		return this.videoAction('load');
	};

	P.videoPause = function () {
		return this.videoAction('pause');
	};

	P.videoPlay = function () {
		return this.videoPromiseAction('play');
	};

	P.videoSetMediaKeys = function (keys) {
		return this.videoPromiseAction('setMediaKeys', keys);
	};

	P.videoSetSinkId = function () {
		return this.videoPromiseAction('setSinkId');
	};

/*
Sprite actions
*/
	P.checkSpriteFrame = function () {

		let asset = this.asset;

		if (asset && asset.type === 'Sprite') {

			let copyArray = this.copyArray;

			if (this.spriteIsRunning) {

				let last = this.spriteLastFrameChange,
					choke = this.spriteFrameDuration,
					now = Date.now();

				if (now > last + choke) {

					let manifest = asset.manifest;

					if (manifest) {

						let track = manifest[this.spriteTrack],
							len = track.length,
							frame = this.spriteCurrentFrame,
							loop = this.spriteWillLoop;

						frame = (this.spriteForward) ? frame + 1 : frame - 1;

						if (frame < 0) frame = (loop) ? len - 1 : 0;
						if (frame >= len) frame = (loop) ? 0 : len - 1;

						let [source, x, y, w, h] = track[frame];

						copyArray.length = 0;
						copyArray.push(x, y, w, h);

						this.dirtyCopyStart = false;
						this.dirtyCopyDimensions = false;

						let sourceName = this.source.id || this.source.name;

						if (source !== sourceName) {

							let newSource = asset.sourceHold[source];

							if (newSource) this.source = newSource;
						}

						this.spriteCurrentFrame = frame;
						this.spriteLastFrameChange = now;
					}
				}
			}
			else {

				let [source, x, y, w, h] = asset.manifest[this.spriteTrack][this.spriteCurrentFrame],
					[cx, cy, cw, ch] = copyArray;

				if (cx !== x || cy !== y || cw !== w || ch !== h) {

					copyArray.length = 0;
					copyArray.push(x, y, w, h);

					this.dirtyCopyStart = false;
					this.dirtyCopyDimensions = false;
				}
			}
		}
	};

	P.playSprite = function (speed, loop, track, forward, frame) {

		if (xt(speed)) this.spriteFrameDuration = speed;
		if (xt(loop)) this.spriteWillLoop = loop;
		if (xt(track)) this.spriteTrack = track;
		if (xt(forward)) this.spriteForward = forward;
		if (xt(frame)) this.spriteCurrentFrame = frame;

		this.spriteLastFrameChange = Date.now();
		this.spriteIsRunning = true;
	}

	P.haltSprite = function (speed, loop, track, forward, frame) {

		if (xt(speed)) this.spriteFrameDuration = speed;
		if (xt(loop)) this.spriteWillLoop = loop;
		if (xt(track)) this.spriteTrack = track;
		if (xt(forward)) this.spriteForward = forward;
		if (xt(frame)) this.spriteCurrentFrame = frame;

		this.spriteIsRunning = false;
	}

	return P;
};
