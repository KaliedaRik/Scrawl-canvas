/*
# Gradient factory
*/
import { constructors } from '../core/library.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
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
P = positionMix(P);
P = stylesMix(P);

/*
## Define prototype functions
*/

/*

*/
P.buildStyle = function (cell = {}) {
	
	let gradient, engine,
		sx, sy, ex, ey;

	if (cell) {

		engine = cell.engine;

		if (engine) {

			sx = this.startX || 0;
			sy = this.startY || 0;
			ex = this.endX || 0;
			ey = this.endY || 0;

			gradient = engine.createLinearGradient(sx, sy, ex, ey);
			
			return this.addStopsToGradient(gradient, this.paletteStart, this.paletteEnd, this.cyclePalette);
		}
	}
	return 'rgba(0,0,0,0)';
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

export {
	makeGradient,
};
