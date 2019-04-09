/*
# Styles mixin

Note: this mixin needs to be applied after the position mixin in order to work properly
*/
import { addStrings, defaultNonReturnFunction, isa_obj, mergeOver, pushUnique, xt, xta } from '../core/utilities.js';

import { makePalette } from '../factory/palette.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the position mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*
(Radial)Gradient styles uses the position mixin to supply attributes and functions for handling the gradient's start and end coordinates.
*/
		end: {},
		currentEnd: {},

/*
Every gradient requires a palette of color stop instructions
*/
		palette: {},

/*
We don't need to use the entire palette when building a context gradient; we can restrict the palette using these start and end attributes
*/
		paletteStart: 0,
		paletteEnd: 999,

/*
The cyclePalette attribute tells the Palette object how to handle situations where paletteStart > paletteEnd
- when false, we reverse the color stops
- when true, we keep the normal order of color stops and pass through the 1/0 border
*/
		cyclePalette: false,
	};
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = obj.getters,
		S = obj.setters,
		D = obj.deltaSetters;

/*
Delete a bunch of attributes and functions previously set by the position mixin, not required by a styles object
*/
	delete obj.defs.mimic;
	delete obj.defs.handle;
	delete obj.defs.currentHandle;
	delete obj.defs.visibility;
	delete obj.defs.order;
	delete obj.defs.width;
	delete obj.defs.height;
	delete obj.defs.roll;
	delete obj.defs.scale;
	delete G.handleX;
	delete G.handleY;
	delete S.handleX;
	delete S.handleY;
	delete S.handle;
	delete S.width;
	delete S.height;
	delete S.roll;
	delete S.scale;
	delete S.mimic;
	delete D.handleX;
	delete D.handleY;
	delete D.width;
	delete D.height;
	delete D.roll;
	delete D.scale;
	delete obj.cleanHandle;
	delete obj.cleanStart;
	delete obj.getHere;
	delete obj.getStart;

/*

*/
	G.endX = function () {

		this.checkVector('end');
		return this.end.x;
	};

/*

*/
	G.endY = function () {

		this.checkVector('end');
		return this.end.y;
	};

/*

*/
	S.startX = function (item) {

		this.checkVector('start');
		this.start.x = item;
	};

/*

*/
	S.startY = function (item) {

		this.checkVector('start');
		this.start.y = item;
	};

/*

*/
	S.start = function (item = {}) {

		this.checkVector('start');
		this.start.x = (xt(item.x)) ? item.x : this.start.x;
		this.start.y = (xt(item.y)) ? item.y : this.start.y;
	};

/*

*/
	S.endX = function (item) {

		this.checkVector('end');
		this.end.x = item;
	};

/*

*/
	S.endY = function (item) {

		this.checkVector('end');
		this.end.y = item;
	};

/*

*/
	S.end = function (item = {}) {

		this.checkVector('end');
		this.end.x = (xt(item.x)) ? item.x : this.end.x;
		this.end.y = (xt(item.y)) ? item.y : this.end.y;
	};

/*

*/
	D.startX = function (item) {

		this.checkVector('start');
		this.start.x = addStrings(this.start.x, item);
	};

/*

*/
	D.startY = function (item) {

		this.checkVector('start');
		this.start.y = addStrings(this.start.y, item);
	};
	
/*

*/
	D.endX = function (item) {

		this.checkVector('end');
		this.end.x = addStrings(this.end.x, item);
	};
	
/*

*/
	D.endY = function (item) {

		this.checkVector('end');
		this.end.y = addStrings(this.end.y, item);
	};

/*

*/
	S.palette = function (item = {}) {

		if(item.type === 'Palette') this.palette = item;
	};

/*

*/
	S.paletteStart = function (item) {

		if (item.toFixed) {

			this.paletteStart = item;
			
			if(item < 0 || item > 999) this.paletteStart = (item > 500) ? 999 : 0;
		}
	};

/*

*/
	S.paletteEnd = function (item) {

		if (item.toFixed) {

			this.paletteEnd = item;
			
			if (item < 0 || item > 999) this.paletteEnd = (item > 500) ? 999 : 0;
		}
	};

/*

*/
	D.paletteStart = function (item) {

		let p;

		if (item.toFixed) {

			p = this.paletteStart + item;

			if (p < 0 || p > 999) {

				if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
				else p = (item > 500) ? 999 : 0;
			}

			this.paletteStart = p;
		}
	};

/*

*/
	D.paletteEnd = function (item) {

		let p;

		if (item.toFixed) {

			p = this.paletteEnd + item;

			if (p < 0 || p > 999) {

				if (this.cyclePalette) p = (p > 500) ? p - 1000 : p + 1000;
				else p = (item > 500) ? 999 : 0;
			}

			this.paletteEnd = p;
		}
	};

/*
## Define functions to be added to the factory prototype
*/

/*
Overwrites function defined in mixin/base.js - takes into account Palette object attributes
*/
	obj.get = function (item) {

		let getter = this.getters[item];

		if (getter) return getter.call(this);
		else {

			let def = this.defs[item],
				palette = this.palette,
				val;

			if (typeof def !== 'undefined') {

				val = this[item];
				return (typeof val !== 'undefined') ? val : def;
			}

			def = palette.defs[item];

			if (typeof def !== 'undefined') {

				val = palette[item];
				return (typeof val !== 'undefined') ? val : def;
			}
			else return undef;
		}
	};

/*
Overwrites function defined in mixin/base.js - takes into account Palette object attributes
*/
	obj.set = function (items = {}) {

		if (items) {

			let setters = this.setters,
				defs = this.defs,
				palette = this.palette,
				paletteSetters = (palette) ? palette.setters : {},
				paletteDefs = (palette) ? palette.defs : {};

			Object.entries(items).forEach(([key, value]) => {

				if (key !== 'name') {

					let predefined = setters[key],
						paletteFlag = false;

					if (!predefined) {

						predefined = paletteSetters[key];
						paletteFlag = true;
					}

					if (predefined) predefined.call(paletteFlag ? this.palette : this, value);
					else if (typeof defs[key] !== 'undefined') this[key] = value;
					else if (typeof paletteDefs[key] !== 'undefined') palette[key] = value;
				}
			}, this);
		}
		return this;
	};

/*

*/
	obj.stylesInit = function (items = {}) {

		this.makeName(items.name);
		this.register();
		this.set(this.defs);

		this.palette = makePalette({
			name: `${this.name}_palette`,
		});

		this.delta = {};

		this.set(items);
	};

/*

*/
	obj.updateByDelta = function () {

		this.setDelta(this.delta);
		return this;
	};

/*
This is where we have to calculate all the stuff necessary to get the ctx gradient object attached to the ctx, so we can use it for upcoming fillStyle and strokeStyle settings on the engine. We have to create the ctx gradient and return it. 
*/
	obj.getData = function (entity, cell, isFill) {

		// Step 1: see if the palette is dirty, from having colors added/deleted/changed
		if(this.palette && this.palette.dirtyPalette) this.palette.recalculate();

		// Step 2: recalculate current start and end points
		this.cleanStyle(entity, cell, isFill);

		// Step 3: finalize the coordinates to use for creating the gradient in relation to the current entity's position and requirements on the canvas
		this.finalizeCoordinates(entity, isFill);

		// Step 4: create, populate and return gradient/pattern object
		return this.buildStyle(cell);
	};

/*

*/
	obj.cleanStyle = function (entity = {}, cell = {}, isFill) {

		let w, h;

		if (isFill && entity.lockFillStyleToEntity) {

			w = (entity.localWidth * entity.scale) || 0; 
			h = (entity.localHeight * entity.scale) || 0; 
		}
		else if (!isFill && entity.lockStrokeStyleToEntity) {

			w = (entity.localWidth * entity.scale) || 0; 
			h = (entity.localHeight * entity.scale) || 0; 
		}
		else {

			w = cell.localWidth || 0; 
			h = cell.localHeight || 0; 
		}

		if (w && h) {

			this.cleanVectorParameter('currentStart', this.start, w, h);
			this.cleanVectorParameter('currentEnd', this.end, w, h);
			this.cleanRadius(w);
		}
	};

/*

*/
	obj.finalizeCoordinates = function (entity = {}, isFill) {

		let p = entity.pivot || false,
			cs = this.currentStart,
			ce = this.currentEnd,
			ech = entity.currentHandle,
			eScale = entity.scale,
			pch, pScale, correctX, correctY;

		// the entity stamp will have shifted the canvas grid prior to setting the style on the canvas engine
		if (p) {

			pch = p.currentHandle;
			pScale = p.scale;
		}

		if (isFill && entity.lockFillStyleToEntity) {

			correctX = -(ech.x * eScale) || 0; 
			correctY = -(ech.y * eScale) || 0; 
		}
		else if (!isFill && entity.lockStrokeStyleToEntity) {

			correctX = -(ech.x * eScale) || 0; 
			correctY = -(ech.y * eScale) || 0; 
		}
		else {

			correctX = -entity.stampX || 0; 
			correctY = -entity.stampY || 0; 
		}

		if (p && entity.addPivotHandle) {

			if (entity.lockXTo === 'pivot') correctX -= (pch.x * pScale);
			if (entity.lockYTo === 'pivot') correctY -= (pch.y * pScale);
		}

		if (entity.flipReverse) correctX = -correctX;
		if (entity.flipUpend) correctY = -correctY;

		this.startX = cs.x + correctX;
		this.startY = cs.y + correctY;
		this.endX = ce.x + correctX;
		this.endY = ce.y + correctY;
	};

/*
Do stuff here for startRadius, endRadius, producing local variants - overwritten in factory-radialgradient.js file
*/
	obj.cleanRadius = defaultNonReturnFunction;

/*
Just in case something went wrong with loading other styles files, which must overwrite this function, we can return transparent color here
*/
	obj.buildStyle = function (cell) {

		return 'rgba(0,0,0,0)';
	};

/*

*/
	obj.addStopsToGradient = function (gradient, start, stop, cycle) {

		if (this.palette) return this.palette.addStopsToGradient(gradient, start, stop, cycle);

		return gradient;
	};

/*

*/
	obj.updateColor = function (index, color) {

		if (this.palette) this.palette.updateColor(index, color);

		return this;
	};

/*

*/
	obj.removeColor = function (index) {

		if (this.palette) this.palette.removeColor(index);

		return this;
	};

	return obj;
};
