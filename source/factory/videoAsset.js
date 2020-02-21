/*
# VideoAsset factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, generateUuid, xt } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

/*
## VideoAsset constructor
*/
const VideoAsset = function (items = {}) {

	return this.assetConstructor(items);
};

/*
## VideoAsset object prototype setup
*/
let P = VideoAsset.prototype = Object.create(Object.prototype);
P.type = 'Video';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = assetMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/
S.source = function (item = {}) {

	if (item) {

		if (item.tagName.toUpperCase() === 'VIDEO') {

			this.source = item;
			this.sourceNaturalWidth = item.videoWidth || 0;
			this.sourceNaturalHeight = item.videoHeight || 0;
			this.sourceLoaded = (item.readyState > 2) ? true : false;
		}

		if (this.sourceLoaded) this.notifySubscribers();
	}
};

/*
## Define prototype functions
*/

/*

*/
P.checkSource = function (width, height) {

	let source = this.source;

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


/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.addTextTrack = function (kind, label, language) {

	let source = this.source;

	if (source && source.addTextTrack) source.addTextTrack(kind, label, language);
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.captureStream = function () {

	let source = this.source;

	if (source && source.captureStream) return source.captureStream();
	else return false;
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.canPlayType = function (mytype) {

	let source = this.source;

	if (source) return source.canPlayType(mytype);
	else return 'maybe';
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.fastSeek = function (time) {

	let source = this.source;

	if (source && source.fastSeek) source.fastSeek(time);
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.load = function () {

	let source = this.source;

	if (source) source.load();
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.pause = function () {

	let source = this.source;

	if (source) source.pause();
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.play = function () {

	let source = this.source;

	if (source) return source.play().catch((e) => console.log(e.code, e.name, e.message));
	else return Promise.reject('Source not defined');
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.setMediaKeys = function (keys) {

	let source = this.source;

	if (source) {

		if (source.setMediaKeys) return source.setMediaKeys(keys);
		else return Promise.reject('setMediaKeys not supported');
	}
	else return Promise.reject('Source not defined');
};

/*
Routes the function invocation from the asset to its source &lt;video> element
*/
P.setSinkId = function () {

	let source = this.source;

	if (source) {

		if (source.setSinkId) return source.setSinkId();
		else return Promise.reject('setSinkId not supported');
	}
	else return Promise.reject('Source not defined');
};

/*
Import videos from the DOM

Required argument is a query string used to search the dom for matching elements
*/
const importDomVideo = function (query) {

	let reg = /.*\/(.*?)\./;

	let items = document.querySelectorAll(query);

	items.forEach(item => {

		let name;

		if (item.tagName.toUpperCase() === 'VIDEO') {

			if (item.id || item.name) name = item.id || item.name;
			else {

				let match = reg.exec(item.src);
				name = (match && match[1]) ? match[1] : '';
			}

			let vid = makeVideoAsset({
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

/*
TODO - extend functionality so users can manipulate the mediaStream via the Picture entity using it as its asset
*/
const importMediaStream = function (items = {}) {

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
	let name = items.name || generateUuid();

	let el = document.createElement('video');

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

				if (Array.isArray(actuals) && actuals[0]) data = actuals[0].getConstraints();

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

/*
Import video from wherever

Arguments can be either string urls - 'http://www.example.com/path/to/image/flower.mp4' - in which case Scrawl-canvas:

* will attempt to give the new videoAsset object, and video element, a name/id value of eg 'flower' (but not guaranteed)
* will not add the new video element to the DOM

... or the argument can be an object with the following attributes:

* __name__ string
* __src__ url string, or an array of ['url_strings']
* __parent__ CSS search string - if set, Scrawl-canvas will attempt to append the new video element to the corresponding DOM element
* __isVisible__ boolean - if true, and new video element has been added to DOM, make that image visible; default is false
* __className__ string - list of classes to be added to the new video element

*/
const importVideo = function (...args) {

	let reg = /.*\/(.*?)\./,
		result = '';

	if (args.length) {

		let name, className, visibility, parent, sources, preload;

		let flag = false;

		let firstArg = args[0];

		// one or more string urls has been passed to the function
		// - urls will be treated as &lt;source> elements assigned to a &lt;video> element
		if (firstArg.substring) {

			let match = reg.exec(firstArg);
			name = (match && match[1]) ? match[1] : '';

			sources = [...args];
			className = '';
			visibility = false;
			parent = null;
			preload = 'auto';

			flag = true;
		}

		// a single object has been passed to the function
		// - only process if the object includes a src attribute
		else if (firstArg && firstArg.src) {

			name = firstArg.name || '';

			sources = [...firstArg.src];
			className = firstArg.className || '';
			visibility = firstArg.visibility || false;
			parent = document.querySelector(parent);
			preload = firstArg.preload || 'auto';

			flag = true;
		}

		// build the video element
		let video = makeVideoAsset({
			name: name,
		});


		if (flag) {

			let vid = document.createElement('video');

			vid.name = name;
			vid.className = className;

			vid.style.display = (visibility) ? 'block' : 'none';

			vid.crossOrigin = 'anonymous';

			vid.preload = preload;

			sources.forEach(item => {

				let el = document.createElement('source');

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

/*

*/
const gettableVideoAssetAtributes = [
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

/*

*/
const settableVideoAssetAtributes = [
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


/*
## Exported factory function
*/
const makeVideoAsset = function (items) {

	return new VideoAsset(items);
};

constructors.VideoAsset = VideoAsset;


export {
	makeVideoAsset,

	gettableVideoAssetAtributes,
	settableVideoAssetAtributes,

	importDomVideo,
	importVideo,

	importMediaStream,
};
