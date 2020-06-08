import { constructors } from '../core/library.js';
import { generateUuid, xt, λthis, λnull } from '../core/utilities.js';
import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';
const VideoAsset = function (items = {}) {
return this.assetConstructor(items);
};
let P = VideoAsset.prototype = Object.create(Object.prototype);
P.type = 'Video';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;
P = baseMix(P);
P = assetMix(P);
P.saveAsPacket = function () {
return [this.name, this.type, this.lib, {}];
};
P.stringifyFunction = λnull;
P.processPacketOut = λnull;
P.finalizePacketOut = λnull;
P.clone = λthis;
let G = P.getters,
S = P.setters,
D = P.deltaSetters;
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
P.addTextTrack = function (kind, label, language) {
let source = this.source;
if (source && source.addTextTrack) source.addTextTrack(kind, label, language);
};
P.captureStream = function () {
let source = this.source;
if (source && source.captureStream) return source.captureStream();
else return false;
};
P.canPlayType = function (mytype) {
let source = this.source;
if (source) return source.canPlayType(mytype);
else return 'maybe';
};
P.fastSeek = function (time) {
let source = this.source;
if (source && source.fastSeek) source.fastSeek(time);
};
P.load = function () {
let source = this.source;
if (source) source.load();
};
P.pause = function () {
let source = this.source;
if (source) source.pause();
};
P.play = function () {
let source = this.source;
if (source) return source.play().catch((e) => console.log(e.code, e.name, e.message));
else return Promise.reject('Source not defined');
};
P.setMediaKeys = function (keys) {
let source = this.source;
if (source) {
if (source.setMediaKeys) return source.setMediaKeys(keys);
else return Promise.reject('setMediaKeys not supported');
}
else return Promise.reject('Source not defined');
};
P.setSinkId = function () {
let source = this.source;
if (source) {
if (source.setSinkId) return source.setSinkId();
else return Promise.reject('setSinkId not supported');
}
else return Promise.reject('Source not defined');
};
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
const importMediaStream = function (items = {}) {
let constraints = {};
constraints.audio = (xt(items.audio)) ? items.audio : true;
constraints.video = {};
let width = constraints.video.width = {};
if (items.minWidth) width.min = items.minWidth;
if (items.maxWidth) width.max = items.maxWidth;
width.ideal = (items.width) ? items.width : 1280;
let height = constraints.video.height = {};
if (items.minHeight) height.min = items.minHeight;
if (items.maxHeight) height.max = items.maxHeight;
height.ideal = (items.height) ? items.height : 720;
if (items.facing) constraints.video.facingMode = items.facing;
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
const importVideo = function (...args) {
let reg = /.*\/(.*?)\./,
result = '';
if (args.length) {
let name, className, visibility, parent, sources, preload;
let flag = false;
let firstArg = args[0];
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
else if (firstArg && firstArg.src) {
name = firstArg.name || '';
sources = [...firstArg.src];
className = firstArg.className || '';
visibility = firstArg.visibility || false;
parent = document.querySelector(parent);
preload = firstArg.preload || 'auto';
flag = true;
}
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
