/*
# Radial Gradient factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, addStrings, convertLength } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
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
let Gp = RadialGradient.prototype = Object.create(Object.prototype);

Gp.type = 'RadialGradient';
Gp.lib = 'styles';
Gp.artefact = false;

/*
Apply mixins to prototype object
*/
Gp = baseMix(Gp);
Gp = positionMix(Gp);
Gp = stylesMix(Gp);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	startRadius: 0,

/*

*/
	endRadius: 0,
};
Gp.defs = mergeOver(Gp.defs, defaultAttributes);

let G = Gp.getters,
	S = Gp.setters,
	D = Gp.deltaSetters;

/*

*/
G.startRadius = function (item) {

	return this.localStartRadius;
};

/*

*/
G.endRadius = function (item) {

	return this.localEndRadius;
};

/*

*/
S.startRadius = function (item) {

	this.startRadius = item;
	this.dirtyStyle = true;
};

/*

*/
S.endRadius = function (item) {

	this.endRadius = item;
	this.dirtyStyle = true;
};

/*

*/
D.startRadius = function (item) {

	this.startRadius = addStrings(this.startRadius, item);
	this.dirtyStyle = true;
};

/*

*/
D.endRadius = function (item) {

	this.endRadius = addStrings(this.endRadius, item);
	this.dirtyStyle = true;
};

/*
## Define prototype functions
*/

/*

*/
Gp.cleanRadius = function (width) {

	this.localStartRadius = (width) ? convertLength(this.startRadius, width) : this.defs.startRadius;
	this.localEndRadius = (width) ? convertLength(this.endRadius, width) : this.defs.endRadius;
};

/*

*/
Gp.buildStyle = function (cell = {}) {
	
	let gradient, engine,
		sx, sy, sr, ex, ey, er;

	if (cell) {

		engine = cell.engine;

		if (engine) {

			sx = this.startX || 0;
			sy = this.startY || 0;
			sr = this.localStartRadius || this.defs.startRadius;
			
			ex = this.endX || 0;
			ey = this.endY || 0;
			er = this.localEndRadius || this.defs.endRadius;

			gradient = engine.createRadialGradient(sx, sy, sr, ex, ey, er);
			
			return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
		}
	}
	return 'rgba(0,0,0,0)';
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

export {
	makeRadialGradient,
};
