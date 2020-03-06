/*
# Radial Gradient factory

TODO - documentation
*/
import { constructors } from '../core/library.js';
import { mergeOver, addStrings, convertLength } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';

/*
## Radial Gradient constructor
*/
const RadialGradient = function (items = {}) {

	this.stylesInit(items);
	return this;
};

/*
## Radial Gradient object prototype setup
*/
let P = RadialGradient.prototype = Object.create(Object.prototype);

P.type = 'RadialGradient';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = stylesMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*
TODO - documentation
*/
	startRadius: 0,
	endRadius: 0,
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*
TODO - documentation
*/
G.startRadius = function (item) {

	return this.currentStartRadius;
};
G.endRadius = function (item) {

	return this.currentEndRadius;
};

/*
TODO - documentation
*/
S.startRadius = function (item) {

	this.startRadius = item;
	this.dirtyStyle = true;
};
S.endRadius = function (item) {

	this.endRadius = item;
	this.dirtyStyle = true;
};
D.startRadius = function (item) {

	this.startRadius = addStrings(this.startRadius, item);
	this.dirtyStyle = true;
};
D.endRadius = function (item) {

	this.endRadius = addStrings(this.endRadius, item);
	this.dirtyStyle = true;
};

/*
## Define prototype functions
*/

/*
TODO - documentation
*/
P.cleanRadius = function (width) {

	this.currentStartRadius = (width) ? convertLength(this.startRadius, width) : this.defs.startRadius;
	this.currentEndRadius = (width) ? convertLength(this.endRadius, width) : this.defs.endRadius;
};

/*
TODO - documentation
*/
P.buildStyle = function (cell = {}) {
	
	if (cell) {

		let engine = cell.engine;

		if (engine) {

			let gradient = engine.createRadialGradient(...this.gradientArgs);
			
			return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
		}
	}
	return 'rgba(0,0,0,0)';
};

/*
TODO - documentation
*/
P.updateGradientArgs = function (x, y) {

	let gradientArgs = this.gradientArgs,
		currentStart = this.currentStart,
		currentEnd = this.currentEnd,
		sr = this.currentStartRadius,
		er = this.currentEndRadius;

	let sx = currentStart[0] + x,
		sy = currentStart[1] + y,
		ex = currentEnd[0] + x,
		ey = currentEnd[1] + y;

	// check to correct situation where coordinates represent a '0 x 0' box - which will cause errors in some browsers
	if (sx === ex && sy === ey && sr === er) er++;

	gradientArgs.length = 0;
	gradientArgs.push(sx, sy, sr, ex, ey, er);
};


/*
## Exported factory function
*/
const makeRadialGradient = function (items) {
	return new RadialGradient(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.RadialGradient = RadialGradient;


/*
TODO - documentation
*/
export {
	makeRadialGradient,
};
