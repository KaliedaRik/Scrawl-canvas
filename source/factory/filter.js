/*
# Filter factory
*/
import { constructors, userFilter } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';

/*
## Filter constructor
*/
const Filter = function (items = {}) {

	this.makeName(items.name);
	this.register();
	this.set(this.defs);
	this.set(items);
	return this;
};

/*
## Filter object prototype setup
*/
let P = Filter.prototype = Object.create(Object.prototype);
P.type = 'Filter';
P.lib = 'filter';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*
All filters need to set out their __method__. For preset methods, a method string (eg 'grayscale', 'sepia') is sufficient. Bespoke methods require a function
*/
	method: '',

/*
The following methods require no further attributes: 

    grayscale, sepia, invert
    red, green, blue
    notred, notgreen, notblue
    cyan, magenta, yellow


The following methods require the __level__ attribute:

    brightness, saturation, threshold
*/
	level: 0,

/*
The channels and channelstep methods make use of the __red__, __green__ and __blue__ attributes
*/
	red: 0,
	green: 0,
	blue: 0,

/*
The __tint__ method uses nine attributes
*/
	redInRed: 0,
	redInGreen: 0,
	redInBlue: 0,
	greenInRed: 0,
	greenInGreen: 0,
	greenInBlue: 0,
	blueInRed: 0,
	blueInGreen: 0,
	blueInBlue: 0,

/*
The __pixelate__ method requires tile dimensions and, optionally, offset coordinates which should not exceed the tile dimensions
*/
	offsetX: 0,
	offsetY: 0,
	tileWidth: 1,
	tileHeight: 1,

/*
The __blur__ method uses the following attributes:

    the __radius__ of the blur effect, in pixels
    the __passes__ attribute (1+) determines how many times the blur filter will iterate
    the __shrinkingRadius__ flag reduces the radius by approx 70% on each successive pass
    when __includeAlpha__ flag is true, filter will include the alpha channel - note this will make the edges of the entity translucent
*/
	radius: 1,
	passes: 1,
	shrinkingRadius: false,
	includeAlpha: false,

/*
The __matrix__ method requires a weights attribute - an array of 9 numbers in the following format:

    weights: [
        topLeftWeight,
        topCenterWeight,
        topRightWeight,
        middleLeftWeight,
        homePixelWeight,
        middleRightWeight,
        bottomLeftWeight,
        bottomCenterWeight,
        bottomRightWeight,
    ]

... where the top row is the row above the home pixel, etc

The method also makes use of the __includeAlpha__ attribute.

The __matrix5__ method is the same as the matrix method except that its weights array should contain 25 elements, to cover all the positions (from top-left corner) in a 5x5 grid
*/
	weights: null,

/*
The __ranges__ attribute - used by the __chroma__ method - needs to be an array of arrays with the following format:

    [[minRed, minGreen, minBlue, maxRed, maxGreen, maxBlue], etc]

... multiple ranges can be defined - for instance to key out the lightest and darkest hues:

    ranges: [[0, 0, 0, 80, 80, 80], [180, 180, 180, 255, 255, 255]]
*/
	ranges: null,

/*
User-defined filters cannot be processed by the filters web worker, even though they are passed into the worker alongside the other filters. Processing of the user-defined filter will take place once the web worker completes its work. User-defined images _may_ set their method attribute to a pre-defined filter name (for instance 'grayscale') to ensure the web worker pre-processes the ImageData object accordingly; if no pre-processing is required the method attribute can be set to false.

When set to true the __returnLocalDimensions__ flag will result in the filter worker returning a _localDimensions_ object with x, y, w and h attributes; these can be used to extract the filtered area from the returned ImageData object, for instance to create a Picture entity from the filtered entity, group or cell - this is useful in particular for entitys requiring a slower, static filter within a wider animation.
*/
	returnLocalDimensions: false,

/*
Similarly, the filter can request the filter worker returns its _cache_ array, which contains the (linear) positions of all pixels in the ImageData data object that have an alpha value > 0
*/
	returnCacheArray: false,

/*
The user-defined filter should be set as an anonymous function on the __userFilter__ attribute. The function will take four arguments - _image_, _filter_, (for the attributes it holds), _cache_ (if requested) and _localDimensions_ (if requested) which can be used to help the filter further manipulate the ImageData object. The function __must__ return the ImageData object as its only output!
*/
	userFilter: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Filter webworker pool
*/
const filterPool = [];

/*

*/
const requestFilterWorker = function () {

	if (!filterPool.length) filterPool.push(buildFilterWorker());

	return filterPool.shift();
};

/*

*/
const releaseFilterWorker = function (f) {

	filterPool.push(f);
};

/*

*/
const buildFilterWorker = function () {

	let filterUrl = (window.scrawlEnvironmentOffscreenCanvasSupported) ? 
		`${window.location.origin}${window.scrawlPath}/worker/filter.js` : 
		`${window.location.origin}${window.scrawlPath}/worker/filter.js`;

	// chrome does not yet support module
	// return new Worker(filterUrl, {type: 'module'});
	return new Worker(filterUrl);
};

/*

*/
const actionFilterWorker = function (worker, items) {

	return new Promise((resolve, reject) => {

		worker.onmessage = (e) => {

			if (e && e.data && e.data.image) {

				let data = e.data,
					filters = data.filters;

				filters.forEach(fltr => {

					if (fltr.userFilter) {

						let func = userFilter[fltr.userFilter];

						if (func) data.image = func(data.image, fltr, data.localDimensions, data.cache);
					}
				});
				resolve(data.image);
			}
			else resolve(false);
		};

		worker.onerror = (e) => {

			console.log('error', e.lineno, e.message);
			resolve(false);
		};

		worker.postMessage(items);
	});
};

/*
## Exported factory function
*/
const makeFilter = function (items) {

	return new Filter(items);
};


/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Filter = Filter;

export {
	makeFilter,
	requestFilterWorker,
	releaseFilterWorker,
	actionFilterWorker,
};
