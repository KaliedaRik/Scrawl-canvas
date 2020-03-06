/*
# Gradient factory

TODO - documentation
*/
import { constructors } from '../core/library.js';

import baseMix from '../mixin/base.js';
import stylesMix from '../mixin/styles.js';

/*
## Gradient constructor
*/
const Gradient = function (items = {}) {

	this.stylesInit(items);
	return this;
};

/*
## Gradient object prototype setup
*/
let P = Gradient.prototype = Object.create(Object.prototype);

P.type = 'Gradient';
P.lib = 'styles';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = stylesMix(P);

/*
## Define prototype functions
*/

/*
TODO - documentation
*/
P.buildStyle = function (cell = {}) {
	
	if (cell) {

		let engine = cell.engine;

		if (engine) {

			let gradient = engine.createLinearGradient(...this.gradientArgs);
			
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
		currentEnd = this.currentEnd;

	let sx = currentStart[0] + x,
		sy = currentStart[1] + y,
		ex = currentEnd[0] + x,
		ey = currentEnd[1] + y;

	// check to correct situation where coordinates represent a '0 x 0' box - which will cause errors in some browsers
	if (sx === ex && sy === ey) ex++;

	gradientArgs.length = 0;
	gradientArgs.push(sx, sy, ex, ey);
};


/*
## Exported factory function
*/
const makeGradient = function (items) {
	return new Gradient(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Gradient = Gradient;


/*
TODO - documentation
*/
export {
	makeGradient,
};
