/*
# State factory
*/
import { constructors, entity, styles } from '../core/library.js';
import { addStrings, getSafeObject, isa_canvas, isa_engine, isa_obj, pushUnique, xt, xtGet } from '../core/utilities.js';

import baseMix from '../mixin/base.js';

/*
## State constructor
*/
const State = function (items = {}) {

	this.set(this.defs);
	this.lineDash = [];
	this.set(items);

	return this;
};


/*
## State object prototype setup
*/
let Sp = State.prototype = Object.create(Object.prototype);
Sp.type = 'State';

/*
Apply mixins to prototype object
*/
Sp = baseMix(Sp);

/*
## Define default attributes
*/
Sp.defs = {

/*
Color, gradient or pattern used to fill a entity. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
* GRADIENTNAME String
* RADIALGRADIENTNAME String
* PATTERNNAME String
*/
	fillStyle: 'rgba(0,0,0,1)',

/*
Color, gradient or pattern used to outline a entity. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
* GRADIENTNAME String
* RADIALGRADIENTNAME String
* PATTERNNAME String
*/
	strokeStyle: 'rgba(0,0,0,1)',

/*
Entity transparency - a value between 0 and 1, where 0 is completely transparent and 1 is completely opaque
*/
	globalAlpha: 1,

/*
Compositing method for applying the entity to an existing Cell (&lt;canvas&gt;) display. Permitted values include

* 'source-over'
* 'source-atop'
* 'source-in'
* 'source-out'
* 'destination-over'
* 'destination-atop'
* 'destination-in'
* 'destination-out'
* 'lighter'
* 'darker'
* 'copy'
* 'xor'

_Be aware that different browsers render these operations in different ways, and some options are not supported by all browsers_
*/
	globalCompositeOperation: 'source-over',

/*
Line width, in pixels
*/
	lineWidth: 1,

/*
Line cap styling. Permitted values include:

* 'butt'
* 'round'
* 'square'
*/
	lineCap: 'butt',

/*
Line join styling. Permitted values include:

* 'miter'
* 'round'
* 'bevel'
*/
	lineJoin: 'miter',

/*
Line dash format - an array of Numbers representing line and gap values (in pixels), for example [5,2,2,2] for a long-short dash pattern
*/
	lineDash: null,

/*
Line dash offset - distance along the entity's outline at which to start the line dash. Changing this value can be used to create a 'marching ants effect
*/
	lineDashOffset: 0,

/*
miterLimit - affecting the 'pointiness' of the line join where two lines join at an acute angle
*/
	miterLimit: 10,

/*
Horizontal offset of a entity's shadow, in pixels
*/
	shadowOffsetX: 0,

/*
Vertical offset of a entity's shadow, in pixels
*/
	shadowOffsetY: 0,

/*
Blur border for a entity's shadow, in pixels
*/
	shadowBlur: 0,

/*
Color used for entity shadow effect. Can be:

* Cascading Style Sheet format color String - '#fff', '#ffffff', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'white'
* COLORNAME String
*/
	shadowColor: 'rgba(0,0,0,0)',

/*
Cascading Style Sheet font String, for Phrase entitys
*/
	font: '10pt sans-serif',

/*
Text alignment for multi-line Phrase entitys. Permitted values include:

* 'start'
* 'left'
* 'center'
* 'right'
* 'end'
*/
	textAlign: 'start',

/*
Text baseline value for single-line Phrase entitys set to follow a Path entity path. Permitted values include:

* 'alphabetic'
* 'top'
* 'hanging'
* 'middle'
* 'ideographic'
* 'bottom'
*/
	textBaseline: 'alphabetic'
};

/*
## Define attribute getters and setters
*/
Sp.set = function (items) {

	let key, i, iz,
		keys = Object.keys(items),
		d = this.defs;

	for (i = 0, iz = keys.length; i < iz; i++) {

		key = keys[i];

		if (key !== 'name') {

			if (typeof d[key] !== 'undefined') this[key] = items[key];
		}
	}
	return this;
};

Sp.get = function (item) {

	let undef, d, i;

	d = this.defs[item];

	if (typeof d !== 'undefined') {
	
		i = this[item];
		return (typeof i !== 'undefined') ? i : d;
	}
	else return undef;
};

let G = Sp.getters,
	S = Sp.setters,
	D = Sp.deltaSetters;

/*

*/
S.fillStyle = function (item) {

	let temp;

	if (isa_obj(item) && item.lib === 'styles') this.fillStyle = item;
	else{

		temp = styles[item];

		if (temp) this.fillStyle = temp;
		else this.fillStyle = item;
	}
};

/*

*/
S.strokeStyle = function (item) {

	let temp;

	if (isa_obj(item) && item.lib === 'styles') this.strokeStyle = item;
	else{

		temp = styles[item];

		if (temp) this.strokeStyle = temp;
		else this.strokeStyle = item;
	}
};

/*
## Define prototype functions
*/
Sp.allKeys = Object.keys(Sp.defs);
Sp.mainKeys = ['globalAlpha', 'globalCompositeOperation', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'];
Sp.lineKeys = ['lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'lineDashOffset', 'miterLimit'];
Sp.styleKeys = ['fillStyle', 'strokeStyle', 'shadowColor'];
Sp.textKeys = ['font', 'textAlign', 'textBaseline'];

/*

*/
Sp.getChanges = function (ent, engineState) {

	let mainKeys = this.mainKeys,
		lineKeys = this.lineKeys,
		styleKeys = this.styleKeys,
		textKeys = this.textKeys,
		k, style, scaled, i, iz, j, jz,
		linedashFlag, desired, current,
		defs = this.defs,
		result = {};

	let getItem = function (source, key) {
		return (typeof source[key] != 'undefined') ? source[key] : defs[key];
	};

	if (ent.substring) ent = entity[ent];

	// 'globalAlpha', 'globalCompositeOperation', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur'
	for (i = 0, iz = mainKeys.length; i < iz; i++) {

		k = mainKeys[i];
		desired = getItem(this, k);
		current = getItem(engineState, k);

		if (current !== desired) result[k] = desired;
	}

	// 'lineWidth', 'lineCap', 'lineJoin', 'lineDash', 'lineDashOffset', 'miterLimit'
	if (this.lineWidth || engineState.lineWidth) {

		for (i = 0, iz = lineKeys.length; i < iz; i++) {

			k = lineKeys[i];
			desired = getItem(this, k);
			current = getItem(engineState, k);

			if (k == 'lineDash') {

				if (desired.length || current.length) {

					if (desired.length != current.length) result.lineDash = desired;
					else {

						linedashFlag = false;

						for (j = 0, jz = desired.length; j < jz; j++) {

							if (desired[j] != current[j]) {
								linedashFlag = true;
								break;
							}
						}

						if (linedashFlag) result.lineDash = desired;
					}
				}
			}

			else if (k == 'lineWidth') {

				if (ent.scaleOutline) {

					scaled = (desired || 1) * (ent.scale || 1);

					if (scaled !== current) result.lineWidth = scaled;
				}
				else {

					if (desired !== current) result.lineWidth = desired;
				}
			}

			else if (current !== desired) result[k] = desired
		}
	}

	// 'fillStyle', 'strokeStyle', 'shadowColor'
	for (i = 0, iz = styleKeys.length; i < iz; i++) {

		k = styleKeys[i];
		current = getItem(engineState, k);
		desired = getItem(this, k);

		// string colors - only update if necessary
		if (desired.substring && current !== desired) result[k] = desired;

		// Color object colors need to be extracted before they can be compared and, if necessary, updated
		else if (desired.type === 'Color') {

			desired = desired.getData();

			if (current !== desired) result[k] = desired;
		}

		// gradient and pattern objects - get freshly deployed with each entity stamp
		else result[k] = desired;
	}

	// 'font', 'textAlign', 'textBaseline'
	if (ent.type === 'Phrase') {

		for (i = 0, iz = textKeys.length; i < iz; i++) {

			k = textKeys[i];
			desired = getItem(this, k);
			current = getItem(engineState, k);

			if (current !== desired) result[k] = desired
		}
	}
	return result;
};

Sp.setStateFromEngine = function (engine) {

	let keys = this.allKeys,
		key;

	for (let i = 0, iz = keys.length; i < iz; i++) {

		key = keys[i];
		this[key] = engine[key];
	}

	this.lineDash = (xt(engine.lineDash)) ? engine.lineDash : [];
	this.lineDashOffset = xtGet(engine.lineDashOffset, 0);

	return this;
};

/*
## Exported factory function
*/
const makeState = function (items) {

	return new State(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.State = State;

export {
	makeState,
};
