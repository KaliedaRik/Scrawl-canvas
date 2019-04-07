/*
# Palette factory
*/
import { constructors } from '../core/library.js';
import { addStrings, defaultNonReturnFunction, isa_obj, mergeOver, pushUnique, xt, xta } from '../core/utilities.js';

import { makeColor } from './color.js';

import baseMix from '../mixin/base.js';

/*
## Palette constructor
*/
const Palette = function (items = {}) {


	this.makeName(items.name);
	this.register();
	this.set(this.defs);

	this.colors = items.colors || {'0 ': [0,0,0,1], '999 ': [255,255,255,1]};
	this.stops = Array(1000);

	this.set(items);

	this.dirtyPalette = true;
	return this;
};

/*
## Palette object prototype setup
*/
let P = Palette.prototype = Object.create(Object.prototype);

P.type = 'Palette';
P.lib = 'palette';
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
The colors object is a raw Javascript object which uses stop values (0 - 999) as keys and an [r(0-255), g(0-255), b(0-255), a(0-1)] array as values. 
*/
	colors: null,


/*
The stops array is a fixed Array of length 1000 containing rgba color strings for each index. 
*/
	stops: null,

/*
If the cyclic flag is set, then we know to calculate appropriate stop values between the last key color and the first key color, thus allowing for smooth crossing of the 1 -> 0 stops boundary
*/
	cyclic: false,
};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters;

/*
No checking is done prior to assigning the colors object to the colors attribute beyond verifying that the argument value is an object.
*/
S.colors = function (item) {
	if (isa_obj(item)) {

		this.colors = item;
		this.dirtyPalette = true;
	}
};

/*
Do nothing. The stops array needs to be kept private, its values set only via the recalculate function, which happens whenever the dirtyPalette attribute is set to true.
*/  
S.stops = defaultNonReturnFunction;

/*
## Define prototype functions
*/

/*

*/
P.set = function (items = {}) {

// console.log('palette set', this.name, items);
	let keys = Object.keys(items),
		i, iz, key;

	for (i = 0, iz = keys.length; i < iz; i++) {

		key = keys[i];
		this[key] = items[key];
	}
};

/*

*/
P.recalculateHold = [];

/*
Question: possible tasks for web worker?
*/
P.recalculate = function () {

	let keys, i, iz, j, jz, cursor, diff, 
		current, next, nextKey, temp,
		r, g, b, a,
		colors = this.colors,
		stops = this.stops,
		make = this.makeColorString,
		hold = this.recalculateHold;

	keys = Object.keys(colors);
	keys = keys.map(n => parseInt(n, 10))
	keys.sort((a, b) => a - b);

	stops.fill('rgba(0,0,0,0)');

	this.dirtyPalette = false;

	for (i = 0, iz = keys.length - 1; i < iz; i++) {

		cursor = keys[i];
		nextKey = keys[i + 1];
		diff = nextKey - cursor;

		current = colors[cursor + ' '];
		next = colors[nextKey + ' '];

		r = (next[0] - current[0]) / diff;
		g = (next[1] - current[1]) / diff;
		b = (next[2] - current[2]) / diff;
		a = (next[3] - current[3]) / diff;

		for (j = 0, jz = diff; j < jz; j++) {

			hold[0] = current[0] + (r * j);
			hold[1] = current[1] + (g * j);
			hold[2] = current[2] + (b * j);
			hold[3] = current[3] + (a * j);

			stops[cursor] = make(hold);
			cursor++;
		}
	}

	stops[cursor] = make(next);

	if (this.cyclic) {

		cursor = keys[keys.length - 1];
		nextKey = keys[0];
		diff = (nextKey + 1000) - cursor;

		current = colors[cursor + ' '];
		next = colors[nextKey + ' '];

		r = (next[0] - current[0]) / diff;
		g = (next[1] - current[1]) / diff;
		b = (next[2] - current[2]) / diff;
		a = (next[3] - current[3]) / diff;

		for (j = 0, jz = diff; j < jz; j++) {

			hold[0] = current[0] + (r * j);
			hold[1] = current[1] + (g * j);
			hold[2] = current[2] + (b * j);
			hold[3] = current[3] + (a * j);

			stops[cursor] = make(hold);
			cursor++;

			if (cursor > 999) cursor -= 1000;
		}
	}
	else {

		cursor = keys[0];
		
		if (cursor > 0) {

			temp = stops[cursor];
			
			for (i = 0, iz = cursor; i < iz; i++) {

				stops[i] = temp;
			}
		}

		cursor = keys[keys.length - 1];

		if (cursor < 999) {

			temp = stops[cursor];

			for (i = cursor, iz = 1000; i < iz; i++) {

				stops[i] = temp;
			}
		}
	}
};

/*

*/
P.makeColorString = function (item) {

	let f = Math.floor,
		r, g, b, a;

	let constrainer = (n, min, max) => {
		n = (n < min) ? min : n;
		n = (n > max) ? max : n;
		return n;
	};

	r = constrainer(f(item[0]), 0, 255),
	g = constrainer(f(item[1]), 0, 255),
	b = constrainer(f(item[2]), 0, 255),
	a = constrainer(item[3], 0, 1);

	return `rgba(${r},${g},${b},${a})`;
};

/*

*/
P.updateColor = function (index, color) {

	let f = this.factory;

	if (xta(index, color)) {

		index = (index.substring) ? parseInt(index, 10) : Math.floor(index);

		if (index >= 0 && index <= 999) {

			f.convert(color);
			index += ' ';
			this.colors[index] = [f.r, f.g, f.b, f.a];
			this.dirtyPalette = true;
		}
	}
};

/*

*/
P.removeColor = function (index) {
	
	if (xt(index)) {

		index = (index.substring) ? parseInt(index, 10) : Math.floor(index);
		
		if (index >= 0 && index <= 999) {

			index += ' ';
			delete this.colors[index];
			this.dirtyPalette = true;
		}
	}
};

/*

*/
P.addStopsToGradient = function (gradient, start, end, cycle) {

	let stops = this.stops,
		keys = Object.keys(this.colors),
		spread, offset, i, iz, item, n;

	if (gradient) {

		keys = keys.map(n => parseInt(n, 10))
		keys.sort((a, b) => a - b);

		if (!xta(start, end)) {
			start = 0;
			end = 999;
		}

		// Option 1 start == end, cycle irrelevant
		if (start === end) return stops[start] || 'rgba(0,0,0,0)';

		// Option 2: start < end, cycle irrelevant
		else if (start < end) {

			gradient.addColorStop(0, stops[start]);
			gradient.addColorStop(1, stops[end]);
		
			spread = end - start;

			for (i = 0, iz = keys.length; i < iz; i++) {

				item = keys[i];

				if (item > start && item < end) {

					offset = (item - start) / spread;

					if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
				}
			}
		}

		else {
			// Option 3: start > end, cycle = true

			if (cycle) {

				gradient.addColorStop(0, stops[start]);
				gradient.addColorStop(1, stops[end]);
			
				n = 999 - start;
				spread = n + end;

				for (i = 0, iz = keys.length; i < iz; i++) {

					item = keys[i];

					if (item > start) offset = (item - start) / spread;
					else if (item < end) offset = (item + n) / spread;
					else continue;

					if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
				}
			}

			// Option 4: start > end, cycle = false
			else {

				gradient.addColorStop(0, stops[start]);
				gradient.addColorStop(1, stops[end]);
			
				spread = start - end;

				for (i = 0, iz = keys.length; i < iz; i++) {

					item = keys[i];

					if (item < start && item > end) {

						offset = 1 - ((item - end) / spread);

						if (offset > 0 && offset < 1) gradient.addColorStop(offset, stops[item]);
					}
				}
			}
		}
		return gradient;
	}

	// No gradient: no colors
	else return 'rgba(0,0,0,0)';
};

/*
We add a Color object to the Palette prototype - one object is used for all the calculations preformed by all Palette objects
*/
P.factory = makeColor({
	opaque: false
});


/*
## Exported factory function
*/
const makePalette = function (items) {
	return new Palette(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Palette = Palette;

export {
	makePalette,
};
